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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);
const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const synthesisApi = GuiJia.baziStrengthSynthesis;

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

function collectKeys(value, keys = new Set()) {
    if (!value || typeof value !== 'object') return keys;
    Object.keys(value).forEach((key) => {
        keys.add(key);
        collectKeys(value[key], keys);
    });
    return keys;
}

test('静态页面存在 Strength Synthesis 的生产加载路径', () => {
    const indexSource = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const assessmentSource = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');
    const modulePath = './js/bazi-strength-synthesis.js';
    assert(indexSource.includes(modulePath) || assessmentSource.includes(modulePath), '生产页面没有加载 bazi-strength-synthesis.js 的路径');
});

test('验证盘启用月令层级与根角色 Synthesis Rule，但不生成最终身强弱结论', () => {
    const output = outputFor();
    const model = output.semanticModel;
    const synthesis = model.strengthSynthesis;
    assert(synthesis?.version === '0.1', `synthesis version 异常：${synthesis?.version}`);
    assert(synthesis?.state === 'evaluated', `启用 Synthesis 规则后应为 evaluated：${synthesis?.state}`);
    assert(
        synthesis.activeRuleIds.join(',') === 'BAZI-STRENGTH-SYNTH-SEASON-001,BAZI-STRENGTH-SYNTH-ROOT-001',
        `activeRuleIds 异常：${synthesis.activeRuleIds.join(',')}`
    );
    assert(synthesis.claims.length === 2, `当前应生成月令层级与根角色两个 Claim：${synthesis.claims.length}`);
    assert(synthesis.claims.some((item) => item.claimKey === 'seasonal.hierarchy'), '缺少月令层级 Claim');
    assert(synthesis.claims.some((item) => item.claimKey === 'root.role-model'), '缺少根角色 Claim');
    assert(synthesis.conflicts.length === 0, '扶、克、泄方向并存不应自动制造 Conflict');
    assert(synthesis.sufficiency.status === 'insufficient', '实际效力与支气依赖未解析时必须保持 insufficient');
    assert(model.assessmentLayer.state === 'contract-only', 'Assessment 仍应保持 contract-only');
    assert(model.assessmentLayer.assessments.length === 0, 'Synthesis 角色规则不应生成 Assessment 结论');
    const strength = model.assessmentLayer.domains.dayMasterStrength;
    assert(strength.status === 'not-evaluated', 'Assessment status 不得被 Synthesis evaluated 改写');
    assert(strength.synthesisCollection === synthesis, 'Assessment 必须读取同一份 Synthesis collection');
    assert(strength.synthesisSufficiencyStatus === 'insufficient', 'Assessment 输入应看见 Synthesis 的充分性状态');
});

test('月令层级与根角色依赖已解析，根实际效力另立未解析依赖', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const dependencies = dependencyMap(synthesis);

    assert(dependencies['SD-SEASONAL-HIERARCHY']?.status === 'resolved', 'SD-SEASONAL-HIERARCHY 应已 resolved');
    assert(dependencies['SD-SEASONAL-HIERARCHY'].resolvedByClaimIds.includes('SC-SEASONAL-HIERARCHY'), '月令依赖缺 resolved Claim');
    assert(!synthesis.sufficiency.blockingDependencyIds.includes('SD-SEASONAL-HIERARCHY'), '已解析月令依赖仍在阻断 Sufficiency');

    assert(dependencies['SD-ROOT-ROLE']?.status === 'resolved', 'SD-ROOT-ROLE 应已 resolved');
    assert(dependencies['SD-ROOT-ROLE'].resolvedByClaimIds.includes('SC-ROOT-ROLE'), '根角色依赖缺 resolved Claim');
    assert(!synthesis.sufficiency.blockingDependencyIds.includes('SD-ROOT-ROLE'), '已解析根角色依赖仍在阻断 Sufficiency');

    ['SD-VISIBLE-EFFECTIVENESS','SD-ROOT-EFFECTIVENESS','SD-BRANCH-QI-AGGREGATION'].forEach((id) => {
        assert(dependencies[id], `缺少 ${id}`);
        assert(dependencies[id].status === 'unresolved', `${id} 不应提前 resolved`);
        assert(synthesis.sufficiency.blockingDependencyIds.includes(id), `${id} 未阻断最终充分性`);
    });

    const keys = collectKeys(synthesis);
    ['supportSide','restraintSide','drainSide','distributionSide','supportScore','againstScore','score','weight','points','strengthLevel'].forEach((key) => {
        assert(!keys.has(key), `Synthesis 不应出现阵营/计分字段：${key}`);
    });
});

test('得令与失令都使用同一独立一级层级，不生成绝对优先级', () => {
    const support = outputFor(['甲','丙','甲','丁'], ['寅','卯','子','午']).semanticModel;
    const nonSupport = outputFor(['辛','丁','甲','丁'], ['亥','酉','寅','卯']).semanticModel;
    const supportEffect = support.strengthEffects.effects.find((item) => item.id === 'FX-SEASONAL');
    const nonSupportEffect = nonSupport.strengthEffects.effects.find((item) => item.id === 'FX-SEASONAL');
    const supportClaim = support.strengthSynthesis.claims.find((item) => item.claimKey === 'seasonal.hierarchy');
    const nonSupportClaim = nonSupport.strengthSynthesis.claims.find((item) => item.claimKey === 'seasonal.hierarchy');
    assert(supportEffect.direction === 'seasonal-support', `得令测试盘季节方向异常：${supportEffect.direction}`);
    assert(nonSupportEffect.direction === 'seasonal-non-support', `失令测试盘季节方向异常：${nonSupportEffect.direction}`);
    [supportClaim, nonSupportClaim].forEach((claim) => {
        assert(claim?.status === 'resolved', '得令/失令都应能解析层级');
        assert(claim.value.role === 'independent-primary-axis', '月令未保持 independent-primary-axis');
        assert(claim.value.conversion === 'non-convertible', '月令不应进入统一可换算分值');
        assert(claim.value.necessaryCondition === false, '月令不应被设成一票式必要条件');
        assert(claim.value.sufficientAlone === false, '月令不应单独生成最终强弱结论');
    });
});

test('月令层级规则只解释层级，不复制 seasonal-support / non-support 为最终 Claim', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const claim = synthesis.claims.find((item) => item.claimKey === 'seasonal.hierarchy');
    assert(claim.sourceEffectIds.join(',') === 'FX-SEASONAL', '月令层级 Claim 应只引用 FX-SEASONAL');
    assert(claim.sourceContractId === 'qianli-basic-strength-evidence', '月令层级 Claim 缺来源合同');
    assert(claim.sourceLocator.includes('强弱篇'), '月令层级 Claim 缺原典定位');
    const serialized = JSON.stringify(claim.value);
    assert(!serialized.includes('strong') && !serialized.includes('weak'), '层级 Claim 偷渡最终强弱结论');
});

test('根角色规则区分本干通根、同类得地与藏支印比，不把藏支扶身替代为根', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const claim = synthesis.claims.find((item) => item.claimKey === 'root.role-model');
    assert(claim?.status === 'resolved', '根角色 Claim 应 resolved');
    assert(claim.ruleId === 'BAZI-STRENGTH-SYNTH-ROOT-001', '根角色 Claim ruleId 异常');
    assert(claim.value.exactRootRole === 'root-same-stem-hidden', '本干通根角色定义异常');
    assert(claim.value.sameElementRootRole === 'root-same-element-different-stem-hidden', '同类得地角色定义异常');
    assert(claim.value.hiddenSupportRole === 'ten-god-support-umbrella', '藏支扶身角色定义异常');
    assert(claim.value.rootActorMayAlsoBeHiddenSupport === true, '根 actor 应允许同时具有比劫扶身语义');
    assert(claim.value.hiddenSupportCanSatisfyRootClaim === false, '藏支扶身不得替代“有根”命题');
    assert(claim.value.rootSubtypesEquivalent === false, '本干通根与同类得地不得压成等价子类型');
    assert(claim.value.effectivenessResolved === false, '角色解析不得偷渡根实际效力');
    assert(claim.sourceEffectIds.includes('FX-ROOT-EXACT'), '根角色 Claim 缺本干通根 Effect');
    assert(claim.sourceEffectIds.includes('FX-ROOT-SAME-ELEMENT'), '根角色 Claim 缺同类得地 Effect');
    assert(claim.sourceEffectIds.includes('FX-HIDDEN-SUPPORT'), '根角色 Claim 缺藏支扶身 Effect');
});

test('仅有藏支印星时仍可形成扶身候选，但不能因此满足根气命题', () => {
    const model = outputFor().semanticModel;
    const exact = model.strengthEffects.effects.find((item) => item.id === 'FX-ROOT-EXACT');
    const same = model.strengthEffects.effects.find((item) => item.id === 'FX-ROOT-SAME-ELEMENT');
    const hidden = model.strengthEffects.effects.find((item) => item.id === 'FX-HIDDEN-SUPPORT');
    const role = model.strengthSynthesis.claims.find((item) => item.claimKey === 'root.role-model');
    assert(exact.presence === 'absent', '验证盘本干通根应 absent');
    assert(same.presence === 'absent', '验证盘同类得地应 absent');
    assert(hidden.presence === 'present', '验证盘亥中甲正印应形成藏支扶身候选');
    assert(role.value.hiddenSupportCanSatisfyRootClaim === false, '印星扶身候选被错误当作根气替代');
    assert(model.strengthSynthesis.sufficiency.status === 'insufficient', '藏支印星存在不应使 Synthesis sufficient');
});

test('不同 Intermediate Effect 方向共存不构成 Conflict', () => {
    const model = outputFor().semanticModel;
    const directions = new Set(model.strengthEffects.effects.map((item) => item.direction));
    assert(directions.has('support-candidate'), '验证盘应存在 support-candidate');
    assert(directions.has('restraint-candidate'), '验证盘应存在 restraint-candidate');
    assert(directions.has('drain-candidate'), '验证盘应存在 drain-candidate');
    assert(model.strengthSynthesis.conflicts.length === 0, '不同作用方向同时存在不等于逻辑冲突');
});

test('Conflict 只在同一 claimKey 的已解析互斥结果之间生成', () => {
    const noConflict = synthesisApi.detectConflicts([
        { id:'SC-A', claimKey:'visible.support', status:'resolved', value:'effective' },
        { id:'SC-B', claimKey:'visible.restraint', status:'resolved', value:'effective' }
    ]);
    assert(noConflict.length === 0, '不同 claimKey 不应生成 Conflict');

    const conflict = synthesisApi.detectConflicts([
        { id:'SC-C', claimKey:'root.actor-1.effectiveState', status:'resolved', value:'effective' },
        { id:'SC-D', claimKey:'root.actor-1.effectiveState', status:'resolved', value:'ineffective' },
        { id:'SC-E', claimKey:'root.actor-1.effectiveState', status:'unresolved', value:null }
    ]);
    assert(conflict.length === 1, `同一 claimKey 互斥结果应生成一个 Conflict：${conflict.length}`);
    assert(conflict[0].claimIds.join(',') === 'SC-C,SC-D', 'Conflict 只应收集已解析且互斥的 Claim');
});

test('同一藏干多重语义在 Synthesis 中形成 overlap 记录但不重复计力', () => {
    const output = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']);
    const overlap = output.semanticModel.strengthSynthesis.actorOverlaps.find((item) =>
        item.roles.some((role) => role.zhi === '午' && role.gan === '丁')
    );
    assert(overlap, '午中丁同时承担本干通根与藏支扶身语义时应形成 actor overlap');
    assert(overlap.effectIds.includes('FX-ROOT-EXACT'), 'overlap 缺本干通根语义');
    assert(overlap.effectIds.includes('FX-HIDDEN-SUPPORT'), 'overlap 缺藏支扶身语义');
    assert(overlap.policy === 'same-actor-may-carry-multiple-semantics-do-not-add', 'overlap policy 异常');
    const role = output.semanticModel.strengthSynthesis.claims.find((item) => item.claimKey === 'root.role-model');
    assert(role.value.overlapPolicy === overlap.policy, '根角色 Claim 与 actor overlap policy 不一致');
});

test('Sufficiency 由规则覆盖、依赖和 Conflict 决定，不由数量决定', () => {
    const unresolved = [{ id:'SD-X', status:'unresolved' }];
    const resolved = [{ id:'SD-X', status:'resolved' }];
    const blocked = synthesisApi.buildSufficiency({ dependencies:unresolved, conflicts:[], activeRuleIds:['RULE-1'] });
    assert(blocked.status === 'insufficient', '存在未解析必要依赖时，即使有 active rule 也不得 sufficient');
    const ready = synthesisApi.buildSufficiency({ dependencies:resolved, conflicts:[], activeRuleIds:['RULE-1'] });
    assert(ready.status === 'sufficient', '有规则覆盖且必要依赖全部解析时 contract 应允许 sufficient');
    const noRules = synthesisApi.buildSufficiency({ dependencies:resolved, conflicts:[], activeRuleIds:[] });
    assert(noRules.status === 'insufficient', '没有正向规则时不得因依赖 resolved 就 sufficient');
});

test('Synthesis insufficient 与 Assessment indeterminate 严格分层', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const strength = model.assessmentLayer.domains.dayMasterStrength;
    assert(synthesis.sufficiency.status === 'insufficient', '验证盘当前应为 synthesis insufficient');
    assert(strength.status === 'not-evaluated', 'Synthesis insufficient 不得写成 Assessment insufficient/conflict');
    assert(model.assessmentLayer.assessments.length === 0, 'Synthesis insufficient 不得生成 indeterminate Assessment Record');
    assert(!model.assessmentLayer.assessments.some((item) => item.conclusion === 'indeterminate'), 'insufficient 被错误转成 indeterminate');
});

test('Synthesis 只引用现有 Intermediate Effect，复制上下文不泄漏内部控制字段', () => {
    const result = makeResult();
    const output = interpretation.buildBaziInterpretation(result);
    const model = output.semanticModel;
    const effectIds = new Set(model.strengthEffects.effects.map((item) => item.id));
    model.strengthSynthesis.sourceEffectIds.forEach((id) => assert(effectIds.has(id), `Synthesis 引用了不存在的 Effect：${id}`));
    model.strengthSynthesis.dependencies.forEach((dependency) =>
        dependency.sourceEffectIds.forEach((id) => assert(effectIds.has(id), `${dependency.id} 引用了不存在的 Effect：${id}`))
    );
    model.strengthSynthesis.claims.forEach((claim) =>
        (claim.sourceEffectIds || []).forEach((id) => assert(effectIds.has(id), `${claim.id} 引用了不存在的 Effect：${id}`))
    );

    const copied = interpretation.buildBaziContextText(result, output);
    [
        'strengthSynthesis',
        'SD-SEASONAL-HIERARCHY',
        'SC-SEASONAL-HIERARCHY',
        'SD-ROOT-ROLE',
        'SC-ROOT-ROLE',
        'SD-ROOT-EFFECTIVENESS',
        'actorOverlaps',
        'blockingDependencyIds',
        'synthesisSufficiencyStatus',
        'independent-primary-axis',
        'root-same-stem-hidden'
    ].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏 Synthesis 内部字段：${term}`);
    });
});

console.log(`\nBaZi strength synthesis: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);