(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBladeTargetCalibrationProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceBladeTargetCalibrationContract;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const normalizedContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource,core = GuiJia.baziCore;
    if (!api || !normalizer || !normalizedContract || !resolver || !realization || !core) return;
    const { VERSION,RULE_ID,STATES,DEFINITION_SOURCE,SOURCE_CASES,IDENTITY_AUTHORITIES,ANNOTATION,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = SOURCE_CASES[0].id) => {
        const sourceCase = SOURCE_CASES.find((s) => s.id === id);
        return sourceCase ? { sourceCase,definitionSource:DEFINITION_SOURCE,identityAuthority:IDENTITY_AUTHORITIES.find((a) => a.sourceCaseId === id),
            annotation:sourceCase.mode === 'relation-target' ? ANNOTATION : null } : {};
    };
    const validateSourceInput = (input) => {
        const registered = SOURCE_CASES.some((s) => same(input,inputForCase(s.id))),issues = [];
        if (!registered) return freeze({ valid:false,issues:['exact-registered-blade-case-definition-and-identity-review-required'] });
        const s = input.sourceCase,a = input.identityAuthority;
        if (s.chartKey !== s.gans.map((gan,i) => gan + s.zhis[i]).join('|') || s.gans[2] !== DEFINITION_SOURCE.appliedDayGan
            || s.zhis[a.bladePillarIndex] !== DEFINITION_SOURCE.candidateZhi || s.zhis.filter((zhi) => zhi === '午').length !== 1
            || !s.sourceText.includes(a.observationSpan)) issues.push('reviewed-complete-chart-blade-location-mismatch');
        if (input.annotation && input.annotation.relationUnits.some((u) => !s.sourceText.includes(u.relationClauseSpan)
            || !s.sourceText.includes(u.target.antecedentSpan))) issues.push('reviewed-blade-relation-and-antecedent-missing');
        return freeze({ valid:!issues.length,issues });
    };
    const validateInventory = (input,inventory) => {
        if (!inventory || !Array.isArray(inventory.actorProfiles) || !Array.isArray(inventory.evidenceRecords)
            || Array.from(inventory.actorProfiles).some((p) => !p || typeof p !== 'object')
            || Array.from(inventory.evidenceRecords).some((p) => !p || typeof p !== 'object')) return freeze({ valid:false,issues:['actual-surface-branch-inventory-required'] });
        const s = input.sourceCase,a = input.identityAuthority,issues = [];
        const expected = [a.bladeActorKey,...(input.annotation?.relationUnits || []).map((u) => u.sourceActorKey)];
        for (const actorKey of [...new Set(expected)]) {
            const pillarIndex = Number(actorKey.split(':')[1]),zhi = s.zhis[pillarIndex];
            if (inventory.actorProfiles.filter((p) => p.actorKey === actorKey).length !== 1) issues.push('unique-actual-branch-identity-required');
            const records = inventory.evidenceRecords.filter((r) => r.actorKey === actorKey);
            if (!records.length || records.some((r) => r.sourceScope !== 'surface-branch' || r.pillarIndex !== pillarIndex
                || r.position !== ['year','month','day','hour'][pillarIndex] || r.zhi !== zhi || r.wuxing !== core.getWuXing(zhi))) issues.push('actual-branch-scope-position-element-evidence-mismatch');
        }
        return freeze({ valid:!issues.length,issues:[...new Set(issues)] });
    };
    const normalizedTarget = (input) => {
        const s = input.sourceCase,a = input.identityAuthority,annotation = input.annotation;
        const relationUnits = annotation.relationUnits.map((u) => ({ ...copy(normalizer.normalizeRelationUnit(s,u,[],[])),
            identityProvenance:{ state:normalizedContract.IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR,endpointType:'actor',
                actorKey:a.bladeActorKey,groupId:null,memberActorKeys:[],cardinality:1,scope:'surface-branch',targetRoleClass:'阳刃',
                antecedentSpan:u.target.antecedentSpan,sourceCaseScoped:true,sourceActorKeys:[u.sourceActorKey],targetCandidateKeys:[a.bladeActorKey],identityAuthorityId:a.id } }));
        const record = { id:'CF-SBTC-NORMALIZED-01',sourceCaseId:s.id,annotationId:annotation.id,sourceId:s.sourceId,sourceText:s.sourceText,chartKey:s.chartKey,
            sourceContextType:'chart-case',sourcePredicateType:'relation-event',annotationDisposition:'relation-target-present',
            contextSpans:copy(normalizer.normalizeContextSpans(annotation)),configurationSpans:[],relationUnits,
            sourceEvidenceIds:[s.id,annotation.id,a.id,DEFINITION_SOURCE.id],provenance:copy(s),relationEffect:null,membershipMutation:null,
            relativeDominance:null,numericScore:null,scalarForce:null };
        const validation = normalizedContract.validateNormalizedRecord(record);
        return freeze({ ...record,validation,normalizationState:validation.valid ? normalizedContract.NORMALIZATION_STATES.NORMALIZED : normalizedContract.NORMALIZATION_STATES.UNRESOLVED,
            blockerReasons:[...validation.errors] });
    };
    const evaluateSource = (input,context = {}) => {
        const sourceValidation = validateSourceInput(input),chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const base = { sourceValidation,chartKey,bladeIdentity:null,normalizedInput:null,targetResolution:null,relationTargetPathCount:0,
            relationRealizationResolved:false,effectAuthorizationResolved:false,transformedResultMaterializationAuthorized:false,
            executionAuthorized:false,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null };
        const result = (status,blockerReasons = [],extra = {}) => freeze({ ...base,status,blockerReasons,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== input.sourceCase.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-reviewed-blade-case']);
        const inventoryValidation = validateInventory(input,context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const a = input.identityAuthority,bladeIdentity = { ...copy(a),endpoint:{ type:'actor',actorKey:a.bladeActorKey,scope:a.bladeScope,cardinality:a.bladeCardinality } };
        if (!input.annotation) return result(STATES.OBSERVED,[],{ inventoryValidation,bladeIdentity });
        const normalizedInput = normalizedTarget(input),targetResolution = resolver.resolveRecord(normalizedInput);
        if (!normalizedInput.validation.valid || targetResolution.unitResolutions.length !== 2
            || targetResolution.unitResolutions.some((r) => r.resolutionState !== resolver.RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR)) {
            return result(STATES.UNRESOLVED,['generic-blade-target-consumption-failed']);
        }
        return result(STATES.RESOLVED,['relation-realization-and-effect-authorization-not-reviewed'],
            { inventoryValidation,bladeIdentity,normalizedInput,targetResolution,relationTargetPathCount:2 });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const sourceValidations = SOURCE_CASES.map((s) => validateSourceInput(inputForCase(s.id)));
        const results = SOURCE_CASES.map((s) => evaluateSource(inputForCase(s.id),{
            chartKey:realization.buildStructuredChartKey(semanticModel,synthesis) || null,inventory:synthesis.contextualForcePartyMembershipInventory }));
        return freeze({ sourceValidations,results,finiteSourceIdentityCoverageComplete:sourceValidations.every((v) => v.valid),sourceCaseCount:3,
            newlyRegisteredCompleteSourceCaseCount:3,relationTargetSourceCaseCount:1,locationContextSourceCaseCount:2,
            resolvedRuntimeTargetCount:results.filter((r) => r.status === STATES.RESOLVED).length,
            resolvedRuntimeTargetPathCount:results.reduce((n,r) => n + r.relationTargetPathCount,0),
            observedRuntimeBladeLocationCount:results.filter((r) => [STATES.RESOLVED,STATES.OBSERVED].includes(r.status)).length,
            transferredR17TargetCount:0,newMaterializationAuthorityCount:0,newEffectAuthorityCount:0,genericMonthBladePriority:false,
            broaderSourceCoverageComplete:false,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceBladeTargetCalibrationProfile = freeze({ installed:true,VERSION,RULE_ID,STATES,CONTRACT,
        inputForCase,validateSourceInput,evaluateSource,buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
