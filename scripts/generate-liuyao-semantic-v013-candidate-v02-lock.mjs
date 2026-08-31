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
const developmentReport = readJson('data/liuyao-semantic-v013-candidate-v02-development-report.json');
const safetySweep = readJson('data/liuyao-semantic-v013-candidate-v02-responsibility-safety-sweep.json');

if (routeability.status !== 'frozen' || routeabilityLock.status !== 'locked') throw new Error('Routeability v0.3 threshold artifact must remain frozen');
if (frozenLock.status !== 'locked') throw new Error('Frozen semantic dependencies must remain locked');
if (developmentReport.status !== 'pre_lock_development_diagnostic' || developmentReport.readyForCandidateLock !== true) throw new Error('v0.13-v0.2 development gates not passed');
if (safetySweep.status !== 'development_and_calibration_diagnostic_only') throw new Error('responsibility safety sweep missing');
for (const key of [
  'strongConfirmedScopeBypassNewActivations',
  'supportPriorityNewActivations',
  'belowThresholdSupportConfirmedNewActivations'
]) {
  if (safetySweep.pooledSafety?.[key] !== 0) throw new Error(`unsafe responsibility rule: ${key}`);
}

const runtimeSourceFiles = [
  'js/liuyao-divination-policy-gate-v01.js',
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-routeability-v04.js',
  'js/liuyao-semantic-route-selection-v03.js',
  'js/liuyao-semantic-finalization-v01.js',
  'data/liuyao-semantic-routeability-v0.2.json',
  'data/liuyao-semantic-routeability-v0.3.json',
  'data/liuyao-semantic-routeability-v0.3.lock.json',
  'data/liuyao-semantic-frozen-dependencies-v0.1.json',
  'data/liuyao-semantic-frozen-dependencies-v0.1.lock.json',
  'data/liuyao-semantic-route-inventory-v0.2.json'
];

const candidate = {
  version:'0.13-candidate-v0.2',
  status:'frozen_candidate',
  scope:'liuyao_semantic_decision_stack_v0.13',
  modernSemanticOnly:true,
  policyGate:'v0.1',
  evidence:'v0.2',
  arbitration:'v0.12',
  compatibility:'v0.2',
  routeability:{
    policyVersion:'v0.4',
    baseModelVersion:'v0.2',
    baseModelSha256:routeability.baseModel.sha256,
    thresholdSource:'frozen_v0.3_calibration',
    thresholdArtifactSha256:routeabilityLock.artifactSha256,
    threshold:routeability.calibration.threshold,
    belowThresholdConfirmedStrongRescue:true,
    belowThresholdConfirmedSupportRescue:true,
    compatibleOnlySupportRescue:false,
    thresholdRetunedForCandidateV02:false
  },
  selection:{
    version:'v0.3',
    acceptedGateSupportPriority:true,
    supportPriorityRequiresNonContradiction:true,
    supportPriorityMayOverrideOtherConfirmedCandidate:false
  },
  finalization:{
    version:'v0.1',
    scopeHardVeto:0.4196,
    confirmedStrongScopeBypass:true,
    supportScopeBypass:false
  },
  router:{
    version:'v0.8.1-canonical-frozen',
    dependencyArtifactSha256:frozenLock.artifactSha256
  },
  sufficiency:'v0.2-frozen',
  ruleRegistryBoundary:'modern-route-to-traditional-observation-only',
  runtimeSources:runtimeSourceFiles.map((relative) => ({ path:relative, sha256:sha256(relative) })),
  preLockEvidence:[
    {
      path:'data/liuyao-semantic-v013-candidate-v02-responsibility-safety-sweep.json',
      sha256:sha256('data/liuyao-semantic-v013-candidate-v02-responsibility-safety-sweep.json')
    },
    {
      path:'data/liuyao-semantic-v013-candidate-v02-development-report.json',
      sha256:sha256('data/liuyao-semantic-v013-candidate-v02-development-report.json')
    }
  ],
  evaluationPolicy:{
    current198DevelopmentIsTuningOnly:true,
    v03CalibrationIsCalibrationOnly:true,
    candidateV01IndependentEvalMayInformNextVersionDiagnosisOnly:true,
    candidateV01IndependentEvalIsNotIndependentEvidenceForCandidateV02:true,
    independentEvalMustBeFreshAfterThisLock:true,
    independentEvalMayNotTrainCalibrateOrRetuneThisCandidate:true,
    futureBlindMustBeFreshAfterCandidateLock:true,
    noSameVersionRetuneAfterIndependentEval:true
  }
};

const candidatePath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.2.json';
fs.writeFileSync(path.join(root, candidatePath), `${JSON.stringify(candidate, null, 2)}\n`, 'utf8');
const candidateSha256 = sha256(candidatePath);
const lock = {
  version:'0.13-candidate-v0.2-lock',
  status:'locked',
  candidatePath,
  candidateSha256,
  baseRouteabilityModelSha256:routeability.baseModel.sha256,
  thresholdArtifactSha256:routeabilityLock.artifactSha256,
  frozenDependencyArtifactSha256:frozenLock.artifactSha256,
  preLockDevelopmentReportSha256:sha256('data/liuyao-semantic-v013-candidate-v02-development-report.json'),
  responsibilitySafetySweepSha256:sha256('data/liuyao-semantic-v013-candidate-v02-responsibility-safety-sweep.json')
};
fs.writeFileSync(path.join(root, 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.2.lock.json'), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
console.log(`Locked LiuYao v0.13-v0.2 candidate: ${candidateSha256}`);
