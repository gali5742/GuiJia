import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index]);

const audit = readJson('data/liuyao-semantic-router-sufficiency-responsibility-audit-v0.1.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const base = readJson('data/liuyao-semantic-route-training-v0.1.json');
const augmentation = readJson('data/liuyao-semantic-route-training-v0.2-augmentation.json');
const targeted = readJson('data/liuyao-semantic-route-training-v0.3-targeted.json');
const expansion = readJson('data/liuyao-semantic-route-training-v0.4-expansion.json');
const expansionPatch = readJson('data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json');
const targeted22 = readJson('data/liuyao-semantic-route-training-v0.5-targeted-22.json');

assert(audit.version === '0.1', `audit version ${audit.version} != 0.1`);
assert(audit.status === 'development_audit', `unexpected audit status ${audit.status}`);
assert(audit.scope === 'liuyao_only', 'responsibility audit must remain LiuYao-only');
assert(audit.freshCandidateEvalPolicy?.reuseCurrent301 === false, 'current 301-row Validation must not be reused as fresh candidate eval');

const routeIds = (inventory.routes || []).map((row) => row.routeId);
assert(routeIds.length === 22, `route inventory count ${routeIds.length} != 22`);

// Load the current deterministic Sufficiency contract and verify the documented coverage gap.
const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, 'js/liuyao-semantic-sufficiency.js'), 'utf8'),
  context,
  { filename:'js/liuyao-semantic-sufficiency.js' }
);
const sufficiency = context.GuiJia?.liuyaoSemanticSufficiency;
assert(sufficiency, 'failed to load LiuYao Semantic Sufficiency');
const sufficiencyRoutes = Object.keys(sufficiency.routeRequirements || {});
const missingSufficiencyRoutes = routeIds.filter((routeId) => !sufficiencyRoutes.includes(routeId));
const finding001 = (audit.findings || []).find((row) => row.id === 'RSA-001');
assert(finding001, 'audit must include RSA-001 sufficiency coverage finding');
assert(sameSet(missingSufficiencyRoutes, finding001.missingSufficiencyRoutes || []), `RSA-001 missing routes drifted: actual=${missingSufficiencyRoutes.join(',')}`);
assert(sufficiencyRoutes.length === 15, `current Sufficiency route count changed to ${sufficiencyRoutes.length}; update the responsibility audit before proceeding`);

const validationRows = [];
const addRouteValidation = (sourceName, source) => {
  for (const [routeId, spec] of Object.entries(source.routes || {})) {
    for (const text of spec.validation || []) {
      validationRows.push({ text, label:routeId, kind:'route-positive', source:sourceName });
    }
  }
};
addRouteValidation('v0.1', base);
addRouteValidation('v0.2-augmentation', augmentation);
addRouteValidation('v0.3-targeted', targeted);
addRouteValidation('v0.4-expansion', expansion);
addRouteValidation('v0.5-targeted-22', targeted22);

const addHardNegatives = (sourceName, rows, labelMap = null) => {
  for (const sample of rows || []) {
    const label = labelMap?.[sample.text] || '__other__';
    validationRows.push({
      text:sample.text,
      label,
      kind:label === '__other__' ? 'genuine-other' : 'contrastive-known',
      source:sourceName
    });
  }
};
addHardNegatives('v0.1-hard-negative', base.hardNegatives?.validation);
addHardNegatives('v0.2-hard-negative', augmentation.hardNegatives?.validation);
addHardNegatives('v0.4-expansion-hard-negative', expansion.hardNegatives?.validation, expansionPatch.validation);
addHardNegatives('v0.5-targeted-22-hard-negative', targeted22.hardNegatives?.validation);

const snapshot = {
  total:validationRows.length,
  routePositive:validationRows.filter((row) => row.kind === 'route-positive').length,
  contrastiveKnown:validationRows.filter((row) => row.kind === 'contrastive-known').length,
  genuineOther:validationRows.filter((row) => row.kind === 'genuine-other').length
};
for (const key of ['total','routePositive','contrastiveKnown','genuineOther']) {
  assert(snapshot[key] === audit.currentValidationSnapshot?.[key], `Validation snapshot ${key} drifted: actual=${snapshot[key]} audit=${audit.currentValidationSnapshot?.[key]}`);
}
assert(snapshot.total === 301, `expected current v0.8.1 Validation total 301, got ${snapshot.total}`);

const rowsByText = new Map();
for (const row of validationRows) {
  const list = rowsByText.get(row.text) || [];
  list.push(row);
  rowsByText.set(row.text, list);
}
for (const item of audit.adjudications || []) {
  const matches = rowsByText.get(item.text) || [];
  assert(matches.length > 0, `audit adjudication text is not present in current Validation: ${item.text}`);
  assert(matches.some((row) => row.label === item.currentExpected), `currentExpected drift for ${item.text}: expected ${item.currentExpected}, current labels=${matches.map((row) => row.label).join(',')}`);
  assert(item.auditOutcome && item.decision && item.reason, `incomplete adjudication contract: ${item.text}`);
}

const taxonomy = new Set((audit.evaluationOutcomeTaxonomy || []).map((row) => row.id));
for (const required of [
  'route_known_sufficient',
  'route_known_insufficient',
  'route_unresolved_underspecified',
  'route_out_of_scope',
  'route_known_no_confirmed_rule',
  'route_known_provisional_only'
]) {
  assert(taxonomy.has(required), `missing evaluation outcome taxonomy: ${required}`);
}

const requiredLabels = new Set(audit.freshCandidateEvalPolicy?.requiredIndependentLabels || []);
for (const label of ['expectedRoute','expectedRouterDisposition','expectedSufficiencyStatus','expectedRuleAvailabilityStatus']) {
  assert(requiredLabels.has(label), `fresh candidate eval policy missing independent label: ${label}`);
}

console.log('LiuYao Semantic Router / Sufficiency responsibility audit verified.');
console.log(`- route inventory: ${routeIds.length}`);
console.log(`- current sufficiency routes: ${sufficiencyRoutes.length}`);
console.log(`- documented sufficiency gaps: ${missingSufficiencyRoutes.join(', ')}`);
console.log(`- current Validation snapshot: ${snapshot.total} (${snapshot.routePositive} route-positive / ${snapshot.contrastiveKnown} contrastive-known / ${snapshot.genuineOther} genuine-other)`);
console.log(`- adjudicated boundary rows: ${(audit.adjudications || []).length}`);
