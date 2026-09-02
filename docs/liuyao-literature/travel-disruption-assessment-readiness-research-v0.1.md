# 龟甲 · 六爻 Travel Disruption Assessment Readiness Research v0.1

日期：2026-09-02

状态：`completed_blocked_by_evidence_source_contract`

范围：

```text
travel_disruption_journey
travel_disruption_transport
```

> 本专项只判断两类 Disruption 是否已经具备进入 isolated Domain Assessment candidate 的条件。不注册 Evaluator，不注册 Comparator，不修改 current-22、正式 Rule Registry、Time Engine，也不构成 Formal Expansion。

---

## 1. 上游研究已经支持什么

以下属于既有文献研究与 Rule Review 已支持的结论，不是本轮新推断：

```text
travel_disruption_journey
→ current target = traveler_journey
→ Traveler = Primary
→ transport = Domain

travel_disruption_transport
→ current target = transport_operation
→ 父母 / transport operation = Primary candidate
→ traveler = optional affected Role
```

既有来源还支持：

```text
世 / 实际 Traveler
→ 自身行程主轴

父母
→ 车船 / 交通工具 / 运输载体
```

现代航空材料支持“飞机 / 航班本身成为 current target 时，父母可以升为 transport observation candidate”，但这一点的成熟度低于“自占自身出行以世为主”。

---

## 2. 新增材料核验

### 2.1 朱辰彬《古筮真诠·进阶篇》航班延误案例

已在用户资料库重新检索到一例：

```text
原计划次日飞回参加孩子酒席
当前航班延误导致次日航班安排可能变化
于是占问次日能否参加酒席
```

这条材料有价值，但它主要支持：

```text
既有航班延误
可以成为“我的次日行程 / 到达是否实现”的 causal context
```

它并不能直接证明：

```text
父母旺 = 航班必定准点
父母衰 = 航班必定延误
```

也不能把“能否参加酒席”的 event outcome 简化成“航班本身运行状态”。

因此它强化的是：

```text
journey-focused disruption
≠
transport-focused disruption
```

而不是提供 transport-operation 的完整正负 Assessment rule。

### 2.2 朱辰彬舟行安危案例

另一例舟行暴风雨材料明确讨论：

```text
安危 / 忧患
```

并以子孙 / 官鬼相关动象讨论安全方向。

该材料属于：

```text
travel_safety
```

不能因为同时有“交通工具 + 风雨”就移植为：

```text
航班延误 / 准点 Assessment
```

这进一步支持 duty separation。

---

## 3. 当前 `buildTravelEvidence()` 的真实能力

当前 isolated module：

```text
js/liuyao-travel-pretraining-v01.js
```

可以消费：

```text
travelerVitality
travelerVoid
destinationSupportsTraveler
destinationControlsTraveler
routeObstruction
safetySupport
hazardPressure
transportDisrupted
```

并生成：

```text
traveler_vitality
traveler_void
destination_relation
route_process_obstruction
safety_support
hazard_pressure
transport_disruption
```

但当前仓库审计没有找到这些字段的独立正式 Fact producer。

因此现阶段更准确的定位是：

```text
buildTravelEvidence()
= isolated Evidence normalizer / fixture consumer
```

而不是已经完成：

```text
ObservationPlan
→ resolved line facts
→ reviewed Fact producer
→ Evidence
```

的正式链路。

---

## 4. `transportDisrupted` 是当前最大问题

字段：

```text
transportDisrupted:boolean
```

名称本身已经接近 Assessment 结论。

若未来直接把它当 formal Fact：

```text
transportDisrupted = true
↓
transport_disruption negative
↓
Assessment = adverse
```

那么 Assessment 很可能只是重述上游已经写入的结论。

这是：

```text
conclusion-shaped fact leakage
```

不应进入正式架构。

Formal Evidence 更应来自可追踪的原子事实，例如未来经过独立 Review 后可能存在：

```text
transport subject line state
transport subject movement/change state
transport subject void/break state
transport subject relation to relevant context
explicit route-process obstruction fact
```

但这些这里只是架构方向，不是已批准规则。

---

## 5. Journey-focused disruption 的 Assessment 缺口

目标：

```text
我的行程能否按计划进行 / 到达
```

当前可见的 adverse-like isolated evidence：

```text
transport_disruption|negative
route_process_obstruction|negative
```

但存在三个问题。

### 5.1 缺少审核后的正向 schedule Evidence

不能写：

```text
没有 transport_disruption
→ supportive
```

因为：

```text
absence of negative evidence
≠ positive evidence
```

### 5.2 `traveler_vitality` 属于 general execution，不等于准点

旅行者状态好可以支持：

```text
能否成行 / 完成行程
```

但不能自动推出：

```text
准点
无延误
```

### 5.3 `traveler_void` 也不能自动解释为 schedule delay

已有传统支持更接近：

```text
不成行 / 宜止 / 退却
```

不是精确的：

```text
会晚点多久
```

因此 `travel_disruption_journey` 目前不能直接复制 `AE-TV-EXEC-001`。

---

## 6. Transport-focused disruption 的 Assessment 缺口更大

目标：

```text
这趟航班 / 火车本身是否按计划运行
```

现有研究支持：

```text
父母 = transport operation Primary candidate
```

但当前没有审核完成的：

```text
transport-operation positive Evidence schema
```

也没有稳定证明：

```text
父母旺相
→ 必然准点

父母衰弱 / 空破
→ 必然延误取消
```

所以当前不能构建对称：

```text
supportive_evidence
vs
adverse_evidence
```

更不能把：

```text
没有 adverse Evidence
```

当作 supportive。

---

## 7. Time Engine boundary

Disruption 天然容易诱导开发者去读取：

```text
时间作用
应期
trigger
```

然后生成：

```text
准点概率
延误时长
```

当前明确禁止。

现有 Time Engine 只能在未来经独立 Evidence Review 后作为：

```text
time fact source
```

被消费；不得：

```text
重新计算 Time Engine
将 support/constraint 直接映射为 delay score
将 trigger 个数映射为延误概率
```

---

## 8. Readiness decision

### `travel_disruption_journey`

```text
Observation Rule Review = complete
Intent boundary = complete
raw isolated Evidence normalizer = exists
formal Evidence-source contract = missing
reviewed positive schedule Evidence = missing
Assessment candidate = NOT READY
Comparator candidate = NOT READY
```

### `travel_disruption_transport`

```text
Observation Rule Review = complete / provisional transport Primary
Intent boundary = complete
raw isolated Evidence normalizer = exists
formal transport Fact producer = missing
positive transport-operation Evidence = missing
negative transport-operation Evidence provenance = incomplete
Assessment candidate = NOT READY
Comparator candidate = NOT READY
```

Transport-focused 的阻断强于 journey-focused。

---

## 9. Required next step

在继续 Disruption Assessment 前，应先建立：

```text
Travel Evidence Source Contract
```

至少明确：

```text
Fact 是谁生成的？
Fact 指向哪个 Observation subject？
是否来自 Time Engine？
是否是原子事实而不是结论型 boolean？
Evidence 如何保留 factRef / subjectRef / ruleRef？
哪些字段仅允许 synthetic regression 使用？
```

然后再决定是否需要针对：

```text
transport operation
```

做补充文献 / 案例研究，建立正向和负向 Evidence。

---

## 10. Final conclusion

本轮不应为了“把四个 Travel duty 都补齐”而强行实现 Disruption evaluator。

当前正确结论是：

```text
Travel Execution / Safety
→ 已形成 isolated Assessment / Comparator architecture samples

Travel Disruption
→ 暴露出更上游的 Evidence-source provenance gap
→ 先补 Fact → Evidence contract
→ 再谈 Assessment
```

Formal Expansion 继续保持未授权。
