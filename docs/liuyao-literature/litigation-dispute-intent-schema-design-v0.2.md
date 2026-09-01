# 龟甲 · 六爻 Litigation / Dispute Intent Schema Design v0.2

日期：2026-09-01

状态：`design_only_ready_v0.2`

主题：`litigation_dispute`

基础：`litigation-dispute-intent-schema-design-v0.1.md`

专项上游：

- `litigation-proceeding-acceptance-research-v0.1.md`
- `litigation-proceeding-acceptance-rule-review-v0.1.md`

> v0.2 只解除 `proceeding_acceptance` 的 Schema 暂缓。当前仍不修改正式 `liuyao-intent.js`、Router、Rule Registry、current-22 或训练数据。

---

# 1. Supported Duties 更新

v0.2 首轮 supported duties：

```text
litigation_outcome
dispute_resolution_outcome
dispute_counterparty_action
proceeding_acceptance
```

继续 deferred：

```text
settlement_suitability
litigation_strategy
generic_dispute_state
```

---

# 2. Current Target Aspect 更新

新增：

```ts
semantics.currentTargetAspect:
  | 'formal_proceeding_outcome'
  | 'dispute_resolution'
  | 'counterparty_action'
  | 'proceeding_acceptance'
  | 'debt_recovery'
  | 'commercial_performance'
  | 'relationship_status'
  | 'employment_status'
  | 'compensation_amount'
  | 'legal_information_or_procedure'
  | 'unknown'
```

当：

```text
disputeDuty = proceeding_acceptance
```

必须：

```text
currentTargetAspect = proceeding_acceptance
```

---

# 3. Acceptance Target Aspect

新增纯现代语义字段：

```ts
acceptanceContext: {
  targetAspect:
    | 'institutional_acceptance'
    | 'filing_document_acceptance'
    | 'evidence_admission'
    | 'unknown'
  filingStage:
    | 'initial_filing'
    | 'arbitration_filing'
    | 'appeal_filing'
    | 'refiling'
    | 'supplementary_filing'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

Semantic 层只描述现实 target，不输出：

```text
官鬼
父母
```

---

# 4. Institutional Acceptance

例：

```text
法院会不会正式立案？
仲裁委员会会不会受理我的申请？
这次上诉会不会被受理？
```

Intent：

```js
{
  event:{ type:'litigation_dispute' },
  goals:[{ type:'outcome' }],
  semantics:{
    disputeDuty:'proceeding_acceptance',
    currentTargetAspect:'proceeding_acceptance'
  },
  acceptanceContext:{
    targetAspect:'institutional_acceptance',
    filingStage:'initial_filing',
    specificity:'context_bounded'
  }
}
```

传统层后续使用 `TR-LD-002-A`，但 Intent 本身不包含 selector。

---

# 5. Filing Document Acceptance

例：

```text
我的诉状材料会不会被退回？
补交的立案申请书能不能被接收？
```

Intent：

```js
{
  event:{ type:'litigation_dispute' },
  goals:[{ type:'outcome' }],
  semantics:{
    disputeDuty:'proceeding_acceptance',
    currentTargetAspect:'proceeding_acceptance'
  },
  acceptanceContext:{
    targetAspect:'filing_document_acceptance',
    filingStage:'supplementary_filing',
    specificity:'context_bounded'
  }
}
```

传统层后续使用 `TR-LD-002-B`。

---

# 6. Evidence Admission 继续 Deferred

```text
这份证据会不会被法官采纳？
```

Semantic 可以识别：

```text
acceptanceContext.targetAspect = evidence_admission
```

但必须：

```text
ruleStatus = deferred
```

不得偷用 proceeding acceptance 的官父规则。

---

# 7. Proceeding Context 与 Acceptance Context 分责

```text
proceedingContext
→ 是什么争讼程序、当前处于什么现实阶段

acceptanceContext
→ 用户现在问的是“程序被受理”还是“文书被接受”
```

例如：

```text
proceedingContext.type = lawsuit
proceedingContext.status = filed
acceptanceContext.targetAspect = institutional_acceptance
```

表示：

```text
诉状已经提交，当前问法院是否正式立案
```

而：

```text
proceedingContext.type = lawsuit
proceedingContext.status = contemplated
acceptanceContext.targetAspect = filing_document_acceptance
```

可以表示：

```text
准备提交某份诉状，当前问材料本身能否被接收
```

---

# 8. Filing Context

为了避免从“法院受理”自由猜具体材料，新增：

```ts
filingContext: {
  relevance:
    | 'explicit'
    | 'structurally_implied'
    | 'not_indicated'
    | 'unknown'
  text?: string
}
```

解释：

### explicit

```text
诉状
仲裁申请书
上诉状
补正材料
```

明确出现。

### structurally_implied

用户问：

```text
法院会不会正式立案？
```

虽然没有说“诉状”，但“正式立案”这一受理事件结构本身已经包含 filing responsibility。

该状态来自确定性 Event Contract，不是模型自由联想。

### not_indicated / unknown

不得用于正式 proceeding acceptance rule。

---

# 9. Minimal Sufficiency

`proceeding_acceptance` 至少要求：

```text
event = litigation_dispute
goal = outcome
disputeDuty = proceeding_acceptance
currentTargetAspect = proceeding_acceptance
disputeSubject = self
proceedingContext.specificity = specific | context_bounded
acceptanceContext.specificity = specific | context_bounded
acceptanceContext.targetAspect = institutional_acceptance | filing_document_acceptance
filingContext.relevance = explicit | structurally_implied
```

如果：

```text
acceptanceContext.targetAspect = unknown
```

则：

```text
Semantic litigation event = resolved
Traditional acceptance plan = unresolved
```

---

# 10. Filing Stage

首轮允许：

```text
initial_filing
arbitration_filing
appeal_filing
refiling
supplementary_filing
```

它只表达现代流程，不改变传统 selector。

其中：

```text
arbitration_filing
appeal_filing
```

属于 modern semantic mapping；不得声称古籍直接讨论现代制度名称。

---

# 11. Expected State

新增：

```ts
expectedState:
  | 'favorable_proceeding_outcome'
  | 'dispute_resolved'
  | 'counterparty_action_occurs'
  | 'proceeding_accepted'
  | 'filing_document_accepted'
  | 'unknown'
```

映射：

```text
institutional_acceptance
→ proceeding_accepted

filing_document_acceptance
→ filing_document_accepted
```

Expected State 仍只是用户所问方向，不是结果预测。

---

# 12. Hard Boundaries

```text
怎么立案 / 哪个法院管辖 / 费用多少
→ legal_information_or_procedure

案件已经受理，最后能不能赢
→ litigation_outcome

欠款最终能不能收回来
→ debt_collection

证据会不会被法院采信
→ evidence_admission / deferred
```

关键词：

```text
立案
受理
法院
仲裁
```

都不能覆盖 current target。

---

# 13. 当前状态

```text
proceedingAcceptanceLiterature = completed_and_reviewed
proceedingAcceptanceRuleReview = complete
intentSchemaDesign = design_only_ready_v0.2
proceedingAcceptanceSchema = ready

evidenceAdmission = deferred
settlementSuitability = deferred
litigationStrategy = deferred

formalIntentImplementation = blocked_by_current_semantic_gate
formalRuleRegistryImplementation = blocked_by_current_semantic_gate
semanticTraining = false
currentRoute = false
```

下一步允许建立 isolated / unreachable proceeding-acceptance contract。