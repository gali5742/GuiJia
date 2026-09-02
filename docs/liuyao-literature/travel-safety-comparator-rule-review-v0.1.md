# 龟甲 · 六爻 Travel Safety Comparator Rule Review v0.1

日期：2026-09-02

状态：`comparator_rule_review_complete_candidate_only`

上游：

- `travel-safety-assessment-rule-review-v0.1.md`
- `js/liuyao-travel-safety-assessment-pretraining-v01.js`
- `data/liuyao-domain-comparator-contract-v0.1.json`

> 本文件只审核 `travel_safety_assessment_v0.1` 内部的 dimension comparator candidate。它不注册 Shared Comparator，不输出总体旅行建议，不构成 Formal Expansion。

---

## 1. Comparator identity

```text
comparatorRef   = CP-TV-SAFE-001
dimensionId     = risk
semanticMeaning = journey_safety_and_major_route_risk
contractFamily  = travel_safety_assessment
assessmentRef   = travel_safety_assessment_v0.1
version         = 0.1
```

只接受同一 Assessment contract family / semantic meaning / compatible version。

---

## 2. v0.1 strict ordering

唯一允许严格排序的 coarse pair：

```text
supportive_evidence vs adverse_evidence
```

解释：在 `journey_safety_and_major_route_risk` 这一单一维度、这一 Assessment contract 粒度下，supportive 一侧具有更有利的传统 Evidence 方向。

这不是现实事故概率，也不是旅行安全保证。

---

## 3. Mixed 不进入三段序

禁止：

```text
supportive > mixed > adverse
```

因此：

```text
supportive vs mixed
adverse vs mixed
mixed vs mixed
```

统一：

```text
mixed_no_order
```

不能根据 mixed 内 support/adverse 数量继续排序。

---

## 4. Insufficient / partial / unresolved

```text
insufficient_evidence
→ incomparable

partial
→ partial

unresolved
→ unresolved

not_applicable
→ incomparable
```

不得把 `insufficient_evidence` 当作中性或中间风险。

---

## 5. Same coarse state

```text
supportive vs supportive
adverse vs adverse
```

可以返回：

```text
indistinguishable_on_dimension
```

其含义严格限定为：

```text
当前 v0.1 coarse Assessment state 无法区分
```

不表示：

```text
两个行程实际同等安全
风险完全相同
```

也不得使用 Evidence 数量破坏该状态。

---

## 6. Cross-contract ban

必须拒绝：

```text
travel_execution_assessment
vs
travel_safety_assessment
```

即使两者都输出 `supportive_evidence`。

同样：

```text
risk
```

只是 dimension label；没有相同 semanticMeaning + contractFamily 不能比较。

---

## 7. Recommendation boundary

`CP-TV-SAFE-001` 即使能产生：

```text
left_preferred_on_dimension
```

也只能表示：

```text
left has the preferred reviewed Evidence direction on this safety/risk dimension
```

不能升级成：

```text
建议选左边路线
左边现实中更安全
可以忽略天气、交通警报、官方安全信息
```

总体选择仍需独立 Choice / factual safety / Aggregation policy。

---

## 8. Current decision

```text
Comparator Rule Review = complete
CP-TV-SAFE-001 = allowed for isolated implementation
Shared ACTIVE_COMPARATORS = must remain []
formal registration = blocked / not authorized
Formal Expansion = blocked until explicit user permission
```
