(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchKillerDirectionAuditContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceBranchOfficerOppositionContract;
    const motifs = GuiJia.baziContextualForcePartyRelationEffectContract;
    if (!prior || !motifs) return;
    const { freeze,SOURCE_CASE } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-KILLER-DIRECTION-AUDIT-001';
    const STATES = freeze({ RESOLVED:'reviewed-source-branch-hua-direction-realized-unmapped',INVALID:'invalid-source-branch-direction-review',
        UNRESOLVED:'unresolved-source-branch-killer-direction',NOT_APPLICABLE:'source-branch-killer-direction-not-applicable' });
    const ANNOTATION = freeze({ id:'CF-SBKDA-ANN-01',upstreamCaseId:SOURCE_CASE.id,sourceId:SOURCE_CASE.sourceId,
        sourceText:SOURCE_CASE.sourceText,chartKey:SOURCE_CASE.chartKey,sourceContextType:'chart-case',sourcePredicateType:'relation-event',
        annotationDisposition:'relation-target-present',contextSpans:[{ role:'source-killer-seal-context-only',text:'煞印相生' }],
        relationUnits:[{ id:'CF-SBKDA-ANN-01-R01',relationClauseSpan:'子水化其申金',sourceRoleSpan:'子水',sourceRoleClass:'source-named-water-branch',
            predicateSpan:'化',predicateType:'relation-event',relationSemanticHint:null,
            target:{ span:'其申金',mentionMode:'explicit-source-branch-mention',antecedentSpan:null,
                roleClass:'source-identified-killer-bearing-branch',chartBindingRequired:true },outcomeSpans:[] }],
        sourceEvidenceIds:[SOURCE_CASE.id],blockerReasons:[] });
    const IDENTITY_AUTHORITY = freeze({ id:'CF-SBKDA-IDENTITY-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,
        unitId:ANNOTATION.relationUnits[0].id,sourcePathId:'CF-SBKDA-PATH-01',chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:'surface-branch:3:子',targetActorKey:'surface-branch:2:申',endpointScope:'surface-branch',endpointCardinality:1,
        sourceNamingSpan:'子水',targetNamingSpan:'申金',targetRoleClass:'source-identified-killer-bearing-branch',
        roleBasis:'The commentary names Zi water acting on Shen metal, in a killer/seal context. Shen contains 庚,壬,戊 with 七杀,偏印,偏财 roles relative to 甲; the whole branch is not a single 七杀 actor. Zi is not replaced by hidden 癸 and Shen is not replaced by hidden 庚 or 壬.',
        sourceWholeBranchTenGod:null,targetWholeBranchTenGod:null,hiddenRoleProjectionAuthorized:false,
        authorityScope:'exact-source-named-zi-to-shen-branch-pair-only',branchExpandsToHiddenActors:false });
    const REALIZATION_AUTHORITY = freeze({ id:'CF-SBKDA-REALIZATION-01',sourceCaseId:SOURCE_CASE.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
        sourcePathId:IDENTITY_AUTHORITY.sourcePathId,chartKey:SOURCE_CASE.chartKey,functionType:'source-asserted-branch-hua',directed:true,
        state:'realized-in-source-context',evidenceSpan:'子水化其申金',
        reviewedBasis:'The exact natal commentary affirmatively asserts the named 子水化申金 interaction. This realizes the reviewed clause direction only; it does not independently realize a reversed generation edge or license an effect type.',
        authorityScope:'exact-natal-zi-to-shen-clause-realization-only',genericHuaParserAuthorized:false,
        sourceEvidenceIds:[SOURCE_CASE.id,ANNOTATION.id,IDENTITY_AUTHORITY.id,'CF-SBKDA-REALIZATION-01'],effectTypeAuthorized:false });
    const DIRECTION_REVIEW = freeze({ id:'CF-SBKDA-DIRECTION-01',sourceCaseId:SOURCE_CASE.id,sourcePathId:IDENTITY_AUTHORITY.sourcePathId,
        clauseDirection:{ fromActorKey:IDENTITY_AUTHORITY.sourceActorKey,toActorKey:IDENTITY_AUTHORITY.targetActorKey,
            semantics:'source-named-water-branch-hua-metal-branch' },
        underlyingGenerationDirection:{ fromActorKey:IDENTITY_AUTHORITY.targetActorKey,toActorKey:IDENTITY_AUTHORITY.sourceActorKey,
            fromElement:'金',toElement:'水',scope:'structural-element-direction-context-only',
            realizedExecutableEdgeAuthorized:false,effectTypeAuthorized:false },
        sourceContextSpan:'煞印相生',existingMotif:motifs.MOTIFS.find((m) => m.id === 'CF-PRE-MOTIF-KILLER-MEDIATES-THROUGH-SEAL-001'),
        clauseOrderMatchesExistingMotif:false,branchRoleProjectionAuthorized:false,
        reverseGenerationEdgeCreated:false,positiveEffectAuthority:null,r5SourceFamilyRegistered:false,
        sourceContextAutomaticallyDistributesEffect:false,transformationResultActorAuthorized:false,
        blockerReasons:['clause-direction-does-not-match-registered-killer-to-seal-motif',
            'no-independent-branch-pair-effect-type-authority',
            'structural-generation-direction-is-not-realized-executable-edge',
            'whole-branch-to-hidden-role-projection-not-authorized'],
        reviewBasis:'The registered mediation motif preserves killer→seal generation. The named clause runs 子→申. 金→水 supplies an opposite structural direction, not a new source-backed realized edge. The general 煞印相生 context is not distributed into a new executable branch/hidden pair or a positive license.' });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-KILLER-DIRECTION-AUDIT-CONTRACT-001',version:VERSION,
        reviewScope:'one-exact-natal-zi-to-shen-clause-and-direction-boundary',reusedCompleteSourceCaseCount:1,newCompleteSourceCaseCount:0,
        reviewedRelationCount:1,newEffectAuthorityCount:0,actualInventoryTargetNormalizerR3R4Required:true,
        independentOfR22OppositionExecution:true,underlyingGenerationIsSeparateContext:true,
        sourceWordHuaDefinesMediation:false,reverseEdgeFromClauseAuthorized:false,hiddenRoleProjectionAuthorized:false,
        transformationResultMaterializationAuthorized:false,groupMembershipMutation:false,numericAggregation:false,finalStrengthMapping:false,
        boundary:'R23 reuses the R22 primary chart but independently validates named 子→申 branch identity and affirmative clause realization. Actual normalization/R3/R4 preserve realized-unmapped. Opposite 金→水 direction and 煞印相生 remain context, without a reversed executable edge, hidden-role projection, R5 effect family, mediation license, transformation-result actor, composition, membership or final strength. R22 opposition is unchanged.' });
    GuiJia.baziContextualForcePartySourceBranchKillerDirectionAuditContract = freeze({ installed:true,VERSION,RULE_ID,STATES,SOURCE_CASE,
        ANNOTATION,IDENTITY_AUTHORITY,REALIZATION_AUTHORITY,DIRECTION_REVIEW,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
