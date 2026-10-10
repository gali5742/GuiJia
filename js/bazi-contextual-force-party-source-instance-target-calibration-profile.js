(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceInstanceTargetCalibrationProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceInstanceTargetCalibrationContract;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const normalizedContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource;
    const core = GuiJia.baziCore;
    if (!api || !normalizer || !normalizedContract || !resolver || !realization || !core) return;
    const { VERSION, RULE_ID, STATES, SOURCE_CASE, ANNOTATION, IDENTITY_AUTHORITY, CONTRACT, freeze } = api;
    const copy = (value) => JSON.parse(JSON.stringify(value));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        const keys = Object.keys(b);
        return Object.keys(a).length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(a,key) && same(a[key],b[key]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id
        ? { sourceCase:SOURCE_CASE, annotation:ANNOTATION, identityAuthority:IDENTITY_AUTHORITY } : {};
    const validateSourceInput = (input) => {
        if (!input || typeof input !== 'object' || Array.isArray(input) || !same(input,inputForCase())) {
            return freeze({ valid:false, issues:['exact-registered-source-instance-annotation-authority-required'] });
        }
        const issues = [], a = input.identityAuthority, source = input.sourceCase, unit = input.annotation.relationUnits[0];
        if (!source.sourceText.includes(unit.relationClauseSpan) || !source.sourceText.includes(unit.target.antecedentSpan)
            || !source.sourceText.includes(a.sourcePositionSpan)) issues.push('source-endpoint-span-provenance-missing');
        if (source.chartKey !== source.gans.map((gan,index) => gan + source.zhis[index]).join('|')) issues.push('complete-source-chart-mismatch');
        if (core.shiShenMap[source.gans[2]][source.gans[0]] !== a.sourceRoleClass
            || core.shiShenMap[source.gans[2]][source.gans[3]] !== a.targetRoleClass) issues.push('registered-endpoint-role-mismatch');
        if (core.cangGanMap[source.zhis[3]].some(([gan]) => core.getWuXing(gan) === '水')) issues.push('reviewed-hour-scope-basis-invalid');
        return freeze({ valid:!issues.length, issues });
    };
    const validateInventory = (inventory) => {
        const issues = [];
        if (!inventory || !Array.isArray(inventory.actorProfiles) || !Array.isArray(inventory.evidenceRecords)
            || inventory.actorProfiles.some((p) => !p || typeof p !== 'object')
            || inventory.evidenceRecords.some((r) => !r || typeof r !== 'object')) {
            return freeze({ valid:false, issues:['actual-membership-inventory-required'] });
        }
        for (const [key, role] of [[IDENTITY_AUTHORITY.sourceActorKey,'正官'],[IDENTITY_AUTHORITY.targetActorKey,'七杀']]) {
            if (inventory.actorProfiles.filter((p) => p.actorKey === key).length !== 1) issues.push('unique-actual-inventory-endpoint-required');
            const evidence = inventory.evidenceRecords.filter((r) => r.actorKey === key);
            const roles = [...new Set(evidence.map((r) => r.tenGod))];
            if (roles.length !== 1 || roles[0] !== role) issues.push('actual-inventory-endpoint-role-mismatch');
        }
        return freeze({ valid:!issues.length, issues:[...new Set(issues)] });
    };
    const normalizedInputForBinding = (binding) => {
        const unit = normalizer.normalizeRelationUnit(SOURCE_CASE, ANNOTATION.relationUnits[0], [], []);
        const record = {
            id:'CF-SITC-NORMALIZED-01', sourceCaseId:SOURCE_CASE.id, annotationId:ANNOTATION.id,
            sourceId:SOURCE_CASE.sourceId, sourceText:SOURCE_CASE.sourceText, chartKey:SOURCE_CASE.chartKey,
            sourceContextType:SOURCE_CASE.sourceContextType, sourcePredicateType:SOURCE_CASE.predicateType,
            annotationDisposition:ANNOTATION.annotationDisposition,
            contextSpans:copy(normalizer.normalizeContextSpans(ANNOTATION)), configurationSpans:[],
            relationUnits:[{ ...copy(unit), identityProvenance:{
                state:normalizedContract.IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR, endpointType:'actor',
                actorKey:binding.targetActorKey, groupId:null, memberActorKeys:[], cardinality:1,
                scope:'visible-stem', targetRoleClass:'七杀', antecedentSpan:'时杀',
                sourceCaseScoped:true, sourceActorKeys:[binding.sourceActorKey], targetCandidateKeys:[binding.targetActorKey],
                identityAuthorityId:IDENTITY_AUTHORITY.id
            } }],
            sourceEvidenceIds:[SOURCE_CASE.id,ANNOTATION.id,IDENTITY_AUTHORITY.id],
            provenance:copy(SOURCE_CASE), relationEffect:null, membershipMutation:null,
            relativeDominance:null, numericScore:null, scalarForce:null
        };
        // Only a binding validated against the exact source and current inventory reaches this adapter.
        const validation = normalizedContract.validateNormalizedRecord(record);
        return freeze({ ...record, validation, normalizationState:validation.valid
            ? normalizedContract.NORMALIZATION_STATES.NORMALIZED : normalizedContract.NORMALIZATION_STATES.UNRESOLVED,
            blockerReasons:[...validation.errors] });
    };
    const evaluateInstance = (input, context = {}) => {
        const sourceValidation = validateSourceInput(input);
        const chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const base = { sourceValidation, chartKey, sourceCaseId:null, identityAuthorityId:null,
            binding:null, normalizedInput:null, targetResolution:null,
            relationRealizationResolved:false, realizationState:'unresolved', effectAuthorizationResolved:false,
            executionAuthorized:false, relationEffects:[], memberEdges:[], runtimeWinnerPathId:null,
            numericScore:null, relativeDominance:null };
        const result = (status,reasons = [],extra = {}) => freeze({ ...base, status, blockerReasons:reasons, ...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== SOURCE_CASE.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-source-case']);
        const inventoryValidation = validateInventory(context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const binding = { ...copy(IDENTITY_AUTHORITY), status:STATES.RESOLVED, sourceCaseScoped:true,
            sourceEndpoint:{ type:'actor', actorKey:IDENTITY_AUTHORITY.sourceActorKey, scope:'visible-stem', cardinality:1 },
            targetEndpoint:{ type:'actor', actorKey:IDENTITY_AUTHORITY.targetActorKey, scope:'visible-stem', cardinality:1 },
            instanceId:`${SOURCE_CASE.chartKey}::${IDENTITY_AUTHORITY.sourcePathId}` };
        const normalizedInput = normalizedInputForBinding(binding);
        const targetResolution = resolver.resolveRecord(normalizedInput);
        if (!normalizedInput.validation.valid || targetResolution.unitResolutions[0]?.resolutionState !== resolver.RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR) {
            return result(STATES.UNRESOLVED,['generic-instance-target-resolution-failed']);
        }
        return result(STATES.RESOLVED,[],{ sourceCaseId:SOURCE_CASE.id, identityAuthorityId:IDENTITY_AUTHORITY.id,
            inventoryValidation, binding, normalizedInput, targetResolution });
    };
    const buildProfile = (semanticModel = {}, synthesis = {}) => {
        const sourceValidation = validateSourceInput(inputForCase());
        const chartKey = realization.buildStructuredChartKey(semanticModel,synthesis) || null;
        const result = evaluateInstance(inputForCase(),{ chartKey, inventory:synthesis.contextualForcePartyMembershipInventory });
        return freeze({ status:'source-instance-target-calibration-evaluated', sourceValidation, result,
            finiteSourceIdentityCoverageComplete:sourceValidation.valid, sourceCaseCount:1,
            targetIdentityCalibrationIntroduced:true, resolvedRuntimeTargetCount:result.status === STATES.RESOLVED ? 1 : 0,
            positiveEffectCalibrationIntroduced:false, transferredR11TargetCount:0,
            genericTargetIdentityResolverDefined:false, broaderSourceCoverageComplete:false,
            relationRealizationResolved:false, effectAuthorizationResolved:false, executionAuthorized:false,
            relationEffects:[], memberEdges:[], numericScore:null, relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceInstanceTargetCalibrationProfile = Object.freeze({
        installed:true, VERSION, RULE_ID, STATES, CONTRACT, inputForCase, validateSourceInput, evaluateInstance, buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
