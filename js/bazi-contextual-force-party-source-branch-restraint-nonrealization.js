(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchRestraintNonrealization?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceBranchRestraintNonrealizationProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-RESTRAINT-NONREALIZATION';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-RESTRAINT-NONREALIZATION';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceMediationNoncommunication) return base;
        const review = profile.buildProfile(semanticModel,base),status = review.finiteSourceReviewComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SBMC-CASE-01','CF-SBRN-ANN-01','CF-SBRN-IDENTITY-01','CF-SBRN-CONTEXT-01','CF-SBRN-REALIZATION-01','CF-SBRN-EXCLUDED-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-branch.restraint-nonrealization',status,
            value:Object.freeze({ finiteSourceReviewComplete:review.finiteSourceReviewComplete,reusedCompleteSourceCaseCount:1,
                newCompleteSourceCaseCount:0,reviewedRelationCount:1,newEffectAuthorityCount:0 }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-MEDIATION-NONCOMMUNICATION']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One independently reviewed 不克火 branch assertion, with unique 子→午 identity and actual 卯 wood context, is consumed by normalization/R3/R4 as not-realized restraint; R24 mediation and source clash context remain separate.',
            boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceBranchRestraintNonrealization:review,
            contextualForcePartySourceBranchRestraintNonrealizationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-branch-restraint-nonrealization-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceBranchRestraintNonrealization = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
