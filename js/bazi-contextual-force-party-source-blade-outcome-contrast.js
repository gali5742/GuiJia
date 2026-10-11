(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBladeOutcomeContrast?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceBladeOutcomeContrastProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-OUTCOME-CONTRAST',DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-OUTCOME-CONTRAST';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceBladeRelationRealization) return base;
        const calibration = profile.buildProfile(semanticModel,base),status = calibration.finiteSourceReviewComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SBOC-CASE-01','CF-SBOC-CASE-02','CF-SBOC-DEF-01','CF-SBOC-REVIEW-01','CF-SBOC-REVIEW-02','CF-SBOC-REVIEW-03','CF-SBOC-CONFIG-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-blade.outcome-contrast',status,
            value:Object.freeze({ finiteSourceReviewComplete:calibration.finiteSourceReviewComplete,
                sourceCaseCount:2,reviewedRelationCount:3,newEffectAuthorityCount:0,positiveEffectCount:0 }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-RELATION-REALIZATION']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'Two exact natal sources distinguish failed restraint, realized blade barrier, failed configuration formation and unresolved two-Wu clash attribution through actual R3/R4 consumers.',boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceBladeOutcomeContrast:calibration,
            contextualForcePartySourceBladeOutcomeContrastRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-blade-outcome-contrast-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceBladeOutcomeContrast = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
