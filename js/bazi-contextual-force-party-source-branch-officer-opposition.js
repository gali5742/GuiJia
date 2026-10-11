(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchOfficerOpposition?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceBranchOfficerOppositionProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-OFFICER-OPPOSITION';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-OFFICER-OPPOSITION';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceBladeOutcomeContrast) return base;
        const calibration = profile.buildProfile(semanticModel,base),status = calibration.finiteSourceEffectCoverageComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SBOO-CASE-01','CF-SBOO-ANN-01','CF-SBOO-IDENTITY-01','CF-SBOO-REALIZATION-01','CF-SBOO-EFFECT-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-branch.officer-opposition',status,
            value:Object.freeze({ finiteSourceEffectCoverageComplete:calibration.finiteSourceEffectCoverageComplete,
                positiveSourceCaseCount:1,comparisonCaseCount:1,newEffectAuthorityCount:1,resolvedRuntimeEffectCount:calibration.resolvedRuntimeEffectCount }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-OUTCOME-CONTRAST']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One exact natal source independently licenses qualitative branch opposition through actual inventory, target normalization/R3, registered R5 validation and R4; the Chen comparison and Zi-Shen clause inherit no authority.',
            boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceBranchOfficerOpposition:calibration,
            contextualForcePartySourceBranchOfficerOppositionRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-branch-officer-opposition-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceBranchOfficerOpposition = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
