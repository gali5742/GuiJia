(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAudit?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAuditProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-SEAL-DAMAGE-EFFECT-SCOPE-AUDIT';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SEAL-DAMAGE-EFFECT-SCOPE-AUDIT';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceSealObstructionContrast) return base;
        const review = profile.buildProfile(semanticModel,base),status = review.finiteSourceReviewComplete ? 'resolved' : 'unresolved';
        const evidenceIds = GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAuditContract.EFFECT_SCOPE_REVIEW.sourceEvidenceIds;
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-seal.damage-effect-scope-audit',status,
            value:Object.freeze({ finiteSourceReviewComplete:review.finiteSourceReviewComplete,reusedCompleteSourceCaseCount:1,
                newCompleteSourceCaseCount:0,reviewedOppositionAuthorityScopeCount:2,newEffectAuthorityCount:0 }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SEAL-OBSTRUCTION-CONTRAST']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'Finite audit verifies R27 realized-unmapped branch damage, actual support-seed recipient evidence and registered opposition authority scopes; an independent recipient-relative damage effect license remains missing.',
            boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceSealDamageEffectScopeAudit:review,
            contextualForcePartySourceSealDamageEffectScopeAuditRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-seal-damage-effect-scope-audit-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAudit = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
