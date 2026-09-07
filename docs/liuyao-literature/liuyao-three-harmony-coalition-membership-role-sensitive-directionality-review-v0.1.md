# 龟甲 · 六爻 Three-Harmony Coalition Membership & Role-Sensitive Directionality Review v0.1

日期：2026-09-08

状态：`research_complete_design_only_membership_first_class_role_semantics_separate_from_action_eligibility_modern_school_conflict`

范围：六爻共享研究层 / 三合 coalition membership、世应与用神角色、题义代表关系、group-level role assignment、role-semantic direction、dynamic action eligibility，以及王虎应 / 朱辰彬现代体系对“世局是否向外作用”的横向检验。

上游：

- `liuyao-three-harmony-coalition-effectiveness-group-actor-target-review-v0.1.md`
- `liuyao-three-harmony-temporal-manifestation-calendar-role-review-v0.1.md`
- `liuyao-three-harmony-edition-witness-formation-canonicalization-review-v0.1.md`
- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `liuyao-directed-interaction-path-control-transformation-review-v0.1.md`
- `liuyao-interaction-precedence-multi-moving-adjudication-review-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`

> 本研究只回答：一个已经合法 formation 且当前 manifest 的三合 coalition，在什么条件下可以被赋予“我 / 他 / 用神 / 某一方群体”等题义角色；成员身份与外部定向关系是否必须分开；传统文本中的“世克用 / 局生世 / 局生应”等 role-semantic relation，是否等同于现代复合动理论中的 dynamic action edge；以及自占与代占中 moving 世 / 世局的 outward action 是否存在共享传统结论。v0.1 不建立 executable direction resolver，不修改 Time v2、Rule Registry、current-22、训练数据或 Candidate 开发线。

---

# 1. Executive Decision

本轮最大的结论是：

```text
Role-Semantic Relation
≠
Dynamic Action Edge
```

这是处理此前“世局是否能向外生克”冲突时必须增加的一层。

传统六爻文本可以直接使用：

```text
世克用
用克世
局生世
局克世
局生应
外局克内局
```

来表达题义中的关系。

但这些传统判断句不能自动全部翻译为：

```text
source actor is dynamically eligible
→ emit an active interaction edge
→ run multi-moving path propagation
```

尤其：

```text
世克用
```

在《增删卜易·行人章》中本身可以承担“行人是否有归志”的角色语义，未要求先证明世爻是一个 active moving source。

因此未来 shared reasoning 至少必须区分：

```text
A. Line / Group Membership
B. Represented Role
C. Role-Semantic Direction
D. Dynamic Action Eligibility
E. Directed Interaction Effectiveness
```

并且本轮又确认：

```text
line-level 世 / 应身份
```

并不永远拥有最高角色优先级。

《增删卜易》两村争水例中：

```text
世爻在外卦金局
应爻在内卦木局
```

但作者仍按题义明确：

```text
内局 = 我村
外局 = 他村
```

并明说在该结构下：

```text
舍世应而不用
```

所以禁止：

```text
coalition contains 世
→ coalition = self
```

也禁止：

```text
coalition contains 应
→ coalition = other
```

题义中的 coalition-level role assignment 可以在特定结构中覆盖默认 line-level 世应表示。

最终总体分类：

```text
membership_relation = first_class_traditional_relation
represented_role_resolution = required
role_semantic_direction = traditionally_supported
dynamic_action_eligibility = separate_responsibility
contains_shi_implies_self = rejected
contains_ying_implies_other = rejected
shi_coalition_outward_action_in_self_divination = classical_unresolved
modern_WH Y_vs_ZCB_directionality = conflicted
proxy_divination_scope_difference = supported_in_ZCB
shared_classical_direction_kernel = conservative_explicit_relations_only
universal_direction_resolver = not_ready
Formal Expansion = not_authorized
```

说明：上面的 `modern_WH Y_vs_ZCB_directionality` 仅表示 `MOD-WHY` 与 `MOD-ZCB` 的作者体系冲突，不是机器字段命名建议。

---

# 2. 五个必须拆开的概念

本轮若不先拆概念，几乎所有现代规则都会发生偷换。

## 2.1 Membership

表示：

```text
某个 line / 用神 / 世 / 应
属于这个 coalition 的 constituent set
```

例如：

```text
用神 ∈ 三合局
世 ∈ 三合局
应 ∈ 三合局
```

这是结构事实。

## 2.2 Represented Role

表示：

```text
这个 line / coalition 在当前占题中代表谁 / 什么
```

例如：

```text
世 → 求测者本人
应 → 对方
内局 → 我村
外局 → 他村
官局 → 功名 / 官位相关 actor
财局 → 财相关 actor
```

它是题义 / 传统取象层。

## 2.3 Role-Semantic Direction

表示：

```text
传统文本用五行生克关系表达角色之间的现实倾向
```

例如：

```text
世克用 → 行人无归志
用克世 → 行人归
财局生世 → 财利我
财局生应 → 财利他
```

这是一种：

```text
semantic relation used in judgment
```

## 2.4 Dynamic Action Eligibility

表示：

```text
某个 moving line / coalition
是否有资格把自己的动作向某个 target 传播
```

这是现代复合动 / 连动体系中非常明确的一层。

例如朱辰彬讨论：

```text
自占自事 moving 世
是否可参与复合 / 连动
```

这与：

```text
世与用存在五行生克关系
```

不是同一个问题。

## 2.5 Directed Interaction Effectiveness

只有在：

```text
Dynamic Action Eligibility = admitted
```

以后，才进入此前已完成的：

```text
source condition
+
target condition
+
path state
+
temporal state
↓
Directed Interaction Effectiveness
```

因此禁止：

```text
五行上 A 克 B
→ A has dynamic action edge to B
```

也禁止：

```text
traditional text interprets A克B
→ runtime graph must emit A->B active edge
```

---

# 3. Classical Direct A：世在局，与局生世是两个不同判断入口

《增删卜易》三合章明确区分：

```text
世爻在局
```

和：

```text
世爻不在局
→ 再审局生世 / 局克世
```

这段结构至少说明：

```text
membership
```

与：

```text
external coalition → 世 relation
```

在传统判断中不是同一个关系。

安全抽取：

```text
IF 世 ∈ coalition
THEN membership relation is directly relevant

IF 世 ∉ coalition
THEN coalition → 世 external elemental relation may become relevant
```

但不能进一步过读为：

```text
世只要在局中
→ coalition 永远不能对外作用
```

原文没有给出这个 universal prohibition。

同样不能过读为：

```text
世在局
→ coalition 必然代表我方
```

因为两村案例会直接否定这一点。

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 三合 / 六合相关章
classification = classical_direct_membership_vs_external_relation
```

---

# 4. Classical Direct B：用神在局也是 Membership，不是 coalition → 用神

《增删卜易》对出行 / 行人明确使用：

```text
用神在三合内
```

并解释为：

```text
被合而留
被合不回
```

这里的推理不是：

```text
coalition generates / controls 用神
```

而是：

```text
用神是 coalition 成员
→ membership 本身产生该 domain 中的留 / 聚 / 被合语义
```

所以未来必须保留：

```text
Membership Relation:
UseGod ∈ Coalition
```

不能错误归一成：

```text
External Directed Relation:
Coalition → UseGod
```

尤其不能因为 coalition 五行与某一 constituent 五行有某种抽象关系，就人为制造：

```text
peer / support / control
```

给“局对成员自身”。

分类：

```text
classical_direct_usegod_membership_semantics
```

限制：

```text
membership semantic is domain-specific
```

例如：

```text
行人 → 留 / 不归
```

不能自动推广为：

```text
求财 / 功名 / 诉讼中的用神在局
→ 一律“被困”
```

---

# 5. Classical Direct C：Role-Semantic Relation 并不要求 moving action

《增删卜易·行人章》明确使用：

```text
世克用
用克世
```

判断行人是否有归志。

这里的重要研究意义不在行人规则本身，而在于：

```text
世 ↔ 用的五行生克
```

可以作为：

```text
role-semantic relation
```

参与传统断意。

文本并没有把该命题限定为：

```text
世必须发动
```

或：

```text
只有 moving 世才产生“世克用”
```

因此：

```text
role-semantic relation
```

与现代复合动体系中的：

```text
dynamic action edge
```

必须分开。

这也是处理 WHY / ZCB 分歧的关键。

朱辰彬说：

```text
自占自事 moving 世不向别的爻运动
```

并不等于：

```text
世与用之间不再存在五行角色关系
```

所以不能把现代作者的“动作方向”规则反向用来删除所有传统世用生克语义。

来源：

```text
SRC-ZSBY
location = 行人章
classification = classical_direct_role_semantic_relation
```

---

# 6. 独立传统旁证：《火珠林》同样使用世、应、用的 Role-Semantic Relation

《火珠林》保存大量：

```text
世我应彼
世应相生
世克应
世克用爻
应克世
用爻克世
```

等题义关系。

例如谒贵 / 买卖等章节会把：

```text
世
应
用
```

先赋予现实角色，再依据相生相克解释双方关系。

来源：

```text
SRC-HZL
independenceGroup = TRAD-HZL
```

这可以作为《增删卜易》之外的独立结构旁证：

```text
role-resolved elemental relation
```

是传统六爻的真实判断层。

但《火珠林》并没有提供本轮所需的完整：

```text
Three-Harmony Coalition Action Eligibility
```

所以它只能支持：

```text
Role-Semantic Direction layer exists
```

不能拿来证明：

```text
世局一定向外作用
```

或：

```text
世局一定不向外作用
```

分类：

```text
cross_lineage_structural_support_for_role_semantics
```

---

# 7. 最关键 Classical Case：两村争水证明 coalition-level role 可以覆盖 line-level 世应

《增删卜易》两村争水例：

```text
上下两村争田水
得离之坤
```

卦中：

```text
世爻在外卦
应爻在内卦
```

并且具体 formation 中：

```text
内卦形成亥卯未木局
外卦形成巳酉丑金局
```

作者却明确按题义指定：

```text
内卦 = 我村
外卦 = 人村 / 他村
```

然后判断：

```text
外金局 → 克 → 内木局
```

并进一步用：

```text
衰金不克旺木
```

限制这一 group-to-group relation。

最重要的是，文本还主动回答：

```text
为什么不按世应？
```

结论是：

```text
此处两村分别由内外两局整体代表
→ 舍世应而不用
```

这是本轮最强的传统角色证据。

它证明：

```text
line role assignment
```

并不拥有绝对最高优先级。

在某些题义 / 群体结构中：

```text
coalition-level represented role
```

可以 supersede：

```text
世 / 应 line-level default role
```

因此以下规则被直接否定：

```text
contains 世 → self side
contains 应 → other side
```

更准确的研究结构是：

```text
Question Semantics / Traditional Topic Structure
↓
Representation Scheme
├─ line-level 世 / 应
├─ 用神 role
└─ coalition-level role
↓
resolve which representation is active in this question
```

而不是先锁死世应，再把 coalition 塞进去。

分类：

```text
classical_direct_role_representation_override
```

---

# 8. “世在局为美”不能被解释成 contains-shi = self coalition

三合章一般句说：

```text
世在局
```

在很多名利婚姻家宅风水等占题中是重要条件。

这容易诱导一个现代 shortcut：

```text
if coalition.members.includes(shi):
    coalition.role = SELF
```

两村案例证明这条不能成立。

因为同一本《增删卜易》已经出现：

```text
世在外局
但外局 = 他村
```

所以：

```text
世在局
```

只能先解释为：

```text
shi-membership fact
```

其现实角色意义还必须服从：

```text
current topic representation scheme
```

不能直接变成：

```text
self-coalition identity
```

---

# 9. 应在局同样不能自动推出 coalition = other

由于：

```text
世在局 → self
```

已经被传统案例否定，那么对称的：

```text
应在局 → other
```

也没有理由作为共享规则成立。

两村争水例甚至形成近似反例：

```text
应位 line 位于内卦 coalition
但内局 = 我村
```

因此：

```text
YingMembership
```

只是：

```text
应 line 属于 coalition
```

并不自动决定 coalition represented role。

当前 shared classical 状态：

```text
应在局的 generic domain meaning
= insufficient evidence
```

不能为了对称性自行补出：

```text
应在局 = 利他 / 属他
```

---

# 10. 局生应是 External Role Relation，不等于应在局

《增删卜易》功名 / 财占明确使用：

```text
官局生世 → 利我
官局生应 → 利他

财局生世 → 利我
财局生应 → 利他
```

这里的结构是：

```text
Coalition
→ external 世 / 应 target
```

而不是：

```text
世 / 应 member of Coalition
```

所以必须严格区分：

```text
Ying ∈ Coalition
```

与：

```text
Coalition → Ying
```

同理：

```text
Shi ∈ Coalition
```

与：

```text
Coalition → Shi
```

也不能混为一谈。

这是未来任何 direction resolver 的第一道 contract gate。

---

# 11. “用神局 → 世”与“用神在局”也不是同一个命题

还有一个容易混淆的层次：

```text
Coalition 的六亲 / 题义 identity = 用神类
```

与：

```text
具体某一个用神 line ∈ Coalition
```

不是同一件事。

例如功名中：

```text
官局生世
```

可以解释为：

```text
用神类 group actor → 世
```

但不能推出：

```text
只要某一官鬼用神 line 在 coalition 内
→ 该 coalition 必然继承“用神 actor”角色
```

因为 coalition 的整体五行 / 六亲属性、题义 representation、成员构成仍需另外裁定。

因此未来研究必须保留：

```text
coalition_role_identity
```

与：

```text
member_role_identity
```

两个职责。

当前 shared classical 可安全确认：

```text
明确被传统识别为官局 / 财局等的 coalition
可以在相应题义中与世 / 应发生 role-semantic relation
```

不能安全确认：

```text
任何包含用神的 coalition
都等于“用神局”
```

---

# 12. Direction Matrix v0.1

本轮按关系类型整理如下。

| 关系 | 传统证据 | 当前状态 |
|---|---|---|
| `世 ∈ Coalition` | 《增删卜易》直接 | membership admitted；generic represented role 不固定 |
| `用神 ∈ Coalition` | 《增删卜易》直接 | membership admitted；domain semantics required |
| `应 ∈ Coalition` | 可由具体卦事实出现 | membership fact admitted；generic meaning unresolved |
| `Coalition → 世` | 三合章直接 | role-resolved external relation admitted when 世 outside / text explicitly applies |
| `Coalition → 应` | 功名 / 财占直接 | role-resolved external relation admitted in explicit topic contexts |
| `世局 → 应` | shared classical 未直接解决“世为成员时”的 action eligibility | unresolved at shared dynamic layer |
| `世局 → 用神` | shared classical 无 universal direct rule | unresolved |
| `用神类 Coalition → 世` | 官局 / 财局等直接 | explicit role-semantic relation admitted |
| `用神 member Coalition → 世` | member identity alone不足 | unresolved without coalition-role adjudication |
| `内局 → 外局` / `外局 → 内局` | 两村 / 家宅结构直接 | topic-resolved group relation admitted |
| `contains 世 → self` | 两村案例反证 | rejected |
| `contains 应 → other` | 两村案例反证 / 无独立支持 | rejected |

注意：

```text
admitted role-semantic relation
```

仍不等于：

```text
admitted dynamic graph edge
```

---

# 13. 世克用 / 用克世：Shared Classical Kernel 应怎样保存

如果未来只允许一种 relation 类型，很容易出现两个错误方向。

## 错误 A：全部当动态作用

```text
世克用
→ Shi dynamically controls UseGod
```

这样会与 ZCB 自占世不外动理论正面冲突，而且会把行人章这种 role-semantic formula 强行改成 multi-moving calculus。

## 错误 B：全部降成静态标签

```text
世克用
→ only descriptive metadata
```

这样又会丢掉传统文本实际用它判断现实趋势的能力。

更安全的研究表示是：

```text
ROLE_RELATION:
shi controls usegod

meaning:
domain adapter interprets this relation
```

只有当另有：

```text
ACTION_ELIGIBILITY
```

证据时，才进一步升级：

```text
ACTIVE_DIRECTED_INTERACTION
```

这让传统 role semantics 与现代 dynamic calculus 都能保留，而不互相吞并。

---

# 14. Modern WHY：世对用神关系属于广义判断核心

王虎应《六爻预测自修宝典》明确把：

```text
世爻
```

作为预测中心之一，并强调：

```text
预测需要看世与用神的作用关系
```

其动静生克体系还明确认为：

```text
动爻通常可以作用静爻
```

并围绕用神审日月、动爻及其他爻的作用。

来源：

```text
SRC-WHY-ZX
independenceGroup = MOD-WHY
```

这套体系整体倾向于：

```text
broad interaction doctrine
```

没有建立 ZCB 那种：

```text
self-divination moving 世 = final target only
```

的 universal exclusion。

但仅凭《自修宝典》的一般“世用关系”表述，还不足以单独证明：

```text
任何世局都可向任何用神发 active edge
```

真正关键的是下一节的直接三合案例。

---

# 15. Modern WHY Direct Case：世为 coalition 成员，仍用“官局生应”判断

王虎应《增删卜易评释》给出一个官运案例：

```text
官鬼午火持世
+
三合官局
```

并明确以：

```text
三合官局生应
```

解释求升未成。

来源：

```text
MOD-WHY
witness = 王虎应《增删卜易评释》
```

这条现代案例的重要性是：

```text
世 line 是该 coalition 的成员
```

并没有阻止王虎应把：

```text
whole coalition → 应
```

作为有效判断关系。

因此在 WHY 体系中，至少存在：

```text
Shi-containing coalition
→ external Ying
```

的实际案例。

当前分类：

```text
MOD-WHY direct case support for broad coalition outward relation
```

注意：

```text
one WHY case
```

不能倒写成：

```text
shared classical rule
```

---

# 16. Modern ZCB：自占自事中 moving 世被定义为最终目标

朱辰彬《古筮真诠》复合之动体系明确提出：

```text
凡占自身事情
在吉凶判断层面
世爻不参与复合与连动
```

其理由是：

```text
世 = 自身
= 事情祸福的最终承受者
```

所以在该体系中：

```text
moving 世
→ only moves toward own changed line
→ does not act toward other moving/static lines
→ does not act toward 用神
```

来源：

```text
SRC-ZCB-GSZZ
independenceGroup = MOD-ZCB
location = 复合之动的原则
```

这是一条非常明确的：

```text
Dynamic Action Eligibility Rule
```

而不是简单的：

```text
role-semantic relation rule
```

因此不能错误理解为：

```text
ZCB 否认世克用 / 用克世这种传统角色关系
```

他限制的是：

```text
moving 世的动态传播资格
```

---

# 17. Modern ZCB：代占 / 与自己无关时，世可恢复普通 action eligibility

朱辰彬同一理论还明确区分：

```text
自占自事
vs
代占 / 事情与自身无关
```

在代占或自身不再是最终祸福承受者时：

```text
世爻可参与其他爻的连动
```

这说明 ZCB 的规则本质是：

```text
represented-role-sensitive action eligibility
```

而不是：

```text
position-code-sensitive action eligibility
```

即：

```text
“世”这个位置本身
```

并不永远禁止 outward action。

决定因素是：

```text
当前占问中世是否代表最终 self target
```

这与两村争水的传统案例在方法论上高度相容：

```text
line-level 世位
≠ 永远固定为当前 semantic self actor
```

但两者仍不能互相证明具体规则。

分类：

```text
MOD-ZCB role-sensitive self/proxy distinction
```

---

# 18. WHY vs ZCB：真正冲突点不是“世用有没有关系”

如果把问题写成：

```text
世能不能克用？
```

会把三层问题混成一句。

真正的分歧是：

```text
在自占自事吉凶层
moving 世 / 世所在 coalition
是否具有 outward dynamic action eligibility？
```

### WHY evidence

```text
世为官鬼午火
+
世所在三合官局
→ 王虎应用“官局生应”判断
```

### ZCB rule

```text
自占自事
世是最终目标
→ 世不参与复合 / 连动
→ 世局不因世动获得对别爻的主动传播资格
```

因此当前不能标为：

```text
modern_consensus
```

也不能靠“一个说世用关系，一个说世不外动”假装没有冲突。

正式分类：

```text
MOD-WHY vs MOD-ZCB
= modern_school_conflict_or_scope_conflict
```

具体冲突命题：

```text
self-divination
+
Shi ∈ active Coalition
+
external Target exists
→ may coalition actively project outward?
```

答案：

```text
WHY: evidence for yes in at least some cases
ZCB: no under his self-divination dynamic rule
Shared classical: unresolved
```

---

# 19. 为什么传统“局生应”仍不能直接裁决 WHY / ZCB

有人可能会说：

```text
《增删卜易》本来就写“局生应”
→ WHY 对
```

但这不足以裁决。

因为古典一般句：

```text
官局 / 财局生应
```

并没有明确附带：

```text
世恰好是该局发动成员
+
自占自事
```

这一组现代争议条件。

所以传统原文只能证明：

```text
Coalition → Ying role relation exists
```

不能证明：

```text
Shi-containing coalition in self-divination
must have outward dynamic action eligibility
```

反过来，古典文本也没有直接说：

```text
只要世在局
→ coalition outward action forbidden
```

所以 shared classical 不能替两位现代作者选边。

---

# 20. 两村争水例进一步说明：现代冲突不能靠“contains 世”解决

两村例里：

```text
世在外金局
```

若机械采用：

```text
contains 世 → self
```

就会把外局错误认成我村。

而传统文本恰恰把：

```text
外局 = 他村
```

因此 future action eligibility 不能只看：

```text
containsShi
```

必须看：

```text
what role does Shi represent in this question?
```

甚至进一步：

```text
is line-level Shi representation superseded by a group representation scheme?
```

这与 ZCB 的：

```text
自占 self target
vs
代占 non-self target
```

在架构上形成一个非常有价值的共同方向：

```text
Action Eligibility depends on represented role,
not merely on line position label.
```

这是 research-level compatibility，不是说 ZCB 的规则因此获得古典直接证明。

---

# 21. Representation Precedence：当前只能建立 partial order

本轮不支持一个 universal：

```text
用神 > 世 > 应 > 内外卦 > coalition
```

或任何固定总排序。

传统材料支持的是局部 precedence。

## 21.1 一般单主体 / 双主体占

通常：

```text
世 / 应 / 用神
```

承担主要角色。

## 21.2 三合明确整体代表群体时

两村案例证明：

```text
coalition-level group representation
```

可以局部 supersede：

```text
line-level 世 / 应
```

## 21.3 用神作为 coalition 成员时

用神 membership 本身可成为 domain fact，但并不自动删除：

```text
用神原有六亲 / 角色 facts
```

## 21.4 当前最安全流程

```text
Question / Domain Semantics
↓
Candidate Role Representations
├─ 世
├─ 应
├─ 用神
├─ 内 / 外
└─ Coalition
↓
Traditional Topic-Specific Representation Rule
↓
Resolve Active Representation(s)
↓
Membership / Role Relation
↓
Dynamic Action Eligibility
```

这仍然是 research responsibility，不是 runtime resolver。

---

# 22. Self / Other 不能从爻位直接冻结

本轮对以后 Resolver 层有一个非常明确的约束：

禁止：

```text
Shi = SELF globally
Ying = OTHER globally
```

更准确的是：

```text
Shi
= default self-side role candidate in many self-divinations

Ying
= default counterpart / external-side role candidate in many topics
```

但：

```text
traditional topic structure
```

可以改写这套表示。

这不是为了现代 NLP 灵活性而提出，而是直接来自传统案例。

所以未来现代 semantic resolver 与传统 role resolver 对接时，不能把：

```text
self / other
```

在进入 traditional adjudication 之前永久写死。

---

# 23. Membership First-Class Fact 的最小分类

当前至少可以区分：

```text
SHI_MEMBER
YING_MEMBER
USEGOD_MEMBER
ROLE_TARGET_MEMBER
GROUP_REPRESENTATIVE_MEMBER
```

这里只是研究分类，不是代码枚举。

共同性质：

```text
membership is structural
membership is not directional
membership is not favorable/adverse by itself
```

随后才由 domain / role rule 解释。

例如：

```text
UseGod Member
+
行人
→ 被合而留
```

而：

```text
Shi Member
+
名利等一般三合判断
→ 传统文本常视为有利条件之一
```

但：

```text
Shi Member
+
两村群体代表
```

却不能直接把 coalition 认成 self side。

所以：

```text
same membership fact
```

可以在不同 topic rule 中承担不同 meaning。

---

# 24. Role-Semantic Direction 的最小分类

当前传统证据允许登记：

```text
Shi → UseGod elemental relation
UseGod → Shi elemental relation
Coalition → Shi elemental relation
Coalition → Ying elemental relation
InnerGroup → OuterGroup elemental relation
OuterGroup → InnerGroup elemental relation
```

但这些 relation 只能表示：

```text
traditional role-semantic topology
```

不能默认带：

```text
action=true
force=true
success=true
failure=true
```

其现实意义必须由：

```text
Domain Rule
+
Action Eligibility if relevant
+
Effectiveness if relevant
```

共同决定。

---

# 25. Dynamic Action Eligibility 的候选决策维度

本轮无法 formalize universal algorithm，但已经可以确定未来必须审：

```text
A. analysis layer
   吉凶 / 应期 / 细节

B. divination perspective
   自占自事 / 代占 / 与己无关

C. represented role of Shi
   final self target / ordinary actor / overridden role

D. coalition represented role
   self side / other side / topic object / neutral group

E. target represented role
   用神 / 应 / 世 / group / other

F. classical topic-specific direction evidence
```

尤其不能只根据：

```text
moving=true
+
containsShi=true
```

生成 action edge。

---

# 26. 世局 → 用神：当前 Shared Classical 状态

当前没有找到足够明确的共享古典文本说：

```text
自占自事
+
世参与三合局
+
用神在局外
→ 世局必然主动生克用神
```

同样也没有找到明确共享古典文本说：

```text
上述条件下绝对不得作用用神
```

因此：

```text
ShiCoalition -> UseGod dynamic edge
= classical_unresolved
```

现代：

```text
ZCB → self-divination 禁止
WHY → broader doctrine, but本轮未找到与“世局→用神”完全同构的直接三合案例
```

所以不能因为 WHY 的“世用关系”一般论就虚构一个完全对应证据。

当前：

```text
MOD-WHY = broad compatibility / indirect support
MOD-ZCB = direct negative rule in self-divination
```

仍为：

```text
not consensus
```

---

# 27. 世局 → 应：当前 Shared Classical 与 Modern 状态

### Classical

传统三合章有：

```text
官局 / 财局生应
```

所以：

```text
Coalition → Ying role relation
```

直接成立。

但古典文本没有明确解决：

```text
Shi is itself a member of this coalition
+
self-divination
```

这一额外 gate。

因此：

```text
Shi-containing Coalition → Ying dynamic edge
= classical unresolved
```

### WHY

王虎应官运案例：

```text
午火官鬼持世
+
三合官局
→ 官局生应
```

给出直接现代支持。

### ZCB

其 self-divination moving 世 action rule 与此发生冲突。

最终：

```text
role-semantic relation = classical direct
self-divination dynamic eligibility = modern conflicted
```

这两个状态必须同时保存。

---

# 28. 用神局 → 世：当前 Shared Classical 状态

《增删卜易》明确允许：

```text
官局生世
财局生世
```

作为相应题义的 favorable relation。

所以：

```text
UseGod-class Coalition → Shi
```

在明确题义与 coalition identity 已解决时，有直接传统支持。

但是要注意：

```text
用神-class coalition
```

不等于：

```text
coalition merely contains a UseGod line
```

因此 future resolver 必须先回答：

```text
这个 coalition 整体是否已经被传统题义识别为官局 / 财局 / 其他对应 actor？
```

然后才能使用：

```text
Coalition → Shi
```

不能通过成员传染角色。

---

# 29. 内局 / 外局 → 对方：直接传统支持但主题受限

《增删卜易》三合章与两村例直接证明：

```text
inner coalition
outer coalition
```

可以被赋予：

```text
我方 / 他方
```

并发生：

```text
Group → Group
```

生克关系。

但这一结构不是 universal：

```text
inner = self
outer = other
```

因为文本本身是在：

```text
家宅
彼此之形
上下两村
```

等特定题义里这样使用。

所以分类：

```text
classical_direct_topic_resolved_group_representation
```

不是：

```text
global inner/outer role rule
```

---

# 30. “世在局”“世用同局”在 ZCB 中主要变成 Internal Membership 模型

朱辰彬现代三合体系将：

```text
世在局
世与用神同在局
```

归入：

```text
内局
```

并在应期 / 细节层进一步讨论：

```text
完整内局像受困于罗网
→ 需要寻找破局时机
```

这种模型对 membership 的细化很有价值。

但它属于：

```text
MOD-ZCB systematic refinement
```

不能直接提升为共享古典：

```text
世在局 = trapped
```

因为《增删卜易》一般句反而常说：

```text
世在局为美
```

这再次证明：

```text
membership meaning
```

高度依赖：

```text
analysis layer
+
domain
+
modern school
```

不能共享层先写死吉凶。

---

# 31. WHY 与 ZCB 可以兼容的部分

尽管方向规则有冲突，两位现代作者仍有重要兼容区：

```text
1. 世 / 用 / 应必须先明确角色
2. 三合整体是独立于单爻的 group structure
3. 合局对世 / 用的方向关系具有判断意义
4. 单纯看到三支存在不足以判最终吉凶
5. 日月、旺衰、动静仍会影响实际判断
```

所以现代横向检验结果不是：

```text
两套体系完全互斥
```

而是：

```text
shared architecture largely compatible
+
specific Shi action eligibility conflict
```

这有助于未来保留 shared core，同时把 directional policy 做成 source-specific research adapter，而不是拆成两个完全不同的六爻系统。

---

# 32. WHY 与 ZCB 不能兼容的部分

当前明确不能合并的是：

```text
self-divination
+
Shi participates in active multi-line / coalition structure
+
external target exists
```

### WHY

至少一个三合官运案例把：

```text
Shi-containing 官局 → 应
```

作为实际判断关系。

### ZCB

明确原则：

```text
自占自事 moving 世
→ 不参与复合 / 连动
→ 不向别爻 / 用神传播动作
```

这不是措辞差异，而是会导致不同 action graph。

因此：

```text
no forced reconciliation
```

当前必须保留：

```text
school_specific
```

---

# 33. 不允许通过“多数作者”解决现代学派冲突

即使今后继续增加现代作者，也不能使用：

```text
3 位作者赞成 outward
2 位作者反对
→ outward wins
```

原因：

1. 现代作者可能共享师承 / 文本；
2. 可能讨论的 analysis layer 不同；
3. 可能自占 / 代占 scope 不同；
4. 很多作者只是复述古书，没有独立 action theory；
5. 规则冲突属于模型差异，不是投票题。

正确做法仍是：

```text
proposition-level source comparison
+
scope alignment
+
case-level validation
```

---

# 34. Shared Classical Direction Kernel v0.1

本轮允许抽出的最低共享核如下。

## D1 · Membership is first-class

```text
Shi / Ying / UseGod / role line
can be a coalition member
```

但 membership 本身：

```text
not directional
not favorable/adverse globally
```

## D2 · Membership ≠ external relation

```text
Target ∈ Coalition
≠
Coalition → Target
```

## D3 · Represented role must be resolved before direction

```text
line position labels
```

不能替代：

```text
question-specific represented role
```

## D4 · Coalition-level representation may override 世应

有《增删卜易》两村案例直接支持。

## D5 · Role-semantic elemental relations are traditional

包括：

```text
世 ↔ 用
世 ↔ 应
Coalition ↔ 世 / 应
Group ↔ Group
```

但只在文本 / 题义允许的方向使用。

## D6 · Role-semantic relation ≠ dynamic action eligibility

这是本轮的关键架构结论。

## D7 · Coalition → 世 / 应 can be classically admitted in explicit topic contexts

但：

```text
self-divination + Shi-member coalition outward action
```

仍 unresolved。

## D8 · contains 世 does not assign self role

两村案例直接反证。

## D9 · contains 应 does not assign other role

同理不成立。

## D10 · 用神 membership semantics are domain-specific

例如行人 / 出行的“合留”不能全局扩展。

## D11 · Modern Shi action policy must remain source-specific

```text
MOD-WHY
MOD-ZCB
```

不能被合成单一 consensus rule。

---

# 35. Research-Level Direction Gate v0.1

不是 runtime algorithm，仅作为未来研究检查顺序：

```text
1. Is the coalition formation valid?
2. Is it currently manifest?
3. What entities / roles are represented in this question?
4. Is line-level 世/应 still the active representation scheme?
5. Has a coalition-level role superseded line-level representation?
6. Is target a member or external target?
7. Is there an explicit traditional role-semantic relation for this pair?
8. If dynamic action is required, is the actor eligible to project action in this analysis layer / perspective?
9. If admitted, run Directed Interaction Effectiveness.
10. Only then translate to Domain Evidence.
```

任何一步 unresolved：

```text
stop at unresolved / school-specific
```

而不是默认生成 edge。

---

# 36. Explicit Non-Inferences

本轮不得推出：

```text
世在局 = coalition 必然代表我
应在局 = coalition 必然代表他
用神在局 = coalition 就是用神 actor
用神在局 = coalition 对用神有 external edge
局生世 = coalition 一定 dynamically acts on 世
局生应 = 世局一定可以 outward act on 应
世克用 = moving 世一定 active controls 用神
用克世 = moving 用神一定 active controls 世
内卦 = self globally
外卦 = other globally
世永远是 self
应永远是 other
自占 moving 世永远不能作用外部 target（shared classical）
自占 moving 世永远可以作用外部 target（shared classical）
WHY 例案 = 古典定论
ZCB 原创规则 = 古典定论
现代作者票数可以消解冲突
membership = supportive
membership = trapped globally
group role override = every topic must ignore 世应
```

---

# 37. 对现有 Time / Effect Runtime 的新增审计含义

上一轮已经发现当前 `liuyao-time-effects.js` 在 formation fact 携带：

```text
formationElement
observerElement
```

时会直接计算五行相对关系。

本轮进一步明确：

```text
formationElement relation to observerElement
```

最多先属于：

```text
potential role-semantic topology
```

如果没有：

```text
represented role resolution
+
membership/external distinction
+
dynamic action eligibility when needed
```

就不能自动升级成：

```text
active support / constraint relation
```

尤其在：

```text
self-divination + Shi-containing coalition
```

上会直接撞上 WHY / ZCB 冲突。

因此当前 runtime 再新增一个未来审计标签：

```text
direction_gate_missing_candidate
```

本轮仍不修改任何代码。

---

# 38. 对 Semantic / Resolver 层的约束

现代语义解析只应该告诉传统层：

```text
who is asking
who / what is target
is this self-divination / proxy-divination
what side / group each real-world participant belongs to
what is the current question target
```

不能由 NLP 直接决定：

```text
Shi action allowed
Coalition action allowed
用神在局吉凶
内外局代表谁
```

这些仍是传统 Resolver / Domain Research 的职责。

同时，传统 Resolver 也不能反过来假设：

```text
“世”一定就是 modern semantic self
```

因为两村案例已经证明传统内部也会发生 role representation override。

---

# 39. 对各主题的影响

本轮是 shared layer，不为任何单一主题直接下结论。

但几个典型影响已经明确。

## Travel / Person Return

```text
世克用 / 用克世
```

可以作为传统 role-semantic relation；
不能未经 action eligibility 审核就自动当 multi-moving source edge。

## Career / Study

```text
官局 / 父母相关局 → 世 / 应
```

只有在题义 role 已解决后才有意义。

## Litigation / Dispute

两方可能由：

```text
世应
```

表示，也可能在特定群体题中由：

```text
inner/outer coalition
```

表示。

不能固定只用世应。

## Lost Property / Transport

若 target 本身是 coalition member：

```text
membership
```

必须先于 external relation 判断；不能自动给 group→target 生克。

这些都只属于 research constraints。

---

# 40. Evidence Classification Summary

## 40.1 Classical Direct

```text
世在局与局生/克世分开处理
用神在三合内具有 membership 语义
局生世 / 局克世
局生应
内外局可代表双方
两村案例可舍世应而用 coalition role
世克用 / 用克世可直接进入题义判断
```

## 40.2 Independent Classical Structural Support

```text
《火珠林》支持：
世 / 应 / 用之间的 role-resolved 生克关系
```

但不直接解决：

```text
三合世局 outward action
```

## 40.3 MOD-WHY

```text
世用关系是广义判断核心
动爻一般具有作用资格
存在 Shi-containing 官局 → 应 的直接案例
```

## 40.4 MOD-ZCB

```text
自占自事 moving 世不参与复合/连动
世只趋向自身变爻
代占 / 与己无关时世可恢复普通连动资格
三合整体优先于 constituent 连动
```

## 40.5 Conflict

```text
self-divination
+
Shi-member active coalition
+
external target
→ outward dynamic action eligibility
```

当前：

```text
classical = unresolved
MOD-WHY = direct yes-type case exists
MOD-ZCB = explicit no under self-divination rule
```

---

# 41. Current Research State

```text
Three-Harmony Membership
= research complete v0.1

membership as first-class relation
= solved

membership vs external relation
= solved

line-level role vs coalition-level representation
= substantially solved

contains-Shi / contains-Ying shortcut
= rejected

role-semantic direction
= traditionally supported

role-semantic relation vs dynamic action edge
= solved as conceptual separation

self-divination Shi-coalition outward action
= classical unresolved
= modern school conflict

proxy-divination role-sensitive eligibility
= supported in MOD-ZCB

universal direction resolver
= not ready

Formal Expansion
= not authorized
```

---

# 42. Recommended Next Research

下一步不建议继续在“三合”内部堆更多例外。

当前冲突已经暴露为一个更基础的共享问题：

```text
moving 世本身
在自占 / 代占 / 他占不同 perspective 下
到底具有什么 Action Eligibility？
```

因此下一步应独立做：

```text
Shi-Line Action Eligibility in Self vs Proxy Divination Review v0.1
```

重点：

1. 传统《火珠林》《断易天机》《增删卜易》《易隐》等是否存在 moving 世向外生克的直接案例；
2. 哪些“世克用 / 世克应”只是 role semantics，哪些明确要求世发动；
3. 自占、代占、代人问事、与己无关之事在传统文本中是否有 perspective 区分；
4. 世为最终承受者这一理论能否找到 ZCB 之外的独立传统 / 现代支持；
5. WHY 的 broad interaction doctrine 是否在 self-divination 中稳定允许 moving 世 outward action；
6. 是否应得到：

```text
shared classical minimum
+
MOD-WHY action policy
+
MOD-ZCB action policy
```

三层，而不是一个 universal boolean。

只有这一步解决后，三合 coalition 的：

```text
Shi-member action gate
```

才有可能正式收束。

在此之前：

```text
self-divination Shi-containing Coalition → external Target
```

必须保持：

```text
school_specific / unresolved
```

不得进入 shared Formal Expansion。