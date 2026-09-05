import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const contractPath = 'data/liuyao-semantic-v013-candidate-v04-development-freshness-contract-v0.1.1.json'
const outputPath = process.argv[2] ?? 'tmp/liuyao-semantic-v013-candidate-v04-exclusion-manifest.json'
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'))
const allowedKeys = new Set(contract.textExtraction.allowedKeys)

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function gitBlobSha(path) {
  return execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim()
}

function collectTexts(value, key = null, out = []) {
  if (typeof value === 'string') {
    if (key && allowedKeys.has(key) && value.trim()) out.push(value)
    return out
  }
  if (Array.isArray(value)) {
    for (const item of value) collectTexts(item, key, out)
    return out
  }
  if (value && typeof value === 'object') {
    for (const [childKey, childValue] of Object.entries(value)) {
      collectTexts(childValue, childKey, out)
    }
  }
  return out
}

function collectStringKeyCounts(value, key = null, counts = new Map()) {
  if (typeof value === 'string') {
    if (key && value.trim()) counts.set(key, (counts.get(key) ?? 0) + 1)
    return counts
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringKeyCounts(item, key, counts)
    return counts
  }
  if (value && typeof value === 'object') {
    for (const [childKey, childValue] of Object.entries(value)) {
      collectStringKeyCounts(childValue, childKey, counts)
    }
  }
  return counts
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
    const texts = [...new Set(collectTexts(json).map((text) => text.trim()).filter(Boolean))]
    if (texts.length === 0) {
      const keys = [...collectStringKeyCounts(json).entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 20)
        .map(([name, count]) => `${name}:${count}`)
        .join(',')
      throw new Error(`compareText source yielded zero whitelisted texts: ${path}; availableStringKeys=${keys}`)
    }
    entry.extractedTextCount = texts.length
  }
  return entry
}

const compare = contract.exclusionSources.compareText.map((path) => inspect(path, true))
const provenanceOnly = contract.exclusionSources.provenanceOnly.map((path) => inspect(path, false))
const manifest = {
  version: '0.13-candidate-v0.4-development-exclusion-manifest-v0.1',
  status: 'generated_before_candidate_v04_development_generation_and_scoring',
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
  generationBoundaryPreserved: true,
  encoderOrModelScoringObserved: false
}

fs.mkdirSync(outputPath.split('/').slice(0, -1).join('/') || '.', { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log('CANDIDATE_V04_EXCLUSION_MANIFEST_BEGIN')
console.log(JSON.stringify(manifest, null, 2))
console.log('CANDIDATE_V04_EXCLUSION_MANIFEST_END')
