import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };

const runtime = read('js/liuyao-semantic-router-decision-v09.js');
const arbitration = read('js/liuyao-semantic-route-arbitration-v09.js');
const data = JSON.parse(read('data/liuyao-semantic-router-decision-v0.9-development.json'));

assert(runtime.includes("from './liuyao-semantic-router-poc-v081.js?v=poc0.8.1'"), 'v0.9 must reuse frozen v0.8.1 Router implementation');
assert(runtime.includes("liuyao-semantic-router-decision-v0.9-development.json"), 'v0.9 runtime must use independent development corpus');
assert(!runtime.includes('liuyao-semantic-router-candidate-eval-v0.1.json'), 'v0.9 runtime must not read sealed Candidate Eval v0.1');
assert(runtime.includes('trainLogistic') && runtime.includes('globalProbability'), 'v0.9 must implement a global routeability gate');
assert(runtime.includes('calibrateLowThreshold') && runtime.includes("flattenSplit('calibration')"), 'v0.9 thresholds must be calibrated on the dedicated calibration split');
assert(runtime.includes("flattenSplit('validation')"), 'v0.9 experiment must evaluate on independent validation split');
assert(runtime.includes('A-v0.8.1-local') && runtime.includes('B-global-top1') && runtime.includes('C-global-local-borderline') && runtime.includes('D-C-plus-semantic-arbitration'), 'v0.9 must expose A/B/C/D strategy comparison');
assert(runtime.includes('global-high-confidence') && runtime.includes('global-borderline-local-confirmed'), 'v0.9 C strategy must demote local gate to borderline confirmation instead of universal hard gate');
assert(runtime.includes('liuyaoSemanticRouteArbitrationV09'), 'v0.9 runtime must consume independent modern semantic arbitration layer');
assert(arbitration.includes("const VERSION = '0.9-dev'"), 'arbitration version mismatch');
assert(!/(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/.test(arbitration), 'semantic arbitration must not contain traditional LiuYao semantics');
assert(data.policy?.reuseSealedCandidateEvalV01 === false && data.policy?.modifyV081 === false, 'v0.9 data policy drifted');

console.log('LiuYao Semantic Router Decision v0.9 experiment contract verified.');
console.log('- frozen v0.8.1 Router reused unchanged');
console.log('- independent train/calibration/validation routeability corpus');
console.log('- A/B/C/D decision strategies present');
console.log('- modern semantic arbitration isolated from traditional LiuYao semantics');
