import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sourceFiles = [
  'js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js','js/liuyao-semantic-route-evidence-v04.js','js/liuyao-semantic-route-evidence-v05.js',
  'js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js','js/liuyao-semantic-route-arbitration-v013.js','js/liuyao-semantic-route-arbitration-v014.js'
];
const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of sourceFiles) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidenceApi = context.GuiJia?.liuyaoSemanticRouteEvidenceV05;
const arbitrationApi = context.GuiJia?.liuyaoSemanticRouteArbitrationV014;
assert(evidenceApi?.extract && arbitrationApi?.arbitrate, 'Candidate v0.6 Evidence/Arbitration unavailable');
const inspect = (text) => { const evidence = evidenceApi.extract(text); const arbitration = arbitrationApi.arbitrate(text, evidence); return { evidence, arbitration }; };
const hasUnsupported = (result, family) => (result.evidence.unsupportedTargets || []).includes(family);

for (const text of [
  '银行贷款申请条件一般包括什么',
  '某项服务的办理条件通常包括哪些要求',
  '开户申请条件主要包含哪些内容',
  '资格条件一般包括什么'
]) {
  const result = inspect(text);
  assert(hasUnsupported(result, 'rule_or_procedure_information'), `requirements-list information not blocked: ${text}`);
  assert(result.arbitration == null, `requirements-list information reached Arbitration: ${text}`);
}

for (const text of [
  '办理结婚登记通常需要准备哪些材料',
  '办理登记一般需要提交哪些资料',
  '申请认证通常需要提供哪些证明文件',
  '注册时需要携带哪些证件'
]) {
  const result = inspect(text);
  assert(hasUnsupported(result, 'rule_or_procedure_information'), `required-material information not blocked: ${text}`);
  assert(result.arbitration == null, `required-material information reached Arbitration: ${text}`);
}

const borrowOutcome = inspect('这次经营贷申请下个月能不能批下来');
assert((borrowOutcome.evidence.unsupportedTargets || []).length === 0, 'actual loan-approval outcome must remain supported');
assert(borrowOutcome.arbitration?.routeId === 'borrow_money', 'actual loan-approval route drift');

const marriageOutcome = inspect('我和对象明年有没有机会结婚');
assert((marriageOutcome.evidence.unsupportedTargets || []).length === 0, 'actual marriage outcome must remain supported');
assert(marriageOutcome.arbitration?.routeId === 'marriage_match', 'actual marriage outcome route drift');

const materialsBackground = inspect('虽然登记前要准备很多材料，我们年底能不能结婚');
assert((materialsBackground.evidence.unsupportedTargets || []).length === 0, 'materials background must not override supported marriage outcome');
assert(materialsBackground.arbitration?.routeId === 'marriage_match', 'marriage outcome with materials background route drift');

const conditionBackground = inspect('虽然贷款申请条件不少，这次经营贷月底能不能批下来');
assert((conditionBackground.evidence.unsupportedTargets || []).length === 0, 'requirements background must not override supported loan outcome');
assert(conditionBackground.arbitration?.routeId === 'borrow_money', 'loan outcome with condition background route drift');

const v05Governance = inspect('合伙人的职责分工通常怎样写比较清楚');
assert(hasUnsupported(v05Governance, 'governance_or_documentation_information') && v05Governance.arbitration == null, 'Candidate v0.5 governance protection regressed');
const v05Accounting = inspect('应收账款账龄通常怎么分类');
assert(hasUnsupported(v05Accounting, 'administrative_or_accounting_information') && v05Accounting.arbitration == null, 'Candidate v0.5 accounting protection regressed');

const runtimeFiles = ['js/liuyao-semantic-route-evidence-v05.js','js/liuyao-semantic-route-arbitration-v014.js'];
const forbiddenTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神','SC3-196','SC3-210','borrow_money','marriage_match'];
for (const relative of runtimeFiles) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  for (const term of forbiddenTerms) assert(!source.includes(term), `${relative} contains forbidden route/traditional/row exception term: ${term}`);
}

console.log('LiuYao Candidate v0.6 procedure-information semantics verified.');
console.log('- requirements-list and required-material question shapes stop before Arbitration');
console.log('- no route-specific exceptions or new unsupported family were added');
console.log('- supported loan approval and marriage outcomes retain precedence');
console.log('- Candidate v0.5 governance/accounting information protections remain intact');
