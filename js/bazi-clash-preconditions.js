(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziClashPreconditions?.installed) return;

    const baziCore = GuiJia.baziCore || {};
    const baseEffectsApi = GuiJia.baziStrengthEffects || null;
    const baseSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const CLASH_PRECONDITIONS_VERSION = '0.1';
    const CLASH_PRECONDITION_CONTRACT_RULE_ID = 'BAZI-STRENGTH-CLASH-PRECONDITION-CONTRACT-001';

    const comparisonStatuses = Object.freeze({
        INSUFFICIENT:'insufficient',
        RESOLVED:'resolved',
        NOT_APPLICABLE:'not-applicable'
    });

    const comparisonOutcomes = Object.freeze({
        ROOT_SIDE_DOMINANT:'root-side-dominant',
        COUNTERPART_SIDE_DOMINANT:'counterpart-side-dominant',
        INCOMPARABLE:'incomparable'
    });

    const dimensionStatuses = Object.freeze({
        UNRESOLVED:'unresolved',
        RESOLVED:'resolved',
        NOT_APPLICABLE:'not-applicable'
    });

    const dimensionPreferences = Object.freeze({
        ROOT_SIDE:'root-side',
        COUNTERPART_SIDE:'counterpart-side',
        EQUIVALENT:'equivalent'
    });

    const positionNames = Object.freeze(['year','month','day','hour']);
    const positionLabels = Object.freeze(['年支','月支','日支','时支']);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const compareSemanticDimensions = (dimensions = []) => {
        const applicable = dimensions.filter((item) => item?.status !== dimensionStatuses.NOT_APPLICABLE);
        const required = applicable.filter((item) => item?.required !== false);
        const allowedPreferences = new Set(Object.values(dimensionPreferences));
        const unresolvedRequired = required.filter((item) =>
            item?.status !== dimensionStatuses.RESOLVED || !allowedPreferences.has(item?.preference)
        );

        if (!required.length || unresolvedRequired.length) {
            return Object.freeze({
                status:comparisonStatuses.INSUFFICIENT,
                outcome:null,
                consideredDimensionIds:Object.freeze([]),
                blockingDimensionIds:Object.freeze(unresolvedRequired.map((item) => item.id).filter(Boolean)),
                rationale:required.length
                    ? '一个或以上必要语义维度尚未解析，不能进行非补偿式相对状态比较。'
                    : '尚未建立可用于相对状态比较的必要语义维度。'
            });
        }

        const considered = applicable.filter((item) =>
            item?.status === dimensionStatuses.RESOLVED && allowedPreferences.has(item?.preference)
        );
        const hasRoot = considered.some((item) => item.preference === dimensionPreferences.ROOT_SIDE);
        const hasCounterpart = considered.some((item) => item.preference === dimensionPreferences.COUNTERPART_SIDE);
        let outcome = comparisonOutcomes.INCOMPARABLE;
        if (hasRoot && !hasCounterpart) outcome = comparisonOutcomes.ROOT_SIDE_DOMINANT;
        if (hasCounterpart && !hasRoot) outcome = comparisonOutcomes.COUNTERPART_SIDE_DOMINANT;

        return Object.freeze({
            status:comparisonStatuses.RESOLVED,
            outcome,
            consideredDimensionIds:Object.freeze(considered.map((item) => item.id).filter(Boolean)),
            blockingDimensionIds:Object.freeze([]),
            rationale:hasRoot && hasCounterpart
                ? '已解析维度分别支持冲双方，且没有独立优先规则，因此保持不可比较。'
                : outcome === comparisonOutcomes.INCOMPARABLE
                    ? '必要维度均已解析，但没有一方形成严格语义支配。'
                    : '所有已解析必要维度均未出现反向证据，且至少一个维度明确支持同一方，因此形成非补偿式语义支配。'
        });
    };

    const buildBranchStructureContexts = (result = {}, semanticModel = {}) => {
        const availableStructureIds = new Set((semanticModel.structures || []).map((item) => item.id).filter(Boolean));
        const catalog = typeof baziCore.buildBaziStructureCatalog === 'function'
            ? baziCore.buildBaziStructureCatalog(result.internalRelations || [])
            : [];

        return Object.freeze(catalog.flatMap((relation) => {
            const meta = typeof baziCore.getBaziRelationMeta === 'function'
                ? baziCore.getBaziRelationMeta(relation)
                : baziCore.baziRelationMeta?.[relation.code];
            if (meta?.scope !== 'branch') return [];
            const structureRef = relation._semanticRef || relation.id || '';
            if (!structureRef || !availableStructureIds.has(structureRef)) return [];
            const participants = (relation.pillarIndices || []).map((pillarIndex) => Object.freeze({
                pillarIndex,
                position:positionNames[pillarIndex] || '',
                positionLabel:positionLabels[pillarIndex] || '',
                zhi:result.pillars?.[pillarIndex]?.zhi || ''
            }));
            return [Object.freeze({
                structureRef,
                relationCode:relation.code || '',
                relationFamily:meta?.family || '',
                structuralRole:relation.structuralRole || meta?.structuralRole || '',
                participants:Object.freeze(participants)
            })];
        }));
    };

    const enrichEffectsWithBranchStructureContexts = (result = {}, semanticModel = {}, collection = {}) => Object.freeze({
        ...collection,
        branchStructureContexts:buildBranchStructureContexts(result, semanticModel)
    });

    const buildSeasonalObservation = (monthZhi, participant = {}) => {
        const zhi = participant?.zhi || '';
        const wuxing = baziCore.getWuXing?.(zhi) || '';
        const seasonal = monthZhi && wuxing && typeof baziCore.buildMonthSeason === 'function'
            ? baziCore.buildMonthSeason(monthZhi, wuxing)
            : null;
        const state = seasonal?.states?.find((item) => item.wuxing === wuxing)?.status || '';
        return Object.freeze({
            pillarIndex:participant?.pillarIndex,
            position:participant?.position || '',
            positionLabel:participant?.positionLabel || '',
            zhi,
            wuxing,
            monthZhi:monthZhi || '',
            season:seasonal?.season || '',
            seasonalFiveState:state,
            isMonthBranch:participant?.pillarIndex === 1,
            interpretationStatus:'observed-unranked'
        });
    };

    const additionalStructureRefsForPillar = (contexts = [], pillarIndex, excludedStructureRef) => freezeArray(
        unique(contexts
            .filter((context) => context.structureRef !== excludedStructureRef)
            .filter((context) => (context.participants || []).some((item) => item.pillarIndex === pillarIndex))
            .map((context) => context.structureRef))
    );

    const makePrecondition = ({ key, observations, statement, boundary }) => Object.freeze({
        key,
        status:'unresolved',
        observations:Object.freeze({ ...observations }),
        statement,
        boundary
    });

    const buildClashPreconditionRecords = (semanticModel = {}, synthesis = {}) => {
        const contexts = semanticModel.strengthEffects?.branchStructureContexts || [];
        const contextMap = new Map(contexts.map((item) => [item.structureRef, item]));
        const monthZhi = semanticModel.strengthEvidence?.evidence?.seasonalState?.monthZhi || '';
        const records = [];

        (synthesis.rootSixRelationRecords || [])
            .filter((item) => item.relationKind === 'six-clash')
            .forEach((relationRecord) => {
                const context = contextMap.get(relationRecord.structureRef);
                const rootParticipant = (context?.participants || []).find((item) => item.pillarIndex === relationRecord.pillarIndex) || null;
                const counterpartParticipants = (context?.participants || []).filter((item) => item.pillarIndex !== relationRecord.pillarIndex);
                const counterpart = counterpartParticipants.length === 1 ? counterpartParticipants[0] : null;
                const rootSide = buildSeasonalObservation(monthZhi, rootParticipant || {
                    pillarIndex:relationRecord.pillarIndex,
                    position:positionNames[relationRecord.pillarIndex] || '',
                    positionLabel:positionLabels[relationRecord.pillarIndex] || '',
                    zhi:relationRecord.zhi || ''
                });
                const counterpartSide = buildSeasonalObservation(monthZhi, counterpart || {});
                const rootAdditionalStructureRefs = additionalStructureRefsForPillar(contexts, rootSide.pillarIndex, relationRecord.structureRef);
                const counterpartAdditionalStructureRefs = counterpart
                    ? additionalStructureRefsForPillar(contexts, counterpart.pillarIndex, relationRecord.structureRef)
                    : Object.freeze([]);
                const preconditions = Object.freeze([
                    makePrecondition({
                        key:'root-branch-relative-strength',
                        observations:{ side:rootSide },
                        statement:'根支的月令季节状态与位置事实已记录，但当前没有规则把单一旺相休囚死状态直接等同于六冲语境中的整体“旺／衰”。',
                        boundary:'季节五态只是相对状态输入之一；不得据此直接生成 root-side-dominant 或 counterpart-side-dominant。'
                    }),
                    makePrecondition({
                        key:'counterpart-branch-relative-strength',
                        observations:{ side:counterpartSide },
                        statement:'冲方的月令季节状态与位置事实已记录，但其整体有力程度仍待独立规则解析。',
                        boundary:'冲方处于旺、相、休、囚、死中的某一状态，不自动等同于其在具体六冲中的最终作用强弱。'
                    }),
                    makePrecondition({
                        key:'support-restraint-rescue-context',
                        observations:{
                            rootAdditionalStructureRefs,
                            counterpartAdditionalStructureRefs
                        },
                        statement:'冲双方参与的其他地支 Structure 已保留为上下文，但尚未判断这些关系是否实际构成扶助、制化、解救或反向牵制。',
                        boundary:'其他 Structure 的存在不得按数量相加，也不得在没有独立规则时自动归类为扶助或制化。'
                    })
                ]);
                const comparison = compareSemanticDimensions([]);

                records.push(Object.freeze({
                    id:`CP-${String(records.length + 1).padStart(2, '0')}`,
                    relationRecordId:relationRecord.id || '',
                    rootStateId:relationRecord.rootStateId || '',
                    actorKey:relationRecord.actorKey || '',
                    structureRef:relationRecord.structureRef || '',
                    sourceEffectIds:freezeArray(relationRecord.sourceEffectIds || []),
                    rootSide,
                    counterpartSide,
                    preconditions,
                    comparisonDimensions:Object.freeze([]),
                    comparison,
                    resolutionStatus:'unresolved',
                    statement:'六冲双方的可观察条件已采集，但尚不足以建立非补偿式相对状态比较。',
                    boundary:'旺相休囚死、月支位置或其他 Structure 数量都不得单独充当“旺者／衰者”的替代判据。'
                }));
            });

        return Object.freeze(records);
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-CLASH-PRECONDITION-CONTRACT',
        claimKey:'root.six-clash.precondition-comparison-contract',
        status:'resolved',
        ruleId:CLASH_PRECONDITION_CONTRACT_RULE_ID,
        value:Object.freeze({
            observationInputs:Object.freeze(['seasonalFiveState','isMonthBranch','additionalStructureRefs']),
            comparisonMethod:'non-compensatory-semantic-dominance',
            numericAggregation:false,
            singleSeasonalStateSufficient:false,
            requiredDimensionUnresolvedResult:comparisonStatuses.INSUFFICIENT,
            opposingResolvedDimensionsResult:comparisonOutcomes.INCOMPARABLE,
            allowedResolvedOutcomes:Object.freeze(Object.values(comparisonOutcomes))
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'《滴天髓》六冲结果以旺衰、有力与外围条件为前提。当前先采集可观察条件，并建立非补偿式比较合同，不把任何单一状态换算成分值或整体旺衰。',
        boundary:'只有独立规则把必要语义维度逐一解析后才允许形成相对支配；任一必要维度未解析即为 insufficient，双方各有已解析优势且无优先规则则为 incomparable。'
    });

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({
                ...base,
                clashPreconditionRecords:Object.freeze([]),
                clashPreconditionRuleIds:Object.freeze([])
            });
        }

        const records = buildClashPreconditionRecords(semanticModel, base);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim()]);
        const existingDependencies = (base.dependencies || []).map((item) => {
            if (item.id !== 'SD-ROOT-SIX-CLASH-EFFECTIVENESS') return item;
            return Object.freeze({
                ...item,
                dependsOnDependencyIds:Object.freeze(unique([
                    ...(item.dependsOnDependencyIds || []),
                    'SD-CLASH-RELATIVE-STATE-COMPARISON'
                ]))
            });
        });
        const comparisonDependency = Object.freeze({
            id:'SD-CLASH-RELATIVE-STATE-COMPARISON',
            kind:'interaction',
            scope:'root-six-clash-preconditions',
            status:records.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze(unique(records.map((item) => item.structureRef))),
            resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-CLASH-PRECONDITION-CONTRACT']),
            ruleId:CLASH_PRECONDITION_CONTRACT_RULE_ID,
            statement:records.length
                ? '六冲双方观察条件已采集，但必要语义维度仍未解析，当前比较结果为 insufficient。'
                : '当前没有根 actor 参与六冲，相对状态比较在本局为 not-applicable。',
            boundary:'不得以季节五态、月支位置、Structure 数量、分数或权重直接替代完整的六冲相对旺衰判断。'
        });
        const dependencies = Object.freeze([...existingDependencies, comparisonDependency]);
        const conflicts = typeof baseSynthesisApi?.detectConflicts === 'function'
            ? baseSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof baseSynthesisApi?.buildSufficiency === 'function'
            ? baseSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            clashPreconditionRecords:records,
            clashPreconditionRuleIds:Object.freeze([CLASH_PRECONDITION_CONTRACT_RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '六冲双方的旺相休囚死仅作为观察输入，不直接等同于《滴天髓》所谓旺者／衰者。',
                '六冲相对状态采用非补偿式语义比较：不计分、不加权；必要维度未解析则 insufficient，双方分别占优且无优先规则则 incomparable。'
            ])
        });
    };

    if (baseEffectsApi && typeof baseEffectsApi.buildStrengthEffects === 'function') {
        const originalBuildStrengthEffects = baseEffectsApi.buildStrengthEffects;
        const wrappedBuildStrengthEffects = (result = {}, semanticModel = {}) =>
            enrichEffectsWithBranchStructureContexts(result, semanticModel, originalBuildStrengthEffects(result, semanticModel));
        GuiJia.baziStrengthEffects = Object.freeze({
            ...baseEffectsApi,
            buildStrengthEffects:wrappedBuildStrengthEffects
        });
    }

    if (baseSynthesisApi && typeof baseSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = baseSynthesisApi.buildStrengthSynthesis;
        const wrappedBuildStrengthSynthesis = (semanticModel = {}) =>
            extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel));
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...baseSynthesisApi,
            buildStrengthSynthesis:wrappedBuildStrengthSynthesis,
            compareSemanticDimensions,
            buildClashPreconditionRecords
        });
    }

    GuiJia.baziClashPreconditions = Object.freeze({
        installed:true,
        CLASH_PRECONDITIONS_VERSION,
        CLASH_PRECONDITION_CONTRACT_RULE_ID,
        comparisonStatuses,
        comparisonOutcomes,
        dimensionStatuses,
        dimensionPreferences,
        compareSemanticDimensions,
        buildBranchStructureContexts,
        enrichEffectsWithBranchStructureContexts,
        buildSeasonalObservation,
        buildClashPreconditionRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
