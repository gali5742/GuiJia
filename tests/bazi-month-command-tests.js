#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const { Solar } = require(path.join(ROOT, 'vendor', 'lunar.js'));
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
                return {
                    state:'collected',
                    factCount:(semanticModel.facts || []).length,
                    derivedCount:(semanticModel.derivedFacts || []).length
                };
            }
        };
    }
    vm.createContext(context);
    const filename = path.join(ROOT, 'js/bazi-month-command.js');
    vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    return context.GuiJia;
}

function simpleResult({
    solarStr = '2026-05-14 12:00:00',
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

test('Month Command v0.2 仍为 source-scoped，calendar position 可解析但 canonical command 关闭', () => {
    assert(api.installed === true, 'Month Command 模块未安装');
    assert(api.MONTH_COMMAND_SCHEMA_VERSION === '0.2', `schema 版本异常：${api.MONTH_COMMAND_SCHEMA_VERSION}`);
    assert(api.MONTH_COMMAND_SOURCE_SCOPE === 'source-scoped-no-canonical-merge', 'source scope 异常');
    assert(api.calendarPositionContract.ordinalBasis === 'jie-civil-date-inclusive', '序日 basis 未冻结');
    assert(api.calendarPositionContract.traditionalEquivalence === 'not-asserted-globally', '不得把序日规范化伪装成全传统等价');
    const observation = api.buildMonthCommandObservation(simpleResult());
    assert(observation.canonicalCommandGan === null, '当前不得生成 canonicalCommandGan');
    assert(observation.canonicalStatus === 'unresolved', 'canonical command 必须保持 unresolved');
});

test('《三命通会》首列巳月戊七、庚五、丙十八只标为 opening recorded schedule', () => {
    const schedule = api.sanMingTongHuiOpeningSchedule['巳'];
    assert(schedule.map((item) => `${item.gan}${item.days}`).join(',') === '戊7,庚5,丙18', `巳月首表异常：${JSON.stringify(schedule)}`);
    assert(schedule.reduce((sum, item) => sum + item.days, 0) === 30, '巳月首表应合计三十日');
    const profile = api.sourceProfiles.SAN_MING_TONG_HUI_OPENING_SCHEDULE;
    assert(profile.attribution === 'section-opening-recorded-schedule', '首表不得冒充全书唯一算法');
    assert(profile.resolverPolicy === 'disabled-no-default-tradition-choice', '首表不应成为默认 resolver');
    assert(api.sanMingTongHuiSchedule === api.sanMingTongHuiOpeningSchedule, '兼容别名应指向同一首表，不复制第二套真相');
});

test('《三命通会》首表保留艮土／坤土原 token，不擅自改写天干', () => {
    const yin = api.sanMingTongHuiOpeningSchedule['寅'][0];
    const shen = api.sanMingTongHuiOpeningSchedule['申'][0];
    assert(yin.sourceToken === '艮土' && yin.gan === null, '艮土不得被擅自改写成某天干');
    assert(shen.sourceToken === '坤土' && shen.gan === null, '坤土不得被擅自改写成某天干');
});

test('《三命通会》所录《玉井》作为另一套 schedule 保存，不与首表强行调和', () => {
    const opening = api.sanMingTongHuiOpeningSchedule['寅'];
    const yujing = api.sanMingTongHuiYuJingSchedule['寅'];
    assert(opening.map((item) => `${item.sourceToken}${item.days}`).join(',') === '艮土5,丙火5,甲木20', '首表寅月异常');
    assert(yujing.map((item) => `${item.sourceToken}${item.days}`).join(',') === '己土7,丙火5,甲木18', '玉井寅月异常');
    assert(JSON.stringify(opening) !== JSON.stringify(yujing), '两套传统不得被抹平成同一表');
    const profile = api.sourceProfiles.SAN_MING_TONG_HUI_YU_JING;
    assert(profile.resolverPolicy === 'disabled-textual-and-methodological-conflict', '玉井表不得自动设为默认 resolver');
});

test('《玉井》酉月丁火数字转录差异保持 unresolved，不伪造 3 或 5 的唯一答案', () => {
    const ding = api.sanMingTongHuiYuJingSchedule['酉'].find((item) => item.gan === '丁');
    assert(ding?.days === null, '文本异文未决时 days 应保持 null');
    assert(ding?.textualVariantStatus === 'unresolved', '异文状态应为 unresolved');
    const variants = (ding?.textualVariants || []).map((item) => item.days).sort().join(',');
    assert(variants === '3,5', `应同时保留 3/5 两个数字见证：${variants}`);
});

test('《三命通会》所引醉醒子的方法批评被保存，并阻断默认 fixed-day resolver', () => {
    const critique = api.sourceProfiles.SAN_MING_TONG_HUI_ZUI_XING_ZI;
    assert(critique.type === 'methodological-critique', '醉醒子应作为方法批评而非另一张固定表');
    assert(critique.rigidDayLimitStatus === 'rejected', '应保存对固定日限的反对');
    assert(critique.preferredFraming === 'main-qi-with-initial-middle-late-depth', '应保存初中末浅深框架');
    assert(critique.resolverPolicy === 'blocks-default-fixed-day-resolver', '方法批评应阻止将首表设为唯一默认算法');
});

test('Calendar Position 同时保存精确 duration 与民用日期序日，两者不得混成一个数字', () => {
    const observation = api.buildMonthCommandObservation(simpleResult({ solarStr:'2026-05-15 12:00:00' }));
    const time = observation.timeContext;
    assert(time.status === 'observed', `时间上下文应可观察：${time.status}`);
    assert(time.monthJieName === '立夏' && time.jieAlignment === 'matched', '巳月应锚定立夏');
    assert(Number.isFinite(time.elapsedDays) && time.elapsedDays > 0, '应保留精确 elapsedDays');
    assert(Number.isInteger(time.civilOrdinalDayAfterJie) && time.civilOrdinalDayAfterJie >= 1, '应生成 civil ordinal day');
    const birthDate = time.birthWallTime.slice(0, 10).split('-').map(Number);
    const jieDate = time.monthJieWallTime.slice(0, 10).split('-').map(Number);
    const dateDiff = Math.round((Date.UTC(birthDate[0], birthDate[1]-1, birthDate[2]) - Date.UTC(jieDate[0], jieDate[1]-1, jieDate[2])) / 86400000);
    assert(time.civilOrdinalDayAfterJie === dateDiff + 1, '交节民用日期必须按第1日计序');
    assert(time.civilOrdinalBasis === 'jie-civil-date-inclusive', '序日 basis 未写入 time context');
});

test('交节当日即使完整24小时尚未经过，也规范化为序日第1日', () => {
    const solar = Solar.fromYmdHms(2026, 2, 5, 12, 0, 0);
    const lunar = solar.getLunar();
    const first = api.buildMonthCommandTimeContext(new Date(2026, 1, 5, 12, 0, 0), lunar, '寅');
    assert(first.status === 'observed' && first.monthJieName === '立春', '测试日期应位于立春后寅月');
    const jieDateText = first.monthJieWallTime.slice(0, 10);
    const [y,m,d] = jieDateText.split('-').map(Number);
    const sameCivilDaySolar = Solar.fromYmdHms(y, m, d, 23, 59, 0);
    const same = api.buildMonthCommandTimeContext(new Date(y, m-1, d, 23, 59, 0), sameCivilDaySolar.getLunar(), '寅');
    assert(same.status === 'observed', '交节当日晚间应已过交节');
    assert(same.civilOrdinalDayAfterJie === 1, `交节当日应为第1日：${same.civilOrdinalDayAfterJie}`);
    assert(same.elapsedDays < 1, `同一民用日期通常不应要求已满24小时：${same.elapsedDays}`);
});

test('《滴天髓阐微·月令》寅月明确序日窗口可 source-specific 解析戊／丙／甲', () => {
    const cases = [
        { day:1, gan:'戊' },
        { day:7, gan:'戊' },
        { day:8, gan:'丙' },
        { day:14, gan:'丙' },
        { day:15, gan:'甲' },
        { day:24, gan:'甲' }
    ];
    cases.forEach(({day, gan}) => {
        const resolved = api.resolveDtsYinMonthCommand({ monthJieName:'立春', civilOrdinalDayAfterJie:day }, '寅');
        assert(resolved.resolutionStatus === 'resolved-explicit-source-window', `第${day}日应命中明确 source window`);
        assert(resolved.sourceCommandGan === gan, `第${day}日应为${gan}，实际${resolved.sourceCommandGan}`);
        assert(resolved.sourceDayIndex === day, '应保留 source day index provenance');
    });
});

test('《滴天髓》寅月窗口只在寅月／立春 source scope 内生效', () => {
    const wrongMonth = api.resolveDtsYinMonthCommand({ monthJieName:'立春', civilOrdinalDayAfterJie:6 }, '巳');
    const wrongAnchor = api.resolveDtsYinMonthCommand({ monthJieName:'惊蛰', civilOrdinalDayAfterJie:6 }, '寅');
    assert(wrongMonth.resolutionStatus === 'not-applicable-to-current-month', '不得把寅月窗口套入巳月');
    assert(wrongAnchor.resolutionStatus === 'not-applicable-to-current-month', '不得脱离立春锚点套用');
    assert(wrongMonth.sourceCommandGan === null && wrongAnchor.sourceCommandGan === null, '越界时不得给出 source command');
});

test('普通巳月即使已有序日位置，也不从首表／玉井／任氏个案生成统一戊土司令', () => {
    const observation = api.buildMonthCommandObservation(simpleResult({
        solarStr:'2026-05-10 12:00:00',
        chart:['丁丑','乙巳','丁亥','己酉']
    }));
    assert(Number.isInteger(observation.timeContext?.civilOrdinalDayAfterJie), '应有 calendar ordinal position');
    assert(observation.canonicalCommandGan === null, 'calendar position 不得自动选择三命通会某一传统');
    const opening = observation.sourceProfiles.find((item) => item.sourceId === 'SMTH-REN-YUAN-OPENING-SCHEDULE');
    const yujing = observation.sourceProfiles.find((item) => item.sourceId === 'SMTH-YUJING-RECORDED-SCHEDULE');
    const dts = observation.sourceProfiles.find((item) => item.sourceId === 'DTS-CW-WAR-CASE-001');
    assert(opening?.resolutionStatus === 'recorded-schedule-not-default-resolver', '首表只能记录，不得自动落段');
    assert(yujing?.resolutionStatus === 'recorded-alternative-not-default-resolver', '玉井异表只能记录，不得自动落段');
    assert(dts?.resolutionStatus === 'not-applicable-to-current-chart', '任氏个案不得泛化到其他四柱');
});

test('任氏“立夏后十天，戊土司令”只有第10日 exact case 才标记 observed', () => {
    const source = api.sourceProfiles.DI_TIAN_SUI_CHAN_WEI_WAR_CASE;
    assert(source.chart === '乙亥 辛巳 戊申 甲寅', '任氏命例四柱异常');
    assert(source.offsetText === '立夏后十天' && source.assertedCommandGan === '戊', '个案原文条件异常');
    assert(source.expectedCivilOrdinalDayAfterJie === 10, '个案规范化序日应冻结为第10日');
    assert(source.genericWindow === null && source.generalizationStatus === 'case-only', '不得发明 0—10 日通用窗口');

    const exact = api.buildMonthCommandObservation(simpleResult({ solarStr:'2026-05-14 12:00:00' }));
    const exactSource = exact.sourceProfiles.find((item) => item.sourceId === 'DTS-CW-WAR-CASE-001');
    assert(exact.timeContext.civilOrdinalDayAfterJie === 10, `测试日期应规范化为第10日：${exact.timeContext.civilOrdinalDayAfterJie}`);
    assert(exactSource?.chartMatches === true && exactSource?.anchorMatches === true && exactSource?.offsetMatches === true, 'exact case 三项条件都应匹配');
    assert(exactSource?.resolutionStatus === 'case-assertion-observed', `exact case 状态异常：${exactSource?.resolutionStatus}`);
    assert(exact.canonicalCommandGan === null, '个案断言不得升级 canonical command');

    const late = api.buildMonthCommandObservation(simpleResult({ solarStr:'2026-05-15 12:00:00' }));
    const lateSource = late.sourceProfiles.find((item) => item.sourceId === 'DTS-CW-WAR-CASE-001');
    assert(late.timeContext.civilOrdinalDayAfterJie === 11, `晚一天应为第11日：${late.timeContext.civilOrdinalDayAfterJie}`);
    assert(lateSource?.offsetMatches === false, '第11日不得匹配“立夏后十天”个案条件');
    assert(lateSource?.resolutionStatus === 'case-offset-not-matched', `错日状态异常：${lateSource?.resolutionStatus}`);
});

test('Strength Evidence hook 仍只追加 F05/F06/D08；source-specific command 不伪装成新 Fact', () => {
    const hooked = loadMonthCommand({ fakeEvidence:true });
    const semanticModel = {
        facts:[{id:'F01'},{id:'F02'},{id:'F03'},{id:'F04'}],
        derivedFacts:[{id:'D01'},{id:'D02'},{id:'D03'},{id:'D04'},{id:'D05'},{id:'D06'},{id:'D07'}],
        structures:[]
    };
    const result = hooked.baziStrengthEvidence.buildStrengthEvidence(simpleResult({
        solarStr:'2026-02-18 12:00:00',
        chart:['丙午','庚寅','甲子','乙丑']
    }), semanticModel);
    assert(result.state === 'collected', '应继续调用原 Strength Evidence builder');
    assert(['F05','F06'].every((id) => semanticModel.facts.some((item) => item.id === id)), '缺少新增时间 Fact');
    const d08 = semanticModel.derivedFacts.find((item) => item.id === 'D08');
    assert(d08 && d08.text.includes('中性序日位置'), 'D08 应显示中性序日位置');
    assert(!semanticModel.facts.some((item) => /司令|用事/.test(item.text || '')), 'source doctrinal command 不应伪装成命盘原始 Fact');
    assert(!semanticModel.derivedFacts.some((item) => item.id !== 'D08' && /司令|用事/.test(item.text || '')), '不得新增 source command Derived Fact');
    hooked.baziStrengthEvidence.buildStrengthEvidence(simpleResult(), semanticModel);
    assert(semanticModel.facts.filter((item) => item.id === 'F05').length === 1, '重复调用不得重复 F05');
    assert(semanticModel.derivedFacts.filter((item) => item.id === 'D08').length === 1, '重复调用不得重复 D08');
});

test('缺少排盘采用时间时保持兼容，不强造 calendar position 或 F05/F06/D08', () => {
    const hooked = loadMonthCommand({ fakeEvidence:true });
    const semanticModel = { facts:[{id:'F01'}], derivedFacts:[], structures:[] };
    hooked.baziStrengthEvidence.buildStrengthEvidence(simpleResult({ solarStr:'' }), semanticModel);
    assert(!semanticModel.facts.some((item) => ['F05','F06'].includes(item.id)), '缺时间时不应制造时间 Fact');
    assert(!semanticModel.derivedFacts.some((item) => item.id === 'D08'), '缺时间时不应制造 D08');
    assert(semanticModel.monthCommand?.canonicalCommandGan === null, '缺时间也不得生成统一司令');
});

test('Month Command v0.2 不引入分数、权重、根效力或最终身强弱结论', () => {
    const serialized = JSON.stringify(api.buildMonthCommandObservation(simpleResult()));
    ['score','weight','points','root-preserved','root-weakened','root-ineffective'].forEach((term) => {
        assert(!serialized.includes(term), `Month Command 不应包含 ${term}`);
    });
    assert(!serialized.includes('"strong"') && !serialized.includes('"weak"') && !serialized.includes('"balanced"'), '不得输出最终强弱结论');
});

test('生产 Assessment 加载链继续包含独立 Month Command 模块', () => {
    const assessmentSource = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');
    assert(assessmentSource.includes('./js/bazi-month-command.js?v=13.44.0'), '生产加载链未接入 Month Command 独立模块');
});

console.log(`\nBaZi month command calendar v0.2: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
