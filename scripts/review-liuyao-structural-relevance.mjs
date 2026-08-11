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
const selectionApi = GuiJia.liuyaoTimeSelection;
const rawOptions = [6,7,8,9];
const CAST_TIME = new Date(2026, 7, 10, 20, 25, 0).getTime();

function decodeRawValues(encoded) {
    let cursor = encoded;
    const values = [];
    for (let i = 0; i < 6; i += 1) { values.push(rawOptions[cursor % 4]); cursor = Math.floor(cursor / 4); }
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
        useGodSelection:{ mode:selectionMode }
    };
    const focus = core.buildQuestionTimeFocus(result, target);
    return { encoded, target, result, focus, hexagram:core.getHexagram(originalLines) };
}

function candidateNodesForScope(fixture) {
    const expand = GuiJia.questionTime?.expandScopeDates;
    if (fixture.focus?.kind === 'point') {
        return (fixture.focus.entries || []).map((entry) => {
            const [y,m,d] = entry.dateText.split('/').map(Number);
            const dateObj = new Date(y,m-1,d,12);
            return { dateText:entry.dateText, dayGanZhi:entry.dayGanZhi, sortTime:dateObj.getTime(), candidateOutput:core.buildCandidateTimeOutputForDay(fixture.result, fixture.target, dateObj, 2, 3) };
        });
    }
    if (typeof expand !== 'function' || !fixture.focus?.scope) return [];
    return expand(fixture.focus.scope, 40).map((dateObj) => ({
        dateText:`${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()}`,
        dayGanZhi:Solar.fromDate(dateObj).getLunar().getDayInGanZhi(), sortTime:dateObj.getTime(),
        candidateOutput:core.buildCandidateTimeOutputForDay(fixture.result, fixture.target, dateObj, 2, 3)
    }));
}

const profile = (node) => selectionApi.profileFromNode(node);
const flags = (node) => selectionApi.materialSelectionProfile(profile(node));
const alpha7Dominates = (a, b) => {
    const av = flags(a), bv = flags(b);
    if (av.constraint !== bv.constraint) return false;
    const aBenefit = av.support || av.peer, bBenefit = bv.support || bv.peer;
    const aCost = av.outflow || av.exertion, bCost = bv.outflow || bv.exertion;
    return Number(aBenefit) >= Number(bBenefit) && Number(aCost) <= Number(bCost) && (aBenefit !== bBenefit || aCost !== bCost);
};
const preferredConstraintClass = (nodes) => nodes.some((n) => !flags(n).constraint) ? false : true;
const alpha7Frontier = (nodes) => {
    const c = preferredConstraintClass(nodes);
    const same = nodes.filter((n) => flags(n).constraint === c);
    return same.filter((candidate, i) => !same.some((other, j) => i !== j && alpha7Dominates(other, candidate)));
};
const set = (nodes) => new Set(nodes.map((n) => n.dateText));
const subset = (a, b) => [...a].every((x) => b.has(x));
const relRanks = (node) => {
    const p = profile(node)?.structuralRelevance?.dimensions || {};
    return Object.fromEntries(['trigger','support','peer','constraint','outflow','exertion'].map((k) => [k, Number(p[k]?.rank || 0)]));
};

function run(question, mode) {
    const stats = {
        total:0, invalid:0, alpha7Single:0, alpha8Single:0, alpha7Tie:0, alpha8Tie:0,
        refined:0, unchanged:0, frontierSubsetViolation:0, crossMaterialRemoval:0,
        maxBefore:0, maxAfter:0, removedDates:0, triggerRefinements:0, materialRelevanceRefinements:0,
        residualSupportPeer:0, residualSameSignature:0
    };
    const beforeSizes = {}, afterSizes = {};
    const samples = [];
    for (let encoded = 0; encoded < 4096; encoded += 1) {
        const fixture = buildFixture(encoded, question, mode);
        const nodes = candidateNodesForScope(fixture);
        if (!nodes.length) { stats.invalid += 1; continue; }
        const before = alpha7Frontier(nodes);
        const after = selectionApi.nondominatedFrontier(nodes);
        const errors = selectionApi.validateSelectionComparison(selectionApi.buildDateSelectionComparison(nodes), nodes);
        if (errors.length) { stats.invalid += 1; continue; }
        stats.total += 1;
        stats.maxBefore = Math.max(stats.maxBefore, before.length); stats.maxAfter = Math.max(stats.maxAfter, after.length);
        beforeSizes[before.length] = (beforeSizes[before.length] || 0) + 1;
        afterSizes[after.length] = (afterSizes[after.length] || 0) + 1;
        if (before.length === 1) stats.alpha7Single += 1; else stats.alpha7Tie += 1;
        if (after.length === 1) stats.alpha8Single += 1; else stats.alpha8Tie += 1;
        const beforeSet = set(before), afterSet = set(after);
        if (!subset(afterSet, beforeSet)) stats.frontierSubsetViolation += 1;
        const removed = before.filter((n) => !afterSet.has(n.dateText));
        if (removed.length) {
            stats.refined += 1; stats.removedDates += removed.length;
            removed.forEach((r) => {
                const sameMaterialDominator = after.find((keep) => selectionApi.materiallyEquivalent(profile(keep), profile(r)) && selectionApi.structuralRelevanceDominatesEquivalent(profile(keep), profile(r)));
                if (!sameMaterialDominator) stats.crossMaterialRemoval += 1;
                else {
                    const rr = relRanks(r), kr = relRanks(sameMaterialDominator);
                    const materialKinds = ['support','peer','constraint','outflow','exertion'];
                    const materialChanged = materialKinds.some((k) => rr[k] !== kr[k]);
                    if (materialChanged) stats.materialRelevanceRefinements += 1;
                    else if (rr.trigger !== kr.trigger) stats.triggerRefinements += 1;
                }
            });
            if (samples.length < 12) samples.push({
                encoded, hexagram:`${fixture.hexagram.symbol}${fixture.hexagram.name}`,
                before:before.map((n) => `${n.dateText}[${selectionApi.selectionSignature(profile(n))};${selectionApi.structuralRelevanceSignature(profile(n))}]`).join('、'),
                after:after.map((n) => `${n.dateText}[${selectionApi.selectionSignature(profile(n))};${selectionApi.structuralRelevanceSignature(profile(n))}]`).join('、')
            });
        } else stats.unchanged += 1;
        if (after.length > 1) {
            const sigs = [...new Set(after.map((n) => selectionApi.selectionSignature(profile(n))))];
            if (sigs.length < after.length) stats.residualSameSignature += 1;
            const hasSupport = after.some((n) => flags(n).support && !flags(n).peer);
            const hasPeer = after.some((n) => flags(n).peer && !flags(n).support);
            if (hasSupport && hasPeer) stats.residualSupportPeer += 1;
        }
    }
    return { stats, beforeSizes, afterSizes, samples };
}

const weekly = run('这周哪天适合出行', 'question');
const alternatives = run('明天还是周五哪个好', 'default');
const pct = (v,t) => t ? `${(v*100/t).toFixed(2)}%` : '0%';
function linesFor(title, r) {
    const s=r.stats;
    return [
        `## ${title}`,'',
        `- 有效卦数：${s.total}`,
        `- schema/运行异常：${s.invalid}`,
        `- alpha.7 单一第一候选：${s.alpha7Single}（${pct(s.alpha7Single,s.total)}）`,
        `- alpha.8 单一第一候选：${s.alpha8Single}（${pct(s.alpha8Single,s.total)}）`,
        `- alpha.7 并列：${s.alpha7Tie}（${pct(s.alpha7Tie,s.total)}）`,
        `- alpha.8 并列：${s.alpha8Tie}（${pct(s.alpha8Tie,s.total)}）`,
        `- 第一前沿被结构相关性实际细化：${s.refined}（${pct(s.refined,s.total)}）`,
        `- 被移出第一前沿的日期数：${s.removedDates}`,
        `- alpha.8 第一前沿不是 alpha.7 子集：${s.frontierSubsetViolation}`,
        `- 跨实质效力组合误移除：${s.crossMaterialRemoval}`,
        `- 由实质维度来源相关性细化：${s.materialRelevanceRefinements}`,
        `- 仅由触发重要度细化：${s.triggerRefinements}`,
        `- 剩余并列中仍含“纯生扶 vs 纯比和”：${s.residualSupportPeer}`,
        `- 剩余并列中仍有相同实质签名日期：${s.residualSameSignature}`,
        `- 最大第一前沿：${s.maxBefore} → ${s.maxAfter}`,'',
        '### 前沿大小：alpha.7 → alpha.8',
        ...[...new Set([...Object.keys(r.beforeSizes),...Object.keys(r.afterSizes)])].sort((a,b)=>Number(a)-Number(b)).map((k)=>`- ${k} 天：${r.beforeSizes[k]||0} → ${r.afterSizes[k]||0}`),
        '', '### 结构相关性实际改变第一前沿的样例',
        ...r.samples.flatMap((x)=>['',`#### encoded=${x.encoded} · ${x.hexagram}`,`- alpha.7：${x.before}`,`- alpha.8：${x.after}`])
    ];
}

const report = [
    '# 龟甲 v13.44.0-alpha.8 · 结构相关性 / 触发重要度审阅报告','',
    '本阶段不切换正式页面或复制上下文。结构相关性只细化“实质效力组合完全相同”的日期；不会把生扶与比和、泄力与耗力重新换算为总分。','',
    '层级：直接作用于观察爻 > 观察爻之变 > 世应轴 > 关键关系爻 > 结构组合 > 背景结构。','',
    ...linesFor('A. 这周哪天适合出行', weekly),'',
    ...linesFor('B. 明天还是周五哪个好', alternatives),'',
    '## 结论边界','',
    '- alpha.8 只做同质日期的结构相关性细化，因此第一前沿必须是 alpha.7 第一前沿的子集。',
    '- 如果大量剩余并列来自“纯生扶 vs 纯比和”，说明仅靠结构相关性无法解决，下一步需要明确是否真的要规定二者优先关系，而不能偷偷用权重解决。',''
].join('\n');
const out = path.join(ROOT,'docs','REVIEW_RELEVANCE_v13.44.0-alpha.8.md');
fs.writeFileSync(out, report);
console.log(`Relevance review written: ${out}`);
console.log(JSON.stringify({ weekly:weekly.stats, alternatives:alternatives.stats }, null, 2));
