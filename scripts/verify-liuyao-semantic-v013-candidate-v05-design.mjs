import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(read(p).toString('utf8'));
const blob=p=>{const b=read(p);return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');};
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const P={
  design:'data/liuyao-semantic-v013-candidate-v05-design-v0.1.json',
  boundary:'data/liuyao-semantic-v013-candidate-v05-route-sufficiency-boundary-review-v0.1.json',
  lock:'data/liuyao-semantic-v013-candidate-v05-design.lock.json',
  diagnostic:'data/liuyao-semantic-v013-candidate-v04-development-failure-diagnostic-v0.2.json'
};
const design=json(P.design),boundary=json(P.boundary),lock=json(P.lock),diagnostic=json(P.diagnostic);
assert(blob(P.design)==='77ed639b92a152783f589d7697dc54eec283e4d0','Candidate v0.5 design blob drift');
assert(blob(P.boundary)==='a9b21fcd76a69577f3cf6f14ba4c871cbe762f87','Route Sufficiency boundary blob drift');
assert(blob(P.diagnostic)==='af0a3a3710211b3bf84bfcfe7f46648687b560ea','Candidate v0.4 corrected diagnostic blob drift');
assert(design.status==='design_frozen_before_v05_training_calibration_or_runtime_change','Candidate v0.5 design not frozen');
assert(boundary.status==='design_input_frozen_from_candidate_v04_failure_evidence','Route Sufficiency boundary review not frozen');
assert(lock.status==='locked_before_v05_training_calibration_or_encoder_scoring','Candidate v0.5 design lock status invalid');
assert(lock.design?.gitBlobSha===blob(P.design)&&lock.routeSufficiencyBoundaryReview?.gitBlobSha===blob(P.boundary),'design lock binding drift');
assert(lock.sourceFailureDiagnostic?.gitBlobSha===blob(P.diagnostic),'failure diagnostic binding drift');
assert(diagnostic.policy?.rerunsEncoder===false&&diagnostic.policy?.readsIndependentEvaluation===false,'source failure diagnostic governance invalid');
assert(design.candidateV04?.mutationAllowed===false&&design.candidateV04?.candidateLockAllowed===false,'Candidate v0.4 immutability lost');
assert(design.candidateV04?.developmentRowsMayEnterV05Training===false&&design.candidateV04?.developmentRowsMayEnterV05Calibration===false,'Candidate v0.4 development leakage allowed');
const order=design.plannedRuntime?.order||[];
const expected=['normalized_question','frozen_encoder','Semantic_Act_v0.1','Route_Sufficiency_v0.1','Evidence_v0.3','Arbitration_v0.12','Compatibility_v0.3','Routeability_v0.5_execution_corrected_threshold','Fallback_Identity_v0.3','Selection_v0.6','Finalization_v0.1'];
assert(JSON.stringify(order)===JSON.stringify(expected),'Candidate v0.5 runtime order drift');
const suff=design.plannedRuntime?.routeSufficiency;
assert(suff?.version==='v0.1'&&suff?.model?.oneGlobalThresholdOnly===true&&suff?.model?.routeSpecificThresholds===false,'Route Sufficiency contract drift');
assert(suff?.hardBehavior?.some(x=>x.includes('prevents Arbitration rescue')),'Route Sufficiency pre-Arbitration blocking behavior missing');
const fallback=design.plannedRuntime?.fallbackIdentity;
assert(fallback?.version==='v0.3'&&fallback?.candidateUniverse==='all_current_22_routes','Fallback v0.3 universe drift');
assert(fallback?.model?.trainFromScratch===true&&fallback?.model?.routeSpecificThresholds===false,'Fallback v0.3 training/threshold contract drift');
assert(fallback?.decisionContract?.includes('score all current 22 heads'),'Fallback v0.3 all-22 scoring missing');
const selection=design.plannedRuntime?.selection;
assert(selection?.version==='v0.6','Selection v0.6 missing');
assert(selection?.changes?.some(x=>x.includes('may not independently produce a final route')),'Selection Router-only prohibition missing');
assert(selection?.changes?.some(x=>x.includes('fallback_router_conflict')),'Selection conflict-abstention contract missing');
assert(design.plannedRuntime?.routeability?.change==='none'&&design.plannedRuntime?.routeability?.threshold===0.7678148573595883,'Routeability was not deferred/frozen');
assert(design.plannedRuntime?.semanticActEligibility?.change==='none','Semantic Act unexpectedly changed');
assert(design.plannedRuntime?.finalization?.change==='none','Finalization unexpectedly changed');
const gates=design.freshDevelopmentPolicy?.promotionGates||{};
assert(gates.minimumKnownExactRoute===0.8&&gates.minimumAcceptedRouteAccuracy===0.98&&gates.maximumOverallFalseRouteActivation===0.05&&gates.maximumFalseRouteActivationPerNonRouteSubtype===0.05&&gates.requireNoStructuralPathCollapse===true,'promotion gates drift');
assert(design.independentEvaluationPolicy?.readBeforeDevelopmentPass===false&&design.independentEvaluationPolicy?.readBeforeCandidateLock===false,'independent evaluation discipline drift');
assert(design.traditionalLiuYaoBoundary?.modified===false,'traditional LiuYao boundary unexpectedly modified');
assert(lock.governance?.v05EncoderScoringBeforeThisLock===false&&lock.governance?.independentEvaluationRead===false,'design lock governance invalid');
console.log('Candidate v0.5 frozen design verified.');
console.log(JSON.stringify({designBlob:blob(P.design),boundaryBlob:blob(P.boundary),diagnosticBlob:blob(P.diagnostic),runtimeOrder:order,nextAction:design.nextAction},null,2));
