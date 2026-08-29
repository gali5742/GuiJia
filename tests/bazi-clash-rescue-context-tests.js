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
    'js/bazi-clash-preconditions.js',
    'js/bazi-clash-seasonal-position.js',
    'js/bazi-clash-nonseasonal-force.js',
    'js/bazi-element-presence-scope.js',
    'js/bazi-clash-rescue-context.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const rescueApi = GuiJia.baziClashRescueContext;

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

function rescueDimension(record) {
    return (record?.comparisonDimensions || []).find((item) => item.key === 'support-restraint-rescue-context');
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

function findYinShenRecord(model) {
    return model.strengthSynthesis.clashPreconditionRecords.find((item) =>
        [item.rootSide.zhi, item.counterpartSide.zhi].sort().join('') === ['寅','申'].sort().join('')
    );
}

function findBranchStructureContext(model, relationCode, zhis) {
    const wanted = [...zhis].sort().join('');
    return (model.strengthEffects.branchStructureContexts || []).find((context) => {
        if (context.relationCode !== relationCode) return false;
        const actual = (context.participants || []).map((item) => item.zhi).sort().join('');
        return actual === wanted;
    });
}

test('生产加载路径包含 Clash Rescue Context 模块与 Guard 022', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');
    assert(source.includes('./js/bazi-clash-rescue-context.js'), '生产页面没有 clash rescue context 模块加载路径');
    assert(rescueApi?.installed === true, 'Clash Rescue Context 模块未安装');
    const guards = new Map(GuiJia.baziAssessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    assert(guards.has('BAZI-ASSESS-GUARD-022'), '缺少 Guard 022');
});

test('固定验证盘无 root clash 时 Rescue Context dependency 为 resolved/not-applicable，最终 Assessment 不启动', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert(deps['SD-CLASH-SUPPORT-RESTRAINT-RESCUE-CONTEXT']?.status === 'resolved', '无 root clash 时 rescue dependency 应 resolved');
    assert(model.strengthSynthesis.rescueContextContract?.genericMechanismsResolved === false, '不得伪装通用解救机制已解析');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得推进最终 Assessment');
});

test('任氏直证命例：壬申 辛亥 辛酉 庚寅中的“亥解申冲”只解析 rescue-context', () => {
    const model = outputFor(['壬','辛','辛','庚'], ['申','亥','酉','寅']).semanticModel;
    const record = findYinShenRecord(model);
    const rescue = rescueDimension(record);
    assert(record && rescue, '应生成寅申 root clash 与 rescue dimension');
    assert(record.rootSide.zhi === '申', `本例 root side 应为申：${record.rootSide.zhi}`);
    assert(record.counterpartSide.zhi === '寅', `本例 counterpart 应为寅：${record.counterpartSide.zhi}`);
    assert(rescue.status === 'resolved', `“亥解申冲”应使 rescue-context resolved：${rescue.status}`);
    assert(rescue.preference === 'counterpart-side', `本例 rescue 应支持寅方：${rescue.preference}`);
    const signal = rescue.observations.sourceSignal;
    assert(signal.reasonCode === 'source-example-hai-resolves-shen-clash', `reasonCode 异常：${signal.reasonCode}`);
    assert(signal.rescueZhi === '亥' && signal.targetZhi === '寅' && signal.clashZhi === '申', 'source pattern 三支身份异常');
    assert(signal.elementFlow.fromElement === '金' && signal.elementFlow.viaElement === '水' && signal.elementFlow.toElement === '木', '“泄金生木”元素流向记录异常');
    assert(signal.elementFlow.interpretation === 'source-example-only', '元素流向不得升级为通用规则');
    assert(record.comparison.status === 'insufficient', '只解 rescue-context 不应直接完成六冲整体 comparison');
});

test('“亥解申冲”claim 同时回指真实六冲 Structure 与寅亥六合 Structure', () => {
    const model = outputFor(['壬','辛','辛','庚'], ['申','亥','酉','寅']).semanticModel;
    const record = findYinShenRecord(model);
    const rescue = rescueDimension(record);
    const claim = model.strengthSynthesis.claims.find((item) => item.claimKey === `root.six-clash.${record.structureRef}.rescue-context`);
    const structureIds = new Set(model.structures.map((item) => item.id));
    assert(claim?.status === 'resolved', 'direct rescue pattern 应生成 resolved claim');
    assert(claim.sourceRefs.includes(record.structureRef), 'claim 未引用真实六冲 Structure');
    assert(claim.sourceRefs.includes(rescue.observations.sourceSignal.harmonyStructureRef), 'claim 未引用真实寅亥六合 Structure');
    assert(claim.sourceRefs.every((id) => structureIds.has(id)), 'claim sourceRefs 必须全部是真实 Structure');
    const harmony = model.structures.find((item) => item.id === rescue.observations.sourceSignal.harmonyStructureRef);
    assert(harmony?.code === 'BRANCH_SIX_HARMONY', `rescue 关系必须是六合 Structure：${harmony?.code}`);
});

test('原典命例同时存在申亥六害时，仍按直接“亥解申冲”直证处理，不用关系数量投票', () => {
    const model = outputFor(['壬','辛','辛','庚'], ['申','亥','酉','寅']).semanticModel;
    const record = findYinShenRecord(model);
    const rescue = rescueDimension(record);
    const harm = findBranchStructureContext(model, 'BRANCH_SIX_HARM', ['申','亥']);
    assert(harm, '原典同一命例应同时存在申亥六害 Structure provenance');
    assert(rescue.status === 'resolved', '申亥六害存在不得覆盖原典明确“亥解申冲”的直证');
    const serialized = JSON.stringify(rescue);
    ['score','weight','points','majority'].forEach((term) => assert(!serialized.includes(term), `rescue dimension 不应使用数值/多数仲裁字段：${term}`));
});

test('寅申冲不见亥时，未命中 source pattern 只能保持 unresolved，不能判“无救”或申方占优', () => {
    const model = outputFor(['壬','辛','辛','庚'], ['申','子','酉','寅']).semanticModel;
    const record = findYinShenRecord(model);
    const rescue = rescueDimension(record);
    const signal = rescue?.observations?.sourceSignal;
    assert(record && rescue && signal, '应保留 rescue-context dimension 与 source signal');
    assert(rescue.status === 'unresolved', `不见亥时应 unresolved：${rescue.status}`);
    assert(rescue.preference === null, '未命中不得反推申方 preference');
    assert(signal.status === 'not-matched', `source pattern 应 not-matched：${signal.status}`);
    assert(signal.reasonCode === 'source-rescue-branch-or-harmony-missing', `reasonCode 异常：${signal.reasonCode}`);
    assert(!JSON.stringify(rescue).includes('no-rescue'), '未命中不得写成 no-rescue 结论');
});

test('普通六合不得自动解释为解冲：寅申冲另见巳申六合仍保持 rescue-context unresolved', () => {
    const model = outputFor(['壬','辛','辛','庚'], ['申','巳','酉','寅']).semanticModel;
    const record = findYinShenRecord(model);
    const rescue = rescueDimension(record);
    const harmony = findBranchStructureContext(model, 'BRANCH_SIX_HARMONY', ['申','巳']);
    assert(harmony, '测试盘应存在巳申六合 Structure provenance');
    assert(rescue?.status === 'unresolved', '普通六合不得自动生成 rescue');
    assert(rescue?.preference === null, '普通六合不得自动给任一方 preference');
    assert(rescue?.observations?.genericHarmonyRescue === false, '合同应明确 generic harmony rescue=false');
});

test('“抑冲”“助泄”只保留为原典机制词汇，当前没有通用 resolver', () => {
    const model = outputFor(['壬','辛','辛','庚'], ['申','子','酉','寅']).semanticModel;
    const contract = model.strengthSynthesis.rescueContextContract;
    const rescue = rescueDimension(findYinShenRecord(model));
    assert(contract?.genericMechanismsResolved === false, '通用机制不得标记为 resolved');
    assert(rescue.observations.genericMechanisms.suppressClash === 'unresolved', '抑冲 generic resolver 应 unresolved');
    assert(rescue.observations.genericMechanisms.assistDrain === 'unresolved', '助泄 generic resolver 应 unresolved');
    assert(rescue.observations.genericCombinationRescue === false, '三合三会等组合不得自动救冲');
});

test('Rescue dependency 可由直接命例模式解析，但 Relative State 仍服从全部必要维度', () => {
    const model = outputFor(['壬','辛','辛','庚'], ['申','亥','酉','寅']).semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    const rescue = deps['SD-CLASH-SUPPORT-RESTRAINT-RESCUE-CONTEXT'];
    const relative = deps['SD-CLASH-RELATIVE-STATE-COMPARISON'];
    assert(rescue?.status === 'resolved', '单一 root clash 的 rescue 直证应解析 dependency');
    assert(relative?.dependsOnDependencyIds?.includes('SD-CLASH-SUPPORT-RESTRAINT-RESCUE-CONTEXT'), 'Relative State 未显式依赖 rescue context');
    assert(relative?.status === 'unresolved', '其他必要维度未解时 Relative State 应继续 unresolved');
    assert(model.strengthSynthesis.sufficiency.status === 'insufficient', '最终 Synthesis 仍应 insufficient');
});

test('Rescue Context 不生成根保留/根拔/最终身强弱结论', () => {
    const model = outputFor(['壬','辛','辛','庚'], ['申','亥','酉','寅']).semanticModel;
    const text = JSON.stringify({
        contract:model.strengthSynthesis.rescueContextContract,
        dimension:rescueDimension(findYinShenRecord(model)),
        claims:model.strengthSynthesis.claims.filter((item) => item.ruleId === rescueApi.CLASH_RESCUE_CONTEXT_RULE_ID)
    });
    ['root-preserved','root-weakened','root-ineffective','strong','weak','balanced'].forEach((term) => {
        assert(!text.includes(`\"${term}\"`), `Rescue Context 不得直接输出 ${term}`);
    });
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '最终 Assessment 必须保持 not-evaluated');
});

test('复制分析上下文不泄漏 Rescue Context 内部字段', () => {
    const result = makeResult(['壬','辛','辛','庚'], ['申','亥','酉','寅']);
    const output = interpretation.buildBaziInterpretation(result);
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'SD-CLASH-SUPPORT-RESTRAINT-RESCUE-CONTEXT',
        'SC-CLASH-RESCUE-CONTEXT-CONTRACT',
        'source-example-hai-resolves-shen-clash',
        'rescueContextRuleIds',
        'rescueContextContract',
        'support-restraint-rescue-context'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Rescue Context 内部字段：${term}`));
});

console.log(`\nBaZi clash rescue context: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
