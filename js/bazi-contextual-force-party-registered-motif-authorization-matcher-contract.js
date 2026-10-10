(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRegisteredMotifAuthorizationMatcherContract?.installed) return;
    const relation = GuiJia.baziContextualForcePartyRelationEffectContract;
    const execution = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract;
    const capability = GuiJia.baziContextualForcePartyEffectTypeAuthorizationSourceCapabilitySource;
    if (!relation || !execution || !capability) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-REGISTERED-MOTIF-AUTHORIZATION-MATCHER-001';
    const MATCH_STATES = Object.freeze({
        MATCHED:'matched-registered-source-backed-motif',
        UNMAPPED:'no-current-registered-motif-match',
        UNRESOLVED:'unresolved-registered-motif-authorization'
    });
    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-REGISTERED-MOTIF-AUTHORIZATION-MATCHER-CONTRACT-001',
        version:VERSION,
        registeredMotifMatcherDefined:true,
        inputScope:'exact-source-cross-visible-actor-relations',
        supportedEndpointShapes:Object.freeze([execution.IDENTITY_SHAPES.ACTOR_TO_ACTOR]),
        registeredMotifIds:Object.freeze(relation.MOTIFS.map((item) => item.id)),
        exactDirectSourcePatternRequired:true,
        independentTargetSpecificRealizationRequired:true,
        positionPathAuthority:'preserved-exact-source-context-only',
        augmentationReusesAffiliationIdentity:true,
        genericEffectTypeAuthorizationResolverDefined:false,
        genericPositionProvenanceResolverDefined:false,
        competingRelationPathResolverDefined:false,
        positiveSourceCalibrationIntroduced:false,
        newTextualAuthorityIntroduced:false,
        crossEndpointMotifTransferAuthorized:false,
        currentRegistryNoMatchMeansNoEffect:false,
        sourceWordingIsDecisionFeature:false,
        numericAggregation:false,
        finalStrengthMapping:false,
        boundary:'R7 only matches the existing registry after exact-source endpoint, direction, realization and role validation. It neither infers realization nor resolves generic position/path semantics; synthetic tests cannot resolve R6 source-calibration blockers.'
    });
    GuiJia.baziContextualForcePartyRegisteredMotifAuthorizationMatcherContract = Object.freeze({
        installed:true, VERSION, RULE_ID, MATCH_STATES, CONTRACT,
        AUTHORIZATION_STATES:execution.AUTHORIZATION_STATES
    });
})(typeof window !== 'undefined' ? window : globalThis);
