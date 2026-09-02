# 龟甲 · 六爻 Travel Line Status Fact Provenance Audit v0.1

日期：2026-09-02

状态：`completed_design_only`

范围：Travel Assessment 上游 Fact provenance 审计。

> 本文件不执行 Formal Expansion，不注册任何新 Route / Rule / Assessment / Comparator，不修改 Time Engine，也不改变 current-22。

## 1. 审计结论

当前仓库已经存在共享的六爻爻位状态 producer：

```text
js/liuyao-core.js
→ buildLiuYaoLineStatus()
```

它统一产生原子状态，例如：

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
VOID
```

因此 Travel 不得另外实现一套月建、日辰、旬空或旺衰计算器。

但当前仓库没有发现一个经过独立审计、可被 Domain Assessment 直接消费的：

```text
line_effectiveness
traveler_vitality
strong / weak
positive / negative vitality
```

综合 producer。

所以：

```text
travelerVitality
```

只能继续作为 isolated fixture，不得视为 canonical Fact。

## 2. VOID 的实际来源

静态旬空已经由：

```text
buildLiuYaoLineStatus(line, monthBranch, dayBranch, xunKong, ...)
```

产生：

```text
{ code:'VOID', text:'旬空', type:'void' }
```

这说明静态 void 不需要 Travel 重新计算。

但是现有：

```text
js/liuyao-time-facts.js
```

主要规范：

```text
VOID_OUT
VOID_FILL
VOID_CLASH
VOID_VALUE_AFTER_OUT
```

等时间转换 Fact。

静态：

```text
line currently has VOID status
```

仍属于 Line Status，而不是一个现成的 canonical TimeFact record。

因此当前不能写成：

```text
travelerVoid → direct TimeFact ref
```

更准确的未来链路应是：

```text
buildLiuYaoLineStatus
→ atomic Line Status Fact
→ Travel Evidence adapter
→ duty-specific Assessment
```

若涉及出空 / 填实 / 冲空等时间变化，再引用现有 TimeFact / TimeEffect。

## 3. 为什么不能直接把 status tag 当 Assessment

现有 status tag 中虽然有：

```text
type = support | constraint | trigger | void
```

但这些只描述 line-status producer 的局部结构标签。

禁止直接建立全局转换：

```text
support → supportive_evidence
constraint → adverse_evidence
```

原因：

1. `DAY_HARMONY` / `DAY_CLASH` 等存在 trigger 职责；
2. 同一事实对 execution / safety / disruption 的职责不同；
3. 多个 status tag 如何共同形成“有效性”仍需要独立 Rule Review；
4. 直接按标签计数会重新引入 hidden scoring。

## 4. 对 Travel 当前 candidate 的影响

### 4.1 travelerVitality

当前：

```text
travelerVitality = synthetic fixture only
formalEligible = false
```

Formal 前必须替换为：

```text
atomic line status facts
+
reviewed effectiveness evidence synthesis
```

或者让 Assessment 直接消费审查后的 atomic Evidence，不能凭测试 fixture 推正式结论。

### 4.2 travelerVoid

可以确认 provenance 来源：

```text
line.statusTags[code=VOID]
```

但不是现成 TimeFact。

因此可先进入 design-only Line Status Fact Adapter，再由 Travel Evidence adapter 做职责映射。

### 4.3 routeObstruction / transportDisrupted

本次审计未发现 canonical producer。

继续保持：

```text
conclusion_shaped_placeholder
formalEligible = false
```

## 5. 架构决定

新增一个极薄的 design-only adapter：

```text
js/liuyao-line-status-fact-adapter-pretraining-v01.js
```

职责仅限：

```text
existing line.statusTags
→ traceable atomic Line Status Fact records
```

明确禁止：

```text
重新计算月日旺衰
重新计算旬空
汇总 strong / weak
生成 travelerVitality
计分
概率
Assessment
Comparator
```

## 6. Formal Expansion gate

即使该 adapter regression 全部通过，仍然：

```text
registered = false
currentRuntimeReachable = false
formalEligible = false
```

Formal Expansion 必须同时满足：

```text
technical readiness
+
explicit user authorization
```

当前用户尚未授权 Formal Expansion。
