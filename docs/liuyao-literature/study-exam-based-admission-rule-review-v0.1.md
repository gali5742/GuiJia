# 龟甲 · 六爻考试型录取 Rule Review v0.1

日期：2026-09-01

状态：`rule_review_complete_provisional`

输入：

- `study-education-admission-research-v0.1.md`
- `study-exam-rule-review-v0.1.md`

> 本文件只审查 `exam_based_admission_outcome`。纯申请制录取继续 deferred。

---

# 1. Base Rule

```text
TR-SE-003-A · exam_based_admission_outcome
```

匹配：

```text
event = study_exam
studyDuty = exam_based_admission_outcome
currentTargetAspect = admission_selection
admissionMode = exam_based
```

---

# 2. Core Observation Plan

```text
Primary
→ 官鬼
→ admission_selection_or_standing
→ required

Domain
→ 父母
→ exam_or_application_performance
→ required

Role
→ PRR-STUDY-SUBJECT
→ actual_applicant
→ required
```

这是：

```text
selection result
+
performance / document layer
+
actual applicant
```

的 composite plan。

父母在本 Rule 中是 required Domain，而不是 optional reference。

---

# 3. 指定学校时的 Institution Context

如果没有特定学校：

```text
能不能考上大学？
能不能进入目标层次？
```

Core Plan 可以是：

```text
resolved_design
```

如果：

```text
能不能被 A 大学录取？
```

则还需要：

```text
PRR-EDUCATION-INSTITUTION
```

在 Resolver 未完成前：

```text
Core Plan = resolved
Institution Context = unresolved
Overall = partial_design
```

这是一种正式需要保留的中间状态。

---

# 4. 为什么学校不是 Base Primary

“学校”与“录取结果”不是同一个职责。

王虎应现代录取案例可：

```text
官鬼 → 录取 / 名次主轴
父母 → 成绩参考
```

朱辰彬指定学校案例又可：

```text
应位父母 → 所问学校
另一父母 → 另一学校
```

所以不能让：

```text
school object type
```

覆盖：

```text
admission outcome duty
```

Base Rule 先处理“是否录取”这一选拔结果；学校作为指定 target 另加 contextual observation。

---

# 5. Institution Resolver Contract

未来：

```text
PRR-EDUCATION-INSTITUTION
```

至少返回：

```text
resolved
conflicted
unresolved
```

Resolver 可能需要支持比普通 selector 更强的约束，例如：

```text
role = 应
+
optional six-relative constraint = 父母
```

或者：

```text
specific parent-bearing target resolved by contextual alignment
```

当前不提前决定其最终 selector schema。

---

# 6. Competition Augmentation

只有：

```text
competitiveSelection = explicit | context_supported
```

才追加：

```text
兄弟 / competition_pressure / optional
```

录取本身虽然天然有名额约束，也不能据此机械添加兄弟。

---

# 7. Application-based Admission 不复用

```text
application_based_admission_outcome
```

没有明确考试 / 排名 selection 主轴时，不得复用 `TR-SE-003-A`。

例如：

```text
作品集申请
博士套磁 / 材料审核
综合申请
```

继续 deferred。

---

# 8. Evidence Layer

不进入 Registry：

```text
官鬼旺衰 / 空破
父母旺衰 / 空破
官父关系
官 / 父与 applicant 关系
competition pressure
institution relation
```

未来可输出：

```text
admission_selection_state
performance_state
applicant_state
admission_to_applicant_relation
institution_context_state
```

禁止单项输出录取 Boolean。

---

# 9. 当前状态

```text
examBasedAdmissionLiterature = complete
examBasedAdmissionRuleReview = complete_provisional
ruleRef = TR-SE-003-A
specifiedInstitutionResolverRequired = true
applicationBasedAdmission = deferred
formalIntentIntegration = blocked
formalRuleRegistryIntegration = blocked
semanticTrainingEligible = false
currentRoute = false
```

下一步进入 Study Schema v0.3 与 isolated contract。