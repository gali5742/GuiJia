(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.2';
    const STATUS = 'design_only_unreachable';
    const ADAPTER_REF = 'TEA-LINE-002';
    const SUPPORTED_DUTIES = Object.freeze([
        'travel_execution',
        'travel_safety',
        'travel_disruption_journey',
        'travel_disruption_transport'
    ]);
    const EXECUTION_SUPPORT_CODES = Object.freeze([
        'MONTH_COMMAND','MONTH_GENERATE','MONTH_SUPPORT',
        'DAY_COMMAND','DAY_GENERATE','DAY_SUPPORT'
    ]);
    const EXECUTION_CONSTRAINT_CODES = Object.freeze([
        'MONTH_BREAK','MONTH_CONTROL','DAY_CONTROL','DAY_BREAK'
    ]);
    const EXPLICITLY_NON_DIRECTIONAL_CODES = Object.freeze([
        'SEASON_STATE','MONTH_HARMONY','DAY_HARMONY','DAY_CLASH','DARK_MOVING'
    ]);

    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra = {}) => ({ code, ...extra });

    const validateInput = ({ duty, alternativeId, travelerFacts } = {}) => {
        const issues = [];
        if (!SUPPORTED_DUTIES.includes(duty)) issues.push(issue('supported_travel_duty_required', { value:duty || null }));
        if (!hasText(alternativeId)) issues.push(issue('alternative_id_required'));
        if (!Array.isArray(travelerFacts)) {
            issues.push(issue('traveler_facts_array_required'));
        } else {
            const refs = new Set();
            travelerFacts.forEach((fact, index) => {
                if (!fact || typeof fact !== 'object' || Array.isArray(fact)) {
                    issues.push(issue('traveler_fact_object_required', { index }));
                    return;
                }
                if (!hasText(fact.factRef)) issues.push(issue('traveler_fact_ref_required', { index }));
                else if (refs.has(fact.factRef)) issues.push(issue('traveler_fact_ref_duplicate', { factRef:fact.factRef }));
                else refs.add(fact.factRef);
                if (fact.sourceLayer !== 'liuyao_line_status') issues.push(issue('line_status_source_required', { index, sourceLayer:fact.sourceLayer || null }));
                if (!hasText(fact.sourceCode)) issues.push(issue('traveler_fact_source_code_required', { index }));
                if (fact.atomic !== true) issues.push(issue('atomic_fact_required', { index, factRef:fact.factRef || null }));
                if (fact.conclusionShaped === true) issues.push(issue('conclusion_shaped_fact_forbidden', { index, factRef:fact.factRef || null }));
            });
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const evidenceId = ({ alternativeId, duty, type, factRef }) => [
        'DESIGN-ONLY','TRAVEL',alternativeId,duty,type,factRef
    ].join(':');

    const makeEvidence = (input, fact, type, polarity) => ({
        id:evidenceId({ alternativeId:input.alternativeId, duty:input.duty, type, factRef:fact.factRef }),
        type,
        polarity,
        sourceFactRefs:[fact.factRef],
        sourceAdapterRef:ADAPTER_REF,
        sourceCode:fact.sourceCode,
        formalEligible:false,
        traceRefs:[ADAPTER_REF, fact.factRef]
    });

    const buildEvidencePacket = (input = {}) => {
        const validation = validateInput(input);
        if (validation.status !== 'valid') {
            return {
                duty:input?.duty || null,
                alternativeId:hasText(input?.alternativeId) ? input.alternativeId : null,
                resolutionStatus:'unresolved',
                evidence:[],
                issues:validation.issues,
                formalEligible:false,
                ignoredFactRefs:[],
                traceRefs:[ADAPTER_REF]
            };
        }

        const evidence = [];
        const ignoredFactRefs = [];
        input.travelerFacts.forEach((fact) => {
            if (input.duty !== 'travel_execution') {
                ignoredFactRefs.push(fact.factRef);
                return;
            }
            if (EXECUTION_SUPPORT_CODES.includes(fact.sourceCode)) {
                evidence.push(makeEvidence(input, fact, 'traveler_calendar_support', 'positive'));
                return;
            }
            if (EXECUTION_CONSTRAINT_CODES.includes(fact.sourceCode)) {
                evidence.push(makeEvidence(input, fact, 'traveler_calendar_constraint', 'negative'));
                return;
            }
            if (fact.sourceCode === 'VOID') {
                evidence.push(makeEvidence(input, fact, 'traveler_void', 'negative'));
                return;
            }
            ignoredFactRefs.push(fact.factRef);
        });

        return {
            duty:input.duty,
            alternativeId:input.alternativeId,
            resolutionStatus:'resolved',
            evidence,
            issues:[],
            formalEligible:false,
            ignoredFactRefs,
            traceRefs:[ADAPTER_REF]
        };
    };

    const describeAdapter = () => ({
        version:VERSION,
        status:STATUS,
        adapterRef:ADAPTER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        supportedDuties:[...SUPPORTED_DUTIES],
        executionSupportCodes:[...EXECUTION_SUPPORT_CODES],
        executionConstraintCodes:[...EXECUTION_CONSTRAINT_CODES],
        explicitlyNonDirectionalCodes:[...EXPLICITLY_NON_DIRECTIONAL_CODES],
        outputEvidenceTypes:['traveler_calendar_support','traveler_calendar_constraint','traveler_void'],
        travelerVitalityEmitted:false,
        statusTagCountingEnabled:false,
        scoringEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoTravelLineEvidenceAdapterPretrainingV02 = Object.freeze({
        version:VERSION,
        status:STATUS,
        adapterRef:ADAPTER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        SUPPORTED_DUTIES,
        EXECUTION_SUPPORT_CODES,
        EXECUTION_CONSTRAINT_CODES,
        EXPLICITLY_NON_DIRECTIONAL_CODES,
        validateInput,
        evidenceId,
        buildEvidencePacket,
        describeAdapter
    });
})(typeof window !== 'undefined' ? window : globalThis);
