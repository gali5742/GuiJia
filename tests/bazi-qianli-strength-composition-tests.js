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
    'js/bazi-qianli-strength-composition.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziQianliStrengthComposition;

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

function resolvedProfile(seasonal, supportQuantity, restraintDrainQuantity, branchQi) {
    return {
        seasonal:{ status:'resolved', value:seasonal },
        supportQuantity:{ status:'resolved', value:supportQuantity },
        restraintDrainQuantity:{ status:'resolved', value:restraintDrainQuantity },
        branchQi:{ status:'resolved', value:branchQi }
    };
}

function matchedTerms(profile) {
    return api.evaluateSourceComposition(profile)
        .filter((item) => item.status === 'matched-source-pattern')
        .map((item) => item.sourceTerm);
}

function collectKeys(value, keys = new Set()) {
    if (!value || typeof value !== 'object') return keys;
    Object.keys(value).forEach((key) => {
        keys.add(key);
        collectKeys(value[key], keys);
    });
    return keys;
}

test('Qianli Strength Composition v0.1 冻结六类来源结论与八条条件分支', () => {
    assert(api?.installed === true, 'Qianli Strength Composition 模块未安装');
    assert(api.QIANLI_STRENGTH_COMPOSITION_VERSION === '0.1', '版本异常');
    assert(api.SOURCE_COMPOSITION_MODEL.length === 6, `来源结论数异常：${api.SOURCE_COMPOSITION_MODEL.length}`);
    const branches = api.SOURCE_COMPOSITION_MODEL.reduce((sum, item) => sum + item.branches.length, 0);
    assert(branches === 8, `来源条件分支数异常：${branches}`);
    assert(api.CONTRACT.sourceConclusionCount === 6 && api.CONTRACT.sourceBranchCount === 8, '合同中的六类/八分支未锁定');
});

test('中强与中弱各保留两条并列构成，不拆成额外等级', () => {
    const mediumStrong = api.SOURCE_COMPOSITION_MODEL.find((item) => item.sourceTerm === '中强');
    const mediumWeak = api.SOURCE_COMPOSITION_MODEL.find((item) => item.sourceTerm === '中弱');
    assert(mediumStrong?.branches.length === 2, '中强应保留两条来源分支');
    assert(mediumWeak?.branches.length === 2, '中弱应保留两条来源分支');
    assert(new Set(api.SOURCE_COMPOSITION_MODEL.map((item) => item.sourceTerm)).size === 6, '六类来源术语被错误拆成八类');
});

test('来源模型把被分 distribution 排除于“多克泄／少克泄”输入', () => {
    assert(api.CONTRACT.distributionIncludedInRestraintDrain === false, '合同错误并入 distribution');
    const inventory = api.contributionInventory({
        visibleStemDaymasterContributionRecords:[
            { id:'C-R', strengthMeaning:'restraint', contributionState:'realized-daymaster-contribution-in-source-context' },
            { id:'C-D', strengthMeaning:'drain', contributionState:'realized-daymaster-contribution-in-source-context' },
            { id:'C-X', strengthMeaning:'distribution', contributionState:'realized-daymaster-contribution-in-source-context' }
        ]
    });
    assert(inventory.restraintDrainContributionIds.join(',') === 'C-R,C-D', `克泄 inventory 异常：${inventory.restraintDrainContributionIds.join(',')}`);
    assert(inventory.realizedDistributionContributionIds.join(',') === 'C-X', 'distribution 应保留独立 inventory');
});

test('固定验证盘只形成来源输入 profile，不能自行生成多寡或支得气分类', () => {
    const model = outputFor().semanticModel;
    const profile = model.strengthSynthesis.qianliStrengthCompositionInputProfile;
    assert(profile.seasonal.status === 'resolved' && profile.seasonal.value === '失令', `验证盘季节来源分类异常：${profile.seasonal.value}`);
    assert(profile.supportQuantity.status === 'unresolved' && profile.supportQuantity.value === null, '不得自行判多帮扶/少帮扶');
    assert(profile.restraintDrainQuantity.status === 'unresolved' && profile.restraintDrainQuantity.value === null, '不得自行判多克泄/少克泄');
    assert(profile.branchQi.status === 'unresolved' && profile.branchQi.value === null, '不得自行判支得气/无气');
    assert(model.strengthSynthesis.qianliStrengthCompositionEvaluations.every((item) => item.status !== 'matched-source-pattern'), '输入未解析时不应命中来源等级');
});

test('当令/失令只复用已建立的月令一级轴，不设置分值或绝对优先级', () => {
    const inSeason = outputFor(['甲','丙','甲','丁'], ['寅','卯','子','午']).semanticModel.strengthSynthesis.qianliStrengthCompositionInputProfile;
    const outSeason = outputFor(['辛','丁','甲','丁'], ['亥','酉','寅','卯']).semanticModel.strengthSynthesis.qianliStrengthCompositionInputProfile;
    assert(inSeason.seasonal.value === '当令', `当令映射异常：${inSeason.seasonal.value}`);
    assert(outSeason.seasonal.value === '失令', `失令映射异常：${outSeason.seasonal.value}`);
    assert(api.CONTRACT.numericAggregation === false && api.CONTRACT.priorityAggregation === false, '月令被引入计分/优先级');
});

test('synthetic：当令 + 多帮扶只匹配来源“最强”模板', () => {
    const terms = matchedTerms(resolvedProfile('当令', '多帮扶', '少克泄', '年日时支得气'));
    assert(terms.join(',') === '最强', `来源匹配异常：${terms.join(',')}`);
});

test('synthetic：中强两条来源分支都归同一“中强”结论', () => {
    const a = matchedTerms(resolvedProfile('失令', '多帮扶', '少克泄', '年日时支得气'));
    const b = matchedTerms(resolvedProfile('当令', '少帮扶', '少克泄', '年日时支得气'));
    assert(a.includes('中强'), `失令+多帮扶未匹配中强：${a.join(',')}`);
    assert(b.includes('中强'), `当令+少帮扶未匹配中强：${b.join(',')}`);
});

test('synthetic：次强必须同时满足失令、少帮扶、年日时支得气', () => {
    const matched = matchedTerms(resolvedProfile('失令', '少帮扶', '少克泄', '年日时支得气'));
    const blockedByQi = matchedTerms(resolvedProfile('失令', '少帮扶', '少克泄', '年日时支无气'));
    assert(matched.includes('次强'), '完整次强条件未命中');
    assert(!blockedByQi.includes('次强'), '支无气时仍错误命中次强');
});

test('synthetic：最弱/中弱/次弱严格按原书克泄与支气条件分支匹配', () => {
    assert(matchedTerms(resolvedProfile('失令', '少帮扶', '多克泄', '年日时支无气')).includes('最弱'), '最弱条件未命中');
    assert(matchedTerms(resolvedProfile('当令', '少帮扶', '多克泄', '年日时支无气')).includes('中弱'), '当令+多克泄中弱未命中');
    assert(matchedTerms(resolvedProfile('失令', '多帮扶', '少克泄', '年日时支无气')).includes('中弱'), '失令+少克泄中弱未命中');
    assert(matchedTerms(resolvedProfile('当令', '多帮扶', '少克泄', '年日时支无气')).includes('次弱'), '次弱条件未命中');
});

test('真实命盘 dependency 明确卡在多寡分类与支气 aggregation，Synthesis 继续 insufficient', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-QIANLI-STRENGTH-COMPOSITION-MODEL']?.status === 'resolved', '来源组合模型依赖应 resolved');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', '帮扶多寡不应提前 resolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', '克泄多寡不应提前 resolved');
    assert(deps['SD-BRANCH-QI-AGGREGATION']?.status === 'unresolved', '支气 aggregation 不应提前 resolved');
    assert(deps['SD-QIANLI-STRENGTH-COMPOSITION-COVERAGE']?.status === 'unresolved', '来源组合 coverage 不应提前 resolved');
    assert(synthesis.sufficiency.status === 'insufficient', '来源模型建立后 Synthesis 仍应 insufficient');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 不得启动');
});

test('来源模板命中仍只是 source composition match，不提供项目 Assessment 结论', () => {
    const evaluations = api.evaluateSourceComposition(resolvedProfile('当令', '多帮扶', '少克泄', '年日时支得气'));
    const strongest = evaluations.find((item) => item.sourceTerm === '最强');
    assert(strongest.status === 'matched-source-pattern', 'synthetic 最强模板应命中');
    assert(strongest.assessmentConclusion === null, '来源模板命中不得直接写 Assessment conclusion');
    assert(api.CONTRACT.sourcePatternMatchIsNotAssessment === true, '合同未冻结 source/Assessment 边界');
    assert(api.CONTRACT.finalAssessmentMapping === false, 'v0.1 不得宣称已有最终映射');
});

test('Composition v0.1 不引入计分、多数、多寡阈值或最终强弱字段', () => {
    const model = outputFor().semanticModel;
    const compositionView = {
        contract:model.strengthSynthesis.qianliStrengthCompositionContract,
        input:model.strengthSynthesis.qianliStrengthCompositionInputProfile,
        evaluations:model.strengthSynthesis.qianliStrengthCompositionEvaluations
    };
    const keys = collectKeys(compositionView);
    ['score','weight','points','supportScore','againstScore','strengthLevel','actorGlobalEffectiveState'].forEach((key) => {
        assert(!keys.has(key), `Composition 不应出现字段：${key}`);
    });
    assert(api.CONTRACT.supportQuantityThresholdDefined === false, '不得伪造帮扶多寡阈值');
    assert(api.CONTRACT.restraintDrainQuantityThresholdDefined === false, '不得伪造克泄多寡阈值');
    assert(api.CONTRACT.branchQiAggregationDefined === false, '不得伪造支气 aggregation resolver');
});

test('生产加载链应在 Daymaster Contribution 后加载 Qianli Strength Composition', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-daymaster-contribution.js'), 'utf8');
    assert(source.includes('./js/bazi-qianli-strength-composition.js'), 'Daymaster Contribution 尚未接 Qianli Strength Composition 生产 loader');
});

console.log(`\nQianli Strength Composition v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
