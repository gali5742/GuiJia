import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'data/liuyao-semantic-decision-stack-v0.13-independent-eval.json');
const candidateLock = JSON.parse(fs.readFileSync(path.join(root, 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.1.lock.json'), 'utf8'));
if (candidateLock.status !== 'locked') throw new Error('candidate must be locked before independent eval generation');
const rows = [];
let index = 1;
const addKnown = (candidatePath, routeId, texts) => texts.forEach((text) => rows.push({ id:`V013-I-${String(index++).padStart(3,'0')}`, text, expectedDisposition:'route_known', expectedRoute:routeId, expectedCandidatePath:candidatePath }));
const addNonRoute = (subtype, texts) => texts.forEach((text) => rows.push({ id:`V013-I-${String(index++).padStart(3,'0')}`, text, expectedDisposition:'non_route', expectedRoute:null, expectedCandidatePath:null, nonRouteSubtype:subtype }));

// 44 strong-arbitration rows, created after the candidate lock.
addKnown('strong_arbitration','commercial_transaction',[
  '这笔经销订单这周能不能正式成交','和客户谈的这份采购合同明天能不能签成','这单批发生意月底前能不能敲定'
]);
addKnown('strong_arbitration','inventory_purchase',[
  '门店新一轮补货节前能不能全部入仓','给网店采购的这批库存周末前能不能到齐'
]);
addKnown('strong_arbitration','inventory_sale',[
  '仓库里这批积压货下个月能不能清完','门店剩下的旧库存年底前能不能卖掉'
]);
addKnown('strong_arbitration','borrow_money',[
  '我向姐姐借的这笔应急钱今天能不能拿到','这份信用贷申请本周能不能获批','我找熟人借周转款这次能不能借到'
]);
addKnown('strong_arbitration','lend_money',[
  '表哥向我借一笔钱，我现在借给他合适吗','朋友找我借周转金，我要不要把钱借出去'
]);
addKnown('strong_arbitration','debt_collection',[
  '对方欠我的货款月底前能不能追回来','借给朋友的那笔款这周能不能要回','拖欠我的应收款年前能不能收回'
]);
addKnown('strong_arbitration','debt_repayment',[
  '我自己的消费贷今年能不能全部还完','这张信用卡剩下的欠款下月能不能结清'
]);
addKnown('strong_arbitration','partnership',[
  '我和同事合伙开工作室以后能不能顺利做下去','跟这个合伙人共同经营门店是否合适'
]);
addKnown('strong_arbitration','investment_profit',[
  '这只债券基金持有到年底能不能有收益','这个投资项目半年后会不会盈利'
]);
addKnown('strong_arbitration','investment_liquidation',[
  '这笔基金投资全部赎回能不能顺利到账','我现在把ETF仓位一次性清仓会不会受阻'
]);
addKnown('strong_arbitration','investment_suitability',[
  '这只指数基金现在适不适合我投资','眼下参与这个投资项目值不值得'
]);
addKnown('strong_arbitration','investment_price_trend',[
  '这只科技股接下来十天还会不会上涨','这个ETF未来一周价格会不会回落'
]);
addKnown('strong_arbitration','income_salary',[
  '明年我的基本工资能不能提高','这轮调薪我的月薪会不会上涨'
]);
addKnown('strong_arbitration','income_bonus',[
  '这次季度奖金我能不能拿到','今年年终奖金会不会顺利发下来'
]);
addKnown('strong_arbitration','receive_item',[
  '我买的路由器明天能不能收到','已经寄出的镜头周六能不能送到','这个显示器包裹月底前能不能到手'
]);
addKnown('strong_arbitration','item_purchase',[
  '这台空气净化器现在要不要买','这款机械键盘值不值得入手'
]);
addKnown('strong_arbitration','relationship_development',[
  '我和这个男生能不能从暧昧变成恋爱','我们有没有机会正式确定关系'
]);
addKnown('strong_arbitration','marriage_match',[
  '我和她最后能不能领证结婚','这桩婚事明年有没有机会成'
]);
addKnown('strong_arbitration','marital_relationship',[
  '我和老婆最近的夫妻关系能不能改善','我跟老公这段婚姻以后还能不能维持'
]);

// 44 support-arbitration rows. They deliberately expose a route topic without a decisive current target.
addKnown('support_arbitration','financial_fortune',[
  '最近总体收支有些反复，我想专门问一下','这一阵整体现金流忽松忽紧，我想占这一块','今年资金进出变化不少，我想看看财务这方面','最近手头宽裕和吃紧来回变化，我想问问','这几个月整体进账不稳定，我想单独占一下','近期钱财上的起伏让我比较在意，想看看'
]);
addKnown('support_arbitration','business_operation',[
  '我的小餐馆最近利润忽高忽低，想问经营本身','这家网店近期业绩反复，我想占一下这门生意','工作室目前现金流不太稳定，我想看看经营这块','门店最近亏损和回升交替，我想单独问一下','这间咖啡店目前经营状况变化很大，想占一下','公司这项业务最近利润起伏明显，我想看看'
]);
addKnown('support_arbitration','commercial_transaction',[
  '客户这份商业订单还在沟通中，我想占一下','这笔采购交易目前正在谈，我想看看这件事','供应商合同还在修改，我想单独问这一单','买家这份订单现在还没有定，我想占一下','这单批发生意目前还在磋商，我想看看'
]);
addKnown('support_arbitration','investment_profit',[
  '这只ETF最近收益变化挺大，我想单独占一下','这笔投资目前利润起伏明显，我想看看','手里的指数基金近期收益反复，我想问问','这个投资项目最近回本情况不稳定，我想占一下'
]);
addKnown('support_arbitration','investment_liquidation',[
  '这只ETF已经安排全部卖出，我想占一下这一步','基金持仓准备整体赎回，我想看看这个动作','股票仓位已经决定清掉，我想单独问一下退出这件事'
]);
addKnown('support_arbitration','investment_position_decision',[
  '这只基金我在考虑加仓，想占一下这个调整','手里的股票正在犹豫要不要减仓，我想看看','ETF仓位要不要动一动这件事我一直拿不准','当前基金持仓准备重新调整，我想单独占一下'
]);
addKnown('support_arbitration','investment_price_trend',[
  '这只股票最近价格波动频繁，我想看看涨跌这块','基金近来净值起伏很大，我想占一下','这个ETF最近涨跌来回反复，我想单独问问','债券基金近期净值变化明显，我想看看'
]);
addKnown('support_arbitration','income_salary',[
  '最近固定薪资这一项我一直很关注，想占一下','目前月薪这块让我有点在意，我想单独看看','公司现在的基本工资安排我想问一下'
]);
addKnown('support_arbitration','income_bonus',[
  '最近绩效奖金这件事我一直放在心上，想看看','部门季度奖励这一块我想专门占一下','今年项目奖励金目前还没消息，我想问问'
]);

// 44 fallback-head rows: two per supported route, avoiding current Evidence v0.2 arbitration anchors.
addKnown('fallback_head','financial_fortune',['往后半年经济上会不会比现在宽松些','这一年我能不能比以前更攒得住钱']);
addKnown('fallback_head','business_operation',['这个铺子以后还有没有继续做的空间','自己手上这份小生计往后能不能稳住']);
addKnown('fallback_head','commercial_transaction',['跟对方这桩买卖最后能不能谈拢','手上这一单最后到底有没有下文']);
addKnown('fallback_head','inventory_purchase',['店里要添的下一批东西能不能及时备齐','仓里准备补的那批货能不能如期齐全']);
addKnown('fallback_head','inventory_sale',['仓里压着的旧东西以后能不能慢慢走掉','剩下这批货能不能逐步腾出去']);
addKnown('fallback_head','borrow_money',['眼下能不能先弄到一笔钱应急周转','最近有没有办法先筹来一笔临时用的钱']);
addKnown('fallback_head','lend_money',['朋友手头紧，我先把一笔钱给他用合适吗','把这笔钱暂时给同事周转会不会有后患']);
addKnown('fallback_head','debt_collection',['别人拖着没给我的那笔钱还能回来吗','早前该回到我手里的那笔款最后还有没有着落']);
addKnown('fallback_head','debt_repayment',['身上这笔欠账今年能不能彻底处理掉','我背着的那笔债以后能不能完全了结']);
addKnown('fallback_head','partnership',['跟朋友两个人一起把店做下去合不合适','我和他搭着做这个项目以后行不行']);
addKnown('fallback_head','investment_profit',['把钱放进这个指数产品以后有没有赚头','这份理财放一段时间最后能不能有进项']);
addKnown('fallback_head','investment_liquidation',['手上这份理财全退出来能不能顺当','这个理财产品我全部退掉会不会卡']);
addKnown('fallback_head','investment_suitability',['眼下把钱放进这份理财适不适宜','这个理财产品现在进去妥不妥']);
addKnown('fallback_head','investment_position_decision',['手里的票现在多拿一些还是少拿一些','这份仓接下来留着还是收一点回来']);
addKnown('fallback_head','investment_price_trend',['这个票过阵子还会往上走不','这份理财的价后面会不会往下']);
addKnown('fallback_head','income_salary',['以后每个月固定到手的那部分会不会更多','明年每月稳定拿的那份钱会不会增加']);
addKnown('fallback_head','income_bonus',['年底额外那笔钱今年还能不能有','项目结束以后那份额外奖励最后能不能拿到']);
addKnown('fallback_head','receive_item',['我订的书桌大概哪天送来','前几天买的椅子什么时候能到家']);
addKnown('fallback_head','item_purchase',['这台磨豆机眼下入不入','这个小烤箱现在要不要入']);
addKnown('fallback_head','relationship_development',['我和这个人以后有没有可能变成一对','我们两个之后还能不能走得更近']);
addKnown('fallback_head','marriage_match',['我俩以后有没有可能真正成家','我们这段关系最后能不能定下来过日子']);
addKnown('fallback_head','marital_relationship',['我和另一半最近一直闹别扭以后还能好起来吗','成家后我们俩关系僵着以后能不能缓过来']);

addNonRoute('outside_current_22',[
  '下周去札幌出差整个行程会不会顺利','这次专业资格考试我能不能合格','下一轮公司面试最后能不能拿到offer','落在出租车上的钱包还能不能找回来','这场房屋纠纷诉讼结果会不会对我有利','孩子参加转学考试能不能通过','这次永住申请有没有机会获批','补办的驾照能不能在月底前寄到','周末的马拉松比赛我能不能跑进目标成绩','下个月搬办公室会不会顺利完成','明天向客户做提案能不能得到认可','这次研究生复试最后能不能录取','在留卡更新会不会按期完成','申请这套出租屋房东会不会同意','部门内部竞聘我能不能升到主管','这次论文答辩能不能顺利通过','丢在商场的证件还有没有机会找到','下周的航班会不会因为台风取消','学校的奖学金申请能不能通过','这个施工项目能不能在工期内结束','新岗位试用期结束能不能转正','这次驾校考试我有没有机会一次过'
]);
addNonRoute('route_unresolved',[
  '眼下这个局面最后会走向哪里','我现在这样处理到底妥不妥','接下来这件事还会不会发生变化','卡在这个阶段我到底应该怎么选','对方之后会用什么态度面对我','这种状态大概要维持到什么时候','这件事情是不是还有别的转机','下一步我往哪个方向走更合适','我现在还值不值得继续等','这回最后会不会有一个结果','以后这一阵会不会慢慢轻松些','眼前这个机会我到底要不要接住','我现在主动一点还是保持不动','对方之后会不会重新考虑','这件事继续拖着最后会变成怎样','我现在做这个决定是不是太早','往后几个月整体会不会顺一些','最后的结果还有没有改变可能','我是不是还应该继续坚持','事情什么时候才会真正清楚起来','目前这条路还有没有继续的意义','这个选择最终会把事情带向哪里'
]);
addNonRoute('near_domain_not_current_route',[
  '这张薪资明细里的个税金额算得对吗','工资条上的社保扣款为什么比上月多','公司的绩效奖金制度对新人公平不公平','部门奖励方案为什么偏向业务岗','这份批发合同里的违约责任是不是太重','采购协议中的赔偿条款有没有法律风险','这个基金经理最近管理水平怎么样','股票软件里的实时行情为什么总有延迟','理财平台收的托管费是怎么计算的','券商APP的持仓报表怎么看','这个供应商最近交货慢是什么原因','客户一直不回复报价邮件该怎么跟进','店铺门口的人流量应该怎么统计','仓库盘点流程怎么调整效率更高','门店商品的零售价应该怎么定','这家快递公司的售后客服靠谱吗','这台路由器的保修范围有哪些','网购的相机应该怎么申请退货','我和同事最近为什么总沟通不顺','跟室友分摊房租怎样才公平','朋友突然不回消息可能是什么原因','公司新的考勤制度会不会影响团队氛围'
]);

const counts = rows.reduce((acc,row) => { const key = row.expectedDisposition === 'route_known' ? row.expectedCandidatePath : row.nonRouteSubtype; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
if (rows.length !== 198 || counts.strong_arbitration !== 44 || counts.support_arbitration !== 44 || counts.fallback_head !== 44 || counts.outside_current_22 !== 22 || counts.route_unresolved !== 22 || counts.near_domain_not_current_route !== 22) throw new Error(`independent eval count mismatch: total=${rows.length} ${JSON.stringify(counts)}`);
const artifact = {
  version:'0.13-independent-eval-v0.1',
  status:'presealed_independent_eval',
  sealed:false,
  scope:'liuyao_semantic_decision_stack_v0.13',
  createdAfterCandidateLock:true,
  candidate:{ lockPath:'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.1.lock.json', candidateSha256:candidateLock.candidateSha256 },
  purpose:'Fresh post-lock independent evaluation. It may evaluate the locked candidate but may not train or calibrate it and may not be reused as a future blind corpus.',
  policy:{ useForTraining:false, useForCalibration:false, modifyLockedCandidateFromThisEval:false, reuseAsFutureBlind:false, healthDiseaseSamplesExcluded:true, traditionalLiuYaoFieldsForbidden:true },
  counts:{ total:198, route_known:132, non_route:66, ...counts },
  rows
};
fs.writeFileSync(out, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log(`Generated post-lock independent eval with ${rows.length} rows for candidate ${candidateLock.candidateSha256}.`);
