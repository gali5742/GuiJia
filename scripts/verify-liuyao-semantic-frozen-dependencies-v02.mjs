import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256File = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const artifactPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.json';
const lockPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.lock.json';
const executionPath = 'data/liuyao-semantic-embedding-execution-contract-v0.1.json';
const legacyPath = 'data/liuyao-semantic-frozen-dependencies-v0.1.json';
assert(fs.existsSync(path.join(root, artifactPath)), 'corrected semantic dependency artifact missing');
assert(fs.existsSync(path.join(root, lockPath)), 'corrected semantic dependency lock missing');

const artifact = readJson(artifactPath);
const lock = readJson(lockPath);
const legacy = readJson(legacyPath);
const execution = readJson(executionPath);

assert(artifact.version === '0.2' && artifact.status === 'frozen_representation_corrected', 'corrected dependency artifact contract drift');
assert(artifact.scope === 'liuyao_semantic_v013_dependencies', 'corrected dependency scope drift');
assert(lock.version === '0.2' && lock.status === 'locked_representation_corrected', 'corrected dependency lock contract drift');
assert(lock.artifactSha256 === sha256File(artifactPath), 'corrected dependency artifact SHA drift');
assert(lock.executionContractSha256 === sha256File(executionPath), 'embedding execution contract SHA drift');
assert(execution.canonicalInvocation?.textsPerEncoderCall === 1, 'canonical embedding execution is not single-text');
assert(artifact.representationCorrection?.executionContract?.sha256 === sha256File(executionPath), 'artifact execution-contract provenance drift');
assert(artifact.representationCorrection?.textsPerEncoderCall === 1 && artifact.encoder?.textsPerEncoderCall === 1, 'corrected artifact must use single-text embedding');
assert(artifact.representationCorrection?.legacyArtifact === legacyPath && artifact.representationCorrection?.legacyArtifactMutated === false, 'legacy artifact provenance drift');
assert(artifact.representationCorrection?.freshGeneralizationClaim === false, 'representation correction must not claim fresh generalization');

assert(artifact.encoder?.revision === execution.encoder.revision, 'encoder revision drift');
assert(artifact.encoder?.dtype === 'q8' && artifact.encoder?.vectorSize === 512 && artifact.encoder?.pooling === 'mean' && artifact.encoder?.normalize === true, 'corrected encoder settings drift');
assert(artifact.router?.routeOrder?.length === 22, 'corrected Router route count drift');
assert(artifact.router?.routeHead?.weights?.length === 22 && artifact.router.routeHead.weights.every((row) => row.length === 512), 'corrected Router weight shape drift');
assert(artifact.router?.routeHead?.biases?.length === 22, 'corrected Router bias shape drift');
assert(artifact.scopeGate?.gate?.weights?.length === 512 && Number.isFinite(artifact.scopeGate?.gate?.bias), 'corrected Scope Gate shape drift');
assert(Number.isFinite(artifact.scopeGate?.originalThreshold), 'corrected Scope original threshold missing');
assert(artifact.router?.generationValidation?.evidenceStatus === 'development_reprocessed_not_fresh', 'Router corrected validation must remain non-fresh evidence');
assert(artifact.scopeGate?.generationCalibration?.evidenceStatus === 'development_reprocessed_not_fresh', 'Scope corrected calibration must remain non-fresh evidence');

assert(artifact.semanticStackPolicy?.legacyHardVetoCutoff === 0.4196, 'legacy hard veto provenance drift');
assert(artifact.semanticStackPolicy?.legacyHardVetoTransferStatus === 'requires_candidate_revalidation_before_use', 'legacy hard veto must not silently transfer');
assert(lock.legacyHardVetoTransferStatus === 'requires_candidate_revalidation_before_use', 'lock hard-veto transfer status drift');

const sameRouter = JSON.stringify(artifact.router.routeHead.weights) === JSON.stringify(legacy.router.routeHead.weights)
  && JSON.stringify(artifact.router.routeHead.biases) === JSON.stringify(legacy.router.routeHead.biases);
const sameScope = JSON.stringify(artifact.scopeGate.gate.weights) === JSON.stringify(legacy.scopeGate.gate.weights)
  && artifact.scopeGate.gate.bias === legacy.scopeGate.gate.bias;
assert(!sameRouter, 'corrected Router unexpectedly bit-identical to legacy batched Router');
assert(!sameScope, 'corrected Scope unexpectedly bit-identical to legacy batched Scope');

const generatorSource = fs.readFileSync(path.join(root, 'scripts/generate-liuyao-semantic-frozen-dependencies-v02.mjs'), 'utf8');
assert(generatorSource.includes("chunkSize=1"), 'corrected dependency generator missing single-text patch');
assert(!generatorSource.includes("status:'frozen'"), 'corrected generator must not masquerade as legacy v0.1 status');
const runtimeSource = fs.readFileSync(path.join(root, 'js/liuyao-semantic-frozen-dependencies-v02.js'), 'utf8');
assert(runtimeSource.includes('extractor(String(text || \'\')'), 'corrected runtime must embed one text at a time');
assert(!runtimeSource.includes('legacyHardVetoUsable:true'), 'corrected runtime must not auto-enable legacy hard veto');
assert(!/\.train\s*\(/.test(runtimeSource) && !/calibrat/i.test(runtimeSource.replaceAll('legacyHardVetoTransferStatus','')), 'corrected runtime must remain load/score only');

console.log('LiuYao representation-corrected semantic dependencies v0.2 verified.');
console.log('- Router and Scope: retrained under canonical single-text BGE embeddings');
console.log('- historical algorithms/data preserved; representation execution only changed');
console.log('- legacy Scope hard veto 0.4196 is provenance-only until candidate revalidation');
console.log(`- artifact SHA-256: ${lock.artifactSha256}`);
