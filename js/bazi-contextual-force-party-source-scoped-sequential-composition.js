(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceScopedSequentialComposition?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartySourceScopedSequentialCompositionContract || null;
    const profileApi = GuiJia.baziContextualForcePartySourceScopedSequentialCompositionProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, SOURCE_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceRecordIds = freezeArray(Object.keys(SOURCE_REGISTRY));

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.finiteCoverageComplete ? 'source-scoped-sequential-composition-complete' : 'source-scoped-sequential-composition-partial',
            contract:CONTRACT,
            profile,
            recordCount:profile.compositions.length,
            resolvedCompositionCount:profile.resolvedCompositions.length,
            unresolvedCompositionCount:profile.unresolvedCompositions.length,
            finiteOrderedCoexistenceCoverageComplete:profile.finiteCoverageComplete,
            sourceScopedSequentialCompositionDefined:true,
            sourceOrderEqualsRuntimePriority:false,
            runtimeArbitraryChartOrderMatcherDefined:false,
            exclusivePathSelectorDefined:false,
            pathExecutionAuthorized:false,
            memberEdgeExpansion:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceRecordIds
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION',
        claimKey:'strength.contextual-force.party.competing-relation-path.source-scoped-sequential-composition',
        status:audit.finiteOrderedCoexistenceCoverageComplete ? 'resolved' : 'unresolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            resolverScope:CONTRACT.resolverScope,
            sourceRecordIds,
            resolvedCompositionCount:audit.resolvedCompositionCount,
            coverageComplete:audit.finiteOrderedCoexistenceCoverageComplete,
            sourceOrderEqualsRuntimePriority:false,
            runtimeArbitraryChartOrderMatcherDefined:false,
            exclusivePathSelectorDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceRecordIds,
        rationale:'CF-CRP-REC-01/02 已分别保存“财先食后”与“食先财后”的 source-ordered coexistence assertion，并链接 CF-RPP-REC-01-A01/A02 的 order provenance。v0.1 因此可以把两条已审定来源解释冻结成 ordered composition trace：REC-01 为财助杀→食制杀；REC-02 为食制杀→财转食党杀，且后一 compound path 必须保持整体。',
        boundary:'本 claim 只解决两个已登记 source records 的 composition trace；不判断任意命盘是否满足先后条件，不选择 runtime winner，不执行 path，也不把来源顺序转换成 numeric priority、Relative Dominance、Strength 或 Assessment。'
    });

    const makeDependency = ({ id, kind = 'semantic-model', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceRecordIds,
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildContractDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION-CONTRACT',
        kind:'source-audit',
        scope:'source-ordered-coexisting-relation-path-composition-contract',
        status:'resolved',
        statement:'Source-Scoped Sequential Composition v0.1 已定义 source-ordered coexistence 的最小 composition contract：精确 path identity、精确 sequence、position-order provenance 与 compound-path preservation。',
        boundary:'Contract resolved 不等于任意 chart 的 path order 已匹配，也不等于 path execution、winner selection 或 numeric priority 已定义。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-SOURCE-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION']
    });

    const buildFiniteCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION-FINITE-COVERAGE',
        kind:'source-coverage',
        scope:'cf-crp-rec-01-02-ordered-coexistence-composition-coverage',
        status:audit.finiteOrderedCoexistenceCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteOrderedCoexistenceCoverageComplete
            ? `CF-CRP-REC-01/02 共 ${audit.resolvedCompositionCount}/${audit.recordCount} 条 source-ordered coexistence record 已形成合法 composition trace。`
            : `CF-CRP-REC-01/02 仍有 ${audit.unresolvedCompositionCount} 条 composition unresolved。`,
        boundary:'Coverage 只限两个登记 record；不覆盖 REC-03 proximity exclusivity、REC-04 relative-capacity exclusivity 或 broader competing-path corpus。',
        dependsOnDependencyIds:[contractDependency.id],
        resolvedByClaimIds:audit.finiteOrderedCoexistenceCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION']
            : []
    });

    const buildSequentialCompositionDependency = (contractDependency = {}, coverageDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION',
        scope:'audited-source-ordered-coexisting-path-composition-trace',
        status:coverageDependency.status === 'resolved' ? 'resolved' : 'unresolved',
        statement:coverageDependency.status === 'resolved'
            ? '“财先食后／食先财后”的两个审定 source records 已可输出 source-scoped ordered composition trace；REC-02 的后一 compound path 保持整体并标记为会重新组织组合解释。'
            : '审定 source-ordered composition 尚未全部通过 validator。',
        boundary:'Composition trace 是来源语义结构，不是 actor-level execution trace；不得把 step 顺序当成时序执行、effect 加总、winner priority 或最终吉凶／强弱判断。',
        dependsOnDependencyIds:[contractDependency.id,coverageDependency.id],
        resolvedByClaimIds:coverageDependency.status === 'resolved'
            ? ['SC-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION']
            : []
    });

    const rebuildCompetingPathResolutionDependency = (base = {}, compositionDependency = {}, coverageDependency = {}) => {
        const id = 'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION';
        const current = (base.dependencies || []).find((item) => item.id === id) || {};
        return Object.freeze({
            ...current,
            id,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                compositionDependency.id,
                coverageDependency.id,
                'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-COVERAGE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Competing Relation Path 中 REC-01/02 的 source-ordered coexistence composition 已 source-scoped resolved；但 REC-03 的 proximity 条件 selector、REC-04 的 relative-relation-capacity selector、任意 chart condition matcher 与 broader corpus coverage 均未闭合，因此 global competing-path resolution 继续 unresolved。',
            boundary:'不得把两个 finite composition records 外推为通用“先出现者优先”规则；不得使用 pillar distance、member count、固定 motif priority、numeric weight 或 vote 选择路径。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyCompetingRelationPathAudit) return base;

        const audit = buildAudit();
        const claim = makeClaim(audit);
        const contractDependency = buildContractDependency();
        const coverageDependency = buildFiniteCoverageDependency(contractDependency, audit);
        const compositionDependency = buildSequentialCompositionDependency(contractDependency, coverageDependency);
        const globalResolutionDependency = rebuildCompetingPathResolutionDependency(base, compositionDependency, coverageDependency);

        const replacedDependencyIds = new Set([
            contractDependency.id,
            coverageDependency.id,
            compositionDependency.id,
            globalResolutionDependency.id
        ]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            coverageDependency,
            compositionDependency,
            globalResolutionDependency
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
            contextualForcePartySourceScopedSequentialComposition:audit,
            contextualForcePartySourceScopedSequentialCompositionRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Source-Scoped Sequential Composition v0.1：只冻结 CF-CRP-REC-01/02 的 source-ordered coexistence composition trace。',
                '财先食后保存“财助杀→食制杀”；食先财后保存“食制杀→财转食党杀”，后一 compound source relation 不拆成 direct/member edges。',
                'Source order 是来源 composition sequence，不是 runtime priority、数值权重或 actor-level 执行时序。',
                'REC-03 proximity selector、REC-04 relative-capacity selector、broader path coverage、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-source-scoped-sequential-composition-v01', extendSynthesis);

    GuiJia.baziContextualForcePartySourceScopedSequentialComposition = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
