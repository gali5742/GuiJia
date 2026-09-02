(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource) {
        document.write('<script src="./js/bazi-contextual-force-party-visible-edge-effect-type-authorization-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, EVIDENCE, FINDINGS } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const sourceEvidenceIds = freezeArray(EVIDENCE.map((item) => item.id));

    const relationEffectRecordsForEdge = (synthesis = {}, edgeId = '') =>
        freezeArray((synthesis.contextualForcePartyRelationEffectView?.records || []).filter((item) =>
            item.relationRecordId === edgeId || item.sourceIdentityId === edgeId
        ));

    const classifyEdge = (edge = {}, synthesis = {}, index = 0) => {
        const effectRecords = relationEffectRecordsForEdge(synthesis, edge.id);
        const effectTypes = freezeArray(unique(effectRecords.map((item) => item.relationType)));
        const motifIds = freezeArray(unique(effectRecords.map((item) => item.motifId)));
        const realized = edge.realizationState === 'realized-in-source-context';
        const notRealized = edge.realizationState === 'not-realized-in-source-context';
        const state = realized
            ? effectRecords.length
                ? 'realized-authorized-known-motif'
                : 'realized-no-current-effect-type-authorization'
            : notRealized
                ? 'not-realized-effect-not-activated'
                : 'realization-unresolved-effect-type-not-actionable';
        return Object.freeze({
            id:`CF-VEA-R${String(index + 1).padStart(2, '0')}`,
            edgeId:edge.id || null,
            sourcePatternId:edge.sourcePatternId || null,
            sourceActorKey:edge.sourceActorKey || null,
            targetActorKey:edge.targetActorKey || null,
            functionType:edge.functionType || null,
            realizationState:edge.realizationState || null,
            authorizationState:state,
            mappedEffectTypes:effectTypes,
            matchedMotifIds:motifIds,
            sourceBackedEffectRecordIds:freezeArray(effectRecords.map((item) => item.id)),
            effectTypeAuthorized:realized && effectRecords.length > 0,
            currentRegistryNoMatchIsSemanticRejection:false,
            actorGlobalEffectiveness:null,
            relativeDominance:null,
            numericWeight:null,
            statement:state === 'realized-authorized-known-motif'
                ? '该 cross-visible edge 已兑现，且命中现有 source-backed Party motif；这里只确认对应 relation-effect type 的授权。'
                : state === 'realized-no-current-effect-type-authorization'
                    ? '该 cross-visible edge 已兑现，但当前 Party source registry 没有为这一 role/function pattern 授权 effect type；保持 realized-but-unmapped。'
                    : state === 'not-realized-effect-not-activated'
                        ? '该 edge 已明确未兑现；无论 motif shape 是否可能匹配，本局都不激活正向 relation effect，也不生成反向 effect。'
                        : '该 edge 的 realization 尚未解析，因此 effect-type 层当前不可执行。',
            boundary:'“当前 registry 未授权”不是“传统上永远无此作用”；不得用 generation/restraint shape、十神角色、计数或常识自动补 effect type。'
        });
    };

    const buildAudit = (synthesis = {}) => {
        const crossVisibleEdges = (synthesis.visibleStemFunctionRealizationRecords || [])
            .filter((item) => item.relationScope === 'cross-visible-actor');
        const records = freezeArray(crossVisibleEdges.map((edge, index) => classifyEdge(edge, synthesis, index)));
        const realized = records.filter((item) => item.realizationState === 'realized-in-source-context');
        const mapped = realized.filter((item) => item.effectTypeAuthorized);
        const unmapped = realized.filter((item) => !item.effectTypeAuthorized);
        const notRealized = records.filter((item) => item.realizationState === 'not-realized-in-source-context');
        const unresolved = records.filter((item) => !['realized-in-source-context','not-realized-in-source-context'].includes(item.realizationState));
        return Object.freeze({
            id:'CF-PARTY-VISIBLE-EDGE-EFFECT-TYPE-AUTHORIZATION-AUDIT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:'source-and-machine-audited-generic-visible-edge-mapping-unresolved',
            sourceContract:CONTRACT,
            records,
            edgeCount:records.length,
            realizedEdgeCount:realized.length,
            realizedAuthorizedEdgeCount:mapped.length,
            realizedUnmappedEdgeCount:unmapped.length,
            notRealizedEdgeCount:notRealized.length,
            unresolvedRealizationEdgeCount:unresolved.length,
            positiveCrossVisibleRealizationCapability:CONTRACT.positiveCrossVisibleRealizationCapability === true,
            positiveAuthorizedDirectPatternObserved:CONTRACT.positiveAuthorizedDirectPatternObserved === true,
            knownMotifAuthorizationModelDefined:true,
            genericVisibleEdgeEffectTypeResolverDefined:false,
            currentRegistryNoMatchIsSemanticRejection:false,
            actorGlobalEffectiveness:null,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceEvidenceIds,
            findings:FINDINGS
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-EFFECT-TYPE-AUTHORIZATION-AUDIT',
        claimKey:'strength.contextual-force.party.visible-edge.effect-type-authorization.audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            patternSpecificAuthorization:true,
            positiveCrossVisibleRealizationCapability:audit.positiveCrossVisibleRealizationCapability,
            realizedEdgeMayRemainUnmapped:true,
            currentRegistryNoMatchIsSemanticRejection:false,
            genericResolverDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'现有机器链已能产生 exact-source positive cross-visible realization；Party effect type 则仍由独立 source-backed motif 授权。两层交叉后可明确区分“已兑现且已授权”“已兑现但当前未授权”“未兑现”“realization 未解”。',
        boundary:'Audit resolved 不等于 generic visible-edge mapping resolved，也不授权把当前 registry 未覆盖的 realized edge判成无作用或自动归入某个 effect type。'
    });

    const makeDependency = ({ id, kind = 'aggregation', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
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

    const buildAuditDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-EFFECT-TYPE-AUTHORIZATION-AUDIT',
        scope:'cross-visible-realized-edge-effect-type-authorization-audit',
        status:'resolved',
        statement:'Visible-Edge Effect-Type Authorization Audit v0.1 已把 realization 与 Party effect-type authorization 分层，并验证当前 source registry 只授权 role-pattern-specific motifs。',
        boundary:'审计完成不代表 generic mapping 完成。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-SOURCE-AUDIT','SD-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-EVIDENCE'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-EFFECT-TYPE-AUTHORIZATION-AUDIT']
    });

    const buildCalibrationDependency = (audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION',
        kind:'validation',
        scope:'known-raw-visible-motif-positive-end-to-end-calibration',
        status:audit.positiveAuthorizedDirectPatternObserved ? 'resolved' : 'unresolved',
        statement:audit.positiveAuthorizedDirectPatternObserved
            ? '当前 direct-source realization registry 已存在至少一条正向 cross-visible edge，可端到端命中已登记 raw Party motif。'
            : '当前已有正向 cross-visible realization，但 direct-source registry 尚没有一条正向 edge 能端到端命中已登记的 raw opposition / mediation motif；effect-type mapping 仍缺 executable calibration case。',
        boundary:'Calibration gap 不是允许用合成 edge 或五行常识补齐来源；也不撤销现有 motif 的文本授权。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-EFFECT-TYPE-AUTHORIZATION-AUDIT']
    });

    const rebuildGenericVisibleMapping = (base = {}, audit = {}, auditDependency = {}, calibrationDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                auditDependency.id,
                calibrationDependency.id
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:`Visible-edge authorization 已审计：当前盘 cross-visible edge ${audit.edgeCount} 条，其中 realized ${audit.realizedEdgeCount}、当前 motif 已授权 ${audit.realizedAuthorizedEdgeCount}、realized 但未映射 ${audit.realizedUnmappedEdgeCount}。现有来源仍未定义 generic generation/restraint → Party effect type resolver，且 known raw motif 缺正向端到端 calibration。`,
            boundary:'不得把 realized edge 数量、function shape、十神角色或当前 registry no-match 转换成 generic effect type；no-match 也不是 semantic rejection。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyRelationEffectGeneralizationSourceAudit) return base;
        const audit = buildAudit(base);
        const claim = makeClaim(audit);
        const auditDependency = buildAuditDependency(audit);
        const calibrationDependency = buildCalibrationDependency(audit);
        const genericVisible = rebuildGenericVisibleMapping(base, audit, auditDependency, calibrationDependency);
        const replacedDependencyIds = new Set([auditDependency.id, calibrationDependency.id, genericVisible.id]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            auditDependency,
            calibrationDependency,
            genericVisible
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
            contextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit:audit,
            contextualForcePartyVisibleEdgeEffectTypeAuthorizationAuditRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Visible-Edge Effect-Type Authorization Audit v0.1 将 edge realization 与 Party effect-type authorization 明确拆开。',
                'exact-source realized-in-source-context 是 effect-type resolver 的必要输入之一，但不是充分条件；current registry no-match 必须保持 unmapped，而不是自动判 none。',
                '当前 raw opposition / mediation motifs 已有文本授权，但 direct-source positive realization registry 尚未提供端到端命中这些 motif 的 calibration case。',
                '因此 Generic Visible-Edge Mapping、Cross-Actor Relation Effect Generalization、Relative Dominance、Branch Substrate Quality、Strength Synthesis 与 Assessment 继续 unresolved。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit:(synthesis = {}) => buildAudit(synthesis)
    });

    GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        sourceApi,
        relationEffectRecordsForEdge,
        classifyEdge,
        buildAudit,
        buildAuditDependency,
        buildCalibrationDependency,
        rebuildGenericVisibleMapping,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
