# 龟甲 · 六爻 Shared Line-Pair Structural Fact Provider Research v0.1

日期：2026-09-02

状态：`design_required_not_implemented`

目标：解决 Travel 的 `route_process_obstruction / transport relation` 等 Evidence 在进入主题层之前缺少通用、可追踪的“爻 A 与爻 B 结构关系”Fact producer 问题。

> 本文件不修改 `liuyao-core.js`，不复制五行生克算法，不执行 Formal Expansion。

## 1. 当前仓库已有能力

`liuyao-core.js` 内部已经存在多套关系计算：

```text
buildShiYingSummary()
→ 世应之间五行生克、六合、六冲、动静、旬空

buildUseGodEntryRelationFacts()
→ 某条目与当前用神之间的生克合冲

buildDirectMovingUseFacts()
→ 动爻 / 变爻与当前用神之间的直接作用
```

其中可见事实代码包括：

```text
MOVING_LINE_GENERATES_USE
MOVING_LINE_CONTROLS_USE
USE_GOD_ENTRY_GENERATES_USE
USE_GOD_ENTRY_CONTROLS_USE
...
```

这证明底层算法并不缺失。

## 2. 为什么 next-topic 不能直接复用 legacy UseGod facts

这些 facts 的 target 语义写死为：

```text
USE / 用神
```

而 next-topic ObservationPlan 的 Primary 可能是：

```text
Traveler
represented litigant
review authority
transport operation
institution
contact actor
```

它们未必等于当前 legacy `useGodSelection`。

如果 Travel 为了得到“间爻克 Traveler”而调用 legacy UseGod 分析，就会造成：

```text
Modern / next-topic Primary
→ 被迫重新解释为 current UseGod
```

这违反：

```text
Modern Semantic Object ≠ Traditional Observation Object
```

以及已经建立的 Provider / Resolver 分层。

## 3. 为什么也不应在 Travel 内复制五行算法

不接受：

```text
Travel adapter 自己维护 generateMap/controlMap/heMap/chongMap
```

原因：

- 同一五行关系算法会出现多份实现；
- current core 规则修订后 Travel 可能漂移；
- 其他新主题也会重复复制；
- Fact provenance 会变成“主题自己推导”，而不是共享结构事实。

因此需要共享 provider，而不是 Travel helper。

## 4. 推荐的共享 Fact 语义

未来建议生产完全不含“用神”或主题结论的中性事实：

```text
LINE_PAIR_SAME_ELEMENT
LINE_A_GENERATES_LINE_B
LINE_B_GENERATES_LINE_A
LINE_A_CONTROLS_LINE_B
LINE_B_CONTROLS_LINE_A
LINE_PAIR_SIX_HARMONY
LINE_PAIR_SIX_CLASH
```

动静也应作为独立结构字段 / Fact：

```text
sourceMoving
targetMoving
sourceDarkMoving
```

而不是产生：

```text
route_obstruction
travel_support
litigation_pressure
```

这些属于 Domain Evidence。

## 5. 推荐 Fact contract

```ts
interface LiuYaoLinePairFactV01 {
  schemaVersion: 1
  readingRef: string
  factRef: string
  sourceLineRef: string
  targetLineRef: string
  sourcePosition: 1|2|3|4|5|6
  targetPosition: 1|2|3|4|5|6
  sourceCode:
    | 'LINE_A_GENERATES_LINE_B'
    | 'LINE_B_GENERATES_LINE_A'
    | 'LINE_A_CONTROLS_LINE_B'
    | 'LINE_B_CONTROLS_LINE_A'
    | 'LINE_PAIR_SAME_ELEMENT'
    | 'LINE_PAIR_SIX_HARMONY'
    | 'LINE_PAIR_SIX_CLASH'
  atomic: true
  conclusionShaped: false
}
```

`factRef` 必须 reading-scoped。

## 6. source / target 方向必须显式

不能只输出：

```text
GENERATE
CONTROL
```

必须保留：

```text
A controls B
B controls A
```

否则不同主题无法判断哪一个现实角色在作用于哪一个角色。

## 7. Travel Route Process 如何消费

未来 self travel：

```text
Traveler line = 世
Destination = 应
间爻 = 世应之间的中间位置
```

Domain Evidence 可在独立 Review 后解释：

```text
moving interval line controls Traveler
→ route_process_obstruction candidate

moving interval line generates Traveler
→ route_process_support candidate
```

但共享 Fact provider 本身只输出：

```text
line X controls line Y
line X is moving
```

不输出“阻碍”。

## 8. Represented Traveler

代问他人出行时：

```text
Traveler ≠ 世
```

因此更不能把间爻逻辑写成全局“克世=阻碍”。

未来应先有：

```text
PRR-TRAVELER-SUBJECT
→ concrete traveler line ref
```

再把 route-process candidate 与该 concrete line 建关系。

这也是共享 line-pair provider 必须 target-agnostic 的原因。

## 9. Transport 如何消费

父母 transport line 解析出来后，未来可以使用同一共享 Fact：

```text
transport line → Traveler
calendar → transport line
moving line → transport line
```

由 Travel Disruption / Execution Assessment 分别解释。

这比：

```text
transportDisrupted = true
```

有完整得多的 provenance。

## 10. 跨主题复用

该 provider 不只是 Travel 需要。

潜在复用：

```text
represented litigation party ↔ counterparty
academic artifact ↔ review authority candidate
career current employment ↔ contextual actor
person contact actor ↔ contextual line
lost-property object candidate ↔ contextual actor
```

是否真的使用由各主题 Rule Review 决定。

## 11. 当前实现边界

现在不实现 relation algorithm。

原因：最合理的实现地点是共享 LiuYao structural Fact 基础设施，需要未来从 `liuyao-core.js` 中已有关系函数抽取 / 暴露单一 canonical provider。

在用户尚未允许 Formal Expansion / shared-runtime integration 前，不应直接重构 core。

因此：

```text
Shared Line-Pair Fact Provider
status = design_required_not_implemented
```

## 12. 对当前 Travel v0.3 的影响

已进入 provenance chain：

```text
calendar line status
static VOID
self 世应 control relation
```

仍 blocked：

```text
route_process_obstruction
route_process_support
represented-traveler destination relation
transport ↔ traveler relation
transport disruption causal relation
```

这些不能靠旧 opaque booleans 回填。

## 13. Activation gate

未来实现前要求：

```text
single canonical five-element relation source selected
reading-scoped line identity available
source/target line refs stable
no legacy USE semantic hard-coded in Fact code
movement is structural fact, not outcome
relation producer regression across all 6x6 line positions
existing current-22 behavior unchanged
explicit user authorization before shared runtime integration
```

## 14. 结论

```text
relation algorithm exists internally
shared target-agnostic Fact API does not yet exist
Travel must not call legacy UseGod relation facts as a shortcut
Travel must not duplicate core five-element logic
next required shared infrastructure = reading-scoped Line-Pair Structural Fact Provider
```
