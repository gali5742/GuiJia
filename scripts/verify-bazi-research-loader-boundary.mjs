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
    'js/bazi-contextual-force-party-membership.js'
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
    { globalKey:'baziContextualForcePartyAffiliation', src:'./js/bazi-contextual-force-party-affiliation.js?v=13.44.0' }
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
