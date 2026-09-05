# 龟甲 · 六爻 Interaction Precedence / Multi-Moving Adjudication Review v0.1

日期：2026-09-06

状态：`research_complete_design_only_partial_precedence_supported_no_universal_total_order`

范围：六爻共享研究层 / 多动爻、有向作用、日月、回头生克、制化与三合 group interaction 的裁决先后。

上游：

- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `liuyao-directed-interaction-path-control-transformation-review-v0.1.md`
- `liuyao-line-effectiveness-synthesis-readiness-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `liuyao-line-relation-fact-provenance-review-v0.1.md`
- `liuyao-move-transform-fact-provenance-review-v0.1.md`
- `shared-line-pair-fact-provider-research-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`

> 本研究只回答：当同一 reading 中同时存在月建、日辰、多个动爻、回头变爻、合绊、墓、第三爻制化、贪生贪合以及三合 group 等多种作用时，传统材料是否支持一套稳定的“先看什么、后看什么”的裁决顺序。v0.1 不建立 runtime resolver，不建立数值评分，不执行 Formal Expansion，不修改 current-22、Rule Registry、Time Engine、训练数据或 Candidate 开发线。

---

# 1. Executive Decision

本轮结论不是：

```text
已经找到统一的六爻 precedence table
```

而是：

```text
传统材料支持若干明确的局部优先规则
+
若干有边界的多来源综合规则
+
若干 group-level 替代表达

但不支持：

一个跨所有状态、所有来源、所有主题的 total order
```

因此当前最安全的总体结构是：

```text
Topology / Eligibility
↓
Typed Path Gates
↓
Action Class / Activity Qualification
↓
Local Precedence Rules
↓
Bounded Traditional Synthesis
↓
Group-Level Adjudication（若合法成局）
↓
Unresolved if still mixed
```

而不是：

```text
MONTH > DAY > MOVING > TRANSFORM > STATIC
```

或：

```text
每个状态换成 +1/-1 后求和
```

分类：

```text
partial_precedence = supported
universal_total_order = insufficient_evidence
```

---

# 2. 本轮首先修正一条旧的过宽禁令：不是“传统绝不计数”

此前 Shared Line Effectiveness / Path 研究为避免现代化 hidden score，反复规定：

```text
status tag count = forbidden
support edge count = forbidden
```

这个防护方向仍然成立，但表述必须收窄。

《增删卜易》本身明确给出一套有限的“四处生克冲合”综合法。其四处是：

```text
1. 月建对用神
2. 日辰对用神
3. 卦中动爻对用神
4. 用神本位发动后的变爻回头作用
```

并明确讨论：

```text
四处皆生合
三生一克
两生两克
三克一生
四处皆克
```

所以不能再说：

```text
传统六爻没有任何 counting / majority-like synthesis
```

更准确的研究边界应改成：

```text
A. 禁止对程序产生的任意 atomic status tags 做现代计数；
B. 禁止把同源、重叠、派生状态重复计票；
C. 允许保留传统文本自己明示的、有限集合内的综合结构；
D. 传统有限综合也不是现代线性加权，不能改写成隐藏 score。
```

因此旧文档中的：

```text
no counting
```

以后应理解为：

```text
no arbitrary tag counting
no invented numerical scoring
```

而不是：

```text
reject all source-explicit bounded aggregation
```

这是本轮最重要的方法论修正。

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 卷一 / 四处生克冲合总论
```

分类：

```text
classical_direct_bounded_multi_channel_synthesis
```

---

# 3. “四处”不是四个普通 tag，而是四类作用来源

这一点对未来任何实现尤其重要。

《增删卜易》所谓“四处”，不是：

```text
MONTH_GENERATE
DAY_GENERATE
MOVING_A_GENERATE
MOVING_B_GENERATE
```

这样的四条程序事实。

它明确把：

```text
卦中之动爻
```

作为第三“处”。同一示例里甚至同时举出多个不同动爻可以对用神产生：

```text
生
克
冲
```

这产生一个尚未解决的内部问题：

```text
当多个动爻在同一个“卦中动爻”通道内方向互异时，
这个第三处如何先行内部裁决？
```

现有文本不能让我们安全地假定：

```text
每一条动爻 = 一处
```

也不能假定：

```text
所有动爻先各算一票，再把总票数带入四处规则
```

因此当前只能确认：

```text
four-channel synthesis exists
```

不能确认：

```text
multi-moving internal channel reducer is solved
```

这也是本轮仍不允许 runtime synthesis 的重要原因。

---

# 4. 四处综合本身不是简单多数票

《增删卜易》的结构比：

```text
supportVotes > adverseVotes
```

复杂。

其明确逻辑包括：

```text
四处全生合
→ 强支持

三生一克
→ 仍可吉断

两生两克
→ 不直接平票
→ 转看实际生方 / 克方的旺衰

三克一生
→ 也不是直接判负
→ 若唯一生方旺相，仍可构成克处逢生
→ 若该生方休囚，则有生之名而无生之实
```

所以传统结构更像：

```text
bounded channel pattern
+
actor qualification / 旺衰
+
exception / rescue logic
```

而不是：

```text
+1 / -1
```

特别是：

```text
3 adverse : 1 support
```

仍可能因这一条 support 的实际有效性而改变结论。

因此任何未来模型都不能把“四处”翻译成简单多数投票器。

---

# 5. 《克处逢生》证明“救应”与“取消原克”不同

《增删卜易·克处逢生章》给出的定义是：

```text
某处受克
+
另处得生
→ 克处逢生
```

其例中：

```text
月建克用
+
日辰生用
+
动爻又生用
```

最终形成救助。

这里的结构不是：

```text
月建之克不存在
```

而是：

```text
adverse channel remains
+
rescue channels also remain
↓
综合判断改变
```

因此上一轮 Path Review 对：

```text
target_rescued
≠ source_suppressed
```

的区分得到进一步传统支持。

研究职责应继续分开：

```text
source action removed / redirected
vs
target receives countervailing support
```

---

# 6. 月建与日辰：拓扑地位高，但不存在稳定的“月 > 日”或“日 > 月”

## 6.1 日月对爻具有明显非对称拓扑地位

《增删卜易·动变生克冲合章》明确：

```text
日月可以作用：
动爻
静爻
飞爻
伏爻
变爻

而诸爻不能反向伤日月
```

因此至少有一个稳定的结构非对称：

```text
calendar → line
```

是合法作用方向；

```text
line → calendar
```

不是对等的普通反向作用。

这支持：

```text
calendar has topological authority over line nodes
```

但这不等于：

```text
calendar contact always wins final outcome
```

因为同一体系又存在克处逢生、寡不敌众、动爻救应等综合结构。

## 6.2 日辰与月建“同功”

《增删卜易·日辰章》明确称：

```text
日辰与月建同功
```

这直接反对把：

```text
月建 > 日辰
```

或：

```text
日辰 > 月建
```

注册为全局常量。

## 6.3 《卜筮正宗·十八问》进一步给出月日相反时“匹也”

其第一问追问：

```text
月克日生
或
日克月生
如何？
```

回答是：

```text
匹也
```

然后继续看卦中发动之爻究竟生还是克。

这提供一条非常直接的 local adjudication：

```text
month vs day opposite
→ no fixed winner
→ inspect additional active interaction
```

来源：

```text
SRC-BSZZ
location = 十八问答附占验 / 第一问
candidate independenceGroup = TRAD-BSZZ-INDEPENDENT
```

注意：该问答不是本轮所引用的黄金策传抄句段；在正式 Evidence 注册前仍应做 bounded provenance review，但当前可视作卜筮正宗独立问答证据候选。

---

# 7. 动 vs 静：存在较强的局部优先结构

《黄金策》传承材料明确提出：

```text
两爻俱静，以旺为先；
有动，以动为急。
```

并以“动爻急如火”解释。

这不是说：

```text
任何动爻都无条件压倒月日、空破、墓绝、回头克
```

而是说，在比较卦中爻际作用时：

```text
两边都静
→ 旺衰成为主要裁决条件

一动一静
→ movement / activity 获得不同于纯旺衰的优先资格
```

《断易天机》也保存：

```text
动爻能克安静爻
静爻不能反向按同等资格克动爻
```

说明这不是纯粹的现代解释习惯。

但由于《黄金策》《卜筮全书》相关句段属于传承簇，本研究不把多个收录本机械计作独立证据。

来源分类：

```text
SRC-HJC / SRC-BSQS
independenceGroup = TRAD-HJC-TRANSMISSION

SRC-DYTJ
independenceGroup = TRAD-DYTJ
```

当前允许结论：

```text
activity_precedence_over_static_relation
= cross_text_compatible
```

不允许：

```text
moving = globally strongest
```

---

# 8. 《增删卜易·动静生克章》进一步证明：先发生的制化会改变后续路径

该章明确举例：

```text
休囚动爻 A
→ 克旺相静爻 B

B 原本又能克静爻 C
```

由于 B 已被 A 所伤，B 对 C 的原有作用也随之受到影响。

这说明传统判断不是：

```text
先计算所有节点最终 strength
→ 再同时传播所有边
```

而存在：

```text
interaction consequence changes downstream interaction
```

所以未来若建立 graph adjudication，至少要能表达：

```text
A acts on B
↓
B's actionability toward C changes
```

这是一种局部 sequencing / causal dependency，而不是简单权重。

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 动静生克章第十四
```

---

# 9. 合绊、墓、贪生贪合属于 typed path gate，不能与旺衰并列计分

上一轮已经确认：

```text
source weak
source bound
source confined
path diverted
```

不是同一种状态。

本轮 precedence 研究进一步支持：在普通 source→target 生克真正进入综合前，应先审查它当前是否仍然是同一条路径。

## 9.1 合绊

若一个动爻因特定合而被绊住：

```text
它不是“少一分”
而是当前 action availability 发生改变
```

因此：

```text
qualified binding
```

应先于把该 source 当作普通 active adverse/support channel 参与综合。

## 9.2 贪生 / 贪合

《黄金策》传承材料明确存在：

```text
贪生贪合
→ 原刑冲克害路径可被忘却 / 改向
```

所以一条基础：

```text
A controls B
```

若已经被传统条件判为：

```text
A's realized path diverted to C
```

就不能一边保留 diversion，一边又把原 A→B 当作完全未修改的一票加入综合。

这属于：

```text
path qualification before aggregation
```

而不是：

```text
harmony score > control score
```

## 9.3 入墓

墓同样具有角色和条件差异：

```text
source confined
vs
target confined
```

在没有解决真假墓、冲墓、旺衰等条件之前，不能把：

```text
TOMB
```

当作固定负权重。

所以 typed path gates 必须保留原因和恢复条件。

---

# 10. 变爻回头作用：优先问题之前必须先守拓扑边界

《增删卜易·动变生克冲合章》明确规定：

```text
变爻
→ 只回头生克冲合其本位动爻
→ 不直接生克其他本卦爻

其他本卦爻
→ 也不直接生克该变爻

日月
→ 可以作用变爻
```

因此：

```text
transform feedback
```

不是一个普通全局 moving edge。

这意味着 precedence 的第 0 步必须是：

```text
validate whether the edge is traditionally legal
```

如果边本身不合法，就不存在“谁优先于谁”的问题。

未来任何算法都不得构造：

```text
original six lines + all changed lines
→ fully connected five-element graph
```

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 动变生克冲合章第十五
```

当前仍保留：

```text
cross_school_topology_consensus = not established
```

即该严格拓扑在增删体系证据明确，但本轮不声称所有传统流派完全一致。

---

# 11. 回头生克不是“变爻层级高于动爻”的普通优先级

因为变爻只对本位动爻回头作用，所以：

```text
RETURN_GENERATE
RETURN_CONTROL
RETURN_HARMONY
RETURN_CLASH
```

更准确应理解为：

```text
local transform feedback on source/target node
```

而不是：

```text
TRANSFORM > MOVING
```

这样的全局等级。

它改变的是：

```text
本位动爻自身 actionability / availability / trajectory
```

随后这个本位动爻是否还能对其他对象产生原作用，仍需结合日月、旺衰、其他动爻、合墓等审查。

因此：

```text
return effect = typed local modifier
```

而不是：

```text
return effect = universal higher-priority actor
```

---

# 12. 《卜筮正宗·十八问》证明“寡不敌众”存在，但也不是普通票数规则

第一问讨论：

```text
年月日三传克用
+
一个动爻来生
+
一个动爻又克
```

回答强调：

```text
寡不敌众
```

并结合实际生克来源继续判断。

这说明多来源共同指向同一 target 的“数量格局”确实属于传统判断材料。

但这里与《增删卜易》的“四处”并不完全同构：

```text
增删四处：
月 + 日 + 卦中动爻 + 本位变爻回头

卜筮正宗问答：
年 + 月 + 日（三传） + 卦中动爻等
```

所以：

```text
traditional multi-source aggregation exists
```

可以确认；

但：

```text
one universal fixed channel set
```

不能确认。

尤其不能把两书拼成：

```text
year + month + day + every moving line + every changed line
```

的新式总分表。

这会把两个不同文本框架错误并集。

---

# 13. 因此不能建立“Calendar > Moving”这种总序

传统材料同时支持以下命题：

```text
日月能作用诸爻，诸爻不能反伤日月
```

以及：

```text
月日相反可相匹，再看动爻
```

以及：

```text
动爻可以救月克之用
```

以及：

```text
三传助克时，一条孤立生助可能不足
```

所以最准确的理解是：

```text
Calendar has special topology / authority
```

但不是：

```text
Calendar always wins aggregation
```

它们属于两个不同维度：

```text
topological privilege
vs
final interaction synthesis
```

这一区分必须保留。

---

# 14. 三合局不是普通三条 pair edge，而是 group-level actor

《增删卜易》与《卜筮正宗》都明确处理三合成局后的整体作用。

《卜筮正宗·十八问》第四问直接称：

```text
成局者，结党也
```

也就是说，一旦满足传统成局条件，三个相关节点不再只是：

```text
A↔B
B↔C
A↔C
```

三组普通 pair relation；而可形成：

```text
group / coalition
```

并以合局后的五行属性作用于用神、世应或另一合局。

因此 group-level interaction 应作为单独 adjudication layer。

---

# 15. 三合局可以在特定语境中获得表示层优先，但不是全局“局 > 世应”

《增删卜易》两村争水案例：

```text
内卦形成木局
外卦形成金局
```

作者直接以：

```text
金局 vs 木局
```

判断彼此，并明确解释为何当时“舍世应而不用”：因为两村人众同心，内外合局比单一世应更准确地代表双方整体。

这提供一个非常重要的 precedence 类型：

```text
context-qualified group representation
may supersede ordinary pair representation
```

但其适用条件非常具体：

```text
现实对象本身是群体
+
内外卦各形成对应 group
+
group semantics 与当前问事直接一致
```

所以禁止泛化：

```text
只要见三合局
→ 永远舍世应
```

正确结论是：

```text
group representation can gain contextual priority
```

不是：

```text
group globally outranks all pair roles
```

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 三合 / 六合章，两村争水例
```

---

# 16. Group-level interaction 仍需旺衰，不因“成局”自动压倒一切

同一两村案例中：

```text
金局克木局
```

并没有直接结束判断。

作者继续比较：

```text
衰金
vs
旺木
```

最终认为衰金不足以克旺木。

这说明：

```text
group formed
```

并不等于：

```text
group relation automatically effective
```

Directed Interaction Effectiveness 的相对旺衰问题在 group level 仍然存在。

所以 group formation 只是：

```text
new actor eligibility
```

而不是：

```text
final outcome override
```

---

# 17. 三合成局文本存在版本级冲突，不能在本轮硬定 formation rule

当前可检索版本出现一个重要文本问题。

部分《增删卜易》线上版本写作：

```text
一卦之内有一爻动而合局者
```

但其他版本、古籍整理本写作：

```text
一卦之内有三爻动而合局者
```

且同一段后文又讨论：

```text
两爻动、一爻不动
```

以及：

```text
虚一待用
```

如果首句真是“一爻动”，与后文结构存在明显张力。

本轮不靠现代作者替古籍校字，因此只登记：

```text
three-harmony first-condition wording
= edition_conflicted / text-critical issue
```

在 provenance / edition normalization 完成前，不允许把：

```text
one moving line is enough
```

或：

```text
three moving lines are always required
```

任一版本直接升级成共享 runtime contract。

这不是单纯实现细节，而是当前 group precedence 的真实研究阻断。

---

# 18. “两动一静”还揭示 formation 与 manifestation 必须分开

无论采用哪个版本，传统材料都明确讨论：

```text
两爻发动
+
一爻静
```

以及：

```text
待静爻值日
待出空
待冲开合 / 墓
```

等后续应期条件。

这说明至少要区分：

```text
A. group structural eligibility
B. group current effectiveness
C. group event manifestation timing
```

不能把它们压成：

```text
threeHarmony = true / false
```

一个字段。

因此 group interaction 进入 precedence 前，也必须先完成 formation / availability adjudication。

---

# 19. 当前可以支持的 Partial Precedence，不是 Total Order

基于本轮传统证据，可形成以下研究级 partial order：

## Stage 0 · Topology / legality first

先判断：

```text
这条边在该传统体系里是否允许存在？
```

例如：

```text
变爻 → 非本位其他爻
```

在增删体系应直接排除，而不是参加优先级竞争。

## Stage 1 · Eligibility / action availability

审查：

```text
moving / dark-moving / static
void / break
qualified binding
confinement
local transform feedback
```

目标是判断 actor / path 当前是否具备作用资格，而不是先给分。

## Stage 2 · Typed path modification

审查：

```text
source bound
source confined
target confined
third-party suppression
third-party reinforcement
贪生 / 贪合 diversion
continuous generation
target rescue
```

若原路径已经被传统规则改写，就不能继续把原 pair edge 当作未修改事实参与综合。

## Stage 3 · Local action precedence

当前可明确的局部规则包括：

```text
两爻俱静 → 以旺衰为主要条件
有动与静相对 → 有动以动为急
月日相反 → 无固定月>日或日>月，至少在卜筮正宗问答中为“匹”
```

## Stage 4 · Bounded multi-source synthesis

若多个已经通过 qualification 的作用来源同时指向 target：

```text
使用来源自身传统允许的综合法
```

例如增删体系的“四处”模式。

不得把程序里的所有 atomic status 任意扩展成“票”。

## Stage 5 · Group-level adjudication

若三合等 group 经 source-specific formation rule 成立：

```text
将 group 作为 group actor 参与当前问题
```

但仍须判断：

```text
group旺衰
group与target关系
group当前availability
语境是否需要group representation
```

## Stage 6 · Preserve unresolved

若仍出现：

```text
同通道多个动爻方向冲突
多种 path modifier 并存
跨体系 channel set 不一致
group formation 文本冲突
```

当前必须允许：

```text
synthesisStatus = unresolved
```

而不是制造 hidden score。

---

# 20. 为什么这不是一个普通“优先级表”

如果硬写成：

```text
1 月建
2 日辰
3 动爻
4 变爻
5 静爻
```

会立刻与传统文本冲突：

- 日与月被明确说“同功”或“匹”；
- 动爻可以成为月日相反后的进一步裁决依据；
- 变爻只作用本位，不属于普通全局第四层；
- 合绊可能先改变动爻当前是否能发出作用；
- 三合成局后可能产生 group actor；
- 克处逢生允许多个不同层级来源共同救助；
- 同一来源框架内部仍要审旺衰、空破、合墓等有效性。

因此最接近传统结构的是：

```text
typed partial-order adjudication
```

而不是：

```text
single priority rank
```

---

# 21. Source / Provenance Matrix

| proposition | source | provenance handling | current classification |
|---|---|---|---|
| 四处生克冲合与三生一克/两生两克/三克一生 | 增删卜易 | `TRAD-ZSBY` | direct bounded synthesis |
| 克处逢生、克少生多 | 增删卜易 | `TRAD-ZSBY` | direct rescue synthesis |
| 日辰与月建同功 | 增删卜易 | `TRAD-ZSBY` | direct calendar parity structure |
| 日月可作用变爻，普通爻不可反伤日月 | 增删卜易；黄金策句意 | ZSBY direct + HJC transmission support | calendar topology asymmetry |
| 两爻俱静以旺为先，有动以动为急 | 黄金策/卜筮全书传承 | `TRAD-HJC-TRANSMISSION` | direct local precedence |
| 动爻克静爻、静爻不得同等反克动爻 | 断易天机 | `TRAD-DYTJ` | compatible activity precedence |
| 月克日生 / 日克月生为“匹” | 卜筮正宗十八问 | `TRAD-BSZZ-INDEPENDENT` candidate, final scope review pending | direct month-day tie adjudication |
| 三传克用与动爻生克的寡众判断 | 卜筮正宗十八问 | same as above | direct multi-source adjudication |
| 三合成局为“结党” | 卜筮正宗十八问 | same as above | group actor support |
| 内外合局可在两村例中舍世应 | 增删卜易 | `TRAD-ZSBY` | context-specific representational precedence |
| 三合首句“一爻动/三爻动” | 不同增删版本 | edition conflict | unresolved text-critical issue |

注意：

```text
书名数量
≠
independent evidence vote 数量
```

尤其黄金策在卜筮全书/卜筮正宗等收录与注解中出现的同段文字仍按 transmission group 去重。

---

# 22. Explicit Non-Inferences

本研究不得推出：

```text
月建永远高于日辰
日辰永远高于月建
日月永远压倒所有动爻
动爻永远压倒所有日月状态
所有动爻各算一票
所有日月 status 各算一票
四处 = 四个程序 tag
三生一克 = +2 分
两生两克 = 0 分
三克一生 = -2 分
寡不敌众 = 任意数量多数投票
旺相 = 固定 +1
休囚 = 固定 -1
合 = 固定比克优先
墓 = 永久停止作用
回头克 = 变爻全局高于本卦动爻
三合见三支 = 无条件立即成局
三合局永远高于世应
有三合局即可舍弃原 Observation Object
任何 group 都比 pair relation 高级
```

也不得直接推出任何现实主题结果：

```text
transport blocked / not blocked
journey succeeds / fails
career succeeds / fails
exam passes / fails
litigation wins / loses
lost property recovered / not recovered
```

本层只研究：

```text
多个传统作用同时存在时，哪些局部先后和综合方式有文献依据
```

---

# 23. 对旧 `no counting` 结论的正式校正口径

从本文件起，项目内相关研究应统一使用：

```text
Forbidden:
- arbitrary status-tag counting
- provenance-duplicated counting
- invented numeric scoring
- converting every structural fact into equal vote

Allowed for research:
- source-explicit bounded channel aggregation
- source-explicit 寡众 / 生多克少 structure
- 旺衰 qualification inside that source-specific rule
```

因此：

```text
no counting
```

若在旧文档中单独出现，应解释为防止现代化机械计权的 shorthand，而不能用来否定《增删卜易》自身的“四处”规则。

本文件不回改旧文档，以保留研究阶段演进痕迹；未来若形成 Shared Synthesis Contract，再统一建立 supersession / errata index。

---

# 24. 对 Directed Interaction Effectiveness 的修订

上一层：

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

本轮以后应再明确插入：

```text
Adjudication Context
```

其至少包含：

```text
source-specific topology
activity class
local precedence facts
bounded synthesis framework
possible group actor
provenance / school scope
```

因此更完整的研究结构是：

```text
Base Relation
↓
Topology / Eligibility
↓
Actionability + Target Condition
↓
Path Modification
↓
Local Precedence
↓
Source-Specific Bounded Synthesis
↓
Group-Level Adjudication if applicable
↓
Directed Interaction Effectiveness
```

但最终 synthesis 仍未准备好。

---

# 25. 对 Travel / Transport 的影响

此前：

```text
resolved transport
+
VISIBLE_MOVING source
+
source CONTROLS transport
→ transport_active_control_interaction
```

仍只允许作为 nonconclusive evidence。

本轮不能把它升级成：

```text
transport_blocking_pressure
```

因为至少还需要：

```text
1. source→transport path 是否仍合法且未被改写
2. source 当前是否被合、墓、回头作用、第三爻制化
3. transport 是否另得日月/动爻生扶
4. 多个动爻在“卦中动爻”通道内部怎样裁决
5. 当前采用哪个传统 synthesis frame
6. 是否存在合法 group-level actor
```

所以 Transport 卡点已经从：

```text
不知道是否看 source 状态
```

推进到：

```text
shared interaction synthesis 尚未完成
```

这仍然是六爻共享研究问题，不应在 Travel 内私建评分器解决。

---

# 26. 当前剩余的三个真正阻断

本轮之后，最重要的未解问题已缩小为三项。

## 26.1 Multi-moving internal adjudication

《增删卜易》把“卦中动爻”作为四处之一，但同一卦可有多个动爻同时：

```text
生 target
克 target
冲 target
合 target
互相生克制化
```

当前缺少足够明确的传统总则来把它们稳定收束成一个 channel result。

状态：

```text
insufficient_evidence_for_generic_reducer
```

## 26.2 Three-Harmony formation text normalization

“一爻动 / 三爻动”的版本冲突必须先做文本级 normalization。

状态：

```text
edition_conflicted
```

## 26.3 Cross-source synthesis frame

增删“四处”与卜筮正宗“三传+动爻”不完全同构。

状态：

```text
school_or_source_specific_synthesis_scope
```

因此当前不应创建：

```text
UniversalLiuYaoInteractionAggregator
```

---

# 27. Recommended Next Research

本轮完成后，下一项优先级最高的不是继续扩展 Travel，而是先解决 group 分支的文本与形成条件：

```text
Three-Harmony Coalition Formation & Effectiveness Review v0.1
```

原因：

1. 三合已经被证明确实可能成为 group-level actor；
2. 它甚至可能在特定语境替代 ordinary pair representation；
3. 但当前首条 formation 文本存在版本冲突；
4. formation / current effectiveness / manifestation timing 尚未完全拆开；
5. 不解决这一层，任何 Multi-Moving precedence 都会在 group case 中缺失一整个节点类型。

该研究应重点处理：

```text
三爻齐动
两动一静 / 虚一待用
明动 + 暗动
空 / 破
合住
入墓
日月入局
动变成局
内外卦分别成局
group旺衰
group vs group
group vs target
formation vs manifestation
版本“一爻/三爻”校勘
```

在这一层完成前，不建立 group runtime fact 或 precedence resolver。

---

# 28. Final Decision

```text
Interaction Precedence / Multi-Moving Adjudication v0.1
= research complete

universal total precedence order
= rejected / unsupported

typed partial precedence
= supported

calendar topology asymmetry
= supported

month > day or day > month
= unsupported

movement priority over pure static relation
= supported in qualified contexts

path qualification before ordinary aggregation
= supported

traditional bounded multi-channel aggregation
= explicitly supported

arbitrary status-tag counting
= still forbidden

four-channel generic runtime reducer
= not ready

multi-moving internal reducer
= not ready

group-level actor
= supported in principle

three-harmony formation contract
= blocked by condition complexity + edition conflict

Formal Expansion
= not authorized
```

下一步：

```text
Three-Harmony Coalition Formation & Effectiveness Review v0.1
```

继续保持 research-only。