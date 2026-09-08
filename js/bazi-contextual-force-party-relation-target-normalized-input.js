(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationTargetNormalizedInput?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract || null;
    const profileApi = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-RELATION-TARGET-NORMALIZED-INPUT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.coverageComplete ? 'normalized-finite-input-complete' : 'normalized-finite-input-partial',
            contract:CONTRACT,
            profile,
            caseCount:profile.records.length,
            normalizedCount:profile.normalizedRecords.length,
            notApplicableCount:profile.notApplicableRecords.length,
            unresolvedCount:profile.unresolvedRecords.length,
            finiteAdapterCoverageComplete:profile.coverageComplete,
            globalTargetSemanticLevelResolverDefined:false,
            relationEffectExecution:false,
            membershipMutation:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-INPUT',
        claimKey:'strength.contextual-force.party.relation-target.normalized-input',
        status:audit.finiteAdapterCoverageComplete ? 'resolved' : 'unresolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            adapterScope:CONTRACT.adapterScope,
            caseCount:audit.caseCount,
            normalizedCount:audit.normalizedCount,
            notApplicableCount:audit.notApplicableCount,
            unresolvedCount:audit.unresolvedCount,
            coverageComplete:audit.finiteAdapterCoverageComplete,
            globalResolverDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray((audit.profile.records || []).map((item) => item.sourceCaseId)),
        rationale:'Relation Target 8-case curated corpus 已能在不携带 expectedTargetLevel / semanticLevelHint / legacy resolution 的前提下，规整为 target span、source context、predicate、role 与 chart binding/cardinality/scope provenance。',
        boundary:'本 claim 只证明 normalized input contract 与 finite adapter 覆盖；不表示 global target-level resolver、relation effect generalization、Relative Dominance、Strength 或 Assessment 已实现。'
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
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-INPUT-CONTRACT',
        scope:'relation-target-normalized-provenance-input-contract',
        status:'resolved',
        statement:'Normalized Input v0.1 已定义统一 provenance 输入，并明确禁止把 expectedTargetLevel、semanticLevelHint 或 legacy resolution 当成 resolver 输入。',
        boundary:'Contract resolved 不等于 target-level resolver resolved；缺少必要 provenance 时必须 unresolved。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT',
            'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-INPUT']
    });

    const buildCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-FINITE-ADAPTER-COVERAGE',
        kind:'source-coverage',
        scope:'relation-target-eight-case-normalized-input-adapter',
        status:audit.finiteAdapterCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteAdapterCoverageComplete
            ? `Relation Target 8-case corpus 已形成 ${audit.normalizedCount} 个 normalized input 与 ${audit.notApplicableCount} 个合法 not-applicable input，0 unresolved。`
            : `Relation Target normalized finite adapter 仍有 ${audit.unresolvedCount} 个 unresolved input。`,
        boundary:'Finite adapter coverage 只证明输入规整无损；不得外推为 broader source parser 或 global resolver。',
        dependsOnDependencyIds:[
            contractDependency.id,
            'SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE',
            'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE'
        ],
        resolvedByClaimIds:audit.finiteAdapterCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-INPUT']
            : []
    });

    const rebuildGlobalResolverDependency = (base = {}, contractDependency = {}, coverageDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                contractDependency.id,
                coverageDependency.id,
                'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Global Target-Level Resolver 仍未实现；下一阶段只能消费 normalized provenance input，不得回退到 lexical marker、sentence-level label 或 finite case id shortcut。',
            boundary:'Normalized finite adapter complete 不等于 global resolver complete；broader source coverage 与 generic decision rule 继续 unresolved。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyActorGroupIdentity || !base.contextualForcePartyHiddenSingleTargetBinding) return base;

        const audit = buildAudit();
        const claim = makeClaim(audit);
        const contractDependency = buildContractDependency();
        const coverageDependency = buildCoverageDependency(contractDependency, audit);
        const globalResolverDependency = rebuildGlobalResolverDependency(base, contractDependency, coverageDependency);
        const replacedDependencyIds = new Set([contractDependency.id,coverageDependency.id,globalResolverDependency.id]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            coverageDependency,
            globalResolverDependency
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
            contextualForcePartyRelationTargetNormalizedInput:audit,
            contextualForcePartyRelationTargetNormalizedInputRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Relation Target Normalized Input v0.1 统一 target span/source context/predicate/role/binding/cardinality/scope provenance。',
                'Normalized input 不携带 expectedTargetLevel、semanticLevelHint 或 legacy target resolution，避免 finite corpus 标签泄漏到 generic resolver。',
                '缺少必要 provenance 时 normalization 必须 unresolved；不得 lexical shortcut、自动 grouping、relation execution、membership mutation 或 numeric collapse。',
                'Global Target-Level Resolver、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-relation-target-normalized-input-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyRelationTargetNormalizedInput = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
