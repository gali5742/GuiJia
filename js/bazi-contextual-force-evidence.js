(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForceEvidence?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForceEvidenceSource) {
        document.write('<script src="./js/bazi-contextual-force-evidence-source.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForceEvidenceProfile) {
        document.write('<script src="./js/bazi-contextual-force-evidence-profile.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForceEvidenceSource || null;
    const profileApi = GuiJia.baziContextualForceEvidenceProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !profileApi || !priorSynthesisApi) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-EVIDENCE-001';
    const { SOURCES, EVIDENCE, AXES, FINDINGS, CONTRACT } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const makeClaim = (profile = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-EVIDENCE-MODEL',
        claimKey:'strength.contextual-force.evidence-model',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            modelType:CONTRACT.modelType,
            axisCount:CONTRACT.axisCount,
            mappedAxisIds:freezeArray(Object.keys(profile.axes || {})),
            partyConfigurationRuleDefined:false,
            capacitySemanticDirection:'relative-load-bearing',
            capacityInterpretationRuleDefined:false,
            numericAggregation:false,
            finalAssessmentMapping:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(EVIDENCE.map((item) => item.id)),
        rationale:'跨文献材料允许把月令、根基、扶助、克、泄、被分、支气、藏干 modifier 与交互修正组织成不可等值化的定性证据轴；同时“任／胜／受／当”只支持下游相对承载语义。',
        boundary:'Evidence Model resolved 只表示证据结构已经确定，不表示党势、总力量、many/few、能任某神或最终 strong/weak 已解析。'
    });

    const makeCapacityClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-CAPACITY-SEMANTIC-DIRECTION',
        claimKey:'strength.contextual-force.capacity-semantic-direction',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({ semanticDirection:'relative-load-bearing', automaticInterpretation:false }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(['CF-E02','CF-E03','CF-E04','CF-E05']),
        rationale:'《渊海子平》《神峰通考》《子平真诠》《千里命稿》均以“任／胜／受／当”等语言讨论日主面对财、官杀、食神、伤官七煞等作用时的承受关系。',
        boundary:'跨来源只支持 capacity semantic direction；不能由此生成 canBearWealth/canBearOfficerKilling 等布尔结论。'
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

    const rebuildGeneralizationRule = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-QIANLI-QUANTITY-GENERALIZATION-RULE') || {};
        return Object.freeze({
            ...current,
            id:'SD-QIANLI-QUANTITY-GENERALIZATION-RULE',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            semanticDirection:'contextual-relative-force',
            statement:'Contextual Force Evidence Model 已建立，但尚未定义如何从多轴证据形成可审计的 party configuration／相对力量解释，因此 many/few generalization 继续 unresolved。',
            boundary:'不得把 profile coverage、候选数量或单一轴状态直接当 generalization rule。'
        });
    };

    const buildDependencies = (base = {}, profile = {}) => Object.freeze([
        makeDependency({
            id:'SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL',
            scope:'qianli-contextual-relative-force-evidence-model',
            status:'resolved',
            statement:'跨文献支持的多轴、非数值 Contextual Force Evidence Model 已建立并接入现有 Strength Synthesis。',
            boundary:'模型 resolved 不等于 profile interpretation、many/few 或强弱结论 resolved。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-GENERALIZATION-SEMANTIC-DIRECTION'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-EVIDENCE-MODEL']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE',
            scope:'contextual-force-profile-evidence-coverage',
            status:profile.unresolvedAxisIds?.length ? 'unresolved' : 'resolved',
            statement:profile.unresolvedAxisIds?.length
                ? `Contextual Force profile 已映射，但仍有未完成 axis adapter：${profile.unresolvedAxisIds.join('、')}。`
                : 'Contextual Force profile 所有证据轴均已映射。',
            boundary:'Coverage 只说明证据轴是否可追溯，不产生 party、force 或 strength classification。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE',
            scope:'contextual-force-party-configuration',
            status:'unresolved',
            statement:'尚未定义如何从根基、扶助、季节与交互状态形成“党众／势孤”等可执行 party configuration。',
            boundary:'不得把比劫、印、根、藏干或支数简单相加为党势。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-CAPACITY-SEMANTIC-DIRECTION',
            scope:'contextual-force-capacity-semantic-direction',
            status:'resolved',
            statement:'跨《渊海子平》《神峰通考》《子平真诠》《千里命稿》的“任／胜／受／当”语义支持 relative-load-bearing 作为下游解释方向。',
            boundary:'只解决语义方向，不生成任财、胜杀等具体结果。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-CAPACITY-SEMANTIC-DIRECTION']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-CAPACITY-INTERPRETATION-RULE',
            scope:'contextual-force-function-specific-capacity-interpretation',
            status:'unresolved',
            statement:'尚缺把 Contextual Force profile 与具体财、官杀、食伤等 function/load 对接为来源支持的 capacity interpretation 规则。',
            boundary:'不得由“身强”“有根”或某一条 contribution 单独生成 can-bear/cannot-bear 结论。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-CAPACITY-SEMANTIC-DIRECTION','SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE']
        }),
        rebuildGeneralizationRule(base)
    ]);

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const profile = profileApi.buildProfile(semanticModel, base);
        const claims = Object.freeze([...(base.claims || []), makeClaim(profile), makeCapacityClaim()]);
        const newDependencies = buildDependencies(base, profile);
        const replacedIds = new Set(newDependencies.map((item) => item.id));
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...newDependencies
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
            contextualForceEvidenceSources:SOURCES,
            contextualForceEvidenceSourceEvidence:EVIDENCE,
            contextualForceEvidenceAxes:AXES,
            contextualForceEvidenceFindings:FINDINGS,
            contextualForceEvidenceContract:CONTRACT,
            contextualForceEvidenceProfile:profile,
            contextualForceEvidenceRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Contextual Force Evidence v0.1 只建立多轴、非数值 evidence profile；不生成 force score 或 strong/weak。',
                'seasonal standing、root foundation、allied support、restraint、drain、distribution、branch qi、hidden modifier 与 interaction modifier 均保持独立。',
                'party configuration 尚未解析，不能把同党候选数量直接解释成“党众／多帮扶”。',
                '“任／胜／受／当”已确认是跨来源 capacity semantic direction，但具体 capacity interpretation rule 仍未定义。',
                'Strength Composition、many/few classifier 与最终 Assessment 继续受下游依赖阻断。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForceEvidenceProfile:profileApi.buildProfile
    });

    GuiJia.baziContextualForceEvidence = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCES,
        EVIDENCE,
        AXES,
        FINDINGS,
        CONTRACT,
        profileApi,
        relationMatchesMeaning:profileApi.relationMatchesMeaning,
        buildProfile:profileApi.buildProfile,
        buildDependencies,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
