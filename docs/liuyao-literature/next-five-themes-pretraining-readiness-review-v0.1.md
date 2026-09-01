# 龟甲 · 六爻 Next Five Themes Pretraining Readiness Review v0.1

日期：2026-09-01

状态：`five_theme_topic_internal_pretraining_complete`

范围：

```text
career_position
study_exam
travel
litigation_dispute
lost_property
```

> 本文件总结五个 next-topic 在当前 `design_only` gate 下已经完成的主题内训练前工作。它不表示这些主题现在可以进入 v0.13 训练集，也不修改 current 22 routes。

---

# 1. 总结

五个主题均已完成：

```text
Deep Literature Research
↓
Rule Candidate Review
↓
Observation Rule Review
↓
Intent / Event Schema Design
↓
Isolated / Unreachable Pretraining Contract
```

当前共同状态：

```text
topicInternalResearch = complete
topicInternalRuleDesign = complete
topicInternalSchemaDesign = complete
isolatedImplementation = complete

formalIntentIntegration = blocked
formalRuleRegistryIntegration = blocked
semanticTrainingEligible = false
currentRoute = false
```

原因不是五个主题自身仍缺传统规则研究，而是当前 Semantic v0.13 `nextTopicBoundary` 仍明确禁止新主题进入训练与 current route。

---

# 2. 五主题状态矩阵

| Theme | Literature | Rule Review | Schema | Isolated implementation | Regression status |
|---|---|---|---|---|---|
| `lost_property` | completed_and_reviewed | complete | ready | complete | test harness prepared; formal integration not run |
| `career_position` | completed_and_reviewed | complete | ready v0.2 | complete | 20/20 isolated |
| `study_exam` | completed_and_reviewed | complete | ready v0.1 | complete | 24/24 isolated |
| `travel` | completed_and_reviewed | complete | ready v0.1 | complete | 24/24 isolated |
| `litigation_dispute` | completed_and_reviewed | complete | ready v0.1 | complete | 26/26 isolated |

这些测试只验证 isolated contract；不等于 current Router / formal Intent / Rule Registry / PR merge-ref CI 已通过。

---

# 3. 五主题最大的架构修正

## lost_property

不是：

```text
失物 → 妻财
```

而是：

```text
Modern Object
→ Traditional Object Resolver
→ resolved / conflicted / unresolved
```

Recovery 与 Location 共用 Object，但 Assessment 分责。

## career_position

不是：

```text
事业 → 官鬼
```

而是按：

```text
job_application_outcome
position_advancement
employment_retention
employment_transition_outcome
```

保留不同现实职责。

## study_exam

不是：

```text
考试 → 父母
```

而是区分：

```text
score / performance
rank / selection
qualification
academic progress
actual examinee
```

并允许 generic pass/fail traditional resolution abstain。

## travel

不是：

```text
travel → 世
```

而是：

```text
Traveler Resolver
+
Destination Context
+
Transport Context
```

并把 journey-focused disruption 与 transport-focused disruption 分开。

## litigation_dispute

不是：

```text
诉讼 → 官鬼
```

而是：

```text
官鬼 = proceeding / adjudication
世   = self party
应   = counterparty
父母 = case document / evidence
子孙 = settlement / dissipation support
```

并区分 litigation outcome、resolution、counterparty action。

---

# 4. Shared Blocker A · v0.13 Semantic Gate

当前 design 明确：

```text
nextTopicBoundary.status = design_only
mayEnterV03Training = false
mayBecomeCurrentRoutes = false
```

因此目前不能：

```text
把五主题加入 current route inventory
制作 / 注入 v0.13 Router training rows
修改 Routeability / Identity 以支持五主题
用新主题重新调 current-22 threshold
```

这是一条系统级 Gate，不是单主题 Gate。

---

# 5. Shared Blocker B · Formal Source Registry Provenance

五主题正式进入 `liuyao-rule-registry.js` 前，必须统一补全实际使用的传统来源 ID，并记录来源独立性。

当前研究实际使用的重要来源包括：

```text
火珠林
黄金策
卜筮全书
卜筮正宗
断易天机
易隐
增删卜易
```

以及现代：

```text
王虎应资料
朱辰彬《古筮真诠》
朱辰彬《古筮真诠·进阶篇》
```

尤其：

```text
黄金策
卜筮全书相关收录
卜筮正宗相关注解
```

必须保留同源 / 承接标记，不能按三个书名机械提高 source diversity tier。

建议正式 expansion 前先做一次：

```text
LiuYao Source Registry v0.2 provenance normalization
```

再注册五主题 `EV-*`。

---

# 6. Shared Blocker C · Global Five-theme Collision Matrix

单主题内部边界已经完成，但未来制作训练数据前还需要统一的全局 collision matrix。

至少覆盖：

```text
career_position ↔ study_exam
career_position ↔ litigation_dispute
study_exam ↔ career_position
travel ↔ career / study / commercial / receive_item
litigation_dispute ↔ debt_collection / commercial / career / marital
lost_property ↔ receive_item / item_purchase / missing-person-or-animal
```

核心原则继续是：

```text
current target priority
>
background context
>
keyword presence
```

训练 near-domain negatives 不能用简单 keyword substitution 生成。

---

# 7. Shared Blocker D · Formal Integration Order

Semantic gate 开放后，不建议直接开始 Router training。

统一顺序应是：

```text
1. 冻结一个新的 expansion baseline
2. 补 Source Registry provenance
3. Promote Event / Intent Schema
4. 实现 Slot / Subject / Object Resolver
5. 实现 Sufficiency / abstention contract
6. 注册正式 Observation Rules
7. 接独立 Domain Assessment Evidence
8. 建立全局 collision matrix
9. 冻结 current-22 regression corpus
10. 才制作新主题 training / validation corpus
11. calibration 与 independent / blind 继续严格分离
12. 最后评估 route promotion
```

这样可以避免：

```text
先训练标签
后发现传统 Rule / Slot contract 不可实现
```

导致语料重做。

---

# 8. Training-ready 的严格定义

当前五主题可以称为：

```text
topic-internal pretraining preparation complete
```

但不能称为：

```text
semanticTrainingReady = true
```

真正 training-ready 至少还需要：

```text
semantic expansion gate opened
formal schema promotion completed
formal resolver / sufficiency implemented
formal observation registry implemented
five-theme collision matrix frozen
current-22 regression set frozen
training data policy/version frozen
```

所以当前统一状态应写：

```text
fiveThemeTopicInternalPretrainingReady = true
fiveThemeSystemTrainingEligible = false
```

---

# 9. 最终结论

最初规划的五个主题现在已经全部走完当前允许的研究与 isolated engineering 阶段：

```text
lost_property
career_position
study_exam
travel
litigation_dispute
```

下一步不应继续机械增加第六个主题，也不应在 v0.13 gate 未解除时偷偷开始训练。

更合理的下一阶段是：

```text
等待 / 完成 current v0.13 baseline promotion work
+
提前准备共享 Source Registry provenance normalization
+
提前完成 five-theme global collision matrix design
```

其中后两项可以继续保持 design-only，不污染 current 22。