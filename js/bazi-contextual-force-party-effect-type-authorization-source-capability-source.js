(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyEffectTypeAuthorizationSourceCapabilitySource?.installed) return;

    const normalizedContract = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputContract || null;
    const relationEffectContract = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const collectiveOppositionContract = GuiJia.baziContextualForcePartyCollectiveRelationEffectContract || null;
    const collectiveMediationContract = GuiJia.baziContextualForcePartyCollectiveMediationEffectContract || null;
    const generalizationSource = GuiJia.baziContextualForcePartyRelationEffectGeneralizationSource || null;
    const visibleAuthorizationSource = GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource || null;
    const modernSupportSource = GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource || null;
    if (!normalizedContract || !relationEffectContract || !collectiveOppositionContract || !collectiveMediationContract || !generalizationSource || !visibleAuthorizationSource || !modernSupportSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-EFFECT-TYPE-AUTHORIZATION-SOURCE-CAPABILITY-AUDIT-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const CAPABILITY_STATES = Object.freeze({
        SUPPORTED:'supported',
        SUPPORTED_WITH_GATES:'supported-with-provenance-gates',
        EXACT_SOURCE_ONLY:'exact-source-only',
        REJECTED:'rejected-as-generalization-basis',
        NOT_DEFINED:'not-defined'
    });

    const GENERALIZATION_LEVELS = Object.freeze({
        EXACT_SOURCE_RECORD:'exact-source-record',
        REGISTERED_MOTIF_FAMILY:'registered-source-backed-motif-family',
        CROSS_ENDPOINT_MOTIF_TRANSFER:'cross-endpoint-motif-transfer',
        ROLE_FUNCTION_GENERIC:'ten-god-role-x-function-generic-map',
        FUNCTION_GENERIC:'function-shape-generic-map',
        ENDPOINT_GENERIC:'endpoint-shape-generic-map',
        GLOBAL_RELATION_RESOLVER:'global-relation-effect-type-resolver'
    });

    const ENDPOINT_FRONTIER = Object.freeze({
        [normalizedContract.IDENTITY_SHAPES.ACTOR_TO_ACTOR]:Object.freeze({
            state:CAPABILITY_STATES.SUPPORTED_WITH_GATES,
            maximumCurrentAuthorizationLevel:GENERALIZATION_LEVELS.REGISTERED_MOTIF_FAMILY,
            authorityIds:freezeArray((relationEffectContract.MOTIFS || []).map((item) => item.id)),
            requiredInputAuthority:'registered-source-backed-motif + independently-resolved target-specific realization',
            positiveDirectCalibrationObserved:visibleAuthorizationSource.CONTRACT.positiveAuthorizedDirectPatternObserved === true,
            boundary:'只允许命中已登记 actor→actor motif family；不得由任意十神对、generation/restraint/peer shape 或 source wording 自行扩张 registry。'
        }),
        [normalizedContract.IDENTITY_SHAPES.ACTOR_TO_GROUP]:Object.freeze({
            state:CAPABILITY_STATES.EXACT_SOURCE_ONLY,
            maximumCurrentAuthorizationLevel:GENERALIZATION_LEVELS.EXACT_SOURCE_RECORD,
            authorityIds:freezeArray(Object.values(collectiveOppositionContract.FINITE_COLLECTIVE_EFFECT_REGISTRY || {}).map((item) => item.id)),
            requiredInputAuthority:'exact-source-case-collective-outcome',
            positiveDirectCalibrationObserved:true,
            boundary:'现有 collective opposition 只能作为 exact-source actor→group authority；不得把“制杀”或 restraint motif 自动转移到任意 actor-group。'
        }),
        [normalizedContract.IDENTITY_SHAPES.GROUP_TO_ACTOR]:Object.freeze({
            state:CAPABILITY_STATES.EXACT_SOURCE_ONLY,
            maximumCurrentAuthorizationLevel:GENERALIZATION_LEVELS.EXACT_SOURCE_RECORD,
            authorityIds:freezeArray(Object.values(collectiveMediationContract.FINITE_COLLECTIVE_MEDIATION_REGISTRY || {}).map((item) => item.id)),
            requiredInputAuthority:'exact-source-case-collective-source-outcome',
            positiveDirectCalibrationObserved:true,
            boundary:'现有 group→actor mediation 只覆盖 exact source case；不得把多杀→印、generation 或“化杀”字样自动推广为 generic group-source mediation。'
        }),
        [normalizedContract.IDENTITY_SHAPES.GROUP_TO_GROUP]:Object.freeze({
            state:CAPABILITY_STATES.NOT_DEFINED,
            maximumCurrentAuthorizationLevel:null,
            authorityIds:Object.freeze([]),
            requiredInputAuthority:null,
            positiveDirectCalibrationObserved:false,
            boundary:'group→group endpoint identity/effect execution 尚未定义。'
        })
    });

    const CAPABILITIES = freezeArray([
        Object.freeze({
            id:'CF-EASC-C01',
            key:'exact-source-record-authorization',
            state:CAPABILITY_STATES.SUPPORTED,
            level:GENERALIZATION_LEVELS.EXACT_SOURCE_RECORD,
            evidenceIds:freezeArray(['CF-REG-F01']),
            statement:'现有 source-backed effect records 可以继续作为 positive authorization；R5 已统一其 provenance schema。'
        }),
        Object.freeze({
            id:'CF-EASC-C02',
            key:'registered-actor-to-actor-motif-family-authorization',
            state:CAPABILITY_STATES.SUPPORTED_WITH_GATES,
            level:GENERALIZATION_LEVELS.REGISTERED_MOTIF_FAMILY,
            evidenceIds:freezeArray(['CF-REG-E01','CF-REG-E02','CF-REG-E03','CF-VEA-E01','CF-VEA-E03']),
            statement:'actor→actor 当前可识别的最高可复用语义粒度是已登记 source-backed motif family；仍必须同时满足角色模式、function、方向、target-specific realization 与 provenance gate。'
        }),
        Object.freeze({
            id:'CF-EASC-C03',
            key:'cross-endpoint-motif-transfer',
            state:CAPABILITY_STATES.REJECTED,
            level:GENERALIZATION_LEVELS.CROSS_ENDPOINT_MOTIF_TRANSFER,
            evidenceIds:freezeArray(['CF-REG-E01','CF-REG-E02','CF-REG-E03']),
            statement:'actor→actor motif 的授权不能仅因 effect type/function 相同就转移到 actor→group 或 group→actor；collective endpoint 目前仍由独立 exact-source contract 授权。'
        }),
        Object.freeze({
            id:'CF-EASC-C04',
            key:'ten-god-role-x-function-generic-map',
            state:CAPABILITY_STATES.NOT_DEFINED,
            level:GENERALIZATION_LEVELS.ROLE_FUNCTION_GENERIC,
            evidenceIds:freezeArray(['CF-RSMS-E02','CF-RSMS-E04','CF-RSMS-E05','CF-VEA-E01','CF-VEA-E03']),
            statement:'十神角色与 function 的组合仍不足以独立决定 executable relation/effect；相同角色 inventory 可因位置与 relation path 改变实际解释。'
        }),
        Object.freeze({
            id:'CF-EASC-C05',
            key:'function-shape-generic-map',
            state:CAPABILITY_STATES.REJECTED,
            level:GENERALIZATION_LEVELS.FUNCTION_GENERIC,
            evidenceIds:freezeArray(['CF-REG-F03','CF-REG-F04','CF-REG-F05','CF-REG-F06','CF-VEA-E03']),
            statement:'generation/restraint/peer 不能直接映射 augmentation/opposition/mediation；realized edge 也可以合法保持 unmapped。'
        }),
        Object.freeze({
            id:'CF-EASC-C06',
            key:'endpoint-shape-generic-map',
            state:CAPABILITY_STATES.REJECTED,
            level:GENERALIZATION_LEVELS.ENDPOINT_GENERIC,
            evidenceIds:Object.freeze([]),
            statement:'actor/group endpoint shape 只表达 relation identity，不携带 effect-type 语义。'
        }),
        Object.freeze({
            id:'CF-EASC-C07',
            key:'position-and-path-free-authorization',
            state:CAPABILITY_STATES.REJECTED,
            level:GENERALIZATION_LEVELS.GLOBAL_RELATION_RESOLVER,
            evidenceIds:freezeArray(['CF-RSMS-E02','CF-RSMS-E04','CF-RSMS-E05']),
            statement:'来源明确支持 position-sensitive / competing relation path；generic authorization 不能绕过上游 position/path disambiguation。'
        }),
        Object.freeze({
            id:'CF-EASC-C08',
            key:'raw-cardinality-or-member-count-authorizes-effect-type',
            state:CAPABILITY_STATES.REJECTED,
            level:GENERALIZATION_LEVELS.GLOBAL_RELATION_RESOLVER,
            evidenceIds:freezeArray(['CF-RSMS-E01','CF-RSMS-E03']),
            statement:'actor-set/cardinality 是 provenance 与 capacity 线索，不是等值投票或 effect-type authorization。'
        }),
        Object.freeze({
            id:'CF-EASC-C09',
            key:'global-effect-type-authorization-resolver',
            state:CAPABILITY_STATES.NOT_DEFINED,
            level:GENERALIZATION_LEVELS.GLOBAL_RELATION_RESOLVER,
            evidenceIds:Object.freeze([]),
            statement:'当前来源尚不足以定义覆盖任意 endpoint/scope/relation 的 global effect-type authorization resolver。'
        })
    ]);

    const REQUIRED_AUTHORIZATION_SIGNATURE = Object.freeze({
        sourceAndTargetIdentity:true,
        sourceAndTargetRolePatternForRegisteredMotifs:true,
        functionType:true,
        directedRelationIdentity:true,
        targetSpecificRealization:true,
        sourcePatternOrEquivalentSemanticAuthority:true,
        sourceBackedEffectTypeAuthority:true,
        positionAndPathProvenanceWhenSourceSensitive:true,
        cardinalityAndGroupMembershipWhenGrouped:true,
        sourceScopePreserved:true,
        sourceWordingAsDecisionFeature:false,
        caseIdAsDecisionFeature:false,
        rawCountAsDecisionFeature:false
    });

    const BLOCKERS_TO_GLOBAL_RESOLVER = freezeArray([
        Object.freeze({ id:'CF-EASC-B01', key:'positive-actor-to-actor-motif-execution-calibration', resolved:visibleAuthorizationSource.CONTRACT.positiveAuthorizedDirectPatternObserved === true, statement:'actor→actor registered motif family 仍需要真实 direct-source positive calibration；文本授权与 executable calibration 不应混为一层。' }),
        Object.freeze({ id:'CF-EASC-B02', key:'position-provenance-resolver', resolved:modernSupportSource.CONTRACT.relationPositionProvenanceResolverDefined === true, statement:'position provenance 已被来源证明重要，但 resolver 尚未定义。' }),
        Object.freeze({ id:'CF-EASC-B03', key:'competing-relation-path-resolver', resolved:modernSupportSource.CONTRACT.competingRelationPathResolverDefined === true, statement:'competing relation paths 已被来源证明存在，但 resolver 尚未定义。' }),
        Object.freeze({ id:'CF-EASC-B04', key:'cross-endpoint-semantic-generalization', resolved:false, statement:'actor→group / group→actor 仍停在 exact-source authorization，尚无 source-backed motif transfer rule。' }),
        Object.freeze({ id:'CF-EASC-B05', key:'branch-hidden-structure-scope-coverage', resolved:false, statement:'当前 effect authorization frontier 主要在 visible/finite source cases；branch、hidden、Structure→actor-pair 与 cross-scope coverage 尚未闭合。' })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-EFFECT-TYPE-AUTHORIZATION-SOURCE-CAPABILITY-AUDIT-CONTRACT-001',
        version:VERSION,
        sourceCapabilityAuditOnly:true,
        secondOrderAuditOfExistingEvidence:true,
        newTextualAuthorityIntroduced:false,
        maximumReusableActorToActorLevel:GENERALIZATION_LEVELS.REGISTERED_MOTIF_FAMILY,
        collectiveEndpointAuthorizationLevel:GENERALIZATION_LEVELS.EXACT_SOURCE_RECORD,
        crossEndpointMotifTransferAuthorized:false,
        roleFunctionGenericMapDefined:false,
        functionGenericMapDefined:false,
        endpointGenericMapDefined:false,
        genericEffectTypeAuthorizationResolverDefined:false,
        positionPathDisambiguationMayBeSkipped:false,
        rawCardinalityAuthorizesEffectType:false,
        relationPresenceAuthorizesEffectType:false,
        realizationAloneAuthorizesEffectType:false,
        sourceWordingAuthorizesEffectType:false,
        sourceCaseIdAuthorizesEffectType:false,
        actorGlobalParty:false,
        transitiveClosure:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        endpointFrontier:ENDPOINT_FRONTIER,
        requiredAuthorizationSignature:REQUIRED_AUTHORIZATION_SIGNATURE,
        blockersToGlobalResolver:BLOCKERS_TO_GLOBAL_RESOLVER,
        statement:'Source Capability Audit v0.1 的结论是分层而非全局授权：actor→actor 最多可推进到“已登记 source-backed motif family + 独立 realization/provenance gates”；actor→group 与 group→actor 仍只能 exact-source；group→group 未定义。十神×function、function shape、endpoint shape、原文措辞、case id 或 cardinality 均不足以单独发放 effect type。'
    });

    GuiJia.baziContextualForcePartyEffectTypeAuthorizationSourceCapabilitySource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CAPABILITY_STATES,
        GENERALIZATION_LEVELS,
        ENDPOINT_FRONTIER,
        CAPABILITIES,
        REQUIRED_AUTHORIZATION_SIGNATURE,
        BLOCKERS_TO_GLOBAL_RESOLVER,
        CONTRACT,
        sourceEvidence:Object.freeze({
            relationEffectGeneralizationEvidence:freezeArray(generalizationSource.EVIDENCE || []),
            visibleAuthorizationEvidence:freezeArray(visibleAuthorizationSource.EVIDENCE || []),
            modernSupportEvidence:freezeArray(modernSupportSource.EVIDENCE || [])
        })
    });
})(typeof window !== 'undefined' ? window : globalThis);
