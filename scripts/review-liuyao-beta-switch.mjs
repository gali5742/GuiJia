#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { createRequire } from 'module';

process.env.TZ = 'Asia/Tokyo';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { Solar } = require(path.join(ROOT, 'vendor', 'lunar.js'));

function loadGuiJia() {
    const context = { console, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    [
        'js/common.js','js/question-time.js','js/bazi-core.js',
        'js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js',
        'js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js',
        'js/liuyao-time-selection.js','js/liuyao-time-review.js','js/liuyao-core.js'
    ].forEach((relative) => vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative }));
    return context.GuiJia;
}

const GuiJia = loadGuiJia();
const core = GuiJia.liuyaoCore;
const reviewApi = GuiJia.liuyaoTimeReview;
const rawOptions = [6,7,8,9];
const CAST_TIME = new Date(2026, 7, 10, 20, 25, 0).getTime();

function decodeRawValues(encoded) {
    let cursor = encoded;
    const values = [];
    for (let i = 0; i < 6; i += 1) {
        values.push(rawOptions[cursor % 4]);
        cursor = Math.floor(cursor / 4);
    }
    return values;
}

function buildFixture(encoded) {
    const rawValues = decodeRawValues(encoded);
    const originalLines = rawValues.map((value) => value === 7 || value === 9);
    const moving = rawValues.map((value) => value === 6 || value === 9);
    const changedLines = originalLines.map((value, index) => moving[index] ? !value : value);
    const palace = core.liuyaoPalaceMap[core.lineKey(originalLines)];
    const originalNaJia = core.naJiaForLines(originalLines);
    const changedNaJia = core.naJiaForLines(changedLines);
    let rows = rawValues.map((value, index) => ({
        position:index + 1,
        label:['初爻','二爻','三爻','四爻','五爻','上爻'][index],
        relation:core.sixRelation(originalNaJia[index].element, palace.element),
        stem:originalNaJia[index].stem,
        branch:originalNaJia[index].branch,
        element:originalNaJia[index].element,
        naJia:originalNaJia[index].text,
        moving:moving[index],
        changedRelation:core.sixRelation(changedNaJia[index].element, palace.element),
        changedBranch:changedNaJia[index].branch,
        changedElement:changedNaJia[index].element,
        statusTags:[], moveTags:[],
        isShi:palace.shi === index + 1,
        isYing:palace.ying === index + 1
    }));
    rows = rows.map((line) => ({ ...line, statusTags:core.buildLiuYaoLineStatus(line, '申', '辰', '子丑', line.moving).tags }));
    rows = rows.map((line) => line.moving
        ? ({ ...line, moveTags:core.buildMoveAnalysis(line, { branch:line.changedBranch, element:line.changedElement }, '申', '子丑') })
        : line);
    const target = rows.find((line) => line.isShi);
    const result = {
        castTimestamp:CAST_TIME,
        daySect:2,
        dayXun:'甲寅',
        xunKong:'子丑',
        monthZhi:'申',
        dayZhi:'辰',
        question:'',
        lines:rows,
        fullStructure:core.buildFullHexagramStructure(rows, originalNaJia, changedNaJia, '申', '辰'),
        useGodSelection:{ mode:'question', focusId:'travel', target:'世' }
    };
    return { target, result };
}

const scenarios = [
    { id:'range-process', question:'8月15日至20日出差如何', nodeKey:'keyNodes' },
    { id:'range-selection', question:'这周哪天适合出行', nodeKey:'keyNodes' },
    { id:'alternatives', question:'明天还是周五哪个好', nodeKey:'entries' }
];

const stats = Object.fromEntries(scenarios.map((scenario) => [scenario.id, {
    runs:0, missingFocus:0, wrongModel:0, missingShadow:0, productionCandidateMismatch:0,
    reviewInvalid:0, oldWord:0, developerToken:0, legacyShadowLeaks:0,
    comparisonChanged:0, nodeSetChanged:0
}]));

const stable = (value) => JSON.stringify(value ?? null);
const visibleText = (focus, nodeKey) => [
    focus?.comparison?.summary || '',
    ...((focus?.[nodeKey] || []).flatMap((entry) => [entry.effectSummary || '', entry.assessment?.text || '', ...(entry.facts || [])]))
].join('\n');

const OFFSET = Math.max(0, Math.min(4095, Number(process.env.GUIJIA_BETA_OFFSET || 0)));
const LIMIT = Math.max(1, Math.min(4096 - OFFSET, Number(process.env.GUIJIA_BETA_LIMIT || (4096 - OFFSET))));
for (let encoded = OFFSET; encoded < OFFSET + LIMIT; encoded += 1) {
    const fixture = buildFixture(encoded);
    for (const scenario of scenarios) {
        const bucket = stats[scenario.id];
        bucket.runs += 1;
        const result = { ...fixture.result, question:scenario.question };
        const focus = core.buildQuestionTimeFocus(result, fixture.target);
        if (!focus) { bucket.missingFocus += 1; continue; }
        if (focus.outputModel !== 'time-v2') bucket.wrongModel += 1;
        if (!focus.legacyShadow) bucket.missingShadow += 1;
        const productionView = { comparison:focus.comparison || null, nodes:focus[scenario.nodeKey] || [] };
        const candidateView = { comparison:focus.candidateOutput?.comparison || null, nodes:focus.candidateOutput?.[scenario.nodeKey] || [] };
        if (stable(productionView) !== stable(candidateView)) bucket.productionCandidateMismatch += 1;
        const review = reviewApi.buildQuestionTimeReview(focus);
        if (reviewApi.validateQuestionTimeReview(review).length) bucket.reviewInvalid += 1;
        if (!review?.comparison?.same) bucket.comparisonChanged += 1;
        if ((review?.counts?.legacyOnly || 0) || (review?.counts?.candidateOnly || 0)) bucket.nodeSetChanged += 1;
        const text = visibleText(focus, scenario.nodeKey);
        if (text.includes('泄耗')) bucket.oldWord += 1;
        if (/\b(?:supportive|adverse|mixed-direction)\b/.test(text)) bucket.developerToken += 1;
        // production 不能直接引用 shadow 对象；只检查对象不共用引用，避免后续误写联动。
        if (focus[scenario.nodeKey] === focus.legacyShadow?.[scenario.nodeKey] || (focus.comparison && focus.comparison === focus.legacyShadow?.comparison)) bucket.legacyShadowLeaks += 1;
    }
}

const totalRuns = Object.values(stats).reduce((sum, item) => sum + item.runs, 0);
const blockers = Object.values(stats).reduce((sum, item) => sum + item.missingFocus + item.wrongModel + item.missingShadow + item.productionCandidateMismatch + item.reviewInvalid + item.oldWord + item.developerToken + item.legacyShadowLeaks, 0);
const report = [];
report.push('# 龟甲 v13.44.0-beta.1 · 新时间模型正式切换压力审阅');
report.push('');
report.push('本报告验证 beta.1 的用户接口切换：页面与复制分析上下文使用 production top-level Time v2；legacy 只保留为 `legacyShadow` 供开发对照，不参与用户输出。');
report.push('');
report.push('## 压力规模');
report.push('');
report.push(`- 真实六爻组合：${LIMIT}（encoded ${OFFSET}～${OFFSET + LIMIT - 1}）`);
report.push(`- 场景：连续过程范围 / 一周日期选择 / 两日离散比较，共 3 类`);
report.push(`- 总运行：${totalRuns}`);
report.push('');
for (const scenario of scenarios) {
    const item = stats[scenario.id];
    report.push(`## ${scenario.id}`);
    report.push('');
    report.push(`- 运行：${item.runs}`);
    report.push(`- focus 缺失：${item.missingFocus}`);
    report.push(`- outputModel 非 time-v2：${item.wrongModel}`);
    report.push(`- legacyShadow 缺失：${item.missingShadow}`);
    report.push(`- production 与 Candidate 不一致：${item.productionCandidateMismatch}`);
    report.push(`- Time Review schema 异常：${item.reviewInvalid}`);
    report.push(`- “泄耗”残留：${item.oldWord}`);
    report.push(`- legacy developer token：${item.developerToken}`);
    report.push(`- production / legacyShadow 引用串联：${item.legacyShadowLeaks}`);
    report.push(`- 新旧比较结论变化（仅统计）：${item.comparisonChanged}`);
    report.push(`- 新旧关键日期集合变化（仅统计）：${item.nodeSetChanged}`);
    report.push('');
}
report.push('## 结论');
report.push('');
report.push(blockers === 0
    ? '- beta.1 正式切换阻断项为 0：production top-level 与 Candidate Output 一致，legacyShadow 可继续用于影子对照。'
    : `- 发现 ${blockers} 个切换阻断项，暂不应进入 beta 前台手测。`);

const target = path.join(ROOT, 'docs', 'REVIEW_BETA_SWITCH_v13.44.0-beta.1.md');
fs.writeFileSync(target, `${report.join('\n')}\n`);
console.log(`Wrote ${target}`);
console.log(JSON.stringify({ totalRuns, blockers, stats }, null, 2));

const chunkOut = process.env.GUIJIA_BETA_CHUNK_OUT;
if (chunkOut) {
    fs.writeFileSync(path.resolve(chunkOut), JSON.stringify({ offset:OFFSET, limit:LIMIT, totalRuns, blockers, stats }, null, 2));
}
if (blockers) process.exit(1);
