(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';
    const ADAPTER_REF = 'TEA-LINE-001';
    const SUPPORTED_DUTIES = Object.freeze([
        'travel_execution',
        'travel_safety',
        'travel_disruption_journey',
        'travel_disruption_transport'
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
        'DESIGN-ONLY',
        'TRAVEL',
        alternativeId,
        duty,
        type,
        factRef
    ].join(':');

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
                traceRefs:[ADAPTER_REF]
            };
        }

        const evidence = [];
        const ignoredFactRefs = [];

        input.travelerFacts.forEach((fact) => {
            if (input.duty === 'travel_execution' && fact.sourceCode === 'VOID') {
                evidence.push({
                    id:evidenceId({
                        alternativeId:input.alternativeId,
                        duty:input.duty,
                        type:'traveler_void',
                        factRef:fact.factRef
                    }),
                    type:'traveler_void',
                    polarity:'negative',
                    sourceFactRefs:[fact.factRef],
                    sourceAdapterRef:ADAPTER_REF,
                    formalEligible:false,
                    traceRefs:[ADAPTER_REF, fact.factRef]
                });
            } else {
                ignoredFactRefs.push(fact.factRef);
            }
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
        admittedMappings:[{
            duty:'travel_execution',
            sourceCode:'VOID',
            evidenceType:'traveler_void',
            polarity:'negative'
        }],
        explicitlyNotAdmitted:[
            'VOID->travel_safety',
            'statusTag.type->assessment polarity',
            'SEASON_STATE/MONTH_*/DAY_*->traveler_vitality'
        ],
        buildsVitalitySummary:false,
        scoringEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoTravelLineEvidenceAdapterPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        adapterRef:ADAPTER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        SUPPORTED_DUTIES,
        validateInput,
        evidenceId,
        buildEvidencePacket,
        describeAdapter
    });
})(typeof window !== 'undefined' ? window : globalThis);
