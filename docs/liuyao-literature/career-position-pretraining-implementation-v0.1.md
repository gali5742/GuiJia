# 龟甲 · 六爻事业职位 Pretraining Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented`

主题：`career_position`

依赖设计：

- `career-position-research-v1.0.md`
- `career-position-rule-candidates-v0.1.md`
- `career-position-rule-review-v0.1.md`
- `career-position-intent-schema-design-v0.2.md`

实现：

- `js/liuyao-career-position-pretraining-v01.js`
- `tests/liuyao-career-position-pretraining-v01-tests.js`

> 本实现不可达，不接入 `liuyao-intent.js`、Rule Registry、Observation Planner、Router、训练 / 校准 / blind 数据。

---

# 1. 当前 gate

当前 Semantic v0.13 的 next-topic boundary 仍规定：

```text
status = design_only
mayEnterV03Training = false
mayBecomeCurrentRoutes = false
```

所以本实现的目标不是提前上线事业职位，而是把研究和 Schema 变成可执行 Contract，减少未来正式扩展时的实现不确定性。

模块显式：

```text
status = design_only_unreachable
currentRuntimeReachable = false
```

---

# 2. 已实现职责

## 2.1 Supported duties

```text
job_application_outcome
position_advancement
employment_retention
employment_transition_outcome
```

## 2.2 Deferred duties

```text
employment_status_confirmation
employment_transition_comparison
resignation_suitability
```

它们返回 `deferred`，不会偷偷重映射到已支持 duty。

## 2.3 Intent Contract validation

校验：

- `event.type = career_position`；
- 当前只支持 self career subject；
- generic goal 必须为 `outcome`；
- `careerDuty` 必须属于首轮 supported duty；
- `currentTargetAspect = position_or_employment`；
- target 必须 `specific` 或 `context_bounded`；
- retention 必须有 self current-position target 与 retention threat；
- transition outcome 必须有 prospective employment target；
- compensation target 阻断；
- formalization-document Primary 暂缓。

---

# 3. Draft Observation Plan

四个 Base Rule 设计引用：

```text
TR-CP-001-A  job_application_outcome
TR-CP-001-B  position_advancement
TR-CP-001-C  employment_retention
TR-CP-001-D  employment_transition_outcome
```

共享 selector core：

```text
Primary → 官鬼
Role    → 世
```

但 semantic duties 不同：

```text
target_employment_or_position / applicant_self
target_advanced_position / incumbent_self
current_position / incumbent_self
prospective_employment / transitioning_self
```

这证明没有必要把事业压成一个无职责信息的 `career → 官鬼`。

---

# 4. Conditional Augmentation

已实现设计级 augmentation：

```text
AR-CP-001-EMPLOYER
→ 父母 / employer_organization

AR-CP-002-FORMALIZATION
→ 父母 / formal_authorization_or_document

AR-CP-003-SPECIFIED-TARGET
→ 应 / specified_external_employment_target

AR-CP-004-COMPETITION
→ 兄弟 / competition_pressure
```

重要约束：

- employer 只有 specific / context-bounded 时触发；
- `applicationStage=contract` 本身不会触发父母；
- formalization 只读取 Schema v0.2 的 `formalizationContext`；
- employment alternatives 本身不会自动触发应；
- competition 只有 explicit / context-supported 才触发。

因此代码没有：

```text
世 = old employment
应 = new employment
```

的固定映射。

---

# 5. Traditional / Semantic Layer Isolation

模块提供：

```text
findTraditionalSemanticLeaks(intent)
```

用于检查 Semantic Intent 是否泄漏：

```text
官鬼
父母
妻财
兄弟
子孙
世爻
应爻
用神
sixRelative
useGod
```

Semantic Contract snapshot 只保留现代字段，例如：

```text
careerDuty
currentTargetAspect
applicationStage
formalizationContext
competitiveSelection
retentionThreat
careerTarget kind / specificity
employer specificity
current / prospective employment alternative existence
```

---

# 6. 专项测试

本模块为自包含设计模块，因此在提交前使用本地 Node 环境执行：

```bash
node --check js/liuyao-career-position-pretraining-v01.js
node --check tests/liuyao-career-position-pretraining-v01-tests.js
node tests/liuyao-career-position-pretraining-v01-tests.js
```

同内容本地临时路径执行结果：

```text
Career position pretraining regression: 20 passed, 0 failed
```

覆盖：

1. design-only / unreachable；
2. 求职 Sufficiency；
3. 求职默认仅官鬼 + 世；
4. 指定 employer 追加父母 + 应；
5. application stage 不得自动触发 formalization；
6. explicit formalization 只追加父母 Domain，不替换官鬼 Primary；
7. 升迁独立 semantic duty；
8. retention threat / current-position Gate；
9. 公司整体裁员不等于 self retention；
10. transition prospective target Gate；
11. alternatives 不得制造世旧应新；
12. comparison deferred；
13. resignation deferred；
14. probation regularization deferred；
15. generic career state insufficient；
16. compensation cross-route boundary；
17. represented subject unsupported；
18. competition 条件 augmentation；
19. formalization-document Primary deferred；
20. Semantic Intent 无传统 selector 泄漏。

注意：这只是 isolated module 专项测试，不等于：

```text
current Router regression passed
formal Intent integration passed
Rule Registry integration passed
CI passed
```

因为这些正式接线当前按 gate 明确没有发生。

---

# 7. 正式接线前仍有的外部前置

## 7.1 Semantic baseline gate

当前 next-topic 仍不能进入 current v0.13 training / route inventory。

## 7.2 Source Registry provenance

正式 `EV-CP-*` 注册前，需要把实际采用的事业传统来源补入正式 `SOURCES`，并保留同源性说明。

## 7.3 study_exam 反向 collision review

事业研究已经发现：

```text
求职面试
考试 / 笔试
公务员 / 教师编“上岸”
升学面试
```

会形成重要碰撞边界。

因此 `study_exam` 完成后必须回头复核 career Schema / training negatives。

---

# 8. 当前成熟度

```text
literatureResearch              = completed_and_reviewed
ruleCandidateReview             = complete
ruleReview                      = complete
intentSchemaDesign              = ready_v0.2
isolatedContractImplementation  = complete
isolatedRegression              = 20/20_passed

formalIntentImplementation      = blocked
formalRuleRegistryImplementation= blocked
semanticTrainingReady           = false
currentRoute                    = false
```

事业职位主题自身在当前 gate 允许范围内已经推进到 pretraining implementation 阶段的末端。
