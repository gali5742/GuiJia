(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchMediationCalibrationContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceBranchKillerDirectionAuditContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-MEDIATION-CALIBRATION-001';
    const STATES = freeze({ RESOLVED:'resolved-exact-source-branch-mediation',INVALID:'invalid-source-branch-mediation-authority',
        UNRESOLVED:'unresolved-source-branch-mediation',NOT_APPLICABLE:'source-branch-mediation-not-applicable' });
    const SOURCE_CASE = freeze({ id:'CF-SBMC-CASE-01',sourceId:'CF-SBMC-SRC-DTS',sourceTier:'classical-semantic-authority',
        sourceTitle:'《滴天髓阐微》',sourceUrl:prior.SOURCE_CASE.sourceUrl,retrievedOn:'2026-10-11',revisionId:null,
        locator:'通神论 · 二十、通关 · 癸酉甲子丁卯丙午命例',chartKey:'癸酉|甲子|丁卯|丙午',
        gans:['癸','甲','丁','丙'],zhis:['酉','子','卯','午'],sourceContextType:'chart-case',predicateType:'relation-event',
        sourceText:'此造天干地支皆杀生印，印生身，时归禄旺，尤妙四冲反为四助，金见水克木而生水，水见木不克火而生木，此自然不隔不占，无阻节之物。',
        existingPrimaryCaseId:'CF-VMEC-MED-CASE-06',existingVisibleRealizationPatternId:'DTS-VISIBLE-REALIZATION-GUI-GENERATES-JIA-001',
        provenanceReuseOnly:true,visibleAuthorizationInherited:false,sourceEvidenceIds:['CF-SBMC-CASE-01'] });
    const ANNOTATION = freeze({ id:'CF-SBMC-ANN-01',upstreamCaseId:SOURCE_CASE.id,sourceId:SOURCE_CASE.sourceId,
        sourceText:SOURCE_CASE.sourceText,chartKey:SOURCE_CASE.chartKey,sourceContextType:'chart-case',sourcePredicateType:'relation-event',
        annotationDisposition:'relation-target-present',contextSpans:[{ role:'explicit-source-branch-scope',text:'天干地支皆杀生印' },
            { role:'reviewed-branch-water-to-wood-outcome',text:'水见木不克火而生木' }],
        relationUnits:[{ id:'CF-SBMC-ANN-01-R01',relationClauseSpan:'地支皆杀生印',sourceRoleSpan:'杀',sourceRoleClass:'七杀',
            predicateSpan:'生',predicateType:'relation-event',relationSemanticHint:null,
            target:{ span:'印',mentionMode:'source-role-with-explicit-branch-scope',antecedentSpan:null,roleClass:'偏印',chartBindingRequired:true },
            outcomeSpans:[{ span:'水见木不克火而生木',kind:'reviewed-exact-branch-killer-seal-generation-outcome' }] }],
        sourceEvidenceIds:[SOURCE_CASE.id],blockerReasons:[] });
    const IDENTITY_AUTHORITY = freeze({ id:'CF-SBMC-IDENTITY-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,
        unitId:ANNOTATION.relationUnits[0].id,sourcePathId:'CF-SBMC-PATH-01',chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:'surface-branch:1:子',targetActorKey:'surface-branch:2:卯',sourceScope:'surface-branch',targetScope:'surface-branch',
        sourceCardinality:1,targetCardinality:1,sourceBranch:'子',targetBranch:'卯',sourceRoleClass:'七杀',targetRoleClass:'偏印',
        sourceNamingSpan:'水',targetNamingSpan:'木',literalBranchNamesInClause:false,explicitBranchScopeSpan:'地支皆杀生印',
        sourceRoleBasis:'In the independently reviewed explicit 地支 scope of this exact chart, 子 is the only water branch and contains only 癸 (七杀 relative to 丁).',
        targetRoleBasis:'卯 is the only wood branch and contains only 乙 (偏印 relative to 丁). The visible 甲正印 is a separate heavenly-stem endpoint and is not this target.',
        roleReviewScope:'exact-source-branch-scope-and-complete-chart-only',genericWholeBranchTenGodProjection:false,
        branchExpandsToHiddenActors:false,visibleEndpointsSubstituted:false,transferablePathIds:[] });
    const REALIZATION_AUTHORITY = freeze({ id:'CF-SBMC-REALIZATION-01',sourceCaseId:SOURCE_CASE.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
        sourcePathId:IDENTITY_AUTHORITY.sourcePathId,chartKey:SOURCE_CASE.chartKey,sourceActorKey:IDENTITY_AUTHORITY.sourceActorKey,
        targetActorKey:IDENTITY_AUTHORITY.targetActorKey,functionType:'generation',directed:true,realizationState:'realized-in-source-context',
        assertionSpan:'地支皆杀生印',contextSpan:'水见木不克火而生木',scopeDecompositionIndependentlyReviewed:true,
        reviewedBasis:'The source affirmatively includes 地支 in 杀生印 and independently describes water generating wood rather than restraining fire. A separate exact-case scope review binds the uniquely identified 子→卯 pair; no element/adjacency rule or reversal of a Hua clause establishes realization.',
        authorityScope:'exact-reviewed-natal-zi-to-mao-branch-generation-only',genericScopeSplitterAuthorized:false });
    const EFFECT_AUTHORITY = freeze({ id:'CF-SBMC-EFFECT-01',sourceCaseId:SOURCE_CASE.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
        realizationAuthorityId:REALIZATION_AUTHORITY.id,sourcePathId:IDENTITY_AUTHORITY.sourcePathId,chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:IDENTITY_AUTHORITY.sourceActorKey,targetActorKey:IDENTITY_AUTHORITY.targetActorKey,relationType:'anchor-mediation',
        outcomeSpan:'水见木不克火而生木',outcomeContextSpan:'此自然不隔不占，无阻节之物',
        reviewedEffectInference:true,reviewedEffectBasisKind:'independent-exact-source-branch-killer-to-seal-mediation-review',
        reviewedBasis:'For this independently reviewed natal branch pair, the asserted killer→seal generation and water not restraining fire but generating wood authorize qualitative killer mediation through the branch seal. This is not an inherited visible 癸→甲 license or a generic generation/role mapping.',
        authorityScope:'exact-natal-branch-killer-to-seal-qualitative-mediation-only',visibleAuthorityInherited:false,
        reverseSealToKillerEdgeAuthorized:false,otherClauseEffectsAuthorized:false,daymasterBenefitOrStrengthAuthorized:false,
        sourceKillerPartySwitchAuthorized:false });
    const EXCLUDED_CONTEXT = freeze({ id:'CF-SBMC-EXCLUDED-01',sourceCaseId:SOURCE_CASE.id,
        sourceSpans:['印生身','时归禄旺','四冲反为四助','金见水克木而生水'],
        disposition:'preserved-source-context-without-additional-identity-realization-or-effect-authority',
        memberEffects:[],compositionAuthorized:false,globalBenefitAuthorized:false,
        priorR23PathId:'CF-SBKDA-PATH-01',priorR23EffectAuthorityTransferred:false });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-MEDIATION-CALIBRATION-CONTRACT-001',version:VERSION,
        reviewScope:'one-exact-natal-zi-to-mao-branch-mediation-source-pair',reusedCompleteSourceCaseCount:1,newCompleteSourceCaseCount:0,
        positiveSourceCaseCount:1,newEffectAuthorityCount:1,independentIdentityRealizationAndEffectRequired:true,
        actualInventoryNormalizerR3Required:true,registeredR5ValidatorRequired:true,actualR4Required:true,
        genericBranchMediationMapping:false,visibleAuthorityTransfer:false,genericScopeSplitting:false,
        knownMotifsExtended:false,reverseEdgeCreation:false,membershipMutation:false,relativeDominanceMapping:false,finalStrengthMapping:false,
        boundary:'R24 reuses the R9 primary chart but independently reviews explicit branch scope, unique 子→卯 identity, affirmative generation and qualitative killer-to-seal mediation. Actual inventory/normalization/R3, separate registered R5 validation and R4 execute one branch effect. No visible/hidden substitution, generic element/role/scope mapping, reversed edge, source party switch, compound effect, final strength or license transfer to R23 申/子 is introduced.' });
    GuiJia.baziContextualForcePartySourceBranchMediationCalibrationContract = freeze({ installed:true,VERSION,RULE_ID,STATES,SOURCE_CASE,
        ANNOTATION,IDENTITY_AUTHORITY,REALIZATION_AUTHORITY,EFFECT_AUTHORITY,EXCLUDED_CONTEXT,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
