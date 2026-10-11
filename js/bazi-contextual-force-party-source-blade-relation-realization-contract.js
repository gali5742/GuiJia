(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBladeRelationRealizationContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceBladeTargetCalibrationContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-RELATION-REALIZATION-001';
    const STATES = freeze({ RESOLVED:'reviewed-source-blade-relations-realized-unmapped',INVALID:'invalid-source-blade-realization-review',
        UNRESOLVED:'unresolved-source-blade-relation-realization',NOT_APPLICABLE:'source-blade-realization-not-applicable' });
    const SOURCE_CASE = prior.SOURCE_CASES[0];
    const FUNCTION_CONTEXT = freeze({ id:'CF-SBRR-CONTEXT-01',sourceTitle:SOURCE_CASE.sourceTitle,sourceUrl:SOURCE_CASE.sourceUrl,
        locator:'六亲论 · 二十四、性情 · 羊刃局任氏注',retrievedOn:'2026-10-11',revisionId:null,
        sourceText:'支逢子为冲，遇亥申为制，得丑辰为泄，干透壬癸为克，逢己土为泄，皆谓之弱。',
        applicationScope:SOURCE_CASE.id,role:'corroborating-source-function-context',effectTypeAuthority:false });
    const RELATION_REVIEWS = freeze(prior.ANNOTATION.relationUnits.map((u,i) => ({
        id:`CF-SBRR-REVIEW-0${i + 1}`,sourceCaseId:SOURCE_CASE.id,chartKey:SOURCE_CASE.chartKey,annotationId:prior.ANNOTATION.id,
        unitId:u.id,sourcePathId:u.sourcePathId,relationClauseSpan:u.relationClauseSpan,
        sourceActorKey:u.sourceActorKey,targetActorKey:'surface-branch:1:午',endpointScope:'surface-branch',endpointCardinality:1,
        relationIdentity:{ id:`CF-SBRR-RELATION-0${i + 1}`,functionType:i === 0 ? 'source-asserted-branch-clash' : 'source-asserted-branch-drainage',
            directed:true,directionSemantics:i === 0 ? 'clause-named-clasher-to-blade' : 'clause-named-drainer-to-drained-blade',
            underlyingGenerationDirection:i === 0 ? null : { fromActorKey:'surface-branch:1:午',toActorKey:u.sourceActorKey } },
        realizationAuthority:{ id:`CF-SBRR-REALIZATION-0${i + 1}`,state:'realized-in-source-context',
            authorityScope:'exact-source-case-clause-realization-only',basis:'The natal commentary affirmatively asserts this named interaction against the reviewed blade; no conditional or negated realization is stated.',
            evidenceSpan:u.relationClauseSpan,sourceEvidenceIds:[SOURCE_CASE.id,prior.ANNOTATION.id,prior.IDENTITY_AUTHORITIES[0].id,FUNCTION_CONTEXT.id],
            effectTypeAuthorized:false },
        relationIdentityScope:'exact-reviewed-case-and-directed-clause-only',genericFunctionMapping:false
    })));
    const OUTCOME_REVIEW = freeze({ id:'CF-SBRR-OUTCOME-01',sourceCaseId:SOURCE_CASE.id,chartKey:SOURCE_CASE.chartKey,
        jointOutcomeSpan:'弱可知矣',antecedentSpan:'丙日午提，刃强当令',contributingPathIds:RELATION_REVIEWS.map((r) => r.sourcePathId),
        attributionState:'joint-source-outcome-without-isolated-path-effect-authority',perPathEffectAuthorities:[],jointEffectAuthority:null,
        adjacentContextSpan:'天干三戊，窃日主之精华；',adjacentContextMode:'distinct-daymaster-drainage-context-not-modeled',
        jointOutcomeTargetRole:'source-blade-context',mapsToFinalDaymasterStrength:false,providesNumericForce:false,
        reviewBasis:'The statement follows both clauses. It does not isolate either contribution or give a source-backed mapping into the current effect vocabulary. The adjacent 三戊 statement names a different subject (日主), so it is retained separately.' });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-BLADE-RELATION-REALIZATION-CONTRACT-001',version:VERSION,
        reviewScope:'one-exact-natal-source-case-two-clause-realizations',relationCount:2,actualR19ValidatorAndR3Required:true,actualR4Required:true,
        genericClashOrDrainageEffectMapping:false,newEffectAuthorityCount:0,transformationMaterializationAuthorized:false,
        jointOutcomeDistributesPerPathEffects:false,finalStrengthMapping:false,
        boundary:'R20 reviews two exact source-clause identities and source-context realizations, then consumes actual R3 targets in R4 as realized but currently unmapped. Joint blade weakness and adjacent 三戊 daymaster context grant no individual or joint effect license, numeric strength, cross-case realization or transformed-result endpoint.' });
    GuiJia.baziContextualForcePartySourceBladeRelationRealizationContract = freeze({ installed:true,VERSION,RULE_ID,STATES,SOURCE_CASE,
        FUNCTION_CONTEXT,RELATION_REVIEWS,OUTCOME_REVIEW,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
