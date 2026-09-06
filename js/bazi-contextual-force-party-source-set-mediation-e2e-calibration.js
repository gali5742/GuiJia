(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceSetMediationE2ECalibration?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartySourceSetMediationE2ECalibrationContract || null;
    const profileApi = GuiJia.baziContextualForcePartySourceSetMediationE2ECalibrationProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, FINITE_CALIBRATION_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const registryCaseIds = freezeArray(Object.keys(FINITE_CALIBRATION_REGISTRY));

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:profile.finiteRegistryCoverageComplete
                ? 'finite-source-set-mediation-e2e-calibration-complete'
                : 'finite-source-set-mediation-e2e-calibration-partial',
            contract:CONTRACT,
            profile,
            recordCount:profile.records.length,
            resolvedRecordCount:profile.resolvedRecords.length,
            blockerRecordCount:profile.blockerRecords.length,
            finiteRegistryCoverageComplete:profile.finiteRegistryCoverageComplete,
            mediationCaseFamilyCoverageComplete:profile.mediationCaseFamilyCoverageComplete,
            actorSpecificVisibleEdgeCalibrationResolved:false,
            oppositionCalibrationAffected:false,
            genericVisibleEdgeMappingResolved:false,
            genericCollectiveMediationResolverResolved:false,
            genericRelationEffectGeneralizationResolved:false,
            sourceMemberEdgeExpansion:false,
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
        id:'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-CONTRACT',
        claimKey:'strength.contextual-force.party.source-set-mediation.e2e-calibration.contract',
        status:'resolved',
        value:{
            calibrationIdentityType:CONTRACT.calibrationIdentityType,
            resolverScope:CONTRACT.resolverScope,
            actorSpecificVisibleEdgeCalibrationMutation:false,
            sourceMemberEdgeExpansion:false
        },
        rationale:'MED CASE-04 已先后建立 exact source-side actor group identity 与 group→actor Collective Mediation Effect，因此可以定义独立 source-set mediation E2E calibration；这不需要把旧 multi-source blocker 改写成两个 actor→actor realized edges。',
        boundary:'合同 resolved 不表示 mediation 全 corpus、actor-specific visible mediation 或 generic relation-effect mapping 已完成。'
    });

    const makeFiniteCoverageClaim = (audit = {}) => makeClaim({
        id:'SC-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-VISIBLE-FINITE-COVERAGE',
        claimKey:'strength.contextual-force.party.source-set-mediation.e2e-calibration.visible-finite-coverage',
        status:audit.finiteRegistryCoverageComplete ? 'resolved' : 'unresolved',
        value:{
            calibrationCaseIds:registryCaseIds,
            resolvedCalibrationRecordIds:freezeArray((audit.profile.resolvedRecords || []).map((item) => item.id)),
            coverageComplete:audit.finiteRegistryCoverageComplete,
            unregisteredMediationCaseIds:freezeArray(audit.profile.unregisteredMediationCaseIds || [])
        },
        rationale:audit.finiteRegistryCoverageComplete
            ? 'VMEC MED CASE-04 能与 CF-SAGI-GROUP-01 和 CF-CME-SOURCE-01 一一对齐，形成正向 group→actor source-scoped mediation calibration。'
            : '至少一条有限 source-set mediation calibration 未通过 provenance validator。',
        boundary:'Finite coverage 只覆盖 registry 内 MED CASE-04；MED CASE-01/02/03/05 继续 unresolved。'
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
        id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-CONTRACT',
        scope:'visible-finite-group-to-actor-mediation-e2e-calibration-contract',
        status:'resolved',
        statement:'Source-Set Mediation E2E Calibration v0.1 已定义：旧 multi-source visible-edge blocker 可在 source actor-set identity resolved、collective mediation effect realized 时转为 group→actor calibration。',
        boundary:'不得将 source-set calibration 回写为两条 member-specific visible edges。',
        dependsOnDependencyIds:[
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT',
            'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-CONTRACT',
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION-CONTRACT'
        ],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-CONTRACT']
    });

    const buildFiniteCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-VISIBLE-FINITE-COVERAGE',
        scope:'audited-visible-finite-source-set-mediation-e2e-calibration',
        status:audit.finiteRegistryCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteRegistryCoverageComplete
            ? `当前 registry 的 ${audit.resolvedRecordCount} 条 source-set mediation calibration 已端到端闭合。`
            : '当前 registry 仍有 source-set mediation calibration 未通过 validator。',
        boundary:'只覆盖 VMEC MED CASE-04；不扩张到其他“化杀／杀印相生” wording。',
        dependsOnDependencyIds:[
            contractDependency.id,
            'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE',
            'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-VISIBLE-FINITE-COVERAGE'
        ],
        resolvedByClaimIds:audit.finiteRegistryCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-VISIBLE-FINITE-COVERAGE']
            : []
    });

    const buildCorpusCoverageDependency = (finiteCoverageDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-CORPUS-COVERAGE',
        kind:'source-coverage',
        scope:'mediation-case-family-source-set-calibration-coverage',
        status:audit.mediationCaseFamilyCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.mediationCaseFamilyCoverageComplete
            ? '当前 mediation case family 均已有适当 source-level calibration。'
            : `有限 source-set calibration 已闭合，但仍有 ${(audit.profile.unregisteredMediationCaseIds || []).length} 个 mediation source case 未进入本 registry。`,
        boundary:'不得因 case 同样包含多个七杀或“化杀”就自动形成 source group/calibration；需独立 scope、identity 与 outcome provenance。',
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
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyCollectiveMediationEffect) return base;
        const audit = buildAudit();
        const contractClaim = makeContractClaim();
        const coverageClaim = makeFiniteCoverageClaim(audit);
        const contractDependency = buildContractDependency();
        const finiteCoverageDependency = buildFiniteCoverageDependency(contractDependency, audit);
        const corpusCoverageDependency = buildCorpusCoverageDependency(finiteCoverageDependency, audit);

        const actorSpecificMediation = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION',
            [finiteCoverageDependency],
            'Mediation calibration 已分层：VMEC MED CASE-04 的 multi-source blocker 已通过 group→actor calibration 正向闭合；但该 dependency 仍包含 actor-specific raw visible mediation 与其他 cross-scope cases，因此继续 unresolved。',
            'Source-set calibration 是并行 source model，不得回写或拆分成 member-specific visible 杀→印 edges。'
        );

        const totalVisibleCalibration = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION',
            [finiteCoverageDependency],
            'Known motif calibration 现同时具备 actor→group opposition 与 group→actor mediation 的 finite collective calibration；但原 raw visible actor→actor calibration、其他 mediation/opposition corpus 与 cross-scope cases 尚未闭合，因此总 calibration 继续 unresolved。',
            '不同 relation identity / semantic level 的 finite PASS 不得折叠成 generic visible-edge PASS。'
        );

        const generalization = rebuildUnresolvedDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
            [finiteCoverageDependency,corpusCoverageDependency],
            'Cross-Actor Relation Effect 现新增 exact group→actor mediation E2E calibration；但 generic actor→actor mapping、cross-scope realization、broader source/target group coverage 与全局 resolver 仍未闭合，故 global generalization 保持 unresolved。',
            'Finite collective calibration 只能证明已登记 source case；不得泛化所有 generation／化杀／杀印相生关系。'
        );

        const replacedClaimIds = new Set([contractClaim.id,coverageClaim.id]);
        const replacedDependencyIds = new Set([
            contractDependency.id,
            finiteCoverageDependency.id,
            corpusCoverageDependency.id,
            actorSpecificMediation.id,
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
            actorSpecificMediation,
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
            contextualForcePartySourceSetMediationE2ECalibration:audit,
            contextualForcePartySourceSetMediationE2ECalibrationRecords:audit.profile.records,
            contextualForcePartySourceSetMediationE2ECalibrationRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Source-Set Mediation E2E Calibration v0.1 正向闭合 VMEC MED CASE-04：resolved visible 七杀 source group → single visible 戊印 → realized collective mediation。',
                '旧 VMEC MED case 的 actor-specific calibrationEligible=false 与 multiple-visible-killer-sources blocker 保留；这是新增正确 source semantic level 的 calibration。',
                'Group outcome 不拆 source member edges，不修改 Visible Stem Function Realization registry，也不证明 generic visible actor→actor mediation mapping。',
                'MED CASE-01/02/03/05、cross-scope、generic Relation Effect、Relative Dominance、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-source-set-mediation-e2e-calibration-v01', extendSynthesis);

    GuiJia.baziContextualForcePartySourceSetMediationE2ECalibration = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
