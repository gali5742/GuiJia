# 龟甲 v13.29.0

静态八字 / 六爻排盘、结构分析与古籍检索工具。

当前版本已进入 GitHub Pages 部署前稳定化阶段。页面本身无需 Vite、Webpack 或服务端运行环境；Node 仅用于测试、vendor 校验和 GitHub Actions 发布。

## 目录

正式仓库建议完整保留：

- `index.html`
- `assets/`
- `data/`
- `js/`
- `vendor/`
- `tests/`
- `scripts/`
- `docs/`
- `.github/`
- `.nojekyll`
- `package.json`
- `vendor-config.json`
- `vendor-versions.json`

`vendor/` 在尚未执行 Vendor Snapshot PR 时可以只包含说明文件；Pages workflow 会从固定 npm tarball 生成并校验部署用快照。正式上线前更推荐先运行一次 Vendor Snapshot PR，把 vendor 字节提交进仓库。

## 部署前本地检查

无需安装 npm 依赖：

```bash
npm run predeploy
```

该命令会检查：

- 八字 / 六爻核心回归测试；
- 固定依赖版本策略；
- GitHub Actions / Dependabot 必需配置；
- HTML 引用的本地静态资源是否存在；
- 是否出现未经允许的远程可执行脚本。

## GitHub Pages 发布方式

本版本使用 **GitHub Actions**，不要选择旧的 `Deploy from a branch`。

首次上传仓库后：

1. 打开 `Settings → Pages`；
2. 将 Source 设为 **GitHub Actions**；
3. 确认仓库默认分支为 `main`；
4. Actions 中的 `Test and vendor verification` 通过后，再运行/等待 `Deploy GitHub Pages`；
5. 首次正式发布前，建议手动运行一次 `Vendor Snapshot PR`，审核并合并生成的 vendor 快照。

详细步骤见 `docs/DEPLOYMENT_CHECKLIST.md`。

## 运行依赖

生产固定版本：

- Vue 3.5.40
- lunar-javascript 1.7.7
- Tailwind 兼容 utility CSS：已静态化为 `assets/tailwind-utilities.css`
- 龟甲自身 CSS：`assets/app.css`

GitHub Pages 部署产物中的 Vue 与 lunar 必须是同源文件：

- `vendor/vue.global.prod.js`
- `vendor/lunar.js`

上游版本变化由 Dependabot 与 `Dependency watch` 监测，但不会自动升级生产 vendor。

## 《周易》经文

程序优先读取 `data/iching.json`；若不存在，会使用浏览器缓存，再回退到现有远程数据源。

`data/iching.json` 尚未收入一份由本项目核定的完整 64 卦底本，因此这项内容本地化暂缓。它不参与八字四柱、六爻纳甲、世应、用神等核心结构计算。

## JavaScript 结构

- `js/common.js`：日期、时间与真太阳时修正工具
- `js/iching-loader.js`：《周易》经文的本地 / 缓存 / 远程三级读取
- `js/bazi-core.js`：八字静态规则、五行十神、干支关系与结构计算
- `js/bazi-literature.js`：八字古籍索引与 matcher
- `js/liuyao-core.js`：六爻八宫、纳甲、日月状态、动变、用神与应期核心函数
- `js/liuyao-literature.js`：六爻古籍条目与结构 matcher
- `js/app.js`：Vue 状态、页面导航和两套排盘流程编排

## Vendor 更新原则

**发现新版不等于升级。**

依赖升级必须同步修改固定版本记录，重新生成 vendor，跑回归测试并人工审核。尤其 lunar-javascript 直接参与历法与四柱计算，不允许自动跟随 `latest`。

详见 `docs/VENDOR_UPDATE_GUIDE.md`。
