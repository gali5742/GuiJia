import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = 'data/liuyao-semantic-v013-candidate-v03-development.json';
const lockFile = 'data/liuyao-semantic-v013-candidate-v03-development.lock.json';
const modelLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-model.lock.json';
const frozenLockPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.lock.json';
const contractPath = 'data/liuyao-semantic-v013-candidate-v03-development-execution-v0.1-contract.json';
const patchPath = 'scripts/apply-liuyao-semantic-v013-candidate-v03-development-preseal-patch.mjs';
const executionCorrectionPath = 'scripts/apply-liuyao-semantic-v013-candidate-v03-development-execution-v01-preseal-correction.mjs';
const runtimeLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-calibration-runtime.lock.json';
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = read(relative);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
};
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const data = readJson(file);
const modelLock = readJson(modelLockPath);
const frozenLock = readJson(frozenLockPath);
const contract = readJson(contractPath);
const runtimeLock = readJson(runtimeLockPath);
assert(data.version === '0.13-candidate-v0.3-development-v0.1', `development version drift: ${data.version}`);
assert(['generated_preseal','sealed_development_eval'].includes(data.status), `unexpected development status: ${data.status}`);
assert(data.scope === 'liuyao_semantic_decision_stack_v0.13_candidate_v0.3', 'development scope drift');
assert(data.createdAfterFallbackIdentityModelLock === true, 'development data must be created after corrected Fallback model lock');
assert(data.policy?.useForTraining === false, 'development data must never train');
assert(data.policy?.useForThresholdCalibration === false, 'development data must never calibrate threshold');
assert(data.policy?.useForIndependentEvaluation === false, 'development data must not be reused as independent');
assert(data.policy?.candidateV02IndependentReuse === false, 'Candidate v0.2 independent reuse forbidden');
assert(data.policy?.traditionalLiuYaoFeaturesForbidden === true, 'traditional feature boundary drift');
assert(data.policy?.healthDiseaseDivinationRowsForbidden === true, 'health/disease policy boundary drift');
assert(data.fallbackIdentityModelLock?.path === modelLockPath, 'development data does not bind corrected Fallback model lock');
assert(data.fallbackIdentityModelLock?.sha256 === sha256(modelLockPath), 'corrected Fallback model lock SHA drift');
assert(data.fallbackIdentityModelLock?.artifactSha256 === modelLock.artifactSha256, 'corrected Fallback artifact binding drift');
assert(data.executionCorrection?.contractPath === contractPath, 'development execution contract path drift');
assert(data.executionCorrection?.contractSha256 === sha256(contractPath), 'development execution contract SHA drift');
assert(data.executionCorrection?.independentEvaluationDataRead === false, 'independent evaluation data was read during development generation');
assert(data.executionCorrection?.encoderScoringPerformed === false, 'development generation unexpectedly performed encoder scoring');
assert(contract.status === 'locked_before_first_corrected_development_encoder_scoring', 'development correction contract not locked');
assert(gitBlobSha(contract.freshDevelopment.baseGenerator.path) === contract.freshDevelopment.baseGenerator.gitBlobSha, 'base development generator blob drift');
assert(patchPath === contract.freshDevelopment.presealPatch.path, 'preseal patch path drift');
assert(gitBlobSha(patchPath) === contract.freshDevelopment.presealPatch.gitBlobSha, 'preseal patch blob drift');
assert(data.presealPatch?.rowsPatched === contract.freshDevelopment.presealPatch.expectedRowsPatched, `preseal patched rows ${data.presealPatch?.rowsPatched}`);
assert(data.presealPatch?.modelOrThresholdChanged === false, 'preseal patch changed model/threshold');
assert(contract.freshDevelopment.executionPresealCorrection?.path === executionCorrectionPath, 'execution preseal correction path drift');
assert(gitBlobSha(executionCorrectionPath) === contract.freshDevelopment.executionPresealCorrection.gitBlobSha, 'execution preseal correction blob drift');
assert(data.executionPresealCorrection?.version === 'execution-v0.1', 'execution preseal correction metadata missing');
assert(data.executionPresealCorrection?.targetId === 'V013-V03-D-089', 'execution preseal correction target metadata drift');
assert(data.executionPresealCorrection?.expectedRoute === 'financial_fortune' && data.executionPresealCorrection?.expectedCandidatePath === 'fallback_head', 'execution preseal correction route/path metadata drift');
assert(data.executionPresealCorrection?.encoderScoringObserved === false && data.executionPresealCorrection?.independentEvaluationRead === false, 'execution preseal correction used forbidden evidence');
assert(data.executionPresealCorrection?.labelChanged === false && data.executionPresealCorrection?.modelOrThresholdChanged === false && data.executionPresealCorrection?.verifierWeakened === false, 'execution preseal correction changed protected semantics');
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) assert(gitBlobSha(relative) === runtimeLock.modules?.[relative], `development path-contract module blob drift: ${relative}`);
assert(modelLock.status === 'locked' && modelLock.canonicalTextsPerEncoderCall === 1, 'corrected Fallback lock invalid');
assert(modelLock.routeabilityThreshold === 0.7678148573595883, 'corrected Routeability threshold drift');
assert(modelLock.scopeHardVetoCutoff === 0.4319473801404805, 'corrected Scope cutoff drift');
assert(modelLock.globalThreshold === 0.5571407097788003, 'corrected Fallback threshold drift');
assert(frozenLock.artifactSha256 === '58bf137a7de167e2e71baffa474e8eed7d92ea11fd6ad6460b66591ad52441e9', 'corrected dependency artifact drift');
if (data.status === 'generated_preseal') {
  assert(data.sealed === false, 'preseal development data unexpectedly sealed');
  assert(data.policy.sealedBeforeFirstDevelopmentEncoderScoring === false, 'preseal policy must remain false');
} else {
  assert(data.sealed === true, 'sealed development data missing sealed=true');
  assert(data.policy.sealedBeforeFirstDevelopmentEncoderScoring === true, 'sealed-before-scoring policy missing');
  assert(fs.existsSync(path.join(root, lockFile)), 'sealed development lock missing');
  const lock = readJson(lockFile);
  assert(lock.version === '0.13-candidate-v0.3-development-lock-execution-v0.1', `development lock version drift: ${lock.version}`);
  assert(lock.status === 'locked', 'development lock not locked');
  assert(lock.artifact === file && lock.artifactSha256 === sha256(file), 'development artifact lock mismatch');
  assert(lock.rowCount === 198, `development lock row count ${lock.rowCount}`);
  assert(lock.correctedFallbackIdentityModelLock?.artifactSha256 === modelLock.artifactSha256, 'lock corrected Fallback artifact mismatch');
  assert(lock.correctedFrozenDependenciesLock?.artifactSha256 === frozenLock.artifactSha256, 'lock corrected dependencies mismatch');
  assert(lock.sealedBeforeFirstDevelopmentEncoderScoring === true, 'lock missing sealed-before-scoring');
  assert(lock.independentEvaluationDataReadBeforeSeal === false, 'lock indicates independent evaluation read before seal');
  assert(lock.canonicalTextsPerEncoderCall === 1, 'lock execution shape drift');
  assert(lock.routeabilityThreshold === modelLock.routeabilityThreshold, 'lock Routeability threshold mismatch');
  assert(lock.scopeHardVetoCutoff === modelLock.scopeHardVetoCutoff, 'lock Scope cutoff mismatch');
  assert(lock.fallbackIdentityGlobalThreshold === modelLock.globalThreshold, 'lock Fallback threshold mismatch');
}

const expectedCounts = {
  total:198, route_known:132, non_route:66,
  strong_arbitration:44, support_arbitration:44, fallback_head:44,
  outside_current_22:22, route_unresolved:22, near_domain_not_current_route:22
};
for (const [key, expected] of Object.entries(expectedCounts)) assert(data.counts?.[key] === expected, `count ${key}=${data.counts?.[key]} expected ${expected}`);
assert(Array.isArray(data.rows) && data.rows.length === 198, `development rows=${data.rows?.length}`);

const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = new Set((inventory.routes || []).map((row) => row.routeId));
assert(routeIds.size === 22, `route inventory size ${routeIds.size} != 22`);
const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(read(relative).toString('utf8'), context, { filename:relative });
const extractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(extractor?.extract && arbitration?.arbitrate, 'Candidate v0.3 path modules failed to load');

const traditionalTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const healthTerms = ['疾病','病情','生病','健康占','手术结果','疗效','药效','治好','康复','癌','住院'];
const seenIds = new Set();
const seenTexts = new Map();
const actualPathCounts = { strong_arbitration:0, support_arbitration:0, fallback_head:0 };
const actualSubtypeCounts = { outside_current_22:0, route_unresolved:0, near_domain_not_current_route:0 };
const knownRouteCoverage = new Map();
const pathMismatches = [];
for (const row of data.rows) {
  assert(/^V013-V03-D-\d{3}$/.test(row.id), `invalid development id ${row.id}`);
  assert(!seenIds.has(row.id), `duplicate development id ${row.id}`); seenIds.add(row.id);
  const normalized = normalize(row.text);
  assert(normalized.length >= 4, `too-short development text ${row.id}`);
  assert(!seenTexts.has(normalized), `internal duplicate ${row.id}/${seenTexts.get(normalized)}`); seenTexts.set(normalized, row.id);
  for (const term of traditionalTerms) assert(!normalized.includes(term), `traditional terminology leaked ${row.id}: ${term}`);
  for (const term of healthTerms) assert(!normalized.includes(term), `health/disease sample leaked ${row.id}: ${term}`);
  if (row.expectedDisposition === 'route_known') {
    assert(routeIds.has(row.expectedRoute), `${row.id} unknown expectedRoute ${row.expectedRoute}`);
    assert(Object.hasOwn(actualPathCounts, row.expectedCandidatePath), `${row.id} invalid candidate path`);
    actualPathCounts[row.expectedCandidatePath] += 1;
    knownRouteCoverage.set(row.expectedRoute, (knownRouteCoverage.get(row.expectedRoute) || 0) + 1);
    const evidence = extractor.extract(row.text);
    assert((evidence.unsupportedTargets || []).length === 0, `${row.id} known row contains unsupported target`);
    const result = arbitration.arbitrate(row.text, evidence);
    const matches = row.expectedCandidatePath === 'strong_arbitration'
      ? result?.strength === 'strong' && result.routeId === row.expectedRoute
      : row.expectedCandidatePath === 'support_arbitration'
        ? result?.strength === 'support' && result.routeId === row.expectedRoute
        : result == null;
    if (!matches) pathMismatches.push({ id:row.id, path:row.expectedCandidatePath, expectedRoute:row.expectedRoute, actual:result, text:row.text });
  } else {
    assert(row.expectedDisposition === 'non_route', `${row.id} invalid disposition`);
    assert(row.expectedRoute == null && row.expectedCandidatePath == null, `${row.id} non-route carries route/path`);
    assert(Object.hasOwn(actualSubtypeCounts, row.nonRouteSubtype), `${row.id} invalid subtype ${row.nonRouteSubtype}`);
    actualSubtypeCounts[row.nonRouteSubtype] += 1;
  }
}
assert(pathMismatches.length === 0, `Candidate v0.3 path mismatches (${pathMismatches.length}): ${pathMismatches.slice(0,10).map((x)=>`${x.id}:${JSON.stringify(x.actual)}`).join(' | ')}`);
for (const [key, expected] of Object.entries({ strong_arbitration:44, support_arbitration:44, fallback_head:44 })) assert(actualPathCounts[key] === expected, `path count ${key}=${actualPathCounts[key]}`);
for (const [key, expected] of Object.entries({ outside_current_22:22, route_unresolved:22, near_domain_not_current_route:22 })) assert(actualSubtypeCounts[key] === expected, `subtype count ${key}=${actualSubtypeCounts[key]}`);
for (const routeId of routeIds) assert((knownRouteCoverage.get(routeId) || 0) >= 2, `development coverage too small for ${routeId}`);

// Corpus-isolation audit intentionally reads only training/calibration/development corpora.
// Sealed blind and independent-eval files are excluded so Phase C does not inspect post-lock evidence.
const priorFiles = [
  'data/liuyao-semantic-route-training-v0.1.json',
  'data/liuyao-semantic-route-training-v0.2-augmentation.json',
  'data/liuyao-semantic-route-training-v0.3-targeted.json',
  'data/liuyao-semantic-route-training-v0.4-expansion.json',
  'data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json',
  'data/liuyao-semantic-route-training-v0.5-targeted-22.json',
  'data/liuyao-semantic-routeability-v0.2-development.json',
  'data/liuyao-semantic-routeability-v0.3-calibration.json',
  'data/liuyao-semantic-fallback-identity-v0.1-training.json',
  'data/liuyao-semantic-fallback-identity-v0.1-calibration.json',
  'data/liuyao-semantic-decision-stack-v0.10-development.json',
  'data/liuyao-semantic-decision-stack-v0.11-development.json',
  'data/liuyao-semantic-decision-stack-v0.12-development.json',
  'data/liuyao-semantic-decision-stack-v0.13-development.json'
];
assert(priorFiles.every((name) => !name.includes('independent') && !name.includes('sealed-blind')), 'forbidden post-lock evidence source in overlap audit');
const priorStrings = new Map();
const collect = (value, source) => {
  if (typeof value === 'string') {
    const normalized = normalize(value);
    if (normalized.length >= 4 && /[\u3400-\u9fff]/.test(normalized) && !priorStrings.has(normalized)) priorStrings.set(normalized, source);
    return;
  }
  if (Array.isArray(value)) { value.forEach((item) => collect(item, source)); return; }
  if (value && typeof value === 'object') Object.values(value).forEach((item) => collect(item, source));
};
for (const prior of priorFiles) collect(readJson(prior), prior);
const overlaps = data.rows.map((row) => ({ row, prior:priorStrings.get(normalize(row.text)) })).filter((item) => item.prior);
assert(overlaps.length === 0, `exact normalized overlap with allowed prior corpora: ${overlaps.slice(0,12).map((x)=>`${x.row.id}->${x.prior}`).join(' | ')}`);

console.log('Corrected Candidate v0.3 fresh development data verified.');
console.log(`- status: ${data.status}`);
console.log('- rows: 198 (132 known / 66 non-route)');
console.log('- paths: 44 strong / 44 support / 44 fallback');
console.log('- non-route: 22 outside / 22 unresolved / 22 near-domain');
console.log(`- current22 routes covered: ${knownRouteCoverage.size}/22`);
console.log(`- allowed prior corpora audited: ${priorFiles.length}; independent/blind corpora read: 0`);
console.log(`- SHA-256: ${sha256(file)}`);
