(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemFunctionRealization?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const VISIBLE_STEM_FUNCTION_REALIZATION_VERSION = '0.1';
    const VISIBLE_STEM_FUNCTION_REALIZATION_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-FUNCTION-REALIZATION-001';

    const realizationStates = Object.freeze({
        NOT_REALIZED_IN_SOURCE_CONTEXT:'not-realized-in-source-context',
        UNRESOLVED:'unresolved'
    });

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-FUNCTION-REALIZATION-CONTRACT-001',
        version:VISIBLE_STEM_FUNCTION_REALIZATION_VERSION,
        recordLevel:'relation-edge-specific-function-realization',
        edgeCentric:true,
        targetSpecific:true,
        sourceReachabilityUnavailableMeansFunctionNotRealizedInThatSourceContext:true,
        functionalAvailabilityAloneDoesNotResolveFunction:true,
        peerNeedsDedicatedResolver:true,
        dayMasterRelatedReachabilityResolver:'unresolved',
        actorGlobalEffectiveState:false,
        numericAggregation:false,
        priorityAggregation:false,
        finalStrengthMapping:false,
        statement:'Function Realization 只对具体 relation edge 回答“这一条作用在当前证据下是否已兑现”。已有 exact-source reachability 明确为 unavailable 时，可解析为该 source context 下 function 未兑现；没有 target-specific 证据的 day-master relation 与 peer relation 保持 unresolved。',
        boundary:'bearing-supported / impaired / functionally-unavailable-in-context 不能单独替代 target-specific realization；某条 cross-actor function 未兑现也不能升级为该 actor 全局 ineffective。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const coverageByActor = (synthesis = {}) => new Map(
        (synthesis.visibleStemFunctionCoverageRecords || []).map((item) => [item.actorKey, item])
    );

    const findReachabilityMatch = (synthesis = {}, sourceActorKey = '', targetActorKey = '', functionType = '') =>
        (synthesis.visibleStemFunctionReachabilityRecords || []).find((item) =>
            item.actorKey === sourceActorKey
            && item.targetKey === targetActorKey
            && item.functionType === functionType
        ) || null;

    const bearingConditionIdsForActors = (synthesis = {}, actorKeys = []) => {
        const coverageMap = coverageByActor(synthesis);
        return freezeArray(unique(actorKeys.flatMap((actorKey) =>
            (coverageMap.get(actorKey)?.bearingContexts || []).map((item) => item.functionalAvailabilityRecordId)
        )));
    };

    const buildDayMasterRelationRecord = (directedRecord = {}, synthesis = {}, index = 0) => {
        const isPeer = directedRecord.directed === false;
        const actorKeys = isPeer
            ? (directedRecord.peerParticipants || []).map((item) => item.actorKey)
            : [directedRecord.sourceActor?.actorKey, directedRecord.targetActor?.actorKey];
        const base = {
            id:`VSFRZ-DM-${String(index + 1).padStart(2, '0')}`,
            relationScope:'daymaster-related',
            upstreamDirectedFunctionRecordId:directedRecord.id || '',
            sourcePatternId:null,
            relationFromDayMaster:directedRecord.relationFromDayMaster || '',
            flow:directedRecord.flow || null,
            functionType:directedRecord.functionType || null,
            strengthMeaning:directedRecord.strengthMeaning || null,
            directed:directedRecord.directed,
            sourceActorKey:directedRecord.sourceActor?.actorKey || null,
            targetActorKey:directedRecord.targetActor?.actorKey || null,
            peerParticipantActorKeys:freezeArray((directedRecord.peerParticipants || []).map((item) => item.actorKey)),
            participantActorKeys:freezeArray(unique(actorKeys)),
            reachabilityRecordId:null,
            reachabilityState:null,
            contextConditionRecordIds:bearingConditionIdsForActors(synthesis, actorKeys),
            realizationState:realizationStates.UNRESOLVED,
            resolutionStatus:isPeer ? 'unresolved-peer-realization' : 'unresolved-daymaster-function-realization',
            actorGlobalEffectiveState:null,
            genericVisibleEffectiveState:null,
            statement:isPeer
                ? 'peer relation 已建立 participant pair，但尚无独立 peer realization resolver。'
                : 'day-master-related directed function 已建立 source/target，但尚无 target-specific reachability / realization 证据。',
            boundary:'关系方向或 peer 关系存在不等于作用已兑现；bearing context 只能作为条件记录，不能代替 target-specific realization。'
        };

        if (isPeer || !base.sourceActorKey || !base.targetActorKey || !base.functionType) {
            return Object.freeze(base);
        }

        const matched = findReachabilityMatch(
            synthesis,
            base.sourceActorKey,
            base.targetActorKey,
            base.functionType
        );
        if (!matched) return Object.freeze(base);

        if (matched.reachabilityState === 'unavailable-in-source-context') {
            return Object.freeze({
                ...base,
                sourcePatternId:matched.sourcePatternId || null,
                reachabilityRecordId:matched.id,
                reachabilityState:matched.reachabilityState,
                realizationState:realizationStates.NOT_REALIZED_IN_SOURCE_CONTEXT,
                resolutionStatus:'resolved-source-function-not-realized',
                statement:'命中 target-specific source reachability，当前 relation edge 在该 source context 下 function 未兑现。',
                boundary:'这里只解析这一条 source→target function；不得外推为 source actor 全局 ineffective，也不得迁移到其他 target。'
            });
        }

        return Object.freeze(base);
    };

    const buildCrossActorRelationRecord = (reachabilityRecord = {}, synthesis = {}, index = 0) => {
        const actorKeys = [reachabilityRecord.actorKey, reachabilityRecord.targetKey];
        const unavailable = reachabilityRecord.reachabilityState === 'unavailable-in-source-context';
        return Object.freeze({
            id:`VSFRZ-X-${String(index + 1).padStart(2, '0')}`,
            relationScope:'cross-visible-actor',
            upstreamDirectedFunctionRecordId:null,
            sourcePatternId:reachabilityRecord.sourcePatternId || null,
            relationFromDayMaster:null,
            flow:'cross-actor-directed',
            functionType:reachabilityRecord.functionType || null,
            strengthMeaning:null,
            directed:true,
            sourceActorKey:reachabilityRecord.actorKey || null,
            targetActorKey:reachabilityRecord.targetKey || null,
            peerParticipantActorKeys:Object.freeze([]),
            participantActorKeys:freezeArray(unique(actorKeys)),
            reachabilityRecordId:reachabilityRecord.id || null,
            reachabilityState:reachabilityRecord.reachabilityState || null,
            contextConditionRecordIds:bearingConditionIdsForActors(synthesis, actorKeys),
            realizationState:unavailable
                ? realizationStates.NOT_REALIZED_IN_SOURCE_CONTEXT
                : realizationStates.UNRESOLVED,
            resolutionStatus:unavailable
                ? 'resolved-source-function-not-realized'
                : 'unresolved-source-function-realization',
            actorGlobalEffectiveState:null,
            genericVisibleEffectiveState:null,
            statement:unavailable
                ? '该 exact-source cross-actor function 已由 target-specific reachability 解析为在 source context 下未兑现。'
                : '该 cross-actor function 尚无足够证据形成 realization 结论。',
            boundary:'cross-actor realization 必须保持 source / target / function 三元组；某条 function 未兑现不能删除 actor Fact，也不能决定 actor global effectiveness。'
        });
    };

    const buildRealizationRecords = (synthesis = {}) => {
        const dayMasterRecords = (synthesis.visibleStemDirectedFunctionRecords || [])
            .map((record, index) => buildDayMasterRelationRecord(record, synthesis, index));
        const crossActorRecords = (synthesis.visibleStemFunctionReachabilityRecords || [])
            .map((record, index) => buildCrossActorRelationRecord(record, synthesis, index));
        return Object.freeze([...dayMasterRecords, ...crossActorRecords]);
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-FUNCTION-REALIZATION-CONTRACT',
        claimKey:'visibleStem.function-realization.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_FUNCTION_REALIZATION_RULE_ID,
        value:Object.freeze({
            edgeCentric:true,
            targetSpecific:true,
            sourceUnavailableMapsToNotRealizedInThatContext:true,
            bearingAloneDoesNotResolveFunction:true,
            peerNeedsDedicatedResolver:true,
            actorGlobalEffectiveState:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'现有 Function Reachability 已明确 target-specific，而 Directed Function 已区分 inbound / peer / outbound。Function Realization 因此必须按 relation edge 保存，且只在已有 target-specific source evidence 时形成具体 realization 结论。',
        boundary:'该 Claim 不建立通用柱距规则，不把 bearing condition 映射成 function result，也不生成 actor global effectiveState。'
    });

    const makeRecordClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-FUNCTION-REALIZATION-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.function-realization.${record.id || index}`,
        status:record.resolutionStatus === 'resolved-source-function-not-realized' ? 'resolved' : 'blocked',
        ruleId:VISIBLE_STEM_FUNCTION_REALIZATION_RULE_ID,
        value:Object.freeze({
            relationScope:record.relationScope,
            directed:record.directed,
            sourceActorKey:record.sourceActorKey,
            targetActorKey:record.targetActorKey,
            peerParticipantActorKeys:freezeArray(record.peerParticipantActorKeys || []),
            functionType:record.functionType,
            reachabilityState:record.reachabilityState,
            realizationState:record.realizationState,
            sourcePatternId:record.sourcePatternId,
            actorGlobalEffectiveState:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependencyIds:Object.freeze([]),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildModelDependency = () => Object.freeze({
        id:'SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL',
        kind:'interaction',
        scope:'relation-edge-specific-function-realization-contract',
        status:'resolved',
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(['SC-VISIBLE-STEM-FUNCTION-REALIZATION-CONTRACT']),
        ruleId:VISIBLE_STEM_FUNCTION_REALIZATION_RULE_ID,
        dependsOnDependencyIds:Object.freeze(['SD-VISIBLE-STEM-FUNCTION-COVERAGE-INVENTORY']),
        statement:'Function Realization 已冻结为 relation-edge-specific 模型：directed function 使用 source/target，peer 使用 participant pair；bearing context 只作为条件记录。',
        boundary:'模型已解析不等于所有 function realization 已解析。'
    });

    const buildCoverageDependency = (records = [], claims = []) => {
        const unresolved = records.filter((item) => item.realizationState === realizationStates.UNRESOLVED);
        return Object.freeze({
            id:'SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE',
            kind:'effectiveness',
            scope:'known-visible-stem-function-realization-coverage',
            status:unresolved.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze([]),
            sourceRefs:Object.freeze([]),
            sourcePatternIds:Object.freeze(unique(records.map((item) => item.sourcePatternId))),
            resolvedByClaimIds:Object.freeze(unresolved.length
                ? claims.filter((item) => item.status === 'resolved').map((item) => item.id)
                : (records.length ? claims.map((item) => item.id) : ['SC-VISIBLE-STEM-FUNCTION-REALIZATION-CONTRACT'])),
            ruleId:VISIBLE_STEM_FUNCTION_REALIZATION_RULE_ID,
            dependsOnDependencyIds:Object.freeze([
                'SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL',
                'SD-VISIBLE-STEM-FUNCTION-REACHABILITY-SOURCE-SEMANTICS',
                'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY'
            ]),
            statement:!records.length
                ? '本局无已知 visible-stem function edge，realization coverage 为 not-applicable。'
                : unresolved.length
                    ? '已有部分 source-specific function realization 可解析，但仍存在 day-master-related / peer function edge 缺少通用 realization resolver。'
                    : '当前所有已知 function edge 都已有 realization 结论。',
            boundary:'Coverage unresolved 不得用计数、投票或优先级压缩；resolved source-specific “未兑现”也只属于对应 edge。'
        });
    };

    const rebuildVisibleEffectivenessDependency = (base = {}, realizationDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'visible-stem-effects',
            status:'unresolved',
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                realizationDependency.id
            ])),
            statement:'部分具体 function edge 已可形成 source-specific realization 结论，但 day-master-related / peer realization 与 actor-level aggregation 仍未完成。',
            boundary:'不得把某一 edge 的 not-realized-in-source-context 直接升级为 actor ineffective，也不得把 unresolved edge 默认为有效或无效。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const records = buildRealizationRecords(base);
        const recordClaims = records.map(makeRecordClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...recordClaims]);
        const modelDependency = buildModelDependency();
        const realizationDependency = buildCoverageDependency(records, recordClaims);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base, realizationDependency);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL',
            'SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            modelDependency,
            realizationDependency
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
            visibleStemFunctionRealizationRecords:records,
            visibleStemFunctionRealizationRuleIds:Object.freeze([VISIBLE_STEM_FUNCTION_REALIZATION_RULE_ID]),
            visibleStemFunctionRealizationContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Function Realization 按 relation edge 保存，不按 actor 建立单一 effective / ineffective 开关。',
                'exact-source reachability unavailable 只解析为对应 source→target function 在该 source context 下未兑现。',
                'bearing context 可附着为 realization condition，但不能单独决定具体 function 是否兑现；peer 仍需独立 resolver。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildVisibleStemFunctionRealizationRecords:buildRealizationRecords
        });
    }

    GuiJia.baziVisibleStemFunctionRealization = Object.freeze({
        installed:true,
        VISIBLE_STEM_FUNCTION_REALIZATION_VERSION,
        VISIBLE_STEM_FUNCTION_REALIZATION_RULE_ID,
        realizationStates,
        CONTRACT,
        coverageByActor,
        findReachabilityMatch,
        bearingConditionIdsForActors,
        buildDayMasterRelationRecord,
        buildCrossActorRelationRecord,
        buildRealizationRecords,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziVisibleStemFunctionRealizationSource) {
        document.write('<script src="./js/bazi-visible-stem-function-realization-source.js?v=13.44.0"><\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);