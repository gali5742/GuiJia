(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyTransformationResultIdentity?.installed) return;
    const profile = GuiJia.baziContextualForcePartyTransformationResultIdentityProfile,prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION,RULE_ID,CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-TRANSFORMATION-RESULT-IDENTITY-CONTRACT';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-TRANSFORMATION-RESULT-IDENTITY-CONTRACT';
    const extendSynthesis = (semanticModel = {},base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyTransformedSourceBladeIdentityAudit) return base;
        const identity = profile.buildProfile(semanticModel,base),status = identity.schemaContractDefined ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-SOKNR-CASE-01','CF-TSBI-TRANSFORM-01','CF-TSBI-RESULT-01','CF-TRIC-INPUT-01','CF-TRIC-OPERATION-01']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID),Object.freeze({ id:CLAIM_ID,ruleId:RULE_ID,
            claimKey:'strength.contextual-force.party.transformation-result.identity-contract',status,
            value:Object.freeze({ schemaContractDefined:identity.schemaContractDefined,registeredMaterializationAuthorityCount:0,executableSourceIdentityResolved:false }),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,boundary:CONTRACT.boundary })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID),Object.freeze({ id:DEPENDENCY_ID,ruleId:RULE_ID,
            kind:'contract',scope:CONTRACT.scope,status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-TRANSFORMED-SOURCE-BLADE-IDENTITY-AUDIT']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]),sourceRefs:Object.freeze([]),sourceRegistryEvidenceIds:evidenceIds,
            statement:'Linked operation/result provenance schema and independent materialization gates are defined; runtime source endpoint, blade target, realization and effect authorization remain unresolved.',boundary:CONTRACT.boundary })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartyTransformationResultIdentity:identity,
            contextualForcePartyTransformationResultIdentityRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies,conflicts,activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...new Set([...(base.boundaries || []),CONTRACT.boundary])]) });
    };
    prior.registerExtension('contextual-force-party-transformation-result-identity-v01',extendSynthesis);
    GuiJia.baziContextualForcePartyTransformationResultIdentity = Object.freeze({ installed:true,VERSION,RULE_ID,CONTRACT,extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
