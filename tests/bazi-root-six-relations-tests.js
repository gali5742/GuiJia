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
    'js/bazi-root-six-relations.js',
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

test('Research bootstrap 显式声明六冲／六合根条件模块，Guard 016-017 保持', () => {
    const bootstrapSource = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    assert(bootstrapSource.includes('./js/bazi-root-six-relations.js'), 'Research bootstrap 未声明 Root Six Relations 模块');
    const guards = new Map(GuiJia.baziAssessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    assert(guards.has('BAZI-ASSESS-GUARD-016'), '缺少 Guard 016');
    assert(guards.has('BAZI-ASSESS-GUARD-017'), '缺少 Guard 017');
});

test('固定验证盘无 root actor 时六冲／六合根效力均为 not-applicable', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(synthesis.rootActorStates.length === 0, '固定盘不应生成 root actor');
    assert(synthesis.rootSixRelationRecords.length === 0, '无 root actor 不应生成六关系记录');
    assert(deps['SD-ROOT-SIX-CLASH-EFFECTIVENESS']?.status === 'resolved', '无六冲 root actor 时应 not-applicable/resolved');
    assert(deps['SD-ROOT-SIX-HARMONY-EFFECTIVENESS']?.status === 'resolved', '无六合 root actor 时应 not-applicable/resolved');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得推进最终 Assessment');
});

test('六冲命中 root actor 后只建立条件记录，不直接输出根拔或 effectiveState', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const clash = model.structures.find((item) => item.code === 'BRANCH_SIX_CLASH');
    assert(clash, '测试盘缺六冲 Structure');
    const rootState = model.strengthSynthesis.rootActorStates.find((item) => item.zhi === '午' && item.gan === '丁');
    const record = model.strengthSynthesis.rootSixRelationRecords.find((item) => item.relationKind === 'six-clash' && item.zhi === '午');
    assert(rootState, '午中丁 root actor state 缺失');
    assert(record, '午中丁 root actor 应生成 six-clash 条件记录');
    assert(record.structureRef === clash.id, '六冲条件记录未引用真实 Structure ID');
    assert(record.sourceEffectIds.join(',') === rootState.sourceEffectIds.join(','), '六冲条件记录未保留 Root Effect provenance');
    assert(record.resolutionStatus === 'unresolved', '六冲前提未解析时必须 unresolved');
    assert(record.effectiveState === null, '六冲关系不得直接输出 effectiveState');
    assert(record.prerequisiteKeys.includes('root-branch-relative-strength'), '缺 root branch 相对旺衰前提');
    assert(record.prerequisiteKeys.includes('counterpart-branch-relative-strength'), '缺冲方相对旺衰前提');
    assert(record.prerequisiteKeys.includes('support-restraint-rescue-context'), '缺扶助／制化／解救前提');
    const dep = dependencyMap(model.strengthSynthesis)['SD-ROOT-SIX-CLASH-EFFECTIVENESS'];
    assert(dep.status === 'unresolved', '六冲 root effect dependency 不应提前 resolved');
    assert(dep.sourceEffectIds.join(',') === rootState.sourceEffectIds.join(','), '六冲 dependency 未保留 Root Effect provenance');
});

test('六冲原典术语保留为 source outcome terms，但不映射为内部有效状态词汇', () => {
    const contract = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel.strengthSynthesis.claims
        .find((item) => item.claimKey === 'root.six-relations.effectiveness-contract');
    assert(contract?.status === 'resolved', '缺六关系条件合同 Claim');
    assert(contract.value.sixClash.sourceOutcomeTerms.includes('拔'), '合同应保留“拔”术语');
    assert(contract.value.sixClash.sourceOutcomeTerms.includes('发'), '合同应保留“发”术语');
    assert(contract.value.sixClash.fixedEffectiveState === false, '原典术语不得被固定映射成 effectiveState');
    const stateTerms = new Set(Object.values(GuiJia.baziRootEffectState.rootEffectiveStates));
    contract.value.sixClash.sourceOutcomeTerms.forEach((term) => assert(!stateTerms.has(term), `原典术语与内部状态词汇混层：${term}`));
});

test('六合命中 root actor 后只确认相合关系，保持实际效力 unresolved', () => {
    const model = outputFor(['甲','庚','乙','己'], ['卯','戌','申','子']).semanticModel;
    const harmony = model.structures.find((item) => item.code === 'BRANCH_SIX_HARMONY');
    assert(harmony, '测试盘缺六合 Structure');
    const record = model.strengthSynthesis.rootSixRelationRecords.find((item) => item.relationKind === 'six-harmony' && item.zhi === '卯');
    assert(record, '卯中乙 root actor 应生成 six-harmony 条件记录');
    assert(record.structureRef === harmony.id, '六合条件记录未引用真实 Structure ID');
    assert(record.resolutionStatus === 'unresolved', '六合实际效力应 unresolved');
    assert(record.effectiveState === null, '六合不得直接输出根状态');
    assert(record.prerequisiteKeys.join(',') === 'six-harmony-effectiveness-rule', '六合应明确等待独立 effectiveness rule');
    const dep = dependencyMap(model.strengthSynthesis)['SD-ROOT-SIX-HARMONY-EFFECTIVENESS'];
    assert(dep.status === 'unresolved', '六合 root effect dependency 不应提前 resolved');
});

test('六冲与六合条件记录不是 Conflict，也不参与分数／权重聚合', () => {
    const clashModel = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const harmonyModel = outputFor(['甲','庚','乙','己'], ['卯','戌','申','子']).semanticModel;
    [clashModel, harmonyModel].forEach((model) => {
        assert(model.strengthSynthesis.conflicts.length === 0, '关系条件存在不应制造 Conflict');
        const serialized = JSON.stringify(model.strengthSynthesis.rootSixRelationRecords);
        ['score','weight','points','strengthLevel'].forEach((term) => assert(!serialized.includes(term), `六关系层泄漏数值聚合字段：${term}`));
    });
});

test('六关系依赖只引用当前真实 Structure ID', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const structureIds = new Set(model.structures.map((item) => item.id));
    const deps = dependencyMap(model.strengthSynthesis);
    ['SD-ROOT-SIX-CLASH-EFFECTIVENESS','SD-ROOT-SIX-HARMONY-EFFECTIVENESS'].forEach((id) => {
        (deps[id]?.sourceRefs || []).forEach((ref) => assert(structureIds.has(ref), `${id} 引用了不存在的 Structure：${ref}`));
    });
});

test('复制分析上下文不泄漏六冲／六合根条件内部字段', () => {
    const result = makeResult(['甲','壬','丁','己'], ['午','子','亥','酉']);
    const output = interpretation.buildBaziInterpretation(result);
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'rootSixRelationRecords',
        'SD-ROOT-SIX-CLASH-EFFECTIVENESS',
        'SD-ROOT-SIX-HARMONY-EFFECTIVENESS',
        'root-branch-relative-strength',
        'six-harmony-effectiveness-rule',
        'BAZI-STRENGTH-ROOT-SIX-CLASH-001'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Root Six Relations 内部字段：${term}`));
});

console.log(`\nBaZi root six relations: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
