(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource) {
        document.write('<script src="./js/bazi-contextual-force-party-visible-motif-e2e-calibration-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    const authorizationSource = GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource || null;
    if (!sourceApi || !priorSynthesisApi || !authorizationSource) return;

    const { VERSION, RULE_ID, MOTIF_IDS, EVIDENCE, FINDINGS, CONTRACT, CASES_BY_MOTIF } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const sourceEvidenceIds = freezeArray(EVIDENCE.map((item) => item.id));

    const calibrationRecordForMotif = (motifId = '') => {
        const cases = CASES_BY_MOTIF[motifId] || [];
        const eligible = cases.filter((item) => item.calibrationEligible);
        const positiveDirectMatches = (authorizationSource.POSITIVE_AUTHORIZED_DIRECT_PATTERNS || [])
            .filter((item) => (item.matchedMotifIds || []).includes(motifId));
        const unresolvedCases = cases.filter((item) => !item.calibrationEligible);
        return Object.freeze({
            motifId,
            semanticMotifAuthorized:true,
            exactSourceCaseFamilyAvailable:cases.length > 0,
            exactSourceCaseIds:freezeArray(cases.map((item) => item.id)),
            sourceEligibleCalibrationCaseIds:freezeArray(eligible.map((item) => item.id)),
            existingPositiveDirectPatternIds:freezeArray(positiveDirectMatches.map((item) => item.patternId)),
            sourceCalibrationEligible:eligible.length > 0,
            machinePositiveCalibrationObserved:positiveDirectMatches.length > 0,
            calibrationResolved:eligible.length > 0 && positiveDirectMatches.length > 0,
            blockerCaseIds:freezeArray(unresolvedCases.map((item) => item.id)),
            blockerReasons:freezeArray(unique(unresolvedCases.flatMap((item) => item.blockerReasons || []))),
            realizationRegistryMutationAuthorized:false,
            statement:eligible.length
                ? positiveDirectMatches.length
                    ? '该 known raw visible motif 已同时具备来源合格命例与现有 positive direct realization pattern，可形成端到端 calibration。'
                    : '来源存在满足 actor-specific gate 的命例，但现有 direct realization registry 尚未登记对应 positive pattern。'
                : '现有完整命例仍不满足 raw visible actor-specific calibration gate；不得为了端到端校准而拆群体 target、跨 scope 或由五行关系补写 realization。'
        });
    };

    const buildAudit = () => {
        const opposition = calibrationRecordForMotif(MOTIF_IDS.OPPOSITION);
        const mediation = calibrationRecordForMotif(MOTIF_IDS.MEDIATION);
        return Object.freeze({
            id:'CF-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-AUDIT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:'source-audited-known-visible-motif-e2e-calibration-unresolved',
            sourceContract:CONTRACT,
            motifRecords:Object.freeze({ opposition, mediation }),
            allTargetMotifsResolved:opposition.calibrationResolved && mediation.calibrationResolved,
            oppositionCalibrationResolved:opposition.calibrationResolved,
            mediationCalibrationResolved:mediation.calibrationResolved,
            realizationRegistryMutationAuthorized:false,
            groupTargetSplitAuthorized:false,
            crossScopeAsRawVisibleCalibration:false,
            elementalShapeFillsMissingOutcome:false,
            genericVisibleEdgeEffectTypeResolverDefined:false,
            relativeDominance:null,
            actorGlobalEffectiveness:null,
            numericScore:null,
            scalarForce:null,
            sourceEvidenceIds,
            findings:FINDINGS
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT',
        claimKey:'strength.contextual-force.party.visible-motif.e2e-calibration.source-audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            oppositionCalibrationResolved:audit.oppositionCalibrationResolved,
            mediationCalibrationResolved:audit.mediationCalibrationResolved,
            groupTargetSplitAuthorized:false,
            crossScopeAsRawVisibleCalibration:false,
            elementalShapeFillsMissingOutcome:false,
            realizationRegistryMutationAuthorized:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'《滴天髓阐微·官杀》的“食神制杀格”与“杀重用印格”已逐命例检查 actor scope。文本语义可以继续授权 opposition / mediation taxonomy，但现有命例不足以形成唯一 visible source→visible target 的 exact-source positive calibration。',
        boundary:'Source audit resolved 只表示“为什么不能校准”已经被机器化；不等于 opposition / mediation calibration resolved，也不得新增 synthetic realization edge。'
    });

    const makeDependency = ({ id, kind = 'validation', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildSourceAuditDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT',
        scope:'known-raw-visible-motif-exact-source-calibration-provenance-audit',
        status:'resolved',
        statement:'Known raw visible motif 的《滴天髓阐微·官杀》命例 provenance 已按 source actor、target actor、scope 与 explicit outcome 逐项审计。',
        boundary:'Source provenance 审计完成不代表 exact-source positive calibration 已成立。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-EFFECT-TYPE-AUTHORIZATION-AUDIT'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT']
    });

    const buildOppositionDependency = (record = {}, sourceAuditDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION',
        scope:'food-god-to-killer-visible-opposition-exact-source-calibration',
        status:record.calibrationResolved ? 'resolved' : 'unresolved',
        statement:record.calibrationResolved
            ? '食神→七杀 opposition 已存在唯一 actor-specific 的 exact-source positive calibration。'
            : '《官杀·食神制杀格》四个完整命例均有明确制杀语义，但可见七杀 target 均为多个 actor；原文没有授权把群体“制杀”拆成任一 target-specific realized edge。',
        boundary:'不得复制同一“制杀”叙述到多个庚／戊／壬／丙 target，也不得以柱位或距离选择其中一个。',
        dependsOnDependencyIds:[sourceAuditDependency.id,'SD-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-EVIDENCE']
    });

    const buildMediationDependency = (record = {}, sourceAuditDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION',
        scope:'killer-to-seal-visible-mediation-exact-source-calibration',
        status:record.calibrationResolved ? 'resolved' : 'unresolved',
        statement:record.calibrationResolved
            ? '七杀→印 mediation 已存在唯一 actor-specific 的 exact-source positive calibration。'
            : '《官杀·杀重用印格》中的明确化杀路径主要落在地支印绶／水局；visible 印星命例要么有多个可见七杀 source，要么虽有唯一 visible 杀→印形状却没有明确 relation realization 叙述，因此 raw visible mediation calibration 仍不足。',
        boundary:'不得用 branch/hidden mediation 冒充 raw visible edge；也不得从“甲木生丙火”的元素关系自动补写 source explicit outcome。',
        dependsOnDependencyIds:[sourceAuditDependency.id,'SD-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-EVIDENCE']
    });

    const buildTotalCalibrationDependency = (audit = {}, sourceAuditDependency = {}, oppositionDependency = {}, mediationDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION',
        scope:'known-raw-visible-motif-positive-end-to-end-calibration',
        status:audit.allTargetMotifsResolved ? 'resolved' : 'unresolved',
        statement:audit.allTargetMotifsResolved
            ? '当前 raw opposition / mediation motifs 均已完成 exact-source actor-specific positive calibration。'
            : 'Known raw visible motif calibration 已拆分审计：opposition 与 mediation 当前都缺完整 actor-specific positive calibration；语义 motif 授权保留，但 executable calibration blocker 继续存在。',
        boundary:'总 calibration 不通过计数、投票或“至少一个 motif 已校准”来折中；每一 motif 都必须独立满足来源与机器 realization gate。',
        dependsOnDependencyIds:[sourceAuditDependency.id,oppositionDependency.id,mediationDependency.id]
    });

    const rebuildGenericVisibleMapping = (base = {}, audit = {}, totalDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([...(current.dependsOnDependencyIds || []), totalDependency.id])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Visible-edge effect-type authorization 已有 pattern-specific contract；进一步审计确认，当前 opposition / mediation 的原典命例仍不足以形成 actor-specific positive end-to-end calibration。generic generation/restraint → Party effect type resolver 继续未定义。',
            boundary:'Known motif calibration 即使日后全部 resolved，也只校准已登记 motif，不会自动解决 generic visible-edge mapping。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit) return base;
        const audit = buildAudit();
        const claim = makeClaim(audit);
        const sourceAuditDependency = buildSourceAuditDependency();
        const oppositionDependency = buildOppositionDependency(audit.motifRecords.opposition, sourceAuditDependency);
        const mediationDependency = buildMediationDependency(audit.motifRecords.mediation, sourceAuditDependency);
        const totalDependency = buildTotalCalibrationDependency(audit, sourceAuditDependency, oppositionDependency, mediationDependency);
        const genericVisible = rebuildGenericVisibleMapping(base, audit, totalDependency);
        const replacedDependencyIds = new Set([
            sourceAuditDependency.id,
            oppositionDependency.id,
            mediationDependency.id,
            totalDependency.id,
            genericVisible.id
        ]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            sourceAuditDependency,
            oppositionDependency,
            mediationDependency,
            totalDependency,
            genericVisible
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
            contextualForcePartyVisibleMotifE2ECalibrationSourceAudit:audit,
            contextualForcePartyVisibleMotifE2ECalibrationRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Known Raw Visible Motif E2E Calibration Source Audit v0.1 已逐例冻结 opposition / mediation 无法形成 exact-source actor-specific calibration 的 provenance 原因。',
                '食神制杀命例中的多个可见七杀 target 不得被拆成 synthetic target-specific edges。',
                '杀重用印命例中的 branch/hidden mediation 不得冒充 raw visible edge；唯一 visible 杀→印形状缺少明确 relation outcome 时也不得用五行常识补齐。',
                '本层不修改 Visible Stem Function Realization registry，不新增 realized edge，不改变 known motif taxonomy。',
                'Generic Visible-Edge Mapping、Cross-Actor Relation Effect Generalization、Relative Dominance、Branch Substrate Quality、Strength Synthesis 与 Assessment 继续 unresolved。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyVisibleMotifE2ECalibrationAudit:buildAudit
    });

    GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        sourceApi,
        calibrationRecordForMotif,
        buildAudit,
        buildSourceAuditDependency,
        buildOppositionDependency,
        buildMediationDependency,
        buildTotalCalibrationDependency,
        rebuildGenericVisibleMapping,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
