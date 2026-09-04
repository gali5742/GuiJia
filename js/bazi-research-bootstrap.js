(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziResearchBootstrap?.installed) return;

    const VERSION = '0.16';
    const dependencies = Object.freeze([
        Object.freeze({ globalKey:'baziMonthCommand', src:'./js/bazi-month-command.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziStrengthSynthesis', src:'./js/bazi-strength-synthesis.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootEffectState', src:'./js/bazi-root-effect-state.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootSixRelations', src:'./js/bazi-root-six-relations.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziClashPreconditions', src:'./js/bazi-clash-preconditions.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziClashSeasonalPosition', src:'./js/bazi-clash-seasonal-position.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziClashNonseasonalForce', src:'./js/bazi-clash-nonseasonal-force.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziElementPresenceScope', src:'./js/bazi-element-presence-scope.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziClashRescueContext', src:'./js/bazi-clash-rescue-context.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootClashSourceOutcome', src:'./js/bazi-root-clash-source-outcome.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootClashInteractionEffect', src:'./js/bazi-root-clash-interaction-effect.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootActorInteractionAggregation', src:'./js/bazi-root-actor-interaction-aggregation.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootBaselineEffectiveness', src:'./js/bazi-root-baseline-effectiveness.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziStemBearingEffect', src:'./js/bazi-stem-bearing-effect.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemFunctionalAvailability', src:'./js/bazi-visible-stem-functional-availability.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemFunctionReachability', src:'./js/bazi-visible-stem-function-reachability.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemDirectedFunction', src:'./js/bazi-visible-stem-directed-function.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemFunctionCoverage', src:'./js/bazi-visible-stem-function-coverage.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemFunctionRealization', src:'./js/bazi-visible-stem-function-realization.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemFunctionRealizationSource', src:'./js/bazi-visible-stem-function-realization-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemActorInteractionAggregation', src:'./js/bazi-visible-stem-actor-interaction-aggregation.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemActorFunctionComposition', src:'./js/bazi-visible-stem-actor-function-composition.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemActorProfileInterpretation', src:'./js/bazi-visible-stem-actor-profile-interpretation.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemDaymasterContribution', src:'./js/bazi-visible-stem-daymaster-contribution.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziQianliStrengthCompositionSource', src:'./js/bazi-qianli-strength-composition-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziQianliStrengthComposition', src:'./js/bazi-qianli-strength-composition.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziQianliQuantityClassificationSource', src:'./js/bazi-qianli-quantity-classification-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziQianliQuantityClassificationAudit', src:'./js/bazi-qianli-quantity-classification-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziQianliQuantitySemanticBridgeSource', src:'./js/bazi-qianli-quantity-semantic-bridge-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziQianliQuantitySemanticBridge', src:'./js/bazi-qianli-quantity-semantic-bridge.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziQianliQuantityCaseCalibrationSource', src:'./js/bazi-qianli-quantity-case-calibration-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziQianliQuantityCaseCalibration', src:'./js/bazi-qianli-quantity-case-calibration.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziQianliQuantityCrossLiteratureSource', src:'./js/bazi-qianli-quantity-cross-literature-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziQianliQuantityCrossLiteratureResearch', src:'./js/bazi-qianli-quantity-cross-literature-research.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForceEvidenceSource', src:'./js/bazi-contextual-force-evidence-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForceEvidenceProfile', src:'./js/bazi-contextual-force-evidence-profile.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForceEvidence', src:'./js/bazi-contextual-force-evidence.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForceInteractionAdapterContract', src:'./js/bazi-contextual-force-interaction-adapter-contract.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForceInteractionAdapterProfile', src:'./js/bazi-contextual-force-interaction-adapter-profile.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForceInteractionAdapter', src:'./js/bazi-contextual-force-interaction-adapter.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartySource', src:'./js/bazi-contextual-force-party-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyAudit', src:'./js/bazi-contextual-force-party-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyMembershipContract', src:'./js/bazi-contextual-force-party-membership-contract.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyMembershipProfile', src:'./js/bazi-contextual-force-party-membership-profile.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyMembership', src:'./js/bazi-contextual-force-party-membership.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyAffiliationContract', src:'./js/bazi-contextual-force-party-affiliation-contract.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyAffiliationProfile', src:'./js/bazi-contextual-force-party-affiliation-profile.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyAffiliation', src:'./js/bazi-contextual-force-party-affiliation.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyAffiliationExpansionSource', src:'./js/bazi-contextual-force-party-affiliation-expansion-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyAffiliationExpansionAudit', src:'./js/bazi-contextual-force-party-affiliation-expansion-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationEffectContract', src:'./js/bazi-contextual-force-party-relation-effect-contract.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationEffectProfile', src:'./js/bazi-contextual-force-party-relation-effect-profile.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationEffect', src:'./js/bazi-contextual-force-party-relation-effect.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelativeDominanceSource', src:'./js/bazi-contextual-force-party-relative-dominance-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelativeDominanceAudit', src:'./js/bazi-contextual-force-party-relative-dominance-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartySideForceProfileContract', src:'./js/bazi-contextual-force-party-side-force-profile-contract.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartySideForceProfileProfile', src:'./js/bazi-contextual-force-party-side-force-profile-profile.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartySideForceProfile', src:'./js/bazi-contextual-force-party-side-force-profile.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyCounterContextContract', src:'./js/bazi-contextual-force-party-counter-context-contract.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyCounterContextProfile', src:'./js/bazi-contextual-force-party-counter-context-profile.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyCounterContext', src:'./js/bazi-contextual-force-party-counter-context.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyNonStemFoundationSource', src:'./js/bazi-contextual-force-party-nonstem-foundation-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyNonStemFoundationAudit', src:'./js/bazi-contextual-force-party-nonstem-foundation-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyBranchSubstrateQualitySource', src:'./js/bazi-contextual-force-party-branch-substrate-quality-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyBranchSubstrateQualityAudit', src:'./js/bazi-contextual-force-party-branch-substrate-quality-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyBranchSubstrateQualityInputAdapterContract', src:'./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-contract.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyBranchSubstrateQualityInputAdapterProfile', src:'./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-profile.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziBranchElementRelationInventory', src:'./js/bazi-branch-element-relation-inventory.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyBranchSubstrateQualityInputAdapter', src:'./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationEffectGeneralizationSource', src:'./js/bazi-contextual-force-party-relation-effect-generalization-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationEffectGeneralizationAudit', src:'./js/bazi-contextual-force-party-relation-effect-generalization-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource', src:'./js/bazi-contextual-force-party-visible-edge-effect-type-authorization-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit', src:'./js/bazi-contextual-force-party-visible-edge-effect-type-authorization-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyVisibleMotifE2ECalibrationSource', src:'./js/bazi-contextual-force-party-visible-motif-e2e-calibration-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyVisibleMotifE2ECalibrationAudit', src:'./js/bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyCollectiveTargetSemanticsSource', src:'./js/bazi-contextual-force-party-collective-target-semantics-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyCollectiveTargetSemanticsAudit', src:'./js/bazi-contextual-force-party-collective-target-semantics-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationTargetSemanticLevelContractSource', src:'./js/bazi-contextual-force-party-relation-target-semantic-level-contract-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationTargetSemanticLevelContractAudit', src:'./js/bazi-contextual-force-party-relation-target-semantic-level-contract-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource', src:'./js/bazi-contextual-force-party-curated-relation-source-semantic-annotation-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyCuratedRelationSourceSemanticAnnotationAudit', src:'./js/bazi-contextual-force-party-curated-relation-source-semantic-annotation-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationSemanticsModernSupportSource', src:'./js/bazi-contextual-force-party-relation-semantics-modern-support-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationSemanticsModernSupportAudit', src:'./js/bazi-contextual-force-party-relation-semantics-modern-support-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationPositionProvenanceSource', src:'./js/bazi-contextual-force-party-relation-position-provenance-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyRelationPositionProvenanceAudit', src:'./js/bazi-contextual-force-party-relation-position-provenance-audit.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyCompetingRelationPathSource', src:'./js/bazi-contextual-force-party-competing-relation-path-source.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziContextualForcePartyCompetingRelationPathAudit', src:'./js/bazi-contextual-force-party-competing-relation-path-audit.js?v=13.44.0' })
    ]);

    const canParserLoad = typeof document !== 'undefined' && document.readyState === 'loading';
    if (canParserLoad) {
        dependencies.forEach((dependency) => {
            if (GuiJia[dependency.globalKey]) return;
            document.write(`<script src="${dependency.src}"><\/script>`);
        });
    }

    GuiJia.baziResearchBootstrap = Object.freeze({
        installed:true,
        version:VERSION,
        mode:'explicit-research-opt-in',
        dependencies
    });
})(typeof window !== 'undefined' ? window : globalThis);
