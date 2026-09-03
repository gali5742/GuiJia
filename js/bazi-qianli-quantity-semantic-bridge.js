(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQianliQuantitySemanticBridge?.installed) return;

    // Research bootstrap prerequisite: ./js/bazi-qianli-quantity-semantic-bridge-source.js?v=13.44.0

    const sourceApi = GuiJia.baziQianliQuantitySemanticBridgeSource || null;
    const auditApi = GuiJia.baziQianliQuantityClassificationAudit || null;
    const baziCore = GuiJia.baziCore || {};
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !auditApi) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-QIANLI-QUANTITY-SEMANTIC-BRIDGE-001';
    const { BRIDGE_RULES, CONTRACT } = sourceApi;

    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const POSITION_ORDER = Object.freeze(['year','month','day','hour']);

    const GENERATES = Object.freeze({ 木:'火', 火:'土', 土:'金', 金:'水', 水:'木' });
    const CONTROLS = Object.freeze({ 木:'土', 土:'水', 水:'火', 火:'金', 金:'木' });

    const relationToDayMaster = (actorElement, dayMasterElement) => {
        if (!actorElement || !dayMasterElement) return Object.freeze({ relation:'unresolved', quantitySide:'unresolved' });
        if (actorElement === dayMasterElement) return Object.freeze({ relation:'peer-support', quantitySide:'support' });
        if (GENERATES[actorElement] === dayMasterElement) return Object.freeze({ relation:'generation-support', quantitySide:'support' });
        if (CONTROLS[actorElement] === dayMasterElement) return Object.freeze({ relation:'restraint', quantitySide:'restraint-drain' });
        if (GENERATES[dayMasterElement] === actorElement) return Object.freeze({ relation:'drain', quantitySide:'restraint-drain' });
        if (CONTROLS[dayMasterElement] === actorElement) return Object.freeze({ relation:'distribution', quantitySide:'separate-distribution' });
        return Object.freeze({ relation:'unresolved', quantitySide:'unresolved' });
    };

    const visibleEvidenceItems = (semanticModel = {}) => {
        const evidence = semanticModel?.strengthEvidence?.evidence || {};
        return [
            ...(evidence.visibleSupportActors || []),
            ...(evidence.visibleRestraintActors || []),
            ...(evidence.visibleDrainActors || []),
            ...(evidence.visibleDistributionActors || [])
        ].sort((a, b) => (a.pillarIndex ?? 99) - (b.pillarIndex ?? 99));
    };

    const buildSurfaceStemInventory = (semanticModel = {}, synthesis = {}) => {
        const contributionRecords = synthesis.visibleStemDaymasterContributionRecords || [];
        return freezeArray(visibleEvidenceItems(semanticModel).map((item) => {
            const actorKey = `visible:${item.pillarIndex}:${item.gan}`;
            const related = contributionRecords.filter((record) =>
                record.visibleActorKey === actorKey || record.actorKey === actorKey || record.visibleStemActorKey === actorKey
            );
            return Object.freeze({
                id:`QBR-STEM-${item.position || item.pillarIndex}`,
                actorKey,
                scope:'surface-stem',
                position:item.position || '',
                gan:item.gan || '',
                wuxing:item.wuxing || baziCore.getWuXing?.(item.gan) || '',
                tenGod:item.tenGod || '',
                relation:item.relation || '',
                quantitySide:item.category === 'visibleSupportActors'
                    ? 'support'
                    : item.category === 'visibleRestraintActors' || item.category === 'visibleDrainActors'
                        ? 'restraint-drain'
                        : item.category === 'visibleDistributionActors'
                            ? 'separate-distribution'
                            : 'unresolved',
                sourceEvidenceIds:freezeArray([item.id].filter(Boolean)),
                projectContributionRecordIds:freezeArray(related.map((record) => record.id)),
                sourceSurfaceObservation:true,
                realizedContributionEquivalent:false,
                quantityInclusionDecision:'context-dependent-unresolved'
            });
        }));
    };

    const buildSurfaceBranchInventory = (semanticModel = {}) => {
        const strengthEvidence = semanticModel?.strengthEvidence?.evidence || {};
        const seasonal = strengthEvidence.seasonalState || null;
        const branchQi = strengthEvidence.branchQi || [];
        const dayMasterElement = semanticModel?.strengthEvidence?.dayMaster?.wuxing || '';
        const records = [];

        const byPosition = new Map(branchQi.map((item) => [item.position, item]));
        POSITION_ORDER.forEach((position, pillarIndex) => {
            const source = position === 'month'
                ? seasonal && { position:'month', pillarIndex:1, zhi:seasonal.monthZhi, id:seasonal.id }
                : byPosition.get(position);
            if (!source?.zhi) return;
            const wuxing = baziCore.getWuXing?.(source.zhi) || '';
            const relation = relationToDayMaster(wuxing, dayMasterElement);
            records.push(Object.freeze({
                id:`QBR-BRANCH-${position}`,
                scope:'surface-branch',
                position,
                pillarIndex,
                zhi:source.zhi,
                wuxing,
                relationToDayMaster:relation.relation,
                quantitySide:relation.quantitySide,
                sourceEvidenceIds:freezeArray([source.id].filter(Boolean)),
                sourceSurfaceObservation:true,
                seasonalAxis:position === 'month',
                branchQiAxis:position !== 'month',
                quantityInclusionDecision:'context-dependent-unresolved',
                realizedContributionEquivalent:false
            }));
        });
        return freezeArray(records);
    };

    const buildHiddenModifierInventory = (semanticModel = {}, surfaceBranches = []) => {
        const dayMasterGan = semanticModel?.strengthEvidence?.dayMaster?.gan || '';
        const dayMasterElement = semanticModel?.strengthEvidence?.dayMaster?.wuxing || baziCore.getWuXing?.(dayMasterGan) || '';
        const records = [];
        surfaceBranches.forEach((branch) => {
            const hidden = baziCore.cangGanMap?.[branch.zhi] || [];
            hidden.forEach(([gan, level], hiddenIndex) => {
                const wuxing = baziCore.getWuXing?.(gan) || '';
                const relation = relationToDayMaster(wuxing, dayMasterElement);
                records.push(Object.freeze({
                    id:`QBR-HIDDEN-${branch.position}-${hiddenIndex}-${gan}`,
                    actorKey:`hidden:${branch.pillarIndex}:${branch.zhi}:${gan}:${hiddenIndex}`,
                    scope:'hidden-modifier',
                    position:branch.position,
                    pillarIndex:branch.pillarIndex,
                    zhi:branch.zhi,
                    gan,
                    wuxing,
                    tenGod:baziCore.shiShenMap?.[dayMasterGan]?.[gan] || '',
                    level:level || '',
                    relationToDayMaster:relation.relation,
                    quantitySide:relation.quantitySide,
                    parentSurfaceBranchId:branch.id,
                    qualitativeModifierCandidate:true,
                    numericConversion:null,
                    sourceSurfaceEquivalent:false,
                    realizedContributionEquivalent:false
                }));
            });
        });
        return freezeArray(records);
    };

    const buildProjectRealizationInventory = (synthesis = {}) => freezeArray(
        (synthesis.visibleStemDaymasterContributionRecords || []).map((record) => Object.freeze({
            id:`QBR-PROJECT-${record.id}`,
            contributionRecordId:record.id,
            actorKey:record.visibleActorKey || record.actorKey || record.visibleStemActorKey || null,
            strengthMeaning:record.strengthMeaning || null,
            contributionState:record.contributionState || null,
            realizationState:record.realizationState || null,
            sourcePatternId:record.sourcePatternId || null,
            sourceSurfaceEquivalent:false,
            quantityClassificationEquivalent:false
        }))
    );

    const buildBridgeInventory = (semanticModel = {}, synthesis = {}) => {
        const surfaceStems = buildSurfaceStemInventory(semanticModel, synthesis);
        const surfaceBranches = buildSurfaceBranchInventory(semanticModel);
        const hiddenModifiers = buildHiddenModifierInventory(semanticModel, surfaceBranches);
        const projectRealization = buildProjectRealizationInventory(synthesis);
        const structuralCoverage = surfaceStems.length === 3 && surfaceBranches.length === 4;
        return Object.freeze({
            status:structuralCoverage ? 'mapped-without-classification' : 'partial-mapping',
            sourceSurfaceInventory:Object.freeze({
                stems:surfaceStems,
                branches:surfaceBranches
            }),
            hiddenModifierInventory:hiddenModifiers,
            projectRealizationInventory:projectRealization,
            axisPolicy:Object.freeze({
                monthBranchSeasonalAxisSeparate:true,
                yearDayHourBranchQiAxisSeparate:true,
                branchQuantityInclusionContextDependent:true,
                hiddenModifiersSeparateFromSurface:true,
                projectRealizationSeparateFromSourceSurface:true,
                distributionIncludedInRestraintDrain:false
            }),
            classificationStatus:'not-defined',
            classification:null,
            structuralCoverage
        });
    };

    const makeClaim = (inventory) => Object.freeze({
        id:'SC-QIANLI-QUANTITY-SEMANTIC-BRIDGE',
        claimKey:'qianli.quantity-classification.semantic-bridge',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            bridgeModel:'source-surface-plus-axis-plus-hidden-modifier-plus-project-realization',
            structuralCoverage:inventory.structuralCoverage,
            manyFewClassifierDefined:false,
            surfaceEqualsRealizedContribution:false,
            hiddenModifierNumericConversionDefined:false,
            distributionIncludedInRestraintDrain:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(unique(BRIDGE_RULES.flatMap((item) => item.sourceEvidenceIds))),
        rationale:'来源证据允许建立表层四柱观察、支气语境、人元 modifier 与项目 realization 的分层映射；这些层之间没有得到数量等价或数字换算授权。',
        boundary:'Bridge resolved 只表示语义层之间已经有稳定 inventory 映射，不表示多／少分类器已经存在。'
    });

    const makeDependency = ({ id, scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind:'aggregation',
        scope,
        status,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        ruleId:RULE_ID,
        statement,
        boundary
    });

    const rebuildQuantityDependency = (base, id, side) => {
        const current = (base.dependencies || []).find((item) => item.id === id) || {};
        const support = side === 'support';
        return Object.freeze({
            ...current,
            id,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-QIANLI-QUANTITY-SEMANTIC-BRIDGE',
                'SD-QIANLI-QUANTITY-EVIDENCE-INVENTORY-COVERAGE',
                'SD-QIANLI-QUANTITY-CLASSIFICATION-RULE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            acceptedAutomaticClassifier:null,
            statement:support
                ? '“多帮扶／少帮扶”现已有分层 evidence inventory，但仍缺来源支持的 many/few classification rule。'
                : '“多克泄／少克泄”现已有分层 evidence inventory，但仍缺来源支持的 many/few classification rule。',
            boundary:support
                ? '不得把 source-surface item 数、realized support contribution 数或 hidden modifier 数直接当分类结果。'
                : '不得把 source-surface item 数、realized restraint/drain contribution 数或 hidden modifier 数直接当分类结果；distribution 继续独立。'
        });
    };

    const buildDependencies = (base, inventory) => Object.freeze([
        makeDependency({
            id:'SD-QIANLI-QUANTITY-SEMANTIC-BRIDGE',
            scope:'qianli-source-quantity-to-project-evidence-bridge',
            status:'resolved',
            statement:'来源表层四柱、支气、人元 modifier 与项目 realization 已建立分层、可追溯的 evidence inventory bridge。',
            boundary:'Bridge 不建立 item 数量与多／少之间的等价关系。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-SOURCE-SCOPE-AUDIT'],
            resolvedByClaimIds:['SC-QIANLI-QUANTITY-SEMANTIC-BRIDGE']
        }),
        makeDependency({
            id:'SD-QIANLI-QUANTITY-EVIDENCE-INVENTORY-COVERAGE',
            scope:'qianli-source-quantity-evidence-inventory-coverage',
            status:inventory.structuralCoverage ? 'resolved' : 'unresolved',
            statement:inventory.structuralCoverage
                ? '四柱表层三干、四支及其人元 modifier 已进入 bridge inventory；project realization 作为独立视图并存。'
                : '四柱表层 inventory 不完整，因此后续 quantity classification 继续阻断。',
            boundary:'Coverage 只检查 inventory 结构完整，不判断多／少。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-SEMANTIC-BRIDGE']
        }),
        makeDependency({
            id:'SD-QIANLI-QUANTITY-CLASSIFICATION-RULE',
            scope:'qianli-many-few-source-backed-classification-rule',
            status:'unresolved',
            statement:'Bridge 已完成，但原书仍未提供可直接执行的统一 many/few classification rule。',
            boundary:'不得用固定数字阈值、简单计数、hidden-stem 权重或多数表决补齐。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-EVIDENCE-INVENTORY-COVERAGE']
        }),
        rebuildQuantityDependency(base, 'SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION', 'support'),
        rebuildQuantityDependency(base, 'SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION', 'restraint-drain')
    ]);

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const inventory = buildBridgeInventory(semanticModel, base);
        const claim = makeClaim(inventory);
        const newDependencies = buildDependencies(base, inventory);
        const replacedIds = new Set(newDependencies.map((item) => item.id));
        const claims = Object.freeze([...(base.claims || []), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...newDependencies
        ]);
        const conflicts = typeof priorSynthesisApi?.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi?.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            qianliQuantitySemanticBridgeSourceRules:BRIDGE_RULES,
            qianliQuantitySemanticBridgeInventory:inventory,
            qianliQuantitySemanticBridgeContract:CONTRACT,
            qianliQuantitySemanticBridgeRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Quantity Semantic Bridge v0.1 将 source-surface inventory 与 project realization inventory 分开保存；出现不等于兑现。',
                '月支季节轴、年日时支气轴与 quantity surface observation 保持可区分，不固定所有地支的计入方式。',
                '人元只作为 qualitative modifier inventory；本气／中气／余气不换算数字。',
                'Bridge resolved 后仍缺 many/few classification rule，因此两个 quantity classifier 与最终 Assessment 继续 unresolved。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildQianliQuantitySemanticBridgeInventory:buildBridgeInventory
        });
    }

    GuiJia.baziQianliQuantitySemanticBridge = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        BRIDGE_RULES,
        CONTRACT,
        relationToDayMaster,
        buildSurfaceStemInventory,
        buildSurfaceBranchInventory,
        buildHiddenModifierInventory,
        buildProjectRealizationInventory,
        buildBridgeInventory,
        buildDependencies,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);