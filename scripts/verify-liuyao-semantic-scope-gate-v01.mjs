import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = fs.readFileSync(path.join(root, 'js/liuyao-semantic-scope-gate-v01.js'), 'utf8');
const page = fs.readFileSync(path.join(root, 'semantic-scope-gate-v01.html'), 'utf8');
const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };

assert(runtime.includes("const VERSION = '0.1-dev'"), 'Scope Gate v0.1 runtime version mismatch');
assert(runtime.includes("MODEL_ID = 'Xenova/bge-small-zh-v1.5'"), 'Scope Gate must reuse the frozen BGE model family');
assert(runtime.includes("MODEL_DTYPE = 'q8'"), 'Scope Gate BGE dtype must remain q8');
assert(runtime.includes('VECTOR_SIZE = 512'), 'Scope Gate vector size must be 512');
assert(runtime.includes('feature-extraction') && runtime.includes("pooling:'mean'") && runtime.includes('normalize:true'), 'Scope Gate must classify direct normalized BGE embeddings');
assert(runtime.includes('trainLogistic') && runtime.includes('probabilityFromVector'), 'Scope Gate binary embedding classifier missing');
assert(runtime.includes("flattenSplit('train')") && runtime.includes("flattenSplit('calibration')") && runtime.includes("flattenSplit('validation')"), 'Scope Gate must keep train/calibration/validation separate');
assert(runtime.includes('diagnostic_unresolved') && runtime.includes('runUnresolvedDiagnostic'), 'Scope Gate unresolved diagnostic path missing');
assert(runtime.includes('liuyao-semantic-scope-gate-v0.1-preuse-patch.json') && runtime.includes('effectiveText'), 'Scope Gate runtime must apply the verified pre-use wording isolation patch');
assert(!runtime.includes('liuyao-semantic-router-decision-v0.9-development.json'), 'Scope Gate must not train from flawed v0.9 routeability labels');
assert(!runtime.includes('liuyao-semantic-router-candidate-eval-v0.1.json'), 'Scope Gate must not train from sealed Candidate Eval v0.1');
assert(!runtime.includes('routeMargin') && !runtime.includes('gateScore') && !runtime.includes('normalizedEntropy'), 'Scope Gate must not depend on Router confidence-derived features');
assert(page.includes('当前 22-route 现代 Semantic Router') && page.includes('不是“六爻能不能占”的总开关'), 'Scope Gate page must state component-only scope');
assert(page.includes('Unresolved Diagnostic · 不计成绩'), 'Scope Gate page must keep unresolved diagnostics separate from binary metrics');

console.log('LiuYao current-22 Semantic Scope Gate v0.1 runtime contract verified.');
console.log('- direct normalized BGE embedding binary classifier');
console.log('- independent train/calibration/validation');
console.log('- verified pre-use wording isolation patch applied at runtime');
console.log('- unresolved diagnostic excluded from binary metrics');
console.log('- no v0.9 confidence-feature or sealed Candidate dependency');
