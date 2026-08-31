# 龟甲 · 六爻失物 Rule Review v0.1

日期：2026-08-31

状态：`rule_review_complete`

输入：

- `docs/liuyao-literature/lost-property-research-v1.0.md`
- `docs/liuyao-literature/lost-property-rule-candidates-v0.1.md`
- `js/liuyao-rule-registry.js`
- 《龟甲 · 六爻复合观察与取用规则规范 v0.2（草案）》

> 本文件完成 Candidate 的职责审计与 Observation Rule 设计，不直接修改正式 Rule Registry，不晋升 Semantic Route。

---

# 1. Review 结论

17 条研究 Candidate **不能对应 17 条 Rule Registry Rule**。

原因：当前 `liuyao-rule-registry.js` 的职责是：

```text
Resolved DivinationIntent
→ 选择 Observation Rule
→ 产生 Observation Candidate
```

Observation Candidate 只描述：

```text
看谁
为什么看
属于 primary / role / domain / auxiliary 哪一类
```

它并不负责：

- 旺衰判断；
- 旬空事实；
- 动变结果；
- 墓伏合的解释；
- Recovery 成败；
- Location 场所类象。

《复合观察与取用规则规范》也明确要求：

```text
Primary Subject
Role Observation
Domain Observation
```

各自具有现实职责，后续关系与 Assessment 独立生成。

因此失物 Candidate 必须按职责重新分层。

---

# 2. 17 条 Candidate 的最终去向

| Candidate | 原命题 | Review 去向 |
|---|---|---|
| RC-LP-001 | 普通失物默认妻财 | Object Resolver rule data |
| RC-LP-002 | 文书证件父母 | Object Resolver rule data |
| RC-LP-003 | 舟车衣物父母 | Object Resolver rule data |
| RC-LP-004 | Recovery / Location 分责 | Domain contract，不进 Observation Registry |
| RC-LP-005 | 旺衰 Recovery | Recovery Evidence rule |
| RC-LP-006 | 空亡 Recovery | Recovery Evidence rule |
| RC-LP-007 | 静临世 / 内静旺 | Recovery composite evidence |
| RC-LP-008 | 发动 displacement | Recovery / Location evidence |
| RC-LP-009 | 墓伏合 hidden | Structural Evidence mapping |
| RC-LP-010 | 生合世正向 | Cross-observation Recovery evidence |
| RC-LP-011 | 财化鬼 | Recovery / loss-cause evidence |
| RC-LP-012 | 鬼化财 | Recovery evidence |
| RC-LP-013 | 官鬼盗窃线索 | Domain Observation + loss-cause evidence |
| RC-LP-014 | 内外卦位置 | Location Evidence channel |
| RC-LP-015 | 五行环境 | Location Evidence channel |
| RC-LP-016 | 爻位空间 | Location Evidence channel |
| RC-LP-017 | 墓合伏位置 | Location Evidence channel |

最终只有：

```text
RC-LP-001
RC-LP-002
RC-LP-003
RC-LP-013（仅“需要观察官鬼”这一部分）
```

与 Observation Plan 的“观察谁”直接相关。

---

# 3. 正式 Observation Rule 不应按物类拆成三条 Base Rule

表面上可以设计：

```text
TR-LP-GENERIC → 妻财
TR-LP-DOCUMENT → 父母
TR-LP-VEHICLE-CLOTHING → 父母
```

但这不是最优结构。

因为现代物件存在：

```text
手机 → conflicted
钥匙 → school_specific
戒指 → function-dependent / school_specific
电脑 → unresolved
银行卡 → unresolved
```

若继续按物品枚举扩 Rule Registry，未来会迅速出现：

```text
TR-LP-PHONE-...
TR-LP-KEY-...
TR-LP-COMPUTER-...
```

并再次把现代实体分类和传统六亲选择耦合。

更合适的是：

```text
1 个 lost_property Base Observation Rule
+
1 个 Traditional Object Resolver
```

---

# 4. 建议 Base Observation Rule

设计候选：

```text
TR-LP-001
family = traditional
matchScope = domain_specific
automationStatus = provisional_until_schema_ready
appliesTo.eventTypes = ['lost_property']
```

Observation Plan：

```text
Primary
→ PRR-LOST-PROPERTY-OBJECT

Role
→ 世（self / querent）

Domain
→ 官鬼（possible theft / external remover）[optional]
```

建议语义职责：

```text
Primary:
semanticDuty = lost_object

世:
semanticDuty = querent_self
source = role
required = true

官鬼:
semanticDuty = possible_theft_or_external_removal
source = domain
required = false
```

注意：

- 官鬼不是第二“用神”；
- 官鬼不接管失物本体；
- 官鬼只服务于 loss-cause evidence；
- 没有盗窃信号时也不能反向改变 Primary。

---

# 5. PRR-LOST-PROPERTY-OBJECT

需要新增一个 resolver 类型的 Primary selector，而不是静态妻财。

概念接口：

```ts
interface LostPropertyObjectResolution {
  status:
    | 'resolved'
    | 'unresolved'
    | 'conflicted'

  traditionalClass?:
    | 'generic_property'
    | 'document_credential'
    | 'vehicle_clothing'

  selector?: {
    type: 'six_relative'
    value: '妻财' | '父母'
  }

  evidenceRefs: string[]
  issues: string[]
}
```

第一阶段只允许三种已研究成熟的映射：

```text
generic_property
→ 妻财

document_credential
→ 父母

vehicle_clothing
→ 父母
```

---

# 6. Resolver 必须允许 abstain

以下对象不得强制分类：

```text
phone
key
ring
computer
bank_card
USB / disk
cloud_data
其他未研究成熟现代物件
```

对应：

```text
status = conflicted
```

或：

```text
status = unresolved
```

而不是自动回退：

```text
unknown object
→ generic_property
→ 妻财
```

这是本次 Rule Review 最重要的 Gate 之一。

`generic_property` 只能在 Semantic / Object 层已经有足够证据判定该物就是普通财物时使用；不能充当“所有无法识别物品”的 catch-all。

---

# 7. 为什么世爻应进入 Observation Plan

研究 Candidate RC-LP-007 / RC-LP-010 已确认存在传统直接证据：

```text
用神静临世
生合世
```

会进入 Recovery 判断。

因此失物不是纯粹：

```text
Primary Object only
```

而需要保留：

```text
Primary ↔ Self
```

关系。

按照复合观察规范，这属于：

```text
Role Observation = 世
semanticRole = querent_self
```

后续由：

```text
CrossObservationRelation
```

生成：

- Primary 是否临世；
- Primary 是否生世 / 合世；
- 其他经核证关系。

禁止把这些关系直接硬塞进 Primary selector。

---

# 8. 为什么官鬼可以观察但只能 optional

RC-LP-013 的稳定传统部分是：

```text
官鬼可提供盗窃 / 外部取走线索
```

这属于 `Domain Observation`，不是 Primary。

因此建议：

```text
candidate(
  six_relative 官鬼,
  possible_theft_or_external_removal,
  source = domain,
  required = false
)
```

它的输出职责仅限：

```text
loss_cause_evidence
```

禁止扩展：

- 贼的性别；
- 贼的年龄；
- 贼的身份；
- 捕盗时间。

如果未来用户目标是“谁偷了 / 能否抓到”，应进入另一个未研究主题。

---

# 9. Recovery Evidence 不属于 Rule Registry

以下 Candidate 全部禁止写进 `OBSERVATION_RULES`：

```text
RC-LP-005
RC-LP-006
RC-LP-007
RC-LP-008
RC-LP-009
RC-LP-010
RC-LP-011
RC-LP-012
```

这些应该进入独立层，例如未来：

```text
liuyao-lost-property-recovery.js
```

或更通用的：

```text
Domain Assessment Registry
```

输入应是：

```text
ObservationPlan
+
已有结构 Facts
+
已有 Time / status Facts
```

输出：

```ts
interface LostPropertyRecoveryEvidence {
  type: string
  polarity: 'positive' | 'negative' | 'neutral'
  strength?: 'supporting' | 'strong'
  subjectRef: string
  factRefs: string[]
  ruleRef: string
}
```

不得重新计算基础事实。

---

# 10. Location Candidate 也不属于 Rule Registry

以下 Candidate：

```text
RC-LP-014
RC-LP-015
RC-LP-016
RC-LP-017
```

全部属于：

```text
Location Evidence Interpreter
```

输入是 Primary Object 已解析后的：

- 内 / 外卦；
- 爻位；
- 纳甲地支 / 五行；
- 卦宫；
- 墓；
- 合；
- 伏神。

输出多条 Evidence，而不是一个坐标。

建议：

```ts
interface LostPropertyLocationEvidence {
  channel:
    | 'inside_outside'
    | 'line_position'
    | 'branch_direction'
    | 'trigram_environment'
    | 'element_environment'
    | 'tomb_containment'
    | 'joined_cover'
    | 'hidden_fushen'

  description: string
  sourceRefs: string[]
  confidence: 'stable' | 'compatible' | 'school_sensitive'
}
```

---

# 11. Recovery 与 Location 可共享 ObservationPlan，但不能共享 Assessment

推荐结构：

```text
DivinationIntent
  event = lost_property
  goal = recovery | location
        ↓
PRR-LOST-PROPERTY-OBJECT
        ↓
ObservationPlan
├─ primary: lost_object
├─ role: querent_self
└─ domain: possible_theft [optional]
        ↓
┌──────────────────────┬──────────────────────┐
│ Recovery Assessment  │ Location Interpreter │
│                      │                      │
│ 旺衰 / 空破          │ 内外                 │
│ 动静 / 动变          │ 爻位                 │
│ 世用关系             │ 五行 / 地支 / 卦宫   │
│ 财鬼互化             │ 墓 / 合 / 伏         │
│ loss cause           │                      │
└──────────────────────┴──────────────────────┘
```

如果用户同时问：

```text
手机丢在哪里了，还能找到吗？
```

这不是两个互斥主题，而是同一 `lost_property` 下两个合法 goal：

```text
recovery + location
```

共享 Primary Object Resolution。

但若 Primary 本身 unresolved / conflicted，则两个 Assessment 都应停止，不得分别猜一个六亲继续。

---

# 12. 与当前 `liuyao-rule-registry.js` 的差距

当前 `ruleMatchesIntent()` 只识别已有 semantics 字段：

- event type；
- goal；
- investment；
- income；
- delivery；
- purchase；
- transaction；
- fortune；
- participant pattern。

当前 `resolveObjectFunctionalRole()` 也只覆盖：

```text
receive_item
item_purchase
```

因此失物正式 Rule 现在仍不能直接实现，因为缺少：

```text
lost_property event schema
lost_object structured slot
loss_goal
traditional object class resolution contract
```

这不是文献问题，而是 Semantic / Intent Contract 尚未准备的问题。

---

# 13. Rule Review Gate 结果

## 已通过

```text
文献研究充分性               PASS
Primary / Role / Domain 职责 PASS
Recovery / Location 分层     PASS
Legacy 妻财泛化识别          PASS
现代冲突保留                 PASS
Explicit abstention          PASS
Time Fact 不重算边界         PASS
```

## 尚未通过

```text
Formal Intent/Event Schema   NOT READY
Lost Object Slot Contract    NOT READY
Object Resolver Implementation NOT READY
Recovery Assessment Layer    NOT IMPLEMENTED
Location Interpreter Layer   NOT IMPLEMENTED
```

---

# 14. Review 后的正式候选数量

原研究 Candidate：

```text
17
```

经职责审计后，真正属于 Observation Rule / Observation Plan 设计的核心只有：

```text
1 个 Base Observation Rule
1 个 Primary Object Resolver
1 个 required Role Observation（世）
1 个 optional Domain Observation（官鬼）
```

其余不是丢弃，而是分别迁移到：

```text
Recovery Evidence
Location Evidence
Domain Contract
```

---

# 15. 下一阶段

失物现在可以结束 Rule Review，进入：

```text
Formal Intent / Event Schema Design
↓
Lost Object Resolver Contract
↓
Observation Rule provisional implementation
↓
Recovery / Location domain assessment implementation
↓
专项测试
```

但仍不得直接加入 current 22-route Semantic Training。

当前状态：

```text
literatureResearch = completed_and_reviewed
ruleReview = complete
observationRuleDesign = approved_in_principle
formalIntentSchema = pending
formalRuleRegistryImplementation = blocked_by_schema
semanticTraining = blocked
currentRoute = false
```
