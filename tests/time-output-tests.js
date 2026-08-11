#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
function assert(condition, message) { if (!condition) throw new Error(message); }
function test(name, fn) {
    try { fn(); passed += 1; console.log(`✓ ${name}`); }
    catch (error) { failed += 1; console.error(`✗ ${name}`); console.error(`  ${error.message}`); }
}
const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
vm.createContext(context);
[
    'js/liuyao-time-facts.js',
    'js/liuyao-time-effects.js',
    'js/liuyao-time-assessment.js',
    'js/liuyao-time-evidence.js',
    'js/liuyao-time-relevance.js',
    'js/liuyao-time-output.js'
].forEach((relative) => vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative }));

const facts = context.GuiJia.liuyaoTimeFacts;
const effects = context.GuiJia.liuyaoTimeEffects;
const assessments = context.GuiJia.liuyaoTimeAssessment;
const evidenceApi = context.GuiJia.liuyaoTimeEvidence;
const outputApi = context.GuiJia.liuyaoTimeOutput;

function event(code, options = {}) {
    const legacy = {
        code,
        label:options.label || code,
        text:options.text || code,
        subject:options.subject || 'main-observer',
        tier:options.tier || 'primary',
        score:options.score || 100,
        roleCode:options.roleCode || '',
        direction:options.direction || 'mixed',
        factMeta:options.factMeta || {}
    };
    legacy.fact = facts.factFromLegacyEvent(legacy);
    legacy.timeEffects = effects.mapTimeFactToEffects(legacy.fact);
    return legacy;
}
function candidate(events, caveat = '') {
    const assessment = assessments.assessNodeEvents(events);
    const evidence = evidenceApi.selectNodeEvidence(events, assessment, 3);
    const output = outputApi.buildCandidateNodeOutput(assessment, evidence, { caveat });
    return { assessment, evidence, output };
}

test('候选输出直接采用六维 Node Assessment，不读取 legacy direction', () => {
    const { output } = candidate([
        event('TARGET_HARMONY', { label:'静爻逢合·合起' }),
        event('TARGET_DAY_CONTROL', { label:'目标日克制', tier:'secondary' })
    ]);
    assert(output.summary.text === '触发伴随受制', `候选摘要异常：${output.summary.text}`);
    assert(!output.summary.text.includes('生扶'), '六合被误写为生扶');
});

test('泄力与受制保持分离', () => {
    const { output } = candidate([
        event('TARGET_HARMONY', { label:'静爻逢合·合起' }),
        event('TARGET_DAY_DRAIN', { label:'目标日泄力', tier:'secondary' })
    ]);
    assert(output.summary.text === '触发伴随泄力', `泄力摘要异常：${output.summary.text}`);
    assert(!output.summary.text.includes('受制'), '泄力仍被归入受制');
});

test('候选事实完全来自 Evidence Selector，复合事件不再重复子事件', () => {
    const { output } = candidate([
        event('MOVING_2_VOID_OUT_VALUE', { subject:'moving-line', roleCode:'SOURCE', label:'生扶动爻出空并逢值' }),
        event('MOVING_VALUE_2', { subject:'moving-line', roleCode:'SOURCE', label:'生扶动爻逢值', score:90 })
    ]);
    assert(output.facts.length === 1, `复合事实仍重复：${JSON.stringify(output.facts)}`);
    assert(output.facts[0].includes('出空并逢值'), `未保留复合事实：${output.facts[0]}`);
});

test('摘要中的全部效力维度在候选可见事实中都有证据', () => {
    const { assessment, output } = candidate([
        event('TARGET_VALUE'),
        event('TARGET_DAY_SUPPORT', { tier:'secondary' }),
        event('TARGET_DAY_CONTROL', { tier:'secondary' }),
        event('TARGET_DAY_DRAIN', { tier:'context' }),
        event('TARGET_CONTROLS_DAY', { tier:'context' })
    ]);
    assessment.activeKinds.forEach((kind) => {
        assert(output.evidence.some((item) => item.coversKinds.includes(kind)), `候选输出缺少 ${kind} 可见证据`);
    });
});

test('动爻原有状态 caveat 只附加在摘要末尾，不污染六维 kind', () => {
    const { output } = candidate([event('TARGET_VALUE')], '本爻原有化墓仍需并看');
    assert(output.summary.text === '以触发为主；本爻原有化墓仍需并看', `caveat 文案异常：${output.summary.text}`);
    assert(JSON.stringify(output.summary.kinds) === JSON.stringify(['trigger']), `caveat 污染效力维度：${JSON.stringify(output.summary.kinds)}`);
});

test('日期候选：纯生扶优于仅比和，二者均不因触发本身加分', () => {
    const support = candidate([event('TARGET_DAY_SUPPORT', { tier:'secondary' })]).output;
    const peer = candidate([event('TARGET_DAY_PEER', { tier:'secondary' })]).output;
    assert(support.dateAssessment.code === 'preferred', `纯生扶未进入优先候选：${support.dateAssessment.code}`);
    assert(peer.dateAssessment.code === 'secondary', `纯比和未进入次选：${peer.dateAssessment.code}`);
    const a = { dateText:'2026/8/11', dayGanZhi:'丁巳', sortTime:1, candidateOutput:support };
    const b = { dateText:'2026/8/12', dayGanZhi:'戊午', sortTime:2, candidateOutput:peer };
    assert(outputApi.compareDateOutputs(a,b) < 0, '纯生扶未排在纯比和之前');
});

test('日期候选：生扶与受制并见保持 mixed，不压成单向优先', () => {
    const { output } = candidate([
        event('TARGET_DAY_SUPPORT', { tier:'secondary' }),
        event('TARGET_DAY_CONTROL', { tier:'secondary' })
    ]);
    assert(output.dateAssessment.code === 'mixed', `生扶+受制未保持 mixed：${output.dateAssessment.code}`);
    assert(output.dateAssessment.text.startsWith('利弊并见：'), `日期判断未体现利弊并见：${output.dateAssessment.text}`);
});

test('日期比较器可直接比较带 candidateOutput 的节点包装对象', () => {
    const better = candidate([event('TARGET_DAY_SUPPORT', { tier:'secondary' })]).output;
    const worse = candidate([event('TARGET_DAY_CONTROL', { tier:'secondary' })]).output;
    const a = { dateText:'2026/8/11', sortTime:1, candidateOutput:better };
    const b = { dateText:'2026/8/12', sortTime:2, candidateOutput:worse };
    assert(outputApi.compareDateOutputs(a,b) < 0, '节点包装对象没有按 Candidate Output 日期效力比较');
});

test('日期比较：mixed 中无受制但有泄力，优于同样有生扶但明确受制', () => {
    const supportOutflow = candidate([
        event('TARGET_DAY_SUPPORT', { tier:'secondary' }),
        event('TARGET_DAY_DRAIN', { tier:'secondary' })
    ]).output;
    const supportConstraint = candidate([
        event('TARGET_DAY_SUPPORT', { tier:'secondary' }),
        event('TARGET_DAY_CONTROL', { tier:'secondary' })
    ]).output;
    assert(supportOutflow.dateAssessment.code === 'mixed' && supportConstraint.dateAssessment.code === 'mixed', '测试前提不是 mixed');
    assert(outputApi.compareDateProfiles(supportOutflow.dateAssessment, supportConstraint.dateAssessment) < 0, 'mixed 内仍把明确受制排在仅泄力之前');
});

test('日期比较：仅泄力的 caution 优于明确受制的 caution', () => {
    const outflow = candidate([event('TARGET_DAY_DRAIN', { tier:'secondary' })]).output;
    const constraint = candidate([event('TARGET_DAY_CONTROL', { tier:'secondary' })]).output;
    assert(outflow.dateAssessment.code === 'caution' && constraint.dateAssessment.code === 'caution', '测试前提不是 caution');
    assert(outputApi.compareDateProfiles(outflow.dateAssessment, constraint.dateAssessment) < 0, 'caution 内没有区分泄力与明确受制');
});

test('日期并列按实质效力组合判断，不因 direct / primary 细节强行分胜负', () => {
    const direct = candidate([event('TARGET_DAY_SUPPORT', { subject:'main-observer', tier:'primary' })]).output;
    const indirect = candidate([event('TARGET_DAY_SUPPORT', { subject:'context', tier:'secondary' })]).output;
    assert(outputApi.materiallyEquivalentDateProfiles(direct.dateAssessment, indirect.dateAssessment), '同一实质效力组合未识别为可并列');
    const comparison = outputApi.buildDateSelectionComparison([
        { dateText:'2026/8/11', dayGanZhi:'丁巳', sortTime:1, candidateOutput:direct },
        { dateText:'2026/8/14', dayGanZhi:'庚申', sortTime:2, candidateOutput:indirect }
    ]);
    assert(comparison.status === 'tie', `同一实质效力组合被强行选出唯一日期：${comparison.summary}`);
});

test('Candidate Output schema 校验要求摘要与证据可追溯', () => {
    const { assessment, evidence, output } = candidate([event('TARGET_VALUE'), event('TARGET_CONTROLS_DAY', { tier:'context' })]);
    const errors = outputApi.validateCandidateNodeOutput(output, assessment, evidence);
    assert(errors.length === 0, `Candidate Output schema 无效：${JSON.stringify(errors)}`);
});

test('beta.2 摘要效力必须在正式证据标签中可直接读出', () => {
    const { output } = candidate([
        event('SANHE_DEFERRED_CLASH_0_0', {
            label:'三合待实·冲空',
            subject:'sanhe',
            tier:'primary',
            factMeta:{ formationElement:'木', observerElement:'土' }
        }),
        event('CHANGED_5_VOID_CLASH', {
            label:'变爻冲空',
            subject:'changed-line',
            tier:'primary',
            roleCode:'ENEMY'
        }),
        event('TARGET_DAY_SUPPORT', { label:'目标日生扶', tier:'secondary' })
    ]);
    assert(output.summary.kinds.includes('exertion') && output.summary.kinds.includes('constraint'), `测试前提未形成耗力/受制：${JSON.stringify(output.summary)}`);
    assert(output.evidence.some((item) => item.coversKinds.includes('exertion') && item.label.includes('耗力')), `耗力证据用户标签不可见：${JSON.stringify(output.evidence)}`);
    assert(output.evidence.some((item) => item.coversKinds.includes('constraint') && item.label.includes('受制')), `受制证据用户标签不可见：${JSON.stringify(output.evidence)}`);
});

console.log(`\nTimeOutput tests: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
