import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {root,read,json,binding,write,equal,normalize,assert,exists} from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';

export const stem='data/liuyao-semantic-role-target-extraction-probe-v0.1';
const contractPath=`${stem}-contract.json`;
const moneyRoles=new Set(['self_receives','self_provides','self_creditor','self_debtor']);
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const checked=b=>assert(equal(binding(b.path),b),`Frozen input changed: ${b.path}`);
const committed=p=>assert(git(['rev-parse',`HEAD:${p}`])===binding(p).gitBlobSha,`Uncommitted source: ${p}`);
const keys=goals=>goals.map(g=>`${g.intent}:${g.role}`).sort();
const counts=values=>values.reduce((out,key)=>(out[key]=(out[key]||0)+1,out),{});

// Preserve multiplicity: two goals with the same intent cannot become one goal.
export function missingBag(expected,actual){
  const remaining=counts(actual),missing=[];
  for(const value of expected){if(remaining[value])remaining[value]--;else missing.push(value);}
  return missing.sort();
}

// This deliberately literal view of existing flat tags is a diagnostic adapter.
// It has no access to question wording, labels, clause boundaries or participants.
export function projectEvidence(evidence,rules){
  return rules.filter(r=>evidence[r.field]?.includes(r.tag)&&(!r.requires||evidence[r.requires.field]?.includes(r.requires.tag)))
    .map(r=>({...r.goal}));
}

export function measure(expected,actual){
  const missingFacts=missingBag(keys(expected),keys(actual)),extraFacts=missingBag(keys(actual),keys(expected));
  const missingIntents=missingBag(expected.map(g=>g.intent),actual.map(g=>g.intent));
  const extraIntents=missingBag(actual.map(g=>g.intent),expected.map(g=>g.intent));
  const contradictoryRoleFacts=extraFacts.filter(key=>{
    const [intent,role]=key.split(':');
    return moneyRoles.has(role)&&expected.some(g=>g.intent===intent)&&!expected.some(g=>g.intent===intent&&g.role===role);
  });
  const unknownRoleAssertions=actual.filter(g=>moneyRoles.has(g.role)&&expected.some(e=>e.intent===g.intent&&e.role==='unknown'));
  const thirdPartySelfAssertions=actual.filter(g=>moneyRoles.has(g.role)&&expected.some(e=>e.intent===g.intent&&e.role==='other_subject'));
  return {exactFacts:missingFacts.length===0&&extraFacts.length===0,exactIntents:missingIntents.length===0&&extraIntents.length===0,
    missingFacts,extraFacts,missingIntents,extraIntents,contradictoryRoleFacts,unknownRoleAssertions,thirdPartySelfAssertions};
}

export function loadApis(){
  const context={};context.window=context;vm.createContext(context);
  for(const p of ['js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js',
    'js/liuyao-semantic-fallback-identity-model-v02.js','js/liuyao-semantic-role-target-gate-v01.js'])vm.runInContext(read(p).toString(),context,{filename:p});
  return {extract:context.GuiJia.liuyaoSemanticRouteEvidenceV03.extract,gate:context.GuiJia.liuyaoSemanticRoleTargetGateV01,
    routes:context.GuiJia.liuyaoSemanticFallbackIdentityModelV02.routeIds};
}

export function unverifiedPacket(gate,id,text,goals){
  const fact=value=>({value,source:'unverified',evidence:[]});
  return {...gate.makePacket(id,text),goals:goals.map((g,n)=>({id:`proposed-${n+1}`,label:`待确认目标 ${n+1}`,intent:fact(g.intent),role:fact(g.role)}))};
}

function permissionCheck(gate,routes,packet){
  const upstream={semanticAct:{eligible:true},routeSufficiency:{accepted:true},routeability:{accepted:true},unsupportedTargets:[],arbitration:null};
  // Synthetic permissive upstream and all22 scores test the boundary, not real model behavior.
  const candidate={source:'Fallback',threshold:.5,probabilities:Object.fromEntries(routes.map(r=>[r,r==='borrow_money'?.9:.1]))};
  const outcomes=[gate.authorize(packet,upstream,candidate),gate.authorize(packet,{...upstream,arbitration:{routeId:'borrow_money',strength:'strong'}},{source:'Arbitration'})];
  assert(outcomes.every(o=>o.status==='clarify'&&o.reason==='primary_question'&&o.selectedRoute===null&&!o.permissions.mayRunArbitration&&!o.permissions.mayRunFallback&&!o.permissions.maySelectRoute),
    'Unverified language facts must not grant either branch permission');
  return {branchesChecked:['Fallback','Arbitration'],status:'clarify',reason:'primary_question',selectedRoute:null,
    mayRunArbitration:false,mayRunFallback:false,maySelectRoute:false,upstreamAndScores:'synthetic_permissive_interface_fixture'};
}

function dataAudit(c,author){
  const grams=text=>{const chars=Array.from(normalize(text));return new Set(chars.slice(0,-2).map((_,n)=>chars.slice(n,n+3).join('')));};
  const repr=r=>({id:r.id,text:normalize(r.text),grams:grams(r.text)}),fresh=author.rows.map(repr);
  const compare=(a,b)=>{
    assert(a.text!==b.text,`Exact duplicate: ${a.id}/${b.id}`);let intersection=0;
    for(const gram of a.grams)if(b.grams.has(gram))intersection++;
    const similarity=intersection/(a.grams.size+b.grams.size-intersection||1);
    assert(similarity<c.duplicatePolicy.maximumExclusive,`Near duplicate: ${a.id}/${b.id}; similarity=${similarity}`);
    return similarity;
  };
  let internalMaximum=0,internalPairs=0;
  for(let a=0;a<fresh.length;a++)for(let b=a+1;b<fresh.length;b++){internalMaximum=Math.max(internalMaximum,compare(fresh[a],fresh[b]));internalPairs++;}
  const comparators=c.auditComparators.map(b=>{
    checked(b);const source=json(b.path);
    if(b.path.includes('training'))assert(source.sealed&&source.rows.length===2028&&source.rows.every(r=>r.split==='training'),'Sealed TRAIN-only comparator required');
    else assert(source.rows.length===60,'Previous development boundary comparator changed');
    const rows=source.rows.map(repr);let maximum=0,pairs=0;
    for(const a of fresh)for(const old of rows){maximum=Math.max(maximum,compare(a,old));pairs++;}
    return {...b,rows:rows.length,pairs,maximum,mode:'automated_comparison_only_no_wording_output'};
  });
  return {exactDuplicates:0,nearDuplicates:0,internalPairs,internalMaximum,comparators,
    historicalCoverage:c.duplicatePolicy.coverage,independentValidation:false};
}

function summarize(rows,c){
  const statistics=rs=>({n:rs.length,exactFacts:rs.filter(r=>r.metrics.exactFacts).length,exactIntents:rs.filter(r=>r.metrics.exactIntents).length,
    missingExpectedFactRows:rs.filter(r=>r.metrics.missingFacts.length).length,extraFactRows:rs.filter(r=>r.metrics.extraFacts.length).length,
    missingActiveIntentRows:rs.filter(r=>r.metrics.missingIntents.length).length,extraActiveIntentRows:rs.filter(r=>r.metrics.extraIntents.length).length,
    contradictoryRoleRows:rs.filter(r=>r.metrics.contradictoryRoleFacts.length).length,unknownRoleAssertionRows:rs.filter(r=>r.metrics.unknownRoleAssertions.length).length,
    thirdPartySelfAssertionRows:rs.filter(r=>r.metrics.thirdPartySelfAssertions.length).length,
    bothBranchesBlockedPendingConfirmation:rs.filter(r=>r.permissionCheck.status==='clarify').length});
  const all=statistics(rows),byGroup=Object.fromEntries([...new Set(rows.map(r=>r.group))].map(group=>[group,statistics(rows.filter(r=>r.group===group))]));
  const furtherExtractionCriteria={all28Exact:all.exactFacts===28,all4MultipleExact:byGroup.multiple_active.exactFacts===4,
    zeroContradictoryRoleRows:all.contradictoryRoleRows===0,zeroUnknownRoleAssertionRows:all.unknownRoleAssertionRows===0};
  const allCriteria=Object.values(furtherExtractionCriteria).every(Boolean);
  return {status:allCriteria?'development_probe_insufficient_for_automatic_permissions':'fixed_evidence_projection_not_sufficient_for_role_and_active_goal_extraction',
    all,byGroup,furtherExtractionCriteria,nextAction:allCriteria?c.decisionRule.ifNoFailure:c.decisionRule.ifAnyFailure,
    automaticPermissionAllowed:false,firstOutputRuns:1,encoderInvocations:0,trainingFits:0,thresholdSearch:false,
    clarificationObservation:'All 28 unverified packets request one primary-question confirmation. No actual user responses or burden measurement.',
    productionRoutingAccuracyMeasured:false,independentValidation:false,componentPass:false,phaseCAllowed:false};
}

function compute(c,e,author){
  const audit=dataAudit(c,author),{extract,gate,routes}=loadApis();
  const rows=author.rows.map(r=>{
    const evidence=JSON.parse(JSON.stringify(extract(r.text))),projectedGoals=projectEvidence(evidence,c.projectionRules);
    const packet=unverifiedPacket(gate,r.id,r.text,projectedGoals);
    return {id:r.id,group:r.group,expectedGoals:r.expectedGoals,evidence,projectedGoals,metrics:measure(r.expectedGoals,projectedGoals),
      permissionCheck:permissionCheck(gate,routes,packet)};
  });
  return {version:'0.1-fixed-existing-evidence-role-target-diagnostic-report',contractBinding:binding(contractPath),executionBinding:binding(c.executionPath),
    authoringBinding:binding(c.authoringPath),implementationCommit:e.implementationCommit,dataAudit:audit,rows,result:summarize(rows,c),governance:c.governance};
}

function main(){
  assert(process.env.NODE_OPTIONS?.includes('liuyao-semantic-v013-candidate-v07-evaluation-read-guard.cjs'),'Preload evaluation read guard');
  const c=json(contractPath),e=json(c.executionPath),author=json(c.authoringPath);
  assert(c.rows===28&&c.decisionRule.maximumFirstOutputRuns===1&&!c.decisionRule.sameVersionFeedbackRepairAllowed,'Bounded scope changed');
  for(const b of [...c.frozenBindings,...c.auditComparators,...e.bindings])checked(b);
  for(const p of [contractPath,c.executionPath,c.authoringPath])committed(p);
  git(['merge-base','--is-ancestor',e.implementationCommit,'HEAD']);
  for(const b of e.bindings)assert(git(['rev-parse',`${e.implementationCommit}:${b.path}`])===b.gitBlobSha,'Implementation must precede fresh wording');
  assert(!e.bindings.some(b=>b.path===c.authoringPath),'Fresh wordings must not be part of implementation freeze');
  assert(author.generation==='individually_authored_literal_questions_with_prefixed_labels_before_outputs'&&!author.extractorFeedbackObserved&&!author.oldFailureWordingUsed&&author.sameAuthorAndLabeler,'Authoring provenance changed');
  assert(author.rows.length===28,'Full raw membership required');
  for(const [n,r]of author.rows.entries()){
    assert(equal(Object.fromEntries(Object.entries(r).filter(([key])=>key!=='text')),c.allocation[n]),'Prefixed labels/order changed');
    assert(typeof r.text==='string'&&r.text===r.text.trim()&&normalize(r.text).length>=8,'Literal question required');
    assert(!/(六亲|世爻|应爻|用神|官鬼|妻财|父母爻|兄弟爻|子孙爻|TR\/MR|病情|疾病占|诊断疾病)/.test(r.text),'Reserved/traditional authoring prohibited');
  }
  let report;
  if(process.argv.includes('--run')){
    assert(!exists(c.reportPath)&&!exists(c.failurePath),'First outputs cannot be retried or repaired in this version');
    try{dataAudit(c,author);}catch(error){write(c.failurePath,{status:'audit_failed_stop_before_outputs',message:error.message,authoringBinding:binding(c.authoringPath),extractorRuns:0,sameVersionRepairAllowed:false});throw error;}
    report=compute(c,e,author);write(c.reportPath,report);
  }else{
    assert(process.argv.includes('--verify'),'Choose --run or --verify');
    report=json(c.reportPath);assert(equal(report,compute(c,e,author)),'Diagnostic replay drift');
  }
  console.log(JSON.stringify({status:report.result.status,summary:report.result.all,byGroup:report.result.byGroup,criteria:report.result.furtherExtractionCriteria,
    newEncoderInvocations:0,newTrainingFits:0,verificationOnly:!process.argv.includes('--run')},null,2));
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main();
