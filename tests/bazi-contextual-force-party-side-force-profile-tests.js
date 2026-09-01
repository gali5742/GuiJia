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
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const contractApi = GuiJia.baziContextualForcePartySideForceProfileContract;
const profileApi = GuiJia.baziContextualForcePartySideForceProfileProfile;
const executionApi = GuiJia.baziContextualForcePartySideForceProfile;

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
function dependencyMap(synthesis) { return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item])); }

function syntheticSideInput() {
    return {
        dependencies:[{ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION', status:'unresolved' }],
        contextualForcePartyMembershipInventory:{
            daymasterSideActorKeys:['印'],
            counterAnchorActorKeys:['杀A','杀B'],
            evidenceRecords:[
                { id:'M1', actorKey:'印', sourceScope:'hidden-modifier', pillarIndex:2, position:'日支', tenGod:'正印' },
                { id:'M2', actorKey:'杀A', sourceScope:'source-surface', pillarIndex:1, position:'月干', tenGod:'七杀' },
                { id:'M3', actorKey:'杀B', sourceScope:'source-surface', pillarIndex:0, position:'年干', tenGod:'正官' },
                { id:'M4', actorKey:'财', sourceScope:'source-surface', pillarIndex:3, position:'时干', tenGod:'正财' }
            ],
            actorProfiles:[
                { actorKey:'印', membershipClasses:['daymaster-side-seed-candidate'], counterAnchorIds:[] },
                { actorKey:'杀A', membershipClasses:['counter-side-anchor-candidate'], counterAnchorIds:['counter-anchor:杀A'] },
                { actorKey:'杀B', membershipClasses:['counter-side-anchor-candidate'], counterAnchorIds:['counter-anchor:杀B'] },
                { actorKey:'财', membershipClasses:['context-dependent-unassigned'], counterAnchorIds:[] }
            ]
        },
        contextualForcePartyAffiliationView:{ records:[
            { id:'AF1', sourceActorKey:'财', targetActorKey:'杀A', affiliated:true, targetAnchorId:'counter-anchor:杀A' }
        ]},
        contextualForcePartyRelationEffectView:{ records:[
            { id:'RE1', anchorActorKey:'杀A', sourceActorKey:'财', targetActorKey:'杀A', relationType:'anchor-augmentation', realized:true },
            { id:'RE2', anchorActorKey:'杀A', sourceActorKey:'食', targetActorKey:'杀A', relationType:'anchor-opposition', realized:true },
            { id:'RE3', anchorActorKey:'杀A', sourceActorKey:'杀A', targetActorKey:'印', relationType:'anchor-mediation', realized:true }
        ]},
        contextualForceEvidenceProfile:{ axes:{
            seasonalStanding:{ axisId:'seasonalStanding', status:'mapped-resolved-source-standing', value:'失令', sourceEffectIds:['FX1'] },
            rootFoundation:{ axisId:'rootFoundation', status:'mapped-presence-effectiveness-not-collapsed', exactRoot:{ presence:'absent', actorKeys:[] }, sameElementRoot:{ presence:'absent', actorKeys:[] }, rootEffectivenessClassification:null },
            branchQiContext:{ axisId:'branchQiContext', status:'mapped-unaggregated' },
            hiddenModifier:{ axisId:'hiddenModifier', status:'mapped-qualitative-only' },
            interactionModifier:{
                axisId:'interactionModifier', status:'mapped-resolved-source-interaction-modifiers',
                realizedModifierRecords:[
                    { id:'I1', sourceActorKey:'X', targetActorKey:'杀A' },
                    { id:'I2', sourceActorKey:'杀A', targetActorKey:'其他' }
                ],
                resolvedNonRealizationRecords:[], qualifierRecords:[], blockerRecords:[]
            }
        }}
    };
}

test('Side Force Profile v0.1 独立拆分 contract、profile mapper 与 synthesis execution', () => {
    assert(contractApi?.installed && profileApi?.installed && executionApi?.installed, '三个模块必须安装');
    assert(contractApi.VERSION === '0.1' && executionApi.VERSION === '0.1', '版本异常');
});

test('合同明确每个 counter anchor 单独建 side profile，不自动合并多个克我 actor', () => {
    assert(contractApi.CONTRACT.oneCounterAnchorPerSideProfile === true, '缺 one-anchor-per-profile');
    assert(contractApi.CONTRACT.multipleCounterAnchorsDoNotAutoMerge === true, '不得自动合并 counter anchors');
    assert(contractApi.CONTRACT.sideRelative === true, '必须 side-relative');
});

test('固定验证盘：counter side 数量严格等于独立 counter anchor identity 数量', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const view = synthesis.contextualForcePartySideForceProfileView;
    const inventory = synthesis.contextualForcePartyMembershipInventory;
    assert(view.counterSides.length === inventory.counterAnchorActorKeys.length, 'counter side 不应合并或丢失');
    assert(new Set(view.counterSides.map((item) => item.anchor.actorKey)).size === view.counterSides.length, '每个 counter side anchor 必须唯一');
});

test('日主是 side anchor 而不是成员；direct seed 仍只是 identity candidate', () => {
    const side = outputFor().semanticModel.strengthSynthesis.contextualForcePartySideForceProfileView.daymasterSide;
    assert(side.anchor.kind === 'daymaster' && side.anchor.excludedFromMemberCount === true, '日主 anchor 边界异常');
    assert(side.membershipIdentity.realizedMemberCount === null && side.membershipIdentity.activeMemberCount === null, '不得生成 active member count');
    assert(side.forceClassification === null && side.relativeDominance === null, '不得从 seed 生成 force/dominance');
});

test('counter side 不复制日主 seasonal standing，只有 reference-only 月令背景', () => {
    const counter = outputFor().semanticModel.strengthSynthesis.contextualForcePartySideForceProfileView.counterSides[0];
    assert(counter.seasonalStanding.status === 'unresolved-no-counter-anchor-seasonal-resolver', 'counter seasonal 应 unresolved');
    assert(counter.seasonalStanding.value === null && counter.seasonalStanding.referenceOnly === true, '不得复制日主 seasonal value');
});

test('counter side 不借用日主 rootFoundation，专属 foundation resolver 缺失时明确阻断', () => {
    const counter = outputFor().semanticModel.strengthSynthesis.contextualForcePartySideForceProfileView.counterSides[0];
    assert(counter.foundationContext.status === 'unresolved-no-counter-anchor-foundation-resolver', 'counter foundation 应 unresolved');
    assert(counter.foundationContext.rootRecords.length === 0 && counter.foundationContext.effectivenessClassification === null, '不得借用日主根基');
});

test('明见与藏见只保留 sourceScope，不赋等值权重', () => {
    const side = outputFor().semanticModel.strengthSynthesis.contextualForcePartySideForceProfileView.daymasterSide;
    assert(side.visibleHiddenContext.equalWeight === false, '明暗不得等权');
    assert(side.visibleHiddenContext.numericWeight === null, '不得生成明暗权重');
    assert(Array.isArray(side.visibleHiddenContext.visibleRecords) && Array.isArray(side.visibleHiddenContext.hiddenRecords), '明暗必须分桶');
});

test('位置 context 保留 pillar/position provenance，但不生成位置权重', () => {
    const view = profileApi.buildSideForceProfileView(syntheticSideInput());
    const sideA = view.counterSides.find((item) => item.anchor.actorKey === '杀A');
    assert(sideA.positionContext.records.some((item) => item.actorKey === '杀A' && item.pillarIndex === 1), '缺 anchor 位置 provenance');
    assert(sideA.positionContext.records.every((item) => item.numericWeight === null), '不得生成位置权重');
});

test('synthetic：realized affiliation 只加入命中的 counter anchor 侧视图，不传播到第二 anchor', () => {
    const view = profileApi.buildSideForceProfileView(syntheticSideInput());
    const sideA = view.counterSides.find((item) => item.anchor.actorKey === '杀A');
    const sideB = view.counterSides.find((item) => item.anchor.actorKey === '杀B');
    assert(sideA.associatedActorKeys.includes('财'), '财应作为杀A anchor-specific affiliated actor');
    assert(!sideB.associatedActorKeys.includes('财'), '财不得传播到杀B');
    assert(sideA.membershipIdentity.globalMembershipMutation === null, '不得生成 actor-global membership mutation');
});

test('synthetic：opposition actor 不因制杀进入 counter side 或日主 side membership', () => {
    const view = profileApi.buildSideForceProfileView(syntheticSideInput());
    const sideA = view.counterSides.find((item) => item.anchor.actorKey === '杀A');
    assert(sideA.relationEffectContext.oppositionRecords.some((item) => item.sourceActorKey === '食'), '应保留 opposition effect');
    assert(!sideA.associatedActorKeys.includes('食'), 'opposition actor 不得变成 counter member');
    assert(!view.daymasterSide.associatedActorKeys.includes('食'), '扶身结果也不得把食神改写成日主 member');
});

test('synthetic：mediation target 保留通道记录，但不加入 counter side membership', () => {
    const view = profileApi.buildSideForceProfileView(syntheticSideInput());
    const sideA = view.counterSides.find((item) => item.anchor.actorKey === '杀A');
    assert(sideA.relationEffectContext.mediationRecords.some((item) => item.targetActorKey === '印'), '应保留 mediation record');
    assert(!sideA.associatedActorKeys.includes('印'), '印不得因 mediation 加入 counter side');
});

test('Interaction 只按 target actor 挂接，不因 source participation 重复到 side profile', () => {
    const view = profileApi.buildSideForceProfileView(syntheticSideInput());
    const sideA = view.counterSides.find((item) => item.anchor.actorKey === '杀A');
    assert(sideA.interactionContext.realizedModifierRecords.some((item) => item.id === 'I1'), 'target=杀A 的 modifier 应进入');
    assert(!sideA.interactionContext.realizedModifierRecords.some((item) => item.id === 'I2'), '仅 source=杀A 不得重复挂接');
});

test('固定验证盘：Side Force Profile Model resolved，但 concrete coverage 保持 unresolved', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-MODEL']?.status === 'resolved', 'profile model 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE']?.status === 'unresolved', 'profile coverage 应 unresolved');
    assert(synthesis.contextualForcePartySideForceProfileView.coverageComplete === false, '固定盘 coverage 不得伪 complete');
});

test('coverage blocker 显式保留 Relation Effect generalization 与 counter-specific seasonal/foundation 缺口', () => {
    const view = outputFor().semanticModel.strengthSynthesis.contextualForcePartySideForceProfileView;
    const families = new Set(view.blockerRecords.map((item) => item.family));
    assert(families.has('directed-relation-effect-context'), '缺 relation generalization blocker');
    assert(families.has('seasonal-standing-context'), '缺 counter seasonal blocker');
    assert(families.has('root-and-foundation-context'), '缺 counter foundation blocker');
});

test('Qualitative Comparison、Relative Dominance 与 Party Configuration 继续严格 unresolved', () => {
    const deps = dependencyMap(outputFor().semanticModel.strengthSynthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE']?.status === 'unresolved', 'comparison 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER']?.status === 'unresolved', 'dominance 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE']?.status === 'unresolved', 'Party Configuration 必须 unresolved');
});

test('Side Profile Model 完成不改变 Qianli many/few、Strength Synthesis 与 Assessment 关闭态', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support quantity 仍 unresolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain quantity 仍 unresolved');
    assert(model.strengthSynthesis.sufficiency?.status !== 'sufficient', 'Strength Synthesis 不得 sufficient');
    assert(model.assessmentLayer?.state === 'contract-only' && model.assessments?.length === 0, 'Assessment 必须关闭');
});

test('Contract/View 不引入 score、weight、threshold、majority、priority、ranking 或 force classification', () => {
    const view = profileApi.buildSideForceProfileView(syntheticSideInput());
    const serialized = JSON.stringify({ contract:contractApi.CONTRACT, view });
    assert(!/thresholdValue|majorityResult|priorityResult|rankingResult|strengthLevel|classificationResult/.test(serialized), '出现禁止聚合字段');
    assert(contractApi.CONTRACT.numericAggregation === false && contractApi.CONTRACT.numericWeights === false, 'numeric guard 异常');
    assert(contractApi.CONTRACT.majorityVoting === false && contractApi.CONTRACT.priorityAggregation === false && contractApi.CONTRACT.ranking === false, 'comparison shortcuts 必须关闭');
    assert(view.numericScore === null && view.scalarForce === null && view.relativeDominance === null, 'view 不得有力量结果');
});

test('生产 loader 链应为 Relative Dominance Audit → Side Force Profile execution → contract/profile', () => {
    const auditText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-relative-dominance-audit.js'), 'utf8');
    const executionText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-side-force-profile.js'), 'utf8');
    assert(auditText.includes('bazi-contextual-force-party-side-force-profile.js'), 'Relative Dominance Audit 未加载 Side Force Profile');
    assert(executionText.includes('bazi-contextual-force-party-side-force-profile-contract.js'), 'execution 未加载 contract');
    assert(executionText.includes('bazi-contextual-force-party-side-force-profile-profile.js'), 'execution 未加载 profile mapper');
});

console.log(`\nContextual Force Party Side Force Profile v0.1: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
