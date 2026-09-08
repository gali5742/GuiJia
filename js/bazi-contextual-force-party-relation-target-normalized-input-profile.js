(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract || null;
    const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    const annotationSource = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource || null;
    const actorGroupProfileApi = GuiJia.baziContextualForcePartyActorGroupIdentityProfile || null;
    const hiddenBindingProfileApi = GuiJia.baziContextualForcePartyHiddenSingleTargetBindingProfile || null;
    if (!contractApi || !targetSource || !annotationSource || !actorGroupProfileApi || !hiddenBindingProfileApi) return;

    const {
        VERSION,
        RULE_ID,
        NORMALIZATION_STATES,
        IDENTITY_PROVENANCE_STATES,
        ENDPOINT_TYPES,
        CONTRACT,
        validateNormalizedRecord
    } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const annotationByCaseId = Object.freeze(Object.fromEntries((annotationSource.ANNOTATIONS || []).map((item) => [item.upstreamCaseId, item])));

    const normalizeContextSpans = (annotation = {}) => freezeArray((annotation.contextSpans || []).map((span) => Object.freeze({
        role:span.role || null,
        text:span.text || ''
    })));

    const unresolvedIdentity = (unit = {}) => Object.freeze({
        state:IDENTITY_PROVENANCE_STATES.UNRESOLVED_REQUIRED,
        endpointType:null,
        actorKey:null,
        groupId:null,
        memberActorKeys:Object.freeze([]),
        cardinality:unit?.target?.chartBindingEvidence?.explicitCardinality ?? null,
        scope:unit?.target?.chartBindingEvidence?.scope || null,
        targetCandidateKeys:freezeArray(unit?.target?.chartBindingEvidence?.targetCandidateKeys || []),
        sourceActorKeys:freezeArray(unit?.target?.chartBindingEvidence?.sourceActorKeys || []),
        sourceCaseScoped:true
    });

    const buildIdentityProvenance = (sourceCase = {}, unit = {}, actorGroups = [], hiddenBindings = []) => {
        if (!unit?.target?.chartBindingRequired) {
            return Object.freeze({
                state:IDENTITY_PROVENANCE_STATES.NOT_REQUIRED,
                endpointType:null,
                actorKey:null,
                groupId:null,
                memberActorKeys:Object.freeze([]),
                cardinality:null,
                scope:null,
                targetCandidateKeys:Object.freeze([]),
                sourceActorKeys:Object.freeze([]),
                sourceCaseScoped:false
            });
        }

        const group = (actorGroups || []).find((item) => item.sourceCaseId === sourceCase.id && String(item.status || '').startsWith('resolved')) || null;
        if (group?.groupId) {
            return Object.freeze({
                state:IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR_GROUP,
                endpointType:ENDPOINT_TYPES.ACTOR_GROUP,
                actorKey:null,
                groupId:group.groupId,
                memberActorKeys:freezeArray(group.memberActorKeys || []),
                cardinality:group.cardinality ?? null,
                scope:group.scope || null,
                targetCandidateKeys:freezeArray(unit?.target?.chartBindingEvidence?.targetCandidateKeys || group.memberActorKeys || []),
                sourceActorKeys:freezeArray(group.sourceActorKeys || unit?.target?.chartBindingEvidence?.sourceActorKeys || []),
                targetRoleClass:group.targetRoleClass || unit?.target?.roleClass || null,
                sourceCaseScoped:group.sourceCaseScopedIdentity === true
            });
        }

        const binding = (hiddenBindings || []).find((item) => item.sourceCaseId === sourceCase.id && String(item.status || '').startsWith('resolved')) || null;
        if (binding?.stableActorKey) {
            return Object.freeze({
                state:IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR,
                endpointType:ENDPOINT_TYPES.ACTOR,
                actorKey:binding.stableActorKey,
                groupId:null,
                memberActorKeys:Object.freeze([]),
                cardinality:binding.cardinality ?? 1,
                scope:binding.scope || null,
                targetCandidateKeys:Object.freeze([binding.stableActorKey]),
                sourceActorKeys:freezeArray(unit?.target?.chartBindingEvidence?.sourceActorKeys || []),
                targetRoleClass:binding.targetRoleClass || unit?.target?.roleClass || null,
                antecedentSpan:binding.targetAntecedentSpan || unit?.target?.antecedentSpan || null,
                sourceCaseScoped:binding.sourceCaseScopedBinding === true
            });
        }

        return unresolvedIdentity(unit);
    };

    const normalizeRelationUnit = (sourceCase = {}, unit = {}, actorGroups = [], hiddenBindings = []) => Object.freeze({
        id:unit.id || null,
        relationClauseSpan:unit.relationClauseSpan || '',
        sourceRoleSpan:unit.sourceRoleSpan || '',
        sourceRoleClass:unit.sourceRoleClass || null,
        predicateSpan:unit.predicateSpan || '',
        predicateType:unit.predicateType || null,
        relationSemanticHint:unit.relationSemanticHint || null,
        targetMention:Object.freeze({
            span:unit?.target?.span || null,
            mentionMode:unit?.target?.mentionMode || null,
            antecedentSpan:unit?.target?.antecedentSpan || null,
            targetRoleClass:unit?.target?.roleClass || null
        }),
        bindingRequired:unit?.target?.chartBindingRequired === true,
        bindingRequirements:freezeArray(unit?.target?.bindingRequirements || []),
        identityProvenance:buildIdentityProvenance(sourceCase, unit, actorGroups, hiddenBindings),
        outcomeSpans:freezeArray(unit.outcomeSpans || [])
    });

    const makeUnresolved = (base = {}, errors = []) => Object.freeze({
        ...base,
        normalizationState:NORMALIZATION_STATES.UNRESOLVED,
        validation:Object.freeze({ valid:false, errors:freezeArray(errors) }),
        blockerReasons:freezeArray(unique([...(base.blockerReasons || []), ...errors]))
    });

    const normalizeCase = (sourceCase = {}, annotation = null, actorGroups = [], hiddenBindings = []) => {
        const sourceAnnotation = annotation || annotationByCaseId[sourceCase.id] || null;
        if (!sourceAnnotation) {
            return makeUnresolved({
                id:`CF-PARTY-RTNI-${sourceCase.id || 'UNKNOWN'}`,
                sourceCaseId:sourceCase.id || null,
                annotationId:null,
                sourceId:sourceCase.sourceId || null,
                sourceText:sourceCase.sourceText || '',
                chartKey:sourceCase.chartKey || null,
                sourceContextType:sourceCase.sourceContextType || null,
                sourcePredicateType:sourceCase.predicateType || null,
                annotationDisposition:null,
                contextSpans:Object.freeze([]),
                configurationSpans:Object.freeze([]),
                relationUnits:Object.freeze([]),
                evidenceDimensions:freezeArray(sourceCase.evidenceDimensions || []),
                sourceEvidenceIds:freezeArray(sourceCase.sourceEvidenceIds || []),
                blockerReasons:Object.freeze([])
            }, ['missing-curated-annotation']);
        }

        const contextSpans = normalizeContextSpans(sourceAnnotation);
        const configurationSpans = freezeArray(contextSpans.filter((span) => span.role === 'configuration-context').map((span) => span.text));
        const relationUnits = freezeArray((sourceAnnotation.relationUnits || []).map((unit) => normalizeRelationUnit(sourceCase, unit, actorGroups, hiddenBindings)));
        const evidenceDimensions = freezeArray(unique([
            ...(sourceCase.evidenceDimensions || []),
            ...relationUnits.flatMap((unit) => unit.bindingRequirements || [])
        ]));
        const base = {
            id:`CF-PARTY-RTNI-${sourceCase.id || sourceAnnotation.upstreamCaseId || 'UNKNOWN'}`,
            version:VERSION,
            ruleId:RULE_ID,
            sourceCaseId:sourceCase.id || sourceAnnotation.upstreamCaseId || null,
            annotationId:sourceAnnotation.id || null,
            sourceId:sourceAnnotation.sourceId || sourceCase.sourceId || null,
            sourceText:sourceAnnotation.sourceText || sourceCase.sourceText || '',
            chartKey:sourceAnnotation.chartKey || sourceCase.chartKey || null,
            sourceContextType:sourceAnnotation.sourceContextType || sourceCase.sourceContextType || null,
            sourcePredicateType:sourceAnnotation.sourcePredicateType || sourceCase.predicateType || null,
            annotationDisposition:sourceAnnotation.annotationDisposition || null,
            contextSpans,
            configurationSpans,
            relationUnits,
            evidenceDimensions,
            sourceEvidenceIds:freezeArray(unique([...(sourceCase.sourceEvidenceIds || []), ...(sourceAnnotation.sourceEvidenceIds || [])])),
            blockerReasons:freezeArray(sourceAnnotation.blockerReasons || []),
            relationEffect:null,
            membershipMutation:null,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        };
        const validation = validateNormalizedRecord(base);
        if (!validation.valid) return makeUnresolved(base, validation.errors);

        const normalizationState = base.annotationDisposition === 'no-relation-target'
            ? NORMALIZATION_STATES.NOT_APPLICABLE
            : NORMALIZATION_STATES.NORMALIZED;
        return Object.freeze({
            ...base,
            normalizationState,
            validation,
            blockerReasons:Object.freeze([]),
            boundary:'Normalized input 只保存 provenance；不携带 expected target level、semantic-level decision 或 legacy target resolution。'
        });
    };

    const buildProfile = () => {
        const actorGroupProfile = actorGroupProfileApi.buildProfile();
        const hiddenBindingProfile = hiddenBindingProfileApi.buildProfile();
        const records = freezeArray((targetSource.AUDIT_CASES || []).map((sourceCase) => normalizeCase(
            sourceCase,
            annotationByCaseId[sourceCase.id] || null,
            actorGroupProfile.resolvedGroups || [],
            hiddenBindingProfile.resolvedBindings || []
        )));
        const unresolvedRecords = records.filter((item) => item.normalizationState === NORMALIZATION_STATES.UNRESOLVED);
        const notApplicableRecords = records.filter((item) => item.normalizationState === NORMALIZATION_STATES.NOT_APPLICABLE);
        const normalizedRecords = records.filter((item) => item.normalizationState === NORMALIZATION_STATES.NORMALIZED);
        return Object.freeze({
            status:unresolvedRecords.length ? 'normalized-finite-input-partial' : 'normalized-finite-input-complete',
            adapterScope:CONTRACT.adapterScope,
            records,
            normalizedRecords:freezeArray(normalizedRecords),
            notApplicableRecords:freezeArray(notApplicableRecords),
            unresolvedRecords:freezeArray(unresolvedRecords),
            coverageComplete:records.length === (targetSource.AUDIT_CASES || []).length && unresolvedRecords.length === 0,
            genericTargetLevelResolver:null,
            relationEffects:Object.freeze([]),
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            boundary:'Profile 只把 Relation Target 8-case curated corpus 规整为统一 provenance 输入；它不是 target-level resolver。'
        });
    };

    GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        NORMALIZATION_STATES,
        IDENTITY_PROVENANCE_STATES,
        ENDPOINT_TYPES,
        CONTRACT,
        normalizeContextSpans,
        buildIdentityProvenance,
        normalizeRelationUnit,
        normalizeCase,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
