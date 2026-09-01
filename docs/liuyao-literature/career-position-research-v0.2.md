# 龟甲 · 六爻事业职位主题文献研究 v0.2

日期：2026-09-01

状态：`research_reconciliation`

主题：`career_position`

前版：`career-position-research-v0.1.md`

> 本版专门做跨来源冲突审计与现代职责拆分。仍不是正式 Observation Rule，不修改当前 22-route、不生成训练数据、不修改 Rule Registry / Intent / Time Engine。

---

# 1. 本轮最重要修正

v0.1 的三个 modern hypotheses 为：

```text
job_application_outcome
position_advancement
employment_transition_decision
```

经第二轮来源核对，第三项过粗。

“跳槽”至少包含三种不同 current target：

```text
A. transition_outcome
   → 能不能跳槽成功 / 能不能拿到新工作

B. transition_comparison
   → 新工作与当前工作哪个更适合 / 哪边发展更好

C. resignation_suitability
   → 现在该不该辞职 / 没有下家时能不能先离开
```

它们不能共享一个无条件传统 Observation Rule。

王虎应《六爻用神答疑》直接区分：

- “跳槽能否成功”以官为主，兼看世；
- “去后如何”看应与世及官的响应；
- “该不该辞职”强调财为养命之源，财的重要性上升。

朱辰彬“跳槽好还是不跳槽好”案例则以官鬼作为事业核心，但两处事业并不固定机械映射为世 / 应，而是通过卦中两个具体爻与现状对应来区分当前与未来单位。

因此：

```text
keyword = 跳槽
≠
one traditional duty
```

这是本主题当前最大的架构风险。

---

# 2. 来源职责矩阵

| 职责 | 《断易天机》 | 《卜筮全书/黄金策》 | 《易隐》 | 《增删卜易》 | 王虎应 | 朱辰彬 | 当前分类 |
|---|---|---|---|---|---|---|---|
| 工作 / 官职 / 职位本体 | 官鬼 | 官鬼 | 官 / 世官 | 官鬼 | 官鬼 | 官鬼 | `stable_consensus` |
| 求职者 / 任职者本人 | 世 | 世 | 世 | 世 | 世 | 世 | `stable_consensus` |
| 任命 / 宣敕 / 文书 | 父母 | 父母 | 父母 | 父母相关 | 父母 | 父母 | `stable_consensus` |
| 现代公司 / 单位 | — | — | — | — | 父母 | 父母可代表单位 | `cross_source_compatible` |
| 特指单位 / 外部目标 | — | — | 应可参与升迁结构 | — | 应用于新去处 | 特指事可提升应爻职责 | `cross_source_compatible`，非固定 Primary |
| 升迁 | 官鬼 | 官鬼 | 世官 + 世应 | 官鬼 | 官鬼 | 官鬼 | `stable_consensus` |
| 俸禄 / 工资 | 财 | 妻财 | 财 | 财 | 妻财 | 视具体问财 | `stable_consensus`，现代 route 应分离 |
| 竞争者 | — | 兄弟（求名） | — | 个案有同行 | 可据兄弟观察 | 个案使用同行映射但谨慎 | `cross_source_compatible`，仅条件 Evidence |
| 失职 / 被替 | 子孙克官等 | 子孙、世空、官衰等 | 替代 / 失职专节 | 现任官有专门凶象 | 官鬼受损、子孙等 | 官鬼 / 父母择显著者 | `stable_consensus`（主题存在），具体公式需分源 |
| 新旧工作比较 | 迁官但无现代二选一结构 | — | 内外旺衰守旧 / 图新 | — | 世当前、应新处 + 官 | 按现状定位两个事业候选，不固定世应 | `school_specific / conflicted_mapping` |

---

# 3. 求职 / 面试 / 录用 / 入职阶段审计

## 3.1 面试“最终是否成功”

现代来源高度兼容：

- 王虎应答疑：“找工作的面试主要看官，当然也不能忽视世应”；
- 王虎应 2022 工作录用案例直接“以官鬼为用神”，父母同时用于公司 / 文书状态；
- 朱辰彬职位内部竞聘、职位竞聘案例均以官鬼作为职位成功核心；
- 朱辰彬也存在具体目标单位应聘时父母成为用神的案例，说明“单位”可以成为真正关注点。

所以不应创建：

```text
面试 → 父母
```

或：

```text
面试 → 官鬼（忽略单位、世应）
```

更稳妥的现代职责是：

```text
career_goal = job_application_outcome
application_stage = interview
employment_target = position / specified_employer
```

其中 `application_stage` 不能直接决定传统 selector。

---

## 3.2 Offer / 录用通知 / 签约

传统上父母稳定表示：

- 宣敕；
- 诰牒；
- 印绶；
- 文书。

现代王虎应“应聘老师”案例仍以官鬼为应聘主用神，但父母同时表示文书、学校，并与最终签约时间关联。

这说明：

```text
问“能否被录用”
→ 官鬼仍可保持职位结果 Primary
→ 父母进入 document / employer Domain Evidence

问“offer / 合同能不能下来或签成”
→ current target 已变成 formalization document
→ 父母有成为 Primary 的直接传统基础
```

所以 `offer` 不能仅因为属于招聘阶段而自动继承官鬼 Primary；必须看当前目标到底是职位取得还是文书正式化。

---

## 3.3 入职

朱辰彬双核论直接使用“问入职官生世预示能入职”作为例子，同时指出若问题指定某单位，则还要判断是不是“这个单位”能入职。

因此：

```text
employment commencement 本身
→ 官鬼有直接现代实践支持

specified employer identity
→ 另有外部目标 / 单位职责
```

“入职”与“指定单位”不能压成一个 selector。

---

# 4. 指定单位：父母与应爻不是同一种职责

第二轮确认：

```text
父母
→ modern object/class mapping：单位 / 公司 / 文书制度

应爻
→ contextual role：特指外部对象 / 新去处 / 对方
```

两者不是互斥同义词。

王虎应：

```text
官鬼 = 工作
父母 = 工作公司 / 单位
工作变动：世 = 当前环境，应 = 要去的地方
```

朱辰彬：

```text
明确单位的工作
→ 父母可以代表单位
→ 官鬼可以代表工作

特指事占
→ 应爻可能承担特指对象核心职责
```

因此以后 Observation Plan 应允许：

```text
Primary  : position/job
Domain   : employer/unit
Role     : querent
Role/Context : specified external target（只有来源条件成立时）
```

而不是强迫：

```text
父母 == 应
```

这与龟甲现有 Primary / Role / Domain 架构天然兼容。

---

# 5. 升职 / 晋升

第二轮没有发现足以推翻 v0.1 的来源冲突。

直接传统链：

- 《断易天机》“占加官”“占迁官”；
- 《黄金策·仕宦》官爻兴隆、官爻隐伏与爵位升迁；
- 《易隐·升迁》世官旺动、世应关系；
- 《增删卜易》占升迁以官星为核心。

现代：

- 王虎应“测升职”官鬼为用；
- 朱辰彬“职务升迁”“单位内晋升机会”均直接“求晋升应取官鬼为用神”。

结论维持：

```text
position_advancement
Primary → 官鬼
Role    → 世
```

父母可作为正式任命 / 文书 / 单位确认的辅助或 Domain，不应无条件升为第二 Primary。

分类：`stable_consensus`

---

# 6. “转正”不是已经证明等于“升迁”

本轮在已核经典和两位现代作者资料中，尚未找到足够直接证据证明：

```text
现代试用期转正
=
传统升迁
```

两者虽然都涉及职位状态变更，但：

- 升迁强调职位 / 官阶上升；
- 转正可能职位、职责、薪酬均不变，仅由试用身份变成正式雇佣；
- 正式确认、合同、手续又与父母传统语义相接。

因此当前分类：

```text
转正 → position_advancement
```

只能是 `modern_mapping_only`，不能标成 traditional consensus。

更稳妥的 future semantic candidate 是：

```text
employment_status_confirmation
```

是否与 `position_advancement` 共用 route，要等 Intent/Rule Review 决定。

此处修正了 legacy strong signal `转正` 直接进入 career heuristic 的潜在过度概括。

---

# 7. 裁员 / 保住工作：传统成熟度其实高于“转正”

传统存在明确独立主题：

- 《断易天机》“占官得替否”“占现任官得多少时”；
- 《黄金策·仕宦》“剥官削职”“官居不久”“退休”等；
- 《易隐》有失职、替代专节；
- 《增删卜易》现任官总则也区分官、世受损等情形。

现代：

- 王虎应工作案例中有“后被单位辞退”；
- 朱辰彬进阶篇有“单位这次裁员是否会波及到自己失去工作”专例。

所以：

```text
employment_retention
```

有较强传统—现代连续性。

但它**不在当前 inventory 的三个 hypotheses 内**。

研究建议：

```text
不要把裁员 / 保住工作偷偷塞进 position_advancement
```

后续应在 Rule Review 前决定：

1. 把 `employment_retention` 加为 career_position 的第四个 future hypothesis；或
2. 明确第一轮不训练该目标，保留后续扩展。

本研究倾向方案 1，但本阶段不修改 inventory。

---

# 8. 跳槽：来源真实冲突与可保留的最小公约数

## 8.1 王虎应体系

王虎应工作章：

```text
工作变动
→ 官鬼为工作核心
→ 世为现在工作环境
→ 应为要去的地方
```

答疑继续区分：

```text
能否跳槽成功 → 官为主，兼世
跳后如何 → 应 / 世 + 官
该不该辞职 → 财的重要性上升
```

这是明确的现代系统规则。

## 8.2 《易隐》体系

《易隐·升迁》：

```text
内旺外衰 → 宜守旧
内衰外旺 → 宜图新
内外俱旺 → 彼此如意
```

说明古典确实存在当前 / 新处比较思想，但不是王虎应式“世=旧、应=新”的同一公式。

## 8.3 朱辰彬体系

朱辰彬“跳槽好还是不跳槽好”案例：

- 事业核心仍是官鬼；
- 两个具体事业机会由两个财爻承载并按现状 / 变爻对应识别；
- 当前单位和未来单位不是机械套入世 / 应。

另一个“计划跳槽到某公司”案例甚至把发动应爻定位为计划前往的具体公司 / 方案核心。

## 8.4 结论

以下不能成为跨来源正式规则：

```text
世 = 旧工作
应 = 新工作
```

分类：`school_specific`

以下可以成为跨来源最小公约数：

```text
工作变动仍以工作 / 职位目标为主轴
current 与 proposed employment 必须被区分
特指的新去处需要独立 contextual observation
比较题不能把两个方案压成一个单对象
```

分类：`cross_source_compatible`

因此后续 Rule Candidate 应使用**职责结构**而不是硬编码两个爻：

```text
Primary: employment / position core
Role: querent
Alternative context:
  current employment
  proposed employment

traditional mapping of alternatives:
  source-conditioned / resolver-based
```

---

# 9. 面试与考试边界

第二轮进一步确认：

```text
面试
```

本身不是“考试主题”的充分条件。

王虎应把找工作的面试直接放在工作问题中，以官鬼为主；朱辰彬职位竞聘、面试获聘案例也以职位官鬼为核心。

相反，《黄金策·求名》明确是：

```text
父母 = 文章 / 文书
官鬼 = 功名 / 官职
```

现代王虎应也明确说公务员之类存在考试时可参考考试章。

因此 future boundary 应按 current result duty：

```text
面试是否让我获得职位 / 被录用
→ career_position

笔试 / 资格考试本身能否通过
→ study_exam candidate

考试成绩是否最终转化为职位
→ 需要看问句当前目标；不能只看“考试”关键词
```

仍待 `study_exam` 主题完成后反向审计。

---

# 10. Evidence 条件与禁止绝对化

传统文本常见：

- 子孙克官 / 发动 → 对功名、任职不利；
- 兄弟发动 → 求名竞争、俸禄受损或同僚问题；
- 官空、官伏、世空、父空 → 不同阶段的不利条件；
- 官生合世 / 旺相 → 有利职位取得或升迁；
- 父母空亡 → 任命、文书、差除不利。

这些都不能转换成无条件现代 hard rules，例如：

```text
子孙动 = 必失业
兄弟动 = 面试有竞争者
官鬼旺 = 必录用
父母空 = 一定没有 offer
```

原因是各来源均包含前提、用神状态、日月动变和具体占类。

正式化时只能生成条件 Evidence，不直接生成最终结果标签。

---

# 11. v0.2 建议的现代职责重构

建议把第一轮 `career_goal` 从三个粗类重构为：

```text
job_application_outcome
position_advancement
employment_status_confirmation   # 转正等，modern mapping only
employment_transition_outcome    # 能不能跳成 / 能否获得新工作
employment_transition_comparison # 留旧 vs 去新
resignation_suitability           # 无下家时是否先离职；需谨慎，财等职责会上升
employment_retention              # 裁员 / 保住职位，传统成熟度高
```

这不是 route 数量结论。

这些可以在 Semantic 层仍归一个 theme，并通过 `career_goal` 分流到不同 Observation Rule。

---

# 12. 研究成熟度评估

已经成熟：

```text
job_application_outcome
position_advancement
employment_retention
```

有直接传统 + 多现代来源，足够进入后续 Rule Candidate 研究设计。

部分成熟：

```text
employment_transition_outcome
```

官鬼 / 世的主轴成熟，但新旧工作具体映射存在流派差异。

需要保守规则或 resolver：

```text
employment_transition_comparison
```

“比较两个方案”有传统与现代支持，但具体如何映射两个 alternative 不存在统一公式。

尚不宜直接规则化：

```text
employment_status_confirmation
resignation_suitability
```

前者缺少转正直接证据；后者会因问题真正关注的是生计 / 财务还是工作本体而改变传统观察职责。

---

# 13. 下一步

v1.0 收口前只剩三项：

1. 将来源逐条归入“稳定 / 兼容 / 流派特定 / 冲突 / 证据不足”的最终矩阵；
2. 明确哪些 sub-goal 允许进入首轮 Rule Review，哪些必须排除；
3. 写出“研究完成但不等于可训练”的 promotion boundary。

当前：

```text
research_reconciliation
trainingEligible = false
currentRoute = false
formalRuleCandidate = not_created
```
