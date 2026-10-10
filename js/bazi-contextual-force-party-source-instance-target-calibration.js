(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceInstanceTargetCalibration?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceInstanceTargetCalibrationProfile;
    const prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION, RULE_ID, CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-INSTANCE-TARGET-CALIBRATION';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-INSTANCE-TARGET-CALIBRATION';
    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourcePathTargetAnnotation) return base;
        const audit = profile.buildProfile(semanticModel,base);
        const status = audit.finiteSourceIdentityCoverageComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SITC-CASE-01','CF-SITC-ANN-01','CF-SITC-IDENTITY-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({
            id:CLAIM_ID,ruleId:RULE_ID,claimKey:'strength.contextual-force.party.source-instance.target-calibration',status,
            value:Object.freeze({ finiteSourceIdentityCoverageComplete:audit.finiteSourceIdentityCoverageComplete,
                targetIdentityCalibrationIntroduced:true,positiveEffectCalibrationIntroduced:false,transferredR11TargetCount:0 }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary
        })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({
            id:DEPENDENCY_ID,ruleId:RULE_ID,kind:'source-coverage',scope:CONTRACT.calibrationScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-CONTRACT']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One complete source case supplies a reviewed visible hour-target identity; current-chart inventory gates feed the existing normalized target contract and generic single-actor kernel.',
            boundary:CONTRACT.boundary
        })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,
            contextualForcePartySourceInstanceTargetCalibration:audit,
            contextualForcePartySourceInstanceTargetCalibrationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...(base.boundaries || []),CONTRACT.boundary]) });
    };
    prior.registerExtension('contextual-force-party-source-instance-target-calibration-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceInstanceTargetCalibration = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
