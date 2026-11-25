import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {fit, decide, probabilities} from '../liuyao-question-routing-v01/model.mjs';
import {embedder} from '../../scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs';

const dir = 'experiments/liuyao-topic-expansion-v01';
const prev = 'experiments/liuyao-question-routing-v01';
const threshold = 0.3638543865367481;
const hash = x => createHash('sha256').update(x).digest('hex');
function frozen(path, sha) {
  assert.equal(execFileSync('git', ['hash-object',path], {encoding:'utf8'}).trim(),sha,path);
  return JSON.parse(readFileSync(path,'utf8'));
}

const addition = () => frozen(dir+'/training.json','e7dffacb2419216dc08f32b29def978dbaec368e');
const evaluation = () => frozen(dir+'/evaluation.json','4b6323b1bc7f5205b11bad76a3066c2fe7281734');
const members = frozen(prev+'/members.json','26ac61b60257a96e050848c6646fa0c7754c19c6');
const base = frozen(prev+'/outputs/weights.json','6b9f3ca550e231220cd5f74f005641d7c16b9940');
const historical = () => frozen('data/liuyao-semantic-v013-candidate-v10-fallback-identity-v08-training.json','78b792a615c048b7bb804997628f8cb0e4fe703e').rows;
const makeEncoder = () => embedder({encoderExecution:frozen('data/liuyao-semantic-embedding-execution-contract-v0.1.json','f8ecd4edac2d69b1dd6519e7fd7ca041222ee0a5').encoder});
const exam='qualification_exam_outcome', job='job_application_outcome';
const oldRoutes=base.routes.labels.filter(x=>x!=='unresolved');
function audit() {
  const additions=addition(), evaluationRows=evaluation();
  const fresh=[...additions.original,...additions.diverse,...evaluationRows];
  assert.equal(new Set(fresh.map(r=>r.id)).size,132);
  for(const group of Object.values(additions)) {
    assert.equal(group.length,32);
    for(const type of ['direct','background','cross','same']) {
      const sub=group.filter(r=>r.group===type);
      assert.equal(sub.length,8);
      assert(sub.every(r=>r.multi===['cross','same'].includes(type)));
    }
  }
  assert.equal(evaluationRows.length,68);
  assert.deepEqual(evaluationRows.filter(r=>r.group==='old'&&!r.multi).map(r=>r.route),oldRoutes);
  assert(evaluationRows.every(r=>r.route===null||[...oldRoutes,exam,job].includes(r.route)));
  const priorDir='experiments/liuyao-route-admission-v01/';
  const prior=[...historical(),...members.train,...members.dev,
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
  const encode=await makeEncoder(), additions=addition();
  async function embed(rows) {
    const result=[];
    for(const row of rows) result.push({...row,vector:await encode(row.text),label:row.multi?'multi':'single'});
    return result;
  }
  const common=await embed(members.train);
  const a=await embed(additions.original), b=await embed(additions.diverse);
  const vectors=frozen('data/liuyao-semantic-v013-candidate-v11-optimization-diagnostic-training-cache-v0.2.json','a993805795c9f33d79a2bc33639da6a3593272de').rows;
  const original=historical(), other=[];
  for(const route of oldRoutes) {
    const sample=original.filter(r=>r.expectedRoute===route).slice(0,2);
    assert.equal(sample.length,2);
    for(const r of sample) {
      const cache=vectors.find(v=>v.id===r.id);
      assert.equal(cache.textSha256,hash(r.text));
      assert.equal(cache.expectedRoute,route);
      assert.equal(cache.vector.length,512);
      other.push({vector:cache.vector,label:'other'});
    }
  }
  const extra=b.filter(r=>r.route).map(r=>({vector:r.vector,label:r.route}));
  for(const label of [exam,job]) assert.equal(extra.filter(r=>r.label===label).length,8);
  const model={source:process.env.GITHUB_SHA,original:fit([...common,...a],base.count.labels),
    diverse:fit([...common,...b],base.count.labels),extension:fit([...other,...extra],['other',exam,job])};
  writeFileSync('topic-weights.json',JSON.stringify(model)+'\n');
}
function select(model,v,min) {
  const p=probabilities(model,v), i=p.indexOf(Math.max(...p));
  return p[i]>=min ? model.labels[i] : null;
}
async function score() {
  const bytes=readFileSync('topic-weights.json');
  assert.equal(hash(bytes),process.env.LOCK_DIGEST);
  const model=JSON.parse(bytes), encode=await makeEncoder();
  assert.equal(model.source,process.env.GITHUB_SHA);
  const legacy=v=>{const id=select(base.routes,v,threshold);return id==='unresolved'?null:id;};
  const extended=v=>{const id=select(model.extension,v,0.5);return id===exam||id===job?id:legacy(v);};
  const rows=[];
  for(const r of evaluation()) {
    const v=await encode(r.text), states={};
    for(const [name,head] of Object.entries({baseline:base.count,original:model.original,diverse:model.diverse})) {
      let calls=0;
      const result=decide(v,head,x=>{calls++;return extended(x);});
      assert.equal(calls,result.state==='multi_stop'?0:1);
      states[name]={...result,calls};
    }
    rows.push({...r,states,routeOnly:r.multi?undefined:{old:legacy(v),extended:extended(v)}});
  }
  const report={source:model.source,digest:hash(bytes),rows};
  writeFileSync('topic-report.json',JSON.stringify(report,null,2)+'\n');
  for(const row of rows) console.log('TOPIC_ROW '+JSON.stringify(row));
  const packed=gzipSync(bytes).toString('base64');
  for(const part of packed.match(/.{1,1800}/g)) console.log('TOPIC_WEIGHT '+part);
  console.log('TOPIC_DIGEST '+hash(bytes));
}
const phase=process.argv[2];
if(phase==='audit') audit();
else if(phase==='train') await train();
else if(phase==='score') await score();
else throw Error('Expected audit, train or score');
