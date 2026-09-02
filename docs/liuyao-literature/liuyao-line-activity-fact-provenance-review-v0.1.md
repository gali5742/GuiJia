# 龟甲 · 六爻 Line Activity Fact Provenance Review v0.1

日期：2026-09-02

状态：`provenance_review_complete_design_only`

范围：六爻结构事实层 / activity fact provenance

上游：

- `js/app.js`
- `js/liuyao-core.js`
- `js/liuyao-line-status-fact-adapter-pretraining-v02.js`
- `travel-transport-operation-activity-evidence-review-v0.1.md`

> 本文件只审计“明动 / 暗动”活动事实从哪里产生，以及能否规范化为 reading-scoped atomic Fact。它不判断吉凶，不建立 transport success / delay / schedule Assessment，也不修改正式 Fact / Rule Registry / Time Engine。

---

# 1. Review 问题

上一轮已确认：

```text
DARK_MOVING
→ 已有 reading-scoped Line Status Fact
→ family = activity_state
```

但 visible moving 仍存在 provenance 缺口：

```text
line.moving = true
```

究竟是：

1. 起卦输入的结构事实；还是
2. Core 根据旺衰、日月、评分、动变关系推断出来的结果？

只有答案是第 1 种，才允许安全建立：

```text
VISIBLE_MOVING atomic Fact
```

本轮结论：**provenance 已闭合。**

---

# 2. Production input provenance

`js/app.js` 的六爻输入模型为：

```js
liuyaoForm.lines = [null, null, null, null, null, null]
```

手动 UI 只允许四个值：

```text
6 · 老阴（动）
7 · 少阳（静）
8 · 少阴（静）
9 · 老阳（动）
```

因此手动输入路径的 activity state 在用户输入阶段已经确定。

没有第五种：

```text
“程序后来判断这一爻应当算动”
```

的输入状态。

---

# 3. Coin simulation provenance

`simulateCoinLine()` 对三枚模拟钱币逐次取：

```text
2 or 3
```

并求和。

所以结果天然只可能是：

```text
6 / 7 / 8 / 9
```

`simulateAllLines()` 将六次结果直接写回：

```text
liuyaoForm.lines[index]
```

因此掷币模拟与手动输入最终共享同一 source representation：

```text
6 / 7 / 8 / 9
```

不存在第二套 movement state calculation。

---

# 4. Raw value → visible moving

`calculateLiuYao()` 首先只做数值归一化与合法性校验：

```js
const rawValues = liuyaoForm.lines.map((value) => Number(value));
```

并要求每一项只能属于：

```text
6 / 7 / 8 / 9
```

之后明确生成：

```js
const originalLines = rawValues.map((value) => value === 7 || value === 9);
const moving = rawValues.map((value) => value === 6 || value === 9);
```

因此：

```text
raw = 6 → visible moving
raw = 9 → visible moving
raw = 7 → static
raw = 8 → static
```

这一步只编码传统起卦结构：

```text
老阴 / 老阳 = 动爻
少阴 / 少阳 = 静爻
```

不读取：

```text
月建
日辰
旬空
六亲
世应
旺衰
评分
用神
moveTags
Assessment
```

因此它是结构事实，不是推理结果。

---

# 5. Row preservation

每个 row 直接保存：

```js
moving: moving[index]
```

同时：

```js
moveMark: value === 9 ? '○' : (value === 6 ? '×' : '')
```

这两个字段都来自同一 raw value。

随后才调用：

```js
buildLiuYaoLineStatus(..., moving[index])
buildMoveAnalysis(...) // only when moving[index] === true
```

因此 dependency direction 是：

```text
rawValues
↓
moving structural fact
↓
Line Status / Move Analysis
```

而不是：

```text
Move Analysis
↓
推断 line should be moving
```

---

# 6. Core consumption audit

现有 Core 中，`moving` 被下游模块用于：

```text
筛选动爻
构造变爻
计算动变关系
建立全卦结构
展示动爻文本
旧版评分 / interpretation 等
```

这些属于 consumer。

本 Review 未发现：

```text
Core 根据旺衰 / 日月 / score / move tag 把 static line 改写成 moving=true
```

的 production path。

特别要区分：

```text
visible moving
```

与：

```text
DARK_MOVING
```

后者是：

```text
moving === false
+
特定日冲等条件
→ buildLiuYaoLineStatus() 产生的状态 tag
```

所以两者语义都属于 activity，但 provenance 不同。

---

# 7. Normalized Activity Fact contract

本 Review 允许未来 design-only Fact Adapter 规范化为：

```text
Line Activity Fact
├─ VISIBLE_MOVING
└─ DARK_MOVING
```

建议统一：

```ts
{
  factType: 'line_activity',
  family: 'activity_state',
  sourceCode: 'VISIBLE_MOVING' | 'DARK_MOVING',
  position: number,
  readingRef: string,
  polarity: 'neutral'
}
```

其中 source provenance：

### VISIBLE_MOVING

```text
liuyaoForm.lines raw value
→ 6 / 9
→ rows[].moving === true
```

### DARK_MOVING

```text
rows[].moving === false
+
Line Status computation
→ statusCode = DARK_MOVING
→ existing Line Status Fact Adapter
```

两者必须保留不同 `sourceCode`，不得只留下一个模糊：

```text
ACTIVE
```

而丢掉事实来源。

---

# 8. Why normalization is safe

规范化只表示：

```text
this line has an activity signal
```

它不表示：

```text
活动一定成功
事情一定发生
事情一定更快
事情一定更有利
一定当天完成
一定按时
```

因此：

```text
VISIBLE_MOVING
DARK_MOVING
```

都只能获得：

```text
neutral activity-state Fact
```

领域 Evidence 必须在 object / role binding 之后解释。

例如：

```text
transport + activity Fact
→ transport_operation_activity

obstruction + activity Fact
→ obstruction_activity
```

不能在 Fact 层提前写 polarity。

---

# 9. Explicit forbidden shortcuts

不得：

```text
moving=true → favorable
moving=true → successful operation
moving=true → on_schedule
moving=true → faster
```

不得从：

```text
moveTags.length > 0
changedBranch != originalBranch
score bonus
interpretation text
```

反推 `VISIBLE_MOVING`。

不得把：

```text
DARK_MOVING
```

改写成：

```text
moving=true
```

因为 production structure 中暗动仍属于本卦静爻；它只是额外 activity status。

---

# 10. Provenance completeness

本轮已经覆盖 production 两条输入路径：

```text
manual entry
coin simulation
```

两者统一到：

```text
raw 6/7/8/9
```

再统一到：

```text
6/9 → visible moving
7/8 → static
```

因此：

```text
visibleMovingFactProvenance = complete
visibleMovingFactImplementationReady = true
```

但这里的 `ImplementationReady` 只指：

```text
可建立 design-only atomic Fact Adapter
```

不代表：

```text
Transport Operational Assessment ready
```

---

# 11. 与现有 DARK_MOVING Fact 的兼容方案

为了避免重复事实，未来实现建议不是再复制整个 Line Status Adapter，而是：

```text
VISIBLE_MOVING
→ 从 rows[].moving 生成新的 atomic Fact

DARK_MOVING
→ 继续复用现有 line-status Fact

Activity normalization helper
→ 将两者投影为同一 family / interface
```

也可以做一个薄 Adapter：

```text
input:
  rows
  existing lineStatusFacts

output:
  normalized lineActivityFacts
```

但必须满足：

```text
DARK_MOVING 只引用已有 Fact provenance
不得重新计算日冲条件
```

---

# 12. Remaining blockers

本 Review 解决的是：

```text
VISIBLE_MOVING provenance
```

仍未解决：

```text
activity → operational success
activity → same-day operation
activity → on_schedule
cancellation / non-operation Evidence
replacement transport selection
multi-parent transport resolver
obstruction object resolver
```

因此当前仍保持：

```text
transportOperationActivityEvidence
= fact_layer_ready

transportOperationalViabilityAssessment
= not_ready

transportScheduleAssessment
= not_ready
```

---

# 13. Final decision

```text
VISIBLE_MOVING
= production structural fact
= provenance complete
= may enter design-only atomic Fact layer

DARK_MOVING
= derived line-status fact
= existing provenance retained

VISIBLE_MOVING + DARK_MOVING
= may normalize under activity_state
= sourceCode must remain distinct
= polarity remains neutral
```

Formal Expansion 仍未授权；当前 22-route、正式 Rule Registry、Time Engine 不修改。
