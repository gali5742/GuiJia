(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibration?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibrationContract || null;
    const profileApi = GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibrationProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, FINITE_CALIBRATION_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const registryCaseIds = freezeArray(Object.keys(FINITE_CALIBRATION_REGISTRY));

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.finiteRegistryCoverageComplete
                ? 'finite-actor-set-opposition-e2e-calibration-complete'
                : 'finite-actor-set-opposition-e2e-calibration-partial',
            contract:CONTRACT,
            profile,
            recordCount:profile.records.length,
            resolvedRecordCount:profile.resolvedRecords.length,
            blockerRecordCount:profile.blockerRecords.length,
            finiteRegistryCoverageComplete:profile.finiteRegistryCoverageComplete,
            oppositionCaseFamilyCoverageComplete:profile.oppositionCaseFamilyCoverageComplete,
            actorSpecificVisibleEdgeCalibrationResolved:false,
            mediationCalibrationResolved:false,
            genericVisibleEdgeMappingResolved:false,
            genericRelationEffectGeneralizationResolved:false,
            memberEdgeExpansion:false,
            visibleFunctionRealizationRegistryMutation:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            registryCaseIds
        });
    };

    const makeClaim = ({ id, claimKey, status, value, rationale, boundary }) => Object.freeze({
        id,
        claimKey,
        status,
        ruleId:RULE_ID,
        value:Object.freeze(value),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:registryCaseIds,
        rationale,
        boundary
    });

    const makeContractClaim = () => makeClaim({
        id:'SC-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-CONTRACT',
        claimKey:'strength.contextual-force.party.actor-set-opposition.e2e-calibration.contract',
        status:'resolved',
        value:{
            calibrationIdentityType:CONTRACT.calibrationIdentityType,
            resolverScope:CONTRACT.resolverScope,
            actorSpecificVisibleEdgeCalibrationMutation:false,
            memberEdgeExpansion:false
        },
        rationale:'Collective Target Semantics 已证明部分“制杀”命例的 target 是 actor-set；Actor Group Identity 与 Collective Relation Effect 又为两条 exact case 建立了完整 source actor→target group realization。因此可以定义独立的 actor-set E2E calibration，而不修改旧 actor→actor calibration gate。',
        boundary:'合同 resolved 不表示 opposition 全 corpus、mediation 或 generic relation-effect mapping 已完成。'
    });

    const makeFiniteCoverageClaim = (audit = {}) => makeClaim({
        id:'SC-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-VISIBLE-FINITE-COVERAGE',
        claimKey:'strength.contextual-force.party.actor-set-opposition.e2e-calibration.visible-finite-coverage',
        status:audit.finiteRegistryCoverageComplete ? 'resolved' : 'unresolved',
        value:{
            calibrationCaseIds:registryCaseIds,
            resolvedCalibrationRecordIds:freezeArray((audit.profile.resolvedRecords || []).map((item) => item.id)),
            coverageComplete:audit.finiteRegistryCoverageComplete,
            unregisteredOppositionCaseIds:freezeArray(audit.profile.unregisteredOppositionCaseIds || [])
        },
        rationale:audit.finiteRegistryCoverageComplete
            ? 'VMEC OPP CASE-02/04 均能与 RTLC CASE-04/05、finite group identity 与 realized collective opposition 一一对齐，形成正向 actor→group source-scoped calibration。'
            : '至少一条有限 actor-set opposition calibration 未通过 provenance validator。',
        boundary:'Finite coverage 只覆盖 registry 内两例；OPP CASE-01/03 未有 group identity registry，继续 unresolved。'
    });

    const makeDependency = ({ id, kind = 'validation', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:registryCaseIds,
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildContractDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-CONTRACT',
        scope:'visible-finite-actor-to-group-opposition-e2e-calibration-contract',
        status:'resolved',
        statement:'Actor-Set Opposition E2E Calibration v0.1 已定义：旧 multi-target visible-edge blocker 可在来源明确 actor-set、group identity resolved、collective effect realized 时转为 actor→group calibration。',
        boundary:'不得将 group calibration 回写为 member-specific visible edges。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT',
            'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION-CONTRACT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-CONTRACT']
    });

    const buildFiniteCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-VISIBLE-FINITE-COVERAGE',
        scope:'audited-visible-finite-actor-set-opposition-e2e-calibration',
        status:audit.finiteRegistryCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteRegistryCoverageComplete
            ? `当前 registry 的 ${audit.resolvedRecordCount} 条 actor-set opposition calibration 均已端到端闭合。`
            : '当前 registry 仍有 actor-set opposition calibration 未通过 validator。',
        boundary:'只覆盖 VMEC OPP CASE-02/04；不扩张到其他“制杀” wording。',
        dependsOnDependencyIds:[
            contractDependency.id,
            'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE',
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-VISIBLE-FINITE-COVERAGE'
        ],
        resolvedByClaimIds:audit.finiteRegistryCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-VISIBLE-FINITE-COVERAGE']
            : []
    });

    const buildCorpusCoverageDependency = (finiteCoverageDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-CORPUS-COVERAGE',
        kind:'source-coverage',
        scope:'opposition-case-family-actor-set-calibration-coverage',
        status:audit.oppositionCaseFamilyCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.oppositionCaseFamilyCoverageComplete
            ? '当前 opposition case family 均已有适当 target-level calibration。'
            : `有限 actor-set calibration 已闭合，但仍有 ${(audit.profile.unregisteredOppositionCaseIds || []).length} 个 opposition source case 未进入 source-scoped group registry。`,
        boundary:'不得因 case 同样包含多个七杀就自动形成 group identity；需独立 target-level/cardinality/scope provenance。',
        dependsOnDependencyIds:[finiteCoverageDependency.id,'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT']
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
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyCollectiveRelationEffect) return base;
        const audit = buildAudit();
        const contractClaim = makeContractClaim();
        const coverageClaim = makeFiniteCoverageClaim(audit);
        const contractDependency = buildContractDependency();
        const finiteCoverageDependency = buildFiniteCoverageDependency(contractDependency, audit);
        const corpusCoverageDependency = buildCorpusCoverageDependency(finiteCoverageDependency, audit);

        const actorSpecificOpposition = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION',
            [finiteCoverageDependency],
            'Opposition calibration 已分层：VMEC OPP CASE-02/04 的 multi-target blocker 已通过 actor→group calibration 正向闭合；但该 dependency 仍专指 single-target visible actor→actor calibration，因此继续 unresolved。',
            'Actor-set calibration 是并行 target model，不得回写或拆分成 member-specific visible edges。'
        );

        const totalVisibleCalibration = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION',
            [finiteCoverageDependency],
            'Known motif calibration 已新增正向 actor-set opposition 路径，但 raw visible actor→actor opposition 与 mediation calibration 仍未全部完成，因此原 visible-edge 总 calibration 继续 unresolved。',
            '不同 target semantic level 的 calibration 不得用“至少一个已通过”合并成整体 PASS。'
        );

        const generalization = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            [finiteCoverageDependency,corpusCoverageDependency],
            'Cross-Actor Relation Effect 现已具备两条 exact actor→group opposition 正向 E2E calibration；但 generic visible-edge mapping、branch realization、Structure→actor-pair bridge、hidden/cross-scope realization，以及更广 actor-set corpus 仍未闭合，故 global generalization 保持 unresolved。',
            'Finite collective calibration 只能证明已登记 source case；不得泛化所有 generation/restraint/“制杀”关系。'
        );

        const replacedClaimIds = new Set([contractClaim.id,coverageClaim.id]);
        const replacedDependencyIds = new Set([
            contractDependency.id,
            finiteCoverageDependency.id,
            corpusCoverageDependency.id,
            actorSpecificOpposition.id,
            totalVisibleCalibration.id,
            generalization.id
        ]);
        const claims = Object.freeze([
            ...(base.claims || []).filter((item) => !replacedClaimIds.has(item.id)),
            contractClaim,
            coverageClaim
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            finiteCoverageDependency,
            corpusCoverageDependency,
            actorSpecificOpposition,
            totalVisibleCalibration,
            generalization
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
            contextualForcePartyActorSetOppositionE2ECalibration:audit,
            contextualForcePartyActorSetOppositionE2ECalibrationRecords:audit.profile.records,
            contextualForcePartyActorSetOppositionE2ECalibrationRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Actor-Set Opposition E2E Calibration v0.1 正向闭合 VMEC OPP CASE-02/04：source 食神 actor → resolved visible 七杀 group → realized collective opposition。',
                '旧 VMEC case 的 actor-specific calibrationEligible=false 保留；这不是改写历史审计，而是新增正确 target semantic level 的 calibration。',
                'Group outcome 不拆 member edges，不修改 Visible Stem Function Realization registry，也不证明 generic visible actor→actor effect mapping。',
                'OPP CASE-01/03、mediation、cross-scope、generic Relation Effect、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-actor-set-opposition-e2e-calibration-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibration = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
