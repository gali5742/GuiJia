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

test('验证盘进入 Strength Synthesis contract，但不生成最终身强弱结论', () => {
    const output = outputFor();
    const model = output.semanticModel;
    const synthesis = model.strengthSynthesis;
    assert(synthesis?.version === '0.1', `synthesis version 异常：${synthesis?.version}`);
    assert(synthesis?.state === 'contract-only', `无正向规则时应为 contract-only：${synthesis?.state}`);
    assert(synthesis.activeRuleIds.length === 0, 'Synthesis v0.1 不应启用正向规则');
    assert(synthesis.claims.length === 0, '没有正向规则时不应伪造 resolved/unresolved Claim');
    assert(synthesis.conflicts.length === 0, '扶、克、泄方向并存不应自动制造 Conflict');
    assert(synthesis.sufficiency.status === 'insufficient', '关键依赖未解析时必须保持 insufficient');
    assert(model.assessmentLayer.state === 'contract-only', 'Assessment 仍应保持 contract-only');
    assert(model.assessmentLayer.assessments.length === 0, 'Synthesis contract 不应生成 Assessment 结论');
    const strength = model.assessmentLayer.domains.dayMasterStrength;
    assert(strength.status === 'not-evaluated', 'Assessment status 不得被 Synthesis insufficient 改写');
    assert(strength.synthesisCollection === synthesis, 'Assessment 必须读取同一份 Synthesis collection');
    assert(strength.synthesisSufficiencyStatus === 'insufficient', 'Assessment 输入应看见 Synthesis 的充分性状态');
});

test('验证盘明确暴露四类关键未解析依赖，而不是把候选方向分成阵营计数', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const dependencies = dependencyMap(synthesis);
    ['SD-SEASONAL-HIERARCHY','SD-VISIBLE-EFFECTIVENESS','SD-ROOT-ROLE','SD-BRANCH-QI-AGGREGATION'].forEach((id) => {
        assert(dependencies[id], `缺少 ${id}`);
        assert(dependencies[id].status === 'unresolved', `${id} 不应提前 resolved`);
        assert(synthesis.sufficiency.blockingDependencyIds.includes(id), `${id} 未阻断最终充分性`);
    });
    const keys = collectKeys(synthesis);
    ['supportSide','restraintSide','drainSide','distributionSide','supportScore','againstScore','score','weight','points','strengthLevel'].forEach((key) => {
        assert(!keys.has(key), `Synthesis contract 不应出现阵营/计分字段：${key}`);
    });
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

    const copied = interpretation.buildBaziContextText(result, output);
    ['strengthSynthesis','SD-SEASONAL-HIERARCHY','actorOverlaps','blockingDependencyIds','synthesisSufficiencyStatus'].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏 Synthesis 内部字段：${term}`);
    });
});

console.log(`\nBaZi strength synthesis: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
