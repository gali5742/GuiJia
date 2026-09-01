# 龟甲 · 六爻 Study / Exam Intent Schema Design v0.1

日期：2026-09-01

状态：`design_only_ready`

主题：`study_exam`

上游：

- `study-exam-research-v1.0.md` — `completed_and_reviewed`
- `study-exam-rule-candidates-v0.1.md` — `ready_for_rule_review`
- `study-exam-rule-review-v0.1.md` — `rule_review_complete`

> 本文件只定义未来 Schema Contract。当前不得修改 `js/liuyao-intent.js`、当前 22-route inventory、Semantic Candidate、训练 / 校准 / blind 数据。

---

# 1. Schema 总原则

Intent 层只回答现代现实问题：

```text
谁在考试 / 学习？
问的是成绩、名次、资格通过、学业进展、学校录取还是别的？
这是什么性质的考试？
是否只是一个考试阶段，还是最终职位取得？
是否存在指定学校？
是否存在明确竞争 / 排名维度？
```

Intent 层不回答：

```text
父母是不是用神
官鬼是不是用神
孩子是不是子孙爻
学校是不是应爻
```

即：

```text
Modern Study Semantics
≠
Traditional Observation Selection
```

---

# 2. Event Schema

未来统一：

```ts
event: {
  type: 'study_exam'
}
```

具体职责通过 `studyDuty` 保存，不在 Event 层先拆成多个传统规则。

---

# 3. Study Duty

建议：

```ts
semantics.studyDuty:
  | 'exam_score_result'
  | 'exam_rank_result'
  | 'qualification_exam_outcome'
  | 'generic_exam_pass_outcome'
  | 'education_admission_outcome'
  | 'academic_progress'
  | 'academic_document_outcome'
  | 'education_choice_comparison'
  | 'generic_study_state'
  | 'unknown'
```

首轮 `supported_design_duty`：

```text
exam_score_result
exam_rank_result
qualification_exam_outcome
academic_progress
```

Recognized but deferred：

```text
generic_exam_pass_outcome
education_admission_outcome
academic_document_outcome
education_choice_comparison
generic_study_state
```

这防止：

```text
考试能不能过 → 偷偷当资格考试
申请学校 → 偷偷当父母规则
论文答辩 → 偷偷复用 exam rule
学业怎么样 → 偷偷当 academic_progress
```

---

# 4. Study Subject

建议新增：

```ts
studySubject: {
  text?: string
  relationToQuerent:
    | 'self'
    | 'child'
    | 'sibling'
    | 'friend'
    | 'spouse'
    | 'parent'
    | 'other'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'unknown'
}
```

首轮 traditional resolver 只自动支持：

```text
self
child
```

其他关系允许 Semantic 识别，但：

```text
traditionalSubjectResolution = unresolved
```

不能把所有代占都继续当世。

---

# 5. Exam Target

建议：

```ts
examTarget?: {
  text: string
  examType:
    | 'course_exam'
    | 'language_test'
    | 'qualification_exam'
    | 'entrance_exam'
    | 'employment_exam'
    | 'professional_title_exam'
    | 'other'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
  resultAspect:
    | 'score'
    | 'performance'
    | 'rank'
    | 'pass_fail'
    | 'qualification'
    | 'selection_stage'
    | 'admission'
    | 'unknown'
}
```

`examType` 只表达现代事实，不直接决定父母 / 官鬼。

---

# 6. Exam Purpose Context

这是防止 generic pass/fail 误路由的核心字段。

建议：

```ts
semantics.examPurpose:
  | 'qualification'
  | 'competitive_rank'
  | 'school_admission'
  | 'employment_linked_stage'
  | 'employment_linked_final'
  | 'ordinary_bounded_exam'
  | 'unknown'
```

## qualification

```text
六级
CPA / 资格证
专业资格
```

只要 current target 是“资格考试本身能否通过”，仍属于 `study_exam`。

## employment_linked_stage

```text
公务员笔试能不能过
招聘考试能不能进下一轮
```

仍属于 `study_exam`。

## employment_linked_final

仅当 current target 已经明确是：

```text
最终能不能取得岗位 / 正式录用
```

才交给 `career_position`。

不能只凭“公务员 / 招聘”词决定。

---

# 7. Current Target Aspect

建议：

```ts
semantics.currentTargetAspect:
  | 'exam_performance'
  | 'rank_or_selection'
  | 'qualification'
  | 'education_admission'
  | 'academic_progress'
  | 'academic_document'
  | 'education_comparison'
  | 'scholarship_money'
  | 'employment_acquisition'
  | 'unknown'
```

这是比 `examType` 更高优先级的 current-target 字段。

例如：

```text
公务员笔试能不能过
→ currentTargetAspect = qualification / rank_or_selection
→ study_exam

这次公务员考试最终能不能让我拿到岗位
→ currentTargetAspect = employment_acquisition
→ career_position
```

---

# 8. Competitive Selection

建议：

```ts
semantics.competitiveSelection:
  | 'explicit'
  | 'context_supported'
  | 'not_indicated'
  | 'unknown'
```

只有明确：

```text
排名
进前三
进面
淘汰赛
竞争一个名额
```

或上下文已验证存在竞争性名位，才进入 selection / competition augmentation。

不能因为“考试一般都有竞争”自动设为 explicit。

---

# 9. Education Institution Context

建议：

```ts
educationInstitution?: {
  text: string
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
  role:
    | 'target_institution'
    | 'current_institution'
    | 'alternative_institution'
    | 'unknown'
}
```

例如：

```text
A 大学会不会录取我？
```

Semantic 可以确定：

```text
educationInstitution.role = target_institution
```

但不能输出：

```text
父母
应
```

后续 `PRR-EDUCATION-INSTITUTION` 允许：

```text
resolved
conflicted
unresolved
```

---

# 10. Academic Context

持续学业需要现实边界。

建议：

```ts
academicContext?: {
  text?: string
  boundaryType:
    | 'term'
    | 'course'
    | 'stage'
    | 'program'
    | 'bounded_period'
    | 'none'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

首轮 `academic_progress` 要求：

```text
boundaryType != none / unknown
```

可接受：

```text
这个学期
这门课
目前这阶段
今年的学习进度
```

不足：

```text
我的学业怎么样
```

---

# 11. Application / Document Context

为了避免“申请学校”与“申请材料”混在一起，建议：

```ts
semantics.applicationMaterialContext:
  | 'explicit'
  | 'context_supported'
  | 'not_indicated'
  | 'unknown'
```

它只表达：

```text
申请材料 / 作品集 / 文书 / 成绩单
```

这一现代职责是否实际存在。

不能从：

```text
studyDuty = education_admission_outcome
```

自动推：

```text
applicationMaterialContext = explicit
```

更不能直接推出父母 selector。

---

# 12. Generic Goal

沿用现有 Intent：

```text
outcome
state
timing
choice
```

首轮：

```text
exam_score_result           → state / outcome
exam_rank_result            → state / outcome
qualification_exam_outcome  → outcome
academic_progress           → state / outcome
```

`studyDuty` 不重复塞进 goal。

---

# 13. Expected State

建议：

```ts
expectedState:
  | 'score_observed'
  | 'rank_observed'
  | 'qualification_passed'
  | 'academic_progress_favorable'
  | 'education_admitted'
  | 'unknown'
```

`education_admitted` 目前只供 deferred contract，不进入首轮 executable rule。

---

# 14. Minimal Sufficiency

## 14.1 Global

首轮至少：

```text
event = study_exam
studySubject = self | child
studyDuty = supported duty
currentTargetAspect matches duty
relevant target is specific | context_bounded
```

### represented subject

若：

```text
studySubject = child
```

可以 route-sufficient，并交给 `PRR-STUDY-SUBJECT` 解析子孙。

若其他 represented relation：

```text
Semantic may resolve
Traditional Rule = unresolved
```

---

## 14.2 Exam Score Result

要求：

```text
studyDuty = exam_score_result
currentTargetAspect = exam_performance
examTarget.resultAspect = score | performance
examTarget.specificity = specific | context_bounded
```

---

## 14.3 Exam Rank Result

要求：

```text
studyDuty = exam_rank_result
currentTargetAspect = rank_or_selection
examTarget.resultAspect = rank | selection_stage
competitiveSelection = explicit | context_supported
```

---

## 14.4 Qualification Exam Outcome

要求：

```text
studyDuty = qualification_exam_outcome
currentTargetAspect = qualification
examPurpose = qualification | ordinary_bounded_exam | employment_linked_stage
examTarget.specificity = specific | context_bounded
```

若：

```text
examPurpose = employment_linked_final
currentTargetAspect = employment_acquisition
```

则不是本主题。

---

## 14.5 Academic Progress

要求：

```text
studyDuty = academic_progress
currentTargetAspect = academic_progress
academicContext.boundaryType = term | course | stage | program | bounded_period
```

---

# 15. Recognized but Unsupported / Deferred

## Generic Exam Pass

```text
这次考试能不能过？
```

若 `examPurpose = unknown`：

```text
semantic = resolved
traditional = unresolved
```

不得猜。

## Education Admission Outcome

```text
能不能被 A 大学录取？
```

可以识别：

```text
studyDuty = education_admission_outcome
```

但当前：

```text
ruleStatus = deferred_until_institution_resolver
```

## Academic Document

```text
论文能不能过
答辩能不能通过
```

当前：

```text
recognized_but_research_insufficient
```

## Education Comparison

```text
A 学校还是 B 学校更合适？
```

当前：

```text
recognized_but_alternative_resolver_missing
```

---

# 16. Cross-route Hard Boundaries

## career_position

```text
exam-stage result
→ study_exam

final employment acquisition
→ career_position
```

## finance

```text
奖学金金额 / 是否拿到奖学金钱
学费
教育贷款
```

current target 为钱时，不属于 study_exam。

## generic document / administration

如果未来出现：

```text
学校申请流程是什么
报名费多少
考试政策怎么规定
```

这些属于现代 informational / procedural unsupported target，不得因为教育词进入占问 route。

---

# 17. Semantic Layer 禁止出现传统字段

Intent / Entity Provider 禁止输出：

```text
父母
官鬼
妻财
兄弟
子孙
世爻
应爻
用神
sixRelative
useGod
```

例如：

```js
{
  studyDuty:'qualification_exam_outcome',
  studySubject:{ relationToQuerent:'self' },
  examPurpose:'qualification',
  currentTargetAspect:'qualification'
}
```

是合法 Semantic 输出；

```js
{
  useGod:'父母'
}
```

不是。

---

# 18. 当前状态

```text
literatureResearch = completed_and_reviewed
ruleReview = complete
intentSchemaDesign = design_only_ready

formalIntentImplementation = blocked_by_current_semantic_baseline
formalRuleRegistryImplementation = blocked_by_current_semantic_baseline
semanticTraining = false
currentRoute = false
```

下一步只允许做 isolated / unreachable pretraining contract implementation。