(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';
    const SOURCE_REF = 'liuyao-core.buildShiYingSummary';

    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra = {}) => ({ code, ...extra });

    const validateInput = ({ readingRef, facts } = {}) => {
        const issues = [];
        if (!hasText(readingRef)) issues.push(issue('reading_ref_required'));
        if (!Array.isArray(facts)) {
            issues.push(issue('shi_ying_facts_array_required'));
        } else {
            const seen = new Set();
            facts.forEach((fact,index) => {
                if (!fact || typeof fact !== 'object' || Array.isArray(fact)) {
                    issues.push(issue('shi_ying_fact_object_required',{index}));
                    return;
                }
                if (!hasText(fact.code)) issues.push(issue('shi_ying_fact_code_required',{index}));
                else if (seen.has(fact.code)) issues.push(issue('duplicate_shi_ying_fact_code',{code:fact.code}));
                else seen.add(fact.code);
                if (!hasText(fact.text)) issues.push(issue('shi_ying_fact_text_required',{index}));
                if (fact.family && fact.family !== 'shi-ying') issues.push(issue('shi_ying_family_required',{index,family:fact.family}));
                if (!Array.isArray(fact.members)) issues.push(issue('shi_ying_members_array_required',{index,code:fact.code || null}));
            });
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const factRefFor = (readingRef, code) => `READING:${readingRef}:SHI-YING:${String(code)}`;

    const buildAtomicFacts = (input = {}) => {
        const validation = validateInput(input);
        if (validation.status !== 'valid') return { status:'invalid', facts:[], issues:validation.issues, formalEligible:false };
        const facts = input.facts.map((fact) => ({
            factRef:factRefFor(input.readingRef,fact.code),
            schemaVersion:VERSION,
            readingRef:input.readingRef,
            sourceLayer:'liuyao_shi_ying_structure',
            sourceRef:SOURCE_REF,
            sourceCode:fact.code,
            sourceType:hasText(fact.type) ? fact.type : 'neutral',
            family:'shi_ying_relation',
            atomic:true,
            conclusionShaped:false,
            formalEligible:false,
            currentRuntimeReachable:false,
            members:(fact.members || []).map((member) => ({ ...member })),
            text:fact.text,
            traceRefs:[SOURCE_REF,`reading:${input.readingRef}`,`shi-ying:${fact.code}`]
        }));
        return { status:'resolved', facts, issues:[], formalEligible:false };
    };

    const findFactByCode = (result, code) => Array.isArray(result?.facts)
        ? result.facts.find((fact) => fact.sourceCode === code) || null
        : null;

    const describeAdapter = () => ({
        version:VERSION,
        status:STATUS,
        sourceRef:SOURCE_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        readingRefRequired:true,
        recomputesElementRelation:false,
        recomputesBranchHarmony:false,
        recomputesBranchClash:false,
        recomputesMovement:false,
        recomputesVoid:false,
        directionalAssessmentEnabled:false,
        scoringEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoShiYingFactAdapterPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        SOURCE_REF,
        validateInput,
        factRefFor,
        buildAtomicFacts,
        findFactByCode,
        describeAdapter
    });
})(typeof window !== 'undefined' ? window : globalThis);
