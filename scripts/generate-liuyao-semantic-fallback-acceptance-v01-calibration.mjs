import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'data/liuyao-semantic-fallback-acceptance-v0.1-calibration.json');
const contractRelative = 'data/liuyao-semantic-fallback-acceptance-v0.1-contract.json';
const contractPath = path.join(root, contractRelative);
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const contractFreezeCommit = execFileSync('git', ['log','-1','--format=%H','--',contractRelative], { cwd:root, encoding:'utf8' }).trim();
const generatorCommit = execFileSync('git', ['rev-parse','HEAD'], { cwd:root, encoding:'utf8' }).trim();

const routes = [
  'financial_fortune','business_operation','commercial_transaction','inventory_purchase','inventory_sale',
  'borrow_money','lend_money','debt_collection','debt_repayment','partnership',
  'investment_profit','investment_liquidation','investment_suitability','investment_position_decision','investment_price_trend',
  'income_salary','income_bonus','receive_item','item_purchase','relationship_development','marriage_match','marital_relationship'
];

const known = {
  financial_fortune:[
    '明年我手头能留下来的余钱会不会比今年多','接下来半年家里的经济压力能不能慢慢轻一点','往后一段时间我手上的宽裕程度会不会提高','未来一年整体钱款周转能不能比现在从容些'
  ],
  business_operation:[
    '这家小店再往后做下去能不能渐渐稳当','我自己经营的这门生意明年还有没有继续做的空间','手里这摊买卖接下来能不能维持住','这个铺子往后一年经营起来会不会越来越顺'
  ],
  commercial_transaction:[
    '跟对方谈着的这桩买卖最后会不会有着落','眼前这门生意双方后面还能不能谈出结果','这家公司和我的这笔买卖最后会不会有下文','现在谈的这桩生意后面能不能顺利有结果'
  ],
  inventory_purchase:[
    '铺子下月要用的那批货最后能不能都备到位','店里准备添进来的新货能不能按需要凑齐','下一轮经营要用的货品能不能及时备全','仓里准备补上的那批商品后面能不能齐全'
  ],
  inventory_sale:[
    '库里堆着的那批货接下来能不能陆续走掉','店里压着的旧商品后面能不能慢慢腾空','手上积着的那批存货以后能不能逐渐减少','仓库剩下的货接下来能不能顺着清出去'
  ],
  borrow_money:[
    '最近资金差了一截，能不能从亲友那边先凑上一些','眼下手头不够，这个缺口能不能有人帮我补上','临时需要一笔周转的钱，能不能从家人那里挪来','这阵子差的那笔钱能不能从熟人手里先凑到手'
  ],
  lend_money:[
    '朋友眼下周转不开，我先拿一笔给他用合不合适','亲戚临时缺一笔，我把钱先给他顶着会不会麻烦','熟人最近手紧，我先分些钱给他用妥不妥','同事有个临时缺口，我拿钱给他周转一阵行不行'
  ],
  debt_collection:[
    '去年放出去的那笔钱以后还能不能回到我手上','对方一直没归回来的那笔款最后还有没有着落','早前给出去的一笔钱接下来能不能慢慢回来','那笔在别人手里放了很久的钱最终还能不能回来'
  ],
  debt_repayment:[
    '我身上剩下的那笔账今年能不能彻底放下','一直挂着的那项欠款后面能不能清完','目前压着我的这笔账年底前能不能结束','这项长期负担接下来能不能彻底处理掉'
  ],
  partnership:[
    '我和这个人一起把这家店做下去以后会不会稳','跟他两个人搭着经营这门生意合不合适','我们一块撑这个铺子往后能不能长久','和这个伙伴继续一起做这门买卖行不行'
  ],
  investment_profit:[
    '这只基金再放半年最后能不能多出一些钱','这个投资项目做上一阵以后会不会有进项','手里的股票继续拿一段时间最后有没有赚头','这笔钱放在这个投资里到明年会不会增加'
  ],
  investment_liquidation:[
    '这份基金我整个退出来以后会不会顺','手上的股票我全都退出去会不会卡住','这个投资我准备全部拿回来能不能顺当','这项投资整个撤出来后面会不会有阻碍'
  ],
  investment_suitability:[
    '这只基金现在参与进去对我合不合适','眼下把钱放进这个项目对我是不是妥当','这个股票现在进去是否适合我的情况','这项投资我此时参与合不合宜'
  ],
  investment_position_decision:[
    '这只基金接下来我是多留一点还是少留一点','手上的股票往后是增加一些还是减掉一些','这个投资手里的份额后面多些好还是少些好','这只股票以后我是继续多拿还是收回一部分'
  ],
  investment_price_trend:[
    '这只股票再过一阵大概往高处还是低处走','这个基金接下来几个月会抬高还是回落','手里的股票后面一段是涨上去还是降下来','这只基金未来几周大概朝上还是朝下'
  ],
  income_salary:[
    '明年每个月固定到手的那一份会不会增加','以后公司按月给我的固定收入能不能多一些','接下来每月稳定拿到的钱会不会比现在高','往后一年公司每个月固定发我的那部分能不能变多'
  ],
  income_bonus:[
    '今年公司年底额外给我的那份还有没有','这个项目结束以后另外那笔钱我能不能拿到','年底公司多给的那部分这次会不会落下来','项目收尾以后额外给我的那一份有没有机会拿着'
  ],
  receive_item:[
    '我前几天订的书桌大概还要多久到','网上定的洗衣机这周能不能送过来','买下的床架大概哪天能送到家','我订的显示器后面几天能不能收到'
  ],
  item_purchase:[
    '这台咖啡机现在入不入','眼前这个投影仪值不值得拿下','这把书桌椅现在收不收','这个扫地机器人眼下要不要入'
  ],
  relationship_development:[
    '我跟这个人往后有没有可能真的变成恋人','我们两个接下来能不能从现在这样走近一步','我和她以后会不会慢慢走到一起','我跟他后面有没有机会发展成一对'
  ],
  marriage_match:[
    '我和伴侣以后能不能正式成为一家人','这段关系最后有没有机会走到结婚那一步','我们两个人往后能不能把婚事办下来','我和对象最后能不能真正一起成家'
  ],
  marital_relationship:[
    '我和配偶最近总闹别扭，之后相处能不能缓和','我们结婚几年了，接下来两个人会不会更和顺','家里两个人这阵子关系僵，往后能不能好一些','我和另一半一起生活这么久，后面关系能不能改善'
  ]
};

const nonRoute = {
  outside_current_22:[
    '这次日语等级考试最后能不能合格','下周去那家公司复试能不能拿到录用','落在车站的手套以后还能不能找回来','这场合同诉讼最后结果会不会对我有利','下个月搬进新办公室会不会顺利','这次留学签证能不能按计划批下来',
    '调到新的项目组以后我能不能适应','这门培训课程继续读下去值不值得','这次围棋比赛我能不能进入下一轮','明天在大会上发言会不会顺畅','去另一座城市定居对我合不合适','新租下的房间住起来会不会舒心',
    '这次职业证书审核最后能不能通过','这趟旅行托运的行李会不会出问题','加入这个新团队以后同事好不好相处','孩子转去另一所学校后能不能适应','这篇小说投给杂志以后有没有机会刊登','明天向客户做方案说明能不能顺利',
    '现在改学另一个专业是不是合适','这次劳动仲裁最后会偏向哪一方','前天丢的钥匙还有没有机会找回来','下一次驾驶考试我能不能一次合格','这趟出差一路会不会顺利','我报名的抽签活动这次能不能抽中',
    '这次申请学校宿舍有没有机会排到','周末登山计划能不能按原安排进行','这次艺术展投稿最后能不能入选','我换到新的座位以后工作会不会更顺','下周的资格面谈能不能一次过','这次房屋租赁审查会不会通过'
  ],
  route_unresolved:[
    '这件事情往后究竟会变成什么样','我现在做的这个选择到底是不是对的','后面的情况会不会慢慢出现转机','这件事目前还值不值得继续','对方之后到底会怎么回应我','我是不是应该先放一放再看',
    '眼前这个机会究竟要不要接住','目前这条路继续走还有没有意义','事情到最后还会不会发生变化','我现在是主动一点还是先不动','这件事情还得多久才会明白','接下来我应该把力气放在哪边',
    '眼下这种状态还要持续多长时间','我现在这么决定以后会不会后悔','目前这件事还有没有转圜的地方','下一步我是不是应该继续坚持','这回的事情最终会落成什么结果','之后一阵整体会不会顺畅一些',
    '我现在是不是判断错了方向','这个机会以后还会不会留着','眼前这一步现在做合不合适','我是不是还要继续耗在这件事上','后面会不会突然出现新的变化','目前这种局面还有没有办法打开',
    '我接下来应该等待还是行动','现在继续下去是不是最好的选择','这件事情到底什么时候会有答案','我目前还有没有别的路可以走','以后这段时间事情会朝哪边变化','我现在应该相信这个判断吗'
  ],
  near_domain_not_current_route:[
    '我想比较几种基金产品的管理费差异','这家证券软件最近为什么总是更新','我在整理小店不同经营模式的优缺点','客户不回复消息通常有哪些原因','供应商信用评级一般怎么看','合作伙伴的职责通常应该怎么分',
    '公司缩编一般会先有哪些迹象','岗位调动通常需要走哪些内部流程','商业报价里常见的成本项目有哪些','仓库盘点频率一般怎么安排','不同快递公司的服务范围怎么比较','商品售后条款通常应该看哪些地方',
    '基金托管费和管理费有什么区别','股票交易里的手续费通常包括哪些项','基金赎回确认时间一般怎么计算','工资单里的各项扣除分别是什么','项目奖金通常有哪些分配方式','合同中的违约责任一般怎么理解',
    '企业账户选择银行时主要比较什么','基金经理的任职信息在哪里查','证券客户端登录异常通常怎么排查','门店客流统计有哪些常见方法','异地工作后两个人怎么安排相处时间','第一次见朋友介绍的人聊什么比较自然',
    '库存周转率这个指标应该怎么计算','应收款和预收款在账务上有什么区别','分期还款通常怎样计算剩余本金','合伙协议里通常要写哪些基本事项','投资组合里的仓位比例是什么意思','结婚登记一般需要准备哪些材料'
  ]
};

const rows=[];
let index=1;
for(const routeId of routes){
  if(known[routeId]?.length!==4) throw new Error(`${routeId} known count != 4`);
  for(const text of known[routeId]) rows.push({id:`FA-C-${String(index++).padStart(3,'0')}`,text,expectedRoute:routeId,label:'route_known',subtype:'pure_fallback_known'});
}
for(const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']){
  if(nonRoute[subtype]?.length!==30) throw new Error(`${subtype} count != 30`);
  for(const text of nonRoute[subtype]) rows.push({id:`FA-C-${String(index++).padStart(3,'0')}`,text,expectedRoute:null,label:'non_route',subtype});
}
if(rows.length!==178) throw new Error(`calibration count ${rows.length} != 178`);

const artifact={
  version:'0.13-fallback-acceptance-v0.1-calibration-v0.1',
  status:'presealed_fresh_calibration',
  sealed:false,
  scope:'liuyao_semantic_pure_fallback_acceptance',
  createdAfterContractFreeze:true,
  provenance:{
    contractPath:contractRelative,
    contractSha256:sha256(contractPath),
    contractFreezeCommit,
    generatorCommit,
    generatedAt:new Date().toISOString()
  },
  policy:{
    useForTraining:false,
    useForThresholdCalibration:true,
    useAsDevelopmentEval:false,
    reuseAsIndependent:false,
    reuseAsBlind:false,
    oldFallbackCalibrationExcluded:true,
    routeabilityCalibrationExcluded:true,
    sealedBlindAndIndependentExcluded:true,
    thresholdsToCalibrate:['routeability_accept_threshold','identity_accept_threshold'],
    routeSpecificThresholdsForbidden:true,
    multiTextEncoderBatchForbidden:true
  },
  counts:{total:178,route_known:88,non_route:90,perRouteKnown:4,outside_current_22:30,route_unresolved:30,near_domain_not_current_route:30},
  rows
};
fs.writeFileSync(outputPath,`${JSON.stringify(artifact,null,2)}\n`,'utf8');
console.log('Generated fresh Fallback Acceptance v0.1 calibration corpus.');
console.log('- 178 total: 88 known (4 x 22) / 90 non-route (30 x 3)');
console.log(`- contract freeze commit: ${contractFreezeCommit}`);
console.log(`- generator HEAD: ${generatorCommit}`);
