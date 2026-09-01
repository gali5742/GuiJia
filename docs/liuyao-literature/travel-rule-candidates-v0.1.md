# 龟甲 · 六爻出行 Rule Candidate Review Set v0.1

日期：2026-09-01

状态：`ready_for_rule_review`

来源研究：`docs/liuyao-literature/travel-research-v1.0.md`

> 本文件只列可审查 Candidate，不是正式 Rule Registry 实现。

---

## RC-TV-001 · Self traveler

```text
proposition: 自占自身一般出行，以世作为 Traveler Primary Observation
support: stable_consensus
```

---

## RC-TV-002 · Represented traveler resolver

```text
proposition: 代问他人出行时，应按实际关系解析 Traveler，不得继续固定世
support: stable_consensus / modern-compatible
```

建议进入 `PRR-TRAVELER-SUBJECT`。

---

## RC-TV-003 · Destination context

```text
proposition: 应爻可表示所往之地 / destination context
support: stable_consensus
```

只在存在明确旅行目的地职责时作为 contextual observation。

禁止：应爻无条件等于“目的地”。

---

## RC-TV-004 · Transport vehicle

```text
proposition: 父母可表示交通工具 / 车船 / 运输载体
support: cross_source_compatible_to_stable
```

默认是 Domain Observation；只有 transport operation 本身为 current target 时才可升为 Primary candidate。

---

## RC-TV-005 · Travel funds

```text
proposition: 妻财可表示旅费 / 所携钱财
support: cross_source_compatible
```

只作 auxiliary/domain，不得作为一般 travel Primary。

---

## RC-TV-006 · Route / companions

```text
proposition: 间爻可提供途中、同行者、行程中间过程 Evidence
support: cross_source_compatible
```

不进入 Primary selection。

---

## RC-TV-007 · Safety support

```text
proposition: 子孙可形成平安、顺畅、解忧方向的 travel safety Evidence
support: cross_source_compatible
```

禁止：`子孙动 = 一定安全`。

---

## RC-TV-008 · Hazard / obstruction evidence

```text
proposition: 官鬼 / 兄弟等在条件满足时可形成灾阻、是非、阻隔方向 Evidence
support: cross_source_compatible
```

禁止直接推断事故。

---

## RC-TV-009 · Travel execution duty

```text
proposition: 成行 / 顺利出发 / 按计划到达，以 Traveler 为 Primary；destination / transport 作为条件 Context/Domain
support: stable_consensus_as_architecture
```

---

## RC-TV-010 · Travel safety duty

```text
proposition: 旅途安全与 travel execution 共用 Traveler Primary，但使用独立 Safety Assessment
support: cross_source_compatible_to_stable
```

---

## RC-TV-011 · Journey-focused disruption

```text
proposition: “我的行程会不会被交通耽误”仍以 Traveler 为 Primary，transport 为 Domain
support: cross_source_compatible
```

---

## RC-TV-012 · Transport-focused disruption

```text
proposition: “航班/火车本身会不会延误取消”在 currentTargetAspect=transport_operation 时，可用父母作为 transport Primary candidate
support: modern_supported + classical_analogy
```

不得凭交通工具名词单独触发。

---

## RC-TV-013 · Weather causal context boundary

```text
proposition: 天气只有在作为 travel disruption 的原因背景时才属于 travel context；天气本身为 current target 时不属于 travel
support: semantic_boundary
```

---

## RC-TV-014 · Purpose-outcome boundary

```text
proposition: 出差、面试、考试等旅行目的若成为 current target，应路由到对应事业/商业/考试主题；travel 只处理旅程本身
support: semantic_boundary
```

---

## RC-TV-015 · Delivery boundary

```text
proposition: 快递/包裹运输不是 Traveler travel，继续属于 receive_item
support: semantic_boundary
```

---

## RC-TV-016 · Line-state assessment separation

```text
proposition: 世应旺衰、空破、动变、六冲六合、间爻动静等属于 Travel Evidence/Assessment，不属于 Observation Registry selector
support: architecture_boundary
```

---

# Explicit Non-Candidates

```text
travel → 无条件世
represented traveler → 世
航班 / 火车 → 无条件父母
目的地 → 无条件应
子孙动 = 一定安全
官鬼动 = 一定事故
六冲卦 = 一定不能出行
世空 = 永久无法成行
天气词 = travel
出差词 = travel
行人归期 = travel
```

---

# Review Gate

进入正式 Rule Registry 设计前必须确认：

1. Intent 能区分 traveler-focused 与 transport-focused current target；
2. represented traveler 有独立 relation resolver；
3. travel execution / safety / disruption Assessment 分责；
4. weather / career / commercial / study / receive_item 边界固定；
5. transport Primary 只能在明确 transport_operation target 下触发；
6. Time Engine 继续是时间事实唯一来源。

当前：

```text
ruleCandidateReviewReady = true
formalRuleRegistryReady = false
semanticTrainingReady = false
```
