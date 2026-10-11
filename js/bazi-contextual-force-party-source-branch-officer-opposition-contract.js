(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchOfficerOppositionContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceBladeOutcomeContrastContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-OFFICER-OPPOSITION-001';
    const STATES = freeze({ RESOLVED:'resolved-exact-source-branch-officer-opposition',INVALID:'invalid-source-branch-opposition-authority',
        UNRESOLVED:'unresolved-source-branch-officer-opposition',NOT_APPLICABLE:'source-branch-officer-opposition-not-applicable' });
    const source = { sourceId:'CF-SBOO-SRC-DTS',sourceTier:'classical-semantic-authority',sourceTitle:'《滴天髓阐微》',
        sourceUrl:prior.SOURCE_CASES[0].sourceUrl,retrievedOn:'2026-10-11',revisionId:null,sourceContextType:'chart-case',predicateType:'relation-event' };
    const SOURCE_CASE = freeze({ ...source,id:'CF-SBOO-CASE-01',chartKey:'壬午|己酉|甲申|甲子',gans:['壬','己','甲','甲'],zhis:['午','酉','申','子'],
        locator:'通神论 · 九、干支总论 · 甲申戊寅真为杀印相生 · 壬午己酉甲申甲子命例',
        sourceText:'甲申日元，生于八月，官杀当权，喜其午火紧制酉金，子水化其申金，所谓去官留煞。煞印相生，木凋金旺，印星为用，',
        sourceEvidenceIds:['CF-SBOO-CASE-01'] });
    const COMPARISON_CASE = freeze({ ...source,id:'CF-SBOO-COMPARE-01',chartKey:'壬辰|己酉|甲申|甲子',gans:['壬','己','甲','甲'],zhis:['辰','酉','申','子'],
        locator:'通神论 · 九、干支总论 · 相邻壬辰己酉甲申甲子命例',
        sourceText:'夫制者克而去之，合者有去有不去也。如以辰土为财，则化金而助杀；以酉金为官，仍化金而党杀。',
        disposition:'contextual-comparison-only',inheritsPositiveAuthority:false,negativeRealizationAuthorized:false,
        effectTypeAuthorized:false,sourceEvidenceIds:['CF-SBOO-COMPARE-01'] });
    const ANNOTATION = freeze({ id:'CF-SBOO-ANN-01',upstreamCaseId:SOURCE_CASE.id,sourceId:SOURCE_CASE.sourceId,
        sourceText:SOURCE_CASE.sourceText,chartKey:SOURCE_CASE.chartKey,sourceContextType:'chart-case',sourcePredicateType:'relation-event',
        annotationDisposition:'relation-target-present',contextSpans:[{ role:'reviewed-officer-role-context',text:'所谓去官留煞' }],
        relationUnits:[{ id:'CF-SBOO-ANN-01-R01',relationClauseSpan:'喜其午火紧制酉金',sourceRoleSpan:'午火',sourceRoleClass:'source-named-fire-branch',
            predicateSpan:'紧制',predicateType:'relation-event',relationSemanticHint:null,
            target:{ span:'酉金',mentionMode:'explicit-source-branch-mention',antecedentSpan:null,roleClass:'正官',chartBindingRequired:true },
            outcomeSpans:[{ span:'去官',kind:'reviewed-path-specific-officer-restraint' }] }],sourceEvidenceIds:[SOURCE_CASE.id],blockerReasons:[] });
    const IDENTITY_AUTHORITY = freeze({ id:'CF-SBOO-IDENTITY-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,
        unitId:'CF-SBOO-ANN-01-R01',sourcePathId:'CF-SBOO-PATH-01',chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:'surface-branch:0:午',targetActorKey:'surface-branch:1:酉',sourceScope:'surface-branch',targetScope:'surface-branch',
        sourceCardinality:1,targetCardinality:1,sourceNamingSpan:'午火',targetNamingSpan:'酉金',targetRoleClass:'正官',
        targetRoleBasis:'The source contrasts 酉官 with 申煞; 酉 contains only 辛, which is 正官 relative to the named 甲 day. The named target endpoint remains the 酉 branch, not a hidden 辛 replacement.',
        sourceRoleBasis:'The source names 午火 as a branch. 午 has 丁 and 己; no single Ten God is assigned to the whole source branch and it is not replaced by hidden 丁.',
        authorityScope:'exact-source-named-surface-branch-pair-only',branchExpandsToHiddenActors:false,transferablePathIds:[] });
    const REALIZATION_AUTHORITY = freeze({ id:'CF-SBOO-REALIZATION-01',sourceCaseId:SOURCE_CASE.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
        sourcePathId:IDENTITY_AUTHORITY.sourcePathId,chartKey:SOURCE_CASE.chartKey,sourceActorKey:IDENTITY_AUTHORITY.sourceActorKey,
        targetActorKey:IDENTITY_AUTHORITY.targetActorKey,functionType:'restraint',directed:true,realizationState:'realized-in-source-context',
        assertionSpan:'喜其午火紧制酉金',reviewedBasis:'The exact natal commentary affirmatively asserts restraint of the explicitly named You branch by Wu fire; no conditional, failed or negated restraint is stated.',
        proximityIsGenericRealizationRule:false,authorityScope:'exact-reviewed-natal-branch-pair-realization-only' });
    const EFFECT_AUTHORITY = freeze({ id:'CF-SBOO-EFFECT-01',sourceCaseId:SOURCE_CASE.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
        realizationAuthorityId:REALIZATION_AUTHORITY.id,sourcePathId:IDENTITY_AUTHORITY.sourcePathId,chartKey:SOURCE_CASE.chartKey,
        sourceActorKey:IDENTITY_AUTHORITY.sourceActorKey,targetActorKey:IDENTITY_AUTHORITY.targetActorKey,relationType:'anchor-opposition',
        outcomeSpan:'去官',outcomeContextSpan:'所谓去官留煞',reviewedEffectInference:true,
        attributionBasis:'The explicitly restrained 酉 endpoint is the 官 named in 去官; 申 is separately the 煞 referenced by the 子水化申 clause. This licenses qualitative opposition only on 午→酉, not augmentation of 申, 子→申 mediation or a combined effect.',
        reviewedBasis:'For this exact natal branch pair, 紧制酉金 with path-specific 去官 is reviewed as qualitative opposition against the source-identified officer endpoint. The type is independently registered here, not inferred from fire/metal, restraint, officer role, adjacency or a lexical 制/去 rule.',
        authorityScope:'exact-natal-source-branch-pair-qualitative-opposition-only',otherClauseEffectsAuthorized:false,
        targetRemovedFromInventory:false,targetGenericIneffectiveStateAuthorized:false,finalStrengthMapping:false });
    const DEFERRED_PATH = freeze({ id:'CF-SBOO-DEFERRED-01',sourceCaseId:SOURCE_CASE.id,sourceSpan:'子水化其申金',
        disposition:'separate-path-needs-independent-identity-realization-and-effect-review',inheritsOppositionAuthority:false,
        mediationAuthorized:false,killerAugmentationFromLeavingAuthorized:false,memberEffects:[] });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-BRANCH-OFFICER-OPPOSITION-CONTRACT-001',version:VERSION,
        reviewScope:'one-exact-natal-wu-branch-opposes-you-officer-source-pair',positiveSourceCaseCount:1,comparisonCaseCount:1,
        independentIdentityRealizationAndEffectRequired:true,actualInventoryNormalizerR3Required:true,registeredR5ValidatorRequired:true,actualR4Required:true,
        genericBranchRestraintEffectMapping:false,knownMotifsExtended:false,newEffectAuthorityCount:1,
        branchToHiddenExpansion:false,groupMembershipMutation:false,relativeDominanceMapping:false,finalStrengthMapping:false,
        boundary:'R22 licenses one exact source-reviewed 午→酉 branch opposition through actual target validation/R3, a separately registered R5 source validator and R4. 去官 is qualitative path attribution, not inventory removal, ineffective state, strength, 申 augmentation, 子→申 mediation, generic restraint/adjacency mapping or authority transfer to the 辰酉 comparison and earlier blade cases.' });
    GuiJia.baziContextualForcePartySourceBranchOfficerOppositionContract = freeze({ installed:true,VERSION,RULE_ID,STATES,SOURCE_CASE,
        COMPARISON_CASE,ANNOTATION,IDENTITY_AUTHORITY,REALIZATION_AUTHORITY,EFFECT_AUTHORITY,DEFERRED_PATH,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
