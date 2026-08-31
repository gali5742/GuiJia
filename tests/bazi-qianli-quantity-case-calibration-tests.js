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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziQianliQuantityCaseCalibrationSource;
const api = GuiJia.baziQianliQuantityCaseCalibration;

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

test('Quantity Case Calibration v0.1 将来源案例与执行合同独立拆分', () => {
    assert(sourceApi?.installed === true, 'case calibration source 未安装');
    assert(api?.installed === true, 'case calibration execution 未安装');
    assert(sourceApi.VERSION === '0.1' && api.VERSION === '0.1', '版本异常');
    assert(sourceApi.SOURCE_CASES.length === 8, '来源案例数量异常');
    assert(sourceApi.CALIBRATION_CONSTRAINTS.length === 6, '校准约束数量异常');
});

test('最强命例只复现 source-case 多帮扶，不写入项目 quantity classification', () => {
    const synthesis = outputForChart('甲寅|丁卯|甲子|甲子').semanticModel.strengthSynthesis;
    const view = synthesis.qianliQuantityCaseCalibrationView;
    assert(view.status === 'matched-exact-source-case-label-only', '最强例应命中 exact source case');
    assert(view.reproducibleSourceCaseLabels.some((item) => item.sourceQuantityLabel === '多帮扶'), '应复现多帮扶来源标签');
    assert(view.projectQuantityClassification === null, 'source-case label 不得成为项目 classification');
    assert(synthesis.qianliStrengthCompositionInputProfile.supportQuantity.value === null, '不得回写 supportQuantity');
});

test('失令中强例同样可复现多帮扶，但不能反推统一 item 阈值', () => {
    const synthesis = outputForChart('甲寅|癸酉|乙亥|丙子').semanticModel.strengthSynthesis;
    const view = synthesis.qianliQuantityCaseCalibrationView;
    assert(view.reproducibleSourceCaseLabels[0]?.sourceQuantityLabel === '多帮扶', '应复现多帮扶');
    assert(sourceApi.CONTRACT.universalNumericThresholdDefined === false, '不得出现通用数字阈值');
    assert(sourceApi.CONTRACT.universalRatioRuleDefined === false, '不得出现通用比例规则');
});

test('两个少帮扶命例保留不同观察 scope，禁止统一地支计入公式', () => {
    const a = sourceApi.SOURCE_CASES.find((item) => item.id === 'QL-QCAL-S03');
    const b = sourceApi.SOURCE_CASES.find((item) => item.id === 'QL-QCAL-S04');
    assert(a.sourceQuantityLabel === '少帮扶' && b.sourceQuantityLabel === '少帮扶', '两例都应是少帮扶');
    assert(a.observationScope !== b.observationScope, '两例观察 scope 不应被抹平');
    assert(a.observationScope.includes('month-command'), '得令中强例应保留月令/别位分层');
    assert(b.observationScope.includes('visible-stems'), '次强例应保留天干/支气分层');
    assert(sourceApi.CONTRACT.universalBranchInclusionRuleDefined === false, '不得建立统一地支计入公式');
});

test('当令中弱例可复现多克泄，但 distribution 仍不进入 restraint-drain', () => {
    const synthesis = outputForChart('丙辰|庚寅|甲午|庚午').semanticModel.strengthSynthesis;
    const labels = synthesis.qianliQuantityCaseCalibrationView.reproducibleSourceCaseLabels;
    assert(labels.some((item) => item.sourceQuantityLabel === '多克泄'), '应复现多克泄');
    assert(sourceApi.CONTRACT.distributionIncludedInRestraintDrain === false, '被分不得并入克泄');
    assert(synthesis.qianliStrengthCompositionInputProfile.restraintDrainQuantity.value === null, '不得回写 restraintDrainQuantity');
});

test('乙巳/己巳异文命例命中时必须 blocked，不得作为 exact calibration', () => {
    ['甲寅|丙子|丁卯|乙巳','甲寅|丙子|丁卯|己巳'].forEach((chartKey) => {
        const view = outputForChart(chartKey).semanticModel.strengthSynthesis.qianliQuantityCaseCalibrationView;
        assert(view.status === 'matched-source-case-calibration-blocked', `${chartKey} 应被异文 blocker 阻断`);
        assert(view.blockedCaseIds.includes('QL-QCAL-W03'), '应记录 W03 blocker');
        assert(view.reproducibleSourceCaseLabels.length === 0, '异文例不得复现为可校准标签');
    });
});

test('最弱例只保留来源多克泄标签存在性，正文计数异常退出校准', () => {
    const sourceCase = sourceApi.SOURCE_CASES.find((item) => item.id === 'QL-QCAL-W01');
    const view = outputForChart(sourceCase.chartKeys[0]).semanticModel.strengthSynthesis.qianliQuantityCaseCalibrationView;
    assert(sourceCase.calibrationStatus === 'label-attested-count-detail-blocked', '最弱例应保留正文完整性 caution');
    assert(view.status === 'matched-source-case-calibration-blocked', '最弱例不得作为 exact count calibration');
    assert(view.blockedCaseIds.includes('QL-QCAL-W01'), '应记录 W01 blocker');
});

test('人元一金五木命例只形成反简单计数约束，不新增 many/few label', () => {
    const constraint = sourceApi.CALIBRATION_CONSTRAINTS.find((item) => item.id === 'QL-QCAL-C03');
    assert(constraint.kind === 'hidden-stem-can-modify-surface-force', '人元约束类型异常');
    assert(constraint.chartKeys.includes('甲寅|壬申|甲寅|甲子'), '应保留一金五木命例');
    const view = outputForChart('甲寅|壬申|甲寅|甲子').semanticModel.strengthSynthesis.qianliQuantityCaseCalibrationView;
    assert(view.status === 'no-exact-source-case', '人元约束例不是多/少 source label case');
    assert(view.projectQuantityClassification === null, '不得从一金五木自动分类');
});

test('固定验证盘没有 exact source match，Generalization 与两个 classifier 继续 unresolved', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(synthesis.qianliQuantityCaseCalibrationView.status === 'no-exact-source-case', '固定盘不应误命中来源命例');
    assert(deps['SD-QIANLI-QUANTITY-CASE-CALIBRATION-CONTRACT']?.status === 'resolved', 'case calibration contract 应 resolved');
    assert(deps['SD-QIANLI-QUANTITY-GENERALIZATION-RULE']?.status === 'unresolved', 'generalization rule 必须 unresolved');
    assert(deps['SD-QIANLI-QUANTITY-CLASSIFICATION-RULE']?.status === 'unresolved', 'classification rule 必须 unresolved');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support classifier 不得启动');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain classifier 不得启动');
});

test('即使精确命中来源案例，Strength Composition 与 Assessment 也不得越级启动', () => {
    const model = outputForChart('甲寅|丁卯|甲子|甲子').semanticModel;
    const synthesis = model.strengthSynthesis;
    assert(synthesis.qianliStrengthCompositionInputProfile.supportQuantity.value === null, 'source case 不得填 supportQuantity');
    assert(synthesis.qianliStrengthCompositionEvaluations.every((item) => item.status !== 'matched-source-pattern'), '不得命中最终来源组合模板');
    assert(synthesis.sufficiency.status === 'insufficient', 'Synthesis 应继续 insufficient');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 不得启动');
});

test('Case Calibration 不引入 score/weight/points/thresholdValue/ratioValue/classificationResult', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const view = {
        contract:synthesis.qianliQuantityCaseCalibrationContract,
        cases:synthesis.qianliQuantityCaseCalibrationCases,
        constraints:synthesis.qianliQuantityCaseCalibrationConstraints,
        runtime:synthesis.qianliQuantityCaseCalibrationView
    };
    const keys = collectKeys(view);
    ['score','weight','points','thresholdValue','ratioValue','classificationResult','strengthLevel'].forEach((key) => {
        assert(!keys.has(key), `Case Calibration 不应出现字段：${key}`);
    });
});

test('生产加载链在 Semantic Bridge 后加载 Case Calibration，并由执行层加载独立 source contract', () => {
    const auditSource = fs.readFileSync(path.join(ROOT, 'js/bazi-qianli-quantity-classification-audit.js'), 'utf8');
    const calibrationSource = fs.readFileSync(path.join(ROOT, 'js/bazi-qianli-quantity-case-calibration.js'), 'utf8');
    const bridgeIndex = auditSource.indexOf('./js/bazi-qianli-quantity-semantic-bridge.js');
    const calibrationIndex = auditSource.indexOf('./js/bazi-qianli-quantity-case-calibration.js');
    assert(bridgeIndex >= 0 && calibrationIndex > bridgeIndex, 'Audit loader 应先加载 Bridge 再加载 Case Calibration');
    assert(calibrationSource.includes('./js/bazi-qianli-quantity-case-calibration-source.js'), '执行层尚未加载独立 calibration source');
});

console.log(`\nQianli Quantity Case Calibration v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);