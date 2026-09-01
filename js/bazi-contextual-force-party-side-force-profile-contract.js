(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySideForceProfileContract?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-001';

    const SIDE_TYPES = Object.freeze({
        DAYMASTER:'daymaster-side',
        COUNTER_ANCHOR:'counter-anchor-side'
    });

    const CONTEXT_FAMILIES = Object.freeze({
        MEMBERSHIP_IDENTITY:'membership-identity',
        SEASONAL_STANDING:'seasonal-standing-context',
        FOUNDATION:'root-and-foundation-context',
        RELATION_EFFECT:'directed-relation-effect-context',
        VISIBLE_HIDDEN:'visible-hidden-context',
        INTERACTION:'resolved-interaction-context',
        POSITION:'position-and-whole-chart-context'
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-CONTRACT-001',
        version:VERSION,
        sourceAuditDependency:'BAZI-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT-CONTRACT-001',
        profileIsQualitativeInventory:true,
        sideRelative:true,
        oneCounterAnchorPerSideProfile:true,
        multipleCounterAnchorsDoNotAutoMerge:true,
        daymasterAnchorIsNotMember:true,
        directSeedMembershipPreserved:true,
        anchorSpecificAffiliationPreservedSeparately:true,
        affiliationDoesNotBecomeGlobalMembership:true,
        oppositionDoesNotCreateMembership:true,
        mediationDoesNotCreateMembership:true,
        relationEffectIdentityPreserved:true,
        relationEffectNotIndependentForceUnit:true,
        realizedModifierIdentityPreserved:true,
        nonRealizationIsNotReverseForce:true,
        seasonalStandingNotCopiedAcrossSides:true,
        daymasterSeasonalStandingMayBeGlobalReference:true,
        counterAnchorSeasonalStandingResolverDefined:false,
        counterAnchorFoundationResolverDefined:false,
        foundationPresenceNotEffectiveness:true,
        visibleHiddenScopeNotEqualWeight:true,
        positionIsContextNotWeight:true,
        actorGlobalEffectivenessRequired:false,
        memberCountDefined:false,
        activeMemberCountDefined:false,
        relationEffectCountAsForce:false,
        scalarCollapse:false,
        numericAggregation:false,
        numericWeights:false,
        majorityVoting:false,
        priorityAggregation:false,
        ranking:false,
        relativeDominanceMapping:false,
        partyConfigurationMapping:false,
        finalStrengthMapping:false,
        finalAssessmentMapping:false,
        statement:'Side Force Profile v0.1 只把已存在的 side identity、季节背景、根基、anchor-specific relation effect、明暗、interaction 与位置 provenance 组织成可审计的定性侧面档案。它不把不同来源折成力量单位，不合并多个 counter anchor，也不输出双方强弱比较。'
    });

    GuiJia.baziContextualForcePartySideForceProfileContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SIDE_TYPES,
        CONTEXT_FAMILIES,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
