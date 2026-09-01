import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const designFile = 'data/liuyao-semantic-v013-candidate-v06-design-v0.1.json';
const terminalFile = 'data/liuyao-semantic-v013-candidate-v05-terminal-v0.1.json';
const design = readJson(designFile);
const terminal = readJson(terminalFile);

assert(design.status === 'design_frozen_before_v06_calibration_data', 'Candidate v0.6 design is not frozen');
assert(design.scope === 'liuyao_semantic_current_22', 'Candidate v0.6 scope drift');
assert(terminal.status === 'failed_before_candidate_lock' && terminal.candidateLockCreated === false, 'Candidate v0.5 terminal status drift');
assert(design.predecessor?.terminalPath === terminalFile && design.predecessor?.statusRequired === terminal.status, 'Candidate v0.6 predecessor provenance drift');
assert(design.responsibilityDecision?.earliestWrongLayer === 'modern_information_target_evidence', 'Candidate v0.6 responsibility layer drift');
assert(design.responsibilityDecision?.strongScopeBypassChanged === false && design.responsibilityDecision?.scopeModelChanged === false && design.responsibilityDecision?.learnedModelChanged === false, 'Candidate v0.6 improperly changes downstream architecture');
assert(design.responsibilityDecision?.newUnsupportedFamilyAdded === false && design.responsibilityDecision?.existingUnsupportedFamilyToExtend === 'rule_or_procedure_information', 'Candidate v0.6 unsupported-family contract drift');
assert(Array.isArray(design.allowedChangeSurface?.runtime) && design.allowedChangeSurface.runtime.length === 2, 'Candidate v0.6 runtime change surface drift');
assert(design.allowedChangeSurface.runtime.includes('js/liuyao-semantic-route-evidence-v05.js') && design.allowedChangeSurface.runtime.includes('js/liuyao-semantic-route-arbitration-v014.js'), 'Candidate v0.6 runtime files drift');
assert(design.allowedChangeSurface?.mustRemainDomainGeneric === true && design.allowedChangeSurface?.rowIdSpecificExceptionsForbidden === true, 'Candidate v0.6 genericity contract drift');
assert(design.calibrationPolicy?.freshScopeCalibrationRequired === true && design.calibrationPolicy?.candidateV05ScopeCalibrationForbiddenForThresholdChoice === true && design.calibrationPolicy?.candidateV04ScopeCalibrationForbiddenForThresholdChoice === true, 'Candidate v0.6 freshness contract drift');
assert(design.calibrationPolicy?.freeParameterCount === 1 && design.calibrationPolicy?.freeParameter === 'scope_hard_veto_cutoff', 'Candidate v0.6 parameter contract drift');
assert(design.calibrationPolicy?.otherModelOrGateParametersMayChange === false && design.calibrationPolicy?.textsPerEncoderCall === 1, 'Candidate v0.6 model/representation contract drift');
const gates = design.evaluationPolicy?.promotionGates || {};
assert(gates.minimumKnownExactRoute === 0.8 && gates.minimumAcceptedRouteAccuracy === 0.98 && gates.maximumOverallFalseRouteActivation === 0.05 && gates.maximumFalseRouteActivationPerNonRouteSubtype === 0.05 && gates.noStructuralPathCollapse === true, 'Candidate v0.6 promotion gates drift');
assert(design.complexityBudget?.encoderCount === 1 && design.complexityBudget?.newLearnedParameters === 0 && design.complexityBudget?.newGlobalThresholds === 0 && design.complexityBudget?.newRouteSpecificThresholds === 0 && design.complexityBudget?.newUnsupportedTargetFamilies === 0, 'Candidate v0.6 complexity budget drift');
for (const relative of ['data/liuyao-semantic-frozen-dependencies-v0.2.json','data/liuyao-semantic-routeability-v0.4.json','data/liuyao-semantic-fallback-identity-v0.2.json','data/liuyao-semantic-fallback-acceptance-v0.1.json','data/liuyao-semantic-route-inventory-v0.2.json']) assert(fs.existsSync(path.join(root, relative)), `frozen dependency missing: ${relative}`);

console.log('LiuYao Candidate v0.6 design freeze verified.');
console.log('- only Evidence v0.5 + Arbitration v0.14 may change modern information-target semantics');
console.log('- no learned weights, gates, thresholds, route inventory, traditional rules or Scope bypass semantics may change');
console.log('- one fresh Scope cutoff calibration remains the only parameter choice');
console.log(`- design SHA-256: ${sha256(designFile)}`);
