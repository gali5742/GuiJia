import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = readJson('data/liuyao-semantic-v013-candidate-v04-data-contract-v0.1.json');
const schema = readJson('data/liuyao-semantic-v013-candidate-v04-semantic-act-data-schema-v0.1.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
assert(contract.status === 'frozen_before_v04_data_generation', 'v0.4 data contract not frozen');
assert(schema.status === 'frozen_before_semantic_act_data_generation', 'Semantic Act data schema not frozen');
assert(inventory.routeCount === 22 && inventory.routes?.length === 22, '22-route inventory drift');

const eligibleFamilies = [
  'personal_future_outcome',
  'current_decision_or_suitability',
  'personal_timing_or_arrival_outcome',
  'supported_outcome_with_fee_tax_rule_vocabulary_in_background',
  'personal_future_outcome',
  'current_decision_or_suitability',
  'personal_timing_or_arrival_outcome',
  'supported_outcome_with_fee_tax_rule_vocabulary_in_background',
  'personal_future_outcome'
];
const ineligibleFamilies = [
  'factual_fee_tax_rate_or_amount',
  'procedure_steps_or_deadlines',
  'requirements_documents_or_materials',
  'accounting_or_administration_explanation',
  'rule_policy_definition_or_interpretation',
  'generic_how_to_or_process_information',
  'factual_fee_tax_rate_or_amount',
  'procedure_steps_or_deadlines',
  'requirements_documents_or_materials'
];

const groups = [
  {
    id:'wealth_general',
    routes:['financial_fortune','business_operation'],
    eligible:[
      '我今年后半段手头能不能比现在更宽裕一些',
      '这个小生意眼下继续做下去对我合不合适',
      '我自己的现金余量大概什么时候能松动起来',
      '把平台服务费这些成本都算进去，这门生意后面还能不能留得住钱',
      '接下来几个月我在钱上的压力会不会慢慢减轻',
      '现在把更多时间投到这个小店里值不值得继续',
      '这摊生意什么时候才可能从勉强维持变得稳定一点',
      '按现有收费规则继续经营，我后面还能不能有比较稳定的结余',
      '明年我的日常收支会不会比今年更容易平衡'
    ],
    ineligible:[
      '个人每个月可支配收入通常应该按什么口径计算',
      '个体小店办理年度申报一般要在什么时间完成',
      '登记个体经营通常需要准备哪些材料',
      '小店的日常流水和经营所得在账上应该怎么区分',
      '个体经营目前适用的小规模纳税规则具体是什么意思',
      '想做一个简单的家庭收支表通常应该怎么开始',
      '现在个体经营常见的服务费率大概是多少',
      '小店停业或恢复经营一般需要走哪些手续',
      '做经营收入申报时通常要留哪些凭证'
    ]
  },
  {
    id:'commerce_inventory',
    routes:['commercial_transaction','inventory_purchase','inventory_sale'],
    eligible:[
      '我正在谈的这笔供货生意最后能不能顺利定下来',
      '这批库存现在继续补进来对店里合不合适',
      '仓里那批货大概什么时候能比较顺利地走掉',
      '把交易手续费和运输成本都算上，这一单最后还能不能做成',
      '接下来这轮进货能不能按计划把需要的品类补齐',
      '手上这批积压品现在降一点价出掉是不是更合适',
      '和对方谈的采购合同什么时候才可能真正落地',
      '按平台退换货规则继续卖这批货，后面还能不能顺利清掉',
      '这季度店里的库存周转会不会比前一阵顺一些'
    ],
    ineligible:[
      '批发交易里常见的平台佣金一般按多少比例收',
      '采购合同从询价到下单通常有哪些标准步骤',
      '企业采购第一次建供应商档案通常要交哪些资料',
      '购入商品后的运费在会计上一般计入哪个科目',
      '商业合同里的交货条款通常分别代表什么责任',
      '新店建立库存台账一般应该怎么做',
      '跨境采购现在常见的关税和增值税怎么计算',
      '商品退货后重新入库一般要走什么流程',
      '批量出库时通常需要保存哪些单据'
    ]
  },
  {
    id:'credit_debt',
    routes:['borrow_money','lend_money','debt_collection','debt_repayment'],
    eligible:[
      '我眼下这笔周转缺口能不能从熟人那里顺利补上',
      '朋友来找我借这笔钱，我现在答应他到底妥不妥',
      '之前借出去的那笔款大概什么时候有机会回到我手里',
      '把提前还款手续费也考虑进去，我今年把这笔债清掉会不会更顺',
      '我现在背着的这笔欠款接下来能不能逐步减下来',
      '这次对方提出分期还我，我接受这个安排合不合适',
      '最近需要的周转款什么时候比较可能凑到',
      '按照现在合同里的逾期条款继续催款，这笔钱后面还能不能收回来',
      '未来半年我和这笔债务之间的压力会不会明显小一些'
    ],
    ineligible:[
      '个人借款现在常见的年化利率通常怎么换算',
      '向银行申请消费贷款一般要经过哪些步骤',
      '办理个人贷款通常需要收入证明之外的哪些材料',
      '借款利息在个人记账时一般应该怎么分类',
      '合同里的等额本息和等额本金分别是什么意思',
      '第一次做个人还款计划通常应该怎么排',
      '逾期利息一般是按照什么公式计算的',
      '债务结清后申请开具结清证明通常走什么流程',
      '向对方催收欠款时通常应该保存哪些书面记录'
    ]
  },
  {
    id:'partnership',
    routes:['partnership'],
    eligible:[
      '我和这个朋友一起做项目以后能不能配合得比较顺',
      '对方邀请我一起开店，我现在加入这段合作合不合适',
      '我们这次合作大概什么时候能真正进入稳定状态',
      '把分成比例和管理费都按现方案执行，这段合作后面还能不能持续',
      '我和这个合伙人接下来会不会越来越容易把事情谈拢',
      '现在继续和他共同投入这件事是不是值得',
      '这次联合项目什么时候比较可能看到明确进展',
      '按照现有退出规则不变，我继续留在这个合伙关系里会不会更稳',
      '未来一年我们两个人的合作会不会比现在顺畅'
    ],
    ineligible:[
      '合伙企业的利润分配一般会涉及哪些税费比例',
      '设立普通合伙企业通常需要经过哪些登记步骤',
      '办理合伙登记时各合伙人通常要准备哪些文件',
      '合伙人投入的资金在账务上一般如何记录',
      '有限合伙人与普通合伙人的责任规则有什么区别',
      '第一次写合作分工表通常应该从哪些栏目开始',
      '合伙企业常见的工商登记费用大概是多少',
      '合伙人退出后办理变更登记通常是什么流程',
      '签合伙协议前一般需要核对哪些基础资料'
    ]
  },
  {
    id:'investment',
    routes:['investment_profit','investment_liquidation','investment_suitability','investment_position_decision','investment_price_trend'],
    eligible:[
      '我现在拿着的这只基金到年底能不能有一段比较像样的收益',
      '这只股票现在继续加一点仓对我合不合适',
      '我手里这项投资大概什么时候比较适合全部退出',
      '把管理费和赎回费都算进去，这只基金继续拿着后面还能不能赚钱',
      '接下来几个月这只股票的价格走势会不会逐步转强',
      '我现在是继续持有还是先减掉一部分更合适',
      '这项投资什么时候比较可能从现在的震荡里走出方向',
      '按照当前赎回规则不变，我下个月全部撤出这只基金能不能顺利完成',
      '未来一段时间我这笔投资整体会不会比现在更有起色'
    ],
    ineligible:[
      '基金申购费和赎回费通常分别按什么比例计算',
      '股票账户第一次开通融资功能一般有哪些步骤',
      '购买场外基金之前通常需要完成哪些风险测评材料',
      '基金分红在个人投资记录里一般应该怎么记',
      '基金里的前端收费和后端收费规则分别是什么意思',
      '想比较两只基金的历史表现一般应该怎么看数据',
      '股票交易的印花税现在具体按多少收取',
      '基金赎回后资金到账通常经历什么流程和时间',
      '办理证券账户销户一般需要准备哪些资料'
    ]
  },
  {
    id:'salary',
    routes:['income_salary'],
    eligible:[
      '我明年的固定工资有没有机会比现在再高一档',
      '公司给了两个薪酬方案，我现在选奖金少但底薪高的那个合不合适',
      '这次调薪结果大概什么时候会真正落实到我的工资里',
      '把个税和社保扣除都考虑进去，我下半年实际到手会不会比现在多',
      '接下来一年我的固定收入会不会出现比较明显的提升',
      '现在为了更高的基本工资去谈一次薪酬调整值不值得',
      '公司这轮薪级调整什么时候比较可能影响到我',
      '按照新的薪酬制度执行后，我每月实际拿到的钱会不会增加',
      '明年我的月度固定收入会不会比今年稳定一些'
    ],
    ineligible:[
      '工资个税一般按什么税率和级距计算',
      '公司调整基本工资通常需要经过哪些审批流程',
      '办理工资卡变更一般需要向公司提交哪些材料',
      '工资单上的应发和实发金额为什么会不一样',
      '薪酬制度里的岗位工资和绩效工资分别是什么意思',
      '想自己核对每月工资通常应该怎么计算',
      '社保个人缴费比例现在一般是多少',
      '工资账户信息变更通常应该先找哪个部门办理',
      '申请收入证明时一般需要提供哪些信息'
    ]
  },
  {
    id:'bonus',
    routes:['income_bonus'],
    eligible:[
      '我今年年底还有没有机会拿到一笔比较完整的年终奖',
      '这次项目奖金可以现在争取，我主动去谈合不合适',
      '公司这笔季度奖励大概什么时候会真正发下来',
      '即使奖金要扣税，我这次最后实际到手会不会仍然比去年多',
      '接下来这轮绩效奖金我会不会拿到比上次更好的结果',
      '现在为了奖金分配去和主管沟通是不是合适',
      '这个项目结束以后额外奖励什么时候比较可能到账',
      '按公司现行奖金规则不变，我今年还能不能拿到这一份奖励',
      '明年的额外奖励收入会不会比今年更有起色'
    ],
    ineligible:[
      '年终奖单独计税时通常按什么方法计算',
      '公司发放项目奖金一般需要经过哪些审批环节',
      '申请绩效复核通常需要准备哪些证明材料',
      '奖金在工资单里为什么有时会和基本工资分开列示',
      '绩效奖金制度里的系数规则通常是什么意思',
      '想核对自己的奖金金额一般应该怎么查',
      '季度奖金常见的个人所得税扣税比例怎么确定',
      '奖金发放延期时员工通常通过什么流程查询',
      '申请奖金异议时一般要提交哪些资料'
    ]
  },
  {
    id:'delivery',
    routes:['receive_item'],
    eligible:[
      '我订的那台书桌这周能不能顺利送到家',
      '这件家具可以改成自提，我现在改方式合不合适',
      '前几天买的柜子大概什么时候能真正收到',
      '即使到货还要补一笔进口税，这个包裹后面能不能顺利交到我手里',
      '这次快递延误以后还会不会在原计划附近到达',
      '商家让我改约配送日期，我选下周再送是不是更合适',
      '这批货什么时候比较可能完成最后一段配送',
      '按照现在的清关流程继续走，我这个海外包裹还能不能正常收到',
      '接下来几天这件一直没动的快递会不会重新开始派送'
    ],
    ineligible:[
      '国际包裹的进口税通常按照什么金额和税率计算',
      '快递改约配送日期一般要经过哪些操作步骤',
      '到网点自提包裹通常需要携带哪些证件',
      '物流信息里的清关完成和放行分别代表什么状态',
      '快递公司的保价规则一般是怎么规定赔付范围的',
      '第一次寄国际包裹通常应该怎么填写申报信息',
      '大件家具配送的上楼费一般按什么标准收取',
      '海外包裹进入海关以后通常还要经过哪些流程',
      '代领快递时一般需要准备哪些证明材料'
    ]
  },
  {
    id:'purchase',
    routes:['item_purchase'],
    eligible:[
      '我最近看的这台电脑现在买下来对我是不是合适',
      '这把椅子有两个版本，我选贵一点的那个值不值得',
      '我准备换的这台家电大概什么时候入手更合适',
      '把延保费用也算进去，这台机器现在买下来以后会不会让我觉得值得',
      '这个月买这件东西会不会比再拖一阵更省心',
      '现在直接下单还是等下一次促销对我更合适',
      '我看中的这款设备什么时候买比较可能更顺手',
      '按照商家的退换货规则来看，我现在先买回去试用合不合适',
      '这次把预算花在这件东西上以后会不会觉得选择对了'
    ],
    ineligible:[
      '这类电脑的延长保修一般每年收费多少',
      '网购商品申请七天退货通常要经过哪些步骤',
      '门店办理以旧换新一般需要带哪些材料',
      '购买家电后的发票信息如果写错一般怎么处理',
      '平台的价保规则通常在什么情况下可以申请',
      '第一次比较两款电脑配置通常应该怎么看参数',
      '分期购买商品的手续费通常怎么计算',
      '线上订单改成门店自提一般是什么操作流程',
      '申请商品保修时通常需要提供哪些凭证'
    ]
  },
  {
    id:'relationship',
    routes:['relationship_development'],
    eligible:[
      '我和这个人接下来有没有机会真的走得更近',
      '我们现在关系有点暧昧，我主动把话说明白合不合适',
      '我和她大概什么时候可能从现在这种状态进入更明确的关系',
      '即使我们两边工作安排都很麻烦，这段关系后面还能不能继续发展',
      '未来几个月我们之间会不会比现在更有默契',
      '现在约他认真谈一次彼此的想法是不是合适',
      '我们这段关系什么时候比较可能出现明确转折',
      '按照现在各自的生活安排继续相处，我们后面还能不能逐步靠近',
      '明年我和这个人的感情状态会不会比今年更清楚'
    ],
    ineligible:[
      '情侣共同旅行的费用通常怎么分摊比较常见',
      '办理同居地址变更一般需要经过哪些行政步骤',
      '共同租房签约时双方一般要准备哪些身份证明',
      '两个人共同支付房租时记账一般怎么分比较清楚',
      '租房合同里关于共同居住人的规则通常是什么意思',
      '第一次和伴侣做共同预算通常应该怎么开始',
      '情侣共同账户常见的手续费大概是多少',
      '共同租约增加一个承租人通常要走什么流程',
      '双方共同申请住房时一般需要提供哪些资料'
    ]
  },
  {
    id:'marriage',
    routes:['marriage_match','marital_relationship'],
    eligible:[
      '我和现在的对象以后有没有机会真正结成婚姻',
      '我们已经在一起很久了，我现在主动谈结婚这件事合不合适',
      '我和伴侣大概什么时候可能把婚事正式定下来',
      '即使登记还牵涉很多手续，我们这段关系后面能不能顺利走到结婚',
      '我和配偶接下来一年的相处会不会比现在缓和一些',
      '现在为了改善婚后相处重新分配家务是不是合适',
      '我们这段婚姻什么时候比较可能走出最近的僵局',
      '按照目前家庭开支的分担方式继续生活，我们夫妻关系后面还能不能稳定',
      '未来一年我和另一半之间会不会比现在更容易沟通'
    ],
    ineligible:[
      '结婚登记现在通常需要缴纳哪些费用',
      '办理结婚登记一般需要先预约还是可以直接去',
      '登记结婚时双方通常需要携带哪些证件和材料',
      '夫妻共同生活后的家庭支出在记账时一般怎么分类',
      '婚姻登记里的户籍地办理规则具体是什么意思',
      '准备婚礼预算通常应该从哪些项目开始列',
      '婚姻登记相关证明补办一般需要多少费用',
      '变更婚姻状态后的各类证件通常先办哪一步',
      '办理夫妻共同贷款时一般需要提交哪些资料'
    ]
  }
];

assert(groups.length === 11, `contrast group count ${groups.length} != 11`);
const inventoryRoutes = new Set(inventory.routes.map((row) => row.routeId));
const coveredRoutes = new Set();
for (const group of groups) {
  assert(group.eligible.length === 9 && group.ineligible.length === 9, `${group.id} must contain 9 paired examples`);
  for (const routeId of group.routes) {
    assert(inventoryRoutes.has(routeId), `unknown route coverage ${routeId}`);
    coveredRoutes.add(routeId);
  }
}
assert(coveredRoutes.size === 22, `Semantic Act contrast coverage routes ${coveredRoutes.size} != 22`);

const trainingRows = [];
const calibrationRows = [];
let trainingIndex = 1;
let calibrationIndex = 1;
for (const group of groups) {
  for (let index = 0; index < 9; index += 1) {
    const split = index < 6 ? 'training' : 'calibration';
    const target = split === 'training' ? trainingRows : calibrationRows;
    const pairNo = index + 1;
    const contrastGroup = `${group.id}:pair_${String(pairNo).padStart(2, '0')}`;
    const eligibleId = split === 'training'
      ? `V013-V04-SA-T-${String(trainingIndex++).padStart(3, '0')}`
      : `V013-V04-SA-C-${String(calibrationIndex++).padStart(3, '0')}`;
    const ineligibleId = split === 'training'
      ? `V013-V04-SA-T-${String(trainingIndex++).padStart(3, '0')}`
      : `V013-V04-SA-C-${String(calibrationIndex++).padStart(3, '0')}`;
    target.push({
      id:eligibleId,
      text:group.eligible[index],
      label:'eligible_divination_outcome_or_decision',
      actFamily:eligibleFamilies[index],
      domainFamily:group.id,
      contrastGroup,
      split,
      routeCoverage:[...group.routes],
      provenance:'fresh_v04_manual_semantic_act_contrast'
    });
    target.push({
      id:ineligibleId,
      text:group.ineligible[index],
      label:'ineligible_information_or_procedure',
      actFamily:ineligibleFamilies[index],
      domainFamily:group.id,
      contrastGroup,
      split,
      routeCoverage:[...group.routes],
      provenance:'fresh_v04_manual_semantic_act_contrast'
    });
  }
}

assert(trainingRows.length === schema.splitPolicy.training.plannedRows, `training rows ${trainingRows.length}`);
assert(calibrationRows.length === schema.splitPolicy.calibration.plannedRows, `calibration rows ${calibrationRows.length}`);

const basePolicy = {
  createdAfterDataContractFreeze:true,
  generatedWithoutReadingCandidateV03FailureRows:true,
  independentEvaluationRead:false,
  sealedBlindEvaluationRead:false,
  newThemeResearchImported:false,
  traditionalLiuYaoFeaturesUsed:false,
  encoderScoringPerformed:false
};

writeJson('data/liuyao-semantic-v013-candidate-v04-semantic-act-training.json', {
  version:'0.13-candidate-v0.4-semantic-act-training-v0.1',
  status:'presealed_training_data',
  sealed:false,
  scope:'liuyao_semantic_act_eligibility_v0.1',
  schemaVersion:schema.version,
  policy:{
    ...basePolicy,
    useForSemanticActWeightTraining:true,
    useForSemanticActThresholdSelection:false,
    useForFallbackIdentityTraining:false
  },
  rows:trainingRows
});
writeJson('data/liuyao-semantic-v013-candidate-v04-semantic-act-calibration.json', {
  version:'0.13-candidate-v0.4-semantic-act-calibration-v0.1',
  status:'presealed_calibration_data',
  sealed:false,
  scope:'liuyao_semantic_act_eligibility_v0.1',
  schemaVersion:schema.version,
  policy:{
    ...basePolicy,
    useForSemanticActWeightTraining:false,
    useForSemanticActThresholdSelection:true,
    useForFallbackIdentityTraining:false,
    mayChooseOnlyOneGlobalSemanticActThreshold:true
  },
  rows:calibrationRows
});

console.log('Candidate v0.4 Semantic Act v0.1 fresh corpora generated without encoder scoring.');
console.log(`- training rows: ${trainingRows.length}`);
console.log(`- calibration rows: ${calibrationRows.length}`);
console.log(`- contrast groups: ${groups.length}; route coverage: ${coveredRoutes.size}/22`);
