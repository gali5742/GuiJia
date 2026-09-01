import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const designFile = 'data/liuyao-semantic-v013-candidate-v07-design-v0.1.json';
const terminalFile = 'data/liuyao-semantic-v013-candidate-v06-terminal-v0.1.json';
const failureFile = 'data/liuyao-semantic-scope-finalization-v0.4-calibration-failure.json';
const design = readJson(designFile);
const terminal = readJson(terminalFile);
const failure = readJson(failureFile);

assert(design.version === '0.13-candidate-v0.7-design-v0.1', 'Candidate v0.7 design version drift');
assert(design.status === 'design_frozen_before_v07_question_mode_implementation_and_calibration_data', 'Candidate v0.7 design status drift');
assert(design.predecessor?.candidate === 'v0.6' && design.predecessor?.statusRequired === 'failed_before_candidate_lock', 'Candidate v0.7 predecessor contract drift');
assert(terminal.status === 'failed_before_candidate_lock' && terminal.candidate === 'v0.6', 'Candidate v0.6 terminal status missing');
assert(failure.status === 'calibration_failed_no_safe_cutoff' && failure.candidateV06Lockable === false, 'Candidate v0.6 failure evidence missing');
assert(failure.safeThresholdCount === 0 && failure.irreducibleAtCutoffOne?.nonRouteActivations === 5, 'Candidate v0.6 failure boundary drift');
assert(design.responsibilityDecision?.earliestWrongLayer === 'modern_question_mode_before_arbitration', 'Candidate v0.7 responsibility drift');
assert(design.responsibilityDecision?.newDeterministicModuleRequired === true, 'Question Mode deterministic module must be explicit');
assert(design.responsibilityDecision?.newLearnedModelRequired === false && design.responsibilityDecision?.newThresholdRequired === false, 'Candidate v0.7 may not add learned model/threshold');
assert(design.allowedChangeSurface?.mustRemainDomainGeneric === true && design.allowedChangeSurface?.routeIdsForbiddenInQuestionModeRuntime === true, 'Question Mode domain-generic contract drift');
assert(design.questionModeContract?.arbitrationEffect?.includes('returns null for information_request'), 'Question Mode arbitration effect drift');
assert(design.calibrationPolicy?.freshScopeCalibrationRequired === true && design.calibrationPolicy?.freeParameterCount === 1 && design.calibrationPolicy?.freeParameter === 'scope_hard_veto_cutoff', 'Candidate v0.7 calibration policy drift');
assert(design.calibrationPolicy?.candidateV06ScopeCalibrationRegressionOnly === true, 'Candidate v0.6 calibration must be regression-only');
assert(design.complexityBudget?.encoderCount === 1 && design.complexityBudget?.newLearnedParameters === 0 && design.complexityBudget?.newLearnedModels === 0, 'Candidate v0.7 learned complexity drift');
assert(design.complexityBudget?.newGlobalThresholds === 0 && design.complexityBudget?.newRouteSpecificThresholds === 0 && design.complexityBudget?.newDeterministicModules === 1, 'Candidate v0.7 gate/threshold complexity drift');
assert(design.frozenDependencies?.currentRouteCount === 22 && design.frozenDependencies?.traditionalRuleLayerChanged === false, 'Candidate v0.7 traditional/current22 boundary drift');

console.log('LiuYao Candidate v0.7 Question Mode design freeze verified.');
console.log('- Candidate v0.6 is terminally failed before lock with 0 safe Scope cutoffs');
console.log('- repair responsibility moves to a route-agnostic question-mode boundary before Arbitration');
console.log('- learned models, learned parameters, route inventory, Scope bypass and thresholds remain frozen');
console.log(`- design SHA-256: ${sha256(designFile)}`);
