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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const baselineApi = GuiJia.baziRootBaselineEffectiveness;

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

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

test('Root Baseline Effectiveness v0.2 建立 DTS 宽义根／载 → project rootRole semantic bridge', () => {
    assert(baselineApi?.installed === true, 'Root Baseline Effectiveness 模块未安装');
    assert(baselineApi.ROOT_BASELINE_EFFECTIVENESS_VERSION === '0.2', '版本应升级为 v0.2');
    const contract = baselineApi.extendSynthesis({}, {
        state:'evaluated', rootActorStates:[], claims:[], dependencies:[], conflicts:[], activeRuleIds:[], boundaries:[], sufficiency:{}
    }).rootBaselineEffectivenessContract;
    assert(contract.projectRootRoleScope === 'exact-root / same-element-root', 'project rootRole scope 异常');
    assert(contract.dtsRootTermSemanticScope === 'broader-than-project-root-role', '应明确 DTS 根／载语义更宽');
    assert(contract.sourceSemanticBridge === 'unresolved', 'source semantic bridge 必须 unresolved');
    assert(contract.directPositiveBaselineResolver === 'disabled-semantic-scope-mismatch', '不得直接启用 DTS positive baseline resolver');
    assert(contract.bearingSupportResolver === 'blocked-by-source-semantic-bridge', '支逢生扶 resolver 应先被 semantic bridge 阻断');
    assert(contract.sourceFirmnessMapping === 'unresolved', 'source-root-firm → generic effectiveState 仍须 unresolved');
});

test('DTS 两个连续命例证明“丁火之根”可指卯木生扶承载基础，而非 project hidden-root', () => {
    assert(baselineApi.SOURCE_SCOPE_EXAMPLES.length >= 2, '应保存正反两个 source scope 命例');
    const positive = baselineApi.SOURCE_SCOPE_EXAMPLES.find((item) => item.id === 'DTS-BEARING-SCOPE-DING-MAO-HAI-001');
    const negative = baselineApi.SOURCE_SCOPE_EXAMPLES.find((item) => item.id === 'DTS-BEARING-SCOPE-DING-MAO-YOU-002');
    assert(positive && negative, '缺少 DTS 丁卯正反命例');
    assert(positive.observedGan === '丁' && positive.observedGanElement === '火', '正例 observed gan 应为丁火');
    assert(positive.bearingZhi === '卯' && positive.bearingZhiElement === '木', '正例 bearing branch 应为卯木');
    assert(positive.hidesObservedGan === false, '卯不得被标为藏丁');
    assert(positive.sameElementAsObservedGan === false, '卯木不得被标为与丁火同五行');
    assert(positive.sourceOutcome === '丁火之根愈固', '正例 source outcome 异常');
    assert(negative.sourceOutcome === '克败丁火之根', '反例 source outcome 异常');
    assert(negative.sourceContext.includes('财星有克无生'), '反例应保留有克无生上下文');

    const maoHidden = (bazi.cangGanMap['卯'] || []).map(([gan]) => gan);
    assert(maoHidden.length === 1 && maoHidden[0] === '乙', `卯藏干应只有乙：${maoHidden.join(',')}`);
    assert(!maoHidden.includes('丁'), '卯不藏丁，因此不能满足 exact-root');
    assert(bazi.getWuXing('卯') === '木' && bazi.getWuXing('丁') === '火', '卯木与丁火不是同五行，因此不能满足 same-element-root');
});

test('Source Basis 保留 DTS 原句，但不再宣称“支逢生扶”已直接适用于 project root actor', () => {
    const terms = baselineApi.SOURCE_BASIS.map((item) => item.term).join('\n');
    assert(terms.includes('不论有根无根，俱要天覆地载'), '缺少天覆地载 source basis');
    assert(terms.includes('干通根于支，支逢生扶，则干之根坚，支逢冲克，则干之根拔矣'), '缺少根坚／根拔 source basis');
    assert(terms.includes('丁火之根愈固'), '缺少丁火之根愈固命例');
    assert(terms.includes('克败丁火之根'), '缺少克败丁火之根反例');
    const serialized = JSON.stringify(baselineApi.SOURCE_BASIS);
    assert(serialized.includes('dts-root-term-broader-than-project-hidden-root'), 'Source Basis 应显式记录语义范围差异');
});

test('project root actor 即使没有任何相关 Structure，也先卡在 source semantic bridge', () => {
    const record = baselineApi.buildBaselineRecord({
        id:'RS-TEST-01',
        actorKey:'branch:2:hidden:甲',
        rootRole:'exact-root',
        pillarIndex:2,
        position:'day',
        zhi:'寅',
        gan:'甲',
        level:'main',
        presence:'present',
        relatedStructureRefs:[],
        sourceEffectIds:['FX-ROOT-TEST']
    });
    assert(record.resolutionStatus === 'unresolved-source-semantic-bridge', `应先等待 semantic bridge：${record.resolutionStatus}`);
    assert(record.sourceSemanticBridge.status === 'unresolved', 'source semantic bridge 状态必须 unresolved');
    assert(record.sourceSemanticBridge.oneToOneMapping === false, '不得宣称一一映射');
    assert(record.bearingCondition.rootBearingBranchSupportStatus === 'not-evaluated', 'bridge 未完成时不得提前评估支逢生扶');
    assert(record.bearingCondition.resolverStatus === 'blocked-until-source-semantic-bridge', 'bearing resolver 应被 bridge 阻断');
    assert(record.sourceRootFirmnessState === null, '不得提前输出 source-root-firm');
    assert(record.genericEffectiveState === null, '不得提前输出 generic effective');
});

test('exact-root 与 same-element-root 保持项目窄义角色，不因 DTS 宽义根语义而合并', () => {
    const exact = baselineApi.buildBaselineRecord({ id:'RS-E', actorKey:'e', rootRole:'exact-root', gan:'甲', zhi:'寅' }, 0);
    const same = baselineApi.buildBaselineRecord({ id:'RS-S', actorKey:'s', rootRole:'same-element-root', gan:'乙', zhi:'卯' }, 1);
    assert(exact.resolutionStatus === 'unresolved-source-semantic-bridge' && same.resolutionStatus === 'unresolved-source-semantic-bridge', '两类 project root 均须先过 semantic bridge');
    const synthesis = baselineApi.extendSynthesis({}, {
        state:'evaluated', rootActorStates:[], claims:[], dependencies:[], conflicts:[], activeRuleIds:[], boundaries:[], sufficiency:{}
    });
    const claim = synthesis.claims.find((item) => item.id === 'SC-ROOT-BASELINE-EFFECTIVENESS-CONTRACT');
    assert(claim?.value?.exactRootAndSameElementRootEquivalent === false, '不得宣称 exact/same-element root 等效');
    assert(claim?.value?.dtsRootTermOneToOneMapsProjectRootRole === false, '不得把 DTS 宽义根与 project root 一一映射');
});

test('source-root-firm 仍只是 reserved source semantics，v0.2 不从 project root presence 发出', () => {
    assert(baselineApi.sourceRootFirmnessStates.SOURCE_ROOT_FIRM === 'source-root-firm', 'reserved source firmness vocabulary 异常');
    const records = baselineApi.buildBaselineRecords({
        rootActorStates:[
            { id:'RS-1', actorKey:'a', rootRole:'exact-root', gan:'甲', zhi:'寅', presence:'present', relatedStructureRefs:[], sourceEffectIds:['FX-1'] },
            { id:'RS-2', actorKey:'b', rootRole:'same-element-root', gan:'乙', zhi:'卯', presence:'present', relatedStructureRefs:['S-1'], sourceEffectIds:['FX-2'] }
        ]
    });
    assert(records.every((item) => item.sourceRootFirmnessState === null), 'v0.2 不得发出 source-root-firm');
    assert(records.every((item) => item.genericEffectiveState === null), 'v0.2 不得发出 generic effectiveState');
});

test('《子平真诠》长生／禄旺／库仍只作 comparison-only，不能越过 semantic bridge', () => {
    assert(baselineApi.CROSS_SOURCE_COMPARISONS.length >= 1, '应保存跨来源比较');
    baselineApi.CROSS_SOURCE_COMPARISONS.forEach((item) => {
        assert(item.compatibility === 'not-established', `${item.source} compatibility 必须 not-established`);
        assert(item.use === 'comparison-only', `${item.source} 只能 comparison-only`);
    });
    const serialized = JSON.stringify(baselineApi.CROSS_SOURCE_COMPARISONS);
    assert(serialized.includes('得长生禄旺，便不为弱') || serialized.includes('长生、余气、墓库'), '应保存子平系相关旁证');
});

test('有 project root actor 时新增 Source Semantic Bridge blocker，并串联 Bearing/Baseline/Root Effectiveness', () => {
    const base = {
        state:'evaluated',
        rootActorStates:[{ id:'RS-1', actorKey:'a', rootRole:'exact-root', gan:'甲', zhi:'寅', presence:'present', relatedStructureRefs:[], sourceEffectIds:['FX-1'] }],
        claims:[],
        dependencies:[
            { id:'SD-ROOT-ACTOR-INTERACTION-COVERAGE', status:'resolved' },
            { id:'SD-ROOT-ACTOR-INTERACTION-AGGREGATION', status:'resolved' },
            { id:'SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS', status:'unresolved' },
            { id:'SD-ROOT-EFFECTIVENESS', status:'unresolved', dependsOnDependencyIds:['SD-ROOT-ACTOR-INTERACTION-COVERAGE'] }
        ],
        conflicts:[], activeRuleIds:[], boundaries:[], sufficiency:{}
    };
    const synthesis = baselineApi.extendSynthesis({}, base);
    const deps = dependencyMap(synthesis);
    const bridge = deps['SD-ROOT-ACTOR-BASELINE-SOURCE-SEMANTIC-BRIDGE'];
    const bearing = deps['SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION'];
    const baseline = deps['SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS'];
    const root = deps['SD-ROOT-EFFECTIVENESS'];
    assert(bridge?.status === 'unresolved', 'Source Semantic Bridge 应成为 blocker');
    assert(bearing?.status === 'unresolved', 'Bearing Condition 继续 unresolved');
    assert(bearing?.dependsOnDependencyIds?.includes(bridge.id), 'Bearing 应依赖 Source Semantic Bridge');
    assert(baseline?.dependsOnDependencyIds?.includes(bridge.id) && baseline?.dependsOnDependencyIds?.includes(bearing.id), 'Baseline 应依赖 bridge + bearing');
    assert(root?.dependsOnDependencyIds?.includes(bridge.id), 'Root Effectiveness 应显式依赖 semantic bridge');
    assert(synthesis.rootActorStates[0].effectiveState === undefined || synthesis.rootActorStates[0].effectiveState === null, '不得回写 actor effectiveState');
});

test('无 project root actor 时 Bridge/Bearing/Baseline 均为 not-applicable resolved', () => {
    const synthesis = baselineApi.extendSynthesis({}, {
        state:'evaluated', rootActorStates:[], claims:[], dependencies:[{ id:'SD-ROOT-EFFECTIVENESS', status:'resolved' }], conflicts:[], activeRuleIds:[], boundaries:[], sufficiency:{}
    });
    const deps = dependencyMap(synthesis);
    assert(synthesis.rootBaselineEffectivenessRecords.length === 0, '无 root actor 不应制造 baseline records');
    assert(deps['SD-ROOT-ACTOR-BASELINE-SOURCE-SEMANTIC-BRIDGE']?.status === 'resolved', '无 root actor 时 bridge 为 not-applicable/resolved');
    assert(deps['SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION']?.status === 'resolved', '无 root actor 时 bearing 为 not-applicable/resolved');
    assert(deps['SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS']?.status === 'resolved', '无 root actor 时 baseline 为 not-applicable/resolved');
});

test('完整命盘中有 project root 仍不输出 source-root-firm / effective，最终 Strength 继续 not-evaluated', () => {
    const model = outputFor(['戊','辛','丙','癸'], ['辰','酉','午','巳']).semanticModel;
    const records = model.strengthSynthesis.rootBaselineEffectivenessRecords || [];
    assert(records.length > 0, '测试盘应识别一个或以上 root actor');
    assert(records.every((item) => item.resolutionStatus === 'unresolved-source-semantic-bridge'), '当前 baseline records 应先等待 semantic bridge');
    assert(records.every((item) => item.sourceRootFirmnessState === null && item.genericEffectiveState === null), '不得生成 source-root-firm/effective');
    assert((model.strengthSynthesis.rootActorStates || []).every((item) => item.effectiveState === null), '不得回写 rootActorStates.effectiveState');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '最终 Strength Assessment 必须保持关闭');
});

test('固定验证盘无根时仍保持原有 not-applicable 行为', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert((model.strengthSynthesis.rootBaselineEffectivenessRecords || []).length === 0, '固定验证盘不应生成 root baseline records');
    assert(deps['SD-ROOT-ACTOR-BASELINE-SOURCE-SEMANTIC-BRIDGE']?.status === 'resolved', '固定盘 bridge 应 not-applicable/resolved');
    assert(deps['SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION']?.status === 'resolved', '固定盘 bearing 应 not-applicable/resolved');
    assert(deps['SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS']?.status === 'resolved', '固定盘 baseline 应 not-applicable/resolved');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '固定盘最终 Assessment 不变');
});

test('生产加载链仍包含 Root Baseline Effectiveness 独立模块', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-root-clash-interaction-effect.js'), 'utf8');
    assert(source.includes('./js/bazi-root-actor-interaction-aggregation.js?v=13.44.0'), '既有 aggregation 加载链丢失');
    assert(source.includes('./js/bazi-root-baseline-effectiveness.js?v=13.44.0'), '生产加载链未接入 baseline 模块');
});

test('Baseline v0.2 不引入分数、权重、强弱结论，复制上下文不泄漏内部字段', () => {
    const result = makeResult(['戊','辛','丙','癸'], ['辰','酉','午','巳']);
    const output = interpretation.buildBaziInterpretation(result);
    const synthesis = output.semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({ contract:synthesis.rootBaselineEffectivenessContract, records:synthesis.rootBaselineEffectivenessRecords });
    ['score','weight','points','"strong"','"weak"','"balanced"'].forEach((term) => {
        assert(!serialized.includes(term), `Baseline 层不得引入 ${term}`);
    });
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'rootBaselineEffectivenessRecords',
        'rootBaselineEffectivenessContract',
        'SD-ROOT-ACTOR-BASELINE-SOURCE-SEMANTIC-BRIDGE',
        'SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION',
        'source-root-firm',
        'unresolved-source-semantic-bridge',
        'dtsRootTermSemanticScope'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Baseline 内部字段：${term}`));
});

console.log(`\nBaZi root baseline effectiveness: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
