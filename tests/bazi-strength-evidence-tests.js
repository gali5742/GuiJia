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
    'js/bazi-strength-evidence.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);
const bazi = GuiJia.baziCore;
const extractor = GuiJia.baziStrengthEvidence;
const interpretation = GuiJia.baziInterpretation;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉']) {
    const dayGan = gans[2];
    const dayElement = bazi.getWuXing(dayGan);
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi:zhis[index],
        ganZhi:gan + zhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan:hiddenGan,
            level,
            wuxing:bazi.getWuXing(hiddenGan),
            shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason(zhis[1], dayElement);
    return {
        dayGan,
        dayGanWuXing:dayElement,
        pillars,
        internalRelations,
        monthSeason,
        dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, internalRelations, dayGan),
        matchedLiterature:[],
        lunarStr:'测试农历',
        ruleSummary:'测试口径'
    };
}

test('丁丑壬子丁亥己酉按合同抽取季节、明干与年日时支三类证据', () => {
    const result = makeResult();
    const output = interpretation.buildBaziInterpretation(result);
    const strength = output.semanticModel?.strengthEvidence;
    assert(strength?.version === '0.1', `extractor version 异常：${strength?.version}`);
    assert(strength?.contractId === 'qianli-basic-strength-evidence', `contractId 异常：${strength?.contractId}`);
    assert(strength?.state === 'collected-unclassified', `完整命盘证据未进入 collected-unclassified：${strength?.state}`);

    const evidence = strength.evidence;
    assert(evidence.seasonalState?.state === '死' && evidence.seasonalState.monthZhi === '子', `丁火子月季节证据异常：${JSON.stringify(evidence.seasonalState)}`);
    assert(evidence.visibleSupportActors.length === 1, `帮扶明干数量异常：${evidence.visibleSupportActors.length}`);
    assert(evidence.visibleSupportActors[0].gan === '丁' && evidence.visibleSupportActors[0].tenGod === '比肩' && evidence.visibleSupportActors[0].relation === '同我', '年干丁未按同我/比肩抽取');
    assert(evidence.visibleRestraintActors.length === 1 && evidence.visibleRestraintActors[0].gan === '壬' && evidence.visibleRestraintActors[0].relation === '克我', '月干壬未进入克我轴');
    assert(evidence.visibleDrainActors.length === 1 && evidence.visibleDrainActors[0].gan === '己' && evidence.visibleDrainActors[0].relation === '我生', '时干己未进入我生轴');
    assert(evidence.visibleDistributionActors.length === 0, '测试盘不应出现我克明干');

    const qi = Object.fromEntries(evidence.branchQi.map((item) => [item.position, `${item.zhi}:${item.state}`]));
    assert(qi.year === '丑:墓', `年支十二长生异常：${qi.year}`);
    assert(qi.day === '亥:胎', `日支十二长生异常：${qi.day}`);
    assert(qi.hour === '酉:长生', `时支十二长生异常：${qi.hour}`);
    assert(!evidence.branchQi.some((item) => item.position === 'month'), '月支不应重复进入年日时支气轴');
});

test('我克明干保持独立“被分”轴，不并入克我或我生', () => {
    const result = makeResult(['庚','壬','丁','己']);
    const output = interpretation.buildBaziInterpretation(result);
    const evidence = output.semanticModel.strengthEvidence.evidence;
    const distribution = evidence.visibleDistributionActors.find((item) => item.gan === '庚');
    assert(distribution?.relation === '我克' && distribution?.tenGod === '正财', `庚金未进入我克轴：${JSON.stringify(evidence.visibleDistributionActors)}`);
    assert(distribution.countClassification === 'separate', '我克轴未保持 separate');
    assert(!evidence.visibleRestraintActors.some((item) => item.gan === '庚'), '我克被误并入克我');
    assert(!evidence.visibleDrainActors.some((item) => item.gan === '庚'), '我克被误并入我生');
});

test('抽取器只记录单项证据，不自行生成多寡、得气或强弱结论', () => {
    const result = makeResult();
    const output = interpretation.buildBaziInterpretation(result);
    const strength = output.semanticModel.strengthEvidence;
    const text = JSON.stringify(strength);
    assert(!/(多帮扶|少帮扶|多克泄|少克泄|支得气|支失气|最强|中强|次强|次弱|中弱|最弱)/.test(text), `抽取器越级生成分类：${text}`);
    strength.evidence.branchQi.forEach((item) => assert(item.aggregateClassification === 'unresolved', '支气被提前聚合分类'));
    [...strength.evidence.visibleSupportActors, ...strength.evidence.visibleRestraintActors, ...strength.evidence.visibleDrainActors]
        .forEach((item) => assert(item.countClassification === 'unresolved', '明干证据被提前做多寡分类'));
    assert(output.semanticModel.assessments.length === 0, '证据抽取阶段不应产生 Assessment 结论');
    assert(output.semanticModel.assessmentLayer?.domains?.dayMasterStrength?.status === 'not-evaluated', '身强弱状态不应因证据已抽取而改成已评估');
});

test('每项证据只引用当前真实 F/D/S，Assessment 接口可读取但不提升为结论', () => {
    const result = makeResult();
    const output = interpretation.buildBaziInterpretation(result);
    const model = output.semanticModel;
    const validRefs = new Set([
        ...model.facts.map((item) => item.id),
        ...model.derivedFacts.map((item) => item.id),
        ...model.structures.map((item) => item.id)
    ]);
    const strength = model.strengthEvidence;
    const allItems = [
        strength.evidence.seasonalState,
        ...strength.evidence.visibleSupportActors,
        ...strength.evidence.visibleRestraintActors,
        ...strength.evidence.visibleDrainActors,
        ...strength.evidence.visibleDistributionActors,
        ...strength.evidence.branchQi
    ].filter(Boolean);
    allItems.forEach((item) => item.sourceRefs.forEach((ref) => assert(validRefs.has(ref), `${item.id} 引用了不存在的 ${ref}`)));
    const assessmentInput = model.assessmentLayer.domains.dayMasterStrength;
    assert(assessmentInput.evidenceCollection === strength, 'Assessment 身强弱接口未接入同一份证据集合');
    assert(assessmentInput.evidenceCollectionStatus === 'collected-unclassified', 'Assessment 未保留证据收集状态');
    assert(assessmentInput.activeRuleIds.length === 0, '证据接入不应激活正向判定规则');
});

test('复制分析上下文继续只暴露 F/D/S 与 Assessment 边界，不泄漏证据内部字段', () => {
    const result = makeResult();
    const output = interpretation.buildBaziInterpretation(result);
    const text = interpretation.buildBaziContextText(result, output);
    assert(text.includes('【Assessment｜作用与结论层】'), '复制上下文缺 Assessment 层');
    assert(!text.includes('collected-unclassified'), '复制上下文泄漏证据收集状态');
    assert(!text.includes('visibleSupportActors'), '复制上下文泄漏证据轴字段');
    assert(!text.includes('SE01'), '复制上下文泄漏内部证据 ID');
});

console.log(`\nBaZi strength evidence extractor: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
