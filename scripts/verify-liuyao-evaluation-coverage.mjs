import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const fail = (message) => { throw new Error(message); };
const sameSet = (left, right) => {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return JSON.stringify(a) === JSON.stringify(b);
};

const manifest = readJson('data/liuyao-evaluation-coverage-v0.1.json');
const weights = readJson('data/semantic-router-weights-v0.1.json');

if (manifest.version !== '0.1' || manifest.status !== 'development_manifest' || manifest.scope !== 'liuyao_only') {
  fail('LiuYao evaluation coverage manifest metadata mismatch');
}
if (!sameSet(manifest.routerRoutes || [], weights.routeIds || [])) {
  fail('Coverage manifest routerRoutes do not match frozen semantic router routeIds');
}

const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of ['js/liuyao-intent.js', 'js/liuyao-rule-registry.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
}
const registry = context.GuiJia?.liuyaoRuleRegistry;
if (!registry?.observationRules || !registry?.augmentationRules) fail('Unable to load LiuYao Rule Registry');

const manifestRules = manifest.registryRules || [];
const manifestRuleIds = manifestRules.map((item) => item.ruleId);
const registryRuleIds = registry.observationRules.map((item) => item.id);
if (!sameSet(manifestRuleIds, registryRuleIds)) {
  const missing = registryRuleIds.filter((id) => !manifestRuleIds.includes(id));
  const extra = manifestRuleIds.filter((id) => !registryRuleIds.includes(id));
  fail(`Coverage manifest Rule Registry mismatch. Missing=[${missing.join(', ')}] Extra=[${extra.join(', ')}]`);
}
if (new Set(manifestRuleIds).size !== manifestRuleIds.length) fail('Coverage manifest contains duplicate ruleId');

const allowedRouterCoverage = new Set(['direct', 'collapsed', 'absent']);
const allowedParserReachability = new Set(['covered', 'missing_event_entry']);
const allowedPlanExpectation = new Set(['resolved', 'unreachable_from_current_parser', 'resolver_pending', 'provisional_blocked_normal_mode']);

for (const row of manifestRules) {
  const rule = registry.observationRules.find((item) => item.id === row.ruleId);
  if (!rule) fail(`Unknown rule in coverage manifest: ${row.ruleId}`);
  if (row.family !== rule.family) fail(`${row.ruleId} family mismatch: ${row.family} != ${rule.family}`);
  if (row.automationStatus !== rule.automationStatus) fail(`${row.ruleId} automationStatus mismatch: ${row.automationStatus} != ${rule.automationStatus}`);
  const registryEventTypes = rule.appliesTo?.eventTypes || [];
  if (registryEventTypes.length !== 1 || row.eventType !== registryEventTypes[0]) {
    fail(`${row.ruleId} eventType mismatch: manifest=${row.eventType} registry=${registryEventTypes.join('|')}`);
  }
  if (!allowedRouterCoverage.has(row.routerCoverage)) fail(`${row.ruleId} invalid routerCoverage=${row.routerCoverage}`);
  if (!allowedParserReachability.has(row.parserReachability)) fail(`${row.ruleId} invalid parserReachability=${row.parserReachability}`);
  if (!allowedPlanExpectation.has(row.planExpectation)) fail(`${row.ruleId} invalid planExpectation=${row.planExpectation}`);
  if (row.routerCoverage === 'absent') {
    if (row.routerRoute != null) fail(`${row.ruleId} absent routerCoverage must use routerRoute=null`);
  } else if (!weights.routeIds.includes(row.routerRoute)) {
    fail(`${row.ruleId} routerRoute is not present in frozen semantic router: ${row.routerRoute}`);
  }
  if (row.automationStatus === 'provisional' && row.planExpectation !== 'provisional_blocked_normal_mode') {
    fail(`${row.ruleId} provisional rule must be blocked in normal mode`);
  }
}

const manifestAug = manifest.augmentationRules || [];
const manifestAugIds = manifestAug.map((item) => item.ruleId);
const registryAugIds = registry.augmentationRules.map((item) => item.id);
if (!sameSet(manifestAugIds, registryAugIds)) {
  fail('Coverage manifest augmentation rules do not match Rule Registry');
}
for (const row of manifestAug) {
  const rule = registry.augmentationRules.find((item) => item.id === row.ruleId);
  if (row.family !== rule.family || row.automationStatus !== rule.automationStatus) fail(`${row.ruleId} augmentation metadata mismatch`);
  if (!sameSet(row.compatibleRuleRefs || [], rule.appliesTo?.compatibleRuleRefs || [])) fail(`${row.ruleId} compatibleRuleRefs mismatch`);
}

const parserGapEvents = manifestRules
  .filter((row) => row.parserReachability === 'missing_event_entry')
  .map((row) => row.eventType);
if (!sameSet(parserGapEvents, manifest.knownParserEventGaps || [])) {
  fail('knownParserEventGaps must exactly match registry rules marked missing_event_entry');
}

const requiredDiagnostics = ['multiple_goals','partial','unsupported_domain_health','B_NLP_REQUIRED','C_INTENT_SCHEMA_GAP','no_confirmed_rule','no_enabled_confirmed_rule','resolver_pending','rule_conflict'];
if (!sameSet((manifest.diagnosticCoverage || []).map((item) => item.id), requiredDiagnostics)) {
  fail('diagnosticCoverage inventory mismatch');
}

console.log('LiuYao evaluation coverage manifest verification passed');
console.log(`- ${manifestRules.length} observation rules accounted for`);
console.log(`- ${manifestAug.length} augmentation rule(s) accounted for`);
console.log(`- ${weights.routeIds.length} frozen semantic router routes accounted for`);
console.log(`- ${parserGapEvents.length} current parser event-entry gaps recorded`);
