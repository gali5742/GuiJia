import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsPath = path.join(root, 'js/liuyao-semantic-router-poc-v081.js');
const htmlPath = path.join(root, 'semantic-router-poc-v081.html');

const fail = (message) => { throw new Error(message); };
if (!fs.existsSync(jsPath)) fail('Missing v0.8.1 router JS');
if (!fs.existsSync(htmlPath)) fail('Missing v0.8.1 router page');

const source = fs.readFileSync(jsPath, 'utf8');
const html = fs.readFileSync(htmlPath, 'utf8');

const requiredDataRefs = [
  'liuyao-semantic-route-training-v0.1.json',
  'liuyao-semantic-route-training-v0.2-augmentation.json',
  'liuyao-semantic-route-training-v0.3-targeted.json',
  'liuyao-semantic-route-training-v0.4-expansion.json',
  'liuyao-semantic-route-training-v0.4-expansion-label-patch.json',
  'liuyao-semantic-route-training-v0.5-targeted-22.json',
  'liuyao-semantic-route-inventory-v0.2.json'
];
for (const ref of requiredDataRefs) {
  if (!source.includes(ref)) fail(`v0.8.1 missing inherited data ref: ${ref}`);
}

const trainingRefs = [...source.matchAll(/liuyao-semantic-route-training-v[^'"`]+\.json/g)].map((match) => match[0]);
const unexpectedTrainingRefs = [...new Set(trainingRefs)].filter((ref) => !requiredDataRefs.includes(ref));
if (unexpectedTrainingRefs.length) fail(`v0.8.1 must not add corpus files: ${unexpectedTrainingRefs.join(', ')}`);

for (const marker of [
  'buildBalancedClassWeights',
  'trainBalancedMultinomialRouteHead',
  "if (trainRows[i].label !== '__other__') routeTrainIndexes.push(i)",
  'routeTrainRows = routeTrainIndexes.map',
  'routeTrainVectors = routeTrainIndexes.map',
  "version:'0.8.1'"
]) {
  if (!source.includes(marker)) fail(`v0.8.1 implementation marker missing: ${marker}`);
}

if (source.includes('TRAIN_V081') || source.includes('training-v0.6')) fail('v0.8.1 unexpectedly references new training corpus');
if (!html.includes('不新增任何语料')) fail('v0.8.1 page must state no-new-corpus constraint');
if (!html.includes('class-balanced')) fail('v0.8.1 page must state balanced route-head experiment');
if (!html.includes('liuyao-semantic-router-poc-v081.js')) fail('v0.8.1 page does not load v0.8.1 JS');

console.log('LiuYao Semantic Router v0.8.1 experiment verifier passed');
console.log('- corpus: identical to v0.8');
console.log('- route head: contrastive-known included');
console.log('- route head loss: class-balanced');
