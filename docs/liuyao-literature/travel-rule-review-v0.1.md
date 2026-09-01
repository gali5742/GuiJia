# 龟甲 · 六爻出行 Rule Review v0.1

日期：2026-09-01

状态：`rule_review_complete`

输入：

- `docs/liuyao-literature/travel-research-v1.0.md`
- `docs/liuyao-literature/travel-rule-candidates-v0.1.md`
- `js/liuyao-rule-registry.js`
- `js/liuyao-observation-plan.js`
- 《龟甲 · 六爻复合观察与取用规则规范 v0.2（草案）》

> 本文件完成 Candidate 的职责审计与 Observation Rule 设计，不修改正式 Rule Registry，不晋升 Semantic Route。

---

# 1. Review 总结

16 条 Candidate 不能变成 16 条 Observation Rule。

最终结构：

```text
4 个首轮 Base Observation Rules
+
1 个 Traveler Subject Resolver
+
条件 Destination / Transport Observations
+
独立 Travel Assessment Evidence 层
```

四个 Base Rule：

```text
TR-TV-001-A  travel_execution
TR-TV-001-B  travel_safety
TR-TV-001-C  travel_disruption_journey
TR-TV-001-D  travel_disruption_transport
```

前 3 个共享 Traveler Primary，但 semantic duty 不同；第 4 个将 transport operation 升为 Primary。

---

# 2. Candidate 最终去向

| Candidate | Review 去向 |
|---|---|
| RC-TV-001 self traveler | Traveler Resolver data |
| RC-TV-002 represented traveler | `PRR-TRAVELER-SUBJECT` |
| RC-TV-003 destination | conditional contextual observation |
| RC-TV-004 transport | Domain / transport-primary selection |
| RC-TV-005 funds | auxiliary evidence，不进首轮 Base |
| RC-TV-006 route/companions | journey-process evidence |
| RC-TV-007 safety support | safety Domain/Evidence |
| RC-TV-008 hazard/obstruction | safety/disruption Evidence |
| RC-TV-009 execution | Base Rule A |
| RC-TV-010 safety | Base Rule B |
| RC-TV-011 journey-focused disruption | Base Rule C |
| RC-TV-012 transport-focused disruption | Base Rule D |
| RC-TV-013 weather boundary | Intent contract |
| RC-TV-014 purpose boundary | Intent contract |
| RC-TV-015 delivery boundary | Intent contract |
| RC-TV-016 line-state separation | Assessment architecture |

---

# 3. PRR-TRAVELER-SUBJECT

Traveler 是本主题的核心现实角色，但不能永远等于世。

设计接口：

```ts
interface TravelerSubjectResolution {
  status: 'resolved' | 'unresolved'
  relationToQuerent?:
    | 'self'
    | 'parent'
    | 'child'
    | 'wife'
    | 'husband'
    | 'sibling_or_peer'
  selector?:
    | { type:'shi' }
    | { type:'six_relative', value:'父母' | '子孙' | '妻财' | '官鬼' | '兄弟' }
  evidenceRefs: string[]
  issues: string[]
}
```

首轮映射：

```text
self            → 世
parent          → 父母
child           → 子孙
wife            → 妻财
husband         → 官鬼
sibling_or_peer → 兄弟
```

关系无法明确时：

```text
unresolved
```

不得 fallback 为世。

---

# 4. Base Rule A · Travel Execution

```text
TR-TV-001-A
appliesTo:
  event = travel
  travelDuty = travel_execution
```

Observation：

```text
Primary
→ PRR-TRAVELER-SUBJECT
→ traveler

Context（条件）
→ 应
→ destination

Domain（条件）
→ 父母
→ transport_vehicle_or_carrier
```

`destination` 只有 Intent 明确存在具体 / bounded 目的地职责时加入。

`transport` 只有具体交通工具 / 运输载体对当前行程有现实作用时加入。

---

# 5. Base Rule B · Travel Safety

```text
TR-TV-001-B
appliesTo:
  event = travel
  travelDuty = travel_safety
```

Observation：

```text
Primary
→ PRR-TRAVELER-SUBJECT
→ traveler_safety_subject

Context（条件）
→ 应 / destination

Domain（可选）
→ 子孙 / safety_ease_support
→ 官鬼 / hazard_pressure
```

注意：

```text
子孙 / 官鬼
```

在这里仍不是第二 Primary，而是安全 Assessment 的观察维度。

兄弟、间爻、六神等更细信息留给 Evidence 层，不要求 Registry 常驻观察。

---

# 6. Base Rule C · Journey-focused Disruption

```text
TR-TV-001-C
appliesTo:
  event = travel
  travelDuty = travel_disruption_journey
  currentTargetAspect = traveler_journey
```

典型：

```text
我的航班会不会耽误我这趟行程？
我明天能不能按计划出发？
```

Observation：

```text
Primary
→ Traveler

Domain
→ 父母 / transport

Context（条件）
→ 应 / destination
```

重点是“我的旅程能否按计划完成”，不是飞机自身状态。

---

# 7. Base Rule D · Transport-focused Disruption

```text
TR-TV-001-D
appliesTo:
  event = travel
  travelDuty = travel_disruption_transport
  currentTargetAspect = transport_operation
```

典型：

```text
这趟航班会不会延误？
这班火车会不会取消？
飞机今天能不能按时起飞？
```

Observation：

```text
Primary
→ 父母
→ transport_operation

Role（若有明确实际旅行者）
→ PRR-TRAVELER-SUBJECT
→ affected_traveler
```

该规则的 evidence tier 应低于自占世爻主轴：

```text
modern_supported + classical_transport_analogy
```

因此正式 Registry 初次登记时建议：

```text
automationStatus = provisional
```

直到独立现代案例 / regression 足够。

---

# 8. Destination Observation 的职责

`应` 不应作为所有 travel 的 required role。

只有：

```text
destinationContext.specificity = specific | context_bounded
```

且 destination 确实参与 current target 时追加。

例如：

```text
去大阪这一路顺不顺？
```

可以追加应。

但：

```text
明天出门办点事安全不安全？
```

没有必要为了凑结构强制解释应为目的地。

---

# 9. Transport Domain 的职责

父母作为 transport Domain 只在：

```text
transportContext.relevance = explicit | context_supported
```

时出现。

禁止：

```text
travel 一律加入父母
```

因为徒歩、步行等问题不一定需要交通工具职责；父母也可能在同卦承担其他现实象义。

---

# 10. Travel Assessment Evidence 层

以下不得写入 Observation Registry 成败逻辑：

```text
世旺 / 世衰
世空 / 世破
世应生克合冲
世动 / 应动
间爻动静
父母旺衰 / 空破 / 动变
子孙旺衰 / 动变
官鬼、兄弟发动
六冲 / 六合 / 游魂 / 归魂
进退神
```

它们应进入：

```text
TravelExecutionEvidence
TravelSafetyEvidence
TravelDisruptionEvidence
```

并读取现有 Fact / Time Fact；不得重算 Time Engine。

---

# 11. 为什么 execution / safety 不合并成一个 Rule

虽然二者通常都以 Traveler 为 Primary，但 semantic duty 不同：

```text
travel_execution
→ 成行、出发、到达、行程完成

travel_safety
→ 途中风险、伤害、阻碍、平安
```

如果只登记：

```text
TR-TRAVEL → Traveler
```

下游无法知道同一个 Traveler 应进入哪套 Assessment。

因此保留同 family 的多个 Base Rule，比“一条万能 travel rule”更符合现有 Observation Plan 架构。

---

# 12. Weather / Purpose / Delivery Hard Boundaries

正式 Intent 必须在 Rule Selection 前处理：

```text
weather itself target
→ not travel

career / exam / commercial outcome at destination
→ corresponding domain route

package / courier delivery
→ receive_item
```

只有“天气导致我的行程是否被打断”时，weather 才是 travel causal context。

---

# 13. Source Registry 前置

正式登记 `EV-TV-*` 前需要补充 provenance：

```text
《火珠林》
《增删卜易》出行章
《黄金策·出行》/《卜筮全书》同源簇
《易隐》行人占（仅 represented traveler 边界）
王虎应《六爻预测自修宝典》预测出行
朱辰彬《古筮真诠》
```

不得只复用当前 Registry 中已有书名而省略本轮实际证据来源。

---

# 14. Review 结论

```text
ruleReview = complete
formalRuleRegistryReady = blocked_by_semantic_gate
intentSchemaDesign = next
semanticTrainingReady = false
```

首轮正式设计允许：

```text
travel_execution
travel_safety
travel_disruption_journey
travel_disruption_transport
PRR-TRAVELER-SUBJECT
```

但第 4 条必须保持 provisional evidence tier。
