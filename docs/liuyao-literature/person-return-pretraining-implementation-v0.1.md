# 龟甲 · 六爻行人 / 归期 Pretraining Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented`

主题候选：`person_return`

依赖：

- `person-return-research-v0.1.md`
- `person-return-rule-review-v0.1.md`
- `person-return-intent-schema-design-v0.1.md`

实现：

- `js/liuyao-person-return-pretraining-v01.js`
- `tests/liuyao-person-return-pretraining-v01-tests.js`

> 当前不可达，不接正式 Intent、Rule Registry、Observation Planner、Router、训练 / 校准 / blind 数据。

---

# 1. Supported Duties

```text
person_return_outcome
person_return_progress
person_return_timing
```

---

# 2. Person Resolver

```text
parent          → 父母
child           → 子孙
wife            → 妻财
husband         → 官鬼
sibling_or_peer → 兄弟
friend          → 兄弟
other_non_kin   → 应
unknown         → unresolved
self            → cross-route travel
```

未知关系无 fallback。

---

# 3. Observation Plan

三个 duties 共用：

```text
Primary → returning person / required
Role    → 世 / querent-home reference / optional
```

但 Evidence 层严格分开。

---

# 4. Outcome / Progress / Timing Isolation

```text
Outcome
→ movement / direction / relation / obstruction evidence
→ finalAssessment = null

Progress
→ moving / road / gate / toward-home evidence
→ progressState = null

Timing
→ trigger descriptors only
→ exactDate = null
→ Time Engine = external
```

Timing 不做 outcome vitality scoring；Outcome 不计算归期。

---

# 5. Hard Blocks

```text
missing person / disappearance
→ blocked

health or safety current target
→ travel / product-policy boundary

communication or news current target
→ deferred person_news_contact

self return
→ travel
```

---

# 6. Regression

本地 Node 执行：

```bash
node --check js/liuyao-person-return-pretraining-v01.js
node --check tests/liuyao-person-return-pretraining-v01-tests.js
node tests/liuyao-person-return-pretraining-v01-tests.js
```

同内容临时执行结果：

```text
Person return pretraining regression: 25 passed, 0 failed
```

覆盖关系 Resolver、self/travel boundary、missing-person block、Timing/Outcome 隔离、Time trigger-only contract、Semantic leakage ban 等。

---

# 7. 当前成熟度

```text
literatureResearch              = completed_and_reviewed
ruleReview                      = complete
intentSchemaDesign              = ready_v0.1
isolatedContractImplementation  = complete
isolatedRegression              = 25/25_passed

formalIntentImplementation      = blocked
formalRuleRegistryImplementation= blocked
semanticTrainingReady           = false
currentRoute                    = false
```
