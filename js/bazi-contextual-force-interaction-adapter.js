(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForceInteractionAdapter?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForceInteractionAdapterContract) {
        document.write('<script src="./js/bazi-contextual-force-interaction-adapter-contract.js?v=13.44.0"><\/script>');
    }

    const contractApi = GuiJia.baziContextualForceInteractionAdapterContract || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, INPUT_FAMILIES, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

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

        return {
            realized,
            blockers,
            excludedResolvedNonInteraction,
            excludedGenericUnresolved
        };
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

    const makeContractClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-CONTRACT',
        claimKey:'strength.contextual-force.interaction-adapter.contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            whitelistOnly:true,
            inputFamilyIds:CONTRACT.inputFamilyIds,
            structurePresenceCreatesModifier:false,
            daymasterRelatedFunctionEdgesExcluded:true,
            profileQualifierIndependentModifier:false,
            numericAggregation:false,
            partyConfigurationMapping:false,
            finalStrengthMapping:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'上游已经分别建立 root-clash interaction semantics、exact-source Stem Bearing、edge-specific Function Realization 与 Actor Profile Interpretation。本 adapter 只负责把这些已解析且 target-specific 的结果接入 interactionModifier，不重新解释传统规则。',
        boundary:'Adapter contract resolved 不等于任何交互必然发生，也不等于 party configuration、many/few、capacity 或强弱结论已解析。'
    });

    const makeDependency = ({ id, scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind:'aggregation',
        scope,
        status,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        ruleId:RULE_ID,
        statement,
        boundary
    });

    const buildAdapterDependencies = (view = {}) => Object.freeze([
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-MODEL',
            scope:'contextual-force-interaction-adapter-contract',
            status:'resolved',
            statement:'Interaction Force Adapter 已冻结为 source-context、actor/function-target-specific 白名单映射。',
            boundary:'模型 resolved 不表示上游所有 interaction outcome 都 resolved。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-CONTRACT']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-COVERAGE',
            scope:'contextual-force-known-interaction-input-coverage',
            status:view.blockerRecords?.length ? 'unresolved' : 'resolved',
            statement:view.blockerRecords?.length
                ? `存在 ${view.blockerRecords.length} 条已识别 interaction input 尚无 source-context outcome。`
                : '当前白名单内已识别的 interaction inputs 均已解析、明确未兑现，或在本局不适用。',
            boundary:'Coverage 不要求所有 Structure 都有 modifier；普通刑冲合会存在本身不构成 blocker。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-MODEL']
        })
    ]);

    const rebuildProfileCoverageDependency = (base = {}, profile = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE') || {};
        const unresolved = profile.unresolvedAxisIds || [];
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE',
            status:unresolved.length ? 'unresolved' : 'resolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-COVERAGE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:unresolved.length
                ? `Contextual Force profile 仍有未完成 axis：${unresolved.join('、')}。`
                : 'Contextual Force 九个证据轴均已完成可追溯映射；这只表示 evidence coverage complete。',
            boundary:'Profile coverage resolved 不等于九轴已经合成总力量，更不等于党众/势孤、多/少、capacity 或 strong/weak 已解析。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForceEvidenceProfile) return base;
        const adapterView = buildAdapterView(semanticModel, base);
        const profile = applyAdapterToProfile(base.contextualForceEvidenceProfile, adapterView);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim()]);
        const adapterDependencies = buildAdapterDependencies(adapterView);
        const profileCoverageDependency = rebuildProfileCoverageDependency(base, profile);
        const replacedIds = new Set([
            'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-MODEL',
            'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-COVERAGE',
            'SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...adapterDependencies,
            profileCoverageDependency
        ]);
        const conflicts = typeof priorSynthesisApi.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            contextualForceEvidenceProfile:profile,
            contextualForceInteractionAdapterView:adapterView,
            contextualForceInteractionAdapterContract:CONTRACT,
            contextualForceInteractionAdapterRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Interaction Force Adapter v0.1 只接入 source-context 已解析的 root clash、bearing 与 cross-visible function interaction。',
                '普通 Structure presence 不产生 modifier，也不要求每一条刑冲合会都被强行解释。',
                'daymaster-related function edge 已由 support/restraint/drain/distribution 轴承担，不在 interactionModifier 重复成为 direct strength contribution。',
                'cross-visible not-realized edge 单列为 non-realization；Actor Profile Interpretation 只作 qualifier，避免同一证据重复计力。',
                '九轴 profile coverage 可以 resolved，但 party configuration、many/few、capacity interpretation、Strength Synthesis 与 Assessment 仍继续阻断。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForceInteractionAdapterView:buildAdapterView,
        applyContextualForceInteractionAdapterToProfile:applyAdapterToProfile
    });

    GuiJia.baziContextualForceInteractionAdapter = Object.freeze({
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
        applyAdapterToProfile,
        buildAdapterDependencies,
        rebuildProfileCoverageDependency,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
