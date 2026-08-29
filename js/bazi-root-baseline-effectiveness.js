(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziRootBaselineEffectiveness?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const ROOT_BASELINE_EFFECTIVENESS_VERSION = '0.2';
    const ROOT_BASELINE_EFFECTIVENESS_RULE_ID = 'BAZI-STRENGTH-ROOT-BASELINE-EFFECTIVENESS-001';

    const baselineResolutionStatuses = Object.freeze({
        NOT_APPLICABLE:'not-applicable',
        UNRESOLVED_SOURCE_SEMANTIC_BRIDGE:'unresolved-source-semantic-bridge',
        UNRESOLVED_BEARING_CONDITION:'unresolved-bearing-condition',
        RESOLVED_SOURCE_FIRMNESS:'resolved-source-firmness'
    });

    // Reserved source-semantic vocabulary only. v0.2 still does not emit SOURCE_ROOT_FIRM.
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
            supports:Object.freeze(['broad-root-bearing-language','bearing-support-matters','bearing-damage-matters'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》命例一',
            term:'地支载以卯木财星，又得亥水生扶有情，丁火之根愈固',
            supports:Object.freeze(['dts-root-term-broader-than-project-hidden-root','support-bearing-example'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》命例二',
            term:'卯酉逢冲，克败丁火之根，支中少水，财星有克无生',
            supports:Object.freeze(['bearing-base-can-be-damaged','support-context-matters'])
        })
    ]);

    const SOURCE_SCOPE_EXAMPLES = Object.freeze([
        Object.freeze({
            id:'DTS-BEARING-SCOPE-DING-MAO-HAI-001',
            chart:'己亥 丁卯 庚申 庚辰',
            observedGan:'丁',
            observedGanElement:'火',
            bearingZhi:'卯',
            bearingZhiElement:'木',
            bearingHiddenGans:Object.freeze(['乙']),
            hidesObservedGan:false,
            sameElementAsObservedGan:false,
            supportZhi:'亥',
            supportRelation:'亥水生扶卯木',
            sourceOutcome:'丁火之根愈固',
            semanticFinding:'原例把生丁火的卯木承载基础称为“丁火之根”，其范围宽于 GuiJia exact-root / same-element-root。'
        }),
        Object.freeze({
            id:'DTS-BEARING-SCOPE-DING-MAO-YOU-002',
            chart:'己酉 丁卯 庚辰 甲申',
            observedGan:'丁',
            observedGanElement:'火',
            bearingZhi:'卯',
            bearingZhiElement:'木',
            bearingHiddenGans:Object.freeze(['乙']),
            hidesObservedGan:false,
            sameElementAsObservedGan:false,
            clashZhi:'酉',
            sourceOutcome:'克败丁火之根',
            sourceContext:'支中少水，财星有克无生',
            semanticFinding:'反例继续把卯木这一生扶承载基础称为丁火之“根”，并以卯酉冲解释其被克败。'
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
        resolutionStatus:baselineResolutionStatuses.UNRESOLVED_SOURCE_SEMANTIC_BRIDGE,
        sourceSemanticBridge:Object.freeze({
            dtsRootTermScope:'broader-than-project-root-role',
            projectRootRole:rootState.rootRole || '',
            oneToOneMapping:false,
            status:'unresolved',
            blocker:'DTS 命例中的“丁火之根”可指卯木生扶承载基础，而卯不藏丁且与丁不同五行；因此不能把 DTS 宽义“根／载”直接映射到 exact-root / same-element-root。'
        }),
        bearingCondition:Object.freeze({
            rootPresenceConfirmed:true,
            dtsBearingCondition:'支逢生扶',
            applicabilityToProjectRootActor:'blocked-by-source-semantic-bridge',
            rootBearingBranchSupportStatus:'not-evaluated',
            resolverStatus:'blocked-until-source-semantic-bridge'
        }),
        sourceRootFirmnessState:null,
        genericEffectiveState:null,
        statement:'根 actor 已确认存在，但《滴天髓》此处“根／载”的命例语义宽于 GuiJia 的 exact-root / same-element-root。必须先建立 source-semantic bridge，之后才有资格判断“支逢生扶”是否适用于该 project root actor。',
        boundary:'不得用 DTS 宽义“丁火之根愈固”等语句直接证明 project root actor 已根坚；也不得由 root presence、无不利 Structure、藏干层级或单一十二长生状态生成 source-root-firm / generic effectiveState。'
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
            inputLevel:'project-root-actor-presence',
            projectRootRoles:Object.freeze(['exact-root','same-element-root']),
            rootPresenceImpliesBaselineEffective:false,
            noRelatedStructureImpliesBaselineEffective:false,
            dtsRootTermSemanticScope:'broader-than-project-root-role',
            dtsRootTermOneToOneMapsProjectRootRole:false,
            sourceSemanticBridge:'unresolved',
            directPositiveBaselineResolver:'disabled-semantic-scope-mismatch',
            dtsSourceBearingCondition:'支逢生扶',
            bearingSupportResolver:'blocked-by-source-semantic-bridge',
            sourceFirmnessState:sourceRootFirmnessStates.SOURCE_ROOT_FIRM,
            sourceFirmnessMapsToGenericEffectiveState:false,
            exactRootAndSameElementRootEquivalent:false,
            crossSourceLongshengLuwangCompatibility:'not-established',
            numericAggregation:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'《滴天髓》确实区分“有根／根坚”并强调“支逢生扶”，但紧随其后的丁火命例把卯木这一生扶承载基础称为“丁火之根”。这证明该处“根／载”语义宽于 GuiJia 已定义的同干／同五行藏支 root actor，因此必须先解决 source semantic bridge。',
        boundary:'在 semantic bridge 未解决前，“支逢生扶”不得作为 exact-root / same-element-root 的直接正向 resolver；《子平真诠》的长生／禄旺／库也只作跨来源比较。'
    });

    const makeActorBaselineClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-ROOT-BASELINE-EFFECTIVENESS-${String(index + 1).padStart(2, '0')}`,
        claimKey:`root.actor.${record.rootStateId || index}.baseline-effectiveness`,
        status:'blocked',
        ruleId:ROOT_BASELINE_EFFECTIVENESS_RULE_ID,
        value:Object.freeze({
            resolutionStatus:record.resolutionStatus,
            sourceSemanticBridgeStatus:record.sourceSemanticBridge.status,
            sourceRootFirmnessState:null,
            genericEffectiveState:null
        }),
        sourceEffectIds:freezeArray(record.sourceEffectIds || []),
        sourceRefs:Object.freeze([]),
        dependencyIds:Object.freeze(['SD-ROOT-ACTOR-BASELINE-SOURCE-SEMANTIC-BRIDGE']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildSourceSemanticBridgeDependency = (records = []) => Object.freeze({
        id:'SD-ROOT-ACTOR-BASELINE-SOURCE-SEMANTIC-BRIDGE',
        kind:'rule-coverage',
        scope:'dts-broad-root-bearing-semantics-to-project-root-role',
        status:records.length ? 'unresolved' : 'resolved',
        sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-ROOT-BASELINE-EFFECTIVENESS-CONTRACT']),
        ruleId:ROOT_BASELINE_EFFECTIVENESS_RULE_ID,
        statement:records.length
            ? '《滴天髓》“根／载”在直接命例中包含卯木生丁火这类生扶承载基础，语义宽于 GuiJia exact-root / same-element-root；两者之间尚无一一映射规则。'
            : '本局没有 project root actor，source semantic bridge 在本局为 not-applicable。',
        boundary:'不得把原典宽义“根坚／根败”直接写入 project root actor；必须先证明目标 source 语义与 project rootRole 的对应关系。'
    });

    const buildBearingConditionDependency = (records = [], bridgeDependency = {}) => Object.freeze({
        id:'SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION',
        kind:'effectiveness',
        scope:'root-actor-bearing-support-after-semantic-bridge',
        status:records.length ? 'unresolved' : 'resolved',
        sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-ROOT-BASELINE-EFFECTIVENESS-CONTRACT']),
        ruleId:ROOT_BASELINE_EFFECTIVENESS_RULE_ID,
        dependsOnDependencyIds:Object.freeze(records.length ? [bridgeDependency.id] : []),
        statement:records.length
            ? 'DTS source-semantic bridge 尚未完成，因此“支逢生扶”是否能作为当前 project root actor 的 bearing condition 暂不评估。'
            : '本局没有 project root actor，baseline bearing condition 为 not-applicable。',
        boundary:'不得越过 semantic bridge，直接用任一生扶关系、长生状态或无冲事实满足“支逢生扶”。'
    });

    const rebuildBaselineEffectivenessDependency = (base = {}, records = [], bridgeDependency = {}, bearingDependency = {}) => {
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
            dependsOnDependencyIds:Object.freeze(records.length ? [bridgeDependency.id, bearingDependency.id] : []),
            statement:records.length
                ? 'project root actor 的存在已确认，但必须先解决 DTS 宽义“根／载”到 project rootRole 的 semantic bridge，再讨论 bearing condition 与 baseline actual effectiveness。'
                : '本局没有 project root actor，baseline effectiveness 为 not-applicable。',
            boundary:'即使未来得到 source-root-firm，也不得未经独立映射直接写入 actor.effectiveState。'
        });
    };

    const rebuildRootEffectivenessDependency = (base = {}, records = [], bridgeDependency = {}, bearingDependency = {}, baselineDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-ROOT-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-ROOT-EFFECTIVENESS',
            status:records.length ? 'unresolved' : (current.status || 'resolved'),
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                bridgeDependency.id,
                bearingDependency.id,
                baselineDependency.id
            ])),
            statement:records.length
                ? 'Root Effectiveness 的 baseline 路径已增加 source semantic bridge：原典宽义“根／载”不能直接覆盖 GuiJia project root actor；bridge、bearing 与 baseline effectiveness 尚未完成，因此 actor global effectiveState 继续待决。'
                : (current.statement || '本局未见 project root actor，Root Effectiveness 为 not-applicable。'),
            boundary:'任何 source-wide “根坚／根败”、root presence 或单一 interaction result 都不得越过 project semantic bridge 与 actor-level 汇总生成最终根状态。'
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
        const bridgeDependency = buildSourceSemanticBridgeDependency(records);
        const bearingDependency = buildBearingConditionDependency(records, bridgeDependency);
        const baselineDependency = rebuildBaselineEffectivenessDependency(base, records, bridgeDependency, bearingDependency);
        const rootEffectivenessDependency = rebuildRootEffectivenessDependency(base, records, bridgeDependency, bearingDependency, baselineDependency);
        const replacedIds = new Set([
            'SD-ROOT-ACTOR-BASELINE-SOURCE-SEMANTIC-BRIDGE',
            'SD-ROOT-ACTOR-BASELINE-BEARING-CONDITION',
            'SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS',
            'SD-ROOT-EFFECTIVENESS'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            rootEffectivenessDependency,
            bridgeDependency,
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
                projectRootRoleScope:'exact-root / same-element-root',
                dtsRootTermSemanticScope:'broader-than-project-root-role',
                sourceSemanticBridge:'unresolved',
                directPositiveBaselineResolver:'disabled-semantic-scope-mismatch',
                dtsSourceBearingCondition:'支逢生扶',
                bearingSupportResolver:'blocked-by-source-semantic-bridge',
                reservedSourceFirmnessState:sourceRootFirmnessStates.SOURCE_ROOT_FIRM,
                sourceFirmnessMapping:'unresolved',
                crossSourceCompatibility:'not-established',
                finalStrengthMapping:false
            }),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'GuiJia exact-root / same-element-root 是项目窄义 root actor；《滴天髓》本段“根／载”在直接命例中还可指生扶承载基础，两者不得混同。',
                '“丁火之根愈固”中的卯木不藏丁、也非火，因此该命例不能直接作为 project root actor 的 positive baseline resolver。',
                '必须先解决 DTS 宽义 source semantics → project rootRole 的 bridge，才可继续研究“支逢生扶”的 project-level resolver。',
                '《子平真诠》的长生／禄旺／库相关说法仍只作跨来源旁证，不自动并入 project root baseline。',
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
        SOURCE_SCOPE_EXAMPLES,
        CROSS_SOURCE_COMPARISONS,
        buildBaselineRecord,
        buildBaselineRecords,
        buildSourceSemanticBridgeDependency,
        buildBearingConditionDependency,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
