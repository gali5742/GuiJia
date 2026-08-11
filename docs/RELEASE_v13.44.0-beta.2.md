# 龟甲 v13.44.0-beta.2

## 定位

Beta 手测收束版。Time v2 已在 beta.1 接管正式页面与复制上下文；beta.2 不重开判断原则，只修用户输出一致性和证据可读性。

## 修复

1. 复制上下文句末规范化，消除日期判断等字段的双句号。
2. Evidence 用户标签显式补足摘要实质维度，保证“摘要说到什么，用户能从证据直接看到什么”。
3. 日期并列区分“条件接近”和“各有侧重”，不改变 Pareto 前沿。

## 冻结项

- TimeEffect 六维定义；
- Date Selection 六维非补偿 Pareto；
- Structural Relevance 排序边界；
- KeyLine；
- 时间自然语言解析。

## RC 前专项

过程节点选择器仍以旧 `primary tier` 为入口；主要观察爻自身之变逢值虽已具有高 Structural Relevance，但在 992 个范围命中样本中有 600 个未进入关键节点。beta.2 只记录该架构边界，不修改规则。

详见 `docs/REVIEW_BETA2_v13.44.0-beta.2.md`。
