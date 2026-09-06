import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'))
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`)

const contractPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v011-data-contract-v0.1.json'
const methodologyPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-methodology-v0.1.json'
const outputPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v0.1.1.json'
const contract = readJson(contractPath)
const methodology = readJson(methodologyPath)
if (contract.status !== 'frozen_before_calibration_v011_generation_or_encoder_scoring') throw new Error('v0.1.1 contract not frozen')
if (methodology.status !== 'frozen_before_v05_training_data_generation_or_encoder_scoring') throw new Error('methodology drift')
if (fs.existsSync(path.join(root, outputPath))) throw new Error('calibration v0.1.1 already exists')

const cfg = {
  financial_fortune: {
    known: ['这一阵我的日常收入和支出合在一起看，总觉得能支配的余量不大', '今年几项固定开销叠在一起，手头整体显得比往常紧', '最近每个月结余忽多忽少，我对自己的整体钱况没有把握', '接下来还有几笔生活支出要安排，我想知道手边总体能否松一点'],
    goals: ['后面逐渐宽松起来', '之后整体比现在从容', '往下走能多留下一些余地'],
    near: ['我准备把每月可用的钱先按生活、储备和兴趣三部分固定分开', '我想把几张卡的日常消费都集中到同一个账户结算', '以后收到钱时我准备先留固定比例再安排其他支出', '我打算把家庭共同开销改成每周统一结算一次', '我准备给临时支出单独设一个上限避免挤占固定部分'],
    nearGoals: ['这种分配方式长期会不会更顺手', '这样安排以后是否更容易控制节奏', '这种做法执行起来会不会更稳定', '换成这个方式是否更适合日常使用']
  },
  business_operation: {
    known: ['我现在一直经营的这家小店最近客人和收入都不太稳定', '手里这门生意已经做了一阵，但最近整体运转让我有些拿不准', '这个小铺这几个月时忙时闲，我担心后面越来越难维持', '我每天守着的这个生意近期状态起伏明显，想看以后能不能站稳'],
    goals: ['继续经营下去还能维持住', '以后整体慢慢稳定下来', '后面仍有持续做下去的空间'],
    near: ['店里准备把营业时间整体往后延一个小时', '我想把原来每天都开的做法改成每周固定休一天', '这个月准备把堂食和外带的接单顺序重新调整', '店里打算把高峰时段的人手从两个人改成三个人', '我准备把预约和现场到店分成两条不同处理流程'],
    nearGoals: ['这种经营安排会不会更顺畅', '这个流程调整是否更适合现在的店', '长期按这个方式运转会不会更省力', '这样改以后日常执行是否更稳']
  },
  commercial_transaction: {
    known: ['眼前这笔具体交易双方已经谈过几轮，但最后条件还没有完全一致', '我和对方关于这一批东西的价钱和交付都谈得差不多，只剩收尾', '这次买卖前面的条件基本讲清楚了，对方还没有最终点头', '双方正在推进眼前这单具体生意，我想知道最后能不能真正定成'],
    goals: ['最后形成双方都接受的结果', '顺利把这单事情落定', '把剩下分歧谈到一致'],
    near: ['这次交易准备把验货从现场查看改成视频确认', '双方想把原先分两次交接改成一次完成', '这一批货准备把纸质确认改成电子签收', '我们想把对账频率从月底一次改成每周一次', '这单业务准备把沟通窗口固定由一个人统一负责'],
    nearGoals: ['这种操作安排会不会更合适', '改成这个流程是否更容易执行', '这样处理以后会不会更省事', '这种协作方式长期是否更顺']
  },
  inventory_purchase: {
    known: ['仓库里接下来生产要用的常备材料已经剩得不多，我担心后面接不上', '店里下一阶段要消耗的一批基础用品目前数量偏少', '后面几周要持续用的原料现在库存已经很薄', '仓库中经常消耗的那类材料快到最低量，我想看后面能否及时接续'],
    goals: ['需要用的时候能够接得上', '后面不至于出现断档', '之后所需数量能够及时到位'],
    near: ['仓库准备把常用材料从月底盘点改成每周盘点', '我想把原料的最低库存线从固定数量改成按周消耗计算', '仓库准备把常用和不常用的材料放到不同区域', '以后每次材料入库我想当场核对而不是月底统一核对', '我准备把材料领取从自由拿取改成登记后再领'],
    nearGoals: ['这种库存管理方式会不会更稳', '这样调整是否更适合现在的使用量', '长期执行这个办法会不会更顺', '改成这个规则是否更容易管理']
  },
  inventory_sale: {
    known: ['仓库里前一季留下的一批旧款一直占着位置，我想看以后能不能逐步减少', '店里还有不少以前剩下的货长期没有明显变化', '后仓压着一批不再主推的东西，我担心一直留在那里', '展示之外还有一批旧品数量不少，想知道后面能否慢慢出去'],
    goals: ['接下来逐渐减少库存', '以后陆续从仓库出去', '后面把占着的位置腾出来'],
    near: ['店里准备把旧款从后排移到入口附近展示', '我想把剩余商品从按品牌摆放改成按用途摆放', '仓库准备把长期未动的商品单独划一个区域', '店里打算每周轮换一次旧品的展示位置', '我准备把旧款说明牌从统一模板改成突出不同特点'],
    nearGoals: ['这种陈列安排会不会更合适', '这样调整日常管理是否更顺', '长期采用这个办法会不会更方便', '这种操作方式是否更适合现状']
  },
  borrow_money: {
    known: ['我眼下有一段短期资金缺口，靠手边现有的钱暂时接不上', '最近几笔支出挤在一起，让我这段时间需要额外的一点过渡资金', '手边现在差一小截才能把近期安排接起来，我自己暂时补不上', '这阵子现金安排出现短暂空档，我想知道能否有人给我一段支持'],
    goals: ['从别人那里得到一笔临时支持', '有人先把这段缺口接住', '暂时得到外部资金帮我渡过'],
    near: ['如果真的需要临时周转，我准备把期限统一控制在一个月以内', '我想把所有短期周转都改成固定日期统一核对', '以后遇到临时缺口我准备先缩减非必要支出再处理其他办法', '我打算给短期周转单独设一个最高额度', '涉及临时资金时我准备只和固定的两三个人沟通'],
    nearGoals: ['这种周转规则会不会更稳妥', '这样安排以后是否更容易控制风险', '长期采用这个办法会不会更合适', '这个处理顺序是否更适合我']
  },
  lend_money: {
    known: ['一个熟人现在有短期资金空档，希望我先拿一部分给他周转', '朋友眼下手头接不上，来问我能不能暂时给他一点支持', '对方最近有一段临时缺口，想让我先从自己手边拿些出来', '认识的人这几天需要一笔过渡资金，我在考虑要不要由我先提供'],
    goals: ['由我先给出去会比较妥当', '我拿一部分给他过渡会合适', '从我这边先出这一笔会比较稳'],
    near: ['以后遇到熟人临时需要钱时我准备统一限定一个最高额度', '我想把替别人临时垫付的期限都固定在较短范围', '涉及朋友资金往来时我准备先写清日期再进行', '以后别人来问临时支持时我想先留足自己的固定支出', '我准备把不同熟人的短期往来分别设定独立额度'],
    nearGoals: ['这种规则是否更稳妥', '这样处理长期会不会更合适', '采用这个顺序是否更容易控制', '这个安排会不会更适合日常往来']
  },
  debt_collection: {
    known: ['以前留在对方那边的一笔钱已经拖了一段时间，我一直没有拿回来', '之前应当回到我这里的那部分现在仍然在别人手上', '对方那边还有属于我的一笔旧款迟迟没有回来', '早些时候留在外面的一笔钱到现在还没有回到我手边'],
    goals: ['之后重新回到我这里', '最后能够拿回手上', '后面顺利回到我这边'],
    near: ['我准备把长期未回来的款项按时间长短分成三级跟进', '以后对方超过约定日期时我想统一在固定时间提醒', '我打算把不同人的旧款分别设置不同的跟进频率', '涉及长期未结事项时我准备先电话沟通再发书面确认', '我想把每次沟通后的下一步日期当场确定下来'],
    nearGoals: ['这种跟进方式会不会更有效率', '这样安排是否更容易持续执行', '长期采用这个顺序会不会更稳', '这种处理规则是否更合适']
  },
  debt_repayment: {
    known: ['我自己名下还有一笔以前留下的账一直没有完全处理结束', '过去积下的一项账务目前仍由我这边承担，想看后面能否收尾', '我这里有一笔长期挂着的旧账还没有彻底清掉', '之前留下的那项付款责任到现在仍然占着我的安排'],
    goals: ['后来彻底处理干净', '最终把这项旧账了结', '之后不再留下这笔负担'],
    near: ['我准备把自己的固定付款日期全部集中在每月同一周', '以后处理旧账时我想先清金额小的再处理大的', '我打算给每月用于清理旧账的金额设一个固定上限', '所有长期账务我准备统一提前三天设置提醒', '我想把不同账务按照到期时间重新安排处理顺序'],
    nearGoals: ['这种清理顺序会不会更适合我', '长期采用这个规则是否更稳', '这样安排是否更容易坚持', '这个付款节奏会不会更顺']
  },
  partnership: {
    known: ['我和另一个人准备各自投入一部分资源共同推进同一件长期项目', '我们两边正在讨论把各自负责的部分接成一个共同经营的事情', '我和对方想长期共同承担这个项目里的不同工作', '两个人准备各出一部分力量，把目前这件事作为共同项目持续做'],
    goals: ['以后共同推进能够稳定', '两边长期配合得下去', '这个共同项目能够持续运转'],
    near: ['共同项目里我们准备把原来交叉负责改成一人负责一块', '两边打算把每周临时沟通改成固定两次碰面', '我们准备把共同支出从谁方便谁先付改成按比例承担', '项目里的最终决定准备从两个人都确认改成分领域负责', '我们想把共享资源的使用改成提前预约而不是随时取用'],
    nearGoals: ['这种共同工作方式会不会更顺', '这样分工长期是否更合适', '改成这个规则会不会更容易配合', '这种安排是否更适合两边执行']
  },
  investment_profit: {
    known: ['我之前已经放进去的一部分资金还留在里面，想看以后能否带回增加', '手上这份已经投入一段时间，目前仍然继续留着', '前些时候放进去的那部分没有退出，我主要关心最后能不能有所增值', '我已有的一份投入现在还在持有，想知道之后能不能产生更多回报'],
    goals: ['以后给我带回更多', '后面出现实际增加', '最终比原来多回来一些'],
    near: ['我准备把观察这份投入的频率从每天改成每周一次', '以后记录这份投入时我想只保留三个主要指标', '我打算把相关消息来源从很多个缩减到固定几个', '观察已有投入时我准备每月底统一复盘而不是随时改变计划', '我想把不同投入的记录改成按风险等级分组'],
    nearGoals: ['这种观察方法会不会更合适', '这样管理长期是否更稳', '采用这个节奏会不会更容易坚持', '这种记录方式是否更适合判断']
  },
  investment_liquidation: {
    known: ['我现在持有的这一份已经准备全部结束，不想再继续留在里面', '手上现有那部分我计划完整退出，主要想看能否顺利收回', '之前留下的一份现在决定不再保留，我准备把它全部撤出来', '目前仍在手里的那部分我想一次性结束持有状态'],
    goals: ['最终完整退出', '顺利全部收回来', '后面把这一份彻底结束'],
    near: ['真正结束持有后我准备把这类记录单独归到已完成类别', '以后决定退出时我想统一分两天执行而不是一次处理', '我准备给退出操作固定一个检查清单避免漏步骤', '处理退出后的资金时我想先放在独立账户再重新安排', '以后每次结束一份持有我准备立即写下当时的理由'],
    nearGoals: ['这种退出管理方式会不会更稳', '这样安排操作是否更顺', '长期采用这个流程会不会更合适', '这个处理节奏是否更容易执行']
  },
  investment_suitability: {
    known: ['眼前这个需要投入资金的方向我还没有参与，正在判断它是否适合自己的情况', '我正在考虑一个新的资金去处，但还没有把钱真正放进去', '目前有个需要占用一部分积蓄的选择，我想先判断和自己是否匹配', '这个新的投入方向我还在观察，主要拿不准自己现在适不适合进入'],
    goals: ['对我当前条件比较合适', '和我现在的情况相称', '由我现在参与会比较妥当'],
    near: ['比较新的投入方向时我准备只看固定的五项资料', '我想把不同选择的观察期统一设成一个月再决定', '以后研究新的方向时我准备先写下不能接受的风险再看收益', '对比几个选择时我打算把信息来源限制在固定渠道', '我准备把每个备选方向都用同一套问题逐项检查'],
    nearGoals: ['这种筛选方法会不会更可靠', '这样比较是否更适合我', '采用这个流程会不会更容易判断', '这个研究顺序是否更稳妥']
  },
  investment_position_decision: {
    known: ['我现在已经持有这一部分，但还没决定接下来应该留多一点还是少一点', '手里现有这份占的比例让我犹豫，正在考虑是否需要调整', '目前这一份已经在手上，我主要拿不准下一步该增加还是减少', '我对现在保留的数量没有把握，想判断后面怎样调整更合适'],
    goals: ['维持现在的比例更稳', '增加一些会更合适', '减少一部分更妥当'],
    near: ['我准备把每次比例变化都限定在总量的固定范围内', '以后调整已有持有时我想固定在每月一个日期检查', '我打算把临时消息导致的调整延后一天再决定', '每次改变比例前我准备先写下原来的计划再比较', '我想给不同风险等级设置不同的最大占比'],
    nearGoals: ['这种调整纪律会不会更稳', '长期采用这个规则是否更合适', '这样控制变化会不会更容易执行', '这个管理办法是否更适合我']
  },
  investment_price_trend: {
    known: ['我关注的这一份最近价格连续来回变化，主要想看后面总体方向', '手里这个东西这段时间一直上下波动，我拿不准接下来是高还是低', '最近几天它的价格反复明显，我想知道后面有没有向上的走势', '这份东西眼下处在明显波动里，我主要关心之后价格会往哪边走'],
    goals: ['后面逐渐往上抬', '接下来出现向高处的方向', '之后总体比现在更高'],
    near: ['看价格变化时我准备把时间尺度从每天改成每周', '以后观察走势我想只保留一个主要价格图而不是同时看很多指标', '我打算把价格提醒从每次变化都通知改成超过固定幅度才通知', '观察波动时我准备固定在每天同一时间记录一次', '我想把短周期和长周期的图分开查看避免混在一起'],
    nearGoals: ['这种观察办法会不会更清楚', '这样看走势是否更适合我', '长期采用这个节奏会不会更稳定', '这个显示方式是否更容易判断']
  },
  income_salary: {
    known: ['我从公司每个月固定拿到的那部分已经有一段时间没有变化', '现在工作里按月稳定给我的固定收入一直维持原来的水平', '公司每月固定发给我的部分今年到现在还是一样', '我每个月稳定到账的工作收入最近没有调整，想看以后能否提高'],
    goals: ['之后固定部分有所增加', '后面每月拿到的数额提高', '以后稳定收入比现在更多'],
    near: ['公司准备把每月固定发放日期从月底调整到二十五号', '我想把每月工作收入到账后自动分到两个不同账户', '以后固定收入的凭证我准备按季度统一核对一次', '我打算把工作收入和其他收入完全分开管理', '每月到账后我准备先自动留下固定比例再安排支出'],
    nearGoals: ['这种收入管理方式会不会更方便', '这样安排是否更适合长期执行', '这个发放节奏会不会更顺手', '采用这个规则是否更稳定']
  },
  income_bonus: {
    known: ['公司今年可能在固定收入之外另外给一份，但现在还没有公布结果', '这次项目结束后据说会有额外的一部分，我还不知道自己能不能拿到', '年末固定部分之外可能再发一份，我主要想看最后有没有我的', '单位正在考虑额外奖励安排，目前我这一份还没有确定'],
    goals: ['最后有我的一份', '之后实际落到我这里', '最终能够得到这份额外部分'],
    near: ['如果拿到额外收入我准备全部单独放到一个账户', '公司额外发放的凭证我想和固定收入完全分开保存', '以后有额外收入时我准备先留一半再安排其他用途', '我打算把每次额外收入按来源分别记录而不是合并统计', '如果出现额外收入我准备等一周再决定具体用途'],
    nearGoals: ['这种处理办法会不会更稳', '这样管理是否更适合我', '长期采用这个规则会不会更清楚', '这个安排是否更容易坚持']
  },
  receive_item: {
    known: ['我已经确定要的那件东西目前正在从对方那里往我这边移动', '之前定下来的那个具体物件已经进入送来的过程，我在等它到手', '对方已经开始把我确定的那件东西送过来，目前还没有到我这里', '我已经确认的那件物品正在途中，主要想看近期能不能顺利拿到'],
    goals: ['近期顺利来到我手上', '按计划到达我这里', '之后顺利被我收到'],
    near: ['等具体物件送来时我准备把接收时间统一安排在晚间', '以后接收较大的物件我想固定选择能预约时间的方式', '有东西在途中时我准备只保留关键节点提醒而不是每一步都通知', '我想把需要本人接收的物件都统一送到一个固定地点', '以后遇到贵重物件送来时我准备提前一天再次确认接收安排'],
    nearGoals: ['这种接收安排会不会更方便', '这样设置长期是否更省事', '采用这个方式会不会更适合我', '这个接收流程是否更稳妥']
  },
  item_purchase: {
    known: ['我看中的这个具体东西已经比较了一阵，但现在还没有决定要不要拿到自己手里', '眼前这件物品我确实有兴趣，只是一直拿不准现在选择它是否合适', '我正在考虑把这个具体物件作为自己的东西，但还没有最终决定', '这个东西已经进入我的备选，我主要想判断现在把它定下来值不值得'],
    goals: ['由我现在选择会比较合适', '把它拿回自己这里会值得', '现在确定这个东西会比较妥当'],
    near: ['比较具体商品时我准备把备选数量最多限制在三个', '以后挑选东西我想先固定预算再去看具体款式', '我打算把试用感受放在参数之前作为第一项比较标准', '挑选耐用品时我准备至少隔一天再做最终决定', '以后比较同类物品我想统一用同一套五项标准'],
    nearGoals: ['这种挑选方法会不会更适合我', '这样比较是否更容易决定', '长期采用这个规则会不会更稳', '这个选择流程是否更清楚']
  },
  relationship_development: {
    known: ['我和这个人目前还不是确定的长期关系，但最近彼此接触明显变多', '我们之间现在有持续的好感和互动，只是关系还没有正式确定', '我和对方最近越来越亲近，但双方还没有把关系明确下来', '这个人与我这阵联系频繁，我想看两个人之后会不会继续靠近'],
    goals: ['以后发展成更亲近的关系', '之后彼此距离继续拉近', '后面关系更进一步'],
    near: ['我们准备把临时约见改成每周提前确定一次时间', '两个人聊天时我想减少即时回复的压力改成有空再集中回应', '以后共同活动我准备由两个人轮流决定地点', '我们想把彼此推荐的书和电影放到一个共同清单里', '我准备把重要安排提前说清楚而不是当天临时确认'],
    nearGoals: ['这种互动方式会不会更舒服', '这样安排是否更适合两个人', '长期采用这个节奏会不会更自然', '这个沟通办法是否更顺']
  },
  marriage_match: {
    known: ['我正在把这个人作为未来长期共同生活的对象认真考虑', '我们之间已经谈到以后组成家庭的可能，我想判断彼此是否适合', '对方是我目前认真考虑的长期伴侣人选，我还在权衡两个人是否匹配', '这段关系已经走到需要考虑长期家庭安排的阶段，我想看双方是否相称'],
    goals: ['作为长期伴侣彼此合适', '以后组成家庭会比较稳妥', '长期共同生活比较相称'],
    near: ['如果以后共同生活我们准备先各自保留独立的工作空间', '两个人正在讨论未来家务是否按固定项目分工', '我们准备把共同生活的固定开销按比例承担', '以后重要家庭决定我们想固定留一晚专门讨论', '共同生活后我们准备各自保留一部分完全独立的时间'],
    nearGoals: ['这种生活安排会不会更适合双方', '这样分工长期是否更顺', '采用这个规则会不会更容易相处', '这个共同生活方式是否更稳']
  },
  marital_relationship: {
    known: ['已经成家以后，我和长期共同生活的那个人最近相处越来越容易僵住', '我们建立家庭已经有一段时间，最近两个人之间的交流明显比以前少', '共同家庭生活持续多年后，这阵子我和对方之间总有些疏远感', '我们早已把生活长期放在一起，但最近家里的两个人相处不太平稳'],
    goals: ['之后重新恢复稳定相处', '后面彼此关系慢慢缓和', '以后共同生活重新顺下来'],
    near: ['家庭里我们准备把临时分配家务改成每周固定一次安排', '共同生活的两个人想把重要支出改成每月一起确认一次', '家里准备把各自的个人时间和共同时间提前写进日历', '我们想把遇到分歧就立刻讨论改成等情绪平稳后再谈', '共同生活中我们准备把周末固定留出一段时间处理家庭事务'],
    nearGoals: ['这种家庭协作方式会不会更顺', '这样安排长期是否更适合两个人', '采用这个沟通规则会不会更稳定', '这个生活节奏是否更容易维持']
  }
}

const classOrder = methodology.training.classOrder
if (classOrder.length !== 22 || Object.keys(cfg).length !== 22) throw new Error('must configure 22 routes')
for (const routeId of classOrder) if (!cfg[routeId]) throw new Error(`missing ${routeId}`)

const knownFrames = [
  (base, goal) => `${base}，接下来会不会${goal}？`,
  (base, goal) => `${base}，往后看能不能${goal}？`,
  (base, goal) => `${base}，之后是否会${goal}？`
]
const nearFrames = [
  (base, goal) => `${base}，${goal}？`,
  (base, goal) => `${base}，从长期使用来看${goal}？`,
  (base, goal) => `${base}，如果按这个方案执行${goal}？`,
  (base, goal) => `${base}，改成这种做法以后${goal}？`
]

const rows = []
let knownIndex = 1
let nonRouteIndex = 1
for (const routeId of classOrder) {
  const item = cfg[routeId]
  for (let b = 0; b < 4; b += 1) for (let g = 0; g < 3; g += 1) {
    rows.push({
      id: `V05-FI-C11-K-${String(knownIndex++).padStart(3, '0')}`,
      split: 'calibration_v0.1.1', identityLabel: 'route_identity_positive', expectedRoute: routeId,
      subtype: 'fallback_stage_known', pressureFamily: routeId,
      semanticAxis: `fresh_identity_clear_${routeId}_without_deterministic_arbitration`,
      wordingPattern: `known_${routeId}_b${b + 1}_g${g + 1}`,
      text: knownFrames[(b + g) % 3](item.known[b], item.goals[g])
    })
  }
  for (let b = 0; b < 5; b += 1) for (let g = 0; g < 4; g += 1) {
    rows.push({
      id: `V05-FI-C11-N-${String(nonRouteIndex++).padStart(3, '0')}`,
      split: 'calibration_v0.1.1', identityLabel: 'non_route', expectedRoute: null,
      subtype: 'near_domain_not_current_route', pressureFamily: routeId,
      semanticAxis: `substantive_operational_choice_adjacent_to_${routeId}_but_not_route_identity`,
      wordingPattern: `near_${routeId}_b${b + 1}_g${g + 1}`,
      text: nearFrames[g](item.near[b], item.nearGoals[g])
    })
  }
}

const outsideThemes = {
  job_interview: ['我已经参加完这次求职面试，现在在等最终通知', '这家公司前面的面试流程都结束了，我还不知道结果', '我刚完成最后一轮面谈，对方说之后统一通知'],
  promotion: ['单位最近正在确定下一批岗位调整名单，我也在候选范围里', '部门接下来会决定谁承担更高一级职责，我还没有得到消息', '今年内部职位调整已经进入最后讨论阶段'],
  exam: ['这次资格考试我已经考完，成绩还没有公布', '我刚参加完需要达到合格线的考试，现在只能等结果', '这次重要测验已经结束，我还不知道是否达到要求'],
  visa: ['我提交的签证申请现在已经进入审理阶段', '这次出行需要的许可材料已经递交，目前还在等待', '我需要的入境许可已经申请完成但没有收到结果'],
  travel: ['我已经安排好这次跨城旅行的主要交通和住宿', '接下来这趟长途出行路线已经基本确定', '我准备按现有计划完成一次多天旅行'],
  relocation: ['我已经确定近期要搬到新的住处，现在正在准备整个搬迁过程', '新住处已经定下，我接下来要把现有物品全部转过去', '这次搬家时间已经确定，只剩实际执行'],
  school_admission: ['我申请的学校已经收到全部材料，现在还没公布录取结果', '这次课程项目的入学申请已经完成，我正在等通知', '我想去的学校前面要求的材料都已经交齐'],
  competition: ['我参加的比赛已经完成初轮，现在在等最终评定', '这次公开竞赛我已经提交作品，结果还没有出来', '比赛需要的内容已经全部完成，之后由评审决定'],
  submission: ['我把准备好的文章投给了目标刊物，现在正在审稿', '这次作品投稿已经提交完成，对方还没有回复', '我准备的稿件已经送进评审流程，目前结果未知'],
  license_application: ['我申请的证件材料已经被窗口受理，现在等待审批', '这次行政申请所需材料都交完了，目前还没有结果', '需要办理的许可已经正式提交，接下来是审核阶段'],
  driving_test: ['我已经报名并完成这次驾驶技能考试，现在还没拿到结果', '这次路考已经结束，最终判定还没有通知', '我刚完成驾驶考试全部项目，正在等待是否合格']
}
const outsideGoals = ['最后能够顺利通过', '之后得到我希望的结果', '最终按目标完成', '后面出现有利的结果']
for (const [theme, bases] of Object.entries(outsideThemes)) {
  for (let b = 0; b < 3; b += 1) for (let g = 0; g < 4; g += 1) {
    rows.push({
      id: `V05-FI-C11-N-${String(nonRouteIndex++).padStart(3, '0')}`,
      split: 'calibration_v0.1.1', identityLabel: 'non_route', expectedRoute: null,
      subtype: 'outside_current_22', pressureFamily: theme,
      semanticAxis: `clear_divination_outcome_outside_current22_${theme}`,
      wordingPattern: `outside_${theme}_b${b + 1}_g${g + 1}`,
      text: knownFrames[(b + g) % 3](bases[b], outsideGoals[g])
    })
  }
}

const unresolvedBases = [
  '眼前这件和钱有关的事我只知道双方还有变化，但没有说明资金最终从谁到谁',
  '我手里这个具体东西接下来会有安排，但目前没说明是准备取得还是已经在途中',
  '这段两个人之间的关系正在变化，不过目前没有说明是否已有长期家庭关系',
  '工作单位之后可能会给我一部分收入，但现在不知道是固定部分还是临时额外部分',
  '店里接下来会处理一批货，可我还没有说明是需要增加库存还是减少库存',
  '我已有的一份资金安排要发生变化，但没有说明关注的是收益、退出还是调整比例',
  '对方那边和我之间有一笔旧的资金事项，但目前没有说明是谁应当把钱给谁',
  '一个新的资金方向摆在眼前，但我没有说明自己是想参与、判断价格还是关注回报',
  '我和另一个人接下来要共同处理一件事，但没有说明是共同经营还是私人关系变化',
  '某个具体物件最近会有变化，可现在没有说明我是否已经确定要它',
  '眼前这笔安排和日常钱况有关，但我还没有说明是在问整体状态还是一笔具体事项'
]
const unresolvedGoals = ['后面会不会逐渐明朗', '接下来能不能出现明确结果', '之后是否会顺利一些', '往后看会不会有变化']
for (let b = 0; b < unresolvedBases.length; b += 1) for (let g = 0; g < 4; g += 1) {
  rows.push({
    id: `V05-FI-C11-N-${String(nonRouteIndex++).padStart(3, '0')}`,
    split: 'calibration_v0.1.1', identityLabel: 'non_route', expectedRoute: null,
    subtype: 'route_unresolved', pressureFamily: 'route_unresolved',
    semanticAxis: 'insufficient_role_direction_or_state_to_resolve_one_current22_identity',
    wordingPattern: `unresolved_b${b + 1}_g${g + 1}`,
    text: knownFrames[(b + g) % 3](unresolvedBases[b], unresolvedGoals[g])
  })
}

const knownRows = rows.filter((r) => r.identityLabel === 'route_identity_positive')
const nonRouteRows = rows.filter((r) => r.identityLabel === 'non_route')
if (rows.length !== 880) throw new Error(`rows ${rows.length} !=880`)
if (knownRows.length !== 264) throw new Error(`known ${knownRows.length} !=264`)
if (nonRouteRows.length !== 616) throw new Error(`nonroute ${nonRouteRows.length} !=616`)
if (rows.filter((r) => r.subtype === 'near_domain_not_current_route').length !== 440) throw new Error('near-domain !=440')
if (rows.filter((r) => r.subtype === 'outside_current_22').length !== 132) throw new Error('outside !=132')
if (rows.filter((r) => r.subtype === 'route_unresolved').length !== 44) throw new Error('unresolved !=44')

writeJson(outputPath, {
  version: '0.13-candidate-v0.5-fallback-identity-v0.3-calibration-v0.1.1',
  status: 'presealed_fallback_identity_v03_calibration_v011',
  sealed: false,
  replacementContract: contractPath,
  methodology: methodologyPath,
  supersedesCalibrationV01ForThresholdCalibration: true,
  policy: {
    encoderScoringObserved: false,
    semanticActProbabilityUsedForGeneration: false,
    routeabilityProbabilityUsedForGeneration: false,
    fallbackProbabilityUsedForGeneration: false,
    failedCalibrationV01ArtifactReadForGeneration: false,
    failedReachabilityReportReadForGeneration: false,
    officialV04IndependentRowsReadForGeneration: false,
    rowLevelEvaluationResultsReadForGeneration: false,
    sealedBlindEvaluationRead: false,
    carriedTrainingReadForGeneration: false
  },
  summary: { rows: 880, known: 264, nonRoute: 616, knownPerRoute: 12, nearDomain: 440, outsideCurrent22: 132, routeUnresolved: 44 },
  rows
})
console.log('Candidate v0.5 Fallback Identity v0.3 calibration v0.1.1 generated without encoder/model scoring.')
console.log('- 880 rows =264 known +440 near-domain +132 outside-current22 +44 unresolved')
