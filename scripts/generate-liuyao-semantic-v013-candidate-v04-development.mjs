import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const outputPath = process.argv[2] ?? 'tmp/liuyao-semantic-v013-candidate-v04-development.json'
const protocolPath = 'data/liuyao-semantic-v013-candidate-v04-development-freshness-contract-v0.2.1.json'
const routeInventoryPath = 'data/liuyao-semantic-route-inventory-v0.2.json'

for (const modulePath of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) {
  await import(pathToFileURL(path.resolve(modulePath)).href)
}

const arbitration = globalThis.GuiJia?.liuyaoSemanticRouteArbitrationV012
const evidence = globalThis.GuiJia?.liuyaoSemanticRouteEvidenceV03
if (!arbitration?.arbitrate || !evidence?.extract) throw new Error('frozen Evidence/Arbitration modules unavailable')

const routeInventory = JSON.parse(fs.readFileSync(routeInventoryPath, 'utf8'))
const routeIds = routeInventory.routes.map((route) => route.routeId)
if (routeIds.length !== 22 || new Set(routeIds).size !== 22) throw new Error('route inventory is not exactly 22 unique routes')

const strong = [
  ['commercial_transaction','这份采购合同已经谈到最后，双方能不能正式签下来？'],
  ['commercial_transaction','这一笔批发交易本周能否谈成并落地？'],
  ['commercial_transaction','客户这一笔订单最终能不能敲定？'],
  ['inventory_purchase','仓库需要补库存，这轮进货能不能顺利到位？'],
  ['inventory_purchase','门店准备补货，这批商品入库会不会按计划完成？'],
  ['inventory_purchase','经营库存偏少，这次采购商品能否及时进仓？'],
  ['inventory_sale','仓库里的尾货这季度能否全部出清？'],
  ['inventory_sale','这批积压货后面会不会顺利清掉？'],
  ['inventory_sale','经营库存里那批旧货能否在月底前售出？'],
  ['borrow_money','这次经营贷申请最终会不会获批？'],
  ['borrow_money','我准备向家里周转一笔款，这次能否顺利拿到？'],
  ['borrow_money','信用贷正在办理，后面能不能批下来？'],
  ['lend_money','有人找我借一笔周转款，我这次出借是否合适？'],
  ['lend_money','同事向我借钱，我若借给他这笔款后续会怎样？'],
  ['lend_money','朋友从我这里借钱，我准备出借，这事是否顺利？'],
  ['debt_collection','有一笔应收货款拖着，我后面能否把它追回？'],
  ['debt_collection','欠我的那笔款一直没结，这次能不能催回？'],
  ['debt_collection','债权迟迟未付，我准备追债，最终能否收回？'],
  ['debt_repayment','我名下的消费贷今年能否结清？'],
  ['debt_repayment','信用卡欠款我准备分期处理，最后能不能还完？'],
  ['partnership','我和一位搭档准备一起经营工作室，这次合伙是否顺利？'],
  ['partnership','两个人共同经营这家店，合伙关系后面稳不稳？'],
  ['investment_profit','这笔投资后续会不会有收益？'],
  ['investment_profit','我参与这个投资项目，最后能否盈利？'],
  ['investment_liquidation','手里的ETF准备赎回，这次能不能顺利完成？'],
  ['investment_liquidation','我想把基金全部卖出，能否顺利到账？'],
  ['investment_suitability','这只指数基金现在适不适合我参与？'],
  ['investment_suitability','这个投资项目值不值得我现在投？'],
  ['investment_price_trend','这只科技股接下来会不会继续走高？'],
  ['investment_price_trend','手里的基金后面净值会怎么走？'],
  ['income_salary','公司说可能调薪，我的月薪这次会不会上调？'],
  ['income_salary','下个月固定薪酬能否提高一些？'],
  ['income_bonus','今年年终奖能不能按时发下来？'],
  ['income_bonus','项目奖励这次会不会到账？'],
  ['receive_item','网购的相机已经在运输途中，我大概多久能拿到？'],
  ['receive_item','快递里的显示器后面能不能按时送达？'],
  ['item_purchase','我准备买这台空气净化器，对我来说值不值得入手？'],
  ['item_purchase','这个投影仪我现在该不该买？'],
  ['relationship_development','我们还在暧昧阶段，这段关系后面能不能正式在一起？'],
  ['relationship_development','和她已经开始谈恋爱了，接下来感情发展会怎样？'],
  ['marriage_match','我们正在谈婚事，这次能不能顺利领证？'],
  ['marriage_match','这段关系已经到结婚阶段，最后能否成为夫妻？'],
  ['marital_relationship','我和妻子最近关系紧张，婚后相处会不会缓和？'],
  ['marital_relationship','我们夫妻这段时间争执多，后面的婚姻关系会怎样？']
]

const support = [
  ['financial_fortune','最近现金流有些起伏，接下来整体会往哪边走？'],
  ['financial_fortune','手头资金流最近不太稳，未来一阵子的财务节奏如何？'],
  ['financial_fortune','这几个月收支波动明显，后面整体钱财状态怎样？'],
  ['financial_fortune','最近整体进账忽多忽少，想看看未来财务走向。'],
  ['financial_fortune','手头现金流时松时紧，接下来财务面会怎样？'],
  ['business_operation','工作室最近业绩波动，下一阶段经营情况会怎样？'],
  ['business_operation','门店现金流时好时坏，后面的营业状态怎么看？'],
  ['business_operation','网店这阵子利润不稳定，接下来经营状态怎样？'],
  ['business_operation','咖啡店刚过回本线，后续营业状态会怎么变化？'],
  ['business_operation','创业项目现在略有亏损，下一阶段经营能否稳定下来？'],
  ['commercial_transaction','客户的订单目前还在沟通，我想看看这笔交易后续态势。'],
  ['commercial_transaction','供应商这份采购合同还在讨论，后面局势会怎样？'],
  ['commercial_transaction','这一单批发订单目前反复修改，想看后续变化。'],
  ['commercial_transaction','客户那份合同进入最后沟通阶段，接下来态势如何？'],
  ['commercial_transaction','供应商订单现在卡在沟通环节，后续发展怎么看？'],
  ['investment_liquidation','我在考虑把手里的ETF清仓，想看看这个动作后面的影响。'],
  ['investment_liquidation','这只基金准备赎回一部分，想观察退出过程的变化。'],
  ['investment_liquidation','手里的债券基金想全部卖掉，这个退出动作后续怎样？'],
  ['investment_liquidation','我打算把黄金ETF变现，想看看这个安排的后续。'],
  ['investment_liquidation','这笔持仓准备平仓，想看看退出之后的整体变化。'],
  ['investment_position_decision','手里的基金准备减仓一部分，想看看这个调整后面怎样。'],
  ['investment_position_decision','这只股票我在考虑继续持有一阵，想看仓位变化的影响。'],
  ['investment_position_decision','ETF仓位准备调整一下，后续状态怎么看？'],
  ['investment_position_decision','现有持仓想加仓一点，想看看这个动作之后的发展。'],
  ['investment_position_decision','这只基金我有点犹豫要不要减仓，先看仓位调整后的变化。'],
  ['investment_profit','这笔投资的收益前景我有些拿不准，想看后续变化。'],
  ['investment_profit','这个基金最近利润表现反复，后面的整体状态值得观察。'],
  ['investment_profit','投资项目的盈利空间最近变得模糊，想看看后面变化。'],
  ['investment_profit','这只债券基金的收益预期在变化，我想看接下来的表现。'],
  ['investment_profit','这个投资标的目前有利润预期，但后面形势不清楚。'],
  ['investment_price_trend','这只基金最近净值起伏很大，我想看看这一波变化的性质。'],
  ['investment_price_trend','手里这只股票涨跌反复，我想判断目前这段行情的状态。'],
  ['investment_price_trend','黄金ETF最近价格回落，我想看这波变化会如何演化。'],
  ['investment_price_trend','指数基金近期偏弱，我想看这一段价格变化的整体态势。'],
  ['income_salary','最近在想工资这件事，想看看职场收入这一块的整体状态。'],
  ['income_salary','公司的薪酬情况让我有些在意，想看这一块后续气象。'],
  ['income_salary','目前月薪结构没变，我想看看这部分收入的整体趋势。'],
  ['income_salary','基本工资这一块最近让我有些犹豫，想看接下来的整体情况。'],
  ['income_salary','固定薪酬这部分，我想单独看看近期状态。'],
  ['income_bonus','年终奖这件事我最近很在意，想看它的整体情况。'],
  ['income_bonus','公司的奖金安排让我有些拿不准，想看看这一块的状态。'],
  ['income_bonus','绩效奖金这部分最近成了我的关注点，想看它的整体态势。'],
  ['income_bonus','季度奖励这一项，我想单独看看近期情况。'],
  ['income_bonus','项目奖励这件事最近有些悬着，想观察它的发展。']
]

const fallbackByRoute = {
  financial_fortune: ['未来几个月我的经济宽裕程度会不会比现在好一些？','接下来一段时间个人经济景气会不会逐渐改善？'],
  business_operation: ['这家小铺未来整体前景怎么样？','这个工作室往后的经营前景值得继续期待吗？'],
  commercial_transaction: ['这桩商务合作最终会不会敲定？','眼前这次商业磋商最后有没有机会定下来？'],
  inventory_purchase: ['店里货架快空了，近期补一批商品是否顺当？','现有货源不足，这轮把商品补进店里会不会顺利？'],
  inventory_sale: ['仓库那批滞销品后面能不能逐步处理出去？','压着的一批旧商品，接下来有没有机会陆续脱手？'],
  borrow_money: ['最近周转缺口比较大，外面这笔资金能否筹进来？','眼下资金不够，我能不能从外部获得一笔周转支持？'],
  lend_money: ['有人希望我先垫一笔资金给他，这次把钱给出去合适吗？','熟人希望我先拿钱支持他，我把这笔资金交出去好不好？'],
  debt_collection: ['一笔旧应收一直压着，之后有机会回到我手里吗？','之前应得的一笔旧账迟迟未归，后面还能回到我这里吗？'],
  debt_repayment: ['自己背着的那笔债，未来能不能彻底卸下来？','目前身上的债务压力，接下来有没有机会完全解除？'],
  partnership: ['准备和另一位出资人一起把项目做起来，这种共同投入后续合不合拍？','两个人准备共同投入一个项目，这种搭配往后是否协调？'],
  investment_profit: ['这只ETF买入后，最终回报会不会让我满意？','这个投资标的放一段时间，最后回报表现会不会理想？'],
  investment_liquidation: ['手里的基金想退出，资金能不能顺利拿回来？','这项投资准备退出，最后能不能把投入的资金收回来？'],
  investment_suitability: ['这个基金跟我的情况匹不匹配？','这项投资和我现在的条件到底搭不搭？'],
  investment_position_decision: ['手上的股票现在该怎么处理仓位比较好？','现有投资部位接下来该保持还是做些变化？'],
  investment_price_trend: ['这只股票接下来行情会往哪边偏？','这个基金之后的市场表现更可能朝哪个方向发展？'],
  income_salary: ['这份工作的固定报酬之后会不会更理想？','未来一阵子我从工作得到的固定报酬有没有改善空间？'],
  income_bonus: ['今年公司额外激励那一块，我最终能拿到多少？','这次公司额外激励最后会不会落到我这里？'],
  receive_item: ['网上订的那台主机目前还在路上，大概哪天能到我这里？','已经订下的桌椅正在运送，我什么时候能实际拿到？'],
  item_purchase: ['最近看中一把人体工学椅，这个东西适不适合现在入手？','我在考虑买一台咖啡机，这个选择对我来说合适吗？'],
  relationship_development: ['我和正在接触的那个人，关系还能不能更进一步？','和目前来往的这个人，之后有没有机会变得更亲近？'],
  marriage_match: ['我和对象已经谈到成家的事，这一步最后能不能定下来？','两个人正在商量成家的安排，最后能不能真正走到那一步？'],
  marital_relationship: ['我和伴侣已经共同生活多年，这段关系之后会不会更稳？','和长期共同生活的另一半，接下来相处状态会不会改善？']
}

const unresolved = [
  '最近那件安排一直没有定下来，我想知道后面能不能顺利。',
  '前面提到的那件事还有变数，接下来结果会不会如愿？',
  '有个私人计划正在推进，我想看看最后能不能成。',
  '最近正在处理一件重要的事，后续发展会不会顺畅？',
  '有件事情我已经开始着手了，最终结果会不会符合预期？',
  '眼下有个决定让我犹豫，做下去之后整体会怎样？',
  '这段时间推进的那个计划，后面有没有机会顺利落地？',
  '我正在等一件事情的结果，最终会不会有好消息？',
  '最近有个目标反复卡住，后面能不能出现转机？',
  '有项安排已经进入关键阶段，接下来会不会顺利完成？',
  '我心里惦记的那件事，之后的发展会不会越来越清楚？',
  '正在推进的一项个人计划，最后能否达到我想要的结果？',
  '最近作出的那个决定，往后看会不会是合适的选择？',
  '有个事情目前还悬着，我想知道最终能否尘埃落定。',
  '我最近启动了一项安排，接下来整体进展会怎样？',
  '眼前这件事还没有明确结果，之后会不会逐渐变好？',
  '有个目标我已经投入精力，最后能不能实现？',
  '这件正在变化的事情，未来一阵子会朝什么方向发展？',
  '我正在考虑继续推进某件事，后面的结果值得期待吗？',
  '最近有项个人安排需要等结果，最终能不能按预想发展？',
  '眼下这个计划还有不少不确定，我想看看结局如何。',
  '我正在面对一个重要选择，之后的整体结果会不会理想？'
]

const information = [
  '股票交易的佣金现在一般按什么方式计算？',
  '基金赎回时管理费和其他费用分别怎么收？',
  '卖出股票涉及的印花税税率现在是多少？',
  '工资条里的个税这一项具体是怎么计算出来的？',
  '年终奖单独计税时应当按什么规则处理？',
  '申请经营贷通常需要准备哪些材料？',
  '信用贷从申请到放款一般要经过哪些步骤？',
  '贷款提前结清需要办理什么手续？',
  '应收款长期未付时，正式催款流程通常怎么走？',
  '商业合同签约前一般需要核对哪些条款？',
  '供应商订单入库后，库存账应当怎么登记？',
  '清理滞销库存时，会计上通常怎样做账？',
  '两个人共同经营项目时，利润分配协议一般怎么写？',
  '基金清仓以后资金通常需要几个交易日到账？',
  'ETF买卖的交易时间具体是几点到几点？',
  '公司调整固定薪酬时通常需要走哪些审批流程？',
  '绩效奖金制度一般会包含哪些计算指标？',
  '快递显示运输中时怎样查询更详细的物流节点？',
  '网购商品申请退货通常需要满足哪些条件？',
  '结婚登记现在需要准备哪些证件和材料？',
  '夫妻共同财产在法律上通常如何界定？',
  '恋爱关系本身在法律上有没有明确的权利义务？'
]

const outside = [
  '这次求职面试最后能不能拿到录用通知？',
  '我今年申请内部晋升有没有机会通过？',
  '现在换到另一个行业发展，对我来说是不是更合适？',
  '下个月参加资格考试，最终能不能通过？',
  '这次研究生申请最后有没有机会被录取？',
  '正在办理的留学签证最终能不能获批？',
  '计划中的长途旅行能不能按原定日期顺利成行？',
  '今年搬到另一个城市生活，对我来说会不会更顺？',
  '现在租下正在看的这套房子，之后住起来是否合适？',
  '正在谈的劳动争议最后能不能得到有利结果？',
  '这场诉讼继续推进下去，最终结果会不会对我有利？',
  '准备参加的公开比赛，这次有没有机会进入决赛？',
  '我正在写的长篇作品今年能不能顺利完成？',
  '这个创作项目现在继续做下去，最后能不能做成？',
  '准备报名的培训课程，对我接下来的学习是否合适？',
  '这次驾照考试能不能一次通过？',
  '正在申请的工作调动最终会不会获批？',
  '今年准备考取专业证书，结果能不能如愿？',
  '计划参加的公开演出能不能顺利完成？',
  '我准备搬离现在的住处，这次搬迁过程会不会顺利？',
  '最近丢失的那件私人物品还有没有机会找回来？',
  '准备领养的这只宠物跟我的生活节奏合不合适？'
]

function row(id, text, expectedDisposition, expectedRoute, expectedCandidatePath, nonRouteSubtype, construction) {
  return { id, text, expectedDisposition, expectedRoute, expectedCandidatePath, nonRouteSubtype, construction }
}

const rows = []
let sequence = 1
const nextId = () => `V013-V04-D-${String(sequence++).padStart(3, '0')}`

for (const [expectedRoute, text] of strong) {
  const e = evidence.extract(text)
  const result = arbitration.arbitrate(text, e)
  if (!result || result.routeId !== expectedRoute || result.strength !== 'strong') {
    throw new Error(`strong structural mismatch id=${String(sequence).padStart(3,'0')} expected=${expectedRoute} actual=${result?.routeId ?? 'null'}/${result?.strength ?? 'null'}`)
  }
  rows.push(row(nextId(), text, 'route_known', expectedRoute, 'strong_arbitration', null, 'frozen_arbitration_structural_fixture'))
}

for (const [expectedRoute, text] of support) {
  const e = evidence.extract(text)
  const result = arbitration.arbitrate(text, e)
  if (!result || result.routeId !== expectedRoute || result.strength !== 'support') {
    throw new Error(`support structural mismatch id=${String(sequence).padStart(3,'0')} expected=${expectedRoute} actual=${result?.routeId ?? 'null'}/${result?.strength ?? 'null'}`)
  }
  rows.push(row(nextId(), text, 'route_known', expectedRoute, 'support_arbitration', null, 'frozen_arbitration_structural_fixture'))
}

for (const routeId of routeIds) {
  const texts = fallbackByRoute[routeId]
  if (!Array.isArray(texts) || texts.length !== 2) throw new Error(`fallback text count != 2 for ${routeId}`)
  for (const text of texts) {
    const e = evidence.extract(text)
    const result = arbitration.arbitrate(text, e)
    if (result) throw new Error(`fallback structural mismatch expected arbitration=null route=${routeId} actual=${result.routeId}/${result.strength}`)
    rows.push(row(nextId(), text, 'route_known', routeId, 'fallback_head', null, 'all22_arbitration_null_fixture'))
  }
}

for (const text of unresolved) rows.push(row(nextId(), text, 'non_route', null, null, 'route_unresolved', 'eligible_act_insufficient_current22_target'))
for (const text of information) rows.push(row(nextId(), text, 'non_route', null, null, 'near_domain_not_current_route', 'non_divination_information_act'))
for (const text of outside) rows.push(row(nextId(), text, 'non_route', null, null, 'outside_current_22', 'eligible_act_outside_frozen_route_universe'))

const expected = { total:198, strong:44, support:44, fallback:44, unresolved:22, information:22, outside:22 }
const counts = {
  total: rows.length,
  strong: rows.filter((r) => r.expectedCandidatePath === 'strong_arbitration').length,
  support: rows.filter((r) => r.expectedCandidatePath === 'support_arbitration').length,
  fallback: rows.filter((r) => r.expectedCandidatePath === 'fallback_head').length,
  unresolved: rows.filter((r) => r.nonRouteSubtype === 'route_unresolved').length,
  information: rows.filter((r) => r.construction === 'non_divination_information_act').length,
  outside: rows.filter((r) => r.nonRouteSubtype === 'outside_current_22').length
}
if (JSON.stringify(counts) !== JSON.stringify(expected)) throw new Error(`dataset counts mismatch ${JSON.stringify(counts)}`)
if (new Set(rows.map((r) => r.id)).size !== rows.length) throw new Error('duplicate ids')
if (new Set(rows.map((r) => r.text)).size !== rows.length) throw new Error('exact duplicate fresh texts')

const fallbackCoverage = Object.fromEntries(routeIds.map((routeId) => [routeId, rows.filter((r) => r.expectedCandidatePath === 'fallback_head' && r.expectedRoute === routeId).length]))
if (Object.values(fallbackCoverage).some((count) => count !== 2)) throw new Error('fallback all-22 coverage failed')

const artifact = {
  version: '0.13-candidate-v0.4-development-v0.1-preseal',
  status: 'generated_unscored_awaiting_freshness_verification',
  generator: 'scripts/generate-liuyao-semantic-v013-candidate-v04-development.mjs',
  protocol: protocolPath,
  routeInventory: routeInventoryPath,
  encoderScoringObserved: false,
  modelProbabilityObserved: false,
  runtimeMutationAllowed: false,
  counts,
  fallbackAll22Coverage: fallbackCoverage,
  rows
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`)
console.log('CANDIDATE_V04_DEVELOPMENT_GENERATION_SUMMARY', JSON.stringify({ version:artifact.version, counts, fallbackRoutes:Object.keys(fallbackCoverage).length, encoderScoringObserved:false }))
