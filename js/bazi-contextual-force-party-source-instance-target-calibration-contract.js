(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceInstanceTargetCalibrationContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourcePathTargetAnnotationContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-INSTANCE-TARGET-CALIBRATION-001';
    const STATES = freeze({ RESOLVED:'resolved-exact-source-instance-target', INVALID:'invalid-source-instance-target-provenance',
        UNRESOLVED:'unresolved-source-instance-target', NOT_APPLICABLE:'source-instance-target-not-applicable' });
    const SOURCE_CASE = freeze({
        id:'CF-SITC-CASE-01', sourceId:'CF-SITC-SRC-DTS-GS', sourceTier:'classical-semantic-authority',
        sourceTitle:'《滴天髓阐微》', locator:'通神论 · 官杀 · 四曰合官留杀格 · 壬申丁未丁未癸卯命例',
        sourceUrl:'https://zh.wikisource.org/zh-hans/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE',
        retrievedOn:'2026-10-11', revisionId:null,
        sourceText:'此造日月皆丁未，时杀无根，喜其壬水官星助杀，不宜合也。幸而壬水坐申，合而不化，申金为用',
        chartKey:'壬申|丁未|丁未|癸卯', sourceContextType:'chart-case', predicateType:'relation-event',
        sourceEvidenceIds:['CF-SITC-CASE-01'], gans:['壬','丁','丁','癸'], zhis:['申','未','未','卯']
    });
    const ANNOTATION = freeze({
        id:'CF-SITC-ANN-01', upstreamCaseId:SOURCE_CASE.id, annotationDisposition:'relation-target-present',
        sourceId:SOURCE_CASE.sourceId, sourceText:SOURCE_CASE.sourceText, chartKey:SOURCE_CASE.chartKey,
        sourceContextType:'chart-case', sourcePredicateType:'relation-event',
        contextSpans:[{ role:'instance-context', text:'时杀无根' },{ role:'source-role-context', text:'壬水官星' }],
        relationUnits:[{ id:'CF-SITC-ANN-01-R01', relationClauseSpan:'壬水官星助杀', sourceRoleSpan:'壬水官星',
            sourceRoleClass:'正官', predicateSpan:'助', predicateType:'relation-event', relationSemanticHint:null,
            target:{ span:'杀', mentionMode:'antecedent-linked', antecedentSpan:'时杀', roleClass:'七杀',
                chartBindingRequired:true, bindingRequirements:['chart-local-candidate-binding','scope-provenance','cardinality-binding'] },
            outcomeSpans:[] }],
        sourceEvidenceIds:[SOURCE_CASE.id], blockerReasons:[]
    });
    // Scope is a reviewed inference from the explicit hour cue + full source chart:
    // 癸 is the hour stem; 卯 has no hidden water actor. This is not a general 时杀 parser.
    const IDENTITY_AUTHORITY = freeze({
        id:'CF-SITC-IDENTITY-01', sourceCaseId:SOURCE_CASE.id, annotationId:ANNOTATION.id,
        relationUnitId:'CF-SITC-ANN-01-R01', sourcePathId:'CF-SITC-PATH-01', chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:'visible:0:壬', sourceRoleClass:'正官', sourcePositionSpan:'壬水坐申',
        targetActorKey:'visible:3:癸', targetRoleClass:'七杀', targetPositionSpan:'时杀',
        targetPillar:'hour', targetPillarIndex:3, targetScope:'visible-stem', targetCardinality:1,
        scopeBasis:'registered-hour-cue-plus-source-chart-hour-gui-and-no-hidden-water-in-mao',
        reviewedScopeInference:true, authorityScope:'exact-source-case-target-identity-only',
        relationRealizationAuthorized:false, effectTypeAuthorized:false, transferablePathIds:[]
    });
    const CONTRACT = freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-INSTANCE-TARGET-CALIBRATION-CONTRACT-001', version:VERSION,
        calibrationScope:'single-dts-officer-helps-hour-killer-source-case-identity-only',
        completeExactSourceChartRequired:true, exactAnnotationAuthorityRequired:true,
        uniqueActualInventoryEndpointsRequired:true, roleCoreCrossCheckRequired:true,
        normalizedInputUsesExistingUnitAdapterAndValidator:true, genericTargetKernelRequired:true,
        targetIdentityCalibrationIntroduced:true, positiveEffectCalibrationIntroduced:false,
        lexicalCueCreatesGenericSelector:false, sourceCaseAuthorityTransfersToR11Paths:false,
        targetIdentityCreatesRealization:false, targetIdentityCreatesEffectAuthorization:false,
        broaderSourceCoverageComplete:false, genericTargetIdentityResolverDefined:false,
        executionAuthorized:false, memberEdgeExpansion:false, finalStrengthMapping:false,
        boundary:'R14 binds the reviewed hour 癸 target in one complete source case and feeds its validated identity to the existing normalized target contract and generic kernel. Its identity authority cannot bind the six R11 paths or authorize realization, effects, grouping, force or final assessment.'
    });
    GuiJia.baziContextualForcePartySourceInstanceTargetCalibrationContract = Object.freeze({
        installed:true, VERSION, RULE_ID, STATES, SOURCE_CASE, ANNOTATION, IDENTITY_AUTHORITY, CONTRACT, freeze
    });
})(typeof window !== 'undefined' ? window : globalThis);
