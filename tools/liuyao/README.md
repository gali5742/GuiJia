# LiuYao development tools

本目录保存六爻开发期、验证期与历史实验入口，不属于正式前台源码根层。

## 目录职责

- `semantic/router/`：Semantic Router 的 POC、candidate eval、decision 与 runtime 测试页面。
- `semantic/decision-stack/`：Semantic Decision Stack 各阶段开发与 sealed-blind 测试页面。
- `semantic/resolution/`：Object Resolver、Entity Typing、Contextual Object Role 等解析专项页面。
- `semantic/gates/`：Scope Gate、Sufficiency、Slot Provider 等门控与接口测试页面。
- `traditional/`：传统六爻规则系统的独立测试入口，例如 Rule Registry。

## Pages 兼容规则

这些页面的**源码**已从仓库根目录移入本目录，但 `scripts/build-pages-site.mjs` 会在构建 GitHub Pages 时继续把它们映射到原来的站点根路径。因此历史测试 URL 保持不变。

例如：

- 源码：`tools/liuyao/semantic/router/semantic-router-poc-v07.html`
- Pages：`semantic-router-poc-v07.html`

## 后续约束

1. 新的 POC / diagnostic / blind-eval / test HTML 不再直接放到仓库根目录。
2. 正式用户入口仍只有根目录 `index.html`。
3. 冻结数据、模型、合同与报告仍由现有 `data/` 管理；执行脚本仍由 `scripts/` 管理，本轮不改变这些冻结路径。
4. 如未来需要进一步整理 `data/` 与 `scripts/`，应单独做带引用迁移审计的结构版本，不与模型训练或阈值变更混在同一提交中。
