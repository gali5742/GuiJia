# 龟甲 v13.44.0-alpha.1 · 时间效力模型重构第 1 步

## 定位

本阶段只建立 Fact 层，不替换效力聚合层。

数据流暂时变为：

`日期事件检测 → TimeFact + legacy event → 旧效力聚合 / 旧展示`

下一阶段再变为：

`TimeFact → Effect → Node Assessment → Evidence`

## 不变量

- TimeFact 只记录事实，不记录吉凶方向。
- TimeFact 不携带 `direction / effect / score / tier`。
- 值／合／冲与五行关系是不同事实，不互相覆盖。
- compound fact 可声明其包含的子事实。
- 旧页面结果在本阶段原则上保持不变。
- 六爻时间术语统一使用“泄力”。
