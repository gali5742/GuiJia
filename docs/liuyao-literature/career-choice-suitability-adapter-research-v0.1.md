# 龟甲 · 六爻事业 Choice / Suitability Adapter 专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_adapter_ready`

主题：

```text
career_position.employment_transition_comparison
career_position.resignation_suitability
```

上游：

- `choice-suitability-shared-architecture-v0.1.md`
- `career-position-research-v1.0.md`
- `career-position-rule-review-v0.1.md`

> 本专项只研究事业主题如何向共享 Choice / Suitability 层提供 Alternative Observation / Dimension Evidence。它不输出 Winner，不修改 current-22 / 正式 Intent / Router / Rule Registry / training。

---

# 1. 核心结论

事业选择不能压成：

```text
世 = 留
应 = 走
```

也不能压成：

```text
官鬼旺 → 一律不要辞职
官鬼衰 → 一律辞职
```

更合理的是：

```text
Career Choice Semantics
↓
Alternative A / B
↓
career adapter per alternative
↓
职位 / 稳定 / 生计 / 新机会等 dimension evidence
↓
Shared Comparison Frame
```

当前：

```text
adapterReady = true
overallRecommendation = null
scalarScore = null
```

---

# 2. 传统“守旧 / 图新”资料可以支持什么

《易隐·卷六·升迁》保存：

```text
内旺外衰，宜守旧
内衰外旺，宜图新
内外俱旺，彼此如意
```

这证明传统存在：

```text
current / external opportunity comparison
```

的思维。

但它不能直接升级成现代：

```text
内卦 = 当前工作
外卦 = 新工作
```

固定规则。

原因：

1. 条文原语境是传统仕宦升迁；
2. 同章世应还承担臣君 / 内外任等其他职责；
3. 现代跳槽案例存在不同对象定位体系；
4. 朱辰彬案例会根据现实对轨、动爻、应位、官鬼等具体结构定位计划目标。

所以该条只允许作为：

```text
traditional comparison precedent
```

而不是 modern fixed selector map。

来源：

- https://book.taiyi.me/%E5%8D%9C/%E6%98%93%E9%9A%90/%E6%98%93%E9%9A%90%28%E5%8D%B7%E5%85%AD%29

---

# 3. 王虎应：跳槽成功与辞职适宜性不是同一职责

《六爻用神答疑》直接区分：

```text
跳槽能否成功
→ 官鬼为主，也靠世

跳槽后下一份工作好不好
→ 应 / 世关系 + 官

该不该辞职
→ 财为养命之源，财更重要

辞职后什么时候找到工作
→ 官可代表未来工作
```

这组回答的重要意义不是要求项目原样采用其所有固定取法，而是证明：

```text
transition outcome
≠ transition comparison
≠ resignation suitability
```

并且辞职决策天然加入：

```text
livelihood / financial buffer
```

维度。

来源：

- https://www.scribd.com/document/861764686/355413197-%E5%85%AD%E7%88%BB%E7%94%A8%E7%A5%9E%E7%AD%94%E7%96%91-51%E9%A1%B5-%E7%8E%8B%E8%99%8E%E5%BA%94

---

# 4. 朱辰彬：指定跳槽目标需要现实对轨

用户资料库《古筮真诠》存在：

```text
计划跳槽到某公司
```

的案例。

案例中并不是机械：

```text
应 = 新公司
```

而是结合：

```text
应位
动爻
谋星
现实计划目标
```

定位具体所求目标，并据其对世的作用判断该计划对自身事业前景不利。

这继续证明：

```text
specific prospective employer / job
→ requires contextual target anchoring
```

而不是 shared layer 静态赋值。

---

# 5. Duty A · Employment Transition Comparison

现代例：

```text
留现在公司还是去 A 公司更好？
现在这份工作和新 offer 选哪个？
A 公司和 B 公司哪个更适合我？
```

建议继续保留：

```text
employment_transition_comparison
```

但其职责不是产生一个传统用神，而是生成 Alternatives。

## 5.1 Alternative Types

```text
current_employment
prospective_employment
prospective_employment_A
prospective_employment_B
```

每个 Alternative 都保留：

```text
employmentTarget
employerTarget
formalizationContext
specificity
```

不出现六亲。

## 5.2 Current Employment Adapter

如果用户已有明确当前工作：

```text
Primary candidate
→ 官鬼 / current employment

Role
→ 世 / self

possible dimension
→ stability
```

可复用已研究：

```text
employment_retention
current employment state
```

但“当前工作”若卦中出现多个官鬼，仍需 object anchoring；不能直接选任一官鬼。

## 5.3 Prospective Employment Adapter

```text
Primary candidate
→ 官鬼 / prospective employment

Role
→ 世

Employer Context
→ 父母-compatible / conditional

Specific Target Context
→ contextual role resolver
```

可复用：

```text
employment_transition_outcome
```

但再次禁止：

```text
prospective employment = 应
```

universal mapping。

## 5.4 两个 prospective employers

```text
A 公司 vs B 公司
```

最困难的问题不是官鬼类别，而是：

```text
哪个具体 line / contextual target 对应 A
哪个对应 B
```

因此：

```text
Alternative A plan = partial until target anchoring
Alternative B plan = partial until target anchoring
```

共享 Comparison Frame 可以存在，但不能比较未锚定对象。

---

# 6. Transition Comparison 的合法维度

首轮建议 Career Adapter 只返回：

```text
target_outcome
stability
livelihood
```

条件性：

```text
financial_cost / income
→ only when explicit salary / financial dimension is part of user's decision
→ must reuse finance/income evidence, not invent from career rule
```

不建议首轮自动加入：

```text
relationship_impact
prestige
commute
work-life balance
personal_growth
```

除非未来对应 semantic dimension 与传统证据分别研究完成。

---

# 7. Duty B · Resignation Suitability

现代例：

```text
我现在该不该辞职？
没有下家，适不适合裸辞？
继续留着还是先辞了再找？
```

它不是：

```text
employment_transition_outcome
```

因为可能根本没有 prospective employment target。

## 7.1 必须拆至少三层现实维度

```text
current_job_stability
livelihood_buffer
future_employment_opportunity
```

传统候选：

```text
current job → 官鬼
livelihood / income buffer → 妻财
future job → 官鬼 candidate / only when semantically present
self → 世
```

王虎应“财为养命之源”只能支持：

```text
livelihood is a core resignation dimension
```

不能升级：

```text
财旺 = 必辞
财衰 = 必不辞
```

作为本项目最终推荐公式。

---

# 8. Resignation Alternatives

建议 Shared Choice 输入：

```text
Alternative A = stay_in_current_job
Alternative B = resign_now
```

如果另有明确新工作：

```text
Alternative B = leave_for_specific_job
```

则应改走：

```text
employment_transition_comparison
```

而不是裸辞适宜性。

## 8.1 stay_in_current_job

可生成：

```text
current employment state
stability evidence
livelihood continuity evidence
```

## 8.2 resign_now

它不是一个“职位对象”，所以不能要求给“辞职”找一个六亲 Primary。

它更像：

```text
action alternative
```

需要组合：

```text
loss of current employment exposure
livelihood buffer
future opportunity context
```

这是 Shared Choice Architecture 必须支持 `action alternative` 的重要案例。

---

# 9. Preference Policy

事业选择尤其不能默认用户只追求：

```text
职位成功率最大
```

实际可能优先：

```text
稳定
收入
短期生计
长期事业机会
风险最低
```

当前只允许：

```text
preferencePolicy.status = explicit | not_provided
```

若未提供：

```text
overallRecommendation = null
```

即使某个 Alternative 的官鬼 evidence 更强，也不能直接宣布“更适合”。

---

# 10. Theme Adapter Contract

建议：

```ts
careerChoiceAdapter(alternative) => {
  status: 'resolved' | 'partial' | 'unresolved',
  semanticAlternativeType:
    | 'current_employment'
    | 'prospective_employment'
    | 'resign_action',
  observationPlan,
  dimensionEvidence: {
    target_outcome?: [],
    stability?: [],
    livelihood?: []
  },
  unresolvedAnchors: []
}
```

必须保持：

```text
no winner
no scalar score
no 世应 alternative hardcode
```

---

# 11. Status Matrix

```text
employment_transition_comparison semantic duty
→ ready

career theme adapter
→ design_ready

current employment observation responsibility
→ supported / contextual anchoring may remain

prospective employment responsibility
→ supported / contextual anchoring may remain

A/B employer line anchoring
→ resolver_required

resignation_suitability semantic duty
→ ready

livelihood dimension
→ supported as required comparison dimension when no next job

resign action traditional single selector
→ not applicable / forbidden assumption

overall recommendation
→ not ready
```

---

# 12. Explicit Non-Candidates

```text
世 = 旧工作
应 = 新工作

内卦 = 旧工作
外卦 = 新工作

财旺 = 应该辞职
财衰 = 不应该辞职

新工作官旺于旧工作官 = 一定选新工作

一个 Alternative = 一个传统爻
```

以上均不得成为共享规则。

---

# 13. Final Conclusion

本专项解除的是：

```text
career Choice Theme Adapter architecture blocker
```

而不是：

```text
career choice winner prediction
```

因此当前可以进入未来 isolated adapter contract：

```text
employment_transition_comparison
resignation_suitability
```

但必须保留：

```text
overallRecommendation = null
scalarScore = null
```

直到 normalized per-alternative Assessment 与 preference policy 经独立研究 / 校准。

当前 v0.13 next-topic boundary 仍为 design-only，不进入正式 integration / training / current routes。