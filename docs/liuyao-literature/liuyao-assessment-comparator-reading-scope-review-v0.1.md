# 龟甲 · 六爻 Assessment / Comparator Reading Scope Review v0.1

日期：2026-09-02

状态：`review_complete_design_only`

范围：Fact → Evidence → Assessment → Comparator 的 reading identity 传递。

> 本 Review 不执行 Formal Expansion，不修改 current shared v0.1 runtime candidates，不修改 current-22 / Time Engine。

## 1. 问题

Fact provenance 已确认需要：

```text
readingRef
```

但当前 shared Assessment v0.1：

```text
js/liuyao-domain-assessment-pretraining-v01.js
```

的 envelope schema 不要求 `readingRef`。

更关键的是：

```text
bindAssessmentForComparison()
```

当前只绑定：

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

因此即使 Assessment 对象临时携带 `readingRef`，现有 bridge 也不会把它传入 Comparator input。

## 2. 风险

理论上可能出现：

```text
Reading A / Alternative A
Assessment supportive

Reading B / Alternative B
Assessment adverse
```

只要两者：

```text
same dimension
same semanticMeaning
same contract family/version
```

现有 isolated Comparator 就可能执行顺序判断。

这不是合法的 choice comparison provenance。

## 3. 设计原则

未来正式链必须：

```text
Reading
↓
Fact.readingRef
↓
Evidence.readingRef
↓
Assessment.readingRef
↓
ComparisonInput.readingRef
↓
Comparator same-reading gate
```

默认：

```text
left.readingRef != right.readingRef
→ comparisonStatus = incomparable
→ reason = reading_scope_mismatch
```

## 4. 为什么 alternativeId 不足够

`alternativeId` 标识同一选择框架中的候选对象。

它不等于：

```text
reading identity
```

同样的 alternative label 可以在不同时间重复占问。

所以：

```text
alternativeId + contract
```

不能证明两个 Assessment 属于同一 reading。

## 5. 为什么 evidenceRefs 也不应被 Comparator 解析来推 scope

即使新的 sourceFactRef 形如：

```text
READING:<readingRef>:LINE-STATUS:...
```

Comparator 也不应通过解析字符串猜 reading scope。

readingRef 必须是一等字段：

```ts
assessment.readingRef
comparisonInput.readingRef
```

原因：

- ref string format 未来可能变化；
- 一个 Assessment 可能引用多个 Evidence source；
- Comparator 不应理解 Fact id 编码细节。

## 6. Standalone Assessment 与 Choice Assessment

建议：

### standalone domain assessment

```text
readingRef = required once provenance-backed facts are used
alternativeId = optional
```

### choice comparison input

```text
readingRef = required
alternativeId = required
```

Comparator 必须检查：

```text
left.readingRef === right.readingRef
```

## 7. Existing v0.1 candidate status

不修改：

```text
AE-TV-EXEC-001
AE-TV-SAFE-001
CP-TV-EXEC-001
CP-TV-SAFE-001
```

也暂不修改刚建立的：

```text
AE-TV-EXEC-002
CP-TV-EXEC-002
```

它们继续作为 isolated architecture prototypes。

它们的正式成熟度必须附加 blocker：

```text
reading_scope_not_carried_through_assessment_comparator_bridge
```

## 8. 下一版 shared contract

建议 design-only 新建：

```text
Domain Assessment Envelope v0.2
Domain Comparator Input v0.2
```

新增：

```text
readingRef
```

并将 same-reading gate 写入 validator / binding bridge。

不能直接 mutate v0.1，以免改变此前 regression 基线。

## 9. Cross-reading policy

v0.1 默认策略：

```text
cross-reading choice ordering = forbidden
```

若将来真有“比较两次不同起卦结果”的产品需求，必须另建专用 longitudinal / multi-reading contract，不能复用 choice comparator。

## 10. Formal gate

Formal Expansion 前必须：

```text
readingRef producer reviewed
Fact/Evidence/Assessment ref scope carried end-to-end
Comparator same-reading gate implemented
cross-reading regression exists
```

以及用户明确授权 Formal Expansion。

## 11. 结论

```text
Fact reading scope only = insufficient
Assessment readingRef = required
Comparator same-reading gate = required
current v0.1/v0.2 isolated candidates = preserve, do not silently patch
cross-reading ordering = forbidden
Formal Expansion = not authorized
```
