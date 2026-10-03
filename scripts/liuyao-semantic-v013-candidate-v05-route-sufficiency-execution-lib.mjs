import path from 'node:path';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { root, read, json, binding, hashBytes, equal, assert, exists, verify } from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';

export const executionPath = 'data/liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-contract-v0.1.json';
const git = args => execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
export function committed(p) {
  assert(git(['rev-parse',`HEAD:${p}`]) === binding(p).gitBlobSha, `Uncommitted scoring input: ${p}`);
}
export function preflight({checkCI = true, requireCommitted = true} = {}) {
  const data = verify({requireSeal:true});
  const execution = json(executionPath);
  assert(execution.status === 'frozen_after_data_ci_pass_before_first_encoder_scoring', 'Execution freeze missing');
  for (const expected of execution.bindings) {
    assert(equal(binding(expected.path),expected), `Execution input drift: ${expected.path}`);
    if (requireCommitted) committed(expected.path);
  }
  if (requireCommitted) committed(executionPath);
  assert(execution.dataSeal.commit === '45f8d1492c660f73026d32aecb8b9738ebd4bed8', 'Seal commit drift');
  git(['merge-base','--is-ancestor',execution.dataSeal.commit,'HEAD']);
  git(['merge-base','--is-ancestor',execution.dataCI.headSha,execution.dataSeal.commit]);
  const sealedBlob = git(['rev-parse',`${execution.dataSeal.commit}:${data.c.outputPolicy.dataLockPath}`]);
  assert(sealedBlob === binding(data.c.outputPolicy.dataLockPath).gitBlobSha, 'Original seal membership changed');
  if (checkCI) {
    const run = JSON.parse(execFileSync('gh',['api',`repos/gali5742/GuiJia/actions/runs/${execution.dataCI.runId}`],{cwd:root,encoding:'utf8'}));
    assert(run.status === 'completed' && run.conclusion === 'success' && run.head_sha === execution.dataCI.headSha && run.path === execution.dataCI.workflowPath, 'Data Seal CI not confirmed successful');
  }
  return {...data,execution};
}
export function modelApi(c) {
  const context = {console,Math,JSON,Set,Map,Array,Object,Number,Float32Array,Float64Array};
  context.window = context; context.globalThis = context; vm.createContext(context);
  vm.runInContext(read(c.algorithm.path).toString('utf8'),context,{filename:c.algorithm.path});
  const api = context.GuiJia.liuyaoSemanticRouteSufficiencyModelV01;
  assert(api.vectorSize === 512 && equal(api.hyperparameters,c.algorithm.hyperparameters), 'Binary training algorithm drift');
  return api;
}
export async function embedder(c) {
  const directory = process.env.GUIJIA_TRANSFORMERS_PACKAGE_DIR;
  assert(directory && path.isAbsolute(directory), 'Set GUIJIA_TRANSFORMERS_PACKAGE_DIR to the external pinned installation');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory,'package.json'),'utf8'));
  assert(manifest.version === c.encoderExecution.transformersJsVersion, 'Transformers.js version drift');
  const {pipeline,env} = await import(pathToFileURL(path.join(directory,'dist/transformers.node.mjs')).href);
  env.allowLocalModels = false; env.useBrowserCache = false;
  if (process.env.GUIJIA_ENCODER_CACHE_DIR) env.cacheDir = process.env.GUIJIA_ENCODER_CACHE_DIR;
  const e = c.encoderExecution;
  const extractor = await pipeline('feature-extraction',e.modelId,{dtype:e.dtype,revision:e.revision,device:'cpu'});
  return async text => {
    const normalized = String(text).trim();
    assert(normalized.length > 0, 'Empty encoder input');
    const tensor = await extractor([normalized],{pooling:e.pooling,normalize:e.normalize});
    assert(tensor.dims.length === 2 && tensor.dims[0] === 1 && tensor.dims[1] === 512 && tensor.data.length === 512, 'Single-text 512-d output contract drift');
    const vector = Float32Array.from(tensor.data,Number);
    assert(vector.every(Number.isFinite), 'Non-finite encoder vector');
    return vector;
  };
}
export function weightsLock(c,model) {
  return {
    version:'0.13-candidate-v0.5-route-sufficiency-v0.1-weights-lock-v0.1',status:'weights_locked_before_threshold_calibration',
    modelBinding:binding(c.outputPolicy.modelPath),
    executionContractBinding:binding(executionPath),
    dataLockBinding:binding(c.outputPolicy.dataLockPath),
    parametersSha256:hashBytes(JSON.stringify(model.model)),
    trainingRows:132,calibrationEncoderInvocationsBeforeWeightsLock:0,
    independentEvaluationRead:false,sealedBlindEvaluationRead:false,
    nextAction:'commit_weights_then_calibrate_one_global_threshold_on_sealed_calibration'
  };
}
export function verifyWeights({requireCommitted = false} = {}) {
  const {c} = preflight({checkCI:false,requireCommitted});
  const model = json(c.outputPolicy.modelPath);
  assert(model.status === 'weights_locked_before_threshold_calibration' && model.vectorSize === 512, 'Weights not locked');
  assert(model.positiveLabel === c.labels[0] && model.negativeLabel === c.labels[1], 'Model label drift');
  assert(Array.isArray(model.model.weights) && model.model.weights.length === 512 && model.model.weights.every(Number.isFinite) && Number.isFinite(model.model.bias), 'Invalid weights');
  assert(!Object.hasOwn(model,'threshold'), 'Weights artifact may not include a calibration threshold');
  assert(equal(model.executionContractBinding,binding(executionPath)) && equal(model.dataLockBinding,binding(c.outputPolicy.dataLockPath)), 'Weights input binding drift');
  assert(model.execution.trainingEncoderInvocations === 132 && model.execution.calibrationEncoderInvocations === 0 && model.execution.canonicalTextsPerEncoderCall === 1, 'Weight training boundary drift');
  assert(equal(json(c.outputPolicy.weightsLockPath),weightsLock(c,model)), 'Weights lock integrity drift');
  if (requireCommitted) { committed(c.outputPolicy.modelPath); committed(c.outputPolicy.weightsLockPath); }
  return {c,model};
}
export function calibrate(rows, boundary, labels) {
  assert(rows.length > 0 && rows.every(row => labels.includes(row.label) && Number.isFinite(row.probability) && row.probability >= 0 && row.probability <= 1), 'Invalid calibration rows');
  const totals = labels.map(label => rows.filter(row => row.label === label).length);
  assert(totals.every(n => n > 0), 'Both calibration labels required');
  const evaluate = threshold => {
    const flags = rows.map(row => row.probability >= threshold);
    const passed = labels.map(label => rows.filter((row,i) => row.label === label && flags[i]).length);
    return {threshold,signature:flags.map(flag => flag ? '1' : '0').join(''),sufficientPassed:passed[0],sufficientRetention:passed[0]/totals[0],insufficientPassed:passed[1],insufficientFalsePass:passed[1]/totals[1]};
  };
  const regimes = new Map();
  for (const threshold of [...new Set([0,...rows.map(row => row.probability),1])].sort((a,b) => a-b)) {
    const regime = evaluate(threshold);
    // Ascending iteration retains the highest representative for tied signatures.
    regimes.set(regime.signature,regime);
  }
  const feasible = [...regimes.values()].filter(x => x.insufficientFalsePass <= boundary.maximumInsufficientFalsePass && x.sufficientRetention >= boundary.minimumSufficientRetention)
    .sort((a,b) => b.sufficientRetention-a.sufficientRetention || a.insufficientFalsePass-b.insufficientFalsePass || b.threshold-a.threshold);
  const best = feasible[0];
  if (!best) return {status:'calibration_failed_no_feasible_global_threshold',regimesEvaluated:regimes.size,feasibleRegimes:0,selectedThreshold:null,selectedMetrics:null,stableInterval:null,regimes:[...regimes.values()]};
  const admitted = rows.filter(row => row.probability >= best.threshold), rejected = rows.filter(row => row.probability < best.threshold);
  const highestRejected = rejected.length ? Math.max(...rejected.map(row => row.probability)) : 0;
  const lowestAdmitted = admitted.length ? Math.min(...admitted.map(row => row.probability)) : 1;
  const threshold = (highestRejected+lowestAdmitted)/2;
  const metrics = evaluate(threshold);
  assert(metrics.signature === best.signature, 'Midpoint changed selected regime');
  return {status:'calibration_passed',regimesEvaluated:regimes.size,feasibleRegimes:feasible.length,selectedThreshold:threshold,selectedMetrics:metrics,stableInterval:{highestRejected,lowestAdmitted,midpoint:threshold},regimes:[...regimes.values()]};
}
export function thresholdLock(c,report) {
  return {
    version:'0.13-candidate-v0.5-route-sufficiency-v0.1-threshold-lock-v0.1',status:'component_locked_after_frozen_calibration',
    modelBinding:binding(c.outputPolicy.modelPath),weightsLockBinding:binding(c.outputPolicy.weightsLockPath),
    reportBinding:binding(c.outputPolicy.calibrationReportPath),executionContractBinding:binding(executionPath),dataLockBinding:binding(c.outputPolicy.dataLockPath),
    threshold:report.result.selectedThreshold,oneGlobalThresholdOnly:true,
    independentEvaluationRead:false,sealedBlindEvaluationRead:false,
    integratedCandidateV05RuntimeBuilt:false,
    nextAction:'freeze_fallback_identity_v03_fresh_data_contract_only_after_owner_stage_report'
  };
}
export function verifyCalibration() {
  const {c,model} = verifyWeights();
  const report = json(c.outputPolicy.calibrationReportPath);
  assert(equal(report.modelBinding,binding(c.outputPolicy.modelPath)) && equal(report.weightsLockBinding,binding(c.outputPolicy.weightsLockPath)), 'Calibration weights binding drift');
  assert(equal(report.calibrationBinding,binding(c.outputPolicy.calibrationPath)) && equal(report.executionContractBinding,binding(executionPath)), 'Calibration input binding drift');
  const original = json(c.outputPolicy.calibrationPath).rows;
  assert(report.rows.length === 88 && report.execution.calibrationEncoderInvocations === 88 && report.execution.weightsFrozenBeforeCalibrationScoring, 'Calibration execution drift');
  const api = modelApi(c);
  assert(report.rows.every((row,i) => row.id === original[i].id && row.label === original[i].label && row.domainFamily === original[i].domainFamily && row.vector.length === 512 && row.vector.every(Number.isFinite)), 'Calibration membership/vector drift');
  for (const row of report.rows) assert(api.probability(model.model,row.vector) === row.probability, `Calibration head replay drift: ${row.id}`);
  assert(equal(report.result,calibrate(report.rows,c.calibrationBoundary,c.labels)), 'Calibration policy/threshold replay drift');
  assert(report.status === report.result.status && report.governance.independentEvaluationRead === false && report.governance.sealedBlindEvaluationRead === false && report.governance.postHocRepair === false, 'Calibration governance drift');
  if (report.status === 'calibration_passed') assert(equal(json(c.outputPolicy.thresholdLockPath),thresholdLock(c,report)), 'Component lock drift');
  else assert(!exists(c.outputPolicy.thresholdLockPath), 'Failed attempt must not create threshold lock');
  return report;
}
