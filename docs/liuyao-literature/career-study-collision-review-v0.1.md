# 龟甲 · 六爻 Career / Study Cross-Theme Collision Review v0.1

日期：2026-09-01

状态：`collision_review_complete`

主题：

```text
career_position
study_exam
```

上游：

- `career-position-research-v1.0.md`
- `career-position-intent-schema-design-v0.2.md`
- `study-exam-research-v1.0.md`
- `study-exam-intent-schema-design-v0.1.md`

---

# 1. 核心结论

不能用关键词决定：

```text
考试 → study_exam
公务员 / 招聘 → career_position
```

必须以 current target 为最高语义边界：

```text
考试阶段结果
→ study_exam

最终职位 / employment acquisition
→ career_position
```

---

# 2. Study Exam

```text
公务员笔试能不能通过？
招聘考试能不能进下一轮？
教师资格考试能不能过？
职称考试这次能不能及格？
```

current target：

```text
exam-stage result / qualification / rank
```

所以：

```text
study_exam
```

---

# 3. Career Position

```text
这次公务员考试最终能不能上岸拿到岗位？
终考后能不能被正式录用？
通过这轮招聘以后能不能拿到这个职位？
```

current target：

```text
employment acquisition / position acquisition
```

所以：

```text
career_position
```

---

# 4. 同一现实流程可跨主题

一个现实招聘流程可以同时存在：

```text
笔试
面试
终考
录用
入职
```

但每次占问只根据当前问题目标决定主题。

例如：

```text
“明天公务员笔试能不能过？”
→ study_exam

“笔试过了以后，我最终能不能被这个单位录用？”
→ career_position
```

不能因属于同一现实流程就固定一个 route。

---

# 5. 面试词的边界

`面试` 本身也不是 route label。

```text
求职面试最后能不能录用我？
→ career_position
```

因为 current target 是 employment acquisition。

如果明确是学校 / 考试制度中的口试阶段：

```text
研究生复试口试这一轮能不能通过？
→ study_exam
```

因此必须结合：

```text
process domain
+
current target
```

---

# 6. Training Negatives 未来要求

一旦 next-topic training gate 开放，两主题必须互相提供 near-domain negatives。

`study_exam` negatives 至少包含：

```text
公务员考试最终能不能上岸拿岗位
终面后会不会正式录用
这次竞聘最后能不能得到职位
```

`career_position` negatives 至少包含：

```text
公务员笔试能不能过
职称考试能不能及格
资格证考试能不能通过
```

不得用简单 keyword split 造数据。

---

# 7. 当前结论

```text
careerStudyCollisionReview = complete
currentTargetPriority = required
keywordPriority = forbidden
```

该项关闭 `career-position-pretraining-implementation-v0.1.md` 中等待 `study_exam` 反向复核的跨主题前置。

仍然不改变：

```text
trainingEligible = false
currentRoute = false
```