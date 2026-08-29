#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) throw new Error(message);
}
function test(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
    }
}
function loadScripts(relativeFiles) {
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    relativeFiles.forEach((relative) => {
        const filename = path.join(ROOT, relative);
        vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    });
    return context.GuiJia;
}

const GuiJia = loadScripts([
    'js/common.js',
    'js/bazi-core.js',
    'js/bazi-timing.js',
    'js/bazi-transit-analysis.js',
    'js/bazi-literature.js',
    'js/bazi-interpretation.js',
    'js/bazi-detail.js'
]);
const bazi = GuiJia.baziCore;
const baziTransitAnalysis = GuiJia.baziTransitAnalysis;
const baziLit = GuiJia.baziLiterature;
const baziInterpretation = GuiJia.baziInterpretation;
const baziDetail = GuiJia.baziDetail;

function makeDingChart() {
    const dayGan = '丁';
    const gans = ['丁','壬','丁','己'];
    const zhis = ['丑','子','亥','酉'];
    const pillars = gans.map((gan, index) => ({
        title: ['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi: zhis[index],
        ganZhi: gan + zhis[index],
        shishenGan: index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan: hiddenGan,
            level,
            wuxing: bazi.getWuXing(hiddenGan),
            shishen: bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason('子', '火');
    return { dayGan, gans, zhis, pillars, internalRelations, monthSeason };
}

function makeResult() {
    const chart = makeDingChart();
    return {
        dayGan: chart.dayGan,
        dayGanWuXing: '火',
        pillars: chart.pillars,
        internalRelations: chart.internalRelations,
        monthSeason: chart.monthSeason,
        dayMasterEvidence: bazi.buildDayMasterEvidence(chart.pillars, chart.monthSeason, chart.internalRelations, chart.dayGan),
        matchedLiterature: [],
        lunarStr: '测试农历',
        ruleSummary: '测试口径'
    };
}

test('四层语义中间层阻断“存在=有效”', () => {
    const output = baziInterpretation.buildBaziInterpretation(makeResult());
    const model = output.semanticModel;
    assert(model && model.facts.length && model.derivedFacts.length && model.structures.length, '缺 Fact / Derived Fact / Structure');
    assert(Array.isArray(model.assessments) && model.assessments.length === 0, '当前原局模块不应预生成 Assessment');
    assert(model.assessmentBoundary.includes('不得自动升级为实际效力判断'), 'Assessment 边界缺失');
    assert(model.derivedFacts.some((item) => item.id === 'D06' && item.text.includes('亥藏甲为正印')), '藏干正印未停留在派生事实层');
    const support = output.judgments.find((item) => item.id === 'support-location');
    assert(support && support.title.includes('扶身要素') && !support.title.includes('扶身力量'), '扶身存在性仍被写成实际力量');
    assert(!/(Assessment|这里只确认|不据此|不自动等于|身强身弱终判)/.test(support.summary), '前台扶身解释仍泄漏内部边界');
    assert(support.contextNote.includes('实际扶身效力'), '内部效力边界未保留');
});

test('前台结构解读不泄漏内部语义层和防御说明', () => {
    const result = makeResult();
    const output = baziInterpretation.buildBaziInterpretation(result);
    const displayText = output.judgments.map((item) => item.summary).join('');
    assert(!/(Assessment|本程序|当前程序|这里只确认|不据此|不自动判定|实际有效)/.test(displayText), `前台结构解读仍含内部说明：${displayText}`);
    const contextText = baziInterpretation.buildBaziContextText(result, output);
    assert(!contextText.includes('后续 Assessment 层') && !contextText.includes('实际扶身效力'), '复制上下文仍逐条重复内部边界');
    assert((contextText.match(/不得自动升级为实际效力判断/g) || []).length === 1, 'Assessment 全局边界未收束为一次');
});

test('完整组合与并存关系具有不同 structuralRole', () => {
    assert(bazi.baziRelationMeta.SAN_HUI_COMPLETE.structuralRole === 'majorCompositeStructure', '完整三会未标为主要组合');
    assert(bazi.baziRelationMeta.BRANCH_SIX_HARMONY.structuralRole === 'coexistingRelation', '六合未标为并存关系');
    const model = baziInterpretation.buildBaziInterpretation(makeResult()).semanticModel;
    assert(model.structures[0].id === 'S01' && model.structures[0].code === 'SAN_HUI_COMPLETE', 'Structure 未按解释优先级连续编号');
    assert(model.structures.some((item) => item.code === 'BRANCH_SIX_HARMONY' && item.structuralRole === 'coexistingRelation'), '六合未在 Structure 层保留');
});

test('旺相休囚死与十二长生使用独立体系标签', () => {
    const monthSeason = bazi.buildMonthSeason('子', '火');
    const dayState = monthSeason.states.find((item) => item.isDayMaster);
    assert(dayState.system === 'seasonalFiveStates' && dayState.systemLabel === '旺相休囚死', '季节状态缺体系标签');
    const diShi = bazi.getDiShiRecord('丁', '酉');
    assert(diShi.system === 'twelveGrowthStages' && diShi.systemLabel === '十二长生' && diShi.state === '长生', '十二长生体系记录异常');
});

test('复制上下文使用证据 ID 去重并保留 Assessment 空层', () => {
    const result = makeResult();
    const output = baziInterpretation.buildBaziInterpretation(result);
    const text = baziInterpretation.buildBaziContextText(result, output);
    assert(text.includes('【Fact｜原始事实】') && text.includes('【Derived Fact｜派生事实】') && text.includes('【Structure｜结构关系】') && text.includes('【Assessment｜作用与结论层】'), '复制上下文未输出四层语义结构');
    assert(text.includes('依据：D01、D02、D03、D04'), '结构解释未引用证据 ID');
    assert(text.includes('- S01｜[主要组合] 原局构成三会水方【亥子丑】'), '主要组合未在 Structure 层优先呈现');
    assert(!text.includes('【强弱相关证据】') && !text.includes('【原局干支关系】'), '新上下文仍重复输出旧证据区');
    assert(!text.includes('【使用边界】'), 'Assessment 之外仍重复输出独立使用边界区');
    assert(text.includes('命盘事实与结构判断仅以以上 Fact、Derived Fact 与 Structure 为依据'), '使用要求未明确事实来源权限');
    assert(text.includes('古籍参考仅作解释与对照'), '使用要求未明确古籍权限边界');
});

test('透干总括保留具体十神，不把上位类别误写成同透', () => {
    const output = baziInterpretation.buildBaziInterpretation(makeResult());
    assert(output.headline.includes('食神与正官同见天干'), `未保留具体透干十神：${output.headline}`);
    assert(!output.headline.includes('食伤与官杀同透'), `上位类别误写为同透：${output.headline}`);
});

test('古籍匹配元数据区分条件模式与结构参考', () => {
    const chart = makeDingChart();
    const entries = baziLit.buildMatchedLiterature(
        chart.dayGan, chart.gans, chart.zhis, chart.pillars, chart.internalRelations, chart.monthSeason
    );
    const qiong = entries.find((item) => item.id === 'qiongtong-丁-子');
    assert(qiong?.matchType === 'conditionalPattern' && qiong.applicability === 'needs-review', '穷通宝鉴月令条未标为条件模式');
    assert(qiong?.contextMatch.includes('甲未见于天干（未透）；藏干见于日柱亥'), '“甲未见”未明确搜索范围');
    const huiRef = entries.find((item) => item.id === 'ziping-hui-change');
    assert(huiRef?.matchType === 'structuralReference' && huiRef.applicability === 'reference-only', '《论用神变化》未降级为结构参考');
    assert(huiRef?.unverifiedConditions?.some((item) => item.includes('直接条件')), '《论用神变化》未记录待核证触发条件');
    assert(!huiRef?.contextMatch.includes('月令【子】不能只按单支孤立阅读'), '仍把程序结构观点写成当前原文直接结论');
});

test('复制上下文古籍去重并只保留具体核对条件', () => {
    const chart = makeDingChart();
    const entries = baziLit.buildMatchedLiterature(
        chart.dayGan, chart.gans, chart.zhis, chart.pillars, chart.internalRelations, chart.monthSeason
    );
    const result = makeResult();
    result.matchedLiterature = entries;
    const output = baziInterpretation.buildBaziInterpretation(result);
    const text = baziInterpretation.buildBaziContextText(result, output);
    const literatureText = text.split('【古籍参考】')[1]?.split('【使用要求】')[0] || '';
    const count = (needle) => literatureText.split(needle).length - 1;
    assert(count('《三命通会》·卷八·六丁日己酉时断') === 1, '已有原文时仍重复输出《三命通会》定位条');
    assert(count('《八字提要》·丁日子月·己酉时') === 1, '已有原文时仍重复输出《八字提要》定位条');
    assert(literatureText.includes('原文点名天干核对') && literatureText.includes('甲未见于天干（未透）；藏干见于日柱亥'), '穷通宝鉴具体透藏核对被压缩丢失');
    assert(!/(这里只确认|不据此|不能直接视为|本程序|当前程序)/.test(literatureText), `古籍复制区仍重复防御叙述：${literatureText}`);
});

test('详细页古籍条件对照不回流 contextMatch 防御说明', () => {
    const chart = makeDingChart();
    const entries = baziLit.buildMatchedLiterature(
        chart.dayGan, chart.gans, chart.zhis, chart.pillars, chart.internalRelations, chart.monthSeason
    );
    const result = makeResult();
    result.matchedLiterature = entries;
    const detail = baziDetail.buildBaziDetail(result);
    assert(detail.literatureChecks.length > 0, '古籍条件对照为空');
    assert(!detail.literatureChecks.some((item) => item.id === 'ziping-hui-change'), 'reference-only 条目仍进入条件对照');
    assert(detail.literatureChecks.some((item) => item.id === 'qiongtong-丁-子'), '条件型月令条未保留');
    detail.literatureChecks.forEach((item) => {
        assert(!/(本程序|当前程序|这里只确认|不据此|不能直接|Assessment|当前证据强度)/.test(item.check), `${item.id} 前台仍含防御说明：${item.check}`);
        assert(['条目对应','条件对应','条目定位'].includes(item.status), `${item.id} 状态仍为句子猜测：${item.status}`);
    });
});


test('岁运复制上下文分区平级，并将同干主题与结构事实分层', () => {
    const result = makeResult();
    result.originalGans = ['丁','壬','丁','己'];
    result.originalZhis = ['丑','子','亥','酉'];
    result.internalRelations = [];
    const daYun = {
        gan:'己', zhi:'酉', shiShen:'食神', diShi:'长生', naYin:'—', xun:'—', xunKong:'—',
        pillarSignals:[], stemRelations:[], relations:[]
    };
    const liuNian = {
        year:2026, gan:'丙', zhi:'午', shiShen:'劫财', diShi:'临官', naYin:'—', xun:'—', xunKong:'—',
        pillarSignals:[], stemRelations:[], relations:[], yunRelations:[], layeredRelations:[]
    };
    const sameStem = {
        code:bazi.baziTransitRelationCodes.STEM_SAME,
        type:'stem', layerLabels:['流年','流月'], stems:['丙','丙'], text:'测试同干'
    };
    const liuYue = {
        monthName:'七', gan:'丙', zhi:'申', shiShen:'劫财', diShi:'沐浴', naYin:'—', xun:'—', xunKong:'—',
        pillarSignals:[], stemRelations:[], relations:[], yearRelations:[sameStem], yunRelations:[], layeredRelations:[]
    };
    const daYunAnalysis = baziTransitAnalysis.buildDaYunAnalysis(result, daYun);
    const liuNianAnalysis = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, liuNian);
    const liuYueAnalysis = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, liuNian, liuYue);
    const layerFact = liuYueAnalysis.rows.find((row) => row.label === '层间衔接')?.text || '';
    assert(layerFact.includes('同一天干在两个时间层重复'), `同干结构事实未收纯：${layerFact}`);
    assert(!layerFact.includes('主题'), `主题解释仍混入结构事实：${layerFact}`);
    assert(liuYueAnalysis.contextHints?.some((item) => item.text.includes('劫财') && item.text.includes('延续')), '流月同干主题未移入解释提示');

    const text = baziTransitAnalysis.buildBaziTransitContextText(result, { headline:'测试原局', judgments:[] }, {
        daYun, liuNian, liuYue, daYunAnalysis, liuNianAnalysis, liuYueAnalysis
    });
    assert(text.includes('解释提示：\n- 层间主题：'), '流月解释提示区缺层间主题');
    assert(text.includes('\n\n结构事实：'), '结构事实标题未与上一 bullet 平级分隔');
    assert(text.includes('\n\n结构证据：'), '结构证据标题未与上一 bullet 平级分隔');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
