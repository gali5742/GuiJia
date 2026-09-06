import fs from 'node:fs'
import vm from 'node:vm'

const contractPath = 'data/liuyao-semantic-v013-candidate-v04-independent-contract-v0.1.json'
const outputPath = 'data/liuyao-semantic-v013-candidate-v04-independent.json'
const candidateLockPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.4.lock.json'

if (!fs.existsSync(contractPath)) throw new Error('Independent contract missing')
if (!fs.existsSync(candidateLockPath)) throw new Error('Candidate v0.4 lock missing')
if (fs.existsSync(outputPath)) throw new Error(`Independent target already exists: ${outputPath}`)

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'))
const candidateLock = JSON.parse(fs.readFileSync(candidateLockPath, 'utf8'))
if (contract.status !== 'frozen_after_candidate_lock_before_fresh_independent_generation') throw new Error('Independent contract not frozen')
if (candidateLock.status !== 'locked_after_fresh_development_pass_before_independent_evaluation') throw new Error('Candidate v0.4 not locked')
if (candidateLock.invariants?.independentEvaluationMustBeFreshPostLock !== true) throw new Error('Candidate lock does not require fresh post-lock independent evaluation')

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number }
context.window = context
context.globalThis = context
vm.createContext(context)
for (const path of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) {
  vm.runInContext(fs.readFileSync(path, 'utf8'), context, { filename: path })
}
const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV03
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012
if (!evidenceExtractor?.extract || !arbitration?.arbitrate) throw new Error('Deterministic Evidence/Arbitration modules unavailable')

const routes = [
  'financial_fortune','business_operation','commercial_transaction','inventory_purchase','inventory_sale',
  'borrow_money','lend_money','debt_collection','debt_repayment','partnership','investment_profit',
  'investment_liquidation','investment_suitability','investment_position_decision','investment_price_trend',
  'income_salary','income_bonus','receive_item','item_purchase','relationship_development','marriage_match','marital_relationship'
]

const specs = {
  financial_fortune: {
    strong: ['最近整体财运会不会明显转旺？','接下来这段时间钱财进出能不能宽松起来？','今年后半段我的现金流会不会更顺？'],
    support: ['接下来几个月财运总体怎样？','最近手头资金的整体走势会不会改善？','这阵子的收支状态能不能慢慢好转？'],
    fallback: ['往后这一阵子，我手头会不会比现在宽裕许多？','接下来一段时间，日常用钱会不会越来越从容？']
  },
  business_operation: {
    strong: ['这家门店接下来经营能不能稳定走高？','我这间工作室今年生意能不能越做越顺？','这个网店后续营业状况会不会改善？'],
    support: ['这家小店接下来的经营势头怎样？','我自己做的这门生意后面能不能稳住？','门店最近这段经营状态会不会转好？'],
    fallback: ['我自己长期做的这摊事情，接下来能不能渐渐站稳？','眼下这份自己撑起来的营生，后面会不会越做越顺手？']
  },
  commercial_transaction: {
    strong: ['这份供货合同本周能不能正式成交？','双方已经谈到签约阶段，这笔交易能不能落定？','客户这次采购订单最终能不能成交？'],
    support: ['最近正在谈的这桩交易走势怎样？','这次商务往来最后能不能顺利收尾？','眼下这笔买卖后面会不会有结果？'],
    fallback: ['对方已经谈到最后一步，这一单最后会不会点头？','条件都交换得差不多了，这回合作能不能真正定下来？']
  },
  inventory_purchase: {
    strong: ['仓库这轮补货能不能按计划进齐？','这批库存采购能不能顺利完成？','店里准备补一批存货，这次进货会不会顺利？'],
    support: ['这轮库存补充后续顺不顺？','店里这次补货的整体情况怎样？','近期这批进货安排能不能如期推进？'],
    fallback: ['货架快见底了，这一轮补进来的东西能不能按时到齐？','手头货源不够，这次再添一批能不能顺顺当当补上？']
  },
  inventory_sale: {
    strong: ['仓库里这批库存近期能不能卖掉？','这批积压货这个月能不能顺利清出去？','店里剩下的存货能不能尽快销售完？'],
    support: ['这批库存接下来的销售情况怎样？','仓库里的存货后面好不好出？','近期这批货的去化会不会加快？'],
    fallback: ['库房里压着的这一批东西，这阵子能不能慢慢清空？','剩下的那批东西占着地方，近期能不能陆续处理出去？']
  },
  borrow_money: {
    strong: ['我向银行借这笔周转金能不能批下来？','这次找朋友借钱能不能顺利借到？','公司临时缺口这笔借款能不能拿到？'],
    support: ['这次借款的结果会怎样？','近期为了周转去借钱顺不顺？','眼下这笔借钱安排能不能成？'],
    fallback: ['手头差一笔周转，去找人帮我垫上这笔能不能成？','眼下资金缺个口子，向熟人开口求一笔周转能不能拿到？']
  },
  lend_money: {
    strong: ['朋友来借钱，这笔钱借给他合不合适？','把这笔钱借给合作方会不会有问题？','亲戚想借这笔款，我现在出借是否合适？'],
    support: ['近期把钱借出去这件事结果怎样？','这次出借一笔钱是否稳妥？','有人来借款，我应不应该把钱借出去？'],
    fallback: ['朋友临时缺一笔周转，我把这笔钱给他用一阵子合不合适？','对方开口需要一笔现金，我先把自己的钱给出去会不会惹麻烦？']
  },
  debt_collection: {
    strong: ['拖欠我的这笔钱近期能不能收回来？','对方欠款这个月能不能追回？','这笔应收债务近期能不能顺利回款？'],
    support: ['这笔欠款后续回收情况怎样？','最近催这笔债能不能有结果？','对方拖着的钱什么时候能回到我这里？'],
    fallback: ['拖了我很久的那笔钱，最近能不能终于拿回来？','一直没给我的那部分款，这阵子有没有机会真正回到手里？']
  },
  debt_repayment: {
    strong: ['我这笔欠款本月能不能按时还清？','现在这笔债务能不能顺利偿还完？','这期需要还的借款能不能如期结清？'],
    support: ['最近还债这件事能不能顺利？','这笔需要偿还的钱后面会不会有压力？','本月归还欠款能否按计划完成？'],
    fallback: ['之前留下的那笔钱，这个月我能不能彻底结清？','眼下那笔必须补回去的钱，我近期能不能全部处理完？']
  },
  partnership: {
    strong: ['和这个人合伙开店能不能长期合作？','这次与朋友合伙做项目是否合适？','我和他建立商业合伙关系能不能稳定？'],
    support: ['这次合伙合作后续会怎样？','我跟他一起做事能不能长期配合？','近期这段合伙关系稳不稳？'],
    fallback: ['我和他一起把这件事做下去，后面能不能一直搭得住？','两个人共同出力做这件长期的事，之后会不会越配合越顺？']
  },
  investment_profit: {
    strong: ['这笔投资最后能不能实现盈利？','我投进这个项目的钱能不能赚到收益？','这只基金这轮投资最终会不会赚钱？'],
    support: ['这次投资收益结果会怎样？','眼下这笔投入后面有没有利润？','这轮资金投入最终回报好不好？'],
    fallback: ['放进去的这笔钱最后会不会有明显盈余？','我已经把钱放进去了，收尾时能不能比本金多拿回来一些？']
  },
  investment_liquidation: {
    strong: ['手里的这只股票现在卖出能不能顺利落袋？','这笔投资现在退出是否合适？','目前持有的基金现在清仓好不好？'],
    support: ['这笔投资近期退出的结果怎样？','现在把持有部分卖掉会不会更好？','眼下结束这笔投入是否顺利？'],
    fallback: ['手上那部分现在退出来，能不能顺利把钱真正落袋？','已经拿了一阵子的那部分，现在收回来是不是合适的时机？']
  },
  investment_suitability: {
    strong: ['这个投资标的现在适不适合买入？','这只基金目前适合我投入吗？','眼前这个项目值不值得现在投资？'],
    support: ['这次投资是否适合我参与？','这个标的对我来说合不合适？','现在进这个项目是不是合适？'],
    fallback: ['这个东西现在适不适合把一笔钱放进去？','眼前这个机会我该不该把自己的资金投进去参与？']
  },
  investment_position_decision: {
    strong: ['这只股票现在应该加仓还是减仓？','现有持仓继续拿着还是降低仓位更好？','这笔投资当前仓位要不要调整？'],
    support: ['现在这部分持仓接下来该怎么处理？','眼下仓位继续维持是否合适？','这笔投资目前需要调整持有比例吗？'],
    fallback: ['手里这部分现在继续留着好，还是减少一些更好？','已经拿在手上的这部分，我眼下该继续保留还是往回收一点？']
  },
  investment_price_trend: {
    strong: ['这只股票接下来价格会涨还是会跌？','这个基金近期价格趋势会不会向上？','手里这个标的下个月价位走势怎样？'],
    support: ['这项投资近期价格方向如何？','接下来这只标的的价位会怎么走？','这段时间它的市场价格趋势怎样？'],
    fallback: ['手上这个东西接下来一阵子价位会往上还是往下？','我盯着的那个对象，近期价格更可能走高还是走低？']
  },
  income_salary: {
    strong: ['公司这次调薪我的工资能不能涨？','下个月固定工资会不会增加？','今年薪资调整我能不能拿到加薪？'],
    support: ['今年工资收入整体会不会提高？','近期薪资方面有没有变化？','接下来固定收入这块会不会变多？'],
    fallback: ['单位每个月固定发给我的那笔钱，接下来会不会增加？','我每月稳定拿到的那部分收入，近期有没有往上调的机会？']
  },
  income_bonus: {
    strong: ['今年年终奖我能不能拿到？','这个季度奖金会不会发给我？','这次绩效奖金最终有没有我的份？'],
    support: ['今年奖金方面结果怎样？','近期额外奖励收入会不会有？','这次公司发奖金我能不能分到？'],
    fallback: ['年底那笔额外发放的钱，今年我还有没有机会拿到？','除了每月固定那部分之外，公司这次会不会再多发一笔给我？']
  },
  receive_item: {
    strong: ['这个快递今天能不能顺利收到？','寄来的包裹明天会不会送到我手上？','这件物流中的物品这周能不能收到？'],
    support: ['这次收货能不能按时完成？','寄过来的东西什么时候能到？','近期这件物品能不能顺利收下？'],
    fallback: ['寄来的东西今天能不能真正到我手上？','对方已经发出的那件东西，这两天我能不能拿到？']
  },
  item_purchase: {
    strong: ['我看中的这台相机这周能不能买到？','这辆二手车现在购买合不合适？','这台电脑近期能不能顺利买下来？'],
    support: ['近期购买这件东西结果怎样？','我现在入手这台设备合适吗？','这次买这件物品会不会顺利？'],
    fallback: ['看中的那台机器这周能不能顺利弄到手？','眼前这个具体东西，我现在花钱拿下来是否合适？']
  },
  relationship_development: {
    strong: ['我和他这段感情接下来会不会继续发展？','我们现在的恋爱关系后面能不能更进一步？','我跟这个对象未来感情会不会越来越近？'],
    support: ['这段感情接下来走势怎样？','我和他后面的关系发展会如何？','我们目前这段恋爱能不能稳定推进？'],
    fallback: ['我和他现在这样，后面会不会一点点走得更近？','两个人已经有些暧昧了，接下来彼此会不会继续靠近？']
  },
  marriage_match: {
    strong: ['我和这个对象结婚合不合适？','我们两个人适不适合进入婚姻？','跟他成婚以后整体是否匹配？'],
    support: ['我和他适不适合长期结婚生活？','这段关系走到婚姻合适吗？','我们两人的婚配整体怎样？'],
    fallback: ['这个人适不适合和我把日子长期过下去？','如果以后一直和这个人在一起生活，我们两个人到底合不合拍？']
  },
  marital_relationship: {
    strong: ['我和配偶最近的婚姻关系能不能缓和？','我们夫妻这段时间关系会不会改善？','现在这段婚姻后面能不能重新稳定？'],
    support: ['夫妻关系接下来会怎样？','我和另一半最近这段婚姻状态能否转好？','我们目前的婚姻关系后续是否稳定？'],
    fallback: ['我们已经一起过了很久日子，最近彼此这种紧张能不能缓下来？','两个人已经共同生活多年，眼下这层关系后面能不能重新安稳？']
  }
}

const inspect = (text) => {
  const evidence = evidenceExtractor.extract(text)
  const arb = arbitration.arbitrate(text, evidence)
  return { evidence, arb }
}

const row = (id, text, expectedDisposition, expectedRoute, expectedCandidatePath, nonRouteSubtype, construction) => ({
  id, text, expectedDisposition, expectedRoute, expectedCandidatePath, nonRouteSubtype, construction
})

const pool = { strong_arbitration: [], support_arbitration: [] }
for (const routeId of routes) {
  for (const text of specs[routeId].strong) {
    const { evidence, arb } = inspect(text)
    if ((evidence.unsupportedTargets || []).length === 0 && arb?.routeId === routeId && arb?.strength === 'strong') pool.strong_arbitration.push({ routeId, text })
  }
  for (const text of specs[routeId].support) {
    const { evidence, arb } = inspect(text)
    if ((evidence.unsupportedTargets || []).length === 0 && arb?.routeId === routeId && arb?.strength === 'support') pool.support_arbitration.push({ routeId, text })
  }
}

const roundRobinTake = (entries, count) => {
  const byRoute = new Map(routes.map((routeId) => [routeId, entries.filter((entry) => entry.routeId === routeId)]))
  const selected = []
  let cursor = 0
  while (selected.length < count) {
    let progressed = false
    for (let i = 0; i < routes.length && selected.length < count; i += 1) {
      const routeId = routes[(cursor + i) % routes.length]
      const queue = byRoute.get(routeId)
      if (queue?.length) {
        selected.push(queue.shift())
        progressed = true
      }
    }
    if (!progressed) break
    cursor += 1
  }
  if (selected.length !== count) throw new Error(`deterministic path pool insufficient: ${selected.length}/${count}`)
  return selected
}

const strongSelected = roundRobinTake(pool.strong_arbitration, 44)
const supportSelected = roundRobinTake(pool.support_arbitration, 44)

const rows = []
let serial = 1
const nextId = () => `V013-V04-I-${String(serial++).padStart(3, '0')}`
for (const item of strongSelected) rows.push(row(nextId(), item.text, 'route_known', item.routeId, 'strong_arbitration', null, 'post_lock_fresh_deterministic_path_fixture'))
for (const item of supportSelected) rows.push(row(nextId(), item.text, 'route_known', item.routeId, 'support_arbitration', null, 'post_lock_fresh_deterministic_path_fixture'))

for (const routeId of routes) {
  const texts = specs[routeId].fallback
  if (!Array.isArray(texts) || texts.length !== 2) throw new Error(`fallback wording count !=2 for ${routeId}`)
  for (const text of texts) {
    const { evidence, arb } = inspect(text)
    if ((evidence.unsupportedTargets || []).length) throw new Error(`fallback fixture has unsupported target: ${routeId} :: ${text}`)
    if (arb?.routeId) throw new Error(`fallback fixture resolves upstream: ${routeId} -> ${arb.routeId}/${arb.strength} :: ${text}`)
    rows.push(row(nextId(), text, 'route_known', routeId, 'fallback_head', null, 'post_lock_fresh_fallback_all22_fixture'))
  }
}

const outside = [
  '这次内部晋升面试我能不能通过？','我今年申请研究生能不能顺利录取？','下个月搬去另一个城市生活是否合适？','这次驾驶考试能不能一次通过？','我准备报名的资格考试今年能不能过？','这份签证申请能不能顺利获批？','我和房东续签现在这套房合不合适？','这次竞聘主管职位能不能拿下来？','准备参加的公开演讲比赛能不能进入决赛？','今年申请交换留学能不能成功？','这次法语等级考试成绩能不能达到目标？','我准备换一个新的居住城市是否合适？','这次团队内部岗位调整会不会轮到我？','准备投稿的这篇小说能不能入选？','我今年考驾照能不能顺利拿证？','这次学校奖学金申请能不能通过？','我计划参加的马拉松能不能顺利完赛？','这次租房申请能不能被房东接受？','我准备转到另一个部门发展好不好？','今年申请长期居留手续能不能批下来？','这次公开招聘我能不能拿到最终录用？','我准备参加的摄影比赛有没有机会获奖？'
]
const unresolved = [
  '这件事接下来到底能不能成？','我现在继续下去好，还是先停一停好？','对方最后会不会答应？','眼下这个选择到底对不对？','这次能不能顺顺利利结束？','我还要不要继续等下去？','接下来会不会出现转机？','这件事情最后有没有结果？','我现在做这个决定是不是合适？','对方之后还会不会再联系？','最近这一步能不能迈过去？','目前这个局面后面会不会变好？','我现在应该坚持原来的安排吗？','这件事情还有没有继续推进的必要？','眼前这个机会我该不该抓住？','对方的态度后面会不会变化？','我现在换一种做法会不会更好？','这件事是不是很快就能定下来？','我还需要继续投入时间吗？','目前这个决定以后会不会后悔？','接下来这一步能不能按预想发生？','这件事情最后是不是会往好的方向走？'
]
const nearDomain = [
  '工资表里固定收入和补贴应该分成几个字段记录？','公司发奖金时怎样设计一张更清楚的统计表？','库存清单按品类还是按入库时间排序更方便？','门店营业数据用周报还是月报展示更容易看趋势？','采购记录里供应商编号和批次号应该怎样组织？','销售合同归档时按客户还是按签约日期建文件夹更好？','借款记录表应该怎样区分本金、利息和还款日期？','朋友借走的钱我想做个提醒清单，哪些字段最实用？','应收款台账按客户还是按到期日排序更方便催款？','偿还计划做成月历还是列表更容易跟踪？','两个人共同做项目时任务分工表应该怎么排版？','投资记录里成本、数量和收益率怎样放在一张表里最清楚？','卖出记录应该单独建表还是和持仓记录放在一起？','比较几个投资对象时应该列哪些基础信息方便查看？','持有比例的变化记录用折线图还是表格更直观？','价格观察表按日记录还是按周汇总更适合复盘？','快递收货记录怎样按物流公司自动分类比较方便？','购物清单里预算和实付金额应该放在哪两列？','恋爱纪念日和共同安排放在同一个日历还是分开管理？','准备结婚的事项清单按时间还是按类别整理更清楚？','夫妻共同开支用一张共享表怎样分类最容易核对？','个人现金流记录按账户还是按收支类别做首页汇总更直观？'
]

for (const text of outside) rows.push(row(nextId(), text, 'non_route', null, null, 'outside_current_22', 'post_lock_fresh_outside_current22_fixture'))
for (const text of unresolved) rows.push(row(nextId(), text, 'non_route', null, null, 'route_unresolved', 'post_lock_fresh_unresolved_fixture'))
for (const text of nearDomain) rows.push(row(nextId(), text, 'non_route', null, null, 'near_domain_not_current_route', 'post_lock_fresh_near_domain_information_fixture'))

if (rows.length !== 198) throw new Error(`independent row count ${rows.length} != 198`)
const counts = rows.reduce((acc, item) => {
  if (item.expectedCandidatePath) acc[item.expectedCandidatePath] = (acc[item.expectedCandidatePath] || 0) + 1
  if (item.nonRouteSubtype) acc[item.nonRouteSubtype] = (acc[item.nonRouteSubtype] || 0) + 1
  return acc
}, {})
for (const [key, expected] of Object.entries({
  strong_arbitration:44,
  support_arbitration:44,
  fallback_head:44,
  outside_current_22:22,
  route_unresolved:22,
  near_domain_not_current_route:22
})) {
  if (counts[key] !== expected) throw new Error(`${key} count ${counts[key]} != ${expected}`)
}

const artifact = {
  version: '0.13-candidate-v0.4-independent-v0.1-preseal',
  status: 'generated_post_lock_unscored_awaiting_preseal_verification',
  contract: contractPath,
  candidateLock: candidateLockPath,
  generatedAfterCandidateLock: true,
  historicalIndependentRowTextReadForGeneration: false,
  developmentPerRowResultsReadForGeneration: false,
  sealedBlindEvaluationRowTextRead: false,
  postBaselineNewThemeCorpusRead: false,
  encoderScoringObserved: false,
  modelProbabilityObserved: false,
  runtimeMutationAllowed: false,
  counts: {
    total: rows.length,
    known: rows.filter((item) => item.expectedDisposition === 'route_known').length,
    nonRoute: rows.filter((item) => item.expectedDisposition === 'non_route').length,
    ...counts
  },
  fallbackAll22Coverage: Object.fromEntries(routes.map((routeId) => [routeId, rows.filter((item) => item.expectedCandidatePath === 'fallback_head' && item.expectedRoute === routeId).length])),
  rows
}
fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8')
console.log('CANDIDATE_V04_FRESH_INDEPENDENT_GENERATED', JSON.stringify({ counts: artifact.counts, fallbackAll22Coverage: artifact.fallbackAll22Coverage }, null, 2))
