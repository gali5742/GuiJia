# 龟甲 v13.43.0

## 定位

本版不是继续补单个“明天 / 周末”正则，而是建立可复用的自然语言占问时间解析基础层。该层先解析民用日期语义，再交给六爻目标时点与应期模块使用；未来也可供八字岁运问句复用。

## 1. QuestionTimeScope

新增 `js/question-time.js`，统一输出：

- `sourceText`：命中的原始时间表达
- `type`：day / calendar-week / rolling-range / bounded-range / alternatives / vague 等
- `precision`：day / day-range / week / month / year / open-range / vague
- `purpose`：target / search-start / search-end / alternatives
- `confidence`：high / medium / low
- `hardFilter`：是否允许约束应期
- `start / end`：实际有效时间窗口
- `calendarStart / calendarEnd`：表达本身对应的完整日历区间
- `dates / alternatives / anchor / boundary`：离散日期、模糊锚点与边界信息

## 2. 支持范围

当前高置信支持相对日、明确年月日、星期、周末、周/月/年、上中下旬、上下半年、滚动窗口、相对偏移、截止 / 起始边界、明确日期范围、离散候选与否定修正。

模糊表达如“最近 / 近期 / 过几天 / 不久 / 左右 / 前后”不会被擅自定义为固定天数，也不会硬过滤应期。

## 3. 六爻接入

- 原 `resolveQuestionTargetDates()` 改为统一解析器的兼容适配层。
- 单日、周末和极短离散日期继续生成现有“目标时点”逐日事实。
- 应期过滤直接使用 `QuestionTimeScope` 范围，不再先展开日期集合再逐日硬比对。
- 搜索起点 / 截止边界可分别限制未来应期的下限 / 上限。
- 低置信与中置信模糊表达不改变原应期结果。

## 4. 自动化测试

新增 `tests/question-time-tests.js`，共 88 项独立测试，覆盖：

- 正常日期 / 星期 / 周末 / 周月年
- 上中下旬、上下半年
- X 天 / 周 / 月 / 年范围与偏移
- 月底 / 年底 / 明确日截止
- 明确范围、跨月范围、跨周范围
- 多候选与否定修正
- 最近 / 近期 / 过几天 / 左右 / 前后
- 月底、年底、闰年、1 月 31 日加月等边界

## 5. 暂不展开

较长范围目前不在详细页逐日铺开六爻作用事实。下一阶段应在 `QuestionTimeScope` 之上设计“范围作用分析”，而不是回到关键词补丁。

## 6. 未变更

- 八字排盘与岁运底座不变。
- 六爻纳甲、世应、六神、动变、三合等排盘结构不变。
- Vue 3.5.40 / lunar-javascript 1.7.7 不升级。
