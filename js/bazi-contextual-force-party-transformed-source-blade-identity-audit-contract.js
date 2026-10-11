(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyTransformedSourceBladeIdentityAuditContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceOfficerKillerNonrealizationContract;
    if (!prior) return;
    const { freeze,SOURCE_CASE } = prior;
    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-TRANSFORMED-SOURCE-BLADE-IDENTITY-AUDIT-001';
    const STATES = freeze({ AUDITED:'audited-source-transformation-blade-identity-partial',
        INVALID:'invalid-transformation-blade-source-review',UNRESOLVED:'unresolved-transformation-blade-identity-audit',
        NOT_APPLICABLE:'transformation-blade-source-audit-not-applicable' });
    const DEFINITION_SOURCE = freeze({
        id:'CF-TSBI-DEF-01',sourceTier:'classical-semantic-authority',sourceTitle:'《滴天髓阐微》',
        locator:'六亲论 · 二十四、性情 · 羊刃局任氏注',sourceUrl:SOURCE_CASE.sourceUrl,
        retrievedOn:'2026-10-11',revisionId:null,
        sourceText:'如丙日主，以午为羊刃，干透丁火为露刃。',
        applicationScope:'exact-reviewed-bing-day-wu-branch-candidates-in-CF-SOKNR-CASE-01',
        candidateDefinitionSpan:'如丙日主，以午为羊刃',visibleBladeDistinctionSpan:'干透丁火为露刃',
        appliedDayGan:'丙',candidateZhi:'午',originalCaseTerm:'阳刃',definitionTerm:'羊刃',
        reviewedTerminologyAlignment:true,sourceMentionsResolveCaseTargetCardinality:false
    });
    const ANNOTATION = freeze({
        id:'CF-TSBI-ANN-01',upstreamCaseId:SOURCE_CASE.id,sourceId:SOURCE_CASE.sourceId,sourceText:SOURCE_CASE.sourceText,
        chartKey:SOURCE_CASE.chartKey,sourceContextType:'chart-case',sourcePredicateType:'relation-event',
        annotationDisposition:'relation-target-present',
        contextSpans:[{ role:'transformation-context',text:'此则戊癸合而必化' },{ role:'transformed-result-context',text:'化火为劫' }],
        relationUnits:[{ id:'CF-TSBI-ANN-01-R01',relationClauseSpan:'抑且化火为劫，反助阳刃猖狂',
            sourceRoleSpan:'化火为劫',sourceRoleClass:null,predicateSpan:'反助',predicateType:'relation-event',relationSemanticHint:null,
            target:{ span:'阳刃',mentionMode:'explicit-role-mention',antecedentSpan:null,roleClass:'阳刃',chartBindingRequired:true,
                bindingRequirements:['source-specific-blade-scope','source-specific-target-cardinality','transformed-source-endpoint'] },
            outcomeSpans:[{ span:'阳刃猖狂',kind:'source-asserted-qualitative-outcome' }] }],
        sourceEvidenceIds:[SOURCE_CASE.id,DEFINITION_SOURCE.id],blockerReasons:[]
    });
    const TRANSFORMATION_REVIEW = freeze({
        id:'CF-TSBI-TRANSFORM-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,chartKey:SOURCE_CASE.chartKey,
        eventSpan:'此则戊癸合而必化',resultSpan:'化火为劫',sourceAssertionState:'asserted-in-exact-source-context',
        inputOperands:[{ actorKey:'visible:1:戊',gan:'戊',roleClass:'食神',position:'month',scope:'visible-stem' },
            { actorKey:'visible:0:癸',gan:'癸',roleClass:'正官',position:'year',scope:'visible-stem' }],
        reviewedOperandScopeBasis:'named-wu-gui-combination-in-the-complete-natal-chart-reviewed-as-visible-month-wu-and-year-gui-not-hidden-homonyms',
        resultNodeId:'CF-TSBI-RESULT-01',resultNodeKind:'source-asserted-transformation-result',
        resultElementLabel:'火',resultRoleLabel:'劫',normalizedResultTenGodClass:null,
        resultActorKey:null,resultEndpointType:null,resultStem:null,resultPolarity:null,resultCardinality:null,
        inputActorsEqualResultActor:false,resultIsOperandGroup:false,
        reviewedBasis:'The source asserts a Wu-Gui transformation and labels its result 火/劫. Original visible operands can be identified, but the result is not an ordinary operand, actor group or existing Ding/fire actor. Its executable endpoint identity and materialization are not supplied by these spans.',
        authorityScope:'exact-source-transformation-annotation-and-original-operands-only',transferablePathIds:[]
    });
    const BLADE_REVIEW = freeze({
        id:'CF-TSBI-BLADE-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,definitionSourceId:DEFINITION_SOURCE.id,
        sourcePathId:'CF-TSBI-ALT-PATH-01',targetSpan:'阳刃',chartKey:SOURCE_CASE.chartKey,
        candidates:[{ actorKey:'surface-branch:1:午',scope:'surface-branch',pillarIndex:1,zhi:'午',wuxing:'火' },
            { actorKey:'surface-branch:2:午',scope:'surface-branch',pillarIndex:2,zhi:'午',wuxing:'火' }],
        candidateCount:2,targetActorKey:null,targetGroupId:null,targetEndpointType:null,targetCardinality:null,
        selectedCandidateKeys:[],memberActorKeys:[],sourceSpecificMembershipComplete:false,
        reviewedBasis:'The separately cited Bing/Wu blade definition supports two branch candidates in this exact chart. The case phrase does not select month or day, declare both as a collective endpoint, or define a configuration-only target. Candidate count is not authorized target cardinality.',
        candidateIdentityIsTargetIdentity:false,monthPriorityAuthorized:false,dayPriorityAuthorized:false,
        hiddenDingIsBranchBlade:false,allFireActorsAreBladeTargets:false,transferablePathIds:[]
    });
    const CONTRACT = freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-TRANSFORMED-SOURCE-BLADE-IDENTITY-AUDIT-CONTRACT-001',version:VERSION,
        auditScope:'exact-source-transformed-result-and-ambiguous-blade-target-identity-review',
        sourceCaseCount:1,additionalDefinitionSourceCount:1,newPositiveEffectSourceCaseCount:0,
        exactReviewedSourceInputRequired:true,actualOperandAndCandidateInventoryRequired:true,
        originalOperandIdentityIntroduced:true,transformedResultSemanticsAnnotated:true,
        transformedSourceEndpointResolved:false,bladeTargetEndpointResolved:false,
        sourceAssertionIsExecutableRealization:false,candidateCountDefinesTargetCardinality:false,
        inputOperandGroupIsTransformedResult:false,ordinaryActorReclassification:false,
        runtimeClassicalChineseParser:false,genericTransformationResolverDefined:false,genericBladeTargetResolverDefined:false,
        r3UnresolvedTargetConsumptionRequired:true,r4RefusalCalibrationRequired:true,effectTypeAuthorityCreated:false,
        groupMemberExpansion:false,membershipMutation:false,relativeDominanceMapping:false,numericAggregation:false,finalStrengthMapping:false,
        boundary:'R17 audits the separate 化火为劫→反助阳刃 source path: original Wu/Gui operands and two Wu branch candidates are verified, while transformed-result actor identity and source-specific blade selection/cardinality remain unresolved. R3 and R4 must refuse execution. No operand alias, candidate group, generic transformation/selection, effect license or final assessment is introduced.'
    });
    GuiJia.baziContextualForcePartyTransformedSourceBladeIdentityAuditContract = freeze({
        installed:true,VERSION,RULE_ID,STATES,DEFINITION_SOURCE,ANNOTATION,TRANSFORMATION_REVIEW,BLADE_REVIEW,CONTRACT,freeze
    });
})(typeof window !== 'undefined' ? window : globalThis);
