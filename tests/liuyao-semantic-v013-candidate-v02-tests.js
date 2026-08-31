#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
  }
};

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
[
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-routeability-v04.js',
  'js/liuyao-semantic-route-selection-v03.js',
  'js/liuyao-semantic-finalization-v01.js'
].forEach((relative) => vm.runInContext(
  fs.readFileSync(path.join(ROOT, relative), 'utf8'),
  context,
  { filename:relative }
));

const G = context.GuiJia;
const routeability = G.liuyaoSemanticRouteabilityV04;
const selection = G.liuyaoSemanticRouteSelectionV03;
const finalization = G.liuyaoSemanticFinalizationV01;

test('R13V2-1 explicit unsupported target remains higher priority than score or rescue', () => {
  const result = routeability.decide({
    probability:0.95,
    threshold:0.77,
    arbitration:{ routeId:'commercial_transaction', strength:'support' },
    evidence:{
      events:['commercial_transaction'],
      currentTargets:['commercial_transaction'],
      unsupportedTargets:['contract_clause_review']
    }
  });
  assert(result.disposition === 'non_route', JSON.stringify(result));
  assert(result.reasonCode === 'explicit_unsupported_target', JSON.stringify(result));
});

test('R13V2-2 below-threshold confirmed support can rescue a known route', () => {
  const result = routeability.decide({
    probability:0.73,
    threshold:0.77,
    arbitration:{ routeId:'business_operation', strength:'support' },
    evidence:{ events:['business_operation'] }
  });
  assert(result.disposition === 'route_known', JSON.stringify(result));
  assert(result.reasonCode === 'confirmed_support_rescue', JSON.stringify(result));
  assert(result.rescuedRoute === 'business_operation', JSON.stringify(result));
});

test('R13V2-3 compatible-only support cannot bypass a low Routeability score', () => {
  const result = routeability.decide({
    probability:0.73,
    threshold:0.77,
    arbitration:{ routeId:'commercial_transaction', strength:'support' },
    evidence:{}
  });
  assert(result.disposition === 'non_route', JSON.stringify(result));
  assert(result.reasonCode === 'frozen_v02_score_reject', JSON.stringify(result));
});

test('R13V2-4 accepted gate prefers non-contradicted support over pure Head fallback', () => {
  const result = selection.decide({
    arbitration:{ routeId:'commercial_transaction', strength:'support' },
    head:{
      top1:{ id:'investment_suitability', score:0.06 },
      top2:{ id:'commercial_transaction', score:0.05 }
    },
    evidence:{},
    routeabilityDisposition:'route_known'
  });
  assert(result.status === 'selected', JSON.stringify(result));
  assert(result.routeId === 'commercial_transaction', JSON.stringify(result));
  assert(result.reasonCode === 'support_arbitration_priority_after_routeability', JSON.stringify(result));
});

test('R13V2-5 support priority does not override another confirmed candidate', () => {
  const result = selection.decide({
    arbitration:{ routeId:'commercial_transaction', strength:'support' },
    head:{
      top1:{ id:'investment_suitability', score:0.06 },
      top2:{ id:'commercial_transaction', score:0.05 }
    },
    evidence:{ domains:['investment'], goals:['suitability'] },
    routeabilityDisposition:'route_known'
  });
  assert(result.status === 'selected', JSON.stringify(result));
  assert(result.routeId === 'investment_suitability', JSON.stringify(result));
  assert(result.reasonCode === 'unique_confirmed_candidate', JSON.stringify(result));
});

test('R13V2-6 confirmed strong selection can bypass legacy Scope hard veto', () => {
  const result = finalization.finalize({
    routeability:{ disposition:'route_known', reasonCode:'confirmed_strong_rescue' },
    selection:{ status:'selected', routeId:'item_purchase', reasonCode:'strong_arbitration_confirmed' },
    scope:{ hardVeto:true },
    arbitration:{ routeId:'item_purchase', strength:'strong' },
    evidence:{ events:['ordinary_purchase'], objects:['purchasable_item'], currentTargets:['purchase'] }
  });
  assert(result.disposition === 'route_known', JSON.stringify(result));
  assert(result.routeId === 'item_purchase', JSON.stringify(result));
  assert(result.scopeBypassed === true, JSON.stringify(result));
  assert(result.reasonCode === 'confirmed_strong_scope_bypass', JSON.stringify(result));
});

test('R13V2-7 support selection still cannot bypass Scope hard veto', () => {
  const result = finalization.finalize({
    routeability:{ disposition:'route_known', reasonCode:'confirmed_support_rescue' },
    selection:{ status:'selected', routeId:'commercial_transaction', reasonCode:'unique_confirmed_candidate' },
    scope:{ hardVeto:true },
    arbitration:{ routeId:'commercial_transaction', strength:'support' },
    evidence:{ events:['commercial_transaction'], currentTargets:['commercial_transaction'] }
  });
  assert(result.disposition === 'non_route', JSON.stringify(result));
  assert(result.reasonCode === 'scope_hard_veto', JSON.stringify(result));
});

test('R13V2-8 unresolved selection remains unresolved instead of becoming a route', () => {
  const result = finalization.finalize({
    routeability:{ disposition:'route_known', reasonCode:'frozen_v02_score_accept' },
    selection:{ status:'route_unresolved', routeId:null, reasonCode:'multiple_confirmed_candidates' },
    scope:{ hardVeto:false },
    arbitration:null,
    evidence:{}
  });
  assert(result.disposition === 'route_unresolved', JSON.stringify(result));
  assert(result.routeId === null, JSON.stringify(result));
});

test('R13V2-9 v0.13-v0.2 responsibility modules remain modern-semantic only', () => {
  const source = [
    'js/liuyao-semantic-routeability-v04.js',
    'js/liuyao-semantic-route-selection-v03.js',
    'js/liuyao-semantic-finalization-v01.js'
  ].map((relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8')).join('\n');
  ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'].forEach((term) => {
    assert(!source.includes(term), `traditional field leaked: ${term}`);
  });
});

console.log(`\nLiuYao v0.13-v0.2 candidate responsibility: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
