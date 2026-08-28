#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const context = { console, Date, Math, JSON, Intl, Promise, Set, TypeError };
context.window = context;
context.globalThis = context;
vm.createContext(context);
[
    'js/question-time.js',
    'js/liuyao-intent.js',
    'js/liuyao-participant-resolver.js',
    'js/liuyao-semantic-parser.js',
    'js/liuyao-rule-registry.js',
    'js/liuyao-observation-plan.js'
].forEach((relative) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
});

const parser = context.GuiJia.liuyaoSemanticParser;
const planner = context.GuiJia.liuyaoObservationPlan;
const registry = context.GuiJia.liuyaoRuleRegistry;

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

const analyze = (question, extra = {}) => planner.analyzeQuestionToPlan(question, BASE_ROWS, [], { mode:'normal', ...extra });
const counterpartOf = (result) => result.intent?.participants?.find((item) => item.role === 'romantic_counterpart');

test('S1 DivinationIntent v0.1 契约被冻结并可校验', () => {
    assert(parser.intentSchemaVersion === '0.1', 'Intent schema version 应为 0.1');
    const result = parser.parseQuestionSync('今年财运怎么样？');
    assert(result.validation.valid, `baseline intent 不应违反 schema：${JSON.stringify(result.validation.errors)}`);
});

test('S2 年龄定语不得破坏 self/counterpart 核心属性', () => {
    const result = analyze('我是一个二十五岁男生，和一个女性朋友能不能发展为恋爱关系');
    assert(result.intent?.semantics?.querentSex === 'male', '二十五岁男生应解析 male');
    assert(counterpartOf(result)?.sex === 'female', '女性朋友应解析 female');
    assert(result.selection?.baseRuleRefs?.[0] === 'MR-001-A', '应命中 MR-001-A');
    assert(result.plan?.status === 'resolved', 'Plan 应 resolved');
    assert(result.diagnosis?.code === 'OK', `诊断应 OK，实际 ${result.diagnosis?.code}`);
});

test('S3 学历定语不得破坏 self 属性', () => {
    const result = analyze('我是一个刚大学毕业的女生，和一个男性朋友能不能发展为恋爱关系');
    assert(result.intent?.semantics?.querentSex === 'female', '刚大学毕业的女生应解析 female');
    assert(counterpartOf(result)?.sex === 'male', '男性朋友应解析 male');
    assert(result.selection?.baseRuleRefs?.[0] === 'MR-001-B', '应命中 MR-001-B');
});

test('S4 双方定语都不得破坏 participant 抽取', () => {
    const result = analyze('我是一个母胎单身的女生，和新认识的一个男性朋友能不能发展为恋爱关系');
    const counterpart = counterpartOf(result);
    assert(result.intent?.semantics?.querentSex === 'female', '母胎单身的女生应解析 female');
    assert(counterpart?.sex === 'male', '新认识的男性朋友应解析 male');
    assert(counterpart?.specificity === 'specific', '现实中的新朋友应 specific');
    assert(counterpart?.relationToQuerent === 'friend', '应保留 friend');
    assert(result.selection?.baseRuleRefs?.[0] === 'MR-001-B', '应命中 MR-001-B');
});

test('S5 仅对象性别缺失时给出明确 semantic ambiguity', () => {
    const result = analyze('我是一个二十五岁男生，和一个朋友能不能发展为恋爱关系');
    assert(result.intent?.semantics?.querentSex === 'male', '占问者 male 应被保留');
    assert(counterpartOf(result)?.sex === 'unknown', '对象性别不得猜测');
    assert(result.intent?.ambiguities?.some((item) => item.code === 'romantic_counterpart_sex_unknown'), '应提示 romantic_counterpart_sex_unknown');
    assert(result.diagnosis?.code === 'SEMANTIC_AMBIGUITY', `应为 semantic ambiguity，实际 ${result.diagnosis?.code}`);
});

test('S6 叙述性关系输入归 B：NLP required，不继续堆 baseline regex', () => {
    const result = analyze('我是一个母胎单身的女生，最近我认识了一个男生，我对他有点好感，想算一下我们之间有没有可能');
    assert(result.diagnosis?.category === 'B', `应归 B，实际 ${result.diagnosis?.category}/${result.diagnosis?.code}`);
    assert(result.diagnosis?.code === 'B_NLP_REQUIRED', '应明确 B_NLP_REQUIRED');
});

test('S7 generic romance 无规则属于 D，不误报 B', () => {
    const result = analyze('今年能不能谈上恋爱');
    assert(result.diagnosis?.category === 'D', `generic romance 应归 D，实际 ${result.diagnosis?.category}`);
    assert(result.diagnosis?.subtype === 'no_confirmed_rule', '应为 no_confirmed_rule');
});

test('S8 同性已知角色无映射属于 D', () => {
    const result = analyze('我是一个男生，和一个男性朋友能不能发展为恋爱关系');
    assert(result.diagnosis?.category === 'D', `同性映射缺口应归 D，实际 ${result.diagnosis?.category}`);
});

test('S9 provisional 在 normal 下属于 D/rule unavailable', () => {
    const result = analyze('今年年终奖能不能发？');
    assert(result.diagnosis?.category === 'D', 'provisional normal 应归 D');
    assert(result.diagnosis?.subtype === 'provisional_rule_skipped', '应标 provisional_rule_skipped');
});

test('S10 NLP Adapter 接受纯现代语义，并由 Registry 决定官鬼/世应', () => {
    const payload = {
        version:'0.1',
        status:'resolved',
        goals:[{ type:'outcome' }],
        event:{ type:'relationship_development' },
        participants:[
            { role:'querent', sex:'female', specificity:'specific' },
            { role:'romantic_counterpart', sex:'male', relationToQuerent:'friend', specificity:'specific' }
        ],
        expectedState:'relationship_possible',
        confidence:0.96,
        ambiguities:[],
        semantics:{ querentSex:'female', counterpartSex:'male', romanticStage:'unestablished_interest' }
    };
    const parsed = parser.parseQuestionSync('叙述性占问占位文本', { intentOverride:payload });
    assert(parsed.source === 'nlp_override', '应走 NLP override adapter');
    assert(parsed.validation.valid, `NLP intent 应通过校验：${JSON.stringify(parsed.validation.errors)}`);
    const selection = registry.selectObservationRule(parsed.intent, { mode:'normal' });
    assert(selection.baseRuleRefs?.[0] === 'MR-001-B', 'NLP 不直接输出六亲，Registry 应命中 MR-001-B');
    assert(selection.augmentationRuleRefs?.includes('MSR-001'), '特指对象应继续由 MSR-001 增补应爻');
});

test('S11 NLP Adapter 拒绝传统术数字段泄漏', () => {
    const payload = {
        status:'resolved', goals:[{ type:'outcome' }], event:{ type:'relationship_development' }, participants:[], ambiguities:[], semantics:{},
        selector:{ type:'six_relative', value:'官鬼' }
    };
    const parsed = parser.parseQuestionSync('测试', { intentOverride:payload });
    assert(!parsed.validation.valid, '含 selector 的 NLP 输出必须无效');
    assert(parsed.validation.errors.some((item) => item.code === 'traditional_mapping_leak'), '应检测 traditional_mapping_leak');
});

console.log(`\nSemantic parser regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
