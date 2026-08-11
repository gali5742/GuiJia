# 龟甲 v13.44.0-beta.3

## 定位

时间专项 RC 前收口候选。只迁移 process-range 关键节点准入，不重新打开已冻结的六维效力与日期选择原则。

## 变更

- `js/liuyao-core.js` 新增过程节点 Structural Relevance + TimeFact 准入，不再读取 legacy tier。
- Structural Relevance 判断触发对象的重要层级，TimeFact 判断该触发是否属于过程状态变化；普通轴线/关系爻的单纯冲合不自动抬升。
- 过程候选按符合过程语义的 trigger 相关性排序；同层再使用触发事实优先级与时间顺序稳定排序。
- 主要观察爻自身之变的逢值 / 六冲 / 六合属于 `observer-change`，正式获得高相关过程节点资格。
- 旧 `tier` 仍保留在 legacyShadow / 旧事件数据中用于影子回归，但不再决定 Time v2 process-range 准入。

## 专项压力

- 4096 种真实六爻组合。
- 主要观察爻发动：2048。
- 观察爻之变在 8/15～8/20 内：逢值 992、六冲 1056、六合 992，共 3040 个触发。
- 迁移后进入过程关键节点：3040 / 3040；遗漏：0。
- beta.2 同项逢值统计为 392 / 992，迁移后为 992 / 992。

详见 `docs/REVIEW_BETA3_v13.44.0-beta.3.md`。
