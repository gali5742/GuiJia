# 龟甲 · 六爻诉讼程序受理 Pretraining Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented`

主题：`litigation_dispute.proceeding_acceptance`

依赖：

- `litigation-proceeding-acceptance-research-v0.1.md`
- `litigation-proceeding-acceptance-rule-review-v0.1.md`
- `litigation-dispute-intent-schema-design-v0.2.md`

实现：

- `js/liuyao-litigation-proceeding-acceptance-pretraining-v01.js`
- `tests/liuyao-litigation-proceeding-acceptance-pretraining-v01-tests.js`

> 本实现不可达，不接正式 Intent、Router、Rule Registry、current-22、训练 / 校准 / blind。

---

# 1. 已解除的暂缓

原：

```text
proceeding_acceptance
→ recognized_but_deferred
```

现在变为：

```text
literature = completed_and_reviewed
ruleReview = complete
schema = ready_v0.2
isolatedContract = complete
```

但仍受系统级 v0.13 gate 阻断，不能成为 current route。

---

# 2. 双 current-target 结构

实现支持：

```text
institutional_acceptance
filing_document_acceptance
```

而不是一个静态“立案用神”。

## institutional_acceptance

```text
Primary → 官鬼 / formal_proceeding_acceptance
Required Domain → 父母 / filing_or_pleading_document
Role → 世 / self_filing_party
```

## filing_document_acceptance

```text
Primary → 父母 / filing_document_acceptance
Required Domain → 官鬼 / accepting_authority_or_proceeding
Role → 世 / self_filing_party
```

---

# 3. ObservationPlan 新发现

本专项第一次明确要求：

```text
Domain Observation
required = true
```

原因来自传统直接证据：

```text
官父两全 → 准理结构
父旺官空 → 文书虽善而官府不受
```

因此未来正式 ObservationPlan 不能默认：

```text
Primary 之外全部 optional
```

需要支持：

```text
Primary + required secondary responsibility
```

或更一般的：

```text
co-required observation set
```

---

# 4. Evidence Admission 继续 Deferred

```text
证据会不会被采纳
```

不复用本模块。

模块明确：

```text
acceptanceContext.targetAspect = evidence_admission
→ deferred
```

---

# 5. Arbitration / Appeal

支持现代语义阶段：

```text
arbitration_filing
appeal_filing
```

但它们只是现代程序对“正式争讼受理”的 semantic mapping，不新增传统 selector。

---

# 6. Evidence 层

实现：

```text
filing_document_readiness
institutional_acceptance_support
self_filing_capacity
co_required_pair_state
```

组合状态只保存：

```text
both_supported
document_supported_authority_weak
authority_supported_document_weak
both_weak
mixed_or_unknown
```

并强制：

```text
finalAssessment = null
scoring = null
```

不把“官父两全”直接翻译成最终 Boolean。

---

# 7. 专项测试

提交前使用本地 Node 环境执行同内容临时文件：

```bash
node --check liuyao-litigation-proceeding-acceptance-pretraining-v01.js
node --check liuyao-litigation-proceeding-acceptance-pretraining-v01-tests.js
node liuyao-litigation-proceeding-acceptance-pretraining-v01-tests.js
```

结果：

```text
Litigation proceeding acceptance regression: 21 passed, 0 failed
```

覆盖：

1. design-only / unreachable；
2. institutional acceptance Sufficiency；
3. 官鬼 Primary + 父母 required Domain；
4. filing document acceptance Sufficiency；
5. 父母 Primary + 官鬼 required Domain；
6. self filing party Role；
7. represented subject 继续 unresolved；
8. unknown acceptance target abstain；
9. evidence admission deferred；
10. filing context gate；
11. explicit filing context；
12. appeal filing semantic mapping；
13. arbitration filing semantic mapping；
14. unsupported filing stage blocker；
15. generic proceeding blocker；
16. current target mismatch；
17. litigation outcome 不误入本模块；
18. Evidence 无 final Assessment；
19. 文书强 / 官弱组合保留；
20. 官强 / 文书弱组合保留；
21. Semantic Contract 无传统 selector 泄漏。

---

# 8. 当前状态

```text
proceedingAcceptanceDeferredReason.literature = cleared
proceedingAcceptanceDeferredReason.ruleArchitecture = cleared
proceedingAcceptanceDeferredReason.schema = cleared
isolatedRegression = 21/21_passed

formalIntentIntegration = blocked
formalRuleRegistryIntegration = blocked
semanticTrainingEligible = false
currentRoute = false
```

因此 `proceeding_acceptance` 已经从“主题内部暂缓项”升级为“主题内部训练前完成项”；剩余阻断是五主题共享的系统级 Gate。