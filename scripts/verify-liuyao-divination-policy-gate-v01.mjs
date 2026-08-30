import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const gate = read('js/liuyao-divination-policy-gate-v01.js');
const app = read('js/app.js');
const core = read('js/liuyao-core.js');
const index = read('index.html');
const semanticEntry = read('js/liuyao-semantic-policy-entry-v01.js');

assert(gate.includes("reasonCode: 'disallowed_health_or_disease_divination'"), 'policy reason code missing');
assert(semanticEntry.includes("import './liuyao-divination-policy-gate-v01.js'"), 'semantic PoC/runtime entry must share the product policy gate');
assert(semanticEntry.includes('evaluate:gate.evaluate'), 'semantic entry must delegate to the exact shared evaluator');
assert(gate.includes("category: DISALLOWED_CATEGORY"), 'policy category missing');
for (const forbidden of ['妻财','官鬼','父母爻','兄弟爻','子孙爻','用神','世应']) {
  assert(!gate.includes(forbidden), `modern policy gate must not contain traditional routing term: ${forbidden}`);
}

const policyScriptIndex = index.indexOf('./js/liuyao-divination-policy-gate-v01.js');
const appScriptIndex = index.indexOf('./js/app.js');
assert(policyScriptIndex >= 0 && appScriptIndex > policyScriptIndex, 'formal page must load policy gate before app.js');

const calculateStart = app.indexOf('const calculateLiuYao = () => {');
const calculateEnd = app.indexOf('\n            const calculateBazi', calculateStart);
const calculateBody = app.slice(calculateStart, calculateEnd > calculateStart ? calculateEnd : calculateStart + 20000);
assert(calculateBody.includes('evaluateLiuYaoDivinationPolicy(liuyaoForm.question)'), 'calculateLiuYao must evaluate product policy');
assert(calculateBody.indexOf('evaluateLiuYaoDivinationPolicy(liuyaoForm.question)') < calculateBody.indexOf('liuyaoForm.lines.map'), 'product policy must run before line/cast processing');
assert(calculateBody.indexOf('evaluateLiuYaoDivinationPolicy(liuyaoForm.question)') < calculateBody.indexOf('suggestUseGod('), 'product policy must run before legacy suggestUseGod');

const rulesStart = core.indexOf('const USE_GOD_QUESTION_RULES');
const optionsStart = core.indexOf('const USE_GOD_FOCUS_OPTIONS');
const corePolicySensitive = core.slice(rulesStart, core.indexOf('const useGodFocusOptionByTarget', optionsStart));
assert(!corePolicySensitive.includes('career-litigation-illness'), 'legacy illness route id must be removed');
assert(!corePolicySensitive.includes('career-health'), 'legacy health focus id must be removed');
assert(!corePolicySensitive.includes('疾病'), 'legacy auto use-god rules/options must not contain disease routing');
assert(!corePolicySensitive.includes('病情'), 'legacy auto use-god rules/options must not contain disease-state routing');
assert(corePolicySensitive.includes("id:'career-litigation'"), 'career/litigation focus must remain available');
assert(corePolicySensitive.includes("'诉讼'"), 'litigation routing must remain available');
assert(corePolicySensitive.includes("'面试'"), 'employment routing must remain available');

console.log('LiuYao Divination Policy Gate v0.1 integration verified.');
console.log('- formal page: policy before cast/legacy routing');
console.log('- legacy disease/health use-god bypass: removed');
console.log('- employment/litigation legacy behavior: retained');
