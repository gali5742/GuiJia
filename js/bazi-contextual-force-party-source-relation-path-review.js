(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceRelationPathReview?.installed) return;
    const profile = GuiJia.baziContextualForcePartySourceRelationPathReviewProfile;
    const synthesis = GuiJia.baziStrengthSynthesis;
    if (!profile || !synthesis) return;

    const { RULE_ID, CONTRACT } = profile;
    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceHiddenSealTargetReview) return base;
        const review = profile.buildProfile(semanticModel, base);
        return Object.freeze({ ...base, contextualForcePartySourceRelationPathReview: review,
            boundaries: Object.freeze([...new Set([...(base.boundaries || []), CONTRACT.boundary])]) });
    };
    synthesis.registerExtension('contextual-force-party-source-relation-path-review-v01', extendSynthesis);
    GuiJia.baziContextualForcePartySourceRelationPathReview = Object.freeze({ installed: true, RULE_ID, CONTRACT, extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
