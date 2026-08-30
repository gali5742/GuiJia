import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256File = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const artifactPath = 'data/liuyao-semantic-routeability-v0.2.json';
const lockPath = 'data/liuyao-semantic-routeability-v0.2.lock.json';
const artifact = readJson(artifactPath);
const lock = readJson(lockPath);

assert(artifact.version === '0.2' && artifact.status === 'frozen' && artifact.scope === 'liuyao_semantic_routeability_v02', 'Routeability artifact contract mismatch');
assert(lock.version === '0.2' && lock.status === 'locked' && lock.artifact === artifactPath, 'Routeability lock contract mismatch');
assert(lock.artifactSha256 === sha256File(artifactPath), 'Routeability artifact SHA-256 mismatch');
assert(artifact.encoder?.revision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'Routeability encoder revision drift');
assert(artifact.encoder?.vectorSize === 512 && artifact.encoder?.dtype === 'q8' && artifact.encoder?.pooling === 'mean' && artifact.encoder?.normalize === true, 'Routeability encoder contract drift');
assert(Array.isArray(artifact.model?.weights) && artifact.model.weights.length === 512 && artifact.model.weights.every(Number.isFinite), 'Routeability weights invalid');
assert(Number.isFinite(artifact.model?.bias), 'Routeability bias invalid');
assert(Number.isFinite(artifact.calibration?.threshold) && artifact.calibration.threshold > 0 && artifact.calibration.threshold < 1, 'Routeability threshold invalid');
assert(artifact.calibration?.falseActivation <= 0.05 + 1e-12, `Routeability false activation ${artifact.calibration?.falseActivation} > 0.05`);
assert(artifact.calibration?.objective === 'maximize_known_recall_subject_to_false_activation_cap', 'Routeability calibration objective drift');
assert(artifact.contract?.validationUsedForTraining === false && artifact.contract?.blindUsedForTraining === false, 'Routeability training isolation contract drift');
assert(artifact.contract?.scopeGateWeightsReused === false, 'Routeability must not reuse Scope Gate weights');
assert(artifact.calibration?.byLabel?.route_known === 44 && artifact.calibration?.byLabel?.non_route === 66, 'Routeability fresh calibration count drift');
for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
  const stats = artifact.calibration?.bySubtype?.[subtype];
  assert(stats?.n === 22, `Routeability calibration subtype ${subtype} count drift`);
}

const forbiddenSource = /(validation|sealed-blind|blind-eval)/i;
for (const source of artifact.sources || []) {
  assert(!forbiddenSource.test(source.path), `forbidden Routeability model source: ${source.path}`);
  assert(source.sha256 === sha256File(source.path), `Routeability source SHA drift: ${source.path}`);
}
assert((artifact.sources || []).some((row) => row.path === 'data/liuyao-semantic-routeability-v0.2-development.json'), 'fresh Routeability development source missing');
assert((artifact.sources || []).some((row) => row.path === 'js/liuyao-semantic-routeability-v02.js'), 'Routeability algorithm source missing');

const loader = fs.readFileSync(path.join(root, 'js/liuyao-semantic-routeability-frozen-v02.js'), 'utf8');
for (const forbidden of ['.train(', '.calibrate(', 'semanticScopeGateV01', '0.4196']) {
  assert(!loader.includes(forbidden), `Frozen Routeability loader contains forbidden runtime operation/token: ${forbidden}`);
}
assert(loader.includes('scoreFrozenRouteabilityVector') && loader.includes('loadFrozenRouteabilityV02'), 'Frozen Routeability loader API missing');

console.log('LiuYao Semantic Routeability v0.2 frozen artifact verified.');
console.log(`- training: ${artifact.training.total} (${artifact.training.byLabel.route_known} known / ${artifact.training.byLabel.non_route} non-route)`);
console.log(`- calibration: 110 (44 known / 66 non-route)`);
console.log(`- threshold: ${artifact.calibration.threshold}`);
console.log(`- known recall: ${artifact.calibration.knownRecall}`);
console.log(`- false activation: ${artifact.calibration.falseActivation}`);
console.log(`- artifact SHA-256: ${lock.artifactSha256}`);
