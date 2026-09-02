# 龟甲 · Travel Transport Object Resolver Safe Subset Review v0.1

日期：2026-09-02

状态：`review_complete_partial_safe_subset`

Resolver：`PRR-TRAVEL-TRANSPORT-OBJECT`

> 本 Review 不宣称解决同卦多个父母的完整对轨问题。只审查一个可安全自动化的单候选子集，不执行 Formal Expansion。

## 1. 已有依据

### 1.1 Semantic 前提

`travel-intent-schema-design-v0.1.md` 已要求 transport-focused disruption 满足：

```text
travelDuty = travel_disruption_transport
currentTargetAspect = transport_operation
transportContext.specificity = specific_service | specific_vehicle | context_bounded
transportContext.relevance = explicit | context_supported
```

因此传统层不是仅凭“飞机 / 火车”关键词选择父母，而是消费已经完成 current-target 区分的现代语义。

### 1.2 Traditional / modern object class

`travel-research-v1.0.md` 与 `travel-rule-review-v0.1.md` 已完成：

```text
父母 → transport vehicle / carrier / transport operation Primary candidate
```

但明确禁止：

```text
航班 / 火车 → 无条件父母 Primary
```

### 1.3 Current Observation Plan 行为

`liuyao-observation-plan.js#findTargets` 对 `six_relative` 的现有行为是：

```text
visible candidates = all base lines matching relation

visible.length === 1
→ subject resolutionStatus = resolved

visible.length > 1
→ multiple_candidates

visible.length === 0
→ fallback hidden candidates
```

这说明系统现有架构本身已经把“单候选”与“多候选”区别开，而不是 first-match。

## 2. 为什么可以开放 single-visible safe subset

当同时满足：

```text
1. current target 已明确是具体 / bounded transport operation
2. transport relevance 明确
3. base hexagram 只有一个可见父母 candidate
```

则不存在需要在多个同类 base candidates 中做隐性排序的问题。

此时允许生成一个 provisional binding：

```text
transport_operation
→ the sole visible 父母 candidate
```

该自动化仅是：

```text
semantic object class
+
unique candidate cardinality
```

不是根据旺衰、动静、吉凶结果选择对象。

## 3. 明确不允许的 selector heuristics

禁止：

```text
first visible parent
moving parent first
strongest parent first
ying parent first
shi parent first
parent that gives desired result
parent whose move tag best matches known outcome
```

这些都会形成 circular selection / outcome leakage。

## 4. 多父母继续 unresolved

现代交通案例已经显示：同卦多个父母可能分别对应原航班、替代航班等不同现实对象，具体对轨具有 contextual / 变易性质。

因此：

```text
visibleParentCandidates.length > 1
→ unresolved / multiple_transport_parent_candidates
```

不得因存在 RETREAT、发动、临应等特征自动选定其中一个。

## 5. 无可见父母时首轮不自动使用伏神

虽然通用 Observation Plan 在无 visible candidate 时可寻找伏神，但 transport operation 的 modern object mapping 尚未专项审查：

```text
hidden 父母
→ concrete flight / train service
```

所以 Safe Subset v0.1：

```text
0 visible parent
→ unresolved
```

即使存在一个 hidden 父母，也暂不自动绑定。

这比通用 `findTargets()` 更保守。

## 6. Resolver 输入

建议 isolated 输入：

```ts
{
  readingRef,
  travelDuty,
  currentTargetAspect,
  transportContext: {
    mode,
    specificity,
    relevance,
    serviceText?
  },
  candidateTargets: [
    { key, type:'line'|'hidden', position, relation }
  ]
}
```

Resolver 不扫描整卦、不重算六亲，只消费上游候选集合。

## 7. Resolver 输出

成功时：

```ts
{
  status:'resolved',
  resolverRef:'PRR-TRAVEL-TRANSPORT-OBJECT',
  binding:{
    status:'resolved',
    bindingRef,
    objectClass:'transport_operation',
    relation:'父母',
    position,
    targetKey
  },
  provisional:true,
  formalEligible:false
}
```

失败时保留明确原因：

```text
semantic_scope_not_transport_operation
transport_context_not_specific_enough
transport_context_not_relevant
no_visible_transport_parent_candidate
multiple_transport_parent_candidates
hidden_transport_mapping_not_reviewed
```

## 8. 与 RETREAT Evidence 的连接

Safe Subset 成功输出的 binding 可以进入：

```text
Move Fact
→ RETREAT
→ transport_delay_or_postponement Evidence
```

但 Resolver 本身绝不读取 moveFacts。

这条隔离非常重要：

```text
对象选择
≠
对象状态判断
```

## 9. 当前成熟度

```text
singleVisibleSafeSubset = ready_for_isolated_implementation
multipleCandidateResolver = blocked
hiddenCandidateResolver = blocked
formalResolverRegistration = blocked
```

## 10. Formal gate

Formal 前仍需：

```text
multi-candidate transport case research
hidden transport mapping review（若要支持）
semantic candidate production regression
readingRef runtime producer
full regression
explicit user authorization for Formal Expansion
```

## 11. 结论

```text
specific/bounded transport operation
+
exactly one visible parent candidate
→ provisional isolated binding allowed

multiple / zero / hidden-only
→ abstain

no first-match
no motion-based selection
no outcome-based selection
Formal Expansion = not authorized
```
