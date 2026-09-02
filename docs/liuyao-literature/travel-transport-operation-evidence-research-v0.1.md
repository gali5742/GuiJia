# 龟甲 · 六爻 Travel Transport Operation Evidence Research v0.1

日期：2026-09-02

状态：`completed_partial_evidence_anchor_blocked`

范围：`travel_disruption_transport / transport_operation` 的 Evidence provenance 与 concrete transport-object anchoring。

> 本研究不注册 Assessment，不执行 Formal Expansion，不把 `transportDisrupted=true` 恢复为正式 Fact。

## 1. 研究问题

现代问题：

```text
这趟航班会不会延误？
这班火车能不能按时发车？
飞机什么时候能起飞？
```

此前 Travel Rule Review 已允许：

```text
父母 / transport operation
→ Primary candidate
```

但仍有两个未解决问题：

1. 哪一个具体父母爻才是用户说的当前航班 / 火车？
2. 哪些原子状态可以形成“延误 / 运行” Evidence，而不是把结果写进 Fact？

## 2. 现代直接证据：父母为飞机

王虎应《六爻预测自修宝典》出行案例中，明确使用：

```text
父母 → 交通工具 / 飞机
```

例如午月乙卯日“测到西藏如何”案例：

```text
父母戌土持世发动化退
```

作者据此判断：

```text
飞机会推后飞行，晚点
```

实际因天气影响，第二天才成行。

这条案例支持：

```text
transport line
+ retreat transformation
→ delay / postponement Evidence candidate
```

其证据成熟度明显高于笼统：

```text
transport line weak → delay
```

## 3. “专门看飞机”的直接案例

王虎应网络案例中有：

```text
段老师从太原机场出发，飞机不能起飞，问何时起飞
```

作者区分：

```text
一般出行 → 世为主，兼看父母
专门看飞机情况 → 具体父母爻可以成为飞机观察对象
```

并以父母丑土暗动、日冲等结构分析其当日可以启动。

该例支持：

```text
currentTargetAspect = transport_operation
→ 父母可以由 Domain 升为 Primary
```

但它不支持：

```text
DARK_MOVING = on_time
```

更准确的 Evidence 语义应是：

```text
transport_activation_trigger
```

至于具体时间仍属 Time / timing contract，不应由 Transport Assessment 自行重算。

## 4. 多个父母爻：Transport Object Anchor 问题

另一则“飞机延误困机场”案例尤其重要。

卦中出现多个父母相关对象；实际又存在：

```text
原航班
另一航班 / 替代飞机
```

作者并非使用：

```text
第一个父母 = 原航班
第二个父母 = 替代航班
```

而是结合：

```text
对世的实际作用
动变结构
现实事件背景
```

去识别哪一个父母对应原飞机、哪一个对应替代飞机，并明确以“变易”的 contextual 思维解释。

因此得出：

```text
父母 = transport class
≠ concrete transport instance resolved
```

这与 Lost Property、Education Institution 已出现的问题完全同构。

## 5. 新 Resolver blocker

正式提出：

```text
PRR-TRAVEL-TRANSPORT-OBJECT
```

职责：

```text
Modern transport entity / service
↓
父母 candidate set
↓
contextual concrete-line anchoring
```

输出必须允许：

```text
resolved
partial
unresolved
conflicted
```

不得 first-match 父母。

## 6. 首轮可接受 Transport Evidence candidate

### 6.1 transform-retreat

```text
transport line 动化退
→ transport_delay_or_postponement_tendency
```

现代直接案例支持较强。

注意：

```text
化退 = Evidence
≠ 自动最终判定必定取消
```

### 6.2 activation trigger

类似：

```text
transport line 暗动 / 特定冲动触发
```

可先表示：

```text
transport_activation_trigger
```

不直接表示：

```text
on_time
successful_operation
```

具体日期/时段仍消费 Time Fact。

### 6.3 transport obstruction relation

如果未来 shared Line-Pair Fact Provider 能提供：

```text
某动爻 controls transport line
```

再由 Transport Domain Review 判断其是否构成：

```text
transport_obstruction_evidence
```

当前不从 legacy UseGod facts 偷接。

## 7. 当前不批准的简单映射

不批准：

```text
父母旺 → 一定准时
父母衰 → 一定延误
父母空 → 一定取消
父母动 → 一定起飞
DARK_MOVING → 一定准时
父母多现 → first parent is current flight
```

原因：现有案例中的 transport state 同时受动变、时令、合冲及现实对象对轨影响，不能压成单一标签。

## 8. Calendar line status 的角色

现有 reading-scoped Line Status Fact Adapter 可以对 concrete transport line 输出：

```text
MONTH_COMMAND
MONTH_BREAK
DAY_CONTROL
VOID
...
```

这些 Fact 可以作为 Transport Evidence 的原料。

但目前没有充分证据把：

```text
calendar support only
```

直接等同：

```text
transport on time
```

因此 Transport Assessment v0.1 不应照抄 Traveler Execution 的 calendar support/adverse 规则。

## 9. Journey-focused 与 Transport-focused 必须继续分开

例如飞机延误：

```text
transport operation
→ 确实发生延误
```

但用户仍可能：

```text
换航班后当天成行
```

所以：

```text
transport delayed
≠ journey execution failed
```

这与原 Travel Rule Review 的 duty separation 一致。

## 10. Fact provenance 需求

要让 Transport Evidence 进入正式候选，至少需要：

```text
stable readingRef
concrete transport lineRef
line status Fact
move/transform Fact
generic line-pair structural Fact
Time Fact refs where timing used
```

不再允许：

```text
transportDisrupted = true
```

作为上游输入。

## 11. 当前 readiness

```text
transport class mapping to 父母 = supported
transport Primary when current target is transport operation = supported/provisional
transform-retreat delay evidence = candidate supported
activation trigger evidence = candidate supported but non-final
calendar-status-to-on-time mapping = insufficient_evidence
concrete transport instance anchor = unresolved
transport obstruction generic relation producer = unavailable
full transport Assessment = not ready
```

## 12. 下一步

优先：

```text
1. PRR-TRAVEL-TRANSPORT-OBJECT contextual anchor contract
2. shared Line-Pair Structural Fact Provider
3. reading-scoped Move/Transform Fact Adapter
4. Transport Evidence Adapter
5. Transport Assessment Rule Review
```

只有前 3 层至少具备 isolated provenance 后，才值得实现 Assessment。

## 13. Formal gate

当前仍为：

```text
Formal Expansion = locked
active evaluator = 0
active comparator = 0
current route mutation = false
```
