import fs from 'node:fs'

const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v04-development.mjs'
const before = '公司的薪酬情况让我有些在意，想看这一块后续气象。'
const after = '公司的固定薪酬情况让我有些在意，想看这一块后续气象。'

const source = fs.readFileSync(generatorPath, 'utf8')
const occurrences = source.split(before).length - 1
if (occurrences !== 1) {
  throw new Error(`expected exactly one preseal structural fixture target, found ${occurrences}`)
}
if (source.includes(after)) {
  throw new Error('preseal structural correction already present in generator source')
}
fs.writeFileSync(generatorPath, source.replace(before, after))
console.log('applied 1 preseal structural fixture correction; encoder/model scoring not invoked')
