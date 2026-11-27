(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziSourceContributionLocalForce?.installed) return;
    const profile = GuiJia.baziSourceContributionLocalForceProfile;
    const synthesis = GuiJia.baziStrengthSynthesis;
    if (!profile || !synthesis) return;
    const extendSynthesis = (model = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        return Object.freeze({ ...base, sourceContributionLocalForce: profile.buildProfile(model, base),
            boundaries: Object.freeze([...new Set([...(base.boundaries || []), profile.CONTRACT.boundary])]) });
    };
    synthesis.registerExtension('source-contribution-local-force-v01', extendSynthesis);
    GuiJia.baziSourceContributionLocalForce = Object.freeze({ installed: true, CONTRACT: profile.CONTRACT, extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
