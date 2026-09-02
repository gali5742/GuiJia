import './verify-liuyao-semantic-embedding-execution-contract-v01.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const readJson = (relative) => JSON.parse(read(relative));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256Text = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const sha256File = (relative) => sha256Text(read(relative));
const assertReplace = (source, before, after, label) => {
  if (!source.includes(before)) throw new Error(`corrected Routeability patch anchor missing: ${label}`);
  return source.replace(before, after);
};

const executionContractPath = 'data/liuyao-semantic-embedding-execution-contract-v0.1.json';
const legacyV02GeneratorPath = 'scripts/generate-liuyao-semantic-routeability-v02-model.mjs';
const legacyV03CalibratorPath = 'scripts/calibrate-liuyao-semantic-routeability-v03.mjs';
const correctedV02Path = 'data/liuyao-semantic-routeability-v0.2-execution-v0.1.json';
const correctedV02LockPath = 'data/liuyao-semantic-routeability-v0.2-execution-v0.1.lock.json';
const correctedV03Path = 'data/liuyao-semantic-routeability-v0.3-execution-v0.1.json';
const correctedV03LockPath = 'data/liuyao-semantic-routeability-v0.3-execution-v0.1.lock.json';
const tmpV02 = path.join(root, 'scripts/.liuyao-semantic-routeability-v02.single-text-tmp.mjs');
const tmpV03 = path.join(root, 'scripts/.liuyao-semantic-routeability-v03.single-text-tmp.mjs');

const instrumentV02 = (source) => {
  let patched = assertReplace(
    source,
    'const embed = async (texts, chunkSize=24) => {',
    'const embed = async (texts, chunkSize=1) => {',
    'v0.2 canonical single-text embed default'
  );
  patched = assertReplace(
    patched,
    "const artifactPath = 'data/liuyao-semantic-routeability-v0.2.json';",
    `const artifactPath = '${correctedV02Path}';`,
    'v0.2 corrected artifact path'
  );
  patched = assertReplace(
    patched,
    "fs.writeFileSync(path.join(root, 'data/liuyao-semantic-routeability-v0.2.lock.json'), `${JSON.stringify(lock, null, 2)}\\n`, 'utf8');",
    `fs.writeFileSync(path.join(root, '${correctedV02LockPath}'), \`${'${JSON.stringify(lock, null, 2)}'}\\n\`, 'utf8');`,
    'v0.2 corrected lock path'
  );
  return patched;
};

const instrumentV03 = (source) => {
  let patched = assertReplace(
    source,
    "const base = readJson('data/liuyao-semantic-routeability-v0.2.json');",
    `const base = readJson('${correctedV02Path}');`,
    'v0.3 corrected base model'
  );
  patched = assertReplace(
    patched,
    'for (let start = 0; start < calibration.rows.length; start += 24) {',
    'for (let start = 0; start < calibration.rows.length; start += 1) {',
    'v0.3 canonical single-text loop'
  );
  patched = assertReplace(
    patched,
    'const chunk = calibration.rows.slice(start, start + 24).map((row) => row.text);',
    'const chunk = calibration.rows.slice(start, start + 1).map((row) => row.text);',
    'v0.3 canonical single-text slice'
  );
  patched = assertReplace(
    patched,
    "baseModel:{ version:'0.2', path:'data/liuyao-semantic-routeability-v0.2.json', sha256:sha256('data/liuyao-semantic-routeability-v0.2.json'), weightsReusedUnchanged:true },",
    `baseModel:{ version:'0.2-execution-v0.1', path:'${correctedV02Path}', sha256:sha256('${correctedV02Path}'), weightsReusedUnchanged:true },`,
    'v0.3 corrected base provenance'
  );
  patched = assertReplace(
    patched,
    "'data/liuyao-semantic-routeability-v0.2.json','data/liuyao-semantic-routeability-v0.3-calibration.json','data/liuyao-semantic-routeability-v0.3-contract.json',",
    ` '${correctedV02Path}','data/liuyao-semantic-routeability-v0.3-calibration.json','data/liuyao-semantic-routeability-v0.3-contract.json',`,
    'v0.3 corrected source list'
  );
  patched = assertReplace(
    patched,
    "const artifactPath = 'data/liuyao-semantic-routeability-v0.3.json';",
    `const artifactPath = '${correctedV03Path}';`,
    'v0.3 corrected artifact path'
  );
  patched = assertReplace(
    patched,
    "fs.writeFileSync(path.join(root, 'data/liuyao-semantic-routeability-v0.3.lock.json'), `${JSON.stringify(lock, null, 2)}\\n`, 'utf8');",
    `fs.writeFileSync(path.join(root, '${correctedV03LockPath}'), \`${'${JSON.stringify(lock, null, 2)}'}\\n\`, 'utf8');`,
    'v0.3 corrected lock path'
  );
  return patched;
};

const finalizeV02 = () => {
  const artifact = readJson(correctedV02Path);
  if (artifact.model?.weights?.length !== 512) throw new Error('corrected Routeability v0.2 model shape mismatch');
  if (artifact.training?.total !== 928 || artifact.training?.byLabel?.route_known !== 717 || artifact.training?.byLabel?.non_route !== 211) {
    throw new Error(`corrected Routeability v0.2 training boundary drift: ${JSON.stringify(artifact.training)}`);
  }
  if (artifact.calibration?.total !== 110 || artifact.calibration?.byLabel?.route_known !== 44 || artifact.calibration?.byLabel?.non_route !== 66) {
    throw new Error(`corrected Routeability v0.2 calibration boundary drift: ${JSON.stringify(artifact.calibration)}`);
  }
  artifact.version = '0.2-execution-v0.1';
  artifact.scope = 'liuyao_semantic_routeability_v02_representation_corrected';
  artifact.executionCorrection = {
    contractPath:executionContractPath,
    contractSha256:sha256File(executionContractPath),
    canonicalTextsPerEncoderCall:1,
    legacyArtifactPath:'data/liuyao-semantic-routeability-v0.2.json',
    legacyArtifactSha256:sha256File('data/liuyao-semantic-routeability-v0.2.json'),
    sameTrainingData:true,
    sameTrainingAlgorithm:true,
    sameHyperparameters:true,
    instrumentation:{
      sourceScript:legacyV02GeneratorPath,
      sourceScriptSha256:sha256File(legacyV02GeneratorPath),
      permittedChanges:['embedding_batch_size_24_to_1','output_paths_only']
    },
    freshGeneralizationEvidence:false
  };
  writeJson(correctedV02Path, artifact);
  writeJson(correctedV02LockPath, {
    version:'0.2-execution-v0.1-lock',
    status:'locked',
    artifact:correctedV02Path,
    artifactSha256:sha256File(correctedV02Path),
    executionContractSha256:sha256File(executionContractPath),
    canonicalTextsPerEncoderCall:1,
    encoderRevision:artifact.encoder.revision,
    threshold:artifact.calibration.threshold,
    maxFalseActivation:artifact.calibration.maxFalseActivation
  });
};

const finalizeV03 = () => {
  const artifact = readJson(correctedV03Path);
  if (artifact.baseModel?.path !== correctedV02Path || artifact.baseModel?.weightsReusedUnchanged !== true) throw new Error('corrected Routeability v0.3 base provenance mismatch');
  if (artifact.calibration?.total !== 223) throw new Error(`corrected Routeability v0.3 calibration count ${artifact.calibration?.total} != 223`);
  artifact.version = '0.3-execution-v0.1';
  artifact.scope = 'liuyao_semantic_routeability_v03_representation_corrected';
  artifact.executionCorrection = {
    contractPath:executionContractPath,
    contractSha256:sha256File(executionContractPath),
    canonicalTextsPerEncoderCall:1,
    correctedBaseModelPath:correctedV02Path,
    correctedBaseModelSha256:sha256File(correctedV02Path),
    legacyArtifactPath:'data/liuyao-semantic-routeability-v0.3.json',
    legacyArtifactSha256:sha256File('data/liuyao-semantic-routeability-v0.3.json'),
    sameCalibrationData:true,
    sameCalibrationPolicy:true,
    sameSafetyCaps:true,
    instrumentation:{
      sourceScript:legacyV03CalibratorPath,
      sourceScriptSha256:sha256File(legacyV03CalibratorPath),
      permittedChanges:['base_model_path_to_corrected_v02','embedding_batch_size_24_to_1','output_paths_only']
    },
    freshGeneralizationEvidence:false
  };
  writeJson(correctedV03Path, artifact);
  writeJson(correctedV03LockPath, {
    version:'0.3-execution-v0.1-lock',
    status:'locked',
    artifact:correctedV03Path,
    artifactSha256:sha256File(correctedV03Path),
    baseModelSha256:sha256File(correctedV02Path),
    calibrationDataSha256:sha256File('data/liuyao-semantic-routeability-v0.3-calibration.json'),
    executionContractSha256:sha256File(executionContractPath),
    canonicalTextsPerEncoderCall:1,
    threshold:artifact.calibration.threshold
  });
};

try {
  fs.writeFileSync(tmpV02, instrumentV02(read(legacyV02GeneratorPath)), 'utf8');
  console.log('Rebuilding Routeability v0.2 with canonical single-text encoder execution...');
  await import(`${pathToFileURL(tmpV02).href}?corrected=${Date.now()}`);
  finalizeV02();

  fs.writeFileSync(tmpV03, instrumentV03(read(legacyV03CalibratorPath)), 'utf8');
  console.log('Recalibrating Routeability v0.3 from corrected v0.2 weights with canonical single-text execution...');
  await import(`${pathToFileURL(tmpV03).href}?corrected=${Date.now()}`);
  finalizeV03();

  const v02 = readJson(correctedV02Path);
  const v03 = readJson(correctedV03Path);
  console.log(`Corrected Routeability v0.2 threshold=${v02.calibration.threshold}`);
  console.log(`Corrected Routeability v0.3 threshold=${v03.calibration.threshold}`);
  console.log(`Corrected Routeability v0.3 false activation=${v03.calibration.falseActivation}; max subtype=${v03.calibration.maxSubtypeFalseActivation}`);
} finally {
  for (const file of [tmpV02, tmpV03]) {
    try { fs.unlinkSync(file); } catch {}
  }
}
