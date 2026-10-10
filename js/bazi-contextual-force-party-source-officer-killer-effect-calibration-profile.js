(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceOfficerKillerEffectCalibrationProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceOfficerKillerEffectCalibrationContract;
    const identity = GuiJia.baziContextualForcePartySourceInstanceTargetCalibrationProfile;
    const identityContract = GuiJia.baziContextualForcePartySourceInstanceTargetCalibrationContract;
    const normalizer = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
    const execution = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource;
    const core = GuiJia.baziCore;
    if (!api || !identity || !identityContract || !normalizer || !execution || !realization || !core) return;
    const { VERSION,RULE_ID,STATES,REALIZATION_AUTHORITY,EFFECT_AUTHORITY,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        const keys = Object.keys(b);
        return Object.keys(a).length === keys.length && keys.every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = identityContract.SOURCE_CASE.id) => id === identityContract.SOURCE_CASE.id
        ? { identityInput:identity.inputForCase(),realizationAuthority:REALIZATION_AUTHORITY,effectAuthority:EFFECT_AUTHORITY } : {};
    const validateSourceInput = (input) => {
        if (!input || typeof input !== 'object' || Array.isArray(input) || !same(input,inputForCase())) {
            return freeze({ valid:false,issues:['exact-registered-independent-identity-realization-effect-authorities-required'] });
        }
        const sourceValidation = identity.validateSourceInput(input.identityInput);
        const text = input.identityInput.sourceCase.sourceText;
        const issues = [...sourceValidation.issues];
        if (![REALIZATION_AUTHORITY.assertionSpan,REALIZATION_AUTHORITY.contextSpan,EFFECT_AUTHORITY.outcomeSpan]
            .every((s) => text.includes(s))) issues.push('reviewed-realization-effect-spans-missing');
        const gans = input.identityInput.sourceCase.gans;
        if (core.getWuXing(gans[0]) !== core.getWuXing(gans[3])) issues.push('registered-peer-relation-shape-mismatch');
        return freeze({ valid:!issues.length,issues });
    };
    // R5 calls this validator again at normalization time; no caller-supplied valid flag is consumed.
    const validateEffectInput = (input,context = {}) => {
        const sourceValidation = validateSourceInput(input);
        if (!sourceValidation.valid) return freeze({ valid:false,status:STATES.INVALID,issues:sourceValidation.issues,record:null,identityResult:null });
        const target = identity.evaluateInstance(input.identityInput,context);
        if (target.status !== identity.STATES.RESOLVED) return freeze({ valid:false,
            status:target.status === identity.STATES.NOT_APPLICABLE ? STATES.NOT_APPLICABLE : STATES.UNRESOLVED,
            issues:target.blockerReasons,record:null,identityResult:target });
        return freeze({ valid:true,status:STATES.RESOLVED,issues:[],identityResult:target,record:{
            id:'CF-SOKEC-RECORD-01',sourceCaseId:REALIZATION_AUTHORITY.sourceCaseId,
            sourceAnnotationId:REALIZATION_AUTHORITY.annotationId,identityAuthorityId:REALIZATION_AUTHORITY.identityAuthorityId,
            realizationAuthorityId:REALIZATION_AUTHORITY.id,effectAuthorityId:EFFECT_AUTHORITY.id,
            relationRecordId:target.binding.instanceId,chartKey:target.chartKey,
            sourceActorKey:target.binding.sourceEndpoint.actorKey,targetActorKey:target.binding.targetEndpoint.actorKey,
            functionType:REALIZATION_AUTHORITY.functionType,relationType:EFFECT_AUTHORITY.relationType,
            realizationState:REALIZATION_AUTHORITY.realizationState,
            executionAuthority:'exact-source-case-actor-pair-outcome',
            sourceRegistryEvidenceIds:[REALIZATION_AUTHORITY.sourceCaseId,REALIZATION_AUTHORITY.annotationId,
                REALIZATION_AUTHORITY.identityAuthorityId,REALIZATION_AUTHORITY.id,EFFECT_AUTHORITY.id],
            sourceWording:identityContract.SOURCE_CASE.sourceText,sourceOutcomeTerms:[EFFECT_AUTHORITY.outcomeSpan],
            sourceProvenance:copy(identityContract.SOURCE_CASE),reviewedEffectBasis:EFFECT_AUTHORITY.reviewedBasis,
            relationEffectState:'realized-relation-effect-in-source-context'
        } });
    };
    const evaluateEffect = (input,context = {}) => {
        const validation = validateEffectInput(input,context);
        const base = { status:validation.status,validation,normalizedAuthorization:null,executionInput:null,execution:null,
            relationRealizationResolved:false,effectAuthorizationResolved:false,executionAuthorized:false,
            relationEffects:[],memberEdges:[],runtimeWinnerPathId:null,numericScore:null,relativeDominance:null };
        if (!validation.valid) return freeze(base);
        const normalizedAuthorization = normalizer.normalizeExactActorPair(input,context);
        const executionInput = normalizer.toExecutionInput(normalizedAuthorization);
        const result = executionInput ? execution.executeRelationEffect(executionInput) : null;
        const realized = result?.executionState === 'realized-generic-relation-effect' && result.effectType === EFFECT_AUTHORITY.relationType;
        return freeze({ ...base,status:realized ? STATES.RESOLVED : STATES.UNRESOLVED,
            normalizedAuthorization,executionInput,execution:result,
            relationRealizationResolved:true,effectAuthorizationResolved:normalizedAuthorization.normalizationState === normalizer.NORMALIZATION_STATES.RESOLVED,
            executionAuthorized:realized,relationEffects:realized ? [result] : [] });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const sourceValidation = validateSourceInput(inputForCase());
        const result = evaluateEffect(inputForCase(),{
            chartKey:realization.buildStructuredChartKey(semanticModel,synthesis) || null,
            inventory:synthesis.contextualForcePartyMembershipInventory
        });
        return freeze({ status:'source-officer-killer-effect-calibration-evaluated',sourceValidation,result,
            finiteSourceEffectCoverageComplete:sourceValidation.valid,sourceCaseCount:1,positiveSourceCaseCount:1,negativeSourceCaseCount:0,
            positiveEffectCalibrationIntroduced:true,resolvedRuntimeEffectCount:result.relationEffects.length,
            genericEffectTypeAuthorizationResolverDefined:false,genericPeerEffectMappingDefined:false,
            broaderSourceCoverageComplete:false,transferredR11TargetCount:0,memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceOfficerKillerEffectCalibrationProfile = freeze({
        installed:true,VERSION,RULE_ID,STATES,CONTRACT,inputForCase,validateSourceInput,validateEffectInput,evaluateEffect,buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
