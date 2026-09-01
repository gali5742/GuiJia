# 龟甲 · 六爻 Domain Assessment Envelope Isolated Implementation v0.1

日期：2026-09-01

状态：`isolated_design_implemented_verified`

实现：

- `data/liuyao-domain-assessment-contract-v0.1.json`
- `docs/liuyao-literature/domain-assessment-architecture-v0.1.md`
- `js/liuyao-domain-assessment-pretraining-v01.js`
- `tests/liuyao-domain-assessment-pretraining-v01-tests.js`

---

# 1. Architecture

```text
shared envelope = yes
shared evaluator = no
domain evaluator registry = contract only
active evaluators = 0
```

Shared 层只验证：

```text
assessment identity
semanticMeaning
contractFamily
resolutionStatus
assessmentStatus
provenance refs
forbidden output leakage
```

不读取 Evidence polarity 来生成方向。

---

# 2. Important Contract Correction

初版 validator 曾错误禁止：

```text
resolved + insufficient_evidence
```

Review 后已修正。

因为：

```text
resolutionStatus = resolved
```

表示证据包 / 职责已完整解析；

而：

```text
assessmentStatus = insufficient_evidence
```

可以合法表示“完整评估后仍无足够方向性证据”。

当前只禁止：

```text
resolved + not_assessed
```

这一修订避免未来把“已评估但证据不足”伪装成 unresolved。

---

# 3. Safe Refusal

当没有 evaluator 注册时：

```text
resolutionStatus = unresolved
assessmentStatus = not_assessed
reason = evaluator_not_registered
```

Shared 层不会 fallback 到：

```text
positive/negative polarity
Evidence 数量
line score
TimeEffect count
Interpretation priority
```

---

# 4. Regression

实际执行：

```text
Domain assessment envelope regression: 27 passed, 0 failed
```

核心覆盖：

```text
zero active evaluators
no shared evaluator
explicit contractFamily / semanticMeaning
forbid probability / scalarScore / winner / recommendation
positive polarity does not auto-support
negative polarity does not auto-adverse
litigation-specific polarity not globally interpreted
Evidence count does not change abstention
partial / unresolved / not_applicable preserved
resolved + insufficient_evidence valid
```

---

# 5. Runtime Boundary

```text
currentRuntimeReachable = false
formalIntegration = blocked
current-22 mutation = none
Time Engine mutation = none
```
