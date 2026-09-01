# 龟甲 · 六爻 Career Position Intent / Event Schema Design v0.4

日期：2026-09-01

状态：`design_only_ready_v0.4`

主题：`career_position`

基础：`career-position-intent-schema-design-v0.3.md`

专项上游：

- `career-employment-status-confirmation-research-v0.1.md`
- `career-employment-status-confirmation-rule-review-v0.1.md`

> v0.4 只把 `employment_status_confirmation` 从 deferred 提升为 provisional supported design。正式生产实现仍受当前 Semantic gate 阻断。

---

# 1. Supported Duties

v0.4 supported：

```text
job_application_outcome
position_advancement
employment_retention
employment_transition_outcome
employment_formalization_outcome
employment_status_confirmation
```

继续 deferred：

```text
employment_transition_comparison
resignation_suitability
```

其中：

```text
employment_status_confirmation
```

必须携带：

```text
traditionalMappingStatus = provisional_modern_mapping
```

这是设计元数据，不是 NLP 输出字段。

---

# 2. Current Target Aspect 新增

新增：

```text
employment_status_transition
```

因此：

```text
careerDuty = employment_status_confirmation
→ currentTargetAspect = employment_status_transition
```

而：

```text
careerDuty = employment_formalization_outcome
→ currentTargetAspect = formalization_document
```

两者必须分开。

---

# 3. Status Transition Context

新增：

```ts
statusTransitionContext: {
  from:
    | 'provisional'
    | 'unknown'
  to:
    | 'confirmed'
    | 'unknown'
  type:
    | 'provisional_to_confirmed'
    | 'other'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

首轮只支持：

```text
type = provisional_to_confirmed
```

其他现代 employment status conversion 先识别但不自动复用。

---

# 4. Intent Example

```text
我试用期下个月结束，这次能不能顺利转正？
```

设计输出：

```js
{
  event:{ type:'career_position' },
  goals:[{ type:'outcome' }],
  semantics:{
    careerDuty:'employment_status_confirmation',
    currentTargetAspect:'employment_status_transition',
    formalizationContext:'not_indicated'
  },
  participants:[
    { role:'career_subject', relationToQuerent:'self' }
  ],
  careerTarget:{
    kind:'employment',
    specificity:'context_bounded',
    temporalRole:'current'
  },
  statusTransitionContext:{
    from:'provisional',
    to:'confirmed',
    type:'provisional_to_confirmed',
    specificity:'context_bounded'
  }
}
```

Intent 不输出官鬼 / 世。

---

# 5. Formalization Context

如果：

```text
这次转正审批会不会影响最后转正？
```

current target 仍是 status confirmation 时：

```text
careerDuty = employment_status_confirmation
formalizationContext = explicit
```

后续允许父母作为 Domain。

但：

```text
公司已经确认我会转正，转正合同什么时候签？
```

应改：

```text
careerDuty = employment_formalization_outcome
currentTargetAspect = formalization_document
```

---

# 6. Minimal Sufficiency

至少要求：

```text
event = career_position
goal = outcome
careerDuty = employment_status_confirmation
currentTargetAspect = employment_status_transition
career subject = self
careerTarget.temporalRole = current
careerTarget.specificity = specific | context_bounded
statusTransitionContext.type = provisional_to_confirmed
statusTransitionContext.specificity = specific | context_bounded
```

如果只说：

```text
我的工作什么时候稳定？
```

不能推成 probation confirmation。

---

# 7. Hard Boundaries

```text
试用期是否转正式员工
→ employment_status_confirmation

已确定转正，正式合同 / 通知是否完成
→ employment_formalization_outcome

职位能否保住 / 会不会被裁
→ employment_retention

能不能升主管
→ position_advancement

实习结束能不能拿正式 offer
→ 当前先 unresolved / future status-transition expansion
```

最后一项不得默认等于 probation，因为 intern-to-employee 可能同时包含新的 employment acquisition。

---

# 8. Expected State

新增：

```text
employment_status_confirmation
→ employment_status_confirmed
```

这只表示用户期待的状态，不表示已经预测成功。

---

# 9. 当前状态

```text
employmentStatusConfirmationLiterature = complete_with_modern_mapping_caveat
employmentStatusConfirmationRuleReview = complete_provisional
intentSchemaDesign = design_only_ready_v0.4
employmentStatusConfirmationSchema = ready_provisional

employmentTransitionComparison = deferred
resignationSuitability = deferred

formalIntentImplementation = blocked_by_current_semantic_gate
formalRuleRegistryImplementation = blocked_by_current_semantic_gate
semanticTraining = false
currentRoute = false
```

下一步允许建立 isolated / unreachable status-confirmation contract。