#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const { Solar } = require(path.join(ROOT, 'vendor', 'lunar.js'));
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
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl, Solar };
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
    'js/bazi-month-command.js',
    'js/bazi-strength-effects.js',
    'js/bazi-strength-synthesis.js',
    'js/bazi-root-effect-state.js',
    'js/bazi-root-six-relations.js',
    'js/bazi-clash-preconditions.js',
    'js/bazi-clash-seasonal-position.js',
    'js/bazi-clash-nonseasonal-force.js',
    'js/bazi-element-presence-scope.js',
    'js/bazi-clash-rescue-context.js',
    'js/bazi-root-clash-source-outcome.js',
    'js/bazi-root-clash-interaction-effect.js',
    'js/bazi-root-actor-interaction-aggregation.js',
    'js/bazi-root-baseline-effectiveness.js',
    'js/bazi-stem-bearing-effect.js',
    'js/bazi-visible-stem-functional-availability.js',
    'js/bazi-visible-stem-function-reachability.js',
    'js/bazi-visible-stem-directed-function.js',
    'js/bazi-visible-stem-function-coverage.js',
    'js/bazi-visible-stem-function-realization.js',
    'js/bazi-visible-stem-function-realization-source.js',
    'js/bazi-visible-stem-actor-interaction-aggregation.js',
    'js/bazi-visible-stem-actor-function-composition.js',
    'js/bazi-visible-stem-actor-profile-interpretation.js',
    'js/bazi-visible-stem-daymaster-contribution.js',
    'js/bazi-qianli-strength-composition-source.js',
    'js/bazi-qianli-strength-composition.js',
    'js/bazi-qianli-quantity-classification-source.js',
    'js/bazi-qianli-quantity-classification-audit.js',
    'js/bazi-qianli-quantity-semantic-bridge-source.js',
    'js/bazi-qianli-quantity-semantic-bridge.js',
    'js/bazi-qianli-quantity-case-calibration-source.js',
    'js/bazi-qianli-quantity-case-calibration.js',
    'js/bazi-qianli-quantity-cross-literature-source.js',
    'js/bazi-qianli-quantity-cross-literature-research.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziQianliQuantityCrossLiteratureSource;
const api = GuiJia.baziQianliQuantityCrossLiteratureResearch;

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
        solarStr:'测试时间',
        ruleSummary:'测试口径'
    };
}

function outputFor(gans, zhis) {
    return interpretation.buildBaziInterpretation(makeResult(gans, zhis));
}

function outputForChart(chartKey) {
    const pillars = chartKey.split('|');
    return outputFor(pillars.map((item) => item[0]), pillars.map((item) => item[1]));
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

function collectKeys(value, keys = new Set()) {
    if (!value || typeof value !== 'object') return keys;
    Object.keys(value).forEach((key) => {
        keys.add(key);
        collectKeys(value[key], keys);
    });
    return keys;
}

test('Cross-Literature Research v0.1 将来源登记与研究执行层独立拆分', () => {
    assert(sourceApi?.installed === true, 'cross-literature source 未安装');
    assert(api?.installed === true, 'cross-literature research execution 未安装');
    assert(sourceApi.VERSION === '0.1' && api.VERSION === '0.1', '版本异常');
    assert(Object.keys(sourceApi.SOURCES).length === 6, '来源数量异常');
    assert(sourceApi.EVIDENCE.length === 12, '证据数量异常');
    assert(sourceApi.CASES.length === 3, '研究命例数量异常');
});

test('来源角色区分原典、注释经典与汇编所录早期文本，不抹平 provenance', () => {
    const roles = Object.values(sourceApi.SOURCES).map((item) => item.sourceRole);
    assert(roles.includes('primary-text'), '缺 primary-text');
    assert(roles.includes('commentarial-classic'), '缺 commentarial-classic');
    assert(roles.includes('compiled-classic'), '缺 compiled-classic');
    assert(roles.includes('embedded-earlier-text'), '缺 embedded-earlier-text');
    assert(sourceApi.SOURCES.yujing.sourceRole === 'embedded-earlier-text', '《玉井奥诀》应保留转录来源层级');
    assert(sourceApi.SOURCES.yuanli.sourceRole === 'embedded-earlier-text', '《元理赋》应保留转录来源层级');
});

test('跨文献 finding 将 many/few 语义方向收敛为 contextual-relative-force，而非 raw count', () => {
    const finding = sourceApi.FINDINGS.find((item) => item.key === 'many-few-semantic-direction');
    assert(finding?.status === 'supported', 'many/few semantic direction 应有跨文献支持');
    assert(finding?.value === 'contextual-relative-force', '语义方向应为 contextual-relative-force');
    assert(sourceApi.CONTRACT.manyFewEqualsRawItemCount === false, '不得将 many/few 等同 raw item count');
    assert(sourceApi.CONTRACT.equalItemCountingAccepted === false, '不得接受等值 item count');
});

test('《滴天髓阐微》根重于干多证据直接拒绝等值计数', () => {
    const e04 = sourceApi.EVIDENCE.find((item) => item.id === 'QL-XLR-E04');
    const e05 = sourceApi.EVIDENCE.find((item) => item.id === 'QL-XLR-E05');
    const e06 = sourceApi.EVIDENCE.find((item) => item.id === 'QL-XLR-E06');
    assert(e04?.sourcePhrase.includes('一比肩') && e04.sourcePhrase.includes('余气墓库'), '缺一比肩/余气墓库比较');
    assert(e05?.sourcePhrase.includes('二比肩') && e05.sourcePhrase.includes('长生禄旺'), '缺二比肩/长生禄旺比较');
    assert(e06?.sourcePhrase === '干多不如根重', '应保留“干多不如根重”');
    assert(sourceApi.CONTRACT.qualitativeForceHierarchyRequired === true, '应要求定性力量层级');
    assert(sourceApi.CONTRACT.numericForceWeightsDefined === false, '不得引入数字力量权重');
});

test('《三命通会》多寡与轻重并列进入研究结论，但不生成数字权重', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'QL-XLR-E09');
    assert(evidence?.sourcePhrase === '当论多寡，分轻重也', '应保留多寡/轻重原文');
    const finding = sourceApi.FINDINGS.find((item) => item.key === 'qualitative-force-hierarchy');
    assert(finding?.status === 'required' && finding.value === true, '轻重应形成 qualitative hierarchy requirement');
    assert(sourceApi.CONTRACT.numericForceWeightsDefined === false, '轻重不得转换数字权重');
});

test('《神峰通考》失令而土多化旺命例只作为 research case，不拥有分类推广权', () => {
    const model = outputForChart('甲辰|丙子|己未|戊辰').semanticModel;
    const view = model.strengthSynthesis.qianliQuantityCrossLiteratureResearchView;
    assert(view.matchedResearchCases.some((item) => item.id === 'QL-XLR-C01'), '应命中神峰 research case');
    assert(view.matchedResearchCases.every((item) => item.generalizationAuthority === false), 'research case 不得拥有 generalization authority');
    assert(view.projectQuantityClassification === null, 'research case 不得生成项目 quantity classification');
    assert(view.automaticClassifier === null, 'research case 不得启用 classifier');
});

test('《滴天髓阐微》两个根气对照命例只校准 presence≠force，不自动泛化', () => {
    ['甲辰|丁卯|甲子|戊辰','乙丑|甲申|甲申|辛未'].forEach((chartKey) => {
        const synthesis = outputForChart(chartKey).semanticModel.strengthSynthesis;
        const view = synthesis.qianliQuantityCrossLiteratureResearchView;
        assert(view.matchedResearchCases.length === 1, `${chartKey} 应命中一个 research case`);
        assert(view.matchedResearchCases[0].generalizationAuthority === false, `${chartKey} 不得拥有推广权`);
        assert(synthesis.qianliStrengthCompositionInputProfile.supportQuantity.value === null, `${chartKey} 不得填 supportQuantity`);
        assert(synthesis.qianliStrengthCompositionInputProfile.restraintDrainQuantity.value === null, `${chartKey} 不得填 restraintDrainQuantity`);
    });
});

test('固定验证盘只获得 research-level semantic direction，Contextual Force Model 与 classifier 继续阻断', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    const view = synthesis.qianliQuantityCrossLiteratureResearchView;
    assert(view.matchedResearchCases.length === 0, '固定验证盘不应误命中研究命例');
    assert(deps['SD-QIANLI-QUANTITY-CROSS-LITERATURE-RESEARCH']?.status === 'resolved', 'cross-literature research 应 resolved');
    assert(deps['SD-QIANLI-QUANTITY-GENERALIZATION-SEMANTIC-DIRECTION']?.status === 'resolved', 'semantic direction 应 resolved');
    assert(deps['SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL']?.status === 'unresolved', 'contextual-force evidence model 必须 unresolved');
    assert(deps['SD-QIANLI-QUANTITY-GENERALIZATION-RULE']?.status === 'unresolved', 'generalization rule 必须 unresolved');
    assert(deps['SD-QIANLI-QUANTITY-CLASSIFICATION-RULE']?.status === 'unresolved', 'classification rule 必须 unresolved');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support classifier 不得启动');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain classifier 不得启动');
});

test('semantic direction resolved 不能越级生成来源组合等级或最终 Assessment', () => {
    const model = outputForChart('甲辰|丙子|己未|戊辰').semanticModel;
    const synthesis = model.strengthSynthesis;
    assert(synthesis.qianliQuantityCrossLiteratureResearchView.semanticDirectionStatus === 'resolved-research-level', 'research-level semantic direction 应 resolved');
    assert(synthesis.qianliStrengthCompositionInputProfile.supportQuantity.value === null, '不得生成多/少帮扶');
    assert(synthesis.qianliStrengthCompositionInputProfile.restraintDrainQuantity.value === null, '不得生成多/少克泄');
    assert(synthesis.qianliStrengthCompositionEvaluations.every((item) => item.status !== 'matched-source-pattern'), '不得因此命中 Qianli strength composition');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 应继续 insufficient');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 必须保持 not-evaluated');
});

test('非线性与 interaction evidence 被保存，不允许“更多生扶=线性更强”', () => {
    const nonlinear = sourceApi.EVIDENCE.find((item) => item.id === 'QL-XLR-E12');
    assert(nonlinear?.sourcePhrase.includes('土多金埋') && nonlinear.sourcePhrase.includes('水多木漂'), '应保留太过反转证据');
    assert(nonlinear.supports.includes('nonlinear-force-semantics'), '应声明 nonlinear force semantics');
    assert(sourceApi.CONTRACT.interactionContextRequired === true, '交互上下文必须进入 future model');
});

test('Cross-Literature Research 不引入分数、数字权重、阈值、比例或分类结果', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const view = {
        sources:synthesis.qianliQuantityCrossLiteratureSources,
        evidence:synthesis.qianliQuantityCrossLiteratureEvidence,
        cases:synthesis.qianliQuantityCrossLiteratureCases,
        findings:synthesis.qianliQuantityCrossLiteratureFindings,
        contract:synthesis.qianliQuantityCrossLiteratureContract,
        runtime:synthesis.qianliQuantityCrossLiteratureResearchView
    };
    const keys = collectKeys(view);
    ['score','weight','points','thresholdValue','ratioValue','classificationResult','strengthLevel','numericWeight'].forEach((key) => {
        assert(!keys.has(key), `Cross-Literature Research 不应出现字段：${key}`);
    });
    assert(sourceApi.CONTRACT.universalNumericThresholdDefined === false, '不得启用 universal numeric threshold');
    assert(sourceApi.CONTRACT.numericForceWeightsDefined === false, '不得启用 numeric force weights');
    assert(sourceApi.CONTRACT.executableGeneralizationRuleDefined === false, '不得假装 generalization rule 已执行化');
    assert(sourceApi.CONTRACT.automaticClassifierDefined === false, '不得启用 automatic classifier');
});

test('生产加载链在 Case Calibration 后加载 Cross-Literature Research，并由执行层加载独立来源合同', () => {
    const calibrationSource = fs.readFileSync(path.join(ROOT, 'js/bazi-qianli-quantity-case-calibration.js'), 'utf8');
    const researchSource = fs.readFileSync(path.join(ROOT, 'js/bazi-qianli-quantity-cross-literature-research.js'), 'utf8');
    assert(calibrationSource.includes('./js/bazi-qianli-quantity-cross-literature-research.js'), 'Case Calibration 尚未接 Cross-Literature Research loader');
    assert(researchSource.includes('./js/bazi-qianli-quantity-cross-literature-source.js'), 'Research execution 尚未加载独立 source contract');
});

console.log(`\nQianli Quantity Cross-Literature Research v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);