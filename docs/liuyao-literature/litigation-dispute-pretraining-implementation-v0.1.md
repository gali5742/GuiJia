# 龟甲 · 六爻诉讼纠纷 Pretraining Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented`

主题：`litigation_dispute`

依赖：

- `litigation-dispute-research-v1.0.md`
- `litigation-dispute-rule-candidates-v0.1.md`
- `litigation-dispute-rule-review-v0.1.md`
- `litigation-dispute-intent-schema-design-v0.1.md`

实现：

- `js/liuyao-litigation-dispute-pretraining-v01.js`
- `tests/liuyao-litigation-dispute-pretraining-v01-tests.js`

> 本实现不可达，不接入 `liuyao-intent.js`、Rule Registry、Observation Planner、Router、训练 / 校准 / blind 数据。

---

# 1. Gate

继续遵守当前 v0.13 next-topic boundary：

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
litigation_outcome
dispute_resolution_outcome
dispute_counterparty_action
```

Deferred：

```text
proceeding_acceptance
settlement_suitability
litigation_strategy
generic_dispute_state
```

这些 deferred duty 不会静默重映射到已支持规则。

---

# 3. Draft Observation Plan

## TR-LD-001-A · litigation_outcome

```text
Primary → 官鬼 / formal_proceeding_or_adjudication
Role    → 世 / self_party
Role    → 应 / counterparty
父母    → case_document_or_evidence [条件 Domain]
```

这里官鬼是争讼事项本体，不是单独的胜负决定器。

## TR-LD-001-B · dispute_resolution_outcome

```text
Primary → 官鬼 / active_dispute_or_proceeding
Role    → 世 / self_party
Role    → 应 / counterparty
Domain  → 子孙 / settlement_or_dissipation_support
父母    → case_document_or_formal_process [条件]
```

Resolution 与 litigation win/loss 使用不同 Assessment。

## TR-LD-001-C · dispute_counterparty_action

```text
Primary → 应 / counterparty_action_target
Role    → 世 / self_party
Domain  → 官鬼 / formal_proceeding_context [bounded proceeding]
Domain  → 子孙 / settlement_or_withdrawal_context [settle / withdraw]
父母    → case_document_or_evidence [条件]
```

这验证了 current-target 架构：对方行动本身成为 current target 时，应可以升为 Primary，而不是永远把官鬼放在 Primary。

---

# 4. Intent / Cross-route Gates

实现显式阻断：

```text
debt_recovery
commercial_performance
relationship_status
employment_status
compensation_amount
legal_information_or_procedure
```

对应：

```text
欠款回收 → debt_collection
合同履行 / 商业结果 → commercial route
关系 / 婚姻状态 → relationship / marital
职位状态 → career_position
钱款 / 补偿金额 → appropriate finance / income / debt route
法律规则 / 程序咨询 → informational / procedural target
```

因此：

```text
诉讼 / 仲裁只是现实背景或手段
```

不会覆盖真正 current target。

---

# 5. Represented Subject Gate

首轮只支持：

```text
disputeSubject.relationToQuerent = self
```

`represented` 返回：

```text
represented_dispute_subject_deferred
```

不会自动把世当作实际案件当事人。

---

# 6. Evidence Layer

模块提供：

```text
buildLitigationEvidence(intent, facts)
```

当前只生成设计级 Evidence，包括：

```text
self_party_vitality
counterparty_vitality
party_relation
institutional_pressure
case_document_support
resolution_support
self_party_void
counterparty_void
counterparty_activity
```

全部强制：

```text
finalAssessment = null
scoring = null
```

尤其：

```text
selfVoid
counterpartyVoid
```

只产生：

```text
withdrawal / retreat tendency
```

不会被解释成自动胜负。

空亡事实只从已有 Time / Fact 层消费；本模块不实现另一套旬空 / 出空算法。

---

# 7. Semantic / Traditional Isolation

模块实现：

```text
findTraditionalSemanticLeaks(intent)
```

检查 Intent 中不得出现：

```text
官鬼
父母
妻财
兄弟
子孙
世爻
应爻
用神
sixRelative
useGod
```

Semantic 层只保存：

```text
disputeDuty
currentTargetAspect
disputeSubject
proceedingContext
counterpartyContext
counterpartyAction
resolutionContext
documentContext
```

---

# 8. 专项测试

提交前使用同内容本地 Node 环境执行：

```bash
node --check js/liuyao-litigation-dispute-pretraining-v01.js
node --check tests/liuyao-litigation-dispute-pretraining-v01-tests.js
node tests/liuyao-litigation-dispute-pretraining-v01-tests.js
```

结果：

```text
Litigation dispute pretraining regression: 26 passed, 0 failed
```

覆盖：

1. design-only / unreachable；
2. litigation outcome Sufficiency；
3. 官鬼 Primary + 世 / 应双方 Role；
4. 文书上下文只追加父母 Domain；
5. 无文书上下文不强制父母；
6. resolution 保留官鬼 Primary + 子孙 Domain；
7. bounded pre-litigation dispute 可问 resolution；
8. counterparty action 以应为 Primary；
9. settle action 追加子孙；
10. generic counterparty 不足；
11. represented subject deferred；
12. proceeding acceptance deferred；
13. settlement suitability deferred；
14. litigation strategy deferred；
15. generic dispute state deferred；
16. debt recovery 边界；
17. commercial performance 边界；
18. relationship status 边界；
19. employment status 边界；
20. legal information 边界；
21. compensation amount 边界；
22. arbitration 作为 formal proceeding；
23. Evidence 不返回最终胜负评分；
24. 世 / 应空只作退意 Evidence；
25. 应动只作 counterparty activity Evidence；
26. Semantic Intent 无传统 selector 泄漏。

注意：该结果只证明 isolated module contract 本身通过，不等于：

```text
current Router regression passed
formal Intent integration passed
Rule Registry integration passed
PR merge-ref CI passed
```

因为这些正式接线当前按 gate 明确没有发生。

---

# 9. 正式接线前的 Shared Blockers

## 9.1 Semantic baseline gate

当前 next-topic 仍禁止进入 current v0.13 training / route inventory。

## 9.2 Source Registry provenance

正式 `EV-LD-*` 注册前需要补：

```text
火珠林
断易天机
易隐
黄金策 / 卜筮全书 lineage
```

并保留同源性说明。

## 9.3 Cross-theme collision matrix

未来训练前必须把：

```text
litigation_dispute vs debt_collection
litigation_dispute vs commercial_transaction
litigation_dispute vs career_position
litigation_dispute vs marital_relationship
litigation_dispute vs informational / procedural unsupported
```

加入全局 near-domain negative 设计。

---

# 10. 当前成熟度

```text
literatureResearch               = completed_and_reviewed
ruleCandidateReview              = complete
ruleReview                       = complete
intentSchemaDesign               = ready_v0.1
isolatedContractImplementation   = complete
isolatedRegression               = 26/26_passed

formalIntentImplementation       = blocked
formalRuleRegistryImplementation = blocked
semanticTrainingReady            = false
currentRoute                     = false
```

`litigation_dispute` 在当前 next-topic gate 允许范围内已经完成训练前隔离实现。