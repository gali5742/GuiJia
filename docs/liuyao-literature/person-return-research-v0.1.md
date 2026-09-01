# 龟甲 · 六爻行人 / 归期专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed`

新主题候选：`person_return`

来源于原 `travel.travel_return_or_arrival_of_other` 暂缓项。

> 本专项只处理“已知某人在外、问其返程 / 回来进度 / 归期”的普通占问。它不处理失踪人员、疾病生死、紧急安危，也不修改 Time Engine、正式 Intent、Router、Rule Registry、current-22 或训练数据。

---

# 1. 为什么应从 travel 拆出

现有 `travel` 处理：

```text
旅行者能否成行
旅途是否安全
行程是否被耽误
交通工具是否延误
```

而“行人 / 归期”传统处理的是：

```text
某个已经在外的人是否有归意
是否已经动身回程
现在返程进展如何
什么时候回来
```

核心观察对象不是“我的旅程”，而是：

```text
absent / away person
+
movement toward return
+
return timing
```

因此建议独立 Event：

```text
person_return
```

而不继续塞进 `travel`。

---

# 2. 《增删卜易·行人章》第九十四

公开文本：

- https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93

最重要的架构原文：

```text
问行人之归期……
问行人之否泰，另占一卦，不可一卦而兼断也。
```

这直接支持：

```text
return timing
!=
person safety / general fortune
```

同章又明确：

```text
占亲人在用神章中求之，疏者以应爻为用神。
```

因此 Person Subject Resolver 应优先按真实关系定位，而非统一使用应爻或财爻。

同章还区分：

```text
世克用 → 人未动 / 无归志倾向
用爻克世 → 近日归
明动暗动 → 有起程 / 返程动作
动逢合 → 阻隔
化进 → 不返 / 继续离开轴心
化退 → 归
伏藏 → 待出现
墓 → 待开墓
空 → 待填实 / 冲空
```

这些适合作为：

```text
return progress evidence
return timing trigger evidence
```

而不是直接写成固定日期算法。

---

# 3. 《易隐·卷七·行人占》

中国哲学书电子化计划：

- https://ctext.org/wiki.pl?chapter=657033&if=gb&remap=gb

《易隐》首先把行人占拆成：

```text
来情
安危
囊橐
所在
归期
音信
```

证明传统本身就是多职责结构。

在返程进展方面：

```text
初二爻动 → 起身在途
门户爻动 → 即至
道路爻动 → 在途
动带退 / 化退 → 登程后返
```

在归期方面，又按：

```text
动合
静冲
旺衰
伏藏
空亡
墓
三合
```

产生不同应期条件。

本项目只保留这些为：

```text
timing trigger descriptors
```

不在本主题内部计算具体年月日。

---

# 4. 《断易天机·占行人》

中国哲学书电子化计划：

- https://ctext.org/wiki.pl?chapter=793017&if=gb&remap=gb
- https://ctext.org/wiki.pl?chapter=865364&if=gb&remap=gb

稳定支持：

```text
父母出行 → 父母
子孙出行 → 子孙
兄弟朋友 → 兄弟
其他人 → 应
```

并明确：

```text
先问何人占是谁
```

这是 Person Subject Resolver 的直接依据。

另有：

```text
父母发动 → 音信 / 书信
```

说明“收到消息”和“本人归来”是不同职责，不应合并。

### 冲突材料

《断易天机》同一传统里也保存：

```text
行人用财
```

等旧法。

但同章注释及其他来源又明确使用真实关系 / 应爻。

因此本项目不把：

```text
行人 → 妻财
```

升级为 universal rule。

更稳妥的是：

```text
known relation → actual relation resolver
non-kin / relation-unsupported → 应
unknown → unresolved
```

---

# 5. 现代王虎应

《六爻预测自修宝典》第二十六章“预测行人”明确：

```text
担心外出之人的安危、回家应期，以六亲所主取用神。
```

并特别强调：

```text
重点问回家日期的，用神不旺也无妨；
重点问吉凶的，用神弱便为不好。
```

这与《增删卜易》的：

```text
归期
vs
否泰
```

分责高度一致。

因此现代实践也不支持把 timing Evidence 当成 outcome vitality scoring。

---

# 6. 现代朱辰彬

用户资料库《古筮真诠》可核验两个关键点。

## 6.1 纯应期与吉凶事卦不能混

朱辰彬讨论“仆人何时归”案例时明确：

```text
若是纯粹应期之问，生克作用只是应期重点信息，不能拿来判断用神旺衰成败；
若真实关心的是能否归来，才变成吉凶事卦。
```

这对现代 Schema 非常重要：

```text
“什么时候回来？”
```

不能自动附加：

```text
“能不能安全回来？”
```

## 6.2 化进 / 化退在往来占中的方向语义

朱辰彬进一步说明：

```text
问回归时：
化进 → 离轴更远 / 不来
化退 → 向卦者靠近 / 回来
```

这与《增删卜易》行人章兼容，可以 formalize 为：

```text
movement_direction_evidence
```

但不能脱离问法 current target 使用。

---

# 7. Person Subject Resolver

建议：

```text
PRR-PERSON-RETURN-SUBJECT
```

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

不建议支持：

```text
self
```

因为用户问自己的返程属于 `travel`，不是“行人”。

重要：

```text
real-world person role
!=
return outcome
```

该关系爻是 Person Primary，本身不意味着吉凶。

---

# 8. First-release Duties

建议拆成：

```text
person_return_outcome
person_return_progress
person_return_timing
```

---

# 9. person_return_outcome

现代例：

```text
他这次会回来吗？
我爸这次能按计划回来吗？
```

当前目标：

```text
whether the known-away person returns
```

Observation：

```text
Primary
→ PRR-PERSON-RETURN-SUBJECT
→ returning_person
→ required
```

Role / Context：

```text
世
→ querent / home-side reference
→ optional role context
```

Outcome Evidence 可以读取：

```text
movement state
进退
世用关系
空破墓伏合等已有 Facts
```

但不使用 timing-specific条件直接生成精确日期。

---

# 10. person_return_progress

现代例：

```text
他是不是已经动身回来了？
我爸现在是在回来的路上吗？
```

current target：

```text
return movement state
```

Primary 仍为 returning person。

Evidence 通道：

```text
moving / static
inner / outer
line-position movement
movement-toward / movement-away
进 / 退
road / gate position cues
```

输出应该是：

```text
not_started_tendency
returning_in_progress_tendency
near_arrival_tendency
blocked_or_diverted_tendency
unknown
```

而不是 GPS / 实时追踪。

---

# 11. person_return_timing

现代例：

```text
他什么时候回来？
我爸大概哪天到家？
```

该职责必须明确标：

```text
Timing-only / 应期 question
```

传统主体仍为 returning person。

本主题只生成：

```text
Time Trigger Evidence
```

例如：

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

禁止直接在模块内：

```text
计算旬空
计算出空
计算六合 / 六冲日期
推年月日
```

这些只能读取现有 Time / Fact，再由既有时间层决定是否能解析。

因此：

```text
personReturnTimingEngine = Time Fact consumer
```

不是新的 Time Engine。

---

# 12. Timing 与 Outcome 的硬分离

这是本主题最高优先级 contract。

```text
什么时候回来？
→ person_return_timing
```

不得自动做：

```text
return_outcome vitality scoring
person safety assessment
```

而：

```text
他这次到底能不能回来？
→ person_return_outcome
```

才允许使用 outcome Evidence。

如果用户同时明确问：

```text
他能不能回来，什么时候到？
```

未来可以建 compatible same-event multi-duty：

```text
outcome + timing
```

但首轮 isolated contract 可以先要求明确 primary duty，避免当前 single-goal 架构被绕过。

---

# 13. Hard Boundaries

## 13.1 Travel

```text
我自己的行程能不能顺利
→ travel

我爸这趟路上安全吗
→ travel / represented traveler safety

我爸什么时候回来
→ person_return
```

## 13.2 Transport

```text
他坐的航班会不会延误
→ travel_disruption_transport

他什么时候回到家
→ person_return_timing
```

## 13.3 Receive Item

```text
包裹什么时候到
→ receive_item
```

物品不是 person return。

## 13.4 Missing Person

```text
某人失踪了在哪里？
孩子失联了会不会回来？
```

不进入 `person_return`。

首轮要求：

```text
known_away_context = true
missing_or_disappearance = false
```

失踪人员涉及现实安全风险与完全不同的 product boundary，本项目不把古典寻人规则借壳接入。

## 13.5 Health / Death

古典行人条文存在：

```text
疾病
灾祸
死亡
```

相关判断。

当前产品政策明确排除疾病健康类占卜，因此正式 `person_return` 不输出：

```text
疾病判断
死亡判断
生命危险判断
```

这些古典材料仅作为被明确排除的 provenance，不进入规则。

## 13.6 News / Contact

```text
他会不会给我发消息？
什么时候有他的消息？
```

传统父母可表示音信，但 current target 是 communication/news，不是 person return。

当前标：

```text
person_news_contact = separate future duty / not first release
```

---

# 14. Source Conflict Reconciliation

稳定：

```text
亲属 / 已知关系按真实六亲
非亲疏者 / 其他人可用应
```

不稳定 / 不升级：

```text
所有行人统一妻财
所有行人统一应
```

因此 Resolver 必须允许：

```text
resolved
unresolved
```

而不是 generic fallback。

---

# 15. Rule Candidates

## RC-PR-001

```text
known-away person 应按真实关系 / 非亲应爻解析 Person Primary。
support = stable_consensus_to_cross_source_compatible
```

## RC-PR-002

```text
return timing 与 safety / general fortune 必须分责。
support = direct classical + modern direct
```

## RC-PR-003

```text
return outcome / progress / timing 共享 returning-person Primary，但 Assessment duty 不同。
support = architecture grounded in traditional duty split
```

## RC-PR-004

```text
化进 / 化退在 return current target 下可形成 away / toward-return movement evidence。
support = cross_source_compatible + modern interpretation
```

## RC-PR-005

```text
空、伏、合、墓等归期条文只生成 timing-trigger evidence，基础时间事实继续由现有 Time / Fact 提供。
support = architecture boundary
```

---

# 16. Explicit Non-Candidates

```text
行人 → 固定妻财
行人 → 固定应
朋友 → 无条件应
问归期同时自动断安危
用神弱 = timing question 一定不回来
世空 = 直接算出具体日期
旬空 / 合 / 墓由 person-return 模块重新计算
爻位 = GPS / 精确距离
失踪人员 → person_return
行人古典疾病 / 死亡规则 → 产品输出
父母动 = 本人一定回来（父母首先可能只是音信）
```

---

# 17. 最终结论

`travel_return_or_arrival_of_other` 不应继续作为 `travel` 的 deferred 子 duty。

建议新主题：

```text
person_return
```

首轮可进入 Rule Review / Schema Design：

```text
person_return_outcome
person_return_progress
person_return_timing
PRR-PERSON-RETURN-SUBJECT
```

其中 timing 必须标：

```text
time_engine_dependent = true
time_fact_consumer_only = true
```

研究成熟度：

```text
literatureResearch = completed_and_reviewed
ruleArchitecture = mature_for_design
semanticTrainingEligible = false
currentRoute = false
```

最大架构结论：

```text
Return Event
↓
Returning Person Resolver
↓
Outcome / Progress / Timing 分责
↓
Timing 只输出 trigger evidence
↓
Existing Time / Fact remains single source of temporal truth
```