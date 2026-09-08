(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyGenericRelationEffectExecution?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract || null;
    const profileApi = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];

    const buildAudit = (synthesis = {}) => {
        const calibration = profileApi.buildKnownMotifCalibration(synthesis);
        return Object.freeze({
            id:'CF-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:'generic-execution-kernel-defined-effect-type-generalization-unresolved',
            contract:CONTRACT,
            genericExecutionKernelDefined:true,
            genericEffectTypeMappingDefined:false,
            knownMotifCalibration:calibration,
            knownMotifCompatibility:calibration.compatible,
            knownMotifSourceRecordCount:calibration.sourceRecordCount,
            knownMotifComparableCount:calibration.comparableCount,
            knownMotifMismatchCount:calibration.mismatchCount,
            endpointShapesSupported:CONTRACT.supportedEndpointShapes,
            groupToGroupSupported:false,
            groupMemberExpansion:false,
            currentRegistryNoMatchMeansNoEffect:false,
            membershipMutation:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-KERNEL',
        claimKey:'strength.contextual-force.party.relation-effect.generic-execution-kernel',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            genericExecutionKernelDefined:true,
            genericEffectTypeMappingDefined:false,
            sourceBackedAuthorizationRequired:true,
            knownMotifSourceRecordCount:audit.knownMotifSourceRecordCount,
            knownMotifComparableCount:audit.knownMotifComparableCount,
            knownMotifMismatchCount:audit.knownMotifMismatchCount,
            knownMotifCompatibility:audit.knownMotifCompatibility,
            groupMemberExpansion:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(audit.knownMotifCalibration?.inputs?.flatMap((item) => item.authorization?.sourceEvidenceIds || []) || []),
        rationale:'Generic Relation Effect Execution v0.1 已把 endpoint identity、target-level resolution、realization 与 source-backed effect-type authorization 组合成 fail-closed execution kernel；已兑现但未授权的 relation 保持 realized-unmapped，而不是自动判无作用或按五行 shape 补 effect type。',
        boundary:'本 claim 只解决 effect execution mechanics，不解决 generic generation/restraint/peer → effect-type mapping、broader relation realization、Relative Dominance、Strength 或 Assessment。'
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
        id:'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-CONTRACT',
        scope:'authorization-gated-generic-relation-effect-execution-kernel',
        status:'resolved',
        statement:'Generic Relation Effect Execution v0.1 已定义：只有 actionable target resolution、显式 source endpoint、directed relation identity、已解析 realization 与唯一 source-backed effect-type authorization 同时成立时，才能执行 positive relation effect。',
        boundary:'Execution contract resolved 不代表 effect-type mapping resolved；function shape、十神角色、endpoint shape 与 realization 单独都不能授权 effect type。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-SOURCE-AUDIT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-KERNEL']
    });

    const buildCompatibilityDependency = (audit = {}, contractDependency = {}) => {
        const observed = audit.knownMotifComparableCount > 0;
        const compatible = audit.knownMotifCompatibility !== false;
        return makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-KNOWN-MOTIF-COMPATIBILITY',
            kind:'calibration',
            scope:'generic-execution-kernel-known-source-backed-effect-state-compatibility',
            status:compatible ? 'resolved' : 'unresolved',
            statement:observed
                ? compatible
                    ? `新 generic execution kernel 已与 ${audit.knownMotifComparableCount} 条现有 source-backed relation-effect record 做状态兼容校验，0 mismatch。`
                    : `新 generic execution kernel 与现有 source-backed relation-effect record 出现 ${audit.knownMotifMismatchCount} 条状态不兼容。`
                : '当前 synthesis 没有可比较的 known motif relation-effect record；compatibility 对本盘 not-applicable，不阻断 execution contract。',
            boundary:'Known motif compatibility 只防止新 kernel 改写既有 source-backed semantics；它不把旧 motif registry 扩成 generic effect-type mapping。',
            dependsOnDependencyIds:[contractDependency.id,'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL'],
            resolvedByClaimIds:compatible ? ['SC-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-KERNEL'] : []
        });
    };

    const rebuildGeneralization = (base = {}, contractDependency = {}, compatibilityDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                contractDependency.id,
                compatibilityDependency.id,
                'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-BRANCH-REALIZATION',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-STRUCTURE-ACTOR-PAIR-BRIDGE',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-HIDDEN-CROSS-SCOPE-REALIZATION'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Generic relation-effect execution mechanics 已建立，但 generic effect-type authorization/mapping、branch realization、Structure→actor-pair bridge 与 hidden/cross-scope realization 仍未完成，因此 Cross-Actor Relation Effect Generalization 继续 unresolved。',
            boundary:'不得把“kernel 能执行已授权 effect”偷换成“kernel 能决定任意 relation 的 effect type”；realized-unmapped 必须继续保留。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyGenericTargetLevelResolver || !base.contextualForcePartyRelationEffectGeneralizationSourceAudit) return base;

        const audit = buildAudit(base);
        const claim = makeClaim(audit);
        const contractDependency = buildContractDependency();
        const compatibilityDependency = buildCompatibilityDependency(audit, contractDependency);
        const generalizationDependency = rebuildGeneralization(base, contractDependency, compatibilityDependency);
        const replacedIds = new Set([contractDependency.id,compatibilityDependency.id,generalizationDependency.id]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            contractDependency,
            compatibilityDependency,
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
            contextualForcePartyGenericRelationEffectExecution:audit,
            contextualForcePartyGenericRelationEffectExecutionRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Generic Relation Effect Execution v0.1 将 target-level、endpoint identity、realization 与 effect-type authorization 分层后再执行 relation effect。',
                '已兑现但 current registry 未授权的 relation 必须保持 realized-unmapped；no-match 不是 semantic rejection，也不能按 generation/restraint/peer shape 自动补 effect type。',
                'actor-group endpoint 原样保留，不展开 member effects；group→group 仍未定义。',
                'not-realized relation 不生成 reverse effect；effect execution 不修改 membership、不建立 transitive closure、不产生 numeric force。',
                '因此 Generic Effect-Type Mapping、Cross-Actor Relation Effect Generalization、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-generic-relation-effect-execution-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyGenericRelationEffectExecution = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        buildContractDependency,
        buildCompatibilityDependency,
        rebuildGeneralization,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
