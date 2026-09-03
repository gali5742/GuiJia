(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyBranchSubstrateQualityAudit?.installed) return;

    // Research bootstrap prerequisite: ./js/bazi-contextual-force-party-branch-substrate-quality-source.js?v=13.44.0
    // Research bootstrap dependency: ./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js?v=13.44.0

    const sourceApi = GuiJia.baziContextualForcePartyBranchSubstrateQualitySource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, EVIDENCE, INPUT_FAMILIES, FINDINGS, CONTRACT } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const sourceEvidenceIds = freezeArray(EVIDENCE.map((item) => item.id));
    const findingMap = Object.freeze(Object.fromEntries(FINDINGS.map((item) => [item.key, item])));
    const inputFamilyMap = Object.freeze(Object.fromEntries(INPUT_FAMILIES.map((item) => [item.key, item])));

    const buildBranchCandidateRecords = (synthesis = {}) => {
        const nonStemAudit = synthesis.contextualForcePartyNonStemFoundationSourceAudit || null;
        const branchRecords = nonStemAudit?.surfaceBranchRecords || [];
        return freezeArray(branchRecords.map((record, index) => Object.freeze({
            id:`CF-BSQ-BRANCH-${index}`,
            actorKey:record.actorKey || null,
            sideId:record.sideId || null,
            zhi:record.zhi || null,
            wuxing:record.wuxing || null,
            positions:freezeArray(record.positions || []),
            substrateRole:record.semanticRole || 'foundation-substrate',
            qualityScope:'target-contextual-foundation-substrate-quality',
            inputFamilyKeys:freezeArray(INPUT_FAMILIES.map((item) => item.key)),
            coveringStemContext:Object.freeze({
                required:true,
                sourceSupported:true,
                resolvedToQuality:false,
                crossActorRelationEffectRequired:true
            }),
            branchInteractionContext:Object.freeze({
                required:true,
                sourceSupported:true,
                resolvedToQuality:false,
                relationCountAllowed:false
            }),
            seasonalContext:Object.freeze({
                required:true,
                sourceSupported:true,
                resolvedToQuality:false,
                singleAxisMappingAllowed:false
            }),
            branchNetworkPartyContext:Object.freeze({
                required:true,
                sourceSupported:true,
                resolvedToQuality:false,
                partyMemberCountAllowed:false,
                relativeDominanceRequired:true
            }),
            positionalRoleContext:Object.freeze({
                required:true,
                sourceSupported:true,
                preserved:true,
                numericPositionWeight:null
            }),
            directedCapacityContext:Object.freeze({
                required:true,
                sourceSupported:true,
                resolvedToQuality:false,
                crossActorRelationEffectGeneralizationRequired:true
            }),
            substrateQuality:null,
            qualitativeComparison:null,
            numericScore:null,
            scalarQuality:null,
            resolverStatus:'unresolved-multi-context-comparison-rule',
            boundary:'候选输入族已由来源审计冻结，但没有跨轴优先级/补偿规则；不得从任一单轴或数量直接生成 substrate quality。'
        })));
    };

    const buildAudit = (synthesis = {}) => {
        const branchCandidates = buildBranchCandidateRecords(synthesis);
        return Object.freeze({
            id:'CF-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:'source-audited-input-model-resolved-quality-resolver-unresolved',
            semanticShape:'target-contextual-multi-context-branch-substrate-quality',
            sourceEvidenceIds,
            findings:findingMap,
            inputFamilies:INPUT_FAMILIES,
            inputFamilyMap,
            branchCandidates,
            branchActorKeys:freezeArray(unique(branchCandidates.map((item) => item.actorKey))),
            sourceInputFamilyModelResolved:true,
            targetContextModelResolved:true,
            automaticQualityResolver:null,
            crossAxisPriorityRule:null,
            compensationRule:null,
            positionWeightRule:null,
            qualityClassification:null,
            numericScore:null,
            scalarQuality:null
        });
    };

    const makeClaim = ({ id, claimKey, status = 'resolved', value, rationale, boundary }) => Object.freeze({
        id,
        claimKey,
        status,
        ruleId:RULE_ID,
        value:Object.freeze(value),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale,
        boundary
    });

    const buildClaims = (audit = {}) => Object.freeze([
        makeClaim({
            id:'SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT',
            claimKey:'strength.contextual-force.party.branch-substrate-quality.source-audit',
            value:{
                semanticShape:'target-contextual-multi-context-branch-substrate-quality',
                inputFamilyCount:INPUT_FAMILIES.length,
                sourceInputFamilyModelResolved:true,
                automaticQualityResolverDefined:false,
                universalCrossAxisPriorityDefined:false,
                universalCompensationRuleDefined:false
            },
            rationale:'《玉井奥诀》同时要求考察宅舍/基业轻重、刑冲破害/冲拱刑合、月气与生旺休废、地支统摄和五气轻重；《滴天髓阐微》又要求地支看覆干及其生扶克制。来源足以冻结多上下文输入模型，但没有统一跨轴算法。',
            boundary:'Source Audit resolved 只表示输入语义和禁止项明确；不表示 substrate quality、relative dominance 或 side force comparison 已解析。'
        }),
        makeClaim({
            id:'SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-TARGET-CONTEXT-MODEL',
            claimKey:'strength.contextual-force.party.branch-substrate-quality.target-context-model',
            value:{
                targetContextual:true,
                branchGlobalQualityState:false,
                anchorOrUseTargetRequired:true,
                positionRolePreserved:true
            },
            rationale:'来源以“主干之宅舍”“用神之基业”及喜忌对象分别论地支，说明质量只能针对 anchor/use-target 解释，不能给地支 actor 一个脱离对象的全局 quality state。',
            boundary:'target-contextual 不等于吉凶判断，也不授权把某一 source phrase 扩成通用 effective/ineffective。'
        }),
        makeClaim({
            id:'SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-FAMILY-MODEL',
            claimKey:'strength.contextual-force.party.branch-substrate-quality.input-family-model',
            value:{
                inputFamilyKeys:freezeArray(INPUT_FAMILIES.map((item) => item.key)),
                branchPresenceIsQuality:false,
                seasonalStateAloneResolvesQuality:false,
                relationCountResolvesQuality:false,
                partyMemberCountResolvesQuality:false,
                positionWeightDefined:false
            },
            rationale:'来源明确要求多项上下文“参较”，并说“生旺休废，交差不一，难下手脚”，因此单轴、计数、固定位置权重均不足以承担 quality resolver。',
            boundary:'Input Family Model 只保存 required semantic families，不做 score、priority list、majority 或 last-write-wins。'
        })
    ]);

    const makeDependency = ({ id, scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind:'aggregation',
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildAuditDependencies = (audit = {}) => Object.freeze([
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT',
            scope:'surface-branch-substrate-quality-source-audit',
            status:'resolved',
            statement:'Branch Substrate Quality Source Audit v0.1 已冻结 target-contextual、多上下文输入模型与禁止单轴/计数映射边界。',
            boundary:'Source Audit resolved 不等于 automatic quality resolver exists。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-TARGET-CONTEXT-MODEL',
            scope:'surface-branch-substrate-quality-target-context-model',
            status:'resolved',
            statement:'Substrate quality 被限定为 anchor/use-target-specific 语义，不生成 branch-global quality state。',
            boundary:'Target context model 不提供吉凶或强弱结论。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-TARGET-CONTEXT-MODEL']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-FAMILY-MODEL',
            scope:'surface-branch-substrate-quality-input-family-model',
            status:'resolved',
            statement:`来源支持 ${INPUT_FAMILIES.length} 类 required semantic input family；模型已冻结，但 concrete input coverage 与跨轴比较尚未解决。`,
            boundary:'Input family model 不能把潜在关系当已兑现关系。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-FAMILY-MODEL']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-CROSS-AXIS-COMPARISON-RULE',
            scope:'surface-branch-substrate-quality-cross-axis-comparison-rule',
            status:(audit.branchCandidates || []).length ? 'unresolved' : 'resolved',
            statement:(audit.branchCandidates || []).length
                ? '覆干、支间交互、季节/生旺休废、党势/统摄、位置与定向作用能力之间没有来源授权的通用优先级或补偿算法。'
                : '当前无 surface-branch counter anchor，cross-axis comparison 对本盘 not-applicable。',
            boundary:'不得用 score、priority list、majority、relation count、party count 或 last-write-wins 填补。',
            dependsOnDependencyIds:[
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-FAMILY-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'
            ]
        })
    ]);

    const rebuildSubstrateQualityResolver = (base = {}, audit = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER') || {};
        const hasBranch = (audit.branchCandidates || []).length > 0;
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER',
            status:hasBranch ? 'unresolved' : 'resolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT',
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-TARGET-CONTEXT-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-FAMILY-MODEL',
                ...(hasBranch ? ['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-CROSS-AXIS-COMPARISON-RULE'] : [])
            ])),
            resolvedByClaimIds:hasBranch ? Object.freeze([]) : freezeArray(current.resolvedByClaimIds || []),
            statement:hasBranch
                ? `当前 ${audit.branchCandidates.length} 个 surface-branch counter anchor 的 substrate role 与 required input families 已明确，但 cross-axis comparison rule 未建立，因此 substrate quality 继续 unresolved。`
                : '当前没有 surface-branch counter anchor，substrate quality 对本盘 not-applicable。',
            boundary:'不得从 branch presence、单一旺衰状态、关系数量、党成员数量或固定位置权重直接分类。'
        });
    };

    const rebuildFoundationCoverage = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE');
        if (!current) return null;
        return Object.freeze({
            ...current,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT',
                'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Branch substrate quality 的来源输入模型已解析，但 automatic quality resolver 仍未建立；hidden manifestation 也继续独立 unresolved，因此 foundation coverage 保持 unresolved。',
            boundary:'Source audit 不得被当作 concrete foundation coverage。'
        });
    };

    const rebuildSideForceProfile = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE');
        if (!current) return null;
        return Object.freeze({
            ...current,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT',
                'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Side Force Profile 已获得 branch substrate quality 的 source-audited input model，但 concrete substrate quality、hidden manifestation 与 relation-effect generalization 仍未齐全。',
            boundary:'Input model resolved 不等于 side profile comparison-ready。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyNonStemFoundationSourceAudit) return base;
        const audit = buildAudit(base);
        const claims = buildClaims(audit);
        const auditDependencies = buildAuditDependencies(audit);
        const substrateQualityResolver = rebuildSubstrateQualityResolver(base, audit);
        const foundationCoverage = rebuildFoundationCoverage(base);
        const sideForceProfile = rebuildSideForceProfile(base);
        const replacedClaimIds = new Set(claims.map((item) => item.id));
        const replacedDependencyIds = new Set([
            ...auditDependencies.map((item) => item.id),
            substrateQualityResolver.id,
            ...(foundationCoverage ? [foundationCoverage.id] : []),
            ...(sideForceProfile ? [sideForceProfile.id] : [])
        ]);
        const nextClaims = Object.freeze([...(base.claims || []).filter((item) => !replacedClaimIds.has(item.id)), ...claims]);
        const nextDependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            ...auditDependencies,
            substrateQualityResolver,
            ...(foundationCoverage ? [foundationCoverage] : []),
            ...(sideForceProfile ? [sideForceProfile] : [])
        ]);
        const conflicts = typeof priorSynthesisApi.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(nextClaims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies:nextDependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;
        return Object.freeze({
            ...base,
            claims:nextClaims,
            dependencies:nextDependencies,
            conflicts,
            contextualForcePartyBranchSubstrateQualitySourceAudit:audit,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Branch Substrate Quality Source Audit v0.1 将质量限定为 target-contextual、多上下文语义，不生成 branch-global strong/weak state。',
                '来源输入族包括覆干、支间交互、季节/生旺休废、地支统摄/党势、位置角色与定向作用能力；这些输入不得折成统一分数。',
                '《玉井奥诀》“生旺休废，交差不一，难下手脚”禁止用单轴、关系数量或党成员数量直接代替 substrate quality。',
                '当前 cross-axis comparison rule 未建立，Surface Branch Substrate Quality Resolver 继续 unresolved。',
                'Hidden Manifestation、Relation Effect Generalization、Relative Dominance、Party Configuration、Qianli many/few、Strength Synthesis 与 Assessment 均继续独立关闭。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyBranchSubstrateQualitySourceAudit:buildAudit
    });

    GuiJia.baziContextualForcePartyBranchSubstrateQualityAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        sourceApi,
        buildBranchCandidateRecords,
        buildAudit,
        buildClaims,
        buildAuditDependencies,
        rebuildSubstrateQualityResolver,
        rebuildFoundationCoverage,
        rebuildSideForceProfile,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
