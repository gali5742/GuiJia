(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceOfficerKillerNonrealizationProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceOfficerKillerNonrealizationContract;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const normalizedContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const execution = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const prior = GuiJia.baziContextualForcePartySourceOfficerKillerEffectCalibrationProfile;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource;
    const core = GuiJia.baziCore;
    if (!api || !normalizer || !normalizedContract || !resolver || !execution || !prior || !realization || !core) return;
    const { VERSION,RULE_ID,STATES,SOURCE_CASE,COMPARISON_CASE,ANNOTATION,IDENTITY_AUTHORITY,REALIZATION_AUTHORITY,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        const keys = Object.keys(b);
        return Object.keys(a).length === keys.length && keys.every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id ? {
        sourceCase:SOURCE_CASE,annotation:ANNOTATION,identityAuthority:IDENTITY_AUTHORITY,realizationAuthority:REALIZATION_AUTHORITY
    } : {};
    const validateSourceInput = (input) => {
        if (!input || typeof input !== 'object' || Array.isArray(input) || !same(input,inputForCase())) {
            return freeze({ valid:false,issues:['exact-registered-nonrealization-source-annotation-identity-authority-required'] });
        }
        const issues = [],a = input.identityAuthority,s = input.sourceCase,r = input.realizationAuthority;
        if (![a.sourceNamingSpan,a.sourceCombinationSpan,a.targetNamingSpan,r.assertionSpan,r.conditionSpan,r.excludedAlternateOutcomeSpan]
            .every((span) => s.sourceText.includes(span))) issues.push('reviewed-identity-nonrealization-spans-missing');
        if (s.chartKey !== s.gans.map((gan,index) => gan + s.zhis[index]).join('|')) issues.push('complete-source-chart-mismatch');
        if (core.shiShenMap[s.gans[2]][s.gans[0]] !== a.sourceRoleClass
            || core.shiShenMap[s.gans[2]][s.gans[3]] !== a.targetRoleClass) issues.push('registered-endpoint-role-mismatch');
        if (core.getWuXing(s.gans[0]) !== core.getWuXing(s.gans[3])) issues.push('registered-peer-shape-mismatch');
        if (s.zhis.some((zhi) => core.cangGanMap[zhi].some(([gan]) => gan === '壬'))) issues.push('reviewed-visible-target-scope-basis-invalid');
        return freeze({ valid:!issues.length,issues });
    };
    const validateInventory = (inventory) => {
        if (!inventory || !Array.isArray(inventory.actorProfiles) || !Array.isArray(inventory.evidenceRecords)
            || inventory.actorProfiles.some((p) => !p || typeof p !== 'object')
            || inventory.evidenceRecords.some((r) => !r || typeof r !== 'object')) {
            return freeze({ valid:false,issues:['actual-membership-inventory-required'] });
        }
        const issues = [];
        for (const [actorKey,role] of [[IDENTITY_AUTHORITY.sourceActorKey,'正官'],[IDENTITY_AUTHORITY.targetActorKey,'七杀']]) {
            if (inventory.actorProfiles.filter((p) => p.actorKey === actorKey).length !== 1) issues.push('unique-actual-inventory-endpoint-required');
            const roles = [...new Set(inventory.evidenceRecords.filter((r) => r.actorKey === actorKey).map((r) => r.tenGod))];
            if (roles.length !== 1 || roles[0] !== role) issues.push('actual-inventory-endpoint-role-mismatch');
        }
        return freeze({ valid:!issues.length,issues:[...new Set(issues)] });
    };
    const normalizedInputForBinding = (binding) => {
        const unit = normalizer.normalizeRelationUnit(SOURCE_CASE,ANNOTATION.relationUnits[0],[],[]);
        const record = {
            id:'CF-SOKNR-NORMALIZED-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,
            sourceId:SOURCE_CASE.sourceId,sourceText:SOURCE_CASE.sourceText,chartKey:SOURCE_CASE.chartKey,
            sourceContextType:'chart-case',sourcePredicateType:'relation-event',annotationDisposition:ANNOTATION.annotationDisposition,
            contextSpans:copy(normalizer.normalizeContextSpans(ANNOTATION)),configurationSpans:[],
            relationUnits:[{ ...copy(unit),identityProvenance:{
                state:normalizedContract.IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR,endpointType:'actor',
                actorKey:binding.targetActorKey,groupId:null,memberActorKeys:[],cardinality:1,scope:'visible-stem',
                targetRoleClass:'七杀',antecedentSpan:null,sourceCaseScoped:true,
                sourceActorKeys:[binding.sourceActorKey],targetCandidateKeys:[binding.targetActorKey],identityAuthorityId:IDENTITY_AUTHORITY.id,
                targetNamingSpan:IDENTITY_AUTHORITY.targetNamingSpan
            } }],
            sourceEvidenceIds:[SOURCE_CASE.id,ANNOTATION.id,IDENTITY_AUTHORITY.id],provenance:copy(SOURCE_CASE),
            relationEffect:null,membershipMutation:null,relativeDominance:null,numericScore:null,scalarForce:null
        };
        const validation = normalizedContract.validateNormalizedRecord(record);
        return freeze({ ...record,validation,normalizationState:validation.valid
            ? normalizedContract.NORMALIZATION_STATES.NORMALIZED : normalizedContract.NORMALIZATION_STATES.UNRESOLVED,
            blockerReasons:[...validation.errors] });
    };
    const evaluateNonrealization = (input,context = {}) => {
        const sourceValidation = validateSourceInput(input),chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const base = { sourceValidation,chartKey,sourceCaseId:null,binding:null,normalizedInput:null,targetResolution:null,
            executionInput:null,execution:null,relationRealizationResolved:false,realizationState:'unresolved-realization',
            effectAuthorizationResolved:false,positiveEffectExecutionAuthorized:false,relationEffects:[],memberEdges:[],
            transformedActorIdentity:null,alternateBladeEffect:null,reverseEffect:null,runtimeWinnerPathId:null,numericScore:null,relativeDominance:null };
        const result = (status,blockerReasons = [],extra = {}) => freeze({ ...base,status,blockerReasons,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== SOURCE_CASE.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-negative-source-case']);
        const inventoryValidation = validateInventory(context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const binding = { ...copy(IDENTITY_AUTHORITY),sourceCaseScoped:true,instanceId:`${chartKey}::${IDENTITY_AUTHORITY.sourcePathId}`,
            sourceEndpoint:{ type:'actor',actorKey:IDENTITY_AUTHORITY.sourceActorKey,scope:'visible-stem',cardinality:1 },
            targetEndpoint:{ type:'actor',actorKey:IDENTITY_AUTHORITY.targetActorKey,scope:'visible-stem',cardinality:1 } };
        const normalizedInput = normalizedInputForBinding(binding),targetResolution = resolver.resolveRecord(normalizedInput);
        if (!normalizedInput.validation.valid || targetResolution.unitResolutions[0]?.resolutionState !== resolver.RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR) {
            return result(STATES.UNRESOLVED,['generic-instance-target-resolution-failed']);
        }
        // Nonrealization is decided before effect-type authorization by the existing R4 kernel.
        // No positive R5 license is fabricated solely to calibrate this negative relation.
        const executionInput = {
            id:`CF-SOKNR-EXEC:${binding.instanceId}`,sourceEndpoint:binding.sourceEndpoint,targetResolution:targetResolution.unitResolutions[0],
            relationIdentity:{ id:binding.instanceId,functionType:REALIZATION_AUTHORITY.functionType,directed:true },
            realizationState:REALIZATION_AUTHORITY.realizationState,
            realizationProvenance:{ sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,identityAuthorityId:IDENTITY_AUTHORITY.id,
                realizationAuthorityId:REALIZATION_AUTHORITY.id,sourceProvenance:copy(SOURCE_CASE),reviewedBasis:REALIZATION_AUTHORITY.reviewedBasis,
                assertionSpan:REALIZATION_AUTHORITY.assertionSpan,conditionSpan:REALIZATION_AUTHORITY.conditionSpan },
            authorization:{ state:'effect-authorization-not-applicable',sourceBacked:false,relationTypes:[],authorityIds:[],sourceEvidenceIds:[] }
        };
        const executed = execution.executeRelationEffect(executionInput);
        const status = executed.executionState === 'not-realized-generic-relation-effect' ? STATES.RESOLVED : STATES.UNRESOLVED;
        return result(status,status === STATES.RESOLVED ? [] : ['generic-nonrealization-execution-failed'],{
            sourceCaseId:SOURCE_CASE.id,inventoryValidation,binding,normalizedInput,targetResolution,executionInput,execution:executed,
            relationRealizationResolved:true,realizationState:REALIZATION_AUTHORITY.realizationState,
            excludedAlternateOutcome:{ span:REALIZATION_AUTHORITY.excludedAlternateOutcomeSpan,
                disposition:REALIZATION_AUTHORITY.excludedAlternateOutcomeDisposition,executionAuthorized:false }
        });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const sourceValidation = validateSourceInput(inputForCase());
        const positiveSourceValidation = prior.validateSourceInput(prior.inputForCase());
        const result = evaluateNonrealization(inputForCase(),{
            chartKey:realization.buildStructuredChartKey(semanticModel,synthesis) || null,inventory:synthesis.contextualForcePartyMembershipInventory
        });
        return freeze({ status:'source-officer-killer-nonrealization-evaluated',sourceValidation,positiveSourceValidation,result,
            finiteNegativeSourceCoverageComplete:sourceValidation.valid,negativeSourceCaseCount:1,positiveEffectSourceCaseCount:0,
            contextualComparisonCaseCount:1,comparisonCase:copy(COMPARISON_CASE),
            resolvedRuntimeNonrealizationCount:result.status === STATES.RESOLVED ? 1 : 0,
            independentSourceOutcomeCoverage:{ realizedSourceCaseIds:positiveSourceValidation.valid ? ['CF-SITC-CASE-01'] : [],
                notRealizedSourceCaseIds:sourceValidation.valid ? [SOURCE_CASE.id] : [],comparisonOnlySourceCaseIds:[COMPARISON_CASE.id],
                genericCombinationRuleDefined:false },
            genericPeerEffectMappingDefined:false,genericCombinationResolverDefined:false,broaderSourceCoverageComplete:false,
            transferredR11TargetCount:0,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceOfficerKillerNonrealizationProfile = freeze({
        installed:true,VERSION,RULE_ID,STATES,CONTRACT,inputForCase,validateSourceInput,evaluateNonrealization,buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
