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
        'js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-time-review.js','js/liuyao-core.js'
    ].forEach((relative) => vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative }));
    return context.GuiJia;
}

const GuiJia = loadGuiJia();
const core = GuiJia.liuyaoCore;
const outputApi = GuiJia.liuyaoTimeOutput;
const selectionApi = GuiJia.liuyaoTimeSelection;
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

function buildFixture(encoded, question, selectionMode = 'question') {
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
        castTimestamp:CAST_TIME, daySect:2, dayXun:'甲寅', xunKong:'子丑', monthZhi:'申', dayZhi:'辰', question,
        lines:rows,
        fullStructure:core.buildFullHexagramStructure(rows, originalNaJia, changedNaJia, '申', '辰'),
        useGodSelection:{ mode:selectionMode }
    };
    const focus = core.buildQuestionTimeFocus(result, target);
    return { encoded, rawValues, target, result, focus, hexagram:core.getHexagram(originalLines), changedHexagram:core.getHexagram(changedLines) };
}

function candidateNodesForScope(fixture) {
    const expand = GuiJia.questionTime?.expandScopeDates;
    if (fixture.focus?.kind === 'point') {
        return (fixture.focus.entries || []).map((entry) => {
            const [y,m,d] = entry.dateText.split('/').map(Number);
            const output = core.buildCandidateTimeOutputForDay(fixture.result, fixture.target, new Date(y,m-1,d,12), 2, 3);
            return { dateText:entry.dateText, dayGanZhi:entry.dayGanZhi, sortTime:new Date(y,m-1,d,12).getTime(), candidateOutput:output };
        });
    }
    if (typeof expand !== 'function' || !fixture.focus?.scope) return [];
    return expand(fixture.focus.scope, 40).map((dateObj) => {
        const output = core.buildCandidateTimeOutputForDay(fixture.result, fixture.target, dateObj, 2, 3);
        return {
            dateText:`${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()}`,
            dayGanZhi:Solar.fromDate(dateObj).getLunar().getDayInGanZhi(),
            sortTime:dateObj.getTime(), candidateOutput:output
        };
    });
}

function sameSet(a = [], b = []) { return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort()); }
function shortProfile(node) {
    const p = selectionApi.materialSelectionProfile(selectionApi.profileFromNode(node));
    const names = {support:'生扶',peer:'比和',constraint:'受制',outflow:'泄力',exertion:'耗力'};
    const active = Object.keys(names).filter((k) => p[k]).map((k) => names[k]);
    return active.length ? active.join('、') : '无实质效力';
}

function run(question, mode) {
    const stats = {
        total:0, invalid:0, oldSame:0, oldChanged:0, single:0, tie:0,
        hardConstraintViolation:0, dominatedTop:0, maxFrontier:0, frontierSizes:{}, allConstrained:0,
        oldSingleToTie:0, oldTieToSingle:0, hardGateChanged:0
    };
    const samples = [];
    for (let encoded = 0; encoded < 4096; encoded += 1) {
        const fixture = buildFixture(encoded, question, mode);
        const nodes = candidateNodesForScope(fixture);
        if (!nodes.length) { stats.invalid += 1; continue; }
        const comparison = selectionApi.buildDateSelectionComparison(nodes);
        const errors = selectionApi.validateSelectionComparison(comparison, nodes);
        if (errors.length) { stats.invalid += 1; continue; }
        stats.total += 1;
        const frontier = selectionApi.nondominatedFrontier(nodes);
        stats.maxFrontier = Math.max(stats.maxFrontier, frontier.length);
        stats.frontierSizes[frontier.length] = (stats.frontierSizes[frontier.length] || 0) + 1;
        if (frontier.length === 1) stats.single += 1; else stats.tie += 1;
        if (nodes.every((n) => selectionApi.materialSelectionProfile(selectionApi.profileFromNode(n)).constraint)) stats.allConstrained += 1;
        const hasNoConstraint = nodes.some((n) => !selectionApi.materialSelectionProfile(selectionApi.profileFromNode(n)).constraint);
        if (hasNoConstraint && frontier.some((n) => selectionApi.materialSelectionProfile(selectionApi.profileFromNode(n)).constraint)) stats.hardConstraintViolation += 1;
        for (const top of frontier) {
            if (nodes.some((other) => selectionApi.paretoDominatesWithinConstraintClass(selectionApi.profileFromNode(other), selectionApi.profileFromNode(top)))) {
                stats.dominatedTop += 1;
                break;
            }
        }
        const old = outputApi.buildDateSelectionComparison(nodes);
        if (sameSet(old?.preferredDates, comparison.preferredDates)) stats.oldSame += 1;
        else {
            stats.oldChanged += 1;
            if (old?.status === 'preferred' && comparison.status === 'tie') stats.oldSingleToTie += 1;
            if (old?.status === 'tie' && comparison.status === 'preferred') stats.oldTieToSingle += 1;
            const oldTop = nodes.find((n) => n.dateText === old?.preferredDates?.[0]);
            if (oldTop && selectionApi.materialSelectionProfile(selectionApi.profileFromNode(oldTop)).constraint && hasNoConstraint) stats.hardGateChanged += 1;
            if (samples.length < 12) {
                samples.push({
                    encoded,
                    hexagram:`${fixture.hexagram.symbol}${fixture.hexagram.name}`,
                    shi:`${fixture.target.label}${fixture.target.relation}${fixture.target.branch}${fixture.target.element}`,
                    old:old?.summary || '',
                    newer:comparison.summary,
                    top:frontier.map((n) => `${n.dateText}（${shortProfile(n)}）`).join('、')
                });
            }
        }
    }
    return { stats, samples };
}

const weekly = run('这周哪天适合出行', 'question');
const alternatives = run('明天还是周五哪个好', 'default');

function pct(v, total) { return total ? `${(v * 100 / total).toFixed(2)}%` : '0%'; }
function section(title, result) {
    const s = result.stats;
    const lines = [
        `## ${title}`,
        '',
        `- 有效卦数：${s.total}`,
        `- schema/运行异常：${s.invalid}`,
        `- 新旧首选集合一致：${s.oldSame}（${pct(s.oldSame,s.total)}）`,
        `- 新旧首选集合变化：${s.oldChanged}（${pct(s.oldChanged,s.total)}）`,
        `- 新模型单一前沿：${s.single}（${pct(s.single,s.total)}）`,
        `- 新模型不可比并列：${s.tie}（${pct(s.tie,s.total)}）`,
        `- 最大非支配前沿：${s.maxFrontier} 天`,
        `- 全部候选均见受制：${s.allConstrained}`,
        `- 有无受制日期可选时仍把受制日放入第一前沿：${s.hardConstraintViolation}`,
        `- 第一前沿仍被同层其他日期 Pareto 支配：${s.dominatedTop}`,
        `- 旧单选 → 新并列：${s.oldSingleToTie}`,
        `- 旧并列 → 新单选：${s.oldTieToSingle}`,
        `- 因硬受制门槛移除旧首选：${s.hardGateChanged}`,
        '',
        '### 前沿大小分布',
        ...Object.entries(s.frontierSizes).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k,v]) => `- ${k} 天：${v}（${pct(v,s.total)}）`),
        '',
        '### 差异样例'
    ];
    result.samples.forEach((x) => {
        lines.push('', `#### encoded=${x.encoded} · ${x.hexagram} · 世爻 ${x.shi}`, `- 旧：${x.old}`, `- 新：${x.newer}`, `- 第一前沿：${x.top}`);
    });
    return lines;
}

const report = [
    '# 龟甲 v13.44.0-alpha.8 · 日期选择原则审阅报告',
    '',
    '本报告只审查新 Candidate 日期选择层；正式页面和复制分析上下文仍保持 legacy 输出。',
    '',
    '新原则：受制为非补偿硬负担；同一受制层级内用 Pareto 支配比较生扶、比和、泄力、耗力；互有长短时保留并列，不以总分强行决胜。',
    '',
    ...section('A. 这周哪天适合出行', weekly),
    '',
    ...section('B. 明天还是周五哪个好', alternatives),
    ''
].join('\n');

const out = path.join(ROOT, 'docs', 'REVIEW_SELECTION_v13.44.0-alpha.8.md');
fs.writeFileSync(out, report);
console.log(`Selection review written: ${out}`);
console.log(JSON.stringify({ weekly:weekly.stats, alternatives:alternatives.stats }, null, 2));
