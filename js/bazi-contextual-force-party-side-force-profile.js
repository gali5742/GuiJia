(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySideForceProfile?.installed) return;

    // Research bootstrap prerequisite: ./js/bazi-contextual-force-party-side-force-profile-contract.js?v=13.44.0
    // Research bootstrap prerequisite: ./js/bazi-contextual-force-party-side-force-profile-profile.js?v=13.44.0
    // Research bootstrap dependency: ./js/bazi-contextual-force-party-counter-context.js?v=13.44.0

    const contractApi = GuiJia.baziContextualForcePartySideForceProfileContract || null;
    const profileApi = GuiJia.baziContextualForcePartySideForceProfileProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, SIDE_TYPES, CONTEXT_FAMILIES, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const makeModelClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-MODEL',
        claimKey:'strength.contextual-force.party.side-force-profile.model',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            sideRelative:true,
            oneCounterAnchorPerSideProfile:true,
            multipleCounterAnchorsDoNotAutoMerge:true,
            contextFamilyIds:freezeArray(Object.values(CONTEXT_FAMILIES)),
            scalarCollapse:false,
            relativeDominanceMapping:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'Relative Dominance Source Audit 已要求 membership/anchor、季节、根基、directed relation effect、明暗、interaction 与位置 provenance 分层保存。本模型只建立 side-relative inventory，不承担跨轴比较。',
        boundary:'Model resolved 不表示任一具体 side 的必要输入已经完整，更不表示 qualitative comparison 或 relative dominance 已解析。'
    });

    const makeCoverageClaim = (view = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-COVERAGE',
        claimKey:'strength.contextual-force.party.side-force-profile.coverage',
        status:view.coverageComplete ? 'resolved' : 'unresolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            status:view.status,
            coverageComplete:view.coverageComplete === true,
            blockerIds:freezeArray((view.blockerRecords || []).map((item) => item.id)),
            qualitativeComparison:null,
            relativeDominance:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:view.coverageComplete
            ? '已登记 side context families 在当前命局均具备可追溯输入。'
            : 'Side profile 结构已建立，但仍有 source-authorized relation coverage 或 counter-anchor-specific seasonal/foundation context 缺口。',
        boundary:'Coverage complete 也只表示输入档案完整；不授权 count、score、priority 或双方胜负。'
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

    const buildProfileDependencies = (view = {}) => Object.freeze([
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-MODEL',
            scope:'contextual-force-party-side-force-profile-model',
            status:'resolved',
            statement:'Side Force Profile v0.1 已建立 provenance-preserving、one-counter-anchor-per-profile 的定性 inventory 模型。',
            boundary:'模型 resolved 不等于 profile coverage resolved。',
            dependsOnDependencyIds:[
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT',
                'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL',
                'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-MODEL'
            ],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-MODEL']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE',
            scope:'contextual-force-party-side-force-profile-coverage',
            status:view.coverageComplete ? 'resolved' : 'unresolved',
            statement:view.coverageComplete
                ? '当前命局所有已要求 side context families 均已有可追溯输入档案。'
                : `Side Force Profile 已建立，但仍有 ${(view.blockerRecords || []).length} 项 required input coverage blocker。`,
            boundary:'不得用空值兜底、日主轴复制、member/relation 数量或任意权重补齐 coverage。',
            dependsOnDependencyIds:[
                'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-KNOWN-MOTIF-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
                'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-COVERAGE'
            ],
            resolvedByClaimIds:view.coverageComplete ? ['SC-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-COVERAGE'] : []
        })
    ]);

    const rebuildComparisonRule = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Side profile 的输入结构已经定义，但来源仍没有给出跨季节、根基、relation effect、interaction 与位置上下文的通用比较器。',
            boundary:'Profile records 只能成为 comparator 的输入；不得按记录数量、字段顺序或人工 priority 直接决胜。'
        });
    };

    const rebuildRelativeDominance = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE',
                'SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Side Force Profile Model 已建立，但 profile coverage 与 qualitative comparison rule 尚未完成，因此 relative dominance 继续 unresolved。',
            boundary:'建立双方档案不等于判定一侧得势、失势、强或弱。'
        });
    };

    const rebuildPartyRule = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE',
                'SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            automaticClassifier:null,
            statement:'Party Configuration 只能在 side profile coverage、qualitative comparison 与 relative dominance 都完成后再讨论；当前继续关闭。',
            boundary:'不得从 side profile 的成员数组、relation-effect 数组或 blocker 数量生成党盛／势孤。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyRelativeDominanceSourceAudit) return base;
        const view = profileApi.buildSideForceProfileView(base);
        const modelClaim = makeModelClaim();
        const coverageClaim = makeCoverageClaim(view);
        const profileDependencies = buildProfileDependencies(view);
        const comparisonRule = rebuildComparisonRule(base);
        const relativeDominance = rebuildRelativeDominance(base);
        const partyRule = rebuildPartyRule(base);
        const replacedIds = new Set([
            ...profileDependencies.map((item) => item.id),
            comparisonRule.id,
            relativeDominance.id,
            partyRule.id
        ]);
        const claims = Object.freeze([...(base.claims || []), modelClaim, coverageClaim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...profileDependencies,
            comparisonRule,
            relativeDominance,
            partyRule
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
            contextualForcePartySideForceProfileContract:CONTRACT,
            contextualForcePartySideForceProfileView:view,
            contextualForcePartySideForceProfileRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Side Force Profile v0.1 为每个 counter anchor 建立独立 profile，不把多个克我 actor 自动合并成一个对立党。',
                '日主侧 seed、anchor-specific affiliation、opposition、mediation、interaction modifier 与位置 provenance 分层保存，不折成同一力量单位。',
                'counter anchor 不能直接复制日主 seasonal standing 或 root foundation；缺少专属 resolver 时明确保留 coverage blocker。',
                'Side Force Profile Model 可以 resolved，而 concrete coverage 仍可 unresolved；二者不得混写。',
                '本层不生成 member count、relation-effect score、qualitative comparison、relative dominance、Party Configuration、many/few、capacity 或 final Assessment。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartySideForceProfileView:profileApi.buildSideForceProfileView
    });

    GuiJia.baziContextualForcePartySideForceProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SIDE_TYPES,
        CONTEXT_FAMILIES,
        CONTRACT,
        profileApi,
        buildProfileDependencies,
        rebuildComparisonRule,
        rebuildRelativeDominance,
        rebuildPartyRule,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
