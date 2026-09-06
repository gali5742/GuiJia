(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCollectiveMediationEffect?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCollectiveMediationEffectContract || null;
    const profileApi = GuiJia.baziContextualForcePartyCollectiveMediationEffectProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, FINITE_COLLECTIVE_MEDIATION_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceCaseIds = freezeArray(Object.keys(FINITE_COLLECTIVE_MEDIATION_REGISTRY));

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-COLLECTIVE-MEDIATION-EFFECT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.unresolvedRecords.length ? 'finite-collective-mediation-effect-partial' : 'finite-collective-mediation-effect-source-scoped-complete',
            contract:CONTRACT,
            profile,
            effectCount:profile.records.length,
            resolvedEffectCount:profile.resolvedRecords.length,
            unresolvedEffectCount:profile.unresolvedRecords.length,
            finiteVisibleCoverageComplete:profile.finiteVisibleCoverageComplete,
            sourceScopedFiniteCollectiveMediationDefined:true,
            globalCollectiveMediationResolverDefined:false,
            crossScopeCollectiveExecutionDefined:false,
            sourceMemberEdgeExpansion:false,
            relationRealizationMutation:false,
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
        id:'SC-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION-CONTRACT',
        claimKey:'strength.contextual-force.party.collective-mediation-effect.execution-contract',
        status:'resolved',
        value:{
            relationIdentityType:CONTRACT.relationIdentityType,
            resolverScope:CONTRACT.resolverScope,
            resolvedSourceActorGroupIdentityRequired:true,
            exactSourceOutcomeRequired:true,
            sourceMemberEdgeExpansion:false,
            sourceMemberSpecificRealizationSynthesized:false
        },
        rationale:'MED CASE-04 已有来源明确的“干透两杀” source group identity，且同一来源明确“戊土原神透出，是以化杀”；因此可定义 group→single-actor mediation effect，而不要求把两枚丙杀分别物化为 actor→actor generation edges。',
        boundary:'只定义 exact source-scoped finite collective mediation execution；不授权 generic source-group resolver、cross-scope mediation、member-edge projection 或 Strength mapping。'
    });

    const makeCoverageClaim = (audit = {}) => makeClaim({
        id:'SC-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-VISIBLE-FINITE-COVERAGE',
        claimKey:'strength.contextual-force.party.collective-mediation-effect.visible-finite-coverage',
        status:audit.finiteVisibleCoverageComplete ? 'resolved' : 'unresolved',
        value:{
            sourceCaseIds,
            effectRecordIds:freezeArray((audit.profile.resolvedRecords || []).map((item) => item.id)),
            sourceGroupIds:freezeArray((audit.profile.resolvedRecords || []).map((item) => item.sourceGroupId)),
            targetActorKeys:freezeArray((audit.profile.resolvedRecords || []).map((item) => item.targetActorKey)),
            coverageComplete:audit.finiteVisibleCoverageComplete
        },
        rationale:audit.finiteVisibleCoverageComplete
            ? 'MED CASE-04 的 source group、single visible 印 target、generation function 与“化杀” outcome 均能一一对齐，形成一条 finite group→actor mediation effect。'
            : '至少一条 collective mediation candidate 未通过 provenance validator。',
        boundary:'只证明当前 registry 的 exact finite case，不代表 mediation corpus 或 generic collective mediation resolver 已覆盖。'
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
        id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION-CONTRACT',
        scope:'group-to-actor-source-scoped-collective-mediation-effect-record',
        status:'resolved',
        statement:'Collective Mediation Effect v0.1 已定义 group→actor relation identity、exact-source outcome authority 与禁止 source-member-edge expansion 的执行合同。',
        boundary:'合同 resolved 不等于 global collective mediation resolver resolved。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-CONTRACT'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION-CONTRACT']
    });

    const buildFiniteCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-VISIBLE-FINITE-COVERAGE',
        kind:'source-coverage',
        scope:'audited-visible-finite-group-to-actor-mediation-source-registry',
        status:audit.finiteVisibleCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteVisibleCoverageComplete
            ? `v0.1 registry 的 ${audit.resolvedEffectCount} 个 group→actor mediation case 已形成 source-scoped realized effect record。`
            : 'v0.1 registry 仍有 collective mediation candidate 未通过 validator。',
        boundary:'只覆盖 MED CASE-04；不扩张到其他“化杀”或杀印语义。',
        dependsOnDependencyIds:[contractDependency.id,'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE'],
        resolvedByClaimIds:audit.finiteVisibleCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-VISIBLE-FINITE-COVERAGE']
            : []
    });

    const buildGlobalDependency = (contractDependency = {}, finiteCoverageDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION',
        scope:'global-collective-source-group-to-actor-mediation-resolver',
        status:'unresolved',
        statement:'已有一条 exact visible finite group→actor mediation execution，但 global collective mediation resolver、cross-scope source group execution 与其他 mediation source cases 尚未闭合。',
        boundary:'不得把 MED CASE-04 泛化为所有多杀→印关系；不得用 member count 或五行相生补齐未登记 execution。',
        dependsOnDependencyIds:[contractDependency.id,finiteCoverageDependency.id,'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY']
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
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceActorGroupIdentity) return base;
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
            'Mediation E2E 已新增 MED CASE-04 的 source-scoped group→actor realized effect；但原 dependency 仍包含 actor-specific/cross-scope mediation cases，且尚未建立独立 group-source E2E calibration，因此继续 unresolved。',
            'Finite collective mediation effect 不能回写成两条 member-specific 杀→印 edges，也不能使整个 mediation corpus 自动 PASS。'
        );

        const knownMotifCalibrationDependency = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION',
            [finiteCoverageDependency],
            'Known motif calibration 现已有 actor→group opposition 与 group→actor mediation 两种 finite collective realization，但原 raw visible actor→actor calibration 与更广 corpus 仍未完成，因此总 dependency 继续 unresolved。',
            '不同 relation identity type 的 finite PASS 不得折叠成 generic visible-edge PASS。'
        );

        const generalizationDependency = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            [finiteCoverageDependency,globalDependency],
            'Cross-Actor Relation Effect 现新增一条 group→actor mediation 正向 execution evidence；但 generic actor→actor mapping、cross-scope realization、broader group coverage 与 global resolver 仍未闭合。',
            'Exact MED CASE-04 execution 不能泛化全部杀印相生、化杀或多 source relation。'
        );

        const replacedClaimIds = new Set([contractClaim.id,coverageClaim.id]);
        const replacedDependencyIds = new Set([
            contractDependency.id,
            finiteCoverageDependency.id,
            globalDependency.id,
            mediationCalibrationDependency.id,
            knownMotifCalibrationDependency.id,
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
            knownMotifCalibrationDependency,
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
            contextualForcePartyCollectiveMediationEffect:audit,
            contextualForcePartyCollectiveMediationEffectRecords:audit.profile.records,
            contextualForcePartyCollectiveMediationEffectRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Collective Mediation Effect v0.1 只执行 MED CASE-04：relation identity 是 source 七杀 group → single visible 戊印。',
                'Group-level “化杀” outcome 不要求两枚丙杀分别存在 target-specific generation realization，也绝不据此合成 source member edges。',
                'Source group、target actor 与 source wording 必须 exact match；五行 generation shape 本身不能补造 execution。',
                'Global collective mediation、cross-scope、mediation E2E 总 calibration、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-collective-mediation-effect-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyCollectiveMediationEffect = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
