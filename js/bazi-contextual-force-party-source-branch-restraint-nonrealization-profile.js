(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchRestraintNonrealizationProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceBranchRestraintNonrealizationContract;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const normalizedContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const kernel = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const kernelContract = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract;
    const chart = GuiJia.baziVisibleStemFunctionRealizationSource,core = GuiJia.baziCore;
    if (!api || !normalizer || !normalizedContract || !resolver || !kernel || !kernelContract || !chart || !core) return;
    const { VERSION,RULE_ID,STATES,SOURCE_CASE,ANNOTATION,IDENTITY_AUTHORITY,CONTEXT_REVIEW,REALIZATION_AUTHORITY,EXCLUDED_CONTEXT,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id ? { sourceCase:SOURCE_CASE,annotation:ANNOTATION,
        identityAuthority:IDENTITY_AUTHORITY,contextReview:CONTEXT_REVIEW,realizationAuthority:REALIZATION_AUTHORITY,excludedContext:EXCLUDED_CONTEXT } : null;
    const validateSourceInput = (input) => {
        if (!same(input,inputForCase())) return freeze({ valid:false,issues:['exact-registered-independent-natal-branch-restraint-nonrealization-review-required'] });
        const s = input.sourceCase,issues = [];
        if (s.chartKey !== s.gans.map((gan,i) => gan + s.zhis[i]).join('|') || s.gans[2] !== '丁'
            || ![['水',1],['火',3],['木',2]].every(([element,index]) => core.getWuXing(s.zhis[index]) === element
                && s.zhis.filter((zhi) => core.getWuXing(zhi) === element).length === 1)
            || core.cangGanMap[s.zhis[3]].map(([gan]) => core.shiShenMap[s.gans[2]][gan]).join('|') !== '比肩|食神') {
            issues.push('reviewed-complete-chart-unique-water-fire-wood-and-mixed-target-roles-mismatch');
        }
        if (![IDENTITY_AUTHORITY.scopeSpan,REALIZATION_AUTHORITY.evidenceSpan,REALIZATION_AUTHORITY.negationSpan,EXCLUDED_CONTEXT.clashSpan]
            .every((span) => s.sourceText.includes(span))) issues.push('reviewed-source-scope-negation-or-clash-context-missing');
        return freeze({ valid:!issues.length,issues });
    };
    const validateInventory = (inventory) => {
        if (!inventory || !Array.isArray(inventory.actorProfiles) || !Array.isArray(inventory.evidenceRecords)
            || Array.from(inventory.actorProfiles).some((p) => !p || typeof p !== 'object')
            || Array.from(inventory.evidenceRecords).some((p) => !p || typeof p !== 'object')) {
            return freeze({ valid:false,issues:['actual-surface-branch-inventory-required'] });
        }
        const issues = [];
        for (const actorKey of [IDENTITY_AUTHORITY.sourceActorKey,IDENTITY_AUTHORITY.targetActorKey,CONTEXT_REVIEW.contextActorKey]) {
            const pillarIndex = Number(actorKey.split(':')[1]),zhi = SOURCE_CASE.zhis[pillarIndex];
            if (inventory.actorProfiles.filter((p) => p.actorKey === actorKey).length !== 1) issues.push('unique-actual-branch-endpoint-and-wood-context-required');
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
        const unit = { ...copy(normalizer.normalizeRelationUnit(SOURCE_CASE,u,[],[])),
            identityProvenance:{ state:normalizedContract.IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR,endpointType:'actor',
                actorKey:a.targetActorKey,groupId:null,memberActorKeys:[],cardinality:1,scope:a.endpointScope,targetRoleClass:a.targetRoleClass,
                antecedentSpan:null,sourceCaseScoped:true,sourceActorKeys:[a.sourceActorKey],targetCandidateKeys:[a.targetActorKey],identityAuthorityId:a.id } };
        const record = { id:'CF-SBRN-NORMALIZED-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,sourceId:SOURCE_CASE.sourceId,
            sourceText:SOURCE_CASE.sourceText,chartKey:SOURCE_CASE.chartKey,sourceContextType:'chart-case',sourcePredicateType:'relation-event',
            annotationDisposition:'relation-target-present',contextSpans:copy(normalizer.normalizeContextSpans(ANNOTATION)),
            configurationSpans:[],relationUnits:[unit],sourceEvidenceIds:[SOURCE_CASE.id,ANNOTATION.id,a.id],provenance:copy(SOURCE_CASE),
            relationEffect:null,membershipMutation:null,relativeDominance:null,numericScore:null,scalarForce:null };
        const validation = normalizedContract.validateNormalizedRecord(record);
        return freeze({ ...record,validation,normalizationState:validation.valid ? normalizedContract.NORMALIZATION_STATES.NORMALIZED
            : normalizedContract.NORMALIZATION_STATES.UNRESOLVED,blockerReasons:[...validation.errors] });
    };
    const evaluateSource = (input,context = {}) => {
        const sourceValidation = validateSourceInput(input),chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const base = { sourceValidation,chartKey,normalizedInput:null,targetResolution:null,executionInput:null,execution:null,contextReview:null,excludedContext:null,
            sourceContextResolved:false,
            relationIdentityResolved:false,relationRealizationResolved:false,relationRealized:null,effectAuthorizationResolved:false,
            executionAuthorized:false,relationEffects:[],reverseEdges:[],memberEdges:[],membershipMutation:null,
            transformedResultMaterializationAuthorized:false,numericScore:null,relativeDominance:null };
        const result = (status,blockerReasons = [],extra = {}) => freeze({ ...base,status,blockerReasons,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== SOURCE_CASE.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-reviewed-natal-branch-restraint-nonrealization-case']);
        const inventoryValidation = validateInventory(context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const normalizedInput = normalizedTarget(),targetResolution = resolver.resolveRecord(normalizedInput),target = targetResolution.unitResolutions[0];
        if (!normalizedInput.validation.valid || targetResolution.unitResolutions.length !== 1
            || target?.resolutionState !== resolver.RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR
            || target?.targetReference?.actorKey !== IDENTITY_AUTHORITY.targetActorKey) {
            return result(STATES.UNRESOLVED,['actual-single-branch-target-consumption-failed'],{ inventoryValidation });
        }
        const executionInput = { id:'CF-SBRN-EXECUTION-01',sourceCaseId:SOURCE_CASE.id,sourcePathId:IDENTITY_AUTHORITY.sourcePathId,
            sourceEndpoint:{ type:'actor',actorKey:IDENTITY_AUTHORITY.sourceActorKey,scope:IDENTITY_AUTHORITY.endpointScope,cardinality:1 },
            targetResolution:copy(target),relationIdentity:{ id:IDENTITY_AUTHORITY.sourcePathId,
                functionType:REALIZATION_AUTHORITY.functionType,directed:true,directionSemantics:'reviewed-zi-to-wu-branch-restraint-path' },
            realizationState:REALIZATION_AUTHORITY.state,realizationProvenance:copy(REALIZATION_AUTHORITY),contextProvenance:copy(CONTEXT_REVIEW),
            authorization:{ state:kernelContract.AUTHORIZATION_STATES.NOT_APPLICABLE,sourceBacked:false,relationTypes:[],authorityIds:[],
                sourceEvidenceIds:[...REALIZATION_AUTHORITY.sourceEvidenceIds,EXCLUDED_CONTEXT.id] } };
        const execution = kernel.executeRelationEffect(executionInput);
        if (execution.executionState !== kernelContract.EXECUTION_STATES.NOT_REALIZED) {
            return result(STATES.UNRESOLVED,['actual-r3-r4-branch-restraint-nonrealization-consumption-failed'],{ inventoryValidation });
        }
        return result(STATES.RESOLVED,[],{ inventoryValidation,normalizedInput,targetResolution,executionInput,execution,
            contextReview:copy(CONTEXT_REVIEW),excludedContext:copy(EXCLUDED_CONTEXT),sourceContextResolved:true,
            relationIdentityResolved:true,relationRealizationResolved:true,relationRealized:false });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const result = evaluateSource(inputForCase(),{ chartKey:chart.buildStructuredChartKey(semanticModel,synthesis) || null,
            inventory:synthesis.contextualForcePartyMembershipInventory });
        return freeze({ result,finiteSourceReviewComplete:validateSourceInput(inputForCase()).valid,reusedCompleteSourceCaseCount:1,
            newCompleteSourceCaseCount:0,reviewedRelationCount:1,resolvedRuntimeRelationCount:result.relationRealizationResolved ? 1 : 0,
            resolvedRuntimeNonrealizationCount:result.execution?.executionState === kernelContract.EXECUTION_STATES.NOT_REALIZED ? 1 : 0,
            newEffectAuthorityCount:0,positiveEffectCount:0,reverseExecutableEdgeCount:0,branchRestraintNegativeCalibrationEstablished:true,
            branchMediationNegativeCalibrationEstablished:false,genericBranchNegationMapping:false,
            broaderSourceCoverageComplete:false,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceBranchRestraintNonrealizationProfile = freeze({ installed:true,VERSION,RULE_ID,STATES,CONTRACT,
        inputForCase,validateSourceInput,evaluateSource,buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
