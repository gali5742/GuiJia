#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
vm.createContext(context);
[
    'js/question-time.js',
    'js/liuyao-intent.js',
    'js/liuyao-participant-resolver.js',
    'js/liuyao-rule-registry.js',
    'js/liuyao-observation-plan.js'
].forEach((relative) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
});

const planner = context.GuiJia.liuyaoObservationPlan;

const BASE_ROWS = [
    { position:1, relation:'父母', isShi:true, isYing:false, moving:false },
    { position:2, relation:'妻财', isShi:false, isYing:false, moving:false },
    { position:3, relation:'官鬼', isShi:false, isYing:false, moving:false },
    { position:4, relation:'兄弟', isShi:false, isYing:true, moving:false },
    { position:5, relation:'子孙', isShi:false, isYing:false, moving:false },
    { position:6, relation:'兄弟', isShi:false, isYing:false, moving:false }
];

let passed = 0;
let failed = 0;
function assert(condition, message) {
    if (!condition) throw new Error(message);
}
function test(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
    }
}

function analyze(question) {
    return planner.analyzeQuestionToPlan(question, BASE_ROWS, [], { mode:'normal' });
}
function counterpartOf(result) {
    return result.intent?.participants?.find((item) => item.role === 'romantic_counterpart');
}
function assertSpecificSexes(result, selfSex, counterpartSex) {
    const counterpart = counterpartOf(result);
    assert(result.intent?.status === 'resolved', 'Intent 应 resolved');
    assert(result.intent?.event?.type === 'relationship_development', '应识别 relationship_development');
    assert(result.intent?.semantics?.querentSex === selfSex, `querentSex ${result.intent?.semantics?.querentSex} != ${selfSex}`);
    assert(counterpart?.sex === counterpartSex, `counterpart sex ${counterpart?.sex} != ${counterpartSex}`);
    assert(counterpart?.specificity === 'specific', `specificity ${counterpart?.specificity} != specific`);
    assert(counterpart?.relationToQuerent === 'friend', `relation ${counterpart?.relationToQuerent} != friend`);
    assert(result.intent?.semantics?.romanticStage === 'unestablished_interest', '发展为恋爱关系应归 unestablished_interest');
}

test('R1 男问女性朋友：MR-001-A + MSR-001', () => {
    const result = analyze('我是一个男生，和一个女性朋友能不能发展为恋爱关系');
    assertSpecificSexes(result, 'male', 'female');
    assert(result.selection?.baseRuleRefs?.[0] === 'MR-001-A', `规则 ${result.selection?.baseRuleRefs?.[0] || 'none'} != MR-001-A`);
    assert(result.selection?.augmentationRuleRefs?.includes('MSR-001'), '应应用 MSR-001');
    assert(result.plan?.status === 'resolved', 'Plan 应 resolved');
});

test('R2 男问男性朋友：Intent resolved，但无 confirmed mapping', () => {
    const result = analyze('我是一个男生，和一个男性朋友能不能发展为恋爱关系');
    assertSpecificSexes(result, 'male', 'male');
    assert(result.selection?.status === 'unresolved', '同性已知角色当前不应自动选 Rule');
    assert(result.selection?.issues?.some((item) => item.type === 'no_confirmed_rule'), '应为 no_confirmed_rule');
    assert(result.plan?.status === 'unresolved', 'Plan 应 unresolved');
});

test('R3 女问男性朋友：MR-001-B + MSR-001，性别不得串位', () => {
    const result = analyze('我是一个女生，和一个男性朋友能不能发展为恋爱关系');
    assertSpecificSexes(result, 'female', 'male');
    assert(result.selection?.baseRuleRefs?.[0] === 'MR-001-B', `规则 ${result.selection?.baseRuleRefs?.[0] || 'none'} != MR-001-B`);
    assert(result.selection?.augmentationRuleRefs?.includes('MSR-001'), '应应用 MSR-001');
    assert(result.plan?.status === 'resolved', 'Plan 应 resolved');
});

test('R4 女问女性朋友：Intent resolved，但无 confirmed mapping', () => {
    const result = analyze('我是一个女生，和一个女性朋友能不能发展为恋爱关系');
    assertSpecificSexes(result, 'female', 'female');
    assert(result.selection?.status === 'unresolved', '同性已知角色当前不应自动选 Rule');
    assert(result.selection?.issues?.some((item) => item.type === 'no_confirmed_rule'), '应为 no_confirmed_rule');
    assert(result.plan?.status === 'unresolved', 'Plan 应 unresolved');
});

test('R5 特定朋友但性别未知：specific + romantic_sex_role_unknown', () => {
    const result = analyze('我和一个朋友能不能发展为恋爱关系');
    const counterpart = counterpartOf(result);
    assert(result.intent?.status === 'resolved', 'Intent 应 resolved');
    assert(counterpart?.specificity === 'specific', '一个现实朋友应识别 specific');
    assert(counterpart?.relationToQuerent === 'friend', '应保留 friend 关系');
    assert(counterpart?.sex === 'unknown', '未给对象性别时不得猜测');
    assert(result.intent?.ambiguities?.some((item) => item.code === 'romantic_sex_role_unknown'), '应提示 romantic_sex_role_unknown');
    assert(result.selection?.status === 'unresolved', '缺传统角色映射时 Rule 应 unresolved');
});

test('R6 泛恋爱机会：generic，且不产生 sex-role ambiguity', () => {
    const result = analyze('今年能不能谈上恋爱');
    const counterpart = counterpartOf(result);
    assert(result.intent?.status === 'resolved', 'Intent 应 resolved');
    assert(result.intent?.event?.type === 'relationship_development', '应识别 relationship_development');
    assert(counterpart?.specificity === 'generic', `specificity ${counterpart?.specificity} != generic`);
    assert(!result.intent?.ambiguities?.some((item) => item.code === 'romantic_sex_role_unknown'), '泛恋爱机会不应要求特定对象男女角色');
    assert(result.selection?.status === 'unresolved', '当前无 generic romance rule');
    assert(result.selection?.issues?.some((item) => item.type === 'no_confirmed_rule'), '应为 no_confirmed_rule');
});

test('R7 既有表白样例继续兼容', () => {
    const result = analyze('我是男生，我喜欢的这个女生会接受我的表白吗？');
    const counterpart = counterpartOf(result);
    assert(result.intent?.semantics?.querentSex === 'male', '占问者应 male');
    assert(counterpart?.sex === 'female' && counterpart?.specificity === 'specific', '特定女生解析失败');
    assert(result.selection?.baseRuleRefs?.[0] === 'MR-001-A', '原 MR-001-A 样例不得回归');
    assert(result.plan?.status === 'resolved', '原样例 Plan 应 resolved');
});

console.log(`\nParticipant resolver regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
