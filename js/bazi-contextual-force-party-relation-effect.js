(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationEffect?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyRelationEffectContract) {
        document.write('<script src="./js/bazi-contextual-force-party-relation-effect-contract.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyRelationEffectProfile) {
        document.write('<script src="./js/bazi-contextual-force-party-relation-effect-profile.js?v=13.44.0"><\/script>');
    }

    const contractApi = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const profileApi = GuiJia.baziContextualForcePartyRelationEffectProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, RELATION_TYPES, EFFECT_STATES, MOTIFS, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const sourceEvidenceIds = freezeArray(unique(MOTIFS.flatMap((item) => item.sourceRegistryEvidenceIds || [])));

    const makeContractClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-CONTRACT',
        claimKey:'strength.contextual-force.party.cross-actor-relation-effect.contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            resolverScope:CONTRACT.resolverScope,
            relationTypes:freezeArray(Object.values(RELATION_TYPES)),
            existingEdgeRequired:true,
            sourcePatternRequired:true,
            targetSpecific:true,
            augmentationReusesAffiliationIdentity:true,
            oppositionCreatesMembership:false,
            mediationCreatesMembership:false,
            actorGlobalParty:false,
            relativeDominanceMapping:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'上游 Source Audit 已把财滋杀／党杀、食神制杀、印绶化杀／杀印相生分成 augmentation、opposition、mediation 三类。本层只消费已有 source-backed realization edge，把这些关系落为可追溯 relation-effect record。',
        boundary:'Contract resolved 不表示 generic relation family 已覆盖，也不产生 party membership、relative dominance、party configuration 或最终强弱。'
    });

    const makeViewClaim = (view = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-KNOWN-MOTIF-COVERAGE',
        claimKey:'strength.contextual-force.party.cross-actor-relation-effect.known-motif-coverage',
        status:view.blockerRecords?.length ? 'unresolved' : 'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            status:view.status,
            recordCount:view.records?.length || 0,
            realizedRecordCount:view.realizedRecords?.length || 0,
            nonRealizedRecordCount:view.nonRealizedRecords?.length || 0,
            blockerCount:view.blockerRecords?.length || 0,
            genericRelationEffectCoverageComplete:false,
            activeMemberCount:null,
            relativeDominance:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:!view.records?.length
            ? '当前命局没有已有 source-backed cross-visible edge 命中已登记 augmentation／opposition／mediation motif，known motif coverage 为 not-applicable。'
            : '当前命局命中的已登记 relation-effect motif 已逐 edge 保存 realized／not-realized／unresolved 状态。',
        boundary:'记录数量仅用于审计 coverage，不参与 party size、力量比较或 majority voting。'
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

    const buildRelationEffectDependencies = (view = {}) => Object.freeze([
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL',
            scope:'contextual-force-party-cross-actor-relation-effect-model',
            status:'resolved',
            statement:'Party Cross-Actor Relation Effect v0.1 已定义 existing-edge-only 的 augmentation／opposition／mediation mapper；positive effect 只来自 source-context realized edge。',
            boundary:'模型完成不表示所有 cross-actor 关系都已有 source-backed realization，也不表示 side-relative dominance 已知。',
            dependsOnDependencyIds:[
                'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-RELATION-TAXONOMY',
                'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE',
                'SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL'
            ],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-CONTRACT']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-KNOWN-MOTIF-COVERAGE',
            scope:'contextual-force-party-known-cross-actor-relation-effect-coverage',
            status:view.blockerRecords?.length ? 'unresolved' : 'resolved',
            statement:!view.records?.length
                ? '当前命局没有 source-backed edge 命中已登记 relation-effect motif，known motif coverage 为 not-applicable resolved。'
                : view.blockerRecords?.length
                    ? `已登记 relation-effect motif 中仍有 ${view.blockerRecords.length} 条 edge realization 未解析。`
                    : '当前命局命中的已登记 relation-effect motif 均已有 realized 或明确 not-realized 结论。',
            boundary:'Known motif coverage resolved 不等于 generic cross-actor relation-effect coverage 完整。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL'],
            resolvedByClaimIds:view.blockerRecords?.length ? [] : ['SC-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-KNOWN-MOTIF-COVERAGE']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            scope:'contextual-force-party-cross-actor-relation-effect-generalization',
            status:'unresolved',
            statement:'已登记财滋杀／食神制杀／杀印相生三类 relation-effect motif，但尚无来源授权把所有相同十神／五行 shape 自动推广为 realized relation effect。',
            boundary:'不得由元素生克、十神类别、柱距或“常见格局名”自行生成 sourcePatternId 或 realization。',
            dependsOnDependencyIds:[
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-KNOWN-MOTIF-COVERAGE'
            ]
        })
    ]);

    const rebuildGenericAffiliationExpansion = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION',
            scope:'contextual-force-party-anchor-augmentation-affiliation-generalization',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'旧 generic affiliation blocker 现收窄为 anchor-augmentation affiliation generalization：财生官杀已有一条 source-backed bridge，但不能把 opposition／mediation 误当 affiliation，也不能把同形关系自动推广。',
            boundary:'保留旧 dependency ID 作为兼容接口；其语义不再承担所有 cross-actor relation，而只阻断尚未完成的 augmentation-affiliation 泛化。'
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
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-KNOWN-MOTIF-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
                'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'跨 actor 关系已能按 augmentation／opposition／mediation 分型保存，但 generic coverage 与这些作用对双方定性力量的比较规则仍未完成。',
            boundary:'不能把 relation-effect record 数量、realized 数量或“扶身／制杀／化杀”字样换算成一侧占优。'
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
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            automaticClassifier:null,
            statement:'Relation Effect mapper 已建立，但 generic coverage 与 relative dominance 未完成，因此仍不得生成党盛／党众／势孤／得势／失势。',
            boundary:'Cross-actor relation effect 是 Party Configuration 的输入语义，不是结论。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyAffiliationExpansionSourceAudit) return base;
        const view = profileApi.buildRelationEffectView(base);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), makeViewClaim(view)]);
        const relationDependencies = buildRelationEffectDependencies(view);
        const genericAffiliation = rebuildGenericAffiliationExpansion(base);
        const relativeDominance = rebuildRelativeDominance(base);
        const partyRule = rebuildPartyRule(base);
        const replacedIds = new Set([
            ...relationDependencies.map((item) => item.id),
            genericAffiliation.id,
            relativeDominance.id,
            partyRule.id
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...relationDependencies,
            genericAffiliation,
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
            contextualForcePartyRelationEffectContract:CONTRACT,
            contextualForcePartyRelationEffectView:view,
            contextualForcePartyRelationEffectRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Party Cross-Actor Relation Effect v0.1 只消费已有 source-backed target-specific function realization，不新造 cross-actor edge。',
                '财→官杀 augmentation 复用既有 Affiliation relation identity，不复制第二份 membership 或力量单位。',
                '食神→七杀 restraint 只形成 anchor opposition；即使结果可扶身，也不把食神写成日主侧 member。',
                '七杀→印星 generation 只形成 anchor mediation；保持杀→印方向与双方 membership identity，不形成 party switch。',
                'not-realized edge 不生成反向作用，unresolved edge 不生成 positive effect。',
                'Relation Effect mapper 完成仍不生成 relative dominance、Party Configuration、many/few、capacity 或 final Assessment。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyRelationEffectView:profileApi.buildRelationEffectView
    });

    GuiJia.baziContextualForcePartyRelationEffect = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RELATION_TYPES,
        EFFECT_STATES,
        MOTIFS,
        CONTRACT,
        profileApi,
        buildRelationEffectDependencies,
        rebuildGenericAffiliationExpansion,
        rebuildRelativeDominance,
        rebuildPartyRule,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyRelativeDominanceAudit) {
        document.write('<script src="./js/bazi-contextual-force-party-relative-dominance-audit.js?v=13.44.0"><\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);
