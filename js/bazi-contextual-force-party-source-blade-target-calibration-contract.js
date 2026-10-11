(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBladeTargetCalibrationContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartyTransformedSourceBladeIdentityAuditContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-TARGET-CALIBRATION-001';
    const STATES = freeze({ RESOLVED:'resolved-source-month-blade-relation-target',OBSERVED:'reviewed-source-blade-location-only',
        INVALID:'invalid-source-blade-target-review',UNRESOLVED:'unresolved-source-blade-target',NOT_APPLICABLE:'source-blade-target-not-applicable' });
    const SOURCE_URL = prior.DEFINITION_SOURCE.sourceUrl;
    const DEFINITION_SOURCE = freeze({ ...prior.DEFINITION_SOURCE,id:'CF-SBTC-DEF-01',
        applicationScope:'exact-reviewed-bing-wu-branch-identities-in-CF-SBTC-CASE-01-02-03' });
    const caseRecord = (suffix,chartKey,locator,sourceText,mode) => {
        const pillars = chartKey.split('|').map((p) => Array.from(p)),id = `CF-SBTC-CASE-${suffix}`;
        return { id,sourceId:'CF-SBTC-SRC-DTS',sourceTier:'classical-semantic-authority',sourceTitle:'《滴天髓阐微》',
            sourceUrl:SOURCE_URL,retrievedOn:'2026-10-11',revisionId:null,locator,sourceText,chartKey,
            sourceContextType:'chart-case',predicateType:mode === 'relation-target' ? 'relation-event' : 'configuration-description',
            mode,gans:pillars.map((p) => p[0]),zhis:pillars.map((p) => p[1]),sourceEvidenceIds:[id] };
    };
    const SOURCE_CASES = freeze([
        caseRecord('01','戊子|戊午|丙辰|戊戌','六亲论 · 二十四、性情 · 丙日午提命例',
            '丙日午提，刃强当令，子冲之，辰泄之，弱可知矣。天干三戊，窃日主之精华；','relation-target'),
        caseRecord('02','戊申|癸亥|丙午|壬辰','通神论 · 官杀 · 四曰合官留杀格 · 日主坐旺刃命例',
            '此造日主虽坐旺刃，生于亥月，究竟休囚；五行无木，壬癸并透，支逢生旺，各立门户。喜其合去癸水，不致混也；','location-context'),
        caseRecord('03','戊午|癸亥|丙戌|壬辰','通神论 · 官杀 · 四曰合官留杀格 · 年逢刃助命例',
            '丙戌日元，生于辰时，冲去库根，壬癸并透。喜其戊合，去官留杀；更喜年逢刃助，火虚有焰；更妙无金，稍胜前造。','location-context')
    ]);
    const IDENTITY_AUTHORITIES = freeze(SOURCE_CASES.map((s,index) => ({
        id:`CF-SBTC-IDENTITY-0${index + 1}`,sourceCaseId:s.id,chartKey:s.chartKey,mode:s.mode,
        bladeActorKey:`surface-branch:${[1,2,0][index]}:午`,bladePillarIndex:[1,2,0][index],bladeScope:'surface-branch',
        bladeCardinality:1,bladeRoleClass:'阳刃',
        observationSpan:['丙日午提，刃强当令','此造日主虽坐旺刃，生于亥月','更喜年逢刃助'][index],
        reviewedBasis:['The explicit 午提/当令 context and full chart identify the month Wu branch; both subsequent 之 pronouns refer to that blade.',
            'The complete chart and 日主坐旺刃 context identify the day Wu branch. This is location evidence, not a blade-target relation annotation.',
            'The explicit 年逢刃助 context and complete chart identify the year Wu branch. This is location evidence; no blade-target relation is supplied.'][index],
        authorityScope:'exact-reviewed-source-case-blade-identity-only',relationRealizationAuthorized:false,effectTypeAuthorized:false,
        transformedResultMaterializationAuthorized:false,transferablePathIds:[]
    })));
    const s = SOURCE_CASES[0];
    const ANNOTATION = freeze({ id:'CF-SBTC-ANN-01',upstreamCaseId:s.id,sourceId:s.sourceId,sourceText:s.sourceText,chartKey:s.chartKey,
        sourceContextType:'chart-case',sourcePredicateType:'relation-event',annotationDisposition:'relation-target-present',
        contextSpans:[{ role:'target-antecedent-context',text:'丙日午提，刃强当令' },{ role:'joint-outcome-context',text:'弱可知矣' }],
        jointOutcomeSpan:'弱可知矣',jointOutcomeAuthorizesPerPathEffects:false,
        relationUnits:[['子冲之','子','冲','surface-branch:0:子'],['辰泄之','辰','泄','surface-branch:2:辰']].map((v,index) => ({
            id:`CF-SBTC-ANN-01-R0${index + 1}`,sourcePathId:`CF-SBTC-PATH-0${index + 1}`,sourceActorKey:v[3],
            relationClauseSpan:v[0],sourceRoleSpan:v[1],sourceRoleClass:null,predicateSpan:v[2],predicateType:'relation-event',relationSemanticHint:null,
            target:{ span:'之',mentionMode:'antecedent-linked',antecedentSpan:'丙日午提，刃强当令',roleClass:'阳刃',chartBindingRequired:true,
                bindingRequirements:['exact-month-blade-scope','source-case-cardinality','reviewed-pronoun-antecedent'] },outcomeSpans:[] })),
        sourceEvidenceIds:[s.id,DEFINITION_SOURCE.id],blockerReasons:[] });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-TARGET-CALIBRATION-CONTRACT-001',version:VERSION,
        calibrationScope:'three-exact-source-blade-locations-and-one-month-blade-target-case',sourceCaseCount:3,
        relationTargetCaseCount:1,relationTargetPathCount:2,locationContextCaseCount:2,
        completeSourceChartRequired:true,actualSurfaceBranchInventoryRequired:true,existingTargetNormalizerAndR3Required:true,
        contextObservationCreatesRelationTarget:false,genericMonthBladePriority:false,genericUniqueBladeSelector:false,
        authorityTransfersToR17:false,materializationAuthorityCreated:false,relationRealizationAuthorized:false,effectTypeAuthorityCreated:false,
        membershipMutation:false,relativeDominanceMapping:false,numericAggregation:false,finalStrengthMapping:false,
        boundary:'R19 adds three complete primary source charts: explicit month blade relation targets feed the actual R3 kernel, while day/year blade mentions remain location observations. No cross-case month priority, target choice for R17, transformed-result materialization, realization/effect license or final assessment is introduced.' });
    GuiJia.baziContextualForcePartySourceBladeTargetCalibrationContract = freeze({ installed:true,VERSION,RULE_ID,STATES,
        DEFINITION_SOURCE,SOURCE_CASES,IDENTITY_AUTHORITIES,ANNOTATION,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
