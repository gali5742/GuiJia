import './verify-liuyao-semantic-fallback-identity-v01-execution-v01-preflight.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readText = (relative) => read(relative).toString('utf8');
const readJson = (relative) => JSON.parse(readText(relative));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256File = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = read(relative);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
};

const correctionPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-correction-contract.json';
const correction = readJson(correctionPath);
const runtime = readJson(correction.calibrationRuntimeLock.path);
const baseTrainerPath = correction.baseTrainer.path;
const temporaryTrainer = 'scripts/.train-and-calibrate-liuyao-semantic-fallback-identity-v01.execution-v01.tmp.mjs';
const output = correction.outputs;

const countOccurrences = (source, needle) => source.split(needle).length - 1;
const replaceCount = (source, before, after, expectedCount, label) => {
  const count = countOccurrences(source, before);
  if (count !== expectedCount) throw new Error(`${label} patch anchor count ${count} != ${expectedCount}`);
  return source.split(before).join(after);
};

const patchHistoricalTrainer = (source) => {
  let patched = source;
  patched = replaceCount(
    patched,
    "import './verify-liuyao-semantic-fallback-identity-v01-training-contract.mjs';\nimport './verify-liuyao-semantic-fallback-identity-v01-calibration-runtime-lock.mjs';",
    "import './verify-liuyao-semantic-fallback-identity-v01-execution-v01-preflight.mjs';",
    1,
    'corrected preflight import'
  );
  patched = replaceCount(
    patched,
    "data/liuyao-semantic-frozen-dependencies-v0.1.json",
    "data/liuyao-semantic-frozen-dependencies-v0.2.json",
    1,
    'corrected frozen dependency artifact'
  );
  patched = replaceCount(
    patched,
    "data/liuyao-semantic-frozen-dependencies-v0.1.lock.json",
    "data/liuyao-semantic-frozen-dependencies-v0.2.lock.json",
    1,
    'corrected frozen dependency lock'
  );
  patched = replaceCount(
    patched,
    "data/liuyao-semantic-routeability-v0.2.json",
    "data/liuyao-semantic-routeability-v0.2-execution-v0.1.json",
    2,
    'corrected Routeability base model'
  );
  patched = replaceCount(
    patched,
    String(runtime.temporaryInstrumentation.routeabilityRuntimeThresholdLiteral.from),
    String(runtime.temporaryInstrumentation.routeabilityRuntimeThresholdLiteral.to),
    1,
    'corrected Routeability trainer assertion'
  );
  patched = replaceCount(
    patched,
    'const embed = async (texts, chunkSize=24) => {',
    'const embed = async (texts, chunkSize=1) => {',
    1,
    'canonical single-text embedding'
  );
  const vmBefore = "  vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });";
  const vmAfter = `  let moduleSource = fs.readFileSync(path.join(root, relative), 'utf8');\n  if (relative === '${runtime.temporaryInstrumentation.routeabilityRuntimeThresholdLiteral.module}') {\n    const legacyThreshold = '${runtime.temporaryInstrumentation.routeabilityRuntimeThresholdLiteral.from}';\n    const correctedThreshold = '${runtime.temporaryInstrumentation.routeabilityRuntimeThresholdLiteral.to}';\n    const replacementCount = moduleSource.split(legacyThreshold).length - 1;\n    if (replacementCount !== ${runtime.temporaryInstrumentation.routeabilityRuntimeThresholdLiteral.requiredExactReplacementCount}) throw new Error(\`Routeability runtime threshold anchor count \${replacementCount} != ${runtime.temporaryInstrumentation.routeabilityRuntimeThresholdLiteral.requiredExactReplacementCount}\`);\n    moduleSource = moduleSource.split(legacyThreshold).join(correctedThreshold);\n  }\n  vm.runInContext(moduleSource, context, { filename:relative });`;
  patched = replaceCount(patched, vmBefore, vmAfter, 1, 'temporary Routeability runtime threshold instrumentation');
  patched = replaceCount(patched, 'data/liuyao-semantic-fallback-identity-v0.1-calibration-report.json', output.calibrationReport, 1, 'corrected calibration report output');
  patched = replaceCount(patched, 'data/liuyao-semantic-fallback-identity-v0.1-model.json', output.model, 1, 'corrected model output');
  patched = replaceCount(patched, 'data/liuyao-semantic-fallback-identity-v0.1-model.lock.json', output.modelLock, 1, 'corrected model lock output');
  return patched;
};

const addSource = (sources, relative) => {
  const next = sources.filter((item) => item.path !== relative);
  next.push({ path:relative, sha256:sha256File(relative) });
  return next;
};

const postprocess = () => {
  if (!fs.existsSync(path.join(root, output.model)) || !fs.existsSync(path.join(root, output.calibrationReport))) return;
  const correctionBlob = gitBlobSha(correctionPath);
  const runtimeBlob = gitBlobSha(correction.calibrationRuntimeLock.path);
  const report = readJson(output.calibrationReport);
  report.version = '0.13-fallback-identity-v0.1-execution-v0.1-calibration-report-v0.1';
  report.scope = correction.scope;
  report.executionCorrection = {
    contract:{ path:correctionPath, gitBlobSha:correctionBlob },
    calibrationRuntimeLock:{ path:correction.calibrationRuntimeLock.path, gitBlobSha:runtimeBlob },
    executionContract:{ path:runtime.execution.contractPath, sha256:runtime.execution.contractSha256 },
    canonicalTextsPerEncoderCall:1,
    correctedFrozenDependenciesSha256:runtime.artifacts.correctedFrozenDependencies.sha256,
    correctedRouteabilityThreshold:runtime.invariants.routeabilityThreshold,
    correctedScopeHardVetoCutoff:runtime.invariants.scopeHardVetoCutoff,
    legacyBatchSpaceEvidenceReusedAsPromotionEvidence:false
  };
  report.policy = {
    ...report.policy,
    oneGlobalThresholdOnly:true,
    routeSpecificThresholds:false,
    routeabilityThresholdRetuned:false,
    scopeCutoffRetuned:false,
    routerMarginTuned:false,
    canonicalTextsPerEncoderCall:1
  };
  writeJson(output.calibrationReport, report);

  const artifact = readJson(output.model);
  artifact.version = '0.13-fallback-identity-v0.1-execution-v0.1-model-v0.1';
  artifact.scope = correction.scope;
  artifact.executionCorrectionContract = { path:correctionPath, gitBlobSha:correctionBlob };
  artifact.calibrationRuntimeLock = { path:correction.calibrationRuntimeLock.path, gitBlobSha:runtimeBlob };
  artifact.execution = {
    contractPath:runtime.execution.contractPath,
    contractSha256:runtime.execution.contractSha256,
    canonicalTextsPerEncoderCall:1,
    representation:'production_equivalent_single_text'
  };
  artifact.correctedDependencies = {
    frozenDependenciesSha256:runtime.artifacts.correctedFrozenDependencies.sha256,
    routeabilityBaseModelSha256:runtime.artifacts.routeabilityBaseModel.sha256,
    routeabilityThresholdArtifactSha256:runtime.artifacts.routeabilityThresholdSource.sha256,
    routeabilityThreshold:runtime.invariants.routeabilityThreshold,
    scopeHardVetoCutoff:runtime.invariants.scopeHardVetoCutoff
  };
  artifact.sources = (artifact.sources || []).filter((item) => item.path !== 'data/liuyao-semantic-fallback-identity-v0.1-calibration-runtime.lock.json');
  for (const relative of [correctionPath, correction.calibrationRuntimeLock.path, runtime.artifacts.routeabilityThresholdSource.path]) {
    artifact.sources = addSource(artifact.sources, relative);
  }
  writeJson(output.model, artifact);

  if (fs.existsSync(path.join(root, output.modelLock))) {
    const selected = report.selected;
    if (!selected) throw new Error('Trainer returned success but no selected calibration threshold exists');
    const lock = {
      version:'0.13-fallback-identity-v0.1-execution-v0.1-model-lock-v0.1',
      status:'locked',
      artifact:output.model,
      artifactSha256:sha256File(output.model),
      baseTrainingContract:{ path:correction.baseTrainingContract.path, gitBlobSha:correction.baseTrainingContract.gitBlobSha },
      executionCorrectionContract:{ path:correctionPath, gitBlobSha:correctionBlob },
      calibrationRuntimeLock:{ path:correction.calibrationRuntimeLock.path, gitBlobSha:runtimeBlob },
      calibrationReport:output.calibrationReport,
      calibrationReportSha256:sha256File(output.calibrationReport),
      routeCount:22,
      vectorSize:512,
      canonicalTextsPerEncoderCall:1,
      globalThreshold:selected.threshold,
      routeSpecificThresholds:false,
      routeabilityThreshold:runtime.invariants.routeabilityThreshold,
      scopeHardVetoCutoff:runtime.invariants.scopeHardVetoCutoff,
      hardGates:{
        acceptedRouteAccuracyMin:correction.calibrationHardGates.acceptedRouteAccuracyMin,
        overallNonrouteFalseActivationMax:correction.calibrationHardGates.overallNonrouteFalseActivationMax,
        eachNonrouteSubtypeFalseActivationMax:correction.calibrationHardGates.eachNonrouteSubtypeFalseActivationMax
      }
    };
    writeJson(output.modelLock, lock);
  }
};

if (gitBlobSha(baseTrainerPath) !== correction.baseTrainer.gitBlobSha) throw new Error('Historical Fallback trainer drift before instrumentation');
const patched = patchHistoricalTrainer(readText(baseTrainerPath));
fs.writeFileSync(path.join(root, temporaryTrainer), patched, 'utf8');
let result;
try {
  result = spawnSync(process.execPath, [path.join(root, temporaryTrainer)], { cwd:root, stdio:'inherit' });
  if (result.error) throw result.error;
  postprocess();
} finally {
  if (fs.existsSync(path.join(root, temporaryTrainer))) fs.unlinkSync(path.join(root, temporaryTrainer));
}

if ((result?.status ?? 1) !== 0) process.exit(result?.status ?? 1);
console.log('Fallback Identity execution-v0.1 corrected training/calibration completed.');
