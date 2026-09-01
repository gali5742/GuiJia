# 龟甲 · 六爻申请制录取与教育机构 Resolver 专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_with_partial_design`

主题：

```text
study_exam.application_based_admission_outcome
study_exam.education_institution_resolver
```

> 本专项继续深化 `study-education-admission-research-v0.1.md` 中仍 deferred 的 application-based admission 与 specified institution 传统对象定位。本文不修改正式 Intent / Router / Rule Registry / current-22 / training。

---

# 1. 研究问题

现代问法：

```text
没有统一考试，申请这个博士项目能不能录？
作品集申请这个学校能不能成功？
综合材料申请能不能拿 admission？
这个 program 会不会收我？
导师制项目能不能录取我？
```

这类问题不能继续偷换成：

```text
考试成绩
→ 名次
→ 录取
```

因为核心流程可能是：

```text
application materials
+
institution / program review
+
committee / supervisor decision
+
quota / competition
+
final admission
```

考试可以不存在。

---

# 2. 与 Exam-based Admission 的职责边界

已完成的 exam-based admission：

```text
Primary → 官鬼 / admission_selection_or_standing
Required Domain → 父母 / exam_performance
Role → actual applicant
```

其依据是古典科举 / 求名结构与现代考试录取直接案例。

application-based admission 不得直接继承：

```text
官鬼 = admission result
```

理由：

```text
没有稳定考试名次职责
没有必然的 exam performance layer
现代 selection 可以由材料、作品、研究计划、导师匹配、committee review 等共同构成
```

因此两者仍应保留不同 duty。

---

# 3. 传统资料一：求名并不限于纯考试行为

《黄金策·求名》以：

```text
父母 → 文章 / 文书
官鬼 → 功名 / 名位
```

构成传统求名双轴。

更重要的是其中存在：

> 应合日生，必资鹗荐。

相关注解明确把：

```text
推荐 / 荐举 / 人情帮助
```

放在求名结构内部处理。

因此传统体系能够表达：

```text
非纯考试的 selection / recommendation
```

而不是只有笔试名次这一种进入方式。

但这只能证明：

```text
selection without pure exam exists inside traditional 求名 reasoning
```

不能直接证明：

```text
modern application admission → 官鬼 Primary
```

证据分类：

```text
cross_source_compatible_as_selection_analogy
```

来源：

- 《黄金策·求名》
- 《卜筮全书 / 卜筮正宗》相关求名注解
- 《断易天机》选举 / 求官条目

---

# 4. 传统资料二：教育对象本身存在独立的父母 / 世应结构

## 4.1 《黄金策·求师》

核心：

```text
师之主象不异父母
学者自占以世爻看
师弟二主相生相合则吉
```

这说明学习关系至少可以拆成：

```text
education provider / teacher
≠ learner
```

而不是把所有“学业问题”压到同一个父母爻。

## 4.2 《黄金策·学馆》

核心：

```text
父为书馆
世应分别承担主客位置
```

相关注解又明确：

```text
父母 → 书馆 / 教育场所
应 → 对方 / 东家 contextual role
```

这为现代 Institution Resolver 提供了重要传统连续性：

```text
institution entity
```

可以具有：

```text
six-relative class
+
contextual role
```

两层信息。

因此禁止设计成：

```text
school = 父母
```

或：

```text
school = 应
```

二选一。

证据分类：

```text
stable_consensus_for_parent_as_education_place_or_teacher
cross_source_compatible_for_counterparty_role
```

---

# 5. 《卜筮正宗》分类定例的补强

《卜筮正宗》用神分类明确把：

```text
师长
文章
馆室
```

列入父母类。

所以现代学校 / program 作为：

```text
教育机构 / 学习场所 / 教学主体
```

时，父母具有稳定传统连续性。

但这并不意味着：

```text
所有具体学校对象只要 entityType = school 就自动取父母
```

原因是现代 admission 问题中“学校”有时承担的是：

```text
对方决策主体
审核方
竞争名额提供方
```

这属于 contextual role，不等同于实体本体类象。

---

# 6. 朱辰彬现代案例

用户资料库《古筮真诠》可核验多个学校 / 录取相关案例。

## 6.1 指定学校案例

“考后占此校能录取否”中：

```text
应爻父母巳火 → 指定所问学校
另一父母午火 → 另一所学校
```

这说明学校对象可以同时具有：

```text
父母-bearing entity
+
应位 contextual target
```

并且同卦可出现多个 school alternative。

这直接反对：

```text
school → fixed 应
school → first 父母 line
```

## 6.2 报考学校案例

另有“报考市第十六中学能录取否”案例，以父母爻作为所问教育目标进行判断。

现代证据分类：

```text
school_specific_but_direct
```

## 6.3 与事业应聘的对照

《古筮真诠》又存在：

```text
有明确单位的应聘，多取父母爻为用神
```

这说明在现代“进入某一具体机构”的语境中，朱辰彬体系倾向把：

```text
specified institution target
```

作为父母对象处理。

但该作者体系不能独立升级为 universal rule。

---

# 7. 王虎应现代证据的边界

王虎应考试体系稳定使用：

```text
官鬼 → 名次
父母 → 成绩 / 录取通知
```

并有“成绩不够但通过关系最终进入学校”等案例，说明：

```text
exam failure
≠ admission impossibility
```

这支持继续拆分：

```text
exam result
admission realization
```

而不是强制同构。

但目前核验到的王虎应直接材料仍以：

```text
考试 / 考学
```

为主，不能用来证明：

```text
pure application-based admission → 官鬼 Primary
```

因此该部分结论维持：

```text
insufficient_for_universal_application_primary
```

---

# 8. 当代 Application 案例只能作为 Modern Mapping Evidence

公开现代案例可见：

```text
申请 PhD
父母 → 申请文书 / 材料
官鬼 → 目标院校 / 审核方
兄弟 → 竞争者
```

也可见：

```text
学校 → 应
学校 / 专业 → 父母
```

这些案例说明：

```text
modern institution role mapping is genuinely variable
```

但来源多为个人实践记录 / 社区案例，不能单独升级为 traditional consensus。

分类：

```text
modern_mapping_only
school_specific
conflicted
```

它们的价值是证明 Resolver 必须允许 abstain，而不是帮助强制选一个答案。

---

# 9. Application-based Admission 的新职责拆分

研究后建议把纯申请录取拆成：

```text
application_materials
institution_acceptance
actual_applicant
optional_competition
optional_selection_authority
```

其中：

## 9.1 Application Materials

```text
Required Domain
→ 父母
→ application_materials
```

适用：

```text
申请表
研究计划
推荐信
作品集
履历
学术文书
```

如果问句明确是：

```text
材料能不能过审？
```

则父母可以提升为 Primary。

## 9.2 Institution Acceptance

不建议固定为：

```text
官鬼
父母
应
```

而应：

```text
PRR-EDUCATION-INSTITUTION
```

输出 contextual selector。

## 9.3 Applicant

继续：

```text
PRR-STUDY-SUBJECT
```

自占：

```text
世
```

代占按实际关系人。

## 9.4 Competition

只有：

```text
explicit
context_supported
```

才允许：

```text
兄弟 / competition_pressure
```

不得 application 自动加兄弟。

## 9.5 Selection Authority

官鬼可以作为：

```text
selection_authority / institutional_gate
```

候选辅助职责。

但第一版不得设为 universal required observation。

当前分类：

```text
modern_mapping_only / insufficient_for_universal_rule
```

---

# 10. Education Institution Resolver v0.1 Research Contract

建议：

```text
PRR-EDUCATION-INSTITUTION
```

输入：

```ts
{
  institution: {
    text?: string
    entityType: 'school' | 'university' | 'program' | 'department' | 'supervisor_group' | 'generic_institution'
    specificity: 'specific' | 'context_bounded' | 'generic' | 'unknown'
  }
  semanticRole:
    | 'target_institution'
    | 'target_program'
    | 'education_provider'
    | 'reviewing_counterparty'
    | 'alternative_institution'
  admissionMode:
    | 'exam_based'
    | 'application_based'
    | 'mixed'
    | 'unknown'
  knownContext?: {
    counterpartRole?: boolean
    explicitProgramTarget?: boolean
    explicitSupervisorTarget?: boolean
  }
}
```

输出：

```ts
{
  status: 'resolved' | 'partial' | 'conflicted' | 'unresolved'
  selectors?: Array<{
    source: 'six_relative' | 'role' | 'contextual_constraint'
    value: string
    semanticDuty: string
    evidenceRefs: string[]
  }>
  issues: string[]
}
```

---

# 11. Resolver 首轮允许的稳定输出

## 11.1 Education Provider / Learning Institution Entity

若当前职责明确是：

```text
education_provider
```

可输出：

```text
six_relative = 父母
confidence = high
```

依据：

```text
师长 / 馆室 / 书馆 → 父母
```

## 11.2 Reviewing Counterparty

若当前职责明确是：

```text
reviewing_counterparty
```

可输出 role：

```text
应
```

但：

```text
role 应
≠ six-relative classification
```

不得因为位于应位就取消父母类象，也不得因为父母类象就取消应 role。

## 11.3 Specific Institution in Admission

首轮建议：

```text
status = partial | conflicted
```

允许同时保留：

```text
父母 entity-class candidate
应 counterpart-role candidate
```

而不是强制归一。

若同卦多父母 / 多 school alternatives：

```text
必须继续 contextual disambiguation
```

不得取第一个父母。

## 11.4 官鬼候选

现代存在把：

```text
学校 / 审核方 / selection authority → 官鬼
```

的案例。

第一版只记录：

```text
candidate evidence
```

不得 automatic resolve。

---

# 12. Application-based Admission 新 ObservationPlan

第一版建议：

```text
Primary Context
→ PRR-EDUCATION-INSTITUTION
→ semanticDuty = institution_acceptance
→ required = true

Required Domain
→ 父母
→ semanticDuty = application_materials
→ required = true

Role
→ PRR-STUDY-SUBJECT
→ semanticDuty = actual_applicant
→ required = true

Conditional Domain
→ 兄弟
→ semanticDuty = competition_pressure
→ only when explicit/context-supported

Conditional Domain
→ 官鬼
→ semanticDuty = selection_authority_or_gate
→ provisional / not universal
```

关键变化：

```text
application admission 不再要求官鬼一定 Primary
```

也不要求：

```text
Institution Resolver 必须返回单一六亲
```

---

# 13. Partial Design 是合法终态

例：

```text
申请 A 大学博士项目能不能录？
```

Semantic：

```text
event = study_exam
studyDuty = application_based_admission_outcome
admissionMode = application_based
institution = A大学博士项目
applicant = self
```

可以完全 resolved。

Traditional：

```text
application materials → 父母 / resolved
applicant → 世 / resolved
institution entity → 父母 candidate
institution counterparty → 应 role candidate
selection authority → unresolved / optional
```

因此 Overall Plan 可为：

```text
partial
```

这不是失败。

必须允许：

```text
Semantic Route = resolved
Traditional Institution Resolution = partial / conflicted
```

---

# 14. Mixed Admission 必须继续单独处理

现代很多研究生录取其实是：

```text
application materials
+
written exam
+
interview
+
committee decision
```

因此：

```text
mode = mixed
```

不能自动归入：

```text
exam_based
```

也不能自动归入：

```text
application_based
```

后续需要独立：

```text
mixed_admission_composition
```

把不同阶段作为同一 admission event 内的 compatible sub-duties，而不是 multiple events。

---

# 15. Hard Boundaries

```text
考试分数
→ exam_score_result

考试名次
→ exam_rank_result

考试选拔型最终录取
→ exam_based_admission_outcome

纯材料 / portfolio / proposal / recommendation-based 录取
→ application_based_admission_outcome

材料是否合格 / 能否过材料审
→ application_material_review

导师是否愿意接收
→ supervisor_acceptance / future resolver work

学校 A / B 哪个更适合
→ education_choice_comparison

是否最终毕业
→ graduation_qualification
```

---

# 16. Evidence Classification

```text
父母 = 师长 / 馆室 / 书馆
→ stable_consensus

学者 / 申请人独立 Role
→ stable_consensus

世应表示主客 / 对方关系
→ cross_source_compatible

非纯考试的荐举可以进入传统求名结构
→ cross_source_compatible_as_analogy

学校 = 父母实体类象
→ cross_source_compatible_to_stable

学校 = 应 contextual role
→ cross_source_compatible_as_role

学校 / 审核方 = 官鬼
→ modern_mapping_only / conflicted

pure application admission 固定官鬼 Primary
→ insufficient_evidence
```

---

# 17. Rule Candidates

## RC-SE-APP-001

```text
application-based admission 与 exam-based admission 必须分离。
support = semantic necessity + literature boundary
```

## RC-SE-APP-002

```text
申请材料属于父母职责。
support = stable_consensus / modern continuity
```

## RC-SE-APP-003

```text
教育机构作为教育提供者 / 馆室具有父母类象连续性。
support = stable_consensus
```

## RC-SE-APP-004

```text
教育机构作为对方决策主体可以独立具有应 role。
support = cross_source_compatible
```

## RC-SE-APP-005

```text
Institution Resolver 可同时返回 six-relative candidate + contextual role，不强制单 selector。
support = architecture requirement derived from conflicting evidence
```

## RC-SE-APP-006

```text
官鬼 selection authority 只能条件化使用，不得作为所有 application admission 的 universal Primary。
support = insufficient universal evidence
```

## RC-SE-APP-007

```text
Semantic admission resolved + Traditional institution partial/conflicted 是合法状态。
support = project architecture requirement
```

---

# 18. 最终结论

原状态：

```text
application_based_admission_outcome = deferred
education_institution_resolver = unresolved
```

研究后建议更新：

```text
application_based_admission_outcome
→ partial_design_ready

education_institution_resolver
→ research_contract_ready
```

第一版 Application Plan：

```text
Primary Context
→ PRR-EDUCATION-INSTITUTION / institution_acceptance

Required Domain
→ 父母 / application_materials

Role
→ actual applicant

Conditional
→ 兄弟 / competition
→ 官鬼 / selection authority (provisional only)
```

Resolver 不追求 100% 自动归一；其成功标准包括：

```text
resolved where evidence stable
partial where entity + role can be separated
conflicted where modern schools diverge
unresolved where context insufficient
```

当前仍不进入 formal Rule Registry / Intent integration / training。
