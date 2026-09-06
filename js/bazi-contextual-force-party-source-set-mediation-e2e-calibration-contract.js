(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceSetMediationE2ECalibrationContract?.installed) return;

    const calibrationSource = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource || null;
    const sourceGroupContract = GuiJia.baziContextualForcePartySourceActorGroupIdentityContract || null;
    const collectiveMediationContract = GuiJia.baziContextualForcePartyCollectiveMediationEffectContract || null;
    if (!calibrationSource || !sourceGroupContract || !collectiveMediationContract) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const MOTIF_ID = calibrationSource.MOTIF_IDS.MEDIATION;

    const FINITE_CALIBRATION_REGISTRY = Object.freeze({
        'CF-VMEC-MED-CASE-04':Object.freeze({
            calibrationCaseId:'CF-VMEC-MED-CASE-04',
            sourceGroupId:'CF-SAGI-GROUP-01',
            collectiveMediationEffectId:'CF-CME-SOURCE-01',
            motifId:MOTIF_ID
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-CONTRACT-001',
        version:VERSION,
        resolverScope:'audited-visible-finite-source-set-mediation-calibration-only',
        calibrationIdentityType:'group-to-actor',
        motifId:MOTIF_ID,
        sourceSemanticLevelRequired:'actor-set',
        sourceGroupStateRequired:sourceGroupContract.GROUP_STATES.RESOLVED_SOURCE_SCOPED,
        collectiveMediationEffectStateRequired:collectiveMediationContract.EFFECT_STATE,
        collectiveMediationRelationTypeRequired:collectiveMediationContract.RELATION_TYPE,
        exactChartMatchRequired:true,
        sourceMemberSetMatchRequired:true,
        sourceMembershipCompleteRequired:true,
        targetSingleActorRequired:true,
        targetActorIdentityMatchRequired:true,
        sourceExplicitOutcomeRequired:true,
        functionTypeRequired:'generation',
        currentActorSpecificCalibrationEligibleMayRemainFalse:true,
        expectedLegacyBlocker:'multiple-visible-killer-sources',
        actorSpecificVisibleEdgeCalibrationMutation:false,
        sourceGroupRegistryMutation:false,
        collectiveMediationEffectRegistryMutation:false,
        visibleFunctionRealizationRegistryMutation:false,
        sourceMemberSpecificRealizationSynthesized:false,
        sourceMemberEdgeExpansion:false,
        reverseSealToKillerEdgeCreated:false,
        sourceCaseScopedCalibration:true,
        unregisteredMediationCasesRemainUnresolved:true,
        mediationCaseFamilyCoverageComplete:false,
        oppositionCalibrationAffected:false,
        genericVisibleEdgeMappingResolved:false,
        genericCollectiveMediationResolverResolved:false,
        genericRelationEffectGeneralizationResolved:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        relativeDominanceMapping:false,
        finalStrengthMapping:false,
        statement:'Source-Set Mediation E2E Calibration v0.1 只把 MED CASE-04 的旧 actor-specific visible-edge calibration “多 source blocker”改用正确的 source actor-set 模型消费：必须同时复用已解析 Source Actor Group Identity 与已兑现 group→actor Collective Mediation Effect。旧 visible actor→actor mediation calibration 继续 unresolved，不得把 group outcome 拆成两条 member-specific 杀→印 edge。'
    });

    GuiJia.baziContextualForcePartySourceSetMediationE2ECalibrationContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        MOTIF_ID,
        FINITE_CALIBRATION_REGISTRY,
        CONTRACT,
        freezeArray
    });
})(typeof window !== 'undefined' ? window : globalThis);
