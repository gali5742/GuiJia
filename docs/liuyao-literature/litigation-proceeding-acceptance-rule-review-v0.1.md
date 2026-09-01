# 龟甲 · 六爻诉讼程序受理 Rule Review v0.1

日期：2026-09-01

状态：`rule_review_complete`

输入：

- `litigation-proceeding-acceptance-research-v0.1.md`
- `litigation-dispute-rule-review-v0.1.md`
- `litigation-dispute-intent-schema-design-v0.1.md`

> 本文件只审查原 deferred duty `proceeding_acceptance`，不修改正式 Rule Registry。

---

# 1. Review 结论

原来一个：

```text
proceeding_acceptance
```

必须保留一个现代主题 duty，但内部由：

```text
acceptanceTargetAspect
```

区分两个 Base Rule。

首轮设计：

```text
TR-LD-002-A  institutional_acceptance
TR-LD-002-B  filing_document_acceptance
```

两条规则共享：

```text
官鬼 + 父母 = co-required observation pair
```

只是 Primary 与 required Domain 随 current target 对调。

---

# 2. Base Rule A · Institutional Acceptance

```text
TR-LD-002-A
```

匹配：

```text
event = litigation_dispute
disputeDuty = proceeding_acceptance
acceptanceTargetAspect = institutional_acceptance
currentTargetAspect = proceeding_acceptance
```

Observation：

```text
Primary
→ 官鬼
→ formal_proceeding_acceptance
→ required = true

Domain
→ 父母
→ filing_or_pleading_document
→ required = true

Role
→ 世
→ self_filing_party
→ required = true
```

不默认加入：

```text
应 / counterparty
子孙 / settlement
```

因为正式受理可以在对方行动尚未成为 current target 时发生。

---

# 3. Base Rule B · Filing Document Acceptance

```text
TR-LD-002-B
```

匹配：

```text
event = litigation_dispute
disputeDuty = proceeding_acceptance
acceptanceTargetAspect = filing_document_acceptance
currentTargetAspect = proceeding_acceptance
```

Observation：

```text
Primary
→ 父母
→ filing_document_acceptance
→ required = true

Domain
→ 官鬼
→ accepting_authority_or_proceeding
→ required = true

Role
→ 世
→ self_filing_party
→ required = true
```

---

# 4. 为什么 Domain 是 required

普通 Domain Observation 通常：

```text
required = false
```

但本专项不能这样处理。

直接传统证据已经出现：

```text
官父两全，方可准理
父旺官空，词状虽善而官府不受
```

所以这里需要表达：

```text
co_required_pair
```

即：

```text
Primary 是 current target 的主观察职责
Required Domain 是完成该现实事件不可缺的第二职责
```

这不是“两个用神谁更重要”的问题，而是 Observation Plan 的现实职责表达。

---

# 5. Acceptance Target Resolver

建议新增：

```text
PRR-LITIGATION-ACCEPTANCE-TARGET
```

输入只读取现代语义：

```text
用户是在问：
1. 法院 / 仲裁机构是否正式受理程序？
2. 还是诉状 / 申请书 / 补交材料本身是否被接受？
```

输出：

```text
institutional_acceptance
filing_document_acceptance
unresolved
```

Resolver 不输出六亲。

---

# 6. Evidence 层

以下不进入 Observation Registry：

```text
父母旺衰 / 空破 / 动变
官鬼旺衰 / 空破 / 动变
官父之间的关系
世与官父关系
```

未来可生成：

```text
filing_document_readiness
institutional_acceptance_support
co_required_pair_state
self_filing_capacity
```

其中：

```text
co_required_pair_state
```

只允许描述 Evidence 组合，例如：

```text
both_supported
document_supported_authority_weak
authority_supported_document_weak
both_weak
mixed_or_unknown
```

禁止直接输出：

```text
accepted = true / false
```

---

# 7. Evidence Admission 不并入

```text
证据会不会被法院采纳？
```

current target 是：

```text
evidence_admission
```

不是：

```text
proceeding_acceptance
```

当前继续 deferred。

---

# 8. Appeal / Arbitration

首轮允许 Semantic 层：

```text
filingStage = arbitration_filing | appeal_filing
```

传统 Observation 仍复用官父职责对。

但 provenance 必须写：

```text
modern_semantic_mapping
```

而不是新增所谓“仲裁用神”“上诉用神”。

---

# 9. 当前状态

```text
proceedingAcceptanceLiterature = complete
proceedingAcceptanceRuleReview = complete
traditionalRuleUncertaintyBlocker = cleared
acceptanceTargetResolverRequired = true
formalRegistryImplementation = blocked_by_semantic_gate
semanticTraining = false
currentRoute = false
```

原 `proceeding_acceptance` 已不应继续标记为 `insufficient_rule_evidence`；下一步进入 Intent Schema v0.2 与 isolated contract。