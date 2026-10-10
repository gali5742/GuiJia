(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePositionPathConditionMatcher?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherProfile;
    const prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION, RULE_ID, CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PATH-CONDITION-MATCHER';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PATH-CONDITION-MATCHER';
    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourcePositionProvenanceConsumer) return base;
        const audit = profile.buildProfile(semanticModel, base);
        const status = audit.finiteLinkCoverageComplete ? 'resolved' : 'unresolved';
        const evidenceIds = Object.freeze(['CF-CRP-REC-01','CF-CRP-REC-02','CF-CRP-REC-03','CF-RPP-REC-01','CF-RPP-REC-03']);
        const claims = Object.freeze([...(base.claims || []).filter((c) => c.id !== CLAIM_ID), Object.freeze({
            id:CLAIM_ID, ruleId:RULE_ID, claimKey:'strength.contextual-force.party.source-position-path.condition-matcher', status,
            value:Object.freeze({ finiteLinkCoverageComplete:audit.finiteLinkCoverageComplete, sourceOrderConditionMatcherDefined:true,
                sourceProximityConditionMatcherDefined:false, genericPositionResolverDefined:false }),
            sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:evidenceIds, boundary:CONTRACT.boundary
        })]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((d) => d.id !== DEPENDENCY_ID), Object.freeze({
            id:DEPENDENCY_ID, ruleId:RULE_ID, kind:'rule-coverage', scope:CONTRACT.matcherScope, status,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PROVENANCE-CONSUMER','SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-SOURCE-CONTRACT']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:evidenceIds,
            statement:'Four registered position/path condition identities are linked; only the two source-mentioned visible stem order predicates can be evaluated under their shared comparison context.',
            boundary:CONTRACT.boundary
        })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base, claims, dependencies, conflicts,
            contextualForcePartySourcePositionPathConditionMatcher:audit,
            contextualForcePartySourcePositionPathConditionMatcherRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...(base.boundaries || []), CONTRACT.boundary])
        });
    };
    prior.registerExtension('contextual-force-party-source-position-path-condition-matcher-v01', extendSynthesis);
    GuiJia.baziContextualForcePartySourcePositionPathConditionMatcher = Object.freeze({ installed:true, VERSION, RULE_ID, CONTRACT, extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
