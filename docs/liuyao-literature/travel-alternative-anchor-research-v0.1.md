# 龟甲 · 六爻 Travel Alternative Anchor Research v0.1

日期：2026-09-02

状态：`completed_with_blocker_no_resolver_registration`

目标：研究 `PRR-TRAVEL-ALTERNATIVE-ANCHOR`，回答同一卦中存在两个或更多现代旅行 Alternative 时，能否把每个 Alternative 稳定锚定到不同传统观察对象。

> 本研究不执行 Formal Expansion，不注册 Resolver，不修改 current-22，不修改 Time Engine，不为 Comparator 强造 Alternative mapping。

## 1. 当前问题

Choice 层已经可以表达：

```text
Alternative A
Alternative B
```

Travel Execution 也已经能对单个已锚定旅行目标形成：

```text
Fact → Evidence → Assessment
```

但真实的：

```text
A 地旅行 vs B 地旅行
```

还缺：

```text
Alternative A → traditional object A
Alternative B → traditional object B
```

如果没有这一层，Comparator 即使技术上可以比较两个 Assessment，也不能证明两个 Assessment 真正对应用户说的 A / B。

## 2. 稳定的一目标传统结构

现有研究已经确认，自占一般出行稳定结构为：

```text
世 → traveler
应 → 所往之地 / bounded destination
```

《增删卜易》《黄金策》传统及现代资料在这个单目标结构上高度兼容。

因此目前 `TEA-DEST-001` 只允许：

```text
self traveler = 世
destination = 应
```

并且只在一个明确 destination context 中使用。

## 3. 《断易天机》/《卜筮元龟》的“多路”证据

《断易天机》保存《卜筮元龟》旧法：

```text
欲知几路为行例，卦有三身三路去，两卦便言两路行，一路一身无所虑。
```

该材料能支持：

```text
传统出行理论存在 multiple-route representation 的历史意识
```

但它不能直接支持：

```text
现代明确 Alternative A = 卦身 1
现代明确 Alternative B = 卦身 2
```

更不能支持：

```text
卦身 1 / 卦身 2 的状态可直接进入 Choice Comparator
```

原因：

1. 该条主要回答“有几路 / 分几路”，不是“两个预先命名方案如何对轨”；
2. 卦身体系本身不是龟甲 current ObservationPlan 中已经审核的 Alternative-object resolver；
3. 没有足够现代独立案例证明其可稳定承担 A/B semantic identity；
4. 即使能识别多路，也仍缺每一路的具体 semantic binding 与同维度 Assessment contract。

因此分类：

```text
traditional_multiple_route_awareness
= school_or_legacy_specific_support
≠ stable_modern_alternative_anchor
```

## 4. 朱辰彬《古筮真诠》的“多地游历”案例

已核扫描本出行案例：

```text
巳月庚子日占出行，晋之观
```

其主轴仍是：

```text
世爻 → 出行者
应位父母未土 → 要去的地方
```

案例后续又根据动变出两个土爻、变观卦，解释为此行会“多地游历观光”。

这条案例非常重要，因为它证明：

```text
one reading
can contain information about multiple places
```

但它依然没有提供：

```text
用户事先给定地点 A
用户事先给定地点 B
→ 分别自动绑定到两个明确爻位
```

案例中的“多地”属于事后/细节层信息识别，并非 Alternative identity resolver。

因此：

```text
multiple_place_detail_representation = supported
named_alternative_anchoring = unsupported
```

## 5. “卦理迁就事理”的现代边界

《古筮真诠》还反复强调细节象意必须结合实际事理对轨。同一爻象可能存在多个细节解释，需由现实状态约束选择。

这能支持一个架构原则：

```text
Modern Alternative identity
must be known before traditional object anchoring
```

而不能反过来：

```text
发现两个可解释的爻
→ 自动宣布它们就是 A / B
```

否则会把细节层的择象套用误当成稳定 Resolver。

## 6. 不接受的硬编码方案

首轮明确禁止：

```text
A = 世
B = 应
```

原因：世是 traveler，不是 destination A。

禁止：

```text
A = 应
B = first_other_line
```

原因：没有稳定传统依据。

禁止：

```text
A = inner trigram
B = outer trigram
```

原因：内外可以承担远近/内外环境结构，但没有足够依据证明它们普遍等于现代用户指定的两个目的地。

禁止：

```text
A = first 父母
B = second 父母
```

原因：父母在 travel 中还可能承担交通工具、行李、文书等现实职责；同六亲多现不能自动等于两个目的地。

禁止：

```text
two readings → one choice comparison
```

Shared Comparator v0.2 已规定 cross-reading ordering 默认禁止。

## 7. 当前可支持的 Alternative 结构

Modern semantic layer 可以先稳定表达：

```ts
TravelAlternative {
  alternativeId
  destinationEntity
  routeEntity?
  transportContext?
  currentTargetAspect
}
```

这只是现实 Alternative identity。

Traditional layer 当前只能输出：

```text
single bounded destination
→ resolved / self travel / 应

multiple named destinations
→ unresolved_traditional_anchor
```

即：

```text
semantic alternatives resolved
traditional alternatives unresolved
```

这是合法 partial state。

## 8. PRR-TRAVEL-ALTERNATIVE-ANCHOR v0.1 候选接口

目前只能定义 abstention-first contract，不实现自动 selector：

```ts
interface TravelAlternativeAnchorResolution {
  status: 'resolved' | 'partial' | 'unresolved'
  readingRef: string
  alternatives: Array<{
    alternativeId: string
    semanticDestinationRef: string
    traditionalSelector?: unknown
    anchorEvidenceRefs: string[]
    issues: string[]
  }>
  comparisonReady: boolean
}
```

首轮策略：

```text
alternatives.length = 1
+ self traveler
+ bounded destination
→ existing destination contract may resolve

alternatives.length >= 2
→ comparisonReady = false
→ unresolved until explicit independent anchoring evidence exists
```

## 9. 什么证据才足以解除 blocker

至少需要下列一类证据成熟：

### A. 多独立来源的传统固定映射

能明确证明两个并列 destination 在同卦中有稳定、可重复的不同 selector。

当前未找到。

### B. 足量现代真实案例 + 可复现 contextual binding

要求：

- 用户起卦前明确给定 A/B；
- 案例能在不知道结果前把 A/B 分别锚定；
- 不依赖事后结果倒推哪个爻代表哪个地方；
- 多案例规则一致；
- 至少有独立作者/体系交叉支持。

当前未达到。

### C. 共享 Contextual Alternative Resolver

如果未来系统建立一种跨主题的 contextual object anchoring contract，能够依靠已知现代 Alternative 与卦中独立事实进行可审计对轨，则 Travel 可以接入。

但这必须是 Resolver 研究成果，不能由 Comparator 自己完成。

## 10. 与 Education / Career Alternative 的关系

该 blocker 与此前发现的：

```text
employment_transition_comparison
education_choice_comparison
```

具有共同结构：

```text
Modern A / B
↓
Theme-specific object anchoring
↓
per-alternative Observation / Evidence
↓
Comparison
```

因此长期更可能需要：

```text
Shared Alternative Object Anchoring Contract
+
Theme-specific anchor provider
```

而不是 Travel 独立发明 A/B 编码。

## 11. 研究结论

当前证据支持：

```text
single bounded destination anchoring = supported
traditional awareness of multiple routes/places = supported
multiple places may appear as detail information = supported
named A/B destination automatic anchor = insufficient_evidence
multi-alternative Travel comparison readiness = false
```

因此：

```text
PRR-TRAVEL-ALTERNATIVE-ANCHOR
status = research_complete_blocked
implementation = abstention_contract_only
selector_registration = forbidden
```

## 12. Formal gate

即使未来本 Resolver 解除 blocker，仍必须满足：

```text
stable readingRef producer
provenance-backed Fact/Evidence
Assessment regression actually executed
Comparator regression actually executed
current v0.13 expansion gate cleared
explicit user authorization for Formal Expansion
```

当前：

```text
Formal Expansion = locked
```
