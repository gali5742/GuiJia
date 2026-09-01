(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForceInteractionAdapter?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForceInteractionAdapterContract) {
        document.write('<script src="./js/bazi-contextual-force-interaction-adapter-contract.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForceInteractionAdapterProfile) {
        document.write('<script src="./js/bazi-contextual-force-interaction-adapter-profile.js?v=13.44.0"><\/script>');
    }

    const contractApi = GuiJia.baziContextualForceInteractionAdapterContract || null;
    const profileApi = GuiJia.baziContextualForceInteractionAdapterProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, INPUT_FAMILIES, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const makeContractClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-CONTRACT',
        claimKey:'strength.contextual-force.interaction-adapter.contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            whitelistOnly:true,
            inputFamilyIds:CONTRACT.inputFamilyIds,
            structurePresenceCreatesModifier:false,
            daymasterRelatedFunctionEdgesExcluded:true,
            profileQualifierIndependentModifier:false,
            numericAggregation:false,
            partyConfigurationMapping:false,
            finalStrengthMapping:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'上游已经分别建立 root-clash interaction semantics、exact-source Stem Bearing、edge-specific Function Realization 与 Actor Profile Interpretation。本 adapter 只负责把这些已解析且 target-specific 的结果接入 interactionModifier，不重新解释传统规则。',
        boundary:'Adapter contract resolved 不等于任何交互必然发生，也不等于 party configuration、many/few、capacity 或强弱结论已解析。'
    });

    const makeDependency = ({ id, scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind:'aggregation',
        scope,
        status,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        ruleId:RULE_ID,
        statement,
        boundary
    });

    const buildAdapterDependencies = (view = {}) => Object.freeze([
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-MODEL',
            scope:'contextual-force-interaction-adapter-contract',
            status:'resolved',
            statement:'Interaction Force Adapter 已冻结为 source-context、actor/function-target-specific 白名单映射。',
            boundary:'模型 resolved 不表示上游所有 interaction outcome 都 resolved。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-CONTRACT']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-COVERAGE',
            scope:'contextual-force-known-interaction-input-coverage',
            status:view.blockerRecords?.length ? 'unresolved' : 'resolved',
            statement:view.blockerRecords?.length
                ? `存在 ${view.blockerRecords.length} 条已识别 interaction input 尚无 source-context outcome。`
                : '当前白名单内已识别的 interaction inputs 均已解析、明确未兑现，或在本局不适用。',
            boundary:'Coverage 不要求所有 Structure 都有 modifier；普通刑冲合会存在本身不构成 blocker。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-MODEL']
        })
    ]);

    const rebuildProfileCoverageDependency = (base = {}, profile = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE') || {};
        const unresolved = profile.unresolvedAxisIds || [];
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE',
            status:unresolved.length ? 'unresolved' : 'resolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-COVERAGE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:unresolved.length
                ? `Contextual Force profile 仍有未完成 axis：${unresolved.join('、')}。`
                : 'Contextual Force 九个证据轴均已完成可追溯映射；这只表示 evidence coverage complete。',
            boundary:'Profile coverage resolved 不等于九轴已经合成总力量，更不等于党众/势孤、多/少、capacity 或 strong/weak 已解析。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForceEvidenceProfile) return base;
        const adapterView = profileApi.buildAdapterView(semanticModel, base);
        const profile = profileApi.applyAdapterToProfile(base.contextualForceEvidenceProfile, adapterView);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim()]);
        const adapterDependencies = buildAdapterDependencies(adapterView);
        const profileCoverageDependency = rebuildProfileCoverageDependency(base, profile);
        const replacedIds = new Set([
            'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-MODEL',
            'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-COVERAGE',
            'SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...adapterDependencies,
            profileCoverageDependency
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
            contextualForceEvidenceProfile:profile,
            contextualForceInteractionAdapterView:adapterView,
            contextualForceInteractionAdapterContract:CONTRACT,
            contextualForceInteractionAdapterRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Interaction Force Adapter v0.1 只接入 source-context 已解析的 root clash、bearing 与 cross-visible function interaction。',
                '普通 Structure presence 不产生 modifier，也不要求每一条刑冲合会都被强行解释。',
                'daymaster-related function edge 已由 support/restraint/drain/distribution 轴承担，不在 interactionModifier 重复成为 direct strength contribution。',
                'cross-visible not-realized edge 单列为 non-realization；Actor Profile Interpretation 只作 qualifier，避免同一证据重复计力。',
                '九轴 profile coverage 可以 resolved，但 party configuration、many/few、capacity interpretation、Strength Synthesis 与 Assessment 仍继续阻断。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForceInteractionAdapterView:profileApi.buildAdapterView,
        applyContextualForceInteractionAdapterToProfile:profileApi.applyAdapterToProfile
    });

    GuiJia.baziContextualForceInteractionAdapter = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        INPUT_FAMILIES,
        CONTRACT,
        profileApi,
        collectRootClash:profileApi.collectRootClash,
        collectStemBearing:profileApi.collectStemBearing,
        collectCrossVisibleFunctions:profileApi.collectCrossVisibleFunctions,
        collectProfileQualifiers:profileApi.collectProfileQualifiers,
        buildAdapterView:profileApi.buildAdapterView,
        applyAdapterToProfile:profileApi.applyAdapterToProfile,
        buildAdapterDependencies,
        rebuildProfileCoverageDependency,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyAudit) {
        document.write('<script src="./js/bazi-contextual-force-party-audit.js?v=13.44.0"><\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);
