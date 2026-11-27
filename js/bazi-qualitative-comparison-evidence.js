(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQualitativeComparisonEvidence?.installed) return;
    const profile = GuiJia.baziQualitativeComparisonEvidenceProfile;
    const synthesis = GuiJia.baziStrengthSynthesis;
    if (!profile || !synthesis) return;
    const extendSynthesis = (model = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        return Object.freeze({ ...base, qualitativeComparisonEvidence: profile.buildProfile(model, base),
            boundaries: Object.freeze([...new Set([...(base.boundaries || []), profile.CONTRACT.boundary])]) });
    };
    synthesis.registerExtension('qualitative-comparison-evidence-v01', extendSynthesis);
    GuiJia.baziQualitativeComparisonEvidence = Object.freeze({ installed: true, CONTRACT: profile.CONTRACT, extendSynthesis });
})(typeof window !== 'undefined' ? window : globalThis);
