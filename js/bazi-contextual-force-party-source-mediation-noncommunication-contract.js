(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceMediationNoncommunicationContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceBranchMediationCalibrationContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-MEDIATION-NONCOMMUNICATION-001';
    const STATES = freeze({ RESOLVED:'resolved-exact-source-killer-seal-noncommunication',INVALID:'invalid-source-mediation-noncommunication-review',
        UNRESOLVED:'unresolved-source-mediation-noncommunication',NOT_APPLICABLE:'source-mediation-noncommunication-not-applicable' });
    const SOURCE_CASE = freeze({ id:'CF-SMNC-CASE-01',sourceId:'CF-SMNC-SRC-DTS',sourceTier:'classical-semantic-authority',
        sourceTitle:'《滴天髓阐微》',sourceUrl:prior.SOURCE_CASE.sourceUrl,retrievedOn:'2026-10-12',revisionId:null,
        locator:'通神论 · 二十、通关 · 己巳丁卯辛卯乙未命例',chartKey:'己巳|丁卯|辛卯|乙未',
        gans:['己','丁','辛','乙'],zhis:['巳','卯','卯','未'],sourceContextType:'chart-case',predicateType:'relation-event',
        sourceText:'此春金虚弱，木火当权，年印，月杀，未得相通，时支未土，又会卯化木，只有生杀之情，而无辅主之意，',
        excerptScope:'natal-commentary-before-luck-and-biography',sourceEvidenceIds:['CF-SMNC-CASE-01'] });
    const ANNOTATION = freeze({ id:'CF-SMNC-ANN-01',upstreamCaseId:SOURCE_CASE.id,sourceId:SOURCE_CASE.sourceId,
        sourceText:SOURCE_CASE.sourceText,chartKey:SOURCE_CASE.chartKey,sourceContextType:'chart-case',sourcePredicateType:'relation-event',
        annotationDisposition:'relation-target-present',contextSpans:[{ role:'explicit-natal-year-seal-month-killer-scope',text:'年印，月杀' }],
        relationUnits:[{ id:'CF-SMNC-ANN-01-R01',relationClauseSpan:'年印，月杀，未得相通',sourceRoleSpan:'月杀',sourceRoleClass:'七杀',
            predicateSpan:'未得相通',predicateType:'relation-event',relationSemanticHint:null,
            target:{ span:'年印',mentionMode:'explicit-source-pillar-and-role',antecedentSpan:null,roleClass:'偏印',chartBindingRequired:true },
            outcomeSpans:[{ span:'未得相通',kind:'reviewed-exact-killer-seal-communication-nonrealization' }] }],
        sourceEvidenceIds:[SOURCE_CASE.id],blockerReasons:[] });
    const IDENTITY_AUTHORITY = freeze({ id:'CF-SMNC-IDENTITY-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,
        unitId:ANNOTATION.relationUnits[0].id,sourcePathId:'CF-SMNC-PATH-01',chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:'visible:1:丁',targetActorKey:'visible:0:己',endpointScope:'visible-stem',endpointCardinality:1,
        sourceNamingSpan:'月杀',targetNamingSpan:'年印',sourceTenGod:'七杀',targetTenGod:'偏印',
        roleBasis:'The natal commentary explicitly names 月杀 and 年印. Relative to 辛, the month visible 丁 is 七杀 and the year visible 己 is 偏印. This independent pillar/role review does not select hidden 丁 or 己 from hour 未.',
        directionBasis:'相通 is phrased symmetrically. The independently reviewed assessment path retains killer→seal order, month 丁→year 己, without claiming literal directed generation in the wording.',
        literalDirectedGenerationAsserted:false,authorityScope:'exact-natal-month-visible-killer-to-year-visible-seal-only',
        branchOrHiddenSubstitutionAuthorized:false,reverseEdgeAuthorized:false });
    const REALIZATION_AUTHORITY = freeze({ id:'CF-SMNC-REALIZATION-01',sourceCaseId:SOURCE_CASE.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
        sourcePathId:IDENTITY_AUTHORITY.sourcePathId,chartKey:SOURCE_CASE.chartKey,functionType:'source-asserted-killer-seal-communication',directed:true,
        state:'not-realized-in-source-context',evidenceSpan:'年印，月杀，未得相通',
        reviewedBasis:'The exact natal source denies communication between the named month killer and year seal. Nonrealization applies to this reviewed communication path. It does not deny elemental 火生土, assert that every generation edge failed, or derive failure from adjacency/distance/roles alone.',
        authorityScope:'exact-natal-killer-seal-communication-nonrealization-only',generationNonrealizationInferred:false,
        genericNegationParserAuthorized:false,sourceEvidenceIds:[SOURCE_CASE.id,ANNOTATION.id,IDENTITY_AUTHORITY.id,'CF-SMNC-REALIZATION-01'],
        effectTypeAuthorized:false });
    const EXCLUDED_CONTEXT = freeze({ id:'CF-SMNC-EXCLUDED-01',sourceCaseId:SOURCE_CASE.id,
        branchFormationSpan:'时支未土，又会卯化木',branchMaoCandidateKeys:['surface-branch:1:卯','surface-branch:2:卯'],
        branchDisposition:'configuration-context-without-reviewed-member-binding-or-result-actor',
        assertedKillerSupportSpan:'只有生杀之情，而无辅主之意',assertedSupportPreservedAsContext:true,
        independentSupportIdentityOrEffectAuthority:null,positiveEffectAuthority:null,r5SourceFamilyRegistered:false,
        branchMediationFailedFromVisiblePath:false,allRelationsAbsentFromNoncommunication:false,
        memberEdges:[],reverseEdges:[],transformationResultMaterializationAuthorized:false,
        comparisonCaseId:prior.SOURCE_CASE.id,comparisonPathId:prior.IDENTITY_AUTHORITY.sourcePathId,
        comparisonDisposition:'independently-reviewed-source-contrast-across-different-charts-and-endpoint-scopes',
        controlledCounterfactual:false,positiveAuthorityInherited:false,causalPositionRuleDerived:false,
        fortuneOrBiographyIncluded:false,finalStrengthMapping:false });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-MEDIATION-NONCOMMUNICATION-CONTRACT-001',version:VERSION,
        reviewScope:'one-exact-natal-month-visible-killer-to-year-visible-seal-noncommunication',reusedCompleteSourceCaseCount:0,
        newCompleteSourceCaseCount:1,reviewedRelationCount:1,newEffectAuthorityCount:0,
        actualInventoryTargetNormalizerR3R4Required:true,branchNegativeCalibrationEstablished:false,
        genericGenerationNonrealizationMapping:false,genericPositionOrAdjacencyRule:false,r5FamilyAdded:false,
        numericAggregation:false,membershipMutation:false,finalStrengthMapping:false,
        boundary:'R25 independently reviews one new complete natal chart and the explicit 年印，月杀，未得相通 clause. Actual inventory/normalization/R3/R4 retain month visible 丁→year visible 己 as a nonrealized communication path, not a denied elemental generation edge. R24 branch mediation remains separately authorized; this contrast crosses charts and scopes, establishes no branch-negative calibration or controlled causal position rule, and licenses no reverse effect, branch/hidden substitution, 未卯 member selection, transformed actor, support effect, R5 family, global force or final strength.' });
    GuiJia.baziContextualForcePartySourceMediationNoncommunicationContract = freeze({ installed:true,VERSION,RULE_ID,STATES,SOURCE_CASE,
        ANNOTATION,IDENTITY_AUTHORITY,REALIZATION_AUTHORITY,EXCLUDED_CONTEXT,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
