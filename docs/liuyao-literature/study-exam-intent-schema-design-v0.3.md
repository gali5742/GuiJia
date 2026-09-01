# 龟甲 · 六爻 Study / Exam Intent Schema Design v0.3

日期：2026-09-01

状态：`design_only_ready_v0.3`

主题：`study_exam`

基础：`study-exam-intent-schema-design-v0.2.md`

专项上游：

- `study-education-admission-research-v0.1.md`
- `study-exam-based-admission-rule-review-v0.1.md`

> v0.3 把原 `education_admission_outcome` 拆为 exam-based 与 application-based；只提升 exam-based 为 provisional supported design。

---

# 1. Supported Duties 更新

```text
exam_score_result
exam_rank_result
qualification_exam_outcome
academic_progress
academic_document_completion
exam_based_admission_outcome
```

继续 deferred：

```text
generic_exam_pass_outcome
application_based_admission_outcome
academic_review_approval
academic_defense_outcome
graduation_qualification
education_choice_comparison
generic_study_state
academic_certificate_issuance
```

废弃过粗：

```text
education_admission_outcome
academic_document_outcome
```

---

# 2. Current Target Aspect 新增

```text
admission_selection
```

`exam_based_admission_outcome` 必须：

```text
currentTargetAspect = admission_selection
```

---

# 3. Admission Context

新增：

```ts
admissionContext: {
  mode:
    | 'exam_based'
    | 'application_based'
    | 'mixed'
    | 'unknown'
  targetLevel?:
    | 'generic_higher_education'
    | 'school_band'
    | 'specific_institution'
    | 'specific_program'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

首轮只支持：

```text
mode = exam_based
```

`mixed` 与 `application_based` 继续 deferred。

---

# 4. Education Institution Context

保留 / 扩展现代对象：

```ts
educationInstitution?: {
  text?: string
  role:
    | 'target_institution'
    | 'target_program'
    | 'generic_band'
    | 'none'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'none'
}
```

Intent 不输出：

```text
父母
应
```

---

# 5. 无指定学校的 Exam-based Admission

例：

```text
这次高考能不能考上大学？
```

```js
{
  event:{ type:'study_exam' },
  goals:[{ type:'outcome' }],
  semantics:{
    studyDuty:'exam_based_admission_outcome',
    currentTargetAspect:'admission_selection',
    competitiveSelection:'context_supported'
  },
  studySubject:{ relationToQuerent:'self' },
  admissionContext:{
    mode:'exam_based',
    targetLevel:'generic_higher_education',
    specificity:'context_bounded'
  },
  educationInstitution:{
    role:'none',
    specificity:'none'
  }
}
```

可形成完整 Core Plan。

---

# 6. 指定学校的 Exam-based Admission

例：

```text
这次能不能被 A 大学录取？
```

```js
{
  event:{ type:'study_exam' },
  goals:[{ type:'outcome' }],
  semantics:{
    studyDuty:'exam_based_admission_outcome',
    currentTargetAspect:'admission_selection'
  },
  studySubject:{ relationToQuerent:'self' },
  admissionContext:{
    mode:'exam_based',
    targetLevel:'specific_institution',
    specificity:'specific'
  },
  educationInstitution:{
    text:'A大学',
    role:'target_institution',
    specificity:'specific'
  }
}
```

此时 Semantic 已充分，但 Traditional Institution Resolver 可能仍：

```text
unresolved / conflicted
```

因此必须允许：

```text
baseAdmissionPlan = resolved
institutionObservation = unresolved
overallObservationPlan = partial
```

不能把 Intent 回退 unknown，也不能猜学校传统 selector。

---

# 7. Application-based Admission

```text
纯材料申请博士项目能不能录取？
作品集申请能不能拿 offer？
```

输出：

```text
studyDuty = application_based_admission_outcome
admissionContext.mode = application_based
```

当前：

```text
recognized_but_rule_deferred
```

不得重映射为 exam-based。

---

# 8. Minimal Sufficiency

`exam_based_admission_outcome` 至少要求：

```text
event = study_exam
goal = outcome
studyDuty = exam_based_admission_outcome
currentTargetAspect = admission_selection
studySubject first-phase resolvable
admissionContext.mode = exam_based
admissionContext.specificity = specific | context_bounded
```

如果指定 institution / program：

```text
educationInstitution.specificity = specific | context_bounded
```

但传统 Institution Resolution 不属于 Semantic Sufficiency。

---

# 9. Competition Context

```text
competitiveSelection
```

仍按：

```text
explicit
context_supported
not_indicated
unknown
```

它只决定是否允许兄弟 competition augmentation，不决定 admission Event 是否成立。

---

# 10. Expected State

新增：

```text
exam_based_admission_outcome
→ admitted_via_exam_selection
```

这只表示用户目标方向。

---

# 11. Hard Boundaries

```text
分数 → exam_score_result
排名 → exam_rank_result
资格证通过 → qualification_exam_outcome
考试选拔后的学校录取 → exam_based_admission_outcome
纯材料申请录取 → application_based_admission_outcome / deferred
最终职位取得 → career_position
奖学金金钱 → finance
学校 A / B 选择 → education_choice_comparison
```

---

# 12. 当前状态

```text
examBasedAdmission = ready_provisional
applicationBasedAdmission = deferred
specifiedInstitutionResolver = required_for_full_plan
intentSchemaDesign = design_only_ready_v0.3

formalIntentImplementation = blocked_by_current_semantic_gate
formalRuleRegistryImplementation = blocked_by_current_semantic_gate
semanticTraining = false
currentRoute = false
```

下一步允许建立 isolated / unreachable exam-based-admission contract，并显式支持 `partial_design`。