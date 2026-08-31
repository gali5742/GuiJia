import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const inventory = readJson('data/liuyao-next-topic-inventory-v0.1.json');
const policy = readJson('data/liuyao-next-topic-literature-research-policy-v0.1.json');

assert(inventory.status === 'design_only', `next-topic inventory status drift: ${inventory.status}`);
assert(policy.version === '0.1' && policy.status === 'design_policy', 'literature research policy contract drift');
assert(policy.appliesToInventory === 'data/liuyao-next-topic-inventory-v0.1.json', 'literature policy inventory binding drift');

const expectedThemes = ['career_position','study_exam','travel','litigation_dispute','lost_property'];
const inventoryThemes = (inventory.topics || []).map((row) => row.themeId);
assert(inventoryThemes.length === 5, `next-topic theme count ${inventoryThemes.length} != 5`);
assert(expectedThemes.every((id) => inventoryThemes.includes(id)), `next-topic inventory mismatch: ${JSON.stringify(inventoryThemes)}`);
assert((policy.themes || []).length === 5 && expectedThemes.every((id) => policy.themes.includes(id)), 'literature policy must cover all five themes');

for (const topic of inventory.topics || []) {
  assert(topic.current22 === false, `${topic.themeId} unexpectedly entered current22`);
  assert(topic.traditionalRuleResearchNeeded === true, `${topic.themeId} lost traditionalRuleResearchNeeded`);
  assert(topic.formalRuleRegistryStatus === 'no_formal_observation_rule', `${topic.themeId} formal rule appeared before literature gate`);
}

const p = policy.policy || {};
for (const key of [
  'deepLiteratureResearchRequired',
  'mustCompleteBeforeFormalRuleRegistration',
  'mustCompleteBeforeIntentSchemaPromotion',
  'mustCompleteBeforeSemanticTrainingData',
  'legacyHeuristicAloneIsInsufficientEvidence',
  'singleAuthorAloneIsInsufficientEvidence',
  'sourceProvenanceRequired',
  'conflictingViewsMustBeRecorded',
  'traditionalAndModernSemanticLayersMustRemainSeparated',
  'healthDiseaseDivinationExcluded'
]) assert(p[key] === true, `literature research policy missing ${key}`);

const requiredLayers = new Set((policy.requiredResearchLayers || []).map((row) => row.layer));
for (const layer of ['classical_primary_sources','traditional_commentarial_sources','modern_practice_sources','cross_source_reconciliation','formalization_boundary']) {
  assert(requiredLayers.has(layer), `missing literature research layer: ${layer}`);
}

for (const themeId of expectedThemes) {
  const focus = policy.themeResearchFocus?.[themeId];
  assert(Array.isArray(focus) && focus.length >= 3, `${themeId} research focus is underspecified`);
}

const outputs = policy.requiredOutputsPerTheme || [];
for (const required of [
  'source bibliography with provenance',
  'directly supported traditional rule candidates',
  'rule preconditions and exclusions',
  'conflicting or school-specific views',
  'worked-case evidence where available',
  'open questions that remain unsupported by literature'
]) assert(outputs.includes(required), `missing literature research output: ${required}`);

const gate = policy.promotionGate || {};
assert(gate.literatureResearchStatusRequired === 'completed_and_reviewed', 'literature research must be completed and reviewed before promotion');
assert(gate.formalRuleCandidateMayBeCreatedBeforeGate === false, 'formal rule candidate may not precede literature gate');
assert(gate.trainingRowMayBeCreatedBeforeGate === false, 'training row may not precede literature gate');
assert(gate.routeIdMayBecomeCurrentBeforeGate === false, 'route promotion may not precede literature gate');

console.log('LiuYao next-topic literature research policy verified.');
console.log('- themes: career_position, study_exam, travel, litigation_dispute, lost_property');
console.log('- deep literature research required before formal rules, intent promotion, training, or route promotion');
console.log('- legacy heuristic and single-author evidence are insufficient');
