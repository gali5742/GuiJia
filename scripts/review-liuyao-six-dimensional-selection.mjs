#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import os from 'os';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { createRequire } from 'module';

process.env.TZ = 'Asia/Tokyo';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { Solar } = require(path.join(ROOT, 'vendor', 'lunar.js'));
const rawOptions = [6,7,8,9];
const CAST_TIME = new Date(2026, 7, 10, 20, 25, 0).getTime();
const MATERIAL_KINDS = ['support','peer','outflow','exertion'];
const MATERIAL_LABELS = { support:'生扶', peer:'比和', outflow:'泄力', exertion:'耗力' };

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

function decodeRawValues(encoded) {
    let cursor = encoded;
    const values = [];
    for (let i = 0; i < 6; i += 1) { values.push(rawOptions[cursor % 4]); cursor = Math.floor(cursor / 4); }
    return values;
}

function buildFixture(core, encoded, question = '这周哪天适合出行') {
    const rawValues = decodeRawValues(encoded);
    const originalLines = rawValues.map((value) => value === 7 || value === 9);
    const moving = rawValues.map((value) => value === 6 || value === 9);
    const changedLines = originalLines.map((value, index) => moving[index] ? !value : value);
    const palace = core.liuyaoPalaceMap[core.lineKey(originalLines)];
    const originalNaJia = core.naJiaForLines(originalLines);
    const changedNaJia = core.naJiaForLines(changedLines);
    let rows = rawValues.map((value, index) => ({
        position:index + 1, label:['初爻','二爻','三爻','四爻','五爻','上爻'][index],
        relation:core.sixRelation(originalNaJia[index].element, palace.element), stem:originalNaJia[index].stem,
        branch:originalNaJia[index].branch, element:originalNaJia[index].element, naJia:originalNaJia[index].text,
        moving:moving[index], changedRelation:core.sixRelation(changedNaJia[index].element, palace.element),
        changedBranch:changedNaJia[index].branch, changedElement:changedNaJia[index].element,
        statusTags:[], moveTags:[], isShi:palace.shi === index + 1, isYing:palace.ying === index + 1
    }));
    rows = rows.map((line) => ({ ...line, statusTags:core.buildLiuYaoLineStatus(line, '申', '辰', '子丑', line.moving).tags }));
    rows = rows.map((line) => line.moving ? ({ ...line, moveTags:core.buildMoveAnalysis(line, { branch:line.changedBranch, element:line.changedElement }, '申', '子丑') }) : line);
    const target = rows.find((line) => line.isShi);
    const result = {
        castTimestamp:CAST_TIME, daySect:2, dayXun:'甲寅', xunKong:'子丑', monthZhi:'申', dayZhi:'辰', question,
        lines:rows, fullStructure:core.buildFullHexagramStructure(rows, originalNaJia, changedNaJia, '申', '辰'),
        useGodSelection:{ mode:'question' }
    };
    return { encoded, target, result, focus:core.buildQuestionTimeFocus(result, target), hexagram:core.getHexagram(originalLines) };
}

function candidateNodesForScope(GuiJia, core, fixture) {
    const expand = GuiJia.questionTime?.expandScopeDates;
    if (typeof expand !== 'function' || !fixture.focus?.scope) return [];
    return expand(fixture.focus.scope, 40).map((dateObj) => ({
        dateText:`${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()}`,
        dayGanZhi:Solar.fromDate(dateObj).getLunar().getDayInGanZhi(), sortTime:dateObj.getTime(),
        candidateOutput:core.buildCandidateTimeOutputForDay(fixture.result, fixture.target, dateObj, 2, 3)
    }));
}

const mapInc = (map, key, amount = 1) => map.set(key, (map.get(key) || 0) + amount);
const entriesObject = (map) => Object.fromEntries([...map.entries()]);
const mergeObjectCounts = (target, source = {}) => Object.entries(source).forEach(([key, value]) => { target[key] = (target[key] || 0) + Number(value || 0); });

function materialProfile(selectionApi, node) {
    return selectionApi.materialSelectionProfile(selectionApi.profileFromNode(node));
}
function materialKey(selectionApi, node) {
    const p = materialProfile(selectionApi, node);
    const active = MATERIAL_KINDS.filter((kind) => p[kind]);
    return active.length ? active.join('+') : 'neutral';
}
function materialLabel(key) {
    if (key === 'neutral') return '中性';
    return key.split('+').map((kind) => MATERIAL_LABELS[kind] || kind).join('＋');
}
function materialVector(selectionApi, node) {
    const p = materialProfile(selectionApi, node);
    return Object.fromEntries(MATERIAL_KINDS.map((kind) => [kind, Boolean(p[kind])]));
}
function relevanceVector(selectionApi, node) {
    const p = selectionApi.profileFromNode(node)?.structuralRelevance?.dimensions || {};
    return Object.fromEntries(['trigger',...MATERIAL_KINDS].map((kind) => [kind, Number(p[kind]?.rank || 0)]));
}
function relevanceSignature(selectionApi, node) {
    const v = relevanceVector(selectionApi, node);
    return Object.entries(v).map(([kind, rank]) => `${kind}:${rank}`).join('|');
}

// 审计用“细粒度 Pareto”：不新增权重，只测试现有六维布尔信息是否已经足以解除部分并列。
// 生扶与比和仍不互换分值，泄力与耗力仍不互换分值；但“同时生扶+比和”可支配“只有生扶”，
// “只有泄力”可支配“同时泄力+耗力”。这只是诊断基准，不参与生产排序。
function fineMaterialDominates(selectionApi, aNode, bNode) {
    const a = materialProfile(selectionApi, aNode);
    const b = materialProfile(selectionApi, bNode);
    if (a.constraint !== b.constraint) return false;
    const noWorse = Number(a.support) >= Number(b.support)
        && Number(a.peer) >= Number(b.peer)
        && Number(a.outflow) <= Number(b.outflow)
        && Number(a.exertion) <= Number(b.exertion);
    if (!noWorse) return false;
    const strict = a.support !== b.support || a.peer !== b.peer || a.outflow !== b.outflow || a.exertion !== b.exertion;
    if (strict) return true;
    return selectionApi.structuralRelevanceDominatesEquivalent(selectionApi.profileFromNode(aNode), selectionApi.profileFromNode(bNode));
}

function fineFrontier(selectionApi, nodes) {
    const usable = (nodes || []).filter((node) => selectionApi.profileFromNode(node));
    if (!usable.length) return [];
    const hasUnconstrained = usable.some((node) => !materialProfile(selectionApi, node).constraint);
    const sameClass = usable.filter((node) => materialProfile(selectionApi, node).constraint === !hasUnconstrained);
    return sameClass.filter((candidate, index) => !sameClass.some((other, otherIndex) => (
        index !== otherIndex && fineMaterialDominates(selectionApi, other, candidate)
    )));
}

function classifyResidualPair(selectionApi, aNode, bNode) {
    const a = materialVector(selectionApi, aNode);
    const b = materialVector(selectionApi, bNode);
    const ak = materialKey(selectionApi, aNode);
    const bk = materialKey(selectionApi, bNode);
    if (ak === bk) {
        const ar = relevanceVector(selectionApi, aNode);
        const br = relevanceVector(selectionApi, bNode);
        const materialRanksSame = MATERIAL_KINDS.every((kind) => ar[kind] === br[kind]);
        const triggerSame = ar.trigger === br.trigger;
        if (materialRanksSame && triggerSame) return 'same-material-exact';
        const hasBenefit = a.support || a.peer;
        const hasBurden = a.outflow || a.exertion;
        if (materialRanksSame && !triggerSame && hasBenefit && hasBurden) return 'same-material-mixed-trigger-ignored';
        return 'same-material-relevance-tradeoff';
    }
    const aBenefit = [a.support,a.peer].filter(Boolean).length;
    const bBenefit = [b.support,b.peer].filter(Boolean).length;
    const aCost = [a.outflow,a.exertion].filter(Boolean).length;
    const bCost = [b.outflow,b.exertion].filter(Boolean).length;
    if (aCost === 0 && bCost === 0 && aBenefit > 0 && bBenefit > 0) {
        if ((a.support && !a.peer && b.peer && !b.support) || (b.support && !b.peer && a.peer && !a.support)) return 'support-vs-peer';
        return 'benefit-kind-boundary';
    }
    if (aBenefit === 0 && bBenefit === 0 && aCost > 0 && bCost > 0) {
        if ((a.outflow && !a.exertion && b.exertion && !b.outflow) || (b.outflow && !b.exertion && a.exertion && !a.outflow)) return 'outflow-vs-exertion';
        return 'soft-cost-kind-boundary';
    }
    if (aBenefit > 0 && bBenefit > 0) {
        if ((aCost === 0 && bCost > 0) || (bCost === 0 && aCost > 0)) return 'extra-benefit-vs-soft-cost';
        if (aCost > 0 && bCost > 0) return 'benefit-cost-cross-tradeoff';
    }
    if ((aBenefit > 0 && aCost > 0 && bBenefit === 0 && bCost > 0)
        || (bBenefit > 0 && bCost > 0 && aBenefit === 0 && aCost > 0)) return 'mixed-vs-soft-cost-only';
    return 'other-cross-material';
}

function classifyResidualFrontier(selectionApi, frontier) {
    const reasons = new Set();
    for (let i = 0; i < frontier.length; i += 1) {
        for (let j = i + 1; j < frontier.length; j += 1) reasons.add(classifyResidualPair(selectionApi, frontier[i], frontier[j]));
    }
    if (!reasons.size) reasons.add('unclassified');
    return [...reasons].sort();
}

function sampleNode(selectionApi, node) {
    return {
        date:node.dateText,
        dayGanZhi:node.dayGanZhi,
        material:materialKey(selectionApi,node),
        materialLabel:materialLabel(materialKey(selectionApi,node)),
        relevance:relevanceSignature(selectionApi,node),
        summary:String(node?.candidateOutput?.summary?.text || '')
    };
}

function runChunk(start, end) {
    const GuiJia = loadGuiJia();
    const core = GuiJia.liuyaoCore;
    const selectionApi = GuiJia.liuyaoTimeSelection;
    const stats = {
        total:0, invalid:0, alpha8Tie:0, alpha8Single:0, fineTie:0, fineSingle:0,
        sameFrontier:0, fineStrictSubset:0, alpha8StrictSubset:0, frontierOverlapChanged:0,
        alpha8TieFineSingle:0, alpha8SingleFineTie:0, bothTieChanged:0,
        residualTieExplained:0, residualTieUnclassified:0, maxAlpha8Frontier:0, maxFineFrontier:0
    };
    const alpha8Sizes = new Map();
    const fineSizes = new Map();
    const alpha8PatternCounts = new Map();
    const residualPatternCounts = new Map();
    const residualReasonCounts = new Map();
    const residualReasonSamples = {};
    const fineChangeSamples = [];

    for (let encoded = start; encoded < end; encoded += 1) {
        const fixture = buildFixture(core, encoded);
        const nodes = candidateNodesForScope(GuiJia, core, fixture);
        if (!nodes.length) { stats.invalid += 1; continue; }
        const comparison = selectionApi.buildDateSelectionComparison(nodes);
        if (selectionApi.validateSelectionComparison(comparison, nodes).length) { stats.invalid += 1; continue; }
        stats.total += 1;
        const alpha8 = selectionApi.nondominatedFrontier(nodes);
        const fine = fineFrontier(selectionApi, nodes);
        stats.maxAlpha8Frontier = Math.max(stats.maxAlpha8Frontier, alpha8.length);
        stats.maxFineFrontier = Math.max(stats.maxFineFrontier, fine.length);
        mapInc(alpha8Sizes, String(alpha8.length));
        mapInc(fineSizes, String(fine.length));
        if (alpha8.length > 1) stats.alpha8Tie += 1; else stats.alpha8Single += 1;
        if (fine.length > 1) stats.fineTie += 1; else stats.fineSingle += 1;
        if (alpha8.length > 1) {
            const alphaPattern = [...new Set(alpha8.map((node) => materialKey(selectionApi,node)))].sort().join(' <> ');
            mapInc(alpha8PatternCounts, alphaPattern);
        }

        const alphaDates = new Set(alpha8.map((node) => node.dateText));
        const fineDates = new Set(fine.map((node) => node.dateText));
        const alphaInFine = [...alphaDates].every((date) => fineDates.has(date));
        const fineInAlpha = [...fineDates].every((date) => alphaDates.has(date));
        if (alphaInFine && fineInAlpha) stats.sameFrontier += 1;
        else if (fineInAlpha) stats.fineStrictSubset += 1;
        else if (alphaInFine) stats.alpha8StrictSubset += 1;
        else stats.frontierOverlapChanged += 1;
        if (alpha8.length > 1 && fine.length === 1) stats.alpha8TieFineSingle += 1;
        if (alpha8.length === 1 && fine.length > 1) stats.alpha8SingleFineTie += 1;
        if (alpha8.length > 1 && fine.length > 1 && !(alphaInFine && fineInAlpha)) stats.bothTieChanged += 1;
        if (!(alphaInFine && fineInAlpha) && fineChangeSamples.length < 12) fineChangeSamples.push({
            encoded,
            hexagram:`${fixture.hexagram.symbol}${fixture.hexagram.name}`,
            relation:fineInAlpha ? 'fine-subset' : alphaInFine ? 'alpha8-subset' : 'cross-changed',
            before:alpha8.map((node) => sampleNode(selectionApi,node)),
            after:fine.map((node) => sampleNode(selectionApi,node))
        });

        if (fine.length > 1) {
            const residualPattern = [...new Set(fine.map((node) => materialKey(selectionApi,node)))].sort().join(' <> ');
            mapInc(residualPatternCounts, residualPattern);
            const reasons = classifyResidualFrontier(selectionApi, fine);
            const explained = reasons.some((reason) => reason !== 'unclassified');
            if (explained) stats.residualTieExplained += 1;
            else stats.residualTieUnclassified += 1;
            reasons.forEach((reason) => {
                mapInc(residualReasonCounts, reason);
                if (!residualReasonSamples[reason]) residualReasonSamples[reason] = {
                    encoded,
                    hexagram:`${fixture.hexagram.symbol}${fixture.hexagram.name}`,
                    frontier:fine.map((node) => sampleNode(selectionApi,node))
                };
            });
        }
    }
    return {
        stats,
        alpha8Sizes:entriesObject(alpha8Sizes), fineSizes:entriesObject(fineSizes),
        alpha8PatternCounts:entriesObject(alpha8PatternCounts), residualPatternCounts:entriesObject(residualPatternCounts),
        residualReasonCounts:entriesObject(residualReasonCounts), residualReasonSamples, fineChangeSamples
    };
}

function mergeResults(results) {
    const merged = {
        stats:{}, alpha8Sizes:{}, fineSizes:{}, alpha8PatternCounts:{}, residualPatternCounts:{}, residualReasonCounts:{},
        residualReasonSamples:{}, fineChangeSamples:[]
    };
    for (const result of results) {
        mergeObjectCounts(merged.stats, result.stats);
        // maxima are not additive
        merged.stats.maxAlpha8Frontier = Math.max(Number(merged.stats.maxAlpha8Frontier || 0), Number(result.stats.maxAlpha8Frontier || 0));
        merged.stats.maxFineFrontier = Math.max(Number(merged.stats.maxFineFrontier || 0), Number(result.stats.maxFineFrontier || 0));
        mergeObjectCounts(merged.alpha8Sizes, result.alpha8Sizes);
        mergeObjectCounts(merged.fineSizes, result.fineSizes);
        mergeObjectCounts(merged.alpha8PatternCounts, result.alpha8PatternCounts);
        mergeObjectCounts(merged.residualPatternCounts, result.residualPatternCounts);
        mergeObjectCounts(merged.residualReasonCounts, result.residualReasonCounts);
        Object.entries(result.residualReasonSamples || {}).forEach(([key, value]) => { if (!merged.residualReasonSamples[key]) merged.residualReasonSamples[key] = value; });
        for (const sample of result.fineChangeSamples || []) if (merged.fineChangeSamples.length < 12) merged.fineChangeSamples.push(sample);
    }
    // Correct maxima because previous additive merge included them.
    merged.stats.maxAlpha8Frontier = Math.max(...results.map((r) => Number(r.stats.maxAlpha8Frontier || 0)), 0);
    merged.stats.maxFineFrontier = Math.max(...results.map((r) => Number(r.stats.maxFineFrontier || 0)), 0);
    return merged;
}

const pct = (value, total) => total ? `${(Number(value) * 100 / Number(total)).toFixed(2)}%` : '0%';
const topEntries = (obj, limit = 20) => Object.entries(obj || {}).sort((a,b) => Number(b[1]) - Number(a[1])).slice(0,limit);
const reasonLabels = {
    'support-vs-peer':'纯生扶 vs 纯比和：需要明确二者是否存在固定优先关系',
    'benefit-kind-boundary':'清洁助力种类不同：仍涉及生扶/比和边界',
    'outflow-vs-exertion':'纯泄力 vs 纯耗力：需要明确二者是否存在固定轻重关系',
    'soft-cost-kind-boundary':'软负担种类不同：仍涉及泄力/耗力边界',
    'extra-benefit-vs-soft-cost':'额外助力 vs 额外软负担：一方多一种助力但同时多泄力／耗力，属于真正多维权衡',
    'benefit-cost-cross-tradeoff':'助力与软负担交叉：双方都同时有收益与付出，属于真正多维权衡',
    'mixed-vs-soft-cost-only':'有助有负担 vs 仅软负担：一方多助力也多另一类负担，无法仅凭六维布尔值互相支配',
    'same-material-exact':'效力与结构相关性完全同质：当前模型下是真正等价日期',
    'same-material-mixed-trigger-ignored':'同一混合效力，仅触发直接度不同；冻结原则不在 mixed 场景用触发强行决胜',
    'same-material-relevance-tradeoff':'同一效力组合但结构相关性互有高低：属于结构层 Pareto 不可比',
    'other-cross-material':'其他跨效力组合不可比',
    'unclassified':'未分类'
};

function formatSample(sample) {
    if (!sample) return [];
    return [
        `- encoded=${sample.encoded} · ${sample.hexagram}`,
        ...sample.frontier.map((node) => `  - ${node.date} ${node.dayGanZhi}日：${node.materialLabel}；相关性 ${node.relevance}；${node.summary}`)
    ];
}

function writeReport(result) {
    const s = result.stats;
    const residualTotal = Number(s.fineTie || 0);
    const lines = [
        '# 龟甲 v13.44.0-alpha.10 · 六维日期选择冻结审阅',
        '',
        '本阶段把 alpha.9 已验证的六维非补偿 Pareto 正式接入 Candidate Date Selection，并以独立实现再次核对第一前沿；正式页面与复制分析上下文仍不切换。',
        '',
        '冻结原则：受制为硬门槛；同一受制层级内，生扶、比和分别作为独立有利维度，泄力、耗力分别作为独立负担维度；不使用总分。实质效力完全相同时才由 Structural Relevance 细化。独立诊断实现只用于验证生产 comparator 是否忠实执行这一原则。',
        '',
        '## 总体结果',
        '',
        `- 有效卦数：${s.total}`,
        `- schema/运行异常：${s.invalid}`,
        `- 生产六维 comparator 单一第一候选：${s.alpha8Single}（${pct(s.alpha8Single,s.total)}）`,
        `- 生产六维 comparator 剩余并列：${s.alpha8Tie}（${pct(s.alpha8Tie,s.total)}）`,
        `- 独立六维诊断单一第一候选：${s.fineSingle}（${pct(s.fineSingle,s.total)}）`,
        `- 独立六维诊断仍并列：${s.fineTie}（${pct(s.fineTie,s.total)}）`,
        `- 生产 comparator 与独立六维诊断第一前沿完全一致：${s.sameFrontier}（${pct(s.sameFrontier,s.total)}）`,
        `- 独立诊断是生产前沿严格子集：${s.fineStrictSubset}（${pct(s.fineStrictSubset,s.total)}）`,
        `- 生产前沿是独立诊断严格子集：${s.alpha8StrictSubset}（${pct(s.alpha8StrictSubset,s.total)}）`,
        `- 两套前沿互有增删：${s.frontierOverlapChanged}（${pct(s.frontierOverlapChanged,s.total)}）`,
        `- 生产并列 → 独立诊断单选：${s.alpha8TieFineSingle}`,
        `- 生产单选 → 独立诊断并列：${s.alpha8SingleFineTie}`,
        `- 两边都并列但集合发生变化：${s.bothTieChanged}`,
        `- 诊断后剩余并列已获得明确分型：${s.residualTieExplained} / ${s.fineTie}`,
        `- 未分类剩余并列：${s.residualTieUnclassified}`,
        `- 最大第一前沿：${s.maxAlpha8Frontier} → ${s.maxFineFrontier}`,
        '',
        '### 第一前沿大小：生产 comparator → 独立六维诊断',
        ...[...new Set([...Object.keys(result.alpha8Sizes),...Object.keys(result.fineSizes)])].sort((a,b)=>Number(a)-Number(b)).map((key) => `- ${key} 天：${result.alpha8Sizes[key] || 0} → ${result.fineSizes[key] || 0}`),
        '',
        '## 生产 comparator 并列的主要效力组合',
        ...topEntries(result.alpha8PatternCounts, 20).map(([key,count]) => `- ${key.split(' <> ').map(materialLabel).join(' ↔ ')}：${count}`),
        '',
        '## 六维模型下仍然存在的并列原因',
        ''
    ];
    topEntries(result.residualReasonCounts, 20).forEach(([reason,count]) => {
        lines.push(`### ${reasonLabels[reason] || reason}`, '', `- 命中卦数：${count}（占诊断后剩余并列 ${pct(count,residualTotal)}）`, '', ...formatSample(result.residualReasonSamples[reason]), '');
    });
    lines.push(
        '## 生产 comparator 与独立诊断差异样例',
        '',
        'alpha.10 的目标是这里应为空：生产 comparator 与独立六维诊断应得到同一第一前沿。若仍有案例，说明冻结实现与原则不一致。',
        ''
    );
    result.fineChangeSamples.slice(0,8).forEach((sample) => {
        lines.push(`### encoded=${sample.encoded} · ${sample.hexagram}`, '- 生产 comparator：', ...sample.before.map((node) => `  - ${node.date} ${node.dayGanZhi}日：${node.materialLabel}；${node.summary}`), '- 独立六维诊断：', ...sample.after.map((node) => `  - ${node.date} ${node.dayGanZhi}日：${node.materialLabel}；${node.summary}`), '');
    });
    lines.push(
        '## 审计结论',
        '',
        '1. 生产 comparator 必须与独立六维 Pareto 第一前沿完全一致；任何差异都视为实现错误。',
        '2. alpha.10 起冻结日期选择原则：不再使用 coarse benefit/cost，也不引入隐藏权重或总分。',
        '3. 纯生扶 vs 纯比和、纯泄力 vs 纯耗力，以及额外助力伴随额外软负担等真实权衡继续保留并列。',
        '4. Structural Relevance 只细化实质效力完全相同的日期，不得跨六维边界重新排序。',
        '5. 本阶段仍不切换正式页面与复制分析上下文；下一步进入用户文案收束。',
        ''
    );
    const out = path.join(ROOT, 'docs', 'REVIEW_SELECTION_v13.44.0-alpha.10.md');
    fs.writeFileSync(out, lines.join('\n'));
    return out;
}

if (!isMainThread) {
    parentPort.postMessage(runChunk(workerData.start, workerData.end));
} else {
    const requested = Number(process.env.GUIJIA_REVIEW_WORKERS || 0);
    const workers = Math.max(1, Math.min(requested || Math.min(4, os.availableParallelism?.() || os.cpus().length || 2), 8));
    const size = Math.ceil(4096 / workers);
    const tasks = [];
    for (let i = 0; i < workers; i += 1) {
        const start = i * size;
        const end = Math.min(4096, start + size);
        if (start >= end) continue;
        tasks.push(new Promise((resolve, reject) => {
            const worker = new Worker(new URL(import.meta.url), { workerData:{ start, end } });
            worker.once('message', resolve);
            worker.once('error', reject);
            worker.once('exit', (code) => { if (code !== 0) reject(new Error(`tie audit worker exited with code ${code}`)); });
        }));
    }
    const result = mergeResults(await Promise.all(tasks));
    const out = writeReport(result);
    console.log(`Six-dimensional selection review written: ${out}`);
    console.log(JSON.stringify(result.stats, null, 2));
    console.log('Residual reasons:', JSON.stringify(result.residualReasonCounts, null, 2));
}
