(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemFunctionReachability?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const VISIBLE_STEM_FUNCTION_REACHABILITY_VERSION = '0.1';
    const VISIBLE_STEM_FUNCTION_REACHABILITY_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-FUNCTION-REACHABILITY-001';

    const reachabilityStates = Object.freeze({
        UNAVAILABLE_IN_SOURCE_CONTEXT:'unavailable-in-source-context'
    });

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({
            source:'《滴天髓阐微·小儿》',
            chart:'癸丑 己未 丙寅 辛卯',
            term:'时上辛又临绝，虽有若无，焉能生远隔之水？',
            supports:Object.freeze([
                'function-is-target-specific',
                'source-context-can-block-generation-to-target',
                'as-if-absent-does-not-delete-actor'
            ])
        }),
        Object.freeze({
            source:'《滴天髓阐微·小儿》',
            chart:'癸丑 己未 丙寅 辛卯',
            term:'则己土亦不能生隔绝之金',
            supports:Object.freeze([
                'function-is-target-specific',
                'source-context-can-block-generation-to-target',
                'separation-language-is-not-a-numeric-distance-rule'
            ])
        })
    ]);

    const DIRECT_SOURCE_PATTERNS = Object.freeze([
        Object.freeze({
            id:'DTS-VISIBLE-FUNCTION-XIN-GENERATES-GUI-001',
            chartKey:'癸丑|己未|丙寅|辛卯',
            actorKey:'visible:3:辛',
            actorGan:'辛',
            targetKey:'visible:0:癸',
            targetGan:'癸',
            functionType:'generation',
            state:reachabilityStates.UNAVAILABLE_IN_SOURCE_CONTEXT,
            sourceTerm:'时上辛又临绝，虽有若无，焉能生远隔之水？',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-FUNCTION-JI-GENERATES-XIN-001',
            chartKey:'癸丑|己未|丙寅|辛卯',
            actorKey:'visible:1:己',
            actorGan:'己',
            targetKey:'visible:3:辛',
            targetGan:'辛',
            functionType:'generation',
            state:reachabilityStates.UNAVAILABLE_IN_SOURCE_CONTEXT,
            sourceTerm:'则己土亦不能生隔绝之金',
            scope:'exact-source-case-only'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-FUNCTION-REACHABILITY-CONTRACT-001',
        version:VISIBLE_STEM_FUNCTION_REACHABILITY_VERSION,
        recordLevel:'visible-stem-actor-x-target-x-function',
        targetSpecific:true,
        actorGlobalEffectiveState:false,
        sourceDistanceLanguageCreatesNumericThreshold:false,
        sourceDistanceLanguageCreatesUniversalAdjacencyRule:false,
        bearingAvailabilityAloneSufficient:false,
        dayMasterTargetReachabilityResolver:'unresolved',
        genericActorEffectivenessMapping:'unresolved',
        finalStrengthMapping:false,
        numericAggregation:false,
        directSourcePatterns:Object.freeze(DIRECT_SOURCE_PATTERNS.map((item) => item.id)),
        statement:'《滴天髓阐微》以“焉能生远隔之水”“不能生隔绝之金”说明天干作用首先是 actor 对特定 target 的具体功能是否可兑现；本层因此按 actor × target × function 保存 reachability，而不建立脱离目标的全局有效开关。',
        boundary:'原典“远隔／隔绝”只支持该直证命例中的功能不可兑现，不得转写为固定柱距阈值、邻柱万能规则或 actor 全局 ineffective。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const visibleEvidenceItems = (semanticModel = {}) => {
        const evidence = semanticModel.strengthEvidence?.evidence || {};
        return [
            ...(evidence.visibleSupportActors || []),
            ...(evidence.visibleRestraintActors || []),
            ...(evidence.visibleDrainActors || []),
            ...(evidence.visibleDistributionActors || [])
        ];
    };

    const buildStructuredChartKey = (semanticModel = {}) => {
        const strengthEvidence = semanticModel.strengthEvidence || {};
        const evidence = strengthEvidence.evidence || {};
        const ganByIndex = new Map();
        visibleEvidenceItems(semanticModel).forEach((item) => {
            if (Number.isInteger(item.pillarIndex) && item.gan) ganByIndex.set(item.pillarIndex, item.gan);
        });
        if (strengthEvidence.dayMaster?.gan) ganByIndex.set(2, strengthEvidence.dayMaster.gan);

        const zhiByIndex = new Map();
        (evidence.branchQi || []).forEach((item) => {
            if (Number.isInteger(item.pillarIndex) && item.zhi) zhiByIndex.set(item.pillarIndex, item.zhi);
        });
        if (evidence.seasonalState?.monthZhi) zhiByIndex.set(1, evidence.seasonalState.monthZhi);

        if ([0,1,2,3].some((index) => !ganByIndex.get(index) || !zhiByIndex.get(index))) return '';
        return [0,1,2,3].map((index) => `${ganByIndex.get(index)}${zhiByIndex.get(index)}`).join('|');
    };

    const visibleEffectMap = (semanticModel = {}) => new Map(
        (semanticModel.strengthEffects?.effects || [])
            .filter((item) => item.category === 'visibleStemRelation')
            .map((item) => [item.actorKey, item])
    );

    const buildDirectRecord = (semanticModel = {}, pattern = {}, index = 0) => {
        if (buildStructuredChartKey(semanticModel) !== pattern.chartKey) return null;
        const effectMap = visibleEffectMap(semanticModel);
        const actor = effectMap.get(pattern.actorKey);
        const target = effectMap.get(pattern.targetKey);
        if (!actor || !target) return null;
        if (actor.gan !== pattern.actorGan || target.gan !== pattern.targetGan) return null;

        return Object.freeze({
            id:`VSFR-${String(index + 1).padStart(2, '0')}`,
            sourcePatternId:pattern.id,
            resolutionStatus:'resolved-source-function-reachability',
            actorKey:pattern.actorKey,
            actorGan:pattern.actorGan,
            actorEffectId:actor.id || '',
            targetKey:pattern.targetKey,
            targetGan:pattern.targetGan,
            targetEffectId:target.id || '',
            functionType:pattern.functionType,
            reachabilityState:pattern.state,
            sourceTerm:pattern.sourceTerm,
            sourceEffectIds:freezeArray([actor.id, target.id]),
            sourceRefs:freezeArray(unique([...(actor.sourceRefs || []), ...(target.sourceRefs || [])])),
            actorGlobalEffectiveState:null,
            distanceThreshold:null,
            statement:`按《滴天髓阐微》该原命例，${pattern.actorGan}对${pattern.targetGan}的${pattern.functionType === 'generation' ? '相生' : '作用'}功能在这一具体语境中不能兑现，记录 ${pattern.state}。`,
            boundary:'这里只解析该 actor 对该 target 的具体功能可达性；不得把此结果升级为 actor 全局 ineffective，也不得由“远隔／隔绝”抽取固定柱距阈值。'
        });
    };

    const buildFunctionReachability = (semanticModel = {}) => {
        const records = DIRECT_SOURCE_PATTERNS
            .map((pattern, index) => buildDirectRecord(semanticModel, pattern, index))
            .filter(Boolean);
        return Object.freeze({
            version:VISIBLE_STEM_FUNCTION_REACHABILITY_VERSION,
            ruleId:VISIBLE_STEM_FUNCTION_REACHABILITY_RULE_ID,
            state:records.length ? 'observed' : 'not-applicable',
            contract:CONTRACT,
            chartKey:buildStructuredChartKey(semanticModel),
            records:Object.freeze(records),
            boundaries:Object.freeze([
                'Visible Stem Function Reachability 是 actor × target × function 层，不是 actor 全局状态。',
                '“虽有若无”可对应具体功能不可兑现，但原始 visible stem Fact 与 presence-only Effect 保留。',
                '“远隔／隔绝”不转换为数值距离、邻接优先级或通用柱位公式。'
            ])
        });
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-FUNCTION-REACHABILITY-CONTRACT',
        claimKey:'visibleStem.function-reachability.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_FUNCTION_REACHABILITY_RULE_ID,
        value:Object.freeze({
            targetSpecific:true,
            actorGlobalEffectiveState:false,
            numericDistanceRule:false,
            dayMasterTargetReachabilityResolver:'unresolved'
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'任氏以“焉能生远隔之水”“不能生隔绝之金”直接把效力落在某一 actor 对某一 target 能否完成相生功能上，因此先建立 target-specific reachability。',
        boundary:'该 Claim 不定义柱距阈值，也不解决明干对日主的通用实际效力。'
    });

    const makeRecordClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-FUNCTION-REACHABILITY-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.${record.actorKey}.to.${record.targetKey}.${record.functionType}.reachability`,
        status:'resolved',
        ruleId:VISIBLE_STEM_FUNCTION_REACHABILITY_RULE_ID,
        value:Object.freeze({
            reachabilityState:record.reachabilityState,
            actorGlobalEffectiveState:null,
            distanceThreshold:null
        }),
        sourceEffectIds:freezeArray(record.sourceEffectIds || []),
        sourceRefs:freezeArray(record.sourceRefs || []),
        dependencyIds:Object.freeze([]),
        rationale:record.statement,
        boundary:record.boundary
    });

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
                'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY'
            ])),
            statement:'明干方向、Stem Bearing 与局部 Functional Availability 已可分层记录，但明干对日主这一特定 target 的功能是否可兑现仍无通用 resolver。',
            boundary:'不得把 bearing-supported / bearing-impaired / functionally-unavailable-in-context 直接升级为对日主的 effective/ineffective；功能效力必须保留 target-specific。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const collection = buildFunctionReachability(semanticModel);
        semanticModel.visibleStemFunctionReachability = collection;
        const recordClaims = collection.records.map(makeRecordClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...recordClaims]);
        const visibleEffects = (semanticModel.strengthEffects?.effects || []).filter((item) => item.category === 'visibleStemRelation');
        const sourceSemanticsDependency = Object.freeze({
            id:'SD-VISIBLE-STEM-FUNCTION-REACHABILITY-SOURCE-SEMANTICS',
            kind:'interaction',
            scope:'visible-stem-actor-target-function-source-semantics',
            status:'resolved',
            sourceEffectIds:Object.freeze(unique(collection.records.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze(unique(collection.records.flatMap((item) => item.sourceRefs || []))),
            resolvedByClaimIds:Object.freeze(collection.records.length ? recordClaims.map((item) => item.id) : ['SC-VISIBLE-STEM-FUNCTION-REACHABILITY-CONTRACT']),
            ruleId:VISIBLE_STEM_FUNCTION_REACHABILITY_RULE_ID,
            statement:collection.records.length
                ? '当前 direct source case 已按 actor × target × function 解析为 target-specific reachability。'
                : '当前命盘未命中 direct source function-reachability case，本层 source semantics 为 not-applicable。',
            boundary:'该 dependency 只证明功能效力应 target-specific，不代表日主 target 的 reachability 已解析。'
        });
        const dayMasterReachabilityDependency = Object.freeze({
            id:'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY',
            kind:'effectiveness',
            scope:'visible-stem-to-day-master-function-reachability',
            status:visibleEffects.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze(unique(visibleEffects.map((item) => item.id))),
            sourceRefs:Object.freeze(unique(visibleEffects.flatMap((item) => item.sourceRefs || []))),
            resolvedByClaimIds:Object.freeze(visibleEffects.length ? [] : ['SC-VISIBLE-STEM-FUNCTION-REACHABILITY-CONTRACT']),
            ruleId:VISIBLE_STEM_FUNCTION_REACHABILITY_RULE_ID,
            dependsOnDependencyIds:Object.freeze(['SD-VISIBLE-STEM-FUNCTION-REACHABILITY-SOURCE-SEMANTICS']),
            statement:visibleEffects.length
                ? 'Strength 中每个非日主明干最终都要回答“它对日主这一目标的扶／克／泄／被分功能是否可兑现”；当前尚无通用 target-reachability resolver。'
                : '本局无非日主明干，day-master target reachability 为 not-applicable。',
            boundary:'不得用柱距、同柱承载结果、actor 数量或 source exact case 外推日主 target 的通用可达性。'
        });
        const visibleDependency = rebuildVisibleEffectivenessDependency(base);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-FUNCTION-REACHABILITY-SOURCE-SEMANTICS',
            'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            sourceSemanticsDependency,
            dayMasterReachabilityDependency
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
            visibleStemFunctionReachabilityRecords:collection.records,
            visibleStemFunctionReachabilityRuleIds:Object.freeze([VISIBLE_STEM_FUNCTION_REACHABILITY_RULE_ID]),
            visibleStemFunctionReachabilityContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '明干实际效力先按 actor × target × function 观察；不建立脱离目标的全局有效开关。',
                '“远隔／隔绝”只保存为 source-specific 功能不可兑现语义，不生成柱距阈值或邻接万能规则。',
                '明干对其他 target 的 source case 不能自动替代明干对日主的 reachability 判断。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildVisibleStemFunctionReachability:buildFunctionReachability
        });
    }

    GuiJia.baziVisibleStemFunctionReachability = Object.freeze({
        installed:true,
        VISIBLE_STEM_FUNCTION_REACHABILITY_VERSION,
        VISIBLE_STEM_FUNCTION_REACHABILITY_RULE_ID,
        reachabilityStates,
        SOURCE_BASIS,
        DIRECT_SOURCE_PATTERNS,
        CONTRACT,
        visibleEvidenceItems,
        buildStructuredChartKey,
        visibleEffectMap,
        buildDirectRecord,
        buildFunctionReachability,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziVisibleStemDirectedFunction) {
        document.write('<script src="./js/bazi-visible-stem-directed-function.js?v=13.44.0"><\\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);
