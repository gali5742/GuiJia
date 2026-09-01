import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sourceFiles = [
  'js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js','js/liuyao-semantic-route-evidence-v04.js','js/liuyao-semantic-route-evidence-v05.js',
  'js/liuyao-semantic-question-mode-v01.js',
  'js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js','js/liuyao-semantic-route-arbitration-v013.js','js/liuyao-semantic-route-arbitration-v014.js','js/liuyao-semantic-route-arbitration-v015.js'
];
const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of sourceFiles) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidenceApi = context.GuiJia?.liuyaoSemanticRouteEvidenceV05;
const modeApi = context.GuiJia?.liuyaoSemanticQuestionModeV01;
const arbitrationApi = context.GuiJia?.liuyaoSemanticRouteArbitrationV015;
assert(evidenceApi?.extract && modeApi?.classify && arbitrationApi?.arbitrate, 'Candidate v0.7 Question Mode/Arbitration unavailable');
const inspect = (text) => {
  const evidence = evidenceApi.extract(text);
  const mode = modeApi.classify(text, evidence);
  const arbitration = arbitrationApi.arbitrate(text, evidence);
  return { evidence, mode, arbitration };
};

const informationCases = [
  '应收账款在会计上通常怎么做账龄分析',
  '合伙人的权限范围一般怎样写进协议',
  '奖金发放的个税一般如何计算',
  '包裹投递失败后通常怎样重新派送',
  '恋爱关系中的沟通边界通常怎么理解',
  '银行贷款申请条件一般包括什么',
  '办理结婚登记通常需要准备哪些材料',
  '这个概念通常应该怎么理解',
  '一项指标一般如何计算',
  '一份协议里的权限范围通常怎样写清楚',
  '某个流程失败以后通常怎样重新处理',
  '申请时一般需要提交哪些资料'
];
for (const text of informationCases) {
  const result = inspect(text);
  assert(result.mode.mode === 'information_request', `information question mode drift: ${text} -> ${result.mode.mode}`);
  assert(result.arbitration == null, `information request reached Arbitration: ${text}`);
}

const supportedCases = [
  ['这次银行经营贷申请九月能不能批下来','borrow_money'],
  ['客户欠我的设计尾款九月底前能不能收回','debt_collection'],
  ['朋友向我借两万周转，我这回要不要借给他','lend_money'],
  ['这只指数基金再持有四个月能不能盈利','investment_profit'],
  ['我买的路由器星期六以前能不能收到','receive_item'],
  ['我和对象后年有没有机会结婚','marriage_match'],
  ['我们之间这段暧昧会不会发展成恋爱','relationship_development'],
  ['扣完手续费以后这笔基金还能不能盈利','investment_profit'],
  ['虽然贷款申请条件不少，这次经营贷月底能不能批下来','borrow_money'],
  ['虽然登记前要准备很多材料，我们年底能不能结婚','marriage_match']
];
for (const [text, routeId] of supportedCases) {
  const result = inspect(text);
  assert(result.mode.mode === 'outcome_or_decision', `supported outcome question mode drift: ${text} -> ${result.mode.mode}`);
  assert(result.arbitration?.routeId === routeId, `supported outcome route drift: ${text} -> ${result.arbitration?.routeId}`);
}

const undetermined = inspect('最近这件事情让我有点在意');
assert(undetermined.mode.mode === 'undetermined', 'neutral statement must remain undetermined');

const questionModeSource = fs.readFileSync(path.join(root, 'js/liuyao-semantic-question-mode-v01.js'), 'utf8');
const arbitrationSource = fs.readFileSync(path.join(root, 'js/liuyao-semantic-route-arbitration-v015.js'), 'utf8');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'data/liuyao-semantic-route-inventory-v0.2.json'), 'utf8'));
for (const route of inventory.routes || []) {
  assert(!questionModeSource.includes(route.routeId), `Question Mode contains forbidden route-specific term: ${route.routeId}`);
}
for (const term of ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神','SC4-197','SC4-200','SC4-210','SC4-212','SC4-220']) {
  assert(!questionModeSource.includes(term), `Question Mode contains forbidden traditional/row exception term: ${term}`);
  assert(!arbitrationSource.includes(term), `Arbitration v0.15 contains forbidden traditional/row exception term: ${term}`);
}
assert(!questionModeSource.includes('borrow_money') && !questionModeSource.includes('marriage_match'), 'Question Mode must remain route-agnostic');

console.log('LiuYao Candidate v0.7 route-agnostic Question Mode semantics verified.');
console.log('- v0.6 five irreducible strong informational activations stop before Arbitration');
console.log('- prior requirements/material information forms also stop before Arbitration');
console.log('- supported concrete outcome/decision questions retain precedence and route identity');
console.log('- Question Mode contains no route IDs, traditional fields, thresholds or row-specific exceptions');
