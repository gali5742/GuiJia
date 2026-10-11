# Candidate v0.7 / Fallback Identity v0.5：上游审计与安全下界

日期：2026-10-11（Asia/Tokyo）。分支：`liuyao-semantic-v013-core`。

**结论：上游可达覆盖通过；冻结的全原始路径安全门槛已被上游 Arbitration 的误激活下界证明不可满足。本版停止在权重训练之前。**

本次工作没有把覆盖 PASS 改成 FAIL，也没有运行 Fallback 权重训练、阈值搜索或集成开发评测。数学证明直接使用已有冻结的保守安全计数方式，未增加门槛或调整数值。

## 已完成的真实执行

- 数据基线：`710f39e480469bfda9a0024c7265634b3d5ddf7e`；执行合同提交：`7d6c860eaa29dd8a159387081483fceea60775be`。
- 隔离 CI 包装提交：`3166c5e3982b8df5c5e1eaf791191963c449f584`，只替换该隔离分支的注册工作流入口；未合并至开发分支。
- [真实上游 CI 38114691202](https://github.com/gali5742/GuiJia/actions/runs/38114691202)：**SUCCESS**，18 项定向测试和全部工作流步骤成功。
- 机器人向量、成员与覆盖封存提交：`02ba3733aff0acf49a6b514b379691fd4a875cca`；已在本地快进并验证。
- 固定 `Xenova/bge-small-zh-v1.5` / revision `75c43b069aac4d136ba6bc1122f995fedcfd2781` / Transformers.js 4.2.0 / q8 CPU / mean pooling / normalize / 512 维。
- 全部 308 条原始校准成员按封存顺序各编码一次：真实编码调用 **308**；随后上游重放与安全证明新增编码调用 **0**。缓存不包含问句明文，仅保留成员元数据、问句哈希、向量和冻结上游决策。
- 本地另有 5 项安全下界测试通过，包括与原冻结 `evaluate()` 的比较、各类上游拦截、角色分母和缺失分母处理。这 5 项是审计后证明测试，没有混记为编码 CI 已执行的测试。

## 原始成员与条件覆盖

原始校准集 308 = 176 已知路线 + 132 非路线，成员、标签、顺序和文本保持原封存。可达集合 116 = **93 已知路线 + 23 非路线**。

| 路线 | 原始样本 | 可达样本 | 最低要求 |
| --- | ---: | ---: | ---: |
| `financial_fortune` | 8 | 3 | 2 |
| `business_operation` | 8 | 4 | 2 |
| `commercial_transaction` | 8 | 2 | 2 |
| `inventory_purchase` | 8 | 4 | 2 |
| `inventory_sale` | 8 | 5 | 2 |
| `borrow_money` | 8 | 4 | 2 |
| `lend_money` | 8 | 5 | 2 |
| `debt_collection` | 8 | 4 | 2 |
| `debt_repayment` | 8 | 7 | 2 |
| `partnership` | 8 | 3 | 2 |
| `investment_profit` | 8 | 4 | 2 |
| `investment_liquidation` | 8 | 5 | 2 |
| `investment_suitability` | 8 | 6 | 2 |
| `investment_position_decision` | 8 | 7 | 2 |
| `investment_price_trend` | 8 | 4 | 2 |
| `income_salary` | 8 | 3 | 2 |
| `income_bonus` | 8 | 4 | 2 |
| `receive_item` | 8 | 6 | 2 |
| `item_purchase` | 8 | 5 | 2 |
| `relationship_development` | 8 | 2 | 2 |
| `marriage_match` | 8 | 3 | 2 |
| `marital_relationship` | 8 | 3 | 2 |

| 条件非路线覆盖 | 观察数 | 最低要求 |
| --- | ---: | ---: |
| 全部非路线 | 23 | 8 |
| route_unresolved | 19 | 8 |
| credit_direction | 8 | 2 |
| debt_direction | 6 | 2 |

near_domain_not_current_route 和 outside_current_22 各有 2 条条件非路线；三个子类均有观察。覆盖检查没有违规项，仅证明预训练可达样本充足，不证明模型质量或路径安全。

## 为什么任何 Fallback 权重和阈值都不能通过本版路径安全

冻结的全原始路径安全规则：Act/Sufficiency 许可且 unsupportedTargets 为空时，Arbitration 已选择的 strong/support 路线计为潜在选择；否则在 reachesFallback 的行上计入 Fallback 唯一入选。该安全规则不抵扣 Router 冲突、Scope 或 Finalization 的后续抑制。

因此，已由 Arbitration 选中的非路线与 Fallback 参数、阈值无关。即使 Fallback 在其余所有行都完全不激活，以下误激活比例仍然不可下降；其他 Fallback 选择只能增加计数。

| 冻结安全分母 | 固定 Arbitration 激活 | 无法降低的误激活比例 | 上限 |
| --- | ---: | ---: | ---: |
| `all_non_route` | 9/132 | 6.8182% | 5% |
| `route_unresolved` | 3/44 | 6.8182% | 5% |
| `near_domain_not_current_route` | 6/44 | 13.6364% | 5% |
| `debt_direction` | 1/8 | 12.5000% | 5% |

这证明本版冻结的全原始路径安全条件对任意 Fallback 参数/全局阈值不可满足，足以停止训练。它不是已训练模型的校准失败报告，也不能推断正式集成运行时的实际误激活率。单独 Fallback 压力指标、条件身份指标、阈值枚举及训练损失均未计算，不能宣称组件锁定或开发评测通过。

## 保留的证据与边界

- `data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-upstream-execution-contract-v0.1.json`：编码前冻结的 45 项输入绑定及实际数据 CI 证明。
- `data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-reachability-audit-v0.1.json` / `-reachability.lock.json`：完整原始缓存和可达成员锁。
- `data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-exposure-report-v0.1.json`：不可变覆盖 PASS。
- `data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-upstream-safety-lower-bound-v0.1.json`：审计后安全必要条件证明，列出固定激活的 9 个成员 ID、子类、方向组及 Arbitration 路线，不复制原句。
- `data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-upstream-ci-evidence-v0.1.json`：真实 CI 步骤、源码/封存提交及文件绑定。
- 旧候选的失败报告、旧模型/阈值、当前上游和本版语料/标签/成员/数值门槛均保留不变；本轮只新增文件。
- 本阶段独立评测、盲评和预留研究语料读取均为 NO，所有 Node 检查预加载读取拦截器。先前的 regression-read incident 仍原样保留；不宣称整个会话从未读取过历史评测材料。
- 未创建本版模型、模型锁、阈值锁或训练后校准报告；未读取旧 Fallback 权重进行评分；未读取独立/盲评来解释失败。
- 模型身份：Codex GPT-6-based session；确切变体不可得，不宣称 GPT-6.1 Sol。

## 后续方向

保留 v0.7 当前冻结候选。若继续改进，需要在新版本中先审查 Arbitration 对非路线的选择责任及与 Sufficiency 的关系，再冻结新设计；不得在本版删除、补写或重新标注原始成员，不得依据此次反馈调整上游或降低安全门槛。当前不进入 Selection v0.6 或 Phase C。
