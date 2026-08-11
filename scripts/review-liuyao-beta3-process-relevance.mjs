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
const relevanceApi = GuiJia.liuyaoTimeRelevance;
const selectionApi = GuiJia.liuyaoTimeSelection;
const { chongMap, heMap } = GuiJia.baziCore;
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

function dateKey(date) { return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`; }
const rangeDates = Array.from({ length:6 }, (_, offset) => {
    const date = new Date(2026,7,15 + offset,12,0,0);
    return { date, dateText:dateKey(date), branch:core.getDayBranchAt(date,2).branch };
});

function changedRelation(branch, dayBranch) {
    if (branch === dayBranch) return 'value';
    if (chongMap[branch] === dayBranch) return 'clash';
    if (heMap[branch] === dayBranch) return 'harmony';
    return '';
}

const stats = {
    rangeRuns:0, selectionRuns:0, alternativesRuns:0,
    movingObserver:0,
    changedOpportunities:{ value:0, clash:0, harmony:0, total:0 },
    changedSelected:{ value:0, clash:0, harmony:0, total:0 },
    changedOmitted:0,
    processSelectedNodes:0,
    processWithoutEligibleFact:0,
    processDuplicateDates:0,
    processOverLimit:0,
    evidenceMissing:0,
    duplicatePunctuation:0,
    productionCandidateMismatch:0,
    selectionInvariantErrors:0,
    alternativeInvariantErrors:0
};
const samples = { changedOmitted:[], lowRelevance:[], evidence:[], productionMismatch:[] };

function factHas(fact, family, relation = '') {
    return (fact?.components || []).some((component) => component?.family === family && (!relation || component?.relation === relation));
}
function processFactEligible(fact) {
    const subject = String(fact?.subject || 'context');
    if (subject === 'main-observer' || subject === 'main-observer-change') return true;
    if (subject === 'sanhe' || subject === 'sanhe-member') return true;
    if (factHas(fact,'void-transition') || factHas(fact,'month-break-review') || factHas(fact,'formation')) return true;
    const isValue = factHas(fact,'branch-relation','value');
    const hasObserverRole = Boolean(fact?.subjectRef?.relativeElementRelation);
    if (subject === 'moving-line' && isValue && hasObserverRole) return true;
    if (subject === 'opposite' && isValue && hasObserverRole && fact?.meta?.lineMoving) return true;
    return false;
}

for (let encoded = 0; encoded < 4096; encoded += 1) {
    const { target, result } = buildFixture(encoded);

    result.question = '8月15日至20日出差如何';
    const focus = core.buildQuestionTimeFocus(result, target);
    stats.rangeRuns += 1;
    const keyNodes = focus?.keyNodes || [];
    stats.processSelectedNodes += keyNodes.length;
    if (keyNodes.length > 4) stats.processOverLimit += 1;
    if (new Set(keyNodes.map((item) => item.dateText)).size !== keyNodes.length) stats.processDuplicateDates += 1;
    for (const node of keyNodes) {
        const dateParts = node.dateText.split('/').map(Number);
        const dateObj = new Date(dateParts[0], dateParts[1]-1, dateParts[2], 12, 0, 0);
        const factsForDay = core.buildTimeFactsForDay(result, target, dateObj, 2);
        if (!factsForDay.some(processFactEligible)) {
            stats.processWithoutEligibleFact += 1;
            if (samples.lowRelevance.length < 8) samples.lowRelevance.push({ encoded, date:node.dateText, facts:node.facts, timeFacts:factsForDay });
        }
        const visible = [node.assessment?.text || '', node.effectSummary || '', ...(node.facts || [])].join('\n');
        if (visible.includes('。。')) stats.duplicatePunctuation += 1;
        for (const kind of node.effectKinds || []) {
            if (kind === 'trigger') continue;
            const word = DIMENSION_WORD[kind];
            if (word && !(node.facts || []).some((fact) => fact.includes(word))) {
                stats.evidenceMissing += 1;
                if (samples.evidence.length < 8) samples.evidence.push({ encoded, date:node.dateText, kind, summary:node.effectSummary, facts:node.facts });
            }
        }
    }
    if (JSON.stringify(focus?.keyNodes || []) !== JSON.stringify(focus?.candidateOutput?.keyNodes || [])) {
        stats.productionCandidateMismatch += 1;
        if (samples.productionMismatch.length < 5) samples.productionMismatch.push({ encoded, type:'range' });
    }

    if (target.moving && target.changedBranch) {
        stats.movingObserver += 1;
        for (const item of rangeDates) {
            const relation = changedRelation(target.changedBranch, item.branch);
            if (!relation) continue;
            stats.changedOpportunities[relation] += 1;
            stats.changedOpportunities.total += 1;
            const selected = keyNodes.some((node) => node.dateText === item.dateText);
            if (selected) {
                stats.changedSelected[relation] += 1;
                stats.changedSelected.total += 1;
            } else {
                stats.changedOmitted += 1;
                if (samples.changedOmitted.length < 8) samples.changedOmitted.push({ encoded, targetBranch:target.branch, changedBranch:target.changedBranch, relation, date:item.dateText, selected:keyNodes.map((node) => node.dateText) });
            }
        }
    }

    if (encoded % 4 === 0) {
        result.question = '这周哪天适合出行';
        const selectionFocus = core.buildQuestionTimeFocus(result, target);
        stats.selectionRuns += 1;
        if (JSON.stringify(selectionFocus?.keyNodes || []) !== JSON.stringify(selectionFocus?.candidateOutput?.keyNodes || [])) stats.productionCandidateMismatch += 1;
        if (!selectionFocus?.comparison || !Array.isArray(selectionFocus?.comparison?.preferredDates)) stats.selectionInvariantErrors += 1;

        result.question = '明天还是周五哪个好';
        const altFocus = core.buildQuestionTimeFocus(result, target);
        stats.alternativesRuns += 1;
        if (altFocus?.kind !== 'point' || (altFocus?.entries || []).length !== 2 || new Set((altFocus?.entries || []).map((item) => item.dateText)).size !== 2) stats.alternativeInvariantErrors += 1;
        if (JSON.stringify(altFocus?.entries || []) !== JSON.stringify(altFocus?.candidateOutput?.entries || [])) stats.productionCandidateMismatch += 1;
    }
}

const blockers = stats.changedOmitted + stats.processWithoutEligibleFact + stats.processDuplicateDates + stats.processOverLimit
    + stats.evidenceMissing + stats.duplicatePunctuation + stats.productionCandidateMismatch
    + stats.selectionInvariantErrors + stats.alternativeInvariantErrors;

const report = [];
report.push('# 龟甲 v13.44.0-beta.3 · Process Structural Relevance 收口压力');
report.push('');
report.push('本轮只验证 RC 前最后一个已确认架构项：过程型范围关键节点准入从 legacy primary/secondary tier 迁移到 Time v2 Structural Relevance 的 trigger 相关性。');
report.push('');
report.push('## 4096 卦范围压力');
report.push('');
report.push(`- 连续范围运行：${stats.rangeRuns}`);
report.push(`- 过程关键节点总数：${stats.processSelectedNodes}`);
report.push(`- 单卦超过 4 个关键节点：${stats.processOverLimit}`);
report.push(`- 重复日期节点：${stats.processDuplicateDates}`);
report.push(`- 已选过程节点缺少符合 Structural Relevance + TimeFact 的过程触发：${stats.processWithoutEligibleFact}`);
report.push('');
report.push('## 主要观察爻之变 · 全三类触发');
report.push('');
report.push(`- 主要观察爻发动：${stats.movingObserver}`);
report.push(`- 逢值机会：${stats.changedOpportunities.value}，选中 ${stats.changedSelected.value}`);
report.push(`- 六冲机会：${stats.changedOpportunities.clash}，选中 ${stats.changedSelected.clash}`);
report.push(`- 六合机会：${stats.changedOpportunities.harmony}，选中 ${stats.changedSelected.harmony}`);
report.push(`- 合计：${stats.changedOpportunities.total}，选中 ${stats.changedSelected.total}，遗漏 ${stats.changedOmitted}`);
report.push('');
report.push('## 正式输出不变量（冻结层抽样 1024 卦）');
report.push('');
report.push(`- 摘要效力缺用户可见证据：${stats.evidenceMissing}`);
report.push(`- 重复句号：${stats.duplicatePunctuation}`);
report.push(`- production / Candidate 镜像不一致：${stats.productionCandidateMismatch}`);
report.push(`- 一周 Date Selection 前沿不变量错误：${stats.selectionInvariantErrors}`);
report.push(`- 离散两日候选结构错误：${stats.alternativeInvariantErrors}`);
report.push('');
report.push('## 结论');
report.push('');
report.push(blockers === 0
    ? '- 本轮阻断项为 0。process-range 准入已完成 Structural Relevance 迁移，可进入 RC。'
    : `- 仍有 ${blockers} 个阻断项，不应进入 RC。`);
report.push('- 六维效力、Date Selection comparator、时间解析与 KeyLine 未在本轮重新打开。');
report.push('');
report.push('## 抽样');
report.push('');
report.push('```json');
report.push(JSON.stringify(samples, null, 2));
report.push('```');

const out = path.join(ROOT, 'docs', 'REVIEW_BETA3_v13.44.0-beta.3.md');
fs.writeFileSync(out, `${report.join('\n')}\n`);
console.log(`Wrote ${out}`);
console.log(JSON.stringify({ blockers, stats, samples }, null, 2));
if (blockers) process.exit(1);
