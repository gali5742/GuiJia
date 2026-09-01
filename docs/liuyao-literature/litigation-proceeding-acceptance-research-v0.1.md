# 龟甲 · 六爻诉讼程序受理专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed`

主题：`litigation_dispute.proceeding_acceptance`

> 本文件只解除 `proceeding_acceptance` 的专项研究暂缓，不修改正式 Intent、Router、Rule Registry、current-22、Time Engine 或训练数据。

---

# 1. 研究问题

原 `litigation_dispute` 研究把：

```text
能不能立案
仲裁会不会受理
诉状会不会被法院接受
```

统一识别为：

```text
proceeding_acceptance
```

但暂缓正式规则，原因是尚未确认：

```text
Primary 应是父母文书？
还是官鬼程序 / 官府？
```

本专项只回答这个问题。

---

# 2. 核心传统证据

## 2.1 《黄金策 / 卜筮全书 · 词讼》同源簇

可核验文本：

- https://ctext.org/wiki.pl?chapter=50010&if=gb&remap=gb
- https://ctext.org/wiki.pl?chapter=750556&if=en&remap=gb
- https://www.shidianguji.com/book/HY1394/chapter/1l3wdpqbs1d0o

核心命题：

```text
凡欲上表申奏，申呈告诉等事，皆要官父两全，有气不空，则准理，缺一便不成。
```

并存在非常关键的反例结构：

```text
父旺官空 / 有父无官
→ 词状虽善
→ 官府却不放告受词
```

以及：

```text
父母有气、不受损
→ 词理 / 文书层较可用

官鬼衰绝
→ 仍难准理
```

因此不能抽象成：

```text
立案 / 受理 → 父母单用神
```

也不能抽象成：

```text
立案 / 受理 → 官鬼单用神
```

更稳定的是：

```text
父母 = filing / pleading / case document responsibility
官鬼 = accepting authority / formal proceeding responsibility
```

二者为共同必要观察职责。

### 来源独立性

《黄金策》《卜筮全书》相关收录、《卜筮正宗》相关词讼章属于承接 / 注释簇，不计作三个独立古典投票。

---

## 2.2 《易隐》独立交叉支持

在线文本：

- https://xx.theojs.cn/%E5%8D%9C/%E6%98%93%E9%9A%90/%E6%98%93%E9%9A%90%28%E5%8D%B7%E5%85%AB%29

《易隐》词讼相关条目出现：

```text
官印两旺动来生合者，皆准也。
子财同动者，不准也。
官绝逢生者，代禀而准也。
父空而官动刑克世……未准先责。
```

这里“官印”与前述“官父”形成独立体系下的兼容证据：

```text
正式准理
≠ 单看文书
≠ 单看官府
```

而是至少同时存在：

```text
official / proceeding dimension
+
filing / document dimension
```

支持类型：`cross_source_compatible_to_stable`。

---

## 2.3 《增删卜易》辅助连续性

维基文库：

- https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93

《增删卜易》的一般取用明确：

```text
父母 → 章奏、文书、文契
官鬼 → 官府
```

并在上书、申奏类问题中保留父母文书是否获准的观察。

它对现代“法院立案”不是直接逐字案例，因此只作为 semantic continuity / auxiliary traditional support，不替代《黄金策》《易隐》的直接诉讼证据。

---

# 3. 现代资料审计

## 3.1 朱辰彬

用户资料库《古筮真诠》中可核验到：

```text
占讼 / 官司诉讼
→ 官鬼作为诉讼事项用神
```

但本轮没有检索到足够直接的：

```text
法院是否立案
仲裁是否受理
诉状是否被正式接收
```

现代专项案例。

因此朱辰彬只能支持：

```text
官鬼对正式诉讼事项具有现代连续性
```

不能据此单独决定 acceptance rule。

## 3.2 王虎应

本轮公开现代资料检索同样没有找到足够清晰、可独立核验的“立案 / 受理”专门案例。

结论：

```text
modern_direct_case_support = limited
```

这不推翻古典职责结构，但要求正式规则的 evidence provenance 对现代仲裁 / 上诉受理保持 `modern_semantic_mapping` 标签，不冒充古典原词。

---

# 4. “立案”实际包含两个 current target

专项研究最重要的结构结论是：

```text
proceeding_acceptance
```

不能继续作为一个无内部职责的扁平标签。

至少要区分：

```text
institutional_acceptance
filing_document_acceptance
```

---

# 5. Institutional Acceptance

现代例句：

```text
法院会不会正式立案？
仲裁委员会会不会受理这个申请？
这次上诉能不能被正式受理？
```

current target 是：

```text
正式程序是否被 authority 激活 / 接受
```

因此建议：

```text
Primary
→ 官鬼
→ formal_proceeding_acceptance
→ required

Domain
→ 父母
→ filing_or_pleading_document
→ required

Role
→ self filing party
→ required
```

这里父母不是 optional augmentation。

原因是古典反例已经说明：

```text
文书层缺失 / 失效
```

会直接破坏“准理”结构。

同样：

```text
父旺官空
```

也不能因为文书好就推出受理。

因此该职责是：

```text
官鬼 Primary + 父母 required Domain
```

而不是单一用神。

---

# 6. Filing Document Acceptance

现代例句：

```text
我的诉状会不会被退回？
这份立案材料能不能被接收？
这次补交的申请书能不能过材料审查？
```

若 current target 明确是：

```text
filing document itself
```

则职责反转为：

```text
Primary
→ 父母
→ filing_document_acceptance
→ required

Domain
→ 官鬼
→ accepting_authority_or_proceeding
→ required

Role
→ self filing party
→ required
```

这不是与上一规则冲突，而是 current target 不同。

核心原则继续是：

```text
Modern current target
→ 决定 semantic duty
→ Traditional Rule 再选择观察职责
```

---

# 7. 当前不并入的相邻问题

## 7.1 Evidence Admission

```text
这份证据法官会不会采纳？
这个证据能不能进入案卷？
```

不等于 case / filing acceptance。

当前标记：

```text
evidence_admission = deferred
```

需要单独研究“证据文书”与“裁判采信”。

## 7.2 Procedure Information

```text
怎么立案？
应该去哪家法院？
仲裁申请怎么填？
```

仍是：

```text
legal_information_or_procedure
```

不得进入占问规则。

## 7.3 Litigation Outcome

```text
法院已经立案，这个官司最后会不会支持我？
```

仍为：

```text
litigation_outcome
```

受理与最终裁判结果是两个 duty。

---

# 8. Arbitration / Appeal 的现代映射边界

古典文本没有现代“仲裁委员会”“上诉受理”制度原词。

因此仅允许 semantic continuity：

```text
lawsuit filing
arbitration filing
appeal filing
```

都属于：

```text
formal adjudicative proceeding activation
```

传统 selector 继续使用：

```text
官鬼 + 父母
```

但 provenance 必须标记：

```text
arbitration / appeal mapping = modern_semantic_mapping
```

不得写成“古籍直接规定仲裁取官父”。

---

# 9. Rule Candidate

## RC-LD-ACC-001

```text
proposition:
正式告诉 / 申呈获准理需要官鬼与父母两个职责共同成立。

support:
cross_source_compatible_to_stable
```

## RC-LD-ACC-002

```text
proposition:
父母代表 filing / pleading / case-document responsibility。

support:
stable_consensus
```

## RC-LD-ACC-003

```text
proposition:
官鬼代表 accepting authority / formal proceeding responsibility。

support:
stable_consensus_to_cross_source_compatible
```

## RC-LD-ACC-004

```text
proposition:
institutional acceptance 与 filing-document acceptance 必须按 current target 分责。

support:
architecture conclusion grounded in direct source pair structure
```

## RC-LD-ACC-005

```text
proposition:
受理结果必须使用 composite evidence，禁止单项旺衰直接生成 Boolean。

support:
architecture boundary
```

---

# 10. Explicit Non-Candidates

```text
立案 → 固定父母单用神
立案 → 固定官鬼单用神
父母旺 = 一定立案
官鬼旺 = 一定立案
父母空 = 一定不立案
官鬼空 = 一定不立案
诉状被接收 = 官司最终胜诉
仲裁出现 = 新的传统六亲规则
证据被采纳 = proceeding_acceptance
```

---

# 11. 最终结论

本专项可以解除原先：

```text
proceeding_acceptance = recognized_but_deferred_due_to_rule_uncertainty
```

中的“传统规则不确定”部分。

新的状态应为：

```text
literatureResearch = completed_and_reviewed
ruleArchitecture = mature_for_design
modernDirectCaseCoverage = limited
```

但正式实现必须先把 Semantic duty 细化为：

```text
proceeding_acceptance
+
acceptanceTargetAspect:
  institutional_acceptance
  filing_document_acceptance
```

如果 `acceptanceTargetAspect` 无法解析：

```text
Semantic litigation event may be resolved
Traditional proceeding-acceptance plan = unresolved
```

结论：**`proceeding_acceptance` 可以进入 Rule Review / Schema Design，不再属于单纯文献暂缓项。**