(function () {
  'use strict';
  const G = window.GuiJia, session = G.liuyaoSemanticConfirmationSessionV01.createSession();
  const byId = id => document.getElementById(id);
  const routeLabels = {borrow_money: '我向别人借钱，能否借到？', lend_money: '我把钱借给别人，是否合适？',
    debt_collection: '别人欠我钱，能否收回？', debt_repayment: '我欠别人钱，能否还清？',
    business_operation: '自己的生意经营会怎样？', investment_profit: '投入的资本有没有收益？'};
  const roleRoutes = {'new_credit:self_receives': 'borrow_money', 'new_credit:self_provides': 'lend_money',
    'existing_debt:self_creditor': 'debt_collection', 'existing_debt:self_debtor': 'debt_repayment',
    'business_operation:unknown': 'business_operation', 'investment_return:unknown': 'investment_profit'};
  const resultLabels = {candidate_matches_confirmed_role_and_target: '候选与已确认目标一致，通过模拟接口检查。',
    candidate_conflicts_with_confirmed_role_or_target: '候选与已确认目标或资金角色冲突，未通过检查。',
    blocked_by_frozen_upstream: '上游条件阻止选择，目标确认不能绕过。', fallback_not_reachable: 'Fallback 的上游条件未满足。',
    multiple_fallback_admissions: '模拟分数有多个接纳结果，不能选择路线。', no_fallback_admission: '没有接纳结果，不能选择路线。'};

  for (const route of G.liuyaoSemanticFallbackIdentityModelV02.routeIds) {
    const option = document.createElement('option'); option.value = route;
    option.textContent = `${routeLabels[route] || route} (${route})`;
    byId('candidate-route').append(option);
  }
  byId('candidate-route').value = 'borrow_money';

  function act(action, focus = false) {
    try { action(); byId('error').hidden = true; render(); if (focus) byId(byId('confirmation-panel').hidden ? 'status' : 'confirmation-heading').focus(); }
    catch (error) { byId('error').textContent = `暂时无法继续：${error.message}`; byId('error').hidden = false; }
  }

  function render() {
    const state = session.snapshot(), collecting = state.phase === 'collecting';
    const goals = state.packet?.goals || [], primaryId = state.assessment?.primaryGoalId;
    byId('confirmation-panel').hidden = !state.request;
    byId('collection-help').hidden = !collecting;
    byId('phase-heading').textContent = collecting ? '列出要问的目标' : '选定这次的主要目标';
    byId('prompt-text').textContent = collecting ? '要加入的这件事属于哪一种？' : (state.request?.text || '');
    byId('choices').replaceChildren();
    if (state.request) {
      const pending = state.request;
      for (const option of pending.options) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'choice';
        button.dataset.option = option.id; button.textContent = option.text;
        button.addEventListener('click', () => act(() => {
          session.answer(pending, option.id, collecting ? byId('goal-label').value : '');
          byId('goal-label').value = '';
        }, true));
        byId('choices').append(button);
      }
    }
    byId('finish-inventory').hidden = !collecting;
    byId('finish-inventory').disabled = goals.length === 0;
    byId('goal-count').textContent = String(goals.length);
    byId('empty-list').hidden = goals.length > 0;
    byId('goal-list').replaceChildren();
    for (const goal of goals) {
      const item = document.createElement('li'); item.className = 'goal'; item.dataset.goalId = goal.id;
      if (goal.id === primaryId) item.classList.add('primary-goal');
      const title = document.createElement('div'); title.className = 'goal-title';
      const name = document.createElement('span'); name.className = 'goal-name'; name.textContent = goal.label; title.append(name);
      if (collecting) {
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.textContent = '移除';
        remove.setAttribute('aria-label', `移除目标：${goal.label}`); remove.addEventListener('click', () => act(() => session.removeGoal(goal.id)));
        title.append(remove);
      }
      const detail = document.createElement('p'); detail.className = 'goal-detail';
      const route = roleRoutes[`${goal.intent.value}:${goal.role.value}`];
      detail.textContent = `${goal.id === primaryId ? '本次主要目标 · ' : ''}${routeLabels[route] || '待确认'}`;
      item.append(title, detail); byId('goal-list').append(item);
    }
    const statusText = {idle: '等待输入问题', collecting: goals.length ? '目标已加入；确认清单完整后，才能进入下一步。' : '请选择并确认要问的目标。',
      clarifying: '你确认了不止一件事，请选择这次先看的主要目标。', ready: '本次主要目标及所需资金角色已确认。',
      abstain: state.assessment?.reason === 'outside_prototype_scope' ? '这件事超出本页范围，本次停止确认。' : '目标还不能确定，本次停止确认。'};
    byId('status').textContent = statusText[state.phase]; byId('status').dataset.phase = state.phase;
    byId('confirmation-summary').textContent = state.confirmationActions ? `本次已记录 ${state.confirmationActions} 次明确选择或确认。修改问题会清空这些确认。` : '';
    byId('edit-inventory').hidden = !['ready', 'clarifying'].includes(state.phase);
    byId('candidate-controls').disabled = state.phase !== 'ready';
    byId('candidate-result').textContent = state.outcome ? `${resultLabels[state.outcome.reason] || '仍需完成目标确认。'}${state.outcome.selectedRoute ? ` 选定：${state.outcome.selectedRoute}` : ' 未选定路线。'}` : '尚未检查候选。';
    byId('candidate-result').dataset.selectedRoute = state.outcome?.selectedRoute || '';
    byId('confirmation-record').textContent = state.packet ? JSON.stringify({phase: state.phase, confirmationActions: state.confirmationActions,
      packet: state.packet, assessment: state.assessment, simulation: state.outcome}, null, 2) : '尚无确认记录。';
  }

  byId('question-form').addEventListener('submit', event => { event.preventDefault(); act(() => { session.begin(byId('question-text').value); byId('goal-label').value = ''; }, true); });
  byId('question-text').addEventListener('input', () => act(() => { session.reset(); byId('goal-label').value = ''; }));
  byId('finish-inventory').addEventListener('click', () => act(() => session.finishInventory(), true));
  byId('edit-inventory').addEventListener('click', () => act(() => session.editInventory(), true));
  for (const id of ['candidate-branch', 'candidate-route', 'upstream-condition']) byId(id).addEventListener('change', () => act(() => session.clearOutcome()));
  byId('candidate-form').addEventListener('submit', event => {
    event.preventDefault(); act(() => {
      const source = byId('candidate-branch').value, route = byId('candidate-route').value, condition = byId('upstream-condition').value;
      const upstream = {semanticAct: {eligible: condition !== 'act_blocked'}, routeSufficiency: {accepted: condition !== 'sufficiency_blocked'},
        routeability: {accepted: condition !== 'routeability_blocked'}, unsupportedTargets: condition === 'unsupported' ? ['synthetic_unsupported'] : [],
        arbitration: source === 'Arbitration' ? {routeId: route, strength: 'strong'} : null};
      const other = route === 'borrow_money' ? 'lend_money' : 'borrow_money';
      const probabilities = Object.fromEntries(G.liuyaoSemanticFallbackIdentityModelV02.routeIds.map(id => [id,
        id === route || (condition === 'multiple_admission' && id === other) ? .9 : .1]));
      session.authorize(upstream, source === 'Fallback' ? {source, probabilities, threshold: .5} : {source});
    });
  });
  render();
})();
