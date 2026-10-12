(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceRecipientSealDamageCalibration?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceRecipientSealDamageCalibrationProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-RECIPIENT-SEAL-DAMAGE-CALIBRATION';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-RECIPIENT-SEAL-DAMAGE-CALIBRATION';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceSealDamageEffectScopeAudit) return base;
        const calibration = profile.buildProfile(semanticModel,base),status = calibration.finiteSourceEffectCoverageComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SSOC-CASE-01','CF-SSOC-ANN-02','CF-SSOC-IDENTITY-02','CF-SSOC-REALIZATION-02',
            'CF-SSDES-REVIEW-01','CF-RSDC-EFFECT-01','BAZI-CONTEXTUAL-FORCE-PARTY-RECIPIENT-SEAL-DAMAGE-EFFECT-CONTRACT-001']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-recipient.seal-damage-calibration',status,
            value:Object.freeze({ finiteSourceEffectCoverageComplete:calibration.finiteSourceEffectCoverageComplete,
                reusedCompleteSourceCaseCount:1,newCompleteSourceCaseCount:0,newEffectAuthorityCount:1,
                resolvedRuntimeEffectCount:calibration.resolvedRuntimeEffectCount }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SEAL-DAMAGE-EFFECT-SCOPE-AUDIT']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One independent exact-source recipient-seal-damage authority executes through actual R28/R27, a dedicated R5 source validator and bounded-scope R4 without broader damage mapping or active support-loss inference.',
            boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceRecipientSealDamageCalibration:calibration,
            contextualForcePartySourceRecipientSealDamageCalibrationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-recipient-seal-damage-calibration-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceRecipientSealDamageCalibration = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
