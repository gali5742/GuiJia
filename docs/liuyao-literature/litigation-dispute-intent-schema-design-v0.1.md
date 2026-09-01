# 龟甲 · 六爻 Litigation / Dispute Intent Schema Design v0.1

日期：2026-09-01

状态：`design_only_ready`

主题：`litigation_dispute`

上游：

- `litigation-dispute-research-v1.0.md` — `completed_and_reviewed`
- `litigation-dispute-rule-candidates-v0.1.md` — `ready_for_rule_review`
- `litigation-dispute-rule-review-v0.1.md` — `rule_review_complete`

> 本文件只定义未来 Schema Contract。当前不得修改 `js/liuyao-intent.js`、当前 22-route inventory、Semantic Candidate、训练 / 校准 / blind 数据。

---

# 1. Schema 总原则

Semantic / Intent 层只回答现代现实问题：

```text
当前是否存在一个具体、有边界的诉讼 / 仲裁 / 争端？
用户问的是程序结果、争端能否解决，还是对方某个具体行动？
当前争端主体是不是问卦人本人？
对方是否明确？
是否存在文书 / 证据现实职责？
诉讼只是债务追收、合同履行、职位争议等其他目标的手段吗？
```

Intent 层绝不回答：

```text
官鬼是不是用神
世应谁强谁弱
父母是不是证据爻
子孙是不是和解爻
```

即：

```text
Modern Dispute Semantics
≠
Traditional Observation Selection
```

---

# 2. Event

未来统一：

```ts
event: {
  type:'litigation_dispute'
}
```

具体职责通过：

```ts
semantics.disputeDuty
```

表达。

---

# 3. Dispute Duty

建议：

```ts
semantics.disputeDuty:
  | 'litigation_outcome'
  | 'dispute_resolution_outcome'
  | 'dispute_counterparty_action'
  | 'proceeding_acceptance'
  | 'settlement_suitability'
  | 'litigation_strategy'
  | 'generic_dispute_state'
  | 'unknown'
```

首轮 supported：

```text
litigation_outcome
dispute_resolution_outcome
dispute_counterparty_action
```

Recognized but deferred：

```text
proceeding_acceptance
settlement_suitability
litigation_strategy
generic_dispute_state
```

这防止：

```text
能不能立案 → 偷偷变 litigation_outcome
该不该起诉 → 偷偷变 litigation_outcome
该不该接受和解 → 偷偷变 dispute_resolution_outcome
```

---

# 4. Current Target Aspect

建议：

```ts
semantics.currentTargetAspect:
  | 'formal_proceeding_outcome'
  | 'dispute_resolution'
  | 'counterparty_action'
  | 'debt_recovery'
  | 'commercial_performance'
  | 'relationship_status'
  | 'employment_status'
  | 'compensation_amount'
  | 'legal_information_or_procedure'
  | 'unknown'
```

这是本主题最重要的 route boundary 字段。

## formal_proceeding_outcome

```text
这个官司最后有没有胜算？
仲裁结果会不会支持我？
```

## dispute_resolution

```text
这件纠纷最后能不能和解？
双方能不能把官司撤掉？
```

## counterparty_action

```text
对方会不会主动和解？
对方会不会继续上诉？
```

## debt_recovery

```text
起诉以后欠款能不能要回来？
```

若钱能否收回是 current target：

```text
→ debt_collection
```

## commercial_performance

```text
对方会不会按合同交货？
```

若履约 / 交易本身是 current target：

```text
→ commercial route
```

## relationship_status

```text
我们最终会不会离婚？
```

若关系状态是 current target：

```text
→ marital / relationship
```

## employment_status

```text
劳动仲裁以后我的职位能不能保住？
```

若 employment retention 是 current target：

```text
→ career_position
```

## compensation_amount

钱的取得 / 数额是 current target 时，不能因诉讼背景自动进入 litigation。

## legal_information_or_procedure

```text
哪个法院管辖？
起诉流程怎么走？
诉讼费多少？
```

属于现代 information / procedure target，不进入占问 route。

---

# 5. Dispute Subject

建议：

```ts
disputeSubject: {
  text?: string
  relationToQuerent:
    | 'self'
    | 'represented'
    | 'organization'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

首轮传统规则要求：

```text
relationToQuerent = self
```

若：

```text
represented
organization
```

Semantic 可识别，但：

```text
traditionalSubjectResolution = deferred
```

不能把 actual party 默认为世。

---

# 6. Proceeding Context

建议：

```ts
proceedingContext: {
  type:
    | 'lawsuit'
    | 'arbitration'
    | 'formal_dispute'
    | 'pre_litigation_bounded_dispute'
    | 'unknown'
  status:
    | 'threatened'
    | 'contemplated'
    | 'filed'
    | 'accepted'
    | 'ongoing'
    | 'appeal'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

首轮要求：

```text
specific | context_bounded
```

泛泛：

```text
我最近会不会有官司？
人际纠纷怎么样？
```

不进入首轮传统 Rule Selection。

### arbitration

现代 `arbitration` 只在 Semantic 层映射为 formal adjudicative proceeding；它不产生新的传统六亲 selector。

---

# 7. Counterparty Context

建议：

```ts
counterpartyContext: {
  text?: string
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'none'
}
```

对于 `litigation_outcome` / `dispute_resolution_outcome`，bounded proceeding 已隐含双方结构；但 `dispute_counterparty_action` 首轮必须要求：

```text
counterparty specificity
= specific | context_bounded
```

不能用：

```text
“对方会怎么样？”
```

在没有明确 dispute context 时创建该 duty。

---

# 8. Counterparty Action

建议：

```ts
counterpartyAction: {
  type:
    | 'settle'
    | 'withdraw'
    | 'appeal'
    | 'continue_proceeding'
    | 'respond'
    | 'escalate'
    | 'other'
    | 'unknown'
}
```

例如：

```text
对方会不会主动和解？
→ settle

对方会不会上诉？
→ appeal

对方会不会继续追究？
→ continue_proceeding
```

该字段只描述现代 action，不输出应爻。

---

# 9. Resolution Context

建议：

```ts
resolutionContext: {
  type:
    | 'settlement'
    | 'mediation'
    | 'withdrawal'
    | 'termination'
    | 'general_resolution'
    | 'unknown'
}
```

它用于区分：

```text
最终谁赢
vs
是否会和解 / 撤诉 / 终止争端
```

不直接决定子孙 selector。

---

# 10. Document Context

建议：

```ts
documentContext: {
  relevance:
    | 'explicit'
    | 'context_supported'
    | 'not_indicated'
    | 'unknown'
  text?: string
}
```

只有当前问题真正涉及：

```text
诉状
证据
合同
案卷
正式书面材料
```

或上下文已验证其现实职责时，后续 Observation Rule 才可追加父母 Domain。

不能因为“官司一般都有证据”就默认：

```text
documentContext = explicit
```

---

# 11. Goal / Expected State

首轮沿用：

```text
goals: [{ type:'outcome' }]
```

建议 expectedState：

```ts
expectedState:
  | 'favorable_proceeding_outcome'
  | 'dispute_resolved'
  | 'counterparty_action_occurs'
  | 'unknown'
```

映射：

```text
litigation_outcome
→ favorable_proceeding_outcome

dispute_resolution_outcome
→ dispute_resolved

dispute_counterparty_action
→ counterparty_action_occurs
```

注意：`favorable` 是用户所问方向的 expected state，不是 Semantic 层已经判断结果有利。

---

# 12. Minimal Sufficiency

Global 首轮至少：

```text
event = litigation_dispute
goal = outcome
disputeSubject = self
proceedingContext.specificity = specific | context_bounded
disputeDuty = supported duty
currentTargetAspect matches duty
```

## 12.1 Litigation Outcome

要求：

```text
disputeDuty = litigation_outcome
currentTargetAspect = formal_proceeding_outcome
proceedingContext.type = lawsuit | arbitration | formal_dispute
```

`pre_litigation_bounded_dispute` 不足以进入诉讼胜负规则。

## 12.2 Dispute Resolution Outcome

要求：

```text
disputeDuty = dispute_resolution_outcome
currentTargetAspect = dispute_resolution
proceedingContext.type = lawsuit | arbitration | formal_dispute | pre_litigation_bounded_dispute
```

因此正式立案前、但已经有明确双方和边界的争端可以问“能否和解”。

## 12.3 Dispute Counterparty Action

要求：

```text
disputeDuty = dispute_counterparty_action
currentTargetAspect = counterparty_action
counterpartyContext = specific | context_bounded
counterpartyAction.type != unknown
bounded dispute context exists
```

---

# 13. Route-sufficient but Rule-insufficient

必须允许：

```text
Semantic event = litigation_dispute
Traditional plan = deferred / unresolved
```

例如：

```text
我替哥哥问这个官司结果怎么样？
```

Semantic 可明确：

```text
disputeDuty = litigation_outcome
disputeSubject = represented
```

但 traditional subject resolver 尚未完成，因此不能把世硬当哥哥。

同理：

```text
这个诉状会不会被法院受理？
```

可识别：

```text
disputeDuty = proceeding_acceptance
```

但首轮 Rule 仍 deferred。

---

# 14. Hard Boundaries

必须以 current target 优先：

```text
欠款能否收回
→ debt_collection

交易 / 履约结果
→ commercial route

婚姻 / 关系状态
→ relationship / marital

职位保留 / 工作状态
→ career_position

工资、补偿、钱款取得
→ appropriate finance / income / debt route

法律规则、程序、费用咨询
→ unsupported informational / procedural target
```

`lawsuit / arbitration / lawyer / opponent` 等词不能覆盖 current target。

---

# 15. Recognized but Deferred Duties

```text
proceeding_acceptance
→ 文献成熟，但需独立现代 filing / acceptance Schema

settlement_suitability
→ choice / value judgment，不等于是否能和解

litigation_strategy
→ 起诉 / 上诉 / 继续追究策略，不等于 outcome

generic_dispute_state
→ 当前目标不足
```

---

# 16. Semantic Leakage Ban

Intent / Entity Provider 禁止输出：

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

合法 Semantic 输出例如：

```js
{
  event:{ type:'litigation_dispute' },
  semantics:{
    disputeDuty:'dispute_counterparty_action',
    currentTargetAspect:'counterparty_action'
  },
  counterpartyAction:{ type:'settle' }
}
```

而不是：

```js
{ useGod:'应爻' }
```

---

# 17. 当前状态

```text
literatureResearch = completed_and_reviewed
ruleReview = complete
intentSchemaDesign = design_only_ready

formalIntentImplementation = blocked_by_current_semantic_gate
formalRuleRegistryImplementation = blocked_by_current_semantic_gate
semanticTraining = false
currentRoute = false
```

下一步只允许做 isolated / unreachable pretraining contract implementation。