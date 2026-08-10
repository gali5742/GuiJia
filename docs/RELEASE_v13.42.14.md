# 龟甲 v13.42.14

## 本次修订

### 1. 六爻窄屏录入顺序

手机与窄屏下，“六爻结果录入”不再使用两列响应式布局，固定为单列显示。DOM 与视觉顺序均保持：

`上爻 → 五爻 → 四爻 → 三爻 → 二爻 → 初爻`

实际掷币仍按页面既有说明从初爻（第 1 次）开始录入；本次只修正窄屏的视觉排列，不改变六次录入数据对应关系。

### 2. 依赖自动化

- Dependabot 普通 npm version update 的 `open-pull-requests-limit` 设为 `0`，不再自动生成只修改 `package.json` 的版本 PR。
- 删除 Dependabot 对仓库中不存在的 `dependencies`、`review-required` label 配置。
- 修正 `Dependency watch` 的 `gh issue list --search` 引号；创建 issue 时不再依赖自定义 label。
- `dependency-watch.yml`、`test.yml`、`pages.yml`、`vendor-snapshot-pr.yml` 的 `actions/checkout` 与 `actions/setup-node` 从 v4 升至 v5。
- 生产依赖版本维持 Vue 3.5.40 / lunar-javascript 1.7.7，本次不升级 vendor。

### 3. 未变更范围

八字与六爻的排盘规则、自动取用、结构解读、应期、古籍匹配及复制分析上下文均未改变。
