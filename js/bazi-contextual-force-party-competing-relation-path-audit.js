(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCompetingRelationPathAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyCompetingRelationPathSource) {
        document.write('<script src="./js/bazi-contextual-force-party-competing-relation-path-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyCompetingRelationPathSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const {
        VERSION,
        RULE_ID,
        RECORDS,
        FINDINGS,
        CONTRACT,
        COEXISTENCE_MODES,
        CONDITION_MODES,
        ORDERING_MODES,
        validateRegistry
    } = sourceApi;

    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceEvidenceIds = freezeArray(RECORDS.map((item) => item.id));

    const buildAudit = () => {
        const validation = validateRegistry(RECORDS);
        const assertions = RECORDS.flatMap((item) => item.relationAssertions || []);
        return Object.freeze({
            id:'CF-PARTY-COMPETING-RELATION-PATH-AUDIT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:validation.valid ? 'competing-relation-path-source-contract-audited-coverage-resolver-unresolved' : 'competing-relation-path-source-contract-invalid',
            sourceContract:CONTRACT,
            recordCount:RECORDS.length,
            assertionCount:assertions.length,
            coexistenceModesObserved:freezeArray([...new Set(assertions.map((item) => item.coexistenceMode))]),
            conditionModesObserved:freezeArray([...new Set(assertions.map((item) => item.conditionMode))]),
            orderingModesObserved:freezeArray([...new Set(assertions.map((item) => item.orderingMode))]),
            registryValidation:validation,
            sourceContractDefined:true,
            coexistenceConditionOrderingAreOrthogonal:true,
            sourceOrderedPathsMayCoexist:true,
            sourceExclusiveSelectionMayBeConditional:true,
            singleStatusEnumRejected:true,
            pathPresenceEqualsExecution:false,
            sourceOrderEqualsRuntimePriority:false,
            sourceExclusiveSelectionEqualsRuntimeWinner:false,
            corpusCoverageComplete:false,
            runtimeResolverDefined:false,
            targetSemanticLevelResolverDefined:false,
            actorGroupIdentityContractDefined:false,
            collectiveRelationEffectExecutionDefined:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceEvidenceIds,
            findings:FINDINGS
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-SOURCE-CONTRACT',
        claimKey:'strength.contextual-force.party.competing-relation-path.source-contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            sourceContractDefined:audit.sourceContractDefined,
            coexistenceConditionOrderingAreOrthogonal:audit.coexistenceConditionOrderingAreOrthogonal,
            sourceOrderedPathsMayCoexist:audit.sourceOrderedPathsMayCoexist,
            sourceExclusiveSelectionMayBeConditional:audit.sourceExclusiveSelectionMayBeConditional,
            singleStatusEnumRejected:audit.singleStatusEnumRejected,
            pathPresenceEqualsExecution:audit.pathPresenceEqualsExecution,
            sourceOrderEqualsRuntimePriority:audit.sourceOrderEqualsRuntimePriority,
            sourceExclusiveSelectionEqualsRuntimeWinner:audit.sourceExclusiveSelectionEqualsRuntimeWinner
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'《子平真诠》七煞财食先后明确允许“财助煞”与“食制煞”在同一解释中按来源顺序共存；韦千里又明确给出按“贴近”或“较为有力”条件区分候选路径的情形。因此 competing relation path 不能压缩成单一 winner/loser 枚举，至少要把 coexistence、condition、ordering 三轴分开保存。',
        boundary:'本 claim 只冻结 source path contract 与 validator。它不表示 path corpus 已覆盖、来源条件已被 runtime 判定、路径 winner 已选出，也不授权 member-edge expansion、numeric priority、relative dominance、Strength 或 Assessment。'
    });

    const makeDependency = ({ id, kind = 'semantic-model', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildContractDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-SOURCE-CONTRACT',
        kind:'source-audit',
        scope:'competing-relation-path-source-semantic-contract',
        status:'resolved',
        statement:'Competing Relation Path 已有最小 source contract：候选路径、来源条件、共存／排他语义与来源顺序分层保存，且 coexistence / condition / ordering 为正交维度。',
        boundary:'Contract resolved 不等于路径已执行或已选 winner；source order 不是 numeric priority，source-directed exclusivity 也不是 runtime winner。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-CROSS-LITERATURE-MODERN-SUPPORT-AUDIT',
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-SOURCE-CONTRACT']
    });

    const buildCoverageDependency = (contractDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-COVERAGE',
        kind:'source-coverage',
        scope:'audited-competing-relation-path-source-coverage',
        status:'unresolved',
        statement:'当前只审计了代表性的七煞财食先后与官杀／伤食条件化去留案例；尚未证明现有全部 curated relation annotations、known motifs 与跨 scope cases 都已有 competing-path records。',
        boundary:'不得因 contract 已定义就把未标注来源记录默认为“无 competing path”；absence of annotation 不是 source-backed exclusivity。',
        dependsOnDependencyIds:[
            contractDependency.id,
            'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'
        ]
    });

    const rebuildDependency = (base = {}, id = '', additions = [], statement = null, boundary = null) => {
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
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyRelationPositionProvenanceAudit) return base;
        const audit = buildAudit();
        const claim = makeClaim(audit);
        const contractDependency = buildContractDependency();
        const coverageDependency = buildCoverageDependency(contractDependency);

        const competingPathDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION',
            [contractDependency,coverageDependency],
            'Competing Relation Path 的 source contract 已明确，但 corpus coverage 与 runtime resolver 尚未完成；运行时仍不能根据路径存在、来源顺序、贴近或“较为有力”自动授权、排除或选择路径。',
            'Resolver 后续必须逐 record 消费 source authority、condition provenance、position/scope/cardinality 与 realization；条件 consumer 不足时必须 unresolved，不得 fallback 到距离、member count、固定 motif priority 或 numeric weight。'
        );

        const replacedDependencyIds = new Set([
            contractDependency.id,
            coverageDependency.id,
            competingPathDependency.id
        ]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            coverageDependency,
            competingPathDependency
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
            contextualForcePartyCompetingRelationPathAudit:audit,
            contextualForcePartyCompetingRelationPathRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Competing Relation Path Source Contract v0.1：coexistence、condition、ordering 三轴分离；拒绝单一 winner/loser status enum。',
                '《子平真诠》类 source-ordered paths 可以共存；共存不等于独立加总，后一路径可以改变整个组合的来源解释。',
                '韦千里类 source-exclusive alternatives 可以由 position 或 relative relation capacity 条件化；条件尚不可判定时保持 unresolved。',
                'Source order 不等于 runtime priority；source exclusivity 不等于 runtime winner；path presence 不等于 execution。',
                'Corpus coverage、runtime resolver、Target/Group Identity、Collective Effect Execution、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-competing-relation-path-audit-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyCompetingRelationPathAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        COEXISTENCE_MODES,
        CONDITION_MODES,
        ORDERING_MODES,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
