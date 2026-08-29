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
    'js/bazi-strength-effects.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);
const bazi = GuiJia.baziCore;
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

function effectMap(model) {
    return Object.fromEntries((model.strengthEffects?.effects || []).map((item) => [item.id, item]));
}

test('丁丑壬子丁亥己酉只解释中间作用方向，不生成身强弱结论', () => {
    const output = interpretation.buildBaziInterpretation(makeResult());
    const model = output.semanticModel;
    const collection = model.strengthEffects;
    assert(collection?.version === '0.1', `effects version 异常：${collection?.version}`);
    assert(collection?.state === 'interpreted-unaggregated', `effects state 异常：${collection?.state}`);
    const effects = effectMap(model);

    assert(effects['FX-SEASONAL']?.state === '死', '季节状态未保留“死”');
    assert(effects['FX-SEASONAL']?.direction === 'seasonal-non-support', `死被误解释为其他方向：${effects['FX-SEASONAL']?.direction}`);
    assert(effects['FX-SE02']?.direction === 'support-candidate', '年干丁比肩未进入扶身方向候选');
    assert(effects['FX-SE03']?.direction === 'restraint-candidate', '月干壬正官未进入克制方向候选');
    assert(effects['FX-SE04']?.direction === 'drain-candidate', '时干己食神未进入泄力方向候选');

    assert(model.assessments.length === 0, '中间作用解释不应生成 Assessment 结论');
    assert(model.assessmentLayer?.domains?.dayMasterStrength?.status === 'not-evaluated', '身强弱状态不应被中间层提前改写');
});

test('本干通根、同类得地与藏支印比分轴解释，验证盘只见亥中甲正印', () => {
    const output = interpretation.buildBaziInterpretation(makeResult());
    const effects = effectMap(output.semanticModel);
    assert(effects['FX-ROOT-EXACT']?.presence === 'absent', '验证盘不应识别丁火本干通根');
    assert(effects['FX-ROOT-SAME-ELEMENT']?.presence === 'absent', '验证盘不应识别同类火得地');
    const hiddenSupport = effects['FX-HIDDEN-SUPPORT'];
    assert(hiddenSupport?.presence === 'present', '亥中甲正印应形成藏支扶身要素存在事实');
    assert(hiddenSupport.actors.some((item) => item.zhi === '亥' && item.gan === '甲' && item.tenGod === '正印'), `亥甲正印未被识别：${JSON.stringify(hiddenSupport?.actors)}`);
    assert(hiddenSupport.direction === 'support-candidate', '藏支印星只应进入扶身方向候选');
});

test('同一藏干可同时是通根与印比语义，但 actorKey 一致且不得重复计力', () => {
    const output = interpretation.buildBaziInterpretation(makeResult(['甲','壬','丁','己'], ['午','子','亥','酉']));
    const collection = output.semanticModel.strengthEffects;
    const effects = effectMap(output.semanticModel);
    const exact = effects['FX-ROOT-EXACT'];
    const hiddenSupport = effects['FX-HIDDEN-SUPPORT'];
    const rootActor = exact.actors.find((item) => item.zhi === '午' && item.gan === '丁');
    const supportActor = hiddenSupport.actors.find((item) => item.zhi === '午' && item.gan === '丁');
    assert(rootActor && supportActor, '午中丁应同时进入本干通根与藏支印比语义');
    assert(rootActor.actorKey === supportActor.actorKey, '同一午中丁在不同语义轴未保持同一 actorKey');
    assert(collection.overlapPolicy === 'same-actor-may-carry-multiple-semantics-do-not-add', '未声明同一 actor 多重语义不得直接相加');
    assert(collection.blockedInferences.some((item) => item.includes('重复出现计作两份力量')), '未阻止通根与印比重复计力');
});

test('十二长生只形成 context-only 中间状态，不映射为得气、失气或扶身强度', () => {
    const output = interpretation.buildBaziInterpretation(makeResult());
    const effects = output.semanticModel.strengthEffects.effects.filter((item) => item.category === 'branchQiContext');
    assert(effects.length === 3, `年日时支气中间状态数量异常：${effects.length}`);
    effects.forEach((item) => {
        assert(item.status === 'context-only', `${item.id} 十二长生状态不应进入实际效力状态`);
        assert(item.direction === 'contextual', `${item.id} 十二长生状态被提前映射方向`);
        assert(!('aggregateClassification' in item), `${item.id} 不应生成支气聚合分类`);
        assert(!('strengthClass' in item), `${item.id} 不应生成扶身强度分类`);
        assert(!['support-candidate','seasonal-support','seasonal-non-support'].includes(item.direction), `${item.id} 十二长生不应提前映射为扶抑方向`);
    });
    const changsheng = effects.find((item) => item.zhi === '酉');
    assert(changsheng?.state === '长生' && changsheng.direction === 'contextual', '“长生”字样本身不应自动变成扶身候选');
});

test('中间层不设置权重、分数、多寡阈值，也不解释三会五合实际效力', () => {
    const output = interpretation.buildBaziInterpretation(makeResult());
    const model = output.semanticModel;
    const effectsText = JSON.stringify(model.strengthEffects);
    assert(!/"(?:score|weight|points|strengthLevel)"/.test(effectsText), `中间层出现数值化字段：${effectsText}`);
    assert(!/(多帮扶|少帮扶|多克泄|少克泄|最强|中强|次强|次弱|中弱|最弱)/.test(effectsText), '中间层越级生成多寡或强弱等级');
    assert(!model.strengthEffects.effects.some((item) => (item.sourceRefs || []).some((ref) => /^S\d+/.test(ref))), '结构 S 引用不应在当前身强中间效应层被解释为实际力量');
    assert(model.strengthEffects.blockedInferences.some((item) => item.includes('三合、三会、五合')), '未明确阻止组合结构直接升级为强弱效力');
});

test('Assessment 读取同一份中间作用集合，但仍保持 contract-only 与 not-evaluated', () => {
    const output = interpretation.buildBaziInterpretation(makeResult());
    const model = output.semanticModel;
    const input = model.assessmentLayer.domains.dayMasterStrength;
    assert(input.effectCollection === model.strengthEffects, 'Assessment 未读取同一份 strengthEffects');
    assert(input.effectCollectionStatus === 'interpreted-unaggregated', `Assessment 未保留中间层状态：${input.effectCollectionStatus}`);
    assert(input.activeRuleIds.length === 0, '中间层接入不应激活最终判断规则');
    assert(model.assessmentLayer.state === 'contract-only', '没有最终规则时 Assessment 仍应为 contract-only');
    assert(input.guardRuleIds.includes('BAZI-ASSESS-GUARD-009') && input.guardRuleIds.includes('BAZI-ASSESS-GUARD-010'), '新的中间层防越级 guard 未接入');
});

test('中间作用 sourceRefs 仍只回指真实 F/D/S，复制上下文不泄漏 FX 内部字段', () => {
    const result = makeResult();
    const output = interpretation.buildBaziInterpretation(result);
    const model = output.semanticModel;
    const validRefs = new Set([
        ...model.facts.map((item) => item.id),
        ...model.derivedFacts.map((item) => item.id),
        ...model.structures.map((item) => item.id)
    ]);
    model.strengthEffects.effects.forEach((item) => (item.sourceRefs || []).forEach((ref) => assert(validRefs.has(ref), `${item.id} 引用了不存在的 ${ref}`)));

    const copied = interpretation.buildBaziContextText(result, output);
    assert(copied.includes('【Assessment｜作用与结论层】'), '复制上下文缺 Assessment 层');
    ['interpreted-unaggregated','support-candidate','FX-SEASONAL','actorKey','overlapPolicy','strengthEffects'].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏内部中间层字段：${term}`);
    });
});

console.log(`\nBaZi strength effects: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
