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
    'js/bazi-strength-synthesis.js',
    'js/bazi-root-effect-state.js',
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

function outputFor(gans, zhis) {
    return interpretation.buildBaziInterpretation(makeResult(gans, zhis));
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

test('生产加载路径包含 Root Effective State 独立模块与 Guard 015', () => {
    const assessmentSource = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');
    assert(assessmentSource.includes('./js/bazi-root-effect-state.js'), '生产页面没有 Root Effective State 加载路径');
    assert(GuiJia.baziAssessment.assessmentGuardRegistry.rules.some((item) => item.id === 'BAZI-ASSESS-GUARD-015'), '缺少 Guard 015');
});

test('固定验证盘无根时 Root Effectiveness 为 not-applicable，但藏支印星效力仍 unresolved', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const dependencies = dependencyMap(synthesis);
    assert(Array.isArray(synthesis.rootActorStates) && synthesis.rootActorStates.length === 0, '固定盘不应生成根 actor state');
    assert(dependencies['SD-ROOT-EFFECT-STATE-CONTRACT']?.status === 'resolved', 'Root Effect State contract 未 resolved');
    assert(dependencies['SD-ROOT-EFFECTIVENESS']?.status === 'resolved', '无根盘的 Root Effectiveness 应为 not-applicable/resolved');
    assert(dependencies['SD-ROOT-EFFECTIVENESS'].resolvedByClaimIds.includes('SC-ROOT-EFFECTIVENESS-NOT-APPLICABLE'), '无根盘缺 not-applicable Claim');
    assert(dependencies['SD-HIDDEN-SUPPORT-EFFECTIVENESS']?.status === 'unresolved', '亥藏甲正印存在时 Hidden Support Effectiveness 应保持 unresolved');
    assert(synthesis.sufficiency.status === 'insufficient', '其余依赖未解析时仍应 insufficient');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得因 Root Effect State 推进最终 Assessment');
});

test('根 actor 所在支命中六冲时只关联真实 Structure ID，不自动改写有效状态', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const clash = model.structures.find((item) => item.code === 'BRANCH_SIX_CLASH');
    assert(clash, '测试盘应存在子午六冲 Structure');
    const root = model.strengthSynthesis.rootActorStates.find((item) => item.zhi === '午' && item.gan === '丁');
    assert(root, '午中丁应生成本干通根 actor state');
    assert(root.relatedStructureRefs.includes(clash.id), `根 actor 未关联六冲 Structure：${clash.id}`);
    assert(root.resolutionStatus === 'unresolved', '命中六冲后仍应保持 unresolved');
    assert(root.effectiveState === null, '命中六冲后不得直接写 effectiveState');
    const dep = dependencyMap(model.strengthSynthesis)['SD-ROOT-EFFECTIVENESS'];
    assert(dep.status === 'unresolved', '有根 actor 时 Root Effectiveness 不应提前 resolved');
    assert(!model.strengthSynthesis.claims.some((item) => item.claimKey === 'root.effectiveness' && item.value?.effectiveState), '六冲被错误升级为根效力结论');
});

test('根 actor 未命中地支 Structure 时也不能仅凭存在升级为 effective', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','辰','申','酉']).semanticModel;
    const root = model.strengthSynthesis.rootActorStates.find((item) => item.zhi === '午' && item.gan === '丁');
    assert(root, '午中丁应生成根 actor state');
    assert(root.relatedStructureRefs.length === 0, `午根不应被无关 Structure 关联：${root.relatedStructureRefs.join(',')}`);
    assert(root.resolutionStatus === 'unresolved', '没有直接结构关系也不能自动判根有效');
    assert(root.effectiveState === null, 'presence 不得自动升级为 effective');
});

test('relatedStructureRefs 全部来自当前真实 Structure，且只关联根所在柱的地支关系', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const structures = new Map(model.structures.map((item) => [item.id, item]));
    model.strengthSynthesis.rootActorStates.forEach((root) => {
        root.relatedStructureRefs.forEach((ref) => {
            assert(structures.has(ref), `root state 引用了不存在的 Structure：${ref}`);
            const relation = structures.get(ref);
            const meta = bazi.getBaziRelationMeta(relation.code);
            assert(meta?.scope === 'branch', `根 actor 不应关联天干 Structure：${ref}`);
        });
    });
});

test('无藏支印比时 Hidden Support Effectiveness 也可明确 not-applicable', () => {
    const model = outputFor(['辛','壬','丁','己'], ['丑','子','申','酉']).semanticModel;
    const dependencies = dependencyMap(model.strengthSynthesis);
    const hidden = model.strengthEffects.effects.find((item) => item.id === 'FX-HIDDEN-SUPPORT');
    assert(hidden?.presence === 'absent', '测试盘应无藏支印比');
    assert(dependencies['SD-HIDDEN-SUPPORT-EFFECTIVENESS']?.status === 'resolved', '无藏支扶身 actor 时应 not-applicable/resolved');
    assert(dependencies['SD-HIDDEN-SUPPORT-EFFECTIVENESS'].resolvedByClaimIds.includes('SC-HIDDEN-SUPPORT-EFFECTIVENESS-NOT-APPLICABLE'), '缺 hidden-support not-applicable Claim');
});

test('reserved Root Effective State 仅为词汇合同，当前没有 actor 输出这些状态', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const reserved = new Set(Object.values(GuiJia.baziRootEffectState.rootEffectiveStates));
    model.strengthSynthesis.rootActorStates.forEach((item) => {
        assert(item.effectiveState === null, `当前 actor 不应输出 reserved state：${item.effectiveState}`);
        assert(!reserved.has(item.resolutionStatus), 'resolutionStatus 不应与 effectiveState 词汇混层');
    });
    const contract = model.strengthSynthesis.claims.find((item) => item.claimKey === 'root.effect-state-contract');
    assert(contract?.status === 'resolved', '缺 Root Effect State contract Claim');
    assert(contract.value.presenceSeparatedFromEffect === true, '合同未锁定 presence/effect 分层');
    assert(contract.value.relationPresenceSeparatedFromEffectChange === true, '合同未锁定 relation/effect-change 分层');
});

test('复制分析上下文不泄漏 Root Effective State 内部控制字段', () => {
    const result = makeResult(['甲','壬','丁','己'], ['午','子','亥','酉']);
    const output = interpretation.buildBaziInterpretation(result);
    const copied = interpretation.buildBaziContextText(result, output);
    ['rootActorStates','relatedStructureRefs','SD-ROOT-EFFECT-STATE-CONTRACT','SC-ROOT-EFFECT-STATE-CONTRACT','present-unresolved','BAZI-STRENGTH-ROOT-EFFECT-STATE-001'].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏 Root Effect State 内部字段：${term}`);
    });
});

console.log(`\nBaZi root effect state: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
