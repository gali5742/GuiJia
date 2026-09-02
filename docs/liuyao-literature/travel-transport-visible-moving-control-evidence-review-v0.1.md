# 龟甲 · 六爻 Travel Transport Visible-Moving Control Evidence Review v0.1

日期：2026-09-02

状态：`review_complete_design_only_infrastructure_blocked`

主题：`travel.travel_disruption_transport`

上游：

- `travel-transport-blocking-evidence-resolution-research-v0.1.md`
- `travel-transport-operation-activity-evidence-review-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `liuyao-line-relation-fact-provenance-review-v0.1.md`
- `shared-line-pair-fact-provider-research-v0.1.md`
- `js/liuyao-move-transform-fact-adapter-pretraining-v01.js`

> 本 Review 只审一条最窄组合：**已解析的 concrete transport line，被另一条明动原始爻在五行关系上直接克制时，可以登记到哪一级 Evidence。** 不审暗动克、六冲、六合、生扶，不建立延误 / 取消 / 无法运行 / 安全 Assessment，不修改 current-22 / Rule Registry / Time Engine。

---

# 1. Review 问题

目标组合：

```text
same readingRef
+
transportBinding.status = resolved
+
source line = VISIBLE_MOVING
+
source != transport target
+
source CONTROLS transport target
```

原设想曾接近：

```text
→ transport_blocking_interaction
```

本轮重新审查的核心问题是：

```text
“明动 + 克”
是否已经足以说明
“阻碍正在有效发生”？
```

结论：**不足。**

更准确的第一层输出只能是：

```text
transport_active_control_interaction
```

而不是：

```text
transport_blocking_pressure
transport_disrupted
transport_delay
transport_cancelled
```

---

# 2. 传统总则：《增删卜易》把“克”与“克得动”分开

《增删卜易·用神元神忌神章》首先定义：

```text
忌神 = 克用神之爻
```

因此：

```text
source controls target
```

确实具有一个明确的 target-relative adverse direction。

但《增删卜易·元神忌神衰旺章》紧接着把忌神分成两类：

```text
忌神动而克害用神者
```

与：

```text
忌神虽动，不能克用神者
```

后者包括休囚、受制、入墓、化退、化绝、化破、化克、化散、与元神同动等情形。

因此传统规则本身已经否决：

```text
VISIBLE_MOVING
+
CONTROLS target
→ effective harm
```

这种机械转换。

这里至少需要两层：

```text
control interaction exists
↓
source / interaction effectiveness
↓
effective adverse pressure
```

分类：

```text
stable_classical_effectiveness_separation
```

---

# 3. 王虎应 · 太原机场案例

已有 Travel 阻碍专项研究记录了王虎应飞机案例。

问题核心：

```text
飞机什么时候起飞？
```

作者以：

```text
父母 → 飞机 / transport target
```

并见：

```text
妻财卯木发动
→ 克父母 transport
→ 与飞机受阻、不能按时起飞联系
```

这一例直接支持：

```text
resolved transport target
+
active source
+
source controls target
```

可以进入 transport-specific adverse interaction 观察。

但同一卦还存在兄弟酉金、跑道积雪、化退等另外的阻碍与解除信息，因此该例不能证明：

```text
任意 moving-control
→ 单独足以决定延误
```

更不能证明：

```text
source 六亲必须是妻财
```

本 Review 只吸收最低层兼容项：

```text
active control relation
→ transport_active_control_interaction
```

分类：

```text
modern_transport_direct_case_support
```

---

# 4. 朱辰彬《古筮真诠》·“发现号”航天飞机案例

该例提供了本 Review 最重要的反事实边界。

作者以：

```text
父母子水
→ 航天飞机 / transport target
```

并见：

```text
辰土发动
→ 直接克父母子水
```

这一结构被作者用于解释飞船现实中的故障 / 风险压力。

但是辰土变丑土：

```text
化退
+
化破
```

作者因而把该动爻判为：

```text
外动力失效 / 无用动爻
```

最终飞船仍安全返回。

所以同一案例同时证明两件事：

```text
A. moving source controls transport target
   → adverse interaction information exists

B. adverse interaction exists
   ≠ adverse effect remains effective
```

换言之：

```text
interaction provenance
```

和：

```text
interaction effectiveness
```

必须拆开。

分类：

```text
modern_independent_transport_effectiveness_counterexample
```

---

# 5. Cross-source conclusion

三个层级可以稳定区分：

```text
Level 1 · Structural Facts
VISIBLE_MOVING(source)
CONTROLS(source, target)

Level 2 · Domain Interaction Evidence
transport_active_control_interaction

Level 3 · Effectiveness / Pressure Evidence
transport_effective_control_pressure
```

其中本轮只审定 Level 2。

Level 3 尚未完成专项 Rule Review。

因此原先命名：

```text
transport_blocking_interaction
```

过强，应暂缓。

原因是 `blocking` 很容易被下游理解成：

```text
已经产生有效阻断
```

而文献明确存在：

```text
有动、有克、但克害无力
```

的情况。

---

# 6. Admitted Evidence v0.1

允许的输入前置必须同时满足：

```text
readingRef is present
transportBinding.status = resolved
transportBinding.objectClass = transport_operation
transportBinding.position = targetPosition
sourcePosition != targetPosition
Activity Fact.sourceCode = VISIBLE_MOVING
Activity Fact.position = sourcePosition
Relation Fact = source CONTROLS target
Activity Fact.readingRef = Relation Fact.readingRef = transport readingRef
```

允许输出：

```ts
{
  type: 'transport_active_control_interaction',
  dimension: 'transport_control_interaction',
  polarity: 'neutral',
  effectiveness: 'unresolved',
  conclusionShaped: false
}
```

`neutral` 并不是说“克制没有不利方向”，而是表示：

```text
本层只登记有方向的 adverse interaction；
尚未证明该作用在旺衰、动变、救应等条件下有效。
```

如果 Evidence contract 需要额外保留方向，建议用独立字段：

```text
interactionDirection = 'adverse_to_transport'
```

不得把方向性与最终有效 polarity 混成一个字段。

---

# 7. 为什么不能直接 polarity = negative

现有 `RETREAT → transport_delay_or_postponement` Review 可以使用：

```text
polarity = negative
```

因为它已经审的是一个领域级 delay Evidence。

本轮不同：

```text
source controls transport
```

只是“作用方向”成立。

《增删卜易》和“发现号”案例都证明：

```text
作用方向成立
≠
作用有效
```

如果此处直接写：

```text
polarity = negative
```

后续又增加：

```text
source effectiveness = ineffective
```

就会留下一个难以撤销的负 Evidence，迫使 Assessment 层再做反向抵销。

这会把应在 Evidence Resolution 层解决的问题推给评分层，形成错误架构。

所以 v0.1 必须保持：

```text
polarity = neutral
effectiveness = unresolved
```

---

# 8. Source Effectiveness 必须是独立责任

未来需要专项：

```text
Transport Control Effectiveness Resolver / Evidence Review
```

它至少要消费 source line 的已有 Fact，而不是重新计算。

候选输入包括：

```text
source activity
source calendar state
source transform state
source support / restraint relations
```

其中现有 Move Transform Fact Adapter 已能提供：

```text
RETREAT
PROGRESS
RETURN_CONTROL
RETURN_GENERATE
TRANSFORM_VOID
TRANSFORM_MONTH_BREAK
TRANSFORM_TOMB
TRANSFORM_EXTINCTION
...
```

但这些代码在“控制 source 是否有效”场景中的具体 admission 不能从旧 tag.type 直接继承，仍需逐项 Review。

特别禁止：

```text
RETREAT anywhere
→ control ineffective
```

必须要求 RETREAT 的 subject 正是 control source。

---

# 9. Effectiveness Resolver 不得变成通用评分器

本 Review 不建议建立：

```text
sourceStrengthScore = +7 -3 +4 ...
```

理由：

《增删卜易》的“能克 / 不能克”属于有条件的作用有效性判断，不等价于线性累计评分。

更安全的初始 contract 应是：

```text
interaction
+
reviewed effectiveness facts
↓
resolved state
├─ effective
├─ ineffective
├─ mixed
└─ unresolved
```

然后：

```text
effective adverse interaction
→ transport_effective_control_pressure candidate
```

而不是把若干 tag 数量相加后直接生成“延误概率”。

---

# 10. 六亲身份边界

本 Evidence 不要求 source 是：

```text
官鬼
兄弟
妻财
```

因为本通道的责任来自：

```text
source relative action on resolved transport target
```

而不是：

```text
source 六亲 archetype
```

王虎应案例中的 source 可为妻财，传统又有兄弟阻神、官鬼风险等其他渠道。

所以：

```text
sourceRelation
```

可以保留为 contextual metadata，但不得成为本规则 admission 的硬条件。

---

# 11. Fact provenance gate

本 Review 已有：

```text
VISIBLE_MOVING provenance = complete
Line Relation computation provenance = complete
```

但共享 target-agnostic：

```text
Line-Pair Structural Fact Provider
```

仍是：

```text
design_required_not_implemented
```

因此本规则虽然在研究层：

```text
review_complete
```

但代码实现仍必须 blocked：

```text
implementationReadiness
= blocked_by_shared_line_pair_fact_provider
```

不得绕道使用 legacy：

```text
MOVING_LINE_CONTROLS_USE
```

因为该 Fact 的 target 是 legacy 用神，并且已经混入 constraint interpretation。

---

# 12. Explicit Non-Inferences

本 Review 明确禁止：

```text
VISIBLE_MOVING + CONTROLS transport
→ 一定延误
→ 一定取消
→ 一定不能起飞 / 发车
→ 一定发生故障
→ 一定不安全
→ 一定不能按时
→ 一定构成 effective blocking
```

也禁止：

```text
没有 active-control interaction
→ transport 没有阻碍
```

因为 obstruction 仍有其他 channel：

```text
journey-process obstruction
generic obstruction archetype
transport self-state
explicit contextual hazard
calendar / transform constraints
```

---

# 13. 尚未审查的邻接组合

本文件不自动扩展到：

```text
DARK_MOVING + CONTROLS
VISIBLE_MOVING + SIX_CLASH
VISIBLE_MOVING + SIX_HARMONY
VISIBLE_MOVING + GENERATES
static source + CONTROLS
changed-line source + CONTROLS
hidden-line source + CONTROLS
```

它们都需要独立 Review。

尤其：

```text
SIX_CLASH
```

是 trigger / separation / activation 等多义关系，不能因为“冲”字表面不利就机械转成 blocking。

---

# 14. 当前成熟度

```text
transport.activeControlInteraction.VISIBLE_MOVING_CONTROLS
= reviewed_and_admitted_design_only

output type
= transport_active_control_interaction

polarity
= neutral

effectiveness
= unresolved

transport.effectiveControlPressure
= not_ready

transport.operationalViabilityAssessment
= not_ready

transport.scheduleAssessment
= not_ready

implementation
= blocked_by_shared_line_pair_fact_provider
```

---

# 15. 下一步

下一步最合理的专项不是继续增加更多 relation 类型，而是研究：

```text
Control Source Effectiveness
```

首轮优先审：

```text
source RETREAT
source TRANSFORM_MONTH_BREAK
source RETURN_CONTROL
source RETURN_GENERATE
```

目标不是建立完整强弱评分，而是回答：

```text
哪些已审核的 source-state Facts
足以把：
transport_active_control_interaction
↓
判为 ineffective / effective / unresolved？
```

“发现号”案例给出的首个直接候选是：

```text
control source
+
RETREAT
+
TRANSFORM_MONTH_BREAK
→ source adverse effect may become ineffective
```

但是否允许拆成单项规则，必须继续研究，不能从该复合案例反推：

```text
RETREAT alone = ineffective
```

---

# 16. Final decision

```text
resolved transport
+
VISIBLE_MOVING source
+
source CONTROLS transport
↓
transport_active_control_interaction
↓
neutral / effectiveness unresolved
↓
ADMITTED design-only
```

但：

```text
transport_active_control_interaction
≠ transport_blocking_pressure
```

后者必须通过独立 Source Effectiveness Review。

Formal Expansion 未授权；current-22、正式 Rule Registry、Intent、Time Engine、训练数据均不修改。
