# 龟甲 · 六爻考试型录取 Pretraining Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented_provisional`

主题：`study_exam.exam_based_admission_outcome`

依赖：

- `study-education-admission-research-v0.1.md`
- `study-exam-based-admission-rule-review-v0.1.md`
- `study-exam-intent-schema-design-v0.3.md`

实现：

- `js/liuyao-study-exam-based-admission-pretraining-v01.js`
- `tests/liuyao-study-exam-based-admission-pretraining-v01-tests.js`

---

# 1. 原录取 Duty 已拆分

```text
education_admission_outcome
```

不再作为单一标签。

当前：

```text
exam_based_admission_outcome
→ provisional implemented

application_based_admission_outcome
→ deferred
```

---

# 2. Core Observation Plan

```text
TR-SE-003-A

Primary
→ 官鬼 / admission_selection_or_standing

Required Domain
→ 父母 / exam_or_application_performance

Role
→ actual applicant
```

Applicant Resolver 继续：

```text
self → 世
child → 子孙
other → unresolved
```

---

# 3. 新增 partial_design 状态

无指定学校：

```text
Overall Plan = resolved_design
```

指定学校：

```text
Base Admission Plan = resolved
PRR-EDUCATION-INSTITUTION = unresolved
Overall Plan = partial_design
```

这保证：

```text
能不能被 A 大学录取？
```

不会：

1. 整体退回 unknown；
2. 猜 `应 = 学校`；
3. 猜 `父母 = 学校`。

---

# 4. Competition

只有：

```text
competitiveSelection = explicit | context_supported
```

才追加：

```text
兄弟 / competition_pressure / optional
```

普通 admission 不机械加兄弟。

---

# 5. Application-based Admission

模块明确：

```text
application_based_admission_outcome
→ deferred
```

作品集、纯材料、博士套磁等不能偷用 exam-based rule。

---

# 6. Evidence

只产生：

```text
admission_selection_state
performance_state
applicant_state
```

强制：

```text
finalAssessment = null
scoring = null
```

---

# 7. 专项测试

本地 Node 同内容执行：

```text
Study exam based admission regression: 18 passed, 0 failed
```

重点覆盖：

- 官鬼 Primary + 父母 required Domain；
- child applicant 不改变 admission Primary；
- specified institution → partial_design；
- 不猜父母 / 应作为学校；
- application-based admission deferred；
- explicit competition 才追加兄弟；
- Evidence 不生成最终结论。

---

# 8. 当前状态

```text
examBasedAdmissionDeferredReason = cleared_for_provisional_design
isolatedRegression = 18/18_passed
specifiedInstitutionResolver = still_required
applicationBasedAdmission = deferred

formalIntentIntegration = blocked
formalRuleRegistryIntegration = blocked
semanticTrainingEligible = false
currentRoute = false
```