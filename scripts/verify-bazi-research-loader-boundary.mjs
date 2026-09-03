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
    'js/bazi-visible-stem-directed-function.js'
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
    { globalKey:'baziVisibleStemFunctionCoverage', src:'./js/bazi-visible-stem-function-coverage.js?v=13.44.0' }
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
