(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.2';
    const STATUS = 'design_only_no_active_ordering_comparators';
    const RESOLUTION_STATUSES = Object.freeze(['resolved','partial','unresolved','not_applicable']);
    const ASSESSMENT_STATUSES = Object.freeze(['supportive_evidence','adverse_evidence','mixed_evidence','insufficient_evidence','not_assessed']);
    const FORBIDDEN_ASSESSMENT_OUTPUTS = Object.freeze(['probability','scalarScore','overallRecommendation','winner']);
    const ACTIVE_COMPARATORS = Object.freeze([]);
    const issue = (code, extra = {}) => ({code,...extra});
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

    const validateDimensionAssessment = (assessment) => {
        const issues = [];
        if (!assessment || typeof assessment !== 'object' || Array.isArray(assessment)) return {status:'invalid',issues:[issue('assessment_object_required')]};
        if (!hasText(assessment.readingRef)) issues.push(issue('reading_ref_required'));
        if (!hasText(assessment.alternativeId)) issues.push(issue('alternative_id_required'));
        if (!hasText(assessment.dimensionId)) issues.push(issue('dimension_id_required'));
        if (!hasText(assessment.semanticMeaning)) issues.push(issue('semantic_meaning_required'));
        if (!RESOLUTION_STATUSES.includes(assessment.resolutionStatus)) issues.push(issue('resolution_status_invalid',{value:assessment.resolutionStatus || null}));
        if (!ASSESSMENT_STATUSES.includes(assessment.assessmentStatus)) issues.push(issue('assessment_status_invalid',{value:assessment.assessmentStatus || null}));
        if (!hasText(assessment.contractFamily)) issues.push(issue('contract_family_required'));
        if (!hasText(assessment.contractRef)) issues.push(issue('contract_ref_required'));
        if (!hasText(assessment.contractVersion)) issues.push(issue('contract_version_required'));
        if (!Array.isArray(assessment.evidenceRefs)) issues.push(issue('evidence_refs_array_required'));
        else if (assessment.evidenceRefs.some((ref) => !hasText(ref))) issues.push(issue('evidence_ref_invalid'));
        FORBIDDEN_ASSESSMENT_OUTPUTS.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(assessment,key)) issues.push(issue('forbidden_comparator_input_output_field',{field:key}));
        });
        return {status:issues.length ? 'invalid' : 'valid',issues};
    };

    const baseResult = (left,right) => ({
        version:VERSION,
        readingRefs:[left?.readingRef || null,right?.readingRef || null],
        dimensionId:left?.dimensionId || right?.dimensionId || null,
        alternativeIds:[left?.alternativeId || null,right?.alternativeId || null],
        comparisonStatus:'incomparable',
        relation:null,
        comparatorRef:null,
        comparatorVersion:null,
        reason:null,
        issues:[]
    });

    const resolutionGate = (left,right) => {
        const statuses=[left.resolutionStatus,right.resolutionStatus];
        if (statuses.includes('unresolved')) return {comparisonStatus:'unresolved',reason:'resolution_unresolved'};
        if (statuses.includes('partial')) return {comparisonStatus:'partial',reason:'resolution_partial'};
        if (statuses.includes('not_applicable')) return {comparisonStatus:'incomparable',reason:'dimension_not_applicable'};
        return null;
    };

    const compareDimensionAssessments = (left,right) => {
        const result=baseResult(left,right);
        const leftValidation=validateDimensionAssessment(left);
        const rightValidation=validateDimensionAssessment(right);
        if (leftValidation.status !== 'valid' || rightValidation.status !== 'valid') {
            result.comparisonStatus='unresolved';
            result.reason='invalid_assessment_contract';
            result.issues=[
                ...leftValidation.issues.map((item)=>({side:'left',...item})),
                ...rightValidation.issues.map((item)=>({side:'right',...item}))
            ];
            return result;
        }
        if (left.dimensionId !== right.dimensionId) { result.reason='dimension_mismatch'; return result; }
        if (left.semanticMeaning !== right.semanticMeaning) { result.reason='semantic_meaning_mismatch'; return result; }
        if (left.contractFamily !== right.contractFamily) { result.reason='contract_family_mismatch'; return result; }
        if (left.readingRef !== right.readingRef) { result.reason='reading_scope_mismatch'; return result; }
        const gated=resolutionGate(left,right);
        if (gated) {
            result.comparisonStatus=gated.comparisonStatus;
            result.reason=gated.reason;
            return result;
        }
        result.reason=ACTIVE_COMPARATORS.length ? 'compatible_comparator_not_selected' : 'comparator_not_registered';
        return result;
    };

    const buildComparatorReadiness = () => ({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        activeComparatorCount:ACTIVE_COMPARATORS.length,
        activeComparators:[...ACTIVE_COMPARATORS],
        readingRefRequired:true,
        sameReadingRequired:true,
        crossReadingComparisonAllowed:false,
        orderingEnabled:false,
        winnerEnabled:false,
        scalarScoreEnabled:false,
        probabilityEnabled:false,
        fallbackHeuristicEnabled:false
    });

    GuiJia.liuyaoDomainComparatorPretrainingV02 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        RESOLUTION_STATUSES,
        ASSESSMENT_STATUSES,
        ACTIVE_COMPARATORS,
        validateDimensionAssessment,
        compareDimensionAssessments,
        buildComparatorReadiness
    });
})(typeof window !== 'undefined' ? window : globalThis);
