# 运行依赖状态 · v13.32.0

## 生产 Pages：同源 vendor

GitHub Pages 只使用仓库中已经提交并通过校验的 vendor 快照：

```text
仓库 vendor/ + vendor-lock.json
        ↓
SHA-256 / 版本 / LICENSE / JS syntax / lunar smoke test
        ↓
.site/vendor/vue.global.prod.js
.site/vendor/lunar.js
        ↓
静态 artifact 引用检查
        ↓
GitHub Pages
```

固定版本：

- Vue 3.5.40
- lunar-javascript 1.7.7

版本、tarball URL 与 npm integrity 记录在 `vendor-config.json`。

## 源码仓库要求

生产仓库必须直接具有：

- `vendor/vue.global.prod.js`
- `vendor/lunar.js`
- 两份 LICENSE
- `vendor-lock.json`

`index.html` 必须引用本地 vendor 路径。v13.32.0 起，Pages / CI 如果发现 vendor 缺失或校验失败会直接失败，不再静默联网下载替代。更新 vendor 统一通过 `Vendor Snapshot PR` 或人工候选升级流程。

`vendor-lock.json` 保持确定性内容，同一固定版本重复生成不会仅因时间戳产生无意义 PR。

## 更新监测

- Dependabot 每周检查监测 manifest；
- `Dependency watch` 每周读取 npm `latest`；
- 发现变化只创建/更新 tracking Issue；
- 不自动刷新 production vendor。

## 已完全静态化

- `assets/tailwind-utilities.css`
- `assets/app.css`
- 龟甲自身 `js/*.js`
- Pages artifact 内的 Vue / lunar vendor

## 暂缓项

`data/iching.json` 尚未收入由本项目核定的完整 64 卦经文底本，因此经文展示仍保留本地 → 缓存 → 远程回退。这不参与核心排盘计算。
