import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const contractPath = 'data/liuyao-semantic-v013-candidate-v04-development-freshness-contract-v0.2.json'
const outputPath = process.argv[2] ?? 'tmp/liuyao-semantic-v013-candidate-v04-exclusion-manifest.json'
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'))

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function gitBlobSha(path) {
  return execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim()
}

function looksLikeNaturalLanguageKey(key) {
  const value = String(key).trim()
  if (!value) return false
  if (/\p{Script=Han}/u.test(value) && Array.from(value).length >= 6) return true
  if (/\s/u.test(value) && Array.from(value).length >= 24) return true
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

function inspect(path, compareText) {
  if (!fs.existsSync(path)) throw new Error(`missing exclusion source: ${path}`)
  const raw = fs.readFileSync(path)
  const entry = {
    path,
    mode: compareText ? 'compare_text' : 'provenance_only',
    bytes: raw.byteLength,
    gitBlobSha: gitBlobSha(path),
    sha256: sha256(raw)
  }
  if (compareText) {
    const json = JSON.parse(raw.toString('utf8'))
    const texts = [...new Set(collectHistoricalTexts(json).map((text) => text.trim()).filter(Boolean))]
    if (texts.length === 0) {
      throw new Error(`compareText source yielded zero conservative text candidates: ${path}`)
    }
    entry.extractedTextCount = texts.length
  }
  return entry
}

const compare = contract.exclusionSources.compareText.map((path) => inspect(path, true))
const provenanceOnly = contract.exclusionSources.provenanceOnly.map((path) => inspect(path, false))
const manifest = {
  version: '0.13-candidate-v0.4-development-exclusion-manifest-v0.2',
  status: 'generated_before_candidate_v04_development_generation_and_scoring',
  freshnessClaim: contract.freshnessClaim,
  contract: {
    path: contractPath,
    sha256: sha256(fs.readFileSync(contractPath)),
    gitBlobSha: gitBlobSha(contractPath)
  },
  sourceCounts: {
    compareText: compare.length,
    provenanceOnly: provenanceOnly.length,
    total: compare.length + provenanceOnly.length,
    extractedTexts: compare.reduce((sum, entry) => sum + entry.extractedTextCount, 0)
  },
  compareText: compare,
  provenanceOnly,
  protectedNoReadCorpora: contract.protectedNoReadCorpora,
  historicalTextValuesLogged: false,
  generationBoundaryPreservedByGeneratorRuntime: true,
  encoderOrModelScoringObserved: false
}

fs.mkdirSync(outputPath.split('/').slice(0, -1).join('/') || '.', { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log('CANDIDATE_V04_EXCLUSION_MANIFEST_SUMMARY', JSON.stringify({
  version: manifest.version,
  contract: manifest.contract,
  sourceCounts: manifest.sourceCounts,
  historicalTextValuesLogged: false,
  encoderOrModelScoringObserved: false
}))
