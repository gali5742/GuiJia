# 龟甲 v13.44.0-beta.1 · 新时间模型正式切换压力审阅

本报告验证 beta.1 的用户接口切换：页面与复制分析上下文使用 production top-level Time v2；legacy 只保留为 `legacyShadow` 供开发对照，不参与用户输出。

## 压力规模

- 真实六爻组合：4096
- 场景：连续过程范围 / 一周日期选择 / 两日离散比较，共 3 类
- 总运行：12288

## range-process

- 运行：4096
- focus 缺失：0
- outputModel 非 time-v2：0
- legacyShadow 缺失：0
- production 与 Candidate 不一致：0
- Time Review schema 异常：0
- “泄耗”残留：0
- legacy developer token：0
- production / legacyShadow 引用串联：0
- 新旧比较结论变化（仅统计）：0
- 新旧关键日期集合变化（仅统计）：0

## range-selection

- 运行：4096
- focus 缺失：0
- outputModel 非 time-v2：0
- legacyShadow 缺失：0
- production 与 Candidate 不一致：0
- Time Review schema 异常：0
- “泄耗”残留：0
- legacy developer token：0
- production / legacyShadow 引用串联：0
- 新旧比较结论变化（仅统计）：3532
- 新旧关键日期集合变化（仅统计）：3123

## alternatives

- 运行：4096
- focus 缺失：0
- outputModel 非 time-v2：0
- legacyShadow 缺失：0
- production 与 Candidate 不一致：0
- Time Review schema 异常：0
- “泄耗”残留：0
- legacy developer token：0
- production / legacyShadow 引用串联：0
- 新旧比较结论变化（仅统计）：628
- 新旧关键日期集合变化（仅统计）：0

## 结论

- beta.1 正式切换阻断项为 0：production top-level 与 Candidate Output 一致，legacyShadow 可继续用于影子对照。
