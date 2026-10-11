(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceSealObstructionContrast?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceSealObstructionContrastProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-SEAL-OBSTRUCTION-CONTRAST';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SEAL-OBSTRUCTION-CONTRAST';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceBranchRestraintNonrealization) return base;
        const review = profile.buildProfile(semanticModel,base),status = review.finiteSourceReviewComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SSOC-CASE-01','CF-SSOC-ANN-01','CF-SSOC-IDENTITY-01','CF-SSOC-REALIZATION-01',
            'CF-SSOC-ANN-02','CF-SSOC-IDENTITY-02','CF-SSOC-REALIZATION-02','CF-SSOC-CONFIG-01','CF-SSOC-DEFERRED-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-seal.obstruction-contrast',status,
            value:Object.freeze({ finiteSourceReviewComplete:review.finiteSourceReviewComplete,reusedCompleteSourceCaseCount:0,
                newCompleteSourceCaseCount:1,reviewedRelationCount:2,reviewedConfigurationCount:1,newEffectAuthorityCount:0 }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-RESTRAINT-NONREALIZATION']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One new natal source separates failed visible communication, realized-unmapped named branch damage and non-actionable whole-chart communication failure through actual inventory/normalization/R3/R4; no automatic negative branch mediation path follows.',
            boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceSealObstructionContrast:review,
            contextualForcePartySourceSealObstructionContrastRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-seal-obstruction-contrast-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceSealObstructionContrast = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
