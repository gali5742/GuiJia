# 龟甲 · 六爻 Directed Interaction Path / 制化 Review v0.1

日期：2026-09-03

状态：`research_complete_design_only_no_path_resolver`

范围：六爻共享研究层 / 有向爻际作用路径、制化与多爻网络。

上游：

- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `travel-transport-active-control-source-effectiveness-review-v0.1.md`
- `liuyao-line-effectiveness-synthesis-readiness-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `liuyao-line-relation-fact-provenance-review-v0.1.md`
- `shared-line-pair-fact-provider-research-v0.1.md`
- `liuyao-move-transform-fact-provenance-review-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`

> 本研究只回答：当 reading 中已经存在 `source → target` 的基础五行关系时，传统六爻材料如何处理合绊、入墓、第三爻制化、贪生贪合、接续相生、动变回头作用等“路径改写”问题。v0.1 不建立通用 Path Resolver，不建立统一优先级，不执行 Formal Expansion，不修改 current-22、Rule Registry、Time Engine、训练数据或 Candidate 开发线。

---

# 1. 研究起点：Pair Relation 仍不足以表示实际作用

前一轮已经确认：

```text
source active
+
source CONTROLS target
↓
active control interaction exists
```

不能直接升级为：

```text
effective control
```

因为至少还要检查：

```text
source actionability
+
target condition
+
interaction path
+
temporal recoverability
```

本轮只聚焦第三项：

```text
interaction path
```

核心问题不是：

```text
A 是否克 B
```

而是：

```text
A 原本指向 B 的作用
在当前卦内是否仍沿原路径发出？
是否被绊住？
是否被第三爻截断？
是否转而作用于另一节点？
是否形成接续相生？
是否只是暂缓，待冲开后恢复？
```

这说明传统六爻并不是一个简单的：

```text
所有五行边同时无条件生效
```

的静态网络。

---

# 2. 本轮最大的结论：Interaction Path 是传统判断结构，不是现代附加抽象

传统材料反复出现以下判断：

```text
A 本可克 B
+
A 被合住
→ 当前不能直接克 B

A 本可克 B
+
A 入墓
→ 当前难以向 B 发出作用

A 本可克 B
+
C 动克 A
→ A 对 B 的作用受制

A 本可克 B
+
A 转而生 C
→ 原克 B 路径被改写

A 本可克 B
+
A 与 C 合
→ 原克 B 路径可能被吸引 / 绊住

A 本为忌神
+
A 生元神 C
+
C 生用神 B
→ 原 adverse source 成为接续相生的一环
```

因此：

```text
base relation topology
≠
realized interaction path
```

分类：

```text
cross_text_compatible_classical_structure
```

但这不等于：

```text
universal_path_precedence_algorithm_ready
```

---

# 3. Path Modifier A：合绊 / source_bound

## 3.1 传统依据

《黄金策》传承材料明确提出“动值合而绊住”。《卜筮全书》相关注解进一步说明：一个本已发动、原本能够生克他爻的 source，若被日辰或相应合局绊住，其当前动作可以受到限制。

这里的关键不是：

```text
source weak
```

而是：

```text
source has activity
+
source current action availability is bound
```

因此本轮允许：

```text
source_bound
```

作为独立 path responsibility。

来源：

```text
SRC-HJC / SRC-BSQS witness
independenceGroup = TRAD-HJC-TRANSMISSION
location = 黄金策上 / 动值合而绊住
```

分类：

```text
classical_direct_path_binding_support
```

## 3.2 合绊具有明确的时间恢复语义

《增删卜易》的六合与日辰体系明确保留：

```text
当前合住
↓
待冲开
↓
原作用重新具备兑现条件
```

因此：

```text
source_bound
≠ permanently ineffective
```

必须至少保留：

```text
currentActionAvailability = constrained
futureRecoverability = possible
recoveryTrigger = clash/opening candidate
```

本研究不把“哪一天一定冲开”纳入 Path 层；具体应期继续属于 Time 研究。

## 3.3 合本身不能全局解释为阻滞

静爻逢合、动爻逢合、六合卦、三合局并非完全同义。

所以不得：

```text
HARMONY
→ source_bound
```

无条件映射。

必须先满足经传统规则审核的：

```text
this harmony acts as binding in this context
```

之后才能登记 path binding。

---

# 4. Path Modifier B：入墓 / confinement

## 4.1 source 入墓

《黄金策》传承材料以“入墓难克”表达：原本可向外发生克制的动爻，若进入墓库，其外向作用可以受到明显限制。

这里更接近：

```text
source_confined
```

而不是：

```text
source_strength = negative
```

因为同一传统还存在：

```text
冲墓
旺衰
生扶
```

等解除或改变判断的条件。

因此：

```text
source in tomb
→ confinement candidate
→ current outward action constrained candidate
→ not permanent invalidation
```

## 4.2 target 入墓

同一“入墓难克”传统还存在另一方向：

```text
target 已藏入墓
→ source 即使发动
→ 对 target 的直接克制也可能难以兑现
```

这说明墓不能只绑定在 source 状态上。

至少要区分：

```text
source_confined
vs
target_confined
```

两者都可能导致：

```text
source → target interaction currently not realized
```

但原因不同。

## 4.3 《增删卜易》对墓的条件化处理

《增删卜易》的墓绝体系并不把所有“入墓”一概判死；旺衰、日月动爻、冲墓等条件都可能改变实际效力。

因此本轮结论：

```text
TOMB
= path / availability modifier candidate
= role-sensitive
= temporally recoverable in some conditions
= not global ineffective switch
```

分类：

```text
cross_text_compatible_confinement_structure
exact_effect = condition_dependent
```

---

# 5. Path Modifier C：第三爻直接制 source

《碎金赋》及《卜筮全书·阐奥歌章》保存大量三节点生克链。

典型结构不是：

```text
A controls B
```

而是：

```text
C controls A
+
A controls B
```

传统判断允许：

```text
C 对 A 的发动作用
→ 削弱甚至阻断 A 对 B 的作用
```

例如财动本可克父，但若兄动直接克财，则父可得到解救；同类结构还见于鬼、子、父、兄之间的多组关系。

因此：

```text
source_suppressed_by_third_party
```

是有直接传统支持的 path responsibility。

来源：

```text
SRC-BSQS witness
location = 卷四·阐奥歌章上·碎金赋
independence = shared_formula_scope_requires_review
```

注意：该类公式在其他编纂材料中亦有相同或高度相似版本，不能机械按书名多计 independent lineage。

分类：

```text
classical_direct_third_party_suppression_support
provenance_independence_pending_scope_review
```

---

# 6. Path Modifier D：第三爻生 source / reinforcement

同一传统链也明确存在反向机制：

```text
A controls B
+
C generates A
→ A 对 B 的作用被加强
```

这不是 path redirection，而是：

```text
source_reinforced_by_third_party
```

因此多爻网络不能只寻找“救应”；第三爻既可能：

```text
制 source
```

也可能：

```text
助 source
```

本轮允许登记为不同职责：

```text
third_party_suppression
third_party_reinforcement
```

但不定义统一权重。

特别禁止：

```text
1 个 suppressor vs 1 个 supporter
→ 自动抵消
```

传统材料并未支持简单按条数相减。

---

# 7. Path Modifier E：贪生忘克 / path_diverted_by_generation

《碎金赋》传统明确存在：原本克 target 的 source，因为另一个活动节点成为其所生对象，而把作用方向转向该节点，使原本对 target 的克制不再按原路径落实。

这可以抽象为：

```text
A controls B
+
A generates C
+
C is interaction-relevant / active
↓
A's original path to B may be diverted toward C
```

其传统语义常概括为：

```text
贪生忘克
```

但本研究不把它泛化成：

```text
只要 A 同时能生 C
→ 一定不克 B
```

原因：

1. 传统例证强调动爻网络和当前作用关系；
2. 不同静动组合可能不成立；
3. source / C 自身有效性仍需审核；
4. 多个 competing path 同时存在时尚无统一裁决。

因此只允许：

```text
path_diverted_by_generation candidate
```

分类：

```text
classical_direct_path_redirection_support
```

---

# 8. Path Modifier F：贪合忘克 / path_diverted_or_bound_by_harmony

《黄金策》传承与后续相关注解均存在：原本可刑、冲、克、害其他对象的爻，在特定合的作用下，原关系可能被合所吸引或绊住。

这里必须避免把两种现象混成一类：

```text
A. source_bound
→ 动作本身被绊住

B. path_diverted_by_harmony
→ source 的关系重点转向与第三方的合
```

两者现实表现可能类似：

```text
original harm to target not realized now
```

但研究职责不同。

因此 v0.1 不建立统一：

```text
HARMONY_DIVERSION algorithm
```

只保留：

```text
harmony may alter the original adverse path
```

分类：

```text
classical_supported_harmony_path_modification
exact_mechanism = context_dependent
```

---

# 9. Path Modifier G：忌神 → 元神 → 用神的接续相生

《增删卜易·元神忌神衰旺章》提供一个非常重要的网络案例：

```text
忌神 A 原本克用神 B
+
元神 C 同时发动
+
A 生 C
+
C 生 B
↓
形成接续相生
```

这里不能说：

```text
A 没力量
```

因为 A 的力量恰恰仍然存在，只是被重新导入：

```text
A → C → B
```

因此最准确的职责是：

```text
continuous_generation
```

或：

```text
path_redirection_into_supportive_chain
```

这条证据非常关键，因为它直接否定：

```text
adverse source exists
→ source effectiveness judge
→ keep/remove adverse edge
```

这种过于简单的二值图模型。

传统真实结构可能是：

```text
edge changes role in network context
```

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 元神忌神衰旺章第十
```

分类：

```text
classical_direct_continuous_generation_support
```

---

# 10. Path Modifier H：target_rescue / 克处逢生

另一个必须单独处理的结构是：

```text
A controls B
+
C supports B
```

这时发生的未必是：

```text
A → B path 被截断
```

也可能是：

```text
A 仍在克 B
+
B 同时得到其他来源救助
```

所以：

```text
target_rescued
```

不能和：

```text
source_suppressed
```

混为一谈。

两者最终都可能使 target 不至于受重伤，但推理链不同：

```text
source_suppressed
→ adverse action本身下降

target_rescued
→ adverse action仍存在，但target同时得到支持
```

这一区分对未来 Domain Assessment 很重要。

分类：

```text
classical_supported_target_rescue_structure
```

---

# 11. 动静优先级：不能先做旺衰分，再传播所有边

《增删卜易·动静生克章》给出本轮最重要的优先级警告之一。

其结构可以概括为：

```text
六爻皆静时
→ 旺相静爻可作用于休囚静爻

一旦某爻发动
→ 动爻取得不同于静爻的作用资格
→ 即使动爻休囚，也可能克旺相静爻
```

并进一步说明：

```text
旺相静爻若先被动爻所伤
→ 它原本对第三爻的克制也会受影响
```

这意味着传统制化并不是：

```text
先给每个节点算 strength score
↓
再让所有 A→B 边按 strength 比较同时传播
```

至少还要考虑：

```text
activity / movement priority
+
interaction ordering
+
network consequence
```

因此：

```text
movement
≠ just another +1 strength factor
```

而更像独立的作用资格 / 优先级条件。

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 动静生克章第十四
```

分类：

```text
classical_direct_activity_precedence_support
```

---

# 12. 变爻拓扑边界：禁止构造“本卦 + 变爻全连接图”

《增删卜易·动变生克冲合章》明确规定：

```text
变爻
→ 可回头作用本位动爻
→ 不直接生克其他本卦爻

其他本卦爻
→ 也不直接生克该变爻

日月
→ 可作用动爻、静爻、变爻等
```

因此未来任何 interaction graph 都必须尊重：

```text
changed-line edge is local feedback
```

而不是：

```text
changed line = ordinary seventh/eighth/... node
→ arbitrary edges to all original lines
```

这也是为什么现有：

```text
RETURN_GENERATE
RETURN_CONTROL
RETURN_HARMONY
RETURN_CLASH
```

应该继续理解为：

```text
original moving line ↔ its own transformed result
```

的局部 transform relation。

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 动变生克冲合章第十五
```

分类：

```text
classical_direct_transform_topology_rule
```

重要限制：

```text
cross_traditional_independence = not yet established
```

本轮尚未找到足够独立传统链证明所有流派都采用完全相同的变爻拓扑限制，因此不得升级：

```text
stable_consensus_all_schools
```

---

# 13. Multi-moving network：传统确实允许三节点以上制化

《碎金赋》体系大量处理：

```text
A → B
+
C → A
```

以及：

```text
A → B
+
C → A (generate)
```

《增删卜易》又有：

```text
忌 → 元 → 用
```

接续相生。

因此传统判断结构足以支持：

```text
multi-node directed interaction network
```

这一研究概念。

但这不等于可以立刻实现：

```text
generic graph solver
```

因为还没有解决：

1. 多个动爻同时克同一 source 时的优先级；
2. source 同时被生、被克、被合时如何裁决；
3. source 同时具有两条可能输出路径时，何时适用贪生 / 贪合；
4. 动静优先级和旺衰优先级如何组合；
5. 日月作用与动爻作用在所有条件下的顺序；
6. 三合局形成后的 group-level interaction；
7. 空、破、墓、合的时间恢复条件如何嵌入同一网络。

所以：

```text
network existence = supported
network synthesis algorithm = not ready
```

---

# 14. 三合局：已确认是 group-level 机制，但本轮不吸收

《增删卜易》的三合体系表明：多个爻在满足条件后可能形成：

```text
合局整体
```

然后以整体的五行属性生克当前对象。

这已经超出：

```text
pairwise edge modification
```

因为它涉及：

```text
multiple nodes
→ temporary coalition / group
→ group-level element relation
```

同时：

```text
缺一支
空
墓
待填实 / 冲开
```

还会影响合局是否当前成立。

因此本轮明确：

```text
three_harmony_group_interaction
= real research dependency
= not included in v0.1 path solver
```

应在后续 Multi-Moving / Coalition Review 专门研究。

---

# 15. 现代朱辰彬材料：可以帮助细化，但不能反推传统共识

《古筮真诠》及进阶材料对：

```text
日绊 / 解绊
真假墓
动爻作用路线
贪生忘克
```

存在较系统的现代解释。

这些材料有两个价值：

1. 提供现代实占中如何区分 path modifier 的案例；
2. 提醒某些古典简式不能机械化，例如“动爻化墓”并非所有情况下都等于真墓。

但它们属于：

```text
MOD-ZCB
```

同一现代作者体系。

因此：

```text
modern refinement
≠ independent classical proof
```

当前分类：

```text
modern_author_specific_refinement
```

若未来某细化规则要进入共享传统 contract，仍需回到独立传统来源核验。

---

# 16. v0.1 Path Taxonomy

本轮允许形成研究层 taxonomy，但不是 executable resolver。

| path state | 含义 | 当前作用 | 是否可能恢复 | 是否已足够形成最终吉凶 |
|---|---|---|---|---|
| `direct` | 原 source→target 路径无已知改写 | candidate active | n/a | 否 |
| `source_bound` | source 被合绊，动作暂受限 | constrained | 是 | 否 |
| `source_confined` | source 入墓 / 被收束 | constrained candidate | 是/条件化 | 否 |
| `target_confined` | target 入墓，当前难受作用 | constrained candidate | 是/条件化 | 否 |
| `source_suppressed_by_third_party` | 第三爻直接制 source | weakened / possibly interrupted | 条件化 | 否 |
| `source_reinforced_by_third_party` | 第三爻生助 source | reinforced | 条件化 | 否 |
| `path_diverted_by_generation` | source 转向生第三节点 | original path reduced/diverted | 条件化 | 否 |
| `path_diverted_by_harmony` | source 因合改变原作用重点 | bound/diverted | 常有冲开语义 | 否 |
| `continuous_generation` | 原 adverse source 进入接续相生链 | role transformed in network | 条件化 | 否 |
| `target_rescued` | target 同时得到支持 | adverse path仍可能存在 | 条件化 | 否 |
| `transform_feedback_local` | 变爻只回头作用本位动爻 | local-only | 依具体动变 | 否 |
| `group_interaction_pending` | 三合等形成 group-level 作用 | unresolved | 条件化 | 否 |

注意：

```text
path state
```

当前允许多项并存。

禁止：

```text
one interaction → exactly one enum
```

因为同一 source 可能同时：

```text
被合
+
受第三爻克
+
自身化退
```

或：

```text
克 target
+
又生另一个动爻
```

若现在强制单值，会提前丢掉传统信息。

---

# 17. Research-level minimum record

如果未来继续研究，本层至少需要保留以下信息概念：

```text
source identity

target identity

base directional relation

activity provenance

path modifier facts[]

third-party participants[]

source action availability

target accessibility / rescue context

redirection target if any

temporal recoverability

provenance refs

synthesis status
```

这里是研究字段，不是 TypeScript schema，不授权 implementation。

尤其：

```text
synthesis status
```

当前必须允许：

```text
unresolved
```

不能为了程序方便而强迫输出：

```text
effective / ineffective
```

---

# 18. Explicit Non-Inferences

本研究不得推出：

```text
合住 = 永久失效
入墓 = 永久失效
被第三爻克 = 一定完全失去作用
得到第三爻生 = 一定压倒所有约束
贪生 = 任何生关系都自动忘克
贪合 = 任何合关系都自动忘克
接续相生 = target 最终一定吉
克处逢生 = adverse relation 不存在
动爻永远压倒一切日月状态
休囚动爻 = 全局强于所有旺静爻
三合出现三支 = 无条件立即成局
变爻 = 普通全局节点
多条 supporting edge > 一条 adverse edge
```

也不得推出任何主题结论：

```text
transport blocked / not blocked
journey succeeds / fails
career succeeds / fails
exam passes / fails
litigation wins / loses
lost property recovered / not recovered
```

Path 层只解释：

```text
作用关系如何被修改
```

不解释：

```text
现实事件最终如何结束
```

---

# 19. Evidence classification

## 19.1 可以认为传统结构支持较强的部分

```text
合绊可限制发动作用
入墓可限制作用兑现
第三动爻可制约 / 加强原 source
动爻网络可发生贪生忘克
元忌同动可形成接续相生
动静本身具有独立于旺衰的作用职责
变爻回头作用本位动爻（至少在增删体系明确）
```

总分类：

```text
classical_path_adjudication_structure = strongly_supported
```

但各子命题的 independence 状态不同。

## 19.2 不应宣称为 stable universal algorithm 的部分

```text
所有 path modifier 的统一优先级
多动爻冲突时的完全裁决顺序
旺衰 vs 动静 vs 日月 vs 合墓的统一排序
三合 / 三刑 / 六合与普通 pair edge 的通用融合
所有流派一致的变爻拓扑
所有墓 / 合的解除条件
```

分类：

```text
synthesis = insufficient_evidence
+
condition_dependent
+
partially_school_specific
```

---

# 20. 对 Directed Interaction Effectiveness 的修订

上一层可以进一步精确为：

```text
Base Directed Relation
+
Source Actionability
+
Target Condition
+
Interaction Path Modifiers
+
Temporal Availability
↓
Directed Interaction Effectiveness
```

其中本轮确认：

```text
Interaction Path Modifiers
```

不能被压缩成：

```text
pathOpen = true / false
```

更安全的是保留：

```text
bound
confined
suppressed
reinforced
diverted
continuous_generation
target_rescued
transform_feedback_local
```

等原因层。

但：

```text
final synthesis rule
= not ready
```

---

# 21. 对 Travel / Transport 的影响

此前：

```text
resolved transport
+
VISIBLE_MOVING source
+
source CONTROLS transport
→ transport_active_control_interaction
```

仍然成立。

本轮之后也仍不得直接升级为：

```text
transport_blocking_pressure
```

因为至少要检查：

```text
source 是否被合住
source 是否入墓
source 是否被第三动爻制约
source 是否转而进入其他生合路径
transport target 是否另得救助
source 自身变爻是否回头改变本位状态
```

因此 Travel 当前研究状态：

```text
transport_active_control_interaction
= admitted nonconclusive

interaction-path research
= complete v0.1

transport_blocking_pressure synthesis
= still not ready
```

这不是 Travel 私有缺口，而是六爻共享制化层缺口。

---

# 22. 当前最大剩余问题：Interaction Precedence

本轮已经证明：

```text
network exists
```

但还没有回答：

```text
network 同时出现多个 modifier 时，传统上先看什么？
```

典型未解决组合：

```text
source 动且休囚
+
临日扶
+
被第三爻克
+
又被合住
+
自身化回头生
```

或：

```text
source 克 target
+
source 同时生 C
+
D 又克 source
+
target 同时得 E 生
```

当前绝不能：

```text
把每个因素转成 +1 / -1
然后求和
```

也不能：

```text
按文档出现顺序硬编码优先级
```

因此下一研究应直接处理：

```text
Interaction Precedence / Multi-Moving Adjudication Review v0.1
```

重点包括：

1. 动 vs 静的传统优先结构；
2. 动爻之间直接制化是否先于作用静爻；
3. 日月与动爻的作用层级；
4. 合绊 / 入墓对活动资格的优先性；
5. 回头生克与本卦其他动爻的关系；
6. 多个 competing paths 如何选择；
7. 三合等 group-level interaction 何时进入网络；
8. 不同传统来源之间是否存在真实优先级冲突。

---

# 23. Final Decision

```text
Directed Interaction Path / 制化
= traditional-research-supported shared layer

pair relation alone
= insufficient

source weakness
≠ source bound
≠ source confined
≠ path diverted
≠ source suppressed
≠ target rescued

changed lines
= local transform feedback in ZSBY
= must not be arbitrary global nodes

multi-moving interaction network
= traditionally supported

single path resolver
= not ready

universal precedence order
= not ready

score / vote / edge counting
= forbidden

Formal Expansion
= not authorized
```

下一步：

```text
Interaction Precedence / Multi-Moving Adjudication Review v0.1
```

继续保持 research-only；在该层完成前，不建立 Directed Interaction Effectiveness runtime synthesis。