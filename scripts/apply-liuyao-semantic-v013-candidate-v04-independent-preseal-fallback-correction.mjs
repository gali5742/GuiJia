import fs from 'node:fs'

const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v04-independent.mjs'
if (!fs.existsSync(generatorPath)) throw new Error(`generator missing: ${generatorPath}`)

let source = fs.readFileSync(generatorPath, 'utf8')
const replacements = new Map([
  [
    "'往后这一阵子，我手头会不会比现在宽裕许多？'",
    "'接下来这一阵，平常生活里的经济余地会不会比现在多一些？'"
  ],
  [
    "'接下来一段时间，日常用钱会不会越来越从容？'",
    "'往后这段时间，日常开销应付起来会不会越来越轻松？'"
  ],
  [
    "'眼下资金缺个口子，向熟人开口求一笔周转能不能拿到？'",
    "'眼下差一笔临时周转，我去找认识的人帮我补上这个缺口能不能成？'"
  ],
  [
    "'对方已经发出的那件东西，这两天我能不能拿到？'",
    "'对方那件东西已经在路上了，这两天会不会真正交到我这里？'"
  ],
  [
    "'看中的那台机器这周能不能顺利弄到手？'",
    "'我已经看准的那个具体物件，这周能不能顺利归到我这里？'"
  ],
  [
    "'两个人已经有些暧昧了，接下来彼此会不会继续靠近？'",
    "'两个人现在明显比普通朋友更亲近，接下来彼此会不会继续靠近？'"
  ],
  [
    "'如果以后一直和这个人在一起生活，我们两个人到底合不合拍？'",
    "'如果未来长期和这个人共同安排生活，我们彼此到底合不合拍？'"
  ]
])

for (const [from, to] of replacements) {
  const count = source.split(from).length - 1
  if (count !== 1) throw new Error(`fallback preseal patch anchor count ${count} != 1: ${from}`)
  source = source.replace(from, to)
}

fs.writeFileSync(generatorPath, source, 'utf8')
console.log('CANDIDATE_V04_INDEPENDENT_PRESEAL_FALLBACK_CORRECTION_APPLIED', replacements.size)
