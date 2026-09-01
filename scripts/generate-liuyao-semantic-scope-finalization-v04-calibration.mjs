import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const designFile = 'data/liuyao-semantic-v013-candidate-v06-design-v0.1.json';
const outputFile = 'data/liuyao-semantic-scope-finalization-v0.4-calibration.json';
const design = JSON.parse(fs.readFileSync(path.join(root, designFile), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd:root, encoding:'utf8' }).trim();
if (design.status !== 'design_frozen_before_v06_calibration_data') throw new Error('Candidate v0.6 design must be frozen before calibration generation');

const rows = [];
let index = 1;
const addKnown = (candidatePath, routeId, texts) => {
  for (const text of texts) rows.push({ id:`SC4-${String(index++).padStart(3,'0')}`, text, expectedDisposition:'route_known', expectedRoute:routeId, expectedCandidatePath:candidatePath, subtype:null });
};
const addNonRoute = (subtype, texts) => {
  for (const text of texts) rows.push({ id:`SC4-${String(index++).padStart(3,'0')}`, text, expectedDisposition:'non_route', expectedRoute:null, expectedCandidatePath:null, subtype });
};

// 44 strong rows. New objects/time expressions; explicit current-outcome anchors remain intentionally stable.
addKnown('strong_arbitration','commercial_transaction',[
  '这笔摄影器材采购交易下周三前能不能成交',
  '供应商这张年度订单月底能不能顺利签成'
]);
addKnown('strong_arbitration','inventory_purchase',[
  '门店秋季这批货周二以前能不能全部入库',
  '仓库新到的这批商品月底前能不能完成补货入库'
]);
addKnown('strong_arbitration','inventory_sale',[
  '库房这批过季库存国庆前能不能出清',
  '店里最后一批旧款这个月能不能全部卖完'
]);
addKnown('strong_arbitration','borrow_money',[
  '我向堂姐借的临时周转款下周能不能拿到',
  '这次小微企业贷款申请十月能不能批下来',
  '我找朋友借的备用金月底前能不能借到'
]);
addKnown('strong_arbitration','lend_money',[
  '邻居向我借一万元应急，我这次要不要借给他',
  '朋友找我借一笔短期周转金，我现在借出去合适吗',
  '同学想从我这里借钱过渡，我该不该答应'
]);
addKnown('strong_arbitration','debt_collection',[
  '甲方欠我的咨询尾款下月中旬前能不能收回',
  '我借给同学的那笔钱春节前还能不能追回',
  '公司这笔应收项目款周五前能不能要回'
]);
addKnown('strong_arbitration','debt_repayment',[
  '我的车贷明年三月以前能不能还清',
  '这期信用卡欠款下个账单日前能不能结清',
  '手里剩下的培训贷今年冬天能不能还完'
]);
addKnown('strong_arbitration','partnership',[
  '我和朋友合伙做烘焙店以后能不能长久经营下去',
  '跟这个合作者共同经营设计工作室到底合不合适'
]);
addKnown('strong_arbitration','investment_profit',[
  '这只红利基金再放半年能不能盈利',
  '这个储能投资项目明年上半年会不会有利润'
]);
addKnown('strong_arbitration','investment_liquidation',[
  '这只黄金基金下周全部赎回能不能顺利完成',
  '手里的医药股仓位一次卖掉会不会卡住'
]);
addKnown('strong_arbitration','investment_suitability',[
  '这只海外指数ETF现在适不适合我参与',
  '这个民宿投资计划眼下值不值得我投'
]);
addKnown('strong_arbitration','investment_price_trend',[
  '这只半导体股票未来两周价格会不会继续上涨',
  '这只债券基金下个季度净值会不会走低'
]);
addKnown('strong_arbitration','income_salary',[
  '明年春季我的固定工资会不会上调',
  '公司年底调薪时我的基本薪酬能不能增加'
]);
addKnown('strong_arbitration','income_bonus',[
  '今年年中奖金能不能正常发下来',
  '这次专项奖励金下个月能不能到账'
]);
addKnown('strong_arbitration','receive_item',[
  '我买的显示器星期一以前能不能收到',
  '已经寄出的唱片机明天能不能到手',
  '这个相机包裹下周末前能不能送达'
]);
addKnown('strong_arbitration','item_purchase',[
  '这台除湿机现在该不该买',
  '我眼下要不要买这支镜头',
  '这款电纸书现在买下来合不合适'
]);
addKnown('strong_arbitration','relationship_development',[
  '我和这个女生以后能不能正式谈恋爱',
  '我们现在的暧昧关系会不会发展成恋爱'
]);
addKnown('strong_arbitration','marriage_match',[
  '我和伴侣明年秋天有没有机会结婚',
  '我们两家谈的这门亲事春节前能不能成'
]);
addKnown('strong_arbitration','marital_relationship',[
  '我和妻子最近一直僵着，以后关系能不能缓和',
  '我们夫妻近来争吵很多，这段婚姻还能不能继续'
]);

// 44 support rows: same semantic path families, newly written context.
addKnown('support_arbitration','financial_fortune',[
  '最近整体资金进出变化很明显，我想单独看看钱财这一块',
  '这阵子手上的收支忽松忽紧，我想占一下财务方面',
  '近两个月总体进账波动不少，我想问问资金情况',
  '今年现金余量起伏比较大，我想单独占这个主题',
  '最近手里的钱进出不太稳定，我想看看这一项',
  '这段时间整体收支反复，我想问一下财务这边',
  '近期资金宽紧变化明显，我想单独看看',
  '现在总体钱财状况让我比较在意，想占一下'
]);
addKnown('support_arbitration','business_operation',[
  '我的小餐馆近期经营状况反复，想单独占一下',
  '这间工作室最近利润起伏很大，我想问经营本身',
  '门店这阵子业绩高低变化明显，我想看看经营这块',
  '自己做的买卖近来亏赚反复，我想占一下',
  '网店最近营业情况不太稳定，我想单独问问',
  '咖啡店这段时间现金流起伏明显，我想看看经营面',
  '这个小摊最近营业状态变化不少，我想占这一项',
  '公司这条业务线近期业绩波动，我想看看本身'
]);
addKnown('support_arbitration','investment_profit',[
  '这只红利ETF最近收益上下变化明显，我想单独占一下',
  '这份投资近来利润起伏很大，我想看看收益方面',
  '手里的指数基金最近回本情况反复，我想单独问问',
  '这个投资计划目前收益变化不少，我想占这一项',
  '这只个股近来利润波动，我想看看',
  '我的债券基金近期收益变化让我在意，想问一下',
  '这份项目投资最近回本状态不稳定，我想单独占占'
]);
addKnown('support_arbitration','investment_liquidation',[
  '我已经决定把这只黄金基金全部赎回，想占一下这个动作',
  '手里的医药股准备一次卖掉，我想看看这一步',
  '这笔投资正在安排全部变现，我想单独问这件事',
  '这个项目已经确定退出投资，我想看看这个动作',
  '手上的海外ETF计划全部卖出，我想占一下这一项',
  '这份持仓准备全部清掉，我想单独看看',
  '我已经决定把这笔合约平仓，想问一下这个步骤'
]);
addKnown('support_arbitration','investment_position_decision',[
  '这只蓝筹股我正在考虑继续持有，想占一下',
  '手里的红利基金准备调整仓位，我想看看这件事',
  '这只海外ETF我在犹豫要不要减仓，想单独问问',
  '目前这只股票正在考虑加仓，我想看看这一步',
  '我对这份基金仓位怎么调整一直拿不定主意',
  '这只股票继续拿还是减一些，我想占一下',
  '当前短债基金的持仓要不要调整，我一直在考虑'
]);
addKnown('support_arbitration','investment_price_trend',[
  '这只红利基金最近净值起伏很大，我想单独占一下',
  '手里的医药股最近价格变化明显，我想看看涨跌方面',
  '这个海外ETF近期涨跌反复，我想占一下',
  '我关注的债券基金最近净值起伏明显，想单独看看',
  '这只蓝筹股近来的价格波动让我在意，想问一下',
  '这个投资标的近期涨跌变化很多，我想占这一项',
  '这只货币基金最近净值变化频繁，我想看看'
]);

// 44 pure-fallback rows, two per route, deliberately avoiding current deterministic anchors.
addKnown('pure_fallback','financial_fortune',[
  '接下来一年我在钱这一块会不会宽松一点',
  '往后几个月我手里的余裕会不会慢慢增加'
]);
addKnown('pure_fallback','business_operation',[
  '我手里这个小铺往后还能不能继续撑下去',
  '自己做的这门小生意以后有没有继续做的空间'
]);
addKnown('pure_fallback','commercial_transaction',[
  '现在和对方谈的这一件事最后能不能有结果',
  '眼前正在商量的这一桩事情之后有没有下文'
]);
addKnown('pure_fallback','inventory_purchase',[
  '店里下一轮要摆出来的东西最后能不能都备齐',
  '下个月营业要用的那批东西会不会全部准备好'
]);
addKnown('pure_fallback','inventory_sale',[
  '仓库压着的旧商品以后能不能一点点腾出去',
  '店里剩着的那些老款往后会不会慢慢减少'
]);
addKnown('pure_fallback','borrow_money',[
  '眼下缺的这笔周转钱我能不能从别人那里凑到',
  '最近手头差一块，会不会有人先拿钱帮我顶上'
]);
addKnown('pure_fallback','lend_money',[
  '朋友最近缺钱，我先拿一部分给他顶着是否合适',
  '熟人临时手紧，我分点自己的钱给他用会不会有问题'
]);
addKnown('pure_fallback','debt_collection',[
  '那笔留在别人手里的钱以后还有没有机会回来',
  '拖了挺久一直没回来的款最后能不能有着落'
]);
addKnown('pure_fallback','debt_repayment',[
  '压在身上的那笔账以后能不能彻底处理完',
  '一直挂着的欠账明年有没有机会完全了结'
]);
addKnown('pure_fallback','partnership',[
  '我跟这个人两个人搭着做事以后行不行',
  '跟他一起把眼前这个小项目长期做下去是否合适'
]);
addKnown('pure_fallback','investment_profit',[
  '放进去的这笔钱以后能不能给我带来一些回报',
  '我投进去的这一份以后会不会有正向收获'
]);
addKnown('pure_fallback','investment_liquidation',[
  '手里这一份现在全部退出来会不会顺当',
  '我想把里面剩下的都撤出来，这一步能不能顺利'
]);
addKnown('pure_fallback','investment_suitability',[
  '眼前这个机会跟我到底合不合',
  '这个项目现在适不适合我把钱放进去试试'
]);
addKnown('pure_fallback','investment_position_decision',[
  '手里的这一份我接下来还要不要继续留着',
  '眼前这份东西我是继续拿着还是少留一点更好'
]);
addKnown('pure_fallback','investment_price_trend',[
  '我盯着的这个东西接下来会往上还是往下',
  '眼前这个标的未来一阵子的高低变化会怎样'
]);
addKnown('pure_fallback','income_salary',[
  '以后每个月固定拿到手的那部分会不会变多',
  '明年我稳定进来的那份钱有没有增加的可能'
]);
addKnown('pure_fallback','income_bonus',[
  '今年额外那一笔钱最后会不会轮到我',
  '这次除了固定那份以外，我还能不能多拿一笔'
]);
addKnown('pure_fallback','receive_item',[
  '我等着的那个东西这两天能不能到我手上',
  '对方已经寄出的那件东西周末前会不会来到我这里'
]);
addKnown('pure_fallback','item_purchase',[
  '眼前这台小设备我要不要带回去用',
  '这个东西我现在花钱拿下来值不值'
]);
addKnown('pure_fallback','relationship_development',[
  '我跟这个人以后会不会变成更亲近的两个人',
  '我们两个人接下来有没有可能真正走到一起'
]);
addKnown('pure_fallback','marriage_match',[
  '我们两个人以后能不能真正定下来组成一个家',
  '这段关系以后有没有走到正式成家的机会'
]);
addKnown('pure_fallback','marital_relationship',[
  '我们两个人已经一起生活很久了，往后还能不能好好过',
  '现在家里两个人关系很僵，以后有没有缓过来的可能'
]);

addNonRoute('outside_current_22',[
  '明天这座城市会不会下雨',
  '下周航班通常几点开始值机',
  '这次资格考试我能不能顺利通过',
  '明年的研究生申请结果会怎样',
  '这趟远途旅行会不会按原计划出发',
  '我丢的钥匙还能不能找回来',
  '这场民事诉讼最后谁更有利',
  '新的租房合同什么时候开始生效',
  '这次驾照考试是否能一次合格',
  '我申请的学校能不能录取我',
  '后天出门坐车会不会延误',
  '昨天遗失的钱包有没有机会找回',
  '这次仲裁最终会支持哪一方',
  '我今年能不能考到目标分数',
  '下个月去大阪的行程能不能成行',
  '丢失的移动硬盘还在不在附近',
  '这起纠纷会不会进入正式诉讼',
  '我这次论文答辩能不能过',
  '年底的出差计划会不会临时取消',
  '遗失的门禁卡还能找到吗',
  '这次考试排名能不能进前十',
  '出国旅行的签证能不能按时下来',
  '丢在车上的雨伞还能拿回来吗',
  '这场合同纠纷最终能不能和解',
  '我的课程结业考试结果会怎样',
  '周末这趟自驾是否会顺利',
  '失踪的行李箱还能不能寻回',
  '对方会不会正式起诉我',
  '这次留学申请有没有录取机会',
  '下月这次旅行能不能照常进行'
]);

addNonRoute('route_unresolved',[
  '这件事之后会怎么样',
  '我现在这样做到底好不好',
  '接下来会不会顺利一点',
  '这个情况最后能不能解决',
  '最近这件事情让我有点拿不准',
  '往后会有什么变化吗',
  '我现在应该继续还是停下',
  '这件事情最终有没有结果',
  '目前这个状态还会持续多久',
  '我想看看接下来整体会怎样',
  '现在这个决定到底对不对',
  '以后还有没有转机',
  '眼下这一步走下去会怎样',
  '这个局面最后能不能变好',
  '现在我还有没有必要坚持',
  '这件事未来一阵子会怎么发展',
  '目前这样安排是否妥当',
  '接下来会不会出现新的变化',
  '这个选择以后会不会后悔',
  '我现在到底该往哪边走',
  '这件事情能不能有一个好结局',
  '目前的状态是不是快结束了',
  '接下来有没有值得期待的变化',
  '我现在这样处理是否合适',
  '这个问题之后还有没有机会改善',
  '目前这一步是不是应该继续',
  '之后的发展会不会越来越好',
  '这件事情最后有没有办法落定',
  '现在这个方向是不是走得通',
  '往后还有没有新的可能'
]);

addNonRoute('near_domain_not_current_route',[
  '银行借款的年化利率通常怎么计算',
  '申请贷款时一般需要提交哪些资料',
  '贷款申请条件通常包括哪些要求',
  '欠条的标准格式一般怎么写',
  '应收账款在会计上通常怎么做账龄分析',
  '坏账准备一般按什么方法计提',
  '合伙协议中的利润分配条款通常怎么约定',
  '合伙人的权限范围一般怎样写进协议',
  '办理企业登记通常需要准备哪些材料',
  '登记手续一般需要提交哪些证明文件',
  '结婚登记的办理条件通常包括什么',
  '办理登记时一般要携带哪些证件',
  '基金赎回手续费通常按照什么规则收取',
  '股票交易佣金现在一般怎么计算',
  '购买基金通常需要满足哪些开户条件',
  '投资账户的风险等级是什么意思',
  '工资条里的个税通常怎么核算',
  '奖金发放的个税一般如何计算',
  '快递签收流程一般有哪些步骤',
  '包裹投递失败后通常怎样重新派送',
  '商品采购合同一般应该包含哪些条款',
  '库存台账通常按什么方式记录',
  '销售出库单一般需要填写哪些项目',
  '网店经营许可证通常怎么申请',
  '营业执照变更一般需要提供哪些材料',
  '夫妻共同财产通常怎么界定',
  '婚姻登记流程一般分几个步骤',
  '恋爱关系中的沟通边界通常怎么理解',
  '应付款账龄在财务报表里通常怎么看',
  '贷款合同中的提前还款条款是什么意思'
]);

if (rows.length !== 222) throw new Error(`Candidate v0.6 Scope calibration rows ${rows.length} != 222`);
const count = (fn) => rows.filter(fn).length;
const counts = {
  total:rows.length,
  route_known:count((row)=>row.expectedDisposition==='route_known'),
  non_route:count((row)=>row.expectedDisposition==='non_route'),
  strong_arbitration:count((row)=>row.expectedCandidatePath==='strong_arbitration'),
  support_arbitration:count((row)=>row.expectedCandidatePath==='support_arbitration'),
  pure_fallback:count((row)=>row.expectedCandidatePath==='pure_fallback'),
  outside_current_22:count((row)=>row.subtype==='outside_current_22'),
  route_unresolved:count((row)=>row.subtype==='route_unresolved'),
  near_domain_not_current_route:count((row)=>row.subtype==='near_domain_not_current_route')
};
for (const [key, expected] of Object.entries({route_known:132,non_route:90,strong_arbitration:44,support_arbitration:44,pure_fallback:44,outside_current_22:30,route_unresolved:30,near_domain_not_current_route:30})) if (counts[key] !== expected) throw new Error(`${key} ${counts[key]} != ${expected}`);

const artifact = {
  version:'0.13-scope-finalization-v0.4-calibration-v0.1',
  status:'presealed_fresh_scope_calibration',
  sealed:false,
  scope:'liuyao_semantic_candidate_v0.6_scope_finalization',
  createdAfterCandidateV06DesignFreeze:true,
  provenance:{
    designPath:designFile,
    designSha256:sha256(designFile),
    designFreezeCommit:'e2331ec823d9d1fdf6976c6f7a45dba985431964',
    generatorPath:'scripts/generate-liuyao-semantic-scope-finalization-v04-calibration.mjs',
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
console.log('Generated Candidate v0.6 fresh Scope calibration preseal corpus.');
console.log(`- rows: ${rows.length}; known=${counts.route_known}; nonroute=${counts.non_route}`);
