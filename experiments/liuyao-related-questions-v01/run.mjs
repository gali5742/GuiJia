import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gzipSync, gunzipSync} from 'node:zlib';
import {fit, probabilities} from '../liuyao-question-routing-v01/model.mjs';
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

const last='experiments/liuyao-contrast-training-v01';
const families=()=>frozen(last+'/training.json','2e125f702f8174c802776d8d904c224fdee4a7a5');
const freshEval=()=>frozen(last+'/evaluation.json','2a99451484e6654a651c6fe38663a9dd0f2d2f10');
const flatten=fs=>fs.flatMap(f=>f.questions.map((q,i)=>({...q,id:f.id+'-'+i,family:f.id})));

const dir='experiments/liuyao-original-focus-expansion-v01';
const trainRows=()=>frozen(dir+'/training.json','1da11f211977f7ccbf739755590ecc415a584e0a');
const testRows=()=>frozen(dir+'/evaluation.json','5157e4fffa347c461be4d1e93ac8a5808fd3f454');
const split=text=>text.split(/[，。！？；、,!?;]+/u).map(s=>s.trim()).filter(Boolean);

const experiment='experiments/liuyao-related-questions-v01';
const newTrain=()=>frozen(experiment+'/training.json','c3e2391c791e0ffb24efcb7c49a1ce23e8981240');
const newTest=()=>frozen(experiment+'/evaluation.json','c1a0c7e35d302d09f531837712311a35d4b6429b');
function audit(){
  const train=newTrain(),test=newTest();
  const fresh=[...train,...test];
  assert.equal(train.length,48);
  assert.equal(test.length,48);
  assert.equal(new Set(fresh.map(r=>r.id)).size,fresh.length);
  for(const rows of [train,test]){
    const ids=new Set(rows.filter(r=>r.family).map(r=>r.family));
    assert.equal(ids.size,rows===train?12:8);
    for(const id of ids){
      const family=rows.filter(r=>r.family===id);
      assert.deepEqual(family.map(r=>r.multi),[false,false,true,true]);
      assert(family[0].route!==family[1].route);
    }
    assert(rows.every(r=>!r.multi||r.route===null));
  }
  const oldAddition=addition();
  const priorDir='experiments/liuyao-route-admission-v01/';
  const prior=[...historical(),...trainRows(),...testRows(),...flatten(families()),...freshEval(),...oldAddition.original,...oldAddition.diverse,...evaluation(),...members.train,...members.dev,
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
  const prior=[...members.train,...addition().diverse,...flatten(families())];
  assert.equal(prior.length,160);
  const data=[];
  for(const r of [...prior,...newTrain()]){
    data.push({label:r.multi?'multi':'single',vector:await encode(r.text)});
  }
  const candidate={source:process.env.GITHUB_SHA,count:fit(data,base.count.labels)};
  writeFileSync('gate-weights.json',JSON.stringify(candidate)+'\n');
}
function select(model,v,min) {
  const p=probabilities(model,v), i=p.indexOf(Math.max(...p));
  return p[i]>=min ? model.labels[i] : null;
}



async function score(){
  const bytes=readFileSync('gate-weights.json'),candidate=JSON.parse(bytes);
  assert.equal(hash(bytes),process.env.LOCK_DIGEST);
  assert.equal(candidate.source,process.env.GITHUB_SHA);
  const path=dir+'/outputs/weights.json.gz';
  assert.equal(execFileSync('git',['hash-object',path],{encoding:'utf8'}).trim(),'3680accd94ad4b0656ef8b45c5a0016f45e4f9f4');
  const weights=JSON.parse(gunzipSync(readFileSync(path)));
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

  async function infer(text,whole,head){
    const score=probabilities(head,whole)[1];
    if(score>=0.5) return {stop:true,score,spanCalls:0,routeCalls:0,route:null};
    const target=await locate(text);
    const route=expanded(await encode(target),whole);
    return {stop:false,score,spanCalls:1,routeCalls:1,route};
  }
  const replay=frozen(dir+'/outputs/report.json','34a409decf17de950d5738a9909ef6f3efe95d28').rows;
  const rows=[];
  for(const [panel,questions] of [['fresh',newTest()],['replay',testRows()]]){
    for(const row of questions){
      const v=await encode(row.text);
      const oldPrediction=await infer(row.text,v,baseline.count);
      const newPrediction=await infer(row.text,v,candidate.count);
      for(const pred of [oldPrediction,newPrediction]){
        assert.equal(pred.spanCalls,pred.stop?0:1);
        assert.equal(pred.routeCalls,pred.stop?0:1);
      }
      if(panel==='replay'){
        const saved=replay.find(r=>r.id===row.id);
        assert.equal(oldPrediction.stop,saved.stop);
        assert.equal(oldPrediction.route,saved.actual);
      }
      rows.push({panel,...row,baseline:oldPrediction,candidate:newPrediction});
    }
  }
  const report={source:candidate.source,weightDigest:hash(bytes),rows};
  writeFileSync('gate-report.json',JSON.stringify(report,null,2)+'\n');
  for(const row of rows) console.log('RESULT '+JSON.stringify(row));
  for(const part of gzipSync(bytes).toString('base64').match(/.{1,1800}/g)) console.log('WEIGHT '+part);
  console.log('DIGEST '+hash(bytes));
}
const phase=process.argv[2];
if(phase==='audit') audit();
else if(phase==='train') await train();
else if(phase==='score') await score();
else throw Error('Expected audit, train or score');
