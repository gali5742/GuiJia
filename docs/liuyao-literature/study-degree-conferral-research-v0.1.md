# 龟甲 · 六爻学位授予 Degree Conferral 专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_deferred`

主题：

```text
study_exam.degree_conferral_outcome
```

> 本专项专门区分“学位资格被正式授予”和“学位证书被签发”。研究完成不等于规则可 promotion。

---

# 1. 核心问题

现代问法：

```text
学校最终会不会授予我硕士学位？
所有要求都完成了，学位委员会会不会通过授位？
年底能不能正式获得博士学位？
```

这些问题 current target 是：

```text
formal academic status / qualification conferral
```

不是：

```text
certificate physical document
```

所以必须与：

```text
academic_certificate_issuance
```

分开。

---

# 2. 为什么“证书 = 父母”不能直接解决授位

传统稳定：

```text
父母 → 文书 / 证件 / 师长 / 文章
```

因此：

```text
学位证书这个 object
→ 父母 continuous
```

但：

```text
学校是否正式授予学位资格
```

是 institutional authorization / status change，不是 document existence 本身。

所以禁止：

```text
学位证 = 父母
∴ 学位授予 = 父母单 Primary
```

---

# 3. 《黄金策·求名》的可用与不可用部分

《黄金策·求名》《卜筮全书》稳定区分：

```text
父母 → 文章
官鬼 → 功名 / 官职
世 → 求名本人
```

这说明：

```text
作品 / 文书
≠
正式名位结果
```

这个结构对现代学位授予有启发价值。

但古典“功名”高度绑定：

```text
科举
官职
仕途名位
```

不能直接推出：

```text
modern academic degree = 官鬼
```

证据只能分类为：

```text
structural_analogy_only
```

不能升级 universal selector。

---

# 4. 现代资料审计

公开现代资料存在：

```text
能否获得博士学位
→ 直接取父母
```

以及大量：

```text
学历 / 文凭 / 学位证
→ 父母
```

的现代沿用。

但这些资料普遍没有清楚区分：

```text
degree conferral
vs
certificate issuance
vs
graduation qualification
```

所以不能视为对 `degree_conferral_outcome` 的直接多源支持。

证据分类：

```text
modern_mapping_support = mixed_and_semantically_conflated
```

---

# 5. 与 Graduation Qualification 的边界

```text
我学分、论文、答辩都能不能满足毕业要求？
→ graduation_qualification

所有实质要求已完成，学校最终是否正式授位？
→ degree_conferral_outcome

学位证能不能正式制作 / 签发？
→ academic_certificate_issuance
```

因此：

```text
graduation requirement satisfaction
≠ degree conferral
≠ certificate issuance
```

---

# 6. Candidate Observation Responsibilities

目前只允许记录候选职责，不注册 Base Rule：

```text
Role
→ actual degree candidate
→ required

Domain
→ completed academic requirements / qualification evidence
→ contextual

Institution Context
→ degree-granting institution / committee
→ required semantic object

Formal Conferral Primary
→ traditional selector unresolved
```

潜在 Resolver：

```text
PRR-DEGREE-CONFERRAL-AUTHORITY
```

但当前不应先假定：

```text
authority = 应
或
官鬼
或
父母
```

---

# 7. Rule Candidate Classification

## RC-SE-DEG-001

```text
degree conferral 必须与 certificate issuance 分离。
status = semantic_stable
```

## RC-SE-DEG-002

```text
父母对 certificate / credential object 有稳定连续性，但不足以证明 degree-conferral decision 的 universal Primary。
status = insufficient_evidence_for_primary
```

## RC-SE-DEG-003

```text
传统“功名 = 官鬼”只能提供 formal-status 与文书分层的结构类比，不能直接映射现代 academic degree。
status = structural_analogy_only
```

---

# 8. Final Status

```text
degree_conferral_outcome
→ semantic duty accepted
→ traditional primary unresolved
→ rule review not eligible
→ isolated implementation not justified yet
```

因此当前：

```text
status = completed_and_reviewed_deferred
```

正确结果不是继续寻找一个方便的单用神，而是保留：

```text
formal conferral authority resolver required
```

直到获得更强的现代直接、多源且语义不混淆的证据。

---

# 9. Hard Boundaries

```text
能不能毕业
→ graduation_qualification

学位委员会最终会不会授位
→ degree_conferral_outcome

学位证 / 毕业证能不能签发
→ academic_certificate_issuance

证书寄到没有
→ receive_item

证书丢了
→ lost_property
```

当前 v0.13 next-topic boundary 仍为 design-only，本专项不进入正式 Intent / Router / Rule Registry / training。