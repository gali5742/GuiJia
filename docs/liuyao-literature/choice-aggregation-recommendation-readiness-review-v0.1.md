# 龟甲 · 六爻 Choice Aggregation / Recommendation Readiness Review v0.1

日期：2026-09-01

状态：`review_complete_not_ready_for_aggregation`

上游：

- `choice-suitability-shared-architecture-v0.1.md`
- `choice-normalized-assessment-preference-policy-research-v0.1.md`
- `domain-comparator-research-v0.1.md`
- `data/liuyao-domain-comparator-contract-v0.1.json`
- `data/liuyao-choice-aggregation-readiness-v0.1.json`
- `js/liuyao-choice-theme-adapters-pretraining-v01.js`
- `js/liuyao-domain-comparator-pretraining-v01.js`

边界：

```text
本 Review 只判断 Aggregation / Recommendation 是否具备进入下一阶段的条件。
不实现 Aggregator。
不实现 Recommendation Engine。
不修改 current-22。
不修改 Time Engine。
不输出 Winner。
```

---

# 1. Review 结论

当前 Choice 架构已经可以做到：

```text
Choice semantics
→ bounded alternatives
→ theme adapter requirement plan
→ future normalized dimension assessment
→ comparability validation
```

但不能继续直接推进：

```text
Dimension comparisons
→ overall recommendation
```

当前正式状态：

```text
aggregationStatus = not_ready
overallRecommendation = null
winner = null
scalarScore = null
```

原因不是单一模块缺失，而是至少存在五个独立阻断层。

---

# 2. 最大隐藏风险：Adapter resolved ≠ Assessment resolved

现有：

```text
js/liuyao-choice-theme-adapters-pretraining-v01.js
```

某些 Alternative 会返回：

```text
status = resolved
```

例如 current employment 的 `stability` provider requirement 已能被确定。

但该返回同时仍然是：

```text
dimensionEvidence = {}
```

并且实际内容主要是：

```text
providerRequirements:[...]
```

因此这里的 `resolved` 只能理解为：

```text
Theme Adapter 已知道该去找哪个 provider / contract
```

不能理解为：

```text
Dimension Assessment 已经完成
```

如果未来 Aggregator 只检查：

```text
adapter.status === 'resolved'
```

就继续比较，会产生严重层级错误。

正式区分：

```text
Adapter Resolution
≠ Evidence Resolution
≠ Assessment Resolution
≠ Comparator Resolution
≠ Aggregation Readiness
```

---

# 3. 当前完整链还缺什么

正确链路应当是：

```text
Alternative
↓
Theme Adapter
↓
Provider Requirement
↓
Provider Result / Evidence
↓
Domain Assessment
↓
Normalized DimensionAssessment
↓
Domain Comparator
↓
DimensionComparison
↓
Aggregation Policy
↓
Conditional Recommendation
```

当前实际成熟度大致停在：

```text
Theme Adapter / Provider Requirement
```

以及：

```text
Comparator Safe-Refusal Contract
```

中间大量 Domain Assessment contract 尚未完成。

因此不能把两端拼起来假装链路已经完整。

---

# 4. Comparator 仍然是零 active

当前：

```text
ACTIVE_COMPARATORS = []
```

Comparator regression 已经确认：

```text
resolved + resolved + comparator absent
→ incomparable
```

所以当前 even if：

```text
A assessment = resolved
B assessment = resolved
```

也未必存在：

```text
A > B
B > A
A = B
```

这种可审核关系。

因此 Aggregator 现在甚至还没有稳定的 per-dimension relation 可消费。

---

# 5. Preference 已可保存，但不是聚合公式

已有 Preference Policy 可以保存：

```text
stability = primary
income = secondary
```

或：

```text
salary_not_lower = hard constraint
```

但这不等于：

```text
stability 权重 0.7
income 权重 0.3
```

也不等于：

```text
只要 primary dimension 更好，就自动选它
```

因为还没有独立审核：

```text
lexicographic aggregation
weighted aggregation
hard-constraint filtering
Pareto aggregation
```

中的任何一种。

因此：

```text
preference capture ready
≠ aggregation policy ready
```

---

# 6. Hard Constraint 也不能靠缺省值处理

例如用户说：

```text
“只要不降薪，其他都可以。”
```

可以记录：

```text
hardConstraint = salary_not_lower
```

但某个 Alternative 是否满足该条件，必须由：

```text
income / salary factual provider
```

明确给出。

如果没有数据，必须：

```text
constraintStatus = unresolved
```

禁止：

```text
missing = satisfied
missing = neutral
missing = false
```

同样，诉讼中的：

```text
legal_exposure
```

必须来自现代法律事实 provider；六爻层不能代替现实法律风险判断。

---

# 7. 为什么不能多数票

未来假设出现：

```text
A:
  target_outcome better
  stability worse
  livelihood better

B:
  target_outcome worse
  stability better
  livelihood worse
```

不能：

```text
A 赢 2:1
→ 推荐 A
```

因为：

```text
维度不是等权选票
用户没有默认权重
不同维度的重要性不可由 Shared 层假设
hard constraint 可能直接改变可接受集合
```

所以：

```text
majority vote across dimensions
```

正式禁止。

---

# 8. 为什么不能 supportive evidence 计票

更不能做：

```text
A supportive = 5 条
B supportive = 3 条
→ A
```

因为 Comparator 阶段已经明确：

```text
Evidence count
≠ independent samples
≠ severity
≠ probability
≠ preference strength
```

所以 Aggregator 不允许重新把 Evidence count 作为隐藏 score 复活。

---

# 9. Pareto dominance 当前也仍不能启用

理论上：

```text
A 所有维度都不差于 B
且至少一维更好
→ A dominates B
```

看起来不需要数值权重。

但当前仍不能启用，原因包括：

```text
1. 大多数维度没有 active comparator
2. mixed_no_order 尚无全面定义
3. partial / incomparable dimension 会中断 dominance
4. hard constraints 可能先改变 feasible set
5. dimension semanticMeaning 可能不一致
```

因此 Pareto 只能保留为未来研究候选。

---

# 10. 未来可研究的 Aggregation Candidate

当前只允许记录候选，不注册规则。

## 10.1 Explicit Lexicographic Priority

例如用户明确说：

```text
最重要稳定
其次收入
最后发展机会
```

未来可以研究：

```text
先比较 stability
若明确分出且无 hard constraint 冲突，则是否停止？
若持平再比较 income？
```

但现在尚未 review。

## 10.2 Hard Constraint Filter → Compare

例如：

```text
不降薪是硬条件
```

未来可以研究：

```text
先过滤违反 hard constraint 的 Alternative
再比较剩余项
```

但前提是 constraint provider 完整且 violation semantics 已 review。

## 10.3 Pareto Dominance

只有所有参与维度 comparator 完整时才值得继续研究。

以上三者目前都不是 active policy。

---

# 11. Recommendation Activation Gate

未来若要第一次允许：

```text
conditionalRecommendation
```

至少必须同时满足：

```text
1. requested dimensions 全部有 normalized assessment 或明确 not_applicable
2. 参与排序的每个 dimension 有 active Domain Comparator
3. comparator 对 exact semanticMeaning / contractFamily 明确兼容
4. hard constraints 有 provider result
5. preference policy 为 explicit（若 policy 依赖 priority）
6. aggregation policy 独立研究、review、versioned
7. mixed / tie / partial / incomparable 行为明确定义
8. high-stakes factual dimensions 不由 divination inference 代替
9. regression 覆盖冲突维度、缺失维度、constraint fail、tie、partial、incomparable
10. calibration / sealed evaluation 通过
11. current-22 保持冻结，除非另做 migration
```

只要缺一项：

```text
overallRecommendation = null
```

---

# 12. 当前允许输出什么

v0.1 可以输出：

```text
Alternative 列表
requested dimensions
provider requirement status
DimensionAssessment（若未来 provider 已给出）
comparisonStatus
registered comparator 下的 per-dimension relation
explicit preference order
hard constraint status
blocker reasons
traceRefs
```

可以对用户说：

```text
“稳定性这一维目前不可比较，因为新职位稳定性 Assessment 尚未建立。”
```

也可以说：

```text
“法律风险这一维需要现实法律事实，六爻证据不会代替该判断。”
```

但不能说：

```text
“综合来看 A 更好。”
```

除非未来 Aggregation Gate 真正通过。

---

# 13. 当前明确禁止

```text
majority vote
Evidence count weighting
supportive/mixed/adverse numeric mapping
high/medium/low numeric mapping
implicit preference weights
adapter resolved → assessment resolved
treat missing as neutral
treat unresolved as worse
treat partial as lower score
single favorable dimension → recommendation
unreviewed Pareto dominance
legal strategy recommendation from divination evidence
winner
overallRecommendation
scalarScore
probability
```

---

# 14. Readiness Matrix

```text
Choice semantics                    = ready design-only
Alternative bounding                = ready design-only
Theme Adapter requirement plan      = ready isolated
Provider result coverage            = partial
Normalized Assessment coverage      = incomplete
Comparator contract                 = ready isolated
Active Comparator                   = 0
Explicit Preference capture         = ready design-only
Hard Constraint evaluation          = partial / external
Aggregation policy                  = absent
Aggregation regression              = absent
Calibration / sealed eval           = absent
Recommendation                      = intentionally disabled
Formal runtime integration          = blocked by current v0.13 gate
```

---

# 15. Final Conclusion

第 6 阶段可以收口，但结论不是“Recommendation Engine 可以开始写”，而是：

```text
Aggregation Readiness Contract
→ 已建立

Aggregation Policy
→ 尚未建立

Recommendation
→ 不具备激活条件
```

当前最重要的下一步不再是继续堆 Shared Choice 层，而是回到具体 Domain：

```text
先完成可版本化 Domain Assessment contracts
↓
再逐 dimension 注册 Comparator
↓
最后才有资格研究 Aggregation policy
```

因此当前 Shared Choice Architecture 应停在：

```text
normalized auditable comparison frame
+
safe refusal
+
explicit aggregation blockers
```

这是当前证据成熟度下的正确终点。
