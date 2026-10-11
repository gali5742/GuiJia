(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceOfficerKillerNonrealization?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceOfficerKillerNonrealizationProfile;
    const prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-NONREALIZATION';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-NONREALIZATION';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceOfficerKillerEffectCalibration) return base;
        const audit = profile.buildProfile(semanticModel,base),status = audit.finiteNegativeSourceCoverageComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SOKNR-CASE-01','CF-SOKNR-ANN-01','CF-SOKNR-IDENTITY-01','CF-SOKNR-REALIZATION-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({
            id:CLAIM_ID,ruleId:RULE_ID,claimKey:'strength.contextual-force.party.source-officer-killer.nonrealization',status,
            value:Object.freeze({ finiteNegativeSourceCoverageComplete:audit.finiteNegativeSourceCoverageComplete,
                negativeSourceCaseCount:1,positiveEffectLicenseCreated:false,genericCombinationResolverDefined:false }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary
        })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({
            id:DEPENDENCY_ID,ruleId:RULE_ID,kind:'source-coverage',scope:CONTRACT.calibrationScope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-EFFECT-CALIBRATION',
                'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-CONTRACT','SD-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-CONTRACT']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'One complete independent source case explicitly denies original officer-to-killer assistance; the generic kernel preserves not-realized without an effect license, reverse effect or transformed actor.',
            boundary:CONTRACT.boundary
        })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartySourceOfficerKillerNonrealization:audit,
            contextualForcePartySourceOfficerKillerNonrealizationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...(base.boundaries || []),CONTRACT.boundary]) });
    };
    prior.registerExtension('contextual-force-party-source-officer-killer-nonrealization-v01',extendSynthesis);
    GuiJia.baziContextualForcePartySourceOfficerKillerNonrealization = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
