import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'data')
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'))
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex')
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '').replace(/[，。！？、；：,.!?;:（）()“”‘’"']/g, '')
const grams = (value, n = 3) => { const text = normalize(value); const set = new Set(); if (text.length < n) { if (text) set.add(text); return set } for (let i = 0; i <= text.length - n; i += 1) set.add(text.slice(i, i + n)); return set }
const jaccard = (a, b) => { const A = grams(a); const B = grams(b); let intersection = 0; for (const token of A) if (B.has(token)) intersection += 1; const union = A.size + B.size - intersection; return union ? intersection / union : 0 }

const contractPath = 'data/liuyao-semantic-v013-candidate-v05-data-contract-v0.1.json'
const methodologyPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-methodology-v0.1.json'
const trainingPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-training.json'
const calibrationPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration.json'
const lockPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data.lock.json'
const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-v01.mjs'
const verifierPath = 'scripts/verify-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-preseal-v01.mjs'
const sealerPath = 'scripts/seal-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-v01.mjs'

const contract = readJson(contractPath)
const methodology = readJson(methodologyPath)
const training = readJson(trainingPath)
const calibration = readJson(calibrationPath)
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json')
const routeIds = methodology.training.classOrder
const routeSet = new Set(routeIds)

assert(contract.status === 'frozen_before_candidate_v05_data_generation_or_encoder_scoring', 'v0.5 data contract status drift')
assert(methodology.status === 'frozen_before_v05_training_data_generation_or_encoder_scoring', 'v0.3 methodology status drift')
assert(routeIds.length === 22 && new Set(routeIds).size === 22, 'methodology class order must contain 22 unique routes')
assert(inventory.routes?.length === 22, 'route inventory must contain 22 routes')
assert(routeIds.every((id) => inventory.routes.some((row) => row.routeId === id)), 'methodology/inventory route mismatch')

assert(training.version === '0.13-candidate-v0.5-fallback-identity-v0.3-training-v0.1', 'training version drift')
assert(calibration.version === '0.13-candidate-v0.5-fallback-identity-v0.3-calibration-v0.1', 'calibration version drift')
assert(['presealed_fallback_identity_v03_training', 'sealed_fallback_identity_v03_training'].includes(training.status), `unexpected training status ${training.status}`)
assert(['presealed_fallback_identity_v03_calibration', 'sealed_fallback_identity_v03_calibration'].includes(calibration.status), `unexpected calibration status ${calibration.status}`)
assert(training.sealed === (training.status === 'sealed_fallback_identity_v03_training'), 'training sealed/status mismatch')
assert(calibration.sealed === (calibration.status === 'sealed_fallback_identity_v03_calibration'), 'calibration sealed/status mismatch')
assert(training.dataContract === contractPath && calibration.dataContract === contractPath, 'data contract pointer drift')
assert(training.methodology === methodologyPath && calibration.methodology === methodologyPath, 'methodology pointer drift')

for (const doc of [training, calibration]) {
  for (const [field, expected] of Object.entries({
    encoderScoringObserved: false,
    semanticActProbabilityUsedForGeneration: false,
    routeabilityProbabilityUsedForGeneration: false,
    fallbackSoftmaxProbabilityUsedForGeneration: false,
    officialV04IndependentRowsReadForGeneration: false,
    officialV04IndependentResultsRowsRead: false,
    v04DevelopmentRowsUsedForGeneration: false,
    sealedBlindEvaluationRead: false,
    postBaselineNewThemeCorpusImported: false
  })) assert(doc.policy?.[field] === expected, `policy drift ${field}`)
}

const trainRows = training.rows || []
const calRows = calibration.rows || []
assert(trainRows.length === 264, `training rows ${trainRows.length} !=264`)
assert(calRows.length === 352, `calibration rows ${calRows.length} !=352`)
assert(trainRows.every((r) => r.identityLabel === 'route_identity_positive' && routeSet.has(r.expectedRoute) && r.subtype === 'fallback_stage_known'), 'training labels drift')
assert(calRows.filter((r) => r.identityLabel === 'route_identity_positive').length === 176, 'calibration known count !=176')
assert(calRows.filter((r) => r.identityLabel === 'non_route').length === 176, 'calibration non-route count !=176')
assert(calRows.filter((r) => r.subtype === 'near_domain_not_current_route').length === 88, 'near-domain count !=88')
assert(calRows.filter((r) => r.subtype === 'outside_current_22').length === 44, 'outside-current22 count !=44')
assert(calRows.filter((r) => r.subtype === 'route_unresolved').length === 44, 'route-unresolved count !=44')

for (const routeId of routeIds) {
  const routeTrain = trainRows.filter((r) => r.expectedRoute === routeId)
  const routeCal = calRows.filter((r) => r.expectedRoute === routeId)
  const near = calRows.filter((r) => r.subtype === 'near_domain_not_current_route' && r.pressureFamily === routeId)
  assert(routeTrain.length === 12, `${routeId} training count ${routeTrain.length} !=12`)
  assert(routeCal.length === 8, `${routeId} calibration known count ${routeCal.length} !=8`)
  assert(near.length === 4, `${routeId} near-domain pressure count ${near.length} !=4`)
  assert(routeTrain.filter((r) => r.fallbackStyle === true).length >= 6, `${routeId} fallback-style training rows <6`)
  assert(new Set(routeTrain.map((r) => r.surfaceFamily)).size >= 4, `${routeId} lexical surface families <4`)
}

const allFresh = [...trainRows, ...calRows]
const exactFresh = new Map()
for (const row of allFresh) {
  const text = normalize(row.text)
  assert(text.length >= 6, `too-short text ${row.id}`)
  assert(!exactFresh.has(text), `fresh normalized exact duplicate ${row.id}/${exactFresh.get(text)}`)
  exactFresh.set(text, row.id)
  assert(typeof row.semanticAxis === 'string' && row.semanticAxis, `missing semanticAxis ${row.id}`)
  assert(typeof row.confusableFamily === 'string' && row.confusableFamily, `missing confusableFamily ${row.id}`)
  assert(typeof row.wordingPattern === 'string' && row.wordingPattern, `missing wordingPattern ${row.id}`)
  if (row.identityLabel === 'route_identity_positive') assert(routeSet.has(row.expectedRoute), `unknown route ${row.id}/${row.expectedRoute}`)
  else assert(row.expectedRoute == null, `non-route expectedRoute drift ${row.id}`)
  for (const term of ['妻财', '官鬼', '父母爻', '兄弟爻', '子孙爻', '世爻', '应爻', '用神']) assert(!text.includes(term), `traditional LiuYao term leaked ${row.id}/${term}`)
  for (const term of ['疾病', '病情', '健康占', '手术结果', '疗效', '药效', '康复', '诊断结果', '检查结果']) assert(!text.includes(term), `health-policy term leaked ${row.id}/${term}`)
}

const internalNear = []
for (let i = 0; i < allFresh.length; i += 1) {
  for (let j = i + 1; j < allFresh.length; j += 1) {
    const similarity = jaccard(allFresh[i].text, allFresh[j].text)
    if (similarity >= contract.separationRules.recommendedInternalNearDuplicateJaccardUpperBound) internalNear.push({ a: allFresh[i].id, b: allFresh[j].id, similarity })
  }
}
assert(internalNear.length === 0, `fresh internal near duplicates >=${contract.separationRules.recommendedInternalNearDuplicateJaccardUpperBound} (${internalNear.length}): ${JSON.stringify(internalNear.slice(0, 30))}`)

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
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename: relative })
const extractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV03
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012
assert(extractor?.extract && arbitration?.arbitrate, 'deterministic evidence/arbitration modules failed to load')

const deterministicFailures = []
for (const row of calRows) {
  const evidence = extractor.extract(row.text)
  const unsupported = evidence.unsupportedTargets || []
  const arb = arbitration.arbitrate(row.text, evidence)
  if (unsupported.length || arb != null) deterministicFailures.push({ id: row.id, subtype: row.subtype, expectedRoute: row.expectedRoute, unsupported, arbitrationRoute: arb?.routeId || null, arbitrationStrength: arb?.strength || null })
}
assert(deterministicFailures.length === 0, `calibration deterministic Fallback-stage eligibility failures (${deterministicFailures.length}): ${JSON.stringify(deterministicFailures.slice(0, 40))}`)

const currentNames = new Set([path.basename(trainingPath), path.basename(calibrationPath), path.basename(lockPath)])
const historicalSources = []
for (const name of fs.readdirSync(dataDir).sort()) {
  if (!name.startsWith('liuyao-') || !name.endsWith('.json') || currentNames.has(name)) continue
  if (!/(training|calibration|development|independent)/i.test(name)) continue
  if (/(report|diagnostic|contract|lock|design|methodology|research|literature|reachability|blind)/i.test(name)) continue
  const full = path.join(dataDir, name)
  let doc
  try { doc = JSON.parse(fs.readFileSync(full, 'utf8')) } catch { continue }
  const rows = Array.isArray(doc?.rows) ? doc.rows : []
  const texts = rows.filter((r) => typeof r?.text === 'string' && normalize(r.text).length >= 6).map((r) => r.text)
  if (texts.length) historicalSources.push({ name, protected: /independent/i.test(name), texts })
}

const historicalExact = new Map()
for (const source of historicalSources) for (const text of source.texts) { const n = normalize(text); if (!historicalExact.has(n)) historicalExact.set(n, source.name) }
const exactOverlaps = []
const nearOverlaps = []
for (const row of allFresh) {
  const normalized = normalize(row.text)
  if (historicalExact.has(normalized)) exactOverlaps.push({ id: row.id, protected_source_path: historicalExact.get(normalized), normalized_exact_boolean: true })
  for (const source of historicalSources) {
    let best = 0
    for (const oldText of source.texts) {
      const similarity = jaccard(row.text, oldText)
      if (similarity > best) best = similarity
      if (best >= contract.separationRules.protectedHistoricalNearDuplicateJaccardUpperBound) break
    }
    if (best >= contract.separationRules.protectedHistoricalNearDuplicateJaccardUpperBound) {
      nearOverlaps.push({ new_row_id: row.id, protected_source_path: source.name, similarity_metric: 'normalized_trigram_jaccard', similarity_value: best, normalized_exact_boolean: best === 1 })
      break
    }
  }
}
assert(exactOverlaps.length === 0, `historical normalized exact overlaps (${exactOverlaps.length}): ${JSON.stringify(exactOverlaps.slice(0, 30))}`)
assert(nearOverlaps.length === 0, `historical near overlaps >=${contract.separationRules.protectedHistoricalNearDuplicateJaccardUpperBound} (${nearOverlaps.length}): ${JSON.stringify(nearOverlaps.slice(0, 30))}`)

const generator = fs.readFileSync(path.join(root, generatorPath), 'utf8')
assert(!/@huggingface\/transformers|pipeline\s*\(|AutoTokenizer|AutoModel/i.test(generator), 'generator contains encoder/model invocation')
assert(!/(?:readJson|readFileSync)\s*\([^\n;]*(?:candidate-v04-independent|independent-execution|sealed-blind|blind-eval|development-execution)/i.test(generator), 'generator performs forbidden protected evaluation read')
assert(!/results\s*\[|\.results\b/.test(generator), 'generator references protected row-level results')

if (training.sealed || calibration.sealed) {
  assert(training.sealed && calibration.sealed, 'training/calibration must seal together')
  assert(fs.existsSync(path.join(root, lockPath)), 'sealed data lock missing')
  const lock = readJson(lockPath)
  assert(lock.status === 'locked_before_first_v05_encoder_scoring', 'v0.5 data lock status drift')
  assert(lock.trainingSha256 === sha256(trainingPath), 'training SHA drift after seal')
  assert(lock.calibrationSha256 === sha256(calibrationPath), 'calibration SHA drift after seal')
  assert(lock.dataContractSha256 === sha256(contractPath), 'data contract SHA drift in lock')
  assert(lock.methodologySha256 === sha256(methodologyPath), 'methodology SHA drift in lock')
  assert(lock.generatorSha256 === sha256(generatorPath), 'generator SHA drift in lock')
  assert(lock.verifierSha256 === sha256(verifierPath), 'verifier SHA drift in lock')
  assert(lock.sealerSha256 === sha256(sealerPath), 'sealer SHA drift in lock')
  assert(lock.encoderScoringObserved === false, 'lock says encoder scoring observed')
}

console.log('Candidate v0.5 Fallback Identity v0.3 fresh train/cal data verified without encoder scoring.')
console.log('- training: 264 known, 22/22 routes x12, >=4 surface families/route, >=6 fallback-style/route')
console.log('- calibration: 352 = 176 known + 88 near-domain + 44 outside-current22 + 44 route-unresolved')
console.log('- calibration deterministic Fallback-stage eligibility failures: 0')
console.log('- fresh internal normalized exact/near duplicates: 0')
console.log(`- historical row-text isolation sources screened: ${historicalSources.length}; exact overlap: 0; near overlap: 0`)
console.log('- no encoder/model probability was read or produced')
