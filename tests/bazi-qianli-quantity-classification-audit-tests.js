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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziQianliQuantityClassificationSource;
const api = GuiJia.baziQianliQuantityClassificationAudit;

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

test('Quantity Source Audit v0.1 将来源证据与审计执行层独立拆分', () => {
    assert(sourceApi?.installed === true, 'quantity source registry 未安装');
    assert(api?.installed === true, 'quantity source audit 未安装');
    assert(sourceApi.VERSION === '0.1' && api.VERSION === '0.1', '版本异常');
    assert(api.EVIDENCE === sourceApi.EVIDENCE, '审计层没有直接消费独立 source registry');
    assert(sourceApi.EVIDENCE.length === 12, `source evidence 数量异常：${sourceApi.EVIDENCE.length}`);
});

test('原书数量语言可确认存在，但没有统一数字阈值', () => {
    const view = api.buildAuditView();
    assert(api.CONTRACT.sourceQuantityLanguageObserved === true, '没有记录数量语言存在');
    assert(api.CONTRACT.universalNumericThresholdDefined === false, '不得宣称已有统一阈值');
    assert(view.universalThreshold === null, 'audit view 不得伪造阈值');
    assert(view.resolverStatus === 'not-defined', 'resolver 不应启用');
});

test('强弱篇例盘只可作为数量现象证据，不能直接校准通用 many/few threshold', () => {
    const examples = sourceApi.EVIDENCE.filter((item) => item.sourceLocator.includes('强弱篇') && item.kind === 'example');
    assert(examples.length >= 6, '强弱篇例盘覆盖不足');
    assert(examples.some((item) => item.sourceTerm === '多帮扶'), '缺多帮扶例证');
    assert(examples.some((item) => item.sourceTerm === '多克泄'), '缺多克泄例证');
    assert(sourceApi.AUDIT_CONCLUSIONS.universalNumericThresholdAttested === false, '例盘不得升级为统一阈值');
});

test('realized Daymaster Contribution count 与来源教学层多寡不是同一语义层', () => {
    assert(api.CONTRACT.directContributionCountIsNotSourceQuantity === true, '合同未锁定语义层差异');
    const view = api.buildAuditView();
    assert(view.directContributionCountAccepted === false, '不得接受 direct contribution count 作为分类器');
    assert(view.candidateBridgeInput === 'source-quantity-evidence-inventory', '下一桥接层应先建立 source quantity inventory');
});

test('帮扶多寡与支得气存在上下文分层，不能固定把所有地支算入或排除', () => {
    const split = sourceApi.EVIDENCE.filter((item) => ['QL-QTY-S04','QL-QTY-S05'].includes(item.id));
    assert(split.length === 2, '缺少月令/支气分层例证');
    assert(split.every((item) => item.observation.includes('月令') || item.observation.includes('支得气')), '分层观察没有保存');
    assert(sourceApi.AUDIT_CONCLUSIONS.branchParticipationHasContextualAxisOverlap === true, '未冻结支参与 scope 风险');
});

test('人元可以修正表层力量，但最重/次重/稍轻没有数字换算', () => {
    const modifier = sourceApi.EVIDENCE.find((item) => item.id === 'QL-QTY-H01');
    const hierarchy = sourceApi.EVIDENCE.find((item) => item.id === 'QL-QTY-H02');
    assert(modifier?.observation.includes('藏干可以增加'), '缺少人元 modifier 证据');
    assert(hierarchy?.thresholdEvidence === 'no-numeric-conversion', '人元层级不应伪装成权重');
    assert(api.CONTRACT.hiddenModifierNumericWeightDefined === false, '不得生成藏干数字权重');
});

test('存在命例字形异文时，该例明确退出阈值校准', () => {
    const variant = sourceApi.EVIDENCE.find((item) => item.id === 'QL-QTY-W03');
    const view = api.buildAuditView();
    assert(variant?.thresholdEvidence === 'inadmissible-for-threshold-calibration', '异文例未阻断 threshold calibration');
    assert(view.thresholdCalibrationBlockedEvidenceIds.includes('QL-QTY-W03'), 'audit view 未保存异文 blocker');
    assert(api.CONTRACT.sourceVariantRequiresCaution === true, '合同未标记异文风险');
});

test('被分 distribution 继续独立，不进入多克泄/少克泄', () => {
    assert(sourceApi.AUDIT_CONCLUSIONS.distributionIncludedInRestraintDrain === false, 'source audit 错误并入被分');
    assert(api.CONTRACT.distributionIncludedInRestraintDrain === false, 'audit contract 错误并入被分');
});

test('source scope audit 可 resolved，但 semantic bridge 与两个 quantity classifier 继续 unresolved', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-QIANLI-QUANTITY-SOURCE-SCOPE-AUDIT']?.status === 'resolved', 'source scope audit 应 resolved');
    assert(deps['SD-QIANLI-QUANTITY-SEMANTIC-BRIDGE']?.status === 'unresolved', 'semantic bridge 应 unresolved');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support quantity 不得提前 resolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain quantity 不得提前 resolved');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION'].dependsOnDependencyIds.includes('SD-QIANLI-QUANTITY-SEMANTIC-BRIDGE'), 'support quantity 未依赖 semantic bridge');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION'].dependsOnDependencyIds.includes('SD-QIANLI-QUANTITY-SEMANTIC-BRIDGE'), 'restraint/drain quantity 未依赖 semantic bridge');
});

test('固定验证盘仍无多寡分类、无来源等级命中，Synthesis/Assessment 不启动', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    assert(synthesis.qianliStrengthCompositionInputProfile.supportQuantity.value === null, '固定盘不应得到帮扶多寡');
    assert(synthesis.qianliStrengthCompositionInputProfile.restraintDrainQuantity.value === null, '固定盘不应得到克泄多寡');
    assert(synthesis.qianliStrengthCompositionEvaluations.every((item) => item.status !== 'matched-source-pattern'), '固定盘不应命中来源等级');
    assert(synthesis.sufficiency.status === 'insufficient', 'Synthesis 应继续 insufficient');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 不得启动');
});

test('Audit v0.1 不引入 score/weight/points/thresholdValue/classificationResult', () => {
    const model = outputFor().semanticModel;
    const view = {
        contract:model.strengthSynthesis.qianliQuantityClassificationAuditContract,
        audit:model.strengthSynthesis.qianliQuantityClassificationAuditView,
        evidence:model.strengthSynthesis.qianliQuantityClassificationSourceEvidence
    };
    const keys = collectKeys(view);
    ['score','weight','points','thresholdValue','classificationResult','strengthLevel'].forEach((key) => {
        assert(!keys.has(key), `Audit 不应出现字段：${key}`);
    });
    assert(api.CONTRACT.resolverEnabled === false, 'audit 层不得启用 resolver');
});

test('生产加载链应在 Qianli Strength Composition 后加载 Quantity Source Audit', () => {
    const compositionSource = fs.readFileSync(path.join(ROOT, 'js/bazi-qianli-strength-composition.js'), 'utf8');
    const auditSource = fs.readFileSync(path.join(ROOT, 'js/bazi-qianli-quantity-classification-audit.js'), 'utf8');
    assert(compositionSource.includes('./js/bazi-qianli-quantity-classification-audit.js'), 'Composition 尚未接 Quantity Source Audit loader');
    assert(auditSource.includes('./js/bazi-qianli-quantity-classification-source.js'), 'Audit 尚未加载独立 source registry');
});

console.log(`\nQianli Quantity Classification Source Audit v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
