# 六爻 Semantic Sufficiency 合同 v0.1

## 1. 定位

Semantic Sufficiency 位于现代语言语义层，职责是判断：

> 已经得到一个现代语义 route 之后，当前问题是否提供了足够的语义论元，使该事件可以被可靠建立。

它不负责：

- 判断六亲、世应、用神或任何传统术数字段；
- 判断 Rule Registry 是否存在规则；
- 替代 Modern Semantic Router；
- 把 `out_of_scope` 与 `rule_unavailable` 混为一谈；
- 通过不断增加自然语言同义词来解决全部 NLP 问题。

Semantic Router v0.1 保持冻结。Semantic Sufficiency 是其后的独立层。

```text
Question
→ Semantic Router
→ candidate modern route
→ Semantic Sufficiency
   ├─ sufficient
   └─ semantic_insufficient
→ Semantic Assembler / DivinationIntent（后续）
```

## 2. SemanticSlot

v0.1 只定义当前 15 个 route 建立事件所需要的最小语义槽位：

| Slot | 含义 |
| --- | --- |
| `financial_scope` | 整体财运、综合收入、总体进账或钱财状态 |
| `business_context` | 店铺、生意、经营、业务或创业经营对象 |
| `borrowing_context` | 贷款、借款、融资、授信或放款关系 |
| `debt_context` | 债务、欠款、还贷、还款或待清偿负债 |
| `investment_target` | 股票、基金、标的、持仓、投资项目等投资对象 |
| `position_context` | 持有、仓位、清仓、减仓、赎回、卖出、退出等状态 |
| `employment_income_context` | 工资、薪水、月薪、调薪、加薪或固定薪酬 |
| `bonus_context` | 年终奖、绩效奖、奖金、奖励金等 |
| `delivery_context` | 收货、送达、发货、寄送、物流、快递或到手事件 |
| `delivery_target` | 包裹、订单商品或待收取的具体物品 |
| `purchase_context` | 购买、入手、购入、值不值得买或买后是否后悔 |
| `purchase_object` | 具体可购买对象 |
| `specific_counterpart` | 现实中的特定关系对象；裸 `他/她/我们/对方` 不自动算已解析 |
| `marriage_proposal_context` | 亲事、婚事、婚约、领证、结婚、成为夫妻等婚配目标 |
| `existing_marriage_context` | 夫妻、丈夫、妻子、老公、老婆、已婚或既有婚姻 |

Slot 只表达现代现实语义，不得包含 `妻财/官鬼/父母/兄弟/子孙/世/应`。

## 3. Route Requirement Matrix

| Route | Required | Optional | 可从上下文恢复 |
| --- | --- | --- | --- |
| `financial_fortune` | `financial_scope` | — | `financial_scope` |
| `business_operation` | `business_context` | — | `business_context` |
| `borrow_money` | `borrowing_context` | — | `borrowing_context` |
| `debt_repayment` | `debt_context` | — | `debt_context` |
| `investment_profit` | `investment_target` | — | `investment_target` |
| `investment_suitability` | `investment_target` | — | `investment_target` |
| `investment_position_decision` | `position_context` | `investment_target` | 二者均可 |
| `investment_price_trend` | `investment_target` | — | `investment_target` |
| `income_salary` | `employment_income_context` | — | `employment_income_context` |
| `income_bonus` | `bonus_context` | — | `bonus_context` |
| `receive_item` | `delivery_context` + `delivery_target` | — | 二者均可 |
| `item_purchase` | `purchase_context` + `purchase_object` | — | 二者均可 |
| `relationship_development` | `specific_counterpart` | — | `specific_counterpart` |
| `marriage_match` | `specific_counterpart` **或** `marriage_proposal_context` | — | 二者均可 |
| `marital_relationship` | `existing_marriage_context` | — | `existing_marriage_context` |

## 4. 输出状态

### `sufficient`

所有该 route 的必要语义均已由当前问题或允许恢复的上下文提供。

### `semantic_insufficient`

route 本身可能合理，但建立事件所需的必要语义缺失。输出必须包含 `missing`，明确缺少的 slot 或 required-any 组。

例如：

```text
后面会不会涨
route = investment_price_trend
→ 缺 investment_target
→ semantic_insufficient
```

```text
什么时候能收到
route = receive_item
→ 有 delivery_context
→ 缺 delivery_target
→ semantic_insufficient
```

```text
我们有机会吗
route = relationship_development
→ 缺 specific_counterpart
→ semantic_insufficient
```

### `unsupported_route`

当前 requirement matrix 尚未登记该 modern route。它与 `semantic_insufficient` 不同，也不等于 Rule Registry 的 `no_confirmed_rule`。

## 5. 上下文恢复

某些 slot 可以由前文恢复，但必须由上游上下文/共指层明确提供；Semantic Sufficiency 自己不猜。

例如：

```text
前文：这只股票最近一直跌
当前句：后面会不会涨
```

若上游提供：

```json
{ "id": "investment_target", "source": "context", "evidence": "这只股票" }
```

则 `investment_price_trend` 可以变为 `sufficient`。

同理：

```text
前文：最近认识了一个男生
当前句：我们有机会吗
```

只有上游明确解析出 `specific_counterpart` 后，当前句才可以通过。

## 6. v0.1 明确不做的事

当前 `extractExplicitSlots()` 只是合同与 fixture 验证工具，用保守的显式模式证明 requirement matrix 能工作；它不是正式 NLP slot parser，也不应继续膨胀成大型关键词表。

后续应分别评估：

1. 哪些 slot 可以由现有 Participant Resolver / 结构化输入直接提供；
2. 哪些 slot 需要小型 multi-label semantic head；
3. 哪些 slot 需要上下文/共指解析；
4. 如何将 `semantic_insufficient` 映射回 DivinationIntent / A-B-C-D 诊断体系。

在这些问题明确前，不接传统 Rule Registry，也不修改时间引擎。

## 7. Slot Provider 层

上述第 6 节的来源审计已经拆成独立 `SemanticSlot Provider v0.1`。其职责不是重新做一次语言分类，而是统一接收不同上游产生的 slot claim，并处理：

- `providerId / provenance / confidence`；
- 当前问题与历史 context 的优先级；
- 同一 slot 的多来源合并；
- 同一 question scope 下实体值冲突；
- route 对 context-recoverable slot 的白名单；
- 未来 object/entity resolver 与 ML multi-label slot heads 的接口。

详细合同见 `LIUYAO_SEMANTIC_SLOT_PROVIDER_v0.1.md`。

重要边界：**candidate route 本身不能被直接转换成 required slot。** 例如 `route = investment_price_trend` 不足以自动制造 `investment_target`；否则 Semantic Sufficiency 会退化成循环证明。
