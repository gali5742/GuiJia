# 龟甲 · 六爻 Career Position Intent / Event Schema Design v0.2

日期：2026-09-01

状态：`design_only_ready`

主题：`career_position`

基础：`career-position-intent-schema-design-v0.1.md`

> v0.2 保留 v0.1 的 Event、careerDuty、careerTarget、currentTargetAspect、applicationStage、employerContext、employmentAlternatives、retentionThreat 与 Sufficiency 设计，只修正一个接口缺口：正式手续是否需要进入 Observation augmentation，不能从 application stage 自动推断。

---

# 1. 新增 Formalization Context

新增纯现代语义字段：

```ts
semantics.formalizationContext:
  | 'explicit'
  | 'context_supported'
  | 'not_indicated'
  | 'unknown'
```

## explicit

用户当前问题明确提到正式手续 / 文书职责，同时 current target 仍然是职位 / 工作结果，例如：

```text
已经口头说录用了，合同手续会不会影响最后入职？
这次任命手续能不能顺利走完并入职？
```

## context_supported

上下文已经明确存在正式化流程，但该流程不是 current target，例如：

```text
书面 offer 已经在流程里，最后能不能顺利入职？
```

该状态必须来自上游已验证的语义上下文，而不是模型凭 `applicationStage` 自由猜测。

## not_indicated

没有 formalization 现实职责。

## unknown

信息不足，不触发 formalization augmentation。

---

# 2. applicationStage 与 formalizationContext 分责

```text
applicationStage
→ 当前流程走到哪一步

formalizationContext
→ 正式任命 / 文书 / 合同这一现实职责是否真的需要被观察
```

因此：

```text
applicationStage = contract
```

**不自动推出**：

```text
formalizationContext = explicit
```

更不能直接推出：

```text
父母 = Observation Candidate
```

传统 selector 仍由 Rule Registry 决定。

---

# 3. Formalization Primary 与 Augmentation 的区别

如果：

```text
currentTargetAspect = position_or_employment
formalizationContext = explicit | context_supported
```

则未来允许：

```text
AR-CP-002-FORMALIZATION
→ 父母作为 Domain Observation
```

如果：

```text
currentTargetAspect = formalization_document
```

则问题已经变为：

```text
文书 / 任命 / 合同本身是 current target
```

当前首轮仍保持：

```text
deferred_until_schema_validation
```

不得因为有 `formalizationContext` 就复用官鬼 Primary。

---

# 4. First-release Supported Contract

首轮可支持的 career_position 仍只有：

```text
job_application_outcome
position_advancement
employment_retention
employment_transition_outcome
```

且要求：

```text
currentTargetAspect = position_or_employment
```

`formalizationContext` 只决定是否允许后续 Domain augmentation，不改变上述四个 Base Rule 的 Primary。

---

# 5. 当前状态

```text
literatureResearch = completed_and_reviewed
ruleReview = complete
intentSchemaDesign = design_only_ready_v0.2
formalIntentImplementation = false
formalRuleRegistryImplementation = false
semanticTrainingReady = false
currentRoute = false
```

下一步 isolated implementation 应读取本 v0.2，而不是从 `applicationStage` 推导父母观察。
