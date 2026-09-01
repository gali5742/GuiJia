# 龟甲 · 六爻事业正式手续 Rule Review v0.1

日期：2026-09-01

状态：`rule_review_complete`

输入：

- `career-employment-formalization-research-v0.1.md`
- `career-position-rule-review-v0.1.md`
- `career-position-intent-schema-design-v0.2.md`

> 本文件只审查 `employment_formalization_outcome`，不修改正式 Rule Registry，不晋升 current route。

---

# 1. Review 结论

原先：

```text
currentTargetAspect = formalization_document
→ deferred_until_schema_validation
```

现在可以形成独立 Base Rule：

```text
TR-CP-002-A · employment_formalization_outcome
```

它与 `job_application_outcome` 的区别不是 application stage，而是 current target 已经改变。

---

# 2. Base Rule · Employment Formalization Outcome

匹配：

```text
event = career_position
careerDuty = employment_formalization_outcome
currentTargetAspect = formalization_document
formalizationContext = explicit
```

Observation：

```text
Primary
→ 父母
→ formal_employment_authorization_or_document
→ required = true

Domain
→ 官鬼
→ employment_or_position_being_formalized
→ required = true

Role
→ 世
→ career_subject_self
→ required = true
```

这里再次出现：

```text
Primary + required Domain
```

的 co-required 结构。

传统原因是：

```text
官鬼 → 官职 / 职位
父母 → 印绶 / 宣敕 / 文书
```

正式手续本身成为 current target 时父母升为 Primary，但它必须仍然对应一个实际 employment / position，因此官鬼不能降成完全可选背景。

---

# 3. 与 Job Application Outcome 的边界

## 3.1 Employment Acquisition

```text
这次最后会不会录用我？
我能不能拿到这个 offer？
```

如果 `offer` 的现实含义是：

```text
录用决定 / employment acquisition
```

继续：

```text
TR-CP-001-A
Primary → 官鬼
Role → 世
```

即使流程已经来到 verbal / written offer，也不能仅凭关键词把父母升为 Primary。

## 3.2 Formalization Outcome

```text
已经口头确定录用了，正式 offer 会不会下来？
正式劳动合同能不能签成？
任命文件能不能顺利下来？
```

只有 current target 明确是：

```text
formal employment authorization / document
```

才进入 `TR-CP-002-A`。

---

# 4. Formalization Target Resolver

建议新增：

```text
PRR-CAREER-FORMALIZATION-TARGET
```

输入只读取现代现实语义，输出：

```text
written_offer
employment_contract
appointment_document
onboarding_authorization
other_formalization
unresolved
```

Resolver 不输出父母。

传统 selector 仍由 Rule Registry 选择。

---

# 5. Employer 与 Formalization 同为父母时如何处理

现有 career 设计允许：

```text
父母 / employer_organization
```

本规则又要求：

```text
父母 / formal_employment_authorization_or_document
```

二者不能因为 traditional selector 相同就静默合并 semantic duty。

例如：

```text
A 公司已经口头录用我，正式合同能不能签下来？
```

可以同时存在：

```text
父母 / employer_organization / optional context
父母 / formal_employment_authorization_or_document / Primary
```

未来 ObservationPlan 必须支持至少一种表达：

### 方案 A：多个 semantic subjects 指向同一个传统 selector

```text
Subject 1 → 父母 / formalization document
Subject 2 → 父母 / employer organization
```

### 方案 B：单传统 target + semantic duties[]

```text
父母
→ duties = [formalization_document, employer_organization]
```

首轮 isolated implementation 采用方案 A，因为它与现有 `ObservationSubject` 结构兼容，也最少修改共享架构。

禁止只保留：

```text
selector = 父母
```

然后丢失现实职责。

---

# 6. Conditional Employer Augmentation

如果：

```text
employerContext.specificity = specific | context_bounded
```

允许保留：

```text
父母 / employer_organization / optional
```

但：

```text
formalization Primary
```

已经是父母时，augmentation 不得替换或覆盖 Primary semantic duty。

---

# 7. Assessment Evidence

以下不进入 Rule Registry：

```text
父母旺衰 / 空破 / 动变
官鬼旺衰 / 空破 / 动变
父母与官鬼关系
父母与世关系
官鬼与世关系
```

未来输出可以包括：

```text
formalization_document_state
employment_position_state
formalization_to_position_relation
formalization_to_self_relation
co_required_pair_state
```

禁止单项直接输出：

```text
contract_signed = true / false
written_offer_received = true / false
appointment_confirmed = true / false
```

---

# 8. Cross-route Hard Boundaries

```text
最终是否录用
→ job_application_outcome

纸质合同快递是否送到
→ receive_item

合同工资多少 / 奖金多少
→ income / compensation

公司本身值不值得去
→ employer / career suitability，当前 deferred
```

---

# 9. 当前状态

```text
employmentFormalizationLiterature = complete
employmentFormalizationRuleReview = complete
formalizationPrimaryRule = TR-CP-002-A
formalizationTargetResolverRequired = true
formalIntentIntegration = blocked_by_current_semantic_gate
formalRuleRegistryIntegration = blocked_by_current_semantic_gate
semanticTraining = false
currentRoute = false
```

原 `formalization_document` 的“规则 / Schema 不清”型暂缓可以解除，下一步进入 career Schema v0.3 与 isolated contract。