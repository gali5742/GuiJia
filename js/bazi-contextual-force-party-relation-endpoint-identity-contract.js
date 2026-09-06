(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationEndpointIdentityContract?.installed) return;

    const actorContract = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const actorToGroupContract = GuiJia.baziContextualForcePartyCollectiveRelationEffectContract || null;
    const groupToActorContract = GuiJia.baziContextualForcePartyCollectiveMediationEffectContract || null;
    if (!actorContract || !actorToGroupContract || !groupToActorContract) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const ENDPOINT_TYPES = Object.freeze({
        ACTOR:'actor',
        ACTOR_GROUP:'actor-group'
    });

    const IDENTITY_SHAPES = Object.freeze({
        ACTOR_TO_ACTOR:'actor-to-actor',
        ACTOR_TO_GROUP:'actor-to-group',
        GROUP_TO_ACTOR:'group-to-actor',
        GROUP_TO_GROUP:'group-to-group'
    });

    const KNOWN_SHAPE_REGISTRY = Object.freeze({
        [IDENTITY_SHAPES.ACTOR_TO_ACTOR]:Object.freeze({
            identityShape:IDENTITY_SHAPES.ACTOR_TO_ACTOR,
            sourceEndpointType:ENDPOINT_TYPES.ACTOR,
            targetEndpointType:ENDPOINT_TYPES.ACTOR,
            authorityContractId:actorContract.CONTRACT.id,
            currentRelationTypes:freezeArray(actorContract.CONTRACT.relationTypes || []),
            endpointShapeDefinesEffectType:false
        }),
        [IDENTITY_SHAPES.ACTOR_TO_GROUP]:Object.freeze({
            identityShape:IDENTITY_SHAPES.ACTOR_TO_GROUP,
            sourceEndpointType:ENDPOINT_TYPES.ACTOR,
            targetEndpointType:ENDPOINT_TYPES.ACTOR_GROUP,
            authorityContractId:actorToGroupContract.CONTRACT.id,
            currentRelationTypes:freezeArray(actorToGroupContract.CONTRACT.allowedRelationTypes || [actorToGroupContract.RELATION_TYPE]),
            endpointShapeDefinesEffectType:false
        }),
        [IDENTITY_SHAPES.GROUP_TO_ACTOR]:Object.freeze({
            identityShape:IDENTITY_SHAPES.GROUP_TO_ACTOR,
            sourceEndpointType:ENDPOINT_TYPES.ACTOR_GROUP,
            targetEndpointType:ENDPOINT_TYPES.ACTOR,
            authorityContractId:groupToActorContract.CONTRACT.id,
            currentRelationTypes:freezeArray(groupToActorContract.CONTRACT.allowedRelationTypes || [groupToActorContract.RELATION_TYPE]),
            endpointShapeDefinesEffectType:false
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-CONTRACT-001',
        version:VERSION,
        resolverScope:'known-relation-endpoint-identity-shapes-only',
        endpointTypes:freezeArray(Object.values(ENDPOINT_TYPES)),
        knownIdentityShapes:freezeArray(Object.keys(KNOWN_SHAPE_REGISTRY)),
        actorToActorDefined:true,
        actorToGroupDefined:true,
        groupToActorDefined:true,
        groupToGroupDefined:false,
        relationEndpointIdentityMayBeActorOrResolvedFiniteGroup:true,
        sourceAndTargetEndpointTypesMustBeExplicit:true,
        groupEndpointRequiresSourceScopedFiniteIdentity:true,
        endpointShapeDefinesEffectType:false,
        endpointShapeDefinesRealization:false,
        endpointShapeDefinesMembership:false,
        endpointShapeDefinesForce:false,
        endpointShapeDefinesRelativeDominance:false,
        relationDirectionPreserved:true,
        actorToGroupMayReverseToGroupToActor:false,
        groupToActorMayReverseToActorToGroup:false,
        groupEndpointMayExpandToMembers:false,
        groupToGroupInferenceFromTwoGroups:false,
        genericRelationEffectResolverDefined:false,
        genericVisibleEdgeMappingResolved:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        finalStrengthMapping:false,
        statement:'Relation Endpoint Identity v0.1 只统一关系两端“actor / resolved finite actor-group”的身份类型与方向。目前已合法存在 actor→actor、actor→group、group→actor 三种 shape；group→group 保持未定义。Endpoint shape 只解决关系两端是谁，不决定 relation effect 类型、realization、membership、力量或相对强弱。'
    });

    GuiJia.baziContextualForcePartyRelationEndpointIdentityContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        ENDPOINT_TYPES,
        IDENTITY_SHAPES,
        KNOWN_SHAPE_REGISTRY,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
