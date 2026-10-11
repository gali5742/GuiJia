(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyTransformationResultIdentityProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartyTransformationResultIdentityContract;
    const source = GuiJia.baziContextualForcePartyTransformedSourceBladeIdentityAuditProfile;
    const reviewed = GuiJia.baziContextualForcePartyTransformedSourceBladeIdentityAuditContract;
    const kernel = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource;
    if (!api || !source || !reviewed || !kernel || !realization) return;
    const { VERSION,RULE_ID,CONTRACT,STATES,MATERIALIZATION_STATES,MATERIALIZATION_AUTHORITIES,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const recordForReview = (input) => {
        const t = input.transformationReview,s = input.upstreamInput.sourceCase;
        const assertion = (span) => ({ span,state:t.sourceAssertionState,authorityId:t.id,evidenceIds:[s.id,t.id] });
        return { schemaVersion:VERSION,contractId:CONTRACT.id,id:'CF-TRIC-INPUT-01',sourceCaseId:s.id,chartKey:s.chartKey,sourceProvenance:copy(s),
            operation:{ id:'CF-TRIC-OPERATION-01',kind:'source-asserted-compound-transformation',
                inputEndpoints:t.inputOperands.map((o) => ({ type:'actor',actorKey:o.actorKey,scope:o.scope,cardinality:1 })),
                assertion:assertion(t.eventSpan),resultId:t.resultNodeId },
            result:{ id:t.resultNodeId,nodeKind:t.resultNodeKind,operationId:'CF-TRIC-OPERATION-01',assertion:assertion(t.resultSpan),
                labels:{ element:t.resultElementLabel,role:t.resultRoleLabel },executableEndpoint:null } };
    };
    const normalizeSourceReview = (input) => {
        const sourceValidation = source.validateSourceInput(input);
        if (!sourceValidation.valid) return freeze({ normalizationState:'unresolved-transformation-result-identity-input',sourceValidation,identityRecord:null,validation:null });
        const record = recordForReview(input),validation = api.validateIdentityInput(record);
        return freeze({ normalizationState:validation.valid ? 'normalized-source-reviewed-transformation-identity-input' : 'unresolved-transformation-result-identity-input',
            sourceValidation,identityRecord:validation.valid ? record : null,validation });
    };
    const inputForCase = (id) => normalizeSourceReview(source.inputForCase(id)).identityRecord;
    const inspectMaterialization = (record,claim = null) => {
        const validation = api.validateMaterializationClaim(record,claim);
        // These gates are independent: a complete proposal still has no authority or result-inventory adapter.
        const registeredAuthority = validation.valid && MATERIALIZATION_AUTHORITIES.some((a) => a.id === claim.authorityId
            && a.sourceCaseId === record.sourceCaseId && a.chartKey === record.chartKey
            && a.operationId === record.operation.id && a.resultId === record.result.id
            && same(a.endpoint,claim.endpoint) && same(a.sourceEvidenceIds,claim.sourceEvidenceIds));
        const endpointErrors = kernel.validateEndpoint({ type:CONTRACT.reservedMaterializationEndpointType },'source');
        const kernelEndpointSupported = !endpointErrors.length;
        return freeze({ state:claim == null ? MATERIALIZATION_STATES.MISSING : validation.valid ? MATERIALIZATION_STATES.UNREGISTERED : MATERIALIZATION_STATES.INVALID,
            validation,registeredAuthority,materializedResultInventoryVerified:false,kernelEndpointSupported,
            executableEndpoint:null,executionAuthorized:false,
            blockerReasons:[...validation.issues,'registered-source-materialization-authority-missing','authorized-materialized-result-inventory-missing',...endpointErrors] });
    };
    const validateOperands = (inventory) => {
        if (!inventory || !Array.isArray(inventory.actorProfiles) || !Array.isArray(inventory.evidenceRecords)
            || Array.from(inventory.actorProfiles).some((p) => !p || typeof p !== 'object')
            || Array.from(inventory.evidenceRecords).some((p) => !p || typeof p !== 'object')) return freeze({ valid:false,issues:['actual-original-operand-inventory-required'] });
        const issues = [];
        for (const o of reviewed.TRANSFORMATION_REVIEW.inputOperands) {
            if (inventory.actorProfiles.filter((p) => p.actorKey === o.actorKey).length !== 1) issues.push('unique-actual-original-operand-required');
            const evidence = inventory.evidenceRecords.filter((p) => p.actorKey === o.actorKey);
            if (!evidence.length || evidence.some((p) => p.sourceScope !== 'surface-stem' || p.gan !== o.gan || p.tenGod !== o.roleClass || p.position !== o.position)) issues.push('original-operand-evidence-mismatch');
        }
        return freeze({ valid:!issues.length,issues:[...new Set(issues)] });
    };
    const evaluateIdentity = (record,context = {},claim = null) => {
        const schemaValidation = api.validateIdentityInput(record),chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const expected = inputForCase(),registeredSourceReviewMatched = schemaValidation.valid && same(record,expected);
        const base = { chartKey,schemaValidation,registeredSourceReviewMatched,identityRecord:null,
            operationIdentityResolved:false,resultProvenanceResolved:false,materialization:null,sourceEndpoint:null,
            sourceEndpointResolved:false,relationRealizationResolved:false,effectAuthorizationResolved:false,
            executionAuthorized:false,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null };
        const result = (state,blockerReasons = [],extra = {}) => freeze({ ...base,state,blockerReasons,...extra });
        if (!schemaValidation.valid) return result(STATES.INVALID,schemaValidation.issues);
        if (!registeredSourceReviewMatched) return result(STATES.UNRESOLVED,['registered-source-review-does-not-authorize-identity-input']);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== record.chartKey) return result(STATES.NOT_APPLICABLE,['outside-source-reviewed-transformation-case']);
        const inventoryValidation = validateOperands(context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const materialization = inspectMaterialization(record,claim);
        return result(STATES.PROVENANCE_RESOLVED,materialization.blockerReasons,{ inventoryValidation,identityRecord:copy(record),
            operationIdentityResolved:true,resultProvenanceResolved:true,materialization });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const normalized = normalizeSourceReview(source.inputForCase());
        const result = evaluateIdentity(normalized.identityRecord,{ chartKey:realization.buildStructuredChartKey(semanticModel,synthesis) || null,
            inventory:synthesis.contextualForcePartyMembershipInventory });
        return freeze({ schemaContractDefined:normalized.validation?.valid === true,normalized,result,
            sourceCaseCount:1,newIndependentSourceCaseCount:0,registeredMaterializationAuthorityCount:MATERIALIZATION_AUTHORITIES.length,
            resolvedRuntimeOperationCount:result.operationIdentityResolved ? 1 : 0,
            resolvedRuntimeResultProvenanceCount:result.resultProvenanceResolved ? 1 : 0,resolvedRuntimeSourceEndpointCount:0,
            bladeTargetResolved:false,broaderSourceCoverageComplete:false,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartyTransformationResultIdentityProfile = freeze({ installed:true,VERSION,RULE_ID,CONTRACT,STATES,
        normalizeSourceReview,inputForCase,inspectMaterialization,evaluateIdentity,buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
