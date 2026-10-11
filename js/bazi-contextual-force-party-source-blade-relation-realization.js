(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBladeRelationRealization?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceBladeRelationRealizationProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-RELATION-REALIZATION',DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-RELATION-REALIZATION';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceBladeTargetCalibration) return base;
        const calibration = profile.buildProfile(semanticModel,base),status = calibration.finiteSourceReviewComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SBTC-CASE-01','CF-SBTC-ANN-01','CF-SBTC-IDENTITY-01','CF-SBRR-CONTEXT-01',
            'CF-SBRR-REVIEW-01','CF-SBRR-REVIEW-02','CF-SBRR-REALIZATION-01','CF-SBRR-REALIZATION-02','CF-SBRR-OUTCOME-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-blade.relation-realization',status,
            value:Object.freeze({ finiteSourceReviewComplete:calibration.finiteSourceReviewComplete,
                sourceCaseCount:1,reviewedRelationCount:2,newEffectAuthorityCount:0,positiveEffectCount:0 }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-TARGET-CALIBRATION']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'Two exact natal clauses establish directed source-context realizations; actual R3 targets enter R4 as realized but unmapped. Joint weakness grants no per-path license.',boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceBladeRelationRealization:calibration,
            contextualForcePartySourceBladeRelationRealizationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-blade-relation-realization-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceBladeRelationRealization = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
