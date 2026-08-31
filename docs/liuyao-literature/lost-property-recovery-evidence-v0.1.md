# 龟甲 · 六爻失物 Recovery 证据专项 v0.1

日期：2026-08-31

状态：`research_in_progress`

所属主题：`lost_property`

> 本文件是 `lost-property-research-v0.2.md` 的 Recovery 深挖子研究，不是正式 Observation Rule。不得据此修改 Rule Registry、Semantic Candidate、Intent Schema 或 Time Engine。

---

## 1. 本轮目标

只回答一个问题：

```text
某件已经遗失的无生命财物，传统文献用哪些结构判断“可寻 / 难寻 / 尚在 / 已远去”？
```

本轮不继续扩现代物品分类，不研究宠物、人员走失，也不把“抓贼”并入 lost_property。

重点拆分六个证据簇：

1. 旺衰；
2. 空破；
3. 动静；
4. 墓 / 伏 / 合；
5. 世用关系；
6. 盗窃线索。

---

# 2. 第一原则：Recovery 与 Location 不得互相吞并

古典失物文献里同一个状态经常同时携带两类信息：

```text
A. Recovery：还能不能找到
B. Location：为什么没看见 / 藏在哪里
```

例如《黄金策》：

```text
动入墓中，财深藏而不见；
日辰合住，定然器掩遮藏。
```

这两句首先是“深藏 / 遮藏”的位置状态，而不能仅凭字面直接升级为：

```text
入墓 = 永远找不到
合住 = 永远找不到
```

《易隐》又同时出现：

```text
财空死墓胎绝、被刑害克破 → 难见
```

以及：

```text
财爻出现逢生合而不空破 → 可寻
日合财动、财化入墓胎 → 藏于器皿、未入贼手
```

因此同一“墓 / 合”状态在不同组合中可能承担：

- Recovery constraint；
- hidden / contained location evidence；
- timing trigger。

正式化时必须保存原始结构，禁止先压成一个 `recoverable=false`。

---

# 3. 旺衰证据簇

## LP-REC-RF-001：失物本体旺相 / 得日月支持，是可寻的重要正向条件

状态：`stable_consensus`

### 《黄金策·失脱》

直接将：

```text
日旺月旺
```

与“未散而可寻”联系。

这不是一般六爻旺衰知识的旁推，而是失脱篇直接用于“可寻”的专项文字。

### 《火珠林·占贼盗》

对普通失物财爻明确要求：

```text
本象要旺相
```

并把“更无气”列为不可见的重要负面条件。

### 《易隐·见否》

明确区分：

```text
财爻出现旺静 → 可见
内财无气 → 难见
```

并进一步说失物之用爻逢生旺日时、方所，可寻。

### 研究结论

可以形成高置信 Research Proposition：

```text
失物本体用神旺相 / 得日月生旺
→ positive recovery evidence
```

但不能简化成：

```text
旺 = 一定找回
```

因为文献仍同时检查空破、动静、内外、鬼兄、墓伏等条件。

---

# 4. 空破证据簇

## LP-REC-RF-002：用神真空、化空、空绝、破损状态，是跨来源稳定负向 Recovery Evidence

状态：`stable_consensus`

### 《黄金策》

失脱开篇直接有：

```text
自空化空，皆当置而不问
```

说明失物本体自空 / 化空在该体系中是很强的失落信号。

### 《火珠林》

“财不空”被列入可见条件；又说财爻空则物已出屋，并与无气共同构成难寻条件。

### 《断易天机·占遗失》

明确把：

```text
妻财遇空亡
```

列为失物难寻的重要状态。

### 《易隐》

多次把：

```text
财空、空绝、空破
```

与“难见 / 难寻”并列。

### 研究结论

可以建立：

```text
void / transformed-to-void / void-and-broken
→ strong negative recovery evidence
```

但正式 Rule Candidate 阶段仍必须与龟甲既有“旬空可出空、空有真假”的基础时间体系协调。

这里文献支持的是：

```text
失物专项中空亡具有负向含义
```

而不是宣布所有旬空都永久不可恢复。

---

# 5. 动静证据簇

## LP-REC-RF-003：静爻较偏“尚在 / 易寻”，动爻较偏“移动 / 远去”，但不能直接等价为成败布尔值

状态：`cross_source_compatible`

### 《火珠林》

有两组非常直接的失物专项文字：

```text
财动物出
```

以及：

```text
财爻旺相不空不动，可见；
财爻动了，是出屋也。
```

又说：

```text
财在内卦安静旺相，物不失，必在家中
```

### 《黄金策》

有：

```text
静临世上，物尚在
```

但“动入墓中”又说明发动后可能变成“深藏”，并非单纯“彻底不可寻”。

### 《易隐》

有：

```text
外财旺动者，远去
财内动，去不远
财外动，出外方
```

因此“动”更多稳定地表达：

```text
movement / displacement / farther-location
```

而不是单独决定 Recovery。

### 研究结论

正式化建议：

```text
moving
→ displacement evidence
→ may reduce recoverability depending on other conditions
```

而非：

```text
moving = unrecoverable
```

`静临世 / 内静旺相` 可以作为“尚在近处”的强正向组合证据。

---

# 6. 墓、伏、合证据簇

## LP-REC-RF-004：墓 / 伏 / 合首先是隐藏状态 Evidence，其 Recovery 含义依组合而变

状态：`cross_source_compatible`

### 6.1 墓

《黄金策》：

```text
动入墓中 → 财深藏而不见
```

《断易天机》：

```text
最嫌财入墓
```

《易隐》又有：

```text
财空死墓胎绝 → 难见
```

但同时也有：

```text
日合财动 / 财化入墓胎 → 藏于器皿，未入贼手
```

所以墓至少有两层：

```text
hidden / contained
+
在衰绝等组合下形成 Recovery constraint
```

不能把“墓”无条件写成终局失败。

### 6.2 伏神

《黄金策》《易隐》都大量使用伏神说明：

- 被其他事物覆盖；
- 隐藏在某类对象之下；
- 通过飞神 / 伏神关系定位。

《易隐》确有“财爻伏藏”列入难见，但随后又大量通过“财伏某爻下”继续判断拾得者与藏处。

因此：

```text
fushen
→ hidden / not directly exposed
```

稳定；

```text
fushen
→ permanently unrecoverable
```

不成立。

### 6.3 合

《黄金策》：日辰合住，多作“器掩遮藏”。

《易隐》：财出现逢生合且不空破，可寻；另有日合财动 / 化墓胎作藏器物解释。

所以“合”的 Recovery 效果取决于：

- 谁合谁；
- 是否同时旺相；
- 是否空破；
- 是否发动；
- 是否形成遮藏。

当前只适合 `evidence`，不适合 Boolean Rule。

---

# 7. 世用关系证据簇

## LP-REC-RF-005：古典支持“用神与世的接近 / 生合”具有可寻含义，但尚不足以推出王虎应式完整世克用 / 用克世二元通则

状态：`cross_source_partial`

### 古典直接证据

《黄金策》有：

```text
静临世上，物尚在
```

《易隐》有：

```text
财爻出现旺静、财化福、鬼化财、生合世者，皆可见
```

因此至少可支持：

```text
用神临世 / 生合世
→ positive recovery evidence
```

### 尚未获得充分古典交叉支持的部分

现代王虎应体系常将：

```text
世克用 → 难找
用克世 → 易找
```

作为更明确的关系规则。

本轮古典检索尚未找到足够独立来源，以完全相同的专项通则形式支持这一二分法。

因此当前必须保持：

```text
临世 / 生合世 → 有古典直接支持
世克用 / 用克世 → modern-supported, classical-insufficient
```

禁止为了架构整齐把它们强行合成统一 Relationship Rule。

---

# 8. 盗窃线索证据簇

## LP-REC-RF-006：官鬼、兄弟等可以提供 loss-cause / theft evidence，但不得直接接管 lost_property 主目标

状态：`stable_consensus_as_auxiliary_evidence`

### 《黄金策》

明确：

```text
鬼兴出现 → 贼窃人偷
```

### 《火珠林》

明确区分：

```text
财 = 失物
鬼 = 贼
子孙 = 捕捉
```

并说六爻无鬼安静，可判断并非贼偷而是自失。

### 《易隐》

进一步把：

- 兄鬼内外动；
- 财带亡劫；
- 鬼静 / 鬼动；
- 兄鬼与伏神；

用于推断拾取、盗窃及是否转移。

### 研究结论

在 `lost_property_recovery` 中允许：

```text
possible_theft
picked_up_by_other
self_lost
moved_by_other
```

作为 auxiliary evidence。

但不得自动触发：

```text
谁偷的？
贼是什么性别？
能不能抓到？
```

这些属于未来独立 theft / offender research，而不是 lost_property 自动扩展。

---

# 9. Recovery Evidence 强度分层 v0.1

## 9.1 可进入高置信候选的证据

| Evidence | 方向 | 当前状态 |
|---|---|---|
| 用神日月旺 / 旺相 | 正向 | `stable_consensus` |
| 用神无气 / 衰绝 | 负向 | `stable_consensus` |
| 用神自空 / 化空 / 空绝 | 强负向 | `stable_consensus` |
| 用神临世且静 | 正向“尚在” | `stable_consensus` |
| 用神生合世且自身不空破 | 正向 | `cross_source_compatible` |
| 内卦 + 静 + 旺相 | 正向“近处 / 尚在家侧” | `stable_consensus_as_composite` |

## 9.2 只能作为条件化 Evidence 的状态

| Evidence | 当前解释 | 状态 |
|---|---|---|
| 用神发动 | 移动 / 转移，不直接等于失败 | `cross_source_compatible` |
| 外卦发动 | 外移 / 较远 | `stable_consensus_as_location` |
| 入墓 | 深藏 / 容纳；衰绝组合时负向 | `conditional` |
| 伏神 | 隐藏 / 被覆盖 | `conditional` |
| 合住 | 遮掩 / 被包裹；也可能生合可寻 | `conditional` |
| 财化鬼 | 多来源偏难寻 / 涉盗，但需保留上下文 | `cross_source_compatible` |
| 鬼化财 | 多来源偏“物未远 / 可见” | `cross_source_compatible` |

## 9.3 目前不能升成传统通则

```text
世克用 = 一定难找
用克世 = 一定易找
六神某神 = 一定在哪
入墓 = 一定找不到
伏神 = 一定找不到
发动 = 一定找不到
官鬼出现 = 一定被偷
```

---

# 10. 对龟甲未来形式化的约束

本轮证据进一步支持把 Recovery 写成**非单一评分、非单一布尔公式**。

建议未来仍保持：

```text
Recovery Evidence Set
├─ vitality
├─ void_break
├─ movement
├─ hidden_contained
├─ self_object_relation
└─ loss_cause
```

每个 Evidence 保留原始来源与条件。

尤其禁止：

```text
墓 + 伏 + 合 + 动
→ 统一扣分
```

因为这四类状态并不处在同一个语义层。

这与龟甲现有复合观察原则一致：多个必要观察维度可以并存，但不得用简单加总把不同职责压扁。

---

# 11. 本轮研究结论

当前可以把失物 Recovery 的成熟度更新为：

```text
旺衰        → 较成熟
空亡        → 较成熟
动静        → 已能区分“移动”与“成败”
墓伏合      → 已确认必须条件化，不可直接 Boolean
临世 / 生合世 → 有传统直接支持
世克用 / 用克世 → 尚缺古典交叉证据
盗窃线索    → 可作为 auxiliary evidence，不能扩成抓贼目标
```

因此：

```text
lost_property_recovery
```

已经开始接近 `ready_for_rule_review`，但仍未达到。

主要剩余阻断：

1. 空亡必须与龟甲既有“真空 / 出空 / 冲空”等基础结构协调，不能直接拿古籍一句话覆盖现有事实层；
2. “财化鬼 / 鬼化财”的专项含义还需与《火珠林》《断易天机》《易隐》逐条对照；
3. 王虎应“世克用 / 用克世”仍缺古典多源证据；
4. 父母类失物是否应兼看妻财，仍未找到足够早期来源；
5. 现代手机等物类冲突仍属于另一个映射层，不应混进 Recovery 规则。

当前状态继续保持：

```text
research_in_progress
formalRuleReady = false
semanticTrainingReady = false
routePromotionReady = false
```
