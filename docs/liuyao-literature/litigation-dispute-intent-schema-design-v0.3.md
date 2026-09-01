# 龟甲 · 六爻 Litigation / Dispute Intent Schema Design v0.3

日期：2026-09-01

状态：`design_only_ready_v0.3`

基础：

- `litigation-dispute-intent-schema-design-v0.2.md`
- `litigation-represented-subject-resolver-research-v0.1.md`

> v0.3 只增加代问诉讼参与者职责与 partial-design 边界；不修改正式 Intent / Router / Rule Registry / current-22 / training。

---

# 1. Dispute Subject

更新：

```ts
disputeSubject: {
  relationToQuerent:
    | 'self'
    | 'parent'
    | 'child'
    | 'wife'
    | 'husband'
    | 'sibling'
    | 'friend_or_peer'
    | 'other'
    | 'unknown',
  representationMode:
    | 'self'
    | 'proxy_uncontrolled'
    | 'proxy_controller'
    | 'unknown'
}
```

Semantic 层不输出：

```text
世 / 应 / 父母 / 子孙 / 妻财 / 官鬼 / 兄弟
```

---

# 2. Participant Context

新增：

```ts
disputeParticipants?: {
  actualLitigantKnown:
    | true
    | false
    | 'unknown'
  actualCounterpartyKnown:
    | true
    | false
    | 'unknown'
  filingActorRelation?:
    | 'self'
    | 'represented_subject'
    | 'third_party_agent'
    | 'unknown'
  settlementDecisionMakerRelation?:
    | 'self'
    | 'represented_subject'
    | 'joint'
    | 'third_party_agent'
    | 'unknown'
}
```

这些字段描述现实参与者，不是传统 selector。

---

# 3. Traditional Resolver Contract

```text
PRR-DISPUTE-PARTICIPANT
```

首轮关系候选：

```text
self    → 世
parent  → 父母
child   → 子孙
wife    → 妻财
husband → 官鬼
sibling → 兄弟
friend_or_peer → provisional 兄弟 candidate
other / unknown → unresolved
```

但：

```text
represented party relation selector
≠ virtual 世
```

并且：

```text
represented party resolved
≠ counterparty automatically = 应
```

---

# 4. Full vs Partial Eligibility

## 4.1 Self Litigation

```text
disputeSubject.relationToQuerent = self
representationMode = self
```

允许现有完整双边结构：

```text
世 → self party
应 → counterparty
官鬼 → proceeding
父母 → case document
```

对应：

```text
litigation_outcome
dispute_resolution_outcome
dispute_counterparty_action
```

可继续作为 first-phase full-plan candidates。

## 4.2 Represented Litigation

如果：

```text
disputeSubject.relationToQuerent != self
```

即使 `PRR-DISPUTE-PARTICIPANT` 成功解析实际当事人：

```text
counterpartyTraditionalAnchor
```

仍默认：

```text
unresolved
```

所以：

```text
semantic event = resolved
represented party = resolved | partial
bilateral litigation relation = unresolved
overall ObservationPlan = partial_design
```

---

# 5. Duty-specific Constraints

## litigation_outcome

完整自动化第一阶段仍要求：

```text
self subject
```

represented case：

```text
partial_design only
```

## dispute_resolution_outcome

需要双边关系，因此 represented case 默认：

```text
partial_design
```

除非未来独立 resolver 解决 counterparty anchor。

## dispute_counterparty_action

self case：

```text
counterparty → 应 Primary
```

represented case：

```text
counterparty relative to represented litigant = unresolved
```

不得把应直接复用。

## proceeding_acceptance

受理本身主要是：

```text
官鬼 / proceeding
父母 / filing
```

对世应依赖较弱。

represented case 可保持：

```text
semantic resolved
proceeding base responsibilities resolved
filing actor / represented subject context may be partial
```

所以它比“官司胜负”更接近未来可支持，但 v0.3 仍不自动 promotion。

---

# 6. Representation Control

`representationMode` 的目的不是预测“意念传导”，而是承认现实控制关系可能改变 Observation responsibility。

例如：

```text
父亲替未成年孩子处理诉讼
```

可能同时存在：

```text
child → substantive represented party
parent → filing / settlement decision controller
```

所以未来 ObservationPlan 允许：

```text
Role Observation A → represented party
Role Observation B → controller / filing actor
```

不得强制只留一个 participant。

---

# 7. Minimal Sufficiency

Self `litigation_outcome`：

```text
disputeSubject.relationToQuerent = self
disputeSubject.representationMode = self
proceedingContext specific/context-bounded
counterparty semantic presence resolved
```

Represented case：

Semantic Sufficiency 可以通过，但 Traditional Sufficiency 允许失败：

```text
semanticSufficiency = sufficient
traditionalParticipantResolution = partial | unresolved
```

这是合法状态，不得 fallback 到 legacy `世应`。

---

# 8. Hard Prohibitions

```text
represented subject = 世
represented subject relation line = virtual 世
represented subject's opponent = 应
friend = 兄弟 therefore full litigation outcome supported
proxy_controller = 世 therefore replace substantive litigant
```

以上均不得成为统一规则。

---

# 9. Current Status

```text
intentSchemaDesign = design_only_ready_v0.3
representedParticipantResolverResearch = complete
selfLitigationFullPlan = retained
representedLitigationFullPlan = partial_only

formalIntentImplementation = blocked
formalRuleRegistryImplementation = blocked
semanticTraining = false
currentRoute = false
```

当前 v0.13 next-topic boundary 仍为 design-only。