# 龟甲 · 六爻 Source Registry / Provenance Normalization v0.1

日期：2026-09-01

状态：`design_complete_no_runtime_migration`

机器可读 registry：

```text
data/liuyao-source-provenance-registry-v0.1.json
```

范围：六爻规则证据来源、文本传承、作者 / 学派独立性与未来 Evidence provenance。

> 本规范不修改 current-22，不改写 `js/liuyao-rule-registry.js` 现有 `SOURCES / EVIDENCES`，不修改 v0.13 Candidate、Router、Intent、Time Engine 或训练数据。

---

# 1. 为什么必须单独做这一层

当前正式 `liuyao-rule-registry.js` 已有：

```text
SOURCES
EVIDENCES
```

并使用：

```text
classical_multi_source
classical_single_source
modern_consensus
modern_supported
```

等 tier。

但当前结构主要记录：

```text
sourceRefs
+
provenance = direct / cross_checked / derived
```

还不能回答：

```text
这些 sourceRefs 是否真的是相互独立的证据？
```

五主题研究已经反复发现：

```text
《黄金策》
《卜筮全书》相关收录
《卜筮正宗》相关注解
```

在具体命题上可能属于同一文本传承簇。

如果机械做：

```text
3 个书名
→ 3 个独立来源
```

会制造伪 source diversity。

同理：

```text
王虎应《六爻预测自修宝典》
王虎应《六爻用神答疑》
王虎应其他著作
```

可以是多个 witness，但不能自动算成多个独立现代作者 / 学派。

朱辰彬《古筮真诠》与《古筮真诠·进阶篇》亦同。

---

# 2. 三个必须分开的概念

```text
Source Witness
≠
Independent Evidence Lineage
≠
Compatible Conclusion
```

## 2.1 Source Witness

表示：

```text
在哪本书 / 哪份材料看到这条内容
```

例如：

```text
SRC-HJC
SRC-BSQS
SRC-BSZZ
```

都是不同 source witness。

## 2.2 Independent Evidence Lineage

表示：

```text
这条命题是否来自独立传统链 / 独立现代作者体系
```

若《卜筮全书》《卜筮正宗》只是收录 / 注解同一《黄金策》文字，则该 Evidence 应统一引用：

```text
TRAD-HJC-TRANSMISSION
```

而不是三票。

## 2.3 Compatible Conclusion

两个独立传统来源即使文字不同，也可能在职责层形成：

```text
cross_source_compatible
```

相反，同一传承簇出现三次相同文字也不能自动升级：

```text
stable_consensus
```

所以“结论分类”必须建立在 independence audit 之后。

---

# 3. Source Registry v0.1 收录范围

当前机器 registry 收录已经实际用于 current Rule Registry 或本轮主题研究的主要来源。

## 3.1 传统来源

```text
SRC-ZSBY  增删卜易
SRC-HZL   火珠林
SRC-DYTJ  断易天机
SRC-YY    易隐
SRC-HJC   黄金策
SRC-BSQS  卜筮全书
SRC-BSZZ  卜筮正宗
```

### 已确认的关键传承约束

```text
黄金策
├─ 卜筮全书相关收录 / 解释
└─ 卜筮正宗相关收录 / 注解
```

只对**实际采用同一《黄金策》段落的 Evidence**使用：

```text
TRAD-HJC-TRANSMISSION
```

不能因此反向断言：

```text
卜筮全书整本书都没有独立证据
卜筮正宗整本书都没有独立证据
```

例如事业研究单独采用《卜筮全书·求仕章》时，若后续正式 Evidence Audit 能证明不是重复《黄金策》文本，则可使用：

```text
TRAD-BSQS-INDEPENDENT
```

所以 Independence 必须最终落在**Evidence level**，不能只看书名。

### 断易天机 / 天玄赋类共享文字

失物研究已经指出：

```text
《断易天机》
《卜筮全书》相关天玄赋传统
```

部分公式高度接近。

v0.1 不对其整书强行判定同源，只记录：

```text
shared_or_inherited_formula_requires_evidence_scope_review
```

未来具体 Evidence 遇到该类文字时，必须人工确认 independence group，不能机械双计。

---

# 4. 现代来源分组

当前研究实际使用的主要现代作者体系：

```text
MOD-WHY
→ 王虎应

MOD-ZCB
→ 朱辰彬
```

## 4.1 王虎应

当前 registry 收录：

```text
SRC-WHY-ZX
→ 六爻预测自修宝典

SRC-WHY-YH
→ 六爻疑惑指迷
→ 当前 runtime 已注册来源

SRC-WHY-YSDY
→ 六爻用神答疑
→ 事业 / 学业研究采用
```

这些可以承担不同 witness / 不同案例职责，但默认属于：

```text
MOD-WHY
```

所以：

```text
王虎应著作 A + 王虎应著作 B
```

不能自动声明：

```text
modern_consensus across independent authors
```

它们最多可以增强：

```text
作者体系内部一致性
规则演变 / 细化证据
更多直接案例
```

## 4.2 朱辰彬

```text
SRC-ZCB-GSZZ
SRC-ZCB-GSZZ-JJ
```

统一属于：

```text
MOD-ZCB
```

同样不能因为两本书就当两个独立现代作者来源。

---

# 5. Evidence Independence Contract

未来每个正式 next-topic Evidence 至少必须具有：

```ts
{
  evidenceId,
  sourceRefs,
  independenceGroupRefs,
  directness,
  locationRefs,
  classification
}
```

其中：

```text
sourceRefs
```

回答：

```text
文本 / 案例在哪些 witness 中可见？
```

而：

```text
independenceGroupRefs
```

回答：

```text
在这个具体命题上真正有几条独立证据链？
```

例如同一《黄金策》词讼原文同时见于两个后世收录本：

```js
{
  sourceRefs:[
    'SRC-HJC',
    'SRC-BSQS',
    'SRC-BSZZ'
  ],
  independenceGroupRefs:[
    'TRAD-HJC-TRANSMISSION'
  ]
}
```

这表示：

```text
3 个 witness
1 条 independent textual lineage
```

---

# 6. Consensus / Classification Policy

v0.1 **故意不规定一个简单数字阈值**：

```text
2 独立来源 = stable
3 独立来源 = consensus
```

这种规则暂不采用。

原因：

```text
来源时代不同
命题精确度不同
直接原文与现代功能映射不同
某些独立来源之间存在真实流派冲突
```

因此正式分类仍需研究审查：

```text
stable_consensus
cross_source_compatible
school_specific
conflicted
insufficient_evidence
modern_mapping_only
```

但以后不得再只凭：

```text
sourceRefs.length
```

决定分类。

### modern consensus

若声称：

```text
modern cross-author consensus
```

至少必须有超过一个：

```text
modern_author_school independence group
```

例如：

```text
MOD-WHY + MOD-ZCB
```

同一作者的多本书不满足这个条件。

---

# 7. 对现有 Runtime Registry 的审计结果

当前 `js/liuyao-rule-registry.js` 中至少存在需要未来 provenance migration 重新核验的 tier，例如：

```text
EV-TR001-A
EV-TR001-E
EV-TR002
```

当前使用：

```text
sourceRefs = [SRC-ZSBY, SRC-BSZZ]
tier = classical_multi_source
```

这并不意味着这些 Evidence 现在一定错误。

真正的问题是当前结构无法显式说明：

```text
这两个来源对该命题的独立性依据是什么
```

类似地：

```text
EV-MR001
EV-MR002-A
```

等 current evidence 使用不同现代作者来源时具有较好的跨作者形态，但 runtime 仍没有 formal independence group 字段。

### v0.1 处理

当前禁止直接修改：

```text
SOURCES
EVIDENCES
tier
observation rules
```

理由：

```text
current-22 frozen behavior
+
当前 v0.13 并行开发
```

所以本次只记录：

```text
current22MigrationStatus = not_started
```

若未来要迁移，应独立版本化，例如：

```text
Rule Registry provenance v0.2
```

并做 frozen regression。

---

# 8. 对 Next-topic Rule Registry 的强制要求

以后 career / study / travel / litigation / lost-property / person-return / person-contact 等进入正式 Rule Registry 前：

```text
Formal Evidence ID
↓
Normalized Source Registry
↓
Evidence-specific Independence Groups
↓
Conflict / Compatibility Classification
↓
Rule Candidate
```

缺任何一层都不得 promotion。

尤其禁止：

```text
研究文档写“多源支持”
→ 直接注册 classical_multi_source
```

必须明确“多源”究竟是：

```text
multiple witnesses
```

还是：

```text
multiple independent lineages
```

---

# 9. 与 `liuyao-literature.js` 的关系

仓库另有：

```text
js/liuyao-literature.js
```

其中保存面向解释 / 文献展示的：

```text
book
chapter
quote
sourceUrl
verified
```

它与本 Source Registry 职责不同。

```text
liuyao-literature.js
→ learner / explanation-facing literature entries

source provenance registry
→ Rule Evidence provenance / independence governance
```

v0.1 不把两者强行合并。

未来可以让 literature entry 引用统一 `sourceId`，但必须另做迁移；不能因为书名相同就自动 join。

---

# 10. 与 Shared Resolver 的新审计发现

本轮开始时重新审计当前最新分支，发现已经存在：

```text
liuyao-participant-resolver.js
liuyao-object-entity-resolver.js
liuyao-contextual-object-role-adapter.js
liuyao-entity-typing-adapter.js
liuyao-resolver-role-arbitration.js
```

因此后续原计划中的：

```text
Shared Participant / Object Resolver Architecture
```

**不得另建一套平行基础设施。**

目前初审：

```text
liuyao-participant-resolver.js
→ 当前主要针对 relationship_development 的浪漫关系参与者细化

liuyao-object-entity-resolver.js
→ current-22 的现代 referent / semantic slot provider
→ 只证明显式实体对象，不决定传统六亲
```

所以正确下一步应是：

```text
审计现有 Resolver contract
↓
设计可扩展的 shared participant/entity interface
↓
让 next-topic Resolver 作为 adapter / extension 消费
```

而不是新写第二个彼此竞争的 participant/entity parser。

---

# 11. 当前完成状态

```text
source identity normalization        = complete_v0.1
traditional lineage representation  = complete_v0.1
modern author/school grouping        = complete_v0.1
evidence independence contract       = complete_v0.1
runtime Rule Registry migration      = not_started
current22 behavior mutation          = false
next-topic training eligibility      = false
```

---

# 12. 下一步

Source Registry 完成后，执行顺序调整为：

```text
1. Expanded Global Collision Matrix
2. Existing Resolver Infrastructure Audit
3. Shared Resolver Extension Contract
4. residual research → isolated contracts
5. domain comparator research
6. choice aggregation policy
7. 等待 v0.13 expansion gate
```

其中第 2 步必须优先于原先设想的“新建 Shared Resolver Architecture”，因为当前仓库已经存在相关模块。

---

# 13. 最终结论

Source provenance 的核心不是增加更多书名，而是解决：

```text
我看到了几份文本
≠
我拥有几条独立证据
```

从 v0.1 开始，龟甲 future-rule evidence 应同时保存：

```text
witness provenance
+
independent lineage provenance
```

这样才能避免把文本传承误当共识，也能保留真实的流派分歧。
