# 龟甲 · 六爻 Domain Comparator Isolated Pretraining 实现记录 v0.1

日期：2026-09-01

状态：`isolated_design_implemented_safe_refusal_verified`

上游：

- `domain-comparator-research-v0.1.md`
- `data/liuyao-domain-comparator-contract-v0.1.json`
- `choice-normalized-assessment-preference-policy-research-v0.1.md`

实现：

- `js/liuyao-domain-comparator-pretraining-v01.js`
- `tests/liuyao-domain-comparator-pretraining-v01-tests.js`

---

# 1. Runtime Boundary

模块状态：

```text
design_only_no_active_ordering_comparators
currentRuntimeReachable = false
```

没有接入：

```text
current Semantic Router
current Routeability
current Rule Registry
current ObservationPlan runtime
current-22
```

也没有修改 Time Engine。

---

# 2. 当前实现职责

模块只做：

```text
Dimension Assessment contract validation
↓
Comparability precondition validation
↓
Safe refusal
```

当前：

```text
ACTIVE_COMPARATORS = []
```

所以两个 structurally valid、resolved 的 Assessment 也只会得到：

```text
comparisonStatus = incomparable
relation = null
reason = comparator_not_registered
```

---

# 3. Contract Hole 修复

实现前发现原机器契约存在缺口：

```text
comparison algorithm
要求 contract family + semantic meaning
```

但输入 required 字段没有这两个值。

现已补成显式字段：

```text
contractFamily
semanticMeaning
```

禁止未来从 `contractRef` / `dimensionId` 命名猜测。

---

# 4. 输入校验

当前要求：

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

允许 resolutionStatus：

```text
resolved
partial
unresolved
not_applicable
```

允许 normalized assessmentStatus：

```text
supportive_evidence
adverse_evidence
mixed_evidence
insufficient_evidence
not_assessed
```

这些 normalized status 没有全局大小顺序。

---

# 5. Forbidden Leakage

Dimension Assessment 输入若直接携带：

```text
probability
scalarScore
overallRecommendation
winner
```

会被判为 invalid。

Comparator 也不会读取：

```text
Evidence 数量
lineScore
interpretationPriority
raw support count
```

来 fallback 排序。

---

# 6. Safe Refusal Semantics

```text
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

not_applicable
→ incomparable

resolved + resolved + no comparator
→ incomparable / comparator_not_registered
```

特别确认：

```text
supportive_evidence vs adverse_evidence
```

不会自动产生 preferred relation。

---

# 7. Regression

实际执行：

```text
node --check js/liuyao-domain-comparator-pretraining-v01.js
node --check tests/liuyao-domain-comparator-pretraining-v01-tests.js
node tests/liuyao-domain-comparator-pretraining-v01-tests.js
```

结果：

```text
Domain comparator safe-refusal regression: 24 passed, 0 failed
```

覆盖：

```text
design-only boundary
zero active comparators
ordering/winner disabled
required semanticMeaning
required contractFamily
probability/score/winner/recommendation leakage
mismatched dimension
mismatched semantic meaning
mismatched contract family
partial/unresolved/not_applicable
resolved but comparator absent
supportive vs adverse no implicit order
evidence count no implicit order
raw helper values no fallback order
invalid assessment status
malformed evidence refs
missing side contract
legal_exposure no generic divination inference
```

---

# 8. 当前结论

```text
Comparator contract              = implemented isolated
Safe refusal                     = verified
Regression                       = 24 / 24 passed
Active ordering comparator       = 0
Hidden global order              = none
Winner                           = disabled
Formal integration               = blocked
```

下一阶段应进入：

```text
Aggregation / Recommendation Readiness Review
```

但不能因为 Comparator contract 已经存在，就把 `incomparable` 自动转换成某种综合推荐。
