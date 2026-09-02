# 龟甲 · 六爻 Travel Line Status → Evidence Mapping Review v0.1

日期：2026-09-02

状态：`mapping_review_partial_design_only`

范围：将既有 `buildLiuYaoLineStatus()` 原子状态映射到 Travel Domain Evidence。

> 不执行 Formal Expansion；不注册 Assessment / Comparator；不修改 `liuyao-core.js`、Time Engine、current-22。

## 1. 本轮只批准一个映射

```text
Line Status Fact: VOID
+
travelDuty = travel_execution
+
subject = resolved Traveler
→ Evidence type = traveler_void
→ polarity = negative
```

理由：

- `VOID` 已由共享六爻 line-status producer 计算；
- Travel 文献与既有 Rule Review 对“世空 / 旅行者空亡影响成行”已有直接支持；
- `AE-TV-EXEC-001` 已独立审查 `traveler_void|negative` 为 execution adverse evidence；
- 该映射不需要建立综合旺弱分数。

## 2. Safety 明确不复用

同一个：

```text
VOID
```

在当前 `travel_safety` 规则审查中没有被批准为直接安全风险方向。

因此：

```text
travel_safety
→ 不生成 traveler_void safety evidence
```

不能因为 execution 里 adverse，就自动复制到 safety。

## 3. 暂不批准的 Line Status

以下状态虽然已有 canonical producer：

```text
SEASON_STATE
MONTH_COMMAND
MONTH_HARMONY
MONTH_BREAK
MONTH_GENERATE
MONTH_CONTROL
MONTH_SUPPORT
DAY_COMMAND
DAY_HARMONY
DAY_CLASH
DARK_MOVING
DAY_BREAK
DAY_GENERATE
DAY_CONTROL
DAY_SUPPORT
```

但本轮均不得直接转换为：

```text
traveler_vitality positive/negative
supportive_evidence/adverse_evidence
```

原因：

1. 它们之间存在并行、冲突、触发与状态层差异；
2. `statusTag.type` 不是 Domain Assessment polarity；
3. 旺弱/有效性综合规则尚未独立审查；
4. 禁止以 support/constraint 数量形成 hidden score。

## 4. 新 adapter 的职责

```text
js/liuyao-travel-line-evidence-adapter-pretraining-v01.js
```

只做：

```text
resolved Traveler line atomic facts
→ reviewed duty-specific Travel Evidence
```

当前映射表：

| Duty | Source fact | Evidence | 状态 |
|---|---|---|---|
| travel_execution | VOID | traveler_void / negative | admitted_design_only |
| travel_safety | VOID | none | explicitly_not_admitted |
| travel_disruption_journey | VOID | none | not_reviewed |
| travel_disruption_transport | VOID | none | not_applicable_to_transport_primary |

## 5. Provenance

Evidence 必须保留：

```text
sourceFactRefs
sourceAdapterRef
```

Evidence id 由：

```text
alternativeId + duty + evidence type + source fact ref
```

稳定构造，不能用数组序号代替 provenance。

## 6. Formal gate

本 adapter 输出全部继续：

```text
formalEligible = false
currentRuntimeReachable = false
registered = false
```

直到：

```text
technical gate passed
+
explicit user authorization for Formal Expansion
```
