(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceOfficerKillerEffectCalibration?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceOfficerKillerEffectCalibrationProfile;
    const prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-EFFECT-CALIBRATION';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-EFFECT-CALIBRATION';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceInstanceTargetCalibration) return base;
        const audit = profile.buildProfile(semanticModel,base);
        const status = audit.finiteSourceEffectCoverageComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SITC-CASE-01','CF-SITC-IDENTITY-01','CF-SOKEC-REALIZATION-01','CF-SOKEC-EFFECT-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({
            id:CLAIM_ID,ruleId:RULE_ID,claimKey:'strength.contextual-force.party.source-officer-killer.effect-calibration',status,
            value:Object.freeze({ finiteSourceEffectCoverageComplete:audit.finiteSourceEffectCoverageComplete,
                positiveSourceCaseCount:1,genericPeerEffectMappingDefined:false }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary
        })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({
            id:DEPENDENCY_ID,ruleId:RULE_ID,kind:'source-coverage',scope:CONTRACT.calibrationScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-INSTANCE-TARGET-CALIBRATION',
                'SD-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT-CONTRACT',
                'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-CONTRACT']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One separately reviewed exact natal actor-pair outcome supplies realization and augmentation authority consumed through R5 normalization and R4 execution.',
            boundary:CONTRACT.boundary
        })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,
            contextualForcePartySourceOfficerKillerEffectCalibration:audit,
            contextualForcePartySourceOfficerKillerEffectCalibrationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...(base.boundaries || []),CONTRACT.boundary]) });
    };
    prior.registerExtension('contextual-force-party-source-officer-killer-effect-calibration-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceOfficerKillerEffectCalibration = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
