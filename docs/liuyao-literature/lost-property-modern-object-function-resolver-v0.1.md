# 龟甲 · 六爻失物 Modern Object Function Resolver v0.1

日期：2026-09-01

状态：`design_only_ready`

主题：`lost_property`

上游：

- `lost-property-research-v1.0.md`
- `lost-property-rule-review-v0.1.md`
- `lost-property-intent-schema-design-v0.1.md`

> 本文件不尝试给所有现代物件确定唯一六亲。目标是把现代实体身份、现实功能与传统观察类别拆开，并正式定义 `resolved / conflicted / unresolved`。

---

# 1. 当前仓库接口审计

当前正式 `js/liuyao-intent.js` 仍主要按 route 维护语义字段，没有可直接调用的通用：

```text
entityType provider
contextual object function provider
```

因此本 Resolver **不得重新解析原始问句**，也不复用投资 / 购买 / 收货等业务角色标签冒充失物功能。

本阶段只消费未来上游对象层或 `lostObject` 已经提供的现代实体 / 功能信息。

未来若通用 Entity Typing 层正式接入，只需要替换输入提供者，不应改写 Traditional Resolver。

---

# 2. 三层强制分离

```text
Modern Entity Identity
≠
Modern Function Role
≠
Traditional Observation Class
```

例如：

```text
entity = phone
function = communication_device / general_possession
```

不自动推出：

```text
父母
或
妻财
```

因为现有现代作者之间存在直接冲突。

---

# 3. Semantic Object Function Contract

建议输入：

```ts
lostObject: {
  entityType: string
  animacy: 'inanimate' | 'animal' | 'human' | 'unknown'
  specificity: 'specific' | 'generic' | 'unknown'
  primaryFunction:
    | 'general_possession'
    | 'document_or_credential'
    | 'vehicle_or_transport'
    | 'clothing_or_wearable'
    | 'communication_device'
    | 'information_carrier'
    | 'access_or_control_token'
    | 'store_of_value'
    | 'payment_or_account_access'
    | 'work_tool'
    | 'unknown'
  secondaryFunctions?: string[]
  valueRole?:
    | 'ordinary_use'
    | 'store_of_value'
    | 'credential_access'
    | 'work_critical'
    | 'unknown'
  physicality?: 'physical' | 'digital' | 'hybrid' | 'unknown'
}
```

这些全部是现代现实语义，不包含传统 selector。

---

# 4. Stable Direct Classes

只有上游已经明确分类到稳定传统连续类别时，首轮可直接解析：

```text
generic_property     → 妻财 / stable_consensus
document_credential  → 父母 / stable_consensus
vehicle              → 父母 / cross_source_compatible_to_stable
clothing             → 父母 / cross_source_compatible_to_stable
```

关键限制：

```text
entityType = unknown
+
primaryFunction = general_possession
```

不得推成：

```text
entityType = generic_property
```

同样，已知高风险现代实体也不能被 `general_possession` 覆盖。

---

# 5. Known Ambiguous Modern Objects

## 5.1 Phone

现有研究：

```text
朱辰彬体系 → 父母类象可成立
王虎应失物案例 → 妻财
```

因此无论：

```text
communication_device
general_possession
information_carrier
```

当前都必须：

```text
status = conflicted
```

功能信息只帮助解释冲突，不得消灭已知跨作者冲突。

## 5.2 Key

朱辰彬钥匙案例支持父母，但仍属 school-specific。

```text
status = unresolved
provenanceStatus = school_specific
candidate = 父母
```

`access_or_control_token` 是现代功能描述，不足以把作者案例升级为稳定传统规则。

## 5.3 Ring

现有现代方法论明确显示：

```text
日常佩戴
→ 父母 candidate

收藏 / 保值
→ 妻财 candidate
```

但来源仍主要是单一现代体系，所以：

```text
status = unresolved
provenanceStatus = school_specific
```

即使功能已经清楚，也不能伪装成跨来源定论。

## 5.4 Bank Card

功能可能同时涉及：

```text
payment_or_account_access
credential access
property / money access
```

当前：

```text
status = unresolved
provenanceStatus = insufficient_evidence
```

## 5.5 Computer / USB / Disk

可能同时是：

```text
work_tool
information_carrier
general possession
high-value property
```

没有足够直接传统连续性与跨作者现代证据形成稳定 selector。

继续 `unresolved`。

## 5.6 Cloud Data

纯数字对象没有足够直接传统连续性：

```text
status = unresolved
```

不得因为“文件”两个字机械映射父母。

---

# 6. Resolver Output Contract

```ts
{
  status: 'resolved' | 'conflicted' | 'unresolved'
  entityType: string
  functions: string[]
  traditionalClass?: string
  selector?: { type:'six_relative', value:string }
  traditionalClassCandidates: Array<{
    traditionalClass: string
    selector?: object
    support: string
    evidenceRefs: string[]
  }>
  provenanceStatus:
    | 'stable_consensus'
    | 'cross_source_compatible_to_stable'
    | 'school_specific'
    | 'conflicted'
    | 'insufficient_evidence'
    | 'insufficient_semantic_context'
  evidenceRefs: string[]
  issues: object[]
}
```

只有：

```text
status = resolved
```

才允许进入正式 Lost Property Primary selector。

---

# 7. 合法 Partial State

必须正式支持：

```text
Semantic Lost Property = sufficient
Traditional Object Resolution = unresolved / conflicted
```

例如：

```text
“电脑丢了，还能找回来吗？”
```

可以得到：

```text
lost_property 已识别
recovery goal 已识别
computer 已识别
Traditional Object = unresolved
```

这不是系统失败，而是合法 abstention。

---

# 8. Function Role 的职责边界

Function Role 只用于：

1. 解释现代对象的现实用途；
2. 对 school-specific / conflicted 映射保留上下文；
3. 避免同一实体在不同用途下被错误压平。

它**不**提供一张新的：

```text
function → 六亲
```

硬编码表。

例如：

```text
store_of_value
```

不能全局推出妻财；只有特定实体 + 来源证据组合时，才可成为 candidate evidence。

---

# 9. Explicit Non-Candidates

```text
phone + communication → 父母
phone + possession → 妻财
key + access token → 父母
ring + wearable → 父母作为稳定通则
ring + store value → 妻财作为稳定通则
bank card + payment → 妻财
computer + work tool → 父母
USB / disk + information → 父母
cloud data + file → 父母
unknown + possession → generic_property
```

全部禁止。

---

# 10. 当前结论

失物现代对象深化后的目标不是“把红色对象全部补绿”，而是：

```text
Entity Identity
↓
Function Context
↓
Source-aware Traditional Resolver
↓
resolved / conflicted / unresolved
```

因此：

```text
modernObjectFunctionResolverDesign = ready_v0.1
forcedCoverage = forbidden
formalIntegration = blocked
semanticTraining = false
currentRoute = false
```
