# 龟甲 · 六爻 Travel Execution Reading-Scoped Chain v0.3

日期：2026-09-02

状态：`isolated_implemented_regression_added_not_executed`

范围：`travel_execution` 的 design-only Fact → Evidence → Assessment → Comparator 样板。

> 本文件不执行 Formal Expansion，不修改 current-22，不注册正式 Rule / Evaluator / Comparator，不修改 Time Engine。

## 1. 本轮目标

将旧 isolated 原型中的：

```text
travelerVitality
destination_relation
route_process_obstruction
transport_disruption
```

逐步替换为具有显式 provenance 的原子事实与 Evidence。

本轮只接入已审计来源：

```text
Line Status atomic facts
+
Shi/Ying structural atomic facts
```

## 2. 当前链

```text
readingRef
↓
Line Status Fact Adapter v0.2
Shi/Ying Fact Adapter v0.1
↓
Travel Line Evidence Adapter v0.3
Travel Destination Evidence Adapter v0.1
↓
Travel Execution Evidence Composer v0.3
↓
AE-TV-EXEC-003
↓
Domain Assessment v0.2 binding
↓
CP-TV-EXEC-003
```

所有层都保留 `readingRef`。

## 3. Calendar Evidence

允许：

```text
MONTH_COMMAND
MONTH_GENERATE
MONTH_SUPPORT
DAY_COMMAND
DAY_GENERATE
DAY_SUPPORT
→ traveler_calendar_support

MONTH_BREAK
MONTH_CONTROL
DAY_CONTROL
DAY_BREAK
→ traveler_calendar_constraint

VOID
→ traveler_void
```

不自动定向：

```text
SEASON_STATE
MONTH_HARMONY
DAY_HARMONY
DAY_CLASH
DARK_MOVING
```

理由：这些状态不能安全压成单一正负方向，尤其日冲已经由现有 Line Status producer 分解出 DARK_MOVING / DAY_BREAK 条件差异。

## 4. Destination Evidence

仅首轮 self travel：

```text
traveler = 世
destination = 应
```

允许：

```text
SHI_CONTROLS_YING
→ traveler_controls_destination
→ positive

YING_CONTROLS_SHI
→ destination_controls_traveler
→ negative
```

暂不定向：

```text
SHI_GENERATES_YING
YING_GENERATES_SHI
SHI_YING_SAME_ELEMENT
SHI_YING_SIX_HARMONY
SHI_YING_SIX_CLASH
```

represented traveler 不复用世应公式。

## 5. Evidence Composer

`TEC-EXEC-003` 只负责：

```text
same readingRef
same alternativeId
same duty
unique evidence id
valid sourceFactRefs
```

并合并 component resolution status。

它不解释 Evidence，不计数，不评分。

## 6. AE-TV-EXEC-003

认可方向：

```text
Support:
traveler_calendar_support
traveler_controls_destination

Adverse:
traveler_calendar_constraint
traveler_void
destination_controls_traveler
```

明确禁止旧 opaque evidence：

```text
traveler_vitality
destination_relation
route_process_obstruction
transport_disruption
```

旧 placeholder 若进入 v0.3 packet，直接 fail closed，而不是静默沿用。

组合仍为：

```text
support only → supportive_evidence
adverse only → adverse_evidence
support + adverse → mixed_evidence
none → insufficient_evidence
```

不进行数量加权。

## 7. CP-TV-EXEC-003

只接受：

```text
assessmentRef = travel_execution_assessment_v0.3
assessmentVersion = 0.3
contractFamily = travel_execution_assessment
semanticMeaning = journey_execution_outcome
same readingRef
```

允许的 strict order 仍只有：

```text
supportive_evidence vs adverse_evidence
```

`mixed_evidence` 不排序；`insufficient_evidence` 不排序；跨 reading 直接 incomparable。

## 8. 一个新的 blocker：Travel Alternative Anchoring

本轮可以完成：

```text
单个旅行方案
Fact → Evidence → Assessment
```

但不能声称已经完成真实的：

```text
方案 A vs 方案 B
Fact → Evidence → Assessment → Comparator
```

原因：当前传统结构中：

```text
self traveler = 世
destination = 应
```

只能稳定锚定一个 bounded destination。

不能为了测试硬编码：

```text
应 = A
另一任意爻 = B
```

也不能把两个不同 reading 的 Assessment 当作同一 Choice Framework。

因此新增 blocker：

```text
PRR-TRAVEL-ALTERNATIVE-ANCHOR
```

在该 Resolver / anchoring contract 完成前，CP-TV-EXEC-003 只验证 Comparator 机制和同 reading scope，不代表产品已能自动比较两个旅行方案。

## 9. 仍未进入 v0.3 的 Evidence

```text
route_process_obstruction
transport_disruption
```

原因仍是缺少 provenance-backed atomic Fact producer。

尤其：

```text
transportDisrupted=true
```

属于 conclusion-shaped placeholder，不能直接作为 Formal Fact。

## 10. Reading identity blocker

当前各 adapter 要求显式 `readingRef`，但正式 runtime 尚没有完成审计的 stable reading-id producer。

`castTimestamp` 可作为阅读 provenance 的组成信息，但不能单独默认为长期唯一 readingRef。

因此：

```text
readingRef producer reviewed = false
formalEligible = false
```

## 11. Regression

新增：

```text
tests/liuyao-travel-execution-evidence-compose-pretraining-v03-tests.js
tests/liuyao-travel-execution-assessment-pretraining-v03-tests.js
tests/liuyao-travel-execution-comparator-pretraining-v03-tests.js
tests/liuyao-travel-execution-reading-scoped-e2e-v03-tests.js
```

并加入：

```text
scripts/run-liuyao-assessment-comparator-design-regressions.mjs
```

当前环境未实际执行这一批最新 regression，因此状态必须保持：

```text
regressionAdded = true
regressionExecuted = false
```

不能写成 verified/passed。

## 12. Formal Expansion gate

仍然：

```text
active evaluator = 0
active comparator = 0
current route mutation = false
training = false
Formal Expansion = not authorized
```

只有用户后续明确授权 Formal Expansion 后，才允许进入正式注册评估。

## 13. 结论

```text
single-alternative provenance chain = implemented design-only
reading scope = carried end-to-end
opaque vitality/destination placeholders = removed from v0.3
multi-alternative travel anchoring = unresolved
route/transport disruption provenance = unresolved
readingRef producer = unresolved
latest regression = added, not executed
Formal Expansion = locked
```
