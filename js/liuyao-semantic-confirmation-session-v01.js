(function (global) {
  'use strict';
  const G = global.GuiJia = global.GuiJia || {};
  const gate = G.liuyaoSemanticRoleTargetGateV01;
  if (!gate) throw new Error('Role/target gate v0.1 must be loaded first');
  const copy = value => JSON.parse(JSON.stringify(value));
  const ensure = (condition, message) => { if (!condition) throw new Error(message); };
  const freeze = value => {
    if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
    return value;
  };
  let sequence = 0;

  function createSession() {
    let packet = null, phase = 'idle', request = null, draft = null, coreRequest = null;
    let outcome = null, confirmationActions = 0;

    function sync() {
      request = null; draft = null; coreRequest = null;
      if (phase === 'collecting') {
        draft = gate.makePacket(`${packet.questionId}:addition:${packet.revision}`, packet.questionText);
        coreRequest = gate.assess(draft).clarification;
        request = { kind: 'add_goal', text: coreRequest.text, options: copy(coreRequest.options), binding: JSON.stringify(packet) };
      } else if (phase === 'clarifying') {
        const assessment = gate.assess(packet);
        ensure(assessment.status === 'clarify', 'Expected a pending clarification');
        coreRequest = assessment.clarification;
        request = { kind: coreRequest.kind, text: coreRequest.text, options: copy(coreRequest.options), binding: JSON.stringify(packet) };
      }
    }

    function snapshot() {
      return freeze(copy({ phase, packet, request, outcome, confirmationActions, assessment: packet ? gate.assess(packet) : null }));
    }

    function begin(text) {
      ensure(typeof text === 'string' && text.trim().length > 0 && text.length <= 2000, 'Enter a question of 1–2000 characters');
      packet = gate.makePacket(`confirmation-ui-${++sequence}`, text.trim());
      phase = 'collecting'; outcome = null; confirmationActions = 0; sync();
      return snapshot();
    }

    function answer(pending, optionId, label = '') {
      ensure(request && JSON.stringify(pending) === JSON.stringify(request), 'Stale or tampered confirmation request');
      ensure(typeof label === 'string' && label.trim().length <= 80, 'Goal label must be at most 80 characters');
      if (phase === 'collecting') {
        // Facts and proof records come from the frozen API's actual answer action.
        const confirmed = gate.applyAnswer(draft, coreRequest, optionId);
        const assessment = gate.assess(confirmed);
        const next = copy(packet);
        next.revision++;
        next.answers.push(...copy(confirmed.answers));
        if (assessment.status === 'ready') {
          const goal = copy(confirmed.goals[0]);
          goal.id = `goal-${next.revision}`;
          if (label.trim()) goal.label = label.trim();
          next.goals.push(goal);
          next.primaryGoalId = null;
          // A goal choice does not confirm that the inventory is complete.
          next.goalInventorySource = 'unverified';
        } else {
          phase = 'abstain';
        }
        packet = next;
      } else {
        ensure(phase === 'clarifying', 'No clarification is pending');
        packet = gate.applyAnswer(packet, coreRequest, optionId);
        phase = gate.assess(packet).status === 'ready' ? 'ready' : 'abstain';
      }
      confirmationActions++; outcome = null; sync();
      return snapshot();
    }

    function finishInventory() {
      ensure(phase === 'collecting' && packet.goals.length > 0, 'Confirm at least one goal before finishing the list');
      const next = copy(packet);
      next.revision++;
      next.goalInventorySource = 'user_confirmed';
      next.answers.push({ id: `${next.questionId}:${next.revision}:inventory`, kind: 'inventory_confirmed', goalId: null,
        optionId: 'complete_inventory', source: 'user_confirmed', confirmedValues: [] });
      packet = next; outcome = null; confirmationActions++;
      phase = gate.assess(packet).status === 'ready' ? 'ready' : 'clarifying';
      sync(); return snapshot();
    }

    function editInventory() {
      ensure(['ready', 'clarifying'].includes(phase), 'Only a finished list can be reopened');
      packet = copy(packet); packet.revision++; packet.goalInventorySource = 'unverified'; packet.primaryGoalId = null;
      phase = 'collecting'; outcome = null; sync(); return snapshot();
    }

    function removeGoal(goalId) {
      ensure(phase === 'collecting' && packet.goals.some(goal => goal.id === goalId), 'Only an existing goal in an open list can be removed');
      packet = copy(packet); packet.revision++;
      packet.goals = packet.goals.filter(goal => goal.id !== goalId);
      packet.primaryGoalId = null; packet.goalInventorySource = 'unverified'; outcome = null;
      sync(); return snapshot();
    }

    function authorize(upstream, candidate) {
      ensure(packet, 'Start a confirmation session first');
      outcome = gate.authorize(packet, upstream, candidate);
      return snapshot();
    }

    function clearOutcome() { outcome = null; return snapshot(); }
    function reset() { packet = null; phase = 'idle'; outcome = null; request = null; coreRequest = null; draft = null; confirmationActions = 0; return snapshot(); }
    return Object.freeze({ begin, answer, finishInventory, editInventory, removeGoal, authorize, clearOutcome, reset, snapshot });
  }

  G.liuyaoSemanticConfirmationSessionV01 = Object.freeze({ version: '0.1-explicit-user-confirmation-session', createSession,
    rawLanguageExtraction: false, productionIntegrated: false });
})(typeof window !== 'undefined' ? window : globalThis);
