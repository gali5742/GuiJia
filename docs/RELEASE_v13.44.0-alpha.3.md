# 龟甲 v13.44.0-alpha.3 · 时间效力模型重构第 3 步

本阶段新增 Node Assessment 聚合层，在 TimeFact / TimeEffect 之上并行生成新的六维节点摘要，但不切换前台用户输出。

## 核心变化

- 新增 `js/liuyao-time-assessment.js`。
- 六维 `trigger / support / peer / constraint / outflow / exertion` 可同时存在。
- 聚合器不读取 legacy `direction / effect`。
- 新摘要不把触发折算成生扶，也不把泄力折算成受制。
- 节点保留每一维的来源原因，为下一阶段证据选择做准备。

## 本阶段不做

- 不替换旧 `effectSummary`。
- 不替换日期选择排序。
- 不切换用户可见证据。
- 不处理 1100 天长范围上限。
