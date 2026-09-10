import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const paths = {
  report:'data/liuyao-semantic-v013-candidate-v04-development-report-v0.1.json',
  v01:'data/liuyao-semantic-v013-candidate-v04-development-failure-diagnostic-v0.1.json',
  developmentLock:'data/liuyao-semantic-v013-candidate-v04-development.lock.json',
  runtimeLock:'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json',
  design:'data/liuyao-semantic-v013-candidate-v04-design-v0.1.json',
  out:'data/liuyao-semantic-v013-candidate-v04-development-failure-diagnostic-v0.2.json'
};
const expected = {
  reportBlob:'13d73d9ddd44e3ed3187d0b153a5ea316eaf9d91',
  datasetSha256:'5787dcea81d8e86839aaad17d012c7195def1638d048f404ee0c25e91fb9b213',
  sealCommit:'8fa9a4e50ebe500c6f28144b0158fd1e3baf273f',
  reportCommit:'4493321a90dfffa71c1d1bfd60a376e941faa8cb'
};
const read=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(read(p).toString('utf8'));
const sha256=p=>crypto.createHash('sha256').update(read(p)).digest('hex');
const blobSha=p=>{const b=read(p);return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');};
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const rate=(n,d)=>d?n/d:0;
const countBy=(rows,fn)=>{const m=new Map();for(const row of rows){const k=String(fn(row));m.set(k,(m.get(k)||0)+1);}return Object.fromEntries([...m.entries()].sort(([a],[b])=>a.localeCompare(b)));};

const report=json(paths.report), v01=json(paths.v01), developmentLock=json(paths.developmentLock), runtimeLock=json(paths.runtimeLock), design=json(paths.design);
assert(blobSha(paths.report)===expected.reportBlob,'first-development report blob drift');
assert(report.status==='fresh_development_fail_immutable'&&report.readyForCandidateLock===false,'source is not immutable failed v0.4 development');
assert(v01.version==='0.13-candidate-v0.4-development-failure-diagnostic-v0.1','v0.1 diagnostic missing');
assert(developmentLock.dataset?.sha256===expected.datasetSha256,'sealed development dataset drift');
assert(developmentLock.generation?.encoderScoringPerformedBeforeSeal===false,'development was scored before seal');
assert(runtimeLock.status==='runtime_locked_before_fresh_development','runtime lock drift');

const R=report.results;
assert(Array.isArray(R)&&R.length===198,'report row count drift');
const known=R.filter(x=>x.expectedDisposition==='route_known'), nonRoute=R.filter(x=>x.expectedDisposition==='non_route');
assert(known.length===132&&nonRoute.length===66,'report partition drift');
const exact=known.filter(x=>x.final?.disposition==='route_known'&&x.final?.routeId===x.expectedRoute);
const accepted=known.filter(x=>x.final?.disposition==='route_known');
const misses=known.filter(x=>!(x.final?.disposition==='route_known'&&x.final?.routeId===x.expectedRoute));
const wrong=accepted.filter(x=>x.final?.routeId!==x.expectedRoute);
const falseActs=nonRoute.filter(x=>x.final?.disposition==='route_known');

const failCause=x=>{
  if(x.final?.disposition==='route_known'&&x.final?.routeId!==x.expectedRoute)return'wrong_route_accepted';
  if(x.semanticAct?.status!=='eligible')return'semantic_act_reject';
  if(x.final?.reasonCode==='scope_hard_veto')return'scope_hard_veto';
  if(!x.routeability||x.routeability.disposition!=='route_known')return'routeability_reject';
  const r=x.fallbackIdentity?.decision?.reasonCode;
  if(r==='fallback_identity_all22_reject_all')return'fallback_reject_all';
  if(r==='fallback_identity_all22_multiple_admissions')return'fallback_multiple_admissions';
  if(!x.selection||x.selection.status!=='selected')return'selection_unresolved';
  return'finalization_other';
};
const activationSource=x=>{
  if(x.arbitration?.routeId===x.final?.routeId)return`arbitration_${x.arbitration?.strength||'unknown'}`;
  if(x.fallbackIdentity?.decision?.status==='selected'&&x.fallbackIdentity.decision.routeId===x.final?.routeId)return'fallback_identity_all22';
  if(x.selection?.status==='selected'&&x.selection.routeId===x.final?.routeId)return'selection_other';
  return'unknown';
};
const compact=x=>({id:x.id,text:x.text,expectedRoute:x.expectedRoute||null,expectedCandidatePath:x.expectedCandidatePath||null,nonRouteSubtype:x.nonRouteSubtype||null,semanticAct:x.semanticAct?{status:x.semanticAct.status,probability:x.semanticAct.probability}:null,arbitration:x.arbitration?{routeId:x.arbitration.routeId||null,strength:x.arbitration.strength||null}:null,routeability:x.routeability?{disposition:x.routeability.disposition,probability:x.routeability.probability,reasonCode:x.routeability.reasonCode}:null,fallbackIdentity:x.fallbackIdentity?{status:x.fallbackIdentity.decision?.status||null,routeId:x.fallbackIdentity.decision?.routeId||null,reasonCode:x.fallbackIdentity.decision?.reasonCode||null}:null,selection:x.selection?{status:x.selection.status,routeId:x.selection.routeId||null,reasonCode:x.selection.reasonCode||null}:null,final:{disposition:x.final?.disposition||null,routeId:x.final?.routeId||null,reasonCode:x.final?.reasonCode||null}});

const byKnownPath={};
for(const id of ['strong_arbitration','support_arbitration','fallback_identity_all22']){
  const rows=known.filter(x=>x.expectedCandidatePath===id), ex=rows.filter(x=>x.final?.disposition==='route_known'&&x.final?.routeId===x.expectedRoute), ac=rows.filter(x=>x.final?.disposition==='route_known'), reached=rows.filter(x=>x.fallbackIdentity!=null);
  byKnownPath[id]={
    n:rows.length,exact:ex.length,exactRate:rate(ex.length,rows.length),accepted:ac.length,wrongAccepted:ac.filter(x=>x.final?.routeId!==x.expectedRoute).length,acceptedRouteAccuracy:rate(ex.length,ac.length),
    semanticActRejects:rows.filter(x=>x.semanticAct?.status!=='eligible').length,
    routeabilityRejects:rows.filter(x=>x.semanticAct?.status==='eligible'&&(!x.routeability||x.routeability.disposition!=='route_known')).length,
    fallbackReached:reached.length,fallbackSelected:reached.filter(x=>x.fallbackIdentity?.decision?.status==='selected').length,
    fallbackRejectAll:reached.filter(x=>x.fallbackIdentity?.decision?.reasonCode==='fallback_identity_all22_reject_all').length,
    fallbackMultipleAdmissions:reached.filter(x=>x.fallbackIdentity?.decision?.reasonCode==='fallback_identity_all22_multiple_admissions').length,
    selectionUnresolved:rows.filter(x=>x.routeability?.disposition==='route_known'&&(!x.selection||x.selection.status!=='selected')).length,
    scopeHardVeto:rows.filter(x=>x.final?.reasonCode==='scope_hard_veto').length
  };
}
const bySubtype={};
for(const id of ['outside_current_22','route_unresolved','near_domain_not_current_route']){
  const rows=nonRoute.filter(x=>x.nonRouteSubtype===id), fa=rows.filter(x=>x.final?.disposition==='route_known');
  bySubtype[id]={n:rows.length,falseActivations:fa.length,falseActivationRate:rate(fa.length,rows.length),semanticActRejected:rows.filter(x=>x.semanticAct?.status!=='eligible').length,routeabilityAccepted:rows.filter(x=>x.routeability?.disposition==='route_known').length,fallbackReached:rows.filter(x=>x.fallbackIdentity!=null).length,falseActivationSources:countBy(fa,activationSource),activatedRoutes:countBy(fa,x=>x.final?.routeId||'null')};
}
const missesByRoute={};
for(const x of misses){const e=missesByRoute[x.expectedRoute]||={misses:0,causes:{}};e.misses++;const c=failCause(x);e.causes[c]=(e.causes[c]||0)+1;}
for(const e of Object.values(missesByRoute))e.causes=Object.fromEntries(Object.entries(e.causes).sort(([a],[b])=>a.localeCompare(b)));

const gates=design.freshDevelopmentPolicy.promotionGates;
const headline={knownExactRoute:rate(exact.length,known.length),acceptedRouteAccuracy:rate(exact.length,accepted.length),overallFalseRouteActivation:rate(falseActs.length,nonRoute.length),maxFalseRouteActivationPerSubtype:Math.max(...Object.values(bySubtype).map(x=>x.falseActivationRate)),noStructuralPathCollapse:Object.values(byKnownPath).every(x=>x.exact>0),readyForCandidateLock:false};
const dominant=Object.entries(bySubtype).sort((a,b)=>b[1].falseActivations-a[1].falseActivations)[0];
const output={
  version:'0.13-candidate-v0.4-development-failure-diagnostic-v0.2',status:'corrected_immutable_failure_diagnosis_from_committed_first_development_report',scope:'liuyao_semantic_decision_stack_v0.13_candidate_v0.4',
  correction:{supersedes:'data/liuyao-semantic-v013-candidate-v04-development-failure-diagnostic-v0.1.json',reason:'v0.1 byKnownPath fallbackReached/fallbackSelected counters referenced obsolete reachesFallbackIdentity instead of the committed report fallbackIdentity object; headline, failure causes, wrong accepted rows and non-route false-activation findings remain unchanged',candidateV04Mutation:false,developmentRescore:false},
  provenance:{sourceReport:{path:paths.report,gitBlobSha:expected.reportBlob,sha256:sha256(paths.report),commit:expected.reportCommit},sealedDevelopment:{path:paths.developmentLock,datasetSha256:expected.datasetSha256,sealCommit:expected.sealCommit},runtimeLock:{path:paths.runtimeLock,gitBlobSha:blobSha(paths.runtimeLock)},design:{path:paths.design,gitBlobSha:blobSha(paths.design)},supersededDiagnostic:{path:paths.v01,gitBlobSha:blobSha(paths.v01)}},
  policy:{rerunsEncoder:false,invokesModel:false,readsIndependentEvaluation:false,readsSealedBlindEvaluation:false,mutatesCandidateV04:false,mutatesDevelopmentCohort:false,mutatesThresholds:false},
  frozenPromotionGates:gates,sourceReportSummary:report.summary||null,headline,
  totals:{rows:R.length,known:known.length,nonRoute:nonRoute.length,knownExact:exact.length,knownNonExact:misses.length,acceptedKnown:accepted.length,wrongAcceptedKnown:wrong.length,nonRouteFalseActivations:falseActs.length},
  knownFailureCauses:countBy(misses,failCause),byKnownPath,knownMissesByExpectedRoute:Object.fromEntries(Object.entries(missesByRoute).sort(([a],[b])=>a.localeCompare(b))),
  wrongAcceptedKnown:wrong.map(x=>({...compact(x),failureCause:failCause(x)})),
  byNonRouteSubtype:bySubtype,
  falseRouteActivations:falseActs.map(x=>({...compact(x),source:activationSource(x)})),
  routeUnresolvedFalseActivations:falseActs.filter(x=>x.nonRouteSubtype==='route_unresolved').map(x=>({...compact(x),source:activationSource(x)})),
  architectureSignals:{
    semanticActKnownRetention:{eligible:known.filter(x=>x.semanticAct?.status==='eligible').length,total:known.length},
    semanticActNearDomainBlocking:{blocked:nonRoute.filter(x=>x.nonRouteSubtype==='near_domain_not_current_route'&&x.semanticAct?.status!=='eligible').length,total:nonRoute.filter(x=>x.nonRouteSubtype==='near_domain_not_current_route').length},
    knownRouteabilityRejects:known.filter(x=>x.semanticAct?.status==='eligible'&&(!x.routeability||x.routeability.disposition!=='route_known')).length,
    knownFallbackRejectAll:misses.filter(x=>failCause(x)==='fallback_reject_all').length,
    knownFallbackMultipleAdmissions:misses.filter(x=>failCause(x)==='fallback_multiple_admissions').length,
    wrongAcceptedKnown:wrong.length,
    routeUnresolvedFalseActivationSources:bySubtype.route_unresolved.falseActivationSources
  },
  candidateV03DirectionalComparison:{cohortLevelDirectionalOnly:true,pairedRowComparison:false,candidateV03Signals:design.diagnosisSignals||{},candidateV04Signals:{knownMisses:misses.length,wrongAcceptedKnown:wrong.length,overallNonRouteFalseActivations:falseActs.length,nearDomainFalseActivations:bySubtype.near_domain_not_current_route.falseActivations,routeUnresolvedFalseActivations:bySubtype.route_unresolved.falseActivations,strongExact:byKnownPath.strong_arbitration.exact,supportExact:byKnownPath.support_arbitration.exact,fallbackExact:byKnownPath.fallback_identity_all22.exact}},
  diagnosis:{failureIsMultiSurface:true,structuralPathCollapseObserved:!headline.noStructuralPathCollapse,dominantNonRouteFailureSubtype:{subtype:dominant[0],falseActivations:dominant[1].falseActivations,rate:dominant[1].falseActivationRate},nearDomainInformationProcedureSafetyObserved:bySubtype.near_domain_not_current_route.falseActivations===0,routeUnresolvedSafetyIsDominant:bySubtype.route_unresolved.falseActivations===Math.max(...Object.values(bySubtype).map(x=>x.falseActivations)),routeUnresolvedLeaksCrossBothArbitrationAndFallback:Object.keys(bySubtype.route_unresolved.falseActivationSources).some(k=>k.startsWith('arbitration_'))&&Boolean(bySubtype.route_unresolved.falseActivationSources.fallback_identity_all22),knownRecallBelowGate:headline.knownExactRoute<gates.minimumKnownExactRoute,acceptedPrecisionBelowGate:headline.acceptedRouteAccuracy<gates.minimumAcceptedRouteAccuracy,overallSafetyBelowGate:headline.overallFalseRouteActivation>gates.maximumOverallFalseRouteActivation,subtypeSafetyBelowGate:headline.maxFalseRouteActivationPerSubtype>gates.maximumFalseRouteActivationPerNonRouteSubtype,sameVersionRetuneAuthorized:false},
  nextAction:'freeze_candidate_v05_design_after_route_sufficiency_boundary_review_before_any_new_training_calibration_threshold_or_runtime_change'
};
fs.writeFileSync(path.join(root,paths.out),`${JSON.stringify(output,null,2)}\n`,'utf8');
console.log(JSON.stringify({headline,totals:output.totals,knownFailureCauses:output.knownFailureCauses,byKnownPath,byNonRouteSubtype:bySubtype,architectureSignals:output.architectureSignals},null,2));
