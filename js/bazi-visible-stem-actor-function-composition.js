(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemActorFunctionComposition?.installed) return;

    // Research bootstrap dependency: ./js/bazi-visible-stem-actor-profile-interpretation.js?v=13.44.0

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_VERSION = '0.2';
    const VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-001';

    const readinessStatuses = Object.freeze({
        NOT_APPLICABLE:'not-applicable-no-function-inputs',
        BLOCKED_INCONSISTENT_EDGE:'blocked-inconsistent-edge-context',
        BLOCKED_UNSUPPORTED_RESOLVED_STATE:'blocked-unsupported-resolved-realization-state',
        INCOMPLETE_REALIZATION_COVERAGE:'incomplete-realization-coverage',
        READY_FOR_INTERPRETATION:'ready-for-actor-profile-interpretation'
    });

    const interpretationStatuses = Object.freeze({
        NOT_APPLICABLE:'not-applicable-no-function-inputs',
        BLOCKED_INPUT:'blocked-profile-input',
        UNRESOLVED:'unresolved-actor-profile-interpretation'
    });

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-CONTRACT-001',
        version:VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_VERSION,
        recordLevel:'visible-stem-actor-function-profile',
        actorProfileCentric:true,
        preservesEdgeIdentity:true,
        orthogonalParticipationAndRealizationAxes:true,
        bucketViewsAreIndexesNotAdditionalEvidence:true,
        resolvedMeansConclusionAvailableNotFunctionRealized:true,
        supportedResolvedRealizationStates:Object.freeze([
            'realized-in-source-context',
            'not-realized-in-source-context'
        ]),
        positiveRealizationStateAcceptedFromUpstream:true,
        positiveRealizationStateInvented:false,
        unknownResolvedRealizationStateBlocks:true,
        unresolvedInputPreserved:true,
        bearingContextSeparateFromFunctionEntries:true,
        sourceTargetPeerMayCoexist:true,
        actorGlobalEffectiveState:false,
        genericVisibleEffectiveState:false,
        scalarCollapse:false,
        numericAggregation:false,
        majorityVoting:false,
        priorityAggregation:false,
        orderOverwrite:false,
        finalStrengthMapping:false,
        statement:'本层把 Actor Interaction Aggregation 已保留的 relation-edge inputs 整理成正交 actor profile：participation role 与 realization coverage 分轴保存；resolved 只表示该 edge 已有结论，不等于 function realized。v0.2 明确接受上游 Direct Source Function Realization 已合法产生的 realized-in-source-context，但不自行发明新的正向状态。',
        boundary:'source / target / peer、realized / not-realized / unresolved / inconsistent 必须可在同一 actor profile 共存；bearing 仍是独立条件；未知的未来 resolved realization state 不得被静默当作正向兑现；本层不生成 actor global effective / ineffective。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const buildFunctionEntry = (input = {}) => Object.freeze({
        relationIdentity:input.relationIdentity || '',
        edgeContextIdentity:input.edgeContextIdentity || '',
        participationRole:input.participationRole || null,
        counterpartyActorKeys:freezeArray(input.counterpartyActorKeys || []),
        relationScope:input.relationScope || '',
        directed:input.directed,
        functionType:input.functionType || null,
        relationFromDayMaster:input.relationFromDayMaster || null,
        flow:input.flow || null,
        strengthMeaning:input.strengthMeaning || null,
        sourceActorKey:input.sourceActorKey || null,
        targetActorKey:input.targetActorKey || null,
        peerParticipantActorKeys:freezeArray(input.peerParticipantActorKeys || []),
        realizationRecordIds:freezeArray(input.realizationRecordIds || []),
        realizationState:input.realizationState ?? null,
        realizationStates:freezeArray(input.realizationStates || []),
        resolutionStatuses:freezeArray(input.resolutionStatuses || []),
        resolutionCoverageStatus:input.resolutionCoverageStatus || 'unresolved',
        consistencyStatus:input.consistencyStatus || 'consistent',
        sourcePatternIds:freezeArray(input.sourcePatternIds || []),
        reachabilityRecordIds:freezeArray(input.reachabilityRecordIds || []),
        upstreamDirectedFunctionRecordIds:freezeArray(input.upstreamDirectedFunctionRecordIds || []),
        contextConditionRecordIds:freezeArray(input.contextConditionRecordIds || [])
    });

    const classifyFunctionEntry = (entry = {}) => {
        if (entry.resolutionCoverageStatus === 'inconsistent' || entry.consistencyStatus === 'inconsistent-realization-state') {
            return 'inconsistent';
        }
        if (entry.resolutionCoverageStatus !== 'resolved') return 'unresolved';
        if (entry.realizationState === 'realized-in-source-context') return 'realized';
        if (entry.realizationState === 'not-realized-in-source-context') return 'not-realized';
        return 'unsupported-resolved-state';
    };

    const buildProfileViews = (entries = []) => {
        const byRole = {
            source:entries.filter((item) => item.participationRole === 'source'),
            target:entries.filter((item) => item.participationRole === 'target'),
            peer:entries.filter((item) => item.participationRole === 'peer')
        };
        const classified = entries.map((entry) => ({ entry, classification:classifyFunctionEntry(entry) }));
        const byState = {
            resolved:entries.filter((item) => item.resolutionCoverageStatus === 'resolved'),
            realized:classified.filter((item) => item.classification === 'realized').map((item) => item.entry),
            notRealized:classified.filter((item) => item.classification === 'not-realized').map((item) => item.entry),
            unresolved:classified.filter((item) => item.classification === 'unresolved').map((item) => item.entry),
            inconsistent:classified.filter((item) => item.classification === 'inconsistent').map((item) => item.entry),
            unsupportedResolvedState:classified.filter((item) => item.classification === 'unsupported-resolved-state').map((item) => item.entry)
        };
        return Object.freeze({
            byRole:Object.freeze({
                source:freezeArray(byRole.source),
                target:freezeArray(byRole.target),
                peer:freezeArray(byRole.peer)
            }),
            byState:Object.freeze({
                resolved:freezeArray(byState.resolved),
                realized:freezeArray(byState.realized),
                notRealized:freezeArray(byState.notRealized),
                unresolved:freezeArray(byState.unresolved),
                inconsistent:freezeArray(byState.inconsistent),
                unsupportedResolvedState:freezeArray(byState.unsupportedResolvedState)
            })
        });
    };

    const determineReadinessStatus = (entries = [], views = buildProfileViews(entries)) => {
        if (!entries.length) return readinessStatuses.NOT_APPLICABLE;
        if (views.byState.inconsistent.length) return readinessStatuses.BLOCKED_INCONSISTENT_EDGE;
        if (views.byState.unsupportedResolvedState.length) return readinessStatuses.BLOCKED_UNSUPPORTED_RESOLVED_STATE;
        if (views.byState.unresolved.length) return readinessStatuses.INCOMPLETE_REALIZATION_COVERAGE;
        return readinessStatuses.READY_FOR_INTERPRETATION;
    };

    const determineInterpretationStatus = (entries = [], readinessStatus = readinessStatuses.NOT_APPLICABLE) => {
        if (!entries.length) return interpretationStatuses.NOT_APPLICABLE;
        if ([
            readinessStatuses.BLOCKED_INCONSISTENT_EDGE,
            readinessStatuses.BLOCKED_UNSUPPORTED_RESOLVED_STATE
        ].includes(readinessStatus)) return interpretationStatuses.BLOCKED_INPUT;
        return interpretationStatuses.UNRESOLVED;
    };

    const buildActorFunctionProfileRecord = (aggregationRecord = {}, index = 0) => {
        const functionEntries = freezeArray((aggregationRecord.interactionInputs || []).map(buildFunctionEntry));
        const profileViews = buildProfileViews(functionEntries);
        const readinessStatus = determineReadinessStatus(functionEntries, profileViews);
        const interpretationStatus = determineInterpretationStatus(functionEntries, readinessStatus);
        const participationKinds = ['source', 'target', 'peer'].filter((kind) => profileViews.byRole[kind].length > 0);

        return Object.freeze({
            id:`VSAFC-${String(index + 1).padStart(2, '0')}`,
            actorKey:aggregationRecord.actorKey || '',
            actorGan:aggregationRecord.actorGan || '',
            upstreamAggregationRecordId:aggregationRecord.id || '',
            functionEntries,
            sourceFunctionEntries:profileViews.byRole.source,
            targetFunctionEntries:profileViews.byRole.target,
            peerFunctionEntries:profileViews.byRole.peer,
            resolvedFunctionEntries:profileViews.byState.resolved,
            realizedFunctionEntries:profileViews.byState.realized,
            notRealizedFunctionEntries:profileViews.byState.notRealized,
            unresolvedFunctionEntries:profileViews.byState.unresolved,
            inconsistentFunctionEntries:profileViews.byState.inconsistent,
            unsupportedResolvedStateEntries:profileViews.byState.unsupportedResolvedState,
            bearingContexts:freezeArray(aggregationRecord.bearingContexts || []),
            participationKinds:freezeArray(participationKinds),
            relationIdentities:freezeArray(unique(functionEntries.map((item) => item.relationIdentity))),
            edgeContextIdentities:freezeArray(unique(functionEntries.map((item) => item.edgeContextIdentity))),
            readinessStatus,
            interpretationStatus,
            actorGlobalEffectiveState:null,
            genericVisibleEffectiveState:null,
            statement:!functionEntries.length
                ? '该 visible stem 当前没有 function input；actor function profile 为 not-applicable。'
                : readinessStatus === readinessStatuses.BLOCKED_INCONSISTENT_EDGE
                    ? 'actor profile 已保留全部 relation edges，但至少一个 edge context 上游状态不一致；composition interpretation 阻断。'
                    : readinessStatus === readinessStatuses.BLOCKED_UNSUPPORTED_RESOLVED_STATE
                        ? 'actor profile 遇到 v0.2 未登记的 resolved realization state；不得把未知状态静默解释为 function realized。'
                        : readinessStatus === readinessStatuses.INCOMPLETE_REALIZATION_COVERAGE
                            ? 'actor profile 已建立，realized、not-realized 与 unresolved relation edges 可并存；realization coverage 未完整时只能保留 profile，不能形成 actor-level interpretation。'
                            : 'actor profile 的已知 relation edges 均已有 v0.2 支持的 realization 结论；realized 与 not-realized 仍保持逐 edge 语义，这些结论如何形成 actor-level interpretation 仍无规则。',
            boundary:'Profile 分桶只是同一组 edge evidence 的不同索引视图，不产生额外证据或重复计力；resolved 不等于 realized，realized / not-realized 都只属于对应 edge；不得从 participation 种类、状态种类或桶内数量推导 actor global state。'
        });
    };

    const buildActorFunctionProfileRecords = (synthesis = {}) => Object.freeze(
        (synthesis.visibleStemActorInteractionAggregationRecords || []).map(buildActorFunctionProfileRecord)
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-CONTRACT',
        claimKey:'visibleStem.actor-function-composition.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_RULE_ID,
        value:Object.freeze({
            actorProfileCentric:true,
            orthogonalParticipationAndRealizationAxes:true,
            resolvedDoesNotMeanRealized:true,
            positiveRealizationStateAcceptedFromUpstream:true,
            positiveRealizationStateInvented:false,
            unknownResolvedStateBlocks:true,
            bearingSeparate:true,
            scalarCollapse:false,
            actorGlobalEffectiveState:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'Actor Interaction Aggregation 已完成 edge-preserving actor view；Composition v0.2 将上游已受控的 realized / not-realized source-context states 都作为正交 profile 内容保存，同时继续冻结 resolved / realized 的语义边界。',
        boundary:'该 Claim 只解决 profile schema 与受支持 realization vocabulary，不解决 actor-level effectiveness mapping。'
    });

    const makeProfileClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-ACTOR-FUNCTION-PROFILE-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.${record.actorKey || index}.actor-function-profile`,
        status:'resolved',
        ruleId:VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_RULE_ID,
        value:Object.freeze({
            participationKinds:freezeArray(record.participationKinds || []),
            readinessStatus:record.readinessStatus,
            interpretationStatus:record.interpretationStatus,
            relationIdentities:freezeArray(record.relationIdentities || []),
            edgeContextIdentities:freezeArray(record.edgeContextIdentities || []),
            actorGlobalEffectiveState:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependencyIds:Object.freeze(['SD-VISIBLE-STEM-ACTOR-INTERACTION-MODEL']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildModelDependency = () => Object.freeze({
        id:'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-MODEL',
        kind:'aggregation',
        scope:'visible-stem-actor-function-profile-contract',
        status:'resolved',
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(['SC-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-CONTRACT']),
        ruleId:VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_RULE_ID,
        dependsOnDependencyIds:Object.freeze(['SD-VISIBLE-STEM-ACTOR-INTERACTION-MODEL']),
        statement:'Actor Function Composition v0.2 已冻结为正交 profile schema：participation role 与 realization state 分轴索引，并显式支持上游受控的 realized-in-source-context / not-realized-in-source-context；同一 edge 不因进入多个视图而增加证据。',
        boundary:'Model resolved 仅表示 profile contract 与已登记 vocabulary 已确定，不表示 edge coverage 或 actor-level interpretation 已完成。'
    });

    const buildProfileInventoryDependency = (records = [], profileClaims = []) => Object.freeze({
        id:'SD-VISIBLE-STEM-ACTOR-FUNCTION-PROFILE-INVENTORY',
        kind:'aggregation',
        scope:'visible-stem-actor-function-profile-inventory',
        status:'resolved',
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(records.length ? profileClaims.map((item) => item.id) : ['SC-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-CONTRACT']),
        ruleId:VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_RULE_ID,
        dependsOnDependencyIds:Object.freeze([
            'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-MODEL',
            'SD-VISIBLE-STEM-ACTOR-INTERACTION-MODEL'
        ]),
        statement:records.length
            ? '所有当前 visible-stem actor 都已建立 function profile；unresolved edge 作为 profile 内容保留，不妨碍 inventory 本身成立。'
            : '本局无可建立的 visible-stem actor profile，inventory 为 not-applicable。',
        boundary:'Inventory resolved 不表示 realization coverage 完整，更不表示 actor effective；它只确认 edge inputs 已被无损组织。'
    });

    const buildReadinessDependency = (records = []) => {
        const blockedOrIncomplete = records.filter((item) => ![
            readinessStatuses.NOT_APPLICABLE,
            readinessStatuses.READY_FOR_INTERPRETATION
        ].includes(item.readinessStatus));
        return Object.freeze({
            id:'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-READINESS',
            kind:'aggregation',
            scope:'visible-stem-actor-function-composition-readiness',
            status:blockedOrIncomplete.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze([]),
            sourceRefs:Object.freeze([]),
            resolvedByClaimIds:Object.freeze([]),
            ruleId:VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_RULE_ID,
            dependsOnDependencyIds:Object.freeze([
                'SD-VISIBLE-STEM-ACTOR-FUNCTION-PROFILE-INVENTORY',
                'SD-VISIBLE-STEM-ACTOR-INTERACTION-COVERAGE'
            ]),
            statement:!records.length
                ? '无 actor profile 需要 composition readiness，当前为 not-applicable。'
                : blockedOrIncomplete.length
                    ? '至少一个 actor profile 含 unresolved、inconsistent 或 v0.2 未支持的 resolved realization state，composition readiness 尚未满足。'
                    : '所有 actor profile 的已知 function edges 均已有 v0.2 支持的 realization 结论，可进入后续 actor-level interpretation。',
            boundary:'Readiness 只检查输入是否可解释；不得把 ready actor 数量、realized / not-realized edge 数量或状态比例换算成 global effectiveness。'
        });
    };

    const buildInterpretationDependency = (records = []) => {
        const actorsWithFunctions = records.filter((item) => item.functionEntries.length > 0);
        return Object.freeze({
            id:'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-INTERPRETATION',
            kind:'effectiveness',
            scope:'visible-stem-actor-function-profile-interpretation',
            status:actorsWithFunctions.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze([]),
            sourceRefs:Object.freeze([]),
            resolvedByClaimIds:Object.freeze(actorsWithFunctions.length ? [] : ['SC-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-CONTRACT']),
            ruleId:VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_RULE_ID,
            dependsOnDependencyIds:Object.freeze(actorsWithFunctions.length
                ? ['SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-READINESS']
                : ['SD-VISIBLE-STEM-ACTOR-FUNCTION-PROFILE-INVENTORY']),
            statement:actorsWithFunctions.length
                ? 'actor function profile 已建立，但目前没有把 source / target / peer 与各 edge realized / not-realized / unresolved 组合为 actor-level semantic state 的传统规则映射。'
                : '无 function inputs 需要 actor-level profile interpretation，当前为 not-applicable。',
            boundary:'不得用 participation 类型、bucket 数量、resolved 比例、bearing 条件、多数、优先级或写入顺序替代 actor-level interpretation rule。'
        });
    };

    const rebuildActorAggregationDependency = (base = {}, interpretationDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION',
            kind:'aggregation',
            scope:'visible-stem-actor-function-composition',
            status:'unresolved',
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                interpretationDependency.id
            ])),
            statement:'Actor Interaction Aggregation 的 edge-preserving 输入已被整理成 Actor Function Profile，但 profile 到 actor-level semantic state 的 interpretation 规则仍未解析。',
            boundary:'Profile schema 完成不能替代 function composition interpretation；不得因此生成 actor global effective / ineffective。'
        });
    };

    const rebuildVisibleEffectivenessDependency = (base = {}, interpretationDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'visible-stem-effects',
            status:'unresolved',
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                interpretationDependency.id
            ])),
            statement:'visible stem 已具 actor function profile，且 profile 可区分 realized / not-realized / unresolved，但 profile interpretation 与 generic Visible Effectiveness mapping 仍未解析。',
            boundary:'任何单一 role、edge realization、bearing context 或 profile completeness 均不得直接生成 generic effective / ineffective。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const records = buildActorFunctionProfileRecords(base);
        const profileClaims = records.map(makeProfileClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...profileClaims]);
        const modelDependency = buildModelDependency();
        const inventoryDependency = buildProfileInventoryDependency(records, profileClaims);
        const readinessDependency = buildReadinessDependency(records);
        const interpretationDependency = buildInterpretationDependency(records);
        const aggregationDependency = rebuildActorAggregationDependency(base, interpretationDependency);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base, interpretationDependency);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION',
            'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-MODEL',
            'SD-VISIBLE-STEM-ACTOR-FUNCTION-PROFILE-INVENTORY',
            'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-READINESS',
            'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-INTERPRETATION'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            aggregationDependency,
            modelDependency,
            inventoryDependency,
            readinessDependency,
            interpretationDependency
        ]);
        const conflicts = typeof priorSynthesisApi?.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi?.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            visibleStemActorFunctionProfileRecords:records,
            visibleStemActorFunctionCompositionRuleIds:Object.freeze([VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_RULE_ID]),
            visibleStemActorFunctionCompositionContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Actor Function Composition v0.2 只建立正交 function profile；source / target / peer 与 realization state 分轴保存。',
                'realized-in-source-context 与 not-realized-in-source-context 均只来自上游已解析 edge；Composition 不自行制造正向 realization。',
                'profile bucket 只是同一 edge evidence 的索引视图，不重复计力；bearing 仍与 function entries 分层。',
                'Actor profile interpretation、Visible Effectiveness 与最终 Strength / Assessment 继续 unresolved。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildVisibleStemActorFunctionProfileRecords:buildActorFunctionProfileRecords
        });
    }

    GuiJia.baziVisibleStemActorFunctionComposition = Object.freeze({
        installed:true,
        VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_VERSION,
        VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_RULE_ID,
        readinessStatuses,
        interpretationStatuses,
        CONTRACT,
        buildFunctionEntry,
        classifyFunctionEntry,
        buildProfileViews,
        determineReadinessStatus,
        determineInterpretationStatus,
        buildActorFunctionProfileRecord,
        buildActorFunctionProfileRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);