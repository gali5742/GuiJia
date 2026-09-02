# 龟甲 · 六爻 Travel Transport Active Control Source Effectiveness Review v0.1

日期：2026-09-03

状态：`research_complete_design_only_source_only_gate_rejected`

主题：`travel.travel_disruption_transport`

上游：

- `travel-transport-active-control-interaction-evidence-review-v0.1.md`
- `liuyao-line-effectiveness-synthesis-readiness-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `liuyao-line-relation-fact-provenance-review-v0.1.md`
- `liuyao-move-transform-fact-provenance-review-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`

> 本研究只审查：当一个已确认的明动 source 对已解析 transport target 存在五行克制时，传统材料是否支持只根据 source 自身状态判定该克制“有效 / 无效”。本研究不建立 Transport Assessment，不修改 current-22、正式 Rule Registry、Time Engine 或任何训练数据。

---

## 1. 研究问题

上轮已允许：

```text
resolved transport target
+
VISIBLE_MOVING source
+
source CONTROLS transport
→ transport_active_control_interaction
```

但明确保留：

```text
effectivenessStatus = unresolved
```

原计划下一层可以设想为：

```text
source line states
→ source effective / ineffective
→ transport_blocking_pressure
```

本轮研究结论是否定该简化：

```text
source-only effectiveness gate
= insufficient
```

传统判断中的“克是否真正落到用神”至少同时依赖：

```text
A. source force / availability
B. target resistance / rootedness
C. interaction path / 制化、合住、通关等网络条件
```

因此即使完成 source 状态审查，也不能单独推出：

```text
transport_blocking_pressure
```

---

## 2. 《增删卜易》：直接存在“有力 / 无力”的作用能力区分

《增删卜易·元神忌神衰旺章》不是只判断某爻“是否发动”，而是明确区分：

```text
忌神动而能克害用神
vs
忌神虽动而不能克用神
```

其中，有力条件包括：

```text
旺相
得日月 / 动爻生扶
临日月
化回头生
化进神
旺动而临空 / 化空
长生帝旺于日辰
```

无力条件则包括：

```text
休囚且受日月 / 动爻克制
入墓
衰而化退
衰而又绝
动化绝 / 化克 / 化破 / 化散
```

这直接支持一个传统结构原则：

```text
moving + controls target
≠ automatically effective control
```

但它也同时表明：

```text
单个状态标签
≠ 独立的全局 effective / ineffective 开关
```

因为多个条件以组合形式出现，例如：

```text
衰 + 化退
休囚 + 被克
旺动 + 临空
```

不能把 `RETREAT`、`VOID`、`EXTINCTION` 等单独抽离后机械赋值。

来源：

```text
SRC-ZSBY
independence = TRAD-ZSBY
```

分类：

```text
classical_direct_effectiveness_structure
```

---

## 3. Source force 的传统候选维度

本轮可以确认 source force 至少不是单轴“旺衰”。

### 3.1 Calendar / support force

可影响 source 作用能力的传统条件包括：

```text
旺相
临日月
日月生扶
其他动爻生扶
日月 / 动爻克制
```

因此已有 atomic calendar facts 可以作为未来 source-force Evidence 的 provenance 输入。

但禁止：

```text
support tag count
constraint tag count
hidden score
```

### 3.2 Transform force

传统直接支持：

```text
化回头生 / 化进
→ 可增强有力条件

衰 + 化退
→ 可进入无力条件

动化绝 / 化克 / 化破 / 化散
→ 可进入无力条件
```

这里最重要的限制是：

```text
RETREAT alone
≠ proven global ineffective
```

《增删卜易》的有力 / 无力总论写的是：

```text
衰动化退
```

而不是无条件：

```text
化退 = 无力
```

虽然同书及现代 transport 案例存在“阻力化退而趋于无力”的具体判断，它仍不应被抽象成全局单标签规则。

因此：

```text
RETREAT on active control source
= weakening candidate
= not decisive alone
```

### 3.3 Tomb / extinction

《增删卜易》把入墓、衰而绝列入无力条件；但其墓绝专论又明确要求结合旺衰、生扶以及冲墓等条件判断。

所以：

```text
TOMB
EXTINCTION
```

只能先登记为：

```text
source_force_constraint_candidate
```

不得直接登记：

```text
source_effective = false
```

---

## 4. VOID 不能作为 source 无效开关

《增删卜易》明确反对：

```text
动爻逢空
→ 一概无用
```

其结构是：

```text
旺动临空 / 化空
→ 仍可有力
→ 但可能等待冲空 / 实空等时机兑现
```

《易冒》也把旬空细分为不同层次，并存在：

```text
旬内 / 旬外
填实
日冲
月建临之
```

等恢复或转换条件。

《易林补遗》对空破不能生克的表述更强，但同样保留发动、旺相、出旬等区别。

因此本轮只能确认：

```text
VOID
= temporal / availability condition
= cannot globally mean ineffective
```

未来至少需要区分：

```text
current manifestation
future recoverability
ultimate force
```

而不是一个 boolean。

来源状态：

```text
SRC-ZSBY = normalized source
《易冒》 = external research witness, provenance registry pending
《易林补遗》 = external research witness, provenance registry pending
```

分类：

```text
cross_source_support_for_nonbinary_void
exact_void_effect = school_conflicted
```

---

## 5. MONTH_BREAK 同样不能作为 source 无效开关

传统材料对月破存在明确分歧。

《增删卜易·月破章》先记录旧说：

```text
月破之忌神即使发动也不能为害
```

随后野鹤以占验反对这一绝对化规则，认为：

```text
动则仍可伤爻
当前虽破，出月 / 实破 / 逢合后可恢复作用
```

《易冒》《易林补遗》对月破的处理又各有不同强弱。

因此：

```text
MONTH_BREAK on active source
≠ globally ineffective
```

更安全的研究状态是：

```text
source_force_constraint_candidate
+
temporal_recovery_possible
+
school_conflicted_exact_effect
```

同理：

```text
TRANSFORM_MONTH_BREAK
```

不得未经专项审查直接等同 source 无力。

---

## 6. 合住证明“source 有力”与“作用能够发出”不是同一件事

《卜筮全书》所收传统明确存在：

```text
动值合而绊住
→ 虽动，作用可被绊住
```

并以忌爻被日辰合住后不能直接克用为例。

这一点非常重要，因为它不是单纯的：

```text
source weak
```

而是：

```text
source may have force
but current action path is bound
```

所以至少要区分：

```text
source force
vs
source action availability
```

同时合住又存在：

```text
逢冲可开
```

的时间恢复语义。

若该段属于《黄金策》传承簇，则正式 independence 必须按：

```text
TRAD-HJC-TRANSMISSION
```

处理，不能因《卜筮全书》《卜筮正宗》等重复收录而多计来源。

分类：

```text
classical_binding_gate_support
```

---

## 7. 元忌同动证明“source effectiveness”不能吞掉 interaction path

《增删卜易》给出：

```text
忌神与元神同动
```

时，忌神虽然本来克用，却可能转而：

```text
忌神生元神
→ 元神生用神
```

形成接续相生。

这种情况不能正确描述为：

```text
忌神 source 没有力量
```

更准确的是：

```text
source 的力量被 interaction network 重新导向
```

因此必须分开：

```text
Source Force Adjudication
```

与：

```text
Interaction Path Adjudication
```

否则未来会把：

```text
无力
被合住
被通关转化
```

错误压成同一个状态。

分类：

```text
classical_network_redirection_support
```

---

## 8. 最大的新发现：effective control 是 source-target 相对关系，不是 source 单体属性

《卜筮全书·断易总论》有明确原则：

```text
旺相能克休囚
休囚难克旺相
```

《增删卜易》在元神忌神章末也特别提醒：

```text
即使元神有力，若用神无根也未必生得起；
即使忌神无力，也不能脱离用神自身状态独立判断结果。
```

所以：

```text
source force strong
```

也仍不等于：

```text
control realizes against target
```

必须至少同时看：

```text
source condition
+
target condition
```

此外，其他动爻的生克制化又可能进一步改变 interaction path。

因此原计划：

```text
Source Effectiveness
↓
transport_blocking_pressure
```

应修正为：

```text
Source Force / Availability
+
Target Resistance / Rootedness
+
Interaction Path / Network
↓
Directed Interaction Effectiveness
↓
transport_blocking_pressure candidate
```

这是本轮最重要的架构结论。

---

## 9. v0.1 状态矩阵

| source condition | 本轮允许的最小结论 | 禁止结论 |
|---|---|---|
| 旺相 / 临日月 / 得生扶 | `source_force_support_candidate` | 直接判 transport blocked |
| 休囚 + 被日月/动爻克 | `source_force_constraint_candidate` | 单标签全局无效 |
| RETREAT | `source_force_weakening_candidate` | `RETREAT = ineffective` |
| PROGRESS | `source_force_support_candidate` | `PROGRESS = effective blocking` |
| RETURN_GENERATE | `source_force_support_candidate` | 自动形成 blocking pressure |
| RETURN_CONTROL | `source_self_constraint_candidate` | 自动 `source_effective=false` |
| VOID | `temporal_availability_condition` | `VOID = ineffective` |
| MONTH_BREAK | `force_constraint + temporal recovery candidate` | `MONTH_BREAK = ineffective` |
| TOMB | `confinement / force constraint candidate` | `TOMB = ineffective` |
| EXTINCTION | `force constraint candidate` | `EXTINCTION = ineffective` |
| HARMONY / 合住 | `action_path_binding_candidate` | 与普通弱化混为一类 |
| 元忌同动 / 通关 | `interaction_path_redirection` | 解释为 source 无力 |

注意：

```text
candidate
```

表示传统结构已经支持其研究职责，但还没有得到可执行的全局 priority / synthesis rule。

---

## 10. Evidence classification

本轮不把所有材料写成：

```text
stable_consensus_global_effectiveness_algorithm
```

更准确的是：

### 稳定结构层

```text
moving relation ≠ effective relation
source / target 旺衰影响克制成立
合住 / 制化可改变作用路径
```

分类：

```text
cross_source_compatible_classical_structure
```

### 精确状态效力层

```text
VOID
MONTH_BREAK
TOMB
EXTINCTION
RETREAT
```

不同来源、不同上下文存在条件差异。

分类：

```text
condition_dependent
+
partially_school_conflicted
```

### Transport 现代映射层

```text
active source controls resolved transport
```

仍只可登记：

```text
transport_active_control_interaction
```

不能因本轮研究直接升级：

```text
transport_blocking_pressure
```

---

## 11. Explicit Non-Inferences

本研究不得推出：

```text
旺 = 一定有力
衰 = 一定无力
动 = 一定有力
空 = 一定无力
月破 = 一定无力
墓 = 一定无力
绝 = 一定无力
退 = 一定无力
进 = 一定有力
合 = 一定失效
克 = 一定阻断
```

也不得通过：

```text
positive status 数量
vs
negative status 数量
```

生成强弱分、概率或 winner。

---

## 12. 对现有 Shared Line Effectiveness 研究的修正

`liuyao-line-effectiveness-synthesis-readiness-v0.1.md` 已正确拒绝：

```text
global line vitality score
```

本轮进一步证明，即使未来需要共享层，也不应只建立：

```text
Line Effectiveness = strong / weak
```

因为领域需要的是：

```text
某 source 对某 target 的定向作用是否能够实现
```

建议下一研究对象从：

```text
Global Line Effectiveness
```

升级为：

```text
Directed Interaction Effectiveness
```

内部至少保持三组职责：

```text
1. source_force_and_availability
2. target_resistance_and_rootedness
3. interaction_path_and_network
```

这应是 LiuYao-wide shared research，不应做成 Travel 私有规则。

---

## 13. 下一步研究优先级

### P0 · Directed Interaction Effectiveness v0.1

优先研究：

```text
source controls target
+
source / target calendar states
+
return generate / return control / progress / retreat
+
void / break / tomb / extinction
+
harmony binding
+
third-line generation/control redirection
```

目标不是形成 score，而是确定：

```text
哪些条件可以直接 adjudicate
哪些只能登记 constraint/support candidate
哪些必须保持 unresolved mixed
```

### P1 · DARK_MOVING source equivalence

单独审：

```text
DARK_MOVING + CONTROLS target
```

是否可与 VISIBLE_MOVING 共用 interaction entry gate。

### P2 · Transport projection

只有 Directed Interaction Effectiveness 有结果后，才回来审：

```text
effective adverse interaction
→ transport_blocking_pressure
```

仍不得直接推出：

```text
delayed / cancelled / failed
```

---

## 14. Final Decision

```text
VISIBLE_MOVING
+
CONTROLS resolved transport
→ transport_active_control_interaction
→ admitted neutral/nonconclusive

source-only effectiveness boolean
→ rejected

global line vitality score
→ still rejected

RETREAT / VOID / MONTH_BREAK / TOMB / EXTINCTION
→ condition-dependent evidence candidates
→ not global switches

next shared research layer
→ Directed Interaction Effectiveness

transport_blocking_pressure
→ still not ready

Transport Assessment
→ still not ready
```

Formal Expansion 仍未授权；本轮仅新增研究文档。