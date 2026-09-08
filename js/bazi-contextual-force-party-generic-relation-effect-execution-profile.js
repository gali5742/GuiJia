(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract || null;
    if (!contractApi) return;

    const {
        VERSION,
        RULE_ID,
        AUTHORIZATION_STATES,
        EXECUTION_STATES,
        REALIZATION_STATES,
        NON_ACTIONABLE_TARGET_LEVELS,
        ENDPOINT_TYPES,
        IDENTITY_SHAPES,
        TARGET_LEVELS,
        TARGET_RESOLUTION_STATES,
        TARGET_REFERENCE_TYPES,
        CONTRACT
    } = contractApi;

    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];

    const makeUnresolved = (input = {}, reasons = [], extra = {}) => Object.freeze({
        inputId:input.id || null,
        executionState:EXECUTION_STATES.UNRESOLVED,
        realized:false,
        effectType:null,
        sourceEndpoint:extra.sourceEndpoint || null,
        targetEndpoint:extra.targetEndpoint || null,
        identityShape:extra.identityShape || null,
        relationIdentity:input.relationIdentity || null,
        realizationState:input.realizationState || null,
        authorizationState:input.authorization?.state || null,
        authorizationIds:freezeArray(input.authorization?.authorityIds || []),
        sourceEvidenceIds:freezeArray(input.authorization?.sourceEvidenceIds || []),
        blockerReasons:freezeArray(unique(reasons)),
        decisionRuleId:'GREE-R07-FAIL-CLOSED',
        memberEffects:Object.freeze([]),
        membershipMutation:null,
        actorGlobalParty:null,
        actorGlobalEffectiveness:null,
        relativeDominance:null,
        numericWeight:null,
        scalarForce:null
    });

    const validateEndpoint = (endpoint = {}, side = 'endpoint') => {
        const errors = [];
        if (!endpoint.type) errors.push(`${side}-type-missing`);
        if (endpoint.type === ENDPOINT_TYPES.ACTOR) {
            if (!endpoint.actorKey) errors.push(`${side}-actor-key-missing`);
            if (!endpoint.scope) errors.push(`${side}-actor-scope-missing`);
            if (endpoint.cardinality != null && endpoint.cardinality !== 1) errors.push(`${side}-actor-cardinality-must-equal-one`);
        } else if (endpoint.type === ENDPOINT_TYPES.ACTOR_GROUP) {
            const members = endpoint.memberActorKeys || [];
            if (!endpoint.groupId) errors.push(`${side}-group-id-missing`);
            if (!endpoint.scope) errors.push(`${side}-group-scope-missing`);
            if (!Number.isInteger(endpoint.cardinality) || endpoint.cardinality <= 0) errors.push(`${side}-group-cardinality-invalid`);
            if (members.length !== endpoint.cardinality) errors.push(`${side}-group-membership-incomplete`);
            if (endpoint.sourceScoped !== true) errors.push(`${side}-group-must-be-source-scoped`);
        } else if (endpoint.type) {
            errors.push(`${side}-endpoint-type-unsupported`);
        }
        return freezeArray(errors);
    };

    const targetEndpointFromResolution = (resolution = {}) => {
        if (!resolution || resolution.resolutionState === TARGET_RESOLUTION_STATES.UNRESOLVED_UNIT || resolution.resolutionState === TARGET_RESOLUTION_STATES.UNRESOLVED_RECORD) {
            return Object.freeze({ state:'unresolved', endpoint:null, reasons:Object.freeze(['target-resolution-unresolved']) });
        }
        if (resolution.resolutionState === TARGET_RESOLUTION_STATES.NOT_APPLICABLE_NO_RELATION_TARGET) {
            return Object.freeze({ state:'not-applicable', endpoint:null, reasons:Object.freeze([]) });
        }
        if (NON_ACTIONABLE_TARGET_LEVELS.includes(resolution.semanticLevel)) {
            return Object.freeze({ state:'not-applicable', endpoint:null, reasons:Object.freeze([]) });
        }
        if (resolution.semanticLevel === TARGET_LEVELS.SINGLE_ACTOR && resolution.targetReferenceType === TARGET_REFERENCE_TYPES.ACTOR_KEY) {
            const ref = resolution.targetReference || {};
            return Object.freeze({
                state:'actionable',
                endpoint:Object.freeze({ type:ENDPOINT_TYPES.ACTOR, actorKey:ref.actorKey || null, groupId:null, memberActorKeys:Object.freeze([]), cardinality:1, scope:ref.scope || null, sourceScoped:true }),
                reasons:Object.freeze([])
            });
        }
        if (resolution.semanticLevel === TARGET_LEVELS.ACTOR_SET && resolution.targetReferenceType === TARGET_REFERENCE_TYPES.ACTOR_GROUP) {
            const ref = resolution.targetReference || {};
            return Object.freeze({
                state:'actionable',
                endpoint:Object.freeze({ type:ENDPOINT_TYPES.ACTOR_GROUP, actorKey:null, groupId:ref.groupId || null, memberActorKeys:freezeArray(ref.memberActorKeys || []), cardinality:ref.cardinality ?? null, scope:ref.scope || null, sourceScoped:true }),
                reasons:Object.freeze([])
            });
        }
        return Object.freeze({ state:'unresolved', endpoint:null, reasons:Object.freeze(['target-resolution-not-actionable-or-unsupported']) });
    };

    const identityShapeFor = (source = {}, target = {}) => {
        if (source.type === ENDPOINT_TYPES.ACTOR && target.type === ENDPOINT_TYPES.ACTOR) return IDENTITY_SHAPES.ACTOR_TO_ACTOR;
        if (source.type === ENDPOINT_TYPES.ACTOR && target.type === ENDPOINT_TYPES.ACTOR_GROUP) return IDENTITY_SHAPES.ACTOR_TO_GROUP;
        if (source.type === ENDPOINT_TYPES.ACTOR_GROUP && target.type === ENDPOINT_TYPES.ACTOR) return IDENTITY_SHAPES.GROUP_TO_ACTOR;
        if (source.type === ENDPOINT_TYPES.ACTOR_GROUP && target.type === ENDPOINT_TYPES.ACTOR_GROUP) return IDENTITY_SHAPES.GROUP_TO_GROUP;
        return null;
    };

    const validateAuthorization = (authorization = {}) => {
        const state = authorization.state || null;
        if (state === AUTHORIZATION_STATES.UNMAPPED || state === AUTHORIZATION_STATES.NOT_APPLICABLE) return Object.freeze({ valid:true, effectType:null, errors:Object.freeze([]) });
        if (state !== AUTHORIZATION_STATES.AUTHORIZED) {
            return Object.freeze({ valid:false, effectType:null, errors:Object.freeze(['effect-type-authorization-unresolved']) });
        }
        const relationTypes = unique(authorization.relationTypes || []);
        const errors = [];
        if (authorization.sourceBacked !== true) errors.push('effect-type-authorization-not-source-backed');
        if (relationTypes.length !== 1) errors.push(relationTypes.length ? 'multiple-effect-types-conflict' : 'authorized-effect-type-missing');
        if (!unique(authorization.authorityIds || []).length) errors.push('effect-type-authority-id-missing');
        if (!unique(authorization.sourceEvidenceIds || []).length) errors.push('effect-type-source-evidence-missing');
        if (relationTypes.length === 1 && !(CONTRACT.allowedRelationTypes || []).includes(relationTypes[0])) errors.push('effect-type-not-allowed-by-contract');
        return Object.freeze({ valid:errors.length === 0, effectType:relationTypes.length === 1 ? relationTypes[0] : null, errors:freezeArray(errors) });
    };

    const executeRelationEffect = (input = {}) => {
        const targetResolved = targetEndpointFromResolution(input.targetResolution || {});
        if (targetResolved.state === 'not-applicable') {
            return Object.freeze({
                inputId:input.id || null,
                executionState:EXECUTION_STATES.NOT_APPLICABLE,
                realized:false,
                effectType:null,
                sourceEndpoint:input.sourceEndpoint || null,
                targetEndpoint:null,
                identityShape:null,
                relationIdentity:input.relationIdentity || null,
                realizationState:input.realizationState || null,
                authorizationState:input.authorization?.state || null,
                authorizationIds:freezeArray(input.authorization?.authorityIds || []),
                sourceEvidenceIds:freezeArray(input.authorization?.sourceEvidenceIds || []),
                blockerReasons:Object.freeze([]),
                decisionRuleId:'GREE-R01-NON-ACTIONABLE-TARGET',
                memberEffects:Object.freeze([]),
                membershipMutation:null,
                actorGlobalParty:null,
                actorGlobalEffectiveness:null,
                relativeDominance:null,
                numericWeight:null,
                scalarForce:null
            });
        }
        if (targetResolved.state !== 'actionable') return makeUnresolved(input, targetResolved.reasons || []);

        const sourceEndpoint = input.sourceEndpoint || {};
        const targetEndpoint = targetResolved.endpoint;
        const endpointErrors = [...validateEndpoint(sourceEndpoint, 'source'), ...validateEndpoint(targetEndpoint, 'target')];
        const identityShape = identityShapeFor(sourceEndpoint, targetEndpoint);
        if (!identityShape) endpointErrors.push('relation-endpoint-shape-unresolved');
        if (identityShape === IDENTITY_SHAPES.GROUP_TO_GROUP || !(CONTRACT.supportedEndpointShapes || []).includes(identityShape)) endpointErrors.push('relation-endpoint-shape-unsupported');
        if (endpointErrors.length) return makeUnresolved(input, endpointErrors, { sourceEndpoint, targetEndpoint, identityShape });

        const relation = input.relationIdentity || {};
        const relationErrors = [];
        if (!relation.id) relationErrors.push('relation-identity-id-missing');
        if (!relation.functionType) relationErrors.push('relation-function-type-missing');
        if (relation.directed !== true) relationErrors.push('directed-relation-required');
        if (relationErrors.length) return makeUnresolved(input, relationErrors, { sourceEndpoint, targetEndpoint, identityShape });

        if (![REALIZATION_STATES.REALIZED,REALIZATION_STATES.NOT_REALIZED].includes(input.realizationState)) {
            return makeUnresolved(input, ['relation-realization-unresolved'], { sourceEndpoint, targetEndpoint, identityShape });
        }

        if (input.realizationState === REALIZATION_STATES.NOT_REALIZED) {
            return Object.freeze({
                inputId:input.id || null,
                executionState:EXECUTION_STATES.NOT_REALIZED,
                realized:false,
                effectType:null,
                sourceEndpoint,
                targetEndpoint,
                identityShape,
                relationIdentity:relation,
                realizationState:input.realizationState,
                authorizationState:input.authorization?.state || null,
                authorizationIds:freezeArray(input.authorization?.authorityIds || []),
                sourceEvidenceIds:freezeArray(input.authorization?.sourceEvidenceIds || []),
                blockerReasons:Object.freeze([]),
                decisionRuleId:'GREE-R04-NOT-REALIZED',
                reverseEffect:null,
                memberEffects:Object.freeze([]),
                membershipMutation:null,
                actorGlobalParty:null,
                actorGlobalEffectiveness:null,
                relativeDominance:null,
                numericWeight:null,
                scalarForce:null
            });
        }

        const authorization = validateAuthorization(input.authorization || {});
        if (input.authorization?.state === AUTHORIZATION_STATES.UNMAPPED || input.authorization?.state === AUTHORIZATION_STATES.NOT_APPLICABLE) {
            return Object.freeze({
                inputId:input.id || null,
                executionState:EXECUTION_STATES.REALIZED_UNMAPPED,
                realized:false,
                effectType:null,
                sourceEndpoint,
                targetEndpoint,
                identityShape,
                relationIdentity:relation,
                realizationState:input.realizationState,
                authorizationState:input.authorization?.state || null,
                authorizationIds:freezeArray(input.authorization?.authorityIds || []),
                sourceEvidenceIds:freezeArray(input.authorization?.sourceEvidenceIds || []),
                blockerReasons:Object.freeze([]),
                decisionRuleId:'GREE-R05-REALIZED-UNMAPPED',
                currentRegistryNoMatchIsSemanticRejection:false,
                memberEffects:Object.freeze([]),
                membershipMutation:null,
                actorGlobalParty:null,
                actorGlobalEffectiveness:null,
                relativeDominance:null,
                numericWeight:null,
                scalarForce:null
            });
        }
        if (!authorization.valid) return makeUnresolved(input, authorization.errors, { sourceEndpoint, targetEndpoint, identityShape });

        return Object.freeze({
            inputId:input.id || null,
            executionState:EXECUTION_STATES.REALIZED,
            realized:true,
            effectType:authorization.effectType,
            sourceEndpoint,
            targetEndpoint,
            identityShape,
            relationIdentity:relation,
            realizationState:input.realizationState,
            authorizationState:input.authorization?.state || null,
            authorizationIds:freezeArray(input.authorization?.authorityIds || []),
            sourceEvidenceIds:freezeArray(input.authorization?.sourceEvidenceIds || []),
            blockerReasons:Object.freeze([]),
            decisionRuleId:'GREE-R06-REALIZED-AUTHORIZED',
            memberEffects:Object.freeze([]),
            membershipMutation:null,
            actorGlobalParty:null,
            actorGlobalEffectiveness:null,
            relativeDominance:null,
            numericWeight:null,
            scalarForce:null,
            boundary:'Effect 只挂在原 endpoint identity 上；actor-group 不展开 member effects，effectType 不由 function shape 或 endpoint shape 推导。'
        });
    };

    const targetResolutionForActor = (actorKey = '', scope = 'source-case') => Object.freeze({
        resolutionState:TARGET_RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR,
        semanticLevel:TARGET_LEVELS.SINGLE_ACTOR,
        targetReferenceType:TARGET_REFERENCE_TYPES.ACTOR_KEY,
        targetReference:Object.freeze({ actorKey, scope })
    });

    const adaptKnownRelationEffectRecord = (record = {}, index = 0) => Object.freeze({
        id:`GREE-KNOWN-${String(index + 1).padStart(2, '0')}`,
        sourceEndpoint:Object.freeze({ type:ENDPOINT_TYPES.ACTOR, actorKey:record.sourceActorKey || null, groupId:null, memberActorKeys:Object.freeze([]), cardinality:1, scope:'known-source-backed-relation-effect', sourceScoped:true }),
        targetResolution:targetResolutionForActor(record.targetActorKey || '', 'known-source-backed-relation-effect'),
        relationIdentity:Object.freeze({ id:record.relationRecordId || record.sourceIdentityId || record.id || null, functionType:record.functionType || null, directed:true }),
        realizationState:record.realizationState || (record.realized ? REALIZATION_STATES.REALIZED : record.relationEffectState === 'not-realized-relation-effect-through-edge' ? REALIZATION_STATES.NOT_REALIZED : REALIZATION_STATES.UNRESOLVED),
        authorization:Object.freeze({
            state:AUTHORIZATION_STATES.AUTHORIZED,
            relationTypes:freezeArray(record.relationType ? [record.relationType] : []),
            authorityIds:freezeArray(record.motifId ? [record.motifId] : []),
            sourceEvidenceIds:freezeArray(record.sourceRegistryEvidenceIds || []),
            sourceBacked:true
        }),
        expectedExistingEffectState:record.relationEffectState || null,
        sourceRecordId:record.id || null
    });

    const compatibleWithExistingState = (execution = {}, input = {}) => {
        const expected = input.expectedExistingEffectState;
        if (!expected) return null;
        if (expected === 'realized-relation-effect-in-source-context') return execution.executionState === EXECUTION_STATES.REALIZED;
        if (expected === 'not-realized-relation-effect-through-edge') return execution.executionState === EXECUTION_STATES.NOT_REALIZED;
        if (expected === 'unresolved-relation-effect-through-edge') return execution.executionState === EXECUTION_STATES.UNRESOLVED;
        return null;
    };

    const buildKnownMotifCalibration = (synthesis = {}) => {
        const sourceRecords = synthesis.contextualForcePartyRelationEffectView?.records || [];
        const inputs = freezeArray(sourceRecords.map(adaptKnownRelationEffectRecord));
        const executions = freezeArray(inputs.map((input) => executeRelationEffect(input)));
        const compatibility = freezeArray(executions.map((execution, index) => compatibleWithExistingState(execution, inputs[index])));
        const comparableCount = compatibility.filter((item) => item != null).length;
        const mismatchCount = compatibility.filter((item) => item === false).length;
        return Object.freeze({
            sourceRecordCount:sourceRecords.length,
            inputs,
            executions,
            comparableCount,
            mismatchCount,
            compatible:comparableCount === 0 ? null : mismatchCount === 0,
            boundary:'Known motif calibration 只检查新 generic execution kernel 与现有 source-backed effect records 的状态兼容；不扩大 effect-type registry。'
        });
    };

    const buildProfile = (inputs = []) => {
        const executions = freezeArray((inputs || []).map((input) => executeRelationEffect(input)));
        const realized = executions.filter((item) => item.executionState === EXECUTION_STATES.REALIZED);
        const notRealized = executions.filter((item) => item.executionState === EXECUTION_STATES.NOT_REALIZED);
        const unmapped = executions.filter((item) => item.executionState === EXECUTION_STATES.REALIZED_UNMAPPED);
        const notApplicable = executions.filter((item) => item.executionState === EXECUTION_STATES.NOT_APPLICABLE);
        const unresolved = executions.filter((item) => item.executionState === EXECUTION_STATES.UNRESOLVED);
        return Object.freeze({
            status:unresolved.length ? 'generic-relation-effect-execution-partial' : 'generic-relation-effect-execution-complete-for-provided-input',
            executions,
            realizedExecutions:freezeArray(realized),
            notRealizedExecutions:freezeArray(notRealized),
            realizedUnmappedExecutions:freezeArray(unmapped),
            notApplicableExecutions:freezeArray(notApplicable),
            unresolvedExecutions:freezeArray(unresolved),
            providedInputCoverageComplete:executions.length === (inputs || []).length && unresolved.length === 0,
            genericExecutionKernelDefined:true,
            genericEffectTypeMappingDefined:false,
            membershipMutation:null,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        });
    };

    GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        AUTHORIZATION_STATES,
        EXECUTION_STATES,
        REALIZATION_STATES,
        CONTRACT,
        validateEndpoint,
        targetEndpointFromResolution,
        identityShapeFor,
        validateAuthorization,
        executeRelationEffect,
        targetResolutionForActor,
        adaptKnownRelationEffectRecord,
        compatibleWithExistingState,
        buildKnownMotifCalibration,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
