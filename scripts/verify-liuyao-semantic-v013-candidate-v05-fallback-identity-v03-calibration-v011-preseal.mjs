import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'data')
const read = (relative) => fs.readFileSync(path.join(root, relative))
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'))
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex')
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '').replace(/[，。！？、；：,.!?;:（）()“”‘’"']/g, '')
const grams = (value, n = 3) => { const text = normalize(value); const set = new Set(); if (text.length < n) { if (text) set.add(text); return set } for (let i = 0; i <= text.length - n; i += 1) set.add(text.slice(i, i + n)); return set }
const jaccard = (a, b) => { const A = grams(a); const B = grams(b); let intersection = 0; for (const token of A) if (B.has(token)) intersection += 1; const union = A.size + B.size - intersection; return union ? intersection / union : 0 }

const contractPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v011-data-contract-v0.1.json'
const methodologyPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-methodology-v0.1.json'
const calibrationPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v0.1.1.json'
const lockPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v0.1.1.lock.json'
const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v011.mjs'
const verifierPath = 'scripts/verify-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v011-preseal.mjs'
const sealerPath = 'scripts/seal-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v011.mjs'

const contract = readJson(contractPath)
const methodology = readJson(methodologyPath)
const calibration = readJson(calibrationPath)
const routeIds = methodology.training.classOrder
const routeSet = new Set(routeIds)
assert(contract.status === 'frozen_before_calibration_v011_generation_or_encoder_scoring', 'replacement contract status drift')
assert(routeIds.length === 22 && routeSet.size === 22, 'methodology route order drift')
assert(calibration.version === '0.13-candidate-v0.5-fallback-identity-v0.3-calibration-v0.1.1', 'calibration version drift')
assert(['presealed_fallback_identity_v03_calibration_v011', 'sealed_fallback_identity_v03_calibration_v011'].includes(calibration.status), `calibration status ${calibration.status}`)
assert(calibration.sealed === (calibration.status === 'sealed_fallback_identity_v03_calibration_v011'), 'sealed/status mismatch')
assert(calibration.replacementContract === contractPath && calibration.methodology === methodologyPath, 'contract/methodology pointer drift')

for (const [field, expected] of Object.entries({
  encoderScoringObserved: false,
  semanticActProbabilityUsedForGeneration: false,
  routeabilityProbabilityUsedForGeneration: false,
  fallbackProbabilityUsedForGeneration: false,
  failedCalibrationV01ArtifactReadForGeneration: false,
  failedReachabilityReportReadForGeneration: false,
  officialV04IndependentRowsReadForGeneration: false,
  rowLevelEvaluationResultsReadForGeneration: false,
  sealedBlindEvaluationRead: false,
  carriedTrainingReadForGeneration: false
})) assert(calibration.policy?.[field] === expected, `generation policy drift ${field}`)

const rows = calibration.rows || []
assert(rows.length === 880, `rows ${rows.length} !=880`)
const known = rows.filter((r) => r.identityLabel === 'route_identity_positive')
const nonRoute = rows.filter((r) => r.identityLabel === 'non_route')
assert(known.length === 264, `known ${known.length} !=264`)
assert(nonRoute.length === 616, `nonroute ${nonRoute.length} !=616`)
assert(rows.filter((r) => r.subtype === 'near_domain_not_current_route').length === 440, 'near-domain !=440')
assert(rows.filter((r) => r.subtype === 'outside_current_22').length === 132, 'outside-current22 !=132')
assert(rows.filter((r) => r.subtype === 'route_unresolved').length === 44, 'route-unresolved !=44')
for (const routeId of routeIds) {
  assert(known.filter((r) => r.expectedRoute === routeId).length === 12, `${routeId} known count !=12`)
  assert(rows.filter((r) => r.subtype === 'near_domain_not_current_route' && r.pressureFamily === routeId).length === 20, `${routeId} near-domain pressure count !=20`)
}
const outsideFamilies = new Set(rows.filter((r) => r.subtype === 'outside_current_22').map((r) => r.pressureFamily))
assert(outsideFamilies.size === 11, `outside theme count ${outsideFamilies.size} !=11`)
for (const family of outsideFamilies) assert(rows.filter((r) => r.subtype === 'outside_current_22' && r.pressureFamily === family).length === 12, `${family} outside count !=12`)

const exact = new Map()
for (const row of rows) {
  const text = normalize(row.text)
  assert(text.length >= 8, `too-short ${row.id}`)
  assert(!exact.has(text), `normalized exact duplicate ${row.id}/${exact.get(text)}`)
  exact.set(text, row.id)
  assert(typeof row.semanticAxis === 'string' && row.semanticAxis, `missing semanticAxis ${row.id}`)
  assert(typeof row.wordingPattern === 'string' && row.wordingPattern, `missing wordingPattern ${row.id}`)
  if (row.identityLabel === 'route_identity_positive') assert(routeSet.has(row.expectedRoute) && row.subtype === 'fallback_stage_known', `known label drift ${row.id}`)
  else assert(row.expectedRoute == null && ['near_domain_not_current_route', 'outside_current_22', 'route_unresolved'].includes(row.subtype), `non-route label drift ${row.id}`)
  for (const term of ['妻财', '官鬼', '父母爻', '兄弟爻', '子孙爻', '世爻', '应爻', '用神']) assert(!text.includes(term), `traditional LiuYao term ${row.id}/${term}`)
  for (const term of ['疾病', '病情', '健康占', '手术结果', '疗效', '药效', '康复', '诊断结果', '检查结果']) assert(!text.includes(term), `health-policy term ${row.id}/${term}`)
}

const internalNear = []
const internalLimit = contract.presealRules.internalNormalizedTrigramJaccardUpperBound
for (let i = 0; i < rows.length; i += 1) for (let j = i + 1; j < rows.length; j += 1) {
  const similarity = jaccard(rows[i].text, rows[j].text)
  if (similarity >= internalLimit) internalNear.push({ a: rows[i].id, b: rows[j].id, similarity })
}
assert(internalNear.length === 0, `internal near duplicates >=${internalLimit} (${internalNear.length}): ${JSON.stringify(internalNear.slice(0, 40))}`)

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number, RegExp, String }
context.window = context
context.globalThis = context
vm.createContext(context)
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(read(relative).toString('utf8'), context, { filename: relative })
const extractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV03
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012
assert(extractor?.extract && arbitration?.arbitrate, 'deterministic modules failed to load')
const deterministicFailures = []
for (const row of rows) {
  const evidence = extractor.extract(row.text)
  const unsupported = evidence.unsupportedTargets || []
  const arb = arbitration.arbitrate(row.text, evidence)
  if (unsupported.length || arb != null) deterministicFailures.push({ id: row.id, subtype: row.subtype, expectedRoute: row.expectedRoute, unsupported, arbitrationRoute: arb?.routeId || null, arbitrationStrength: arb?.strength || null })
}
assert(deterministicFailures.length === 0, `deterministic Fallback-stage eligibility failures (${deterministicFailures.length}): ${JSON.stringify(deterministicFailures.slice(0, 60))}`)

const currentNames = new Set([path.basename(calibrationPath), path.basename(lockPath)])
const historicalSources = []
for (const name of fs.readdirSync(dataDir).sort()) {
  if (!name.startsWith('liuyao-') || !name.endsWith('.json') || currentNames.has(name)) continue
  if (!/(training|calibration|development|independent)/i.test(name)) continue
  if (/(report|diagnostic|contract|lock|design|methodology|research|literature|reachability|blind)/i.test(name)) continue
  let doc
  try { doc = JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8')) } catch { continue }
  const texts = (Array.isArray(doc?.rows) ? doc.rows : []).filter((r) => typeof r?.text === 'string' && normalize(r.text).length >= 8).map((r) => r.text)
  if (texts.length) historicalSources.push({ name, texts })
}
const historicalExact = new Map()
for (const source of historicalSources) for (const text of source.texts) { const n = normalize(text); if (!historicalExact.has(n)) historicalExact.set(n, source.name) }
const exactOverlaps = []
const nearOverlaps = []
const historicalLimit = contract.presealRules.historicalProtectedNormalizedTrigramJaccardUpperBound
for (const row of rows) {
  const normalized = normalize(row.text)
  if (historicalExact.has(normalized)) exactOverlaps.push({ new_row_id: row.id, protected_source_path: historicalExact.get(normalized), normalized_exact_boolean: true })
  for (const source of historicalSources) {
    let best = 0
    for (const oldText of source.texts) {
      const similarity = jaccard(row.text, oldText)
      if (similarity > best) best = similarity
      if (best >= historicalLimit) break
    }
    if (best >= historicalLimit) {
      nearOverlaps.push({ new_row_id: row.id, protected_source_path: source.name, similarity_metric: 'normalized_trigram_jaccard', similarity_value: best, normalized_exact_boolean: best === 1 })
      break
    }
  }
}
assert(exactOverlaps.length === 0, `historical exact overlaps (${exactOverlaps.length}): ${JSON.stringify(exactOverlaps.slice(0, 40))}`)
assert(nearOverlaps.length === 0, `historical near overlaps >=${historicalLimit} (${nearOverlaps.length}): ${JSON.stringify(nearOverlaps.slice(0, 40))}`)

const generator = read(generatorPath).toString('utf8')
assert(!/@huggingface\/transformers|pipeline\s*\(|AutoTokenizer|AutoModel/i.test(generator), 'generator contains encoder/model invocation')
assert(!/(?:readJson|readFileSync)\s*\([^\n;]*(?:calibration-reachability-report-v0\.1|fallback-identity-v03-calibration\.json|candidate-v04-independent|independent-execution|sealed-blind|blind-eval|development-execution)/i.test(generator), 'generator performs forbidden failed/protected evaluation read')
assert(!/\.results\b|results\s*\[/.test(generator), 'generator references row-level evaluation results')

if (calibration.sealed) {
  assert(fs.existsSync(path.join(root, lockPath)), 'sealed v0.1.1 lock missing')
  const lock = readJson(lockPath)
  assert(lock.status === 'locked_before_first_calibration_v011_encoder_scoring', 'v0.1.1 lock status drift')
  assert(lock.calibrationSha256 === sha256(calibrationPath), 'sealed calibration SHA drift')
  assert(lock.replacementContractSha256 === sha256(contractPath), 'replacement contract SHA drift')
  assert(lock.methodologySha256 === sha256(methodologyPath), 'methodology SHA drift')
  assert(lock.carriedTrainingSha256 === contract.carriedTraining.sha256, 'carried training binding drift')
  assert(lock.carriedTrainingSha256 === sha256(contract.carriedTraining.path), 'carried training artifact drift')
  assert(lock.generatorSha256 === sha256(generatorPath), 'generator SHA drift')
  assert(lock.verifierSha256 === sha256(verifierPath), 'verifier SHA drift')
  assert(lock.sealerSha256 === sha256(sealerPath), 'sealer SHA drift')
  assert(lock.encoderScoringObserved === false && lock.fallbackWeightsTrained === false && lock.fallbackProbabilitiesObserved === false && lock.globalThresholdSelected === false, 'model work before v0.1.1 seal')
}

console.log('Candidate v0.5 Fallback Identity v0.3 calibration v0.1.1 preseal verification PASS without encoder scoring.')
console.log('- 880 rows: 264 known +440 near-domain +132 outside-current22 +44 unresolved')
console.log('- deterministic Fallback-stage eligibility failures: 0')
console.log('- internal exact/near duplicates: 0')
console.log(`- historical sources screened: ${historicalSources.length}; exact overlap: 0; near overlap: 0`)
console.log('- protected historical texts were not printed; generator read no failed calibration/report/evaluation rows')
