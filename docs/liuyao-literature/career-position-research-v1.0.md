# 龟甲 · 六爻事业职位主题文献研究 v1.0

日期：2026-09-01

状态：`completed_and_reviewed`

主题：`career_position`

前版：

- `career-position-research-v0.1.md`
- `career-position-research-v0.2.md`

```text
literatureResearchStatus = completed_and_reviewed
trainingEligible = false
calibrationEligible = false
blindEligible = false
currentRoute = false
formal Observation Rule = not_yet_registered
```

> “研究完成”只表示文献门槛已完成并已划定可规则化边界，不表示该主题已进入 Semantic Router、训练集或 current route。当前 v0.13 的 next-topic gate 仍然有效。

---

# 1. 最终研究问题

本研究最终回答五个问题：

1. 现代求职、面试、录用、入职是否可以共用传统观察主轴？
2. 升职、晋升、转正是否属于同一传统规则？
3. 公司 / 单位与职位 / 工作在六亲职责上是否相同？
4. 跳槽、留任、辞职是否可以共用一个 transition rule？
5. 工资、奖金、考试与事业职位如何严格分层？

最终答案是：

```text
职位 / 工作本体具有稳定的官鬼主轴；
但现代职业问题绝不能压成“事业 → 官鬼”一个规则。
```

---

# 2. 来源书目与 provenance

## 2.1 独立传统来源簇

### A. 《断易天机》

核对章节 / 条目：

- 占求官；
- 占迁官；
- 占加官；
- 占官得替否；
- 占现任官得多少时；
- 占求官任所有无。

直接支持：官鬼为求官 / 升迁核心；世为本人；父母为诰牒任命；并存在失位 / 被替的独立传统问题。

核对入口：中国哲学书电子化计划《断易天机》。

### B. 《卜筮全书·求仕章》

直接支持：

- “凡卜求官，官鬼是用爻”；
- 父母为宣敕；
- 官鬼、父母为占官重要根本。

核对入口：易学网《求仕章》及识典古籍《卜筮全书·求仕章》。

### C. 《黄金策·求名》《黄金策·仕宦》

直接支持：

- 求名中父母 = 文章 / 文书，官鬼 = 官职 / 功名；
- 仕宦中官鬼 = 官爵，妻财 = 禄俸，父母 = 宣敕 / 印绶；
- 子孙、兄弟、世空、官伏等只在具体条件下构成不利证据。

来源关系说明：本书被《卜筮全书》《卜筮正宗》等收录与注解，因此这些转录版本不能机械当成多个完全独立传统来源。

### D. 《增删卜易》

核对：序中的功名 / 升迁 / 现任官总则及多条升迁实例。

直接支持：旺官持世、官星生合世为功名 / 升迁重要结构；现任官另有保任 / 失位观察。

### E. 《易隐》卷六

核对：求官、升迁、替代等条目。

直接支持：世、官、父以及世应 / 内外关系在升迁和去留中的多层观察；并有“内旺外衰宜守旧、内衰外旺宜图新”的古典选择结构。

## 2.2 现代独立来源

### F. 王虎应《六爻预测自修宝典》第二十九章“预测工作”

直接支持：

```text
官鬼 = 工作
父母 = 工作公司 / 单位
妻财 = 工资
升职 / 工作变动仍以官鬼为主
工作变动可用世 / 应观察当前环境与要去处
```

### G. 王虎应《六爻用神答疑》

直接支持现代目标分裂：

```text
跳槽能否成功 → 官为主，兼世
去新工作后如何 → 应 / 世与官综合
该不该辞职 → 财的重要性显著上升
找工作面试能否成功 → 主要看官，兼世应
```

### H. 王虎应现代应聘案例

已核：

- 工作面试后能否录取；
- 应聘学校能否成功及后续签约。

两例均以官鬼为应聘 / 录用主轴，同时父母承担公司、学校、文书、签约等信息。

### I. 朱辰彬《古筮真诠》

已核代表案例：

- p.186 左右：职位内部竞聘，官鬼为职位用神；
- p.292 左右：具体目标单位应聘，父母可成为目标单位用神；
- p.379 左右：工作前程，官鬼为用；
- p.550 左右：银行职员事业取舍；
- p.594–595 左右：跳槽 / 两处事业取舍；
- 双核论：指定单位 / 指定目标时，应爻可能承担特指对象职责。

### J. 朱辰彬《古筮真诠·进阶篇》

已核代表案例：

- 第44章：单位内晋升机会，明确“求晋升应取官鬼为用神”；
- 第44章：能否进入省农业银行工作，讨论明确单位时父母与官鬼两个候选及真实关注点；
- 第53章：单位裁员是否波及自己，明确单位工作可在官鬼 / 父母之间按卦中突出信息辨别。

---

# 3. 最终研究结论矩阵

| ID | 命题 | 最终分类 | Rule Review 资格 |
|---|---|---|---|
| CP-F-001 | 工作 / 职位 / 官职本体以官鬼为核心 | `stable_consensus` | ✅ |
| CP-F-002 | 自占求职 / 任职本人以世为角色观察 | `stable_consensus` | ✅ |
| CP-F-003 | 父母表示任命、宣敕、文书、印绶 | `stable_consensus` | ✅ |
| CP-F-004 | 现代公司 / 单位可映射父母 | `cross_source_compatible` | ✅，仅现代 Domain mapping |
| CP-F-005 | 特指单位 / 外部目标可引入应爻职责 | `cross_source_compatible / school_specific_detail` | ✅，只作条件 Role/Context |
| CP-F-006 | 求职 / 面试的职位取得结果以官鬼为主轴 | `cross_source_compatible_to_stable` | ✅ |
| CP-F-007 | Offer / 合同若只是录用过程信息，父母为辅助；若文书本身是 current target，父母可升为 Primary | `stable_consensus + modern_mapping` | ✅ |
| CP-F-008 | 升职 / 晋升以官鬼为核心，世为本人 | `stable_consensus` | ✅ |
| CP-F-009 | “转正 = 升迁” | `insufficient_evidence / modern_mapping_only` | ❌ 不得直接登记 |
| CP-F-010 | 裁员 / 职位保留属于独立 employment retention 职责 | `stable_consensus` at theme level | ✅ |
| CP-F-011 | 跳槽“能否成功”仍以新工作 / 职位结果为主轴 | `cross_source_compatible` | ✅，保守设计 |
| CP-F-012 | “世 = 旧工作，应 = 新工作”是跨流派固定公式 | `conflicted / school_specific` | ❌ 不得硬编码 |
| CP-F-013 | 新旧工作必须在 Semantic / Observation 中作为两个 alternative 被区分 | `cross_source_compatible` | ✅ |
| CP-F-014 | “该不该辞职”与“能不能跳槽成功”是同一传统职责 | `conflicted` | ❌ 必须分开 |
| CP-F-015 | 妻财代表工资 / 禄俸 | `stable_consensus` | ✅ 传统辅助；现代 route 仍分流到 income |
| CP-F-016 | 兄弟可在求名 / 竞聘条件下表示竞争因素 | `cross_source_compatible` | ✅ 仅条件 Evidence |
| CP-F-017 | 子孙见动即可判失业 / 升迁失败 | `unsupported_absolute_rule` | ❌ |
| CP-F-018 | 宽泛“事业怎么样”可直接成为现代 route | `semantic_insufficient` | ❌ 默认不得直接训练 |

---

# 4. 可进入 Rule Review 的首轮职责

## 4.1 Job Application Outcome

现代问题：

```text
这次面试最后能不能被录用？
这个职位我能拿到吗？
能不能顺利入职？
```

研究允许的最小结构：

```text
Primary
→ 官鬼
→ employment / position outcome

Role
→ 世
→ applicant / querent

Domain（条件）
→ 父母
→ employer / organization / formal process

Context Role（条件）
→ 应
→ explicitly specified external target
```

禁止：

```text
面试二字直接选择父母
公司二字直接把父母升成 Primary
应爻无条件等于公司
```

### application_stage

建议只作为现代语义上下文：

```text
interview
selection
verbal_offer
written_offer
contract
onboarding
```

它不能单独决定 traditional selector。

---

## 4.2 Position Advancement

现代问题：

```text
今年能不能升职？
这次内部晋升能不能成功？
```

最小结构：

```text
Primary
→ 官鬼
→ target position / advancement

Role
→ 世
→ incumbent / querent

Domain（可选）
→ 父母
→ appointment / formal authorization
```

该职责研究成熟度最高。

---

## 4.3 Employment Retention

现代问题：

```text
这次裁员会不会裁到我？
我的职位能不能保住？
```

传统对应并不是硬凑现代类比，而有直接的：

```text
得替
现任官能任多久
剥官削职
失职 / 替代
```

最小主轴仍是：

```text
官鬼 / 当前职位
+
世 / 任职本人
```

父母可承担单位 / 任命关系的 Domain 信息。

注意：当前 `liuyao-next-topic-inventory-v0.1.json` 尚未列出 `employment_retention`。研究建议在后续 schema review 时补充，而不是把它暗塞进 `position_advancement`。

---

## 4.4 Employment Transition Outcome

现代问题：

```text
这次能不能成功跳槽？
能不能拿到那边的新工作？
```

可保留的跨来源最小结构：

```text
Primary
→ prospective employment / 官鬼主轴

Role
→ 世 / querent

Context
→ specified prospective workplace（如明确存在）
```

但**不得**在 base rule 中登记：

```text
世 = old employment
应 = new employment
```

新旧工作具体映射必须经过未来 resolver / contextual evidence；无法可靠映射时应 `unresolved`，不能猜。

---

# 5. 暂不进入首轮 Rule Review 的职责

## 5.1 Employment Status Confirmation / 转正

没有足够直接来源证明试用期转正等于古典升迁。

允许的研究假设：

```text
职位状态本体 → 官鬼可能相关
正式确认 / 合同手续 → 父母可能相关
```

但当前不得创建：

```text
转正 → TR-Career-Advancement
```

需要未来更多现代案例或在 Rule Review 中单独建 `employment_status_confirmation` 设计审查。

## 5.2 Employment Transition Comparison

现代问题：

```text
留现在公司还是去 A 公司？
两个 offer 选哪个？
```

文献确认“可比较”，但各体系的 alternative 映射方法并不一致：

- 《易隐》使用内外旺衰；
- 王虎应明确使用世 / 应作为当前与要去的环境；
- 朱辰彬案例按卦中与现实对轨的两个具体事业候选映射，而不是固定世应。

因此可进入未来**resolver design**，但不宜先登记一个静态 Observation Rule。

## 5.3 Resignation Suitability

现代问题：

```text
我现在该不该辞职？
没有下家能不能先裸辞？
```

王虎应明确把“财为养命之源”提升为关键；这说明问题已经不纯粹是职位取得 / 变动结果，而含生计承受与选择价值判断。

当前结论：

```text
not same duty as transition_outcome
```

首轮应排除，避免把财务承受、工作环境、职位变化压进一个 route。

---

# 6. 求职指定单位的最终架构判断

本研究不采用“官鬼 / 父母二选一静态表”。

更符合跨来源证据的是：

```text
Question semantics
↓
current target
├─ position / employment result
│   └─ 官鬼 Primary
├─ employer / organization itself
│   └─ 父母 Domain 或在真正 employer-target 问法中升级候选
└─ written authorization / offer / contract itself
    └─ 父母 Primary candidate
```

而 `应` 处理的是 contextual role：

```text
specified external target
```

不是 object type。

这一点必须保留，否则未来很容易把：

```text
父母 = 公司
应 = 公司
```

错误合并成两个互相竞争的硬编码 selector。

---

# 7. 与 study_exam 的最终预边界

本研究只能完成单向边界，等 `study_exam` 完成后还需反向复核。

当前允许：

```text
“这轮求职面试能不能让我被录用？”
→ career_position

“这个职位最终能不能拿到？”
→ career_position

“这次笔试能不能通过？”
→ study_exam candidate

“公务员考试能不能上岸？”
→ 语义仍可能同时含考试通过与获得职位，必须解析 current target
```

《黄金策·求名》本身已经证明父母（文章）与官鬼（官职）是两个观察职责，现代系统不应重新把它们压平。

---

# 8. 与现有 current-22 的碰撞边界

必须保持：

```text
薪资 / 工资金额、发放
→ income_salary

奖金 / 绩效奖金
→ income_bonus

工作带来的赚钱效果
→ 不自动变 financial_fortune

公司采购 / 销售 / 投资
→ 按商业事件 current target，不因“公司”进入 career_position
```

示例：

| 问句 | 主题 |
|---|---|
| 我能不能拿到这个岗位？ | `career_position` |
| 这个岗位工资能涨到多少？ | `income_salary` |
| 公司今年奖金会不会发？ | `income_bonus` |
| 我替公司做这笔采购能不能成交？ | commercial current route |
| 我在公司投资的项目能不能赚钱？ | investment / commercial target |

---

# 9. 传统 Evidence 的 formalization boundary

以下只允许成为条件 Evidence：

```text
官鬼旺相 / 生合世
官鬼空破 / 受制
父母旺衰 / 空亡
子孙克官
兄弟发动
世空 / 世受克
官化进退
世应生克合冲
```

禁止直接转换成：

```text
官旺 = 一定录用
子孙动 = 一定失业
兄弟动 = 一定有竞争者
父母空 = 一定没有 offer
应生世 = 一定应该跳槽
```

正式 Rule Review 必须把：

```text
事实
→ Evidence
→ Assessment
```

分层，不能把经典断语直接变成训练标签。

---

# 10. 本研究发现的 inventory 结构问题

当前 inventory 的：

```text
employment_transition_decision
```

应被视为过宽 hypothesis。

建议后续 Schema Design 至少拆为：

```text
employment_transition_outcome
employment_transition_comparison
resignation_suitability
```

同时补评：

```text
employment_retention
```

而 `转正` 不应在没有额外研究的情况下直接塞进 `position_advancement`。

这是文献研究对现有设计的实质性修正，不应为了保持旧 inventory 形状而忽略。

---

# 11. Rule Review 准入清单

下一阶段允许制作 Rule Candidate / Review 的职责：

```text
career.job_application_outcome
career.position_advancement
career.employment_retention
career.employment_transition_outcome
```

其中最后一项必须带：

```text
no_fixed_old_new_line_mapping = true
```

暂缓：

```text
career.employment_status_confirmation
career.employment_transition_comparison
career.resignation_suitability
```

---

# 12. 最终结论

事业职位主题的稳定传统骨架是：

```text
职位 / 工作 → 官鬼
本人 → 世
任命 / 文书 → 父母
禄俸 / 工资 → 妻财
```

现代职业世界增加了两个古典规则不能用一个词直接覆盖的对象：

```text
employer / organization
current vs proposed employment alternative
```

研究最重要的结论不是“事业看官鬼”，而是：

```text
position
employer
formalization
compensation
current employment
proposed employment
```

必须先在现代语义层分清职责，再交给传统 Observation Rule。

因此本主题已经达到：

```text
literatureResearchStatus = completed_and_reviewed
matureEnoughForRuleRegistryDesign = true
```

但只对本文件列出的 Rule Review 准入职责成立。

仍然保持：

```text
trainingEligible = false
currentRoute = false
```

并继续受当前 v0.13 `nextTopicBoundary` 的 design-only gate 约束。
