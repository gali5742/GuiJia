# 龟甲 · 六爻 Travel Execution Evidence → Assessment → Comparator 实现记录 v0.1

日期：2026-09-02

状态：`isolated_design_chain_verified`

> 本记录只描述 design-only / unreachable 实现。它不注册正式 Domain Evaluator，不注册正式 Comparator，不修改 current-22，不修改正式 Rule Registry，不修改 Time Engine，也不构成 Formal Expansion。

---

## 1. 本轮完成链路

```text
Travel Intent
↓
TR-TV-001-A Draft ObservationPlan
↓
buildTravelEvidence()
↓
Travel Execution Evidence Binding Bridge
↓
AE-TV-EXEC-001
↓
Shared Assessment Envelope
↓
explicit Alternative binding
↓
CP-TV-EXEC-001
```

当前该链只覆盖：

```text
travel_execution
+
target_outcome
+
journey_execution_outcome
```

不得扩义为：

```text
travel_safety
travel_disruption
travel overall suitability
all supportive/adverse comparisons
```

---

## 2. Evidence binding bridge

实现：

```text
js/liuyao-travel-execution-evidence-binding-pretraining-v01.js
```

原因：现有 `buildTravelEvidence()` 输出只有：

```text
type
polarity
note?
```

没有 Assessment 所需的稳定 `id`。

设计采用两种模式：

### explicit

上游显式提供 provenance-backed Evidence refs：

```text
referenceMode = explicit
```

### synthetic_design_only

若只做 isolated regression，可生成：

```text
DESIGN-ONLY-TV-EXEC:...
```

并强制：

```text
formalEligible = false
syntheticRefsForbiddenForFormalExpansion = true
```

因此 synthetic ref 只能用于设计验证，不能直接晋升为正式 Evidence provenance。

Bridge 不解释 polarity，不产生 Assessment。

---

## 3. Domain Assessment candidate

实现：

```text
js/liuyao-travel-execution-assessment-pretraining-v01.js
```

Evaluator candidate：

```text
AE-TV-EXEC-001
```

Contract：

```text
assessmentRef   = travel_execution_assessment_v0.1
contractFamily  = travel_execution_assessment
dimensionId     = target_outcome
semanticMeaning = journey_execution_outcome
```

已审核方向：

```text
support:
  traveler_vitality|positive
  destination_relation|positive

adverse:
  traveler_vitality|negative
  traveler_void|negative
  destination_relation|negative
  route_process_obstruction|negative
  transport_disruption|negative
```

明确排除：

```text
safety_support
hazard_pressure
unknown future evidence types
```

组合策略：

```text
support only  → supportive_evidence
adverse only  → adverse_evidence
both          → mixed_evidence
none reviewed → insufficient_evidence
```

没有 evidence count、majority、probability、scalar score。

---

## 4. Assessment → Comparator binding

Shared Assessment Envelope 保持 choice-agnostic：

```text
alternativeId = optional
```

进入 Comparator 前必须：

```text
bindAssessmentForComparison()
```

显式获得：

```text
alternativeId
contractRef
contractVersion
contractFamily
semanticMeaning
```

禁止根据数组位置、左/右顺序或显示顺序猜 Alternative identity。

---

## 5. Domain Comparator candidate

实现：

```text
js/liuyao-travel-execution-comparator-pretraining-v01.js
```

Comparator candidate：

```text
CP-TV-EXEC-001
```

仅接受：

```text
dimensionId     = target_outcome
semanticMeaning = journey_execution_outcome
contractFamily  = travel_execution_assessment
assessmentRef   = travel_execution_assessment_v0.1
assessmentVersion = 0.1
```

首轮顺序关系只有：

```text
supportive vs adverse → strict direction
adverse vs supportive → strict direction
```

以下不强排：

```text
supportive vs mixed
adverse vs mixed
mixed vs mixed
```

统一：

```text
mixed_no_order
```

`insufficient_evidence`：

```text
incomparable
```

同为 supportive 或同为 adverse：

```text
indistinguishable_on_dimension
```

这里只表示当前 v0.1 粗粒度 Assessment 无法区分，不表示两个 Alternative 在现实中等价。

---

## 6. Regression

2026-09-02 实际执行：

```text
Domain Assessment Envelope     33 / 33
Travel Execution Assessment    31 / 31
Travel Execution Comparator    26 / 26
Travel Evidence Binding        18 / 18
Isolated E2E                   14 / 14
-------------------------------------
Total                          122 / 122
```

主要验证：

```text
support + adverse 不按数量决胜
unknown positive polarity 不自动变 supportive
safety evidence 不进入 execution Assessment
partial / unresolved 不被当 adverse
standalone Assessment 不可按数组位置猜 Alternative
synthetic Evidence refs 明确不可 Formal Expansion
shared ACTIVE_EVALUATORS = []
shared ACTIVE_COMPARATORS = []
无 winner / probability / scalarScore / overallRecommendation
```

---

## 7. 当前成熟度

```text
travel execution literature research      = complete
travel execution observation rule review  = complete
evidence builder                          = isolated existing
evidence binding bridge                   = isolated verified
assessment rule review                    = complete
assessment candidate                      = isolated verified
comparator rule review                    = complete
comparator candidate                      = isolated verified
end-to-end isolated chain                 = verified
formal evaluator registration             = blocked / not authorized
formal comparator registration            = blocked / not authorized
semantic route expansion                  = blocked / not authorized
```

---

## 8. Formal Expansion 前新增硬条件

除当前 v0.13 gate 外，Travel Execution 本链还必须满足：

```text
1. synthetic design-only Evidence refs 全部替换为 provenance-backed refs
2. Assessment candidate 再经过正式 registration review
3. Comparator candidate 再经过正式 registration review
4. frozen regression / calibration policy 单独确定
5. 用户明确允许 Formal Expansion
```

在此之前：

```text
AE-TV-EXEC-001 registered = false
CP-TV-EXEC-001 registered = false
```

保持不变。
