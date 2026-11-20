(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceHiddenSealTargetReview?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceHiddenSealTargetReviewProfile;
    const synthesis = GuiJia.baziStrengthSynthesis;
    if (!profile || !synthesis) return;

    const { VERSION, RULE_ID, CONTRACT } = profile;
    const { SOURCE_CASE, ANNOTATION, TARGET_REVIEW, ASSERTION_REVIEW } = GuiJia.baziContextualForcePartySourceHiddenSealTargetReviewContract;
    const claimId = 'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-HIDDEN-SEAL-TARGET-REVIEW';
    const dependencyId = 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-HIDDEN-SEAL-TARGET-REVIEW';
    const evidenceIds = Object.freeze([SOURCE_CASE.id, ANNOTATION.id, TARGET_REVIEW.id, ASSERTION_REVIEW.id]);
    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceBranchSealDamageNonrealization) return base;
        const review = profile.buildProfile(semanticModel, base);
        const status = review.finiteSourceReviewComplete ? 'resolved' : 'unresolved';
        const claim = Object.freeze({
            id: claimId, ruleId: RULE_ID, claimKey: 'strength.contextual-force.party.source-hidden-seal.target-review', status,
            value: Object.freeze({ targetReviewComplete: review.finiteSourceReviewComplete, newCompleteSourceCaseCount: 1, newEffectAuthorityCount: 0 }),
            sourceEffectIds: Object.freeze([]), sourceRefs: Object.freeze([]), sourceRegistryEvidenceIds: evidenceIds,
            boundary: CONTRACT.boundary
        });
        const dependency = Object.freeze({
            id: dependencyId, ruleId: RULE_ID, kind: 'source-coverage', scope: CONTRACT.reviewScope, status,
            dependsOnDependencyIds: Object.freeze(['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-SEAL-DAMAGE-NONREALIZATION']),
            resolvedByClaimIds: Object.freeze(status === 'resolved' ? [claimId] : []),
            sourceEffectIds: Object.freeze([]), sourceRefs: Object.freeze([]), sourceRegistryEvidenceIds: evidenceIds,
            statement: 'The exact source names a hidden seal target. The wealth actor and concrete negative path still require source evidence.',
            boundary: CONTRACT.boundary
        });
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claimId), claim]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((item) => item.id !== dependencyId), dependency]);
        const conflicts = synthesis.detectConflicts(claims);
        return Object.freeze({
            ...base, claims, dependencies, conflicts,
            contextualForcePartySourceHiddenSealTargetReview: review,
            sufficiency: synthesis.buildSufficiency({ dependencies, conflicts, activeRuleIds: base.activeRuleIds || [] }),
            boundaries: Object.freeze([...new Set([...(base.boundaries || []), CONTRACT.boundary])])
        });
    };
    synthesis.registerExtension('contextual-force-party-source-hidden-seal-target-review-v01', extendSynthesis);
    GuiJia.baziContextualForcePartySourceHiddenSealTargetReview = Object.freeze({ installed: true, VERSION, RULE_ID, CONTRACT, extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
