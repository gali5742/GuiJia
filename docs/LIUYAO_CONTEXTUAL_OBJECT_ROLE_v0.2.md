# 六爻 Contextual Object Role v0.2

## 1. 定位

`Contextual Object Role` 位于 Object Candidate Extraction 与 SemanticSlot Provider 之间，目标不是回答“这个实体本体上是什么”，而是回答：

> **这个显式对象候选在当前问题里，是否真正承担龟甲需要的对象角色？**

它只处理现代现实语义，不输出六亲、世应、用神或 Rule ID。

```text
Question
→ Object / Entity Resolver
→ entity candidate
→ BGE-small-zh-v1.5 q8
→ Contextual Object Role head
   ├─ investment_target_role
   ├─ purchase_target_role
   ├─ delivery_target_role
   └─ no_supported_role
→ provider-calibrated accept/reject
→ SemanticSlot Provider
   ├─ investment_target
   ├─ purchase_object
   └─ delivery_target
→ Semantic Sufficiency
```

Semantic Router v0.1、DivinationIntent v0.1、Rule Registry 与时间引擎均保持冻结。

## 2. 为什么从 Entity Typing v0.1 改成 Object Role v0.2

Entity Typing Blind Eval v0.1 暴露出一个明确问题：`purchasable_item` 容易把“商品实体本体上可购买”误当成“当前问题正在把它作为购买对象”。例如技术使用、尺码、设置、维修等问题中，实体仍然是商品，但并不承担 `purchase_object` 的事件角色。

因此 v0.2 不再训练：

```text
investment_asset / purchasable_item / delivery_subject / unknown
```

而改成直接面向当前事件职责：

```text
investment_target_role
purchase_target_role
delivery_target_role
no_supported_role
```

关键区别：

```text
MacBook Pro现在值不值得买
→ purchase_target_role

MacBook Pro怎么重装系统
→ no_supported_role

我订的MacBook Pro什么时候能收到
→ delivery_target_role
```

同一个实体可以随当前问题上下文改变角色。

## 3. 输入与输出

输入由两部分组成：

```ts
interface ContextualObjectRoleInput {
  entity: string
  context: string
}
```

PoC 实际送入 BGE 的文本形如：

```text
对象候选：MacBook Pro。当前问题：MacBook Pro现在值不值得买
```

输出：

```ts
interface ContextualObjectRolePrediction {
  entity: string
  role:
    | 'investment_target_role'
    | 'purchase_target_role'
    | 'delivery_target_role'
    | 'no_supported_role'
  confidence: number
  score: number
  margin: number
  threshold: number
  accepted: boolean
  modelId: string
}
```

只有三个可绑定 role 且 `accepted === true` 时，Adapter 才有资格生成 slot claim。

## 4. Slot 映射

```text
investment_target_role → investment_target
purchase_target_role   → purchase_object
delivery_target_role   → delivery_target
no_supported_role      → 不生成 slot
```

同时必须满足 candidate route 的职责兼容性：

```text
investment_profit / investment_suitability /
investment_position_decision / investment_price_trend
→ investment_target_role

item_purchase
→ purchase_target_role

receive_item
→ delivery_target_role
```

candidate route 只能用于验证 role 与当前任务是否兼容，不能反向制造 role。

## 5. Provider 优先级

高精度 Object Resolver 仍优先。

```text
Structured Intent object
> High-precision Object / Entity Resolver
> Contextual Object Role
> Explicit Context
> generic ML slot provider
```

如果高精度 Resolver 已经确认 `这只股票 / 我订的电脑 / 这台相机` 等对象 slot，Contextual Object Role 必须退让，不重复覆盖。

## 6. Acceptance

Contextual Object Role 使用自己的独立 Validation 校准：

- class-specific score threshold；
- minimum margin；
- `accepted` 最终判定。

Slot Provider 不再叠加固定的全局 confidence floor。

这与 generic ML multi-label provider 不同：generic provider 如果未来没有独立校准，仍可保留通用 confidence floor。

## 7. 训练数据 v0.2

当前 PoC：

```text
4 classes
32 train / class
12 validation / class

Train      128
Validation  48
```

训练设计刻意让同一实体跨角色出现，例如某一设备可以分别出现在：

- 购买问题；
- 收货问题；
- 设置 / 维修 / 使用问题。

公司实体也同时出现于：

- 股价 / 持仓 / 投资问题；
- 财报 / 产品 / 公司事实问题。

这样模型必须利用 `entity + current context`，而不能只记实体名称。

v0.2 数据与 Entity Typing v0.1 Train/Validation、Entity Typing Blind v0.1、Semantic Router Blind v0.2 做 exact-context 隔离。

## 8. v0.2 明确不做

- 不修改 Semantic Router v0.1；
- 不使用旧 Blind Eval 回调 v0.1；
- 不建立公司、品牌、商品名称词典；
- 不把 candidate route 当作对象角色证据；
- 不输出传统六亲或 Rule ID；
- 不接正式首页；
- 暂不固化静态权重，先做 PoC Validation。

## 9. 下一步判定标准

先只看独立 Validation，重点指标：

```text
Top-1 accuracy
Known role coverage
Accepted known role accuracy
No-role rejection
False role activation
Accepted decision precision
```

尤其关注：

- 商品实体的非购买问题是否能稳定落 `no_supported_role`；
- 同一设备在购买 / 收货 / 技术问题之间能否切换；
- 公司实体在投资 / 非投资问题之间能否切换。

若 Validation 通过，再另建新的 Contextual Object Role Blind Eval；不得复用 Entity Typing Blind v0.1 作为新的盲测。
