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
const effectsApi = GuiJia.liuyaoTimeEffects;
const { chongMap, heMap } = GuiJia.baziCore;
const rawOptions = [6,7,8,9];
const CAST_TIME = new Date(2026, 7, 11, 22, 52, 0).getTime();
const DIMENSIONS = ['trigger','support','peer','constraint','outflow','exertion'];
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
const dates = Array.from({ length:6 }, (_, offset) => new Date(2026, 7, 15 + offset, 12, 0, 0));
const rangeDates = dates.map((date) => ({ date, dateText:dateKey(date), branch:core.getDayBranchAt(date,2).branch }));
function changedRelation(branch, dayBranch) {
    if (branch === dayBranch) return 'value';
    if (chongMap[branch] === dayBranch) return 'clash';
    if (heMap[branch] === dayBranch) return 'harmony';
    return '';
}

const stats = {
    fixtures:4096,
    dayRuns:0,
    enemyFacts:0,
    enemyMissingExertion:0,
    enemyWrongConstraint:0,
    directDimensionOpportunities:0,
    directEvidenceMissing:0,
    evidenceUncovered:0,
    evidenceMax:0,
    evidenceOver4:0,
    rangeRuns:0,
    processSelectedNodes:0,
    processDuplicateDates:0,
    processOver4:0,
    changedOpportunities:{ value:0, clash:0, harmony:0, total:0 },
    changedSelected:{ value:0, clash:0, harmony:0, total:0 },
    changedOmitted:0,
    outputModelErrors:0,
    visibleLegacyWord:0,
    visibleDeveloperToken:0,
    evidenceTextMissing:0,
    duplicatePunctuation:0,
    selectionRuns:0,
    selectionInvalid:0,
    alternativesRuns:0,
    alternativesInvalid:0
};
const samples = { enemy:[], directEvidence:[], changedOmitted:[], visible:[] };

for (let encoded = 0; encoded < 4096; encoded += 1) {
    const { target, result } = buildFixture(encoded);
    for (const date of dates) {
        stats.dayRuns += 1;
        const facts = core.buildTimeFactsForDay(result, target, date, 2);
        for (const fact of facts) {
            if (fact?.subjectRef?.relativeElementRelation !== 'observer-controls-line') continue;
            const roleActivation = (fact.components || []).some((component) =>
                component.family === 'void-transition'
                || component.family === 'month-break-review'
                || (component.family === 'branch-relation' && component.relation === 'value'));
            if (!roleActivation) continue;
            stats.enemyFacts += 1;
            const effectSet = effectsApi.mapTimeFactToEffects(fact);
            const hasExertion = Boolean(effectSet?.dimensions?.exertion?.length);
            const hasConstraint = Boolean(effectSet?.dimensions?.constraint?.length);
            if (!hasExertion) stats.enemyMissingExertion += 1;
            if (hasConstraint) stats.enemyWrongConstraint += 1;
            if ((!hasExertion || hasConstraint) && samples.enemy.length < 5) samples.enemy.push({ encoded, date:dateKey(date), code:fact.sourceCode, activeKinds:effectSet.activeKinds });
        }

        const assessment = core.buildTimeAssessmentForDay(result, target, date, 2);
        const evidence = core.buildTimeEvidenceForDay(result, target, date, 2, 3);
        if (!assessment || !evidence) continue;
        stats.evidenceMax = Math.max(stats.evidenceMax, (evidence.selected || []).length);
        if ((evidence.selected || []).length > 4) stats.evidenceOver4 += 1;
        if ((evidence.uncoveredKinds || []).length) stats.evidenceUncovered += 1;
        for (const kind of DIMENSIONS) {
            const directReason = (assessment?.dimensions?.[kind]?.reasons || []).some((reason) => reason.subject === 'main-observer');
            if (!directReason) continue;
            stats.directDimensionOpportunities += 1;
            const visibleDirect = (evidence.selected || []).some((item) => item.subject === 'main-observer' && item.coversKinds?.includes(kind));
            if (!visibleDirect) {
                stats.directEvidenceMissing += 1;
                if (samples.directEvidence.length < 5) samples.directEvidence.push({ encoded, date:dateKey(date), kind });
            }
        }
    }

    result.question = '8月15日至20日出差如何';
    const focus = core.buildQuestionTimeFocus(result, target);
    stats.rangeRuns += 1;
    if (focus?.outputModel !== 'time-v2') stats.outputModelErrors += 1;
    const keyNodes = focus?.keyNodes || [];
    stats.processSelectedNodes += keyNodes.length;
    if (new Set(keyNodes.map((node) => node.dateText)).size !== keyNodes.length) stats.processDuplicateDates += 1;
    if (keyNodes.length > 4) stats.processOver4 += 1;
    for (const node of keyNodes) {
        const visible = [node.assessment?.text || '', node.effectSummary || '', ...(node.facts || [])].join('\n');
        if (visible.includes('泄耗')) stats.visibleLegacyWord += 1;
        if (/supportive|adverse|mixed-direction|legacy-token|developer/i.test(visible)) stats.visibleDeveloperToken += 1;
        if (visible.includes('。。')) stats.duplicatePunctuation += 1;
        for (const kind of node.effectKinds || []) {
            if (kind === 'trigger') continue;
            const word = DIMENSION_WORD[kind];
            if (word && !(node.facts || []).some((fact) => fact.includes(word))) {
                stats.evidenceTextMissing += 1;
                if (samples.visible.length < 5) samples.visible.push({ encoded, date:node.dateText, kind, summary:node.effectSummary, facts:node.facts });
            }
        }
    }

    if (target.moving && target.changedBranch) {
        for (const item of rangeDates) {
            const relation = changedRelation(target.changedBranch, item.branch);
            if (!relation) continue;
            stats.changedOpportunities[relation] += 1;
            stats.changedOpportunities.total += 1;
            if (keyNodes.some((node) => node.dateText === item.dateText)) {
                stats.changedSelected[relation] += 1;
                stats.changedSelected.total += 1;
            } else {
                stats.changedOmitted += 1;
                if (samples.changedOmitted.length < 5) samples.changedOmitted.push({ encoded, changedBranch:target.changedBranch, relation, date:item.dateText });
            }
        }
    }

    if (encoded % 4 === 0) {
        result.question = '这周哪天适合出行';
        const selection = core.buildQuestionTimeFocus(result, target);
        stats.selectionRuns += 1;
        if (selection?.outputModel !== 'time-v2' || !selection?.comparison || !Array.isArray(selection?.comparison?.preferredDates)) stats.selectionInvalid += 1;

        result.question = '明天还是周五哪个好';
        const alternatives = core.buildQuestionTimeFocus(result, target);
        stats.alternativesRuns += 1;
        if (alternatives?.outputModel !== 'time-v2' || alternatives?.kind !== 'point' || (alternatives?.entries || []).length !== 2 || new Set((alternatives?.entries || []).map((item) => item.dateText)).size !== 2) stats.alternativesInvalid += 1;
    }
}

const blockers = stats.enemyMissingExertion + stats.enemyWrongConstraint + stats.directEvidenceMissing
    + stats.evidenceUncovered + stats.evidenceOver4 + stats.processDuplicateDates + stats.processOver4
    + stats.changedOmitted + stats.outputModelErrors + stats.visibleLegacyWord + stats.visibleDeveloperToken
    + stats.evidenceTextMissing + stats.duplicatePunctuation + stats.selectionInvalid + stats.alternativesInvalid;

const report = [];
report.push('# 龟甲 v13.44.0 · 时间专项正式版压力验收');
report.push('');
report.push('本报告是 v13.44.0 正式发布前的冻结验收。日期选择原则、KeyLine、Structural Relevance 与自然语言时间解析均不再扩展；这里只验证已冻结不变量是否在完整真实六爻组合中保持成立。');
report.push('');
report.push('## 4096 卦 × 6 日语义压力');
report.push('');
report.push(`- 日节点运行：${stats.dayRuns}`);
report.push(`- 间接制约落实类 TimeFact：${stats.enemyFacts}`);
report.push(`- 间接制约未映射耗力：${stats.enemyMissingExertion}`);
report.push(`- 间接制约误映射受制：${stats.enemyWrongConstraint}`);
report.push(`- 主要观察爻可直接证明的“日期 × 维度”：${stats.directDimensionOpportunities}`);
report.push(`- 主要观察爻直接证据遗漏：${stats.directEvidenceMissing}`);
report.push(`- Evidence uncovered：${stats.evidenceUncovered}`);
report.push(`- 单节点最大正式证据数：${stats.evidenceMax}`);
report.push(`- 正式证据超过 4 条：${stats.evidenceOver4}`);
report.push('');
report.push('## 4096 卦连续过程范围');
report.push('');
report.push(`- 范围运行：${stats.rangeRuns}`);
report.push(`- 关键节点总数：${stats.processSelectedNodes}`);
report.push(`- 重复日期：${stats.processDuplicateDates}`);
report.push(`- 单卦超过 4 个关键节点：${stats.processOver4}`);
report.push(`- outputModel 非 time-v2：${stats.outputModelErrors}`);
report.push(`- “泄耗”残留：${stats.visibleLegacyWord}`);
report.push(`- legacy / developer token 泄露：${stats.visibleDeveloperToken}`);
report.push(`- 摘要效力缺用户可见证据：${stats.evidenceTextMissing}`);
report.push(`- 重复句号：${stats.duplicatePunctuation}`);
report.push('');
report.push('## 主要观察爻之变 · 逢值 / 冲 / 合');
report.push('');
report.push(`- 逢值机会：${stats.changedOpportunities.value}，入选 ${stats.changedSelected.value}`);
report.push(`- 六冲机会：${stats.changedOpportunities.clash}，入选 ${stats.changedSelected.clash}`);
report.push(`- 六合机会：${stats.changedOpportunities.harmony}，入选 ${stats.changedSelected.harmony}`);
report.push(`- 合计机会：${stats.changedOpportunities.total}，入选 ${stats.changedSelected.total}，遗漏 ${stats.changedOmitted}`);
report.push('');
report.push('## 日期选择 / 离散比较抽样');
report.push('');
report.push(`- 一周日期选择：${stats.selectionRuns}，结构异常 ${stats.selectionInvalid}`);
report.push(`- “明天还是周五”：${stats.alternativesRuns}，结构异常 ${stats.alternativesInvalid}`);
report.push('');
report.push('## 结论');
report.push('');
report.push(blockers === 0
    ? '- 阻断项为 0。v13.44.0 时间捕捉 / 时间效力 / 日期比较专项通过正式版冻结验收。'
    : `- 仍有 ${blockers} 个阻断项，不应发布 v13.44.0。`);
report.push('- 后续新边界默认进入 backlog；除非造成错误结论、证据断裂、页面/复制不一致或运行异常，不再重开本专项规则。');
report.push('');
report.push('## 异常抽样');
report.push('');
report.push('```json');
report.push(JSON.stringify(samples, null, 2));
report.push('```');

const out = path.join(ROOT, 'docs', 'REVIEW_RELEASE_v13.44.0.md');
fs.writeFileSync(out, `${report.join('\n')}\n`);
console.log(`Wrote ${out}`);
console.log(JSON.stringify({ blockers, stats, samples }, null, 2));
if (blockers) process.exit(1);
