# 龟甲 · 六爻 Travel Transport Blocking Evidence Resolution Research v0.1

日期：2026-09-02

状态：`research_complete_design_only`

主题：`travel.travel_disruption_transport`

上游：

- `travel-transport-operation-vs-schedule-evidence-research-v0.1.md`
- `travel-transport-operation-activity-evidence-review-v0.1.md`
- `travel-transport-object-resolver-safe-subset-review-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`

> 本研究重新审查原先设想的 `PRR-TRAVEL-OBSTRUCTION-OBJECT`。结论是：transport obstruction 多数情况下不是一个可以先验映射到固定六亲的现实对象，而是若干不同来源的 blocking Evidence responsibility。当前不得用一个“阻碍对象 Resolver”把这些机制强行合并。

---

# 1. 研究问题

为了把：

```text
transport_operation_activity
```

进一步组合成：

```text
operational viability
```

需要回答：

```text
什么算 transport blocking Evidence？
```

原设想是建立：

```text
PRR-TRAVEL-OBSTRUCTION-OBJECT
```

然后允许：

```text
obstruction RETREAT
→ obstruction_dissipation
```

但深挖传统与现代案例后发现，这个设想过早实体化了“阻碍”。

阻碍至少存在四种不同机制：

```text
A. target-directed blocking interaction
B. journey-process obstruction
C. generic obstruction archetype
D. specific hazard / adverse circumstance
```

它们不能用一个固定六亲 Resolver 统一解决。

---

# 2. 《黄金策·出行》 / 《卜筮全书》同源簇

## 2.1 间爻是 journey-process responsibility

原文体系明确：

```text
间爻安静 → 往来一路平安
间爻发动 → 途中阻隔迟滞
```

注解又把间爻定义为：

```text
往来经历所在
```

因此这里的 obstruction 是：

```text
journey process state
```

而不是一个现实实体：

```text
天气
跑道
机械故障
机场
铁路公司
```

所以：

```text
moving interval line
```

最多可以进入：

```text
journey_process_obstruction Evidence
```

不能自动生成：

```text
resolved obstruction object
```

分类：

```text
stable_classical_process_obstruction
```

## 2.2 官鬼 / 兄弟不是统一 obstruction object

同篇另有：

```text
官挈玄爻刑克 → 盗贼惊忧
兄乘虎煞交重 → 风波险阻
鬼动间中 → 同侣不谐
兄兴世上 → 多费盘缠
```

这说明六亲与六神、爻位、作用关系共同形成不同类型风险。

不能抽象成：

```text
官鬼 = obstruction
```

或：

```text
兄弟 = obstruction
```

因为同一六亲在不同位置 / 组合下现实职责不同。

分类：

```text
classical_contextual_hazard_support
```

---

# 3. 《火珠林·占出行》

相关内容包括：

```text
只怕鬼兄动
官鬼 → 病 / 官事等不利信息
兄弟 → 口舌 / 盘费等不利信息
父母动 → 船中有事
旁爻动 → 宜迟
```

这证明古典出行确实有：

```text
multiple adverse channels
```

而不是：

```text
single obstruction selector
```

特别是：

```text
父母动船中有事
```

说明 transport object 自身也可能带有异常状态，不能一律另外找某个“阻碍爻”。

分类：

```text
classical_multi_channel_adverse_support
```

---

# 4. 《增删卜易》·用神章

《增删卜易》给出一个重要 broad archetype：

```text
兄弟
→ 占谋事时可为阻神
```

同时：

```text
父母
→ 舟车 / 一切庇护我身之物
```

这可以支持：

```text
兄弟具有 generic obstruction archetype
```

但仍不能支持：

```text
transport obstruction 必定由兄弟承担
```

原因：

1. “阻神”是 broad谋事语义，不是 transport-specific object identity；
2. 《黄金策》《火珠林》还存在间爻、官鬼、父母自身异常等其他 obstruction channels；
3. 现代 transport 案例中实际克制交通工具的爻可以不是兄弟。

分类：

```text
stable_generic_obstruction_archetype
```

但：

```text
transportObjectResolverEligibility = false
```

---

# 5. 王虎应 · 太原机场出行案例

这是本研究最关键的反例。

问题：

```text
飞机什么时候起飞？
```

作者明确：

```text
父母 = 交通工具 / 飞机
```

卦中同时出现两类 obstruction 信息。

## 5.1 妻财卯木 → target-directed blocking interaction

作者判断：

```text
二爻卯木发动来克父母 / 世上的飞机
→ 飞机受阻
→ 不能按时起飞
```

因此：

```text
blocking line relation = 妻财
```

它并不是：

```text
兄弟
官鬼
间爻固定阻神
```

其 blocking responsibility 来自：

```text
它对已解析 transport target 的实际作用关系
```

而不是自身六亲标签。

这是：

```text
target-directed blocking interaction
```

的直接现代案例。

分类：

```text
modern_direct_transport_case_support
```

## 5.2 兄弟酉金 → contextual obstruction archetype

同一案例中五爻兄弟发动，作者另解释为：

```text
兄弟为阻隔之神
→ 跑道积雪造成阻碍
```

并根据其化退判断：

```text
积雪 / 跑道阻碍后来解除
```

这里的 responsibility 是：

```text
generic obstruction archetype
+
line position / real-world feedback
+
transform direction
```

而不是：

```text
兄弟六亲自身可以稳定解析为 runway snow
```

这条案例反而证明：

```text
六亲 archetype
≠ real-world object identity
```

分类：

```text
modern_author_specific_contextual_mapping
```

---

# 6. 朱辰彬《古筮真诠》·间爻阻隔

朱辰彬在现代案例中说明：

```text
间爻
→ 可寓意事件过程 / 中间介入 / 阻碍 / 意外
```

但更重要的是其具体使用边界：

某案例中，间爻兄弟发动只有在：

```text
运动方向对核心世用没有其他卦理解释途径
```

的前提下，才可作为：

```text
阻隔信息
```

这说明：

```text
interval position
```

不是无条件 obstruction selector，而是一种细节层 contextual interpretation。

因此不能 formalize 成：

```text
间爻动 = transport blocker object
```

分类：

```text
modern_author_specific_process_role
```

---

# 7. 朱辰彬《古筮真诠》·“发现号”航天飞机案例

该例以：

```text
父母子水
→ 航天飞机 / transport target
```

并把：

```text
忌神辰土发动克父母子水
```

解释成对飞船的故障 / 风险压力。

关键是：

```text
辰土之所以成为阻碍
```

首先因为它：

```text
acts adversely on the resolved transport target
```

而不是因为一个固定：

```text
六亲 = obstruction
```

之后辰土：

```text
化退 + 化破
```

才被解释成其外部不利作用趋于失效，最终飞船有惊无险返回。

因此该例独立支持：

```text
transport blocking responsibility
can be target-relative
```

并支持：

```text
blocking role first
+
RETREAT / loss of force second
→ blocking pressure receding
```

分类：

```text
modern_independent_target_relative_support
```

---

# 8. Core architectural conclusion

原设想：

```text
PRR-TRAVEL-OBSTRUCTION-OBJECT
→ select one line as “the obstruction object”
```

应暂停。

更安全的结构是：

```text
Travel Transport Blocking Evidence Resolution
├─ target-directed blocking interaction
├─ journey-process obstruction
├─ generic obstruction archetype
└─ explicit hazard context
```

这四个 channel 可以同时存在，也可能互相指向同一 line。

但它们的 epistemic status 不同。

---

# 9. Channel A · Target-directed Blocking Interaction

这是目前最有希望 formalize 的通道。

前置：

```text
transport target 已明确 binding
```

然后读取已有结构 / relation Fact，观察：

```text
another line
→ currently acts adversely on transport target
```

注意：本研究暂不规定：

```text
“克”是否已经足够
哪些合冲刑害可算 blocking
动爻 / 暗动 / 日月作用如何分层
```

这些必须先审现有 relation Fact provenance。

允许的未来 Evidence 形状应该是：

```text
transport_blocking_interaction
```

而不是：

```text
realWorldObstruction = weather
realWorldObstruction = runwaySnow
```

本轮状态：

```text
researchSupport = cross_source_compatible_modern_direct
implementation = blocked_by_relation_fact_review
```

---

# 10. Channel B · Journey-process Obstruction

传统稳定支持：

```text
间爻 / process position
```

可形成途中阻隔 / 迟滞 Evidence。

但这首先属于：

```text
journey process
```

而不是：

```text
specific transport service object
```

因此未来可能用于：

```text
travel_disruption_journey
```

也可以在 transport-focused 问题中成为辅助 Domain Evidence，但不得升级为 transport blocker identity。

状态：

```text
researchSupport = stable_classical
transportSpecificity = low
```

---

# 11. Channel C · Generic Obstruction Archetype

兄弟作为：

```text
谋事阻神
```

具有传统支持。

但自动化时风险很高。

原因：

```text
兄弟
```

在 travel 中还可能表示：

```text
同行 / 竞争 / 费用消耗 / 口舌 / 普通同类对象
```

因此：

```text
兄弟出现 / 发动
```

不得直接生成：

```text
transport_blocked
```

更不得自动将兄弟绑定为：

```text
runway / snow / traffic
```

状态：

```text
researchSupport = stable_archetype
formalAutomation = insufficient_specificity
```

---

# 12. Channel D · Explicit Hazard Context

现代 Intent 可能明确提供：

```text
台风会不会导致航班取消？
飞机是不是因为机械故障不能起飞？
跑道积雪会不会继续影响航班？
```

此时 Semantic 层确实存在一个现实 causal object：

```text
weather
mechanical_fault
runway_condition
```

但当前文献不足以建立统一：

```text
weather → 某六亲
mechanical_fault → 某六亲
runway_condition → 某六亲
```

因此 Semantic cause 可以保留，但 Traditional binding 应：

```text
unresolved
```

除非后续专项研究支持。

不得为了得到一个 line 而反向使用卦象结果猜：

```text
哪个爻看起来最坏，哪个就是台风
```

---

# 13. Why “Obstruction Object Resolver” is the wrong abstraction

若硬做：

```text
PRR-TRAVEL-OBSTRUCTION-OBJECT
```

会产生三个问题。

## 13.1 Object identity overclaim

程序只知道：

```text
某爻正在形成 blocking interaction
```

却输出：

```text
这个爻就是跑道积雪
```

属于把 Evidence role 冒充现实实体识别。

## 13.2 Fixed-relative falsehood

实际案例已经出现：

```text
妻财 line → 直接克 transport
兄弟 line → contextual obstruction
忌神 line → 克 transport
间爻 → process obstruction
```

不存在一个固定六亲可覆盖。

## 13.3 Circular selection risk

如果算法用：

```text
看起来最不利的爻
→ 认定为 obstruction
→ 再用 obstruction 证明结果不利
```

就会产生循环论证。

所以 blocking role 必须来自明确、可审计的 structural / relation Fact contract，而不是最终 Assessment。

---

# 14. Revised architecture

建议废弃 / 暂停命名：

```text
PRR-TRAVEL-OBSTRUCTION-OBJECT
```

改为：

```text
TravelTransportBlockingEvidenceResolver
```

它不是 Primary Role Resolver，而是 Evidence-layer resolver。

候选接口：

```ts
interface TransportBlockingEvidenceResolution {
  readingRef: string
  transportBindingRef: string
  channels: Array<{
    type:
      | 'target_directed_interaction'
      | 'journey_process'
      | 'generic_obstruction_archetype'
      | 'explicit_hazard_context'
    sourceRefs: string[]
    subjectRef?: { position:number }
    status: 'resolved' | 'candidate' | 'unresolved'
    conclusionShaped: false
  }>
}
```

这里：

```text
resolved
```

只表示：

```text
blocking Evidence responsibility is established
```

不表示：

```text
现实中的障碍物身份已经被识别
```

---

# 15. Effect on RETREAT-of-obstruction idea

上一轮提出：

```text
obstruction RETREAT
→ obstruction dissipation candidate
```

现在应改写为：

```text
line already has resolved blocking responsibility
+
RETREAT Fact on same line
→ blocking_pressure_receding candidate
```

这样不会要求程序先回答：

```text
这条爻现实中到底是雪、跑道、天气还是机械故障？
```

但仍必须先完成：

```text
blocking responsibility resolution
```

不能反过来：

```text
看到 RETREAT
→ 就说它是阻碍
→ 再说阻碍消退
```

---

# 16. Effect on Operational Viability

Transport Operational Viability 未来可形成：

```text
Transport Activity Evidence
+
Target-directed Blocking Evidence
+
Blocking-pressure Change Evidence
+
Transport own Transform / Status Evidence
↓
Operational Viability Assessment
```

但当前仍不应进入 Assessment，因为：

```text
Target-directed relation Fact contract
```

尚未审计。

特别是必须先回答：

```text
什么原子 Fact 可以合法表达
“line A 对 resolved transport line B 形成 blocking interaction”？
```

不能直接复用旧评分或 interpretation 文本。

---

# 17. Current admission matrix

| Candidate | Current status |
|---|---|
| fixed `兄弟 → transport obstruction` | ❌ reject |
| fixed `官鬼 → transport obstruction` | ❌ reject |
| fixed `间爻动 → transport obstruction object` | ❌ reject |
| `间爻动 → journey-process obstruction Evidence` | ✅ research-supported |
| `兄弟 → generic obstruction archetype` | ✅ research-supported, automation not sufficient |
| adverse line acts on resolved transport | ✅ strongest next formal candidate |
| semantic weather / fault → fixed traditional line | ❌ insufficient evidence |
| resolved blocking role + RETREAT → pressure receding | ✅ research candidate; binding first |
| infer real-world blocker identity from negative line | ❌ reject |

---

# 18. Next research step

下一步应优先审：

```text
Transport Target-directed Relation Fact Provenance
```

具体检查现有代码是否已经拥有不含结论的原子：

```text
line A 克 line B
line A 生 line B
line A 冲 line B
line A 合 line B
```

以及：

```text
哪些 relation 是纯结构 Fact
哪些已经混入旺衰 / 权重 / 评分 / Interpretation
```

只有得到 reading-scoped：

```text
source line
→ relation type
→ target transport line
```

之后，才能研究：

```text
relation Fact
→ transport_blocking_interaction Evidence
```

---

# 19. Final decision

```text
PRR-TRAVEL-OBSTRUCTION-OBJECT
= abstraction rejected / suspended

TravelTransportBlockingEvidenceResolver
= preferred architecture

obstruction is not one fixed six-relative object
= supported by classical + modern cases

target-directed blocking relation
= strongest next candidate

real-world blocker identity
= must not be hallucinated from chart negativity
```

当前仍保持：

```text
transportOperationalViabilityAssessment = not_ready
transportScheduleAssessment = not_ready
Formal Expansion = not authorized
current 22-route = unchanged
Rule Registry = unchanged
Time Engine = unchanged
```
