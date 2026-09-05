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
    'js/bazi-branch-element-relation-inventory.js',
    'js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js',
    'js/bazi-contextual-force-party-relation-effect-generalization-audit.js',
    'js/bazi-contextual-force-party-visible-edge-effect-type-authorization-audit.js',
    'js/bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js',
    'js/bazi-contextual-force-party-collective-target-semantics-audit.js',
    'js/bazi-contextual-force-party-relation-target-semantic-level-contract-audit.js',
    'js/bazi-contextual-force-party-curated-relation-source-semantic-annotation-audit.js',
    'js/bazi-contextual-force-party-relation-semantics-modern-support-audit.js',
    'js/bazi-contextual-force-party-relation-position-provenance-audit.js',
    'js/bazi-contextual-force-party-competing-relation-path-audit.js'
]);

const bootstrap = read('js/bazi-research-bootstrap.js');
const dependencyPattern = /Object\.freeze\(\{\s*globalKey:'([^']+)',\s*src:'([^']+)'\s*\}\)/g;
const bootstrapDependencies = Object.freeze([...bootstrap.matchAll(dependencyPattern)].map((match) => Object.freeze({
    globalKey:match[1],
    src:match[2]
})));
const closureStartGlobalKey = 'baziClashRescueContext';
const closureStartIndex = bootstrapDependencies.findIndex((item) => item.globalKey === closureStartGlobalKey);
const explicitDependencies = Object.freeze(closureStartIndex >= 0 ? bootstrapDependencies.slice(closureStartIndex) : []);
const explicitModulePaths = Object.freeze(explicitDependencies.map(({ src }) => src.replace(/^\.\//, '').replace(/\?.*$/, '')));

const forbiddenLoaderPatterns = Object.freeze([
    { label:'document.write', pattern:/\bdocument\.write\s*\(/ },
    { label:'script element creation', pattern:/createElement\s*\(\s*['"]script['"]\s*\)/ },
    { label:'dynamic script src assignment', pattern:/\.src\s*=\s*['"`][^'"`]*\.js/ }
]);

const errors = [];
if (!bootstrapDependencies.length) {
    errors.push('bazi-research-bootstrap.js: no dependencies could be parsed');
}
if (closureStartIndex < 0) {
    errors.push(`bazi-research-bootstrap.js: sealed closure start ${closureStartGlobalKey} is missing`);
}

const allGlobalKeys = bootstrapDependencies.map((item) => item.globalKey);
const allModulePaths = bootstrapDependencies.map(({ src }) => src.replace(/^\.\//, '').replace(/\?.*$/, ''));
const duplicateGlobalKeys = allGlobalKeys.filter((key, index) => allGlobalKeys.indexOf(key) !== index);
const duplicateModulePaths = allModulePaths.filter((modulePath, index) => allModulePaths.indexOf(modulePath) !== index);
if (duplicateGlobalKeys.length) errors.push(`bazi-research-bootstrap.js: duplicate globalKey(s): ${[...new Set(duplicateGlobalKeys)].join(', ')}`);
if (duplicateModulePaths.length) errors.push(`bazi-research-bootstrap.js: duplicate dependency module(s): ${[...new Set(duplicateModulePaths)].join(', ')}`);

const explicitModulePathSet = new Set(explicitModulePaths);
for (const relative of migratedModules) {
    if (!explicitModulePathSet.has(relative)) {
        errors.push(`${relative}: migrated research module is missing from the explicit bootstrap closure`);
    }
}

for (const relative of explicitModulePaths) {
    const fullPath = path.join(root, relative);
    if (!fs.existsSync(fullPath)) {
        errors.push(`${relative}: explicit research dependency file is missing`);
        continue;
    }
    const source = fs.readFileSync(fullPath, 'utf8');
    for (const rule of forbiddenLoaderPatterns) {
        if (rule.pattern.test(source)) {
            errors.push(`${relative}: explicit research dependency still contains ${rule.label}`);
        }
    }
}

if (!bootstrap.includes("mode:'explicit-research-opt-in'")) {
    errors.push('bazi-research-bootstrap.js: research opt-in mode marker missing');
}
if (!bootstrap.includes("const VERSION = '0.20'")) {
    errors.push('bazi-research-bootstrap.js: expected research bootstrap v0.20');
}

const requiredTail = Object.freeze([
    'js/bazi-contextual-force-party-curated-relation-source-semantic-annotation-audit.js',
    'js/bazi-contextual-force-party-hidden-single-target-binding-contract.js',
    'js/bazi-contextual-force-party-hidden-single-target-binding-profile.js',
    'js/bazi-contextual-force-party-hidden-single-target-binding.js',
    'js/bazi-contextual-force-party-actor-group-identity-contract.js',
    'js/bazi-contextual-force-party-actor-group-identity-profile.js',
    'js/bazi-contextual-force-party-actor-group-identity.js',
    'js/bazi-contextual-force-party-curated-target-resolver-contract.js',
    'js/bazi-contextual-force-party-curated-target-resolver-profile.js',
    'js/bazi-contextual-force-party-curated-target-resolver.js',
    'js/bazi-contextual-force-party-collective-relation-effect-contract.js',
    'js/bazi-contextual-force-party-collective-relation-effect-profile.js',
    'js/bazi-contextual-force-party-collective-relation-effect.js',
    'js/bazi-contextual-force-party-relation-semantics-modern-support-source.js',
    'js/bazi-contextual-force-party-relation-semantics-modern-support-audit.js',
    'js/bazi-contextual-force-party-relation-position-provenance-source.js',
    'js/bazi-contextual-force-party-relation-position-provenance-audit.js',
    'js/bazi-contextual-force-party-competing-relation-path-source.js',
    'js/bazi-contextual-force-party-competing-relation-path-audit.js'
]);
let previousTailIndex = -1;
for (const relative of requiredTail) {
    const index = explicitModulePaths.indexOf(relative);
    if (index < 0) {
        errors.push(`bazi-research-bootstrap.js: missing required tail dependency ${relative}`);
        continue;
    }
    if (index <= previousTailIndex) {
        errors.push(`bazi-research-bootstrap.js: research tail order changed at ${relative}`);
    }
    previousTailIndex = index;
}

if (errors.length) {
    console.error('BaZi research loader boundary verification failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log('BaZi research loader boundary verification passed');
console.log(`- sealed closure starts at ${closureStartGlobalKey}`);
console.log(`- ${migratedModules.length} migrated module(s) remain inside the explicit bootstrap closure`);
console.log(`- ${explicitModulePaths.length} explicit dependency module(s) are free of implicit script loaders`);
console.log(`- ${explicitDependencies.length} dependency entries are explicit and ordered in the sealed research closure`);
