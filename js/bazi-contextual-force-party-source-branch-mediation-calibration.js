(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchMediationCalibration?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceBranchMediationCalibrationProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-MEDIATION-CALIBRATION';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-MEDIATION-CALIBRATION';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceBranchKillerDirectionAudit) return base;
        const calibration = profile.buildProfile(semanticModel,base),status = calibration.finiteSourceEffectCoverageComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SBMC-CASE-01','CF-SBMC-ANN-01','CF-SBMC-IDENTITY-01','CF-SBMC-REALIZATION-01','CF-SBMC-EFFECT-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-branch.mediation-calibration',status,
            value:Object.freeze({ finiteSourceEffectCoverageComplete:calibration.finiteSourceEffectCoverageComplete,
                positiveSourceCaseCount:1,reusedCompleteSourceCaseCount:1,newCompleteSourceCaseCount:0,newEffectAuthorityCount:1,resolvedRuntimeEffectCount:calibration.resolvedRuntimeEffectCount }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.reviewScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-KILLER-DIRECTION-AUDIT']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One independently reviewed explicit branch scope in the reused R9 natal case licenses qualitative Zi-to-Mao mediation through actual inventory/normalization/R3, separate R5 source validation and R4. Visible and hidden endpoints and R23 inherit no authority.',
            boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceBranchMediationCalibration:calibration,
            contextualForcePartySourceBranchMediationCalibrationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-branch-mediation-calibration-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceBranchMediationCalibration = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
