# Candidate v0.9：Arbitration v0.14 与 Fallback Identity v0.7

日期：2026-10-11（Asia/Tokyo）。分支：`liuyao-semantic-v013-core`。

**结论：数据、上游覆盖及安全下界通过；22 个 Fallback 头从零训练完成，但冻结校准没有可行全局阈值。已封存模型和失败证据，停止本版，不进入 Phase C。**

## 冻结改动与数据

- 设计/schema 提交 `b32cef7` 先于新规则实现、396 条全新文本与编码反馈。Arbitration 实现合同 `3b2060e` 先于文本作者阶段。
- Arbitration v0.14 只限制 v0.13 已有候选，处理显式角色缺失、多当前目标和被否定目标；不创建路线，不授予 Act/Sufficiency 许可，不升级选择强度。12 项定向测试通过。
- 全新原始校准 396 = 264 已知（22 路线各 12）+ 132 非路线（三子类各 44）；两个资金方向安全组各 8。全部成员、标签、样式、顺序提前冻结；逐条写定，无模板扩展。旧失败文本仅经自动污染比较器处理，未作为作者来源。
- 训练成员 1698 = 1289 已知 + 409 非路线，仅重用此前封存训练成员；校准成员未参与训练。
- 精确重复与近复制均为 0；跨训练/校准最大相似度 0.2916666666666667，历史比较最大 0.3。
- [数据 CI 38116656776](https://github.com/gali5742/GuiJia/actions/runs/38116656776)：SUCCESS，28 项定向检查，编码 0。数据封存提交 `6796877`。
- 既有 Semantic Act、Route Sufficiency、Evidence、Routeability、编码器、22 路线清单、Router/TopK、Scope、Compatibility、Finalization、TR/MR、BaZi、知识库及数字门槛保持冻结。加权训练算法 v0.2、1800 epochs 与从零初始化要求保持原值；没有复用旧模型权重或阈值。

## 预训练门槛与实际执行

- 审计合同 `59c6ec8` 在真实编码前冻结 47 个输入绑定。[上游 CI 38116750670](https://github.com/gali5742/GuiJia/actions/runs/38116750670)：SUCCESS，26 项定向检查，完整原始 396 条各编码一次。缓存与条件成员封存提交 `18a7e77`。
- 条件成员 165 = 151 已知 + 14 非路线；22 路线均至少 2 条，恋爱发展 4 条；credit_direction 5，debt_direction 4。覆盖门槛 PASS。
- 条件非路线只有 route_unresolved 14；近域与路线外子类分母均为 0，属于 not_estimable，不宣称这两个条件子类安全 PASS。
- 原始路径 Arbitration 固定非路线选择 2/132，route_unresolved 2/44，两个资金角色组均 0/8，全部安全下界不超过 5%。下界通过仅是训练必要条件。
- 训练合同 `b87ba92ccd9b49bb1bc60be58f226a84fada57e1` 在上述真实门槛通过后冻结 59 个输入绑定，先于新权重和 Fallback 校准概率。
- [训练 CI 38117090744](https://github.com/gali5742/GuiJia/actions/runs/38117090744)：**FAILURE**。15 项定向检查、1698 条训练编码、22 头训练、权重校验及提交、全原始校准、零编码重放和校准结果提交均成功；只有最后组件锁门槛失败。不能将此次 CI 写成 SUCCESS。
- 权重先行封存：`1a0ff1a0778ee8a50de9a81d0cd82d5cc8300ea6`。校准结果封存：`1d80fdc4bbdf5f7c684608a027213b14ff57f0d8`。本地对已提交模型、全部 396 行概率、成员、上游及阈值搜索结果的完整重放通过，新增编码 0。
- 本版真实编码总数 **2094 = 原始审计 396 + 训练 1698**；校准复用 396 条已封存向量，新增编码 0，无执行故障重试。固定 Xenova/bge-small-zh-v1.5 revision 75c43b069aac4d136ba6bc1122f995fedcfd2781 / Transformers.js 4.2.0 / q8 CPU / 512 维 / mean pooling / normalize / 每次一个问题。

## 冻结校准结果

- 枚举 17,429 个候选全局阈值，合并为 8,713 种不同的全部原始 all22 接纳状态；可行状态 **0**。阈值为 null，未生成 threshold.lock。
- 任意阈值最多正确保留 **100/151 = 66.2252%**，低于 80%；至少需要 121 条，缺少 21 条。即使暂不考虑 precision 和安全，也不能通过 recall 门槛。
- accepted precision 至少 98% 时，最多正确保留 **58/151 = 38.4106%**。这是诊断上界，不表示这些阈值满足其他门槛。
- 7,963 种状态满足全原始路径安全，组件身份门槛通过状态为 0；本版主要阻断转移到 Fallback 的区分能力。
- 为诊断展示而选取最大正确数、再最大接纳准确率、再最高阈值的状态：`0.6334807282386276`。其已知接纳 105、正确 100，precision 95.2381%；条件非路线激活 0/14、原始路径非路线激活 2/132。**该数值未被采用为阈值，不产生组件锁。**

以下逐路线计数仅属于上述诊断状态，不是正式运行时或独立评测表现。

| 路线 | 可达已知 | 正确唯一接纳 | 错误唯一接纳 | 零接纳 | 多头接纳 |
| --- | ---: | ---: | ---: | ---: | ---: |
| financial_fortune | 8 | 6 | 1 | 1 | 0 |
| business_operation | 3 | 2 | 0 | 0 | 1 |
| commercial_transaction | 6 | 5 | 0 | 1 | 0 |
| inventory_purchase | 7 | 4 | 0 | 1 | 2 |
| inventory_sale | 9 | 6 | 0 | 0 | 3 |
| borrow_money | 10 | 3 | 1 | 4 | 2 |
| lend_money | 10 | 7 | 0 | 2 | 1 |
| debt_collection | 11 | 6 | 0 | 3 | 2 |
| debt_repayment | 9 | 8 | 0 | 0 | 1 |
| partnership | 5 | 4 | 0 | 1 | 0 |
| investment_profit | 11 | 5 | 0 | 3 | 3 |
| investment_liquidation | 10 | 8 | 1 | 1 | 0 |
| investment_suitability | 8 | 3 | 0 | 5 | 0 |
| investment_position_decision | 7 | 5 | 0 | 2 | 0 |
| investment_price_trend | 5 | 5 | 0 | 0 | 0 |
| income_salary | 5 | 3 | 1 | 1 | 0 |
| income_bonus | 7 | 7 | 0 | 0 | 0 |
| receive_item | 5 | 4 | 0 | 1 | 0 |
| item_purchase | 4 | 2 | 1 | 1 | 0 |
| relationship_development | 4 | 3 | 0 | 0 | 1 |
| marriage_match | 5 | 3 | 0 | 1 | 1 |
| marital_relationship | 2 | 1 | 0 | 1 | 0 |

## 同一新原始集上的 Arbitration 配对诊断

使用相同 396 行缓存中的 v0.13/v0.14 决策，不把不同版本语料的比例变化当作因果证据。

| 该 396 条原始成员 | v0.13 | v0.14 |
| --- | ---: | ---: |
| 非路线直接选择（原始 132） | 3 | 2 |
| 已知直接选择（原始 264） | 60 | 56 |
| 已知直接选择正确 | 57 | 55 |
| 已知直接选择错误 | 3 | 1 |

这些数值描述许可限制的取舍，不替代 Selection、Scope 或 Finalization 的完整验证。

## 封存与下一阶段边界

- 保留所有先前版本的模型、阈值、失败数据、报告与读取事故记录；本轮仅新增文件，未修改旧冻结输入。
- 本阶段独立/盲评/预留研究读取为 NO，Node 操作预加载读取拦截器；先前读取事故保留，不宣称整个会话从未读取历史评测。
- 确切模型变体不可得；Codex GPT-6-based session，不宣称 GPT-6.1 Sol。Page ID 未设置。
- 本版不补写或筛除样本，不改标签、上游、训练权重或数字门槛；不进入 Selection v0.6、Phase C、正式运行时或独立评测。
- 下一版应在新冻结合同中先明确 Fallback 区分能力的改进假设及训练设计，再封存全新校准集。保持现有门槛；本版失败数据只作为保留证据，不用作新校准文本来源。

机器证据：`data/liuyao-semantic-v013-candidate-v09-fallback-identity-v07-posttraining-responsibility-review-v0.1.json`、`data/liuyao-semantic-v013-candidate-v09-fallback-identity-v07-training-ci-evidence-v0.1.json`；原始完整校准报告及 model/model.lock、data/reachability locks 均已封存。
