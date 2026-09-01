(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyMembershipContract?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-001';

    const MEMBERSHIP_CLASSES = Object.freeze({
        DAYMASTER_SIDE:'daymaster-side-seed-candidate',
        COUNTER_SIDE_ANCHOR:'counter-side-anchor-candidate',
        CONTEXT_DEPENDENT:'context-dependent-unassigned',
        UNRESOLVED:'unresolved-affiliation'
    });

    const SOURCE_EVIDENCE_IDS = Object.freeze([
        'CF-PARTY-E05',
        'CF-PARTY-E07',
        'CF-PARTY-E09',
        'CF-PARTY-E10',
        'CF-PARTY-E13'
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-CONTRACT-001',
        version:VERSION,
        resolverScope:'direct-seed-affiliation-only',
        sourceAuditDependency:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-AUDIT-CONTRACT-001',
        membershipCandidateIsNotRealizedMember:true,
        daymasterAnchorExcludedFromMemberCount:true,
        supportMaySeedDaymasterSide:true,
        rootFoundationMaySeedDaymasterSide:true,
        directRestraintMaySeedCounterSideAnchor:true,
        drainDoesNotImplyCounterSide:true,
        distributionDoesNotImplyCounterSide:true,
        allPressureActorsDoNotFormOneParty:true,
        visibleAndHiddenCandidatesPreserved:true,
        rootAndSupportOverlapMustNotDuplicateActorIdentity:true,
        contributionRealizationIsQualifierNotMembershipIdentity:true,
        rootPresenceIsQualifierNotRootEffectiveness:true,
        crossActorAffiliationExpansionDefined:false,
        relativeDominanceDefined:false,
        partyConfigurationDefined:false,
        manyFewMappingDefined:false,
        numericAggregation:false,
        numericWeights:false,
        majorityVoting:false,
        priorityAggregation:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        statement:'Party Membership v0.1 只定义直接种子归属：比印扶助与根基可成为日主侧候选，直接克日主者可成为独立 counter-side anchor；我生与我克不能仅凭其对日主的五行方向自动归入对立党。成员存在、作用兑现与相对强弱继续分层。'
    });

    GuiJia.baziContextualForcePartyMembershipContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        MEMBERSHIP_CLASSES,
        SOURCE_EVIDENCE_IDS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
