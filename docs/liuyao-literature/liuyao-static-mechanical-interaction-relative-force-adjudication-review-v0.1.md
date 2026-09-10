# 龟甲 · 六爻 Static Mechanical Interaction / Relative Force Adjudication Review v0.1

日期：2026-09-10

状态：`research_complete_design_only_static_interaction_bounded_moving_static_priority_supported_relative_force_not_total_order`

范围：六爻共享研究层 / 静爻机械作用、动静相对资格、旺相休囚相对裁决、当前作用与待时作用、moving-vs-static、static-vs-static、moving-vs-moving 的职责边界，以及王虎应 / 朱辰彬现代横向检验。

研究基线：

```text
branch = liuyao-semantic-v013-core
observed HEAD before write = 4493321a90dfffa71c1d1bfd60a376e941faa8cb
```

该 HEAD 属并行 Candidate v0.4 development 线；本研究不得修改或解释其 development 结果。

上游：

- `liuyao-role-semantic-relation-action-eligibility-promotion-review-v0.1.md`
- `liuyao-self-participant-topic-direction-matrix-review-v0.1.md`
- `liuyao-shi-line-action-eligibility-self-proxy-divination-review-v0.1.md`
- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `liuyao-directed-interaction-path-control-transformation-review-v0.1.md`
- `liuyao-interaction-precedence-multi-moving-adjudication-review-v0.1.md`
- `liuyao-line-relation-fact-provenance-review-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`
- `龟甲 · 六爻复合观察与取用规则规范 v0.2（草案）`

> 本研究只回答机械作用层：已经有一个合法、被请求的 source-target 结构关系后，静爻是否具备作用资格；动静与旺衰怎样改变作用资格和当前兑现；同旺同衰、同动等情形能否形成稳定共享裁决。v0.1 不生成领域吉凶，不建立 runtime reducer，不修改 current-22、Rule Registry、Time Engine、Candidate、训练 / calibration / blind data。

---

# 1. Executive Decision

本轮最大的风险不是：

```text
静爻到底能不能作用？
```

而是把三个不同问题压成一个：

```text
A. Mechanical Action Eligibility
   这条关系有没有机械作用资格？

B. Current Realization
   当前是否已经足以改变 target 的现实作用状态？

C. Temporal Manifestation
   即使作用关系存在，何时真正显现？
```

传统文本对这三层并不总给出同一个答案。

例如《增删卜易》直接给出：

```text
休囚动爻
→ 可以克旺相静爻
```

说明 movement 可以赋予很强的机械作用资格。

但《卜筮正宗·旺相休囚论》又说：

```text
旺相之爻即使被日辰 / 动爻克制
→ 目下仍可“贪荣得令”
→ 过时再受其毒
```

这说明：

```text
mechanical adverse contact exists
```

不等于：

```text
target current function instantly disappears
```

同样，休囚之爻即使得到日辰 / 动爻生扶：

```text
目下仍可能不能逞志
→ 遇时才得意
```

所以本轮正式拒绝：

```text
movement + relation
→ one-step final effect
```

也拒绝：

```text
旺相 / 休囚
→ one-step final effect
```

更安全的 shared structure 是：

```text
Structural Relation
↓
Scope / Topology
↓
Activity-Class Adjudication
↓
Relative Force / Availability
↓
Path Modifiers
↓
Current Realization
↓
Temporal Manifestation if deferred
```

本轮总体结论：

```text
static_is_globally_passive
= rejected

static_static_in_fully_static_hexagram
= classically_supported

static_static_in_moving_hexagram
= not_shared_classical_resolved

moving_over_static_action_priority
= strongly_supported_for_bounded_relations

moving_over_static_unconditional_current_effect
= rejected

static_controls_moving_as_equal_counteraction
= classically_disfavored / denied in direct control formulas

static_generates_moving_global_denial
= insufficient_classical_evidence

moving_vs_moving_interaction
= classically_supported

moving_vs_moving_relative_force_reducer
= not_ready

same-state same-force winner table
= not_established

universal_relative_force_score
= rejected

Formal Expansion
= not_authorized
```

---

# 2. 本轮必须延续上一轮的两条链

上一轮已经把：

```text
Mechanical Interaction
```

与：

```text
Role / Initiative Semantics
```

拆开。

本轮只研究前者。

因此：

```text
静爻可以克某 target
```

在本轮最多意味着：

```text
存在传统机械作用资格 / 效力问题
```

不意味着：

```text
静爻代表的人正在主动攻击 target
```

同理：

```text
动爻克静爻
```

也不是自动现实语义：

```text
某人主动伤害另一人
```

现实 actor meaning 仍由：

```text
Topic
Represented Role
Analysis Layer
```

解决。

---

# 3. Static 不是一个单一状态

“静爻”至少有以下不同研究语境：

```text
A. 全卦六爻安静中的静爻

B. 动卦里没有明动、也没有暗动的普通静爻

C. 原本静，但被日冲判成暗动的爻

D. 原本静，但被日冲判成日破的爻

E. 静爻但处于旬空 / 月破 / 墓 / 合等状态
```

因此以后禁止：

```text
line.moving === false
→ one universal mechanical policy
```

尤其：

```text
DARK_MOVING
```

已经是独立 activity provenance，不能继续按普通静爻处理。

---

# 4. Classical Direct A：《增删卜易·动静生克章》证明静爻并非绝对无作用

《增删卜易》章首先明确限定：

```text
六爻安静
```

然后说：

```text
旺相之爻
→ 可以生休囚之爻
→ 可以克休囚之爻
```

这条文本非常重要。

它直接否定现代程序最容易写出的：

```text
if not moving:
    no action
```

因为传统至少在：

```text
fully static hexagram
```

明确承认：

```text
旺 static source
→ mechanically generates / controls
→ 休囚 static target
```

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 动静生克章第十四
```

分类：

```text
classical_direct_static_static_relative_force
```

---

# 5. 这条 Static-Static 规则的 scope 必须守住

原文不是说：

```text
任何动卦中的任意两个静爻
都照样互相生克
```

而是以：

```text
六爻安静
```

为直接语境。

因此最安全的 shared proposition 是：

```text
IF hexagram is fully static
AND source is 旺相
AND target is 休囚
AND requested relation is generates / controls
THEN static source has mechanical action eligibility
```

这仍只是研究层 proposition，不是代码规则。

禁止扩张成：

```text
静爻只要旺
→ 在任何动卦中也自动生克所有休囚静爻
```

这个 wider scope 需要另有证据。

---

# 6. Static-Static in Moving Hexagram：当前不能假装已经解决

这一点是本轮必须保留的空白。

《增删卜易》对 static-static 的直接开头是：

```text
六爻安静
```

《黄金策》传承又说：

```text
两爻俱静，以旺为先；有动，以动为急
```

这句话可以读成 pair-local priority：

```text
若比较的两爻都静
→ 看旺衰
```

但它没有明确回答：

```text
若全卦另有第三个不相关动爻，
这两个静爻之间是否仍保留完整机械生克？
```

因此：

```text
static_static_in_moving_hexagram
```

当前状态必须是：

```text
classical_scope_unresolved
```

不能因为现代某派已有明确规则就倒写回古典。

---

# 7. Classical Direct B：《增删卜易》证明 movement 可以压过单纯 seasonal strength 的行动资格

同章第二部分说：

```text
卦有动爻
→ 能克静爻
→ 即使静爻旺相
→ 亦不能反克动爻
```

并给出具体例：

```text
寅月
酉金发动
酉金季节休囚
卯木当令旺相

酉金动
→ 仍能克伤旺相卯木
```

而且卯木被伤之后：

```text
卯木原本能克丑未土
→ 被酉金所伤
→ 其后续克土能力也下降
```

这说明 movement 不只是：

```text
标签 / 解释提示
```

而可以改变 mechanical action qualification 与 downstream actionability。

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
```

分类：

```text
classical_direct_moving_over_static_action_priority
```

---

# 8. “动克旺静”不能翻译成 moving = globally stronger

酉金例只能直接支持：

```text
在该 source-target control 关系中
movement 给予 source 对旺 static target 的实际作用资格
```

不能推成：

```text
所有动爻 > 所有静爻
所有动爻 > 日月
所有动爻 > 三合局
所有休囚动爻当前必胜旺静爻
```

更不能写成：

```text
moving = +10
旺 = +3
```

因为后续传统材料同时显示：

```text
合绊
入墓
旬空
月破
回头克
第三爻制化
```

都可能改变 action availability / path / manifestation。

所以本轮使用：

```text
action priority
```

而不是：

```text
global strength rank
```

---

# 9. Classical Direct C：《黄金策》传承提供“静看旺衰、动看行动优先”的局部公式

《黄金策》 / 《卜筮全书》相关传承明确提出：

```text
别衰旺以明克合
辨动静以定刑冲
```

并展开：

```text
旺爻能克衰爻
衰爻克不得旺爻

动爻刑得静爻
静爻刑不得动爻

动爻冲得静爻
静爻冲不得动爻
```

随后面对：

```text
动爻反衰
静爻反旺
```

直接回答：

```text
两爻俱静，以旺为先
有动，以动为急
```

这一段最安全的解释是：

```text
两边都没有活动差异
→ relative seasonal condition 成为主要局部裁决条件

一边具有活动资格
→ movement 获得比单纯静态旺衰更高的 action priority
```

来源：

```text
SRC-HJC / SRC-BSQS witness
independenceGroup = TRAD-HJC-TRANSMISSION
```

不能按两本书机械计两个独立 vote。

分类：

```text
classical_direct_local_activity_precedence
```

---

# 10. Classical Independent-Compatible：《断易天机》给出同方向规则

《断易天机》直接保存：

```text
旺相爻克得休囚爻
休囚爻克不得旺相爻

动爻克得安静爻
静爻克不得动爻
```

来源：

```text
SRC-DYTJ
independenceGroup = TRAD-DYTJ
```

但当前 Source Registry 已经提醒：

```text
断易天机
与部分天玄赋 / 后世收录公式
可能存在 inherited formula overlap
```

所以正式 Evidence 若要以“完全独立同文”升级 tier，仍应做 evidence-specific transmission check。

当前最安全分类：

```text
cross_text_compatible_direction
```

它强化：

```text
moving-vs-static control asymmetry
```

但不产生一个 universal total order。

---

# 11. 外部旧文本 witness：《多能鄙事》不能直接计票

《多能鄙事》当前可检索版本也保存高度接近的：

```text
旺相爻克得休囚爻
休囚爻克不得旺相爻
静爻克不得动爻
动爻克得安静爻
```

这是值得保存的 textual witness。

但：

```text
《多能鄙事》
```

当前尚未进入：

```text
data/liuyao-source-provenance-registry-v0.1.json
```

因此本轮只标：

```text
external_traditional_witness_registry_pending
```

不得用来制造新的 independent vote。

---

# 12. Control 的古典证据比 Generate 的“静→动禁止”更强

这里必须 relation-specific。

当前直接古典文本非常明确的是：

```text
静爻克不得动爻
```

以及：

```text
动爻能克静爻
```

而对：

```text
静爻是否绝不能生动爻
```

古典直接证据没有同等清楚。

现代体系常把：

```text
静不能生克动
```

整体化，但 shared classical layer 不能把现代系统化悄悄当成古文原句。

所以当前应分别登记：

```text
static_controls_moving
= direct classical denial / disfavor in bounded control rules

static_generates_moving
= shared classical universal denial not established
```

这一区分是本轮一个重要收窄。

---

# 13. Moving → Static 的 Generate 有 shared mechanical background，但不要照搬 Control 的所有结论

《增删卜易》的通用机械体系明确把：

```text
卦中动爻
```

作为可以对用神：

```text
生 / 克 / 冲 / 合
```

的来源。

大量元神案例也直接使用：

```text
动爻生用神
```

因此：

```text
moving source generates resolved static target
```

作为 mechanical candidate 并不需要每个主题重新证明。

但不能因为：

```text
moving control > static control
```

就机械推出：

```text
moving generate 在任何 current condition 下也必立即兑现
```

生扶同样要看：

```text
source current availability
recipient current condition
temporal state
path
```

---

# 14. Classical Direct D：《卜筮正宗·旺相休囚论》证明 current 与 future 必须拆层

《卜筮正宗》有一段对本项目非常关键：

```text
旺相之爻
即使被日辰及动爻克制
→ 目下仍“贪荣得令”
→ 过时仍受其毒

休囚之爻
即使得到日辰及动爻生扶
→ 目下仍不能逞志
→ 遇时仍然得意
```

来源：

```text
SRC-BSZZ
location = 十八论 / 旺相休囚论第十三
candidate independence = TRAD-BSZZ-INDEPENDENT
```

该段不是简单复制本轮黄金策句，因此可作为独立评论体系的重要 evidence candidate；正式 promotion 时仍做 bounded provenance review。

这段直接证明：

```text
relation + action source
```

与：

```text
current functional realization
```

必须分开。

---

# 15. 如何理解 ZSBY“休囚动克旺静”与 BSZZ“旺爻目下仍得令”

本轮不宣布二者“矛盾”，也不强行说它们完全相同。

可以安全建立的上位结构是：

```text
ZSBY
→ movement can establish / realize a control interaction against a旺 static line
→ 甚至可改变其 downstream actionability

BSZZ
→ target 当前旺相身份仍可能具有暂时效用
→ adverse moving/calendar contact 可在后续时间层体现
```

因此最小共同架构不是：

```text
moving always wins now
```

而是：

```text
moving may obtain action priority
+
current target state remains an independent responsibility
+
temporal manifestation can be deferred
```

这与此前 Directed Interaction Effectiveness 的：

```text
Source Actionability
Target Condition
Temporal State
```

完全兼容。

---

# 16. 《易隐》进一步支持“动爻也要分衰旺 + 应期”

《易隐》在流年类判断中写：

```text
动爻生合刑冲克害世
→ 当分衰旺

旺相能生克休囚
休囚不能生克旺相
```

并继续说：

```text
益我伤我之期
→ 以动爻生旺月日定之
```

来源：

```text
SRC-YY
independenceGroup = TRAD-YY
```

这说明至少在该专题传统中：

```text
moving
```

并没有完全取消：

```text
source relative condition
```

而且休囚动爻的现实作用可能具有：

```text
wait-until-source-prospers
```

这样的 temporal semantics。

因此：

```text
movement overrides all force considerations
```

不能成为 shared rule。

分类：

```text
classical_independent_temporal_relative_force_support
```

---

# 17. 古典内部真正稳定的是“维度并存”，不是一个固定 winner table

综合：

```text
ZSBY
HJC / BSQS transmission
DYTJ
BSZZ
YY
```

最稳定的共同点不是：

```text
动 > 旺 > 相 > 休 > 囚
```

而是：

```text
Activity
Relative Condition
Path
Temporal State
```

都是真实判断维度。

各文献对：

```text
当前立刻兑现多少
```

并不总提供完全一致的抽象公式。

因此 shared core 应保存：

```text
multi-axis evidence
```

而不是把差异磨平成一个排序表。

---

# 18. Static vs Static · Shared Minimum

当前能够安全建立：

## S-S-1 · fully static + 旺 source vs 休囚 target

```text
source = static
source = 旺相

target = static
target = 休囚

relation = generates / controls

→ mechanical action supported
```

强度：

```text
SRC-ZSBY direct
+ HJC/DYTJ compatible relative-force tradition
```

## S-S-2 · fully static + 休囚 source vs 旺 target

对于 control：

```text
休囚克不得旺相
```

有较强传统支持。

对于 generate：

ZSBY 的“旺相可生休囚”支持旺→衰，但没有同等明确的一句 universal：

```text
休囚绝不能生旺
```

因此 generate 方向应更保守。

## S-S-3 · both 旺

没有找到稳定 shared rule 能回答：

```text
两个都旺
谁必胜？
```

不能：

```text
看五行克方就自动胜
```

也不能 invent numerical hierarchy。

当前：

```text
unresolved
```

## S-S-4 · both 休囚

同样没有可靠 shared rule 表示：

```text
两个都休囚时
一定互不作用
或克方必胜
```

当前：

```text
unresolved / timing-sensitive
```

---

# 19. Moving vs Static · Shared Minimum

## M-S-1 · moving controls static

传统支持强：

```text
moving source
→ can control static target
```

即便：

```text
source 休囚
+
target 旺相
```

ZSBY 仍有直接作用案例。

所以：

```text
movement can override static seasonal superiority at action-eligibility level
```

## M-S-2 · static controls moving

ZSBY、DYTJ、HJC transmission 都提供否定 / 弱化方向：

```text
static line does not counter-control moving line on equal terms
```

这应理解为：

```text
action asymmetry
```

而不是：

```text
static target has no condition / no resistance
```

因为旺静 target 仍可能在 current / temporal layer 有独立状态。

## M-S-3 · moving generates static

有大量通用元神 / 动爻生用传统。

可进入 shared mechanical candidate。

## M-S-4 · static generates moving

当前没有与“静不得克动”同等直接、跨来源的古典禁止句。

所以：

```text
shared classical universal prohibition
= not established
```

现代作者可另有更严格 policy。

---

# 20. Static source 不是因为“静”就没有任何现实意义

即使某一静爻在当前机械层没有 outward action，它仍可能拥有：

```text
自身 condition
Role-Semantic Relation
Membership
Target resistance
被动承受关系
future activation / dark-moving potential
```

所以 future graph 不得因为：

```text
static source not currently active
```

就删除该 node。

这与三合研究中：

```text
constituent facts remain
```

是同一原则。

---

# 21. Moving vs Moving：传统明确存在，但本轮无法做 winner reducer

《断易天机·碎金赋》 / 相关传承提供大量：

```text
动爻 A
→ 作用动爻 B
→ 改变 B 对 target 的后续作用
```

例如：

```text
财动克父
+
鬼动
→ 财贪生鬼
→ 忘克父
```

又如：

```text
父动克子
+
财动克父
→ 子得救
```

再如：

```text
鬼动克兄
+
子动克鬼
→ 兄得救
```

这些都是：

```text
moving → moving
```

真实传统 network。

来源：

```text
SRC-DYTJ witness
SRC-BSQS witness
```

但《碎金赋》在多书传承，正式 independence 必须按具体文本 lineage 审核，不能多计票。

---

# 22. Moving-vs-Moving 的核心是 Path，不只是 Relative Force

上述例子说明：

```text
A、B 都在动
```

以后，问题不是简单：

```text
谁更旺？
```

而可能是：

```text
A 克 B
A 生 B
B 泄 A
A 贪生 B
第三爻克 A
连续相生
连续相克
```

因此：

```text
moving_vs_moving
```

天然进入：

```text
Directed Interaction Path / 制化
```

而不是一个：

```text
moving tie-breaker
```

本轮不能给出：

```text
两个动爻谁优先
```

的 universal answer。

---

# 23. “先动后静 / 动动先作用”不能因为现代评注就升级为古典通则

部分现代注本对《碎金赋》总结：

```text
动爻与动爻之间的生克
先于和静爻之间的生克
```

这种总结在现代教学上很有解释力。

但本轮必须区分：

```text
古典原赋 / 古注给出的具体制化案例
```

与：

```text
现代编辑者抽象出的 generic ordering
```

当前 classical direct support 足以证明：

```text
moving-moving interaction is real
```

但还不足以把：

```text
all moving-moving edges always execute before every moving-static edge
```

注册成 shared total precedence。

所以：

```text
moving_moving_first_global_order
= not established
```

---

# 24. 现有 Interaction Precedence 结论因此继续有效

上游已经确定：

```text
partial precedence
= supported

universal total order
= unsupported
```

本轮没有推翻它，反而进一步解释为什么。

可以保留的 local rules：

```text
fully static pair
→ relative旺衰 matters

moving-vs-static control
→ movement gets action priority

moving-moving network
→ specific path / 制化 may redirect action
```

不能合并成：

```text
MOVING > STATIC > ...
```

一个全局等级。

---

# 25. Current Realization 与 Future Manifestation 是本轮真正增加的一层

此前 Effectiveness 已经是 time-aware。

本轮用 BSZZ / YY 进一步明确：

```text
作用关系成立
```

与：

```text
眼下完全显效
```

不是同一件事。

研究性例型：

```text
旺 target
+
moving adverse source
→ adverse interaction present
→ target current function may temporarily persist
→ later vulnerability remains
```

以及：

```text
休囚 target
+
moving/calendar support
→ supportive interaction present
→ current realization may remain limited
→ later prosperity can unlock effect
```

所以未来不得只输出：

```text
effective = true / false
```

更适合保留：

```text
interaction_candidate
current_effect_supported
current_effect_constrained
deferred_manifestation
```

这些仍只是研究词，不授权成为 enum。

---

# 26. 旺相 / 休囚不是 source global vitality

本轮继续拒绝：

```text
lineStrength = 旺相休囚 → number
```

因为同一个旺爻可能：

```text
被动爻克
被合住
入墓
受日月制
```

同一个休囚动爻又可能：

```text
获得 movement action priority
但 current manifestation 仍等待时机
```

所以旺衰只能进入：

```text
relative condition / temporal availability
```

不能成为全局 vitality score。

---

# 27. 同旺 / 同衰是当前明确不能解决的两格

## 27.1 source 旺 + target 旺

现有材料没有给出一个跨来源通则：

```text
control relation 必实现
```

或：

```text
双方相抵归零
```

或：

```text
谁临月谁赢
```

必须继续看：

```text
日月
动静
path
第三方
时间
```

## 27.2 source 休囚 + target 休囚

同样不能写：

```text
双方都弱 → 无作用
```

因为：

```text
source movement
future source prosperity
third-party support
```

都可能改变结果。

因此：

```text
same_force_class_reducer
= not ready
```

---

# 28. Modern Horizontal Review A · 王虎应

王虎应《六爻预测自修宝典》第十三章对本题给出较完整现代系统化：

```text
动卦：
动爻一般可生克静爻
静爻不可以生克动爻
即使静爻旺、动爻休也不反转

但：
若动爻休囚而当前不能作用
→ 等其转旺时可作用

静卦：
旺相静爻可生休囚静爻
也可克休囚静爻
```

来源分组：

```text
MOD-WHY
```

这与：

```text
ZSBY static hexagram
+
moving-vs-static action asymmetry
```

高度兼容。

但 WHY 又明确加入：

```text
weak moving source may need future prosperity
```

所以其 modern current-effect policy 不能简化成：

```text
动爻一动就立刻完全兑现
```

---

# 29. Modern Horizontal Review B · 朱辰彬

《古筮真诠》第十五章系统化得更严格。

在其：

```text
动卦 + 吉凶判断层
```

框架中：

```text
有用动爻
即使休囚衰弱
→ 仍有能力生克冲合目标静爻
→ 主要差异落到作用时间
```

同时：

```text
普通静爻
即使旺相
→ 在动卦吉凶层也不生克冲合其他爻
```

但如果静爻被：

```text
日冲
或符合其暗动规则
```

重新取得 activity qualification，则另论。

来源分组：

```text
MOD-ZCB
```

这是一套内部一致、很适合程序化的现代体系。

但 shared classical layer 不得把其中：

```text
动卦内所有普通静爻对所有他爻都没有生克冲合功能
```

当作古典已经完全共同证明的 universal rule。

分类：

```text
modern_school_specific_formalization
```

---

# 30. WHY 与 ZCB 的相容点

两家现代体系都基本支持：

```text
1. 静卦中静爻旺衰可以决定机械生克资格
2. 动卦中 movement 是非常重要的作用资格
3. 静爻不能简单凭“旺”反压一个 active moving source
4. 休囚 / 旺相仍与作用时机有关
5. 不能只看五行 relation 不看动静
```

因此这些可作为：

```text
modern_cross_author_compatible_direction
```

但不等于：

```text
identical algorithm
```

---

# 31. WHY 与 ZCB 的真实 scope difference

至少存在两个不能磨平的细节。

## 31.1 弱动当前作用

WHY 表述保留：

```text
若动爻休囚，当前不能作用于他爻
→ 待旺时再作用
```

ZCB 则更强调：

```text
只要属于有用动爻
即使休囚衰弱
→ 仍具生克冲合静 target 的资格
→ 差别主要在作用时间
```

二者总体都 time-sensitive，但：

```text
当前 action threshold
```

并非完全同一个 formal definition。

## 31.2 moving hexagram 内的 static-static

ZCB 明确规定：

```text
动卦吉凶层普通静爻不生克其他爻
```

WHY 当前检出的直接文本则主要明确：

```text
静爻不能生克动爻
```

并单独说：

```text
静卦中的静爻可按旺衰生克
```

对于：

```text
动卦中两个普通静爻彼此
```

WHY 的公开段落没有同等直接给出完整定义。

因此不能把两家合并成一条伪 modern consensus。

---

# 32. Modern 外部 witness 不进入 normalized consensus

现代还有其他作者提出：

```text
休囚动爻只要不空破墓绊等
仍可作用旺静 target
```

或提出：

```text
动爻之间先作用，再作用静爻
```

这些可以帮助发现研究问题。

但当前 normalized modern groups 只有：

```text
MOD-WHY
MOD-ZCB
```

所以外部现代材料只能标：

```text
external_modern_witness
```

不得用来抬高：

```text
modern_consensus
```

---

# 33. Relation-Type Matrix

当前不能把所有关系套同一个动静规则。

| relation | static-static | moving-static | static-moving | current classification |
|---|---|---|---|---|
| controls | fully-static 旺→休 supported | strong action priority | direct classical denial/disfavor | strongest shared evidence |
| generates | fully-static 旺→休 supported | shared candidate supported | universal denial not classically established | asymmetric evidence |
| six_harmony | separate harmony/binding family | typed state | typed state | not this reducer |
| six_clash | separate trigger/disruption family | typed state | typed state | not this reducer |
| same_element | structural only | structural only | structural only | no action rule here |

因此未来如果真的 formalize：

```text
mechanicalInteractionEligibility(relation,...)
```

也不能假定：

```text
all relations share one policy
```

---

# 34. Activity Class Matrix

研究层当前可安全保存：

| source | target | shared research state |
|---|---|---|
| static | static | supported when fully static + clear relative-force condition |
| moving | static | strong mechanical eligibility, relation-specific |
| static | moving | control counteraction generally denied / limited; other relations unresolved by shared classical universal rule |
| moving | moving | interaction exists; needs path adjudication |
| dark moving | static/moving | not ordinary static; separate activity provenance |
| transformed line | original line | only local return topology under ZSBY strict model |

这张表不是 runtime contract。

---

# 35. Relative Force Matrix · 只允许局部命题

当前可以安全写：

```text
STATIC vs STATIC / fully static
旺 source → 休 target
= supported

STATIC vs STATIC / fully static
休 source → 旺 target
= control generally unsupported

MOVING vs STATIC
movement gets action priority
= supported

MOVING vs MOVING
= no simple旺衰-only winner
```

不能写：

```text
旺 +2
相 +1
休 -1
囚 -2
动 +3
```

也不能写：

```text
sourceScore > targetScore → effective
```

---

# 36. “两爻俱静，以旺为先；有动，以动为急”的最终定位

这句话现在可以进入 shared research kernel，但必须有三个限制。

## 限制一：它是 local precedence，不是 total order

```text
以旺为先
```

不是：

```text
旺爻在全卦所有关系中永远最高
```

```text
以动为急
```

也不是：

```text
动爻无视空破墓绊回头克
```

## 限制二：它不替代 Effectiveness

仍需：

```text
path
source condition
target condition
time
```

## 限制三：relation family 要保留

原段对：

```text
克、合、刑、冲
```

本来就有不同表达。

不能把它翻译成所有 relation 的统一数学排序。

最终分类：

```text
bounded_local_precedence_heuristic
```

---

# 37. 对 Directed Interaction Effectiveness 的修订

上游模型：

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

继续成立。

本轮对 `Source Actionability` 作进一步拆分：

```text
Source Mechanical Eligibility
+
Source Current Force / Availability
```

原因：

```text
休囚动爻
```

可以：

```text
机械资格存在
```

但：

```text
当前实际兑现程度 / 时间
```

仍受其他条件影响。

所以未来更准确的研究骨架是：

```text
Topology
↓
Mechanical Eligibility
↓
Source Condition / Availability
+
Target Condition
+
Path
↓
Current Realization
↓
Temporal Manifestation
```

---

# 38. 对 Static Node 的 future data contract 要求

即使 static line 当前没有 outward mechanical edge，也必须保留：

```text
line identity
branch / element
relative season condition
calendar relations
void / break / tomb / binding
role membership
dark-moving eligibility
requested pair structural relations
```

因为它可能在：

```text
fully static reading
future time
暗动
冲开 / 填实
```

等条件下重新取得作用职责。

这再次证明：

```text
no current edge
≠ delete node
```

---

# 39. 对 CrossObservationRelation 的意义

复合观察规范要求：

```text
Primary ↔ Self
Primary ↔ Counterparty
Primary A ↔ Primary B
```

可以独立建立 relation。

本轮说明：

```text
CrossObservationRelation
```

仍然只能先保存：

```text
structural / role relation
```

是否机械作用，还要走：

```text
activity-class + relative-force + path
```

因此禁止：

```text
CrossObservationRelation.controls
→ active constraint
```

一步升级。

---

# 40. 与 current Time v2 的边界

本轮虽然发现：

```text
旺爻受动克可能过时受毒
休爻受动生可能待时得意
```

但不修改 Time Engine。

原因：

1. 当前 v13.44.0 时间专项已冻结；
2. multi-observation timing synthesis 仍未 formalize；
3. current vs deferred effect 的传统职责只是刚得到进一步清晰化；
4. 将其塞进现有六维 TimeEffect 可能重复计算 source/target condition。

因此本轮只登记：

```text
relative-force temporal manifestation
= future Time integration dependency
```

不是 implementation request。

---

# 41. 当前 Runtime 不能从“moving”直接认定 final effect

本研究为未来审计登记以下风险：

```text
A. moving source + controls target
   是否被 runtime 直接映射 final adverse effect

B. static source 是否被无条件完全排除

C. static-static fully-static reading 是否完全缺失

D. target旺相是否被 movement 一步覆盖

E. source休囚是否被 movement 一步覆盖

F. current effect 与 deferred effect 是否混成一条
```

本轮不读写 / 不修这些 runtime。

---

# 42. Shared Static / Relative-Force Research Kernel v0.1

## RF-1 · Structural Relation First

```text
A controls / generates B
```

先只是 neutral topology。

## RF-2 · Static Is Not Globally Inactive

```text
fully static hexagram
+
旺相 static source
+
休囚 static target
→ mechanical interaction can exist
```

## RF-3 · Moving Has Local Action Priority Over Static

```text
moving source
vs
static target
```

在 control 等传统明确关系中具有强 action priority。

## RF-4 · Movement Does Not Equal Final Victory

```text
moving
≠ unconditional current effect
```

## RF-5 · Static Counter-Control of Moving Is Not Equal

```text
static control source
vs
moving target
```

传统不赋予与 moving source 对等的 counteraction qualification。

## RF-6 · Generate Requires Separate Scope

不能把 RF-5 自动扩成：

```text
static can never generate moving
```

shared classical universal evidence 不足。

## RF-7 · Target Condition Remains Independent

```text
旺 / 休
```

不能被 movement 事实删除。

## RF-8 · Temporal State Remains Independent

```text
current
vs
later manifestation
```

必须分层。

## RF-9 · Moving-Moving Exists

```text
moving → moving
```

是传统真实 network。

## RF-10 · Moving-Moving Needs Path Review

没有统一：

```text
旺动 > 衰动
```

或：

```text
先出现的动爻 > 后出现的动爻
```

shared rule。

## RF-11 · Same-State Same-Force Can Remain Unresolved

```text
旺 vs 旺
休 vs 休
动 vs 动
```

没有稳定 winner 时保留 unresolved。

## RF-12 · No Numerical Vitality

不建立：

```text
strength score
```

---

# 43. Evidence Classification Summary

| 命题 | 主要来源 | 当前分类 |
|---|---|---|
| 六爻全静时旺静可生克休静 | ZSBY | `classical_direct` |
| 旺静克休静 / 休静难克旺静 | HJC/DYTJ compatible | `cross_text_compatible` |
| 休囚动可克旺静 | ZSBY | `classical_direct` |
| 静爻不与动爻等权反克 | ZSBY / DYTJ / HJC transmission | `strong_cross_text_compatible` |
| 两静以旺为先、有动以动为急 | HJC transmission | `classical_direct_local_precedence` |
| 旺爻受动克可延后受害 | BSZZ | `classical_direct_temporal_qualification` |
| 休爻受动生可待时得用 | BSZZ | `classical_direct_temporal_qualification` |
| 动爻生克世仍须分旺衰、待时 | YY | `independent_topic_support` |
| 动爻可作用动爻 | DYTJ / 碎金赋 transmission | `classical_direct_network_support` |
| 动动永远先于动静 | 现代评注常见 | `not_shared_classical_established` |
| 动卦普通静爻完全不作用任何爻 | ZCB | `modern_school_specific` |
| 静卦旺静可生克休静 | WHY / ZCB | `modern_cross_author_compatible` |
| 弱动当前作用阈值 | WHY vs ZCB | `modern_scope_difference` |

---

# 44. Provenance Audit

## 44.1 TRAD-ZSBY

用于：

```text
fully-static static interaction
moving-over-static example
downstream actionability consequence
dark-moving distinction
```

## 44.2 TRAD-HJC-TRANSMISSION

```text
黄金策
卜筮全书相关收录
```

对：

```text
两静以旺为先 / 有动以动为急
```

只按一条 transmission lineage 处理。

## 44.3 TRAD-DYTJ

用于 compatible witness：

```text
旺克休
休难克旺
动克静
静难克动
```

但若句式与传抄材料高度同文，正式 Evidence 仍做 passage-level independence check。

## 44.4 TRAD-BSZZ-INDEPENDENT candidate

本轮采用：

```text
旺相休囚论第十三
```

作为 current / future temporal qualification。

该段应在正式 Evidence promotion 前再做一次 bounded independence review。

## 44.5 TRAD-YY

用于：

```text
动爻作用仍分衰旺
+
待动爻生旺月日落实
```

## 44.6 外部传统 witness

```text
多能鄙事
海底眼等
```

当前未进入 normalized registry。

只保存：

```text
external witness
```

不计独立票。

## 44.7 Modern

```text
MOD-WHY
MOD-ZCB
```

继续按作者体系，不按著作数量累计。

---

# 45. Explicit Non-Inferences

本轮明确禁止：

```text
静爻 = 永远不能作用

六爻全静旺静可克休静
→ 动卦所有静爻都能彼此同样作用

两爻俱静以旺为先
→ 旺爻全局最高优先级

有动以动为急
→ 动爻无条件战胜所有旺静爻

休囚动克旺静例
→ 所有休囚动爻当前都必有效

静爻克不得动爻
→ 静爻对动爻任何关系都不存在

静不得克动
→ 静绝不能生动

动爻可生静
→ 生扶一定当前兑现

旺 target 被动克
→ target 当前立即失效

休 target 得动生
→ target 当前立即转旺

BSZZ 待时
→ ZSBY 动克旺静案例无效

ZSBY 动克旺静
→ BSZZ 待时规则错误

动动关系存在
→ 所有动动都先于动静

动动关系存在
→ 两个动爻只看旺衰即可

旺旺 → 相抵
休休 → 都无力

movement = strength bonus
旺 = numeric score
休囚 = numeric penalty

relative force
→ final domain outcome

current runtime behavior
→ traditional evidence
```

---

# 46. Research Readiness Matrix

| 问题 | 状态 |
|---|---|
| 静爻是否绝对无机械作用 | `no` |
| 六爻全静时旺静是否可生克休静 | `yes, direct` |
| 六爻全静时休静能否稳定克旺静 | `generally no for control` |
| 动卦中两个普通静爻能否继续互相生克 | `shared classical unresolved` |
| moving source 能否克 static target | `yes` |
| 休囚 moving 能否克旺 static | `yes as direct ZSBY action example` |
| 是否因此意味着旺 target 当前立即完全失效 | `no` |
| static source 能否等权反克 moving target | `generally denied` |
| static source 能否生 moving target | `shared universal rule unresolved` |
| moving source 能否生 static target | `yes as generic mechanical candidate` |
| moving 与旺衰谁全局优先 | `no total order` |
| moving-moving 是否真实存在 | `yes` |
| moving-moving winner reducer | `not ready` |
| 旺旺如何裁决 | `unresolved` |
| 休休如何裁决 | `unresolved` |
| current / future effect 是否必须分层 | `yes` |
| WHY 与 ZCB 是否完全一致 | `no` |
| 可否建立 numeric force score | `no` |
| 可否 Formal Expansion | `no` |

---

# 47. 对前序研究的正式修正

## 47.1 修正 “active source” 术语

此前很多文档方便地说：

```text
active source → target
```

本轮之后必须避免让读者误以为：

```text
只有 moving / dark-moving 才可能有 mechanical source
```

更准确：

```text
mechanically eligible source
```

可能包括：

```text
moving / dark-moving
```

以及在限定场景中：

```text
旺 static source in a fully static hexagram
```

## 47.2 不推翻 Activity Provenance

这不意味着：

```text
静爻也算 ACTIVE
```

Activity Fact 仍然应该诚实记录：

```text
VISIBLE_MOVING
DARK_MOVING
STATIC
```

只是 mechanical eligibility 不能直接等同 activity label。

## 47.3 不推翻 Directed Interaction Effectiveness

恰恰相反，本轮证明：

```text
eligibility
≠ effectiveness
```

需要保留得更严格。

---

# 48. 未来形式化前至少需要的输入职责

如果未来真的设计 relative-force adjudicator，研究上至少需要：

```text
sourceRef
targetRef
relationFamily
relationDirection
sourceActivityProvenance
targetActivityProvenance
hexagramHasVisibleMovement
sourceSeasonCondition
targetSeasonCondition
sourceCalendarFacts
targetCalendarFacts
sourcePathState
targetPathState
localTransformFeedback
selectedThirdPartyModifiers
temporalScope
analysisLayer
sourceEvidenceProvenance
```

这不是 schema proposal。

它只是说明：

```text
source.moving + source.wang
```

远不足够。

---

# 49. 为什么当前仍不应该做 Relative Force Reducer

现在虽然已经能写若干 local rule，却仍缺至少四个 blocker：

```text
1. moving-vs-moving internal network
2. moving hexagram 内 static-static 的 shared scope
3. same-state same-force adjudication
4. current realization vs future manifestation 的统一接口
```

因此若现在做：

```text
compareForce(source, target)
```

程序必然会自行发明未被传统证明的 tie-breaker。

所以：

```text
Relative Force Reducer
= not ready
```

---

# 50. Final Decision

```text
Static Mechanical Interaction
= traditional-research-supported in bounded contexts

静爻
≠ globally passive

fully static hexagram
+
旺 static source
+
休 static target
→ static mechanical action supported

moving source
+
static target
→ strong local action priority supported

but

movement
≠ unconditional final effect

source旺衰
target旺衰
path
time
= remain independent responsibilities

static counter-control of moving
= classically limited / denied in direct local rules

static generation of moving
= universal shared denial not established

moving-moving interaction
= real traditional network

moving-moving global ordering
= not established

两静以旺为先 / 有动以动为急
= bounded local precedence
≠ total order

same-state same-force reducer
= unresolved

current effect
≠ future manifestation

WHY / ZCB
= compatible on broad architecture
= not identical current-effect policies

numeric vitality / force score
= rejected

runtime reducer
= not ready

Formal Expansion
= not authorized
```

---

# 51. Recommended Next Research

下一步最高收益不是继续泛化 Static，而是处理目前反复阻塞：

```text
Moving-vs-Moving Interaction Adjudication & Dynamic Chain Review v0.1
```

重点只回答：

1. 两个或多个 moving lines 彼此生克时，传统如何确定真实 path；
2. 《碎金赋》的：
   - 克 source；
   - 生 source；
   - 泄 source；
   - 贪生忘克；
   - 连续相生；
   - 连续相克；
   能否形成共享 typed dynamic-chain vocabulary；
3. `动爻之间先作用于静爻之前` 是否真有古典 direct support，还是现代教学总结；
4. 两动都旺、都衰、一旺一衰时旺衰是否改变 chain resolution；
5. moving source 被另一个 moving source 克制后，是：
   - source suppression；
   - path removal；
   - partial weakening；
   还是 context-dependent；
6. 贪生忘克是否要求严格五行链 / 特定 source-target topology；
7. 多个 moving sources 同时指向同一 target 时，如何与前面“四处中的动爻通道”衔接；
8. 哪些命题是传统 direct，哪些只是后世现代评注；
9. 如何保持：

```text
multi-moving internal channel reducer
= unresolved until proven
```

而不为四处综合强行造票。

如果该专项仍不能得到通用 reducer，合法结果应是：

```text
Typed Dynamic Chain Facts
+
Local Path Rules
+
Unresolved Mixed Network
```

而不是：

```text
moving line score / priority number
```

。