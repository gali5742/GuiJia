# 龟甲 v13.44.0-alpha.6 · 时间效力模型重构第 6 步

## 定位

本阶段只建立开发期新旧时间判断对照审阅能力，不切换正式用户输出。

## 数据流

```text
legacy event → 正式页面 / 复制上下文

TimeFact → TimeEffect → Node Assessment → Evidence Selector → Candidate Output
                                                       ↓
                                             Time Review（本阶段）
```

`Time Review` 只比较两条链的输出，不反向参与 Candidate 计算，也不写回 legacy 字段。

## 验收重点

1. 首选日期或并列状态变化可结构化分类。
2. old/new 节点按日期对齐，可同时查看摘要、日期判断与事实。
3. 4096 卦批量审阅报告可重复生成。
4. 正式页面与「复制分析上下文」保持 alpha.5 行为。


## 审阅发现

批量对照会额外标记 Candidate 日期比较器的跨级风险：`mixed` 日期若同时存在明确受制，当前仍可能因为拥有生扶/比和而压过只有泄力/耗力、无明确受制的 `caution` 日期。本阶段只记录与抽样，不修改比较器。
