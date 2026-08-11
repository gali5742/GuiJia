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
const reviewApi = GuiJia.liuyaoTimeReview;
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
        castTimestamp:CAST_TIME,
        daySect:2,
        dayXun:'甲寅',
        xunKong:'子丑',
        monthZhi:'申',
        dayZhi:'辰',
        question,
        lines:rows,
        fullStructure:core.buildFullHexagramStructure(rows, originalNaJia, changedNaJia, '申', '辰'),
        useGodSelection:{ mode:selectionMode }
    };
    const focus = core.buildQuestionTimeFocus(result, target);
    return {
        encoded, rawValues, originalLines, changedLines, rows, target, result, focus,
        hexagram:core.getHexagram(originalLines), changedHexagram:core.getHexagram(changedLines), palace
    };
}

function candidateForDate(fixture, dateText) {
    if (!dateText) return null;
    const [y,m,d] = dateText.split('/').map(Number);
    if (![y,m,d].every(Number.isFinite)) return null;
    return core.buildCandidateTimeOutputForDay(fixture.result, fixture.target, new Date(y, m - 1, d, 12, 0, 0), 2, 3);
}

function differenceReason(fixture, review) {
    const oldDate = review.comparison.legacy.preferredDates[0] || '';
    const newDate = review.comparison.candidate.preferredDates[0] || '';
    if (!oldDate || !newDate || oldDate === newDate) return review.comparison.kind;
    const oldCandidate = candidateForDate(fixture, oldDate)?.dateAssessment;
    const newCandidate = candidateForDate(fixture, newDate)?.dateAssessment;
    if (!oldCandidate || !newCandidate) return 'profile-unavailable';
    const oldFlags = oldCandidate.flags || {};
    const newFlags = newCandidate.flags || {};
    if (oldFlags.constraint && !newFlags.constraint) return '新版避开明确受制';
    if (!oldFlags.support && newFlags.support) return '新版获得明确生扶';
    if (!oldFlags.peer && newFlags.peer && !newFlags.constraint) return '新版获得比和且无明确受制';
    if ((oldFlags.outflow || oldFlags.exertion) && !(newFlags.outflow || newFlags.exertion)) return '新版减少泄力/耗力';
    if (oldCandidate.code === 'caution' && ['preferred','secondary','mixed','observe'].includes(newCandidate.code)) return '新版效力级别提高';
    if (selectionApi.paretoDominatesWithinConstraintClass(newCandidate, oldCandidate)) return '新版非补偿比较器重新排序';
    return '实质效力组合变化';
}

function shortProfile(profile) {
    if (!profile) return '无';
    const labels = {support:'生扶',peer:'比和',constraint:'受制',outflow:'泄力',exertion:'耗力',trigger:'触发'};
    const active = Object.entries(profile.flags || {}).filter(([,v]) => v).map(([k]) => labels[k] || k);
    return `${profile.label || profile.code}${active.length ? `〔${active.join('、')}〕` : ''}`;
}

function makeSample(fixture, review, reason) {
    const oldDate = review.comparison.legacy.preferredDates[0] || '';
    const newDate = review.comparison.candidate.preferredDates[0] || '';
    const oldLegacyNode = (fixture.focus.keyNodes || fixture.focus.entries || []).find((item) => item.dateText === oldDate) || null;
    const newCandidateNode = (fixture.focus.candidateOutput?.keyNodes || fixture.focus.candidateOutput?.entries || []).find((item) => item.dateText === newDate) || null;
    const oldCandidate = candidateForDate(fixture, oldDate);
    const newCandidate = candidateForDate(fixture, newDate);
    return {
        encoded:fixture.encoded,
        rawValues:fixture.rawValues,
        hexagram:`${fixture.hexagram.symbol}${fixture.hexagram.name}（${fixture.hexagram.number}）`,
        changedHexagram:fixture.hexagram.name === fixture.changedHexagram.name && fixture.rawValues.every((v) => v === 7 || v === 8)
            ? '静卦'
            : `${fixture.changedHexagram.symbol}${fixture.changedHexagram.name}（${fixture.changedHexagram.number}）`,
        shi:`${fixture.target.label}${fixture.target.relation}${fixture.target.branch}${fixture.target.element}`,
        kind:review.comparison.kind,
        reason,
        oldDate,newDate,
        oldComparison:review.comparison.legacy.summary,
        newComparison:review.comparison.candidate.summary,
        oldLegacySummary:oldLegacyNode?.effectSummary || '',
        oldUnderNew:shortProfile(oldCandidate?.dateAssessment),
        newUnderNew:shortProfile(newCandidate?.dateAssessment),
        newSummary:newCandidateNode?.effectSummary || newCandidate?.summary?.text || '',
        newFacts:(newCandidateNode?.facts || newCandidate?.facts || []).slice(0,4)
    };
}

function candidateProfilesForScope(fixture) {
    const expand = GuiJia.questionTime?.expandScopeDates;
    if (typeof expand !== 'function' || !fixture.focus?.scope) return [];
    return expand(fixture.focus.scope, 40).map((dateObj) => {
        const dateText = `${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()}`;
        const output = core.buildCandidateTimeOutputForDay(fixture.result, fixture.target, dateObj, 2, 3);
        return { dateText, output, profile:output?.dateAssessment || null };
    }).filter((item) => item.profile);
}

function reviewRankRisks(fixture) {
    if (fixture.focus?.mode !== 'date-selection') return [];
    const chosenDate = fixture.focus?.candidateOutput?.comparison?.preferredDates?.[0] || '';
    if (!chosenDate) return [];
    const exposed = fixture.focus?.kind === 'range'
        ? (fixture.focus?.candidateOutput?.keyNodes || [])
        : (fixture.focus?.candidateOutput?.entries || []);
    const exposedChosen = exposed.find((item) => item.dateText === chosenDate);
    const chosenProfile = exposedChosen?.assessment || null;
    const flags = chosenProfile?.flags || {};
    // 只有“mixed 且明确受制”的首选才需要检查跨级排序风险；绝大多数卦无需再次扫描整个范围。
    if (chosenProfile?.code !== 'mixed' || !flags.constraint) return [];
    const profiles = candidateProfilesForScope(fixture);
    const chosen = profiles.find((item) => item.dateText === chosenDate) || { dateText:chosenDate, profile:chosenProfile };
    const risks = [];
    const costOnly = profiles.find((item) => item.dateText !== chosenDate
        && item.profile.code === 'caution'
        && !item.profile.flags?.constraint
        && (item.profile.flags?.outflow || item.profile.flags?.exertion));
    if (costOnly) risks.push({ code:'mixed-constraint-over-cost-only', chosenDate, alternativeDate:costOnly.dateText, chosen:chosen.profile, alternative:costOnly.profile });
    const observe = profiles.find((item) => item.dateText !== chosenDate && item.profile.code === 'observe' && !item.profile.flags?.constraint);
    if (observe) risks.push({ code:'mixed-constraint-over-observe', chosenDate, alternativeDate:observe.dateText, chosen:chosen.profile, alternative:observe.profile });
    return risks;
}

function riskSample(fixture, risk) {
    const chosenOutput = candidateForDate(fixture, risk.chosenDate);
    const altOutput = candidateForDate(fixture, risk.alternativeDate);
    return {
        encoded:fixture.encoded,
        hexagram:`${fixture.hexagram.symbol}${fixture.hexagram.name}（${fixture.hexagram.number}）`,
        changedHexagram:`${fixture.changedHexagram.symbol}${fixture.changedHexagram.name}（${fixture.changedHexagram.number}）`,
        shi:`${fixture.target.label}${fixture.target.relation}${fixture.target.branch}${fixture.target.element}`,
        code:risk.code,
        chosenDate:risk.chosenDate,
        alternativeDate:risk.alternativeDate,
        chosenProfile:shortProfile(risk.chosen),
        alternativeProfile:shortProfile(risk.alternative),
        chosenSummary:chosenOutput?.summary?.text || '',
        alternativeSummary:altOutput?.summary?.text || ''
    };
}

function runQuestion(question, mode) {
    const stats = { total:0, same:0, changed:0, kinds:{}, reasons:{}, risks:{}, invalid:0 };
    const samplesByReason = new Map();
    const samplesByRisk = new Map();
    for (let encoded = 0; encoded < 4096; encoded += 1) {
        const fixture = buildFixture(encoded, question, mode);
        const review = reviewApi.buildQuestionTimeReview(fixture.focus);
        stats.total += 1;
        if (!review || reviewApi.validateQuestionTimeReview(review).length) { stats.invalid += 1; continue; }
        reviewRankRisks(fixture).forEach((risk) => {
            stats.risks[risk.code] = (stats.risks[risk.code] || 0) + 1;
            const list = samplesByRisk.get(risk.code) || [];
            if (list.length < 2) list.push(riskSample(fixture, risk));
            samplesByRisk.set(risk.code, list);
        });
        if (review.comparison.same) { stats.same += 1; continue; }
        stats.changed += 1;
        stats.kinds[review.comparison.kind] = (stats.kinds[review.comparison.kind] || 0) + 1;
        const reason = differenceReason(fixture, review);
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        const list = samplesByReason.get(reason) || [];
        if (list.length < 2) list.push(makeSample(fixture, review, reason));
        samplesByReason.set(reason, list);
    }
    return { stats, samples:[...samplesByReason.values()].flat(), riskSamples:[...samplesByRisk.values()].flat() };
}

const weekly = runQuestion('这周哪天适合出行', 'question');
const alternatives = runQuestion('明天还是周五哪个好', 'default');

function pct(n,d) { return d ? `${(n * 100 / d).toFixed(2)}%` : '0.00%'; }
function sortedEntries(obj) { return Object.entries(obj).sort((a,b) => b[1] - a[1]); }
function reportSection(title, result) {
    const { stats, samples } = result;
    const lines = [`## ${title}`, '', `- 总卦数：${stats.total}`, `- 新旧首选/并列结论一致：${stats.same}（${pct(stats.same, stats.total)}）`, `- 新旧比较结论变化：${stats.changed}（${pct(stats.changed, stats.total)}）`, `- Review schema 异常：${stats.invalid}`, '', '### 差异类型'];
    sortedEntries(stats.kinds).forEach(([key,value]) => lines.push(`- ${key}：${value}（${pct(value, stats.changed)}）`));
    lines.push('', '### 主要重排原因');
    sortedEntries(stats.reasons).forEach(([key,value]) => lines.push(`- ${key}：${value}（${pct(value, stats.changed)}）`));
    lines.push('', '### Candidate 排序需人工复核的跨级场景');
    const riskEntries = sortedEntries(stats.risks || {});
    if (!riskEntries.length) lines.push('- 未检出。');
    else riskEntries.forEach(([key,value]) => lines.push(`- ${key}：${value}（占全部 ${pct(value, stats.total)}）`));
    (result.riskSamples || []).forEach((sample) => {
        lines.push('', `#### 风险样例 encoded=${sample.encoded} · ${sample.hexagram} → ${sample.changedHexagram}`);
        lines.push(`- 世爻：${sample.shi}`);
        lines.push(`- 场景：${sample.code}`);
        lines.push(`- 新模型当前首选 ${sample.chosenDate}：${sample.chosenProfile}；${sample.chosenSummary}`);
        lines.push(`- 被压后的日期 ${sample.alternativeDate}：${sample.alternativeProfile}；${sample.alternativeSummary}`);
    });
    lines.push('', '### 代表案例');
    samples.forEach((sample) => {
        lines.push('', `#### encoded=${sample.encoded} · ${sample.hexagram} → ${sample.changedHexagram}`);
        lines.push(`- 掷币值（初→上）：${sample.rawValues.join(' / ')}`);
        lines.push(`- 世爻：${sample.shi}`);
        lines.push(`- 差异：${sample.kind}；${sample.reason}`);
        lines.push(`- 旧比较：${sample.oldComparison || '无'}`);
        lines.push(`- 新比较：${sample.newComparison || '无'}`);
        if (sample.oldDate) lines.push(`- 旧首选 ${sample.oldDate} 在新模型下：${sample.oldUnderNew}${sample.oldLegacySummary ? `；旧节点摘要「${sample.oldLegacySummary}」` : ''}`);
        if (sample.newDate) lines.push(`- 新首选 ${sample.newDate}：${sample.newUnderNew}${sample.newSummary ? `；新节点摘要「${sample.newSummary}」` : ''}`);
        sample.newFacts.forEach((fact) => lines.push(`  - ${fact}`));
    });
    return lines.join('\n');
}

const report = [
    '# 龟甲 v13.44.0-alpha.6 · 新旧时间判断对照审阅报告',
    '',
    '本报告只用于 v13.44.0 重构开发期审阅。正式页面与「复制分析上下文」仍使用 legacy 输出。',
    '',
    '固定环境：2026-08-10 丙辰日、申月、子丑空、24:00 换日；穷举 4096 种六爻掷币组合。',
    '',
    reportSection('A. 「这周哪天适合出行」', weekly),
    '',
    reportSection('B. 「明天还是周五哪个好」', alternatives),
    '',
    '## 核心观察',
    '',
    `- 「这周哪天适合出行」有 ${weekly.stats.changed} / ${weekly.stats.total}（${pct(weekly.stats.changed, weekly.stats.total)}）出现新旧比较结论变化；其中真正首选日期变化 ${weekly.stats.kinds['preferred-date-changed'] || 0} 组，其余主要是旧并列被新模型拆分或并列集合变化。`,
    `- 「明天还是周五哪个好」有 ${alternatives.stats.changed} / ${alternatives.stats.total}（${pct(alternatives.stats.changed, alternatives.stats.total)}）比较结论变化；真正首选日期变化 ${alternatives.stats.kinds['preferred-date-changed'] || 0} 组。`,
    `- Candidate 当前检出 mixed（含明确受制）压过仅泄力/耗力 caution 的跨级场景：周范围 ${weekly.stats.risks['mixed-constraint-over-cost-only'] || 0} 组，离散两日 ${alternatives.stats.risks['mixed-constraint-over-cost-only'] || 0} 组。该项必须在正式切换前单独确认排序原则。`,
    '',
    '## 阶段结论',
    '',
    'alpha.6 只建立对照审阅能力，不据此自动切换正式输出。当前 Candidate 摘要/证据链本身稳定，但日期比较器仍有需要人工确认的跨级排序边界；因此不建议直接进入正式前台切换。'
].join('\n');

const outPath = path.join(ROOT, 'docs', 'REVIEW_v13.44.0-alpha.6.md');
fs.writeFileSync(outPath, `${report}\n`, 'utf8');
console.log(JSON.stringify({ weekly:weekly.stats, alternatives:alternatives.stats, report:path.relative(ROOT,outPath) }, null, 2));
