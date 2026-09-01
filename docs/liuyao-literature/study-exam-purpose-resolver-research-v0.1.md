# 龟甲 · 六爻 Exam Purpose Resolver 专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed`

主题：

```text
study_exam.PRR-EXAM-PURPOSE
study_exam.generic_exam_pass_outcome
```

> 本专项研究“考试通过”这一现代语言表面形式背后的真实目标职责。本文不修改正式 Intent / Router / Rule Registry / current-22 / training。

---

# 1. 核心问题

现代问法大量使用：

```text
这次考试能不能过？
能不能考上？
这次能通过吗？
考试结果怎么样？
```

这些句子单独看并不足以决定传统观察对象。

因为“通过”可能实际表示：

```text
达到及格线
取得证书 / 资格
进入下一轮
获得学校录取
取得职位 / 编制
获得某一排名
```

所以：

```text
generic_exam_pass_outcome
```

不能直接注册一条统一 Observation Rule。

---

# 2. 古典基础：父母与官鬼本来就是不同职责

《黄金策·求名》《增删卜易·乡试会试》长期并看：

```text
父母 → 文章 / 文书 / 考试内容
官鬼 → 功名 / 名位 / 最终名次与身份结果
世 → 求名本人
```

这已经说明：

```text
exam activity
≠ single traditional target
```

传统体系关注的是：

```text
被评什么
+
最终取得什么
```

---

# 3. 《增删卜易》乡试 / 会试结构

《增删卜易·乡试会试》明确持续观察：

```text
官
父
世
```

并存在：

```text
父旺官衰
父衰官旺
官父世之间的生扶 / 冲克
```

说明考试内部可以有多个职责层，而不是单用神概念可以覆盖全部语义。

尤其：

```text
官父两旺
```

在传统求名中是一个组合判断，不应被现代语义层压缩成：

```text
考试 = 官鬼
```

或：

```text
考试 = 父母
```

---

# 4. 朱辰彬：按考试最终目的区分

《古筮真诠》对乡试 / 会试传统差异给出明确现代解释：

```text
只为获取某种资格的考试
→ 父母爻为用

成败与入职直接挂钩的终考
→ 官鬼爻为用
```

其核心价值不是要求项目完整采用该作者的一切具体取法，而是提供了一个非常重要的现代 semantic principle：

```text
exam purpose
>
surface exam wording
```

也就是：

```text
“考什么”不如“考过以后得到什么”重要。
```

证据分类：

```text
modern_direct_school_specific
```

不能单作者直接升级 universal rule，但非常适合作为 Resolver 设计依据。

---

# 5. 王虎应：考试普遍官父并看

王虎应《六爻预测自修宝典》考试体系明确：

```text
官鬼 → 名次
父母 → 成绩 / 录取通知
```

并普遍用于：

```text
高中
大学
研究生
职称
招聘考试
```

这与朱辰彬“按最终资格 / 职位目的区分主用”的处理不完全相同。

因此不能伪造：

```text
modern consensus = qualification exam only 父母
```

更准确的研究结论是：

```text
父母 / 官鬼职责分离具有高兼容性
具体哪一个是 Primary 存在现代流派差异
```

分类：

```text
cross_source_compatible_for_role_split
school_specific_for_primary_selection
```

---

# 6. Resolver 不应解析“考试类型”，而应解析“考试目的”

不建议：

```text
驾照考试 → 父母
公务员考试 → 官鬼
英语考试 → 父母
研究生考试 → 官鬼
```

这种硬编码会快速失效。

例如：

```text
英语考试
```

可能是：

```text
单纯等级证书
学校录取门槛
公司晋升门槛
移民资格门槛
```

因此 Resolver 核心输入必须是：

```text
downstream consequence
```

---

# 7. 建议的 Exam Purpose 类型

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

---

# 8. 各 Purpose 的语义职责

## 8.1 score_measurement

例：

```text
这次能考多少分？
成绩会不会及格？
```

核心：

```text
父母 / exam_performance_or_score
```

不自动生成官鬼 Primary。

## 8.2 rank_selection

例：

```text
能不能进前十？
这次排名能不能进录取线？
```

核心：

```text
官鬼 / rank_or_selection_standing
```

父母可作为 performance evidence。

## 8.3 qualification_acquisition

例：

```text
这次资格考试能不能拿证？
能不能取得某等级资格？
```

存在现代流派差异。

首轮建议：

```text
父母 = qualification / certificate dimension
官鬼 = optional selection / institutional gate dimension
```

不得自动声称：

```text
qualification exam universally father-only
```

## 8.4 admission_selection

例：

```text
高考后能不能被录取？
考研最终能不能录取？
```

转交：

```text
exam_based_admission_outcome
```

不在 generic exam pass 内继续判断。

## 8.5 employment_selection

例：

```text
公务员最终考试能不能进单位？
招聘终面考试能不能拿到职位？
```

若最终结果直接是：

```text
job acquisition
```

则应转交 career / employment selection duty，而不是留在纯 study route。

## 8.6 stage_advancement

例：

```text
初试能不能进复试？
资格审查后能不能进入下一轮？
```

结果是：

```text
advance_to_next_stage
```

必须与最终录取分开。

## 8.7 skill_assessment_only

例：

```text
内部水平测试能不能及格？
```

若不带独立资格 / 录取 / 职位后果：

```text
父母 / performance
```

优先。

---

# 9. PRR-EXAM-PURPOSE Research Contract

输入建议：

```ts
{
  rawExamObject?: string
  statedGoal?: string
  expectedState?: string
  downstreamConsequence?:
    | 'score_only'
    | 'rank_only'
    | 'certificate_or_license'
    | 'school_admission'
    | 'job_acquisition'
    | 'next_stage'
    | 'none'
    | 'unknown'
  selectionContext?:
    | 'competitive'
    | 'threshold_only'
    | 'noncompetitive'
    | 'unknown'
  namedCredential?: string
  namedInstitution?: string
  namedPosition?: string
}
```

输出：

```ts
{
  status: 'resolved' | 'partial' | 'unresolved'
  examPurpose?: string
  routedDuty?: string
  evidenceRefs: string[]
  issues: string[]
}
```

---

# 10. Resolver 的最高优先级规则

## 10.1 Downstream consequence 优先于 exam noun

```text
“公务员考试”
```

如果问：

```text
能考多少分？
```

仍是：

```text
score_measurement
```

如果问：

```text
最终能不能进单位？
```

则是：

```text
employment_selection
```

## 10.2 “通过”不是 Purpose

```text
pass / 通过 / 考过 / 过关
```

只是 outcome wording。

Resolver 必须继续追问：

```text
通过以后得到什么？
```

## 10.3 “录取”优先进入 admission duty

```text
被学校录取
→ admission_selection
```

不得留在 generic exam pass。

## 10.4 “拿证 / 资格”优先进入 qualification

```text
拿证
取得资格
通过认证
```

进入：

```text
qualification_acquisition
```

## 10.5 “进下一轮”不得当最终成功

```text
初试通过
进入复试
```

只表示：

```text
stage_advancement
```

不得自动输出 final admitted / employed。

---

# 11. Unknown 必须保留

例：

```text
明天考试能不能过？
```

没有任何上下文。

不能因为有：

```text
考试 + 过
```

就直接决定：

```text
父母
官鬼
```

首轮应输出：

```text
examPurpose = unknown
status = unresolved
```

这类 unresolved 是正确行为。

---

# 12. 与现有 Study Duties 的映射

```text
score_measurement
→ exam_score_result

rank_selection
→ exam_rank_result

qualification_acquisition
→ qualification_exam_outcome

admission_selection
→ exam_based_admission_outcome

employment_selection
→ career_position / future employment selection duty

stage_advancement
→ future exam_stage_advancement

skill_assessment_only
→ exam_score_result or performance outcome depending wording
```

因此原：

```text
generic_exam_pass_outcome
```

不应被“实现”，而应被：

```text
Resolver decomposition
```

取代。

---

# 13. Generic Exam Pass 的最终处理

原状态：

```text
generic_exam_pass_outcome = deferred
```

研究后建议：

```text
generic_exam_pass_outcome = deprecated_as_too_coarse
```

替代：

```text
PRR-EXAM-PURPOSE
→ specific duty
```

如果 Resolver 不足：

```text
unresolved
```

而不是 fallback 到“考试通用规则”。

---

# 14. Rule Candidates

## RC-SE-EXAM-PURPOSE-001

```text
考试表面词不能决定 Observation Rule，必须先解析 downstream consequence。
support = cross-source structural compatibility
```

## RC-SE-EXAM-PURPOSE-002

```text
父母负责文书 / 成绩 / 资格维度，官鬼负责名次 / 功名 / selection-standing 维度。
support = stable traditional structure + modern compatibility
```

## RC-SE-EXAM-PURPOSE-003

```text
qualification-only 与 employment-linked final exam 不应自动同路由。
support = modern direct school-specific + semantic necessity
```

## RC-SE-EXAM-PURPOSE-004

```text
“通过”只是 outcome lexical cue，不是 exam purpose。
support = semantic architecture requirement
```

## RC-SE-EXAM-PURPOSE-005

```text
generic_exam_pass_outcome 应废弃为过粗 duty，而不是补一条万能规则。
support = evidence conflict + architecture safety
```

---

# 15. 最终结论

```text
PRR-EXAM-PURPOSE
→ research_contract_ready

generic_exam_pass_outcome
→ deprecated_as_too_coarse
```

建议未来正式流程：

```text
Exam Event
↓
PRR-EXAM-PURPOSE
↓
score / rank / qualification / admission / employment / next-stage
↓
Specific Duty
↓
ObservationPlan
```

当前仍保持：

```text
formal Intent integration = false
formal Rule Registry integration = false
semantic training = false
current route = false
```
