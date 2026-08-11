# 龟甲 v13.44.0-alpha.2 · 时间效力模型重构第 2 步

## 定位

本阶段只建立 Fact → Effect 映射，不替换节点聚合器。

当前数据流：

`日期事件检测 → TimeFact → TimeEffect`

同时保留：

`legacy event → 旧节点摘要 / 旧日期排序 / 旧展示`

因此 alpha.2 的架构数据已经改变，但用户结果原则上不变。

## 六维 Effect 不变量

- `trigger`：触发
- `support`：生扶
- `peer`：比和
- `constraint`：受制
- `outflow`：泄力
- `exertion`：耗力
- 六合与普通六冲不得自动映射为生扶／受制。
- “观察爻生目标日”只能映射为泄力，不得映射为受制。
- “观察爻克目标日”只能映射为耗力，不得映射为生扶。
- TimeEffect 不读取 legacy `supportive / adverse / mixed` 作为六维判断依据。
- TimeEffect 仍不负责吉凶总评、日期排名或证据展示。
