(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceBranchKillerDirectionAuditProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceBranchKillerDirectionAuditContract;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const normalizedContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const kernel = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const kernelContract = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract;
    const chart = GuiJia.baziVisibleStemFunctionRealizationSource,core = GuiJia.baziCore;
    if (!api || !normalizer || !normalizedContract || !resolver || !kernel || !kernelContract || !chart || !core) return;
    const { VERSION,RULE_ID,STATES,SOURCE_CASE,ANNOTATION,IDENTITY_AUTHORITY,REALIZATION_AUTHORITY,DIRECTION_REVIEW,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id ? { sourceCase:SOURCE_CASE,annotation:ANNOTATION,
        identityAuthority:IDENTITY_AUTHORITY,realizationAuthority:REALIZATION_AUTHORITY,directionReview:DIRECTION_REVIEW } : null;
    const validateSourceInput = (input) => {
        if (!same(input,inputForCase())) return freeze({ valid:false,issues:['exact-registered-independent-branch-clause-and-direction-review-required'] });
        const s = input.sourceCase,issues = [];
        if (s.chartKey !== s.gans.map((gan,i) => gan + s.zhis[i]).join('|') || s.gans[2] !== '甲'
            || core.getWuXing(s.zhis[3]) !== '水' || core.getWuXing(s.zhis[2]) !== '金'
            || core.cangGanMap[s.zhis[2]].map(([gan]) => core.shiShenMap[s.gans[2]][gan]).join('|') !== '七杀|偏印|偏财') {
            issues.push('reviewed-chart-branch-elements-and-mixed-hidden-roles-mismatch');
        }
        if (![REALIZATION_AUTHORITY.evidenceSpan,DIRECTION_REVIEW.sourceContextSpan].every((span) => s.sourceText.includes(span))) {
            issues.push('reviewed-source-clause-or-direction-context-missing');
        }
        return freeze({ valid:!issues.length,issues });
    };
    const validateInventory = (inventory) => {
        if (!inventory || !Array.isArray(inventory.actorProfiles) || !Array.isArray(inventory.evidenceRecords)
            || Array.from(inventory.actorProfiles).some((p) => !p || typeof p !== 'object')
            || Array.from(inventory.evidenceRecords).some((p) => !p || typeof p !== 'object')) {
            return freeze({ valid:false,issues:['actual-surface-branch-inventory-required'] });
        }
        const issues = [];
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
        const unit = { ...copy(normalizer.normalizeRelationUnit(SOURCE_CASE,u,[],[])),
            identityProvenance:{ state:normalizedContract.IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR,endpointType:'actor',
                actorKey:a.targetActorKey,groupId:null,memberActorKeys:[],cardinality:1,scope:a.endpointScope,targetRoleClass:a.targetRoleClass,
                antecedentSpan:null,sourceCaseScoped:true,sourceActorKeys:[a.sourceActorKey],targetCandidateKeys:[a.targetActorKey],identityAuthorityId:a.id } };
        const record = { id:'CF-SBKDA-NORMALIZED-01',sourceCaseId:SOURCE_CASE.id,annotationId:ANNOTATION.id,sourceId:SOURCE_CASE.sourceId,
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
        const base = { sourceValidation,chartKey,normalizedInput:null,targetResolution:null,executionInput:null,execution:null,directionReview:null,
            relationIdentityResolved:false,relationRealizationResolved:false,relationRealized:null,effectAuthorizationResolved:false,
            executionAuthorized:false,relationEffects:[],reverseEdges:[],memberEdges:[],membershipMutation:null,
            transformedResultMaterializationAuthorized:false,numericScore:null,relativeDominance:null };
        const result = (status,blockerReasons = [],extra = {}) => freeze({ ...base,status,blockerReasons,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== SOURCE_CASE.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-reviewed-zi-to-shen-case']);
        const inventoryValidation = validateInventory(context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const normalizedInput = normalizedTarget(),targetResolution = resolver.resolveRecord(normalizedInput),target = targetResolution.unitResolutions[0];
        if (!normalizedInput.validation.valid || targetResolution.unitResolutions.length !== 1
            || target?.resolutionState !== resolver.RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR
            || target?.targetReference?.actorKey !== IDENTITY_AUTHORITY.targetActorKey) {
            return result(STATES.UNRESOLVED,['actual-single-branch-target-consumption-failed'],{ inventoryValidation });
        }
        const executionInput = { id:'CF-SBKDA-EXECUTION-01',sourceCaseId:SOURCE_CASE.id,sourcePathId:IDENTITY_AUTHORITY.sourcePathId,
            sourceEndpoint:{ type:'actor',actorKey:IDENTITY_AUTHORITY.sourceActorKey,scope:IDENTITY_AUTHORITY.endpointScope,cardinality:1 },
            targetResolution:copy(target),relationIdentity:{ id:IDENTITY_AUTHORITY.sourcePathId,
                functionType:REALIZATION_AUTHORITY.functionType,directed:true,directionSemantics:DIRECTION_REVIEW.clauseDirection.semantics },
            realizationState:REALIZATION_AUTHORITY.state,realizationProvenance:copy(REALIZATION_AUTHORITY),
            authorization:{ state:kernelContract.AUTHORIZATION_STATES.UNMAPPED,sourceBacked:false,relationTypes:[],authorityIds:[],
                sourceEvidenceIds:[...REALIZATION_AUTHORITY.sourceEvidenceIds,DIRECTION_REVIEW.id] } };
        const execution = kernel.executeRelationEffect(executionInput);
        if (execution.executionState !== kernelContract.EXECUTION_STATES.REALIZED_UNMAPPED) {
            return result(STATES.UNRESOLVED,['actual-r3-r4-realized-unmapped-consumption-failed'],{ inventoryValidation });
        }
        return result(STATES.RESOLVED,DIRECTION_REVIEW.blockerReasons,{ inventoryValidation,normalizedInput,targetResolution,executionInput,execution,
            directionReview:copy(DIRECTION_REVIEW),relationIdentityResolved:true,relationRealizationResolved:true,relationRealized:true });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const result = evaluateSource(inputForCase(),{ chartKey:chart.buildStructuredChartKey(semanticModel,synthesis) || null,
            inventory:synthesis.contextualForcePartyMembershipInventory });
        return freeze({ result,finiteSourceReviewComplete:validateSourceInput(inputForCase()).valid,reusedCompleteSourceCaseCount:1,
            newCompleteSourceCaseCount:0,reviewedRelationCount:1,resolvedRuntimeRelationCount:result.relationRealized === true ? 1 : 0,
            realizedUnmappedRuntimePathCount:result.execution?.executionState === kernelContract.EXECUTION_STATES.REALIZED_UNMAPPED ? 1 : 0,
            newEffectAuthorityCount:0,positiveEffectCount:0,reverseExecutableEdgeCount:0,genericHuaEffectMappingDefined:false,
            broaderSourceCoverageComplete:false,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceBranchKillerDirectionAuditProfile = freeze({ installed:true,VERSION,RULE_ID,STATES,CONTRACT,
        inputForCase,validateSourceInput,evaluateSource,buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
