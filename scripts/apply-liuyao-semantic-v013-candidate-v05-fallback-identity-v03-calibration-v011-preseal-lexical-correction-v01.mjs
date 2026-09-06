import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const calibrationPath = path.join(root, 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v0.1.1.json')
const calibration = JSON.parse(fs.readFileSync(calibrationPath, 'utf8'))
if (calibration.status !== 'presealed_fallback_identity_v03_calibration_v011' || calibration.sealed !== false) throw new Error('calibration v0.1.1 is not mutable preseal data')

const replacements = new Map([
  ['V05-FI-C11-K-001', '最近每个月真正能留下的余量总是不多，接下来会不会慢慢多出一点余地？'],
  ['V05-FI-C11-K-002', '最近每个月真正能留下的余量总是不多，往后看能不能比眼下从容一些？'],
  ['V05-FI-C11-K-003', '最近每个月真正能留下的余量总是不多，之后是否会慢慢松动一些？'],
  ['V05-FI-C11-K-004', '今年几项固定开销接连压过来，我能自由安排的余量比往常少，接下来会不会慢慢多出一点余地？'],
  ['V05-FI-C11-K-005', '今年几项固定开销接连压过来，我能自由安排的余量比往常少，往后看能不能比眼下从容一些？'],
  ['V05-FI-C11-K-006', '今年几项固定开销接连压过来，我能自由安排的余量比往常少，之后是否会慢慢松动一些？'],
  ['V05-FI-C11-K-007', '最近每个月剩下的可用余量忽多忽少，我对后面会不会轻松些没有把握，接下来会不会慢慢多出一点余地？'],
  ['V05-FI-C11-K-008', '最近每个月剩下的可用余量忽多忽少，我对后面会不会轻松些没有把握，往后看能不能比眼下从容一些？'],
  ['V05-FI-C11-K-009', '最近每个月剩下的可用余量忽多忽少，我对后面会不会轻松些没有把握，之后是否会慢慢松动一些？'],

  ['V05-FI-C11-K-013', '我每天都在做的这摊事最近来的人忽多忽少，接下来会不会还能继续撑得住？'],
  ['V05-FI-C11-K-014', '我每天都在做的这摊事最近来的人忽多忽少，往后看能不能慢慢顺下来？'],
  ['V05-FI-C11-K-015', '我每天都在做的这摊事最近来的人忽多忽少，之后是否还留有持续做下去的空间？'],
  ['V05-FI-C11-K-017', '手里这门长期在做的事情已经持续一阵，但最近每天的状况让我有些拿不准，往后看能不能慢慢顺下来？'],
  ['V05-FI-C11-K-023', '我每天守着的这件长期事情近期起伏明显，往后看能不能慢慢顺下来？'],

  ['V05-FI-C11-K-025', '我和对方眼前这回事已经来回谈了几轮，但最后条件还没有完全一致，接下来会不会把剩下的分歧说定？'],
  ['V05-FI-C11-K-026', '我和对方眼前这回事已经来回谈了几轮，但最后条件还没有完全一致，往后看能不能最后形成双方都接受的结果？'],
  ['V05-FI-C11-K-027', '我和对方眼前这回事已经来回谈了几轮，但最后条件还没有完全一致，之后是否会顺利落定？'],

  ['V05-FI-C11-K-064', '最近几笔支出接连赶到同一段时间，让我这阵子需要额外一点过渡余量，接下来会不会有人先帮我接住这一段？'],
  ['V05-FI-C11-K-065', '最近几笔支出接连赶到同一段时间，让我这阵子需要额外一点过渡余量，往后看能不能暂时得到外部支持？'],
  ['V05-FI-C11-K-066', '最近几笔支出接连赶到同一段时间，让我这阵子需要额外一点过渡余量，之后是否会有人替我把这个短暂空档接上？'],

  ['V05-FI-C11-K-112', '我们两边正在讨论把各自负责的部分接成一个需要长期协作的项目，接下来会不会配合得住？'],
  ['V05-FI-C11-K-113', '我们两边正在讨论把各自负责的部分接成一个需要长期协作的项目，往后看能不能持续推进？'],
  ['V05-FI-C11-K-114', '我们两边正在讨论把各自负责的部分接成一个需要长期协作的项目，之后是否会慢慢形成稳定配合？'],

  ['V05-FI-C11-N-073', '以后每次材料送进仓库后我想当场核对，而不是月底统一核对，这种流程会不会更容易长期执行？'],

  ['V05-FI-C11-N-297', '我想把短周期图和长周期图分成两个页面查看，这种观察办法会不会更清楚？'],
  ['V05-FI-C11-N-298', '我想把短周期图和长周期图分成两个页面查看，从长期使用来看这样看变化是否更适合我？'],
  ['V05-FI-C11-N-299', '我想把短周期图和长周期图分成两个页面查看，如果按这个方案执行会不会更容易保持观察节奏？'],
  ['V05-FI-C11-N-300', '我想把短周期图和长周期图分成两个页面查看，改成这种做法以后是否更方便比较不同时间尺度？'],

  ['V05-FI-C11-K-262', '我们已经维持长期家庭生活很多年，但最近两个人的相处不太平稳，接下来会不会重新缓和下来？'],
  ['V05-FI-C11-K-263', '我们已经维持长期家庭生活很多年，但最近两个人的相处不太平稳，往后看能不能恢复更顺的相处状态？'],
  ['V05-FI-C11-K-264', '我们已经维持长期家庭生活很多年，但最近两个人的相处不太平稳，之后是否会重新稳定下来？'],

  ['V05-FI-C11-N-589', '眼前这边接下来会处理一组现有物品，可我还没有说明是准备多准备一些还是让数量变少，后面会不会逐渐明朗？'],
  ['V05-FI-C11-N-590', '眼前这边接下来会处理一组现有物品，可我还没有说明是准备多准备一些还是让数量变少，接下来能不能出现明确结果？'],
  ['V05-FI-C11-N-591', '眼前这边接下来会处理一组现有物品，可我还没有说明是准备多准备一些还是让数量变少，之后是否会顺利一些？'],
  ['V05-FI-C11-N-592', '眼前这边接下来会处理一组现有物品，可我还没有说明是准备多准备一些还是让数量变少，往后看会不会有变化？'],

  ['V05-FI-C11-N-605', '眼前这件事同时牵涉我和另一个人，但没有说明双方是在长期协作还是私人往来方面，后面会不会逐渐明朗？'],
  ['V05-FI-C11-N-606', '眼前这件事同时牵涉我和另一个人，但没有说明双方是在长期协作还是私人往来方面，接下来能不能出现明确结果？'],
  ['V05-FI-C11-N-607', '眼前这件事同时牵涉我和另一个人，但没有说明双方是在长期协作还是私人往来方面，之后是否会顺利一些？'],
  ['V05-FI-C11-N-608', '眼前这件事同时牵涉我和另一个人，但没有说明双方是在长期协作还是私人往来方面，往后看会不会有变化？']
])

let changed = 0
for (const row of calibration.rows || []) {
  const text = replacements.get(row.id)
  if (!text) continue
  row.text = text
  row.presealCorrection = 'deterministic_lexical_collision_v011_01'
  changed += 1
}
if (changed !== replacements.size) throw new Error(`expected ${replacements.size} replacements, changed ${changed}`)

calibration.presealCorrections = [
  ...(calibration.presealCorrections || []),
  {
    version: 'v0.1',
    kind: 'deterministic_lexical_collision',
    source: 'preseal_arbitration_only_no_encoder',
    rowIds: [...replacements.keys()],
    changedRows: replacements.size,
    labelsChanged: false,
    countsChanged: false,
    similarityGatesChanged: false,
    reachabilityGatesChanged: false,
    encoderProbabilityObserved: false,
    semanticActProbabilityObserved: false,
    routeabilityProbabilityObserved: false,
    fallbackProbabilityObserved: false,
    protectedHistoricalRowTextRead: false
  }
]
fs.writeFileSync(calibrationPath, `${JSON.stringify(calibration, null, 2)}\n`)
console.log(`Applied ${changed} calibration v0.1.1 deterministic preseal lexical corrections; labels/counts/gates unchanged; encoder scoring observed=false.`)
