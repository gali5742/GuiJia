(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyActorGroupIdentity?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyActorGroupIdentityContract || null;
    const profileApi = GuiJia.baziContextualForcePartyActorGroupIdentityProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, FINITE_GROUP_SOURCE_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceCaseIds = freezeArray(Object.keys(FINITE_GROUP_SOURCE_REGISTRY));

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-ACTOR-GROUP-IDENTITY-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.unresolvedGroups.length ? 'finite-group-identity-partial' : 'finite-group-identity-source-scoped-complete',
            contract:CONTRACT,
            profile,
            groupCount:profile.groups.length,
            resolvedGroupCount:profile.resolvedGroups.length,
            unresolvedGroupCount:profile.unresolvedGroups.length,
            finiteVisibleCoverageComplete:profile.unresolvedGroups.length === 0,
            actorGroupIdentityContractDefined:true,
            sourceScopedFiniteGroupResolverDefined:true,
            globalTargetSemanticLevelResolverDefined:false,
            crossScopeRoleInstanceGroupIdentityDefined:false,
            collectiveRelationEffectExecutionDefined:false,
            groupOutcomeExpandsToMemberEdges:false,
            relationRealizationMutation:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceCaseIds
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT',
        claimKey:'strength.contextual-force.party.actor-group-identity.contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            actorGroupIdentityContractDefined:true,
            resolverScope:CONTRACT.resolverScope,
            stableChartLocalCandidateKeysRequired:true,
            explicitCardinalityRequired:true,
            singleKnownScopeRequired:true,
            membershipCompletenessRequired:true,
            sourceCaseScopedIdentity:true,
            groupOutcomeExpandsToMemberEdges:false,
            collectiveRelationEffectExecutionDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceCaseIds,
        rationale:'现有 source contract 已给出两个满足全部有限 actor-set identity gate 的命例：庚申庚辰甲戌丙寅中的“庚金并透”，以及壬申丙午庚午丙戌中的“两杀”。二者均有具体 chart、relation-event、两枚稳定 visible candidate、明确 cardinality=2 与单一 visible scope，因此可以定义 source-scoped finite group identity，而无需把 collective outcome 拆成 member edges。',
        boundary:'本 claim 只解决有限、同 scope、来源登记命例的 group identity contract。它不解决 target-level global resolver、cross-scope group、collective effect execution、generic relation effect、relative dominance、Strength 或 Assessment。'
    });

    const makeCoverageClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE',
        claimKey:'strength.contextual-force.party.actor-group-identity.visible-finite-coverage',
        status:audit.finiteVisibleCoverageComplete ? 'resolved' : 'unresolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            sourceCaseIds,
            resolvedGroupIds:freezeArray((audit.profile.resolvedGroups || []).map((item) => item.groupId)),
            coverageComplete:audit.finiteVisibleCoverageComplete
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceCaseIds,
        rationale:'v0.1 registry 只登记当前已有完整 visible finite actor-set provenance 的两个 source cases；两条记录均通过 candidate uniqueness、cardinality、scope 与 membership-completeness validator。',
        boundary:'这里的 coverage 是 v0.1 source registry coverage，不表示全部传统 collective source corpus 或 cross-scope actor-set 已覆盖。'
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
        id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT',
        scope:'finite-same-role-actor-set-identity-and-membership',
        status:'resolved',
        statement:'Actor Group Identity v0.1 已定义有限、同角色、单一已知 scope、source-case-scoped 的 groupId/member/cardinality/membership-completeness contract。',
        boundary:'Contract resolved 不等于 global actor-set resolver 或 collective relation effect execution resolved；未登记来源不得自动套用。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT',
            'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT']
    });

    const buildFiniteCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE',
        kind:'source-coverage',
        scope:'audited-visible-finite-actor-set-source-registry',
        status:audit.finiteVisibleCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteVisibleCoverageComplete
            ? `v0.1 source registry 的 ${audit.resolvedGroupCount} 个 visible finite actor-set case 均已形成完整 group identity。`
            : 'v0.1 source registry 仍存在未通过 identity validator 的 finite actor-set case。',
        boundary:'只覆盖显式登记的 visible finite cases；不推断 cross-scope、hidden、singular 或未登记 collective wording。',
        dependsOnDependencyIds:[contractDependency.id],
        resolvedByClaimIds:audit.finiteVisibleCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE']
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
        const finiteCoverageDependency = buildFiniteCoverageDependency(contractDependency, audit);

        const crossScopeDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-CROSS-SCOPE-ROLE-INSTANCE-GROUP-IDENTITY',
            [contractDependency,finiteCoverageDependency],
            'Visible finite actor-set identity contract 已建立，但“四柱皆杀”“七杀皆来”等跨 visible/branch-hidden scope 的 group membership completeness 仍未定义。',
            '不得把 v0.1 visible finite group 规则外推到 hidden/cross-scope；cross-scope group 仍需独立 provenance 与 membership resolver。'
        );

        const collectiveExecutionDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION',
            [contractDependency,finiteCoverageDependency,crossScopeDependency],
            '有限 actor-set identity 已可 source-scoped 建立，但 collective relation effect 仍未定义：group target/source 如何形成 effect record、如何保留 group-level realization provenance，以及是否存在任何合法 member projection 规则都继续 unresolved。',
            'Group identity 不是 effect execution。默认继续禁止 group outcome → member edge、按成员数量复制 effect、计票、加权、actor-global effectiveness 或 relative dominance。'
        );

        const replacedDependencyIds = new Set([
            contractDependency.id,
            finiteCoverageDependency.id,
            crossScopeDependency.id,
            collectiveExecutionDependency.id
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
            finiteCoverageDependency,
            crossScopeDependency,
            collectiveExecutionDependency
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
            contextualForcePartyActorGroupIdentity:audit,
            contextualForcePartyActorGroupIdentityRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Actor Group Identity v0.1 只解决审定 visible finite actor-set 的 source-scoped group identity；当前两条 registry case 均为 cardinality=2。',
                'Group member order 无语义；同十神、同五行、同干或 collective lexical marker 均不能单独形成 group。',
                'Cross-scope group、singular hidden actor、role-class 与 configuration 不在 v0.1 group resolver 范围。',
                'Group identity 不生成 member edges、不修改 realization registry、不执行 collective effect，也不产生 score、relative dominance、Strength 或 Assessment。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-actor-group-identity-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyActorGroupIdentity = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
