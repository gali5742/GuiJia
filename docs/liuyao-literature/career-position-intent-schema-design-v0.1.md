# 龟甲 · 六爻 Career Position Intent / Event Schema Design v0.1

日期：2026-09-01

状态：`design_only_ready`

主题：`career_position`

上游：

- `career-position-research-v1.0.md` — `completed_and_reviewed`
- `career-position-rule-candidates-v0.1.md` — `ready_for_rule_review`
- `career-position-rule-review-v0.1.md` — `rule_review_complete`

> 本文件只定义未来 Schema Contract。当前不得修改 `js/liuyao-intent.js`、当前 22-route inventory、Semantic Candidate、训练 / 校准 / blind 数据。当前 v0.13 next-topic gate 仍然有效。

---

# 1. Schema 总原则

Semantic / Intent 层只回答现代现实问题：

```text
用户当前是不是在问自己的职位 / 工作取得、升迁、保留或特定跳槽结果？
当前现实职责是哪一种？
目标是职位本身、公司、正式手续，还是工资？
是否存在明确目标单位？
是否存在竞争性选拔？
是否涉及 current / prospective employment 两个现实对象？
```

Intent 层绝不回答：

```text
官鬼是不是用神
父母是不是公司爻
应爻是不是目标单位
兄弟是不是竞争者
```

即：

```text
Modern Career Semantics
≠
Traditional Observation Selection
```

---

# 2. Event Schema

建议未来统一 Event：

```ts
event: {
  type: 'career_position'
}
```

不在 Event 层先拆成四个传统规则。

原因：

```text
career_position
```

是现代主题域；具体职责通过 `careerDuty` 表达。

这样未来 Router 可以在评估后选择：

```text
方案 A：一个 career_position Route + duty resolver
方案 B：多个细 Route
```

而不需要改变 Intent / Observation Rule 接口。

---

# 3. Career Duty

建议新增：

```ts
semantics.careerDuty:
  | 'job_application_outcome'
  | 'position_advancement'
  | 'employment_retention'
  | 'employment_transition_outcome'
  | 'employment_status_confirmation'
  | 'employment_transition_comparison'
  | 'resignation_suitability'
  | 'generic_career_state'
  | 'unknown'
```

其中首轮只有：

```text
job_application_outcome
position_advancement
employment_retention
employment_transition_outcome
```

属于 `supported_design_duty`。

其余必须识别但不得静默重映射：

```text
employment_status_confirmation
→ deferred

employment_transition_comparison
→ deferred

resignation_suitability
→ deferred

generic_career_state
→ semantic_insufficient_for_first_release
```

这可避免：

```text
转正 → 偷偷变 position_advancement
该不该辞职 → 偷偷变 employment_transition_outcome
事业怎么样 → 偷偷变任意 career rule
```

---

# 4. Generic Goal 保持现有 Contract

当前 Intent 使用通用：

```text
outcome
choice
state
timing
```

事业主题无需把 `careerDuty` 重复塞进 `goals`。

建议：

```ts
goals: [{ type:'outcome' }]
```

配合：

```ts
semantics.careerDuty
```

例如：

```text
这次面试最后能不能录用？
```

可表示为：

```js
{
  event:{ type:'career_position' },
  goals:[{ type:'outcome' }],
  semantics:{ careerDuty:'job_application_outcome' }
}
```

这能减少与当前 Intent Contract 的结构漂移。

---

# 5. Career Subject Boundary

首轮只研究并支持：

```text
self career question
```

建议 participant：

```ts
participants: [
  {
    role:'career_subject',
    relationToQuerent:'self'
  }
]
```

当前不得自动扩展：

```text
替朋友问工作
替孩子问录用
替配偶问升职
```

原因：本轮传统 Role Observation 研究明确建立在“世 = 自占本人”上；represented subject 需要独立角色取用研究。

因此：

```text
represented_career_subject
→ recognized_but_rule_unsupported
```

不能默认为世。

---

# 6. Career Target Object

建议增加：

```ts
careerTarget: {
  text: string
  kind:
    | 'position'
    | 'employment'
    | 'employer_organization'
    | 'formalization_document'
    | 'unknown'
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
  temporalRole:
    | 'current'
    | 'prospective'
    | 'target'
    | 'unknown'
}
```

### specific

```text
A 公司的产品经理岗位
这次内部主管竞聘
```

### context_bounded

虽然没有说职位名称，但语境指向一个明确现实事件：

```text
这次面试最后能不能录用？
刚投的那个岗位能不能拿到？
这轮裁员会不会裁到我？
```

### generic

```text
我的事业怎么样
最近工作运如何
以后能不能升官
```

首轮不得直接进入正式 Rule Selection。

---

# 7. Current Target Aspect

这是本主题最关键的 Semantic 字段之一。

建议：

```ts
semantics.currentTargetAspect:
  | 'position_or_employment'
  | 'employer_organization'
  | 'formalization_document'
  | 'compensation'
  | 'employment_comparison'
  | 'resignation_decision'
  | 'unknown'
```

## 7.1 position_or_employment

```text
我能不能拿到这个岗位？
能不能升职？
职位能不能保住？
能不能成功跳到 A 公司？
```

这是首轮 Base Rule 的有效 target aspect。

## 7.2 employer_organization

```text
这家公司本身适不适合我？
公司之后会怎么样？
```

当前不等于职位结果，首轮不自动支持。

## 7.3 formalization_document

```text
书面 offer 什么时候发？
合同能不能签下来？
任命文件会不会下来？
```

研究允许父母成为 Primary candidate，但当前先标：

```text
deferred_until_schema_validation
```

不能偷用 job_application 官鬼规则。

### “拿到 offer”与“书面 offer 文件”的区别

```text
能不能拿到 offer？
```

若语义等同于：

```text
对方会不会录用我
```

则：

```text
currentTargetAspect = position_or_employment
```

而：

```text
书面 offer 什么时候发给我？
```

则更接近：

```text
currentTargetAspect = formalization_document
```

不得仅按 `offer` 单词匹配。

## 7.4 compensation

```text
工资能不能涨
薪资多少
奖金发不发
```

必须优先进入现有 income routes，而不是 career_position。

---

# 8. Application Stage

建议：

```ts
semantics.applicationStage:
  | 'pre_application'
  | 'submitted'
  | 'interview'
  | 'selection'
  | 'verbal_offer'
  | 'written_offer'
  | 'contract'
  | 'onboarding'
  | 'unknown'
```

该字段只表达现实流程阶段。

它不能直接决定：

```text
父母 / 官鬼 / 应
```

例如：

```text
面试结束了，最后会不会录用我？
```

虽 `applicationStage = interview`，current target 仍是职位取得。

---

# 9. Employer Context

建议：

```ts
employerContext: {
  text?: string
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'none'
  isExternalTarget: boolean
}
```

例如：

```text
A 公司会不会录用我？
```

可以产生：

```text
employerContext.specificity = specific
isExternalTarget = true
```

后续 Observation Rule 才决定是否追加：

```text
父母 → employer organization
应   → specified external target
```

Intent 本身不输出传统字段。

---

# 10. Competitive Selection Context

建议：

```ts
semantics.competitiveSelection:
  | 'explicit'
  | 'context_supported'
  | 'not_indicated'
  | 'unknown'
```

只有明确：

```text
内部竞聘
多人竞争一个名额
竞争岗位
排名录取
```

才允许进入后续 competition augmentation。

禁止 NLP 根据：

```text
“面试一般都有竞争”
```

自行推成 `competitiveSelection = explicit`。

---

# 11. Employment Alternatives

为了避免“跳槽”再被压平，建议预留：

```ts
employmentAlternatives?: Array<{
  id: string
  role:
    | 'current_employment'
    | 'prospective_employment'
    | 'alternative'
  text: string
  specificity: 'specific' | 'context_bounded' | 'generic' | 'unknown'
}>
```

### transition outcome

```text
从现在公司跳去 A 公司，能不能成功？
```

可以保留：

```text
current_employment
prospective_employment
```

但 `careerDuty = employment_transition_outcome` 时，current target 是：

```text
prospective_employment acquisition
```

current employment 只是 context，不要求传统层替它强行找爻。

### transition comparison

```text
留现在公司还是去 A 公司？
```

需要两个 alternative 同时成为 current targets：

```text
careerDuty = employment_transition_comparison
```

当前为 deferred，不允许偷用 transition outcome。

---

# 12. Retention Context

建议：

```ts
semantics.retentionThreat:
  | 'layoff'
  | 'replacement'
  | 'position_loss'
  | 'bounded_unspecified'
  | 'none'
  | 'unknown'
```

有效：

```text
这轮裁员会不会裁到我？
我的职位能不能保住？
```

不足：

```text
我们公司会不会裁员？
```

后者 current target 是公司层面的裁员事件，不一定是本人职位保留。

首轮 `employment_retention` 应要求：

```text
self impact / current position target
```

---

# 13. Expected State

建议未来补：

```ts
expectedState:
  | 'employment_acquired'
  | 'position_advanced'
  | 'position_retained'
  | 'prospective_employment_acquired'
  | 'unknown'
```

映射：

```text
job_application_outcome
→ employment_acquired

position_advancement
→ position_advanced

employment_retention
→ position_retained

employment_transition_outcome
→ prospective_employment_acquired
```

这能帮助 Rule Registry 与 Assessment 保留现实职责。

---

# 14. Minimal Sufficiency Contract

## 14.1 Global

首轮 career_position 至少要求：

```ts
{
  eventType: 'career_position',
  subject: 'self',
  careerDuty: supported duty,
  currentTargetAspect: 'position_or_employment',
  careerTarget: {
    specificity: 'specific' | 'context_bounded'
  },
  goal: 'outcome'
}
```

若 target 是 generic：

```text
事业怎么样
工作运如何
```

则：

```text
semantic event candidate may exist
traditional rule selection = insufficient
```

## 14.2 Job Application Outcome

至少：

```text
careerDuty = job_application_outcome
bounded application / target employment context
current target = employment acquisition
```

不要求必须说出公司名称或职位名称。

## 14.3 Position Advancement

至少：

```text
careerDuty = position_advancement
self currently employed or current-employment context implied
bounded advancement target
```

如：

```text
今年能不能升职？
这次内部竞聘能不能上？
```

可视为 context-bounded。

## 14.4 Employment Retention

至少：

```text
careerDuty = employment_retention
self current position is target
retentionThreat != none
```

## 14.5 Employment Transition Outcome

至少：

```text
careerDuty = employment_transition_outcome
prospective employment target = specific | context_bounded
current target = prospective employment acquisition
```

纯：

```text
最近适不适合跳槽？
```

不满足首轮 outcome contract，因为没有明确 prospective employment result target。

---

# 15. Recognized but Unsupported States

未来 parser 应尽量识别，而不是误路由：

```text
转正能不能过？
→ employment_status_confirmation
→ rule_unsupported

留现在公司还是去 A 公司？
→ employment_transition_comparison
→ rule_unsupported

我现在该不该辞职？
→ resignation_suitability
→ rule_unsupported

我的事业怎么样？
→ generic_career_state
→ insufficient_for_first_release
```

这比把它们强行塞进已支持 duty 更安全。

---

# 16. Cross-route Collision Contract

## 16.1 Salary / Bonus

```text
这个岗位工资能涨多少？
→ income_salary

今年奖金会不会发？
→ income_bonus
```

即使句中出现“岗位 / 公司 / 工作”，current target 仍是 compensation。

### 升职加薪

```text
今年能不能升职加薪？
```

包含：

```text
position advancement
+
compensation increase
```

在没有主目标时，不得偷偷只选择 career_position。

当前架构下应作为 cross-route multi-target / clarification candidate。

---

## 16.2 Study / Exam

当前先建立单向边界：

```text
求职面试最终能否录用
→ career_position

考试 / 笔试本体能否通过
→ study_exam candidate
```

但：

```text
公务员考试能不能上岸
教师编考试能不能录用
升学面试能不能通过
```

可能同时包含考试与职位 / 录取目标。

因此在 `study_exam` 研究完成后必须做反向 collision review。

### 面试一词

`面试` 不能永久作为 career 的无条件唯一信号，因为：

- 求职面试；
- 升学面试；
- 资格审查面试；

现实目标不同。

首轮训练数据应保留 employment-context evidence，并准备 education-context negatives。

---

## 16.3 Business / Company Background

```text
我替公司做这笔采购能不能成交？
→ commercial route
```

“公司”只是背景，不创建 career_position。

---

## 16.4 Litigation / Employment Dispute

```text
公司辞退我，我起诉能不能赢？
```

若 current target 是诉讼结果，未来应由 `litigation_dispute` 负责；不能因为背景是工作就进入 employment_retention。

该边界待 litigation 主题完成后反向复核。

---

# 17. Semantic Fields Must Not Contain Traditional Selection

Intent 输出中禁止：

```text
官鬼
父母
妻财
兄弟
子孙
世爻
应爻
用神
sixRelative
useGod
```

允许：

```text
careerDuty
careerTarget
employerContext
applicationStage
competitiveSelection
employmentAlternatives
retentionThreat
currentTargetAspect
```

传统 Observation Selection 只能在 Rule Registry / Resolver 层发生。

---

# 18. Proposed Intent Examples

## A. 求职录用

输入：

```text
这次面试最后能不能录用我？
```

设计输出：

```js
{
  event:{ type:'career_position' },
  goals:[{ type:'outcome' }],
  participants:[{ role:'career_subject', relationToQuerent:'self' }],
  expectedState:'employment_acquired',
  careerTarget:{
    text:'这次面试对应的工作',
    kind:'employment',
    specificity:'context_bounded',
    temporalRole:'target'
  },
  semantics:{
    careerDuty:'job_application_outcome',
    currentTargetAspect:'position_or_employment',
    applicationStage:'interview'
  }
}
```

---

## B. 指定单位求职

```text
A 公司这个岗位能不能录用我？
```

设计输出可以增加：

```js
employerContext:{
  text:'A公司',
  specificity:'specific',
  isExternalTarget:true
}
```

但 Intent 不输出父母 / 应。

---

## C. 晋升

```text
这次内部晋升我能不能上？
```

```js
semantics:{
  careerDuty:'position_advancement',
  currentTargetAspect:'position_or_employment',
  competitiveSelection:'context_supported'
}
expectedState:'position_advanced'
```

---

## D. 裁员

```text
公司这轮裁员会不会裁到我？
```

```js
semantics:{
  careerDuty:'employment_retention',
  currentTargetAspect:'position_or_employment',
  retentionThreat:'layoff'
}
expectedState:'position_retained'
```

---

## E. 跳槽结果

```text
从现在公司跳去 A 公司，这次能不能成功？
```

```js
semantics:{
  careerDuty:'employment_transition_outcome',
  currentTargetAspect:'position_or_employment'
}
employmentAlternatives:[
  { role:'current_employment', text:'现在公司', specificity:'context_bounded' },
  { role:'prospective_employment', text:'A公司工作', specificity:'specific' }
]
expectedState:'prospective_employment_acquired'
```

此时只有 prospective employment 是 current target。

---

## F. Deferred comparison

```text
留现在公司还是去 A 公司？
```

```js
semantics:{
  careerDuty:'employment_transition_comparison',
  currentTargetAspect:'employment_comparison'
}
status:'blocked_or_unsupported_for_first_release'
```

不得误成 `employment_transition_outcome`。

---

# 19. Router Label 不在本文件提前决定

本 Schema 故意保持：

```text
Event = career_position
Duty = four supported responsibilities
```

未来训练设计再比较：

```text
one route + duty resolver
vs
four route labels
```

决策应基于：

- 样本可分性；
- 与 current-22 的碰撞；
- Router confusion；
- 下游 Rule Selection 是否需要独立 route identity。

不能因为文档里已有四个 duty 就未经评估创建四个训练标签。

---

# 20. 当前状态

```text
literatureResearch = completed_and_reviewed
ruleReview = complete
intentSchemaDesign = design_only_ready

formalIntentImplementation = false
formalRuleRegistryImplementation = false
semanticTrainingReady = false
currentRoute = false
```

继续受：

```text
current v0.13 nextTopicBoundary
```

约束。

在 current baseline 开放前，可以继续做 isolated / unreachable pretraining implementation，但不能接入正式 `liuyao-intent.js` 或训练集。
