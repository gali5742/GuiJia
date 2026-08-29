# 六爻 Object / Entity Resolver v0.1

## 1. 定位

Object / Entity Resolver 位于现代语义层，只解决三个此前缺少稳定 Provider 的对象型 slot：

- `investment_target`
- `delivery_target`
- `purchase_object`

它不负责判断现代语义 route，也不负责传统六亲、世应、用神或 Rule Registry。

```text
Question
→ Semantic Router
→ candidate route
→ Object / Entity Resolver
   ├─ explicit referent candidates
   ├─ route-conditioned slot binding
   └─ conflict / unresolved
→ SemanticSlot Provider merge
→ Semantic Sufficiency
```

关键边界：**route 只能决定“如果存在明确对象，应绑定到哪个 slot”，不能凭 route 自己制造对象。**

例如：

```text
route = investment_price_trend
question = 后面会不会涨
```

不得因为 route 已知就自动生成 `investment_target`。

## 2. v0.1 的策略

v0.1 是高精度、保守实现，不追求覆盖所有自然语言对象表达。它只使用有限的语法结构和实体类型证据：

1. 当前问题中显式的主语 / 名词短语；
2. 购买、投资动作直接支配的对象；
3. 指示名词短语，如“这只股票”“这台电脑”；
4. ticker / 证券代码等明确投资实体；
5. 已有 structured Intent 对象事实优先，不重复制造第二个对象。

这些规则是对象存在性与绑定规则，不是现代 route 的同义词分类器。

## 3. 三类 slot 的约束

### `investment_target`

风险最高，因此最保守。当前 resolver 只在以下情况提供：

- 对象短语自身含明确投资实体类型，如股票、基金、ETF、期货、债券、指数、标的等；
- 对象是 ticker / 证券代码；
- 对象直接由明确投资动作支配，例如“买入英伟达”“持有某公司”。

单独公司名：

```text
英伟达下周还会涨吗
```

虽然有显式主语，但 v0.1 不自动证明它是 `investment_target`，会保守留下 `investment_type_not_confirmed`，等待未来 entity typing / ML provider。

### `delivery_target`

只要问题中有明确可指认对象即可提供，例如：

```text
我买的电脑什么时候能收到
我的订单明天能到吗
```

但：

```text
什么时候能收到
```

没有显式对象，保持不足。

### `purchase_object`

显式商品 / 对象可以提供：

```text
这台电脑值不值得买
MacBook Pro 值不值得买
```

裸指示词：

```text
这个值得买吗
```

不算具体 `purchase_object`。

## 4. 对象与事件语义必须分离

Object / Entity Resolver 只提供对象，不会顺便补出购买、交付或投资事件语义。

例如：

```text
这本书值不值得看
```

即使 resolver 能找到对象“这本书”，也不能自动生成 `purchase_context`。因此 `item_purchase` 仍应因缺购买动作语义而保持 `semantic_insufficient`。

这用于防止：

```text
route 猜 item_purchase
→ 找到一个名词
→ 自动补 purchase_context
→ 反过来证明 route 正确
```

的循环证明。

## 5. 多对象与冲突

同一 question scope 中若出现多个不同对象，例如：

```text
这只股票和那只基金哪个会涨得更好
```

Resolver 会产生多个同 slot claim，交给统一 Provider merge 形成 conflict，不静默挑一个。

v0.1 暂不定义多目标对象比较语义；后续若需要，应在 Intent / route taxonomy 中明确建模，而不是在对象层偷偷选取。

## 6. 与 Slot Provider 的关系

加载 `liuyao-object-entity-resolver.js` 后，它会扩展现有 `liuyaoSemanticSlotProvider`：

- 新增 `object_or_entity_resolver` provider run；
- 三个对象型 slot 的 audit 状态从 `interface_only` 变为 `implemented_high_precision`；
- 保留原有 provenance、confidence、context supersede 和 conflict 规则；
- structured Intent 已有对象时，文本 resolver 不重复制造第二个对象。

## 7. v0.1 明确不做

- 不把大型对象词典塞进前端；
- 不识别所有公司名、商品名、资产名；
- 不把 route 当作对象类型证据；
- 不处理复杂代词 / 共指；
- 不解决多对象比较；
- 不训练新的模型。

下一步只有在真实覆盖率确实不足时，才考虑利用现有 BGE 增加轻量 `entity typing` 或 token/span head；其输出继续通过当前 Provider 接口合并，不修改 Semantic Sufficiency Requirement Matrix。
