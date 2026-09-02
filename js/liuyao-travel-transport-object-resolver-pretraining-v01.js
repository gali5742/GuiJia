(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'isolated_partial_safe_subset_not_registered';
    const RESOLVER_REF = 'PRR-TRAVEL-TRANSPORT-OBJECT';
    const ALLOWED_SPECIFICITY = Object.freeze(['specific_service','specific_vehicle','context_bounded']);
    const ALLOWED_RELEVANCE = Object.freeze(['explicit','context_supported']);

    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra = {}) => ({ code, ...extra });

    const validateInput = (input = {}) => {
        const issues = [];
        if (!hasText(input.readingRef)) issues.push(issue('reading_ref_required'));
        if (input.travelDuty !== 'travel_disruption_transport') issues.push(issue('transport_disruption_duty_required',{value:input.travelDuty || null}));
        if (input.currentTargetAspect !== 'transport_operation') issues.push(issue('transport_operation_target_required',{value:input.currentTargetAspect || null}));
        if (!input.transportContext || typeof input.transportContext !== 'object' || Array.isArray(input.transportContext)) {
            issues.push(issue('transport_context_object_required'));
        } else {
            if (!ALLOWED_SPECIFICITY.includes(input.transportContext.specificity)) issues.push(issue('transport_context_not_specific_enough',{value:input.transportContext.specificity || null}));
            if (!ALLOWED_RELEVANCE.includes(input.transportContext.relevance)) issues.push(issue('transport_context_not_relevant',{value:input.transportContext.relevance || null}));
        }
        if (!Array.isArray(input.candidateTargets)) {
            issues.push(issue('candidate_targets_array_required'));
        } else {
            const keys = new Set();
            input.candidateTargets.forEach((target,index) => {
                if (!target || typeof target !== 'object' || Array.isArray(target)) {
                    issues.push(issue('candidate_target_object_required',{index}));
                    return;
                }
                if (!hasText(target.key)) issues.push(issue('candidate_target_key_required',{index}));
                else if (keys.has(target.key)) issues.push(issue('candidate_target_key_duplicate',{key:target.key}));
                else keys.add(target.key);
                if (!['line','hidden'].includes(target.type)) issues.push(issue('candidate_target_type_invalid',{index,value:target.type || null}));
                const position = Number(target.position);
                if (!Number.isInteger(position) || position < 1 || position > 6) issues.push(issue('candidate_target_position_invalid',{index,value:target.position ?? null}));
                if (target.relation !== '父母') issues.push(issue('candidate_target_parent_relation_required',{index,value:target.relation || null}));
            });
        }
        for (const forbidden of ['moveTags','statusTags','assessmentStatus','polarity','score','probability']) {
            if (Object.prototype.hasOwnProperty.call(input,forbidden)) issues.push(issue('outcome_or_state_selector_input_forbidden',{field:forbidden}));
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const unresolved = (input, reason, issues = []) => ({
        version:VERSION,
        resolverRef:RESOLVER_REF,
        status:'unresolved',
        readingRef:hasText(input?.readingRef) ? input.readingRef : null,
        binding:null,
        reason,
        issues:[...issues],
        provisional:true,
        formalEligible:false,
        currentRuntimeReachable:false,
        traceRefs:[RESOLVER_REF]
    });

    const resolveTransportObject = (input = {}) => {
        const validation = validateInput(input);
        if (validation.status !== 'valid') return unresolved(input,'invalid_transport_resolver_input',validation.issues);

        const hidden = input.candidateTargets.filter((target) => target.type === 'hidden');
        const visible = input.candidateTargets.filter((target) => target.type === 'line');
        if (visible.length === 0) {
            return unresolved(
                input,
                hidden.length ? 'hidden_transport_mapping_not_reviewed' : 'no_visible_transport_parent_candidate',
                hidden.length ? [issue('hidden_transport_mapping_not_reviewed',{hiddenCandidateCount:hidden.length})] : []
            );
        }
        if (visible.length > 1) {
            return unresolved(input,'multiple_transport_parent_candidates',[issue('multiple_transport_parent_candidates',{count:visible.length,candidateKeys:visible.map((target)=>target.key)})]);
        }
        if (hidden.length > 0) {
            return unresolved(input,'visible_plus_hidden_transport_ambiguity_not_reviewed',[issue('visible_plus_hidden_transport_ambiguity_not_reviewed',{visibleCandidate:visible[0].key,hiddenCandidateCount:hidden.length})]);
        }

        const target = visible[0];
        const bindingRef = `READING:${input.readingRef}:TRANSPORT:${target.key}`;
        return {
            version:VERSION,
            resolverRef:RESOLVER_REF,
            status:'resolved',
            readingRef:input.readingRef,
            binding:{
                status:'resolved',
                bindingRef,
                objectClass:'transport_operation',
                relation:'父母',
                position:Number(target.position),
                targetKey:target.key,
                targetType:'line'
            },
            reason:'sole_visible_parent_candidate_under_specific_transport_target',
            issues:[],
            provisional:true,
            formalEligible:false,
            currentRuntimeReachable:false,
            traceRefs:[RESOLVER_REF,target.key]
        };
    };

    const describeResolver = () => ({
        version:VERSION,
        status:STATUS,
        resolverRef:RESOLVER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        safeSubsetOnly:true,
        exactCurrentTargetRequired:'transport_operation',
        exactDutyRequired:'travel_disruption_transport',
        admittedSpecificity:[...ALLOWED_SPECIFICITY],
        admittedRelevance:[...ALLOWED_RELEVANCE],
        soleVisibleParentRequired:true,
        hiddenCandidateResolutionEnabled:false,
        multipleCandidateResolutionEnabled:false,
        readsMoveState:false,
        readsLineStrength:false,
        firstMatchEnabled:false,
        scoringEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoTravelTransportObjectResolverPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        resolverRef:RESOLVER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        ALLOWED_SPECIFICITY,
        ALLOWED_RELEVANCE,
        validateInput,
        resolveTransportObject,
        describeResolver
    });
})(typeof window !== 'undefined' ? window : globalThis);
