# 龟甲 · 六爻 Move / Transform Fact Provenance Review v0.1

日期：2026-09-02

状态：`review_complete_design_only`

范围：六爻动变原子事实的 provenance 适配。

> 本 Review 不执行 Formal Expansion，不修改 current-22，不修改 Time Engine，不修改 `buildMoveAnalysis()`，不注册任何 Domain Assessment / Comparator。

## 1. 当前 canonical producer

仓库已有：

```text
js/liuyao-core.js#buildMoveAnalysis
```

它基于原爻、变爻、月建与旬空生成动变标签，包括：

```text
TRANSFORM_PEER
RETURN_GENERATE
RETURN_CONTROL
RETURN_HARMONY
RETURN_CLASH
PROGRESS
RETREAT
TRANSFORM_GROWTH / TRANSFORM_PROSPER
TRANSFORM_TOMB / TRANSFORM_EXTINCTION
TRANSFORM_VOID
TRANSFORM_MONTH_BREAK
MOVING_CHANGE
```

因此 next-topic 不应重算进退、回头生克、化空、化破等状态。

## 2. Fact 层职责

Move Fact Adapter 只负责：

```text
existing moveTags
+
readingRef
+
line snapshot
↓
reading-scoped atomic facts
```

不负责：

```text
吉凶解释
Domain Evidence polarity
Assessment
评分
概率
推荐
```

## 3. reading scope

原型 fact ref：

```text
READING:<readingRef>:MOVE:<position>:<sourceCode>
```

同一爻同一动变代码在不同 reading 中必须产生不同 ref。

`readingRef` 由未来起卦边界提供；本 Adapter 不生成 reading identity。

## 4. move tag type 不等于 Domain 结论

`buildMoveAnalysis()` 自带：

```text
support
constraint
transform
trigger
void
neutral
```

这些是底层结构标签，不得在 Shared Fact 层直接转换为：

```text
supportive_evidence
adverse_evidence
winner
```

例如：

```text
RETREAT
```

在特定“交通工具运行/班次”现代案例中可成为延误 Evidence；但这不等于 `RETREAT` 在所有主题中全局 adverse。

同理：

```text
PROGRESS
```

也不能因为 `type=support` 就自动解释为“准点/顺利”。

## 5. 允许保存的原子信息

每条 Fact 至少保留：

```text
readingRef
factRef
sourceLayer = liuyao_move_analysis
sourceRef = liuyao-core.buildMoveAnalysis
sourceCode
sourceTagType
subjectRef.position
subjectRef.branch / element
subjectRef.changedBranch / changedElement
atomic = true
conclusionShaped = false
```

可保留 `text` 供审计，但下游不得解析自然语言文本做规则判断。

## 6. moving precondition

当前 `app.js` 只在爻实际发动时调用：

```text
moving[index] ? buildMoveAnalysis(...) : []
```

因此本 Adapter v0.1 要求：

```text
line.moving = true
moveTags = non-empty array
```

静爻不是“无动变 Fact”；它属于 `not_applicable` 场景，不应伪造 `MOVING_CHANGE`。

## 7. 与 Time Engine 的边界

以下属于起卦时动变结构：

```text
RETREAT
PROGRESS
TRANSFORM_VOID
TRANSFORM_MONTH_BREAK
...
```

它们不是未来日期上的 TimeFact 转换事件。

因此：

```text
Move Fact
≠ TimeFact
```

不得借本 Adapter 修改或重算 Time Engine。

## 8. Formal gate

Formal 前仍必须完成：

```text
readingRef producer review
runtime cast snapshot binding
source Fact ref persistence policy
consumer-specific Evidence review
explicit user authorization for Formal Expansion
```

## 9. 结论

```text
buildMoveAnalysis = canonical move/transform producer
Move Adapter = provenance only
RETREAT = structural atomic fact, not global adverse
PROGRESS = structural atomic fact, not global supportive
no recomputation
no scoring
no runtime registration
Formal Expansion = not authorized
```
