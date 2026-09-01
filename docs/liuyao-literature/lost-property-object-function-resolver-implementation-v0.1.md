# 龟甲 · 六爻失物 Object Function Resolver Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented`

依赖：

- `lost-property-research-v1.0.md`
- `lost-property-modern-object-function-resolver-v0.1.md`

实现：

- `js/liuyao-lost-property-object-function-resolver-pretraining-v01.js`
- `tests/liuyao-lost-property-object-function-resolver-pretraining-v01-tests.js`

> 本实现不可达，不接正式 Intent、Rule Registry、Observation Planner、Router、训练 / 校准 / blind 数据。

---

# 1. 三层职责

```text
Modern Entity Identity
↓
Modern Function Context
↓
Source-aware Traditional Object Resolution
```

模块不解析原始问句，只消费上游对象语义。

---

# 2. Stable Resolution

```text
generic_property     → 妻财
document_credential  → 父母
vehicle              → 父母
clothing             → 父母
```

只有显式实体类别才能触发。

```text
unknown + general_possession
```

不会 fallback 为 generic_property。

---

# 3. Ambiguous / Unresolved

```text
phone
→ conflicted / 父母 vs 妻财

key
→ unresolved / school_specific 父母 candidate

ring
→ unresolved / function-dependent school-specific candidates

bank_card
computer
usb
disk
cloud_data
→ unresolved / insufficient_evidence
```

Known conflict 的对象不会因 function label 被静默降级为 generic stable mapping。

---

# 4. Legal Partial State

模块明确支持：

```text
Semantic Lost Property = sufficient
Traditional Object = unresolved | conflicted
```

并输出：

```text
legalPartialState = true
readyForTraditionalObservation = false
```

这使现代语义理解与传统取用充分性正式解耦。

---

# 5. Regression

本地 Node 对同内容模块执行：

```bash
node --check liuyao-lost-property-object-function-resolver-pretraining-v01.js
node --check liuyao-lost-property-object-function-resolver-pretraining-v01-tests.js
node liuyao-lost-property-object-function-resolver-pretraining-v01-tests.js
```

结果：

```text
Lost property object function resolver regression: 24 passed, 0 failed
```

覆盖：

- 4 个 stable classes；
- phone 跨作者冲突；
- function 不得覆盖 known conflict；
- key / ring school-specific；
- bank card / computer / storage / cloud unresolved；
- unknown 不得 generic fallback；
- legal partial state；
- provenance preservation；
- 不生成 Recovery / Location 最终结论；
- Semantic leakage ban。

---

# 6. 当前结论

```text
modernObjectFunctionResolverDesign = complete
isolatedImplementation = complete
isolatedRegression = 24/24_passed
formalIntegration = blocked
semanticTrainingReady = false
currentRoute = false
```

该专项的完成标准不是所有现代对象都得到六亲，而是所有已知冲突与证据不足都能被可靠保留为程序状态。
