import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const inventory = readJson('data/liuyao-next-topic-inventory-v0.1.json');
const current = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(inventory.version === '0.1' && inventory.status === 'design_only', 'next-topic inventory must remain design-only');
assert(inventory.policy?.trainingEligible === false && inventory.policy?.calibrationEligible === false && inventory.policy?.blindEligible === false, 'next topics leaked into evaluation/training lifecycle');
assert(inventory.policy?.current22MutationAllowed === false && inventory.policy?.lockedCandidateMutationAllowed === false, 'next-topic prep may not mutate current candidate');
assert(inventory.policy?.traditionalRuleInferenceFromLegacyHeuristics === false, 'legacy heuristics must not become formal traditional rules');
assert(inventory.policy?.healthDiseaseDivinationExcluded === true, 'health/disease boundary drift');
assert(inventory.baseline?.lockedCandidateSha256 === '6503446eb9c9e606ed3de53de5a9e98c1a77362d7a491b2a113f6f31ced059a9', 'baseline candidate SHA drift');
assert(Array.isArray(inventory.topics) && inventory.topics.length === 5, `topic count ${inventory.topics?.length}`);
const expectedThemes = ['career_position','study_exam','travel','litigation_dispute','lost_property'];
assert(JSON.stringify(inventory.topics.map((topic) => topic.themeId)) === JSON.stringify(expectedThemes), 'theme order/inventory drift');

const currentRouteIds = new Set(current.routes.map((route) => route.routeId));
const futureRouteIds = new Set();
for (const topic of inventory.topics) {
  assert(topic.current22 === false, `${topic.themeId} incorrectly marked current22`);
  assert(topic.formalIntentStatus === 'missing_event_schema', `${topic.themeId} formal Intent status drift`);
  assert(topic.formalRuleRegistryStatus === 'no_formal_observation_rule', `${topic.themeId} formal Rule Registry status drift`);
  assert(topic.traditionalRuleResearchNeeded === true, `${topic.themeId} must require traditional-rule research`);
  assert(Array.isArray(topic.modernSemanticHypotheses) && topic.modernSemanticHypotheses.length >= 2, `${topic.themeId} missing semantic hypotheses`);
  for (const hypothesis of topic.modernSemanticHypotheses) {
    assert(hypothesis.status === 'design_hypothesis', `${topic.themeId}/${hypothesis.routeId} escaped design-only state`);
    assert(!currentRouteIds.has(hypothesis.routeId), `${topic.themeId}/${hypothesis.routeId} collides with current22`);
    assert(!futureRouteIds.has(hypothesis.routeId), `duplicate future route hypothesis ${hypothesis.routeId}`);
    futureRouteIds.add(hypothesis.routeId);
    assert(!/[妻财官鬼父母兄弟子孙世应]/.test(hypothesis.routeId), `traditional term leaked into modern route id ${hypothesis.routeId}`);
  }
  assert(Array.isArray(topic.collisionBoundaries) && topic.collisionBoundaries.length >= 3, `${topic.themeId} missing collision boundaries`);
  assert(Array.isArray(topic.futureSlotHypotheses) && topic.futureSlotHypotheses.length >= 3, `${topic.themeId} missing slot hypotheses`);
}

const sourceFiles = ['js/liuyao-intent.js','js/liuyao-rule-registry.js','js/liuyao-core.js','tests/run-tests.js'];
for (const relative of sourceFiles) assert(fs.existsSync(path.join(root, relative)), `audited source missing: ${relative}`);
const intentSource = fs.readFileSync(path.join(root, 'js/liuyao-intent.js'), 'utf8');
const registrySource = fs.readFileSync(path.join(root, 'js/liuyao-rule-registry.js'), 'utf8');
const legacySource = fs.readFileSync(path.join(root, 'js/liuyao-core.js'), 'utf8');
for (const routeId of futureRouteIds) {
  assert(!intentSource.includes(`'${routeId}'`) && !intentSource.includes(`\"${routeId}\"`), `future route ${routeId} already leaked into formal Intent`);
  assert(!registrySource.includes(`route: '${routeId}'`) && !registrySource.includes(`route:\"${routeId}\"`), `future route ${routeId} already leaked into Rule Registry`);
}
for (const legacyRule of ['career-litigation','parents-docs-study','travel','lost-item']) assert(legacySource.includes(`id:'${legacyRule}'`), `legacy audit source no longer contains ${legacyRule}`);

console.log('LiuYao next-topic inventory v0.1 verified.');
console.log('- themes: 5 (career / study / travel / litigation / lost property)');
console.log(`- design-only route hypotheses: ${futureRouteIds.size}`);
console.log('- current22 mutation: forbidden');
console.log('- legacy heuristic -> formal traditional rule promotion: forbidden');
