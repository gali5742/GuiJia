(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceMediationNoncommunication?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceMediationNoncommunicationProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-MEDIATION-NONCOMMUNICATION';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-MEDIATION-NONCOMMUNICATION';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceBranchMediationCalibration) return base;
        const review = profile.buildProfile(semanticModel,base),status = review.finiteSourceReviewComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SMNC-CASE-01','CF-SMNC-ANN-01','CF-SMNC-IDENTITY-01','CF-SMNC-REALIZATION-01','CF-SMNC-EXCLUDED-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-mediation.noncommunication',status,
            value:Object.freeze({ finiteSourceReviewComplete:review.finiteSourceReviewComplete,reusedCompleteSourceCaseCount:0,
                newCompleteSourceCaseCount:1,reviewedRelationCount:1,newEffectAuthorityCount:0 }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-MEDIATION-CALIBRATION']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One new natal source explicitly denies communication for the independently reviewed month-visible killer→year-visible seal path; actual normalization/R3/R4 preserve not-realized without branch-negative transfer, generation denial or a reverse effect.',
            boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceMediationNoncommunication:review,
            contextualForcePartySourceMediationNoncommunicationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-mediation-noncommunication-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceMediationNoncommunication = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
