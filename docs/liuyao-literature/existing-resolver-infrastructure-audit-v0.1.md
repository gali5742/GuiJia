# 龟甲 · 六爻 Existing Resolver Infrastructure Audit v0.1

日期：2026-09-01

状态：`audit_complete_extension_contract_ready`

配套机器契约：

```text
data/liuyao-resolver-extension-contract-v0.1.json
```

范围：审计当前分支已经存在的现代语义 Resolver / Slot Provider / Arbitration，并确定 next-topic 的正确扩展位置。

> 本文件不修改 current-22 runtime。结论的核心是：已有基础设施应被扩展，而不是为新主题另建一套平行 participant/entity parser。

---

# 1. 审计发现

当前分支已经存在：

```text
js/liuyao-participant-resolver.js
js/liuyao-object-entity-resolver.js
js/liuyao-entity-typing-adapter.js
js/liuyao-contextual-object-role-adapter.js
js/liuyao-resolver-role-arbitration.js
js/liuyao-semantic-slot-provider.js
js/liuyao-semantic-sufficiency.js
js/liuyao-rule-registry.js
```

所以原本设想：

```text
新建 Shared Participant Resolver
新建 Shared Object Resolver
```

如果直接执行，会产生两套互相竞争的语义事实来源。

正确方向改为：

```text
保留 current runtime
↓
抽象已有模块的可复用 contract
↓
未来 expansion 建 registered provider pipeline
↓
next-topic PRR 位于现代语义事实之后
```

---

# 2. `liuyao-participant-resolver.js`

虽然文件名是通用 Participant Resolver，但当前实现实际高度聚焦：

```text
relationship_development
```

主要处理：

```text
querent sex
counterpart sex
specific romantic counterpart
friend / partner relation hints
```

并通过：

```text
refineDivinationIntent
```

重新包装：

```text
GuiJia.liuyaoIntent.parseDivinationIntent
```

### 可以复用的东西

```text
participant specificity
relationToQuerent
明确参与者与裸代词分离
participant provenance
```

### 不能直接拿来做的事情

不能简单在同一个实现中继续塞：

```text
parent / child / spouse
litigant / counterparty
traveler
contact actor
reviewer
controller
```

直到它被正式版本化为通用 participant fact provider。

### 最大风险

当前实现属于：

```text
Intent wrapper
```

如果未来每个主题都用同样方式包装 `parseDivinationIntent`，会形成隐式加载顺序。

因此 next-topic 不应继续复制这种 wrapper pattern。

---

# 3. `liuyao-object-entity-resolver.js`

该模块并不是“传统物件取用 Resolver”。

它的职责是：

```text
从现代问句抽取显式 referent candidate
↓
按 current route 绑定 semantic target slot
```

当前 route-slot 主要是：

```text
investment_* → investment_target
receive_item → delivery_target
item_purchase → purchase_object
```

其原则本身非常正确：

```text
只证明现实对象存在
不决定 route
不决定六亲
```

这正是未来：

```text
lost object
education institution
employer
certificate
review authority
```

应该复用的上游职责。

但当前：

```text
ROUTE_SLOT
```

仍是 current-22 硬编码，所以不能直接承担 next-topic 扩展。

---

# 4. `liuyao-entity-typing-adapter.js`

当前 Entity Typing 支持：

```text
investment_asset
purchasable_item
delivery_subject
```

并强调：

```text
Entity Typing 有自己的 calibrated accepted / rejected decision
Slot Provider 不再加第二个全局 confidence threshold
```

这个 acceptance contract 很值得保留。

### 未来扩展原则

可以继续出现：

```text
education_institution
employment_organization
academic_document
credential_document
transport_subject
lost_object_candidate
person_or_agent
```

等现代 Entity Type。

但是：

```text
entityType = education_institution
```

绝不能直接输出：

```text
父母 / 应
```

传统选择必须继续留到 PRR / Observation 层。

---

# 5. `liuyao-contextual-object-role-adapter.js`

这是当前最有价值的 future extension seam。

其设计已经明确：

```text
Object Candidate
+
Contextual Object Role Prediction
↓
Semantic Slot Claim
```

并支持：

```text
no_supported_role
```

也就是说模型可以明确拒绝把某个实体当当前 route target。

当前 role：

```text
investment_target_role
purchase_target_role
delivery_target_role
```

future 可以沿同一思想扩展现代角色，例如：

```text
education_target_role
employer_target_role
review_authority_role
travel_transport_role
lost_object_role
contact_actor_role
```

但必须仍然是：

```text
modern contextual role
```

不是六亲角色。

---

# 6. `liuyao-resolver-role-arbitration.js`

当前 Arbitration 已具备几个很成熟的思想：

```text
structured intent priority
explicit no-role veto
accepted role can refine deterministic candidate boundary
resolver / role disagreement becomes explicit conflict
multiple accepted candidates become conflict
```

这些原则应该成为 future registered provider pipeline 的基础。

尤其：

```text
explicit_no_supported_role
```

已经是可靠 abstention 的正式先例。

这与后续：

```text
phone → conflicted
institution → unresolved
represented counterparty → unresolved
```

的设计方向一致。

---

# 7. 当前 Provider 链的结构风险

现有几个 Adapter 都采用类似：

```js
const baseProvider = GuiJia.liuyaoSemanticSlotProvider;
...
GuiJia.liuyaoSemanticSlotProvider = Object.freeze({
  ...baseProvider,
  resolveSemanticSlots,
  evaluateWithProviders
});
```

这相当于：

```text
Provider A
↓ wrap
Provider B
↓ wrap
Provider C
↓ wrap
Arbitration
```

### 当前问题

它依赖：

```text
script load order
```

而不是显式：

```text
provider registry
```

current-22 已经有 regression 约束，因此现在不应贸然重构。

但是如果 next-topic 再增加：

```text
career provider
study provider
travel provider
litigation provider
person-contact provider
```

继续 wrapper 会形成明显维护风险。

因此 machine contract 已明确：

```text
doNotAddMoreDecoratorWrappersForNextTopics = true
```

未来 expansion 应做版本化：

```text
Registered Provider Pipeline
```

---

# 8. `liuyao-semantic-slot-provider.js` 已经提供的好基础

当前 Slot Provider 有：

```text
providerId
sourceScope
confidence
provenance
provider priority
question > context
explicit conflicts
superseded context
```

这些都应该保留。

真正需要调整的是“怎么登记 provider”，而不是推翻 mergeClaims 思想。

未来推荐：

```ts
ProviderRegistration {
  providerId,
  version,
  layer,
  consumes,
  emits,
  scope,
  priority,
  conflictPolicy
}
```

由 orchestrator 明确排序，而不是靠脚本加载顺序。

---

# 9. `liuyao-semantic-sufficiency.js` 的边界

当前：

```text
SLOT_SCHEMA
ROUTE_REQUIREMENTS
```

都围绕 current-22。

这也是正确的 frozen baseline。

新主题以后不能在 gate 未开放时直接把：

```text
study_subject
education_institution
travel_subject
litigation_party
```

塞进现有 schema。

应先在 design-only extension schema 中审核，等 expansion version 再合入正式 Sufficiency。

---

# 10. 现代 Resolver 与传统 PRR 不是同一个层

这是此次审计最重要的命名边界。

当前 Rule Registry 已经允许：

```text
selector.kind = resolver
resolverRef = PRR-...
```

例如 represented marriage。

这里的：

```text
PRR
```

属于**Traditional Observation Selector Resolver**。

它应消费：

```text
已经解析好的现代 participant/entity facts
+
reviewed evidence
```

然后才输出：

```text
世
应
父母
官鬼
妻财
兄弟
子孙
```

相反：

```text
liuyao-participant-resolver.js
liuyao-object-entity-resolver.js
entity typing
contextual object role
```

属于**Modern Semantic Resolver**。

两层绝不能混合。

---

# 11. Future Participant Fact Contract

建议统一现代人物事实为：

```text
participantId
relationToQuerent
semanticRoles
specificity
representationMode
controlRole
sourceRefs
```

例如：

```text
我替父亲问官司
```

现代层只应得到：

```text
relationToQuerent = parent
semanticRole = actual_litigant
representationMode = proxy_uncontrolled / unknown
```

然后：

```text
PRR-DISPUTE-PARTICIPANT
```

才根据传统规则产生：

```text
父母 candidate
```

不能让现代 Participant Resolver 直接输出父母。

---

# 12. Future Entity / Authority Contract

现代学校、导师、法院、公司等往往同时包含：

```text
Entity Type
Contextual Role
Authority Action
```

因此建议：

```text
EntityFact
+
AuthorityFact
```

分开。

例如：

```text
A大学
```

可能是：

```text
entityType = education_institution
contextualRole = target_institution
authorityRole = admission_decision_body
```

传统层再由：

```text
PRR-EDUCATION-INSTITUTION
```

决定：

```text
父母类象？
应 contextual role？
两层同时保留？
conflicted？
```

同样适用于：

```text
导师
review committee
法院
employer
issuing authority
```

---

# 13. Lost Property 如何接现有 Object Infrastructure

之前失物 Modern Object Function Resolver 已经提出：

```text
Modern Entity Identity
≠
Modern Function Context
≠
Traditional Object Class
```

本次审计确认这个设计应直接接在现有 Object/Entity layer 后面。

未来链：

```text
object/entity candidate
↓
entity typing
↓
function/contextual role fact
↓
PRR-LOST-PROPERTY-OBJECT
↓
resolved / conflicted / unresolved traditional selector
```

不能再写第二套从 raw question 开始识别“手机 / 银行卡 / 电脑”的 parser。

---

# 14. Recommended Expansion Architecture

```text
Modern Intent
↓
Candidate Extraction
↓
Participant / Entity / Role / Function Fact Providers
↓
Registered Claim Arbitration
↓
Semantic Sufficiency
↓
Traditional PRR Resolvers
↓
ObservationPlan
↓
Evidence
↓
Assessment
```

其中：

```text
route selection
```

只发生在现代 Semantic 层。

```text
六亲 / 世应 selection
```

只发生在 Traditional PRR / Observation 层。

---

# 15. 当前不做的 Runtime 修改

本次明确不修改：

```text
liuyao-participant-resolver.js
liuyao-object-entity-resolver.js
liuyao-entity-typing-adapter.js
liuyao-contextual-object-role-adapter.js
liuyao-resolver-role-arbitration.js
liuyao-semantic-slot-provider.js
liuyao-semantic-sufficiency.js
liuyao-rule-registry.js
```

原因：

```text
current-22 frozen
v0.13 parallel development active
next-topic boundary design-only
```

---

# 16. 下一步

现在可以安全进入第四阶段：

```text
把最近新增的 residual research/design
→ isolated unreachable contracts
→ specialized regression
```

这些 isolated module 应直接接受**结构化 modern facts**作为输入，而不是重新解析 raw question。

这样未来真正接入 registered provider pipeline 时，只替换上游 provider，不需要重写传统 resolver。

---

# 17. 最终结论

当前龟甲并不是“没有共享 Resolver”。

更准确地说：

```text
已经存在一套 current-22 resolver/provider chain
但它的 domain inventory 和 orchestration 仍是冻结版、route-specific、load-order-decorated
```

所以 next-topic 的正确工作不是再造第二套，而是：

```text
保留现有语义事实模式
+
版本化 provider registration
+
在其下游建立传统 PRR
```

这能同时避免语义重复解析、传统规则泄漏和加载顺序失控。
