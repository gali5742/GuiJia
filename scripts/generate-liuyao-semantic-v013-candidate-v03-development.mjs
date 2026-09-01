import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = 'data/liuyao-semantic-v013-candidate-v03-development.json';
const modelLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-model.lock.json';
const modelLock = JSON.parse(fs.readFileSync(path.join(root, modelLockPath), 'utf8'));
if (modelLock.status !== 'locked' || !modelLock.artifactSha256) throw new Error('Fallback Identity v0.1 model must be frozen before v0.3 development data is created');

const rows = [];
let index = 1;
const nextId = () => `V013-V03-D-${String(index++).padStart(3, '0')}`;
const addKnown = (candidatePath, routeId, texts) => {
  for (const text of texts) rows.push({
    id:nextId(),
    text,
    expectedDisposition:'route_known',
    expectedRoute:routeId,
    expectedCandidatePath:candidatePath
  });
};
const addNonRoute = (subtype, texts) => {
  for (const text of texts) rows.push({
    id:nextId(),
    text,
    expectedDisposition:'non_route',
    expectedRoute:null,
    expectedCandidatePath:null,
    nonRouteSubtype:subtype
  });
};

// 44 strong-arbitration rows. Distribution intentionally mirrors the historically reliable strong-path surface.
addKnown('strong_arbitration', 'commercial_transaction', [
  '这笔供货买卖在月底以前能不能正式成交',
  '和这个客户谈的采购交易这周能不能最终签成'
]);
addKnown('strong_arbitration', 'inventory_purchase', [
  '门店下一批补货能不能在周三以前全部到仓',
  '仓库这轮进货月底前能不能按清单备齐'
]);
addKnown('strong_arbitration', 'inventory_sale', [
  '库房里这批积压货到月底能不能全部卖出去',
  '店里剩下的旧库存下个月能不能顺利出清'
]);
addKnown('strong_arbitration', 'borrow_money', [
  '我向银行申请这笔经营贷款这次能不能批下来',
  '我找朋友借五万元周转这周能不能借到',
  '这次向家里借的应急钱月底前能不能拿到'
]);
addKnown('strong_arbitration', 'lend_money', [
  '朋友来找我借两万元这次借给他合不合适',
  '同事想从我这里借一笔周转款我该不该借出去',
  '亲戚这次开口借钱我答应把钱借给他会怎样'
]);
addKnown('strong_arbitration', 'debt_collection', [
  '对方拖欠我的货款这个月能不能收回来',
  '去年借出去的那笔钱年底以前还能不能追回',
  '公司这笔应收尾款本周能不能催回来'
]);
addKnown('strong_arbitration', 'debt_repayment', [
  '我现在这笔车贷今年能不能按计划还清',
  '信用卡剩下的欠款下个月能不能全部结清',
  '这笔消费贷款年底前我能不能彻底还完'
]);
addKnown('strong_arbitration', 'partnership', [
  '我和朋友合伙经营这家店接下来能不能顺利做下去',
  '和这个搭档共同做工作室以后合作经营会不会顺'
]);
addKnown('strong_arbitration', 'investment_profit', [
  '这笔基金投资继续拿到年底能不能盈利',
  '我投进这个项目的钱三个月后会不会有利润'
]);
addKnown('strong_arbitration', 'investment_liquidation', [
  '这只基金月底前全部赎回变现能不能顺利完成',
  '我把现在的股票仓位全部清仓套现会不会卡住'
]);
addKnown('strong_arbitration', 'investment_suitability', [
  '这个债券基金现在适不适合我投入资金',
  '眼下参与这项投资对我来说合不合适'
]);
addKnown('strong_arbitration', 'investment_price_trend', [
  '这只股票接下来两周价格还会不会继续上涨',
  '这个基金下个月净值会不会继续往下走'
]);
addKnown('strong_arbitration', 'income_salary', [
  '今年我的固定月薪能不能再往上调整',
  '下次调薪我的基本工资会不会增加'
]);
addKnown('strong_arbitration', 'income_bonus', [
  '今年这笔年终奖金最后能不能正常发下来',
  '项目结束以后绩效奖励金能不能顺利到账'
]);
addKnown('strong_arbitration', 'receive_item', [
  '我下单的显示器周六以前能不能收到',
  '已经发货的相机明天下午能不能送到我手里',
  '这个电脑配件包裹周五之前能不能到货'
]);
addKnown('strong_arbitration', 'item_purchase', [
  '这台空气净化器现在值不值得买',
  '我今天要不要买这副降噪耳机',
  '这款投影机现在入手合不合适'
]);
addKnown('strong_arbitration', 'relationship_development', [
  '我和这个男生接下来能不能正式确定恋爱关系',
  '我们现在这段暧昧以后会不会发展成恋爱'
]);
addKnown('strong_arbitration', 'marriage_match', [
  '我和她最后能不能正式结婚',
  '我们两个人今年这门婚事能不能成'
]);
addKnown('strong_arbitration', 'marital_relationship', [
  '我和妻子最近的夫妻关系接下来能不能缓和',
  '我和丈夫这段婚姻以后还能不能继续维持'
]);

// 44 support-arbitration rows. These are topic-present but deliberately omit a fresh current-outcome target.
addKnown('support_arbitration', 'financial_fortune', [
  '最近总的收支波动比较明显，我想占一下财务这一块',
  '这一阵手头资金松紧变化很大，想单独看看钱财方面',
  '今年以来整体进账不太稳定，我想问问财务状况',
  '最近家里的现金流反复得厉害，想占一下这一项',
  '这几个月手里的余钱变化不少，我想看看整体财务',
  '目前钱上的起伏让我比较在意，想问一下这一块'
]);
addKnown('support_arbitration', 'business_operation', [
  '店里最近经营状态忽高忽低，我想占一下经营本身',
  '我的工作室这阵子业绩变化很大，想看看经营这一块',
  '这家小店最近现金流有些反复，我想单独问经营',
  '网店近来的生意状况不太稳定，我想占一下这件事',
  '餐馆这段时间经营起伏明显，想看看经营本身',
  '我手里的这门生意最近变化不少，想问问经营状况'
]);
addKnown('support_arbitration', 'commercial_transaction', [
  '和这个客户的这单买卖最近谈了好几轮，我想占一下这桩交易',
  '眼前这笔采购生意双方还在沟通，我想看看这笔交易本身',
  '这次供货买卖最近反复磋商，我想单独占一下这单生意',
  '客户这笔订单一直在谈条件，我想问问这桩买卖',
  '和对方正在谈的交易最近变化很多，我想占这一件事',
  '这笔商业买卖来回谈了几次，我想看看交易这一块'
]);
addKnown('support_arbitration', 'investment_profit', [
  '这笔投资最近收益上下波动，我想占一下收益这件事',
  '手里这个基金近来利润变化明显，我想看看收益这一块',
  '这个投资项目最近回报不太稳定，我想单独问收益',
  '我投的这份理财最近盈亏反复，想占一下收益本身',
  '当前这笔投资的回报变化让我在意，想看看这一项'
]);
addKnown('support_arbitration', 'investment_liquidation', [
  '我已经在安排把这份基金全部退出，想占一下退出这一步',
  '股票仓位准备整体退出来，我想看看清掉持仓这件事',
  '这笔投资已经决定全部变现，我想单独问退出动作',
  '我正在安排结束这份投资，想占一下全部退出这一项',
  '这份持仓准备整体收回来，我想看看变现这一步'
]);
addKnown('support_arbitration', 'investment_position_decision', [
  '我最近一直在考虑调整这只股票的仓位，想占一下这一步',
  '手里的基金仓位正在犹豫怎么处理，我想看看仓位调整',
  '这份ETF的持有比例我还没拿定主意，想问一下仓位这件事',
  '目前这只股票的仓位安排让我反复考虑，想单独占这一项',
  '我在考虑改变这笔基金的持仓比例，想看看仓位决定'
]);
addKnown('support_arbitration', 'investment_price_trend', [
  '这只股票最近价格波动得很厉害，我想占一下涨跌这一块',
  '手里基金近来净值起伏明显，想看看价格变化',
  '这个ETF最近涨跌反复，我想单独问行情这一项',
  '我关注的这只股票近来的价格变化很多，想占一下涨跌',
  '这份投资标的最近行情波动明显，我想看看价格走势'
]);
addKnown('support_arbitration', 'income_salary', [
  '最近固定工资这一块有些变化，我想单独占一下薪资',
  '这阵子月薪方面让我比较在意，想看看固定收入这件事',
  '公司最近在谈薪资安排，我想占一下自己的工资这一项'
]);
addKnown('support_arbitration', 'income_bonus', [
  '最近绩效奖金这一块有些变化，我想单独占一下奖金',
  '公司这阵子在谈年终奖励，我想看看自己的奖金这一项',
  '项目奖励金最近有些调整，我想占一下奖金这件事'
]);

// 44 pure-fallback rows: two fresh paraphrases per frozen current-22 route.
addKnown('fallback_head', 'financial_fortune', [
  '往后这阵子我手头会不会比现在宽松一点',
  '接下来几个月钱上能不能慢慢有些余量'
]);
addKnown('fallback_head', 'business_operation', [
  '自己这摊小营生以后还有没有继续做的空间',
  '我手里这个小铺子后面还能不能撑得起来'
]);
addKnown('fallback_head', 'commercial_transaction', [
  '眼前这桩买卖最后能不能说成',
  '跟对方谈的这一单最后有没有下文'
]);
addKnown('fallback_head', 'inventory_purchase', [
  '后仓下一轮要添的东西能不能如期凑全',
  '店里接下来缺的那些东西能不能顺利备上'
]);
addKnown('fallback_head', 'inventory_sale', [
  '仓里压着的那些东西后面能不能慢慢走掉',
  '店里剩下那批旧东西以后能不能腾出去'
]);
addKnown('fallback_head', 'borrow_money', [
  '手头这个缺口能不能有人先帮我垫过来',
  '眼下差的那笔钱有没有人能先给我周转'
]);
addKnown('fallback_head', 'lend_money', [
  '把这笔钱先给朋友周转一阵合不合适',
  '朋友现在缺一笔，我先把钱给他用会怎样'
]);
addKnown('fallback_head', 'debt_collection', [
  '别人一直没给我的那笔钱最后还能不能回来',
  '拖在外面的那一笔款以后还能不能回到我手上'
]);
addKnown('fallback_head', 'debt_repayment', [
  '身上这笔账到年底能不能彻底弄清',
  '现在压着我的那笔欠账以后能不能完全处理掉'
]);
addKnown('fallback_head', 'partnership', [
  '我和他两个人搭着做这门事以后合不合',
  '跟这个人一起把手上的事情做下去行不行'
]);
addKnown('fallback_head', 'investment_profit', [
  '把钱放进这个产品以后最后能不能多回来一些',
  '这笔钱放进去一阵子以后能不能有多的回来'
]);
addKnown('fallback_head', 'investment_liquidation', [
  '我想把手上这份东西整个退出来会不会顺',
  '现在这份东西准备全部收回来能不能办成'
]);
addKnown('fallback_head', 'investment_suitability', [
  '眼下把钱放进这个东西里面是不是合适',
  '这个东西现在让我把钱放进去合不合'
]);
addKnown('fallback_head', 'investment_position_decision', [
  '手上这一份继续留着还是收回来一部分好',
  '现在拿着的这份东西该继续留还是少留一些'
]);
addKnown('fallback_head', 'investment_price_trend', [
  '这个东西的价接下来一阵会不会抬起来',
  '眼前这份东西过些日子的价会不会往下走'
]);
addKnown('fallback_head', 'income_salary', [
  '每个月固定到手的那一份以后会不会多一点',
  '往后每月稳定拿到的那部分有没有机会增加'
]);
addKnown('fallback_head', 'income_bonus', [
  '年底额外该拿的那笔钱最后能不能到手',
  '事情做完以后另外那笔奖励钱我能不能拿到'
]);
addKnown('fallback_head', 'receive_item', [
  '前几天下单的那个东西大概什么时候能到手',
  '我订的那件东西这几天能不能送到我这里'
]);
addKnown('fallback_head', 'item_purchase', [
  '眼前这个东西现在值不值得入手',
  '我最近看中的这个东西现在要不要拿下'
]);
addKnown('fallback_head', 'relationship_development', [
  '我和这个人以后能不能真的走到一起',
  '我们两个人后面有没有可能变成一对'
]);
addKnown('fallback_head', 'marriage_match', [
  '我们最后有没有可能把两个人的家安下来',
  '我和她这段关系以后能不能真正定下来成家'
]);
addKnown('fallback_head', 'marital_relationship', [
  '两个人成家以后最近这些别扭还能不能过去',
  '我跟另一半现在这种僵着的状态以后会不会好些'
]);

addNonRoute('outside_current_22', [
  '下周去名古屋出差这一趟路上会不会顺利',
  '这次研究生入学考试我最后能不能合格',
  '明天那场工作面试我有没有机会被录用',
  '掉在车站附近的钱包还有没有机会找回来',
  '这次和房东的民事纠纷最后结果会不会对我有利',
  '我申请的在留资格更新这次能不能批准',
  '下个月搬到新住处整个过程会不会顺当',
  '这次职业资格考试能不能一次考过',
  '周末参加的摄影比赛有没有机会获奖',
  '遗失的公司门禁卡最后还能不能找到',
  '明天坐飞机去札幌这趟行程会不会有波折',
  '这次论文答辩能不能顺利通过',
  '我申请转到新部门这次能不能成功',
  '这场劳动仲裁最后会不会支持我的请求',
  '孩子这次转学申请能不能获批',
  '丢掉的那只耳环还有没有可能找回来',
  '下周参加驾驶考试能不能顺利合格',
  '这次去国外旅行能不能按原计划成行',
  '我投的这个职位招聘最后会不会录取我',
  '这次合同纠纷上法院以后结果会怎样',
  '遗失的相机存储卡还能不能找回来',
  '下个月的语言等级考试我能不能通过'
]);

addNonRoute('route_unresolved', [
  '这件事情最后到底会变成什么样',
  '我现在这样继续下去到底行不行',
  '接下来这一步我应该怎么走才好',
  '最近反复想的这件事以后会怎样',
  '眼前这个选择最后是不是对的',
  '我是不是还应该再坚持一段时间',
  '这件事接下来有没有什么变化',
  '目前这个局面后面会不会好一点',
  '我现在做的决定以后会怎么样',
  '最近这件麻烦最后能不能过去',
  '眼下这个问题最后会落到哪里',
  '我现在是不是该换一种做法',
  '这段时间一直挂心的事会怎么发展',
  '这个决定继续执行下去有没有问题',
  '现在这种状态以后能不能改变',
  '我该不该把眼前这件事先停下来',
  '这件事情还有没有继续推进的必要',
  '最近遇到的这个状况以后会不会缓下来',
  '我现在选的方向到底合不合适',
  '后面这件事会不会出现新的转机',
  '眼前这个安排是不是应该继续',
  '我现在最纠结的这件事最后会怎么收场'
]);

addNonRoute('near_domain_not_current_route', [
  '这只基金赎回申请每天几点以前提交才算当天',
  '证券账户买卖股票现在一笔要收多少手续费',
  '工资条里的住房公积金为什么扣成这个数',
  '银行消费贷款目前的年利率是多少',
  '公司年终奖的个人所得税具体怎么计算',
  '网店开具电子发票需要经过哪些步骤',
  '买这台电脑以后退货期限一共是多少天',
  '快递显示转运中通常下一步是什么流程',
  '基金卖出以后资金一般几个工作日到账',
  '股票账户修改绑定银行卡要准备什么材料',
  '商业合同里这一条违约金条款是什么意思',
  '门店进货发票应该记在哪个会计科目',
  '朋友借款写借条通常要包含哪些内容',
  '提前还房贷现在银行一般会不会收违约金',
  '夫妻办理结婚登记现在需要带哪些证件',
  '公司调整基本工资通常要走哪些审批流程',
  '绩效奖金在工资单上一般怎么列示',
  '海外包裹入境以后关税通常怎么计算',
  '电商平台卖出商品以后服务费按什么比例收',
  '合伙企业的利润分配在账务上应该怎么记录',
  '投资账户年度管理费现在具体是多少',
  '网购买到商品后申请换货要按什么步骤操作'
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
const modelLockSha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, modelLockPath))).digest('hex');
const data = {
  version:'0.13-candidate-v0.3-development-v0.1',
  status:'generated_preseal',
  sealed:false,
  scope:'liuyao_semantic_decision_stack_v0.13_candidate_v0.3',
  createdAfterFallbackIdentityModelLock:true,
  fallbackIdentityModelLock:{ path:modelLockPath, sha256:modelLockSha256, artifactSha256:modelLock.artifactSha256 },
  policy:{
    useForTraining:false,
    useForThresholdCalibration:false,
    useForIndependentEvaluation:false,
    sealedBeforeFirstDevelopmentEncoderScoring:false,
    candidateV02IndependentReuse:false,
    sameTextAsPriorCorporaForbidden:true,
    traditionalLiuYaoFeaturesForbidden:true,
    healthDiseaseDivinationRowsForbidden:true
  },
  counts,
  rows
};
fs.writeFileSync(path.join(root, outPath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Generated fresh Candidate v0.3 development data: ${rows.length} rows`);
console.log(JSON.stringify(counts, null, 2));
