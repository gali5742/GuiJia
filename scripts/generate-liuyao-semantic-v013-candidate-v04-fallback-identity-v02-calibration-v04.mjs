import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const schemaPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.4.json';
const outputPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4.json';
const schema=JSON.parse(fs.readFileSync(path.join(root,schemaPath),'utf8'));
if(schema.status!=='frozen_after_v03_sealed_reachability_failure_before_new_calibration_generation') throw new Error('calibration v0.4 schema is not frozen');

const routeConfig={
  financial_fortune:{family:'general_finance',axis:'overall_personal_financial_state_not_single_transaction',scenarios:[
    ['这一年我花销一直压得比较紧','逐渐宽松一些','比现在轻松'],['最近总觉得钱不太经用','慢慢缓过来','不再这么紧'],['眼下日子过得有些拮据','好转一些','更从容一点'],['今年前半段用钱总要算着来','后半段松一点','不那么吃紧'],['最近家里用钱安排得很紧','越来越好周转','慢慢有些余地']
  ]},
  business_operation:{family:'general_finance',axis:'ongoing_venture_viability_not_single_trade_or_partner_choice',scenarios:[
    ['这间铺面最近客人少了不少','继续撑得住','慢慢稳下来'],['我每天守着的这个地方这阵子有些冷清','后面做得下去','往后稳一些'],['这处小馆最近来的人忽多忽少','继续维持下去','逐渐站稳'],['我手上这门活最近起伏很大','长期做下去','后面稳住'],['这处卖东西的地方最近周转有点慢','继续撑下去','慢慢恢复正常']
  ]},
  commercial_transaction:{family:'general_finance',axis:'specific_trade_completion_between_counterparties',scenarios:[
    ['我和对方谈的那批东西还差最后一点条件','把这回事谈拢','最后定下来'],['对方已经看过东西但还没表态','最后点头把这事做下去','把眼前这回事说定'],['双方来回说了几轮条件还没一致','最终谈到一个结果','把这件事确定下来'],['我和那边已经把大部分细节说好了','最后达成一致','把剩下的条件说拢'],['这批东西双方都还有一点犹豫','最终把事情定住','最后谈到一块']
  ]},
  inventory_purchase:{family:'inventory_flow',axis:'goods_flow_into_business_stock',scenarios:[
    ['后面做东西缺的原料已经不多了','及时补足','在用完前添够'],['柜台后面常用的耗材快见底了','把缺的部分补上','及时添足'],['接下来几周要用的材料还差一截','在开工前备够','赶在需要前补足'],['架子上常用的小件越来越少','及时添回来','在断档前补够'],['后面一轮要用的包装材料还没备全','按时补足','在需要前添齐']
  ]},
  inventory_sale:{family:'inventory_flow',axis:'goods_flow_out_of_existing_business_stock',scenarios:[
    ['后屋压着的旧款已经放了很久','慢慢走出去','逐步减少'],['角落堆着的几箱旧品一直没动','陆续走掉','一点点腾空'],['架子上剩下的老款还有不少','后面慢慢消化掉','逐渐变少'],['上一批剩下的旧品还占着地方','陆续走出去','慢慢腾出位置'],['后面放着的过季东西还有几箱','逐步走掉','慢慢减少']
  ]},
  borrow_money:{family:'money_direction',axis:'money_moves_from_other_to_querent_as_temporary_funding',scenarios:[
    ['眼下差的这一截让我有点难安排','有人先替我顶上','暂时有人帮我补住'],['最近这个缺口卡住了后面的安排','有人先帮我托住','临时得到一把支持'],['这阵子手里正好差一小段','有人愿意先替我垫住','先有人帮我接上'],['眼前这段空档让我周转不开','有人先帮我撑过去','临时有人替我补住'],['这两周正好缺一截可用的钱','有人先帮我接上','暂时有人替我顶过']
  ]},
  lend_money:{family:'money_direction',axis:'money_moves_from_querent_to_other_as_temporary_funding',scenarios:[
    ['朋友最近手上转不开来找我商量','我先拿一点给他顶着合宜','我先给他一部分周转妥当'],['熟人眼下正差一截想让我帮忙','我先拿一笔给他撑着合适','我先给他一些应急稳妥'],['对方最近碰上短暂缺口来问我','我先给一部分让他顶过去妥当','我先拿一点帮他接上合宜'],['朋友这阵子正好卡在一段空档','我先拿些给他周转稳妥','我先帮他垫一阵合适'],['熟人最近临时差一点可用的钱','我先拿一部分给他顶着妥当','我先帮他补这一截合宜']
  ]},
  debt_collection:{family:'money_direction',axis:'previously_owed_money_returns_to_querent',scenarios:[
    ['早前放在对方手里的那一笔已经很久没动','重新回到我这里','最终回到我手里'],['之前留在那边的那一份一直没有回来','后来重新回我这边','最后回到我这里'],['去年放到对方那里的那笔现在还在外面','重新回到我手上','后面回我这里'],['先前留在别人手里的那部分拖了很久','最终回到我这里','慢慢回到我手里'],['早些时候交到对方那边的那一笔一直没回来','后来回到我这里','最终回我手上']
  ]},
  debt_repayment:{family:'money_direction',axis:'querent_clears_own_existing_obligation',scenarios:[
    ['压在我这边很久的那笔账一直没有收尾','彻底了结','最终清爽下来'],['我名下挂着的那笔账拖了一段时间','今年彻底结束','后面顺利收尾'],['一直压着我的那份账目还没处理完','最终了结掉','慢慢处理干净'],['这笔挂在我这里的旧账让我一直惦记','后面彻底收尾','最终结束'],['我这边还有一笔长期挂着的账','今年处理干净','后面彻底了结']
  ]},
  partnership:{family:'partnership_operation',axis:'whether_to_or_can_operate_jointly_with_specific_partner',scenarios:[
    ['我和他各自拿一部分东西来做这件事','长期配合下去','把这件事共同做稳'],['我们两边准备各自出一部分资源做这件事','后面配合得住','长期把事情做下去'],['我和这个人准备两边分工来做同一件事','后面合作顺当','长期配合稳定'],['我们各自负责一块准备把这件事做起来','往后配合得稳','后面能长期做'],['我和他想把两边手里的资源并到这件事上','后面协作顺利','长期配合下去']
  ]},
  investment_profit:{family:'investment_goal',axis:'return_or_gain_from_investment',scenarios:[
    ['我之前放进去的那份钱已经放了一阵','以后多带回来一些','后面有所增加'],['前段时间放进去的那部分现在还在那里','往后多回来一点','最后有所增长'],['我留在里面的那份钱暂时没动','过阵子多出一些','以后给我带回更多'],['之前放进去的那一份我准备再放一段','最终增加一点','后面多带回来一些'],['我前些日子放进去的那部分现在还留着','以后比现在多一些','后面有些增加']
  ]},
  investment_liquidation:{family:'investment_goal',axis:'exit_or_sell_out_existing_investment',scenarios:[
    ['我手里那一份现在想整个退出来','顺利收回','完整拿回来'],['之前留着的那一份我准备全部退出','顺当地回到我这里','完整退回'],['我想把现在手上的这一份一次都退出去','顺利结束','全部收回来'],['手里这一份我不准备再留了','完整退出来','顺利回到我这里'],['我准备把现在留着的那一份全部撤出来','顺利拿回','完整结束']
  ]},
  investment_suitability:{family:'investment_goal',axis:'whether_entering_or_holding_investment_is_suitable',scenarios:[
    ['眼前这个去处我正考虑把钱放进去','对我合宜','对我稳妥'],['我在考虑要不要把一部分钱放到这个里面','对我合适','和我现在的情况相称'],['这个地方我还没决定要不要放钱进去','对我妥当','适宜我现在参与'],['我正犹豫要不要把手里一部分放进这里','对我稳当','和我目前状况相合'],['眼前这个选择需要我放一部分钱进去','对我合宜','适宜我现在进入']
  ]},
  investment_position_decision:{family:'investment_goal',axis:'increase_reduce_or_hold_position_choice',scenarios:[
    ['手上那一份我还没想好留多少','多留一点更稳','少留一点更妥'],['我现在留着的这一份还有些犹豫','继续多放一些更好','先收一点回来更稳'],['这份东西我目前只留了一部分','再多留一些更合适','先少留一些更妥'],['手里这一份我准备重新分配多少','多放一点更稳当','收回一点更合宜'],['现在留下的这一份让我拿不准比例','再多留一点更合适','先少留一点更稳']
  ]},
  investment_price_trend:{family:'investment_goal',axis:'future_market_price_direction',scenarios:[
    ['手上这一份最近上下不定','往高处走','逐渐抬高'],['我一直看着的这一份这几天变化很快','后面抬起来','往上走一些'],['手里这个东西最近时高时低','接下来往高处去','后面逐渐抬升'],['这一份最近来回变化让我看不清','之后抬高一些','往上走'],['我留意的这个最近一阵忽高忽低','后面走高一点','接下来慢慢抬起来']
  ]},
  income_salary:{family:'employment_income',axis:'recurring_fixed_employment_pay',scenarios:[
    ['公司每个月固定给我的那一份已经很久没变','以后多一些','后面增加一点'],['我每月从公司固定拿到的那一部分一直一样','往后提高一些','之后多一点'],['公司按月固定给我的那份钱现在还是原样','后面有所增加','以后比现在多'],['每个月公司固定发给我的那部分一直没动','接下来多一点','后面提高一些'],['我按月从公司拿的固定那一份最近没有变化','以后增加一点','往后多一些']
  ]},
  income_bonus:{family:'employment_income',axis:'nonrecurring_additional_employment_reward',scenarios:[
    ['公司年底另外给的那一份今年还没消息','最后落到我这里','今年还能有我的份'],['这次事情做完后公司另外给的一份还没定','最终给到我这里','后面有我的份'],['公司说年末可能会另外给一部分','今年落到我手里','最后轮到我'],['这个项目收尾后公司会另外分一份','最终有我的一份','后面给到我这里'],['今年公司额外给的那部分现在还没确定','最后能有我的份','最终落到我这边']
  ]},
  receive_item:{family:'item_flow',axis:'arrival_or_receipt_of_already_expected_item',scenarios:[
    ['我前几天下单的电脑店家已经确认','这周来到我这里','这几天到我这边'],['我已经下单的书桌那边说在安排','下周来到我这里','最近几天到我这边'],['前两天我下单的相机店家已经确认有货','周末前来到我这里','这周到我这边'],['我已经下单的显示器商家那边确认过了','这两天来到我这里','本周到我这边'],['我前几天下单的键盘店家说已经处理','很快来到我这里','这周到我这边']
  ]},
  item_purchase:{family:'item_flow',axis:'whether_to_acquire_or_buy_item',scenarios:[
    ['这个显示器我已经看了几天','现在收下它合适','现在把它带回去妥当'],['这台相机我比较了好一阵','现在收下它值得','现在把它带走合适'],['这个键盘我犹豫了几天','现在拿下它妥当','现在把它带回去合适'],['这台电脑我看了几个不同版本','现在收下这台合宜','现在把它拿走妥当'],['这个耳机我已经试过几次','现在收下它合适','现在把它带回去稳妥']
  ]},
  relationship_development:{family:'relationship_stage',axis:'pre_marriage_romantic_progression',scenarios:[
    ['我和她现在联系得比以前多了','慢慢走得更近','关系再往前一点'],['我跟这个人最近见面的次数多起来','后面更亲近','彼此距离再近一些'],['我们两个人最近相处得越来越自然','以后更进一步','关系慢慢靠近'],['我和她最近开始常常单独见面','之后走得更近','彼此再靠近一些'],['我跟她现在比以前熟了很多','后面关系更深一点','以后更亲近']
  ]},
  marriage_match:{family:'relationship_stage',axis:'whether_relationship_reaches_formal_marriage',scenarios:[
    ['我和她已经走了很长一段','以后真正成为一家人','最后把两边生活合到一处'],['我们两个人相处了好几年','最终成为一家人','以后正式把生活并到一处'],['我跟她已经认真走了一段时间','以后真正组成一个家','最后把日子放到一处'],['我们两边已经见过彼此家里的人','最终成为一家人','以后把生活正式合起来'],['我和她都在认真考虑以后','后面真正组成一个家','最后把两边日子合到一处']
  ]},
  marital_relationship:{family:'relationship_stage',axis:'quality_or_change_inside_existing_marriage',scenarios:[
    ['我们已经共同过了很多年日子最近有些僵','往后相处缓和下来','后面重新和顺一些'],['两个人共同生活多年这阵子总是说不到一块','以后相处松下来','后面更和气'],['我们把日子过在一处已经很多年最近摩擦多','之后慢慢缓和','往后相处顺一点'],['两个人一起过日子多年最近彼此有点疏远','后面重新靠近','以后相处和缓'],['我们共同生活了很长时间最近常有小冲突','往后慢慢和顺','后面缓下来']
  ]}
};

const knownRows=[];
let knownId=1;
for(const [routeId,config] of Object.entries(routeConfig)){
  for(let i=0;i<config.scenarios.length;i+=1){
    const [subject,outcomeA,outcomeB]=config.scenarios[i];
    const texts=[`${subject}，接下来会不会${outcomeA}`,`${subject}，往后能不能${outcomeB}`];
    for(let frame=0;frame<texts.length;frame+=1){
      knownRows.push({
        id:`V04-FI-C4-${String(knownId++).padStart(3,'0')}`,
        text:texts[frame],
        identityLabel:'route_identity_positive',
        expectedRoute:routeId,
        subtype:'fallback_stage_known',
        confusableFamily:config.family,
        semanticAxis:config.axis,
        wordingPattern:`scenario_${i+1}_frame_${frame+1}`
      });
    }
  }
}

const nearAnchors={
  financial_fortune:'日常钱款记录',business_operation:'铺面每天的杂项记录',commercial_transaction:'客户往来资料',inventory_purchase:'补充物料的登记',inventory_sale:'后屋旧品的编号',borrow_money:'临时周转记录',lend_money:'朋友周转记录',debt_collection:'往来款记录',debt_repayment:'名下账目记录',partnership:'两个人的分工记录',investment_profit:'基金持有记录',investment_liquidation:'基金账户资料',investment_suitability:'投资资料分类',investment_position_decision:'股票观察记录',investment_price_trend:'基金每日记录',income_salary:'公司每月固定给款的记录',income_bonus:'公司额外给款的记录',receive_item:'网购订单资料',item_purchase:'想看的设备清单',relationship_development:'两个人的见面安排',marriage_match:'两个人的家庭事项记录',marital_relationship:'共同生活的家务安排'
};
const operationalChoices=[
  '按日期分开而不是混在一处','单独放一栏而不是并进总表','每周整理一次而不是月底集中整理','用编号标记而不是只写名称','按对象分组而不是按先后顺序排列'
];
const operationalFrames=[
  (anchor,choice)=>`我准备把${anchor}${choice}，以后处理起来会不会更省事`,
  (anchor,choice)=>`${anchor}如果改成${choice}，长期用下来会不会更不容易乱`,
  (anchor,choice)=>`以后${anchor}采用${choice}的方式，实际用起来会不会更顺手`,
  (anchor,choice)=>`我想让${anchor}${choice}，这样持续一段时间会不会更清楚`
];
const nearRows=[];
let nearId=knownRows.length+1;
for(const [routeFamily,anchor] of Object.entries(nearAnchors)){
  for(let choiceIndex=0;choiceIndex<operationalChoices.length;choiceIndex+=1){
    for(let frameIndex=0;frameIndex<operationalFrames.length;frameIndex+=1){
      nearRows.push({
        id:`V04-FI-C4-${String(nearId++).padStart(3,'0')}`,
        text:operationalFrames[frameIndex](anchor,operationalChoices[choiceIndex]),
        identityLabel:'non_route',expectedRoute:null,subtype:'near_domain_not_current_route',
        confusableFamily:`near_${routeFamily}`,
        semanticAxis:'domain_dense_operational_decision_outside_current_route_identity',
        wordingPattern:`${routeFamily}_choice_${choiceIndex+1}_frame_${frameIndex+1}`,
        pressureFamily:routeFamily
      });
    }
  }
}

const outsideTexts=[
  '这次资格复审最后能不能通过','下周搬去新的住处会不会顺利','这次公开演讲最后能不能正常完成','月底参加的比赛能不能进入下一轮','这次租房申请最后能不能批下来','我准备投稿的短篇这次能不能入选','下个月的驾照考试最后能不能过','这次学校申请能不能拿到录取','我参加的评选最后能不能进入名单','这趟出行能不能按原计划完成','这次签证续签最后能不能顺利下来','我准备参加的面试最后能不能通过','下周的资格认证能不能一次过','这次作品征集能不能被选中','我报名的课程最终能不能排上名额','这次公开竞赛能不能拿到前几名','我准备申请的宿舍最后能不能分到','月底的答辩能不能顺利通过','这次社团选拔能不能进最终名单','我申请的培训名额最后能不能拿到','这次搬办公室能不能按期完成','我报名的活动最后能不能抽中名额'
];
const unresolvedTexts=[
  '眼前这件事最后能不能顺下来','我现在这个安排往后会不会成','这次这样处理最后会不会有结果','我正在推进的这件事能不能走到底','眼下这个选择以后会不会顺','这件还没定的事最后能不能定下来','我现在考虑的这个方向能不能走通','这次换一种做法最后会不会更好','我手上这件事后面能不能有个好结果','这个安排继续下去会不会顺当','眼前这个决定做下去能不能成','这件事拖了一阵后面能不能解决','我现在推进的计划最终能不能落稳','这次调整以后事情会不会顺起来','眼下这个方案继续做能不能走通','我正在等的结果最后会不会如愿','这件事换个方向以后能不能成','我现在的安排到最后能不能顺利','这次决定继续执行会不会有结果','眼前这个计划后面能不能正常完成','我手里的这件事最终能不能办下来','这次重新安排以后会不会更顺'
];
const extraRows=[];
for(const [subtype,texts] of [['outside_current_22',outsideTexts],['route_unresolved',unresolvedTexts]]){
  for(const text of texts){
    extraRows.push({
      id:`V04-FI-C4-${String(nearId++).padStart(3,'0')}`,
      text,identityLabel:'non_route',expectedRoute:null,subtype,
      confusableFamily:subtype,
      semanticAxis:subtype==='outside_current_22'?'eligible_outcome_outside_current_22_routes':'eligible_but_route_identity_unresolved',
      wordingPattern:`${subtype}_${extraRows.filter((r)=>r.subtype===subtype).length+1}`
    });
  }
}

const rows=[...knownRows,...nearRows,...extraRows];
if(knownRows.length!==220) throw new Error(`known rows ${knownRows.length} !=220`);
if(nearRows.length!==440) throw new Error(`near rows ${nearRows.length} !=440`);
if(outsideTexts.length!==22||unresolvedTexts.length!==22) throw new Error('outside/unresolved counts drift');
if(rows.length!==704) throw new Error(`rows ${rows.length} !=704`);

const artifact={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-calibration-v0.4',
  status:'presealed_fallback_stage_calibration',
  sealed:false,
  schema:schemaPath,
  policy:{
    encoderScoringObserved:false,
    semanticActProbabilityUsedForGeneration:false,
    routeabilityProbabilityUsedForGeneration:false,
    fallbackIdentityProbabilityUsed:false,
    v03CalibrationTextReadForGeneration:false,
    v03ReachabilityRowResultsRead:false,
    candidateV03FailureRowsRead:false,
    independentEvaluationRead:false,
    sealedBlindEvaluationRead:false,
    routerTopKUsedForGeneration:false,
    aggregateFailureEvidenceOnly:true
  },
  sampling:{
    totalRows:704,routeKnown:220,knownPerRoute:10,nearDomain:440,nearDomainPerRouteFamily:20,outsideCurrent22:22,routeUnresolved:22,
    nearDomainComposition:{operationalChoices:5,sentenceFrames:4,routeFamilies:22}
  },
  rows
};
fs.writeFileSync(path.join(root,outputPath),`${JSON.stringify(artifact,null,2)}\n`,'utf8');
console.log('Candidate v0.4 Fallback Identity v0.2 fresh stage-specific calibration v0.4 generated without encoder scoring.');
console.log('- rows: 704 = 220 known (10/route) + 440 near-domain (20/family) + 22 outside-current22 + 22 unresolved');
console.log('- v0.3 calibration text and v0.3 row-level reachability results were not read for generation.');
console.log('- model probabilities / Router TopK used for generation: 0');
