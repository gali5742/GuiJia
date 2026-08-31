import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const iifeFiles = [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-compatibility-v03.js',
  'js/liuyao-semantic-route-selection-v04.js',
  'js/liuyao-semantic-route-selection-v05.js',
  'js/liuyao-semantic-routeability-v06.js',
  'js/liuyao-semantic-finalization-v02.js'
];
const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of iifeFiles) vm.runInContext(read(relative), context, { filename:relative });
const G = context.GuiJia;
assert(G?.liuyaoSemanticRouteabilityV06?.decide, 'Routeability v0.6 missing');
assert(G?.liuyaoSemanticRouteSelectionV05?.decide, 'Selection v0.5 missing');
assert(G?.liuyaoSemanticFinalizationV02?.finalize, 'Finalization v0.2 missing');

// R1: corrected Routeability model threshold is supplied by the frozen artifact, not hard-coded in policy code.
const rtAccepted = G.liuyaoSemanticRouteabilityV06.decide({ probability:0.8, modelThreshold:0.7, evidence:{ unsupportedTargets:[] } });
assert(rtAccepted.disposition === 'route_known' && rtAccepted.reasonCode === 'corrected_model_score_accept', 'R1 corrected model score should accept');
const rtRejected = G.liuyaoSemanticRouteabilityV06.decide({ probability:0.6, modelThreshold:0.7, evidence:{ unsupportedTargets:[] } });
assert(rtRejected.disposition === 'non_route' && rtRejected.reasonCode === 'corrected_model_score_reject', 'R1 corrected model score should reject');

// R2: explicit unsupported modern target always blocks route activation.
const rtUnsupported = G.liuyaoSemanticRouteabilityV06.decide({ probability:0.99, modelThreshold:0.7, evidence:{ unsupportedTargets:['rule_or_procedure_information'] } });
assert(rtUnsupported.disposition === 'non_route' && rtUnsupported.reasonCode === 'explicit_unsupported_target', 'R2 unsupported target must block activation');

// R3: confirmed support/strong Arbitration can rescue below the normal Routeability model threshold.
const supportEvidence = { unsupportedTargets:[], events:['commercial_transaction'] };
const supportArbitration = { routeId:'commercial_transaction', strength:'support' };
const rtRescue = G.liuyaoSemanticRouteabilityV06.decide({ probability:0.5, modelThreshold:0.7, evidence:supportEvidence, arbitration:supportArbitration });
assert(rtRescue.disposition === 'route_known' && rtRescue.reasonCode === 'confirmed_support_rescue', 'R3 confirmed support rescue failed');

// R4: pure fallback Identity global Top1 may be outside Router Top1/Top2 and still be selected.
const head = {
  top1:{ id:'financial_fortune', score:0.42 },
  top2:{ id:'business_operation', score:0.31 }
};
const fallbackAccepted = {
  status:'selected',
  routeId:'relationship_development',
  reasonCode:'fallback_global_identity_accepted',
  routeabilityProbability:0.73,
  identityTop1Probability:0.71
};
const pureSelection = G.liuyaoSemanticRouteSelectionV05.decide({
  arbitration:null,
  head,
  evidence:{ unsupportedTargets:[] },
  routeabilityDisposition:'non_route',
  fallbackAcceptanceDecision:fallbackAccepted
});
assert(pureSelection.status === 'selected' && pureSelection.routeId === 'relationship_development', 'R4 global Identity route outside Router Top2 must be selectable');
assert(pureSelection.candidates.some((candidate) => candidate.routeId === 'relationship_development' && candidate.provenance.includes('fallback_identity_global_top1')), 'R4 global Identity provenance missing');

// R5: dedicated pure-fallback Acceptance may finalize even when the normal Routeability model threshold rejected.
const pureFinal = G.liuyaoSemanticFinalizationV02.finalize({
  routeability:{ disposition:'non_route', reasonCode:'corrected_model_score_reject' },
  selection:pureSelection,
  scope:{ hardVeto:false },
  arbitration:null,
  evidence:{ unsupportedTargets:[] },
  fallbackAcceptanceDecision:fallbackAccepted
});
assert(pureFinal.disposition === 'route_known' && pureFinal.routeId === 'relationship_development', 'R5 dedicated fallback gate must control pure fallback finalization');

// R6: rejected pure fallback becomes unresolved, not a false out-of-scope assertion.
const fallbackRejected = { status:'route_unresolved', routeId:null, reasonCode:'fallback_identity_below_accept_threshold' };
const rejectedSelection = G.liuyaoSemanticRouteSelectionV05.decide({
  arbitration:null,
  head,
  evidence:{ unsupportedTargets:[] },
  routeabilityDisposition:'non_route',
  fallbackAcceptanceDecision:fallbackRejected
});
const rejectedFinal = G.liuyaoSemanticFinalizationV02.finalize({
  routeability:{ disposition:'non_route', reasonCode:'corrected_model_score_reject' },
  selection:rejectedSelection,
  scope:{ hardVeto:false },
  arbitration:null,
  evidence:{ unsupportedTargets:[] },
  fallbackAcceptanceDecision:fallbackRejected
});
assert(rejectedFinal.disposition === 'route_unresolved', 'R6 rejected fallback must remain unresolved');

// R7: Arbitration path still requires Routeability membership/rescue.
const arbSelectionSynthetic = { status:'selected', routeId:'commercial_transaction', reasonCode:'support_arbitration_priority_after_routeability' };
const arbFinalRejected = G.liuyaoSemanticFinalizationV02.finalize({
  routeability:{ disposition:'non_route', reasonCode:'corrected_model_score_reject' },
  selection:arbSelectionSynthetic,
  scope:{ hardVeto:false },
  arbitration:supportArbitration,
  evidence:supportEvidence,
  fallbackAcceptanceDecision:null
});
assert(arbFinalRejected.disposition === 'non_route', 'R7 Arbitration route cannot bypass Routeability without rescue');

// R8: Scope hard veto rejects an accepted pure fallback route.
const pureScopeRejected = G.liuyaoSemanticFinalizationV02.finalize({
  routeability:{ disposition:'non_route', reasonCode:'corrected_model_score_reject' },
  selection:pureSelection,
  scope:{ hardVeto:true },
  arbitration:null,
  evidence:{ unsupportedTargets:[] },
  fallbackAcceptanceDecision:fallbackAccepted
});
assert(pureScopeRejected.disposition === 'non_route' && pureScopeRejected.reasonCode === 'scope_hard_veto', 'R8 Scope hard veto must reject pure fallback');

// R9: confirmed strong Arbitration retains the deliberate Scope-bypass contract.
const strongEvidence = { unsupportedTargets:[], events:['commercial_transaction'] };
const strongArbitration = { routeId:'commercial_transaction', strength:'strong' };
const strongFinal = G.liuyaoSemanticFinalizationV02.finalize({
  routeability:{ disposition:'route_known', reasonCode:'confirmed_strong_rescue' },
  selection:{ status:'selected', routeId:'commercial_transaction', reasonCode:'strong_arbitration_confirmed' },
  scope:{ hardVeto:true },
  arbitration:strongArbitration,
  evidence:strongEvidence,
  fallbackAcceptanceDecision:null
});
assert(strongFinal.disposition === 'route_known' && strongFinal.scopeBypassed === true && strongFinal.reasonCode === 'confirmed_strong_scope_bypass', 'R9 confirmed strong Scope bypass failed');

// R10: production thresholds/weights live in frozen JSON artifacts, not duplicated in policy/selection/finalization source.
const runtimePolicyFiles = [
  'js/liuyao-semantic-fallback-identity-frozen-v02.js',
  'js/liuyao-semantic-fallback-acceptance-frozen-v01.js',
  'js/liuyao-semantic-routeability-v06.js',
  'js/liuyao-semantic-route-selection-v05.js',
  'js/liuyao-semantic-finalization-v02.js'
];
const forbiddenThresholdLiterals = ['0.7153315637462625','0.6247873002579858','0.7678148573595883','0.4196','0.4781650996230466'];
for (const relative of runtimePolicyFiles) {
  const source = read(relative);
  for (const literal of forbiddenThresholdLiterals) assert(!source.includes(literal), `R10 hard-coded frozen threshold ${literal} leaked into ${relative}`);
}
const acceptanceLoader = read('js/liuyao-semantic-fallback-acceptance-frozen-v01.js');
assert(acceptanceLoader.includes("../data/liuyao-semantic-fallback-acceptance-v0.1.json"), 'R10 Acceptance loader artifact path missing');
const identityLoader = read('js/liuyao-semantic-fallback-identity-frozen-v02.js');
assert(identityLoader.includes("../data/liuyao-semantic-fallback-identity-v0.2.json"), 'R10 Identity loader artifact path missing');

// R11: modern semantic routing layer must not import traditional LiuYao observation-selection terms.
const traditionalTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
for (const relative of runtimePolicyFiles) {
  const source = read(relative);
  for (const term of traditionalTerms) assert(!source.includes(term), `R11 traditional term leaked into ${relative}: ${term}`);
}

console.log('LiuYao Candidate v0.4 routing/runtime contract verified.');
console.log('- corrected Routeability threshold is artifact-supplied; unsupported and rescue contracts preserved');
console.log('- pure fallback global Identity may select outside Router Top2');
console.log('- rejected pure fallback remains route_unresolved; accepted fallback still respects Scope hard veto');
console.log('- confirmed strong Arbitration retains explicit Scope bypass');
console.log('- frozen thresholds are not duplicated in runtime policy source');
console.log('- traditional LiuYao observation-selection terms absent from modern semantic runtime boundary');
