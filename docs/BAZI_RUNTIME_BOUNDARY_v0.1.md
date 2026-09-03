# 龟甲 · BaZi Runtime Boundary v0.1

日期：2026-09-03

## 1. 目的

八字研究链与用户前台运行链必须分离。研究、校准、source audit、profile、contract 等模块可以继续在仓库内演进，但不得因为某个生产模块被加载，就自动进入首页关键路径。

## 2. Production Runtime

生产入口是 `index.html` / GitHub Pages 根路径。

生产运行时遵守：

1. 所有业务脚本必须由 `index.html` 显式声明。
2. 生产可达脚本不得使用 `document.write()` 继续发现或注入其他脚本。
3. `bazi-assessment.js` 是纯模块；当前在生产环境只提供可选 Assessment contract，不负责加载 Synthesis / research 依赖。
4. `bazi-research-bootstrap.js` 明确禁止出现在生产入口。
5. 新模块进入生产前必须经过显式 promotion，而不是依赖链自动扩张。

## 3. Research / Evaluation Runtime

研究运行时与生产运行时分离。

`js/bazi-research-bootstrap.js` 是当前浏览器研究链的显式 opt-in 入口，用于保留既有九个 research root 的加载顺序。它不是生产依赖，也不得由生产模块自动调用。

现有下游 research 模块中仍存在历史 `document.write()` 自加载。这些属于迁移存量，不再允许向生产入口扩散；后续按独立批次逐步改为显式 harness / test dependency。

## 4. Promotion 规则

研究模块若要进入用户前台，至少需要同时满足：

- user-facing 输出有明确需求；
- 依赖集合被显式列出并审计；
- 不使用 parser-discovered / hidden dependency loading；
- production runtime boundary verifier 通过；
- 八字与六爻现有回归通过；
- Pages artifact 校验通过。

Promotion 不等于研究结果已经获得传统规则层面的充分性；语义规则的成熟度与软件运行时的可部署性必须分别审查。

## 5. 机器约束

`scripts/verify-production-runtime-boundary.mjs` 负责检查：

- 生产 `index.html` 的本地 JS 入口；
- production scripts 中不存在 `document.write()` parser loader；
- production 未引用 `bazi-research-bootstrap.js`；
- production JS 文件数与字节数不超过当前安全预算。

该检查同时进入普通 CI 与 GitHub Pages 部署流程。

## 6. 当前边界

v0.1 只完成 Production / Research 的入口分离与机器防线，不在本阶段批量重写全部八字研究模块。

剩余迁移目标：逐步消除 research-only 模块内部的隐式自加载，使研究 harness 也改为显式依赖图。该工作不得与生产可用性修复混在同一提交中。
