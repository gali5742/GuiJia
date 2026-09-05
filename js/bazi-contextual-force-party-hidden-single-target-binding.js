(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyHiddenSingleTargetBinding?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyHiddenSingleTargetBindingContract || null;
    const profileApi = GuiJia.baziContextualForcePartyHiddenSingleTargetBindingProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, SOURCE_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceCaseIds = freezeArray(Object.keys(SOURCE_REGISTRY));

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-HIDDEN-SINGLE-TARGET-BINDING-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.unresolvedBindings.length ? 'hidden-single-target-binding-partial' : 'hidden-single-target-binding-source-scoped-complete',
            contract:CONTRACT,
            profile,
            bindingCount:profile.bindings.length,
            resolvedBindingCount:profile.resolvedBindings.length,
            unresolvedBindingCount:profile.unresolvedBindings.length,
            sourceScopedCoverageComplete:profile.unresolvedBindings.length === 0,
            hiddenSingleTargetBindingContractDefined:true,
            sourceScopedHiddenSingleTargetResolverDefined:true,
            globalChartLocalTargetCandidateBinderDefined:false,
            globalCoreferenceAntecedentBinderDefined:false,
            globalTargetSemanticLevelResolverDefined:false,
            bindingCreatesRelationEffect:false,
            bindingCreatesMembership:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceCaseIds
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-CONTRACT',
        claimKey:'strength.contextual-force.party.relation-target.hidden-single.binding-contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            resolverScope:CONTRACT.resolverScope,
            curatedSourcePositionRequired:true,
            hiddenActorKeyScheme:CONTRACT.hiddenActorKeyScheme,
            runtimeClassicalChineseParserRequired:false,
            runtimeLexicalPositionParserRequired:false,
            sourceScopedCoverageComplete:audit.sourceScopedCoverageComplete,
            bindingCreatesRelationEffect:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceCaseIds,
        rationale:'CASE-06 已有 chart、single-actor target hint、hidden scope 与“时逢独杀”人工审定位置 provenance；仓库又已有统一 cangGan inventory、十神映射和 hidden actorKey 规则。因此可在 hour pillar 内筛出唯一七杀壬，并绑定为 hidden:3:亥:壬:0，而无需新增古汉语 parser 或全盘 lexical shortcut。',
        boundary:'该 claim 只解决 registry 中 CASE-06 的 source-scoped hidden single-target identity。它不授权任意“独杀”自动 binding，不创建 relation effect、membership、relative dominance、Strength 或 Assessment。'
    });

    const makeCoverageClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE',
        claimKey:'strength.contextual-force.party.relation-target.hidden-single.source-coverage',
        status:audit.sourceScopedCoverageComplete ? 'resolved' : 'unresolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            sourceCaseIds,
            resolvedActorKeys:freezeArray((audit.profile.resolvedBindings || []).map((item) => item.stableActorKey)),
            coverageComplete:audit.sourceScopedCoverageComplete
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceCaseIds,
        rationale:'v0.1 registry 仅登记当前 finite target-audit corpus 中唯一因 hidden actorKey 缺失而阻塞的 CASE-06；该记录通过 chart position、cangGan role 与 cardinality validator。',
        boundary:'这里的 coverage 是 v0.1 source registry coverage，不表示全部 hidden target、cross-scope target 或未登记传统来源已覆盖。'
    });

    const makeDependency = ({ id, kind = 'semantic-model', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceCaseIds,
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildContractDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-CONTRACT',
        scope:'audited-hidden-single-target-binding-contract',
        status:'resolved',
        statement:'Hidden Single Target Binding v0.1 已定义 source-case registry、curated source position、hidden scope、role filtering、cardinality=1 与稳定 hidden actorKey 合同。',
        boundary:'Contract resolved 不等于 global chart-local binder、global coreference binder 或 generic hidden target resolver resolved。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-CONTRACT']
    });

    const buildCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE',
        kind:'source-coverage',
        scope:'registered-hidden-single-target-source-cases',
        status:audit.sourceScopedCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.sourceScopedCoverageComplete
            ? `v0.1 registry 的 ${audit.resolvedBindingCount} 个 hidden single-target case 已全部绑定到稳定 actorKey。`
            : 'v0.1 hidden single-target registry 仍有未通过 binding validator 的 case。',
        boundary:'只覆盖显式登记 source cases；不得外推到其他 hidden target 或仅凭“独／一”措辞自动 binding。',
        dependsOnDependencyIds:[contractDependency.id],
        resolvedByClaimIds:audit.sourceScopedCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE']
            : []
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
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyCuratedRelationSourceSemanticAnnotationAudit) return base;

        const audit = buildAudit();
        const contractClaim = makeClaim(audit);
        const coverageClaim = makeCoverageClaim(audit);
        const contractDependency = buildContractDependency();
        const coverageDependency = buildCoverageDependency(contractDependency, audit);

        const candidateBindingDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING',
            [contractDependency,coverageDependency],
            'Relation Target finite audit corpus 中 CASE-06 的 hidden single target 已绑定为 hidden:3:亥:壬:0；但 broader relation source registry、未登记 hidden targets 与其他 instance-level candidates 仍无 global binder，因此依赖继续 unresolved。',
            '不得把 source-scoped CASE-06 binding 视为全局同十神／同五行候选规则。'
        );

        const cardinalityScopeDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-CARDINALITY-SCOPE-BINDING',
            [contractDependency,coverageDependency,candidateBindingDependency],
            'CASE-06 的 cardinality=1、hour pillar 与 hidden scope 已 source-scoped 闭合；04/05 actor-set 另由 Actor Group Identity 闭合。但 broader registry 的 cardinality/scope provenance 仍未统一消费，因此全局依赖继续 unresolved。',
            '不得把局部 single/actor-set registry coverage 提升为所有 collective/singular wording 的通用 cardinality resolver。'
        );

        const coreferenceDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-COREFERENCE-ANTECEDENT-BINDING',
            [contractDependency,coverageDependency],
            'CASE-06 的“四食相制”通过 curated annotation 回指“独杀”，并由 source-position + hidden inventory 绑定到稳定 actorKey；但其他 anaphoric/antecedent-linked source records 尚无统一 consumer，因此 global coreference dependency 继续 unresolved。',
            'CASE-06 的 source-scoped antecedent consumption 不能替代 broader coreference contract。'
        );

        const targetLevelResolverDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER',
            [contractDependency,coverageDependency,candidateBindingDependency,cardinalityScopeDependency,coreferenceDependency],
            'Finite Relation Target audit corpus 的唯一 hidden single-target actorKey blocker CASE-06 已闭合；但 broader relation-source annotation coverage 与 global target consumer 仍未完成，因此全局 Target-Level Resolver 继续 unresolved。',
            '本层只缩小 blocker，不把 source hint 或局部 binding 直接升级成 generic resolver。'
        );

        const replacedDependencyIds = new Set([
            contractDependency.id,
            coverageDependency.id,
            candidateBindingDependency.id,
            cardinalityScopeDependency.id,
            coreferenceDependency.id,
            targetLevelResolverDependency.id
        ]);
        const replacedClaimIds = new Set([contractClaim.id,coverageClaim.id]);
        const claims = Object.freeze([
            ...(base.claims || []).filter((item) => !replacedClaimIds.has(item.id)),
            contractClaim,
            coverageClaim
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            coverageDependency,
            candidateBindingDependency,
            cardinalityScopeDependency,
            coreferenceDependency,
            targetLevelResolverDependency
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
            contextualForcePartyHiddenSingleTargetBinding:audit,
            contextualForcePartyHiddenSingleTargetBindingRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Hidden Single Target Binding v0.1 只绑定审定 CASE-06：时柱亥中唯一七杀壬 → hidden:3:亥:壬:0。',
                '绑定复用既有 cangGan inventory、shiShenMap 与 hidden actorKey scheme；不引入 runtime 古汉语或位置 parser。',
                'CASE-06 blocker 已从“无稳定 hidden actorKey”缩小为 broader/global consumer coverage；global chart-local binder、coreference binder 与 Target-Level Resolver 继续 unresolved。',
                'Binding 不创建 relation effect、membership、score、relative dominance、Strength 或 Assessment。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-hidden-single-target-binding-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyHiddenSingleTargetBinding = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);