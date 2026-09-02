# 龟甲 · 六爻 Reading Identity / Provenance Research v0.1

日期：2026-09-02

状态：`design_ready_runtime_mutation_not_authorized`

目标：为 Fact → Evidence → Assessment → Comparator 提供稳定、可审计的 `readingRef` 身份作用域。

> 本研究不修改 `js/app.js`，不修改 current runtime，不执行 Formal Expansion。

## 1. 当前 runtime 审计

当前 `js/app.js` 中，六爻输入主要来自：

```text
liuyaoForm.question
liuyaoForm.datetime
liuyaoForm.daySect
liuyaoForm.lines[6]
```

计算时：

```text
rawValues = lines → Number
rawValues ∈ {6,7,8,9}
castDate = parseLocalDateTime(datetime)
```

随后由 rawValues 派生：

```text
originalLines
moving
changedLines
NaJia
rows
statusTags
moveTags
...
```

当前结果对象保存：

```text
question
castTimestamp
daySect
xunKong
original
changed
lines / displayLines
...
```

但没有正式的：

```text
readingRef
rawValues snapshot field
inputMethod provenance
```

## 2. 当前模拟掷币 provenance 缺口

`simulateAllLines()` 当前通过 `Math.random()` 生成六次 6/7/8/9 结果，并直接写入：

```text
liuyaoForm.lines
```

之后和手工录入走完全相同的计算入口。

因此当前结果对象无法可靠区分：

```text
manual entry
simulated all lines
simulated then manually edited
```

这不影响现有排盘结果，但意味着未来若要做严格 provenance，不能声称当前已有 cast-method fact。

## 3. 为什么 castTimestamp 不能单独作为 readingRef

`castTimestamp` 很重要，但它只表达时间。

单独作为 identity 存在问题：

1. 同一毫秒理论上可能产生多个计算实例；
2. 时间不能证明六爻 rawValues 相同；
3. 时间不能证明问题语境相同；
4. 时间戳不是显式生命周期 ID；
5. 后续导入/重放时可能保留原始时间但生成新的分析实例。

因此：

```text
castTimestamp ≠ readingRef
```

## 4. 为什么 derived lines 不应替代 rawValues provenance

从：

```text
originalYang + moving
```

可以理论重建：

```text
yin moving  → 6
yang static → 7
yin static  → 8
yang moving → 9
```

但 provenance 原则应优先保留直接输入：

```text
rawValues
```

而不是以后从派生对象逆向重建。

原因：

- 派生 schema 未来可能变化；
- 逆向恢复会把“原始输入”和“推导结果”混为一层；
- 审计链更难判断数据最初从哪里进入系统。

## 5. 推荐的双层身份结构

未来 runtime 推荐区分：

```text
readingRef
+
castSnapshot
```

### readingRef

职责：唯一身份。

建议：

```text
UUID / random unique identifier
```

例如未来由浏览器安全随机源生成一次，并和结果对象一起保存。

它不是命理字段，不参与任何断卦。

### castSnapshot

职责：复核这次 reading 的原始输入状态。

建议最小字段：

```ts
interface LiuYaoCastSnapshotV01 {
  schemaVersion: 1
  castTimestamp: number
  daySect: '1' | '2'
  rawValues: [6|7|8|9, 6|7|8|9, 6|7|8|9, 6|7|8|9, 6|7|8|9, 6|7|8|9]
  questionSnapshot: string
  inputMethod: 'manual' | 'simulated_all' | 'mixed_or_unknown'
}
```

`questionSnapshot` 应保存当次起卦计算时实际问题文本，而不是后续重新从编辑框读取。

## 6. readingRef 与 snapshot fingerprint 不同

未来可以额外有：

```text
snapshotFingerprint
```

用于：

- 导出/导入完整性检查；
- regression fixture 去重；
- 判断两个序列化对象是否来自同一 cast snapshot。

但：

```text
snapshotFingerprint ≠ readingRef
```

不建议仅靠 hash 充当 reading lifecycle identity。

原因：

- 同一 snapshot 可能被复制用于不同分析实例；
- fingerprint 是内容身份；readingRef 是实例身份；
- 两者职责不同。

## 7. fingerprint canonical input

若未来生成 fingerprint，建议只包含原始/稳定输入：

```text
schemaVersion
castTimestamp
daySect
rawValues
questionSnapshot
inputMethod
```

不包含：

```text
月建日辰派生结果
八宫
纳甲
六亲
statusTags
TimeEffect
Semantic Route
ObservationPlan
Assessment
Comparator result
```

否则规则版本升级会改变 reading identity/integrity 值。

## 8. inputMethod 的现状边界

当前 app 没有保存 method state。

未来若实现：

```text
simulateAllLines()
→ inputMethod = simulated_all
```

但用户之后手工改任一爻时，必须降级：

```text
mixed_or_unknown
```

不能继续标 `simulated_all`。

单纯当前页面的手工输入：

```text
manual
```

是否要进一步细分“用户自己投币后录入”和“直接选择数字”，属于 UI provenance，不影响首轮 reading identity contract。

## 9. Fact provenance contract

正式 Fact ref 未来应形成：

```text
readingRef
↓
FactRef
↓
EvidenceRef
↓
Assessment.readingRef
↓
Comparator same-reading gate
```

例如：

```text
READING:<readingRef>:LINE-STATUS:3:VOID
```

`readingRef` 必须来自 result-level identity，而不是每个 Adapter 自己生成。

禁止：

```text
LineStatus adapter 自己 UUID
ShiYing adapter 自己 UUID
Assessment 自己猜 readingRef
Comparator 从 evidenceRef 字符串解析 readingRef
```

## 10. Choice / Alternative 关系

一个 reading 可以有多个 modern Alternative：

```text
readingRef = R1
alternativeId = A
alternativeId = B
```

因此：

```text
readingRef ≠ alternativeId
```

Assessment identity 为：

```text
readingRef + alternativeId + assessment contract identity
```

Comparator 首轮只允许：

```text
same readingRef
+ different or explicit alternativeId
```

跨 reading 比较需要未来独立 longitudinal contract。

## 11. 推荐 future runtime 最小改动

待后续正式允许共享 runtime 基础设施修改时，最小改动应集中在起卦结果创建点：

```text
calculateLiuYao()
```

一次性生成：

```text
readingIdentity {
  readingRef,
  castSnapshot,
  snapshotFingerprint?
}
```

然后所有下游只读。

不得在各主题模块分别生成 readingRef。

## 12. 当前不执行的事项

当前不修改：

```text
js/app.js
current result schema
copy analysis context
localStorage
formal Fact Registry
formal Assessment/Comparator runtime
```

## 13. Activation gate

Reading identity 要进入正式 runtime 前至少需要：

```text
readingRef generation method reviewed
rawValues captured directly before derivation
question snapshot semantics reviewed
inputMethod lifecycle reviewed
serialization/export policy reviewed
same-reading comparator regression executed
existing current-22 regression unchanged
explicit user authorization for relevant Formal Expansion/runtime integration
```

## 14. 结论

```text
current castTimestamp = provenance component, not identity
current derived lines = reconstructable, but not ideal raw provenance
stable readingRef producer = absent
recommended identity = unique readingRef + canonical castSnapshot
snapshot fingerprint = integrity helper, not lifecycle ID
runtime mutation = deferred
```
