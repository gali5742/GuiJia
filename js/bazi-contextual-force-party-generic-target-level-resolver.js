(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyGenericTargetLevelResolver?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyGenericTargetLevelResolverContract || null;
    const profileApi = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.providedInputCoverageComplete ? 'generic-target-level-kernel-calibrated-on-provided-input' : 'generic-target-level-kernel-partial-on-provided-input',
            contract:CONTRACT,
            profile,
            inputCount:profile.resolutions.length,
            resolvedCount:profile.resolvedResolutions.length,
            notApplicableCount:profile.notApplicableResolutions.length,
            unresolvedCount:profile.unresolvedResolutions.length,
            genericDecisionKernelDefined:true,
            finiteNormalizedInputCalibrationComplete:profile.providedInputCoverageComplete,
            broaderSourceCoverageProven:false,
            globalSourceCoverageResolved:false,
            relationEffectExecution:false,
            membershipMutation:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-KERNEL',
        claimKey:'strength.contextual-force.party.relation-target.generic-target-level-resolver-kernel',
        status:audit.finiteNormalizedInputCalibrationComplete ? 'resolved' : 'unresolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            resolverInput:CONTRACT.resolverInput,
            resolverUnit:CONTRACT.resolverUnit,
            genericDecisionKernelDefined:true,
            providedInputCount:audit.inputCount,
            resolvedCount:audit.resolvedCount,
            notApplicableCount:audit.notApplicableCount,
            unresolvedCount:audit.unresolvedCount,
            providedInputCalibrationComplete:audit.finiteNormalizedInputCalibrationComplete,
            broaderSourceCoverageProven:false,
            globalSourceCoverageResolved:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray((audit.profile.resolutions || []).map((item) => item.sourceCaseId)),
        rationale:'Generic Target-Level Resolver v0.1 已只依赖 normalized provenance 决定 role-class / single-actor / actor-set / configuration，并在当前 normalized 8-case input 上无 unresolved；case id、source text、expectedTargetLevel、semanticLevelHint 与旧 finite resolution 均不是决策特征。',
        boundary:'本 claim 只证明 generic decision kernel 与当前 normalized finite calibration；broader source annotation coverage、generic relation effect、Relative Dominance、Strength 与 Assessment 仍未解决。'
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
        id:'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-CONTRACT',
        scope:'generic-target-level-decision-kernel-contract',
        status:'resolved',
        statement:'Generic Target-Level Resolver v0.1 已定义 provenance-only decision kernel：theory/generalized rule → role-class；chart/relation-event + resolved actor identity → single-actor；chart/relation-event + resolved actor-group identity → actor-set；configuration-only → configuration。',
        boundary:'Contract resolved 不代表 broader source coverage 已完成；mixed commentary 与缺 provenance 输入继续 fail closed。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-INPUT-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-FINITE-ADAPTER-COVERAGE'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-KERNEL']
    });

    const buildFiniteCalibrationDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-FINITE-NORMALIZED-CALIBRATION',
        kind:'calibration',
        scope:'generic-target-level-kernel-on-normalized-eight-case-input',
        status:audit.finiteNormalizedInputCalibrationComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteNormalizedInputCalibrationComplete
            ? `Generic kernel 已在当前 ${audit.inputCount} 条 normalized input 上得到 ${audit.resolvedCount} 条 resolved 与 ${audit.notApplicableCount} 条合法 not-applicable，0 unresolved。`
            : `Generic kernel 当前 provided input 仍有 ${audit.unresolvedCount} 条 unresolved。`,
        boundary:'Finite normalized calibration 证明规则不依赖 case-specific expected label；它不等于 broader annotation/source coverage。',
        dependsOnDependencyIds:[contractDependency.id,'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-FINITE-ADAPTER-COVERAGE'],
        resolvedByClaimIds:audit.finiteNormalizedInputCalibrationComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-KERNEL']
            : []
    });

    const rebuildGlobalResolverDependency = (base = {}, contractDependency = {}, calibrationDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                contractDependency.id,
                calibrationDependency.id,
                'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Generic target-level decision kernel 已实现并通过 finite normalized calibration；但 broader relation-source semantic annotation coverage 尚未建立，因此 global source coverage 仍 unresolved。',
            boundary:'不得把“generic algorithm exists”与“所有传统来源都能被正确规整/解析”混为一谈。进入 relation effect generalization 前仍须保持 source provenance 与 unresolved 能力。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyRelationTargetNormalizedInput) return base;

        const audit = buildAudit();
        const claim = makeClaim(audit);
        const contractDependency = buildContractDependency();
        const calibrationDependency = buildFiniteCalibrationDependency(contractDependency, audit);
        const globalResolverDependency = rebuildGlobalResolverDependency(base, contractDependency, calibrationDependency);
        const replacedDependencyIds = new Set([contractDependency.id,calibrationDependency.id,globalResolverDependency.id]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            calibrationDependency,
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
            contextualForcePartyGenericTargetLevelResolver:audit,
            contextualForcePartyGenericTargetLevelResolverRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Generic Target-Level Resolver v0.1 只消费 Relation Target Normalized Input，不读取 finite expectedTargetLevel / semanticLevelHint / legacy resolution。',
                'Resolver 决策单位是 relation-target unit；sourceCaseId、annotationId、sourceText 与 lexical marker 不是决策特征。',
                'Theory-general/generalized-rule 只可得到 role-class；chart-case/relation-event 的 instance level 必须有 source-scoped resolved actor/group identity 与 chart provenance。',
                'Generic kernel 已通过当前 finite normalized calibration，但 broader source coverage、Relation Effect Generalization、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-generic-target-level-resolver-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyGenericTargetLevelResolver = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
