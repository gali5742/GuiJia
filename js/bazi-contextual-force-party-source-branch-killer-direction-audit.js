(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchKillerDirectionAudit?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceBranchKillerDirectionAuditProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-KILLER-DIRECTION-AUDIT';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-KILLER-DIRECTION-AUDIT';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceBranchOfficerOpposition) return base;
        const audit = profile.buildProfile(semanticModel,base),status = audit.finiteSourceReviewComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SBOO-CASE-01','CF-SBKDA-ANN-01','CF-SBKDA-IDENTITY-01','CF-SBKDA-REALIZATION-01','CF-SBKDA-DIRECTION-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-branch.killer-direction-audit',status,
            value:Object.freeze({ finiteSourceReviewComplete:audit.finiteSourceReviewComplete,reusedCompleteSourceCaseCount:1,
                newCompleteSourceCaseCount:0,reviewedRelationCount:1,newEffectAuthorityCount:0 }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-OFFICER-OPPOSITION']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One independently reviewed Zi→Shen clause is consumed by actual inventory/normalization/R3/R4 as realized-unmapped; structural Shen→Zi generation and the existing killer→seal motif grant no reversed executable edge or effect license.',
            boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceBranchKillerDirectionAudit:audit,
            contextualForcePartySourceBranchKillerDirectionAuditRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-branch-killer-direction-audit-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceBranchKillerDirectionAudit = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
