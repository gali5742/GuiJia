# 龟甲 v13.42.13 升级档

基线：v13.42.12。

## 本次修改

- 首页底部新增统一免责声明，八字 / 六爻输入首页共用。
- 免责声明保持低强调度：宽屏与主输入区左边缘对齐，窄屏自动全宽。
- 明确龟甲仅供传统文化学习、研究与娱乐参考；排盘与分析内容不构成医疗、法律、投资等专业意见，也不作为现实决策的唯一依据。
- 不修改八字或六爻排盘、取用、结构解读与应期算法。
- 发布版本、缓存参数、README、发布说明、部署清单与回归测试同步到 v13.42.13。

## 覆盖文件

将升级档中的文件按原目录覆盖到项目根目录：

- `index.html`
- `assets/app.css`
- `package.json`
- `README.md`
- `docs/DEPLOYMENT_CHECKLIST.md`
- `docs/RELEASE_v13.42.13.md`
- `tests/run-tests.js`

覆盖完成后执行：

```bash
npm run predeploy
```

正式推送前再执行 `git diff --check`，并按 `docs/DEPLOYMENT_CHECKLIST.md` 做一次首页免责声明人工 smoke test。
