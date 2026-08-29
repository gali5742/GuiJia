import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ident=fs.readFileSync(path.join(root,'js/liuyao-semantic-route-identifiability-v010.js'),'utf8');
const stack=fs.readFileSync(path.join(root,'js/liuyao-semantic-decision-stack-v010.js'),'utf8');
const page=fs.readFileSync(path.join(root,'semantic-decision-stack-v010.html'),'utf8');
const fail=(m)=>{throw new Error(m)};const assert=(c,m)=>{if(!c)fail(m)};

assert(ident.includes("const VERSION = '0.10-dev'"),'Route Identifiability v0.10 version mismatch');
assert(ident.includes("MODEL_ID = 'Xenova/bge-small-zh-v1.5'")&&ident.includes("MODEL_DTYPE = 'q8'"),'Route Identifiability must reuse frozen BGE family/dtype');
assert(ident.includes("pooling:'mean'")&&ident.includes('normalize:true'),'Route Identifiability must classify normalized direct BGE embeddings');
assert(ident.includes('route_identifiable')&&ident.includes('route_unresolved'),'Route Identifiability label contract missing');
assert(!ident.includes('outside_current_22'),'Route Identifiability runtime must not train on outside-current-22');
assert(!ident.includes('routeMargin')&&!ident.includes('gateScore')&&!ident.includes('normalizedEntropy'),'Route Identifiability must not be confidence-feature gate');
assert(ident.includes("flattenSplit('train')")&&ident.includes("flattenSplit('calibration')")&&ident.includes("flattenSplit('validation')"),'Route Identifiability split separation missing');
assert(ident.includes('liuyao-semantic-decision-stack-v0.10-preuse-patch.json')&&ident.includes('effectiveText(sample.text)'),'Route Identifiability must apply the verified v0.10 pre-use wording patch');

assert(stack.includes("semanticRouterPocV081 as router"),'v0.10 must reuse v0.8.1 Router');
assert(stack.includes("semanticScopeGateV01 as scopeGate"),'v0.10 must reuse Scope Gate v0.1');
assert(stack.includes("semanticRouteIdentifiabilityV010 as identifiabilityGate"),'v0.10 must include Route Identifiability');
assert(stack.includes('liuyaoSemanticRouteArbitrationV091'),'v0.10 must include Semantic Arbitration v0.9.1');
assert(stack.includes('liuyaoSemanticSufficiency')&&stack.includes('evaluateIntentSufficiency'),'v0.10 must include Semantic Sufficiency v0.2');
assert(stack.includes('insideRecall < 0.95'),'Scope hard-reject policy must protect at least 95% known calibration recall');
assert(stack.includes("finalRoute = arbitration?.routeId || routerResult.top1?.id"),'Semantic Arbitration must be allowed to correct the Route Head');
assert(stack.includes('legacyLocalGate:routerResult.gate'),'legacy local gate may remain diagnostic');
assert(!stack.includes('routerResult.gate.accepted')&&!stack.includes('gate.predicted'),'legacy local gate must not control v0.10 final decision');
assert(!stack.includes('liuyao-semantic-router-candidate-eval-v0.1.json'),'sealed Candidate v0.1 must not be runtime dependency');
assert(stack.includes('decision-stack-v0.10-oracle-fixture'),'Sufficiency oracle-fixture boundary must be explicit');
assert(stack.includes("finalDisposition = 'outside_current_22'")&&stack.includes("finalDisposition = 'route_unresolved'")&&stack.includes("finalDisposition = 'route_known'"),'v0.10 three-way disposition missing');
assert(stack.includes('liuyao-semantic-decision-stack-v0.10-preuse-patch.json')&&stack.includes("identifiabilityGate.flattenSplit('calibration')"),'Stack Scope calibration must consume the effective wording-isolated v0.10 calibration rows');

assert(page.includes('Scope Gate v0.1')&&page.includes('Route Identifiability v0.10')&&page.includes('Semantic Sufficiency v0.2'),'v0.10 page missing layer description');
assert(page.includes('不会重新调 Scope Gate v0.1'),'page must state Scope Gate v0.1 is not retuned');
assert(page.includes('44 条 Validation / 30 条 Diagnostic'),'page must state previous Scope score set is not reused');
assert(page.includes('legacy local Gate 仅保留作诊断'),'page must state legacy local gate is diagnostic only');

console.log('LiuYao Semantic Decision Stack v0.10 runtime contract verified.');
console.log('- Scope Gate v0.1 and v0.8.1 Router reused without retraining-rule changes');
console.log('- direct-BGE Route Identifiability separated from Scope and Sufficiency');
console.log('- verified v0.10 pre-use wording isolation is applied at runtime');
console.log('- v0.9.1 modern semantic arbitration precedes final route selection');
console.log('- legacy local gate is diagnostic only in v0.10 final decision');
console.log('- three-way outside / unresolved / route-known disposition is explicit');
