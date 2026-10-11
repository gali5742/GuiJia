(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceMediationNoncommunicationProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceMediationNoncommunicationContract;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const normalizedContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const kernel = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const kernelContract = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract;
    const chart = GuiJia.baziVisibleStemFunctionRealizationSource,core = GuiJia.baziCore;
    if (!api || !normalizer || !normalizedContract || !resolver || !kernel || !kernelContract || !chart || !core) return;
    const { VERSION,RULE_ID,STATES,SOURCE_CASE,ANNOTATION,IDENTITY_AUTHORITY,REALIZATION_AUTHORITY,EXCLUDED_CONTEXT,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id ? { sourceCase:SOURCE_CASE,annotation:ANNOTATION,
        identityAuthority:IDENTITY_AUTHORITY,realizationAuthority:REALIZATION_AUTHORITY,excludedContext:EXCLUDED_CONTEXT } : null;
    const validateSourceInput = (input) => {
        if (!same(input,inputForCase())) return freeze({ valid:false,issues:['exact-registered-independent-natal-noncommunication-review-required'] });
        const s = input.sourceCase,issues = [];
        if (s.chartKey !== s.gans.map((gan,i) => gan + s.zhis[i]).join('|') || s.gans[2] !== '辛'
            || core.shiShenMap[s.gans[2]][s.gans[1]] !== '七杀' || core.shiShenMap[s.gans[2]][s.gans[0]] !== '偏印') {
            issues.push('reviewed-complete-chart-and-visible-pillar-roles-mismatch');
        }
        if (![REALIZATION_AUTHORITY.evidenceSpan,EXCLUDED_CONTEXT.branchFormationSpan,EXCLUDED_CONTEXT.assertedKillerSupportSpan]
            .every((span) => s.sourceText.includes(span))) issues.push('reviewed-source-noncommunication-or-excluded-context-missing');
        return freeze({ valid:!issues.length,issues });
    };
    const validateInventory = (inventory) => {
        if (!inventory || !Array.isArray(inventory.actorProfiles) || !Array.isArray(inventory.evidenceRecords)
            || Array.from(inventory.actorProfiles).some((p) => !p || typeof p !== 'object')
            || Array.from(inventory.evidenceRecords).some((p) => !p || typeof p !== 'object')) {
            return freeze({ valid:false,issues:['actual-visible-stem-inventory-required'] });
        }
        const issues = [];
        for (const actorKey of [IDENTITY_AUTHORITY.sourceActorKey,IDENTITY_AUTHORITY.targetActorKey]) {
            const pillarIndex = Number(actorKey.split(':')[1]),gan = SOURCE_CASE.gans[pillarIndex];
            if (inventory.actorProfiles.filter((p) => p.actorKey === actorKey).length !== 1) issues.push('unique-actual-visible-identity-required');
            const records = inventory.evidenceRecords.filter((r) => r.actorKey === actorKey);
            // The current inventory labels visible evidence surface-stem and leaves pillarIndex null; position and actorKey bind the pillar.
            if (!records.length || records.some((r) => r.sourceScope !== 'surface-stem' || (r.pillarIndex !== null && r.pillarIndex !== pillarIndex)
                || r.position !== ['year','month','day','hour'][pillarIndex] || r.gan !== gan || r.wuxing !== core.getWuXing(gan)
                || r.tenGod !== core.shiShenMap[SOURCE_CASE.gans[2]][gan])) issues.push('actual-visible-scope-position-element-role-evidence-mismatch');
        }
        return freeze({ valid:!issues.length,issues:[...new Set(issues)] });
    };
    const normalizedTarget = () => {
        const a = IDENTITY_AUTHORITY,u = ANNOTATION.relationUnits[0];
        const unit = { ...copy(normalizer.normalizeRelationUnit(SOURCE_CASE,u,[],[])),
            identityProvenance:{ state:normalizedContract.IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR,endpointType:'actor',
                actorKey:a.targetActorKey,groupId:null,memberActorKeys:[],cardinality:1,scope:a.endpointScope,targetRoleClass:a.targetTenGod,
                antecedentSpan:null,sourceCaseScoped:true,sourceActorKeys:[a.sourceActorKey],targetCandidateKeys:[a.targetActorKey],identityAuthorityId:a.id } };
        const record = { id:'CF-SMNC-NORMALIZED-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,sourceId:SOURCE_CASE.sourceId,
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
        const base = { sourceValidation,chartKey,normalizedInput:null,targetResolution:null,executionInput:null,execution:null,excludedContext:null,
            relationIdentityResolved:false,relationRealizationResolved:false,relationRealized:null,effectAuthorizationResolved:false,
            executionAuthorized:false,relationEffects:[],reverseEdges:[],memberEdges:[],membershipMutation:null,
            transformedResultMaterializationAuthorized:false,numericScore:null,relativeDominance:null };
        const result = (status,blockerReasons = [],extra = {}) => freeze({ ...base,status,blockerReasons,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== SOURCE_CASE.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-reviewed-natal-noncommunication-case']);
        const inventoryValidation = validateInventory(context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const normalizedInput = normalizedTarget(),targetResolution = resolver.resolveRecord(normalizedInput),target = targetResolution.unitResolutions[0];
        if (!normalizedInput.validation.valid || targetResolution.unitResolutions.length !== 1
            || target?.resolutionState !== resolver.RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR
            || target?.targetReference?.actorKey !== IDENTITY_AUTHORITY.targetActorKey) {
            return result(STATES.UNRESOLVED,['actual-single-visible-target-consumption-failed'],{ inventoryValidation });
        }
        const executionInput = { id:'CF-SMNC-EXECUTION-01',sourceCaseId:SOURCE_CASE.id,sourcePathId:IDENTITY_AUTHORITY.sourcePathId,
            sourceEndpoint:{ type:'actor',actorKey:IDENTITY_AUTHORITY.sourceActorKey,scope:IDENTITY_AUTHORITY.endpointScope,cardinality:1 },
            targetResolution:copy(target),relationIdentity:{ id:IDENTITY_AUTHORITY.sourcePathId,
                functionType:REALIZATION_AUTHORITY.functionType,directed:true,directionSemantics:'reviewed-month-killer-to-year-seal-communication-path' },
            realizationState:REALIZATION_AUTHORITY.state,realizationProvenance:copy(REALIZATION_AUTHORITY),
            authorization:{ state:kernelContract.AUTHORIZATION_STATES.NOT_APPLICABLE,sourceBacked:false,relationTypes:[],authorityIds:[],
                sourceEvidenceIds:[...REALIZATION_AUTHORITY.sourceEvidenceIds,EXCLUDED_CONTEXT.id] } };
        const execution = kernel.executeRelationEffect(executionInput);
        if (execution.executionState !== kernelContract.EXECUTION_STATES.NOT_REALIZED) {
            return result(STATES.UNRESOLVED,['actual-r3-r4-noncommunication-consumption-failed'],{ inventoryValidation });
        }
        return result(STATES.RESOLVED,[],{ inventoryValidation,normalizedInput,targetResolution,executionInput,execution,
            excludedContext:copy(EXCLUDED_CONTEXT),relationIdentityResolved:true,relationRealizationResolved:true,relationRealized:false });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const result = evaluateSource(inputForCase(),{ chartKey:chart.buildStructuredChartKey(semanticModel,synthesis) || null,
            inventory:synthesis.contextualForcePartyMembershipInventory });
        return freeze({ result,finiteSourceReviewComplete:validateSourceInput(inputForCase()).valid,reusedCompleteSourceCaseCount:0,
            newCompleteSourceCaseCount:1,reviewedRelationCount:1,resolvedRuntimeRelationCount:result.relationRealizationResolved ? 1 : 0,
            resolvedRuntimeNonrealizationCount:result.execution?.executionState === kernelContract.EXECUTION_STATES.NOT_REALIZED ? 1 : 0,
            newEffectAuthorityCount:0,positiveEffectCount:0,reverseExecutableEdgeCount:0,branchNegativeCalibrationEstablished:false,
            genericGenerationNonrealizationMapping:false,broaderSourceCoverageComplete:false,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceMediationNoncommunicationProfile = freeze({ installed:true,VERSION,RULE_ID,STATES,CONTRACT,
        inputForCase,validateSourceInput,evaluateSource,buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
