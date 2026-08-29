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

test('Root Baseline Effectiveness v0.1 建立“通根≠根坚≠effective”合同', () => {
    assert(baselineApi?.installed === true, 'Root Baseline Effectiveness 模块未安装');
    assert(baselineApi.ROOT_BASELINE_EFFECTIVENESS_VERSION === '0.1', '版本异常');
    const contract = baselineApi.extendSynthesis({}, {
        state:'evaluated', rootActorStates:[], claims:[], dependencies:[], conflicts:[], activeRuleIds:[], boundaries:[], sufficiency:{}
    }).rootBaselineEffectivenessContract;
    assert(contract.rootPresenceImpliesBaselineEffective === false, 'root presence 不得自动 baseline effective');
    assert(contract.requiredBearingCondition === '支逢生扶', '应保留《滴天髓》支逢生扶条件');
    assert(contract.bearingSupportResolver === 'unresolved', '支逢生扶 resolver 当前必须 unresolved');
    assert(contract.sourceFirmnessMapping === 'unresolved', 'source-root-firm → generic effectiveState 仍须 unresolved');
});

test('Source Basis 明确保存《滴天髓》“天覆地载／根坚／根拔”边界', () => {
    const terms = baselineApi.SOURCE_BASIS.map((item) => item.term).join('\n');
    assert(terms.includes('不论有根无根，俱要天覆地载'), '缺少有根仍须天覆地载的 source basis');
    assert(terms.includes('干通根于支，支逢生扶，则干之根坚，支逢冲克，则干之根拔矣'), '缺少通根→根坚／根拔 source basis');
    assert(terms.includes('支坐禄旺，时逢印比，足以用官'), '缺少明确承载命例 source basis');
});

test('root actor 即使没有任何相关 Structure，也只得到 unresolved-bearing-condition', () => {
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
    assert(record.resolutionStatus === 'unresolved-bearing-condition', `无 Structure 也不能默认有效：${record.resolutionStatus}`);
    assert(record.bearingCondition.rootPresenceConfirmed === true, '应确认 root presence');
    assert(record.bearingCondition.rootBearingBranchSupportStatus === 'unresolved', '支逢生扶状态必须 unresolved');
    assert(record.sourceRootFirmnessState === null, '不得提前输出 source-root-firm');
    assert(record.genericEffectiveState === null, '不得提前输出 generic effective');
});

test('exact-root 与 same-element-root 都进入 baseline 管线，但合同不宣称二者等效', () => {
    const exact = baselineApi.buildBaselineRecord({ id:'RS-E', actorKey:'e', rootRole:'exact-root', gan:'甲', zhi:'寅' }, 0);
    const same = baselineApi.buildBaselineRecord({ id:'RS-S', actorKey:'s', rootRole:'same-element-root', gan:'乙', zhi:'卯' }, 1);
    assert(exact.resolutionStatus === 'unresolved-bearing-condition' && same.resolutionStatus === 'unresolved-bearing-condition', '两类根均应进入 baseline 条件层');
    const synthesis = baselineApi.extendSynthesis({}, {
        state:'evaluated', rootActorStates:[], claims:[], dependencies:[], conflicts:[], activeRuleIds:[], boundaries:[], sufficiency:{}
    });
    const claim = synthesis.claims.find((item) => item.id === 'SC-ROOT-BASELINE-EFFECTIVENESS-CONTRACT');
    assert(claim?.value?.exactRootAndSameElementRootEquivalent === false, '不得宣称 exact/same-element root 等效');
});

test('source-root-firm 只是 reserved source semantics，v0.1 不从 root presence 直接发出', () => {
    assert(baselineApi.sourceRootFirmnessStates.SOURCE_ROOT_FIRM === 'source-root-firm', 'reserved source firmness vocabulary 异常');
    const records = baselineApi.buildBaselineRecords({
        rootActorStates:[
            { id:'RS-1', actorKey:'a', rootRole:'exact-root', gan:'甲', zhi:'寅', presence:'present', relatedStructureRefs:[], sourceEffectIds:['FX-1'] },
            { id:'RS-2', actorKey:'b', rootRole:'same-element-root', gan:'乙', zhi:'卯', presence:'present', relatedStructureRefs:['S-1'], sourceEffectIds:['FX-2'] }
        ]
    });
    assert(records.every((item) => item.sourceRootFirmnessState === null), 'v0.1 不得发出 source-root-firm');
    assert(records.every((item) => item.genericEffectiveState === null), 'v0.1 不得发出 generic effectiveState');
});

test('《子平真诠》长生／禄旺／库只作 comparison-only，不能补 DTS 支逢生扶 resolver', () => {
    assert(baselineApi.CROSS_SOURCE_COMPARISONS.length >= 1, '应保存跨来源比较');
    baselineApi.CROSS_SOURCE_COMPARISONS.forEach((item) => {
        assert(item.compatibility === 'not-established', `${item.source} compatibility 必须 not-established`);
        assert(item.use === 'comparison-only', `${item.source} 只能 comparison-only`);
    });
    const serialized = JSON.stringify(baselineApi.CROSS_SOURCE_COMPARISONS);
    assert(serialized.includes('得长生禄旺，便不为弱') || serialized.includes('长生、余气、墓库'), '应保存子平系相关旁证');
});

test('有 root actor 时新增 Bearing Condition blocker，并重建 Baseline/Root Effectiveness dependency', () => {
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
    assert(deps['SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION']?.status === 'unresolved', 'Bearing Condition 应成为新 blocker');
    assert(deps['SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS']?.status === 'unresolved', 'Baseline Effectiveness 继续 unresolved');
    assert(deps['SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION'), 'Baseline 应依赖 Bearing Condition');
    assert(deps['SD-ROOT-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION'), 'Root Effectiveness 应显式依赖 Bearing Condition');
    assert(synthesis.rootActorStates[0].effectiveState === undefined || synthesis.rootActorStates[0].effectiveState === null, 'Baseline 层不得回写 actor effectiveState');
});

test('无 root actor 时 Bearing/Baseline 为 not-applicable resolved，不制造虚假强弱', () => {
    const synthesis = baselineApi.extendSynthesis({}, {
        state:'evaluated', rootActorStates:[], claims:[], dependencies:[{ id:'SD-ROOT-EFFECTIVENESS', status:'resolved' }], conflicts:[], activeRuleIds:[], boundaries:[], sufficiency:{}
    });
    const deps = dependencyMap(synthesis);
    assert(synthesis.rootBaselineEffectivenessRecords.length === 0, '无 root actor 不应制造 baseline records');
    assert(deps['SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION']?.status === 'resolved', '无 root actor 时 bearing 为 not-applicable/resolved');
    assert(deps['SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS']?.status === 'resolved', '无 root actor 时 baseline 为 not-applicable/resolved');
});

test('完整命盘中有根仍不输出 source-root-firm / effective，最终 Strength 继续 not-evaluated', () => {
    const model = outputFor(['戊','辛','丙','癸'], ['辰','酉','午','巳']).semanticModel;
    const records = model.strengthSynthesis.rootBaselineEffectivenessRecords || [];
    assert(records.length > 0, '测试盘应识别一个或以上 root actor');
    assert(records.every((item) => item.resolutionStatus === 'unresolved-bearing-condition'), '当前所有 baseline records 应等待支逢生扶 resolver');
    assert(records.every((item) => item.sourceRootFirmnessState === null && item.genericEffectiveState === null), '不得生成 source-root-firm/effective');
    assert((model.strengthSynthesis.rootActorStates || []).every((item) => item.effectiveState === null), '不得回写 rootActorStates.effectiveState');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '最终 Strength Assessment 必须保持关闭');
});

test('固定验证盘无根时仍保持原有 not-applicable 行为', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert((model.strengthSynthesis.rootBaselineEffectivenessRecords || []).length === 0, '固定验证盘不应生成 root baseline records');
    assert(deps['SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION']?.status === 'resolved', '固定盘 bearing 应 not-applicable/resolved');
    assert(deps['SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS']?.status === 'resolved', '固定盘 baseline 应 not-applicable/resolved');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '固定盘最终 Assessment 不变');
});

test('生产加载链包含 Root Baseline Effectiveness 独立模块', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-root-clash-interaction-effect.js'), 'utf8');
    assert(source.includes('./js/bazi-root-actor-interaction-aggregation.js?v=13.44.0'), '既有 aggregation 加载链丢失');
    assert(source.includes('./js/bazi-root-baseline-effectiveness.js?v=13.44.0'), '生产加载链未接入 baseline 模块');
});

test('Baseline 层不引入分数、权重、强弱结论，复制上下文不泄漏内部字段', () => {
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
        'SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION',
        'source-root-firm',
        'unresolved-bearing-condition',
        'rootBearingBranchSupportStatus'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Baseline 内部字段：${term}`));
});

console.log(`\nBaZi root baseline effectiveness: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
