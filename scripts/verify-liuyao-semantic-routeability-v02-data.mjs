import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');

const data = readJson('data/liuyao-semantic-routeability-v0.2-development.json');
assert(data.version === '0.2' && data.status === 'development_data' && data.scope === 'liuyao_only', 'Routeability development contract mismatch');
const groups = ['knownInsufficient','calibrationKnown','calibrationNonRoute','trainingNonRoute'];
for (const group of groups) assert(Array.isArray(data[group]), `missing ${group}`);
assert(data.knownInsufficient.length === 44, `knownInsufficient=${data.knownInsufficient.length}`);
assert(data.calibrationKnown.length === 44, `calibrationKnown=${data.calibrationKnown.length}`);
assert(data.calibrationNonRoute.length === 66, `calibrationNonRoute=${data.calibrationNonRoute.length}`);
assert(data.trainingNonRoute.length === 66, `trainingNonRoute=${data.trainingNonRoute.length}`);

const routeIds = readJson('data/liuyao-semantic-route-inventory-v0.2.json').routes.map((row) => row.routeId);
for (const group of ['knownInsufficient','calibrationKnown']) {
  const counts = Object.fromEntries(routeIds.map((id) => [id, 0]));
  for (const row of data[group]) {
    assert(row.routeabilityLabel === 'route_known', `${group} contains non-positive row`);
    assert(Object.hasOwn(counts, row.routeId), `${group} unknown route ${row.routeId}`);
    counts[row.routeId] += 1;
  }
  for (const [routeId, count] of Object.entries(counts)) assert(count === 2, `${group} ${routeId} count=${count}`);
}
for (const group of ['calibrationNonRoute','trainingNonRoute']) {
  const counts = { outside_current_22:0, route_unresolved:0, near_domain_not_current_route:0 };
  for (const row of data[group]) {
    assert(row.routeabilityLabel === 'non_route', `${group} contains positive row`);
    assert(Object.hasOwn(counts, row.subtype), `${group} unknown subtype ${row.subtype}`);
    counts[row.subtype] += 1;
  }
  for (const [subtype, count] of Object.entries(counts)) assert(count === 22, `${group} ${subtype} count=${count}`);
}

const allRows = groups.flatMap((group) => data[group].map((row) => ({...row, group})));
const byText = new Map();
for (const row of allRows) {
  const text = normalize(row.text);
  assert(text.length >= 4, `too-short row in ${row.group}: ${row.text}`);
  assert(!/[妻财官鬼父母兄弟子孙世爻应爻用神]/.test(text), `traditional terminology leaked: ${row.text}`);
  assert(!/(疾病|病情|生病|健康占|手术结果|疗效|药效|治好|康复)/.test(text), `policy-disallowed health sample leaked: ${row.text}`);
  const previous = byText.get(text);
  assert(!previous, `internal exact duplicate: ${row.text} (${previous?.group} / ${row.group})`);
  byText.set(text, row);
}

const priorFiles = fs.readdirSync(dataDir).filter((name) => {
  if (!name.endsWith('.json')) return false;
  if (name === 'liuyao-semantic-routeability-v0.2-development.json' || name === 'liuyao-semantic-routeability-v0.2-contract.json') return false;
  return name.startsWith('liuyao-semantic-route-training-') ||
    name.startsWith('liuyao-semantic-decision-stack-v0.11') ||
    name.startsWith('liuyao-semantic-decision-stack-v0.12') ||
    name.startsWith('liuyao-entity-typing-') ||
    name.startsWith('liuyao-contextual-object-role-');
});
const priorStrings = new Map();
const collect = (value, file) => {
  if (typeof value === 'string') {
    const normalized = normalize(value);
    if (normalized.length >= 4 && /[\u3400-\u9fff]/.test(normalized)) {
      if (!priorStrings.has(normalized)) priorStrings.set(normalized, file);
    }
    return;
  }
  if (Array.isArray(value)) { value.forEach((item) => collect(item, file)); return; }
  if (value && typeof value === 'object') Object.values(value).forEach((item) => collect(item, file));
};
for (const file of priorFiles) collect(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')), file);
const overlaps = allRows.map((row) => ({ row, prior:priorStrings.get(normalize(row.text)) })).filter((item) => item.prior);
assert(overlaps.length === 0, `exact overlap with prior corpora: ${overlaps.slice(0,10).map((item) => `${item.row.text} -> ${item.prior}`).join(' | ')}`);

console.log('LiuYao Routeability v0.2 development data verified.');
console.log('- fresh rows: 220 (44 known-insufficient / 44 calibration-known / 66 calibration-non-route / 66 training-non-route)');
console.log(`- exact-overlap prior corpus files audited: ${priorFiles.length}`);
console.log('- health-policy and traditional-terminology leakage: 0');
