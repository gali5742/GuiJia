import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const ratio = (n, d, empty = 0) => d ? n / d : empty;
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
const dot = (weights, vector) => { let total = 0; for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i]; return total; };
const softmax = (logits) => { const max = Math.max(...logits); const exps = logits.map((value) => Math.exp(value - max)); const total = exps.reduce((a,b)=>a+b,0); return exps.map((value)=>value/Math.max(total,1e-12)); };

const designFile = 'data/liuyao-semantic-v013-candidate-v05-design-v0.1.json';
const calibrationFile = 'data/liuyao-semantic-scope-finalization-v0.3-calibration.json';
const calibrationLockFile = 'data/liuyao-semantic-scope-finalization-v0.3-calibration.lock.json';
const correctedFile = 'data/liuyao-semantic-frozen-dependencies-v0.2.json';
const routeabilityFile = 'data/liuyao-semantic-routeability-v0.4.json';
const identityFile = 'data/liuyao-semantic-fallback-identity-v0.2.json';
const acceptanceFile = 'data/liuyao-semantic-fallback-acceptance-v0.1.json';
const inventoryFile = 'data/liuyao-semantic-route-inventory-v0.2.json';
const reportFile = 'data/liuyao-semantic-scope-finalization-v0.3-calibration-failure.json';

const design = readJson(designFile);
const calibration = readJson(calibrationFile);
const calibrationLock = readJson(calibrationLockFile);
const corrected = readJson(correctedFile);
const routeability = readJson(routeabilityFile);
const identity = readJson(identityFile);
const acceptance = readJson(acceptanceFile);
const inventory = readJson(inventoryFile);
const routeIds = inventory.routes.map((row)=>row.routeId);
assert(design.status === 'design_frozen_before_v05_calibration_data', 'Candidate v0.5 design drift');
assert(calibration.status === 'sealed_fresh_scope_calibration' && calibration.sealed === true, 'sealed Candidate v0.5 Scope calibration required');
assert(calibrationLock.calibrationSha256 === sha256(calibrationFile), 'Candidate v0.5 Scope calibration lock drift');
assert(corrected.encoder?.textsPerEncoderCall === 1 && corrected.encoder?.vectorSize === 512, 'canonical representation drift');
assert(routeIds.length === 22 && routeIds.every((id)=>identity.model?.heads?.[id]), 'Identity heads drift');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js','js/liuyao-semantic-route-evidence-v04.js',
  'js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js','js/liuyao-semantic-route-arbitration-v013.js',
  'js/liuyao-semantic-route-compatibility-v01.js','js/liuyao-semantic-route-compatibility-v02.js','js/liuyao-semantic-route-compatibility-v03.js',
  'js/liuyao-semantic-routeability-v06.js','js/liuyao-semantic-route-selection-v04.js','js/liuyao-semantic-route-selection-v05.js','js/liuyao-semantic-finalization-v02.js'
]) vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),context,{filename:relative});
const evidenceApi=context.GuiJia.liuyaoSemanticRouteEvidenceV04;
const arbitrationApi=context.GuiJia.liuyaoSemanticRouteArbitrationV013;
const compatibilityApi=context.GuiJia.liuyaoSemanticRouteCompatibilityV03;
const routeabilityApi=context.GuiJia.liuyaoSemanticRouteabilityV06;
const selectionApi=context.GuiJia.liuyaoSemanticRouteSelectionV05;
const finalizationApi=context.GuiJia.liuyaoSemanticFinalizationV02;

const encoder=corrected.encoder;
env.allowLocalModels=false; env.useBrowserCache=false;
const extractor=await pipeline('feature-extraction',encoder.modelId,{dtype:encoder.dtype,revision:encoder.revision});
const embedOne=async(text)=>{const out=await extractor(String(text||''),{pooling:encoder.pooling,normalize:encoder.normalize});assert(out?.dims?.[out.dims.length-1]===512,'embedding size drift');const v=new Float32Array(512);for(let i=0;i<512;i+=1)v[i]=Number(out.data[i]);return v;};
const routerHead=(vector)=>{const logits=corrected.router.routeHead.weights.map((weights,index)=>dot(weights,vector)+corrected.router.routeHead.biases[index]);const probs=softmax(logits);const scores=corrected.router.routeOrder.map((id,index)=>({id,score:probs[index]})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));return {top1:scores[0],top2:scores[1]};};
const routeabilityScore=(vector)=>sigmoid(dot(routeability.model.weights,vector)+routeability.model.bias);
const scopeScore=(vector)=>sigmoid(dot(corrected.scopeGate.gate.weights,vector)+corrected.scopeGate.gate.bias);
const identityTop1=(vector)=>routeIds.map((routeId)=>{const h=identity.model.heads[routeId];return{routeId,score:sigmoid(dot(h.weights,vector)+h.bias)};}).sort((a,b)=>b.score-a.score||a.routeId.localeCompare(b.routeId))[0];
const acceptanceDecision=(arbitration,evidence,rp,it)=>{
  if(arbitration?.routeId)return null;
  if((evidence.unsupportedTargets||[]).length)return{status:'route_unresolved',routeId:null,reasonCode:'explicit_unsupported_target',identityTop1Probability:it.score};
  const rpPass=rp>=acceptance.thresholds.routeabilityAcceptThreshold,itPass=it.score>=acceptance.thresholds.identityAcceptThreshold;
  return rpPass&&itPass?{status:'selected',routeId:it.routeId,reasonCode:'fallback_acceptance_two_thresholds_passed',identityTop1Probability:it.score}:{status:'route_unresolved',routeId:null,reasonCode:'fallback_acceptance_rejected',identityTop1Probability:it.score};
};

const rows=[];
for(let i=0;i<calibration.rows.length;i+=1){
  const source=calibration.rows[i];
  const evidence=evidenceApi.extract(source.text), arbitration=arbitrationApi.arbitrate(source.text,evidence), vector=await embedOne(source.text), head=routerHead(vector);
  const rp=routeabilityScore(vector), routeabilityDecision=routeabilityApi.decide({probability:rp,modelThreshold:routeability.calibration.threshold,arbitration,evidence});
  const it=identityTop1(vector), fallback=acceptanceDecision(arbitration,evidence,rp,it);
  const selection=selectionApi.decide({arbitration,head,evidence,routeabilityDisposition:routeabilityDecision.disposition,fallbackAcceptanceDecision:fallback});
  const sp=scopeScore(vector);
  const pre=finalizationApi.finalize({routeability:routeabilityDecision,selection,scope:{probability:sp,hardVeto:false},arbitration,evidence,fallbackAcceptanceDecision:fallback});
  const bypass=Boolean(arbitration?.strength==='strong'&&selection?.status==='selected'&&arbitration.routeId===selection.routeId&&compatibilityApi.evaluate(arbitration.routeId,evidence).status==='confirmed');
  rows.push({id:source.id,text:source.text,expectedDisposition:source.expectedDisposition,expectedRoute:source.expectedRoute,expectedCandidatePath:source.expectedCandidatePath,subtype:source.subtype,unsupportedTargets:[...(evidence.unsupportedTargets||[])],routeabilityDisposition:routeabilityDecision.disposition,arbitrationRoute:arbitration?.routeId||null,arbitrationStrength:arbitration?.strength||null,fallbackStatus:fallback?.status||null,fallbackRoute:fallback?.routeId||null,selectionStatus:selection?.status||null,selectionRoute:selection?.routeId||null,scopeProbability:sp,strongScopeBypassEligible:bypass,preScopeDisposition:pre.disposition,preScopeRoute:pre.routeId,preScopeReasonCode:pre.reasonCode});
  if((i+1)%50===0||i+1===calibration.rows.length)console.log(`scope v0.5 failure diagnostic embedded ${i+1}/${calibration.rows.length}`);
}

const known=rows.filter((r)=>r.expectedDisposition==='route_known'), nonRoute=rows.filter((r)=>r.expectedDisposition==='non_route');
const subtypes=['outside_current_22','route_unresolved','near_domain_not_current_route'];
const finalize=(row,cutoff)=>{
  if(row.preScopeDisposition!=='route_known'||!row.preScopeRoute)return{disposition:row.preScopeDisposition,routeId:row.preScopeRoute,reasonCode:row.preScopeReasonCode,bypassed:false};
  if(row.scopeProbability>=cutoff)return{disposition:'route_known',routeId:row.preScopeRoute,reasonCode:row.preScopeReasonCode,bypassed:false};
  if(row.strongScopeBypassEligible)return{disposition:'route_known',routeId:row.preScopeRoute,reasonCode:'confirmed_strong_scope_bypass',bypassed:true};
  return{disposition:'non_route',routeId:null,reasonCode:'scope_hard_veto',bypassed:false};
};
const evaluate=(cutoff)=>{
  let knownExact=0,knownActivated=0,wrongKnown=0,falseActivations=0,bypasses=0;
  const bySubtype={};
  for(const row of known){const f=finalize(row,cutoff);if(f.bypassed)bypasses+=1;if(f.disposition==='route_known'){knownActivated+=1;if(f.routeId===row.expectedRoute)knownExact+=1;else wrongKnown+=1;}}
  for(const subtype of subtypes){const subset=nonRoute.filter((r)=>r.subtype===subtype);const activated=subset.filter((r)=>finalize(r,cutoff).disposition==='route_known').length;falseActivations+=activated;bySubtype[subtype]={total:subset.length,activated,falseActivation:ratio(activated,subset.length)};}
  return{cutoff,knownExact,knownRetention:ratio(knownExact,known.length),knownActivated,wrongKnown,acceptedRouteAccuracy:ratio(knownExact,knownActivated,1),falseActivations,overallFalseActivation:ratio(falseActivations,nonRoute.length),maxSubtypeFalseActivation:Math.max(...subtypes.map((s)=>bySubtype[s].falseActivation)),bySubtype,bypasses};
};
const gates=design.evaluationPolicy.promotionGates;
const safeAccuracy=(m)=>m.acceptedRouteAccuracy>=gates.minimumAcceptedRouteAccuracy-1e-12;
const safeOverall=(m)=>m.overallFalseActivation<=gates.maximumOverallFalseRouteActivation+1e-12;
const safeSubtype=(m)=>m.maxSubtypeFalseActivation<=gates.maximumFalseRouteActivationPerNonRouteSubtype+1e-12;
const thresholds=[...new Set([0,1,...rows.map((r)=>r.scopeProbability)])].sort((a,b)=>a-b);
const metrics=thresholds.map(evaluate);
const allSafe=metrics.filter((m)=>safeAccuracy(m)&&safeOverall(m)&&safeSubtype(m));
const best=(sorter)=>[...metrics].sort(sorter)[0];
const bestKnown=best((a,b)=>b.knownExact-a.knownExact||b.acceptedRouteAccuracy-a.acceptedRouteAccuracy||a.overallFalseActivation-b.overallFalseActivation||a.maxSubtypeFalseActivation-b.maxSubtypeFalseActivation||b.cutoff-a.cutoff);
const minOverall=best((a,b)=>a.overallFalseActivation-b.overallFalseActivation||a.maxSubtypeFalseActivation-b.maxSubtypeFalseActivation||b.knownExact-a.knownExact||b.cutoff-a.cutoff);
const minSubtype=best((a,b)=>a.maxSubtypeFalseActivation-b.maxSubtypeFalseActivation||a.overallFalseActivation-b.overallFalseActivation||b.knownExact-a.knownExact||b.cutoff-a.cutoff);
const maxAccuracy=best((a,b)=>b.acceptedRouteAccuracy-a.acceptedRouteAccuracy||b.knownExact-a.knownExact||a.overallFalseActivation-b.overallFalseActivation||b.cutoff-a.cutoff);
const atZero=evaluate(0),atOne=evaluate(1);
const irreducibleNonRoute=nonRoute.filter((row)=>finalize(row,1).disposition==='route_known').map((row)=>({id:row.id,text:row.text,subtype:row.subtype,selectedRoute:row.preScopeRoute,arbitrationRoute:row.arbitrationRoute,arbitrationStrength:row.arbitrationStrength,unsupportedTargets:row.unsupportedTargets,strongScopeBypassEligible:row.strongScopeBypassEligible,scopeProbability:row.scopeProbability}));
const irreducibleWrongKnown=known.filter((row)=>{const f=finalize(row,1);return f.disposition==='route_known'&&f.routeId!==row.expectedRoute;}).map((row)=>({id:row.id,text:row.text,expectedRoute:row.expectedRoute,selectedRoute:row.preScopeRoute,path:row.expectedCandidatePath,arbitrationRoute:row.arbitrationRoute,strongScopeBypassEligible:row.strongScopeBypassEligible,scopeProbability:row.scopeProbability}));
const report={
  version:'0.13-scope-finalization-v0.3-calibration-failure-v0.1',status:'calibration_failed_no_safe_cutoff',scope:'liuyao_semantic_candidate_v0.5_scope_finalization',candidateV05Lockable:false,
  evidenceStatus:{freshCalibration:true,independentGeneralizationClaim:false,sealedCorpusMutated:false,thresholdsRetuned:false,architectureMutated:false},
  dependencies:{design:{path:designFile,sha256:sha256(designFile)},calibration:{path:calibrationFile,sha256:sha256(calibrationFile)},calibrationLock:{path:calibrationLockFile,sha256:sha256(calibrationLockFile)},correctedDependencies:{path:correctedFile,sha256:sha256(correctedFile)},routeability:{path:routeabilityFile,sha256:sha256(routeabilityFile)},identity:{path:identityFile,sha256:sha256(identityFile)},acceptance:{path:acceptanceFile,sha256:sha256(acceptanceFile)}},
  constraints:{minimumAcceptedRouteAccuracy:gates.minimumAcceptedRouteAccuracy,maximumOverallFalseRouteActivation:gates.maximumOverallFalseRouteActivation,maximumFalseRouteActivationPerNonRouteSubtype:gates.maximumFalseRouteActivationPerNonRouteSubtype},
  thresholdCount:thresholds.length,safeThresholdCount:allSafe.length,
  feasibility:{accuracyOnly:metrics.filter(safeAccuracy).length,overallFalseActivationOnly:metrics.filter(safeOverall).length,subtypeFalseActivationOnly:metrics.filter(safeSubtype).length,accuracyAndOverall:metrics.filter((m)=>safeAccuracy(m)&&safeOverall(m)).length,accuracyAndSubtype:metrics.filter((m)=>safeAccuracy(m)&&safeSubtype(m)).length,overallAndSubtype:metrics.filter((m)=>safeOverall(m)&&safeSubtype(m)).length,allThree:allSafe.length},
  boundary:{cutoffZero:atZero,cutoffOne:atOne,bestKnownIgnoringSafety:bestKnown,minimumOverallFalseActivation:minOverall,minimumMaxSubtypeFalseActivation:minSubtype,maximumAcceptedRouteAccuracy:maxAccuracy},
  irreducibleAtCutoffOne:{nonRouteActivations:irreducibleNonRoute.length,nonRouteRows:irreducibleNonRoute,wrongKnownActivations:irreducibleWrongKnown.length,wrongKnownRows:irreducibleWrongKnown},
  originalV04FailureRegression:{expectedOldFailureThemes:['governance_or_documentation_information','administrative_or_accounting_information'],irreducibleRowsMatchingNewUnsupportedFamilies:irreducibleNonRoute.filter((row)=>row.unsupportedTargets.length>0).length},
  conclusion:'No global Scope hard-veto cutoff satisfies the frozen Candidate v0.5 safety constraints. Candidate v0.5 must not be locked or promoted from this calibration unless a new architecture version is designed.'
};
writeJson(reportFile,report);
console.log('LiuYao Candidate v0.5 Scope cutoff failure diagnosed.');
console.log(`- safe thresholds: ${allSafe.length}/${thresholds.length}`);
console.log(`- feasibility: accuracy=${report.feasibility.accuracyOnly}, overallFA=${report.feasibility.overallFalseActivationOnly}, subtypeFA=${report.feasibility.subtypeFalseActivationOnly}`);
console.log(`- cutoff=0: known=${atZero.knownExact}/${known.length}, acc=${atZero.acceptedRouteAccuracy}, FA=${atZero.overallFalseActivation}, maxSubtype=${atZero.maxSubtypeFalseActivation}`);
console.log(`- cutoff=1: known=${atOne.knownExact}/${known.length}, acc=${atOne.acceptedRouteAccuracy}, FA=${atOne.overallFalseActivation}, maxSubtype=${atOne.maxSubtypeFalseActivation}`);
console.log(`- irreducible non-route activations at cutoff=1: ${irreducibleNonRoute.length}`);
for(const row of irreducibleNonRoute)console.log(`  ${row.id} ${row.subtype} -> ${row.selectedRoute} / ${row.text}`);
