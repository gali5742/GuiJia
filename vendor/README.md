# vendor snapshots

生产运行使用固定版本：

- Vue 3.5.40
- lunar-javascript 1.7.7

推荐在首次正式部署前，于 GitHub Actions 手动运行 `Vendor Snapshot PR`。它会从 npm 官方 tarball 获取精确固定版本，按 `vendor-config.json` 中的 SHA-512 integrity 校验整个包，再提取发行 JS 与 LICENSE，并创建待审核 PR。

合并后仓库将直接包含：

- `vendor/vue.global.prod.js`
- `vendor/lunar.js`
- `vendor/licenses/`
- `vendor-lock.json`

若尚未固化，Pages workflow 仍会在隔离的 `.site/` 部署产物中生成并验证同源 vendor，不会把第三方 CDN script 发布到线上。
