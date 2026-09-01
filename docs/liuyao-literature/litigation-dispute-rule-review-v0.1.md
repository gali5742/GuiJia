# 龟甲 · 六爻诉讼纠纷 Rule Review v0.1

日期：2026-09-01

状态：`rule_review_complete`

输入：

- `docs/liuyao-literature/litigation-dispute-research-v1.0.md`
- `docs/liuyao-literature/litigation-dispute-rule-candidates-v0.1.md`
- `js/liuyao-rule-registry.js`
- `js/liuyao-observation-plan.js`
- 《龟甲 · 六爻复合观察与取用规则规范 v0.2（草案）》

> 本文件完成 Candidate 的职责审计与 Observation Rule 设计，不修改正式 Rule Registry，不晋升 Semantic Route。

---

# 1. Review 总结

15 条 Candidate 不能变成 15 条 Observation Rule。

最终结构应为：

```text
3 个首轮 Base Observation Rules
+
条件 Document / Resolution Domain Observations
+
独立 Litigation Assessment Evidence
+
若干 deferred resolver / duty
```

首轮 Base Rules：

```text
TR-LD-001-A  litigation_outcome
TR-LD-001-B  dispute_resolution_outcome
TR-LD-001-C  dispute_counterparty_action
```

最大的结构修正是：

```text
诉讼 ≠ 官鬼单用神
```

而是保留：

```text
Proceeding
Self Party
Counterparty
Document
Resolution Support
```

不同现实职责。

---

# 2. Candidate 最终去向

| Candidate | Review 去向 |
|---|---|
| RC-LD-001 self party | Base Rule role |
| RC-LD-002 counterparty | Base Rule role / counterparty-action primary |
| RC-LD-003 proceeding / adjudication | Base Rule primary / domain |
| RC-LD-004 case documents | conditional Domain |
| RC-LD-005 resolution support | resolution Domain / Evidence |
| RC-LD-006 litigation outcome architecture | Base Rule A |
| RC-LD-007 resolution architecture | Base Rule B |
| RC-LD-008 counterparty action | Base Rule C |
| RC-LD-009 party relation | Assessment Evidence |
| RC-LD-010 institutional pressure | Assessment Evidence |
| RC-LD-011 party void / retreat | Assessment Evidence |
| RC-LD-012 proceeding acceptance | deferred duty |
| RC-LD-013 debt boundary | Intent boundary |
| RC-LD-014 commercial boundary | Intent boundary |
| RC-LD-015 cross-theme / represented | Intent / resolver boundary |

---

# 3. Base Rule A · Litigation Outcome

设计：

```text
TR-LD-001-A
appliesTo:
  event = litigation_dispute
  disputeDuty = litigation_outcome
  currentTargetAspect = formal_proceeding_outcome
```

Observation Plan：

```text
Primary
→ 官鬼
→ formal_proceeding_or_adjudication
→ required

Role
→ 世
→ self_party
→ required

Role
→ 应
→ counterparty
→ required
```

若 Semantic 明确存在案件文书 / 证据职责：

```text
Domain
→ 父母
→ case_document_or_evidence
→ optional
```

### 为什么官鬼是 Primary，但不能单独判胜负

官鬼回答：

```text
当前官司 / 仲裁 / 裁判程序本体如何
```

而胜负必须继续保留：

```text
Self ↔ Counterparty
Proceeding ↔ Self
Proceeding ↔ Counterparty
```

所以 Base Rule 的官鬼 Primary 是“事项本体”，不是“胜负标签生成器”。

---

# 4. Base Rule B · Dispute Resolution Outcome

设计：

```text
TR-LD-001-B
appliesTo:
  event = litigation_dispute
  disputeDuty = dispute_resolution_outcome
  currentTargetAspect = dispute_resolution
```

Observation Plan：

```text
Primary
→ 官鬼
→ active_dispute_or_proceeding
→ required

Role
→ 世 / self_party
→ required

Role
→ 应 / counterparty
→ required

Domain
→ 子孙
→ settlement_or_dissipation_support
→ optional
```

若文书 / 撤诉手续现实职责明确，再追加父母 Domain。

Resolution Assessment 独立消费：

```text
世应生合 / 比和
世应冲克刑害
世空 / 应空
子孙相关 Evidence
官鬼是否继续形成制度压力
```

禁止：

```text
子孙出现 = 自动 settled
```

---

# 5. Base Rule C · Dispute Counterparty Action

设计：

```text
TR-LD-001-C
appliesTo:
  event = litigation_dispute
  disputeDuty = dispute_counterparty_action
  currentTargetAspect = counterparty_action
```

Observation Plan：

```text
Primary
→ 应
→ counterparty_action_target
→ required

Role
→ 世
→ self_party
→ required
```

如果当前仍有 bounded formal dispute / proceeding：

```text
Domain
→ 官鬼
→ formal_proceeding_context
→ optional
```

如果所问行动是：

```text
settle
withdraw
```

可追加：

```text
Domain
→ 子孙
→ settlement_or_withdrawal_context
→ optional
```

文书职责明确时再追加父母。

### 为什么应可以成为 Primary

这是 current-target 原则的直接结果：

```text
“对方会不会主动和解？”
```

当前问题不是“官司总体走势”，而是：

```text
opponent action
```

因此应从 Role 升为该职责的 Primary 是合理的；官鬼保留争讼背景，不再霸占 Primary。

---

# 6. 为什么不需要一个统一 `TR-LITIGATION`

如果只登记：

```text
litigation_dispute
→ 官鬼 + 世 + 应
```

会丢掉：

```text
当前问胜负
当前问和解
当前问对方行动
```

之间的 semantic duty。

尤其 counterparty action 会被错误继续以官鬼作为 Primary。

所以三条 Base Rule 虽共享部分对象，但必须分别保留 semantic duty。

---

# 7. Document Context 只做条件 Domain

建议 augmentation：

```text
AR-LD-001-DOCUMENT
```

触发条件：

```text
documentContext.relevance
= explicit | context_supported
```

Observation：

```text
父母
→ case_document_or_evidence
→ source = domain
→ required = false
```

禁止：

```text
案件必然有文件
→ 所有 litigation plan 默认加父母
```

因为 Observation Plan 只保留对当前问题有现实职责的对象，不是古典类象百科罗列。

---

# 8. Proceeding Acceptance 暂不登记 Base Rule

研究支持一个独立职责：

```text
能否立案
能否受理
仲裁申请会不会被接受
```

传统结构具有：

```text
父母 / 状词文书
+
官鬼 / 官府程序
```

的复合证据。

但正式实现前还需要：

```text
proceeding status
filing target
submission vs acceptance
```

现代 Schema 审核。

因此：

```text
proceeding_acceptance = deferred
```

不能直接拿 `litigation_outcome` 顶替。

---

# 9. Strategy / Suitability 不属于 Outcome Rule

继续不登记：

```text
settlement_suitability
litigation_strategy
```

对应：

```text
要不要起诉
要不要上诉
该不该接受和解
```

这些是选择 / 策略职责，不是：

```text
结果会怎样
是否能和解
对方会怎么做
```

直接复用 outcome 规则会把价值判断、风险承受与结果预测混在一起。

---

# 10. Represented Litigation 首轮不自动化

首轮要求：

```text
disputeSubject.relationToQuerent = self
```

若：

```text
替父母问官司
替子女问官司
替公司问诉讼
```

Semantic 可以识别，但 Traditional Observation 应：

```text
unresolved / deferred
```

原因：需要先解析实际己方 Subject，再定义它与 counterparty 的角色结构；不能继续套：

```text
世 = 实际涉讼人
```

---

# 11. Litigation Assessment Evidence 不进入 Rule Registry

以下全部属于未来 `LitigationAssessmentEvidence`：

```text
世应旺衰
世应生合 / 比和 / 冲克刑害
世克应 / 应克世
官鬼对世 / 应的生克
父母文书状态
子孙 resolution support
世空 / 应空
应动
```

建议输出类似：

```ts
interface LitigationAssessmentEvidence {
  type: string
  duty: string
  subjectRef?: string
  polarity: string
  factRefs: string[]
  ruleRef: string
}
```

并强制：

```text
finalAssessment = null
scoring = null
```

直到专门 Assessment 层综合。

---

# 12. Cross-route Gate

正式 Intent 必须在 Rule Registry 之前完成以下 current-target 分流：

```text
debt_recovery
→ debt_collection

commercial_performance
→ commercial route

relationship_status
→ relationship / marital

employment_status
→ career_position

compensation_amount
→ finance / income / debt according to target

legal_information_or_procedure
→ unsupported informational / procedural target
```

只有：

```text
formal_proceeding_outcome
dispute_resolution
counterparty_action within bounded dispute
```

进入本主题首轮 Rule Selection。

---

# 13. Source Registry Gap

正式将 `EV-LD-*` 写入 `liuyao-rule-registry.js` 前，需要增加实际采用来源：

```text
火珠林
断易天机
易隐
黄金策 / 卜筮全书 lineage
```

以及已存在 / 现代来源：

```text
朱辰彬《古筮真诠》
```

并记录《黄金策》《卜筮全书》《卜筮正宗》之间的文本承接，避免 evidence tier 虚高。

---

# 14. Review 最终结论

可进入 Schema / isolated implementation：

```text
TR-LD-001-A litigation_outcome
TR-LD-001-B dispute_resolution_outcome
TR-LD-001-C dispute_counterparty_action
AR-LD-001-DOCUMENT
```

只保留 design / deferred：

```text
proceeding_acceptance
settlement_suitability
litigation_strategy
represented_dispute_subject
generic_dispute_state
```

当前：

```text
ruleReview = complete
formalRuleRegistryReady = false
semanticTrainingReady = false
currentRoute = false
```