(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceActorGroupIdentity?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartySourceActorGroupIdentityContract || null;
    const profileApi = GuiJia.baziContextualForcePartySourceActorGroupIdentityProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, FINITE_SOURCE_GROUP_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceCaseIds = freezeArray(Object.keys(FINITE_SOURCE_GROUP_REGISTRY));

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.unresolvedGroups.length ? 'finite-source-group-identity-partial' : 'finite-source-group-identity-complete',
            contract:CONTRACT,
            profile,
            groupCount:profile.groups.length,
            resolvedGroupCount:profile.resolvedGroups.length,
            unresolvedGroupCount:profile.unresolvedGroups.length,
            finiteVisibleCoverageComplete:profile.unresolvedGroups.length === 0,
            globalSourceActorGroupResolverDefined:false,
            crossScopeSourceGroupDefined:false,
            mediationExecutionDefined:false,
            targetActorGroupContractMutation:false,
            memberEdgeExpansion:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceCaseIds
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
        sourceRegistryEvidenceIds:sourceCaseIds,
        rationale,
        boundary
    });

    const makeContractClaim = () => makeClaim({
        id:'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-CONTRACT',
        claimKey:'strength.contextual-force.party.source-actor-group-identity.contract',
        status:'resolved',
        value:{
            groupIdentitySide:CONTRACT.groupIdentitySide,
            resolverScope:CONTRACT.resolverScope,
            visibleFiniteSourceGroupDefined:true,
            crossScopeSourceGroupDefined:false,
            sourceGroupIdentityEqualsMediationExecution:false
        },
        rationale:'Collective semantics source 已证明 relation source 也可能是 actor-set；MED CASE-04 又以“干透两杀”明确给出两个 visible 七杀 source manifestation。因此可定义 relation-source 侧有限 group identity，而无需修改 relation-target group contract。',
        boundary:'合同只定义 source-side identity schema；不授权 group→actor relation execution、cross-scope source group 或 member-edge projection。'
    });

    const makeCoverageClaim = (audit = {}) => makeClaim({
        id:'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE',
        claimKey:'strength.contextual-force.party.source-actor-group-identity.visible-finite-coverage',
        status:audit.finiteVisibleCoverageComplete ? 'resolved' : 'unresolved',
        value:{
            sourceCaseIds,
            groupIds:freezeArray((audit.profile.resolvedGroups || []).map((item) => item.id)),
            coverageComplete:audit.finiteVisibleCoverageComplete
        },
        rationale:'当前 registry 只有 MED CASE-04；其月干、时干两丙均为 visible 七杀，且来源明确“干透两杀”，可形成 exact source-scoped finite group identity。',
        boundary:'Finite coverage 只表示 registry 内一例闭合；MED CASE-01/05 与其他 source actor-set 不在覆盖范围。'
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
        id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-CONTRACT',
        scope:'relation-source-visible-finite-actor-set-identity-contract',
        status:'resolved',
        statement:'Source Actor Group Identity v0.1 已定义 relation-source 侧 finite visible actor-set identity，并明确与 relation-target group identity 分离。',
        boundary:'Identity contract resolved 不等于 source group 已执行 relation。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT',
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-TARGET-SEMANTICS-SOURCE-AUDIT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-CONTRACT']
    });

    const buildFiniteCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE',
        kind:'source-coverage',
        scope:'audited-visible-finite-source-actor-set-identity',
        status:audit.finiteVisibleCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteVisibleCoverageComplete
            ? `当前 registry 的 ${audit.resolvedGroupCount} 条 visible source-group identity 已闭合。`
            : '当前 registry 仍有 source-group identity 未通过 validator。',
        boundary:'只覆盖 MED CASE-04 的“干透两杀”；不按十神数量自动建组。',
        dependsOnDependencyIds:[contractDependency.id],
        resolvedByClaimIds:audit.finiteVisibleCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE']
            : []
    });

    const buildGlobalDependency = (contractDependency = {}, finiteCoverageDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY',
        scope:'global-relation-source-actor-set-identity-resolver',
        status:'unresolved',
        statement:'已闭合一条 visible finite source group，但尚无 generic source actor-set resolver、cross-scope source group identity 或全部来源覆盖。',
        boundary:'不得由“同十神出现多个”或 member count 自动形成 source group。',
        dependsOnDependencyIds:[contractDependency.id,finiteCoverageDependency.id]
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
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyCollectiveTargetSemanticsAudit) return base;
        const audit = buildAudit();
        const contractClaim = makeContractClaim();
        const coverageClaim = makeCoverageClaim(audit);
        const contractDependency = buildContractDependency();
        const finiteCoverageDependency = buildFiniteCoverageDependency(contractDependency, audit);
        const globalDependency = buildGlobalDependency(contractDependency, finiteCoverageDependency);

        const mediationCalibrationDependency = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION',
            [finiteCoverageDependency,globalDependency],
            'Mediation E2E 的 source-side ambiguity 已缩小：MED CASE-04 的两枚 visible 七杀现在有 source-scoped group identity；但尚未定义 group→actor collective mediation effect，因此 calibration 继续 unresolved。',
            'Source group identity 不能替代 relation execution；不得把“两杀”分别补成两条杀→印 realized edges。'
        );

        const generalizationDependency = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            [finiteCoverageDependency,globalDependency],
            'Cross-Actor Relation Effect 现新增一条 source actor-set identity 正向证据，但 group→actor mediation execution、cross-scope source groups 与 generic relation realization 仍未闭合。',
            '有限 source group identity 只缩小 blocker，不授权 generic mediation 或 relation-effect generalization。'
        );

        const replacedClaimIds = new Set([contractClaim.id,coverageClaim.id]);
        const replacedDependencyIds = new Set([
            contractDependency.id,
            finiteCoverageDependency.id,
            globalDependency.id,
            mediationCalibrationDependency.id,
            generalizationDependency.id
        ]);
        const claims = Object.freeze([
            ...(base.claims || []).filter((item) => !replacedClaimIds.has(item.id)),
            contractClaim,
            coverageClaim
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            finiteCoverageDependency,
            globalDependency,
            mediationCalibrationDependency,
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
            contextualForcePartySourceActorGroupIdentity:audit,
            contextualForcePartySourceActorGroupIdentityGroups:audit.profile.groups,
            contextualForcePartySourceActorGroupIdentityRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Source Actor Group Identity v0.1 只闭合 MED CASE-04 的“干透两杀”：visible:1:丙 + visible:3:丙 作为 relation-source actor-set。',
                'Source-side group 与 target-side group 为不同 identity role；本层不修改既有 Actor Group Identity contract。',
                'Group identity 不等于“化杀”执行，不合成两条 member-specific 杀→印 edge。',
                'Cross-scope source groups、generic source-group resolver、mediation execution、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-source-actor-group-identity-v01', extendSynthesis);

    GuiJia.baziContextualForcePartySourceActorGroupIdentity = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
