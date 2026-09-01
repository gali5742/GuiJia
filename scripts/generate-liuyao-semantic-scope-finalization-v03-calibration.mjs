import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const designFile = 'data/liuyao-semantic-v013-candidate-v05-design-v0.1.json';
const outputFile = 'data/liuyao-semantic-scope-finalization-v0.3-calibration.json';
const design = JSON.parse(fs.readFileSync(path.join(root, designFile), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd:root, encoding:'utf8' }).trim();
if (design.status !== 'design_frozen_before_v05_calibration_data') throw new Error('Candidate v0.5 design must be frozen before calibration generation');

const rows = [];
let index = 1;
const addKnown = (candidatePath, routeId, texts) => {
  for (const text of texts) rows.push({
    id:`SC3-${String(index++).padStart(3,'0')}`,
    text,
    expectedDisposition:'route_known',
    expectedRoute:routeId,
    expectedCandidatePath:candidatePath,
    subtype:null
  });
};
const addNonRoute = (subtype, texts) => {
  for (const text of texts) rows.push({
    id:`SC3-${String(index++).padStart(3,'0')}`,
    text,
    expectedDisposition:'non_route',
    expectedRoute:null,
    expectedCandidatePath:null,
    subtype
  });
};

// 44 strong-arbitration rows. All wording is new for v0.5 and uses explicit current-target evidence.
addKnown('strong_arbitration','commercial_transaction',[
  '这笔办公家具批发交易十号前能不能成交',
  '客户这张采购订单本周能不能顺利签成'
]);
addKnown('strong_arbitration','inventory_purchase',[
  '门店夏季这批货星期四前能不能全部入库',
  '仓库下一轮补货月底前能不能到齐'
]);
addKnown('strong_arbitration','inventory_sale',[
  '库房这批积压库存下月初前能不能出清',
  '店里剩下的尾货这个季度能不能卖完'
]);
addKnown('strong_arbitration','borrow_money',[
  '我向姐姐借一笔临时周转钱这周能不能拿到',
  '这次银行经营贷申请九月能不能批下来',
  '我找叔叔借的应急款月底前能不能借到'
]);
addKnown('strong_arbitration','lend_money',[
  '朋友向我借两万周转，我这回要不要借给他',
  '表弟找我借一笔钱，我现在借出去妥不妥',
  '同事从我这里借应急款，这次该不该答应'
]);
addKnown('strong_arbitration','debt_collection',[
  '客户欠我的设计尾款九月底前能不能收回',
  '我借给表哥的那笔钱今年还能不能追回',
  '公司这项应收货款下周能不能要回'
]);
addKnown('strong_arbitration','debt_repayment',[
  '我的装修贷款年底以前能不能还清',
  '这笔信用卡欠款下个还款日能不能结清',
  '现在剩下的消费贷明年春天前能不能还完'
]);
addKnown('strong_arbitration','partnership',[
  '我和同学合伙开咖啡店以后能不能稳定做下去',
  '跟这个搭档共同经营摄影工作室合不合适'
]);
addKnown('strong_arbitration','investment_profit',[
  '这只指数基金再持有四个月能不能盈利',
  '这个新能源投资项目到年底会不会有利润'
]);
addKnown('strong_arbitration','investment_liquidation',[
  '这只债券基金月底全部赎回能不能顺利完成',
  '手里的科技股仓位一次性卖出会不会卡住'
]);
addKnown('strong_arbitration','investment_suitability',[
  '这只行业ETF现在适不适合我参与',
  '这个小型投资项目目前值不值得我投'
]);
addKnown('strong_arbitration','investment_price_trend',[
  '这只股票未来三周价格会不会继续上涨',
  '这只混合基金下个月净值会不会往下走'
]);
addKnown('strong_arbitration','income_salary',[
  '明年我的基本工资会不会上调',
  '下一轮调薪时我的固定薪酬能不能增加'
]);
addKnown('strong_arbitration','income_bonus',[
  '今年季度奖金能不能按时发下来',
  '这次项目奖励金十月前能不能到账'
]);
addKnown('strong_arbitration','receive_item',[
  '我买的路由器星期六以前能不能收到',
  '已经寄出的镜头后天能不能到手',
  '这个平板包裹月底前能不能送达'
]);
addKnown('strong_arbitration','item_purchase',[
  '这台空气净化器现在该不该买',
  '我现在要不要买这块手表',
  '这款投影仪眼下买下来合不合适'
]);
addKnown('strong_arbitration','relationship_development',[
  '我和这个男生以后能不能正式谈恋爱',
  '我们之间这段暧昧会不会发展成恋爱'
]);
addKnown('strong_arbitration','marriage_match',[
  '我和对象后年有没有机会结婚',
  '我们两家的这门亲事今年冬天能不能成'
]);
addKnown('strong_arbitration','marital_relationship',[
  '我和丈夫这段时间关系僵着，之后能不能缓和',
  '我们夫妻最近总冷战，这段婚姻还能不能继续'
]);

// 44 support-arbitration rows. They intentionally provide topic/event evidence without a positive current outcome target.
addKnown('support_arbitration','financial_fortune',[
  '最近整体收支变化挺明显，我想单独占一下财务这块',
  '这两个月钱财方面起伏不少，我想看看这一项',
  '最近现金流忽紧忽松，我想问问财务方面',
  '今年资金流变化比较大，我想占一下这个主题',
  '近来整体进账不太稳定，我想单独看看',
  '这阵子的收支状况反复，我想问问钱这方面',
  '最近总体资金松紧变化明显，我想占这一块',
  '目前财务状况让我有些在意，想单独问一下'
]);
addKnown('support_arbitration','business_operation',[
  '我的便利店最近经营状况起伏很大，想单独占一下',
  '工作室这阵子利润变化明显，我想问经营本身',
  '这家门店近期业绩忽高忽低，我想看看经营这块',
  '自己做的生意最近亏损和回升反复，我想占一下',
  '网店最近经营状况有些不稳，我想单独问问',
  '餐馆这阵子现金流变化很大，我想看看经营面',
  '这个摊位最近营业状况反复，我想占这一项',
  '公司的这项业务近来业绩波动，我想看看本身'
]);
addKnown('support_arbitration','investment_profit',[
  '这只ETF最近收益起伏明显，我想单独占一下',
  '这笔投资近来利润变化比较大，我想看看收益这块',
  '手里的基金最近回本情况反复，想单独问一下',
  '这个投资项目目前收益忽高忽低，我想占这一项',
  '这只股票最近有些利润波动，我想看看',
  '我的基金近来收益变化让我很在意，想问问',
  '这份投资最近回本情况不稳定，我想单独占一下'
]);
addKnown('support_arbitration','investment_liquidation',[
  '我已经决定把这只债券基金全部赎回，想占一下这个动作',
  '手里的科技股准备一次性卖出，我想看看这一步',
  '这笔投资正在安排全部变现，我想单独占这件事',
  '这个项目已经决定退出投资，我想问问这个动作',
  '手上的行业ETF计划全部卖出，我想看看这一项',
  '这份持仓准备清掉仓位，我想单独占一下',
  '我已经决定把这笔期货平仓，想问这个步骤'
]);
addKnown('support_arbitration','investment_position_decision',[
  '这只个股我正在考虑继续持有，想占一下',
  '手里的指数基金准备调整仓位，我想看看这件事',
  '这只行业ETF我在犹豫要不要减仓，想问一下',
  '目前这只股票的持仓正在考虑加仓，我想单独占这一步',
  '我对这份基金的仓位调整一直拿不定主意',
  '这只股票继续拿还是减仓这件事我想看看',
  '当前债券基金持仓要不要调整，我一直在考虑'
]);
addKnown('support_arbitration','investment_price_trend',[
  '这只指数基金最近净值波动很大，我想单独占一下',
  '手里的科技股最近价格变化明显，我想看看涨跌这块',
  '这个行业ETF近来涨跌反复，我想占一下',
  '我关注的混合基金最近净值起伏明显，想单独看看',
  '这只个股最近价格波动让我很在意，想问问',
  '这个投资标的近来的涨跌变化不少，我想占这一项',
  '这只短债基金最近净值变化频繁，我想看看'
]);

// 44 pure-fallback rows: two per route. These avoid current Evidence/Arbitration anchors by construction.
addKnown('pure_fallback','financial_fortune',[
  '明年我在钱这方面会不会比现在轻松一些',
  '往后半年我手里的余量会不会慢慢多起来'
]);
addKnown('pure_fallback','business_operation',[
  '我这个小铺以后还能不能一直做下去',
  '自己手里这摊小买卖往后有没有出路'
]);
addKnown('pure_fallback','commercial_transaction',[
  '眼前这单事情最后能不能谈出一个结果',
  '和对方现在商量的这一桩最后有没有下文'
]);
addKnown('pure_fallback','inventory_purchase',[
  '店里下一批准备摆上架的货最后能不能凑齐',
  '下个月营业要用的那批东西能不能都准备妥当'
]);
addKnown('pure_fallback','inventory_sale',[
  '仓里压着的那些旧东西后面能不能慢慢腾出去',
  '店里剩的那批老商品往后会不会逐渐变少'
]);
addKnown('pure_fallback','borrow_money',[
  '眼下差的这笔周转钱能不能从外面凑到手',
  '最近手头有个缺口，会不会有人先帮我补上'
]);
addKnown('pure_fallback','lend_money',[
  '朋友手头紧，我先拿一笔给他顶着合不合适',
  '熟人临时缺钱，我把手里的钱分些给他用会怎样'
]);
addKnown('pure_fallback','debt_collection',[
  '那笔一直在别人手里的钱以后还能不能回来',
  '拖了很久没回来的那笔款最终还有没有着落'
]);
addKnown('pure_fallback','debt_repayment',[
  '压在我身上的那笔账明年能不能彻底了结',
  '一直挂着的那项欠账以后能不能完全处理掉'
]);
addKnown('pure_fallback','partnership',[
  '我和这个人两个人搭着做这件事往后行不行',
  '跟他一起把这个小项目长期做下去合不合适'
]);
addKnown('pure_fallback','investment_profit',[
  '把钱放进这个产品以后最后能不能多出来一些',
  '这笔钱放在眼前这个项目里到明年会不会增加'
]);
addKnown('pure_fallback','investment_liquidation',[
  '手里这份东西我准备整个退出来会不会顺',
  '现在这份持有的东西想全部退出，最后能不能办成'
]);
addKnown('pure_fallback','investment_suitability',[
  '眼下把钱放进这个产品对我来说合适不合适',
  '现在参与这个项目对我是不是一个合适选择'
]);
addKnown('pure_fallback','investment_position_decision',[
  '手里这份东西继续留着还是收回来一点',
  '现在拿着的这一份是继续放着还是少留一些'
]);
addKnown('pure_fallback','investment_price_trend',[
  '这个东西往后一阵子的价还会不会往上',
  '我手里这份东西过些日子的价会不会往下'
]);
addKnown('pure_fallback','income_salary',[
  '明年每个月固定到手的那一份会不会多一点',
  '以后每月稳定拿到的那部分钱有没有机会增加'
]);
addKnown('pure_fallback','income_bonus',[
  '年底公司额外给的那笔钱最后能不能拿到',
  '这个项目结束后多出来的那笔钱会不会发给我'
]);
addKnown('pure_fallback','receive_item',[
  '我订的电脑大概哪一天能来',
  '前几天定下的书桌大约什么时候能来'
]);
addKnown('pure_fallback','item_purchase',[
  '这台主机现在要不要入',
  '这个咖啡机眼下值不值我入一台'
]);
addKnown('pure_fallback','relationship_development',[
  '我和这个人以后有没有机会真正成为一对',
  '我们俩往后能不能从现在这样变成一对'
]);
addKnown('pure_fallback','marriage_match',[
  '我和他以后有没有可能一起成家',
  '我们这段关系最后能不能定下来过日子'
]);
addKnown('pure_fallback','marital_relationship',[
  '我和另一半最近总闹别扭，以后还能不能好起来',
  '成家以后我们两个人一直僵着，往后能不能缓下来'
]);

addNonRoute('outside_current_22',[
  '下周坐夜班巴士去名古屋一路会不会顺利',
  '这次日语资格考试我有没有机会通过',
  '明天那场求职面谈最后能不能被录取',
  '落在出租车上的雨伞还有没有机会找回来',
  '这场劳动诉讼最后结果会不会对我有利',
  '孩子去新学校以后能不能很快适应',
  '十月搬家的整个过程会不会顺当',
  '这次在留资格更新能不能按期批准',
  '周末那场业余比赛我能不能进决赛',
  '补办的身份证月底以前能不能拿到',
  '明天去郊外徒步这一路会不会顺利',
  '这次毕业论文答辩能不能顺利通过',
  '换到新的工作小组以后我能不能适应',
  '丢在车站的门禁卡还有机会找回来吗',
  '这次租房审查最后能不能通过',
  '申请的学校宿舍这次能不能排上',
  '我准备投稿的这篇文章能不能被采用',
  '下个月那场公开演讲能不能顺利完成',
  '准备参加的驾照考试这次能不能过',
  '这趟国际航班当天会不会顺利起飞',
  '我的行李转机时会不会顺利跟上',
  '这次申请奖学金最后有没有机会拿到',
  '新买的植物搬回家以后能不能养活',
  '这次房屋续租房东会不会同意',
  '参加这个摄影比赛有没有机会获奖',
  '明天和老师谈论文进度会不会顺利',
  '这次申请更换部门最后能不能批准',
  '寄去维修的相机能不能修好',
  '下周参加的志愿活动会不会顺利',
  '我这次申请加入社团能不能被接受'
]);

addNonRoute('route_unresolved',[
  '最近这件事到底会怎么样',
  '我现在心里拿不准，后面会不会好一点',
  '这个安排最后有没有可能成',
  '眼前这件事情继续下去会怎样',
  '我最近一直在想这件事，结果会好吗',
  '后面这一段会不会比现在顺一些',
  '目前这个局面最后能不能有变化',
  '我做的这个选择以后会不会后悔',
  '这件事情大概什么时候才会有答案',
  '接下来这个状况会朝什么方向发展',
  '我现在这样处理到底合不合适',
  '眼下这个问题最后会不会解决',
  '这件事拖下去会不会越来越麻烦',
  '我目前的判断是不是有偏差',
  '接下来几个月这件事会不会变好',
  '这个决定以后对我有没有影响',
  '我现在继续这样做会不会有问题',
  '这件事情最后是不是能落下来',
  '现在这个状态还会持续多久',
  '后面有没有可能出现转机',
  '眼前这个选择到底哪边更合适',
  '我是不是应该继续等一等',
  '现在这个方向走下去会不会顺',
  '这件事情最终会不会如我所愿',
  '最近的这个变化到底是好还是不好',
  '我现在是不是应该换一种处理方式',
  '这个结果还要多久才会明朗',
  '以后回头看这个决定会不会觉得不值',
  '目前这一步是不是走错了',
  '接下来我最担心的事情会不会发生'
]);

addNonRoute('near_domain_not_current_route',[
  '基金赎回时的手续费一般怎么收',
  '股票交易的印花税现在按什么标准计算',
  '开投资账户通常需要经过哪些流程',
  '银行贷款申请条件一般包括什么',
  '工资条上的个人所得税通常怎么核算',
  '绩效奖励制度一般怎样设计比较合理',
  '采购协议里的责任条款通常应该怎样写',
  '两个人合作时工作分工一般怎么安排',
  '私人借款的欠条通常应该怎么填写',
  '应收账款的账龄一般依据什么口径划分',
  '应收账款在账务上通常怎么记录',
  '企业的坏账准备一般如何计提',
  '仓库的库存台账通常应该怎么填写',
  '公司的现金流量表一般怎样编制',
  '销售发票通常应该怎样开具',
  '基金管理费的收费标准现在是多少',
  'ETF每天可以交易的时间有哪些规定',
  '办理结婚登记通常需要准备哪些材料',
  '查询快递物流一般要经过什么步骤',
  '普通商品的退换货规则通常有哪些',
  '合作协议模板一般包含哪些部分',
  '股票图里的均线是什么意思',
  'ETF的跟踪误差通常怎么计算',
  '投资组合波动率一般怎样计算',
  '一家公司的财务报表通常应该怎么看',
  '基金净值的计算方法是什么',
  '贷款利息通常是怎么计算出来的',
  '年终奖的计税方式应该怎么理解',
  '库存周转率一般怎样计算',
  '应收账款周转率是什么意思'
]);

const counts = {
  total:rows.length,
  route_known:rows.filter((row)=>row.expectedDisposition==='route_known').length,
  non_route:rows.filter((row)=>row.expectedDisposition==='non_route').length,
  strong_arbitration:rows.filter((row)=>row.expectedCandidatePath==='strong_arbitration').length,
  support_arbitration:rows.filter((row)=>row.expectedCandidatePath==='support_arbitration').length,
  pure_fallback:rows.filter((row)=>row.expectedCandidatePath==='pure_fallback').length,
  outside_current_22:rows.filter((row)=>row.subtype==='outside_current_22').length,
  route_unresolved:rows.filter((row)=>row.subtype==='route_unresolved').length,
  near_domain_not_current_route:rows.filter((row)=>row.subtype==='near_domain_not_current_route').length
};
const expectedCounts = {
  total:222, route_known:132, non_route:90,
  strong_arbitration:44, support_arbitration:44, pure_fallback:44,
  outside_current_22:30, route_unresolved:30, near_domain_not_current_route:30
};
for (const [key, expected] of Object.entries(expectedCounts)) {
  if (counts[key] !== expected) throw new Error(`count drift ${key}: ${counts[key]} != ${expected}`);
}

const artifact = {
  version:'0.13-scope-finalization-v0.3-calibration-v0.1',
  status:'presealed_fresh_scope_calibration',
  sealed:false,
  scope:'liuyao_semantic_candidate_v0.5_scope_finalization',
  createdAfterCandidateV05DesignFreeze:true,
  provenance:{
    designPath:designFile,
    designSha256:sha256(designFile),
    designFreezeCommit:git('log','-1','--format=%H','--',designFile),
    generatorPath:'scripts/generate-liuyao-semantic-scope-finalization-v03-calibration.mjs',
    generatorCommit:git('rev-parse','HEAD'),
    generatedAt:new Date().toISOString()
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
    candidateV04ScopeCalibrationExcluded:true,
    fallbackAcceptanceCalibrationExcluded:true,
    routeabilityCalibrationExcluded:true,
    allDevelopmentIndependentBlindExcluded:true,
    candidateV04RegressionRowsExcluded:true
  },
  counts,
  rows
};
fs.writeFileSync(path.join(root, outputFile), `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log('Generated fresh Candidate v0.5 Scope Finalization v0.3 calibration corpus.');
console.log('- 222 total: 132 known (44 strong / 44 support / 44 pure fallback) + 90 non-route');
console.log(`- Candidate v0.5 design freeze commit: ${artifact.provenance.designFreezeCommit}`);
console.log(`- generator HEAD: ${artifact.provenance.generatorCommit}`);
