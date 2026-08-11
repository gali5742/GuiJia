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
const effectsApi = GuiJia.liuyaoTimeEffects;
const rawOptions = [6,7,8,9];
const CAST_TIME = new Date(2026, 7, 11, 21, 40, 0).getTime();
const DIMENSIONS = ['trigger','support','peer','constraint','outflow','exertion'];

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

const dates = Array.from({ length:6 }, (_, offset) => new Date(2026, 7, 15 + offset, 12, 0, 0));
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
    rangeDuplicateDates:0,
    rangeOver4:0,
    productionCandidateMismatch:0,
    selectionRuns:0,
    selectionInvalid:0
};
const samples = { enemy:[], directEvidence:[], uncovered:[], range:[] };

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
            if ((!hasExertion || hasConstraint) && samples.enemy.length < 8) {
                samples.enemy.push({ encoded, date:date.toISOString().slice(0,10), code:fact.sourceCode, activeKinds:effectSet.activeKinds });
            }
        }

        const assessment = core.buildTimeAssessmentForDay(result, target, date, 2);
        const evidence = core.buildTimeEvidenceForDay(result, target, date, 2, 3);
        if (!assessment || !evidence) continue;
        stats.evidenceMax = Math.max(stats.evidenceMax, (evidence.selected || []).length);
        if ((evidence.selected || []).length > 4) stats.evidenceOver4 += 1;
        if ((evidence.uncoveredKinds || []).length) {
            stats.evidenceUncovered += 1;
            if (samples.uncovered.length < 8) samples.uncovered.push({ encoded, date:date.toISOString().slice(0,10), kinds:evidence.uncoveredKinds });
        }
        for (const kind of DIMENSIONS) {
            const directReason = (assessment?.dimensions?.[kind]?.reasons || []).some((reason) => reason.subject === 'main-observer');
            if (!directReason) continue;
            stats.directDimensionOpportunities += 1;
            const visibleDirect = (evidence.selected || []).some((item) => item.subject === 'main-observer' && item.coversKinds?.includes(kind));
            if (!visibleDirect) {
                stats.directEvidenceMissing += 1;
                if (samples.directEvidence.length < 8) samples.directEvidence.push({
                    encoded,
                    date:date.toISOString().slice(0,10),
                    kind,
                    assessmentReasons:assessment.dimensions[kind].reasons,
                    selected:evidence.selected
                });
            }
        }
    }

    result.question = '8月15日至20日出差如何';
    const focus = core.buildQuestionTimeFocus(result, target);
    stats.rangeRuns += 1;
    const keyNodes = focus?.keyNodes || [];
    if (new Set(keyNodes.map((node) => node.dateText)).size !== keyNodes.length) stats.rangeDuplicateDates += 1;
    if (keyNodes.length > 4) stats.rangeOver4 += 1;
    if (JSON.stringify(focus?.keyNodes || []) !== JSON.stringify(focus?.candidateOutput?.keyNodes || [])) stats.productionCandidateMismatch += 1;

    if (encoded % 4 === 0) {
        result.question = '这周哪天适合出行';
        const selection = core.buildQuestionTimeFocus(result, target);
        stats.selectionRuns += 1;
        if (!selection?.comparison || !Array.isArray(selection?.comparison?.preferredDates)) stats.selectionInvalid += 1;
        if (JSON.stringify(selection?.keyNodes || []) !== JSON.stringify(selection?.candidateOutput?.keyNodes || [])) stats.productionCandidateMismatch += 1;
    }
}

const blockers = stats.enemyMissingExertion + stats.enemyWrongConstraint + stats.directEvidenceMissing
    + stats.evidenceUncovered + stats.rangeDuplicateDates + stats.rangeOver4
    + stats.productionCandidateMismatch + stats.selectionInvalid;

const report = [];
report.push('# 龟甲 v13.44.0-rc.1 · Time v2 语义收口压力');
report.push('');
report.push('本轮只验证两个 RC 阻断修复：间接制约五行必须落为“耗力”；主要观察爻自身可直接证明某效力维度时，Evidence Selector 不得用外围同类事实将其挤出正式证据。日期选择原则、KeyLine 与 Structural Relevance 层级均保持冻结。');
report.push('');
report.push('## 4096 卦 × 6 日');
report.push('');
report.push(`- 日节点运行：${stats.dayRuns}`);
report.push(`- 间接制约 TimeFact：${stats.enemyFacts}`);
report.push(`- 间接制约未映射耗力：${stats.enemyMissingExertion}`);
report.push(`- 间接制约误映射受制：${stats.enemyWrongConstraint}`);
report.push(`- 可由主要观察爻直接证明的“日期 × 维度”：${stats.directDimensionOpportunities}`);
report.push(`- 主要观察爻直接证据被外围事实挤掉：${stats.directEvidenceMissing}`);
report.push(`- Evidence uncovered：${stats.evidenceUncovered}`);
report.push(`- 单节点最大正式证据数：${stats.evidenceMax}`);
report.push(`- 正式证据超过 4 条的节点：${stats.evidenceOver4}`);
report.push('');
report.push('## 过程范围与日期选择回归');
report.push('');
report.push(`- 过程范围运行：${stats.rangeRuns}`);
report.push(`- 过程范围重复日期：${stats.rangeDuplicateDates}`);
report.push(`- 单卦过程关键节点超过 4 日：${stats.rangeOver4}`);
report.push(`- production / Candidate 镜像不一致：${stats.productionCandidateMismatch}`);
report.push(`- 一周日期选择抽样：${stats.selectionRuns}`);
report.push(`- 日期选择结构异常：${stats.selectionInvalid}`);
report.push('');
report.push('## 结论');
report.push('');
report.push(blockers === 0
    ? '- 两个 RC 阻断项在固定 4096 卦压力中均为 0；时间专项可以进入发布候选冻结。'
    : `- 仍有 ${blockers} 个阻断项，不能进入正式版。`);
report.push('- Evidence 数量统计只用于观察可读性，不作为强制三条上限；摘要维度完整可追溯优先。');
report.push('');
report.push('## 异常抽样');
report.push('');
report.push('```json');
report.push(JSON.stringify(samples, null, 2));
report.push('```');

const out = path.join(ROOT, 'docs', 'REVIEW_RC1_v13.44.0-rc.1.md');
fs.writeFileSync(out, `${report.join('\n')}\n`);
console.log(`Wrote ${out}`);
console.log(JSON.stringify({ blockers, stats, samples }, null, 2));
if (blockers) process.exit(1);
