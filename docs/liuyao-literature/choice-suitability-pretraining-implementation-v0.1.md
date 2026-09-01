# 龟甲 · 六爻 Choice / Suitability Shared Pretraining Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented`

依赖：

- `choice-suitability-shared-architecture-v0.1.md`

实现：

- `js/liuyao-choice-suitability-pretraining-v01.js`
- `tests/liuyao-choice-suitability-pretraining-v01-tests.js`

> 本模块不可达，不接 current Router / Intent / Rule Registry，也不替换 current-22 的投资 suitability / position decision。

---

# 1. 当前职责

```text
validateChoiceContract
buildAlternativeAdapterRequests
composeAlternativePlans
buildComparisonFrame
```

共享层只组织 Alternatives 与 Theme Adapter，不自行选择传统观察对象。

---

# 2. Legal States

每个 Alternative 可独立：

```text
resolved
partial
unresolved
```

整个 frame 可：

```text
resolved_frame
partial_frame
unresolved_frame
```

所以某一学校 / 工作 / 诉讼策略的 Resolver 未完成时，不需要让全部选择题崩成 unknown。

---

# 3. No Hidden Alternative Mapping

明确没有：

```text
A → 世
B → 应
```

Adapter request 的：

```text
traditionalSelector = null
adapterRequired = true
```

由主题自己的 ObservationPlan 决定每个 Alternative 需要几个观察对象。

---

# 4. No Winner / No Scalar Score

v0.1 强制：

```text
overallRecommendation = null
scalarScore = null
```

即使：

- 用户提供偏好；
- 某个 Alternative 的 target outcome Evidence 更正向；
- 只有一个维度。

也不生成隐藏评分或 Winner。

原因：当前没有经过研究 / 校准的跨维度、跨 Alternative 统一 Assessment 标尺。

---

# 5. Deferred Themes Covered

共享架构已经能表达：

```text
career transition comparison
resignation suitability
education choice comparison
settlement suitability
litigation strategy
```

但这里只完成框架，不表示这些具体主题已经有 per-alternative Theme Adapter。

---

# 6. Current-22 Boundary

当前 inventory 中已有：

```text
investment_suitability
investment_position_decision
```

后者仍是 `provisional_only` 的 current route。

本模块：

```text
does not import
 does not override
 does not migrate
 does not retrain
```

这些 current-22 行为。

---

# 7. Regression

本地 Node 同内容执行：

```text
Choice suitability shared architecture regression: 22 passed, 0 failed
```

覆盖：

- 至少两个 bounded alternatives；
- unique ids；
- Semantic alternatives 禁止传统 selector；
- Theme Adapter required；
- 单 Alternative 可多 Observation Subjects；
- partial preserved；
- missing adapter 不猜；
- 不生成 Winner / scalar score；
- explicit preferences 也不触发隐藏评分；
- career / study / litigation deferred 形态；
- favorable outcome 不等于 overall suitability。

---

# 8. 当前成熟度

```text
sharedChoiceArchitectureDesign = complete
isolatedImplementation = complete
isolatedRegression = 22/22_passed
formalIntegration = blocked
semanticTrainingReady = false
currentRoute = false
```
