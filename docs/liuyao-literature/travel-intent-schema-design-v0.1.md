# 龟甲 · 六爻 Travel Intent / Event Schema Design v0.1

日期：2026-09-01

状态：`design_only_ready`

主题：`travel`

上游：

- `travel-research-v1.0.md` — `completed_and_reviewed`
- `travel-rule-candidates-v0.1.md` — `ready_for_rule_review`
- `travel-rule-review-v0.1.md` — `rule_review_complete`

> 本文件只定义未来 Schema Contract。当前不得修改 `js/liuyao-intent.js`、当前 22-route inventory、Semantic Candidate、训练 / 校准 / blind 数据。

---

# 1. Event

未来统一：

```ts
event: { type:'travel' }
```

具体职责放入：

```ts
semantics.travelDuty
```

---

# 2. Travel Duty

```ts
semantics.travelDuty:
  | 'travel_execution'
  | 'travel_safety'
  | 'travel_disruption_journey'
  | 'travel_disruption_transport'
  | 'travel_return_or_arrival_of_other'
  | 'generic_travel_state'
  | 'unknown'
```

首轮 supported：

```text
travel_execution
travel_safety
travel_disruption_journey
travel_disruption_transport
```

Deferred / unsupported：

```text
travel_return_or_arrival_of_other
→ 行人 / 归期专项，当前不并入

generic_travel_state
→ 信息不足
```

---

# 3. Current Target Aspect

```ts
semantics.currentTargetAspect:
  | 'traveler_journey'
  | 'traveler_safety'
  | 'transport_operation'
  | 'destination_weather'
  | 'trip_purpose_outcome'
  | 'delivery_item'
  | 'unknown'
```

这是最重要的 route boundary 字段。

### traveler_journey

```text
我明天能不能顺利出发？
这趟旅行能不能按计划到达？
```

### traveler_safety

```text
这趟路上安不安全？
```

### transport_operation

```text
这趟航班会不会延误？
这班火车会不会取消？
```

### destination_weather

```text
大阪明天会不会下雨？
旅游目的地天气怎么样？
```

不属于 travel。

### trip_purpose_outcome

```text
这次去客户那里能不能谈成合同？
去面试能不能被录用？
```

应交给对应业务 / career route。

### delivery_item

```text
包裹什么时候送到？
```

继续 `receive_item`。

---

# 4. Traveler Subject

建议：

```ts
travelerSubject: {
  text?: string
  relationToQuerent:
    | 'self'
    | 'parent'
    | 'child'
    | 'wife'
    | 'husband'
    | 'sibling_or_peer'
    | 'other'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

Semantic 层只表达关系，不输出六亲。

后续 `PRR-TRAVELER-SUBJECT` 才决定传统 selector。

---

# 5. Journey Target

```ts
journeyTarget: {
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
  temporalScope?:
    | 'specific_trip'
    | 'specific_day'
    | 'bounded_period'
    | 'generic'
  tripType?:
    | 'travel'
    | 'business_trip'
    | 'visit'
    | 'commute'
    | 'errand'
    | 'other'
    | 'unknown'
}
```

首轮至少需要：

```text
specific | context_bounded
```

不能用：

```text
我以后出门运气怎么样
```

直接进入正式 Rule Selection。

---

# 6. Destination Context

```ts
destinationContext: {
  text?: string
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'none'
  relevance:
    | 'explicit'
    | 'context_supported'
    | 'not_indicated'
    | 'unknown'
}
```

只有 destination 对 current travel target 有现实职责时，后续才允许追加应爻 Context Observation。

---

# 7. Transport Context

```ts
transportContext: {
  mode:
    | 'flight'
    | 'train'
    | 'bus'
    | 'car'
    | 'ship'
    | 'walking'
    | 'mixed'
    | 'other'
    | 'unknown'
  serviceText?: string
  specificity:
    | 'specific_service'
    | 'specific_vehicle'
    | 'context_bounded'
    | 'generic'
    | 'none'
  relevance:
    | 'explicit'
    | 'context_supported'
    | 'not_indicated'
    | 'unknown'
}
```

关键：

```text
mode = flight
```

不自动推出：

```text
父母 Primary
```

只有：

```text
currentTargetAspect = transport_operation
```

时，传统层才可以选择 transport Primary candidate。

---

# 8. Disruption Context

```ts
semantics.disruptionContext: {
  type:
    | 'delay'
    | 'cancellation'
    | 'missed_connection'
    | 'traffic'
    | 'weather_causal'
    | 'unspecified'
    | 'none'
    | 'unknown'
  causeText?: string
}
```

例如：

```text
会不会因为台风导致我的航班取消？
```

可输出：

```text
travelDuty = travel_disruption_transport
currentTargetAspect = transport_operation
disruptionContext.type = weather_causal
```

天气是 cause，不是 target。

---

# 9. Trip Purpose Context

```ts
semantics.tripPurposeContext:
  | 'travel_itself'
  | 'career'
  | 'commercial'
  | 'study_exam'
  | 'visit_person'
  | 'other'
  | 'unknown'
```

该字段只用于 collision review。

例如：

```text
我坐飞机去参加考试，路上会不会耽误？
→ travel_itself / travel

我坐飞机去参加的考试能不能通过？
→ study_exam current target
```

---

# 10. Goal / Expected State

继续沿用通用：

```text
goals: [{ type:'outcome' }]
```

建议：

```ts
expectedState:
  | 'journey_completed'
  | 'journey_safe'
  | 'journey_on_schedule'
  | 'transport_operating_as_scheduled'
  | 'unknown'
```

映射：

```text
travel_execution
→ journey_completed

travel_safety
→ journey_safe

travel_disruption_journey
→ journey_on_schedule

travel_disruption_transport
→ transport_operating_as_scheduled
```

---

# 11. Minimal Sufficiency

Global：

```ts
{
  eventType:'travel',
  travelDuty: supported duty,
  goal:'outcome',
  currentTargetAspect: supported target aspect,
  journeyTarget.specificity: 'specific' | 'context_bounded'
}
```

## traveler-focused duties

额外要求：

```text
travelerSubject.relationToQuerent != unknown
```

## transport-focused disruption

额外要求：

```text
currentTargetAspect = transport_operation
transportContext.specificity = specific_service | specific_vehicle | context_bounded
transportContext.relevance = explicit | context_supported
```

纯：

```text
飞机会不会晚点？
```

如果无法确定具体班次 / bounded context，则只识别主题候选，不进入正式传统 Rule Selection。

---

# 12. Route-sufficient but Rule-insufficient

必须允许：

```text
Semantic event = travel
but Traveler Resolver = unresolved
```

例如：

```text
一个朋友明天去外地，安全吗？
```

如果关系只抽成 generic `other` 而未能支持兄弟类映射，则传统层可 abstain。

同理：

```text
transport operation 已解析
但 transport context 不够具体
```

也可 `rule insufficient`，不能强行父母 Primary。

---

# 13. Hard Boundaries

```text
weather target
→ not travel

trip purpose outcome target
→ corresponding route

package / courier target
→ receive_item

travel ticket purchase/value
→ item_purchase when purchase itself is target

other person's return timing
→ deferred 行人/归期
```

---

# 14. Semantic Leakage Ban

Intent 中不得出现：

```text
世
应
父母
妻财
子孙
官鬼
兄弟
用神
sixRelative
useGod
```

只能出现现代现实字段：

```text
travelerSubject
journeyTarget
destinationContext
transportContext
disruptionContext
tripPurposeContext
```

---

# 15. 当前状态

```text
literatureResearch = completed_and_reviewed
ruleReview = complete
intentSchemaDesign = design_only_ready
formalIntentImplementation = blocked_by_current_semantic_gate
semanticTrainingReady = false
currentRoute = false
```
