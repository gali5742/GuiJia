(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapterContract?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-ADAPTER-001';

    const FAMILY_KEYS = Object.freeze([
        'covering-stem-context',
        'branch-interaction-context',
        'seasonal-command-and-life-state-context',
        'branch-network-and-party-context',
        'positional-role-context',
        'directed-capacity-context'
    ]);

    const COVERAGE_STATES = Object.freeze({
        RESOLVED:'mapped-resolved-input-context',
        PARTIAL:'mapped-partial-upstream-semantic-blockers',
        UNAVAILABLE:'unavailable-required-input-context'
    });

    const FAMILY_ADAPTERS = Object.freeze({
        coveringStem:Object.freeze({
            key:'covering-stem-context',
            upstreamKinds:Object.freeze(['surface-stem-inventory','daymaster-identity','interaction-modifier','daymaster-contribution']),
            expectedSemantics:'identify the stem covering the branch and preserve any target-specific interaction/reception provenance',
            genericOutcomeResolverRequired:false
        }),
        branchInteraction:Object.freeze({
            key:'branch-interaction-context',
            upstreamKinds:Object.freeze(['branch-structure-catalog','branch-element-relation-inventory']),
            expectedSemantics:'preserve branch structural relations and ordinary branch-element relation identity separately',
            genericOutcomeResolverRequired:false
        }),
        seasonal:Object.freeze({
            key:'seasonal-command-and-life-state-context',
            upstreamKinds:Object.freeze(['counter-anchor-seasonal-context']),
            expectedSemantics:'preserve actor-specific seasonal state without mapping it to substrate quality',
            genericOutcomeResolverRequired:false
        }),
        branchNetworkParty:Object.freeze({
            key:'branch-network-and-party-context',
            upstreamKinds:Object.freeze(['membership-identity','anchor-affiliation','relation-effect','relative-dominance-context']),
            expectedSemantics:'preserve anchor-specific network and party provenance without member-count force conversion',
            genericOutcomeResolverRequired:false
        }),
        positionalRole:Object.freeze({
            key:'positional-role-context',
            upstreamKinds:Object.freeze(['pillar-position-provenance','anchor-target-role']),
            expectedSemantics:'preserve pillar/position and target role without numeric position weighting',
            genericOutcomeResolverRequired:false
        }),
        directedCapacity:Object.freeze({
            key:'directed-capacity-context',
            upstreamKinds:Object.freeze(['relation-effect','interaction-modifier','target-specific-function-semantics']),
            expectedSemantics:'preserve only target-specific realized/non-realized/blocked directed interaction semantics',
            genericOutcomeResolverRequired:false
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-ADAPTER-CONTRACT-001',
        version:VERSION,
        adapterOnly:true,
        sourceAuthority:'Branch Substrate Quality Source Audit v0.1',
        requiredFamilyCount:FAMILY_KEYS.length,
        requiredFamilyKeys:FAMILY_KEYS,
        structuralInventoryCoverageDistinctFromUpstreamSemanticCoverage:true,
        inputRecordPresenceIsSemanticResolution:false,
        sourceInputFamilyModelMayRemainResolvedWhileUpstreamCoverageIsPartial:true,
        branchStructureCatalogIsNotFullBranchInteractionCoverage:true,
        genericBranchElementRelationInventoryCurrentlyRequired:true,
        coveringStemIdentityMayBeResolvedWhileReceptionSemanticsRemainPartial:true,
        seasonalContextMayResolveWithoutQualityMapping:true,
        positionContextMayResolveWithoutNumericWeight:true,
        relationEffectGeneralizationMayBlockPartyAndDirectedCapacityFamilies:true,
        relativeDominanceMayBlockBranchNetworkPartyFamily:true,
        crossAxisComparisonDefined:false,
        automaticSubstrateQualityResolverDefined:false,
        qualityClassificationMapping:false,
        actorGlobalEffectivenessMapping:false,
        rootPresenceMapping:false,
        numericWeights:false,
        numericAggregation:false,
        scalarCollapse:false,
        thresholdMapping:false,
        majorityVoting:false,
        priorityAggregation:false,
        ranking:false,
        lastWriteWins:false,
        finalStrengthMapping:false,
        assessmentMapping:false
    });

    GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapterContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        FAMILY_KEYS,
        COVERAGE_STATES,
        FAMILY_ADAPTERS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);