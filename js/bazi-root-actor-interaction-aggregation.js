(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziRootActorInteractionAggregation?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const ROOT_ACTOR_INTERACTION_AGGREGATION_VERSION = '0.1';
    const ROOT_ACTOR_INTERACTION_AGGREGATION_RULE_ID = 'BAZI-STRENGTH-ROOT-ACTOR-INTERACTION-AGGREGATION-001';

    const coverageStatuses = Object.freeze({
        NO_RELATED_STRUCTURES:'no-related-structures',
        COMPLETE:'complete',
        PARTIAL:'partial',
        UNRESOLVED:'unresolved'
    });

    const aggregationStatuses = Object.freeze({
        NOT_APPLICABLE:'not-applicable-no-interactions',
        BLOCKED_INCOMPLETE_COVERAGE:'blocked-incomplete-coverage',
        UNRESOLVED_ACTOR_STATE_RULE:'unresolved-actor-state-rule',
        UNRESOLVED_MULTI_INTERACTION_ARBITRATION:'unresolved-multi-interaction-arbitration'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const buildInteractionIndex = (synthesis = {}) => {
        const index = new Map();
        (synthesis.rootClashInteractionEffectRecords || []).forEach((record) => {
            const key = `${record.rootStateId || ''}::${record.structureRef || ''}`;
            if (!index.has(key)) index.set(key, []);
            index.get(key).push(record);
        });
        return index;
    };

    const buildStructureInput = (rootState = {}, structureRef = '', structure = null, interactionIndex = new Map()) => {
        const key = `${rootState.id || ''}::${structureRef}`;
        const matching = interactionIndex.get(key) || [];
        const resolved = matching.find((item) => item.resolutionStatus === 'resolved-interaction-semantics') || null;
        const observed = resolved || matching[0] || null;

        if (!observed) {
            return Object.freeze({
                structureRef,
                relationCode:structure?.code || '',
                relationFamily:structure?.family || structure?.label || '',
                resolver:'unavailable',
                coverageStatus:'unresolved-no-interaction-resolver',
                interactionRecordId:null,
                standingState:null,
                removalState:null,
                harmState:null,
                activationState:null,
                genericEffectiveState:null,
                statement:'该 Structure 已关联 root actor，但当前没有对应的 interaction-level effectiveness resolver。',
                boundary:'关系事实不得因缺少 resolver 而被忽略，也不得以其他已解析 Structure 的结果代替。'
            });
        }

        const isResolved = observed.resolutionStatus === 'resolved-interaction-semantics';
        return Object.freeze({
            structureRef,
            relationCode:structure?.code || '',
            relationFamily:structure?.family || structure?.label || '',
            resolver:'root-six-clash-interaction-semantics',
            coverageStatus:isResolved ? 'resolved-interaction' : 'unresolved-upstream-interaction',
            interactionRecordId:observed.id || null,
            standingState:observed.standingState || null,
            removalState:observed.removalState || null,
            harmState:observed.harmState || null,
            activationState:observed.activationState || null,
            genericEffectiveState:null,
            statement:isResolved
                ? '该 Structure 已有 interaction-level 语义结果，可作为 actor 聚合输入；结果仍保持 Structure-scoped。'
                : '该 Structure 已有 resolver 路径，但上游条件尚未完成，因此 interaction-level 结果仍 unresolved。',
            boundary:'interaction result 只属于当前 Structure；不得单独覆盖 root actor 的全局 effectiveState。'
        });
    };

    const determineCoverageStatus = (inputs = []) => {
        if (!inputs.length) return coverageStatuses.NO_RELATED_STRUCTURES;
        const resolved = inputs.filter((item) => item.coverageStatus === 'resolved-interaction');
        if (resolved.length === inputs.length) return coverageStatuses.COMPLETE;
        if (resolved.length) return coverageStatuses.PARTIAL;
        return coverageStatuses.UNRESOLVED;
    };

    const determineAggregationStatus = (inputs = [], coverageStatus = coverageStatuses.UNRESOLVED) => {
        if (!inputs.length) return aggregationStatuses.NOT_APPLICABLE;
        if (coverageStatus !== coverageStatuses.COMPLETE) return aggregationStatuses.BLOCKED_INCOMPLETE_COVERAGE;
        const resolvedInputs = inputs.filter((item) => item.coverageStatus === 'resolved-interaction');
        if (resolvedInputs.length > 1) return aggregationStatuses.UNRESOLVED_MULTI_INTERACTION_ARBITRATION;
        return aggregationStatuses.UNRESOLVED_ACTOR_STATE_RULE;
    };

    const buildActorAggregationRecords = (semanticModel = {}, synthesis = {}) => {
        const structureMap = new Map((semanticModel.structures || []).map((item) => [item.id, item]));
        const interactionIndex = buildInteractionIndex(synthesis);

        return Object.freeze((synthesis.rootActorStates || []).map((rootState, index) => {
            const relatedStructureRefs = unique(rootState.relatedStructureRefs || []);
            const interactionInputs = relatedStructureRefs.map((structureRef) =>
                buildStructureInput(rootState, structureRef, structureMap.get(structureRef) || null, interactionIndex)
            );
            const coverageStatus = determineCoverageStatus(interactionInputs);
            const aggregationStatus = determineAggregationStatus(interactionInputs, coverageStatus);
            const unresolvedStructureRefs = interactionInputs
                .filter((item) => item.coverageStatus !== 'resolved-interaction')
                .map((item) => item.structureRef);
            const resolvedInteractionRecordIds = interactionInputs
                .filter((item) => item.coverageStatus === 'resolved-interaction')
                .map((item) => item.interactionRecordId);

            return Object.freeze({
                id:`RIA-${String(index + 1).padStart(2, '0')}`,
                rootStateId:rootState.id || '',
                actorKey:rootState.actorKey || '',
                rootRole:rootState.rootRole || '',
                pillarIndex:rootState.pillarIndex,
                position:rootState.position || '',
                zhi:rootState.zhi || '',
                gan:rootState.gan || '',
                presence:rootState.presence || 'present',
                relatedStructureRefs:freezeArray(relatedStructureRefs),
                interactionInputs:Object.freeze(interactionInputs),
                coverageStatus,
                aggregationStatus,
                baselineEffectivenessStatus:'unresolved',
                actorEffectiveState:null,
                resolvedInteractionRecordIds:freezeArray(resolvedInteractionRecordIds),
                unresolvedStructureRefs:freezeArray(unresolvedStructureRefs),
                sourceEffectIds:freezeArray(rootState.sourceEffectIds || []),
                statement:!interactionInputs.length
                    ? '该 root actor 当前没有直接关联 Structure；interaction aggregation 在本 actor 上为 not-applicable，但“无交互”不等于 actor 已有效。'
                    : unresolvedStructureRefs.length
                        ? '该 root actor 的 Structure interaction coverage 尚未完整，至少一个关系仍缺少 resolver 或上游条件未完成，因此不能进入 actor-level state 汇总。'
                        : resolvedInteractionRecordIds.length > 1
                            ? '该 root actor 的相关 Structure interaction 已全部有结果，但存在多个独立交互输入；当前没有跨 Structure 仲裁规则，actor-level state 保持 unresolved。'
                            : '该 root actor 的相关 Structure interaction 已有完整输入，但 interaction result → actor global effectiveState 的规则尚未建立。',
                boundary:'Coverage、Aggregation 与 Baseline Effectiveness 是不同问题；不得以 Structure 数量、已解析结果数量、多数表决或顺序覆盖生成 actorEffectiveState。'
            });
        }));
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-ROOT-ACTOR-INTERACTION-AGGREGATION-CONTRACT',
        claimKey:'root.actor.interaction-aggregation-contract',
        status:'resolved',
        ruleId:ROOT_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
        value:Object.freeze({
            groupingLevel:'root-actor',
            groupingKey:'rootStateId/actorKey',
            inputLevel:'structure-scoped-interaction-results',
            coverageBeforeAggregation:true,
            unresolvedStructureBlocksActorState:true,
            noRelatedStructureImpliesEffective:false,
            multiInteractionRequiresArbitrationRule:true,
            numericAggregation:false,
            majorityVoting:false,
            orderOverwrite:false,
            emitsActorEffectiveState:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'GuiJia 已将根的存在、Structure 关系与 interaction-level 结果分层。本合同只定义这些 interaction result 如何按同一 root actor 收集并检查覆盖完整性，不新增传统命理结论。',
        boundary:'本合同属于项目内部形式化，不把任何 Structure 自动解释为增强、削弱、失效，也不生成最终身强弱。'
    });

    const makeActorCoverageClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-ROOT-ACTOR-INTERACTION-COVERAGE-${String(index + 1).padStart(2, '0')}`,
        claimKey:`root.actor.${record.rootStateId || index}.interaction-coverage`,
        status:[coverageStatuses.COMPLETE, coverageStatuses.NO_RELATED_STRUCTURES].includes(record.coverageStatus) ? 'resolved' : 'blocked',
        ruleId:ROOT_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
        value:Object.freeze({
            coverageStatus:record.coverageStatus,
            aggregationStatus:record.aggregationStatus,
            actorEffectiveState:null
        }),
        sourceEffectIds:freezeArray(record.sourceEffectIds || []),
        sourceRefs:freezeArray(record.relatedStructureRefs || []),
        dependencyIds:Object.freeze(['SD-ROOT-ACTOR-INTERACTION-COVERAGE']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildCoverageDependency = (records = [], claimIds = []) => {
        const unresolved = records.filter((item) => ![
            coverageStatuses.COMPLETE,
            coverageStatuses.NO_RELATED_STRUCTURES
        ].includes(item.coverageStatus));
        return Object.freeze({
            id:'SD-ROOT-ACTOR-INTERACTION-COVERAGE',
            kind:'interaction',
            scope:'root-actor-structure-interaction-coverage',
            status:records.length ? (unresolved.length ? 'unresolved' : 'resolved') : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze(unique(records.flatMap((item) => item.relatedStructureRefs || []))),
            resolvedByClaimIds:Object.freeze(records.length && !unresolved.length ? claimIds : (!records.length ? ['SC-ROOT-ACTOR-INTERACTION-AGGREGATION-CONTRACT'] : [])),
            ruleId:ROOT_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
            statement:!records.length
                ? '本局没有 root actor，interaction coverage 为 not-applicable。'
                : unresolved.length
                    ? '至少一个 root actor 的关联 Structure 尚无完整 interaction-level 结果，因此 actor interaction coverage 未完成。'
                    : '所有 root actor 的关联 Structure 均已有完整 interaction-level 结果，或该 actor 当前没有关联 Structure。',
            boundary:'Coverage resolved 只表示输入完整，不表示 actor effectiveState 已能判断。'
        });
    };

    const buildAggregationDependency = (records = []) => {
        const needsAggregation = records.filter((item) => item.relatedStructureRefs.length > 0);
        return Object.freeze({
            id:'SD-ROOT-ACTOR-INTERACTION-AGGREGATION',
            kind:'aggregation',
            scope:'root-actor-interaction-results',
            status:needsAggregation.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze(unique(records.flatMap((item) => item.relatedStructureRefs || []))),
            resolvedByClaimIds:Object.freeze(needsAggregation.length ? [] : ['SC-ROOT-ACTOR-INTERACTION-AGGREGATION-CONTRACT']),
            ruleId:ROOT_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
            dependsOnDependencyIds:Object.freeze(needsAggregation.length ? ['SD-ROOT-ACTOR-INTERACTION-COVERAGE'] : []),
            statement:needsAggregation.length
                ? '一个或以上 root actor 存在 Structure interaction 输入，但当前没有跨 Structure / 跨 interaction 的 actor-level 聚合与仲裁规则。'
                : '当前没有 root actor interaction 需要跨 Structure 汇总，Aggregation 为 not-applicable。',
            boundary:'不得使用数量、多数、固定优先级或最后写入覆盖前值的方式替代独立聚合规则。'
        });
    };

    const buildBaselineDependency = (records = []) => Object.freeze({
        id:'SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS',
        kind:'effectiveness',
        scope:'root-actor-baseline-effectiveness',
        status:records.length ? 'unresolved' : 'resolved',
        sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-ROOT-ACTOR-INTERACTION-AGGREGATION-CONTRACT']),
        ruleId:ROOT_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
        statement:records.length
            ? 'root actor 的存在已经确认，但“有根”在没有或尚未完成 Structure interaction 时如何形成 baseline actual effectiveness，当前仍无独立规则。'
            : '本局没有 root actor，baseline effectiveness 为 not-applicable。',
        boundary:'不得把“没有冲合刑害破”或“没有关联 Structure”直接等同于 effective。'
    });

    const rebuildRootEffectivenessDependency = (base = {}, records = []) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-ROOT-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-ROOT-EFFECTIVENESS',
            status:records.length ? 'unresolved' : (current.status || 'resolved'),
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-ROOT-ACTOR-INTERACTION-COVERAGE',
                'SD-ROOT-ACTOR-INTERACTION-AGGREGATION',
                'SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS'
            ])),
            statement:records.length
                ? 'root actor 已进入 actor-level effectiveness 管线；interaction coverage、interaction aggregation 与 baseline effectiveness 尚未全部建立，因此 Root Effectiveness 继续 unresolved。'
                : (current.statement || '本局未见 root actor，Root Effectiveness 为 not-applicable。'),
            boundary:'Root Effectiveness 只能由 actor-level 规则解析；任何单一 Structure interaction result 均不得直接覆盖全局根状态。'
        });
    };

    const rebuildClashMappingDependency = (base = {}, records = []) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING');
        if (!current) return null;
        const hasResolvedClashInput = records.some((record) => record.interactionInputs.some((item) =>
            item.resolver === 'root-six-clash-interaction-semantics' && item.coverageStatus === 'resolved-interaction'
        ));
        return Object.freeze({
            ...current,
            status:hasResolvedClashInput ? 'unresolved' : current.status,
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-ROOT-ACTOR-INTERACTION-AGGREGATION',
                'SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS'
            ])),
            statement:hasResolvedClashInput
                ? '六冲 interaction semantics 已成为 root actor aggregation 的 Structure-scoped 输入；actor global effectiveState 仍须经过完整 interaction coverage、跨 Structure 聚合与 baseline effectiveness。'
                : current.statement,
            boundary:'六冲 interaction 的 cannot-stand/removable/unharmed/stimulated 均不得越过 actor aggregation 直接生成 effective / ineffective。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({
                ...base,
                rootActorInteractionAggregationRecords:Object.freeze([]),
                rootActorInteractionAggregationRuleIds:Object.freeze([])
            });
        }

        const records = buildActorAggregationRecords(semanticModel, base);
        const actorClaims = records.map((record, index) => makeActorCoverageClaim(record, index));
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...actorClaims]);
        const coverageDependency = buildCoverageDependency(records, actorClaims.filter((item) => item.status === 'resolved').map((item) => item.id));
        const aggregationDependency = buildAggregationDependency(records);
        const baselineDependency = buildBaselineDependency(records);
        const rootEffectivenessDependency = rebuildRootEffectivenessDependency(base, records);
        const clashMappingDependency = rebuildClashMappingDependency(base, records);
        const replacedIds = new Set([
            'SD-ROOT-EFFECTIVENESS',
            'SD-ROOT-ACTOR-INTERACTION-COVERAGE',
            'SD-ROOT-ACTOR-INTERACTION-AGGREGATION',
            'SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS'
        ]);
        if (clashMappingDependency) replacedIds.add('SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING');

        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            rootEffectivenessDependency,
            coverageDependency,
            aggregationDependency,
            baselineDependency,
            ...(clashMappingDependency ? [clashMappingDependency] : [])
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
            rootActorInteractionAggregationRecords:records,
            rootActorInteractionAggregationRuleIds:Object.freeze([ROOT_ACTOR_INTERACTION_AGGREGATION_RULE_ID]),
            rootActorInteractionAggregationContract:Object.freeze({
                version:ROOT_ACTOR_INTERACTION_AGGREGATION_VERSION,
                groupingLevel:'root-actor',
                coverageRequired:true,
                aggregationRuleStatus:'unresolved',
                baselineEffectivenessRuleStatus:'unresolved',
                actorGlobalEffectiveStateMapping:'unresolved',
                finalStrengthMapping:false
            }),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Root Actor Interaction Aggregation 先检查每个相关 Structure 是否有 resolver，再讨论跨 Structure 汇总；未覆盖的关系不得被忽略。',
                '同一 root actor 的多个 interaction result 不得按数量、多数、固定优先级或写入顺序自动仲裁。',
                'root actor 没有关联 Structure 也不自动等于 effective；Baseline Effectiveness 必须另立规则。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        const wrappedBuildStrengthSynthesis = (semanticModel = {}) =>
            extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel));
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:wrappedBuildStrengthSynthesis,
            buildRootActorInteractionAggregationRecords:buildActorAggregationRecords
        });
    }

    GuiJia.baziRootActorInteractionAggregation = Object.freeze({
        installed:true,
        ROOT_ACTOR_INTERACTION_AGGREGATION_VERSION,
        ROOT_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
        coverageStatuses,
        aggregationStatuses,
        buildStructureInput,
        buildActorAggregationRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
