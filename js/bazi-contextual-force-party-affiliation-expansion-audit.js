(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyAffiliationExpansionAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyAffiliationExpansionSource) {
        document.write('<script src="./js/bazi-contextual-force-party-affiliation-expansion-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyAffiliationExpansionSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const VERSION = '0.2';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-AFFILIATION-EXPANSION-AUDIT-002';
    const { RELATION_TYPES, EVIDENCE, FINDINGS, CONTRACT } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const evidenceIdsForType = (relationType) => freezeArray(
        EVIDENCE.filter((item) => item.relationType === relationType).map((item) => item.id)
    );

    const buildAudit = () => Object.freeze({
        status:'source-audited-generic-resolver-unresolved',
        relationTypes:Object.freeze({
            anchorAugmentation:Object.freeze({
                type:RELATION_TYPES.ANCHOR_AUGMENTATION,
                sourceEvidenceIds:evidenceIdsForType(RELATION_TYPES.ANCHOR_AUGMENTATION),
                partySemantic:'may-support-anchor-specific-affiliation',
                executionAuthorization:'existing-target-specific-realized-edge-required',
                actorGlobalParty:null,
                boundary:'增强具体官杀 anchor 可以形成 affiliation candidate，但仍须既有 edge、source context 与 realization；不能从十神或五行关系存在直接生成。'
            }),
            anchorOpposition:Object.freeze({
                type:RELATION_TYPES.ANCHOR_OPPOSITION,
                sourceEvidenceIds:evidenceIdsForType(RELATION_TYPES.ANCHOR_OPPOSITION),
                partySemantic:'opposition-to-anchor-not-membership',
                executionAuthorization:'no-affiliation-mapping-authorized',
                actorGlobalParty:null,
                boundary:'食伤制杀等关系只能先记录对具体 anchor 的制衡；即使结果扶身，也不能用“敌人的敌人”逻辑改写为日主侧 member。'
            }),
            anchorMediation:Object.freeze({
                type:RELATION_TYPES.ANCHOR_MEDIATION,
                sourceEvidenceIds:evidenceIdsForType(RELATION_TYPES.ANCHOR_MEDIATION),
                partySemantic:'mediation-channel-not-membership-switch',
                executionAuthorization:'no-affiliation-mapping-authorized',
                actorGlobalParty:null,
                boundary:'印绶化杀／杀印相生保留官杀→印的生化方向与 mediated support outcome；不得把官杀改成日主侧 member，也不得反写 edge。'
            })
        }),
        genericAffiliationExpansionResolver:null,
        relativeDominanceResolver:null,
        partyConfiguration:null,
        numericScore:null,
        scalarForce:null,
        boundary:'Audit 只冻结 relation taxonomy 与禁止映射；它不是新的 cross-actor resolver，也不产生任何 active member、party count 或强弱结论。'
    });

    const makeAuditClaim = (audit) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-AFFILIATION-EXPANSION-SOURCE-AUDIT',
        claimKey:'strength.contextual-force.party.affiliation-expansion.source-audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            relationTypeTaxonomyDefined:true,
            relationTypes:freezeArray(Object.values(RELATION_TYPES)),
            wealthAugmentationMaySupportAffiliation:true,
            oppositionIsNotAffiliation:true,
            mediationIsNotAffiliation:true,
            benefitToDaymasterIsNotMembership:true,
            edgeDirectionMustBePreserved:true,
            genericAffiliationExpansionResolverDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(EVIDENCE.map((item) => item.id)),
        rationale:'《滴天髓阐微》分别使用“财星滋杀／财星党杀”“食神制杀／制杀扶身”“印绶化杀／杀印相生”等语句，足以把增强、制衡、承接转化拆成不同 relation semantics；但不足以建立统一 cross-actor party resolver。',
        boundary:'Source Audit resolved 只表示关系类型与错误等价已澄清；不得把 opposition 或 mediation 写成 affiliation，也不得因此解除 generic expansion blocker。'
    });

    const makeDependency = ({ id, scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind:'aggregation',
        scope,
        status,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(EVIDENCE.map((item) => item.id)),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        ruleId:RULE_ID,
        statement,
        boundary
    });

    const buildTaxonomyDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-RELATION-TAXONOMY',
        scope:'contextual-force-party-cross-actor-relation-taxonomy',
        status:'resolved',
        statement:'Affiliation Expansion v0.2 已把来源支持的 cross-actor 关系拆为 anchor-augmentation、anchor-opposition、anchor-mediation 三类。',
        boundary:'Taxonomy resolved 不代表三类都有执行 resolver；当前只有既有“财生官杀” augmentation motif 有窄义 affiliation execution。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-MODEL'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-AFFILIATION-EXPANSION-SOURCE-AUDIT']
    });

    const rebuildGenericExpansion = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION',
            status:'unresolved',
            ruleId:RULE_ID,
            sourceRegistryEvidenceIds:freezeArray(EVIDENCE.map((item) => item.id)),
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-RELATION-TAXONOMY'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'来源审计已证明 cross-actor 关系不能统一压成 affiliation：财滋杀／党杀属于 anchor augmentation，可在严格条件下支持 affiliation；食神制杀属于 anchor opposition；印绶化杀／杀印相生属于 mediation。generic expansion 因此仍未定义。',
            boundary:'不得用“制衡对方=加入我方”“经印化杀=杀改投我方”或传递闭包补齐未定义 resolver。'
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
                'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-RELATION-TAXONOMY',
                'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'关系类型已经分清，但 augmentation、opposition、mediation 对 side-relative force 的定性影响尚未形成完整 resolver；relative dominance 继续阻断。',
            boundary:'不能把“扶身”“制杀”“化杀”的出现次数、多数或文字强弱直接换算成一侧占优。'
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
                'SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-RELATION-TAXONOMY',
                'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            automaticClassifier:null,
            statement:'Party relation taxonomy 已澄清，但 generic expansion 与 relative dominance 未完成，因此仍不得生成党盛／党众／势孤／得势／失势。',
            boundary:'关系语义澄清不是 Party Configuration 结果。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyAffiliationView) return base;
        const audit = buildAudit();
        const auditClaim = makeAuditClaim(audit);
        const claims = Object.freeze([...(base.claims || []), auditClaim]);
        const taxonomyDependency = buildTaxonomyDependency();
        const genericExpansion = rebuildGenericExpansion(base);
        const relativeDominance = rebuildRelativeDominance(base);
        const partyRule = rebuildPartyRule(base);
        const replacedIds = new Set([
            taxonomyDependency.id,
            genericExpansion.id,
            relativeDominance.id,
            partyRule.id
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            taxonomyDependency,
            genericExpansion,
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
            contextualForcePartyAffiliationExpansionSourceAudit:audit,
            contextualForcePartyAffiliationExpansionSourceContract:CONTRACT,
            contextualForcePartyAffiliationExpansionSourceFindings:FINDINGS,
            contextualForcePartyAffiliationExpansionAuditRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Affiliation Expansion v0.2 将 cross-actor 关系先分为 anchor augmentation / opposition / mediation，不再把所有关系压成 affiliation。',
                '“财星滋杀／党杀”可支持具体 anchor augmentation affiliation；仍要求既有 target-specific source-context realized edge。',
                '“食神制杀／制杀扶身”只授权 opposition 与可能的扶身 outcome，不授权日主侧 membership。',
                '“印绶化杀／杀印相生”保留 mediation 与官杀→印的生化方向，不授权 party switch 或反向 edge。',
                'Taxonomy 完成仍不解除 generic affiliation、relative dominance、Party Configuration、many/few、capacity 与 final Assessment blocker。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyAffiliationExpansionSourceAudit:buildAudit
    });

    GuiJia.baziContextualForcePartyAffiliationExpansionAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RELATION_TYPES,
        EVIDENCE,
        FINDINGS,
        CONTRACT,
        buildAudit,
        buildTaxonomyDependency,
        rebuildGenericExpansion,
        rebuildRelativeDominance,
        rebuildPartyRule,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
