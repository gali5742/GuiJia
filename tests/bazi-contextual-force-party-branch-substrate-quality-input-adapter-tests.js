#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const { Solar } = require(path.join(ROOT, 'vendor', 'lunar.js'));
let passed = 0;
let failed = 0;

function assert(condition, message) { if (!condition) throw new Error(message); }
function test(name, fn) {
    try { fn(); passed += 1; console.log(`✓ ${name}`); }
    catch (error) { failed += 1; console.error(`✗ ${name}`); console.error(`  ${error.message}`); }
}
function loadScripts(files) {
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    files.forEach((file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file }));
    return context.GuiJia;
}

const GuiJia = loadScripts([
    'js/common.js','js/bazi-core.js','js/bazi-strength-evidence.js','js/bazi-month-command.js','js/bazi-strength-effects.js','js/bazi-strength-synthesis.js',
    'js/bazi-root-effect-state.js','js/bazi-root-six-relations.js','js/bazi-clash-preconditions.js','js/bazi-clash-seasonal-position.js','js/bazi-clash-nonseasonal-force.js',
    'js/bazi-element-presence-scope.js','js/bazi-clash-rescue-context.js','js/bazi-root-clash-source-outcome.js','js/bazi-root-clash-interaction-effect.js',
    'js/bazi-root-actor-interaction-aggregation.js','js/bazi-root-baseline-effectiveness.js','js/bazi-stem-bearing-effect.js','js/bazi-visible-stem-functional-availability.js',
    'js/bazi-visible-stem-function-reachability.js','js/bazi-visible-stem-directed-function.js','js/bazi-visible-stem-function-coverage.js','js/bazi-visible-stem-function-realization.js',
    'js/bazi-visible-stem-function-realization-source.js','js/bazi-visible-stem-actor-interaction-aggregation.js','js/bazi-visible-stem-actor-function-composition.js',
    'js/bazi-visible-stem-actor-profile-interpretation.js','js/bazi-visible-stem-daymaster-contribution.js','js/bazi-qianli-strength-composition-source.js','js/bazi-qianli-strength-composition.js',
    'js/bazi-qianli-quantity-classification-source.js','js/bazi-qianli-quantity-classification-audit.js','js/bazi-qianli-quantity-semantic-bridge-source.js','js/bazi-qianli-quantity-semantic-bridge.js',
    'js/bazi-qianli-quantity-case-calibration-source.js','js/bazi-qianli-quantity-case-calibration.js','js/bazi-qianli-quantity-cross-literature-source.js','js/bazi-qianli-quantity-cross-literature-research.js',
    'js/bazi-contextual-force-evidence-source.js','js/bazi-contextual-force-evidence-profile.js','js/bazi-contextual-force-evidence.js','js/bazi-contextual-force-interaction-adapter-contract.js',
    'js/bazi-contextual-force-interaction-adapter-profile.js','js/bazi-contextual-force-interaction-adapter.js','js/bazi-contextual-force-party-source.js','js/bazi-contextual-force-party-audit.js',
    'js/bazi-contextual-force-party-membership-contract.js','js/bazi-contextual-force-party-membership-profile.js','js/bazi-contextual-force-party-membership.js',
    'js/bazi-contextual-force-party-affiliation-contract.js','js/bazi-contextual-force-party-affiliation-profile.js','js/bazi-contextual-force-party-affiliation.js',
    'js/bazi-contextual-force-party-affiliation-expansion-source.js','js/bazi-contextual-force-party-affiliation-expansion-audit.js',
    'js/bazi-contextual-force-party-relation-effect-contract.js','js/bazi-contextual-force-party-relation-effect-profile.js','js/bazi-contextual-force-party-relation-effect.js',
    'js/bazi-contextual-force-party-relative-dominance-source.js','js/bazi-contextual-force-party-relative-dominance-audit.js',
    'js/bazi-contextual-force-party-side-force-profile-contract.js','js/bazi-contextual-force-party-side-force-profile-profile.js','js/bazi-contextual-force-party-side-force-profile.js',
    'js/bazi-contextual-force-party-counter-context-contract.js','js/bazi-contextual-force-party-counter-context-profile.js','js/bazi-contextual-force-party-counter-context.js',
    'js/bazi-contextual-force-party-nonstem-foundation-source.js','js/bazi-contextual-force-party-nonstem-foundation-audit.js',
    'js/bazi-contextual-force-party-branch-substrate-quality-source.js','js/bazi-contextual-force-party-branch-substrate-quality-audit.js',
    'js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-contract.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-profile.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js',
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const contractApi = GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapterContract;
const profileApi = GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapterProfile;
const adapterApi = GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapter;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉']) {
    const dayGan = gans[2];
    const dayElement = bazi.getWuXing(dayGan);
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index], gan, zhi:zhis[index], ganZhi:gan + zhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({ gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan] }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason(zhis[1], dayElement);
    return { dayGan, dayGanWuXing:dayElement, pillars, internalRelations, monthSeason,
        dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, internalRelations, dayGan),
        matchedLiterature:[], lunarStr:'测试农历', solarStr:'测试时间', ruleSummary:'测试口径' };
}
function outputFor(gans, zhis) { return interpretation.buildBaziInterpretation(makeResult(gans, zhis)); }
function synthesisFor(gans, zhis) { return outputFor(gans, zhis).semanticModel.strengthSynthesis; }
function depMap(synthesis) { return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item])); }
function family(record, key) { return (record.familyRecords || []).find((item) => item.familyKey === key); }
function collectKeys(value, keys = new Set()) {
    if (!value || typeof value !== 'object') return keys;
    Object.keys(value).forEach((key) => { keys.add(key); collectKeys(value[key], keys); });
    return keys;
}

test('Input Adapter v0.1 独立拆分 contract、profile mapper 与 execution', () => {
    assert(contractApi?.installed && profileApi?.installed && adapterApi?.installed, '三层必须安装');
    assert(contractApi.VERSION === '0.1' && profileApi.VERSION === '0.1' && adapterApi.VERSION === '0.1', '版本异常');
    assert(contractApi.FAMILY_KEYS.length === 6, '必须固定六类 source-audited family');
});

test('合同严格区分 family inventory coverage 与 upstream semantic coverage', () => {
    const contract = contractApi.CONTRACT;
    assert(contract.structuralInventoryCoverageDistinctFromUpstreamSemanticCoverage === true, 'coverage 层必须分开');
    assert(contract.inputRecordPresenceIsSemanticResolution === false, 'record presence 不得等于 semantic resolution');
    assert(contract.sourceInputFamilyModelMayRemainResolvedWhileUpstreamCoverageIsPartial === true, 'source model 与 runtime coverage 必须可分离');
});

test('固定验证盘每个 surface-branch substrate candidate 都建立六类 family record', () => {
    const view = synthesisFor().contextualForcePartyBranchSubstrateQualityInputAdapterView;
    assert(view.candidateRecords.length > 0, '固定盘必须存在 branch substrate candidates');
    view.candidateRecords.forEach((record) => {
        assert(record.familyRecords.length === 6, `${record.actorKey} family 数量异常`);
        assert(record.familyInventoryComplete === true, `${record.actorKey} family inventory 应完整`);
        assert(contractApi.FAMILY_KEYS.every((key) => record.mappedFamilyKeys.includes(key)), `${record.actorKey} 缺 family key`);
    });
});

test('固定验证盘 structural inventory coverage resolved，但 upstream semantic coverage 保持 unresolved', () => {
    const synthesis = synthesisFor();
    const view = synthesis.contextualForcePartyBranchSubstrateQualityInputAdapterView;
    const deps = depMap(synthesis);
    assert(view.structuralInventoryCoverageComplete === true, '六类 family record 应结构完整');
    assert(view.upstreamSemanticCoverageComplete === false, '上游语义不得伪装完整');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-INVENTORY-COVERAGE']?.status === 'resolved', 'inventory coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-UPSTREAM-SEMANTIC-COVERAGE']?.status === 'unresolved', 'upstream semantic coverage 应 unresolved');
});

test('固定盘月支子 substrate 的覆干 identity 精确落到月干壬', () => {
    const record = synthesisFor().contextualForcePartyBranchSubstrateQualityInputAdapterView.candidateRecords.find((item) => item.zhi === '子');
    assert(record, '缺子支 candidate');
    const cover = family(record, 'covering-stem-context');
    assert(cover?.coveringStem?.kind === 'surface-covering-stem', '子支应由普通表层天干覆盖');
    assert(cover.coveringStem.position === 'month' && cover.coveringStem.gan === '壬', '子支覆干应为月干壬');
});

test('固定盘日支亥 substrate 的覆干 identity 精确落到日主丁', () => {
    const record = synthesisFor().contextualForcePartyBranchSubstrateQualityInputAdapterView.candidateRecords.find((item) => item.zhi === '亥');
    assert(record, '缺亥支 candidate');
    const cover = family(record, 'covering-stem-context');
    assert(cover?.coveringStem?.kind === 'daymaster-covering-stem', '日支应重建 daymaster cover');
    assert(cover.coveringStem.position === 'day' && cover.coveringStem.gan === '丁', '亥支覆干应为日主丁');
    assert(cover.qualityMapping === null, '覆干 identity 不得直接生成 quality');
});

test('支间 Structure 可按 candidate 柱位挂接，但普通五行生克比和 inventory 明确保留缺口', () => {
    const view = synthesisFor().contextualForcePartyBranchSubstrateQualityInputAdapterView;
    const zi = view.candidateRecords.find((item) => item.zhi === '子');
    const branch = family(zi, 'branch-interaction-context');
    assert(branch.structureRecords.length > 0, '子支应有结构关系 provenance');
    assert(branch.structureRecords.some((item) => (item.branches || []).includes('亥') && (item.branches || []).includes('子') && (item.branches || []).includes('丑')), '应保留亥子丑三会结构');
    assert(branch.ordinaryElementRelationInventory === null, '不得伪造普通五行关系 inventory');
    assert(branch.status === contractApi.COVERAGE_STATES.PARTIAL, 'branch interaction 应因普通五行关系缺口保持 partial');
});

test('普通支间五行 relation inventory 是独立 blocker，不用 Structure presence 冒充', () => {
    const deps = depMap(synthesisFor());
    const dep = deps['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-BRANCH-ELEMENT-RELATION-INVENTORY'];
    assert(dep?.status === 'unresolved', 'branch element relation inventory 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-BRANCH-INTERACTION-INPUT-COVERAGE']?.status === 'unresolved', 'branch interaction coverage 应被该缺口阻断');
});

test('固定盘水 branch anchors 的 seasonal input 可解析为子月旺，但不映射 quality', () => {
    const view = synthesisFor().contextualForcePartyBranchSubstrateQualityInputAdapterView;
    const waterRecords = view.candidateRecords.filter((item) => item.wuxing === '水');
    assert(waterRecords.length > 0, '应存在水 branch candidates');
    waterRecords.forEach((record) => {
        const seasonal = family(record, 'seasonal-command-and-life-state-context');
        assert(seasonal.status === contractApi.COVERAGE_STATES.RESOLVED, `${record.zhi} seasonal 应 resolved`);
        assert(seasonal.seasonalContext?.state === '旺', `${record.zhi} 在子月应为水旺`);
        assert(seasonal.qualityMapping === null, '旺不得直接成为 substrate quality');
    });
    assert(depMap(synthesisFor())['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SEASONAL-INPUT-COVERAGE']?.status === 'resolved', '固定盘 seasonal family coverage 应 resolved');
});

test('positional-role family 在固定盘可 resolved，但不产生位置权重', () => {
    const synthesis = synthesisFor();
    const view = synthesis.contextualForcePartyBranchSubstrateQualityInputAdapterView;
    view.candidateRecords.forEach((record) => {
        const position = family(record, 'positional-role-context');
        assert(position.status === contractApi.COVERAGE_STATES.RESOLVED, `${record.actorKey} position 应 resolved`);
        assert(position.position && Number.isInteger(position.pillarIndex), 'position provenance 不完整');
        assert(position.numericPositionWeight === null, '不得产生 numeric position weight');
    });
    assert(depMap(synthesis)['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-POSITIONAL-ROLE-INPUT-COVERAGE']?.status === 'resolved', 'position family coverage 应 resolved');
});

test('network/party family 保留 side provenance，但被 relation-effect generalization / relative dominance 阻断', () => {
    const synthesis = synthesisFor();
    const view = synthesis.contextualForcePartyBranchSubstrateQualityInputAdapterView;
    view.candidateRecords.forEach((record) => {
        const network = family(record, 'branch-network-and-party-context');
        assert(network.sideId, '必须保留 counter side identity');
        assert(network.status === contractApi.COVERAGE_STATES.PARTIAL, 'network/party 应保持 partial');
        assert(network.partyMemberCountAsQuality === false, '不得把 member count 当 quality');
    });
    assert(depMap(synthesis)['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-NETWORK-PARTY-INPUT-COVERAGE']?.status === 'unresolved', 'network/party coverage 应 unresolved');
});

test('directed-capacity family 只消费 target-specific relation/interaction provenance，不把潜在五行关系当 capacity', () => {
    const synthesis = synthesisFor();
    const view = synthesis.contextualForcePartyBranchSubstrateQualityInputAdapterView;
    view.candidateRecords.forEach((record) => {
        const capacity = family(record, 'directed-capacity-context');
        assert(capacity.latentFiveElementRelationAsCapacity === false, '潜在五行关系不得冒充 capacity');
        assert(capacity.status === contractApi.COVERAGE_STATES.PARTIAL, 'generic relation-effect 未完成时 capacity 应 partial');
        assert(capacity.qualityMapping === null, 'capacity input 不得直接生成 quality');
    });
});

test('covering-stem identity 可解析但 reception 仍保留具体上游 blocker，不等于覆干全局有效', () => {
    const view = synthesisFor().contextualForcePartyBranchSubstrateQualityInputAdapterView;
    const hai = view.candidateRecords.find((item) => item.zhi === '亥');
    const cover = family(hai, 'covering-stem-context');
    assert(cover.coveringStem.gan === '丁', '亥支覆干应为丁');
    assert(cover.actorGlobalEffectiveness === null, '不得产生 global effectiveness');
    assert([contractApi.COVERAGE_STATES.PARTIAL, contractApi.COVERAGE_STATES.RESOLVED].includes(cover.status), 'cover family status 非法');
    if (cover.status === contractApi.COVERAGE_STATES.PARTIAL) assert(cover.blockerRecords.length > 0, 'partial cover 必须有 blocker');
});

test('Cross-Axis Comparison 与 Substrate Quality Resolver 接入 adapter 依赖后继续 unresolved', () => {
    const deps = depMap(synthesisFor());
    const cross = deps['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-CROSS-AXIS-COMPARISON-RULE'];
    const quality = deps['SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'];
    assert(cross?.status === 'unresolved' && quality?.status === 'unresolved', 'comparison/quality 不得变绿');
    assert(cross.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-UPSTREAM-SEMANTIC-COVERAGE'), 'cross-axis 缺 upstream coverage 依赖');
    assert(quality.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-INVENTORY-COVERAGE'), 'quality 缺 adapter inventory 依赖');
});

test('Foundation Coverage、Side Force Profile、Relative Dominance 与 Party Configuration 继续独立 unresolved', () => {
    const deps = depMap(synthesisFor());
    [
        'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE',
        'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER',
        'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE'
    ].forEach((id) => assert(deps[id]?.status === 'unresolved', `${id} 不得提前 resolved`));
});

test('many/few、Strength Synthesis 与 Assessment 仍保持关闭', () => {
    const output = outputFor();
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = depMap(synthesis);
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support many/few 不得变绿');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain many/few 不得变绿');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength Synthesis 应继续 insufficient');
    assert(output.semanticModel.assessmentLayer?.state === 'contract-only', 'Assessment 应继续 contract-only');
    assert((output.semanticModel.assessmentLayer?.assessments || []).length === 0, '不得输出最终 Assessment');
});

test('辰月过渡上下文不会被粗略整月赋 seasonal state', () => {
    const synthesis = synthesisFor(['丁','壬','丁','己'], ['丑','辰','亥','酉']);
    const view = synthesis.contextualForcePartyBranchSubstrateQualityInputAdapterView;
    assert(view.candidateRecords.length > 0, '辰月测试盘应有 branch candidate');
    const seasonal = family(view.candidateRecords[0], 'seasonal-command-and-life-state-context');
    assert(seasonal.status === contractApi.COVERAGE_STATES.PARTIAL, '辰月 seasonal 应保守 partial');
    assert(seasonal.seasonalContext?.state === null, '不得粗略伪造过渡月 state');
});

test('Adapter contract/runtime 不引入 score/weight/threshold/majority/ranking/classificationResult', () => {
    const synthesis = synthesisFor();
    const view = synthesis.contextualForcePartyBranchSubstrateQualityInputAdapterView;
    const keys = collectKeys({ contract:contractApi.CONTRACT, view });
    ['thresholdValue','classificationResult','forceScore','memberScore','majorityResult','rankingResult','priorityScore'].forEach((key) => assert(!keys.has(key), `不得出现 ${key}`));
    assert(contractApi.CONTRACT.numericWeights === false, 'numericWeights 必须 false');
    assert(contractApi.CONTRACT.numericAggregation === false, 'numericAggregation 必须 false');
    assert(contractApi.CONTRACT.scalarCollapse === false, 'scalarCollapse 必须 false');
    view.candidateRecords.forEach((record) => {
        assert(record.substrateQuality === null && record.crossAxisComparison === null && record.numericScore === null && record.scalarQuality === null, 'candidate 不得产生 quality/scalar');
    });
});

test('生产 loader 顺序为 Branch Substrate Quality Audit → Input Adapter，Adapter 再独立加载 contract/profile', () => {
    const auditSource = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-branch-substrate-quality-audit.js'), 'utf8');
    const adapterSource = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js'), 'utf8');
    assert(auditSource.includes('./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js?v=13.44.0'), 'Branch Quality Audit 尾部缺 adapter loader');
    assert(adapterSource.includes('./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-contract.js?v=13.44.0'), 'Adapter 缺 contract loader');
    assert(adapterSource.includes('./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-profile.js?v=13.44.0'), 'Adapter 缺 profile loader');
});

console.log(`\nBranch Substrate Quality Input Adapter v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);