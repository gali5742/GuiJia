(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationSemanticsModernSupportAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource) {
        document.write('<script src="./js/bazi-contextual-force-party-relation-semantics-modern-support-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, SOURCES, EVIDENCE, FINDINGS, CONTRACT } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceEvidenceIds = freezeArray(EVIDENCE.map((item) => item.id));

    const buildAudit = () => {
        const independentSources = Object.values(SOURCES).filter((item) => item.independentCorroboration === true);
        const schoolSpecificSources = Object.values(SOURCES).filter((item) => item.sourceTier === 'modern-school-specific-calibration');
        const transmissionSources = Object.values(SOURCES).filter((item) => item.sourceTier === 'transmission-reception-evidence');
        return Object.freeze({
            id:'CF-PARTY-RELATION-SEMANTICS-MODERN-SUPPORT-AUDIT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:'cross-literature-modern-support-audited-executable-resolvers-unresolved',
            sourceContract:CONTRACT,
            independentCorroborationSourceIds:freezeArray(independentSources.map((item) => item.id)),
            schoolSpecificCalibrationSourceIds:freezeArray(schoolSpecificSources.map((item) => item.id)),
            transmissionReceptionSourceIds:freezeArray(transmissionSources.map((item) => item.id)),
            actorSetSemanticsCrossLiteratureSupported:true,
            positionProvenanceRequired:true,
            competingRelationPathsSupported:true,
            sameRoleInventoryEqualsSameExecutableRelation:false,
            liangSpecificPositionRuleUniversalized:false,
            yuanCountsAsIndependentCorroboration:false,
            modernSourceOverridesClassicalSemantics:false,
            relationPositionProvenanceResolverDefined:false,
            competingRelationPathResolverDefined:false,
            targetSemanticLevelResolverDefined:false,
            actorGroupIdentityContractDefined:false,
            collectiveRelationEffectExecutionDefined:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceEvidenceIds,
            findings:FINDINGS
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-MODERN-SUPPORT-SOURCE-AUDIT',
        claimKey:'strength.contextual-force.party.relation-semantics.modern-support.source-audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            actorSetSemanticsCrossLiteratureSupported:audit.actorSetSemanticsCrossLiteratureSupported,
            positionProvenanceRequired:audit.positionProvenanceRequired,
            competingRelationPathsSupported:audit.competingRelationPathsSupported,
            sameRoleInventoryEqualsSameExecutableRelation:audit.sameRoleInventoryEqualsSameExecutableRelation,
            modernSourceOverridesClassicalSemantics:audit.modernSourceOverridesClassicalSemantics,
            liangSpecificPositionRuleUniversalized:audit.liangSpecificPositionRuleUniversalized,
            yuanCountsAsIndependentCorroboration:audit.yuanCountsAsIndependentCorroboration
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'韦千里独立讨论官杀／伤食复数组合与“贴近”后的去留差异；徐乐吾在具体命例中明确说明同样的食神、财、七杀因位置变化可由“食制杀”转为“食生财→财生杀”。这足以横向支持 position provenance 与 competing relation paths 是独立语义问题。梁湘润只作现代学派校准，袁树珊明确转录沈孝瞻语句只作传承证据。',
        boundary:'本 claim 只解决 cross-literature schema support，不授权任何现代作者直接生成 executable edge，不把梁氏具体位置规则普遍化，也不解决 position resolver、relation-path resolver、target/group identity 或 Strength。'
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

    const buildSourceAuditDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-CROSS-LITERATURE-MODERN-SUPPORT-AUDIT',
        kind:'source-audit',
        scope:'modern-cross-literature-relation-semantics-schema-support',
        status:'resolved',
        statement:'近现代横向资料已按独立横证、现代学派校准、传承／接受史三层审计；actor-set、position-sensitive relation semantics 与 competing relation paths 均获得足够 schema-level 支持。',
        boundary:'现代横证只支持“程序需要表达什么”，不覆盖古典语义授权；具体 relation execution 仍必须回到 source-backed rule、chart-local binding 与 realization gate。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-MODERN-SUPPORT-SOURCE-AUDIT']
    });

    const buildPositionProvenanceDependency = (sourceAuditDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE',
        scope:'relation-source-target-relative-position-and-intervening-context-provenance',
        status:'unresolved',
        statement:'横向资料证明 position/relative order/贴近/异位可能改变 relation interpretation；当前 annotation 与 chart binding 尚未统一定义 source pillar、target pillar、relative order、same/adjacent/separated 与 intervening actor provenance。',
        boundary:'不得把“相邻”“前一位”“同柱”本身写成通用 realized rule；这里只要求机器保存位置证据，具体如何影响 relation 必须由 source-backed resolver 另行审定。',
        dependsOnDependencyIds:[sourceAuditDependency.id]
    });

    const buildCompetingRelationPathDependency = (sourceAuditDependency = {}, positionDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION',
        scope:'source-backed-competing-cross-actor-relation-path-disambiguation',
        status:'unresolved',
        statement:'同一组食神、财、官杀 actor/role 可以存在多个 source-backed relation path，例如直接食神→七杀或食神→财→七杀；程序尚未定义在 chart-local context 下如何授权、排除或保留这些 competing paths。',
        boundary:'不得用固定优先级、最近距离、member count 或“已知 motif 优先”静默选路；路径选择必须保留 source authority、position/scope/cardinality provenance 与 realization 条件。',
        dependsOnDependencyIds:[sourceAuditDependency.id,positionDependency.id]
    });

    const rebuildDependency = (base = {}, id = '', additions = [], statement = null, boundary = null) => {
        const current = (base.dependencies || []).find((item) => item.id === id) || {};
        return Object.freeze({
            ...current,
            id,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([...(current.dependsOnDependencyIds || []), ...additions.map((item) => item.id)])),
            resolvedByClaimIds:Object.freeze([]),
            ...(statement ? { statement } : {}),
            ...(boundary ? { boundary } : {})
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyCuratedRelationSourceSemanticAnnotationAudit) return base;
        const audit = buildAudit();
        const claim = makeClaim(audit);
        const sourceAuditDependency = buildSourceAuditDependency();
        const positionDependency = buildPositionProvenanceDependency(sourceAuditDependency);
        const competingPathDependency = buildCompetingRelationPathDependency(sourceAuditDependency, positionDependency);

        const candidateBindingDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING',
            [positionDependency],
            'Chart-local target candidate binding 除 role/scope/cardinality 外还必须保留 relation position provenance；但位置证据模型与实例 binding consumer 尚未完成，因此继续 unresolved。',
            '不得因“贴近”“前一位”或柱距而直接选中 target actor；position 只作为 source-backed binding provenance。'
        );

        const oppositionCalibrationDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION',
            [competingPathDependency],
            null,
            '即使食神→七杀 motif 获得语义授权，也必须先排除同一 chart 中 source-backed competing relation paths；不得把 motif presence 当作唯一执行路径。'
        );

        const knownMotifCalibrationDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION',
            [competingPathDependency],
            null,
            'Known motif E2E calibration 必须区分“motif 可存在”与“当前 chart 中哪条 relation path 被授权并兑现”。'
        );

        const genericVisibleMappingDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
            [competingPathDependency],
            null,
            'Generic visible-edge mapping 除 effect-type authorization 与 known motif calibration 外，还缺 competing relation path disambiguation；相同角色集合不能自动生成同一 executable relation。'
        );

        const generalizationDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            [competingPathDependency],
            null,
            'Cross-actor relation generalization 必须先解决同一 actor inventory 下的 competing source-backed paths；否则 generic rule 会把可替代路径错误叠加。'
        );

        const replacedDependencyIds = new Set([
            sourceAuditDependency.id,
            positionDependency.id,
            competingPathDependency.id,
            candidateBindingDependency.id,
            oppositionCalibrationDependency.id,
            knownMotifCalibrationDependency.id,
            genericVisibleMappingDependency.id,
            generalizationDependency.id
        ]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            sourceAuditDependency,
            positionDependency,
            competingPathDependency,
            candidateBindingDependency,
            oppositionCalibrationDependency,
            knownMotifCalibrationDependency,
            genericVisibleMappingDependency,
            generalizationDependency
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
            contextualForcePartyRelationSemanticsModernSupportAudit:audit,
            contextualForcePartyRelationSemanticsModernSupportRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Relation Semantics Cross-Literature Modern Support Audit v0.1：近现代独立横证支持 actor-set、position provenance 与 competing relation paths 的架构必要性。',
                '韦千里／徐乐吾可作为 independent corroboration；梁湘润只作 school-specific calibration；袁树珊明确传录前说时只作 transmission evidence。',
                'Modern support 不能覆盖 classical source authority，也不能直接授权 executable relation edge。',
                'Position provenance 不是距离规则；Competing Relation Path Resolution 不使用固定优先级、最近距离、计数或投票。',
                'Target/Group Identity、Collective Effect Execution、Known Motif Calibration、Generic Mapping、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-relation-semantics-modern-support-audit-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyRelationSemanticsModernSupportAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
