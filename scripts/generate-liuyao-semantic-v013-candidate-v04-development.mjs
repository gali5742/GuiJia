import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = 'data/liuyao-semantic-v013-candidate-v04-development.json';
const runtimeLockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json';
const designPath = 'data/liuyao-semantic-v013-candidate-v04-design-v0.1.json';
const dataContractPath = 'data/liuyao-semantic-v013-candidate-v04-data-contract-v0.1.json';

const EXPECTED_BLOBS = Object.freeze({
  [runtimeLockPath]:'32ffdfbd4c0364b22f4f49f450c861cb39a0624c',
  [designPath]:'cc2f830118a5ee4e6fc22cb4ddcc78427f286d18',
  [dataContractPath]:'0f5f4b863689dda83fada81aa2a5cad45647b73e'
});

const gitBlobSha = (buffer) => crypto.createHash('sha1')
  .update(Buffer.from(`blob ${buffer.length}\0`))
  .update(buffer)
  .digest('hex');

for (const [relativePath, expectedSha] of Object.entries(EXPECTED_BLOBS)) {
  const buffer = fs.readFileSync(path.join(root, relativePath));
  const actualSha = gitBlobSha(buffer);
  if (actualSha !== expectedSha) throw new Error(`${relativePath} drifted before fresh Candidate v0.4 development generation: ${actualSha}`);
}

const runtimeLock = JSON.parse(fs.readFileSync(path.join(root, runtimeLockPath), 'utf8'));
if (runtimeLock.status !== 'runtime_locked_before_fresh_development') throw new Error('Candidate v0.4 runtime is not in the required locked state');
if (runtimeLock.execution?.fallbackGlobalThreshold !== 0.5549057227178391) throw new Error('Candidate v0.4 frozen fallback threshold drifted');
if (runtimeLock.execution?.routeInventoryCount !== 22 || runtimeLock.execution?.routerTop2FallbackRestriction !== false) throw new Error('Candidate v0.4 all-22 runtime contract drifted');
if (runtimeLock.isolation?.independentEvaluationRead !== false || runtimeLock.isolation?.sealedBlindEvaluationRead !== false) throw new Error('Blind discipline is not intact');

const strong = {
  commercial_transaction:['这份设备采购合同本周能不能正式签下来','我们和供应商谈的这笔买卖月底前能不能敲定'],
  inventory_purchase:['门店缺的这批原料周五前能不能全部补进来','下轮备货能不能按计划在开店前入库'],
  inventory_sale:['仓库这批季末存货下月前能不能顺利清掉','柜台剩下的旧款商品这轮促销能不能卖完'],
  borrow_money:['我这次申请的装修贷款能不能获批','为了周转去向朋友借这笔钱能不能借成','这个月的资金缺口靠借款能不能补上'],
  lend_money:['熟人现在找我借这笔钱我借给他是否合适','把这笔周转款先借给合作伙伴会不会有问题','亲友开口借这笔钱我答应借出是否稳妥'],
  debt_collection:['客户拖着没付的尾款这周能不能催到账','之前借给朋友的钱这个季度能不能收回来','那笔逾期应收款月底前有没有机会追回'],
  debt_repayment:['我现在剩下的消费贷今年能不能结清','这笔分期欠款下个月能不能一次还完','公司这笔短期借款到期前能不能按时偿还'],
  partnership:['我和这位合伙人继续共同经营是否能顺利','这个合作项目由我们两个人搭伙做下去会不会合适'],
  investment_profit:['我投的这只指数基金到年底能不能取得正收益','这笔项目投资接下来半年有没有盈利机会'],
  investment_liquidation:['我把手里的这份理财全部赎回能不能顺利到账','现在把这只股票全部卖出变现能不能顺利完成'],
  investment_suitability:['眼下把资金放进这只基金对我是否合适','现在参与这个投资项目是不是适合我的选择'],
  investment_price_trend:['这只ETF未来一个月价格会不会继续走高','这个投资标的接下来几周行情会不会转弱'],
  income_salary:['下一轮薪资调整我的固定工资能不能提高','今年我的基本薪酬还有没有上调机会'],
  income_bonus:['这次季度绩效奖金最后能不能拿到','公司承诺的项目奖金这个月能不能发下来'],
  receive_item:['我预订的手机本周末以前能不能送到','已经寄出的那台键盘明天能不能收到','这件海外包裹月底前能不能交到我手上'],
  item_purchase:['现在买这台扫地机器人对我来说合不合适','这款显示器我现在入手是否值得','今天把这台咖啡机买下来是不是合适的决定'],
  relationship_development:['我和她目前的来往之后能不能发展成恋爱关系','我们这段互有好感的关系接下来能不能正式交往'],
  marriage_match:['我和对象今年谈的结婚计划最后能不能落实','我们两个人这次商量的婚事能不能顺利定下来'],
  marital_relationship:['我和配偶最近的紧张关系接下来能不能改善','我们夫妻现在的矛盾之后能不能慢慢缓和']
};

const support = {
  financial_fortune:['最近家庭收支变化挺大，我想单独看看整体钱财状况','这段时间手头资金时松时紧，想问问总体财务这一块','近几个月进账和支出波动明显，我想占一下整体财运','眼下现金余量变化很多，想看看接下来财务状态','最近可支配的钱总在变化，我想问一下整体资金情况','这一阵钱财方面起伏比较大，想单独看这一项'],
  business_operation:['店铺最近客流和营收变化明显，我想看看经营本身','工作室这段时间订单忽多忽少，想单独问经营状态','网店近来的经营数据波动很大，我想占一下生意本身','这家店最近整体运转不太稳定，想看看经营这一块','手上的小生意最近变化不少，我想问问后续经营状态','门店这一阵经营节奏反复，我想单独占一下经营'],
  commercial_transaction:['和供应商正在谈的这单交易反复沟通，我想看看这笔买卖本身','客户这份采购单还在议条件，我想单独问这桩交易','目前这笔供货交易来回修改方案，想占一下交易本身','我们和对方谈的买卖最近变化不少，我想看看这一单','这份商业订单双方还在磋商，我想问问交易这件事','眼前这桩采购买卖谈了几轮，我想单独看这笔交易'],
  investment_profit:['这份投资最近收益波动明显，我想单独看看回报情况','手里的理财近来盈亏变化较大，想问一下投资收益','这个项目的回报最近不稳定，我想占一下收益本身','基金这阵子的收益起伏让我在意，想看看盈利这一项','目前这笔投入的回报变化很多，我想单独问收益'],
  investment_liquidation:['我正在安排退出这份理财，想看看全部变现这一步','手里的持仓准备整体卖出，我想单独问退出过程','这笔投资已经准备收回，想占一下变现这件事','我计划把这份基金全部赎回，想看看退出这一项','现在准备结束这笔持仓，我想单独问资金收回'],
  investment_position_decision:['我在考虑重新调整这只基金的持有比例，想看看仓位这件事','这只股票该保留多少仓位我还在犹豫，想单独问这一项','目前ETF的持仓比例没有定下来，我想占一下仓位安排','我正在考虑增减这份投资的持有比例，想看看仓位决定','这笔投资的仓位怎么处理让我反复权衡，想单独问一下'],
  investment_price_trend:['这只ETF近期行情起伏明显，我想单独看看价格走势','基金净值最近上下波动，我想问一下后面的行情变化','这个标的近来价格反复，我想占一下涨跌趋势','股票这阵子走势变化很快，我想看看价格这一块','我关注的投资标的最近波动加大，想单独问行情'],
  income_salary:['最近公司在调整固定薪酬，我想单独看看自己的工资这一项','这段时间基本工资安排有变化，我想问问薪资本身','目前月薪这一块让我比较在意，想占一下固定收入'],
  income_bonus:['公司最近在讨论绩效奖励，我想单独看看自己的奖金','这阵子项目奖励方案有变化，我想问一下奖金这一项','年终奖励最近有调整消息，我想占一下自己的奖金']
};

const fallback = {
  financial_fortune:['未来几个月我手里的钱会不会比现在宽裕些','接下来这段时间整体钱财能不能渐渐好转'],
  business_operation:['我现在做的这门小生意往后还能不能继续稳住','这个店以后还有没有持续经营下去的势头'],
  commercial_transaction:['正在谈的这一单最终能不能谈成','跟对方商量的这桩买卖最后能不能落定'],
  inventory_purchase:['店里下一批缺货能不能及时补齐','接下来要备的那批货能不能顺利进到仓里'],
  inventory_sale:['仓库剩下这批货后面能不能逐渐卖出去','店里积着的这些商品能不能慢慢清掉'],
  borrow_money:['眼下缺的这笔周转钱能不能借到','我最近需要的这笔钱有没有机会从别人那里借来'],
  lend_money:['现在把这笔钱借给朋友是否合适','这次先把钱给熟人周转会不会是个合适决定'],
  debt_collection:['外面还欠着我的那笔钱最后能不能回来','一直拖着没收回的款项后面还能不能拿到'],
  debt_repayment:['我现在背着的这笔欠款后面能不能还清','剩下这些债务以后能不能逐步结掉'],
  partnership:['和这个人继续搭伙做事合不合适','我跟现在这位伙伴一起经营下去会不会顺'],
  investment_profit:['这笔投入以后有没有赚到钱的机会','我现在持有的这份投资后面能不能产生收益'],
  investment_liquidation:['把现在这份投资退出并换回现金能不能顺利','我想把这笔持仓全部变现后面能不能办成'],
  investment_suitability:['眼前这个投资机会适不适合我参与','把钱投到这个项目里对我来说是不是合适'],
  investment_position_decision:['这份投资现在要不要调整持有比例','我手里的这个仓位目前是不是该做变化'],
  investment_price_trend:['这个标的接下来价格大概会不会继续往上走','我关注的这份资产后面的行情会不会转跌'],
  income_salary:['我之后的固定工资还有没有增加的可能','接下来一段时间我的基本薪资能不能往上走'],
  income_bonus:['这次该拿的奖励金最后能不能拿到手','后面这笔绩效奖金有没有机会发给我'],
  receive_item:['我等着的这个包裹能不能按时收到','已经在路上的这件东西后面能不能顺利到我手里'],
  item_purchase:['眼前这个东西我现在买下来合不合适','我正在看的这件商品现在值不值得入手'],
  relationship_development:['我和这个人以后有没有机会发展成恋爱','我们现在的互动接下来能不能走成正式交往'],
  marriage_match:['我和现在的对象以后能不能走到结婚','我们两个人谈的这门婚事最后有没有机会成'],
  marital_relationship:['我和配偶现在这段关系以后能不能好一些','我们夫妻之间目前的状态之后能不能改善']
};

const outsideCurrent22 = [
  '我投的岗位这次面试最后能不能通过','今年换到另一家公司工作对我是否合适','这次资格考试我能不能顺利合格','下个月的升学考试结果能不能达到预期','我计划的这趟远行能不能顺利成行','这次出差按原计划出发是否合适','前几天丢的钥匙之后还能不能找回来','遗失的那只手表有没有机会重新找到','今年搬去另一个城市居住对我是否合适','准备换到现在看的那套房子住会不会顺利','家里计划的翻修工程下月能不能顺利开工','这次装修按照现方案推进是否合适','和对方正在打的这场官司最后能不能有利解决','这次纠纷如果继续走诉讼程序对我是否合适','我报名的培训课程最后能不能顺利结业','这次申请学校交换项目能不能获准','计划中的长途搬迁能不能按期完成','这次签证申请最后能不能顺利获批','我准备参加的公开竞赛能不能进入决赛','这次作品投稿最后有没有机会被采用','我申请的租房这次能不能顺利通过审查','准备中的家庭聚会能不能按原计划顺利举行'
];
const routeUnresolved = [
  '最近钱上的这件事最后会怎么样','我手里这笔资金接下来该怎么看','这个生意相关的事情后面会怎样','店里现在这件事能不能有个好结果','跟客户有关的这件事情最后会不会成','这批货的事情接下来到底怎么样','我和朋友之间这笔钱的事后面如何','眼下借钱这件事最终会怎么发展','之前欠款相关的问题以后会怎样','我和合伙人目前这件事后面会怎么样','这份投资现在的情况最后会如何','基金这件事情接下来会不会有变化','股票这里我现在该怎么办','我这个仓位方面的问题以后怎么样','工资这件事接下来会有什么变化','奖金相关的事情最后会怎么样','我买的东西这件事后面怎么样','关于要不要买东西这件事我有点拿不准','我和这个人的关系以后会怎么样','我们之间这件感情的事情接下来如何','结婚这件事情之后会怎么发展','我和配偶之间这个问题以后会怎么样'
];
const nearDomainNotCurrentRoute = [
  '基金赎回通常会收多少手续费','股票卖出后资金一般什么时候可以转出','银行经营贷款申请通常需要准备哪些材料','个人之间借款合同一般要写哪些条款','公司应收账款在会计上应该记到哪个科目','提前还消费贷款通常要不要支付违约金','两个人合伙开店办理登记需要哪些手续','投资收益在个人所得税里一般怎样计算','基金净值和基金收益率有什么区别','股票仓位百分比通常是怎么计算的','限价单和市价单在卖出股票时有什么区别','固定工资和绩效工资在工资条上通常怎么区分','年终奖金的个人所得税通常怎么计算','快递显示运输中一般代表到了哪个环节','网购商品七天无理由退货需要满足哪些条件','结婚登记现在通常需要准备哪些证件','夫妻共同财产在法律上一般包括哪些范围','商业采购合同通常需要写明哪些交付条款','库存周转率的计算公式是什么','门店营业额和利润在会计上有什么区别','投资项目的内部收益率通常怎么计算','借给朋友的钱在个人记账时应该怎样分类'
];

const rows = [];
const addKnown = (candidatePath, source) => {
  for (const [routeId, texts] of Object.entries(source)) {
    for (const text of texts) rows.push({ text, expectedDisposition:'route_known', expectedRoute:routeId, expectedCandidatePath:candidatePath });
  }
};
const addNonRoute = (subtype, texts) => {
  for (const text of texts) rows.push({ text, expectedDisposition:'non_route', expectedRoute:null, expectedCandidatePath:null, nonRouteSubtype:subtype });
};
addKnown('strong_arbitration', strong);
addKnown('support_arbitration', support);
addKnown('fallback_identity_all22', fallback);
addNonRoute('outside_current_22', outsideCurrent22);
addNonRoute('route_unresolved', routeUnresolved);
addNonRoute('near_domain_not_current_route', nearDomainNotCurrentRoute);

const numberedRows = rows.map((row, index) => ({ id:`V013-V04-D-${String(index + 1).padStart(3, '0')}`, ...row }));
if (numberedRows.length !== 198) throw new Error(`Expected 198 development rows, found ${numberedRows.length}`);

const dataset = {
  version:'0.13-candidate-v0.4-development-v0.1',
  status:'sealed_fresh_development_cohort_before_first_encoder_scoring',
  sealed:true,
  scope:'liuyao_semantic_decision_stack_v0.13_candidate_v0.4',
  runtimeLockBinding:{ path:runtimeLockPath, gitBlobSha:EXPECTED_BLOBS[runtimeLockPath], version:'0.13-candidate-v0.4-runtime-lock-v0.1' },
  designBinding:{ path:designPath, gitBlobSha:EXPECTED_BLOBS[designPath] },
  dataContractBinding:{ path:dataContractPath, gitBlobSha:EXPECTED_BLOBS[dataContractPath] },
  policy:{
    useForTraining:false,
    useForThresholdCalibration:false,
    useForIndependentEvaluation:false,
    sealedBeforeFirstDevelopmentEncoderScoring:true,
    postSealWordingMutationForbidden:true,
    sameTextAsV04TrainCalibrationForbidden:true,
    sameTextAsCandidateV03DevelopmentForbidden:true,
    nearDuplicateIsolationRequired:true,
    independentEvaluationReadBeforeSeal:false,
    sealedBlindEvaluationReadBeforeSeal:false,
    traditionalLiuYaoFeaturesForbidden:true,
    healthDiseaseDivinationRowsForbidden:true
  },
  counts:{ total:198, route_known:132, non_route:66, strong_arbitration:44, support_arbitration:44, fallback_identity_all22:44, outside_current_22:22, route_unresolved:22, near_domain_not_current_route:22 },
  rows:numberedRows
};

fs.writeFileSync(path.join(root, outPath), `${JSON.stringify(dataset, null, 2)}\n`);
console.log(JSON.stringify({ ok:true, outPath, rows:numberedRows.length, encoderScoringPerformed:false }, null, 2));
