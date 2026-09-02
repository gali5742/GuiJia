import './verify-liuyao-semantic-v013-candidate-v04-semantic-act-v01-training-contract.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const ratio = (n, d) => d ? n / d : 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contractPath = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-training-contract.json';
const contract = readJson(contractPath);
const training = readJson(contract.sealedData.trainingPath);
const calibration = readJson(contract.sealedData.calibrationPath);
const modelPath = contract.outputPolicy.modelPath;
const modelLockPath = contract.outputPolicy.modelLockPath;
const reportPath = contract.outputPolicy.calibrationReportPath;
const positiveLabel = contract.algorithm.positiveLabel;
const negativeLabel = contract.algorithm.negativeLabel;
assert(training.sealed === true && calibration.sealed === true, 'Semantic Act data must be sealed before training');
assert(training.rows.length === 132 && calibration.rows.length === 66, 'Semantic Act row count drift');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number, Float32Array, Float64Array };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(read(contract.algorithm.modulePath).toString('utf8'), context, { filename:contract.algorithm.modulePath });
const modelApi = context.GuiJia?.liuyaoSemanticActEligibilityModelV01;
assert(modelApi?.train && modelApi?.probability, 'Semantic Act model module failed to load');
assert(modelApi.hyperparameters.epochs === 360 && modelApi.hyperparameters.learningRate === 0.42 && modelApi.hyperparameters.l2 === 0.0015, 'Semantic Act model hyperparameter drift');

const trainingRows = [...modelApi.deduplicateRows(training.rows)];
const calibrationRows = calibration.rows.map((row) => ({ ...row, text:String(row.text || '').trim() }));
assert(trainingRows.length === training.rows.length, 'Semantic Act training dedup changed row count');
const trainingTextSet = new Set(trainingRows.map((row) => modelApi.normalizeText(row.text)));
const calibrationTextSet = new Set();
for (const row of calibrationRows) {
  const normalized = modelApi.normalizeText(row.text);
  assert(normalized, `empty calibration text ${row.id}`);
  assert(!trainingTextSet.has(normalized), `calibration overlaps training ${row.id}`);
  assert(!calibrationTextSet.has(normalized), `duplicate calibration text ${row.id}`);
  calibrationTextSet.add(normalized);
}

console.log('Semantic Act v0.1 scoring begins only after frozen training contract verification.');
console.log(`- training: ${trainingRows.length}; calibration: ${calibrationRows.length}`);
console.log('- encoder call shape: exactly one normalized question per invocation');

env.allowLocalModels = false;
env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', contract.encoderExecution.modelId, {
  dtype:contract.encoderExecution.dtype,
  revision:contract.encoderExecution.revision
});

const tensorToVector = (tensor) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1];
  assert(hidden === contract.encoderExecution.vectorSize, `embedding size ${hidden} != ${contract.encoderExecution.vectorSize}`);
  const vector = new Float32Array(hidden);
  for (let index = 0; index < hidden; index += 1) vector[index] = Number(tensor.data[index]);
  return vector;
};
const embedOne = async (text, index, total, phase) => {
  const normalized = String(text || '').trim();
  assert(normalized, `empty ${phase} text`);
  const output = await extractor([normalized], {
    pooling:contract.encoderExecution.pooling,
    normalize:contract.encoderExecution.normalize
  });
  if ((index + 1) % 10 === 0 || index === total - 1) console.log(`${phase} single-text embedded ${index + 1}/${total}`);
  return tensorToVector(output);
};
const embedRows = async (rows, phase) => {
  const vectors = [];
  for (let index = 0; index < rows.length; index += 1) vectors.push(await embedOne(rows[index].text, index, rows.length, phase));
  return vectors;
};

const trainingVectors = await embedRows(trainingRows, 'training');
const trained = modelApi.train(trainingRows, trainingVectors, contract.algorithm.hyperparameters);
const frozenWeights = Array.from(trained.weights, Number);
const frozenBias = Number(trained.bias);
console.log(`Semantic Act weights frozen before calibration scoring: ${frozenWeights.length} dimensions.`);
const calibrationVectors = await embedRows(calibrationRows, 'calibration');

const scoredRows = calibrationRows.map((row, index) => {
  const probability = modelApi.probability(trained, calibrationVectors[index]);
  return { ...row, probability };
});
const eligibleRows = scoredRows.filter((row) => row.label === positiveLabel);
const ineligibleRows = scoredRows.filter((row) => row.label === negativeLabel);
assert(eligibleRows.length === 33 && ineligibleRows.length === 33, 'Semantic Act calibration label count drift');

const evaluateThreshold = (threshold) => {
  const decisions = scoredRows.map((row) => row.probability >= threshold);
  const eligiblePassed = scoredRows.filter((row, index) => row.label === positiveLabel && decisions[index]).length;
  const ineligiblePassed = scoredRows.filter((row, index) => row.label === negativeLabel && decisions[index]).length;
  return {
    threshold,
    signature:decisions.map((value) => value ? '1' : '0').join(''),
    eligibleRetention:ratio(eligiblePassed, eligibleRows.length),
    eligiblePassed,
    ineligibleFalsePass:ratio(ineligiblePassed, ineligibleRows.length),
    ineligiblePassed
  };
};

const candidateThresholds = [...new Set([0, ...scoredRows.map((row) => row.probability), 1])].sort((a,b) => a-b);
const bySignature = new Map();
for (const threshold of candidateThresholds) {
  const regime = evaluateThreshold(threshold);
  const existing = bySignature.get(regime.signature);
  if (!existing || threshold > existing.representativeThreshold) bySignature.set(regime.signature, { ...regime, representativeThreshold:threshold });
}
const regimes = [...bySignature.values()];
const minEligible = contract.calibrationBoundary.minimumEligibleRetention;
const maxFalsePass = contract.calibrationBoundary.maximumIneligibleFalsePass;
const feasible = regimes
  .filter((row) => row.eligibleRetention >= minEligible && row.ineligibleFalsePass <= maxFalsePass)
  .sort((a,b) => (
    a.ineligibleFalsePass - b.ineligibleFalsePass
    || b.eligibleRetention - a.eligibleRetention
    || b.representativeThreshold - a.representativeThreshold
  ));
const best = feasible[0] || null;

let selectedThreshold = null;
let selectedMetrics = null;
let interval = null;
if (best) {
  const passed = scoredRows.filter((row) => row.probability >= best.representativeThreshold);
  const rejected = scoredRows.filter((row) => row.probability < best.representativeThreshold);
  const highestRejected = rejected.length ? Math.max(...rejected.map((row) => row.probability)) : 0;
  const lowestAdmitted = passed.length ? Math.min(...passed.map((row) => row.probability)) : 1;
  selectedThreshold = (highestRejected + lowestAdmitted) / 2;
  interval = { highestRejected, lowestAdmitted, midpoint:selectedThreshold };
  selectedMetrics = evaluateThreshold(selectedThreshold);
  assert(selectedMetrics.signature === best.signature, 'Semantic Act midpoint threshold changed selected prediction regime');
  assert(selectedMetrics.eligibleRetention >= minEligible, 'Semantic Act selected threshold eligible retention gate failure');
  assert(selectedMetrics.ineligibleFalsePass <= maxFalsePass, 'Semantic Act selected threshold false-pass gate failure');
}

const byDomain = {};
for (const domainFamily of [...new Set(scoredRows.map((row) => row.domainFamily))].sort()) {
  const subset = scoredRows.filter((row) => row.domainFamily === domainFamily);
  const eligibleSubset = subset.filter((row) => row.label === positiveLabel);
  const ineligibleSubset = subset.filter((row) => row.label === negativeLabel);
  byDomain[domainFamily] = best ? {
    n:subset.length,
    eligibleRetention:ratio(eligibleSubset.filter((row) => row.probability >= selectedThreshold).length, eligibleSubset.length),
    ineligibleFalsePass:ratio(ineligibleSubset.filter((row) => row.probability >= selectedThreshold).length, ineligibleSubset.length)
  } : { n:subset.length, eligibleRetention:null, ineligibleFalsePass:null };
}

const report = {
  version:'0.13-candidate-v0.4-semantic-act-v0.1-calibration-report-v0.1',
  status:best ? 'calibration_passed' : 'calibration_failed_no_feasible_global_threshold',
  scope:'liuyao_semantic_act_eligibility_v0.1',
  immutableInputs:{
    trainingSha256:contract.sealedData.trainingSha256,
    calibrationSha256:contract.sealedData.calibrationSha256,
    trainingContractSha256:sha256(contractPath),
    algorithmModuleGitBlobSha:contract.algorithm.moduleGitBlobSha,
    embeddingExecutionContractGitBlobSha:contract.encoderExecution.contractGitBlobSha
  },
  execution:{
    canonicalTextsPerEncoderCall:1,
    trainingEncoderInvocations:trainingRows.length,
    calibrationEncoderInvocations:calibrationRows.length,
    hyperparameters:contract.algorithm.hyperparameters,
    weightsFrozenBeforeCalibrationScoring:true,
    independentEvaluationRead:false,
    sealedBlindEvaluationRead:false,
    developmentRead:false,
    CandidateV03FailureRowsRead:false
  },
  gates:{ minimumEligibleRetention:minEligible, maximumIneligibleFalsePass:maxFalsePass },
  thresholdSelection:{
    regimesEvaluated:regimes.length,
    feasibleRegimes:feasible.length,
    selectedRepresentativeThreshold:best?.representativeThreshold ?? null,
    stableInterval:interval,
    selectedThreshold,
    selectionOrder:contract.calibrationBoundary.selectionOrder
  },
  summary:selectedMetrics ? {
    eligibleTotal:eligibleRows.length,
    eligiblePassed:selectedMetrics.eligiblePassed,
    eligibleRetention:selectedMetrics.eligibleRetention,
    ineligibleTotal:ineligibleRows.length,
    ineligiblePassed:selectedMetrics.ineligiblePassed,
    ineligibleFalsePass:selectedMetrics.ineligibleFalsePass
  } : {
    eligibleTotal:eligibleRows.length,
    eligiblePassed:null,
    eligibleRetention:null,
    ineligibleTotal:ineligibleRows.length,
    ineligiblePassed:null,
    ineligibleFalsePass:null
  },
  byDomain,
  rows:scoredRows.map((row) => ({
    id:row.id,
    label:row.label,
    actFamily:row.actFamily,
    domainFamily:row.domainFamily,
    probability:row.probability,
    passesSelectedThreshold:best ? row.probability >= selectedThreshold : null
  }))
};
writeJson(reportPath, report);

const modelArtifact = {
  version:'0.13-candidate-v0.4-semantic-act-eligibility-v0.1-model-v0.1',
  status:best ? 'locked_after_fresh_calibration' : 'training_complete_calibration_failed',
  scope:'liuyao_semantic_act_eligibility_v0.1',
  positiveLabel,
  negativeLabel,
  vectorSize:512,
  model:{ weights:frozenWeights, bias:frozenBias },
  threshold:selectedThreshold,
  hyperparameters:contract.algorithm.hyperparameters,
  execution:{
    canonicalTextsPerEncoderCall:1,
    encoderModelId:contract.encoderExecution.modelId,
    encoderRevision:contract.encoderExecution.revision,
    transformersJsVersion:contract.encoderExecution.transformersJsVersion,
    dtype:contract.encoderExecution.dtype,
    pooling:contract.encoderExecution.pooling,
    normalize:contract.encoderExecution.normalize
  },
  bindings:{
    trainingSha256:contract.sealedData.trainingSha256,
    calibrationSha256:contract.sealedData.calibrationSha256,
    trainingContractSha256:sha256(contractPath),
    calibrationReportPath:reportPath
  },
  calibrationPassed:Boolean(best),
  calibrationSummary:report.summary,
  protectedEvaluationBoundary:{
    independentEvaluationRead:false,
    sealedBlindEvaluationRead:false,
    developmentRead:false,
    CandidateV03FailureRowsRead:false
  }
};
writeJson(modelPath, modelArtifact);

if (fs.existsSync(path.join(root, modelLockPath))) fs.unlinkSync(path.join(root, modelLockPath));
if (best) {
  writeJson(modelLockPath, {
    version:'0.13-candidate-v0.4-semantic-act-eligibility-v0.1-model-lock-v0.1',
    status:'locked',
    scope:'liuyao_semantic_act_eligibility_v0.1',
    modelPath,
    modelSha256:sha256(modelPath),
    calibrationReportPath:reportPath,
    calibrationReportSha256:sha256(reportPath),
    trainingContractPath:contractPath,
    trainingContractSha256:sha256(contractPath),
    threshold:selectedThreshold,
    canonicalTextsPerEncoderCall:1,
    independentEvaluationRead:false,
    sealedBlindEvaluationRead:false,
    developmentRead:false
  });
  console.log('Semantic Act v0.1 calibration PASS. Model lock written.');
  console.log(JSON.stringify({ threshold:selectedThreshold, summary:report.summary, interval }, null, 2));
} else {
  console.error('Semantic Act v0.1 calibration FAIL: no feasible global threshold under frozen gates.');
  const bestSafety = [...regimes].sort((a,b) => a.ineligibleFalsePass - b.ineligibleFalsePass || b.eligibleRetention - a.eligibleRetention)[0];
  const bestRetention = [...regimes].sort((a,b) => b.eligibleRetention - a.eligibleRetention || a.ineligibleFalsePass - b.ineligibleFalsePass)[0];
  console.error(JSON.stringify({ gates:report.gates, bestSafety, bestRetention }, null, 2));
  process.exit(1);
}
