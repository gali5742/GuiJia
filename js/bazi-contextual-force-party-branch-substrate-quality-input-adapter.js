(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapter?.installed) return;

    // Research bootstrap prerequisite: ./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-contract.js?v=13.44.0
    // Research bootstrap prerequisite: ./js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-profile.js?v=13.44.0
    // Research bootstrap prerequisite: ./js/bazi-branch-element-relation-inventory.js?v=13.44.0

    const contractApi = GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapterContract || null;
    const baseProfileApi = GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapterProfile || null;
    const branchElementRelationApi = GuiJia.baziBranchElementRelationInventory || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !baseProfileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, FAMILY_KEYS, COVERAGE_STATES, FAMILY_ADAPTERS, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const buildBranchElementRelationInventory = (synthesis = {}) => {
        if (!branchElementRelationApi?.buildInventory) return null;
        const branches = synthesis.qianliQuantitySemanticBridgeInventory?.sourceSurfaceInventory?.branches || [];
        return branchElementRelationApi.buildInventory(branches);
    };

    const augmentBranchInteractionFamily = (family = {}, candidate = {}, inventory = null) => {
        if (!inventory || !branchElementRelationApi?.recordsForActor) return family;
        const actorPresent = (inventory.branches || []).some((item) => item.actorKey === candidate.actorKey);
        const relationRecords = actorPresent ? branchElementRelationApi.recordsForActor(inventory, candidate.actorKey) : freezeArray([]);
        const expectedRelationCount = actorPresent ? Math.max((inventory.branches || []).length - 1, 0) : 0;
        const structureComplete = String(family.structureCatalogStatus || '').startsWith('rebuilt-from-four-pillar-machine-inventory');
        const relationComplete = inventory.complete === true && actorPresent && relationRecords.length === expectedRelationCount;
        const complete = structureComplete && relationComplete;
        const blockers = [];
        if (!structureComplete) blockers.push(Object.freeze({
            id:`BSQIA-BRANCH-STRUCTURE-${candidate.actorKey || 'UNKNOWN'}`,
            blockerType:'branch-structure-provenance-unavailable',
            statement:'当前 branch candidate 的特殊 Structure participant provenance 尚不可稳定恢复。'
        }));
        if (!relationComplete) blockers.push(Object.freeze({
            id:`BSQIA-BRANCH-ELEMENT-${candidate.actorKey || 'UNKNOWN'}`,
            blockerType:'neutral-branch-element-relation-inventory-incomplete',
            statement:'当前 branch candidate 的普通五行生克比和 pairwise relation inventory 尚不完整。'
        }));
        return Object.freeze({
            ...family,
            status:complete ? COVERAGE_STATES.RESOLVED : COVERAGE_STATES.PARTIAL,
            ordinaryElementRelationInventory:Object.freeze({
                inventoryId:inventory.id || null,
                status:relationComplete ? 'resolved-neutral-relation-identity' : 'unresolved-neutral-relation-identity',
                actorKey:candidate.actorKey || null,
                expectedRelationCount,
                actualRelationCount:relationRecords.length,
                relationRecords,
                specialStructureIndependent:true,
                realizedEffect:null,
                directedCapacity:null,
                qualityMapping:null
            }),
            blockerRecords:freezeArray(blockers),
            qualityMapping:null,
            relationCountAsQuality:false,
            boundary:'特殊 Structure 与普通五行 relation identity 并行保存；普通生克比和只确认潜在五行关系，不表示已兑现为 effect、capacity、party force 或 substrate quality。'
        });
    };

    const buildAdapterView = (semanticModel = {}, synthesis = {}) => {
        const baseView = baseProfileApi.buildAdapterView(semanticModel, synthesis);
        const relationInventory = buildBranchElementRelationInventory(synthesis);
        if (!relationInventory) return baseView;
        const records = freezeArray((baseView.candidateRecords || []).map((record) => {
            const familyRecords = freezeArray((record.familyRecords || []).map((family) =>
                family.familyKey === FAMILY_ADAPTERS.branchInteraction.key
                    ? augmentBranchInteractionFamily(family, record, relationInventory)
                    : family
            ));
            const blockerRecords = freezeArray(familyRecords.flatMap((item) => item.blockerRecords || []));
            return Object.freeze({
                ...record,
                familyRecords,
                upstreamSemanticCoverageComplete:blockerRecords.length === 0,
                blockerRecords
            });
        }));
        const blockerRecords = freezeArray(records.flatMap((record) => record.blockerRecords || []));
        const upstreamSemanticCoverageComplete = records.every((record) => record.upstreamSemanticCoverageComplete === true);
        return Object.freeze({
            ...baseView,
            status:baseView.structuralInventoryCoverageComplete
                ? upstreamSemanticCoverageComplete
                    ? 'mapped-complete-input-and-upstream-coverage'
                    : 'mapped-complete-family-inventory-upstream-partial'
                : 'mapped-partial-family-inventory',
            candidateRecords:records,
            upstreamSemanticCoverageComplete,
            blockerRecords,
            blockerIds:freezeArray(unique(blockerRecords.map((item) => item.id))),
            branchElementRelationInventoryDefined:true,
            branchElementRelationInventoryComplete:relationInventory.complete === true,
            branchElementRelationInventory:relationInventory,
            boundary:'Adapter coverage 已包含普通支间五行 neutral relation inventory；这只补齐 branch-interaction 输入事实，不把潜在关系升级为实际作用，也不授权 substrate quality。'
        });
    };

    const profileApi = Object.freeze({ ...baseProfileApi, buildAdapterView });

    const familyRecords = (view = {}, familyKey = '') => freezeArray(
        (view.candidateRecords || []).map((record) =>
            (record.familyRecords || []).find((item) => item.familyKey === familyKey)
        ).filter(Boolean)
    );

    const familyCoverageComplete = (view = {}, familyKey = '') => {
        const records = familyRecords(view, familyKey);
        if (!(view.candidateRecords || []).length) return true;
        return records.length === view.candidateRecords.length && records.every((item) => item.status === COVERAGE_STATES.RESOLVED);
    };

    const makeClaim = ({ id, claimKey, status = 'resolved', value, rationale, boundary }) => Object.freeze({
        id,
        claimKey,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        value:Object.freeze(value),
        rationale,
        boundary
    });

    const buildClaims = (view = {}) => {
        const upstreamResolved = view.upstreamSemanticCoverageComplete === true;
        const branchElementResolved = view.branchElementRelationInventoryComplete === true;
        return Object.freeze([
            makeClaim({
                id:'SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-ADAPTER-MODEL',
                claimKey:'strength.contextual-force.party.branch-substrate-quality.input-adapter.model',
                value:{ familyKeys:FAMILY_KEYS, structuralInventoryCoverageDistinctFromUpstreamSemanticCoverage:true, automaticQualityResolverDefined:false },
                rationale:'六类来源输入已经映射到现有项目语义层，并继续区分“有稳定 family record”与“上游语义已经解析”。',
                boundary:'Adapter model resolved 不表示任一 family 的 concrete semantic coverage resolved。'
            }),
            makeClaim({
                id:'SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-INVENTORY-COVERAGE',
                claimKey:'strength.contextual-force.party.branch-substrate-quality.input-adapter.inventory-coverage',
                status:view.structuralInventoryCoverageComplete ? 'resolved' : 'unresolved',
                value:{ candidateCount:(view.candidateRecords || []).length, structuralInventoryCoverageComplete:view.structuralInventoryCoverageComplete === true, requiredFamilyKeys:FAMILY_KEYS },
                rationale:view.structuralInventoryCoverageComplete
                    ? '每个 surface-branch substrate candidate 都具有六类 family record；未解析语义继续以 blocker 保存。'
                    : '仍有 substrate candidate 缺少 required family record。',
                boundary:'Inventory coverage 只检查 family 映射记录完整，不把 partial family 当 resolved semantic input。'
            }),
            makeClaim({
                id:'SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-BRANCH-ELEMENT-RELATION-INVENTORY',
                claimKey:'strength.contextual-force.party.branch-substrate-quality.branch-element-relation-inventory',
                status:branchElementResolved ? 'resolved' : 'unresolved',
                value:{
                    defined:view.branchElementRelationInventoryDefined === true,
                    complete:branchElementResolved,
                    pairCount:view.branchElementRelationInventory?.actualPairCount || 0,
                    relationKinds:freezeArray(['generation','restraint','peer']),
                    specialStructureIndependent:true
                },
                rationale:branchElementResolved
                    ? '表层地支两两之间的普通五行生、克、同类 relation identity 已由地支五行派生，并与特殊 Structure 分层保存。'
                    : '普通支间五行 relation inventory 仍不完整。',
                boundary:'普通 relation identity 不表示 realized effect、effectiveness、directed capacity、quality 或 force score。'
            }),
            makeClaim({
                id:'SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-UPSTREAM-SEMANTIC-COVERAGE',
                claimKey:'strength.contextual-force.party.branch-substrate-quality.input-adapter.upstream-semantic-coverage',
                status:upstreamResolved ? 'resolved' : 'unresolved',
                value:{ coverageComplete:upstreamResolved, blockerIds:freezeArray(view.blockerIds || []) },
                rationale:upstreamResolved
                    ? '当前所有 branch substrate candidates 的六类 input family 上游语义均已解析。'
                    : '普通支间五行 relation identity 已补齐，但仍可能存在覆干 reception、党势/relative dominance 或 directed relation-effect 等 blocker。',
                boundary:'Upstream semantic coverage resolved 仍只意味着 comparator 的输入可用；不授权 cross-axis comparison 或 substrate quality。'
            })
        ]);
    };

    const makeDependency = ({ id, scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind:'aggregation',
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildFamilyDependency = (view = {}, familyKey, id, scope, statementResolved, statementUnresolved, extraDepends = []) => {
        const complete = familyCoverageComplete(view, familyKey);
        return makeDependency({
            id,
            scope,
            status:complete ? 'resolved' : 'unresolved',
            statement:complete ? statementResolved : statementUnresolved,
            boundary:'Family coverage 只表示该输入的上游语义可追溯，不生成 substrate quality，也不参与计数表决。',
            dependsOnDependencyIds:unique(['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-INVENTORY-COVERAGE', ...extraDepends]),
            resolvedByClaimIds:[]
        });
    };

    const buildDependencies = (view = {}) => {
        const hasBranch = (view.candidateRecords || []).length > 0;
        const inventoryResolved = view.structuralInventoryCoverageComplete === true;
        const upstreamResolved = view.upstreamSemanticCoverageComplete === true;
        const branchElementResolved = !hasBranch || view.branchElementRelationInventoryComplete === true;
        const branchElementInventory = makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-BRANCH-ELEMENT-RELATION-INVENTORY',
            scope:'surface-branch-ordinary-element-relation-inventory',
            status:branchElementResolved ? 'resolved' : 'unresolved',
            statement:branchElementResolved
                ? hasBranch
                    ? `表层地支 ordinary five-element relation inventory 已解析，共 ${view.branchElementRelationInventory?.actualPairCount || 0} 组 pairwise relation。`
                    : '当前无 surface-branch substrate candidate，普通支间五行 relation inventory 对本盘 not-applicable。'
                : '普通支间五行生克比和 pairwise relation inventory 尚未完整建立。',
            boundary:'该层只维护 neutral relation identity；不得直接映射吉凶、effectiveness、capacity、quality 或 force score。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-ADAPTER-MODEL'],
            resolvedByClaimIds:branchElementResolved ? ['SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-BRANCH-ELEMENT-RELATION-INVENTORY'] : []
        });

        const familyDeps = [
            buildFamilyDependency(
                view,
                FAMILY_ADAPTERS.coveringStem.key,
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-COVERING-STEM-INPUT-COVERAGE',
                'surface-branch-covering-stem-input-coverage',
                '当前 branch candidates 的覆干 identity 与 reception provenance 均可追溯。',
                '至少一个 branch candidate 的覆干 identity 或其受生扶/克制 provenance 尚未解析。'
            ),
            buildFamilyDependency(
                view,
                FAMILY_ADAPTERS.branchInteraction.key,
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-BRANCH-INTERACTION-INPUT-COVERAGE',
                'surface-branch-interaction-input-coverage',
                '当前 branch candidates 的特殊 Structure 与普通支间五行 relation identity 均可追溯。',
                '至少一个 branch candidate 的 Structure provenance 或普通五行 relation inventory 尚未完整。',
                ['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-BRANCH-ELEMENT-RELATION-INVENTORY']
            ),
            buildFamilyDependency(
                view,
                FAMILY_ADAPTERS.seasonal.key,
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SEASONAL-INPUT-COVERAGE',
                'surface-branch-seasonal-input-coverage',
                '当前 branch candidates 均已有 actor-specific seasonal context。',
                '至少一个 branch candidate 的 actor-specific seasonal context 尚未解析。',
                ['SD-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-COVERAGE']
            ),
            buildFamilyDependency(
                view,
                FAMILY_ADAPTERS.branchNetworkParty.key,
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-NETWORK-PARTY-INPUT-COVERAGE',
                'surface-branch-network-party-input-coverage',
                '当前 branch candidates 的 anchor-specific membership/network/relation-effect/dominance context 均可追溯。',
                'Branch side profile 已存在，但 relation-effect generalization 或 relative dominance 仍未完成。',
                ['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION','SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER']
            ),
            buildFamilyDependency(
                view,
                FAMILY_ADAPTERS.positionalRole.key,
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-POSITIONAL-ROLE-INPUT-COVERAGE',
                'surface-branch-positional-role-input-coverage',
                '当前 branch candidates 均保留 pillar/position 与 anchor-target role provenance。',
                '至少一个 branch candidate 缺少 pillar/position 或 anchor-target role provenance。'
            ),
            buildFamilyDependency(
                view,
                FAMILY_ADAPTERS.directedCapacity.key,
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-DIRECTED-CAPACITY-INPUT-COVERAGE',
                'surface-branch-directed-capacity-input-coverage',
                '当前 branch candidates 的 target-specific directed relation/interaction provenance 均可追溯。',
                'Directed-capacity family 仍受 relation-effect generalization 或具体 interaction realization blocker 影响。',
                ['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']
            )
        ];

        return Object.freeze([
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-ADAPTER-MODEL',
                scope:'surface-branch-substrate-quality-input-adapter-model',
                status:'resolved',
                statement:'Branch Substrate Quality Input Adapter v0.1 已把六类 source-audited input family 映射到现有项目语义层。',
                boundary:'Adapter model resolved 不等于 input semantic coverage resolved。',
                dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-FAMILY-MODEL'],
                resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-ADAPTER-MODEL']
            }),
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-INVENTORY-COVERAGE',
                scope:'surface-branch-substrate-quality-input-inventory-coverage',
                status:inventoryResolved ? 'resolved' : 'unresolved',
                statement:inventoryResolved
                    ? `当前 ${(view.candidateRecords || []).length} 个 branch substrate candidate 均具有六类 family record。`
                    : '仍有 branch substrate candidate 缺少 required family record。',
                boundary:'Family record 可以是 partial/unavailable；inventory coverage 不得冒充 semantic coverage。',
                dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-ADAPTER-MODEL'],
                resolvedByClaimIds:inventoryResolved ? ['SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-INVENTORY-COVERAGE'] : []
            }),
            branchElementInventory,
            ...familyDeps,
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-UPSTREAM-SEMANTIC-COVERAGE',
                scope:'surface-branch-substrate-quality-upstream-semantic-coverage',
                status:upstreamResolved ? 'resolved' : 'unresolved',
                statement:upstreamResolved
                    ? '六类 branch substrate quality input family 的 concrete upstream semantics 已完整可追溯。'
                    : `Input inventory 已建立，但仍有 ${(view.blockerRecords || []).length} 项其他 upstream semantic blocker。`,
                boundary:'Upstream semantic coverage complete 也不授权跨轴比较或 substrate quality 结论。',
                dependsOnDependencyIds:[
                    'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-COVERING-STEM-INPUT-COVERAGE',
                    'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-BRANCH-INTERACTION-INPUT-COVERAGE',
                    'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SEASONAL-INPUT-COVERAGE',
                    'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-NETWORK-PARTY-INPUT-COVERAGE',
                    'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-POSITIONAL-ROLE-INPUT-COVERAGE',
                    'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-DIRECTED-CAPACITY-INPUT-COVERAGE'
                ],
                resolvedByClaimIds:upstreamResolved ? ['SC-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-UPSTREAM-SEMANTIC-COVERAGE'] : []
            })
        ]);
    };

    const rebuildCrossAxisComparison = (base = {}, view = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-CROSS-AXIS-COMPARISON-RULE') || {};
        const hasBranch = (view.candidateRecords || []).length > 0;
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-CROSS-AXIS-COMPARISON-RULE',
            status:hasBranch ? 'unresolved' : 'resolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-ADAPTER-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-INVENTORY-COVERAGE',
                ...(hasBranch ? ['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-UPSTREAM-SEMANTIC-COVERAGE'] : [])
            ])),
            resolvedByClaimIds:hasBranch ? Object.freeze([]) : freezeArray(current.resolvedByClaimIds || []),
            statement:hasBranch
                ? view.upstreamSemanticCoverageComplete
                    ? '六类上游输入已可追溯，但来源仍无跨轴优先级/补偿规则；comparison 继续 unresolved。'
                    : 'Branch element relation inventory 已补齐，但仍有其他 upstream semantic blocker，且来源无跨轴优先级/补偿规则；comparison 继续 unresolved。'
                : '当前无 branch substrate candidate，cross-axis comparison not-applicable。',
            boundary:'不得把 family coverage 状态、blocker 数量或记录数量当作比较器。'
        });
    };

    const rebuildSubstrateQualityResolver = (base = {}, view = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER') || {};
        const hasBranch = (view.candidateRecords || []).length > 0;
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER',
            status:hasBranch ? 'unresolved' : 'resolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-INVENTORY-COVERAGE',
                ...(hasBranch ? [
                    'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-UPSTREAM-SEMANTIC-COVERAGE',
                    'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-CROSS-AXIS-COMPARISON-RULE'
                ] : [])
            ])),
            resolvedByClaimIds:hasBranch ? Object.freeze([]) : freezeArray(current.resolvedByClaimIds || []),
            statement:hasBranch
                ? 'Branch substrate input inventory 已结构化，但 upstream semantic coverage 与 cross-axis comparison 仍未全部完成，因此 substrate quality 继续 unresolved。'
                : '当前无 surface-branch substrate candidate，quality resolver not-applicable。',
            boundary:'不得从 adapter status、family completeness 或任一单项 context 直接生成 quality。'
        });
    };

    const rebuildDownstreamCoverage = (base = {}) => ['SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE','SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE'].map((id) => {
        const current = (base.dependencies || []).find((item) => item.id === id);
        if (!current) return null;
        return Object.freeze({
            ...current,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-INVENTORY-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-UPSTREAM-SEMANTIC-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:id.endsWith('FOUNDATION-CONTEXT-COVERAGE')
                ? 'Branch substrate 普通关系输入已补齐，但 upstream semantics、quality resolver 与 hidden manifestation 仍未齐全，因此 foundation coverage 保持 unresolved。'
                : 'Side Force Profile 已能追溯 branch substrate 的普通关系与六类输入记录，但 concrete substrate quality、hidden manifestation 与 relation-effect generalization 仍未齐全。',
            boundary:'Input adapter 不得被当作 concrete foundation quality 或 side-force comparison。'
        });
    }).filter(Boolean);

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyBranchSubstrateQualitySourceAudit) return base;
        const view = profileApi.buildAdapterView(semanticModel, base);
        const claims = buildClaims(view);
        const dependencies = buildDependencies(view);
        const crossAxis = rebuildCrossAxisComparison(base, view);
        const substrateResolver = rebuildSubstrateQualityResolver(base, view);
        const downstream = rebuildDownstreamCoverage(base, view);
        const replacedClaimIds = new Set(claims.map((item) => item.id));
        const replacedDependencyIds = new Set([...dependencies.map((item) => item.id), crossAxis.id, substrateResolver.id, ...downstream.map((item) => item.id)]);
        const nextClaims = Object.freeze([...(base.claims || []).filter((item) => !replacedClaimIds.has(item.id)), ...claims]);
        const nextDependencies = Object.freeze([...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)), ...dependencies, crossAxis, substrateResolver, ...downstream]);
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
            contextualForcePartyBranchSubstrateQualityInputAdapterContract:CONTRACT,
            contextualForcePartyBranchSubstrateQualityInputAdapterView:view,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Branch Substrate Quality Input Adapter v0.1 将六类 source-audited family 映射到现有项目语义层，并把 structural inventory coverage 与 upstream semantic coverage 分开。',
                'Branch Element Relation Inventory v0.1 已补齐表层地支两两之间的普通五行生、克、同类 relation identity，并与刑冲合害破、三合三会等 Structure 分层。',
                '普通五行 relation identity 只表示潜在关系；不得据此生成 realized effect、effectiveness、directed capacity、party force、substrate quality 或 score。',
                'actor-specific seasonal context 与 pillar/position provenance 可以单独 resolved，但不得因此生成 substrate quality。',
                'branch network/party 与 directed capacity 继续受 Relation Effect Generalization / Relative Dominance 等既有 blocker 约束。',
                'Branch element inventory resolved 不等于 cross-axis comparison-ready；Substrate Quality Resolver、Relative Dominance、Party Configuration、Qianli many/few、Strength Synthesis 与 Assessment 继续关闭。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyBranchSubstrateQualityInputAdapterView:profileApi.buildAdapterView
    });

    GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapter = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        FAMILY_KEYS,
        COVERAGE_STATES,
        FAMILY_ADAPTERS,
        CONTRACT,
        profileApi,
        branchElementRelationApi,
        buildBranchElementRelationInventory,
        augmentBranchInteractionFamily,
        familyRecords,
        familyCoverageComplete,
        buildClaims,
        buildDependencies,
        rebuildCrossAxisComparison,
        rebuildSubstrateQualityResolver,
        rebuildDownstreamCoverage,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);