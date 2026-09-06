(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationEndpointIdentity?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyRelationEndpointIdentityContract || null;
    const profileApi = GuiJia.baziContextualForcePartyRelationEndpointIdentityProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, IDENTITY_SHAPES, KNOWN_SHAPE_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const shapeIds = freezeArray(Object.keys(KNOWN_SHAPE_REGISTRY));

    const buildAudit = (synthesis = {}) => {
        const profile = profileApi.buildProfile(synthesis);
        return Object.freeze({
            id:'CF-PARTY-RELATION-ENDPOINT-IDENTITY-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.contractShapeCoverageComplete && profile.observedRecordsValid
                ? 'known-endpoint-identity-shapes-resolved'
                : 'known-endpoint-identity-shape-validation-partial',
            contract:CONTRACT,
            profile,
            knownIdentityShapes:shapeIds,
            contractShapeCoverageComplete:profile.contractShapeCoverageComplete,
            observedRecordsValid:profile.observedRecordsValid,
            groupToGroupDefined:false,
            endpointShapeDefinesEffectType:false,
            endpointShapeDefinesRealization:false,
            genericRelationEffectResolverDefined:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        });
    };

    const makeClaim = ({ id, claimKey, status, value, rationale, boundary }) => Object.freeze({
        id,
        claimKey,
        status,
        ruleId:RULE_ID,
        value:Object.freeze(value),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:Object.freeze([]),
        rationale,
        boundary
    });

    const makeContractClaim = () => makeClaim({
        id:'SC-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-CONTRACT',
        claimKey:'strength.contextual-force.party.relation-endpoint-identity.contract',
        status:'resolved',
        value:{
            knownIdentityShapes:shapeIds,
            groupToGroupDefined:false,
            endpointShapeDefinesEffectType:false,
            endpointShapeDefinesRealization:false
        },
        rationale:'现有 Relation Effect、Collective Relation Effect 与 Collective Mediation Effect 已分别建立 actor→actor、actor→group、group→actor 的独立 relation identity。把它们统一到 endpoint identity schema 可以修正“关系两端必须都是 actor”的旧假设，同时保留各自 effect contract。',
        boundary:'Endpoint identity 只回答 source/target 是 actor 还是 resolved finite group；不授权新的 relation type、realization、member edge 或 Strength 结论。'
    });

    const makeObservedCoverageClaim = (audit = {}) => makeClaim({
        id:'SC-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-KNOWN-SHAPE-COVERAGE',
        claimKey:'strength.contextual-force.party.relation-endpoint-identity.known-shape-coverage',
        status:audit.contractShapeCoverageComplete && audit.observedRecordsValid ? 'resolved' : 'unresolved',
        value:{
            contractShapeCoverageComplete:audit.contractShapeCoverageComplete,
            observedRecordsValid:audit.observedRecordsValid,
            observedRecordCount:audit.profile.observedRecordCount,
            blockerRecordCount:audit.profile.blockerRecords.length
        },
        rationale:audit.observedRecordsValid
            ? '当前 synthesis 中已出现的 relation-effect records 均符合其 actor/group endpoint shape；三类已实现 contract shape 完整保留方向。'
            : '至少一条已观察 relation-effect record 的 endpoint fields 与其声明/来源 bucket 不一致。',
        boundary:'Observed coverage 不是 corpus coverage；没有实例的 shape 仍由 contract 定义，且 group→group 不因存在两个 group 自动成立。'
    });

    const makeDependency = ({ id, kind = 'semantic-model', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:Object.freeze([]),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildContractDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-CONTRACT',
        scope:'relation-source-target-endpoint-identity-shape-contract',
        status:'resolved',
        statement:'Relation Endpoint Identity v0.1 已定义 actor→actor、actor→group、group→actor 三种已实现 relation identity shape，并明确 group→group 未定义。',
        boundary:'Endpoint shape 不决定 effect type、realization、membership、force 或 relative dominance。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL',
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION-CONTRACT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-CONTRACT']
    });

    const buildCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-KNOWN-SHAPE-COVERAGE',
        kind:'validation',
        scope:'known-relation-effect-record-endpoint-shape-validation',
        status:audit.contractShapeCoverageComplete && audit.observedRecordsValid ? 'resolved' : 'unresolved',
        statement:audit.contractShapeCoverageComplete && audit.observedRecordsValid
            ? `三种 known endpoint shape contract 已覆盖；当前观察到的 ${audit.profile.observedRecordCount} 条 relation-effect record 均通过 endpoint shape validator。`
            : `Endpoint shape contract/record validation 仍有 ${audit.profile.blockerRecords.length} 条 blocker。`,
        boundary:'记录验证通过只证明 endpoint identity 一致，不表示 relation effect generic mapping 已完成。',
        dependsOnDependencyIds:[contractDependency.id],
        resolvedByClaimIds:audit.contractShapeCoverageComplete && audit.observedRecordsValid
            ? ['SC-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-KNOWN-SHAPE-COVERAGE']
            : []
    });

    const rebuildUnresolvedDependency = (base = {}, id = '', additions = [], statement = null, boundary = null) => {
        const current = (base.dependencies || []).find((item) => item.id === id) || {};
        return Object.freeze({
            ...current,
            id,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([...(current.dependsOnDependencyIds || []), ...additions.map((item) => item.id)])),
            resolvedByClaimIds:Object.freeze([]),
            ...(statement ? { statement } : {}),
            ...(boundary ? { boundary } : {})
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const audit = buildAudit(base);
        const contractClaim = makeContractClaim();
        const coverageClaim = makeObservedCoverageClaim(audit);
        const contractDependency = buildContractDependency();
        const coverageDependency = buildCoverageDependency(contractDependency, audit);

        const genericVisibleMapping = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
            [contractDependency],
            null,
            'Generic visible-edge mapping 只处理 actor→actor visible edge；actor→group / group→actor collective records 是独立 endpoint shapes，不得拿来补 actor→actor effect-type mapping。'
        );

        const generalization = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            [contractDependency,coverageDependency],
            'Relation Effect Generalization 的 endpoint identity gate 已从“source/target 必须都是 actor”扩展为显式 actor/group endpoint shape；当前三种已实现 shape 已有 contract coverage。但 effect-type mapping、branch/Structure/hidden realization、broader corpus 与 competing path 等 gate 仍未闭合，因此 global generalization 继续 unresolved。',
            'Endpoint identity resolved 只移除身份形状歧义；不得把 finite collective calibration 当作 generic actor→actor evidence，也不得推导 group→group relation。'
        );

        const replacedClaimIds = new Set([contractClaim.id,coverageClaim.id]);
        const replacedDependencyIds = new Set([
            contractDependency.id,
            coverageDependency.id,
            genericVisibleMapping.id,
            generalization.id
        ]);
        const claims = Object.freeze([
            ...(base.claims || []).filter((item) => !replacedClaimIds.has(item.id)),
            contractClaim,
            coverageClaim
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            coverageDependency,
            genericVisibleMapping,
            generalization
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
            contextualForcePartyRelationEndpointIdentity:audit,
            contextualForcePartyRelationEndpointIdentityRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Relation Endpoint Identity v0.1：relation endpoints 可为 actor 或 source-scoped finite actor-group；当前合法 shape 为 actor→actor、actor→group、group→actor。',
                'group→group 尚未定义；两个 group 的存在不能自动构成 relation。',
                'Endpoint shape 与 effect type / realization 分层：actor→group opposition、group→actor mediation 是当前 source-scoped coverage，不是 shape→effect 通则。',
                '因此 Generic Visible-Edge Mapping、Cross-Actor Relation Effect Generalization、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-relation-endpoint-identity-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyRelationEndpointIdentity = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        IDENTITY_SHAPES,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
