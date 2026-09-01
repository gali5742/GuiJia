# 龟甲 · 六爻行人 / 归期 Rule Review v0.1

日期：2026-09-01

状态：`rule_review_complete`

主题候选：`person_return`

上游：

- `person-return-research-v0.1.md`

> 本文件只完成 design-only Rule Review，不接入正式 Rule Registry、Intent、Router、current-22 或训练数据。

---

# 1. 最终结构

`person_return` 首轮不是一个“行人规则”，而是三个共享 Person Primary 的职责：

```text
TR-PR-001-A  person_return_outcome
TR-PR-001-B  person_return_progress
TR-PR-001-C  person_return_timing
```

共同 Primary：

```text
PRR-PERSON-RETURN-SUBJECT
→ returning_person
→ required
```

可选 Home-side Role：

```text
世
→ querent_home_reference
→ optional
```

三者唯一允许共享的是“谁是正在等待归来的人”；Outcome、Progress、Timing 的 Evidence 不得互相偷用。

---

# 2. Person Subject Resolver

首轮：

```text
parent          → 父母
child           → 子孙
wife            → 妻财
husband         → 官鬼
sibling_or_peer → 兄弟
friend          → 兄弟
other_non_kin   → 应
unknown         → unresolved
```

`self` 不在本主题解析：

```text
self return
→ travel
```

禁止：

```text
行人 → 固定妻财
行人 → 固定应
unknown → 应 fallback
```

---

# 3. Base Rule A · Return Outcome

```text
TR-PR-001-A
appliesTo:
  event = person_return
  personReturnDuty = person_return_outcome
  currentTargetAspect = return_outcome
```

Observation Plan：

```text
Primary
→ PRR-PERSON-RETURN-SUBJECT
→ returning_person
→ required

Role
→ 世
→ querent_home_reference
→ optional
```

Outcome Evidence 可以消费：

```text
movement state
movement toward / away
化进 / 化退
returning person 与世关系
join obstruction
伏 / 墓 / 空等已有 Facts
```

但不得直接计算归期日期。

---

# 4. Base Rule B · Return Progress

```text
TR-PR-001-B
appliesTo:
  event = person_return
  personReturnDuty = person_return_progress
  currentTargetAspect = return_progress
```

Primary 与 Outcome 相同。

Progress Evidence：

```text
moving / static
movement toward / away
road position
near-gate position
blocked / diverted
```

只能输出：

```text
not_started_tendency
returning_in_progress_tendency
near_arrival_tendency
blocked_or_diverted_tendency
unknown
```

不能输出 GPS、实时位置或精确距离。

---

# 5. Base Rule C · Return Timing

```text
TR-PR-001-C
appliesTo:
  event = person_return
  personReturnDuty = person_return_timing
  currentTargetAspect = return_timing
```

Primary 仍为 returning person。

但此职责明确是：

```text
Timing-only / 应期
```

只允许生成 Time Trigger Evidence：

```text
await_void_resolution
await_hidden_appearance
await_join_release
await_tomb_release
await_value_trigger
await_clash_trigger
await_harmony_trigger
near_term_movement_trigger
```

禁止主题模块：

```text
重算旬空
重算冲空 / 出空
推具体年月日
自行生成六合 / 六冲日期
```

Time Engine 仍是唯一时间事实来源。

---

# 6. Timing / Outcome 硬隔离

必须支持：

```text
“什么时候回来？”
→ timing only
```

不得隐式附加：

```text
“能不能回来？”
```

同样：

```text
“他这次会不会回来？”
→ outcome only
```

不得自动添加 timing。

若未来允许同题同时问：

```text
能不能回来 + 什么时候回来
```

应作为同一 Event 内 compatible multi-duty 扩展，而不是在 v0.1 偷偷混合 Evidence。

---

# 7. Hard Boundaries

```text
自己的行程 / 自己返程
→ travel

代问他人旅途安全
→ travel represented traveler safety

已知人在外，问其是否回来 / 是否在回程 / 何时到
→ person_return

对方乘坐的航班是否延误
→ travel_disruption_transport

包裹何时到
→ receive_item

失踪 / 失联人员
→ blocked / not person_return

健康、疾病、生死、生命危险
→ product policy excluded

只问是否发消息 / 有无音信
→ person_news_contact deferred
```

---

# 8. Assessment Boundary

以下均只能成为 Evidence：

```text
动静
进退
世用生克合冲
空
墓
伏
合
爻位道路 / 门户提示
```

禁止：

```text
化退 = 保证当天回来
空 = 一定不回来
合 = 一定被困
动 = 一定已上路
某一条 timing trigger = 直接日期
```

---

# 9. 最终状态

```text
literatureResearch = completed_and_reviewed
ruleReview = complete
intentSchemaDesign = next
formalRuleRegistry = blocked
semanticTraining = false
currentRoute = false
```
