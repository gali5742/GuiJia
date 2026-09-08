# 龟甲 · 六爻 Role-Semantic Relation → Action Eligibility Promotion Review v0.1

日期：2026-09-08

状态：`research_complete_design_only_single_promotion_pipeline_rejected_mechanical_vs_semantic_split_supported`

范围：六爻共享研究层 / 已存在的 line-to-line 结构关系、题义角色关系，何时能够进入机械作用候选、现实主动语义、行为语义或其他专门状态；并审查 movement 是否为必要 / 充分条件、不同 relation type 是否可共用同一 promotion contract、group actor 能否复用、WHY / ZCB 应如何与 shared classical core 分层。

上游：

- `liuyao-self-participant-topic-direction-matrix-review-v0.1.md`
- `liuyao-shi-line-action-eligibility-self-proxy-divination-review-v0.1.md`
- `liuyao-line-relation-fact-provenance-review-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `liuyao-directed-interaction-path-control-transformation-review-v0.1.md`
- `liuyao-interaction-precedence-multi-moving-adjudication-review-v0.1.md`
- `liuyao-three-harmony-coalition-effectiveness-group-actor-target-review-v0.1.md`
- `liuyao-three-harmony-coalition-membership-role-sensitive-directionality-review-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`
- `龟甲 · 六爻复合观察与取用规则规范 v0.2（草案）`

> 本研究不建立 executable `ActionEligibilityResolver`，不修改 Rule Registry、Time Engine、current-22、Candidate、Semantic runtime、训练 / calibration / blind data。它只处理研究层概念边界。

---

# 1. Executive Decision

本轮最大的修正不是“找到更多允许 action 的例子”，而是发现上一轮题目本身仍然把两个不同问题压成了一个 promotion：

```text
Role-Semantic Relation
→ Action Eligibility
```

这个单线模型不够准确。

传统材料至少要求拆成两条相互正交、最后才汇合的路径：

```text
A. Mechanical / Elemental Interaction Path

Structural Relation Fact
↓
Interaction Scope / Topology Gate
↓
Mechanical Interaction Candidate
↓
Source / Target / Path / Temporal Adjudication
↓
Realized / Constrained / Deferred Effect
```

与：

```text
B. Role / Initiative Semantic Path

Represented Role
+
Topic Responsibility
+
Activity / Movement Semantics
+
Explicit Traditional Formula or Domain Rule
↓
Role Behavior / Initiative / Direction Meaning
```

然后才可能在领域层组合：

```text
Mechanical Effect
+
Role / Topic Meaning
↓
Domain Evidence
```

这意味着：

```text
Role-Semantic Relation
```

并不是所有 action 的唯一上游。

同样：

```text
Mechanical Interaction
```

也不自动包含“谁主动谋谁、谁压制谁、谁出发、谁欺谁”这样的现实语义。

本轮最核心结论：

```text
single_promotion_pipeline
= rejected

mechanical_effect_promotion
= cross-source supported

initiative_semantic_promotion
= topic / role specific

movement_is_necessary
= false

movement_is_sufficient
= false

movement_is_strong_qualifier
= true

role_relation
≠ mechanical interaction
≠ initiative semantics
≠ effective interaction
≠ domain outcome
```

同时，本轮修正上一轮推荐的保守 fallback：

```text
Shared Core
→ only explicit topic-authorized promotion
```

如果这里的 `promotion` 指：

```text
现实主动语义 / actor initiative
```

则这个 fallback 仍然正确。

但如果指：

```text
五行生克的机械作用候选
```

则过于严格。

《增删卜易》的通用生克章已经明确存在跨主题的：

```text
旺静爻可生克休囚爻
动爻可生克用神
```

机械作用框架。

因此 Shared Core 不能退化成：

```text
没有 topic-specific 文句
→ 一切 line-to-line 生克都只准静态展示
```

正确边界是：

```text
通用机械作用
可以有 shared classical core

现实主动语义
必须 topic / role / layer resolved
```

最终状态：

```text
Formal Expansion = not authorized
```

---

# 2. 先固定五个不可混用的层级

## 2.1 Structural Relation Fact

回答：

```text
A 与 B 在结构上是什么关系？
```

例如：

```text
A generates B
A controls B
A six-harmony B
A six-clash B
A same-element B
```

这是 neutral Fact。

当前仓库 `Line Relation Fact Provenance Review` 已经确认：

```text
controls
```

仍然应保持：

```text
polarity = neutral
```

不能在 Fact 层写：

```text
blocking
adverse
success
failure
```

## 2.2 Mechanical Interaction Candidate

回答：

```text
这个结构关系当前是否具有“可发生作用”的传统机械资格？
```

例如：

```text
动爻克用神
```

可以进入 mechanical candidate。

但：

```text
candidate
≠ realized effect
```

仍要经过：

```text
source condition
target condition
binding / tomb
third-party redirection
temporal state
```

## 2.3 Role-Semantic Relation

回答：

```text
这个关系在当前题义中代表谁和谁、以及怎样的现实关系？
```

例如：

```text
诉讼：世 = 我，应 = 对方
出行：世 = 行人，应 = 所往之地
买卖：世 = 我方，应 = 交易相对方
```

此层可以使用：

```text
世克应
应生世
```

解释题义方向，但不等于已经证明 dynamic action。

## 2.4 Initiative / Activity Semantic

回答：

```text
谁在主动采取现实行动？
谁的意愿 / 行为 / 进退发生变化？
```

例如：

```text
世动克应 → 我兴词
世动克应 → 己谋人
世动 → 夫凌妻
世动 → 出行者动身
```

这四个例子并不是同一 relation class。

## 2.5 Realized Effect / Domain Evidence

最后才回答：

```text
这个作用当前是否兑现？
它对具体主题意味着什么？
```

例如：

```text
control mechanically realized
```

也只能成为：

```text
对 target 的有效克制 Evidence
```

不能直接跳成：

```text
官司必胜
考试失败
航班取消
```

---

# 3. 最大证据：Movement 不是 Mechanical Effect 的必要条件

《增删卜易·动静生克章》直接说：

```text
六爻安静
旺相之爻
可以生得休囚之爻
亦可以克得休囚之爻
```

并以春令卯木旺相：

```text
卯木 → 生巳火
卯木 → 克丑未土
```

作例。

这里的前提明确是：

```text
六爻安静
```

因此以下命题被直接否定：

```text
source 必须 moving
才能对 target 发生任何传统五行作用
```

也就是说：

```text
movement
≠ universal necessary condition for mechanical influence
```

传统至少承认：

```text
旺静 source
→ 休囚 target
```

可以产生生克作用。

这对本项目很重要，因为不能把：

```text
Action Eligibility
```

硬编码成：

```text
source.moving === true
```

否则会直接遗漏静卦中的传统生克。

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 动静生克章
classification = classical_direct_static_mechanical_effect
```

---

# 4. Movement 又确实是非常强的 Mechanical Qualifier

同一《动静生克章》紧接着又说：

```text
酉金发动
虽则休囚
动而能克旺相之卯木
```

并进一步形成因果次序：

```text
酉金动克卯木
↓
卯木受伤
↓
卯木原本克丑未土的能力下降
```

这说明 movement 的传统作用不是：

```text
+1 strength
```

而更接近：

```text
action priority / action availability / causal qualification
```

因此：

```text
moving source
```

在一些关系中可以突破单纯旺衰比较。

但这一点仍不能写成：

```text
moving source always wins
```

因为后续合绊、入墓、贪生贪合、第三方制化等材料又会限制它。

所以最安全的 shared 结论是：

```text
movement
= strong mechanical qualifier
= may alter precedence / realization
≠ numeric strength bonus
≠ universal victory
```

---

# 5. 《增删卜易》的“四处”进一步证明 Generic Mechanical Interaction 真实存在

《动变生克冲合》体系明确列：

```text
月建对用神
日辰对用神
卦中动爻对用神
用神发动后的变爻回头作用
```

其中第三处直接说：

```text
卦中之动爻能生克冲合用神
```

这非常关键。

因为它不是：

```text
诉讼章专门说世动克应
```

也不是：

```text
行人章专门说世动克应
```

而是在通用机制章中说明：

```text
resolved target / 用神
+
卦中动爻
```

可以发生：

```text
生
克
冲
合
```

所以：

```text
mechanical interaction candidate
```

不需要每个主题重新找到一句：

```text
“某动爻生 / 克某用神”
```

才承认存在。

但这里仍有两个边界。

### 边界一：不是全图枚举

原文的作用对象是：

```text
用神 / resolved observation target
```

不能偷换成：

```text
每一个 moving line
自动对全卦每一个其他 line 建立业务 edge
```

### 边界二：不是现实主动语义

```text
动爻克用神
```

证明的是：

```text
mechanical control candidate
```

不自动证明：

```text
现实中的 source actor 主动攻击 target actor
```

后者仍需要题义角色解释。

因此：

```text
Generic Mechanical Core
= supported

Generic Initiative Semantic Core
= not supported
```

---

# 6. Movement 也不是 Mechanical Effect 的充分条件

传统材料中有大量：

```text
source 已动
但作用不兑现 / 被改道
```

的直接结构。

## 6.1 合绊

《黄金策》传承与《增删卜易·六合章》均明确：

```text
动而逢合
→ 合绊
→ 反不能动
```

所以：

```text
moving + controls target
```

仍可能因：

```text
source_bound
```

而不能直接兑现。

## 6.2 入墓

《黄金策》体系：

```text
入墓难克
```

说明问题不是 source 根本不存在，而是：

```text
source current action availability / path
```

受限。

## 6.3 贪生贪合

《黄金策》：

```text
贪生贪合，刑冲克害皆忘
```

并直接举：

```text
本来冲 / 刑 / 克 target 的 source
因转去生或合另一对象
→ 原路径不再兑现
```

因此：

```text
movement
≠ sufficient condition
```

即使 source 处于活动状态，也必须继续处理：

```text
binding
confinement
path diversion
third-party attraction
```

这与既有 Directed Interaction Path 研究完全一致。

---

# 7. Target Activity 也会改变 Static Relation 的兑现

《断易天机》词讼保存：

```text
世静而克应
+
应发动
→ 彼有通变之谋
→ 终于不受克
```

这一结构非常适合说明三层区别：

```text
1. 世克应
   structural / role relation exists

2. 世静、应动
   activity asymmetry exists

3. 原本的 control relation
   不一定按静态拓扑直接兑现
```

所以：

```text
relation exists
```

不能自动升为：

```text
realized effect
```

而 target 的 movement 也不是简单：

```text
+1 defense
```

它可以表现为：

```text
evasion / response / path change
```

这也是为什么 promotion 与 effectiveness 必须继续分层。

来源：

```text
SRC-DYTJ
independenceGroup = TRAD-DYTJ
classification = classical_direct_activity_sensitive_realization
```

---

# 8. 因此不能再用一个 `ActionEligibility: boolean`

若未来设计：

```ts
ActionEligibility = true | false
```

至少会混掉：

```text
A. 静态旺爻对休囚爻的机械生克
B. 动爻对用神的机械生克候选
C. 动爻被合绊而暂不能发力
D. 世动克应的现实主动诉讼语义
E. 婚姻世动的行为语义
F. 出行世动的执行状态
G. 六冲的相击 / 触发
H. 六合的合起 / 合绊 / 合好
```

这些不应该被压成同一个：

```text
canAct = true
```

更准确的研究接口是多轴：

```text
Relation Fact
+
Interaction Scope
+
Mechanical Qualification
+
Role Semantic Type
+
Activity Semantic Type
+
Path State
+
Effectiveness State
```

本轮不授权代码 enum，但概念上必须拆开。

---

# 9. Controls：可以进入 Generic Mechanical Promotion

`controls` 是当前研究证据最成熟的 directional elemental relation。

shared classical 允许：

```text
resolved source
+
resolved target
+
source CONTROLS target
```

在满足作用 scope 后进入：

```text
mechanical_control_candidate
```

其中 source 可以是：

```text
moving source
```

也可以在传统特定条件下是：

```text
旺 static source against休囚 target
```

但 candidate 之后仍必须进入：

```text
source condition
target condition
activity asymmetry
path state
temporal state
```

才能讨论：

```text
realized control
```

因此 controls 的研究链：

```text
CONTROLS Fact
↓
Interaction Scope Gate
↓
Mechanical Candidate
↓
Effectiveness Review
```

是成立的。

但它不包含：

```text
我主动攻击他
我会输
事情失败
```

这些是另一个职责。

---

# 10. Generates：原则上可与 Controls 共用 Mechanical 骨架，但不能照搬结果语义

《增删卜易·动静生克章》同时说：

```text
旺静爻可以生休囚爻
```

“四处”体系也明确：

```text
卦中动爻能生用神
```

所以：

```text
generates
```

同样拥有通用 mechanical basis。

可安全抽取：

```text
GENERATES Fact
+
valid interaction scope
→ mechanical_generation_candidate
```

但不能因为：

```text
generation
```

就预先写：

```text
support
favorable
success
```

因为：

1. source 可能被合绊 / 入墓；
2. generation 可能形成贪生而改变另一条 path；
3. current target 的题义可能不是受生即吉；
4. `世生应` 在买卖中可以表示我益于彼，并不等于“对我有利”；
5. 不同主题会把同一生克方向解释成完全不同的现实含义。

因此：

```text
controls / generates
```

可以共享：

```text
mechanical interaction skeleton
```

但不能共享：

```text
domain polarity
```

---

# 11. Six-Harmony 不应被塞进 Generic Directed Action Promotion

`Line Relation Fact` 目前把：

```text
six_harmony
```

作为 symmetric structural relation。

《增删卜易·六合章》进一步把它拆成：

```text
静而逢合 → 合起
动而逢合 → 合绊
爻与爻合 → 合好
动化回头合 → 化扶
```

并且：

```text
动爻与动爻相合
→ 得他来合我
→ 和好相助
```

这里说明 movement 不是单纯把：

```text
six_harmony
```

升级成：

```text
active six-harmony edge
```

而是会改变 relation 的**类型 / 当前状态**。

因此 six-harmony 更适合进入：

```text
Harmony Relation State Adjudication
```

而不是：

```text
Generic Directed Action Promotion
```

研究上应保留：

```text
six_harmony structural fact
↓
activity / calendar / transform context
↓
合起 / 合绊 / 合好 / 化扶 / unresolved
```

其中：

```text
合绊
```

还会反向修改另一条生克 path 的 availability。

所以：

```text
six_harmony
= relation / path-state family
≠ generic directed elemental action family
```

---

# 12. Six-Clash 也不能直接当成 Controls 的另一个名字

《增删卜易·六冲章》把：

```text
爻与爻冲
```

称为：

```text
相击 / 相杀（不同整理本有异文）
```

并把：

```text
日冲静旺爻
```

处理为：

```text
暗动
```

而《黄金策》传承进一步说：

```text
辨动静以定刑冲
动爻冲得静爻
静爻冲不得动爻
```

这说明 six-clash 确实具有：

```text
activity-sensitive disruption / trigger
```

机制。

但它与：

```text
controls
```

不是同一逻辑。

因为冲还承担：

```text
散
暗动触发
冲开
冲实
回头冲
相击
```

等不同职责。

所以当前不能写：

```text
six_clash
→ mechanical_control_candidate
```

更安全的是：

```text
six_clash structural fact
↓
clash-specific activity / target-state review
↓
disruption / trigger / release candidate
```

这属于独立 relation family。

---

# 13. Same-Element 暂不进入 Promotion

当前 neutral relation vocabulary 有：

```text
same_element
```

但本轮没有专门研究：

```text
同五行
→ 帮扶 / 竞争 / 同类
```

在不同六亲、主题与旺衰条件下是否拥有通用 action promotion。

因此：

```text
same_element
= keep structural only in v0.1
```

不得为了五类 relation 对称而补：

```text
peer action edge
```

---

# 14. 最大概念修正：Role Relation 与 Mechanical Relation 是正交的

例如：

```text
世克应
```

至少可以同时存在两个不同问题：

### 机械问题

```text
世对应的克制
当前能否在卦的生克机制中兑现？
```

### 题义问题

```text
在当前主题里
“世克应”究竟代表什么现实意义？
```

例如：

```text
诉讼
→ 我方对彼方的对抗 / 主动压制

买卖
→ 我方条件压向对方，但可能反而难得利

出行
→ 我克所往之地，可解释为所向相对通达

谒贵 / 求见
→ 世克官并不自动等于“我攻击贵人”
```

所以不能写：

```text
CONTROLS relation
→ semantic action = attack
```

也不能反过来写：

```text
topic text 没说 attack
→ mechanical control 不存在
```

正确设计必须允许：

```text
same mechanical relation
+
different role semantics
```

---

# 15. Explicit Topic Formula 的真正职责：授权现实 Initiative Meaning

前两轮已经确认：

```text
世动克应，我兴词
```

和：

```text
世动克应，己谋人
```

这类材料的价值，不只是证明：

```text
moving Shi can mechanically control Ying
```

因为通用生克章已经提供了 moving-line mechanical basis。

它们更重要的新增信息是：

```text
source = self-side actor
+
movement = initiative qualifier
+
relation direction = toward counterpart
↓
现实语义 = 我方主动兴讼 / 谋人
```

因此：

```text
Explicit Topic Formula
```

最适合授权：

```text
Initiative / Role-Behavior Semantic Promotion
```

而不是作为所有 mechanical action 的唯一许可证。

这正是本轮对上一轮研究的主要 refinement。

---

# 16. 没有 Explicit Topic Formula 时，应该怎样处理

必须分两问。

## 16.1 Mechanical 问题

若：

```text
source / target scope 已解决
+
relation = controls / generates
+
传统通用机械条件满足
```

即使没有主题专门句，仍可进入：

```text
mechanical interaction candidate
```

所以不能一律：

```text
no topic formula
→ role-only
```

## 16.2 Real-World Initiative 问题

如果没有：

```text
explicit topic formula
```

或已经审核过的 domain-specific structural analogue，
则应保持：

```text
initiative_semantic = unresolved / not promoted
```

例如事业：

```text
moving Shi controls 官鬼
```

即使机械上可能存在五行克制，
也不能自动解释为：

```text
“我主动压制职位 / 上司 / 工作”
```

考试同理。

这就是：

```text
mechanical yes
semantic initiative unresolved
```

可以合法并存。

---

# 17. Marriage 证明第三类 Relation Class 必须保留

《易隐·妻妾》：

```text
世动 → 夫凌妻
应动 → 妻欺夫
世应俱动 → 常争斗
```

这里 movement 已经得到非常明确的现实行为语义。

但是文本并不要求：

```text
世 controls 应
```

才产生：

```text
夫凌妻
```

因此不能强迫这类材料进入：

```text
Elemental Directed Interaction
```

更合理的是第三类：

```text
ACTIVITY_QUALIFIED_ROLE_BEHAVIOR
```

其输入可以是：

```text
Represented Role
+
Movement
+
Topic Rule
```

而不需要：

```text
controls / generates
```

这再次证明：

```text
Action / Behavior Semantics
```

不应完全寄生在 elemental graph 上。

---

# 18. Travel Execution 必须明确排除出 Interaction Promotion

前一轮已确认自占出行：

```text
世 = 出行者
```

同时：

```text
世动
```

首先表达：

```text
动身
行动
执行行程
进退
```

这属于：

```text
EXECUTION_STATE
```

而不是：

```text
Shi → destination active edge
```

所以未来 promotion system 看到：

```text
moving Shi
```

不能只问：

```text
它和哪个 target 有五行关系？
```

必须先问：

```text
当前 topic 给这个 movement 的语义职责是什么？
```

如果已经被：

```text
travel execution rule
```

消费为：

```text
execution state
```

就不能未经独立 traditional relation rule 再把 movement 复制成：

```text
outward initiative edge
```

否则产生双重含义与伪 graph。

---

# 19. Lost Property 的 Object Movement 也必须排除

失物主题稳定存在：

```text
用神发动
→ displacement / 移动 / 转移 Evidence
```

这里：

```text
moving object
```

描述的是：

```text
物本体当前状态
```

不是：

```text
物主动作用某人
```

也不是：

```text
世主动把物找回
```

所以：

```text
OBJECT_MOVEMENT_STATE
```

必须与：

```text
MECHANICAL_INTERACTION_CANDIDATE
```

分开。

同一个 line 可以同时在别的关系中有 mechanical relation，但“它动了”本身不能成为对任意 target 发边的充分条件。

---

# 20. Person Return 展示 Movement + Relation 的复合公式

《断易天机》行人类有：

```text
应动克世即来
世动克应未来
```

以及：

```text
若世应俱静
但看生克制化
```

这组材料极有价值，因为它同时说明：

```text
movement
```

不是所有 role relation 的必要条件。

当两边都静时：

```text
生克制化
```

仍然进入传统判断。

但当一方发动时：

```text
movement + direction
```

又会产生更具体的：

```text
来 / 不来 / 去向
```

语义。

因此最准确抽象不是：

```text
moving turns relation on
```

而是：

```text
movement may change the semantic / realization class of an existing relation
```

---

# 21. Promotion 不应理解成“一次升级”，而应理解成二维状态空间

本轮建议研究上放弃：

```text
STATIC_RELATION
↓
ACTIVE_RELATION
↓
EFFECTIVE_RELATION
```

这种一维梯子。

更准确的是二维：

```text
Mechanical Axis

structural
→ candidate
→ direct / bound / diverted / constrained / deferred
→ realized state
```

与：

```text
Semantic Axis

unassigned
→ role relation
→ activity behavior / initiative / execution / object state
→ domain meaning
```

两轴可以组合，但不要求每一步一一对应。

例如：

### 婚姻世动

```text
Mechanical Axis
= may remain unpromoted

Semantic Axis
= activity-qualified spouse behavior
```

### 动忌神克用神

```text
Mechanical Axis
= control candidate

Semantic Axis
= no human initiative required
```

### 诉讼世动克应

```text
Mechanical Axis
= control candidate

Semantic Axis
= self-side initiative
```

### 出行世动

```text
Mechanical Axis
= no target edge from movement alone

Semantic Axis
= execution state
```

这四类若只有一个 boolean 根本无法表达。

---

# 22. Interaction Scope Gate 必须位于 Mechanical Candidate 之前

通用生克规则存在，不等于要构造：

```text
6 × 5
```

全图有向 action network。

当前最安全的 scope 是：

```text
Resolved Observation Target
+
Requested Source Candidate(s)
```

或：

```text
Topic / Role rule explicitly requests this pair
```

然后才调用：

```text
neutral Line Relation Fact
```

判断：

```text
generates / controls / harmony / clash
```

这样能同时避免两个错误：

### 错误 A

```text
只因为五行关系存在
→ 全卦自动生成大量无职责 edge
```

### 错误 B

```text
没有 topic-specific action sentence
→ 连通用用神生克都禁止
```

因此：

```text
Interaction Scope
```

与：

```text
Topic Initiative Semantics
```

也不是同一个 gate。

---

# 23. Changed Line 继续执行局部 topology，不受本轮放宽影响

《增删卜易·动变生克冲合》已经明确：

```text
变爻
→ 只回头作用其本位动爻
```

不是：

```text
changed line
→ 任意本卦 line
```

所以本轮承认：

```text
generic mechanical interaction
```

绝不能被误读成：

```text
所有 node type 均可自由连边
```

先决顺序仍然是：

```text
Node Topology Legality
↓
Interaction Scope
↓
Relation Type
↓
Mechanical Qualification
```

因此 transformed line 的：

```text
回头生
回头克
回头合
回头冲
```

继续属于 local transform feedback。

---

# 24. Path Adjudication 仍位于 Promotion 之后、Effectiveness 之前

本轮没有推翻此前 Directed Interaction Path。

正确链是：

```text
Structural Relation
↓
Mechanical Candidate
↓
Path Qualification
↓
Effectiveness
```

Path 可以包含：

```text
source_bound
source_confined
target_confined
source_suppressed_by_third_party
source_reinforced_by_third_party
path_diverted_by_generation
path_diverted_by_harmony
continuous_generation
target_rescued
transform_feedback_local
```

因此：

```text
promotion
```

只表示：

```text
值得进入作用审查
```

不是：

```text
已经兑现
```

这一区别必须保留。

---

# 25. Four-Channel Synthesis 位于更下游，不能反向决定 Promotion

前一轮已经确认《增删卜易》存在 source-explicit：

```text
四处生克冲合
```

聚合。

但顺序应当是：

```text
各 channel 是否合法
各 channel 当前作用状态如何
↓
再进入 bounded synthesis
```

不能反过来：

```text
需要凑齐四处
→ 先把所有结构关系都 promote 成 active vote
```

尤其：

```text
卦中动爻 channel
```

内部可能有多个 moving lines 方向相反。

其 reducer 仍未解决。

所以本轮不建立：

```text
moving line count
```

也不建立：

```text
promoted edge count
```

---

# 26. Group Actor：只能部分复用 Promotion Contract

三合研究已经确认：

```text
valid + manifest coalition
→ 可以成为 group actor
```

并存在：

```text
coalition → 世
coalition → 应
coalition → coalition
```

传统定向结构。

本轮可以明确：

## 26.1 可以复用的部分

一旦：

```text
group actor identity valid
+
role-resolved target 已确定
```

则：

```text
source condition
target condition
path modifier
third-party intervention
temporal state
```

这套 Effectiveness 骨架与 line actor 是同构的。

因此没有必要另造：

```text
completely separate group-effectiveness philosophy
```

## 26.2 不能直接复用的部分

line actor 的：

```text
moving / static
```

不能直接替代 coalition 的：

```text
formation
manifestation
coalition condition
```

同样：

```text
one moving constituent
```

不能自动使整个 coalition 获得任意 outward edge。

所以 group actor 必须先通过自己的：

```text
Formation / Manifestation / Role Direction
```

gate。

结论：

```text
Effectiveness skeleton
= partially reusable

line-level activity promotion gate
= not directly reusable
```

---

# 27. Shi-Containing Coalition 的争议因此更容易定位

WHY / ZCB 对：

```text
Shi-containing coalition outward action
```

存在真实 scope / policy difference。

本轮之后不应再把问题问成：

```text
coalition 有没有五行关系？
```

这个关系当然可以算出。

真正争议是：

```text
当前 represented role
+
analysis layer
+
school policy
```

是否允许：

```text
该 coalition 对 external target
进入 role-resolved directed interaction review
```

即冲突位于：

```text
Interaction Scope / Role Direction Gate
```

而不是：

```text
五行关系计算层
```

这是一个重要定位修正。

---

# 28. MOD-ZCB 应作为 Perspective + Layer Adapter

现有朱辰彬材料已经明确：

```text
self-affair + 吉凶判断层
→ moving Shi 不参加外部连动
→ 只趋向自己的变爻
```

同时：

```text
self-affair + 细节层
→ 世可作用旁爻
```

以及：

```text
代占 / nonself
→ 世可恢复普通连动资格
```

所以 ZCB policy 最适合放在：

```text
Role / Perspective / Analysis-Layer Scope Adapter
```

而不是改写底层：

```text
CONTROLS / GENERATES structural facts
```

也不应改写通用：

```text
moving line can affect use-god
```

为完全不存在。

更准确是：

```text
Shared Mechanics
↓
ZCB Scope Adapter
↓
决定当前分析层是否允许 Shi source 进入 outward review
```

这样既保存其体系，也不把它伪装成全古典 universal rule。

---

# 29. MOD-WHY 应作为 Broader Direction / Interaction Adapter

王虎应体系存在比 ZCB 更宽的：

```text
Shi-containing coalition → external role
```

实际案例使用。

因此 WHY 也不应重写底层五行 Fact。

它更适合作为：

```text
broader role-direction / interaction-scope adapter
```

即：

```text
Shared Classical Mechanics
↓
MOD-WHY Direction Policy
↓
broader candidate pairs may enter effectiveness review
```

当前不能说：

```text
WHY = shared classical core
```

也不能说：

```text
ZCB = shared classical core
```

二者是在 shared mechanics 上采用不同的现代 scope policy。

---

# 30. Shared Classical Kernel v0.1

本轮能够抽出的 shared research kernel 如下。

## K1 · Structural Relation Is Neutral

```text
A controls / generates / harmonizes / clashes B
```

先只作为 relation fact。

## K2 · Interaction Scope Is Separate

不是所有 pair 都进入作用审查。

必须有：

```text
resolved observation responsibility
```

或：

```text
explicit topic / role pair
```

## K3 · Controls / Generates Have Generic Mechanical Basis

```text
moving source → target
```

有传统通用依据；

```text
旺 static source → 休囚 target
```

也有传统直接依据。

## K4 · Movement Is Strong but Non-Binary

```text
movement
```

可改变作用优先与可用性，
但不是所有 mechanical influence 的必要条件，
也不是 realized effect 的充分条件。

## K5 · Path / Target Can Block Realization

```text
合绊
入墓
贪生贪合
第三方制化
target movement / resistance
```

均可改变作用兑现。

## K6 · Topic Formula Adds Semantic Meaning

例如：

```text
世动克应，我兴词
```

授权的是：

```text
self-side initiative semantics
```

不能扩张成 universal graph rule。

## K7 · Behavior / Execution / Object Movement Are Separate Classes

```text
婚姻世动
出行世动
失物用神动
```

不能强制进入同一 directed elemental edge 模型。

## K8 · Harmony / Clash Are Typed Relation Families

```text
six_harmony
```

优先进入：

```text
合起 / 合绊 / 合好 / 化扶
```

```text
six_clash
```

优先进入：

```text
相击 / 散 / 暗动 / 冲开 / 回头冲
```

等 typed review。

## K9 · Mechanical Effect Does Not Contain Domain Polarity

```text
生 / 克有效
```

仍不能自动生成：

```text
吉 / 凶
成功 / 失败
```

## K10 · Group Actor Reuses Only Downstream Skeleton

Group actor 仍需要自己的：

```text
formation / manifestation / role direction
```

之后才能复用 target-relative effectiveness。

---

# 31. Promotion Decision Matrix v0.1

| 输入关系 / 状态 | 是否可进入 generic mechanical candidate | 是否可直接生成现实 initiative | 当前去向 |
|---|---:|---:|---|
| moving A controls resolved target B | `yes, candidate` | `no` | Effectiveness review |
| moving A generates resolved target B | `yes, candidate` | `no` | Effectiveness review |
|旺 static A controls休囚 target B | `yes, classical conditional candidate` | `no` | Relative-force review |
|旺 static A generates休囚 target B | `yes, classical conditional candidate` | `no` | Relative-force review |
| Shi moving + controls Ying + explicit litigation formula | `yes` | `yes, topic-specific` | Mechanical + initiative branches |
| Shi controls Ying, no explicit initiative formula | `mechanical may be reviewable if scope resolved` | `no / unresolved` | keep semantic relation separate |
| Marriage Shi moving | `not from movement alone` | `behavior yes` | Activity-role behavior |
| Travel Shi moving | `not from movement alone` | `no outward initiative` | Execution state |
| Lost-object line moving | `not from movement alone` | `no human initiative` | Object movement state |
| six-harmony pair | `not generic controls-style` | `no` | Harmony state review |
| six-clash pair | `not generic controls-style` | `no` | Clash trigger/disruption review |
| same-element pair | `not reviewed` | `no` | structural only |
| valid coalition controls role-resolved target | `potential, after group gates` | `topic-dependent` | Group effectiveness |

这张表是 research matrix，不是 runtime contract。

---

# 32. 对 `Action Eligibility` 术语本身的修正建议

本轮之后，`Action Eligibility` 若继续使用，应至少明确是哪一种：

```text
mechanicalInteractionEligibility
roleInitiativeEligibility
activityBehaviorEligibility
executionStateEligibility
groupDirectedEligibility
```

否则单写：

```text
actionEligibility
```

很容易重新把所有问题揉回一个 boolean。

更保守的研究命名是：

```text
Interaction Qualification
```

专门用于 mechanical branch；

另设：

```text
Role Semantic Qualification
```

处理现实 actor meaning。

本轮不决定最终代码命名。

---

# 33. 对当前复合观察规范的兼容性

现有《龟甲 · 六爻复合观察与取用规则规范 v0.2》已经区分：

```text
Primary Subject
Role Observation
Domain Observation
```

并明确：

```text
主事用爻
```

回答：

```text
事项本身如何
```

而：

```text
世应
```

回答：

```text
谁是己方、谁是彼方，以及双方如何作用
```

本轮与这一架构兼容，但进一步增加一个重要限制：

```text
“双方如何作用”
```

不能理解成：

```text
把所有 Shi / Ying 的五行关系都自动转换成 active elemental graph
```

而应该拆成：

```text
role-semantic relation
+
mechanical qualification
+
initiative / activity semantics
```

三层分别审查。

---

# 34. Provenance / Independence Audit

本轮主要传统证据链：

```text
SRC-ZSBY / TRAD-ZSBY
→ 动静生克
→ 动爻对用神生克冲合
→ 六合 / 六冲 typed states

SRC-DYTJ / TRAD-DYTJ
→ 旺衰、动静与克制
→ 词讼 activity-sensitive realization
→ 行人世应动静方向

SRC-HJC / SRC-BSQS
→ TRAD-HJC-TRANSMISSION
→ 贪生贪合
→ 动静定刑冲
→ 合绊 / 入墓等 path constraints

SRC-YY / TRAD-YY
→ 婚姻 activity-role behavior
→ 行人 moving relation compatible witness
```

注意：

```text
黄金策
卜筮全书相关收录
卜筮正宗相关注解
```

继续按具体 Evidence scope 处理传承重叠，不能按书名多算。

《断易天机》与《卜筮全书》某些天玄赋式公式也继续执行：

```text
shared_or_inherited_formula_requires_evidence_scope_review
```

现代：

```text
MOD-WHY
MOD-ZCB
```

仍分别按作者体系计，不因多本著作增加 independence vote。

---

# 35. Explicit Non-Inferences

本轮明确禁止：

```text
moving = mechanical action 必要条件

moving = mechanical action 充分条件

static = 永远不能生克

moving source = 一定克得 / 生得 target

relation = action

action candidate = realized effect

realized effect = domain outcome

controls = adverse

generates = favorable

世克应 = 我主动攻击他

世动 = 自动向所有 observation targets 发边

没有 topic-specific 句子 = 不存在任何 mechanical interaction

有 generic mechanical rule = 所有 pair 都应生成 edge

六爻 6×5 全图 = 传统默认 graph

six-harmony = active support edge

six-clash = controls 的另一个名字

same-element = peer support edge

婚姻世动 = 必须存在 elemental edge

出行世动 = Shi 对目的地作用

失物用神动 = 物主动作用其他角色

诉讼世动克应 = 所有 self-affair Shi 都可 outward

ZCB good/bad sink policy = shared classical universal rule

WHY broad policy = shared classical universal rule

valid coalition = 可向任意 target 发边

line-level movement gate = coalition manifestation gate

四处生克冲合 = 每条 relation 都是一个投票
```

---

# 36. Research Readiness Matrix

| 问题 | 状态 |
|---|---|
| Role relation 与 mechanical relation 是否同一层 | `no` |
| 单一 promotion pipeline 是否成立 | `no` |
| 通用机械生克是否有传统依据 | `yes` |
| 通用 mechanical candidate 是否只限 moving | `no` |
| movement 是否必要条件 | `no` |
| movement 是否充分条件 | `no` |
| movement 是否重要 action qualifier | `yes` |
| moving controls target 是否可进入 candidate | `yes, scoped` |
| moving generates target 是否可进入 candidate | `yes, scoped` |
| static旺→休囚是否可发生机械生克 | `yes, classical direct` |
| 所有静爻关系是否都有效 | `no` |
| explicit topic formula 是否是 mechanical effect 唯一许可 | `no` |
| explicit topic formula 是否可授权 initiative semantics | `yes` |
| absence of topic formula 时 initiative 是否应保持 unresolved | `yes` |
| marriage 是否需要 activity-role third class | `yes` |
| travel execution 是否应从 generic action graph 排除 | `yes` |
| object movement 是否应从 generic action graph 排除 | `yes` |
| six-harmony 是否适合 generic directed action | `no` |
| six-clash 是否适合直接按 controls 处理 | `no` |
| same-element promotion 是否已研究 | `no` |
| group actor 是否可复用 effectiveness skeleton | `partially yes` |
| group actor 是否可复用 line movement gate | `no` |
| WHY / ZCB 是否应进入 shared base relation facts | `no` |
| WHY / ZCB 是否适合作为 scope / direction adapter | `yes` |
| executable Action Eligibility Resolver 是否 ready | `no` |
| Formal Expansion 是否授权 | `no` |

---

# 37. Final Decision

```text
Role-Semantic Relation → Action Eligibility Promotion v0.1
= research complete
```

但最终不是得到一个统一 promotion 算法，而是确认：

```text
单一 promotion 概念本身需要拆分
```

正式研究结论：

```text
Structural Relation Fact
≠ Mechanical Interaction Candidate

Mechanical Interaction Candidate
≠ Realized Effect

Role-Semantic Relation
≠ Initiative Semantic

Initiative Semantic
≠ Mechanical Effect

Mechanical Effect
≠ Domain Outcome
```

其中：

```text
controls / generates
```

存在跨主题的 shared classical mechanical basis；

```text
movement
```

既不是所有 mechanical effect 的必要条件，
也不是 realized effect 的充分条件，
但确实是强 action / precedence qualifier。

而：

```text
世动克应，我兴词
```

这类 topic formula 的新增价值在于：

```text
赋予机械方向以现实 actor / initiative 语义
```

不是负责创造所有机械五行作用。

因此上一轮的：

```text
Shared Core
→ only explicit topic-authorized promotion
```

必须改写为：

```text
Shared Core
├─ scoped generic mechanical interaction for controls / generates
├─ relation-type-specific harmony / clash handling
├─ path / target / temporal effectiveness
└─ no universal initiative meaning

Topic / Role Adapter
├─ explicit initiative semantics
├─ activity-role behavior
├─ execution state
└─ object / domain state

MOD-WHY
→ broader direction / interaction-scope adapter

MOD-ZCB
→ perspective + analysis-layer scope adapter
```

当前：

```text
Executable Resolver
= not ready

Formal Expansion
= not authorized
```

---

# 38. Recommended Next Research

本轮之后，最大的剩余共享瓶颈已经从：

```text
“relation 能不能 promote”
```

转成：

```text
Static Mechanical Interaction / Relative Force Adjudication Review v0.1
```

原因是本轮确认：

```text
静爻并非永远 passive
```

而当前 shared Directed Interaction 研究此前主要从：

```text
active / moving source
```

进入。

下一步应只处理：

1. `旺 static → 休囚 static` 的传统条件边界；
2. 两静俱旺 / 两静俱衰如何处理；
3. 静 source 与 moving target 的不对称是否能形成 shared rule；
4. moving source vs旺 static target 的边界；
5. “两爻俱静，以旺为先；有动，以动为急”与《增删卜易》动静章如何交叉归一；
6. 日月生扶导致 static source 旺时是否与本月旺相完全同类；
7. static mechanical effect 如何进入四处 / multi-moving synthesis 而不制造第五处、第六处；
8. static mechanical effect 与 domain role relation 如何继续分层。

若这一步不能形成稳定裁决，合法状态应为：

```text
static mechanical effect
= traditionally real

exact shared relative-force reducer
= unresolved
```

而不是退回：

```text
static lines never act
```

也不是引入数值 strength score。