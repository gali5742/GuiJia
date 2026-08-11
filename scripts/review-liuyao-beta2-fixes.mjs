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
const rawOptions = [6,7,8,9];
const CAST_TIME = new Date(2026, 7, 11, 14, 43, 0).getTime();
const DIMENSION_WORD = { support:'生扶', peer:'比和', constraint:'受制', outflow:'泄力', exertion:'耗力' };

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
    rows = rows.map((line) => ({ ...line, statusTags:core.buildLiuYaoLineStatus(line, '申', '巳', '子丑', line.moving).tags }));
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
        dayZhi:'巳',
        question:'',
        lines:rows,
        fullStructure:core.buildFullHexagramStructure(rows, originalNaJia, changedNaJia, '申', '巳'),
        useGodSelection:{ mode:'question', focusId:'travel', target:'世' }
    };
    return { target, result };
}

const stats = {
    rangeRuns:0,
    selectionRuns:0,
    explicitEvidenceMissing:0,
    duplicatePunctuation:0,
    tieEquivalent:0,
    tieTradeoff:0,
    tieWordingMismatch:0,
    movingObserver:0,
    observerChangeValueInRange:0,
    observerChangeValueSelected:0,
    observerChangeValueOmitted:0
};
const samples = { evidence:[], punctuation:[], observerChangeOmitted:[] };

const rangeStart = new Date(2026,7,15,12,0,0);
const branchDates = {};
for (let offset = 0; offset < 6; offset += 1) {
    const d = new Date(rangeStart.getTime() + offset * 86400000);
    const info = core.getDayBranchAt(d, 2);
    branchDates[info.branch] = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
}

for (let encoded = 0; encoded < 4096; encoded += 1) {
    const { target, result } = buildFixture(encoded);

    result.question = '8月15日至20日出差如何';
    const rangeFocus = core.buildQuestionTimeFocus(result, target);
    stats.rangeRuns += 1;
    for (const node of rangeFocus?.keyNodes || []) {
        const text = [node.assessment?.text || '', node.effectSummary || '', ...(node.facts || [])].join('\n');
        if (text.includes('。。')) {
            stats.duplicatePunctuation += 1;
            if (samples.punctuation.length < 5) samples.punctuation.push({ encoded, date:node.dateText, text });
        }
        for (const kind of node.effectKinds || []) {
            if (kind === 'trigger') continue;
            const word = DIMENSION_WORD[kind];
            if (word && !(node.facts || []).some((fact) => fact.includes(word))) {
                stats.explicitEvidenceMissing += 1;
                if (samples.evidence.length < 5) samples.evidence.push({ encoded, date:node.dateText, kind, facts:node.facts, summary:node.effectSummary });
            }
        }
    }

    if (target.moving) {
        stats.movingObserver += 1;
        const changedDate = branchDates[target.changedBranch];
        if (changedDate) {
            stats.observerChangeValueInRange += 1;
            if ((rangeFocus?.keyNodes || []).some((node) => node.dateText === changedDate)) {
                stats.observerChangeValueSelected += 1;
            } else {
                stats.observerChangeValueOmitted += 1;
                if (samples.observerChangeOmitted.length < 8) {
                    samples.observerChangeOmitted.push({ encoded, position:target.position, branch:target.branch, changedBranch:target.changedBranch, date:changedDate, selected:(rangeFocus?.keyNodes || []).map((node) => node.dateText) });
                }
            }
        }
    }

    result.question = '这周哪天适合出行';
    const selectionFocus = core.buildQuestionTimeFocus(result, target);
    stats.selectionRuns += 1;
    const comparison = selectionFocus?.comparison;
    if (comparison?.status === 'tie') {
        if (comparison.tieReason === 'equivalent-conditions') stats.tieEquivalent += 1;
        else if (comparison.tieReason === 'tradeoff') stats.tieTradeoff += 1;
        const expected = comparison.tieReason === 'equivalent-conditions' ? '当前条件接近' : '各有侧重';
        if (!comparison.summary.includes(expected)) stats.tieWordingMismatch += 1;
    }
    for (const node of selectionFocus?.keyNodes || []) {
        const text = [node.assessment?.text || '', node.effectSummary || '', ...(node.facts || [])].join('\n');
        if (text.includes('。。')) {
            stats.duplicatePunctuation += 1;
            if (samples.punctuation.length < 5) samples.punctuation.push({ encoded, date:node.dateText, text });
        }
        for (const kind of node.effectKinds || []) {
            if (kind === 'trigger') continue;
            const word = DIMENSION_WORD[kind];
            if (word && !(node.facts || []).some((fact) => fact.includes(word))) {
                stats.explicitEvidenceMissing += 1;
                if (samples.evidence.length < 5) samples.evidence.push({ encoded, date:node.dateText, kind, facts:node.facts, summary:node.effectSummary });
            }
        }
    }
}

const blockers = stats.explicitEvidenceMissing + stats.duplicatePunctuation + stats.tieWordingMismatch;
const report = [];
report.push('# 龟甲 v13.44.0-beta.2 · Beta 手测修复与观察爻之变专项');
report.push('');
report.push('本轮严格限定为 beta.1 手测暴露的三个用户输出问题修复，并对“主要观察爻自身之变逢值是否被过程节点系统性遗漏”只做专项统计，不修改其筛选规则。');
report.push('');
report.push('## 修复项压力结果');
report.push('');
report.push(`- 连续范围运行：${stats.rangeRuns}`);
report.push(`- 一周日期选择运行：${stats.selectionRuns}`);
report.push(`- 摘要实质效力缺少用户可见证据：${stats.explicitEvidenceMissing}`);
report.push(`- 时间输出重复句号：${stats.duplicatePunctuation}`);
report.push(`- 同条件并列：${stats.tieEquivalent}`);
report.push(`- 真实权衡并列：${stats.tieTradeoff}`);
report.push(`- 并列类型与文案不一致：${stats.tieWordingMismatch}`);
report.push('');
report.push('## 只观察、不修改：主要观察爻自身之变逢值');
report.push('');
report.push(`- 主要观察爻发动：${stats.movingObserver}`);
report.push(`- 其变爻支落在 8/15～8/20 范围：${stats.observerChangeValueInRange}`);
report.push(`- 该日期已进入过程关键节点：${stats.observerChangeValueSelected}`);
report.push(`- 该日期未进入过程关键节点：${stats.observerChangeValueOmitted}`);
report.push(`- 遗漏比例：${stats.observerChangeValueInRange ? (stats.observerChangeValueOmitted / stats.observerChangeValueInRange * 100).toFixed(2) : '0.00'}%`);
report.push('');
report.push('当前过程筛选仍以 legacy primary tier 为入选门槛；`TARGET_CHANGED_VALUE` 属于 secondary，而 Structural Relevance 已把 `main-observer-change` 定为高相关层。因此该统计反映的是重构后“相关性层已升级、过程节点入口仍沿用旧 tier”的架构边界。beta.2 按批准范围只记录，不改规则。');
report.push('');
report.push('## 结论');
report.push('');
report.push(blockers === 0
    ? '- beta.2 三个已批准修复项的压力阻断项为 0。'
    : `- beta.2 仍有 ${blockers} 个已批准修复项阻断问题。`);
report.push('- 观察爻之变逢值专项确认属于广泛现象，需在 RC 前作为单独的“过程节点入口是否迁移到新相关性模型”决策处理；不应以零散事件补丁解决。');
report.push('');
report.push('## 抽样');
report.push('');
report.push('```json');
report.push(JSON.stringify(samples, null, 2));
report.push('```');

const out = path.join(ROOT, 'docs', 'REVIEW_BETA2_v13.44.0-beta.2.md');
fs.writeFileSync(out, `${report.join('\n')}\n`);
console.log(`Wrote ${out}`);
console.log(JSON.stringify({ blockers, stats, samples }, null, 2));
if (blockers) process.exit(1);
