# 龟甲 · 六爻 Travel Execution Assessment Rule Review v0.1

日期：2026-09-01

状态：`assessment_rule_review_complete_isolated_candidate_only`

上游：

- `travel-research-v1.0.md`
- `travel-rule-review-v0.1.md`
- `js/liuyao-travel-pretraining-v01.js`
- `domain-assessment-architecture-v0.1.md`
- `data/liuyao-domain-assessment-contract-v0.1.json`

边界：

```text
只审 travel.travel_execution。
不审 travel_safety。
不审 travel_disruption_journey。
不审 travel_disruption_transport。
不修改 current-22 / Rule Registry / Time Engine。
本 Review 只允许 isolated evaluator candidate，不注册 active evaluator。
```

---

# 1. Assessment 目标

`travel_execution` 的 semanticMeaning 固定为：

```text
journey_execution_outcome
```

它回答的不是：

```text
旅途是否安全
交通工具自身是否延误
目的地事务能否成功
```

而是：

```text
当前 bounded journey 是否具备成行 / 推进 / 按计划完成的支持与阻碍证据
```

因此 Assessment 输出只允许：

```text
supportive_evidence
adverse_evidence
mixed_evidence
insufficient_evidence
```

不输出成功概率或布尔断语。

---

# 2. 文献基础

Travel v1.0 已确认：

```text
《火珠林》
→ 持身最吉、世空去不成、旁爻冲克世可形成不利

《增删卜易》
→ 世为出行人，世旺相宜行，空亡宜止；世应、旁爻关系用于途中阻顺

《黄金策》/《卜筮全书》同源簇
→ 世为出行人，应为所往之地；世应生克与间爻可形成通达/阻隔信息

王虎应、朱辰彬
→ 自身一般出行仍以世为主，并结合交通与过程信息
```

因此以下只被解释为：

```text
execution-direction evidence
```

而不是最终成败规则。

---

# 3. Admitted Evidence Types

## 3.1 Traveler Vitality

`buildTravelEvidence` 已有：

```text
traveler_vitality + positive
traveler_vitality + negative
```

Assessment 解释：

```text
positive → execution_support
negative → execution_adverse
```

依据是“世旺相宜行 / 持身为先”的稳定传统主轴。

注意：

```text
traveler weak
```

只算 adverse evidence，不等于“必不能成行”。

## 3.2 Traveler Void

```text
traveler_void
```

可进入：

```text
execution_adverse
```

依据：

```text
世空去不成 / 空亡宜止
```

但 Assessment 仍只输出 adverse evidence state，不输出绝对失败。

该 Evidence 必须消费上游 Time Fact，Evaluator 不重算旬空。

## 3.3 Destination Relation

```text
destination_relation + positive
→ execution_support

destination_relation + negative
→ execution_adverse
```

只在 destination 已由 Intent/Observation 层合法加入时使用。

不得因为“应爻存在”就自动生成 destination evidence。

## 3.4 Route Process Obstruction

```text
route_process_obstruction
→ execution_adverse
```

其来源可以是已经审核的途中 / 间爻 / 过程 Evidence builder。

Evaluator 不直接读取原始间爻数量，也不自己解释所有间爻发动。

## 3.5 Transport Disruption

若 current duty 仍是：

```text
travel_execution
```

且 transport disruption 已由上游作为当前 journey 的现实 Domain Evidence 给出：

```text
transport_disruption
→ execution_adverse
```

这里不把交通工具升级成 Primary，也不重路由到 `travel_disruption_transport`；路由边界必须在 Assessment 前已经确定。

---

# 4. Explicitly Excluded Evidence

首轮 `travel_execution` evaluator **不读取**：

```text
safety_support
hazard_pressure
```

原因：Travel Research 已明确：

```text
travel_execution
与
travel_safety
```

共享 Traveler Primary，但 Assessment 职责不同。

如果 execution evaluator 因为：

```text
子孙旺 / 官鬼动
```

直接改变 execution assessment，就会把 Safety 再次合并回 Execution。

同样首轮不读取：

```text
旅费
六神
游魂 / 归魂
进退神
```

除非未来有独立 Evidence Review 将其登记为 execution evidence。

---

# 5. Combination Policy

本 v0.1 不做 score，也不比较 Evidence 数量。

只构造两个布尔集合状态：

```text
hasExecutionSupport
hasExecutionAdverse
```

其中“有”表示至少存在一条**已登记 type + direction** 的 Evidence。

然后：

```text
support=true, adverse=false
→ supportive_evidence

support=false, adverse=true
→ adverse_evidence

support=true, adverse=true
→ mixed_evidence

support=false, adverse=false
→ insufficient_evidence
```

这不是：

```text
positive count - negative count
```

因为：

```text
1 support + 5 adverse
```

与：

```text
5 support + 1 adverse
```

在 v0.1 都只得到：

```text
mixed_evidence
```

不排序、不净额、不打分。

---

# 6. Why Mixed Must Stay Mixed

现有文献足以说明多种支持与阻碍因素可能并见，但尚不足以建立一个统一优先级，例如：

```text
世旺
+
世空
```

或：

```text
旅行者得助
+
交通阻断
```

哪一项应以多少权重覆盖另一项。

如果现在写：

```text
世空优先一票否决
```

或：

```text
两条 positive 抵一条 negative
```

都会超出当前 Review。

因此冲突 Evidence 必须保留：

```text
mixed_evidence
```

---

# 7. Evidence Identity, Not Polarity Guessing

Evaluator 必须基于明确 evidence type + allowed direction，例如：

```text
traveler_vitality + positive
```

而不是通用规则：

```text
任何 polarity=positive
→ supportive
```

因此如果输入：

```text
safety_support + positive
```

execution evaluator 应忽略它，而不是因为 positive 自动吸收。

如果输入未知：

```text
some_future_evidence + positive
```

同样忽略，直到该 Evidence 被 Review。

---

# 8. Evidence Contract

首轮 evaluator candidate 只接受：

```ts
{
  duty:'travel_execution'
  evidence:Array<{
    id:string
    type:string
    polarity:string
    sourceRefs?:string[]
  }>
}
```

每条 Evidence 必须有稳定 `id`，供 Assessment 输出：

```text
evidenceRefs
reasonRefs
```

若只有旧 `buildTravelEvidence` 的无 id item，应由 isolated adapter 在进入 evaluator 前生成稳定 test/reference id；正式实现不得依赖数组序号作为长期 provenance。

---

# 9. Assessment Envelope

输出：

```text
assessmentRef = travel_execution_assessment_v0.1
assessmentVersion = 0.1
contractFamily = travel_execution_assessment
eventType = travel
duty = travel_execution
dimensionId = target_outcome
semanticMeaning = journey_execution_outcome
```

若 Evidence packet 本身：

```text
partial / unresolved
```

必须交由 Shared Assessment Envelope 保留该状态，不进入 direction synthesis。

---

# 10. Non-Candidates

禁止：

```text
Evidence 数量多数票
positive polarity 通用映射
negative polarity 通用映射
世旺直接等于成功
世空直接等于失败
transport_disruption 直接等于航班一定取消
safety_support 直接提升 execution
hazard_pressure 直接降低 execution
任何 score / probability
```

---

# 11. Comparator Boundary

即使该 evaluator candidate 能输出：

```text
supportive_evidence
adverse_evidence
mixed_evidence
```

也**不会自动激活 Comparator**。

当前 Domain Comparator registry 仍为：

```text
activeComparators = []
```

因此：

```text
Travel Assessment resolved
≠ Travel alternatives orderable
```

后续若需要比较两个 journey execution outcome，必须单独做 Comparator Rule Review。

---

# 12. Review Result

首轮允许实现 isolated evaluator candidate：

```text
AE-TV-EXEC-001
contractFamily = travel_execution_assessment
semanticMeaning = journey_execution_outcome
```

admitted support evidence：

```text
traveler_vitality + positive
destination_relation + positive
```

admitted adverse evidence：

```text
traveler_vitality + negative
traveler_void
destination_relation + negative
route_process_obstruction
transport_disruption
```

excluded from execution synthesis：

```text
safety_support
hazard_pressure
unknown evidence type
```

combination：

```text
support only → supportive_evidence
adverse only → adverse_evidence
both → mixed_evidence
none → insufficient_evidence
```

状态：

```text
Assessment Rule Review = complete
isolated evaluator candidate = allowed
active evaluator registration = forbidden / not yet
formal runtime = blocked by v0.13 gate
```
