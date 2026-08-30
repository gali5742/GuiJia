import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const target = 'data/liuyao-semantic-routeability-v0.3-calibration.json';
const data = JSON.parse(fs.readFileSync(path.join(root, target), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
assert(data.version === '0.3-calibration-v0.1' && data.status === 'fresh_calibration' && data.scope === 'liuyao_semantic_routeability_v03', 'v0.3 calibration contract mismatch');
assert(data.policy?.useForTraining === false && data.policy?.useAsDevelopmentEval === false && data.policy?.reuseAsBlind === false && data.policy?.prior198Excluded === true, 'v0.3 calibration policy drift');
for (const [key, expected] of Object.entries({ total:223, route_known:88, non_route:135, support_arbitration:44, fallback_head:44, outside_current_22:45, route_unresolved:45, near_domain_not_current_route:45 })) assert(data.counts?.[key] === expected, `count ${key}=${data.counts?.[key]} expected ${expected}`);
assert(Array.isArray(data.rows) && data.rows.length === 223, `rows=${data.rows?.length}`);

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of ['js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js']) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidence = context.GuiJia?.liuyaoSemanticRouteEvidenceV02;
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(evidence?.extract && arbitration?.arbitrate, 'failed to load refined path contract modules');

const seen = new Map();
const mismatches = [];
const traditionalTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const healthTerms = ['疾病','病情','生病','健康占','手术结果','疗效','药效','治好','康复'];
for (const row of data.rows) {
  const text = normalize(row.text);
  assert(/^R03-C-\d{3}$/.test(row.id), `invalid id ${row.id}`);
  assert(text.length >= 4, `too short ${row.id}`);
  assert(!seen.has(text), `internal exact duplicate ${row.id}/${seen.get(text)}: ${row.text}`);
  seen.set(text, row.id);
  for (const term of traditionalTerms) assert(!text.includes(term), `traditional term ${term} leaked in ${row.id}`);
  for (const term of healthTerms) assert(!text.includes(term), `health-policy term ${term} leaked in ${row.id}`);
  if (row.routeabilityLabel === 'route_known') {
    const e = evidence.extract(row.text);
    const a = arbitration.arbitrate(row.text, e);
    const ok = row.candidatePath === 'support_arbitration'
      ? a?.strength === 'support' && a.routeId === row.routeId
      : row.candidatePath === 'fallback_head' ? a == null : false;
    if (!ok) mismatches.push({ id:row.id, path:row.candidatePath, routeId:row.routeId, actual:a, text:row.text });
  } else {
    assert(['outside_current_22','route_unresolved','near_domain_not_current_route'].includes(row.subtype), `${row.id} bad subtype ${row.subtype}`);
  }
}
assert(mismatches.length === 0, `path-contract mismatches (${mismatches.length}): ${mismatches.slice(0,20).map((m) => `${m.id} ${m.candidatePath}/${m.routeId} actual=${JSON.stringify(m.actual)} text=${m.text}`).join(' | ')}`);

const priorFiles = fs.readdirSync(dataDir).filter((name) => name.endsWith('.json') && name.startsWith('liuyao-') && name !== path.basename(target));
const priorStrings = new Map();
const collect = (value, source) => {
  if (typeof value === 'string') {
    const normalized = normalize(value);
    if (normalized.length >= 4 && /[\u3400-\u9fff]/.test(normalized) && !priorStrings.has(normalized)) priorStrings.set(normalized, source);
    return;
  }
  if (Array.isArray(value)) { value.forEach((item) => collect(item, source)); return; }
  if (value && typeof value === 'object') Object.values(value).forEach((item) => collect(item, source));
};
for (const file of priorFiles) collect(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')), file);
const overlaps = data.rows.map((row) => ({ row, prior:priorStrings.get(normalize(row.text)) })).filter((item) => item.prior);
assert(overlaps.length === 0, `exact overlap with prior corpora (${overlaps.length}): ${overlaps.slice(0,15).map((item) => `${item.row.id}:${item.row.text} -> ${item.prior}`).join(' | ')}`);
console.log('LiuYao Routeability v0.3 fresh calibration verified.');
console.log('- rows: 223 (44 support / 44 fallback / 45×3 non-route)');
console.log(`- prior LiuYao JSON files audited: ${priorFiles.length}`);
console.log('- exact overlap: 0; health/traditional leakage: 0');
