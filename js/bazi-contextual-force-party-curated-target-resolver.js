(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCuratedTargetResolver?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCuratedTargetResolverContract || null;
    const profileApi = GuiJia.baziContextualForcePartyCuratedTargetResolverProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, FINITE_CASE_IDS } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-CURATED-FINITE-TARGET-RESOLVER-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.coverageComplete ? 'finite-curated-target-resolution-complete' : 'finite-curated-target-resolution-partial',
            contract:CONTRACT,
            profile,
            caseCount:profile.resolutions.length,
            applicableResolutionCount:profile.applicableResolutions.length,
            unresolvedResolutionCount:profile.unresolvedResolutions.length,
            finiteAuditCorpusResolutionComplete:profile.coverageComplete,
            finiteResolverDefined:true,
            globalTargetSemanticLevelResolverDefined:false,
            broaderRelationSourceRegistryCoverageComplete:false,
            relationEffectExecution:false,
            membershipMutation:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceCaseIds:FINITE_CASE_IDS
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-CURATED-FINITE-TARGET-RESOLVER',
        claimKey:'strength.contextual-force.party.relation-target.curated-finite-resolver',
        status:audit.finiteAuditCorpusResolutionComplete ? 'resolved' : 'unresolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            resolverScope:CONTRACT.resolverScope,
            caseCount:audit.caseCount,
            applicableResolutionCount:audit.applicableResolutionCount,
            unresolvedResolutionCount:audit.unresolvedResolutionCount,
            coverageComplete:audit.finiteAuditCorpusResolutionComplete,
            globalResolverDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:FINITE_CASE_IDS,
        rationale:'Curated Annotation v0.2 已覆盖 8 个 Relation Target audit case；Actor Group Identity 已解析 CASE-04/05，Hidden Single Target Binding 已解析 CASE-06。故 finite corpus 可确定为：01/02/03 role-class，04/05 actor-set，06 single-actor，07 configuration，08 no-relation-target/not-applicable。',
        boundary:'8-case finite resolver resolved 只证明该审定 corpus 的 target semantics 可确定；不得外推到 broader relation-source registry，不创建 relation effect、membership、relative dominance、Strength 或 Assessment。'
    });

    const makeDependency = ({ id, kind = 'semantic-model', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:FINITE_CASE_IDS,
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildContractDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-FINITE-TARGET-RESOLVER-CONTRACT',
        scope:'relation-target-eight-case-curated-resolver-contract',
        status:'resolved',
        statement:'Curated Finite Target Resolver v0.1 已定义 role-class / actor-set / single-actor / configuration / no-relation-target 五种 source-scoped resolution disposition。',
        boundary:'Contract resolved 不等于 global target resolver defined；instance identity 必须消费既有 source-scoped binding/group identity。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE',
            'SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE',
            'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-CURATED-FINITE-TARGET-RESOLVER']
    });

    const buildCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-FINITE-TARGET-AUDIT-CORPUS-RESOLUTION',
        kind:'source-coverage',
        scope:'relation-target-semantic-level-contract-eight-case-deterministic-resolution',
        status:audit.finiteAuditCorpusResolutionComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteAuditCorpusResolutionComplete
            ? `Relation Target finite audit corpus ${audit.caseCount}/${audit.caseCount} 个 case 均已得到 deterministic source-scoped disposition；CASE-08 为合法 not-applicable。`
            : `Relation Target finite audit corpus 仍有 ${audit.unresolvedResolutionCount} 个 unresolved case。`,
        boundary:'Coverage 只限 8-case audit corpus；not-applicable 不等于 unresolved，broader registry 继续另行审计。',
        dependsOnDependencyIds:[contractDependency.id],
        resolvedByClaimIds:audit.finiteAuditCorpusResolutionComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-CURATED-FINITE-TARGET-RESOLVER']
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
            statement:'Relation Target 8-case finite audit corpus 已完成 deterministic resolution，但 broader relation-source registry annotation coverage 与未登记 source 的 target consumer 仍未闭合，因此 global Target-Level Resolver 继续 unresolved。',
            boundary:'不得把 finite source-scoped resolver 当成 runtime 古汉语 parser、lexical shortcut 或 generic role→actor/group binder。'
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
            contextualForcePartyCuratedTargetResolver:audit,
            contextualForcePartyCuratedTargetResolverRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Curated Finite Target Resolver v0.1 完成 Relation Target 8-case audit corpus 的 source-scoped deterministic resolution。',
                '01/02/03=role-class；04/05=actor-set group；06=hidden single actor；07=configuration；08=no-relation-target/not-applicable。',
                'Finite resolver complete 不等于 global resolver complete；broader relation-source annotation coverage 继续 unresolved。',
                'Target resolution 不执行 relation effect、不修改 membership、不产生 score、relative dominance、Strength 或 Assessment。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-curated-target-resolver-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyCuratedTargetResolver = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);