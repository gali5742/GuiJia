# 龟甲 v13.29.0 · 部署前稳定性审核

## 本轮范围

不修改八字、六爻计算口径与现有 UI，只处理首次 GitHub Pages 部署前的工程收尾。

## 已完成

- 修正根 README 中旧的 v13.26 / branch Pages / Tailwind CDN 说明。
- 明确 GitHub Pages 使用 GitHub Actions 发布。
- 新增首次部署检查清单。
- 新增静态资源引用校验；部署 artifact 禁止远程 executable script。
- Pages 与 CI 均在 vendor 校验后继续检查最终静态 artifact。
- 增加 `.nojekyll` 并纳入 Pages artifact。
- 增加 `.gitattributes`，固定项目文本换行为 LF，并保护已提交 vendor JS 字节不受换行转换。
- `vendor-lock.json` 去除生成时间，使相同固定版本的 vendor 快照可重复生成且不产生纯时间戳 diff。
- 增加基础 meta description。
- 保留 `data/iching.json` 与全球历史时区模型为明确的非首发阻塞项。

## 首发阻塞标准

在 GitHub 上正式发布前应满足：

1. `npm run predeploy` 通过；
2. CI 通过；
3. 推荐运行并合并一次 Vendor Snapshot PR；
4. Pages Source 设为 GitHub Actions；
5. Pages build 中 vendor 与静态 artifact 验证通过；
6. 上线后按 `docs/DEPLOYMENT_CHECKLIST.md` 完成人工 smoke test。
