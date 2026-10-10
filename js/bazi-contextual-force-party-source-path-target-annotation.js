(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePathTargetAnnotation?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourcePathTargetAnnotationProfile;
    const prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION, RULE_ID, CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-TARGET-ANNOTATION';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-TARGET-ANNOTATION';
    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourcePathParticipantBinding) return base;
        const audit = profile.buildProfile(semanticModel, base);
        const status = audit.finiteSourceTargetAnnotationCoverageComplete && audit.runtimeValidation.valid ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(audit.sourceReviews.map((r) => r.annotationId).filter(Boolean));
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID), Object.freeze({
            id:CLAIM_ID, ruleId:RULE_ID, claimKey:'strength.contextual-force.party.source-path.target-annotation', status,
            value:Object.freeze({ finiteSourceTargetAnnotationCoverageComplete:audit.finiteSourceTargetAnnotationCoverageComplete,
                instanceIdentityAuthorityCount:0, targetIdentityResolverDefined:false }),
            sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:evidenceIds, boundary:CONTRACT.boundary
        })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID), Object.freeze({
            id:DEPENDENCY_ID, ruleId:RULE_ID, kind:'source-coverage', scope:CONTRACT.annotationScope, status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-PARTICIPANT-BINDING','SD-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-CONTRACT']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:evidenceIds,
            statement:'Six registered conditional source-rule target units normalize and resolve through the existing generic kernel as role targets; none authorizes an instance target identity or scope.',
            boundary:CONTRACT.boundary
        })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base, claims, dependencies, conflicts,
            contextualForcePartySourcePathTargetAnnotation:audit,
            contextualForcePartySourcePathTargetAnnotationRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...(base.boundaries || []), CONTRACT.boundary])
        });
    };
    prior.registerExtension('contextual-force-party-source-path-target-annotation-v01', extendSynthesis);
    GuiJia.baziContextualForcePartySourcePathTargetAnnotation = Object.freeze({ installed:true, VERSION, RULE_ID, CONTRACT, extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
