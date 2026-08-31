# 龟甲 · 六爻失物 Pretraining Isolated Implementation v0.1

日期：2026-08-31

状态：`isolated_pretraining_implementation`

主题：`lost_property`

## 1. 为什么是 isolated

当前 `data/liuyao-semantic-v013-candidate-v03-design-v0.1.json` 明确规定下一批主题仍为：

```text
design_only
mayEnterV03Training = false
mayBecomeCurrentRoutes = false
```

且 Candidate v0.2 `promotionStatus = failed`。

因此本阶段不得把 `lost_property` 接入：

- 当前 `js/liuyao-intent.js`；
- 当前 Semantic Router / Routeability / Identity / Selection；
- 当前 Rule Registry；
- 当前 22-route inventory；
- v0.13 训练、校准、Blind / Independent 数据。

本实现只把已经完成的文献研究、Rule Review 与 Intent Schema Contract 落成一个**不可达、可独立测试的工程原型**，减少未来开放 route expansion 后的实现不确定性。

---

## 2. 新增模块

```text
js/liuyao-lost-property-pretraining-v01.js
```

模块声明：

```text
version = 0.1
status = design_only_unreachable
currentRuntimeReachable = false
```

它不被 `index.html`、正式 Semantic Stack 或 Observation Plan 加载。

提供：

```text
validateIntentContract
resolveLostObject
checkSufficiency
buildDraftObservationPlan
buildRecoveryEvidence
buildLocationEvidence
```

---

## 3. Object Resolver Contract

只有已经被现代语义 / 对象层明确归入稳定传统物类时才允许解析：

```text
generic_property     → 妻财
document_credential  → 父母
vehicle              → 父母
clothing             → 父母
```

注意：

```text
entityType unknown
≠ generic_property
```

未知现代物件不得使用 generic fallback。

当前明确：

```text
phone → conflicted
key / ring / computer / bank_card / usb / disk / cloud_data / unknown → unresolved
```

因此 Resolver 是三态：

```text
resolved
conflicted
unresolved
```

而不是强制返回某个六亲。

---

## 4. Sufficiency Contract

语义充分性与传统取用充分性分开：

```text
semanticStatus
traditionalObjectStatus
readyForTraditionalObservation
```

例如：

```text
手机丢了还能找到吗？
```

可以形成：

```text
semanticStatus = sufficient
traditionalObjectStatus = conflicted
readyForTraditionalObservation = false
```

这保证“现代语义已经理解”不会被错误等同成“传统规则必有唯一答案”。

失物语义层最低要求：

- `event.type = lost_property`
- `lossState = confirmed_lost | possibly_misplaced`
- `lostObject.animacy = inanimate`
- `lostObject.specificity = specific`
- 有 `entityType`
- 至少一个 `recovery | location` goal

`recovery + location` 允许作为同一 Event 的兼容双目标。

---

## 5. Draft Observation Plan

只有 Object Resolver 已 `resolved` 时，isolated draft plan 才形成：

```text
Primary
→ resolved lost object six-relative
→ semanticDuty = lost_object

Role
→ 世
→ semanticDuty = querent_self
→ required = true

Domain
→ 官鬼
→ semanticDuty = possible_theft_or_external_removal
→ required = false
```

若对象为 `conflicted / unresolved`：

```text
plan.status = unresolved
```

不得猜测或 fallback。

本 Draft Plan 不是 `js/liuyao-rule-registry.js` 的正式 Rule，也不由当前 Observation Plan 调用。

---

## 6. Recovery Evidence 实现边界

Recovery 模块只消费已经标准化 / 上游计算完成的 facts，不重新计算：

- 日月；
- 旬空；
- 月破；
- 动变；
- 地支关系。

支持的 Evidence 包括：

```text
vitality strong / weak
void negative
movement / displacement
static on Shi
inner + static + strong composite
positive generate/combine to Shi with void blocking
in tomb
hidden fushen
joined
财化鬼
鬼化财
possible theft / self-lost tendency
```

明确：

```text
movement != unrecoverable
in_tomb != unrecoverable
hidden_fushen != unrecoverable
joined != unrecoverable
```

输出：

```text
status = evidence_only
finalRecoverability = null
scoring = null
```

本阶段不建立加权分数，也不从单一证据生成最终 Boolean。

---

## 7. Location Evidence 实现边界

位置层输出多通道 symbolic evidence：

```text
inside_outside
line_position
element_environment
branch_direction
trigram_environment
tomb_containment
joined_cover
hidden_fushen
```

并强制：

```text
exactCoordinates = null
exactDistance = null
```

避免把传统位置类象伪装成 GPS 精度。

---

## 8. 专项测试

新增：

```text
tests/liuyao-lost-property-pretraining-v01-tests.js
```

覆盖 18 组职责测试，包括：

- 模块不可达标记；
- 稳定物类映射；
- phone conflict；
- 未决现代物件不得 fallback；
- animate exclusion；
- recovery + location 双目标；
- semantic sufficient / traditional conflicted 分离；
- draft Observation Plan；
- movement 不直接判失败；
- 墓伏合保持 hidden/contained；
- void strong negative；
- 生合世的 void blocking；
- 财化鬼 / 鬼化财非对称；
- Location 多通道、无精确坐标；
- Semantic Contract 不含传统六亲字段。

当前提交只加入 test harness；本对话没有本地仓库命令执行环境，因此**不宣称测试已实际运行**。后续在仓库工作环境或 CI 中执行：

```bash
node tests/liuyao-lost-property-pretraining-v01-tests.js
```

---

## 9. 当前训练前状态

完成本阶段后：

```text
literatureResearch = completed_and_reviewed
ruleReview = complete
intentSchemaDesign = complete
isolatedPretrainingImplementation = complete
isolatedTestHarness = added

formalIntentIntegration = blocked_by_current_v013_gate
formalRuleRegistryIntegration = blocked_by_current_v013_gate
semanticTrainingData = forbidden_for_current_v013
currentRoute = false
```

未来当 Semantic 主线明确开放 next-topic expansion 后，应先运行并审核 isolated tests，然后依次：

```text
Promote Event Schema
→ Slot / Sufficiency integration
→ PRR-LOST-PROPERTY-OBJECT integration
→ Formal Observation Rule
→ Recovery / Location integration
→ current-22 frozen regression
→ only then build training / validation / calibration sets
```
