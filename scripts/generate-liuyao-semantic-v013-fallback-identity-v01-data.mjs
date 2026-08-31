import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trainingPath = path.join(root, 'data/liuyao-semantic-fallback-identity-v0.1-training.json');
const calibrationPath = path.join(root, 'data/liuyao-semantic-fallback-identity-v0.1-calibration.json');
const routes = [
  'financial_fortune','business_operation','commercial_transaction','inventory_purchase','inventory_sale',
  'borrow_money','lend_money','debt_collection','debt_repayment','partnership',
  'investment_profit','investment_liquidation','investment_suitability','investment_position_decision','investment_price_trend',
  'income_salary','income_bonus','receive_item','item_purchase','relationship_development','marriage_match','marital_relationship'
];

const trainingKnown = {
  financial_fortune:[
    '这一年手里的余钱会不会比过去更容易留下来','接下来几个月家里的钱袋子能不能松快些','往后这段时间我手上会不会比现在宽绰一点','今年剩下的日子经济上能不能慢慢轻松些'
  ],
  business_operation:[
    '这个铺面往后还能不能一直撑下去','我手里这门小生计以后还有没有做头','这家铺子接下来能不能慢慢站稳','自己做的这摊事情后面还能不能持续'
  ],
  commercial_transaction:[
    '跟对方这桩买卖最后还有没有下文','这门买卖双方最后能不能说定','眼前这桩生意最后会不会有结果','和这位客商谈的事情最后能不能落定'
  ],
  inventory_purchase:[
    '店里下一轮要添的那批东西能不能凑齐','后仓下一季需要的货最后能不能备全','铺面准备添上的那批货能不能按时齐全','下一轮店里需要的商品能不能及时凑够'
  ],
  inventory_sale:[
    '库房压着的旧货以后能不能慢慢走掉','店里剩着的那一批东西能不能逐步腾出去','仓里占地方的旧货后面能不能消下去','手上囤着的那批东西以后能不能清出去'
  ],
  borrow_money:[
    '手头差一截，能不能先从朋友那边挪些过来','最近这个缺口有没有人能先帮我垫上','临时差一笔，我能不能从熟人那里凑过来','眼下差的钱能不能先从家里补上'
  ],
  lend_money:[
    '朋友临时缺钱，我把一笔先给他用妥不妥','熟人手头紧，我先拿些钱给他应急合适吗','同事现在缺口大，我把钱先给他顶一阵行不行','亲戚临时差钱，我先拿一笔给他用会不会麻烦'
  ],
  debt_collection:[
    '早前给出去的那笔钱最后还回得来吗','之前放到别人手里的那笔款还能回到我这边吗','那笔一直在别人那里的钱以后还有没有着落','过去交到对方手上的那笔钱最终能回来吗'
  ],
  debt_repayment:[
    '身上那笔账今年能不能彻底了结','压着我的那笔账以后能不能清干净','这笔一直挂在身上的账什么时候能结束','我手上这个负担年底前能不能处理完'
  ],
  partnership:[
    '跟这个人搭着把店做下去合适吗','我们两个人一起把这门事撑起来能不能长久','我和他搭着做这个铺子以后行不行','两个人一块做这门生意后面能不能稳住'
  ],
  investment_profit:[
    '这只基金放上一阵子最后有没有赚头','钱放在这个基金里半年后能不能多出一些','这只股票拿一段时间最后会不会有进项','这个投资项目做完以后能不能多出一笔'
  ],
  investment_liquidation:[
    '手上的这只基金全退出来能不能顺当','这份基金我全部退掉以后会不会卡住','手里这只股票一次都撤出来能不能成','这项投资我准备整个退出去会不会顺利'
  ],
  investment_suitability:[
    '这个基金现在进去妥不妥','眼下把钱放到这只基金里合不合我的情况','这只股票现在参与进去是不是稳妥','这个投资项目我现在进场到底合不合宜'
  ],
  investment_position_decision:[
    '这只股票接下来是多拿一点还是收一点回来','手里这只基金以后是多留些还是少留些','现在这份股票我是继续放着还是先拿回一部分','这只基金手上的份额接下来多一点好还是少一点好'
  ],
  investment_price_trend:[
    '这只基金过阵子会往上还是往下','手上这个股票后面一阵会抬高还是压低','这只基金接下来是往高处走还是往低处走','这个股票过几周大概会朝哪个方向走'
  ],
  income_salary:[
    '以后公司每个月固定给我的那部分会不会多一点','明年每月稳定到手的那一份能不能增加','公司每个月固定发给我的钱以后会不会变多','往后每月固定拿到的那部分能不能往上走'
  ],
  income_bonus:[
    '年底公司另外给的那笔钱今年还有没有','这次项目做完额外那一份我能不能分到','公司年底多发的那部分今年会不会有','项目结束后另外给我的那笔钱最后能不能落下来'
  ],
  receive_item:[
    '我订的书柜大概哪天来','前两天订的沙发什么时候能到家','网上订的餐桌还要几天才来','我定的落地灯这周会不会送来'
  ],
  item_purchase:[
    '这台电饭煲眼下入不入','这个咖啡磨现在收不收','这把人体工学椅现在拿下合不合适','这台除湿机眼下值不值入'
  ],
  relationship_development:[
    '我和这个人之后能不能真正走到一起','我们两个以后有没有可能变成一对','我跟她之后能不能从现在这样更进一步','我和他往后有没有机会走成一对'
  ],
  marriage_match:[
    '我和对象以后有没有机会成为一家人','我们两个最后能不能把日子正式过到一块','我俩以后有没有可能办成终身大事','我和伴侣最后能不能真正组成一个家'
  ],
  marital_relationship:[
    '我和另一半共同生活这么久，往后相处能不能缓和','我们已经一起生活多年，接下来关系会不会好些','家里两个人现在总拧巴，往后能不能和顺一点','我和另一半这几年相处不顺，后面能不能改善'
  ]
};

const calibrationKnown = {
  financial_fortune:['接下来一年我的日子在钱上会不会松一点','往后几个月手里的余量能不能多起来','今年后半段经济上会不会比前面轻省'],
  business_operation:['这个铺面再做一年还能不能撑得住','我自己做的这门小生计以后有没有奔头','这摊事情接下来还能不能稳稳继续'],
  commercial_transaction:['和对方这桩买卖最后能不能说下来','眼前这门买卖后面还有没有结果','跟这位客商谈的事情最后能不能定下来'],
  inventory_purchase:['店里下一批要添的东西最后能不能齐','下一季铺面需要的那批货能不能备全','后仓要补上的那些东西能不能按时凑够'],
  inventory_sale:['库里压着的那批旧货能不能慢慢走出去','店里剩下的那批东西以后能不能腾掉','仓里放久的货接下来能不能逐步走掉'],
  borrow_money:['手头这个缺口能不能先从熟人那里补过来','眼下差一笔，有没有人能先帮我垫上','最近差的钱能不能从家里先挪过来'],
  lend_money:['朋友现在差钱，我拿一笔给他先用行不行','同事有个缺口，我先把钱给他顶着妥吗','熟人临时手紧，我拿钱给他用会不会有麻烦'],
  debt_collection:['之前放在别人那里的那笔钱最后还能回来吗','早些时候给出去的钱以后还有没有着落','那笔在对方手里很久的钱最终回得来吗'],
  debt_repayment:['我身上这笔账明年以前能不能彻底结束','一直压着我的那笔账后面能不能清干净','这个长期挂着的负担什么时候能了结'],
  partnership:['我跟这个人搭着做这家铺子以后合不合','两个人一块把这门事做下去能不能长久','和他搭着把这个小店撑起来行不行'],
  investment_profit:['这只基金放到明年最后有没有赚头','钱放在这只基金里一段时间能不能多一些','手里这个股票拿久一点最后会不会有进项'],
  investment_liquidation:['这只基金整个退出来会不会顺','手里这个股票全部撤出来能不能成','这项投资我全退掉以后会不会卡'],
  investment_suitability:['现在进这个基金到底妥不妥','眼下把钱放进这只股票合不合宜','这个投资项目此时进去是不是稳妥'],
  investment_position_decision:['这只股票我是多留一点还是收回来一些','手里的基金接下来份额多些好还是少些好','这个股票以后是多放一些还是先收一部分'],
  investment_price_trend:['这个基金过几个月会往高处还是低处走','这只股票接下来一阵会抬起来还是压下去','手上这个基金后面大概朝哪个方向走'],
  income_salary:['明年公司每月固定给我的那份会不会多些','以后每个月稳定到手的那部分能不能增加','往后公司按月给我的固定那笔会不会往上'],
  income_bonus:['今年年底公司另外给的那份还有没有','这个项目结束后额外那一笔我能不能分着','年底多出来的那份钱这次会不会落到我这里'],
  receive_item:['我定的衣柜还要几天才来','前几天订的床垫大概哪天到家','网上定的茶几这周会不会送来'],
  item_purchase:['这台空气炸锅现在入不入','这把办公椅眼下收不收','这个小冰箱现在拿下合不合适'],
  relationship_development:['我和她以后有没有可能走成一对','我们两个接下来能不能比现在更进一步','我跟这个人往后有没有机会真正走到一起'],
  marriage_match:['我和对象最后能不能真正组成一个家','我们两个以后有没有机会成为一家人','我俩这段关系最后能不能办成终身大事'],
  marital_relationship:['我和另一半往后的相处能不能比现在和顺','我们共同生活这些年，接下来关系能不能缓下来','家里两个人最近总别扭，以后能不能好相处些']
};

const trainingNonRoute = {
  outside_current_22:[
    '这次资格考试最后能不能通过','下周那场面试我有没有机会被录取','丢在出租车上的围巾还能找回来吗','这场民事纠纷最终会怎么判','下个月搬到新住处顺不顺','这次出国申请能不能批下来',
    '我换到另一个部门以后能不能适应','这门课程继续学下去值不值','周末那场比赛能不能进下一轮','这次公开演讲会不会顺利','准备换一座城市生活合不合适','新租的房子住起来会不会顺心',
    '这次证书审核能不能按期通过','我的行李托运会不会出岔子','新加入的团队以后好不好相处','孩子转到新学校能不能适应','这次作品投稿有没有机会入选','明天和领导做汇报能不能顺利',
    '我准备换专业这一步合不合适','这次仲裁最后结果会偏向哪边','找不到的门卡还能不能找着','这次驾照考试能不能一次通过'
  ],
  route_unresolved:[
    '眼下这件事情最后会变成什么样','我现在这个决定到底对不对','后面的局面会不会慢慢好起来','这件事我还要不要继续做','对方接下来究竟会是什么态度','我是不是应该再等一阵',
    '现在这个机会究竟要不要抓','这条路往后还能不能继续走','事情最后还会不会再有变化','我现在主动一点好还是不动好','这件事情什么时候才能明朗','接下来我应该往哪边使劲',
    '现在这个状态还会维持多久','我目前这么选会不会后悔','眼前的事情是不是还有余地','我接下来是不是应该坚持','这件事最终到底能不能有结果','以后这一阵会不会比现在顺',
    '我现在是不是看错方向了','这个机会最后会不会变掉','这一步现在迈出去合不合适','我还要不要在这件事上花时间'
  ],
  near_domain_not_current_route:[
    '这只基金的管理人水平到底怎么样','证券软件现在换哪一个更顺手','这家店门口以后人流会不会增加','客户最近为什么一直不回我的消息','供货方最近的信誉还靠不靠谱','合作对象私下做事是不是可信',
    '公司明年会不会缩减岗位','领导以后会不会把我调到别的组','这份商业报价现在是不是偏高','仓库盘点方式要不要重新设计','这家物流公司的客服会不会改善','这个商品的保修政策到底靠不靠谱',
    '基金的托管费现在按什么标准计算','股票交易的税费具体是怎么收的','这只基金退出时几点前提交算当天','公司工资条上的扣款为什么这么算','奖金分配制度这样设计公不公平','这个合同里的违约条款有没有问题',
    '银行账户换一家机构是不是更方便','基金经理今年会不会离开现在的公司','这个股票账户的软件什么时候升级','店铺旁边新开商场会不会影响人流','伴侣换到新岗位以后工作顺不顺','朋友介绍的那个人性格怎么样'
  ]
};

const calibrationNonRoute = {
  outside_current_22:[
    '这次语言考试我能不能考过','周五的面试最后会不会给我通知','落在咖啡店的雨伞还能找回来吗','这场劳动争议最后能不能赢','下周搬办公室会不会顺利','这次长期签证申请有没有机会通过',
    '换到新的工作组以后我能不能适应','准备继续读这个课程合不合适','这次摄影比赛有没有机会获奖','明天上台发言会不会发挥正常','我去另一个城市生活会不会顺','刚租下的公寓住起来合不合适',
    '职业资格复审这次能不能过','这趟航班托运行李会不会丢','新团队里的同事以后好不好合作','孩子换班级之后能不能适应','这篇文章投出去有没有机会采用','明天给客户做演示能不能顺利',
    '现在转专业是不是合适的时候','这次调解最终会不会达成结果','遗失的工作证还能不能找到','下次路考我能不能顺利通过'
  ],
  route_unresolved:[
    '现在这件事情以后会朝哪里发展','我眼下这个选择到底合不合','后面是不是会比现在容易一点','这件事还值得我继续投入吗','对方下一步会采取什么态度','我是不是还应该再等一等',
    '眼前这个机会现在要不要接','目前这条路还能不能走下去','最后的结果是不是还会变化','我现在应该主动一点还是等等','这件事情还要多久才会清楚','下一步到底应该往哪边走',
    '目前这种状态还会持续多久','我现在做这个决定会不会错','眼前这件事后面还有没有余地','我是不是应该继续坚持下去','这回事情最终有没有下文','接下来一段时间会不会顺一些',
    '我目前是不是走错了方向','这个机会以后会不会消失','这一步现在做是不是太早','我还需要继续在这里耗着吗'
  ],
  near_domain_not_current_route:[
    '这个基金经理过去的表现靠谱吗','证券账户用哪个客户端更方便','这家铺面附近的人流以后会不会变多','客户迟迟不回应到底是什么原因','这个供应方现在信用怎么样','合作对象做事情的风格靠不靠谱',
    '公司下一季度会不会减少编制','领导以后会不会改变我的岗位职责','这份采购报价是不是高于正常水平','仓库现在的盘点流程有没有必要调整','这家快递公司的服务以后会不会变好','这款产品的售后规则到底怎么样',
    '基金管理费现在具体按什么比例收','股票账户佣金目前是怎样计算的','基金退出申请在几点以前算当天','工资明细里的社保为什么扣这么多','项目奖励的分配规则是否公平','这份协议里的责任条款有没有风险',
    '企业账户换别的银行会不会方便些','这个基金经理明年会不会换公司','股票客户端的登录问题何时修复','门店旁边道路施工会不会影响客流','另一半换工作以后适应得顺不顺','朋友介绍的对象脾气怎么样'
  ]
};

const knownRows = (source, split) => routes.flatMap((routeId) => source[routeId].map((text) => ({
  text,
  expectedRoute:routeId,
  identityLabel:'route_identity_positive',
  subtype:'fallback_style_known',
  split
})));
const nonRouteRows = (source, split) => Object.entries(source).flatMap(([subtype, texts]) => texts.map((text) => ({
  text,
  expectedRoute:null,
  identityLabel:'non_route',
  subtype,
  split
})));

const training = {
  version:'0.13-fallback-identity-v0.1-training-v0.1',
  status:'presealed_training_data',
  sealed:false,
  scope:'liuyao_semantic_fallback_identity_v0.1',
  createdAfterDesignFreeze:true,
  policy:{
    useForFallbackIdentityTraining:true,
    useForThresholdCalibration:false,
    useAsIndependentEvaluation:false,
    historicalRouterTrainSplitsAddedSeparatelyAtTrainingTime:true,
    sealedBlindOrIndependentRowsForbidden:true,
    traditionalLiuYaoFeaturesForbidden:true
  },
  rows:[...knownRows(trainingKnown,'training_augmentation'), ...nonRouteRows(trainingNonRoute,'training_augmentation')]
};
const calibration = {
  version:'0.13-fallback-identity-v0.1-calibration-v0.1',
  status:'presealed_calibration_data',
  sealed:false,
  scope:'liuyao_semantic_fallback_identity_v0.1',
  createdAfterDesignFreeze:true,
  policy:{
    useForFallbackIdentityTraining:false,
    useForThresholdCalibration:true,
    useAsIndependentEvaluation:false,
    mayChooseOnlyOneGlobalFallbackThreshold:true,
    routeabilityThresholdMayChange:false,
    scopeHardVetoMayChange:false,
    routeSpecificThresholdsForbidden:true,
    sealedBlindOrIndependentRowsForbidden:true,
    traditionalLiuYaoFeaturesForbidden:true
  },
  rows:[...knownRows(calibrationKnown,'calibration'), ...nonRouteRows(calibrationNonRoute,'calibration')]
};

if (training.rows.length !== 154) throw new Error(`training count ${training.rows.length} != 154`);
if (calibration.rows.length !== 132) throw new Error(`calibration count ${calibration.rows.length} != 132`);
fs.writeFileSync(trainingPath, `${JSON.stringify(training, null, 2)}\n`, 'utf8');
fs.writeFileSync(calibrationPath, `${JSON.stringify(calibration, null, 2)}\n`, 'utf8');
console.log('Generated Fallback Identity v0.1 fresh data.');
console.log('- training augmentation: 154 (88 known / 66 non-route)');
console.log('- calibration: 132 (66 known / 66 non-route)');
