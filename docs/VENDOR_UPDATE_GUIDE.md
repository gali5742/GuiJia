# Vendor 升级流程 · 龟甲 v13.29.0

原则：**发现更新 ≠ 自动升级。**

Vue 与 lunar-javascript 都只在人工评估后进入新的生产固定版本；其中 lunar 直接参与历法与四柱计算，升级必须跑历法回归。

## 1. 发现新版

来源有两种：

- Dependabot PR；
- `Dependency watch` 创建的 GitHub Issue。

先确认上游正式版本、release notes / changelog，以及是否属于 prerelease。

## 2. 不要直接合并 Dependabot PR

生产版本同时存在于：

- `vendor-config.json`
- `vendor-versions.json`
- `package.json`

单独修改 `package.json` 会被依赖策略校验阻止。这是刻意设计，用来防止未经验证的自动升级。

## 3. 建升级分支

人工把三个版本记录同步到候选版本，并更新 `vendor-config.json` 中：

- 精确 tarball URL；
- npm 发布的 SHA-512 integrity；
- 如发行文件路径改变，同步 archive/output 配置。

## 4. 生成候选 vendor

在有网络的环境：

```bash
node scripts/fetch-vendor.mjs --target .
node scripts/verify-vendor.mjs .
```

也可先让 GitHub Actions 生成 Vendor Snapshot PR，再在该 PR 上继续审核。

## 5. 跑自动回归

```bash
node tests/run-tests.js
node scripts/verify-source-config.mjs
node scripts/build-pages-site.mjs
node scripts/verify-vendor.mjs .site
```

任何失败都先停止升级。

## 6. lunar 专项人工核对

至少复核：

- 立春前后年柱边界；
- 节气交接前后月柱；
- 子时换日两种口径；
- 闰月 / 历法转换样例；
- 固定八字样例的四柱与大运起算。

若新版结果与旧版不同，必须先查清是否为上游修正、规则口径变化或回归错误。

## 7. Vue 专项核对

- 八字输入、排盘、页面切换；
- 六爻录入与结果页；
- `#bazi` / `#liuyao` hash 初始化；
- 主要响应式布局；
- 浏览器控制台无新增异常。

## 8. 合并与发布

确认后合并升级 PR。Pages workflow 会再次：

1. 跑回归测试；
2. 校验 vendor；
3. 构建 same-origin 部署产物；
4. 发布。

## 9. 回滚

vendor 版本是显式固定的，因此回滚只需恢复上一个已通过测试的提交并重新部署；不要临时指向 `latest`。
