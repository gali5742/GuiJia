# 龟甲 v13.44.0-rc.2

本 RC 只处理正式版前端到端回归盲区，不新增时间判断规则。

## 本轮变更

1. 六爻 23:00–23:59 固定显示为子时；24:00 / 23:00 换日只决定日辰边界。
2. `buildUseGodChoices` 保留 `changedRelation`，观察爻自身之变进入时间证据时保留六亲名称。
3. 新增四张真实过程卦 fixture：升、随、屯、晋。
4. `随` 锁定 8/17 观察爻辰土化亥水逢值不得漏；`晋` 锁定 4 节点上限下 8/20 observer-change 六冲不能被低相关变爻出空挤掉。
5. 增量包强制重新携带 `js/liuyao-core.js`、`js/common.js`、`js/app.js`，用于消除增量链或浏览器缓存中的旧核心残留。

## 不变项

六维 TimeEffect、非补偿 Pareto Date Selection、Structural Relevance 层级、KeyLine、自然语言时间解析均继续冻结。
