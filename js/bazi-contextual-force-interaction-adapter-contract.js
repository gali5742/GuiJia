(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForceInteractionAdapterContract?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-001';

    const INPUT_FAMILIES = Object.freeze({
        rootClash:Object.freeze({
            id:'root-clash-interaction-effect',
            sourceField:'rootClashInteractionEffectRecords',
            recordRole:'primary-modifier',
            acceptedResolvedStatus:'resolved-interaction-semantics',
            unresolvedKnownInteractionBlocksCoverage:true,
            structurePresenceAloneAccepted:false
        }),
        stemBearing:Object.freeze({
            id:'stem-bearing-source-outcome',
            sourceField:'semanticModel.stemBearingEffect.records',
            recordRole:'primary-modifier-when-interaction-specific',
            acceptedResolvedStatus:'resolved-source-bearing-outcome',
            acceptedInteractionStates:Object.freeze([
                'source-bearing-fortified-by-support',
                'source-bearing-damaged-by-clash'
            ]),
            excludedResolvedStates:Object.freeze(['source-not-carried-as-if-absent']),
            genericUnresolvedBearingBlocksCoverage:false
        }),
        crossVisibleFunction:Object.freeze({
            id:'cross-visible-function-realization',
            sourceField:'visibleStemFunctionRealizationRecords',
            recordRole:'edge-specific-modifier-or-non-realization',
            requiredRelationScope:'cross-visible-actor',
            realizedState:'realized-in-source-context',
            notRealizedState:'not-realized-in-source-context',
            unresolvedKnownInteractionBlocksCoverage:true,
            daymasterRelatedEdgesExcluded:true
        }),
        actorProfileQualifier:Object.freeze({
            id:'actor-profile-interpretation-qualifier',
            sourceField:'visibleStemActorProfileInterpretationRecords',
            recordRole:'qualifier-only',
            acceptedResolvedStatus:'resolved-exact-source-profile-interpretation',
            createsIndependentModifier:false,
            unresolvedQualifierBlocksCoverage:false
        })
    });

    const CONTRACT = Object.freeze({
        id:'CONTEXTUAL-FORCE-INTERACTION-ADAPTER-CONTRACT-001',
        version:VERSION,
        ruleId:RULE_ID,
        outputAxis:'interactionModifier',
        inputFamilyIds:Object.freeze(Object.values(INPUT_FAMILIES).map((item) => item.id)),
        whitelistOnly:true,
        structurePresenceCreatesModifier:false,
        sourceContextOutcomeRequired:true,
        actorOrFunctionTargetRequired:true,
        daymasterRelatedFunctionEdgesExcludedFromInteractionAxis:true,
        crossVisibleRealizedEdgeMayCreateModifier:true,
        crossVisibleNotRealizedEdgeStoredAsNonRealization:true,
        rootClashResolvedSemanticsPreservedWithoutGlobalEffectiveness:true,
        bearingFortifiedOrDamagedMayCreateModifier:true,
        sourceNotCarriedBearingExcludedFromInteractionAxis:true,
        actorProfileInterpretationQualifierOnly:true,
        qualifierCreatesIndependentModifier:false,
        unresolvedKnownInteractionMayBlockCoverage:true,
        genericUnresolvedBearingDoesNotBlockCoverage:true,
        actorGlobalEffectiveState:false,
        rootGlobalEffectiveState:false,
        numericAggregation:false,
        numericWeights:false,
        scalarForce:false,
        majorityVoting:false,
        priorityAggregation:false,
        orderOverwrite:false,
        partyConfigurationMapping:false,
        capacityInterpretationMapping:false,
        manyFewMapping:false,
        finalStrengthMapping:false,
        statement:'Interaction Force Adapter 只接入已经有明确 actor/function target 且已有 source-context outcome 的交互语义。Structure presence 本身不产生 modifier；daymaster-related function edge 已由 support/restraint/drain/distribution 轴承担，不在 interactionModifier 重复记录。',
        boundary:'root clash、bearing 与 cross-visible function 的已解析结果只保留各自上游语义；不得压成 effective/ineffective、数值力量、党众/势孤、多/少或最终身强弱。Actor Profile Interpretation 只作为 qualifier 附着，不制造第二份独立力量证据。'
    });

    GuiJia.baziContextualForceInteractionAdapterContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        INPUT_FAMILIES,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
