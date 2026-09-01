(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.14-dev';

  function arbitrate(question, suppliedEvidence) {
    const extractor = GuiJia.liuyaoSemanticRouteEvidenceV05;
    const baseArbitration = GuiJia.liuyaoSemanticRouteArbitrationV013;
    if (!extractor?.extract) throw new Error('Route Semantic Evidence v0.5 未加载');
    if (!baseArbitration?.arbitrate) throw new Error('Route Arbitration v0.13 未加载');
    const evidence = suppliedEvidence || extractor.extract(question);
    if ((evidence.unsupportedTargets || []).length) return null;
    return baseArbitration.arbitrate(question, evidence);
  }

  GuiJia.liuyaoSemanticRouteArbitrationV014 = Object.freeze({ version:VERSION, arbitrate });
})(typeof window !== 'undefined' ? window : globalThis);
