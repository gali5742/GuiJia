import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const design = readJson('data/liuyao-semantic-v013-candidate-v03-design-v0.1.json');
const diagnosis = readJson('data/liuyao-semantic-v013-candidate-v02-independent-diagnostic-v0.1.json');
const candidateV02 = readJson('data/liuyao-semantic-decision-stack-v0.13-candidate-v0.2.lock.json');
const nextTopics = readJson('data/liuyao-next-topic-inventory-v0.1.json');

assert(design.version === '0.13-candidate-v0.3-design-v0.1', `unexpected design version ${design.version}`);
assert(design.status === 'design_frozen_before_v03_data', `unexpected design status ${design.status}`);
assert(design.sourceDiagnosis?.allowedUse === 'architecture_only', 'v0.2 independent diagnosis must be architecture-only');
assert(design.sourceDiagnosis?.trainingEligible === false, 'v0.2 independent diagnosis cannot train v0.3');
assert(design.sourceDiagnosis?.calibrationEligible === false, 'v0.2 independent diagnosis cannot calibrate v0.3');
assert(design.sourceDiagnosis?.thresholdSelectionEligible === false, 'v0.2 independent diagnosis cannot choose thresholds');
assert(diagnosis.policy?.trainingEligible === false && diagnosis.policy?.calibrationEligible === false, 'diagnostic source policy drift');
assert(design.candidateV02?.sha256 === candidateV02.candidateSha256, 'Candidate v0.2 SHA mismatch');
assert(design.candidateV02?.mutationAllowed === false, 'Candidate v0.2 must remain immutable');

const fallback = design.plannedModules?.fallbackIdentityGate;
assert(fallback?.version === 'v0.1', 'Fallback Identity Gate v0.1 required');
assert(fallback?.appliesOnlyWhen === 'Arbitration is null and Routeability is route_known', 'fallback gate scope drift');
assert(fallback?.model?.type?.includes('22 independent binary logistic heads'), 'fallback validator must be 22 independent binary heads');
assert(fallback?.model?.notAReplacementForRouter === true, 'fallback validator cannot replace Router');
assert(fallback?.model?.notAReplacementForRouteability === true, 'fallback validator cannot replace Routeability');
assert((fallback.forbidden || []).some((row) => row.includes('Candidate v0.2 independent')), 'independent threshold/training prohibition missing');
assert((fallback.decisionContract || []).some((row) => row.includes('if neither is admitted')), 'reject-all contract missing');
assert((fallback.decisionContract || []).some((row) => row.includes('if both are admitted')), 'both-admitted unresolved contract missing');

const routeability = design.plannedModules?.routeability;
assert(routeability?.baseModel === 'frozen_v0.2', 'v0.3 must preserve Routeability v0.2 base weights');
assert(routeability?.threshold === 0.7675678218564946, 'v0.3 must preserve frozen v0.3 Routeability threshold');
assert(routeability?.thresholdRetuneInV03 === false, 'v0.3 may not retune Routeability threshold');
assert(routeability?.fallbackBelowThresholdRescue === false, 'v0.3 may not add fallback below-threshold rescue');

const training = design.trainingPolicy || {};
for (const forbidden of ['Candidate v0.1 independent eval','Candidate v0.2 independent eval','v0.13 development evaluation','Routeability v0.3 calibration']) {
  assert((training.fallbackIdentityTrainingMustExclude || []).includes(forbidden), `missing training exclusion: ${forbidden}`);
}
assert(training.freshCalibrationMustBeSeparateFromTraining === true, 'fresh v0.3 calibration separation required');
assert((training.calibrationMayChoose || []).length === 1, 'Fallback Identity v0.1 must calibrate only one global admission threshold');
assert((training.calibrationMustNotChoose || []).includes('Routeability threshold'), 'Routeability threshold calibration must remain forbidden');

assert(design.evaluationPolicy?.freshV03DevelopmentRequired === true, 'fresh v0.3 development required');
assert(design.evaluationPolicy?.freshV03CalibrationRequired === true, 'fresh v0.3 calibration required');
assert(design.evaluationPolicy?.candidateLockBeforeIndependent === true, 'candidate must lock before independent');
assert(design.evaluationPolicy?.freshPostLockIndependentRequired === true, 'fresh post-lock independent required');
assert(design.evaluationPolicy?.sameVersionRetuneAfterIndependent === false, 'same-version retune must stay forbidden');

assert(nextTopics.status === undefined || nextTopics.status === 'design_only', 'next-topic inventory must remain design-only');
assert(design.nextTopicBoundary?.mayEnterV03Training === false, 'next topics may not enter v0.3 training');
assert(design.nextTopicBoundary?.mayBecomeCurrentRoutes === false, 'next topics may not become current routes in v0.3');

console.log('LiuYao v0.13-v0.3 architecture design verified.');
console.log('- Candidate v0.2 independent data: architecture diagnosis only');
console.log('- Routeability weights/threshold: unchanged');
console.log('- Fallback Identity: 22 one-vs-rest sigmoid validators; Top1/Top2 only; reject-all allowed');
console.log('- fresh training augmentation + fresh calibration + fresh post-lock independent required');
