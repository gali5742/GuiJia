(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartySource) {
        document.write('<script src="./js/bazi-contextual-force-party-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartySource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-AUDIT-001';
    const { SOURCES, EVIDENCE, FINDINGS, CONTRACT } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const buildAuditView = (synthesis = {}) => Object.freeze({
        status:'source-audit-resolved-executable-party-rule-open',
        semanticModelCandidate:CONTRACT.semanticModelCandidate,
        semanticDirectionStatus:'resolved-research-level',
        sourceIds:freezeArray(Object.values(SOURCES).map((item) => item.id)),
        evidenceIds:freezeArray(EVIDENCE.map((item) => item.id)),
        findingIds:freezeArray(FINDINGS.map((item) => item.id)),
        contextualForceProfileCoverageStatus:(synthesis.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE')?.status || null,
        distinctions:Object.freeze({
            seasonalStandingVersusParty:'separate-but-interacting',
            deShiVersusParty:'not-equivalent',
            partyVersusRawCount:'rejected-equivalence',
            shiGuVersusFewAllies:'rejected-equivalence',
            partySideScope:'side-relative',
            xuCommentaryProvenance:'later-commentary-only'
        }),
        unresolvedResolvers:Object.freeze([
            'party-membership-resolver',
            'party-relative-dominance-resolver'
        ]),
        partyMembership:null,
        relativeDominance:null,
        partyConfiguration:null,
        deShiInterpretation:null,
        manyFewClassification:null,
        strengthClassification:null,
        numericValue:null,
        scalarPartyScore:null,
        boundary:'Source Audit 只把党势语义收敛为 side-relative qualitative configuration；不得由证据候选数、五行数量、季节状态或单一原句直接生成党盛／势孤／得势／失势。'
    });

    const makeAuditClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-AUDIT',
        claimKey:'strength.contextual-force.party.source-audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            sourceCount:Object.keys(SOURCES).length,
            evidenceCount:EVIDENCE.length,
            findingCount:FINDINGS.length,
            semanticModelCandidate:CONTRACT.semanticModelCandidate,
            partySeparateFromSeasonalStanding:true,
            partySeparateFromDeShi:true,
            partyNotRawCount:true,
            sideRelative:true,
            xuCommentaryKeptAsLaterCommentary:true,
            executablePartyRuleDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(EVIDENCE.map((item) => item.id)),
        rationale:'《命理约言》把得时／失时与得势／失势并列，并以党多援众、势孤克众说明全局扶抑可改变季节背景；《玉井奥诀》以“党盛为强”并要求比较宅舍、基业、轻重及冲拱刑合；《滴天髓·众寡》进一步把众寡写成双方相对关系。',
        boundary:'Audit resolved 只确认来源语义结构，不确认任一命盘的党盛、势孤、得势、失势，也不授权 numeric party score。'
    });

    const makeSemanticClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-SEMANTIC-MODEL',
        claimKey:'strength.contextual-force.party.semantic-model',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            semanticModel:'side-relative-qualitative-party-configuration',
            timeAxisSeparate:true,
            opposingSideRequired:true,
            rootFoundationContextRequired:true,
            alliedSupportContextRequired:true,
            interactionContextRequired:true,
            visibleHiddenContextMayMatter:true,
            rawCountClassifier:false,
            membershipResolverDefined:false,
            relativeDominanceResolverDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray([
            'CF-PARTY-E01','CF-PARTY-E02','CF-PARTY-E04','CF-PARTY-E05','CF-PARTY-E08','CF-PARTY-E09','CF-PARTY-E10'
        ]),
        rationale:'跨来源的共同最小语义不是“有几个同党”，而是某一观察侧在根基、生扶、对抗、位置与交互条件下，相对于另一侧形成何种定性配置。',
        boundary:'Semantic model resolved-research-level 不等于 party membership 或 relative dominance 已有可执行 resolver。'
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

    const buildAuditDependencies = () => Object.freeze([
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-AUDIT',
            scope:'contextual-force-party-source-audit',
            status:'resolved',
            statement:'Party Configuration 第一轮来源审计已完成，并区分原典、编纂注文、任氏阐释与徐乐吾后注。',
            boundary:'来源审计完成不等于自动 party classifier 已定义。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-SOURCE-AUDIT']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-SEMANTIC-MODEL',
            scope:'contextual-force-party-semantic-model',
            status:'resolved',
            statement:'党势的共同最小语义已收敛为 side-relative qualitative party configuration，而非季节状态、同党条数或全局五行计数。',
            boundary:'research-level semantic model resolved 不授权具体党盛／势孤／得势／失势结果。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-AUDIT'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-SEMANTIC-MODEL']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-RESOLVER',
            scope:'contextual-force-party-membership-resolver',
            status:'unresolved',
            statement:'尚未定义不同观察侧的 party member 如何从根基、比印扶助、明暗支干与具体 function relation 中被纳入，并处理同一 actor 的多重语义。',
            boundary:'不得直接把比劫＋印＋根＋同五行支全部并入一个集合，更不得按 item count 判党众。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-SEMANTIC-MODEL','SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER',
            scope:'contextual-force-party-relative-dominance-resolver',
            status:'unresolved',
            statement:'尚未定义如何在两侧或多侧 party configuration 之间，依据根基质量、已兑现扶抑、对抗与 interaction modifier 形成非数值的相对优势／孤立关系。',
            boundary:'不得以成员多数、候选数量、月令单轴或固定优先级替代 relative dominance。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-RESOLVER']
        })
    ]);

    const rebuildPartyRule = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-SEMANTIC-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-RESOLVER',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            semanticModel:'side-relative-qualitative-party-configuration',
            automaticClassifier:null,
            statement:'来源语义模型已明确，但 party membership 与 relative dominance 两个执行 resolver 尚未定义，因此 Party Configuration Rule 继续 unresolved。',
            boundary:'不能用徐乐吾后注的“党众为强”直接替代跨来源 resolver，也不能从 profile coverage resolved 越级生成党盛／势孤／得势／失势。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const auditView = buildAuditView(base);
        const claims = Object.freeze([...(base.claims || []), makeAuditClaim(), makeSemanticClaim()]);
        const auditDependencies = buildAuditDependencies();
        const partyRule = rebuildPartyRule(base);
        const replacedIds = new Set([
            ...auditDependencies.map((item) => item.id),
            'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...auditDependencies,
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
            contextualForcePartySources:SOURCES,
            contextualForcePartyEvidence:EVIDENCE,
            contextualForcePartyFindings:FINDINGS,
            contextualForcePartyContract:CONTRACT,
            contextualForcePartyAuditView:auditView,
            contextualForcePartyAuditRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Party Source Audit v0.1 将“得时／失时”与“得势／失势”明确分层，并拒绝把党势等同于季节状态。',
                '“党盛”“党多援众”“党众”“势孤”“众寡”保留各自来源语境，不先压成一个统一布尔枚举。',
                'Party Configuration 的研究级语义模型是 side-relative qualitative configuration；membership 与 relative dominance 仍分别缺 resolver。',
                '徐乐吾“得时为旺、党众为强”只登记为 later commentary，不回写成沈孝瞻原文或古典统一规则。',
                'Party Source Audit 不生成 party score、党盛／势孤结果、many/few、capacity 或最终 strong/weak。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartySourceAuditView:buildAuditView
    });

    GuiJia.baziContextualForcePartyAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCES,
        EVIDENCE,
        FINDINGS,
        CONTRACT,
        buildAuditView,
        buildAuditDependencies,
        rebuildPartyRule,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
