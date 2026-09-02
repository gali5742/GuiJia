# 龟甲 · 六爻 Travel Safety Assessment Rule Review v0.1

日期：2026-09-02

状态：`assessment_rule_review_complete_candidate_only`

上游：

- `travel-research-v1.0.md`
- `travel-rule-review-v0.1.md`
- `travel-intent-schema-design-v0.1.md`
- `js/liuyao-travel-pretraining-v01.js`
- `data/liuyao-domain-assessment-contract-v0.1.json`

> 本文件只审核 `travel_safety` 的 Evidence → Assessment candidate。它不注册正式 Evaluator，不修改 current-22，不修改正式 Rule Registry，不修改 Time Engine，也不构成 Formal Expansion。

---

## 1. Assessment identity

```text
evaluatorRef    = AE-TV-SAFE-001
assessmentRef   = travel_safety_assessment_v0.1
contractFamily  = travel_safety_assessment
eventType       = travel
duty            = travel_safety
dimensionId     = risk
semanticMeaning = journey_safety_and_major_route_risk
```

这里不用 `target_outcome`，因为 Shared Choice 中 `risk` 已经是独立 dimension；`travel_safety` 也不能与 `travel_execution` 的 `journey_execution_outcome` 混成同一 Assessment family。

---

## 2. 文献与现有 Rule Review 支持的职责

已有 Travel Research / Rule Review 已确认：

```text
Traveler = Primary
子孙 = safety / ease support Domain
官鬼 = hazard pressure Domain
途中 / 间爻类信息 = route-process Evidence
```

同时明确：

```text
travel_execution
≠
travel_safety
```

并要求系统能够表达：

```text
交通延误，但最终安全到达
```

因此 execution 的负面 Evidence 不能自动复制到 safety。

---

## 3. v0.1 admitted directional Evidence

### Support

```text
traveler_vitality|positive
safety_support|positive
```

理由：

- Traveler 是 Safety Primary，Primary 自身状态可作为安全支持证据；
- 子孙的平安 / 顺畅 / 喜悦职责已被研究归入 Safety auxiliary Evidence。

### Adverse

```text
traveler_vitality|negative
hazard_pressure|negative
route_process_obstruction|negative
```

理由：

- Traveler Primary 弱势可形成风险方向证据；
- 官鬼 / 风险压力是 Safety 的直接 hazard Evidence；
- 途中重大阻碍属于当前 Safety duty 已定义的 route-risk / difficulty 范围。

注意：`route_process_obstruction` 在本 contract 中只表示“重大途中阻碍方向”，不能由普通延误词自动生成。

---

## 4. v0.1 explicitly ignored Evidence

```text
traveler_void|negative
```

当前主要传统支持集中在：

```text
世空 → 不成行 / 宜止
```

更接近 execution，不足以直接推出发生安全风险。

```text
destination_relation|positive|negative
```

目的地 / 应与 Traveler 的关系能影响旅程阻顺，但当前证据不足以把其固定转换成 `journey_safe` 的直接方向。

```text
transport_disruption|negative
```

延误 / 取消属于运行或行程完成职责；它本身不是危险 Evidence。

因此三者在 Safety v0.1：

```text
ignored / not_directional_for_this_contract
```

不能按 negative polarity 自动进入 adverse。

---

## 5. Combination policy

继续采用非计分分类：

```text
support only
→ supportive_evidence

adverse only
→ adverse_evidence

support + adverse
→ mixed_evidence

没有 admitted directional evidence
→ insufficient_evidence
```

禁止：

```text
supportCount - adverseCount
majority wins
traveler vitality 权重大于其他 Evidence
官鬼一出现就判危险
子孙一出现就判绝对安全
```

v0.1 不处理 Evidence 强度排序。

---

## 6. Important non-claims

即使输出：

```text
supportive_evidence
```

也不表示：

```text
绝对安全
事故概率低于某值
现实中无需采取正常安全措施
```

即使输出：

```text
adverse_evidence
```

也不表示：

```text
一定发生事故
一定受伤
必须取消旅行
```

该 Assessment 只是龟甲内部传统 Evidence 的方向归类。

---

## 7. Comparator readiness

如果本 Assessment candidate isolated regression 稳定，可研究：

```text
CP-TV-SAFE-001
```

但 comparator 只能比较：

```text
risk
+
journey_safety_and_major_route_risk
+
travel_safety_assessment family
```

不得和：

```text
travel_execution_assessment
```

直接比较。

同样不允许自动生成：

```text
哪个旅行总体更值得去
```

因为总体 suitability 仍需要其他维度和独立 Aggregation Policy。

---

## 8. Current decision

```text
Assessment Rule Review = complete
AE-TV-SAFE-001 = candidate allowed for isolated implementation
formal registration = blocked / not authorized
formal expansion = blocked until explicit user permission
```
