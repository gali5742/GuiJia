import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => createHash('sha256').update(read(relative)).digest('hex');
const routeability = readJson('data/liuyao-semantic-routeability-v0.3.json');
const routeabilityLock = readJson('data/liuyao-semantic-routeability-v0.3.lock.json');
const frozenLock = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.lock.json');
if (routeability.status !== 'frozen' || routeabilityLock.status !== 'locked') throw new Error('Routeability v0.3 must be frozen before candidate lock');
if (frozenLock.status !== 'locked') throw new Error('Frozen semantic dependencies must be locked');

const sourceFiles = [
  'js/liuyao-divination-policy-gate-v01.js',
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-selection-v02.js',
  'js/liuyao-semantic-routeability-v03.js',
  'data/liuyao-semantic-routeability-v0.3.json',
  'data/liuyao-semantic-routeability-v0.3.lock.json',
  'data/liuyao-semantic-frozen-dependencies-v0.1.json',
  'data/liuyao-semantic-frozen-dependencies-v0.1.lock.json',
  'data/liuyao-semantic-route-inventory-v0.2.json'
];
const candidate = {
  version:'0.13-candidate-v0.1',
  status:'frozen_candidate',
  scope:'liuyao_semantic_decision_stack_v0.13',
  modernSemanticOnly:true,
  policyGate:'v0.1',
  evidence:'v0.2',
  arbitration:'v0.12',
  compatibility:'v0.2',
  selection:'v0.2',
  routeability:{ version:'v0.3', artifactSha256:routeabilityLock.artifactSha256, threshold:routeability.calibration.threshold },
  router:{ version:'v0.8.1-canonical-frozen', dependencyArtifactSha256:frozenLock.artifactSha256 },
  scopeHardVeto:0.4196,
  sufficiency:'v0.2-frozen',
  ruleRegistryBoundary:'modern-route-to-traditional-observation-only',
  sources:sourceFiles.map((relative) => ({ path:relative, sha256:sha256(relative) })),
  evaluationPolicy:{
    current198DevelopmentIsTuningOnly:true,
    v03CalibrationIsCalibrationOnly:true,
    independentEvalMustBeFreshAfterThisLock:true,
    independentEvalMayNotTrainOrCalibrateThisCandidate:true,
    futureBlindMustBeFreshAfterCandidateLock:true,
    noSameVersionRetuneAfterBlind:true
  }
};
const candidatePath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.1.json';
fs.writeFileSync(path.join(root, candidatePath), `${JSON.stringify(candidate, null, 2)}\n`, 'utf8');
const candidateSha256 = sha256(candidatePath);
const lock = {
  version:'0.13-candidate-v0.1-lock',
  status:'locked',
  candidatePath,
  candidateSha256,
  routeabilityArtifactSha256:routeabilityLock.artifactSha256,
  frozenDependencyArtifactSha256:frozenLock.artifactSha256
};
fs.writeFileSync(path.join(root, 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.1.lock.json'), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
console.log(`Locked LiuYao v0.13 candidate: ${candidateSha256}`);
