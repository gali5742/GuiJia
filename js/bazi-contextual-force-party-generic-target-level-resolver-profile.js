(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyGenericTargetLevelResolverContract || null;
    const normalizedContractApi = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract || null;
    const normalizedProfileApi = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile || null;
    if (!contractApi || !normalizedContractApi || !normalizedProfileApi) return;

    const {
        VERSION,
        RULE_ID,
        TARGET_LEVELS,
        RESOLUTION_STATES,
        TARGET_REFERENCE_TYPES,
        SOURCE_CONTEXT_TYPES,
        PREDICATE_TYPES,
        IDENTITY_PROVENANCE_STATES,
        ENDPOINT_TYPES,
        CONTRACT
    } = contractApi;
    const { validateNormalizedRecord } = normalizedContractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];

    const unresolvedUnit = (record = {}, unit = {}, reasons = []) => Object.freeze({
        sourceCaseId:record.sourceCaseId || null,
        relationUnitId:unit.id || null,
        resolutionState:RESOLUTION_STATES.UNRESOLVED_UNIT,
        semanticLevel:null,
        targetReferenceType:null,
        targetReference:null,
        blockerReasons:freezeArray(unique(reasons)),
        decisionRuleId:'GTLR-R06-FAIL-CLOSED',
        relationEffect:null,
        membershipMutation:null,
        relativeDominance:null,
        numericWeight:null
    });

    const resolveUnit = (record = {}, unit = {}) => {
        const target = unit.targetMention || {};
        const identity = unit.identityProvenance || {};
        const commonErrors = [];
        if (!unit.id) commonErrors.push('relation-unit-id-missing');
        if (!unit.predicateType) commonErrors.push('relation-unit-predicate-type-missing');
        if (!target.span && !target.antecedentSpan) commonErrors.push('target-span-or-antecedent-missing');
        if (!target.targetRoleClass) commonErrors.push('target-role-class-missing');
        if (commonErrors.length) return unresolvedUnit(record, unit, commonErrors);

        if (record.sourceContextType === SOURCE_CONTEXT_TYPES.MIXED_COMMENTARY) {
            return unresolvedUnit(record, unit, ['mixed-commentary-requires-upstream-segmentation']);
        }

        if (unit.bindingRequired === true) {
            const errors = [];
            if (record.sourceContextType !== SOURCE_CONTEXT_TYPES.CHART_CASE) errors.push('instance-target-requires-chart-case-context');
            if (!record.chartKey) errors.push('instance-target-requires-chart-key');
            if (record.sourcePredicateType !== PREDICATE_TYPES.RELATION_EVENT) errors.push('instance-target-requires-record-relation-event');
            if (unit.predicateType !== PREDICATE_TYPES.RELATION_EVENT) errors.push('instance-target-requires-unit-relation-event');
            if (identity.sourceCaseScoped !== true) errors.push('instance-target-identity-not-source-scoped');
            if (errors.length) return unresolvedUnit(record, unit, errors);

            if (identity.state === IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR && identity.endpointType === ENDPOINT_TYPES.ACTOR) {
                const actorErrors = [];
                if (!identity.actorKey) actorErrors.push('single-actor-key-missing');
                if (!identity.scope) actorErrors.push('single-actor-scope-missing');
                if (identity.cardinality !== 1) actorErrors.push('single-actor-cardinality-must-equal-one');
                if (actorErrors.length) return unresolvedUnit(record, unit, actorErrors);
                return Object.freeze({
                    sourceCaseId:record.sourceCaseId || null,
                    relationUnitId:unit.id,
                    resolutionState:RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR,
                    semanticLevel:TARGET_LEVELS.SINGLE_ACTOR,
                    targetReferenceType:TARGET_REFERENCE_TYPES.ACTOR_KEY,
                    targetReference:Object.freeze({
                        actorKey:identity.actorKey,
                        scope:identity.scope,
                        targetRoleClass:identity.targetRoleClass || target.targetRoleClass,
                        antecedentSpan:identity.antecedentSpan || target.antecedentSpan || null
                    }),
                    blockerReasons:Object.freeze([]),
                    decisionRuleId:'GTLR-R04-CHART-SINGLE-ACTOR',
                    relationEffect:null,
                    membershipMutation:null,
                    relativeDominance:null,
                    numericWeight:null
                });
            }

            if (identity.state === IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR_GROUP && identity.endpointType === ENDPOINT_TYPES.ACTOR_GROUP) {
                const groupErrors = [];
                const members = identity.memberActorKeys || [];
                if (!identity.groupId) groupErrors.push('actor-group-id-missing');
                if (!identity.scope) groupErrors.push('actor-group-scope-missing');
                if (!Number.isInteger(identity.cardinality) || identity.cardinality <= 0) groupErrors.push('actor-group-cardinality-invalid');
                if (members.length !== identity.cardinality) groupErrors.push('actor-group-membership-incomplete');
                if (groupErrors.length) return unresolvedUnit(record, unit, groupErrors);
                return Object.freeze({
                    sourceCaseId:record.sourceCaseId || null,
                    relationUnitId:unit.id,
                    resolutionState:RESOLUTION_STATES.RESOLVED_ACTOR_SET,
                    semanticLevel:TARGET_LEVELS.ACTOR_SET,
                    targetReferenceType:TARGET_REFERENCE_TYPES.ACTOR_GROUP,
                    targetReference:Object.freeze({
                        groupId:identity.groupId,
                        memberActorKeys:freezeArray(members),
                        cardinality:identity.cardinality,
                        scope:identity.scope,
                        targetRoleClass:identity.targetRoleClass || target.targetRoleClass
                    }),
                    blockerReasons:Object.freeze([]),
                    decisionRuleId:'GTLR-R05-CHART-ACTOR-SET',
                    relationEffect:null,
                    membershipMutation:null,
                    relativeDominance:null,
                    numericWeight:null
                });
            }

            return unresolvedUnit(record, unit, ['required-instance-identity-unresolved-or-unsupported']);
        }

        if (identity.state !== IDENTITY_PROVENANCE_STATES.NOT_REQUIRED) {
            return unresolvedUnit(record, unit, ['unbound-role-target-must-not-carry-instance-identity']);
        }
        if (record.sourceContextType !== SOURCE_CONTEXT_TYPES.THEORY_GENERAL) {
            return unresolvedUnit(record, unit, ['unbound-role-target-requires-theory-general-context']);
        }
        if (record.sourcePredicateType !== PREDICATE_TYPES.GENERALIZED_RELATION_RULE) {
            return unresolvedUnit(record, unit, ['unbound-role-target-requires-record-generalized-relation-rule']);
        }
        if (unit.predicateType !== PREDICATE_TYPES.GENERALIZED_RELATION_RULE) {
            return unresolvedUnit(record, unit, ['unbound-role-target-requires-unit-generalized-relation-rule']);
        }

        return Object.freeze({
            sourceCaseId:record.sourceCaseId || null,
            relationUnitId:unit.id,
            resolutionState:RESOLUTION_STATES.RESOLVED_ROLE_CLASS,
            semanticLevel:TARGET_LEVELS.ROLE_CLASS,
            targetReferenceType:TARGET_REFERENCE_TYPES.ROLE_CLASS,
            targetReference:Object.freeze({ roleClasses:freezeArray([target.targetRoleClass]) }),
            blockerReasons:Object.freeze([]),
            decisionRuleId:'GTLR-R03-THEORY-ROLE-CLASS',
            relationEffect:null,
            membershipMutation:null,
            relativeDominance:null,
            numericWeight:null
        });
    };

    const unresolvedRecord = (record = {}, reasons = [], unitResolutions = []) => Object.freeze({
        sourceCaseId:record.sourceCaseId || null,
        annotationId:record.annotationId || null,
        resolutionState:RESOLUTION_STATES.UNRESOLVED_RECORD,
        semanticLevel:null,
        targetLevels:Object.freeze([]),
        mixedTargetLevels:false,
        targetReferenceType:null,
        targetReference:null,
        unitResolutions:freezeArray(unitResolutions),
        blockerReasons:freezeArray(unique(reasons)),
        relationEffect:null,
        membershipMutation:null,
        relativeDominance:null,
        numericScore:null,
        scalarForce:null
    });

    const resolveRecord = (record = {}) => {
        const validation = validateNormalizedRecord(record);
        if (!validation.valid) return unresolvedRecord(record, validation.errors || []);
        if (record.normalizationState === 'unresolved-normalized-input') {
            return unresolvedRecord(record, ['normalized-input-is-unresolved', ...(record.blockerReasons || [])]);
        }

        if (record.annotationDisposition === 'no-relation-target') {
            return Object.freeze({
                sourceCaseId:record.sourceCaseId,
                annotationId:record.annotationId,
                resolutionState:RESOLUTION_STATES.NOT_APPLICABLE_NO_RELATION_TARGET,
                semanticLevel:null,
                targetLevels:Object.freeze([]),
                mixedTargetLevels:false,
                targetReferenceType:TARGET_REFERENCE_TYPES.NONE,
                targetReference:null,
                unitResolutions:Object.freeze([]),
                blockerReasons:Object.freeze([]),
                decisionRuleId:'GTLR-R01-NO-TARGET',
                relationEffect:null,
                membershipMutation:null,
                relativeDominance:null,
                numericScore:null,
                scalarForce:null
            });
        }

        if (record.annotationDisposition === 'configuration-state-only') {
            if (!(record.configurationSpans || []).length) return unresolvedRecord(record, ['configuration-span-missing']);
            return Object.freeze({
                sourceCaseId:record.sourceCaseId,
                annotationId:record.annotationId,
                resolutionState:RESOLUTION_STATES.RESOLVED_CONFIGURATION,
                semanticLevel:TARGET_LEVELS.CONFIGURATION,
                targetLevels:Object.freeze([TARGET_LEVELS.CONFIGURATION]),
                mixedTargetLevels:false,
                targetReferenceType:TARGET_REFERENCE_TYPES.CONFIGURATION_STATE,
                targetReference:Object.freeze({ configurationSpans:freezeArray(record.configurationSpans || []) }),
                unitResolutions:Object.freeze([]),
                blockerReasons:Object.freeze([]),
                decisionRuleId:'GTLR-R02-CONFIGURATION',
                relationEffect:null,
                membershipMutation:null,
                relativeDominance:null,
                numericScore:null,
                scalarForce:null
            });
        }

        if (record.annotationDisposition !== 'relation-target-present') {
            return unresolvedRecord(record, ['unsupported-annotation-disposition']);
        }

        const unitResolutions = freezeArray((record.relationUnits || []).map((unit) => resolveUnit(record, unit)));
        const unresolvedUnits = unitResolutions.filter((item) => item.resolutionState === RESOLUTION_STATES.UNRESOLVED_UNIT);
        if (unresolvedUnits.length) {
            return unresolvedRecord(
                record,
                unresolvedUnits.flatMap((item) => item.blockerReasons || []),
                unitResolutions
            );
        }

        const targetLevels = freezeArray(unique(unitResolutions.map((item) => item.semanticLevel)));
        return Object.freeze({
            sourceCaseId:record.sourceCaseId,
            annotationId:record.annotationId,
            resolutionState:RESOLUTION_STATES.RESOLVED_RELATION_TARGET_RECORD,
            semanticLevel:targetLevels.length === 1 ? targetLevels[0] : null,
            targetLevels,
            mixedTargetLevels:targetLevels.length > 1,
            targetReferenceType:targetLevels.length === 1 && unitResolutions.length === 1 ? unitResolutions[0].targetReferenceType : null,
            targetReference:targetLevels.length === 1 && unitResolutions.length === 1 ? unitResolutions[0].targetReference : null,
            unitResolutions,
            blockerReasons:Object.freeze([]),
            relationEffect:null,
            membershipMutation:null,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            boundary:'Record-level semanticLevel 只有在全部 relation-target units 同 level 时才提供；resolver 的真实决策单位始终是 relation-target unit。'
        });
    };

    const buildProfile = (records = null) => {
        const normalizedProfile = records ? null : normalizedProfileApi.buildProfile();
        const inputRecords = records || normalizedProfile?.records || [];
        const resolutions = freezeArray(inputRecords.map(resolveRecord));
        const unresolvedResolutions = resolutions.filter((item) => item.resolutionState === RESOLUTION_STATES.UNRESOLVED_RECORD);
        const notApplicableResolutions = resolutions.filter((item) => item.resolutionState === RESOLUTION_STATES.NOT_APPLICABLE_NO_RELATION_TARGET);
        const resolvedResolutions = resolutions.filter((item) => ![RESOLUTION_STATES.UNRESOLVED_RECORD,RESOLUTION_STATES.NOT_APPLICABLE_NO_RELATION_TARGET].includes(item.resolutionState));
        return Object.freeze({
            status:unresolvedResolutions.length ? 'generic-target-level-resolution-partial' : 'generic-target-level-resolution-complete-for-provided-input',
            resolverInput:CONTRACT.resolverInput,
            resolverUnit:CONTRACT.resolverUnit,
            resolutions,
            resolvedResolutions:freezeArray(resolvedResolutions),
            notApplicableResolutions:freezeArray(notApplicableResolutions),
            unresolvedResolutions:freezeArray(unresolvedResolutions),
            providedInputCoverageComplete:resolutions.length === inputRecords.length && unresolvedResolutions.length === 0,
            genericDecisionKernelDefined:true,
            broaderSourceCoverageProven:false,
            globalSourceCoverageResolved:false,
            relationEffects:Object.freeze([]),
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            boundary:'Generic resolver kernel 可处理任何满足 Normalized Input v0.1 provenance contract 的输入，但当前 profile 只证明所提供输入集合的解析结果；它不声称 broader source annotation coverage 已建立。'
        });
    };

    GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        TARGET_LEVELS,
        RESOLUTION_STATES,
        TARGET_REFERENCE_TYPES,
        CONTRACT,
        unresolvedUnit,
        resolveUnit,
        resolveRecord,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
