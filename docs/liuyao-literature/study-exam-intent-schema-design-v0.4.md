# 龟甲 · 六爻 Study / Exam Intent Schema Design v0.4

日期：2026-09-01

状态：`design_only_ready_v0.4`

基础：

- `study-exam-intent-schema-design-v0.3.md`
- `study-application-admission-institution-resolver-research-v0.1.md`
- `study-exam-purpose-resolver-research-v0.1.md`
- `study-academic-review-defense-graduation-certificate-research-v0.1.md`
- `study-academic-certificate-issuance-rule-review-v0.1.md`

> v0.4 继续拆解 application admission、academic review、defense、graduation 与 certificate issuance。仍为 design-only，不接正式 Router / Intent / Rule Registry / training。

---

# 1. Study Duty Registry v0.4

## 1.1 Provisional Supported / Rule-review Ready

```text
exam_score_result
exam_rank_result
qualification_exam_outcome
academic_progress
academic_document_completion
exam_based_admission_outcome
academic_certificate_issuance
```

## 1.2 Partial Design Ready

```text
application_based_admission_outcome
supervisor_review_approval
academic_defense_outcome
```

## 1.3 Resolver / Composite Required

```text
anonymous_or_committee_review_approval
graduation_qualification
```

## 1.4 New Research Candidate

```text
degree_conferral_outcome
```

## 1.5 Deprecated as Too Coarse

```text
generic_exam_pass_outcome
education_admission_outcome
academic_document_outcome
academic_review_approval
```

## 1.6 Remain Insufficient / Deferred

```text
education_choice_comparison
generic_study_state
```

---

# 2. Exam Purpose Resolver Contract

新增：

```ts
examPurpose:
  | 'score_measurement'
  | 'rank_selection'
  | 'qualification_acquisition'
  | 'admission_selection'
  | 'employment_selection'
  | 'stage_advancement'
  | 'skill_assessment_only'
  | 'unknown'
```

原则：

```text
surface exam wording
<
downstream consequence
```

例：

```text
“这次考试能不能过？”
```

仅凭这一句不能直接生成 ObservationPlan；必须先解析 `examPurpose`。

---

# 3. Admission Context v0.4

```ts
admissionContext?: {
  mode:
    | 'exam_based'
    | 'application_based'
    | 'mixed'
    | 'unknown'
  targetLevel:
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

## 3.1 Exam-based

```text
studyDuty = exam_based_admission_outcome
currentTargetAspect = admission_selection
```

Core Observation：

```text
官鬼 Primary / selection-standing
父母 Required Domain / exam performance
actual applicant Role
```

## 3.2 Application-based

```text
studyDuty = application_based_admission_outcome
currentTargetAspect = application_selection
```

Semantic 可以完整识别，但 Traditional Plan 允许：

```text
partial_design
```

已知：

```text
application materials → 父母-compatible
applicant → actual learner role
institution / program → PRR-EDUCATION-INSTITUTION
selection authority → unresolved / contextual
```

不得自动复用 exam-based 官鬼 Primary。

---

# 4. Education Institution Object

```ts
educationInstitution?: {
  text?: string
  role:
    | 'target_institution'
    | 'target_program'
    | 'issuer_context'
    | 'review_institution'
    | 'none'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'none'
}
```

Resolver：

```text
PRR-EDUCATION-INSTITUTION
```

允许未来输出：

```text
relativeConstraint
+
contextualRole
+
resolutionStatus
```

而不是单值父母 / 应。

---

# 5. Academic Review Context

新增：

```ts
academicReviewContext?: {
  mode:
    | 'supervisor'
    | 'anonymous_review'
    | 'committee_review'
    | 'institutional_review'
    | 'unknown'
  currentTarget:
    | 'approval_action'
    | 'permission_to_submit'
    | 'permission_to_defend'
    | 'review_result'
    | 'unknown'
  authoritySpecificity:
    | 'specific_person'
    | 'specific_committee'
    | 'anonymous'
    | 'institutional'
    | 'unknown'
}
```

Resolver：

```text
PRR-ACADEMIC-REVIEW-AUTHORITY
```

## 5.1 Supervisor Review

```text
studyDuty = supervisor_review_approval
```

已知传统 continuity：

```text
supervisor / teacher → 父母 class compatible
academic document → 父母 document compatible
```

因此如果 Resolver 尚不能区分具体 real-world object 对应哪一父母爻：

```text
overallObservationPlan = partial_design
```

不得选择“第一个父母”。

## 5.2 Anonymous / Committee Review

```text
studyDuty = anonymous_or_committee_review_approval
```

当前：

```text
recognized_but_resolver_deferred
```

不固定：

```text
committee = 官鬼 / 应 / 父母
```

---

# 6. Academic Defense Context

新增：

```ts
academicDefenseContext?: {
  stage:
    | 'proposal_defense'
    | 'thesis_defense'
    | 'degree_defense'
    | 'other_formal_defense'
    | 'unknown'
  consequence:
    | 'qualification_gate'
    | 'revision_required'
    | 'degree_eligibility'
    | 'unknown'
  thesisRequired:
    | true
    | false
    | 'unknown'
}
```

```text
studyDuty = academic_defense_outcome
currentTargetAspect = formal_qualification_assessment
```

首轮已知：

```text
actual candidate Role = required
thesis / academic artifact 父母 Domain = required when present
formal assessment Primary = unresolved traditional selector
```

所以：

```text
academic_defense_outcome = partial_design_ready
```

不得无条件 alias 到 `qualification_exam_outcome`。

---

# 7. Graduation Context

新增：

```ts
graduationContext?: {
  currentRequirement:
    | 'course_credit'
    | 'language_or_external_qualification'
    | 'academic_document'
    | 'academic_review'
    | 'academic_defense'
    | 'administrative_clearance'
    | 'degree_conferral'
    | 'multiple_requirements'
    | 'unknown'
  allSubstantiveRequirementsComplete?: boolean | 'unknown'
}
```

Resolver：

```text
PRR-GRADUATION-REQUIREMENT
```

`graduation_qualification` 不允许直接映射一个六亲。

若 `currentRequirement` 已知，则应优先重路由到 requirement-specific duty。

例：

```text
只差答辩，问今年能不能毕业
→ academic_defense_outcome
```

而不是保留 generic graduation。

若所有 substantive requirements 已完成，问题是：

```text
学校会不会正式授予学位
```

则：

```text
studyDuty = degree_conferral_outcome
status = research_required
```

---

# 8. Certificate Context

新增：

```ts
academicCertificate?: {
  type:
    | 'graduation_certificate'
    | 'degree_certificate'
    | 'qualification_certificate'
    | 'transcript_or_record'
    | 'other_academic_credential'
    | 'unknown'
  targetAction:
    | 'issue'
    | 'generate'
    | 'existence_confirmation'
    | 'physical_delivery'
    | 'replacement_application'
    | 'unknown'
}
```

## 8.1 Supported first-phase case

```text
targetAction = issue | generate | existence_confirmation
```

→

```text
studyDuty = academic_certificate_issuance
currentTargetAspect = academic_certificate_document
```

Observation：

```text
父母 Primary / academic certificate document
actual recipient Role
```

## 8.2 Route boundaries

```text
physical_delivery
→ receive_item

lost credential recovery
→ lost_property

replacement application approval
→ separate administrative/document approval research

degree qualification itself
→ graduation_qualification / degree_conferral_outcome
```

---

# 9. Expected State Registry

新增：

```text
supervisor_review_approval
→ supervisor_approved

academic_defense_outcome
→ defense_passed

graduation_qualification
→ graduation_requirements_satisfied

degree_conferral_outcome
→ degree_formally_conferred

academic_certificate_issuance
→ certificate_issued

application_based_admission_outcome
→ admitted_via_application_selection
```

`expectedState` 只表示用户目标，不是 Assessment 结论。

---

# 10. Partial Design Status

Schema v0.4 正式允许：

```text
semanticEvent = resolved
knownObservationResponsibilities = resolved
unresolvedContextualResolver = unresolved
overallObservationPlan = partial_design
```

适用：

```text
application-based admission with unresolved institution role
specific supervisor review with unresolved line anchoring
academic defense with unresolved formal-assessment Primary
```

`partial_design` 不是错误，也不得自动 fallback 到 legacy heuristic。

---

# 11. Hard Boundaries Summary

```text
论文写完 / 定稿
→ academic_document_completion

导师批准论文
→ supervisor_review_approval

盲审 / 委员会审核
→ anonymous_or_committee_review_approval

论文答辩通过
→ academic_defense_outcome

泛问能不能毕业
→ graduation_qualification + PRR-GRADUATION-REQUIREMENT

学校正式授予学位
→ degree_conferral_outcome / research required

毕业证 / 学位证签发
→ academic_certificate_issuance

证书寄送
→ receive_item

证书遗失
→ lost_property
```

---

# 12. Current Status

```text
intentSchemaDesign = design_only_ready_v0.4
academicCertificateIssuance = provisional_rule_review_complete
academicDefense = partial_design_ready
supervisorReview = partial_design_ready
graduationQualification = composite_resolver_required
degreeConferral = research_required
applicationBasedAdmission = partial_design_ready
examPurposeResolver = research_complete

formalIntentImplementation = blocked_by_current_semantic_gate
formalRuleRegistryImplementation = blocked_by_current_semantic_gate
semanticTraining = false
currentRoute = false
```

当前 v0.13 `nextTopicBoundary.status = design_only`，所以本 Schema 只提供未来扩展契约。