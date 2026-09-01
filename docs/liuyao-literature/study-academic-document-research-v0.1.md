# 龟甲 · 六爻论文 / 答辩 / 毕业专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_with_partial_promotion`

主题：`study_exam` 暂缓项细分

> 原 `academic_document_outcome` 过粗。本专项把论文完成、论文审批、答辩通过、毕业资格、毕业证书对象拆开研究；不修改正式 Intent、Router、Rule Registry、current-22 或训练数据。

---

# 1. 原问题

原研究已经确认：

```text
父母 → 文章 / 文书 / 学业 / 成绩
```

与论文有明显传统连续性。

但：

```text
论文能不能写完
导师会不会批准
答辩能不能过
能不能毕业
毕业证能不能拿到
```

并不是同一 current target。

因此禁止继续使用一个：

```text
academic_document_outcome
```

覆盖全部现代问题。

---

# 2. 传统基础

## 2.1 父母作为文章 / 文书

《增删卜易·用神章》明确：

```text
章奏、文书、文契
→ 父母
```

公开文本：

- https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/8

考试 / 求名传统又长期把：

```text
父母 → 文章 / 学问 / 考试表现
```

作为核心职责。

因此现代：

```text
thesis / dissertation / academic paper as authored text
```

映射到父母具有较强 functional continuity。

---

# 3. 现代资料审计

公开资料可检索到：

- 毕业答辩占例；
- 毕业论文盲审占例；
- 学业 / 考试父母、官鬼组合体系；
- 毕业证 / 学历证书以父母为文书对象的现代沿用。

但这些资料存在两个限制：

1. 论坛卦例往往缺完整可见反馈或统一作者解释；
2. “答辩”“盲审”“毕业资格”并没有形成像资格考试那样稳定的多作者职责共识。

所以不能因为搜索到若干卦例就统一推出：

```text
论文 / 答辩 / 毕业 → 父母
```

---

# 4. Duty A · Academic Document Completion

现代问题：

```text
这篇毕业论文能不能按期写完？
我的论文这阶段能不能顺利完成？
论文修改最终能不能完成定稿？
```

current target：

```text
authored academic document completion
```

建议 duty：

```text
academic_document_completion
```

Observation：

```text
Primary
→ 父母
→ academic_document_or_text
→ required

Role
→ actual learner / author
→ required
```

### 成熟度

```text
traditionalFunctionalContinuity = strong
modernDirectCaseSupport = limited_but_compatible
ruleStatus = provisional_design_ready
```

它可以解除原 `academic_document_outcome` 的一部分暂缓。

### 边界

必须有：

```text
specific / context-bounded paper or document
```

宽泛：

```text
我论文运怎么样
```

仍 insufficient。

---

# 5. Duty B · Academic Review / Approval

现代问题：

```text
导师会不会批准我这版论文？
盲审能不能通过？
学院审核会不会让论文进入答辩？
```

这里至少有：

```text
academic document
reviewer / supervisor / institution
approval decision
```

父母在传统中既可能代表：

```text
文章 / 文书
```

又可能代表：

```text
师长 / 教师
```

导致：

```text
same traditional selector
but multiple real-world objects
```

而盲审 / 学院审核又未必等同导师这一关系对象。

因此当前不能登记静态：

```text
approval → 父母
```

建议未来：

```text
academic_review_approval
+
PRR-ACADEMIC-REVIEW-AUTHORITY
```

当前：`deferred_resolver_required`。

---

# 6. Duty C · Academic Defense Outcome

现代问题：

```text
毕业答辩能不能过？
论文答辩这一轮能不能通过？
```

它具有：

```text
formal assessment
pass / fail
qualification consequence
```

与现有：

```text
qualification_exam_outcome
```

存在较强结构相似性。

因此可提出：

```text
academic_defense_outcome
→ possible specialization of qualification_exam_outcome
```

但当前不能直接 promotion，原因：

1. 现代公开答辩案例数量有限；
2. 答辩结果可能同时取决于论文文本与口头审查；
3. 目前没有足够跨来源证据证明父母单独成为稳定 Primary；
4. 是否需要官鬼承担评审 / qualification dimension 仍未稳定。

当前：

```text
status = provisional_alias_candidate
formalRule = deferred
```

下一步应专门比较：

```text
qualification exam
vs
academic defense
```

而不是直接复用。

---

# 7. Duty D · Graduation Qualification

现代问题：

```text
我今年能不能顺利毕业？
最终能不能拿到学位？
```

这通常可能同时包含：

```text
课程学分
论文完成
答辩结果
学院审核
学位授予
```

所以它不是单一 document outcome。

特别要禁止：

```text
毕业证 = 父母
所以
能不能毕业 = 父母单用神
```

前者是 object mapping，后者是 qualification process。

当前建议：

```text
graduation_qualification
→ composite duty / deferred
```

需要未来 Graduation Requirement Resolver，至少知道用户当前真正缺哪一层资格条件。

---

# 8. Duty E · Diploma / Degree Certificate Object

```text
毕业证什么时候发？
学位证有没有办下来？
```

如果 current target 是：

```text
certificate/document existence or issuance
```

父母作为文书 / 证书对象具有高连续性。

但还需区分：

```text
certificate_issuance
certificate_delivery
lost_certificate
```

### issuance

可作为未来：

```text
academic_certificate_issuance
```

专项研究候选。

### physical delivery

```text
毕业证寄到没有？
```

→ `receive_item`

### lost certificate

```text
毕业证丢了能不能找回？
```

→ `lost_property`

所以“毕业证父母”绝不能覆盖 Route current target。

---

# 9. 新的拆分结果

原：

```text
academic_document_outcome
```

废弃为过粗设计概念。

建议拆成：

```text
academic_document_completion
academic_review_approval
academic_defense_outcome
graduation_qualification
academic_certificate_issuance
```

当前成熟度：

```text
academic_document_completion
→ provisional_design_ready

academic_review_approval
→ deferred_resolver_required

academic_defense_outcome
→ provisional_alias_candidate / deferred formal rule

graduation_qualification
→ deferred_composite

academic_certificate_issuance
→ research_candidate
```

---

# 10. Explicit Non-Candidates

```text
论文 → 一律父母且直接断通过
导师 = 父母，所以论文审批 = 父母单用神
答辩 = 普通考试，无条件复用 qualification rule
毕业证 = 父母，所以能否毕业 = 父母
毕业证寄送 = study_exam
论文盲审 = 父母旺衰直接 Boolean
```

---

# 11. 最终结论

本专项没有把原暂缓项整体解除，而是证明原标签本身设计错误。

真正可以立即进入下一步的是：

```text
academic_document_completion
```

它建议采用：

```text
Primary → 父母 / academic_document_or_text
Role → actual learner / author
```

并标：

```text
provisional_modern_mapping
```

其余项目继续保持不同原因的 deferred，而不是重新塞回一个 `academic_document_outcome`。