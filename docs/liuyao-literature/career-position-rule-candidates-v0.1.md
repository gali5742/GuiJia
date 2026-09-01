# 龟甲 · 六爻事业职位 Rule Candidate Review Set v0.1

日期：2026-09-01

状态：`ready_for_rule_review`

来源研究：`docs/liuyao-literature/career-position-research-v1.0.md`

> 本文件只列可审查的 Rule Candidate，不是正式 Rule Registry 实现，不修改当前 22-route Semantic Candidate。

---

# 1. Candidate 设计原则

`career_position` 已完成文献研究，但研究本身已经证明：

```text
事业职位 ≠ 单一“官鬼规则”
```

必须至少区分：

```text
position / employment
querent self
employer / organization
formal authorization / document
compensation
current vs prospective employment
```

因此本文件只把来源支持的职责列为 Candidate；不把现代关键词直接等同传统六亲。

---

## RC-CP-001 · Position / employment primary observation

```text
theme: career_position
proposition: 求职、职位取得、升迁、职位保留等以工作 / 职位本体为 current target 时，官鬼作为核心 Primary Observation
support: stable_consensus
```

适用基础：

- `job_application_outcome`
- `position_advancement`
- `employment_retention`
- 保守定义的 `employment_transition_outcome`

禁止扩张：

```text
出现“公司 / 工作”字样就自动官鬼 Primary
工资 / 奖金问题自动官鬼
考试本体自动官鬼
```

---

## RC-CP-002 · Querent self role observation

```text
proposition: 自占职位 / 工作结果时，世作为求职者、任职者本人 Role Observation
support: stable_consensus
```

用途：

- 保存 `position ↔ self` 关系；
- 供后续生、合、克、持世等 Evidence 使用。

不得把世直接解释为“旧工作”。

---

## RC-CP-003 · Formal authorization / employment document observation

```text
proposition: 父母可承担任命、宣敕、印绶、offer / 合同 / 正式手续等 formalization / document 职责
support: stable_consensus + modern_mapping
```

默认职责：

```text
Domain Observation
→ formal_authorization_or_document
```

若用户 current target 真正是：

```text
书面 offer 会不会发
合同能不能签下来
任命文件能不能下来
```

则父母可成为 Primary Candidate，但该目标需要在 Intent Schema 中明确，不能仅凭“offer / 合同”关键词覆盖职位结果。

---

## RC-CP-004 · Employer / organization domain observation

```text
proposition: 现代工作语境中，公司 / 单位可由父母承担 organization / employer Domain Observation
support: cross_source_compatible
```

这是现代 Domain mapping，不声明“古典父母永远等于公司”。

禁止：

```text
company mentioned
→ 父母自动成为 Primary
```

---

## RC-CP-005 · Specified external target contextual role

```text
proposition: 当问题明确指定某个外部单位 / 目标工作环境时，应爻可作为 specified external target 的 Context Role
support: cross_source_compatible / school_specific_detail
```

职责：

```text
应 = contextual external target
```

而不是：

```text
应 = 公司这个 object type
```

因此父母与应可以同时存在，但职责不同。

---

## RC-CP-006 · Job application outcome responsibility

```text
proposition: 面试、应聘、录用、入职等问题若 current target 是“能否取得该职位 / 工作”，以官鬼为 Primary、世为 Role；父母与应仅按明确上下文追加
support: cross_source_compatible_to_stable
```

适用：

```text
这次面试最后能不能被录用？
这个岗位我能拿到吗？
能不能顺利入职？
```

`application_stage` 只作为现代语义上下文，不直接决定六亲。

---

## RC-CP-007 · Position advancement responsibility

```text
proposition: 升职 / 晋升结果以目标职位 / 官鬼为 Primary，世为任职本人；父母可承担任命手续 Domain
support: stable_consensus
```

不包含未经研究证明的“试用期转正”。

---

## RC-CP-008 · Employment retention responsibility

```text
proposition: 裁员是否波及本人、职位能否保住等 employment retention 问题，以当前职位 / 官鬼与世的关系为主轴
support: stable_consensus at theme level
```

传统连续性：

```text
得替
现任官任期
失位 / 剥官
```

父母可作为单位 / 正式任职关系 Domain 信息。

---

## RC-CP-009 · Employment transition outcome responsibility

```text
proposition: “能否成功跳槽 / 能否拿到新工作”若 current target 是 prospective employment outcome，以 prospective employment 的官鬼主轴 + 世为最小观察结构
support: cross_source_compatible
```

必要约束：

```text
no_fixed_old_new_line_mapping = true
```

禁止：

```text
世 = old employment
应 = new employment
```

作为跨流派固定公式。

若 future resolver 无法可靠区分 current / proposed employment，应允许 `unresolved`。

---

## RC-CP-010 · Compensation auxiliary / route boundary

```text
proposition: 妻财可表示禄俸 / 工资，但 compensation 与 position outcome 是不同现实职责
support: stable_consensus
```

用途：

- 在古典 Evidence 中保留工资 / 禄俸语义；
- 在现代 Semantic 层维持 route collision boundary。

默认不得因为工作问题同时观察妻财。

若 current target 是：

```text
工资多少 / 能否发放
奖金多少 / 是否到账
```

应继续进入现有 `income_salary` / `income_bonus`，而不是 career_position。

---

## RC-CP-011 · Competitive-selection auxiliary evidence

```text
proposition: 兄弟在求名 / 竞聘等特定结构中可形成 competition pressure Evidence
support: cross_source_compatible
```

只允许在：

```text
competitive_selection = explicit_or_supported
```

时进入条件 Evidence / augmentation。

禁止：

```text
兄弟发动 = 一定有竞争者
```

---

## RC-CP-012 · Position-to-self positive relation evidence

```text
proposition: 官鬼生世、合世、旺官持世等可形成职位取得 / 升迁 / 保任的正向 Evidence
support: stable_consensus
```

这是 Assessment Evidence，不是 selector。

禁止：

```text
官生世 = 一定录用
官旺 = 一定升职
```

---

## RC-CP-013 · Position weakness / obstruction evidence

```text
proposition: 官鬼空破、衰弱、受制，以及世空 / 世受制等可形成负向或阻碍 Evidence
support: cross_source_compatible_to_stable
```

必须读取已有 Fact / Time Fact，不在 career rule 内另算空破旺衰。

不得单项直接生成最终失败结论。

---

## RC-CP-014 · Formalization evidence

```text
proposition: 当父母承担任命 / offer / 合同 / 正式手续职责时，其出现、旺衰、空破等可形成 formalization Evidence
support: stable_consensus + modern_mapping
```

它回答的是：

```text
formal process / authorization / document state
```

而不是自动替代职位本体的官鬼 Assessment。

---

## RC-CP-015 · Current vs proposed employment must remain distinct alternatives

```text
proposition: 涉及跳槽 / 新旧工作时，current employment 与 proposed employment 必须在 Semantic / Resolver 层保持为两个现实对象，不得压成一个 generic career target
support: cross_source_compatible
```

这是一条 architecture contract。

它并不声明两个对象分别固定对应哪一爻。

---

# 2. Explicit Non-Candidates

以下在研究完成后仍明确不得进入正式规则：

```text
转正 = 升迁
试用期转正 → 固定官鬼 Rule
世 = 旧工作 / 应 = 新工作 作为固定通则
应 = 公司 / 单位 object type
父母 = 公司作为无条件古典通则
出现“公司”就父母 Primary
出现“面试”就父母 Primary
兄弟动 = 一定有竞争者
子孙动 = 一定失业 / 一定升迁失败
官鬼旺 = 一定录用 / 升职
父母空 = 一定没有 offer
应生世 = 一定应该跳槽
“该不该辞职” = “能不能跳槽成功”
工资 / 奖金 = career_position outcome
宽泛“事业怎么样”直接成为训练 route
```

---

# 3. Deferred Duties

以下不进入首轮 Rule Review：

```text
career.employment_status_confirmation
career.employment_transition_comparison
career.resignation_suitability
```

原因分别为：

- 转正缺少足够直接传统 / 现代多源映射证据；
- 新旧工作比较存在不同 alternative mapping 方法，需要 resolver 设计而不是静态 selector；
- 辞职适宜性混入生计承受 / 妻财等价值判断，职责不同于 transition outcome。

---

# 4. Review Gate

进入 Rule Review 时必须确认：

1. Rule Registry 只承载 Observation selection，不承载旺衰 / 空破 / 成败 Assessment；
2. `job_application_outcome`、`position_advancement`、`employment_retention`、`employment_transition_outcome` 的 current target 已区分；
3. 父母的 `employer` 与 `formalization` 职责不可混成一个模糊“公司爻”；
4. 应只作为 contextual role，不得作为 employer object typing；
5. transition outcome 不得硬编码 old/new = 世/应；
6. salary / bonus 继续由 current-22 financial routes 负责；
7. study_exam 后续完成后必须反向审查公务员考试等双目标边界；
8. 当前 22-route baseline 不变。

当前：

```text
ruleCandidateReviewReady = true
formalRuleRegistryReady = false
semanticTrainingReady = false
```
