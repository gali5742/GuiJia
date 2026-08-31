(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemFunctionRealizationSource?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    const baseRealizationApi = GuiJia.baziVisibleStemFunctionRealization || null;

    const VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_VERSION = '0.1';
    const VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-001';

    const sourceRealizationStates = Object.freeze({
        REALIZED_IN_SOURCE_CONTEXT:'realized-in-source-context',
        NOT_REALIZED_IN_SOURCE_CONTEXT:'not-realized-in-source-context'
    });

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({
            source:'《滴天髓阐微·八格》命例',
            chart:'丁丑 癸卯 乙卯 己卯',
            term:'最喜丁火独发，泄其精英',
            supports:Object.freeze(['daymaster-yi-to-visible-ding-generation-realized'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·八格》命例',
            chart:'丁丑 癸卯 乙卯 己卯',
            term:'惜癸水克丁，仍伤秀气',
            supports:Object.freeze(['visible-gui-to-visible-ding-restraint-realized'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·八格》命例',
            chart:'丁丑 癸卯 乙卯 己卯',
            term:'时干己土临绝，不能去其癸水',
            supports:Object.freeze(['visible-ji-to-visible-gui-restraint-not-realized'])
        })
    ]);

    const DIRECT_SOURCE_PATTERNS = Object.freeze([
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-YI-GENERATES-DING-001',
            chartKey:'丁丑|癸卯|乙卯|己卯',
            relationScope:'daymaster-related',
            sourceActorKey:'daymaster:2:乙',
            targetActorKey:'visible:0:丁',
            functionType:'generation',
            realizationState:sourceRealizationStates.REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'最喜丁火独发，泄其精英',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-001',
            chartKey:'丁丑|癸卯|乙卯|己卯',
            relationScope:'cross-visible-actor',
            sourceActorKey:'visible:1:癸',
            targetActorKey:'visible:0:丁',
            functionType:'restraint',
            realizationState:sourceRealizationStates.REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'惜癸水克丁，仍伤秀气',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-JI-RESTRAINS-GUI-001',
            chartKey:'丁丑|癸卯|乙卯|己卯',
            relationScope:'cross-visible-actor',
            sourceActorKey:'visible:3:己',
            targetActorKey:'visible:1:癸',
            functionType:'restraint',
            realizationState:sourceRealizationStates.NOT_REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'时干己土临绝，不能去其癸水',
            scope:'exact-source-case-only'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-CONTRACT-001',
        version:VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_VERSION,
        inputLevel:'function-realization-records-plus-direct-source-case',
        outputLevel:'exact-source-relation-edge-realization-refinement',
        directSourceExactCaseOnly:true,
        mayResolveExistingDayMasterEdge:true,
        mayIntroduceSourceExplicitCrossVisibleEdge:true,
        elementalRelationAloneDoesNotCreateEdge:true,
        bearingAloneDoesNotResolveEdge:true,
        sourceContextStateIsNotActorGlobalState:true,
        genericReachabilityResolverIntroduced:false,
        genericRealizationResolverIntroduced:false,
        actorGlobalEffectiveState:false,
        numericAggregation:false,
        majorityVoting:false,
        priorityAggregation:false,
        finalStrengthMapping:false,
        statement:'本层只把原典命例中明确落到 source→target→function 的叙述写成 exact-source realization；既可以细化已有 day-master relation edge，也可以补入原文明确点名的 cross-visible edge。',
        boundary:'命例外不得仅凭五行相生相克、柱位距离、bearing-supported 或 actor presence 泛化为 realized / not-realized；source-context realization 也不得升级为 actor global effective / ineffective。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const visibleEffects = (semanticModel = {}) => (semanticModel.strengthEffects?.effects || [])
        .filter((item) => item.category === 'visibleStemRelation');

    const actorPillarIndex = (actorKey = '') => {
        const value = Number(String(actorKey).split(':')[1]);
        return Number.isInteger(value) ? value : null;
    };

    const buildStructuredChartKey = (semanticModel = {}, synthesis = {}) => {
        const stems = ['', '', semanticModel.strengthEvidence?.dayMaster?.gan || '', ''];
        const branches = ['', '', '', ''];

        visibleEffects(semanticModel).forEach((effect) => {
            const pillarIndex = actorPillarIndex(effect.actorKey);
            if (pillarIndex != null && pillarIndex !== 2) stems[pillarIndex] = effect.gan || '';
        });

        (synthesis.visibleStemFunctionalAvailabilityRecords || []).forEach((record) => {
            const pillarIndex = Number(record.pillarIndex);
            if (Number.isInteger(pillarIndex) && pillarIndex !== 2) branches[pillarIndex] = record.bearingZhi || '';
        });

        (semanticModel.strengthEvidence?.evidence?.branchQi || []).forEach((record) => {
            if (Number(record.pillarIndex) === 2) branches[2] = record.zhi || '';
        });

        if (!branches[1]) branches[1] = semanticModel.strengthEvidence?.evidence?.seasonalState?.monthZhi || '';
        if (stems.some((item) => !item) || branches.some((item) => !item)) return null;
        return stems.map((gan, index) => `${gan}${branches[index]}`).join('|');
    };

    const knownActorKeys = (semanticModel = {}) => {
        const dayGan = semanticModel.strengthEvidence?.dayMaster?.gan || '';
        return new Set([
            ...(dayGan ? [`daymaster:2:${dayGan}`] : []),
            ...visibleEffects(semanticModel).map((item) => item.actorKey).filter(Boolean)
        ]);
    };

    const participantEffectIdsFor = (semanticModel = {}, actorKeys = []) => {
        const byActor = new Map(visibleEffects(semanticModel).map((item) => [item.actorKey, item.id]));
        return freezeArray(unique(actorKeys.map((actorKey) => byActor.get(actorKey))));
    };

    const contextConditionIdsFor = (synthesis = {}, actorKeys = []) => {
        if (typeof baseRealizationApi?.bearingConditionIdsForActors === 'function') {
            return baseRealizationApi.bearingConditionIdsForActors(synthesis, actorKeys);
        }
        return Object.freeze([]);
    };

    const findMatchingRecord = (records = [], pattern = {}) => records.find((record) =>
        record.directed !== false
        && record.sourceActorKey === pattern.sourceActorKey
        && record.targetActorKey === pattern.targetActorKey
        && record.functionType === pattern.functionType
    ) || null;

    const makeDirectSourceRecord = (pattern = {}, existingRecord = null, semanticModel = {}, synthesis = {}, index = 0) => {
        const actorKeys = [pattern.sourceActorKey, pattern.targetActorKey];
        const realized = pattern.realizationState === sourceRealizationStates.REALIZED_IN_SOURCE_CONTEXT;
        return Object.freeze({
            ...(existingRecord || {}),
            id:existingRecord?.id || `VSFRZS-${String(index + 1).padStart(2, '0')}`,
            relationScope:existingRecord?.relationScope || pattern.relationScope,
            upstreamDirectedFunctionRecordId:existingRecord?.upstreamDirectedFunctionRecordId || null,
            sourcePatternId:pattern.id,
            sourceEvidenceRuleId:VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
            sourceEvidenceKind:'direct-source-relation-outcome',
            sourceCitation:'《滴天髓阐微·八格》命例',
            sourceTerm:pattern.sourceTerm,
            relationFromDayMaster:existingRecord?.relationFromDayMaster || null,
            flow:existingRecord?.flow || (pattern.relationScope === 'daymaster-related' ? null : 'cross-actor-directed'),
            functionType:pattern.functionType,
            strengthMeaning:existingRecord?.strengthMeaning || null,
            directed:true,
            sourceActorKey:pattern.sourceActorKey,
            targetActorKey:pattern.targetActorKey,
            peerParticipantActorKeys:Object.freeze([]),
            participantActorKeys:freezeArray(actorKeys),
            participantEffectIds:participantEffectIdsFor(semanticModel, actorKeys),
            reachabilityRecordId:existingRecord?.reachabilityRecordId || null,
            reachabilityState:existingRecord?.reachabilityState || null,
            contextConditionRecordIds:existingRecord?.contextConditionRecordIds || contextConditionIdsFor(synthesis, actorKeys),
            realizationState:pattern.realizationState,
            resolutionStatus:realized
                ? 'resolved-direct-source-function-realized'
                : 'resolved-direct-source-function-not-realized',
            actorGlobalEffectiveState:null,
            genericVisibleEffectiveState:null,
            statement:realized
                ? '原典命例明确描述该 source→target function 已实际发生，因此仅在该 exact source context 下记录 realized-in-source-context。'
                : '原典命例明确描述该 source→target function 未能发生，因此仅在该 exact source context 下记录 not-realized-in-source-context。',
            boundary:'该结果严格绑定命例、source、target 与 function；不得迁移到其他命局、其他 target，也不得升级为 source actor 的全局 effective / ineffective。'
        });
    };

    const buildDirectSourceRecords = (semanticModel = {}, synthesis = {}) => {
        const key = buildStructuredChartKey(semanticModel, synthesis);
        if (!key) return Object.freeze([]);
        const actors = knownActorKeys(semanticModel);
        const baseRecords = synthesis.visibleStemFunctionRealizationRecords || [];
        return Object.freeze(DIRECT_SOURCE_PATTERNS
            .filter((pattern) => pattern.chartKey === key)
            .filter((pattern) => actors.has(pattern.sourceActorKey) && actors.has(pattern.targetActorKey))
            .map((pattern, index) => makeDirectSourceRecord(
                pattern,
                findMatchingRecord(baseRecords, pattern),
                semanticModel,
                synthesis,
                index
            )));
    };

    const refineRealizationRecords = (semanticModel = {}, synthesis = {}, sourceRecords = buildDirectSourceRecords(semanticModel, synthesis)) => {
        const replacements = new Map(sourceRecords.map((record) => [
            `${record.sourceActorKey}|${record.targetActorKey}|${record.functionType}`,
            record
        ]));
        const consumed = new Set();
        const refined = (synthesis.visibleStemFunctionRealizationRecords || []).map((record) => {
            if (record.directed === false) return record;
            const key = `${record.sourceActorKey}|${record.targetActorKey}|${record.functionType}`;
            const replacement = replacements.get(key);
            if (!replacement) return record;
            consumed.add(key);
            return replacement;
        });
        sourceRecords.forEach((record) => {
            const key = `${record.sourceActorKey}|${record.targetActorKey}|${record.functionType}`;
            if (!consumed.has(key)) refined.push(record);
        });
        return Object.freeze(refined);
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-CONTRACT',
        claimKey:'visibleStem.function-realization.direct-source.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
        value:Object.freeze({
            exactSourceOnly:true,
            states:Object.freeze(Object.values(sourceRealizationStates)),
            sourceContextStateIsNotActorGlobalState:true,
            genericResolverIntroduced:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'《滴天髓阐微》同一命例分别明确描述丁火泄秀、癸水克丁以及己土不能去癸水，可作为 source→target→function 层的正反 realization 直证。',
        boundary:'本 Claim 只授权 exact-source pattern；不授权由元素关系、柱距、承载或关系存在自动产生 realization。'
    });

    const makeSourceRecordClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.function-realization.direct-source.${record.sourcePatternId || index}`,
        status:'resolved',
        ruleId:VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
        value:Object.freeze({
            sourceActorKey:record.sourceActorKey,
            targetActorKey:record.targetActorKey,
            functionType:record.functionType,
            realizationState:record.realizationState,
            sourcePatternId:record.sourcePatternId,
            actorGlobalEffectiveState:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        participantEffectIds:freezeArray(record.participantEffectIds || []),
        dependencyIds:Object.freeze(['SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildSourceEvidenceDependency = (sourceRecords = [], claims = []) => Object.freeze({
        id:'SD-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-EVIDENCE',
        kind:'interaction',
        scope:'exact-source-visible-stem-function-realization',
        status:'resolved',
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourcePatternIds:freezeArray(sourceRecords.map((item) => item.sourcePatternId)),
        resolvedByClaimIds:Object.freeze(sourceRecords.length
            ? claims.map((item) => item.id)
            : ['SC-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-CONTRACT']),
        ruleId:VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
        dependsOnDependencyIds:Object.freeze(['SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL']),
        statement:sourceRecords.length
            ? '当前命局命中 exact-source relation outcome；相应 source→target function 已获得 source-context realization 结论。'
            : '当前命局未命中已登记的 exact-source realization pattern；source evidence resolver 本身已完成且不作泛化。',
        boundary:'source evidence resolved 只表示 resolver 已执行；未命中不能解释为 function 未实现，命中也不能解释为 actor 全局有效或无效。'
    });

    const rebuildCoverageDependency = (base = {}, records = [], sourceDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE') || {};
        const unresolved = records.filter((item) => item.realizationState === 'unresolved');
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE',
            kind:'effectiveness',
            scope:'known-visible-stem-function-realization-coverage',
            status:unresolved.length ? 'unresolved' : 'resolved',
            sourcePatternIds:freezeArray(unique(records.map((item) => item.sourcePatternId))),
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                sourceDependency.id
            ])),
            statement:!records.length
                ? '本局无已知 visible-stem function edge，realization coverage 为 not-applicable。'
                : unresolved.length
                    ? 'exact-source evidence 已补充部分正反 realization，但仍有已知 function edge 未解析。'
                    : '当前所有已知 function edge 都已有受控 realization 结论。',
            boundary:'Coverage 不按 realized / not-realized 数量投票；任何 source-context 结果仍严格属于对应 relation edge。'
        });
    };

    const rebuildVisibleEffectivenessDependency = (base = {}, coverageDependency = {}, sourceDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'visible-stem-effects',
            status:'unresolved',
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                coverageDependency.id,
                sourceDependency.id
            ])),
            statement:'部分具体 function edge 已有 exact-source realized / not-realized 结论，但 actor profile interpretation 与 generic Visible Effectiveness 仍未解析。',
            boundary:'realized-in-source-context 不等于 actor effective；not-realized-in-source-context 不等于 actor ineffective；不得跨 edge 传播。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const sourceRecords = buildDirectSourceRecords(semanticModel, base);
        const records = refineRealizationRecords(semanticModel, base, sourceRecords);
        const sourceClaims = sourceRecords.map(makeSourceRecordClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...sourceClaims]);
        const sourceDependency = buildSourceEvidenceDependency(sourceRecords, sourceClaims);
        const coverageDependency = rebuildCoverageDependency(base, records, sourceDependency);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base, coverageDependency, sourceDependency);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE',
            'SD-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-EVIDENCE'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            sourceDependency,
            coverageDependency
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
            visibleStemFunctionRealizationSourceRecords:sourceRecords,
            visibleStemFunctionRealizationSourceRuleIds:Object.freeze([VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID]),
            visibleStemFunctionRealizationSourceContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Direct Source Function Realization 只接受原典明确点名的 source→target→function outcome，并严格绑定 exact source chart。',
                '正向 realized-in-source-context 与负向 not-realized-in-source-context 处于同一 relation-edge 层级；两者都不是 actor global effectiveState。',
                '未命中 source pattern 的既有 unresolved edge 原样保留，不由五行字面关系或柱位距离兜底。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildVisibleStemDirectSourceRealizationRecords:buildDirectSourceRecords
        });
    }

    GuiJia.baziVisibleStemFunctionRealizationSource = Object.freeze({
        installed:true,
        VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_VERSION,
        VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
        sourceRealizationStates,
        SOURCE_BASIS,
        DIRECT_SOURCE_PATTERNS,
        CONTRACT,
        buildStructuredChartKey,
        buildDirectSourceRecords,
        refineRealizationRecords,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziVisibleStemActorInteractionAggregation) {
        document.write('<script src="./js/bazi-visible-stem-actor-interaction-aggregation.js?v=13.44.0"><\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);