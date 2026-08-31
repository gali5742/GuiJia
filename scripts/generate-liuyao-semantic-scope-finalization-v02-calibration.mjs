import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.2-calibration.json');
const designRelative = 'data/liuyao-semantic-v013-candidate-v04-design-v0.1.json';
const designFreezeCommit = execFileSync('git', ['log','-1','--format=%H','--',designRelative], { cwd:root, encoding:'utf8' }).trim();
const generatorCommit = execFileSync('git', ['rev-parse','HEAD'], { cwd:root, encoding:'utf8' }).trim();

const rows = [];
let index = 1;
const addKnown = (candidatePath, routeId, texts) => {
  for (const text of texts) rows.push({
    id:`SC2-${String(index++).padStart(3,'0')}`,
    text,
    expectedDisposition:'route_known',
    expectedRoute:routeId,
    expectedCandidatePath:candidatePath,
    subtype:null
  });
};
const addNonRoute = (subtype, texts) => {
  for (const text of texts) rows.push({
    id:`SC2-${String(index++).padStart(3,'0')}`,
    text,
    expectedDisposition:'non_route',
    expectedRoute:null,
    expectedCandidatePath:null,
    subtype
  });
};

// 44 strong-arbitration rows. These contain explicit current-target semantics.
addKnown('strong_arbitration','commercial_transaction',[
  '这笔设备采购交易月底前能不能真正成交','和这位买家谈的订单这周能不能正式签成'
]);
addKnown('strong_arbitration','inventory_purchase',[
  '店里秋季要补的那批货能不能在周末前全部进到仓里','门店这轮补货能不能按预定时间全部到齐'
]);
addKnown('strong_arbitration','inventory_sale',[
  '仓库积着的这批季末货十月前能不能全部卖掉','店里压了几个月的库存下周能不能清完'
]);
addKnown('strong_arbitration','borrow_money',[
  '我向姐姐开口借的这笔临时款这个月能不能拿到','这次向银行申请的经营贷款能不能批下来','我找朋友借来应急的那笔钱这周能不能到手'
]);
addKnown('strong_arbitration','lend_money',[
  '朋友来借两万元，我这次把钱借给他合适吗','表弟找我借一笔应急钱，我答应借出去妥不妥','同事要从我这里借钱周转，我现在该不该借'
]);
addKnown('strong_arbitration','debt_collection',[
  '客户拖欠的服务尾款这个月能不能收回来','前年借给朋友的钱今年冬天以前还能不能追回','对方欠公司的那笔应收款这周能不能要回来'
]);
addKnown('strong_arbitration','debt_repayment',[
  '我剩下的车贷今年能不能一次还清','这笔信用卡欠款下个账期能不能全部结掉','手上的消费贷款年底以前能不能照计划还完'
]);
addKnown('strong_arbitration','partnership',[
  '我和朋友合伙经营这间咖啡店以后能不能稳定做下去','跟这个搭档一起开工作室接下来合不合适'
]);
addKnown('strong_arbitration','investment_profit',[
  '这只债券基金再持有四个月能不能赚到钱','这项投资放到明年春天会不会有利润'
]);
addKnown('strong_arbitration','investment_liquidation',[
  '我准备把这只基金在下周全部赎回，能不能顺利完成','手里的股票仓位这次一次全清会不会卡住'
]);
addKnown('strong_arbitration','investment_suitability',[
  '这个投资计划现在适不适合我参加','这只指数基金眼下值不值得我投入'
]);
addKnown('strong_arbitration','investment_price_trend',[
  '这只基金接下来十天还会不会继续往下跌','这只股票下个月价格会不会往上走'
]);
addKnown('strong_arbitration','income_salary',[
  '明年我的固定月薪会不会上调','公司下一轮调薪时我的基本工资能不能增加'
]);
addKnown('strong_arbitration','income_bonus',[
  '今年年终绩效奖金能不能正常发下来','这个项目结束后的奖励金我能不能拿到'
]);
addKnown('strong_arbitration','receive_item',[
  '已经发出的显示器周六以前能不能送到我手上','我买的镜头明天能不能收到','这个办公椅包裹下周一以前能不能送达'
]);
addKnown('strong_arbitration','item_purchase',[
  '这台便携投影现在值不值得买','我今天要不要买这副降噪耳机','这款洗地机现在买下来合不合适'
]);
addKnown('strong_arbitration','relationship_development',[
  '我和这个男生之后能不能正式成为恋人','我们现在的暧昧关系会不会发展成恋爱'
]);
addKnown('strong_arbitration','marriage_match',[
  '我和对象明年能不能结婚','我们这门婚事今年最后能不能成'
]);
addKnown('strong_arbitration','marital_relationship',[
  '我和妻子最近的夫妻关系以后能不能缓和','这段婚姻接下来还能不能继续维持'
]);

// 44 support-arbitration rows. They intentionally mention a supported topic/event without an explicit outcome target.
addKnown('support_arbitration','financial_fortune',[
  '最近家里整体收支让我很在意，想单独占一下','这一阵手上的财务状况变化不少，我想看看这一块','今年钱财方面起伏比较明显，想问问这个主题','近几个月现金进出反复，我想占一下财务这件事','最近整体经济状态不太稳定，我想看看','这一阶段手头松紧变化很大，想单独问钱财方面','最近日常收支波动不少，我想占这一项','目前整体财务让我有些挂心，想看看后面'
]);
addKnown('support_arbitration','business_operation',[
  '我的小店最近经营状态反复，想单独占一下','工作室这段时间营运不太稳定，我想问经营这块','这家铺子最近业绩忽高忽低，想看看经营本身','自己做的生意近来状态反复，我想占一下','这个网店最近经营情况变化明显，想问问','餐馆这阵子营运状态不稳，我想看看这一项','手里的门店最近经营压力起伏很大，想占一下','公司这项小业务最近表现反复，我想看看经营面'
]);
addKnown('support_arbitration','investment_profit',[
  '我最近主要在意这笔投资的收益变化，想占一下','这只基金这阵子的收益起伏让我很在意','手上的投资项目最近利润反复，我想看看这一块','这笔理财现在回报变化明显，想单独问一下','这个基金最近收益不太稳定，我想占这件事','我投的项目近来回本情况反复，想看看','这份投资目前的收益表现让我一直挂心'
]);
addKnown('support_arbitration','investment_liquidation',[
  '我已经决定把手里的基金全部退出，想占一下这个动作','这份股票持仓准备整个清掉，我想看看这一步','这笔投资正在安排全部变现，想问一下这个过程','我已经准备退出这项投资，想单独占这件事','手上的ETF计划全部卖出，我想看看这一项','这份基金仓位准备整体清掉，想占一下','我已经决定把这笔持仓全部平掉，想问这一步'
]);
addKnown('support_arbitration','investment_position_decision',[
  '我正在考虑手里的股票要不要继续拿着，想占一下','这只基金最近在考虑调整持有份额，我想看看','手上的ETF我一直犹豫要不要减一些，想问问','目前这只股票在考虑增加一点仓位，想占这一步','我对这份基金怎么调整持有量拿不定主意','这只股票继续留还是减一点这件事我想看看','现在ETF的持有份额要不要调整，我一直在考虑'
]);
addKnown('support_arbitration','investment_price_trend',[
  '这只基金最近净值波动明显，我想单独看看价格这一块','手里的股票最近价格起伏很大，想占一下','这个ETF最近上下变化频繁，我想看看','我关注的基金近来净值反复，想问问','这只个股最近价格变化让我很在意，想单独占一下','这个投资标的最近价格波动明显，我想看看这一项','手里的债券基金近来净值变化很多，想问一下'
]);

// 44 pure-fallback rows, two per current route. These deliberately avoid explicit Arbitration anchors.
addKnown('pure_fallback','financial_fortune',['明年手头能不能比今年宽裕一点','接下来几个月我能不能多留下些余钱']);
addKnown('pure_fallback','business_operation',['这个小铺往后还能不能继续撑着','自己这门小生意以后有没有做下去的空间']);
addKnown('pure_fallback','commercial_transaction',['和对方这桩买卖最后有没有结果','眼前这一单后面还会不会有下文']);
addKnown('pure_fallback','inventory_purchase',['下一轮店里要添的东西最后能不能凑齐','仓里准备补上的那些商品后面能不能备全']);
addKnown('pure_fallback','inventory_sale',['库里堆着的旧东西以后能不能慢慢走掉','手上积着的那批货后面能不能逐渐腾出去']);
addKnown('pure_fallback','borrow_money',['最近手头差的一截能不能从亲友那里补过来','眼下这个资金缺口有没有人能先帮我垫上']);
addKnown('pure_fallback','lend_money',['熟人最近缺钱，我先拿一笔给他用妥不妥','亲戚临时手紧，我把钱给他顶一阵会不会麻烦']);
addKnown('pure_fallback','debt_collection',['以前给出去的那笔钱最后还能不能回到我这里','一直放在别人那里的那笔款以后还有没有着落']);
addKnown('pure_fallback','debt_repayment',['身上挂着的这笔账年底前能不能彻底结束','压了很久的这项欠款以后能不能清干净']);
addKnown('pure_fallback','partnership',['跟这个人两个人搭着把店做下去行不行','我和他一起撑这门小生意以后合不合适']);
addKnown('pure_fallback','investment_profit',['这份理财放一段时间最后能不能多出些钱','钱放进这个项目以后最终有没有赚头']);
addKnown('pure_fallback','investment_liquidation',['这份理财整个退出来以后会不会顺','手上的投资全部拿回来会不会遇到阻碍']);
addKnown('pure_fallback','investment_suitability',['这份理财眼下参与进去对我合不合宜','这个投资现在放钱进去妥不妥']);
addKnown('pure_fallback','investment_position_decision',['手里这份票以后多留些好还是少留些好','现在这份持有量继续放着还是收回一点']);
addKnown('pure_fallback','investment_price_trend',['这份票过一阵大概往高处还是低处走','手里这份理财后面价格会抬起来还是压下去']);
addKnown('pure_fallback','income_salary',['以后每个月固定拿到的那部分会不会多一点','明年公司按月给我的固定那份能不能增加']);
addKnown('pure_fallback','income_bonus',['年底公司另外给的那份钱今年还有没有','项目收尾以后多出来的那一份我能不能分到']);
addKnown('pure_fallback','receive_item',['我定的书架大概还要几天才来','网上买的床垫什么时候能到家']);
addKnown('pure_fallback','item_purchase',['这台小冰箱眼下入不入','这个电动磨豆机现在收不收']);
addKnown('pure_fallback','relationship_development',['我和这个人之后有没有可能走成一对','我们两个以后能不能从现在这样再近一步']);
addKnown('pure_fallback','marriage_match',['我和对象最后有没有机会真正成为一家人','我们两个人以后能不能把终身大事办下来']);
addKnown('pure_fallback','marital_relationship',['我和另一半最近总别扭，后面能不能好相处一些','两个人一起生活这些年，往后关系能不能缓下来']);

addNonRoute('outside_current_22',[
  '这次法语等级考试最后能不能合格','下周去那家公司终面有没有机会录取','落在图书馆的围巾还能不能找回来','这场房屋纠纷最后结果会不会对我有利','下个月搬到新公寓整个过程顺不顺','这次长期居留申请能不能按期批下来',
  '调去新的技术组以后我能不能适应','这门线上课程继续学下去合不合适','周末的羽毛球比赛能不能进入决赛','明天在部门大会做说明会不会顺利','换去另一个城市生活对我合不合适','刚签下的新房住进去会不会舒心',
  '这次职业认证复核能不能一次通过','下趟航班托运行李会不会出问题','加入新的研发团队以后同事好不好相处','孩子转到另一个班以后能不能适应','这篇短篇小说投出去有没有机会采用','明天给合作方做提案展示能不能顺利',
  '现在改读另一个专业是不是合适','这次劳动调解最终会不会达成协议','前几天弄丢的门卡还能不能找回','下次驾照路考能不能顺利合格','月底这趟海外出差一路顺不顺','报名的演唱会抽签这次能不能中',
  '学校宿舍这次申请有没有机会排到','周末露营计划能不能照原安排进行','这次摄影展投稿最后能不能入选','换到新的办公位置以后工作会不会更顺','下周资格面谈能不能一次通过','这回租房审查最后能不能过'
]);
addNonRoute('route_unresolved',[
  '眼下这件事情以后究竟会变成什么样','我现在做的这个选择到底有没有问题','后面的局面会不会慢慢出现变化','这件事目前还值不值得继续投入','对方接下来到底会怎么回应','我是不是应该先再等一阵看看',
  '现在这个机会究竟要不要抓住','目前走的这条路还有没有必要继续','事情最后还会不会出现别的变化','我现在应该主动一点还是先不动','这件事情还要多久才会清楚','接下来我到底应该往哪个方向使劲',
  '目前这种状态还会保持多久','我现在这么决定以后会不会后悔','眼前这件事后面还有没有转圜余地','下一步我是不是还应该坚持','这回事情最后到底会落成什么样','之后一段时间整体会不会顺一些',
  '我现在是不是判断错了方向','这个机会后面还会不会保留下来','眼前这一步现在做是不是合适','我是不是还要继续耗在这里','后面会不会突然冒出新的变化','目前这个局面还能不能打开',
  '接下来我是继续等待还是开始行动','现在继续走下去是不是更合适','这件事情什么时候才会有答案','我眼下还有没有别的选择','之后这一阵事情大概会往哪边变化','我现在这个判断到底靠不靠谱'
]);
addNonRoute('near_domain_not_current_route',[
  '我想比较几家基金平台的管理费有什么差别','证券客户端最近为什么总提示更新','我在整理小店几种经营模式各自的优缺点','客户一直不回消息通常会有哪些原因','供应商信用评级一般应该怎么看','合伙人的职责分工通常怎样写比较清楚',
  '公司准备缩编时通常会先出现哪些迹象','内部岗位调整一般需要经过哪些流程','商业报价中常见的成本项目都有哪些','仓库盘点通常多长时间做一次','几家快递公司的服务范围应该怎么比较','商品售后条款一般重点看哪些内容',
  '基金的托管费和销售服务费有什么区别','股票交易产生的各种费用通常怎么计算','基金赎回的确认日期一般怎么算','工资明细里的各项扣款分别代表什么','项目奖励一般有哪些常见分配方法','商业合同里的违约责任通常怎么理解',
  '企业账户选择开户银行主要比较哪些方面','基金经理的从业经历应该从哪里查询','股票软件忘记密码一般怎么处理','门店周边客流统计通常用什么方法','伴侣换岗位后常见的适应问题有哪些','别人介绍认识时通常先了解对方哪些情况',
  '投资产品风险等级是怎样划分的','门店库存周转率一般怎么计算','借款合同里的利率条款应该怎么看','应收账款账龄通常怎么分类','工资结构里固定部分和浮动部分怎么区分','婚姻登记通常需要准备哪些材料'
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
if (counts.total !== 222 || counts.route_known !== 132 || counts.non_route !== 90) throw new Error(`scope calibration total/count mismatch: ${JSON.stringify(counts)}`);
if (counts.strong_arbitration !== 44 || counts.support_arbitration !== 44 || counts.pure_fallback !== 44) throw new Error(`scope calibration known-path mismatch: ${JSON.stringify(counts)}`);
if (counts.outside_current_22 !== 30 || counts.route_unresolved !== 30 || counts.near_domain_not_current_route !== 30) throw new Error(`scope calibration subtype mismatch: ${JSON.stringify(counts)}`);

const artifact = {
  version:'0.13-scope-finalization-v0.2-calibration-v0.1',
  status:'presealed_fresh_scope_calibration',
  sealed:false,
  scope:'liuyao_semantic_candidate_v0.4_scope_finalization',
  createdAfterCandidateV04AssemblyFreeze:true,
  provenance:{
    designPath:designRelative,
    designFreezeCommit,
    generatorCommit
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
    fallbackAcceptanceCalibrationExcluded:true,
    routeabilityCalibrationExcluded:true,
    sealedBlindAndIndependentExcluded:true
  },
  counts,
  rows
};
fs.writeFileSync(out, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log('Generated fresh Candidate v0.4 Scope finalization calibration corpus.');
console.log('- 222 total: 132 known (44 strong / 44 support / 44 pure fallback) + 90 non-route');
console.log(`- Candidate v0.4 assembly freeze commit: ${designFreezeCommit}`);
console.log(`- generator HEAD: ${generatorCommit}`);
