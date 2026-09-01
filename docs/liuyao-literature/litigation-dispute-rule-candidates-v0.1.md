# 龟甲 · 六爻诉讼纠纷 Rule Candidate Review Set v0.1

日期：2026-09-01

状态：`ready_for_rule_review`

来源研究：`docs/liuyao-literature/litigation-dispute-research-v1.0.md`

> 本文件只列可审查 Candidate，不是正式 Rule Registry 实现，不修改当前 22-route Semantic Candidate。

---

## RC-LD-001 · Self party role

```text
proposition: 自占正式争讼时，世承担 self party / 己方 Role Observation
support: stable_consensus
```

世是案件一方，不是“诉讼本体”。

---

## RC-LD-002 · Counterparty role

```text
proposition: 自占正式争讼时，应承担 opposing party / 对方 Role Observation
support: stable_consensus
```

仅出现“对方”二字不能创建 litigation route；必须先有 bounded dispute context。

---

## RC-LD-003 · Proceeding / adjudication observation

```text
proposition: 官鬼承担诉讼、仲裁、官府 / 裁判权力及制度压力职责
support: stable_consensus
```

它是 formal proceeding 的核心 Observation，但不能单独决定胜负。

---

## RC-LD-004 · Case document / evidence observation

```text
proposition: 父母承担案卷、诉状、证据、契约文书、正式程序文件职责
support: stable_consensus
```

默认是 Domain Observation；若未来 current target 是立案文书 / 受理本身，应另建职责，不能自动抢 litigation outcome Primary。

---

## RC-LD-005 · Resolution / dissipation support

```text
proposition: 子孙可承担劝和、争讼消散、和解方向的 Domain / Evidence 职责
support: stable_consensus_as_resolution_evidence
```

禁止：

```text
子孙动 = 一定和解
```

---

## RC-LD-006 · Litigation outcome architecture

```text
proposition: 诉讼 / 仲裁结果应由 formal proceeding + self party + counterparty 的复合观察结构承载，而不是“官鬼单用神”
support: stable_consensus_as_architecture
```

建议：

```text
Primary → 官鬼 / formal_proceeding_or_adjudication
Role    → 世 / self_party
Role    → 应 / counterparty
```

---

## RC-LD-007 · Dispute resolution architecture

```text
proposition: 和解 / 撤诉 / 争端结束与胜负使用同一双方 / 争讼骨架，但需要独立 Resolution Assessment，并可观察子孙
support: stable_consensus_as_architecture
```

---

## RC-LD-008 · Counterparty action as current target

```text
proposition: 当 current target 是对方在争讼中的具体行动时，应可升为 Primary Observation
support: stable_consensus_as_role_evidence + semantic_target_split
```

例如：

```text
对方会不会主动和解
对方会不会继续上诉
对方会不会撤回仲裁
```

此时官鬼退为 proceeding context Domain，而不是继续强行 Primary。

---

## RC-LD-009 · Self-counterparty relation evidence

```text
proposition: 世应的生合、比和、冲克刑害及双方旺衰形成胜负 / 解决方向 Evidence
support: stable_consensus
```

禁止把：

```text
世克应 = 保证胜诉
应克世 = 保证败诉
```

登记为绝对规则。

---

## RC-LD-010 · Institutional pressure relation

```text
proposition: 官鬼对世 / 应的生克作用可形成对对应一方的制度 / 诉讼压力 Evidence
support: stable_consensus
```

只形成 side-specific Evidence，不直接宣布终局结果。

---

## RC-LD-011 · Party void / retreat evidence

```text
proposition: 世空、应空、双方俱空可形成对应一方退意、撤回、息争方向 Evidence
support: cross_source_compatible
```

必须消费既有 Time Fact。

禁止：

```text
世空 = 一定输
应空 = 一定赢
```

---

## RC-LD-012 · Proceeding acceptance composite

```text
proposition: 起诉 / 立案 / 受理存在父母文书 + 官鬼程序的复合职责
support: cross_source_compatible
```

当前：`recognized_but_deferred`。

不得塞进 `litigation_outcome` Base Rule。

---

## RC-LD-013 · Debt collection boundary

```text
proposition: 欠款能否收回若为 current target，继续属于 debt_collection；诉讼只是方法时不创建 litigation route
support: semantic_boundary
```

---

## RC-LD-014 · Commercial / contract boundary

```text
proposition: 交易成交、合同履行、交付本身是 current target 时，继续商业 route；争议 / 律师 / 起诉背景不能覆盖 current target
support: semantic_boundary
```

---

## RC-LD-015 · Cross-theme / represented boundary

```text
proposition: relationship status、employment status、compensation amount、legal information 及 represented litigation 必须独立分流或 deferred
support: architecture_and_semantic_boundary
```

包括：

```text
婚姻状态 → marital / relationship
职位保留 → career_position
工资 / 金钱取得 → finance / debt / income
法律程序咨询 → informational / procedural unsupported
代他人问官司 → subject resolver 未完成，首轮 deferred
```

---

# Explicit Non-Candidates

以下不得进入正式 Rule Registry / Assessment absolute rule：

```text
诉讼 → 官鬼一个爻决定胜负
世克应 = 保证胜诉
应克世 = 保证败诉
官鬼旺 = 保证胜诉 / 败诉
官鬼克对方 = 一定我赢
子孙动 = 一定和解
世空 = 一定输
应空 = 一定赢
父母旺 = 证据一定充分 / 法院一定受理
“对方”关键词 = litigation_dispute
“仲裁”关键词无条件覆盖 debt_collection
该不该起诉 = litigation_outcome
该不该和解 = dispute_resolution_outcome
represented party = 世
```

---

# Deferred Duties

```text
proceeding_acceptance
settlement_suitability
litigation_strategy
generic_dispute_state
represented_dispute_subject
```

其中 `proceeding_acceptance` 文献证据较强，但需要独立现代 Intent Contract；其余分别存在策略价值判断、语义不足或 subject resolver 缺口。

---

# Review Gate

进入 Rule Review 时必须确认：

1. 官鬼、世、应、父母、子孙职责分层，不再使用 legacy 单用神简化；
2. `litigation_outcome`、`dispute_resolution_outcome`、`dispute_counterparty_action` 的 current target 已区分；
3. counterparty action 只有在 bounded dispute + explicit action 下才允许应升 Primary；
4. debt_collection / commercial / marital / career / legal information 边界固定；
5. represented dispute subject 首轮不得默认为世；
6. Assessment 与 Time Fact 不写入 Rule Registry；
7. 当前 22-route baseline 不变。

当前：

```text
ruleCandidateReviewReady = true
formalRuleRegistryReady = false
semanticTrainingReady = false
```