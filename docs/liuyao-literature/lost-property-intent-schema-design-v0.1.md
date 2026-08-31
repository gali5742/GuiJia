# 龟甲 · 六爻 Lost Property Intent / Event Schema Design v0.1

日期：2026-08-31

状态：`design_only_ready`

主题：`lost_property`

上游：

- `lost-property-research-v1.0.md` — `completed_and_reviewed`
- `lost-property-rule-candidates-v0.1.md` — `ready_for_rule_review`
- `lost-property-rule-review-v0.1.md` — Observation Rule 结构审计完成

> 本文件只定义未来 Schema Contract。当前不得修改 `js/liuyao-intent.js`、当前 22-route inventory、Semantic Candidate、训练 / 校准 / blind 数据。原因是当前 Semantic v0.13 / 22-route Baseline 仍需保持冻结边界；文学研究完成只解除“研究 gate”，并不自动授权 route promotion。

---

# 1. 当前正式 Intent Contract 审计

当前 `js/liuyao-intent.js` 输出核心结构为：

```js
{
  version: '0.1',
  rawQuestion,
  status,
  blockReason?,
  goals: [{ type }],
  event: { type },
  participants: [],
  targetTime,
  expectedState,
  confidence,
  ambiguities: [],
  semantics: { ... }
}
```

现有 Event detector 只覆盖当前已登记主题；`lost_property` 尚不存在。

当前 Rule Registry 匹配主要读取：

```text
intent.event.type
intent.goals[0].type
intent.expectedState
intent.semantics.*
intent.participants
```

因此未来 `lost_property` 应尽量沿用这一公共 Contract，而不是另造一套平行 Intent 对象。

---

# 2. 目标职责

Semantic / Intent 层只回答现代语言问题：

```text
用户是不是在问“已经丢失的无生命物品”？
具体丢了什么？
问的是能否找回、在哪里，还是二者兼有？
是否已经确认遗失，而不是仍在物流途中？
对象是否为动物 / 人员等排除类型？
```

它绝对不回答：

```text
这个物品应该取妻财还是父母？
用神是哪一爻？
世应如何？
```

即：

```text
Modern Semantic Object
≠
Traditional Observation Object
```

---

# 3. Event Schema

未来 Event：

```ts
event: {
  type: 'lost_property'
}
```

Event 成立的硬条件：

1. 用户当前目标针对某个具体无生命对象；
2. 语义已经表达“丢失 / 遗失 / 找不到 / 不见”等 loss state；
3. 当前目标不是运输状态、购买、投资收益、债务等其他已登记 route；
4. 不是动物或人员走失。

## 3.1 Loss State

建议新增：

```ts
semantics.lossState:
  | 'confirmed_lost'
  | 'possibly_misplaced'
  | 'delivery_unknown'
  | 'unknown'
```

解释：

### confirmed_lost

用户已经把对象视为遗失：

```text
手机丢了
钱包遗失了
证件不见了
钥匙掉了
```

### possibly_misplaced

更像近场找不到，但仍可作为失物问题：

```text
钥匙找不到了，不知道放哪儿了
戒指不知道落在哪儿了
```

### delivery_unknown

```text
快递怎么还没到
包裹现在在哪里
```

这种状态必须阻止 `lost_property`，继续由 `receive_item` 负责。

### unknown

语义不足，不能仅凭实体名称推 loss event。

---

# 4. Goal Schema

失物研究已经证明 Recovery 与 Location 是不同职责，但共享同一 Primary Object。

未来 Goal 不应沿用当前只支持一个通用：

```js
goals: [{ type:'outcome' }]
```

来丢失失物专项语义。

建议在 `lost_property` Event 下允许：

```ts
goals: Array<
  | { type:'recovery' }
  | { type:'location' }
>
```

允许同一问题包含两个兼容目标：

```text
手机丢在哪里了，还能找回来吗？
```

输出：

```js
goals: [
  { type:'location' },
  { type:'recovery' }
]
```

这不是当前系统意义上的 `multiple_goals` blocker，因为二者：

```text
共享同一 lost object
共享同一 Event
共享同一 Primary Observation
```

只是在 Assessment 层分流。

## 4.1 Goal detection 语义

### recovery

典型表达：

```text
还能找到吗
找得回来吗
能不能找回
会不会找回来
还有机会找到吗
```

### location

典型表达：

```text
在哪里
丢哪儿了
落在哪里
可能在什么地方
```

### 兼容

出现两组信号时同时保留，不互斥。

---

# 5. Lost Object Slot

建议新增顶层对象，而不是继续把对象属性全部塞进 `semantics`：

```ts
lostObject: {
  text: string
  entityType: string
  animacy: 'inanimate' | 'animal' | 'human' | 'unknown'
  specificity: 'specific' | 'generic' | 'unknown'
  modernFunctionHints: string[]
  traditionalClassHint?:
    | 'generic_property'
    | 'document_credential'
    | 'vehicle_clothing'
    | 'unresolved'
  traditionalClassHintStatus?:
    | 'supported'
    | 'conflicted'
    | 'unresolved'
}
```

关键原则：`traditionalClassHint` 不是六亲，也不是 NLP 的自由推断结果。

它只能来自**经过审核的 Object Semantic Provider / deterministic contract**，供后续 Resolver 使用。

更严格地说，第一版正式实现甚至可以只提供：

```ts
lostObject: {
  text,
  entityType,
  animacy,
  specificity,
  modernFunctionHints
}
```

由独立 `PRR-LOST-PROPERTY-OBJECT` 再判断传统类。

---

# 6. Object Entity Type 与 Traditional Class 分离

未来允许：

```text
entityType = phone
entityType = key
entityType = ring
entityType = document
entityType = vehicle
entityType = clothing
entityType = cash
entityType = computer
entityType = bank_card
entityType = storage_device
entityType = generic_object
```

但绝对禁止：

```text
phone → 父母
phone → 妻财
```

直接在 Semantic Provider 中发生。

文献研究已经证明手机在朱辰彬 / 王虎应体系存在直接冲突，因此：

```js
{
  entityType: 'phone',
  traditionalClassHintStatus: 'conflicted'
}
```

是合法结果。

Resolver 必须允许 abstain。

---

# 7. Animacy Boundary

`lost_property` 的强制 Semantic Gate：

```ts
lostObject.animacy === 'inanimate'
```

若：

```text
animal
human
unknown 且疑似有生命对象
```

不得进入 lost_property 正式传统规则。

例如：

```text
猫跑丢了还能回来吗
狗走失了
孩子找不到了
朋友失踪了
```

全部不属于该 Event。

注意：这是现代产品 / route 边界，不是“古籍没有动物失物规则”。古籍反而明确有六畜、飞禽走兽取子孙；本项目是主动不把它并入 `lost_property`。

---

# 8. Specificity Requirement

建议：

```ts
specificity = 'specific'
```

作为 Sufficiency 必需条件。

可接受：

```text
我的手机丢了
刚才那把钥匙找不到了
身份证不见了
```

不足：

```text
东西丢了怎么办
失物能找到吗
```

后者可能识别 Event，但 Object Resolver 缺少有效 lost object，应阻断 Traditional Observation Selection。

这与“默认妻财”不同：

```text
没有说明是什么东西
```

并不等于：

```text
已经确认是 generic_property
```

---

# 9. Minimal Sufficiency Contract

未来 `lost_property` 至少需要：

```ts
{
  eventType: 'lost_property',
  lossState: 'confirmed_lost' | 'possibly_misplaced',
  lostObject: {
    animacy: 'inanimate',
    specificity: 'specific',
    entityType: string
  },
  goals: ['recovery' | 'location', ...]
}
```

## 9.1 Route sufficient but Rule insufficient

一个重要的新状态必须允许存在：

```text
Semantic Route = resolved
Traditional Object Resolution = unresolved
```

例如：

```text
我的手机丢了，还能找到吗？
```

可以非常确定：

```js
event.type = 'lost_property'
goals = [{ type:'recovery' }]
lostObject.entityType = 'phone'
```

但传统层可能：

```text
PRR-LOST-PROPERTY-OBJECT
→ conflicted
```

此时不能把 Semantic Route 回退成 unknown，也不能为了继续跑规则而猜六亲。

---

# 10. Proposed Intent Examples

## Example A：现金

输入：

```text
钱包里的现金掉了，还能找回来吗？
```

未来 Intent：

```js
{
  status:'resolved',
  event:{ type:'lost_property' },
  goals:[{ type:'recovery' }],
  lostObject:{
    text:'现金',
    entityType:'cash',
    animacy:'inanimate',
    specificity:'specific',
    modernFunctionHints:['property_value']
  },
  semantics:{ lossState:'confirmed_lost' }
}
```

传统六亲不出现在 Intent。

---

## Example B：身份证

```text
身份证找不到了，可能落在哪里？
```

```js
{
  event:{ type:'lost_property' },
  goals:[{ type:'location' }],
  lostObject:{
    text:'身份证',
    entityType:'credential_document',
    animacy:'inanimate',
    specificity:'specific',
    modernFunctionHints:['identity_credential','document']
  },
  semantics:{ lossState:'possibly_misplaced' }
}
```

后续 Resolver 可基于审核后的 traditional class mapping 取父母，但 Intent 本身不写父母。

---

## Example C：手机，双目标

```text
手机丢在哪里了，还能找到吗？
```

```js
{
  event:{ type:'lost_property' },
  goals:[
    { type:'location' },
    { type:'recovery' }
  ],
  lostObject:{
    text:'手机',
    entityType:'phone',
    animacy:'inanimate',
    specificity:'specific',
    modernFunctionHints:['communication_device','daily_use_object']
  },
  semantics:{ lossState:'confirmed_lost' }
}
```

Semantic 层完成。

Traditional Resolver：

```text
conflicted / abstain
```

不能把 Intent 改回 unresolved。

---

## Example D：物流边界

```text
我的手机快递怎么还没到，现在在哪里？
```

不得输出 lost_property。

应该继续：

```text
receive_item
```

“在哪里”不等于失物 location。

---

## Example E：动物边界

```text
猫走丢了还能回来吗？
```

不得进入 `lost_property`。

即使古籍存在动物走失传统规则，本项目该 Event 明确只收无生命财物。

---

# 11. Collision Requirements

未来 Semantic Expansion 必须重点建立以下 near-domain negatives：

```text
lost_property vs receive_item
lost_property vs item_purchase
lost_property vs debt_collection
lost_property vs investment/finance
lost_property vs future study_exam
lost_property vs animal/missing-person
```

尤其：

```text
“在哪里”
```

只是 Goal cue，不是 Event cue。

以下问题都可能出现“在哪里”：

- 快递在哪里；
- 手机丢在哪里；
- 某人在哪里；

不能依靠 location wording 选择 lost_property。

---

# 12. Current `detectMultipleGoals` Compatibility Risk

当前 `liuyao-intent.js` 把多个高层 Event 的并列视作 blocker，同时当前 Intent 通常只有一个 `goals[0]` 被 Rule Registry 匹配。

失物提出第一个明确需求：

```text
同一 Event 下的 compatible multi-goal
```

即：

```text
recovery + location
```

未来实现时不得复用当前 `multiple_goals` 阻断逻辑把二者误杀。

更长期建议区分：

```text
multiple_events
vs
compatible_goals_within_one_event
```

当前阶段只记录 contract，不修改现行 parser。

---

# 13. Expected State

`lost_property` 不建议主要依赖当前单值 `expectedState` 驱动规则。

如果为兼容现有 Intent Contract 保留，可定义：

```text
recovery → recovered
location → located
```

但双目标时单值 `expectedState` 无法完整表达。

因此未来最好让：

```text
goals[]
```

承担实际 Assessment 分流，`expectedState` 只作为兼容字段，不作为失物 Observation Rule 的核心匹配条件。

---

# 14. Formal Schema Draft

建议未来扩展类型：

```ts
interface LostPropertyIntentExtension {
  event: {
    type: 'lost_property'
  }

  goals: Array<
    | { type: 'recovery' }
    | { type: 'location' }
  >

  lostObject: {
    text: string
    entityType: string
    animacy: 'inanimate' | 'animal' | 'human' | 'unknown'
    specificity: 'specific' | 'generic' | 'unknown'
    modernFunctionHints: string[]
  }

  semantics: ExistingSemantics & {
    lossState:
      | 'confirmed_lost'
      | 'possibly_misplaced'
      | 'delivery_unknown'
      | 'unknown'
  }
}
```

最重要的缺席字段是：

```text
sixRelative
useGod
shi
 ying
```

它们必须继续缺席。

---

# 15. Schema Review Result

## Approved for future implementation

```text
event.type = lost_property
lossState
lostObject.text
lostObject.entityType
lostObject.animacy
lostObject.specificity
lostObject.modernFunctionHints
goals = recovery / location / both
```

## Explicitly rejected

```text
Intent 中直接存 妻财 / 父母
entityType 直接映射六亲
unknown object 自动当 generic_property
phone 自动判父母或妻财
把 recovery + location 当 multiple_goals blocker
把“在哪里”单独作为 lost_property Event cue
```

---

# 16. Promotion Gate

当前：

```text
literatureResearch = completed_and_reviewed
ruleReview = complete
intentSchemaDesign = design_only_ready
formalIntentImplementation = blocked_by_current_semantic_baseline
formalRuleRegistryImplementation = blocked_by_current_semantic_baseline
semanticTraining = false
currentRoute = false
```

当 Semantic 主线允许扩充 next themes 时，执行顺序必须是：

```text
1. Promote Lost Property Event Schema
2. Implement Object / Slot extraction
3. Implement Sufficiency checks
4. Implement PRR-LOST-PROPERTY-OBJECT
5. Register Base Observation Rule
6. Implement Recovery / Location downstream evidence layers
7. Build Router / Routeability / Identity training and eval corpus
8. Run frozen current-22 regression
9. Only then consider current route promotion
```

不得因为本设计已经 ready 就跳过前四步直接写 Rule Registry。
