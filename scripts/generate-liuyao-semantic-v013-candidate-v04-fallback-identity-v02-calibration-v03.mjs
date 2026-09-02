import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.3.json';
const inventoryPath = 'data/liuyao-semantic-route-inventory-v0.2.json';
const outputPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.3.json';
const schema = JSON.parse(fs.readFileSync(path.join(root, schemaPath), 'utf8'));
const inventory = JSON.parse(fs.readFileSync(path.join(root, inventoryPath), 'utf8'));
if (schema.status !== 'frozen_after_v02_sealed_reachability_failure_before_new_calibration_generation') throw new Error('Fallback calibration schema v0.3 not frozen');
const routeIds = inventory.routes.map((row) => row.routeId);
if (routeIds.length !== 22) throw new Error(`route inventory ${routeIds.length} != 22`);

const families = {
  financial_fortune:'general_finance', business_operation:'general_finance', commercial_transaction:'general_finance',
  inventory_purchase:'inventory_flow', inventory_sale:'inventory_flow',
  borrow_money:'money_direction', lend_money:'money_direction', debt_collection:'money_direction', debt_repayment:'money_direction',
  partnership:'partnership_operation',
  investment_profit:'investment_goal', investment_liquidation:'investment_goal', investment_suitability:'investment_goal', investment_position_decision:'investment_goal', investment_price_trend:'investment_goal',
  income_salary:'employment_income', income_bonus:'employment_income',
  receive_item:'item_flow', item_purchase:'item_flow',
  relationship_development:'relationship_stage', marriage_match:'relationship_stage', marital_relationship:'relationship_stage'
};
const axes = {
  financial_fortune:'overall_personal_financial_state_not_single_transaction',
  business_operation:'ongoing_venture_viability_not_single_trade_or_partner_choice',
  commercial_transaction:'specific_trade_completion_between_counterparties',
  inventory_purchase:'goods_flow_into_business_stock', inventory_sale:'goods_flow_out_of_existing_business_stock',
  borrow_money:'money_moves_from_other_to_querent_as_temporary_funding', lend_money:'money_moves_from_querent_to_other_as_temporary_funding',
  debt_collection:'previously_owed_money_returns_to_querent', debt_repayment:'querent_clears_own_existing_obligation',
  partnership:'whether_to_or_can_operate_jointly_with_specific_partner',
  investment_profit:'return_or_gain_from_investment', investment_liquidation:'exit_or_sell_out_existing_investment',
  investment_suitability:'whether_entering_or_holding_investment_is_suitable', investment_position_decision:'increase_reduce_or_hold_position_choice', investment_price_trend:'future_market_price_direction',
  income_salary:'recurring_fixed_employment_pay', income_bonus:'nonrecurring_additional_employment_reward',
  receive_item:'arrival_or_receipt_of_already_expected_item', item_purchase:'whether_to_acquire_or_buy_item',
  relationship_development:'pre_marriage_romantic_progression', marriage_match:'whether_relationship_reaches_formal_marriage', marital_relationship:'quality_or_change_inside_existing_marriage'
};

const known = {
  financial_fortune:[
    ['往后半年我日常花用能不能没现在这么紧','daily_spending_pressure'],
    ['接下来几个月家里能动用的余地会不会变大一些','household_headroom'],
    ['今年余下的日子我在开销上能不能松快一点','expense_ease'],
    ['后面一阵我手边可支配的余量会不会比现在多','available_headroom'],
    ['未来这半年日子过起来会不会少一点捉襟见肘','living_pressure'],
    ['接下来一年我花用上的余地能不能逐渐缓过来','spending_capacity']
  ],
  business_operation:[
    ['我自己开的这个小铺往后还能不能撑住','small_venture_survival'],
    ['手里这间小铺再做下去还有没有继续的可能','small_venture_continuity'],
    ['这个自己张罗起来的小地方后面能不能站稳','venture_stability'],
    ['我现在管着的这一摊以后还能不能维持','venture_maintenance'],
    ['自己做起来的这件营生后面能不能一直延续','venture_duration'],
    ['这个小铺接下来一年会不会越做越顺','venture_trend']
  ],
  commercial_transaction:[
    ['我跟那边这次谈的货最后能不能说定','counterparty_goods_agreement'],
    ['我和对方这回谈的那批东西最后能不能定下来','counterparty_terms_closure'],
    ['这次跟那边议的货最后会不会谈成','goods_negotiation_outcome'],
    ['我这边和对方说的这件货事最后能不能落定','specific_goods_deal'],
    ['两边谈了几轮的这件货事最后能不能说拢','negotiation_completion'],
    ['我跟那边关于这批东西的条件最后能不能谈妥','terms_completion']
  ],
  inventory_purchase:[
    ['后仓下一轮缺的那些东西能不能按时添齐','stock_need_fill'],
    ['铺子里后面要用的那批东西能不能陆续凑全','future_stock_fill'],
    ['接下来缺口里的那些货源能不能及时补上','supply_fill'],
    ['后屋下一阶段少的那些东西能不能顺利添上','backroom_replenish'],
    ['做下一轮准备时缺的那批东西能不能及时凑够','next_cycle_supply'],
    ['铺子后面要用的东西能不能在需要前齐起来','pre_need_supply']
  ],
  inventory_sale:[
    ['后仓压着的那堆东西往后能不能慢慢腾出去','stock_outflow'],
    ['铺子里剩下的那批东西以后能不能逐渐走掉','remaining_goods_outflow'],
    ['后屋放久的那些东西接下来能不能一点点腾空','old_goods_clear'],
    ['手里积着的那批东西往后有没有机会都走掉','accumulated_goods_clear'],
    ['铺子里占地方的那些东西后面能不能慢慢少下去','stock_reduction'],
    ['后仓剩着的那堆东西今年能不能基本腾开','backroom_clearance']
  ],
  borrow_money:[
    ['眼下这个缺口有没有人能先给我补上','inbound_gap_support'],
    ['我这阵差的那一截能不能有人先替我顶过去','temporary_inbound_help'],
    ['现在手边不够的部分能不能有人先拿一笔给我应急','temporary_funding_help'],
    ['最近这一块缺口能不能从外面先补过来','external_gap_fill'],
    ['这阵子我差的那一笔有没有人肯先给我垫一下','temporary_advance_in'],
    ['眼前周转不开的这一截能不能先有人接我一把','liquidity_help_in']
  ],
  lend_money:[
    ['对方手头紧，我先拿一笔给他顶一阵是否妥当','temporary_outbound_help'],
    ['这个熟人现在差一截，我先把一部分给他用好不好','give_funds_temporarily'],
    ['他最近有个缺口，我先拿钱替他垫一阵会不会有事','advance_for_other'],
    ['对方眼下不够，我先给他一笔应急以后会不会麻烦','outbound_emergency_funds'],
    ['这个人现在周转不开，我先拿一笔过去顶着妥不妥','temporary_outbound_support'],
    ['他临时缺一截，我先把钱给他用一阵是否稳妥','funds_to_other_temporarily']
  ],
  debt_collection:[
    ['早前留在别人手里的那笔现在还有没有机会回我这边','old_amount_return'],
    ['之前放到对方那边的那一份以后能不能回到我手上','counterparty_amount_return'],
    ['那笔一直留在别人那里的东西后面会不会回我这里','held_amount_return'],
    ['以前出去的那一笔现在还能不能重新回到我这边','previous_outflow_return'],
    ['对方手里压着我的那一份以后有没有机会回来','counterparty_holding_return'],
    ['早些时候出去的那笔到最后能不能回到我手边','past_amount_recovery']
  ],
  debt_repayment:[
    ['压在我名下的那一笔年底前能不能彻底了结','own_obligation_end'],
    ['我这边一直挂着的那一笔以后能不能收尾','own_amount_close'],
    ['身上压着的这个长期负担今年能不能清掉','own_burden_clear'],
    ['我名下这项一直没结束的款以后能不能结完','own_payment_completion'],
    ['现在压着我的这一笔接下来能不能彻底结束','own_obligation_completion'],
    ['这项一直挂在我这边的数目今年能不能了结','own_balance_end']
  ],
  partnership:[
    ['我跟这个人两边凑到一起把这摊事做下去是否合适','joint_effort_suitability'],
    ['我和他把各自手里的东西合在一起做，后面能不能稳','joint_resource_stability'],
    ['两个人一起把这件事撑起来以后能不能长久','joint_continuity'],
    ['我跟对方把力量放到一处做这件事，以后行不行','joint_effort_outcome'],
    ['这个人和我一块把这摊事做下去会不会顺','joint_work_outcome'],
    ['我们两边一起做这个项目往后能不能配合得住','joint_project_fit']
  ],
  investment_profit:[
    ['我把钱放在这只基金里过一阵能不能多回来一点','fund_return_gain'],
    ['这只股票我放一段后手里的数会不会比现在多','stock_value_gain'],
    ['钱放进这个项目以后最后能不能带回来更多','project_return_gain'],
    ['我手上的这只基金继续放着会不会多出一截','fund_increment'],
    ['这份股票拿上一阵以后我这边能不能多回来一些','stock_increment'],
    ['放在这个项目里的那笔以后会不会比原先多一点回来','project_increment']
  ],
  investment_liquidation:[
    ['手里的这只基金如果整个收回来，后面能不能顺当','fund_full_return'],
    ['这份股票我想全部收回到手里，会不会卡在中间','stock_full_return'],
    ['这个项目里放着的那一份我现在整个拿回来能不能成','project_full_return'],
    ['手上的基金我准备一份不留地收回来，后面顺不顺','fund_complete_return'],
    ['这只股票我想整份从里面拿出来，会不会顺利','stock_complete_return'],
    ['放在这项里的那笔我现在全部收回，最后能不能完成','investment_complete_return']
  ],
  investment_suitability:[
    ['这只基金我现在进去对我是不是稳妥','fund_entry_fit'],
    ['眼下把钱放到这只股票里对我是不是靠谱','stock_entry_fit'],
    ['这个项目我现在参与进去对我会不会稳当','project_entry_fit'],
    ['手里这只基金我继续放着对我是不是妥当','fund_hold_fit'],
    ['这只股票现在让我进去的话，对我到底稳不稳','stock_participation_fit'],
    ['这个项目眼下让我参与，对我是不是一个稳妥选择','project_participation_fit']
  ],
  investment_position_decision:[
    ['手里这只基金后面是多留一点还是少留一点','fund_more_or_less'],
    ['这只股票我接下来是多放一些还是收一点回来','stock_more_or_less'],
    ['现在这份基金我该维持这个量还是缩小一些','fund_size_choice'],
    ['手上的股票后面是继续这个份量还是少一点更好','stock_size_choice'],
    ['这项里我现在放的这一份要不要再多一点','project_exposure_choice'],
    ['这只基金接下来我手里留多些还是留少些','fund_holding_amount_choice']
  ],
  investment_price_trend:[
    ['这只基金后面一阵会往上还是往下','fund_direction'],
    ['手上这只股票接下来会抬起来还是压下去','stock_direction'],
    ['这个项目对应的那一份后面会往高处还是低处走','project_market_direction'],
    ['这只基金过阵子大概朝上边还是下边去','fund_future_direction'],
    ['手里的股票接下来一段会抬高一点还是继续往下','stock_future_direction'],
    ['这个标的后面几周大概是向上还是向下','asset_future_direction']
  ],
  income_salary:[
    ['公司每个月固定给我的那一份以后会不会多些','monthly_fixed_amount'],
    ['往后每月公司固定到我手里的那部分能不能增加','monthly_fixed_increase'],
    ['明年每个月照常到我这里的那一份会不会往上','monthly_regular_increase'],
    ['公司每月稳定给我的部分接下来能不能比现在多','regular_company_amount'],
    ['以后每个月固定落到我这里的那份能不能增加','fixed_monthly_amount'],
    ['明年公司每月常规给我的那部分会不会提高','regular_monthly_raise']
  ],
  income_bonus:[
    ['年底公司另外给的那一份今年还能不能落到我这里','year_end_extra_amount'],
    ['这次事情做完以后公司多给的那一份会不会有我','project_extra_amount'],
    ['年底除了平常那份之外，公司会不会再给我一笔','year_end_additional_amount'],
    ['这次项目收尾以后额外那一份最后能不能到我这里','project_additional_amount'],
    ['公司今年最后多出来的那份我有没有机会拿着','annual_extra_amount'],
    ['这回工作做完后另外给的那一笔会不会落在我这边','work_completion_extra']
  ],
  receive_item:[
    ['我定的书柜还要多久才来','ordered_bookcase_arrival'],
    ['前几天定的床垫大概哪天会来','ordered_mattress_arrival'],
    ['我等的那张餐桌这周能不能来','ordered_table_arrival'],
    ['之前定好的窗帘月底前会不会来','ordered_curtain_arrival'],
    ['我等着的那套书架还要几天才来','ordered_shelf_arrival'],
    ['已经定下的那张地毯大概什么时候来','ordered_rug_arrival']
  ],
  item_purchase:[
    ['眼下这个磨豆机我收不收','grinder_acquisition_choice'],
    ['这把办公椅现在我拿不拿','chair_acquisition_choice'],
    ['这个小推车我现在带回家好不好','cart_acquisition_choice'],
    ['眼前这盏落地灯我收下来妥不妥','lamp_acquisition_choice'],
    ['这个收纳柜现在拿回家对我好不好','cabinet_acquisition_choice'],
    ['这张小桌我眼下收下来是不是稳妥','table_acquisition_choice']
  ],
  relationship_development:[
    ['我和这个人现在还只是普通来往，后面能不能走到一块','ordinary_contact_progress'],
    ['我们两个眼下只是互相接触，以后会不会慢慢变得更近','contact_closeness_progress'],
    ['我跟她现在还没到那一步，之后有没有机会走近','pre_relation_progress'],
    ['我和他目前只是来往，后面能不能变成彼此特别的人','special_relationship_progress'],
    ['我们现在还只是认识，往后会不会真的靠近起来','early_contact_progress'],
    ['我跟这个人目前关系还浅，以后能不能慢慢走到一起','relationship_closeness_progress']
  ],
  marriage_match:[
    ['我和对象最后能不能真正成为一家人','family_formation'],
    ['我们两个以后有没有机会把日子正式过到一块','formal_life_union'],
    ['我跟对象最后能不能把两个人的以后真正定下来','long_term_union'],
    ['我们两边以后有没有可能变成真正的一家','family_union'],
    ['我和这个对象最后能不能把终身的事情定下来','lifelong_union'],
    ['我们两个往后有没有机会正式成为一家','formal_family_formation']
  ],
  marital_relationship:[
    ['我和另一半已经一起生活很多年，往后相处能不能缓下来','longterm_partner_improvement'],
    ['家里两个人已经共同过了很久，接下来能不能少些别扭','longterm_household_improvement'],
    ['我和另一半这些年总有摩擦，往后关系会不会顺一些','longterm_partner_conflict'],
    ['两个人已经一起过日子很久了，以后相处能不能暖一点','longterm_living_warmth'],
    ['我和另一半共同生活多年，后面会不会比现在和缓','longterm_partner_easing'],
    ['家里两个人已经过了很多年，接下来关系能不能稳下来','longterm_household_stability']
  ]
};

const nearDomain = {
  financial_fortune:[
    ['我把每天的开销按周记还是按月记更顺手','expense_recording_choice'],
    ['家里的花用记录分成几类保存会不会更好找','expense_category_choice'],
    ['我把日常支出清单放手机里还是纸上更方便','expense_list_medium'],
    ['每个月花用的记录先按日期排还是按用途排更清楚','expense_sorting_choice']
  ],
  business_operation:[
    ['小铺的钥匙统一放一个地方还是分开保管更方便','small_shop_key_management'],
    ['我把小铺每天的事项按早晚分开记会不会更清楚','small_shop_task_record'],
    ['这间小铺的工具按使用频率摆还是按种类摆更顺手','small_shop_tool_layout'],
    ['小铺里值班事项用纸表还是共享表记录更方便','small_shop_roster_medium']
  ],
  commercial_transaction:[
    ['我和那边谈东西时先发图片还是先发清单更省事','goods_discussion_medium'],
    ['这回两边对条件时按条目逐项说还是一次说完更清楚','terms_discussion_format'],
    ['和对方核对那批东西时用表格还是文字消息更方便','goods_check_format'],
    ['两边谈细节的时候先讲数量还是先讲时间更容易沟通','negotiation_order_choice']
  ],
  inventory_purchase:[
    ['后仓要用的东西按类别列清单还是按位置列更方便','backroom_need_list'],
    ['铺子后面缺什么用纸记还是手机记更不容易漏','shop_need_record_medium'],
    ['后屋下一轮要添的东西按轻重缓急排会不会更清楚','backroom_need_priority'],
    ['准备下一轮要用的东西时先列数量还是先列种类更省事','supply_list_order']
  ],
  inventory_sale:[
    ['后仓现有的东西按放置时间排还是按类别排更容易整理','backroom_existing_sort'],
    ['铺子里剩着的那批东西用编号还是照片做记录更方便','remaining_goods_record'],
    ['后屋放久的东西按区域贴标签会不会更好找','old_goods_labeling'],
    ['手里现有那批东西的清单按数量还是按位置排序更清楚','existing_goods_sort']
  ],
  borrow_money:[
    ['我把别人临时给我的那一笔单独放一个账户会不会更好管理','inbound_temp_fund_accounting'],
    ['这次有人先替我补上的部分按日期记还是按人名记更清楚','inbound_help_recording'],
    ['临时从外面补来的那一笔我单独做个备忘会不会更方便','temporary_inbound_memo'],
    ['别人先给我顶上的那部分用一个表单独记录好不好','inbound_fund_tracking']
  ],
  lend_money:[
    ['我临时给对方用的那一笔单独记在一个表里会不会更方便','outbound_temp_fund_tracking'],
    ['先给别人顶着的那部分按人名还是按日期整理更清楚','outbound_help_sorting'],
    ['给对方暂时用的那笔我放到单独的备忘里好不好','temporary_outbound_memo'],
    ['我先替别人垫的那些记录统一放一个地方会不会更好找','outbound_advance_recording']
  ],
  debt_collection:[
    ['以前留在别人那里的那些记录按人名分组会不会更好查','old_outward_record_grouping'],
    ['对方那边还挂着的事项我按时间顺序整理是不是更清楚','counterparty_open_item_sorting'],
    ['早前出去的那些数目用一张表统一记会不会更方便','past_amount_tracking'],
    ['留在不同人那边的记录按对象还是按月份分类更好','counterparty_record_classification']
  ],
  debt_repayment:[
    ['我名下还挂着的那些数目按到期先后排会不会更方便','own_open_amount_sorting'],
    ['压在我这边的几项长期记录分开做提醒好不好','own_obligation_reminders'],
    ['我把名下待处理的那些数做成月度清单会不会更清楚','own_pending_amount_list'],
    ['一直挂在我这边的项目按大小还是按时间分类更方便','own_open_item_classification']
  ],
  partnership:[
    ['我和这个人一起做事时用同一张任务表会不会更方便','joint_task_board'],
    ['两个人做这摊事时职责按模块分还是按时间分更清楚','joint_role_organization'],
    ['我们共同做项目时文件放一个目录还是各自保存更省事','joint_file_management'],
    ['我和对方一起做事时每周固定一次对进度会不会更清楚','joint_progress_routine']
  ],
  investment_profit:[
    ['这只基金的记录按月份归档还是按买入批次归档更好找','fund_record_archiving'],
    ['我把这只股票的历史数据放一张表还是分年度保存更方便','stock_history_storage'],
    ['这个项目的数字记录按季度整理会不会更清楚','project_number_recording'],
    ['手里这份基金的资料按时间还是按来源分类更顺手','fund_document_sorting']
  ],
  investment_liquidation:[
    ['我把这只基金的历史凭证合成一个文件还是分开留更方便','fund_document_merge'],
    ['手里这只股票以前的记录按年份归档会不会更好找','stock_record_archiving'],
    ['这个项目的文件在结束前先按类型整理会不会更省事','project_file_organization'],
    ['这份基金相关资料统一放一个目录好还是分开存好','fund_file_storage']
  ],
  investment_suitability:[
    ['我把几只基金的资料放在同一个比较表里会不会更方便','fund_comparison_table'],
    ['看这只股票时我先整理公司资料还是先整理历史数据更清楚','stock_research_order'],
    ['这个项目的资料按优点缺点分栏记录会不会更好读','project_research_format'],
    ['几项标的的资料用同一套字段整理是不是更方便比较','asset_research_schema']
  ],
  investment_position_decision:[
    ['我把手里几份基金按金额大小排序会不会更清楚','fund_holding_sort'],
    ['股票列表按行业还是按名称排更容易看','stock_list_sort'],
    ['手上这些标的用百分比还是金额显示更直观','holding_display_choice'],
    ['我把各项在手里的份量每周记一次会不会更方便','position_record_frequency']
  ],
  investment_price_trend:[
    ['这只股票的提醒每天发一次还是只收盘后发更清静','stock_alert_frequency'],
    ['基金曲线用周线还是月线放在首页更容易看','fund_chart_display'],
    ['这个标的的历史图按一年还是三年区间保存更方便','asset_chart_range'],
    ['股票软件里的图先显示成交量还是先显示基本信息更顺手','stock_ui_layout']
  ],
  income_salary:[
    ['公司每月固定给我的那一份记录按月份放还是按年份放更好找','monthly_fixed_record_sort'],
    ['每月固定到我这里的那部分用一张表连续记会不会更清楚','monthly_fixed_tracking'],
    ['公司常规给我的那一份做成自动分类会不会更省事','regular_company_amount_classification'],
    ['每个月固定那部分的记录用电子文件还是纸质留存更方便','monthly_fixed_record_medium']
  ],
  income_bonus:[
    ['公司偶尔另外给的那一份记录要不要和每月固定部分分开','extra_amount_separate_record'],
    ['年底多出来的那份用单独一栏记录会不会更清楚','year_end_extra_record'],
    ['项目结束后另外那一份按项目名分类还是按月份分类更方便','project_extra_sort'],
    ['公司额外给的那些记录统一放一个文件里好不好','extra_company_amount_archive']
  ],
  receive_item:[
    ['我等的几件家具用一个清单按日期排会不会更方便','awaited_item_list'],
    ['已经定下的东西按房间分类记录会不会更好找','ordered_item_classification'],
    ['等着来的那些东西用日历提醒还是清单提醒更顺手','arrival_reminder_medium'],
    ['我把已经定好的几样东西统一写在一个备忘里好不好','ordered_item_memo']
  ],
  item_purchase:[
    ['我把想收的几样家居东西按房间列还是按预算列更方便','desired_item_list'],
    ['准备挑的小家具先做尺寸表还是先做款式表更清楚','item_comparison_order'],
    ['几个候选的小物件用照片收藏还是文字清单更好找','candidate_item_record'],
    ['我把待选的家居用品按优先级排一下会不会更省事','candidate_item_priority']
  ],
  relationship_development:[
    ['我和这个人的聊天记录按月份归档会不会更好找','contact_chat_archive'],
    ['两个人见面的日子记在共享日历还是自己日历更方便','contact_calendar_choice'],
    ['我把和这个人的照片单独建一个相册好不好','contact_photo_album'],
    ['我们两个人平时约时间用同一个清单会不会更省事','contact_schedule_tool']
  ],
  marriage_match:[
    ['我和对象两边要办的事项放在一个共享清单里会不会更清楚','couple_shared_checklist'],
    ['两个人以后共同安排的文件按谁负责来分类好不好','couple_document_assignment'],
    ['我和对象需要一起准备的东西按时间排序会不会更方便','couple_preparation_sort'],
    ['两边共同事项用一个日历还是两个日历同步更省事','couple_calendar_choice']
  ],
  marital_relationship:[
    ['我和另一半家里的账单按月份一起整理会不会更方便','household_bill_organization'],
    ['家里两个人的家务用轮流表还是固定分工表更清楚','household_chore_tracking'],
    ['我和另一半共同用的文件放一个目录会不会更好找','shared_household_files'],
    ['两个人的家庭事项每周一起整理一次会不会更省事','household_task_routine']
  ]
};

const outsideCurrent22 = [
  '这次专业资格评审最后能不能通过','我报名的选拔这回有没有机会进下一轮','准备搬去外地以后我的生活能不能顺下来','这次长期签证的申请最后会不会获准','周末那场竞技比赛我能不能进决赛','申请的学校这次最终会不会收我','下周的公开汇报当天能不能顺利完成','换到新的团队以后我能不能适应下来','这门长期课程最后能不能顺利结业','我今年准备拿的职业证书能不能到手','这场民事争议最终结果会不会对我有利','之前落在外面的证件以后还能不能找回来','下个月这趟远行一路能不能平安顺利','准备参加的创作评选最后能不能入围','这次住房申请我最后能不能排得到','报名的研究计划会不会被选中','这篇稿子送出去以后能不能被采用','下个月的驾驶技能考试我能不能通过','这回内部选拔最后有没有我的名额','月底换住处当天能不能顺利完成','申请的工作许可最后会不会批准','这个学期的最终答辩能不能顺利过关'
];
const routeUnresolved = [
  '这件事我现在继续推进到底好不好','眼前这个选择我是不是应该换掉','接下来这一步我现在做还是不做好','目前这个安排要不要先停一阵','我是不是该把后面的计划重新想一遍','这件事情继续照原样做下去妥不妥','眼下是不是到了该改变做法的时候','接下来这个机会我要不要接下来','我现在是不是应该先等一等','后面这件事到底往哪个方向处理更好','当前这个决定是不是需要推迟','接下来还要不要继续花精力在这上面','我现在把原来的办法换掉会不会更好','这一步眼下推进是不是太早','后面是不是应该先把事情放缓一点','我现在继续坚持这个选择合不合适','接下来要不要把现有安排重新排一遍','眼前这件事我到底该抓紧还是放松','现在这个方案是不是需要彻底改掉','后面我是不是该先试另一条路','这件事目前做决定是不是合适','接下来我还要不要维持现在的方向'
];

for (const routeId of routeIds) {
  if (!known[routeId] || known[routeId].length !== 6) throw new Error(`known calibration ${routeId} count ${known[routeId]?.length} != 6`);
  if (!nearDomain[routeId] || nearDomain[routeId].length !== 4) throw new Error(`near-domain calibration ${routeId} count ${nearDomain[routeId]?.length} != 4`);
}
if (outsideCurrent22.length !== 22 || routeUnresolved.length !== 22) throw new Error('non-route support count drift');

const rows = [];
let index = 1;
for (const routeId of routeIds) {
  for (const [text, wordingPattern] of known[routeId]) {
    rows.push({
      id:`V04-FI-C3-${String(index++).padStart(3,'0')}`,
      text,
      identityLabel:'route_identity_positive',
      expectedRoute:routeId,
      subtype:'fallback_stage_known',
      confusableFamily:families[routeId],
      semanticAxis:axes[routeId],
      wordingPattern,
      intendedCalibrationStage:'fallback_identity_all22'
    });
  }
}
for (const routeId of routeIds) {
  for (const [text, wordingPattern] of nearDomain[routeId]) {
    rows.push({
      id:`V04-FI-C3-${String(index++).padStart(3,'0')}`,
      text,
      identityLabel:'non_route',
      expectedRoute:null,
      subtype:'near_domain_not_current_route',
      confusableFamily:families[routeId],
      semanticAxis:'unsupported_operational_or_representation_decision_inside_current_domain',
      wordingPattern,
      intendedCalibrationStage:'fallback_identity_safety'
    });
  }
}
for (const text of outsideCurrent22) rows.push({
  id:`V04-FI-C3-${String(index++).padStart(3,'0')}`,
  text,
  identityLabel:'non_route', expectedRoute:null, subtype:'outside_current_22',
  confusableFamily:'outside_current22', semanticAxis:'valid_divination_act_outside_frozen_route_inventory',
  wordingPattern:`outside_${String(index-1).padStart(3,'0')}`, intendedCalibrationStage:'fallback_identity_safety'
});
for (const text of routeUnresolved) rows.push({
  id:`V04-FI-C3-${String(index++).padStart(3,'0')}`,
  text,
  identityLabel:'non_route', expectedRoute:null, subtype:'route_unresolved',
  confusableFamily:'route_unresolved', semanticAxis:'eligible_decision_without_sufficient_current_route_identity',
  wordingPattern:`unresolved_${String(index-1).padStart(3,'0')}`, intendedCalibrationStage:'fallback_identity_safety'
});
if (rows.length !== 264) throw new Error(`fresh calibration v0.3 rows ${rows.length} != 264`);

const artifact = {
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-calibration-v0.3',
  status:'presealed_fallback_stage_calibration',
  sealed:false,
  scope:'liuyao_semantic_fallback_identity_v0.2',
  schema:schemaPath,
  createdAfterSchemaFreeze:true,
  carriedTraining:{
    path:schema.carriedTrainingAugmentation.path,
    sha256:schema.carriedTrainingAugmentation.sha256,
    mutationAllowed:false
  },
  supersededCalibration:{
    path:schema.supersededCalibration.path,
    sha256:schema.supersededCalibration.sha256,
    thresholdSelectionEligible:false,
    mutationAllowed:false
  },
  policy:{
    useForFallbackIdentityTraining:false,
    useForThresholdCalibration:true,
    oneGlobalThresholdOnly:true,
    routeSpecificThresholdsForbidden:true,
    routerTop2UsedAsGenerationFilter:false,
    semanticActProbabilityUsedForGeneration:false,
    routeabilityProbabilityUsedForGeneration:false,
    fallbackIdentityProbabilityUsed:false,
    encoderScoringObserved:false,
    sourceReachabilityFailureAggregateOnly:true,
    sourceReachabilityFailureResultsRowsRead:false,
    independentEvaluationRead:false,
    sealedBlindEvaluationRead:false,
    candidateV03FailureRowsRead:false,
    newThemeResearchImported:false,
    traditionalLiuYaoFeaturesUsed:false
  },
  rows
};
fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log('Candidate v0.4 Fallback Identity v0.2 fresh stage-specific calibration v0.3 generated without encoder scoring.');
console.log('- rows: 264 = 132 known (6/route) + 88 near-domain + 22 outside-current22 + 22 unresolved');
console.log('- carried v0.2 training augmentation is referenced by locked SHA and not regenerated.');
console.log('- failed reachability results rows and model probabilities were not read for generation.');
