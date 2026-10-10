(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePathParticipantBindingContract?.installed) return;
    const upstream = GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherContract;
    if (!upstream) return;
    const { freeze, LINK_REGISTRY } = upstream;
    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-PARTICIPANT-BINDING-001';
    const STATES = freeze({
        PARTIAL:'source-path-participants-bound-target-unresolved',
        NOT_SATISFIED:'source-path-binding-condition-not-satisfied',
        NOT_APPLICABLE:'source-path-participant-binding-not-applicable',
        UNRESOLVED:'unresolved-source-path-participant-binding',
        INVALID:'invalid-source-path-condition-provenance'
    });
    // Only already curated path references are consumed. No role/verb matching creates references.
    const DESCRIPTORS = freeze(Object.values(LINK_REGISTRY).flatMap((link) => link.pathParticipantRefs.map((ref) => ({
        linkId:link.id, conditionId:link.conditionId, pathSourceRecordId:link.pathSourceRecordId,
        relationAssertionId:link.relationAssertionId, positionUnitId:link.positionUnitId,
        sourcePathId:ref.pathId, sourceRefId:ref.sourceRefId, targetRefId:ref.targetRefId || null,
        targetRoleClass:ref.targetRoleClass, intermediateRefIds:[...(ref.intermediateRefIds || [])]
    }))));
    const CONTRACT = freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-PARTICIPANT-BINDING-CONTRACT-001', version:VERSION,
        bindingScope:'registered-r11-path-source-and-declared-intermediate-participants-only',
        upstreamContractId:upstream.CONTRACT.id, upstreamRuleId:upstream.RULE_ID,
        exactConditionRevalidationRequired:true, independentChartIdentityRequired:true,
        matchedConditionRequired:true, chartScopedInstanceIdentityRequired:true,
        compoundPathIdentityPreserved:true, targetIdentityResolverDefined:false,
        conditionFailureEqualsRelationNotRealized:false, participantBindingEqualsRealization:false,
        genericPositionResolverDefined:false, competingPathResolverDefined:false, corpusCoverageComplete:false,
        executionAuthorized:false, memberEdgeExpansion:false, numericWeights:false, ranking:false, finalStrengthMapping:false,
        boundary:'R12 binds only the explicitly referenced visible source/intermediate actors of matched R11 paths. Targets remain unresolved without independent source identity/scope authority; partial path instances do not establish realization, select winners, expand compound edges or authorize effects.'
    });
    GuiJia.baziContextualForcePartySourcePathParticipantBindingContract = Object.freeze({
        installed:true, VERSION, RULE_ID, STATES, DESCRIPTORS, CONTRACT, freeze
    });
})(typeof window !== 'undefined' ? window : globalThis);
