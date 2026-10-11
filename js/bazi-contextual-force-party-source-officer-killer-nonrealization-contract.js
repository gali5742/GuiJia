(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceOfficerKillerNonrealizationContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceOfficerKillerEffectCalibrationContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-NONREALIZATION-001';
    const STATES = freeze({ RESOLVED:'resolved-exact-source-officer-killer-not-realized',
        INVALID:'invalid-officer-killer-nonrealization-authority',UNRESOLVED:'unresolved-officer-killer-nonrealization',
        NOT_APPLICABLE:'officer-killer-nonrealization-not-applicable' });
    const source = {
        sourceId:'CF-SOKNR-SRC-DTS-GS',sourceTier:'classical-semantic-authority',sourceTitle:'《滴天髓阐微》',
        sourceUrl:'https://zh.wikisource.org/zh-hans/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE',
        retrievedOn:'2026-10-11',revisionId:null,sourceContextType:'chart-case',predicateType:'relation-event'
    };
    const SOURCE_CASE = freeze({ ...source,id:'CF-SOKNR-CASE-01',
        locator:'通神论 · 官杀 · 四曰合官留杀格 · 癸巳戊午丙午壬辰命例（任氏自造）',
        chartKey:'癸巳|戊午|丙午|壬辰',gans:['癸','戊','丙','壬'],zhis:['巳','午','午','辰'],
        sourceText:'此铁樵自造（乾隆三十八年四月十八日辰时），亦长夏天，与前造只换一丑字，天渊之隔矣。夫丑乃北方之湿土，能晦丙火之烈，能收午火之焰，又能蓄水藏金。巳乃南方之火火，癸临绝地，杯水舆薪，喜其混也。不喜其清也。彼则戊癸合而不化，此则戊癸合而必化，不但不能助杀，抑且化火为劫，反助阳刃猖狂。巳中庚金，无从引助，壬水虽通根身库，总之无金滋助，清枯之象',
        sourceEvidenceIds:['CF-SOKNR-CASE-01']
    });
    const COMPARISON_CASE = freeze({ ...source,id:'CF-SOKNR-COMPARE-01',
        locator:'通神论 · 官杀 · 四曰合官留杀格 · 相邻癸丑戊午丙午壬辰命例',
        chartKey:'癸丑|戊午|丙午|壬辰',gans:['癸','戊','丙','壬'],zhis:['丑','午','午','辰'],
        sourceText:'此造火长夏天，旺之极矣。戊癸合而化为忌，还喜壬水通根身库；更妙年支坐丑，足以晦火养金而蓄水，则癸水仍得根，虽合而不化也。不化反喜其合，则不抗呼壬水矣。',
        disposition:'contextual-comparison-only',assistanceRealizationReviewed:false,effectTypeAuthorized:false,
        inheritsNegativeAuthority:false,nonOppositionImpliesAugmentation:false
    });
    const ANNOTATION = freeze({
        id:'CF-SOKNR-ANN-01',upstreamCaseId:SOURCE_CASE.id,annotationDisposition:'relation-target-present',
        sourceId:SOURCE_CASE.sourceId,sourceText:SOURCE_CASE.sourceText,chartKey:SOURCE_CASE.chartKey,
        sourceContextType:'chart-case',sourcePredicateType:'relation-event',
        contextSpans:[{ role:'source-identity-context',text:'巳乃南方之火火，癸临绝地' },
            { role:'target-identity-context',text:'壬水虽通根身库' },
            { role:'nonrealization-condition-context',text:'此则戊癸合而必化' }],
        relationUnits:[{ id:'CF-SOKNR-ANN-01-R01',relationClauseSpan:'此则戊癸合而必化，不但不能助杀',
            sourceRoleSpan:'癸临绝地',sourceRoleClass:'正官',predicateSpan:'不能助',predicateType:'relation-event',relationSemanticHint:null,
            target:{ span:'杀',mentionMode:'explicit-role-mention',antecedentSpan:null,roleClass:'七杀',chartBindingRequired:true,
                bindingRequirements:['chart-local-candidate-binding','scope-provenance','cardinality-binding'] },
            outcomeSpans:[{ span:'不但不能助杀',kind:'explicit-nonrealization' }] }],
        sourceEvidenceIds:[SOURCE_CASE.id],blockerReasons:[]
    });
    // The year 癸 is reviewed from the 巳/癸 context and the visible 戊癸 combination.
    // Hidden 辰 癸 is present; stem spelling or unique-role selection alone is insufficient.
    const IDENTITY_AUTHORITY = freeze({
        id:'CF-SOKNR-IDENTITY-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,relationUnitId:'CF-SOKNR-ANN-01-R01',
        sourcePathId:'CF-SOKNR-PATH-01',chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:'visible:0:癸',sourceRoleClass:'正官',sourceScope:'visible-stem',sourceCardinality:1,
        sourceNamingSpan:'巳乃南方之火火，癸临绝地',sourceCombinationSpan:'此则戊癸合而必化',
        sourceScopeBasis:'reviewed-year-si-gui-context-plus-visible-wu-gui-combination-not-hidden-chen-gui',
        targetActorKey:'visible:3:壬',targetRoleClass:'七杀',targetScope:'visible-stem',targetCardinality:1,
        targetNamingSpan:'壬水虽通根身库',targetScopeBasis:'reviewed-named-ren-plus-complete-source-chart-no-hidden-ren',
        reviewedEndpointInference:true,authorityScope:'exact-original-natal-officer-killer-identity-only',
        transformedActorIdentityAuthorized:false,transferablePathIds:[]
    });
    const REALIZATION_AUTHORITY = freeze({
        id:'CF-SOKNR-REALIZATION-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,
        identityAuthorityId:IDENTITY_AUTHORITY.id,sourcePathId:IDENTITY_AUTHORITY.sourcePathId,chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:IDENTITY_AUTHORITY.sourceActorKey,targetActorKey:IDENTITY_AUTHORITY.targetActorKey,
        functionType:'peer',directed:true,realizationState:'not-realized-in-source-context',
        assertionSpan:'不但不能助杀',conditionSpan:'此则戊癸合而必化',
        reviewedBasis:'In this exact complete natal case, the source explicitly denies assistance to the named Ren killer after the visible Wu-Gui combination transforms. The reviewed relation is the original visible Gui officer→visible Ren killer; the compound transformation remains source context, not a newly created actor or a generic combination rule.',
        excludedAlternateOutcomeSpan:'抑且化火为劫，反助阳刃猖狂',
        excludedAlternateOutcomeDisposition:'separate-transformation-and-blade-paths-require-independent-identity-realization-effect-authority',
        authorityScope:'exact-natal-original-officer-killer-nonrealization-only',
        negativeCreatesOpposition:false,negativeCreatesReverseEffect:false,genericCombinationRuleDefined:false,transferablePathIds:[]
    });
    const CONTRACT = freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-NONREALIZATION-CONTRACT-001',version:VERSION,
        calibrationScope:'single-exact-dts-original-officer-killer-explicit-nonrealization',
        negativeSourceCaseCount:1,positiveEffectSourceCaseCount:0,contextualComparisonCaseCount:1,
        exactSourceAnnotationIdentityRealizationRequired:true,actualInventoryRequired:true,
        normalizedTargetValidatorRequired:true,genericTargetKernelRequired:true,r4GenericExecutionRequired:true,
        effectTypeAuthorityCreated:false,r5PositiveEffectLicenseRequiredForNonrealization:false,
        peerImpliesEffectType:false,notRealizedCreatesReverseEffect:false,transformedActorIdentityCreated:false,
        nonOppositionImpliesAugmentation:false,comparisonCaseInheritsAuthority:false,
        genericCombinationResolverDefined:false,sourceAuthorityTransfersToR11Paths:false,broaderSourceCoverageComplete:false,
        membershipMutation:false,numericAggregation:false,relativeDominanceMapping:false,finalStrengthMapping:false,
        boundary:'R16 binds the reviewed original visible Gui officer→Ren killer in one complete source case and consumes its explicit nonrealization in the existing R4 kernel. It issues no positive effect license, reverse/opposition effect, transformed actor or generic combination condition. The adjacent Chou case remains contextual comparison only; R15 positive source authority stays independent.'
    });
    GuiJia.baziContextualForcePartySourceOfficerKillerNonrealizationContract = freeze({
        installed:true,VERSION,RULE_ID,STATES,SOURCE_CASE,COMPARISON_CASE,ANNOTATION,IDENTITY_AUTHORITY,REALIZATION_AUTHORITY,CONTRACT,freeze
    });
})(typeof window !== 'undefined' ? window : globalThis);
