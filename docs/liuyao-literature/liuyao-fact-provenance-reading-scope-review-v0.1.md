# 龟甲 · 六爻 Fact Provenance Reading Scope Review v0.1

日期：2026-09-02

状态：`review_complete_design_only`

范围：六爻 Domain Assessment 上游 Fact ref 的 reading scope / uniqueness。

> 本文件不执行 Formal Expansion，不修改 runtime result schema、Time Engine、current-22。

## 1. 发现的问题

当前 isolated Line Status Fact Adapter v0.1 使用：

```text
LINE-STATUS:<position>:<code>
```

例如：

```text
LINE-STATUS:3:VOID
```

这在单次 isolated packet 内稳定，但跨不同卦并不唯一。

不同 reading 都可能出现：

```text
三爻旬空
```

所以：

```text
stable local ref
!=
globally auditable fact ref
```

## 2. 为什么 AlternativeId 不能解决

Travel Evidence id 当前还会加入：

```text
alternativeId
```

但：

```text
Alternative identity
!=
Divination reading identity
```

同一个 choice alternative 可以在不同 reading 中重现；同一个 reading 也可以有多个 alternatives。

因此 source Fact 必须先有 reading scope，再由 Evidence 绑定 alternative。

## 3. 当前 runtime 可见候选

现有 `resultObj` 中存在：

```text
castTimestamp
```

并被 Time Engine 用作起卦时间基准。

但：

```text
castTimestamp alone
```

不应未经审查直接成为 formal reading primary key，因为：

1. 理论上存在同一时间粒度内多个 reading；
2. 导入 / 重算 / 测试 fixture 可能复用时间；
3. 它不能单独证明卦象 snapshot 完全相同；
4. 将 timestamp 主键化会把当前时间字段职责扩张成身份字段。

## 4. 设计决定

未来 Fact provenance contract 要求显式：

```ts
readingRef: string
```

Fact ref 结构建议：

```text
READING:<readingRef>:LINE-STATUS:<position>:<code>
READING:<readingRef>:SHI-YING:<code>
```

`readingRef` 的 runtime producer 另行决定。

优先级：

```text
explicit stable reading id
>
reviewed immutable cast-snapshot fingerprint
>
castTimestamp-only fallback（formal 禁止）
```

## 5. Snapshot fingerprint 若未来采用

必须至少研究是否包含：

```text
castTimestamp
original six line yin/yang state
moving line positions
month/day context or canonical calendar ref
question scope identity if needed
```

是否把自然语言 question 纳入 fingerprint 不能现在拍脑袋决定；相同卦象与时间是否允许不同语义问题共享 reading identity，需要独立设计。

## 6. v0.1 Adapter 的状态调整

`liuyao-line-status-fact-adapter-pretraining-v01.js` 不删除、不改行为。

它应被理解为：

```text
isolated_packet_scoped_provenance_prototype
```

不是：

```text
formal_global_fact_ref_provider
```

后续新增 v0.2 adapter，显式要求 `readingRef`。

## 7. ShiYing Fact Adapter 要求

新建世应 Fact Adapter 时从第一版就必须接收：

```text
readingRef
```

不能再重复 v0.1 Line Status ref 的作用域缺口。

## 8. Formal gate

Formal Expansion 前至少需要：

```text
readingRef producer reviewed
readingRef collision behavior defined
import/replay identity behavior defined
all formal sourceFactRefs reading-scoped
```

同时仍要求用户明确授权 Formal Expansion。

## 9. 结论

```text
castTimestamp = useful provenance field, not approved unique id
explicit readingRef = required future fact scope
Line Status Fact Adapter v0.1 = local prototype only
new scoped adapter = next isolated migration
Formal Expansion = not authorized
```
