# v13.36.0 · bazi-timing 拆分审计

## 目的

将 `app.js` 中与大运、流年、流月有关的领域数据组装抽离，降低 Vue orchestration 与命理数据构造之间的耦合。

## 模块边界

### `bazi-core.js` 保留

- 十神、五行、十二长生、纳音、旬空；
- 原局与岁运天干 / 地支关系；
- 伏吟、反吟、岁运并临；
- 三层 / 四层补齐三合、三会、三刑；
- 统一 relation metadata / semantic code。

### `bazi-timing.js` 新增

- `buildYunProfile()`：起运信息 + 大运列表；
- `buildDaYunList()`：大运展示模型；
- `buildLiuNianList()`：流年展示模型；
- `buildLiuYueRanges()`：十二节令月起止范围；
- `buildLiuYueList()`：流月展示模型；
- `getAvailableYearRange()` / `findDaYunIndexForYear()`：年份导航。

### `app.js` 保留

- 当前大运 / 流年 / 流月索引；
- 切换与跳转事件；
- 当前流月提示；
- Vue computed / ref 与页面导航。

## 不变量

- 不改变 `bazi-core` 的关系规则；
- 不改变 UI 读取的大运 / 流年 / 流月字段名；
- 不改变 lunar-javascript 的 sect / getYun 调用参数；
- 不改变节令月的 12 个节气定义和日期比较方式；
- 不修改 CSS、六爻逻辑或页面结构。

## 检查结果

- 核心回归：47 passed / 0 failed；
- `app.js`：865 → 704 行；
- `bazi-timing.js`：独立语法检查通过；
- Vue 离线 setup/hash smoke test 通过；
- source dependency 配置通过；
- lunar vendor 在补丁环境缺失时仍按既有策略 skip，正式仓库会实际执行 pinned lunar 集成回归。
