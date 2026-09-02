# 龟甲 · 六爻 Travel Transport Operation Activity Evidence Review v0.1

日期：2026-09-02

状态：`review_complete_design_only`

主题：`travel.travel_disruption_transport`

上游：

- `travel-transport-operation-vs-schedule-evidence-research-v0.1.md`
- `travel-transport-object-resolver-safe-subset-review-v0.1.md`
- `liuyao-line-status-fact-adapter-pretraining-v02.js`

> 本 Review 只审查“具体 transport object 出现活动性 Fact”能否形成非结论化 Evidence。它不建立起飞成功、发车成功、准点、取消等 Assessment。

---

# 1. Review 问题

研究后，Transport Operation 已拆成：

```text
Operational Viability
Schedule Adherence
Obstruction Resolution
```

本 Review 进一步问：

```text
resolved transport object
+
DARK_MOVING / visible moving
```

是否至少可以表达：

```text
transport_operation_activity
```

而不是：

```text
transport_will_depart
transport_on_schedule
```

---

# 2. 已有 Fact provenance

当前：

```text
liuyao-core.buildLiuYaoLineStatus
```

会产生：

```text
DARK_MOVING
text = 日冲·暗动提示
```

`liuyao-line-status-fact-adapter-pretraining-v02.js` 已把：

```text
DARK_MOVING
→ family = activity_state
```

转换为 reading-scoped atomic Fact。

因此 `DARK_MOVING` 已有可复用的 Fact provenance。

同时注意：

```text
line.moving = true
```

目前主要作为 line snapshot 的结构布尔值存在，并没有与 `DARK_MOVING` 完全对称的 reading-scoped：

```text
VISIBLE_MOVING
```

原子 Fact。

所以本 Review 不允许 Evidence Adapter 直接偷偷读取 `line.moving` 来绕过 Fact 层。

---

# 3. 文献支持

## 3.1 《黄金策·出行》 / 《卜筮全书》同源簇

出行条存在：

```text
静遇日冲，必为他人而去
世应俱动，宜速行
旁爻动，宜缓行
```

其传统解释把：

```text
静爻受日冲
```

与：

```text
被激活 / 因现实因素而产生出行动作
```

联系起来。

它并没有说：

```text
日冲暗动 → 一定成功
```

而是支持“活动 / 起行趋势”的结构含义。

分类：

```text
classical_activity_compatible
```

## 3.2 《火珠林》·占出行

存在：

```text
世应俱动 → 宜速行
旁爻动 → 利行迟
```

说明“动”在出行语境中确实可承载：

```text
movement / travel-process activation
```

但它仍不等同现代运输班次运行成功。

分类：

```text
classical_journey_activity_support
```

## 3.3 朱辰彬《古筮真诠·进阶篇》

在现状信息分析中，作者明确把暗动解释为：

```text
对象目前正在动作 / 正在进行相关举措
```

并指出暗动可承担现状层的 activity information。

这一来源对本 Review 很重要，因为它支持的不是某个特定主题的成败，而是：

```text
DARK_MOVING
→ current activity information
```

分类：

```text
modern_independent_activity_semantics
```

## 3.4 王虎应网络出行案例

具体飞机案例中：

```text
父母丑土暗动
→ 作者判断当天飞机可以起飞
```

同时另一阻碍爻又使飞机：

```text
不能按时起飞
```

因此本 Review 只吸收该案例中更低层的部分：

```text
resolved transport
+
DARK_MOVING
→ transport object has operation activity signal
```

而不吸收更强的：

```text
DARK_MOVING
→ guaranteed departure
```

分类：

```text
modern_transport_direct_case_support
```

王虎应网络案例与其著作属于同一作者体系，source diversity 不重复计权。

---

# 4. Cross-source conclusion

来源组合支持：

```text
日冲激活 / 暗动
→ activity / action / movement information
```

其中：

```text
《黄金策》/《卜筮全书》
《火珠林》
```

提供传统出行 activity 兼容证据；

```text
朱辰彬
```

提供独立现代 general activity semantics；

```text
王虎应
```

提供具体 transport case。

因此可以把下面的 Evidence 限定为：

```text
cross_source_compatible_nonconclusive
```

而不是：

```text
stable_consensus_transport_success_rule
```

---

# 5. Admitted Evidence · DARK_MOVING

前置：

```text
transportBinding.status = resolved
transportBinding.objectClass = transport_operation
transportBinding.position = Fact.subjectRef.position
transport binding belongs to same readingRef
```

Fact：

```text
sourceCode = DARK_MOVING
family = activity_state
```

允许映射：

```text
DARK_MOVING
↓
transport_operation_activity
```

建议 Evidence：

```ts
{
  kind: 'transport_operation_activity',
  dimension: 'operational_activity',
  polarity: 'neutral',
  strength: 'observed_activity_signal',
  conclusionShaped: false
}
```

`neutral` 是关键。

它不应该进入：

```text
positiveCount
negativeCount
```

更不能单独形成：

```text
can_depart = true
on_schedule = true
```

---

# 6. Explicit Non-Inferences

`DARK_MOVING` 不得直接推出：

```text
一定起飞
一定发车
一定运行成功
一定当天走
一定准点
一定不取消
一定安全
```

它也不得覆盖同一对象的：

```text
RETREAT delay Evidence
VOID / BREAK
RETURN_CONTROL
其他 blocking Evidence
```

因此完全允许：

```text
transport_operation_activity = present
transport_delay_or_postponement = present
```

同时成立。

这正是现代案例中：

```text
最终有运行活动
但没有按时运行
```

的表达方式。

---

# 7. Visible Moving 的 Review 状态

语义上：

```text
visible moving line
```

当然也是 activity information 的强候选。

但工程 provenance 当前不对称：

```text
DARK_MOVING
→ 已有 atomic Line Status Fact

line.moving = true
→ 仍主要是 line snapshot boolean
```

虽然 `buildMoveAnalysis()` 会为明动产生各种 transform Fact，但：

```text
存在 transform Fact
```

和：

```text
VISIBLE_MOVING atomic Fact
```

并不是完全同一个 contract。

所以本 Review 暂不允许 Evidence Adapter 直接读：

```text
line.moving
```

下一步若要统一 activity Evidence，应先建立：

```text
Line Activity Fact Adapter
├─ VISIBLE_MOVING
└─ DARK_MOVING (reuse / normalize existing fact)
```

或为现有 Fact 层增加一个不重复计算的 normalization contract。

状态：

```text
visibleMovingActivitySemantics = supported
visibleMovingFactProvenance = incomplete
implementation = blocked_by_fact_contract
```

---

# 8. 与 Operational Viability 的边界

本 Review 只使：

```text
activity evidence
```

成立。

不使：

```text
operational viability assessment
```

成立。

未来若要回答：

```text
今天最终能不能起飞？
```

至少还需组合：

```text
transport activity
+
transport blocking / support
+
transport transform state
+
possibly time-bounded evidence
```

且仍不得重算 Time Engine。

因此：

```text
transportOperationalAssessmentReady = false
```

---

# 9. 与 Schedule Adherence 的边界

本 Review 不改变上一轮结论：

```text
RETREAT on transport
→ admitted delay/postponement Evidence
```

但：

```text
DARK_MOVING on transport
```

不能抵销：

```text
RETREAT
```

因为二者回答不同问题：

```text
DARK_MOVING → is there operation activity?
RETREAT     → is the operation pushed back / delayed?
```

所以可能出现：

```text
activity = yes
delay = yes
```

这是合法状态，不是冲突。

---

# 10. Assessment readiness

当前成熟度更新为：

```text
transportOperationActivityEvidence.DARK_MOVING
= reviewed_and_admitted_design_only

transportOperationActivityEvidence.VISIBLE_MOVING
= semantics_supported_fact_provenance_pending

transportOperationalViabilityAssessment
= not_ready

transportScheduleAssessment
= not_ready
```

---

# 11. 下一步

最合理的下一步不是写 Transport Assessment，而是先解决：

```text
VISIBLE_MOVING atomic Fact provenance
```

建议研究 / 设计：

```text
liuyao-line-activity-fact-provenance-review-v0.1
```

目标：

1. 明动不得从 Evidence Adapter 直接读裸布尔值；
2. 不重复计算现有 `moving`；
3. reading-scoped；
4. 明动与暗动可以规范化到同一 activity family；
5. 保留二者 sourceCode 差异；
6. 不把 activity 自身赋予 favorable / unfavorable polarity。

完成后才考虑实现统一：

```text
Line Activity Fact
→ Transport Operation Activity Evidence
```

---

# 12. 最终结论

```text
resolved transport + DARK_MOVING
→ transport_operation_activity
→ neutral Evidence
→ admitted design-only

resolved transport + visible moving
→ semantic candidate supported
→ atomic Fact provenance pending

activity
≠ successful operation
≠ same-day departure
≠ on schedule
≠ safety
```

Formal Expansion 仍未授权，当前 22-route / Rule Registry / Time Engine 均不得修改。
