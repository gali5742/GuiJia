import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'js/liuyao-semantic-route-arbitration-v091.js'), 'utf8');
const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };

assert(source.includes("const VERSION = '0.9.1-dev'"), 'semantic arbitration v0.9.1 version mismatch');
assert(source.includes('liuyaoSemanticRouteArbitrationV091'), 'semantic arbitration v0.9.1 export missing');
assert(!/(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/.test(source), 'semantic arbitration v0.9.1 must remain modern-language only');
assert(source.includes("routeId:'borrow_money'") && source.includes("routeId:'lend_money'"), 'fund direction arbitration missing');
assert(source.includes("routeId:'debt_collection'") && source.includes("routeId:'debt_repayment'"), 'debt direction arbitration missing');
assert(source.includes('成为夫妻') && source.includes("routeId:'marriage_match'"), 'marriage target arbitration missing');
assert(source.includes('夫妻关系') && source.includes("routeId:'marital_relationship'"), 'existing marriage arbitration missing');
assert(source.includes("routeId:'investment_liquidation'") && source.includes("routeId:'investment_profit'"), 'investment goal arbitration missing');
assert(!source.includes('semantic-router-candidate-eval-v0.1'), 'semantic arbitration must not consume sealed Candidate Eval');

console.log('LiuYao Semantic Route Arbitration v0.9.1 contract verified.');
console.log('- modern semantic evidence only');
console.log('- fund/debt direction, relationship stage, and investment-goal arbitration present');
console.log('- no sealed Candidate Eval dependency');
