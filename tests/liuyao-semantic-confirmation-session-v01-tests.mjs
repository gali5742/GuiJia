import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context = {}; context.window = context; vm.createContext(context);
for (const path of ['js/liuyao-semantic-fallback-identity-model-v02.js', 'js/liuyao-semantic-role-target-gate-v01.js', 'js/liuyao-semantic-confirmation-session-v01.js'])
  vm.runInContext(fs.readFileSync(path, 'utf8'), context, {filename: path});
const api = context.GuiJia.liuyaoSemanticConfirmationSessionV01;
const routes = context.GuiJia.liuyaoSemanticFallbackIdentityModelV02.routeIds;
const create = () => { const session = api.createSession(); session.begin('合成输入：仅检查明确确认流程与旧状态失效。'); return session; };
const add = (session, route, label) => session.answer(session.snapshot().request, route, label);
const upstream = (changes = {}) => ({semanticAct: {eligible: true}, routeSufficiency: {accepted: true}, routeability: {accepted: true}, unsupportedTargets: [], arbitration: null, ...changes});
const candidate = route => ({source: 'Fallback', probabilities: Object.fromEntries(routes.map(id => [id, id === route ? .9 : .1])), threshold: .5});
const ready = route => { const session = create(); add(session, route); session.finishInventory(); return session; };

test('confirmed goal facts do not confirm completeness or permit either branch', () => {
  const session = create(), state = add(session, 'borrow_money');
  assert.equal(state.packet.goals[0].role.source, 'user_confirmed');
  assert.equal(state.packet.goalInventorySource, 'unverified');
  assert.equal(state.assessment.status, 'clarify');
  for (const source of ['Fallback', 'Arbitration']) {
    const checked = session.authorize(upstream({arbitration: source === 'Arbitration' ? {routeId: 'borrow_money', strength: 'strong'} : null}),
      source === 'Fallback' ? candidate('borrow_money') : {source});
    assert.equal(checked.outcome.selectedRoute, null); assert.equal(checked.outcome.permissions.mayRunArbitration, false);
    assert.equal(checked.outcome.permissions.mayRunFallback, false);
  }
});
test('one explicit goal and one complete-list confirmation make a single target ready', () => {
  const session = ready('debt_repayment'), state = session.snapshot();
  assert.equal(state.phase, 'ready'); assert.equal(state.confirmationActions, 2);
  assert.equal(state.assessment.confirmedRoute, 'debt_repayment'); assert.equal(state.assessment.selectedRoute, null);
  const goal = state.packet.goals[0];
  assert(state.packet.answers.some(answer => answer.id === goal.role.confirmationId && answer.confirmedValues.includes('self_debtor')));
  assert.equal(session.authorize(upstream(), candidate('debt_repayment')).outcome.selectedRoute, 'debt_repayment');
});
test('two goals of the same intent stay distinct and require a primary choice', () => {
  const session = create(); add(session, 'borrow_money', '款项甲'); add(session, 'borrow_money', '款项乙');
  const focused = session.finishInventory();
  assert.equal(focused.phase, 'clarifying'); assert.equal(focused.request.kind, 'primary_goal');
  assert.equal(focused.packet.goals.length, 2); assert.notEqual(focused.packet.goals[0].id, focused.packet.goals[1].id);
  assert.equal(session.authorize(upstream(), candidate('borrow_money')).outcome.selectedRoute, null);
  const selected = session.answer(session.snapshot().request, focused.packet.goals[1].id);
  assert.equal(selected.packet.primaryGoalId, focused.packet.goals[1].id); assert.equal(selected.phase, 'ready');
  assert.equal(selected.confirmationActions, 4);
});
test('a conflicting independently supplied candidate is blocked for both branches', () => {
  const session = ready('borrow_money');
  for (const source of ['Fallback', 'Arbitration']) {
    const state = session.authorize(upstream({arbitration: source === 'Arbitration' ? {routeId: 'lend_money', strength: 'strong'} : null}),
      source === 'Fallback' ? candidate('lend_money') : {source});
    assert.equal(state.outcome.reason, 'candidate_conflicts_with_confirmed_role_or_target'); assert.equal(state.outcome.selectedRoute, null);
  }
});
test('reopening a confirmed list clears focus and candidate outcome', () => {
  const session = ready('borrow_money'); session.authorize(upstream(), candidate('borrow_money'));
  const state = session.editInventory();
  assert.equal(state.phase, 'collecting'); assert.equal(state.packet.goalInventorySource, 'unverified');
  assert.equal(state.packet.primaryGoalId, null); assert.equal(state.outcome, null); assert.equal(state.assessment.permissions.maySelectRoute, false);
});
test('removing a goal invalidates an outstanding add-goal request', () => {
  const session = create(); add(session, 'borrow_money'); add(session, 'debt_collection');
  const before = session.snapshot(); session.removeGoal(before.packet.goals[0].id);
  assert.equal(session.snapshot().packet.goals.length, 1);
  assert.throws(() => session.answer(before.request, 'investment_profit'), /Stale/);
  assert.equal(session.finishInventory().assessment.confirmedRoute, 'debt_collection');
});
test('old focus replies cannot be reused after a list edit', () => {
  const session = create(); add(session, 'borrow_money'); add(session, 'debt_collection');
  const before = session.finishInventory(); session.editInventory();
  assert.throws(() => session.answer(before.request, before.packet.goals[0].id), /Stale/);
});
test('question changes and resets clear facts, replies and prior candidate selections', () => {
  const session = ready('borrow_money'); session.authorize(upstream(), candidate('borrow_money'));
  const firstId = session.snapshot().packet.questionId;
  const state = session.begin('另一条合成输入：重新确认。');
  assert.notEqual(state.packet.questionId, firstId); assert.equal(state.packet.goals.length, 0);
  assert.equal(state.packet.answers.length, 0); assert.equal(state.outcome, null);
  assert.equal(session.reset().packet, null); assert.equal(session.snapshot().phase, 'idle');
});
test('unsure and outside-scope replies stop even when an earlier goal was added', () => {
  for (const option of ['unsure', 'outside_scope']) {
    const session = create(); add(session, 'borrow_money'); const state = add(session, option);
    assert.equal(state.phase, 'abstain'); assert.equal(state.assessment.status, 'abstain');
    assert.equal(session.authorize(upstream(), candidate('borrow_money')).outcome.selectedRoute, null);
    assert.throws(() => session.finishInventory(), /at least one/);
  }
});
test('tampered requests, unknown options and invalid labels cannot mutate state', () => {
  const session = create(), before = session.snapshot();
  assert.throws(() => session.answer({...before.request, kind: 'primary_goal'}, 'borrow_money'), /tampered/);
  assert.throws(() => session.answer(before.request, 'invented'), /Unknown/);
  assert.throws(() => session.answer(before.request, 'borrow_money', 'a'.repeat(81)), /80/);
  assert.equal(JSON.stringify(session.snapshot()), JSON.stringify(before));
});
test('empty inventories cannot be promoted and snapshots cannot mutate live facts', () => {
  const session = create(); assert.throws(() => session.finishInventory(), /at least one/);
  const state = add(session, 'borrow_money'); assert.throws(() => state.packet.goals.push({}), /extensible/);
  assert.equal(session.snapshot().packet.goals.length, 1);
});
test('confirmed goals do not bypass frozen upstream or change Arbitration Routeability policy', () => {
  const session = ready('borrow_money');
  assert.equal(session.authorize(upstream({semanticAct: {eligible: false}}), candidate('borrow_money')).outcome.reason, 'blocked_by_frozen_upstream');
  assert.equal(session.authorize(upstream({routeability: {accepted: false}}), candidate('borrow_money')).outcome.reason, 'fallback_not_reachable');
  assert.equal(session.authorize(upstream({routeability: {accepted: false}, arbitration: {routeId: 'borrow_money', strength: 'strong'}}), {source: 'Arbitration'}).outcome.selectedRoute, 'borrow_money');
});
