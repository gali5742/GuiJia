(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit?.installed) return;

    const sourceApi = GuiJia.baziContextualForcePartyEffectTypeAuthorizationSourceCapabilitySource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const {
        VERSION,
        RULE_ID,
        CAPABILITY_STATES,
        GENERALIZATION_LEVELS,
        ENDPOINT_FRONTIER,
        CAPABILITIES,
        REQUIRED_AUTHORIZATION_SIGNATURE,
        BLOCKERS_TO_GLOBAL_RESOLVER,
        CONTRACT
    } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];

    const unresolvedBlockers = () => freezeArray(BLOCKERS_TO_GLOBAL_RESOLVER.filter((item) => item.resolved !== true));

    const buildAudit = (synthesis = {}) => {
        const endpointRecords = freezeArray(Object.entries(ENDPOINT_FRONTIER).map(([identityShape, item]) => Object.freeze({ identityShape, ...item })));
        const reusableActorToActor = endpointRecords.find((item) => item.identityShape === 'actor-to-actor') || null;
        const unresolved = unresolvedBlockers();
        const normalizedAudit = synthesis.contextualForcePartyEffectAuthorizationNormalizedInput || null;
        return Object.freeze({
            id:'CF-PARTY-EFFECT-TYPE-AUTHORIZATION-SOURCE-CAPABILITY-AUDIT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:'source-capability-frontier-audited-global-resolver-unresolved',
            contract:CONTRACT,
            endpointFrontier:endpointRecords,
            capabilities:CAPABILITIES,
            requiredAuthorizationSignature:REQUIRED_AUTHORIZATION_SIGNATURE,
            blockersToGlobalResolver:BLOCKERS_TO_GLOBAL_RESOLVER,
            unresolvedGlobalResolverBlockers:unresolved,
            unresolvedGlobalResolverBlockerCount:unresolved.length,
            actorToActorMaximumLevel:reusableActorToActor?.maximumCurrentAuthorizationLevel || null,
            actorToActorRegisteredAuthorityCount:reusableActorToActor?.authorityIds?.length || 0,
            actorToActorPositiveDirectCalibrationObserved:reusableActorToActor?.positiveDirectCalibrationObserved === true,
            currentNormalizedAuthorityCoverageComplete:normalizedAudit?.providedSourceRecordCoverageComplete === true,
            narrowActorToActorMotifResolverCandidate:reusableActorToActor?.maximumCurrentAuthorizationLevel === GENERALIZATION_LEVELS.REGISTERED_MOTIF_FAMILY,
            collectiveMotifTransferAuthorized:false,
            roleFunctionGenericMapDefined:false,
            functionGenericMapDefined:false,
            endpointGenericMapDefined:false,
            globalEffectTypeAuthorizationResolverDefined:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-EFFECT-TYPE-AUTHORIZATION-SOURCE-CAPABILITY-AUDIT',
        claimKey:'strength.contextual-force.party.relation-effect.effect-type-authorization.source-capability-audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            sourceCapabilityFrontierAudited:true,
            actorToActorMaximumLevel:audit.actorToActorMaximumLevel,
            actorToActorRegisteredAuthorityCount:audit.actorToActorRegisteredAuthorityCount,
            actorToActorPositiveDirectCalibrationObserved:audit.actorToActorPositiveDirectCalibrationObserved,
            collectiveAuthorizationLevel:GENERALIZATION_LEVELS.EXACT_SOURCE_RECORD,
            crossEndpointMotifTransferAuthorized:false,
            roleFunctionGenericMapDefined:false,
            functionGenericMapDefined:false,
            globalResolverDefined:false,
            unresolvedGlobalResolverBlockerCount:audit.unresolvedGlobalResolverBlockerCount
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(unique(CAPABILITIES.flatMap((item) => item.evidenceIds || []))),
        rationale:'现有 traditional source audit、visible-edge authorization audit、modern relation-semantics audit 与 R5 normalized authority contract 可以共同确定授权能力边界：actor→actor 最多推进到已登记 motif family + provenance/realization gates；collective endpoint 仍 exact-source；更宽泛映射没有来源授权。',
        boundary:'本 claim 只确认“来源允许泛化到哪里、禁止跨过哪里”；不实现 effect-type resolver，不新增 motif，不把 source wording/case id/function/endpoint/cardinality 变成授权捷径。'
    });

    const makeDependency = ({ id, kind = 'source-audit', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(unique(CAPABILITIES.flatMap((item) => item.evidenceIds || []))),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildAuditDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-EFFECT-TYPE-AUTHORIZATION-SOURCE-CAPABILITY-AUDIT',
        scope:'source-supported-effect-type-authorization-generalization-frontier',
        status:'resolved',
        statement:'R6 Source Capability Audit 已确定当前来源能力前沿：actor→actor 可在已登记 source-backed motif family 内讨论复用；actor→group / group→actor 仍 exact-source；group→group 未定义。',
        boundary:'Source capability audit resolved 不等于 generic effect-type resolver resolved，也不等于 motif family 可跳过 position/path/realization provenance。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-SOURCE-AUDIT',
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-EFFECT-TYPE-AUTHORIZATION-AUDIT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-EFFECT-TYPE-AUTHORIZATION-SOURCE-CAPABILITY-AUDIT']
    });

    const rebuildGenericResolverDependency = (base = {}, auditDependency = {}, audit = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-EFFECT-TYPE-AUTHORIZATION-RESOLVER') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-EFFECT-TYPE-AUTHORIZATION-RESOLVER',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([...(current.dependsOnDependencyIds || []),auditDependency.id])),
            resolvedByClaimIds:Object.freeze([]),
            statement:`Source capability frontier 已审计，但 global resolver 仍有 ${audit.unresolvedGlobalResolverBlockerCount} 个 blocker。当前唯一可考虑的窄化下一步是 registered actor→actor motif authorization matcher；collective endpoint 仍不能 motif-transfer。`,
            boundary:'即使开发 narrow matcher，也只能匹配 registry 已有 motif，并消费上游已解析的 identity/function/direction/realization/position-path provenance；不得生成新 relation、扩充 motif 或把 no-match 解释成 none。'
        });
    };

    const rebuildUnresolvedDependency = (base = {}, id = '', additions = [], statement, boundary) => {
        const current = (base.dependencies || []).find((item) => item.id === id) || {};
        return Object.freeze({
            ...current,
            id,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([...(current.dependsOnDependencyIds || []),...additions.map((item) => item.id)])),
            resolvedByClaimIds:Object.freeze([]),
            statement:statement || current.statement || '',
            boundary:boundary || current.boundary || ''
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyEffectAuthorizationNormalizedInput) return base;

        const audit = buildAudit(base);
        const claim = makeClaim(audit);
        const auditDependency = buildAuditDependency();
        const genericResolverDependency = rebuildGenericResolverDependency(base, auditDependency, audit);
        const visibleMappingDependency = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
            [auditDependency,genericResolverDependency],
            'R6 已确认 visible actor→actor 的 source-supported reusable frontier 是 registered motif family，而不是任意 role/function 或 function-shape mapping；positive direct calibration 与 position/path resolver 等条件仍限制 executable promotion。',
            '不得把“motif family 可复用”扩大为“所有同十神/function relation 都自动得到 effect type”；no-match 继续保持 unmapped。'
        );
        const generalizationDependency = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            [auditDependency,genericResolverDependency],
            'Cross-Actor Relation Effect 已有 normalized authority 与 generic execution，并完成 source capability frontier 审计；但 global effect-type authorization、position/path resolver、collective motif transfer、branch/hidden/Structure scope coverage 尚未闭合。',
            '当前最多允许开发窄化 actor→actor registered-motif matcher；不得直接进入 Relative Dominance 或宣称全局 relation effect generalization 完成。'
        );

        const replacedDependencyIds = new Set([auditDependency.id,genericResolverDependency.id,visibleMappingDependency.id,generalizationDependency.id]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id),claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            auditDependency,
            genericResolverDependency,
            visibleMappingDependency,
            generalizationDependency
        ]);
        const conflicts = typeof priorSynthesisApi.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit:audit,
            contextualForcePartyEffectTypeAuthorizationSourceCapabilityRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'R6 Source Capability Audit 不新增术数规则，只审计现有来源允许的 effect-type authorization 泛化粒度。',
                'actor→actor 的最高当前复用层是 registered source-backed motif family，且必须与独立 target-specific realization、方向及 provenance gate 联合。',
                'actor→group / group→actor 仍 exact-source；group→group 未定义；不同 endpoint family 之间不得自动 motif transfer。',
                'role×function、function shape、endpoint shape、source wording、case id、raw cardinality 均不能单独决定 effect type。',
                '因此 Generic Effect-Type Authorization Resolver、Cross-Actor Relation Effect Generalization、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-effect-type-authorization-source-capability-audit-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CAPABILITY_STATES,
        GENERALIZATION_LEVELS,
        CONTRACT,
        sourceApi,
        unresolvedBlockers,
        buildAudit,
        buildAuditDependency,
        rebuildGenericResolverDependency,
        rebuildUnresolvedDependency,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
