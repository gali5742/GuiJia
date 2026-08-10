# 龟甲 v13.42.14 · GitHub Pages Actions 热修

基线：v13.42.14。

本热修只处理线上 GitHub Pages workflow 的 Node.js 20 弃用警告，不修改八字、六爻、页面样式、vendor 版本或前端缓存版本。

## 修改内容

- `actions/configure-pages@v5` → `@v6`（Node.js 24）
- `actions/upload-pages-artifact@v3` → `@v5`
- `actions/deploy-pages@v4` → `@v5`（Node.js 24）
- `upload-pages-artifact@v5` 默认不包含点文件，因此显式设置 `include-hidden-files: true`，继续把 `.nojekyll` 放入 Pages artifact。
- 回归测试增加上述版本与 `.nojekyll` 保留检查。

## 应用

将补丁内容覆盖项目根目录后运行：

```powershell
npm run predeploy
git diff --check
```

随后提交并推送到 `main`。新的 `Deploy GitHub Pages` 应继续为 Success，并不再出现 `configure-pages` / `upload-artifact` / `deploy-pages` 的 Node.js 20 deprecated 警告。
