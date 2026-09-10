(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInput?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputContract || null;
    const profileApi = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];

    const buildAudit = (synthesis = {}) => {
        const profile = profileApi.buildProfile(synthesis);
        const executionCalibration = profileApi.buildExecutionCalibration(synthesis);
        const executionCompatible = executionCalibration.compatible !== false;
        return Object.freeze({
            id:'CF-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.providedSourceRecordCoverageComplete && executionCompatible
                ? 'current-source-authorizations-normalized-execution-compatible'
                : 'effect-authorization-normalization-partial',
            contract:CONTRACT,
            profile,
            sourceRecordCount:profile.sourceRecordCount,
            normalizedRecordCount:profile.resolvedRecords.length,
            unresolvedRecordCount:profile.unresolvedRecords.length,
            familyCounts:profile.familyCounts,
            providedSourceRecordCoverageComplete:profile.providedSourceRecordCoverageComplete,
            executionCalibration,
            executionCompatibility:executionCalibration.compatible,
            executionMismatchCount:executionCalibration.mismatchCount,
            normalizedInputContractDefined:true,
            genericEffectTypeAuthorizationResolverDefined:false,
            broaderSourceCoverageProven:false,
            sourceWordingIsDecisionFeature:false,
            sourceCaseIdAloneDefinesEffectType:false,
            sourceFamilyAloneDefinesEffectType:false,
            memberEffectExpansion:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT',
        claimKey:'strength.contextual-force.party.relation-effect.effect-authorization-normalized-input',
        status:audit.providedSourceRecordCoverageComplete && audit.executionMismatchCount === 0 ? 'resolved' : 'unresolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            normalizedInputContractDefined:true,
            currentSourceFamilyCount:Object.keys(audit.familyCounts || {}).length,
            sourceRecordCount:audit.sourceRecordCount,
            normalizedRecordCount:audit.normalizedRecordCount,
            unresolvedRecordCount:audit.unresolvedRecordCount,
            executionMismatchCount:audit.executionMismatchCount,
            executionCompatibility:audit.executionCompatibility,
            genericEffectTypeAuthorizationResolverDefined:false,
            broaderSourceCoverageProven:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(unique((audit.profile?.resolvedRecords || []).flatMap((item) => item.provenance?.sourceEvidenceIds || []))),
        rationale:'当前 actor→actor known motif、actor→group exact collective outcome 与 group→actor exact collective mediation 三类已验证 authority 已被规整到同一 authorization schema，并可直接进入 Generic Relation Effect Execution；规整过程保留 contract/rule/record/case/authority/evidence provenance。',
        boundary:'本 claim 只证明 current validated source authority families 可无损规整与执行兼容；它不定义 arbitrary relation 的 effect type，不证明 broader source coverage，也不解决 Relative Dominance、Strength 或 Assessment。'
    });

    const makeDependency = ({ id, kind = 'semantic-model', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildContractDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT-CONTRACT',
        scope:'source-backed-effect-authorization-normalization-contract',
        status:'resolved',
        statement:'Effect Authorization Normalized Input v0.1 已定义统一 schema，将现有三类 source-backed authority 规整为 Generic Relation Effect Execution 可消费的 authorization input，同时原样保存 provenance。',
        boundary:'Contract resolved 不代表 generic effect-type authorization resolver resolved；normalization 不从 source wording、case id、function shape、endpoint shape 或十神角色推导 effect type。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION-CONTRACT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT']
    });

    const buildCoverageDependency = (audit = {}, contractDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT-CURRENT-SOURCE-COVERAGE',
        kind:'source-coverage',
        scope:'current-validated-effect-authorization-source-families',
        status:audit.providedSourceRecordCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.providedSourceRecordCoverageComplete
            ? `当前提供的 ${audit.sourceRecordCount} 条 source-backed effect authority record 已全部规整，覆盖 actor→actor、actor→group、group→actor 三类现有 endpoint family。`
            : `当前提供的 source-backed effect authority record 中仍有 ${audit.unresolvedRecordCount} 条未通过 normalization provenance gate。`,
        boundary:'这里只覆盖仓库当前已经验证的 source authority records；未登记文献、cross-scope、branch/hidden/Structure relation 与新的 effect semantics 不在本 coverage 中。',
        dependsOnDependencyIds:[contractDependency.id],
        resolvedByClaimIds:audit.providedSourceRecordCoverageComplete ? ['SC-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT'] : []
    });

    const buildExecutionCompatibilityDependency = (audit = {}, coverageDependency = {}) => {
        const compatible = audit.executionCompatibility !== false;
        return makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT-EXECUTION-COMPATIBILITY',
            kind:'calibration',
            scope:'normalized-authorization-to-generic-execution-kernel',
            status:compatible ? 'resolved' : 'unresolved',
            statement:audit.executionCalibration.comparableCount
                ? compatible
                    ? `${audit.executionCalibration.comparableCount} 条 normalized authorization execution 可与既有 source effect state 对齐，0 mismatch；endpoint shapes=${audit.executionCalibration.endpointShapes.join(', ') || 'none'}。`
                    : `Normalized authorization → Generic Relation Effect Execution 出现 ${audit.executionMismatchCount} 条 source-state mismatch。`
                : '当前没有可比较 source effect state；execution compatibility 对本输入 not-applicable，不扩大 authorization。',
            boundary:'Compatibility 只证明 schema/执行语义不丢失；它不能把当前 source authority registry 外推成 generic resolver。',
            dependsOnDependencyIds:[coverageDependency.id,'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-KNOWN-MOTIF-COMPATIBILITY'],
            resolvedByClaimIds:compatible ? ['SC-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT'] : []
        });
    };

    const buildGenericResolverDependency = (coverageDependency = {}, compatibilityDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-EFFECT-TYPE-AUTHORIZATION-RESOLVER',
        scope:'arbitrary-relation-to-source-backed-effect-type-authorization',
        status:'unresolved',
        statement:'现有 source authority 已有统一 normalized input，但仍没有一个来源授权的 generic resolver 能把任意 relation 的 function/role/endpoint/realization 组合转换为 augmentation/opposition/mediation authorization。',
        boundary:'不得把“现有三类 authority 可统一表示”偷换成“任意 generation/restraint/peer 都可自动发放 effect type”；registry no-match 继续不是 semantic none。',
        dependsOnDependencyIds:[coverageDependency.id,compatibilityDependency.id]
    });

    const rebuildUnresolvedDependency = (base = {}, id = '', additions = [], statement = null, boundary = null) => {
        const current = (base.dependencies || []).find((item) => item.id === id) || {};
        return Object.freeze({
            ...current,
            id,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([...(current.dependsOnDependencyIds || []),...additions.map((item) => item.id)])),
            resolvedByClaimIds:Object.freeze([]),
            ...(statement ? { statement } : {}),
            ...(boundary ? { boundary } : {})
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyGenericRelationEffectExecution) return base;

        const audit = buildAudit(base);
        const claim = makeClaim(audit);
        const contractDependency = buildContractDependency();
        const coverageDependency = buildCoverageDependency(audit, contractDependency);
        const compatibilityDependency = buildExecutionCompatibilityDependency(audit, coverageDependency);
        const genericResolverDependency = buildGenericResolverDependency(coverageDependency, compatibilityDependency);
        const visibleMappingDependency = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
            [coverageDependency,genericResolverDependency],
            'Visible-edge effect-type authority 现在可以与 actor→group / group→actor authority 使用同一 normalized schema，但 arbitrary visible realized edge 的 generic effect-type authorization resolver 仍不存在，因此 mapping 继续 unresolved。',
            'Normalization 只统一输入格式；不得按 function shape、ten-god role、case wording 或 endpoint shape 自动授权 effect type。'
        );
        const generalizationDependency = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            [contractDependency,coverageDependency,compatibilityDependency,genericResolverDependency],
            'Cross-Actor Relation Effect 现已具备统一 source-backed authorization input 与通用 execution kernel；但 generic effect-type authorization resolver、branch realization、Structure→actor-pair bridge、hidden/cross-scope realization 与 broader source coverage 仍未闭合。',
            '不得把 normalized current registry 或 execution compatibility 当作 generic semantic authorization；realized-unmapped 必须继续保留。'
        );

        const replacedDependencyIds = new Set([
            contractDependency.id,
            coverageDependency.id,
            compatibilityDependency.id,
            genericResolverDependency.id,
            visibleMappingDependency.id,
            generalizationDependency.id
        ]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id),claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            coverageDependency,
            compatibilityDependency,
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
            contextualForcePartyEffectAuthorizationNormalizedInput:audit,
            contextualForcePartyEffectAuthorizationNormalizedInputRecords:audit.profile.records,
            contextualForcePartyEffectAuthorizationNormalizedInputRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Effect Authorization Normalized Input v0.1 将 actor→actor known motif、actor→group exact outcome、group→actor exact mediation 三类已验证 authority 规整为同一 execution authorization schema。',
                'Source contract/rule/record/case/authority/evidence provenance 全部保留；source wording 仅保存，不作为 normalization 或 effect-type 决策特征。',
                'Normalized authorization 可进入 Generic Relation Effect Execution，并保持 actor-group endpoint 不展开 member effects。',
                'Normalization 不产生新 effect type；Generic Effect-Type Authorization Resolver、broader source coverage、Cross-Actor Relation Effect Generalization、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-effect-authorization-normalized-input-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInput = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        buildContractDependency,
        buildCoverageDependency,
        buildExecutionCompatibilityDependency,
        buildGenericResolverDependency,
        rebuildUnresolvedDependency,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
