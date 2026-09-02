(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';
    const ADAPTER_REF = 'TEA-TRANSPORT-DELAY-001';
    const DUTY = 'travel_disruption_transport';

    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra = {}) => ({ code, ...extra });

    const validateBinding = (binding) => {
        const issues = [];
        if (!binding || typeof binding !== 'object' || Array.isArray(binding)) {
            return { status:'invalid', issues:[issue('transport_binding_object_required')] };
        }
        if (binding.status !== 'resolved') issues.push(issue('transport_binding_must_be_resolved',{value:binding.status || null}));
        if (!hasText(binding.bindingRef)) issues.push(issue('transport_binding_ref_required'));
        if (binding.objectClass !== 'transport_operation') issues.push(issue('transport_object_class_required',{value:binding.objectClass || null}));
        if (binding.relation !== '父母') issues.push(issue('transport_parent_relation_required',{value:binding.relation || null}));
        const position = Number(binding.position);
        if (!Number.isInteger(position) || position < 1 || position > 6) issues.push(issue('transport_line_position_invalid',{value:binding.position ?? null}));
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const validateInput = (input = {}) => {
        const issues = [];
        if (!hasText(input.readingRef)) issues.push(issue('reading_ref_required'));
        if (input.duty !== DUTY) issues.push(issue('transport_disruption_duty_required',{value:input.duty || null}));
        if (Object.prototype.hasOwnProperty.call(input,'transportDisrupted')) issues.push(issue('conclusion_shaped_transport_disrupted_forbidden'));
        const bindingValidation = validateBinding(input.transportBinding);
        issues.push(...bindingValidation.issues);
        if (!Array.isArray(input.moveFacts)) {
            issues.push(issue('move_facts_array_required'));
        } else {
            const refs = new Set();
            input.moveFacts.forEach((fact,index) => {
                if (!fact || typeof fact !== 'object' || Array.isArray(fact)) {
                    issues.push(issue('move_fact_object_required',{index}));
                    return;
                }
                if (!hasText(fact.factRef)) issues.push(issue('move_fact_ref_required',{index}));
                else if (refs.has(fact.factRef)) issues.push(issue('move_fact_ref_duplicate',{factRef:fact.factRef}));
                else refs.add(fact.factRef);
                if (fact.readingRef !== input.readingRef) issues.push(issue('move_fact_reading_scope_mismatch',{index,factRef:fact.factRef || null,factReadingRef:fact.readingRef || null}));
                if (fact.sourceLayer !== 'liuyao_move_analysis') issues.push(issue('move_analysis_source_required',{index,sourceLayer:fact.sourceLayer || null}));
                if (!hasText(fact.sourceCode)) issues.push(issue('move_fact_source_code_required',{index}));
                if (fact.atomic !== true) issues.push(issue('atomic_fact_required',{index,factRef:fact.factRef || null}));
                if (fact.conclusionShaped === true) issues.push(issue('conclusion_shaped_fact_forbidden',{index,factRef:fact.factRef || null}));
                if (bindingValidation.status === 'valid' && Number(fact.subjectRef?.position) !== Number(input.transportBinding.position)) {
                    issues.push(issue('move_fact_transport_line_mismatch',{index,factRef:fact.factRef || null,factPosition:fact.subjectRef?.position ?? null,bindingPosition:input.transportBinding.position}));
                }
            });
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const evidenceId = (input, fact) => `READING:${input.readingRef}:TRAVEL:${DUTY}:BINDING:${input.transportBinding.bindingRef}:transport_delay_or_postponement:${fact.factRef}`;

    const buildEvidence = (input = {}) => {
        const validation = validateInput(input);
        if (validation.status !== 'valid') {
            return {
                readingRef:hasText(input.readingRef) ? input.readingRef : null,
                duty:input.duty || null,
                bindingRef:hasText(input.transportBinding?.bindingRef) ? input.transportBinding.bindingRef : null,
                resolutionStatus:'unresolved',
                evidence:[],
                ignoredFactRefs:[],
                issues:validation.issues,
                formalEligible:false,
                traceRefs:[ADAPTER_REF]
            };
        }
        const evidence = [];
        const ignoredFactRefs = [];
        input.moveFacts.forEach((fact) => {
            if (fact.sourceCode === 'RETREAT') {
                evidence.push({
                    id:evidenceId(input,fact),
                    readingRef:input.readingRef,
                    duty:DUTY,
                    type:'transport_delay_or_postponement',
                    polarity:'negative',
                    semanticMeaning:'transport_operation_delay_evidence',
                    transportBindingRef:input.transportBinding.bindingRef,
                    transportLinePosition:Number(input.transportBinding.position),
                    sourceFactRefs:[fact.factRef],
                    sourceAdapterRef:ADAPTER_REF,
                    sourceCode:fact.sourceCode,
                    formalEligible:false,
                    traceRefs:[ADAPTER_REF,input.transportBinding.bindingRef,fact.factRef]
                });
            } else {
                ignoredFactRefs.push(fact.factRef);
            }
        });
        return {
            readingRef:input.readingRef,
            duty:DUTY,
            bindingRef:input.transportBinding.bindingRef,
            resolutionStatus:'resolved',
            evidence,
            ignoredFactRefs,
            issues:[],
            formalEligible:false,
            traceRefs:[ADAPTER_REF,input.transportBinding.bindingRef]
        };
    };

    const describeAdapter = () => ({
        version:VERSION,
        status:STATUS,
        adapterRef:ADAPTER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        duty:DUTY,
        evidenceOnly:true,
        assessmentReady:false,
        comparatorReady:false,
        transportBindingMustBeResolved:true,
        resolvesTransportObject:false,
        admittedSourceCodes:['RETREAT'],
        ignoredSourceCodesByDefault:['PROGRESS','RETURN_CONTROL','RETURN_GENERATE','RETURN_HARMONY','RETURN_CLASH','TRANSFORM_VOID','TRANSFORM_MONTH_BREAK','TRANSFORM_TOMB','TRANSFORM_EXTINCTION','MOVING_CHANGE'],
        absenceOfRetreatMeansOnTime:false,
        conclusionShapedBooleanAccepted:false,
        evidenceCountingEnabled:false,
        scoringEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoTravelTransportDelayEvidenceAdapterPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        adapterRef:ADAPTER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        validateBinding,
        validateInput,
        evidenceId,
        buildEvidence,
        describeAdapter
    });
})(typeof window !== 'undefined' ? window : globalThis);
