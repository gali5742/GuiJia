(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract?.installed) return;

    const endpointContract = GuiJia.baziContextualForcePartyRelationEndpointIdentityContract || null;
    const targetResolverContract = GuiJia.baziContextualForcePartyGenericTargetLevelResolverContract || null;
    const relationEffectContract = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const generalizationSource = GuiJia.baziContextualForcePartyRelationEffectGeneralizationSource || null;
    if (!endpointContract || !targetResolverContract || !relationEffectContract || !generalizationSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const AUTHORIZATION_STATES = Object.freeze({
        AUTHORIZED:'authorized-source-backed-effect-type',
        UNMAPPED:'realized-edge-currently-unmapped',
        NOT_APPLICABLE:'effect-authorization-not-applicable',
        UNRESOLVED:'unresolved-effect-type-authorization'
    });

    const EXECUTION_STATES = Object.freeze({
        REALIZED:'realized-generic-relation-effect',
        NOT_REALIZED:'not-realized-generic-relation-effect',
        REALIZED_UNMAPPED:'realized-relation-currently-unmapped',
        NOT_APPLICABLE:'generic-relation-effect-not-applicable',
        UNRESOLVED:'unresolved-generic-relation-effect'
    });

    const REALIZATION_STATES = Object.freeze({
        REALIZED:'realized-in-source-context',
        NOT_REALIZED:'not-realized-in-source-context',
        UNRESOLVED:'unresolved-realization'
    });

    const NON_ACTIONABLE_TARGET_LEVELS = freezeArray([
        targetResolverContract.TARGET_LEVELS.ROLE_CLASS,
        targetResolverContract.TARGET_LEVELS.CONFIGURATION
    ]);

    const DECISION_RULES = freezeArray([
        Object.freeze({ id:'GREE-R01-NON-ACTIONABLE-TARGET', output:EXECUTION_STATES.NOT_APPLICABLE, statement:'role-class / configuration / no-target 不是 chart-instance relation-effect endpoint；不执行 effect。' }),
        Object.freeze({ id:'GREE-R02-UNRESOLVED-TARGET', output:EXECUTION_STATES.UNRESOLVED, statement:'target-level resolution 未解时 relation effect 必须 fail closed。' }),
        Object.freeze({ id:'GREE-R03-UNRESOLVED-REALIZATION', output:EXECUTION_STATES.UNRESOLVED, statement:'relation realization 未解时不得执行 effect。' }),
        Object.freeze({ id:'GREE-R04-NOT-REALIZED', output:EXECUTION_STATES.NOT_REALIZED, statement:'relation 已明确未兑现时记录 not-realized；不生成反向 effect。' }),
        Object.freeze({ id:'GREE-R05-REALIZED-UNMAPPED', output:EXECUTION_STATES.REALIZED_UNMAPPED, statement:'relation 已兑现但 effect type 未获 source-backed authorization 时保持 realized-unmapped；current registry no-match 不是 semantic none。' }),
        Object.freeze({ id:'GREE-R06-REALIZED-AUTHORIZED', output:EXECUTION_STATES.REALIZED, statement:'relation 已兑现、endpoint provenance 完整且 effect type 有唯一 source-backed authorization 时，执行对应 relation effect，同时原样保留 endpoint shape。' }),
        Object.freeze({ id:'GREE-R07-FAIL-CLOSED', output:EXECUTION_STATES.UNRESOLVED, statement:'endpoint / authorization provenance 不完整、冲突或 unsupported shape 时保持 unresolved。' })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-CONTRACT-001',
        version:VERSION,
        kernelScope:'authorization-gated-generic-relation-effect-execution',
        targetInput:'generic-target-level-resolver-unit-resolution-v0.1',
        sourceEndpointInput:'explicit-source-scoped-relation-endpoint',
        relationIdentityRequired:true,
        realizationStateRequired:true,
        sourceBackedEffectTypeAuthorizationRequiredForPositiveEffect:true,
        genericExecutionKernelDefined:true,
        genericEffectTypeMappingDefined:false,
        relationIdentityAloneDefinesEffectType:false,
        functionTypeAloneDefinesEffectType:false,
        endpointShapeAloneDefinesEffectType:false,
        tenGodRoleAloneDefinesEffectType:false,
        realizationAloneDefinesEffectType:false,
        currentRegistryNoMatchMeansNoEffect:false,
        actorToActorSupported:true,
        actorToGroupSupported:true,
        groupToActorSupported:true,
        groupToGroupSupported:false,
        groupEndpointMayExpandToMembers:false,
        relationDirectionPreserved:true,
        notRealizedCreatesReverseEffect:false,
        unresolvedCreatesEffect:false,
        roleClassExecutesChartEffect:false,
        configurationExecutesRelationEffect:false,
        noRelationTargetExecutesEffect:false,
        membershipMutation:false,
        actorGlobalParty:false,
        actorGlobalEffectiveness:false,
        transitiveClosure:false,
        enemyOfEnemyShortcut:false,
        relativeDominanceMapping:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        allowedRelationTypes:freezeArray(relationEffectContract.CONTRACT.relationTypes || []),
        supportedEndpointShapes:freezeArray(endpointContract.CONTRACT.knownIdentityShapes || []),
        requiredProvenanceGates:freezeArray(generalizationSource.REQUIRED_PROVENANCE_GATES || []),
        decisionRules:DECISION_RULES,
        statement:'Generic Relation Effect Execution v0.1 只解决“已有明确 endpoint、relation identity、realization 与 source-backed effect-type authorization 时，如何一致执行 relation effect”。它不从 generation/restraint/peer shape、十神角色、endpoint shape 或 registry no-match 推导 effect type，因此 generic effect-type mapping 继续 unresolved。'
    });

    GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        AUTHORIZATION_STATES,
        EXECUTION_STATES,
        REALIZATION_STATES,
        NON_ACTIONABLE_TARGET_LEVELS,
        ENDPOINT_TYPES:endpointContract.ENDPOINT_TYPES,
        IDENTITY_SHAPES:endpointContract.IDENTITY_SHAPES,
        TARGET_LEVELS:targetResolverContract.TARGET_LEVELS,
        TARGET_RESOLUTION_STATES:targetResolverContract.RESOLUTION_STATES,
        TARGET_REFERENCE_TYPES:targetResolverContract.TARGET_REFERENCE_TYPES,
        RELATION_TYPES:relationEffectContract.RELATION_TYPES,
        DECISION_RULES,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
