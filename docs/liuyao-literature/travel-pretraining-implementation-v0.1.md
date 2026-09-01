# 龟甲 · 六爻出行 Pretraining Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented`

主题：`travel`

依赖：

- `travel-research-v1.0.md`
- `travel-rule-candidates-v0.1.md`
- `travel-rule-review-v0.1.md`
- `travel-intent-schema-design-v0.1.md`

实现：

- `js/liuyao-travel-pretraining-v01.js`
- `tests/liuyao-travel-pretraining-v01-tests.js`

> 本实现不可达，不接入 `liuyao-intent.js`、Rule Registry、Observation Planner、Router、训练 / 校准 / blind 数据。

---

# 1. Gate

继续遵守：

```text
status = design_only
mayEnterV03Training = false
mayBecomeCurrentRoutes = false
```

模块显式：

```text
status = design_only_unreachable
currentRuntimeReachable = false
```

---

# 2. Supported Duties

```text
travel_execution
travel_safety
travel_disruption_journey
travel_disruption_transport
```

Deferred：

```text
travel_return_or_arrival_of_other
generic_travel_state
```

---

# 3. Traveler Resolver

实现：

```text
self            → 世
parent          → 父母
child           → 子孙
wife            → 妻财
husband         → 官鬼
sibling_or_peer → 兄弟
```

其他关系：

```text
unresolved
```

这保证：

```text
代问他人出行
```

不会继续沿用 legacy `travel → 世`。

---

# 4. Draft Observation Plan

## TR-TV-001-A travel_execution

```text
Primary → Traveler
Destination → 应（条件）
Transport → 父母（条件 Domain）
```

## TR-TV-001-B travel_safety

```text
Primary → Traveler
子孙 → safety_ease_support（Domain optional）
官鬼 → hazard_pressure（Domain optional）
Destination → 应（条件）
Transport → 父母（条件）
```

## TR-TV-001-C travel_disruption_journey

```text
Primary → Traveler
Transport → 父母 Domain
Destination → 应（条件）
```

## TR-TV-001-D travel_disruption_transport

```text
Primary → 父母 / transport_operation
Traveler → affected_traveler（若可解析，Role optional）
```

必须满足：

```text
currentTargetAspect = transport_operation
```

所以航班 / 火车词本身不能抢走 Traveler Primary。

---

# 5. Intent Contract Boundaries

已实现阻断：

```text
destination_weather
trip_purpose_outcome
delivery_item
```

对应：

```text
天气本身 → not travel
出差/考试/面试目的结果 → 对应主题
快递 / 包裹 → receive_item
```

但：

```text
weather_causal
```

可以作为 travel disruption 原因背景，不会因为出现天气词就把 travel 打掉。

---

# 6. Evidence Layer

模块只提供设计级 Evidence producer：

```text
traveler_vitality
traveler_void
destination_relation
route_process_obstruction
safety_support
hazard_pressure
transport_disruption
```

全部输出：

```text
finalAssessment = null
```

并明确 `traveler_void` 只消费现有 Time Fact，不在本模块重算旬空 / 出空 / 冲空。

---

# 7. 专项测试

提交前使用本地 Node 环境执行：

```bash
node --check js/liuyao-travel-pretraining-v01.js
node --check tests/liuyao-travel-pretraining-v01-tests.js
node tests/liuyao-travel-pretraining-v01-tests.js
```

同内容本地临时路径执行结果：

```text
Travel pretraining regression: 24 passed, 0 failed
```

覆盖：

1. design-only / unreachable；
2. self → 世；
3. parent → 父母；
4. child → 子孙；
5. unknown represented traveler abstain；
6. execution Traveler Primary；
7. destination 条件应爻；
8. 无目的地不强制应；
9. transport 条件父母 Domain；
10. flight 词不能抢 Primary；
11. safety 仍以 Traveler 为主；
12. journey disruption 仍以 Traveler 为主；
13. transport disruption 父母 Primary；
14. generic transport 不足；
15. target aspect mismatch 阻断；
16. weather target 阻断；
17. trip-purpose target 阻断；
18. delivery target 阻断；
19. 行人归期 deferred；
20. Evidence 不生成 final boolean；
21. 旬空只作 Evidence；
22. weather causal 可保留 travel；
23. spouse 作为 Traveler role；
24. Semantic Intent 无传统 selector 泄漏。

---

# 8. 当前成熟度

```text
literatureResearch              = completed_and_reviewed
ruleCandidateReview             = complete
ruleReview                      = complete
intentSchemaDesign              = ready_v0.1
isolatedContractImplementation  = complete
isolatedRegression              = 24/24_passed

formalIntentImplementation      = blocked
formalRuleRegistryImplementation= blocked
semanticTrainingReady           = false
currentRoute                    = false
```

`travel` 在当前 next-topic gate 允许范围内已经完成训练前隔离实现。
