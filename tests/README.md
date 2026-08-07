# 回归测试

运行：

```bash
node tests/run-tests.js
```

或执行完整部署前检查：

```bash
npm run predeploy
```

当前测试覆盖：

- 十神 10×10 映射、藏干、六十甲子旬空；
- 八字 relation code 与典型刑冲合会结构；
- 八字古籍 matcher 不依赖展示文案；
- 乾 / 坤固定卦例、64 卦唯一映射、八宫、纳甲、六神；
- 动变三合 missingBranch 与应期 matcher；
- 六爻古籍 matcher 机器结构路径；
- Tailwind 静态化、六爻录入视觉顺序；
- Vue setup / hash 离线 smoke test；
- vendor 固定版本与监测配置；
- GitHub Pages Actions 部署与最终静态 artifact 校验；
- 部署文档、`.nojekyll`、`.gitattributes` 等首发工程不变量。
