# 龟甲 · 六爻 Rule Registry 第一阶段实现说明 v0.1

> 基准：龟甲 v13.44.0  
> 性质：旁路迁移 / 回归测试阶段，不替换现有前台 `suggestUseGod()` 流程。

## 1. 本阶段目标

本阶段只验证：

```text
Question
→ DivinationIntent
→ RuleSelection
→ ObservationCandidate[]
→ ObservationPlan
→ CrossObservationRelation(same_target)
```

暂不把新链路接管现有用户界面，也暂不进入最终 Interpretation / Synthesis。

## 2. 新增模块

```text
js/liuyao-intent.js
js/liuyao-rule-registry.js
js/liuyao-observation-plan.js
```

职责：

- `liuyao-intent.js`：只解析当前 `question` 中的现代现实语义；不输出六亲。
- `liuyao-rule-registry.js`：登记 TR / MR / MSR、来源、证据等级和规则匹配。
- `liuyao-observation-plan.js`：把 selector 解析为实际爻候选，并对 required subject 做阻断；生成 `same_target`。

## 3. 已登记规则

### Traditional

- TR-001-A ~ I（其中 I 分短期/有界与长期/终身）
- TR-002-M / R 的自占婚配与既有配偶关系
- TR-002 represented marriage 已能选中规则，但 Participant Role Resolver 暂留 pending，不伪造 selector

### Modern

- MR-001：特定异性恋爱发展
- MR-002：现代投资（profit / liquidation / suitability / position decision / price trend）
- MR-003：employment income（salary enabled / bonus provisional）
- MR-004：shipment delivery

### Modern Structural / Augmentation

- MSR-001：specified target dual observation
- Object Functional Role Resolver 已提供最小接口，目前只在已证实语义中返回功能角色，不直接映射六亲

## 4. Normal / Research 模式

正常模式：

```text
automationStatus = enabled
```

才允许进入 ObservationPlan。

研究模式：

```text
enabled + provisional
```

均可被 RuleSelection 选中。

因此：

- MR-002-D `position_decision`：正常模式 unresolved；研究模式可见
- MR-003-B `bonus`：正常模式 unresolved；研究模式可见

## 5. 第一轮回归集

新增：

```text
tests/liuyao-rule-registry-tests.js
```

固定覆盖：

- 22 个代表性语义问题；
- 健康类 unsupported-domain 产品边界；
- 妻财持世 `same_target`；
- 妻财临应 `same_target`；
- 同一六亲多个候选时 required primary 不自动选第一处。

当前结果：27 项通过。

## 6. 一个有意保留的修正

恋爱规则 MR-001 的测试问题改为显式包含占问者性别，例如：

```text
我是男生，我喜欢的这个女生会接受我的表白吗？
```

而不是：

```text
我喜欢的这个女生会接受我的表白吗？
```

原因：第一阶段 `DivinationIntent` 的输入边界只有本次占问文本，不允许读取用户历史或外部个人资料来补足占问者性别。缺少必要传统角色条件时，应保持映射未确认。

## 7. 本阶段明确不做

- 不替换旧 `USE_GOD_QUESTION_RULES / suggestUseGod()`；
- 不修改现有时间效力引擎；
- 不做最终吉凶输出；
- 不实现 represented marriage 的传统 Participant Resolver；
- 不实现 MR-002-D 的 ChoiceAlternativeRule 公共接口；
- 不把 provisional 当成生产规则；
- 不对 Object 名称直接映射六亲。

## 8. 下一阶段入口

若第一阶段回归稳定，下一步应先做：

```text
1. 把新 Intent / RuleSelection / ObservationPlan 以只读调试信息接入六爻结果对象
2. 与旧 suggestUseGod() 做并行差异审计
3. 用真实排盘 Fixture 验证 primary / role / domain / auxiliary 的后续分析接口
4. 再决定何时替换旧 single selectedUseGodTarget 主链
```

不要直接删除旧链路。
