# 龟甲 · 六爻出行主题文献研究 v1.0

日期：2026-09-01

状态：`completed_and_reviewed`

主题：`travel`

```text
literatureResearchStatus = completed_and_reviewed
trainingEligible = false
calibrationEligible = false
blindEligible = false
currentRoute = false
formal Observation Rule = not_yet_registered
```

> 本文件完成 `travel` 主题的传统文献研究与现代语义边界审计。它不修改当前 22-route Semantic Candidate，不修改 Intent Schema、Rule Registry、Time Engine，也不产生训练语料。

---

# 1. 最终研究问题

本研究回答：

1. 自己出行是否稳定以世为主？
2. 代问他人出行时，是否仍可固定用世？
3. 应爻、父母、妻财、子孙、官鬼、间爻在出行中分别承担什么职责？
4. “能否成行”“旅途安全”“按时出发/到达”“航班是否延误”是否属于同一个 current target？
5. 交通工具本身何时可以从 Domain Observation 升为 Primary？
6. 天气、出差办事结果、快递运输等相邻问题如何与 `travel` 分界？

最终结论：

```text
self travel execution / safety
→ 旅行者本人是主轴，世爻具有稳定传统支持

represented traveler
→ 应按实际关系解析旅行者，不得继续固定世

transport operation itself
→ 父母可成为 Primary candidate

journey execution with transport context
→ 旅行者仍为 Primary，父母只是 transport Domain
```

因此 legacy：

```text
travel → 世
```

只能保留为“自占自身出行”的高置信入口，不能升级成所有现代出行问法的统一规则。

---

# 2. 来源书目与 provenance

## 2.1 《火珠林》·占出行

直接支持：

```text
远行出入……持身最吉
财为行李，子为喜悦
世空去不成
旁爻冲克世可形成不利
```

同时又有：

```text
父爻发动 → 船事 / 文书类影响
子孙动 → 喜悦 / 顺遂类信息
官鬼、兄弟发动 → 风险 / 是非类信息
```

注意：《火珠林》把“财为行李”的分类与后世《黄金策》“父为行李、妻作盘缠”不同，因此不把“行李固定哪一六亲”作为本主题首轮核心规则。

来源：维基文库《火珠林》。

## 2.2 《增删卜易》·出行章

直接支持：

```text
占卜应以世爻为先
世为出行人
应为地头，又为傍倚人
世旺相宜行，空亡宜止
世应、旁爻关系用于判断途中阻顺
```

这是一条与《火珠林》《黄金策》体系可独立互证的稳定主轴。

来源：中国哲学书电子化计划《增删卜易卷之四·出行章》。

## 2.3 《黄金策·出行》 / 《卜筮全书》收录系统

直接支持：

```text
父为行李
妻作盘缠
世为出行人
应为所往之地
间爻为往来经历所在 / 同伴
官鬼、兄弟可形成灾阻信息
```

同时强调：

```text
世克应 → 所向通达倾向
应克世 → 当前行程不利倾向
间爻动 → 途中阻隔 / 伴侣因素
```

来源关系说明：《卜筮全书》《卜筮正宗》相关段落大量收录、解释《黄金策》，不能机械视为完全独立多源。

## 2.4 《易隐》卷七·行人占

《易隐》主要讨论“行人”而非单纯自占出行，但它证明一个重要边界：

```text
问他人行止 / 安危 / 归期时
→ 用爻按实际行人身份选取
```

并大量使用：

```text
用爻 / 应爻
道路 / 车 / 门 / 同伴等位置职责
```

这说明 represented traveler 不能继续简单使用“世=旅行者”。

本研究只借其建立“实际旅行者角色解析”边界，不把“行人归期”直接并入当前 `travel` route。

## 2.5 王虎应《六爻预测自修宝典》第二十五章“预测出行”

现代直接支持：

```text
预测自己外出的吉凶 → 以世爻为用神
预测其他人的外出吉凶 → 以六亲所主判断
应爻为目的地
父母为交通工具 / 行李 / 车船
妻财为旅费 / 所带钱物
```

现代航空案例进一步支持：

```text
问“自己能不能顺利出行” → 世为主，兼看父母交通工具
若 current target 专门转为“飞机本身能否起飞 / 状态如何” → 父母可以升为当前主观察候选
```

## 2.6 朱辰彬《古筮真诠》

扫描本已核：

```text
一般性质的自身出行 → 世爻为用神
子孙可承担平安 / 顺畅的福神信息
行人往来中，进退神可按远离 / 靠近问卦者的实际方向解释
```

另有出行实例：世动化进用于判断能成行，子孙用于辅助判断往归平安。

这些现代案例与《增删卜易》《黄金策》自占出行主轴相容。

---

# 3. 来源独立性审计

## 较高独立度

```text
《火珠林》
《增删卜易》
《易隐》
```

## 同源 / 承接簇

```text
《黄金策》
《卜筮全书》相关收录
《卜筮正宗》相关注解
```

该簇只能按一个主要传统链计权，不按书名机械多算。

## 现代独立参考

```text
王虎应体系
朱辰彬体系
```

二者在“自占一般出行以世为主”上兼容。

---

# 4. 最终研究结论矩阵

| ID | 命题 | 分类 | Rule Review 资格 |
|---|---|---|---|
| TV-F-001 | 自占自身一般出行，以世为旅行者主观察 | `stable_consensus` | ✅ |
| TV-F-002 | 代问他人出行，应按实际关系选旅行者，不固定用世 | `stable_consensus / modern-compatible` | ✅ resolver |
| TV-F-003 | 应爻可表示目的地 / 所往之地 | `stable_consensus` | ✅ contextual role |
| TV-F-004 | 父母可表示交通工具、车船及运输载体 | `cross_source_compatible_to_stable` | ✅ Domain / transport-primary candidate |
| TV-F-005 | 妻财表示旅费 / 所携钱财 | `cross_source_compatible` | ✅ auxiliary only |
| TV-F-006 | 间爻表示途中 / 同行者 / 中间过程 | `cross_source_compatible` | ✅ journey-process evidence |
| TV-F-007 | 子孙可形成平安、顺畅、喜悦方向的辅助 Evidence | `cross_source_compatible` | ✅ Evidence only |
| TV-F-008 | 官鬼 / 兄弟可形成灾阻、是非、阻隔方向 Evidence | `cross_source_compatible` | ✅ Evidence only |
| TV-F-009 | travel_execution 与 travel_safety 共享旅行者 Primary，但 Assessment 职责不同 | `cross_source_compatible_to_stable` | ✅ domain split |
| TV-F-010 | “我这趟能否按时成行”仍以旅行者为 Primary，交通工具为条件 Domain | `cross_source_compatible` | ✅ |
| TV-F-011 | “这趟航班 / 火车本身会不会延误取消”可把交通工具/运输过程提升为父母 Primary candidate | `modern_supported + classical_analogy` | ✅ 保守启用 |
| TV-F-012 | 所有“延误”都应固定父母 Primary | `unsupported_absolute_rule` | ❌ |
| TV-F-013 | 所有天气词都应进入 travel | `semantic_error` | ❌ |
| TV-F-014 | 出差目的地办事结果与旅程本体是同一 current target | `semantic_error` | ❌ |
| TV-F-015 | 快递 / 包裹运输可以复用 travel | `semantic_error` | ❌ |
| TV-F-016 | “某人在外何时回来”直接并入 travel | `scope_unresolved` | ❌，属于行人/归期专项 |

---

# 5. 首轮可规则化职责

## 5.1 Travel Execution

现代问题：

```text
明天这趟旅行能不能顺利成行？
这次出差能不能按计划出发？
这趟行程能不能顺利到达？
```

最小结构：

```text
Primary
→ Traveler Subject Resolver

Context Role
→ 应 / destination（若有明确目的地）

Domain（条件）
→ 父母 / transport vehicle or carrier
```

## 5.2 Travel Safety

现代问题：

```text
明天出行路上安不安全？
这趟旅行途中会不会有大的阻碍？
```

Primary 仍是旅行者本人 / 实际旅行者。

额外 Assessment 可以读取：

```text
子孙 → safety / ease support
官鬼 / 兄弟 → hazard / obstruction evidence
间爻 → route-process evidence
```

这些不是新的 Primary。

## 5.3 Travel Disruption · Journey-focused

现代问题：

```text
我这趟航班能不能按时走？
我明天能不能按计划出发？
会不会因为交通原因耽误我的行程？
```

如果 current target 是：

```text
my journey execution
```

则：

```text
Traveler = Primary
Transport = Domain
```

## 5.4 Travel Disruption · Transport-focused

现代问题：

```text
这趟航班会不会延误？
这班火车会不会取消？
飞机能不能按时起飞？
```

若 current target 明确是运输工具 / 班次运行状态：

```text
Primary candidate → 父母 / transport operation
Role → traveler（若用户自身受影响）
```

该映射的成熟度低于“self travel → 世”，但已有：

- 古典父母 = 车船 / 行李 / 载具传统；
- 王虎应现代飞机案例直接把父母作为飞机运行观察对象。

因此可进入首轮 Rule Review，但必须带：

```text
currentTargetAspect = transport_operation
```

不能仅凭“航班 / 火车”词触发。

---

# 6. Traveler Subject Resolver

建议未来：

```text
self → 世
father / mother / senior parent relation → 父母
child → 子孙
sibling / close peer relation → 兄弟
wife → 妻财
husband → 官鬼
```

但首轮自动实现可以保守只支持：

```text
self
parent
child
spouse_with_explicit_role
```

关系不明确时：

```text
unresolved
```

不得把 represented traveler 默认为世。

---

# 7. Travel Execution 与 Safety 分责

二者共享：

```text
Traveler Primary
Destination Context
Transport Context
```

但 Assessment 不同。

```text
travel_execution
→ can_depart / can_proceed / can_arrive_as_planned

travel_safety
→ hazard / protection / route difficulty
```

禁止把“安全 Evidence”直接等同“能否成行”。

例如：

```text
交通延误但最终安全到达
```

在模型中必须是可以表达的状态。

---

# 8. 交通工具职责边界

父母在传统出行中稳定承担：

```text
车船 / 行李 / 运输载体
```

但必须区分：

```text
我的行程会不会被飞机耽误
→ Traveler Primary + Transport Domain

这架 / 这趟飞机能不能按时起飞
→ Transport Primary candidate
```

这与事业主题的：

```text
职位本体 vs 公司 / 文书
```

属于同一种架构问题：**现实对象不同，不能只靠关键词选六亲。**

---

# 9. 天气边界

```text
东京明天天气怎么样？
旅游目的地会不会下雨？
```

current target 是天气本身，不属于 `travel`。

但：

```text
明天会不会因为台风导致我的航班取消？
```

current target 是：

```text
journey / transport disruption
```

天气只是 causal context，可以进入 travel。

因此：

```text
weather mention
≠ travel route
```

也：

```text
weather mention
≠ automatically outside travel
```

关键仍是 current target。

---

# 10. 与现有 / 新主题碰撞边界

## receive_item

```text
我的包裹什么时候送到？
→ receive_item
```

物品移动不是人的旅行。

## item_purchase

```text
这张机票值不值得买？
→ item_purchase / purchase target
```

若问：

```text
买了这张票以后这趟行程能不能顺利走成？
```

才可能进入 travel。

## career_position / commercial transaction

```text
这趟出差路上顺不顺？
→ travel

这次去客户那里能不能谈成合同？
→ commercial transaction

去 A 公司参加面试能不能被录用？
→ career_position
```

“出差 / 飞过去 / 去公司”只是背景动作时，不得覆盖真正 current target。

## study_exam

```text
坐飞机去参加考试路上会不会耽误？
→ travel

这次考试能不能通过？
→ study_exam
```

---

# 11. Explicit Non-Candidates

首轮不得登记：

```text
travel → 无条件世
航班 / 火车 → 无条件父母
目的地 → 无条件应
子孙动 → 一定安全
官鬼动 → 一定出事故
六冲卦 → 一定不能出行
世空 → 永久无法成行
天气词 → 自动 travel
出差 → 自动 travel
行人归期 → 自动 travel
```

所有旺衰、空破、动变、六冲六合、间爻动作只可进入后续 Evidence / Assessment。

---

# 12. Rule Review 准入清单

首轮允许：

```text
travel.travel_execution
travel.travel_safety
travel.travel_disruption_journey
travel.travel_disruption_transport
```

其中前 3 个共享 Traveler Primary，只是 Assessment duty 不同。

第 4 个必须要求：

```text
currentTargetAspect = transport_operation
```

并继续保留：

```text
transportPrimaryConfidence = cross_source_compatible_modern_supported
```

---

# 13. 最终结论

`travel` 的稳定骨架不是“出行看世”一句话，而是：

```text
Traveler
→ self 时稳定对应世
→ represented 时按实际关系 resolver

Destination
→ 应 / contextual target

Transport
→ 父母 / Domain；若 transport 本身是 current target 可升 Primary candidate

Journey Process
→ 间爻等结构 Evidence

Safety Support
→ 子孙等辅助 Evidence

Hazard / Obstruction
→ 官鬼、兄弟等辅助 Evidence
```

因此本主题已经达到：

```text
literatureResearchStatus = completed_and_reviewed
matureEnoughForRuleRegistryDesign = true
```

但仍保持：

```text
trainingEligible = false
currentRoute = false
```

并继续受当前 v0.13 next-topic design-only gate 约束。
