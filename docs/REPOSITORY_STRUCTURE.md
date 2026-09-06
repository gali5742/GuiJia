# 龟甲仓库结构

本说明记录 2026-09-06 起采用的仓库职责边界，目的是避免开发期 POC、封存评估页和一次性验证资产继续堆入仓库根目录。

## 1. 根目录原则

仓库根目录只保留项目级入口、正式源码目录和构建配置。

```text
GuiJia/
├─ index.html              # 正式前台入口
├─ assets/                 # 正式静态资源
├─ data/                   # 数据、模型、冻结合同与报告
├─ docs/                   # 项目文档
├─ js/                     # 正式/历史 JS 模块
├─ scripts/                # 构建、验证、训练/评估执行脚本
├─ tests/                  # 自动化回归测试
├─ tools/                  # 开发期与诊断工具入口
├─ vendor/                 # 已锁定第三方快照
├─ .github/                # GitHub Actions / 仓库自动化
└─ package.json / vendor-* # 项目级配置
```

不得再把新的 `*-poc.html`、`*-blind-eval.html`、`*-test.html` 或临时诊断页面直接放到根目录。

## 2. 六爻开发页面

六爻开发页面源码统一放在：

```text
tools/liuyao/
├─ pages.json
├─ semantic/
│  ├─ router/
│  ├─ decision-stack/
│  ├─ resolution/
│  └─ gates/
└─ traditional/
```

`tools/liuyao/pages.json` 是这些页面的单一源码位置 / Pages 部署名称清单。

`scripts/liuyao-tool-pages.mjs` 负责解析该清单。构建脚本和需要检查 HTML 内容的 verifier 必须通过这个清单定位页面，不应重新硬编码“页面位于仓库根目录”。

### Pages 兼容

源码位置改变不等于公开测试 URL 改变。

例如：

```text
source:
tools/liuyao/semantic/router/semantic-router-poc-v081.html

GitHub Pages:
semantic-router-poc-v081.html
```

`scripts/build-pages-site.mjs` 会按照 `pages.json` 映射回原 Pages 根路径，因此历史测试链接保持兼容。

## 3. data/ 与 scripts/ 的过渡状态

`data/` 与 `scripts/` 当前仍有较多六爻 Semantic 历史文件平铺。这是已知技术债，但本轮不做批量物理迁移。

原因：Semantic v0.13 训练线存在大量 immutable lock / contract，明确绑定：

- 文件路径；
- Git blob SHA；
- SHA-256；
- 前置脚本路径；
- workflow 输入路径。

在 Candidate v0.5 仍进行中的情况下批量移动这些文件，会把一次纯仓库整理变成冻结合同重写，并破坏历史可复现性。

因此当前规则是：

1. 已冻结资产保持原路径，不为美观改写历史 lock/contract。
2. Candidate v0.5 已冻结合同中声明的输出继续使用原有路径。
3. 等当前 Candidate 周期结束后，再为新的 Candidate / Semantic 主版本建立新的分层 data/scripts 命名空间；不要原地搬旧资产。
4. 历史资产未来如归档，应通过 manifest/index 记录旧路径与归档状态，而不是删除或覆盖原文件。

## 4. GitHub Actions

GitHub 只识别 `.github/workflows/` 目录第一层的 workflow YAML，因此 active workflow 不应为了目录观感迁移到子目录。

一次性 seal / preseal workflow 在对应 artifact 已封存后，应改为 `workflow_dispatch` 手动触发或明确退役，不应继续对所有 push 自动运行。

长期 CI 才应保留普通 push 触发，例如：

- 核心回归；
- vendor 校验；
- Pages artifact 校验；
- 当前仍有效的仓库一致性审计。

## 5. 后续新增资产的建议落位

### 正式前台功能

```text
js/
assets/
data/
tests/
```

按现有正式模块职责放置。

### 开发/诊断 HTML

```text
tools/<domain>/<topic>/
```

六爻统一从 `tools/liuyao/` 开始。

### 新一代 Semantic 训练资产

当前 v0.5 完成后，新 Candidate 应优先采用新的分层命名空间，例如：

```text
data/liuyao/semantic/v013/candidate-v06/
scripts/liuyao/semantic/v013/candidate-v06/
```

具体层级应在新 Candidate 的第一个 contract 冻结前确定；一旦合同绑定路径，阶段中途不再搬动。

## 6. 本轮整理边界

2026-09-06 本轮只做结构与路径职责整理：

- 根目录开发页迁入 `tools/liuyao/`；
- 历史 Pages URL 保持不变；
- 页面路径建立统一 manifest；
- verifier 改为从 manifest 定位开发页；
- 已封存的 Candidate v0.4 Development Preseal workflow 停止自动 push reseal；
- 不修改任何 Semantic 数据内容、模型权重、阈值、gate 或传统六爻规则。
