(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCollectiveTargetSemanticsAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyCollectiveTargetSemanticsSource) {
        document.write('<script src="./js/bazi-contextual-force-party-collective-target-semantics-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyCollectiveTargetSemanticsSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, TARGET_SEMANTIC_LEVELS, SOURCE_EVIDENCE, LEVEL_SUMMARY, FINDINGS, CONTRACT } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const sourceEvidenceIds = freezeArray(SOURCE_EVIDENCE.map((item) => item.id));

    const buildAudit = () => Object.freeze({
        id:'CF-PARTY-COLLECTIVE-TARGET-SEMANTICS-AUDIT-V01',
        version:VERSION,
        ruleId:RULE_ID,
        status:'source-audited-target-level-model-unresolved',
        sourceContract:CONTRACT,
        targetSemanticLevels:TARGET_SEMANTIC_LEVELS,
        levelSummary:LEVEL_SUMMARY,
        singularRoleInstanceLanguageSupported:CONTRACT.singularRoleInstanceLanguageSupported === true,
        collectiveRoleInstanceLanguageSupported:CONTRACT.collectiveRoleInstanceLanguageSupported === true,
        roleClassLanguageSupported:CONTRACT.roleClassLanguageSupported === true,
        configurationLanguageSupported:CONTRACT.configurationLanguageSupported === true,
        collectiveSemanticsMayBeCrossScope:CONTRACT.collectiveSemanticsMayBeCrossScope === true,
        targetSemanticLevelResolverDefined:false,
        actorGroupIdentityContractDefined:false,
        crossScopeRoleInstanceGroupIdentityDefined:false,
        collectiveRelationEffectExecutionDefined:false,
        oppositionActorSpecificCalibrationRequiredBySource:false,
        groupOutcomeExpandsToMemberEdges:false,
        configurationEqualsActorGroup:false,
        roleClassRuleCreatesChartEdge:false,
        relativeDominance:null,
        actorGlobalEffectiveness:null,
        numericScore:null,
        scalarForce:null,
        sourceEvidenceIds,
        findings:FINDINGS
    });

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-TARGET-SEMANTICS-SOURCE-AUDIT',
        claimKey:'strength.contextual-force.party.relation-target.collective-semantics.source-audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            targetSemanticLevels:Object.freeze(Object.values(TARGET_SEMANTIC_LEVELS)),
            collectiveRoleInstanceLanguageSupported:audit.collectiveRoleInstanceLanguageSupported,
            collectiveSemanticsMayBeCrossScope:audit.collectiveSemanticsMayBeCrossScope,
            oppositionActorSpecificCalibrationRequiredBySource:false,
            groupOutcomeExpandsToMemberEdges:false,
            configurationEqualsActorGroup:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'《滴天髓阐微·官杀》同时使用“独杀／一杀”“众杀／两杀／四柱皆杀”“食神制杀／印绶化杀”理论句与“杀势／杀局／制杀太过”等状态语汇，足以确认 relation target 语义至少存在 single actor、actor set、role class、configuration 四层。',
        boundary:'来源只授权“这些语义层级确实存在”；尚未定义如何把具体文本自动解析到某层、如何建立有限 actor set membership、如何跨 visible/hidden scope 组团，也没有授权 collective outcome 拆成 member edges。'
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
        id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-TARGET-SEMANTICS-SOURCE-AUDIT',
        kind:'source-audit',
        scope:'relation-target-semantic-level-source-audit',
        status:'resolved',
        statement:'传统 relation target 已确认存在 single actor / actor set / role class / configuration 四层语义，并确认 collective 语义不能自动拆成 member-specific effect。',
        boundary:'Source audit resolved 不等于 target-level resolver、group identity 或 collective execution resolved。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-TARGET-SEMANTICS-SOURCE-AUDIT']
    });

    const buildTargetLevelResolverDependency = (sourceAuditDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER',
        scope:'relation-statement-to-target-semantic-level',
        status:'unresolved',
        statement:'来源已证明 target semantic level 不止一种，但程序尚未定义如何把具体 relation statement 稳定判为 single actor、actor set、role class 或 configuration。',
        boundary:'不得仅按“独／两／众／皆”等字面关键词机械分类；同一句可能同时包含 actor cardinality、root/scope 与 configuration 语义。',
        dependsOnDependencyIds:[sourceAuditDependency.id]
    });

    const buildActorGroupIdentityDependency = (targetLevelDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT',
        scope:'finite-same-role-actor-set-identity-and-membership',
        status:'unresolved',
        statement:'来源支持有限同角色实例集合，但尚未定义 groupId、member actorKey、cardinality、scope provenance 与 membership completeness contract。',
        boundary:'不得把同十神、同五行或同干自动视为同一 group；也不得把“庚金并透／两杀”外推到来源未点名的隐藏实例。',
        dependsOnDependencyIds:[targetLevelDependency.id]
    });

    const buildCrossScopeGroupDependency = (groupIdentityDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-SCOPE-ROLE-INSTANCE-GROUP-IDENTITY',
        scope:'collective-role-instance-membership-across-visible-hidden-branch-scope',
        status:'unresolved',
        statement:'“四柱皆杀”“七杀皆来生拱”等来源显示 collective role-instance semantics 可能跨 visible stem、surface branch 与 hidden/root manifestation；跨 scope group membership 尚未建模。',
        boundary:'不得把 cross-scope collective semantics 压缩成 visible-only group，也不得因此直接生成 visible→hidden 或 hidden→visible effect edge。',
        dependsOnDependencyIds:[groupIdentityDependency.id,'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-HIDDEN-CROSS-SCOPE-REALIZATION']
    });

    const buildCollectiveExecutionDependency = (targetLevelDependency = {}, groupIdentityDependency = {}, crossScopeGroupDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION',
        scope:'collective-target-relation-effect-realization-and-authorization',
        status:'unresolved',
        statement:'即使 actor set identity 建立，当前仍没有定义“食神制杀／七杀皆来生拱”等 collective relation 如何形成一个可执行 effect record、如何保留 group-level provenance，以及是否／何时能投影到成员。',
        boundary:'默认禁止 group outcome → member edge 展开；禁止按成员数量复制 effect、计票、加权或生成 actor-global effectiveness。',
        dependsOnDependencyIds:[targetLevelDependency.id,groupIdentityDependency.id,crossScopeGroupDependency.id]
    });

    const rebuildOppositionCalibrationDependency = (base = {}, sourceAuditDependency = {}, targetLevelDependency = {}, groupIdentityDependency = {}, collectiveExecutionDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                sourceAuditDependency.id,
                targetLevelDependency.id,
                groupIdentityDependency.id,
                collectiveExecutionDependency.id
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'食神制杀 case family 已不再被解释为“继续寻找唯一 visible target actor”的纯 provenance 缺口：来源反复以众杀／两杀／群凶整体承接制杀结果。当前真正 blocker 是 target semantic level、actor-group identity 与 collective effect execution 尚未实现。',
            boundary:'本依赖 id 为兼容既有链保留；不得用 actor-specific edge 强行满足 collective source case，也不得把 collective calibration 视为 generic visible-edge mapping。'
        });
    };

    const rebuildTotalCalibrationDependency = (base = {}, oppositionDependency = {}, collectiveExecutionDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []).filter((id) => id !== oppositionDependency.id),
                oppositionDependency.id,
                collectiveExecutionDependency.id
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Known motif E2E calibration 仍 unresolved，但 opposition 的缺口已重分类为 collective-target model 缺失；mediation 仍保留 visible/cross-scope provenance 与 realization blocker。',
            boundary:'不能因为 collective semantics 已获来源支持就视为 executable calibration 已完成；也不能要求所有 motif 强制落为 single visible edge。'
        });
    };

    const rebuildGenericVisibleMapping = (base = {}, targetLevelDependency = {}, totalCalibrationDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                targetLevelDependency.id,
                totalCalibrationDependency.id
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Generic visible-edge mapping 继续未定义；本轮进一步确认 source-backed relation statement 甚至未必以 single visible actor 为 target，因此任何 generic mapper 都必须先区分 target semantic level。',
            boundary:'collective/role-class/configuration 语义不能被 generic visible edge resolver 吞平；已知 motif 的 collective target 也不能反推所有 generation/restraint 都具有 group semantics。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyVisibleMotifE2ECalibrationSourceAudit) return base;
        const audit = buildAudit();
        const claim = makeClaim(audit);
        const sourceAuditDependency = buildSourceAuditDependency();
        const targetLevelDependency = buildTargetLevelResolverDependency(sourceAuditDependency);
        const groupIdentityDependency = buildActorGroupIdentityDependency(targetLevelDependency);
        const crossScopeGroupDependency = buildCrossScopeGroupDependency(groupIdentityDependency);
        const collectiveExecutionDependency = buildCollectiveExecutionDependency(targetLevelDependency, groupIdentityDependency, crossScopeGroupDependency);
        const oppositionDependency = rebuildOppositionCalibrationDependency(base, sourceAuditDependency, targetLevelDependency, groupIdentityDependency, collectiveExecutionDependency);
        const totalCalibrationDependency = rebuildTotalCalibrationDependency(base, oppositionDependency, collectiveExecutionDependency);
        const genericVisibleDependency = rebuildGenericVisibleMapping(base, targetLevelDependency, totalCalibrationDependency);

        const replacedDependencyIds = new Set([
            sourceAuditDependency.id,
            targetLevelDependency.id,
            groupIdentityDependency.id,
            crossScopeGroupDependency.id,
            collectiveExecutionDependency.id,
            oppositionDependency.id,
            totalCalibrationDependency.id,
            genericVisibleDependency.id
        ]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            sourceAuditDependency,
            targetLevelDependency,
            groupIdentityDependency,
            crossScopeGroupDependency,
            collectiveExecutionDependency,
            oppositionDependency,
            totalCalibrationDependency,
            genericVisibleDependency
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
            contextualForcePartyCollectiveTargetSemanticsSourceAudit:audit,
            contextualForcePartyCollectiveTargetSemanticsRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Collective Target Semantics Source Audit v0.1 已确认 relation target 至少存在 single actor、actor set、role class、configuration 四层来源语义。',
                '“众杀有制／两杀／群凶／七杀皆来”等 collective wording 不得拆成 member-specific effect edges。',
                'actor set 可能跨 visible / branch-hidden scope；“杀势／杀局／制杀太过”等 configuration wording 不能物化为 actor group。',
                '食神制杀 opposition 的 blocker 已从“缺唯一 target 命例”升级为 target model scope mismatch：需要 target-level resolver、group identity 与 collective execution。',
                '本层仍不创建 group resolver、不修改 realization registry、不产生 numeric force、relative dominance、party configuration 或 Strength Assessment。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyCollectiveTargetSemanticsAudit:buildAudit
    });

    GuiJia.baziContextualForcePartyCollectiveTargetSemanticsAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        sourceApi,
        buildAudit,
        buildSourceAuditDependency,
        buildTargetLevelResolverDependency,
        buildActorGroupIdentityDependency,
        buildCrossScopeGroupDependency,
        buildCollectiveExecutionDependency,
        rebuildOppositionCalibrationDependency,
        rebuildTotalCalibrationDependency,
        rebuildGenericVisibleMapping,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
