# 龟甲 · 六爻失物 Rule Candidate Review Set v0.1

日期：2026-08-31

状态：`ready_for_rule_review`

来源研究：`docs/liuyao-literature/lost-property-research-v1.0.md`

> 本文件只列可审查的 Rule Candidate，不是正式 Rule Registry 实现。

---

## RC-LP-001 · Generic lost property object

```text
theme: lost_property
proposition: 普通无生命财物遗失，妻财作为默认 Primary Object Observation
support: stable_consensus
```

前提：

- 目标是已确认遗失的无生命财物；
- 该物不属于传统已明确分流的父母类物件；
- 不属于动物 / 人员。

排除：

- 文书、牌号、券契；
- 舟车、衣服；
- 现代对象存在已知冲突且可识别时，不得用默认规则静默覆盖。

---

## RC-LP-002 · Document / credential lost object

```text
proposition: 文书、牌号、券契及功能连续的纸质证件类失物，以父母为 Primary Object Observation
support: stable_consensus
```

现代可接受映射：

- 纸质证件；
- 合同原件；
- 票据 / 证明。

暂不覆盖电子文件 / 云端数据。

---

## RC-LP-003 · Vehicle / clothing lost object

```text
proposition: 舟车 / 车辆、衣物类失物以父母为 Primary Object Observation
support: cross_source_compatible_to_stable
```

---

## RC-LP-004 · Recovery / Location responsibility split

```text
proposition: lost_property_recovery 与 lost_property_location 共享失物本体，但使用不同 Assessment / Evidence 职责
support: stable_consensus
```

约束：Location Evidence 不得反向重选 Primary Object。

---

## RC-LP-005 · Vitality recovery evidence

```text
proposition: 失物本体用神旺相 / 得日月生扶形成正向 Recovery Evidence；无气 / 衰绝形成负向 Recovery Evidence
support: stable_consensus
```

禁止单项直接宣布最终找回 / 找不回。

---

## RC-LP-006 · Void recovery evidence

```text
proposition: 自空、化空、空绝等形成强负向 Recovery Evidence
support: stable_consensus
```

必须从龟甲已有基础 Fact / Time Fact 读取，不允许在失物规则内部重新实现另一套旬空算法。

---

## RC-LP-007 · Static-near-self composite

```text
proposition: 用神静临世，或内卦 + 静 + 旺相，构成“物尚在 / 较近 / 易寻”的强正向组合证据
support: stable_consensus_as_composite
```

不是单纯“静 = 找回”。

---

## RC-LP-008 · Movement evidence

```text
proposition: 用神发动主要形成 displacement / movement Evidence；内外卦可进一步表征移动远近
support: cross_source_compatible
```

禁止：`moving = unrecoverable`。

---

## RC-LP-009 · Hidden / contained evidence

```text
proposition: 墓、伏、合可分别形成 contained / hidden / covered Evidence
support: cross_source_compatible
```

必须保留原始 facts：

```text
in_tomb
hidden_fushen
joined
```

不得先压成统一 `hidden=true` 后丢失来源语义。

---

## RC-LP-010 · Self-object positive relation

```text
proposition: 用神生合世且自身没有被关键空破等否定条件覆盖，可形成正向 Recovery Evidence
support: cross_source_compatible
```

不扩张为完整“世克用 / 用克世”二元通则。

---

## RC-LP-011 · Object transforms to ghost

```text
proposition: 财化鬼形成强负向、转入盗失 / 难寻链的 Evidence
support: cross_source_compatible
```

传统细节存在冲突：

- 《易隐》 / 《断易天机》偏难见、无寻路；
- 《火珠林》可转向盗者身份类象。

因此正式层只取共同上位语义，不自动推断具体盗者身份。

---

## RC-LP-012 · Ghost transforms to object

```text
proposition: 鬼化财形成“赃物未远 / 可获”的正向 Recovery Evidence
support: cross_source_compatible
```

若进一步问捕盗，不在本 Candidate 范围。

---

## RC-LP-013 · Theft-cause auxiliary observation

```text
proposition: 官鬼出现 / 发动等可作为 possible_theft 辅助证据；无鬼安静等可作为 self_lost 倾向证据
support: stable_consensus_as_auxiliary_evidence
```

只允许原因层，不允许扩展贼的性别、年龄、身份、捕获日期。

---

## RC-LP-014 · Inside / outside location channel

```text
proposition: 内卦 / 外卦作为失物位置的粗空间 Evidence Channel
support: stable_consensus
```

输出应该是近 / 内 / 家侧 vs 外 / 远 / 外部侧的语义证据，不是绝对地址。

---

## RC-LP-015 · Five-element environment channel

```text
proposition: 用神五行可提供场所环境类象
support: stable_consensus_as_symbolic_evidence
```

不得转为伪精确坐标。

---

## RC-LP-016 · Line-position location channel

```text
proposition: 爻位可提供低高、门户、房内、途中等空间层级 Evidence
support: cross_source_compatible
```

具体类象须携带 source provenance，不允许把不同作者爻位表静默合并成唯一表。

---

## RC-LP-017 · Hidden-location structural channel

```text
proposition: 墓 / 合 / 伏神作为独立 hidden-location channels，并可与内外、爻位、五行证据组合
support: cross_source_compatible
```

---

# Explicit Non-Candidates

以下研究完成后仍明确不得进入 Rule Registry：

```text
phone → 固定父母
phone → 固定妻财
key → 固定父母
ring → 固定父母 / 妻财
bank card → 固定六亲
computer → 固定六亲
USB / disk / cloud data → 固定六亲
世克用 = 难找 / 用克世 = 易找 作为古典通则
六神单独决定精确位置
墓 / 伏 / 动 = 一定找不到
官鬼 → 自动识别贼人
```

---

# Review Gate

进入正式 Rule Registry 设计前必须再次确认：

1. Formal Intent/Event schema 已定义 lost_property 的 object / goal 边界；
2. Object resolver 不把现代实体类型直接等同传统六亲；
3. 现有 Time / Fact 层为空亡、月破、日月、动变提供单一事实源；
4. Recovery 与 Location 输出职责分离；
5. `receive_item` / `item_purchase` / financial routes 的 current-22 回归保持冻结；
6. unresolved modern objects 允许 abstain / unresolved，而不是强制分类。

当前：

```text
ruleCandidateReviewReady = true
formalRuleRegistryReady = false
semanticTrainingReady = false
```
