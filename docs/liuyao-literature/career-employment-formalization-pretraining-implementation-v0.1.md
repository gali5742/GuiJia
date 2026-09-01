# 龟甲 · 六爻事业正式手续 Pretraining Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented`

主题：`career_position.employment_formalization_outcome`

依赖：

- `career-employment-formalization-research-v0.1.md`
- `career-employment-formalization-rule-review-v0.1.md`
- `career-position-intent-schema-design-v0.3.md`

实现：

- `js/liuyao-career-employment-formalization-pretraining-v01.js`
- `tests/liuyao-career-employment-formalization-pretraining-v01-tests.js`

> 本实现不可达，不接正式 Intent、Router、Rule Registry、current-22、训练 / 校准 / blind。

---

# 1. 已解除的暂缓

原：

```text
formalization_document
→ deferred_until_schema_validation
```

现在：

```text
careerDuty = employment_formalization_outcome
literature = completed_and_reviewed
ruleReview = complete
schema = ready_v0.3
isolatedContract = complete
```

---

# 2. Draft Observation Plan

```text
TR-CP-002-A

Primary
→ 父母 / formal_employment_authorization_or_document
→ required

Domain
→ 官鬼 / employment_or_position_being_formalized
→ required

Role
→ 世 / career_subject_self
→ required
```

它是第二个明确要求 `Primary + required Domain` 的新主题职责，与 litigation proceeding acceptance 一起证明未来 ObservationPlan 需要支持 co-required responsibility。

---

# 3. Employer 与 Formalization 的同 selector 多职责

若指定 employer 存在，Draft Plan 可同时包含：

```text
父母 / formal_employment_authorization_or_document / Primary
父母 / employer_organization / optional Domain
```

二者不能因为都是父母就合并 semantic duty。

当前 isolated implementation 采用：

```text
multiple semantic subjects → same traditional selector
```

以避免修改共享 ObservationPlan 数据结构。

---

# 4. Hard Boundaries

```text
拿到 offer = 最终录用决定
→ job_application_outcome

已确认录用，书面 offer / 合同 / 任命文件是否正式完成
→ employment_formalization_outcome

合同纸质件什么时候寄到
→ receive_item

合同里工资 / 奖金多少
→ income / compensation
```

`applicationStage = contract` 本身不会触发 formalization duty。

---

# 5. Evidence

实现只产生：

```text
formalization_document_state
employment_position_state
formalization_to_self_relation
co_required_pair_state
```

组合状态：

```text
both_supported
document_supported_position_weak
position_supported_document_weak
both_weak
mixed_or_unknown
```

并强制：

```text
finalAssessment = null
scoring = null
```

---

# 6. 专项测试

提交前使用本地 Node 环境运行同内容临时文件：

```bash
node --check liuyao-career-employment-formalization-pretraining-v01.js
node --check liuyao-career-employment-formalization-pretraining-v01-tests.js
node liuyao-career-employment-formalization-pretraining-v01-tests.js
```

结果：

```text
Career employment formalization regression: 19 passed, 0 failed
```

覆盖：

1. design-only / unreachable；
2. formalization Sufficiency；
3. 父母 Primary + 官鬼 required Domain；
4. 世 Role required；
5. employer 父母与 formalization 父母保留不同 semantic duty；
6. contract stage alone 不触发；
7. job application duty 不误入；
8. position target 不误入；
9. unknown formalization type abstain；
10. generic target blocker；
11. bounded employment context gate；
12. career target 可提供 bounded context；
13. employer 可提供 bounded context；
14. represented subject blocker；
15. outcome goal gate；
16. appointment document；
17. employment contract；
18. co-required asymmetric evidence；
19. Semantic Contract 无传统 selector 泄漏。

---

# 7. 当前状态

```text
employmentFormalizationDeferredReason.literature = cleared
employmentFormalizationDeferredReason.ruleArchitecture = cleared
employmentFormalizationDeferredReason.schema = cleared
isolatedRegression = 19/19_passed

formalIntentIntegration = blocked
formalRuleRegistryIntegration = blocked
semanticTrainingEligible = false
currentRoute = false
```

因此 `employment_formalization_outcome` 已从 career 主题内部暂缓项升级为主题内部训练前完成项。