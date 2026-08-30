(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemActorInteractionAggregation?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_VERSION = '0.1';
    const VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION-001';

    const coverageStatuses = Object.freeze({
        NO_FUNCTION_EDGES:'no-function-edges',
        COMPLETE:'complete',
        PARTIAL:'partial',
        UNRESOLVED:'unresolved',
        INCONSISTENT:'inconsistent-upstream-edge-context'
    });

    const aggregationStatuses = Object.freeze({
        NOT_APPLICABLE:'not-applicable-no-function-edges',
        BLOCKED_INCOMPLETE_COVERAGE:'blocked-incomplete-realization-coverage',
        BLOCKED_INCONSISTENT_EDGE:'blocked-inconsistent-edge-context',
        UNRESOLVED_ACTOR_FUNCTION_COMPOSITION:'unresolved-actor-function-composition'
    });

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION-CONTRACT-001',
        version:VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_VERSION,
        recordLevel:'visible-stem-actor-function-interaction-aggregation',
        actorCentric:true,
        edgeIdentityBeforeAggregation:true,
        relationIdentitySeparateFromSourceContextIdentity:true,
        preservesSourceTargetPeerParticipation:true,
        unresolvedEdgeIsNotFailure:true,
        bearingContextSeparateFromFunctionResult:true,
        exactDuplicateContextsMayCoalesce:true,
        differingSourceContextsMustRemainSeparate:true,
        actorGlobalEffectiveState:false,
        numericAggregation:false,
        majorityVoting:false,
        priorityAggregation:false,
        orderOverwrite:false,
        finalStrengthMapping:false,
        statement:'本层把同一 visible stem 参与的 relation-edge realization 按 actor 汇总，并先以 relationIdentity 与 edgeContextIdentity 保留真实作用边界；只检查 actor 的 realization coverage 与后续 composition blocker，不生成 actor global effectiveState。',
        boundary:'source / target / peer participation 不得因 actor-centric 汇总而改向；unresolved edge 不得视为失败；bearing context 仍是条件；不同 source context 不得合并，多个 edge 不得按数量、多数、优先级或写入顺序压成单一 actor 状态。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const participantRoleForActor = (record = {}, actorKey = '') => {
        if (!record || !actorKey) return null;
        if (record.directed === false) {
            return (record.peerParticipantActorKeys || []).includes(actorKey) ? 'peer' : null;
        }
        if (record.sourceActorKey === actorKey) return 'source';
        if (record.targetActorKey === actorKey) return 'target';
        return null;
    };

    const counterpartyActorKeysFor = (record = {}, actorKey = '') => {
        if (record.directed === false) {
            return freezeArray((record.peerParticipantActorKeys || []).filter((item) => item !== actorKey));
        }
        if (record.sourceActorKey === actorKey) return freezeArray([record.targetActorKey].filter(Boolean));
        if (record.targetActorKey === actorKey) return freezeArray([record.sourceActorKey].filter(Boolean));
        return Object.freeze([]);
    };

    const buildRelationIdentity = (record = {}) => {
        const scope = record.relationScope || 'unknown-scope';
        const functionKey = record.functionType || record.relationFromDayMaster || 'unknown-function';
        if (record.directed === false) {
            const participants = [...(record.peerParticipantActorKeys || [])].filter(Boolean).sort();
            return `${scope}|peer|${participants.join('&')}|${functionKey}`;
        }
        return `${scope}|directed|${record.sourceActorKey || '?'}>${record.targetActorKey || '?'}|${functionKey}`;
    };

    const buildEdgeContextIdentity = (record = {}) => {
        const relationIdentity = buildRelationIdentity(record);
        const contextKey = record.sourcePatternId
            || record.reachabilityRecordId
            || record.upstreamDirectedFunctionRecordId
            || record.id
            || 'unknown-context';
        return `${relationIdentity}|context:${contextKey}`;
    };

    const buildRawActorInput = (record = {}, actorKey = '') => {
        const participationRole = participantRoleForActor(record, actorKey);
        if (!participationRole) return null;
        return {
            relationIdentity:buildRelationIdentity(record),
            edgeContextIdentity:buildEdgeContextIdentity(record),
            participationRole,
            counterpartyActorKeys:counterpartyActorKeysFor(record, actorKey),
            relationScope:record.relationScope || '',
            directed:record.directed,
            functionType:record.functionType || null,
            relationFromDayMaster:record.relationFromDayMaster || null,
            flow:record.flow || null,
            strengthMeaning:record.strengthMeaning || null,
            sourceActorKey:record.sourceActorKey || null,
            targetActorKey:record.targetActorKey || null,
            peerParticipantActorKeys:freezeArray(record.peerParticipantActorKeys || []),
            realizationRecordIds:freezeArray([record.id].filter(Boolean)),
            realizationStates:freezeArray([record.realizationState].filter(Boolean)),
            resolutionStatuses:freezeArray([record.resolutionStatus].filter(Boolean)),
            sourcePatternIds:freezeArray([record.sourcePatternId].filter(Boolean)),
            reachabilityRecordIds:freezeArray([record.reachabilityRecordId].filter(Boolean)),
            upstreamDirectedFunctionRecordIds:freezeArray([record.upstreamDirectedFunctionRecordId].filter(Boolean)),
            contextConditionRecordIds:freezeArray(record.contextConditionRecordIds || [])
        };
    };

    const mergeSameEdgeContextInputs = (inputs = []) => {
        const grouped = new Map();
        inputs.filter(Boolean).forEach((input) => {
            if (!grouped.has(input.edgeContextIdentity)) grouped.set(input.edgeContextIdentity, []);
            grouped.get(input.edgeContextIdentity).push(input);
        });

        return Object.freeze([...grouped.values()].map((group) => {
            const first = group[0];
            const realizationStates = unique(group.flatMap((item) => item.realizationStates || []));
            const resolutionStatuses = unique(group.flatMap((item) => item.resolutionStatuses || []));
            const inconsistent = realizationStates.length > 1;
            const allResolved = !inconsistent
                && resolutionStatuses.length > 0
                && resolutionStatuses.every((item) => String(item).startsWith('resolved-'));
            return Object.freeze({
                relationIdentity:first.relationIdentity,
                edgeContextIdentity:first.edgeContextIdentity,
                participationRole:first.participationRole,
                counterpartyActorKeys:freezeArray(unique(group.flatMap((item) => item.counterpartyActorKeys || []))),
                relationScope:first.relationScope,
                directed:first.directed,
                functionType:first.functionType,
                relationFromDayMaster:first.relationFromDayMaster,
                flow:first.flow,
                strengthMeaning:first.strengthMeaning,
                sourceActorKey:first.sourceActorKey,
                targetActorKey:first.targetActorKey,
                peerParticipantActorKeys:freezeArray(first.peerParticipantActorKeys || []),
                realizationRecordIds:freezeArray(unique(group.flatMap((item) => item.realizationRecordIds || []))),
                realizationStates:freezeArray(realizationStates),
                resolutionStatuses:freezeArray(resolutionStatuses),
                sourcePatternIds:freezeArray(unique(group.flatMap((item) => item.sourcePatternIds || []))),
                reachabilityRecordIds:freezeArray(unique(group.flatMap((item) => item.reachabilityRecordIds || []))),
                upstreamDirectedFunctionRecordIds:freezeArray(unique(group.flatMap((item) => item.upstreamDirectedFunctionRecordIds || []))),
                contextConditionRecordIds:freezeArray(unique(group.flatMap((item) => item.contextConditionRecordIds || []))),
                consistencyStatus:inconsistent ? 'inconsistent-realization-state' : 'consistent',
                resolutionCoverageStatus:inconsistent ? 'inconsistent' : (allResolved ? 'resolved' : 'unresolved'),
                realizationState:realizationStates.length === 1 ? realizationStates[0] : null,
                statement:inconsistent
                    ? '同一 edge context 出现互不一致的 realization state；不得按顺序覆盖，actor aggregation 在该 edge 上阻断。'
                    : allResolved
                        ? '该 edge context 已有明确 realization 结果，可作为 actor interaction input 保留。'
                        : '该 edge context 尚无完整 realization 结果，必须原样保留 unresolved。',
                boundary:'同一 edge context 的重复记录只可做无损合并；不同 source context 不得合并，unresolved 不得解释为 function failure。'
            });
        }));
    };

    const buildActorInteractionInputs = (actorKey = '', synthesis = {}) => mergeSameEdgeContextInputs(
        (synthesis.visibleStemFunctionRealizationRecords || [])
            .map((record) => buildRawActorInput(record, actorKey))
            .filter(Boolean)
    );

    const determineCoverageStatus = (inputs = []) => {
        if (!inputs.length) return coverageStatuses.NO_FUNCTION_EDGES;
        if (inputs.some((item) => item.resolutionCoverageStatus === 'inconsistent')) return coverageStatuses.INCONSISTENT;
        const resolved = inputs.filter((item) => item.resolutionCoverageStatus === 'resolved');
        if (resolved.length === inputs.length) return coverageStatuses.COMPLETE;
        if (resolved.length) return coverageStatuses.PARTIAL;
        return coverageStatuses.UNRESOLVED;
    };

    const determineAggregationStatus = (inputs = [], coverageStatus = coverageStatuses.UNRESOLVED) => {
        if (!inputs.length) return aggregationStatuses.NOT_APPLICABLE;
        if (coverageStatus === coverageStatuses.INCONSISTENT) return aggregationStatuses.BLOCKED_INCONSISTENT_EDGE;
        if (coverageStatus !== coverageStatuses.COMPLETE) return aggregationStatuses.BLOCKED_INCOMPLETE_COVERAGE;
        return aggregationStatuses.UNRESOLVED_ACTOR_FUNCTION_COMPOSITION;
    };

    const buildActorAggregationRecords = (synthesis = {}) => Object.freeze(
        (synthesis.visibleStemFunctionCoverageRecords || []).map((coverageRecord, index) => {
            const actorKey = coverageRecord.actorKey || '';
            const interactionInputs = buildActorInteractionInputs(actorKey, synthesis);
            const coverageStatus = determineCoverageStatus(interactionInputs);
            const aggregationStatus = determineAggregationStatus(interactionInputs, coverageStatus);
            const resolvedEdgeContextIds = interactionInputs
                .filter((item) => item.resolutionCoverageStatus === 'resolved')
                .map((item) => item.edgeContextIdentity);
            const unresolvedEdgeContextIds = interactionInputs
                .filter((item) => item.resolutionCoverageStatus !== 'resolved')
                .map((item) => item.edgeContextIdentity);
            const relationIdentities = unique(interactionInputs.map((item) => item.relationIdentity));

            return Object.freeze({
                id:`VSAA-${String(index + 1).padStart(2, '0')}`,
                actorKey,
                actorGan:coverageRecord.actorGan || '',
                upstreamCoverageRecordId:coverageRecord.id || '',
                interactionInputs,
                relationIdentities:freezeArray(relationIdentities),
                edgeContextIdentities:freezeArray(interactionInputs.map((item) => item.edgeContextIdentity)),
                resolvedEdgeContextIds:freezeArray(resolvedEdgeContextIds),
                unresolvedEdgeContextIds:freezeArray(unresolvedEdgeContextIds),
                bearingContexts:freezeArray(coverageRecord.bearingContexts || []),
                coverageStatus,
                aggregationStatus,
                actorGlobalEffectiveState:null,
                genericVisibleEffectiveState:null,
                statement:!interactionInputs.length
                    ? '该 visible stem 当前没有 function edge；actor interaction aggregation 为 not-applicable，但不能因此推导 effective。'
                    : coverageStatus === coverageStatuses.INCONSISTENT
                        ? '该 visible stem 至少一个 edge context 出现不一致上游 realization，禁止顺序覆盖并阻断 actor-level composition。'
                        : coverageStatus !== coverageStatuses.COMPLETE
                            ? '该 visible stem 的 relation edges 已按真实 participation 汇总，但仍有 unresolved realization；已解析与未解析 edge 必须并存，不能相互覆盖。'
                            : '该 visible stem 的已知 relation-edge realization coverage 已完整，但 edge results 如何组合成 actor-level state 尚无规则。',
                boundary:'Actor Interaction Aggregation 只保存并检查 edge inputs；bearing context 不属于独立 function result；不得使用 edge 数量、resolved 数量、多数、优先级或顺序覆盖生成 actorGlobalEffectiveState。'
            });
        })
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION-CONTRACT',
        claimKey:'visibleStem.actor-interaction-aggregation.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
        value:Object.freeze({
            actorCentric:true,
            edgeIdentityBeforeAggregation:true,
            preservesParticipationRole:true,
            sourceContextIdentitySeparate:true,
            unresolvedEdgeIsNotFailure:true,
            actorGlobalEffectiveState:false,
            numericAggregation:false,
            majorityVoting:false,
            priorityAggregation:false,
            orderOverwrite:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'Function Realization 已经按 relation edge 保存具体结果；进入 actor-level 阶段前必须先把同一 visible stem 的 source / target / peer edges 无损归档，并显式保留 source context 与 unresolved edge。',
        boundary:'该 Claim 只冻结 aggregation input contract，不新增传统命理判断，也不解决 actor function composition。'
    });

    const makeActorInventoryClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-ACTOR-INTERACTION-INVENTORY-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.${record.actorKey || index}.actor-interaction-inventory`,
        status:record.coverageStatus === coverageStatuses.INCONSISTENT ? 'blocked' : 'resolved',
        ruleId:VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
        value:Object.freeze({
            coverageStatus:record.coverageStatus,
            aggregationStatus:record.aggregationStatus,
            relationIdentities:freezeArray(record.relationIdentities || []),
            edgeContextIdentities:freezeArray(record.edgeContextIdentities || []),
            actorGlobalEffectiveState:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependencyIds:Object.freeze([]),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildModelDependency = () => Object.freeze({
        id:'SD-VISIBLE-STEM-ACTOR-INTERACTION-MODEL',
        kind:'aggregation',
        scope:'visible-stem-actor-edge-preserving-aggregation-contract',
        status:'resolved',
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(['SC-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION-CONTRACT']),
        ruleId:VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
        dependsOnDependencyIds:Object.freeze(['SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL']),
        statement:'Visible Stem Actor Interaction Aggregation 已冻结为 edge-preserving actor view：先区分 relation identity 与 source-context edge identity，再讨论 actor-level composition。',
        boundary:'模型已解析不表示 realization coverage 完整，也不表示 actor-level effectiveness 可判断。'
    });

    const buildCoverageDependency = (records = [], claims = []) => {
        const unresolved = records.filter((item) => ![
            coverageStatuses.COMPLETE,
            coverageStatuses.NO_FUNCTION_EDGES
        ].includes(item.coverageStatus));
        return Object.freeze({
            id:'SD-VISIBLE-STEM-ACTOR-INTERACTION-COVERAGE',
            kind:'aggregation',
            scope:'visible-stem-actor-realization-coverage',
            status:unresolved.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze([]),
            sourceRefs:Object.freeze([]),
            resolvedByClaimIds:Object.freeze(unresolved.length
                ? []
                : (records.length ? claims.filter((item) => item.status === 'resolved').map((item) => item.id) : ['SC-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION-CONTRACT'])),
            ruleId:VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
            dependsOnDependencyIds:Object.freeze([
                'SD-VISIBLE-STEM-ACTOR-INTERACTION-MODEL',
                'SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE'
            ]),
            statement:!records.length
                ? '本局无非日主 visible stem，actor interaction coverage 为 not-applicable。'
                : unresolved.length
                    ? '至少一个 visible stem 同时保留 unresolved / partial / inconsistent relation-edge realization，actor-level coverage 尚未完成。'
                    : '所有 visible stem 的已知 relation-edge realization coverage 已完整，或该 actor 没有 function edge。',
            boundary:'Coverage 只检查 edge realization 是否齐备且一致；不得把 complete 数量、resolved 数量或某一 edge 的结果转成 actor global state。'
        });
    };

    const buildAggregationDependency = (records = []) => {
        const actorsNeedingComposition = records.filter((item) => item.interactionInputs.length > 0);
        return Object.freeze({
            id:'SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION',
            kind:'aggregation',
            scope:'visible-stem-actor-function-composition',
            status:actorsNeedingComposition.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze([]),
            sourceRefs:Object.freeze([]),
            resolvedByClaimIds:Object.freeze(actorsNeedingComposition.length ? [] : ['SC-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION-CONTRACT']),
            ruleId:VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
            dependsOnDependencyIds:Object.freeze(actorsNeedingComposition.length
                ? ['SD-VISIBLE-STEM-ACTOR-INTERACTION-COVERAGE']
                : ['SD-VISIBLE-STEM-ACTOR-INTERACTION-MODEL']),
            statement:actorsNeedingComposition.length
                ? '一个或以上 visible stem 存在 relation-edge realization inputs，但当前没有把 source / target / peer 以及不同 function result 组合为 actor-level effectiveness 的规则。'
                : '当前没有 visible-stem function edge 需要 actor-level composition，Aggregation 为 not-applicable。',
            boundary:'不得以 edge 数量、多数、固定优先级、resolved 比例、bearing 条件或最后写入结果替代 actor function composition rule。'
        });
    };

    const rebuildVisibleEffectivenessDependency = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'visible-stem-effects',
            status:'unresolved',
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-VISIBLE-STEM-ACTOR-INTERACTION-COVERAGE',
                'SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION'
            ])),
            statement:'visible stem 的 relation-edge realization 已进入 actor-centric aggregation 管线，但 realization coverage 与 actor function composition 尚未全部解析，因此 Visible Effectiveness 继续 unresolved。',
            boundary:'任何单一 edge result、bearing condition 或 actor inventory completeness 均不得直接生成 generic effective / ineffective。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const records = buildActorAggregationRecords(base);
        const actorClaims = records.map(makeActorInventoryClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...actorClaims]);
        const modelDependency = buildModelDependency();
        const coverageDependency = buildCoverageDependency(records, actorClaims);
        const aggregationDependency = buildAggregationDependency(records);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-ACTOR-INTERACTION-MODEL',
            'SD-VISIBLE-STEM-ACTOR-INTERACTION-COVERAGE',
            'SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            modelDependency,
            coverageDependency,
            aggregationDependency
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
            visibleStemActorInteractionAggregationRecords:records,
            visibleStemActorInteractionAggregationRuleIds:Object.freeze([VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_RULE_ID]),
            visibleStemActorInteractionAggregationContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Visible Stem Actor Interaction Aggregation 按 relation edge 与 source context 无损归档同一 actor 的 source / target / peer inputs。',
                'resolved、not-realized 与 unresolved edge 可以同时存在于同一 actor；任何一条都不得覆盖其他 edge。',
                'bearing contexts 仍与 function results 分层；actor-level composition 当前保持 unresolved，不生成 global effective / ineffective。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildVisibleStemActorInteractionAggregationRecords:buildActorAggregationRecords
        });
    }

    GuiJia.baziVisibleStemActorInteractionAggregation = Object.freeze({
        installed:true,
        VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_VERSION,
        VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_RULE_ID,
        coverageStatuses,
        aggregationStatuses,
        CONTRACT,
        participantRoleForActor,
        counterpartyActorKeysFor,
        buildRelationIdentity,
        buildEdgeContextIdentity,
        buildRawActorInput,
        mergeSameEdgeContextInputs,
        buildActorInteractionInputs,
        determineCoverageStatus,
        determineAggregationStatus,
        buildActorAggregationRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
