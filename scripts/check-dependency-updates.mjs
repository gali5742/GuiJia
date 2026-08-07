import fs from 'node:fs';
import path from 'node:path';
import { ROOT, getConfig } from './vendor-lib.mjs';

const config = getConfig();
const rows = [];
let hasUpdates = false;

for (const dep of Object.values(config.packages)) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(dep.packageName)}/latest`;
  const response = await fetch(url, { headers: { 'user-agent': 'Guijia-dependency-watch/13.29.0' } });
  if (!response.ok) throw new Error(`npm registry check failed for ${dep.packageName}: ${response.status}`);
  const latest = (await response.json()).version;
  const changed = latest !== dep.version;
  hasUpdates ||= changed;
  rows.push({ package: dep.packageName, production: dep.version, latest, updateAvailable: changed });
}

const report = [
  '# 龟甲依赖版本监测',
  '',
  '> 这里只报告上游版本变化，不会自动修改生产 vendor。升级必须人工查看变更、更新固定版本并通过回归测试。',
  '',
  '| 依赖 | 生产版本 | npm latest | 状态 |',
  '| --- | --- | --- | --- |',
  ...rows.map(r => `| ${r.package} | ${r.production} | ${r.latest} | ${r.updateAvailable ? '有新版本，需评估' : '一致'} |`),
  '',
  `检查时间：${new Date().toISOString()}`,
  ''
].join('\n');

const reportPath = process.env.GUIJIA_DEP_REPORT || path.join(ROOT, 'dependency-report.md');
fs.writeFileSync(reportPath, report);
console.log(report);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_updates=${hasUpdates ? 'true' : 'false'}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `report_path=${reportPath}\n`);
}
