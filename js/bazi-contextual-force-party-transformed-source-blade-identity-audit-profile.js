(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyTransformedSourceBladeIdentityAuditProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartyTransformedSourceBladeIdentityAuditContract;
    const prior = GuiJia.baziContextualForcePartySourceOfficerKillerNonrealizationProfile;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const normalizedContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const kernel = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource;
    const core = GuiJia.baziCore;
    if (!api || !prior || !normalizer || !normalizedContract || !resolver || !kernel || !realization || !core) return;
    const { VERSION,RULE_ID,STATES,DEFINITION_SOURCE,ANNOTATION,TRANSFORMATION_REVIEW,BLADE_REVIEW,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        const keys = Object.keys(b);
        return Object.keys(a).length === keys.length && keys.every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = TRANSFORMATION_REVIEW.sourceCaseId) => id === TRANSFORMATION_REVIEW.sourceCaseId ? {
        upstreamInput:prior.inputForCase(),definitionSource:DEFINITION_SOURCE,annotation:ANNOTATION,
        transformationReview:TRANSFORMATION_REVIEW,bladeReview:BLADE_REVIEW
    } : {};
    const validateSourceInput = (input) => {
        if (!input || typeof input !== 'object' || Array.isArray(input) || !same(input,inputForCase())) {
            return freeze({ valid:false,issues:['exact-registered-source-definition-transformation-blade-review-required'] });
        }
        const v = prior.validateSourceInput(input.upstreamInput),issues = [...v.issues],s = input.upstreamInput.sourceCase;
        if (![TRANSFORMATION_REVIEW.eventSpan,TRANSFORMATION_REVIEW.resultSpan,ANNOTATION.relationUnits[0].relationClauseSpan]
            .every((span) => s.sourceText.includes(span))) issues.push('exact-transformation-alternate-outcome-spans-missing');
        if (!DEFINITION_SOURCE.sourceText.includes(DEFINITION_SOURCE.candidateDefinitionSpan)
            || s.gans[2] !== DEFINITION_SOURCE.appliedDayGan) issues.push('reviewed-blade-definition-context-mismatch');
        for (const operand of TRANSFORMATION_REVIEW.inputOperands) {
            const index = Number(operand.actorKey.split(':')[1]);
            if (s.gans[index] !== operand.gan || core.shiShenMap[s.gans[2]][operand.gan] !== operand.roleClass) issues.push('reviewed-original-operand-role-mismatch');
        }
        for (const c of BLADE_REVIEW.candidates) {
            if (s.zhis[c.pillarIndex] !== DEFINITION_SOURCE.candidateZhi || core.getWuXing(c.zhi) !== c.wuxing) issues.push('reviewed-blade-candidate-chart-mismatch');
        }
        return freeze({ valid:!issues.length,issues:[...new Set(issues)] });
    };
    const validateInventory = (inventory) => {
        if (!inventory || !Array.isArray(inventory.actorProfiles) || !Array.isArray(inventory.evidenceRecords)
            || inventory.actorProfiles.some((p) => !p || typeof p !== 'object')
            || inventory.evidenceRecords.some((r) => !r || typeof r !== 'object')) return freeze({ valid:false,issues:['actual-membership-inventory-required'] });
        const issues = [];
        for (const item of [...TRANSFORMATION_REVIEW.inputOperands,...BLADE_REVIEW.candidates]) {
            if (inventory.actorProfiles.filter((p) => p.actorKey === item.actorKey).length !== 1) issues.push('unique-actual-operand-and-candidate-profile-required');
            const records = inventory.evidenceRecords.filter((r) => r.actorKey === item.actorKey);
            if (!records.length) issues.push('actual-operand-and-candidate-evidence-required');
            if (item.gan) {
                if (records.some((r) => r.sourceScope !== 'surface-stem' || r.gan !== item.gan || r.tenGod !== item.roleClass || r.position !== item.position)) issues.push('original-operand-evidence-mismatch');
            } else if (records.some((r) => r.sourceScope !== 'surface-branch' || r.pillarIndex !== item.pillarIndex
                || r.zhi !== item.zhi || r.wuxing !== item.wuxing)) issues.push('branch-blade-candidate-evidence-mismatch');
        }
        return freeze({ valid:!issues.length,issues:[...new Set(issues)] });
    };
    const unresolvedTargetInput = (sourceCase,candidates) => {
        const unit = { ...copy(ANNOTATION.relationUnits[0]),target:{ ...copy(ANNOTATION.relationUnits[0].target),
            chartBindingEvidence:{ explicitCardinality:null,scope:null,targetCandidateKeys:candidates.map((c) => c.actorKey),sourceActorKeys:[] } } };
        const record = {
            id:'CF-TSBI-NORMALIZED-01',sourceCaseId:sourceCase.id,annotationId:ANNOTATION.id,
            sourceId:sourceCase.sourceId,sourceText:sourceCase.sourceText,chartKey:sourceCase.chartKey,
            sourceContextType:'chart-case',sourcePredicateType:'relation-event',annotationDisposition:'relation-target-present',
            contextSpans:copy(normalizer.normalizeContextSpans(ANNOTATION)),configurationSpans:[],
            relationUnits:[copy(normalizer.normalizeRelationUnit(sourceCase,unit,[],[]))],
            sourceEvidenceIds:[sourceCase.id,ANNOTATION.id,DEFINITION_SOURCE.id,BLADE_REVIEW.id],
            provenance:copy(sourceCase),relationEffect:null,membershipMutation:null,relativeDominance:null,numericScore:null,scalarForce:null
        };
        const validation = normalizedContract.validateNormalizedRecord(record);
        return freeze({ ...record,validation,normalizationState:normalizedContract.NORMALIZATION_STATES.UNRESOLVED,
            blockerReasons:[...validation.errors,'source-specific-blade-selection-and-cardinality-unresolved'] });
    };
    const evaluateAudit = (input,context = {}) => {
        const sourceValidation = validateSourceInput(input),chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const base = { sourceValidation,chartKey,originalOperands:[],transformationEvent:null,transformedResult:null,bladeCandidates:[],
            targetIdentity:null,normalizedInput:null,targetResolution:null,executionInput:null,execution:null,
            transformedSourceEndpointResolved:false,bladeTargetEndpointResolved:false,relationRealizationResolved:false,
            effectAuthorizationResolved:false,executionAuthorized:false,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null };
        const result = (status,blockerReasons = [],extra = {}) => freeze({ ...base,status,blockerReasons,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== TRANSFORMATION_REVIEW.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-alternate-source-case']);
        const inventoryValidation = validateInventory(context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const originalOperands = copy(TRANSFORMATION_REVIEW.inputOperands),bladeCandidates = copy(BLADE_REVIEW.candidates);
        const transformationEvent = { id:TRANSFORMATION_REVIEW.id,sourceCaseId:TRANSFORMATION_REVIEW.sourceCaseId,
            eventSpan:TRANSFORMATION_REVIEW.eventSpan,sourceAssertionState:TRANSFORMATION_REVIEW.sourceAssertionState,
            inputActorKeys:originalOperands.map((o) => o.actorKey),inputKind:'compound-original-operands',resultNodeId:TRANSFORMATION_REVIEW.resultNodeId,
            genericTransformationComputed:false };
        const transformedResult = { id:TRANSFORMATION_REVIEW.resultNodeId,nodeKind:TRANSFORMATION_REVIEW.resultNodeKind,
            sourceSpan:TRANSFORMATION_REVIEW.resultSpan,elementLabel:TRANSFORMATION_REVIEW.resultElementLabel,roleLabel:TRANSFORMATION_REVIEW.resultRoleLabel,
            normalizedTenGodClass:null,actorKey:null,endpointType:null,stem:null,polarity:null,cardinality:null,
            identityState:'unresolved-executable-transformed-result',inputActorsAreResult:false,sourceCaseScoped:true };
        const targetIdentity = { state:'unresolved-source-specific-blade-target',actorKey:null,groupId:null,endpointType:null,
            cardinality:null,scope:null,selectedCandidateKeys:[],memberActorKeys:[],candidateCount:bladeCandidates.length,
            candidateCountIsTargetCardinality:false,sourceSpecificMembershipComplete:false };
        const normalizedInput = unresolvedTargetInput(input.upstreamInput.sourceCase,bladeCandidates);
        const targetResolution = resolver.resolveRecord(normalizedInput);
        const executionInput = { id:`CF-TSBI-REFUSAL:${chartKey}::${BLADE_REVIEW.sourcePathId}`,sourceEndpoint:null,
            targetResolution,relationIdentity:{ id:BLADE_REVIEW.sourcePathId,functionType:null,directed:true },
            realizationState:'unresolved-realization',authorization:{ state:'unresolved-effect-type-authorization',sourceBacked:false,
                relationTypes:[],authorityIds:[],sourceEvidenceIds:[] } };
        const executed = kernel.executeRelationEffect(executionInput);
        return result(STATES.AUDITED,['transformed-result-endpoint-identity-and-materialization-unresolved',
            'source-specific-blade-selection-and-cardinality-unresolved','alternate-relation-realization-and-effect-authorization-unresolved'],{
            inventoryValidation,originalOperands,transformationEvent,transformedResult,bladeCandidates,targetIdentity,
            normalizedInput,targetResolution,executionInput,execution:executed,
            sourceOutcomeAssertion:{ span:ANNOTATION.relationUnits[0].relationClauseSpan,state:'asserted-source-outcome',
                assertionIsExecutableRealization:false,negativeOfficerPathIsAlternateLicense:false }
        });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const sourceValidation = validateSourceInput(inputForCase());
        const result = evaluateAudit(inputForCase(),{ chartKey:realization.buildStructuredChartKey(semanticModel,synthesis) || null,
            inventory:synthesis.contextualForcePartyMembershipInventory });
        return freeze({ status:'transformed-source-blade-identity-audit-evaluated',sourceValidation,result,
            finiteSourceAnnotationCoverageComplete:sourceValidation.valid,sourceCaseCount:1,additionalDefinitionSourceCount:1,
            newPositiveEffectSourceCaseCount:0,originalOperandIdentityIntroduced:true,transformedResultSemanticsAnnotated:true,
            verifiedRuntimeOperandCount:result.originalOperands.length,verifiedRuntimeBladeCandidateCount:result.bladeCandidates.length,
            resolvedRuntimeAlternatePathCount:0,transformedSourceEndpointResolved:false,bladeTargetEndpointResolved:false,
            genericTransformationResolverDefined:false,genericBladeTargetResolverDefined:false,broaderSourceCoverageComplete:false,
            transferredR11TargetCount:0,relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartyTransformedSourceBladeIdentityAuditProfile = freeze({
        installed:true,VERSION,RULE_ID,STATES,CONTRACT,inputForCase,validateSourceInput,evaluateAudit,buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
