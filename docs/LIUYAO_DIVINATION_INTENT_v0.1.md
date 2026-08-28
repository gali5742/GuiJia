# 龟甲 · 六爻 DivinationIntent v0.1

状态：**Phase 2 冻结契约**

本文件固定“自然语言语义层 → Rule Registry”之间的接口。后续接入 NLP 时，原则上替换的是自然语言理解实现，而不是下游 Rule Registry / ObservationPlan 数据结构。

## 1. 总链路

```text
Question
→ Semantic Parser
   ├─ NLP parser（最终入口）
   └─ baseline parser（回归 / fallback）
→ Intent Validator
→ DivinationIntent v0.1
→ Rule Registry
→ ObservationPlan
```

NLP 只负责现代现实语义，不直接输出六亲、世应、用神或爻位。

## 2. 冻结结构

```ts
interface DivinationIntent {
  version: '0.1'
  rawQuestion: string

  status: 'resolved' | 'blocked'
  blockReason?: 'partial' | 'ambiguous' | 'multiple_goals' | 'unsupported_domain'

  goals: DivinationGoal[]
  event?: DivinationEvent
  object?: DivinationObject
  relation?: DivinationRelation
  participants: DivinationParticipant[]
  targetTime?: DivinationTime | null
  expectedState?: string

  confidence: number
  ambiguities: DivinationIntentAmbiguity[]
  semantics?: Record<string, unknown>
}
```

当前 Participant 至少允许：

```ts
interface DivinationParticipant {
  role: string
  text?: string
  relationToQuerent?: string
  specificity?: 'specific' | 'generic' | 'unknown'
  sex?: 'male' | 'female' | 'unknown'
}
```

## 3. 强制边界

### 3.1 NLP 不得输出传统映射

以下内容属于 Rule Registry / Resolver 层，不属于 NLP：

```text
妻财
官鬼
父母
兄弟
子孙
世
应
用神
爻位 selector
```

因此 NLP Adapter 会拒绝 `sixRelative`、`useGod`、`selector`、`yaoTarget`、`shiYing` 等传统映射字段。

### 3.2 Object 不直接映射六亲

例如 `computer`、`ring`、`house` 只属于现代 Object。其现实功能由 Event / Goal / Object Functional Role 决定，再由 Rule Registry 映射。

### 3.3 Intent resolved 不等于 Rule resolved

允许：

```text
Intent.status = resolved
RuleSelection.status = unresolved
ObservationPlan.status = unresolved
```

这用于：

- 当前无 confirmed rule；
- 仅有 provisional rule；
- 传统男女角色等必要语义未明确；
- Resolver 尚未实现。

## 4. baseline 与 NLP 的分工

### baseline 应处理

显式、局部、无需共指消解的输入，例如：

```text
我是一个二十五岁男生，和一个女性朋友能不能发展为恋爱关系
我是一个刚大学毕业的女生，和一个男性朋友能不能发展为恋爱关系
我是一个母胎单身的女生，和新认识的一个男性朋友能不能发展为恋爱关系
```

年龄、学历、经历、认识时间等普通修饰语必须是 non-destructive：不得破坏显式 `sex / relation / specificity` 的抽取。

### NLP 应处理

需要跨句叙述、代词共指、背景与主问题区分的输入，例如：

```text
我是一个母胎单身的女生，最近我认识了一个男生，我对他有点好感，想算一下我们之间有没有可能
```

该类输入需要识别“他”“我们”的指代，以及最终问题“有没有可能”的关系语义，不继续通过扩充 regex 解决。

## 5. A/B/C/D 诊断

测试阶段对 unresolved 进行分层：

```text
A baseline_parser_failure
  baseline 本应能处理的显式输入解析失败

B nlp_required
  需要叙述理解、共指消解或主问题识别

C intent_schema_gap
  已识别语义无法由 DivinationIntent v0.1 表达

D rule_unavailable
  Intent 已足够，但当前无 confirmed/enabled Rule，或规则冲突
```

另外，信息本身未提供（例如特定恋爱对象性别未知）属于 `semantic_ambiguity`，不强行归入 A-D。

## 6. 版本规则

v0.1 自本文件落库起视为 Phase 2 冻结：

- NLP 接入不得修改字段语义；
- 新自然语言表达优先通过 Parser / Resolver 适配；
- 新术数领域优先通过 Registry 扩展；
- 只有确定出现 **C · intent_schema_gap** 时才评估 v0.2；
- 任何 breaking change 必须升级 Intent version，不得静默改写 v0.1。
