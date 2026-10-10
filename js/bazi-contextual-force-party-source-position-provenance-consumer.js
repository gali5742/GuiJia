(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePositionProvenanceConsumer?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourcePositionProvenanceConsumerProfile;
    const prior = GuiJia.baziStrengthSynthesis;
    if (!profile || !prior) return;
    const { VERSION, RULE_ID, CONTRACT } = profile;
    const CLAIM_ID = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PROVENANCE-CONSUMER';
    const DEPENDENCY_ID = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PROVENANCE-CONSUMER';
    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyRelationPositionProvenanceAudit) return base;
        const audit = profile.buildProfile(semanticModel, base);
        const evidenceIds = Object.freeze(audit.normalizedRecords.map((r) => r.sourceRecordId));
        const status = audit.sourceInputCoverageComplete ? 'resolved' : 'unresolved';
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== CLAIM_ID), Object.freeze({
            id:CLAIM_ID, ruleId:RULE_ID, claimKey:'strength.contextual-force.party.source-position-provenance.consumer', status,
            value:Object.freeze({ registeredSourceInputCoverageComplete:audit.sourceInputCoverageComplete,
                runtimePositionConsumerDefined:true, genericPositionResolverDefined:false, corpusPositionCoverageComplete:false }),
            sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:evidenceIds,
            boundary:CONTRACT.boundary
        })]);
        const retainedDependencies = (base.dependencies || []).filter((item) => item.id !== DEPENDENCY_ID).map((item) =>
            item.id === 'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE' ? Object.freeze({ ...item,
                statement:'A registered-source position provenance consumer now exists; generic chart/source condition matching and position corpus coverage remain unresolved.',
                boundary:'Consuming explicit placement provenance does not resolve runtime proximity, intervening conditions, relation/path authorization or arbitrary-chart target binding.'
            }) : item);
        const dependencies = Object.freeze([...retainedDependencies, Object.freeze({
            id:DEPENDENCY_ID, ruleId:RULE_ID, kind:'rule-coverage', status,
            scope:CONTRACT.consumerScope,
            dependsOnDependencyIds:Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT']),
            resolvedByClaimIds:status === 'resolved' ? Object.freeze([CLAIM_ID]) : Object.freeze([]),
            sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:evidenceIds,
            statement:'The five registered position records have normalized source inputs and a provenance consumer. Actual branch bindings, corpus coverage and source-sensitive path authorization remain unresolved.',
            boundary:CONTRACT.boundary
        })]);
        const conflicts = prior.detectConflicts(claims);
        return Object.freeze({ ...base, claims, dependencies, conflicts,
            contextualForcePartySourcePositionProvenanceConsumer:audit,
            contextualForcePartySourcePositionProvenanceConsumerRuleIds:Object.freeze([RULE_ID]),
            sufficiency:prior.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] }),
            boundaries:Object.freeze([...(base.boundaries || []), CONTRACT.boundary])
        });
    };
    prior.registerExtension('contextual-force-party-source-position-provenance-consumer-v01', extendSynthesis);
    GuiJia.baziContextualForcePartySourcePositionProvenanceConsumer = Object.freeze({ installed:true, VERSION, RULE_ID, CONTRACT, extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
