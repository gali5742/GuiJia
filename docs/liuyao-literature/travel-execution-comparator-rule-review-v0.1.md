# 龟甲 · 六爻 Travel Execution Domain Comparator Rule Review v0.1

日期：2026-09-01

状态：`comparator_rule_review_complete_isolated_candidate_only`

上游：

- `travel-execution-assessment-rule-review-v0.1.md`
- `travel-execution-assessment-pretraining-implementation-v0.1.md`
- `domain-comparator-research-v0.1.md`
- `data/liuyao-domain-comparator-contract-v0.1.json`

边界：

```text
只比较同一 travel_execution_assessment family。
只比较 semanticMeaning = journey_execution_outcome。
不注册 shared ACTIVE_COMPARATORS。
不聚合多个 dimension。
不输出 winner / overallRecommendation / score / probability。
```

---

# 1. 为什么现在可以审一个 narrow comparator

`AE-TV-EXEC-001` 已将 Travel Execution 的 Evidence 经过 Domain-owned rule 归一为：

```text
supportive_evidence
adverse_evidence
mixed_evidence
insufficient_evidence
```

并且该 Assessment contract 明确：

```text
supportive_evidence
= 至少存在已审核 execution-support Evidence，且不存在已审核 execution-adverse Evidence

adverse_evidence
= 至少存在已审核 execution-adverse Evidence，且不存在已审核 execution-support Evidence

mixed_evidence
= 两类均存在

insufficient_evidence
= 输入已解析，但没有已审核 direction Evidence
```

因此可以研究**同一 contract family 内**哪些状态关系具有足够语义支持。

---

# 2. Comparator Identity

候选：

```text
CP-TV-EXEC-001
```

绑定：

```text
dimensionId = target_outcome
semanticMeaning = journey_execution_outcome
assessmentContractFamily = travel_execution_assessment
compatibleAssessmentVersions = [0.1]
```

不能应用于：

```text
travel_safety
travel_disruption_journey
travel_disruption_transport
career target_outcome
study target_outcome
litigation target_outcome
```

即使它们也使用 `target_outcome` 标签。

---

# 3. 可以确定方向的唯一异状态组合

首轮只承认：

```text
supportive_evidence
vs
adverse_evidence
```

具有方向。

因为两者在同一 Assessment contract 下分别明确表示：

```text
只有已审核 execution support direction
```

与：

```text
只有已审核 execution adverse direction
```

所以：

```text
supportive_evidence vs adverse_evidence
→ left_preferred_on_dimension

adverse_evidence vs supportive_evidence
→ right_preferred_on_dimension
```

这里的 preferred 只表示：

```text
在 journey_execution_outcome 这一维上，当前 contract 的 direction state 更有利
```

不表示：

```text
总体应该选择该行程
成功概率更高多少
现实风险更低
```

---

# 4. 为什么不定义 supportive > mixed > adverse

`mixed_evidence` 只说明：

```text
support + adverse 均存在
```

它没有表达：

```text
哪个更强
哪个更重要
哪条 Evidence 权重更高
```

例如：

```text
A = supportive_evidence
B = mixed_evidence
```

不能因为 B 有 adverse 就自动判 A 更好；B 可能同时有大量强支持，但当前 contract 故意不计权。

反过来也不能说 mixed 比 adverse 好。

因此：

```text
supportive vs mixed
adverse vs mixed
mixed vs supportive
mixed vs adverse
```

全部：

```text
comparisonStatus = comparable
relation = mixed_no_order
```

这里 `comparable` 只表示两边 contract compatible、Comparator 可以合法阅读它们；`mixed_no_order` 表示不产生 strict ordering。

---

# 5. Same-state Comparison

对于：

```text
supportive vs supportive
adverse vs adverse
```

允许：

```text
relation = indistinguishable_on_dimension
```

其含义严格限定为：

```text
当前 Assessment contract 的粗粒度状态无法区分两者
```

不是：

```text
两个行程现实条件完全一样
```

对于：

```text
mixed vs mixed
```

更保守地使用：

```text
mixed_no_order
```

因为两个 mixed packet 的支持/阻碍构成可能完全不同。

---

# 6. Insufficient Evidence 不进入排序

只要一边：

```text
assessmentStatus = insufficient_evidence
```

则：

```text
comparisonStatus = incomparable
relation = null
reason = insufficient_assessment_evidence
```

禁止：

```text
supportive > insufficient
insufficient > adverse
```

因为 insufficient 不是中性等级，它只是“没有足够方向性证据”。

---

# 7. Resolution Gate

Shared Comparator Contract 已规定：

```text
partial
unresolved
not_applicable
```

不能进入 strict ordering。

Travel comparator 同样继承：

```text
partial → partial
unresolved → unresolved
not_applicable → incomparable
```

不能把：

```text
unresolved = worse
```

---

# 8. Contract Compatibility Gate

必须全部一致：

```text
dimensionId = target_outcome
semanticMeaning = journey_execution_outcome
contractFamily = travel_execution_assessment
contractVersion = 0.1
resolutionStatus = resolved
```

否则拒绝。

尤其：

```text
same assessmentStatus
```

但 semanticMeaning 不同，也不能比较。

---

# 9. Forbidden Hidden Ranking

Comparator 不读取：

```text
evidenceRefs.length
reasonRefs.length
support evidence count
adverse evidence count
raw line score
TimeEffect count
source count
ignored Evidence count
```

也不读取用户 preference。

Preference 属于 Aggregation 层，不属于 per-dimension Comparator。

---

# 10. Output Contract

允许输出：

```ts
{
  comparatorRef:'CP-TV-EXEC-001'
  comparatorVersion:'0.1'
  dimensionId:'target_outcome'
  semanticMeaning:'journey_execution_outcome'
  comparisonStatus:
    | 'comparable'
    | 'partial'
    | 'unresolved'
    | 'incomparable'
  relation:
    | 'left_preferred_on_dimension'
    | 'right_preferred_on_dimension'
    | 'indistinguishable_on_dimension'
    | 'mixed_no_order'
    | null
  reasonRefs:string[]
}
```

禁止：

```text
winner
overallRecommendation
scalarScore
probability
```

---

# 11. Relation Matrix v0.1

| Left | Right | comparisonStatus | relation |
|---|---|---|---|
| supportive | adverse | comparable | left_preferred_on_dimension |
| adverse | supportive | comparable | right_preferred_on_dimension |
| supportive | supportive | comparable | indistinguishable_on_dimension |
| adverse | adverse | comparable | indistinguishable_on_dimension |
| mixed | mixed | comparable | mixed_no_order |
| supportive | mixed | comparable | mixed_no_order |
| mixed | supportive | comparable | mixed_no_order |
| adverse | mixed | comparable | mixed_no_order |
| mixed | adverse | comparable | mixed_no_order |
| insufficient | any | incomparable | null |
| any | insufficient | incomparable | null |

---

# 12. Why This Is Not a Global Comparator

该 matrix 的合法性完全依赖：

```text
AE-TV-EXEC-001
```

对四个 assessmentStatus 的具体语义定义。

所以不能抽象成：

```text
所有 supportive_evidence 都比 adverse_evidence 好
```

未来另一个 Domain 可以拥有同名 normalized status，但其 evidence semantics / duty 意义不同，必须重新 Review。

---

# 13. Review Result

允许 isolated 实现：

```text
CP-TV-EXEC-001
```

但：

```text
shared active comparator registration = no
current runtime = no
Choice winner = no
Aggregation = no
formal route = no
```

Regression 必须覆盖：

```text
supportive vs adverse 两方向
same-state coarse indistinguishability
mixed-no-order
insufficient incomparable
partial/unresolved/not_applicable
contract/dimension/semantic/version mismatch
Evidence count does not affect relation
no winner/score/probability leakage
```
