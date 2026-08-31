import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'data/liuyao-semantic-decision-stack-v0.13-candidate-v02-independent-eval.json');
const candidateLockPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.2.lock.json';
const candidateLock = JSON.parse(fs.readFileSync(path.join(root, candidateLockPath), 'utf8'));
if (candidateLock.status !== 'locked') throw new Error('candidate v0.2 must be locked before independent eval generation');

const rows = [];
let index = 1;
const id = () => `V013-I2-${String(index++).padStart(3, '0')}`;
const addKnown = (candidatePath, routeId, texts) => texts.forEach((text) => rows.push({
  id:id(), text, expectedDisposition:'route_known', expectedRoute:routeId, expectedCandidatePath:candidatePath
}));
const addNonRoute = (subtype, texts) => texts.forEach((text) => rows.push({
  id:id(), text, expectedDisposition:'non_route', expectedRoute:null, expectedCandidatePath:null, nonRouteSubtype:subtype
}));

// Fresh post-lock strong path. These are new phrasings, not mutations of the v0.1 independent set.
addKnown('strong_arbitration','commercial_transaction',[
  '代理商这张采购单本周能不能谈成',
  '和渠道方的这笔交易月底前能不能落地',
  '客户这一单最终能不能正式签约'
]);
addKnown('strong_arbitration','inventory_purchase',[
  '店里新采购的货品周三前能不能入库',
  '仓库下一批补库存能不能在促销前到位',
  '门店这次进货能不能按数量全部进仓'
]);
addKnown('strong_arbitration','inventory_sale',[
  '仓库里的这批货这个月能不能出清',
  '店里积压货节前能不能全部卖掉',
  '这批经营库存年底前能不能卖完'
]);
addKnown('strong_arbitration','borrow_money',[
  '我找同事借一笔周转款这周能不能拿到',
  '银行经营贷申请这次能不能批下来',
  '最近缺一笔钱周转，能不能从家里筹到'
]);
addKnown('strong_arbitration','lend_money',[
  '同学向我借钱周转，我把钱借给他妥不妥',
  '亲戚找我借一笔款，我现在出借合适吗',
  '朋友从我这里借钱，我答应借出去会不会有问题'
]);
addKnown('strong_arbitration','debt_collection',[
  '客户欠我的应收款下周能不能收回',
  '借出去的那笔钱月底前还能不能追回',
  '对方拖欠我的货款今年能不能要回'
]);
addKnown('strong_arbitration','debt_repayment',[
  '我的经营贷今年能不能还清',
  '这笔信用卡欠款下个月能不能结清',
  '本人剩下的贷款能不能在年底前还完'
]);
addKnown('strong_arbitration','partnership',[
  '和朋友合伙做这家店以后顺不顺',
  '我跟这个合伙人共同经营项目是否合适',
  '跟同事一起经营工作室能不能长期合作'
]);
addKnown('strong_arbitration','investment_profit',[
  '这个新能源项目投进去半年后能不能赚钱',
  '这只债券基金持有一年会不会有收益',
  '我这笔投资到年底能不能回本'
]);
addKnown('strong_arbitration','investment_liquidation',[
  '这只基金现在全部赎回能不能顺利到账',
  '手上的ETF一次性卖出会不会卡住',
  '这个股票仓位全部清掉能不能顺利完成'
]);
addKnown('strong_arbitration','investment_suitability',[
  '这个黄金ETF眼下适不适合我投资',
  '现在参与这只指数基金值不值得'
]);
addKnown('strong_arbitration','investment_price_trend',[
  '这只个股未来两周会不会继续走高',
  '这个基金接下来价格会不会回落'
]);
addKnown('strong_arbitration','income_salary',[
  '下一轮调薪我的固定薪酬能不能提高',
  '明年的月薪会不会增加'
]);
addKnown('strong_arbitration','income_bonus',[
  '这次绩效奖金能不能拿到',
  '项目奖励金月底前会不会发下来'
]);
addKnown('strong_arbitration','receive_item',[
  '我下单的相机周五能不能送到',
  '已经寄出的平板什么时候能收到'
]);
addKnown('strong_arbitration','item_purchase',[
  '这台投影仪现在值不值得买',
  '这个空气净化器要不要买'
]);
addKnown('strong_arbitration','relationship_development',[
  '我跟她的暧昧以后能不能发展成恋爱',
  '我们两个有没有机会正式在一起'
]);

// Fresh support path: route topic is positive, but no decisive current target.
addKnown('support_arbitration','financial_fortune',[
  '近几个月总体资金流起伏明显，我想看看这一块',
  '最近手头宽裕和紧张总在变化，想单独问钱财方面',
  '今年整体收支波动不少，我想占一下财务状况',
  '这一阵现金流忽好忽坏，我想看看总体情况',
  '近期整体进账不太稳定，我想单独问这一项',
  '最近钱财方面变化很频繁，我想专门占一下',
  '这段时间总体资金松紧反复，我想看看',
  '今年财务上的起伏比较大，我想问这一块'
]);
addKnown('support_arbitration','business_operation',[
  '这家饭店最近业绩忽高忽低，我想问经营本身',
  '我的工作室近期现金流反复，想看看营业状况',
  '网店这阵利润波动很大，我想单独占经营这块',
  '门店最近亏损和盈利来回变化，我想看看生意本身',
  '这间咖啡店近期业绩不稳，我想问经营情况',
  '公司业务最近利润变化明显，我想单独看看',
  '这家便利店近期营业状况反复，我想占一下经营',
  '我的小餐馆最近现金流忽松忽紧，想问经营本身'
]);
addKnown('support_arbitration','commercial_transaction',[
  '供应商这份采购合同目前还在讨论，我想问这一单',
  '客户这张订单仍在沟通，我想单独占一下这笔交易',
  '买家那份合同现在还在往返确认，我想看看这件事',
  '这笔批发交易目前还在磋商，我想占一下',
  '渠道方这张采购订单还没有定，我想问问',
  '客户这份商业合同仍在推进，我想单独看看'
]);
addKnown('support_arbitration','investment_profit',[
  '这只基金最近收益忽高忽低，我想单独看看',
  '这个投资项目目前利润波动明显，我想占一下',
  '手里的ETF近期收益变化很大，我想问这一块',
  '这笔投资最近回本情况反复，我想看看',
  '指数基金这阵收益不稳定，我想单独占一下'
]);
addKnown('support_arbitration','investment_liquidation',[
  '这只基金已经准备赎回，我想看看退出这一步',
  'ETF仓位决定全部卖出，我想单独占这个动作',
  '手里的股票准备清仓，我想问一下这件事',
  '这笔投资计划退出持仓，我想看看这个过程'
]);
addKnown('support_arbitration','investment_position_decision',[
  '这只ETF我在犹豫减仓，想占一下这个调整',
  '基金持仓正在考虑加仓，我想看看这一步',
  '股票仓位要不要调整这件事我拿不准，想问问',
  '手里的基金准备减少持仓，我想单独占一下',
  '这个ETF我在考虑继续持有还是减仓，想看看'
]);
addKnown('support_arbitration','investment_price_trend',[
  '这只股票最近涨跌很频繁，我想问价格这一块',
  'ETF近期净值来回波动，我想单独占一下',
  '债券基金最近价格变化明显，我想看看',
  '这只基金近来涨跌反复，我想问一下'
]);
addKnown('support_arbitration','income_salary',[
  '最近固定工资这一项让我很在意，想单独看看',
  '目前薪资这块我一直挂心，想占一下'
]);
addKnown('support_arbitration','income_bonus',[
  '今年年终奖这件事我一直惦记，想单独看看',
  '部门季度奖励目前让我比较在意，想占一下'
]);

// Fresh fallback path: two per current route. Wording intentionally avoids Evidence/Arbitration anchors.
addKnown('fallback_head','financial_fortune',[
  '接下来半年日子会不会比现在宽松一点',
  '今年我能不能比往年更容易存下些余钱'
]);
addKnown('fallback_head','business_operation',[
  '我这份营生往后还能不能稳稳做下去',
  '手里这个铺面以后还有没有继续撑着的空间'
]);
addKnown('fallback_head','commercial_transaction',[
  '和对方这桩事最后能不能谈拢',
  '手上这一宗合作最后有没有结果'
]);
addKnown('fallback_head','inventory_purchase',[
  '店里下一轮要添的东西能不能及时备齐',
  '货架接下来要补的那些东西能不能按时齐全'
]);
addKnown('fallback_head','inventory_sale',[
  '库房压着的旧东西以后能不能慢慢腾出去',
  '店里剩下那堆旧东西能不能逐步走掉'
]);
addKnown('fallback_head','borrow_money',[
  '眼下能不能先筹来一笔临时周转用的钱',
  '最近有没有办法弄到一笔应急用的钱'
]);
addKnown('fallback_head','lend_money',[
  '朋友手头紧，我先给他一笔钱用妥不妥',
  '把这笔钱暂时给同事周转会不会留下麻烦'
]);
addKnown('fallback_head','debt_collection',[
  '之前本该回到我这里的那笔款最后还有着落吗',
  '早前应当给我的那笔钱以后还能回到手里吗'
]);
addKnown('fallback_head','debt_repayment',[
  '身上背着的那笔账今年能不能彻底了结',
  '我现在这笔旧账以后能不能完全处理掉'
]);
addKnown('fallback_head','partnership',[
  '我和朋友两个人一起把这个项目做下去行不行',
  '跟他搭着把这门事继续做下去合适吗'
]);
addKnown('fallback_head','investment_profit',[
  '把钱放进这份理财一段时间以后有没有赚头',
  '这份理财拿久一些最后能不能有进项'
]);
addKnown('fallback_head','investment_liquidation',[
  '手上这份理财整个退出来会不会顺当',
  '这份理财我全部退掉会不会卡在中间'
]);
addKnown('fallback_head','investment_suitability',[
  '眼下把钱放进这份理财妥不妥',
  '这个理财现在进去是不是合适的选择'
]);
addKnown('fallback_head','investment_position_decision',[
  '这份理财接下来多放一点还是收一点回来',
  '手里这份理财继续留这么多还是减一些'
]);
addKnown('fallback_head','investment_price_trend',[
  '这个票过一阵还会往上走吗',
  '这份理财的价过些天会不会往下走'
]);
addKnown('fallback_head','income_salary',[
  '明年每个月固定到手的那份钱会不会更多',
  '以后每月稳定拿到的那部分能不能增加'
]);
addKnown('fallback_head','income_bonus',[
  '年底额外那一笔今年还能不能有',
  '项目做完以后那份额外奖励最后能不能拿到'
]);
addKnown('fallback_head','receive_item',[
  '网购的书架大概什么时候来',
  '前几天订的落地灯大概哪天到家'
]);
addKnown('fallback_head','item_purchase',[
  '这个台灯现在入不入',
  '这把办公椅眼下要不要入'
]);
addKnown('fallback_head','relationship_development',[
  '我和这个人以后有没有可能变成一对',
  '我们俩之后还能不能走得更近一些'
]);
addKnown('fallback_head','marriage_match',[
  '我俩以后有没有机会办婚礼',
  '我们两个人最后会不会组建一个家'
]);
addKnown('fallback_head','marital_relationship',[
  '我和伴侣这段长期关系以后还能不能稳住',
  '我们共同生活这么久，往后的相处能不能改善'
]);

addNonRoute('outside_current_22',[
  '这次部门面试最后能不能拿到录用通知',
  '下个月的资格考试我能不能通过',
  '这趟去大阪的行程能不能按计划走完',
  '这场仲裁最后会不会作出对我有利的裁决',
  '昨晚丢的门禁卡还能不能找回来',
  '明天下午东京会不会下雨',
  '这个周末主队能不能赢下比赛',
  '我写的这个接口为什么总返回五百错误',
  '这道炖牛肉要不要再多放一点盐',
  '这套公寓下个月续租会不会涨房租',
  '新护照的换发手续大概需要几天',
  '这个摄影项目最终能不能按期拍完',
  '我投稿的短篇小说会不会被杂志采用',
  '这门法语课期末能不能达到A2水平',
  '明天的航班会不会因为台风取消',
  '劳动纠纷调解能不能在本月结束',
  '丢掉的钥匙可能落在办公室还是车站',
  '这次升职评审我能不能进入最终名单',
  '研究生申请今年能不能收到录取',
  '这趟自驾途中会不会遇到严重堵车',
  '法院这次开庭会不会当庭宣判',
  '不见的相机电池还能不能找到'
]);
addNonRoute('route_unresolved',[
  '这件事情最后会怎么样',
  '我现在这个选择到底好不好',
  '接下来会不会有什么变化',
  '这件事还有没有转圜的余地',
  '我该不该继续等下去',
  '这一步往前走会不会顺利',
  '现在这个局面以后会变好吗',
  '对方接下来会怎么想',
  '最近这件烦心事什么时候能过去',
  '这次决定会不会让我后悔',
  '眼前的安排有没有必要改',
  '目前这个方向是不是对的',
  '以后情况会不会越来越稳定',
  '我现在坚持下去值不值',
  '这个结果最终会不会如愿',
  '接下来应该更主动还是先等等',
  '这件事的转折大概什么时候来',
  '目前这样处理会不会更合适',
  '我跟着现在的计划走有没有问题',
  '后面的发展会不会出意外',
  '现在改变主意还来得及吗',
  '这件事最终有没有一个好结果'
]);
addNonRoute('near_domain_not_current_route',[
  '这张工资条里的个税扣得对不对',
  '公司的年终奖分配制度公平不公平',
  '采购合同里的违约责任条款有没有风险',
  '这个理财平台收的托管费是不是太高',
  '基金账户的管理费今年有没有调整',
  '快递保价规则里哪些情况不赔',
  '这台电脑的保修条款是否覆盖屏幕',
  '商店会员积分什么时候会过期',
  '公司报销制度里打车费能不能报',
  '银行贷款合同的提前还款手续费怎么算',
  '信用卡账单里的分期费率有没有算错',
  '证券账户的佣金现在是多少',
  '这份商业合同适用哪个地区的法律',
  '网店平台今年的抽成规则有没有变化',
  '供应商发票抬头应该填哪个主体',
  '奖金方案里绩效权重设置得合理吗',
  '工资明细里的社保扣款为什么变多了',
  '基金赎回规则规定几点前算当天申请',
  '物流公司的赔付上限是按什么标准算',
  '这款耳机的退货期限一共有多少天',
  '股票交易的印花税现在怎么收',
  '采购协议的自动续约条款是否有效'
]);

const counts = {
  total:rows.length,
  route_known:rows.filter((row) => row.expectedDisposition === 'route_known').length,
  non_route:rows.filter((row) => row.expectedDisposition === 'non_route').length,
  strong_arbitration:rows.filter((row) => row.expectedCandidatePath === 'strong_arbitration').length,
  support_arbitration:rows.filter((row) => row.expectedCandidatePath === 'support_arbitration').length,
  fallback_head:rows.filter((row) => row.expectedCandidatePath === 'fallback_head').length,
  outside_current_22:rows.filter((row) => row.nonRouteSubtype === 'outside_current_22').length,
  route_unresolved:rows.filter((row) => row.nonRouteSubtype === 'route_unresolved').length,
  near_domain_not_current_route:rows.filter((row) => row.nonRouteSubtype === 'near_domain_not_current_route').length
};
for (const [key, expected] of Object.entries({ total:198, route_known:132, non_route:66, strong_arbitration:44, support_arbitration:44, fallback_head:44, outside_current_22:22, route_unresolved:22, near_domain_not_current_route:22 })) {
  if (counts[key] !== expected) throw new Error(`count ${key}=${counts[key]} expected=${expected}`);
}

const payload = {
  version:'0.13-candidate-v0.2-independent-eval-v0.1',
  status:'presealed_independent_eval',
  sealed:false,
  scope:'liuyao_semantic_decision_stack_v0.13',
  purpose:'Fresh post-lock independent evaluation for Candidate v0.2. First result must be recorded without post-evaluation retuning.',
  createdAfterCandidateLock:true,
  candidate:{ lockPath:candidateLockPath, candidateSha256:candidateLock.candidateSha256 },
  policy:{
    useForTraining:false,
    useForCalibration:false,
    modifyLockedCandidateFromThisEval:false,
    reuseAsFutureBlind:false,
    priorCandidateV01IndependentExcluded:true,
    priorDevelopmentAndCalibrationExcluded:true,
    healthDiseaseSamplesExcluded:true,
    traditionalLiuYaoFieldsForbidden:true
  },
  counts,
  rows
};
fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Generated fresh Candidate v0.2 independent eval: ${rows.length} rows`);
