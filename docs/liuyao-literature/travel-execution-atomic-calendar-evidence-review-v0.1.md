# 龟甲 · 六爻 Travel Execution Atomic Calendar Evidence Review v0.1

日期：2026-09-02

状态：`review_complete_design_only`

范围：`travel_execution` 中 Traveler Primary 的月建 / 日辰原子 Evidence。

> 本 review 不执行 Formal Expansion，不修改现有 Time Engine / `liuyao-core.js` / current-22，也不把原子 Evidence 聚合成 strong/weak score。

## 1. 文献依据

已完成 Travel 研究中，《增删卜易·出行章》支持：

```text
占卜应以世爻为先
旺相宜行
世为出行人
生旺有气则吉
休囚空破则不宜行
```

本轮进一步核对《增删卜易》月建 / 日辰基础规则：

```text
月建可生、合、比、拱、扶衰弱之爻
月建可冲、克、刑、破旺强之爻
日辰能生克冲合用神
日辰生用 / 比扶 / 临日建可形成得助
日辰克用可形成受伤克
```

同时日冲必须分情形：

```text
冲旺相静爻 → 暗动
冲衰弱静爻 → 日破
```

因此不能把所有 `DAY_CLASH` 统一映射为 adverse。

## 2. 首轮 admitted atomic mapping

### 2.1 Calendar support

```text
MONTH_COMMAND
MONTH_GENERATE
MONTH_SUPPORT
DAY_COMMAND
DAY_GENERATE
DAY_SUPPORT
```

可映射为：

```text
evidenceType = traveler_calendar_support
polarity = positive
```

注意：这只是“存在明确日月扶助事实”，不是：

```text
traveler is strong
journey will succeed
```

### 2.2 Calendar constraint

```text
MONTH_BREAK
MONTH_CONTROL
DAY_CONTROL
DAY_BREAK
```

可映射为：

```text
evidenceType = traveler_calendar_constraint
polarity = negative
```

同样只表达明确受制 / 破的信息，不是最终失败判断。

### 2.3 Void

沿用已审查：

```text
VOID
→ traveler_void / negative
```

## 3. 暂不映射为方向 Evidence

### SEASON_STATE

```text
context_only
```

原因：与月令 source overlap 明显，容易和 `MONTH_COMMAND / GENERATE / SUPPORT / CONTROL` 双计。

### MONTH_HARMONY

```text
context_or_rule_specific
```

月合通常表示有用，但出行中“合住 / 留滞”还可能承担行动阻滞职责，不能直接 positive。

### DAY_HARMONY

```text
trigger_or_rule_specific
```

尤其动爻逢合存在合住 / 留滞解释。

### DAY_CLASH

```text
trigger_only
```

因为其方向必须结合旺衰与动静：

```text
旺静 → DARK_MOVING
衰静 → DAY_BREAK
动爻 → 冲动 / trigger
```

### DARK_MOVING

```text
execution_activation_candidate
not_supportive_yet
```

出行章存在“世爻暗动者，必去”的直接行动信息，但“必去”不等同“吉 / 顺利完成”。

因此未来若使用，应建立：

```text
execution_activation
```

独立语义，而不是偷偷归入 supportive evidence。

## 4. 禁止 Evidence counting

即使出现：

```text
MONTH_COMMAND
DAY_GENERATE
```

也不能因为有两条 support 就比一条 constraint “2:1 胜出”。

当前 Assessment 只允许表达：

```text
support only → supportive_evidence
constraint only → adverse_evidence
both → mixed_evidence
```

若未来需要解决 mixed 内部权重，必须另做传统规则研究与 calibration，不得用数量近似。

## 5. 与 travelerVitality fixture 的关系

旧 isolated fixture：

```text
traveler_vitality / positive|negative
```

不再建议作为未来 formal evidence vocabulary。

建议迁移方向：

```text
traveler_calendar_support
traveler_calendar_constraint
traveler_void
```

以及后续独立研究的：

```text
traveler_transformation_support
traveler_transformation_constraint
execution_activation
```

这样保留 provenance，也避免一个 opaque vitality token 吞掉多层传统规则。

## 6. Assessment candidate 建议

不要修改 `AE-TV-EXEC-001` 的已验证行为。

下一步另建：

```text
AE-TV-EXEC-002
```

作为 atomic-evidence migration candidate。

首轮只新增理解：

```text
traveler_calendar_support|positive
traveler_calendar_constraint|negative
traveler_void|negative
```

保留 mixed、不计分、不概率化。

## 7. 当前结论

```text
atomic calendar evidence review = complete
travelerVitality formal promotion = rejected
AE-TV-EXEC-001 = preserved as isolated prototype
AE-TV-EXEC-002 = eligible for isolated implementation
Formal Expansion = not authorized
```
