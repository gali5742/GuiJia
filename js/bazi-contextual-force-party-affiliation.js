(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyAffiliation?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyAffiliationContract) {
        document.write('<script src="./js/bazi-contextual-force-party-affiliation-contract.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyAffiliationProfile) {
        document.write('<script src="./js/bazi-contextual-force-party-affiliation-profile.js?v=13.44.0"><\/script>');
    }

    const contractApi = GuiJia.baziContextualForcePartyAffiliationContract || null;
    const profileApi = GuiJia.baziContextualForcePartyAffiliationProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, MOTIFS, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const makeContractClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-AFFILIATION-CONTRACT',
        claimKey:'strength.contextual-force.party.affiliation.contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            resolverScope:CONTRACT.resolverScope,
            sourcePatternRequired:true,
            existingEdgeRequired:true,
            affiliationIsAnchorSpecific:true,
            transitiveClosure:false,
            enemyOfEnemyShortcut:false,
            genericRuleFamilyCoverageComplete:false,
            motifIds:freezeArray(MOTIFS.map((item) => item.id))
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(unique(MOTIFS.flatMap((item) => item.sourceEvidenceIds))),
        rationale:'《滴天髓阐微·众寡》明确说“官星虽寡，得财星扶则强”，足以建立“财星通过已兑现 generation edge 扶助具体官／杀 anchor”的窄义 affiliation motif；但原文没有授权把所有我克／我生 actor 自动并入某侧。',
        boundary:'Contract resolved 只授权已登记 motif 的 target-specific affiliation bridge；不授权新造 function edge、传递闭包、全局 actor party 或 relative dominance。'
    });

    const makeViewClaim = (view = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-AFFILIATION-KNOWN-MOTIF-COVERAGE',
        claimKey:'strength.contextual-force.party.affiliation.known-motif-coverage',
        status:view.blockerRecords?.length ? 'unresolved' : 'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            status:view.status,
            recordCount:view.records?.length || 0,
            affiliatedRecordCount:view.affiliatedRecords?.length || 0,
            nonAffiliationRecordCount:view.nonAffiliationRecords?.length || 0,
            blockerCount:view.blockerRecords?.length || 0,
            genericRuleFamilyCoverageComplete:false,
            relativeDominance:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(unique(MOTIFS.flatMap((item) => item.sourceEvidenceIds))),
        rationale:view.status === 'known-motif-not-applicable'
            ? '当前命局没有既有 cross-visible source-context edge 命中已登记“财生官” motif，因此 known motif coverage 为 not-applicable。'
            : '已登记 motif 只消费现有 relation realization records，并逐 edge 输出 affiliation／non-affiliation／blocker。',
        boundary:'Known motif coverage resolved 不表示全部跨 actor party affiliation rule family 已覆盖。'
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

    const buildAffiliationDependencies = (view = {}) => Object.freeze([
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-MODEL',
            scope:'contextual-force-party-anchor-specific-affiliation-model',
            status:'resolved',
            statement:'Party Affiliation v0.1 已冻结为 source-backed、existing-edge-only、anchor-specific 模型；当前登记“财生官”一条 motif。',
            boundary:'模型已定义不表示 generic affiliation rule family 已覆盖。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE','SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-AFFILIATION-CONTRACT']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-KNOWN-MOTIF-COVERAGE',
            scope:'contextual-force-party-known-affiliation-motif-coverage',
            status:view.blockerRecords?.length ? 'unresolved' : 'resolved',
            statement:!view.records?.length
                ? '当前没有既有 cross-visible source-context edge 命中“财生官” motif，known motif coverage 为 not-applicable resolved。'
                : view.blockerRecords?.length
                    ? `已登记 motif 中仍有 ${view.blockerRecords.length} 条 edge realization 未解析。`
                    : '当前命局命中的已登记 affiliation motif 均已有 edge-specific affiliation 或明确 non-affiliation 结论。',
            boundary:'Coverage resolved 只覆盖已登记 motif；未登记 motif 不因 absence 被解释为“不归党”。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-MODEL'],
            resolvedByClaimIds:view.blockerRecords?.length ? [] : ['SC-CONTEXTUAL-FORCE-PARTY-AFFILIATION-KNOWN-MOTIF-COVERAGE']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION',
            scope:'contextual-force-party-cross-actor-affiliation-expansion',
            status:'unresolved',
            statement:'“财生官”已建立 source-backed anchor-specific bridge，但食伤制官杀、印化杀等其他 context-dependent affiliation／制衡 motif 尚未完成来源审计与执行映射。',
            boundary:'不得把单一 motif 的完成冒充 generic expansion 完成；不得使用敌人的敌人、元素传递链或 actor 数量补齐未覆盖关系。',
            dependsOnDependencyIds:[
                'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-KNOWN-MOTIF-COVERAGE'
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
                'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-KNOWN-MOTIF-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'已能在个别 source-backed edge 上解释 anchor-specific affiliation，但 generic affiliation family 与定性 relative dominance 仍未完成。',
            boundary:'一条财生官 affiliation 不等于官方整体占优，也不允许换算为党众数量。'
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
                'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-KNOWN-MOTIF-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            automaticClassifier:null,
            statement:'局部 affiliation motif 可以解析，但 generic expansion 与 relative dominance 未完成，因此不得生成党盛／党众／势孤／得势／失势。',
            boundary:'Affiliation 是关系事实，不是 Party Configuration 结论。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyMembershipInventory) return base;
        const view = profileApi.buildAffiliationView(base);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), makeViewClaim(view)]);
        const affiliationDependencies = buildAffiliationDependencies(view);
        const relativeDominance = rebuildRelativeDominance(base);
        const partyRule = rebuildPartyRule(base);
        const replacedIds = new Set([
            ...affiliationDependencies.map((item) => item.id),
            'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER',
            'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...affiliationDependencies,
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
            contextualForcePartyAffiliationContract:CONTRACT,
            contextualForcePartyAffiliationView:view,
            contextualForcePartyAffiliationRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Party Affiliation v0.1 只消费已存在且 source-context 已解析的 cross-actor edge，不按五行关系自行补造 edge。',
                '当前唯一 executable motif 是“财生官”：财星只在具体 realized generation target 上归附该官／杀 anchor，不形成 actor-global party。',
                'not-realized edge 只产生 non-affiliation-through-edge，不反向归队；unresolved edge 则保留 blocker。',
                'Affiliation 不做传递闭包、不使用敌人的敌人逻辑，也不把一个 anchor 的 affiliation 传播到其他 anchor。',
                'Known motif coverage 可以 resolved，但 generic affiliation family、relative dominance、Party Configuration、many/few、capacity 与 final Assessment 继续阻断。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyAffiliationView:profileApi.buildAffiliationView
    });

    GuiJia.baziContextualForcePartyAffiliation = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        MOTIFS,
        CONTRACT,
        profileApi,
        buildAffiliationDependencies,
        rebuildRelativeDominance,
        rebuildPartyRule,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyAffiliationExpansionAudit) {
        document.write('<script src="./js/bazi-contextual-force-party-affiliation-expansion-audit.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyRelationEffect) {
        document.write('<script src="./js/bazi-contextual-force-party-relation-effect.js?v=13.44.0"><\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);
