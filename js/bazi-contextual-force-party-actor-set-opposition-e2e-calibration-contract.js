(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibrationContract?.installed) return;

    const calibrationSource = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource || null;
    const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    const groupContract = GuiJia.baziContextualForcePartyActorGroupIdentityContract || null;
    const collectiveEffectContract = GuiJia.baziContextualForcePartyCollectiveRelationEffectContract || null;
    if (!calibrationSource || !targetSource || !groupContract || !collectiveEffectContract) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const MOTIF_ID = calibrationSource.MOTIF_IDS.OPPOSITION;
    const FINITE_CALIBRATION_REGISTRY = Object.freeze({
        'CF-VMEC-OPP-CASE-02':Object.freeze({
            calibrationCaseId:'CF-VMEC-OPP-CASE-02',
            sourceCaseId:'CF-RTLC-CASE-04',
            groupId:'CF-AGI-GROUP-01',
            collectiveEffectId:'CF-CRE-SOURCE-01',
            motifId:MOTIF_ID
        }),
        'CF-VMEC-OPP-CASE-04':Object.freeze({
            calibrationCaseId:'CF-VMEC-OPP-CASE-04',
            sourceCaseId:'CF-RTLC-CASE-05',
            groupId:'CF-AGI-GROUP-02',
            collectiveEffectId:'CF-CRE-SOURCE-02',
            motifId:MOTIF_ID
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-CONTRACT-001',
        version:VERSION,
        resolverScope:'audited-visible-finite-actor-set-opposition-calibration-only',
        calibrationIdentityType:'actor-to-group',
        motifId:MOTIF_ID,
        targetSemanticLevelRequired:'actor-set',
        sourceContextTypeRequired:targetSource.SOURCE_CONTEXT_TYPES.CHART_CASE,
        predicateTypeRequired:targetSource.PREDICATE_TYPES.RELATION_EVENT,
        groupStateRequired:groupContract.GROUP_STATES.RESOLVED_SOURCE_SCOPED,
        collectiveEffectStateRequired:collectiveEffectContract.EFFECT_STATE,
        collectiveRelationTypeRequired:collectiveEffectContract.RELATION_TYPE,
        exactChartMatchRequired:true,
        sourceActorIdentityMatchRequired:true,
        targetMemberSetMatchRequired:true,
        targetMembershipCompleteRequired:true,
        sourceExplicitOutcomeRequired:true,
        functionTypeRequired:'restraint',
        currentActorSpecificCalibrationEligibleMayRemainFalse:true,
        actorSpecificVisibleEdgeCalibrationMutation:false,
        visibleFunctionRealizationRegistryMutation:false,
        collectiveEffectRegistryMutation:false,
        memberSpecificRealizationSynthesized:false,
        memberEdgeExpansion:false,
        sourceCaseScopedCalibration:true,
        unregisteredOppositionCasesRemainUnresolved:true,
        oppositionCaseFamilyCoverageComplete:false,
        mediationCalibrationAffected:false,
        genericVisibleEdgeMappingResolved:false,
        genericCollectiveResolverResolved:false,
        genericRelationEffectGeneralizationResolved:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        relativeDominanceMapping:false,
        finalStrengthMapping:false,
        statement:'Actor-Set Opposition E2E Calibration v0.1 只把两个已审定的《滴天髓阐微》食神制杀命例，从旧 actor-specific visible-edge calibration 的“多 target blocker”重解释为 source-scoped actor→group calibration。必须同时复用 RTLC actor-set target、有限 Group Identity 与已兑现 Collective Relation Effect；原 visible actor→actor calibration 继续 unresolved，group outcome 不得拆成 member edges。'
    });

    GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibrationContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        MOTIF_ID,
        FINITE_CALIBRATION_REGISTRY,
        CONTRACT,
        freezeArray
    });
})(typeof window !== 'undefined' ? window : globalThis);
