# 龟甲 v13.29.0 · GitHub Pages 首次部署检查清单

这份清单只处理“首次正式部署前必须确认的事项”，不包含后续功能开发。

## A. 上传 GitHub 之前

- [ ] 以 v13.29.0 包作为仓库基线，不混入旧版根目录文件。
- [ ] 默认分支准备使用 `main`。
- [ ] 保留 `.github/`、`scripts/`、`tests/`、vendor 配置文件。
- [ ] 运行 `npm run predeploy`，必须零失败。
- [ ] 确认 `index.html` 的标题、站名、八字/六爻入口均为当前版本。
- [ ] 不提交出生信息、占问记录、浏览器缓存导出等私人数据。

## B. Vendor 首次固化

推荐在正式发布前完成一次：

1. 仓库上传后打开 `Actions`；
2. 手动运行 `Vendor Snapshot PR`；
3. workflow 会取得固定的 Vue 3.5.40 与 lunar-javascript 1.7.7；
4. 校验 npm tarball integrity；
5. 生成 `vendor/` 与确定性的 `vendor-lock.json`；
6. 创建 PR；
7. 等 CI 全绿后人工合并。

即使暂不执行该步骤，Pages workflow 也会在部署 artifact 中生成同源 vendor；但把快照提交进仓库后，源码本身也不再依赖 CDN 才能启动。

## C. GitHub Pages 设置

- [ ] `Settings → Pages → Source` 选择 **GitHub Actions**。
- [ ] 不使用 `Deploy from a branch`。
- [ ] 仓库 Actions 权限允许标准 GitHub Actions 运行。
- [ ] `main` 分支上的 `Test and vendor verification` 通过。
- [ ] `Deploy GitHub Pages` build job 通过。
- [ ] deploy job 给出 Pages URL。

## D. 首次上线后的人工 smoke test

分别检查桌面宽屏和窄屏：

- [ ] 首页可在“八字 / 六爻”之间切换。
- [ ] 直接访问 `#bazi` 正常。
- [ ] 直接访问 `#liuyao` 正常，且不会跳回八字。
- [ ] 八字可完成一次固定样例排盘并进入结果页。
- [ ] 六爻可录入六爻、模拟起卦并进入结果页。
- [ ] 六爻显示顺序仍为“上爻在上、初爻在下”。
- [ ] 全卦结构横向摘要排版正常。
- [ ] 古籍区域无 JavaScript 报错。
- [ ] 浏览器控制台没有 404 的 CSS / JS / 图片资源。
- [ ] Network 中 Vue / lunar 来自本站 `vendor/`，而不是 unpkg。

## E. 依赖监测确认

- [ ] `Dependency watch` 可以手动运行一次。
- [ ] Dependabot 已启用。
- [ ] 新版监测只报告，不自动更新生产 vendor。

## F. 暂缓但不阻止部署

以下项目明确不作为首发阻塞项：

- `data/iching.json` 完整本地底本；
- 全球历史时区 / DST 时间模型重构；
- CSS 最终去重整理；
- 排盘结果持久化、导出等新增功能。
