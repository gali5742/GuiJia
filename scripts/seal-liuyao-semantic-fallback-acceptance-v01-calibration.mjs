import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const calibrationFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-calibration.json';
const lockFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-calibration.lock.json';
const contractFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-contract.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const calibration = readJson(calibrationFile);
const contract = readJson(contractFile);
assert(contract.status === 'frozen_architecture_before_fresh_calibration', 'acceptance contract is not frozen');
assert(calibration.version === '0.13-fallback-acceptance-v0.1-calibration-v0.1', `unexpected calibration version ${calibration.version}`);
assert(calibration.status === 'presealed_fresh_calibration' && calibration.sealed === false, 'calibration is not in presealed state');
assert(calibration.rows?.length === 178, 'calibration row count drift');
assert(calibration.counts?.route_known === 88 && calibration.counts?.non_route === 90, 'calibration count summary drift');
assert(calibration.provenance?.contractSha256 === sha256(contractFile), 'contract SHA provenance drift before seal');

const sealed = {
  ...calibration,
  status: 'sealed_fresh_calibration',
  sealed: true,
  sealing: {
    sealedAt: new Date().toISOString(),
    immutableForV01GateCalibration: true,
    wordingMayChangeAfterSeal: false,
    rowsMayBeAddedAfterSeal: false,
    labelsMayChangeAfterSeal: false,
    mayBeReusedAsIndependentOrBlind: false
  }
};
writeJson(calibrationFile, sealed);

const lock = {
  version: '0.13-fallback-acceptance-v0.1-calibration-lock-v0.1',
  status: 'locked',
  scope: 'liuyao_semantic_pure_fallback_acceptance',
  calibrationPath: calibrationFile,
  calibrationSha256: sha256(calibrationFile),
  contractPath: contractFile,
  contractSha256: sha256(contractFile),
  contractFreezeCommit: sealed.provenance.contractFreezeCommit,
  counts: sealed.counts,
  policy: {
    useForTraining: false,
    useForThresholdCalibration: true,
    reuseAsDevelopmentEval: false,
    reuseAsIndependent: false,
    reuseAsBlind: false,
    exactlyTwoGlobalThresholds: true,
    routeSpecificThresholdsForbidden: true,
    multiTextEncoderBatchForbidden: true
  }
};
writeJson(lockFile, lock);
console.log('LiuYao Fallback Acceptance v0.1 fresh calibration sealed.');
console.log(`- calibration SHA-256: ${lock.calibrationSha256}`);
console.log(`- contract SHA-256: ${lock.contractSha256}`);
console.log('- 178 rows are now immutable for v0.1 gate calibration');
