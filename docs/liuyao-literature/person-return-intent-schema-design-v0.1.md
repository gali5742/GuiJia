# 龟甲 · 六爻 Person Return Intent / Event Schema Design v0.1

日期：2026-09-01

状态：`design_only_ready`

主题候选：`person_return`

上游：

- `person-return-research-v0.1.md`
- `person-return-rule-review-v0.1.md`

> 本文件只定义未来 Schema Contract，不修改正式 Intent、Router、Rule Registry、current-22 或训练数据。

---

# 1. Event

```ts
event: { type:'person_return' }
```

---

# 2. Duty

```ts
semantics.personReturnDuty:
  | 'person_return_outcome'
  | 'person_return_progress'
  | 'person_return_timing'
  | 'person_news_contact'
  | 'generic_person_return_state'
  | 'unknown'
```

首轮 supported：

```text
person_return_outcome
person_return_progress
person_return_timing
```

Deferred：

```text
person_news_contact
generic_person_return_state
```

---

# 3. Current Target Aspect

```ts
semantics.currentTargetAspect:
  | 'return_outcome'
  | 'return_progress'
  | 'return_timing'
  | 'traveler_safety'
  | 'transport_operation'
  | 'communication_or_news'
  | 'missing_person'
  | 'unknown'
```

映射：

```text
person_return_outcome  → return_outcome
person_return_progress → return_progress
person_return_timing   → return_timing
```

---

# 4. Person Subject

```ts
personSubject: {
  text?: string
  relationToQuerent:
    | 'parent'
    | 'child'
    | 'wife'
    | 'husband'
    | 'sibling_or_peer'
    | 'friend'
    | 'other_non_kin'
    | 'self'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

Semantic 层只保存真实关系，不输出六亲。

`self`：

```text
→ cross-route travel
```

`unknown`：

```text
→ traditional resolver unresolved
```

---

# 5. Away Context

必须显式保存：

```ts
semantics.knownAwayContext: boolean
semantics.missingOrDisappearance: boolean
```

首轮要求：

```text
knownAwayContext = true
missingOrDisappearance = false
```

因此：

```text
正常在外出差 / 探亲 / 旅行，预计返程
→ person_return candidate

失踪 / 失联 / 下落不明
→ blocked
```

---

# 6. Health / Safety and News Boundary

```ts
semantics.healthOrSafetyTarget: boolean
semantics.communicationTarget: boolean
```

若 current target 是：

```text
旅途安危
→ travel

发不发消息 / 有没有音信
→ person_news_contact deferred
```

`person_return` 不借古典行人章处理疾病、生死或失踪安危。

---

# 7. Goals

建议：

```text
person_return_outcome
→ goals:[{type:'outcome'}]

person_return_progress
→ goals:[{type:'state'}]

person_return_timing
→ goals:[{type:'timing'}]
```

v0.1 强制单一主要职责：

```text
outcome duty 不得隐式带 timing
timing duty 不得隐式带 outcome
```

未来 compatible multi-duty 另开版本。

---

# 8. Expected State

```ts
expectedState:
  | 'person_returns'
  | 'return_in_progress'
  | 'return_time_resolved'
  | 'unknown'
```

---

# 9. Minimal Sufficiency

Global：

```text
event = person_return
personReturnDuty = supported duty
personSubject.specificity = specific | context_bounded
personSubject.relationToQuerent resolves
knownAwayContext = true
missingOrDisappearance = false
currentTargetAspect matches duty
required goal matches duty
```

Timing 额外要求：

```text
goal = timing
```

并且不能自动附带 outcome。

---

# 10. Route-sufficient but Rule-insufficient

允许：

```text
Semantic event = person_return
Person relation = unknown
Traditional Person Resolver = unresolved
```

不得：

```text
unknown → 应
```

自动 fallback。

---

# 11. Time Contract

`person_return_timing` 只允许输出：

```text
Time Trigger Evidence
```

不允许输出：

```text
exactDate
calendarCalculation
voidCalculation
clashDateCalculation
harmonyDateCalculation
```

所有具体时间事实由既有 Time / Fact 层提供。

---

# 12. Semantic Leakage Ban

Intent 中禁止：

```text
父母
子孙
妻财
官鬼
兄弟
世爻
应爻
用神
sixRelative
useGod
```

---

# 13. 当前状态

```text
literatureResearch = completed_and_reviewed
ruleReview = complete
intentSchemaDesign = design_only_ready
formalIntentImplementation = blocked
formalRuleRegistryImplementation = blocked
semanticTraining = false
currentRoute = false
```
