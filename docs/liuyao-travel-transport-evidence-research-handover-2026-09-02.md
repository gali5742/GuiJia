# 龟甲 · 六爻 Travel Transport Evidence Research Handover

日期：2026-09-02

仓库：

```text
gali5742/GuiJia
```

当前研究所在分支：

```text
liuyao-semantic-v013-core
```

本 Handover 生成前最后一次观察到的分支 HEAD：

```text
bb0c023d2c54665faa56572a36b27645169d8947
```

对应 commit：

```text
chore(liuyao): lock v0.4 semantic act model
```

> 注意：该分支存在并行 Semantic Candidate / Semantic Act 开发。上述 HEAD 只是本 Handover 生成前的观察锚点，不应被理解为 Travel 研究线自己的最后提交。下一次继续工作前必须重新读取实际 branch HEAD，不得 reset / revert / force-update 到本文记录的旧 SHA。

Travel Transport 本轮研究线最后一个专项提交：

```text
901fc7bbeaa0599ace218c9869922400578a266a
```

对应 commit：

```text
docs(liuyao): review active control transport interaction evidence
```

---

# 0. 当前状态一句话

当前 Travel 的 `travel_disruption_transport` 已经从“父母爻有某个状态 → 直接判断飞机 / 火车能不能走”的旧式捷径，推进到：

```text
Semantic transport target
↓
concrete transport line binding
↓
reading-scoped structural Fact
├─ Activity Fact
└─ Line Relation Fact
↓
non-conclusive Domain Interaction Evidence
↓
Source / Interaction Effectiveness
↓
Pressure Evidence
↓
Transport Assessment
```

目前实际完成到：

```text
resolved transport target
+
VISIBLE_MOVING source
+
source CONTROLS transport
↓
transport_active_control_interaction
```

这一层。

但：

```text
transport_active_control_interaction
≠ transport_effective_control_pressure
≠ transport_blocked
≠ transport_delayed
≠ transport_cancelled
```

当前唯一合理的下一研究目标是：

```text
Active Control Source Effectiveness
```

即先判断一个正在活动、并克制 transport target 的 source，究竟是：

```text
effective
weakened
ineffective
unresolved
```

而不是直接进入 Transport Assessment。

---

# 1. 强制边界

本研究线继续遵守以下边界。

## 1.1 项目边界

只处理：

```text
龟甲 / LiuYao / 六爻 / Travel
```

不要修改：

```text
BaZi
蓍草
Time Engine
```

除非后续用户明确切换范围。

## 1.2 并行开发边界

当前 `liuyao-semantic-v013-core` 同时存在 Semantic Candidate v0.4 / Semantic Act 开发。

因此 Travel 研究继续时必须：

```text
先读取最新 branch HEAD
↓
确认并行改动
↓
只做 Travel / shared-fact design-only 增量
```

禁止：

```text
reset 到 Travel 旧 commit
revert 并行 Semantic 提交
force push
覆盖 Candidate v0.4 的 data / model / training / calibration 文件
```

## 1.3 当前 Travel expansion 边界

本轮所有新增 Travel transport 研究仍按：

```text
design_only
```

处理。

即使并行 Semantic Candidate v0.4 已经推进，也不能由此自动推出：

```text
Travel formal expansion 已获授权
```

在没有新的明确 gate / user authorization 前，不要把本文研究内容直接写入：

```text
current 22-route runtime
正式 Semantic Intent
正式 Rule Registry
Time Engine
正式训练 / calibration 数据
```

## 1.4 推理分层边界

必须保持：

```text
Fact
≠ Evidence
≠ Assessment
```

以及：

```text
Modern Semantic Object
≠ Traditional Observation Object
```

不能因为某个传统结构关系存在，就在 Fact 层提前塞入现代领域结论。

---

# 2. Travel 已有主题架构

Travel 基础研究与 isolated pretraining 已在此前完成。

主文件包括：

```text
docs/liuyao-literature/travel-research-v1.0.md
docs/liuyao-literature/travel-rule-review-v0.1.md
docs/liuyao-literature/travel-intent-schema-design-v0.1.md
js/liuyao-travel-pretraining-v01.js
tests/liuyao-travel-pretraining-v01-tests.js
```

Travel 第一轮支持职责：

```text
travel_execution
travel_safety
travel_disruption_journey
travel_disruption_transport
```

核心传统观察架构：

```text
self travel
→ Traveler Primary = 世

represented traveler
→ actual relation resolver

transport operation itself
→ 父母 can be Primary candidate

journey execution with transport context
→ Traveler Primary + 父母 Domain
```

代问 traveler resolver 第一轮：

```text
self            → 世
parent          → 父母
child           → 子孙
wife            → 妻财
husband         → 官鬼
sibling_or_peer → 兄弟
other / unknown → unresolved
```

禁止 represented traveler 无法解析时 fallback 到世。

此前已明确：

```text
travel_return_or_arrival_of_other
```

更适合未来独立为“行人 / 归期”主题，而不是硬塞回 Travel；

```text
generic_travel_state
```

如“最近出行运怎么样”，由于缺少 bounded event，应继续保持 semantic insufficient。

---

# 3. 本轮 Transport 专项的关键架构修正

本轮深挖后，Transport 不再被当成一个单一的：

```text
operating_as_scheduled = true / false
```

问题。

至少必须拆成三条独立 Evidence axis：

```text
A. Operational Viability
   是否存在现实运行 / 起飞 / 发车趋势

B. Schedule Adherence
   是否按原计划时间运行

C. Obstruction Resolution
   阻碍因素是否减弱 / 消退
```

它们可以同时出现不同方向。

例如同一班飞机完全可能：

```text
当天最终能够起飞
+
不能按时起飞
+
阻碍后来解除
```

因此：

```text
can_operate ≠ on_schedule
```

也因此不允许建立：

```text
PROGRESS → on_schedule
```

这种伪对称规则。

同样，`RETREAT` 没有脱离对象绑定的全局 polarity：

```text
RETREAT on transport
→ 可能形成 delay / postponement Evidence

RETREAT on obstruction
→ 可能形成 obstruction dissipation Evidence
```

必须先知道：

```text
这个 move Fact 属于什么现实 / 传统观察对象
```

才能进入领域解释。

---

# 4. 本轮研究提交时间线

以下是本次 Transport Evidence 深挖的核心提交。

## 4.1 Operation 与 Schedule 分离

commit：

```text
03e46f3fcb439065687c5cc330e655855df908fe
```

文件：

```text
docs/liuyao-literature/travel-transport-operation-vs-schedule-evidence-research-v0.1.md
```

状态：

```text
research_complete_design_only
```

主要结论：

```text
operational_viability
schedule_adherence
obstruction_resolution
```

必须分层。

不能：

```text
PROGRESS → on_schedule
no RETREAT → on_schedule
transport active → on_schedule
```

王虎应飞机案例提供了最直接反例：

```text
可以起飞
+
不能按时起飞
```

可以同时成立。

---

## 4.2 Transport Operation Activity Evidence

commit：

```text
84f52703be2204394a69ccee7a1a0105294df6d7
```

文件：

```text
docs/liuyao-literature/travel-transport-operation-activity-evidence-review-v0.1.md
```

状态：

```text
review_complete_design_only
```

审定：

```text
resolved concrete transport
+
DARK_MOVING
↓
transport_operation_activity
```

但该 Evidence 必须保持：

```text
polarity = neutral
conclusionShaped = false
```

它只表示：

```text
transport object has an activity signal
```

不表示：

```text
一定起飞
一定发车
一定运行成功
一定按时
一定不取消
```

---

## 4.3 VISIBLE_MOVING Fact provenance 闭合

commit：

```text
a94747ef6277a02762073a79e27e52ca9cb7e87a
```

文件：

```text
docs/liuyao-literature/liuyao-line-activity-fact-provenance-review-v0.1.md
```

状态：

```text
provenance_review_complete_design_only
```

确认手动起卦与掷币起卦最终都统一为：

```text
6 / 7 / 8 / 9
```

其中：

```text
6 / 9 → moving = true
7 / 8 → moving = false
```

这一 `moving=true` 在输入 / 排盘结构阶段已经确定，不依赖：

```text
旺衰
月建
日辰
旬空
六亲
世应
用神
score
Assessment
```

因此可以安全规范化为：

```text
VISIBLE_MOVING
family = activity_state
polarity = neutral
```

同时必须保留：

```text
VISIBLE_MOVING
DARK_MOVING
```

两个不同 sourceCode，不能模糊合并成 `ACTIVE` 而丢失 provenance。

---

## 4.4 Transport Blocking Evidence Resolution

commit：

```text
5057fc0415e5a6b2cf6e206bd1aea47ee26520ad
```

文件：

```text
docs/liuyao-literature/travel-transport-blocking-evidence-resolution-research-v0.1.md
```

状态：

```text
research_complete_design_only
```

本轮否决了原先过早的：

```text
PRR-TRAVEL-OBSTRUCTION-OBJECT
```

概念。

原因：Transport obstruction 不是一个可以固定映射到某个六亲的统一现实对象。

至少存在：

```text
A. target-directed blocking interaction
B. journey-process obstruction
C. generic obstruction archetype
D. specific hazard / adverse circumstance
```

古典间爻更接近：

```text
journey-process responsibility
```

而不是天气 / 跑道 / 故障等现实实体。

兄弟虽有 broad `阻神` archetype，也不能推出：

```text
transport obstruction = 兄弟
```

王虎应飞机案例中，同一卦里同时出现：

```text
妻财卯木发动克父母 transport
→ target-directed blocking interaction

兄弟酉金
→ 被作者解释为跑道积雪 / contextual obstruction
```

已经足以证明：

```text
阻碍 responsibility ≠ 固定六亲 identity
```

因此今后的方向应是：

```text
Blocking Evidence Resolution
```

而不是：

```text
Obstruction Object Resolver
```

---

## 4.5 Line Relation Fact provenance

commit：

```text
0bc16090c25693ae314e3a9b603f24348bf1ff40
```

文件：

```text
docs/liuyao-literature/liuyao-line-relation-fact-provenance-review-v0.1.md
```

状态：

```text
provenance_review_complete_design_only
```

确认 Core 已有纯结构关系来源：

```text
generateMap
controlMap
heMap
chongMap
```

因此以下关系的 computation provenance 已存在：

```text
A generates B
A controls B
A / B six-harmony
A / B six-clash
same element
```

但：

```text
generic arbitrary line-to-line
reading-scoped atomic relation Fact
```

目前还没有正式通用实现。

### 不能复用 legacy `buildDirectMovingUseFacts()`

原因至少有三层：

```text
1. target 被写死为 legacy 用神
2. generate / control 已预先带 support / constraint interpretation
3. movement 与 relation 被一个 generator 捆绑
```

而新架构需要：

```text
Activity Fact
+
Line Relation Fact
↓
Domain Evidence
```

Line Relation Fact 首轮应保持中性：

```text
same_element
generates
controls
six_harmony
six_clash
```

即使：

```text
A controls B
```

Fact 层也不应该直接：

```text
polarity = negative
```

而只记录：

```text
relation = controls
```

此外五行关系与地支关系必须并行存在，不能互相覆盖。

---

## 4.6 Shared Line-Pair Fact Provider 设计

已有文件：

```text
docs/liuyao-literature/shared-line-pair-fact-provider-research-v0.1.md
```

状态：

```text
design_required_not_implemented
```

其核心建议是未来建立 target-agnostic shared provider：

```text
LINE_PAIR_SAME_ELEMENT
LINE_A_GENERATES_LINE_B
LINE_B_GENERATES_LINE_A
LINE_A_CONTROLS_LINE_B
LINE_B_CONTROLS_LINE_A
LINE_PAIR_SIX_HARMONY
LINE_PAIR_SIX_CLASH
```

要求：

```text
reading-scoped
source / target direction explicit
atomic
conclusionShaped = false
```

禁止 Travel 自己复制：

```text
generateMap / controlMap / heMap / chongMap
```

也禁止 Travel 借用 legacy 用神 relation facts 作为捷径。

该 provider 目前仍未实现；继续研究时可把它作为 infrastructure blocker 记录，但在没有 explicit shared-runtime authorization 前，不要擅自重构 `liuyao-core.js`。

---

## 4.7 Visible Moving + Controls Transport Review

commit：

```text
9beaaeb015c57917978624601d6c7630b72f75d3
```

文件：

```text
docs/liuyao-literature/travel-transport-visible-moving-control-evidence-review-v0.1.md
```

状态：

```text
review_complete_design_only_infrastructure_blocked
```

审查组合：

```text
same readingRef
+
transportBinding.status = resolved
+
source = VISIBLE_MOVING
+
source != transport target
+
source CONTROLS transport target
```

原先可能想写：

```text
→ transport_blocking_interaction
```

但最终否决，因为 `blocking` 容易暗示：

```text
克制已经有效地产生阻断
```

而传统与现代案例都明确存在：

```text
有动
+
有克
+
但克害无力 / 后续失效
```

因此只能审定：

```text
→ transport_active_control_interaction
```

即：

```text
Level 1 Structural Facts
VISIBLE_MOVING(source)
CONTROLS(source,target)

Level 2 Domain Interaction Evidence
transport_active_control_interaction

Level 3 Effectiveness / Pressure Evidence
transport_effective_control_pressure
```

本轮只完成 Level 2。

---

## 4.8 Active Control Interaction Evidence Review

Travel 专项最新 commit：

```text
901fc7bbeaa0599ace218c9869922400578a266a
```

文件：

```text
docs/liuyao-literature/travel-transport-active-control-interaction-evidence-review-v0.1.md
```

状态：

```text
review_complete_design_only
```

这是当前应优先阅读的最后一份 Transport 文档。

它最终冻结的最低层组合：

```text
transport target resolved
+
source Activity Fact = VISIBLE_MOVING
+
Line Relation Fact = source CONTROLS transport
+
same readingRef
+
source != target
↓
transport_active_control_interaction
```

建议 Evidence：

```ts
{
  kind: 'transport_active_control_interaction',
  dimension: 'obstruction_interaction',
  polarity: 'neutral',
  relation: 'controls_transport',
  activitySourceCode: 'VISIBLE_MOVING',
  effectivenessStatus: 'unresolved',
  conclusionShaped: false
}
```

这里 `neutral` 不代表“克没有不利方向”，而代表：

```text
当前只确认 interaction provenance
尚未确认 effect actually holds
```

Cross-source 分类：

```text
cross_source_compatible_nonconclusive
```

不是：

```text
stable_consensus_transport_blocking_rule
```

---

# 5. 为什么“明动 + 克”仍然不能判阻碍有效

这是下一阶段必须牢记的核心。

传统《增删卜易》已经区分：

```text
忌神动而克害用神
```

与：

```text
忌神虽动，不能克用神
```

即：

```text
control interaction exists
≠
control is effective
```

现代案例也形成非常好的正反边界。

## 5.1 王虎应飞机案例

提供：

```text
resolved transport
+
active source
+
source controls transport
```

可以进入 transport adverse-interaction 观察。

但同一卦还有其他阻碍机制，因此它不能证明：

```text
任意 moving-control
→ 单独足以决定 delay
```

## 5.2 朱辰彬“发现号”航天飞机案例

结构上同样存在：

```text
父母子水 = transport
辰土发动克父母子水
```

但辰土随后：

```text
化退
+
化破
```

作者据此把这一外部不利作用解释为趋于失效 / 无用动爻，最后飞船安全返回。

因此该案例特别清楚地证明：

```text
interaction provenance
↓
source / interaction effectiveness
↓
effective adverse pressure
```

必须拆开。

---

# 6. 当前 Fact → Evidence → Assessment 梯子

当前正确梯子应写成：

```text
Semantic Intent
↓
TR-TV-001-D / transport current target
↓
PRR-TRAVEL-TRANSPORT-OBJECT
↓
resolved concrete transport line
↓
────────────────────────────
Structural Fact Layer
├─ VISIBLE_MOVING(source)
├─ DARK_MOVING(source)
├─ CONTROLS(source,target)
├─ GENERATES(source,target)
├─ SIX_CLASH(source,target)
└─ SIX_HARMONY(source,target)
↓
────────────────────────────
Domain Interaction Layer
├─ transport_operation_activity
└─ transport_active_control_interaction
↓
────────────────────────────
Effectiveness Layer
├─ effective
├─ weakened
├─ ineffective
└─ unresolved
↓
────────────────────────────
Pressure Evidence Layer
├─ transport_effective_control_pressure
├─ obstruction_dissipation
└─ other future evidence
↓
────────────────────────────
Assessment Layer
├─ operational_viability
├─ schedule_adherence
└─ disruption / cancellation / delay assessment
```

目前完成到 Domain Interaction Layer。

Effectiveness Layer 是下一研究目标。

---

# 7. 当前完成状态矩阵

```text
Transport semantic decomposition
  operational_viability              = researched / assessment not ready
  schedule_adherence                 = separation researched / positive default absent
  obstruction_resolution             = researched / assessment not ready

Activity Fact provenance
  VISIBLE_MOVING                     = complete
  DARK_MOVING                        = complete / existing line-status provenance

Line Relation provenance
  computation                        = available
  generic target-agnostic Fact API   = not implemented

Transport Activity Evidence
  DARK_MOVING
  → transport_operation_activity     = reviewed / design-only

  VISIBLE_MOVING
  → normalized activity contract     = provenance-ready

Transport Control Interaction
  VISIBLE_MOVING + CONTROLS target
  → transport_active_control_interaction
                                      = reviewed / admitted design-only

Active Control Source Effectiveness  = NOT researched to completion
Transport Effective Control Pressure = NOT ready
Transport Operational Assessment     = NOT ready
Transport Schedule Assessment        = NOT ready
Formal Travel Expansion              = NOT authorized by this research lane
```

---

# 8. 当前最大的 blocker

现在最大的 blocker 已经不再是：

```text
“有没有一个克 transport 的动爻？”
```

这个 interaction 已经可以表达。

真正 blocker 是：

```text
这个 source 的作用能力到底是否有效？
```

因此下一步必须建立：

```text
Active Control Source Effectiveness
```

而不是马上做：

```text
transport blocked?
transport delayed?
transport cancelled?
```

否则会重新把：

```text
Fact
→ Evidence
→ Assessment
```

压扁成旧式一跳判断。

---

# 9. 下一研究任务：Active Control Source Effectiveness

建议新文件：

```text
docs/liuyao-literature/travel-transport-active-control-source-effectiveness-research-v0.1.md
```

或者如果研究证明该层应跨主题共享，可在完成文献审查后再决定是否升级为 shared effectiveness contract；不要一开始就假定它一定只属于 Travel，也不要未经审查直接抽成 runtime shared module。

## 9.1 首要研究问题

### A. RETREAT

研究：

```text
VISIBLE_MOVING source
+
CONTROLS transport
+
source RETREAT
```

是否可以登记为：

```text
control_source_weakening
```

或者：

```text
interaction_effectiveness = weakened
```

需要区分：

```text
RETREAT describes source trend
```

与：

```text
RETREAT is sufficient to neutralize control
```

不能机械把所有 RETREAT 都写成 ineffective。

### B. TRANSFORM_MONTH_BREAK / TRANSFORM_VOID / RETURN_* 等 move-state Fact

逐项研究现有 move-state / transform Facts：

```text
RETREAT
PROGRESS
TRANSFORM_MONTH_BREAK
TRANSFORM_VOID
RETURN_CONTROL
RETURN_GENERATE
RETURN_HARMONY
RETURN_CLASH
其他现有 move-state Fact
```

问题不是：

```text
旧代码 type 是 support 还是 constraint
```

而是：

```text
这些 Fact 是否改变 source 的实际作用能力？
若改变，是 effective / weakened / ineffective 的哪一类？
是否需要组合条件？
```

禁止直接复用 legacy tag polarity。

### C. Calendar VOID / BREAK

研究 source 的：

```text
VOID
MONTH_BREAK
DAY_* / calendar status
```

如何进入 effectiveness layer。

这里必须消费既有 Fact provenance，不能在 Travel Adapter 内重算 Time Engine。

### D. 多 source

若同时存在多个 source：

```text
source A controls transport
source B controls transport
source C generates transport
```

必须先保留多条独立 Evidence。

禁止：

```text
negativeCount++
positiveCount++
```

然后简单多数决。

### E. Source effectiveness 与 Interaction effectiveness 是否需要进一步区分

文献研究时要主动检查：

```text
source 本身有力
```

是否一定等于：

```text
source 对当前 target 的作用有效
```

如果 target 本身的状态、其他爻介入、合绊 / 回头作用等会改变作用兑现，则可能需要：

```text
Source Effectiveness
↓
Interaction Effectiveness
```

两级结构，而不是单一字段。

不要为了简化预先合并。

---

# 10. 下一轮优先文献方向

应继续多源研究，不以单作者案例直接注册 universal rule。

优先：

```text
《增删卜易》
- 忌神动而克害用神
- 忌神虽动不能克用神
- 进退神
- 动变 / 回头生克
- 空破与作用能力

朱辰彬《古筮真诠》《进阶篇》
- 动爻有效 / 无效
- 化退、化破
- 航天飞机等现代案例

王虎应
- transport / airplane cases
- active source control / obstruction / dissipation cases

其他独立传统 / 现代来源
- 用于确认哪些 effectiveness 条件是稳定共识
- 用于发现反例与 school-specific 差异
```

来源 lineage 必须继续注意：

```text
同一作者不同案例
≠ 多个独立来源
```

同样：

```text
同源古籍传承
≠ 可以机械当独立投票
```

研究分类继续使用：

```text
stable_consensus
cross_source_compatible
school_specific
conflicted
insufficient_evidence
modern_mapping_only
```

---

# 11. 下一阶段建议的输出 contract

研究完成后，如果证据足够，可以先形成 design-only Effectiveness Evidence contract，例如：

```ts
{
  kind: 'transport_control_source_effectiveness',
  readingRef,
  sourcePosition,
  targetPosition,
  interactionRef,
  status: 'effective' | 'weakened' | 'ineffective' | 'unresolved',
  sourceFactRefs: [...],
  conclusionShaped: false
}
```

但这里的名字和字段只是 research target，不是已冻结 schema。

特别禁止把它写成：

```ts
{
  delayed: true,
  cancelled: false
}
```

Effectiveness 只回答：

```text
这个 interaction 是否有力
```

不直接回答：

```text
transport 最终发生什么
```

---

# 12. 明确禁止的捷径

下一对话继续时，以下做法均不接受。

## 12.1 不要把 PROGRESS 当准点

禁止：

```text
PROGRESS → on_schedule
```

## 12.2 不要把 DARK_MOVING 当成功

禁止：

```text
DARK_MOVING → guaranteed departure
```

## 12.3 不要把 VISIBLE_MOVING 当正向

禁止：

```text
VISIBLE_MOVING → positive
```

## 12.4 不要在 Fact 层把 CONTROLS 写成 negative

正确：

```text
A controls B
```

错误：

```text
A controls B → negative Fact
```

## 12.5 不要把 moving + control 直接写成 blocked

禁止：

```text
VISIBLE_MOVING + CONTROLS transport
→ blocked / delayed / cancelled
```

当前只能：

```text
→ transport_active_control_interaction
```

## 12.6 不要固定某个六亲为 obstruction

禁止：

```text
兄弟 = transport obstruction
官鬼 = transport obstruction
间爻 = transport obstruction object
```

它们可能承担不同类型的 contextual responsibility，但不是一个统一现实对象。

## 12.7 不要复制 Core 五行算法到 Travel

禁止在 Travel 内重新维护：

```text
generateMap
controlMap
heMap
chongMap
```

## 12.8 不要借 legacy UseGod Facts 偷渡

禁止把：

```text
MOVING_LINE_CONTROLS_USE
```

直接当成新 Travel relation Fact。

因为其 target / polarity / movement provenance 都与新架构不同。

## 12.9 不要重算 Time Engine

Calendar VOID / BREAK 等若参与 effectiveness，应消费 existing Fact / provider output，不在 Travel 中重新实现时间效力逻辑。

## 12.10 不要简单计数

禁止：

```text
positive facts = 3
negative facts = 2
→ positive
```

多个 source / relation 必须先保持 provenance 和责任分离。

---

# 13. 并行 Semantic Candidate v0.4 注意事项

本 Handover 生成时，当前 branch 已经出现独立的 Semantic Candidate v0.4 / Semantic Act 开发提交。

本 Travel research lane 与其关系应理解为：

```text
同一 branch ancestry
≠
同一任务线
```

Travel 最近研究提交之后，branch 上已经继续出现：

```text
v0.3 immutable failure diagnosis
Candidate v0.4 architecture / data contract
Semantic Act schema / fresh data / seal
Semantic Act model / training / calibration
model lock
```

因此下一次继续 Travel 时：

1. 先 fetch 最新 branch HEAD；
2. 审查 Travel 文件仍在 ancestry；
3. 不基于旧 HEAD 写“当前整个 Semantic 状态”；
4. 不覆盖 v0.4 文件；
5. 如果未来需要 shared runtime integration，必须先重新审查 v0.4 当前正式 gate，而不是沿用旧 v0.3 状态推断。

---

# 14. 如果下一对话用户只说“继续”

默认继续：

```text
Travel Transport
→ Active Control Source Effectiveness Research
```

不要跳回五主题总览，也不要自动进入正式训练。

建议执行顺序：

```text
1. fetch 最新 branch HEAD
2. 阅读本 Handover
3. 阅读 901fc... 对应 active-control interaction review
4. 阅读《增删卜易》忌神有力 / 无力、动变、进退、空破相关证据
5. 对照朱辰彬 / 王虎应独立现代案例
6. 建 effectiveness evidence taxonomy
7. 主动寻找反例
8. 明确哪些条件 stable / compatible / school-specific / conflicted
9. 形成 versioned design-only research doc
10. 仍不进入 Transport Assessment
```

下一份最自然文件：

```text
docs/liuyao-literature/travel-transport-active-control-source-effectiveness-research-v0.1.md
```

只有当该研究明确完成后，才考虑是否继续：

```text
Source Effectiveness
↓
Interaction Effectiveness
↓
transport_effective_control_pressure Review
↓
Operational Viability / Schedule Adherence Assessment Design
```

---

# 15. 机器可读式状态摘要

```text
repo = gali5742/GuiJia
branch = liuyao-semantic-v013-core
branchObservedHeadBeforeHandover = bb0c023d2c54665faa56572a36b27645169d8947
travelResearchLaneLatestCommit = 901fc7bbeaa0599ace218c9869922400578a266a

travelTransport.operationVsScheduleResearch = complete_design_only
travelTransport.operationActivityReview = complete_design_only
lineActivityFact.visibleMovingProvenance = complete
lineActivityFact.darkMovingProvenance = complete
transportBlockingEvidenceResolutionResearch = complete_design_only
lineRelationFact.provenance = complete
sharedLinePairFactProvider = design_required_not_implemented
transportActiveControlInteractionReview = complete_design_only
activeControlSourceEffectivenessResearch = pending
transportEffectiveControlPressureReview = pending
transportOperationalAssessment = not_ready
transportScheduleAssessment = not_ready
formalTravelExpansion = not_authorized_by_this_lane
```

---

# 16. 当前研究线最终结论

本轮最重要的成果不是“多了一条飞机延误规则”，而是把 Transport 的推理责任拆开：

```text
对象是谁
↓
对象是否在活动
↓
谁与它发生什么结构关系
↓
这个 interaction 属于什么领域责任
↓
作用是否有效
↓
是否形成实际 pressure
↓
最后才判断运行 / 延误 / 取消 / 准点
```

因此当前最需要避免的回退，就是重新写成：

```text
某爻动 / 某爻克 / 某爻化退
→ 直接得到班次结论
```

下一阶段必须继续沿：

```text
Active Control Source Effectiveness
```

推进。
