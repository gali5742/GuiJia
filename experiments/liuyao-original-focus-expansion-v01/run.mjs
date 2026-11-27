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

const last='experiments/liuyao-contrast-training-v01';
const families=()=>frozen(last+'/training.json','2e125f702f8174c802776d8d904c224fdee4a7a5');
const freshEval=()=>frozen(last+'/evaluation.json','2a99451484e6654a651c6fe38663a9dd0f2d2f10');
const flatten=fs=>fs.flatMap(f=>f.questions.map((q,i)=>({...q,id:f.id+'-'+i,family:f.id})));

const dir='experiments/liuyao-original-focus-expansion-v01';
const trainRows=()=>frozen(dir+'/training.json','1da11f211977f7ccbf739755590ecc415a584e0a');
const testRows=()=>frozen(dir+'/evaluation.json','5157e4fffa347c461be4d1e93ac8a5808fd3f454');
const labels=['litigation_outcome','exam_rank_result','position_advancement','travel_disruption_transport','person_contact_response'];
const retained=['qualification_exam_outcome','job_application_outcome','travel_execution','lost_property_recovery'];
const split=text=>text.split(/[，。！？；、,!?;]+/u).map(s=>s.trim()).filter(Boolean);
function audit(){
  const train=trainRows(), test=testRows(), fresh=[...train,...test];
  assert.equal(train.length,52);
  assert.equal(test.length,70);
  assert.equal(new Set(fresh.map(r=>r.id)).size,fresh.length);
  for(const label of labels){
    assert.equal(train.filter(r=>r.route===label).length,8);
    assert.equal(test.filter(r=>r.route===label).length,6);
  }
  for(const route of [...oldRoutes,...retained]) assert.equal(test.filter(r=>r.route===route).length,1);
  assert.equal(test.filter(r=>r.multi).length,8);
  assert.equal(test.filter(r=>!r.multi && r.route===null).length,6);
  assert(train.every(r=>split(r.text).includes(r.target)));
  assert(test.every(r=>r.multi||r.text.includes(r.target)));
  const oldAddition=addition();
  const priorDir='experiments/liuyao-route-admission-v01/';
  const prior=[...historical(),...flatten(families()),...freshEval(),...oldAddition.original,...oldAddition.diverse,...evaluation(),...members.train,...members.dev,
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




function cachedEncoder(encode){
  const cache=new Map();
  return async text=>{
    if(!cache.has(text)) cache.set(text,await encode(text));
    return cache.get(text);
  };
}
async function train(){
  const encode=cachedEncoder(await makeEncoder());
  const routes=[], segments=[];
  for(const row of trainRows()){
    for(const input of new Set([row.text,row.target])) routes.push({label:row.route,vector:await encode(input)});
    for(const part of split(row.text)) segments.push({label:part===row.target?'target':'background',vector:await encode(part)});
  }
  const vectors=frozen('data/liuyao-semantic-v013-candidate-v11-optimization-diagnostic-training-cache-v0.2.json','a993805795c9f33d79a2bc33639da6a3593272de').rows;
  const original=historical();
  for(const route of oldRoutes){
    for(const row of original.filter(r=>r.expectedRoute===route).slice(0,2)){
      const entry=vectors.find(v=>v.id===row.id);
      assert.equal(entry.textSha256,hash(row.text));
      assert.equal(entry.expectedRoute,route);
      routes.push({label:'other',vector:entry.vector});
    }
  }
  const pool=[...addition().diverse,...flatten(families())];
  for(const route of retained){
    const rows=pool.filter(r=>r.route===route).slice(0,2);
    assert.equal(rows.length,2);
    for(const row of rows) routes.push({label:'other',vector:await encode(row.text)});
  }
  const weights={source:process.env.GITHUB_SHA,router:fit(routes,['other',...labels]),locator:fit(segments,['background','target'])};
  writeFileSync('focus-weights.json',JSON.stringify(weights)+'\n');
}
function select(model,v,min) {
  const p=probabilities(model,v), i=p.indexOf(Math.max(...p));
  return p[i]>=min ? model.labels[i] : null;
}


async function score(){
  const bytes=readFileSync('focus-weights.json'), weights=JSON.parse(bytes);
  assert.equal(weights.source,process.env.GITHUB_SHA);
  assert.equal(hash(bytes),process.env.LOCK_DIGEST);
  const gz=readFileSync(last+'/outputs/weights.json.gz');
  assert.equal(hash(gunzipSync(gz)),'084a8481077635a78c27ddddafb9c18858807353233fcdd3405f5816467fff1a');
  const baseline=JSON.parse(gunzipSync(gz)), encode=cachedEncoder(await makeEncoder());
  function old(v){
    const extra=select(baseline.extension,v,0.5);
    if(extra && extra!=='other') return extra;
    const route=select(base.routes,v,threshold);
    return route==='unresolved'?null:route;
  }
  function expanded(v,whole){
    const pred=select(weights.router,v,0.5);
    return pred && pred!=='other'?pred:old(whole);
  }
  async function locate(text){
    const parts=split(text);
    let best=null,score=-Infinity;
    for(const part of parts){
      const probability=probabilities(weights.locator,await encode(part))[1];
      if(probability>score){best=part;score=probability;}
    }
    return best??text;
  }
  const rows=[];
  for(const row of testRows()){
    const whole=await encode(row.text);
    let routeCalls=0,spanCalls=0,actual=null,found=null;
    const stop=probabilities(baseline.count,whole)[1]>=0.5;
    if(!stop){
      spanCalls++;
      found=await locate(row.text);
      routeCalls++;
      actual=expanded(await encode(found),whole);
    }
    assert.equal(routeCalls,stop?0:1);
    assert.equal(spanCalls,stop?0:1);
    let single=null;
    if(!row.multi){
      const predictedSpan=found??await locate(row.text);
      single={predictedSpan,baseline:old(whole),full:expanded(whole,whole),
        auto:expanded(await encode(predictedSpan),whole),oracle:expanded(await encode(row.target),whole)};
    }
    rows.push({...row,stop,routeCalls,spanCalls,actual,single});
  }
  const report={source:weights.source,weightDigest:hash(bytes),rows};
  writeFileSync('focus-report.json',JSON.stringify(report,null,2)+'\n');
  for(const row of rows) console.log('RESULT '+JSON.stringify(row));
  for(const part of gzipSync(bytes).toString('base64').match(/.{1,1800}/g)) console.log('WEIGHT '+part);
  console.log('DIGEST '+hash(bytes));
}
const phase=process.argv[2];
if(phase==='audit') audit();
else if(phase==='train') await train();
else if(phase==='score') await score();
else throw Error('Expected audit, train or score');
