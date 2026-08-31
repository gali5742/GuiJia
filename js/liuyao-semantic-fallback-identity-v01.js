(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-dev';

  const freezeCandidate = (routeId, rank, probability, threshold) => Object.freeze({
    routeId,
    rank,
    probability,
    threshold,
    admitted:probability >= threshold
  });

  function decide({ head=null, probabilities=null, threshold } = {}) {
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
      throw new Error('Fallback Identity v0.1 admission threshold must be within [0,1]');
    }
    const raw = [];
    if (head?.top1?.id) raw.push({ routeId:head.top1.id, rank:1 });
    if (head?.top2?.id && head.top2.id !== head?.top1?.id) raw.push({ routeId:head.top2.id, rank:2 });
    if (!raw.length) {
      return Object.freeze({
        version:VERSION,
        status:'route_unresolved',
        routeId:null,
        reasonCode:'fallback_identity_no_head_candidates',
        candidates:Object.freeze([])
      });
    }
    if (!probabilities || typeof probabilities !== 'object') {
      throw new Error('Fallback Identity v0.1 candidate probabilities required');
    }

    const candidates = Object.freeze(raw.map(({ routeId, rank }) => {
      const probability = probabilities[routeId];
      if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
        throw new Error(`Fallback Identity v0.1 missing/invalid probability for ${routeId}`);
      }
      return freezeCandidate(routeId, rank, probability, threshold);
    }));
    const admitted = candidates.filter((candidate) => candidate.admitted);

    if (admitted.length === 1) {
      return Object.freeze({
        version:VERSION,
        status:'selected',
        routeId:admitted[0].routeId,
        reasonCode:'fallback_identity_unique_admission',
        candidates
      });
    }
    return Object.freeze({
      version:VERSION,
      status:'route_unresolved',
      routeId:null,
      reasonCode:admitted.length === 0
        ? 'fallback_identity_reject_all'
        : 'fallback_identity_multiple_admissions',
      candidates
    });
  }

  GuiJia.liuyaoSemanticFallbackIdentityV01 = Object.freeze({
    version:VERSION,
    modelContract:'22_independent_binary_logistic_heads',
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
