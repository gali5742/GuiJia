# 龟甲 v13.44.0-rc.2 · 端到端回归审阅

## 新增固定回归

- 23:40 + 24:00 换日：日辰仍为丁巳，时支必须为子。
- 升：旬空世爻丑土发动化午，8/17、8/18、8/19 过程节点完整。
- 随：世爻辰土发动化父母亥水，8/17 亥日必须进入关键节点，效力含耗力。
- 屯：静爻月破正向控制，8/17、8/18、8/20 保持稳定且不膨胀。
- 晋：三合、化空与 4 节点上限竞争时，8/20 observer-change 六冲必须保留，8/18 低相关变爻出空不得反向挤占。

## 设计结论

这些 fixture 直接调用生产 `buildQuestionTimeFocus`，观察对象通过生产 `buildUseGodChoices` 获取，不再使用只含目标爻的简化测试对象，因此能覆盖“真实选择对象 → TimeFact → Structural Relevance → process top-N → Candidate Output”的正式链路。

本轮同时通过强制重新分发 `liuyao-core.js`，消除源码测试已更新但增量部署仍残留旧核心文件的风险。

## 验收结果

- 完整 `predeploy`：409 tests passed，0 failed。
- 新增 RC.2 lunar integration：5 项全部通过；lunar integration 总计 35 passed。
- 正式 4096 卦冻结压力：24,576 日节点，blockers = 0。
- observer-change 机会：逢值 992 / 六冲 1056 / 六合 992，共 3040 / 3040 入选，遗漏 0。
- Evidence uncovered 0；间接制约误映射受制 0；主要观察爻直证遗漏 0。
- 连续过程 4096 卦：重复日期 0，单卦关键节点超过 4 日 0。

结论：本轮没有修改时间判断原则，只把真实用户案例升级为正式端到端回归，并通过强制核心文件覆盖消除增量链残留风险。
