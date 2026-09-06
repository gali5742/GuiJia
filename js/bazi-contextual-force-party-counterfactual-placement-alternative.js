(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCounterfactualPlacementAlternative?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCounterfactualPlacementAlternativeContract || null;
    const profileApi = GuiJia.baziContextualForcePartyCounterfactualPlacementAlternativeProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, SOURCE_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceRecordIds = freezeArray(Object.keys(SOURCE_REGISTRY));

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.finiteCoverageComplete ? 'counterfactual-placement-alternative-source-scoped-complete' : 'counterfactual-placement-alternative-partial',
            contract:CONTRACT,
            profile,
            alternativeCount:profile.alternatives.length,
            resolvedAlternativeCount:profile.resolvedAlternatives.length,
            unresolvedAlternativeCount:profile.unresolvedAlternatives.length,
            finiteCoverageComplete:profile.finiteCoverageComplete,
            counterfactualPlacementAlternativeDefined:true,
            completeAlternativeChartDefined:false,
            exactAlternativeActorKeyDefined:false,
            runtimePlacementMatcherDefined:false,
            positionProvenanceAuthorizesExecution:false,
            runtimePathSelectionDefined:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceRecordIds
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE',
        claimKey:'strength.contextual-force.party.position-provenance.counterfactual-placement-alternative',
        status:audit.finiteCoverageComplete ? 'resolved' : 'unresolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            sourceRecordIds,
            coverageComplete:audit.finiteCoverageComplete,
            completeAlternativeChartDefined:false,
            exactAlternativeActorKeyDefined:false,
            runtimePlacementMatcherDefined:false,
            positionProvenanceAuthorizesExecution:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(['CF-RPP-REC-04','CF-RSMS-E04','CF-RSMS-E05']),
        rationale:'徐乐吾程潜命例的 Position Provenance source extract 同时保存“年月财生煞旺，时上食以制之”与“如辛在年月，则为食神生财，财生煞之局”，Modern Support E04/E05 又分别标记 position provenance 与 relation-path alternative。v0.1 因此可结构化“辛由时上改置年／月位置类”的 counterfactual provenance，但不能补写一张来源没有给出的替代四柱。',
        boundary:'本 claim 只冻结一个 source-scoped counterfactual placement class。它不决定辛究竟在年柱还是月柱，不处理被占位置原干的去向，不构造 alternate chart/actorKey，不执行 relation path，也不消解徐氏解释的 contested provenance。'
    });

    const makeDependency = ({ id, kind = 'semantic-model', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(['CF-RPP-REC-04','CF-RSMS-E04','CF-RSMS-E05']),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildContractDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE-CONTRACT',
        kind:'source-audit',
        scope:'xu-lewu-counterfactual-placement-class-contract',
        status:'resolved',
        statement:'Counterfactual Placement Alternative v0.1 已定义“实际 placement ↔ 来源给出的替代 placement class”数据合同，并明确不要求虚构完整 alternate chart。',
        boundary:'Contract resolved 不等于任意位置变动可推导，也不等于 counterfactual relation path 已执行。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-CROSS-LITERATURE-MODERN-SUPPORT-AUDIT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE']
    });

    const buildFiniteCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE-FINITE-COVERAGE',
        kind:'source-coverage',
        scope:'cf-rpp-rec-04-counterfactual-placement-class-coverage',
        status:audit.finiteCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteCoverageComplete
            ? 'CF-RPP-REC-04 中“时上辛”与“如辛在年月”的 source-scoped placement alternative 已 1/1 通过 provenance validator。'
            : 'CF-RPP-REC-04 counterfactual placement alternative 尚未通过 provenance validator。',
        boundary:'Coverage 只覆盖程潜命例这一条 source record，不表示 Position Provenance corpus coverage complete。',
        dependsOnDependencyIds:[contractDependency.id],
        resolvedByClaimIds:audit.finiteCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE']
            : []
    });

    const buildAlternativeDependency = (contractDependency = {}, coverageDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE',
        scope:'source-scoped-counterfactual-placement-class-provenance',
        status:coverageDependency.status === 'resolved' ? 'resolved' : 'unresolved',
        statement:coverageDependency.status === 'resolved'
            ? '程潜命例可稳定输出 source-scoped counterfactual placement class：辛食神实际在时柱；来源替代条件仅限定为年／月位置类。'
            : '程潜命例 counterfactual placement provenance 尚未闭合。',
        boundary:'不得把 year/month option 变成两个 executable alternate charts，也不得据此直接选择“食制杀”或“食生财→财生杀”路径。',
        dependsOnDependencyIds:[contractDependency.id,coverageDependency.id],
        resolvedByClaimIds:coverageDependency.status === 'resolved'
            ? ['SC-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE']
            : []
    });

    const rebuildUnresolvedDependency = (base = {}, id = '', additions = [], statement = null, boundary = null) => {
        const current = (base.dependencies || []).find((item) => item.id === id) || {};
        return Object.freeze({
            ...current,
            id,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([...(current.dependsOnDependencyIds || []), ...additions.map((item) => item.id)])),
            resolvedByClaimIds:Object.freeze([]),
            ...(statement ? { statement } : {}),
            ...(boundary ? { boundary } : {})
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyRelationPositionProvenanceAudit) return base;

        const audit = buildAudit();
        const claim = makeClaim(audit);
        const contractDependency = buildContractDependency();
        const coverageDependency = buildFiniteCoverageDependency(contractDependency, audit);
        const alternativeDependency = buildAlternativeDependency(contractDependency, coverageDependency);
        const positionConsumerDependency = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE',
            [contractDependency,coverageDependency,alternativeDependency],
            'Position Provenance 已新增程潜命例的 source-scoped counterfactual placement class consumer；但全 corpus coverage、proximity/intervening 等通用 consumer 与任意 chart matcher 尚未完成，因此总依赖继续 unresolved。',
            '单条 counterfactual placement class 不得被外推为通用位置变换规则；尤其不得由 raw pillar distance 或自动换柱构造 alternate chart。'
        );
        const competingPathDependency = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION',
            [alternativeDependency],
            'Competing Relation Path 现可消费程潜命例的 counterfactual placement provenance，但尚未建立该命例的 source-scoped path-pair record，也未解决 proximity、relative-capacity selector 或 broader corpus，因此 global resolver 继续 unresolved。',
            'Counterfactual placement provenance 不是 path selection；不得直接从“辛在年月”跳到 executable 食神生财→财生杀链。'
        );

        const replacedDependencyIds = new Set([
            contractDependency.id,
            coverageDependency.id,
            alternativeDependency.id,
            positionConsumerDependency.id,
            competingPathDependency.id
        ]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            coverageDependency,
            alternativeDependency,
            positionConsumerDependency,
            competingPathDependency
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
            contextualForcePartyCounterfactualPlacementAlternative:audit,
            contextualForcePartyCounterfactualPlacementAlternativeRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Counterfactual Placement Alternative v0.1：程潜命例“如辛在年月”只表达 year/month placement class，不补写完整替代四柱。',
                '实际 `visible:3:辛` identity 可保留；counterfactual 端没有 exact actorKey，因为来源没有说明具体年/月位置及被替换 actor 的去向。',
                'Interpretation contested provenance 必须保留；source placement alternative 不等于 relation execution 或 universal rule。',
                'Position Provenance 总 consumer、Competing Path global resolver、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-counterfactual-placement-alternative-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyCounterfactualPlacementAlternative = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
