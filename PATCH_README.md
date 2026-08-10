# 龟甲 v13.42.14 增量升级

基线：v13.42.13。

将升级档内容直接覆盖到项目根目录即可。此次只包含窄屏六爻录入布局、GitHub Actions / Dependabot 配置、版本缓存参数、测试与发布文档；不包含未变化的 vendor 文件。

覆盖后建议执行：

```powershell
npm run predeploy
npm run vendor:build
npm run vendor:verify
```

然后在手机或浏览器窄屏模式确认“六爻结果录入”为单列，并按上爻至初爻连续排列。
