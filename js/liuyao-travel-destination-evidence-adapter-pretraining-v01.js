(function (global) {
    'use strict';

    const GuiJia=global.GuiJia=global.GuiJia||{};
    const VERSION='0.1';
    const STATUS='design_only_unreachable';
    const ADAPTER_REF='TEA-DEST-001';
    const hasText=(value)=>typeof value==='string'&&value.trim().length>0;
    const issue=(code,extra={})=>({code,...extra});

    const validateInput=({readingRef,alternativeId,duty,travelerRelationToQuerent,destinationSelector,destinationRelevance,shiYingFacts}={})=>{
        const issues=[];
        if(!hasText(readingRef))issues.push(issue('reading_ref_required'));
        if(!hasText(alternativeId))issues.push(issue('alternative_id_required'));
        if(duty!=='travel_execution')issues.push(issue('travel_execution_duty_required',{value:duty||null}));
        if(!hasText(travelerRelationToQuerent))issues.push(issue('traveler_relation_required'));
        if(!hasText(destinationSelector))issues.push(issue('destination_selector_required'));
        if(!['explicit','context_supported','not_indicated','unknown'].includes(destinationRelevance))issues.push(issue('destination_relevance_invalid',{value:destinationRelevance||null}));
        if(!Array.isArray(shiYingFacts)){
            issues.push(issue('shi_ying_facts_array_required'));
        }else{
            const refs=new Set();
            shiYingFacts.forEach((fact,index)=>{
                if(!fact||typeof fact!=='object'||Array.isArray(fact)){issues.push(issue('shi_ying_fact_object_required',{index}));return;}
                if(!hasText(fact.factRef))issues.push(issue('shi_ying_fact_ref_required',{index}));
                else if(refs.has(fact.factRef))issues.push(issue('shi_ying_fact_ref_duplicate',{factRef:fact.factRef}));
                else refs.add(fact.factRef);
                if(fact.readingRef!==readingRef)issues.push(issue('shi_ying_fact_reading_scope_mismatch',{index,factRef:fact.factRef||null,factReadingRef:fact.readingRef||null}));
                if(fact.sourceLayer!=='liuyao_shi_ying_structure')issues.push(issue('shi_ying_source_required',{index,sourceLayer:fact.sourceLayer||null}));
                if(!hasText(fact.sourceCode))issues.push(issue('shi_ying_source_code_required',{index}));
                if(fact.atomic!==true)issues.push(issue('atomic_fact_required',{index,factRef:fact.factRef||null}));
            });
        }
        return {status:issues.length?'invalid':'valid',issues};
    };

    const evidenceId=({readingRef,alternativeId,type,factRef})=>`READING:${readingRef}:ALT:${alternativeId}:TRAVEL:travel_execution:${type}:${factRef}`;
    const makeEvidence=(input,fact,type,polarity)=>({id:evidenceId({readingRef:input.readingRef,alternativeId:input.alternativeId,type,factRef:fact.factRef}),readingRef:input.readingRef,alternativeId:input.alternativeId,type,polarity,sourceFactRefs:[fact.factRef],sourceAdapterRef:ADAPTER_REF,sourceCode:fact.sourceCode,travelerRoleBinding:'shi',destinationRoleBinding:'ying',formalEligible:false,traceRefs:[ADAPTER_REF,fact.factRef]});

    const buildEvidenceComponent=(input={})=>{
        const validation=validateInput(input);
        if(validation.status!=='valid')return {readingRef:hasText(input.readingRef)?input.readingRef:null,alternativeId:hasText(input.alternativeId)?input.alternativeId:null,duty:input.duty||null,resolutionStatus:'unresolved',evidence:[],ignoredFactRefs:[],issues:validation.issues,formalEligible:false,traceRefs:[ADAPTER_REF]};

        if(input.travelerRelationToQuerent!=='self')return {readingRef:input.readingRef,alternativeId:input.alternativeId,duty:input.duty,resolutionStatus:'not_applicable',evidence:[],ignoredFactRefs:input.shiYingFacts.map((fact)=>fact.factRef),issues:[issue('represented_traveler_requires_general_line_relation_provider')],formalEligible:false,traceRefs:[ADAPTER_REF]};
        if(input.destinationSelector!=='ying'||!['explicit','context_supported'].includes(input.destinationRelevance))return {readingRef:input.readingRef,alternativeId:input.alternativeId,duty:input.duty,resolutionStatus:'not_applicable',evidence:[],ignoredFactRefs:input.shiYingFacts.map((fact)=>fact.factRef),issues:[],formalEligible:false,traceRefs:[ADAPTER_REF]};

        const evidence=[];
        const ignoredFactRefs=[];
        input.shiYingFacts.forEach((fact)=>{
            if(fact.sourceCode==='SHI_CONTROLS_YING')evidence.push(makeEvidence(input,fact,'traveler_controls_destination','positive'));
            else if(fact.sourceCode==='YING_CONTROLS_SHI')evidence.push(makeEvidence(input,fact,'destination_controls_traveler','negative'));
            else ignoredFactRefs.push(fact.factRef);
        });
        return {readingRef:input.readingRef,alternativeId:input.alternativeId,duty:input.duty,resolutionStatus:'resolved',evidence,ignoredFactRefs,issues:[],formalEligible:false,traceRefs:[ADAPTER_REF]};
    };

    const describeAdapter=()=>({version:VERSION,status:STATUS,adapterRef:ADAPTER_REF,currentRuntimeReachable:false,registered:false,formalEligible:false,readingRefRequired:true,selfTravelerOnly:true,destinationSelectorRequired:'ying',admittedMappings:[{sourceCode:'SHI_CONTROLS_YING',type:'traveler_controls_destination',polarity:'positive'},{sourceCode:'YING_CONTROLS_SHI',type:'destination_controls_traveler',polarity:'negative'}],nonDirectionalSourceCodes:['SHI_GENERATES_YING','YING_GENERATES_SHI','SHI_YING_SAME_ELEMENT','SHI_YING_SIX_HARMONY','SHI_YING_SIX_CLASH','SHI_MOVING','YING_MOVING','SHI_YING_BOTH_MOVING','SHI_VOID','YING_VOID'],scoringEnabled:false,probabilityEnabled:false});

    GuiJia.liuyaoTravelDestinationEvidenceAdapterPretrainingV01=Object.freeze({version:VERSION,status:STATUS,adapterRef:ADAPTER_REF,currentRuntimeReachable:false,registered:false,formalEligible:false,validateInput,evidenceId,buildEvidenceComponent,describeAdapter});
})(typeof window!=='undefined'?window:globalThis);
