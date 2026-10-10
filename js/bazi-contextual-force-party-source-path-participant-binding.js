(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePathParticipantBinding?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourcePathParticipantBindingProfile;
    const prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION, RULE_ID, CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-PARTICIPANT-BINDING';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-PARTICIPANT-BINDING';
    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourcePositionPathConditionMatcher) return base;
        const audit = profile.buildProfile(semanticModel, base);
        const status = audit.finiteBindingCoverageComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-CRP-REC-01','CF-CRP-REC-02','CF-CRP-REC-03','CF-RPP-REC-01','CF-RPP-REC-03']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID), Object.freeze({
            id:CLAIM_ID, ruleId:RULE_ID, claimKey:'strength.contextual-force.party.source-path.participant-binding', status,
            value:Object.freeze({ finiteBindingCoverageComplete:audit.finiteBindingCoverageComplete,
                targetIdentityResolverDefined:false, participantBindingEqualsRealization:false }),
            sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:evidenceIds, boundary:CONTRACT.boundary
        })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID), Object.freeze({
            id:DEPENDENCY_ID, ruleId:RULE_ID, kind:'rule-coverage', scope:CONTRACT.bindingScope, status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PATH-CONDITION-MATCHER']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:evidenceIds,
            statement:'Six registered path descriptors consume four exact R11 condition results; matched order paths bind only source-mentioned visible source/intermediate actors and retain unresolved targets.',
            boundary:CONTRACT.boundary
        })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base, claims, dependencies, conflicts,
            contextualForcePartySourcePathParticipantBinding:audit,
            contextualForcePartySourcePathParticipantBindingRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...(base.boundaries || []), CONTRACT.boundary])
        });
    };
    prior.registerExtension('contextual-force-party-source-path-participant-binding-v01', extendSynthesis);
    GuiJia.baziContextualForcePartySourcePathParticipantBinding = Object.freeze({ installed:true, VERSION, RULE_ID, CONTRACT, extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
