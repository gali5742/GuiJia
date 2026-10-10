(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRegisteredMotifAuthorizationMatcher?.installed) return;
    const profile = GuiJia.baziContextualForcePartyRegisteredMotifAuthorizationMatcherProfile;
    const prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION, RULE_ID, CONTRACT } = profile;
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-REGISTERED-MOTIF-AUTHORIZATION-MATCHER';
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-REGISTERED-MOTIF-AUTHORIZATION-MATCHER';
    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit) return base;
        const audit = profile.buildProfile(semanticModel, base);
        const claims = Object.freeze([
            ...(base.claims || []).filter((item) => item.id !== CLAIM_ID),
            Object.freeze({
                id:CLAIM_ID, ruleId:RULE_ID,
                claimKey:'strength.contextual-force.party.relation-effect.registered-motif-authorization-matcher',
                status:'resolved',
                value:Object.freeze({ matcherDefined:true, globalResolverDefined:false, positiveSourceCalibrationIntroduced:false }),
                sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]),
                sourceRegistryEvidenceIds:Object.freeze([]),
                boundary:CONTRACT.boundary
            })
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => item.id !== DEPENDENCY_ID),
            Object.freeze({
                id:DEPENDENCY_ID, ruleId:RULE_ID, kind:'rule-coverage',
                scope:'exact-source-cross-visible-registered-motif-matcher-contract', status:'resolved',
                dependsOnDependencyIds:Object.freeze([
                    'SD-CONTEXTUAL-FORCE-PARTY-EFFECT-TYPE-AUTHORIZATION-SOURCE-CAPABILITY-AUDIT',
                    'SD-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT-CONTRACT'
                ]),
                resolvedByClaimIds:Object.freeze([CLAIM_ID]),
                sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:Object.freeze([]),
                statement:'R7 defines a finite registered-motif matcher feeding R5 normalization and R4 execution; coverage and source calibration remain separate.',
                boundary:CONTRACT.boundary
            })
        ]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({
            ...base, claims, dependencies, conflicts,
            contextualForcePartyRegisteredMotifAuthorizationMatcher:audit,
            contextualForcePartyRegisteredMotifAuthorizationMatcherRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...(base.boundaries || []), CONTRACT.boundary])
        });
    };
    prior.registerExtension('contextual-force-party-registered-motif-authorization-matcher-v01', extendSynthesis);
    GuiJia.baziContextualForcePartyRegisteredMotifAuthorizationMatcher = Object.freeze({
        installed:true, VERSION, RULE_ID, CONTRACT, extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
