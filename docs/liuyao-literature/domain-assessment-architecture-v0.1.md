# 龟甲 · 六爻 Domain Assessment Architecture v0.1

日期：2026-09-01

状态：`completed_and_reviewed_design_ready_no_active_evaluator`

上游：

- `data/liuyao-domain-assessment-contract-v0.1.json`
- `domain-comparator-research-v0.1.md`
- `choice-normalized-assessment-preference-policy-research-v0.1.md`
- `js/liuyao-career-position-pretraining-v01.js`
- `js/liuyao-study-exam-pretraining-v01.js`
- `js/liuyao-travel-pretraining-v01.js`
- `js/liuyao-litigation-dispute-pretraining-v01.js`

边界：

```text
只定义 future Domain Evidence → Assessment 的架构。
不注册 active evaluator。
不修改 current-22。
不修改 Rule Registry。
不修改 Time Engine。
不输出 score / probability / winner / recommendation。
```

---

# 1. 为什么这一层现在成为真正瓶颈

Choice / Comparator 已经建立：

```text
Alternative
→ Dimension Assessment
→ Domain Comparator
```

的消费契约。

但回看各主题实际实现，发现 `Dimension Assessment` 并不存在统一生产链。

当前不是“Comparator 算法没写”的问题，而是：

```text
Evidence → Assessment
```

这一层在不同 Domain 的成熟度和语义都不一致。

---

# 2. 四个主题的实际成熟度审计

## 2.1 Career Position

`liuyao-career-position-pretraining-v01.js` 已有：

```text
Intent validation
ObservationPlan
traditional subject selection
semantic snapshot
```

但没有：

```text
buildCareerEvidence
buildCareerAssessment
```

所以当前 Career 不能直接产出 Choice `DimensionAssessment`。

## 2.2 Study Exam

`liuyao-study-exam-pretraining-v01.js` 同样已有：

```text
Intent validation
Study Subject resolver
ObservationPlan
semantic snapshot
```

但没有通用 Study Evidence builder，也没有 Assessment。

## 2.3 Travel

Travel 已有：

```text
buildTravelEvidence(intent, facts)
```

Evidence 示例：

```text
traveler_vitality + positive
traveler_void + negative
route_process_obstruction + negative
safety_support + positive
hazard_pressure + negative
transport_disruption + negative
```

但返回：

```text
finalAssessment = null
```

## 2.4 Litigation Dispute

Litigation 也已有 Evidence builder，但它的 polarity 明显不是简单二元：

```text
positive
negative
counterparty_support
counterparty_weakness
resolution_support
dispute_persistence
self_side_leverage
counterparty_leverage
negative_to_self
negative_to_counterparty
pressure_on_both
withdrawal_or_retreat_tendency
active_or_changing
```

同样：

```text
finalAssessment = null
scoring = null
```

---

# 3. 核心结论：不能建立 Shared Evaluator

如果现在做一个共享 evaluator：

```text
positive → supportive_evidence
negative → adverse_evidence
```

Travel 看似暂时能跑，但 Litigation 会立刻失真。

例如：

```text
counterparty_weakness
```

对：

```text
litigation_outcome
```

可能是 self-side favorable evidence；

但对：

```text
dispute_resolution_outcome
```

不一定与“更容易消解争议”同义。

同样：

```text
self_controls_counterparty
```

可能表示 leverage，却不能被 Shared 层直接翻译成：

```text
supportive_evidence
```

因此：

```text
Evidence polarity
≠ Assessment status
```

必须成为正式架构原则。

---

# 4. 正确结构

```text
Domain Evidence
↓
Domain-owned Evaluator
↓
Shared Assessment Envelope
↓
Domain Comparator
```

其中：

```text
Shared Assessment Envelope
```

只统一字段，不统一推理规则。

即：

```text
shared schema
≠ shared evaluator
```

---

# 5. Shared Assessment Envelope

v0.1 统一输出：

```ts
{
  assessmentRef:string
  assessmentVersion:string
  contractFamily:string

  eventType:string
  duty:string
  dimensionId:string
  semanticMeaning:string

  resolutionStatus:
    | 'resolved'
    | 'partial'
    | 'unresolved'
    | 'not_applicable'

  assessmentStatus:
    | 'supportive_evidence'
    | 'adverse_evidence'
    | 'mixed_evidence'
    | 'insufficient_evidence'
    | 'not_assessed'

  evidenceRefs:string[]
  reasonRefs:string[]

  unresolvedIssues?:object[]
  traceRefs?:string[]
  sourceTierRefs?:string[]
}
```

这里的：

```text
supportive_evidence / adverse_evidence / mixed_evidence
```

必须是**Domain evaluator 已审核后的输出**，不能由 Shared Envelope 自己根据 polarity 计算。

---

# 6. Evaluator Registration 必须绑定 duty + semanticMeaning

未来 active evaluator 不能只注册：

```text
eventType = litigation_dispute
```

或：

```text
dimensionId = target_outcome
```

而应绑定：

```text
eventType
duty
dimensionId
semanticMeaning
contractFamily
acceptedEvidenceSchemaRefs
outputAssessmentVersion
```

例如未来可能分别存在：

```text
litigation_outcome
→ formal_proceeding_outcome

vs

dispute_resolution_outcome
→ dispute_resolution_feasibility
```

即使都在 Litigation 主题中，也不是同一个 evaluator。

---

# 7. 不允许 Shared 层做的事

禁止：

```text
positive_count - negative_count
多数 polarity 投票
Evidence 条数比较
raw line score threshold
TimeEffect reasonCount
interpretation priority
source count
positive → supportive 的通用转换
negative → adverse 的通用转换
```

这些全部会制造隐藏评分或跨 duty 误读。

---

# 8. Missing Evaluator 的正式行为

若结构化 Evidence 已存在，但没有对应 active evaluator：

```ts
{
  resolutionStatus:'unresolved',
  assessmentStatus:'not_assessed',
  reason:'evaluator_not_registered'
}
```

不能：

```text
Evidence 看起来大体正面
→ supportive
```

也不能：

```text
无 evaluator
→ neutral
```

所以：

```text
Evidence available
≠ Assessment available
```

---

# 9. Partial / unresolved 保留

如果 Evidence builder 自己声明：

```text
subject unresolved
required fact missing
provider partial
```

Evaluator 不应补猜。

Assessment 应保留：

```text
resolutionStatus = partial | unresolved
assessmentStatus = insufficient_evidence | not_assessed
```

并携带：

```text
unresolvedIssues
```

不能将 missing 转为 adverse。

---

# 10. Time Engine 边界

Travel / Litigation Evidence 已经存在类似：

```text
note = time-fact-consumer-only
```

说明 Domain Evidence 可以消费：

```text
旬空
月破
日冲
```

等上游 Time Engine 已产事实。

但 Domain Assessment 不允许重新计算：

```text
月建 / 日辰 / 空破 / 应期
```

正式链路应是：

```text
Time Fact
→ Domain Evidence
→ Domain Assessment
```

而不是：

```text
Domain Assessment
→ 自己再算一次 Time
```

---

# 11. Assessment 与 Comparator 的接口

Comparator 已要求：

```text
alternativeId
dimensionId
semanticMeaning
resolutionStatus
assessmentStatus
contractFamily
contractRef
contractVersion
evidenceRefs
```

因此 Assessment Envelope 可以成为 Comparator 的直接上游，但字段映射必须显式：

```text
assessmentRef      → contractRef / assessment trace
assessmentVersion  → contractVersion
contractFamily     → contractFamily
semanticMeaning    → semanticMeaning
```

不允许 Comparator 再次从名字猜语义。

---

# 12. Assessment 不等于概率

即使某个 future evaluator 给出：

```text
assessmentStatus = supportive_evidence
```

也只表示：

```text
在该 duty + semanticMeaning + reviewed evidence contract 下，当前结构被归为 supportive evidence state
```

不表示：

```text
70% 会成功
```

所以 v0.1 明确禁止输出：

```text
probability
scalarScore
winner
overallRecommendation
```

---

# 13. First Evaluator 的选择标准

未来第一个真正 active 的 Domain evaluator 不应从“最容易写”出发，而应满足：

```text
1. Evidence schema 已稳定
2. duty 单一
3. semanticMeaning 单一
4. 文献 Rule Review 已完成
5. mixed evidence 有明确处理原则
6. unresolved 情况可审计
7. 不涉及高风险现代事实替代
```

按当前成熟度看：

```text
Travel 某些 narrow duty
```

可能比 Career/Study 更接近，因为它已有 Evidence builder；

但这只是工程成熟度判断，不代表可以未经 Rule Review 直接激活 evaluator。

Litigation 虽也已有 Evidence builder，但 polarity 语义最复杂，尤其不适合先做通用 evaluator。

---

# 14. 当前 Readiness

```text
Shared Assessment Envelope       = ready design-only
Shared Envelope Validator        = ready to implement isolated
Shared Evaluator                 = rejected
Domain Evaluator Registry        = ready design-only
Active Domain Evaluators         = 0
Career Evidence Builder          = missing
Study Evidence Builder           = missing
Travel Evidence Builder          = present
Litigation Evidence Builder      = present
Final Assessment implementations = absent
Comparator                       = safe-refusal only
Aggregation                      = blocked
Formal runtime integration       = blocked by v0.13 gate
```

---

# 15. Final Conclusion

当前下一步应实现：

```text
Shared Assessment Envelope Validator
+
Evaluator Registry Safe Refusal
```

而不是：

```text
Shared Evidence Scorer
```

这样才能保证未来每个 Domain evaluator 都必须显式经过：

```text
Evidence research
→ Assessment rule review
→ evaluator registration
→ regression
```

之后才进入 Comparator。
