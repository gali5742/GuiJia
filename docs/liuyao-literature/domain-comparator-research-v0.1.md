# 龟甲 · 六爻 Domain Comparator 研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_design_ready_no_active_comparator`

上游：

- `choice-suitability-shared-architecture-v0.1.md`
- `choice-normalized-assessment-preference-policy-research-v0.1.md`
- `data/liuyao-domain-comparator-contract-v0.1.json`
- `liuyao-time-assessment.js`
- `liuyao-observation-plan.js`
- `liuyao-interpretation.js`

边界：

```text
只处理未来 Choice / Suitability 的 per-dimension Comparator 契约。
不修改 current-22。
不修改 v0.11 / v0.12 sealed behavior。
不修改 Time Engine。
不注册任何 active ordering comparator。
不输出 winner / overallRecommendation / scalarScore / probability。
```

---

# 1. 本专项要解决的问题

Choice 架构已经能够形成：

```text
Alternative
→ Theme Adapter
→ Provider Requirement / Observation Plan
→ Dimension Evidence
→ Normalized Dimension Assessment
```

但仍缺：

```text
Dimension Assessment A
vs
Dimension Assessment B
→ 是否可比？
→ 若可比，允许什么关系？
```

这里最危险的实现方式是直接写：

```text
supportive > mixed > adverse
```

或：

```text
support evidence 更多的一方更好
```

这两种方式都会把尚未审核的价值排序偷偷塞进 Shared Choice 层。

因此 Comparator 必须被定义成独立、可注册、Domain-owned 的契约。

---

# 2. 现有仓库并不存在通用 Outcome Assessment Engine

## 2.1 `liuyao-observation-plan.js`

职责是：

```text
Observation Rule
→ selector / resolver
→ concrete line target
```

它回答：

```text
观察谁 / 什么？
```

不回答：

```text
结果更好还是更差？
```

因此 ObservationPlan 不能作为 Comparator 输入。

## 2.2 `liuyao-time-assessment.js`

该模块将 TimeEffect 整理为：

```text
support
peer
constraint
outflow
exertion
trigger
```

它是结构化时间作用描述，不是 Outcome Assessment。

更重要的是，它的 validator 主动拒绝：

```text
supportive
adverse
preferred
caution
```

等旧评价 token。

这意味着未来 Choice Comparator 不能把 Time Assessment 偷改造成：

```text
support 多 → preferred
constraint 多 → adverse
```

## 2.3 `liuyao-interpretation.js`

解释层会为了 learner-facing 文本把部分材料组织为 support / constraint 等组别，也存在解释 priority。

但：

```text
Interpretation priority
≠ Assessment severity
≠ Cross-alternative order
```

解释生成的排序、标题优先级、证据条数，都不能成为 Comparator 的隐藏输入。

---

# 3. Normalized Assessment 与 Time Assessment 不得混淆

已有 Choice policy 定义过：

```text
assessmentStatus:
  supportive_evidence
  adverse_evidence
  mixed_evidence
  insufficient_evidence
  not_assessed
```

这些字段只是未来某个 Domain Assessment contract 的**规范化状态容器**。

它不意味着 Shared Choice 已经拥有：

```text
supportive_evidence > mixed_evidence > adverse_evidence
```

的全局顺序。

同样，它也不与 `liuyao-time-assessment.js` 禁止 legacy evaluative token 冲突：

```text
Time Assessment
→ 时间作用结构

Domain Outcome Assessment
→ 未来经审核的领域结果状态
```

二者不是同一层。

---

# 4. Comparator 输入必须携带显式语义

最初 comparator JSON 草案存在一个 contract hole：

算法要求：

```text
same assessmentContractFamily
same / compatible semanticMeaning
```

但输入必填字段没有这两个值。

这会迫使实现从：

```text
contractRef = employment_retention_assessment_v0.1
```

这种字符串名字里猜：

```text
family = employment_retention
meaning = current_job_stability
```

这属于隐式语义，不可接受。

因此 v0.1 已修正为显式要求：

```ts
{
  alternativeId,
  dimensionId,
  semanticMeaning,
  resolutionStatus,
  assessmentStatus,
  contractFamily,
  contractRef,
  contractVersion,
  evidenceRefs
}
```

正式原则：

```text
contractFamily must not be inferred from contractRef
semanticMeaning must not be inferred from dimensionId
```

---

# 5. 同名 dimension 不等于可比

例如：

```text
dimensionId = target_outcome
```

可能分别表示：

```text
当前职位能否保留
新职位能否取得
学校能否录取
诉讼目标能否实现
```

这些即使最终都被归入 `target_outcome`，也不意味着共享同一 Assessment family。

因此：

```text
same dimensionId
```

只是必要条件，不是充分条件。

还必须同时满足：

```text
same semanticMeaning
same reviewed contractFamily
compatible contractVersion
both resolved
registered comparator exists
```

---

# 6. Comparator 是 Domain-owned，不是 Shared-owned

未来 comparator registration 必须声明：

```ts
{
  comparatorRef,
  version,
  dimensionId,
  assessmentContractFamily,
  compatibleAssessmentVersions,
  semanticMeaning,
  inputStatusesAllowed,
  relationVocabulary,
  reviewRefs
}
```

Shared Choice 层只允许：

```text
lookup comparator
→ validate compatibility
→ invoke registered relation rule
```

Shared 层不得自行定义：

```text
supportive > mixed > adverse
high > medium > low
证据多 > 证据少
旺 > 衰
```

---

# 7. v0.1 为什么必须零 active comparator

当前 candidate dimension readiness：

## `target_outcome`

阻断：

```text
不同 Domain 尚无统一、经审核的 normalized Outcome Assessment family
```

## `stability`

阻断：

```text
current employment retention
与
prospective employment stability
```

Assessment 成熟度不对称。

## `livelihood`

应优先来自：

```text
salary / income continuity / cash runway
```

等事实或 finance provider。

## `institution_fit`

Institution Resolver 与 institution-fit Assessment 尚不完整。

## `resolution_feasibility`

这是最接近未来 comparator 的候选之一，但仍缺：

```text
versioned dispute-resolution Assessment contract
```

## `legal_exposure`

v0.1 强制：

```text
modern legal fact provider only
```

不得使用六爻 Evidence 替代现实法律风险判断。

## `financial_cost`

精确金钱成本属于 factual / finance provider。

## `time_cost`

现有 Time Assessment 不是 duration-cost contract，禁止挪用。

## `risk`

事业、教育、诉讼中的 risk 语义不同，不存在全局 risk comparator。

因此当前最稳健状态是：

```text
activeComparators = []
```

---

# 8. Safe Refusal 是正式行为，不是临时 fallback

当两个 Assessment 都 resolved，但没有注册 comparator 时：

```ts
{
  comparisonStatus:'incomparable',
  relation:null,
  reason:'comparator_not_registered'
}
```

不能 fallback 到：

```text
assessmentStatus 字面顺序
Evidence 数量
TimeEffect 数量
line score
interpretation priority
source count
```

因此：

```text
resolved
≠ comparable
```

是 Comparator v0.1 最重要的行为之一。

---

# 9. Partial / unresolved 的处理

如果任一 Alternative 的该 dimension：

```text
resolutionStatus = partial
```

输出应保留：

```text
comparisonStatus = partial
```

如果：

```text
resolutionStatus = unresolved
```

则：

```text
comparisonStatus = unresolved
```

不能因为另一边完整就把不完整的一边默认判负。

尤其禁止：

```text
missing evidence = adverse
unresolved = worse
partial = lower score
```

---

# 10. High-stakes factual dimension 的硬边界

尤其是：

```text
legal_exposure
```

即使未来 litigation divination Assessment 更成熟，也不能把它变成现实法律风险替代品。

Choice Adapter 可以要求：

```text
providerTheme = legal_facts
```

但 Shared Comparator 不允许把：

```text
官鬼旺衰
世应关系
六冲六合
```

转换成：

```text
胜诉概率
刑责概率
赔偿金额
法律建议
```

同理：

```text
salary amount
exact financial cost
travel duration
```

也应优先由对应事实 Provider 提供。

---

# 11. Future Comparator Activation Gate

某个 comparator 未来要进入 active，至少需要：

```text
1. Domain Assessment contract 已完成研究与 review
2. Assessment schema 已版本化
3. semanticMeaning 明确
4. contractFamily 明确
5. exact dimension ordering semantics 已 review
6. mixed / partial / unresolved regression 已覆盖
7. comparator 不依赖 Evidence 数量或 raw TimeEffect 数量
8. 不替代高风险现实事实判断
9. 不改变 current-22 冻结行为
```

如果是跨 contract version：

还必须显式声明：

```text
compatibleAssessmentVersions
```

不能默认“版本号接近所以兼容”。

---

# 12. 与未来 Aggregation 的关系

Comparator 只回答：

```text
某一 dimension 上，A 与 B 的关系能否被审核地表达？
```

它不回答：

```text
综合起来选谁？
```

因此：

```text
Comparator
≠ Aggregator
≠ Recommendation Engine
```

即使未来所有 requested dimensions 都拥有 comparator，也仍需要独立的：

```text
Aggregation Policy Research
```

才能讨论：

```text
conditionalRecommendation
```

当前 Winner Policy 继续保持：

```text
overallRecommendation = null
winner = null
scalarScore = null
```

---

# 13. v0.1 Regression 必须证明什么

isolated safe-refusal regression 至少要证明：

```text
resolved + resolved + no comparator
→ incomparable

supportive_evidence vs adverse_evidence
→ 不自动排序

3 evidence vs 1 evidence
→ 不自动排序

dimension mismatch
→ incomparable

semanticMeaning mismatch
→ incomparable

contractFamily mismatch
→ incomparable

partial
→ partial

unresolved
→ unresolved

scalarScore / probability / winner leakage
→ invalid input
```

这一组测试的成功标准不是“多 resolve”，而是：

```text
拒绝错误比较
```

---

# 14. 当前结论

Comparator v0.1 当前成熟度：

```text
input contract                  = ready
semantic meaning explicit       = ready
contract family explicit        = ready
comparability validation        = ready for isolated implementation
safe refusal policy             = ready
active comparator registry      = empty by design
ordering semantics              = not registered
aggregation                     = separate stage
winner                          = forbidden
formal runtime integration      = blocked by v0.13 gate
```

因此当前正确下一步是：

```text
isolated Comparator Safe-Refusal Contract
↓
regression
↓
Aggregation / Recommendation Readiness Review
```

而不是现在发明一个“谁更好”的排序算法。
