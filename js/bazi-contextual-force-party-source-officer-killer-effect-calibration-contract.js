(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceOfficerKillerEffectCalibrationContract?.installed) return;
    const identity = GuiJia.baziContextualForcePartySourceInstanceTargetCalibrationContract;
    if (!identity) return;
    const { freeze, SOURCE_CASE, ANNOTATION, IDENTITY_AUTHORITY } = identity;
    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-EFFECT-CALIBRATION-001';
    const STATES = freeze({ RESOLVED:'resolved-exact-officer-killer-source-effect',
        INVALID:'invalid-officer-killer-source-authority',UNRESOLVED:'unresolved-officer-killer-source-effect',
        NOT_APPLICABLE:'officer-killer-source-effect-not-applicable' });
    const common = { sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
        sourcePathId:IDENTITY_AUTHORITY.sourcePathId,chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:IDENTITY_AUTHORITY.sourceActorKey,targetActorKey:IDENTITY_AUTHORITY.targetActorKey,
        sourceScope:'visible-stem',targetScope:'visible-stem',targetCardinality:1,
        sourceText:SOURCE_CASE.sourceText,authorityScope:'exact-natal-source-case-actor-pair-only',transferablePathIds:[] };
    const REALIZATION_AUTHORITY = freeze({ ...common,id:'CF-SOKEC-REALIZATION-01',
        relationUnitId:ANNOTATION.relationUnits[0].id,functionType:'peer',directed:true,
        realizationState:'realized-in-source-context',
        assertionSpan:'喜其壬水官星助杀',contextSpan:'幸而壬水坐申，合而不化',
        reviewedBasis:'Source asserts officer assistance to the hour killer and describes the actual combination as non-transforming; 不宜合 is a warning about combining the officer, not a negation of officer-to-killer assistance.',
        rootWeaknessIsNonRealization:false,combinationIsAutomaticallyRealizationBlocker:false });
    const EFFECT_AUTHORITY = freeze({ ...common,id:'CF-SOKEC-EFFECT-01',
        realizationAuthorityId:REALIZATION_AUTHORITY.id,relationType:'anchor-augmentation',
        outcomeSpan:'壬水官星助杀',reviewedEffectInference:true,
        reviewedBasis:'For this exact natal case, the explicitly asserted 助杀 is reviewed as qualitative augmentation of the identified killer endpoint. The effect type comes from this registered source interpretation, not from peer, roles, identity, rootlessness or the mere character 助.',
        futureLuckOutcomesUsed:false,peerImpliesAugmentation:false,lexical助ImpliesAugmentation:false });
    const CONTRACT = freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-EFFECT-CALIBRATION-CONTRACT-001',version:VERSION,
        calibrationScope:'single-exact-dts-natal-officer-helps-hour-killer-effect',
        identityAuthorityRequired:true,separateRealizationAuthorityRequired:true,separateEffectAuthorityRequired:true,
        exactSourceAndCurrentChartRequired:true,actualInventoryAndGenericTargetKernelRequired:true,
        r5RegisteredSourceValidatorRequired:true,r4GenericExecutionRequired:true,
        positiveEffectCalibrationIntroduced:true,positiveSourceCaseCount:1,negativeSourceCaseCount:0,
        genericPeerEffectMappingDefined:false,existingMotifsExtended:false,broaderSourceCoverageComplete:false,
        sourceCaseAuthorityTransfersToR11Paths:false,groupExpansion:false,membershipMutation:false,
        numericAggregation:false,relativeDominanceMapping:false,finalStrengthMapping:false,
        boundary:'R15 independently reviews realization and augmentation for the exact R14 officer→hour-killer source case, revalidates identity against the actual chart inventory, normalizes its registered actor-pair authority through R5 and executes R4. This does not license generic peer effects, future luck outcomes, R11 paths, membership, dominance or final assessment.'
    });
    GuiJia.baziContextualForcePartySourceOfficerKillerEffectCalibrationContract = freeze({
        installed:true,VERSION,RULE_ID,STATES,REALIZATION_AUTHORITY,EFFECT_AUTHORITY,CONTRACT,freeze
    });
})(typeof window !== 'undefined' ? window : globalThis);
