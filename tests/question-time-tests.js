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
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/question-time.js'), 'utf8'), context, { filename:'js/question-time.js' });
const qt = context.GuiJia.questionTime;

let passed = 0;
let failed = 0;
const base = new Date(2026, 7, 10, 16, 42, 0); // Monday
const key = (value) => value ? qt.dateKey(value) : null;
const check = (name, question, expected, baseDate = base) => {
    try {
        const scope = qt.parseQuestionTimeScope(question, baseDate);
        if (expected.null) {
            if (scope !== null) throw new Error(`expected null, got ${JSON.stringify(scope)}`);
        } else {
            if (!scope) throw new Error('scope is null');
            if (expected.type && scope.type !== expected.type) throw new Error(`type ${scope.type} != ${expected.type}`);
            if (expected.precision && scope.precision !== expected.precision) throw new Error(`precision ${scope.precision} != ${expected.precision}`);
            if (expected.purpose && scope.purpose !== expected.purpose) throw new Error(`purpose ${scope.purpose} != ${expected.purpose}`);
            if (expected.confidence && scope.confidence !== expected.confidence) throw new Error(`confidence ${scope.confidence} != ${expected.confidence}`);
            if (expected.hardFilter !== undefined && scope.hardFilter !== expected.hardFilter) throw new Error(`hardFilter ${scope.hardFilter} != ${expected.hardFilter}`);
            if (expected.start && key(scope.start) !== expected.start) throw new Error(`start ${key(scope.start)} != ${expected.start}`);
            if (expected.end && key(scope.end) !== expected.end) throw new Error(`end ${key(scope.end)} != ${expected.end}`);
            if (expected.calendarStart && key(scope.calendarStart) !== expected.calendarStart) throw new Error(`calendarStart ${key(scope.calendarStart)} != ${expected.calendarStart}`);
            if (expected.calendarEnd && key(scope.calendarEnd) !== expected.calendarEnd) throw new Error(`calendarEnd ${key(scope.calendarEnd)} != ${expected.calendarEnd}`);
            if (expected.anchor && key(scope.anchor) !== expected.anchor) throw new Error(`anchor ${key(scope.anchor)} != ${expected.anchor}`);
            if (expected.dates) {
                const actual = scope.dates.map(key).join(',');
                if (actual !== expected.dates.join(',')) throw new Error(`dates ${actual} != ${expected.dates.join(',')}`);
            }
            if (expected.alternatives) {
                const actual = scope.alternatives.map(key).join(',');
                if (actual !== expected.alternatives.join(',')) throw new Error(`alternatives ${actual} != ${expected.alternatives.join(',')}`);
            }
            if (expected.noteIncludes && !String(scope.note || '').includes(expected.noteIncludes)) throw new Error(`note ${scope.note} missing ${expected.noteIncludes}`);
        }
        passed += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ ${name}`);
        console.error(`  ${question}`);
        console.error(`  ${error.message}`);
    }
};

// Relative / exact days
check('今天', '今天能收到消息吗', { type:'day', start:'2026/8/10', end:'2026/8/10', dates:['2026/8/10'] });
check('今日', '今日适合签字吗', { type:'day', start:'2026/8/10' });
check('明天', '明天出行如何', { type:'day', start:'2026/8/11', dates:['2026/8/11'] });
check('明日', '明日面试如何', { type:'day', start:'2026/8/11' });
check('后天', '后天面试怎么样', { type:'day', start:'2026/8/12' });
check('完整年月日', '2026年8月15日如何', { type:'day', start:'2026/8/15' });
check('横线年月日', '2026-8-16出行', { type:'day', start:'2026/8/16' });
check('斜线年月日', '2026/8/17怎么样', { type:'day', start:'2026/8/17' });
check('月日', '8月15日面试如何', { type:'day', start:'2026/8/15' });
check('月日已过推次年', '8月1日如何', { type:'day', start:'2027/8/1' });
check('短斜线日期', '8/18出行怎么样', { type:'day', start:'2026/8/18' });
check('无时间表达', '这次面试能过吗', { null:true });

// Weekdays
check('本周三', '本周三开会如何', { type:'day', start:'2026/8/12' });
check('这周五', '这周五谈判如何', { type:'day', start:'2026/8/14' });
check('下周三', '下周三面试如何', { type:'day', start:'2026/8/19' });
check('下下周一', '下下周一出发如何', { type:'day', start:'2026/8/24' });
check('周五', '周五怎么样', { type:'day', start:'2026/8/14' });
check('周日', '周日出门如何', { type:'day', start:'2026/8/16' });
check('星期六', '星期六见面如何', { type:'day', start:'2026/8/15' });

// Weekend / week ranges
check('本周末', '本周末适合出门吗', { type:'weekend', start:'2026/8/15', end:'2026/8/16', dates:['2026/8/15','2026/8/16'] });
check('这个周末', '这个周末出行如何', { type:'weekend', start:'2026/8/15', end:'2026/8/16' });
check('下周末', '下周末如何', { type:'weekend', start:'2026/8/22', end:'2026/8/23' });
check('下下周末', '下下周末旅行如何', { type:'weekend', start:'2026/8/29', end:'2026/8/30' });
check('本周剩余范围', '本周怎么样', { type:'calendar-week', start:'2026/8/10', end:'2026/8/16', calendarStart:'2026/8/10', calendarEnd:'2026/8/16' });
check('这周剩余范围', '这周能谈下来吗', { type:'calendar-week', start:'2026/8/10', end:'2026/8/16' });
check('下周完整范围', '下周有没有机会', { type:'calendar-week', start:'2026/8/17', end:'2026/8/23' });
check('下下周完整范围', '下下周适合处理吗', { type:'calendar-week', start:'2026/8/24', end:'2026/8/30' });

// Months / years
check('本月剩余范围', '本月能找到工作吗', { type:'calendar-month', start:'2026/8/10', end:'2026/8/31', calendarStart:'2026/8/1' });
check('这个月剩余范围', '这个月财运如何', { type:'calendar-month', start:'2026/8/10', end:'2026/8/31' });
check('下个月', '下个月会有变化吗', { type:'calendar-month', start:'2026/9/1', end:'2026/9/30' });
check('下月', '下月工作如何', { type:'calendar-month', start:'2026/9/1', end:'2026/9/30' });
check('今年剩余范围', '今年能不能升职', { type:'calendar-year', start:'2026/8/10', end:'2026/12/31', calendarStart:'2026/1/1' });
check('明年完整范围', '明年事业如何', { type:'calendar-year', start:'2027/1/1', end:'2027/12/31' });
check('今年下半年', '今年下半年能换工作吗', { type:'half-year', start:'2026/8/10', end:'2026/12/31', calendarStart:'2026/7/1' });
check('明年上半年', '明年上半年适合创业吗', { type:'half-year', start:'2027/1/1', end:'2027/6/30' });

// Month parts
check('8月上旬有效窗口裁剪', '8月上旬怎么样', { type:'month-part', start:'2026/8/10', end:'2026/8/10', calendarStart:'2026/8/1', calendarEnd:'2026/8/10' });
check('8月中旬', '8月中旬如何', { type:'month-part', start:'2026/8/11', end:'2026/8/20' });
check('8月下旬', '8月下旬如何', { type:'month-part', start:'2026/8/21', end:'2026/8/31' });
check('下个月中旬', '下个月中旬怎么样', { type:'month-part', start:'2026/9/11', end:'2026/9/20' });
check('9月下旬', '9月下旬出差如何', { type:'month-part', start:'2026/9/21', end:'2026/9/30' });
check('2月下旬平年', '2027年2月下旬如何', { type:'month-part', start:'2027/2/21', end:'2027/2/28' });
check('2月下旬闰年', '2028年2月下旬如何', { type:'month-part', start:'2028/2/21', end:'2028/2/29' });

// Rolling ranges
check('三天内', '三天内会联系我吗', { type:'rolling-range', start:'2026/8/10', end:'2026/8/13', purpose:'target' });
check('未来三天', '未来三天怎么样', { type:'rolling-range', start:'2026/8/10', end:'2026/8/13' });
check('未来三个月', '未来三个月有机会吗', { type:'rolling-range', start:'2026/8/10', end:'2026/11/10' });
check('未来一个月', '未来一个月怎么样', { type:'rolling-range', start:'2026/8/10', end:'2026/9/10' });
check('接下来两周', '接下来两周工作如何', { type:'rolling-range', start:'2026/8/10', end:'2026/8/24' });
check('一年内', '一年内能完成吗', { type:'rolling-range', start:'2026/8/10', end:'2027/8/10' });
check('三天后', '三天后出发如何', { type:'relative-offset', start:'2026/8/13', end:'2026/8/13' });
check('一个月后', '一个月后情况如何', { type:'relative-offset', start:'2026/9/10' });
check('一年后闰日安全', '一年后怎么样', { type:'relative-offset', start:'2027/8/10' });

// Boundaries
check('月底前', '月底前能收到钱吗', { type:'bounded-range', purpose:'search-end', start:'2026/8/10', end:'2026/8/31', anchor:'2026/8/31' });
check('下个月月底前', '下个月月底之前能结束吗', { type:'bounded-range', purpose:'search-end', start:'2026/8/10', end:'2026/9/30' });
check('年底前', '年底前能完成吗', { type:'bounded-range', purpose:'search-end', start:'2026/8/10', end:'2026/12/31' });
check('明年年底前', '明年年底之前能稳定吗', { type:'bounded-range', purpose:'search-end', start:'2026/8/10', end:'2027/12/31' });
check('明确日前', '8月20日前哪天适合', { type:'bounded-range', purpose:'search-end', end:'2026/8/20', anchor:'2026/8/20' });
check('周五之前', '最迟周五之前完成如何', { type:'bounded-range', purpose:'search-end', end:'2026/8/14' });
check('明天以后', '明天以后哪天适合', { type:'open-boundary', purpose:'search-start', start:'2026/8/11', end:null });
check('一个月以后', '一个月以后情况如何', { type:'open-boundary', purpose:'search-start', start:'2026/9/10' });
check('周五以后', '周五以后哪天好', { type:'open-boundary', purpose:'search-start', start:'2026/8/14' });

// Explicit ranges
check('8月15日至20日', '8月15日至20日出差如何', { type:'explicit-range', start:'2026/8/15', end:'2026/8/20' });
check('完整年月短尾范围', '2026年8月15日至20日怎么样', { type:'explicit-range', start:'2026/8/15', end:'2026/8/20' });
check('从周三到周五', '从周三到周五怎么样', { type:'explicit-range', start:'2026/8/12', end:'2026/8/14' });
check('下周三到下下周一', '下周三到下下周一出差如何', { type:'explicit-range', start:'2026/8/19', end:'2026/8/24' });
check('从明天开始的一周', '从明天开始的一周如何', { type:'anchored-duration', start:'2026/8/11', end:'2026/8/17' });
check('跨月明确范围', '8月30日至9月2日出差如何', { type:'explicit-range', start:'2026/8/30', end:'2026/9/2' });

// Alternatives / correction
check('明天或者后天', '明天或者后天哪个好', { type:'alternatives', purpose:'alternatives', alternatives:['2026/8/11','2026/8/12'], start:'2026/8/11', end:'2026/8/12' });
check('明天还是周五', '明天还是周五哪个好', { type:'alternatives', purpose:'alternatives', alternatives:['2026/8/11','2026/8/14'] });
check('不是明天是后天', '不是明天，是后天', { type:'day', start:'2026/8/12', noteIncludes:'后项' });
check('明天不行后天', '明天不行，后天怎么样', { type:'day', start:'2026/8/12', noteIncludes:'否定' });
check('明后两天', '明后两天怎么样', { type:'relative-range', start:'2026/8/11', end:'2026/8/12' });

// Vague / approximate
check('最近', '最近会有消息吗', { type:'vague', precision:'vague', confidence:'low', hardFilter:false });
check('近期', '近期会不会变化', { type:'vague', confidence:'low', hardFilter:false });
check('过几天', '过几天怎么样', { type:'vague', confidence:'low', hardFilter:false });
check('未来几天', '未来几天会有消息吗', { type:'vague', confidence:'low', hardFilter:false });
check('不久以后', '不久以后会怎样', { type:'vague', confidence:'low', hardFilter:false });
check('这段时间', '这段时间工作如何', { type:'vague', confidence:'low', hardFilter:false });
check('月底左右', '月底左右会不会有结果', { type:'approximate', confidence:'medium', hardFilter:false, anchor:'2026/8/31' });
check('8月15日前后', '8月15日前后出行如何', { type:'approximate', confidence:'medium', hardFilter:false, anchor:'2026/8/15' });
check('开放以后', '以后什么时候会好', { type:'vague-future', purpose:'search-start', confidence:'low', hardFilter:false, start:'2026/8/10' });

// Edge / calendar boundaries
check('年末滚动三天', '未来三天怎么样', { type:'rolling-range', start:'2026/12/30', end:'2027/1/2' }, new Date(2026,11,30,10,0,0));
check('月底滚动三天', '三天内有消息吗', { type:'rolling-range', start:'2026/8/30', end:'2026/9/2' }, new Date(2026,7,30,10,0,0));
check('闰年2月28明天', '明天如何', { type:'day', start:'2028/2/29' }, new Date(2028,1,28,10,0,0));
check('闰年2月29明天', '明天如何', { type:'day', start:'2028/3/1' }, new Date(2028,1,29,10,0,0));
check('1月31一个月后', '一个月后如何', { type:'relative-offset', start:'2026/2/28' }, new Date(2026,0,31,10,0,0));
check('12月下个月', '下个月怎么样', { type:'calendar-month', start:'2027/1/1', end:'2027/1/31' }, new Date(2026,11,20,10,0,0));
check('周日问本周末只剩周日', '本周末如何', { type:'weekend', start:'2026/8/16', end:'2026/8/16', dates:['2026/8/16'] }, new Date(2026,7,16,10,0,0));

// Helpers
try {
    const scope = qt.parseQuestionTimeScope('明天或者后天哪个好', base);
    if (!qt.scopeContainsDate(scope, new Date(2026,7,11,12))) throw new Error('alternatives should contain 8/11');
    if (qt.scopeContainsDate(scope, new Date(2026,7,13,12))) throw new Error('alternatives should not contain 8/13');
    const week = qt.parseQuestionTimeScope('下周', base);
    const expanded = qt.expandScopeDates(week, 7).map(key);
    if (expanded.length !== 7 || expanded[0] !== '2026/8/17' || expanded[6] !== '2026/8/23') throw new Error(`week expansion wrong: ${expanded.join(',')}`);
    if (qt.scopeRangeText(week) !== '2026/8/17 ～ 2026/8/23') throw new Error(`range text wrong: ${qt.scopeRangeText(week)}`);
    passed += 1;
    console.log('✓ scope helpers');
} catch (error) {
    failed += 1;
    console.error('✗ scope helpers');
    console.error(`  ${error.message}`);
}


try {
    const cases = [
        ['本周能收到消息吗', 'event-occurrence'],
        ['8月15日至20日出差如何', 'process-evaluation'],
        ['这周哪天适合签合同', 'date-selection'],
        ['月底前能收到钱吗', 'deadline'],
        ['近期会不会有消息', 'vague']
    ];
    cases.forEach(([question, expected]) => {
        const scope = qt.parseQuestionTimeScope(question, base);
        const actual = qt.classifyQuestionTimeMode(question, scope);
        if (actual !== expected) throw new Error(`${question}: ${actual} != ${expected}`);
    });
    passed += 1;
    console.log('✓ range analysis mode classification');
} catch (error) {
    failed += 1;
    console.error('✗ range analysis mode classification');
    console.error(`  ${error.message}`);
}

console.log(`\n${passed} question-time tests passed, ${failed} failed`);
if (failed) process.exit(1);
