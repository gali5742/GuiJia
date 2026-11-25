import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {probabilities} from '../liuyao-question-routing-v01/model.mjs';
import {embedder} from '../../scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs';

const dir = 'experiments/liuyao-route-admission-v01';
const priors = 'experiments/liuyao-question-routing-v01';
function frozen(path, sha) {
  assert.equal(execFileSync('git', ['hash-object',path], {encoding:'utf8'}).trim(),sha,path);
  return JSON.parse(readFileSync(path,'utf8'));
}
const sets = {
  calibration: '69514ef148b0ca1edb0ad1246565050374fb07cb',
  confirmation: '7527c0a439e9177e826f99d57b23f0b3598c3984'
};
const readSet = name => frozen(dir+'/'+name+'.json',sets[name]);
const weights = frozen(priors+'/outputs/weights.json','6b9f3ca550e231220cd5f74f005641d7c16b9940');
const legacy = frozen('data/liuyao-semantic-v013-candidate-v10-fallback-identity-v08-model.json','b8e67967619e0842e66e3e1f9e005380d7b69b67');
const routes = legacy.routeIds;
assert.deepEqual(weights.routes.labels,[...routes,'unresolved']);
assert.deepEqual(weights.count.labels,['single','multi']);
const isMulti = row => row.group.startsWith('multi_');
const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex');

function audit() {
  const fresh = [];
  for (const split of Object.keys(sets)) {
    const rows = readSet(split);
    assert.equal(rows.length,68);
    for (const group of ['direct','background'])
      assert.deepEqual(rows.filter(r=>r.group===group).map(r=>r.route),routes);
    for (const group of ['multi_cross','multi_same','near','outside']) {
      const sub = rows.filter(r=>r.group===group);
      assert.equal(sub.length,6);
      assert(sub.every(r=>r.route===null));
    }
    fresh.push(...rows);
  }
  assert.equal(new Set(fresh.map(r=>r.id)).size,136);
  const earlier = frozen(priors+'/members.json','26ac61b60257a96e050848c6646fa0c7754c19c6');
  const original = frozen('data/liuyao-semantic-v013-candidate-v10-fallback-identity-v08-training.json','78b792a615c048b7bb804997628f8cb0e4fe703e').rows;
  function repr(row) {
    const text = row.text.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]/gu,'');
    const chars = Array.from(text);
    assert(chars.length>=3);
    return {text,id:row.id,grams:new Set(chars.slice(2).map((_,i)=>chars.slice(i,i+3).join('')))};
  }
  const seen = [...original,...earlier.train,...earlier.dev].map(repr);
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

async function scores(name) {
  const contract = frozen('data/liuyao-semantic-embedding-execution-contract-v0.1.json','f8ecd4edac2d69b1dd6519e7fd7ca041222ee0a5');
  const encode = await embedder({encoderExecution:contract.encoder});
  const scored = [];
  for (const row of readSet(name)) {
    const v = await encode(row.text);
    const p = probabilities(weights.routes,v);
    const winner = p.indexOf(Math.max(...p));
    const order = routes.map((_,i)=>i).sort((a,b)=>p[b]-p[a]);
    const admitted = routes.filter(id=>{
      const head=legacy.heads[id];
      return head.weights.reduce((z,w,i)=>z+w*v[i],head.bias)>=0;
    });
    scored.push({id:row.id,group:row.group,expected:row.route,top:weights.routes.labels[winner],
      score:p[winner],businessTop:routes[order[0]],multiScore:probabilities(weights.count,v)[1],
      legacy:admitted.length===1?admitted[0]:null});
  }
  return scored;
}

function evaluate(rows,threshold,{gate=false,old=false}={}) {
  const m={known:0,correct:0,selected:0,knownWrong:0,knownAbstained:0,singleSelected:0,multiRouted:0,
    earlyMulti:0,falseStop:0,stopRouteCalls:0,calls:0,byGroup:{}};
  for (const row of rows) {
    let calls=0;
    function select() {
      calls++;
      if (old) return row.legacy;
      return row.top!=='unresolved' && row.score>=threshold ? row.top : null;
    }
    const stop=gate && row.multiScore>=0.5;
    const prediction=stop?null:select();
    const known=row.expected!==null, multi=isMulti(row), correct=known && prediction===row.expected;
    const g=m.byGroup[row.group]??={total:0,correct:0,selected:0,earlyStop:0};
    g.total++;
    g.correct+=Number(correct);
    g.selected+=Number(prediction!==null);
    g.earlyStop+=Number(stop);
    m.known+=Number(known);
    m.correct+=Number(correct);
    m.selected+=Number(prediction!==null);
    m.knownWrong+=Number(known && prediction!==null && !correct);
    m.knownAbstained+=Number(known && prediction===null);
    m.singleSelected+=Number(!multi && prediction!==null);
    m.multiRouted+=Number(multi && prediction!==null);
    m.earlyMulti+=Number(multi && stop);
    m.falseStop+=Number(!multi && stop);
    m.calls+=calls;
    if (stop) m.stopRouteCalls+=calls;
  }
  return m;
}
function candidate(rows,t) {
  const m=evaluate(rows,t);
  const eligible=m.singleSelected>0 && 100*m.correct>=98*m.singleSelected &&
    ['near','outside'].every(g=>100*m.byGroup[g].selected<=5*m.byGroup[g].total);
  return {threshold:t,correct:m.correct,selected:m.singleSelected,near:m.byGroup.near.selected,outside:m.byGroup.outside.selected,eligible};
}
const phase=process.argv[2];
if (phase==='audit') audit();
else if (phase==='calibration') {
  const rows=await scores(phase), singles=rows.filter(r=>!isMulti(r));
  const grid=[...new Set([0,0.7,1,...singles.filter(r=>r.top!=='unresolved').map(r=>r.score)])];
  const candidates=grid.sort((a,b)=>a-b).map(t=>candidate(singles,t));
  const best=candidates.filter(c=>c.eligible).sort((a,b)=>b.correct-a.correct || b.threshold-a.threshold)[0]??null;
  const lock={grid:candidates,best,source:process.env.GITHUB_SHA,calibrationBlob:sets.calibration};
  writeFileSync('calibration-lock.json',JSON.stringify(lock)+'\n');
  console.log('LOCK '+JSON.stringify(lock));
  console.log('CAL_HASH '+sha256('calibration-lock.json'));
  for (const row of rows) console.log('CAL_ROW '+JSON.stringify(row));
} else if (phase==='confirmation') {
  assert.equal(sha256('calibration-lock.json'),process.env.LOCK_DIGEST);
  const lock=JSON.parse(readFileSync('calibration-lock.json','utf8'));
  assert.equal(lock.source,process.env.GITHUB_SHA);
  const rows=await scores(phase);
  const metrics={legacy:evaluate(rows,0,{old:true}),original:evaluate(rows,0.7),originalGated:evaluate(rows,0.7,{gate:true})};
  if (lock.best) {
    metrics.calibrated=evaluate(rows,lock.best.threshold);
    metrics.calibratedGated=evaluate(rows,lock.best.threshold,{gate:true});
  }
  assert(Object.values(metrics).every(m=>m.stopRouteCalls===0));
  for (const row of rows) console.log('CHECK_ROW '+JSON.stringify(row));
  console.log('METRICS '+JSON.stringify(metrics));
} else throw Error('Expected audit, calibration or confirmation');
