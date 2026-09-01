# 龟甲 · 六爻 Choice Normalized Assessment / Preference Policy 研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_design_ready_no_winner`

上游：

- `choice-suitability-shared-architecture-v0.1.md`
- `career-choice-suitability-adapter-research-v0.1.md`
- `study-education-choice-adapter-research-v0.1.md`
- `litigation-choice-strategy-adapter-research-v0.1.md`

> 本专项解决“不同 Alternative 的证据如何进入可审计 Comparison Frame”。它不发明统一吉凶分数，不输出 Winner，不修改 current-22。

---

# 1. 问题定义

共享 Choice v0.1 已经可以形成：

```text
Alternative A
→ Theme Adapter
→ ObservationPlan
→ Dimension Evidence

Alternative B
→ Theme Adapter
→ ObservationPlan
→ Dimension Evidence
```

但仍不能直接：

```text
Evidence A 看起来更好
→ A 更适合
```

原因至少有四类：

```text
1. 不同维度没有共同尺度
2. 同名维度可能来自不同 Assessment contract
3. partial / unresolved alternative 不应被强制排名
4. 用户价值偏好没有默认权重
```

---

# 2. Normalization 不等于数值化

本项目所谓：

```text
Normalized Assessment
```

第一阶段只表示：

```text
字段结构统一
状态词统一
证据来源可追踪
可比性显式声明
```

不表示：

```text
0-100 分
概率
统一吉凶值
```

因此第一原则：

```text
normalization != scoring
```

---

# 3. Per-Dimension Assessment Contract

建议：

```ts
type ChoiceDimensionAssessment = {
  alternativeId: string
  dimensionId: string

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

  contractRef: string
  contractVersion: string
  comparatorRef?: string
  comparatorVersion?: string

  evidenceRefs: string[]
  sourceTierRefs?: string[]
  unresolvedIssues?: string[]
}
```

注意：

```text
supportive_evidence
```

不是：

```text
70% favorable
```

它只是该 dimension 的 Assessment contract 对证据的分类结果。

---

# 4. 为什么不能直接比较 supportive / adverse 的数量

禁止：

```text
A 有 3 条 supportive
B 有 2 条 supportive
→ A 胜
```

因为：

```text
Evidence 条目不是独立样本
不同规则可能重复描述同一事实
来源层级不同
不同维度不可加总
同一 Fact 可能产生多个派生 Evidence
```

所以：

```text
Evidence count
```

绝不能成为隐藏 score。

---

# 5. Comparability Contract

两个 dimension assessment 只有满足全部条件时才可进入正式比较：

```text
same dimensionId
same semantic meaning
same Assessment contract family
compatible contract version
both resolutionStatus = resolved
registered comparator exists
```

否则：

```text
comparisonStatus = incomparable | partial | unresolved
```

建议：

```ts
type DimensionComparison = {
  dimensionId:string
  alternativeIds:string[]
  comparisonStatus:
    | 'comparable'
    | 'partial'
    | 'incomparable'
    | 'unresolved'
  comparatorRef?:string
  relation?:
    | 'A_preferred_on_dimension'
    | 'B_preferred_on_dimension'
    | 'indistinguishable_on_dimension'
    | 'mixed_no_order'
    | null
  reasonRefs:string[]
}
```

当前多数新主题：

```text
registered comparator = absent
```

所以即使两个 Alternative 都 resolved，也仍可能：

```text
incomparable
```

这是合法结果。

---

# 6. Comparator 必须是 Domain-owned

Shared Choice 层不得定义：

```text
supportive > mixed > adverse
```

全局顺序。

原因：

某些维度可以有自然方向：

```text
stability
```

但：

```text
resolution_feasibility
```

对“希望继续诉讼”与“希望尽快和解”的用户，价值方向不同。

所以 comparator 必须由：

```text
Dimension Contract Owner
```

提供，并记录：

```text
comparatorRef
comparatorVersion
```

Shared layer 只调用，不自行排序。

---

# 7. Cross-domain Dimension Provider

一个 Alternative 可以从多个主题获取维度。

例如：

```text
接受 20 万和解
vs
继续诉讼
```

可能需要：

```text
litigation adapter
→ resolution_feasibility
→ legal_exposure
→ target_outcome

finance / debt adapter
→ recovery_value
```

所以 Choice Frame 应支持：

```ts
providers:[
  { dimensionId, providerTheme, contractRef }
]
```

但 Shared layer 不允许把这些异质维度相加。

---

# 8. Alternative Completeness

建议：

```ts
alternativeAssessmentStatus:
  | 'complete_for_requested_dimensions'
  | 'partial'
  | 'unresolved'
```

判定只针对：

```text
requestedDimensions
```

不是要求一个 Alternative 把现实所有优缺点都覆盖。

例如用户只问：

```text
A/B 哪个更容易录取？
```

则只需：

```text
target_outcome
```

不需要自动补：

```text
学费、城市、就业、生活成本
```

---

# 9. Preference Policy v0.1

用户偏好字段：

```ts
preferencePolicy: {
  status:
    | 'explicit'
    | 'not_provided'

  priorities?: Array<{
    dimensionId:string
    rank?:number
    importance?:
      | 'primary'
      | 'secondary'
      | 'consider'
  }>

  hardConstraints?: Array<{
    dimensionId:string
    semanticConstraint:string
  }>
}
```

第一阶段禁止：

```text
numeric weight
```

例如：

```text
stability = 0.6
income = 0.4
```

除非未来用户明确提供且有独立聚合研究。

---

# 10. 可以保存什么用户偏好

例：

```text
“我最看重稳定，其次收入”
```

允许保存：

```text
stability → primary
livelihood / income → secondary
```

例：

```text
“只要别降薪，其他都可以”
```

允许保存：

```text
hardConstraint → salary_not_lower
```

但是否满足该 constraint 必须由相应事实 / Assessment provider 判断。

不能让 LLM 自己估计工资。

---

# 11. 不允许暗中推断的偏好

例如用户问：

```text
哪个工作更好？
```

系统不能自动假设：

```text
工资 > 稳定 > 距离
```

也不能因为用户用了：

```text
更好 / 更适合 / 值不值得
```

就生成隐式权重。

若 comparison dimensions 不足：

```text
Semantic Choice = recognized
Preference / Dimension Sufficiency = insufficient
```

---

# 12. Winner Policy v0.1

本版本继续强制：

```text
overallRecommendation = null
winner = null
scalarScore = null
```

即使：

```text
preferencePolicy.status = explicit
```

也只用于：

```text
排序展示维度
标记用户最关心的 dimension
```

不用于自动聚合 winner。

---

# 13. Future Conditional Ordering Gate

未来只有同时满足：

```text
all requested dimensions resolved
all required dimensions comparable
registered comparator per dimension
preference policy explicit
aggregation policy independently reviewed
frozen regression / calibration passed
```

才允许考虑：

```text
conditionalRecommendation
```

在这之前：

```text
no winner
```

不是临时 UI 限制，而是正式 epistemic boundary。

---

# 14. Pareto / Dominance 也不能现在偷用

表面上可以设想：

```text
A 每个维度都不差于 B
且至少一项更好
→ A dominates B
```

但当前仍不能直接实现，原因：

```text
每个 dimension comparator 尚未注册
mixed evidence 未必有序
partial dimension 会破坏 dominance
用户某些 hard constraints 可能改变可接受集合
```

所以 Pareto 只能作为未来研究候选。

---

# 15. Auditability

Comparison Frame 必须能回答：

```text
这个 dimension 来自哪个 Theme Adapter？
用了哪个 Observation Rule？
用了哪个 Assessment contract？
为什么说可比 / 不可比？
用户偏好是否明确提供？
是否存在 unresolved alternative？
```

所以任何未来 recommendation 都必须保留：

```text
traceRefs
```

不能只输出一句“建议选 A”。

---

# 16. Status Matrix

```text
normalized field contract
→ ready

resolution / assessment statuses
→ ready

comparability declaration
→ ready

cross-domain providers
→ ready

explicit preference storage
→ ready

implicit preference inference
→ forbidden

numeric weights
→ deferred

global comparator
→ forbidden

domain comparators
→ future research

aggregation policy
→ deferred

overall winner
→ intentionally null
```

---

# 17. Final Conclusion

Shared Choice Architecture 现在可以从：

```text
frame-only
```

推进到：

```text
normalized auditable comparison-frame design
```

但仍不是 recommendation engine。

正式边界：

```text
Evidence organization
→ yes

Dimension Assessment normalization
→ yes

Comparability declaration
→ yes

User preference capture
→ yes

Hidden scoring
→ no

Automatic winner
→ no
```

下一步若继续，不应再研究“怎样随便排一个最佳选项”，而应逐 dimension 建立可审核 comparator，或先完成全局 Source Registry / Collision Matrix / expansion gate 前置。

当前 v0.13 next-topic boundary 仍为 design-only。