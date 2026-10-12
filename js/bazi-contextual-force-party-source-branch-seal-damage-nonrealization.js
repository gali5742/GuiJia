(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchSealDamageNonrealization?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceBranchSealDamageNonrealizationProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-SEAL-DAMAGE-NONREALIZATION';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-SEAL-DAMAGE-NONREALIZATION';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceRecipientSealDamageCalibration) return base;
        const review = profile.buildProfile(semanticModel,base),status = review.finiteSourceReviewComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SBSDN-CASE-01','CF-SBSDN-ANN-01','CF-SBSDN-IDENTITY-01','CF-SBSDN-CONTEXT-01','CF-SBSDN-REALIZATION-01','CF-SBSDN-EXCLUDED-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-branch.seal-damage-nonrealization',status,
            value:Object.freeze({ finiteSourceReviewComplete:review.finiteSourceReviewComplete,reusedCompleteSourceCaseCount:0,
                newCompleteSourceCaseCount:1,reviewedRelationCount:1,newEffectAuthorityCount:0 }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-RECIPIENT-SEAL-DAMAGE-CALIBRATION']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One new natal source names 亥→巳 seal damage and explicitly denies 巳 damage in printed timing/qi context. Actual inventory/normalization/R3/R4 consume not-realized; printed clash, other paths and R29 positive earth-recipient authorization stay separate.',
            boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceBranchSealDamageNonrealization:review,
            contextualForcePartySourceBranchSealDamageNonrealizationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-branch-seal-damage-nonrealization-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceBranchSealDamageNonrealization = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
