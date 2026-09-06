import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const verifier = 'scripts/verify-liuyao-semantic-v013-candidate-v04-independent-preseal.mjs'
const reportPath = 'data/liuyao-semantic-v013-candidate-v04-independent-preseal-report-v0.1.json'

const result = spawnSync(process.execPath, [verifier], { encoding:'utf8' })
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)

if (!fs.existsSync(reportPath)) {
  console.error('Independent preseal verifier did not emit its diagnostic report.')
  process.exit(result.status ?? 1)
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
const allowedHistorical = (report.freshness?.historicalRejects || []).map(({ id, sourcePath, metric, similarity }) => ({ id, sourcePath, metric, similarity }))
const allowedInternal = (report.freshness?.internalRejects || []).map(({ id, peerId, metric, similarity }) => ({ id, peerId, metric, similarity }))

console.log('INDEPENDENT_PRESEAL_ALLOWED_REJECTION_METADATA', JSON.stringify({
  status:report.status,
  structuralFailureCount:report.structural?.failureCount || 0,
  historicalRejects:allowedHistorical,
  internalRejects:allowedInternal
}, null, 2))

process.exit(result.status ?? (report.status === 'PASS' ? 0 : 1))
