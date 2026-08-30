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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziVisibleStemDirectedFunction;

function makeResult(gans, zhis) {
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
    const result = makeResult(gans, zhis);
    return { result, output:interpretation.buildBaziInterpretation(result) };
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

function directedRecord(synthesis, actorKey) {
    return (synthesis.visibleStemDirectedFunctionRecords || []).find((item) => item.visibleActorKey === actorKey);
}

test('Directed Function v0.2 冻结五类关系，并把 peer 从有向 source/target 中拆出', () => {
    assert(api?.installed === true, 'Directed Function 模块未安装');
    assert(api.VISIBLE_STEM_DIRECTED_FUNCTION_VERSION === '0.2', '版本异常');
    assert(api.CONTRACT.allVisibleFunctionsPointTowardDayMaster === false, '不得把所有 visible function 都写成 actor→日主');
    assert(api.CONTRACT.peerUsesDirectedSourceTarget === false, 'peer 不得使用有向 source/target');
    assert(api.RELATION_MODELS['生我'].flow === 'inbound-to-daymaster' && api.RELATION_MODELS['生我'].directed === true, '生我应为 directed inbound');
    assert(api.RELATION_MODELS['同我'].flow === 'peer-with-daymaster' && api.RELATION_MODELS['同我'].directed === false, '同我应为 non-directed peer');
    assert(api.RELATION_MODELS['克我'].flow === 'inbound-to-daymaster' && api.RELATION_MODELS['克我'].directed === true, '克我应为 directed inbound');
    assert(api.RELATION_MODELS['我生'].flow === 'outbound-from-daymaster' && api.RELATION_MODELS['我生'].directed === true, '我生应为 directed outbound');
    assert(api.RELATION_MODELS['我克'].flow === 'outbound-from-daymaster' && api.RELATION_MODELS['我克'].directed === true, '我克应为 directed outbound');
});

test('固定验证盘：比肩保存 participant pair，官星 inbound，食神 outbound', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const peer = directedRecord(synthesis, 'visible:0:丁');
    const restraint = directedRecord(synthesis, 'visible:1:壬');
    const drain = directedRecord(synthesis, 'visible:3:己');

    assert(peer?.relationFromDayMaster === '同我' && peer.flow === 'peer-with-daymaster', '年干丁应为 peer');
    assert(peer.directed === false && peer.reciprocal === true, '同我必须是 reciprocal non-directed peer');
    assert(peer.sourceActor === null && peer.targetActor === null, 'peer 不得制造 sourceActor/targetActor');
    assert(peer.peerParticipants.length === 2, 'peer 应保存两个 participants');
    assert(peer.peerParticipants[0].actorKey === 'visible:0:丁' && peer.peerParticipants[1].actorKey === 'daymaster:2:丁', 'peer participant provenance 异常');

    assert(restraint?.relationFromDayMaster === '克我' && restraint.flow === 'inbound-to-daymaster', '月干壬应 inbound 克日主');
    assert(restraint.directed === true, '克我应为 directed');
    assert(restraint.sourceActor.actorKey === 'visible:1:壬' && restraint.targetActor.actorKey === 'daymaster:2:丁', '克我 source/target 方向错误');

    assert(drain?.relationFromDayMaster === '我生' && drain.flow === 'outbound-from-daymaster', '时干己应 outbound 泄力');
    assert(drain.directed === true, '我生应为 directed');
    assert(drain.sourceActor.actorKey === 'daymaster:2:丁' && drain.targetActor.actorKey === 'visible:3:己', '我生不得写成己→丁');
});

test('生我明确保存为明干→日主 generation', () => {
    const { output } = outputFor(['甲','乙','丁','己'], ['子','丑','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    ['visible:0:甲','visible:1:乙'].forEach((actorKey) => {
        const record = directedRecord(synthesis, actorKey);
        assert(record?.relationFromDayMaster === '生我', `${actorKey} 应为生我`);
        assert(record.flow === 'inbound-to-daymaster' && record.directed === true, `${actorKey} 应 directed inbound`);
        assert(record.functionType === 'generation', `${actorKey} 应 generation`);
        assert(record.sourceActor.actorKey === actorKey && record.targetActor.actorKey === 'daymaster:2:丁', `${actorKey} source/target 异常`);
        assert(record.peerParticipants.length === 0, `${actorKey} 不得伪造 peer participants`);
    });
});

test('我克明确保存为日主→财星 restraint/distribution，不反向成财星克日主', () => {
    const { output } = outputFor(['庚','辛','丁','己'], ['子','丑','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    ['visible:0:庚','visible:1:辛'].forEach((actorKey) => {
        const record = directedRecord(synthesis, actorKey);
        assert(record?.relationFromDayMaster === '我克', `${actorKey} 应为我克`);
        assert(record.flow === 'outbound-from-daymaster' && record.directed === true, `${actorKey} 应 directed outbound`);
        assert(record.functionType === 'restraint' && record.strengthMeaning === 'distribution', `${actorKey} 应为 restraint/distribution`);
        assert(record.sourceActor.actorKey === 'daymaster:2:丁' && record.targetActor.actorKey === actorKey, `${actorKey} 不得反向`);
    });
});

test('Direction Model 只解决语义，inbound / peer realization / outbound 三类 blocker 独立', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-VISIBLE-STEM-FUNCTION-DIRECTION-MODEL']?.status === 'resolved', 'Direction Model 应 resolved');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-INBOUND-REACHABILITY']?.status === 'unresolved', 'inbound reachability 应 unresolved');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-PEER-REALIZATION']?.status === 'unresolved', 'peer realization 应 unresolved');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-OUTBOUND-REACHABILITY']?.status === 'unresolved', 'outbound reachability 应 unresolved');
    assert(!deps['SD-VISIBLE-STEM-DAYMASTER-INBOUND-PEER-REACHABILITY'], '旧 inbound/peer 合并 blocker 应被移除');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY']?.status === 'unresolved', '兼容父 dependency 仍应 unresolved');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY'].dependsOnDependencyIds.includes('SD-VISIBLE-STEM-DAYMASTER-INBOUND-REACHABILITY'), '父 dependency 应含 inbound');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY'].dependsOnDependencyIds.includes('SD-VISIBLE-STEM-DAYMASTER-PEER-REALIZATION'), '父 dependency 应含 peer realization');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY'].dependsOnDependencyIds.includes('SD-VISIBLE-STEM-DAYMASTER-OUTBOUND-REACHABILITY'), '父 dependency 应含 outbound');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', 'Visible Effectiveness 不得被方向模型解决');
    assert(synthesis.sufficiency.status === 'insufficient', '最终 Synthesis 仍应 insufficient');
});

test('只有 inbound/peer 时 outbound blocker 为 not-applicable resolved', () => {
    const { output } = outputFor(['甲','壬','丁','丁'], ['子','丑','亥','酉']);
    const deps = dependencyMap(output.semanticModel.strengthSynthesis);
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-INBOUND-REACHABILITY']?.status === 'unresolved', '应存在 inbound blocker');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-PEER-REALIZATION']?.status === 'unresolved', '应存在 peer realization blocker');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-OUTBOUND-REACHABILITY']?.status === 'resolved', '无 outbound 时应 not-applicable/resolved');
});

test('已有 Function Reachability direct source records 不因 Directed Function v0.2 被改写', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const sourceRecords = synthesis.visibleStemFunctionReachabilityRecords || [];
    assert(sourceRecords.length === 2, '原有 DTS target-specific reachability 两条直证必须保留');
    assert(sourceRecords.every((item) => item.reachabilityState === 'unavailable-in-source-context'), '原有 source reachability 状态不得改变');
    assert((synthesis.visibleStemDirectedFunctionRecords || []).length === 3, '该盘三个非日主明干都应建立 function semantics');
});

test('Directed Function 不把语义升级为 reachable/effective，也不引入数值聚合', () => {
    const { result, output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({
        records:synthesis.visibleStemDirectedFunctionRecords,
        contract:synthesis.visibleStemDirectedFunctionContract
    });
    ['score','weight','points','"strong"','"weak"','"balanced"'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    assert((synthesis.visibleStemDirectedFunctionRecords || []).every((item) => item.reachabilityState === null && item.genericVisibleEffectiveState === null), '方向/peer 解析不得提前生成 reachability/effectiveness');
    assert(output.semanticModel.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '最终 Strength 不得启动');

    const copied = interpretation.buildBaziContextText(result, output);
    [
        'visibleStemDirectedFunction',
        'peerParticipants',
        'inbound-to-daymaster',
        'outbound-from-daymaster',
        'SD-VISIBLE-STEM-FUNCTION-DIRECTION-MODEL',
        'SD-VISIBLE-STEM-DAYMASTER-PEER-REALIZATION'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏内部字段：${term}`));
});

test('生产加载链在 Function Reachability 后加载 Directed Function', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-function-reachability.js'), 'utf8');
    assert(source.includes('./js/bazi-visible-stem-directed-function.js?v=13.44.0'), '生产加载链缺少 Directed Function');
});

console.log(`\nBaZi visible stem directed function: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);