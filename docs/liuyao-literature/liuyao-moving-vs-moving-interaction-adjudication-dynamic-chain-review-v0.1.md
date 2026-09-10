# 龟甲 · 六爻 Moving-vs-Moving Interaction Adjudication & Dynamic Chain Review v0.1

日期：2026-09-10

状态：`research_complete_design_only_local_dynamic_chain_rules_supported_global_moving_reducer_not_ready`

范围：六爻共享研究层 / 多动爻之间的生克制化、第三爻制 source、第三爻助 source、接续相生、贪生忘克、贪合忘克、连续相克、局部因果顺序、多个动态 component 如何进入“卦中动爻”通道，以及王虎应 / 朱辰彬现代横向检验。

研究基线：

```text
branch = liuyao-semantic-v013-core
observed HEAD before write = a7885bdcf50b2f1cece1ba19bc9ae67ea4b7e007
```

该 HEAD 属并行 Candidate v0.5 semantic revision 线；本研究不修改、评价或重新打开该 development / design 结论。

上游：

- `liuyao-static-mechanical-interaction-relative-force-adjudication-review-v0.1.md`
- `liuyao-role-semantic-relation-action-eligibility-promotion-review-v0.1.md`
- `liuyao-directed-interaction-path-control-transformation-review-v0.1.md`
- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `liuyao-interaction-precedence-multi-moving-adjudication-review-v0.1.md`
- `liuyao-three-harmony-coalition-effectiveness-group-actor-target-review-v0.1.md`
- `liuyao-three-harmony-coalition-membership-role-sensitive-directionality-review-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `liuyao-line-relation-fact-provenance-review-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`
- `龟甲 · 六爻复合观察与取用规则规范 v0.2（草案）`

> 本研究只回答共享机械层中的“多动爻怎样彼此改变作用路径”。它不建立可执行 graph reducer，不修改 Rule Registry、Time Engine、current-22、Candidate、Semantic runtime、训练 / calibration / blind data，也不把多动爻结果直接翻译为具体主题吉凶。

---

# 1. Executive Decision

本轮最大的结论不是：

```text
已经找到多动爻统一计算顺序
```

而是：

```text
传统六爻明确支持局部动态链与路径改写
+
现代主要作者对“先内部整合，再作用目标”的方向高度相容

但

传统没有给出一个足以覆盖任意多动、分叉、循环、多目标的通用 reducer
```

因此应该区分：

```text
A. Local Dynamic Chain Rule
   可由传统文本直接支持的局部三节点 / 连续作用结构

B. Global Moving Network Reducer
   把任意数量动爻一次性综合成唯一最终输出
```

当前状态：

```text
local_dynamic_chain_rules = strongly_supported
moving_to_moving_interaction = classically_supported
third_party_suppression = strongly_supported
third_party_reinforcement = strongly_supported
generation_path_redirection = strongly_supported
continuous_generation = strongly_supported
harmony_path_redirection = supported_but_exact_mechanism_contextual
moving_moving_before_static_as_universal_classical_scheduler = not_proven
modern_moving_internal_first_policy = cross_author_compatible
arbitrary_cancellation = rejected
multi_component_internal_reducer = partially_solved_only
moving_channel_single_final_vote = not_ready
Formal Expansion = not_authorized
```

---

# 2. 本轮首先做一个 provenance 修正

多个现代网页把《碎金赋》原文与“虎易评注”连续排版，很容易造成错误印象：

```text
“动爻和动爻之间发生的生克，先于和静爻发生的生克”
```

看起来像古籍原文。

本轮重新核对后必须明确：

```text
这一句属于王虎应的现代归纳 / 评注
不是《碎金赋》原赋原句
```

同样，现代常见的六条整理：

```text
1. 生用之动爻再得生 → 生力增
2. 生用之动爻被另一动爻克 → 生力受损
3. 克用之动爻再得生 → 克力增
4. 克用之动爻被另一动爻克 → 克力减
5. 克用之动爻转而生另一动爻 → 贪生忘克
6. 克用之动爻与另一动爻相合 → 贪合忘克
```

是现代系统化。

其中第 6 条王虎应自己还明确说明：

```text
“此赋没有说，补充一下”
```

因此本研究禁止：

```text
现代评注
→ 倒写成古籍逐条算法
```

正确处理是：

```text
古典原赋 / 传统注解
→ 证明若干局部制化结构真实存在

MOD-WHY
→ 对这些结构做明确六类现代系统化
```

这条 provenance 修正也意味着：

```text
moving-moving always before moving-static
```

当前不能标成：

```text
classical_direct_universal_order
```

只能标：

```text
classically_compatible_local_structure
+
modern_cross_author_systematization
```

---

# 3. Classical Core A：《碎金赋》证明 moving-to-moving 不是现代发明

《碎金赋》传承中有一整组相互制化公式。

典型包括：

```text
子动生财，不宜父摆
兄动克财，子动能解

财动生鬼，切忌兄摇
子动克鬼，财动能消

父动生兄，忌财相克
鬼动克兄，父动能泄

鬼动生父，忌子交重
财动克父，鬼动能中
```

这些结构共同证明：

```text
动爻 A 对 target T 的原作用
```

会因为：

```text
另一个动爻 B 对 A
或
A 对 B
```

的关系而改变。

所以：

```text
moving-to-moving interaction
```

是传统真实机械层，不是现代 graph abstraction。

但 provenance 仍要谨慎：

```text
SRC-DYTJ
SRC-BSQS
```

均可见《碎金赋》或高度相同文字。

按照 Source Registry：

```text
shared_or_inherited_formula_requires_evidence_scope_review
```

因此本轮把它们视作：

```text
multiple witnesses of a traditional formula transmission
```

而不是机械计作两个独立 lineage。

---

# 4. Dynamic Motif A：source_suppressed_by_third_party

最稳定的三节点结构之一：

```text
A → T
```

其中 A 原本可生 / 克 target。

若：

```text
B controls A
+
B active
```

传统允许：

```text
A 对 T 的原作用下降、受阻，甚至不能兑现
```

《碎金赋》多组公式反复出现该结构，例如：

```text
子动生财
+
父动克子
→ 子不能正常生财
```

以及：

```text
财动生鬼
+
兄动克财
→ 鬼不得其生
```

《增删卜易·元神忌神衰旺章》又独立给出：

```text
忌神虽动
+
被日月动爻所克
→ 可能不能克用神
```

因此：

```text
third_party_suppression
```

具有比单一《碎金赋》传承更稳的传统结构支持。

研究职责：

```text
B controls A
→ A.actionability / A→T path constrained candidate
```

不是：

```text
A relation deleted from structure
```

也不是：

```text
B 和 A 各一票相抵
```

---

# 5. Dynamic Motif B：source_reinforced_by_third_party

反向结构同样存在：

```text
A controls T
+
B generates A
```

或：

```text
A generates T
+
B generates A
```

传统会把 B 视作增强 A 的来源。

《碎金赋》中的多组反例正说明：

```text
如果本来克 target 的 source 又得到同动之爻生助
→ 对 target 的压力会增强
```

《增删卜易》也把：

```text
忌神旺相
或得日月动爻生扶
```

列入“能克害用神”的重要条件。

因此：

```text
source_reinforced_by_third_party
```

同样是共享 path responsibility。

但本轮继续禁止：

```text
one generator = +1
```

或：

```text
generated source always wins target
```

因为 target condition、墓、合、空破、回头制化仍可能改变结果。

---

# 6. Dynamic Motif C：贪生忘克 = generation path redirection

这是本轮最重要的 path rewrite。

《碎金赋》传承常见：

```text
兄动克财
+
子动
→ 兄贪生于子
→ 忘克于财
→ 子又生财
```

其结构不是：

```text
兄被子克弱了
```

恰恰相反：

```text
兄 → 生 → 子
```

仍然在发生作用。

变化的是：

```text
原本 兄 → 克 → 财
```

这一条 target-directed path 被重新导向：

```text
兄 → 生 → 子 → 生 → 财
```

因此更准确的职责是：

```text
path_diverted_by_generation
```

而不是：

```text
source_suppressed
```

也不是：

```text
source disappeared
```

这一区分在解释层尤其重要，因为：

```text
source_suppressed
```

和：

```text
source redirected into supportive chain
```

最终都可能使 target 免受原克，但传统因果完全不同。

---

# 7. ZSBY 独立加强：忌神与元神同动 → 接续相生

《增删卜易·元神忌神衰旺章》给出一条非常关键的独立证据。

它明确把：

```text
忌神与元神同动
```

列入：

```text
忌神虽动而不能克用神
```

并在具体例中解释：

```text
未土忌神原本克亥水用神
+
酉金元神同动
+
未土生酉金
+
酉金生亥水
↓
接续相生
```

这说明：

```text
贪生 / 接续相生
```

并不只存在于《碎金赋》一条传承中。

至少在：

```text
TRAD-ZSBY
```

也有直接、独立的 target-relative network 案例。

因此本轮可以把：

```text
generation redirection into continuous generation
```

提升为：

```text
cross-source-compatible classical structure
```

而不是仅仅：

```text
single-transmission formula
```

---

# 8. Continuous Generation 不是简单“每条生边都 +1”

传统所说：

```text
接续相生
```

更接近：

```text
A generates B
B generates T
```

形成一条有方向的连续作用链。

它的研究意义是：

```text
A 本身未必直接 generate T
```

但通过 B：

```text
A → B → T
```

可以改变 T 的实际受助情况。

因此 future shared mechanics 若保留 continuous generation，必须同时保留：

```text
source nodes
intermediate node
terminal target
edge directions
path provenance
```

不能压成：

```text
supportCount += 2
```

也不能只输出：

```text
T supported
```

而丢掉中间路径。

因为中间节点 B 可能同时：

```text
旬空
月破
入墓
被克
被合
回头克
```

任一条件都会改变整个链条。

---

# 9. Continuous Adverse Chain 也存在，但概念需谨慎

现代王虎应把一类结构整理为：

```text
克用神的动爻 A
+
另一个动爻 B 生 A
→ A 克 target 的力量增强
```

并称作：

```text
连续相克
```

这个现代归纳与传统《碎金赋》具体公式方向相容。

但严格说，其拓扑往往是：

```text
B generates A
A controls T
```

并不是：

```text
B controls A
A controls T
```

所以 future model 不宜只看术语“连续相克”就强制建立：

```text
CONTROL → CONTROL → TARGET
```

更安全的 shared representation 是：

```text
upstream reinforcement
→ adverse terminal source
→ target
```

也就是说：

```text
continuous_adverse_effect
```

可以是研究意义；

但底层仍应保存真实五行边：

```text
generates
controls
```

而不是把整条链重新编码成单一“克链”。

---

# 10. Dynamic Motif D：贪合忘克

《黄金策》传承明确有：

```text
贪生贪合
刑冲克害皆忘
```

这至少证明：

```text
qualified harmony
```

可以改变原来的刑冲克害路径。

现代王虎应又明确把：

```text
克用神的动爻
+
与另一动爻相合
→ 贪合忘克
```

列成自己的补充规则，并明确说明：

```text
《碎金赋》原赋没有直接写这一条
```

因此当前最安全分类：

```text
harmony_can_modify_adverse_path
= classical transmission supported

moving-moving harmony diversion exact reducer
= modern systematization / context dependent
```

不能简单写：

```text
A harmony C
→ delete A→T control
```

因为上游研究已经确认：

```text
HARMONY
```

可能表示：

```text
合好
合起
合绊
回头合
三合 coalition membership
```

并不是一个统一 blocker。

---

# 11. “贪生忘克”不是 Universal Generate > Control

这是非常重要的限制。

从：

```text
贪生忘克
```

不能推出：

```text
只要 A 同时能生 B、克 T
A 永远先选择生 B
```

因为传统例式至少依赖：

```text
B 是否当前活动 / 相关
A-B 是否处于真正动态链
T 是否是当前 observation target
其他 path modifier 是否存在
```

尤其当：

```text
A 能生多个 moving nodes
```

或：

```text
A 同时与一个 node 合、又生另一个 node
```

传统没有提供一个跨所有网络的：

```text
GENERATE > HARMONY > CONTROL
```

总优先级。

因此：

```text
贪生忘克
= typed local path rule
```

不是：

```text
global relation precedence
```

---

# 12. 动爻内部因果可以改变后续作用能力

上一轮已确认《增删卜易·动静生克章》存在：

```text
A 动克 B 静
↓
B 先受伤
↓
B 对 C 的原作用下降
```

本轮把这一原则扩展到 moving network：

```text
B 对 C 的作用资格
```

不能只由：

```text
B 原始五行 + B moving=true
```

一次决定。

它还可能在同一 reading 内先受到：

```text
A 对 B 的制化
```

而改变。

所以传统机械网络具有：

```text
causal dependency
```

至少在局部链上成立。

但这仍不授权：

```text
全卦所有 edge 必须得到一个唯一拓扑排序
```

因为多个 independent branches 可能并无传统明确先后。

---

# 13. “动动先于动静”应怎样重新分类

## 13.1 古典直接支持到哪里

古典可以直接支持：

```text
A. 动爻能够作用动爻
B. 动爻能够作用静 target
C. 静爻反向克动爻的资格受明显限制
D. 贪生忘克 / 第三爻制化会先改变某 source 对 target 的实际路径
E. 有动，以动为急
```

这些共同形成：

```text
moving-moving internal adjudication is often causally prior
```

的强结构依据。

## 13.2 古典没有直接写成什么

目前未找到足够直接的古典统一句：

```text
“所有动爻彼此之间的所有关系，必须先于所有动爻对静爻的所有关系全部计算完成”
```

因此：

```text
moving-moving-before-moving-static
```

不能注册为：

```text
universal classical scheduler
```

## 13.3 现代作者做了什么

王虎应明确把《碎金赋》归纳成：

```text
动爻和动爻之间发生的生克
先于
和静爻发生的生克
```

朱辰彬则在“复合之动”体系中明确要求：

```text
多个有用动爻
先彼此整合
再以整合后的总体方向作用世爻 / 用神
```

所以：

```text
modern moving-internal-first policy
= cross-author compatible
```

但：

```text
shared classical total scheduler
= not established
```

这两层必须同时保留。

---

# 14. MOD-WHY：六类现代系统化的价值与边界

王虎应对《碎金赋》的现代归纳非常适合做横向检验。

其核心模型大致是：

```text
1. support source gets generated
   → support strengthened

2. support source gets controlled
   → support weakened / blocked

3. adverse source gets generated
   → adverse pressure strengthened

4. adverse source gets controlled
   → adverse pressure weakened / blocked

5. adverse source generates another active node
   → original control diverted
   → may become continuous generation toward target

6. adverse source harmonizes another active node
   → original control may be diverted / bound
```

它的价值在于：

```text
把《碎金赋》的局部公式抽象成 source-target-relative path motifs
```

与本项目已有：

```text
source_suppressed_by_third_party
source_reinforced_by_third_party
path_diverted_by_generation
path_diverted_by_harmony
continuous_generation
```

高度兼容。

但它仍然属于：

```text
MOD-WHY
```

不能因为整理得漂亮，就把六类原样升级为古典 machine contract。

尤其第 6 类是作者自己补充的。

---

# 15. MOD-ZCB：更强的“内部整合后再指向目标”模型

用户提供的《古筮真诠》扫描本与可核对公开文本都明确把“复合之动”定义为：

```text
多个有用动爻
↓
先按彼此作用关系整合
↓
再以整体指向世爻 / 用神
```

其主要模式包括：

```text
A. 三合局整体化
B. 连动相生整体化
C. 连动相克 / 对抗后再整体化
```

其中扫描本有一个非常直接的现代案例：

```text
元神寅木原本欲生世用午火
+
辰土、申金构成土金连动
+
终端申金冲克寅木
↓
寅木不能再生世用
```

朱辰彬把三动内部结果描述为：

```text
能量相互抵消
最终像动爻没动过一样
```

这一案例很有价值，因为它证明其体系中：

```text
upstream moving component
can cancel the actionability of another moving component toward target
```

但共享研究层不能把：

```text
“相互抵消，像没动过”
```

升级为通用规则。

因为：

1. 这是现代作者体系中的完整解释；
2. 古典《碎金赋》更多是具体 source 被制 / 被泄 / 改道；
3. “抵消”不等于所有 constituent facts 删除；
4. 多个独立 component 是否恰好为零没有传统数值定义。

所以本轮分类：

```text
ZCB internal integration
= modern_author_direct_system

ZCB generic cancellation-to-zero
= not shared classical kernel
```

---

# 16. MOD-ZCB 的 Target-Directed Gate 也不能直接变成 shared core

朱辰彬明确要求：

```text
复合连动必须最终围绕世爻 / 用神
```

如果一串动爻虽然彼此五行相生，但最终没有指向世用：

```text
该连动组合不成立
```

这个思想与本项目的：

```text
requested target-relative interaction
```

非常相容。

但古典共享层当前能够明确支持的是：

```text
用神 / 世等 target 确实是大量传统生克制化判断的中心
```

还不足以证明：

```text
所有多动爻之间只有在最终指向世 / 用时才允许彼此发生机械作用
```

因此：

```text
ZCB target-directed chain eligibility
= modern school-specific strong design comparator
```

而本项目 shared core 目前只采取更保守原则：

```text
只有与当前 requested observation target 的判断职责相关的 dynamic component
才进入该 observation 的 adjudication
```

这来自项目 Observation-scoped architecture，不能冒充古典原句。

---

# 17. 现代 WHY / ZCB 横向结论

两家在以下方向高度相容：

```text
moving-to-moving relations are real

multiple moving lines should not be independently counted before path review

upstream generation can reinforce a source

upstream control can suppress a source

generation can redirect an adverse source

continuous generation is meaningful

moving network should be resolved before final target judgment in many multi-moving cases
```

两家不能直接合并的地方：

```text
WHY
→ 以《碎金赋》为基础给出较通用六类公式

ZCB
→ 先剔除“无用动爻”
→ 强制 target-directed internal integration
→ 三合局优先
→ 自占自事吉凶层世爻不参与外部连动
→ 可把某些多动结果描述为整体抵消
```

因此：

```text
modern structural compatibility
= strong

modern exact reducer consensus
= no
```

---

# 18. Dynamic Chain 仍然必须 Observation-Scoped

这是与龟甲复合观察架构直接相关的一条结论。

传统中的：

```text
元神
忌神
仇神
```

都不是 line 的全局固定属性。

它们是相对于当前：

```text
用神 / observation target
```

才成立的角色。

因此：

```text
A→B→T1
```

可能对 Observation T1 是：

```text
continuous support
```

而同一组 lines 相对于 Observation T2，可能构成完全不同的：

```text
control / outflow / irrelevant path
```

所以未来不能建立一个：

```text
wholeReading.movingNetwork.finalPolarity
```

然后让所有 observation 共用。

更安全的是：

```text
Neutral Structural Network
+
Observation Target T1
→ T1-scoped Dynamic Adjudication

Neutral Structural Network
+
Observation Target T2
→ T2-scoped Dynamic Adjudication
```

这与现有复合观察规范中：

```text
不同观察对象必须拥有独立关系视角
```

完全一致。

---

# 19. Constituent Facts 永久保留，Path Output 可以 supersede 原始直接解释

若：

```text
A controls T
+
A generates B
+
B generates T
```

被判成：

```text
贪生忘克 / continuous generation
```

不能做：

```text
删除 A controls T 这个结构事实
```

因为：

```text
A controls T
```

作为五行拓扑仍然真实。

但在当前 observation 的 realized path interpretation 中，可以：

```text
supersede direct A→T control interpretation
```

即：

```text
Structural Fact retained
Realized Path rewritten
```

这一结构和此前三合：

```text
constituent facts retained
but group-level relation may supersede constituent-level ordinary interpretation
```

完全同构。

---

# 20. Target Rescue 与 Source Suppression 继续分开

多动网络中很容易把两种不同结构都叫“解”。

### A. Source suppression

```text
B controls A
A controls T
↓
A→T 受制
```

### B. Target rescue

```text
A controls T
B generates T
↓
A→T 仍存在
T 同时得到救应
```

《增删卜易》的“克处逢生”明确属于第二类。

《碎金赋》中的：

```text
另一个动爻直接克制忌源
```

更接近第一类。

二者最终都可能让 target 不至于受害，但未来解释、应期、path provenance 完全不同。

因此禁止：

```text
rescue = remove adverse edge
```

---

# 21. 同样不能把 Reinforcement 与 Continuous Generation 混成“多生一票”

例如：

```text
B generates A
A generates T
```

和：

```text
A generates B
B generates T
```

都可能最终增强 T。

但两者职责不同：

第一种：

```text
source reinforcement
```

第二种：

```text
continuous generation / path relay
```

如果未来只保存：

```text
supportSources = 2
```

就丢掉了：

```text
谁是中间节点
谁先受制会断链
哪个节点的空破墓绊会改变结果
```

所以 dynamic chain 必须保留 topology，而不是投票数。

---

# 22. 多动爻不应按 line position 排固定顺序

本轮没有发现可靠古典依据支持：

```text
初爻先算
二爻后算
...
上爻最后算
```

或反方向：

```text
上爻优先向下传播
```

《碎金赋》与《增删卜易》使用的是：

```text
五行制化关系
+
动静
+
旺衰 / 状态
+
用神角色
```

而不是爻位作为机械 scheduler。

爻位当然在具体题义 / 取象中有意义，但本轮不允许把它发明成：

```text
network evaluation order
```

---

# 23. Fork：一个 source 同时存在多个可能路径时仍未解决

例如理论上可能出现：

```text
A controls T
A generates B
A harmonizes C
```

而 B、C 都是 active / relevant。

现有传统局部规则告诉我们：

```text
贪生可能改道
贪合可能改道
```

但没有给出一个稳定共享表：

```text
生 B 与合 C 同时存在
→ A 先选谁
```

更没有：

```text
GENERATE > HARMONY > CONTROL
```

的统一总序。

因此：

```text
multi_path_fork
= unresolved
```

不得用：

```text
first matching rule wins
```

偷偷填补。

---

# 24. Cycle：循环网络不能用“接续相生”无限传播

五行网络理论上可以形成：

```text
A → B
B → C
C → A
```

或更复杂闭环。

本轮传统材料没有提供一个：

```text
cycle convergence rule
```

因此未来即使使用 graph representation，也必须禁止：

```text
不断沿生克边递归直到没有新节点
```

否则可能产生：

```text
无限循环
重复放大
重复计数
```

正确研究状态：

```text
cycle_detected
→ unresolved / requires source-specific rule
```

而不是现代数学化自动收敛。

---

# 25. 多个独立 Dynamic Components 也不能直接相消

假设相对于同一 target T：

```text
Component 1
→ continuous support to T

Component 2
→ effective control to T
```

传统当然允许同时存在支持与克制。

但不能直接：

```text
1 support component
-
1 adverse component
= 0
```

因为：

```text
source / target condition
component内部链强弱
日月
路径状态
```

都不同。

朱辰彬某些案例中出现：

```text
多动内部相互抵消，最终像没动过
```

只能登记为其现代体系的具体 adjudication / pattern，不能提升为：

```text
opposite moving components always cancel
```

---

# 26. 三合 Coalition 在 Dynamic Chain 中的地位

上游三合研究已经证明：

```text
合法三合 coalition
→ 可以成为 group actor
```

并且：

```text
constituent-level ordinary interpretation
```

在特定 relation 上可能被 group relation supersede。

因此 moving network 不能同时：

```text
把申、子、辰各自作为普通 moving nodes 完整参与
+
再额外把申子辰水局当第四个 source
```

这会 double-count。

但是：

```text
三合总是优先于所有其他连动
```

目前仍主要是朱辰彬的明确现代 policy。

古典材料支持：

```text
三合可结党成局
group-level actor真实存在
```

但没有足够直接证据建立一个跨所有情况的：

```text
GROUP > ANY_MOVING_CHAIN
```

总优先级。

所以：

```text
legal group formation must be detected before duplicate constituent interpretation
```

可以作为架构防重约束；

而：

```text
group always wins every competing chain
```

仍不可进入 shared classical kernel。

---

# 27. Changed Line 不进入普通 moving-moving 全连接网络

上游《增删卜易·动变生克冲合章》研究已经明确：

```text
变爻
→ 主要回头作用本位动爻
→ 不应当成普通第七、第八节点任意连接其他原卦爻
```

因此本轮所谓：

```text
moving-vs-moving
```

首要对象仍然是：

```text
original active lines
```

变爻应通过：

```text
local transform feedback
```

改变本位动爻：

```text
actionability / availability / trajectory
```

然后才重新审该本位动爻进入 dynamic chain 后的状态。

不得：

```text
original + changed
→ fully connected network
```

---

# 28. DARK_MOVING 的位置仍需保守

传统明确把暗动视为：

```text
具有动性
```

三合研究中也有：

```text
明动 + 暗动
```

参与动态结构的传统 / 现代支持。

但本轮没有取得足够证据直接证明：

```text
DARK_MOVING
在所有 moving-moving chain 中
与 VISIBLE_MOVING 完全同权
```

因此当前只能写：

```text
dark_moving_dynamic_chain_membership
= plausible / supported in bounded contexts

full_equivalence_with_visible_moving
= not established
```

这点继续留给专门 activity-equivalence review，而不是本轮顺手解决。

---

# 29. 对《增删卜易》“卦中动爻”这一四处通道的真正推进

此前 Interaction Precedence Review 已确认：

《增删卜易》四处生克冲合中的第三处是：

```text
卦中之动爻
```

而不是：

```text
每一个动爻各算一处
```

这造成一个核心问题：

```text
多个动爻方向不同
→ 第三处内部怎样裁决？
```

本轮之后，这个问题可以从：

```text
completely unresolved
```

推进到：

```text
partially adjudicable by typed local dynamic-chain rules
```

也就是说：

```text
动爻通道内部
```

至少可以先识别：

```text
source suppression
source reinforcement
generation diversion
continuous generation
qualified harmony diversion
group formation
local transform feedback to source
```

然后再看剩余独立 components。

但仍不能把整个第三处压成：

```text
support / adverse / neutral
```

唯一单值。

因为可能出现：

```text
Component A = support chain
Component B = adverse chain
Component C = unresolved fork
```

所以当前正确状态：

```text
moving_channel_internal_adjudication
= partially_solved

moving_channel_single_final_reducer
= not_ready
```

---

# 30. 推荐的研究级 Moving Channel 表达

本轮不注册 schema，但研究职责更接近：

```text
Moving Channel for Target T
│
├─ Dynamic Component 1
│   ├─ members
│   ├─ local relations
│   ├─ path transformation
│   ├─ terminal relation to T
│   └─ current effect state
│
├─ Dynamic Component 2
│   └─ ...
│
├─ Group Component
│   └─ ...
│
└─ unresolved components
```

而不是：

```text
movingSupportCount
movingControlCount
```

也不是：

```text
movingChannelScore
```

原因是传统“动爻一处”并没有授权把内部复杂性丢掉。

---

# 31. Local Dynamic Chain Research Kernel v0.1

本轮可以建立以下最小共享研究核。

## D1 · Moving-to-Moving Is Legal

```text
original active line
may generate / control another original active line
```

强度：

```text
traditional formula supported
```

## D2 · Third-Party Suppression

```text
B controls A
A acts on T
→ A→T may be constrained / interrupted
```

强度：

```text
cross-text compatible
```

## D3 · Third-Party Reinforcement

```text
B generates A
A acts on T
→ A→T may be strengthened
```

强度：

```text
cross-text compatible
```

## D4 · Generation Diversion

```text
A controls T
A generates active relevant B
→ A may redirect toward B
→ original A→T control no longer realized in the same way
```

强度：

```text
classical direct structure
```

限制：

```text
not universal whenever any generated node exists
```

## D5 · Continuous Generation

```text
A generates B
B generates T
→ target-relative supportive chain can exist
```

强度：

```text
ZSBY direct + traditional formula compatible
```

## D6 · Harmony Path Modification

```text
qualified harmony involving source
may alter original adverse path
```

强度：

```text
classical transmission support
exact moving-chain reducer unresolved
```

## D7 · Local Causal Dependency

```text
A changes B's actionability
→ B's downstream relation to T must be re-reviewed
```

强度：

```text
classically supported in local cases
```

## D8 · Component-Level Rather Than Vote-Level Synthesis

```text
multiple moving lines
→ resolve proven local components first
→ do not count raw lines as votes
```

强度：

```text
strong research consequence
```

## D9 · Preserve Mixed / Unresolved

```text
multiple independent dynamic components remain opposed
→ preserve mixed / unresolved
```

强度：

```text
methodological requirement
```

## D10 · No Universal Scheduler

```text
no total order across arbitrary moving network
```

状态：

```text
insufficient evidence for universal reducer
```

---

# 32. 什么叫“先内部整合”，现在必须限定

未来如果继续使用：

```text
先内部整合
```

这句话，必须限定为：

```text
先解决已有传统依据的 moving-to-moving path dependencies
```

不能理解为：

```text
遍历所有 moving pairs
→ 按程序预设顺序不断更新 strength
→ 最后一定收敛成一个 node / score
```

传统允许：

```text
局部链可被确定
```

但没有保证：

```text
整个网络可被唯一化约
```

因此：

```text
internal adjudication
≠ global reduction
```

---

# 33. 为什么 Generic Graph Solver 仍然太早

一个通用 graph solver 至少还会遇到：

```text
1. fork
   一个 source 同时有生 / 合 / 克多个方向

2. cycle
   多动形成闭环

3. multiple terminal components
   多条链分别指向同一 target

4. competing targets
   同一 moving network 对多个 observation target 意义不同

5. group formation
   constituent 与 coalition 如何防重

6. dark moving equivalence
   暗动是否完全同权

7. transform feedback
   本位变爻先改变 source 后如何重新入链

8. temporal recovery
   某 component 当前受空破墓绊但未来恢复

9. role / analysis-layer gate
   某 source 虽机械可作用，但本层是否允许进入对应 topic judgment
```

任何一个都足以让：

```text
single deterministic reducer
```

过早。

---

# 34. 对 Directed Interaction Effectiveness 的进一步升级

此前框架：

```text
Topology
↓
Action Eligibility
↓
Source Condition
+
Target Condition
+
Path State
+
Temporal State
↓
Effectiveness
```

本轮表明，在多动时：

```text
Path State
```

本身可能不是一个静态 label。

它可能是：

```text
Dynamic Component Adjudication
```

即：

```text
source A
先被 B 生成 / 克制 / 吸引
↓
A 当前真正向 target T 输出什么
```

所以以后可能需要：

```text
local dynamic chain result
```

作为 Directed Interaction Effectiveness 的上游输入。

但本轮不创建 formal schema。

---

# 35. 对 Relative Force 的约束

上一轮 Static / Relative Force Review 已确认：

```text
movement priority
≠ unconditional current effect
```

本轮同样要求：

即使一条 dynamic chain 已经拓扑成立：

```text
B generates A
A controls T
```

也不能只因链条成立就宣布：

```text
T effectively controlled
```

仍需检查：

```text
B condition
A condition
T condition
calendar
binding / tomb
transform feedback
temporal manifestation
```

因此：

```text
dynamic_chain_resolved
≠ final_effect_resolved
```

---

# 36. 对四处综合的约束

如果未来重新进入《增删卜易》四处综合：

```text
月建
日辰
卦中动爻
本位变爻
```

第三处不能直接输入：

```text
raw moving line list
```

也不能输入：

```text
movingSupportVotes = N
movingControlVotes = M
```

至少应先完成：

```text
Target-scoped Moving Channel Adjudication
```

然后保留：

```text
resolved local components
mixed components
unresolved forks
```

至于四处古法最终要求第三处必须压成什么形态，仍是下一专项需要回答的问题。

---

# 37. Provenance Summary

传统主要证据：

```text
TRAD-ZSBY
→ 忌神 / 元神同动
→ 接续相生
→ 动静生克局部因果
→ 动爻受其他动爻生扶 / 克制的有效性条件

《碎金赋》传承 witness
→ SRC-DYTJ
→ SRC-BSQS
→ moving-to-moving 生克制化公式
→ exact independence scope 继续谨慎

TRAD-HJC-TRANSMISSION
→ 贪生贪合，刑冲克害皆忘
→ harmony / generation path modification
```

现代：

```text
MOD-WHY
→ 六类 moving interaction 系统化
→ 明确“动动先于动静”现代归纳
→ 贪合忘克为作者补充

MOD-ZCB
→ 复合之动
→ useful moving lines first integrate
→ continuous generation / mutual control / group formation
→ target-directed integration
→ stronger school-specific pruning / cancellation policies
```

重要：

```text
王虎应的虎易评注
不得归入古籍原赋原文
```

---

# 38. Evidence Classification Matrix

| 命题 | 传统 / 现代证据 | 当前分类 |
|---|---|---|
| 动爻可以生克另一个动爻 | 《碎金赋》传承 | `classical_supported` |
| 第三动爻克 source 可削弱其对 target 的作用 | 碎金赋 + ZSBY source-force 条件 | `cross_text_compatible` |
| 第三动爻生 source 可增强其作用 | 碎金赋结构 + ZSBY | `cross_text_compatible` |
| 贪生忘克是 path redirection | 碎金赋 + ZSBY 接续相生 | `strongly_supported` |
| 接续相生 A→B→T | ZSBY direct | `classical_direct` |
| 贪合可改变原克路径 | 黄金策传承 | `classical_supported_contextual` |
| moving-moving 一律先于 moving-static | WHY / ZCB 明确，古典结构相容 | `modern_cross_author_compatible_not_classical_total_order` |
| 多动必须先整体化成唯一结果 | ZCB 明确；古典不足 | `modern_school_specific` |
| 相反动爻组件一定互相抵消为零 | ZCB case-level | `not_shared_rule` |
| 三合总是优先于普通连动 | ZCB 明确；古典 group 支持但无 total order | `modern_school_specific_priority` |
| 每个动爻在四处法中各算一票 | 无 | `rejected` |
| 多动内部可先按 typed local chain adjudicate | 多源结构支持 | `supported_research_architecture` |
| 多动内部一定可压成单一 channel polarity | 无 | `not_ready` |

---

# 39. Explicit Non-Inferences

本轮明确禁止：

```text
动爻彼此有关系
→ 所有 moving pairs 都必须计算

动动先于动静
→ 古籍已经给出统一 scheduler

贪生忘克
→ 生永远优先于克

贪合忘克
→ 合永远优先于克

B 克 A
→ A 的结构关系被删除

B 生 A
→ A 一定能克动 target

A 生 B，B 生 T
→ 两条 support 各加一票

continuous generation
→ 固定倍率增强

continuous adverse chain
→ 所有 edge 都是 control

多个 adverse sources
→ 可以按数量累计

一条 support chain + 一条 adverse chain
→ 自动抵消

ZCB 某案例“像没动过”
→ 所有相反 component 都归零

WHY 六类公式
→ 六类就是古籍原生 machine rule

WHY 贪合忘克补充
→ 《碎金赋》原文已有

三合 coalition 成立
→ constituent facts 删除

三合 coalition 成立
→ group 与 constituent 同时累计

DARK_MOVING
→ 与 VISIBLE_MOVING 全场景完全同权

changed line
→ 普通 moving node

line position
→ evaluation order

cycle
→ 可以递归到收敛

fork
→ first-match wins

moving channel
→ one score

moving channel
→ one vote

dynamic path resolved
→ effectiveness resolved

effectiveness resolved
→ domain outcome resolved
```

---

# 40. Final Decision

```text
Moving-vs-Moving Interaction
= traditional-research-supported shared layer

moving-to-moving relation
= real

third-party suppression
= supported

third-party reinforcement
= supported

generation redirection / 贪生忘克
= strongly supported

continuous generation
= strongly supported

qualified harmony redirection
= supported but mechanism contextual

local causal sequencing
= supported

raw moving-line counting
= rejected

moving-moving-before-moving-static
= modern cross-author compatible
= classically compatible
= not established as universal classical scheduler

ZCB full internal-integration policy
= modern school-specific systematic model

WHY six-pattern reducer
= modern author systematic model

moving channel internal adjudication
= partially solved by typed local rules

moving channel single final reducer
= not ready

multiple forks / cycles / independent opposed components
= unresolved

generic graph solver
= not ready

Formal Expansion
= not authorized
```

---

# 41. Recommended Next Research

下一步最直接的瓶颈已经不是：

```text
动爻之间能不能作用
```

而是：

```text
多个已经完成局部 chain adjudication 的 dynamic components
最终怎样进入《增删卜易》的“卦中动爻”这一单一四处通道？
```

建议下一专项：

```text
Moving-Channel Internal Aggregation & Mixed Component Synthesis Review v0.1
```

只回答：

1. 《增删卜易》所谓“卦中动爻”一处，是否要求先压成单一方向；
2. 多个动爻 / 多个 chain 同时生、克、冲、合用神时，古籍是否有明确内部综合；
3. “生多克少”“克多生少”“寡不敌众”是否可以直接应用在 moving channel 内，还是只属于更外层四处 / 三传综合；
4. 一个 resolved support component 与一个 resolved adverse component 同时存在时，能否按旺衰、有效性或其他条件裁决；
5. 多个 components 是否应保留并列直到四处综合；
6. group actor、continuous chain、direct moving source 是否属于同一 moving channel component family；
7. 当前仍 unresolved 的 fork / cycle 应如何进入 channel，而不强制给 polarity；
8. 是否最终只能得到：

```text
moving_channel = mixed / unresolved
```

而不是：

```text
moving_channel = support | adverse
```

若传统材料仍无法提供统一 internal reducer，合法结果应是：

```text
Typed Dynamic Components
+
Source-Explicit Local Adjudication
+
Preserve Mixed Moving Channel
```

而不是为配合“四处”形式，发明一个现代 hidden score。