(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForceInteractionAdapterProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForceInteractionAdapterContract || null;
    if (!contractApi) return;

    const { VERSION, RULE_ID, INPUT_FAMILIES, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);

    const makeModifierRecord = (record = {}) => Object.freeze({
        ...record,
        independentModifier:true,
        numericValue:null,
        scalarForce:null,
        genericEffectiveState:null,
        actorGlobalEffectiveState:null
    });

    const makeBlockerRecord = (record = {}) => Object.freeze({
        ...record,
        numericValue:null,
        genericEffectiveState:null
    });

    const collectRootClash = (synthesis = {}) => {
        const realized = [];
        const blockers = [];
        (synthesis.rootClashInteractionEffectRecords || []).forEach((item, index) => {
            const base = {
                id:`CFIM-RC-${String(index + 1).padStart(2, '0')}`,
                family:INPUT_FAMILIES.rootClash.id,
                upstreamRecordId:item.id || '',
                modifierRole:'root-foundation-interaction',
                targetActorKey:item.actorKey || null,
                sourceActorKey:null,
                targetScope:'root-foundation',
                structureRef:item.structureRef || null,
                sourcePatternId:null,
                sourceOutcomeKind:item.sourceOutcomeKind || null,
                sourceTerms:freezeArray(item.sourceTerms || []),
                semanticState:Object.freeze({
                    standingState:item.standingState || null,
                    removalState:item.removalState || null,
                    harmState:item.harmState || null,
                    activationState:item.activationState || null
                })
            };
            if (item.resolutionStatus === INPUT_FAMILIES.rootClash.acceptedResolvedStatus) {
                realized.push(makeModifierRecord({
                    ...base,
                    resolutionStatus:'resolved-source-interaction-modifier',
                    occurrenceState:'realized-source-interaction-semantics',
                    boundary:'保留 root-clash interaction-level standing/removal/harm/activation 语义，不映射 root actor 全局 effective/ineffective。'
                }));
            } else {
                blockers.push(makeBlockerRecord({
                    ...base,
                    resolutionStatus:'unresolved-upstream-root-clash-interaction',
                    upstreamResolutionStatus:item.resolutionStatus || null,
                    boundary:'已存在具体 root-clash interaction record，但其 source-context interaction semantics 未解析，因此 interaction axis coverage 不能假装完成。'
                }));
            }
        });
        return { realized, blockers };
    };

    const isGenericUnresolvedBearing = (item = {}) =>
        !item.sourcePatternId && item.resolutionStatus === 'unresolved-no-source-specific-resolver';

    const collectStemBearing = (semanticModel = {}) => {
        const realized = [];
        const blockers = [];
        let excludedResolvedNonInteraction = 0;
        let excludedGenericUnresolved = 0;
        const acceptedStates = new Set(INPUT_FAMILIES.stemBearing.acceptedInteractionStates || []);
        const excludedStates = new Set(INPUT_FAMILIES.stemBearing.excludedResolvedStates || []);

        (semanticModel.stemBearingEffect?.records || []).forEach((item, index) => {
            if (item.resolutionStatus === INPUT_FAMILIES.stemBearing.acceptedResolvedStatus) {
                if (excludedStates.has(item.sourceBearingState)) {
                    excludedResolvedNonInteraction += 1;
                    return;
                }
                if (!acceptedStates.has(item.sourceBearingState)) return;
                realized.push(makeModifierRecord({
                    id:`CFIM-SB-${String(index + 1).padStart(2, '0')}`,
                    family:INPUT_FAMILIES.stemBearing.id,
                    upstreamRecordId:item.id || '',
                    modifierRole:item.sourceBearingState === 'source-bearing-damaged-by-clash'
                        ? 'visible-stem-bearing-damaged-by-interaction'
                        : 'visible-stem-bearing-fortified-by-interaction',
                    targetActorKey:item.actorKey || null,
                    sourceActorKey:null,
                    targetScope:'visible-stem-bearing',
                    structureRef:item.structureRef || null,
                    sourcePatternId:item.sourcePatternId || null,
                    sourceBearingState:item.sourceBearingState || null,
                    sourceTerm:item.sourceTerm || null,
                    sourceContext:Object.freeze({
                        supportActor:item.supportActor || null,
                        attackerActor:item.attackerActor || null,
                        bearingZhi:item.bearingZhi || null
                    }),
                    resolutionStatus:'resolved-source-interaction-modifier',
                    occurrenceState:'realized-source-bearing-modifier',
                    boundary:'只保存 exact-source bearing 被生扶加固或被冲损伤的交互修正；不把该结果升级为 visible stem 全局 effective/ineffective。'
                }));
                return;
            }

            if (isGenericUnresolvedBearing(item)) {
                excludedGenericUnresolved += 1;
                return;
            }

            if (item.sourcePatternId) {
                blockers.push(makeBlockerRecord({
                    id:`CFIB-SB-${String(index + 1).padStart(2, '0')}`,
                    family:INPUT_FAMILIES.stemBearing.id,
                    upstreamRecordId:item.id || '',
                    targetActorKey:item.actorKey || null,
                    structureRef:item.structureRef || null,
                    sourcePatternId:item.sourcePatternId || null,
                    resolutionStatus:'unresolved-upstream-bearing-interaction',
                    upstreamResolutionStatus:item.resolutionStatus || null,
                    boundary:'已经命中 source-specific bearing interaction pattern，但其必要 provenance/outcome 未解析，因此 interaction coverage 保持 unresolved。'
                }));
            }
        });

        return { realized, blockers, excludedResolvedNonInteraction, excludedGenericUnresolved };
    };

    const collectCrossVisibleFunctions = (synthesis = {}) => {
        const realized = [];
        const nonRealized = [];
        const blockers = [];
        let excludedDaymasterRelated = 0;

        (synthesis.visibleStemFunctionRealizationRecords || []).forEach((item, index) => {
            if (item.relationScope !== INPUT_FAMILIES.crossVisibleFunction.requiredRelationScope) {
                if (item.relationScope === 'daymaster-related') excludedDaymasterRelated += 1;
                return;
            }

            const base = {
                id:`CFIM-XF-${String(index + 1).padStart(2, '0')}`,
                family:INPUT_FAMILIES.crossVisibleFunction.id,
                upstreamRecordId:item.id || '',
                modifierRole:'cross-visible-function-interaction',
                sourceActorKey:item.sourceActorKey || null,
                targetActorKey:item.targetActorKey || null,
                targetScope:'visible-stem-function',
                structureRef:null,
                sourcePatternId:item.sourcePatternId || null,
                functionType:item.functionType || null,
                realizationState:item.realizationState || null,
                sourceTerm:item.sourceTerm || null
            };

            if (item.realizationState === INPUT_FAMILIES.crossVisibleFunction.realizedState) {
                realized.push(makeModifierRecord({
                    ...base,
                    resolutionStatus:'resolved-source-interaction-modifier',
                    occurrenceState:'realized-in-source-context',
                    boundary:'cross-visible source→target function 只修正该 target/function context；不得制造第二条 direct daymaster contribution，也不得升级 actor global effectiveness。'
                }));
                return;
            }

            if (item.realizationState === INPUT_FAMILIES.crossVisibleFunction.notRealizedState) {
                nonRealized.push(Object.freeze({
                    ...base,
                    resolutionStatus:'resolved-source-interaction-non-realization',
                    occurrenceState:'not-realized-in-source-context',
                    independentModifier:false,
                    numericValue:null,
                    genericEffectiveState:null,
                    boundary:'明确未兑现的 cross-visible edge 只记录为交互未实现，不作为实际力量 modifier。'
                }));
                return;
            }

            blockers.push(makeBlockerRecord({
                ...base,
                resolutionStatus:'unresolved-upstream-cross-visible-realization',
                upstreamResolutionStatus:item.resolutionStatus || null,
                boundary:'已存在具体 cross-visible function edge，但其 realization 尚未解析，因此 interaction axis coverage 不能视为完整。'
            }));
        });

        return { realized, nonRealized, blockers, excludedDaymasterRelated };
    };

    const collectProfileQualifiers = (synthesis = {}) => freezeArray(
        (synthesis.visibleStemActorProfileInterpretationRecords || [])
            .filter((item) => item.resolutionStatus === INPUT_FAMILIES.actorProfileQualifier.acceptedResolvedStatus)
            .map((item, index) => Object.freeze({
                id:`CFIQ-AP-${String(index + 1).padStart(2, '0')}`,
                family:INPUT_FAMILIES.actorProfileQualifier.id,
                upstreamRecordId:item.id || '',
                actorKey:item.actorKey || null,
                interpretationState:item.interpretationState || null,
                sourcePatternId:item.sourcePatternId || null,
                sourceTerms:freezeArray(item.sourceTerms || []),
                matchedSourcePatternIds:freezeArray((item.matchedEdgeContexts || []).map((edge) => edge.sourcePatternId)),
                independentModifier:false,
                numericValue:null,
                boundary:'Actor Profile Interpretation 只作为已存在 interaction edge 的组合限定语义，不单独新增力量 modifier。'
            }))
    );

    const attachQualifiers = (records = [], qualifiers = []) => freezeArray(records.map((record) => {
        const qualifierIds = qualifiers
            .filter((qualifier) => record.sourcePatternId && qualifier.matchedSourcePatternIds.includes(record.sourcePatternId))
            .map((qualifier) => qualifier.id);
        return Object.freeze({ ...record, qualifierRecordIds:freezeArray(qualifierIds) });
    }));

    const buildAdapterView = (semanticModel = {}, synthesis = {}) => {
        const rootClash = collectRootClash(synthesis);
        const bearing = collectStemBearing(semanticModel);
        const crossVisible = collectCrossVisibleFunctions(synthesis);
        const qualifierRecords = collectProfileQualifiers(synthesis);
        const realizedModifierRecords = attachQualifiers([
            ...rootClash.realized,
            ...bearing.realized,
            ...crossVisible.realized
        ], qualifierRecords);
        const blockerRecords = freezeArray([
            ...rootClash.blockers,
            ...bearing.blockers,
            ...crossVisible.blockers
        ]);
        const resolvedNonRealizationRecords = freezeArray(crossVisible.nonRealized);
        const structureRefs = freezeArray((semanticModel.structures || []).map((item) => item.id));
        const status = blockerRecords.length
            ? 'mapped-partial-unresolved-interaction-inputs'
            : 'mapped-resolved-source-interaction-modifiers';

        return Object.freeze({
            status,
            structureRefs,
            realizedModifierRecords,
            resolvedNonRealizationRecords,
            qualifierRecords,
            blockerRecords,
            coverage:Object.freeze({
                realizedModifierCount:realizedModifierRecords.length,
                resolvedNonRealizationCount:resolvedNonRealizationRecords.length,
                qualifierCount:qualifierRecords.length,
                blockerCount:blockerRecords.length,
                complete:blockerRecords.length === 0
            }),
            exclusions:Object.freeze({
                daymasterRelatedFunctionEdgesExcluded:crossVisible.excludedDaymasterRelated,
                resolvedNonInteractionBearingOutcomesExcluded:bearing.excludedResolvedNonInteraction,
                genericUnresolvedBearingRecordsExcluded:bearing.excludedGenericUnresolved
            }),
            numericValue:null,
            scalarForce:null,
            partyConfiguration:null,
            capacityInterpretation:null,
            boundary:'只有白名单中的 source-context interaction outcome 才能进入本轴。Structure presence 不制造 modifier；未兑现 edge 单列为 non-realization；profile interpretation 只作 qualifier。'
        });
    };

    const applyAdapterToProfile = (profile = {}, adapterView = {}) => {
        const priorAxes = profile.axes || {};
        const interactionModifier = Object.freeze({
            axisId:'interactionModifier',
            status:adapterView.status,
            structureRefs:adapterView.structureRefs || Object.freeze([]),
            realizedModifierRecords:adapterView.realizedModifierRecords || Object.freeze([]),
            resolvedNonRealizationRecords:adapterView.resolvedNonRealizationRecords || Object.freeze([]),
            qualifierRecords:adapterView.qualifierRecords || Object.freeze([]),
            blockerRecords:adapterView.blockerRecords || Object.freeze([]),
            exclusions:adapterView.exclusions || Object.freeze({}),
            numericValue:null,
            scalarForce:null,
            boundary:'interactionModifier 只保存已解析的 actor/function-specific source-context 修正；Structure presence、未兑现 edge 与 qualifier 各自分层，均不得折算为数值力量。'
        });
        const axes = Object.freeze({ ...priorAxes, interactionModifier });
        const unresolvedAxisIds = freezeArray(Object.values(axes)
            .filter((item) => String(item.status || '').includes('unresolved'))
            .map((item) => item.axisId));
        return Object.freeze({
            ...profile,
            status:unresolvedAxisIds.length ? 'mapped-partial-no-force-conclusion' : 'mapped-complete-no-force-conclusion',
            axes,
            unresolvedAxisIds,
            partyConfiguration:null,
            forceClassification:null,
            capacityInterpretation:null,
            numericScore:null,
            scalarForce:null,
            assessmentConclusion:null
        });
    };

    GuiJia.baziContextualForceInteractionAdapterProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        INPUT_FAMILIES,
        CONTRACT,
        collectRootClash,
        collectStemBearing,
        collectCrossVisibleFunctions,
        collectProfileQualifiers,
        buildAdapterView,
        applyAdapterToProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
