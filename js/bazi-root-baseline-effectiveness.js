(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziRootBaselineEffectiveness?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const ROOT_BASELINE_EFFECTIVENESS_VERSION = '0.1';
    const ROOT_BASELINE_EFFECTIVENESS_RULE_ID = 'BAZI-STRENGTH-ROOT-BASELINE-EFFECTIVENESS-001';

    const baselineResolutionStatuses = Object.freeze({
        NOT_APPLICABLE:'not-applicable',
        UNRESOLVED_BEARING_CONDITION:'unresolved-bearing-condition',
        RESOLVED_SOURCE_FIRMNESS:'resolved-source-firmness'
    });

    // Reserved source-semantic vocabulary only. v0.1 does not emit SOURCE_ROOT_FIRM.
    const sourceRootFirmnessStates = Object.freeze({
        SOURCE_ROOT_FIRM:'source-root-firm'
    });

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({
            source:'《滴天髓·干支总论》原注／任氏注',
            term:'不论有根无根，俱要天覆地载',
            supports:Object.freeze(['root-presence-alone-insufficient'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》',
            term:'干通根于支，支逢生扶，则干之根坚，支逢冲克，则干之根拔矣',
            supports:Object.freeze(['root-bearing-branch-condition-required','source-root-firm-when-supported'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》命例',
            term:'庚金虽生春令，支坐禄旺，时逢印比，足以用官',
            supports:Object.freeze(['explicit-combined-bearing-example'])
        })
    ]);

    const CROSS_SOURCE_COMPARISONS = Object.freeze([
        Object.freeze({
            source:'《子平真诠·论阴阳生死》',
            term:'人之日主，不必生逢禄旺，即月令休囚，而年日时中，得长生禄旺，便不为弱，就使逢库，亦为有根',
            comparisonMeaning:'年日时支的长生／禄旺／库被明确视为日主不弱或有根的依据。',
            compatibility:'not-established',
            use:'comparison-only'
        }),
        Object.freeze({
            source:'徐乐吾《子平真诠评注》',
            term:'天干通根，不仅禄旺为美，长生、余气、墓库皆其根也',
            comparisonMeaning:'通根范围被扩展解释为禄旺、长生、余气、墓库等多类承载。',
            compatibility:'not-established',
            use:'comparison-only'
        })
    ]);

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const buildBaselineRecord = (rootState = {}, index = 0) => Object.freeze({
        id:`RBE-${String(index + 1).padStart(2, '0')}`,
        rootStateId:rootState.id || '',
        actorKey:rootState.actorKey || '',
        rootRole:rootState.rootRole || '',
        pillarIndex:rootState.pillarIndex,
        position:rootState.position || '',
        zhi:rootState.zhi || '',
        gan:rootState.gan || '',
        level:rootState.level || '',
        presence:rootState.presence || 'present',
        relatedStructureRefs:freezeArray(rootState.relatedStructureRefs || []),
        sourceEffectIds:freezeArray(rootState.sourceEffectIds || []),
        resolutionStatus:baselineResolutionStatuses.UNRESOLVED_BEARING_CONDITION,
        bearingCondition:Object.freeze({
            rootPresenceConfirmed:true,
            rootBearingBranchSupportStatus:'unresolved',
            requiredSourceCondition:'支逢生扶',
            resolverStatus:'unresolved-no-independent-branch-support-rule'
        }),
        sourceRootFirmnessState:null,
        genericEffectiveState:null,
        statement:'根 actor 已确认存在，但《滴天髓》把“根坚”明确放在“支逢生扶”的条件之后；当前尚无独立规则解析根所在支是否满足该承载／生扶条件。',
        boundary:'root presence、没有不利 Structure、藏干层级或单一十二长生状态均不得单独替代“支逢生扶”条件；本层不输出 source-root-firm 或 generic effectiveState。'
    });

    const buildBaselineRecords = (synthesis = {}) => Object.freeze(
        (synthesis.rootActorStates || []).map((record, index) => buildBaselineRecord(record, index))
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-ROOT-BASELINE-EFFECTIVENESS-CONTRACT',
        claimKey:'root.actor.baseline-effectiveness-contract',
        status:'resolved',
        ruleId:ROOT_BASELINE_EFFECTIVENESS_RULE_ID,
        value:Object.freeze({
            inputLevel:'root-actor-presence',
            rootPresenceImpliesBaselineEffective:false,
            noRelatedStructureImpliesBaselineEffective:false,
            sourceFirmnessState:sourceRootFirmnessStates.SOURCE_ROOT_FIRM,
            sourceFirmnessRequiresResolvedBearingSupport:true,
            bearingSupportResolver:'unresolved',
            sourceFirmnessMapsToGenericEffectiveState:false,
            exactRootAndSameElementRootEquivalent:false,
            crossSourceLongshengLuwangCompatibility:'not-established',
            numericAggregation:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'《滴天髓》明确区分“通根”与“根坚”：干通根于支后，还要看承载该根的支是否逢生扶或冲克。本合同因此只建立 baseline 条件边界，不把根的存在直接升级为实际有效。',
        boundary:'“支逢生扶”的具体 resolver 尚未建立；《子平真诠》的长生／禄旺／库规则只作跨来源比较，不自动补齐《滴天髓》条件。'
    });

    const makeActorBaselineClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-ROOT-BASELINE-EFFECTIVENESS-${String(index + 1).padStart(2, '0')}`,
        claimKey:`root.actor.${record.rootStateId || index}.baseline-effectiveness`,
        status:'blocked',
        ruleId:ROOT_BASELINE_EFFECTIVENESS_RULE_ID,
        value:Object.freeze({
            resolutionStatus:record.resolutionStatus,
            sourceRootFirmnessState:null,
            genericEffectiveState:null
        }),
        sourceEffectIds:freezeArray(record.sourceEffectIds || []),
        sourceRefs:Object.freeze([]),
        dependencyIds:Object.freeze(['SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildBearingConditionDependency = (records = []) => Object.freeze({
        id:'SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION',
        kind:'effectiveness',
        scope:'root-actor-bearing-branch-support',
        status:records.length ? 'unresolved' : 'resolved',
        sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-ROOT-BASELINE-EFFECTIVENESS-CONTRACT']),
        ruleId:ROOT_BASELINE_EFFECTIVENESS_RULE_ID,
        statement:records.length
            ? '《滴天髓》要求“支逢生扶”后方可称“干之根坚”；当前尚无独立 branch-support resolver，因此所有 root actor 的 baseline bearing condition 保持 unresolved。'
            : '本局没有 root actor，baseline bearing condition 为 not-applicable。',
        boundary:'不得用 root presence、无冲、无相关 Structure、藏干层级或十二长生单一状态替代“支逢生扶”的独立解析。'
    });

    const rebuildBaselineEffectivenessDependency = (base = {}, records = [], bearingDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'root-actor-baseline-effectiveness',
            status:records.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze([]),
            resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-ROOT-BASELINE-EFFECTIVENESS-CONTRACT']),
            ruleId:ROOT_BASELINE_EFFECTIVENESS_RULE_ID,
            dependsOnDependencyIds:Object.freeze(records.length ? [bearingDependency.id] : []),
            statement:records.length
                ? '根 actor 的存在已经确认，但 baseline actual effectiveness 仍须先解析《滴天髓》“支逢生扶”承载条件，并另行定义 source-root-firm 到 generic effectiveState 的映射。'
                : '本局没有 root actor，baseline effectiveness 为 not-applicable。',
            boundary:'即使未来得到 source-root-firm，也不得未经独立映射直接写入 actor.effectiveState。'
        });
    };

    const rebuildRootEffectivenessDependency = (base = {}, records = [], bearingDependency = {}, baselineDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-ROOT-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-ROOT-EFFECTIVENESS',
            status:records.length ? 'unresolved' : (current.status || 'resolved'),
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                bearingDependency.id,
                baselineDependency.id
            ])),
            statement:records.length
                ? 'Root Effectiveness 已明确拆分为 interaction coverage/aggregation 与 baseline bearing/effectiveness；当前 baseline bearing 条件仍 unresolved，因此 actor global effectiveState 继续保持待决。'
                : (current.statement || '本局未见 root actor，Root Effectiveness 为 not-applicable。'),
            boundary:'任何 root presence、单一 interaction result 或 source-root-firm 都不得越过 actor-level 汇总与映射规则直接生成最终根状态。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({
                ...base,
                rootBaselineEffectivenessRecords:Object.freeze([]),
                rootBaselineEffectivenessRuleIds:Object.freeze([])
            });
        }

        const records = buildBaselineRecords(base);
        const actorClaims = records.map((record, index) => makeActorBaselineClaim(record, index));
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...actorClaims]);
        const bearingDependency = buildBearingConditionDependency(records);
        const baselineDependency = rebuildBaselineEffectivenessDependency(base, records, bearingDependency);
        const rootEffectivenessDependency = rebuildRootEffectivenessDependency(base, records, bearingDependency, baselineDependency);
        const replacedIds = new Set([
            'SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION',
            'SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS',
            'SD-ROOT-EFFECTIVENESS'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            rootEffectivenessDependency,
            bearingDependency,
            baselineDependency
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
            rootBaselineEffectivenessRecords:records,
            rootBaselineEffectivenessRuleIds:Object.freeze([ROOT_BASELINE_EFFECTIVENESS_RULE_ID]),
            rootBaselineEffectivenessContract:Object.freeze({
                version:ROOT_BASELINE_EFFECTIVENESS_VERSION,
                sourceSystem:'DTS-bearing-root',
                rootPresenceImpliesBaselineEffective:false,
                requiredBearingCondition:'支逢生扶',
                bearingSupportResolver:'unresolved',
                reservedSourceFirmnessState:sourceRootFirmnessStates.SOURCE_ROOT_FIRM,
                sourceFirmnessMapping:'unresolved',
                crossSourceCompatibility:'not-established',
                finalStrengthMapping:false
            }),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '《滴天髓》“通根”与“根坚”保持分层：root presence 不自动等于 baseline effective。',
                '“支逢生扶”尚无独立 resolver；在该条件解析前不输出 source-root-firm。',
                '《子平真诠》的长生／禄旺／库相关说法目前仅作跨来源旁证，不自动并入 DTS baseline resolver。',
                '即使未来得到 source-root-firm，也仍须独立规则映射到 actor global effectiveState。'
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
            buildRootBaselineEffectivenessRecords:buildBaselineRecords
        });
    }

    GuiJia.baziRootBaselineEffectiveness = Object.freeze({
        installed:true,
        ROOT_BASELINE_EFFECTIVENESS_VERSION,
        ROOT_BASELINE_EFFECTIVENESS_RULE_ID,
        baselineResolutionStatuses,
        sourceRootFirmnessStates,
        SOURCE_BASIS,
        CROSS_SOURCE_COMPARISONS,
        buildBaselineRecord,
        buildBaselineRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
