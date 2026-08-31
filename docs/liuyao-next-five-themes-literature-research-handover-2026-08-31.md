# 龟甲 · 六爻下一批五主题文献研究 Handover

日期：2026-08-31

## 1. 本 Handover 的用途

本文件用于把 **龟甲六爻下一批五个主题的传统文献深度研究** 从当前 Semantic Model 训练对话中独立出去，交由另一对话专项完成。

当前对话继续只负责：

```text
LiuYao Semantic Decision Stack v0.13
→ 当前 22-route Baseline 1.0 形成
→ Fallback Identity / Routeability / Selection / Scope / Sufficiency 等模型与职责链训练、评估、冻结
```

另一对话负责：

```text
事业职位
考试学业
出行
诉讼纠纷
失物
```

五个主题的 **传统六爻文献研究、规则来源整理、冲突审计、规则候选形成**。

两条开发线必须保持解耦。

---

# 2. 当前项目边界

仓库：

```text
gali5742/GuiJia
```

当前只处理：

```text
龟甲 / LiuYao / 六爻
```

明确禁止：

- 不修改 BaZi / 八字实现、数据或测试。
- 不修改蓍草。
- 不修改 Time Engine。
- 不修改历史 sealed v0.11 / v0.12 行为。
- 不把文献研究结果直接写进当前 22-route Semantic Candidate。
- 不把 legacy `suggestUseGod` / 关键词 heuristic 直接当成正式传统规则证据。
- 不允许 NLP / Semantic Router 直接决定妻财、官鬼、父母、兄弟、子孙、世、应、用神。
- 健康 / 疾病类占问继续由 Product Policy Gate 禁止，不进入本次五主题研究。

---

# 3. 五个研究主题

当前 design-only inventory 已确定以下五类：

1. `career_position` —— 事业职位
2. `study_exam` —— 考试学业
3. `travel` —— 出行
4. `litigation_dispute` —— 诉讼纠纷
5. `lost_property` —— 失物

当前状态统一为：

```text
design_only
trainingEligible = false
calibrationEligible = false
blindEligible = false
currentRoute = false
formal Observation Rule = 尚未建立
```

文献研究完成并审核前，不得改变上述状态。

---

# 4. 文献研究硬门槛

仓库已加入下一主题文献研究 gate。研究完成前：

```text
不得创建正式 Observation Rule
不得把 Intent/Event schema 晋升为正式
不得制作新主题 Router / Routeability / Identity 训练语料
不得加入 current route inventory
不得用 legacy heuristic 代替传统规则来源
```

研究工作的目标不是“证明现在旧代码里的取用是对的”，而是重新从文献出发判断：

```text
现代问题
↓
传统占类如何对应
↓
主观察对象是什么
↓
是否存在辅助观察对象
↓
成败 / 吉凶 / 应期 / 方位等分别依据哪些传统关系
↓
哪些规则跨文献稳定
↓
哪些只是某一家之说
```

---

# 5. 来源层级

每个主题至少按以下层级研究。

## A. 古典原始文献

优先寻找与该占类直接相关的原文，包括但不限于：

- 用神 / 六亲取用
- 世应关系
- 旺衰、月日、动变、合冲刑害
- 空破墓绝、伏神飞神等是否在该占类具有专门意义
- 成败条件
- 吉凶条件
- 应期规则
- 方位规则（若主题涉及）
- 特殊例外

不得只摘一句“某类以某爻为用”就结束。

## B. 后世注解与体系化著作

用于判断：

- 古典原文如何被后世解释；
- 不同传统之间哪些属于一致规则；
- 哪些属于兼容但层级不同的规则；
- 哪些存在真正冲突。

## C. 现代六爻研究与案例

现代来源的作用是解决现代问题映射，例如：

- 面试 / offer / 转正 / 跳槽
- 学校录取 / 资格考试 / 论文
- 航班 / 高铁 / 行程延误
- 仲裁 / 调解 / 现代合同纠纷
- 手机 / 证件 / 电子设备失物

现代作者可作为参考来源，但不能覆盖古典规则层。

已知可纳入的现代来源之一：

```text
朱辰斌《古筮真诠》
朱辰斌《古筮真诠·进阶篇》
```

用户此前提供的是扫描 PDF；若另一对话可访问，应以实际页图 / 原文为准，不得把 OCR 猜测当成可靠引文。

## D. 现有龟甲 TR / MR

已有 TR / MR 不得丢失，但其地位是：

```text
现有规则候选 / 历史实现
≠ 新主题研究的证明来源
```

研究过程中应反查现有 TR/MR：

- 哪些得到文献支持；
- 哪些只得到部分支持；
- 哪些需要拆分；
- 哪些属于现代工程映射，而非传统规则本身。

---

# 6. 文献证据记录规范

每一条候选传统规则必须可追溯。

建议至少记录：

```text
ruleCandidateId
主题
规则命题
来源
原文 / 页码 / 章节
来源层级（古典 / 注解 / 现代）
支持类型
适用条件
例外
与其他来源关系
研究结论
```

支持类型统一区分为：

```text
stable_consensus
cross_source_compatible
school_specific
conflicted
insufficient_evidence
modern_mapping_only
```

严禁：

- 多本书观点不同却直接揉成一句统一规则；
- 没有原文支持时用一般命理知识补空白；
- 把现代作者的案例经验写成“古法”；
- 把工程便利写成传统术数依据。

若证据不足，明确写：

```text
insufficient_evidence
```

不要强行补全。

---

# 7. 每个主题必须解决的问题

## 7.1 事业职位

不能只研究“事业看官鬼”。至少需要拆清：

### 求职 / 面试 / 录用

- 求职成败主观察对象是什么？
- 官鬼、父母、世爻、应爻分别承担什么角色？
- 面试、offer、录用、入职是否属于同一传统观察结构？

### 升职 / 转正 / 职位晋升

- 与普通求职是否同一套取用？
- 官鬼代表职位、权责还是结果？
- 世爻与官鬼的关系如何解释晋升成败？

### 跳槽 / 去留决策

- “新工作好不好”与“能否被录取”必须区分。
- 需要研究现单位 / 新单位、世应、官鬼等是否存在不同观察方式。

### 必须与当前 22-route 划清

- 工资金额 → `income_salary`
- 奖金 → `income_bonus`
- 工作带来的泛财运 → 不自动变事业 route

---

## 7.2 考试学业

不能简单归结为“父母爻”。至少拆清：

### 考试成败

- 父母、官鬼、世爻各自作用；
- 通过 / 不通过与名次高低是否相同规则；
- 文书、试卷、知识、资格名位是否处于不同层次。

### 成绩 / 排名

- 是否存在专门观察结构；
- 与单纯“考试通过”有什么不同。

### 升学 / 录取 / 留学申请

- 学校、录取名额、文书、申请结果如何分别对应；
- “申请是否通过”和“去哪所学校更好”不能混为一个占类。

### 论文 / 学业进展

- 论文、答辩、课程进展是否仍沿用考试结构；
- 若文献不足，应明确保留 unresolved，而不是硬扩。

---

## 7.3 出行

必须研究的不只是“看世爻”。

### 行程是否顺利

- 世爻、应爻、动爻、父母等各自作用；
- 是否存在专门的道路 / 舟车 / 行程观察传统。

### 安全

- “能否成行”和“途中是否安全”必须拆开。
- 哪些传统信号属于危险 / 阻滞，不得只凭现代直觉映射。

### 延误 / 取消 / 交通中断

- 航班、高铁等属于现代映射，需要从传统“行人 / 行路 / 舟车 / 阻隔”等结构寻找依据。

### 天气边界

- “旅行会不会顺利”与“目的地天气如何”不是一个目标。
- 天气本身目前仍不属于这一 future route。

---

## 7.4 诉讼纠纷

此主题预计是五类中传统规则结构最复杂之一。

至少研究：

### 官司 / 仲裁结果

- 世应双方如何表示两造；
- 官鬼、父母等在诉讼中分别表示什么；
- 胜负判断如何形成。

### 和解 / 调解

- 是否与诉讼胜负使用同一主结构；
- 合、冲、世应关系是否有专项含义。

### 对方行动

- “对方会不会主动和解 / 反诉 / 继续追究”属于结果还是 counterparty action；
- 应爻在其中的地位需要独立研究。

### 与债务追收边界

- 若核心目标是“欠款能否收回”，当前 `debt_collection` 仍是目标；
- 诉讼只是手段时不能自动改成 litigation route。

---

## 7.5 失物

必须分别研究“能否找回”和“在哪里”。

### 取用

- 一般物品为何取何六亲；
- 是否按物品类别变化；
- 现 legacy 的“妻财”必须重新由文献验证，而不是默认继承。

### 能否寻回

研究：

- 用神旺衰；
- 世用关系；
- 空破墓伏；
- 动变；
- 合冲；
- 是否有专门的“可寻 / 难寻 / 已失”判断结构。

### 所在方位

研究：

- 地支 / 卦宫 / 六神 / 方位等规则来源；
- 不同传统若冲突，必须记录分歧，不强行统一。

### 对象边界

`lost_property` 只研究无生命财物。

明确排除：

- 宠物走失
- 儿童走失
- 家人、朋友、其他失踪人员

也要区分：

- 物流延迟 → `receive_item`
- 真正确认丢失 → future `lost_property`

---

# 8. 每主题最终交付物

每一个主题至少形成一份独立研究文件，不要五类塞进一个巨型文档。

建议：

```text
docs/liuyao-literature/career-position-research-v0.1.md
docs/liuyao-literature/study-exam-research-v0.1.md
docs/liuyao-literature/travel-research-v0.1.md
docs/liuyao-literature/litigation-dispute-research-v0.1.md
docs/liuyao-literature/lost-property-research-v0.1.md
```

每份必须包含：

1. 现代问题范围
2. 古典占类对应
3. 来源目录
4. 逐条原文证据
5. 主观察对象
6. 辅助观察对象
7. 成败 / 吉凶规则
8. 应期 / 方位等专项规则（若适用）
9. 文献一致项
10. 文献冲突项
11. 现代问题映射
12. 不应进入规则的内容
13. Rule Candidate 表
14. 未解决问题

另需一份总览：

```text
docs/liuyao-literature/next-five-themes-research-summary-v0.1.md
```

总览只做跨主题比较，不替代五份专项研究。

---

# 9. Rule Candidate 输出要求

文献研究阶段只能输出：

```text
Rule Candidate
```

不得直接修改正式 `liuyao-rule-registry.js`。

每条 Candidate 至少包含：

```text
candidateId
主题
传统观察对象
触发前提
主规则
辅助规则
来源证据
证据级别
冲突状态
是否足以进入 Rule Registry
```

最终状态只能从以下取：

```text
ready_for_rule_review
needs_more_evidence
school_specific_only
conflicted_hold
modern_mapping_only
reject
```

只有 `ready_for_rule_review` 才允许在后续独立工程阶段讨论是否写入正式 Rule Registry。

---

# 10. 与 Semantic Model 的接口边界

文献研究只回答：

```text
当现代语义已经确定用户问的是 X，传统六爻应该观察什么、如何判断。
```

文献研究不负责：

```text
用户这句话到底属于哪个现代语义 route。
```

因此必须维持：

```text
Modern NLP / Semantic
↓
Intent / Route / Slots
↓
Rule availability
↓
Traditional Rule Registry
↓
ObservationPlan
```

不得逆转为：

```text
看到“面试”
→ NLP 直接输出官鬼
```

也不得把“父母 / 官鬼 / 妻财”等传统术语写入 Semantic Router 训练数据作为分类捷径。

---

# 11. 与当前 22-route Baseline 的关系

本研究可以在 Baseline 1.0 形成前并行完成，但 **不得参与当前模型训练**。

正确阶段顺序：

```text
当前对话：
22-route v0.13
→ Candidate
→ fresh independent eval
→ Baseline 1.0

另一对话：
五主题文献深研
→ 五份研究报告
→ Rule Candidates
→ 冲突审计

Baseline 1.0 形成后：
两条线汇合
→ Expansion Wave 1 设计
→ 选择 2~3 个最成熟主题
→ Intent / Slot 正式化
→ Rule Registry Review
→ fresh Router / Gate training corpus
→ expansion training
→ frozen 22-route regression
```

不得因为文献研究提前完成，就提前把新主题塞入当前 v0.13 训练。

---

# 12. 研究完成判定

五个主题并不是“各找几条出处”就算完成。

每主题至少满足：

- 有古典原始文献证据；
- 有后世 / 现代解释比对；
- 主要传统观察对象有来源；
- 关键辅助观察对象有来源；
- 现代子问题之间已经拆分；
- 至少完成一次跨来源冲突审计；
- 对证据不足项明确保留 unresolved；
- 已形成 Rule Candidate 表；
- legacy heuristic 已完成“支持 / 部分支持 / 不支持 / 无法判断”审计；
- 没有把传统规则直接混入 NLP 分类层。

全部完成后，研究状态才可从：

```text
design_only / literature_research_required
```

进入：

```text
literature_research_complete_pending_rule_review
```

仍然不是正式 route 或正式 Observation Rule。

---

# 13. 当前已存在的研究 Gate

当前 Semantic 分支已建立下一主题 literature research gate，并已接入 responsibility audit。

因此后续工程对话应维持以下原则：

```text
文献研究完成之前
→ 五主题不能被训练
→ 五主题不能进入 current routes
→ 五主题不能写正式 Rule Registry
```

如果另一对话需要修改研究文档，可独立提交文档 / research-data 文件；不要改当前 v0.13 Candidate 模型文件。

---

# 14. 给接手对话的首要任务

建议从 **诉讼纠纷** 或 **失物** 开始，而不是同时铺开五类。

原因：

- 诉讼纠纷的传统结构复杂，最能暴露“官鬼 + 世应 + 父母”等多观察对象规则如何形式化；
- 失物同时涉及“取用 + 能否寻回 + 方位”，最能检验 Rule Registry 是否需要支持一个 route 下多个 Observation Goal。

完成一个主题后先固定研究模板，再复制方法到其余四类。

---

# 15. 本对话后续职责

本 Handover 建立后，当前对话不继续展开五主题文献研究。

当前对话继续推进：

```text
Fallback Identity v0.1
→ 冻结训练算法
→ 22 one-vs-rest heads 第一次训练
→ fresh calibration 单一 global threshold
→ development / safety evaluation
→ Candidate v0.3
→ fresh post-lock independent eval
→ 22-route Baseline 1.0
```

五主题文献研究结果待另一对话完成后，再在 Expansion Wave 阶段接回。
