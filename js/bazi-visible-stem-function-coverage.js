(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemFunctionCoverage?.installed) return;

    // Research bootstrap dependency: ./js/bazi-visible-stem-function-realization.js?v=13.44.0
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const VISIBLE_STEM_FUNCTION_COVERAGE_VERSION = '0.1';
    const VISIBLE_STEM_FUNCTION_COVERAGE_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-FUNCTION-COVERAGE-001';

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-FUNCTION-COVERAGE-CONTRACT-001',
        version:VISIBLE_STEM_FUNCTION_COVERAGE_VERSION,
        recordLevel:'visible-stem-actor-participation-inventory',
        actorCentric:true,
        inventoryOnly:true,
        dayMasterRelationPreservesParticipationRole:true,
        crossActorReachabilityPreservesParticipationRole:true,
        bearingContextIsConditionNotFunctionResult:true,
        actorGlobalEffectiveState:false,
        numericAggregation:false,
        priorityAggregation:false,
        finalStrengthMapping:false,
        statement:'本层把同一 visible stem 已存在的日主关系、bearing-context functional availability 与 cross-actor reachability 汇入一个 actor-centric participation inventory；只回答“这个 actor 参与了哪些已知关系／条件”，不回答它总体是否有效。',
        boundary:'我生／我克中的 visible stem 是 target，不得因为 actor-centric 汇总而改写成 source；peer 继续保持无向 participant pair；bearing-supported / impaired / functionally-unavailable 只作为条件记录，不得直接决定任一 function realization。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const visibleEffects = (semanticModel = {}) => (semanticModel.strengthEffects?.effects || [])
        .filter((item) => item.category === 'visibleStemRelation');

    const normalizeDayMasterRelation = (record = {}) => {
        if (!record || !record.id) return null;
        let participationRole = 'unresolved';
        if (record.directed === false) participationRole = 'peer';
        else if (record.sourceActor?.actorKey === record.visibleActorKey) participationRole = 'source';
        else if (record.targetActor?.actorKey === record.visibleActorKey) participationRole = 'target';

        return Object.freeze({
            directedFunctionRecordId:record.id,
            relationFromDayMaster:record.relationFromDayMaster || '',
            flow:record.flow || null,
            functionType:record.functionType || null,
            strengthMeaning:record.strengthMeaning || null,
            directed:record.directed,
            participationRole,
            sourceActorKey:record.sourceActor?.actorKey || null,
            targetActorKey:record.targetActor?.actorKey || null,
            peerParticipantActorKeys:freezeArray((record.peerParticipants || []).map((item) => item.actorKey)),
            directionResolutionStatus:record.resolutionStatus || 'unresolved-direction-model',
            reachabilityState:record.reachabilityState || null
        });
    };

    const buildBearingContexts = (actorKey = '', synthesis = {}) => Object.freeze(
        (synthesis.visibleStemFunctionalAvailabilityRecords || [])
            .filter((item) => item.actorKey === actorKey)
            .map((item) => Object.freeze({
                functionalAvailabilityRecordId:item.id,
                stemBearingRecordId:item.stemBearingRecordId || '',
                sourcePatternId:item.sourcePatternId || null,
                sourceBearingState:item.sourceBearingState || null,
                functionalAvailabilityState:item.functionalAvailabilityState || null,
                functionalMeaning:item.functionalMeaning || null,
                resolutionStatus:item.resolutionStatus || 'unresolved-source-bearing-outcome'
            }))
    );

    const buildCrossActorParticipations = (actorKey = '', synthesis = {}) => {
        const items = [];
        (synthesis.visibleStemFunctionReachabilityRecords || []).forEach((record) => {
            if (record.actorKey === actorKey) {
                items.push(Object.freeze({
                    functionReachabilityRecordId:record.id,
                    participationRole:'source',
                    counterpartyActorKey:record.targetKey || '',
                    functionType:record.functionType || null,
                    reachabilityState:record.reachabilityState || null,
                    sourcePatternId:record.sourcePatternId || null,
                    resolutionStatus:record.resolutionStatus || 'unresolved-function-reachability'
                }));
            }
            if (record.targetKey === actorKey) {
                items.push(Object.freeze({
                    functionReachabilityRecordId:record.id,
                    participationRole:'target',
                    counterpartyActorKey:record.actorKey || '',
                    functionType:record.functionType || null,
                    reachabilityState:record.reachabilityState || null,
                    sourcePatternId:record.sourcePatternId || null,
                    resolutionStatus:record.resolutionStatus || 'unresolved-function-reachability'
                }));
            }
        });
        return Object.freeze(items);
    };

    const buildCoverageRecord = (effect = {}, synthesis = {}, index = 0) => {
        const directedRecord = (synthesis.visibleStemDirectedFunctionRecords || [])
            .find((item) => item.visibleActorKey === effect.actorKey);
        const dayMasterRelation = normalizeDayMasterRelation(directedRecord);
        const bearingContexts = buildBearingContexts(effect.actorKey, synthesis);
        const crossActorParticipations = buildCrossActorParticipations(effect.actorKey, synthesis);
        const inventoryStatus = dayMasterRelation ? 'assembled' : 'partial-missing-daymaster-relation';
        const participantEffectIds = freezeArray(unique([
            effect.id,
            ...crossActorParticipations.flatMap((item) => {
                const source = (synthesis.visibleStemFunctionReachabilityRecords || [])
                    .find((record) => record.id === item.functionReachabilityRecordId);
                return source?.participantEffectIds || [];
            })
        ]));

        return Object.freeze({
            id:`VSFC-${String(index + 1).padStart(2, '0')}`,
            actorKey:effect.actorKey || '',
            actorGan:effect.gan || '',
            visibleEffectId:effect.id || '',
            inventoryStatus,
            dayMasterRelation,
            bearingContexts,
            crossActorParticipations,
            participantEffectIds,
            upstreamRecordIds:freezeArray(unique([
                dayMasterRelation?.directedFunctionRecordId,
                ...bearingContexts.map((item) => item.functionalAvailabilityRecordId),
                ...crossActorParticipations.map((item) => item.functionReachabilityRecordId)
            ])),
            sourcePatternIds:freezeArray(unique([
                ...bearingContexts.map((item) => item.sourcePatternId),
                ...crossActorParticipations.map((item) => item.sourcePatternId)
            ])),
            genericVisibleEffectiveState:null,
            aggregationStatus:'not-aggregated',
            statement:dayMasterRelation
                ? `${effect.gan}的已知 day-master relation、bearing contexts 与 cross-actor reachability participations 已汇入 actor-centric inventory。`
                : `${effect.gan}已建立 actor inventory，但缺少对应的 day-master relation record。`,
            boundary:'Coverage 只汇总既有记录；不得从参与关系数量、bearing 条件数量或 source pattern 数量推导强弱、优先级或 global effectiveness。'
        });
    };

    const buildCoverageRecords = (semanticModel = {}, synthesis = {}) => Object.freeze(
        visibleEffects(semanticModel).map((effect, index) => buildCoverageRecord(effect, synthesis, index))
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-FUNCTION-COVERAGE-CONTRACT',
        claimKey:'visibleStem.function-coverage.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_FUNCTION_COVERAGE_RULE_ID,
        value:Object.freeze({
            actorCentric:true,
            inventoryOnly:true,
            preservesParticipationRole:true,
            bearingContextIsConditionOnly:true,
            actorGlobalEffectiveState:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'现有 Strength 链已经分别保存 Functional Availability、Function Reachability 与 Directed Function；在进入 realization / aggregation 前，需要一个只做 participation inventory 的 actor-centric 视图，避免再次把关系存在误当成作用已兑现。',
        boundary:'该 Claim 不新增传统规则，不解决 reachability、peer realization 或 actor global effectiveness。'
    });

    const makeRecordClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-FUNCTION-COVERAGE-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.${record.actorKey || index}.function-coverage`,
        status:record.inventoryStatus === 'assembled' ? 'resolved' : 'blocked',
        ruleId:VISIBLE_STEM_FUNCTION_COVERAGE_RULE_ID,
        value:Object.freeze({
            inventoryStatus:record.inventoryStatus,
            dayMasterParticipationRole:record.dayMasterRelation?.participationRole || null,
            upstreamRecordIds:freezeArray(record.upstreamRecordIds || []),
            sourcePatternIds:freezeArray(record.sourcePatternIds || []),
            genericVisibleEffectiveState:null,
            aggregationStatus:'not-aggregated'
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        participantEffectIds:freezeArray(record.participantEffectIds || []),
        dependencyIds:Object.freeze([]),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildCoverageDependency = (records = [], claims = []) => {
        const allAssembled = records.every((item) => item.inventoryStatus === 'assembled');
        return Object.freeze({
            id:'SD-VISIBLE-STEM-FUNCTION-COVERAGE-INVENTORY',
            kind:'interaction',
            scope:'visible-stem-actor-participation-inventory',
            status:allAssembled ? 'resolved' : 'unresolved',
            sourceEffectIds:Object.freeze([]),
            sourceRefs:Object.freeze([]),
            participantEffectIds:Object.freeze(unique(records.flatMap((item) => item.participantEffectIds || []))),
            resolvedByClaimIds:Object.freeze(allAssembled
                ? (records.length ? claims.filter((item) => item.status === 'resolved').map((item) => item.id) : ['SC-VISIBLE-STEM-FUNCTION-COVERAGE-CONTRACT'])
                : []),
            ruleId:VISIBLE_STEM_FUNCTION_COVERAGE_RULE_ID,
            dependsOnDependencyIds:Object.freeze([
                'SD-VISIBLE-STEM-FUNCTION-DIRECTION-MODEL',
                'SD-STEM-BEARING-FUNCTIONAL-INTERPRETATION',
                'SD-VISIBLE-STEM-FUNCTION-REACHABILITY-SOURCE-SEMANTICS'
            ]),
            statement:records.length
                ? (allAssembled
                    ? '所有非日主明干都已建立 actor-centric function participation inventory。'
                    : '至少一个非日主明干缺少完整的 day-master relation inventory。')
                : '本局无非日主明干，function coverage inventory 为 not-applicable。',
            boundary:'inventory resolved 只表示已知上游记录被汇总，不表示任何 function 已实现，也不表示 actor effective。'
        });
    };

    const rebuildVisibleEffectivenessDependency = (base = {}, coverageDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'visible-stem-effects',
            status:'unresolved',
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                coverageDependency.id
            ])),
            statement:'visible stem 的已知关系与 bearing 条件已经可以按 actor 汇总为 participation inventory，但 function realization 与 actor-level aggregation 仍未完成。',
            boundary:'不得把 coverage inventory 的完整性、关系数量或条件数量当成 generic effective / ineffective。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const records = buildCoverageRecords(semanticModel, base);
        const recordClaims = records.map(makeRecordClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...recordClaims]);
        const coverageDependency = buildCoverageDependency(records, recordClaims);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base, coverageDependency);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-FUNCTION-COVERAGE-INVENTORY'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
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
            visibleStemFunctionCoverageRecords:records,
            visibleStemFunctionCoverageRuleIds:Object.freeze([VISIBLE_STEM_FUNCTION_COVERAGE_RULE_ID]),
            visibleStemFunctionCoverageContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Visible Stem Function Coverage 只建立 actor-centric participation inventory，不做关系计数、优先级或全局有效性汇总。',
                '我生／我克中的 visible stem 保持 target participation；同我保持 peer participation。',
                'bearing-context functional availability 只作为 realization 条件来源之一，不直接决定任何具体 function。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildVisibleStemFunctionCoverageRecords:(semanticModel = {}, synthesis = {}) => buildCoverageRecords(semanticModel, synthesis)
        });
    }

    GuiJia.baziVisibleStemFunctionCoverage = Object.freeze({
        installed:true,
        VISIBLE_STEM_FUNCTION_COVERAGE_VERSION,
        VISIBLE_STEM_FUNCTION_COVERAGE_RULE_ID,
        CONTRACT,
        visibleEffects,
        normalizeDayMasterRelation,
        buildBearingContexts,
        buildCrossActorParticipations,
        buildCoverageRecord,
        buildCoverageRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);