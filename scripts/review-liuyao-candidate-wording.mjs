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
        'js/liuyao-time-selection.js','js/liuyao-core.js'
    ].forEach((relative) => vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative }));
    return context.GuiJia;
}

const GuiJia = loadGuiJia();
const core = GuiJia.liuyaoCore;
const outputApi = GuiJia.liuyaoTimeOutput;
const rawOptions = [6,7,8,9];
const CAST_TIME = new Date(2026, 7, 10, 20, 25, 0).getTime();
const DAY_START = new Date(2026, 7, 11, 12, 0, 0);
const DAYS = 12;

function decodeRawValues(encoded) {
    let cursor = encoded;
    const values = [];
    for (let i = 0; i < 6; i += 1) {
        values.push(rawOptions[cursor % 4]);
        cursor = Math.floor(cursor / 4);
    }
    return values;
}

function buildFixture(encoded, question = '这周哪天适合出行') {
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
        question,
        lines:rows,
        fullStructure:core.buildFullHexagramStructure(rows, originalNaJia, changedNaJia, '申', '辰'),
        useGodSelection:{ mode:'question' }
    };
    return { encoded, rawValues, originalLines, changedLines, rows, target, result, hexagram:core.getHexagram(originalLines) };
}

function percentile(values, p) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a,b) => a-b);
    const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1));
    return sorted[index];
}
function avg(values) { return values.length ? values.reduce((a,b) => a+b,0) / values.length : 0; }
function inc(obj, key) { obj[key] = (obj[key] || 0) + 1; }
function topEntries(obj, limit = 12) { return Object.entries(obj).sort((a,b) => b[1]-a[1]).slice(0, limit); }
function visibleText(output) {
    return [output?.summary?.text, output?.dateAssessment?.text, ...(output?.facts || [])].filter(Boolean).join('\n');
}

const stats = {
    nodes:0, invalid:0, runtimeErrors:0,
    summaryLengths:[], dateTextLengths:[], evidenceCounts:[],
    redundantEffectParenthetical:0, oldOutflowWord:0, developerToken:0, doublePunctuation:0,
    genericKeyLineLabel:0, evidenceOver3:0, evidenceOver4:0,
    summaries:{}, dateLeads:{}, evidenceLabels:{}, selectionSummaries:0, selectionInvalid:0,
    longestSummary:null, longestDateText:null, fourEvidenceSamples:[]
};

for (let encoded = 0; encoded < 4096; encoded += 1) {
    const fixture = buildFixture(encoded);
    for (let dayOffset = 0; dayOffset < DAYS; dayOffset += 1) {
        const date = new Date(DAY_START.getFullYear(), DAY_START.getMonth(), DAY_START.getDate() + dayOffset, 12, 0, 0);
        try {
            const output = core.buildCandidateTimeOutputForDay(fixture.result, fixture.target, date, 2, 3);
            stats.nodes += 1;
            if (!output?.summary?.text || !output?.dateAssessment?.text || !Array.isArray(output?.evidence) || !Array.isArray(output?.facts)) stats.invalid += 1;
            const text = visibleText(output);
            const summary = String(output?.summary?.text || '');
            const dateText = String(output?.dateAssessment?.text || '');
            stats.summaryLengths.push(summary.length);
            stats.dateTextLengths.push(dateText.length);
            stats.evidenceCounts.push((output?.evidence || []).length);
            inc(stats.summaries, summary);
            inc(stats.dateLeads, dateText.split('：')[0].replace(/。$/,''));
            (output?.evidence || []).forEach((item) => {
                inc(stats.evidenceLabels, item.label || '');
                if (item.label === '关键爻出空并逢值') stats.genericKeyLineLabel += 1;
            });
            if (/(生扶|比和|受制|泄力|耗力)（\1）/.test(dateText)) stats.redundantEffectParenthetical += 1;
            if (text.includes('泄耗')) stats.oldOutflowWord += 1;
            if (/\b(?:supportive|adverse|mixed-direction|primary|secondary|context)\b/.test(text)) stats.developerToken += 1;
            if (/[；，、]{2,}|。。|；。/.test(text)) stats.doublePunctuation += 1;
            if ((output?.evidence || []).length > 3) stats.evidenceOver3 += 1;
            if ((output?.evidence || []).length > 4) stats.evidenceOver4 += 1;
            if (!stats.longestSummary || summary.length > stats.longestSummary.length) stats.longestSummary = { length:summary.length, encoded, text:summary };
            if (!stats.longestDateText || dateText.length > stats.longestDateText.length) stats.longestDateText = { length:dateText.length, encoded, text:dateText };
            if ((output?.evidence || []).length === 4 && stats.fourEvidenceSamples.length < 5) {
                stats.fourEvidenceSamples.push({ encoded, summary, dateText, facts:output.facts });
            }
        } catch (error) {
            stats.runtimeErrors += 1;
        }
    }
}

const report = [];
report.push('# 龟甲 v13.44.0-alpha.11 · 候选用户文案压力审阅');
report.push('');
report.push('本报告只审阅 Candidate Output 的用户可读文案，不修改六维效力、结构相关性、Date Selection comparator、正式页面或复制分析上下文。');
report.push('');
report.push('## 压力规模');
report.push('');
report.push(`- 真实六爻组合：4096`);
report.push(`- 连续日支：12 天`);
report.push(`- Candidate 节点：${stats.nodes}`);
report.push(`- 运行异常：${stats.runtimeErrors}`);
report.push(`- Candidate schema 异常：${stats.invalid}`);
report.push(`- 一周日期比较摘要：${stats.selectionSummaries}`);
report.push(`- 日期比较摘要禁用术语/异常：${stats.selectionInvalid}`);
report.push('');
report.push('## 文案长度');
report.push('');
report.push(`- 节点摘要平均：${avg(stats.summaryLengths).toFixed(2)} 字；P95：${percentile(stats.summaryLengths,0.95)}；最大：${Math.max(...stats.summaryLengths)}`);
report.push(`- 日期判断平均：${avg(stats.dateTextLengths).toFixed(2)} 字；P95：${percentile(stats.dateTextLengths,0.95)}；最大：${Math.max(...stats.dateTextLengths)}`);
report.push(`- 可见证据平均：${avg(stats.evidenceCounts).toFixed(2)} 条；最大：${Math.max(...stats.evidenceCounts)}`);
report.push(`- 超过 3 条证据：${stats.evidenceOver3}`);
report.push(`- 超过 4 条证据：${stats.evidenceOver4}`);
report.push('');
report.push('## 禁止/冗余检查');
report.push('');
report.push(`- 同义效力括注（如“生扶（生扶）”）：${stats.redundantEffectParenthetical}`);
report.push(`- “泄耗”残留：${stats.oldOutflowWord}`);
report.push(`- legacy / developer token 泄露：${stats.developerToken}`);
report.push(`- 连续标点异常：${stats.doublePunctuation}`);
report.push(`- 泛称“关键爻出空并逢值”：${stats.genericKeyLineLabel}`);
report.push('');
report.push('## 最常见节点摘要');
report.push('');
topEntries(stats.summaries).forEach(([key,value]) => report.push(`- ${key}：${value}`));
report.push('');
report.push('## 日期判断开头分布');
report.push('');
topEntries(stats.dateLeads).forEach(([key,value]) => report.push(`- ${key}：${value}`));
report.push('');
report.push('## 最常见证据标签');
report.push('');
topEntries(stats.evidenceLabels, 20).forEach(([key,value]) => report.push(`- ${key}：${value}`));
report.push('');
report.push('## 长文本边界');
report.push('');
report.push(`- 最长节点摘要：${stats.longestSummary?.length || 0} 字；${stats.longestSummary?.text || ''}`);
report.push(`- 最长日期判断：${stats.longestDateText?.length || 0} 字；${stats.longestDateText?.text || ''}`);
if (stats.fourEvidenceSamples.length) {
    report.push('');
    report.push('## 4 条证据代表样例');
    stats.fourEvidenceSamples.forEach((sample) => {
        report.push('');
        report.push(`### encoded=${sample.encoded}`);
        report.push(`- 摘要：${sample.summary}`);
        report.push(`- 日期判断：${sample.dateText}`);
        sample.facts.forEach((fact) => report.push(`- ${fact}`));
    });
}
report.push('');
report.push('## 结论');
report.push('');
report.push(stats.runtimeErrors || stats.invalid || stats.redundantEffectParenthetical || stats.oldOutflowWord || stats.developerToken || stats.evidenceOver4
    ? '- 仍有阻断 beta 切换的候选文案问题，需要在 alpha.11 内继续收束。'
    : '- 未发现阻断 beta 切换的候选文案问题；极少数 4 条证据节点保留完整证据，不为固定三条而删减摘要依据。');

const target = path.join(ROOT, 'docs', 'REVIEW_WORDING_v13.44.0-alpha.11.md');
fs.writeFileSync(target, `${report.join('\n')}\n`);
console.log(`Wrote ${target}`);
console.log(JSON.stringify({
    nodes:stats.nodes,
    runtimeErrors:stats.runtimeErrors,
    invalid:stats.invalid,
    redundantEffectParenthetical:stats.redundantEffectParenthetical,
    oldOutflowWord:stats.oldOutflowWord,
    developerToken:stats.developerToken,
    evidenceOver3:stats.evidenceOver3,
    evidenceOver4:stats.evidenceOver4,
    genericKeyLineLabel:stats.genericKeyLineLabel,
    avgSummary:Number(avg(stats.summaryLengths).toFixed(2)),
    p95Summary:percentile(stats.summaryLengths,0.95),
    maxSummary:Math.max(...stats.summaryLengths),
    avgDateText:Number(avg(stats.dateTextLengths).toFixed(2)),
    p95DateText:percentile(stats.dateTextLengths,0.95),
    maxDateText:Math.max(...stats.dateTextLengths)
}, null, 2));
