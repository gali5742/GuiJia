# 龟甲 v13.44.0 · 正式发布清单

用于正式推送 / 发布前核对。功能开发与规则讨论不在本清单内。

## v13.44.0 最终端到端回归（RC.2 固化案例）

- [ ] `23:40 + 24:00 换日`：日辰仍为当日，但农历时辰显示子时。
- [ ] 升：8/17、8/18、8/19 过程节点完整。
- [ ] 随：世爻辰土化亥水，8/17 亥日必须进入关键节点，并显示“父母亥水”变爻证据。
- [ ] 屯：静爻月破正向回归保持 8/17、8/18、8/20，不因 observer-change 修复膨胀。
- [ ] 晋：三合 / 化空竞争下，8/20 observer-change 六冲必须进入前 4，不能被低相关 8/18 变爻出空挤掉。
- [ ] 部署包必须包含 `js/liuyao-core.js`、`js/common.js`、`js/app.js`，避免旧核心 / 旧时辰逻辑继续命中缓存。


## A. 推送之前

- [ ] 以当前稳定工作区为唯一基线，不混入旧版根目录文件或临时压力测试脚本。
- [ ] 删除旧的乱码升级说明文件 `#U5347#U7ea7#U8bf4#U660e.md`（若仓库中仍存在）。
- [ ] 保留 `.github/`、`scripts/`、`tests/`、`vendor/` 与 vendor 配置文件。
- [ ] `package.json` 版本为 `13.44.0`。
- [ ] `js/liuyao-time-facts.js`、`js/liuyao-time-effects.js`、`js/liuyao-time-assessment.js`、`js/liuyao-time-evidence.js`、`js/liuyao-time-relevance.js`、`js/liuyao-time-output.js`、`js/liuyao-time-selection.js` 均在 `liuyao-core.js` 之前按依赖顺序加载；范围时间节点同时生成 TimeFact、六维 TimeEffect、Node Assessment、Evidence bundle、Structural Relevance 与 Candidate Output。
- [ ] `npm run predeploy` 包含 `tests/time-fact-tests.js`、`tests/time-effect-tests.js`、`tests/time-assessment-tests.js`、`tests/time-evidence-tests.js`、`tests/time-relevance-tests.js`、`tests/time-output-tests.js` 与 `tests/time-wording-tests.js`；compound fact 可结构化吸收同一实体的子事实。
- [ ] 页面「目标时间范围 / 目标时点」已正式读取 Time v2 production top-level；旧用户摘要与日期比较只保留在 `legacyShadow`，不得再进入页面。
- [ ] 目标时间范围内，普通非空的生扶 / 克制 / 间接制约 / 比和动爻逢值可以进入关键节点候选。
- [ ] 其他动爻变爻的逢值 / 冲 / 合继续保留在 TimeFact 事件池；化月破变爻逢值保留“月破复核”语义，且不会仅凭该补充事实新增过程节点。正式 Evidence 若摘要维度已由主要观察爻自身完整直证，可不重复展示外围变爻补充事实。
- [ ] KeyLine 必须先由角色 / 结构确定；旬空、月破等状态本身不得把普通静爻抬升为关键节点。
- [ ] 静卦中的 KeyLine 可进入统一状态追踪；旬空应爻或生扶 / 克制爻出空且逢值时使用角色化提示，月破相关爻逢值时显示“月破复核”。
- [ ] 动卦中的非世应静爻状态变化保持次级，不因统一状态机恢复逐日罗列或挤掉原有高优先节点。
- [ ] `index.html` 自有 CSS / JS 使用统一的 `v=13.44.0` 缓存版本。
- [ ] TimeEffect 六维映射：目标日生扶 / 克制 / 比和 / 泄力 / 耗力一对一落入独立维度；六合与普通六冲只产生触发，不自动产生生扶或受制。
- [ ] Node Assessment 只读取 TimeEffect 与安全事件元数据，不读取 legacy `direction / effect`；六维可并存，泄力不得归为受制，耗力不得归为生扶，普通合冲不得自动制造生扶/受制。
- [ ] Evidence Selector 的 `uncoveredKinds` 必须为空；摘要中的触发 / 生扶 / 比和 / 受制 / 泄力 / 耗力每一维至少有一条选中证据可追溯。
- [ ] “出空并逢值”等 compound 证据不得与被其包含的单独“出空 / 逢值”同时进入摘要证据；不同爻位不得因语义相同被跨爻误去重。
- [ ] Evidence Selector 不以三条为硬上限：确需四条才能覆盖摘要时允许扩容；同时不得为了凑满固定条数补入同维度冗余证据。
- [ ] Candidate Output 的节点摘要必须直接读取 Node Assessment，候选事实必须直接读取 Evidence Selector；不得重新读取 legacy `direction / effect` 生成第二套判断。
- [ ] 候选日期判断把触发、生扶、比和、受制、泄力、耗力分开：触发本身不得加成生扶，纯比和可作为次选，生扶与受制/泄力/耗力并见时保持混合判断。
- [ ] Time v2 已正式接管页面与复制分析上下文；历史 `candidateOutput / legacyShadow` 仅作为源码级兼容回归材料，页面与复制上下文不得读取；`liuyao-time-review.js` 不得由 `index.html` 加载，也不得进入 Pages 部署产物。
- [ ] 关键爻逢值 / 出空可形成“触发 + 角色效力”；三合结构效力只读取 formationElement / observerElement 等纯事实元数据，不读取 legacy direction。
- [ ] 六爻范围时间：目标日值 / 合 / 冲与五行生克并行计算；六合但受克、六合但泄力、六合但主动制约耗力等节点不再只显示单一“偏生扶”。
- [ ] 六爻范围时间：辰戌、丑未直接月冲优先按月破 / 日破方向，不因同属土误判暗动。
- [ ] 六爻范围时间：重复三合时间事实按展示语义去重，不挤占其他关键事实。
- [ ] 不提交出生信息、占问记录、浏览器缓存导出或其他私人数据。
- [ ] `npm run review:release` 生成 / 复核 `docs/REVIEW_RELEASE_v13.44.0.md`，正式版阻断项必须为 0。
- [ ] `index.html` 不加载 `js/liuyao-time-review.js`；`npm run vendor:build` 后 `.site/js/liuyao-time-review.js` 不存在。
- [ ] 运行 `npm run predeploy`，必须零失败。
- [ ] 运行 `git diff --check`，不得有空白错误。

## B. 核心人工 smoke test

桌面宽屏与窄屏各检查一次：

- [ ] 首页“八字 / 六爻”切换正常；`#bazi`、`#liuyao` 直接访问正常。
- [ ] 首页底部免责声明在八字 / 六爻两种输入页均可见；宽屏与主输入区对齐，窄屏不溢出。
- [ ] 八字可完成一次排盘，并进入“原局总览 / 详细分析 / 流年流月”。
- [ ] 八字性别、出生地、出生时钟时间的说明均位于输入控件下方。
- [ ] 八字与六爻的自然语言数量说明在一至十范围内使用汉字计数；年月日、虚岁、卦序、爻位等结构化数字保持原样。
- [ ] 六爻首页左右主卡在宽屏等高、上下边缘对齐；窄屏恢复自然高度。
- [ ] 自然语言时间解析回归：明天 / 后天 / 本周 / 下周末 / 月底前 / 未来三个月 / 明确日期范围 / 否定修正 / 多日期候选 / 模糊时间均按既定置信度输出；模糊时间不得硬过滤应期。
- [ ] 时间范围分析回归：分别测试“本周能收到消息吗 / 8月15日至20日出差如何 / 这周哪天适合签合同 / 月底前能收到钱吗”；详细页应显示“目标时间范围”，只提取关键节点，不逐日罗列全部关系。
- [ ] 范围分析启用时不再重复显示独立“应期观察”卡；模糊“近期”仍保留普通应期逻辑。
- [ ] 时间节点效力回归：静爻旺相逢冲显示暗动触发，静爻休囚受制逢冲显示日破倾向；静爻逢合显示合起，动爻逢合显示合绊。
- [ ] 日期比较回归：“这周哪天适合签合同”应给出相对优先观察日，并保留各候选利弊；“明天还是周五哪个好”分别显示两个候选标签，不再共用“明天 / 周五”。
- [ ] 过程型范围不强凑节点数量；只有普通五行关系、缺少一级结构触发的日期可以完全不展示。
- [ ] 关键动爻 / 化空变爻时间状态回归：旬空动爻的冲空、出空、出空后逢值可进入范围关键节点；已成 / 待实三合中的动爻成员逢值可提升为结构触发。
- [ ] KeyLine 状态回归：静卦样例中，旬空应爻在出旬当日逢值显示“应爻出空并逢值”；月破且生扶主要观察爻的爻在值日显示“生扶爻逢值·月破复核”。
- [ ] 节静卦回归：上爻子水作为克制爻旬空时，8/18 保留“克制爻出空并逢值”；三爻丑土若仅因旬空、无关键角色，不得单独制造 8/19 关键节点。
- [ ] 明确单日或离散候选已经显示“目标时点”时，不再重复显示独立“应期观察”；“明天还是周五哪个好”若未说明比较事项，应提示仅按世爻状态作为当前比较基准。
- [ ] 三合古籍匹配：缺支待补、空破待实、入墓待冲分别命中对应原文，不用同一条引文覆盖全部待实状态。
- [ ] 六爻“所占之事”下方有普通用户可理解的填写提示；面试、跳槽、回本/奖金、考研/论文/留学、航班、失物、合作伙伴／合作方／合伙人、明确感情／婚姻、仲裁等典型问法可得到取用参考；其中具体外部合作对象应落应爻；“出去玩是否开心”“事情是否顺利”“这次合作能否顺利”“旅游目的地天气好不好”等未明确落入有限规则或被专项抑制的问法显示“暂未自动判断”，并仅以世爻作为展示起点。
- [ ] 六爻总览显示“观察重点”，普通用户可用十个有限类别选择想观察的人或事，其中包含“感情、恋爱与婚姻”“出行、旅行与行程”和“失物与寻找”；同类多现时给出多候选提示，无候选时不伪造具体用神。
- [ ] 多个同类候选时，详细页显示“当前观察对象 / 展示位置 / 同类候选”，不把展示起点写成唯一“当前用神”；手动确认具体爻后恢复确定语义。
- [ ] “手动选择具体爻（熟悉六爻时）”使用统一折叠卡样式，可展开并直接切换原有专业选择器。
- [ ] 六爻手动录入与“模拟六次掷币”均可完成排盘；展示顺序仍为六爻在上、初爻在下；宽屏六行在等高卡片内纵向分布均匀。
- [ ] 手机 / 窄屏的“六爻结果录入”保持单列，上爻至初爻自上而下连续排列，不出现两列交错阅读顺序。
- [ ] 六爻总览可确认观察重点并进入详细分析。
- [ ] 详细分析的结构解读为分点文本，复杂动卦不形成单块长段落。
- [ ] 无应期观察时不出现空白“应期观察”卡；有应期时按时间节点聚合。
- [ ] 23:00–23:59 分别切换“24:00 换日 / 23:00 子初换日”，确认日辰、六神、日辰关系与应期同步变化。
- [ ] 静卦显示“无独立变卦”；六爻全动可正常显示变卦及用九 / 用六经文入口（如适用）。
- [ ] “复制分析上下文”可以复制完整八字 / 六爻结构，不出现 `undefined`、`null`、机器码或重复世应标记。
- [ ] 古籍与《周易》折叠区正常，无 JavaScript 报错。

## C. Vendor 与静态资源

- [ ] `vendor/vue.global.prod.js` 与 `vendor/lunar.js` 存在并通过校验。
- [ ] Network 中 Vue / lunar 来自本站 `vendor/`，不是 CDN。
- [ ] 浏览器控制台没有 404 的 CSS / JS / 图片资源。
- [ ] `Test and vendor verification` GitHub Action 通过。
- [ ] `Deploy GitHub Pages` build 与 deploy job 均通过。

## D. 依赖监测

- [ ] Dependabot 配置保留，但普通版本更新 PR 设为 0，避免与固定 vendor 策略冲突。
- [ ] `Dependency watch` 可手动运行并正常创建 / 更新跟踪 issue，仅报告新版，不自动修改生产 vendor。
- [ ] `Test and vendor verification`、`Deploy GitHub Pages`、`Dependency watch`、`Vendor Snapshot PR` 使用 Node 24 runtime 的 checkout / setup-node action。
- [ ] 只有明确计划升级依赖时才运行并合并 `Vendor Snapshot PR`。

## E. 发布后复核

- [ ] Pages 首页能强制刷新后正常加载，确认 v13.44.0 缓存版本生效。
- [ ] 八字固定样例与六爻一静一动样例各复核一次。
- [ ] 六爻至少额外复核一个旬空 / 月破或三合待补样例。
- [ ] 若线上与本地结果不一致，优先检查缓存与实际部署 commit，不在生产页面直接修改规则。

## F. 当前非阻塞项

- `data/iching.json` 完整本地 64 卦底本；
- 全球历史时区 / DST 数据模型；
- 新增排盘记录持久化、导出等功能；
- 古籍库继续扩充与逐条原文核对。

## alpha.6 开发对照审阅

- [ ] `node tests/time-review-tests.js` 通过。
- [ ] `npm run review:time` 能生成 `docs/REVIEW_v13.44.0-alpha.6.md`。
- [ ] 正式页面与复制分析上下文仍读取 legacy `comparison / keyNodes / entries`，不读取 Candidate Review。
- [ ] 新旧比较差异必须能追溯到具体日期与候选效力，不以“差异率高”直接作为切换依据。


## alpha.7 日期选择原则审阅

- [ ] `node tests/time-selection-tests.js` 通过。
- [ ] `npm run review:selection` 能生成 `docs/REVIEW_SELECTION_v13.44.0-alpha.7.md`。
- [ ] 有未受制日期可选时，受制日期进入第一非支配前沿必须为 0。
- [ ] 第一前沿被同一受制层其他候选 Pareto 支配必须为 0。
- [ ] 生扶与比和不通过隐藏分值强行换算；泄力与耗力同样不人为规定高低。
- [ ] 正式页面与复制分析上下文仍读取 legacy 时间字段，不读取 TimeSelection 候选比较。

## alpha.8 结构相关性 / 触发重要度审阅

- [ ] `node tests/time-relevance-tests.js` 通过。
- [ ] `npm run review:relevance` 能生成 `docs/REVIEW_RELEVANCE_v13.44.0-alpha.8.md`。
- [ ] 结构相关性层级固定为：直接作用于观察爻 > 观察爻之变 > 世应轴 > 关键关系爻 > 结构组合 > 背景结构。
- [ ] Structural Relevance 只细化实质效力组合完全相同的日期；alpha.8 第一前沿不是 alpha.7 第一前沿子集的情况必须为 0。
- [ ] 跨实质效力组合误移除必须为 0；不得以结构相关性重新规定“生扶 > 比和”或“泄力 > 耗力”。
- [ ] 纯助力同质日期可优先更直接的触发；仅负担同质日期可优先较不直接的触发；混合效力不得仅凭触发直接度强制排序。
- [ ] 4096 卦一周日期选择中，结构相关性细化后单一第一候选增加、并列减少，但剩余“纯生扶 vs 纯比和”并列不得用隐藏权重强行消除。
- [ ] 正式页面与复制分析上下文仍读取 legacy 时间字段，不读取 Structural Relevance / Candidate Output / TimeSelection。

## alpha.9 剩余并列分型审计

- [ ] `npm run review:ties` 能生成 `docs/REVIEW_TIES_v13.44.0-alpha.9.md`。
- [ ] 审计脚本只作为开发诊断工具，不接入 `index.html` 或正式用户输出。
- [ ] 4096 卦一周日期选择审计 schema/运行异常必须为 0；诊断后剩余并列未分类必须为 0。
- [ ] 同时统计“六维诊断严格缩小 alpha.8 前沿”与“alpha.8 过早剪掉六维权衡日期”两种方向，不能只统计并列率下降。
- [ ] 六维细粒度诊断不得引入数值权重；生扶 / 比和、泄力 / 耗力保持独立维度。
- [ ] “纯生扶 vs 纯比和”“纯泄力 vs 纯耗力”仍作为显式术数边界保留，不在审计阶段强制排序。
- [ ] 正式页面与复制分析上下文继续读取 legacy 时间字段；alpha.9 不修改生产 comparator。

## alpha.10 六维 Date Selection 冻结验收

- [ ] `node tests/time-selection-tests.js` 通过，且 `selectionMode` 为 `six-dimensional-non-compensatory-pareto`。
- [ ] `npm run review:selection6` 能复核 alpha.10 已冻结的六维 Date Selection，并保持 `docs/REVIEW_SELECTION_v13.44.0-alpha.10.md` 结论。
- [ ] 生产 comparator 与独立六维 Pareto 在 4096 卦一周选日中的第一前沿必须 4096 / 4096 完全一致。
- [ ] 生扶 / 比和分别作为独立有利维度；泄力 / 耗力分别作为独立软负担，不再压成 `hasBenefit / hasSoftCost`。
- [ ] 有未受制候选时，受制日进入第一前沿必须为 0；第一前沿仍被同层其他日期六维 Pareto 支配必须为 0。
- [ ] Structural Relevance 只在实质效力完全相同时参与细化，不得跨六维边界重新排序。
- [ ] “纯生扶 vs 纯比和”“纯泄力 vs 纯耗力”“额外助力同时额外负担”等真实权衡允许并列，不再以降低并列率为发布目标。
- [ ] alpha.10 起冻结日期选择判断原则；后续只修违反冻结不变量的实现 bug。
- [ ] 正式页面与复制分析上下文继续读取 legacy 时间字段；alpha.10 不切换用户接口。

## alpha.11 Candidate 用户文案验收

- [ ] `node tests/time-wording-tests.js` 通过；Candidate 文案不得改变 TimeEffect / Node Assessment / Date Selection 的结构字段。
- [ ] `npm run review:wording` 能生成 `docs/REVIEW_WORDING_v13.44.0-alpha.11.md`。
- [ ] 49,152 个 Candidate 节点中，“泄耗”残留、legacy/developer token、同义效力括注、连续标点异常均为 0。
- [ ] `观察爻生目标日` 的用户证据标签统一为“观察爻泄力”；`观察爻克目标日`统一为“观察爻耗力”。
- [ ] 日期判断不得出现“目标日生扶（生扶）”等重复说明；仅当事件标签没有表达实质效力时追加括注。
- [ ] Evidence Selector 所需证据不得为固定三条而删减；若四条才能覆盖摘要全部维度，允许保留四条。
- [ ] 日期选择第二非支配前沿若含多个日期，“次看”应完整展示该前沿，不任意只取一个。
- [ ] 正式页面与复制分析上下文继续读取 legacy 时间字段；alpha.11 只完成 beta 切换前的候选文案准备。

## beta.1 Time v2 正式切换验收

- [ ] `npm run review:beta` 继续验证 Time v2 正式切换；`npm run review:beta2` 复核 `docs/REVIEW_BETA2_v13.44.0-beta.2.md`，本轮证据可读性、重复标点、并列文案阻断项必须为 0。
- [ ] `questionTimeFocus.outputModel` 为 `time-v2`；production `comparison / keyNodes / entries` 与 `candidateOutput` 镜像逐项一致。
- [ ] `legacyShadow` 同时保留旧 `comparison / keyNodes / entries`，但页面模板与 `buildLiuYaoContextText()` 均不得直接读取 `legacyShadow`。
- [ ] `Time Review` 在 beta.1 结构下以 `legacyShadow` 为旧侧、production top-level 为新侧，仍能识别首选日期变化和关键日期集合变化。
- [ ] 复制分析上下文中的节点效力、日期判断、事实与页面 Time v2 一致；不得出现旧 shadow 专属文案。
- [ ] Time v2 可见文案不得出现“泄耗”、`supportive / adverse / mixed-direction` 等旧模型术语。
- [ ] beta 阶段不再调整六维 Date Selection 判断原则；发现非阻塞边界进入 backlog，不回滚到 alpha 式规则探索。

- [ ] `npm run review:beta3`：过程节点 Structural Relevance 收口压力中，观察爻之变逢值/冲/合遗漏均为 0，且正式输出证据/标点阻断项为 0。

## G. rc.1 时间语义收口验收

- [ ] `npm run review:rc1` 生成 / 复核 `docs/REVIEW_RC1_v13.44.0-rc.1.md`，阻断项必须为 0。
- [ ] `ENEMY / 间接制约五行` 的 TimeFact 使用 `observer-controls-line`；落实类事件（逢值、旬空转换、月破复核）必须映射为 `exertion / 耗力`，不得映射为 `constraint / 受制`。
- [ ] 普通六冲、六合仍只按既有规则产生触发；不得因为 ENEMY 角色本身自动增加耗力。
- [ ] 若某摘要维度存在 `main-observer` 直接来源，Evidence Selector 的正式证据中必须保留至少一条 `main-observer` 对该维度的可见依据。
- [ ] 4096 卦 × 6 日专项中：间接制约落实类事实漏映射耗力 0、误映射受制 0、主要观察爻直接证据遗漏 0、Evidence uncovered 0。
- [ ] 过程范围继续最多展示 4 个关键节点；Date Selection comparator、KeyLine、Structural Relevance 层级与时间解析不得在 RC 阶段改动。
