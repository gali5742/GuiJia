(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.4-dev';

  const freezeCandidate = (value) => Object.freeze({
    routeId:value.routeId,
    provenance:Object.freeze([...value.provenance]),
    arbitrationStrength:value.arbitrationStrength || null,
    headRank:value.headRank || null,
    headScore:Number.isFinite(value.headScore) ? value.headScore : null
  });

  function buildCandidateSet(arbitration, head) {
    const map = new Map();
    const add = (routeId, provenance, extra = {}) => {
      if (!routeId) return;
      const current = map.get(routeId) || {
        routeId,
        provenance:[],
        arbitrationStrength:null,
        headRank:null,
        headScore:null
      };
      if (!current.provenance.includes(provenance)) current.provenance.push(provenance);
      if (extra.arbitrationStrength) current.arbitrationStrength = extra.arbitrationStrength;
      if (extra.headRank && (!current.headRank || extra.headRank < current.headRank)) {
        current.headRank = extra.headRank;
        current.headScore = extra.headScore;
      }
      map.set(routeId, current);
    };

    if (arbitration?.routeId) {
      add(arbitration.routeId, `arbitration_${arbitration.strength}`, {
        arbitrationStrength:arbitration.strength
      });
    }
    if (head?.top1?.id) add(head.top1.id, 'head_top1', { headRank:1, headScore:head.top1.score });
    if (head?.top2?.id) add(head.top2.id, 'head_top2', { headRank:2, headScore:head.top2.score });
    return Object.freeze([...map.values()].map(freezeCandidate));
  }

  function decide({
    arbitration=null,
    head=null,
    evidence=null,
    routeabilityDisposition=null,
    fallbackIdentityDecision=null
  } = {}) {
    const compatibility = GuiJia.liuyaoSemanticRouteCompatibilityV03;
    if (!compatibility?.evaluate) throw new Error('Route Compatibility v0.3 未加载');

    const candidates = buildCandidateSet(arbitration, head);
    const evaluated = Object.freeze(candidates.map((candidate) => Object.freeze({
      ...candidate,
      compatibility:compatibility.evaluate(candidate.routeId, evidence || {})
    })));
    const selected = (candidate, reasonCode) => Object.freeze({
      version:VERSION,
      status:'selected',
      routeId:candidate.routeId,
      reasonCode,
      candidates:evaluated
    });
    const unresolved = (reasonCode) => Object.freeze({
      version:VERSION,
      status:'route_unresolved',
      routeId:null,
      reasonCode,
      candidates:evaluated
    });

    if (!evaluated.length) return unresolved('no_candidates');
    if (routeabilityDisposition === 'non_route') return unresolved('routeability_non_route');

    const strong = evaluated.find((candidate) => candidate.arbitrationStrength === 'strong');
    if (strong && strong.compatibility.status !== 'contradicted') {
      return selected(
        strong,
        strong.compatibility.status === 'confirmed'
          ? 'strong_arbitration_confirmed'
          : 'strong_arbitration_compatible'
      );
    }

    const confirmed = evaluated.filter((candidate) => candidate.compatibility.status === 'confirmed');
    if (confirmed.length === 1) return selected(confirmed[0], 'unique_confirmed_candidate');
    if (confirmed.length > 1) {
      const support = confirmed.find((candidate) => candidate.arbitrationStrength === 'support');
      const top1 = confirmed.find((candidate) => candidate.headRank === 1);
      if (support && top1 && support.routeId === top1.routeId) {
        return selected(support, 'support_head_agreement');
      }
      return unresolved('multiple_confirmed_candidates');
    }

    if (routeabilityDisposition !== 'route_known') {
      return unresolved('routeability_not_confirmed_for_fallback');
    }

    const support = evaluated.find((candidate) => candidate.arbitrationStrength === 'support');
    if (support && support.compatibility.status !== 'contradicted') {
      return selected(support, 'support_arbitration_priority_after_routeability');
    }

    // Fallback Identity applies only to pure Head fallback. A non-null Arbitration cannot silently degrade into Head guessing.
    if (arbitration?.routeId) return unresolved('fallback_identity_not_applicable_with_arbitration');
    if (!fallbackIdentityDecision) return unresolved('fallback_identity_required');
    if (fallbackIdentityDecision.status !== 'selected') {
      return unresolved(fallbackIdentityDecision.reasonCode || 'fallback_identity_unresolved');
    }

    const admitted = evaluated.find((candidate) => (
      candidate.headRank && candidate.routeId === fallbackIdentityDecision.routeId
    ));
    if (!admitted) throw new Error(`Fallback Identity selected non-Head route: ${fallbackIdentityDecision.routeId}`);
    if (admitted.compatibility.status === 'contradicted') {
      return unresolved('fallback_identity_selected_candidate_contradicted');
    }
    return selected(admitted, 'fallback_identity_unique_admission');
  }

  GuiJia.liuyaoSemanticRouteSelectionV04 = Object.freeze({
    version:VERSION,
    buildCandidateSet,
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
