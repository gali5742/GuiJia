# 龟甲 · 六爻 Travel Destination Relation Evidence Review v0.1

日期：2026-09-02

状态：`review_complete_design_only`

范围：将既有世应结构事实用于 `travel_execution` 的 destination relation Evidence。

> 本 Review 不执行 Formal Expansion，不修改 `liuyao-core.js`、Rule Registry、Time Engine 或 current-22。

## 1. 已存在的结构 Fact producer

`js/liuyao-core.js`：

```text
buildShiYingSummary(rows)
```

已经产生：

```text
SHI_YING_SAME_ELEMENT
SHI_GENERATES_YING
YING_GENERATES_SHI
SHI_CONTROLS_YING
YING_CONTROLS_SHI
SHI_YING_NO_DIRECT_ELEMENT_RELATION
SHI_YING_SIX_HARMONY
SHI_YING_SIX_CLASH
SHI_MOVING
YING_MOVING
SHI_YING_BOTH_MOVING
SHI_VOID
YING_VOID
```

这些结构 facts 的 `type` 主要为 `neutral / trigger / transform / void`，没有把生克关系直接写成 domain success/failure，因此适合作为上游 provenance。

## 2. Travel 文献当前直接支持的关系

Travel 已完成研究中，《黄金策·出行》/《卜筮全书》同源簇明确支持：

```text
世 = 出行人
应 = 所往之地
世克应 → 所向通达倾向
应克世 → 当前行程不利倾向
```

因此在以下前提同时成立时：

```text
travelerSubject.relationToQuerent = self
destination role actually resolved to 应
travelDuty = travel_execution
```

可批准：

```text
SHI_CONTROLS_YING
→ traveler_controls_destination
→ positive

YING_CONTROLS_SHI
→ destination_controls_traveler
→ negative
```

## 3. 为什么只限 self traveler

代表他人出行时：

```text
Traveler Primary
→ 实际关系爻
```

并不必然等于世。

此时：

```text
SHI_CONTROLS_YING
```

只说明世应关系，不能自动解释成：

```text
traveler controls destination
```

因此 represented traveler 必须等待未来：

```text
selected traveler line
↔ selected destination line
```

的一般化 line-to-line relation fact provider。

禁止 fallback：

```text
represented traveler → 世
```

## 4. 暂不批准的世应关系

### SHI_GENERATES_YING

```text
not_directional_yet
```

可能含主动付出、趋向、耗力等不同解释，现有 Travel source synthesis 不足以把它直接定为 execution positive/negative。

### YING_GENERATES_SHI

```text
not_directional_yet
```

虽可直觉解释为目的地生世，但当前 Travel Review 没有完成足够独立来源审查，不从五行常识直接补规则。

### SHI_YING_SAME_ELEMENT

```text
not_directional_yet
```

比和不等于“必然顺利”。

### SHI_YING_SIX_HARMONY

```text
context_or_rule_specific
```

合可表示关系黏合，也可能形成留滞；不能统一 positive。

### SHI_YING_SIX_CLASH

```text
trigger_or_rule_specific
```

冲本身不是统一失败结论。

### MOVING / VOID

由各自职责层处理；不得在 destination relation adapter 重复生成 Evidence。

## 5. Evidence vocabulary migration

旧 isolated：

```text
destination_relation | positive/negative
```

过于 opaque。

建议 v0.3 前逐步迁移为：

```text
traveler_controls_destination | positive
destination_controls_traveler | negative
```

并保留：

```text
sourceFactRefs
travelerRoleBinding
destinationRoleBinding
```

## 6. Shared Fact Adapter

建议新增：

```text
js/liuyao-shi-ying-fact-adapter-pretraining-v01.js
```

职责只做：

```text
buildShiYingSummary().facts
→ atomic traceable ShiYing facts
```

不重新计算生克、六合、六冲、动静或旬空。

## 7. Formal gate

所有新 adapter / Evidence 仍：

```text
currentRuntimeReachable = false
registered = false
formalEligible = false
```

直到技术 gate 与用户明确 Formal Expansion 授权同时满足。

## 8. 结论

```text
self traveler 世↔应 control relation = evidence-ready design-only
represented traveler destination relation = blocked by general line-to-line relation provider
生/比/合/冲 = not automatically directional
opaque destination_relation formal promotion = rejected
Formal Expansion = not authorized
```
