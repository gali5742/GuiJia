(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputContract?.installed) return;

    const executionContract = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract || null;
    const actorContract = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const actorToGroupContract = GuiJia.baziContextualForcePartyCollectiveRelationEffectContract || null;
    const groupToActorContract = GuiJia.baziContextualForcePartyCollectiveMediationEffectContract || null;
    if (!executionContract || !actorContract || !actorToGroupContract || !groupToActorContract) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const SOURCE_FAMILIES = Object.freeze({
        ACTOR_TO_ACTOR_KNOWN_MOTIF:'actor-to-actor-known-motif',
        ACTOR_TO_GROUP_FINITE_OUTCOME:'actor-to-group-finite-outcome',
        GROUP_TO_ACTOR_FINITE_MEDIATION:'group-to-actor-finite-mediation'
    });

    const NORMALIZATION_STATES = Object.freeze({
        RESOLVED:'resolved-source-backed-effect-authorization-input',
        UNRESOLVED:'unresolved-effect-authorization-input'
    });

    const AUTHORITY_KINDS = Object.freeze({
        KNOWN_MOTIF:'known-source-backed-relation-effect-motif',
        EXACT_COLLECTIVE_OUTCOME:'exact-source-case-collective-outcome',
        EXACT_COLLECTIVE_MEDIATION:'exact-source-case-collective-source-outcome'
    });

    const SOURCE_FAMILY_REGISTRY = Object.freeze({
        [SOURCE_FAMILIES.ACTOR_TO_ACTOR_KNOWN_MOTIF]:Object.freeze({
            endpointShape:executionContract.IDENTITY_SHAPES.ACTOR_TO_ACTOR,
            sourceContractId:actorContract.CONTRACT.id,
            sourceRuleId:actorContract.RULE_ID,
            authorityKind:AUTHORITY_KINDS.KNOWN_MOTIF,
            sourceRecords:'contextualForcePartyRelationEffectView.records'
        }),
        [SOURCE_FAMILIES.ACTOR_TO_GROUP_FINITE_OUTCOME]:Object.freeze({
            endpointShape:executionContract.IDENTITY_SHAPES.ACTOR_TO_GROUP,
            sourceContractId:actorToGroupContract.CONTRACT.id,
            sourceRuleId:actorToGroupContract.RULE_ID,
            authorityKind:AUTHORITY_KINDS.EXACT_COLLECTIVE_OUTCOME,
            sourceRecords:'contextualForcePartyCollectiveRelationEffectRecords'
        }),
        [SOURCE_FAMILIES.GROUP_TO_ACTOR_FINITE_MEDIATION]:Object.freeze({
            endpointShape:executionContract.IDENTITY_SHAPES.GROUP_TO_ACTOR,
            sourceContractId:groupToActorContract.CONTRACT.id,
            sourceRuleId:groupToActorContract.RULE_ID,
            authorityKind:AUTHORITY_KINDS.EXACT_COLLECTIVE_MEDIATION,
            sourceRecords:'contextualForcePartyCollectiveMediationEffectRecords'
        })
    });

    const ACTOR_TO_ACTOR_MOTIFS = freezeArray((actorContract.MOTIFS || []).map((motif) => Object.freeze({
        id:motif.id,
        relationType:motif.relationType,
        functionType:motif.functionType,
        inputAuthority:motif.inputAuthority,
        sourceRegistryEvidenceIds:freezeArray(motif.sourceRegistryEvidenceIds || [])
    })));

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT-CONTRACT-001',
        version:VERSION,
        normalizationScope:'currently-validated-source-backed-effect-authority-families',
        normalizedAuthorizationTarget:'generic-relation-effect-execution-authorization-v0.1',
        currentSourceFamilies:freezeArray(Object.values(SOURCE_FAMILIES)),
        currentEndpointShapes:freezeArray(Object.values(SOURCE_FAMILY_REGISTRY).map((item) => item.endpointShape)),
        sourceFamilyRegistry:SOURCE_FAMILY_REGISTRY,
        sourceRecordMustAlreadyBeValidated:true,
        sourceBackedAuthorityRequired:true,
        relationTypeMustBeExplicitInSourceRecord:true,
        functionTypeMustBeExplicitInSourceRecord:true,
        endpointIdentityMustBeExplicit:true,
        sourceContractIdentityPreserved:true,
        sourceRuleIdentityPreserved:true,
        sourceRecordIdentityPreserved:true,
        sourceCaseIdentityPreservedWhenPresent:true,
        sourceAuthorityIdentityPreserved:true,
        sourceEvidenceIdentityPreserved:true,
        sourceWordingPreservedAsProvenanceOnly:true,
        sourceWordingIsDecisionFeature:false,
        sourceCaseIdAloneDefinesEffectType:false,
        sourceFamilyAloneDefinesEffectType:false,
        endpointShapeAloneDefinesEffectType:false,
        functionTypeAloneDefinesEffectType:false,
        tenGodRoleAloneDefinesEffectType:false,
        realizationAloneDefinesEffectType:false,
        currentRegistryNoMatchMeansNoEffect:false,
        normalizedInputDefinesNewEffectType:false,
        genericEffectTypeAuthorizationResolverDefined:false,
        broaderSourceCoverageProven:false,
        groupEndpointMayExpandToMembers:false,
        groupToGroupSupported:false,
        membershipMutation:false,
        relativeDominanceMapping:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        ranking:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        allowedRelationTypes:freezeArray(executionContract.CONTRACT.allowedRelationTypes || []),
        statement:'Effect Authorization Normalized Input v0.1 只把已经由各自 source-backed contract 验证过的 actor→actor motif、actor→group exact outcome、group→actor exact mediation authority 规整成 Generic Relation Effect Execution 可消费的统一 authorization schema。规整层只搬运与校验 provenance，不从 function shape、endpoint shape、source wording、case id 或十神角色推导新的 effect type。'
    });

    GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCE_FAMILIES,
        NORMALIZATION_STATES,
        AUTHORITY_KINDS,
        SOURCE_FAMILY_REGISTRY,
        ACTOR_TO_ACTOR_MOTIFS,
        AUTHORIZATION_STATES:executionContract.AUTHORIZATION_STATES,
        REALIZATION_STATES:executionContract.REALIZATION_STATES,
        ENDPOINT_TYPES:executionContract.ENDPOINT_TYPES,
        IDENTITY_SHAPES:executionContract.IDENTITY_SHAPES,
        TARGET_LEVELS:executionContract.TARGET_LEVELS,
        TARGET_RESOLUTION_STATES:executionContract.TARGET_RESOLUTION_STATES,
        TARGET_REFERENCE_TYPES:executionContract.TARGET_REFERENCE_TYPES,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
