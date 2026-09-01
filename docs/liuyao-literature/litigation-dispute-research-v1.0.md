# 龟甲 · 六爻诉讼纠纷主题文献研究 v1.0

日期：2026-09-01

状态：`completed_and_reviewed`

主题：`litigation_dispute`

```text
literatureResearchStatus = completed_and_reviewed
trainingEligible = false
calibrationEligible = false
blindEligible = false
currentRoute = false
formal Observation Rule = not_yet_registered
```

> 本文件完成 `litigation_dispute` 主题的传统文献研究与现代职责边界审计。它不修改当前 22-route Semantic Candidate，不修改 Intent Schema、Rule Registry、Time Engine，也不产生训练语料。

---

# 1. 最终研究问题

本研究回答：

1. 官司 / 仲裁结果是否可以简化为“官鬼为用”？
2. 世、应、官鬼、父母、子孙在争讼中分别承担什么职责？
3. 诉讼胜负、和解 / 调解、对方行动是否属于同一 Observation Rule？
4. 官鬼对世 / 应的作用与世应之间的关系应如何分层？
5. 起诉受理、证据文书是否应与诉讼结果共用同一职责？
6. 债务追收、合同履行、劳动仲裁、婚姻诉讼等现代问题如何按 current target 分流？

最终结论：

```text
诉讼纠纷 ≠ “官鬼一个用神决定胜负”

稳定结构是：
官鬼 = formal proceeding / adjudication / institutional pressure
世   = self party
应   = counterparty
父母 = case document / pleading / evidence
子孙 = settlement / dissipation support
```

胜负、和解、对方行动都要在这套职责结构上进一步分流，不能靠单一六亲旺衰直接生成结果。

---

# 2. 来源书目与 provenance

## 2.1 《黄金策·词讼》

直接支持：

```text
欲定输赢，须详世应。
应乃对头……世为自己……
相冲相克乃是欺凌之象，相生相合终成和好之情。
父为案卷文书。
若问罪名，须详官鬼；要知消散，当看子孙。
```

又有：

```text
世空则我欲息争
应动则他多机变
卦爻安静子孙兴，喜亲友劝和公事
```

这套文本明确把：

```text
双方 → 世 / 应
诉讼 / 官府 → 官鬼
文书 / 案卷 → 父母
消散 / 和解 → 子孙
```

分成不同职责。

来源：维基文库《黄金策》。

## 2.2 《卜筮全书》词讼相关收录

相关文本延续《黄金策》体系，进一步保存：

```text
世应生合、比和、六爻安静 → 和解倾向
子孙发动 → 有人劝和 / 争讼消散方向
世空 → 自方退意
应空 → 对方退意
双方皆空 → 双方俱有罢讼倾向
应动 → 对方有行动 / 机变
间爻 → 中证 / 中间关系人
```

来源关系说明：本书与《黄金策》《卜筮正宗》相关词讼段落存在明显收录、注解和承接关系，因此不能机械按三个书名计作三份完全独立证据。

## 2.3 《火珠林》·占官词讼

直接支持：

```text
占官词讼……皆看官爻。
世爻乃我家情由，应爻为彼之事理。
```

并通过官鬼对世 / 应的作用判断哪一方承受官讼压力，同时保存财、父等在文书结构中的条件作用。

重要意义：

```text
官鬼是官词讼的核心对象
```

并不等于：

```text
官鬼单独决定谁胜谁负
```

因为同一文本仍把世、应作为双方现实角色。

来源：维基文库《火珠林》。

## 2.4 《断易天机》词讼相关条目

直接支持：

```text
欲分胜负，先将世应推详。
要决因依，但把鬼爻推究。
占讼以鬼爻为主。
```

并有：

```text
官克应 → 他方受责 / 承压
鬼伤世 → 自方受讼 / 承压
```

说明：

```text
世应 → 两造 / 胜负关系
官鬼 → 官讼本体、原因、官府与制度压力
```

属于不同层级。

该书也保存“世克应我胜、应克世他胜”等传统断法，但本研究不把它升级为绝对 Boolean 规则；它只能成为 CrossObservation Evidence 的一部分。

来源：中国哲学书电子化计划《断易天机》。

## 2.5 《易隐》卷八词讼相关体系

《易隐》对争讼职责拆分更细。

### 告状 / 受理

可见：

```text
父母 → 状词、案卷、文书
官鬼 → 官府、案件受理 / 结案、诉讼程序
```

父母、官鬼各自旺衰 / 空墓绝会影响“状能否成、官能否理”的不同职责。

### 胜负

仍以：

```text
世 / 应
+
官鬼对双方的作用
```

综合判断。

### 和解 / 撤诉

系统区分：

```text
世应生合 / 比和 → 和解方向
刑害克冲 → 争执难解方向
世空 / 应空 → 对应一方退意
鬼动化子 → 争讼消散方向
```

这证明“能否和解”不能直接复用“谁胜谁负”的单一 Assessment。

来源：中国哲学书电子化计划《易隐》卷八。

## 2.6 朱辰彬《古筮真诠》

扫描本已核对的相关分类与案例支持：

```text
官鬼类象包含官府、公证、诉讼
父母类象包含契约、合同、帐目等文书职责
```

并有代占官非案例，说明：

```text
实际涉讼主体不是问卦人本人时
不能无条件把世当作涉讼人
```

因此 represented litigation 需要独立 subject resolver；首轮不直接自动化。

现代材料在本研究中用于确认现代“诉讼 / 仲裁 / 合同文书”语言到传统职责的连续性，不覆盖古典职责结构。

---

# 3. 来源独立性审计

较高独立度的传统证据链：

```text
《火珠林》
《断易天机》
《易隐》
```

同源 / 承接簇：

```text
《黄金策》
《卜筮全书》相关收录
《卜筮正宗》相关注解
```

该簇只按一条主要传统链计权，不能因为三个书名一致就伪装成“三个独立古典来源”。

现代独立参考：

```text
朱辰彬《古筮真诠》
```

王虎应现代资料可作为后续案例补充，但本轮结论不依赖单一现代作者成立。

---

# 4. 最终研究结论矩阵

| ID | 命题 | 分类 | Rule Review 资格 |
|---|---|---|---|
| LD-F-001 | 正式争讼胜负必须保留世 / 应双方结构 | `stable_consensus` | ✅ |
| LD-F-002 | 官鬼承担诉讼、裁判权力、官府与制度压力职责 | `stable_consensus` | ✅ |
| LD-F-003 | 父母承担案卷、诉状、证据、契约文书等职责 | `stable_consensus` | ✅ Domain |
| LD-F-004 | 子孙可形成和解、消散、劝和方向 Evidence | `stable_consensus_as_resolution_evidence` | ✅ Domain / Evidence |
| LD-F-005 | 世应生合 / 比和支持和解方向 | `stable_consensus` | ✅ Evidence |
| LD-F-006 | 世空 / 应空 / 俱空有对应一方退意、撤回或息争含义 | `cross_source_compatible` | ✅ Evidence |
| LD-F-007 | 应动等可形成对方行动 / 变化 Evidence | `stable_consensus_as_role_evidence` | ✅ Evidence |
| LD-F-008 | 官鬼克世 / 应形成对相应一方的制度 / 诉讼压力 | `stable_consensus` | ✅ Evidence |
| LD-F-009 | 诉讼结果不能压成官鬼旺衰，需 proceeding + parties + cross-relations | `stable_consensus_as_architecture` | ✅ |
| LD-F-010 | 起诉 / 受理存在官鬼 + 父母复合职责 | `cross_source_compatible` | ⚠️ deferred |
| LD-F-011 | 仲裁可在现代语义层映射 formal adjudicative proceeding | `modern_mapping_only / cross_source_compatible` | ✅ semantic mapping |
| LD-F-012 | 无明确程序 / 对手 / 边界的泛泛纠纷不足以进入首轮 | `semantic_insufficient` | ❌ |
| LD-F-013 | 代他人 / 组织问官司不能自动把世当涉讼主体 | `stable_role_boundary` | ❌ first release |
| LD-F-014 | 欠款能否收回时，debt recovery current target 高于 litigation method | `semantic_boundary` | ✅ |
| LD-F-015 | 合同履行 / 商业成交是 current target 时，不因“律师 / 起诉”背景转 litigation | `semantic_boundary` | ✅ |
| LD-F-016 | 婚姻状态与离婚诉讼结果必须按 current target 区分 | `semantic_boundary` | ✅ |
| LD-F-017 | 劳动仲裁中职位、工资与仲裁结果属于不同 current target | `semantic_boundary` | ✅ |

---

# 5. 首轮可规则化职责

## 5.1 Litigation Outcome

现代问题：

```text
这个官司最后我有没有胜算？
这次仲裁结果会不会对我有利？
这场诉讼最终结果如何？
```

最小 Observation 结构：

```text
Primary
→ 官鬼
→ formal_proceeding_or_adjudication

Role
→ 世
→ self_party

Role
→ 应
→ counterparty

Domain（条件）
→ 父母
→ case_document_or_evidence
```

胜负 Assessment 再消费：

```text
世 ↔ 应
官鬼 ↔ 世
官鬼 ↔ 应
双方各自旺衰 / 空破 / 动变
```

禁止：

```text
官鬼旺 = 我赢
官鬼衰 = 我输
```

## 5.2 Dispute Resolution Outcome

现代问题：

```text
这件纠纷最后能不能和解？
仲裁前双方能不能谈妥？
这场官司能不能撤掉 / 结束？
```

最小结构：

```text
Primary
→ 官鬼
→ active_dispute_or_proceeding

Role
→ 世 / self_party
→ 应 / counterparty

Domain
→ 子孙 / settlement_or_dissipation_support
```

父母只在文书 / 撤诉手续等现实职责明确时追加。

该职责与 `litigation_outcome` 共享争讼本体和双方，但使用独立 Resolution Assessment。

## 5.3 Dispute Counterparty Action

现代问题：

```text
对方会不会主动和解？
对方会不会继续上诉？
对方会不会撤回仲裁？
对方会不会继续追究？
```

current target 已经不是“整个官司结果”，而是：

```text
counterparty action
```

因此首轮允许：

```text
Primary
→ 应
→ counterparty_action_target

Role
→ 世
→ self_party

Domain（有正式争讼时）
→ 官鬼
→ formal_proceeding_context

Domain（行动为和解 / 撤回时）
→ 子孙
→ settlement_or_withdrawal_context
```

这是本主题对 legacy “对方 → 应”的正式化边界：只有**对方的具体行动本身成为 current target**时，应才可以升为 Primary。

---

# 6. 起诉 / 受理为什么暂缓

古典证据并不弱。《易隐》等明确存在：

```text
父母 → 状词 / 文书
官鬼 → 官府受理 / 官司程序
```

所以：

```text
proceeding_acceptance
```

确实是一个独立传统职责。

但它与现代：

```text
能不能立案
仲裁会不会受理
诉状会不会被法院接受
```

之间仍需要独立 Intent Contract，不能把“父母旺 / 官鬼旺”等古典条件直接塞进 outcome 规则。

首轮因此标：

```text
recognized_but_deferred
```

而不是偷塞进 `litigation_outcome`。

---

# 7. “该不该起诉 / 该不该和解”不等于结果预测

现代：

```text
我该不该起诉？
现在接受和解是不是更好？
要不要继续上诉？
```

属于 strategy / suitability / choice。

它们不是：

```text
这场诉讼最后谁赢？
双方能不能和解？
```

同一职责。

传统材料中虽有“宜和 / 不宜讼”等判断，但直接把它们转成现代策略选择需要额外价值与风险结构研究。

因此首轮：

```text
settlement_suitability
litigation_strategy
```

都 deferred。

---

# 8. 与当前 22-route 的硬边界

## 8.1 Debt Collection

```text
我起诉他以后，这笔欠款能不能要回来？
```

若 current target 是：

```text
money recovery
```

仍应：

```text
debt_collection
```

诉讼只是 collection method。

只有：

```text
这个债务官司的裁判 / 仲裁结果会不会对我有利？
```

current target 才转：

```text
litigation_dispute
```

## 8.2 Commercial Transaction / Contract Performance

```text
对方会不会按合同交货？
这笔交易最后能不能成交？
```

即使背景已经有律师函，也不能因为“纠纷”词转 litigation。

若 current target 是：

```text
transaction / performance
```

继续 commercial route。

## 8.3 Relationship / Marital

```text
我们最终会不会离婚？
```

current target 是关系状态时，属于 relationship / marital。

```text
这次离婚诉讼判决会不会支持我的请求？
```

才属于 litigation outcome。

## 8.4 Career / Labor Arbitration

```text
劳动仲裁后我的职位能不能保住？
```

current target = employment retention → `career_position`。

```text
劳动仲裁最终裁决会不会支持我？
```

current target = arbitration outcome → `litigation_dispute`。

工资 / 奖金 / 拖欠薪资金额仍按 money current target 分流。

---

# 9. 法律信息与程序咨询不是占问 Route

以下问题即使出现：

```text
法院
诉讼
仲裁
起诉
```

也不属于本主题：

```text
这个案子应该去哪个法院起诉？
仲裁程序怎么走？
起诉费多少钱？
法律规定是什么？
```

它们属于现代 informational / procedural target，应在 Semantic Gate 阻断，不得生成传统 Observation Plan。

---

# 10. Represented Subject 边界

首轮只支持：

```text
self dispute subject
```

原因不是古法不能代占，而是：

```text
代兄弟 / 子女 / 父母 / 配偶 / 公司问官司
```

实际涉讼主体必须经过关系 resolver，再重新解释“己方 / 对方”职责。

朱辰彬案例也说明代占官非时不能简单把世当作案件主体。

因此：

```text
represented_dispute_subject
→ recognized but first-release traditional rule unresolved
```

---

# 11. Assessment formalization boundary

以下只允许成为 Evidence：

```text
世应旺衰 / 空破
世应生合 / 比和 / 冲克刑害
世克应 / 应克世
官鬼克世 / 克应 / 生合双方
父母旺衰 / 空破 / 动变
子孙发动 / 生克关系
世空 / 应空 / 双方俱空
应动
```

禁止直接转成：

```text
世克应 = 保证胜诉
应克世 = 保证败诉
官鬼旺 = 保证胜诉
子孙动 = 保证和解
世空 = 保证败诉
应空 = 保证胜诉
父母旺 = 证据一定充分 / 法院一定受理
```

正式系统仍应：

```text
Fact
→ Evidence
→ Assessment
```

分层。

---

# 12. Source Registry 前置

正式登记 `EV-LD-*` 前，需要补入本轮实际采用的 provenance：

```text
《火珠林》
《断易天机》
《易隐》
《黄金策·词讼》/《卜筮全书》同源簇
朱辰彬《古筮真诠》
```

并明确《黄金策》《卜筮全书》《卜筮正宗》的承接关系，不能机械提高 independent-source tier。

---

# 13. 最终结论

本主题已经达到：

```text
literatureResearchStatus = completed_and_reviewed
matureEnoughForRuleRegistryDesign = true
```

首轮允许进入 Rule Review 的职责：

```text
litigation_outcome
dispute_resolution_outcome
dispute_counterparty_action
```

暂缓：

```text
proceeding_acceptance
settlement_suitability
litigation_strategy
generic_dispute_state
represented_dispute_subject
```

并继续保持：

```text
trainingEligible = false
currentRoute = false
```

当前 v0.13 next-topic gate 不因研究完成而自动解除。