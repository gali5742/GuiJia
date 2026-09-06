import fs from 'node:fs'

const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v04-independent.mjs'
if (!fs.existsSync(generatorPath)) throw new Error(`generator missing: ${generatorPath}`)

let source = fs.readFileSync(generatorPath, 'utf8')
const anchor = "const strongSelected = roundRobinTake(pool.strong_arbitration, 44)"
if ((source.split(anchor).length - 1) !== 1) throw new Error('independent strong supplement patch anchor count != 1')

const injected = `const presealStrongSupplement = {
  commercial_transaction: [
    '这笔商业交易已经进入成交阶段，最后能不能正式成交？',
    '这次客户采购的商业订单能否在本周完成成交？'
  ],
  inventory_purchase: [
    '店里库存不足，这次补货进货能不能完整到位？',
    '仓库要补一轮库存，这批进货采购能否顺利完成？'
  ],
  inventory_sale: [
    '仓库这批库存现在出售，能不能顺利卖完？',
    '店里积压的存货近期销售清货能不能完成？'
  ],
  borrow_money: [
    '我现在需要向别人借一笔钱，这次能不能顺利借到？',
    '为了周转我准备借款，这笔钱能不能成功拿到手？'
  ],
  lend_money: [
    '对方现在向我借钱，我把这笔钱借出去是否合适？',
    '朋友提出借款，我这次把自己的钱借给他会不会有问题？'
  ],
  debt_collection: [
    '对方欠我的钱一直没还，这次催收能不能把欠款收回来？',
    '我作为债权人去追这笔欠款，近期能不能顺利追回？'
  ],
  debt_repayment: [
    '我欠下的这笔钱现在要还，近期能不能全部偿还清楚？',
    '这笔借款是我需要往外还的，本月能不能顺利还清？'
  ],
  partnership: [
    '我和他准备正式合伙做生意，这段合伙关系能不能稳定？',
    '两个人要建立长期商业合伙，这次合作关系是否合适？'
  ],
  investment_profit: [
    '我已经投资了这笔资金，最终盈利目标能不能实现？',
    '这项投资现在关心的是最后能不能赚到利润，结果会不会盈利？'
  ],
  investment_liquidation: [
    '我现在明确想把这笔投资卖出退出，此时清仓是否合适？',
    '当前持仓准备全部变现离场，现在做投资退出能不能顺利？'
  ],
  investment_suitability: [
    '我现在就是在判断这个投资标的适不适合买入参与？',
    '眼前这个项目作为投资对象，对我来说是否适合投入资金？'
  ],
  investment_price_trend: [
    '我现在只想判断这个投资标的接下来价格趋势是涨还是跌？',
    '这只股票当前要看的就是未来一段价格走势会不会上涨？'
  ],
  income_salary: [
    '这次公司固定工资调薪，我的月薪能不能明确增加？',
    '今年薪资调整针对每月工资，我能不能获得加薪？'
  ],
  income_bonus: [
    '公司这次发放绩效奖金，我最终能不能拿到这笔奖金？',
    '今年年终奖进入发放阶段，我会不会实际收到奖金？'
  ],
  receive_item: [
    '快递已经在配送，这个包裹今天能不能送到并让我收到？',
    '物流中的这件物品正在派送，我近期能不能顺利收货？'
  ],
  item_purchase: [
    '我现在准备购买这台具体设备，这次能不能顺利买到手？',
    '看中的这件商品准备下单购买，现在入手是否合适？'
  ],
  relationship_development: [
    '我和这个恋爱对象正在发展感情，接下来关系能不能更进一步？',
    '我们现在属于恋爱发展阶段，这段感情以后会不会继续推进？'
  ],
  marriage_match: [
    '我和这个人现在明确考虑结婚，我们两人婚姻匹配是否合适？',
    '眼前这个对象是结婚人选，我和他进入婚姻到底合不合适？'
  ],
  marital_relationship: [
    '我和配偶已经在婚姻中，当前夫妻关系后面能不能改善？',
    '这是现有夫妻婚姻关系的问题，我们之间近期能不能重新稳定？'
  ]
}
for (const [routeId, texts] of Object.entries(presealStrongSupplement)) {
  for (const text of texts) {
    const { evidence, arb } = inspect(text)
    if ((evidence.unsupportedTargets || []).length === 0 && arb?.routeId === routeId && arb?.strength === 'strong') {
      pool.strong_arbitration.push({ routeId, text })
    }
  }
}

${anchor}`
source = source.replace(anchor, injected)
fs.writeFileSync(generatorPath, source, 'utf8')
console.log('CANDIDATE_V04_INDEPENDENT_PRESEAL_STRONG_SUPPLEMENT_APPLIED')
