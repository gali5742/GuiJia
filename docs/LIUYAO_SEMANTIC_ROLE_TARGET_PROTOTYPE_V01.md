# 角色与占问目标：澄清及统一授权原型 v0.1

日期：2026-10-12（Asia/Tokyo）。研究接口合同先于实现提交：`7a2b8ab`。

**已实现一个独立可运行的结构化事实接口：角色或主要目标未确认时请求澄清，已确认事实与下游候选冲突时拒绝选择。Arbitration 与 Fallback 使用相同的角色/目标约束。尚未实现自然语言事实提取，也未接入生产。**

## 本轮做出的取舍

此前诊断已经显示：充分优化可以增加接纳，但不能可靠判断“谁借给谁”“谁欠谁”，也无法修复上游遗漏第二个占问目标。本轮不增加关键词补丁、不训练模型、不搜索阈值，先把“什么事实齐全时才有资格选择”写成可检验的接口。

接口接收两种明确的来源：人工标注的结构化事实，以及用户对澄清选项的明确确认。未验证的提取结果不能授予权限。事实附带原问题中的证据位置，或对应的确认记录。

**来源与证据位置校验不等于验证语义真伪。** 手工标注的事实仍依赖标注者正确且完整地列出目标与角色；漏掉目标或标错角色，接口自身无法自动识别。22 项接口测试不表示 22 个自然语言问题被自动理解，更不表示泛化或业务安全已通过。

## 支持的最小语义范围

| 当前目标与问卦者角色 | 可以核验的路线 |
| --- | --- |
| 新借款，问卦者拿到别人提供的钱 | borrow_money |
| 新借款，问卦者把钱提供给别人 | lend_money |
| 已有欠款，问卦者是债权人 | debt_collection |
| 已有欠款，问卦者是欠款人 | debt_repayment |
| 自己的生意经营 | business_operation |
| 投入资本的收益 | investment_profit |

当前资金角色范围是问卦者本人。替第三人问款项，以及其余路线，允许明确退出此原型范围，不强行套用“我收钱/我付钱”。Fallback 的候选分数仍须包含全部 22 路线；原型没有把评分缩减为这六条。

## 接口状态与澄清

- `clarify`：目标、角色或完整目标清单尚未确认。一次只问一个问题，两个选择分支都不放行。
- `ready`：单一当前目标及其必要角色已明确，得到 `confirmedRoute`。这只是事实约束，`selectedRoute` 仍为空。
- `authorized`：冻结上游允许执行，且原有候选与已确认事实一致，才返回选定路线。
- `abstain`：用户仍不能确定、超出原型范围、上游阻止、没有唯一候选，或候选与已确认事实冲突。不通过已知事实强行替换候选。

示例澄清文字为“这次你主要想问哪一件事？”“这笔新借款的方向是怎样的？”“这笔已有的欠款是谁欠谁？”“你提到了不止一件事，这次先看哪一件？”。“暂时还不能确定”返回拒答，避免反复问同一问题。

多目标先确认主要目标；该目标若缺角色，再单独确认角色。明确不占问的背景内容应由将来的提取器与用户确认流程正确表示，本接口不依据文本关键词自动切分背景、否定或多个目标。

澄清请求绑定问题、版本和完整结构化状态；过期、字段被改写或无效的回复不能用于另一个状态。回答产生新版本，不修改旧状态。回复演示均为脚本中的模拟选择，没有将它们记作真实用户回答。

## 两条选择分支保留的原约束

- Semantic Act、Sufficiency 或 unsupportedTargets 阻止时，角色确认不能绕过它们。
- Arbitration 仅接受原上游已有的 strong/support 候选，且候选必须与已确认目标和角色一致。继续保留原有 Arbitration 不依赖 Routeability 放行的规则。
- Fallback 必须经过原可达条件：没有 Arbitration 选择且 Routeability 通过；接收全部 22 个有限概率与调用方提供的一个全局阈值，仅唯一接纳可以成为候选。
- 阈值相等时仍接纳；零接纳或多头接纳仍 unresolved，不使用 Top-1 代替唯一接纳。
- 出现方向冲突时阻止已有候选，不能直接输出事实映射得到的“正确路线”。澄清后调用方需重新形成与当前主要目标一致的下游候选，原型不替调用方修补旧候选。

原型保留所有正式组件、数字门槛与失败证据，不改变目前的生产行为。调用方提供的概率与上游事实属于接口输入；本模块不重跑模型，也不验证这些输入是否来自实际编码运行。

## 可运行的 API

加载冻结 inventory 模块 `js/liuyao-semantic-fallback-identity-model-v02.js` 和新模块 `js/liuyao-semantic-role-target-gate-v01.js`，得到 `GuiJia.liuyaoSemanticRoleTargetGateV01`：

```js
const packet = api.makePacket('question-1', questionText);
const assessment = api.assess(packet);
// 显示 assessment.clarification.text 和 options[].text，由用户明确选择。
const next = api.applyAnswer(packet, assessment.clarification, chosenOptionId);
const outcome = api.authorize(next, frozenUpstream, candidate);
```

`candidate` 为 `{source:'Arbitration'}`，或 `{source:'Fallback', probabilities, threshold}`。原始问句进入 `makePacket` 后未做语义提取，默认先请求确认主要目标。人工标注输入包含完整 `goals`、`primaryGoalId`、目标与角色的 value/source/evidence；位置用 JavaScript UTF-16 索引表示。

本轮运行命令：

```bash
source /workspace/.guijia-setup/activate.sh
export NODE_OPTIONS='--require ./scripts/liuyao-semantic-v013-candidate-v07-evaluation-read-guard.cjs'
node --test tests/liuyao-semantic-role-target-gate-v01-tests.mjs
node scripts/demo-liuyao-semantic-role-target-v01.mjs
```

## 验证结果与实际边界

22 项本地定向检查通过，覆盖四种资金角色、经营/投资目标、未确认事实、多目标、澄清状态、第三方/范围外退出、旧回复拒绝、两条分支共同约束、原上游权限、全部 22 头与全局阈值、唯一接纳及方向冲突。

另将上轮四个问题案例作为**事后、人工标注的接口回归演示**：

| 原开发诊断成员 | 本轮供给接口的人工事实 | 接口结果 |
| --- | --- | --- |
| K-05：爸爸借钱给我 | 单一新借款，问卦者拿钱 | 阻止 Fallback 的 lend_money 候选 |
| K-20：我结清欠厂家的款 | 已有欠款，问卦者负债 | 阻止 Fallback 的 debt_collection 候选 |
| N-19：借款及替朋友追讨欠款 | 人工明确列出两个并列目标 | 要求确认主要目标，阻止原 Arbitration 选择 |
| N-22：收客户欠款及申请贷款 | 人工明确列出两个并列目标 | 要求确认主要目标，阻止原 Arbitration 选择 |

四个结果是接口给定事实后的行为证明，不是自动发现这些事实的成功率。未重新评分全部 60 条并宣称改善，也没有把旧开发问句称为新验证集。

本轮新增编码 0、训练拟合 0、阈值搜索 0；仅本地检查与演示，没有新云 CI。独立/盲评/预留研究读取为 NO，历史读取事件保留。未产生正式模型锁、组件通过或 Phase C 许可。

## 下一步应验证什么

这个接口可以作为自然语言提取器或用户确认流程的共同出口，但仍需要小规模验证“能否正确、完整地提取参与者方向与所有活跃目标”。先评估事实本身的准确性、遗漏与澄清负担，再考虑接入正式链路。不应把角色标注正确的接口测试当作事实提取准确率。
