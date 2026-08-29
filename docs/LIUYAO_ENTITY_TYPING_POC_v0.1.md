# 龟甲六爻 Entity Typing / Object Role PoC v0.1

## 1. 定位

Entity Typing v0.1 只解决一个窄问题：

> Object / Entity Resolver 已经从当前问题中找到显式实体候选，但仅凭表面形式不足以确认该实体在当前事件中的对象角色。

典型例子：

- `英伟达下周还会涨吗`
- `苹果后面走势怎么样`
- `特斯拉还能反弹吗`

这些句子存在明确实体，但 `英伟达 / 苹果 / 特斯拉` 本身并不天然等于“投资标的”。

因此 v0.1 不扩充上市公司名称表，而是复用冻结的 `Xenova/bge-small-zh-v1.5 q8` embedding，在“对象候选 + 当前局部上下文”上训练一个很小的现代语义分类头。

## 2. 类型集合

当前 PoC 仅定义四类：

```text
investment_asset
purchasable_item
delivery_subject
unknown
```

它们只属于现代语义层，不是六亲、用神、世应或 Rule Registry ID。

## 3. 输入

分类输入由两部分组成：

```text
entity candidate
+
current question / local context
```

模型实际编码格式：

```text
对象：<entity>。上下文：<context>
```

同一实体在不同上下文可以得到不同角色。例如：

```text
英伟达下周还会涨吗
→ investment_asset

英伟达下一次财报什么时候发布
→ unknown
```

因此 Entity Typing 不是实体词典，也不是公司知识库。

## 4. 模型结构

```text
BGE-small-zh-v1.5 q8（冻结）
        ↓
512-d embedding
        ↓
4-class Multinomial Logistic Regression
        ↓
Validation-only class thresholds + margin
        ↓
accepted type / unknown
```

当前 PoC 浏览器现场训练仅用于验证架构。正式接入前应与 Semantic Router 一样导出静态线性权重。

## 5. 数据隔离

`data/liuyao-entity-typing-training-v0.1.json`：

- Train：4 类 × 24 = 96
- Validation：4 类 × 8 = 32

现有 sealed `liuyao-semantic-route-blind-eval-v0.2.json` 不得用于 Entity Typing 训练或阈值校准。

CI 会检查 Entity Typing Train / Validation 内无完全重复 context，并检查与 sealed Blind Eval v0.2 无完全相同文本。

## 6. 与 Object Resolver 的关系

优先顺序保持：

```text
Structured Intent object
→ High-precision Object / Entity Resolver
→ Entity Typing fallback
→ Explicit Context
→ unresolved
```

高精度 Object Resolver 已能直接确认：

- `这只股票`
- `AAPL`
- `我买入的英伟达`
- `我订的电脑`
- `MacBook Pro 值不值得买`

Entity Typing 主要处理：

- 裸公司/品牌/专名已经被抽成 entity candidate；
- 但其投资/购买/交付角色不能由词面直接证明。

## 7. Provider 输入接口

SemanticSlot Provider 可接收：

```js
entityTypingPredictions: [
  {
    entity: '英伟达',
    type: 'investment_asset',
    confidence: 0.91,
    score: 0.91,
    margin: 0.18,
    modelId: 'guijia-entity-typing-poc-v0.1'
  }
]
```

只有同时满足以下条件才允许补 required slot：

1. prediction 对应当前问题中真实抽出的 candidate；
2. `confidence` 达到最低门槛；
3. type 与 candidate route 所要求的对象角色兼容；
4. 当前问题尚未由更高优先级 Provider 解析该 slot。

例如：

```text
route = investment_price_trend
entity = 英伟达
type = investment_asset
→ investment_target = 英伟达
```

但：

```text
route = investment_price_trend
type = purchasable_item
→ type_incompatible_with_route
→ 不补 investment_target
```

## 8. 防循环原则

严格禁止：

```text
route = investment_price_trend
→ 因此英伟达一定是 investment_asset
```

candidate route 只能声明“当前 route 需要什么类型”，不能制造 typing 结果。

Entity Typing 必须独立读取 entity + context 后给出现代语义类型。

## 9. 保守策略

- 低置信 prediction：忽略；
- `unknown`：保持 unresolved；
- prediction 与当前 candidate 不匹配：忽略；
- 类型与 route 不兼容：忽略；
- 多对象冲突：继续沿用 Provider conflict 机制，不暗选；
- 不通过增加公司名、品牌名、股票名列表提高覆盖率。

## 10. 当前阶段

v0.1 只是 PoC：

- 已有独立训练 / validation 数据；
- 已有浏览器 BGE + 4-class 线性头测试页；
- 已有 Provider adapter 与 provenance / confidence 接口；
- 尚未生成静态 Entity Typing 权重；
- 尚未接正式首页；
- 尚未修改 Semantic Router v0.1、DivinationIntent v0.1、Rule Registry 或时间引擎。
