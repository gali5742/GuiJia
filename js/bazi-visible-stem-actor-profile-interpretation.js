(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemActorProfileInterpretation?.installed) return;

    // Research bootstrap dependency: ./js/bazi-visible-stem-daymaster-contribution.js?v=13.44.0

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_VERSION = '0.1';
    const VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-001';

    const interpretationStates = Object.freeze({
        OUTLET_REALIZED_UNDER_RESTRAINT:'outlet-function-realized-under-restraint-in-source-context'
    });

    const resolutionStatuses = Object.freeze({
        RESOLVED_EXACT_SOURCE:'resolved-exact-source-profile-interpretation',
        BLOCKED_UPSTREAM_READINESS:'blocked-upstream-profile-readiness',
        UNRESOLVED_NO_RULE:'unresolved-no-profile-interpretation-rule',
        NOT_APPLICABLE_NO_FUNCTIONS:'not-applicable-no-function-inputs'
    });

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({
            source:'《滴天髓阐微·八格》命例',
            chart:'丁丑 癸卯 乙卯 己卯',
            terms:Object.freeze(['最喜丁火独发，泄其精英', '惜癸水克丁，仍伤秀气']),
            supports:'丁作为乙木泄秀出口的作用已经发生，同时又受到癸水直接克制；两项作用可并存解释，但不等于丁的全局有效性判断。'
        })
    ]);

    const EXACT_PROFILE_PATTERNS = Object.freeze([
        Object.freeze({
            id:'DTS-ACTOR-PROFILE-DING-OUTLET-RESTRAINED-001',
            actorKey:'visible:0:丁',
            requiredReadinessStatus:'ready-for-actor-profile-interpretation',
            requiredEdges:Object.freeze([
                Object.freeze({
                    sourcePatternId:'DTS-VISIBLE-REALIZATION-YI-GENERATES-DING-001',
                    participationRole:'target',
                    functionType:'generation',
                    realizationState:'realized-in-source-context',
                    semanticRole:'daymaster-output-realization'
                }),
                Object.freeze({
                    sourcePatternId:'DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-001',
                    participationRole:'target',
                    functionType:'restraint',
                    realizationState:'realized-in-source-context',
                    semanticRole:'active-restraint-on-output-actor'
                })
            ]),
            interpretationState:interpretationStates.OUTLET_REALIZED_UNDER_RESTRAINT,
            sourceTerms:Object.freeze(['泄其精英', '癸水克丁', '仍伤秀气']),
            scope:'exact-source-profile-only'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-CONTRACT-001',
        version:VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_VERSION,
        inputLevel:'visible-stem-actor-function-profile',
        outputLevel:'source-scoped-actor-profile-semantic-interpretation',
        requiresReadyProfileBeforeInterpretation:true,
        exactSourcePatternsOnly:true,
        mayInterpretMultipleRealizedEdgesTogether:true,
        unresolvedOrBlockedProfileCannotBeInterpreted:true,
        realizedEdgeDoesNotMeanActorEffective:true,
        interpretedProfileDoesNotMeanActorEffective:true,
        profileInterpretationDoesNotResolveVisibleEffectiveness:true,
        bearingDoesNotSubstituteForProfileInterpretation:true,
        numericAggregation:false,
        majorityVoting:false,
        priorityAggregation:false,
        orderOverwrite:false,
        actorGlobalEffectiveState:false,
        genericVisibleEffectiveState:false,
        finalStrengthMapping:false,
        statement:'本层只解释已经 ready 且命中原典明确组合语义的 actor function profile。v0.1 允许把同一 actor 上多条已兑现 edge 组合成 source-scoped profile semantics，但不把该 semantics 压成 effective / ineffective。',
        boundary:'ready 只说明已知 edge 的 realization vocabulary 完整；只有命中 exact-source profile pattern 才可形成 interpretation。未命中、未解析或受阻 profile 均不得由数量、方向、bearing 或五行关系兜底解释。'
    });

    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const entryHasPattern = (entry = {}, requirement = {}) =>
        (entry.sourcePatternIds || []).includes(requirement.sourcePatternId)
        && entry.participationRole === requirement.participationRole
        && entry.functionType === requirement.functionType
        && entry.realizationState === requirement.realizationState;

    const matchExactProfilePattern = (profile = {}) => {
        if (profile.readinessStatus !== 'ready-for-actor-profile-interpretation') return null;
        return EXACT_PROFILE_PATTERNS.find((pattern) =>
            profile.actorKey === pattern.actorKey
            && profile.readinessStatus === pattern.requiredReadinessStatus
            && pattern.requiredEdges.every((requirement) =>
                (profile.functionEntries || []).some((entry) => entryHasPattern(entry, requirement))
            )
        ) || null;
    };

    const matchedEdgeContexts = (profile = {}, pattern = {}) => freezeArray(
        (pattern.requiredEdges || []).map((requirement) => {
            const entry = (profile.functionEntries || []).find((item) => entryHasPattern(item, requirement));
            return Object.freeze({
                sourcePatternId:requirement.sourcePatternId,
                semanticRole:requirement.semanticRole,
                relationIdentity:entry?.relationIdentity || '',
                edgeContextIdentity:entry?.edgeContextIdentity || '',
                participationRole:entry?.participationRole || null,
                functionType:entry?.functionType || null,
                realizationState:entry?.realizationState || null
            });
        })
    );

    const buildInterpretationRecord = (profile = {}, index = 0) => {
        const hasFunctions = (profile.functionEntries || []).length > 0;
        const ready = profile.readinessStatus === 'ready-for-actor-profile-interpretation';
        const pattern = ready ? matchExactProfilePattern(profile) : null;

        if (!hasFunctions) {
            return Object.freeze({
                id:`VSAPI-${String(index + 1).padStart(2, '0')}`,
                actorKey:profile.actorKey || '',
                actorGan:profile.actorGan || '',
                upstreamProfileRecordId:profile.id || '',
                inputReadinessStatus:profile.readinessStatus || null,
                resolutionStatus:resolutionStatuses.NOT_APPLICABLE_NO_FUNCTIONS,
                interpretationState:null,
                sourcePatternId:null,
                sourceTerms:Object.freeze([]),
                matchedEdgeContexts:Object.freeze([]),
                actorGlobalEffectiveState:null,
                genericVisibleEffectiveState:null,
                statement:'该 actor profile 没有 function inputs，本层无 profile interpretation 对象。',
                boundary:'not-applicable 不等于有效或无效。'
            });
        }

        if (!ready) {
            return Object.freeze({
                id:`VSAPI-${String(index + 1).padStart(2, '0')}`,
                actorKey:profile.actorKey || '',
                actorGan:profile.actorGan || '',
                upstreamProfileRecordId:profile.id || '',
                inputReadinessStatus:profile.readinessStatus || null,
                resolutionStatus:resolutionStatuses.BLOCKED_UPSTREAM_READINESS,
                interpretationState:null,
                sourcePatternId:null,
                sourceTerms:Object.freeze([]),
                matchedEdgeContexts:Object.freeze([]),
                actorGlobalEffectiveState:null,
                genericVisibleEffectiveState:null,
                statement:'actor profile 仍含 unresolved、inconsistent 或未支持的 realization input，本层不得提前解释其组合语义。',
                boundary:'不得从已解析 edge 的数量、方向或 bearing 条件绕过 profile readiness。'
            });
        }

        if (!pattern) {
            return Object.freeze({
                id:`VSAPI-${String(index + 1).padStart(2, '0')}`,
                actorKey:profile.actorKey || '',
                actorGan:profile.actorGan || '',
                upstreamProfileRecordId:profile.id || '',
                inputReadinessStatus:profile.readinessStatus || null,
                resolutionStatus:resolutionStatuses.UNRESOLVED_NO_RULE,
                interpretationState:null,
                sourcePatternId:null,
                sourceTerms:Object.freeze([]),
                matchedEdgeContexts:Object.freeze([]),
                actorGlobalEffectiveState:null,
                genericVisibleEffectiveState:null,
                statement:'actor profile 已 ready，但当前没有与其 edge 组合完全匹配的原典 profile interpretation rule。',
                boundary:'ready 不得自动升级为 interpreted；不得以 realized edge 数量、role 类型或元素关系生成兜底语义。'
            });
        }

        return Object.freeze({
            id:`VSAPI-${String(index + 1).padStart(2, '0')}`,
            actorKey:profile.actorKey || '',
            actorGan:profile.actorGan || '',
            upstreamProfileRecordId:profile.id || '',
            inputReadinessStatus:profile.readinessStatus || null,
            resolutionStatus:resolutionStatuses.RESOLVED_EXACT_SOURCE,
            interpretationState:pattern.interpretationState,
            sourcePatternId:pattern.id,
            sourceTerms:freezeArray(pattern.sourceTerms || []),
            matchedEdgeContexts:matchedEdgeContexts(profile, pattern),
            actorGlobalEffectiveState:null,
            genericVisibleEffectiveState:null,
            statement:'原典同一命例明确说明丁火承担泄秀作用，同时癸水克丁而伤秀；因此只在该 exact source profile 下解释为“泄秀作用已兑现，同时受到直接克制”。',
            boundary:'该 interpretation 只描述已知 relation edges 的组合语义，不表示丁 actor 全局 effective / ineffective，也不得迁移到其他命局或其他 actor profile。'
        });
    };

    const buildInterpretationRecords = (synthesis = {}) => Object.freeze(
        (synthesis.visibleStemActorFunctionProfileRecords || []).map(buildInterpretationRecord)
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-CONTRACT',
        claimKey:'visibleStem.actor-profile-interpretation.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_RULE_ID,
        value:Object.freeze({
            exactSourcePatternsOnly:true,
            requiresReadyProfile:true,
            actorGlobalEffectiveState:false,
            profileInterpretationDoesNotResolveVisibleEffectiveness:true
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'Function Composition 已能区分 realized / not-realized / unresolved edge；下一层必须只在原典明确说明这些 edge 如何共同作用时解释 profile，而不能以数量或方向自行合成。',
        boundary:'本 Claim 不建立 generic actor-effectiveness mapping。'
    });

    const makeRecordClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.${record.actorKey || index}.actor-profile-interpretation`,
        status:record.resolutionStatus === resolutionStatuses.RESOLVED_EXACT_SOURCE
            ? 'resolved'
            : (record.resolutionStatus === resolutionStatuses.NOT_APPLICABLE_NO_FUNCTIONS ? 'resolved' : 'blocked'),
        ruleId:VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_RULE_ID,
        value:Object.freeze({
            inputReadinessStatus:record.inputReadinessStatus,
            resolutionStatus:record.resolutionStatus,
            interpretationState:record.interpretationState,
            sourcePatternId:record.sourcePatternId,
            actorGlobalEffectiveState:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependencyIds:Object.freeze(['SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-READINESS']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildModelDependency = () => Object.freeze({
        id:'SD-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-MODEL',
        kind:'effectiveness',
        scope:'visible-stem-actor-profile-semantic-interpretation-contract',
        status:'resolved',
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(['SC-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-CONTRACT']),
        ruleId:VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_RULE_ID,
        dependsOnDependencyIds:Object.freeze(['SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-MODEL']),
        statement:'Actor Profile Interpretation 已冻结为 source-scoped semantic layer：ready profile 只是候选输入，只有 exact-source profile pattern 可形成具体 interpretation。',
        boundary:'Model resolved 不等于任何 actor profile 已被解释，更不等于 Visible Effectiveness 已解析。'
    });

    const buildCoverageDependency = (records = [], recordClaims = []) => {
        const unresolved = records.filter((item) => ![
            resolutionStatuses.RESOLVED_EXACT_SOURCE,
            resolutionStatuses.NOT_APPLICABLE_NO_FUNCTIONS
        ].includes(item.resolutionStatus));
        return Object.freeze({
            id:'SD-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-COVERAGE',
            kind:'effectiveness',
            scope:'visible-stem-actor-profile-interpretation-coverage',
            status:unresolved.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze([]),
            sourceRefs:Object.freeze([]),
            sourcePatternIds:freezeArray(unique(records.map((item) => item.sourcePatternId))),
            resolvedByClaimIds:Object.freeze(recordClaims.filter((item) => item.status === 'resolved').map((item) => item.id)),
            ruleId:VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_RULE_ID,
            dependsOnDependencyIds:Object.freeze([
                'SD-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-MODEL',
                'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-READINESS'
            ]),
            statement:!records.length
                ? '本局没有 visible-stem actor profile，interpretation coverage 为 not-applicable。'
                : unresolved.length
                    ? '至少一个 actor profile 尚未 ready 或缺少 exact-source interpretation rule；coverage 继续 unresolved。'
                    : '当前所有 actor profile 均已获得 source-scoped interpretation 或为 not-applicable。',
            boundary:'Coverage 不按 resolved actor 数量、比例或多数裁决；单个 actor interpretation 也不向其他 actor 传播。'
        });
    };

    const rebuildCompositionInterpretationDependency = (base = {}, coverageDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-INTERPRETATION') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-INTERPRETATION',
            kind:'effectiveness',
            scope:'visible-stem-actor-function-profile-interpretation',
            status:coverageDependency.status,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                coverageDependency.id
            ])),
            statement:coverageDependency.status === 'resolved'
                ? '当前 actor profiles 均已获得受控 source-scoped interpretation 或为 not-applicable；这仍不等于 generic Visible Effectiveness。'
                : '已有部分 actor profile 可获得 source-scoped interpretation，但至少一个 profile 仍未 ready 或缺少 interpretation rule。',
            boundary:'profile interpretation resolved 也不得直接映射为 actor effective / ineffective；Visible Effectiveness 仍需独立语义层。'
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
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                coverageDependency.id
            ])),
            statement:'Actor Profile Interpretation 已开始获得 source-scoped 组合语义，但 generic Visible Effectiveness 尚无从 profile semantics 到 effective / ineffective 的受控映射。',
            boundary:'“泄秀已兑现但受制”等 profile semantics 不是 actor global effectiveState，不得按 realized edge 数量、是否 ready 或 source interpretation status 直接二值化。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const records = buildInterpretationRecords(base);
        const recordClaims = records.map(makeRecordClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...recordClaims]);
        const modelDependency = buildModelDependency();
        const coverageDependency = buildCoverageDependency(records, recordClaims);
        const compositionInterpretationDependency = rebuildCompositionInterpretationDependency(base, coverageDependency);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base, coverageDependency);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-INTERPRETATION',
            'SD-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-MODEL',
            'SD-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-COVERAGE'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            compositionInterpretationDependency,
            modelDependency,
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
            visibleStemActorProfileInterpretationRecords:records,
            visibleStemActorProfileInterpretationRuleIds:Object.freeze([VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_RULE_ID]),
            visibleStemActorProfileInterpretationContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Actor Profile Interpretation v0.1 只解释 ready 且 exact-source pattern 命中的 profile；未 ready 或未命中者继续阻断。',
                '丁火“泄秀已兑现但受癸克”只作为 source-scoped profile semantics，不转换为丁 actor global effective / ineffective。',
                'Actor Profile Interpretation 不使用分数、多数、优先级、edge 数量或 bearing 作为兜底解释。',
                'Visible Effectiveness、Strength Synthesis 与最终 Assessment 继续独立保持 unresolved / insufficient / not-evaluated。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildVisibleStemActorProfileInterpretationRecords:buildInterpretationRecords
        });
    }

    GuiJia.baziVisibleStemActorProfileInterpretation = Object.freeze({
        installed:true,
        VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_VERSION,
        VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_RULE_ID,
        interpretationStates,
        resolutionStatuses,
        SOURCE_BASIS,
        EXACT_PROFILE_PATTERNS,
        CONTRACT,
        entryHasPattern,
        matchExactProfilePattern,
        matchedEdgeContexts,
        buildInterpretationRecord,
        buildInterpretationRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);