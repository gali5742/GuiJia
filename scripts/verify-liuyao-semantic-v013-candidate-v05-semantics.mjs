import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sourceFiles = [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-evidence-v04.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-arbitration-v013.js'
];
const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of sourceFiles) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidenceApi = context.GuiJia?.liuyaoSemanticRouteEvidenceV04;
const arbitrationApi = context.GuiJia?.liuyaoSemanticRouteArbitrationV013;
assert(evidenceApi?.extract && arbitrationApi?.arbitrate, 'Candidate v0.5 Evidence/Arbitration unavailable');

const inspect = (text) => {
  const evidence = evidenceApi.extract(text);
  const arbitration = arbitrationApi.arbitrate(text, evidence);
  return { evidence, arbitration };
};
const unsupported = (result, family) => (result.evidence.unsupportedTargets || []).includes(family);

const regressionPartnership = inspect('合伙人的职责分工通常怎样写比较清楚');
assert(unsupported(regressionPartnership, 'governance_or_documentation_information'), 'partnership documentation information must be unsupported');
assert(regressionPartnership.arbitration == null, 'unsupported partnership documentation must stop before Arbitration');

const regressionReceivable = inspect('应收账款账龄通常怎么分类');
assert(unsupported(regressionReceivable, 'administrative_or_accounting_information'), 'receivables aging classification must be unsupported');
assert(regressionReceivable.arbitration == null, 'unsupported accounting classification must stop before Arbitration');

const generalizedGovernance = inspect('合伙协议里的权责通常应该怎么写才清楚');
assert(unsupported(generalizedGovernance, 'governance_or_documentation_information'), 'generalized governance/documentation how-to must be unsupported');
assert(generalizedGovernance.arbitration == null, 'generalized governance/documentation how-to must not route');

const generalizedAccounting = inspect('应收账款账龄一般按什么标准分类');
assert(unsupported(generalizedAccounting, 'administrative_or_accounting_information'), 'generalized accounting classification must be unsupported');
assert(generalizedAccounting.arbitration == null, 'generalized accounting classification must not route');

const debtDocument = inspect('朋友借款时欠条一般应该怎么写');
assert(unsupported(debtDocument, 'governance_or_documentation_information'), 'debt-document how-to must be unsupported');
assert(debtDocument.arbitration == null, 'debt-document how-to must stop before Arbitration');

const accountingStatement = inspect('现金流量表通常应该怎么编制');
assert(unsupported(accountingStatement, 'administrative_or_accounting_information'), 'financial-statement compilation must be unsupported');
assert(accountingStatement.arbitration == null, 'financial-statement compilation must stop before Arbitration');

const inventoryLedger = inspect('库存台账一般应该怎么填写');
assert(unsupported(inventoryLedger, 'administrative_or_accounting_information'), 'inventory-ledger documentation must be unsupported');
assert(inventoryLedger.arbitration == null, 'inventory-ledger documentation must stop before Arbitration');

const debtOutcome = inspect('这笔应收账款月底以前能不能收回');
assert((debtOutcome.evidence.unsupportedTargets || []).length === 0, 'actual debt-collection outcome must remain supported');
assert(debtOutcome.arbitration?.routeId === 'debt_collection' && debtOutcome.arbitration?.strength === 'strong', 'actual debt-collection outcome route drift');

const partnershipOutcome = inspect('我和朋友合伙开店以后能不能稳定做下去');
assert((partnershipOutcome.evidence.unsupportedTargets || []).length === 0, 'actual partnership outcome must remain supported');
assert(partnershipOutcome.arbitration?.routeId === 'partnership' && partnershipOutcome.arbitration?.strength === 'strong', 'actual partnership outcome route drift');

const feeBackgroundProfit = inspect('扣完手续费以后这只基金还能不能盈利');
assert((feeBackgroundProfit.evidence.unsupportedTargets || []).length === 0, 'fee mention must not override a positive supported profit target');
assert(feeBackgroundProfit.arbitration?.routeId === 'investment_profit' && feeBackgroundProfit.arbitration?.strength === 'strong', 'supported profit target with fee background route drift');

const accountingBackgroundDebtOutcome = inspect('虽然这笔应收账款账龄已经很长，但月底以前还能不能收回');
assert((accountingBackgroundDebtOutcome.evidence.unsupportedTargets || []).length === 0, 'accounting background must not override a positive debt-collection target');
assert(accountingBackgroundDebtOutcome.arbitration?.routeId === 'debt_collection', 'debt outcome with accounting background route drift');

const legacyAdministrative = inspect('工资条里的社保应该怎么核算');
assert((legacyAdministrative.evidence.unsupportedTargets || []).includes('administrative_or_accounting_information'), 'existing v0.3 administrative information coverage regressed');
assert(legacyAdministrative.arbitration == null, 'existing administrative information should remain blocked before Arbitration');

const ordinaryPurchase = inspect('这台投影仪现在值不值得买');
assert((ordinaryPurchase.evidence.unsupportedTargets || []).length === 0, 'ordinary supported purchase must remain routable');
assert(ordinaryPurchase.arbitration?.routeId === 'item_purchase', 'ordinary purchase route drift');

const runtimeFiles = ['js/liuyao-semantic-route-evidence-v04.js','js/liuyao-semantic-route-arbitration-v013.js'];
const forbiddenRuntimeTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神','SC2-198','SC2-220'];
for (const relative of runtimeFiles) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  for (const term of forbiddenRuntimeTerms) assert(!source.includes(term), `${relative} contains forbidden runtime-specific term: ${term}`);
}

console.log('LiuYao Candidate v0.5 unsupported-target semantics verified.');
console.log('- partnership documentation, debt documentation and accounting classification/compilation stop before Arbitration');
console.log('- generalized governance/accounting information questions are covered without row-specific exceptions');
console.log('- supported debt collection, partnership, investment profit and ordinary purchase outcomes remain routable');
console.log('- supported current outcomes still outrank accounting/fee background mentions');
console.log('- existing v0.3 administrative blocking remains intact');
console.log('- modern runtime source contains no traditional observation-selection or calibration-row exceptions');
