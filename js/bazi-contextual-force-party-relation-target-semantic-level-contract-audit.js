(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource) {
        document.write('<script src="./js/bazi-contextual-force-party-relation-target-semantic-level-contract-source.js?v=13.44.0"><\\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const {
        VERSION,
        RULE_ID,
        TARGET_SEMANTIC_LEVELS,
        SOURCE_CONTEXT_TYPES,
        PREDICATE_TYPES,
        RESOLUTION_STATES,
        EVIDENCE_DIMENSIONS,
        LEVEL_GATE_CONTRACTS,
        AUDIT_CASES,
        FINDINGS,
        CONTRACT
    } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const sourceEvidenceIds = freezeArray(AUDIT_CASES.map((item) => item.id));

    const buildAudit = () => {
        const mixedCases = AUDIT_CASES.filter((item) => item.mixedSemanticStatement === true);
        const lexicalShortcutCounterexamples = AUDIT_CASES.filter((item) => item.lexicalShortcutRejected === true || item.bindingResolved === false || item.expectedTargetLevel === null);
        const chartActorSetCases = AUDIT_CASES.filter((item) => item.expectedTargetLevel === TARGET_SEMANTIC_LEVELS.ACTOR_SET && item.sourceContextType === SOURCE_CONTEXT_TYPES.CHART_CASE);
        const singularButUnboundCases = AUDIT_CASES.filter((item) => item.expectedTargetLevel === TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR && item.bindingResolved === false);
        return Object.freeze({
            id:'CF-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-CONTRACT-AUDIT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:'source-contract-audited-target-level-resolver-unresolved',
            sourceContract:CONTRACT,
            targetSemanticLevels:TARGET_SEMANTIC_LEVELS,
            sourceContextTypes:SOURCE_CONTEXT_TYPES,
            predicateTypes:PREDICATE_TYPES,
            resolutionStates:RESOLUTION_STATES,
            evidenceDimensions:EVIDENCE_DIMENSIONS,
            levelGateContracts:LEVEL_GATE_CONTRACTS,
            auditCases:AUDIT_CASES,
            mixedStatementCaseIds:freezeArray(mixedCases.map((item) => item.id)),
            lexicalShortcutCounterexampleIds:freezeArray(lexicalShortcutCounterexamples.map((item) => item.id)),
            chartActorSetCaseIds:freezeArray(chartActorSetCases.map((item) => item.id)),
            singularButUnboundCaseIds:freezeArray(singularButUnboundCases.map((item) => item.id)),
            resolverUnitIsRelationTargetSpan:true,
            sentenceLevelSingleLabelRejected:true,
            lexicalMarkerOnlyResolverRejected:true,
            sourceContextRequired:true,
            predicateTypeRequired:true,
            mixedStatementSpanSegmentationRequired:true,
            unresolvedOutcomeSupported:true,
            targetSemanticLevelResolverDefined:false,
            relationTargetSpanResolverDefined:false,
            sourceContextClassifierDefined:false,
            predicateTypeClassifierDefined:false,
            chartLocalTargetCandidateBinderDefined:false,
            cardinalityScopeBinderDefined:false,
            mixedStatementSegmenterDefined:false,
            actorGroupIdentityContractDefined:false,
            collectiveRelationEffectExecutionDefined:false,
            relativeDominance:null,
            actorGlobalEffectiveness:null,
            numericScore:null,
            scalarForce:null,
            sourceEvidenceIds,
            findings:FINDINGS
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT',
        claimKey:'strength.contextual-force.party.relation-target.semantic-level-resolver.source-contract-audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            resolverUnitIsRelationTargetSpan:audit.resolverUnitIsRelationTargetSpan,
            sentenceLevelSingleLabelRejected:audit.sentenceLevelSingleLabelRejected,
            lexicalMarkerOnlyResolverRejected:audit.lexicalMarkerOnlyResolverRejected,
            sourceContextRequired:audit.sourceContextRequired,
            predicateTypeRequired:audit.predicateTypeRequired,
            mixedStatementSpanSegmentationRequired:audit.mixedStatementSpanSegmentationRequired,
            unresolvedOutcomeSupported:audit.unresolvedOutcomeSupported
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'《滴天髓阐微·官杀》中的“一杀而食伤并见，制杀太过，官助之”证明单数词可以出现在 theory-general role-class 规则中；“杀重身轻，财星党杀”与“身杀两停，则以食神制杀”又证明 configuration 条件和 relation target 可以共处同一句。故 target-level resolver 必须以 relation-target span 为单位，并联合 predicate/source context 与实例层的 chart binding provenance。',
        boundary:'本 claim 只冻结 resolver 所需证据合同和拒绝项；并未实现 target span parser、predicate classifier、source-context classifier、actor binder、cardinality/scope binder 或最终四层 resolver。'
    });

    const makeDependency = ({ id, kind = 'semantic-model', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
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

    const buildSourceContractAuditDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT',
        kind:'source-audit',
        scope:'relation-target-semantic-level-resolver-evidence-contract',
        status:'resolved',
        statement:'Target-level resolver 的来源合同已明确：解析单位是 relation-target span；必须联合 source context 与 predicate type；实例层还需要 chart-local candidate/cardinality/scope provenance；证据不足允许 unresolved。',
        boundary:'Source contract resolved 不等于任何机器 parser/classifier/binder/resolver 已实现。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-TARGET-SEMANTICS-SOURCE-AUDIT'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT']
    });

    const buildTargetSpanIdentityDependency = (sourceContractDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SPAN-IDENTITY',
        scope:'relation-clause-target-span-identification',
        status:'unresolved',
        statement:'程序尚未定义如何从理论句或命例评语中识别真正承接 relation predicate 的 target span，并与同句 configuration/context span 分离。',
        boundary:'不得把整句当成一个 target，也不得看到“杀”字就把所有出现位置合并成同一 target span。',
        dependsOnDependencyIds:[sourceContractDependency.id]
    });

    const buildSourceContextClassificationDependency = (sourceContractDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SOURCE-CONTEXT-CLASSIFICATION',
        scope:'theory-general-vs-chart-case-vs-mixed-commentary-context',
        status:'unresolved',
        statement:'程序尚未定义 source statement 属于 theory-general、chart-case 还是 mixed commentary 的稳定 machine provenance。',
        boundary:'不能仅凭是否出现四柱文字或“此造”二字猜 context；context 必须来自可追踪 source record / case provenance。',
        dependsOnDependencyIds:[sourceContractDependency.id]
    });

    const buildPredicateTypeClassificationDependency = (sourceContractDependency = {}, targetSpanDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-PREDICATE-TYPE-CLASSIFICATION',
        scope:'relation-event-vs-generalized-rule-vs-configuration-state-vs-instance-description',
        status:'unresolved',
        statement:'程序尚未定义 relation-event、generalized relation rule、configuration-state 与 instance-description 的 predicate classifier。',
        boundary:'“制杀”可以出现在 generalized rule 与 chart case event 中；“独杀／众杀”也可能只是 instance description。不得用单一动词或数量词直接决定 predicate type。',
        dependsOnDependencyIds:[sourceContractDependency.id,targetSpanDependency.id]
    });

    const buildMixedStatementSegmentationDependency = (targetSpanDependency = {}, predicateTypeDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-MIXED-STATEMENT-SPAN-SEGMENTATION',
        scope:'mixed-configuration-condition-and-relation-target-segmentation',
        status:'unresolved',
        statement:'“杀重身轻，财星党杀”“身杀两停，则以食神制杀”等 mixed statement 尚无 machine span segmentation，无法稳定区分 configuration context 与 relation target。',
        boundary:'不得强迫一个完整 sentence 只输出一个 semantic level；应允许多个语义 span 与一个 relation target span 并存。',
        dependsOnDependencyIds:[targetSpanDependency.id,predicateTypeDependency.id]
    });

    const buildChartLocalCandidateBindingDependency = (sourceContextDependency = {}, targetSpanDependency = {}, predicateTypeDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING',
        scope:'chart-case-role-instance-candidate-to-stable-actor-identity',
        status:'unresolved',
        statement:'Single actor / actor set 层尚未定义如何把 target role/span 与当前 chart 的 visible、surface-branch、hidden/root actor inventory 稳定绑定。',
        boundary:'“独杀”不等于 visible actor；同十神、同五行、同干也不能自动成为候选或 group member。',
        dependsOnDependencyIds:[sourceContextDependency.id,targetSpanDependency.id,predicateTypeDependency.id]
    });

    const buildCardinalityScopeBindingDependency = (candidateBindingDependency = {}, mixedSegmentationDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-CARDINALITY-SCOPE-BINDING',
        scope:'relation-target-cardinality-membership-completeness-and-scope-provenance',
        status:'unresolved',
        statement:'Actor set 尚未定义来源数量/collective 语义与 chart candidate cardinality、membership completeness、visible/hidden scope 的一致性检查。',
        boundary:'“两杀”只有在来源数量与候选集合、scope 都对齐时才能支持有限 actor set；“皆／四柱皆”也不能自动扩张到所有同类 hidden instance。',
        dependsOnDependencyIds:[candidateBindingDependency.id,mixedSegmentationDependency.id]
    });

    const rebuildTargetLevelResolverDependency = (base = {}, dependencies = []) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                ...dependencies.map((item) => item.id)
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Target-level 来源合同已经明确，但机器 resolver 仍未实现：必须先识别 relation-target span、source context、predicate type，完成 mixed span segmentation，并在实例层建立 chart-local candidate/cardinality/scope binding，之后才可输出 single actor / actor set / role class / configuration。',
            boundary:'不得用 lexical keyword、sentence-level 单标签、十神同类自动 grouping 或缺省四选一替代上述 provenance gates；证据不足必须允许 unresolved。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyCollectiveTargetSemanticsSourceAudit) return base;
        const audit = buildAudit();
        const claim = makeClaim(audit);
        const sourceContractDependency = buildSourceContractAuditDependency();
        const targetSpanDependency = buildTargetSpanIdentityDependency(sourceContractDependency);
        const sourceContextDependency = buildSourceContextClassificationDependency(sourceContractDependency);
        const predicateTypeDependency = buildPredicateTypeClassificationDependency(sourceContractDependency, targetSpanDependency);
        const mixedSegmentationDependency = buildMixedStatementSegmentationDependency(targetSpanDependency, predicateTypeDependency);
        const candidateBindingDependency = buildChartLocalCandidateBindingDependency(sourceContextDependency, targetSpanDependency, predicateTypeDependency);
        const cardinalityScopeDependency = buildCardinalityScopeBindingDependency(candidateBindingDependency, mixedSegmentationDependency);
        const targetLevelResolverDependency = rebuildTargetLevelResolverDependency(base, [
            sourceContractDependency,
            targetSpanDependency,
            sourceContextDependency,
            predicateTypeDependency,
            mixedSegmentationDependency,
            candidateBindingDependency,
            cardinalityScopeDependency
        ]);

        const replacedDependencyIds = new Set([
            sourceContractDependency.id,
            targetSpanDependency.id,
            sourceContextDependency.id,
            predicateTypeDependency.id,
            mixedSegmentationDependency.id,
            candidateBindingDependency.id,
            cardinalityScopeDependency.id,
            targetLevelResolverDependency.id
        ]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            sourceContractDependency,
            targetSpanDependency,
            sourceContextDependency,
            predicateTypeDependency,
            mixedSegmentationDependency,
            candidateBindingDependency,
            cardinalityScopeDependency,
            targetLevelResolverDependency
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
            contextualForcePartyRelationTargetSemanticLevelContractSourceAudit:audit,
            contextualForcePartyRelationTargetSemanticLevelContractRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Relation Target Semantic Level Resolver Source / Contract Audit v0.1 已冻结：resolver unit 是 relation-target span，不是完整 sentence。',
                '“一／独／两／众／皆／重／势／局”等 lexical marker 只能提供证据，不能直接决定 target level；理论句中的“一杀”仍可能是 role-class。',
                'Mixed statement 可以同时含 configuration condition 与 role-class/actor-set relation target，必须先分 span，禁止 sentence-level 单标签。',
                'Single actor / actor set 只有在 chart-local candidate、cardinality 与 scope provenance 完整时才可能执行；hidden/branch singular target 不能被 visible-only shortcut 吞平。',
                '证据不足允许 unresolved；本层不创建实际 target-level resolver、不创建 actor group、不修改 realization registry，也不产生 score/weight/threshold/ranking/final strength。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyRelationTargetSemanticLevelContractAudit:buildAudit
    });

    GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        sourceApi,
        buildAudit,
        buildSourceContractAuditDependency,
        buildTargetSpanIdentityDependency,
        buildSourceContextClassificationDependency,
        buildPredicateTypeClassificationDependency,
        buildMixedStatementSegmentationDependency,
        buildChartLocalCandidateBindingDependency,
        buildCardinalityScopeBindingDependency,
        rebuildTargetLevelResolverDependency,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
