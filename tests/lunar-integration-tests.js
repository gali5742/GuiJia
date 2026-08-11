#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

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

test('六爻占问中的“明天”解析为目标日期与日柱', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const target = {position:3,label:'三爻',relation:'官鬼',branch:'卯',element:'木',moving:false,isShi:true,isYing:false};
    const rows = [
        {position:1,label:'初爻',relation:'兄弟',branch:'未',element:'土',moving:false},
        {position:2,label:'二爻',relation:'父母',branch:'巳',element:'火',moving:false},
        target,
        {position:4,label:'四爻',relation:'子孙',branch:'申',element:'金',moving:true,changedBranch:'午',changedRelation:'父母',changedElement:'火'},
        {position:5,label:'五爻',relation:'兄弟',branch:'戌',element:'土',moving:false},
        {position:6,label:'上爻',relation:'妻财',branch:'子',element:'水',moving:true,isYing:true,changedBranch:'戌',changedRelation:'兄弟',changedElement:'土'}
    ];
    const focus = core.buildQuestionTimeFocus({question:'明天出行如何',castTimestamp:new Date(2026,7,10,15,51,0).getTime(),daySect:2,monthZhi:'申',dayZhi:'辰',lines:rows}, target);
    assertEqual(focus.entries.length, 1, '明天只应解析为一个目标日');
    assertEqual(focus.entries[0].dateText, '2026/8/11', '明天目标日期');
    assertEqual(focus.entries[0].dayGanZhi, '丁巳', '明天目标日干支');
    if (!focus.entries[0].facts.some((text) => text.includes('观察爻泄力'))) throw new Error(`Time v2 未输出主要观察爻对目标日的泄力：${JSON.stringify(focus.entries[0])}`);
    if (!focus.entries[0].facts.some((text) => text.includes('动爻逢合·合绊'))) throw new Error(`Time v2 未保留关键动爻合绊证据：${JSON.stringify(focus.entries[0])}`);
    if (!focus.legacyShadow?.entries?.[0]?.facts?.some((text) => text.includes('父母巳火临目标日【巳】'))) throw new Error(`legacyShadow 未保留旧目标日直读事实：${JSON.stringify(focus.legacyShadow)}`);
});


test('六爻目标时点不重复拼接爻位与六亲字段', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const target = {position:2,label:'二爻 · 官鬼亥水（世）（动）',relation:'官鬼',branch:'亥',element:'水',moving:true,isShi:true,isYing:false,changedBranch:'巳',changedRelation:'兄弟',changedElement:'火'};
    const focus = core.buildQuestionTimeFocus({question:'明天出行如何',castTimestamp:new Date(2026,7,10,16,55,0).getTime(),daySect:2,monthZhi:'申',dayZhi:'辰',lines:[target]}, target);
    const line = (focus?.entries?.[0]?.facts || []).find((text) => text.includes('二爻（世）官鬼亥水')) || '';
    if (!line) throw new Error(`Time v2 单日目标时点缺少主要观察爻事实：${JSON.stringify(focus?.entries?.[0])}`);
    if ((line.match(/官鬼亥水/g) || []).length !== 1) throw new Error(`单日目标时点重复拼接：${line}`);
});

test('六爻连续时间范围进入 Range Time Analysis 并只保留范围内关键节点', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const rows = [
        {position:1,label:'初爻',relation:'子孙',branch:'丑',element:'土',moving:false,statusTags:[{code:'VOID',text:'旬空'}]},
        {position:2,label:'二爻',relation:'官鬼',branch:'亥',element:'水',moving:true,isShi:true,isYing:false,changedBranch:'巳',changedRelation:'兄弟',changedElement:'火',statusTags:[],moveTags:[]},
        {position:3,label:'三爻',relation:'妻财',branch:'酉',element:'金',moving:true,changedBranch:'卯',changedRelation:'父母',changedElement:'木',statusTags:[],moveTags:[]},
        {position:4,label:'四爻',relation:'妻财',branch:'酉',element:'金',moving:false,statusTags:[]},
        {position:5,label:'五爻',relation:'子孙',branch:'未',element:'土',moving:true,isYing:true,changedBranch:'酉',changedRelation:'妻财',changedElement:'金',statusTags:[],moveTags:[]},
        {position:6,label:'上爻',relation:'兄弟',branch:'巳',element:'火',moving:true,changedBranch:'未',changedRelation:'子孙',changedElement:'土',statusTags:[],moveTags:[]}
    ];
    const fullStructure = { sanHe:core.buildMovingSanHe(rows, '申', '辰') };
    const base = {castTimestamp:new Date(2026,7,10,16,55,0).getTime(),daySect:2,dayXun:'甲寅',monthZhi:'申',dayZhi:'辰',lines:rows,fullStructure};
    const week = core.buildQuestionTimeFocus({...base, question:'本周能收到消息吗'}, rows[1]);
    assertEqual(week.kind, 'range', '本周 focus kind');
    assertEqual(week.mode, 'event-occurrence', '本周问消息的分析模式');
    assertEqual(week.totalDays, 7, '本周逐日后台扫描天数');
    if (!week.keyNodes?.length) throw new Error('本周范围未提取关键节点');
    if (week.keyNodes.some((item) => item.dateText < '2026/8/10' || item.dateText > '2026/8/16')) throw new Error(`本周出现范围外节点：${JSON.stringify(week.keyNodes)}`);

    const trip = core.buildQuestionTimeFocus({...base, question:'8月15日至20日出差如何'}, rows[1]);
    assertEqual(trip.kind, 'range', '出差范围 focus kind');
    assertEqual(trip.mode, 'process-evaluation', '出差范围分析模式');
    assertEqual(trip.totalDays, 6, '出差范围逐日扫描天数');
    if (trip.keyNodes.some((item) => item.dateText < '2026/8/15' || item.dateText > '2026/8/20')) throw new Error(`出差范围出现范围外节点：${JSON.stringify(trip.keyNodes)}`);
    if (!trip.keyNodes.some((item) => item.dateText === '2026/8/20' && item.facts.some((fact) => fact.includes('动爻逢合')))) throw new Error(`8/20 寅日未进入范围关键节点：${JSON.stringify(trip.keyNodes)}`);
    if (!trip.keyNodes.some((item) => item.dateText === '2026/8/18' && item.facts.some((fact) => fact.includes('三合待实·出空')))) throw new Error(`原旬结束未转成三合待实出空节点：${JSON.stringify(trip.keyNodes)}`);
    if (trip.keyNodes.some((item) => item.dateText === '2026/8/19' && item.facts.some((fact) => fact.includes('三合待实·填实')))) throw new Error(`出旬后仍把原旬空当作待填实：${JSON.stringify(trip.keyNodes)}`);

    const choose = core.buildQuestionTimeFocus({...base, question:'这周哪天适合签合同'}, rows[1]);
    assertEqual(choose.mode, 'date-selection', '日期选择模式');
    const alternatives = core.buildQuestionTimeFocus({...base, question:'明天还是周五哪个好'}, rows[1]);
    assertEqual(alternatives.kind, 'point', '离散候选不应扩成连续范围');
    assertEqual(alternatives.entries.length, 2, '离散候选只保留两个指定日期');
    if (alternatives.entries.some((item) => !['2026/8/11','2026/8/14'].includes(item.dateText))) throw new Error(`离散候选混入中间日期：${JSON.stringify(alternatives.entries)}`);
    const deadline = core.buildQuestionTimeFocus({...base, question:'月底前能收到钱吗'}, rows[1]);
    assertEqual(deadline.mode, 'deadline', '截止期限模式');
    const vague = core.buildQuestionTimeFocus({...base, question:'近期会不会有消息'}, rows[1]);
    if (vague !== null) throw new Error(`模糊时间不应建立硬范围分析：${JSON.stringify(vague)}`);
});

test('六爻应期日期查询沿用所选换日口径', () => {
    global.window = global;
    global.Solar = Solar;
    global.GuiJia = {};
    require(path.join(ROOT, 'js', 'question-time.js'));
    require(path.join(ROOT, 'js', 'bazi-core.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-facts.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-facts.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-effects.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-effects.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-assessment.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-assessment.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-evidence.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-evidence.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-relevance.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-relevance.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-output.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-output.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-selection.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-selection.js'));
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
    require(path.join(ROOT, 'js', 'question-time.js'));
    require(path.join(ROOT, 'js', 'bazi-core.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-facts.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-facts.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-effects.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-effects.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-assessment.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-assessment.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-evidence.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-evidence.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-relevance.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-relevance.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-output.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-output.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-selection.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-selection.js'));
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
    require(path.join(ROOT, 'js', 'question-time.js'));
    require(path.join(ROOT, 'js', 'bazi-core.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-facts.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-facts.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-effects.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-effects.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-assessment.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-assessment.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-evidence.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-evidence.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-relevance.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-relevance.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-output.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-output.js'));
    delete require.cache[require.resolve(path.join(ROOT, 'js', 'liuyao-time-selection.js'))];
    require(path.join(ROOT, 'js', 'liuyao-time-selection.js'));
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


test('v13.43.3 时间节点效力、阈值筛选与日期比较回归', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const mk = (position, label, relation, branch, element, moving = false, extra = {}) => ({position,label,relation,branch,element,moving,statusTags:[],moveTags:[],...extra});
    let rows = [
        mk(1,'初爻','兄弟','未','土'),
        mk(2,'二爻','父母','巳','火'),
        mk(3,'三爻','官鬼','卯','木',false,{isShi:true}),
        mk(4,'四爻','子孙','申','金',true,{changedRelation:'父母',changedBranch:'午',changedElement:'火'}),
        mk(5,'五爻','兄弟','戌','土'),
        mk(6,'上爻','妻财','子','水',true,{isYing:true,changedRelation:'兄弟',changedBranch:'戌',changedElement:'土'})
    ];
    rows = rows.map((line) => ({...line,statusTags:core.buildLiuYaoLineStatus(line,'申','辰','子丑',line.moving).tags}));
    rows = rows.map((line) => line.moving ? ({...line,moveTags:core.buildMoveAnalysis(line,{branch:line.changedBranch,element:line.changedElement},'申','子丑')}) : line);
    const fullStructure = {sanHe:core.buildMovingSanHe(rows,'申','辰')};
    const base = {castTimestamp:new Date(2026,7,10,17,16,0).getTime(),daySect:2,dayXun:'甲寅',monthZhi:'申',dayZhi:'辰',lines:rows,fullStructure};

    const process = core.buildQuestionTimeFocus({...base,question:'8月15日至20日出差如何'}, rows[2]);
    const legacyProcess = process.legacyShadow;
    if (!legacyProcess.keyNodes.some((item) => item.dateText === '2026/8/15' && item.facts.some((fact) => fact.includes('静爻逢冲·日破')))) throw new Error(`休囚静爻逢冲未判日破倾向：${JSON.stringify(legacyProcess.keyNodes)}`);
    if (!legacyProcess.keyNodes.some((item) => item.dateText === '2026/8/16' && item.facts.some((fact) => fact.includes('静爻逢合·合起')))) throw new Error(`静爻逢合未判合起：${JSON.stringify(legacyProcess.keyNodes)}`);
    if (legacyProcess.keyNodes.some((item) => item.dateText === '2026/8/19')) throw new Error(`过程范围仍为凑数量保留低区分度 8/19：${JSON.stringify(legacyProcess.keyNodes)}`);
    if (!legacyProcess.keyNodes.some((item) => item.effectSummary?.includes('生扶'))) throw new Error(`范围节点未输出效力方向：${JSON.stringify(legacyProcess.keyNodes)}`);

    const choose = core.buildQuestionTimeFocus({...base,question:'这周哪天适合签合同'}, rows[1]);
    const legacyChoose = choose.legacyShadow;
    if (legacyChoose.comparison?.preferredDates?.[0] !== '2026/8/11') throw new Error(`合同日期比较未优先 8/11：${JSON.stringify(legacyChoose.comparison)}`);
    if (!legacyChoose.comparison?.summary?.includes('优先观察：2026/8/11')) throw new Error(`日期比较未生成相对优先结果：${JSON.stringify(legacyChoose.comparison)}`);
    const aug14 = legacyChoose.keyNodes.find((item) => item.dateText === '2026/8/14');
    if (!aug14?.assessment?.text?.includes('利弊并见')) throw new Error(`8/14 未体现合起与不利动爻并见：${JSON.stringify(aug14)}`);

    const alternatives = core.buildQuestionTimeFocus({...base,question:'明天还是周五哪个好',useGodSelection:{mode:'default'}}, rows[2]);
    const legacyAlternatives = alternatives.legacyShadow;
    assertEqual(legacyAlternatives.entries[0].label, '明天', '离散候选第一个标签');
    assertEqual(legacyAlternatives.entries[1].label, '周五', '离散候选第二个标签');
    if (!legacyAlternatives.comparison?.summary?.includes('2026/8/11')) throw new Error(`离散候选未生成比较结果：${JSON.stringify(alternatives.comparison)}`);
    if (!alternatives.comparisonBasisNote?.includes('仅按世爻状态') || alternatives.suppressTimingCandidates !== true) throw new Error(`事项不明的离散比较未降级或未抑制重复应期：${JSON.stringify(alternatives)}`);
});

// 来自 v13.43.2 手动测试：坤之随，出差范围内不能只留下世爻逢值；
// 旬空动爻出空 / 出空后逢值，以及完整三合中的动爻成员逢值也应进入一级候选。
test('v13.43.3 关键动爻旬空转换与三合成员逢值进入范围事件池', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const mk = (position, label, relation, branch, element, moving = false, extra = {}) => ({position,label,relation,branch,element,moving,statusTags:[],moveTags:[],...extra});
    let rows = [
        mk(1,'初爻','兄弟','未','土',true,{changedRelation:'妻财',changedBranch:'子',changedElement:'水'}),
        mk(2,'二爻','父母','巳','火'),
        mk(3,'三爻','官鬼','卯','木',false,{isYing:true}),
        mk(4,'四爻','兄弟','丑','土',true,{changedRelation:'妻财',changedBranch:'亥',changedElement:'水'}),
        mk(5,'五爻','妻财','亥','水',true,{changedRelation:'子孙',changedBranch:'酉',changedElement:'金'}),
        mk(6,'上爻','子孙','酉','金',false,{isShi:true})
    ];
    rows = rows.map((line) => ({...line,statusTags:core.buildLiuYaoLineStatus(line,'申','辰','子丑',line.moving).tags}));
    rows = rows.map((line) => line.moving ? ({...line,moveTags:core.buildMoveAnalysis(line,{branch:line.changedBranch,element:line.changedElement},'申','子丑')}) : line);
    const fullStructure = {sanHe:core.buildMovingSanHe(rows,'申','辰')};
    const base = {castTimestamp:new Date(2026,7,10,17,40,0).getTime(),daySect:2,dayXun:'甲寅',monthZhi:'申',dayZhi:'辰',lines:rows,fullStructure,useGodSelection:{mode:'suggestion',focusId:'travel'}};
    const focus = core.buildQuestionTimeFocus({...base,question:'8月15日至20日出差如何'}, rows[5]);
    const aug17 = focus.keyNodes.find((item) => item.dateText === '2026/8/17');
    const aug18 = focus.keyNodes.find((item) => item.dateText === '2026/8/18');
    const aug19 = focus.keyNodes.find((item) => item.dateText === '2026/8/19');
    if (!aug17?.facts.some((fact) => fact.includes('三合成员逢值') && fact.includes('亥卯未'))) throw new Error(`完整三合动爻成员逢值未提升：${JSON.stringify(focus.keyNodes)}`);
    if (!aug18?.facts.some((fact) => fact.includes('动爻出空') || fact.includes('变爻出空'))) throw new Error(`原旬结束未生成关键爻出空节点：${JSON.stringify(focus.keyNodes)}`);
    if (!aug19?.facts.some((fact) => fact.includes('动爻出空后逢值') && fact.includes('四爻兄弟丑土'))) throw new Error(`旬空动爻出空后逢值未提升：${JSON.stringify(focus.keyNodes)}`);
});


test('v13.43.4 关键动爻逢值与变爻补充事实保留（RC 直证优先）', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const mk = (position, label, relation, branch, element, moving = false, extra = {}) => ({position,label,relation,branch,element,moving,statusTags:[],moveTags:[],...extra});
    // 手动测试固定向量：丰之大有；世爻申金，二爻丑土旬空发动、上爻戌土发动。
    let rows = [
        mk(1,'初爻','子孙','卯','木'),
        mk(2,'二爻','官鬼','丑','土',true,{isYing:true,changedRelation:'子孙',changedBranch:'寅',changedElement:'木'}),
        mk(3,'三爻','兄弟','亥','水'),
        mk(4,'四爻','妻财','午','火'),
        mk(5,'五爻','父母','申','金',false,{isShi:true}),
        mk(6,'上爻','官鬼','戌','土',true,{changedRelation:'妻财',changedBranch:'巳',changedElement:'火'})
    ];
    rows = rows.map((line) => ({...line,statusTags:core.buildLiuYaoLineStatus(line,'申','辰','子丑',line.moving).tags}));
    rows = rows.map((line) => line.moving ? ({...line,moveTags:core.buildMoveAnalysis(line,{branch:line.changedBranch,element:line.changedElement},'申','子丑')}) : line);
    const base = {
        castTimestamp:new Date(2026,7,10,18,29,0).getTime(),
        daySect:2,
        dayXun:'甲寅',
        monthZhi:'申',
        dayZhi:'辰',
        lines:rows,
        fullStructure:{sanHe:core.buildMovingSanHe(rows,'申','辰')},
        useGodSelection:{mode:'suggestion',focusId:'travel'}
    };
    const focus = core.buildQuestionTimeFocus({...base,question:'8月15日至20日出差如何'}, rows[4]);
    const aug16 = focus.keyNodes.find((item) => item.dateText === '2026/8/16');
    const aug20 = focus.keyNodes.find((item) => item.dateText === '2026/8/20');
    if (!aug16?.facts.some((fact) => fact.includes('生扶动爻逢值') && fact.includes('上爻官鬼戌土'))) {
        throw new Error(`非空生扶动爻逢值仍未进入关键节点：${JSON.stringify(focus.keyNodes)}`);
    }
    const aug20RawFacts = core.buildTimeFactsForDay(base, rows[4], new Date(2026,7,20,12,0,0), 2);
    const changedSupplement = aug20RawFacts.find((fact) => fact.sourceCode === 'CHANGED_VALUE_2');
    if (!changedSupplement || changedSupplement.subject !== 'changed-line' || !changedSupplement.semanticKeys?.includes('branch-relation:value')) {
        throw new Error(`变爻逢值 / 月破复核补充事实未保留在 TimeFact 事件池：${JSON.stringify(aug20RawFacts)}`);
    }
    if (!aug20?.facts.some((fact) => fact.includes('五爻（世）父母申金') && fact.includes('耗力'))
        || !aug20?.facts.some((fact) => fact.includes('五爻（世）父母申金') && fact.includes('暗动'))) {
        throw new Error(`RC Evidence 未优先保留主要观察爻自身直证：${JSON.stringify(aug20)}`);
    }
});



test('v13.43.5 关键静爻统一追踪旬空出空与月破逢值复核', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const mk = (position, label, relation, branch, element, extra = {}) => ({position,label,relation,branch,element,moving:false,statusTags:[],moveTags:[],...extra});
    // 手动测试固定向量：无妄静卦；世午火，应子水旬空，寅木为生扶静爻且月破。
    let rows = [
        mk(1,'初爻','父母','子','水',{isYing:true}),
        mk(2,'二爻','兄弟','寅','木'),
        mk(3,'三爻','妻财','辰','土'),
        mk(4,'四爻','子孙','午','火',{isShi:true}),
        mk(5,'五爻','官鬼','申','金'),
        mk(6,'上爻','妻财','戌','土')
    ];
    rows = rows.map((line) => ({...line,statusTags:core.buildLiuYaoLineStatus(line,'申','辰','子丑',false).tags}));
    const base = {
        castTimestamp:new Date(2026,7,10,18,42,0).getTime(),
        daySect:2,
        dayXun:'甲寅',
        monthZhi:'申',
        dayZhi:'辰',
        lines:rows,
        fullStructure:{sanHe:core.buildMovingSanHe(rows,'申','辰')},
        useGodSelection:{mode:'suggestion',focusId:'travel'}
    };
    const focus = core.buildQuestionTimeFocus({...base,question:'8月15日至20日出差如何'}, rows[3]);
    const legacyFocus = focus.legacyShadow;
    const aug18 = legacyFocus.keyNodes.find((item) => item.dateText === '2026/8/18');
    const aug20 = legacyFocus.keyNodes.find((item) => item.dateText === '2026/8/20');
    if (!aug18?.facts.some((fact) => fact.includes('应爻出空并逢值') && fact.includes('初爻（应）父母子水'))) {
        throw new Error(`旬空静应爻未在出空当日合并逢值状态：${JSON.stringify(legacyFocus.keyNodes)}`);
    }
    if (!aug20?.facts.some((fact) => fact.includes('生扶爻逢值·月破复核') && fact.includes('二爻兄弟寅木'))) {
        throw new Error(`月破生扶静爻逢值未进入关键节点：${JSON.stringify(legacyFocus.keyNodes)}`);
    }
});


test('v13.43.6 状态不反向抬升普通旬空静爻', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const mk = (position, label, relation, branch, element, extra = {}) => ({position,label,relation,branch,element,moving:false,statusTags:[],moveTags:[],...extra});
    // 手动测试固定向量：节静卦；世巳火，应申金；子水为克制爻且旬空，丑土仅旬空、无关键角色。
    let rows = [
        mk(1,'初爻','妻财','巳','火',{isShi:true}),
        mk(2,'二爻','子孙','卯','木'),
        mk(3,'三爻','官鬼','丑','土'),
        mk(4,'四爻','父母','申','金',{isYing:true}),
        mk(5,'五爻','官鬼','戌','土'),
        mk(6,'上爻','兄弟','子','水')
    ];
    rows = rows.map((line) => ({...line,statusTags:core.buildLiuYaoLineStatus(line,'申','辰','子丑',false).tags}));
    const base = {
        castTimestamp:new Date(2026,7,10,19,49,0).getTime(),
        daySect:2,
        dayXun:'甲寅',
        monthZhi:'申',
        dayZhi:'辰',
        lines:rows,
        fullStructure:{sanHe:core.buildMovingSanHe(rows,'申','辰')},
        useGodSelection:{mode:'suggestion',focusId:'travel',target:'世'}
    };
    const focus = core.buildQuestionTimeFocus({...base,question:'8月15日至20日出差如何'}, rows[0]);
    const aug17 = focus.keyNodes.find((item) => item.dateText === '2026/8/17');
    const aug18 = focus.keyNodes.find((item) => item.dateText === '2026/8/18');
    const aug19 = focus.keyNodes.find((item) => item.dateText === '2026/8/19');
    if (!aug17?.facts.some((fact) => fact.includes('静爻逢冲·日破') && fact.includes('初爻（世）妻财巳火'))) {
        throw new Error(`收紧 KeyLine 后误删世爻受冲节点：${JSON.stringify(focus.keyNodes)}`);
    }
    if (!aug18?.facts.some((fact) => fact.includes('克制爻出空并逢值') && fact.includes('上爻兄弟子水'))) {
        throw new Error(`真正关键的旬空克制爻未保留状态转换：${JSON.stringify(focus.keyNodes)}`);
    }
    if (aug19 || focus.keyNodes.some((item) => item.facts.some((fact) => fact.includes('三爻官鬼丑土')))) {
        throw new Error(`普通旬空静爻仍因状态本身被误抬升：${JSON.stringify(focus.keyNodes)}`);
    }
});


test('v13.43.7 目标日地支关系与五行效力并行并进入节点汇总', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const base = {
        castTimestamp:new Date(2026,7,10,20,0,0).getTime(), daySect:2, dayXun:'甲寅', monthZhi:'申', dayZhi:'辰',
        fullStructure:{sanHe:{completeDetails:[],pendingDetails:[],deferredDetails:[]}},
        useGodSelection:{mode:'suggestion',focusId:'travel',target:'世'}
    };
    const ziTarget = {position:1,label:'初爻',relation:'父母',branch:'子',element:'水',moving:false,isShi:true,statusTags:[],moveTags:[]};
    const harmonyControl = core.buildQuestionTimeFocus({...base,question:'8月19日至20日出差如何',lines:[ziTarget]}, ziTarget);
    const aug19 = harmonyControl.legacyShadow.keyNodes.find((item) => item.dateText === '2026/8/19');
    if (!aug19?.facts.some((fact) => fact.includes('静爻逢合·合起')) || !aug19?.facts.some((fact) => fact.includes('目标日克制'))) {
        throw new Error(`子丑六合遮蔽五行克制：${JSON.stringify(harmonyControl.legacyShadow.keyNodes)}`);
    }
    assertEqual(aug19.effectSummary, '生扶与受制并见', '六合 + 克制节点效力合流');

    const chenTarget = {position:1,label:'初爻',relation:'妻财',branch:'辰',element:'土',moving:false,isShi:true,statusTags:[],moveTags:[]};
    const harmonyDrain = core.buildQuestionTimeFocus({...base,question:'8月15日至16日出差如何',lines:[chenTarget]}, chenTarget);
    const aug15 = harmonyDrain.legacyShadow.keyNodes.find((item) => item.dateText === '2026/8/15');
    if (!aug15?.facts.some((fact) => fact.includes('静爻逢合·合起')) || !aug15?.facts.some((fact) => fact.includes('目标日泄力'))) {
        throw new Error(`辰酉六合遮蔽五行泄力：${JSON.stringify(harmonyDrain.legacyShadow.keyNodes)}`);
    }
    assertEqual(aug15.effectSummary, '生扶与受制并见', '六合 + 泄力节点效力合流');

    const chouTarget = {position:1,label:'初爻',relation:'兄弟',branch:'丑',element:'土',moving:false,isShi:true,statusTags:[],moveTags:[]};
    const harmonyCost = core.buildQuestionTimeFocus({...base,question:'8月18日至19日出差如何',lines:[chouTarget]}, chouTarget);
    const aug18 = harmonyCost.legacyShadow.keyNodes.find((item) => item.dateText === '2026/8/18');
    if (!aug18?.facts.some((fact) => fact.includes('静爻逢合·合起')) || !aug18?.facts.some((fact) => fact.includes('观察爻克目标日'))) {
        throw new Error(`丑子六合遮蔽主动制约耗力：${JSON.stringify(harmonyCost.legacyShadow.keyNodes)}`);
    }
    assertEqual(aug18.effectSummary, '生扶与耗力并见', '六合 + 主动制约耗力节点效力合流');
});

test('v13.43.7 月破优先于同五行比扶，土支月冲不误判暗动', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const target = {position:1,label:'初爻',relation:'兄弟',branch:'丑',element:'土',moving:false,isShi:true,statusTags:[{code:'MONTH_BREAK',text:'月破',type:'constraint'}],moveTags:[]};
    const base = {
        castTimestamp:new Date(2026,6,15,12,0,0).getTime(), daySect:2, dayXun:'甲申', monthZhi:'未', dayZhi:'寅', lines:[target],
        fullStructure:{sanHe:{completeDetails:[],pendingDetails:[],deferredDetails:[]}},
        useGodSelection:{mode:'suggestion',focusId:'travel',target:'世'}
    };
    const focus = core.buildQuestionTimeFocus({...base,question:'7月20日至21日出差如何'}, target);
    const jul20 = focus.legacyShadow.keyNodes.find((item) => item.dateText === '2026/7/20');
    if (!jul20?.facts.some((fact) => fact.includes('静爻逢冲·日破') && fact.includes('月破'))) {
        throw new Error(`丑土未月直接月冲未优先按日破观察：${JSON.stringify(focus.legacyShadow.keyNodes)}`);
    }
    if (jul20.facts.some((fact) => fact.includes('静爻逢冲·暗动'))) {
        throw new Error(`丑未同属土导致月破被误判暗动：${JSON.stringify(jul20.facts)}`);
    }
});

test('v13.43.7 三合时间事实按展示语义去重且不挤占其他关键事实', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const target = {position:1,label:'初爻',relation:'子孙',branch:'午',element:'火',moving:false,isShi:true,statusTags:[],moveTags:[]};
    const deferred = {groupBranches:['申','子','辰'],element:'水',blockers:[{code:'VOID',token:{branch:'子'}}]};
    const base = {
        castTimestamp:new Date(2026,7,10,20,0,0).getTime(), daySect:2, dayXun:'甲寅', monthZhi:'申', dayZhi:'辰', lines:[target],
        fullStructure:{sanHe:{completeDetails:[],pendingDetails:[],deferredDetails:[deferred,JSON.parse(JSON.stringify(deferred))]}},
        useGodSelection:{mode:'suggestion',focusId:'travel',target:'世'}
    };
    const focus = core.buildQuestionTimeFocus({...base,question:'8月18日至19日出差如何'}, target);
    const aug18 = focus.legacyShadow.keyNodes.find((item) => item.dateText === '2026/8/18');
    const sanHeFacts = aug18?.facts.filter((fact) => fact.includes('三合待实·出空')) || [];
    assertEqual(sanHeFacts.length, 1, '重复三合待实出空只显示一次');
    if (!aug18?.facts.some((fact) => fact.includes('静爻逢冲·日破')) || !aug18?.facts.some((fact) => fact.includes('目标日克制'))) {
        throw new Error(`重复三合事实仍挤占其他关键事实：${JSON.stringify(aug18)}`);
    }
});



test('v13.44.0-alpha.3 TimeFact 事实层覆盖实际目标日事件且不携带旧效力字段', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const factApi = context.GuiJia.liuyaoTimeFacts;
    const target = {position:1,label:'初爻',relation:'妻财',branch:'辰',element:'土',moving:false,isShi:true,statusTags:[],moveTags:[]};
    const base = {
        castTimestamp:new Date(2026,7,10,20,0,0).getTime(), daySect:2, dayXun:'甲寅', monthZhi:'申', dayZhi:'辰', lines:[target],
        fullStructure:{sanHe:{completeDetails:[],pendingDetails:[],deferredDetails:[]}},
        useGodSelection:{mode:'suggestion',focusId:'travel',target:'世'}
    };
    const dayFacts = core.buildTimeFactsForDay(base, target, new Date(2026,7,15,12,0,0), 2);
    if (!dayFacts.some((fact) => fact.components.some((component) => component.family === 'branch-relation' && component.relation === 'harmony'))) {
        throw new Error(`TimeFact 未保留辰酉六合事实：${JSON.stringify(dayFacts)}`);
    }
    if (!dayFacts.some((fact) => fact.components.some((component) => component.family === 'element-relation' && component.relation === 'observer-generates-day'))) {
        throw new Error(`TimeFact 未保留辰土生酉金事实：${JSON.stringify(dayFacts)}`);
    }
    dayFacts.forEach((fact) => {
        const errors = factApi.validateTimeFact(fact);
        if (errors.length) throw new Error(`TimeFact 混入旧效力字段：${JSON.stringify({fact,errors})}`);
    });
});


test('v13.44.0-alpha.3 TimeEffect 在真实目标日把六合与泄力、六合与受制分开', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const effectApi = context.GuiJia.liuyaoTimeEffects;
    const emptySanHe = {completeDetails:[],pendingDetails:[],deferredDetails:[]};

    const chenTarget = {position:1,label:'初爻',relation:'妻财',branch:'辰',element:'土',moving:false,isShi:true,statusTags:[],moveTags:[]};
    const chenBase = {
        castTimestamp:new Date(2026,7,10,20,0,0).getTime(), daySect:2, dayXun:'甲寅', monthZhi:'申', dayZhi:'辰', lines:[chenTarget],
        fullStructure:{sanHe:emptySanHe}, useGodSelection:{mode:'suggestion',focusId:'travel',target:'世'}
    };
    const aug15Effects = core.buildTimeEffectsForDay(chenBase, chenTarget, new Date(2026,7,15,12,0,0), 2);
    const harmony = aug15Effects.find((item) => item.sourceFactCode === 'TARGET_HARMONY');
    const outflow = aug15Effects.find((item) => item.sourceFactCode === 'TARGET_DAY_DRAIN');
    if (!harmony || !effectApi.hasKind(harmony, 'trigger') || effectApi.hasKind(harmony, 'support') || effectApi.hasKind(harmony, 'constraint')) {
        throw new Error(`辰酉六合被错误映射为生扶/受制：${JSON.stringify(harmony)}`);
    }
    if (!outflow || !effectApi.hasKind(outflow, 'outflow') || effectApi.hasKind(outflow, 'constraint')) {
        throw new Error(`辰土生酉金未独立映射为泄力：${JSON.stringify(outflow)}`);
    }

    const ziTarget = {position:1,label:'初爻',relation:'父母',branch:'子',element:'水',moving:false,isShi:true,statusTags:[],moveTags:[]};
    const ziBase = {
        castTimestamp:new Date(2026,7,10,20,0,0).getTime(), daySect:2, dayXun:'甲寅', monthZhi:'申', dayZhi:'辰', lines:[ziTarget],
        fullStructure:{sanHe:{completeDetails:[],pendingDetails:[],deferredDetails:[]}}, useGodSelection:{mode:'suggestion',focusId:'travel',target:'世'}
    };
    const aug19Effects = core.buildTimeEffectsForDay(ziBase, ziTarget, new Date(2026,7,19,12,0,0), 2);
    const ziHarmony = aug19Effects.find((item) => item.sourceFactCode === 'TARGET_HARMONY');
    const constraint = aug19Effects.find((item) => item.sourceFactCode === 'TARGET_DAY_CONTROL');
    if (!ziHarmony || !effectApi.hasKind(ziHarmony, 'trigger') || effectApi.hasKind(ziHarmony, 'support')) {
        throw new Error(`子丑六合被错误映射为生扶：${JSON.stringify(ziHarmony)}`);
    }
    if (!constraint || !effectApi.hasKind(constraint, 'constraint')) {
        throw new Error(`丑土克子水未独立映射为受制：${JSON.stringify(constraint)}`);
    }
});


test('v13.44.0-alpha.3 Node Assessment 将六合与受制／泄力分维聚合', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const base = { monthZhi:'申', dayZhi:'辰', dayXun:'甲寅', xunKong:'子丑', daySect:2, fullStructure:{sanHe:{pendingDetails:[],deferredDetails:[],completeDetails:[]}} };

    const zi = { position:1, label:'初爻', relation:'父母', branch:'子', element:'水', moving:false, isShi:true, isYing:false, statusTags:[], moveTags:[] };
    const ziAssessment = core.buildTimeAssessmentForDay({ ...base, lines:[zi] }, zi, new Date(2026,7,19,12,0,0), 2);
    assertEqual(ziAssessment.summary.text, '触发伴随受制', '子水逢丑日应同时保留六合触发与土克水受制');
    if (ziAssessment.activeKinds.includes('support')) throw new Error(`子丑六合不应制造生扶：${JSON.stringify(ziAssessment)}`);

    const chen = { position:1, label:'初爻', relation:'兄弟', branch:'辰', element:'土', moving:false, isShi:true, isYing:false, statusTags:[], moveTags:[] };
    const chenAssessment = core.buildTimeAssessmentForDay({ ...base, lines:[chen] }, chen, new Date(2026,7,15,12,0,0), 2);
    assertEqual(chenAssessment.summary.text, '触发伴随泄力', '辰土逢酉日应同时保留六合触发与土生金泄力');
    if (chenAssessment.activeKinds.includes('constraint')) throw new Error(`泄力不应折算受制：${JSON.stringify(chenAssessment)}`);
});


test('v13.44.0-alpha.4 Evidence Selector 结构化去重并覆盖全部摘要维度', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const evidenceApi = context.GuiJia.liuyaoTimeEvidence;
    const target = {
        position:1, label:'初爻', relation:'父母', branch:'子', element:'水', moving:false,
        isShi:true, isYing:false,
        statusTags:[{code:'VOID', text:'旬空', type:'constraint'}], moveTags:[]
    };
    const base = {
        monthZhi:'申', dayZhi:'辰', dayXun:'甲寅', xunKong:'子丑', daySect:2, lines:[target],
        fullStructure:{sanHe:{pendingDetails:[],deferredDetails:[],completeDetails:[]}}
    };
    const assessment = core.buildTimeAssessmentForDay(base, target, new Date(2026,7,18,12,0,0), 2);
    const evidence = core.buildTimeEvidenceForDay(base, target, new Date(2026,7,18,12,0,0), 2, 3);
    const errors = evidenceApi.validateEvidenceBundle(evidence, assessment);
    if (errors.length) throw new Error(`Evidence bundle 无效：${JSON.stringify(errors)}`);
    if (evidence.uncoveredKinds.length) throw new Error(`摘要维度未被证据覆盖：${JSON.stringify(evidence)}`);
    const compound = evidence.selected.find((item) => item.memberEventCodes?.includes('TARGET_VOID_OUT') && item.memberEventCodes?.includes('TARGET_VALUE'));
    if (!compound) throw new Error(`观察爻出空 + 逢值未合成复合证据：${JSON.stringify(evidence)}`);
    if (evidence.selected.some((item) => ['TARGET_VOID_OUT','TARGET_VALUE'].includes(item.eventCode))) {
        throw new Error(`复合证据与其原子子事件同时入选：${JSON.stringify(evidence.selected)}`);
    }
});


test('v13.44.0-beta.1 Time v2 正式字段与 Candidate 镜像一致并保留 legacyShadow', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const target = { position:1, label:'初爻', relation:'子孙', branch:'辰', element:'土', moving:false, isShi:true, isYing:false, statusTags:[], moveTags:[] };
    const result = {
        question:'8月15日至20日出差如何', castTimestamp:new Date(2026,7,10,20,0,0).getTime(), daySect:2,
        monthZhi:'申', dayZhi:'辰', dayXun:'甲寅', xunKong:'子丑', lines:[target],
        fullStructure:{sanHe:{pendingDetails:[],deferredDetails:[],completeDetails:[]}},
        useGodSelection:{mode:'suggestion',focusId:'travel',target:'世'}
    };
    const focus = core.buildQuestionTimeFocus(result, target);
    const production = focus?.keyNodes.find((item) => item.dateText === '2026/8/15');
    const candidate = focus?.candidateOutput?.keyNodes.find((item) => item.dateText === '2026/8/15');
    const legacy = focus?.legacyShadow?.keyNodes.find((item) => item.dateText === '2026/8/15');
    if (!production || !candidate || !legacy) throw new Error(`beta.1 目标节点或影子节点缺失：${JSON.stringify(focus)}`);
    assertEqual(production.effectSummary, '触发伴随泄力', 'production 未采用六维摘要');
    if (JSON.stringify(production) !== JSON.stringify(candidate)) throw new Error(`production 与 Candidate 镜像不一致：${JSON.stringify({production,candidate})}`);
    if (!production.facts.some((fact) => fact.includes('观察爻泄力'))) throw new Error(`production 缺少角色化泄力证据：${JSON.stringify(production)}`);
    if (!legacy.facts.some((fact) => fact.includes('目标日泄力'))) throw new Error(`legacyShadow 未保留旧显示事实：${JSON.stringify(legacy)}`);
});

test('v13.44.0-alpha.7 日期选择使用非补偿受制门槛与 Pareto 前沿', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const selectionApi = context.GuiJia.liuyaoTimeSelection;
    const target = { position:1, label:'初爻', relation:'子孙', branch:'辰', element:'土', moving:false, isShi:true, isYing:false, statusTags:[], moveTags:[] };
    const result = {
        question:'这周哪天适合出行', castTimestamp:new Date(2026,7,10,20,0,0).getTime(), daySect:2,
        monthZhi:'申', dayZhi:'辰', dayXun:'甲寅', xunKong:'子丑', lines:[target],
        fullStructure:{sanHe:{pendingDetails:[],deferredDetails:[],completeDetails:[]}},
        useGodSelection:{mode:'default'}
    };
    const focus = core.buildQuestionTimeFocus(result, target);
    const dates = context.GuiJia.questionTime.expandScopeDates(focus.scope, 40);
    const allNodes = dates.map((dateObj) => ({
        dateText:`${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()}`,
        dayGanZhi:Solar.fromDate(dateObj).getLunar().getDayInGanZhi(),
        sortTime:dateObj.getTime(),
        candidateOutput:core.buildCandidateTimeOutputForDay(result, target, dateObj, 2, 3)
    }));
    const expected = selectionApi.buildDateSelectionComparison(allNodes);
    const comparison = focus?.candidateOutput?.comparison;
    if (!comparison || !expected) throw new Error(`Candidate 日期比较缺失：${JSON.stringify(focus)}`);
    if (JSON.stringify([...(comparison.preferredDates || [])].sort()) !== JSON.stringify([...(expected.preferredDates || [])].sort())) {
        throw new Error(`核心日期比较未使用 TimeSelection 前沿：${JSON.stringify({comparison,expected})}`);
    }
    const frontier = selectionApi.nondominatedFrontier(allNodes);
    const hasNoConstraint = allNodes.some((node) => !selectionApi.materialSelectionProfile(selectionApi.profileFromNode(node)).constraint);
    if (hasNoConstraint && frontier.some((node) => selectionApi.materialSelectionProfile(selectionApi.profileFromNode(node)).constraint)) {
        throw new Error(`受制日仍进入第一前沿：${JSON.stringify(frontier)}`);
    }
});


test('v13.44.0-beta.1 复制分析上下文读取新 production 时间字段，legacy 只保留影子对照', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-time-review.js','js/liuyao-core.js','js/liuyao-interpretation.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const interpretationApi = context.GuiJia.liuyaoInterpretation;
    const target = { type:'line', position:1, label:'初爻', relation:'子孙', branch:'辰', element:'土', moving:false, isShi:true, isYing:false, sourceText:'本卦明爻', statusTags:[], moveTags:[] };
    const result = {
        question:'这周哪天适合出行', solarText:'2026年8月10日 20:25', lunarText:'丙午年 六月廿八 戌时', monthGanZhi:'丙申', monthZhi:'申', dayGanZhi:'丙辰', dayZhi:'辰', dayChangeLabel:'24:00 换日（默认）', xunKong:'子丑',
        original:{symbol:'䷷',name:'旅',number:56}, changed:{symbol:'',name:'',number:0}, palace:{palace:'离',stage:'一世',element:'火'}, movingText:'静卦（无动爻）',
        lines:[target], displayLines:[target], flyingHidden:[], fullStructure:{originalNature:'非六冲六合卦',changedNature:'非六冲六合卦',shiYing:{tags:[],text:'—'},sanHe:{complete:[],deferred:[],pending:[]},fanFu:[]},
        useGodSelection:{mode:'suggestion',focusId:'travel',target:'世'}
    };
    const focus = {
        kind:'range', outputModel:'time-v2', title:'这周 · 2026/8/10 ～ 2026/8/16', modeLabel:'日期比较', note:'beta 回归',
        comparison:{summary:'新模型比较结果'},
        keyNodes:[{title:'2026/8/14 · 庚申日',effectSummary:'触发中见生扶',assessment:{text:'偏有利：目标日生扶'},facts:['观察爻受生：申金生扶主要观察爻']}],
        candidateOutput:{
            comparison:{summary:'新模型比较结果'},
            keyNodes:[{title:'2026/8/14 · 庚申日',effectSummary:'触发中见生扶',assessment:{text:'偏有利：目标日生扶'},facts:['观察爻受生：申金生扶主要观察爻'],effectKinds:['trigger','support']}]
        },
        legacyShadow:{
            comparison:{summary:'旧影子比较结果'},
            keyNodes:[{title:'2026/8/11 · 丁巳日',effectSummary:'旧影子节点效力',assessment:{text:'旧影子日期判断'},facts:['旧影子事实：A']}]
        }
    };
    const text = interpretationApi.buildLiuYaoContextText(result, target, null, {judgments:[]}, [], [], focus);
    if (!text.includes('新模型比较结果') || !text.includes('触发中见生扶') || !text.includes('观察爻受生')) throw new Error(`新 production 时间字段未进入复制上下文：${text}`);
    if (text.includes('旧影子比较结果') || text.includes('旧影子节点效力') || text.includes('旧影子事实：A')) throw new Error(`legacy shadow 泄漏进复制上下文：${text}`);
});

test('v13.44.0-beta.1 Time Review 在正式切换后仍以 legacyShadow 对照 production', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-time-review.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const reviewApi = context.GuiJia.liuyaoTimeReview;
    const focus = {
        kind:'range', outputModel:'time-v2', comparison:{status:'preferred',preferredDates:['2026/8/14'],summary:'新'},
        keyNodes:[{dateText:'2026/8/14',title:'新',effectSummary:'触发中见生扶',facts:['新事实']}],
        legacyShadow:{comparison:{status:'preferred',preferredDates:['2026/8/11'],summary:'旧'},keyNodes:[{dateText:'2026/8/11',title:'旧',effectSummary:'旧效力',facts:['旧事实']}]},
        candidateOutput:{comparison:{status:'preferred',preferredDates:['2026/8/14'],summary:'新'},keyNodes:[]}
    };
    const review = reviewApi.buildQuestionTimeReview(focus);
    if (review?.comparison?.kind !== 'preferred-date-changed') throw new Error(`beta shadow 对照失效：${JSON.stringify(review)}`);
    if (!review.nodes.some((item) => item.selection === 'legacy-only') || !review.nodes.some((item) => item.selection === 'candidate-only')) throw new Error(`beta shadow 节点差异未保留：${JSON.stringify(review)}`);
});

test('v13.44.0-beta.2 复制分析上下文不会给已带句号的时间文案重复补句号', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-time-review.js','js/liuyao-core.js','js/liuyao-interpretation.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const interpretationApi = context.GuiJia.liuyaoInterpretation;
    const target = { type:'line', position:1, label:'初爻', relation:'父母', branch:'亥', element:'水', moving:false, isShi:true, isYing:false, sourceText:'本卦明爻', statusTags:[], moveTags:[] };
    const result = {
        question:'这周哪天适合签合同', solarText:'2026年8月11日 14:43', lunarText:'丙午年 六月廿九 未时', monthGanZhi:'丙申', monthZhi:'申', dayGanZhi:'丁巳', dayZhi:'巳', dayChangeLabel:'24:00 换日（默认）', xunKong:'子丑',
        original:{symbol:'䷛',name:'大过',number:28}, changed:{symbol:'',name:'',number:0}, palace:{palace:'震',stage:'游魂',element:'木'}, movingText:'静卦（无动爻）',
        lines:[target], displayLines:[target], flyingHidden:[], fullStructure:{originalNature:'非六冲六合卦',changedNature:'非六冲六合卦',shiYing:{tags:[],text:'—'},sanHe:{complete:[],deferred:[],pending:[]},fanFu:[]},
        useGodSelection:{mode:'suggestion',target:'父母',candidateCount:1,specificity:'single',categoryConfidence:'high'}
    };
    const focus = {
        kind:'range', outputModel:'time-v2', title:'这周 · 2026/8/11 ～ 2026/8/16', modeLabel:'日期比较', note:'beta.2 回归',
        comparison:{summary:'较值得比较：2026/8/14 庚申日、2026/8/15 辛酉日；当前条件接近，暂不强行排出单一优先日。'},
        keyNodes:[{title:'2026/8/14 · 庚申日',effectSummary:'对主要观察爻有生扶',assessment:{text:'偏有利：目标日生扶。'},facts:['目标日生扶：【申】金生扶二爻父母亥水']}]
    };
    const text = interpretationApi.buildLiuYaoContextText(result, target, null, {judgments:[]}, [], [], focus);
    if (text.includes('。。')) throw new Error(`复制上下文仍存在重复句号：${text}`);
    if (!text.includes('日期判断：偏有利：目标日生扶。')) throw new Error(`日期判断句号被错误移除：${text}`);
});



test('v13.44.0-beta.3 主要观察爻之变通过 Structural Relevance 进入过程关键节点', () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    const core = context.GuiJia.liuyaoCore;
    const target = {
        position:5, label:'五爻', relation:'妻财', branch:'戌', element:'土', moving:true,
        changedRelation:'父母', changedBranch:'亥', changedElement:'水',
        isShi:true, isYing:false, statusTags:[], moveTags:[]
    };
    const result = {
        question:'8月15日至20日出差如何',
        castTimestamp:new Date(2026,7,11,14,43,0).getTime(), daySect:2,
        monthZhi:'申', dayZhi:'巳', dayXun:'甲寅', xunKong:'子丑',
        lines:[target],
        fullStructure:{sanHe:{completeDetails:[],deferredDetails:[],pendingDetails:[]}},
        useGodSelection:{mode:'question',focusId:'travel',target:'世'}
    };
    const focus = core.buildQuestionTimeFocus(result, target);
    if (focus?.mode !== 'process-evaluation') throw new Error(`过程模式异常：${JSON.stringify(focus)}`);
    const changedValue = (focus?.keyNodes || []).find((item) => item.dateText === '2026/8/17');
    if (!changedValue) throw new Error(`观察爻戌土化亥水，亥日未进入过程关键节点：${JSON.stringify(focus?.keyNodes)}`);
    if (!(changedValue.facts || []).some((fact) => fact.includes('变爻逢值'))) throw new Error(`亥日节点缺少观察爻之变逢值证据：${JSON.stringify(changedValue)}`);
});


test('v13.44.0-rc.2 · 23:40 在 24:00 换日下仍属子时，日辰不提前换', () => {
    const context = { console, Date, Math, JSON, Intl };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/common.js'), 'utf8'), context, { filename:'js/common.js' });
    const common = context.GuiJia.common;
    const cases = [
        [new Date(2026,7,11,22,59,0), '亥'],
        [new Date(2026,7,11,23,0,0), '子'],
        [new Date(2026,7,11,23,40,0), '子'],
        [new Date(2026,7,11,23,59,0), '子'],
        [new Date(2026,7,12,0,0,0), '子'],
        [new Date(2026,7,12,0,59,0), '子'],
        [new Date(2026,7,12,1,0,0), '丑']
    ];
    cases.forEach(([dateObj, expected]) => assertEqual(common.civilTimeBranch(dateObj), expected, `民用时辰 ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2,'0')}`));

    const solar = Solar.fromYmdHms(2026, 8, 11, 23, 40, 0);
    const midnight = solar.getLunar().getEightChar();
    midnight.setSect(2);
    assertEqual(midnight.getDay(), '丁巳', '23:40 · 24:00换日仍保留当日日辰');
    assertEqual(common.civilTimeBranch(new Date(2026,7,11,23,40,0)), '子', '23:40 时支独立为子');

    const appSource = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    if (!appSource.includes('civilTimeBranch(castDate) || lunar.getTimeZhi()')) throw new Error('六爻 lunarText 未固定使用民用钟点时支，可能再次把换日口径与时辰边界混为一谈');
});

const loadRc2Core = () => {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    ['js/common.js','js/question-time.js','js/bazi-core.js','js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-core.js'].forEach((relative) => {
        vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
    });
    return context.GuiJia.liuyaoCore;
};
const rc2Tag = (code, text, type) => ({ code, text, type });
const rc2Focus = (core, lines, position, fullStructure = null) => {
    const target = core.buildUseGodChoices(lines, []).find((item) => item.position === position);
    if (!target) throw new Error(`未找到观察爻 ${position}`);
    const structure = fullStructure || { sanHe:{ completeDetails:[], deferredDetails:[], pendingDetails:[] } };
    const result = {
        question:'8月15日至20日出差如何',
        castTimestamp:new Date(2026,7,11,23,40,0).getTime(),
        daySect:2, monthZhi:'申', dayZhi:'巳', dayXun:'甲寅', xunKong:'子丑',
        lines, fullStructure:structure,
        useGodSelection:{ mode:'question', focusId:'travel', target:'世' }
    };
    return { target, focus:core.buildQuestionTimeFocus(result, target) };
};
const rc2Dates = (focus) => (focus?.keyNodes || []).map((item) => item.dateText);

test('v13.44.0-rc.2 · 实盘回归A 升：旬空世爻丑土发动化午，过程节点保持17/18/19', () => {
    const core = loadRc2Core();
    const lines = [
        {position:1,label:'初爻',relation:'妻财',branch:'丑',element:'土',moving:false,isYing:true,statusTags:[rc2Tag('VOID','旬空','void')],moveTags:[]},
        {position:2,label:'二爻',relation:'父母',branch:'亥',element:'水',moving:true,changedRelation:'子孙',changedBranch:'午',changedElement:'火',statusTags:[],moveTags:[rc2Tag('MOVING_CHANGE','动而有变','neutral')]},
        {position:3,label:'三爻',relation:'官鬼',branch:'酉',element:'金',moving:false,statusTags:[],moveTags:[]},
        {position:4,label:'四爻',relation:'妻财',branch:'丑',element:'土',moving:true,changedRelation:'子孙',changedBranch:'午',changedElement:'火',isShi:true,statusTags:[rc2Tag('VOID','旬空','void')],moveTags:[rc2Tag('RETURN_GENERATE','回头生','support')]},
        {position:5,label:'五爻',relation:'父母',branch:'亥',element:'水',moving:false,statusTags:[rc2Tag('DARK_MOVING','日冲·暗动提示','trigger')],moveTags:[]},
        {position:6,label:'上爻',relation:'官鬼',branch:'酉',element:'金',moving:false,statusTags:[],moveTags:[]}
    ];
    const { target, focus } = rc2Focus(core, lines, 4);
    assertEqual(target.changedRelation, '子孙', 'buildUseGodChoices 必须保留观察爻 changedRelation');
    const dates = rc2Dates(focus);
    ['2026/8/17','2026/8/18','2026/8/19'].forEach((dateText) => {
        if (!dates.includes(dateText)) throw new Error(`升卦真实回归漏节点 ${dateText}：${JSON.stringify(focus?.keyNodes)}`);
    });
});

test('v13.44.0-rc.2 · 实盘回归B 随：世爻辰土发动化亥，8/17 观察爻之变逢值不得漏', () => {
    const core = loadRc2Core();
    const lines = [
        {position:1,label:'初爻',relation:'父母',branch:'子',element:'水',moving:false,statusTags:[rc2Tag('VOID','旬空','void')],moveTags:[]},
        {position:2,label:'二爻',relation:'兄弟',branch:'寅',element:'木',moving:false,statusTags:[rc2Tag('MONTH_BREAK','月破','constraint')],moveTags:[]},
        {position:3,label:'三爻',relation:'妻财',branch:'辰',element:'土',moving:true,changedRelation:'父母',changedBranch:'亥',changedElement:'水',isShi:true,statusTags:[],moveTags:[rc2Tag('MOVING_CHANGE','动而有变','neutral')]},
        {position:4,label:'四爻',relation:'父母',branch:'亥',element:'水',moving:false,statusTags:[rc2Tag('DARK_MOVING','日冲·暗动提示','trigger')],moveTags:[]},
        {position:5,label:'五爻',relation:'官鬼',branch:'酉',element:'金',moving:false,statusTags:[],moveTags:[]},
        {position:6,label:'上爻',relation:'妻财',branch:'未',element:'土',moving:false,isYing:true,statusTags:[],moveTags:[]}
    ];
    const { focus } = rc2Focus(core, lines, 3);
    const node = (focus?.keyNodes || []).find((item) => item.dateText === '2026/8/17');
    if (!node) throw new Error(`随卦世爻辰土化亥水，8/17 亥日被过程筛选漏掉：${JSON.stringify(focus?.keyNodes)}`);
    if (!(node.facts || []).some((fact) => fact.includes('变爻逢值') && fact.includes('父母亥水'))) throw new Error(`8/17 未展示观察爻之变逢值的完整六亲证据：${JSON.stringify(node)}`);
    if (!String(node.effectSummary || '').includes('耗力')) throw new Error(`辰土克亥水未落为耗力：${JSON.stringify(node)}`);
});

test('v13.44.0-rc.2 · 实盘回归C 屯：静爻月破过程保持17/18/20，不因 observer-change 修复膨胀', () => {
    const core = loadRc2Core();
    const lines = [
        {position:1,label:'初爻',relation:'兄弟',branch:'子',element:'水',moving:false,statusTags:[rc2Tag('VOID','旬空','void')],moveTags:[]},
        {position:2,label:'二爻',relation:'子孙',branch:'寅',element:'木',moving:false,isShi:true,statusTags:[rc2Tag('MONTH_BREAK','月破','constraint')],moveTags:[]},
        {position:3,label:'三爻',relation:'官鬼',branch:'辰',element:'土',moving:false,statusTags:[],moveTags:[]},
        {position:4,label:'四爻',relation:'父母',branch:'申',element:'金',moving:false,statusTags:[],moveTags:[]},
        {position:5,label:'五爻',relation:'官鬼',branch:'戌',element:'土',moving:false,isYing:true,statusTags:[],moveTags:[]},
        {position:6,label:'上爻',relation:'兄弟',branch:'子',element:'水',moving:false,statusTags:[rc2Tag('VOID','旬空','void')],moveTags:[]}
    ];
    const { focus } = rc2Focus(core, lines, 2);
    const dates = rc2Dates(focus);
    ['2026/8/17','2026/8/18','2026/8/20'].forEach((dateText) => {
        if (!dates.includes(dateText)) throw new Error(`屯卦静态正向回归漏节点 ${dateText}：${JSON.stringify(focus?.keyNodes)}`);
    });
    if (dates.length > 4) throw new Error(`屯卦过程节点膨胀：${JSON.stringify(dates)}`);
});

test('v13.44.0-rc.2 · 实盘回归D 晋：三合与化空竞争下，8/20 观察爻之变六冲必须进入前4', () => {
    const core = loadRc2Core();
    const lines = [
        {position:1,label:'初爻',relation:'父母',branch:'未',element:'土',moving:true,changedRelation:'子孙',changedBranch:'子',changedElement:'水',isYing:true,statusTags:[],moveTags:[rc2Tag('TRANSFORM_PROSPER','化帝旺','support'),rc2Tag('TRANSFORM_VOID','化空','void')]},
        {position:2,label:'二爻',relation:'官鬼',branch:'巳',element:'火',moving:true,changedRelation:'妻财',changedBranch:'寅',changedElement:'木',statusTags:[],moveTags:[rc2Tag('RETURN_GENERATE','回头生','support'),rc2Tag('TRANSFORM_GROWTH','化长生','support'),rc2Tag('TRANSFORM_MONTH_BREAK','化月破','constraint')]},
        {position:3,label:'三爻',relation:'妻财',branch:'卯',element:'木',moving:true,changedRelation:'父母',changedBranch:'辰',changedElement:'土',statusTags:[],moveTags:[rc2Tag('MOVING_CHANGE','动而有变','neutral')]},
        {position:4,label:'四爻',relation:'兄弟',branch:'酉',element:'金',moving:true,changedRelation:'兄弟',changedBranch:'申',changedElement:'金',isShi:true,statusTags:[],moveTags:[rc2Tag('TRANSFORM_PEER','比和','transform'),rc2Tag('RETREAT','化退神','constraint')]},
        {position:5,label:'五爻',relation:'父母',branch:'未',element:'土',moving:true,changedRelation:'父母',changedBranch:'戌',changedElement:'土',statusTags:[],moveTags:[rc2Tag('TRANSFORM_PEER','比和','transform'),rc2Tag('PROGRESS','化进神','support')]},
        {position:6,label:'上爻',relation:'官鬼',branch:'巳',element:'火',moving:true,changedRelation:'子孙',changedBranch:'子',changedElement:'水',statusTags:[],moveTags:[rc2Tag('RETURN_CONTROL','回头克','constraint'),rc2Tag('TRANSFORM_VOID','化空','void')]}
    ];
    const sanHe = core.buildMovingSanHe(lines, '申', '巳');
    const { focus } = rc2Focus(core, lines, 4, { sanHe });
    const dates = rc2Dates(focus);
    if (!dates.includes('2026/8/20')) throw new Error(`晋卦 top-4 在三合/化空竞争下挤掉观察爻之变六冲：${JSON.stringify(focus?.keyNodes)}`);
    if (dates.includes('2026/8/18')) throw new Error(`晋卦低相关变爻出空仍压过 8/20 observer-change：${JSON.stringify(focus?.keyNodes)}`);
    const node = (focus?.keyNodes || []).find((item) => item.dateText === '2026/8/20');
    if (!String(node?.effectSummary || '').includes('耗力')) throw new Error(`晋卦 8/20 未保留观察爻耗力：${JSON.stringify(node)}`);
});

console.log(`\n${passed} lunar integration passed, ${failed} failed`);
if (failed) process.exit(1);
