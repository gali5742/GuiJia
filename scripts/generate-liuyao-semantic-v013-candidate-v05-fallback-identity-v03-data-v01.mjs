import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'))
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`)

const contractPath = 'data/liuyao-semantic-v013-candidate-v05-data-contract-v0.1.json'
const methodologyPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-methodology-v0.1.json'
const trainingPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-training.json'
const calibrationPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration.json'
const contract = readJson(contractPath)
const methodology = readJson(methodologyPath)

if (contract.status !== 'frozen_before_candidate_v05_data_generation_or_encoder_scoring') throw new Error('v0.5 data contract is not frozen')
if (methodology.status !== 'frozen_before_v05_training_data_generation_or_encoder_scoring') throw new Error('v0.3 methodology is not frozen')
if (fs.existsSync(path.join(root, trainingPath)) || fs.existsSync(path.join(root, calibrationPath))) throw new Error('v0.5 train/calibration artifact already exists')

const routeConfig = {
  financial_fortune: {
    family: 'general_finance', axis: 'overall_personal_financial_state_not_single_transaction',
    trainBases: ['最近家里每个月能留下的余量一直不多', '今年日常开销之后手头总是很紧', '这阵子能自由安排的钱比以前少了', '接下来几个月我的整体用钱状态有些压迫感'],
    trainGoals: ['慢慢宽裕起来', '比眼下更有余地', '不再一直这么紧绷'],
    calBases: ['最近生活支出一项接一项地来', '今年手边可以机动的钱一直有限', '这几个月总觉得钱刚到手就有去处', '眼下家庭开销让我安排事情比较拘束'],
    calGoals: ['逐渐轻松一些', '后面更从容一点'],
    nearBases: ['我想把每月开支重新分成几个类别记录', '家里的账本现在按用途和日期混在一起'], nearGoals: ['换成按周整理会不会更顺手', '改成固定格式记下来是否更清楚']
  },
  business_operation: {
    family: 'general_finance', axis: 'ongoing_venture_viability_not_single_trade_or_partner_choice',
    trainBases: ['我一直守着的小店最近来客忽多忽少', '手上这门小生意最近每天的情况差别很大', '这个摊子近来收支起伏让我有点拿不准', '我每天经营的这个地方最近不太稳定'],
    trainGoals: ['继续做下去还能稳住', '往后维持得住', '逐渐恢复正常运转'],
    calBases: ['这家小铺最近一周忙一周闲', '我现在做的这门生意客流一直不规律', '这个小馆子近来每天的收入差得很多', '手里这摊事情最近时好时坏'],
    calGoals: ['后面慢慢站稳', '继续撑得下去'],
    nearBases: ['店里的值班表现在总是临时改', '我想重新安排柜台和展示架的位置'], nearGoals: ['改成每周提前排好是否更省事', '按动线重新摆放会不会更顺手']
  },
  commercial_transaction: {
    family: 'general_finance', axis: 'specific_trade_completion_between_counterparties',
    trainBases: ['我和对方谈的那批东西还剩两个条件没说定', '双方对眼前这批货已经来回谈了几轮', '这一次对方看过东西后还没有最后表态', '我们两边关于这批东西只差最后一点意见'],
    trainGoals: ['最终把这回事定下来', '把剩下的条件谈拢', '让双方最后达成一致'],
    calBases: ['眼前这一批东西我们已经谈到最后一步', '对方对这次的条件大部分都接受了', '我们双方只剩一个细节还在来回商量', '这回事前面的条件都已经谈得差不多'],
    calGoals: ['最后顺利说定', '最终形成一致结果'],
    nearBases: ['我想把双方往来的文件重新按日期归档', '这批东西的规格说明现在分散在几个表里'], nearGoals: ['统一成一个目录会不会更方便查找', '改成一张总表是否更好维护']
  },
  inventory_purchase: {
    family: 'inventory_flow', axis: 'goods_flow_into_business_stock',
    trainBases: ['店里下一轮要用的包装材料已经不多了', '后面做东西要用的常备原料快见底了', '柜台后面常用的小件只剩最后一批', '接下来几周要用的耗材目前还缺一截'],
    trainGoals: ['在断档以前补齐', '及时把缺的部分添上', '赶在需要之前备够'],
    calBases: ['仓库里常用的纸盒只够再用几天', '后面一批要用的材料现在还没有备全', '店里经常消耗的配件数量已经很低', '下个月要用的几个常备品目前还差不少'],
    calGoals: ['及时补足缺口', '在使用前准备齐全'],
    nearBases: ['我想把补货清单按货架位置重新排序', '仓库里的材料标签现在大小格式不一致'], nearGoals: ['这样整理会不会更容易盘点', '统一标签格式是否更方便查找']
  },
  inventory_sale: {
    family: 'inventory_flow', axis: 'goods_flow_out_of_existing_business_stock',
    trainBases: ['仓库角落那批旧款已经压了很长时间', '架子上上一季剩下的东西还有不少', '后屋堆着的几箱旧品一直占着位置', '店里剩下的老款最近几乎没有变化'],
    trainGoals: ['慢慢走掉一部分', '后面逐渐减少', '陆续腾出位置'],
    calBases: ['仓库里那批过季品已经放了几个月', '展示架后面还有不少以前留下的款式', '上一批剩下的东西现在仍然堆在那里', '库房里几箱旧货一直没有明显减少'],
    calGoals: ['以后逐步走出去', '接下来慢慢消化掉'],
    nearBases: ['我想把旧款按年份重新分区摆放', '仓库里过季品的编号现在不连续'], nearGoals: ['重新分组会不会更容易清点', '统一编号是否更方便管理']
  },
  borrow_money: {
    family: 'money_direction', axis: 'money_moves_from_other_to_querent_as_temporary_funding',
    trainBases: ['眼前正好有一段资金空档让我安排不开', '这两周手里差一截可用的钱卡住了后面的事', '最近有个临时缺口让我周转得比较吃力', '我现在手边短了一小段过渡用的钱'],
    trainGoals: ['有人先帮我把这一段接上', '暂时得到一笔支持撑过去', '有人替我先补住这个空档'],
    calBases: ['最近一笔支出提前来了让我手边断了一截', '眼下需要用的钱比能马上拿出的多一点', '这阵子刚好有一段短期的资金空白', '手头现在差一点才能把眼前安排接起来'],
    calGoals: ['有人临时帮我顶住', '得到一笔过渡支持'],
    nearBases: ['我准备把应急资金单独做一个表记录', '现在几张账户的余额放在不同页面里'], nearGoals: ['统一汇总会不会更容易查看', '按用途分栏是否更方便管理']
  },
  lend_money: {
    family: 'money_direction', axis: 'money_moves_from_querent_to_other_as_temporary_funding',
    trainBases: ['朋友最近手边短了一截来问我能不能先帮忙', '熟人眼下有个短期缺口想让我先垫一部分', '对方这阵子周转不开希望我先拿一点出来', '朋友临时差一段可用的钱来找我商量'],
    trainGoals: ['我先拿一部分给他过渡会合适', '我先替他补这一截会稳妥', '我先给他一笔临时支持会妥当'],
    calBases: ['一个熟人最近临时卡住想让我先出一部分', '朋友手头这几天接不上来问我能不能帮一下', '对方短期内有个缺口希望我先拿一点给他', '熟人这阵子有一段空档想让我先替他顶住'],
    calGoals: ['我先帮他接上这一段会合宜', '我先拿一点出去会稳当'],
    nearBases: ['我想把和熟人的往来记录单独放一个文件夹', '平时替别人垫付的小额记录现在很零散'], nearGoals: ['按人名整理会不会更容易核对', '改成每月汇总是否更清楚']
  },
  debt_collection: {
    family: 'money_direction', axis: 'previously_owed_money_returns_to_querent',
    trainBases: ['早些时候留在对方那边的一笔钱一直没有回来', '之前放在别人手里的那一份已经拖了很久', '去年留在对方那里的那部分到现在还在外面', '先前交到那边的一笔到现在都没有回到我这里'],
    trainGoals: ['最后重新回到我手上', '之后慢慢回到我这边', '最终把那一份拿回来'],
    calBases: ['前一阵留在对方手里的那笔至今没有动静', '以前放出去的那一部分现在仍在别人那里', '那边一直留着我先前的一笔没有处理回来', '之前交过去的那一份已经隔了很长时间'],
    calGoals: ['后面回到我这里', '最终重新拿回来'],
    nearBases: ['我想把以前的往来日期整理成提醒日历', '几笔旧记录现在分散在聊天和表格里'], nearGoals: ['集中成一张清单会不会更好查', '按时间顺序整理是否更方便跟进']
  },
  debt_repayment: {
    family: 'money_direction', axis: 'querent_clears_own_existing_obligation',
    trainBases: ['我名下那笔旧账已经挂了很长一段时间', '一直压在我这边的一份账目还没有收尾', '我这里有一笔以前留下的账始终没处理干净', '那笔长期挂着的账让我一直需要留心'],
    trainGoals: ['后面彻底处理完', '最终把这件事收尾', '慢慢清理到没有遗留'],
    calBases: ['我这边还有一笔拖了很久的旧账没有结束', '以前留下的一项账目现在仍然挂着', '名下那份长期账目到现在还没收干净', '有一笔旧的账务一直占着我的安排'],
    calGoals: ['以后顺利了结', '接下来彻底收干净'],
    nearBases: ['我准备把每一笔到期日期放进同一个日历', '现在账务提醒分散在好几个应用里'], nearGoals: ['集中管理会不会更不容易漏掉', '改成一处记录是否更方便查看']
  },
  partnership: {
    family: 'partnership_operation', axis: 'whether_to_or_can_operate_jointly_with_specific_partner',
    trainBases: ['我和另一个人准备各自拿一部分资源一起做这件事', '我们两边打算分开负责不同部分再一起推进', '我和这个人想把各自手里的东西合到同一个项目里', '我们准备两边各出一部分力量把这摊事做起来'],
    trainGoals: ['长期一起做得稳', '后面配合得住', '把这件事共同维持下去'],
    calBases: ['我和他准备一人负责一块把事情一起往前推', '我们双方打算各自投入资源共同做一个项目', '我和这个人正在考虑把两边的事情并在一起推进', '我们想各自承担一部分然后长期一起做'],
    calGoals: ['往后配合稳定', '以后共同做得下去'],
    nearBases: ['我们共用的任务板现在栏目太多', '两边共享文件的权限目前经常弄混'], nearGoals: ['改成按负责人分栏会不会更清楚', '重新划分访问范围是否更好管理']
  },
  investment_profit: {
    family: 'investment_goal', axis: 'return_or_gain_from_investment',
    trainBases: ['我前些时候放进去的那部分钱已经留了一阵', '之前放在里面的那一份现在还没有动', '我手上那部分已经在里面放了好几个月', '前段时间放进去的那份目前仍然留着'],
    trainGoals: ['以后比现在多回来一些', '后面给我带回更多', '最终有所增加'],
    calBases: ['我之前留在里面的那部分已经过了一段时间', '手里那一份放进去以后现在还在原处', '前一阵放进去的那笔目前没有退出', '我留下的那部分准备再放一段时间'],
    calGoals: ['之后有所增长', '最后多带回来一点'],
    nearBases: ['我想把观察记录改成每周固定更新一次', '现在几个价格来源都放在同一张表里'], nearGoals: ['分开记录会不会更容易比较', '按周整理是否更方便回看']
  },
  investment_liquidation: {
    family: 'investment_goal', axis: 'exit_or_sell_out_existing_investment',
    trainBases: ['我现在手里留着的那一份准备全部撤出来', '之前放着的那部分我不想再继续留了', '手上这一份我打算一次完整退出', '我准备把目前还留着的那部分全部结束掉'],
    trainGoals: ['顺利完整收回来', '最后全部退出去', '把这一份完整结束'],
    calBases: ['我手里现在这一份已经决定不再继续放着', '之前留下的那部分我想全部拿回到手边', '眼前这一份我准备一次性全部撤掉', '我不打算再保留现在手里的这一部分'],
    calGoals: ['最终全部退出', '顺利完整拿回'],
    nearBases: ['我想把已经结束的记录单独移到归档页', '以前的退出记录现在和持有记录混在一起'], nearGoals: ['分开显示会不会更清楚', '按年份归档是否更方便查找']
  },
  investment_suitability: {
    family: 'investment_goal', axis: 'whether_entering_or_holding_investment_is_suitable',
    trainBases: ['眼前这个去处需要我放一部分积蓄进去我还在考虑', '我正在想要不要把手里一部分钱放到这个选择里', '这个方向要占用我一部分可用的钱我还没有决定', '目前这个选择需要投入一部分资金我有些犹豫'],
    trainGoals: ['对我现在的情况合适', '和我的条件相称', '对我来说比较稳妥'],
    calBases: ['面前这个选择需要拿出一部分积蓄我正在权衡', '我还在考虑是否把一部分可用资金放到这个方向', '这个去处会占用我手头一部分钱我没有决定', '眼下有个需要投入资金的选择我正拿不准'],
    calGoals: ['适合我目前参与', '对我会比较妥当'],
    nearBases: ['我想把几个备选方向的资料统一放进一张比较表', '现在观察用的指标太多看起来有些乱'], nearGoals: ['只保留固定几项会不会更清楚', '按类别分组是否更容易维护']
  },
  investment_position_decision: {
    family: 'investment_goal', axis: 'increase_reduce_or_hold_position_choice',
    trainBases: ['我手里现在留着的那一份不知道该保留多少', '目前这一份我在犹豫要不要调整占的比例', '手上这部分我还没想好下一步留多还是留少', '现在这一份占得不少我在考虑重新分配'],
    trainGoals: ['多留一点会更合适', '少留一点会更稳妥', '维持现在的比例会更好'],
    calBases: ['我目前留着这一部分还拿不准下一步的比例', '手里这份东西我正在考虑要不要改变多少', '现在保留的这一份让我犹豫该增加还是减少', '眼前这一部分我还没有决定接下来留多少'],
    calGoals: ['调整到更多会更妥当', '收回一部分会更稳'],
    nearBases: ['我想把每次调整的原因单独加一列记录', '现在比例变化只写在备注里不太好看'], nearGoals: ['改成独立字段会不会更清楚', '用图表展示是否更方便回顾']
  },
  investment_price_trend: {
    family: 'investment_goal', axis: 'future_market_price_direction',
    trainBases: ['我一直留意的这一份最近几天上下变化很快', '手里这个东西近来一会高一会低看不清方向', '这段时间它的价格来回波动让我拿不准', '我关注的这一份最近一直在上下反复'],
    trainGoals: ['接下来慢慢走高', '后面出现向上的方向', '之后比现在抬高一些'],
    calBases: ['最近这一份的价格连续几天来回摆动', '我看的这个东西近来高低变化没有规律', '这几天它一直在一个范围里上下晃动', '眼下这一份的价格方向还不太明显'],
    calGoals: ['后面逐渐抬起来', '接下来往更高处走'],
    nearBases: ['我想把价格图的时间范围改成固定一个月', '现在观察页面同时放了太多曲线'], nearGoals: ['只保留主要两条会不会更清楚', '固定周期显示是否更方便比较']
  },
  income_salary: {
    family: 'employment_income', axis: 'recurring_fixed_employment_pay',
    trainBases: ['公司每个月固定发给我的那一份已经很久没变', '我按月从公司拿到的固定部分一直保持原样', '每个月固定到账的那一份这段时间没有调整', '公司按月给我的固定那部分已经连续很久一样'],
    trainGoals: ['以后比现在多一些', '后面得到提高', '接下来增加一点'],
    calBases: ['我每月固定从公司收到的那部分目前还是原数', '公司按月给我的固定一份今年一直没有变化', '每个月稳定到账的那一部分已经很久相同', '我从公司按月拿到的固定部分最近没有调整'],
    calGoals: ['往后有所增加', '以后提高一些'],
    nearBases: ['我想把每月到账记录按年份自动分组', '现在每个月的收入凭证都散在不同文件夹'], nearGoals: ['统一归档会不会更好查找', '按年度整理是否更方便核对']
  },
  income_bonus: {
    family: 'employment_income', axis: 'nonrecurring_additional_employment_reward',
    trainBases: ['公司年底另外发的那一份今年还没有确定', '这次项目结束后额外给的一部分目前没有消息', '公司说今年可能还会另外分一份但现在没定', '年末在固定部分之外多给的那一份还没有通知'],
    trainGoals: ['最后有我的一份', '最终落到我这里', '之后能给到我'],
    calBases: ['今年公司额外发的那部分到现在还没公布', '项目收尾以后另外给的一份目前仍未确定', '固定部分之外今年会不会再给一份还没消息', '公司年末额外安排的那一部分现在没有结果'],
    calGoals: ['最终轮到我', '后面有我的份'],
    nearBases: ['我想把额外收入和固定收入分开做统计', '现在公司给的各种凭证都放在同一个目录'], nearGoals: ['分成两个类别会不会更清楚', '按来源重新整理是否更方便查找']
  },
  receive_item: {
    family: 'item_flow', axis: 'arrival_or_receipt_of_already_expected_item',
    trainBases: ['我已经订下的那台显示器商家说正在安排送出', '前几天确定下来的那张桌子现在在运输途中', '店家已经确认我订的那本书正在往这边送', '我之前定好的那件东西对方说已经交给配送'],
    trainGoals: ['这几天顺利来到我这里', '按预计时间到我手上', '最后顺利收到'],
    calBases: ['我已经定下的那副耳机商家说很快会送出', '前几天确认的那件家具现在已经在路上', '店家说我订好的那样东西已经进入配送流程', '我之前确定要的那一件对方说已经发出来了'],
    calGoals: ['近期来到我这边', '按计划落到我手上'],
    nearBases: ['我想把配送通知只保留到货前一天再提醒', '几个包裹的追踪信息现在散在不同应用里'], nearGoals: ['统一到一张清单会不会更好看', '改成一次集中提醒是否更省事']
  },
  item_purchase: {
    family: 'item_flow', axis: 'whether_to_acquire_specific_item',
    trainBases: ['店里那副耳机我看了几次但还没有决定带走', '网上那把椅子我已经比较了一阵还没最后定', '我看中的那台相机现在还放在备选里', '那件外套我试过以后一直在想要不要定下来'],
    trainGoals: ['现在把它定下来会合适', '把这件东西带回去会值得', '选择它对我会比较妥当'],
    calBases: ['我关注的那台键盘已经比较了好几天仍没决定', '店里那双鞋我试过以后还在犹豫要不要带走', '网上那盏灯我看了很久还没有最后选择', '那台小机器我已经研究一阵但还没定下来'],
    calGoals: ['现在选择它会稳妥', '把它带回来会合适'],
    nearBases: ['我想把购物比较表的栏目从八个减到四个', '现在保修凭证和说明书放在不同地方'], nearGoals: ['集中到一个目录会不会更好找', '只保留关键参数是否更方便比较']
  },
  relationship_development: {
    family: 'relationship', axis: 'trajectory_of_non_marital_romantic_connection',
    trainBases: ['我和这个人最近联系比以前频繁但还没有说开', '我们这阵子常常聊天见面关系有些靠近', '我和他最近互动越来越多但目前还没有明确关系', '这段时间我们彼此主动联系的次数明显变多'],
    trainGoals: ['之后慢慢更靠近', '往更亲密的方向发展', '后面关系更进一步'],
    calBases: ['最近我和这个人见面的次数比以前多了', '我们现在会主动找对方聊天但还没有定性', '我和他这阵互动很自然却没有明确说是什么关系', '最近彼此联系变多让我感觉关系正在变化'],
    calGoals: ['以后继续靠近', '后面变得更亲密'],
    nearBases: ['我想把联系人备注里的分类重新整理一下', '现在纪念日和见面安排都记在不同日历里'], nearGoals: ['统一放在一个日历会不会更方便', '改成更少的标签是否更容易维护']
  },
  marriage_match: {
    family: 'relationship', axis: 'suitability_of_specific_person_for_marriage',
    trainBases: ['我在认真考虑以后和这个人一起组成家庭', '我们已经谈到长期生活我在想彼此是否真的合适', '我把这个人当作未来长期伴侣来考虑但还有犹豫', '现在关系已经到了需要认真考虑共同生活的阶段'],
    trainGoals: ['两个人长期生活会合适', '把以后放在一起会稳妥', '作为长期伴侣彼此相称'],
    calBases: ['我和这个人已经开始讨论以后是不是一起生活', '这段关系让我认真考虑将来共同成家是否合适', '我正在把对方作为长期人生伴侣来权衡', '我们已经走到需要考虑未来家庭安排的阶段'],
    calGoals: ['长期走下去彼此合适', '组成家庭会比较稳妥'],
    nearBases: ['我们正在整理以后共同生活需要准备的物品清单', '两个人的家庭文件现在分别放在不同地方'], nearGoals: ['统一归类会不会更方便', '按用途分组是否更容易维护']
  },
  marital_relationship: {
    family: 'relationship', axis: 'state_and_trajectory_of_existing_marriage',
    trainBases: ['我和家里那位最近说话比以前少了很多', '我们共同生活这阵子常常因为小事僵住', '最近家里的相处状态明显没有前一阵轻松', '两个人一起生活以来最近一段交流越来越少'],
    trainGoals: ['之后重新缓和下来', '往后恢复稳定相处', '慢慢回到比较和顺的状态'],
    calBases: ['最近我和家里那个人之间经常各忙各的很少交流', '共同生活这段时间我们之间的气氛有些紧', '这阵子两个人在家里说几句话就容易停住', '最近共同生活里的相处让我感觉比以前疏远'],
    calGoals: ['后面关系重新平稳', '以后慢慢缓和'],
    nearBases: ['家里的共同日历现在经常忘记同步安排', '两个人分担家务的清单目前写得很零散'], nearGoals: ['改成每周统一更新会不会更方便', '按房间分组是否更容易执行']
  }
}

const classOrder = methodology.training.classOrder
if (classOrder.length !== 22 || Object.keys(routeConfig).length !== 22) throw new Error('route config must cover 22 classes')
for (const routeId of classOrder) if (!routeConfig[routeId]) throw new Error(`missing route config ${routeId}`)

const trainFrames = [
  (base, goal) => `${base}，接下来会不会${goal}？`,
  (base, goal) => `${base}，往后看能不能${goal}？`,
  (base, goal) => `${base}，之后是否有机会${goal}？`
]
const calFrames = [
  (base, goal) => `${base}，后面会不会${goal}？`,
  (base, goal) => `${base}，往下发展能不能${goal}？`
]
const nearFrames = [
  (base, goal) => `${base}，${goal}？`,
  (base, goal) => `${base}，这样调整以后${goal}？`
]

const trainingRows = []
const calibrationRows = []
let trainIndex = 1
let calKnownIndex = 1
let calNonRouteIndex = 1

for (const routeId of classOrder) {
  const cfg = routeConfig[routeId]
  for (let b = 0; b < 4; b += 1) {
    for (let g = 0; g < 3; g += 1) {
      const frame = trainFrames[(b + g) % trainFrames.length]
      trainingRows.push({
        id: `V05-FI-T-${String(trainIndex++).padStart(3, '0')}`,
        split: 'training', identityLabel: 'route_identity_positive', expectedRoute: routeId,
        subtype: 'fallback_stage_known', semanticAxis: cfg.axis, confusableFamily: cfg.family,
        surfaceFamily: `${routeId}_surface_${b + 1}`, wordingPattern: `train_b${b + 1}_g${g + 1}_f${(b + g) % 3 + 1}`,
        fallbackStyle: true, text: frame(cfg.trainBases[b], cfg.trainGoals[g])
      })
    }
  }
  for (let b = 0; b < 4; b += 1) {
    for (let g = 0; g < 2; g += 1) {
      const frame = calFrames[(b + g) % calFrames.length]
      calibrationRows.push({
        id: `V05-FI-C-K-${String(calKnownIndex++).padStart(3, '0')}`,
        split: 'calibration', identityLabel: 'route_identity_positive', expectedRoute: routeId,
        subtype: 'fallback_stage_known', semanticAxis: cfg.axis, confusableFamily: cfg.family,
        surfaceFamily: `${routeId}_cal_surface_${b + 1}`, wordingPattern: `cal_known_b${b + 1}_g${g + 1}_f${(b + g) % 2 + 1}`,
        fallbackStyle: true, text: frame(cfg.calBases[b], cfg.calGoals[g])
      })
    }
  }
  for (let b = 0; b < 2; b += 1) {
    for (let g = 0; g < 2; g += 1) {
      const frame = nearFrames[(b + g) % nearFrames.length]
      calibrationRows.push({
        id: `V05-FI-C-N-${String(calNonRouteIndex++).padStart(3, '0')}`,
        split: 'calibration', identityLabel: 'non_route', expectedRoute: null,
        subtype: 'near_domain_not_current_route', pressureFamily: routeId,
        semanticAxis: `adjacent_operational_question_outside_${routeId}_identity`, confusableFamily: cfg.family,
        wordingPattern: `near_${routeId}_b${b + 1}_g${g + 1}`, text: frame(cfg.nearBases[b], cfg.nearGoals[g])
      })
    }
  }
}

const outsideBases = [
  '办公室共享文件现在按每个人自己的习惯命名', '团队周会的记录目前散在好几个文档里', '我每天通勤要换乘两次最近总在同一段绕路', '家里几个房间的收纳标签现在没有统一格式',
  '我准备把学习资料从按课程改成按主题分类', '工作里的待办清单现在同时放在三个应用中', '旅行计划里的地点和交通信息目前混在同一页', '我想把照片备份从按设备改成按年份保存',
  '现在几个项目的会议纪要都放在一个总目录里', '我打算把常用模板从个人文件夹移到共享目录', '每天需要重复填写的工作记录有好几处相同内容'
]
const outsideGoals = ['改成固定规则会不会更省事', '重新整理以后是否更容易维护', '换一种归类方式会不会更清楚', '集中到一个地方是否更方便使用']
for (let b = 0; b < outsideBases.length; b += 1) {
  for (let g = 0; g < 4; g += 1) {
    calibrationRows.push({
      id: `V05-FI-C-N-${String(calNonRouteIndex++).padStart(3, '0')}`,
      split: 'calibration', identityLabel: 'non_route', expectedRoute: null, subtype: 'outside_current_22',
      semanticAxis: 'modern_operational_choice_outside_current_22', confusableFamily: 'outside_current_22',
      wordingPattern: `outside_b${b + 1}_g${g + 1}`, text: `${outsideBases[b]}，${outsideGoals[g]}？`
    })
  }
}

const unresolvedBases = [
  '眼前这笔钱相关的安排还有几个方向我没有说明是哪一种', '我手上这份东西接下来到底要怎么处理现在信息还不完整', '我和对方之间这件事目前只知道还没有定下来', '公司之后可能会给我一部分但现在不知道属于哪一种',
  '店里这批东西后面会有变化但我还没说是要补还是要清掉', '我和这个人后面的关系有变化但现在没有说明彼此是什么状态', '手里这一部分之后可能要调整但我没有说是进还是出', '对方那里还有一笔和我有关的钱但方向目前没有交代清楚',
  '这个具体物件后面会发生什么我现在只知道事情还在推进', '我手边这段资金安排有变化但没有说明是谁给谁', '眼前这个项目涉及两个人但我还没说明是在一起做还是只讨论一件事'
]
const unresolvedGoals = ['后面会不会顺利一点', '最终能不能有明确结果', '接下来是否会出现变化', '往后看能不能慢慢明朗']
for (let b = 0; b < unresolvedBases.length; b += 1) {
  for (let g = 0; g < 4; g += 1) {
    calibrationRows.push({
      id: `V05-FI-C-N-${String(calNonRouteIndex++).padStart(3, '0')}`,
      split: 'calibration', identityLabel: 'non_route', expectedRoute: null, subtype: 'route_unresolved',
      semanticAxis: 'insufficient_direction_or_role_to_resolve_current22_identity', confusableFamily: 'route_unresolved',
      wordingPattern: `unresolved_b${b + 1}_g${g + 1}`, text: `${unresolvedBases[b]}，${unresolvedGoals[g]}？`
    })
  }
}

if (trainingRows.length !== 264) throw new Error(`training rows ${trainingRows.length} !=264`)
if (calibrationRows.length !== 352) throw new Error(`calibration rows ${calibrationRows.length} !=352`)

const policy = {
  encoderScoringObserved: false,
  semanticActProbabilityUsedForGeneration: false,
  routeabilityProbabilityUsedForGeneration: false,
  fallbackSoftmaxProbabilityUsedForGeneration: false,
  officialV04IndependentRowsReadForGeneration: false,
  officialV04IndependentResultsRowsRead: false,
  v04DevelopmentRowsUsedForGeneration: false,
  sealedBlindEvaluationRead: false,
  postBaselineNewThemeCorpusImported: false
}

writeJson(trainingPath, {
  version: '0.13-candidate-v0.5-fallback-identity-v0.3-training-v0.1',
  status: 'presealed_fallback_identity_v03_training', sealed: false,
  dataContract: contractPath, methodology: methodologyPath, policy,
  summary: { rows: trainingRows.length, routeKnown: 264, nonRoute: 0, rowsPerRoute: 12, routeCount: 22 },
  rows: trainingRows
})
writeJson(calibrationPath, {
  version: '0.13-candidate-v0.5-fallback-identity-v0.3-calibration-v0.1',
  status: 'presealed_fallback_identity_v03_calibration', sealed: false,
  dataContract: contractPath, methodology: methodologyPath, policy,
  summary: { rows: calibrationRows.length, known: 176, nonRoute: 176, knownRowsPerRoute: 8, nearDomain: 88, outsideCurrent22: 44, routeUnresolved: 44 },
  rows: calibrationRows
})

console.log('Candidate v0.5 Fallback Identity v0.3 fresh data generated without encoder/model scoring.')
console.log('- training: 264 known = 22 routes x12')
console.log('- calibration: 352 = 176 known + 88 near-domain + 44 outside-current22 + 44 unresolved')
