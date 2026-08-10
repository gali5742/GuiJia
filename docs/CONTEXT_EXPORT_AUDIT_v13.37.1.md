# v13.37.1 复制分析上下文同步审核

## 审核范围

同步检查：

- `js/bazi-interpretation.js` 的 `buildBaziContextText()`
- `js/liuyao-interpretation.js` 的 `buildLiuYaoContextText()`
- 八字 `matchedLiterature` 与六爻 literature matcher 的共同字段：`book`、`chapter`、`quote`、`match`、`excerptType`、`verified`、`sourceKind`

## 发现的问题

1. 八字复制文本显示“结构解读 v2”，六爻显示“结构解读 v1”。版本号属于内部解释引擎控制信息，不应进入给用户或外部分析模型的上下文。
2. 两侧古籍复制文本主要输出书名、章节、匹配层级和核对状态，却没有把已核对的古籍原文一起交给进一步分析。
3. 八字和六爻分别维护古籍复制格式，存在后续再次漂移的风险。

## 修改

新增 `GuiJia.common.buildLiteratureContextLines()`，由八字、六爻共同调用。

统一规则：

- 已核对原文（`excerptType !== locator` 且非 `verified:false` / `sourceKind:原典定位`）：输出书名章节、`原文`、`匹配依据`。
- 尚未逐字核对：输出书名章节、`条目定位`、`匹配依据`。即使数据中没有 quote，也只用 chapter 作为定位，不生成拟似原文。
- `level`、`levelKey`、`verified`、`sourceKind` 等仍保留给站内 UI / matcher，但不进入复制文本。
- 用户可见结构段统一为“【结构解读】”。内部 `interpretation.version` 不变。

## 示例

```text
【古籍参考】
- 《增删卜易》·暗动章第二十二
  原文：静爻旺相日辰冲之为暗动，静爻休囚日辰冲之为破。
  匹配依据：三爻官鬼酉、五爻官鬼酉符合当前程序的暗动提示条件。
- 《卜筮正宗》·飞伏神定例
  条目定位：飞伏神定例
  匹配依据：当前识别出伏神候选。
```

## 验证

- 核心回归：51 passed / 0 failed。
- 新增测试锁定八字与六爻都不再输出用户可见 v1/v2。
- 新增测试锁定古籍复制不输出“精确结构 / 精确匹配 / 结构匹配 / 方法参考 / 已核对来源”等元数据。
- 已核对原文与未核对条目定位分别测试。
- 所有 JS 语法检查通过，source dependency 校验通过。
- CSS 未修改。
