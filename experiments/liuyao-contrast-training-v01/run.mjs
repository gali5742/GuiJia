import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gzipSync, gunzipSync} from 'node:zlib';
import {fit, decide, probabilities} from '../liuyao-question-routing-v01/model.mjs';
import {embedder} from '../../scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs';

const oldDir = 'experiments/liuyao-topic-expansion-v01';
const prev = 'experiments/liuyao-question-routing-v01';
const threshold = 0.3638543865367481;
const hash = x => createHash('sha256').update(x).digest('hex');
function frozen(path, sha) {
  assert.equal(execFileSync('git', ['hash-object',path], {encoding:'utf8'}).trim(),sha,path);
  return JSON.parse(readFileSync(path,'utf8'));
}

const addition = () => frozen(oldDir+'/training.json','e7dffacb2419216dc08f32b29def978dbaec368e');
const evaluation = () => frozen(oldDir+'/evaluation.json','4b6323b1bc7f5205b11bad76a3066c2fe7281734');
const members = frozen(prev+'/members.json','26ac61b60257a96e050848c6646fa0c7754c19c6');
const base = frozen(prev+'/outputs/weights.json','6b9f3ca550e231220cd5f74f005641d7c16b9940');
const historical = () => frozen('data/liuyao-semantic-v013-candidate-v10-fallback-identity-v08-training.json','78b792a615c048b7bb804997628f8cb0e4fe703e').rows;
const makeEncoder = () => embedder({encoderExecution:frozen('data/liuyao-semantic-embedding-execution-contract-v0.1.json','f8ecd4edac2d69b1dd6519e7fd7ca041222ee0a5').encoder});
const exam='qualification_exam_outcome', job='job_application_outcome';
const oldRoutes=base.routes.labels.filter(x=>x!=='unresolved');

const dir='experiments/liuyao-contrast-training-v01';
const families=()=>frozen(dir+'/training.json','2e125f702f8174c802776d8d904c224fdee4a7a5');
const freshEval=()=>frozen(dir+'/evaluation.json','2a99451484e6654a651c6fe38663a9dd0f2d2f10');
const travel='travel_execution', lost='lost_property_recovery';
const named=[exam,job,travel,lost,'debt_collection','item_purchase','receive_item','income_bonus'];
const flatten=fs=>fs.flatMap(f=>f.questions.map((q,i)=>({...q,id:f.id+'-'+i,family:f.id})));
function previousWeights(){
  const path=oldDir+'/outputs/weights.json.gz';
  assert.equal(execFileSync('git',['hash-object',path],{encoding:'utf8'}).trim(),'7826876d15e062f7fcdbc0376f9b13ca98d34981');
  return JSON.parse(gunzipSync(readFileSync(path)));
}
function audit(){
  const training=families(), check=freshEval();
  assert.equal(training.length,16);
  for(const f of training){
    assert.equal(f.questions.length,4);
    assert.deepEqual(f.questions.map(q=>q.multi),[false,false,true,true]);
    assert.deepEqual(f.questions.map(q=>q.route),[...f.targets,null,null]);
    assert(f.targets.every(t=>named.includes(t)));
  }
  assert.equal(check.length,70);
  assert.deepEqual(check.filter(r=>r.group==='old').map(r=>r.route),oldRoutes);
  const contrast=check.filter(r=>r.group==='contrast');
  const groups=[...new Set(contrast.map(r=>r.family))];
  assert.equal(groups.length,8);
  for(const group of groups){
    const q=contrast.filter(r=>r.family===group);
    assert.deepEqual(q.map(r=>r.multi),[false,false,true]);
    assert(q[0].route!==q[1].route);
  }
  for(const topic of ['weather','lawsuit']){
    const rows=check.filter(r=>r.group===topic);
    assert.equal(rows.filter(r=>r.multi).length,4);
    assert.equal(rows.filter(r=>!r.multi).length,4);
    assert(rows.every(r=>r.route===null));
  }
  const fresh=[...flatten(training),...check];
  assert.equal(new Set(fresh.map(q=>q.id)).size,fresh.length);
  const oldAddition=addition();
  const priorDir='experiments/liuyao-route-admission-v01/';
  const prior=[...historical(),...oldAddition.original,...oldAddition.diverse,...evaluation(),...members.train,...members.dev,
    ...frozen(priorDir+'calibration.json','69514ef148b0ca1edb0ad1246565050374fb07cb'),
    ...frozen(priorDir+'confirmation.json','7527c0a439e9177e826f99d57b23f0b3598c3984')];
  function repr(row) {
    const text = row.text.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]/gu,'');
    const chars = Array.from(text);
    assert(chars.length>=3);
    return {text,id:row.id,grams:new Set(chars.slice(2).map((_,i)=>chars.slice(i,i+3).join('')))};
  }
  const seen = prior.map(repr);
  let maximum = 0, comparisons = 0;
  for (const row of fresh.map(repr)) {
    for (const prior of seen) {
      let common = 0;
      for (const g of row.grams) if (prior.grams.has(g)) common++;
      const j = common/(row.grams.size+prior.grams.size-common);
      assert(row.text!==prior.text && j<0.82, row.id+' matches '+prior.id);
      maximum=Math.max(maximum,j);
      comparisons++;
    }
    seen.push(row);
  }
  console.log('AUDIT '+JSON.stringify({comparisons,maximum}));
}



async function train() {
  const encode=await makeEncoder();
  async function embed(rows){
    const result=[];
    for(const row of rows) result.push({...row,vector:await encode(row.text),label:row.multi?'multi':'single'});
    return result;
  }
  const common=await embed(members.train);
  const diverse=await embed(addition().diverse);
  const added=await embed(flatten(families()));
  const count=fit([...common,...diverse,...added],base.count.labels);
  const original=historical(), vectors=frozen('data/liuyao-semantic-v013-candidate-v11-optimization-diagnostic-training-cache-v0.2.json','a993805795c9f33d79a2bc33639da6a3593272de').rows;
  const support=[];
  for(const route of oldRoutes){
    const sample=original.filter(r=>r.expectedRoute===route).slice(0,2);
    assert.equal(sample.length,2);
    for(const r of sample){
      const cached=vectors.find(v=>v.id===r.id);
      assert.equal(cached.textSha256,hash(r.text));
      assert.equal(cached.expectedRoute,route);
      support.push({vector:cached.vector,label:named.includes(route)?route:'other'});
    }
  }
  for(const row of [...diverse,...added].filter(r=>r.route)){
    support.push({vector:row.vector,label:row.route});
  }
  assert.equal(support.length,92);
  const extension=fit(support,['other',...named]);
  const weights={source:process.env.GITHUB_SHA,count,extension};
  writeFileSync('contrast-weights.json',JSON.stringify(weights)+'\n');
}
function select(model,v,min) {
  const p=probabilities(model,v), i=p.indexOf(Math.max(...p));
  return p[i]>=min ? model.labels[i] : null;
}

async function score(){
  const bytes=readFileSync('contrast-weights.json');
  assert.equal(hash(bytes),process.env.LOCK_DIGEST);
  const candidate=JSON.parse(bytes), baseline=previousWeights();
  assert.equal(candidate.source,process.env.GITHUB_SHA);
  const encode=await makeEncoder();
  function router(extension,v){
    const specific=select(extension,v,0.5);
    if(specific && specific!=='other') return specific;
    const id=select(base.routes,v,threshold);
    return id==='unresolved'?null:id;
  }
  const rows=[];
  for(const row of freshEval()){
    const v=await encode(row.text), states={};
    const counts={baseline:baseline.diverse,candidate:candidate.count};
    const routes={baseline:baseline.extension,candidate:candidate.extension};
    for(const [cn,head] of Object.entries(counts)){
      for(const [rn,extension] of Object.entries(routes)){
        let calls=0;
        const prediction=decide(v,head,x=>{calls++;return router(extension,x);});
        assert.equal(calls,prediction.state==='multi_stop'?0:1);
        states[cn+'_'+rn]={...prediction,calls};
      }
    }
    const routeOnly=row.multi?null:Object.fromEntries(Object.entries(routes).map(([k,ext])=>[k,router(ext,v)]));
    rows.push({...row,states,routeOnly});
  }
  const report={source:candidate.source,weightDigest:hash(bytes),rows};
  writeFileSync('contrast-report.json',JSON.stringify(report,null,2)+'\n');
  for(const row of rows) console.log('RESULT '+JSON.stringify(row));
  const packed=gzipSync(bytes).toString('base64');
  for(const part of packed.match(/.{1,1800}/g)) console.log('WEIGHT '+part);
  console.log('DIGEST '+hash(bytes));
}
const phase=process.argv[2];
if(phase==='audit') audit();
else if(phase==='train') await train();
else if(phase==='score') await score();
else throw Error('Expected audit, train or score');
