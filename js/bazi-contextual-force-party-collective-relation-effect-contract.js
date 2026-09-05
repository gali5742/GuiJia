(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCollectiveRelationEffectContract?.installed) return;

    const relationEffectContract = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const groupContract = GuiJia.baziContextualForcePartyActorGroupIdentityContract || null;
    if (!relationEffectContract || !groupContract) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const RELATION_TYPE = relationEffectContract.RELATION_TYPES.ANCHOR_OPPOSITION;
    const EFFECT_STATE = relationEffectContract.EFFECT_STATES.REALIZED;

    const FINITE_COLLECTIVE_EFFECT_REGISTRY = Object.freeze({
        'CF-RTLC-CASE-04':Object.freeze({
            id:'CF-CRE-SOURCE-01',
            sourceCaseId:'CF-RTLC-CASE-04',
            targetGroupId:'CF-AGI-GROUP-01',
            sourceActorKey:'visible:3:丙',
            sourceTenGod:'食神',
            targetRoleClass:'七杀',
            relationType:RELATION_TYPE,
            functionType:'restraint',
            sourceOutcomeTerms:freezeArray(['制杀','扶身']),
            sourceWording:'庚金并透……更妙丙火独透，制杀扶身。',
            executionAuthority:'exact-source-case-collective-outcome'
        }),
        'CF-RTLC-CASE-05':Object.freeze({
            id:'CF-CRE-SOURCE-02',
            sourceCaseId:'CF-RTLC-CASE-05',
            targetGroupId:'CF-AGI-GROUP-02',
            sourceActorKey:'visible:0:壬',
            sourceTenGod:'食神',
            targetRoleClass:'七杀',
            relationType:RELATION_TYPE,
            functionType:'restraint',
            sourceOutcomeTerms:freezeArray(['制杀']),
            sourceWording:'此造两杀当权临旺……年干壬水临申，足以制杀。',
            executionAuthority:'exact-source-case-collective-outcome'
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-CONTRACT-001',
        version:VERSION,
        resolverScope:'audited-visible-finite-actor-group-opposition-only',
        relationIdentityType:'actor-to-group',
        allowedRelationTypes:freezeArray([RELATION_TYPE]),
        sourceCaseRegistryRequired:true,
        resolvedActorGroupIdentityRequired:true,
        sourceActorKeyRequired:true,
        sourceActorMustMatchGroupCaseProvenance:true,
        sourceTenGodRequired:'食神',
        targetRoleClassRequired:'七杀',
        functionTypeRequired:'restraint',
        exactSourceOutcomeRequired:true,
        positiveState:EFFECT_STATE,
        existingMemberSpecificFunctionEdgesRequired:false,
        memberSpecificRealizationSynthesized:false,
        memberEdgeExpansion:false,
        daymasterBenefitEdgeCreated:false,
        membershipMutation:false,
        singleActorRelationEffectContractMutation:false,
        crossScopeExecutionDefined:false,
        mediationCollectiveExecutionDefined:false,
        augmentationCollectiveExecutionDefined:false,
        genericCollectiveEffectResolverDefined:false,
        independentForceUnit:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        relativeDominanceMapping:false,
        finalStrengthMapping:false,
        statement:'Collective Relation Effect v0.1 与现有 target-specific Relation Effect 合同并行，只消费已解析的 source-scoped finite actor group，并在来源明确给出“制杀”结果时建立 actor→group opposition record。该 record 以 group 为 target，不要求或伪造 member-specific function realization，也不把“扶身”另造为日主受益 edge。'
    });

    GuiJia.baziContextualForcePartyCollectiveRelationEffectContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RELATION_TYPE,
        EFFECT_STATE,
        FINITE_COLLECTIVE_EFFECT_REGISTRY,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
