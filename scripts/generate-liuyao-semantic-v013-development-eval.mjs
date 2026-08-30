import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'data/liuyao-semantic-decision-stack-v0.13-development.json');
const rows = [];
let index = 1;
const addKnown = (candidatePath, routeId, texts) => {
  for (const text of texts) rows.push({ id:`V013-D-${String(index++).padStart(3,'0')}`, text, expectedDisposition:'route_known', expectedRoute:routeId, expectedCandidatePath:candidatePath });
};
const addNonRoute = (subtype, texts) => {
  for (const text of texts) rows.push({ id:`V013-D-${String(index++).padStart(3,'0')}`, text, expectedDisposition:'non_route', expectedRoute:null, expectedCandidatePath:null, nonRouteSubtype:subtype });
};

// 44 strong-arbitration rows. These deliberately use current structural evidence, not mere background mentions.
addKnown('strong_arbitration','commercial_transaction',[
  '这笔批发交易下周能不能最终成交','客户这单采购合同月底前能不能签下来'
]);
addKnown('strong_arbitration','inventory_purchase',[
  '门店这批补货周五前能不能全部入库','门店仓库下一轮进货能不能按计划到齐'
]);
addKnown('strong_arbitration','inventory_sale',[
  '仓库这批尾货月底前能不能全部出清','门店积压库存下个月能不能卖完'
]);
addKnown('strong_arbitration','borrow_money',[
  '我向表哥借一笔周转钱这周能不能拿到','这次银行房贷申请月底前能不能批下来','我找父母借的应急款能不能顺利借到'
]);
addKnown('strong_arbitration','lend_money',[
  '朋友向我借三万元这次该不该借给他','同事找我借一笔周转款我借出去合适吗','亲戚从我这里借钱我这次要不要答应'
]);
addKnown('strong_arbitration','debt_collection',[
  '客户欠我的尾款这个月能不能收回','之前借给同事的钱年底前还能追回吗','公司那笔应收账款这周能不能要回来'
]);
addKnown('strong_arbitration','debt_repayment',[
  '我的房贷今年底前能不能全部还清','我这笔信用卡欠款下个月能不能结清','现在这笔消费贷我能不能按计划还完'
]);
addKnown('strong_arbitration','partnership',[
  '我和朋友合伙开店接下来能不能继续做下去','跟这个搭档共同经营工作室以后顺不顺'
]);
addKnown('strong_arbitration','investment_profit',[
  '这只基金继续持有三个月能不能盈利','这项投资到年底会不会有利润'
]);
addKnown('strong_arbitration','investment_liquidation',[
  '这只基金我准备在月底前全部赎回，执行上能不能顺利完成','我把股票仓位一次性清掉会不会卡住'
]);
addKnown('strong_arbitration','investment_suitability',[
  '这项投资现在适不适合我参与','这只ETF现阶段值不值得我投'
]);
addKnown('strong_arbitration','investment_price_trend',[
  '这只基金未来两周还会不会继续跌','这只股票接下来价格会往上走吗'
]);
addKnown('strong_arbitration','income_salary',[
  '今年我的固定工资会不会上调','下一次调薪月薪能不能增加'
]);
addKnown('strong_arbitration','income_bonus',[
  '今年的绩效奖金能不能发下来','这次项目奖励金会不会到账'
]);
addKnown('strong_arbitration','receive_item',[
  '我买的显示器这个周末能不能收到','已经寄出的相机明天能不能到手','这个键盘包裹周五前能不能送达'
]);
addKnown('strong_arbitration','item_purchase',[
  '这台投影仪现在值不值得买','我现在要不要买这副耳机','这款扫地机器人现在买合不合适'
]);
addKnown('strong_arbitration','relationship_development',[
  '我和这个女生能不能正式在一起','这段暧昧会不会发展成恋爱'
]);
addKnown('strong_arbitration','marriage_match',[
  '我和他最后能不能结婚','这门亲事今年能不能成'
]);
addKnown('strong_arbitration','marital_relationship',[
  '我和丈夫最近夫妻关系能不能缓和','这段婚姻接下来还能不能继续'
]);

// 44 support-arbitration rows. Missing current-target evidence is intentional and must stay support, not be promoted to strong.
addKnown('support_arbitration','financial_fortune',[
  '最近整体财务让我有点在意，想占一下','这阵子现金流起伏明显，我想看看这一块','今年的收支状态我一直放在心上，想问问','最近手头资金松紧变化挺大，想占这件事','这一阶段总体进账不太稳定，我想看看','最近钱财方面波动不少，想单独占一下','这几个月整体资金流变化明显，想问这一项','目前财务状况有些反复，我想看看这个问题'
]);
addKnown('support_arbitration','business_operation',[
  '我的店最近利润起伏很大，想占一下经营这件事','工作室这阵子经营状况不太稳定，我想问问','这家门店目前经营状况反复，我想占这一块','我做的生意最近一直在亏损和回升之间波动','这个摊位现在经营状况让我很在意，想看看','网店最近业绩变化很大，我想问经营本身','餐馆目前利润不稳定，我想单独占这件事','公司这项业务最近现金流反复，我想看看'
]);
addKnown('support_arbitration','investment_profit',[
  '我主要在意这笔投资的收益波动，想占一下','这只基金现在有收益变化，我想看看这件事','这项投资目前利润起伏很大，我想问这一块','我投的投资项目最近收益反复，想单独占这件事','手里的基金目前有些利润波动，我想看看','这笔投资最近回本情况反复，我想问问','这个投资标的目前收益变化让我很在意'
]);
addKnown('support_arbitration','investment_liquidation',[
  '我已经决定把这只基金全部赎回，想占这一件事','手里的股票准备一次性清仓，我想看看这件事','这笔投资正在安排全部变现，我想单独占一下','我准备退出投资，想问问这个动作本身','这只ETF已经计划全部卖出，我想看看','基金仓位准备清掉，我想占一下这一步','这笔持仓已经决定平仓，我想问这件事'
]);
addKnown('support_arbitration','investment_position_decision',[
  '我正在考虑这只股票继续持有，想占一下','手里的基金准备调整仓位，我想看看这件事','这只ETF我在犹豫要不要减仓，想问一下','目前股票持仓正在考虑加仓，我想单独占这一步','我对这笔基金仓位调整一直拿不定主意','这只股票继续拿还是减仓这件事我想占一下','当前ETF持仓要不要调整，我一直在考虑'
]);
addKnown('support_arbitration','investment_price_trend',[
  '这只基金最近净值波动很大，我想问涨跌这件事','这只股票最近价格变化明显，我想单独占一下','这个ETF近来涨跌反复，我想看看这一块','我关注的基金最近净值起伏很大，想占一下','这只个股最近价格波动让我很在意','这个投资标的近来的涨跌变化很明显，我想问问','这只债券基金最近净值变化频繁，我想看看'
]);

// 44 fallback-head rows: two per route. Wording intentionally avoids current Evidence v0.1 anchors where possible.
addKnown('fallback_head','financial_fortune',['今年荷包能不能比前阵子松快些','往后几个月我手上会不会更有余钱']);
addKnown('fallback_head','business_operation',['我这个小铺子往后做得下去吗','自己这个小买卖以后能不能撑起来']);
addKnown('fallback_head','commercial_transaction',['这笔买卖最后能不能谈拢','和对方这一单最后能不能敲定']);
addKnown('fallback_head','inventory_purchase',['给仓里添的货能不能按计划备齐','店里下一轮添货会不会顺当']);
addKnown('fallback_head','inventory_sale',['压着的那批东西能不能慢慢出掉','仓里剩下的旧货以后能不能清出去']);
addKnown('fallback_head','borrow_money',['这阵子缺一笔周转款，能不能先拿到外部资金','最近有没有人愿意先给我一笔钱周转']);
addKnown('fallback_head','lend_money',['把这笔周转款先给朋友用合不合适','朋友缺钱，我把这笔款先给他用会怎样']);
addKnown('fallback_head','debt_collection',['那笔别人该给我的款还能回来吗','拖了很久的那笔钱最后还能回到我手上吗']);
addKnown('fallback_head','debt_repayment',['信用卡那一笔今年能彻底处理掉吗','身上这笔欠账年底前能不能彻底了结']);
addKnown('fallback_head','partnership',['跟朋友两个人搭着做店以后行不行','我和他一起把这个项目做下去合不合适']);
addKnown('fallback_head','investment_profit',['买了这个指数产品以后最后能不能挣钱','放进去的这笔理财最后能不能赚到']);
addKnown('fallback_head','investment_liquidation',['准备把这个理财产品全退出来会不会顺','手上这份理财我想全部退出来能成吗']);
addKnown('fallback_head','investment_suitability',['这个理财产品我现在进去合适不','眼下把钱放进这个理财合不合适']);
addKnown('fallback_head','investment_position_decision',['手里的票继续拿还是少拿一点','现在这份仓该留着还是收一点回来']);
addKnown('fallback_head','investment_price_trend',['这个票往后一阵还会往上吗','这份理财的价格过阵子会不会往下']);
addKnown('fallback_head','income_salary',['明年底薪有没有机会往上调','我每个月固定拿的那部分以后会增加吗']);
addKnown('fallback_head','income_bonus',['年底那笔绩效钱能不能发下来','项目做完以后那笔奖励钱能不能拿到']);
addKnown('fallback_head','receive_item',['我订的主机啥时候能到','前两天买的桌子大概几时能送来']);
addKnown('fallback_head','item_purchase',['这台主机现在要不要入','这个咖啡磨豆机值不值现在入手']);
addKnown('fallback_head','relationship_development',['我和这个人能不能更进一步成为一对','我们俩以后有没有可能变成一对']);
addKnown('fallback_head','marriage_match',['我和他最后有没有可能办婚礼','我们这段关系最后能不能定下来成家']);
addKnown('fallback_head','marital_relationship',['我跟另一半这阵子的关系能缓和吗','成家以后我们俩一直闹别扭还能好起来吗']);

addNonRoute('outside_current_22',[
  '明天坐高铁去大阪这趟行程顺不顺','下周的资格考试我能不能通过','这次求职面谈最后能不能被录用','丢在公园的钥匙还能不能找回来','这场民事诉讼最后结果对我有利吗','孩子转学以后能不能适应新学校',
  '下个月搬家过程会不会顺利','这次签证续签能不能批准','周末参加比赛有没有机会进前三','我的护照补办能不能按时完成','明天去登山一路会不会平安','这次论文答辩最后能不能过',
  '新部门的试用期我能不能顺利留下','遗失的工作证还有机会找回来吗','这次劳动仲裁最终会不会胜诉','孩子参加的比赛能不能拿到名次','下周出国的航班会不会按计划出发','这次学校申请最后能不能被录取',
  '准备换专业这一步以后顺不顺','明天去见领导汇报会不会顺利','这次驾照路考能不能一次过','搬到新城市以后生活能不能安顿好'
]);
addNonRoute('route_unresolved',[
  '这件事最后到底会变成什么样','我现在这样做到底对不对','接下来是不是还会有变化','眼前这个局面到底该怎么处理','对方之后究竟会是什么态度','我最近这个状态还要持续多久',
  '这件事情最后还有没有希望','下一步到底往哪里走比较好','现在是不是应该继续等下去','这次最后到底有没有结果','以后整体会不会慢慢好起来','这个机会我到底该不该抓',
  '我现在主动一点还是继续等','对方接下来会不会改变想法','这件事一直拖着最后会怎样','我目前这个决定是不是合适','未来一段时间会不会顺一点','最终结果还会不会再变化',
  '我是不是应该继续坚持下去','事情还要多久才能真正明朗','现在走的这条路还能继续吗','眼前这个选择以后会带来什么'
]);
addNonRoute('near_domain_not_current_route',[
  '这份供应商报价里的价格合理吗','公司最近为什么一直压缩预算','基金经理这季度的管理表现靠谱吗','这个股票软件的数据准不准','快递公司的配送服务最近稳定吗','这款电脑的售后政策值不值得信',
  '银行这次调整利率会影响多少','这份工资单的扣税数字算对了吗','公司的奖金制度设计公平吗','店门口最近客流为什么下降','客户迟迟不回邮件是什么原因','库存盘点流程应该怎么优化',
  '这个商业合同的违约条款有没有问题','理财平台收的管理费是不是太高','供应商最近交货慢是什么原因','伴侣最近总加班是不是工作压力大','朋友介绍的这个人性格靠不靠谱','同事之间最近为什么总起冲突',
  '公司新的绩效制度会不会影响团队氛围','这家店选的位置交通方便吗','这个项目排期为什么一直延期','贷款合同里的手续费是怎么算的'
]);

const counts = rows.reduce((acc,row) => {
  const key = row.expectedDisposition === 'route_known' ? row.expectedCandidatePath : row.nonRouteSubtype;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});
if (rows.length !== 198 || counts.strong_arbitration !== 44 || counts.support_arbitration !== 44 || counts.fallback_head !== 44 || counts.outside_current_22 !== 22 || counts.route_unresolved !== 22 || counts.near_domain_not_current_route !== 22) {
  throw new Error(`v0.13 development count mismatch: total=${rows.length} ${JSON.stringify(counts)}`);
}
const artifact = {
  version:'0.13-development-v0.1',
  status:'sealed_development_eval',
  sealed:true,
  scope:'liuyao_semantic_decision_stack_v0.13',
  purpose:'Fresh path-balanced development evaluation. May diagnose/tune v0.13 development but must never be represented as blind generalization.',
  policy:{
    useForCurrentRouteabilityTraining:false,
    useForCurrentRouteabilityCalibration:false,
    reuseAsFutureSealedBlind:false,
    priorV011V012BlindExcluded:true,
    traditionalLiuYaoFieldsForbidden:true,
    healthDiseasePolicySamplesExcluded:true
  },
  counts:{ total:198, route_known:132, non_route:66, ...counts },
  rows
};
fs.writeFileSync(out, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log(`Generated ${path.relative(root,out)} with 198 fresh rows.`);
