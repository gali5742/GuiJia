#!/usr/bin/env node
'use strict';
const fs = require('fs');
const vm = require('vm');

let passed = 0;
let failed = 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const test = (name, fn) => {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { failed += 1; console.error(`✗ ${name}`); console.error(`  ${error.message}`); }
};

const context = { console, Math, JSON, Map, Set, Array, Object, Number, Float32Array, Float64Array };
context.window = context;
context.globalThis = context;
vm.createContext(context);
const ROOT = require('path').resolve(__dirname, '..');
const MODEL_PATH = require('path').join(ROOT, 'js/liuyao-semantic-fallback-identity-model-v01.js');
vm.runInContext(fs.readFileSync(MODEL_PATH, 'utf8'), context, { filename:'js/liuyao-semantic-fallback-identity-model-v01.js' });
const model = context.GuiJia.liuyaoSemanticFallbackIdentityModelV01;

const zero = () => new Float32Array(512);
const unit = (dimension, value=1) => {
  const vector = zero();
  vector[dimension] = value;
  return vector;
};

test('FI-M01 freezes the exact shared optimizer contract', () => {
  assert(model.vectorSize === 512, `vectorSize=${model.vectorSize}`);
  assert(model.routeIds.length === 22, `routes=${model.routeIds.length}`);
  assert(model.hyperparameters.epochs === 360, JSON.stringify(model.hyperparameters));
  assert(model.hyperparameters.learningRate === 0.42, JSON.stringify(model.hyperparameters));
  assert(model.hyperparameters.l2 === 0.0015, JSON.stringify(model.hyperparameters));
  assert(model.classBalancing.positiveTotalWeight === 0.5, JSON.stringify(model.classBalancing));
  assert(model.classBalancing.negativeTotalWeight === 0.5, JSON.stringify(model.classBalancing));
  assert(model.biasRegularized === false, 'bias must remain unregularized');
});

test('FI-M02 rejects hyperparameter drift', () => {
  const rows = [{ text:'正', expectedRoute:'borrow_money' }, { text:'负', expectedRoute:null }];
  const vectors = [unit(0), unit(1)];
  let threw = false;
  try { model.trainHead('borrow_money', rows, vectors, { epochs:361 }); }
  catch (error) { threw = /hyperparameter drift/.test(error.message); }
  assert(threw, 'training accepted route/model hyperparameter drift');
});

test('FI-M03 deterministic repeat training produces identical head parameters', () => {
  const rows = [
    { text:'我要借钱', expectedRoute:'borrow_money' },
    { text:'我要借给他', expectedRoute:'lend_money' },
    { text:'只是问规则', expectedRoute:null }
  ];
  const vectors = [unit(0, 0.8), unit(1, 0.7), unit(2, 0.6)];
  const a = model.trainHead('borrow_money', rows, vectors);
  const b = model.trainHead('borrow_money', rows, vectors);
  assert(a.bias === b.bias, `bias ${a.bias} != ${b.bias}`);
  for (let i = 0; i < 512; i += 1) assert(a.weights[i] === b.weights[i], `weight drift at ${i}`);
});

test('FI-M04 class balancing neutralizes class-count imbalance for identical evidence', () => {
  const rows = [
    { text:'p', expectedRoute:'borrow_money' },
    { text:'n1', expectedRoute:null },
    { text:'n2', expectedRoute:null },
    { text:'n3', expectedRoute:null }
  ];
  const vectors = [zero(), zero(), zero(), zero()];
  const head = model.trainHead('borrow_money', rows, vectors);
  assert(Math.abs(head.bias) < 1e-12, `balanced identical evidence should keep bias at zero, got ${head.bias}`);
});

test('FI-M05 vector dimensions are strictly 512', () => {
  const rows = [{ text:'p', expectedRoute:'borrow_money' }, { text:'n', expectedRoute:null }];
  let threw = false;
  try { model.trainHead('borrow_money', rows, [new Float32Array(511), zero()]); }
  catch (error) { threw = /512/.test(error.message); }
  assert(threw, '511-dimensional vector was accepted');
});

test('FI-M06 conflicting normalized-text route labels hard fail', () => {
  let threw = false;
  try {
    model.deduplicateRows([
      { text:'我 要 借 钱', expectedRoute:'borrow_money' },
      { text:'我要借钱', expectedRoute:'lend_money' }
    ]);
  } catch (error) { threw = /Conflicting/.test(error.message); }
  assert(threw, 'conflicting duplicate normalized text did not fail');
});

test('FI-M07 duplicate normalized text with same label deduplicates deterministically', () => {
  const rows = model.deduplicateRows([
    { text:'我 要 借 钱', expectedRoute:'borrow_money' },
    { text:'我要借钱', expectedRoute:'borrow_money' }
  ]);
  assert(rows.length === 1, `deduplicated rows=${rows.length}`);
  assert(rows[0].expectedRoute === 'borrow_money', JSON.stringify(rows[0]));
});

test('FI-M08 unknown route labels and heads are rejected', () => {
  let labelThrew = false;
  try { model.deduplicateRows([{ text:'x', expectedRoute:'career_position' }]); }
  catch (error) { labelThrew = /Unknown/.test(error.message); }
  let headThrew = false;
  try { model.trainHead('career_position', [{ text:'p', expectedRoute:'borrow_money' }, { text:'n', expectedRoute:null }], [zero(), zero()]); }
  catch (error) { headThrew = /Unknown/.test(error.message); }
  assert(labelThrew && headThrew, 'non-current22 route entered training contract');
});

test('FI-M09 trainAll produces exactly the frozen 22 heads without extras', () => {
  const rows = model.routeIds.map((routeId, index) => ({ text:`route-${index}`, expectedRoute:routeId }));
  rows.push({ text:'other', expectedRoute:null });
  const vectors = rows.map(() => zero());
  const trained = model.trainAll(rows, vectors);
  const keys = Object.keys(trained.heads);
  assert(keys.length === 22, `heads=${keys.length}`);
  assert(model.routeIds.every((routeId) => keys.includes(routeId)), 'missing current22 head');
});

test('FI-M10 module source contains no traditional LiuYao semantic features', () => {
  const source = fs.readFileSync(MODEL_PATH, 'utf8');
  ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'].forEach((term) => {
    assert(!source.includes(term), `traditional feature leaked: ${term}`);
  });
});

console.log(`\nFallback Identity model contract: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
