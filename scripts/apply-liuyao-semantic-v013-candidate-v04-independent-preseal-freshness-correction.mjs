import fs from 'node:fs'

const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v04-independent.mjs'
if (!fs.existsSync(generatorPath)) throw new Error(`generator missing: ${generatorPath}`)

let source = fs.readFileSync(generatorPath, 'utf8')
const replacements = new Map([
  [
    "'这次驾驶考试能不能一次通过？'",
    "'预约好的道路驾驶实操考核，这一回能否直接取得合格结果？'"
  ],
  [
    "'我现在做这个决定是不是合适？'",
    "'眼前有两个方向，我偏向其中这一边，这样取舍以后看是否更妥当？'"
  ],
  [
    "'这件事情还有没有继续推进的必要？'",
    "'目前已经投入不少精力，剩下的部分我还值得继续做下去吗？'"
  ]
])

for (const [from, to] of replacements) {
  const count = source.split(from).length - 1
  if (count !== 1) throw new Error(`freshness correction anchor count ${count} != 1: ${from}`)
  source = source.replace(from, to)
}

fs.writeFileSync(generatorPath, source, 'utf8')
console.log('CANDIDATE_V04_INDEPENDENT_PRESEAL_FRESHNESS_CORRECTION_APPLIED', replacements.size)
