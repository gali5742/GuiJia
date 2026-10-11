(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchRestraintNonrealizationContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceBranchMediationCalibrationContract;
    const previous = GuiJia.baziContextualForcePartySourceMediationNoncommunicationContract;
    if (!prior || !previous) return;
    const { freeze,SOURCE_CASE } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-RESTRAINT-NONREALIZATION-001';
    const STATES = freeze({ RESOLVED:'resolved-exact-source-branch-restraint-nonrealization',INVALID:'invalid-source-branch-restraint-nonrealization-review',
        UNRESOLVED:'unresolved-source-branch-restraint-nonrealization',NOT_APPLICABLE:'source-branch-restraint-nonrealization-not-applicable' });
    const ANNOTATION = freeze({ id:'CF-SBRN-ANN-01',upstreamCaseId:SOURCE_CASE.id,sourceId:SOURCE_CASE.sourceId,
        sourceText:SOURCE_CASE.sourceText,chartKey:SOURCE_CASE.chartKey,sourceContextType:'chart-case',sourcePredicateType:'relation-event',
        annotationDisposition:'relation-target-present',contextSpans:[{ role:'independently-reviewed-branch-scope',text:'天干地支皆杀生印' },
            { role:'source-wood-context-for-restraint-negation',text:'水见木不克火而生木' }],
        relationUnits:[{ id:'CF-SBRN-ANN-01-R01',relationClauseSpan:'水见木不克火而生木',sourceRoleSpan:'水',sourceRoleClass:'source-named-water-branch',
            predicateSpan:'不克',predicateType:'relation-event',relationSemanticHint:null,
            target:{ span:'火',mentionMode:'source-element-with-independently-reviewed-branch-scope',antecedentSpan:null,
                roleClass:'source-named-fire-branch',chartBindingRequired:true },
            outcomeSpans:[{ span:'不克火',kind:'reviewed-exact-branch-restraint-nonrealization' }] }],
        sourceEvidenceIds:[SOURCE_CASE.id],blockerReasons:[] });
    const IDENTITY_AUTHORITY = freeze({ id:'CF-SBRN-IDENTITY-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,
        unitId:ANNOTATION.relationUnits[0].id,sourcePathId:'CF-SBRN-PATH-01',chartKey:SOURCE_CASE.chartKey,reviewedOn:'2026-10-12',
        sourceActorKey:'surface-branch:1:子',targetActorKey:'surface-branch:3:午',endpointScope:'surface-branch',endpointCardinality:1,
        sourceNamingSpan:'水',targetNamingSpan:'火',sourceRoleClass:'source-named-water-branch',targetRoleClass:'source-named-fire-branch',
        literalBranchNamesInClause:false,scopeSpan:'天干地支皆杀生印',
        reviewedScopeBasis:'The commentary explicitly treats heavenly stems and earthly branches and describes water encountering wood, not restraining fire but generating wood. This independently reviewed exact branch reading binds the sole water branch 子 and sole fire branch 午, with sole wood branch 卯 as source context. The wording does not literally name 子/午; the branch reading is a reviewed inference, not inherited R24 effect authority or a generic scope splitter.',
        targetRoleBasis:'午 remains the whole source-named fire branch. Its hidden 丁/己 have 比肩/食神 roles relative to 丁; the branch is not projected to a pure 比肩, hidden 丁, visible day master or hour 丙.',
        sourceWholeBranchTenGod:null,targetWholeBranchTenGod:null,hiddenRoleProjectionAuthorized:false,
        branchExpandsToHiddenActors:false,visibleEndpointSubstitutionAuthorized:false,authorityScope:'exact-reviewed-zi-to-wu-branch-pair-only' });
    const CONTEXT_REVIEW = freeze({ id:'CF-SBRN-CONTEXT-01',sourceCaseId:SOURCE_CASE.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
        sourceSpan:'水见木不克火而生木',contextActorKey:'surface-branch:2:卯',contextScope:'surface-branch',contextElement:'木',
        contextDisposition:'independently-reviewed-wood-presence-for-this-exact-natal-assertion',actualContextActorRequired:true,
        contextIsRelationEndpoint:false,contextIsMaterializedActor:false,groupOrCompoundEdgeAuthorized:false,
        priorPositivePathId:prior.IDENTITY_AUTHORITY.sourcePathId,positiveExecutionRequired:false,positiveEffectAuthorityInherited:false,
        positivePathNegated:false,exclusiveWinnerOrCausalPriorityDefined:false,genericWoodPresenceRule:false });
    const REALIZATION_AUTHORITY = freeze({ id:'CF-SBRN-REALIZATION-01',sourceCaseId:SOURCE_CASE.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
        contextReviewId:CONTEXT_REVIEW.id,sourcePathId:IDENTITY_AUTHORITY.sourcePathId,chartKey:SOURCE_CASE.chartKey,
        functionType:'restraint',directed:true,state:'not-realized-in-source-context',evidenceSpan:'水见木不克火而生木',negationSpan:'不克火',
        reviewedBasis:'For the independently reviewed branch scope of this exact natal statement, 不克火 denies the 子→午 restraint path in the described wood context. Water/fire elements or a clash do not by themselves establish this negative realization. No generic 木介入→水不克火 rule, physical zero-force claim or negation of another relation kind follows.',
        authorityScope:'exact-natal-zi-to-wu-restraint-nonrealization-only',genericNegationParserAuthorized:false,
        sourceEvidenceIds:[SOURCE_CASE.id,ANNOTATION.id,IDENTITY_AUTHORITY.id,CONTEXT_REVIEW.id,'CF-SBRN-REALIZATION-01'],effectTypeAuthorized:false });
    const EXCLUDED_CONTEXT = freeze({ id:'CF-SBRN-EXCLUDED-01',sourceCaseId:SOURCE_CASE.id,
        clashSpan:'四冲反为四助',clashDisposition:'source-clash-outcome-context-kept-separate-from-restraint-realization',
        clashNonrealizationInferred:false,clashBenefitMappedToPerPair:false,
        otherSourceSpans:['印生身','时归禄旺','金见水克木而生水'],
        otherClauseDisposition:'preserved-source-context-without-additional-effect-or-identity-authority',
        mediationNonrealizationEstablished:false,positiveEffectAuthority:null,r5SourceFamilyRegistered:false,
        allRelationsAbsentFromNonrealization:false,reverseEdges:[],memberEdges:[],transformationResultMaterializationAuthorized:false,
        sourcePartySwitchAuthorized:false,dayMasterBenefitOrStrengthAuthorized:false,controlledCounterfactual:false,
        comparisonDisposition:'same-source-distinct-target-and-relation-kind-with-separate-positive-authority' });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-RESTRAINT-NONREALIZATION-CONTRACT-001',version:VERSION,
        reviewScope:'one-exact-natal-zi-to-wu-branch-restraint-nonrealization-with-reviewed-wood-context',
        reusedCompleteSourceCaseCount:1,newCompleteSourceCaseCount:0,reviewedRelationCount:1,newEffectAuthorityCount:0,
        actualInventoryTargetNormalizerR3R4Required:true,branchRestraintNegativeCalibrationEstablished:true,
        branchMediationNegativeCalibrationEstablished:false,genericBranchNegationMapping:false,r5FamilyAdded:false,
        numericAggregation:false,membershipMutation:false,finalStrengthMapping:false,
        boundary:'R26 reuses the R24 primary chart but independently reviews branch scope, unique 子→午 endpoints, actual 卯 wood context and explicit 不克火 restraint nonrealization. Actual normalization/R3/R4 retain not-realized. R24 子→卯 mediation remains independently positive; no positive execution prerequisite, effect-license transfer, clash negation, pure-role/hidden/visible substitution, reverse effect, member/group/compound edge, priority winner, branch-mediation failure rule, materialization, R5 family or final strength is introduced.' });
    GuiJia.baziContextualForcePartySourceBranchRestraintNonrealizationContract = freeze({ installed:true,VERSION,RULE_ID,STATES,SOURCE_CASE,
        ANNOTATION,IDENTITY_AUTHORITY,CONTEXT_REVIEW,REALIZATION_AUTHORITY,EXCLUDED_CONTEXT,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
