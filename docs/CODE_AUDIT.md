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


## v13.30.0 — 八字解释引擎 v1

- 新增 `js/bazi-interpretation.js`，解释层只读取既有结构化结果，不重新排盘。
- 完整三会、三合、三刑等优先依据机器 `code` 识别，不依赖中文展示文案。
- 原局总览新增 3–5 条结构判断、可展开证据与使用边界。
- 新增“复制分析上下文”，只在用户主动点击时写入剪贴板，不发送网络请求。
- 解释层明确不自动给出吉凶、格局、用神、婚姻、事业或具体事件断语。
- 新增解释引擎回归测试。


## v13.31.0 — 八字解释引擎 v2

- 解释层由固定栏目式输出升级为命题合成：月令本气十神、季节状态、根气、印比扶助、透干十神及干支关系先形成局部事实，再组合为高层判断。
- 顶部 headline 改为命盘特定的总括判断，不再显示“程序将如何组织证据”的开发说明式文字。
- 天干解释不再只统计十神数量；可识别正官/七杀/伤官等共同明透，并把天干五合、天干相冲等直接关系纳入同一命题。
- 地支解释聚合多组六合、刑、冲、害、破、三合/三会等结构，避免只按“离月柱/日柱近”挑一组关系。
- 完整三合、三会、三刑仍由机器语义 code 判定，不依赖中文展示文字。
- “查看依据”复用既有 `fold-card compact-fold`、`fold-content`；依据编号列表不再复用固定首列的 `evidence-row`，而使用既有 flex/间距工具类；删除 `.bazi-interpretation-evidence` 专用 CSS。
- 单条判断边界移出卡片，统一使用模块底部边界说明。
- 增加庚金卯月示例与 UI 组件复用测试；总测试 28 passed / 0 failed。


## v13.31.1 — 透干命题与依据编号修正

- 修复同一十神多次透出被误判为“多类十神同时明透”的逻辑。
- 透干主题现在以十神 distinct count 为判断基础。
- 对同一十神重复透出生成“某十神集中透出”命题，并使用专门的综合说明。
- 结构解读依据继续复用全站折叠 UI；未新增 CSS。
- UI 与复制上下文中的依据均改为编号列表。


## v13.31.2 — 查看依据编号布局修正

- 结构解读“查看依据”的编号行不再使用 `evidence-row`。该通用组件固定预留 58px 标签列，适合“得令 / 通根 / 扶助”等键值证据，但不适合 1、2、3 编号。
- 改用项目已有 `flex gap-2 items-start` 工具类，编号只占实际宽度，正文紧随其后。
- `fold-card`、`fold-content`、`evidence-key`、`evidence-value` 继续复用；未新增或修改 CSS。

## v13.31.3 — 单一地支关系总括修正

- 定位 `js/bazi-interpretation.js` 的 `buildHeadline()`：原逻辑只判断地支关系“类型数”，当仅有一种类型时无条件写成“多组”。
- 新逻辑同时统计 `branchRelations.length`：同一类型至少两项才写“多组”；仅一项时写“仅见一处”。
- 新增专项回归测试，确保单一地支关系不会再次被误写为多组。
- 未改 CSS、六爻逻辑或八字排盘计算。


## v13.32.0 — 第一批低风险代码收敛

- 修复八字古籍筛选跨命盘残留：`calculateBazi()` 开始新排盘时恢复“全部”。
- 在 `bazi-core.js` 建立统一 `baziRelationMeta` / `scoreBaziRelation()`；`app.js` 与 `bazi-interpretation.js` 共享同一关系优先级。
- 解释引擎的 complete / stem / branch 关系集合与关系族改由统一元数据派生。
- 删除解释引擎未使用的十神计数、visible/hidden count 字段与未调用 fallback 判断。
- Pages 构建改为 fail closed：必须使用仓库已提交且校验通过的 vendor，不再在失败时静默联网回退。
- `verify-source-config.mjs` 强制 production HTML 仅引用本地 vendor。
- Vendor Snapshot 分支名加入 `GITHUB_RUN_ATTEMPT`，同一 run 重试不会再撞旧分支。
- 增加 5 组专项回归测试；总计 36 passed / 0 failed。
- 未修改 CSS、八字排盘计算口径、六爻业务逻辑或现有页面布局。


## v13.33.0 — 第二批语义化与历法回归

- 将大运、流年、流月相关函数 `calculateStemRelations()`、`calculateBranchRelations()`、`calculatePillarSignals()`、`calculatePairRelations()`、`calculateThreeLayerRelations()`、`calculateFourLayerRelations()` 全部补充稳定机器 `code` 与结构字段。
- 新增 `baziTransitRelationCodes` / `baziTransitRelationMeta`，表达伏吟、反吟、天合地合、岁运并临、同干同支等原局 relation code 无法直接覆盖的岁运语义。
- `uniqueRelations()` 从 `type + text` 去重升级为机器语义 key；显示文案变化不再改变业务去重。
- 结构解读中完整三合、三会、完整三刑只由 `complete-structure` 承担；`branch-network` 过滤完整结构，消除跨判断重复证据。
- headline 在存在完整结构时仍保留完整结构摘要，避免去重后丢失总括信息。
- 新增 `tests/lunar-integration-tests.js`，使用固定历法向量锁定四柱、晚子时 sect、立春前日期、起运和流月结果。
- `npm test` 与 `predeploy` 接入 lunar 集成回归；补丁工作区没有 vendor 时明确跳过，正式仓库中会执行。
- 机器压力测试覆盖：10 万级天干岁运组合、248,832 组外来地支×原局四支组合、全部两层干支组合，以及 20,736 组原局地支解释；未发现缺 code 或完整结构重复证据。
- 未修改 CSS、六爻业务逻辑、八字排盘口径或页面布局。

## v13.34.0 — CSS 无视觉变化清理

- 对 `assets/app.css` 做同 selector / 同条件上下文 / 同 property 的级联可达性分析。
- 只删除被后续同 selector 声明必然覆盖的历史 declaration；未移动仍有效 declaration 的相对位置。
- 共删除 220 个不可达 declaration，其中 46 条旧 rule 清空后删除。
- CSS rule 从 811 降至 765；scoped 重复 selector 从 114 降至 72；文件体积从 109,958 bytes 降至 102,827 bytes。
- 清理前后 2,249 个 `context + selector + property` 的最终赢家全部一致：0 missing、0 extra、0 changed。
- `!important` 数量保持 122；本轮不主动削减，避免在缺少完整浏览器视觉回归环境时引入 specificity 风险。
- 现有 JS 回归测试继续通过；CSS 解析为 0 error。
- 不修改八字、六爻、解释引擎、历法、HTML 结构或响应式断点。

## v13.42.1 发布前清理

- 自然语言小计数统一由 `common.formatNaturalCount` 输出；八字与六爻不再各自维护数字映射。
- 六爻占问关键词规则提升为模块级常量，并补充普通用户输入引导及未命中提示。
- 运行时源码检查未发现 `debugger`、开发调试 `console.log`、TODO / FIXME 残留；历史文档中的版本记录保持不动。
- 应期 `dates/contextDates` 兼容读取仍被回归测试覆盖，因此保留，不作为死代码删除。
- 发布前再次执行八字 50,000 组与六爻 50,176 组压力测试，均为 0 异常。


## v13.42.2 高置信取用收敛

- 六爻占问自动取用从顺序正则命中改为模块级有限规则评分；每个方向区分强对象词与辅助词。
- 自动推荐必须至少命中一个强对象词并达到最低分；两个方向分差不足时返回 `ambiguous`，不自动选择其中任一方向。
- 空白、未命中与模糊状态均只把世爻作为 `suggestedUseKey` 的展示起点，前台目标统一显示“暂未自动判断”，且隐藏“采用建议”按钮。
- 高置信匹配保留候选明爻/伏神逻辑；若方向明确但盘中无候选，继续回退世爻并给出缺失说明。
- 新增普通口语反例与冲突语料回归，防止通过不断扩展关键词来追求表面命中率。
