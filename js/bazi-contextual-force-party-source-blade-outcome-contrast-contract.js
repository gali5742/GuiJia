(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBladeOutcomeContrastContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceBladeRelationRealizationContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-OUTCOME-CONTRAST-001';
    const STATES = freeze({ RESOLVED:'reviewed-source-blade-barrier-and-failed-restraint',
        AMBIGUOUS:'reviewed-clash-outcome-with-unresolved-target-scope',INVALID:'invalid-source-blade-outcome-review',
        UNRESOLVED:'unresolved-source-blade-outcome-contrast',NOT_APPLICABLE:'source-blade-outcome-contrast-not-applicable' });
    const source = { sourceId:'CF-SBOC-SRC-DTS',sourceTier:'classical-semantic-authority',sourceTitle:'《滴天髓阐微》',
        sourceUrl:prior.SOURCE_CASE.sourceUrl,retrievedOn:'2026-10-11',revisionId:null,sourceContextType:'chart-case',predicateType:'relation-event' };
    const caseRecord = (suffix,chartKey,locator,sourceText,mode) => {
        const pillars = chartKey.split('|').map((p) => Array.from(p));
        return { ...source,id:`CF-SBOC-CASE-${suffix}`,chartKey,gans:pillars.map((p) => p[0]),zhis:pillars.map((p) => p[1]),
            locator,sourceText,mode,sourceEvidenceIds:[`CF-SBOC-CASE-${suffix}`] };
    };
    const SOURCE_CASES = freeze([
        caseRecord('01','壬寅|己酉|庚午|丙戌','六亲论 · 二十七、地位 · 庚日丙时命例',
            '庚日丙时，支逢生旺，寅纳壬水，不能制杀，全赖酉金羊刃当权为用，隔住寅木，使其不能会局，此正“刃杀神清气势特”也。','blade-barrier-and-failed-restraint'),
        caseRecord('02','戊子|戊午|戊戌|戊午','通神论 · 九、干支总论 · 满局火土命例',
            '此满局火土，子衰午旺，冲则午发而愈烈，熬干滴水，是谓天干不覆。','clash-outcome-control-not-blade-case')
    ]);
    const DEFINITION_SOURCE = freeze({ ...source,id:'CF-SBOC-DEF-01',locator:'六亲论 · 二十七、地位 · 刃杀神清任氏注',
        sourceContextType:'theory-general',predicateType:'generalized-relation-rule',sourceText:'秋之庚用酉刃，辛用申刃',
        applicationScope:'CF-SBOC-CASE-01-only',appliedDayGan:'庚',candidateZhi:'酉',
        generalBladeSelectorAuthorized:false,applicationToClashControlAuthorized:false });
    const first = SOURCE_CASES[0],second = SOURCE_CASES[1];
    const endpoint = (actorKey,scope,roleClass) => ({ type:'actor',actorKey,scope,cardinality:1,roleClass });
    const review = (suffix,sourceCase,clause,predicate,targetSpan,targetRole,sourceEndpoint,targetEndpoint,functionType,state,basis) => ({
        id:`CF-SBOC-REVIEW-${suffix}`,sourceCaseId:sourceCase.id,chartKey:sourceCase.chartKey,
        annotationId:`CF-SBOC-ANN-${suffix}`,unitId:`CF-SBOC-ANN-${suffix}-R01`,sourcePathId:`CF-SBOC-PATH-${suffix}`,
        relationClauseSpan:clause,predicateSpan:predicate,targetSpan,targetRoleClass:targetRole,sourceEndpoint,targetEndpoint,
        identityAuthorityId:`CF-SBOC-IDENTITY-${suffix}`,relationIdentity:{ id:`CF-SBOC-RELATION-${suffix}`,functionType,directed:true },
        realizationAuthority:{ id:`CF-SBOC-REALIZATION-${suffix}`,state,evidenceSpan:clause,reviewedBasis:basis,
            authorityScope:'exact-reviewed-natal-clause-only',instanceRealizationAuthorized:targetEndpoint !== null,effectTypeAuthorized:false },
        sourceEvidenceIds:[sourceCase.id,`CF-SBOC-IDENTITY-${suffix}`,`CF-SBOC-REALIZATION-${suffix}`,
            ...(sourceEndpoint.roleClass === '阳刃' ? [DEFINITION_SOURCE.id] : [])],
        genericFunctionEffectMapping:false,negativeCreatesReverseEffect:false
    });
    const RELATION_REVIEWS = freeze([
        review('01',first,'寅纳壬水，不能制杀','不能制','杀','七杀',endpoint('visible:0:壬','visible-stem','食神'),
            endpoint('visible:3:丙','visible-stem','七杀'),'restraint','not-realized-in-source-context',
            'The source explicitly denies restraint of the named hour Bing killer by the year Ren water. 寅纳壬水 identifies the original visible Ren in its year context, not a new transformed source or hidden actor.'),
        review('02',first,'全赖酉金羊刃当权为用，隔住寅木','隔住','寅木','source-named-wood-branch',endpoint('surface-branch:1:酉','surface-branch','阳刃'),
            endpoint('surface-branch:0:寅','surface-branch','source-named-wood-branch'),'source-asserted-branch-barrier','realized-in-source-context',
            'The exact clause names 酉金羊刃 as the barrier and 寅木 as the blocked branch. The subsequent failure to form a configuration is kept separately; this does not assert destruction or a licensed opposition effect on the Yin actor.'),
        { ...review('03',second,'子衰午旺，冲则午发而愈烈','冲','午','source-named-fire-branch',endpoint('surface-branch:0:子','surface-branch','source-named-water-branch'),
            null,'source-asserted-branch-clash','realized-in-source-context',
            'The source asserts a clash and intensification outcome, but the complete chart contains two 午 branches. It does not independently authorize either instance or a group scope.'),
            targetCandidates:[endpoint('surface-branch:1:午','surface-branch','source-named-fire-branch'),endpoint('surface-branch:3:午','surface-branch','source-named-fire-branch')],
            targetCardinality:null,targetScope:null,outcomeSpan:'午发而愈烈',reverseOutcomeSpan:'熬干滴水',
            reverseRelationAuthorized:false,targetIsBlade:false }
    ]);
    const CONFIGURATION_REVIEW = freeze({ id:'CF-SBOC-CONFIG-01',sourceCaseId:first.id,chartKey:first.chartKey,
        sourceSpan:'使其不能会局',antecedentSpan:'隔住寅木',configurationLabel:'会局',formationState:'not-realized-in-source-context',
        barrierPathId:'CF-SBOC-PATH-02',configurationActorEndpoint:null,configurationMemberActorKeys:[],configurationMembershipAuthorized:false,
        blockedActorKey:'surface-branch:0:寅',formationFailureIsActorNonrealization:false,formationFailureIsOppositionLicense:false,
        reviewedBasis:'其 links back to the named 寅木; inability to 会局 concerns configuration formation. No configuration actor, membership expansion, per-member effect or final blade/killer strength follows.' });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-OUTCOME-CONTRAST-CONTRACT-001',version:VERSION,
        reviewScope:'two-exact-natal-cases-failed-restraint-blade-barrier-and-clash-outcome-ambiguity',sourceCaseCount:2,
        actualInventoryAndNormalizedContractRequired:true,actualR3AndR4Required:true,newEffectAuthorityCount:0,
        genericClashBarrierOrFailedRestraintMapping:false,unresolvedTargetHasNoGroupFallback:true,finalStrengthMapping:false,
        boundary:'R21 separates exact failed Ren→Bing restraint, realized You-blade→Yin barrier, non-actionable failed configuration formation and a two-Wu clash intensification control. It grants no positive effect license, implicit group, reciprocal edge, generic clash outcome, transformed-result endpoint, force aggregation or final assessment.' });
    GuiJia.baziContextualForcePartySourceBladeOutcomeContrastContract = freeze({ installed:true,VERSION,RULE_ID,STATES,
        SOURCE_CASES,DEFINITION_SOURCE,RELATION_REVIEWS,CONFIGURATION_REVIEW,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
