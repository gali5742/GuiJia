(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract?.installed) return;

    const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    const annotationSource = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource || null;
    if (!targetSource || !annotationSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-INPUT-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const NORMALIZATION_STATES = Object.freeze({
        NORMALIZED:'normalized-source-scoped-input',
        NOT_APPLICABLE:'normalized-not-applicable-no-relation-target',
        UNRESOLVED:'unresolved-normalized-input'
    });

    const IDENTITY_PROVENANCE_STATES = Object.freeze({
        NOT_REQUIRED:'identity-not-required',
        RESOLVED_ACTOR:'resolved-source-scoped-actor-identity',
        RESOLVED_ACTOR_GROUP:'resolved-source-scoped-actor-group-identity',
        UNRESOLVED_REQUIRED:'unresolved-required-identity'
    });

    const ENDPOINT_TYPES = Object.freeze({
        ACTOR:'actor',
        ACTOR_GROUP:'actor-group'
    });

    const FORBIDDEN_DECISION_FIELDS = freezeArray([
        'expectedTargetLevel',
        'semanticLevelHint',
        'semanticLevel',
        'resolutionState',
        'targetReferenceType',
        'targetReference'
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-INPUT-CONTRACT-001',
        version:VERSION,
        adapterScope:'curated-finite-relation-target-evidence-normalization-only',
        sourceCaseIdRequired:true,
        annotationIdRequired:true,
        sourceContextRequired:true,
        predicateTypeRequired:true,
        annotationDispositionRequired:true,
        targetSpanOrAntecedentRequiredForRelationTarget:true,
        targetRoleIdentityRequiredForRelationTarget:true,
        chartBindingIdentityRequiredWhenDeclared:true,
        actorGroupCardinalityAndScopeRequired:true,
        configurationSpansRequiredForConfigurationOnly:true,
        noRelationTargetIsNotUnresolved:true,
        unresolvedOutcomeSupported:true,
        normalizedInputCarriesExpectedTargetLevel:false,
        normalizedInputCarriesSemanticLevelHint:false,
        normalizedInputCarriesLegacyResolution:false,
        runtimeClassicalChineseParser:false,
        runtimeLexicalShortcutResolver:false,
        genericTargetLevelResolverDefined:false,
        relationEffectExecution:false,
        membershipMutation:false,
        relativeDominanceMapping:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        forbiddenDecisionFields:FORBIDDEN_DECISION_FIELDS,
        statement:'Relation Target Normalized Input v0.1 只把已审定 source/annotation/binding provenance 规整为统一机器输入。它保留 target span、source context、predicate、role、chart binding、cardinality 与 scope provenance，但不携带 expectedTargetLevel / semanticLevelHint / legacy resolution，也不执行 target-level、relation effect、relative dominance 或 Strength 判断。'
    });

    const validateNormalizedRecord = (record = {}) => {
        const errors = [];
        if (!record.sourceCaseId) errors.push('source-case-id-missing');
        if (!record.annotationId) errors.push('annotation-id-missing');
        if (!record.sourceContextType) errors.push('source-context-type-missing');
        if (!record.sourcePredicateType) errors.push('source-predicate-type-missing');
        if (!record.annotationDisposition) errors.push('annotation-disposition-missing');

        const relationUnits = record.relationUnits || [];
        const disposition = record.annotationDisposition;

        if (disposition === 'relation-target-present') {
            if (!relationUnits.length) errors.push('relation-target-present-without-relation-unit');
            relationUnits.forEach((unit) => {
                const target = unit.targetMention || {};
                const identity = unit.identityProvenance || {};
                if (!unit.id) errors.push('relation-unit-id-missing');
                if (!unit.predicateType) errors.push(`predicate-type-missing:${unit.id || 'unknown'}`);
                if (!target.span && !target.antecedentSpan) errors.push(`target-span-provenance-missing:${unit.id || 'unknown'}`);
                if (!target.targetRoleClass) errors.push(`target-role-identity-missing:${unit.id || 'unknown'}`);
                if (unit.bindingRequired) {
                    if (!identity.state || identity.state === IDENTITY_PROVENANCE_STATES.UNRESOLVED_REQUIRED) {
                        errors.push(`required-target-identity-unresolved:${unit.id || 'unknown'}`);
                    }
                    if (identity.endpointType === ENDPOINT_TYPES.ACTOR) {
                        if (!identity.actorKey) errors.push(`actor-key-missing:${unit.id || 'unknown'}`);
                        if (!identity.scope) errors.push(`actor-scope-missing:${unit.id || 'unknown'}`);
                    }
                    if (identity.endpointType === ENDPOINT_TYPES.ACTOR_GROUP) {
                        if (!identity.groupId) errors.push(`actor-group-id-missing:${unit.id || 'unknown'}`);
                        if (!identity.scope) errors.push(`actor-group-scope-missing:${unit.id || 'unknown'}`);
                        if (!Number.isInteger(identity.cardinality) || identity.cardinality <= 0) errors.push(`actor-group-cardinality-missing:${unit.id || 'unknown'}`);
                        if ((identity.memberActorKeys || []).length !== identity.cardinality) errors.push(`actor-group-cardinality-member-mismatch:${unit.id || 'unknown'}`);
                    }
                }
            });
        }

        if (disposition === 'configuration-state-only') {
            if (relationUnits.length) errors.push('configuration-only-must-not-carry-relation-units');
            if (!(record.configurationSpans || []).length) errors.push('configuration-span-missing');
        }

        if (disposition === 'no-relation-target' && relationUnits.length) {
            errors.push('no-relation-target-must-not-carry-relation-units');
        }

        return Object.freeze({ valid:errors.length === 0, errors:freezeArray(errors) });
    };

    GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        NORMALIZATION_STATES,
        IDENTITY_PROVENANCE_STATES,
        ENDPOINT_TYPES,
        FORBIDDEN_DECISION_FIELDS,
        CONTRACT,
        validateNormalizedRecord
    });
})(typeof window !== 'undefined' ? window : globalThis);
