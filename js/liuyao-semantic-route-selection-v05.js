(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.5-dev';

  const freezeCandidate = (value) => Object.freeze({
    routeId:value.routeId,
    provenance:Object.freeze([...(value.provenance || [])]),
    arbitrationStrength:value.arbitrationStrength || null,
    headRank:value.headRank || null,
    headScore:Number.isFinite(value.headScore) ? value.headScore : null,
    identityProbability:Number.isFinite(value.identityProbability) ? value.identityProbability : null,
    compatibility:value.compatibility || null
  });

  function buildPureFallbackCandidates(head, fallbackAcceptanceDecision, evidence) {
    const compatibility = GuiJia.liuyaoSemanticRouteCompatibilityV03;
    if (!compatibility?.evaluate) throw new Error('Route Compatibility v0.3 未加载');
    const map = new Map();
    const add = (routeId, provenance, extra={}) => {
      if (!routeId) return;
      const current = map.get(routeId) || { routeId, provenance:[], headRank:null, headScore:null, identityProbability:null };
      if (!current.provenance.includes(provenance)) current.provenance.push(provenance);
      if (extra.headRank && (!current.headRank || extra.headRank < current.headRank)) {
        current.headRank = extra.headRank;
        current.headScore = extra.headScore;
      }
      if (Number.isFinite(extra.identityProbability)) current.identityProbability = extra.identityProbability;
      map.set(routeId, current);
    };
    if (head?.top1?.id) add(head.top1.id, 'head_top1', { headRank:1, headScore:head.top1.score });
    if (head?.top2?.id) add(head.top2.id, 'head_top2', { headRank:2, headScore:head.top2.score });
    if (fallbackAcceptanceDecision?.status === 'selected' && fallbackAcceptanceDecision.routeId) {
      add(fallbackAcceptanceDecision.routeId, 'fallback_identity_global_top1', {
        identityProbability:fallbackAcceptanceDecision.identityTop1Probability
      });
    }
    return Object.freeze([...map.values()].map((candidate) => freezeCandidate({
      ...candidate,
      compatibility:compatibility.evaluate(candidate.routeId, evidence || {})
    })));
  }

  function decide({
    arbitration=null,
    head=null,
    evidence=null,
    routeabilityDisposition=null,
    fallbackAcceptanceDecision=null
  } = {}) {
    const base = GuiJia.liuyaoSemanticRouteSelectionV04;
    if (!base?.decide) throw new Error('Route Selection v0.4 未加载');

    // Strong/support behavior is intentionally inherited unchanged from v0.4.
    if (arbitration?.routeId) {
      return base.decide({
        arbitration,
        head,
        evidence,
        routeabilityDisposition,
        fallbackIdentityDecision:null
      });
    }

    const unsupportedTargets = Array.isArray(evidence?.unsupportedTargets) ? evidence.unsupportedTargets : [];
    const candidates = buildPureFallbackCandidates(head, fallbackAcceptanceDecision, evidence);
    const unresolved = (reasonCode) => Object.freeze({
      version:VERSION,
      status:'route_unresolved',
      routeId:null,
      reasonCode,
      candidates
    });
    if (unsupportedTargets.length) return unresolved('explicit_unsupported_target');
    if (!fallbackAcceptanceDecision) return unresolved('fallback_acceptance_required');
    if (fallbackAcceptanceDecision.status !== 'selected' || !fallbackAcceptanceDecision.routeId) {
      return unresolved(fallbackAcceptanceDecision.reasonCode || 'fallback_acceptance_unresolved');
    }

    const admitted = candidates.find((candidate) => candidate.routeId === fallbackAcceptanceDecision.routeId);
    if (!admitted) throw new Error(`Fallback Acceptance selected missing route: ${fallbackAcceptanceDecision.routeId}`);
    if (admitted.compatibility?.status === 'contradicted') {
      return unresolved('fallback_global_identity_candidate_contradicted');
    }
    return Object.freeze({
      version:VERSION,
      status:'selected',
      routeId:admitted.routeId,
      reasonCode:'fallback_global_identity_accepted',
      candidates
    });
  }

  GuiJia.liuyaoSemanticRouteSelectionV05 = Object.freeze({
    version:VERSION,
    buildPureFallbackCandidates,
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
