# 龟甲 · 六爻学术评审 / 答辩 / 毕业 / 证书专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_with_mixed_readiness`

范围：

```text
study_exam.academic_review_approval
study_exam.academic_defense_outcome
study_exam.graduation_qualification
study_exam.academic_certificate_issuance
```

> 本专项继续深化 `study-academic-document-research-v0.1.md` 的 residual duties。本文不修改正式 Intent / Router / Rule Registry / current-22 / Time Engine / training。

---

# 1. 研究结论摘要

原先把现代高校流程压成：

```text
论文 / 答辩 / 毕业 / 毕业证
→ 父母
```

是不成立的。

第二轮研究后应拆为：

```text
academic_document_completion
→ 已有 provisional support

academic_review_approval
→ 继续拆 reviewer / document / approval decision
→ partial_design_ready

academic_defense_outcome
→ formal qualification assessment
→ partial_design_ready / not full rule

graduation_qualification
→ composite requirements
→ resolver_required / no single base rule

academic_certificate_issuance
→ document / credential issuance
→ provisional_rule_review_ready
```

---

# 2. 跨来源稳定基础

## 2.1 父母 = 文章 / 文书 / 证书 / 师长

《增删卜易·用神章》明确把：

```text
师长
章奏
文书
书馆
文契
```

归入父母类。

这提供两个不同的现代连续方向：

```text
academic document / thesis / certificate
→ 父母 / document-function

supervisor / teacher
→ 父母 / teacher-function
```

必须注意：

```text
same 六亲 selector
≠ same real-world semantic object
```

来源：

- 《增删卜易·用神章》：https://zh.wikisource.org/zh-hant/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/8
- 《黄金策·求师》：https://zh.wikisource.org/zh-hans/%E9%BB%84%E9%87%91%E7%AD%96

## 2.2 求名传统本来就不是父母单轴

《黄金策·求名》《卜筮全书》明确：

```text
父母 → 文章
官鬼 → 功名 / 官职
世或本主 → 求名本人
```

并有：

```text
文章虽好但官空
→ 不等于最终中式

官旺父弱
→ 文章与最终名位仍是两个职责
```

因此现代：

```text
论文质量
评审过程
资格成立
证书对象
```

不得被一个父母爻统一吞并。

来源：

- 《卜筮全书·黄金策·求名》：https://ctext.org/wiki.pl?chapter=255032&if=en&remap=gb
- 《黄金策·求名》识典文本：https://www.shidianguji.com/book/HY1394/chapter/1l3wdpl9z8njc

## 2.3 教师 / 教育机构有独立 role 结构

《黄金策·求师》明确：

```text
师之主象 → 父母
学者自占 → 世
代占 → 按实际关系取 learner
```

《黄金策·学馆》又明确：

```text
父母 → 书馆 / educational place
应 → 东家 / external counterparty role
世应生合 → 主宾关系
```

这意味着现代 academic review 里：

```text
review authority
```

不能简单等同为一个六亲；它可能同时有：

```text
entity class
+
contextual role
```

来源：

- https://ctext.org/wiki.pl?chapter=902802&if=gb

---

# 3. 朱辰彬现代资料的约束

用户资料库《古筮真诠》《古筮真诠·进阶篇》可核验：

```text
注册会计师考试能否通过
→ 明确以父母为事卦用神

六级考试能否通过
→ 同样以父母作为考试事态用神；特定卦因心态/真用神分析另有进阶处理

职位内部竞聘
→ 官鬼为职位用神
```

这继续支持：

```text
qualification-like assessment
≠ employment selection
```

但不能直接证明：

```text
academic defense = 普通资格考试
```

因为答辩还包含：

```text
thesis artifact
oral defense
review panel
formal degree consequence
```

证据分类：

```text
strong modern continuity for qualification assessment
insufficient direct cross-source evidence for defense-specific primary selection
```

---

# 4. Duty A · Academic Review Approval

现代问题：

```text
导师会不会批准我这版论文？
导师会不会同意我送审？
盲审能不能通过？
学院审核会不会让我进入答辩？
```

原设计：

```text
academic_review_approval
```

仍然过粗，至少应拆：

```text
supervisor_review_approval
anonymous_or_committee_review_approval
```

## 4.1 Supervisor Review Approval

如果明确：

```text
current target = specific supervisor's approval action
```

传统连续性支持：

```text
Reviewer entity class
→ 父母 / teacher

Academic document
→ 父母 / document

Applicant / author
→ actual learner role
```

问题在于：

```text
reviewer 与 document 都可能是父母
```

所以正式实现不能：

```text
取卦中任一父母
```

必须有：

```text
PRR-ACADEMIC-REVIEW-AUTHORITY
+
object-level line anchoring / contextual role resolution
```

当前状态：

```text
semantic duty = ready
traditional classes = partially known
full ObservationPlan = partial_design
```

## 4.2 Anonymous / Committee Review

盲审、学院委员会、匿名评委没有稳定传统亲属实体对应。

可以确认：

```text
document artifact → 父母
actual applicant → learner role
```

但不能确认：

```text
committee decision authority → fixed 官鬼
committee → fixed 应
committee → fixed 父母
```

所以：

```text
anonymous_or_committee_review_approval
→ resolver_required
```

### 结论

```text
academic_review_approval
→ deprecated_as_too_coarse

supervisor_review_approval
→ partial_design_ready

anonymous_or_committee_review_approval
→ deferred_resolver_required
```

---

# 5. Duty B · Academic Defense Outcome

现代问题：

```text
毕业答辩能不能过？
硕士论文答辩能不能通过？
博士答辩能不能顺利通过？
```

它不是单纯：

```text
paper completion
```

也不是：

```text
exam score
```

更合理的现代结构是：

```text
formal qualification assessment
+
academic artifact
+
actual candidate
+
review panel / defense authority
```

## 5.1 与 qualification_exam_outcome 的连续性

朱辰彬注册会计师 / 六级案例，以及其他现代考试体系，支持：

```text
只为取得资格 / 证明的 assessment
→ 父母具有强 primary continuity
```

答辩通过通常不会直接取得职业职位，因此：

```text
career-position 官鬼主轴
```

不应自动引入。

## 5.2 为什么仍不能 full promotion

答辩同时评估：

```text
论文文本
口头陈述 / 回答
评委认可
最终资格
```

当前缺少足够跨来源直接证据证明：

```text
academic_defense_outcome
→ 父母单 Primary 即可完整表示
```

也缺少证据证明：

```text
官鬼必须作为 required qualification authority
```

所以当前建议：

```text
academic_defense_outcome
→ partial_design_ready
```

首轮已知职责：

```text
Role
→ actual candidate
→ required

Domain
→ 父母 / thesis_or_academic_artifact
→ required

Qualification-assessment Primary
→ unresolved at traditional selector layer
```

允许未来 `PRR-FORMAL-ASSESSMENT-TARGET` 解决。

禁止为了完整输出，把 Domain 父母直接提升成 defense result Primary。

---

# 6. Duty C · Graduation Qualification

现代问题：

```text
今年能不能顺利毕业？
最终能不能拿到学位？
这学期能不能完成毕业资格？
```

它通常是多个现实条件的合取：

```text
course credits
language / qualification requirements
academic document completion
review approval
academic defense
administrative clearance
degree conferral
```

所以它不是一个单一 object 或单一 assessment。

## 6.1 新建议

废弃过粗假设：

```text
graduation_qualification
→ single LiuYao selector
```

改为：

```text
Graduation Qualification Event
↓
PRR-GRADUATION-REQUIREMENT
↓
active / unresolved requirement set
↓
requirement-specific ObservationPlans
↓
composite qualification frame
```

## 6.2 当用户已经明确瓶颈

例如：

```text
只差论文答辩了，今年能不能毕业？
```

current target 应回落到：

```text
academic_defense_outcome
```

而不是继续 generic graduation。

例如：

```text
所有要求都完成了，学校最终会不会正式授予学位？
```

这是：

```text
degree_conferral_outcome
```

应另立职责研究，不能和“毕业证发放”混同。

### 当前结论

```text
graduation_qualification
→ composite_resolver_required

PRR-GRADUATION-REQUIREMENT
→ research_contract_ready

degree_conferral_outcome
→ new research candidate
```

generic “能不能毕业”在 requirement 未知时不得自动父母单用。

---

# 7. Duty D · Academic Certificate Issuance

现代问题：

```text
毕业证能不能办下来？
学位证什么时候能签发？
学校会不会正常发我的毕业证？
证书有没有正式生成？
```

如果 current target 明确是：

```text
certificate existence / issuance / formal document generation
```

则传统连续性很强：

```text
父母 → 文书 / 证件 / certificate
```

用户资料库《古筮真诠》也明确把：

```text
父母 → 文件、证书
```

列为现代类象总结。

因此：

```text
academic_certificate_issuance
→ provisional_rule_review_ready
```

建议首轮：

```text
Primary
→ 父母
→ academic_certificate_document
→ required

Role
→ actual recipient / graduate
→ required
```

学校 / issuing authority 可作为 optional contextual institution；当前不要求固定应或父母另一爻。

## 7.1 必须严格区分的边界

```text
能不能顺利毕业 / 获得学位资格
→ graduation_qualification / degree_conferral

毕业证能不能正式签发 / 办下来
→ academic_certificate_issuance

毕业证寄到没有
→ receive_item

毕业证丢了能不能找回
→ lost_property

毕业证什么时候寄到
→ receive_item timing
```

所以：

```text
certificate entity class = 父母
```

绝不能反向决定 Route。

---

# 8. 新的 Status Matrix

```text
academic_document_completion
→ provisional_supported

supervisor_review_approval
→ partial_design_ready

anonymous_or_committee_review_approval
→ deferred_resolver_required

academic_defense_outcome
→ partial_design_ready

graduation_qualification
→ composite_resolver_required

degree_conferral_outcome
→ new_research_candidate

academic_certificate_issuance
→ provisional_rule_review_ready
```

---

# 9. Rule Candidates

## RC-SE-AR-001

```text
specific supervisor review 必须区分 reviewer 与 academic document；两者即使同为父母，也不得语义合并。
status = cross_source_compatible
```

## RC-SE-AR-002

```text
anonymous / committee review 不得固定映射为父母、官鬼或应。
status = insufficient_evidence_for_fixed_selector
```

## RC-SE-DEF-001

```text
academic defense 是 formal qualification assessment，不是普通 score exam，也不是职业录用。
status = cross_source_compatible_semantic_boundary
```

## RC-SE-DEF-002

```text
父母可作为 thesis / academic artifact required Domain；目前不足以直接升级为 defense-result universal Primary。
status = provisional_partial
```

## RC-SE-GRAD-001

```text
generic graduation qualification 是 composite requirements，必须先解析 active requirement。
status = semantic_structural_consensus
```

## RC-SE-CERT-001

```text
current target 为 certificate issuance / document generation 时，父母作为 certificate Primary 具有稳定传统连续性。
status = stable_traditional_function + modern_compatible
```

---

# 10. Explicit Non-Candidates

```text
导师 = 父母，所以导师审核一律取任一父母

论文 = 父母，所以答辩结果一律取父母

答辩 = 考试，所以无条件复用 qualification_exam_outcome

毕业证 = 父母，所以能否毕业一律父母

学位 = 证书，所以 degree conferral 与 certificate issuance 是同一 duty

盲审委员会 = 应
盲审委员会 = 官鬼
```

以上全部禁止进入正式规则。

---

# 11. 下一步建议

可立即进入 Rule Review：

```text
academic_certificate_issuance
```

可以进入 Resolver / partial contract 设计：

```text
supervisor_review_approval
academic_defense_outcome
PRR-ACADEMIC-REVIEW-AUTHORITY
PRR-GRADUATION-REQUIREMENT
```

继续专项研究：

```text
degree_conferral_outcome
```

当前仍：

```text
formal Intent integration = blocked
formal Rule Registry integration = blocked
semantic training = false
current route = false
```

原因仍是 v0.13 next-topic boundary = design_only。