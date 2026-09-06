import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const calibrationPath = path.join(root, 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration.json')
const calibration = JSON.parse(fs.readFileSync(calibrationPath, 'utf8'))
if (calibration.status !== 'presealed_fallback_identity_v03_calibration' || calibration.sealed !== false) throw new Error('calibration is not mutable preseal data')

const replacements = new Map([
  ['V05-FI-C-N-003', '家里的账本现在按用途和日期放在同一页，这样调整以后改成按周整理会不会更顺手？'],
  ['V05-FI-C-N-004', '家里的账本现在按用途和日期放在同一页，改成固定格式记下来是否更清楚？'],
  ['V05-FI-C-K-077', '我和这个人正在考虑把两边的任务并到同一个项目推进，后面能不能配合稳定？'],
  ['V05-FI-C-K-078', '我和这个人正在考虑把双方资源放进同一个项目，往后能不能共同做下去？'],
  ['V05-FI-C-N-047', '以前结束掉的记录现在和仍保留的记录放在同一页，改成两个区域显示会不会更清楚？'],
  ['V05-FI-C-N-048', '以前结束掉的记录现在和仍保留的记录放在同一页，按年份另做归档是否更方便查找？'],
  ['V05-FI-C-N-071', '几个购物应用的通知开关现在分散在不同设置页，集中列成一张清单会不会更好看？'],
  ['V05-FI-C-N-072', '几个购物应用的通知开关现在分散在不同设置页，改成只保留一次集中提醒是否更省事？'],
  ['V05-FI-C-N-173', '眼前这个项目同时涉及两个人，但我还没说明双方各自是什么角色，后面会不会顺利一点？'],
  ['V05-FI-C-N-174', '眼前这个项目同时涉及两个人，但我还没说明双方各自是什么角色，最终能不能有明确结果？'],
  ['V05-FI-C-N-175', '眼前这个项目同时涉及两个人，但我还没说明双方各自是什么角色，接下来是否会出现变化？'],
  ['V05-FI-C-N-176', '眼前这个项目同时涉及两个人，但我还没说明双方各自是什么角色，往后看能不能慢慢明朗？']
])

let changed = 0
for (const row of calibration.rows || []) {
  const next = replacements.get(row.id)
  if (!next) continue
  row.text = next
  row.presealCorrection = 'deterministic_lexical_collision_v01'
  changed += 1
}
if (changed !== replacements.size) throw new Error(`expected ${replacements.size} corrections, changed ${changed}`)

calibration.presealCorrections = [
  ...(calibration.presealCorrections || []),
  {
    version: 'v0.1',
    kind: 'deterministic_lexical_collision',
    rowIds: [...replacements.keys()],
    encoderProbabilityObserved: false,
    semanticActProbabilityObserved: false,
    routeabilityProbabilityObserved: false,
    fallbackProbabilityObserved: false,
    labelsChanged: false
  }
]
fs.writeFileSync(calibrationPath, `${JSON.stringify(calibration, null, 2)}\n`)
console.log(`Applied ${changed} deterministic preseal lexical corrections; labels/gates unchanged; encoder scoring observed=false.`)
