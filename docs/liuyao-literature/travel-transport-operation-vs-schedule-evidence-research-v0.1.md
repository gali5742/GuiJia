# 龟甲 · 六爻 Travel Transport Operation vs Schedule Evidence Research v0.1

日期：2026-09-02

状态：`research_complete_design_only`

主题：`travel.travel_disruption_transport`

上游：

- `travel-research-v1.0.md`
- `travel-rule-review-v0.1.md`
- `travel-intent-schema-design-v0.1.md`
- `travel-transport-retreat-delay-evidence-review-v0.1.md`
- `travel-transport-object-resolver-safe-subset-review-v0.1.md`

> 本补充研究只回答：在已经解析到具体 transport object 后，是否存在足够证据建立“正向 / 按计划运行” Evidence。它不修改当前 22-route，不修改正式 Intent Schema、Rule Registry、Time Engine，不启动 Assessment / Comparator，不产生训练数据。

---

# 1. 研究问题

已有窄 Evidence：

```text
resolved transport line
+
RETREAT
→ transport_delay_or_postponement
```

因此需要审查是否可以建立一个对称正向规则，例如：

```text
PROGRESS
→ on_schedule
```

或：

```text
transport line active / supported
→ on_schedule
```

本轮研究结论是：**不能这样对称化。**

更准确的结构至少要拆成三个互相独立的 Evidence axis：

```text
A. operational viability
   交通工具是否具备运行 / 起飞 / 发车的现实趋势

B. schedule adherence
   是否按原计划时间运行，而非延误

C. obstruction resolution
   阻碍交通运行的因素是否减弱 / 消退
```

这三个状态可以同时出现不同方向的 Evidence。

例如：

```text
飞机当天最终可以起飞
+
但不能按时起飞
+
阻碍后来解除
```

在模型中必须能够同时成立。

---

# 2. 来源与 provenance

## 2.1 《增删卜易》·进神退神章

核心原意：

```text
进神 → 由此而前进，久远长进
退神 → 由此而渐退
```

并明确：

```text
化进化退的吉凶需区分所喜 / 所忌
```

因此进退首先表达的是：

```text
方向 / 趋势 / 持续变化
```

而不是现代班次语义中的：

```text
准点 / 晚点
```

分类：

```text
stable_classical_transform_semantics
```

但：

```text
PROGRESS → on_schedule
```

没有得到该来源直接支持。

## 2.2 《火珠林》·占出行

相关内容包括：

```text
世应俱动 → 宜速行
旁爻动 → 利行迟
父爻可关联船事不便
```

该来源支持“出行过程存在快慢 / 阻滞 Evidence”的传统基础。

但其观察对象主要是：

```text
旅行者 / 整体出行过程
```

不能直接升级为：

```text
具体现代航班 / 火车班次的 schedule adherence rule
```

分类：

```text
classical_journey_process_support
```

## 2.3 《黄金策·出行》 / 《卜筮全书》同源簇

核心相关结构：

```text
间爻安静 → 往来一路平安 / 无阻
间爻动 → 途中阻隔迟滞
世应俱动 → 宜速行
旁爻动 → 宜缓行
```

这证明：

```text
journey flow / obstruction
```

是一个可以单独观察的传统职责。

但仍不能把：

```text
间爻安静
```

直接等同于现代：

```text
航班准点
```

原因是 current object 不同：

```text
Journey Process ≠ Transport Service Schedule
```

分类：

```text
stable_classical_journey_process_support
```

## 2.4 王虎应《六爻预测自修宝典》·西藏出行例

已有 Review 已登记：

```text
父母持世 → transport / airplane
父母动而化退 → 飞机推后、晚点
```

实际因大雨影响，第二天才出发。

该例直接支持：

```text
RETREAT on resolved transport
→ delay / postponement Evidence
```

但不能反推：

```text
no RETREAT → on time
PROGRESS → on time
```

分类：

```text
modern_author_direct_case_support
```

## 2.5 王虎应网络出行案例 · 当天飞机能否起飞

该案例特别重要，因为它把两个状态分开：

```text
父母丑土暗动，被日冲动
→ 作者判断当天飞机可以起飞
```

同时：

```text
二爻卯木发动形成阻碍
→ 飞机不能按时起飞
```

五爻兄弟发动化退又被解释为：

```text
跑道积雪 / 阻碍后来解除
```

因此该案例同时存在：

```text
operational_viability = supportive
schedule_adherence = negative
obstruction_resolution = supportive
```

这直接反证：

```text
can_operate
≠
on_schedule
```

也反证：

```text
RETREAT 本身不存在固定 polarity
```

因为：

```text
transport line RETREAT
→ 可形成 delay Evidence

obstruction line RETREAT
→ 可形成 obstruction dissipation Evidence
```

**语义对象与角色绑定必须先于 Move Fact 的领域解释。**

分类：

```text
modern_author_direct_case_support
```

注意：该案例与《六爻预测自修宝典》同属王虎应体系，不能在 source diversity 中机械计为两个独立现代来源。

## 2.6 王虎应网络案例 · 延误后换机

另有现代案例以父母表示飞机：

```text
原交通工具存在阻碍 / 故障
另一父母发动并形成有利作用
→ 实际改乘另一架飞机离开
```

它进一步支持：

```text
operational path / replacement transport
```

可以与：

```text
original service schedule
```

分离。

因此未来多父母 Resolver 不能简单把：

```text
任何父母发动
```

都解释成原班次准点。

分类：

```text
modern_author_specific_multi_transport_case
```

## 2.7 朱辰彬《古筮真诠》·化进化退理论

该书把化进化退进一步解释为：

```text
渐进 / 渐退
具有时空缓冲特征
事态逐渐兴旺或逐渐衰败的趋势
```

并明确在不同问题中其现实寓意随 current target 改变。

尤其“行人归期”类存在：

```text
用神化进 → 越走越远 / 不归
用神化退 → 反而可对应归来方向
```

因此：

```text
PROGRESS
```

不是跨主题、跨对象恒定的：

```text
positive
on_time
closer_to_goal
```

它只能先作为原子 Transform Fact，再由对象职责解释。

分类：

```text
modern_independent_transform_semantics
```

## 2.8 朱辰彬《古筮真诠》·航天飞机案例

书中以父母爻对应航天器，并把外部忌神的退 / 破解释为其阻碍作用失效，最终航天器有惊无险返回。

该例的重要意义不是提供：

```text
transport PROGRESS → on_schedule
```

而是再次确认：

```text
obstruction RETREAT
→ obstruction weakens
```

和：

```text
transport RETREAT
→ transport declines / postpones
```

属于不同 Evidence responsibility。

分类：

```text
modern_independent_role_sensitive_support
```

---

# 3. Source independence 审计

## Classical independent / partially independent

```text
《增删卜易》进退神体系
《火珠林》出行体系
《黄金策·出行》/《卜筮全书》同源簇
```

其中《黄金策》与《卜筮全书》不能重复计权。

## Modern

```text
王虎应体系
朱辰彬体系
```

两者可以独立支持：

```text
现代交通工具可成为具体观察对象
进退 / 动变必须结合现实对象职责解释
```

但只有王虎应案例直接把“父母暗动”解释成“飞机当天可以起飞”。

所以：

```text
ACTIVITY on transport → bounded operational viability
```

目前仍不足以升级成 stable / cross-source formal Evidence rule。

---

# 4. Evidence responsibility 拆分

## Axis A · Transport Operational Viability

目标问题：

```text
这架飞机今天最终能不能起飞？
这趟车今天还能不能开？
这班船在当前 bounded period 内能不能运行？
```

目前研究候选：

```text
resolved transport line
+
ACTIVE / HIDDEN_MOVE
→ transport_operation_activity
```

但当前证据等级只能是：

```text
modern_author_specific_candidate
```

它最多表示：

```text
transport object is activated / operation tendency present
```

不能直接写成：

```text
will definitely depart
will depart on time
```

本轮结论：

```text
candidate_for_further_review = true
admittedEvidence = false
```

## Axis B · Schedule Adherence

目标问题：

```text
这趟航班会不会按时起飞？
火车会不会准点发车？
```

当前已 admitted：

```text
RETREAT on resolved transport line
→ transport_delay_or_postponement
```

当前未发现足够证据支持任何简单正向原子映射：

```text
PROGRESS → on_schedule       ❌
ACTIVE → on_schedule         ❌
旺相 → on_schedule           ❌
无 RETREAT → on_schedule     ❌
无 constraint → on_schedule  ❌
```

本轮结论：

```text
positiveOnScheduleEvidence = insufficient_evidence
scheduleAssessmentReady = false
```

## Axis C · Obstruction Resolution

目标对象不是交通工具本身，而是：

```text
runway obstruction
weather obstruction
route obstruction
other bounded blocking factor
```

现代案例支持一个重要方向：

```text
resolved obstruction object
+
RETREAT / loss of effective force
→ obstruction_dissipation candidate
```

但本主题当前还没有：

```text
PRR-TRAVEL-OBSTRUCTION-OBJECT
```

也没有足够的跨源 formal Evidence Review。

因此本轮只登记研究结论：

```text
roleSensitiveCandidate = true
implementation = blocked
```

---

# 5. 为什么 PROGRESS → on_schedule 必须拒绝

这是本轮最大的逻辑风险。

如果机械做：

```text
RETREAT = delay
PROGRESS = on_time
```

会犯三个错误。

### 错误 1 · 把方向趋势当钟表时间

传统进神表达：

```text
前进 / 长进 / 持续趋向
```

不是：

```text
遵守原定时刻表
```

### 错误 2 · 忽略对象角色

同一个 RETREAT：

```text
交通工具退
→ 可能是推后 / 衰退

阻碍因素退
→ 可能是阻碍解除
```

所以 move code 本身没有独立领域 polarity。

### 错误 3 · 把 eventual operation 和 punctuality 合并

现代案例已经出现：

```text
当天最终可以起飞
但不能按时起飞
```

若 Assessment 只有一个：

```text
transport_operating_as_scheduled
```

就无法表达这个真实组合。

---

# 6. 对现有 Travel Schema 的设计影响

当前 design-only Schema 中：

```text
travel_disruption_transport
→ expectedState = transport_operating_as_scheduled
```

研究后发现这个 expectedState 过粗。

建议未来在 Formal Expansion 前至少拆成：

```ts
transportOutcomeAspect:
  | 'operational_viability'
  | 'schedule_adherence'
  | 'cancellation_or_non_operation'
  | 'unknown'
```

或者保留 Semantic Intent 较粗，但 Assessment 内明确拆成两个独立 axis：

```text
TransportOperationalEvidence
TransportScheduleEvidence
```

本轮不修改 `travel-intent-schema-design-v0.1.md`，只记录 amendment requirement。

推荐优先采用：

```text
Semantic current target
→ transport_operation

Assessment axis
├─ operational_viability
└─ schedule_adherence
```

因为用户一句：

```text
这趟飞机会不会延误？
```

本身可能同时需要回答：

```text
会延误
但最终仍能起飞
```

---

# 7. Current Evidence Matrix

| Fact / condition | Bound object | Research meaning | Status |
|---|---|---|---|
| `RETREAT` | transport | delay / postponement direction | **admitted narrow Evidence** |
| `PROGRESS` | transport | progression / strengthening trend | research fact only; **not on-time** |
| `ACTIVE` / `HIDDEN_MOVE` | transport | operation / activation tendency | modern-author-specific candidate |
| support / vitality | transport | viability support may exist | composite, not atomic on-time rule |
| no `RETREAT` | transport | no RETREAT evidence found | **no inference** |
| `RETREAT` | obstruction | obstruction may recede | role-sensitive research candidate |
| `PROGRESS` | obstruction | obstruction may intensify | research candidate only |
| journey-process quiet | route / interval | journey flow unobstructed | classical journey Evidence; not service punctuality |
| journey-process moving | route / interval | route/process delay or obstruction | classical journey Evidence; not automatically transport delay |

---

# 8. Assessment Readiness

研究后仍然必须保持：

```text
transportScheduleAssessmentReady = false
transportScheduleComparatorReady = false
```

Operational axis 可进入下一轮专门 Review，但当前仍是：

```text
transportOperationalEvidenceReady = partial_research_only
```

原因：

1. `ACTIVE / HIDDEN_MOVE → can operate` 的直接现代证据目前主要来自王虎应体系；
2. 古典来源只提供一般出行节奏 / 阻滞，不足以把现代班次 activity formalize；
3. 朱辰彬案例支持对象职责和阻碍解除逻辑，但未形成同构的“交通工具发动 = bounded operation success”直接规则；
4. cancellation / replacement transport 尚需独立职责研究；
5. full multi-parent transport resolver 尚未完成。

---

# 9. 下一步建议

下一轮不要继续寻找：

```text
PROGRESS → on_schedule
```

建议转为研究一个更窄的问题：

```text
TRAVEL-TRANSPORT-OPERATION-ACTIVITY

resolved transport object
+
ACTIVE / HIDDEN_MOVE
→ 能否只产生 operation_activity Evidence？
```

研究目标不是：

```text
肯定起飞
```

而是先确定：

```text
transport_operation_activity
```

是否可以成为一个合法、非结论化的 Evidence atom。

随后再研究：

```text
operation_activity
+
blocking / support facts
→ bounded operational viability Assessment
```

这比建立伪对称的 on-time rule 更安全。

另一个独立后续主题是：

```text
PRR-TRAVEL-OBSTRUCTION-OBJECT
```

只有先识别“哪个爻代表阻碍”，才能安全使用：

```text
obstruction RETREAT → obstruction dissipation
```

---

# 10. 最终结论

```text
RETREAT on transport
→ 已有窄 delay / postponement Evidence

PROGRESS on transport
→ 不得解释成 on_schedule

ACTIVE / HIDDEN_MOVE on transport
→ operation_activity research candidate
→ 目前不足以直接 formalize 为成功运行

RETREAT on obstruction
→ 可能是阻碍消退
→ 必须先有 obstruction binding

can operate
≠ on schedule

no negative Evidence
≠ positive Evidence
```

因此本轮最重要的架构修正是：

```text
Transport Operation
├─ Operational Viability
├─ Schedule Adherence
└─ Obstruction Resolution
```

而不是：

```text
Transport Operation
→ 一个 positive / negative Boolean
```

当前保持：

```text
Formal Expansion = not authorized
currentRoute = false
trainingEligible = false
transportScheduleAssessmentReady = false
```
