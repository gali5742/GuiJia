# 龟甲 · 六爻 Travel Transport Active Control Interaction Evidence Review v0.1

日期：2026-09-02

状态：`review_complete_design_only`

主题：`travel.travel_disruption_transport`

上游：

- `travel-transport-blocking-evidence-resolution-research-v0.1.md`
- `travel-transport-operation-activity-evidence-review-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `liuyao-line-relation-fact-provenance-review-v0.1.md`
- `shared-line-pair-fact-provider-research-v0.1.md`

> 本 Review 只审查一个窄命题：**已解析 transport target 之外的明动爻，对该 transport target 形成明确五行克制时，能够登记到哪一层 Evidence。** 本轮不建立 transport blocked / delayed / cancelled / failed Assessment，不修改 current-22、正式 Rule Registry 或 Time Engine。

---

# 1. Review 问题

候选链原本可以写成：

```text
resolved transport target
+
VISIBLE_MOVING source line
+
source CONTROLS transport
→ transport_blocking_interaction
```

但这一命名仍然过强，因为它容易把：

```text
存在一个正在活动的克制关系
```

偷换成：

```text
该克制已经有效地产生阻断压力
```

本轮需要决定：

1. activity + control relation 是否足以形成领域 Evidence；
2. 若可以，Evidence 应表达“交互存在”还是“阻断有效”；
3. source 自身的退、破、空、受制等 effectiveness 条件由哪一层处理。

本轮结论：

```text
VISIBLE_MOVING + CONTROLS resolved transport
→ 可登记 transport_active_control_interaction

但：

transport_active_control_interaction
≠ transport_blocking_pressure
≠ transport_blocked
```

---

# 2. Fact provenance 前提

## 2.1 Activity Fact

`liuyao-line-activity-fact-provenance-review-v0.1.md` 已确认：

```text
raw 6 / 9
→ visible moving structural fact
```

并允许建立 reading-scoped：

```text
sourceCode = VISIBLE_MOVING
family = activity_state
```

的中性 atomic Fact。

因此本 Review 不允许 Evidence Adapter 直接读取裸：

```text
line.moving === true
```

而应消费已规范化的 Activity Fact。

## 2.2 Relation Fact

`liuyao-line-relation-fact-provenance-review-v0.1.md` 已确认：

```text
A controls B
```

的五行关系底层 provenance 可审计，并可建立 target-agnostic、reading-scoped 的中性 Line Relation Fact。

本 Review 只接受方向明确的：

```text
source line CONTROLS transport target line
```

不接受模糊：

```text
A / B 有 control relation
```

也不接受反向：

```text
transport controls source
```

---

# 3. Transport binding 前提

必须已有：

```text
transportBinding.status = resolved
transportBinding.objectClass = transport_operation
transportBinding.relation = 父母
transportBinding.position = target relation Fact position
transportBinding.readingRef = activity / relation Fact readingRef
```

Evidence Adapter 不得：

```text
first-match 父母
猜测哪一爻是飞机 / 火车
把所有父母爻都当同一班次
```

因此本 Review 不解决：

```text
PRR-TRAVEL-TRANSPORT-OBJECT
```

本身，只消费其已解析结果。

---

# 4. 文献与案例支持

## 4.1 王虎应 · 太原机场飞机案例

现有 `travel-transport-blocking-evidence-resolution-research-v0.1.md` 已整理该案例：

```text
父母 = 飞机 / transport target
妻财卯木发动
卯木克父母
→ 作者据此判断飞机受到阻碍、不能按时起飞
```

该案例直接支持：

```text
active source
+
source controls resolved transport
```

具有 transport adverse-interaction 信息。

但它只能证明这种组合可以成为 Evidence responsibility，不能单独证明所有类似 control 都必然兑现为有效阻断。

分类：

```text
modern_direct_transport_case_support
```

## 4.2 朱辰彬 · “发现号”航天飞机案例

同一研究已整理：

```text
父母子水 = 航天飞机 / transport target
辰土发动克父母子水
```

表面结构同样满足：

```text
active source + controls transport
```

但辰土随后：

```text
化退 + 化破
```

作者据此认为其外部不利作用趋于失效，最终航天飞机安全返回。

这个案例对本 Review 的价值不是否定 control，而是证明必须分层：

```text
interaction exists
↓
source effectiveness adjudication
↓
effective / weakened / ineffective pressure
```

不能把第一层直接写成第三层。

分类：

```text
modern_independent_effectiveness_counterexample
```

## 4.3 《增删卜易》的有力 / 无力区分

既有传统研究链已经保留一个重要原则：

```text
忌神 / 不利作用即使发动
也仍要区分是否有力、是否真正能够作用于用神
```

退、破、受制等条件可能改变实际作用能力。

因此传统层也不支持：

```text
发动 + 克
→ 无条件有效克害
```

本 Review 只吸收这个结构原则，不在此重新实现旺衰、月日、空破、进退等 effectiveness 算法。

分类：

```text
classical_effectiveness_separation_support
```

---

# 5. Cross-source conclusion

王虎应案例支持：

```text
active control against transport
→ 可以成为 transport adverse interaction Evidence
```

朱辰彬案例与传统有力 / 无力区分共同限制：

```text
active control
≠ effective blocking
```

因此本轮最稳妥的分类是：

```text
cross_source_compatible_nonconclusive
```

而不是：

```text
stable_consensus_transport_blocking_rule
```

---

# 6. Admitted Evidence v0.1

前置：

```text
transport target resolved
source activity Fact = VISIBLE_MOVING
relation Fact = source CONTROLS transport
same readingRef
source line != transport target line
```

允许生成：

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

这里 `neutral` 的含义不是“克没有不利方向”，而是：

```text
当前 Evidence 只确认了不利方向的 interaction topology；
尚未完成 source effectiveness adjudication，
因此不能进入 final positive / negative counting。
```

如果未来需要保留语义方向，可显式记录：

```text
interactionDirection = adverse_to_transport
```

但仍保持：

```text
polarity = neutral
```

直到 effectiveness 层审核完成。

---

# 7. 为什么不命名 `transport_blocking_interaction`

`blocking` 一词容易在下游被误解为：

```text
已经形成有效阻断
```

而当前事实只保证：

```text
source 正在活动
source 在五行关系上克 transport
```

因此 v0.1 明确采用：

```text
transport_active_control_interaction
```

而保留：

```text
transport_blocking_pressure
```

给未来通过 effectiveness gate 的派生 Evidence。

建议未来链：

```text
Activity Fact
+
Control Relation Fact
↓
transport_active_control_interaction
+
Source Effectiveness Evidence
↓
transport_blocking_pressure candidate
↓
Assessment aggregation
```

---

# 8. Source Effectiveness 必须独立

未来不得在本 Adapter 内偷偷判断：

```text
旺 / 衰
空 / 实
月破
日破
墓 / 绝
进 / 退
变爻回头作用
月日生克
其他动爻制化
```

原因：

1. 这些不是“关系是否存在”的问题；
2. 其中部分已有独立 Fact provenance；
3. 若在 Travel Adapter 内重新计算，会复制 Core / Time Engine 逻辑；
4. 不同主题都会需要同样的 source-effectiveness 判断。

因此下一层应是共享、主题无关的：

```text
Line Effectiveness Evidence / Resolver
```

或等价 contract。

它只回答：

```text
该活动 source 的作用能力当前处于什么状态？
```

而不是直接回答：

```text
飞机是否取消？
```

---

# 9. Explicit Non-Inferences

本 Evidence 不得直接推出：

```text
transport_blocked = true
transport_delayed = true
transport_cancelled = true
transport_will_not_depart = true
journey_failed = true
unsafe = true
```

不得推出确定时间：

```text
晚几个小时
改到明天
某日恢复
```

也不得把现实原因猜成：

```text
天气
积雪
故障
机场管制
工作人员
```

因为 Line Relation Fact 只说明：

```text
某活动爻克 transport
```

不说明现实 causal object identity。

---

# 10. 与 RETREAT Delay Evidence 的关系

现有 Review 已允许：

```text
RETREAT on resolved transport line
→ transport_delay_or_postponement
```

它和本 Evidence 不在同一责任层：

```text
transport_active_control_interaction
→ 外部 source 对 transport 的作用关系

RETREAT on transport
→ transport target 自身的 transform / schedule-direction Evidence
```

二者可以同时存在，不得互相覆盖。

同样：

```text
source line 自身 RETREAT
```

也不能由本 Review 自动解释为：

```text
blocking pressure recedes
```

虽然现代案例对此有支持，但那属于下一轮：

```text
source effectiveness / blocking-pressure review
```

---

# 11. DARK_MOVING 状态

本轮题目严格限定：

```text
VISIBLE_MOVING + CONTROLS transport
```

已有 activity 研究已经允许：

```text
DARK_MOVING
→ neutral activity signal
```

但是否可以把：

```text
DARK_MOVING source
+
CONTROLS transport
```

完全等价接入本 Evidence，仍建议单独做一轮简短 Review。

原因是：

```text
明动
```

与：

```text
暗动
```

虽然都可归入 activity family，但传统有效性与时效语义并不必然完全对称。

因此 v0.1：

```text
admittedActivitySourceCodes = ['VISIBLE_MOVING']
DARK_MOVING = pending_explicit_review
```

---

# 12. Assessment readiness

本 Review 完成后：

```text
transportActiveControlInteraction.VISIBLE_MOVING
= reviewed_and_admitted_design_only

transportBlockingPressure
= not_ready

transportOperationalViabilityAssessment
= not_ready

transportScheduleAssessment
= not_ready
```

主要缺口从“有没有关系 Fact”进一步收敛为：

```text
source effectiveness contract
```

---

# 13. 下一步

最合理的下一步不是直接写 Transport Assessment，而是审：

```text
Active Control Source Effectiveness
```

优先问题：

1. `VISIBLE_MOVING + CONTROLS transport` 的 source 若 `RETREAT`，能否登记为 weakening Evidence；
2. source 若 `TRANSFORM_MONTH_BREAK` / 其他已存在 move-state Fact，哪些只能描述状态，哪些足以影响 effectiveness；
3. calendar VOID / BREAK 等 Fact 如何进入作用能力层而不重算 Time Engine；
4. 多个 source 同时作用时，先保持多条 Evidence，禁止简单计数；
5. effectiveness 只决定 interaction 是否有力，不直接决定 transport outcome。

建议文件：

```text
travel-transport-active-control-source-effectiveness-review-v0.1.md
```

---

# 14. Final decision

```text
resolved transport
+
VISIBLE_MOVING source
+
source CONTROLS transport
→ transport_active_control_interaction
→ neutral / nonconclusive Evidence
→ admitted design-only

active control interaction
≠ effective blocking pressure

blocking pressure
requires separate source-effectiveness adjudication

transport blocked / delayed / cancelled
remain Assessment-level questions
```

Formal Expansion 仍未授权；current-22、正式 Rule Registry、Time Engine 均不修改。
