# 龟甲 · 六爻 Line Effectiveness Synthesis Readiness v0.1

日期：2026-09-02

状态：`not_ready_do_not_build_global_vitality`

范围：为未来 Domain Assessment 审计六爻主要观察爻的共享“有效性 / 旺衰”中间层是否已经具备实现条件。

> 本文件是 design-only 架构审计；不执行 Formal Expansion，不修改 `liuyao-core.js`、`liuyao-interpretation.js`、Time Engine、current-22。

## 1. 已存在的底层能力

`js/liuyao-core.js` 的 `buildLiuYaoLineStatus()` 已统一产生：

```text
SEASON_STATE
MONTH_COMMAND / MONTH_HARMONY / MONTH_BREAK
MONTH_GENERATE / MONTH_CONTROL / MONTH_SUPPORT
DAY_COMMAND / DAY_HARMONY / DAY_CLASH
DAY_GENERATE / DAY_CONTROL / DAY_SUPPORT
DARK_MOVING / DAY_BREAK
VOID
```

因此底层日月、旬空和原始状态计算已经共享化。

## 2. 已存在的 Presentation helper

`js/liuyao-interpretation.js` 已有：

```text
classifyTargetState(target)
```

它将 status / move tags 分为：

```text
support
constraint
trigger
```

并用于 learner-facing headline / explanation。

这说明代码中已有展示层分类经验，但它不是正式 Effectiveness / Assessment contract。

不得直接晋升的原因：

1. Presentation helper 的职责是解释，不是事实规范；
2. hard-coded `SUPPORT_CODES / CONSTRAINT_CODES / TRIGGER_CODES` 没有独立版本化 contract；
3. 它把 original status 与 move tags 一起分类，不能自动等同“静态爻有效性”；
4. headline 中存在优先级选择，不可反推成 formal weighting；
5. 它没有处理 provenance dedup / source overlap。

## 3. 当前最大的重复计权风险

例如：

```text
SEASON_STATE = 月令旺
MONTH_COMMAND = 临月建
```

可能来自同一个月令事实的不同描述层。

若未来直接：

```text
support tag count
```

会把同一个基础来源重复算成两份支持。

同理：

```text
DAY_CLASH
DARK_MOVING
DAY_BREAK
```

并不是三个可以简单相加的强弱分数，而是根据动静、月助等前提分化出的不同状态职责。

因此：

```text
status tag count = forbidden
```

## 4. Global travelerVitality 的当前判定

当前不存在足够依据注册：

```text
Line Facts
→ global line vitality = positive / negative
```

也不建议只为了 Travel 建立：

```text
TravelerStrengthEngine
```

因为同一主要观察爻有效性会被 Career / Study / Litigation / Lost Property 等多个主题复用。

如果建立共享层，必须是 LiuYao-wide 的独立架构，而不是 Travel 私有实现。

## 5. 更稳的首轮路径

当前优先采用：

```text
atomic Line Status Fact
→ duty-reviewed atomic Domain Evidence
→ Domain Assessment
```

而不是：

```text
atomic Line Status Fact
→ hidden global strength score
→ Domain Assessment
```

候选原子职责：

### Calendar support candidates

```text
MONTH_COMMAND
MONTH_GENERATE
MONTH_SUPPORT
DAY_COMMAND
DAY_GENERATE
DAY_SUPPORT
```

### Calendar constraint candidates

```text
MONTH_BREAK
MONTH_CONTROL
DAY_CONTROL
DAY_BREAK
```

### Separate state

```text
VOID
```

### Trigger/context only until separately reviewed

```text
MONTH_HARMONY
DAY_HARMONY
DAY_CLASH
DARK_MOVING
SEASON_STATE
```

以上只是架构候选，不等于已注册 Evidence mapping。

## 6. 为什么 SEASON_STATE 暂不进入方向 Evidence

`SEASON_STATE` 与月建五行关系高度相关，并且 `MONTH_COMMAND / MONTH_GENERATE / MONTH_SUPPORT / MONTH_CONTROL` 已表达更具体的月令作用。

在 provenance dedup 设计完成前，将 `SEASON_STATE` 再作为一份支持/制约 Evidence 会有明显双计风险。

因此首轮应把它保留为：

```text
context / display fact
```

而不是独立 directional evidence。

## 7. 为什么 trigger 不进入 vitality

```text
DAY_HARMONY
DAY_CLASH
DARK_MOVING
```

主要包含激活、合起/合绊、冲动/冲破等职责。

它们不能统一映射：

```text
positive
negative
```

必须由具体 Rule / Assessment 结合动静、月助、current target 等解释。

## 8. 下一步建议

在不做 Formal Expansion 的前提下，可继续做一个：

```text
Travel Execution Atomic Calendar Evidence Review v0.1
```

仅审查：

```text
MONTH_COMMAND / MONTH_GENERATE / MONTH_SUPPORT / DAY_COMMAND / DAY_GENERATE / DAY_SUPPORT
MONTH_BREAK / MONTH_CONTROL / DAY_CONTROL / DAY_BREAK
```

是否可进入 `travel_execution` 的 atomic evidence vocabulary。

必须保持：

```text
no counting
no score
no probability
no global strong/weak
mixed remains mixed
```

## 9. 当前结论

```text
shared line status producer = exists
presentation classifier = exists but not promotable
canonical global line vitality = does not exist
build new Travel-only vitality engine = rejected
atomic domain evidence path = preferred next experiment
Formal Expansion = not authorized
```
