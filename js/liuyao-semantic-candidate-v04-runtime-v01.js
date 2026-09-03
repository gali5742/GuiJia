(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.13-candidate-v0.4-runtime-v0.1';

  const requireModule = (value, label) => {
    if (!value) throw new Error(`Candidate v0.4 runtime dependency missing: ${label}`);
    return value;
  };

  function decide({
    text,
    vector,
    semanticActArtifact,
    routeabilityProbability,
    routerHead,
    scope,
    fallbackArtifact,
    fallbackThresholdLock
  } = {}) {
    const semanticAct = requireModule(GuiJia.liuyaoSemanticActEligibilityV01, 'Semantic Act Eligibility v0.1');
    const evidenceExtractor = requireModule(GuiJia.liuyaoSemanticRouteEvidenceV03, 'Route Evidence v0.3');
    const arbitrationEngine = requireModule(GuiJia.liuyaoSemanticRouteArbitrationV012, 'Route Arbitration v0.12');
    const routeability = requireModule(GuiJia.liuyaoSemanticRouteabilityV05ExecutionV01, 'Routeability v0.5 execution-v0.1');
    const fallbackScorer = requireModule(GuiJia.liuyaoSemanticFallbackIdentityScorerV02, 'Fallback Identity Scorer v0.2');
    const fallbackGate = requireModule(GuiJia.liuyaoSemanticFallbackIdentityV02, 'Fallback Identity v0.2');
    const selection = requireModule(GuiJia.liuyaoSemanticRouteSelectionV05, 'Route Selection v0.5');
    const finalization = requireModule(GuiJia.liuyaoSemanticFinalizationV01, 'Semantic Finalization v0.1');

    const semanticActDecision = semanticAct.decide({ artifact:semanticActArtifact, vector });
    if (semanticActDecision.status !== 'eligible') {
      return Object.freeze({
        version:VERSION,
        semanticAct:semanticActDecision,
        evidence:null,
        arbitration:null,
        routeability:null,
        fallbackIdentity:null,
        selection:null,
        final:Object.freeze({
          version:VERSION,
          disposition:'non_route',
          routeId:null,
          reasonCode:semanticActDecision.reasonCode,
          scopeBypassed:false
        })
      });
    }

    const evidence = evidenceExtractor.extract(String(text || ''));
    const arbitration = arbitrationEngine.arbitrate(String(text || ''), evidence);
    const routeabilityDecision = routeability.decide({
      probability:routeabilityProbability,
      threshold:routeability.threshold,
      arbitration,
      evidence
    });

    let fallbackIdentity = null;
    if (routeabilityDecision.disposition === 'route_known' && !arbitration?.routeId) {
      const scored = fallbackScorer.scoreAll({
        artifact:fallbackArtifact,
        thresholdLock:fallbackThresholdLock,
        vector
      });
      const decision = fallbackGate.decide({
        probabilities:scored.probabilities,
        threshold:scored.threshold
      });
      fallbackIdentity = Object.freeze({ scored, decision });
    }

    const selectionDecision = routeabilityDecision.disposition === 'route_known'
      ? selection.decide({
          arbitration,
          head:routerHead,
          evidence,
          routeabilityDisposition:'route_known',
          fallbackIdentityDecision:fallbackIdentity?.decision || null
        })
      : null;

    const final = finalization.finalize({
      routeability:routeabilityDecision,
      selection:selectionDecision,
      scope,
      arbitration,
      evidence
    });

    return Object.freeze({
      version:VERSION,
      semanticAct:semanticActDecision,
      evidence,
      arbitration,
      routeability:routeabilityDecision,
      fallbackIdentity,
      selection:selectionDecision,
      final
    });
  }

  GuiJia.liuyaoSemanticCandidateV04RuntimeV01 = Object.freeze({
    version:VERSION,
    fallbackCandidateUniverse:'all_current_22_routes',
    routerTop2FallbackRestriction:false,
    semanticActBeforeArbitrationRescue:true,
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
