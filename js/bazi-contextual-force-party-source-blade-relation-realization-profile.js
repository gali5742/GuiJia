(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBladeRelationRealizationProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceBladeRelationRealizationContract;
    const upstream = GuiJia.baziContextualForcePartySourceBladeTargetCalibrationProfile;
    const kernel = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const kernelContract = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract;
    const chart = GuiJia.baziVisibleStemFunctionRealizationSource;
    if (!api || !upstream || !kernel || !kernelContract || !chart) return;
    const { VERSION,RULE_ID,STATES,SOURCE_CASE,FUNCTION_CONTEXT,RELATION_REVIEWS,OUTCOME_REVIEW,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id ? {
        upstreamInput:upstream.inputForCase(id),functionContext:FUNCTION_CONTEXT,relationReviews:RELATION_REVIEWS,outcomeReview:OUTCOME_REVIEW
    } : null;
    const validateSourceInput = (input) => {
        if (!same(input,inputForCase())) return freeze({ valid:false,issues:['exact-registered-source-clause-realization-and-outcome-review-required'] });
        const validation = upstream.validateSourceInput(input.upstreamInput);
        return freeze({ valid:validation.valid,issues:[...validation.issues] });
    };
    const evaluateSource = (input,context = {}) => {
        const sourceValidation = validateSourceInput(input);
        const base = { sourceValidation,upstreamResult:null,paths:[],relationIdentityResolved:false,relationRealizationResolved:false,
            effectAuthorizationResolved:false,executionAuthorized:false,jointOutcomeReview:null,relationEffects:[],memberEdges:[],
            transformedResultMaterializationAuthorized:false,numericScore:null,relativeDominance:null };
        const result = (status,blockerReasons = [],extra = {}) => freeze({ ...base,status,blockerReasons,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        // Re-evaluate the actual source/inventory consumer; callers cannot inject precomputed target or execution results.
        const upstreamResult = upstream.evaluateSource(input.upstreamInput,context);
        if (upstreamResult.status === upstream.STATES.NOT_APPLICABLE) return result(STATES.NOT_APPLICABLE,upstreamResult.blockerReasons,{ upstreamResult });
        if (upstreamResult.status !== upstream.STATES.RESOLVED) return result(STATES.UNRESOLVED,upstreamResult.blockerReasons,{ upstreamResult });
        const paths = input.relationReviews.map((review) => {
            const index = upstreamResult.normalizedInput.relationUnits.findIndex((u) => u.id === review.unitId);
            const unit = upstreamResult.normalizedInput.relationUnits[index],targetResolution = upstreamResult.targetResolution.unitResolutions[index];
            if (!unit || unit.identityProvenance.sourceActorKeys[0] !== review.sourceActorKey
                || targetResolution?.targetReference?.actorKey !== review.targetActorKey) return null;
            const executionInput = { id:`CF-SBRR-EXECUTION-${index + 1}`,sourceCaseId:SOURCE_CASE.id,sourcePathId:review.sourcePathId,
                sourceEndpoint:{ type:'actor',actorKey:review.sourceActorKey,scope:review.endpointScope,cardinality:review.endpointCardinality },
                targetResolution:copy(targetResolution),relationIdentity:copy(review.relationIdentity),
                realizationState:review.realizationAuthority.state,
                authorization:{ state:kernelContract.AUTHORIZATION_STATES.UNMAPPED,sourceBacked:false,relationTypes:[],authorityIds:[],
                    sourceEvidenceIds:[...review.realizationAuthority.sourceEvidenceIds] } };
            const execution = kernel.executeRelationEffect(executionInput);
            return { sourcePathId:review.sourcePathId,review:copy(review),relationRealized:true,
                effectTypeMapped:false,executionAuthorized:false,executionInput,execution };
        });
        if (paths.length !== 2 || paths.some((p) => !p || p.execution.executionState !== kernelContract.EXECUTION_STATES.REALIZED_UNMAPPED)) {
            return result(STATES.UNRESOLVED,['actual-r3-to-r4-source-clause-consumption-failed'],{ upstreamResult });
        }
        return result(STATES.RESOLVED,['source-realized-relations-have-no-independent-effect-type-authority'],{
            upstreamResult,paths,relationIdentityResolved:true,relationRealizationResolved:true,jointOutcomeReview:copy(input.outcomeReview) });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const result = evaluateSource(inputForCase(),{ chartKey:chart.buildStructuredChartKey(semanticModel,synthesis) || null,
            inventory:synthesis.contextualForcePartyMembershipInventory });
        return freeze({ result,finiteSourceReviewComplete:validateSourceInput(inputForCase()).valid,sourceCaseCount:1,reviewedRelationCount:2,
            resolvedRuntimeRelationCount:result.paths.filter((p) => p.relationRealized).length,
            realizedUnmappedRuntimePathCount:result.paths.filter((p) => p.execution.executionState === kernelContract.EXECUTION_STATES.REALIZED_UNMAPPED).length,
            newEffectAuthorityCount:0,positiveEffectCount:0,jointEffectAuthorityCount:0,broadSourceCoverageComplete:false,
            relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceBladeRelationRealizationProfile = freeze({ installed:true,VERSION,RULE_ID,STATES,CONTRACT,
        inputForCase,validateSourceInput,evaluateSource,buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
