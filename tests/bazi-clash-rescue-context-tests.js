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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const rescueApi = GuiJia.baziClashRescueContext;
const outcomeApi = GuiJia.baziRootClashSourceOutcome;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉'], solarStr = '') {
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
        solarStr,
        ruleSummary:'测试口径'
    };
}

function outputFor(gans, zhis, solarStr = '') {
    return interpretation.buildBaziInterpretation(makeResult(gans, zhis, solarStr));
}

function rescueDimension(record) {
    return (record?.comparisonDimensions || []).find((item) => item.key === 'support-restraint-rescue-context');
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

function findClashRecord(model, a, b) {
    const wanted = [a,b].sort().join('');
    return model.strengthSynthesis.clashPreconditionRecords.find((item) =>
        [item.rootSide.zhi, item.counterpartSide.zhi].sort().join('') === wanted
    );
}

function findSourceOutcome(model, a, b) {
    const wanted = [a,b].sort().join('');
    return (model.strengthSynthesis.rootClashSourceOutcomeRecords || []).find((item) =>
        [item.rootZhi, item.counterpartZhi].sort().join('') === wanted
    );
}

function findYinShenRecord(model) {
    return findClashRecord(model, '寅', '申');
}

function findSiHaiRecord(model) {
    return findClashRecord(model, '巳', '亥');
}

function findBranchStructureContext(model, relationCode, zhis) {
    const wanted = [...zhis].sort().join('');
    return (model.strengthEffects.branchStructureContexts || []).find((context) => {
        if (context.relationCode !== relationCode) return false;
        const actual = (context.participants || []).map((item) => item.zhi).sort().join('');
        return actual === wanted;
    });
}

test('生产加载路径包含 Clash Rescue Context 与 Root Clash Source Outcome 模块', () => {
    const assessmentSource = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');
    const rescueSource = fs.readFileSync(path.join(ROOT, 'js/bazi-clash-rescue-context.js'), 'utf8');
    assert(assessmentSource.includes('./js/bazi-clash-rescue-context.js'), '生产页面没有 clash rescue context 模块加载路径');
    assert(rescueSource.includes('./js/bazi-root-clash-source-outcome.js?v=13.44.0'), 'Rescue Context 未接入 Root Clash Source Outcome 浏览器加载链');
    assert(rescueApi?.installed === true, 'Clash Rescue Context 模块未安装');
    assert(rescueApi.CLASH_RESCUE_CONTEXT_VERSION === '0.2', `Rescue Context 版本异常：${rescueApi.CLASH_RESCUE_CONTEXT_VERSION}`);
    assert(outcomeApi?.installed === true, 'Root Clash Source Outcome 模块未安装');
    assert(outcomeApi.ROOT_CLASH_SOURCE_OUTCOME_VERSION === '0.1', `Source Outcome 版本异常：${outcomeApi.ROOT_CLASH_SOURCE_OUTCOME_VERSION}`);
    const guards = new Map(GuiJia.baziAssessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    assert(guards.has('BAZI-ASSESS-GUARD-015') && guards.has('BAZI-ASSESS-GUARD-016'), '既有根交互／六冲 Guard 不完整');
});

test('固定验证盘无 root clash 时 Rescue Context 与 Source Outcome 均为 not-applicable，最终 Assessment 不启动', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert(deps['SD-CLASH-SUPPORT-RESTRAINT-RESCUE-CONTEXT']?.status === 'resolved', '无 root clash 时 rescue dependency 应 resolved');
    assert(deps['SD-ROOT-SIX-CLASH-SOURCE-OUTCOME']?.status === 'resolved', '无 root clash 时 source outcome dependency 应 resolved/not-applicable');
    assert(deps['SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING']?.status === 'resolved', '无已解析 source outcome 时 mapping dependency 应 not-applicable/resolved');
    assert((model.strengthSynthesis.rootClashSourceOutcomeRecords || []).length === 0, '无 root clash 不得制造 source outcome record');
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

test('SP-05 exact case：第10日戊土司令解析三项必要维度后，Source Outcome 只记录“发／无伤”', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const record = findSiHaiRecord(model);
    const rescue = rescueDimension(record);
    const outcome = findSourceOutcome(model, '巳', '亥');
    assert(record && rescue && outcome, 'SP-05 应生成巳亥 root clash、rescue dimension 与 source outcome');
    assert(record.rootSide.zhi === '巳' && record.counterpartSide.zhi === '亥', `SP-05 root/counterpart 异常：${record.rootSide.zhi}/${record.counterpartSide.zhi}`);
    assert(rescue.status === 'resolved', `SP-05 exact case rescue 应 resolved：${rescue.status}`);
    assert(rescue.preference === 'root-side', `SP-05 应只在 rescue 维支持巳方：${rescue.preference}`);
    const signal = rescue.observations.sourceSignal;
    assert(signal.pattern.id === 'DTS-SI-HAI-WU-COMMAND-SUPPRESS-001', `SP-05 pattern 异常：${signal.pattern.id}`);
    assert(signal.reasonCode === 'sp05-wu-command-suppresses-hai-protects-si', `SP-05 reasonCode 异常：${signal.reasonCode}`);
    assert(signal.monthCommandSourceObservation?.resolutionStatus === 'case-assertion-observed', 'SP-05 必须依赖 exact Month Command source assertion');
    assert(signal.monthCommandSourceObservation?.offsetMatches === true, 'SP-05 必须命中第10日 offset');
    assert(signal.sourceRefs.includes('D08'), 'SP-05 rescue signal 应引用 calendar-position Derived Fact D08');
    assert(record.comparison.status === 'resolved', `SP-05 完整必要维度应形成 resolved comparison：${record.comparison.status}`);
    assert(record.comparison.outcome === 'root-side-dominant', `SP-05 应形成 root-side-dominant：${record.comparison.outcome}`);
    assert(outcome.resolutionStatus === 'resolved-source-outcome', `SP-05 source outcome 应 resolved：${outcome.resolutionStatus}`);
    assert(outcome.sourceOutcomeTerm === '发' && outcome.sourceDamageTerm === '无伤', `SP-05 只应记录“发／无伤”：${outcome.sourceOutcomeTerm}/${outcome.sourceDamageTerm}`);
    assert(outcome.genericEffectiveState === null && outcome.sourceOutcomeToEffectiveState === 'unresolved', '“发／无伤”不得直接映射 generic effectiveState');
    const deps = dependencyMap(model.strengthSynthesis);
    assert(deps['SD-ROOT-SIX-CLASH-SOURCE-OUTCOME']?.status === 'resolved', 'SP-05 source outcome dependency 应 resolved');
    assert(deps['SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING']?.status === 'unresolved', 'source outcome → effectiveState mapping 必须继续 unresolved');
    assert(deps['SD-ROOT-SIX-CLASH-EFFECTIVENESS']?.status === 'unresolved', '即使 source outcome resolved，六冲根实际效力仍不得直接 resolved');
    assert(model.strengthSynthesis.rootActorStates.every((item) => item.effectiveState === null), 'Source Outcome 不得回写 rootActorStates.effectiveState');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'SP-05 不得直接启动最终 Assessment');
});

test('SP-05 同四柱但错一天：Relative State 未完成时不得提前生成“发／无伤”', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-15 12:00:00').semanticModel;
    const record = findSiHaiRecord(model);
    const rescue = rescueDimension(record);
    const signal = rescue?.observations?.sourceSignal;
    const outcome = findSourceOutcome(model, '巳', '亥');
    assert(record && rescue && signal && outcome, '错日仍应保留巳亥 rescue-context 与 source outcome 观察');
    assert(rescue.status === 'unresolved', `错日不得解析 SP-05 抑冲：${rescue.status}`);
    assert(rescue.preference === null, '错日不得给巳方 preference');
    assert(signal.reasonCode === 'sp05-month-command-source-case-not-exactly-matched', `错日 reasonCode 异常：${signal.reasonCode}`);
    assert(signal.monthCommandSourceObservation?.resolutionStatus === 'case-offset-not-matched', 'Month Command 应明确标记 offset 不匹配');
    assert(record.comparison.status === 'insufficient', '必要维度缺失时 Relative State 必须 insufficient');
    assert(outcome.resolutionStatus === 'unresolved-relative-state', `错日 source outcome 必须 unresolved：${outcome.resolutionStatus}`);
    assert(outcome.sourceOutcomeTerm === null && outcome.sourceDamageTerm === null, 'Relative State 未解不得提前生成发／无伤');
});

test('一般“戊土司令”信息不能替代 SP-05 exact source-case 条件', () => {
    const record = Object.freeze({
        id:'TEST-SI-HAI',
        rootSide:Object.freeze({ zhi:'巳', pillarIndex:1 }),
        counterpartSide:Object.freeze({ zhi:'亥', pillarIndex:0 })
    });
    const semanticModel = {
        derivedFacts:[{id:'D08'}],
        monthCommand:{
            sourceProfiles:[{
                sourceId:'DTS-CW-WAR-CASE-001',
                resolutionStatus:'case-offset-not-matched',
                chartMatches:true,
                anchorMatches:true,
                offsetMatches:false,
                assertedCommandGan:'戊'
            }]
        }
    };
    const signal = rescueApi.buildSiHaiWuCommandSuppressSignal(record, semanticModel);
    assert(signal.status === 'not-matched', '只见戊土司令标签但非 exact case 不得 resolved');
    assert(signal.preference === null, '不得由戊土司令一般化出巳方 preference');
});

test('寅月 + 申根 + 亥解申冲 + 表层火：三项维度同向时只记录根方“拔／去”source outcome', () => {
    const model = outputFor(['甲','丙','庚','丁'], ['亥','寅','申','午']).semanticModel;
    const record = findYinShenRecord(model);
    const outcome = findSourceOutcome(model, '寅', '申');
    assert(record && outcome, '应生成寅申 root clash 与 source outcome');
    assert(record.rootSide.zhi === '申' && record.counterpartSide.zhi === '寅', `测试盘 root/counterpart 异常：${record.rootSide.zhi}/${record.counterpartSide.zhi}`);
    assert(record.comparison.status === 'resolved', `三项必要维度同向时 comparison 应 resolved：${record.comparison.status}`);
    assert(record.comparison.outcome === 'counterpart-side-dominant', `应由寅方形成 counterpart-side-dominant：${record.comparison.outcome}`);
    assert(outcome.resolutionStatus === 'resolved-source-outcome', 'counterpart dominance 应解析 source outcome');
    assert(outcome.sourceOutcomeKind === 'source-uprooted-removed', `source outcome kind 异常：${outcome.sourceOutcomeKind}`);
    assert(outcome.sourceOutcomeTerm === '拔', `根方衰时应记录原典“拔”：${outcome.sourceOutcomeTerm}`);
    assert(outcome.corroboratingTerms.includes('冲之者有力，则能去之'), '应保留“能去之”作为同段佐证术语');
    assert(outcome.genericEffectiveState === null, '“拔／去”不得直接映射 ineffective');
    assert(model.strengthSynthesis.rootActorStates.every((item) => item.effectiveState === null), '“拔”不得回写 root actor effectiveState');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '“拔”不得越级生成最终身强弱');
});

test('Relative State incomparable 时没有“拔／发”兜底，不做多数或偏好强判', () => {
    const record = outcomeApi.buildSourceOutcomeRecord({
        id:'CP-INCOMPARABLE',
        rootStateId:'RS-TEST',
        actorKey:'branch:2:hidden:庚',
        structureRef:'S-TEST',
        rootSide:{ zhi:'申' },
        counterpartSide:{ zhi:'寅' },
        sourceEffectIds:['FX-TEST'],
        comparison:{
            status:'resolved',
            outcome:'incomparable',
            consideredDimensionIds:['CD-A','CD-B']
        }
    });
    assert(record.resolutionStatus === 'unresolved-incomparable-relative-state', `incomparable 不得解析 source outcome：${record.resolutionStatus}`);
    assert(record.sourceOutcomeTerm === null && record.sourceDamageTerm === null, 'incomparable 不得兜底成拔／发');
    assert(record.genericEffectiveState === null, 'incomparable 不得产生 generic effectiveState');
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
    assert(claim.sourceRefs.every((id) => structureIds.has(id)), '寅申命例 claim sourceRefs 必须全部是真实 Structure');
    const harmony = model.structures.find((item) => item.id === rescue.observations.sourceSignal.harmonyStructureRef);
    assert(harmony?.code === 'BRANCH_SIX_HARMONY', `rescue 关系必须是六合 Structure：${harmony?.code}`);
});

test('SP-05 claim 回指真实巳亥冲 Structure 与 D08，不把 source profile 伪装成 F/D/S', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const record = findSiHaiRecord(model);
    const claim = model.strengthSynthesis.claims.find((item) => item.claimKey === `root.six-clash.${record.structureRef}.rescue-context`);
    const semanticIds = new Set([
        ...model.facts.map((item) => item.id),
        ...model.derivedFacts.map((item) => item.id),
        ...model.structures.map((item) => item.id)
    ]);
    assert(claim?.status === 'resolved', 'SP-05 exact pattern 应生成 resolved claim');
    assert(claim.sourceRefs.includes(record.structureRef), 'SP-05 claim 未引用巳亥冲 Structure');
    assert(claim.sourceRefs.includes('D08'), 'SP-05 claim 未引用 calendar position D08');
    assert(claim.sourceRefs.every((id) => semanticIds.has(id)), 'SP-05 claim sourceRefs 必须只引用真实 F/D/S');
    assert(!claim.sourceRefs.includes('DTS-CW-WAR-CASE-001'), 'source profile id 不得伪装成 semantic ref');
});

test('Source Outcome claim 只引用真实六冲 Structure，且声明依赖 Relative State', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const outcome = findSourceOutcome(model, '巳', '亥');
    const claim = model.strengthSynthesis.claims.find((item) => item.ruleId === outcomeApi.ROOT_CLASH_SOURCE_OUTCOME_RULE_ID && item.value?.sourceOutcomeTerm === '发');
    const semanticIds = new Set([
        ...model.facts.map((item) => item.id),
        ...model.derivedFacts.map((item) => item.id),
        ...model.structures.map((item) => item.id)
    ]);
    assert(outcome && claim, '应生成已解析的 Source Outcome claim');
    assert(claim.sourceRefs.length === 1 && claim.sourceRefs[0] === outcome.structureRef, 'Source Outcome claim 只应直接回指该六冲 Structure');
    assert(claim.sourceRefs.every((id) => semanticIds.has(id)), 'Source Outcome claim sourceRefs 必须是真实 F/D/S');
    assert(claim.dependencyIds.includes('SD-CLASH-RELATIVE-STATE-COMPARISON'), 'Source Outcome claim 必须显式依赖 Relative State comparison');
    assert(claim.value.genericEffectiveState === null, 'claim 不得偷偷附 generic effectiveState');
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

test('“抑冲”“助泄”仍没有通用 resolver；新增的只是 exact source pattern', () => {
    const model = outputFor(['壬','辛','辛','庚'], ['申','子','酉','寅']).semanticModel;
    const contract = model.strengthSynthesis.rescueContextContract;
    const rescue = rescueDimension(findYinShenRecord(model));
    assert(contract?.genericMechanismsResolved === false, '通用机制不得标记为 resolved');
    assert(rescue.observations.genericMechanisms.suppressClash === 'unresolved', '抑冲 generic resolver 应 unresolved');
    assert(rescue.observations.genericMechanisms.assistDrain === 'unresolved', '助泄 generic resolver 应 unresolved');
    assert(rescue.observations.genericCombinationRescue === false, '三合三会等组合不得自动救冲');
    assert(contract.directSourcePatterns.includes('DTS-SI-HAI-WU-COMMAND-SUPPRESS-001'), '合同未登记 SP-05 direct pattern');
    assert(contract.exactSuppressClashPatternIds.includes('DTS-SI-HAI-WU-COMMAND-SUPPRESS-001'), 'SP-05 应只登记为 exact suppress pattern');
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

test('Rescue Context 与 Source Outcome 都不生成 generic 根状态或最终身强弱结论', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const text = JSON.stringify({
        contract:model.strengthSynthesis.rescueContextContract,
        sourceOutcomeContract:model.strengthSynthesis.rootClashSourceOutcomeContract,
        dimensions:model.strengthSynthesis.clashPreconditionRecords.map(rescueDimension),
        sourceOutcomes:model.strengthSynthesis.rootClashSourceOutcomeRecords,
        claims:model.strengthSynthesis.claims.filter((item) => [rescueApi.CLASH_RESCUE_CONTEXT_RULE_ID, outcomeApi.ROOT_CLASH_SOURCE_OUTCOME_RULE_ID].includes(item.ruleId))
    });
    ['root-preserved','root-weakened','root-ineffective','strong','weak','balanced'].forEach((term) => {
        assert(!text.includes(`\"${term}\"`), `Rescue/Source Outcome 不得直接输出 ${term}`);
    });
    ['score','weight','points'].forEach((term) => assert(!text.includes(`\"${term}\"`), `Source Outcome 不得引入 ${term}`));
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '最终 Assessment 必须保持 not-evaluated');
});

test('复制分析上下文不泄漏 Rescue Context / Source Outcome 内部字段', () => {
    const result = makeResult(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00');
    const output = interpretation.buildBaziInterpretation(result);
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'SD-CLASH-SUPPORT-RESTRAINT-RESCUE-CONTEXT',
        'SC-CLASH-RESCUE-CONTEXT-CONTRACT',
        'source-example-hai-resolves-shen-clash',
        'sp05-wu-command-suppresses-hai-protects-si',
        'DTS-SI-HAI-WU-COMMAND-SUPPRESS-001',
        'rescueContextRuleIds',
        'rescueContextContract',
        'support-restraint-rescue-context',
        'rootClashSourceOutcomeRecords',
        'rootClashSourceOutcomeContract',
        'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME',
        'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING',
        'resolved-source-outcome',
        'source-unharmed-stimulated',
        'source-uprooted-removed'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Rescue/Source Outcome 内部字段：${term}`));
});

console.log(`\nBaZi clash rescue/source outcome: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);