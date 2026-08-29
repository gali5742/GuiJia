import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const blindPath = path.join(dataDir, 'liuyao-semantic-decision-stack-v0.11-sealed-blind-v0.1.json');
const patchPath = path.join(dataDir, 'liuyao-semantic-decision-stack-v0.11-sealed-blind-v0.1-preuse-patch.json');
const inventoryPath = path.join(dataDir, 'liuyao-semantic-route-inventory-v0.2.json');
const blind = JSON.parse(fs.readFileSync(blindPath, 'utf8'));
const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'));
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const fail = (m) => { throw new Error(m); };
const assert = (c, m) => { if (!c) fail(m); };
const norm = (t) => String(t || '').trim().replace(/\s+/g, '');

assert(blind.version === '0.1' && blind.status === 'sealed' && blind.sealed === true, 'blind seal metadata mismatch');
assert(blind.baseStack === 'Semantic Decision Stack v0.11', 'blind base stack mismatch');
assert(patch.version === '0.1-preuse-wording-patch' && patch.status === 'sealed_preuse_patch', 'blind pre-use patch metadata mismatch');
assert(patch.base === path.basename(blindPath), 'blind patch base mismatch');
for (const key of ['modifyV011FromBlind','recalibrateFromBlind','reuseBlindAsTraining','rerunAfterTuningSameVersion']) assert(blind.policy?.[key] === false, `${key} must be false`);
assert(blind.policy?.routerIsFrozenV081 === true && blind.policy?.scopeGateIsFrozenV01 === true && blind.policy?.arbitrationIsV092 === true && blind.policy?.routeIdentityIsV01 === true && blind.policy?.sufficiencyIsFrozenV02 === true, 'frozen component policy mismatch');
assert(blind.policy?.outsideVsUnresolvedDiagnosticOnly === true && blind.policy?.sufficiencyUsesOracleModernSemanticFixtures === true, 'blind responsibility boundary mismatch');

const routeIds = inventory.routes.map((r) => r.routeId);
assert(routeIds.length === 22, 'route inventory count mismatch');
assert(JSON.stringify(Object.keys(blind.routes)) === JSON.stringify(routeIds), 'blind route order/coverage mismatch');
assert(blind.counts?.route_known_regular === 176 && blind.counts?.outside_regular === 60 && blind.counts?.unresolved_regular === 40 && blind.counts?.adversarial === 24 && blind.counts?.total === 300, 'blind counts metadata mismatch');
assert(blind.counts?.adversarial_known === 8 && blind.counts?.adversarial_outside === 8 && blind.counts?.adversarial_unresolved === 8, 'adversarial split mismatch');

const rows = [];
for (const rid of routeIds) {
  const samples = blind.routes[rid]?.samples || [];
  assert(samples.length === 8, `${rid}: expected 8 blind samples`);
  const sufficient = samples.filter((s) => s.expectedSufficiencyStatus === 'sufficient');
  const insufficient = samples.filter((s) => s.expectedSufficiencyStatus === 'semantic_insufficient');
  assert(sufficient.length === 6 && insufficient.length === 2, `${rid}: expected 6 sufficient + 2 insufficient`);
  for (const s of sufficient) assert(s.goalType && s.goalType !== 'unknown' && Array.isArray(s.slots) && s.slots.length > 0, `${rid}/${s.id}: sufficient fixture incomplete`);
  for (const s of insufficient) assert(s.goalType === 'unknown' && Array.isArray(s.slots) && s.slots.length > 0, `${rid}/${s.id}: insufficient fixture must preserve route semantics but omit goal`);
  samples.forEach((s) => rows.push({ ...s, kind:'known', expectedRoute:rid, expectedMainDisposition:'route_known', expectedRejectReason:'not_applicable' }));
}
const outside = blind.rejection?.outside_current_22 || [];
const unresolved = blind.rejection?.route_unresolved || [];
assert(outside.length === 60 && unresolved.length === 40, 'regular rejection counts mismatch');
outside.forEach((s) => rows.push({ ...s, kind:'outside', expectedMainDisposition:'non_route', expectedRejectReason:'outside_current_22' }));
unresolved.forEach((s) => rows.push({ ...s, kind:'unresolved', expectedMainDisposition:'non_route', expectedRejectReason:'route_unresolved' }));
const adversarial = blind.adversarial || [];
assert(adversarial.length === 24, 'adversarial count mismatch');
assert(adversarial.filter((s) => s.expectedMainDisposition === 'route_known').length === 8, 'adversarial known count mismatch');
assert(adversarial.filter((s) => s.expectedRejectReason === 'outside_current_22').length === 8, 'adversarial outside count mismatch');
assert(adversarial.filter((s) => s.expectedRejectReason === 'route_unresolved').length === 8, 'adversarial unresolved count mismatch');
for (const s of adversarial) {
  assert(typeof s.challenge === 'string' && s.challenge, `${s.id}: adversarial challenge missing`);
  if (s.expectedMainDisposition === 'route_known') {
    assert(routeIds.includes(s.expectedRoute), `${s.id}: adversarial route invalid`);
    assert(s.expectedSufficiencyStatus === 'sufficient' && s.goalType !== 'unknown' && s.slots?.length, `${s.id}: adversarial known fixture incomplete`);
  } else {
    assert(s.expectedRoute === '__non_route__' && s.expectedSufficiencyStatus === 'not_applicable', `${s.id}: adversarial rejection contract mismatch`);
  }
  rows.push({ ...s, kind:s.expectedMainDisposition === 'route_known' ? 'known' : (s.expectedRejectReason === 'outside_current_22' ? 'outside' : 'unresolved'), adversarial:true });
}
assert(rows.length === 300, `blind flattened count ${rows.length} != 300`);
const ids = rows.map((r) => r.id);
assert(new Set(ids).size === 300, 'blind IDs are not unique');
for (let i = 1; i <= 300; i++) assert(ids.includes(`BL-${String(i).padStart(3,'0')}`), `missing blind id BL-${String(i).padStart(3,'0')}`);

const replacements = patch.replacements || {};
assert(Object.keys(replacements).length === 3, 'expected exactly 3 pre-use wording corrections');
for (const id of Object.keys(replacements)) assert(ids.includes(id), `patch references unknown blind id ${id}`);
for (const r of rows) if (replacements[r.id]) r.text = replacements[r.id];
const texts = rows.map((r) => norm(r.text));
assert(new Set(texts).size === 300, 'effective blind question text is not internally unique');

const traditional = /(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/;
const health = /(疾病|生病|病情|手术|治疗|就医|医生|医院|健康状况|身体状况)/;
for (const r of rows) {
  assert(r.text && !traditional.test(r.text), `${r.id}: traditional LiuYao terminology leak`);
  assert(!health.test(r.text), `${r.id}: health/disease divination sample forbidden`);
}

const prior = new Map();
const addPrior = (value, source) => {
  if (typeof value !== 'string') return;
  const k = norm(value);
  if (k.length < 6 || /^BL-\d+$/.test(k)) return;
  if (!prior.has(k)) prior.set(k, source);
};
const walk = (value, source, key='') => {
  if (typeof value === 'string') {
    if (['text','question','context','prompt'].includes(key) || key === '') addPrior(value, source);
    return;
  }
  if (Array.isArray(value)) { for (const v of value) walk(v, source, key); return; }
  if (value && typeof value === 'object') for (const [k,v] of Object.entries(value)) walk(v, source, k);
};
const excluded = new Set([path.basename(blindPath), path.basename(patchPath)]);
for (const name of fs.readdirSync(dataDir).filter((n) => n.endsWith('.json') && n.startsWith('liuyao-') && !excluded.has(n))) {
  const src = JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
  walk(src, name);
}
const overlaps = [];
for (const r of rows) {
  const k = norm(r.text);
  if (prior.has(k)) overlaps.push(`${r.id} duplicates ${prior.get(k)}: ${r.text}`);
}
if (overlaps.length) fail(`sealed blind exact overlap(s):\n- ${overlaps.join('\n- ')}`);

console.log('LiuYao Semantic Decision Stack v0.11 Sealed Blind v0.1 verification passed.');
console.log('- sealed=true; 300 total: 176 regular known + 60 outside + 40 unresolved + 24 adversarial');
console.log('- 22 routes × 8 regular samples; each route 6 sufficient + 2 route-known insufficient');
console.log('- adversarial split: 8 known + 8 outside + 8 unresolved');
console.log('- 3 pre-use wording-only seal corrections applied');
console.log('- no traditional LiuYao terminology or health/disease divination samples');
console.log('- zero exact question overlap with prior LiuYao JSON corpora');
