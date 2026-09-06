import fs from 'node:fs'
import crypto from 'node:crypto'
import vm from 'node:vm'
import { execFileSync } from 'node:child_process'

const contractPath = 'data/liuyao-semantic-v013-candidate-v04-independent-contract-v0.1.json'
const independentPath = 'data/liuyao-semantic-v013-candidate-v04-independent.json'
const reportPath = 'data/liuyao-semantic-v013-candidate-v04-independent-preseal-report-v0.1.json'
const manifestPath = 'data/liuyao-semantic-v013-candidate-v04-development-exclusion-manifest-v0.2.json'

const read = (path) => fs.readFileSync(path)
const readJson = (path) => JSON.parse(read(path).toString('utf8'))
const sha256 = (path) => crypto.createHash('sha256').update(read(path)).digest('hex')
const gitBlobSha = (path) => execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim()
const assert = (condition, message) => { if (!condition) throw new Error(message) }

for (const path of [contractPath, independentPath, manifestPath]) assert(fs.existsSync(path), `preseal input missing: ${path}`)
const contract = readJson(contractPath)
const independent = readJson(independentPath)
const manifest = readJson(manifestPath)
assert(contract.status === 'frozen_after_candidate_lock_before_fresh_independent_generation', 'independent contract not frozen')
assert(independent.status === 'generated_post_lock_unscored_awaiting_preseal_verification', 'independent artifact status mismatch')
assert(independent.encoderScoringObserved === false && independent.modelProbabilityObserved === false, 'independent artifact observed encoder/model scoring before seal')
assert(independent.historicalIndependentRowTextReadForGeneration === false, 'generator read historical independent row text')
assert(independent.developmentPerRowResultsReadForGeneration === false, 'generator read development per-row results')
assert(independent.sealedBlindEvaluationRowTextRead === false, 'generator read sealed blind evaluation rows')
assert(independent.postBaselineNewThemeCorpusRead === false, 'generator read post-Baseline new-theme corpus')
assert(gitBlobSha(manifestPath) === contract.freshness.compareAgainst.developmentExclusionManifest.gitBlobSha, 'development exclusion manifest blob drift')

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number }
context.window = context
context.globalThis = context
vm.createContext(context)
for (const path of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path, 'utf8'), context, { filename: path })
const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV03
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012
assert(evidenceExtractor?.extract && arbitration?.arbitrate, 'deterministic Evidence/Arbitration unavailable')

const expectedCounts = {
  total:198, known:132, nonRoute:66,
  strong_arbitration:44, support_arbitration:44, fallback_head:44,
  outside_current_22:22, route_unresolved:22, near_domain_not_current_route:22
}
for (const [key, expected] of Object.entries(expectedCounts)) assert(independent.counts?.[key] === expected, `${key} count ${independent.counts?.[key]} != ${expected}`)
assert(Array.isArray(independent.rows) && independent.rows.length === 198, 'independent rows !=198')
const ids = independent.rows.map((row) => row.id)
assert(new Set(ids).size === ids.length, 'duplicate independent row id')

const routes = Object.keys(independent.fallbackAll22Coverage || {})
assert(routes.length === 22, 'fallback coverage route count !=22')
for (const routeId of routes) assert(independent.fallbackAll22Coverage[routeId] === 2, `fallback coverage ${routeId} !=2`)

const structuralFailures = []
const traditionalPattern = /(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|六亲|伏神|飞神|旬空|月建|日辰)/u
const healthPattern = /(疾病|生病|病情|健康|手术|癌症|肿瘤|症状|治疗|诊断|药物|住院|康复|怀孕健康|身体会不会)/u
for (const item of independent.rows) {
  const text = String(item.text || '').trim()
  if (!text) structuralFailures.push({ id:item.id, issue:'empty_text' })
  if (traditionalPattern.test(text)) structuralFailures.push({ id:item.id, issue:'traditional_liuyao_term_in_semantic_corpus' })
  if (healthPattern.test(text)) structuralFailures.push({ id:item.id, issue:'health_or_disease_request_forbidden' })
  const evidence = evidenceExtractor.extract(text)
  const arb = arbitration.arbitrate(text, evidence)
  const unsupported = Array.isArray(evidence?.unsupportedTargets) ? evidence.unsupportedTargets : []
  if (item.expectedDisposition === 'route_known') {
    if (unsupported.length) structuralFailures.push({ id:item.id, issue:'known_has_unsupported_target' })
    if (item.expectedCandidatePath === 'strong_arbitration') {
      if (arb?.routeId !== item.expectedRoute || arb?.strength !== 'strong') structuralFailures.push({ id:item.id, issue:'strong_path_mismatch', observedRoute:arb?.routeId || null, observedStrength:arb?.strength || null })
    } else if (item.expectedCandidatePath === 'support_arbitration') {
      if (arb?.routeId !== item.expectedRoute || arb?.strength !== 'support') structuralFailures.push({ id:item.id, issue:'support_path_mismatch', observedRoute:arb?.routeId || null, observedStrength:arb?.strength || null })
    } else if (item.expectedCandidatePath === 'fallback_head') {
      if (arb?.routeId) structuralFailures.push({ id:item.id, issue:'fallback_resolved_upstream', observedRoute:arb.routeId, observedStrength:arb.strength || null })
    } else structuralFailures.push({ id:item.id, issue:'unknown_known_path' })
  } else if (item.expectedDisposition === 'non_route') {
    if (!['outside_current_22','route_unresolved','near_domain_not_current_route'].includes(item.nonRouteSubtype)) structuralFailures.push({ id:item.id, issue:'invalid_nonroute_subtype' })
  } else structuralFailures.push({ id:item.id, issue:'invalid_expected_disposition' })
}

const normalize = (value) => String(value || '')
  .normalize('NFKC')
  .toLowerCase()
  .trim()
  .replace(/\s+/gu, '')
  .replace(/[\p{P}\p{S}]/gu, '')

const grams = (value) => {
  const chars = Array.from(value)
  if (chars.length < 3) return new Set(chars.length ? [value] : [])
  const out = new Set()
  for (let i = 0; i <= chars.length - 3; i += 1) out.add(chars.slice(i, i + 3).join(''))
  return out
}
const jaccard = (a, b) => {
  if (!a.size && !b.size) return 1
  let intersection = 0
  const small = a.size <= b.size ? a : b
  const large = a.size <= b.size ? b : a
  for (const item of small) if (large.has(item)) intersection += 1
  return intersection / (a.size + b.size - intersection)
}
const boundedLevenshtein = (aValue, bValue, maxDist) => {
  const a = Array.from(aValue); const b = Array.from(bValue)
  if (Math.abs(a.length - b.length) > maxDist) return maxDist + 1
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array(b.length + 1).fill(Number.POSITIVE_INFINITY)
  for (let j = 0; j <= Math.min(b.length, maxDist); j += 1) prev[j] = j
  for (let i = 1; i <= a.length; i += 1) {
    const cur = Array(b.length + 1).fill(Number.POSITIVE_INFINITY)
    const from = Math.max(1, i - maxDist)
    const to = Math.min(b.length, i + maxDist)
    if (i <= maxDist) cur[0] = i
    let rowMin = Number.POSITIVE_INFINITY
    for (let j = from; j <= to; j += 1) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      rowMin = Math.min(rowMin, cur[j])
    }
    if (rowMin > maxDist) return maxDist + 1
    prev = cur
  }
  return prev[b.length]
}

const extractStrings = (value, out=[]) => {
  if (typeof value === 'string') { if (value.trim()) out.push(value); return out }
  if (Array.isArray(value)) { for (const item of value) extractStrings(item, out); return out }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if ((/\p{Script=Han}/u.test(key) && Array.from(key).length >= 6) || (Array.from(key).length >= 24 && /\s/u.test(key))) out.push(key)
      extractStrings(item, out)
    }
  }
  return out
}

const sourceSpecs = []
assert(Array.isArray(manifest.compareText) && manifest.compareText.length === 20, 'compareText source count drift')
for (const spec of manifest.compareText) {
  assert(fs.existsSync(spec.path), `freshness source missing: ${spec.path}`)
  assert(gitBlobSha(spec.path) === spec.gitBlobSha, `freshness source blob drift: ${spec.path}`)
  assert(sha256(spec.path) === spec.sha256, `freshness source SHA drift: ${spec.path}`)
  sourceSpecs.push({ path:spec.path, kind:'historical' })
}
const developmentSpec = contract.freshness.compareAgainst.sealedCandidateV04Development
assert(fs.existsSync(developmentSpec.path), 'sealed development freshness source missing')
assert(gitBlobSha(developmentSpec.path) === developmentSpec.gitBlobSha, 'sealed development freshness source blob drift')
assert(sha256(developmentSpec.path) === developmentSpec.sha256, 'sealed development freshness source SHA drift')
sourceSpecs.push({ path:developmentSpec.path, kind:'sealed_candidate_v04_development' })

const historical = []
for (const spec of sourceSpecs) {
  const parsed = readJson(spec.path)
  const seen = new Set()
  for (const raw of extractStrings(parsed)) {
    const normalized = normalize(raw)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    historical.push({ sourcePath:spec.path, normalized, grams:grams(normalized) })
  }
}

const exactThreshold = true
const jacThreshold = 0.75
const levThreshold = 0.85
const historyRejects = []
const internalRejects = []
const independentPrepared = independent.rows.map((item) => ({ id:item.id, normalized:normalize(item.text), grams:null }))
for (const item of independentPrepared) item.grams = grams(item.normalized)

for (const item of independentPrepared) {
  for (const prior of historical) {
    if (exactThreshold && item.normalized === prior.normalized) {
      historyRejects.push({ id:item.id, sourcePath:prior.sourcePath, metric:'normalized_exact', similarity:1 })
      continue
    }
    const jac = jaccard(item.grams, prior.grams)
    if (jac >= jacThreshold) historyRejects.push({ id:item.id, sourcePath:prior.sourcePath, metric:'character_trigram_jaccard', similarity:jac })
    const maxLen = Math.max(Array.from(item.normalized).length, Array.from(prior.normalized).length)
    const minLen = Math.min(Array.from(item.normalized).length, Array.from(prior.normalized).length)
    if (maxLen > 0 && minLen / maxLen >= levThreshold) {
      const maxDist = Math.floor((1 - levThreshold) * maxLen + 1e-12)
      const distance = boundedLevenshtein(item.normalized, prior.normalized, maxDist)
      if (distance <= maxDist) {
        const similarity = 1 - distance / maxLen
        if (similarity >= levThreshold) historyRejects.push({ id:item.id, sourcePath:prior.sourcePath, metric:'normalized_levenshtein_similarity', similarity })
      }
    }
  }
}

for (let i = 0; i < independentPrepared.length; i += 1) {
  for (let j = i + 1; j < independentPrepared.length; j += 1) {
    const a = independentPrepared[i], b = independentPrepared[j]
    if (a.normalized === b.normalized) {
      internalRejects.push({ id:a.id, peerId:b.id, metric:'normalized_exact', similarity:1 })
      continue
    }
    const jac = jaccard(a.grams, b.grams)
    if (jac >= jacThreshold) internalRejects.push({ id:a.id, peerId:b.id, metric:'character_trigram_jaccard', similarity:jac })
    const aLen = Array.from(a.normalized).length, bLen = Array.from(b.normalized).length
    const maxLen = Math.max(aLen, bLen), minLen = Math.min(aLen, bLen)
    if (maxLen > 0 && minLen / maxLen >= levThreshold) {
      const maxDist = Math.floor((1 - levThreshold) * maxLen + 1e-12)
      const distance = boundedLevenshtein(a.normalized, b.normalized, maxDist)
      if (distance <= maxDist) {
        const similarity = 1 - distance / maxLen
        if (similarity >= levThreshold) internalRejects.push({ id:a.id, peerId:b.id, metric:'normalized_levenshtein_similarity', similarity })
      }
    }
  }
}

const rejectedHistoryIds = [...new Set(historyRejects.map((item) => item.id))]
const rejectedInternalIds = [...new Set(internalRejects.flatMap((item) => [item.id, item.peerId]))]
const report = {
  version:'0.13-candidate-v0.4-independent-preseal-report-v0.1',
  status: structuralFailures.length === 0 && historyRejects.length === 0 && internalRejects.length === 0 ? 'PASS' : 'FAIL',
  scope:'fresh_post_lock_independent_preseal_only',
  policy:{ encoderScoring:false, modelProbabilityObserved:false, runtimeMutation:false, historicalIndependentRowTextRead:false, sealedBlindEvaluationRead:false, developmentPerRowResultsRead:false },
  sources:{ compareTextSources:sourceSpecs.length, extractedHistoricalCandidates:historical.length, includesSealedCandidateV04Development:true },
  structural:{ pass:structuralFailures.length === 0, failureCount:structuralFailures.length, failures:structuralFailures },
  freshness:{
    pass:historyRejects.length === 0 && internalRejects.length === 0,
    historicalRejectedRowCount:rejectedHistoryIds.length,
    historicalRejectionCount:historyRejects.length,
    internalRejectedRowCount:rejectedInternalIds.length,
    internalRejectedPairCount:internalRejects.length,
    historicalRejects:historyRejects,
    internalRejects:internalRejects
  },
  nextAction: structuralFailures.length === 0 && historyRejects.length === 0 && internalRejects.length === 0
    ? 'seal_fresh_independent_before_first_encoder_scoring'
    : 'replace_only_rejected_or_structure_invalid_fresh_independent_fixtures_before_any_encoder_scoring_then_rerun_preseal'
}
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
console.log(JSON.stringify({ status:report.status, structural:report.structural, freshness:{...report.freshness, historicalRejects:undefined, internalRejects:undefined}, nextAction:report.nextAction }, null, 2))
if (report.status !== 'PASS') process.exit(1)
