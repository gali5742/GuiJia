import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');
const fail = (m) => { throw new Error(m); };
const assert = (c,m) => { if(!c) fail(m); };
const runner = read('js/liuyao-semantic-decision-stack-v011-sealed-blind-v01.js');
const candidate = read('js/liuyao-semantic-decision-stack-v011.js');

assert(runner.includes("semanticDecisionStackV011 as candidate"), 'blind runner must reuse v0.11 candidate');
assert(runner.includes("semanticRouterPocV081 as router") && runner.includes("semanticScopeGateV01 as scopeGate"), 'blind runner must reuse frozen Router/Scope');
assert(runner.includes('liuyaoSemanticRouteArbitrationV092') && runner.includes('liuyaoSemanticRouteIdentityV01'), 'blind runner must use v0.9.2 arbitration and Route Identity v0.1');
assert(runner.includes('evaluateIntentSufficiency'), 'blind runner must use Semantic Sufficiency v0.2 Intent-aware API');
assert(runner.includes("status!=='sealed'") && runner.includes('blind.sealed!==true'), 'blind runner must enforce sealed metadata');
assert(runner.includes('PATCH_URL') && runner.includes('sealed_preuse_patch') && runner.includes('preuseCorrections'), 'blind runner must apply verified pre-use wording patch');
assert(runner.includes('candidate.train('), 'blind prepare must reuse candidate training/calibration recipe');
assert(runner.includes('scopeHardVetoCutoff=candidateTraining.scope.threshold'), 'blind runner must use v0.11 Scope cutoff from candidate calibration');
assert(!runner.includes('scopeHardVetoCutoff=blind') && !runner.includes('calibrateBlind') && !runner.includes('trainBlind'), 'blind rows must not calibrate/train the candidate');
assert(runner.indexOf('async function prepare') < runner.indexOf('async function runBlind'), 'prepare must be separate from blind execution');
assert(runner.includes('if(!ready)throw new Error'), 'blind run must require frozen candidate preparation first');
assert(runner.includes("expectedRejectReason:'outside_current_22'") && runner.includes("expectedRejectReason:'route_unresolved'"), 'blind rejection diagnostics missing');
assert(runner.includes('adversarialExact') && runner.includes('adversarialKnownExact') && runner.includes('adversarialOutsideReject') && runner.includes('adversarialUnresolvedReject'), 'blind adversarial metrics missing');
assert(runner.includes('regularExact') && runner.includes('routeSummaries') && runner.includes('domainSummaries'), 'blind regular/per-route reporting missing');
assert(runner.includes("version:'sealed-blind-v0.1-oracle-fixture'"), 'blind Sufficiency fixture boundary missing');
assert(!/(妻财|官鬼|世爻|应爻|用神)/.test(runner), 'blind runner leaks traditional LiuYao semantics');

// Candidate itself must retain v0.11 decision precedence; blind runner is an evaluator, not a forked candidate.
assert(candidate.indexOf('if(arbitration)') < candidate.indexOf('identity(head.top1?.id,row.text)'), 'frozen candidate arbitration precedence drift');
assert(candidate.includes("finalMainDisposition='route_known'") && candidate.includes("finalMainDisposition='non_route'"), 'frozen candidate binary main decision missing');
assert(candidate.includes("outside_current_22':'route_unresolved"), 'frozen candidate reject-reason diagnostic split missing');

console.log('LiuYao Semantic Decision Stack v0.11 Sealed Blind runtime contract verified.');
console.log('- evaluates the frozen v0.11 candidate; Blind rows do not train or calibrate it');
console.log('- verified pre-use wording patch is applied at runtime');
console.log('- main route decision, Sufficiency, Rule availability, and adversarial metrics are reported separately');
