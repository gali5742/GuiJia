import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'data/liuyao-semantic-routeability-v0.2-development.json');
const routes = [
  'financial_fortune','business_operation','commercial_transaction','inventory_purchase','inventory_sale',
  'borrow_money','lend_money','debt_collection','debt_repayment','partnership',
  'investment_profit','investment_liquidation','investment_suitability','investment_position_decision','investment_price_trend',
  'income_salary','income_bonus','receive_item','item_purchase','relationship_development','marriage_match','marital_relationship'
];

const knownInsufficient = {
  financial_fortune:['最近财务这块怎么样','这阵子钱方面顺不顺'],
  business_operation:['这门生意后面怎么样','店里的经营接下来顺吗'],
  commercial_transaction:['这笔商业交易会怎样','这一单最后谈得成吗'],
  inventory_purchase:['补货这事能不能成','这批进货后面顺不顺'],
  inventory_sale:['这批库存最后能处理掉吗','仓里的尾货能不能清出去'],
  borrow_money:['想找人周转一笔能成吗','最近能不能借到一笔钱'],
  lend_money:['有人找我借钱这事怎么样','这次把钱借出去合适吗'],
  debt_collection:['欠我的款能回来吗','之前那笔债能收回来吗'],
  debt_repayment:['这笔欠款什么时候能处理完','贷款后面能不能结清'],
  partnership:['这个合伙关系后面怎么样','和人一起经营能不能继续'],
  investment_profit:['这笔投资收益会怎样','投进去以后赚不赚钱'],
  investment_liquidation:['这次退出投资会顺吗','把仓位全部撤掉能完成吗'],
  investment_suitability:['这项投资适合我吗','现在参与这个标的合适吗'],
  investment_position_decision:['手上的仓位该怎么处理','这个持仓还要不要继续'],
  investment_price_trend:['这个标的后面怎么走','这只基金接下来涨还是跌'],
  income_salary:['工资后面会变吗','固定薪酬今年有没有变化'],
  income_bonus:['奖金这次能下来吗','年终奖励后面怎么样'],
  receive_item:['这个订单什么时候到','这件货能不能收到'],
  item_purchase:['这个东西现在该不该买','这件商品值不值得入'],
  relationship_development:['我们这个关系会不会往前走','我和对方还有没有发展'],
  marriage_match:['这桩婚事能成吗','我们最后能不能成为夫妻'],
  marital_relationship:['这段婚姻后面会怎样','夫妻关系接下来能不能好转']
};

const calibrationKnown = {
  financial_fortune:['最近整体的钱路顺不顺','接下来几个月手头会宽裕些吗'],
  business_operation:['这个新摊位接下来经营得下去吗','工作室后面能不能稳定挣钱'],
  commercial_transaction:['这单批发生意最后能成交吗','和这个客户的这笔采购能不能签下来'],
  inventory_purchase:['这一轮补货能顺利进仓吗','给店里添的这批货能不能按计划入库'],
  inventory_sale:['仓库这批尾货能清掉吗','积着的存货这次能不能出完'],
  borrow_money:['我想从亲戚那边周转一笔能借到吗','准备找朋友先垫点钱能成吗'],
  lend_money:['把这笔钱借给同事稳不稳','朋友来借钱这次适合借出去吗'],
  debt_collection:['之前借出去那笔钱能收回来吗','拖着我的那笔款这次能追回吗'],
  debt_repayment:['我这笔信用卡欠款今年能处理完吗','现在这笔贷款多久能结清'],
  partnership:['和这个搭档一起做项目能顺吗','我们两个人合着开店能不能长久'],
  investment_profit:['投进这个项目后能不能赚到钱','这笔投资最后有没有正收益'],
  investment_liquidation:['这只基金全部赎回能顺利完成吗','手上仓位这次一次性退出会不会卡'],
  investment_suitability:['这个项目适不适合我投','现在参与这只基金值不值得'],
  investment_position_decision:['这只股票继续拿还是减一点','手上的基金要不要调整仓位'],
  investment_price_trend:['这只ETF接下来价格怎么走','这个基金后面还会跌吗'],
  income_salary:['下次工资会不会涨一点','今年固定薪酬有没有调整机会'],
  income_bonus:['今年年终奖能拿到多少','这个项目奖励会不会发下来'],
  receive_item:['这个包裹什么时候能到手','我下的订单这周能收到吗'],
  item_purchase:['这台显示器现在值不值得买','这个相机要不要入手'],
  relationship_development:['我和这个人能不能正式在一起','这段暧昧接下来会不会有进展'],
  marriage_match:['这门亲事最后能不能成','我和他有机会走到结婚吗'],
  marital_relationship:['我和妻子这段婚姻后面怎么样','我们夫妻最近的关系会缓和吗']
};

const calibrationOutside = [
  '明天出差一路顺不顺','这次考试能不能过','面试最后会不会录用','丢的钥匙还能不能找到','这场官司最后结果怎样','孩子这学期状态怎么样',
  '明天去爬山天气合不合适','这份租房合同有没有坑','新工作团队好不好相处','这趟旅行会不会临时改期','我的护照办理会不会按时下来','这次签证申请能不能通过',
  '这门课程适不适合继续学','搬家定在下周顺不顺','新买的车开长途稳不稳','这次比赛能不能进决赛','宠物走丢后能不能自己回来','准备换专业这件事合不合适',
  '明天和领导谈项目会不会顺利','这份工作能不能转正','这次仲裁最后会怎么判','丢在公司的证件还能找回来'
];
const calibrationUnresolved = [
  '这件事最后会怎样','我现在到底该怎么办','后面会不会顺一点','这个决定是不是对的','他到底什么意思','最近总觉得不太对劲会怎样',
  '眼前这件事是不是还有新的转圜空间','接下来应该往哪边走','现在这个状态会持续多久','我是不是还要继续等','这次到底能不能成','以后会变好吗',
  '这个机会值得抓住吗','我应该主动还是不动','对方接下来会怎么想','最近这件事总卡着怎么办','我现在做这个选择好吗','未来一阵子会顺利吗',
  '这个结果会不会改变','我还需要继续坚持吗','事情什么时候会明朗','这条路是不是还能走下去'
];
const calibrationNear = [
  '最近公司内部会不会裁员','老板会不会给我更多职责','这份报价是不是合理','供应商最近靠不靠谱','客户为什么一直不回复','这个合同条款会不会吃亏',
  '仓库管理流程要不要改','现金账户要不要换银行','股票软件要不要换一个','基金经理最近表现靠谱吗','快递公司服务是不是变差了','这款电脑售后靠不靠谱',
  '伴侣最近是不是工作太忙','朋友介绍的对象人品怎么样','同事之间最近关系紧不紧张','今年行业景气度会不会变好','公司新制度会不会影响团队','这家店的位置客流怎么样',
  '银行利率后面会不会调整','这个项目排期会不会延期','奖金制度设计得合不合理','工资单上的扣款是不是算错了'
];

const trainingOutside = [
  '明早坐飞机这趟行程顺不顺','期末这门课能不能及格','新岗位面试有没有机会过','昨晚弄丢的钱包找得回来吗','这个诉讼案最后谁占上风','小孩换学校适应得好吗',
  '周末露营会不会遇到大雨','这个租约续签有没有麻烦','换到新部门以后适应得顺吗','这次出国行程会不会取消','居留更新能不能按时批下来','留学申请这次能不能获批',
  '这门法语课继续报有没有用','下个月搬办公室顺不顺','这辆二手车以后故障多不多','这次演出比赛能不能拿奖','猫跑出去之后还能回来吗','准备转学这步走得对不对',
  '明天做汇报领导会满意吗','试用期结束能不能留下','这场劳动仲裁能不能赢','遗失的门卡还能找得到吗'
];
const trainingUnresolved = [
  '这件事情还能继续吗','我是不是想错了','后面到底会变成什么样','这个选择有没有问题','对方现在是什么想法','最近一直不顺接下来呢',
  '事情是不是还有机会','下一步到底怎么做','这种局面还要多久','我还要不要等下去','这回到底有没有戏','以后会不会改善',
  '眼前这个机会该不该抓','现在主动好还是等等好','他之后会采取什么态度','这事一直拖着会怎样','我现在这么决定行不行','接下来一段时间整体顺吗',
  '最后的结果还会变化吗','是不是应该继续坚持','什么时候才能看清结果','现在这条路还能不能走'
];
const trainingNear = [
  '公司今年会不会扩大招聘','领导会不会调整我的职责','这份商业报价有没有水分','这个供货商信誉怎么样','客户迟迟不回消息是什么原因','合同里的违约条款合理吗',
  '库存盘点流程怎么优化','企业账户换哪家银行好','炒股软件哪个更好用','这个基金经理能力怎么样','物流公司的时效最近稳定吗','这台电脑的保修政策靠谱吗',
  '对象最近加班多是不是正常','朋友介绍的人性格合不合','同事最近为什么关系紧张','这个行业明年景气吗','公司改考核制度影响大不大','店门口的人流量够不够',
  '贷款利率未来会不会调整','这个项目会不会延期交付','奖金方案怎么设计更合理','工资条扣税是不是有问题'
];

const knownRows = (source, subtype) => routes.flatMap((routeId) => source[routeId].map((text) => ({ routeId, text, routeabilityLabel:'route_known', subtype })));
const nonRouteRows = (texts, subtype) => texts.map((text) => ({ text, routeabilityLabel:'non_route', subtype }));
const data = {
  version:'0.2',
  status:'development_data',
  scope:'liuyao_only',
  purpose:'Fresh Routeability training/calibration augmentation. Not blind evaluation.',
  knownInsufficient:knownRows(knownInsufficient, 'known_route_insufficient'),
  calibrationKnown:knownRows(calibrationKnown, 'known_route'),
  calibrationNonRoute:[
    ...nonRouteRows(calibrationOutside, 'outside_current_22'),
    ...nonRouteRows(calibrationUnresolved, 'route_unresolved'),
    ...nonRouteRows(calibrationNear, 'near_domain_not_current_route')
  ],
  trainingNonRoute:[
    ...nonRouteRows(trainingOutside, 'outside_current_22'),
    ...nonRouteRows(trainingUnresolved, 'route_unresolved'),
    ...nonRouteRows(trainingNear, 'near_domain_not_current_route')
  ]
};

if (data.knownInsufficient.length !== 44 || data.calibrationKnown.length !== 44 || data.calibrationNonRoute.length !== 66 || data.trainingNonRoute.length !== 66) {
  throw new Error('Routeability v0.2 generated data count mismatch');
}
fs.writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Generated ${path.relative(root, outPath)}: 44 known-insufficient / 44 calibration-known / 66 calibration-non-route / 66 training-non-route`);
