# 六爻 SemanticSlot Provider 合同 v0.1

## 1. 定位

`SemanticSlot Provider` 位于 `Semantic Router` 与 `Semantic Sufficiency` 之间，职责是把不同上游组件已经独立得到的现代现实语义事实统一成 `SemanticSlot[]`，并保留来源、置信度与冲突信息。

```text
Question
→ Semantic Router v0.1（冻结）
→ candidate modern route
→ Slot Providers
   ├─ Participant Resolver
   ├─ structured DivinationIntent
   ├─ Object / Entity Resolver
   ├─ Entity Typing fallback
   ├─ explicit prior context
   └─ generic ML multi-label slot heads（接口）
→ resolveSemanticSlots()
→ Semantic Sufficiency v0.1
→ sufficient / semantic_insufficient
```

本层不负责传统六亲、世应、用神，也不根据 Rule Registry 反推语义。

## 2. 统一 claim 结构

每个 Provider 输出一个或多个现代语义 claim：

```ts
interface SemanticSlotClaim {
  id: SemanticSlotId
  value?: string
  evidence?: string
  providerId: string
  sourceScope: 'question' | 'context'
  confidence: number
  provenance: Record<string, unknown>
}
```

`value` 用于对象、人物身份等需要区分实体的 slot。对于纯布尔语境 slot 可以为空。

## 3. Provider 审计

| Slot | 主 Provider | 当前状态 | 备用/后续 |
| --- | --- | --- | --- |
| `financial_scope` | structured Intent | 已实现 | context / ML |
| `business_context` | structured Intent | 已实现 | context / ML |
| `borrowing_context` | structured Intent | 已实现 | context / ML |
| `debt_context` | structured Intent | 已实现 | context / ML |
| `investment_target` | Object / Entity Resolver | 高精度已实现 | Entity Typing / context / ML |
| `position_context` | structured Intent | 已实现 | context / ML |
| `employment_income_context` | structured Intent | 已实现 | context / ML |
| `bonus_context` | structured Intent | 已实现 | context / ML |
| `delivery_context` | structured Intent | 已实现 | context / ML |
| `delivery_target` | Object / Entity Resolver | 高精度已实现 | Entity Typing / context / ML |
| `purchase_context` | structured Intent | 已实现 | context / ML |
| `purchase_object` | Object / Entity Resolver | 高精度已实现 | Entity Typing / context / ML |
| `specific_counterpart` | Participant Resolver | 已实现 | Intent / context / ML |
| `marriage_proposal_context` | structured Intent | 已实现 | context / ML |
| `existing_marriage_context` | structured Intent / spouse participant | 已实现 | context / ML |

这里的 “structured Intent” 只能消费已经由上游独立建立的 Intent 事实，不能把当前 candidate route 直接写回 Intent，再借此自动满足 requirement；否则会形成循环论证。

## 4. 当前已实现 Provider

### 4.1 Participant Resolver

优先复用现有 `liuyao-participant-resolver.js`。当前主要提供：

- `specific_counterpart`
- spouse participant 对 `existing_marriage_context` 的支持

裸 `他 / 她 / 我们 / 对方` 不直接视为已完成特定对象解析。

### 4.2 Structured Intent

可以从明确结构化字段提供：

- `financial_scope`
- `business_context`
- `borrowing_context`
- `debt_context`
- `position_context`
- `employment_income_context`
- `bonus_context`
- `delivery_context`
- `purchase_context`
- `marriage_proposal_context`
- `existing_marriage_context`

若未来 `DivinationIntent.object` 或 semantics 中存在真实对象字段，也可以提供 `investment_target / delivery_target / purchase_object`。

**仅有 `event = investment` 不得自动制造 `investment_target`。** 这是防止“route 本身就是证据”的循环。

### 4.3 Object / Entity Resolver

`liuyao-object-entity-resolver.js` 负责高精度确认当前问题中确实存在显式现实对象，并只绑定三个对象型 slot：

- `investment_target`
- `delivery_target`
- `purchase_object`

它不决定现代事件 route，也不会因为 candidate route 是投资/购买/收货，就反向制造对象。

明确投资实体词、ticker/code 或投资动作直接支配的对象可作为高精度 `investment_target`；无类型证据的裸公司/品牌专名保守留给 Entity Typing。

### 4.4 Explicit Context

上游上下文/共指层可以显式传入 context slot，但只接受当前 route 在 Requirement Matrix 中声明为 `contextRecoverable` 的 slot。

无关 slot 会被记录为 `context_not_recoverable_for_route`，不会进入最终 resolved slots。

### 4.5 Entity Typing fallback

`liuyao-entity-typing-adapter.js` 只在高精度 Object Resolver 尚未解决对象 slot 时消费 Entity Typing 结果。当前 PoC 类型为：

```text
investment_asset
purchasable_item
delivery_subject
unknown
```

Entity Typing 的输入是 `entity + current context`，而不是实体名称词典。它只负责对象角色，不负责 `purchase_context / delivery_context` 等事件语境。

#### Acceptance ownership

Entity Typing 模型自己使用独立 Validation 校准：

```text
class-specific score threshold
+
minimum route margin
→ prediction.accepted
```

因此 Slot Provider **不得在 `prediction.accepted === true` 之后再叠加一个固定全局 confidence floor**。例如：

```text
investment_asset score = 0.635
class threshold = 0.327
margin = 0.499
accepted = true
```

即使 `0.635 < 0.65`，也允许进入 Entity Typing provider；旧的固定 `0.65` 二次门槛已经取消。

Entity Typing claim 仍必须同时满足：

1. `prediction.accepted === true`；
2. prediction 对应当前问题实际抽出的 entity candidate；
3. prediction type 与 candidate route 所要求的对象类型兼容；
4. 更高优先级的当前问题对象 slot 尚未解决；
5. `unknown` 永远不补对象 slot。

如果 Entity Typing 因自身 threshold 或 margin 未通过而返回 `accepted=false`，Provider 记录 `typing_not_accepted` 并保持 unresolved。

### 4.6 Generic ML multi-label provider 接口

通用 multi-label slot 接口仍保留，例如：

```ts
{
  id: 'purchase_object',
  value: '这台电脑',
  confidence: 0.91,
  modelId: 'future-object-head'
}
```

这个 generic provider 与 Entity Typing 不同：它尚无自己的 class-specific calibrated acceptance，因此默认 `confidence < 0.75` 的 generic ML claim 仍不进入 resolver，并以 `below_confidence_floor` 记录。

不要把 generic ML 的 `0.75` 规则套用到已经自行校准的 Entity Typing provider。

## 5. 合并与冲突规则

`resolveSemanticSlots()` 不采用“最后写入覆盖前值”。

### 5.1 当前问题优先于旧上下文

若当前问题已经明确解析出对象，而历史 context 中仍保留旧对象：

```text
question: 基金A
context: 股票B
```

使用当前问题值，并把旧 context 记录为 `current_question_supersedes_context`。

### 5.2 同一 question scope 的实体冲突不得静默解决

例如两个上游 Provider 同时声称：

```text
purchase_object = 电脑A
purchase_object = 电脑B
```

则该 slot 不进入 `resolvedSlots`，同时返回 `conflicts[]`。

Semantic Sufficiency 随后会因缺少可靠 slot 而保持保守。

### 5.3 同值多来源合并

如果多个 Provider 对同一个值达成一致，不制造冲突；选取优先级更高的 claim 作为主 provenance，同时保留 `supportingProviders`。

## 6. Provider 优先关系

语义职责上的优先顺序为：

```text
Participant Resolver / Structured Intent
→ High-precision Object / Entity Resolver
→ Entity Typing fallback
→ Explicit Context recovery
→ Generic ML multi-label fallback
```

实际合并时，`sourceScope` 仍优先于 provider：当前 question 的明确事实优先于旧 context。

优先级只用于同值支持或 question/context 取舍；同一 question scope 的不同实体值不会因为分数高一点而强行覆盖。

## 7. resolveSemanticSlots() 输出

```ts
interface SemanticSlotResolution {
  version: '0.1'
  routeId: string
  claims: SemanticSlotClaim[]
  resolvedSlots: SemanticSlot[]
  questionSlots: SemanticSlot[]
  contextSlots: SemanticSlot[]
  conflicts: SemanticSlotConflict[]
  superseded: SemanticSlotSuperseded[]
  ignoredClaims: SemanticSlotIgnoredClaim[]
  providerRuns: ProviderRunSummary[]
}
```

每个 resolved slot 至少保留：

- `providerId`
- `confidence`
- `provenance`
- `sourceScope`
- `supportingProviders`

Entity Typing provenance 额外保留：

- `modelId`
- `type`
- `score`
- `margin`
- `threshold`
- `accepted`
- `acceptancePolicy = provider_calibrated`

因此后续 `semantic_insufficient` 不只是“缺东西”，还能回答“哪些上游已经提供了什么、哪些模型决策未通过、哪些证据冲突、哪些 context 被拒绝”。

## 8. v0.1 明确不做的事

- 不把 `extractExplicitSlots()` 升级成正式关键词 NLP；
- 不让 candidate route 自己制造 required slot；
- 不修改已经冻结的 Semantic Router v0.1；
- 不修改 `DivinationIntent v0.1` 合同；
- 不接六亲、世应或 Rule Registry；
- 不修改时间引擎；
- Entity Typing 仍是独立 PoC，不直接接正式首页。

下一阶段应先验证 Entity Typing 的上下文敏感泛化能力，再决定是否冻结并导出静态权重；`purchase_context / delivery_context` 等事件语境继续由上游 Semantic Parser / Intent 层承担，不转嫁给对象角色模型。
