# 龟甲 · 六爻 Career Position Intent / Event Schema Design v0.3

日期：2026-09-01

状态：`design_only_ready_v0.3`

主题：`career_position`

基础：`career-position-intent-schema-design-v0.2.md`

专项上游：

- `career-employment-formalization-research-v0.1.md`
- `career-employment-formalization-rule-review-v0.1.md`

> v0.3 只解除 `formalization_document` current target 的 Schema 暂缓，不修改正式 `liuyao-intent.js`、Router、Rule Registry、current-22 或训练数据。

---

# 1. Supported Duties 更新

首轮 supported：

```text
job_application_outcome
position_advancement
employment_retention
employment_transition_outcome
employment_formalization_outcome
```

继续 deferred：

```text
employment_status_confirmation
employment_transition_comparison
resignation_suitability
```

---

# 2. Current Target Aspect

`employment_formalization_outcome` 必须：

```text
currentTargetAspect = formalization_document
formalizationContext = explicit
```

其他四个既有 duty 继续要求：

```text
currentTargetAspect = position_or_employment
```

因此 v0.3 不再把所有 formalization-document target 一律 deferred。

---

# 3. Formalization Target

新增：

```ts
formalizationTarget: {
  text?: string
  type:
    | 'written_offer'
    | 'employment_contract'
    | 'appointment_document'
    | 'onboarding_authorization'
    | 'other_formalization'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

该字段只描述现代现实对象，不输出传统六亲。

---

# 4. “offer”不得按关键词决定 Duty

## Employment Acquisition

```text
我这次能不能拿到 offer？
```

若语义等于：

```text
对方最终会不会录用我
```

则：

```text
careerDuty = job_application_outcome
currentTargetAspect = position_or_employment
```

## Employment Formalization

```text
已经口头确认录用了，正式书面 offer 会不会发？
```

则：

```text
careerDuty = employment_formalization_outcome
currentTargetAspect = formalization_document
formalizationTarget.type = written_offer
```

所以：

```text
offer keyword != formalization duty
```

---

# 5. Application Stage 继续只表达流程位置

```ts
semantics.applicationStage
```

保持 v0.2 定义。

即使：

```text
applicationStage = contract
```

只要 current target 仍是：

```text
最终能不能入职
```

就不能自动改成 `employment_formalization_outcome`。

---

# 6. Minimal Sufficiency

`employment_formalization_outcome` 至少要求：

```text
event = career_position
goal = outcome
careerDuty = employment_formalization_outcome
currentTargetAspect = formalization_document
formalizationContext = explicit
career subject = self
formalizationTarget.specificity = specific | context_bounded
formalizationTarget.type != unknown
存在 bounded employment / position context
```

### bounded employment / position context

至少满足其一：

```text
careerTarget.specificity = specific | context_bounded
或
employerContext.specificity = specific | context_bounded
```

这防止：

```text
以后我的合同运怎么样？
```

进入正式 Rule Selection。

---

# 7. Expected State

新增：

```text
employment_formalization_outcome
→ employment_formalization_completed
```

例如：

```text
written offer issued
employment contract completed
appointment document issued
onboarding authorization completed
```

具体下游 Assessment 仍不能由 Semantic 层提前判断。

---

# 8. Employer Context 与 Formalization Target 分离

```text
employerContext
→ 公司 / 单位这一现实组织对象

formalizationTarget
→ offer / contract / appointment document 这一正式化对象
```

即使后续传统层二者都可能选择父母，Intent 也不得合并。

合法：

```js
{
  employerContext:{ text:'A公司', specificity:'specific', isExternalTarget:true },
  formalizationTarget:{
    text:'正式劳动合同',
    type:'employment_contract',
    specificity:'specific'
  }
}
```

而不是：

```js
{ traditionalObject:'父母' }
```

---

# 9. Hard Boundaries

```text
最终能否获得工作
→ job_application_outcome

书面 offer / 合同 / 任命本身能否完成
→ employment_formalization_outcome

合同纸质件何时寄到
→ receive_item

合同薪资 / 奖金多少
→ income / compensation

公司值不值得去
→ current career suitability / employer-target deferred
```

---

# 10. 当前状态

```text
employmentFormalizationLiterature = completed_and_reviewed
employmentFormalizationRuleReview = complete
intentSchemaDesign = design_only_ready_v0.3
employmentFormalizationSchema = ready

employmentStatusConfirmation = deferred
employmentTransitionComparison = deferred
resignationSuitability = deferred

formalIntentImplementation = blocked_by_current_semantic_gate
formalRuleRegistryImplementation = blocked_by_current_semantic_gate
semanticTraining = false
currentRoute = false
```

下一步允许建立 isolated / unreachable employment-formalization contract。