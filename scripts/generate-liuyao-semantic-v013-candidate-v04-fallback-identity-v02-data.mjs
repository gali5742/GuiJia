import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.1.json'), 'utf8'));
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'data/liuyao-semantic-route-inventory-v0.2.json'), 'utf8'));

const TRAIN_PATH = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-training-augmentation.json';
const CAL_PATH = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration.json';
const routeIds = inventory.routes.map((row) => row.routeId);
if (routeIds.length !== 22) throw new Error(`route inventory ${routeIds.length} != 22`);

const familyOf = (routeId) => {
  for (const [family, routes] of Object.entries(schema.confusableFamilies)) if (routes.includes(routeId)) return family;
  throw new Error(`no confusable family for ${routeId}`);
};
const axisOf = (routeId) => schema.requiredSemanticAxes?.[routeId]?.[0];

const known = {
  financial_fortune: {
    train: [
      ['往后这段日子我手里的钱会不会渐渐宽些','state_change'],
      ['今年接下来我在钱上能不能比前阵轻松','period_comparison'],
      ['后面一阵我的经济余地会不会慢慢多起来','capacity_change'],
      ['未来几个月我日常花用会不会没那么紧','daily_condition'],
      ['今年余下的时间手头状况能不能缓过来','recovery_outcome'],
      ['接下来这半年我整体财务会不会往好处走','overall_trend']
    ],
    calibration: [
      ['往后几个月我手里的余量会不会增加','capacity_change_cal'],
      ['今年后半程钱上的压力能不能缓下来','pressure_change_cal'],
      ['接下来一段时间我的经济状况会不会好转','overall_trend_cal'],
      ['以后这阵子日常开销会不会更从容些','daily_condition_cal']
    ]
  },
  business_operation: {
    train: [
      ['我现在做的这门小生意后面还能不能维持住','venture_survival'],
      ['这家店接下来一年能不能继续开得下去','venture_duration'],
      ['手上这摊经营往后有没有机会慢慢稳定','venture_stability'],
      ['这个小项目继续做下去能不能撑出局面','venture_development'],
      ['我自己经营的这块事情后面会不会越做越顺','venture_trend'],
      ['这份自己做的营生以后还能不能持续','venture_continuity']
    ],
    calibration: [
      ['这家小店往后还能不能稳稳做下去','venture_stability_cal'],
      ['我现在经营的这摊事明年还能不能继续','venture_duration_cal'],
      ['这门自己做的生意以后会不会慢慢站住','venture_development_cal'],
      ['手里的经营项目接下来能不能保持下去','venture_continuity_cal']
    ]
  },
  commercial_transaction: {
    train: [
      ['我和对方正在谈的这笔买卖最后能不能定成','trade_completion'],
      ['这次双方谈的货物交易会不会顺利成交','trade_result'],
      ['眼前这桩生意对方最后会不会跟我做成','counterparty_completion'],
      ['这笔具体的交易后面能不能真正落下来','deal_closure'],
      ['跟这个客户谈的单子最后有没有机会成交','client_deal'],
      ['这次买卖双方能不能把事情正式敲定','agreement_completion']
    ],
    calibration: [
      ['和这个客户谈的这单最后能不能成交','client_deal_cal'],
      ['双方眼前这笔交易后面会不会做成','trade_result_cal'],
      ['这桩具体买卖最终能不能落定','deal_closure_cal'],
      ['我跟对方谈的货物生意最后能不能成','counterparty_completion_cal']
    ]
  },
  inventory_purchase: {
    train: [
      ['店里下一批缺的货后面能不能顺利补进来','stock_in_replenish'],
      ['仓库准备补上的那批商品能不能按计划到齐','stock_in_arrival'],
      ['下一轮经营要用的货能不能及时备进仓里','stock_in_timing'],
      ['这次给店里补货最后能不能把数量凑全','stock_in_quantity'],
      ['准备进到店里的那批东西后面会不会顺利到位','stock_in_outcome'],
      ['铺面下一阶段需要的货源能不能补足','stock_in_supply']
    ],
    calibration: [
      ['店里接下来要补的货能不能及时到齐','stock_in_timing_cal'],
      ['下一批准备进仓的商品最后能不能备全','stock_in_quantity_cal'],
      ['这轮补货能不能顺利把缺的东西补上','stock_in_replenish_cal'],
      ['铺面后面需要的那批货能不能进得来','stock_in_supply_cal']
    ]
  },
  inventory_sale: {
    train: [
      ['仓里现有这批货后面能不能慢慢卖出去','stock_out_sale'],
      ['店里积着的商品接下来会不会逐步走掉','stock_out_clear'],
      ['手上这批库存以后能不能顺利出掉','stock_out_outcome'],
      ['仓库占着的旧货往后能不能一点点消下去','stock_out_reduction'],
      ['店里现在剩的那些货后面有没有机会清掉','stock_out_clearance'],
      ['这批已经进来的商品接下来能不能卖得动','stock_out_velocity']
    ],
    calibration: [
      ['仓里这批现货以后能不能逐渐卖掉','stock_out_sale_cal'],
      ['店里积下来的商品后面能不能清出去','stock_out_clearance_cal'],
      ['这批库存接下来会不会慢慢减少','stock_out_reduction_cal'],
      ['已经进店的这批货后面能不能卖得动','stock_out_velocity_cal']
    ]
  },
  borrow_money: {
    train: [
      ['我眼下这个资金缺口能不能从别人那里先借到','inbound_temporary_funding'],
      ['最近差的这笔钱有没有人愿意先借给我周转','counterparty_lends_to_querent'],
      ['手头不足的部分我能不能临时向熟人借来','borrow_from_other'],
      ['这阵子缺钱，我能不能从家里先借一笔顶过去','borrow_from_family'],
      ['眼前差的资金能不能找到人先借给我用','borrow_availability'],
      ['我现在需要周转的这笔钱能不能借得到','borrow_success']
    ],
    calibration: [
      ['我现在差的这笔钱能不能从朋友那里借到','borrow_from_other_cal'],
      ['眼下的资金缺口有没有人能先借我一笔','borrow_availability_cal'],
      ['最近周转需要的钱我能不能借得到','borrow_success_cal'],
      ['手头不够的部分能不能先从家里借来','borrow_from_family_cal']
    ]
  },
  lend_money: {
    train: [
      ['朋友来找我借钱，我把钱借给他合不合适','outbound_temporary_funding'],
      ['熟人想从我这里周转一笔，我现在借出去妥不妥','querent_lends_to_other'],
      ['同事开口借钱，我把这笔钱给他先用会不会有问题','lend_risk'],
      ['亲戚最近缺钱，我借一笔给他应急是否合适','lend_decision'],
      ['有人想向我借这笔钱，我现在答应下来好不好','lend_acceptance'],
      ['对方需要周转，我把钱临时借出去会不会顺利','lend_outcome']
    ],
    calibration: [
      ['朋友想借我一笔钱，我现在借给他妥不妥','lend_decision_cal'],
      ['熟人来借钱，我答应把钱借出去好不好','lend_acceptance_cal'],
      ['同事缺钱，我借给他周转会不会有麻烦','lend_risk_cal'],
      ['对方来找我借钱，这笔钱借出去合不合适','querent_lends_to_other_cal']
    ]
  },
  debt_collection: {
    train: [
      ['别人之前欠我的那笔钱后面还能不能收回来','owed_money_returns'],
      ['对方一直没还给我的款以后能不能要回来','collect_receivable'],
      ['早些时候借出去的钱最后还能不能回到我手里','old_lend_return'],
      ['那笔已经到期的应收款接下来能不能拿回来','receivable_recovery'],
      ['对方拖着的欠款后面有没有机会还给我','debtor_repayment_to_querent'],
      ['之前该给我的那笔钱最终能不能追回来','recovery_outcome']
    ],
    calibration: [
      ['对方欠我的那笔钱以后能不能收回来','collect_receivable_cal'],
      ['之前借出去的钱最终还能不能回到我这里','old_lend_return_cal'],
      ['那笔拖着没还的欠款后面能不能追回','recovery_outcome_cal'],
      ['已经到期的应收款接下来能不能拿到','receivable_recovery_cal']
    ]
  },
  debt_repayment: {
    train: [
      ['我自己现在背着的这笔债后面能不能还清','own_obligation_clear'],
      ['手上的欠款今年能不能全部结掉','own_debt_completion'],
      ['我欠出去的这笔钱接下来能不能顺利还完','querent_repayment'],
      ['压在我身上的那笔债务以后能不能清掉','obligation_release'],
      ['目前这笔需要我偿还的钱年底前能不能了结','repayment_timing'],
      ['我自己的这项欠款后面会不会彻底结束','own_debt_end']
    ],
    calibration: [
      ['我现在欠着的这笔钱以后能不能还清','own_obligation_clear_cal'],
      ['这项需要我偿还的欠款能不能顺利结掉','querent_repayment_cal'],
      ['压在身上的这笔债今年能不能结束','own_debt_end_cal'],
      ['我自己的欠款年底前能不能全部了结','repayment_timing_cal']
    ]
  },
  partnership: {
    train: [
      ['我和这个人一起经营这件事后面合不合适','joint_operation_suitability'],
      ['跟他搭伙做这门生意以后能不能长久','joint_operation_duration'],
      ['我和这个伙伴继续一起做项目会不会顺','joint_project_outcome'],
      ['两个人合着经营这家店接下来能不能稳定','joint_store_stability'],
      ['我跟对方组成搭档继续做这摊事好不好','partner_choice'],
      ['这个合作对象适不适合和我长期一起经营','partner_suitability']
    ],
    calibration: [
      ['我和这个人搭伙做生意以后合不合适','joint_operation_suitability_cal'],
      ['跟这个伙伴一起经营下去能不能稳定','joint_store_stability_cal'],
      ['我和对方继续组成搭档做项目好不好','partner_choice_cal'],
      ['这个人适不适合长期跟我一起做事','partner_suitability_cal']
    ]
  },
  investment_profit: {
    train: [
      ['这笔投资放一段时间最后能不能赚到钱','investment_return'],
      ['我现在持有的这个基金以后有没有收益','fund_gain'],
      ['这只股票继续拿着后面能不能带来利润','stock_profit'],
      ['钱投进这个项目一段时间后能不能有回报','project_return'],
      ['这项投资最终会不会让我多赚一笔','gain_outcome'],
      ['手上的投资到后面有没有实际赚头','profitability']
    ],
    calibration: [
      ['这只基金继续放着以后能不能有收益','fund_gain_cal'],
      ['这项投资到最后会不会赚钱','investment_return_cal'],
      ['手上的股票拿一阵后能不能有利润','stock_profit_cal'],
      ['钱放进这个项目后面有没有回报','project_return_cal']
    ]
  },
  investment_liquidation: {
    train: [
      ['我把手上的这只基金全部退出能不能顺利','full_exit'],
      ['这项投资现在整体卖掉会不会卡住','sell_outcome'],
      ['手里的股票如果一次清仓能不能顺利完成','stock_exit'],
      ['我准备从这个投资项目完全撤出能不能成','project_exit'],
      ['现在把这份持仓全部变现会不会顺','liquidation_outcome'],
      ['这笔投资想彻底退出来后面能不能办成','exit_completion']
    ],
    calibration: [
      ['这只基金现在全部退出能不能顺','full_exit_cal'],
      ['手里股票如果清仓会不会顺利','stock_exit_cal'],
      ['这项投资整个卖掉后面能不能完成','sell_outcome_cal'],
      ['我从这个项目完全撤出能不能办成','project_exit_cal']
    ]
  },
  investment_suitability: {
    train: [
      ['这个基金现在适不适合我参与','entry_suitability'],
      ['我眼下把钱放进这只股票合不合适','investment_fit'],
      ['这个投资项目现在进入对我是不是合宜','project_suitability'],
      ['我现在继续持有这项投资到底妥不妥','holding_suitability'],
      ['眼下选择这个投资标的是否适合我的情况','target_fit'],
      ['这时候参与这项投资对我来说好不好','participation_choice']
    ],
    calibration: [
      ['这只基金现在适不适合我进去','entry_suitability_cal'],
      ['眼下把钱投到这只股票合不合适','investment_fit_cal'],
      ['这个项目现在参与对我是不是合宜','project_suitability_cal'],
      ['我继续持有这项投资妥不妥','holding_suitability_cal']
    ]
  },
  investment_position_decision: {
    train: [
      ['手里这只股票接下来该加一些还是减一些','increase_reduce_choice'],
      ['这个基金我现在是多拿一点还是收回一部分','position_adjustment'],
      ['目前这份持仓继续保持还是缩小更合适','hold_reduce_choice'],
      ['这只股票后面应该加仓还是先减仓','add_reduce_decision'],
      ['我对这项投资接下来是继续加码还是收缩','exposure_choice'],
      ['手上的基金份额现在要不要调整大小','position_size_decision']
    ],
    calibration: [
      ['这只股票接下来加仓还是减仓更合适','add_reduce_decision_cal'],
      ['手里的基金现在多留一些还是收回一些','position_adjustment_cal'],
      ['这份持仓继续保持还是缩小好','hold_reduce_choice_cal'],
      ['这项投资接下来要不要调整仓位大小','position_size_decision_cal']
    ]
  },
  investment_price_trend: {
    train: [
      ['这只股票接下来一阵价格会往上还是往下','price_direction'],
      ['这个基金后面几周会涨还是会跌','fund_direction'],
      ['手上这个标的未来一段会走高还是走低','market_direction'],
      ['这只股票后面的价格趋势会偏上还是偏下','trend_direction'],
      ['这个基金接下来行情大概朝哪个方向走','market_trend'],
      ['未来几周这项投资的市场价格会怎么变化','future_price_change']
    ],
    calibration: [
      ['这只股票后面会涨还是会跌','price_direction_cal'],
      ['这个基金接下来价格会往高处还是低处走','fund_direction_cal'],
      ['手上这个标的未来一阵趋势朝哪边','market_direction_cal'],
      ['这项投资后面的市场价格会怎么走','market_trend_cal']
    ]
  },
  income_salary: {
    train: [
      ['我以后每个月固定拿到的工资会不会增加','recurring_salary_change'],
      ['公司按月发给我的固定收入明年能不能变多','monthly_pay_change'],
      ['接下来我的基本工资有没有机会往上调','base_salary_raise'],
      ['以后稳定到手的月薪会不会比现在高','monthly_salary_level'],
      ['明年公司固定给我的薪资能不能上涨','salary_increase'],
      ['往后每月常规收入会不会慢慢增加','recurring_income_trend']
    ],
    calibration: [
      ['以后每个月固定工资会不会增加','recurring_salary_change_cal'],
      ['明年我的基本工资能不能往上调','base_salary_raise_cal'],
      ['公司按月给我的薪资以后会不会更高','salary_increase_cal'],
      ['接下来稳定到手的月薪能不能变多','monthly_salary_level_cal']
    ]
  },
  income_bonus: {
    train: [
      ['今年公司额外发的奖金我能不能拿到','bonus_receipt'],
      ['这个项目结束后的奖励金会不会有我的份','project_bonus'],
      ['年底那笔另外发的奖金最后能不能落到我这里','year_end_bonus'],
      ['公司这次额外给的奖励我有没有机会拿到','extra_reward'],
      ['今年非固定的那笔绩效奖金会不会发给我','performance_bonus'],
      ['项目完成以后那份额外收入我能不能分到','oneoff_reward']
    ],
    calibration: [
      ['今年年底奖金我能不能拿到','year_end_bonus_cal'],
      ['项目结束后的奖励金会不会有我的份','project_bonus_cal'],
      ['这次公司额外发的钱我有没有机会拿到','extra_reward_cal'],
      ['今年绩效奖金最后会不会发给我','performance_bonus_cal']
    ]
  },
  receive_item: {
    train: [
      ['我已经订好的书桌这周能不能送到','delivery_arrival'],
      ['前几天买的椅子还要多久才能收到','receipt_timing'],
      ['网上下单的灯具明天会不会到家','delivery_date'],
      ['已经发出的那个包裹后面能不能顺利收到','receipt_outcome'],
      ['我等的那件商品月底前能不能到手','arrival_deadline'],
      ['之前订的柜子大概什么时候能送来','arrival_timing']
    ],
    calibration: [
      ['我已经买的桌子这周能不能送到','delivery_arrival_cal'],
      ['前几天下单的椅子什么时候能收到','receipt_timing_cal'],
      ['已经发出的包裹月底前能不能到手','arrival_deadline_cal'],
      ['我订好的柜子大概什么时候会送来','arrival_timing_cal']
    ]
  },
  item_purchase: {
    train: [
      ['这台咖啡机我现在买下来合不合适','purchase_suitability'],
      ['眼下这把椅子我要不要买','buy_decision'],
      ['这个小冰箱现在入手对我来说好不好','acquisition_choice'],
      ['我现在买这台显示器到底妥不妥','purchase_choice'],
      ['这款耳机眼下值不值得我买下来','purchase_value_decision'],
      ['现在把这个除湿机买回家合不合适','acquisition_suitability']
    ],
    calibration: [
      ['这台咖啡机我现在要不要买','buy_decision_cal'],
      ['眼下买这把椅子合不合适','purchase_suitability_cal'],
      ['这个小冰箱现在入手好不好','acquisition_choice_cal'],
      ['这款耳机现在值不值得我买','purchase_value_decision_cal']
    ]
  },
  relationship_development: {
    train: [
      ['我和这个人现在还没确定关系，后面能不能走到一起','premarriage_progress'],
      ['我们目前只是暧昧，接下来会不会真正成为恋人','ambiguity_to_relationship'],
      ['我跟她现在刚认识，往后有没有机会发展成感情','early_stage_progress'],
      ['我和他还在接触阶段，之后能不能更进一步','dating_progress'],
      ['我们两个现在不是伴侣，后面有没有可能发展起来','pre_partner_development'],
      ['这段还没确定的关系以后会不会变得更亲近','relationship_progress']
    ],
    calibration: [
      ['我和她现在还没在一起，后面能不能发展成恋人','premarriage_progress_cal'],
      ['我们目前只是暧昧，以后会不会正式交往','ambiguity_to_relationship_cal'],
      ['我跟这个人刚开始接触，之后能不能更进一步','dating_progress_cal'],
      ['这段还没确定的关系后面会不会发展起来','relationship_progress_cal']
    ]
  },
  marriage_match: {
    train: [
      ['我和现在的对象以后能不能正式结婚','formal_marriage_outcome'],
      ['我们已经在交往，这段关系最后会不会走进婚姻','dating_to_marriage'],
      ['我跟伴侣以后有没有机会真正成家','family_formation'],
      ['我们两个人最后能不能把婚事定下来','marriage_completion'],
      ['这段恋爱以后会不会发展到结婚','romance_to_marriage'],
      ['我和对象最终有没有可能成为夫妻','spouse_outcome']
    ],
    calibration: [
      ['我和对象以后能不能正式结婚','formal_marriage_outcome_cal'],
      ['我们这段恋爱最后会不会走进婚姻','romance_to_marriage_cal'],
      ['我跟伴侣以后有没有机会成家','family_formation_cal'],
      ['我们两个人最终能不能成为夫妻','spouse_outcome_cal']
    ]
  },
  marital_relationship: {
    train: [
      ['我和配偶最近关系很僵，后面能不能缓和','existing_marriage_quality'],
      ['我们已经结婚多年，接下来相处会不会改善','marriage_improvement'],
      ['我和另一半婚后总有矛盾，往后能不能好一些','postmarriage_conflict'],
      ['夫妻之间现在很冷淡，以后关系会不会回暖','spousal_warmth'],
      ['我和爱人已经成家，后面相处能不能稳定下来','marriage_stability'],
      ['这段婚姻目前不太顺，接下来会不会有转变','marriage_change']
    ],
    calibration: [
      ['我和配偶现在关系不好，后面能不能缓和','existing_marriage_quality_cal'],
      ['我们结婚以后总有矛盾，接下来会不会改善','postmarriage_conflict_cal'],
      ['夫妻现在有些冷淡，以后关系会不会回暖','spousal_warmth_cal'],
      ['这段婚姻目前不顺，后面能不能稳定下来','marriage_stability_cal']
    ]
  }
};

const outsideTrain = [
  '这次资格考试最后能不能通过','下周那场求职面试我能不能被录用','搬去新的城市以后生活会不会顺利','这次签证申请最终能不能批下来','月底那场比赛我能不能晋级','准备申请的学校最后能不能录取我','这次公开演讲当天能不能顺利完成','我换到新的部门以后能不能适应','这门课程继续读下去能不能顺利毕业','今年准备考的证书能不能拿到','这次诉讼最后结果会不会对我有利','我丢的那串钥匙后面还能不能找回来','下个月出远门一路会不会顺利','准备参加的比赛最后能不能拿到名次','这次房屋申请我能不能排上','我申请的研究项目最后能不能入选','这次作品投稿会不会被采用','下周的驾驶考试我能不能过','我准备参加的选拔最后能不能进入下一轮','这次搬家过程能不能顺利完成','我申请的工作许可最后能不能下来','这个学期的毕业答辩能不能顺利通过'
];
const outsideCal = [
  '这次公务员考试我最后能不能通过','明天那场面试会不会录取我','准备搬到外地以后能不能适应','这次留学申请最后能不能获批','周末比赛我有没有机会晋级','申请的大学最后会不会录取我','下周那次公开汇报能不能顺利结束','调去新团队以后我能不能适应','这门培训最后能不能顺利结业','今年考的职业证书我能不能拿到','这场官司最终会不会判得对我有利','之前丢的证件还能不能找回来','下周出差一路会不会顺','参加的竞赛最后能不能拿奖','这次公租房申请我能不能排到','申请的科研计划最后能不能通过','这篇文章投稿会不会被收下','下个月驾照考试我能不能过','这次选拔我最后能不能入围','月底搬家当天能不能顺利','申请的居留许可最后能不能批准','这学期论文答辩最后能不能通过'
];
const unresolvedTrain = [
  '我现在是不是应该换一种处理方式','这件事我接下来到底要不要继续','现在这个选择是不是更适合我','我眼下是不是该先停一停','后面这一步我到底要不要做','我现在继续下去是不是合适','接下来是不是应该改个方向','这件事情现在要不要先缓一缓','眼前这个安排是不是需要调整','我接下来应该坚持还是放弃','现在是不是到了该改变的时候','后面到底该往哪边走比较好','我是不是应该把现在的计划改掉','接下来这段时间要不要继续照原来做','这件事我现在做决定是不是太早','我是不是应该先等等再说','眼下这个机会到底要不要抓','现在要不要把原来的选择推翻','后面是不是应该采取另一种办法','这一步我现在做还是不做好','接下来要不要继续投入精力','眼前这个决定我是不是该重新考虑'
];
const unresolvedCal = [
  '我现在要不要换个思路处理','这件事情后面还要不要继续做','眼前这个选择到底适不适合我','我是不是应该暂时停下来','下一步现在到底要不要推进','继续照现在这样做合不合适','后面是不是需要调整方向','这件事要不要先放一放','目前这个安排需不需要改变','接下来我是坚持还是停下','现在是不是该做出改变了','后面我到底应该往哪个方向走','我是不是要修改现在的计划','接下来还要不要维持原来的做法','现在做这个决定是不是合适','我是不是先等一阵更好','眼前这个机会我要不要接住','现在要不要重新选一次','后面是不是该换一种办法','这一步现在到底做不做','接下来还值不值得继续花精力','眼前这个决定要不要重新想一遍'
];
const nearTrain = [
  '公司把我工资改成每周发一次会不会更方便','老板以后把奖金拆成几次发会不会更合理','仓库把补货周期改短一点会不会更合适','店里把库存分到两个仓库会不会更方便','借款改成分几次拿会不会更好管理','把借出去的钱分批给对方会不会更省事','催别人还钱改成每周提醒一次会不会更好','我把还款日统一放到月底会不会更方便','合伙项目把职责重新分一遍会不会更清楚','这笔投资把记录方式改成每周记一次会不会更方便','基金账户换一个展示界面会不会更好用','把持仓列表按行业重新分类会不会更清楚','股票提醒改成每天一次会不会更合适','把投资收益单独记在另一个表里会不会更方便','公司工资单换成电子版会不会更省事','奖金通知改成邮件发送会不会更方便','包裹都改放同一个代收点会不会更省事','买东西统一用一个购物清单会不会更方便','恋爱纪念日都记到同一个日历会不会更方便','婚礼筹备事项放到共享清单会不会更清楚','夫妻家务改成轮流记录会不会更方便','店里每周固定一天盘点会不会更好安排'
];
const nearCal = [
  '公司把工资发放频率改成半月一次会不会更方便','奖金通知统一放到员工系统里会不会更省事','仓库把补货表改成每天更新会不会更清楚','库存按货架区域重新编号会不会更方便','借来的钱分几个账户存会不会更好管理','借出去的钱统一记在一个表里会不会更清楚','催款提醒都放到月底发会不会更省事','自己的还款记录改成自动分类会不会更方便','合伙项目把任务写进共享表会不会更清楚','投资账户把记录按月份归档会不会更好找','基金页面把持仓顺序重新排会不会更顺手','股票列表按涨跌幅排序会不会更直观','价格提醒改成只在收盘后发会不会更合适','投资收益按季度汇总会不会更方便','工资单全部改成电子文件会不会更好保存','奖金通知改成短信会不会更及时','包裹统一放公司前台代收会不会更方便','购物清单按房间分类会不会更好用','恋爱行程都放到共享日历会不会更方便','婚礼事项按负责人分类会不会更清楚','夫妻账单改成每周一起整理会不会更方便','店铺盘点记录改成电子表会不会更省事'
];

const buildKnownRows = (split) => {
  const rows = [];
  let index = 1;
  for (const routeId of routeIds) {
    const items = known[routeId]?.[split];
    const expected = split === 'train' ? 6 : 4;
    if (!items || items.length !== expected) throw new Error(`${split} ${routeId} count ${items?.length} != ${expected}`);
    for (const [text, wordingPattern] of items) {
      rows.push({
        id:`V04-FI-${split === 'train' ? 'T' : 'C'}-${String(index++).padStart(3,'0')}`,
        text,
        identityLabel:'route_identity_positive',
        expectedRoute:routeId,
        subtype:'fallback_style_known',
        confusableFamily:familyOf(routeId),
        semanticAxis:axisOf(routeId),
        wordingPattern
      });
    }
  }
  return rows;
};
const buildNonRouteRows = (split) => {
  const collections = split === 'train'
    ? [['outside_current_22', outsideTrain], ['route_unresolved', unresolvedTrain], ['near_domain_not_current_route', nearTrain]]
    : [['outside_current_22', outsideCal], ['route_unresolved', unresolvedCal], ['near_domain_not_current_route', nearCal]];
  const rows = [];
  let index = split === 'train' ? 133 : 89;
  for (const [subtype, texts] of collections) {
    if (texts.length !== 22) throw new Error(`${split} ${subtype} count ${texts.length} != 22`);
    for (let i = 0; i < texts.length; i += 1) rows.push({
      id:`V04-FI-${split === 'train' ? 'T' : 'C'}-${String(index++).padStart(3,'0')}`,
      text:texts[i],
      identityLabel:'non_route',
      expectedRoute:null,
      subtype,
      confusableFamily:subtype === 'near_domain_not_current_route' ? 'cross_domain_process_choice' : 'none',
      semanticAxis:subtype,
      wordingPattern:`${subtype}_${String(i + 1).padStart(2,'0')}`
    });
  }
  return rows;
};

const trainingRows = [...buildKnownRows('train'), ...buildNonRouteRows('train')];
const calibrationRows = [...buildKnownRows('calibration'), ...buildNonRouteRows('calibration')];
if (trainingRows.length !== schema.freshCorpusSizes.trainingAugmentationRows) throw new Error(`training rows ${trainingRows.length}`);
if (calibrationRows.length !== schema.freshCorpusSizes.calibrationRows) throw new Error(`calibration rows ${calibrationRows.length}`);

const commonPolicy = {
  candidateV03DevelopmentUsedForTraining:false,
  candidateV03DevelopmentUsedForCalibration:false,
  candidateV03FailureDiagnosticUsedForWording:false,
  independentEvaluationRead:false,
  sealedBlindEvaluationRead:false,
  newThemeResearchImported:false,
  routerTop2MembershipUsedAsLabel:false,
  traditionalLiuYaoFeaturesUsed:false,
  encoderScoringObserved:false
};
const training = {
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-training-augmentation-v0.1',
  status:'presealed_training_augmentation',
  sealed:false,
  scope:'liuyao_semantic_fallback_identity_v0.2',
  schema:'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.1.json',
  createdAfterSchemaFreeze:true,
  policy:{ ...commonPolicy, useForFallbackIdentityTraining:true, useForThresholdCalibration:false },
  rows:trainingRows
};
const calibration = {
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-calibration-v0.1',
  status:'presealed_calibration_data',
  sealed:false,
  scope:'liuyao_semantic_fallback_identity_v0.2',
  schema:'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.1.json',
  createdAfterSchemaFreeze:true,
  policy:{ ...commonPolicy, useForFallbackIdentityTraining:false, useForThresholdCalibration:true, oneGlobalThresholdOnly:true, routeSpecificThresholdsForbidden:true },
  rows:calibrationRows
};

fs.writeFileSync(path.join(root, TRAIN_PATH), `${JSON.stringify(training, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(root, CAL_PATH), `${JSON.stringify(calibration, null, 2)}\n`, 'utf8');
console.log('Candidate v0.4 Fallback Identity v0.2 fresh corpora generated without encoder scoring.');
console.log(`- training augmentation: ${trainingRows.length} (132 known / 66 non-route)`);
console.log(`- calibration: ${calibrationRows.length} (88 known / 66 non-route)`);
console.log('- router Top2 was not used as a generation filter or label.');
