(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelativeDominanceAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyRelativeDominanceSource) {
        document.write('<script src="./js/bazi-contextual-force-party-relative-dominance-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyRelativeDominanceSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, EVIDENCE, FINDINGS, REQUIRED_INPUT_FAMILIES, CONTRACT } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const sourceEvidenceIds = freezeArray(EVIDENCE.map((item) => item.id));

    const findingMap = Object.freeze(Object.fromEntries(FINDINGS.map((item) => [item.key, item])));

    const buildAudit = () => Object.freeze({
        id:'CF-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT-V01',
        version:VERSION,
        ruleId:RULE_ID,
        status:'source-audited-resolver-unresolved',
        semanticShape:'side-relative-qualitative-force-comparison',
        requiredInputFamilies:freezeArray(REQUIRED_INPUT_FAMILIES),
        quantityAndForceSeparate:true,
        seasonalStandingSeparate:true,
        foundationSeparate:true,
        relationEffectsSeparate:true,
        interactionContextSeparate:true,
        memberCountIsNotDominance:true,
        relationEffectCountIsNotDominance:true,
        minorityCanBeStrong:true,
        qualitativeSideForceProfile:null,
        crossAxisPriorityRule:null,
        compensationRule:null,
        automaticRelativeDominanceResolver:null,
        partyConfiguration:null,
        numericScore:null,
        scalarForce:null,
        findings:findingMap,
        sourceEvidenceIds
    });

    const makeClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT',
        claimKey:'strength.contextual-force.party.relative-dominance.source-audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            semanticShape:'side-relative-qualitative-force-comparison',
            quantityAndForceSeparate:true,
            requiredInputFamilies:freezeArray(REQUIRED_INPUT_FAMILIES),
            memberCountIsNotDominance:true,
            relationEffectCountIsNotDominance:true,
            automaticResolverDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'《滴天髓阐微》同时使用“强众／强寡”与“众／寡”，并有“官星虽寡，得财星扶则强”；《玉井奥诀》又要求辨宅舍、基业与力轻力重。来源因此支持 side-relative qualitative comparison，但不支持 raw count 或统一跨轴换算。',
        boundary:'Source Audit resolved 只说明比较语义与输入边界已冻结；不表示 side force profile、cross-axis comparator、relative dominance 或 Party Configuration 已解析。'
    });

    const makeDependency = ({ id, scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind:'aggregation',
        scope,
        status,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        ruleId:RULE_ID,
        statement,
        boundary
    });

    const buildAuditDependencies = () => Object.freeze([
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT',
            scope:'contextual-force-party-relative-dominance-source-audit',
            status:'resolved',
            statement:'Relative Dominance Source Audit v0.1 已冻结为 side-relative、quantity/force 分轴、qualitative multi-context comparison；来源不支持 raw count、relation-effect count 或单一季节状态直接得出 dominance。',
            boundary:'语义模型 resolved 不等于比较器 resolved。',
            dependsOnDependencyIds:[
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE'
            ],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE',
            scope:'contextual-force-party-side-force-profile',
            status:'unresolved',
            statement:'来源要求在双方比较前保留 membership/anchor、季节背景、根基、定向 augmentation/opposition/mediation、明暗、交互与位置语义；当前尚无 side-level qualitative force profile 把这些输入按 provenance 组织起来。',
            boundary:'Side Force Profile 只能组织已存在的语义输入，不得把不同输入折成分数、权重、成员数量或单一 effectiveState。',
            dependsOnDependencyIds:[
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-KNOWN-MOTIF-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'
            ]
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE',
            scope:'contextual-force-party-qualitative-force-comparison-rule',
            status:'unresolved',
            statement:'原典承认力轻力重、强众与强寡，但未给出跨季节、根基、生扶、制衡、承接与交互的通用优先级或补偿算法；当前没有可执行 comparison rule。',
            boundary:'不得用 majority、priority list、last-write-wins、realized relation count 或手工数值权重补齐来源缺口。',
            dependsOnDependencyIds:[
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT',
                'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE'
            ]
        })
    ]);

    const rebuildRelativeDominance = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT',
                'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE',
                'SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Relative Dominance 的来源语义已明确为 side-relative qualitative comparison，但 side force profile 与跨轴 comparison rule 仍未建立，因此不得判任一侧占优。',
            boundary:'众寡、member 数量、relation-effect 数量、季节状态或单个 source motif 均不能单独解决 dominance。'
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
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT',
                'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE',
                'SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            automaticClassifier:null,
            statement:'Party Configuration 仍依赖 side force profile、qualitative comparison 与 relative dominance；当前不得生成党盛／党众／势孤／得势／失势。',
            boundary:'来源术语本身不是项目 classifier 输出授权。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyRelationEffectView) return base;
        const audit = buildAudit();
        const claim = makeClaim();
        const auditDependencies = buildAuditDependencies();
        const relativeDominance = rebuildRelativeDominance(base);
        const partyRule = rebuildPartyRule(base);
        const replacedIds = new Set([
            ...auditDependencies.map((item) => item.id),
            relativeDominance.id,
            partyRule.id
        ]);
        const claims = Object.freeze([...(base.claims || []), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...auditDependencies,
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
            contextualForcePartyRelativeDominanceSourceAudit:audit,
            contextualForcePartyRelativeDominanceSourceAuditRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Relative Dominance Source Audit v0.1 明确众寡与强弱分轴；“官星虽寡，得财星扶则强”禁止把少数侧自动判弱。',
                'Party relative dominance 必须保留至少两侧的 membership/anchor、季节、根基、directed relation effect、明暗、interaction 与位置 provenance。',
                'relation-effect record 数量、member 数量与季节状态都不是 dominance score。',
                '当前没有 universal cross-axis priority / compensation rule，因此 Side Force Profile、Qualitative Comparison、Relative Dominance 与 Party Configuration 均继续 unresolved。',
                '本阶段不改变 Qianli many/few、Strength Synthesis、capacity interpretation 或 final Assessment。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyRelativeDominanceSourceAudit:buildAudit
    });

    GuiJia.baziContextualForcePartyRelativeDominanceAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        sourceApi,
        buildAudit,
        buildAuditDependencies,
        rebuildRelativeDominance,
        rebuildPartyRule,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
