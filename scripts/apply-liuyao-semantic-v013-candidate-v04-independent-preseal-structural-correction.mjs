import fs from 'node:fs'

const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v04-independent.mjs'
if (!fs.existsSync(generatorPath)) throw new Error(`generator missing: ${generatorPath}`)

let source = fs.readFileSync(generatorPath, 'utf8')
const strongAnchor = "const strongSelected = roundRobinTake(pool.strong_arbitration, 44)"
if ((source.split(strongAnchor).length - 1) !== 1) throw new Error('independent strong supplement patch anchor count != 1')

const strongInjected = `const presealStrongSupplement = {
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

${strongAnchor}`
source = source.replace(strongAnchor, strongInjected)

const supportAnchor = "const supportSelected = roundRobinTake(pool.support_arbitration, 44)"
if ((source.split(supportAnchor).length - 1) !== 1) throw new Error('independent support supplement patch anchor count != 1')
const supportInjected = `const presealSupportSupplement = {
  financial_fortune: [
    '最近财运方面整体是什么状态？','接下来一阵钱财运势总体怎样？','这一阶段我的财务运势大体如何？','最近现金流和钱财状态总体怎么样？','往后几个月财运层面会是什么走势？','近期整体收支和财务状态如何？','最近手头钱财这一块总体表现怎样？','未来一阵子的财运状况大致如何？',
    '今年剩下的时间，我整体钱财状况会呈现什么样的起伏？',
    '从现在往后看，我在财务这一面的大趋势会是怎样？',
    '最近总觉得钱进钱出变化不少，整体财运处在什么阶段？',
    '如果只看未来几个月，我的经济状态总体会朝什么方向变化？',
    '这一季手头宽紧反复，整体钱财环境接下来会怎样演变？',
    '不针对某一笔收入，只看近期我的财务局面大体如何？',
    '接下来的生活里，钱财方面整体是趋于宽松还是仍旧吃紧？',
    '今年后面这段，我在金钱方面的总体状态会发生什么变化？',
    '最近收支节奏有些乱，未来一阵整体财务状态能否趋稳？',
    '从较长一点的周期看，我目前的钱财局面之后会怎样发展？',
    '眼下不问具体哪笔钱，只看我整体的财运处境是什么样？',
    '未来这一阶段，我个人财务层面的总体气势会不会有所改善？'
  ],
  business_operation: [
    '这家门店最近经营状况总体怎样？','我这间工作室后续经营情况如何？','这门生意最近的营业状态怎么样？','网店接下来一阵经营表现如何？','目前这个店铺的经营势头怎样？','自己做的业务近期经营情况如何？','门店这段时间营业状态总体怎么样？','这项长期生意后面经营表现如何？',
    '这家店已经开了一阵子，接下来整体经营局面会怎样变化？',
    '我自己维持的这项业务，未来几个月营业状态大体如何？',
    '不问某一单成交，只看门店之后一段时间的经营走势怎样？',
    '目前工作室日常运转还算稳定，后面的经营态势会怎么发展？',
    '这门长期做下去的生意，接下来整体经营环境会有什么变化？',
    '网店最近客流起伏比较明显，往后整体营业状态会怎样？',
    '从持续经营的角度看，我这家小店未来一阵表现如何？',
    '最近业务量忽高忽低，这项生意后面总体能否逐渐稳定？',
    '只看整个门店的持续运营，接下来这段时间会处在什么状态？',
    '我自己做的这个长期项目，之后经营层面的总体走势怎样？',
    '这家店目前还在正常运转，往后几个月经营状况会如何演变？',
    '眼下不看单笔订单，只看整门生意未来一阵的运营情况怎样？'
  ],
  investment_position_decision: [
    '这只股票目前仓位情况后面该怎么处理？','现有持仓接下来需要怎样安排？','我这笔投资当前仓位后续如何调整比较好？','手里的持仓现在该怎么安排更合适？','这项投资的仓位接下来应该怎样处理？','现在持有的这部分仓位后面怎么调整？','当前持仓比例接下来该如何安排？','这笔投资眼下的仓位处理方向怎样？'
  ],
  investment_profit: [
    '这笔投资后面的收益情况总体怎样？','这项投入接下来利润表现如何？','已经投进去的资金以后收益状况怎样？','这只基金后续盈利情况大体如何？','目前这项投资的回报表现会怎样？','这笔资金投入后的收益层面怎么样？'
  ],
  investment_suitability: [
    '这个投资标的整体适配情况怎样？','这个项目作为投资对象总体合适程度如何？','这项投资对我的适合程度大体怎样？','眼前这个标的从投资适配角度看如何？','这个投资机会整体是否值得考虑？','这个对象从投资匹配角度总体怎么样？'
  ],
  investment_price_trend: [
    '这只股票近期价格走势总体怎样？','这个投资标的接下来价位趋势如何？','这只基金最近市场价格走势怎么样？','目前这个标的后续价格方向大体如何？','这项投资近期价位变化趋势怎样？','手里这个标的往后一阵价格走势如何？'
  ],
  income_salary: [
    '最近工资收入这一块总体怎么样？','接下来几个月薪资情况大致如何？','目前每月工资这一项后面情况怎样？','近期固定薪资收入整体表现如何？','未来一阵工资方面的状态怎么样？','今年薪资这一块总体情况怎样？'
  ],
  income_bonus: [
    '今年奖金这一块总体情况怎样？','近期绩效奖金方面大体是什么状态？','接下来额外奖金收入情况如何？','这段时间公司奖金这一项总体怎样？','年终奖方面今年整体情况如何？','近期奖金收入这一块表现怎么样？'
  ],
  commercial_transaction: [
    '最近这桩商业交易整体进展怎样？','这笔商务交易目前情况如何？','眼下客户这笔订单交易状态怎么样？','这次商业买卖整体进展如何？','目前这笔交易后续情况大体怎样？','正在谈的商务订单整体状态如何？'
  ]
}
for (const [routeId, texts] of Object.entries(presealSupportSupplement)) {
  for (const text of texts) {
    const { evidence, arb } = inspect(text)
    if ((evidence.unsupportedTargets || []).length === 0 && arb?.routeId === routeId && arb?.strength === 'support') {
      pool.support_arbitration.push({ routeId, text })
    }
  }
}

${supportAnchor}`
source = source.replace(supportAnchor, supportInjected)
fs.writeFileSync(generatorPath, source, 'utf8')
console.log('CANDIDATE_V04_INDEPENDENT_PRESEAL_STRUCTURAL_SUPPLEMENTS_APPLIED')
