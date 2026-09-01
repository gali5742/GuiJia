# 龟甲 · 六爻考试学业 Rule Review v0.1

日期：2026-09-01

状态：`rule_review_complete`

输入：

- `docs/liuyao-literature/study-exam-research-v1.0.md`
- `docs/liuyao-literature/study-exam-rule-candidates-v0.1.md`
- `js/liuyao-rule-registry.js`
- `js/liuyao-observation-plan.js`
- 《龟甲 · 六爻复合观察与取用规则规范 v0.2（草案）》

> 本文件完成 Candidate 的职责审计与 Observation Rule 设计，不修改正式 Rule Registry，不晋升 Semantic Route。

---

# 1. Review 总结

16 条 Candidate 不能变成 16 条 Rule Registry Rule。

最终应拆成：

```text
4 个首轮 Base Observation Rules
+
1 个 Study Subject Resolver
+
若干条件 Domain / Context Augmentation
+
独立 Exam / Academic Assessment Evidence 层
```

首轮真正可以静态设计 Base Rule 的职责只有：

```text
exam_score_result
exam_rank_result
qualification_exam_outcome
academic_progress
```

而：

```text
generic_exam_pass_outcome
education_admission_outcome
education_choice_comparison
academic_document_outcome
```

当前都不能被硬塞进静态 Base Rule。

---

# 2. Candidate 最终去向

| Candidate | Review 去向 |
|---|---|
| RC-SE-001 score / performance | Base Rule A |
| RC-SE-002 rank / standing | Base Rule B |
| RC-SE-003 qualification | Base Rule C |
| RC-SE-004 generic pass/fail | exam-purpose resolver；暂不 enabled |
| RC-SE-005 self examinee | Study Subject Resolver |
| RC-SE-006 represented examinee | Study Subject Resolver |
| RC-SE-007 academic progress | Base Rule D |
| RC-SE-008 admission multi-duty | resolver architecture contract |
| RC-SE-009 institution resolver | `PRR-EDUCATION-INSTITUTION` design only |
| RC-SE-010 competition | conditional Domain augmentation / Evidence |
| RC-SE-011 vitality | Assessment Evidence |
| RC-SE-012 cross-observation relation | Assessment Evidence |
| RC-SE-013 career collision | Semantic boundary |
| RC-SE-014 scholarship boundary | Semantic boundary |
| RC-SE-015 academic document | deferred |
| RC-SE-016 education choice | deferred |

---

# 3. Base Rule A · Exam Score Result

设计：

```text
TR-SE-001-A
appliesTo:
  event = study_exam
  studyDuty = exam_score_result
```

Observation Plan：

```text
Primary
→ 父母
→ exam_performance_or_score

Role
→ PRR-STUDY-SUBJECT
→ actual_examinee
```

理由：父母的文章、文字、成绩、知识职责跨传统与现代都稳定；score current target 不需要为了“考试”二字强行把官鬼设成共同 Primary。

---

# 4. Base Rule B · Exam Rank Result

设计：

```text
TR-SE-001-B
appliesTo:
  event = study_exam
  studyDuty = exam_rank_result
```

Observation Plan：

```text
Primary
→ 官鬼
→ competitive_rank_or_selection_standing

Role
→ PRR-STUDY-SUBJECT
→ actual_examinee

Domain
→ 父母
→ exam_performance
→ optional
```

父母保留成绩 / 作答基础，但名次 current target 由官鬼承担主职责。

禁止把该结构反向泛化到所有考试。

---

# 5. Base Rule C · Qualification Exam Outcome

设计：

```text
TR-SE-001-C
appliesTo:
  event = study_exam
  studyDuty = qualification_exam_outcome
```

Observation Plan：

```text
Primary
→ 父母
→ qualification_exam_result

Role
→ PRR-STUDY-SUBJECT
→ actual_examinee
```

若 Semantic 明确存在：

```text
competitiveSelection = explicit | context_supported
selectionDimension = true
```

才追加：

```text
Domain
→ 官鬼
→ selection_or_title_dimension
```

`applicationStage`、考试名称、职业背景本身都不能自动触发官鬼。

---

# 6. Base Rule D · Academic Progress

设计：

```text
TR-SE-001-D
appliesTo:
  event = study_exam
  studyDuty = academic_progress
```

Observation Plan：

```text
Primary
→ 父母
→ academic_learning_or_progress

Role
→ PRR-STUDY-SUBJECT
→ actual_learner
```

前提必须有 bounded academic context：

```text
term
course
stage
bounded study period
```

无限期“学业怎么样”只做 Semantic candidate，不进入该 Base Rule。

---

# 7. PRR-STUDY-SUBJECT

本主题必须有独立 subject resolver。

概念接口：

```ts
interface StudySubjectResolution {
  status: 'resolved' | 'unresolved'
  subjectRelation: string
  selector?: {
    type: 'shi' | 'six_relative'
    value?: string
  }
  evidenceRefs: string[]
  issues: string[]
}
```

首轮：

```text
self
→ 世

child
→ 子孙
```

重要：

```text
子孙作为 actual examinee Role
```

不等于：

```text
子孙作为 exam result Primary
```

不得因为家长问孩子考试就改掉父母 / 官鬼的考试职责。

其他：

```text
spouse
friend
sibling
parent
other represented subject
```

虽然《黄金策》提供了关系类取法框架，但首轮不在没有完整 participant resolver 审计的情况下全部自动化。

---

# 8. Generic Exam Pass 不能做静态 Base Rule

问句：

```text
这次考试能不能过？
```

仅有 `pass_fail` 不足以决定传统职责。

未来需要：

```text
PRR-EXAM-PURPOSE
```

至少辨别：

```text
qualification
competitive_rank
school_admission
employment_linked_final
ordinary_bounded_exam
unknown
```

可能结果：

```text
qualification
→ TR-SE-001-C

employment_linked_final + current target employment acquisition
→ career_position

unknown
→ unresolved
```

因此不能注册：

```text
TR-SE-GENERIC-PASS → 父母
```

也不能：

```text
TR-SE-GENERIC-PASS → 官鬼
```

---

# 9. Education Admission 暂不注册 Base Rule

研究已经证明录取问题包含：

```text
exam / application performance
selection result
specified institution
```

但指定学校的传统 selector 不是跨来源单值。

所以 `education_admission_outcome` 当前只达到：

```text
rule_architecture_ready
selector_resolution_not_ready
```

未来建议：

```text
PRR-EDUCATION-INSTITUTION
```

输出：

```text
resolved
conflicted
unresolved
```

严禁：

```text
school → 父母
school → 应
```

静态硬编码。

---

# 10. 条件 Augmentation

## AR-SE-001-SELECTION

当考试存在明确 rank / title / selection dimension：

```text
官鬼
→ selection_or_rank_dimension
→ domain
→ optional
```

该 augmentation 主要供资格型考试等父母 Primary 结构使用。

## AR-SE-002-COMPETITION

仅当：

```text
competitiveSelection = explicit | context_supported
```

追加：

```text
兄弟
→ competition_pressure
→ domain
→ optional
```

禁止 NLP 因“所有考试都有竞争”自行触发。

## AR-SE-003-INSTITUTION

保留设计位：

```text
PRR-EDUCATION-INSTITUTION
→ specified_education_institution
```

在 resolver 完成前不得 enabled。

---

# 11. Assessment Evidence 不进入 Rule Registry

以下只进入未来 `StudyAssessmentEvidence`：

```text
父母旺衰 / 空破
官鬼旺衰 / 空破
父母与官鬼生克合冲
Primary 与 actual examinee 的关系
兄弟竞争 Evidence
财克父
子孙克官
父化官 / 官化父
```

建议接口：

```ts
interface StudyAssessmentEvidence {
  type: string
  duty: string
  subjectRef: string
  polarity: 'positive' | 'negative' | 'neutral'
  factRefs: string[]
  ruleRef: string
}
```

不输出单项最终结论。

---

# 12. 与 career_position 的正式双向审查

上一主题的 collision 现在可以确认：

```text
公务员笔试能不能过
→ study_exam

招聘考试能不能进下一轮
→ study_exam

教师资格考试能不能过
→ study_exam

这次公务员考试最终能不能上岸拿到岗位
→ career_position

终考以后能不能正式录用
→ career_position
```

规则：

```text
exam-stage current target
→ study_exam

employment-acquisition current target
→ career_position
```

关键词不能覆盖 current target。

---

# 13. Source Registry 前置

正式把 `EV-SE-*` 写入 `liuyao-rule-registry.js` 前，需要补入实际采用的 source provenance：

```text
断易天机
易隐
黄金策 / 卜筮全书 lineage
增删卜易
王虎应《六爻预测自修宝典》
王虎应《六爻用神答疑》
朱辰彬《古筮真诠》
朱辰彬《古筮真诠·进阶篇》
```

并标记《黄金策》与《卜筮全书》《卜筮正宗》的文本承接关系，不能伪装成三个完全独立来源。

---

# 14. Review 最终结论

可进入 Schema / isolated implementation：

```text
TR-SE-001-A exam_score_result
TR-SE-001-B exam_rank_result
TR-SE-001-C qualification_exam_outcome
TR-SE-001-D academic_progress
PRR-STUDY-SUBJECT
AR-SE-001-SELECTION
AR-SE-002-COMPETITION
```

只保留 design，不进入首轮 executable rule：

```text
PRR-EXAM-PURPOSE
PRR-EDUCATION-INSTITUTION
education_admission_outcome
```

暂缓：

```text
academic_document_outcome
education_choice_comparison
```

当前：

```text
ruleReview = complete
formalRuleRegistryReady = false
semanticTrainingReady = false
```