# 龟甲 · 六爻学术证书签发 Rule Review v0.1

日期：2026-09-01

状态：`rule_review_complete_provisional`

输入：

- `study-academic-review-defense-graduation-certificate-research-v0.1.md`
- `study-academic-document-research-v0.1.md`
- `study-exam-rule-review-v0.1.md`

> 本文件只审查 `academic_certificate_issuance`。不得借“证书=父母”反向覆盖毕业资格、学位授予、证书寄送或失物找回。

---

# 1. Base Rule

```text
TR-SE-003-A · academic_certificate_issuance
```

证据标签：

```text
traditionalDocumentContinuity = strong
modernCredentialContinuity = cross_source_compatible
automationStatus = provisional_modern_mapping
```

匹配：

```text
event = study_exam
studyDuty = academic_certificate_issuance
currentTargetAspect = academic_certificate_document
```

用户 current target 必须是：

```text
formal certificate existence / issuance / generation
```

而不是“能不能毕业”。

---

# 2. Observation Plan

```text
Primary
→ 父母
→ academic_certificate_document
→ required

Role
→ PRR-STUDY-SUBJECT
→ certificate_recipient
→ required
```

首轮 Subject Resolver 继续沿用：

```text
self  → 世
child → 子孙
other → unresolved
```

---

# 3. Issuing Institution

学校 / 学位授予机构不默认进入 Base Rule。

如果问句明确把机构行为作为辅助上下文：

```text
学校什么时候给我签发毕业证？
```

可以保存：

```text
educationInstitution
→ issuer_context
```

但当前：

```text
issuer_context traditional selector
→ unresolved / optional
```

不得因为 institution entity 就固定：

```text
父母
或
应
```

Institution Resolver 仍由 `PRR-EDUCATION-INSTITUTION` 管理。

---

# 4. 为什么不默认加入官鬼

证书签发的 current target 是：

```text
document existence / formal issuance
```

不是：

```text
职业职位
排名
诉讼程序
```

《黄金策·求名》的官父双轴说明“文章/文书”和“功名/名位”可以是不同职责，不能反过来推导：

```text
任何证书签发都必须官鬼
```

所以首轮：

```text
官鬼 = not required by default
```

如果用户真正问：

```text
学校最终是否正式授予我学位？
```

应进入：

```text
degree_conferral_outcome
```

该 duty 目前仍未完成研究，不能偷塞进 certificate issuance。

---

# 5. Hard Boundaries

```text
毕业证 / 学位证能不能正式办下来
→ academic_certificate_issuance

毕业证 / 学位证是否已经生成
→ academic_certificate_issuance

能不能毕业
→ graduation_qualification

学校会不会正式授予学位
→ degree_conferral_outcome / research required

毕业证什么时候寄到
→ receive_item

毕业证已经寄出，能否收到
→ receive_item

毕业证丢了能不能找回
→ lost_property

补办丢失毕业证的申请会不会批准
→ separate document/administrative approval duty, not this rule
```

---

# 6. Assessment Evidence Boundary

未来只允许形成：

```text
certificate_document_state
recipient_relation_state
issuance_process_evidence
optional issuer_context_evidence
```

禁止直接在 Observation Rule 层输出：

```text
will_issue = true / false
issue_date = specific date
```

时间只消费现有 Time / Fact，不重算。

---

# 7. Current Status

```text
academicCertificateIssuanceResearch = complete
academicCertificateIssuanceRuleReview = complete_provisional
ruleRef = TR-SE-003-A
formalIntentIntegration = blocked
formalRuleRegistryIntegration = blocked
semanticTrainingEligible = false
currentRoute = false
```

原因：当前 v0.13 `nextTopicBoundary.status = design_only`。