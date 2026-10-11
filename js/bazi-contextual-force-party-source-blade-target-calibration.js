(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBladeTargetCalibration?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceBladeTargetCalibrationProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-TARGET-CALIBRATION',DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-TARGET-CALIBRATION';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyTransformationResultIdentity) return base;
        const calibration = profile.buildProfile(semanticModel,base),status = calibration.finiteSourceIdentityCoverageComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SBTC-CASE-01','CF-SBTC-CASE-02','CF-SBTC-CASE-03','CF-SBTC-DEF-01','CF-SBTC-ANN-01',
            'CF-SBTC-IDENTITY-01','CF-SBTC-IDENTITY-02','CF-SBTC-IDENTITY-03']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.source-blade.target-calibration',status,
            value:Object.freeze({ finiteSourceIdentityCoverageComplete:calibration.finiteSourceIdentityCoverageComplete,
                sourceCaseCount:3,relationTargetSourceCaseCount:1,transferredR17TargetCount:0,newMaterializationAuthorityCount:0,newEffectAuthorityCount:0 }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'source-coverage',scope:CONTRACT.calibrationScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-TRANSFORMATION-RESULT-IDENTITY-CONTRACT']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'Three complete source cases establish reviewed month/day/year blade locations; only two actual month-blade relation targets enter R3. No authority transfers to the two-Wu transformation case.',boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceBladeTargetCalibration:calibration,
            contextualForcePartySourceBladeTargetCalibrationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-source-blade-target-calibration-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceBladeTargetCalibration = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
