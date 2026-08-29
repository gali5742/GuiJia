import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/liuyao-semantic-decision-stack-v0.12-development.json'),'utf8'));
const context={console};context.window=context;context.globalThis=context;vm.createContext(context);
for(const file of ['js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-arbitration-v010.js','js/liuyao-semantic-route-identity-v02.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const evidenceApi=context.GuiJia?.liuyaoSemanticRouteEvidenceV01;const arbitrationApi=context.GuiJia?.liuyaoSemanticRouteArbitrationV010;const identityApi=context.GuiJia?.liuyaoSemanticRouteIdentityV02;
if(!evidenceApi||!arbitrationApi||!identityApi)throw new Error('v0.12 modern semantic APIs failed to load');
const failures=[];let known=0,strongKnown=0,identityKnown=0;
for(const [routeId,spec] of Object.entries(data.routes||{})){for(const sample of spec.samples||[]){known++;const evidence=evidenceApi.extract(sample.text);const arb=arbitrationApi.arbitrate(sample.text,evidence);if(arb?.strength==='strong'){strongKnown++;if(arb.routeId!==routeId)failures.push(`${routeId}: strong arbitration -> ${arb.routeId}: ${sample.text}`);}else{const identity=identityApi.evaluate(routeId,sample.text,evidence);if(identity.passed)identityKnown++;else failures.push(`${routeId}: expected identity failed (${identity.reasonCode}): ${sample.text}`);}}}
let rejects=0,strongRejects=0;for(const [kind,rows] of [['outside',data.outside_current_22||[]],['unresolved',data.route_unresolved||[]]])for(const text of rows){rejects++;const evidence=evidenceApi.extract(text);const arb=arbitrationApi.arbitrate(text,evidence);if(arb?.strength==='strong'){strongRejects++;failures.push(`${kind}: strong arbitration ${arb.routeId} must not activate: ${text}`);}}
if(known!==66||rejects!==44)failures.push(`count mismatch known=${known} rejects=${rejects}`);
if(failures.length)throw new Error(`v0.12 semantic evidence contract failure(s):\n- ${failures.join('\n- ')}`);
console.log('LiuYao Semantic Decision Stack v0.12 evidence contract verification passed.');
console.log(`- ${known} known rows semantically承接: strong arbitration ${strongKnown}, expected-route identity ${identityKnown}`);
console.log(`- ${rejects} non-route rows: strong arbitration activations ${strongRejects}`);
console.log('- no v0.11 sealed Blind rows are executed or scored');
