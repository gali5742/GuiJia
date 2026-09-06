(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCollectiveMediationEffectContract?.installed) return;

    const relationEffectContract = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const sourceGroupContract = GuiJia.baziContextualForcePartySourceActorGroupIdentityContract || null;
    const calibrationSource = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource || null;
    if (!relationEffectContract || !sourceGroupContract || !calibrationSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const RELATION_TYPE = relationEffectContract.RELATION_TYPES.ANCHOR_MEDIATION;
    const EFFECT_STATE = relationEffectContract.EFFECT_STATES.REALIZED;
    const MEDIATION_MOTIF_ID = calibrationSource.MOTIF_IDS.MEDIATION;

    const FINITE_COLLECTIVE_MEDIATION_REGISTRY = Object.freeze({
        'CF-VMEC-MED-CASE-04':Object.freeze({
            id:'CF-CME-SOURCE-01',
            sourceCaseId:'CF-VMEC-MED-CASE-04',
            sourceGroupId:'CF-SAGI-GROUP-01',
            targetActorKey:'visible:0:戊',
            sourceRoleClass:'七杀',
            targetTenGod:'偏印',
            relationType:RELATION_TYPE,
            functionType:'generation',
            sourceOutcomeTerms:freezeArray(['化杀']),
            requiredSourceMarkers:freezeArray(['干透两杀','化杀']),
            sourceWording:'干透两杀……所喜戊土原神透出，是以化杀。',
            executionAuthority:'exact-source-case-collective-source-outcome'
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-CONTRACT-001',
        version:VERSION,
        resolverScope:'audited-visible-finite-group-to-actor-mediation-only',
        relationIdentityType:'group-to-actor',
        mediationMotifId:MEDIATION_MOTIF_ID,
        allowedRelationTypes:freezeArray([RELATION_TYPE]),
        sourceCaseRegistryRequired:true,
        resolvedSourceActorGroupIdentityRequired:true,
        sourceGroupIdentitySideRequired:'relation-source',
        sourceRoleClassRequired:'七杀',
        targetActorKeyRequired:true,
        targetActorMustMatchSourceCaseProvenance:true,
        targetActorScopeRequired:'visible-stem',
        targetTenGodsAllowed:freezeArray(['正印','偏印']),
        functionTypeRequired:'generation',
        sourceExplicitOutcomeRequired:true,
        exactSourceOutcomeRequired:true,
        positiveState:EFFECT_STATE,
        existingMemberSpecificFunctionEdgesRequired:false,
        sourceMemberSpecificRealizationSynthesized:false,
        sourceMemberEdgeExpansion:false,
        reverseSealToKillerEdgeCreated:false,
        membershipMutation:false,
        targetActorGroupContractMutation:false,
        sourceActorGroupContractMutation:false,
        singleActorRelationEffectContractMutation:false,
        crossScopeExecutionDefined:false,
        actorToGroupOppositionContractMutation:false,
        genericCollectiveMediationResolverDefined:false,
        genericCollectiveEffectResolverDefined:false,
        independentForceUnit:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        relativeDominanceMapping:false,
        finalStrengthMapping:false,
        statement:'Collective Mediation Effect v0.1 与既有 actor→group Collective Relation Effect 平行，只消费已解析的 relation-source actor group，并在 MED CASE-04 来源明确“干透两杀……戊土原神透出，是以化杀”时建立 group→single-actor mediation record。该 record 不要求或伪造两枚七杀分别对戊印的 member-specific generation edge，也不反写为印→杀。'
    });

    GuiJia.baziContextualForcePartyCollectiveMediationEffectContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RELATION_TYPE,
        EFFECT_STATE,
        MEDIATION_MOTIF_ID,
        FINITE_COLLECTIVE_MEDIATION_REGISTRY,
        CONTRACT,
        freezeArray
    });
})(typeof window !== 'undefined' ? window : globalThis);
