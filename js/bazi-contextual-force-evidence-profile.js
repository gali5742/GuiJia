(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForceEvidenceProfile?.installed) return;

    // Research bootstrap prerequisite: ./js/bazi-contextual-force-evidence-source.js?v=13.44.0

    const sourceApi = GuiJia.baziContextualForceEvidenceSource || null;
    if (!sourceApi) return;

    const VERSION = '0.1';
    const freezeArray = (items = []) => Object.freeze([...items]);

    const projectContributionRecords = (synthesis = {}, meaning) => freezeArray(
        (synthesis.visibleStemDaymasterContributionRecords || [])
            .filter((item) => item.strengthMeaning === meaning)
            .map((item) => Object.freeze({
                id:item.id,
                actorKey:item.visibleActorKey || item.actorKey || item.visibleStemActorKey || null,
                strengthMeaning:item.strengthMeaning || null,
                contributionState:item.contributionState || null,
                realizationState:item.realizationState || null,
                sourcePatternId:item.sourcePatternId || null
            }))
    );

    const sourceSurfaceRecords = (bridge = {}) => {
        const surface = bridge.sourceSurfaceInventory || {};
        return [
            ...(surface.stems || []),
            ...(surface.branches || [])
        ];
    };

    const sourceSurfaceBySide = (bridge = {}, side) => freezeArray(
        sourceSurfaceRecords(bridge).filter((item) => item.quantitySide === side)
    );

    const relationMatchesMeaning = (item = {}, meaning) => {
        const relation = item.relationToDayMaster || item.relation || '';
        if (meaning === 'restraint') return relation === 'restraint' || relation === '克我';
        if (meaning === 'drain') return relation === 'drain' || relation === '我生';
        if (meaning === 'distribution') return relation === 'distribution' || relation === '我克';
        return false;
    };

    const sourceSurfaceByMeaning = (bridge = {}, meaning) => freezeArray(
        sourceSurfaceRecords(bridge).filter((item) => relationMatchesMeaning(item, meaning))
    );

    const hiddenBySide = (bridge = {}, side) => freezeArray(
        (bridge.hiddenModifierInventory || []).filter((item) => item.quantitySide === side)
    );

    const hiddenByMeaning = (bridge = {}, meaning) => freezeArray(
        (bridge.hiddenModifierInventory || []).filter((item) => relationMatchesMeaning(item, meaning))
    );

    const buildSeasonalStanding = (synthesis = {}) => {
        const seasonal = synthesis.qianliStrengthCompositionInputProfile?.seasonal || null;
        return Object.freeze({
            axisId:'seasonalStanding',
            status:seasonal?.status === 'resolved' ? 'mapped-resolved-source-standing' : 'mapped-unresolved-source-standing',
            value:seasonal?.value || null,
            sourceEffectIds:freezeArray(seasonal?.sourceEffectIds || []),
            numericValue:null,
            boundary:'得时／失时是独立背景轴，不等于整体 Contextual Force。'
        });
    };

    const buildRootFoundation = (semanticModel = {}) => {
        const effects = semanticModel?.strengthEffects?.effects || [];
        const exact = effects.find((item) => item.category === 'exactRootPresence') || null;
        const sameElement = effects.find((item) => item.category === 'sameElementRootPresence') || null;
        return Object.freeze({
            axisId:'rootFoundation',
            status:'mapped-presence-effectiveness-not-collapsed',
            exactRoot:Object.freeze({
                presence:exact?.presence || 'unavailable',
                actorKeys:freezeArray((exact?.actors || []).map((item) => item.actorKey)),
                sourceRefs:freezeArray(exact?.sourceRefs || [])
            }),
            sameElementRoot:Object.freeze({
                presence:sameElement?.presence || 'unavailable',
                actorKeys:freezeArray((sameElement?.actors || []).map((item) => item.actorKey)),
                sourceRefs:freezeArray(sameElement?.sourceRefs || [])
            }),
            rootQualityNumericValue:null,
            rootEffectivenessClassification:null,
            boundary:'根存在、根的来源轻重语义与根的实际有效状态分层保存；不得把根 actor 数量相加。'
        });
    };

    const buildSupportAxis = (synthesis = {}) => {
        const bridge = synthesis.qianliQuantitySemanticBridgeInventory || {};
        return Object.freeze({
            axisId:'alliedSupport',
            status:'mapped-candidates-and-project-realization',
            sourceSurfaceCandidates:sourceSurfaceBySide(bridge, 'support'),
            hiddenModifierCandidates:hiddenBySide(bridge, 'support'),
            projectContributionRecords:projectContributionRecords(synthesis, 'support'),
            partyConfiguration:null,
            numericValue:null,
            boundary:'扶助候选、藏干 modifier 与已兑现 contribution 并列保存；三者不等值，数量也不直接等于“党众／多帮扶”。'
        });
    };

    const buildPressureAxis = (synthesis = {}, axisId, meaning) => {
        const bridge = synthesis.qianliQuantitySemanticBridgeInventory || {};
        return Object.freeze({
            axisId,
            status:'mapped-candidates-and-project-realization',
            sourceSurfaceCandidates:sourceSurfaceByMeaning(bridge, meaning),
            hiddenModifierCandidates:hiddenByMeaning(bridge, meaning),
            projectContributionRecords:projectContributionRecords(synthesis, meaning),
            numericValue:null,
            boundary:'克、泄、被分按日主关系方向分别保存；候选关系与实际兑现分层，不按出现数换算压力强度。'
        });
    };

    const buildBranchQiContext = (synthesis = {}) => {
        const branchQi = synthesis.qianliStrengthCompositionInputProfile?.branchQi || null;
        const bridge = synthesis.qianliQuantitySemanticBridgeInventory || {};
        return Object.freeze({
            axisId:'branchQiContext',
            status:'mapped-unaggregated',
            sourceEffectIds:freezeArray(branchQi?.sourceEffectIds || []),
            observedStates:freezeArray(branchQi?.observedStates || []),
            surfaceBranchRecords:freezeArray((bridge.sourceSurfaceInventory?.branches || []).filter((item) => item.branchQiAxis)),
            aggregateClassification:null,
            numericValue:null,
            boundary:'年日时支气保持逐支上下文；十二长生单项状态不得直接汇总为“得气／无气”。'
        });
    };

    const buildHiddenModifier = (synthesis = {}) => {
        const bridge = synthesis.qianliQuantitySemanticBridgeInventory || {};
        return Object.freeze({
            axisId:'hiddenModifier',
            status:'mapped-qualitative-only',
            records:freezeArray(bridge.hiddenModifierInventory || []),
            numericConversion:null,
            boundary:'人元、藏干及本气／中气／余气只保留定性 modifier；不设置数字权重。'
        });
    };

    const buildInteractionModifier = (semanticModel = {}) => Object.freeze({
        axisId:'interactionModifier',
        status:'adapter-unresolved',
        structureRefs:freezeArray((semanticModel.structures || []).map((item) => item.id)),
        realizedModifierRecords:Object.freeze([]),
        numericValue:null,
        boundary:'当前仅保留原局 Structure provenance；刑冲合会存在不等于其对某个 force actor/function 的修正已兑现。后续需接入已解析 interaction-effect adapter。'
    });

    const buildProfile = (semanticModel = {}, synthesis = {}) => {
        const axes = Object.freeze({
            seasonalStanding:buildSeasonalStanding(synthesis),
            rootFoundation:buildRootFoundation(semanticModel),
            alliedSupport:buildSupportAxis(synthesis),
            incomingRestraint:buildPressureAxis(synthesis, 'incomingRestraint', 'restraint'),
            outboundDrain:buildPressureAxis(synthesis, 'outboundDrain', 'drain'),
            outboundDistribution:buildPressureAxis(synthesis, 'outboundDistribution', 'distribution'),
            branchQiContext:buildBranchQiContext(synthesis),
            hiddenModifier:buildHiddenModifier(synthesis),
            interactionModifier:buildInteractionModifier(semanticModel)
        });
        const unresolvedAxisIds = freezeArray(Object.values(axes)
            .filter((item) => String(item.status || '').includes('unresolved'))
            .map((item) => item.axisId));
        return Object.freeze({
            status:unresolvedAxisIds.length ? 'mapped-partial-no-force-conclusion' : 'mapped-complete-no-force-conclusion',
            axes,
            unresolvedAxisIds,
            partyConfiguration:null,
            forceClassification:null,
            capacityInterpretation:null,
            numericScore:null,
            scalarForce:null,
            assessmentConclusion:null
        });
    };

    GuiJia.baziContextualForceEvidenceProfile = Object.freeze({
        installed:true,
        VERSION,
        relationMatchesMeaning,
        buildSeasonalStanding,
        buildRootFoundation,
        buildSupportAxis,
        buildPressureAxis,
        buildBranchQiContext,
        buildHiddenModifier,
        buildInteractionModifier,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
