# 龟甲 · 六爻工作转正 / 任职状态确认 Rule Review v0.1

日期：2026-09-01

状态：`rule_review_complete_provisional`

输入：

- `career-employment-status-confirmation-research-v0.1.md`
- `career-position-rule-review-v0.1.md`
- `career-position-intent-schema-design-v0.3.md`

> 本规则允许进入 isolated design，但 evidence tier 必须明确为现代制度映射，不冒充古典“试用期转正”直接规则。

---

# 1. Base Rule

设计：

```text
TR-CP-003-A · employment_status_confirmation
```

证据标签：

```text
automationStatus = provisional_modern_mapping
classicalDirectInstitutionMatch = false
traditionalFunctionalContinuity = strong
```

匹配：

```text
event = career_position
careerDuty = employment_status_confirmation
currentTargetAspect = employment_status_transition
statusTransition = provisional_to_confirmed
```

---

# 2. Observation Plan

```text
Primary
→ 官鬼
→ current_employment_status
→ required = true

Role
→ 世
→ incumbent_self
→ required = true
```

条件追加：

```text
父母
→ formal_confirmation_process
→ source = domain
→ required = false
```

只有：

```text
formalizationContext = explicit | context_supported
```

才追加。

---

# 3. 为什么父母不是 required Domain

转正与 formalization outcome 不同。

```text
“我能不能转成正式员工？”
```

核心现实状态是：

```text
employment status
provisional → confirmed
```

它可以在用户没有明确关心任何具体文书的情况下成立。

因此首轮：

```text
官鬼 + 世
```

已经构成完整观察主轴。

父母只在现实问题明确包含：

```text
审批
转正手续
通知
合同更新
正式确认流程
```

时追加。

若用户当前真正问的是文件本身，则不使用本规则，而切：

```text
TR-CP-002-A employment_formalization_outcome
```

---

# 4. Status Transition Contract

只支持：

```text
provisional_to_confirmed
```

首轮不自动覆盖：

```text
contractor_to_employee
part_time_to_full_time
temporary_to_permanent_without_probation_context
intern_to_employee
promotion_with_regularization
```

这些现代状态可能具有不同现实含义，需要未来单独审查或由 Semantic Provider 明确映射。

---

# 5. 与 Retention 的关系

两者共享：

```text
官鬼 / current employment
世 / incumbent self
```

但 semantic duty 不同：

```text
employment_retention
→ 已确认职位是否继续保有

employment_status_confirmation
→ provisional status 是否转 confirmed
```

因此不能因为 selector 一样就合并成一个 Base Rule。

---

# 6. 与 Advancement 的关系

```text
status confirmation
!= position advancement
```

如果问题同时包含：

```text
转正 + 升职
```

属于 multi-target career question。

首轮不得：

```text
只看官鬼一次然后声称两个目标一起解决
```

应进入未来 multi-target policy。

---

# 7. Formalization Augmentation

设计：

```text
AR-CP-005-STATUS-FORMALIZATION
```

触发：

```text
formalizationContext = explicit | context_supported
currentTargetAspect = employment_status_transition
```

Observation：

```text
父母
→ formal_confirmation_process
→ required = false
```

它不同于：

```text
AR-CP-002-FORMALIZATION
```

在 employment acquisition 场景里的 formalization augmentation，semantic duty 必须独立保存。

---

# 8. Evidence Layer

不进入 Registry：

```text
官鬼旺衰 / 空破 / 动变
世旺衰 / 空破
官世生克合冲
父母流程状态
```

未来输出：

```text
current_employment_state
status_transition_support
self_capacity_state
formal_confirmation_process_state
```

禁止直接：

```text
confirmed = true / false
```

---

# 9. 当前状态

```text
employmentStatusConfirmationLiterature = complete_with_modern_mapping_caveat
employmentStatusConfirmationRuleReview = complete_provisional
ruleRef = TR-CP-003-A
formalIntentIntegration = blocked
formalRuleRegistryIntegration = blocked
semanticTrainingEligible = false
currentRoute = false
```

该项可以进入 Schema v0.4 和 isolated contract，但未来正式 Registry 必须保留 `provisional_modern_mapping` 标签。