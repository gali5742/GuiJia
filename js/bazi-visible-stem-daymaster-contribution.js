(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemDaymasterContribution?.installed) return;

    // Research bootstrap dependency: ./js/bazi-qianli-strength-composition.js?v=13.44.0

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const VISIBLE_STEM_DAYMASTER_CONTRIBUTION_VERSION = '0.1';
    const VISIBLE_STEM_DAYMASTER_CONTRIBUTION_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-001';

    const contributionStates = Object.freeze({
        REALIZED:'realized-daymaster-contribution-in-source-context',
        NOT_REALIZED:'not-realized-daymaster-contribution-in-source-context',
        UNRESOLVED:'unresolved-daymaster-contribution'
    });

    const resolutionStatuses = Object.freeze({
        RESOLVED_REALIZED:'resolved-realized-daymaster-contribution',
        RESOLVED_NOT_REALIZED:'resolved-not-realized-daymaster-contribution',
        UNRESOLVED_FUNCTION:'unresolved-function-realization',
        UNRESOLVED_PROFILE:'unresolved-realized-edge-profile-context',
        UNRESOLVED_MEANING:'unresolved-strength-meaning'
    });

    const supportedStrengthMeanings = Object.freeze(['support', 'restraint', 'drain', 'distribution']);

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-DAYMASTER-CONTRIBUTION-CONTRACT-001',
        version:VISIBLE_STEM_DAYMASTER_CONTRIBUTION_VERSION,
        inputLevel:'daymaster-related-function-realization-plus-actor-profile-context',
        outputLevel:'edge-specific-daymaster-strength-contribution',
        daymasterRelatedEdgesOnly:true,
        crossVisibleEdgesDoNotBecomeDirectStrengthContributions:true,
        strengthMeaningPreservedFromDirectedFunction:true,
        realizedEdgeNeedsResolvedProfileContextForPositiveContribution:true,
        notRealizedEdgeMayResolveSpecificContributionAbsence:true,
        profileInterpretationMayQualifyButNotCreateFunctionRealization:true,
        actorGlobalEffectivenessNotRequired:true,
        actorGlobalEffectiveState:false,
        genericVisibleEffectiveState:false,
        visibleEffectivenessCompatibilityGateUsesContributionCoverage:true,
        scalarCollapse:false,
        numericAggregation:false,
        majorityVoting:false,
        priorityAggregation:false,
        orderOverwrite:false,
        finalStrengthMapping:false,
        statement:'本层不再尝试把一个 visible stem 压成全局 effective / ineffective，而是逐条解释它与日主直接相关的 support / restraint / drain / distribution function 是否形成实际 strength contribution。正向 realized edge 若仍有未解析 actor-profile context，只能保留“edge 已兑现、profile context 未解”，不能直接进入完整 contribution coverage。',
        boundary:'同一 visible stem 对不同 target 的 realization 可以不同；cross-visible edge 只可通过 actor profile 作为 qualifier 影响日主相关 contribution，不得直接制造第二份扶克泄分力。resolved contribution 也不是最终身强弱结论。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const daymasterRealizationRecords = (synthesis = {}) => (synthesis.visibleStemFunctionRealizationRecords || [])
        .filter((item) => item.relationScope === 'daymaster-related');

    const visibleActorKeyFor = (record = {}) => {
        const participants = unique([
            ...(record.participantActorKeys || []),
            record.sourceActorKey,
            record.targetActorKey,
            ...(record.peerParticipantActorKeys || [])
        ]);
        return participants.find((item) => String(item).startsWith('visible:')) || '';
    };

    const profileInterpretationByActor = (synthesis = {}) => new Map(
        (synthesis.visibleStemActorProfileInterpretationRecords || []).map((item) => [item.actorKey, item])
    );

    const resolvedProfileContext = (record = {}) => record.resolutionStatus === 'resolved-exact-source-profile-interpretation';

    const buildContributionInterpretation = (strengthMeaning, profileState) => {
        if (strengthMeaning === 'drain' && profileState === 'outlet-function-realized-under-restraint-in-source-context') {
            return 'realized-drain-through-restrained-outlet-in-source-context';
        }
        return `realized-${strengthMeaning}-contribution-in-source-context`;
    };

    const buildContributionRecord = (realizationRecord = {}, synthesis = {}, index = 0) => {
        const visibleActorKey = visibleActorKeyFor(realizationRecord);
        const profileRecord = profileInterpretationByActor(synthesis).get(visibleActorKey) || null;
        const base = {
            id:`VSDMC-${String(index + 1).padStart(2, '0')}`,
            functionRealizationRecordId:realizationRecord.id || '',
            upstreamDirectedFunctionRecordId:realizationRecord.upstreamDirectedFunctionRecordId || null,
            visibleActorKey,
            relationFromDayMaster:realizationRecord.relationFromDayMaster || null,
            flow:realizationRecord.flow || null,
            functionType:realizationRecord.functionType || null,
            strengthMeaning:realizationRecord.strengthMeaning || null,
            directed:realizationRecord.directed,
            sourceActorKey:realizationRecord.sourceActorKey || null,
            targetActorKey:realizationRecord.targetActorKey || null,
            peerParticipantActorKeys:freezeArray(realizationRecord.peerParticipantActorKeys || []),
            sourcePatternId:realizationRecord.sourcePatternId || null,
            functionRealizationState:realizationRecord.realizationState || null,
            functionResolutionStatus:realizationRecord.resolutionStatus || null,
            profileInterpretationRecordId:profileRecord?.id || null,
            profileInterpretationState:profileRecord?.interpretationState || null,
            profileResolutionStatus:profileRecord?.resolutionStatus || null,
            contributionState:contributionStates.UNRESOLVED,
            contributionInterpretation:null,
            resolutionStatus:resolutionStatuses.UNRESOLVED_FUNCTION,
            actorGlobalEffectiveState:null,
            genericVisibleEffectiveState:null
        };

        if (!supportedStrengthMeanings.includes(base.strengthMeaning)) {
            return Object.freeze({
                ...base,
                resolutionStatus:resolutionStatuses.UNRESOLVED_MEANING,
                statement:'day-master-related function 已存在，但当前 strengthMeaning 未登记到 contribution contract。',
                boundary:'未知 strengthMeaning 不得兜底归入扶、克、泄或分力，也不得生成 actor global state。'
            });
        }

        if (base.functionRealizationState === 'not-realized-in-source-context') {
            return Object.freeze({
                ...base,
                contributionState:contributionStates.NOT_REALIZED,
                resolutionStatus:resolutionStatuses.RESOLVED_NOT_REALIZED,
                statement:`该 ${base.strengthMeaning} function 在对应 source context 下已明确未兑现，因此只解析为这一条日主 contribution 未形成。`,
                boundary:'specific contribution 未形成不等于 visible actor 全局 ineffective，也不向其他 target 或其他 function 传播。'
            });
        }

        if (base.functionRealizationState !== 'realized-in-source-context') {
            return Object.freeze({
                ...base,
                statement:'该 day-master-related function 的 realization 尚未解析，因此不能生成实际 strength contribution。',
                boundary:'relation / flow / strengthMeaning 已知仍不等于 contribution 已发生；不得用五行字面关系或 presence 补齐 realization。'
            });
        }

        if (!profileRecord || !resolvedProfileContext(profileRecord)) {
            return Object.freeze({
                ...base,
                resolutionStatus:resolutionStatuses.UNRESOLVED_PROFILE,
                statement:'该 day-master-related edge 已由上游解析为 realized，但 visible actor 的 profile context 尚无受控解释，因此暂不把正向 edge 升级为完整 strength contribution。',
                boundary:'realized edge 与完整 contribution interpretation 分层；不得忽略同一 visible actor 上可能存在的 cross-visible restraint / support 等未解上下文。'
            });
        }

        return Object.freeze({
            ...base,
            contributionState:contributionStates.REALIZED,
            contributionInterpretation:buildContributionInterpretation(base.strengthMeaning, profileRecord.interpretationState),
            resolutionStatus:resolutionStatuses.RESOLVED_REALIZED,
            statement:base.strengthMeaning === 'drain' && profileRecord.interpretationState === 'outlet-function-realized-under-restraint-in-source-context'
                ? '日主→丁的泄秀／输出 function 已兑现，同时丁这一 outlet 又受到已兑现的直接克制；因此只记录“泄力 contribution 已发生但 outlet 受制”的 source-scoped 语义。'
                : `该 ${base.strengthMeaning} function 已兑现，且 actor profile context 已获得受控解释，因此形成对应的 source-scoped daymaster contribution。`,
            boundary:'contribution realized 只说明这一条与日主直接相关的作用实际发生；不得因此给 visible actor 写 effective，也不得直接生成身强弱。'
        });
    };

    const buildContributionRecords = (synthesis = {}) => Object.freeze(
        daymasterRealizationRecords(synthesis).map((item, index) => buildContributionRecord(item, synthesis, index))
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-CONTRACT',
        claimKey:'visibleStem.daymaster-contribution.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_DAYMASTER_CONTRIBUTION_RULE_ID,
        value:Object.freeze({
            edgeSpecific:true,
            daymasterRelatedOnly:true,
            actorGlobalEffectivenessRequired:false,
            crossVisibleEdgesAreModifiersNotDirectContributions:true,
            positiveRealizationNeedsProfileContext:true,
            numericAggregation:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'Directed Function 已为每条日主相关 relation 保留 support / restraint / drain / distribution，Function Realization 又逐 edge 判断作用是否兑现；因此 Strength Synthesis 真正需要的是这些日主相关 contribution 的 coverage，而不是把整根明干压成单一 effective / ineffective。',
        boundary:'这是对既有语义链的层级修正，不新增计分规则，也不把 cross-visible interaction 重复计为日主直接贡献。'
    });

    const makeRecordClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.${record.visibleActorKey || index}.daymaster-contribution.${record.functionRealizationRecordId || index}`,
        status:[resolutionStatuses.RESOLVED_REALIZED, resolutionStatuses.RESOLVED_NOT_REALIZED].includes(record.resolutionStatus) ? 'resolved' : 'blocked',
        ruleId:VISIBLE_STEM_DAYMASTER_CONTRIBUTION_RULE_ID,
        value:Object.freeze({
            relationFromDayMaster:record.relationFromDayMaster,
            strengthMeaning:record.strengthMeaning,
            functionRealizationState:record.functionRealizationState,
            contributionState:record.contributionState,
            contributionInterpretation:record.contributionInterpretation,
            actorGlobalEffectiveState:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependencyIds:Object.freeze(['SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildModelDependency = () => Object.freeze({
        id:'SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-MODEL',
        kind:'effectiveness',
        scope:'daymaster-related-edge-strength-contribution-contract',
        status:'resolved',
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(['SC-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-CONTRACT']),
        ruleId:VISIBLE_STEM_DAYMASTER_CONTRIBUTION_RULE_ID,
        dependsOnDependencyIds:Object.freeze(['SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL']),
        statement:'Daymaster Contribution v0.1 已冻结为 edge-specific 模型：只消费 day-master-related function realization，并保留 Directed Function 的 strengthMeaning。',
        boundary:'模型 resolved 不表示 contribution coverage 完整，也不要求 actor-global effectiveness。'
    });

    const buildCoverageDependency = (records = [], claims = []) => {
        const unresolved = records.filter((item) => ![
            resolutionStatuses.RESOLVED_REALIZED,
            resolutionStatuses.RESOLVED_NOT_REALIZED
        ].includes(item.resolutionStatus));
        return Object.freeze({
            id:'SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-COVERAGE',
            kind:'effectiveness',
            scope:'daymaster-related-visible-stem-contribution-coverage',
            status:unresolved.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze([]),
            sourceRefs:Object.freeze([]),
            sourcePatternIds:freezeArray(unique(records.map((item) => item.sourcePatternId))),
            resolvedByClaimIds:Object.freeze(claims.filter((item) => item.status === 'resolved').map((item) => item.id)),
            ruleId:VISIBLE_STEM_DAYMASTER_CONTRIBUTION_RULE_ID,
            dependsOnDependencyIds:Object.freeze([
                'SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-MODEL',
                'SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE',
                'SD-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-COVERAGE'
            ]),
            statement:!records.length
                ? '本局无非日主明干的 day-master-related function，contribution coverage 为 not-applicable。'
                : unresolved.length
                    ? '至少一条日主相关 function 尚未 realization 或已 realized 但 actor-profile context 未解析，contribution coverage 继续 unresolved。'
                    : '当前所有日主相关 visible-stem functions 均已解析为 realized / not-realized strength contribution。',
            boundary:'Coverage 不按 realized 数量、方向数量或比例决定；不同 support / restraint / drain / distribution contribution 必须保持正交。'
        });
    };

    const rebuildVisibleEffectivenessDependency = (base = {}, coverage = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'visible-stem-daymaster-contribution-coverage',
            status:coverage.status,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                coverage.id
            ])),
            resolvedByClaimIds:freezeArray(coverage.status === 'resolved' ? coverage.resolvedByClaimIds : []),
            ruleId:VISIBLE_STEM_DAYMASTER_CONTRIBUTION_RULE_ID,
            actorGlobalEffectivenessRequired:false,
            compatibilityMeaning:'visible-stem-daymaster-contribution-coverage',
            statement:coverage.status === 'resolved'
                ? '兼容 dependency `SD-VISIBLE-EFFECTIVENESS` 已由 daymaster contribution coverage 满足；这里不再要求为每个 visible stem 生成 actor-global effective / ineffective。'
                : '兼容 dependency `SD-VISIBLE-EFFECTIVENESS` 继续 unresolved，因为至少一条与日主直接相关的 visible-stem contribution 尚未完整解析。',
            boundary:'该 ID 为既有 Synthesis compatibility gate；其满足条件已明确为 daymaster-related contribution coverage，而不是 actor-global 二值状态。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const records = buildContributionRecords(base);
        const recordClaims = records.map(makeRecordClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...recordClaims]);
        const modelDependency = buildModelDependency();
        const coverageDependency = buildCoverageDependency(records, recordClaims);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base, coverageDependency);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-MODEL',
            'SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-COVERAGE'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
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
            visibleStemDaymasterContributionRecords:records,
            visibleStemDaymasterContributionRuleIds:Object.freeze([VISIBLE_STEM_DAYMASTER_CONTRIBUTION_RULE_ID]),
            visibleStemDaymasterContributionContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Daymaster Contribution v0.1 以 day-master-related edge 为强弱贡献单位，不要求 visible stem actor-global effective / ineffective。',
                'realized function 若 actor profile context 尚未解释，只能保留 realized-edge / unresolved-profile，不能进入完整 contribution coverage。',
                'cross-visible edge 只能通过 actor profile qualifier 影响直接 contribution，不重复制造扶克泄分力。',
                '`SD-VISIBLE-EFFECTIVENESS` 作为兼容 gate 改以 daymaster contribution coverage 为满足条件；最终 Strength / Assessment 仍独立受其他 dependency 与正向 Synthesis rule 约束。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildVisibleStemDaymasterContributionRecords:buildContributionRecords
        });
    }

    GuiJia.baziVisibleStemDaymasterContribution = Object.freeze({
        installed:true,
        VISIBLE_STEM_DAYMASTER_CONTRIBUTION_VERSION,
        VISIBLE_STEM_DAYMASTER_CONTRIBUTION_RULE_ID,
        contributionStates,
        resolutionStatuses,
        supportedStrengthMeanings,
        CONTRACT,
        daymasterRealizationRecords,
        visibleActorKeyFor,
        buildContributionInterpretation,
        buildContributionRecord,
        buildContributionRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
