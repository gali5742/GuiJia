# 龟甲 · 六爻 Expanded Theme Collision Matrix v0.1

日期：2026-09-01

状态：`design_only_collision_review_complete`

机器可读矩阵：

```text
data/liuyao-expanded-theme-collision-matrix-v0.1.json
```

范围：

```text
current-22
+
career_position
study_exam
travel
litigation_dispute
lost_property
person_return
person_contact
+
choice_suitability shared family
```

> 本矩阵是训练前的现代语义边界治理文件，不是 Router、不修改 current-22，也不把 design-only duty 变成 current route。

---

# 1. 为什么局部 Hard Boundary 已经不够

前几轮主题研究已经分别写了很多边界，例如：

```text
公务员考试阶段结果 ↔ 最终职位取得
旅行 ↔ 快递
诉讼 ↔ 债务追收
毕业证签发 ↔ 毕业证寄送 ↔ 毕业证丢失
行人归期 ↔ 音信
```

这些局部边界已经正确，但如果继续分散在各研究文档中，未来会出现两个风险：

1. Router / Intent / training corpus 各自重新解释一次；
2. 同一 utterance 在不同主题数据集中得到互相冲突的标签。

所以 v0.1 把已审定的碰撞集中成一个机器可读 contract。

---

# 2. 总原则

最高优先级不是关键词，而是：

```text
current target
```

其次是能够解释 current target 的结构字段：

```text
downstream consequence
exam purpose
document lifecycle
transport target
actor action target
dispute goal
trip-purpose target
object loss state
choice decision goal
```

禁止：

```text
考试词 > 事业词
官司词 > 债务词
航班词 > 旅行词
毕业证词 > study_exam
消息词 > person_contact
```

这种关键词优先级。

---

# 3. Current Target Override

## 3.1 Career vs Income

```text
今年能不能升职
→ career_position

今年工资能不能涨
→ income_salary
```

即使二者都发生在同一工作环境，职位状态和收入金额仍是不同目标。

## 3.2 Career vs Study

```text
公务员笔试这一轮能不能通过
→ study_exam

公务员考试最终能不能拿到岗位
→ career_position
```

决定字段：

```text
examPurpose / downstreamConsequence
```

因此训练时必须使用共享“考试 / 公务员 / 招聘”等词汇的 reciprocal negative，不能靠词表分标签。

## 3.3 Career vs Litigation

```text
劳动仲裁以后职位能不能保住
→ career_position

劳动仲裁裁决会不会支持我
→ litigation_dispute
```

诉讼 / 仲裁可以只是取得现实结果的方法。

---

# 4. Document Lifecycle 是全局碰撞轴

同一个对象：

```text
毕业证
```

可以进入完全不同的主题。

```text
学校会不会正式签发毕业证
→ study_exam.academic_certificate_issuance

毕业证什么时候寄到
→ receive_item

毕业证丢了能不能找回来
→ lost_property
```

所以需要显式：

```text
documentLifecycle
```

至少区分：

```text
creation / issuance
approval
physical delivery
lost / recovery
content or status inquiry
```

实体类型本身不能决定 route。

这个原则未来同样适用于：

```text
offer
合同
录取通知
证书
诉状
```

---

# 5. Actor Action 与 Artifact Arrival 分开

现代通信最容易误路由。

```text
这两天能不能收到他的消息
→ person_news_arrival

我发了消息，他会不会回复
→ person_contact_response
```

虽然两者都有：

```text
消息 / 微信 / 电话
```

但 current target 分别是：

```text
message artifact arrival
person action
```

同样：

```text
公司最后会不会录用我
→ career_position

HR今天会不会回复我的消息
→ person_contact
```

以及：

```text
对方会不会主动提出和解
→ litigation counterparty action

对方今天会不会回复我的微信
→ person_contact
```

因此必须有：

```text
actorActionTarget
```

而不能用通信渠道决定 route。

---

# 6. Travel 的最大碰撞不是“旅行词”，而是 Trip Purpose

```text
去外地面试这趟路顺不顺
→ travel

去外地面试最后能不能录用
→ career_position
```

```text
去外地考试能不能按时到
→ travel

去外地参加的考试能不能通过
→ study_exam
```

```text
出差这趟路顺不顺
→ travel

去客户那里合同能不能谈成
→ commercial target
```

所以：

```text
出差
面试
考试
客户
```

都只是可能的 trip-purpose context。

如果问的是该目的本身，travel 必须退到 background。

---

# 7. Travel / Receive / Person Return 必须三分

```text
我这趟航班能不能按时到
→ travel

包裹明天能不能送到
→ receive_item

我爸什么时候回来
→ person_return
```

共同表面词：

```text
到
回
运输
航班
时间
```

但真正 target 分别是：

```text
journey
item delivery
absent person return
```

Matrix 用：

```text
transportTarget
currentTargetAspect
```

解决，不用词优先。

---

# 8. Litigation 的 Method / Target 分离

## 8.1 Debt

```text
债务官司判决会不会支持我
→ litigation_dispute

起诉以后欠款能不能最终收回来
→ debt_collection
```

## 8.2 Commercial

```text
合同纠纷官司能不能赢
→ litigation_dispute

对方最终会不会按合同交货
→ commercial target
```

## 8.3 Marriage

```text
离婚诉讼判决会不会支持我的请求
→ litigation_dispute

我们最后会不会离婚
→ marital_relationship
```

所以：

```text
诉讼 / 仲裁 / 律师
```

不拥有无条件 route priority。

---

# 9. Lost Property 依赖 Confirmed Loss State

```text
快递明确丢件，能不能找回来
→ lost_property

快递只是晚了，明天能不能收到
→ receive_item
```

因此必须保存：

```text
objectLossState
```

至少区分：

```text
confirmed_lost
suspected_lost
not_received_yet
unknown
```

当前主题只允许 confirmed lost inanimate property 进入完整 lost-property contract。

同时：

```text
家人失踪在哪里
```

不属于 lost_property，也不等于普通 person_return。

---

# 10. Choice/Suitability 是独立 Contract，不是 Outcome 的反转

```text
A公司能不能录用我
→ career job_application_outcome

留现在公司还是去A公司更适合
→ career Choice Adapter
```

```text
A大学能不能录取我
→ study admission

A大学和B大学哪个更适合
→ education Choice Adapter
```

```text
双方最后能不能和解
→ dispute_resolution_outcome

我该不该接受这份和解
→ litigation Choice Adapter
```

禁止：

```text
outcome positive
→ suitability positive
```

Choice 仍受现有：

```text
no winner
no hidden score
```

约束。

---

# 11. Abstention 也进入 Collision Matrix

矩阵不仅决定“谁赢”，还必须明确哪些问题没有合法赢家。

例如：

```text
事业怎么样
学业怎么样
最近出行运如何
这场纠纷整体怎么样
```

若无 bounded current target：

```text
semantic_insufficient
```

再如：

```text
怎么立案
哪个法院管辖
诉讼费多少
```

属于：

```text
unsupported_information_or_procedure
```

而不是 litigation prediction。

目的地天气本身：

```text
unsupported_weather_information
```

失踪人员 / 疾病生死 / 紧急安危等：

```text
outside_researched_theme_scope
```

因此 collision resolution 不是强制路由器。

---

# 12. 对未来 Training 的直接要求

当前：

```text
trainingEligible = false
```

但 gate 未来开放后，每个新主题数据必须从 Matrix 生成或人工审核：

```text
reciprocal near-domain negatives
```

例如 career / study：

```text
公务员考试这一轮能不能过
公务员考试最后能不能拿岗位
```

两句共享大量词汇，只改变 current target。

travel / career：

```text
去A公司面试这趟能不能按时到
去A公司面试最后能不能录用
```

study / receive：

```text
毕业证能不能正式签发
毕业证什么时候寄到
```

这是未来比“主题关键词扩写”更重要的训练数据。

---

# 13. 与当前 22-route 的关系

矩阵引用：

```text
data/liuyao-semantic-route-inventory-v0.2.json
```

当前 22 routes 仍保持原样。

Matrix 中出现：

```text
career_position.job_application_outcome
study_exam.academic_certificate_issuance
person_contact.person_news_arrival
```

等名称时，它们是：

```text
design duty identifiers
```

不是 current route。

对于当前财务 / 商业 inventory 尚没有精确 future label 的情况，本矩阵使用：

```text
financial_target
commercial_target
```

等 target-family 描述，不为了填矩阵发明 current route。

---

# 14. 当前完成状态

```text
current22 ↔ expansion collision governance = ready_v0.1
cross-expansion collision governance       = ready_v0.1
abstention collision cases                 = ready_v0.1
training near-domain policy                = ready_v0.1
Router implementation                      = not_started
formal Intent integration                  = blocked
training corpus                            = forbidden_current_gate
```

---

# 15. 下一步调整

原计划第三步是“新建 Shared Resolver Architecture”。

最新分支审计已经发现现成：

```text
liuyao-participant-resolver.js
liuyao-object-entity-resolver.js
liuyao-contextual-object-role-adapter.js
liuyao-entity-typing-adapter.js
liuyao-resolver-role-arbitration.js
```

因此下一步改为：

```text
Existing Resolver Infrastructure Audit
↓
Shared Resolver Extension Contract
```

重点不是再造一套 Resolver，而是决定：

```text
哪些现有接口可以扩展
哪些只是 current-22 domain adapter
哪些必须保持现代 semantic layer
哪些 next-topic traditional resolvers 应位于其下游
```

---

# 16. 最终结论

Global Collision Matrix v0.1 把此前分散的 Hard Boundary 统一成：

```text
Current Target
↓
Deciding Semantic Field
↓
Winning Theme / Duty
or
Abstention
```

以后任何新主题训练都不应先从关键词表开始，而应先通过这张 collision contract。
