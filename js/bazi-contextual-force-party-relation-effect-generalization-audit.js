(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationEffectGeneralizationAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyRelationEffectGeneralizationSource) {
        document.write('<script src="./js/bazi-contextual-force-party-relation-effect-generalization-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyRelationEffectGeneralizationSource || null;
    const branchElementRelationApi = GuiJia.baziBranchElementRelationInventory || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, EVIDENCE, FINDINGS, REQUIRED_PROVENANCE_GATES, CONTRACT } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const sourceEvidenceIds = freezeArray(EVIDENCE.map((item) => item.id));
    const findingMap = Object.freeze(Object.fromEntries(FINDINGS.map((item) => [item.key, item])));

    const buildMachineCoverage = (synthesis = {}) => {
        const relationEffectView = synthesis.contextualForcePartyRelationEffectView || {};
        const crossVisible = (synthesis.visibleStemFunctionRealizationRecords || []).filter((item) => item.relationScope === 'cross-visible-actor');
        const realizedCrossVisible = crossVisible.filter((item) => item.realizationState === 'realized-in-source-context');
        const nonRealizedCrossVisible = crossVisible.filter((item) => item.realizationState === 'not-realized-in-source-context');
        const unresolvedCrossVisible = crossVisible.filter((item) => !['realized-in-source-context','not-realized-in-source-context'].includes(item.realizationState));

        const branchView = synthesis.contextualForcePartyBranchSubstrateQualityInputAdapterView || {};
        const surfaceBranches = synthesis.qianliQuantitySemanticBridgeInventory?.sourceSurfaceInventory?.branches || [];
        const branchInventory = branchView.branchElementRelationInventory
            || branchElementRelationApi?.buildInventory?.(surfaceBranches)
            || null;
        const branchRelations = branchInventory?.records || [];
        const branchPeerRelations = branchRelations.filter((item) => item.relationKind === 'peer');

        const interactionView = synthesis.contextualForceInteractionAdapterView || {};
        const structureScoped = (interactionView.realizedModifierRecords || []).filter((item) => item.family !== 'cross-visible-function-realization');

        const membership = synthesis.contextualForcePartyMembershipInventory || {};
        const hiddenActorKeys = unique((membership.evidenceRecords || [])
            .filter((item) => item.sourceScope === 'hidden-modifier' || String(item.actorKey || '').startsWith('hidden:'))
            .map((item) => item.actorKey));

        return Object.freeze({
            knownMotif:Object.freeze({
                status:relationEffectView.status || 'unavailable',
                recordCount:(relationEffectView.records || []).length,
                realizedRecordCount:(relationEffectView.realizedRecords || []).length,
                blockerCount:(relationEffectView.blockerRecords || []).length,
                genericCoverageComplete:relationEffectView.genericRelationEffectCoverageComplete === true,
                authorization:'source-backed-known-motif-only'
            }),
            crossVisible:Object.freeze({
                edgeCount:crossVisible.length,
                realizedEdgeCount:realizedCrossVisible.length,
                nonRealizedEdgeCount:nonRealizedCrossVisible.length,
                unresolvedEdgeCount:unresolvedCrossVisible.length,
                targetSpecific:true,
                realizationLayerAvailable:true,
                genericRelationEffectTypeMappingDefined:false,
                boundary:'visible-stem cross-actor edge 已有 realization provenance，但 realized edge 仍不自动等于 generic augmentation/opposition/mediation。'
            }),
            surfaceBranchOrdinary:Object.freeze({
                inventoryPresent:Boolean(branchInventory),
                inventoryComplete:branchInventory?.complete === true,
                relationCount:branchRelations.length,
                peerRelationCount:branchPeerRelations.length,
                relationIdentityAvailable:Boolean(branchInventory),
                realizationLayerAvailable:false,
                genericRelationEffectTypeMappingDefined:false,
                sourceView:branchView.branchElementRelationInventory ? 'input-adapter-view' : branchInventory ? 'direct-neutral-inventory' : 'unavailable',
                boundary:'普通表层地支生克比和仅为 neutral identity；当前没有 pairwise realization/effect layer。'
            }),
            structureScopedInteraction:Object.freeze({
                realizedModifierCount:structureScoped.length,
                actorPairDirectionComplete:false,
                genericCrossActorBridgeDefined:false,
                boundary:'root clash / bearing 等 interaction modifier 可以有 Structure-scoped 结果，但当前不是统一 sourceActor→targetActor relation-effect edge。'
            }),
            hiddenAndCrossScope:Object.freeze({
                hiddenActorCount:hiddenActorKeys.length,
                hiddenActorKeys:freezeArray(hiddenActorKeys),
                genericPairwiseRelationInventoryDefined:false,
                genericRealizationLayerDefined:false,
                boundary:'hidden actor 可以进入 membership/evidence provenance，但目前没有覆盖 hidden↔visible、hidden↔branch 等 generic target-specific realization inventory。'
            }),
            peer:Object.freeze({
                observedBranchPeerRelationCount:branchPeerRelations.length,
                directional:false,
                genericDirectedEffectDefined:false,
                boundary:'同类关系 identity 对称；不得为了 relation-effect 管线伪造 source→target 方向。'
            })
        });
    };

    const buildAudit = (synthesis = {}) => Object.freeze({
        id:'CF-PARTY-RELATION-EFFECT-GENERALIZATION-AUDIT-V01',
        version:VERSION,
        ruleId:RULE_ID,
        status:'source-and-machine-audited-generalization-resolver-unresolved',
        requiredProvenanceGates:freezeArray(REQUIRED_PROVENANCE_GATES),
        machineCoverage:buildMachineCoverage(synthesis),
        knownMotifAuthorizationPreserved:true,
        genericVisibleEdgeMapping:null,
        branchRelationRealization:null,
        structureToActorPairEffectBridge:null,
        hiddenCrossScopeRealization:null,
        peerDirectedEffect:null,
        automaticGenericResolver:null,
        actorGlobalParty:null,
        actorGlobalEffectiveness:null,
        relativeDominance:null,
        numericScore:null,
        scalarForce:null,
        findings:findingMap,
        sourceEvidenceIds
    });

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-AUDIT',
        claimKey:'strength.contextual-force.party.cross-actor-relation-effect.generalization-audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            knownMotifAuthorizationPreserved:true,
            relationPresenceIsNotRealization:true,
            realizedVisibleEdgeIsNotGenericPartyEffect:true,
            branchOrdinaryRelationIsIdentityOnly:true,
            structureScopedInteractionIsNotGenericActorPairEffect:true,
            hiddenCrossScopeGenericRealizationDefined:false,
            genericResolverDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'现有来源只授权若干 target-specific motif，并明确关系存在不等于实际作用。仓库机器层又显示 visible-stem、surface-branch、Structure-scoped interaction 与 hidden actor 的 provenance 深度不同，因此 generic relation effect 不能靠五行 shape 横向一刀切。',
        boundary:'Audit resolved 只表示缺口已经拆分定位；不表示 generic relation-effect resolver、directed capacity、relative dominance 或 substrate quality 已解析。'
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

    const buildAuditDependencies = (audit = {}) => {
        const coverage = audit.machineCoverage || {};
        const hasBranch = coverage.surfaceBranchOrdinary?.inventoryPresent === true;
        const hasStructureScoped = (coverage.structureScopedInteraction?.realizedModifierCount || 0) > 0;
        const hasHidden = (coverage.hiddenAndCrossScope?.hiddenActorCount || 0) > 0;
        return Object.freeze([
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-SOURCE-AUDIT',
                scope:'contextual-force-party-relation-effect-generalization-source-audit',
                status:'resolved',
                statement:'Relation Effect Generalization Source Audit v0.1 已确认 known motifs 可继续使用，但普通 relation presence 与 generic generation/restraint/peer shape 不足以授权 realized party effect。',
                boundary:'来源审计 resolved 不等于 generic resolver resolved。',
                dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL'],
                resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-AUDIT']
            }),
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
                scope:'cross-visible-realized-edge-to-generic-relation-effect-type',
                status:'unresolved',
                statement:`cross-visible actor 已有 ${coverage.crossVisible?.realizedEdgeCount || 0} 条 realized edge，但目前只有 source-backed known motifs 可映射为 relation effect；尚无来源授权的 generic generation/restraint → augmentation/opposition/mediation mapping。`,
                boundary:'realized edge 解决“是否兑现”，不自动解决“在 Party 语义中属于何种 effect”。',
                dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-SOURCE-AUDIT','SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL']
            }),
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-BRANCH-REALIZATION',
                scope:'surface-branch-ordinary-relation-realization',
                status:hasBranch ? 'unresolved' : 'resolved',
                statement:hasBranch
                    ? `表层地支普通 relation inventory 已有 ${coverage.surfaceBranchOrdinary?.relationCount || 0} 条 identity，但 pairwise realization/effect layer 尚不存在。`
                    : '当前没有 surface-branch ordinary relation inventory，branch realization 对本盘 not-applicable。',
                boundary:'Branch Element Relation Inventory 只确认 neutral identity；不得从生克比和直接生成 effect。',
                dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-BRANCH-ELEMENT-RELATION-INVENTORY']
            }),
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-STRUCTURE-ACTOR-PAIR-BRIDGE',
                scope:'structure-scoped-interaction-to-cross-actor-effect-bridge',
                status:hasStructureScoped ? 'unresolved' : 'resolved',
                statement:hasStructureScoped
                    ? `当前已有 ${coverage.structureScopedInteraction?.realizedModifierCount || 0} 条 Structure-scoped realized modifier，但尚无统一 actor-pair direction / relation-effect bridge。`
                    : '当前没有需要桥接的 Structure-scoped realized modifier。',
                boundary:'Structure-scoped interaction result 不得凭参与者列表猜 source→target 或 augmentation/opposition/mediation。',
                dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-MODEL']
            }),
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-HIDDEN-CROSS-SCOPE-REALIZATION',
                scope:'hidden-and-cross-scope-target-specific-relation-realization',
                status:hasHidden ? 'unresolved' : 'resolved',
                statement:hasHidden
                    ? `membership inventory 中存在 ${coverage.hiddenAndCrossScope?.hiddenActorCount || 0} 个 hidden actor，但尚无 hidden/cross-scope generic pairwise realization inventory。`
                    : '当前没有 hidden actor candidate，hidden/cross-scope realization 对本盘 not-applicable。',
                boundary:'hidden membership evidence 不等于 hidden actor 已与任一 target 形成 realized relation effect。',
                dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE']
            })
        ]);
    };

    const rebuildGeneralization = (base = {}, audit = {}, auditDependencies = []) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                ...auditDependencies.map((item) => item.id)
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Relation Effect Generalization 已完成 source + machine provenance 审计，但 generic visible-edge type mapping、branch realization、Structure→actor-pair bridge 与 hidden/cross-scope realization 仍未全部建立，因此 generic resolver 保持 unresolved。',
            boundary:'不得用 relation identity、realized record 数量、Structure participation、membership evidence 或五行常识跨越缺失的 provenance gate。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyRelationEffectView) return base;
        const audit = buildAudit(base);
        const claim = makeClaim(audit);
        const auditDependencies = buildAuditDependencies(audit);
        const generalization = rebuildGeneralization(base, audit, auditDependencies);
        const replacedIds = new Set([...auditDependencies.map((item) => item.id), generalization.id]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...auditDependencies,
            generalization
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
            contextualForcePartyRelationEffectGeneralizationSourceAudit:audit,
            contextualForcePartyRelationEffectGeneralizationSourceAuditRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Relation Effect Generalization Audit v0.1 保留 known source-backed motifs，同时把 generic coverage 拆成 visible-edge mapping、branch realization、Structure actor-pair bridge、hidden/cross-scope realization 四个独立缺口。',
                'visible-stem realized edge 只解决 realization，不自动授权 generic Party relation-effect type。',
                'Branch Element Relation Inventory 的普通生克比和仍为 identity-only；peer 关系不得伪造方向。',
                'Structure-scoped interaction modifier 不等于统一 actor-pair relation effect；hidden membership evidence 也不等于 hidden relation realization。',
                '因此 Cross-Actor Relation Effect Generalization、Directed Capacity、Relative Dominance、Branch Substrate Quality、Strength Synthesis 与 Assessment 继续 unresolved。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyRelationEffectGeneralizationAudit:(synthesis = {}) => buildAudit(synthesis)
    });

    GuiJia.baziContextualForcePartyRelationEffectGeneralizationAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        sourceApi,
        branchElementRelationApi,
        buildMachineCoverage,
        buildAudit,
        buildAuditDependencies,
        rebuildGeneralization,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
