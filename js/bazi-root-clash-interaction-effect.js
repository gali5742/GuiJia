(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziRootClashInteractionEffect?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const ROOT_CLASH_INTERACTION_EFFECT_VERSION = '0.1';
    const ROOT_CLASH_INTERACTION_EFFECT_RULE_ID = 'BAZI-STRENGTH-ROOT-SIX-CLASH-INTERACTION-EFFECT-001';

    const SOURCE_SEMANTIC_BASIS = Object.freeze([
        Object.freeze({
            source:'《滴天髓·地支》原注',
            term:'子旺午衰，冲则午拔不能立',
            supports:Object.freeze(['standingState:cannot-stand'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·地支》',
            term:'冲之者有力，则能去之',
            supports:Object.freeze(['removalState:removable-by-clash'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·地支》',
            term:'失时者冲旺无伤',
            supports:Object.freeze(['harmState:unharmed'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·地支》',
            term:'冲之者无力，则反激之',
            supports:Object.freeze(['activationState:stimulated-by-clash'])
        }),
        Object.freeze({
            source:'《滴天髓·地支》原注',
            term:'子衰午旺，冲则午发而为福',
            supports:Object.freeze(['activationState:stimulated-by-clash'])
        })
    ]);

    const interactionStandingStates = Object.freeze({
        CANNOT_STAND:'cannot-stand'
    });
    const interactionRemovalStates = Object.freeze({
        REMOVABLE_BY_CLASH:'removable-by-clash'
    });
    const interactionHarmStates = Object.freeze({
        UNHARMED:'unharmed'
    });
    const interactionActivationStates = Object.freeze({
        STIMULATED_BY_CLASH:'stimulated-by-clash'
    });

    const SOURCE_KIND_INTERPRETATIONS = Object.freeze({
        'source-uprooted-removed':Object.freeze({
            standingState:interactionStandingStates.CANNOT_STAND,
            removalState:interactionRemovalStates.REMOVABLE_BY_CLASH,
            harmState:null,
            activationState:null,
            sourceTerms:Object.freeze(['拔不能立','能去之']),
            statement:'原典对这一类结果同时给出“拔不能立”与“能去之”；本层只把它解释为该根 actor 在此六冲交互中的立足状态不能维持，并具有被该冲去除的 source-semantic 结果。'
        }),
        'source-unharmed-stimulated':Object.freeze({
            standingState:null,
            removalState:null,
            harmState:interactionHarmStates.UNHARMED,
            activationState:interactionActivationStates.STIMULATED_BY_CLASH,
            sourceTerms:Object.freeze(['无伤','反激','发']),
            statement:'原典对这一类结果明确称“无伤”，并以“反激”“发”描述冲后的发动；本层只记录该六冲交互中的未受伤与被激发语义。'
        })
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const buildInteractionEffectRecord = (sourceOutcome = {}, index = 0) => {
        const base = {
            id:`RCIE-${String(index + 1).padStart(2, '0')}`,
            sourceOutcomeRecordId:sourceOutcome.id || '',
            relationRecordId:sourceOutcome.relationRecordId || '',
            rootStateId:sourceOutcome.rootStateId || '',
            actorKey:sourceOutcome.actorKey || '',
            rootRole:sourceOutcome.rootRole || '',
            structureRef:sourceOutcome.structureRef || '',
            rootZhi:sourceOutcome.rootZhi || '',
            counterpartZhi:sourceOutcome.counterpartZhi || '',
            sourceEffectIds:freezeArray(sourceOutcome.sourceEffectIds || []),
            sourceOutcomeKind:sourceOutcome.sourceOutcomeKind || null,
            sourceOutcomeTerm:sourceOutcome.sourceOutcomeTerm || null,
            sourceDamageTerm:sourceOutcome.sourceDamageTerm || null,
            sourceBasis:SOURCE_SEMANTIC_BASIS,
            standingState:null,
            removalState:null,
            harmState:null,
            activationState:null,
            genericEffectiveState:null,
            interactionToActorEffectiveState:'unresolved'
        };

        if (sourceOutcome.resolutionStatus !== 'resolved-source-outcome') {
            return Object.freeze({
                ...base,
                resolutionStatus:'unresolved-source-outcome',
                statement:'上游六冲 source outcome 尚未解析，因此不能提前生成交互语义状态。',
                boundary:'本层只解释已经成立的原典结果词；不得由六冲 Structure 或单一比较维度直接生成 cannot-stand、unharmed 或 stimulated-by-clash。'
            });
        }

        const interpretation = SOURCE_KIND_INTERPRETATIONS[sourceOutcome.sourceOutcomeKind];
        if (!interpretation) {
            return Object.freeze({
                ...base,
                resolutionStatus:'unresolved-unsupported-source-kind',
                statement:'上游 source outcome 已解析，但当前没有对应的受控原典语义解释。',
                boundary:'未知 source outcome kind 不得兜底映射为任何 interaction effect 或 generic effectiveState。'
            });
        }

        return Object.freeze({
            ...base,
            resolutionStatus:'resolved-interaction-semantics',
            standingState:interpretation.standingState,
            removalState:interpretation.removalState,
            harmState:interpretation.harmState,
            activationState:interpretation.activationState,
            sourceTerms:interpretation.sourceTerms,
            statement:interpretation.statement,
            boundary:'这些字段只描述这一条六冲交互中原典明确支持的结果语义；它们不是 rootActorStates.effectiveState，也不得跨其他 Structure 自动汇总。'
        });
    };

    const buildInteractionEffectRecords = (synthesis = {}) => Object.freeze(
        (synthesis.rootClashSourceOutcomeRecords || []).map((record, index) => buildInteractionEffectRecord(record, index))
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-ROOT-CLASH-INTERACTION-EFFECT-CONTRACT',
        claimKey:'root.six-clash.interaction-effect-contract',
        status:'resolved',
        ruleId:ROOT_CLASH_INTERACTION_EFFECT_RULE_ID,
        value:Object.freeze({
            recordLevel:'root-actor-x-six-clash-interaction',
            requiredInput:'resolved-root-clash-source-outcome',
            dimensions:Object.freeze(['standingState','removalState','harmState','activationState']),
            standingStates:Object.freeze(Object.values(interactionStandingStates)),
            removalStates:Object.freeze(Object.values(interactionRemovalStates)),
            harmStates:Object.freeze(Object.values(interactionHarmStates)),
            activationStates:Object.freeze(Object.values(interactionActivationStates)),
            actorGlobalEffectiveState:false,
            numericAggregation:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'《滴天髓》本段对六冲结果使用“拔不能立／能去之／无伤／反激／发”等不同语义。为避免把这些词粗暴压成单一 effectiveState，本层先按原文拆成 interaction-level 结果维度。',
        boundary:'interaction-level 解释不等于 actor 在整张命局中的全局有效状态；若同一根 actor 还参与其他 Structure，必须另立汇总规则。'
    });

    const makeInteractionClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-ROOT-CLASH-INTERACTION-EFFECT-${String(index + 1).padStart(2, '0')}`,
        claimKey:`root.six-clash.${record.structureRef || record.id || index}.${record.rootStateId || index}.interaction-effect`,
        status:'resolved',
        ruleId:ROOT_CLASH_INTERACTION_EFFECT_RULE_ID,
        value:Object.freeze({
            sourceOutcomeKind:record.sourceOutcomeKind,
            standingState:record.standingState,
            removalState:record.removalState,
            harmState:record.harmState,
            activationState:record.activationState,
            genericEffectiveState:null
        }),
        sourceEffectIds:freezeArray(record.sourceEffectIds || []),
        sourceRefs:freezeArray([record.structureRef]),
        dependencyIds:Object.freeze(['SD-ROOT-SIX-CLASH-SOURCE-OUTCOME']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildInterpretationDependency = (records = [], claimIds = []) => {
        const allResolved = records.length > 0 && records.every((item) => item.resolutionStatus === 'resolved-interaction-semantics');
        return Object.freeze({
            id:'SD-ROOT-SIX-CLASH-SOURCE-SEMANTIC-INTERPRETATION',
            kind:'interaction',
            scope:'root-six-clash-source-outcome-to-interaction-semantics',
            status:records.length ? (allResolved ? 'resolved' : 'unresolved') : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze(unique(records.map((item) => item.structureRef))),
            resolvedByClaimIds:Object.freeze(records.length ? claimIds : ['SC-ROOT-CLASH-INTERACTION-EFFECT-CONTRACT']),
            ruleId:ROOT_CLASH_INTERACTION_EFFECT_RULE_ID,
            dependsOnDependencyIds:Object.freeze(records.length ? ['SD-ROOT-SIX-CLASH-SOURCE-OUTCOME'] : []),
            statement:!records.length
                ? '当前没有 root clash source outcome，交互语义解释在本局为 not-applicable。'
                : allResolved
                    ? '本局所有已要求的 root clash source outcome 均已拆解为原典直接支持的 interaction-level 语义。'
                    : '至少一个 root clash 尚无可执行 source outcome，因此对应 interaction-level 语义仍未全部解析。',
            boundary:'该 dependency 只解决原典词义在交互层的受控解释，不解决 actor 全局 effectiveState。'
        });
    };

    const rebuildGenericMappingDependency = (base = {}, records = [], interpretationDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING') || {};
        const interpreted = records.filter((item) => item.resolutionStatus === 'resolved-interaction-semantics');
        return Object.freeze({
            ...current,
            id:'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING',
            kind:'effectiveness',
            scope:'root-six-clash-interaction-semantics-to-actor-effective-state',
            status:interpreted.length ? 'unresolved' : (current.status || 'resolved'),
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                interpretationDependency.id
            ])),
            resolvedByClaimIds:Object.freeze(interpreted.length ? [] : (current.resolvedByClaimIds || [])),
            ruleId:ROOT_CLASH_INTERACTION_EFFECT_RULE_ID,
            statement:interpreted.length
                ? '“拔／发／无伤／去／反激”已拆解为 interaction-level standing/removal/harm/activation 语义，但这些交互结果如何汇总为 root actor 的全局 effectiveState 尚未定义。'
                : (current.statement || '当前没有已解析的 root clash interaction semantics，本局无需执行 actor effectiveState 映射。'),
            boundary:'cannot-stand/removable-by-clash 不直接等同 actor.ineffective；unharmed/stimulated-by-clash 也不直接等同 actor.effective。必须先处理同一 actor 的其他 Structure 与多交互汇总。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({
                ...base,
                rootClashInteractionEffectRecords:Object.freeze([]),
                rootClashInteractionEffectRuleIds:Object.freeze([])
            });
        }

        const records = buildInteractionEffectRecords(base);
        const resolvedRecords = records.filter((item) => item.resolutionStatus === 'resolved-interaction-semantics');
        const interactionClaims = resolvedRecords.map((record, index) => makeInteractionClaim(record, index));
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...interactionClaims]);
        const interpretationDependency = buildInterpretationDependency(records, interactionClaims.map((item) => item.id));
        const genericMappingDependency = rebuildGenericMappingDependency(base, records, interpretationDependency);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => ![
                'SD-ROOT-SIX-CLASH-SOURCE-SEMANTIC-INTERPRETATION',
                'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING'
            ].includes(item.id)),
            interpretationDependency,
            genericMappingDependency
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
            rootClashInteractionEffectRecords:records,
            rootClashInteractionEffectRuleIds:Object.freeze([ROOT_CLASH_INTERACTION_EFFECT_RULE_ID]),
            rootClashInteractionEffectContract:Object.freeze({
                version:ROOT_CLASH_INTERACTION_EFFECT_VERSION,
                requiredInput:'resolved-root-clash-source-outcome',
                recordLevel:'root-actor-x-six-clash-interaction',
                semanticDimensions:Object.freeze(['standingState','removalState','harmState','activationState']),
                genericActorEffectiveStateMapping:'unresolved',
                finalStrengthMapping:false
            }),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '“拔不能立／能去之”只解析为该六冲交互中的 cannot-stand / removable-by-clash，不直接删除根事实，也不直接写 actor.ineffective。',
                '“无伤／反激／发”只解析为该六冲交互中的 unharmed / stimulated-by-clash，不直接写 actor.effective。',
                'interaction-level 结果必须与同一 root actor 的其他 Structure 分开保存；全局 actor state 仍须后续汇总规则。'
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
            buildRootClashInteractionEffectRecords:buildInteractionEffectRecords
        });
    }

    GuiJia.baziRootClashInteractionEffect = Object.freeze({
        installed:true,
        ROOT_CLASH_INTERACTION_EFFECT_VERSION,
        ROOT_CLASH_INTERACTION_EFFECT_RULE_ID,
        SOURCE_SEMANTIC_BASIS,
        SOURCE_KIND_INTERPRETATIONS,
        interactionStandingStates,
        interactionRemovalStates,
        interactionHarmStates,
        interactionActivationStates,
        buildInteractionEffectRecord,
        buildInteractionEffectRecords,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziRootActorInteractionAggregation) {
        document.write('<script src="./js/bazi-root-actor-interaction-aggregation.js?v=13.44.0"><\\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziRootBaselineEffectiveness) {
        document.write('<script src="./js/bazi-root-baseline-effectiveness.js?v=13.44.0"><\\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziStemBearingEffect) {
        document.write('<script src="./js/bazi-stem-bearing-effect.js?v=13.44.0"><\\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);
