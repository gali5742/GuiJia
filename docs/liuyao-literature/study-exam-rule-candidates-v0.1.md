# 龟甲 · 六爻考试学业 Rule Candidate Review Set v0.1

日期：2026-09-01

状态：`ready_for_rule_review`

来源研究：`docs/liuyao-literature/study-exam-research-v1.0.md`

> 本文件只列可审查 Candidate，不是正式 Rule Registry 实现。

---

## RC-SE-001 · Exam performance / score

```text
proposition: 当 current target 是考试成绩 / 分数 / 作答表现时，父母为 Primary Observation
support: cross_source_compatible_to_stable
```

前提：

- 具体或上下文有界考试；
- current target 是 score / performance；
- 不是最终职位取得。

---

## RC-SE-002 · Exam rank / competitive standing

```text
proposition: 当 current target 是名次、排名、选拔位次时，官鬼为 Primary candidate；父母保留考试表现 Domain
support: cross_source_compatible
```

禁止把官鬼泛化成“所有考试唯一用神”。

---

## RC-SE-003 · Qualification exam outcome

```text
proposition: 只为取得资格 / 水平认证的考试，通过结果以父母为 Primary 主轴
support: cross_source_compatible
```

现代直接支持包括注册会计师、六级等案例。

条件：若同时存在明确排名 / 竞争 / 职称名位职责，可追加官鬼 Domain。

---

## RC-SE-004 · Generic pass/fail requires exam-purpose resolution

```text
proposition: “这次考试能不能过”若无法识别资格、排名、录取、职位终考等现实目的，不得静态选择父母或官鬼
support: cross_source_conflict
```

输出应允许：

```text
semantic_resolved
traditional_exam_purpose = unresolved
```

---

## RC-SE-005 · Self examinee role

```text
proposition: 自占考试 / 学业时，世承担 actual examinee / learner Role
support: stable_consensus
```

---

## RC-SE-006 · Represented examinee role

```text
proposition: 代占考试时，应按被测人与问卦人的真实关系增加 actual examinee Role；不能继续把世当考生
support: stable_consensus
```

第一阶段可稳定支持：

```text
self  → 世
child → 子孙
```

其余关系待 resolver 表审查。

---

## RC-SE-007 · Academic progress

```text
proposition: 有明确学期 / 课程 / 阶段边界的持续学业进展，以父母为 Primary、实际学习者为 Role
support: stable_consensus_to_cross_source_compatible
```

禁止直接覆盖无限期“我的一生学业怎样”。

---

## RC-SE-008 · Education admission is multi-duty

```text
proposition: 指定学校录取问题可能同时涉及父母的成绩 / 文书职责、官鬼的选拔职责与指定教育机构 contextual role
support: cross_source_compatible
```

因此不得压成单一静态 selector。

---

## RC-SE-009 · Education institution requires resolver

```text
proposition: school / university / target program 不能固定映射父母或应，需 contextual resolver
support: conflicted / role_sensitive
```

允许未来：

```text
PRR-EDUCATION-INSTITUTION
→ resolved / conflicted / unresolved
```

---

## RC-SE-010 · Competition observation

```text
proposition: 明确竞争性考试 / 选拔中，兄弟可作为 competition pressure 辅助观察 / Evidence
support: cross_source_compatible
```

禁止：

```text
兄弟动 = 一定落榜
```

---

## RC-SE-011 · Parent / ghost vitality evidence

```text
proposition: 父母、官鬼的旺衰、空破、生扶等只形成与各自职责对应的 Assessment Evidence
support: stable_consensus
```

不得单项直接产生最终通过 / 落榜结论。

---

## RC-SE-012 · Cross-observation relations

```text
proposition: 父母 / 官鬼与实际考生之间的生合、冲克等关系可形成 exam / study Evidence
support: cross_source_compatible
```

必须读取既有 Fact，不在主题模块重算基础状态。

---

## RC-SE-013 · Career-position boundary

```text
proposition: 招聘 / 公务员等考试如果 current target 是某一考试阶段通过，属于 study_exam；如果 current target 已是最终职位取得，属于 career_position
support: cross_source_compatible + modern semantic boundary
```

---

## RC-SE-014 · Scholarship current-target boundary

```text
proposition: 奖学金问题若 current target 是金钱取得，不因考试背景进入 study_exam
support: modern direct target-priority evidence
```

---

## RC-SE-015 · Academic document deferred

```text
proposition: 论文 / 答辩 / 毕业文书虽与父母高度相关，但本轮直接跨来源现代证据不足以形成统一 Base Rule
support: insufficient_direct_evidence
```

不得正式登记。

---

## RC-SE-016 · Education choice deferred

```text
proposition: 多学校 / 多项目比较需要 alternatives resolver；不得使用固定世应或父母 A/B 映射
support: insufficient_for_static_rule
```

---

# Explicit Non-Candidates

```text
考试 → 固定父母
考试 → 固定官鬼
学校 → 固定父母
学校 → 固定应
子孙动 → 一定落榜
兄弟动 → 一定有竞争者淘汰我
父母空 → 一定没有录取通知
公务员考试 → 无条件 career_position
公务员考试 → 无条件 study_exam
论文 → 直接复用 exam rule
奖学金 → study_exam
```

---

# Review Gate

进入正式 Observation Rule 设计前必须：

1. 保留 exam current-target / purpose；
2. 允许 generic pass/fail unresolved；
3. actual examinee 与问卦人分离；
4. `school` 不做静态六亲映射；
5. career_position collision 以 current target 决定；
6. scholarship / tuition 等财务 current target 分流；
7. Assessment 不写入 Rule Registry。

当前：

```text
ruleCandidateReviewReady = true
formalRuleRegistryReady = false
semanticTrainingReady = false
```