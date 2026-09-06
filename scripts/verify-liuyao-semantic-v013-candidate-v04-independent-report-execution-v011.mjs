import fs from 'node:fs'
import crypto from 'node:crypto'
import { pathToFileURL } from 'node:url'

const sourcePath = 'scripts/verify-liuyao-semantic-v013-candidate-v04-independent-report-execution-v01.mjs'
const tempPath = 'scripts/.tmp-verify-liuyao-semantic-v013-candidate-v04-independent-report-execution-v011.mjs'
const oldContractPath = 'data/liuyao-semantic-v013-candidate-v04-independent-scoring-contract-v0.1.json'
const correctedContractPath = 'data/liuyao-semantic-v013-candidate-v04-independent-scoring-contract-v0.1.1.json'
const expectedSourceSha256 = '50d7f8694e09492e91aeb82c572c543bdee28d3b6e54508b6908b416e03827c7'

const source = fs.readFileSync(sourcePath, 'utf8')
const sourceSha256 = crypto.createHash('sha256').update(Buffer.from(source)).digest('hex')
if (sourceSha256 !== expectedSourceSha256) throw new Error(`frozen v0.1 verifier source drift: ${sourceSha256}`)
const occurrences = source.split(oldContractPath).length - 1
if (occurrences !== 1) throw new Error(`expected exactly one scoring contract path occurrence, got ${occurrences}`)
const patched = source.replace(oldContractPath, correctedContractPath)
if (patched === source) throw new Error('binding-only verifier patch did not apply')
if (!fs.existsSync(correctedContractPath)) throw new Error('corrected scoring contract missing')
if (fs.existsSync(tempPath)) throw new Error(`temporary verifier path already exists: ${tempPath}`)

fs.writeFileSync(tempPath, patched, 'utf8')
try {
  await import(`${pathToFileURL(tempPath).href}?bindingCorrection=v0.1.1`)
} finally {
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
}
