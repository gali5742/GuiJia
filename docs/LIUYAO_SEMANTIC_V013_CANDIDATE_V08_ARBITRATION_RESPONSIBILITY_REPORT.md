# Candidate v0.8：Arbitration v0.13 责任改进与预训练门槛

日期：2026-10-11（Asia/Tokyo）。分支：`liuyao-semantic-v013-core`。

**结论：按计划完成冻结设计、Arbitration 实现、新校准数据封存与真实上游检查。预训练覆盖和角色安全两项门槛失败，已封存 v0.8 并停止权重训练。**

## 设计与实现

- 基线 `eb07f3d` 保留原样；设计/schema 提交 `5f34fd9` 在本版新文本作者阶段与编码反馈之前完成。
- 新增 `js/liuyao-semantic-route-arbitration-v013.js`：只限制 v0.12 已有候选，要求当前路线目标许可；流程/信息目的及被识别的方向冲突返回 null，不创建新路线、不将 support 升级为 strong，也不授予 Act/Sufficiency 许可。
- 正向路径定向测试覆盖 22 条现有路线；另检查主题提及、流程、方向冲突、历史借出与当前追讨、手续费背景与收益目标。7 项测试通过。
- Semantic Act、Route Sufficiency、Evidence v0.3、Routeability、编码器、Router/TopK、Scope、Compatibility、Finalization、22 路线清单和传统边界均保持冻结。
- 既有 Fallback 加权算法与从零训练要求保留，未训练新权重。所有数字门槛保持原值：条件身份 recall 80%、accepted precision 98%，路径/非路线安全 5%，每路线最低可达 2 条。
- 新版提前冻结必要条件：覆盖和全部原始路径 Arbitration 安全下界都须通过，才允许进入训练；下界通过不能替代训练后校准。

## 全新校准数据与数据 CI

- 全新校准 308 = 176 已知（22 路线各 8）+ 132 非路线（三子类各 44）。credit_direction、debt_direction 各 8，已冻结 ID、标签、样式、顺序及角色组。
- 308 条文本逐条写定，未用模板变体生成，没有读取旧失败问句作为作者来源。旧失败数据仅由不输出原文的自动污染比较器处理。
- 训练成员 1698 = 1289 已知 + 409 非路线，仅重用先前封存的训练成员；没有把 v0.7 或新版校准成员加入训练。
- 自动精确重复和近复制均为 0；跨训练/新校准最大相似度 0.2777777777777778，历史比较最大 0.3333333333333333。
- [数据 CI 38115535440](https://github.com/gali5742/GuiJia/actions/runs/38115535440)：SUCCESS，23 项定向检查通过，编码调用 0。机器人数据封存提交 `55cd93c`。

## 真实编码、执行故障与封存证明

- 原始审计执行合同 `89c6fd9` 在第一轮编码之前冻结 45 个输入绑定。
- [首次审计 CI 38115691756](https://github.com/gali5742/GuiJia/actions/runs/38115691756)：基础检查、21 项测试和 308 次编码成功，提交前重放错误地要求未提交缓存已存在于 HEAD，发生执行顺序故障；缓存未发布、未训练任何权重。故障记录保留。
- 技术修正版 `2010918` 新增 v0.2 工作流和传输合同：提交前用 `--uncommitted-outputs` 重放，机器人提交后验证 committed；原合同、旧工作流、语义规则、数据与数字门槛未修改。
- [修正版审计 CI 38115786264](https://github.com/gali5742/GuiJia/actions/runs/38115786264)：21 项定向检查、308 次编码、零编码重放、机器人提交、提交后验证全部成功，最终冻结训练许可检查主动以退出码 2 失败。CI 总结论是 FAILURE，不能写成 SUCCESS。
- 机器人向量/完整成员/前置门槛封存提交：`f8d4cecc0fb57bdd202dad93bc16a89e36166090`。
- 固定 Xenova/bge-small-zh-v1.5 revision 75c43b069aac4d136ba6bc1122f995fedcfd2781 / Transformers.js 4.2.0 / q8 CPU / 512 维 / mean pooling / normalize / 每次一个问题。
- 本版总真实原始审计编码调用 **616 = 故障轮 308 + 封存轮 308**。不得只把封存轮 308 当作本版总数。后续重放和同集配对证明新增调用 0；训练编码调用 0。

## 冻结预训练结果

条件成员 116 = 98 已知 + 18 非路线，完整原始成员 308 均保留。

| 路线 | 原始样本 | 可达样本 | 最低要求 |
| --- | ---: | ---: | ---: |
| `financial_fortune` | 8 | 5 | 2 |
| `business_operation` | 8 | 2 | 2 |
| `commercial_transaction` | 8 | 2 | 2 |
| `inventory_purchase` | 8 | 6 | 2 |
| `inventory_sale` | 8 | 6 | 2 |
| `borrow_money` | 8 | 6 | 2 |
| `lend_money` | 8 | 6 | 2 |
| `debt_collection` | 8 | 5 | 2 |
| `debt_repayment` | 8 | 6 | 2 |
| `partnership` | 8 | 4 | 2 |
| `investment_profit` | 8 | 7 | 2 |
| `investment_liquidation` | 8 | 5 | 2 |
| `investment_suitability` | 8 | 6 | 2 |
| `investment_position_decision` | 8 | 5 | 2 |
| `investment_price_trend` | 8 | 6 | 2 |
| `income_salary` | 8 | 3 | 2 |
| `income_bonus` | 8 | 4 | 2 |
| `receive_item` | 8 | 4 | 2 |
| `item_purchase` | 8 | 4 | 2 |
| `relationship_development` | 8 | 1 | 2 |
| `marriage_match` | 8 | 3 | 2 |
| `marital_relationship` | 8 | 2 | 2 |

条件非路线：route_unresolved 17、near_domain_not_current_route 0、outside_current_22 1。credit_direction 与 debt_direction 各 3 / 3。近域子类条件分母为 0，属于 not_estimable，不是子类安全 PASS。

**阻断一：** relationship_development 可达样本只有 1，最低要求 2。不得补写本版文本、删除已观察成员或改变门槛以恢复覆盖。

**阻断二：** debt_direction 原始安全组中 1/8 被 Arbitration 选中，最低误激活率 12.5%，超过 5%。即使所有 Fallback 选择都关闭，该下界也无法降低；Router/Scope/Finalization 不抵扣冻结的保守安全计数。

全部非路线固定 Arbitration 选择为 2/132（1.5152%），仅表示整体必要条件下界未超 5%；角色组失败仍阻断本版。没有阈值搜索、训练损失、条件身份 recall/precision 或单独 Fallback 压力评分。

## 同一新校准集上的配对诊断

通过缓存中同时记录的 v0.12 决策和 v0.13 许可决策进行比较，不把 v0.7 与 v0.8 的不同语料比例当作因果改善证据。

| 该 308 条新原始成员 | v0.12 | v0.13 |
| --- | ---: | ---: |
| 非路线 Arbitration 选择 | 10/132 | 2/132 |
| 已知路线 Arbitration 选择 | 62/176 | 45/176 |
| 已知路线直接选择正确 | 58 | 44 |
| 已知路线直接选择错误 | 4 | 1 |

本版移除了 8 个同集非路线直接选择，但没有解决所有剩余歧义；同时减少了已知路线的直接选择，不能将这单独解读为总体正确率或正式运行时保留率改善。仍有 1 个已知路线误选。

当前固定非路线选择的成员 ID：`V013-V08-FI-C-N-1-11`（debt_direction / debt_repayment）、`V013-V08-FI-C-N-1-19`（item_purchase）。其提示是显式缺失角色与多目标表达的责任边界仍不完整；本版不据此修改规则。

## 保留边界与后续方向

- 证据：本版 design / design.lock、data-contract / data-implementation-contract / data.lock、execution-contract、ci-transport-contract-v0.2、reachability-audit / reachability.lock、exposure-report、arbitration-responsibility-review、data-ci-evidence、upstream-ci-evidence 及首次传输故障记录。所有均为新增路径。
- 旧 v0.4–v0.7 失败报告、模型、阈值、数据和上游文件保持原样。未创建本版 model、model.lock、threshold.lock 或训练后 calibration-report。
- 本阶段独立/盲评/预留研究数据读取为 NO，全部 Node 操作预加载读取拦截器。先前 regression-read incident 仍保留，不宣称整个会话无历史评测读取。
- 确切模型变体不可得；Codex GPT-6-based session，不宣称 GPT-6.1 Sol。
- 当前完成计划中的“门槛失败则封存并停止”分支；不进入 Fallback 训练、Selection v0.6 或 Phase C。
- 下一版若获继续指令，先冻结显式角色缺失、多当前目标与被否定目标的许可规则，再冻结全新数据与成员规模。不得在 v0.8 上补样本、改标签、调上游或降低门槛。
