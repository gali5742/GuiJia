#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Fixed vectors mirror the upstream 6tail/lunar-javascript README / EightChar / Yun regression cases,
// and are pinned here to protect GuiJia's vendored lunar-javascript 1.7.7 behavior.
const ROOT = path.resolve(__dirname, '..');
const lunarPath = path.join(ROOT, 'vendor', 'lunar.js');

if (!fs.existsSync(lunarPath)) {
    console.log('↷ lunar integration skipped: vendor/lunar.js is not materialized in this patch workspace.');
    process.exit(0);
}

const { Solar } = require(lunarPath);
let passed = 0;
let failed = 0;

function assertEqual(actual, expected, label) {
    if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}
function test(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`✓ lunar · ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ lunar · ${name}`);
        console.error(`  ${error.message}`);
    }
}
function fourPillars(solar, sect = 2) {
    const eightChar = solar.getLunar().getEightChar();
    eightChar.setSect(sect);
    return [eightChar.getYear(), eightChar.getMonth(), eightChar.getDay(), eightChar.getTime()].join(' ');
}

test('固定日期四柱回归', () => {
    assertEqual(fourPillars(Solar.fromYmdHms(2005, 12, 23, 8, 37, 0)), '乙酉 戊子 辛巳 壬辰', '2005-12-23 08:37');
    assertEqual(fourPillars(Solar.fromYmdHms(1999, 6, 7, 9, 11, 0)), '己卯 庚午 庚寅 辛巳', '1999-06-07 09:11');
});

test('晚子时 sect 1/2 日柱边界回归', () => {
    const solar = Solar.fromYmdHms(1988, 2, 15, 23, 30, 0);
    assertEqual(fourPillars(solar, 2), '戊辰 甲寅 庚子 戊子', 'sect=2');
    assertEqual(fourPillars(solar, 1), '戊辰 甲寅 辛丑 戊子', 'sect=1');
});

test('六爻默认午夜换日与子初换日日辰边界回归', () => {
    const solar = Solar.fromYmdHms(2026, 8, 9, 23, 6, 0);
    const civil = solar.getLunar().getEightChar();
    civil.setSect(2);
    assertEqual(civil.getDay(), '乙卯', '2026-08-09 23:06 · 24:00换日');
    const early = solar.getLunar().getEightChar();
    early.setSect(1);
    assertEqual(early.getDay(), '丙辰', '2026-08-09 23:06 · 23:00换日');

    const xunBoundary = Solar.fromYmdHms(2026, 8, 7, 23, 30, 0);
    const xunCivil = xunBoundary.getLunar().getEightChar();
    xunCivil.setSect(2);
    const xunEarly = xunBoundary.getLunar().getEightChar();
    xunEarly.setSect(1);
    assertEqual(xunCivil.getDayXunKong(), '寅卯', '24:00换日旬空');
    assertEqual(xunEarly.getDayXunKong(), '子丑', '23:00换日旬空');
});

test('六爻应期日期查询沿用所选换日口径', () => {
    global.window = global;
    global.Solar = Solar;
    global.GuiJia = {};
    require(path.join(ROOT, 'js', 'bazi-core.js'));
    require(path.join(ROOT, 'js', 'liuyao-core.js'));
    const core = global.GuiJia.liuyaoCore;
    const atLateZi = new Date(2026, 7, 9, 23, 6, 0);
    assertEqual(core.getDayBranchAt(atLateZi, 2).branch, '卯', '应期日支 · 24:00换日');
    assertEqual(core.getDayBranchAt(atLateZi, 1).branch, '辰', '应期日支 · 23:00换日');
    const nextCivil = core.findNextBranchDate(atLateZi, '子', 60, 2);
    const nextEarly = core.findNextBranchDate(atLateZi, '子', 60, 1);
    assertEqual(`${nextCivil.getFullYear()}-${nextCivil.getMonth()+1}-${nextCivil.getDate()}`, '2026-8-18', '下一子日 · 24:00换日');
    assertEqual(`${nextEarly.getFullYear()}-${nextEarly.getMonth()+1}-${nextEarly.getDate()}`, '2026-8-17', '下一子日 · 23:00换日');
});


test('23:00 换日应期显示对应完整民用时间窗', () => {
    global.window = global;
    global.Solar = Solar;
    global.GuiJia = {};
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'bazi-core.js'))];
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-core.js'))];
    require(path.join(ROOT, 'js', 'bazi-core.js'));
    require(path.join(ROOT, 'js', 'liuyao-core.js'));
    const core = global.GuiJia.liuyaoCore;
    const lateZi = new Date(2026, 7, 17, 23, 27, 0);
    assertEqual(core.candidateDateWindow(lateZi, 1, 'display'), '2026/8/17 23:00 起', '子初日页面起点');
    assertEqual(core.candidateDateWindow(lateZi, 1, 'context'), '2026/8/17 23:00 ～ 2026/8/18 22:59', '子初日完整区间');
    const sameEffectiveDay = new Date(2026, 7, 18, 15, 0, 0);
    assertEqual(core.candidateDateWindow(sameEffectiveDay, 1, 'display'), '2026/8/17 23:00 起', '白天仍归前一民用日23点开始的术数日');
});


test('月破出破读取下一节令精确交接时刻', () => {
    global.window = global;
    global.Solar = Solar;
    global.GuiJia = {};
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'bazi-core.js'))];
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-core.js'))];
    require(path.join(ROOT, 'js', 'bazi-core.js'));
    require(path.join(ROOT, 'js', 'liuyao-core.js'));
    const core = global.GuiJia.liuyaoCore;
    const boundary = core.findNextJieBoundary(new Date(2026, 7, 10, 0, 5, 0));
    assertEqual(boundary?.name, '白露', '2026-08-10 下一节令');
    if (!(boundary?.dateObj instanceof Date) || Number.isNaN(boundary.dateObj.getTime())) throw new Error('下一节令未返回精确 Date');
    const target = { relation:'子孙', branch:'寅', element:'木', moving:true, changedBranch:'辰', statusTags:[{code:'MONTH_BREAK',text:'月破',type:'constraint'}], moveTags:[] };
    const result = { castTimestamp:'2026-08-10T00:05:00+09:00', dayXun:'甲子', daySect:2, fullStructure:{sanHe:{pendingDetails:[]}} };
    const items = core.buildTimingCandidates(target, result);
    const outBreak = items.find((item) => item.triggers?.some((trigger) => trigger.label === '出破'));
    if (!outBreak) throw new Error('月破应期未生成出破节点');
    if (!outBreak.title.includes('白露交节后') || !outBreak.title.includes('2026/9/')) throw new Error(`出破未显示节令与精确时间：${outBreak.title}`);
});

test('立春前固定日期年柱月柱回归', () => {
    assertEqual(fourPillars(Solar.fromYmdHms(1988, 2, 2, 22, 30, 0)), '丁卯 癸丑 丁亥 辛亥', '1988-02-02 22:30');
});

test('起运时间固定向量回归', () => {
    const eightChar = Solar.fromYmdHms(1981, 1, 29, 23, 37, 0).getLunar().getEightChar();
    const yun = eightChar.getYun(0);
    assertEqual(String(yun.getStartYear()), '8', '起运年');
    assertEqual(String(yun.getStartMonth()), '0', '起运月');
    assertEqual(String(yun.getStartDay()), '20', '起运日');
    assertEqual(yun.getStartSolar().toYmd(), '1989-02-18', '交运日期');
});

test('流月固定向量回归', () => {
    const eightChar = Solar.fromYmdHms(2023, 5, 3, 9, 0, 0).getLunar().getEightChar();
    const firstLiuYue = eightChar.getYun(1).getDaYun()[0].getLiuNian()[0].getLiuYue()[0];
    assertEqual(firstLiuYue.getGanZhi(), '甲寅', '首个流月干支');
});

console.log(`\n${passed} lunar integration passed, ${failed} failed`);
if (failed) process.exit(1);
