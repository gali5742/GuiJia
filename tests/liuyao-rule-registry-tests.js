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
    'js/liuyao-rule-registry.js',
    'js/liuyao-observation-plan.js'
].forEach((relative) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
});

const intentApi = context.GuiJia.liuyaoIntent;
const registry = context.GuiJia.liuyaoRuleRegistry;
const planner = context.GuiJia.liuyaoObservationPlan;

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

const BASE_ROWS = [
    { position:1, relation:'父母', isShi:true, isYing:false, moving:false },
    { position:2, relation:'妻财', isShi:false, isYing:false, moving:false },
    { position:3, relation:'官鬼', isShi:false, isYing:false, moving:false },
    { position:4, relation:'兄弟', isShi:false, isYing:true, moving:false },
    { position:5, relation:'子孙', isShi:false, isYing:false, moving:false },
    { position:6, relation:'兄弟', isShi:false, isYing:false, moving:false }
];

const subjectByDuty = (plan, duty) => plan?.subjects?.find((subject) => subject.semanticDuty === duty) || null;
const assertRule = (question, expectedRule, checks = {}) => {
    const result = planner.analyzeQuestionToPlan(question, BASE_ROWS, [], { mode:'normal' });
    assert(result.intent?.status === 'resolved', `${question} Intent 未 resolved：${result.intent?.status}/${result.intent?.blockReason || ''}`);
    assert(result.selection?.baseRuleRefs?.[0] === expectedRule, `${question} 规则 ${result.selection?.baseRuleRefs?.[0] || 'none'} != ${expectedRule}`);
    if (checks.planStatus) assert(result.plan?.status === checks.planStatus, `${question} Plan ${result.plan?.status} != ${checks.planStatus}`);
    if (checks.duties) checks.duties.forEach(([duty, selectorType, selectorValue, required]) => {
        const subject = subjectByDuty(result.plan, duty);
        assert(subject, `${question} 缺 subject ${duty}`);
        assert(subject.selector?.type === selectorType, `${question}/${duty} selector.type ${subject.selector?.type} != ${selectorType}`);
        if (selectorValue !== undefined) assert(subject.selector?.value === selectorValue, `${question}/${duty} selector.value ${subject.selector?.value} != ${selectorValue}`);
        if (required !== undefined) assert(subject.required === required, `${question}/${duty} required ${subject.required} != ${required}`);
    });
    return result;
};

test('Registry 元数据保留传统、现代、augmentation 与证据层', () => {
    assert(registry.observationRules.some((rule) => rule.id === 'TR-001-I-S' && rule.family === 'traditional'), '缺 TR-001-I-S');
    assert(registry.observationRules.some((rule) => rule.id === 'MR-002-A' && rule.family === 'modern'), '缺 MR-002-A');
    assert(registry.augmentationRules.some((rule) => rule.id === 'MSR-001'), '缺 MSR-001');
    assert(registry.evidences.some((item) => item.id === 'EV-MR004' && item.tier === 'modern_supported'), '缺 MR-004 evidence');
});

test('01 今年财运：TR-001-I-S，子孙 optional', () => {
    const result = assertRule('今年财运怎么样？', 'TR-001-I-S', {
        planStatus:'resolved',
        duties:[
            ['period_wealth_state','six_relative','妻财',true],
            ['self_capacity','shi',undefined,true],
            ['wealth_source','six_relative','子孙',false]
        ]
    });
    assert(result.intent.semantics.fortuneScope === 'short_or_bounded', '年度财运未进入 bounded scope');
});

test('02 一生财运：TR-001-I-L，子孙 required', () => {
    assertRule('我这一生财运怎么样？', 'TR-001-I-L', {
        planStatus:'resolved',
        duties:[
            ['long_term_wealth','six_relative','妻财',true],
            ['self_capacity','shi',undefined,true],
            ['wealth_source','six_relative','子孙',true]
        ]
    });
});

test('03 开店求财：TR-001-A，不因“店”强加应爻', () => {
    const result = assertRule('开这个店能不能赚钱？', 'TR-001-A', {
        planStatus:'resolved',
        duties:[['business_capital','six_relative','妻财',true], ['operator_self','shi',undefined,true], ['business_source','six_relative','子孙',false]]
    });
    assert(!result.plan.subjects.some((subject) => subject.selector?.type === 'ying'), '无明确相对方却强加应爻');
});

test('04 合伙求财：TR-001-H，世应分别承担双方职责', () => {
    assertRule('我和朋友合伙开店能不能赚钱？', 'TR-001-H', {
        planStatus:'resolved',
        duties:[['partnership_profit','six_relative','妻财',true], ['self_partner','shi',undefined,true], ['counterpart_partner','ying',undefined,true]]
    });
});

test('05 银行房贷审批：扩展 TR-001-E，不新造 MR', () => {
    const result = assertRule('我向银行申请房贷能不能批下来？', 'TR-001-E', {
        planStatus:'resolved',
        duties:[['requested_funds','six_relative','妻财',true], ['borrower_self','shi',undefined,true], ['lender','ying',undefined,true]]
    });
    assert(result.intent.expectedState === 'approval', '贷款审批未保留 expectedState=approval');
    assert(result.intent.participants.some((item) => item.institutionType === 'institutional_lender'), '银行未保留为 institutional_lender');
});

test('06 借款人还债：Intent resolved，但无 confirmed rule', () => {
    const result = planner.analyzeQuestionToPlan('我今年能不能把房贷全部还清？', BASE_ROWS);
    assert(result.intent.status === 'resolved' && result.intent.event.type === 'debt_repayment', 'debt_repayment Intent 识别失败');
    assert(result.selection.status === 'unresolved', 'debt_repayment 不应有自动 Rule');
    assert(result.plan.status === 'unresolved', 'debt_repayment Plan 不应 resolved');
    assert(result.plan.unresolvedReasons.some((issue) => issue.type === 'no_confirmed_rule'), 'debt_repayment unresolved reason 不正确');
});

test('07 买股票问盈利：MR-002-A，妻财而非子孙', () => {
    const result = assertRule('现在买这只股票能赚钱吗？', 'MR-002-A', {
        planStatus:'resolved', duties:[['investment_profit','six_relative','妻财',true], ['investor_self','shi',undefined,true]]
    });
    assert(result.intent.semantics.investmentAction === 'enter', '买入动作未识别');
    assert(result.intent.semantics.investmentGoal === 'profit', '盈利 Goal 未识别');
});

test('08 投资适宜性：MR-002-C，子孙 Primary', () => {
    assertRule('这个项目适不适合投资？', 'MR-002-C', {
        planStatus:'resolved', duties:[['investment_suitability','six_relative','子孙',true], ['investor_self','shi',undefined,true]]
    });
});

test('09 持有还是卖：provisional 在正常模式不得执行', () => {
    const normal = planner.analyzeQuestionToPlan('这只股票继续持有还是现在卖？', BASE_ROWS, [], { mode:'normal' });
    assert(normal.intent.event.type === 'investment' && normal.intent.semantics.investmentGoal === 'position_decision', 'position_decision 语义识别失败');
    assert(normal.selection.status === 'unresolved', '正常模式不应执行 MR-002-D');
    assert(normal.selection.provisionalCandidates.includes('MR-002-D'), '未暴露 MR-002-D provisional candidate');
    assert(normal.plan.unresolvedReasons.some((issue) => issue.type === 'no_enabled_confirmed_rule'), 'provisional 正常模式 reason 错误');
    const research = planner.analyzeQuestionToPlan('这只股票继续持有还是现在卖？', BASE_ROWS, [], { mode:'research' });
    assert(research.selection.baseRuleRefs[0] === 'MR-002-D', '研究模式未允许选中 MR-002-D');
});

test('10 未持仓问短期股票走势：MR-002-E1', () => {
    assertRule('这只股票下周走势怎么样？', 'MR-002-E1', {
        planStatus:'resolved', duties:[['price_trend','six_relative','妻财',true], ['upward_potential','six_relative','子孙',false]]
    });
});

test('11 已持仓问走势：MR-002-E3，不改写用户 Goal', () => {
    const result = assertRule('我已经持有这只股票，下周走势怎么样？', 'MR-002-E3', {
        planStatus:'resolved', duties:[['holding_profit_exposure','six_relative','妻财',true], ['investor_self','shi',undefined,true]]
    });
    assert(result.intent.semantics.investmentPosition === 'holding', '持仓状态未识别');
    assert(result.intent.semantics.investmentGoal === 'price_trend', '持仓走势问题不应被偷偷改写成 profit');
});

test('12 工资上涨：MR-003-A', () => {
    const result = assertRule('我今年工资能不能涨？', 'MR-003-A', {
        planStatus:'resolved', duties:[['salary_income','six_relative','妻财',true], ['income_receiver','shi',undefined,true]]
    });
    assert(result.intent.expectedState === 'increase', '工资上涨 expectedState 未识别');
});

test('13 年终奖：provisional 在正常模式保持 unresolved', () => {
    const result = planner.analyzeQuestionToPlan('今年年终奖能不能发？', BASE_ROWS, [], { mode:'normal' });
    assert(result.intent.event.type === 'income' && result.intent.semantics.incomeType === 'bonus', 'bonus Intent 识别失败');
    assert(result.selection.status === 'unresolved' && result.selection.provisionalCandidates.includes('MR-003-B'), 'MR-003-B provisional 行为错误');
});

test('14 新买电脑快递：MR-004 必须胜出，Object 与 purchase 不直连六亲', () => {
    const result = assertRule('我新买的电脑明天快递能不能收到？', 'MR-004', {
        planStatus:'resolved', duties:[['shipment_delivery','six_relative','父母',true], ['receiver_self','shi',undefined,true]]
    });
    assert(result.intent.event.type === 'receive_item', '快递问题被错误识别成 item_purchase');
    assert(result.intent.semantics.deliveryMode === 'courier', '快递 deliveryMode 未识别');
    assert(registry.resolveObjectFunctionalRole(result.intent) === 'shipment_subject', 'MSR-002 功能角色未识别为 shipment_subject');
});

test('15 泛问买电脑好不好：Intent 可理解，但无万能 Rule', () => {
    const result = planner.analyzeQuestionToPlan('我买这台电脑好不好？', BASE_ROWS);
    assert(result.intent.status === 'resolved' && result.intent.event.type === 'item_purchase', 'item_purchase Intent 识别失败');
    assert(result.intent.semantics.purchaseGoal === 'unknown', '泛问买电脑不应擅自猜 usability/value');
    assert(result.plan.status === 'unresolved' && result.plan.unresolvedReasons.some((issue) => issue.type === 'no_confirmed_rule'), '泛 item_purchase 应 unresolved');
});

test('16 特定异性表白：MR-001-A + MSR-001', () => {
    const result = assertRule('我是男生，我喜欢的这个女生会接受我的表白吗？', 'MR-001-A', {
        planStatus:'resolved', duties:[['romantic_partner','six_relative','妻财',true], ['self','shi',undefined,true], ['specified_romantic_counterpart','ying',undefined,true]]
    });
    assert(result.selection.augmentationRuleRefs.includes('MSR-001'), '特指恋爱对象未应用 MSR-001');
    assert(result.intent.semantics.romanticStage === 'confession_pending', '表白阶段未识别');
});

test('17 特定异性好感状态：MR-001-A + MSR-001', () => {
    assertRule('我是男生，她是不是喜欢我？', 'MR-001-A', {
        planStatus:'resolved', duties:[['romantic_partner','six_relative','妻财',true], ['self','shi',undefined,true], ['specified_romantic_counterpart','ying',undefined,true]]
    });
});

test('18 自占婚配：TR-002-M-MALE', () => {
    assertRule('我是男方，我和她这个婚事能不能成？', 'TR-002-M-MALE', {
        planStatus:'resolved', duties:[['prospective_wife','six_relative','妻财',true], ['self','shi',undefined,true], ['partner_side','ying',undefined,false]]
    });
});

test('19 既有妻子关系：TR-002-R-WIFE', () => {
    assertRule('我和妻子最近还能不能和好？', 'TR-002-R-WIFE', {
        planStatus:'resolved', duties:[['spouse_wife','six_relative','妻财',true], ['self','shi',undefined,true], ['spouse_side_aux','ying',undefined,false]]
    });
});

test('20 代占儿子婚事：Rule 可选，但 Participant Resolver 未审计前明确 unresolved', () => {
    const result = planner.analyzeQuestionToPlan('我儿子的这门婚事能不能成？', BASE_ROWS);
    assert(result.intent.status === 'resolved' && result.intent.participants.some((item) => item.role === 'represented_subject' && item.relationToQuerent === 'child'), '代占参与者语义未识别');
    assert(result.selection.baseRuleRefs[0] === 'TR-002-M-REPRESENTED', '代占婚配未命中 represented rule');
    assert(result.plan.status === 'unresolved', 'Participant Resolver 未实现前不应伪造传统 selector');
    assert(result.plan.unresolvedReasons.some((issue) => issue.type === 'resolver_pending' && issue.resolverRef === 'PRR-REPRESENTED-MARRIAGE-SUBJECT'), '代占婚配 unresolved reason 不正确');
});

test('21 两个独立目标：Intent hard-stop multiple_goals', () => {
    const intent = intentApi.parseDivinationIntent('今年财运怎么样，而且我和她能不能结婚？');
    assert(intent.status === 'blocked' && intent.blockReason === 'multiple_goals', `multiple_goals 未阻断：${intent.status}/${intent.blockReason}`);
});

test('22 只有时间和谓词：Intent hard-stop partial', () => {
    const intent = intentApi.parseDivinationIntent('明天能不能？');
    assert(intent.status === 'blocked' && intent.blockReason === 'partial', `partial 未阻断：${intent.status}/${intent.blockReason}`);
});

test('产品边界：疾病占问由新 Intent 层阻断，不进入 RuleSelection', () => {
    const intent = intentApi.parseDivinationIntent('孩子这次生病什么时候能好？');
    assert(intent.status === 'blocked' && intent.blockReason === 'unsupported_domain', '健康类占问未按产品边界阻断');
    const plan = planner.buildObservationPlan(intent, BASE_ROWS);
    assert(plan.status === 'unresolved' && plan.unresolvedReasons.some((issue) => issue.type === 'intent_blocked'), 'blocked Intent 不应进入自动取用');
});

test('same_target A：妻财持世只生成 same_target，不降格成 same_element', () => {
    const rows = [
        { position:1, relation:'父母', isShi:false, isYing:false },
        { position:2, relation:'妻财', isShi:true, isYing:false },
        { position:3, relation:'官鬼', isShi:false, isYing:false },
        { position:4, relation:'兄弟', isShi:false, isYing:true },
        { position:5, relation:'子孙', isShi:false, isYing:false },
        { position:6, relation:'兄弟', isShi:false, isYing:false }
    ];
    const result = planner.analyzeQuestionToPlan('我是男生，我喜欢的这个女生会接受我的表白吗？', rows);
    assert(result.plan.status === 'resolved', '妻财持世 fixture Plan 未 resolved');
    const romantic = subjectByDuty(result.plan, 'romantic_partner');
    const self = subjectByDuty(result.plan, 'self');
    const relation = result.plan.crossObservationRelations.find((item) => [item.sourceSubjectId,item.targetSubjectId].includes(romantic.id) && [item.sourceSubjectId,item.targetSubjectId].includes(self.id));
    assert(relation?.type === 'same_target', '妻财持世未生成 same_target');
    assert(!result.plan.crossObservationRelations.some((item) => item.type === 'same_element'), 'same_target 后不应同时生成 same_element');
});

test('same_target B：妻财临应表示两个语义视角落同一物理爻', () => {
    const rows = [
        { position:1, relation:'父母', isShi:true, isYing:false },
        { position:2, relation:'兄弟', isShi:false, isYing:false },
        { position:3, relation:'官鬼', isShi:false, isYing:false },
        { position:4, relation:'妻财', isShi:false, isYing:true },
        { position:5, relation:'子孙', isShi:false, isYing:false },
        { position:6, relation:'兄弟', isShi:false, isYing:false }
    ];
    const result = planner.analyzeQuestionToPlan('我是男生，她是不是喜欢我？', rows);
    const romantic = subjectByDuty(result.plan, 'romantic_partner');
    const specified = subjectByDuty(result.plan, 'specified_romantic_counterpart');
    assert(result.plan.crossObservationRelations.some((item) => item.type === 'same_target' && [item.sourceSubjectId,item.targetSubjectId].includes(romantic.id) && [item.sourceSubjectId,item.targetSubjectId].includes(specified.id)), '妻财临应未生成语义同爻关系');
});

test('多候选 Fixture：Required Primary 不得擅自选第一个', () => {
    const rows = [
        { position:1, relation:'父母', isShi:true, isYing:false },
        { position:2, relation:'妻财', isShi:false, isYing:false },
        { position:3, relation:'官鬼', isShi:false, isYing:false },
        { position:4, relation:'兄弟', isShi:false, isYing:true },
        { position:5, relation:'子孙', isShi:false, isYing:false },
        { position:6, relation:'妻财', isShi:false, isYing:false }
    ];
    const result = planner.analyzeQuestionToPlan('我是男生，她是不是喜欢我？', rows);
    const romantic = subjectByDuty(result.plan, 'romantic_partner');
    assert(romantic.resolutionStatus === 'multiple_candidates' && romantic.resolvedTargets.length === 2, '妻财双候选未完整保留');
    assert(result.plan.status === 'unresolved', 'Required Primary 多候选时 Plan 不应 resolved');
    assert(result.plan.unresolvedReasons.some((issue) => issue.type === 'multiple_candidates' && issue.semanticDuty === 'romantic_partner'), '多候选 unresolved reason 不正确');
    assert(result.plan.legacyPrimaryTarget === null, '多候选时不应生成 legacyPrimaryTarget');
});

if (failed) {
    console.error(`\n${failed} failed, ${passed} passed`);
    process.exit(1);
}
console.log(`\n${passed} passed`);
