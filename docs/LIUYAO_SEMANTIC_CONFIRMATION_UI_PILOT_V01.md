# 六爻语义模型 · 多问题停止规则与验证方案

2026-11-21（日本时间）。用户已明确：语义模型一旦判定本次提出两个或更多独立占问，立即结束本次占卜流程。即使问句同时表达了优先顺序，该判定也直接终止本次请求。初版“选一个主要目标继续”的试测及集成方案已撤回。[原方案存档](https://github.com/gali5742/GuiJia/blob/918de871b6b8c0f81339ad67fa3d131d6404c88c/docs/LIUYAO_SEMANTIC_CONFIRMATION_UI_PILOT_V01.md)。

## 1. 远程接手记录

核对分支 `liuyao-semantic-v013-core`。提交初版方案前，分支与交接快照 [d82a39a](https://github.com/gali5742/GuiJia/commit/d82a39a8cdd7de42a717164b077b95a13b9514e4) 比较为 identical，ahead/behind 均为 0。仓库开放 PR 查询返回 0。相关远程分支还包括 `liuyao-policy-freeze-v013-prep`（40c3036）、`liuyao-semantic-v013-core-train-v01`（6c03ed1）及 `liuyao-semantic-v015-route-sufficiency`（a7885bd）。

| 核对对象 | 仓库已有证据 | 本次核对方式 |
| --- | --- | --- |
| [Phase A](LIUYAO_SEMANTIC_V013_CANDIDATE_V05_ROUTE_SUFFICIENCY_PHASE_A.md) / [Phase B](LIUYAO_SEMANTIC_V013_CANDIDATE_V05_FALLBACK_IDENTITY_PHASE_B.md) | Sufficiency 已锁定；22 头 Fallback 校准无可行统一阈值 | 阅读两份组件报告 |
| [v0.10](LIUYAO_SEMANTIC_V013_CANDIDATE_V10_TRAINING_COVERAGE_REPORT.md) / [v0.11](LIUYAO_SEMANTIC_V013_CANDIDATE_V11_OPTIMIZATION_REPORT.md) | 前者仍无可行阈值；后者止于新校准集重复审计 | 核对停止原因，保留既有失败 |
| [60 题诊断](LIUYAO_SEMANTIC_BOUNDARY_PROBE_V01_REPORT.md) / [28 题诊断](LIUYAO_SEMANTIC_ROLE_TARGET_EXTRACTION_PROBE_V01_REPORT.md) | 控制头多接纳的同时出现 2 次资金方向错误；扁平标签投影只在 15/28 题还原完整目标和角色 | 阅读封存报告 |
| [确认页面与验证说明](LIUYAO_SEMANTIC_CONFIRMATION_UI_V01.md) | 历史运行通过 34 项 Node 检查（会话 12、gate 22）和 15 组 Chromium 检查 | 远程核对说明、页面源码和[接口合同](../data/liuyao-semantic-role-target-prototype-v0.1-contract.json)；本轮未执行 Node、Chromium 或 predeploy |
| 基线 CI | 提交含 `[skip ci]`。该 SHA 的 PR 触发工作流查询和 commit status 查询均为空 | 没有可作为本次定向复跑的记录。查询范围不含全部 push 工作流 |

本轮直接操作远程仓库，未建立工作树。该 SHA 的根目录和 docs 目录 AGENTS.md 查询均返回 404。仓库 README 另列有 predeploy 的全站检查；原型说明给出独立的 Node 和 Chromium 运行命令。本文不记录新的程序测试通过数。

## 2. 判定对象

统计用户要求分别回答的占问。人物、事件、金额、分句、问号或候选路线的数量都不能单独确定问题数。两笔不同的欠款分别索问回收结果，即使同属于收债路线，也构成两个问题。提到两笔款项、只问其中一笔时，另一笔可以只是背景。

| 问句示意 | 预期行为 |
| --- | --- |
| 朋友欠我的钱能收回来吗？我还欠银行的钱，这个月能还上吗？先看朋友那笔。 | 两个独立占问，立即停止 |
| 小王欠的设备款能收回来吗？小李欠的材料款呢？ | 同类路线下分别索问两个结果，立即停止 |
| 我月底得还房贷。朋友欠我的那笔钱，这周能收回来吗？ | 单一占问，房贷是背景。继续适用既有单问题规则 |

以上为规则释例。单问题但资金角色不明的情形沿用单问题自身的判定规则。

## 3. 后续验证

1. **检查模型能否识别多问。** 分开记录实际多问却只识别一问的漏判，以及带背景的单问被误停。[既有边界诊断](LIUYAO_SEMANTIC_BOUNDARY_PROBE_V01_REPORT.md)已记录两条明确多问被 Arbitration 各选一路的开发样例，可用于回归。若开展新的独立测量，另按已有数据冻结流程准备材料。
2. **检查停止是否真实生效。** 通过调用记录验证：一旦输出多问题判定，本次请求即终止；主目标选择界面、后续 Arbitration/Fallback 路线选择及占断均应为零调用。仅观察页面没有展示结果不足以验证流程已停止。
3. **分开报告识别与执行。** 分别给出真实多问识别数/多问总数、单问误停数/单问总数，以及已判多问却调用下游的次数。独立确认原型中的选主目标操作属于历史实验，退出当前试测和集成计划。

本次修订仅确立产品规则和验收口径。生产模型及调用链的实际行为须通过实现核查与运行验证。
