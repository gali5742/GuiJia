# 龟甲 · 六爻 Directed Interaction Effectiveness Research v0.1

日期：2026-09-03

状态：`research_complete_design_only_no_synthesis_rule`

范围：六爻共享研究层 / 有向爻际作用效力。

上游：

- `liuyao-line-effectiveness-synthesis-readiness-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `liuyao-line-relation-fact-provenance-review-v0.1.md`
- `shared-line-pair-fact-provider-research-v0.1.md`
- `liuyao-move-transform-fact-provenance-review-v0.1.md`
- `travel-transport-active-control-interaction-evidence-review-v0.1.md`
- `travel-transport-active-control-source-effectiveness-review-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`

> 本研究只回答：当 reading 中已经存在明确的 `source → target` 五行克制关系时，传统材料是否支持把“关系存在”进一步升级为“当前实际有效作用”，以及这一层至少需要保留哪些条件。v0.1 只审 `controls`，不泛化到 `generates / six_clash / six_harmony`，不建立任何主题结论、评分、概率或正式 runtime contract。

---

# 1. 研究起点

已有结构层可以安全表达：

```text
source line is active
+
source CONTROLS target
↓
active control interaction exists
```

但前一轮已经确认：

```text
active control interaction
≠ effective control
```

原先可能设想：

```text
source effectiveness
↓
effective control
```

本研究进一步确认这一结构仍然过窄。

传统判断至少同时处理：

```text
A. source 当前有没有足够作用能力
B. target 当前是什么状态，是否承受 / 抵抗该作用
C. source → target 的作用路径是否通畅
D. 当前受限状态是永久失效，还是等待时机恢复
```

因此：

```text
Directed Interaction Effectiveness
```

应理解为：

```text
一个有方向、有对象、有时间窗口的关系判断
```

而不是：

```text
source 单爻的全局属性
```

---

# 2. 最核心传统依据：旺衰是相对作用条件

## 2.1 《断易天机》

《断易天机》明确出现：

```text
相爻克得休囚爻
休囚爻克不得旺相爻
动爻克得安静爻
静爻克不得动爻
```

并在解释“旺”时进一步举例：

```text
所用之爻旺
即使有衰爻来克
也未必伤得动
```

这直接说明：

```text
A controls B
```

只是结构关系；真正的克伤结果要看：

```text
source condition
relative to
target condition
```

来源：

```text
SRC-DYTJ
independenceGroup = TRAD-DYTJ
location = 反神类 / 旺字取用
```

分类：

```text
classical_direct_relative_force_support
```

## 2.2 《卜筮全书·通玄妙论》

同样保存：

```text
旺相能克休囚
休囚难克旺相
```

这一命题与《断易天机》高度接近。

但 Source Registry 已明确提醒：

```text
断易天机
↔
卜筮全书部分天玄赋 / 公式
```

存在 bounded shared / inherited formula 风险。

因此在未来正式 Evidence 中：

```text
SRC-DYTJ + SRC-BSQS
```

不得仅因出现两本书就机械计为两条独立证据。

本研究只将其视为：

```text
additional textual witness
```

而不是自动增加 independence vote。

分类：

```text
transmission_overlap_requires_scope_review
```

## 2.3 《易隐》

《易隐》在流年类判断中也明确提出：

```text
动爻生合刑冲克害世者
当分衰旺
旺相能生克休囚
休囚不能生克旺相
```

其当前 normalized source group 为：

```text
SRC-YY
independenceGroup = TRAD-YY
```

但由于该公式与更早文本措辞非常接近，若未来要以“完全独立公式”为证据升级 tier，仍建议在 Evidence scope 做一次传承检查。

当前最安全结论：

```text
relative-force principle
= cross-text compatible
```

而不是：

```text
three fully independent identical rules
```

---

# 3. 《增删卜易》把 source 与 target 明确放在同一判断链

《增删卜易·元神忌神衰旺章》直接区分：

```text
忌神动而克害用神
vs
忌神虽动而不能克用神
```

同时在章末强调：

```text
论元神 / 忌神有力无力
仍须用神有气
```

并以“用神无根”为例说明：

```text
即使外部存在生扶
target 自身状态仍会改变作用能否兑现
```

这里的重要性不只是旺衰规则本身，而是传统判断结构已经明确是：

```text
source
+
target
↓
interaction result
```

而不是：

```text
source strong
↓
自动推出作用成立
```

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 元神忌神衰旺章第十
```

分类：

```text
classical_direct_source_target_joint_adjudication
```

---

# 4. Source Force 只是 Directed Effectiveness 的第一部分

前一轮已整理 source 侧候选因素：

```text
旺相 / 休囚
临日月
日月生扶 / 克制
其他动爻生扶 / 克制
回头生 / 回头克
进神 / 退神
墓 / 绝
旬空
月破
```

本研究保留这些因素，但作一个更严格的职责限制：

```text
source force facts
only describe the source side
```

它们不能单独输出：

```text
control_effective = true
control_effective = false
```

### 4.1 可明确支持 source-force 的条件

《增删卜易》把：

```text
旺相
临日月
得日月动爻生扶
回头生
化进
长生帝旺于日辰
```

列入有力条件。

把：

```text
休囚且被克
衰动化退
衰而绝
入墓
动化绝 / 化克 / 化破 / 化散
```

列入无力条件。

但这些条件经常本身就是组合条件，因此：

```text
single tag → binary effectiveness
```

仍然禁止。

### 4.2 RETREAT 仍只能是 weakening candidate

传统总论是：

```text
衰 + 动 + 化退
→ 无力条件
```

并非：

```text
RETREAT alone
→ 无力
```

因此保留：

```text
RETREAT
= source_force_weakening_candidate
```

不升级为：

```text
source ineffective
```

### 4.3 RETURN_CONTROL 也不能机械判死

回头克对 source 本身明显形成约束，但当前研究没有得到一个足够稳定的全局优先级：

```text
RETURN_CONTROL
vs
临月建 / 日扶 / 其他动爻生扶
```

谁在所有情形下必然覆盖谁。

所以：

```text
RETURN_CONTROL
= source_self_constraint_candidate
```

而非：

```text
source_effective = false
```

---

# 5. Target Condition 是独立职责，不能藏在 source score 里

传统的：

```text
旺相能克休囚
休囚难克旺相
```

本身已经把 target 状态纳入关系判断。

因此未来研究层至少必须能够同时保留：

```text
source_force_state
+
target_condition_state
```

而不能预先压成：

```text
source_strength_score = 7
```

再只根据 source score 判断作用。

## 5.1 Target condition 也不能只做 strong / weak

目标一侧实际还可能包含：

```text
临日月
得生扶
受克
旬空
月破
入墓
动静
变爻状态
```

并且：

```text
target 旺
```

与：

```text
target 当前可兑现 / 可承受作用
```

也不是完全相同的概念。

因此本研究不注册：

```text
targetResistance = high / low
```

只确认：

```text
target condition must remain explicit
```

## 5.2 source / target 同时旺衰时的统一优先级仍未解决

例如：

```text
source 旺
+
target 旺
```

或：

```text
source 休囚
+
target 休囚
```

当前材料不足以直接生成一套跨主题、跨时距统一的离散胜负表。

所以：

```text
relative-force synthesis
= not ready
```

不能偷偷使用：

```text
旺=+2
相=+1
休=-1
囚=-2
```

之类现代计分替代传统规则。

---

# 6. 合住证明 Action Availability 与 Force 必须分开

《黄金策》相关传统在《卜筮全书》收录中明确指出：

```text
动值合而绊住
```

并直接举例：

```text
忌爻发动
但被日辰合住
→ 不能直接克用
```

这里不能解释成：

```text
source 不旺
```

因为问题不是 source 有没有力量，而是：

```text
source 当前被绑定
作用不能自由发出
```

因此 Directed Effectiveness 至少必须分：

```text
source force
vs
source action availability
```

来源：

```text
SRC-HJC / SRC-BSQS witness
independenceGroup = TRAD-HJC-TRANSMISSION
location = 黄金策上 · 动值合而绊住
```

分类：

```text
classical_direct_action_binding_support
```

---

# 7. 入墓同样更接近“作用受限”，而非纯粹弱化

同一《黄金策》传统紧接“合住”之后提出：

```text
入墓难克
```

并以：

```text
原本可克主象之爻
因被墓库收住
→ 主象不受其伤
```

说明：

```text
墓
```

可以承担：

```text
interaction confinement
```

而不仅是：

```text
strength - 1
```

但《增删卜易》的墓绝体系又存在：

```text
旺衰
冲墓
生扶
```

等恢复 / 条件判断。

因此当前只允许：

```text
TOMB
= force / availability constraint candidate
```

不得写成：

```text
TOMB = permanently ineffective
```

这也是未来需要保留“为什么当前作用受限”的原因。

---

# 8. 元忌同动证明 Interaction Path 可以被重新导向

《增删卜易》把：

```text
忌神与元神同动
```

列入“忌神虽动而不能克用”的条件。

其案例进一步表现为：

```text
忌神本来克用
↓
忌神转而生元神
↓
元神再生用神
```

这是一个真正的：

```text
path redirection
```

而不是：

```text
source weakness
```

所以未来不能把：

```text
被克制
被合住
入墓
通关 / 接续相生
```

全部压成：

```text
source ineffective
```

其中至少需要区分：

```text
force insufficient
availability constrained
path diverted
```

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 元神忌神衰旺章第十
```

分类：

```text
classical_direct_network_redirection_support
```

---

# 9. 日月和第三爻可以改变 source → target 路径

《增删卜易·月将章》明确说明月建具有：

```text
扶衰弱
挫旺强
制服动变之爻
```

的职责。

并直接写到：

```text
卦有动爻克静爻
月建亦能制服该动爻
```

这说明：

```text
source controls target
```

之外还可能存在：

```text
calendar / third-party actor
→ constrains source
```

因此完整的 Directed Effectiveness 不是简单 line pair 静态比较，而可能需要至少局部网络：

```text
third actor
→ source
→ target
```

但本研究不因此建立完整 6×6 网络推理器。

只确认：

```text
third-party intervention is a legitimate effectiveness responsibility
```

---

# 10. VOID / MONTH_BREAK 证明 Current Effect 与 Future Effect 必须分开

## 10.1 旬空

《增删卜易》明确反对：

```text
动爻临空 / 化空
→ 一概无用
```

而允许：

```text
旺动临空 / 化空
→ 当前可能未显
→ 冲空 / 实空后应事
```

所以旬空至少可能同时具有：

```text
current availability constraint
+
future recoverability
```

不能只写：

```text
ineffective
```

## 10.2 月破

《增删卜易·月破章》明确反驳旧说：

```text
月破动爻绝无作用
```

而认为：

```text
目下虽破
出月 / 实破 / 逢合后可恢复
```

《卜筮正宗》又专设：

```text
辟易林补遗月破旬空之谬
```

主张月破、旬空在符合条件时可在出月 / 出旬后再应。

而《易林补遗》本身对空破“不生不克”的表述更强。

这说明：

```text
exact void / break effect
```

存在真实流派差异。

因此未来必须保存：

```text
currentEffectState
futureRecoverability
sourceSchool / evidence provenance
```

而不是把冲突平均成一个 synthetic score。

来源：

```text
SRC-ZSBY / TRAD-ZSBY
SRC-BSZZ / TRAD-BSZZ-INDEPENDENT（辟易林补遗段）
《易林补遗》 = external witness, normalized registry pending
```

分类：

```text
nonbinary_temporal_effect = cross_source_compatible
exact_void_break_rule = school_conflicted
```

---

# 11. v0.1 最小研究模型

本研究不注册代码 schema，但允许把最小概念模型写成：

```text
Directed Control Interaction
│
├─ 1. Topology
│    source CONTROLS target
│
├─ 2. Source Actionability
│    source force
│    source current availability
│
├─ 3. Target Condition
│    target relative strength / rootedness / availability
│
├─ 4. Path State
│    direct
│    bound
│    confined
│    diverted
│    third-party constrained
│
└─ 5. Temporal State
     current manifestation
     deferred / recoverable
     timing unresolved
```

注意：

```text
Source Actionability
```

仍不是：

```text
Source Strength Score
```

而：

```text
Path State
```

也不是：

```text
adverse / favorable
```

它们都只是“作用是否能沿该方向兑现”的不同职责。

---

# 12. 研究状态词建议

为了避免未来过早二值化，本研究只建议概念词，不授权成为 enum：

```text
topology_confirmed
current_effect_supported
current_effect_constrained
effect_deferred_recoverable
effect_path_bound
effect_path_diverted
target_resistance_present
mixed_or_unresolved
```

这些状态：

```text
可并存
```

例如：

```text
source 旺
+
source 月破
+
path direct
+
target 休囚
```

可能同时意味着：

```text
source force 有支持
current manifestation 受限
future recoverability 存在
target 较易受作用
```

不能要求系统只选择一个标签。

---

# 13. 为什么禁止 single final label

若强行输出：

```text
effective
weak
ineffective
```

会至少丢掉四种传统上有意义的区别：

```text
1. 无力
2. 有力但被合住
3. 有力但作用被通关转向
4. 当前受空破限制但未来可恢复
```

这四种状态对后续应期、主题结论和解释都不等价。

因此：

```text
single final effectiveness label
= lossy abstraction
= rejected for v0.1
```

---

# 14. Source independence audit

## 14.1 可明确独立使用

```text
SRC-ZSBY
→ TRAD-ZSBY
```

用于：

```text
元神忌神有力 / 无力
source-target joint condition
元忌同动 path redirection
空破非绝对失效
```

```text
SRC-BSZZ
→ TRAD-BSZZ-INDEPENDENT
```

仅对：

```text
辟易林补遗月破旬空之谬
```

这一独立评论段使用。

## 14.2 必须注意传承重叠

```text
SRC-HJC
SRC-BSQS
```

当采用《黄金策》相关同一段时统一：

```text
TRAD-HJC-TRANSMISSION
```

不能双计。

```text
SRC-DYTJ
SRC-BSQS
```

涉及天玄赋 / 高度相同公式时继续执行：

```text
shared_or_inherited_formula_requires_evidence_scope_review
```

## 14.3 《易隐》

registry 默认：

```text
TRAD-YY
```

但本研究所取“旺相能生克休囚”措辞与其他传统极近。

因此：

```text
可作 compatible witness
```

若未来用它提升 consensus tier：

```text
先做 evidence-specific transmission check
```

## 14.4 新外部来源

```text
《易林补遗》
```

本轮只作为冲突 witness。

若未来进入正式 Evidence，需先扩展：

```text
source provenance registry
```

本研究不修改机器 registry。

---

# 15. 对现有 Fact Infrastructure 的影响

当前底层已经有：

```text
Line Status Facts
Line Activity Facts
Move / Transform Facts
```

并且：

```text
Shared Line-Pair Structural Fact Provider
```

已完成 design research，但尚未正式实现。

本研究进一步确认：未来若真的进入 shared Effectiveness，不只是消费：

```text
source line facts
```

还需要：

```text
target line facts
requested pair relation facts
selected third-party relation facts
```

但这只是架构依赖发现，不是 Formal Expansion 授权。

当前不得：

```text
在 Travel 内复制 6×6 关系计算
读取 legacy use-god direct facts 代替 target-agnostic relation
从 presentation helper 的 support/constraint 反推 effectiveness
```

---

# 16. 对 Travel Transport 的直接结论

当前已允许：

```text
resolved transport
+
VISIBLE_MOVING source
+
source CONTROLS transport
↓
transport_active_control_interaction
```

本研究之后仍然不允许直接升级：

```text
transport_blocked
transport_delayed
transport_cancelled
```

更稳的链是：

```text
transport_active_control_interaction
+
Directed Interaction Effectiveness evidence
↓
transport_blocking_pressure candidate
↓
Travel / Transport Assessment
```

即使未来确认：

```text
effective adverse interaction
```

也只说明：

```text
对 transport 存在实际有效的不利压力
```

不自动说明现实结果是哪一种。

---

# 17. 跨主题意义

本研究不是 Travel 私有规则。

任何主题只要出现：

```text
resolved traditional observation target
+
another line acts on that target
```

都可能需要同一层。

潜在包括：

```text
Career
Study
Litigation
Lost Property
Person Return / Contact
Travel / Transport
```

但各主题只能消费：

```text
有效作用的结构 Evidence
```

不能让共享层直接输出：

```text
录用失败
考试不通过
官司败诉
失物找不到
行人不归
航班取消
```

这些仍属于 Domain Assessment。

---

# 18. 当前仍未解决的问题

本研究已经解决：

```text
Directed Interaction Effectiveness 是否有传统依据
→ yes

是否可以 source-only
→ no

是否可以 binary boolean
→ no

是否需要 target condition
→ yes

是否需要 path state
→ yes

是否需要 temporal recoverability
→ yes
```

但仍未解决：

```text
1. source / target 同旺、同衰时如何裁决
2. 日月、动爻、回头生克之间是否存在稳定优先级
3. 多个第三爻同时制化时如何解释
4. 合住、入墓、空破同时出现时是否有统一 precedence
5. DARK_MOVING source 是否与 VISIBLE_MOVING 完全同权
6. changed line / hidden spirit 是否进入同一 directed interaction model
7. generates 是否可以使用完全同构的 effectiveness contract
8. six_clash / six_harmony 是否属于 interaction effectiveness 还是 trigger/path layer
9. 当前作用与未来应期如何正式衔接 Time Engine
```

所以：

```text
Directed Interaction Effectiveness synthesis
= not ready
```

---

# 19. 下一步研究优先级

最优先不是写算法，而是继续处理：

```text
Directed Interaction Path / 制化 Review v0.1
```

聚焦：

```text
A. 合住如何解除
B. 入墓如何冲开
C. 第三爻克 source 是否足以阻断 source → target
D. 元神 / 忌神 / 仇神同动如何形成接续相生或反向强化
E. 多个活动爻同时存在时，哪些属于真正 path redirection
F. 哪些只能记为 concurrent interaction，不能决定 precedence
```

其次才是：

```text
Relative Force Adjudication Review
```

因为如果先做 source / target 强弱裁决，却不先处理作用路径，仍可能把：

```text
有力但被合住
```

误判成：

```text
有效克害
```

---

# 20. Final Decision

```text
A controls B
= structural topology only

active A controls B
= active directed interaction only

source force
= insufficient alone

target condition
= mandatory independent responsibility

binding / tomb / third-party control / 元忌同动
= interaction-path responsibilities

void / month break
= may alter current manifestation without proving permanent ineffectiveness

Directed Interaction Effectiveness
= traditional-research-supported shared layer
= multi-axis
= time-aware
= non-binary
= not yet synthesis-ready
```

因此当前正式研究结论为：

```text
Global Line Vitality
→ rejected

Source-only Effectiveness
→ rejected

Directed Interaction Effectiveness
→ research-supported architecture
→ synthesis rule not ready
→ Formal Expansion not authorized
```

current-22、Semantic runtime、正式 Rule Registry、Time Engine、训练数据均不修改。
