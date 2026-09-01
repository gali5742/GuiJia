import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const designFile = 'data/liuyao-semantic-v013-candidate-v07-design-v0.1.json';
const outputFile = 'data/liuyao-semantic-scope-finalization-v0.5-calibration.json';
const design = JSON.parse(fs.readFileSync(path.join(root, designFile), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd:root, encoding:'utf8' }).trim();
if (design.status !== 'design_frozen_before_v07_question_mode_implementation_and_calibration_data') throw new Error('Candidate v0.7 design must be frozen before calibration generation');

const rows = [];
let index = 1;
const addKnown = (candidatePath, routeId, texts) => {
  for (const text of texts) rows.push({ id:`SC5-${String(index++).padStart(3,'0')}`, text, expectedDisposition:'route_known', expectedRoute:routeId, expectedCandidatePath:candidatePath, subtype:null });
};
const addNonRoute = (subtype, texts) => {
  for (const text of texts) rows.push({ id:`SC5-${String(index++).padStart(3,'0')}`, text, expectedDisposition:'non_route', expectedRoute:null, expectedCandidatePath:null, subtype });
};

// 44 strong-arbitration rows. Wording is fresh and stays inside frozen Evidence v0.5 anchors.
addKnown('strong_arbitration','commercial_transaction',[
  '这笔办公设备采购交易下周能不能成交',
  '买家这张批发订单月底前能不能顺利签成'
]);
addKnown('strong_arbitration','inventory_purchase',[
  '仓库里的这批货下周四前能不能全部进仓',
  '门店这一批货月底前能不能到齐入库'
]);
addKnown('strong_arbitration','inventory_sale',[
  '店里的尾货下个月前能不能全部出清',
  '仓库里的积压货这个月能不能卖掉'
]);
addKnown('strong_arbitration','borrow_money',[
  '我向朋友借一笔周转钱月底前能不能拿到',
  '这次银行信用贷申请十月能不能批下来',
  '我找表哥借的应急款下周能不能借到'
]);
addKnown('strong_arbitration','lend_money',[
  '同事向我借三万周转，我这次要不要借给他',
  '朋友找我借一笔钱，我现在借出去合不合适',
  '熟人从我这里借应急款，这回该不该答应'
]);
addKnown('strong_arbitration','debt_collection',[
  '客户欠我的项目尾款十月前能不能收回',
  '我借给朋友的那笔钱年底还能不能追回',
  '公司这笔应收款下周三前能不能要回'
]);
addKnown('strong_arbitration','debt_repayment',[
  '我的银行贷款明年六月以前能不能还清',
  '这笔信用卡欠款月底能不能结清',
  '剩下的消费贷今年年底前能不能还完'
]);
addKnown('strong_arbitration','partnership',[
  '我和这个合伙人共同经营小店以后能不能稳定做下去',
  '跟这位搭档一起经营工作室合不合适'
]);
addKnown('strong_arbitration','investment_profit',[
  '这只债券基金再持有三个月能不能盈利',
  '这个科技投资项目到明年会不会有利润'
]);
addKnown('strong_arbitration','investment_liquidation',[
  '这只指数基金下周全部赎回能不能顺利完成',
  '手上的股票仓位一次性卖出会不会遇到阻碍'
]);
addKnown('strong_arbitration','investment_suitability',[
  '这只债券ETF现在适不适合我参与',
  '这个创业投资项目目前值不值得我投'
]);
addKnown('strong_arbitration','investment_price_trend',[
  '这只个股未来一个月价格会不会继续上涨',
  '这只指数基金下周净值会不会往下走'
]);
addKnown('strong_arbitration','income_salary',[
  '明年我的固定工资会不会增加',
  '下一次调薪我的月薪能不能涨'
]);
addKnown('strong_arbitration','income_bonus',[
  '今年年终奖能不能正常发下来',
  '这次绩效奖金下个月能不能到账'
]);
addKnown('strong_arbitration','receive_item',[
  '我买的键盘星期五前能不能收到',
  '已经寄出的相机后天能不能到手',
  '这个手机包裹周末前能不能送达'
]);
addKnown('strong_arbitration','item_purchase',[
  '这台扫地机器人现在该不该买',
  '我现在要不要买这台显示器',
  '这款相机眼下买下来合不合适'
]);
addKnown('strong_arbitration','relationship_development',[
  '我和这个女生以后能不能正式谈恋爱',
  '我们现在的暧昧会不会发展成恋爱'
]);
addKnown('strong_arbitration','marriage_match',[
  '我和恋人明年有没有机会结婚',
  '我们两家的婚事今年能不能成'
]);
addKnown('strong_arbitration','marital_relationship',[
  '我和妻子最近关系很僵，之后能不能缓和',
  '我们夫妻最近总争执，这段婚姻还能不能继续'
]);

// 44 support-arbitration rows. Topic/event evidence is present without a positive current outcome target.
addKnown('support_arbitration','financial_fortune',[
  '近来整体财务起伏明显，我想单独占一下这方面',
  '最近钱财进出变化很大，我想看看这一块',
  '这阵子现金流忽松忽紧，我想单独问问',
  '今年资金流波动不少，我想占一下财务主题',
  '最近总体进账不太稳定，我想看看钱这方面',
  '这段时间收支反复，我想单独占一下',
  '最近整体资金状况变化明显，我想问问这一项',
  '目前财务状况让我在意，想单独看看'
]);
addKnown('support_arbitration','business_operation',[
  '我的网店最近经营状况起伏很大，想单独占一下',
  '这家餐馆近来利润变化明显，我想问经营本身',
  '门店这阵子业绩忽高忽低，我想看看经营这块',
  '自己做的生意最近亏损和回升反复，我想占一下',
  '工作室最近经营状况不稳，我想单独问问',
  '这个摊位近来现金流变化很大，我想看看经营面',
  '便利店最近营业状况反复，我想占这一项',
  '公司的这项业务近来业绩波动，我想看看本身'
]);
addKnown('support_arbitration','investment_profit',[
  '这只债券基金最近收益起伏明显，我想单独占一下',
  '这笔投资近来利润变化很大，我想看看收益这块',
  '手里的指数基金最近回本情况反复，想单独问一下',
  '这个投资项目目前收益忽高忽低，我想占这一项',
  '这只个股最近利润波动明显，我想看看',
  '我的基金近来收益变化让我在意，想问问',
  '这份投资最近回本情况不稳定，我想单独占一下'
]);
addKnown('support_arbitration','investment_liquidation',[
  '我已经决定把这只指数基金全部赎回，想占一下这个动作',
  '手上的股票准备一次性卖出，我想看看这一步',
  '这笔投资正在安排全部变现，我想单独占这件事',
  '这个项目已经决定退出投资，我想问问这个动作',
  '手里的债券ETF计划全部卖出，我想看看这一项',
  '这份持仓准备清掉仓位，我想单独占一下',
  '我已经决定把这笔期货平仓，想问这个步骤'
]);
addKnown('support_arbitration','investment_position_decision',[
  '这只个股我正在考虑继续持有，想单独占一下',
  '手里的债券基金准备调整仓位，我想看看这件事',
  '这只指数ETF我在犹豫要不要减仓，想问一下',
  '目前这只股票的持仓正在考虑加仓，我想单独占这一步',
  '我对这份基金的仓位调整一直拿不定主意',
  '这只股票继续拿还是减仓这件事我想看看',
  '当前债券基金持仓要不要调整，我一直在考虑'
]);
addKnown('support_arbitration','investment_price_trend',[
  '这只债券基金最近净值波动很大，我想单独占一下',
  '手里的个股最近价格变化明显，我想看看涨跌这块',
  '这个指数ETF近来涨跌反复，我想占一下',
  '我关注的混合基金最近净值起伏明显，想单独看看',
  '这只股票最近价格波动让我很在意，想问问',
  '这个投资标的近来的涨跌变化不少，我想占这一项',
  '这只短债基金最近净值变化频繁，我想看看'
]);

// 44 pure-fallback rows: two per current route, intentionally avoiding current Evidence/Arbitration anchors.
addKnown('pure_fallback','financial_fortune',[
  '接下来半年我手里的钱会不会比现在宽松一点',
  '明年我在金钱方面会不会慢慢轻松起来'
]);
addKnown('pure_fallback','business_operation',[
  '我手上这个小买卖以后还能不能继续做下去',
  '自己现在这摊事情往后有没有发展的余地'
]);
addKnown('pure_fallback','commercial_transaction',[
  '眼前和对方谈的这件事最后能不能谈出结果',
  '现在商量的这一桩事情后面还有没有下文'
]);
addKnown('pure_fallback','inventory_purchase',[
  '下个月店里要用的那批东西最后能不能全部备齐',
  '准备摆上架的那些东西到开业前能不能凑全'
]);
addKnown('pure_fallback','inventory_sale',[
  '仓里一直压着的那些旧东西以后能不能慢慢腾掉',
  '店里剩下的那批旧商品往后会不会越来越少'
]);
addKnown('pure_fallback','borrow_money',[
  '眼下缺的这笔周转钱能不能从别人那里凑到',
  '最近手头有个资金缺口，会不会有人先帮我补上'
]);
addKnown('pure_fallback','lend_money',[
  '朋友最近手头紧，我先拿一笔给他用合不合适',
  '熟人暂时缺钱，我把手里的钱分一部分给他会怎样'
]);
addKnown('pure_fallback','debt_collection',[
  '那笔一直留在别人手里的钱以后还能不能回来',
  '拖了很久没有回来的那笔款最后还有没有着落'
]);
addKnown('pure_fallback','debt_repayment',[
  '压在我身上的那笔账明年能不能彻底处理完',
  '一直挂着的那项欠账以后能不能完全了结'
]);
addKnown('pure_fallback','partnership',[
  '我和这个人一起把事情做下去以后行不行',
  '跟他两个人搭着做这个小项目合不合适'
]);
addKnown('pure_fallback','investment_profit',[
  '我放进去的这笔钱过几个月能不能变多一点',
  '这个项目里投入的资金以后有没有可能赚回来'
]);
addKnown('pure_fallback','investment_liquidation',[
  '我准备把手里的这一份东西全部退出，过程会不会顺利',
  '现在想把这一笔全部收回来，这一步会不会卡住'
]);
addKnown('pure_fallback','investment_suitability',[
  '眼前这个机会值不值得我拿钱参与',
  '现在这个方向适不适合我把资金放进去'
]);
addKnown('pure_fallback','investment_position_decision',[
  '手里这一份我现在继续留着还是减掉一些比较好',
  '目前已经拿着的这部分要不要再多放一点'
]);
addKnown('pure_fallback','investment_price_trend',[
  '我手里这个东西接下来一个月会不会继续往上',
  '现在关注的这个标的后面几周会不会往下走'
]);
addKnown('pure_fallback','income_salary',[
  '明年每个月固定拿到的钱会不会比今年多',
  '下一次调整以后我每月到手的固定部分能不能增加'
]);
addKnown('pure_fallback','income_bonus',[
  '今年额外发的那笔钱最后能不能拿到',
  '这次项目结束以后那份额外奖励会不会下来'
]);
addKnown('pure_fallback','receive_item',[
  '已经在路上的那个东西周末前能不能到我手上',
  '对方前天发出的那件东西明天我能不能拿到'
]);
addKnown('pure_fallback','item_purchase',[
  '眼前这个东西我现在买下来会不会后悔',
  '最近看中的这个东西现在入手值不值得'
]);
addKnown('pure_fallback','relationship_development',[
  '我和这个人以后会不会变成正式的一对',
  '我们现在这种状态往后有没有可能更进一步'
]);
addKnown('pure_fallback','marriage_match',[
  '我和现在这个人以后有没有可能成为一家人',
  '我们两个人明年能不能把终身的事情定下来'
]);
addKnown('pure_fallback','marital_relationship',[
  '我和家里那位最近总别扭，以后能不能重新好起来',
  '我们两个人这段长期关系还能不能继续维持'
]);

// 30 outside-current-22 rows: next-theme and other unsupported outcome domains.
addNonRoute('outside_current_22',[
  '这次公司的面试我能不能通过','今年我有没有机会升职','转去新的部门以后发展会不会更好','这份工作下个月能不能顺利入职','这次试用期我能不能转正','我现在离职去别家公司好不好',
  '下周的资格考试我能不能及格','这次研究生考试能不能录取','论文答辩能不能顺利通过','今年申请学校有没有机会拿到录取','这门课程最后能不能拿到好成绩','这次语言考试排名会不会提高',
  '明天坐飞机出行会不会顺利','这趟长途旅行会不会遇到阻碍','下周开车去外地能不能按计划到','这次出差路上会不会耽搁','周末坐船出去会不会顺利','明天早上出门行程能不能按时完成',
  '这场官司最后我能不能赢','对方提起的诉讼会不会继续','这次仲裁结果会不会对我有利','我们之间的纠纷能不能和解','这个合同争议最后会怎么处理','对方会不会接受调解方案',
  '昨天丢的钥匙还能不能找回来','不见的背包这几天能不能找到','丢失的证件还有没有机会找回','那只不见的耳机还能不能寻回','落在外面的雨伞最后能不能找到','家里找不到的戒指会不会重新出现'
]);

// 30 unresolved rows: deliberately vague and insufficient for a current22 route.
addNonRoute('route_unresolved',[
  '这件事情最后会怎样','接下来会不会顺利一点','我现在这样做到底好不好','以后还有没有变化','这一步继续下去合不合适','最近这件事能不能有结果','我是不是应该再坚持一阵','后面几个月会发生什么','眼前这个选择到底对不对','这件事还有没有转机',
  '目前这个状态还能不能维持','以后是不是会轻松一些','我现在该不该换个做法','这次最后会不会成功','后面会不会越来越好','我现在继续还是停下来比较好','这个决定以后会不会后悔','最近这件事为什么总不顺','过一阵子情况会不会改变','现在是不是还要继续等',
  '这件事最终有没有下文','接下来我应该怎么选','现在这个方向还能不能走','以后会不会出现新的机会','这次是不是还有希望','我现在要不要先放一放','后面的结果大概会怎样','眼下这个局面会不会缓过来','这一步做完以后会怎样','最近的变化最后会走到哪里'
]);

// 30 near-domain non-route rows. These deliberately exercise route-agnostic information/question-mode boundaries.
addNonRoute('near_domain_not_current_route',[
  '应收款的账龄分析一般应该怎么做','债务催收的流程通常包括哪些步骤','借款合同里的利息条款一般怎么理解','贷款申请通常需要准备哪些证明材料','还款计划一般如何计算每期金额','个人借款的担保条件通常包括什么',
  '合伙协议里的退出条款一般怎样写','合伙人的职责范围通常怎么约定进协议','共同经营时利润分配规则一般怎么理解','商业合同的违约条款通常怎么解释','采购合同一般需要包含哪些内容','库存盘点在会计上通常怎么分类记录',
  '基金赎回手续费一般如何计算','股票交易的费用通常包括哪些项目','投资收益率一般怎么计算','持仓成本通常怎样核算','基金净值这个概念一般怎么理解','投资风险等级通常是怎么划分的',
  '工资个税一般如何计算','奖金计税规则通常怎么理解','绩效奖金的发放制度一般包括什么','调薪流程通常需要经过哪些步骤',
  '快递投递失败以后一般怎样申请重新派送','包裹签收规则通常怎么理解','商品退换货流程一般需要哪些材料','购买电子产品的保修条款一般包括什么',
  '恋爱关系里的沟通边界一般怎么理解','情侣相处的界限通常应该怎么解释','结婚登记一般需要准备哪些证件','夫妻共同财产的概念通常怎么理解'
]);

const counts = {
  total:rows.length,
  route_known:rows.filter((r)=>r.expectedDisposition==='route_known').length,
  non_route:rows.filter((r)=>r.expectedDisposition==='non_route').length,
  strong_arbitration:rows.filter((r)=>r.expectedCandidatePath==='strong_arbitration').length,
  support_arbitration:rows.filter((r)=>r.expectedCandidatePath==='support_arbitration').length,
  pure_fallback:rows.filter((r)=>r.expectedCandidatePath==='pure_fallback').length,
  outside_current_22:rows.filter((r)=>r.subtype==='outside_current_22').length,
  route_unresolved:rows.filter((r)=>r.subtype==='route_unresolved').length,
  near_domain_not_current_route:rows.filter((r)=>r.subtype==='near_domain_not_current_route').length
};
for (const [key, expected] of Object.entries({total:222,route_known:132,non_route:90,strong_arbitration:44,support_arbitration:44,pure_fallback:44,outside_current_22:30,route_unresolved:30,near_domain_not_current_route:30})) {
  if (counts[key] !== expected) throw new Error(`${key} ${counts[key]} != ${expected}`);
}

const artifact = {
  version:'0.13-scope-finalization-v0.5-calibration-v0.1',
  status:'presealed_fresh_scope_calibration',
  sealed:false,
  scope:'liuyao_semantic_candidate_v0.7_scope_finalization',
  createdAfterCandidateV07DesignFreeze:true,
  provenance:{
    designPath:designFile,
    designSha256:sha256(designFile),
    designFreezeCommit:'4cd57886af941c6dfa89c97ef4ab18b505a5b771',
    generatorPath:'scripts/generate-liuyao-semantic-scope-finalization-v05-calibration.mjs',
    generatorCommit:git('rev-parse','HEAD')
  },
  policy:{
    useForTraining:false,
    useForScopeThresholdCalibration:true,
    useAsDevelopmentEval:false,
    reuseAsIndependent:false,
    reuseAsBlind:false,
    parameterToCalibrate:'scope_hard_veto_cutoff',
    parameterCount:1,
    otherModelOrGateParametersMayChange:false,
    multiTextEncoderBatchForbidden:true,
    candidateV06ScopeCalibrationExcluded:true,
    candidateV05ScopeCalibrationExcluded:true,
    candidateV04ScopeCalibrationExcluded:true,
    fallbackAcceptanceCalibrationExcluded:true,
    routeabilityCalibrationExcluded:true,
    allDevelopmentIndependentBlindExcluded:true,
    predecessorRegressionRowsExcluded:true
  },
  counts,
  rows
};
fs.writeFileSync(path.join(root, outputFile), `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log('Generated Candidate v0.7 fresh Scope calibration preseal corpus.');
console.log(`- rows: ${rows.length}; known=${counts.route_known}; nonroute=${counts.non_route}`);
