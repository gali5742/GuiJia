# 龟甲 v13.44.0

## 发布定位

六爻“时间捕捉 / 时间效力 / 日期比较”专项正式版。v13.44.0 不再继续扩展时间判断规则，重点是把 alpha → beta → RC 已验证的新链路稳定发布。

## 正式链路

`QuestionTimeScope → TimeFact → TimeEffect → Node Assessment → Evidence Selector → Structural Relevance → Time Output → Date Selection → User Output`

核心冻结原则：

- TimeEffect 六维：触发 / 生扶 / 比和 / 受制 / 泄力 / 耗力。
- 六合与普通六冲只表示触发关系；五行效力独立计算。
- Date Selection：受制硬门槛；生扶、比和、泄力、耗力分别保留；使用非补偿 Pareto，不使用总分。
- Structural Relevance 只细化实质效力相同的日期，不跨效力维度重新排序。
- KeyLine 先由角色 / 结构确定，旬空、月破等状态本身不反向制造关键爻。
- process-range 使用 Structural Relevance + TimeFact 决定关键节点资格，主要观察爻自身及其变爻保持高相关。

## RC 收口结果

- 间接制约五行在落实类时间事实中统一映射为“耗力”，不再误归“受制”。
- Evidence Selector 保证主要观察爻自身能直接证明某效力时，该直接证据优先保留。
- 摘要效力必须有用户可见证据；复合事实结构化去重；必要时可保留四条证据。
- 页面与复制分析上下文统一读取 Time v2 顶层正式字段。
- RC.2 已并入正式版：23:00–23:59 固定为子时，24:00 换日只决定日辰边界；23:40 在默认换日规则下保持当日日辰、时支为子。
- RC.2 已固化升 / 随 / 屯 / 晋四张真实过程卦端到端 fixture，锁定观察爻自身之变在三合、化空与 4 节点上限竞争中的准入优先级。
- `buildUseGodChoices` 保留 `changedRelation`，观察爻自身之变进入时间证据时保留六亲名称。

## 开发审计链处置

`js/liuyao-time-review.js` 属于 alpha/beta 影子对照工具：

- 正式 `index.html` 不再加载；
- GitHub Pages 构建明确排除；
- 源码文件与历史报告暂保留，便于回溯 alpha/beta 差异；
- `legacyShadow / candidateOutput` 兼容镜像不参与页面、复制上下文或正式日期判断。

这属于代码封存，不是继续维护第二套用户判断模型。后续若删除这些兼容字段，只作为内部清理，不重新打开本专项规则。

## 验收

运行：

```bash
npm run predeploy
npm run review:release
npm run vendor:build
npm run vendor:verify
node scripts/verify-static-site.mjs .site deployed
```

正式压力结果见 `docs/REVIEW_RELEASE_v13.44.0.md`。

## 后续原则

从本版起，新的边界案例默认进入 backlog。只有以下情况允许阻断维护版：

- 错误日期或明显矛盾结论；
- 摘要与证据断裂；
- 页面与复制上下文不一致；
- 运行异常 / 数据结构错误。

其他更细的术数排序、并列消解、超长时间范围等不再阻挡 v13.44.0。
