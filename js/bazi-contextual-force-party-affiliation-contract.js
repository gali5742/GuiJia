(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyAffiliationContract?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-AFFILIATION-001';

    const AFFILIATION_STATES = Object.freeze({
        AFFILIATED:'affiliated-to-anchor-in-source-context',
        NOT_AFFILIATED_THROUGH_EDGE:'not-affiliated-through-this-edge',
        UNRESOLVED_THROUGH_EDGE:'unresolved-affiliation-through-edge'
    });

    const MOTIFS = Object.freeze([
        Object.freeze({
            id:'CF-PA-MOTIF-WEALTH-GENERATES-OFFICER-001',
            sourceEvidenceIds:Object.freeze(['CF-PARTY-E09','CF-PARTY-E10']),
            sourceTenGods:Object.freeze(['正财','偏财']),
            targetTenGods:Object.freeze(['正官','七杀']),
            targetMembershipClass:'counter-side-anchor-candidate',
            functionType:'generation',
            semanticRole:'context-dependent-wealth-supports-specific-officer-anchor',
            statement:'“官星虽寡，得财星扶则强”只授权：当财星 actor 对具体官／杀 counter anchor 的 generation edge 已有 source-context realization 时，才可解释该财星在这一 target context 中归附并扶助该 anchor。'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-AFFILIATION-CONTRACT-001',
        version:VERSION,
        resolverScope:'source-backed-anchor-specific-realized-edge-affiliation',
        motifCount:MOTIFS.length,
        sourcePatternRequired:true,
        existingEdgeRequired:true,
        edgeMustBeTargetSpecific:true,
        realizedEdgeMayCreateAffiliation:true,
        notRealizedEdgeCreatesOnlyNonAffiliation:true,
        unresolvedEdgeCreatesBlocker:true,
        missingEdgeDoesNotInventRelation:true,
        affiliationIsAnchorSpecific:true,
        affiliationIsSourceContextSpecific:true,
        affiliationIsNotActorGlobalParty:true,
        affiliationIsNotForceMagnitude:true,
        daymasterRelatedEdgesExcluded:true,
        transitiveClosure:false,
        enemyOfEnemyShortcut:false,
        reverseAffiliationFromFailure:false,
        activeMemberCountDefined:false,
        relativeDominanceDefined:false,
        partyConfigurationDefined:false,
        genericRuleFamilyCoverageComplete:false,
        uncoveredMotifFamilies:Object.freeze(['食伤制官杀','印化杀及其他跨 actor 归附/制衡关系']),
        numericAggregation:false,
        numericWeights:false,
        majorityVoting:false,
        priorityAggregation:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        statement:'Party Affiliation v0.1 只消费已经存在、target-specific 且有 source-context realization 的 cross-actor edge；当前仅登记“财生官”一条来源明确的 affiliation motif。未兑现不反向归党，未识别 edge 不凭五行关系补造，且不进行传递闭包。'
    });

    GuiJia.baziContextualForcePartyAffiliationContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        AFFILIATION_STATES,
        MOTIFS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
