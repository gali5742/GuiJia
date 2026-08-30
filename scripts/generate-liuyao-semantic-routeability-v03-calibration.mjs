import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'data/liuyao-semantic-routeability-v0.3-calibration.json');
const rows = [];
let index = 1;
const addKnown = (pathId, routeId, texts) => texts.forEach((text) => rows.push({ id:`R03-C-${String(index++).padStart(3,'0')}`, text, routeabilityLabel:'route_known', candidatePath:pathId, routeId }));
const addNonRoute = (subtype, texts) => texts.forEach((text) => rows.push({ id:`R03-C-${String(index++).padStart(3,'0')}`, text, routeabilityLabel:'non_route', subtype }));

// 44 support rows. These intentionally carry partial route evidence without a strong current target.
addKnown('support_arbitration','financial_fortune',[
  '这阵子总体资金松紧变化挺明显，我想单独看看这一块','最近整体进账忽高忽低，我想占一下这方面','这几个月现金流总有波动，我想问问这一项','目前手头资金时松时紧，我想看这一块','今年整体收支变化很明显，我想单独问一下'
]);
addKnown('support_arbitration','business_operation',[
  '我的咖啡店最近利润反复，我想占一下经营本身','网店这阵子业绩起伏大，我想看看这门生意','工作室最近现金流不稳，我想问经营这一块','门店这几个月亏损和回升来回波动，我想占一下','这个摊位近期经营状况变化很大，我想看看'
]);
addKnown('support_arbitration','commercial_transaction',[
  '这笔商业交易目前还在推进，我想占一下这件事','客户这份订单现在还在沟通，我想看看这一块','这份采购合同目前还在讨论，我想问问这件事','买家那份订单现在还在往返修改，我想占一下','供应商这份合同目前还没定，我想看这件事'
]);
addKnown('support_arbitration','investment_profit',[
  '这只基金最近收益起伏很明显，我想单独看看','这项投资目前利润波动比较大，我想问问','手上的ETF最近收益反复，我想占一下这件事','这个投资项目这阵子回本情况有变化，我想看看','我持有的债券基金近期收益不稳定，想单独问一下'
]);
addKnown('support_arbitration','investment_liquidation',[
  '这只基金我已经安排全部赎回，想占一下这个动作','股票仓位准备一次性清仓，我想单独看看这一步','这笔投资已经决定全部变现，想问问退出这件事','手上的ETF准备全部卖出，我想占一下','基金持仓已经安排平仓，我想看看这个动作'
]);
addKnown('support_arbitration','investment_position_decision',[
  '这只基金我正在考虑减仓，想占一下这一步','手上的股票仓位准备调整，我想看看','这个ETF持仓最近在考虑加仓，我想问问','基金仓位要不要调整这件事我一直拿不准','这只股票继续持有还是减仓，我想单独占一下'
]);
addKnown('support_arbitration','investment_price_trend',[
  '这只ETF最近价格涨跌反复，我想占一下这一块','基金最近净值波动很明显，我想单独看看','这只股票近来涨跌幅度很大，我想问问','债券基金最近价格变化频繁，我想占一下','这个投资标的近期净值起伏明显，我想看看'
]);
addKnown('support_arbitration','income_salary',[
  '我最近一直在关注固定工资这一块，想占一下','这段时间月薪情况让我有点在意，想看看','公司现在的薪资安排我比较关注，想问问','目前基本工资这一项我想单独占一下','最近薪水这件事我一直放在心上，想看看'
]);
addKnown('support_arbitration','income_bonus',[
  '今年年终奖这件事我一直在关注，想占一下','最近绩效奖金这一块让我很在意，想看看','项目奖励金目前还没消息，我想单独问一下','季度奖励这件事我想占一下'
]);

// 44 fallback rows: two per route; current Evidence v0.2 must not generate Arbitration.
addKnown('fallback_head','financial_fortune',['往后这阵子手头会不会比现在松一点','今年我能留在手里的余钱会不会多些']);
addKnown('fallback_head','business_operation',['这个铺面以后还有没有做头','手上这份小生计往后能不能继续']);
addKnown('fallback_head','commercial_transaction',['这桩买卖最后有没有戏','跟对方那一单最后有没有结果']);
addKnown('fallback_head','inventory_purchase',['店里下一批货能不能备够','仓里要添的东西能不能如期齐全']);
addKnown('fallback_head','inventory_sale',['压在仓里的旧货能不能慢慢走掉','剩下那批货以后能不能逐步腾空']);
addKnown('fallback_head','borrow_money',['这阵子能不能弄到一笔周转用的钱','眼下有没有办法先筹到一笔应急款']);
addKnown('fallback_head','lend_money',['手头这笔钱给朋友周转用合适不','朋友缺一笔钱，我先给他用会不会有麻烦']);
addKnown('fallback_head','debt_collection',['别人拖着我的那笔钱还能回到我手里吗','之前该给我的那笔款最后还能回来不']);
addKnown('fallback_head','debt_repayment',['身上那笔债年底前能不能处理干净','我背着的那笔欠账以后能不能彻底了结']);
addKnown('fallback_head','partnership',['跟朋友搭伙做项目以后行不行','我和他两个人一起做这件事合适吗']);
addKnown('fallback_head','investment_profit',['把钱放进这个指数产品半年后能不能有赚头','放进去的这份理财以后能不能有进项']);
addKnown('fallback_head','investment_liquidation',['手上这个理财我想全退出来会不会顺','这份理财全部退出以后能不能很快收回来']);
addKnown('fallback_head','investment_suitability',['眼下把钱放进这个理财产品合适不','这个理财我现在进去是不是合适']);
addKnown('fallback_head','investment_position_decision',['手里的票继续拿还是少拿一些好','现在这份仓留着还是收一点回来更合适']);
addKnown('fallback_head','investment_price_trend',['这个票接下来还会往上走吗','这份理财的价过一阵会不会往下']);
addKnown('fallback_head','income_salary',['明年每月固定拿的那份钱会不会更多','以后每个月稳定拿到手的那部分会增加吗']);
addKnown('fallback_head','income_bonus',['年底那笔额外的钱今年还能不能拿到','项目结束后那份额外奖励最终会不会有']);
addKnown('fallback_head','receive_item',['我订的桌椅什么时候能送来','前几天买的柜子大概哪天能到家']);
addKnown('fallback_head','item_purchase',['这个咖啡机现在入不入','这台小烤箱眼下要不要入']);
addKnown('fallback_head','relationship_development',['我和这个人以后能不能变成一对','我们两个以后还有没有可能更进一步']);
addKnown('fallback_head','marriage_match',['我俩最后有没有可能成家','我们这段关系以后能不能真正定下来']);
addKnown('fallback_head','marital_relationship',['我跟另一半最近闹得厉害以后还能和好吗','成家后我们俩一直别扭以后能不能缓下来']);

addNonRoute('outside_current_22',[
  '明早坐飞机去福冈这趟行程会不会顺','下个月的资格认证考试能不能通过','这次公司面谈我最后会不会被录取','遗失在车站的雨伞还能不能找回来','这场合同纠纷官司最后对我有没有利','孩子换到新班级以后适应得快不快','这次在留更新能不能如期批准','补办的护照月底前能不能拿到','下周驾照路考我有没有机会一次通过','这场业余比赛我能不能进前八','明天给客户做汇报会不会顺利','研究生申请最后能不能拿到录取','下月搬去横滨整个过程会不会顺','这趟国际航班会不会临时取消','酒店抽签预订这次能不能成功','今年工作上有没有机会升职','新公司给我的岗位能不能顺利入职','这套租房申请房东会不会同意','学校转专业申请最后能不能批准','论文口试这次能不能顺利过关','职业资格续期能不能按时办完','长期居留申请这次有没有机会批','演唱会门票抽选这次能不能中','跑出去的猫还能不能自己回来','周末去箱根这趟旅行会不会顺','明天下午会不会突然下大雨','和邻居的噪音纠纷最后能不能解决','这次劳动争议仲裁结果会不会有利','工作项目能不能在截止日前完成','部门调整以后我会不会被调岗','这个学习计划坚持半年能不能完成','下次日语能力考试我能不能合格','申请这套公寓最后能不能通过审核','停车许可这周能不能办下来','这笔保险理赔最后会不会批准','送修的汽车能不能按期修好','家里的翻修工程会不会延期','配偶签证的材料这次能不能过审','校内比赛我有没有机会拿奖','搬到关西以后能不能很快安顿下来','这份工作合同到期后能不能续签','大学转学申请会不会被接受','丢掉的门禁卡还能不能找到','明天去参加公开课会不会有收获','这个证件申请什么时候能出结果'
]);

addNonRoute('route_unresolved',[
  '眼前这件事最后会走到哪一步','我现在这么处理是不是弄错了','之后的局面还会不会继续变化','现在卡在这里到底应该怎么办','对方下一步究竟会怎么反应','这种状态还要维持多长时间','这件事情是不是还留有余地','接下来往哪个方向走比较妥当','我现在到底还应不应该等','这回最后到底有没有下文','以后是不是会逐渐轻松一点','面前这个机会究竟要不要抓','我此刻主动一些还是先不动','对方后面会不会换一种态度','这件事继续拖下去会变成什么样','我现在做出的决定到底妥不妥','接下来这一阵总体会不会顺一些','最后的结局还有没有可能改变','我是不是还应该再坚持一段','什么时候事情才会真正清楚','当前这条路还有没有必要继续','这个选择以后会把我带到哪里','我现在是不是该换一种做法','接下来还有没有别的可能','对方最终到底想怎样','这件事情是不是已经没机会了','我继续这样做会不会越来越难','现在这个节点应该进还是退','以后会不会出现新的变化','我该不该把这件事先放下','现在看到的结果会不会只是暂时的','我还要不要继续投入精力','这一步做下去到底值不值','接下来几个月整体会朝哪边变化','这件事最后能不能有个说法','我现在最应该先做什么','这个局面是不是还能扭转','对方后面会不会主动一点','我是不是应该及时停下来','以后事情会不会变得明朗','这个决定最后会带来好结果吗','我现在继续等是不是浪费时间','下一阶段到底会发生什么','这件事还有没有继续推进的必要','我现在的判断是不是偏了'
]);

addNonRoute('near_domain_not_current_route',[
  '这张工资条里的个税扣得对不对','月薪明细中的社保金额是不是算错了','公司工资单上的扣款项目合理吗','这份薪资明细应该怎么核对','工资条里的补贴分类是不是填错了',
  '公司的年终奖制度对新人公平吗','绩效奖金方案这样设计合理不合理','部门奖励规则是不是偏向销售岗','季度奖金的分配制度要不要调整','项目奖励政策为什么今年改了',
  '这份采购协议的违约责任写得有没有问题','商业合同里的免责条款是否合理','供应协议中的赔偿条款风险大不大','这份订单合同的法律责任应该怎么理解','经销合同里的手续费条款是不是太高',
  '这个基金经理最近的管理能力怎么样','炒股软件里的行情数据准不准','理财平台收取的服务费是不是太贵','券商APP最近为什么总是卡顿','基金报告里的风险等级怎么看','投资账户的双重验证要不要开启','这个交易平台的数据延迟严重吗','基金托管费这一项是怎么计算的','券商客服最近处理问题快不快','投资软件里的持仓报表怎么看',
  '这个供应商最近的信誉到底怎么样','客户一直不回报价邮件是什么原因','店铺选在这个路口客流够不够','仓库盘点流程怎样改更省事','这款商品应该怎么定零售价','门店用哪套记账软件更方便','收银系统最近总出错该怎么排查','网店宣传页面应该怎样调整','店里现在缺人应该怎么排班','商铺续租条款里有哪些注意点',
  '这家快递公司的客服最近靠谱吗','这台显示器的保修范围包括哪些','耳机坏了一边应该怎么送修','这款相机的参数够不够日常使用','网购商品的退货期限怎么算',
  '我和同事最近沟通为什么总不顺','跟室友相处时应该怎么分配家务','我和姐姐最近总吵架是什么原因','父母之间最近沟通方式是不是有问题','朋友突然不回消息我该怎么理解'
]);

const counts = rows.reduce((acc,row) => {
  const key = row.routeabilityLabel === 'route_known' ? row.candidatePath : row.subtype;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});
if (rows.length !== 223 || counts.support_arbitration !== 44 || counts.fallback_head !== 44 || counts.outside_current_22 !== 45 || counts.route_unresolved !== 45 || counts.near_domain_not_current_route !== 45) {
  throw new Error(`Routeability v0.3 calibration count mismatch: total=${rows.length} ${JSON.stringify(counts)}`);
}
const artifact = {
  version:'0.3-calibration-v0.1',
  status:'fresh_calibration',
  scope:'liuyao_semantic_routeability_v03',
  purpose:'Fresh calibration for the v0.3 hybrid Routeability policy. Never training, development evaluation, or blind data.',
  policy:{ useForTraining:false, useAsDevelopmentEval:false, reuseAsBlind:false, prior198Excluded:true },
  counts:{ total:223, route_known:88, non_route:135, ...counts },
  rows
};
fs.writeFileSync(out, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log(`Generated ${path.relative(root,out)} with ${rows.length} rows.`);
