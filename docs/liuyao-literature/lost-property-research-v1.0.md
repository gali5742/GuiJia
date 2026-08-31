# 龟甲 · 六爻失物主题文献研究 v1.0

日期：2026-08-31

状态：`completed_and_reviewed`

研究主题：`lost_property`

研究结论：`ready_for_rule_review`

> 本文件完成失物主题的传统文献研究阶段。它不是正式 Observation Rule，不修改当前 22-route Semantic Candidate，不修改 Intent Schema，不修改 Rule Registry，不修改 Time Engine。

---

# 1. 现代问题范围

本主题只覆盖**已经确认遗失的无生命财物**，并拆成两个职责：

```text
lost_property_recovery
→ 某件无生命失物能否找回

lost_property_location
→ 某件无生命失物在哪里 / 有哪些位置线索
```

明确排除：

- 宠物、家畜、飞禽等动物走失；
- 儿童、亲友、其他失踪人员；
- 尚未确认丢失的快递 / 邮寄 / 物流运输；
- 购买某物是否合适；
- 欠款、资产收益等财务问题；
- 独立的“谁偷了 / 能否抓贼 / 贼的身份”目标。

古典文献常把失物、盗贼、捕盗合在同一篇；龟甲必须按现代目标拆开，不能照搬古籍章节边界。

---

# 2. 古典占类对应

现代 `lost_property` 与古典：

- 失物；
- 失脱；
- 遗失；
- 盗贼篇中的“推物 / 见否”；

具有直接连续性。

主要传统来源：

1. 《火珠林》·占逃亡、占贼盗；
2. 《黄金策》·失脱；
3. 《断易天机》·占遗失 / 盗贼相关章；
4. 《易隐》卷八·遗失占 / 盗贼占；
5. 《卜筮全书》·天玄赋盗贼章、黄金策失脱；
6. 《卜筮正宗》·失脱注解。

现代参考：

7. 朱辰彬《古筮真诠》《古筮真诠·进阶篇》；
8. 王虎应《六爻预测自修宝典》。

---

# 3. 来源独立性与同源性审计

## 3.1 独立度较高的传统证据链

### A. 《火珠林》

具有独立的早期六爻取用、失物与盗贼结构。

核心文字包括：

```text
逃亡看世，失物看财；
若失文书牌号，当以父母爻取；
凡失物专看财爻，本象要旺相不空不动，可见；
官鬼为贼，子孙为捕捉，兄弟为众，父母为衣服、文书，财为失物。
```

## 3.2 《黄金策》—《卜筮正宗》—《卜筮全书》部分同源

《卜筮正宗》与《卜筮全书》相关段落大量收录、解释《黄金策》及《天玄赋》传统，不能在“多源共识”统计时机械当作三份完全独立来源。

它们的价值主要是：

- 保存不同版本文本；
- 提供较明确的注释；
- 明确说明失脱不可一律以财为用；
- 细化墓、伏、合、爻位等位置解释。

因此本研究在判定 `stable_consensus` 时，至少要求再有《火珠林》《易隐》等独立传统链支持，而不是只用这三部互证。

## 3.3 《断易天机》与《天玄赋》相关段落也存在传统承接

“财化鬼必无寻路、鬼化财终可获赃”等文字在《断易天机》《卜筮全书》相关传统中高度接近，不能简单按书名计两票。

## 3.4 《易隐》

《易隐》对“拾者 / 知情 / 见否 / 位置 / 追获”有自己的系统细分，可作为重要的后世独立体系化对照。

---

# 4. 取用研究最终结论

## LP-RF-001 普通失物默认以妻财为本体观察

支持类型：`stable_consensus`

传统依据：

- 《火珠林》“失物看财”“凡失物专看财爻”；
- 《黄金策·失脱》开篇“须详卦上之妻财”；
- 《断易天机》遗失 / 盗贼体系以财爻为失物；
- 《易隐》遗失“见否”以财爻为主线。

结论：

```text
generic lost possession
→ 妻财为传统默认主观察入口
```

“默认”不等于“所有失物固定妻财”。

---

## LP-RF-002 失物本体必须允许按传统物类切换

支持类型：`stable_consensus`

古典可直接支持：

```text
普通财物             → 妻财
文书 / 牌号 / 券契    → 父母
舟车 / 衣服           → 父母
飞禽走兽 / 六畜       → 子孙
```

其中动物类不属于龟甲当前 `lost_property`，应由 Semantic Boundary 排除。

---

## LP-RF-003 文书 / 证件类失物取父母成熟度高

支持类型：`stable_consensus`

《火珠林》直接说“失文书牌号，当以父母爻取”；《黄金策》—《卜筮正宗》体系明确把文书券契列入父母类失物。

现代可谨慎连续映射到：

- 纸质证件；
- 合同原件；
- 票据；
- 证明文件。

暂不自动扩张到：

- 云端数据；
- 纯电子文件；
- 数字账户本身。

---

## LP-RF-004 舟车 / 车辆、衣物取父母可进入候选

支持类型：`cross_source_compatible_to_stable`

古典直接列举舟车、衣服；现代王虎应也沿用车辆、衣物取父母。

---

# 5. 现代物品映射冲突

## LP-RF-005 手机不能硬编码六亲

支持类型：`conflicted`

### 朱辰彬

《古筮真诠》p.120 将“电话、物件”列入父母类象。

同书 p.217 寻戒指例明确强调：同一物件要按现实用途取用；日常佩戴戒指取父母，若作为收藏保值资产则可视为财物。

### 王虎应

《六爻预测自修宝典》第二十七章将：

```text
书籍、信件、证书、车、衣服 → 父母
日用品、钱、贵重东西       → 妻财
```

并有“移动电话丢失”实例明确以妻财为用。

结论：

```text
phone → 父母
```

不是现代共识；

```text
phone → 妻财
```

也不是现代共识。

禁止：

```text
Entity Typing: phone
→ Traditional Observation: 固定父母/妻财
```

---

## LP-RF-006 现代物件“按功能取用”有解释力，但仍属分歧层

支持类型：`school_specific / cross_source_partial`

朱辰彬明确主张根据物件在本次占问中的现实用途理解取用；王虎应则把“日用品 / 贵重物”更广泛归财。

因此未来最安全的层级是：

```text
传统明确物类
↓
现代作者映射（可存在分歧）
↓
无稳定映射时 unresolved / provisional
```

禁止将某一家现代体系静默写成“古法”。

---

# 6. Recovery 与 Location 必须分层

支持类型：`stable_consensus`

传统失脱篇同时存在：

- 得失 / 可寻；
- 内外；
- 爻位；
- 五行环境；
- 墓、合、伏藏；
- 是否被盗。

朱辰彬《进阶篇》卦例 50-114（p.97）“问钥匙丢哪儿了”又把此类问题作为**现状读取**处理；该章明确说现状卦中的空、破、冲、合、墓首先表达当前状态，例如墓可表达埋藏、受困、遮掩。

因此未来传统层至少必须拆成：

```text
Object Observation
→ 失物本体取用

Recovery Assessment
→ 可寻 / 难寻证据

Location Evidence
→ 内外 / 方位 / 环境 / 隐藏状态
```

---

# 7. Recovery 最终证据矩阵

## 7.1 旺衰

### LP-REC-001 用神旺相 / 得日月支持

支持类型：`stable_consensus`

方向：正向 Recovery Evidence。

传统直接支持“日旺月旺未散可寻”“本象要旺相”“财出现旺静可见”等。

限制：

```text
旺相 ≠ 单项保证找回
```

仍须与空破、动静、内外、墓伏等共同观察。

### LP-REC-002 用神无气 / 衰绝

支持类型：`stable_consensus`

方向：负向 Recovery Evidence。

---

## 7.2 空亡 / 破

### LP-REC-003 自空、化空、空绝为强负向证据

支持类型：`stable_consensus`

《黄金策》“自空化空”；《火珠林》“财不空”作为可见条件；《易隐》把财空、空绝、空破列入难见。

重要边界：

古籍专项含义不能覆盖龟甲既有事实层。正式实现仍必须先由现有基础结构判断：

```text
旬空事实
真空 / 假空
出空 / 冲空
时间落实
```

然后失物规则只读取这些事实产生 Recovery Evidence。

禁止：

```text
只要旬空 → 永远找不回
```

---

## 7.3 动静

### LP-REC-004 静临世 / 内静旺相偏向“尚在、近处、易寻”

支持类型：`stable_consensus_as_composite`

传统有“静临世上，物尚在”“财在内卦安静旺相，物不失，必在家中”等直接表述。

### LP-REC-005 发动首先表示移动 / 转移，而不是自动失败

支持类型：`cross_source_compatible`

《火珠林》“财动物出”；《易隐》进一步分内财动、外财动表示远近。

正式抽象应为：

```text
moving
→ displacement evidence
```

而非：

```text
moving
→ unrecoverable
```

---

## 7.4 墓、伏、合

### LP-REC-006 入墓是隐藏 / 容纳 Evidence，衰败组合下才强化难寻

支持类型：`cross_source_compatible`

《黄金策》“动入墓中，财深藏而不见”；但《断易天机》又有“日辰扶合财爻、财化入墓”可表示未经贼手、藏于器皿。

所以：

```text
in_tomb
→ hidden / contained
```

稳定；

```text
in_tomb
→ permanently unrecoverable
```

不成立。

### LP-REC-007 伏神主要表示隐藏 / 不显露

支持类型：`cross_source_compatible`

伏藏可成为难见因素，但传统仍会继续借飞神 / 伏神定位，不能把伏神直接判死。

### LP-REC-008 合必须条件化

支持类型：`cross_source_compatible`

合可表示：

- 日辰合住 → 器物遮掩；
- 生合世 → 可见正向；
- 冲中逢合 / 合处逢冲 → 又有不同变化。

因此不能统一写成“合=吉”或“合=坏”。

---

## 7.5 世用关系

### LP-REC-009 用神静临世 / 生合世有古典正向支持

支持类型：`cross_source_compatible_to_stable`

《黄金策》有“静临世上，物尚在”；《易隐》把“生合世”列入可见。

### LP-REC-010 王虎应式“世克用 / 用克世”不升古典通则

支持类型：`modern_supported / classical_insufficient`

本研究没有找到足够独立古典来源，以完全相同的失物专项通则支持完整二元公式。

继续保留为现代作者规则，不能在 Traditional Rule 中强行补全。

---

## 7.6 财化鬼 / 鬼化财

### LP-REC-011 财化鬼属于强负向 / 转入盗失链，但不同传统解释不能抹平

支持类型：`cross_source_compatible`

《易隐》把“财动化鬼”列入难见。

《断易天机》—《天玄赋》传统有：

```text
财化鬼，必无寻路
```

解释为物已发生变化、踪迹难寻。

《火珠林》却有：

```text
财化鬼，妇人为贼
```

其重点转向“盗者身份类象”。

因此正式化时只能保留共同上位语义：

```text
object_to_offender_or_loss_state
→ strong negative / theft-related evidence
```

不得把“妇人为贼”等细则冒充跨传统共识。

### LP-REC-012 鬼化财偏向赃物未远 / 可获

支持类型：`cross_source_compatible`

《断易天机》《天玄赋》传统：

```text
鬼化财，终可获赃
```

《易隐》也把“鬼化财”列入可见。

可形成：

```text
offender_to_object
→ positive recovery / object-not-far evidence
```

但若未来询问“抓贼”，还需另外观察子孙制鬼等捕盗逻辑；lost_property 本身不能自动扩成捕盗。

---

# 8. 盗窃原因证据边界

## LP-REC-013 官鬼可作为 theft / loss-cause auxiliary evidence

支持类型：`stable_consensus_as_auxiliary_evidence`

传统稳定区分：

```text
财 → 失物
鬼 → 贼 / 盗窃
```

《黄金策》“鬼兴出现，定为贼窃人偷”；《火珠林》又说六爻无鬼安静可偏向自失。

龟甲未来可以输出：

```text
possible_theft
self_lost
picked_up_or_moved_by_other
```

但不得自动分析：

- 贼的性别；
- 贼的年龄；
- 贼的身份；
- 何日抓到。

这些不属于当前 lost_property 目标。

---

# 9. Location 最终证据通道

Location 不应实现为一个统一“方位公式”，而应保留多个独立 Evidence Channel。

| Channel | 传统支持 | 结论 |
|---|---|---|
| 内卦 / 外卦 | 多源 | `stable_consensus` |
| 本宫 / 他宫 | 多源 | `cross_source_compatible` |
| 爻位 1–6 | 《黄金策》等明确，后世沿用 | `cross_source_compatible` |
| 五行环境 | 《黄金策》《易隐》及现代沿用 | `stable_consensus_as_symbolic_evidence` |
| 地支方位 | 多体系使用 | `cross_source_compatible` |
| 八卦宫象 | 后世体系较常见 | `cross_source_compatible` |
| 墓 | 多源 | `stable_consensus_as_hidden_location_evidence` |
| 合 | 多源但条件不同 | `conditional` |
| 伏神 / 飞神 | 多源 | `stable_consensus_as_hidden_location_evidence` |
| 六神 | 有应用但解释差异大 | `school_sensitive` |
| 卦名 / 卦辞取象 | 零散 / 现代作者使用较多 | `school_specific` |

---

## 9.1 内外卦

### LP-LOC-001 内外卦可作为最稳定的粗空间层

支持类型：`stable_consensus`

可以输出类似：

```text
inside / home-side / near
vs
outside / external-side / farther
```

但必须结合现代现实上下文，不能机械把“内卦”永远等于住宅内部。

---

## 9.2 五行环境

### LP-LOC-002 五行只能输出环境类象，不是坐标

支持类型：`stable_consensus_as_symbolic_evidence`

传统例：

- 木 → 柴薪、木器、草木；
- 水 → 水边；
- 土 → 地、土堆；
- 金 → 金属、砖石等；
- 火 → 炉灶、火源附近。

应输出：

```text
location_environment_evidence
```

禁止输出伪精确 GPS。

---

## 9.3 爻位

### LP-LOC-003 爻位可提供空间层级，但各家细化表不能静默合并

支持类型：`cross_source_compatible`

《黄金策》明确：初、二、三、五、六等对应井灶、房中、道路、栋梁等；现代作者又会扩展为低处 / 门户 / 中层 / 路上 / 高处等。

因此只保留：

```text
line_position_evidence
```

具体类象必须携带 source / school provenance。

---

## 9.4 墓 / 合 / 伏神

### LP-LOC-004 三者可归入 hidden/contained 上位类别，但原始 Fact 必须保留

支持类型：`cross_source_compatible`

推荐抽象：

```text
in_tomb        → contained / deep-hidden
joined         → covered / wrapped / held
hidden_fushen  → underneath / not-exposed
```

同时保留：

```text
in_tomb
joined
hidden_fushen
```

禁止只留下一个“藏着”。

---

# 10. 现代实例核验

## 10.1 朱辰彬：戒指

《古筮真诠》p.217。

核心意义不是“戒指永远父母”，而是：

```text
同一实体
+ 不同现实用途
→ 取用可能变化
```

这是一条现代方法论证据，状态为 `school_specific`，不可冒充古典共识。

## 10.2 朱辰彬：钥匙

《古筮真诠·进阶篇》卦例 50-114，目录标示 p.97：“问钥匙丢哪儿了，得水地比”。

此例置于“现状卦”章节，是区分 Location 现状读取与趋势成败判断的重要现代案例。

## 10.3 王虎应：移动电话

《六爻预测自修宝典》第二十七章有至少两个移动电话失物例，以妻财为用。

其中一个明确说明“移动电话为日常用品，以妻财爻为用神”。

这与朱辰彬父母类象体系形成直接现代冲突。

---

# 11. 现代对象风险表 v1.0

| 对象 | 当前结论 | 状态 |
|---|---|---|
| 现金 | 妻财 | `high_confidence` |
| 一般财产性物件 | 妻财默认 | `high_confidence_default` |
| 纸质证件 / 合同 / 票据 | 父母 | `high_confidence` |
| 车辆 | 父母 | `high_confidence` |
| 衣物 | 父母 | `high_confidence` |
| 手机 | 父母 vs 妻财冲突 | `conflicted` |
| 钥匙 | 朱辰彬父母案例 | `school_specific` |
| 戒指（日常佩戴） | 朱辰彬父母 | `school_specific` |
| 戒指（收藏保值） | 朱辰彬可视财物 | `school_specific` |
| 银行卡 | 凭证 / 账户 / 财物功能交叉 | `insufficient_evidence` |
| 电脑 | 日用品 / 工具 / 数据载体多义 | `insufficient_evidence` |
| U盘 / 硬盘 | 载体 / 数据价值 / 用品多义 | `insufficient_evidence` |
| 云端文件 / 数字资产 | 无直接传统连续性 | `insufficient_evidence` |

---

# 12. 与当前 22 routes 的 collision 边界

当前 route inventory 中已有：

- `receive_item`；
- `item_purchase`；
- `financial_fortune`；
- `commercial_transaction`；
- `debt_collection` 等。

必须保持：

```text
快递还没到 / 运输迟延
→ receive_item

东西已确认丢失，问能否找回 / 在哪里
→ future lost_property

准备购买一个东西是否合适
→ item_purchase

某件资产值不值钱 / 能否盈利
→ 金融 / 投资目标

欠款能否追回
→ debt_collection
```

“对象是同一个东西”不能覆盖“当前问题目标不同”。

---

# 13. 与其他四个 future theme 的边界

## travel

旅行中丢了东西：

```text
问行程是否顺利 → travel
问丢失物能否找回 → lost_property
```

## litigation_dispute

因失物与商家 / 酒店发生纠纷：

```text
问物品在哪里 / 能否找回 → lost_property
问索赔 / 官司 / 调解结果 → litigation_dispute
```

## career_position / study_exam

工作证、准考证、论文文件丢失时：

```text
问失物能否找回 → lost_property
问考试 / 工作结果 → study_exam / career_position
```

物件背景不能决定 Route，目标语义决定 Route。

---

# 14. 对未来 Observation Plan 的研究结论

失物主题并不是一个单观察对象问题。

未来更合理的传统职责是：

```text
Primary Object Observation
→ 按失物物类取六亲

Role Observation
→ 世爻 / 失主自身（在文献支持的关系场景中）

Recovery Domain Evidence
→ 旺衰、空破、动静、财鬼转换、临世/生合世等

Location Domain Evidence
→ 内外、爻位、五行、墓合伏、宫象等

Loss Cause Auxiliary Evidence
→ 官鬼 / 兄弟等是否提示盗窃或他人移动
```

这些职责不能被压成：

```text
lost_property = 妻财
```

一个字段。

---

# 15. Rule Candidate 准备度

研究完成后，可进入 `ready_for_rule_review` 的候选包括：

1. 普通无生命财物失物默认妻财；
2. 文书 / 证件 / 券契类失物父母；
3. 车辆 / 衣物父母；
4. Recovery / Location 职责分离；
5. 旺相 / 无气 Recovery Evidence；
6. 空亡类强负向 Evidence（必须读取已有基础 Fact）；
7. 静临世 / 内静旺相“尚在”组合；
8. 发动作为 displacement Evidence；
9. 墓 / 伏 / 合作为条件化 hidden-location Evidence；
10. 生合世作为正向 Recovery Evidence；
11. 财化鬼强负向 / theft-related Evidence；
12. 鬼化财偏向可获 / 未远 Evidence；
13. 官鬼作为 possible_theft auxiliary evidence；
14. 内外卦、五行、爻位、墓合伏作为多通道 Location Evidence。

不得进入正式规则的内容：

- 手机固定父母或固定妻财；
- 钥匙 / 戒指统一分类；
- 银行卡、电脑、U盘、云端数据硬映射；
- 世克用 / 用克世完整二元通则；
- 六神精确定位通则；
- GPS 式精确方位；
- 由官鬼自动推贼的身份；
- “入墓 / 伏神 / 发动 = 一定找不到”。

---

# 16. 遗留 unresolved 项

这些不是阻断失物主题进入 Rule Review，但必须继续保留状态：

```text
phone_mapping = conflicted
key_mapping = school_specific
ring_mapping = school_specific
bank_card_mapping = insufficient_evidence
computer_mapping = insufficient_evidence
digital_data_mapping = insufficient_evidence
shi_controls_use_general_rule = insufficient_classical_support
parent_object_also_observe_wealth = modern_author_specific
six_spirit_location = school_sensitive
```

“研究完成”不等于把所有分歧消灭；明确记录 unresolved 本身就是完成条件之一。

---

# 17. 最终成熟度结论

```text
literatureResearchStatus = completed_and_reviewed
traditionalRuleResearch = sufficient_for_rule_review
formalRuleRegistryStatus = unchanged
semanticTrainingEligible = false
calibrationEligible = false
blindEligible = false
currentRoute = false
```

结论：

> **失物 `lost_property` 的传统文献研究阶段已经完成，可以进入独立的 Rule Candidate / Rule Registry 设计审查；但仍不得直接进入 Semantic 训练或 current route。**

最大结构结论是：

```text
现代问题
↓
确认 lost_property 目标
↓
失物本体物类取用
↓
Recovery 与 Location 分责
↓
多证据通道综合
```

而不是：

```text
“丢了东西”
→ 妻财
→ 一个旺衰结论
```
