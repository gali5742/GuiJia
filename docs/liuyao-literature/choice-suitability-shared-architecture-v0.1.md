# 龟甲 · 六爻 Alternative / Choice / Suitability Shared Architecture v0.1

日期：2026-09-01

状态：`design_only_ready`

适用未来 deferred responsibilities：

```text
career.employment_transition_comparison
career.resignation_suitability
study.education_choice_comparison
litigation.settlement_suitability
litigation.litigation_strategy
```

> 本架构不修改 current-22，尤其不替换当前已有 `investment_suitability` / `investment_position_decision`。现有投资选择链继续按冻结 baseline 运行。

---

# 1. 为什么需要共享层

当前多个暂缓项具有同一结构：

```text
Alternative A
vs
Alternative B
+
不同价值 / 风险 / 成本维度
```

例如：

```text
留现在公司还是去 A 公司？
该不该裸辞？
选 A 学校还是 B 学校？
该不该接受和解？
要不要继续上诉？
```

这些都不是单一 outcome prediction。

如果各主题分别实现，最容易重复产生：

```text
世 = A
应 = B
```

或：

```text
一个选项 = 一个爻
```

的静态硬编码。

已有事业 / 教育研究已经证明这种固定 alternative mapping 不可靠。

---

# 2. 核心分层

```text
Modern Choice Semantics
↓
Alternative Records
↓
Theme Adapter per Alternative
↓
Observation Plan per Alternative
↓
Dimension Evidence per Alternative
↓
Comparison Frame
```

关键：

```text
Alternative
≠
Traditional selector
```

一个 Alternative 可以对应：

```text
1 个 Primary
+
多个 required / optional Role / Domain Observations
```

也可以因为 Resolver 未完成而 `partial / unresolved`。

---

# 3. Choice Contract

建议：

```ts
choiceContext: {
  currentTargetAspect:'choice_suitability'
  choiceForm:
    | 'compare_alternatives'
    | 'stay_or_leave'
    | 'accept_or_reject'
    | 'continue_or_stop'
  decisionGoal:
    | 'compare_outcomes'
    | 'compare_suitability'
  alternatives:Array<{
    id:string
    label?:string
    semanticRole:string
    specificity:'specific' | 'context_bounded'
    domainEventType:string
    targetSnapshot?:object
  }>
  decisionDimensions:string[]
  preferencePolicy?:{
    status:'explicit' | 'not_provided'
    priorities?:string[]
  }
}
```

Semantic alternatives 中不得出现：

```text
世
应
六亲
用神
```

---

# 4. Decision Dimensions

v0.1 允许的共享维度：

```text
target_outcome
stability
livelihood
financial_cost
time_cost
risk
relationship_impact
legal_exposure
institution_fit
```

这些只是比较容器，不表示所有主题都能生成所有维度。

每个 Theme Adapter 只返回自己有证据支持的维度。

---

# 5. Theme Adapter Contract

共享层不负责替 Alternative 找传统爻。

而是生成：

```ts
{
  alternativeId,
  domainEventType,
  semanticRole,
  targetSnapshot,
  requestedDimensions,
  adapterRequired:true
}
```

再由主题自己的 Resolver / Observation Rule 返回：

```ts
{
  alternativeId,
  status:'resolved' | 'partial' | 'unresolved'
  observationPlan?: ObservationPlan
  dimensionEvidence?: Record<string, Evidence[]>
  issues?: object[]
}
```

因此：

```text
current job
prospective job
```

不会在共享层变成：

```text
世
应
```

它们仍由 career adapter 根据真实职责解析。

---

# 6. Partial Alternative 是合法状态

例如教育比较：

```text
A 大学
B 大学
```

如果 admission core 已解析，但 Institution Resolver 未完成，可以：

```text
Alternative A = partial
Alternative B = partial
Overall Comparison Frame = partial
```

不能为了比较方便强行把：

```text
A = 父母甲
B = 父母乙
```

或：

```text
A = 世
B = 应
```

写死。

---

# 7. 为什么 v0.1 不输出 Winner

即使两个 Alternative 都已有 ObservationPlan，仍然不能直接：

```text
A 旺于 B
→ A 更适合
```

原因是“更适合”可能同时包含：

```text
成功可能
稳定性
生计
金钱成本
时间成本
风险
关系影响
法律风险
```

不同维度没有统一的可比尺度。

而用户价值权重也不应该由系统暗中假设。

因此 v0.1 强制：

```text
overallRecommendation = null
scalarScore = null
```

即使用户明确提供 priorities，本版本也只保存 preference，不建立未经研究 / 校准的数值聚合公式。

---

# 8. Compare Outcomes 也不等于可直接排序

`compare_outcomes` 比 `compare_suitability` 更窄，但仍需要：

```text
normalized theme assessment contract
```

才能跨 Alternative 比较。

当前各主题 Evidence 都坚持：

```text
Fact
→ Evidence
→ Assessment
```

且多数尚无跨对象统一标尺。

所以本共享层现在只组织 frame，不跨主题制造评分。

---

# 9. Deferred Theme Mapping

## 9.1 Career Transition Comparison

```text
choiceForm = compare_alternatives
alternatives:
  current_employment
  prospective_employment
```

明确禁止：

```text
世 = old employment
应 = new employment
```

## 9.2 Resignation Suitability

```text
choiceForm = stay_or_leave
```

至少需要考虑：

```text
stability
livelihood
target_outcome
risk
```

这解释为什么它不能复用 `employment_transition_outcome`。

## 9.3 Education Choice

```text
choiceForm = compare_alternatives
```

Institution Resolver 可以使单个 Alternative 保持 partial。

## 9.4 Settlement Suitability

```text
choiceForm = accept_or_reject
```

至少涉及：

```text
target_outcome
financial_cost
time_cost
risk
legal_exposure
```

不能把“能不能和解”直接转换成“应该接受和解”。

## 9.5 Litigation Strategy

```text
choiceForm = continue_or_stop
```

同样不是 `litigation_outcome` 的布尔反转。

---

# 10. Current-22 Boundary

当前 inventory 已有：

```text
investment_suitability
investment_position_decision
```

其中 `investment_position_decision` 仍为 current V0.1 route，规则状态 `provisional_only`。

本 v0.1 **不迁移、不重写、不重新解释**这些 current routes。

未来若希望把投资也迁移到共享 Choice Architecture，必须另做：

```text
current behavior audit
frozen regression
migration design
```

不能因为新共享层出现就顺手重构 current 22。

---

# 11. Explicit Non-Candidates

```text
Alternative A → 世
Alternative B → 应
第一个选项 → 内卦
第二个选项 → 外卦
每个 Alternative 只能有一个观察爻
单一 favorable Evidence → 推荐该选项
结果概率最高 → 总体最适合
系统自行假设生计 / 风险 / 金钱权重
把“能不能和解”反转成“该不该和解”
把“能不能辞职成功”反转成“该不该辞职”
```

全部禁止。

---

# 12. 当前结论

当前共享层只做到：

```text
Choice semantics
→ bounded alternatives
→ per-alternative theme adapter
→ resolved / partial / unresolved plans
→ dimension comparison frame
```

不做到：

```text
hidden scoring
winner selection
user value substitution
```

因此：

```text
sharedChoiceArchitecture = ready_v0.1
formalIntegration = blocked
semanticTraining = false
currentRoute = false
```
