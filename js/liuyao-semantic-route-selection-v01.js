(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-dev';

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
      const current = map.get(routeId) || { routeId, provenance:[], arbitrationStrength:null, headRank:null, headScore:null };
      if (!current.provenance.includes(provenance)) current.provenance.push(provenance);
      if (extra.arbitrationStrength) current.arbitrationStrength = extra.arbitrationStrength;
      if (extra.headRank && (!current.headRank || extra.headRank < current.headRank)) {
        current.headRank = extra.headRank;
        current.headScore = extra.headScore;
      }
      map.set(routeId, current);
    };

    if (arbitration?.routeId) add(arbitration.routeId, `arbitration_${arbitration.strength}`, { arbitrationStrength:arbitration.strength });
    if (head?.top1?.id) add(head.top1.id, 'head_top1', { headRank:1, headScore:head.top1.score });
    if (head?.top2?.id) add(head.top2.id, 'head_top2', { headRank:2, headScore:head.top2.score });
    return Object.freeze([...map.values()].map(freezeCandidate));
  }

  function decide({ arbitration=null, head=null, evidence=null } = {}) {
    const compatibility = GuiJia.liuyaoSemanticRouteCompatibilityV01;
    if (!compatibility?.evaluate) throw new Error('Route Compatibility v0.1 未加载');
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

    const strong = evaluated.find((candidate) => candidate.arbitrationStrength === 'strong');
    if (strong && strong.compatibility.status !== 'contradicted') {
      return selected(strong, strong.compatibility.status === 'confirmed' ? 'strong_arbitration_confirmed' : 'strong_arbitration_compatible');
    }

    const confirmed = evaluated.filter((candidate) => candidate.compatibility.status === 'confirmed');
    if (confirmed.length === 1) return selected(confirmed[0], 'unique_confirmed_candidate');
    if (confirmed.length > 1) {
      const support = confirmed.find((candidate) => candidate.arbitrationStrength === 'support');
      const top1 = confirmed.find((candidate) => candidate.headRank === 1);
      if (support && top1 && support.routeId === top1.routeId) return selected(support, 'support_head_agreement');
      return unresolved('multiple_confirmed_candidates');
    }

    const top1 = evaluated.find((candidate) => candidate.headRank === 1);
    const top2 = evaluated.find((candidate) => candidate.headRank === 2);
    const top1Compatible = top1?.compatibility.status === 'compatible';
    const top2Compatible = top2?.compatibility.status === 'compatible';
    const top1Contradicted = !top1 || top1.compatibility.status === 'contradicted';
    const top2Contradicted = !top2 || top2.compatibility.status === 'contradicted';

    if (top1Compatible && top2Contradicted) return selected(top1, 'fallback_top1_only_compatible');
    if (top2Compatible && top1Contradicted) return selected(top2, 'fallback_top2_only_compatible');
    if (top1Compatible && top2Compatible) return unresolved('ambiguous_compatible_head');
    return unresolved('no_noncontradicted_head_candidate');
  }

  GuiJia.liuyaoSemanticRouteSelectionV01 = Object.freeze({
    version:VERSION,
    buildCandidateSet,
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
