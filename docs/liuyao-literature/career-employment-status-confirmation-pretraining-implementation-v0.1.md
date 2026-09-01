# 龟甲 · 六爻工作转正 / 任职状态确认 Pretraining Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented_provisional`

主题：`career_position.employment_status_confirmation`

依赖：

- `career-employment-status-confirmation-research-v0.1.md`
- `career-employment-status-confirmation-rule-review-v0.1.md`
- `career-position-intent-schema-design-v0.4.md`

实现：

- `js/liuyao-career-employment-status-confirmation-pretraining-v01.js`
- `tests/liuyao-career-employment-status-confirmation-pretraining-v01-tests.js`

> 本实现不可达。传统功能连续性较强，但古典不存在现代“试用期转正”同制度直接规则，因此必须保持 `provisional_modern_mapping`。

---

# 1. 已解除的暂缓

原：

```text
employment_status_confirmation
→ deferred
```

现在：

```text
literature = complete_with_modern_mapping_caveat
ruleReview = complete_provisional
schema = ready_v0.4
isolatedContract = complete
```

但它不能被升级成 `stable_traditional`。

---

# 2. Observation Plan

```text
TR-CP-003-A

Primary
→ 官鬼 / current_employment_status

Role
→ 世 / incumbent_self
```

只有明确 formalization context 才追加：

```text
父母 / formal_confirmation_process / optional Domain
```

默认不因为“转正通常有审批”自动生成父母。

---

# 3. 与其他 Career Duty 的隔离

```text
provisional → confirmed
→ employment_status_confirmation

confirmed position retained / lost
→ employment_retention

position level advancement
→ position_advancement

formal contract / notice as current target
→ employment_formalization_outcome
```

它们即使共享部分 selector，也必须保留 semantic duty。

---

# 4. First-release Scope

仅支持：

```text
statusTransitionContext.type = provisional_to_confirmed
```

暂不泛化：

```text
intern_to_employee
contractor_to_employee
part_time_to_full_time
temporary_to_permanent
promotion_with_regularization
```

避免把所有劳动状态变化都塞进“转正”。

---

# 5. Evidence

只产生：

```text
current_employment_state
status_transition_support
self_capacity_state
formal_confirmation_process_state
```

强制：

```text
finalAssessment = null
scoring = null
```

---

# 6. 专项测试

本地 Node 同内容执行：

```text
Career employment status confirmation regression: 17 passed, 0 failed
```

覆盖：

1. design-only + provisional mapping；
2. 转正 sufficiency；
3. 官鬼 Primary + 世 Role；
4. 默认无父母；
5. explicit formalization 才追加父母；
6. context-supported formalization；
7. formal document target 不误入；
8. advancement 不误入；
9. retention 不误入；
10. current employment requirement；
11. bounded career target；
12. 仅 provisional_to_confirmed；
13. generic transition blocker；
14. represented subject blocker；
15. outcome goal gate；
16. Evidence 不生成最终结论；
17. Semantic Intent 无传统 selector 泄漏。

---

# 7. 当前状态

```text
employmentStatusConfirmationDeferredReason = cleared_for_provisional_design
isolatedRegression = 17/17_passed
traditionalMappingStatus = provisional_modern_mapping

formalIntentIntegration = blocked
formalRuleRegistryIntegration = blocked
semanticTrainingEligible = false
currentRoute = false
```

因此“转正”已从 career 主题内部完全 deferred，升级为可实现的 provisional theme-internal pretraining duty；但其证据等级必须永久与直接古典规则区分。