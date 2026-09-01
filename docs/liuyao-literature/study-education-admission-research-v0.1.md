# 龟甲 · 六爻学校录取专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_with_partial_promotion`

主题：`study_exam.education_admission_outcome`

> 原 `education_admission_outcome` 同时混入“选拔录取结果”和“指定学校对象定位”。本专项拆开两层，不修改正式 Intent / Router / Rule Registry / current-22 / training。

---

# 1. 核心问题

现代问法：

```text
这次能不能考上大学？
能不能过一本线被录取？
能不能被 A 大学录取？
申请这个研究生项目会不会录我？
```

表面都叫“录取”，实际至少包含：

```text
selection / admission result
+
exam / application performance
+
actual applicant
+
optional specified institution target
```

所以不能只问：

```text
学校到底是父母还是应？
```

---

# 2. 传统基础

古典求名 / 科举结构长期区分：

```text
父母 → 文章 / 考试表现 / 文书
官鬼 → 功名 / 名次 / 名位结果
世或实际关系爻 → 考生本人
```

因此现代“通过考试竞争获得录取”具有稳定的：

```text
performance dimension
+
selection / standing dimension
```

而不是父母或官鬼二选一。

---

# 3. 王虎应现代直接证据

《六爻预测自修宝典》及王虎应公开案例明确：

```text
官鬼 = 名次 / 录取结果主轴
父母 = 成绩 / 录取通知等参考
```

公开案例“能否考上想去的学校”直接：

```text
以官鬼为用神，父母做参考
```

这给：

```text
exam_based_admission_outcome
```

提供现代直接支持。

但它不能证明：

```text
所有申请制录取
所有指定学校对象
```

都固定官鬼。

---

# 4. 朱辰彬指定学校案例

用户资料库《古筮真诠》可核验：

```text
考后占此校能录取否
```

案例中：

```text
应位父母巳火 → 指定所问学校
另一父母午火 → 另一所学校
兄弟动 → 竞争者
```

并最终体现：

```text
所报学校未录取
另一学校录取
```

这个案例最重要的不是“学校永远父母”，而是证明：

```text
specified institution target
```

可以成为独立 contextual observation，并且同一卦中可能存在多个 institution alternative。

因此禁止：

```text
school → fixed 父母
school → fixed 应
```

---

# 5. 其他现代学校角色证据

公开现代案例也存在：

```text
应爻 = 学校
```

这种 contextual role 使用。

所以学校对象的传统定位至少存在：

```text
应 role
父母-bearing target
contextual / school-specific mapping
```

当前正确结论不是强行择一，而是：

```text
PRR-EDUCATION-INSTITUTION required for specified institution automation
```

---

# 6. 原 Duty 必须拆分

建议废弃过粗：

```text
education_admission_outcome
```

至少拆：

```text
exam_based_admission_outcome
application_based_admission_outcome
```

---

# 7. Exam-based Admission Outcome

现代例：

```text
高考能不能被录取？
这次统考能不能进目标层次学校？
考研初复试后最终能不能录取？
```

前提：

```text
录取主要由考试 / 选拔结果驱动
```

建议结构：

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
→ actual applicant
→ required
```

这里父母建议 `required = true`，因为现代考试录取直接证据通常同时观察官父，不应把成绩 / 文书层当作完全可忽略背景。

### 如果没有指定学校

例如：

```text
这次高考能不能考上大学？
```

可以只使用上述三层结构。

### 如果指定学校

例如：

```text
能不能被 A 大学录取？
```

还必须追加：

```text
Institution Context
→ PRR-EDUCATION-INSTITUTION
→ required contextual observation
```

若 Institution Resolver 为：

```text
unresolved / conflicted
```

则允许：

```text
Semantic admission event = resolved
Base admission plan = resolved
Specified-institution traditional context = unresolved
Overall plan = partial
```

不得为了 full automation 猜学校爻。

---

# 8. Application-based Admission Outcome

现代例：

```text
没有统一考试，申请这个博士项目能不能录？
作品集申请这个学校能不能成功？
综合材料申请能不能拿 admission？
```

这里可能涉及：

```text
材料 / 文书
导师 / committee
学校 / program
名额 / competition
```

但没有稳定的“考试名次”职责。

现有研究不足以证明：

```text
官鬼 admission selection
```

可以无条件跨过去。

因此：

```text
application_based_admission_outcome
→ deferred_for_application_selection_research
```

不能因为中文都叫“录取”就复用 exam-based rule。

---

# 9. Institution Resolver 的目标

建议：

```text
PRR-EDUCATION-INSTITUTION
```

输入：

```text
institution / program semantic object
specificity
current target role
known alternative structure
```

输出：

```text
resolved
conflicted
unresolved
```

但 Resolver 绝不能只根据：

```text
entityType = school
```

硬输出父母或应。

它需要结合已审核的 contextual pattern，未来甚至可能返回：

```text
role selector + six-relative constraint
```

而不是一个简单六亲。

---

# 10. Applicant Role

继续沿用：

```text
PRR-STUDY-SUBJECT
```

首轮：

```text
self → 世
child → 子孙
```

考生 / 申请人 Role 与 admission Primary 分离。

---

# 11. Competition

明确竞争名额时，可以继续条件观察：

```text
兄弟 / competition_pressure
```

但 exam-based admission 已经有官鬼 selection dimension，不意味着：

```text
所有 admission 自动加兄弟
```

只有 explicit / context-supported competition 才追加。

---

# 12. Hard Boundaries

```text
考试分数多少
→ exam_score_result

排名第几
→ exam_rank_result

资格证考试通过
→ qualification_exam_outcome

考试选拔后最终被录取
→ exam_based_admission_outcome

纯材料 / holistic application admission
→ application_based_admission_outcome / deferred

最终拿职位
→ career_position

奖学金钱
→ finance target

选择 A 校还是 B 校
→ education_choice_comparison / alternatives architecture
```

---

# 13. Rule Candidates

## RC-SE-ADM-001

```text
exam-based admission result 应区分 selection 官鬼、performance 父母、actual applicant。
support = cross_source_compatible + modern_direct
```

## RC-SE-ADM-002

```text
specified institution 是独立 contextual target，不等于 selection result。
support = modern direct cross-author compatible
```

## RC-SE-ADM-003

```text
school 不可固定父母或应，需要 Institution Resolver。
support = conflicted / context-sensitive
```

## RC-SE-ADM-004

```text
application-based admission 不得直接复用 exam-based rule。
support = semantic boundary + insufficient traditional continuity
```

---

# 14. 最终结论

原：

```text
education_admission_outcome = deferred
```

现在拆为：

```text
exam_based_admission_outcome
→ provisional_design_ready

application_based_admission_outcome
→ deferred
```

对于 exam-based：

```text
Primary → 官鬼 / admission_selection_or_standing
Required Domain → 父母 / exam_or_application_performance
Role → actual applicant
```

指定学校存在时，再要求 Institution Resolver；Resolver unresolved 时整体 plan 允许 `partial`，不强制猜测学校传统 selector。