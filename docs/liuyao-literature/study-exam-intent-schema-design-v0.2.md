# 龟甲 · 六爻 Study / Exam Intent Schema Design v0.2

日期：2026-09-01

状态：`design_only_ready_v0.2`

主题：`study_exam`

基础：`study-exam-intent-schema-design-v0.1.md`

专项上游：

- `study-academic-document-research-v0.1.md`
- `study-academic-document-completion-rule-review-v0.1.md`

> v0.2 只新增 `academic_document_completion` 为 provisional supported duty，并把原 `academic_document_outcome` 废弃为过粗标签。

---

# 1. Supported Duties 更新

```text
exam_score_result
exam_rank_result
qualification_exam_outcome
academic_progress
academic_document_completion
```

Recognized but deferred：

```text
generic_exam_pass_outcome
education_admission_outcome
academic_review_approval
academic_defense_outcome
graduation_qualification
education_choice_comparison
generic_study_state
academic_certificate_issuance
```

原：

```text
academic_document_outcome
```

不再作为未来 Schema duty。

---

# 2. Current Target Aspect 新增

新增：

```text
academic_document_completion
academic_review_approval
academic_defense
 graduation_qualification
academic_certificate
```

其中 v0.2 正式设计支持的新增 target 只有：

```text
academic_document_completion
```

---

# 3. Academic Document Target

新增：

```ts
academicDocumentTarget: {
  text?: string
  type:
    | 'thesis'
    | 'dissertation'
    | 'academic_paper'
    | 'course_paper'
    | 'research_report'
    | 'other'
    | 'unknown'
  stage:
    | 'drafting'
    | 'revising'
    | 'finalizing'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

Intent 只表达现代对象，不输出父母。

---

# 4. Academic Document Completion

例：

```text
我的毕业论文这个月能不能顺利定稿？
```

设计：

```js
{
  event:{ type:'study_exam' },
  goals:[{ type:'outcome' }],
  semantics:{
    studyDuty:'academic_document_completion',
    currentTargetAspect:'academic_document_completion'
  },
  studySubject:{ relationToQuerent:'self' },
  academicDocumentTarget:{
    type:'thesis',
    stage:'finalizing',
    specificity:'specific'
  }
}
```

后续 Traditional Rule 才选择父母。

---

# 5. Review / Approval 分离

```text
导师会不会批准这版论文？
论文盲审能不能过？
学院会不会准我进入答辩？
```

必须：

```text
studyDuty = academic_review_approval
currentTargetAspect = academic_review_approval
```

当前：`deferred_resolver_required`。

不能因为存在 `academicDocumentTarget` 就偷用 completion rule。

---

# 6. Defense 分离

```text
毕业答辩这次能不能通过？
```

必须：

```text
studyDuty = academic_defense_outcome
currentTargetAspect = academic_defense
```

当前：

```text
provisional_alias_candidate
formal rule deferred
```

不能静默改成 `qualification_exam_outcome`。

---

# 7. Graduation Qualification 分离

```text
我今年能不能顺利毕业？
能不能最终拿到学位？
```

必须：

```text
studyDuty = graduation_qualification
currentTargetAspect = graduation_qualification
```

当前 composite deferred。

---

# 8. Minimal Sufficiency

`academic_document_completion` 至少：

```text
event = study_exam
goal = outcome
studyDuty = academic_document_completion
currentTargetAspect = academic_document_completion
studySubject resolvable by first-phase PRR-STUDY-SUBJECT
academicDocumentTarget.type != unknown
academicDocumentTarget.specificity = specific | context_bounded
academicDocumentTarget.stage = drafting | revising | finalizing
```

宽泛：

```text
我的论文以后怎么样
```

不足。

---

# 9. Expected State

新增：

```text
academic_document_completion
→ academic_document_completed
```

Expected State 不代表结果已经判断成功。

---

# 10. Hard Boundaries

```text
论文写完 / 定稿
→ academic_document_completion

导师 / 盲审 / 学院批准
→ academic_review_approval / deferred

答辩通过
→ academic_defense_outcome / deferred

最终毕业 / 学位资格
→ graduation_qualification / deferred

毕业证签发
→ academic_certificate_issuance / research candidate

毕业证运输
→ receive_item

毕业证遗失
→ lost_property
```

---

# 11. 当前状态

```text
academicDocumentCompletion = ready_provisional
academicReviewApproval = deferred_resolver_required
academicDefenseOutcome = deferred_alias_validation
 graduationQualification = deferred_composite
academicCertificateIssuance = research_candidate

formalIntentImplementation = blocked_by_current_semantic_gate
formalRuleRegistryImplementation = blocked_by_current_semantic_gate
semanticTraining = false
currentRoute = false
```

下一步允许建立 isolated / unreachable academic-document-completion contract。