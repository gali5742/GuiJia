# 龟甲 · 六爻事业职位 Rule Review v0.1

日期：2026-09-01

状态：`rule_review_complete`

输入：

- `docs/liuyao-literature/career-position-research-v1.0.md`
- `docs/liuyao-literature/career-position-rule-candidates-v0.1.md`
- `js/liuyao-rule-registry.js`
- `js/liuyao-observation-plan.js`
- 《龟甲 · 六爻复合观察与取用规则规范 v0.2（草案）》

> 本文件完成 Candidate 的职责审计与 Observation Rule 设计，不直接修改正式 Rule Registry，不晋升 Semantic Route。

---

# 1. Review 总结

15 条 Candidate **不能变成 15 条 Observation Rule**。

Rule Registry 的职责仍然只是：

```text
Resolved Intent
→ 选择要观察的现实对象 / 角色 / 领域对象
→ Observation Plan
```

不负责：

- 旺衰；
- 空破；
- 动变；
- 官世生克合冲；
- 父母文书状态的成败判断；
- 最终录用 / 升迁 / 保职 Assessment。

因此本主题最终拆成：

```text
4 个首轮 Base Observation Rules
+
若干条件 Context / Domain Augmentations
+
独立 Career Assessment Evidence 层
```

而不是：

```text
事业
→ 官鬼
→ 一个规则覆盖所有职场问题
```

---

# 2. Candidate 最终去向

| Candidate | Review 去向 |
|---|---|
| RC-CP-001 职位 / 工作官鬼主轴 | Base Observation Rules shared core |
| RC-CP-002 世为本人 | Base Observation Rules shared role |
| RC-CP-003 正式任命 / 文书父母 | conditional augmentation；formalization-primary 暂缓专项 |
| RC-CP-004 公司 / 单位父母 | modern Domain augmentation |
| RC-CP-005 特指外部目标应爻 | contextual role augmentation |
| RC-CP-006 求职 / 录用 | Base Rule A |
| RC-CP-007 升迁 | Base Rule B |
| RC-CP-008 保职 / 裁员 | Base Rule C |
| RC-CP-009 跳槽结果 | Base Rule D |
| RC-CP-010 工资 / 禄俸 | route boundary；不进 career base rule |
| RC-CP-011 竞争兄弟 | conditional Evidence / augmentation |
| RC-CP-012 官世正向关系 | Career Assessment Evidence |
| RC-CP-013 官 / 世阻碍状态 | Career Assessment Evidence |
| RC-CP-014 父母 formalization 状态 | Formalization Assessment Evidence |
| RC-CP-015 current / proposed alternatives 分离 | Intent / Resolver architecture contract |

---

# 3. 为什么需要四个 Base Rule，而不是一个 Base Rule

四个职责虽然都共享：

```text
Primary → 官鬼
Role → 世
```

但其现实语义不同：

```text
job_application_outcome
→ 尚未取得的目标职位 / employment acquisition

position_advancement
→ 当前任职体系中的目标晋升职位

employment_retention
→ 当前已经持有的职位能否继续保有

employment_transition_outcome
→ 目标新工作 / prospective employment acquisition
```

如果只登记：

```text
TR-CAREER → 官鬼 + 世
```

下游会失去“官鬼这一观察对象到底承担什么现实职责”的信息，无法可靠生成 Domain Assessment。

因此建议保留一个 family，但使用四个 Base Rule。

---

# 4. Base Rule A · Job Application Outcome

设计 ID：

```text
TR-CP-001-A
```

未来匹配：

```text
event.type = career_position
careerDuty = job_application_outcome
currentTargetAspect = position_or_employment
```

Observation：

```text
Primary
→ 官鬼
→ target_employment_or_position
→ required

Role
→ 世
→ applicant_self
→ required
```

不常驻：

```text
父母
应
兄弟
```

它们只能按上下文 augmentation。

### 为什么“面试”不决定 selector

`interview / selection / offer / onboarding` 只是 application stage。

真正决定 Base Rule 的是：

```text
current target = 能否取得工作 / 职位
```

而不是出现“面试”两个字。

---

# 5. Base Rule B · Position Advancement

设计 ID：

```text
TR-CP-001-B
```

未来匹配：

```text
event.type = career_position
careerDuty = position_advancement
```

Observation：

```text
Primary
→ 官鬼
→ target_advanced_position
→ required

Role
→ 世
→ incumbent_self
→ required
```

父母只在明确存在：

```text
appointment / authorization / formal process
```

时追加。

### 明确排除

```text
试用期转正
```

当前不能因为现代语言看起来像“职位变好”就复用本规则。

---

# 6. Base Rule C · Employment Retention

设计 ID：

```text
TR-CP-001-C
```

未来匹配：

```text
event.type = career_position
careerDuty = employment_retention
```

Observation：

```text
Primary
→ 官鬼
→ current_position
→ required

Role
→ 世
→ incumbent_self
→ required
```

对应现实职责：

```text
职位能否保住
裁员是否波及本人
是否被替代 / 失位
```

父母可按单位 / 正式任职关系上下文追加，但不能替代当前职位官鬼。

---

# 7. Base Rule D · Employment Transition Outcome

设计 ID：

```text
TR-CP-001-D
```

未来匹配：

```text
event.type = career_position
careerDuty = employment_transition_outcome
```

Observation：

```text
Primary
→ 官鬼
→ prospective_employment
→ required

Role
→ 世
→ transitioning_self
→ required
```

### 关键限制

本规则只回答：

```text
新工作 / 新职位能否取得
```

不回答：

```text
旧工作和新工作哪个更好
该不该辞职
```

因此不需要在 Base Rule 中为 old employment 强行找一爻。

并明确：

```text
世 != old employment
应 != new employment
```

作为固定公式。

若具体问题要求比较两个 employment alternative，则进入 deferred `employment_transition_comparison`，不能让本规则越权。

---

# 8. Context / Domain Augmentation 设计

## 8.1 Employer / Organization

设计候选：

```text
AR-CP-001-EMPLOYER
```

触发条件：

```text
explicit_employer_context = true
```

Observation：

```text
父母
→ employer_organization
→ source = domain
→ required = false
```

它来自现代跨来源兼容映射。

禁止：

```text
父母 = 古典固定“公司爻”
```

---

## 8.2 Formalization / Authorization

设计候选：

```text
AR-CP-002-FORMALIZATION
```

触发条件：

```text
formalization_context = true
```

例如：

```text
书面 offer
合同
任命
正式手续
签约
```

Observation：

```text
父母
→ formal_authorization_or_document
→ source = domain
→ required = false
```

如果 employer 与 formalization 同时存在，允许同一个父母目标承担两个 semantic duties；不得因此制造两个不同“父母爻”。

当前 ObservationPlan 已允许多个 Subject 指向同一 target 并形成 `same_target` relation；正式实现时可沿用，或未来支持单 Target 多 Duty 表达。

---

## 8.3 Specified External Target

设计候选：

```text
AR-CP-003-SPECIFIED-TARGET
```

触发条件：

```text
specified_external_target = true
```

Observation：

```text
应
→ specified_external_employment_target
→ source = role / context
→ required = false
```

它不是 employer object type。

因此允许：

```text
父母 → employer organization
应   → specified external target
```

在同一问题中同时存在而不冲突。

---

## 8.4 Competitive Selection

设计候选：

```text
AR-CP-004-COMPETITION
```

只在 Semantic / Context 明确：

```text
competitive_selection = true
```

时允许观察：

```text
兄弟
→ competition_pressure
→ source = domain
→ required = false
```

禁止在所有面试 / 晋升问题里默认添加兄弟。

---

# 9. Formalization 成为 current target 时的处理

研究支持：

```text
任命 / 文书 / offer / contract 本身成为 current target
→ 父母有升级为 Primary 的可能
```

但首轮不立即登记第五个 Base Rule。

原因不是文献完全不足，而是当前 Intent Schema 尚未证明可以稳定区分：

```text
“最终能不能录用”
vs
“书面 offer 是否会发”
vs
“合同是否能签下来”
```

因此先设计：

```text
currentTargetAspect
= position_or_employment
| formalization_document
```

待 Schema 能稳定提供该字段后，再审查：

```text
TR-CP-001-E · Employment Formalization Outcome
Primary → 父母
Domain  → 官鬼
```

当前状态：`deferred_until_schema_validation`。

---

# 10. Career Assessment Evidence 不进入 Rule Registry

以下 Candidate 禁止写入 `OBSERVATION_RULES`：

```text
RC-CP-012
RC-CP-013
RC-CP-014
```

未来应进入独立：

```text
Career Assessment Evidence
```

输入：

```text
ObservationPlan
+
现有 Line / Derived Facts
+
现有 Time / Status Facts
```

可能输出：

```text
position_vitality
position_to_self_relation
self_capacity_state
formalization_state
competition_pressure
```

例如：

```text
官鬼旺 / 生合世
→ positive career evidence

官鬼空破 / 受制
→ negative career evidence
```

但都不得单项直接生成：

```text
accepted = true / false
promoted = true / false
retained = true / false
```

---

# 11. Compensation 不属于 career Observation Plan

妻财代表禄俸 / 工资的传统语义保留，但现代 current target 必须分流：

```text
工资金额 / 发放
→ income_salary

奖金 / 绩效
→ income_bonus
```

因此首轮四个 career Base Rules 不默认加入妻财。

这防止：

```text
“我能不能升职加薪”
```

被错误压成一个单一 career outcome。

该句未来必须识别为：

```text
position advancement
+
compensation change
```

若用户没有指定主目标，应按 multi-target policy 处理，而不是偷偷只看官鬼。

---

# 12. Deferred Duties

继续不登记：

```text
career.employment_status_confirmation
career.employment_transition_comparison
career.resignation_suitability
```

## 转正

当前没有足够多源支持证明：

```text
probation regularization = classical advancement
```

## 新旧工作比较

文献允许比较，但 alternative-to-line mapping 不统一。

未来需要：

```text
Alternative Employment Resolver
```

并允许 `unresolved`。

## 辞职适宜性

与 transition outcome 不同，现代来源显示妻财 / 生计承受会进入核心职责。

在价值判断与财务承受未完成研究前不得注册。

---

# 13. Source Registry Gap

这是进入正式 Rule Registry 前的额外工程 Gate。

当前 `js/liuyao-rule-registry.js` 的正式 `SOURCES` 已登记：

```text
增删卜易
卜筮正宗
王虎应资料
朱辰彬资料
```

但本轮事业职位研究的重要传统 provenance 还包括：

```text
断易天机
卜筮全书
黄金策
易隐
```

这些目前没有对应正式 Source ID。

因此未来注册 `EV-CP-*` 前必须：

1. 为实际采用的来源新增 `SRC-*`；
2. 保留《黄金策》—《卜筮全书》—《卜筮正宗》的同源性说明；
3. evidence tier 不得因三个转录 / 注本书名就错误标成“三个独立古典来源”；
4. 只把研究中已经核验的具体命题登记进 Evidence Registry。

禁止只在 Rule 文本写“传统多源”，却不给 source provenance。

---

# 14. 首轮 Observation Rule 设计结果

```text
TR-CP-001-A  job_application_outcome
TR-CP-001-B  position_advancement
TR-CP-001-C  employment_retention
TR-CP-001-D  employment_transition_outcome
```

共享核心：

```text
Primary → 官鬼
Role    → 世
```

但 semantic duty 分别为：

```text
target_employment_or_position
target_advanced_position
current_position
prospective_employment
```

条件 augmentations：

```text
AR-CP-001-EMPLOYER         → 父母
AR-CP-002-FORMALIZATION    → 父母
AR-CP-003-SPECIFIED-TARGET → 应
AR-CP-004-COMPETITION      → 兄弟
```

---

# 15. Rule Review 结论

当前已经达到：

```text
literatureResearch = completed_and_reviewed
ruleCandidateReview = complete
observationRuleDesign = approved_in_principle
```

仍未达到：

```text
formalRuleRegistryImplementation = false
semanticTrainingReady = false
currentRoute = false
```

正式实现前剩余前置：

1. Career Intent / Event Schema 定义并冻结；
2. 当前 target 与 context augmentation 触发字段必须可表达；
3. Source Registry 补齐正式 provenance；
4. current-22 next-topic gate 开放；
5. study_exam 完成后反向复核就业考试碰撞。
