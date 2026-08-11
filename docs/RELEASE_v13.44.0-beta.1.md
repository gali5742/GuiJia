# 龟甲 v13.44.0-beta.1 · Time v2 正式切换

## 目标

将 alpha.1～alpha.11 已完成并冻结的 Time v2 链路正式接管用户时间分析，同时保留 legacy 影子结果用于 beta/RC 对照。

## 用户输出路径

`TimeFact → TimeEffect → Node Assessment → Evidence Selector → Structural Relevance → Candidate Output → Date Selection → questionTimeFocus production top-level → 页面 / 复制分析上下文`

## 影子路径

旧 `effectSummary / assessment / facts / comparison` 继续计算，但仅写入 `legacyShadow`。`Time Review` 在 beta.1 起读取 `legacyShadow` 对照 production top-level。

## 验收

- 4096 卦 × 3 类问题 = 12,288 次切换压力。
- production/Candidate mismatch：0。
- legacyShadow 缺失：0。
- Review schema 异常：0。
- Time v2 可见文案“泄耗”残留：0。
- legacy developer token 泄露：0。
- 页面与复制上下文均只读取 production top-level，不直接读取 `candidateOutput` 或 `legacyShadow`。

## beta 边界

Date Selection 判断原则已在 alpha.10 冻结。beta 阶段不继续研究排序权重，只处理阻断性 bug、输出错位、证据/摘要矛盾和运行异常。
