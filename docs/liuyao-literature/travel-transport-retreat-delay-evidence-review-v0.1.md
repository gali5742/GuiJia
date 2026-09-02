# 龟甲 · 六爻 Travel Transport RETREAT → Delay Evidence Review v0.1

日期：2026-09-02

状态：`review_complete_design_only`

主题：`travel.travel_disruption_transport`

> 本 Review 只审一条窄 Evidence：**已明确解析到具体交通工具爻后，`RETREAT` 是否可作为“推后 / 延误”方向证据。** 不执行 Formal Expansion，不注册 Assessment，不修改 current-22 / Time Engine。

## 1. 已有主题研究前提

`travel-research-v1.0.md` 已完成并审核：

```text
父母 → 交通工具 / 车船 / 运输载体
```

并区分：

```text
我的行程会不会被飞机耽误
→ Traveler Primary + Transport Domain

这趟飞机 / 火车本身会不会延误取消
→ Transport Primary candidate
```

因此本 Review 仅适用于：

```text
currentTargetAspect = transport_operation
```

或已经由上游明确解析出 concrete transport object 的场景。

## 2. 现代直接案例

王虎应《六爻预测自修宝典》“预测出行”例六：

```text
午月乙卯日，测到西藏如何
```

其判断明确采用：

```text
父母持世 → 父母为交通工具，六爻位置对应坐飞机
父母动而化退 → 飞机会推后飞行、晚点
```

结果记录为因大雨影响起飞，第二天才到西藏。

这一案例对本 Review 的直接支持是：

```text
resolved transport line
+
RETREAT move state
→ delay / postponement evidence
```

### 分类

```text
modern_author_direct_case_support
```

它不是足以全局推广的“退神 = 所有交通必延误”稳定共识。

## 3. 不能从该案例推出什么

不得推出：

```text
没有 RETREAT → 一定准点
PROGRESS → 一定准点 / 提前
RETURN_CONTROL → 一定取消
TRANSFORM_VOID → 一定取消
TRANSFORM_MONTH_BREAK → 一定取消
任何 constraint tag → 一定延误
```

这些都需要独立 Evidence Review。

## 4. Transport Object Resolver 前置条件

已有研究已经确认：

```text
父母 = transport class
≠ 任意第一个父母爻 = 当前航班
```

同卦可能有多个父母爻，现代案例中对“原航班 / 替代航班”的对应具有情境性。

所以本 Evidence Adapter 必须接收一个外部提供的：

```text
transportBinding.status = resolved
transportBinding.bindingRef
transportBinding.position
transportBinding.relation = 父母
transportBinding.objectClass = transport_operation
```

Adapter 自身不得 first-match 父母，也不得自行选择 concrete line。

## 5. Fact provenance

上游必须来自：

```text
liuyao-core.buildMoveAnalysis
↓
liuyao-move-transform-fact-adapter-pretraining-v01
↓
reading-scoped atomic Move Fact
```

其中：

```text
sourceCode = RETREAT
```

才进入本 Review 的 admitted mapping。

不得重新计算进退神。

## 6. Admitted Evidence v0.1

唯一映射：

```text
RETREAT
↓
transport_delay_or_postponement
polarity = negative
```

这里的 `negative` 只表示：

```text
对 transport_operation 按计划运行不利的 Evidence
```

不是：

```text
事故
危险
取消
最终走不成
```

## 7. 空证据的含义

若 concrete transport line 没有 `RETREAT`：

```text
resolutionStatus = resolved
evidence = []
```

其含义只是：

```text
本 v0.1 没有发现已审核的 RETREAT-delay Evidence
```

绝不能转换为：

```text
supportive_evidence
on_time
safe
will_depart
```

## 8. Assessment readiness

本 Review 只使下面一条成立：

```text
RETREAT → delay/postponement Evidence
```

它**不足以建立完整 transport disruption Assessment**，因为目前缺少对称、经审核的正向“按时运行” Evidence 集，也未完成：

```text
PRR-TRAVEL-TRANSPORT-OBJECT
```

因此：

```text
transportAssessmentReady = false
comparatorReady = false
```

## 9. Formal gate

Formal 前仍需：

```text
transport object resolver reviewed
readingRef runtime producer reviewed
Move Fact provenance runtime binding
additional transport operation Evidence review
Assessment rule review
regression actually executed
explicit user authorization for Formal Expansion
```

## 10. 结论

```text
RETREAT on resolved transport line
→ admitted narrow delay/postponement Evidence

absence of RETREAT
→ no inference

PROGRESS / RETURN_CONTROL / TRANSFORM_VOID / other move tags
→ not admitted in v0.1

transport resolver
→ still blocked

Assessment
→ not ready

Formal Expansion
→ not authorized
```
