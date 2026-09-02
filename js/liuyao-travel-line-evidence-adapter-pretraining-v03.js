(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.3';
    const STATUS = 'design_only_unreachable';
    const ADAPTER_REF = 'TEA-LINE-003';
    const SUPPORT_CODES = Object.freeze(['MONTH_COMMAND','MONTH_GENERATE','MONTH_SUPPORT','DAY_COMMAND','DAY_GENERATE','DAY_SUPPORT']);
    const CONSTRAINT_CODES = Object.freeze(['MONTH_BREAK','MONTH_CONTROL','DAY_CONTROL','DAY_BREAK']);
    const NON_DIRECTIONAL_CODES = Object.freeze(['SEASON_STATE','MONTH_HARMONY','DAY_HARMONY','DAY_CLASH','DARK_MOVING']);
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra={}) => ({code,...extra});

    const validateInput = ({readingRef,alternativeId,duty,travelerFacts}={}) => {
        const issues=[];
        if (!hasText(readingRef)) issues.push(issue('reading_ref_required'));
        if (!hasText(alternativeId)) issues.push(issue('alternative_id_required'));
        if (duty !== 'travel_execution') issues.push(issue('travel_execution_duty_required',{value:duty || null}));
        if (!Array.isArray(travelerFacts)) {
            issues.push(issue('traveler_facts_array_required'));
        } else {
            const refs=new Set();
            travelerFacts.forEach((fact,index)=>{
                if (!fact || typeof fact !== 'object' || Array.isArray(fact)) { issues.push(issue('traveler_fact_object_required',{index})); return; }
                if (!hasText(fact.factRef)) issues.push(issue('traveler_fact_ref_required',{index}));
                else if (refs.has(fact.factRef)) issues.push(issue('traveler_fact_ref_duplicate',{factRef:fact.factRef}));
                else refs.add(fact.factRef);
                if (fact.readingRef !== readingRef) issues.push(issue('traveler_fact_reading_scope_mismatch',{index,factRef:fact.factRef || null,factReadingRef:fact.readingRef || null}));
                if (fact.sourceLayer !== 'liuyao_line_status') issues.push(issue('line_status_source_required',{index,sourceLayer:fact.sourceLayer || null}));
                if (!hasText(fact.sourceCode)) issues.push(issue('traveler_fact_source_code_required',{index}));
                if (fact.atomic !== true) issues.push(issue('atomic_fact_required',{index,factRef:fact.factRef || null}));
                if (fact.conclusionShaped === true) issues.push(issue('conclusion_shaped_fact_forbidden',{index,factRef:fact.factRef || null}));
            });
        }
        return {status:issues.length ? 'invalid':'valid',issues};
    };

    const evidenceId = ({readingRef,alternativeId,type,factRef}) => `READING:${readingRef}:ALT:${alternativeId}:TRAVEL:travel_execution:${type}:${factRef}`;
    const makeEvidence = (input,fact,type,polarity) => ({
        id:evidenceId({readingRef:input.readingRef,alternativeId:input.alternativeId,type,factRef:fact.factRef}),
        readingRef:input.readingRef,
        alternativeId:input.alternativeId,
        type,
        polarity,
        sourceFactRefs:[fact.factRef],
        sourceAdapterRef:ADAPTER_REF,
        sourceCode:fact.sourceCode,
        formalEligible:false,
        traceRefs:[ADAPTER_REF,fact.factRef]
    });

    const buildEvidenceComponent = (input={}) => {
        const validation=validateInput(input);
        if (validation.status !== 'valid') return {readingRef:hasText(input.readingRef)?input.readingRef:null,alternativeId:hasText(input.alternativeId)?input.alternativeId:null,duty:input.duty || null,resolutionStatus:'unresolved',evidence:[],ignoredFactRefs:[],issues:validation.issues,formalEligible:false,traceRefs:[ADAPTER_REF]};
        const evidence=[];
        const ignoredFactRefs=[];
        input.travelerFacts.forEach((fact)=>{
            if (SUPPORT_CODES.includes(fact.sourceCode)) evidence.push(makeEvidence(input,fact,'traveler_calendar_support','positive'));
            else if (CONSTRAINT_CODES.includes(fact.sourceCode)) evidence.push(makeEvidence(input,fact,'traveler_calendar_constraint','negative'));
            else if (fact.sourceCode === 'VOID') evidence.push(makeEvidence(input,fact,'traveler_void','negative'));
            else ignoredFactRefs.push(fact.factRef);
        });
        return {readingRef:input.readingRef,alternativeId:input.alternativeId,duty:input.duty,resolutionStatus:'resolved',evidence,ignoredFactRefs,issues:[],formalEligible:false,traceRefs:[ADAPTER_REF]};
    };

    const describeAdapter=()=>({version:VERSION,status:STATUS,adapterRef:ADAPTER_REF,currentRuntimeReachable:false,registered:false,formalEligible:false,readingRefRequired:true,outputEvidenceTypes:['traveler_calendar_support','traveler_calendar_constraint','traveler_void'],nonDirectionalCodes:[...NON_DIRECTIONAL_CODES],opaqueTravelerVitalityAccepted:false,statusTagCountingEnabled:false,scoringEnabled:false,probabilityEnabled:false});

    GuiJia.liuyaoTravelLineEvidenceAdapterPretrainingV03=Object.freeze({version:VERSION,status:STATUS,adapterRef:ADAPTER_REF,currentRuntimeReachable:false,registered:false,formalEligible:false,SUPPORT_CODES,CONSTRAINT_CODES,NON_DIRECTIONAL_CODES,validateInput,evidenceId,buildEvidenceComponent,describeAdapter});
})(typeof window !== 'undefined' ? window : globalThis);
