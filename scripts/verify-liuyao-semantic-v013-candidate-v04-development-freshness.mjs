import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const developmentPath = process.argv[2] ?? 'tmp/liuyao-semantic-v013-candidate-v04-development.json'
const reportPath = process.argv[3] ?? 'tmp/liuyao-semantic-v013-candidate-v04-development-freshness-report.json'
const verifierContractPath = 'data/liuyao-semantic-v013-candidate-v04-development-freshness-verifier-contract-v0.1.json'

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}
function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}
function gitBlobSha(path) {
  return execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim()
}
function codePoints(value) {
  return Array.from(value)
}
function normalizeForComparison(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/\s/gu, '')
    .replace(/[\p{P}\p{S}]/gu, '')
}
function looksLikeNaturalLanguageKey(key) {
  const value = String(key).trim()
  if (!value) return false
  if (/\p{Script=Han}/u.test(value) && codePoints(value).length >= 6) return true
  if (/\s/u.test(value) && codePoints(value).length >= 24) return true
  return false
}
function collectHistoricalTexts(value, out = []) {
  if (typeof value === 'string') {
    const text = value.trim()
    if (text) out.push(text)
    return out
  }
  if (Array.isArray(value)) {
    for (const item of value) collectHistoricalTexts(item, out)
    return out
  }
  if (value && typeof value === 'object') {
    for (const [key, childValue] of Object.entries(value)) {
      if (looksLikeNaturalLanguageKey(key)) out.push(key.trim())
      collectHistoricalTexts(childValue, out)
    }
  }
  return out
}
function trigramSet(normalized) {
  const chars = codePoints(normalized)
  if (chars.length === 0) return new Set()
  if (chars.length < 3) return new Set([normalized])
  const out = new Set()
  for (let i = 0; i <= chars.length - 3; i += 1) out.add(chars.slice(i, i + 3).join(''))
  return out
}
function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1
  let intersection = 0
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  for (const gram of small) if (large.has(gram)) intersection += 1
  const union = a.size + b.size - intersection
  return union === 0 ? 1 : intersection / union
}
function boundedLevenshteinDistance(aNormalized, bNormalized, maxDistance) {
  const a = codePoints(aNormalized)
  const b = codePoints(bNormalized)
  const n = a.length
  const m = b.length
  if (Math.abs(n - m) > maxDistance) return maxDistance + 1
  if (n === 0) return m
  if (m === 0) return n
  let previous = Array.from({ length: m + 1 }, (_, i) => i)
  for (let i = 1; i <= n; i += 1) {
    const current = new Array(m + 1).fill(maxDistance + 1)
    current[0] = i
    const start = Math.max(1, i - maxDistance)
    const end = Math.min(m, i + maxDistance)
    let rowMin = current[0]
    for (let j = start; j <= end; j += 1) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      const insertion = current[j - 1] + 1
      const deletion = previous[j] + 1
      const value = Math.min(substitution, insertion, deletion)
      current[j] = value
      if (value < rowMin) rowMin = value
    }
    if (rowMin > maxDistance) return maxDistance + 1
    previous = current
  }
  return previous[m]
}
function levenshteinRejectSimilarity(a, b, threshold) {
  const aLength = codePoints(a).length
  const bLength = codePoints(b).length
  const maxLength = Math.max(aLength, bLength)
  if (maxLength === 0) return 1
  if (Math.min(aLength, bLength) / maxLength < threshold) return null
  const maxDistance = Math.floor((1 - threshold) * maxLength + 1e-12)
  const distance = boundedLevenshteinDistance(a, b, maxDistance)
  if (distance > maxDistance) return null
  const similarity = 1 - distance / maxLength
  return similarity >= threshold ? similarity : null
}
function round(value) {
  return Number(value.toFixed(12))
}

const verifier = readJson(verifierContractPath)
const protocolPath = verifier.developmentProtocol.path
const manifestPath = verifier.exclusionManifest.path
if (gitBlobSha(protocolPath) !== verifier.developmentProtocol.gitBlobSha) throw new Error('development protocol blob mismatch')
if (gitBlobSha(manifestPath) !== verifier.exclusionManifest.gitBlobSha) throw new Error('exclusion manifest blob mismatch')

const protocol = readJson(protocolPath)
const manifest = readJson(manifestPath)
const development = readJson(developmentPath)

if (manifest.sourceCounts.compareText !== verifier.exclusionManifest.requiredCompareTextSources) throw new Error('compareText source count mismatch')
if (manifest.sourceCounts.provenanceOnly !== verifier.exclusionManifest.requiredProvenanceOnlySources) throw new Error('provenanceOnly source count mismatch')
if (manifest.sourceCounts.extractedTexts !== verifier.exclusionManifest.requiredExtractedHistoricalCandidates) throw new Error('historical candidate count mismatch')
if (!Array.isArray(development.rows) || development.rows.length !== 198) throw new Error('development row count must be 198')
if (development.encoderScoringObserved !== false || development.modelProbabilityObserved !== false) throw new Error('development artifact indicates forbidden preseal scoring')
if (development.runtimeMutationAllowed !== false) throw new Error('development artifact permits runtime mutation')

const historicalByNormalized = new Map()
let extractedCount = 0
for (const entry of manifest.compareText) {
  if (!fs.existsSync(entry.path)) throw new Error(`missing compareText source: ${entry.path}`)
  const raw = fs.readFileSync(entry.path)
  if (raw.byteLength !== entry.bytes) throw new Error(`source byte mismatch: ${entry.path}`)
  if (sha256(raw) !== entry.sha256) throw new Error(`source sha256 mismatch: ${entry.path}`)
  if (gitBlobSha(entry.path) !== entry.gitBlobSha) throw new Error(`source git blob mismatch: ${entry.path}`)
  const texts = [...new Set(collectHistoricalTexts(JSON.parse(raw.toString('utf8'))).map((text) => text.trim()).filter(Boolean))]
  if (texts.length !== entry.extractedTextCount) throw new Error(`source extracted text count mismatch: ${entry.path}`)
  extractedCount += texts.length
  for (const text of texts) {
    const normalized = normalizeForComparison(text)
    if (!normalized) continue
    let item = historicalByNormalized.get(normalized)
    if (!item) {
      item = { normalized, grams: trigramSet(normalized), sources: new Set() }
      historicalByNormalized.set(normalized, item)
    }
    item.sources.add(entry.path)
  }
}
if (extractedCount !== verifier.exclusionManifest.requiredExtractedHistoricalCandidates) throw new Error('re-extracted historical candidate total mismatch')

const exactThreshold = true
const jaccardThreshold = verifier.metrics.characterTrigramJaccard.rejectGreaterThanOrEqual
const levenshteinThreshold = verifier.metrics.normalizedLevenshteinSimilarity.rejectGreaterThanOrEqual
const historicalCandidates = [...historicalByNormalized.values()]
const rowDiagnostics = []
let historicalRejectedRows = 0

for (const row of development.rows) {
  const normalized = normalizeForComparison(row.text)
  if (!normalized) throw new Error(`empty normalized development text: ${row.id}`)
  const grams = trigramSet(normalized)
  const reasons = []
  const exact = historicalByNormalized.get(normalized)
  if (exactThreshold && exact) {
    reasons.push({ metric: 'normalized_exact', similarity: 1, sourcePaths: [...exact.sources].sort() })
  }

  let strongestJaccard = null
  let strongestLevenshtein = null
  for (const candidate of historicalCandidates) {
    if (candidate.normalized === normalized) continue
    const jac = jaccard(grams, candidate.grams)
    if (jac >= jaccardThreshold && (!strongestJaccard || jac > strongestJaccard.similarity)) {
      strongestJaccard = { metric: 'character_trigram_jaccard', similarity: jac, sourcePaths: [...candidate.sources].sort() }
    }
    const lev = levenshteinRejectSimilarity(normalized, candidate.normalized, levenshteinThreshold)
    if (lev !== null && (!strongestLevenshtein || lev > strongestLevenshtein.similarity)) {
      strongestLevenshtein = { metric: 'normalized_levenshtein_similarity', similarity: lev, sourcePaths: [...candidate.sources].sort() }
    }
  }
  if (strongestJaccard) reasons.push({ ...strongestJaccard, similarity: round(strongestJaccard.similarity) })
  if (strongestLevenshtein) reasons.push({ ...strongestLevenshtein, similarity: round(strongestLevenshtein.similarity) })
  const rejected = reasons.length > 0
  if (rejected) historicalRejectedRows += 1
  rowDiagnostics.push({ id: row.id, rejected, reasons })
}

const internalRejects = []
const preparedRows = development.rows.map((row) => {
  const normalized = normalizeForComparison(row.text)
  return { id: row.id, normalized, grams: trigramSet(normalized) }
})
for (let i = 0; i < preparedRows.length; i += 1) {
  for (let j = i + 1; j < preparedRows.length; j += 1) {
    const a = preparedRows[i]
    const b = preparedRows[j]
    const reasons = []
    if (a.normalized === b.normalized) reasons.push({ metric: 'normalized_exact', similarity: 1 })
    const jac = jaccard(a.grams, b.grams)
    if (jac >= jaccardThreshold) reasons.push({ metric: 'character_trigram_jaccard', similarity: round(jac) })
    const lev = levenshteinRejectSimilarity(a.normalized, b.normalized, levenshteinThreshold)
    if (lev !== null) reasons.push({ metric: 'normalized_levenshtein_similarity', similarity: round(lev) })
    if (reasons.length) internalRejects.push({ rowA: a.id, rowB: b.id, reasons })
  }
}

const rejectedRowIds = rowDiagnostics.filter((row) => row.rejected).map((row) => row.id)
const pass = rejectedRowIds.length === 0 && internalRejects.length === 0
const report = {
  version: '0.13-candidate-v0.4-development-freshness-report-v0.1',
  status: pass ? 'PASS' : 'FAIL_PRESEAL_FRESHNESS',
  verifierContract: {
    path: verifierContractPath,
    gitBlobSha: gitBlobSha(verifierContractPath),
    sha256: sha256(fs.readFileSync(verifierContractPath))
  },
  developmentArtifact: {
    path: developmentPath,
    sha256: sha256(fs.readFileSync(developmentPath)),
    rowCount: development.rows.length,
    encoderScoringObserved: false,
    modelProbabilityObserved: false
  },
  exclusionManifest: {
    path: manifestPath,
    gitBlobSha: gitBlobSha(manifestPath),
    sha256: sha256(fs.readFileSync(manifestPath)),
    compareTextSources: manifest.sourceCounts.compareText,
    provenanceOnlySources: manifest.sourceCounts.provenanceOnly,
    extractedHistoricalCandidates: extractedCount,
    distinctNormalizedHistoricalCandidates: historicalCandidates.length
  },
  thresholds: {
    normalizedExactRejected: true,
    characterTrigramJaccardGte: jaccardThreshold,
    normalizedLevenshteinSimilarityGte: levenshteinThreshold
  },
  results: {
    historicalRejectedRowCount: historicalRejectedRows,
    rejectedRowIds,
    internalRejectedPairCount: internalRejects.length,
    pass
  },
  rejectedRows: rowDiagnostics.filter((row) => row.rejected),
  internalRejects,
  historicalTextValuesLoggedOrStoredInReport: false,
  runtimeMutationAllowed: false,
  encoderOrModelScoringObserved: false,
  independentEvaluationRead: false,
  sealedBlindEvaluationRead: false
}

fs.mkdirSync(reportPath.split('/').slice(0, -1).join('/') || '.', { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log('CANDIDATE_V04_FRESHNESS_SUMMARY', JSON.stringify({
  status: report.status,
  historicalRejectedRowCount: historicalRejectedRows,
  rejectedRowIds,
  internalRejectedPairCount: internalRejects.length,
  extractedHistoricalCandidates: extractedCount,
  distinctNormalizedHistoricalCandidates: historicalCandidates.length,
  historicalTextValuesLoggedOrStoredInReport: false,
  encoderOrModelScoringObserved: false
}))
