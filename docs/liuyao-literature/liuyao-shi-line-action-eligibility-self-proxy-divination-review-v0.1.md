# 龟甲 · 六爻 Shi-Line Action Eligibility in Self vs Proxy Divination Review v0.1

日期：2026-09-08

状态：`research_complete_design_only_topic_specific_classical_outward_action_supported_no_universal_permission_or_prohibition_analysis_layer_required`

范围：六爻共享研究层 / 世爻在自占自事、本人参与的己彼事项、代占 / 他占、与自身无关事项中的动态作用资格（Dynamic Action Eligibility），以及吉凶、应期、细节等分析层之间的职责边界。

上游：

- `liuyao-three-harmony-coalition-membership-role-sensitive-directionality-review-v0.1.md`
- `liuyao-three-harmony-coalition-effectiveness-group-actor-target-review-v0.1.md`
- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `liuyao-directed-interaction-path-control-transformation-review-v0.1.md`
- `liuyao-interaction-precedence-multi-moving-adjudication-review-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`

> 本研究只回答：世爻已经承担某一题义角色且发生发动时，传统文献是否允许其向局外 / 其他角色发生主动作用；“自占自事”是否足以构成全局禁止；代占 / 他占是否存在不同作用资格；以及现代朱辰彬体系的“世爻最终目标”规则应被怎样限定。v0.1 不建立 executable Action Eligibility Resolver，不修改 Rule Registry、Time Engine、current-22、Candidate、训练数据或任何 runtime。

---

# 1. Executive Decision

本轮最大的结论是：

```text
self-divination / self-involvement
≠
universal prohibition on Shi outward action
```

上一轮将：

```text
self-divination
+
Shi ∈ active coalition
+
external target
→ outward dynamic action eligibility
```

暂列为：

```text
classical_unresolved
```

本轮必须细化。

因为传统材料中已经存在至少一类非常明确的：

```text
本人参与事项
+
世动
+
世克应
+
直接解释为“我主动对彼”
```

结构。

最强证据来自《增删卜易》诉讼 / 争竞：

```text
世动克应，我兴词
```

以及：

```text
世宜旺动克应
```

这不是仅仅把：

```text
世克应
```

当静态 role relation 使用。

文本明确把：

```text
世之动
+
对应该方的克制方向
```

用于解释：

```text
我主动兴讼 / 我方取得主动或胜势
```

因此以下 universal proposition 被否定：

```text
凡自占自事
moving Shi
永远只能是最终受体
永远不能向任何外部角色发生主动作用
```

但是，反方向的 universal proposition 也不能成立：

```text
凡 moving Shi
在所有自占题中
都可以向所有相关 target 发 active edge
```

传统材料显示的更像是：

```text
Action Eligibility
= topic-resolved
+ role-resolved
+ analysis-layer-resolved
+ activity/path-resolved
```

而不是：

```text
if selfDivination then false
else true
```

本轮最终分类：

```text
role_semantic_relation_vs_action_edge
= still_separate

classical_self_participant_moving_shi_outward_action
= supported_in_explicit_topic_rules

classical_universal_self_shi_outward_permission
= insufficient_evidence

classical_universal_self_shi_outward_prohibition
= rejected_as_shared_rule

classical_proxy_nonself_shi_outward_relation
= strongly_supported_in_person_return_line

analysis_layer
= required_decision_dimension

MOD_ZCB_self_goodbad_layer_no_outward
= modern_school_specific

MOD_ZCB_detail_layer_outward_allowed
= modern_school_specific_direct

MOD_ZCB_proxy_nonself_outward_allowed
= modern_school_specific_direct

MOD_WHY_broad_outward_policy
= modern_author_supported

single_boolean_shi_can_act
= rejected

universal_action_eligibility_resolver
= not_ready

Formal Expansion
= not_authorized
```

---

# 2. 先纠正术语：Self Divination 不是一个单一场景

现代讨论很容易把所有“自占”压成一个布尔字段：

```text
selfDivination = true
```

但传统材料至少要求拆成三类。

## 2.1 纯自身承受型 Self-Affair

例如：

```text
我这次考试能不能通过
我能不能找到某物
我的病情如何
我能不能升职
```

典型结构：

```text
世 = 占者自身
用 = 事情主体
```

现代 ZCB 的“世为最终目标”规则主要针对这一类，且限定于吉凶判断层。

## 2.2 本人参与的己彼互动型 Self-Participant

例如：

```text
我与对方争讼
我与他争斗
我与对方交易
我与配偶关系如何
```

此时：

```text
世 = 我方 actor / participant
应 = 彼方 actor / participant
```

传统文本可能直接把：

```text
世 → 应
应 → 世
```

当作双方互动关系。

这类不能与“我考试成不成”完全同构。

## 2.3 代占 / 他占 / Non-Self Matter

例如：

```text
我替朋友问他何时回来
我替妻子问面试能否成功
事情本身与占者祸福无直接关系
```

此时：

```text
世的位置标签
```

未必承担最终现实承受者职责。

因此：

```text
self / proxy
```

仍然重要，但它不是唯一维度。

---

# 3. 仍须保留：Role-Semantic Relation ≠ Dynamic Action Edge

上一轮建立的边界继续有效：

```text
Role-Semantic Relation
≠
Dynamic Action Edge
```

例如：

```text
世克用
```

可以只表示题义关系。

而：

```text
世动克应，我兴词
```

则多出一个关键条件：

```text
moving Shi
```

并且原文把它解释为：

```text
我主动兴讼
```

所以本轮至少要区分：

```text
A. role relation only
B. activity-qualified role relation
C. explicit directed-action formula
D. fully adjudicated effective interaction
```

其中：

```text
C
```

仍不自动等于：

```text
D
```

因为还可能受：

```text
旺衰
日月
他动
合绊
入墓
进退
回头生克
```

等条件影响。

---

# 4. Classical Direct A：《增删卜易·防非避讼》

《增删卜易》防非避讼章直接给出：

```text
世动克应，我兴词
```

并与：

```text
应克世爻，他有讼
```

并列。

这里不是抽象讨论五行。

题义已经明确：

```text
我 / 他
+
诉讼主动性
```

而且第一句显式包含：

```text
世动
```

因此可以安全抽取：

```text
Topic = litigation initiation
Shi represents self-side participant
Ying represents counterparty
Shi is moving
Shi controls Ying
→ traditional judgment treats self-side as initiating action
```

分类：

```text
source = SRC-ZSBY
independenceGroup = TRAD-ZSBY
classification = classical_direct_topic_specific_self_participant_outward_action
```

这条证据足以否定：

```text
自占 / 本人参与
→ moving Shi 永远没有 outward action eligibility
```

但不能扩张成：

```text
所有自占题
→ moving Shi 可以作用所有 target
```

---

# 5. Classical Direct B：《增删卜易·斗殴争竞》

同一来源在争竞章进一步写：

```text
彼此相争寻世应
```

并且：

```text
世宜旺动克应
```

随后把：

```text
世克应
```

与我方胜势相连。

这里至少有三层信息：

```text
1. 世 / 应 = 两方 participant
2. moving status 被显式纳入
3. control direction 指向对方
```

所以：

```text
世动
```

在该题义下不是仅仅：

```text
self state changed
```

而具有：

```text
self-side outward contest action
```

的传统意义。

分类：

```text
classical_direct_topic_specific_self_participant_outward_action
```

注意：

```text
防非避讼
+
斗殴争竞
```

虽然是两个直接文本位置，但都属于：

```text
TRAD-ZSBY
```

不能当成两个独立 lineage 投票。

---

# 6. ZSBY 证据改变了上一轮什么

上一轮安全结论是：

```text
古典有 Coalition → Ying
但不确定 self-divination 中 Shi member 是否仍有 outward action
```

本轮必须改成：

```text
至少在本人参与的诉讼 / 争竞题中
moving Shi → external Ying
存在古典直接作用资格
```

但三合专项的具体问题仍不能完全自动解决。

因为：

```text
single moving Shi → Ying
```

与：

```text
Shi ∈ Coalition
→ whole Coalition → Ying
```

仍不是完全同一个命题。

因此对三合的修正应是：

```text
“世为最终受体，因此世局绝不能外作用”
不能作为 shared classical prohibition
```

而不是：

```text
“世单爻能克应”
→ 任意世局都能克应
```

---

# 7. Classical Direct C：《断易天机》“世动克应己谋人”

《断易天机》占来意体系保存：

```text
应来克世人谋己
世动克应己谋人
```

这一句比一般：

```text
世克应
```

更接近本研究对象。

因为它直接把：

```text
世动克应
```

解释为：

```text
己谋人
```

也就是：

```text
self-side actor
→ other-side target
```

的主动方向。

研究分类：

```text
source witness = SRC-DYTJ
classification = classical_direct_broad_self_to_other_action_formula
```

但是 provenance 必须谨慎。

该公式还能在其他古代汇编 / 传本中见到相同或高度相近文字。

因此本研究只登记：

```text
DYTJ witness confirms formula
```

不因为别书重复收录就增加独立票数。

这符合：

```text
source-registry-provenance-normalization-v0.1
```

中的：

```text
shared_or_inherited_formula_requires_evidence_scope_review
```

---

# 8. 《断易天机·词讼》证明“静态关系”与“动态实现”不同

《断易天机》词讼材料还有一个非常关键的结构：

```text
世静而克应
+
应发动
→ 对方有通变
→ 终于不受克
```

这说明传统判断并不是：

```text
只要 elemental relation = controls
→ effect automatically realizes
```

而是：

```text
relation topology
+
activity asymmetry
→ modifies realization
```

这与此前：

```text
Directed Interaction Effectiveness
```

研究完全兼容。

同时进一步支持本轮：

```text
movement
```

应作为：

```text
action qualification / path condition
```

而不是：

```text
+1 strength
```

分类：

```text
classical_direct_activity_sensitive_interaction_realization
```

---

# 9. Proxy / Person-Return：古典对 Shi outward relation 更明确

《断易天机·行人》直接使用：

```text
应动克世即来
世动克应未来
```

以及：

```text
世克动应
→ 行人往他处
```

这里的题义不是纯粹“占者本人最后承受事情”的结构。

通常是：

```text
占者 / 家乡 / 等待方
↔
行人 / 外方
```

因此它说明：

```text
在 person-return / proxy-like representation 中
世的发动与对外关系
可以直接进入传统判断
```

分类：

```text
classical_direct_proxy_or_nonself_outward_relation
```

这类证据与 ZCB 的：

```text
代占 / 与自己无关
→ 世可恢复普通连动资格
```

是结构兼容的。

但二者不能互相证明具体算法。

---

# 10. Independent Classical Support：《易隐·行人》

《易隐》独立保存多条：

```text
世动克应克用
```

以及：

```text
动世克动应
```

并用于判断行人不至或往他乡。

来源：

```text
SRC-YY
independenceGroup = TRAD-YY
```

这给出《断易天机》之外的独立旁证：

```text
proxy / person-return context
+
moving Shi
+
external target
→ directional relation is traditionally actionable
```

因此：

```text
proxy_nonself_outward_action
```

相较“所有自占题”具有更强跨来源支持。

---

# 11. 《易隐·妻妾》：本人参与题中的 Shi movement 可产生外部现实语义

《易隐》妻妾章节明确区分：

```text
自占
```

并以应爻代表妻方。

同时有：

```text
世动 → 夫凌妻
应动 → 妻欺夫
世应俱动 → 常争斗
```

这不是一个标准的：

```text
moving Shi controls Ying
```

五行 directed-edge 公式。

因此不能过读成：

```text
YY explicitly proves Shi active control edge
```

但它至少直接证明：

```text
self-participant context
+
Shi moving
```

可以被解释为：

```text
self-side behavior toward counterpart
```

而不是只能解释成：

```text
世自身内部变化
```

分类：

```text
classical_direct_self_participant_movement_external_semantics
```

它与 ZSBY 诉讼线形成跨 lineage 的结构兼容：

```text
self participant Shi movement
can have outward interpersonal semantics
```

但不能因此建立一个跨题 universal elemental-action rule。

---

# 12. 《火珠林》的支持边界

《火珠林》大量使用：

```text
世 = 我
应 = 彼
世克应 / 应克世
```

并在博戏、买卖、出行等题中同时重视：

```text
世应关系
+
发动状态
```

例如出行有：

```text
世应俱动
```

作为行期信号。

这些材料可以独立支持：

```text
TRAD-HZL
→ role relation + activity are both genuine traditional dimensions
```

但本轮没有从《火珠林》提取到与：

```text
世动克应，我兴词
```

同等直接、完全同构的 self-participant outward-action 句。

因此 HZL 当前分类：

```text
independent_structural_support
not decisive direct proof for universal Shi action policy
```

---

# 13. Classical Evidence Ladder

本轮按直接性分层：

## A · direct action formula

```text
ZSBY litigation:
世动克应 → 我兴词

ZSBY contest:
世宜旺动克应

DYTJ broad intent:
世动克应 → 己谋人

DYTJ person-return:
世动克应 → 行人未来

YY person-return:
动世克动应 / 世动克应克用 → 行人路径或归期判断
```

## B · movement with outward participant semantics

```text
YY marriage:
世动 → 夫凌妻
```

## C · role relation + activity background

```text
HZL
世应关系 + 动静
```

这三个层级不能混成：

```text
所有来源都证明同一个 universal graph rule
```

---

# 14. 最大修正：Classical Universal Prohibition 现在不可成立

如果未来某设计写：

```text
IF perspective = self_affair
AND line = Shi
THEN actionEligibility = false
```

它会直接撞上：

```text
ZSBY litigation
```

因为该传统题义明确要求：

```text
世动克应
```

来表示我方主动行动。

所以 shared classical layer 必须拒绝：

```text
global self-Shi sink rule
```

这不是说 ZCB 的规则“错”。

而是说：

```text
ZCB self-goodbad sink rule
```

是其现代体系中一个明确、可复现、但不能提升为 shared classical universal law 的 policy。

---

# 15. 反方向同样禁止：Classical Universal Permission 也不存在

有了上述古典证据，也不能写：

```text
moving Shi
→ always acts on all other relevant lines
```

原因：

1. 多数传统句具有明确 topic scope；
2. 世应在不同题义下 representation 不同；
3. movement 不是 omnidirectional graph qualification；
4. static relation 与 effective action 已被传统材料区分；
5. transformed line topology 仍有局部性；
6. 三合 coalition membership 另有 group-level gate；
7. 现代 ZCB 的大量自占案例说明至少一个成熟体系明确采用更窄 policy。

所以：

```text
universal permission
```

和：

```text
universal prohibition
```

都被拒绝。

---

# 16. MOD-ZCB：必须精确限定为“自占自事 + 吉凶判断层”

《古筮真诠·复合之动》对自身事项明确规定：

```text
在吉凶判断层
moving Shi
不参与复合 / 连动
不向其他爻包括用神传播
只趋向自己的变爻
```

来源：

```text
SRC-ZCB-GSZZ
independenceGroup = MOD-ZCB
location = 第十七章 复合之动的原则
```

关键是：

```text
analysis layer = 吉凶判断
```

不能删掉。

因此错误转述包括：

```text
朱辰彬认为世爻永远不能作用别爻
```

或：

```text
只要是世爻，所有层面都只能是 sink
```

都不准确。

---

# 17. MOD-ZCB：细节分析层明确解除该禁令

《古筮真诠》同一体系明确说明：

```text
到了细节分析层面
上述原则不再发生效力
世爻之动可以作用旁爻
```

书中用：

```text
世爻动生用神
```

解释占者主动赶考的现实行为。

这条证据非常关键。

因为它直接证明：

```text
ZCB Action Eligibility
```

不是：

```text
line-position property
```

而是：

```text
analysis-layer-sensitive policy
```

正式分类：

```text
MOD-ZCB
self_affair + goodbad_layer → Shi outward denied
self_affair + detail_layer → Shi outward may be admitted
```

---

# 18. MOD-ZCB：代占 / 与自身无关时恢复普通连动资格

朱辰彬在同章进一步明确：

```text
代占
或
所问事情与自身全无关系
```

时，占者自身不再是事件祸福的最终承受者。

于是：

```text
世爻不再是全卦最终目标
→ 可以参与其他爻连动
```

并举代妻子面试案例说明。

因此：

```text
ZCB policy
```

至少同时依赖：

```text
Perspective / Represented Role
+
Analysis Layer
```

而不是：

```text
Shi position only
```

这与本轮古典研究方向有一个重要兼容点：

```text
Action Eligibility is contextual
```

但具体禁许边界仍属于现代作者体系。

---

# 19. MOD-WHY：更宽的 outward relation policy 继续保留为作者体系证据

上一轮已核实王虎应《增删卜易评释》的直接案例：

```text
官鬼午火持世
+
三合官局
→ 官局生应
```

并据此判断升迁未成。

这说明在 WHY 体系中：

```text
Shi-containing coalition
```

至少在某些自占题中仍可向外部应爻承担有效判断关系。

来源分组：

```text
MOD-WHY
```

因此 WHY / ZCB 仍然存在真实 policy difference。

但本轮新增的古典证据改变了冲突描述：

以前：

```text
classical unresolved
WHY yes
ZCB no
```

现在更准确的是：

```text
classical topic-specific yes exists
classical universal policy absent
WHY broad yes policy exists
ZCB self-goodbad narrow no policy exists
```

---

# 20. WHY vs ZCB 现在不能再表述成“谁更符合古法”

古典材料本身并没有给出一个：

```text
所有题统一适用的 Action Eligibility algebra
```

反而表现为：

```text
诉讼有诉讼的世应发动公式
行人有行人的世应发动公式
婚姻有婚姻的世应动态语义
```

所以不能简单裁决：

```text
WHY = 古法
ZCB = 非古法
```

也不能反过来：

```text
ZCB = 真古法
WHY = 错
```

更准确的研究分层是：

```text
Shared Classical Minimum
→ topic-specific explicit action relations

MOD-WHY
→ broader interaction policy / modern synthesis

MOD-ZCB
→ analysis-layer + perspective-sensitive modern synthesis
```

这些层必须并存。

---

# 21. Action Eligibility 至少需要五个决策维度

本轮现在可以确定，未来若研究 resolver，不能少于：

```text
1. Analysis Layer
2. Divination Perspective
3. Represented Role
4. Topic-Specific Traditional Direction Rule
5. Activity / Path Condition
```

## 21.1 Analysis Layer

至少区分：

```text
good_bad

timing

detail
```

ZCB 已直接证明：

```text
同一个 moving Shi
在 good_bad 与 detail 层
action eligibility 可以不同
```

## 21.2 Divination Perspective

至少区分：

```text
self_affair
self_participant_interaction
proxy_or_other_person
nonself_matter
```

不能只做：

```text
self / proxy
```

二分。

## 21.3 Represented Role

例如：

```text
Shi = final self target
Shi = self-side litigant
Shi = husband
Shi = home / waiting side
Shi role overridden by group representation
```

这些职责不同。

## 21.4 Topic-Specific Traditional Direction Rule

例如：

```text
litigation:
世动克应 → explicit self-side active formula

person-return:
世动克应 / 动世克动应 → explicit return-path formula

other domains:
must be separately proven
```

## 21.5 Activity / Path Condition

即使 direction formula exists，也仍需审：

```text
moving / static
source condition
target condition
binding
tomb
third-party action
transform feedback
```

---

# 22. 不应建立 “Self = Sink / Proxy = Source” 二分器

一个看似方便的现代设计可能是：

```text
if self_affair:
    Shi = sink
else:
    Shi = ordinary source
```

本轮否定它。

因为：

```text
self-participant litigation
```

已经出现：

```text
moving Shi → Ying
```

而：

```text
proxy
```

也并不意味着所有世爻关系都自动有资格。

仍需具体题义与 representation。

所以：

```text
perspective
```

只是一个 gate dimension，不是最终答案。

---

# 23. 自占自事 与 本人参与事项 必须正式拆开

本轮建议在研究层固定这一区别。

### Self-Affair / Self-Outcome

现实问题的最终祸福主要落在占者本人：

```text
考试
求职
疾病
个人升迁
个人寻物
```

此类现代 ZCB good/bad sink policy 有明确适用对象。

### Self-Participant Interaction

占者是关系中的一方 actor：

```text
争讼
争竞
交易
婚姻双方关系
谈判
```

传统材料更常出现：

```text
世 ↔ 应
```

的相互方向。

因此未来 research / resolver 都不能把二者共用一个：

```text
SELF
```

标签后直接结束判断。

---

# 24. Relation Direction 与 Initiative Direction 也需要分开

例如：

```text
世克应
```

可能表示：

```text
role relation
```

而：

```text
世动克应，我兴词
```

多了：

```text
initiative / active direction
```

所以未来至少可研究：

```text
ROLE_RELATION
ACTIVE_INITIATIVE_RELATION
```

两类事实。

但本轮不授权机器枚举。

---

# 25. Activity 不是单纯“有无动作”的布尔量

《断易天机》词讼：

```text
世静克应
+
应发动
→ 应方可有通变而不受克
```

说明：

```text
source static
+
target moving
```

会改变 relation realization。

而《增删卜易》又要求：

```text
世宜旺动克应
```

所以 Activity 至少可能承担：

```text
source initiative
target evasion / response
interaction ordering
```

不能仅作为：

```text
moving=true
```

后就把全图边全部打开。

---

# 26. 对 Directed Interaction Effectiveness 的修正

此前共享模型：

```text
Topology
+
Source Actionability
+
Target Condition
+
Path State
+
Temporal State
```

仍然成立。

本轮只是把一个更上游 gate 补清：

```text
Role-Semantic Topology
↓
Action Eligibility
↓
Directed Interaction Effectiveness
```

即：

```text
relation exists
```

和：

```text
source is eligible to act toward this target in this analytical responsibility
```

必须分开。

---

# 27. 对三合 Coalition 的反向约束

本轮不能直接替三合写出：

```text
Shi-containing coalition → Ying = allowed
```

但可以明确禁止一个旧 shortcut：

```text
contains Shi
+
self-divination
→ coalition outward forbidden
```

这个 shortcut 已经失去 shared classical 基础。

未来三合 Directionality 必须询问：

```text
1. coalition represented role
2. target represented role
3. topic-specific group relation
4. Shi membership 是否改变 action policy
5. 当前 analysis layer
6. school-specific policy if shared classical unresolved
```

---

# 28. 对 Representation Resolver 的进一步要求

上一轮已经证明：

```text
contains Shi → self
```

不成立。

本轮又证明：

```text
Shi represents self
→ action forbidden
```

也不成立。

因为“self”至少可能是：

```text
final beneficiary / sufferer
self-side actor
litigant
husband
home-side observer
```

所以 future represented-role layer 不能只输出：

```text
SELF
```

然后交给 action engine。

研究上需要更细的 role responsibility。

---

# 29. Provenance Audit

本轮传统主要 evidence lineage：

```text
TRAD-ZSBY
TRAD-DYTJ
TRAD-YY
TRAD-HZL
```

其中：

### ZSBY

诉讼与争竞章属于同一来源不同文本位置：

```text
multiple direct witnesses
not multiple independent lineages
```

### DYTJ

部分占来意 / 天玄赋类公式可见于其他古代汇编与《卜筮全书》相关传本。

因此：

```text
same formula repeated elsewhere
```

不得机械增加独立票。

### YY

当前作为独立：

```text
TRAD-YY
```

提供行人及夫妻互动的旁证。

### HZL

当前作为独立：

```text
TRAD-HZL
```

提供世应角色与动静结构背景。

现代：

```text
MOD-WHY
MOD-ZCB
```

仍分别按作者体系计，不按著作数量累计。

---

# 30. Evidence Classification Matrix

| 命题 | 来源 | 直接性 | 当前分类 |
|---|---|---:|---|
| 本人诉讼中 `世动克应` 表示我主动兴词 | ZSBY | A | `classical_direct` |
| 争竞中要求 `世旺动克应` | ZSBY | A | `classical_direct` |
| `世动克应` 可表示己主动谋人 | DYTJ witness | A | `classical_direct_broad_formula` |
| 静世克动应时对方可通过发动避克 | DYTJ | A | `classical_direct_activity_sensitive` |
| 行人占 `世动克应` 进入归期 / 去向判断 | DYTJ | A | `classical_direct_proxy_like` |
| 行人占 moving Shi 对应 / 用产生方向判断 | YY | A | `classical_direct_proxy_like` |
| 自占夫妻 `世动` 具有对配偶的现实行为语义 | YY | B | `classical_direct_movement_semantics` |
| 世应角色生克 + activity 是传统结构 | HZL | B | `independent_structural_support` |
| 自身事吉凶层 moving Shi 不外动 | ZCB | A modern | `modern_school_specific` |
| 自身事细节层 moving Shi 可作用旁爻 | ZCB | A modern | `modern_school_specific` |
| 代占 / 非自身事项 Shi 可参与连动 | ZCB | A modern | `modern_school_specific` |
| 世所在官局可生应参与结果判断 | WHY | A modern | `modern_author_direct_case` |

---

# 31. Research Readiness Matrix

| 问题 | 状态 |
|---|---|
| Role-Semantic Relation 与 Dynamic Action 是否必须分层 | `supported` |
| 古典是否存在 moving Shi 向外部角色作用的直接公式 | `yes` |
| 本人参与事项中是否存在该公式 | `yes, litigation / contest direct` |
| 代占 / 行人类是否存在 Shi outward relation | `yes, cross-source compatible` |
| “自占世爻永远不得外动”能否做 shared rule | `no` |
| “所有 moving Shi 都可外动”能否做 shared rule | `no` |
| analysis layer 是否必须进入 action eligibility | `yes` |
| self-affair 与 self-participant 是否应拆分 | `yes` |
| proxy 是否自动放开所有世爻作用 | `no` |
| ZCB 吉凶层 sink policy 是否有明确作者证据 | `yes` |
| ZCB 细节层是否解除 | `yes` |
| ZCB 代占是否解除 | `yes` |
| WHY 是否存在更宽 policy 的直接案例 | `yes` |
| 古典是否已经给出跨主题统一 Action Eligibility Resolver | `no` |
| 可以进入 Formal Expansion 吗 | `no` |

---

# 32. Explicit Non-Inferences

本轮明确禁止以下推断：

```text
世动克应，我兴词
→ 所有自占 moving Shi 都可作用任何爻

世宜旺动克应
→ moving Shi 自动比其他爻更强

本人参与诉讼世可外动
→ 个人考试 / 求职 / 疾病的世也必外动

行人占世动克应
→ 所有 proxy 卦都可建立 Shi → target

ZCB 自占吉凶层不外动
→ ZCB 认为世爻任何层面都不外动

ZCB 细节层可外动
→ 吉凶层也可外动

ZCB 代占可连动
→ 代占世爻总是 active source

WHY 世局生应案例
→ 古典已经证明任意 Shi-coalition outbound

古典有 topic-specific outward action
→ WHY 与 ZCB 分歧已经消失

self-affair
→ Shi = sink

self-participant
→ Shi = source

proxy
→ Shi = ordinary source

moving
→ all outgoing elemental edges active

role relation
→ active interaction

active interaction
→ effective interaction

effective interaction
→ favorable outcome
```

---

# 33. Shared Classical Minimum v0.1

本轮可建立的 shared research minimum 不是一个算法，而是一组约束：

```text
1. 世 / 应 / 用的 role relation 是传统真实层。

2. 动静可以改变 relation 的现实解释与实现。

3. moving Shi 在部分本人参与题中明确具有向外主动语义。

4. moving Shi 在 person-return / proxy-like 题中明确参与外部方向判断。

5. 因此 self perspective 不能成为 universal deny gate。

6. 但没有证据支持 universal allow gate。

7. Action Eligibility 必须服从题义、角色、分析层与 activity/path 条件。
```

这已经足以指导后续研究，但不足以进入 runtime。

---

# 34. Modern Policy Separation

未来如果必须保存现代作者体系，最安全的研究表示是：

```text
Shared Classical Minimum
│
├─ Topic-specific explicit direction rules
│
├─ Role representation
│
└─ Activity-sensitive realization

MOD-WHY Policy
│
└─ broader interaction / coalition outward use

MOD-ZCB Policy
│
├─ self-affair good/bad: Shi as final target
├─ self-affair detail: Shi can act outward
└─ proxy/nonself: Shi can participate in linked action
```

禁止：

```text
merge all into one boolean
```

也禁止：

```text
choose one modern author and rewrite shared classical layer around him
```

---

# 35. Final Decision

```text
Shi-Line Action Eligibility
= genuine traditional-research problem

self-divination / self involvement
= not sufficient to deny outward action

moving Shi outward action
= directly supported in explicit classical topic rules

strongest self-participant classical example
= litigation / contest

proxy / person-return outward relation
= cross-source compatible

Role-Semantic Relation
≠ Dynamic Action Edge
= retained

movement
= action / realization dimension
≠ strength score

self-affair
≠ self-participant interaction

analysis layer
= mandatory dimension

ZCB self-goodbad sink rule
= explicit modern school-specific policy
≠ shared classical law

ZCB detail-layer exception
= explicit

ZCB proxy/nonself exception
= explicit

WHY broader policy
= modern author-supported

universal allow rule
= not supported

universal deny rule
= rejected as shared rule

single shiCanAct boolean
= rejected

universal Action Eligibility Resolver
= not ready

Formal Expansion
= not authorized
```

---

# 36. Recommended Next Research

现在真正的瓶颈已经从：

```text
“世在自占里到底能不能动别人？”
```

变成：

```text
哪些传统 Topic
明确赋予世 / 应主动方向，
哪些只使用 role relation，
哪些把世当最终承受者？
```

建议下一步建立：

```text
Self-Participant Topic Direction Matrix Review v0.1
```

优先横向审：

```text
1. litigation / contest
2. trade / business / transaction
3. marriage / relationship
4. travel / journey
5. career / position
6. study / exam
7. lost property / recovery
8. person-return / contact
```

只回答：

1. 该 topic 中世、应分别承担什么 representation；
2. 是否存在显式 `世动 → 对方 / 用神` 传统句；
3. 是否只有静态 `世克应 / 应克世` role relation；
4. movement 在该 topic 中表示 initiative、timing、state-change 还是别的职责；
5. 是否存在 self-affair / self-participant 的结构差异；
6. 哪些命题能进入 shared classical minimum；
7. 哪些必须保留 `topic_specific`；
8. 哪些仍需 `school_specific`。

在该矩阵完成以前：

```text
Shi Action Eligibility
```

不得 formalize 为通用 runtime gate。