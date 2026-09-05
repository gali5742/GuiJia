import fs from 'node:fs'

const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v04-development.mjs'
const corrections = [
  {
    kind: 'structural_path_alignment',
    before: '公司的薪酬情况让我有些在意，想看这一块后续气象。',
    after: '公司的固定薪酬情况让我有些在意，想看这一块后续气象。'
  },
  {
    kind: 'preseal_freshness_exact_overlap_replacement',
    targetId: 'V013-V04-D-192',
    before: '这次驾照考试能不能一次通过？',
    after: '报名参加的城市马拉松抽签，我这次能不能中签？',
    failedMetric: 'normalized_exact',
    historicalSourcePath: 'data/liuyao-semantic-fallback-identity-v0.1-training.json'
  }
]

let source = fs.readFileSync(generatorPath, 'utf8')
for (const correction of corrections) {
  const occurrences = source.split(correction.before).length - 1
  if (occurrences !== 1) {
    throw new Error(`expected exactly one preseal fixture target for ${correction.kind}, found ${occurrences}`)
  }
  if (source.includes(correction.after)) {
    throw new Error(`preseal correction already present for ${correction.kind}`)
  }
  source = source.replace(correction.before, correction.after)
}
fs.writeFileSync(generatorPath, source)
console.log('applied 2 preseal fixture corrections; only the freshness-rejected D-192 wording was replaced after the first freshness run; encoder/model scoring not invoked')
