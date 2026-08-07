# 运行依赖状态 · v13.29.0

## 生产 Pages：同源 vendor

GitHub Pages workflow 在 `.site/` 部署目录保证：

```text
固定 npm package tarball
        ↓
SHA-512 integrity 校验
        ↓
提取发行文件与 LICENSE
        ↓
.site/vendor/vue.global.prod.js
.site/vendor/lunar.js
        ↓
index.html 使用同源路径
        ↓
SHA-256 / JS syntax / lunar smoke test
        ↓
静态 artifact 引用检查
        ↓
GitHub Pages
```

固定版本：

- Vue 3.5.40
- lunar-javascript 1.7.7

版本、tarball URL 与 npm integrity 记录在 `vendor-config.json`。

## 源码仓库的两种状态

### 尚未固化 vendor

`index.html` 可以保留精确版本 CDN 引用用于源码预览；Pages 构建时会改写部署副本为同源 vendor。

### 已运行 Vendor Snapshot PR

仓库会直接具有：

- `vendor/vue.global.prod.js`
- `vendor/lunar.js`
- 两份 LICENSE
- `vendor-lock.json`

并把源码 `index.html` 改为本地 vendor 路径。推荐正式上线前采用这一状态。

`vendor-lock.json` 已改为确定性内容，同一固定版本重复生成不会仅因时间戳产生无意义 PR。

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
