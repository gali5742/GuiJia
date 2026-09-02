# 龟甲 · 六爻 Travel Execution Comparator v0.2 Compatibility Review v0.1

日期：2026-09-02

状态：`review_complete_design_only`

范围：`AE-TV-EXEC-002 / travel_execution_assessment_v0.2` 与既有 Travel Execution Comparator 语义兼容性。

> 本 Review 不执行 Formal Expansion，不修改 `CP-TV-EXEC-001`，不注册 Comparator，不修改 current-22、Rule Registry 或 Time Engine。

## 1. 现有 v0.1 Comparator 的版本边界

`js/liuyao-travel-execution-comparator-pretraining-v01.js` 明确规定：

```text
ASSESSMENT_REF = travel_execution_assessment_v0.1
COMPATIBLE_VERSIONS = [0.1]
```

因此：

```text
CP-TV-EXEC-001
×
travel_execution_assessment_v0.2
```

必须保持 incompatible。

禁止为了迁移方便直接把旧 Comparator 的 compatible versions 改成 `[0.1,0.2]`，因为这会改变已验证 v0.1 candidate 的 contract surface。

## 2. v0.1 → v0.2 Assessment 的变化

v0.2 没有改变：

```text
eventType = travel
duty = travel_execution
dimensionId = target_outcome
semanticMeaning = journey_execution_outcome
contractFamily = travel_execution_assessment
```

也没有改变 coarse Assessment vocabulary：

```text
supportive_evidence
adverse_evidence
mixed_evidence
insufficient_evidence
not_assessed
```

主要变化在 Evidence 层：

```text
v0.1 opaque fixture:
traveler_vitality positive/negative

v0.2 provenance-oriented atomic evidence:
traveler_calendar_support positive
traveler_calendar_constraint negative
traveler_void negative
```

因此 Comparator 的“比较对象语义”没有变化，但输入 Assessment 的形成依据与版本发生了实质变化。

## 3. 可以迁移的 coarse ordering semantics

以下语义在 v0.2 仍可成立：

```text
supportive_evidence vs adverse_evidence
→ supportive 一方在 journey_execution_outcome 维度优先

adverse_evidence vs supportive_evidence
→ supportive 一方优先

mixed_evidence present
→ mixed_no_order

supportive vs supportive
→ indistinguishable_on_dimension

adverse vs adverse
→ indistinguishable_on_dimension

insufficient_evidence present
→ incomparable

partial / unresolved / not_applicable
→ 保持非严格比较状态
```

原因：Comparator 只比较已经经过 duty-specific Assessment review 的 coarse state，不读取 raw line status、Evidence 数量或 Evidence 类型细节。

## 4. 不允许迁移的行为

仍然禁止：

```text
evidenceRefs.length 决定顺序
calendar support 数量决定顺序
calendar constraint 数量决定顺序
MONTH_COMMAND 比 DAY_GENERATE 权重大
VOID 自动覆盖所有 support
2 supportive evidence > 1 adverse evidence
scalar score
probability
winner
overall recommendation
```

若未来要区分不同传统 Evidence 的优先级，必须进入新的 Assessment / calibration 研究，不能放进 Comparator 偷做。

## 5. 版本策略

采用：

```text
CP-TV-EXEC-001
→ frozen isolated candidate
→ only assessment v0.1

CP-TV-EXEC-002
→ new isolated candidate
→ only assessment v0.2
```

两者算法可能结构相似，但 contract identity 必须不同。

这样未来可以独立比较：

```text
v0.1 fixture-based Assessment chain
vs
v0.2 atomic-provenance Assessment chain
```

而不会把迁移误记成原 candidate 的无版本变更。

## 6. Cross-version hard rejection

Regression 必须明确验证：

```text
CP-TV-EXEC-001 rejects assessment v0.2
CP-TV-EXEC-002 rejects assessment v0.1
```

不得根据：

```text
same contractFamily
same semanticMeaning
same dimensionId
```

自动推断 version compatibility。

## 7. Formal gate

即使 `CP-TV-EXEC-002` isolated regression 通过：

```text
registered = false
currentRuntimeReachable = false
activeComparators = []
formalEligible = false
```

正式 Expansion 仍要求：

```text
technical gate passed
+
explicit user authorization
```

当前用户尚未授权 Formal Expansion。

## 8. Review 结论

```text
CP-TV-EXEC-001 mutation = rejected
v0.2 coarse ordering semantics = compatible for isolated migration
CP-TV-EXEC-002 = eligible for isolated implementation
cross-version automatic compatibility = forbidden
Formal Expansion = not authorized
```
