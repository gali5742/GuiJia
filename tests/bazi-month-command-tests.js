#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { Solar } = require('lunar-javascript');

const ROOT = path.resolve(__dirname, '..');
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

function loadMonthCommand({ fakeEvidence = false } = {}) {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    context.GuiJia = {};
    if (fakeEvidence) {
        context.GuiJia.baziStrengthEvidence = {
            marker:'original',
            buildStrengthEvidence(result, semanticModel) {
                return { state:'collected', factCount:(semanticModel.facts || []).length, derivedCount:(semanticModel.derivedFacts || []).length };
            }
        };
    }
    vm.createContext(context);
    const filename = path.join(ROOT, 'js/bazi-month-command.js');
    vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    return context.GuiJia;
}

function simpleResult({
    solarStr = '2026-05-15 12:00:00',
    chart = ['乙亥','辛巳','戊申','甲寅']
} = {}) {
    return {
        solarStr,
        pillars: chart.map((ganZhi, index) => ({
            title:['年柱','月柱','日柱','时柱'][index],
            gan:ganZhi.slice(0, 1),
            zhi:ganZhi.slice(1, 2),
            ganZhi
        })),
        monthSeason:{ monthZhi:chart[1].slice(1, 2) }
    };
}

const GuiJia = loadMonthCommand();
const api = GuiJia.baziMonthCommand;

test('Month Command v0.1 固定为 source-scoped，不产生 canonicalCommandGan', () => {
    assert(api.installed === true, 'Month Command 模块未安装');
    assert(api.MONTH_COMMAND_SCHEMA_VERSION === '0.1', 'schema 版本异常');
    assert(api.MONTH_COMMAND_SOURCE_SCOPE === 'source-scoped-no-canonical-merge', 'source scope 异常');
    const observation = api.buildMonthCommandObservation(simpleResult());
    assert(observation.canonicalCommandGan === null, '当前不得生成 canonicalCommandGan');
    assert(observation.canonicalStatus === 'unresolved', 'canonical command 必须保持 unresolved');
});

test('《三命通会》巳月分日原样保存为戊七、庚五、丙十八，不把藏干表当司事表', () => {
    const schedule = api.sanMingTongHuiSchedule['巳'];
    assert(schedule.length === 3, '巳月应保存三段 source schedule');
    assert(schedule.map((item) => `${item.gan}${item.days}`).join(',') === '戊7,庚5,丙18', `巳月分日异常：${JSON.stringify(schedule)}`);
    assert(schedule.reduce((sum, item) => sum + item.days, 0) === 30, '巳月 source schedule 应合计三十日');
    const boundary = api.boundaries.join('');
    assert(boundary.includes('藏干构成与人元司事分日必须分层'), '缺少藏干／司事分层边界');
    assert(boundary.includes('不得从本气、中气、余气标签直接推出当前司令'), '不得由藏干层级推出司令');
});

test('《三命通会》分日保留原文 token，不擅自把艮土／坤土改成天干', () => {
    const yin = api.sanMingTongHuiSchedule['寅'][0];
    const shen = api.sanMingTongHuiSchedule['申'][0];
    assert(yin.sourceToken === '艮土' && yin.gan === null, '艮土不得被擅自改写成某天干');
    assert(shen.sourceToken === '坤土' && shen.gan === null, '坤土不得被擅自改写成某天干');
});

test('任氏“立夏后十天，戊土司令”只保存为个案 assertion，不造前十天通用窗口', () => {
    const source = api.sourceProfiles.DI_TIAN_SUI_CHAN_WEI_WAR_CASE;
    assert(source.chart === '乙亥 辛巳 戊申 甲寅', '任氏命例四柱异常');
    assert(source.anchorJie === '立夏', '命例节令锚点异常');
    assert(source.offsetText === '立夏后十天', '命例时间原文口径异常');
    assert(source.assertedCommandGan === '戊', '命例 source assertion 应为戊土司令');
    assert(source.genericWindow === null, '不得发明 0—10 天通用窗口');
    assert(source.generalizationStatus === 'case-only', '命例必须保持 case-only');
    assert(!JSON.stringify(source).includes('[0,10]'), '不得隐藏编码前十天窗口');
});

test('真实日期可观察距本月节令经过时间，但仍不据此选择司令人元', () => {
    const result = simpleResult({ solarStr:'2026-05-15 12:00:00' });
    const observation = api.buildMonthCommandObservation(result);
    const time = observation.timeContext;
    assert(time.status === 'observed', `时间上下文应可观察：${time.status}`);
    assert(time.monthZhi === '巳', `月份支异常：${time.monthZhi}`);
    assert(time.expectedJie === '立夏', '巳月应以立夏为节令锚点');
    assert(time.monthJieName === '立夏', `上一节应为立夏：${time.monthJieName}`);
    assert(time.jieAlignment === 'matched', '月支与节令锚点应匹配');
    assert(time.elapsedDays > 0 && time.elapsedDays < 20, `距立夏时间应为合理正值：${time.elapsedDays}`);
    assert(observation.canonicalCommandGan === null, '有精确 elapsedDays 也不得自动选司令人元');
    const smth = observation.sourceProfiles.find((item) => item.sourceId === 'SMTH-REN-YUAN-SI-SHI');
    assert(smth?.resolutionStatus === 'unresolved-calendar-mapping', '三命通会分日不得在 calendar mapping 未定义时自动落段');
});

test('普通巳月第五日附近也不能把任氏命例误泛化成戊土通用司令', () => {
    const observation = api.buildMonthCommandObservation(simpleResult({
        solarStr:'2026-05-10 12:00:00',
        chart:['丁丑','乙巳','丁亥','己酉']
    }));
    assert(observation.timeContext?.monthJieName === '立夏', '测试日期应位于立夏后的巳月');
    assert(observation.canonicalCommandGan === null, '普通巳月不得因“立夏后十天”命例断言为戊土');
    const dts = observation.sourceProfiles.find((item) => item.sourceId === 'DTS-CW-WAR-CASE-001');
    assert(dts?.resolutionStatus === 'not-applicable-to-current-chart', '任氏个案不得泛化到其他四柱');
});

test('任氏原命例即使四柱匹配，也只标记 source assertion observed，不升级 canonical command', () => {
    const observation = api.buildMonthCommandObservation(simpleResult());
    const dts = observation.sourceProfiles.find((item) => item.sourceId === 'DTS-CW-WAR-CASE-001');
    assert(dts?.chartMatches === true, '应识别任氏命例四柱');
    assert(dts?.anchorMatches === true, '巳月应与立夏 anchor 匹配');
    assert(dts?.resolutionStatus === 'case-assertion-observed', `个案 assertion 状态异常：${dts?.resolutionStatus}`);
    assert(observation.canonicalCommandGan === null, 'source assertion 不等于 canonical command');
});

test('Strength Evidence hook 只追加 F05/F06/D08 与 monthCommand observation，不改变原 Evidence builder', () => {
    const hooked = loadMonthCommand({ fakeEvidence:true });
    const semanticModel = {
        facts:[
            {id:'F01'}, {id:'F02'}, {id:'F03'}, {id:'F04'}
        ],
        derivedFacts:[
            {id:'D01'}, {id:'D02'}, {id:'D03'}, {id:'D04'}, {id:'D05'}, {id:'D06'}, {id:'D07'}
        ],
        structures:[]
    };
    const result = hooked.baziStrengthEvidence.buildStrengthEvidence(simpleResult(), semanticModel);
    assert(hooked.baziStrengthEvidence.__monthCommandHookInstalled === true, 'Month Command hook 未安装');
    assert(result.state === 'collected', '应继续调用原 Strength Evidence builder');
    assert(['F05','F06'].every((id) => semanticModel.facts.some((item) => item.id === id)), '缺少新增原始时间 Fact');
    assert(semanticModel.derivedFacts.some((item) => item.id === 'D08'), '缺少距节时间 Derived Fact');
    assert(semanticModel.monthCommand?.canonicalCommandGan === null, 'hook 不得生成统一司令');
    hooked.baziStrengthEvidence.buildStrengthEvidence(simpleResult(), semanticModel);
    assert(semanticModel.facts.filter((item) => item.id === 'F05').length === 1, '重复调用不得重复 F05');
    assert(semanticModel.derivedFacts.filter((item) => item.id === 'D08').length === 1, '重复调用不得重复 D08');
});

test('缺少排盘采用时间时保持兼容，不强造 F05/F06/D08', () => {
    const hooked = loadMonthCommand({ fakeEvidence:true });
    const semanticModel = { facts:[{id:'F01'}], derivedFacts:[], structures:[] };
    hooked.baziStrengthEvidence.buildStrengthEvidence(simpleResult({ solarStr:'' }), semanticModel);
    assert(!semanticModel.facts.some((item) => ['F05','F06'].includes(item.id)), '缺时间时不应制造时间 Fact');
    assert(!semanticModel.derivedFacts.some((item) => item.id === 'D08'), '缺时间时不应制造 D08');
    assert(semanticModel.monthCommand?.canonicalCommandGan === null, '缺时间也不得生成统一司令');
});

test('Month Command 合同不引入分数、权重或身强弱／根效力结论', () => {
    const serialized = JSON.stringify(api.buildMonthCommandObservation(simpleResult()));
    ['score','weight','points','root-preserved','root-weakened','root-ineffective'].forEach((term) => {
        assert(!serialized.includes(term), `Month Command 不应包含 ${term}`);
    });
    assert(!serialized.includes('"strong"') && !serialized.includes('"weak"') && !serialized.includes('"balanced"'), 'Month Command 不得输出最终强弱结论');
});

test('生产 Assessment 加载链包含独立 Month Command 模块', () => {
    const assessmentSource = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');
    assert(assessmentSource.includes('./js/bazi-month-command.js?v=13.44.0'), '生产加载链未接入 Month Command 独立模块');
});

console.log(`\nBaZi month command contract: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
