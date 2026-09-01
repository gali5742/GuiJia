# 龟甲 · 六爻代问诉讼当事人 Resolver 专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_partial_design`

主题：

```text
litigation_dispute.represented_dispute_subject_resolver
```

> 本专项只研究“代问他人官司 / 纠纷”中的实际当事人、代占者与对方当事人的职责分离。不修改正式 Intent / Router / Rule Registry / current-22 / training。

---

# 1. 核心问题

当前 litigation first-phase 自占结构：

```text
世 → self party
应 → counterparty
官鬼 → formal proceeding / adjudication
父母 → case document / pleading
```

现代代问：

```text
我爸这个官司能不能赢？
我儿子的劳动仲裁结果怎么样？
我替老婆问，她和对方最后会不会和解？
朋友的诉讼会不会败诉？
```

不能直接把：

```text
represented subject = 世
counterparty = 应
```

因为传统代占与自占的角色机制不同。

---

# 2. 自占诉讼的稳定世应结构

《黄金策·词讼》明确：

```text
欲定输赢，须详世应
应乃对头
世为自己
父为案卷文书
鬼作问官
```

《卜筮全书》相关注解进一步把：

```text
世 → 原告 / 自己
应 → 被告 / 对头
```

作为自占争讼双方结构。

因此：

```text
self litigation
→ 世 / 应 双方结构
```

具有稳定传统支持。

来源：

- https://zh.wikisource.org/zh-hans/%E9%BB%84%E9%87%91%E7%AD%96
- https://www.yanyilundao.com/b3/241

---

# 3. 代占的一般传统结构

《增删卜易》及朱辰彬《古筮真诠》都保留一个关键原则：

```text
代占他人
→ 按实际关系六亲取被代问者
```

例如：

```text
父亲 → 父母
孩子 → 子孙
妻子 → 妻财
丈夫 → 官鬼
兄弟 / 朋友 → 兄弟（在关系成立时）
```

朱辰彬进一步明确指出：

```text
代占之卦，世爻只代表代占者自己而不是事主
```

也就是说：

```text
represented party relation line
≠ 世爻位置重命名
```

这是本 Resolver 最重要的边界。

用户资料库：

- 《古筮真诠》代占章节：代占父母 / 子女等按实际关系爻定位；世仍可能表示代占者。

---

# 4. 代占还有“意念来源”不稳定问题

《增删卜易》相关古例与朱辰彬解释明确记录：

```text
本人有强烈念头，却命他人代占
```

卦象可能仍应本人之念，而不是按代占人表面提问机械落关系爻。

经典案例：

```text
官府命家仆代占主人有灾否
```

原本若按“家人占主”应取父母，但实际卦象应官府本人之念，世爻反成核心。

这说明：

```text
representedSubject relation resolution
```

是必要语义输入，却不是足以保证传统取用唯一正确的条件。

因此自动系统不得宣称：

```text
只要识别出“我爸”
→ 父母爻必为最终诉讼当事人 Primary
```

证据分类：

```text
stable_for_relation_candidate
conflicted_for_full_proxy-intention resolution
```

---

# 5. 主控性代占进一步破坏简单公式

朱辰彬区分：

```text
失控性代占
主控性代占
```

失控性代占：

```text
事情主要由被代问者自己承担 / 决策
→ 关系六亲更适合作为实际事主观察核心
```

主控性代占：

```text
代占者自己实际掌握决策、资源或行为控制权
→ 世爻仍可能直接进入事件核心
```

诉讼场景中可能出现：

```text
父母替未成年子女处理诉讼
家属实际代为聘律师 / 提交材料 / 决定和解
公司负责人替公司成员或项目主体处理争议
```

所以：

```text
represented party
+
controller / decision maker
```

可能不是同一个现实人物。

---

# 6. 为什么不能把“关系爻”直接替换为新世爻

自占词讼中的：

```text
世 ↔ 应
```

不仅是两个人的标签，还包含：

```text
self vs other
我方 vs 对方
主动 / 被动
相生相合 / 相冲相克的双方关系
```

若代问父亲：

```text
父母爻 = actual litigant
```

并不能自动推出：

```text
应爻 = 父亲的诉讼对方
```

因为应仍首先是相对于摇卦者 / 卦中上下文的 contextual other，缺少稳定多源证据证明它会自动重新绑定到父亲的 opponent。

因此禁止：

```text
parent case:
父母 = virtual 世
应 = virtual 对方
```

这种“虚拟世应重映射”。

---

# 7. Resolver 建议

新增：

```text
PRR-DISPUTE-PARTICIPANT
```

输入：

```ts
{
  relationToQuerent:
    | 'self'
    | 'parent'
    | 'child'
    | 'wife'
    | 'husband'
    | 'sibling'
    | 'friend_or_peer'
    | 'other'
    | 'unknown'

  representationMode:
    | 'self'
    | 'proxy_uncontrolled'
    | 'proxy_controller'
    | 'unknown'

  currentTargetRole:
    | 'litigant'
    | 'counterparty'
    | 'settlement_actor'
    | 'appeal_actor'
    | 'filing_actor'
    | 'unknown'
}
```

输出：

```ts
{
  status: 'resolved' | 'partial' | 'conflicted' | 'unresolved',
  representedPartySelector?: '世' | '父母' | '子孙' | '妻财' | '官鬼' | '兄弟',
  selectorRole?: 'self_party' | 'represented_party',
  counterpartySelectorStatus: 'resolved' | 'unresolved',
  notes: []
}
```

---

# 8. First-phase Resolution

## 8.1 Self

```text
relationToQuerent = self
representationMode = self
```

可以：

```text
self party → 世
counterparty → 应
```

完整现有 litigation Base Rules 可继续使用。

## 8.2 Parent / Child / Spouse / Sibling

可以解析：

```text
parent  → 父母 / represented_party
child   → 子孙 / represented_party
wife    → 妻财 / represented_party
husband → 官鬼 / represented_party
sibling → 兄弟 / represented_party
```

但：

```text
counterparty selector = unresolved
```

所以：

```text
base proceeding context = known
represented party = known
counterparty = unresolved
overall litigation outcome plan = partial_design
```

## 8.3 Friend / Peer

现代朋友通常可有兄弟类象连续性，但关系强度 / 同辈属性存在语境差异。

第一阶段建议：

```text
friend_or_peer
→ provisional 兄弟 candidate
→ not full auto for litigation outcome
```

## 8.4 Other / Unknown

```text
unresolved
```

禁止 fallback 到应。

---

# 9. 对 Litigation Duties 的影响

## 9.1 litigation_outcome

第一阶段完整自动化继续要求：

```text
disputeSubject = self
```

represented subject：

```text
semantic event = resolved
represented party = may resolve
counterparty role = unresolved
full winner/outcome ObservationPlan = partial_design
```

不得硬给“胜负”。

## 9.2 dispute_resolution_outcome

和解需要双方关系。

代问情况下如果对方 contextual anchor 未解决：

```text
partial_design
```

不能机械用：

```text
represented relation line ↔ 应
```

## 9.3 dispute_counterparty_action

若用户问：

```text
我爸官司里的对方会不会主动和解？
```

current target 是对方行动，但“对方”相对于 represented party 的传统 selector 尚未稳定。

因此：

```text
represented proxy + counterparty_action
→ deferred / partial
```

self-case 仍可用应 Primary。

## 9.4 proceeding_acceptance

如果只是问：

```text
我儿子的案件会不会被法院正式受理？
```

受理职责本身：

```text
官鬼 Primary
父母 Required Domain
```

并不依赖世应双方胜负结构。

此时 represented party 仅作为 Role/context，理论上比 `litigation_outcome` 更容易支持。

但仍需确认实际申请人 / filing actor，尤其主控性代占场景。

所以 first-phase 可允许：

```text
proceeding_acceptance with represented subject
→ partial / candidate for later promotion
```

不能自动把代占者世爻当实际 filing actor。

---

# 10. Semantic Schema 建议

```ts
disputeSubject: {
  relationToQuerent:
    | 'self'
    | 'parent'
    | 'child'
    | 'wife'
    | 'husband'
    | 'sibling'
    | 'friend_or_peer'
    | 'other'
    | 'unknown',
  representationMode:
    | 'self'
    | 'proxy_uncontrolled'
    | 'proxy_controller'
    | 'unknown'
}
```

另加：

```ts
disputeParticipants?: {
  actualLitigantKnown: boolean,
  actualCounterpartyKnown: boolean,
  filingActorRelation?: string,
  settlementDecisionMakerRelation?: string
}
```

现代 Semantic 层不输出六亲。

---

# 11. Status Matrix

```text
self litigation participant mapping
→ stable

represented family-member litigant relation selector
→ cross_source_compatible candidate

represented friend → 兄弟
→ provisional / context-sensitive

represented litigant → counterparty = 应
→ unsupported universal rule

virtual 世应 remapping
→ forbidden

proxy intention / control classification
→ required for full automation
```

---

# 12. Final Conclusion

本专项没有解除“代问诉讼完整胜负自动化”的暂缓，而是把阻断位置明确到：

```text
actual represented party
→ often resolvable by relationship

counterparty relative to represented party
→ not automatically resolvable

proxy controller / intention source
→ may change which role actually matters
```

因此正确 first-phase contract 是：

```text
self case
→ full litigation structure eligible

represented case
→ semantic recognized
→ represented party resolver may succeed
→ counterparty / bilateral structure may remain unresolved
→ overall = partial_design
```

这比直接重映射世应更符合古典词讼结构与代占资料，也保留可靠 abstention。

当前仍：

```text
formal Intent integration = blocked
formal Rule Registry integration = blocked
semantic training = false
current route = false
```

原因：v0.13 next-topic boundary 仍为 design-only。