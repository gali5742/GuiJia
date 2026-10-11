(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceSealObstructionContrastContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceBranchRestraintNonrealizationContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-SEAL-OBSTRUCTION-CONTRAST-001';
    const STATES = freeze({ RESOLVED:'reviewed-exact-source-seal-obstruction-contrast',INVALID:'invalid-source-seal-obstruction-review',
        UNRESOLVED:'unresolved-source-seal-obstruction-contrast',NOT_APPLICABLE:'source-seal-obstruction-contrast-not-applicable' });
    const SOURCE_CASE = freeze({ id:'CF-SSOC-CASE-01',sourceId:'CF-SSOC-SRC-DTS',sourceTier:'classical-semantic-authority',
        sourceTitle:'《滴天髓阐微》',sourceUrl:prior.SOURCE_CASE.sourceUrl,retrievedOn:'2026-10-12',revisionId:null,
        locator:'通神论 · 二十、通关 · 戊辰乙卯辛丑丁酉命例',chartKey:'戊辰|乙卯|辛丑|丁酉',
        gans:['戊','乙','辛','丁'],zhis:['辰','卯','丑','酉'],sourceContextType:'chart-case',predicateType:'relation-event',
        sourceText:'此春金气弱 ，时杀紧克，年逢印绶，远隔不通。又被旺木克土坏印，不但戊土不能生化，即日支之丑土，亦被卯木所坏。此局内无可通之理。',
        excerptScope:'natal-commentary-before-luck-and-biography',sourceEvidenceIds:['CF-SSOC-CASE-01'] });
    const endpoint = (actorKey,scope,roleClass) => ({ type:'actor',actorKey,scope,cardinality:1,roleClass });
    const RELATION_REVIEWS = freeze([
        { id:'CF-SSOC-REVIEW-01',sourceCaseId:SOURCE_CASE.id,chartKey:SOURCE_CASE.chartKey,
            annotationId:'CF-SSOC-ANN-01',unitId:'CF-SSOC-ANN-01-R01',sourcePathId:'CF-SSOC-PATH-01',
            relationClauseSpan:'时杀紧克，年逢印绶，远隔不通',sourceSpan:'时杀',predicateSpan:'不通',targetSpan:'年逢印绶',targetRoleClass:'正印',
            sourceEndpoint:endpoint('visible:3:丁','visible-stem','七杀'),targetEndpoint:endpoint('visible:0:戊','visible-stem','正印'),
            identityAuthorityId:'CF-SSOC-IDENTITY-01',identityBasis:'The source explicitly names the hour killer and year seal. Relative to 辛, hour visible 丁 is 七杀 and year visible 戊 is 正印. The following 戊土不能生化 independently names the year stem, corroborating the visible seal scope rather than selecting year branch 辰. Reviewed communication retains killer→seal order; it does not assert directed elemental generation or replace either actor with a branch/hidden stem.',
            relationIdentity:{ id:'CF-SSOC-RELATION-01',functionType:'source-asserted-killer-seal-communication',directed:true },
            realizationAuthority:{ id:'CF-SSOC-REALIZATION-01',state:'not-realized-in-source-context',evidenceSpan:'时杀紧克，年逢印绶，远隔不通',
                reviewedBasis:'远隔不通 explicitly denies communication for the named natal pair. This independently reviewed source clause, not a generic distance rule, establishes nonrealization; it does not deny 火生土 or all chart relations.',
                authorityScope:'exact-hour-visible-killer-to-year-visible-seal-communication-only',effectTypeAuthorized:false },
            sourceEvidenceIds:[SOURCE_CASE.id,'CF-SSOC-ANN-01','CF-SSOC-IDENTITY-01','CF-SSOC-REALIZATION-01'],
            reverseEdgeAuthorized:false,genericDistanceRule:false },
        { id:'CF-SSOC-REVIEW-02',sourceCaseId:SOURCE_CASE.id,chartKey:SOURCE_CASE.chartKey,
            annotationId:'CF-SSOC-ANN-02',unitId:'CF-SSOC-ANN-02-R01',sourcePathId:'CF-SSOC-PATH-02',
            relationClauseSpan:'即日支之丑土，亦被卯木所坏',sourceSpan:'卯木',predicateSpan:'所坏',targetSpan:'日支之丑土',targetRoleClass:'source-named-seal-bearing-earth-branch',
            sourceEndpoint:endpoint('surface-branch:1:卯','surface-branch','source-named-wood-branch'),
            targetEndpoint:endpoint('surface-branch:2:丑','surface-branch','source-named-seal-bearing-earth-branch'),
            identityAuthorityId:'CF-SSOC-IDENTITY-02',identityBasis:'The passive wording names day branch 丑 as the damaged target and 卯木 as the source. The complete chart has one 卯, in the month. 丑 contains 己,癸,辛 with 偏印,食神,比肩 roles relative to 辛; the whole seal-bearing branch is not a pure 印 or a hidden 己 actor.',
            relationIdentity:{ id:'CF-SSOC-RELATION-02',functionType:'source-asserted-branch-seal-damage',directed:true },
            realizationAuthority:{ id:'CF-SSOC-REALIZATION-02',state:'realized-in-source-context',evidenceSpan:'即日支之丑土，亦被卯木所坏',
                reviewedBasis:'亦被卯木所坏 affirmatively asserts this named natal branch damage. It is not nonrealization of the damage path. A source event and structural 木克土 alone do not supply an independently registered effect-type license.',
                authorityScope:'exact-month-mao-to-day-chou-source-damage-only',effectTypeAuthorized:false },
            sourceEvidenceIds:[SOURCE_CASE.id,'CF-SSOC-ANN-02','CF-SSOC-IDENTITY-02','CF-SSOC-REALIZATION-02'],
            sourceWholeBranchTenGod:null,targetWholeBranchTenGod:null,hiddenRoleProjectionAuthorized:false,
            branchExpandsToHiddenActors:false,positiveEffectAuthority:null,r5SourceFamilyRegistered:false,reverseEdgeAuthorized:false }
    ]);
    const CONFIGURATION_REVIEW = freeze({ id:'CF-SSOC-CONFIG-01',sourceCaseId:SOURCE_CASE.id,chartKey:SOURCE_CASE.chartKey,
        sourceSpan:'此局内无可通之理',configurationLabel:'natal-communication-unavailable',state:'not-realized-in-source-context',
        scope:'whole-natal-configuration',configurationActorEndpoint:null,configurationMemberActorKeys:[],
        formationFailureIsActorNonrealization:false,allRelationsAbsent:false,independentBranchMediationFailureAuthorized:false,
        relatedSourcePathIds:RELATION_REVIEWS.map((r) => r.sourcePathId),compositionOrCausalRuleAuthorized:false,
        reviewedBasis:'The source denies communication at whole natal configuration scope. This is a non-actionable configuration target, not a group actor, a negative realization license for every possible pair, or a causal composition of the separately reviewed paths.' });
    const DEFERRED_CONTEXT = freeze({ id:'CF-SSOC-DEFERRED-01',sourceCaseId:SOURCE_CASE.id,
        sourceSpans:['春金气弱','时杀紧克','旺木克土坏印','戊土不能生化'],
        disposition:'preserved-source-assertions-without-additional-pair-realization-or-effect-authority',
        branchSealCandidateActorKey:'surface-branch:2:丑',branchMediationSourceEndpoint:null,
        branchMediationPathIdentityResolved:false,branchMediationRealizationState:'unresolved-relation-realization',
        branchMediationEffectAuthority:null,visibleKillerAutomaticallyBoundToBranchSeal:false,
        branchDamageAutomaticallyNegatesKillerSealGeneration:false,sourcePartySwitchAuthorized:false,
        fortuneOrBiographyIncluded:false,memberEdges:[],reverseEdges:[],transformationResultMaterializationAuthorized:false });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-SEAL-OBSTRUCTION-CONTRAST-CONTRACT-001',version:VERSION,
        reviewScope:'one-new-natal-source-visible-noncommunication-named-branch-damage-and-configuration-boundary',
        reusedCompleteSourceCaseCount:0,newCompleteSourceCaseCount:1,reviewedRelationCount:2,reviewedConfigurationCount:1,newEffectAuthorityCount:0,
        actualInventoryNormalizedContractR3R4Required:true,branchMediationNegativeCalibrationEstablished:false,
        genericDamageEffectMapping:false,genericDistanceRule:false,r5FamilyAdded:false,numericAggregation:false,
        membershipMutation:false,finalStrengthMapping:false,
        boundary:'R27 independently reviews a new complete natal chart: hour visible 丁→year visible 戊 communication is not-realized; named month 卯→day 丑 damage is realized-unmapped; whole-chart 无可通之理 is a non-actionable configuration consumed by actual R3/R4. The mixed-role branch stays whole. No generic distance/damage mapping, hidden/visible substitution, all-pair failure distribution, automatic killer→branch-seal negative path, reverse/group/member/compound effect, R5 family, result materialization or final strength follows.' });
    GuiJia.baziContextualForcePartySourceSealObstructionContrastContract = freeze({ installed:true,VERSION,RULE_ID,STATES,SOURCE_CASE,
        RELATION_REVIEWS,CONFIGURATION_REVIEW,DEFERRED_CONTEXT,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
