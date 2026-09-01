# 龟甲 · 六爻考试学业 Pretraining Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented`

主题：`study_exam`

依赖：

- `study-exam-research-v1.0.md`
- `study-exam-rule-candidates-v0.1.md`
- `study-exam-rule-review-v0.1.md`
- `study-exam-intent-schema-design-v0.1.md`

实现：

- `js/liuyao-study-exam-pretraining-v01.js`
- `tests/liuyao-study-exam-pretraining-v01-tests.js`

> 本实现不可达，不接入 `liuyao-intent.js`、Rule Registry、Observation Planner、Router、训练 / 校准 / blind 数据。

---

# 1. 当前 gate

继续遵守：

```text
status = design_only
mayEnterV03Training = false
mayBecomeCurrentRoutes = false
```

模块显式：

```text
status = design_only_unreachable
currentRuntimeReachable = false
```

---

# 2. 已实现首轮职责

```text
exam_score_result
exam_rank_result
qualification_exam_outcome
academic_progress
```

Deferred：

```text
generic_exam_pass_outcome
education_admission_outcome
academic_document_outcome
education_choice_comparison
generic_study_state
```

这些 deferred duty 不会静默重映射到已支持规则。

---

# 3. Study Subject Resolver

已实现：

```text
self
→ 世

child
→ 子孙
```

其他 represented relation：

```text
unresolved
```

最重要的职责隔离：

```text
actual examinee role
≠
exam result primary
```

所以：

```text
家长问孩子六级能不能过
```

Draft Plan 是：

```text
Primary → 父母 / qualification_exam_result
Role    → 子孙 / actual_examinee
```

而不是：

```text
Primary → 子孙
```

---

# 4. Draft Observation Plan

## TR-SE-001-A · score

```text
Primary → 父母 / exam_performance_or_score
Role    → actual examinee
```

## TR-SE-001-B · rank

```text
Primary → 官鬼 / competitive_rank_or_selection_standing
Role    → actual examinee
Domain  → 父母 / exam_performance [optional]
```

## TR-SE-001-C · qualification

```text
Primary → 父母 / qualification_exam_result
Role    → actual examinee
```

只有明确 selection dimension 才追加：

```text
官鬼 / selection_or_title_dimension
```

## TR-SE-001-D · academic progress

```text
Primary → 父母 / academic_learning_or_progress
Role    → actual learner
```

---

# 5. Competition Augmentation

仅：

```text
competitiveSelection = explicit | context_supported
```

才追加：

```text
兄弟 / competition_pressure / optional
```

普通考试不会因为“理论上总有人竞争”自动加兄弟。

---

# 6. Cross-route Gate

模块已实现：

```text
currentTargetAspect = scholarship_money
→ cross_route / finance

currentTargetAspect = employment_acquisition
→ cross_route / career_position
```

同时：

```text
examPurpose = employment_linked_stage
```

只要 current target 仍是考试阶段通过，可继续留在 `study_exam`。

---

# 7. School / Admission 仍然 abstain

Semantic 可以保存：

```text
educationInstitution.role = target_institution
```

但 Draft Observation Plan 不因此产生：

```text
父母 / 应
```

`education_admission_outcome` 当前直接 `deferred`，等待：

```text
PRR-EDUCATION-INSTITUTION
```

研究完成不等于 resolver 已有统一答案。

---

# 8. Semantic / Traditional Isolation

模块实现：

```text
findTraditionalSemanticLeaks(intent)
```

检测：

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

Semantic snapshot 只保存现代字段。

---

# 9. 专项测试

提交前使用同内容临时文件执行：

```bash
node --check liuyao-study-exam-pretraining-v01.js
node --check liuyao-study-exam-pretraining-v01-tests.js
node liuyao-study-exam-pretraining-v01-tests.js
```

结果：

```text
Study exam pretraining regression: 24 passed, 0 failed
```

覆盖：

1. design-only / unreachable；
2. self qualification sufficiency；
3. qualification 父母 Primary + 世 Role；
4. 家长问子女：父母 Primary + 子孙 Role；
5. sibling represented subject 暂不自动化；
6. score 父母 Primary；
7. rank 官鬼 Primary + 父母 Domain；
8. rank 必须有竞争语义；
9. explicit selection 才追加官鬼；
10. qualification 默认不追加官鬼；
11. explicit competition 才追加兄弟；
12. 普通考试不推断竞争；
13. academic progress bounded gate；
14. generic study state deferred；
15. generic pass/fail deferred；
16. education admission deferred；
17. academic document deferred；
18. education comparison deferred；
19. scholarship → finance；
20. final employment acquisition → career_position；
21. employment-linked stage 可留 study_exam；
22. Semantic 不得泄漏传统 selector；
23. school context 不自动映射；
24. application materials context 不自动改变 Primary。

注意：这是 isolated module 专项测试，不等于 current Router / formal Intent / Rule Registry / CI 集成已经通过。

---

# 10. 当前成熟度

```text
literatureResearch               = completed_and_reviewed
ruleCandidateReview              = complete
ruleReview                       = complete
intentSchemaDesign               = ready_v0.1
isolatedContractImplementation   = complete
isolatedRegression               = 24/24_passed

formalIntentImplementation       = blocked
formalRuleRegistryImplementation = blocked
semanticTrainingReady            = false
currentRoute                     = false
```

本主题自身在当前 gate 允许范围内已经推进到 pretraining implementation 末端。