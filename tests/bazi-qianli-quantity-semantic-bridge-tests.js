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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziQianliQuantitySemanticBridgeSource;
const api = GuiJia.baziQianliQuantitySemanticBridge;

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

test('Quantity Semantic Bridge v0.1 将来源合同与执行逻辑独立拆分', () => {
    assert(sourceApi?.installed === true, 'bridge source contract 未安装');
    assert(api?.installed === true, 'bridge execution 未安装');
    assert(sourceApi.VERSION === '0.1' && api.VERSION === '0.1', '版本异常');
    assert(sourceApi.BRIDGE_RULES.length === 5, 'bridge source rules 数量异常');
    assert(api.BRIDGE_RULES === sourceApi.BRIDGE_RULES, '执行层没有直接消费 bridge source rules');
});

test('五行关系只映射 quantity side，不产生作用兑现或多寡', () => {
    assert(api.relationToDayMaster('木','火').quantitySide === 'support', '生我应进入 support side');
    assert(api.relationToDayMaster('火','火').quantitySide === 'support', '同我应进入 support side');
    assert(api.relationToDayMaster('水','火').quantitySide === 'restraint-drain', '克我应进入 restraint-drain side');
    assert(api.relationToDayMaster('土','火').quantitySide === 'restraint-drain', '我生应进入 restraint-drain side');
    assert(api.relationToDayMaster('金','火').quantitySide === 'separate-distribution', '我克必须继续独立');
    assert(sourceApi.CONTRACT.manyFewClassifierDefined === false, '关系映射不得变成 many/few classifier');
});

test('固定验证盘表层三干进入 source-surface inventory，但不等于 realized contribution', () => {
    const inventory = outputFor().semanticModel.strengthSynthesis.qianliQuantitySemanticBridgeInventory;
    const stems = inventory.sourceSurfaceInventory.stems;
    assert(stems.length === 3, `表层明干数量异常：${stems.length}`);
    const year = stems.find((item) => item.position === 'year');
    const month = stems.find((item) => item.position === 'month');
    const hour = stems.find((item) => item.position === 'hour');
    assert(year?.gan === '丁' && year.quantitySide === 'support', '年干丁应为 support surface item');
    assert(month?.gan === '壬' && month.quantitySide === 'restraint-drain', '月干壬应为 restraint surface item');
    assert(hour?.gan === '己' && hour.quantitySide === 'restraint-drain', '时干己应为 drain surface item');
    assert(stems.every((item) => item.realizedContributionEquivalent === false), 'surface stem 不得等价为 realized contribution');
    assert(stems.every((item) => item.quantityInclusionDecision === 'context-dependent-unresolved'), 'surface stem 不得提前决定 quantity inclusion');
});

test('固定验证盘四支全部进入 surface inventory，月支与年日时支气保持分轴', () => {
    const branches = outputFor().semanticModel.strengthSynthesis.qianliQuantitySemanticBridgeInventory.sourceSurfaceInventory.branches;
    assert(branches.length === 4, `表层地支数量异常：${branches.length}`);
    const month = branches.find((item) => item.position === 'month');
    assert(month?.zhi === '子' && month.seasonalAxis === true && month.branchQiAxis === false, '月支子必须留在季节轴');
    ['year','day','hour'].forEach((position) => {
        const item = branches.find((branch) => branch.position === position);
        assert(item?.branchQiAxis === true && item.seasonalAxis === false, `${position} 支应留在 branch-qi 轴`);
    });
    assert(branches.every((item) => item.quantityInclusionDecision === 'context-dependent-unresolved'), '不得固定所有地支是否计入数量');
});

test('人元 inventory 覆盖四支藏干并保留定性层级，不做数字换算', () => {
    const hidden = outputFor().semanticModel.strengthSynthesis.qianliQuantitySemanticBridgeInventory.hiddenModifierInventory;
    assert(hidden.length === 7, `固定盘藏干 inventory 应为7项，实际 ${hidden.length}`);
    const haiJia = hidden.find((item) => item.position === 'day' && item.zhi === '亥' && item.gan === '甲');
    assert(haiJia?.quantitySide === 'support', '亥中甲应只作为 support modifier candidate');
    assert(haiJia?.level === '中气', '亥中甲层级应保留中气');
    assert(hidden.every((item) => item.numericConversion === null), '人元不得转换为数字');
    assert(hidden.every((item) => item.sourceSurfaceEquivalent === false), '人元不得冒充表层干支');
});

test('project realization inventory 与 source-surface inventory 并列而不互相替代', () => {
    const inventory = outputFor().semanticModel.strengthSynthesis.qianliQuantitySemanticBridgeInventory;
    const project = inventory.projectRealizationInventory;
    assert(project.length === 3, `固定盘应有3条日主 contribution record，实际 ${project.length}`);
    assert(project.every((item) => item.sourceSurfaceEquivalent === false), 'project realization 不得等价为 source surface');
    assert(project.every((item) => item.quantityClassificationEquivalent === false), 'project realization 不得直接等价为 quantity classification');
    assert(project.every((item) => item.contributionState === 'unresolved-daymaster-contribution'), '固定盘 contribution 应仍 unresolved');
});

test('每个表层明干都可回链自己的 Daymaster Contribution record', () => {
    const stems = outputFor().semanticModel.strengthSynthesis.qianliQuantitySemanticBridgeInventory.sourceSurfaceInventory.stems;
    assert(stems.every((item) => item.projectContributionRecordIds.length === 1), '每个 visible stem 应精确回链一条 daymaster contribution');
});

test('Bridge model 与 inventory coverage 可 resolved，但 many/few rule 和两个 classifier 继续 unresolved', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-QIANLI-QUANTITY-SEMANTIC-BRIDGE']?.status === 'resolved', 'semantic bridge 应 resolved');
    assert(deps['SD-QIANLI-QUANTITY-EVIDENCE-INVENTORY-COVERAGE']?.status === 'resolved', 'inventory coverage 应 resolved');
    assert(deps['SD-QIANLI-QUANTITY-CLASSIFICATION-RULE']?.status === 'unresolved', 'many/few classification rule 必须 unresolved');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support classifier 不得启动');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain classifier 不得启动');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION'].dependsOnDependencyIds.includes('SD-QIANLI-QUANTITY-CLASSIFICATION-RULE'), 'support classifier 未依赖独立 classification rule');
});

test('Bridge resolved 仍不产生多寡、来源等级或最终 Assessment', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    assert(synthesis.qianliQuantitySemanticBridgeInventory.classification === null, 'Bridge 不得产生 classification');
    assert(synthesis.qianliStrengthCompositionInputProfile.supportQuantity.value === null, '不得生成多/少帮扶');
    assert(synthesis.qianliStrengthCompositionInputProfile.restraintDrainQuantity.value === null, '不得生成多/少克泄');
    assert(synthesis.qianliStrengthCompositionEvaluations.every((item) => item.status !== 'matched-source-pattern'), '不得命中来源强弱等级');
    assert(synthesis.sufficiency.status === 'insufficient', 'Synthesis 应继续 insufficient');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 不得启动');
});

test('distribution 在 surface、hidden 与 contract 中始终独立于 restraint-drain', () => {
    const inventory = outputFor().semanticModel.strengthSynthesis.qianliQuantitySemanticBridgeInventory;
    const branchYou = inventory.sourceSurfaceInventory.branches.find((item) => item.zhi === '酉');
    const hiddenXin = inventory.hiddenModifierInventory.find((item) => item.position === 'hour' && item.gan === '辛');
    assert(branchYou?.quantitySide === 'separate-distribution', '酉金对丁火应保持 distribution 独立轴');
    assert(hiddenXin?.quantitySide === 'separate-distribution', '酉中辛也应保持 distribution 独立轴');
    assert(sourceApi.CONTRACT.distributionIncludedInRestraintDrain === false, 'source contract 不得并入 distribution');
});

test('Bridge v0.1 不引入 score/weight/points/thresholdValue/classificationResult', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const view = {
        contract:synthesis.qianliQuantitySemanticBridgeContract,
        rules:synthesis.qianliQuantitySemanticBridgeSourceRules,
        inventory:synthesis.qianliQuantitySemanticBridgeInventory
    };
    const keys = collectKeys(view);
    ['score','weight','points','thresholdValue','classificationResult','strengthLevel'].forEach((key) => {
        assert(!keys.has(key), `Bridge 不应出现字段：${key}`);
    });
    assert(sourceApi.CONTRACT.hiddenModifierNumericConversionDefined === false, '不得启用 hidden modifier 数字换算');
});

test('生产加载链在 Quantity Source Audit 后加载 Semantic Bridge，并由 Bridge 加载独立 source contract', () => {
    const auditSource = fs.readFileSync(path.join(ROOT, 'js/bazi-qianli-quantity-classification-audit.js'), 'utf8');
    const bridgeSource = fs.readFileSync(path.join(ROOT, 'js/bazi-qianli-quantity-semantic-bridge.js'), 'utf8');
    assert(auditSource.includes('./js/bazi-qianli-quantity-semantic-bridge.js'), 'Audit 尚未接 Semantic Bridge loader');
    assert(bridgeSource.includes('./js/bazi-qianli-quantity-semantic-bridge-source.js'), 'Bridge 尚未加载独立 source contract');
});

console.log(`\nQianli Quantity Semantic Bridge v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
