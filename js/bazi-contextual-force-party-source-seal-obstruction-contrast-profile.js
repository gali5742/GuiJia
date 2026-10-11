(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceSealObstructionContrastProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceSealObstructionContrastContract;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const normalizedContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const kernel = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const kernelContract = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract;
    const chart = GuiJia.baziVisibleStemFunctionRealizationSource,core = GuiJia.baziCore;
    if (!api || !normalizer || !normalizedContract || !resolver || !kernel || !kernelContract || !chart || !core) return;
    const { VERSION,RULE_ID,STATES,SOURCE_CASE,RELATION_REVIEWS,CONFIGURATION_REVIEW,DEFERRED_CONTEXT,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id ? { sourceCase:SOURCE_CASE,relationReviews:RELATION_REVIEWS,
        configurationReview:CONFIGURATION_REVIEW,deferredContext:DEFERRED_CONTEXT } : null;
    const validateSourceInput = (input) => {
        if (!same(input,inputForCase())) return freeze({ valid:false,issues:['exact-registered-seal-obstruction-source-and-independent-reviews-required'] });
        const s = input.sourceCase,issues = [];
        if (s.chartKey !== s.gans.map((gan,i) => gan + s.zhis[i]).join('|')) issues.push('complete-source-chart-mismatch');
        if (input.relationReviews.some((r) => !s.sourceText.includes(r.relationClauseSpan))) issues.push('reviewed-clause-span-missing');
        if (s.gans[2] !== '辛' || core.shiShenMap[s.gans[2]][s.gans[3]] !== '七杀'
            || core.shiShenMap[s.gans[2]][s.gans[0]] !== '正印' || s.zhis.filter((z) => z === '卯').length !== 1
            || s.zhis[2] !== '丑' || core.cangGanMap[s.zhis[2]].map(([gan]) => core.shiShenMap[s.gans[2]][gan]).join('|') !== '偏印|食神|比肩') {
            issues.push('exact-visible-roles-named-branches-and-mixed-target-roles-mismatch');
        }
        if (!s.sourceText.includes(input.configurationReview.sourceSpan)
            || !input.deferredContext.sourceSpans.every((span) => s.sourceText.includes(span))) issues.push('natal-configuration-or-deferred-context-span-missing');
        return freeze({ valid:!issues.length,issues });
    };
    const validateInventory = (input,inventory) => {
        if (!inventory || !Array.isArray(inventory.actorProfiles) || !Array.isArray(inventory.evidenceRecords)
            || Array.from(inventory.actorProfiles).some((p) => !p || typeof p !== 'object')
            || Array.from(inventory.evidenceRecords).some((p) => !p || typeof p !== 'object')) return freeze({ valid:false,issues:['actual-endpoint-and-candidate-inventory-required'] });
        const s = input.sourceCase,issues = [],endpoints = input.relationReviews.flatMap((r) => [r.sourceEndpoint,r.targetEndpoint]);
        for (const e of endpoints) {
            if (inventory.actorProfiles.filter((p) => p.actorKey === e.actorKey).length !== 1) issues.push('unique-actual-endpoint-or-candidate-required');
            const records = inventory.evidenceRecords.filter((r) => r.actorKey === e.actorKey),i = Number(e.actorKey.split(':')[1]);
            if (!records.length) issues.push('actual-endpoint-or-candidate-evidence-required');
            const visible = e.scope === 'visible-stem',character = visible ? s.gans[i] : s.zhis[i];
            if (records.some((r) => r.sourceScope !== (visible ? 'surface-stem' : 'surface-branch')
                || r.position !== ['year','month','day','hour'][i] || (visible ? r.gan !== character || r.tenGod !== e.roleClass
                    || (r.pillarIndex !== null && r.pillarIndex !== i) : r.zhi !== character || r.pillarIndex !== i)
                || r.wuxing !== core.getWuXing(character))) issues.push('actual-scope-position-role-or-element-mismatch');
        }
        return freeze({ valid:!issues.length,issues:[...new Set(issues)] });
    };
    const normalizedRecord = (s,review,configuration = false) => {
        const unit = configuration ? null : normalizer.normalizeRelationUnit(s,{
            id:review.unitId,relationClauseSpan:review.relationClauseSpan,sourceRoleSpan:review.sourceSpan,
            sourceRoleClass:review.sourceEndpoint.roleClass,predicateSpan:review.predicateSpan,predicateType:'relation-event',relationSemanticHint:null,
            target:{ span:review.targetSpan,mentionMode:'explicit-source-mention',antecedentSpan:null,roleClass:review.targetRoleClass,chartBindingRequired:true },outcomeSpans:[]
        },[],[]);
        const target = review.targetEndpoint,identity = configuration ? null : {
            state:normalizedContract.IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR,endpointType:'actor',actorKey:target.actorKey,scope:target.scope,
            cardinality:1,groupId:null,memberActorKeys:[],sourceCaseScoped:true,targetRoleClass:review.targetRoleClass,antecedentSpan:null,
            sourceActorKeys:[review.sourceEndpoint.actorKey],targetCandidateKeys:[target.actorKey],identityAuthorityId:review.identityAuthorityId
        };
        const record = { id:configuration ? 'CF-SSOC-CONFIG-NORMALIZED-01' : `${review.id}-NORMALIZED`,sourceCaseId:s.id,
            annotationId:configuration ? review.id : review.annotationId,sourceId:s.sourceId,sourceText:s.sourceText,chartKey:s.chartKey,
            sourceContextType:'chart-case',sourcePredicateType:configuration ? 'configuration-state' : 'relation-event',
            annotationDisposition:configuration ? 'configuration-state-only' : 'relation-target-present',contextSpans:[],
            configurationSpans:configuration ? [{ role:'source-asserted-natal-noncommunication',text:review.sourceSpan }] : [],
            relationUnits:configuration ? [] : [{ ...copy(unit),identityProvenance:identity }],
            sourceEvidenceIds:configuration ? [s.id,review.id] : [...review.sourceEvidenceIds],provenance:copy(s),
            relationEffect:null,membershipMutation:null,relativeDominance:null,numericScore:null,scalarForce:null };
        const validation = normalizedContract.validateNormalizedRecord(record);
        return freeze({ ...record,validation,normalizationState:validation.valid ? normalizedContract.NORMALIZATION_STATES.NORMALIZED
            : normalizedContract.NORMALIZATION_STATES.UNRESOLVED,blockerReasons:[...validation.errors] });
    };
    const evaluateSource = (input,context = {}) => {
        const sourceValidation = validateSourceInput(input),chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const base = { sourceValidation,chartKey,paths:[],configuration:null,deferredContext:null,executionAuthorized:false,relationEffects:[],memberEdges:[],
            reverseEffect:null,numericScore:null,relativeDominance:null,transformedResultMaterializationAuthorized:false };
        const result = (status,blockerReasons = [],extra = {}) => freeze({ ...base,status,blockerReasons,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== input.sourceCase.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-reviewed-seal-obstruction-case']);
        const inventoryValidation = validateInventory(input,context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const paths = input.relationReviews.map((review) => {
            const normalizedInput = normalizedRecord(input.sourceCase,review),targetResolution = resolver.resolveRecord(normalizedInput);
            const instanceResolved = normalizedInput.validation.valid && targetResolution.unitResolutions.length === 1
                && targetResolution.unitResolutions[0].resolutionState === resolver.RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR
                && targetResolution.unitResolutions[0].targetReference.actorKey === review.targetEndpoint.actorKey;
            const executionInput = { id:`${review.sourcePathId}-EXEC`,sourceEndpoint:copy(review.sourceEndpoint),
                targetResolution:copy(targetResolution.unitResolutions[0] || targetResolution),relationIdentity:copy(review.relationIdentity),
                realizationState:instanceResolved ? review.realizationAuthority.state : kernelContract.REALIZATION_STATES.UNRESOLVED,
                realizationProvenance:copy(review.realizationAuthority),
                authorization:{ state:!instanceResolved ? kernelContract.AUTHORIZATION_STATES.UNRESOLVED
                    : review.realizationAuthority.state === kernelContract.REALIZATION_STATES.NOT_REALIZED
                    ? kernelContract.AUTHORIZATION_STATES.NOT_APPLICABLE : kernelContract.AUTHORIZATION_STATES.UNMAPPED,
                    sourceBacked:false,relationTypes:[],authorityIds:[],sourceEvidenceIds:[...review.sourceEvidenceIds] } };
            return { review:copy(review),normalizedInput,targetResolution,executionInput,execution:kernel.executeRelationEffect(executionInput),
                sourceAssertedRealizationState:review.realizationAuthority.state,relationRealizationResolved:instanceResolved,
                relationRealized:instanceResolved ? review.realizationAuthority.state === kernelContract.REALIZATION_STATES.REALIZED : null,
                targetIdentityResolved:review.targetEndpoint !== null,effectTypeMapped:false,executionAuthorized:false };
        });
        let configuration = null;
        if (input.configurationReview) {
            const review = input.configurationReview,normalizedInput = normalizedRecord(input.sourceCase,review,true),targetResolution = resolver.resolveRecord(normalizedInput);
            const executionInput = { id:'CF-SSOC-CONFIG-EXEC-01',targetResolution:copy(targetResolution),realizationState:review.state,
                authorization:{ state:kernelContract.AUTHORIZATION_STATES.NOT_APPLICABLE,sourceBacked:false,relationTypes:[],authorityIds:[],sourceEvidenceIds:[review.id] } };
            configuration = { review:copy(review),normalizedInput,targetResolution,executionInput,execution:kernel.executeRelationEffect(executionInput) };
        }
        const expectedStates = [kernelContract.EXECUTION_STATES.NOT_REALIZED,kernelContract.EXECUTION_STATES.REALIZED_UNMAPPED];
        if (paths.length !== expectedStates.length || paths.some((p,i) => p.execution.executionState !== expectedStates[i])
            || (!configuration.normalizedInput.validation.valid || configuration.targetResolution.semanticLevel !== 'configuration'
                || configuration.execution.executionState !== kernelContract.EXECUTION_STATES.NOT_APPLICABLE)) {
            return result(STATES.UNRESOLVED,['actual-normalization-r3-r4-consumption-failed'],{ inventoryValidation });
        }
        return result(STATES.RESOLVED,['branch-damage-effect-type-currently-unmapped','whole-configuration-does-not-bind-branch-mediation-path'],
            { inventoryValidation,paths,configuration,deferredContext:copy(DEFERRED_CONTEXT) });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const result = evaluateSource(inputForCase(),{ chartKey:chart.buildStructuredChartKey(semanticModel,synthesis) || null,
            inventory:synthesis.contextualForcePartyMembershipInventory });
        const paths = result.paths;
        return freeze({ result,finiteSourceReviewComplete:validateSourceInput(inputForCase()).valid,reusedCompleteSourceCaseCount:0,
            newCompleteSourceCaseCount:1,reviewedRelationCount:2,reviewedConfigurationCount:1,
            resolvedRuntimeNonrealizationCount:paths.filter((p) => p.execution.executionState === kernelContract.EXECUTION_STATES.NOT_REALIZED).length,
            realizedUnmappedRuntimePathCount:paths.filter((p) => p.execution.executionState === kernelContract.EXECUTION_STATES.REALIZED_UNMAPPED).length,
            nonActionableRuntimeConfigurationCount:result.configuration?.execution.executionState === kernelContract.EXECUTION_STATES.NOT_APPLICABLE ? 1 : 0,
            branchMediationNegativeCalibrationEstablished:false,
            newEffectAuthorityCount:0,positiveEffectCount:0,broaderSourceCoverageComplete:false,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceSealObstructionContrastProfile = freeze({ installed:true,VERSION,RULE_ID,STATES,CONTRACT,
        inputForCase,validateSourceInput,evaluateSource,buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
