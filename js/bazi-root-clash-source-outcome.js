(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziRootClashSourceOutcome?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const ROOT_CLASH_SOURCE_OUTCOME_VERSION = '0.1';
    const ROOT_CLASH_SOURCE_OUTCOME_RULE_ID = 'BAZI-STRENGTH-ROOT-SIX-CLASH-SOURCE-OUTCOME-001';

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({ source:'《滴天髓·地支》', term:'旺者冲衰衰者拔，衰神冲旺旺神发' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'得令者冲衰则拔，失时者冲旺无伤' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'冲之者有力，则能去之；冲之者无力，则反激之' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'必先察其衰旺，四柱有无解救，或抑冲，或助泄，观其大势' }),
        Object.freeze({ source:'《滴天髓阐微·地支》命例', term:'戊辰 辛酉 丙午 癸巳：子辰拱水，酉金党子冲午，四柱无解救之神，所谓“旺者冲衰衰者拔”' })
    ]);

    const sourceOutcomeKinds = Object.freeze({
        ROOT_DOMINANT:'source-unharmed-stimulated',
        COUNTERPART_DOMINANT:'source-uprooted-removed'
    });

    const SOURCE_OUTCOME_PROFILES = Object.freeze({
        'root-side-dominant':Object.freeze({
            kind:sourceOutcomeKinds.ROOT_DOMINANT,
            rootConditionTerm:'旺',
            counterpartConditionTerm:'衰',
            sourceOutcomeTerm:'发',
            sourceDamageTerm:'无伤',
            corroboratingTerms:Object.freeze(['衰神冲旺旺神发','失时者冲旺无伤','冲之者无力，则反激之']),
            statement:'完整六冲相对状态比较支持根方，按《滴天髓》“衰神冲旺旺神发”及任注“失时者冲旺无伤”，只记录根方在该六冲中的原典结果为“发／无伤”。'
        }),
        'counterpart-side-dominant':Object.freeze({
            kind:sourceOutcomeKinds.COUNTERPART_DOMINANT,
            rootConditionTerm:'衰',
            counterpartConditionTerm:'旺',
            sourceOutcomeTerm:'拔',
            sourceDamageTerm:null,
            corroboratingTerms:Object.freeze(['旺者冲衰衰者拔','得令者冲衰则拔','冲之者有力，则能去之']),
            statement:'完整六冲相对状态比较支持冲方，按《滴天髓》“旺者冲衰衰者拔”及任注“冲之者有力，则能去之”，只记录根方在该六冲中的原典结果为“拔／去”。'
        })
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const buildSourceOutcomeRecord = (record = {}, index = 0) => {
        const comparison = record.comparison || {};
        const base = {
            id:`RCSO-${String(index + 1).padStart(2, '0')}`,
            relationRecordId:record.relationRecordId || '',
            rootStateId:record.rootStateId || '',
            actorKey:record.actorKey || '',
            rootRole:record.rootRole || '',
            structureRef:record.structureRef || '',
            rootZhi:record.rootSide?.zhi || record.zhi || '',
            counterpartZhi:record.counterpartSide?.zhi || '',
            sourceEffectIds:freezeArray(record.sourceEffectIds || []),
            comparisonStatus:comparison.status || 'insufficient',
            comparisonOutcome:comparison.outcome || null,
            consideredDimensionIds:freezeArray(comparison.consideredDimensionIds || []),
            sourceBasis:SOURCE_BASIS,
            genericEffectiveState:null,
            sourceOutcomeToEffectiveState:'unresolved'
        };

        if (comparison.status !== 'resolved') {
            return Object.freeze({
                ...base,
                resolutionStatus:'unresolved-relative-state',
                sourceOutcomeKind:null,
                rootConditionTerm:null,
                counterpartConditionTerm:null,
                sourceOutcomeTerm:null,
                sourceDamageTerm:null,
                corroboratingTerms:Object.freeze([]),
                statement:'六冲相对状态 comparison 尚未 resolved，因此不能提前套用“拔／发／无伤／去／反激”等原典结果词。',
                boundary:'source outcome 必须以后续已解析的完整六冲相对状态为前提；任何单一季节、支类或解救维度都不足以触发。'
            });
        }

        const profile = SOURCE_OUTCOME_PROFILES[comparison.outcome];
        if (!profile) {
            return Object.freeze({
                ...base,
                resolutionStatus:'unresolved-incomparable-relative-state',
                sourceOutcomeKind:null,
                rootConditionTerm:null,
                counterpartConditionTerm:null,
                sourceOutcomeTerm:null,
                sourceDamageTerm:null,
                corroboratingTerms:Object.freeze([]),
                statement:'六冲必要维度虽已解析，但双方形成不可比较状态；原典没有给出可直接执行的第三类结果，因此 source outcome 保持 unresolved。',
                boundary:'incomparable 不得被多数表决、权重或偏好强行改写为“拔”或“发”。'
            });
        }

        return Object.freeze({
            ...base,
            resolutionStatus:'resolved-source-outcome',
            sourceOutcomeKind:profile.kind,
            rootConditionTerm:profile.rootConditionTerm,
            counterpartConditionTerm:profile.counterpartConditionTerm,
            sourceOutcomeTerm:profile.sourceOutcomeTerm,
            sourceDamageTerm:profile.sourceDamageTerm,
            corroboratingTerms:profile.corroboratingTerms,
            statement:profile.statement,
            boundary:'这里只把已完成的六冲相对状态翻译为《滴天髓》自身的 source outcome；“拔／发／无伤／去／反激”尚未建立到 effective / disturbed / weakened / ineffective 的项目语义映射。'
        });
    };

    const buildSourceOutcomeRecords = (synthesis = {}) => Object.freeze(
        (synthesis.clashPreconditionRecords || []).map((record, index) => buildSourceOutcomeRecord(record, index))
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-ROOT-CLASH-SOURCE-OUTCOME-CONTRACT',
        claimKey:'root.six-clash.source-outcome-contract',
        status:'resolved',
        ruleId:ROOT_CLASH_SOURCE_OUTCOME_RULE_ID,
        value:Object.freeze({
            requiredInput:'resolved-clash-relative-state-comparison',
            supportedComparisonOutcomes:Object.freeze(Object.keys(SOURCE_OUTCOME_PROFILES)),
            sourceOutcomeKinds:Object.freeze(Object.values(sourceOutcomeKinds)),
            sourceTerms:Object.freeze(['拔','发','无伤','去','反激']),
            mapsToGenericEffectiveState:false,
            numericAggregation:false,
            incomparableHasFallback:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'《滴天髓》把六冲结果写成条件化的“旺者冲衰／衰神冲旺”结果词。当前仅在完整 Relative State comparison 已形成单方语义支配时记录相应原典 source outcome。',
        boundary:'本合同只解决古籍结果词的条件触发，不解决这些词如何映射为项目内部根有效状态，也不生成最终身强弱。'
    });

    const makeOutcomeClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-ROOT-CLASH-SOURCE-OUTCOME-${String(index + 1).padStart(2, '0')}`,
        claimKey:`root.six-clash.${record.structureRef || record.id || index}.${record.rootStateId || index}.source-outcome`,
        status:'resolved',
        ruleId:ROOT_CLASH_SOURCE_OUTCOME_RULE_ID,
        value:Object.freeze({
            comparisonOutcome:record.comparisonOutcome,
            sourceOutcomeKind:record.sourceOutcomeKind,
            sourceOutcomeTerm:record.sourceOutcomeTerm,
            sourceDamageTerm:record.sourceDamageTerm,
            genericEffectiveState:null
        }),
        sourceEffectIds:freezeArray(record.sourceEffectIds || []),
        sourceRefs:freezeArray([record.structureRef]),
        dependencyIds:Object.freeze(['SD-CLASH-RELATIVE-STATE-COMPARISON']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const rebuildClashEffectivenessDependency = (base = {}, records = []) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-ROOT-SIX-CLASH-EFFECTIVENESS') || {};
        const resolvedCount = records.filter((item) => item.resolutionStatus === 'resolved-source-outcome').length;
        return Object.freeze({
            ...current,
            id:'SD-ROOT-SIX-CLASH-EFFECTIVENESS',
            status:records.length ? 'unresolved' : (current.status || 'resolved'),
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME',
                'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING'
            ])),
            statement:!records.length
                ? (current.statement || '当前没有根 actor 参与六冲，六冲根效力在本局为 not-applicable。')
                : resolvedCount === records.length
                    ? '六冲的《滴天髓》source outcome 已解析，但 source outcome → generic effectiveState 的项目映射仍未建立，因此六冲根实际效力继续 unresolved。'
                    : '至少一个 root clash 的相对状态或 source outcome 尚未解析，且 generic effectiveState 映射仍未建立，因此六冲根实际效力继续 unresolved。',
            boundary:'即使 source outcome 已出现“拔”“发”或“无伤”，也不得直接写入 rootActorStates.effectiveState。'
        });
    };

    const buildOutcomeDependency = (records = [], claimIds = []) => {
        const allResolved = records.length > 0 && records.every((item) => item.resolutionStatus === 'resolved-source-outcome');
        return Object.freeze({
            id:'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME',
            kind:'interaction',
            scope:'root-six-clash-source-outcome',
            status:records.length ? (allResolved ? 'resolved' : 'unresolved') : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze(unique(records.map((item) => item.structureRef))),
            resolvedByClaimIds:Object.freeze(records.length ? claimIds : ['SC-ROOT-CLASH-SOURCE-OUTCOME-CONTRACT']),
            ruleId:ROOT_CLASH_SOURCE_OUTCOME_RULE_ID,
            dependsOnDependencyIds:Object.freeze(records.length ? ['SD-CLASH-RELATIVE-STATE-COMPARISON'] : []),
            statement:!records.length
                ? '当前没有 root clash，六冲 source outcome 在本局为 not-applicable。'
                : allResolved
                    ? '本局所有 root clash 均已由 resolved Relative State comparison 翻译为《滴天髓》source outcome。'
                    : '至少一个 root clash 尚未形成可执行的单方 Relative State outcome，因此“拔／发／无伤”等 source outcome 仍有未解析项。',
            boundary:'source outcome 只保留原典结果层，不等于根实际有效状态。'
        });
    };

    const buildMappingDependency = (records = []) => {
        const resolved = records.filter((item) => item.resolutionStatus === 'resolved-source-outcome');
        return Object.freeze({
            id:'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING',
            kind:'effectiveness',
            scope:'root-six-clash-source-outcome-to-effective-state',
            status:resolved.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze(unique(resolved.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze(unique(resolved.map((item) => item.structureRef))),
            resolvedByClaimIds:Object.freeze(resolved.length ? [] : ['SC-ROOT-CLASH-SOURCE-OUTCOME-CONTRACT']),
            ruleId:ROOT_CLASH_SOURCE_OUTCOME_RULE_ID,
            statement:resolved.length
                ? '已得到一个或以上《滴天髓》六冲 source outcome，但“拔／发／无伤／去／反激”如何对应项目内部 root effectiveState 尚未定义。'
                : '当前没有已解析的 root clash source outcome，本局无需执行 source outcome → effectiveState 映射。',
            boundary:'不得把“拔”直接等同 ineffective，也不得把“发／无伤”直接等同 effective；映射须另立规则。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({
                ...base,
                rootClashSourceOutcomeRecords:Object.freeze([]),
                rootClashSourceOutcomeRuleIds:Object.freeze([])
            });
        }

        const records = buildSourceOutcomeRecords(base);
        const resolvedRecords = records.filter((item) => item.resolutionStatus === 'resolved-source-outcome');
        const outcomeClaims = resolvedRecords.map((record, index) => makeOutcomeClaim(record, index));
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...outcomeClaims]);
        const outcomeDependency = buildOutcomeDependency(records, outcomeClaims.map((item) => item.id));
        const mappingDependency = buildMappingDependency(records);
        const clashEffectivenessDependency = rebuildClashEffectivenessDependency(base, records);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => ![
                'SD-ROOT-SIX-CLASH-EFFECTIVENESS',
                'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME',
                'SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING'
            ].includes(item.id)),
            clashEffectivenessDependency,
            outcomeDependency,
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
            rootClashSourceOutcomeRecords:records,
            rootClashSourceOutcomeRuleIds:Object.freeze([ROOT_CLASH_SOURCE_OUTCOME_RULE_ID]),
            rootClashSourceOutcomeContract:Object.freeze({
                version:ROOT_CLASH_SOURCE_OUTCOME_VERSION,
                requiredInput:'resolved-clash-relative-state-comparison',
                sourceOutcomeTerms:Object.freeze(['拔','发','无伤','去','反激']),
                genericEffectiveStateMapping:'unresolved',
                finalStrengthMapping:false
            }),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '六冲 Relative State 只有形成单方语义支配时，才可进入《滴天髓》“拔／发／无伤”等 source outcome 层。',
                '“拔／去”与“发／无伤／反激”均为 source outcome，不自动映射为 root effective / disturbed / weakened / ineffective。',
                'source outcome resolved 仍不足以启动最终身强弱 Assessment。'
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
            buildRootClashSourceOutcomeRecords:buildSourceOutcomeRecords
        });
    }

    GuiJia.baziRootClashSourceOutcome = Object.freeze({
        installed:true,
        ROOT_CLASH_SOURCE_OUTCOME_VERSION,
        ROOT_CLASH_SOURCE_OUTCOME_RULE_ID,
        SOURCE_BASIS,
        sourceOutcomeKinds,
        SOURCE_OUTCOME_PROFILES,
        buildSourceOutcomeRecord,
        buildSourceOutcomeRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);