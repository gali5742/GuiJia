(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.15-dev';

  function arbitrate(question, suppliedEvidence) {
    const extractor = GuiJia.liuyaoSemanticRouteEvidenceV05;
    const questionMode = GuiJia.liuyaoSemanticQuestionModeV01;
    const baseArbitration = GuiJia.liuyaoSemanticRouteArbitrationV014;
    if (!extractor?.extract) throw new Error('Route Semantic Evidence v0.5 未加载');
    if (!questionMode?.classify) throw new Error('Semantic Question Mode v0.1 未加载');
    if (!baseArbitration?.arbitrate) throw new Error('Route Arbitration v0.14 未加载');
    const evidence = suppliedEvidence || extractor.extract(question);
    const modeDecision = questionMode.classify(question, evidence);
    if (modeDecision.mode === 'information_request') return null;
    return baseArbitration.arbitrate(question, evidence);
  }

  GuiJia.liuyaoSemanticRouteArbitrationV015 = Object.freeze({ version:VERSION, arbitrate });
})(typeof window !== 'undefined' ? window : globalThis);
