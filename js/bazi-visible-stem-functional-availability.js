(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemFunctionalAvailability?.installed) return;

    // Research bootstrap dependency: ./js/bazi-visible-stem-function-reachability.js?v=13.44.0
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_VERSION = '0.1';
    const VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-FUNCTIONAL-AVAILABILITY-001';

    const functionalAvailabilityStates = Object.freeze({
        BEARING_SUPPORTED:'bearing-supported',
        BEARING_IMPAIRED:'bearing-impaired',
        FUNCTIONALLY_UNAVAILABLE_IN_CONTEXT:'functionally-unavailable-in-context'
    });

    const SOURCE_SEMANTIC_BASIS = Object.freeze([
        Object.freeze({
            source:'《滴天髓阐微·干支总论》',
            term:'又得亥水生扶有情，丁火之根愈固',
            supports:Object.freeze(['source-bearing-fortified-by-support -> bearing-supported'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》',
            term:'卯酉逢冲，克败丁火之根',
            supports:Object.freeze(['source-bearing-damaged-by-clash -> bearing-impaired'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》',
            term:'虽时透甲木临于申支，谓地支不载，虽有若无',
            supports:Object.freeze(['source-not-carried-as-if-absent -> functionally-unavailable-in-context'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·小儿》',
            term:'时上辛又临绝，虽有若无，焉能生远隔之水',
            supports:Object.freeze(['as-if-absent-means-contextual-function-not-realized'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》',
            term:'凡命中四柱干支，则显然吉神而不为吉，确乎凶神而不为凶者，皆是故也',
            supports:Object.freeze(['bearing-context-modifies-functional-realization'])
        })
    ]);

    const SOURCE_STATE_INTERPRETATIONS = Object.freeze({
        'source-bearing-fortified-by-support':Object.freeze({
            functionalAvailabilityState:functionalAvailabilityStates.BEARING_SUPPORTED,
            functionalMeaning:'bearing-condition-supported',
            actorGlobalEffectiveState:null,
            statement:'原典“根愈固”在此只解释为该明干的承载条件得到支持，其功能实现条件较前一层更有支撑。'
        }),
        'source-bearing-damaged-by-clash':Object.freeze({
            functionalAvailabilityState:functionalAvailabilityStates.BEARING_IMPAIRED,
            functionalMeaning:'bearing-condition-impaired',
            actorGlobalEffectiveState:null,
            statement:'原典“克败丁火之根”在此只解释为该明干的承载基础受损，其功能实现条件受到妨碍。'
        }),
        'source-not-carried-as-if-absent':Object.freeze({
            functionalAvailabilityState:functionalAvailabilityStates.FUNCTIONALLY_UNAVAILABLE_IN_CONTEXT,
            functionalMeaning:'intended-function-not-realized-in-this-context',
            actorGlobalEffectiveState:null,
            statement:'原典“地支不载，虽有若无”结合“时上辛又临绝，虽有若无，焉能生远隔之水”的同书旁证，解释为该明干在当前承载／目标功能语境中难以兑现作用，而不是明干事实消失。'
        })
    });

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-FUNCTIONAL-AVAILABILITY-CONTRACT-001',
        version:VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_VERSION,
        inputLevel:'resolved-stem-bearing-source-outcome',
        outputLevel:'visible-stem-functional-availability-in-bearing-context',
        functionalAvailabilityIsActorGlobalEffectiveness:false,
        functionallyUnavailableMeansStemAbsent:false,
        bearingSupportedMeansEffective:false,
        bearingImpairedMeansIneffective:false,
        targetFunctionSpecificityRequiredForGlobalUse:true,
        numericAggregation:false,
        finalStrengthMapping:false,
        statement:'Stem Bearing source outcome 先解释为承载语境中的功能可用性；该结果描述“作用是否得到承载／是否能兑现”，不直接等同明干在整张命局中的全局 effectiveState。',
        boundary:'bearing-supported / bearing-impaired / functionally-unavailable-in-context 均不得直接改写为 effective / weakened / ineffective；同一明干仍可能由别处通根、生扶、合冲或其他结构改变总体实际作用。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const buildFunctionalAvailabilityRecord = (bearingRecord = {}, index = 0) => {
        const base = {
            id:`VSFA-${String(index + 1).padStart(2, '0')}`,
            stemBearingRecordId:bearingRecord.id || '',
            actorKey:bearingRecord.actorKey || '',
            visibleEffectId:bearingRecord.visibleEffectId || '',
            pillarIndex:bearingRecord.pillarIndex,
            stemGan:bearingRecord.stemGan || '',
            bearingZhi:bearingRecord.bearingZhi || '',
            sourcePatternId:bearingRecord.sourcePatternId || null,
            sourceBearingState:bearingRecord.sourceBearingState || null,
            sourceTerm:bearingRecord.sourceTerm || null,
            sourceRefs:freezeArray(bearingRecord.sourceRefs || []),
            functionalAvailabilityState:null,
            functionalMeaning:null,
            genericVisibleEffectiveState:null,
            resolutionStatus:'unresolved-source-bearing-outcome'
        };

        if (bearingRecord.resolutionStatus !== 'resolved-source-bearing-outcome') {
            return Object.freeze({
                ...base,
                statement:'Stem Bearing source outcome 尚未解析，因此不能提前生成 functional availability。',
                boundary:'不得由同柱 stem-branch pair、字面五行生克或 visible-stem presence 直接生成 bearing-supported / impaired / functionally-unavailable。'
            });
        }

        const interpretation = SOURCE_STATE_INTERPRETATIONS[bearingRecord.sourceBearingState];
        if (!interpretation) {
            return Object.freeze({
                ...base,
                resolutionStatus:'unresolved-unsupported-source-bearing-state',
                statement:'Stem Bearing source outcome 已解析，但当前没有对应的受控 functional availability 解释。',
                boundary:'未知 source-bearing state 不得兜底映射到 generic visible-stem effectiveness。'
            });
        }

        return Object.freeze({
            ...base,
            resolutionStatus:'resolved-functional-availability',
            functionalAvailabilityState:interpretation.functionalAvailabilityState,
            functionalMeaning:interpretation.functionalMeaning,
            statement:interpretation.statement,
            boundary:'该状态只描述当前 bearing context 下的功能实现条件；它不是 actor global effectiveState，也不能删除明干 Fact。'
        });
    };

    const buildFunctionalAvailabilityRecords = (synthesis = {}) => Object.freeze(
        (synthesis.stemBearingEffectRecords || []).map((record, index) => buildFunctionalAvailabilityRecord(record, index))
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-FUNCTIONAL-AVAILABILITY-CONTRACT',
        claimKey:'visibleStem.functionalAvailability.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_RULE_ID,
        value:Object.freeze({
            inputLevel:'resolved-stem-bearing-source-outcome',
            states:Object.freeze(Object.values(functionalAvailabilityStates)),
            actorGlobalEffectiveState:false,
            functionallyUnavailableMeansStemAbsent:false,
            sourceAsIfAbsentMeansGlobalIneffective:false,
            numericAggregation:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'《滴天髓阐微》“虽有若无”在另一命例中紧接“焉能生远隔之水”，表明这一术语可用于描述具体功能无法兑现；同时“根愈固／克败”首先描述承载条件改善或受损。因此先解释为 functional availability，比直接映射 actor global effectiveState 更符合原文层级。',
        boundary:'本 Claim 不解决明干在整张命局中的最终 effective / weakened / ineffective，也不决定扶克泄方向是否最终兑现。'
    });

    const makeRecordClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-FUNCTIONAL-AVAILABILITY-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.${record.actorKey || index}.bearing-functional-availability`,
        status:record.resolutionStatus === 'resolved-functional-availability' ? 'resolved' : 'blocked',
        ruleId:VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_RULE_ID,
        value:Object.freeze({
            functionalAvailabilityState:record.functionalAvailabilityState,
            functionalMeaning:record.functionalMeaning,
            genericVisibleEffectiveState:null
        }),
        sourceEffectIds:freezeArray([record.visibleEffectId]),
        sourceRefs:freezeArray(record.sourceRefs || []),
        dependencyIds:Object.freeze(['SD-STEM-BEARING-SOURCE-COVERAGE']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildInterpretationDependency = (records = [], claims = []) => {
        const allResolved = records.length > 0 && records.every((item) => item.resolutionStatus === 'resolved-functional-availability');
        return Object.freeze({
            id:'SD-STEM-BEARING-FUNCTIONAL-INTERPRETATION',
            kind:'effectiveness',
            scope:'source-bearing-outcome-to-functional-availability',
            status:records.length ? (allResolved ? 'resolved' : 'unresolved') : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.map((item) => item.visibleEffectId))),
            sourceRefs:Object.freeze(unique(records.flatMap((item) => item.sourceRefs || []))),
            resolvedByClaimIds:Object.freeze(records.length ? claims.filter((item) => item.status === 'resolved').map((item) => item.id) : ['SC-VISIBLE-STEM-FUNCTIONAL-AVAILABILITY-CONTRACT']),
            ruleId:VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_RULE_ID,
            dependsOnDependencyIds:Object.freeze(records.length ? ['SD-STEM-BEARING-SOURCE-COVERAGE'] : []),
            statement:!records.length
                ? '本局无非日主明干，functional availability 为 not-applicable。'
                : allResolved
                    ? '当前所有 Stem Bearing source outcome 都已解释为 bearing-context functional availability。'
                    : '至少一个 visible stem 尚无 resolved Stem Bearing source outcome，因此其 functional availability 仍未解析。',
            boundary:'本 dependency 只解决 source wording → functional availability，不解决 actor global effectiveState。'
        });
    };

    const rebuildEffectMappingDependency = (base = {}, records = [], interpretationDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-STEM-BEARING-EFFECT-MAPPING') || {};
        const interpreted = records.filter((item) => item.resolutionStatus === 'resolved-functional-availability');
        return Object.freeze({
            ...current,
            id:'SD-STEM-BEARING-EFFECT-MAPPING',
            kind:'effectiveness',
            scope:'functional-availability-to-visible-stem-global-effectiveness',
            status:interpreted.length ? 'unresolved' : (current.status || 'resolved'),
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                interpretationDependency.id
            ])),
            resolvedByClaimIds:Object.freeze(interpreted.length ? [] : (current.resolvedByClaimIds || [])),
            ruleId:VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_RULE_ID,
            statement:interpreted.length
                ? 'bearing-supported / bearing-impaired / functionally-unavailable-in-context 已可形成受控 functional availability，但如何与别处通根、生扶、合冲及其他结构共同汇总为 visible stem global effectiveState 尚未定义。'
                : (current.statement || '当前无已解析 functional availability，本局无需进行 global effectiveness mapping。'),
            boundary:'functionally-unavailable-in-context 不等于 actor.ineffective；bearing-supported 不等于 actor.effective；必须保留其他来源与结构的独立作用。'
        });
    };

    const rebuildVisibleEffectivenessDependency = (base = {}, interpretationDependency = {}, mappingDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'visible-stem-effects',
            status:'unresolved',
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                interpretationDependency.id,
                mappingDependency.id
            ])),
            statement:'明干方向资格、Stem Bearing source outcome 与 bearing-context functional availability 已分层；但 functional availability 仍不能代表明干在整张命局中的 global effectiveState。',
            boundary:'visible stem presence、bearing-supported、bearing-impaired 或 functionally-unavailable-in-context 均不能单独完成明干实际效力判断。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({
                ...base,
                visibleStemFunctionalAvailabilityRecords:Object.freeze([]),
                visibleStemFunctionalAvailabilityRuleIds:Object.freeze([])
            });
        }

        const records = buildFunctionalAvailabilityRecords(base);
        const recordClaims = records.map((record, index) => makeRecordClaim(record, index));
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...recordClaims]);
        const interpretationDependency = buildInterpretationDependency(records, recordClaims);
        const mappingDependency = rebuildEffectMappingDependency(base, records, interpretationDependency);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base, interpretationDependency, mappingDependency);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-STEM-BEARING-FUNCTIONAL-INTERPRETATION',
            'SD-STEM-BEARING-EFFECT-MAPPING'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            interpretationDependency,
            mappingDependency
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
            visibleStemFunctionalAvailabilityRecords:records,
            visibleStemFunctionalAvailabilityRuleIds:Object.freeze([VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_RULE_ID]),
            visibleStemFunctionalAvailabilityContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '“虽有若无”在本层解释为 bearing/target context 中具体功能未能兑现，不是删除明干存在事实。',
                '“根愈固／克败”先解释为 bearing-supported / bearing-impaired，不直接映射 visible stem global effectiveState。',
                'functional availability 与 actor global effectiveness 必须分层；后者还需考虑别处通根、生扶、合冲及其他结构。'
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
            __visibleStemFunctionalAvailabilityHookInstalled:true
        });
    }

    GuiJia.baziVisibleStemFunctionalAvailability = Object.freeze({
        installed:true,
        VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_VERSION,
        VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_RULE_ID,
        functionalAvailabilityStates,
        SOURCE_SEMANTIC_BASIS,
        SOURCE_STATE_INTERPRETATIONS,
        CONTRACT,
        buildFunctionalAvailabilityRecord,
        buildFunctionalAvailabilityRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);