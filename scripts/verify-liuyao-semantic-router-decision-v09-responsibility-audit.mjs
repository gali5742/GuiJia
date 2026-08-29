import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };

const dev = readJson('data/liuyao-semantic-router-decision-v0.9-development.json');
const wordingPatch = readJson('data/liuyao-semantic-router-decision-v0.9-development-patch.json');
const audit = readJson('data/liuyao-semantic-router-decision-v0.9-validation-responsibility-audit.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const sufficiencySource = readText('js/liuyao-semantic-sufficiency.js');

assert(audit.version === '0.9-validation-responsibility-audit-0.1', 'v0.9 responsibility audit version mismatch');
assert(audit.status === 'post_run_adjudication' && audit.scope === 'liuyao_only', 'v0.9 responsibility audit metadata mismatch');
assert(audit.source === 'liuyao-semantic-router-decision-v0.9-development.json' && audit.sourceSplit === 'validation.underspecified', 'v0.9 responsibility audit source mismatch');
assert(audit.policy?.modifyObservedValidation === false, 'post-run audit must not rewrite observed v0.9 Validation');
assert(audit.policy?.recomputePublishedV09Metrics === false, 'post-run audit must not recompute already reported v0.9 metrics');
assert(audit.policy?.reuseAsFreshEvaluation === false, 'observed v0.9 Validation must not be reused as fresh evaluation');

const replacements = wordingPatch.replacements || {};
const effective = (text) => replacements[text] || text;
const sourceRows = (dev.rejection?.validation?.underspecified || []).map(effective);
assert(sourceRows.length === 33, `source validation underspecified count ${sourceRows.length} != 33`);
assert(audit.sampleCount === 33 && audit.adjudications?.length === 33, 'audit must adjudicate all 33 validation underspecified rows');

const allowedDispositions = new Set(['router_unresolved', 'route_identified_but_semantically_insufficient']);
const routeIds = new Set((inventory.routes || []).map((row) => row.routeId));
const ids = new Set();
let unresolved = 0;
let routeKnownInsufficient = 0;

for (let index = 0; index < audit.adjudications.length; index += 1) {
  const row = audit.adjudications[index];
  const expectedId = `V09-validation-${String(100 + index).padStart(3, '0')}`;
  assert(row.id === expectedId, `audit row ${index + 1} id ${row.id} != ${expectedId}`);
  assert(!ids.has(row.id), `duplicate audit id ${row.id}`);
  ids.add(row.id);
  assert(row.text === sourceRows[index], `audit text drift at ${row.id}`);
  assert(allowedDispositions.has(row.disposition), `invalid disposition ${row.disposition} at ${row.id}`);
  assert(typeof row.reason === 'string' && row.reason.trim(), `missing adjudication reason at ${row.id}`);

  if (row.disposition === 'router_unresolved') {
    unresolved += 1;
    assert(!row.expectedRoute, `${row.id} unresolved row must not invent expectedRoute`);
    continue;
  }

  routeKnownInsufficient += 1;
  assert(routeIds.has(row.expectedRoute), `${row.id} expectedRoute is not in 22-route inventory: ${row.expectedRoute}`);
  assert(row.expectedSufficiencyStatus === 'semantic_insufficient', `${row.id} route-known insufficient row must expect semantic_insufficient`);
  assert(Array.isArray(row.missingSemantics) && row.missingSemantics.length > 0, `${row.id} must name missing downstream semantics`);
}

assert(unresolved === 31, `router_unresolved count ${unresolved} != 31`);
assert(routeKnownInsufficient === 2, `route-identified insufficient count ${routeKnownInsufficient} != 2`);
assert(audit.summary?.router_unresolved === unresolved, 'audit summary router_unresolved mismatch');
assert(audit.summary?.route_identified_but_semantically_insufficient === routeKnownInsufficient, 'audit summary route-known insufficient mismatch');

const byId = new Map(audit.adjudications.map((row) => [row.id, row]));
const receive = byId.get('V09-validation-117');
assert(receive?.expectedRoute === 'receive_item', 'bare “什么时候能收到” must be route-identified as receive_item');
assert(receive.missingSemantics?.includes('delivery_target'), 'bare receive_item must defer missing delivery target to Sufficiency');
assert(sufficiencySource.includes("receive_item:requirement(['delivery_context','delivery_target']"), 'Sufficiency contract no longer requires receive_item delivery target');

const trend = byId.get('V09-validation-128');
assert(trend?.expectedRoute === 'investment_price_trend', 'bare “继续下跌” must be route-identified as investment_price_trend');
assert(trend.missingSemantics?.includes('investment_target'), 'bare investment price trend must defer missing investment target to Sufficiency');
assert(sufficiencySource.includes("investment_price_trend:requirement(['investment_target']"), 'Sufficiency contract no longer requires investment target for price trend');

for (const id of ['V09-validation-102','V09-validation-110','V09-validation-114','V09-validation-116','V09-validation-127','V09-validation-130','V09-validation-131']) {
  assert(byId.get(id)?.disposition === 'router_unresolved', `${id} must remain a true Router-unresolved negative`);
}

console.log('LiuYao Semantic Router Decision v0.9 Validation responsibility audit verified.');
console.log('- 33 observed underspecified rows adjudicated');
console.log('- 31 remain true Router-unresolved negatives');
console.log('- 2 are route-identified and belong to Semantic Sufficiency');
console.log('- observed v0.9 Validation and published metrics remain unchanged');
