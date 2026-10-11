(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchMediationCalibrationProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceBranchMediationCalibrationContract;
    const targetNormalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const targetContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const normalizer = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
    const execution = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource,core = GuiJia.baziCore;
    if (!api || !targetNormalizer || !targetContract || !resolver || !normalizer || !execution || !realization || !core) return;
    const { VERSION,RULE_ID,STATES,SOURCE_CASE,ANNOTATION,IDENTITY_AUTHORITY,
        REALIZATION_AUTHORITY,EFFECT_AUTHORITY,EXCLUDED_CONTEXT,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id
        ? { sourceCase:SOURCE_CASE,annotation:ANNOTATION,identityAuthority:IDENTITY_AUTHORITY,
            realizationAuthority:REALIZATION_AUTHORITY,effectAuthority:EFFECT_AUTHORITY,excludedContext:EXCLUDED_CONTEXT } : {};
    const validateSourceInput = (input) => {
        if (!same(input,inputForCase())) return freeze({ valid:false,issues:['exact-registered-independent-branch-identity-realization-effect-authorities-required'] });
        const s = input.sourceCase,issues = [];
        if (s.chartKey !== s.gans.map((gan,i) => gan + s.zhis[i]).join('|') || s.gans[2] !== '丁'
            || s.zhis.filter((zhi) => core.getWuXing(zhi) === '水').length !== 1
            || s.zhis.filter((zhi) => core.getWuXing(zhi) === '木').length !== 1
            || core.cangGanMap[s.zhis[1]].length !== 1 || core.cangGanMap[s.zhis[1]][0][0] !== '癸'
            || core.cangGanMap[s.zhis[2]].length !== 1 || core.cangGanMap[s.zhis[2]][0][0] !== '乙'
            || core.shiShenMap[s.gans[2]]['癸'] !== IDENTITY_AUTHORITY.sourceRoleClass
            || core.shiShenMap[s.gans[2]]['乙'] !== IDENTITY_AUTHORITY.targetRoleClass) issues.push('reviewed-unique-branch-scope-killer-seal-identity-mismatch');
        if (![IDENTITY_AUTHORITY.explicitBranchScopeSpan,REALIZATION_AUTHORITY.assertionSpan,REALIZATION_AUTHORITY.contextSpan,
            EFFECT_AUTHORITY.outcomeSpan,EFFECT_AUTHORITY.outcomeContextSpan,...EXCLUDED_CONTEXT.sourceSpans].every((span) => s.sourceText.includes(span))) {
            issues.push('reviewed-independent-source-spans-missing');
        }
        return freeze({ valid:!issues.length,issues });
    };
    const validateInventory = (inventory) => {
        const issues = [];
        if (!inventory || !Array.isArray(inventory.actorProfiles) || !Array.isArray(inventory.evidenceRecords)
            || Array.from(inventory.actorProfiles).some((p) => !p || typeof p !== 'object')
            || Array.from(inventory.evidenceRecords).some((p) => !p || typeof p !== 'object')) {
            return freeze({ valid:false,issues:['actual-surface-branch-inventory-required'] });
        }
        for (const actorKey of [IDENTITY_AUTHORITY.sourceActorKey,IDENTITY_AUTHORITY.targetActorKey]) {
            const pillarIndex = Number(actorKey.split(':')[1]),zhi = SOURCE_CASE.zhis[pillarIndex];
            if (inventory.actorProfiles.filter((p) => p.actorKey === actorKey).length !== 1) issues.push('unique-actual-branch-identity-required');
            const records = inventory.evidenceRecords.filter((r) => r.actorKey === actorKey);
            if (!records.length || records.some((r) => r.sourceScope !== 'surface-branch' || r.pillarIndex !== pillarIndex
                || r.position !== ['year','month','day','hour'][pillarIndex] || r.zhi !== zhi || r.wuxing !== core.getWuXing(zhi))) {
                issues.push('actual-branch-scope-position-element-evidence-mismatch');
            }
        }
        return freeze({ valid:!issues.length,issues:[...new Set(issues)] });
    };
    const normalizedTarget = () => {
        const a = IDENTITY_AUTHORITY,u = ANNOTATION.relationUnits[0];
        const unit = { ...copy(targetNormalizer.normalizeRelationUnit(SOURCE_CASE,u,[],[])),
            identityProvenance:{ state:targetContract.IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR,endpointType:'actor',
                actorKey:a.targetActorKey,groupId:null,memberActorKeys:[],cardinality:1,scope:a.targetScope,targetRoleClass:a.targetRoleClass,
                antecedentSpan:null,sourceCaseScoped:true,sourceActorKeys:[a.sourceActorKey],targetCandidateKeys:[a.targetActorKey],identityAuthorityId:a.id } };
        const record = { id:'CF-SBMC-NORMALIZED-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,sourceId:SOURCE_CASE.sourceId,
            sourceText:SOURCE_CASE.sourceText,chartKey:SOURCE_CASE.chartKey,sourceContextType:'chart-case',sourcePredicateType:'relation-event',
            annotationDisposition:'relation-target-present',contextSpans:copy(targetNormalizer.normalizeContextSpans(ANNOTATION)),
            configurationSpans:[],relationUnits:[unit],sourceEvidenceIds:[SOURCE_CASE.id,ANNOTATION.id,a.id],provenance:copy(SOURCE_CASE),
            relationEffect:null,membershipMutation:null,relativeDominance:null,numericScore:null,scalarForce:null };
        const validation = targetContract.validateNormalizedRecord(record);
        return freeze({ ...record,validation,normalizationState:validation.valid ? targetContract.NORMALIZATION_STATES.NORMALIZED
            : targetContract.NORMALIZATION_STATES.UNRESOLVED,blockerReasons:[...validation.errors] });
    };
    // R5 revalidates the canonical source input, current chart, actual inventory and actual R3 result.
    const validateEffectInput = (input,context = {}) => {
        const sourceValidation = validateSourceInput(input),chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const base = { valid:false,sourceValidation,chartKey,record:null,identityResult:null };
        const result = (status,issues,extra = {}) => freeze({ ...base,status,issues,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== SOURCE_CASE.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-reviewed-branch-mediation-case']);
        const inventoryValidation = validateInventory(context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const normalizedInput = normalizedTarget(),targetResolution = resolver.resolveRecord(normalizedInput);
        const identityResult = { normalizedInput,targetResolution,inventoryValidation };
        const target = targetResolution.unitResolutions[0];
        if (!normalizedInput.validation.valid || targetResolution.unitResolutions.length !== 1
            || target?.resolutionState !== resolver.RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR
            || target?.targetReference?.actorKey !== IDENTITY_AUTHORITY.targetActorKey) {
            return result(STATES.UNRESOLVED,['actual-generic-single-branch-target-consumption-failed'],{ identityResult });
        }
        return result(STATES.RESOLVED,[],{ valid:true,identityResult,record:{
            id:'CF-SBMC-RECORD-01',sourceCaseId:SOURCE_CASE.id,sourceAnnotationId:ANNOTATION.id,
            identityAuthorityId:IDENTITY_AUTHORITY.id,realizationAuthorityId:REALIZATION_AUTHORITY.id,effectAuthorityId:EFFECT_AUTHORITY.id,
            relationRecordId:`${chartKey}::${IDENTITY_AUTHORITY.sourcePathId}`,chartKey,
            sourceActorKey:IDENTITY_AUTHORITY.sourceActorKey,targetActorKey:IDENTITY_AUTHORITY.targetActorKey,
            functionType:REALIZATION_AUTHORITY.functionType,relationType:EFFECT_AUTHORITY.relationType,
            realizationState:REALIZATION_AUTHORITY.realizationState,executionAuthority:'exact-source-case-actor-pair-outcome',
            sourceRegistryEvidenceIds:[SOURCE_CASE.id,ANNOTATION.id,IDENTITY_AUTHORITY.id,REALIZATION_AUTHORITY.id,EFFECT_AUTHORITY.id],
            sourceWording:SOURCE_CASE.sourceText,sourceOutcomeTerms:[EFFECT_AUTHORITY.outcomeSpan],sourceProvenance:copy(SOURCE_CASE),
            reviewedEffectBasis:EFFECT_AUTHORITY.reviewedBasis,relationEffectState:'realized-relation-effect-in-source-context'
        } });
    };
    const evaluateEffect = (input,context = {}) => {
        const validation = validateEffectInput(input,context);
        const base = { status:validation.status,validation,normalizedAuthorization:null,executionInput:null,execution:null,
            relationRealizationResolved:false,effectAuthorizationResolved:false,executionAuthorized:false,
            relationEffects:[],excludedContext:EXCLUDED_CONTEXT,memberEdges:[],membershipMutation:null,
            targetRemovedFromInventory:false,targetGenericIneffectiveState:null,runtimeWinnerPathId:null,numericScore:null,relativeDominance:null };
        if (!validation.valid) return freeze(base);
        const normalizedAuthorization = normalizer.normalizeExactBranchMediationPair(input,context);
        const executionInput = normalizer.toExecutionInput(normalizedAuthorization);
        const result = executionInput ? execution.executeRelationEffect(executionInput) : null;
        const realized = result?.executionState === 'realized-generic-relation-effect' && result.effectType === EFFECT_AUTHORITY.relationType;
        return freeze({ ...base,status:realized ? STATES.RESOLVED : STATES.UNRESOLVED,normalizedAuthorization,executionInput,execution:result,
            relationRealizationResolved:true,effectAuthorizationResolved:normalizedAuthorization.normalizationState === normalizer.NORMALIZATION_STATES.RESOLVED,
            executionAuthorized:realized,relationEffects:realized ? [result] : [] });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const sourceValidation = validateSourceInput(inputForCase());
        const chartKey = realization.buildStructuredChartKey(semanticModel,synthesis) || null;
        const result = evaluateEffect(inputForCase(),{ chartKey,inventory:synthesis.contextualForcePartyMembershipInventory });
        return freeze({ status:'source-branch-mediation-calibration-evaluated',sourceValidation,result,
            finiteSourceEffectCoverageComplete:sourceValidation.valid,sourceCaseCount:1,positiveSourceCaseCount:1,
            reusedCompleteSourceCaseCount:1,newCompleteSourceCaseCount:0,
            newEffectAuthorityCount:1,resolvedRuntimeEffectCount:result.relationEffects.length,
            genericEffectTypeAuthorizationResolverDefined:false,genericBranchMediationMappingDefined:false,
            broaderSourceCoverageComplete:false,transferredR23EffectCount:0,visibleAuthorityInherited:false,
            memberEdges:[],membershipMutation:null,numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceBranchMediationCalibrationProfile = freeze({ installed:true,VERSION,RULE_ID,STATES,CONTRACT,
        inputForCase,validateSourceInput,validateEffectInput,evaluateEffect,buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
