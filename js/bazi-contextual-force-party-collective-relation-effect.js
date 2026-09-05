(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCollectiveRelationEffect?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCollectiveRelationEffectContract || null;
    const profileApi = GuiJia.baziContextualForcePartyCollectiveRelationEffectProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, FINITE_COLLECTIVE_EFFECT_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceCaseIds = freezeArray(Object.keys(FINITE_COLLECTIVE_EFFECT_REGISTRY));

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-COLLECTIVE-RELATION-EFFECT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.blockerRecords.length ? 'finite-collective-effect-partial' : 'finite-collective-effect-source-scoped-complete',
            contract:CONTRACT,
            profile,
            effectCount:profile.records.length,
            resolvedEffectCount:profile.resolvedRecords.length,
            blockerEffectCount:profile.blockerRecords.length,
            finiteVisibleCoverageComplete:profile.blockerRecords.length === 0,
            collectiveRelationEffectContractDefined:true,
            sourceScopedFiniteCollectiveOppositionDefined:true,
            globalCollectiveRelationEffectResolverDefined:false,
            crossScopeCollectiveExecutionDefined:false,
            mediationCollectiveExecutionDefined:false,
            augmentationCollectiveExecutionDefined:false,
            memberEdgeExpansion:false,
            relationRealizationMutation:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceCaseIds
        });
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION-CONTRACT',
        claimKey:'strength.contextual-force.party.collective-relation-effect.execution-contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            relationIdentityType:CONTRACT.relationIdentityType,
            resolverScope:CONTRACT.resolverScope,
            resolvedActorGroupIdentityRequired:true,
            exactSourceOutcomeRequired:true,
            memberEdgeExpansion:false,
            memberSpecificRealizationSynthesized:false,
            singleActorRelationEffectContractMutation:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceCaseIds,
        rationale:'两个已解析 visible finite actor-group 命例都同时保存 source actor、target group 与来源明确的“制杀”结果，因此可以定义 actor→group relation identity。该 identity 与现有 actor→actor target-specific Relation Effect 平行，而不是放宽其 existing-edge / target-specific 条件。',
        boundary:'本 claim 只定义 source-scoped finite collective opposition execution contract；不授权 generic collective relation、cross-scope、mediation/augmentation group effect、member-edge projection 或 Strength mapping。'
    });

    const makeCoverageClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-VISIBLE-FINITE-COVERAGE',
        claimKey:'strength.contextual-force.party.collective-relation-effect.visible-finite-coverage',
        status:audit.finiteVisibleCoverageComplete ? 'resolved' : 'unresolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            sourceCaseIds,
            effectRecordIds:freezeArray((audit.profile.resolvedRecords || []).map((item) => item.id)),
            targetGroupIds:freezeArray((audit.profile.resolvedRecords || []).map((item) => item.targetGroupId)),
            coverageComplete:audit.finiteVisibleCoverageComplete
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceCaseIds,
        rationale:'v0.1 registry 中两条 exact source case 均能绑定已解析 finite group，并有唯一 source actor 与来源明确的 collective “制杀”结果。',
        boundary:'这里只证明当前 v0.1 visible finite registry 的 execution coverage，不代表全部 opposition corpus 或 cross-scope collective relation 已覆盖。'
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
        id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION-CONTRACT',
        scope:'actor-to-group-source-scoped-collective-effect-record',
        status:'resolved',
        statement:'Collective Relation Effect v0.1 已定义 actor→group relation identity、exact-source outcome authority 与禁止 member-edge expansion 的执行合同。',
        boundary:'合同 resolved 不等于 global collective resolver resolved。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION-CONTRACT']
    });

    const buildFiniteCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-VISIBLE-FINITE-COVERAGE',
        kind:'source-coverage',
        scope:'audited-visible-finite-group-opposition-source-registry',
        status:audit.finiteVisibleCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteVisibleCoverageComplete
            ? `v0.1 registry 的 ${audit.resolvedEffectCount} 个 actor→group opposition case 均已形成 source-scoped effect record。`
            : 'v0.1 registry 仍有 collective effect candidate 未通过 validator。',
        boundary:'只覆盖当前 exact source registry；不扩张到未登记 collective wording。',
        dependsOnDependencyIds:[contractDependency.id,'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE'],
        resolvedByClaimIds:audit.finiteVisibleCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-VISIBLE-FINITE-COVERAGE']
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
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyActorGroupIdentity) return base;

        const audit = buildAudit();
        const contractClaim = makeContractClaim();
        const coverageClaim = makeCoverageClaim(audit);
        const contractDependency = buildContractDependency();
        const finiteCoverageDependency = buildFiniteCoverageDependency(contractDependency, audit);

        const collectiveExecutionDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION',
            [contractDependency,finiteCoverageDependency],
            'Visible finite actor-group opposition 已有 source-scoped execution，但 global collective execution 继续 unresolved：target-level global resolver、cross-scope group identity，以及 mediation/augmentation 等 collective relation type 尚未闭合。',
            '不得把 v0.1 两条 exact source case 泛化为所有“制杀”或所有同十神 actor-set；不得由 group record 推导 member-specific realization。'
        );

        const oppositionCalibrationDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION',
            [finiteCoverageDependency],
            '原 visible-edge opposition calibration 的 target-model mismatch 已部分澄清：两个已审定 visible finite actor-set case 可通过 actor→group source-scoped effect 端到端保存；但 single-actor visible edge calibration 与更广 collective/cross-scope coverage 仍未完成，因此本 dependency 继续 unresolved。',
            'Finite collective calibration 不能反向证明 generic actor→actor mapping，也不能把 group outcome 拆成 member edges。'
        );

        const replacedDependencyIds = new Set([
            contractDependency.id,
            finiteCoverageDependency.id,
            collectiveExecutionDependency.id,
            oppositionCalibrationDependency.id
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
            collectiveExecutionDependency,
            oppositionCalibrationDependency
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
            contextualForcePartyCollectiveRelationEffect:audit,
            contextualForcePartyCollectiveRelationEffectRecords:audit.profile.records,
            contextualForcePartyCollectiveRelationEffectRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Collective Relation Effect v0.1 只执行两条已审定 visible finite actor-group opposition：relation identity 是 source actor → target group。',
                'Group-level source outcome 不要求 member-specific function realization，也绝不据此合成 member edges。',
                '“扶身”等来源 outcome qualifier 不自动创建日主受益 edge、membership 或 final Strength。',
                'Global collective resolver、cross-scope、mediation/augmentation、generic Relation Effect、Relative Dominance 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-collective-relation-effect-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyCollectiveRelationEffect = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
