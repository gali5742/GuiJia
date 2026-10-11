import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {createDemoServer, demoFiles} from './serve-liuyao-semantic-confirmation-demo-v01.mjs';

assert(process.env.NODE_OPTIONS?.includes('liuyao-semantic-v013-candidate-v07-evaluation-read-guard.cjs'), 'Preload the evaluation read guard');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = demoFiles;
// The test server reads and serves only these six assets, never a checkout tree.
const {assets, server} = createDemoServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const checks = [], pageErrors = [], unexpectedRequests = [];
let browser;
const reportPath = path.join(root, 'data/liuyao-semantic-role-target-confirmation-ui-v0.1-browser-checks.json');

try {
  browser = await chromium.launch({headless: true, args: ['--no-sandbox'], ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {})});
  const context = await browser.newContext({viewport: {width: 1100, height: 900}});
  const page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === origin && assets.has(url.pathname)) return route.continue();
    unexpectedRequests.push(`${url.origin}${url.pathname}`); return route.abort();
  });
  const check = async (name, run) => { await run(); checks.push({name, status: 'passed'}); console.log(`PASS ${name}`); };
  const load = async () => { await page.goto(`${origin}/demos/liuyao-role-target-confirmation.html`); await page.locator('#question-text').waitFor(); };
  const begin = async (question = '合成输入：仅检查用户确认动作，不进行自然语言评分。') => {
    await page.locator('#question-text').fill(question); await page.locator('#begin-confirmation').click();
  };
  const choose = async (option, label = '') => {
    if (label) await page.locator('#goal-label').fill(label);
    await page.locator(`#choices [data-option="${option}"]`).click();
  };
  const record = async () => JSON.parse(await page.locator('#confirmation-record').textContent());
  const ready = async (route = 'borrow_money') => { await load(); await begin(); await choose(route); await page.locator('#finish-inventory').click(); };
  const simulate = async (branch, route, condition = 'allowed') => {
    if (!(await page.locator('#candidate-panel').evaluate(node => node.open))) await page.locator('#candidate-panel > summary').click();
    await page.locator('#candidate-branch').selectOption(branch); await page.locator('#candidate-route').selectOption(route);
    await page.locator('#upstream-condition').selectOption(condition); await page.locator('#candidate-form button[type="submit"]').click();
    return record();
  };

  await check('initial_page_and_allowlisted_asset_server', async () => {
    await load(); assert.equal(await page.title(), '龟甲 · 占问确认原型');
    assert.equal(await page.locator('#status').getAttribute('data-phase'), 'idle');
    assert.equal(await page.locator('#candidate-controls').evaluate(node => node.disabled), true);
    assert.equal(await page.locator('#candidate-form button[type="submit"]').isDisabled(), true);
    // This request never reads a file: the allowlist returns 404 before filesystem access.
    const response = await fetch(`${origin}/data/not-served.json`); assert.equal(response.status, 404);
    for (const file of files) { const response = await fetch(`${origin}/${file}`); assert.equal(response.status, 200); assert.deepEqual(Buffer.from(await response.arrayBuffer()), assets.get(`/${file}`)); }
  });

  await check('goal_choice_does_not_confirm_inventory_or_enable_candidates', async () => {
    await begin(); assert.equal(await page.locator('#finish-inventory').isDisabled(), true); await choose('borrow_money');
    const state = await record(); assert.equal(state.phase, 'collecting'); assert.equal(state.packet.goalInventorySource, 'unverified');
    assert.equal(state.packet.goals[0].role.source, 'user_confirmed'); assert.equal(state.assessment.permissions.maySelectRoute, false);
    assert.equal(await page.locator('#candidate-form button[type="submit"]').isDisabled(), true);
  });

  await check('six_supported_choices_preserve_role_and_goal_confirmation_proofs', async () => {
    for (const route of ['borrow_money', 'lend_money', 'debt_collection', 'debt_repayment', 'business_operation', 'investment_profit']) {
      await ready(route); const state = await record(); assert.equal(state.phase, 'ready'); assert.equal(state.assessment.confirmedRoute, route);
      assert.equal(state.confirmationActions, 2); assert.equal(state.assessment.selectedRoute, null);
      assert.equal(await page.locator('#candidate-form button[type="submit"]').isDisabled(), false);
      const goal = state.packet.goals[0]; assert(state.packet.answers.some(answer => answer.id === goal.intent.confirmationId && answer.confirmedValues.includes(goal.intent.value)));
    }
  });

  await check('multiple_targets_require_explicit_primary_focus', async () => {
    await load(); await begin(); await choose('borrow_money', '款项甲'); await choose('debt_collection', '款项乙');
    await page.locator('#finish-inventory').click(); let state = await record();
    assert.equal(state.phase, 'clarifying'); assert.equal(state.assessment.reason, 'primary_goal'); assert.equal(await page.locator('#candidate-form button[type="submit"]').isDisabled(), true);
    const second = state.packet.goals[1]; await choose(second.id); state = await record();
    assert.equal(state.phase, 'ready'); assert.equal(state.packet.primaryGoalId, second.id); assert.equal(state.assessment.confirmedRoute, 'debt_collection');
    assert.equal(state.confirmationActions, 4); assert.equal(await page.locator('#goal-list .primary-goal .goal-name').textContent(), '款项乙');
  });

  await check('duplicate_intent_goals_keep_distinct_labels_and_instances', async () => {
    await load(); await begin(); await choose('borrow_money', '借款甲'); await choose('borrow_money', '借款乙');
    await page.locator('#finish-inventory').click(); const before = await record();
    assert.equal(before.packet.goals.length, 2); assert.notEqual(before.packet.goals[0].id, before.packet.goals[1].id);
    await choose(before.packet.goals[1].id); assert.equal((await record()).packet.primaryGoalId, before.packet.goals[1].id);
  });

  await check('conflicting_candidates_blocked_in_both_branches_without_replacement', async () => {
    for (const [correct, incorrect] of [['borrow_money', 'lend_money'], ['debt_repayment', 'debt_collection']]) {
      await ready(correct);
      for (const branch of ['Fallback', 'Arbitration']) {
        const state = await simulate(branch, incorrect);
        assert.equal(state.simulation.reason, 'candidate_conflicts_with_confirmed_role_or_target'); assert.equal(state.simulation.selectedRoute, null);
      }
    }
  });

  await check('matching_synthetic_candidates_and_frozen_upstream_permissions', async () => {
    await ready();
    for (const branch of ['Fallback', 'Arbitration']) {
      assert.equal((await simulate(branch, 'borrow_money')).simulation.selectedRoute, 'borrow_money');
      for (const condition of ['act_blocked', 'sufficiency_blocked', 'unsupported']) {
        const state = await simulate(branch, 'borrow_money', condition); assert.equal(state.simulation.reason, 'blocked_by_frozen_upstream');
        assert.equal(state.simulation.selectedRoute, null);
      }
    }
    assert.equal((await simulate('Fallback', 'borrow_money', 'routeability_blocked')).simulation.reason, 'fallback_not_reachable');
    assert.equal((await simulate('Arbitration', 'borrow_money', 'routeability_blocked')).simulation.selectedRoute, 'borrow_money');
    assert.equal((await simulate('Fallback', 'borrow_money', 'multiple_admission')).simulation.reason, 'multiple_fallback_admissions');
  });

  await check('candidate_change_discards_previous_simulation_result', async () => {
    await ready(); await simulate('Fallback', 'borrow_money'); await page.locator('#candidate-route').selectOption('lend_money');
    assert.equal((await record()).simulation, null); assert.equal(await page.locator('#candidate-result').getAttribute('data-selected-route'), '');
  });

  await check('editing_and_removing_goals_require_inventory_reconfirmation', async () => {
    await ready(); await simulate('Fallback', 'borrow_money'); await page.locator('#edit-inventory').click();
    let state = await record(); assert.equal(state.phase, 'collecting'); assert.equal(state.simulation, null);
    assert.equal(state.packet.goalInventorySource, 'unverified'); assert.equal(await page.locator('#candidate-form button[type="submit"]').isDisabled(), true);
    await page.locator('#goal-list button.remove').click(); state = await record();
    assert.equal(state.packet.goals.length, 0); assert.equal(await page.locator('#finish-inventory').isDisabled(), true);
    await choose('debt_collection'); await page.locator('#finish-inventory').click(); assert.equal((await record()).assessment.confirmedRoute, 'debt_collection');
  });

  await check('question_edit_immediately_clears_existing_confirmations_and_outcome', async () => {
    await ready(); await simulate('Fallback', 'borrow_money'); await page.locator('#question-text').fill('改过的合成问题，之前确认不得沿用。');
    assert.equal(await page.locator('#status').getAttribute('data-phase'), 'idle'); assert.equal(await page.locator('#goal-count').textContent(), '0');
    assert.equal(await page.locator('#candidate-form button[type="submit"]').isDisabled(), true); assert.equal(await page.locator('#candidate-result').getAttribute('data-selected-route'), '');
    assert.equal(await page.locator('#confirmation-record').textContent(), '尚无确认记录。');
  });

  await check('unsure_and_outside_scope_exits_stop_without_looping', async () => {
    for (const option of ['unsure', 'outside_scope']) {
      await load(); await begin(); await choose('borrow_money'); await choose(option); const state = await record();
      assert.equal(state.phase, 'abstain'); assert.equal(state.assessment.selectedRoute, null);
      assert.equal(await page.locator('#confirmation-panel').isVisible(), false); assert.equal(await page.locator('#candidate-form button[type="submit"]').isDisabled(), true);
    }
    await load(); await begin(); await choose('borrow_money'); await choose('debt_collection'); await page.locator('#finish-inventory').click();
    await choose('unsure'); assert.equal((await record()).phase, 'abstain');
  });

  await check('labels_and_questions_remain_text_and_nothing_is_persisted', async () => {
    const markup = '<img src="/unexpected-resource" onerror="window.uiInjected=true">';
    await load(); await begin(`合成问题 ${markup}`); await choose('borrow_money', markup);
    assert.equal(await page.locator('#goal-list .goal-name').textContent(), markup); assert.equal(await page.locator('#goal-list img').count(), 0);
    assert.equal(await page.evaluate(() => window.uiInjected), undefined);
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    await page.reload(); assert.equal(await page.locator('#question-text').inputValue(), ''); assert.equal(await page.locator('#goal-count').textContent(), '0');
  });

  await check('keyboard_confirmation_and_ready_state_focus', async () => {
    await load(); await page.locator('#question-text').focus(); await page.keyboard.type('合成输入：只用键盘确认。');
    await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
    await page.locator('#choices [data-option="borrow_money"]').focus(); await page.keyboard.press('Enter');
    await page.locator('#finish-inventory').focus(); await page.keyboard.press('Enter');
    assert.equal((await record()).phase, 'ready'); assert.equal(await page.evaluate(() => document.activeElement.id), 'status');
  });

  await check('mobile_layout_multiple_goals_and_full_confirmation', async () => {
    await page.setViewportSize({width: 390, height: 844}); await load(); await begin();
    await choose('borrow_money', '借款甲'); await choose('debt_collection', '欠款乙'); await page.locator('#finish-inventory').click();
    const pending = await record(); await choose(pending.packet.goals[1].id);
    assert.equal((await record()).assessment.confirmedRoute, 'debt_collection');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    if (process.env.GUIJIA_CONFIRMATION_SCREENSHOT) await page.screenshot({path: process.env.GUIJIA_CONFIRMATION_SCREENSHOT, fullPage: true});
  });

  await check('no_javascript_errors_or_unexpected_network_requests', async () => { assert.deepEqual(pageErrors, []); assert.deepEqual(unexpectedRequests, []); });
  const report = {version: '0.1-confirmation-ui-real-browser-checks', status: 'all_directed_browser_checks_passed', completedAtUTC: new Date().toISOString(),
    runtime: {node: process.version, browser: `Chromium ${browser.version()}`}, checks, passed: checks.length, failed: 0, skipped: 0,
    servedAssets: files, testedEntryModes: ['allowlisted_HTTP'], directFileLaunch: 'blocked_by_browser_administrator_policy', javascriptErrors: pageErrors, unexpectedRequests, source: 'actual_local_browser_actions_on_synthetic_interaction_fixtures',
    realUserStudy: false, naturalLanguageAccuracyMeasured: false, realClassifierExecuted: false, encoderInvocations: 0, productionIntegrated: false, cloudCIExecuted: false};
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({passed: checks.length, failed: 0, browser: report.runtime.browser, report: path.relative(root, reportPath)}));
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
