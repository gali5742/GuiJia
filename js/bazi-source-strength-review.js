(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziSourceStrengthReview?.installed) return;
    const profile = GuiJia.baziSourceStrengthReviewProfile;
    const synthesis = GuiJia.baziStrengthSynthesis;
    if (!profile || !synthesis) return;
    const extendSynthesis = (model = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        return Object.freeze({ ...base, sourceStrengthReview: profile.buildProfile(model, base),
            boundaries: Object.freeze([...new Set([...(base.boundaries || []), profile.CONTRACT.boundary])]) });
    };
    synthesis.registerExtension('source-strength-review-v01', extendSynthesis);
    GuiJia.baziSourceStrengthReview = Object.freeze({ installed: true, CONTRACT: profile.CONTRACT, extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
