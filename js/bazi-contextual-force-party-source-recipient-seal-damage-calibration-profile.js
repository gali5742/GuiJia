(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceRecipientSealDamageCalibrationProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceRecipientSealDamageCalibrationContract;
    const upstream = GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAuditProfile;
    const semantics = GuiJia.baziContextualForcePartyRecipientSealDamageEffectContract;
    const normalizer = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
    const execution = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const chart = GuiJia.baziVisibleStemFunctionRealizationSource;
    if (!api || !upstream || !semantics || !normalizer || !execution || !chart) return;
    const { VERSION,RULE_ID,STATES,SOURCE_CASE,EFFECT_SCOPE,EFFECT_AUTHORITY,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id
        ? { sourceReview:upstream.inputForCase(id),effectAuthority:EFFECT_AUTHORITY } : null;
    const validateSourceInput = (input) => {
        if (!same(input,inputForCase())) return freeze({ valid:false,issues:['exact-source-recipient-review-and-independent-effect-authority-required'] });
        const reviewed = upstream.validateSourceInput(input.sourceReview),issues = [...reviewed.issues];
        const a = input.effectAuthority,r = input.sourceReview.effectScopeReview;
        if (a.sourceCaseId !== r.sourceCaseId || a.chartKey !== r.chartKey || a.sourcePathId !== r.sourcePathId
            || a.identityAuthorityId !== r.identityAuthorityId || a.realizationAuthorityId !== r.realizationAuthorityId
            || a.sourceActorKey !== r.sourceActorKey || a.targetActorKey !== r.targetActorKey || a.functionType !== r.functionType
            || a.priorEffectScopeReviewId !== r.id || a.relationType !== semantics.RELATION_TYPE
            || !same(a.effectScope,EFFECT_SCOPE) || a.effectScope.semanticContractId !== semantics.CONTRACT.id
            || !SOURCE_CASE.sourceText.includes(a.outcomeSpan) || !SOURCE_CASE.sourceText.includes(a.attributionContextSpan)) {
            issues.push('independent-exact-source-aspect-attribution-required');
        }
        return freeze({ valid:!issues.length,issues });
    };
    // R5 re-runs this source validator; a caller-provided R28 result, identity or membership hint is insufficient.
    const validateEffectInput = (input,context = {}) => {
        const sourceValidation = validateSourceInput(input),chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const base = { valid:false,sourceValidation,chartKey,record:null,identityResult:null,recipientReview:null };
        const result = (status,issues = [],extra = {}) => freeze({ ...base,status,issues,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== SOURCE_CASE.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-source-recipient-seal-damage-case']);
        const recipientReview = upstream.evaluateSource(input.sourceReview,context);
        if (recipientReview.status !== upstream.STATES.RESOLVED) return result(STATES.UNRESOLVED,['actual-r28-recipient-consumption-required',...recipientReview.blockerReasons]);
        const p = recipientReview.path;
        if (!p.relationRealized || p.execution.executionState !== 'realized-relation-currently-unmapped'
            || p.review.sourcePathId !== EFFECT_AUTHORITY.sourcePathId || p.execution.targetEndpoint.actorKey !== EFFECT_SCOPE.recipientActorKey) {
            return result(STATES.UNRESOLVED,['independent-upstream-identity-realization-and-recipient-required']);
        }
        const identityResult = { normalizedInput:p.normalizedInput,targetResolution:p.targetResolution,
            inventoryValidation:recipientReview.inventoryValidation };
        return result(STATES.RESOLVED,[],{ valid:true,identityResult,recipientReview,record:{ id:'CF-RSDC-RECORD-01',
            sourceCaseId:SOURCE_CASE.id,sourceAnnotationId:p.review.annotationId,chartKey,
            identityAuthorityId:EFFECT_AUTHORITY.identityAuthorityId,realizationAuthorityId:EFFECT_AUTHORITY.realizationAuthorityId,
            effectAuthorityId:EFFECT_AUTHORITY.id,relationRecordId:`${chartKey}::${EFFECT_AUTHORITY.sourcePathId}`,
            sourceActorKey:EFFECT_AUTHORITY.sourceActorKey,targetActorKey:EFFECT_AUTHORITY.targetActorKey,
            functionType:EFFECT_AUTHORITY.functionType,relationType:EFFECT_AUTHORITY.relationType,effectScope:copy(EFFECT_SCOPE),
            realizationState:p.sourceAssertedRealizationState,executionAuthority:'exact-source-case-actor-pair-outcome',
            sourceRegistryEvidenceIds:[...p.review.sourceEvidenceIds,EFFECT_AUTHORITY.priorEffectScopeReviewId,EFFECT_AUTHORITY.id,semantics.CONTRACT.id],
            sourceWording:SOURCE_CASE.sourceText,sourceOutcomeTerms:[EFFECT_AUTHORITY.outcomeSpan],sourceProvenance:copy(SOURCE_CASE),
            reviewedEffectBasis:EFFECT_AUTHORITY.reviewedBasis,relationEffectState:'realized-relation-effect-in-source-context' } });
    };
    const evaluateEffect = (input,context = {}) => {
        const validation = validateEffectInput(input,context);
        const base = { status:validation.status,validation,normalizedAuthorization:null,executionInput:null,execution:null,
            relationRealizationResolved:false,effectAuthorizationResolved:false,executionAuthorized:false,
            currentExactPathEffectGapResolved:false,upstreamAuditSnapshotsRewritten:false,
            relationEffects:[],memberEdges:[],membershipMutation:null,targetRemovedFromInventory:false,
            targetGenericIneffectiveState:null,allHiddenRolesDamaged:false,supportLoss:null,numericScore:null,relativeDominance:null };
        if (!validation.valid) return freeze(base);
        const normalizedAuthorization = normalizer.normalizeExactRecipientSealDamagePair(input,context);
        const executionInput = normalizer.toExecutionInput(normalizedAuthorization);
        const result = executionInput ? execution.executeRelationEffect(executionInput) : null;
        const realized = result?.executionState === 'realized-generic-relation-effect' && result.effectType === EFFECT_AUTHORITY.relationType
            && same(result.effectScope,EFFECT_SCOPE);
        return freeze({ ...base,status:realized ? STATES.RESOLVED : STATES.UNRESOLVED,normalizedAuthorization,executionInput,execution:result,
            relationRealizationResolved:true,effectAuthorizationResolved:normalizedAuthorization.normalizationState === normalizer.NORMALIZATION_STATES.RESOLVED,
            executionAuthorized:realized,currentExactPathEffectGapResolved:realized,relationEffects:realized ? [result] : [] });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const sourceValidation = validateSourceInput(inputForCase());
        const result = evaluateEffect(inputForCase(),{ chartKey:chart.buildStructuredChartKey(semanticModel,synthesis) || null,
            inventory:synthesis.contextualForcePartyMembershipInventory });
        return freeze({ sourceValidation,result,finiteSourceEffectCoverageComplete:sourceValidation.valid,reusedCompleteSourceCaseCount:1,
            newCompleteSourceCaseCount:0,newEffectAuthorityCount:1,resolvedRuntimeEffectCount:result.relationEffects.length,
            genericEffectTypeMappingDefined:false,genericDamageMappingDefined:false,broaderSourceCoverageComplete:false,
            memberEdges:[],membershipMutation:null,numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceRecipientSealDamageCalibrationProfile = freeze({ installed:true,VERSION,RULE_ID,STATES,CONTRACT,
        inputForCase,validateSourceInput,validateEffectInput,evaluateEffect,buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
