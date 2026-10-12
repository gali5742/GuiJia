(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchSealDamageNonrealizationContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceRecipientSealDamageCalibrationContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-SEAL-DAMAGE-NONREALIZATION-001';
    const STATES = freeze({ RESOLVED:'resolved-exact-source-branch-seal-damage-nonrealization',INVALID:'invalid-source-branch-seal-damage-nonrealization-review',
        UNRESOLVED:'unresolved-source-branch-seal-damage-nonrealization',NOT_APPLICABLE:'source-branch-seal-damage-nonrealization-not-applicable' });
    const SOURCE_CASE = freeze({ id:'CF-SBSDN-CASE-01',sourceId:'CF-SBSDN-SRC-DTS',sourceTier:'classical-semantic-authority',
        sourceTitle:'《滴天髓阐微》',sourceUrl:prior.SOURCE_CASE.sourceUrl,retrievedOn:'2026-10-13',revisionId:null,
        locator:'十八、战局 · 乙亥辛巳戊申甲寅命例',chartKey:'乙亥|辛巳|戊申|甲寅',gans:['乙','辛','戊','甲'],zhis:['亥','巳','申','寅'],
        sourceContextType:'chart-case',predicateType:'relation-event',excerptScope:'natal-commentary-before-middle-life-luck-and-biography',
        sourceText:'天干乙辛甲戊，地支寅申巳亥，天地交战，似乎不美。然喜天干乙辛去官星之混杀，地支寅申，制杀之肆逞。巳亥逢冲，坏印本属不喜，喜在立夏后十天，戊土司令，则亥水受制而巳火不伤。',
        sourceEvidenceIds:['CF-SBSDN-CASE-01'] });
    const ANNOTATION = freeze({ id:'CF-SBSDN-ANN-01',upstreamCaseId:SOURCE_CASE.id,sourceId:SOURCE_CASE.sourceId,
        sourceText:SOURCE_CASE.sourceText,chartKey:SOURCE_CASE.chartKey,sourceContextType:'chart-case',sourcePredicateType:'relation-event',
        annotationDisposition:'relation-target-present',contextSpans:[{ role:'source-clash-and-seal-damage-context',text:'巳亥逢冲，坏印本属不喜' },
            { role:'source-asserted-natal-timing-and-qi-context',text:'立夏后十天，戊土司令' }],
        relationUnits:[{ id:'CF-SBSDN-ANN-01-R01',relationClauseSpan:'则亥水受制而巳火不伤',sourceRoleSpan:'亥水',sourceRoleClass:'source-named-water-branch',
            predicateSpan:'不伤',predicateType:'relation-event',relationSemanticHint:null,
            target:{ span:'巳火',mentionMode:'explicit-source-branch-mention',antecedentSpan:null,roleClass:'source-named-seal-bearing-fire-branch',chartBindingRequired:true },
            outcomeSpans:[{ span:'巳火不伤',kind:'reviewed-exact-branch-seal-damage-nonrealization' }] }],sourceEvidenceIds:[SOURCE_CASE.id],blockerReasons:[] });
    const IDENTITY_AUTHORITY = freeze({ id:'CF-SBSDN-IDENTITY-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,
        unitId:ANNOTATION.relationUnits[0].id,sourcePathId:'CF-SBSDN-PATH-01',chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:'surface-branch:0:亥',targetActorKey:'surface-branch:1:巳',endpointScope:'surface-branch',endpointCardinality:1,
        sourceNamingSpan:'亥水',targetNamingSpan:'巳火',sourceRoleClass:'source-named-water-branch',targetRoleClass:'source-named-seal-bearing-fire-branch',
        literalBranchNamesInClause:true,sourceWholeBranchTenGod:null,targetWholeBranchTenGod:null,
        reviewedBasis:'The natal commentary names 巳亥 clash/seal damage and then explicitly states 亥水受制而巳火不伤. The complete chart has one 亥 in the year and one 巳 in the month. Independently reviewed attribution retains the original Hai-to-Si damage direction; 亥受制 does not create a reverse Si-to-Hai edge. Relative to 戊, whole 巳 contains 丙偏印,戊比肩,庚食神, and whole 亥 contains 壬偏财,甲七杀; neither endpoint is replaced by a pure role, hidden actor, visible stem or group.',
        branchExpandsToHiddenActors:false,hiddenRoleProjectionAuthorized:false,reverseEndpointAuthorized:false,
        authorityScope:'exact-natal-year-hai-to-month-whole-si-seal-damage-only' });
    const CONTEXT_REVIEW = freeze({ id:'CF-SBSDN-CONTEXT-01',sourceCaseId:SOURCE_CASE.id,
        timingSpan:'立夏后十天',qiSpan:'戊土司令',sourceSpan:'喜在立夏后十天，戊土司令',
        scope:'source-asserted-natal-timing-and-qi-provenance',contextActorKey:null,
        actualCalendarCalculated:false,monthCommandOverrideAuthorized:false,dayVisibleWuAutomaticallyBoundToHai:false,
        automaticTimingRule:false,otherChartContextTransferAuthorized:false,
        reviewedBasis:'The printed natal timing/qi statement is preserved as this reviewed case provenance only. R30 does not calculate a solar-term offset, infer a birth date, override Month Command, bind visible day 戊 as an additional source endpoint or apply a generic 戊司令→亥受制 rule.' });
    const REALIZATION_AUTHORITY = freeze({ id:'CF-SBSDN-REALIZATION-01',sourceCaseId:SOURCE_CASE.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
        contextReviewId:CONTEXT_REVIEW.id,sourcePathId:IDENTITY_AUTHORITY.sourcePathId,chartKey:SOURCE_CASE.chartKey,
        functionType:'source-asserted-branch-seal-damage',directed:true,state:'not-realized-in-source-context',
        evidenceSpan:'则亥水受制而巳火不伤',negationSpan:'巳火不伤',
        reviewedBasis:'In the independently reviewed exact 巳亥 clash/seal-damage context, 巳火不伤 denies damage to the named whole Si seal-bearing fire recipient by the named Hai water. This source-backed negative realization is not inferred from elemental restraint or timing and does not deny the printed clash, all relations, reverse damage or every hidden-role interaction.',
        effectTypeAuthorized:false,genericNegationParserAuthorized:false,
        sourceEvidenceIds:[SOURCE_CASE.id,ANNOTATION.id,IDENTITY_AUTHORITY.id,CONTEXT_REVIEW.id,'CF-SBSDN-REALIZATION-01'] });
    const EXCLUDED_CONTEXT = freeze({ id:'CF-SBSDN-EXCLUDED-01',sourceCaseId:SOURCE_CASE.id,clashSpan:'巳亥逢冲',
        clashNonrealizationInferred:false,clashEffectTypeAuthorized:false,sourceControlledSpan:'亥水受制',
        additionalControllerEndpoint:null,reverseDamageAuthorized:false,
        otherSourceSpans:['天干乙辛去官星之混杀','地支寅申，制杀之肆逞'],
        otherClauseEffectsAuthorized:false,hiddenMemberNonrealizationDistributed:false,branchMediationFailureInferred:false,
        globalNoDamageOrNoEffectInferred:false,r29EarthRecipientAuthorityInherited:false,
        r5SourceFamilyRegistered:false,positiveEffectAuthority:null,memberEdges:[],reverseEdges:[],numericScore:null,
        comparisonDisposition:'distinct-primary-chart-and-fire-recipient-not-controlled-counterfactual-to-r29' });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-SEAL-DAMAGE-NONREALIZATION-CONTRACT-001',version:VERSION,
        reviewScope:'one-new-natal-hai-to-whole-si-seal-damage-nonrealization-with-source-timing-context',
        reusedCompleteSourceCaseCount:0,newCompleteSourceCaseCount:1,reviewedRelationCount:1,newEffectAuthorityCount:0,
        actualInventoryTargetNormalizerR3R4Required:true,branchSealDamageNegativeCalibrationEstablished:true,
        hiddenSealDamageNegativeCalibrationEstablished:false,branchMediationNegativeCalibrationEstablished:false,
        genericDamageOrNegationMapping:false,r5FamilyAdded:false,numericAggregation:false,membershipMutation:false,finalStrengthMapping:false,
        boundary:'R30 independently reviews a new natal 乙亥辛巳戊申甲寅 source: year whole 亥→month whole 巳 seal damage is not-realized through actual inventory/normalization/R3/R4. The printed 巳亥 clash and source timing/qi context remain separate; no calendar rule, visible 戊 controller, reverse edge, hidden-role distribution, generic ineffectiveness, negative mediation, R29 earth-recipient license transfer, new type/R5 family or final strength follows.' });
    GuiJia.baziContextualForcePartySourceBranchSealDamageNonrealizationContract = freeze({ installed:true,VERSION,RULE_ID,STATES,
        SOURCE_CASE,ANNOTATION,IDENTITY_AUTHORITY,CONTEXT_REVIEW,REALIZATION_AUTHORITY,EXCLUDED_CONTEXT,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
