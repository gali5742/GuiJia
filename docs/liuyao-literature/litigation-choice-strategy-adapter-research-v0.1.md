# 龟甲 · 六爻诉讼 Choice / Strategy Adapter 专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_adapter_ready_no_recommendation`

主题：

```text
litigation_dispute.settlement_suitability
litigation_dispute.litigation_strategy
```

上游：

- `choice-suitability-shared-architecture-v0.1.md`
- `litigation-dispute-rule-review-v0.1.md`
- `litigation-dispute-intent-schema-design-v0.3.md`

> 本专项只研究诉讼主题如何向共享 Choice 层提供证据，不把六爻输出包装成法律建议，不输出诉讼策略 Winner。

---

# 1. 核心结论

传统词讼资料能够提供：

```text
litigation outcome evidence
settlement / reconciliation evidence
procedural pressure evidence
document / pleading evidence
party-action evidence
```

但这些不能直接变成：

```text
接受和解更好
继续诉讼更好
应该上诉
不应该上诉
```

因此：

```text
litigation adapter = evidence provider
shared choice layer = comparison frame
legal recommendation = forbidden in this contract
```

---

# 2. 传统“和解”证据可以支持什么

《黄金策·词讼》明确：

```text
世应相生相合 → 和好 / 和释倾向
世应比和 → 亦可有和解象
子孙兴 → 劝和 / 消散
官鬼动 → 程序 / 官司压力可能继续
世空 / 应空 → 各方息争倾向
```

并且：

```text
若问消散，当看子孙
```

这些稳定支持：

```text
settlement_feasibility
resolution_tendency
party_willingness_evidence
```

但不支持：

```text
settlement_total_value
legal fairness
future enforceability
actual legal rights
```

来源：

- https://zh.wikisource.org/zh-hans/%E9%BB%84%E9%87%91%E7%AD%96
- https://www.yanyilundao.com/b3/241

---

# 3. “能不能和解”与“该不该和解”继续分离

```text
双方最后能不能和解？
→ dispute_resolution_outcome

我现在该不该接受这份和解方案？
→ settlement_suitability
```

前者 current target：

```text
resolution occurrence
```

后者 current target：

```text
choice between settlement and alternatives
```

所以 `settlement_suitability` 必须进入 Shared Choice Architecture。

---

# 4. Settlement Suitability Alternatives

默认至少：

```text
Alternative A = accept_settlement
Alternative B = continue_proceeding
```

若用户还有：

```text
reject_and_negotiate_again
withdraw_claim
```

可作为更多 alternatives，但必须 specific / context-bounded。

---

# 5. Litigation Theme Dimensions

诉讼 adapter 首轮只允许输出它有直接职责依据的维度：

```text
target_outcome
resolution_feasibility
legal_exposure
stability
```

其中 `legal_exposure` 在本项目只是：

```text
proceeding pressure / adverse procedural evidence
```

不是法律责任计算，也不是律师意见。

## 5.1 target_outcome

`continue_proceeding` 可复用：

```text
litigation_outcome
```

但 represented litigation 仍受 v0.3 participant resolver 限制。

## 5.2 resolution_feasibility

`accept_settlement` / `negotiate` 可复用：

```text
dispute_resolution_outcome
```

及：

```text
世应和合
子孙 resolution evidence
party willingness
```

## 5.3 legal_exposure

只允许消费：

```text
官鬼 proceeding pressure
父母 case-document state
party adverse evidence
```

不得生成具体法律概率 / 责任金额。

## 5.4 stability

仅表示：

```text
争议是否更可能持续 / 消散
```

不表示长期经济价值。

---

# 6. 金额 / 债务 / 赔偿条件不能由 Litigation Adapter 吞掉

例如：

```text
对方愿意赔 20 万，我该不该接受？
```

Choice 里至少同时存在：

```text
settlement feasibility
litigation outcome exposure
financial amount / recovery value
```

其中：

```text
financial amount / recovery value
```

必须由相应 finance / debt / compensation semantic adapter 提供。

诉讼 adapter 不能因为“钱出现在和解条件里”就自行评价金额是否划算。

因此 Shared Comparison Frame 必须支持：

```text
multi-domain dimension providers
```

---

# 7. Litigation Strategy

现代例：

```text
该不该上诉？
继续打官司还是撤诉？
现在起诉还是先谈？
要不要继续仲裁？
```

这些是 action alternatives。

不能给：

```text
上诉 = 官鬼
撤诉 = 子孙
```

固定单爻映射。

正确：

```text
Action Alternative
↓
map to relevant existing duty
↓
collect evidence
```

例：

```text
appeal
→ proceeding_acceptance (上诉是否受理)
→ litigation_outcome (进入程序后的结果)

settle
→ dispute_resolution_outcome

continue_proceeding
→ litigation_outcome

withdraw
→ dispute dissipation / action context
→ no universal single selector yet
```

---

# 8. “宜和 / 不宜讼”不能直接成为策略建议

传统资料中大量存在：

```text
和好
息争
宜和
讼不利
```

但现代诉讼决策还可能取决于：

```text
法律权利
证据可采性
诉讼时效
执行可能
律师费用
和解条款
声誉 / 商业关系
风险承受
```

这些很多不是当前六爻主题的传统 Observation responsibility。

所以：

```text
traditional settlement-positive evidence
→ dimension evidence
```

不能升级：

```text
accept settlement = recommended
```

---

# 9. Represented Subject Constraint

根据 `litigation-dispute-intent-schema-design-v0.3.md`：

```text
self litigation
→ bilateral 世应 structure may be full

represented litigation
→ represented party may resolve
→ counterparty anchor may remain unresolved
```

因此 Choice Adapter 必须继承：

```text
partial alternative
```

能力。

不能因为进入 Choice 层就绕过 participant resolver。

---

# 10. Theme Adapter Contract

```ts
litigationChoiceAdapter(alternative) => {
  status:'resolved' | 'partial' | 'unresolved',
  actionType:
    | 'accept_settlement'
    | 'continue_proceeding'
    | 'appeal'
    | 'withdraw'
    | 'renegotiate'
    | 'other',
  observationPlans:[],
  dimensionEvidence:{
    target_outcome?:[],
    resolution_feasibility?:[],
    legal_exposure?:[],
    stability?:[]
  },
  externalDimensionRequirements:[],
  issues:[]
}
```

例如和解金额：

```text
externalDimensionRequirements
→ financial_value_adapter
```

---

# 11. Preference Policy

诉讼选择可能优先：

```text
尽快结束
最大回收金额
降低法律暴露
维持商业关系
原则性胜诉
减少时间成本
```

不同用户排序不同。

所以 preference 未明确时：

```text
overallRecommendation = null
```

即使：

```text
settlement feasibility evidence strong
```

也不能自动宣告“应该和解”。

---

# 12. Status Matrix

```text
settlement_suitability semantic duty
→ ready

litigation_strategy semantic duty
→ ready as action-choice umbrella

litigation theme adapter
→ design_ready

settlement feasibility dimension
→ supported

proceeding outcome dimension
→ supported for eligible self cases

financial settlement value
→ external adapter required

represented-party alternatives
→ inherit partial participant resolution

overall recommendation
→ not ready / intentionally null
```

---

# 13. Explicit Non-Candidates

```text
子孙旺 = 应该和解
官鬼旺 = 应该继续诉讼
世旺应衰 = 一定应该打到底
世应合 = 必须接受和解
上诉 = 官鬼
撤诉 = 子孙
```

以上均不得成为现代策略规则。

---

# 14. Final Conclusion

本专项完成：

```text
litigation settlement / strategy Theme Adapter research
```

但它只允许：

```text
structure alternatives
collect theme-specific evidence
request external dimensions
build partial comparison frame
```

不允许：

```text
legal recommendation
winner
scalar score
```

因此共享 Choice Architecture 现在已经有 career / education / litigation 三个 theme adapter 的研究依据，但 normalized Assessment 与 preference policy 仍需独立研究。

当前 v0.13 next-topic boundary 仍为 design-only。