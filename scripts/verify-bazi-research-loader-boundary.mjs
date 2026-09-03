import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const migratedModules = Object.freeze([
    'js/bazi-clash-rescue-context.js',
    'js/bazi-root-clash-source-outcome.js',
    'js/bazi-root-clash-interaction-effect.js',
    'js/bazi-visible-stem-functional-availability.js',
    'js/bazi-visible-stem-function-reachability.js',
    'js/bazi-visible-stem-directed-function.js',
    'js/bazi-visible-stem-function-coverage.js',
    'js/bazi-visible-stem-function-realization.js',
    'js/bazi-visible-stem-function-realization-source.js',
    'js/bazi-visible-stem-actor-interaction-aggregation.js',
    'js/bazi-visible-stem-actor-function-composition.js',
    'js/bazi-visible-stem-actor-profile-interpretation.js',
    'js/bazi-visible-stem-daymaster-contribution.js',
    'js/bazi-qianli-strength-composition.js',
    'js/bazi-qianli-quantity-classification-audit.js',
    'js/bazi-qianli-quantity-semantic-bridge.js',
    'js/bazi-qianli-quantity-case-calibration.js',
    'js/bazi-qianli-quantity-cross-literature-research.js',
    'js/bazi-contextual-force-evidence-profile.js',
    'js/bazi-contextual-force-evidence.js',
    'js/bazi-contextual-force-interaction-adapter.js',
    'js/bazi-contextual-force-party-audit.js',
    'js/bazi-contextual-force-party-membership.js',
    'js/bazi-contextual-force-party-affiliation.js',
    'js/bazi-contextual-force-party-affiliation-expansion-audit.js',
    'js/bazi-contextual-force-party-relation-effect.js',
    'js/bazi-contextual-force-party-relative-dominance-audit.js',
    'js/bazi-contextual-force-party-side-force-profile.js',
    'js/bazi-contextual-force-party-counter-context.js',
    'js/bazi-contextual-force-party-nonstem-foundation-audit.js',
    'js/bazi-contextual-force-party-branch-substrate-quality-audit.js',
    'js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js',
    'js/bazi-contextual-force-party-relation-effect-generalization-audit.js',
    'js/bazi-contextual-force-party-visible-edge-effect-type-authorization-audit.js',
    'js/bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js'
]);

const explicitSegment = Object.freeze([
    { globalKey:'baziClashRescueContext', src:'./js/bazi-clash-rescue-context.js?v=13.44.0' },
    { globalKey:'baziRootClashSourceOutcome', src:'./js/bazi-root-clash-source-outcome.js?v=13.44.0' },
    { globalKey:'baziRootClashInteractionEffect', src:'./js/bazi-root-clash-interaction-effect.js?v=13.44.0' },
    { globalKey:'baziRootActorInteractionAggregation', src:'./js/bazi-root-actor-interaction-aggregation.js?v=13.44.0' },
    { globalKey:'baziRootBaselineEffectiveness', src:'./js/bazi-root-baseline-effectiveness.js?v=13.44.0' },
    { globalKey:'baziStemBearingEffect', src:'./js/bazi-stem-bearing-effect.js?v=13.44.0' },
    { globalKey:'baziVisibleStemFunctionalAvailability', src:'./js/bazi-visible-stem-functional-availability.js?v=13.44.0' },
    { globalKey:'baziVisibleStemFunctionReachability', src:'./js/bazi-visible-stem-function-reachability.js?v=13.44.0' },
    { globalKey:'baziVisibleStemDirectedFunction', src:'./js/bazi-visible-stem-directed-function.js?v=13.44.0' },
    { globalKey:'baziVisibleStemFunctionCoverage', src:'./js/bazi-visible-stem-function-coverage.js?v=13.44.0' },
    { globalKey:'baziVisibleStemFunctionRealization', src:'./js/bazi-visible-stem-function-realization.js?v=13.44.0' },
    { globalKey:'baziVisibleStemFunctionRealizationSource', src:'./js/bazi-visible-stem-function-realization-source.js?v=13.44.0' },
    { globalKey:'baziVisibleStemActorInteractionAggregation', src:'./js/bazi-visible-stem-actor-interaction-aggregation.js?v=13.44.0' },
    { globalKey:'baziVisibleStemActorFunctionComposition', src:'./js/bazi-visible-stem-actor-function-composition.js?v=13.44.0' },
    { globalKey:'baziVisibleStemActorProfileInterpretation', src:'./js/bazi-visible-stem-actor-profile-interpretation.js?v=13.44.0' },
    { globalKey:'baziVisibleStemDaymasterContribution', src:'./js/bazi-visible-stem-daymaster-contribution.js?v=13.44.0' },
    { globalKey:'baziQianliStrengthCompositionSource', src:'./js/bazi-qianli-strength-composition-source.js?v=13.44.0' },
    { globalKey:'baziQianliStrengthComposition', src:'./js/bazi-qianli-strength-composition.js?v=13.44.0' },
    { globalKey:'baziQianliQuantityClassificationSource', src:'./js/bazi-qianli-quantity-classification-source.js?v=13.44.0' },
    { globalKey:'baziQianliQuantityClassificationAudit', src:'./js/bazi-qianli-quantity-classification-audit.js?v=13.44.0' },
    { globalKey:'baziQianliQuantitySemanticBridgeSource', src:'./js/bazi-qianli-quantity-semantic-bridge-source.js?v=13.44.0' },
    { globalKey:'baziQianliQuantitySemanticBridge', src:'./js/bazi-qianli-quantity-semantic-bridge.js?v=13.44.0' },
    { globalKey:'baziQianliQuantityCaseCalibrationSource', src:'./js/bazi-qianli-quantity-case-calibration-source.js?v=13.44.0' },
    { globalKey:'baziQianliQuantityCaseCalibration', src:'./js/bazi-qianli-quantity-case-calibration.js?v=13.44.0' },
    { globalKey:'baziQianliQuantityCrossLiteratureSource', src:'./js/bazi-qianli-quantity-cross-literature-source.js?v=13.44.0' },
    { globalKey:'baziQianliQuantityCrossLiteratureResearch', src:'./js/bazi-qianli-quantity-cross-literature-research.js?v=13.44.0' },
    { globalKey:'baziContextualForceEvidenceSource', src:'./js/bazi-contextual-force-evidence-source.js?v=13.44.0' },
    { globalKey:'baziContextualForceEvidenceProfile', src:'./js/bazi-contextual-force-evidence-profile.js?v=13.44.0' },
    { globalKey:'baziContextualForceEvidence', src:'./js/bazi-contextual-force-evidence.js?v=13.44.0' },
    { globalKey:'baziContextualForceInteractionAdapterContract', src:'./js/bazi-contextual-force-interaction-adapter-contract.js?v=13.44.0' },
    { globalKey:'baziContextualForceInteractionAdapterProfile', src:'./js/bazi-contextual-force-interaction-adapter-profile.js?v=13.44.0' },
    { globalKey:'baziContextualForceInteractionAdapter', src:'./js/bazi-contextual-force-interaction-adapter.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartySource', src:'./js/bazi-contextual-force-party-source.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyAudit', src:'./js/bazi-contextual-force-party-audit.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyMembershipContract', src:'./js/bazi-contextual-force-party-membership-contract.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyMembershipProfile', src:'./js/bazi-contextual-force-party-membership-profile.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyMembership', src:'./js/bazi-contextual-force-party-membership.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyAffiliationContract', src:'./js/bazi-contextual-force-party-affiliation-contract.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyAffiliationProfile', src:'./js/bazi-contextual-force-party-affiliation-profile.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyAffiliation', src:'./js/bazi-contextual-force-party-affiliation.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyAffiliationExpansionSource', src:'./js/bazi-contextual-force-party-affiliation-expansion-source.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyAffiliationExpansionAudit', src:'./js/bazi-contextual-force-party-affiliation-expansion-audit.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyRelationEffectContract', src:'./js/bazi-contextual-force-party-relation-effect-contract.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyRelationEffectProfile', src:'./js/bazi-contextual-force-party-relation-effect-profile.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyRelationEffect', src:'./js/bazi-contextual-force-party-relation-effect.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyRelativeDominanceSource', src:'./js/bazi-contextual-force-party-relative-dominance-source.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyRelativeDominanceAudit', src:'./js/bazi-contextual-force-party-relative-dominance-audit.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartySideForceProfileContract', src:'./js/bazi-contextual-force-party-side-force-profile-contract.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartySideForceProfileProfile', src:'./js/bazi-contextual-force-party-side-force-profile-profile.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartySideForceProfile', src:'./js/bazi-contextual-force-party-side-force-profile.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyCounterContextContract', src:'./js/bazi-contextual-force-party-counter-context-contract.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyCounterContextProfile', src:'./js/bazi-contextual-force-party-counter-context-profile.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyCounterContext', src:'./js/bazi-contextual-force-party-counter-context.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyNonStemFoundationSource', src:'./js/bazi-contextual-force-party-nonstem-foundation-source.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyNonStemFoundationAudit', src:'./js/bazi-contextual-force-party-nonstem-foundation-audit.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyBranchSubstrateQualitySource', src:'./js/bazi-contextual-force-party-branch-substrate-quality-source.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyBranchSubstrateQualityAudit', src:'./js/bazi-contextual-force-party-branch-substrate-quality-audit.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyBranchSubstrateQualityInputAdapterContract', src:'./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-contract.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyBranchSubstrateQualityInputAdapterProfile', src:'./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-profile.js?v=13.44.0' },
    { globalKey:'baziBranchElementRelationInventory', src:'./js/bazi-branch-element-relation-inventory.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyBranchSubstrateQualityInputAdapter', src:'./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyRelationEffectGeneralizationSource', src:'./js/bazi-contextual-force-party-relation-effect-generalization-source.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyRelationEffectGeneralizationAudit', src:'./js/bazi-contextual-force-party-relation-effect-generalization-audit.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource', src:'./js/bazi-contextual-force-party-visible-edge-effect-type-authorization-source.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit', src:'./js/bazi-contextual-force-party-visible-edge-effect-type-authorization-audit.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyVisibleMotifE2ECalibrationSource', src:'./js/bazi-contextual-force-party-visible-motif-e2e-calibration-source.js?v=13.44.0' },
    { globalKey:'baziContextualForcePartyVisibleMotifE2ECalibrationAudit', src:'./js/bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js?v=13.44.0' }
]);

const forbiddenLoaderPatterns = Object.freeze([
    { label:'document.write', pattern:/\bdocument\.write\s*\(/ },
    { label:'script element creation', pattern:/createElement\s*\(\s*['"]script['"]\s*\)/ },
    { label:'dynamic script src assignment', pattern:/\.src\s*=\s*['"`][^'"`]*\.js/ }
]);

const errors = [];
for (const relative of migratedModules) {
    const source = read(relative);
    for (const rule of forbiddenLoaderPatterns) {
        if (rule.pattern.test(source)) {
            errors.push(`${relative}: migrated research module still contains ${rule.label}`);
        }
    }
}

const bootstrap = read('js/bazi-research-bootstrap.js');
let previousIndex = -1;
for (const dependency of explicitSegment) {
    const keyNeedle = `globalKey:'${dependency.globalKey}'`;
    const srcNeedle = `src:'${dependency.src}'`;
    const keyIndex = bootstrap.indexOf(keyNeedle);
    const srcIndex = bootstrap.indexOf(srcNeedle);
    if (keyIndex < 0 || srcIndex < 0) {
        errors.push(`bazi-research-bootstrap.js: missing explicit dependency ${dependency.globalKey}`);
        continue;
    }
    if (keyIndex <= previousIndex) {
        errors.push(`bazi-research-bootstrap.js: dependency order changed at ${dependency.globalKey}`);
    }
    previousIndex = keyIndex;
}

if (!bootstrap.includes("mode:'explicit-research-opt-in'")) {
    errors.push('bazi-research-bootstrap.js: research opt-in mode marker missing');
}

if (errors.length) {
    console.error('BaZi research loader boundary verification failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log('BaZi research loader boundary verification passed');
console.log(`- ${migratedModules.length} migrated module(s) are free of implicit script loaders`);
console.log(`- ${explicitSegment.length} dependency entries are explicit and ordered in the research bootstrap`);
