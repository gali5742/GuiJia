(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const assessmentApi = GuiJia.liuyaoDomainAssessmentPretrainingV02;
    const comparatorApi = GuiJia.liuyaoDomainComparatorPretrainingV02;
    if (!assessmentApi?.bindAssessmentForComparison) {
        throw new Error('liuyao-domain-assessment-pretraining-v02.js must be loaded before liuyao-travel-execution-comparator-pretraining-v03.js');
    }
    if (!comparatorApi?.validateDimensionAssessment) {
        throw new Error('liuyao-domain-comparator-pretraining-v02.js must be loaded before liuyao-travel-execution-comparator-pretraining-v03.js');
    }

    const VERSION = '0.3';
    const STATUS = 'isolated_candidate_not_registered';
    const COMPARATOR_REF = 'CP-TV-EXEC-003';
    const DIMENSION_ID = 'target_outcome';
    const SEMANTIC_MEANING = 'journey_execution_outcome';
    const CONTRACT_FAMILY = 'travel_execution_assessment';
    const ASSESSMENT_REF = 'travel_execution_assessment_v0.3';
    const COMPATIBLE_VERSIONS = Object.freeze(['0.3']);

    const resultBase = (left = null, right = null) => ({
        comparatorRef:COMPARATOR_REF,
        comparatorVersion:VERSION,
        readingRefs:[left?.readingRef || null,right?.readingRef || null],
        dimensionId:DIMENSION_ID,
        semanticMeaning:SEMANTIC_MEANING,
        alternativeIds:[left?.alternativeId || null,right?.alternativeId || null],
        comparisonStatus:'incomparable',
        relation:null,
        reasonRefs:[],
        issues:[]
    });

    const reject = (left, right, comparisonStatus, reason, issues = []) => ({
        ...resultBase(left,right),
        comparisonStatus,
        reasonRefs:[`${COMPARATOR_REF}:${reason}`],
        issues:[...issues]
    });

    const bindSide = (assessment, explicitAlternativeId) => {
        const binding = assessmentApi.bindAssessmentForComparison(
            assessment,
            explicitAlternativeId === undefined ? null : explicitAlternativeId
        );
        if (binding.status !== 'bound') return { status:binding.status, input:null, issues:binding.issues || [] };
        const checked = comparatorApi.validateDimensionAssessment(binding.input);
        return checked.status === 'valid'
            ? { status:'bound', input:binding.input, issues:[] }
            : { status:'invalid', input:null, issues:checked.issues || [] };
    };

    const validateIdentity = (input) => {
        const issues = [];
        if (input.dimensionId !== DIMENSION_ID) issues.push({ code:'dimension_mismatch', expected:DIMENSION_ID, actual:input.dimensionId });
        if (input.semanticMeaning !== SEMANTIC_MEANING) issues.push({ code:'semantic_meaning_mismatch', expected:SEMANTIC_MEANING, actual:input.semanticMeaning });
        if (input.contractFamily !== CONTRACT_FAMILY) issues.push({ code:'contract_family_mismatch', expected:CONTRACT_FAMILY, actual:input.contractFamily });
        if (input.contractRef !== ASSESSMENT_REF) issues.push({ code:'assessment_ref_mismatch', expected:ASSESSMENT_REF, actual:input.contractRef });
        if (!COMPATIBLE_VERSIONS.includes(input.contractVersion)) issues.push({ code:'assessment_version_incompatible', actual:input.contractVersion });
        return issues;
    };

    const resolutionGate = (left, right) => {
        const statuses = [left.resolutionStatus,right.resolutionStatus];
        if (statuses.includes('unresolved')) return { status:'unresolved', reason:'assessment_unresolved' };
        if (statuses.includes('partial')) return { status:'partial', reason:'assessment_partial' };
        if (statuses.includes('not_applicable')) return { status:'incomparable', reason:'assessment_not_applicable' };
        return null;
    };

    const compareTravelExecution = (leftAssessment, rightAssessment, bindings = {}) => {
        const leftBound = bindSide(leftAssessment, bindings.leftAlternativeId);
        const rightBound = bindSide(rightAssessment, bindings.rightAlternativeId);
        const leftFallback = { readingRef:leftAssessment?.readingRef || null, alternativeId:leftAssessment?.alternativeId || bindings.leftAlternativeId || null };
        const rightFallback = { readingRef:rightAssessment?.readingRef || null, alternativeId:rightAssessment?.alternativeId || bindings.rightAlternativeId || null };

        if (leftBound.status !== 'bound' || rightBound.status !== 'bound') {
            return reject(
                leftBound.input || leftFallback,
                rightBound.input || rightFallback,
                'unresolved',
                'assessment_binding_invalid',
                [
                    ...leftBound.issues.map((item) => ({ side:'left', ...item })),
                    ...rightBound.issues.map((item) => ({ side:'right', ...item }))
                ]
            );
        }

        const left = leftBound.input;
        const right = rightBound.input;
        const identityIssues = [
            ...validateIdentity(left).map((item) => ({ side:'left', ...item })),
            ...validateIdentity(right).map((item) => ({ side:'right', ...item }))
        ];
        if (identityIssues.length) return reject(left,right,'incomparable','assessment_contract_incompatible',identityIssues);
        if (left.readingRef !== right.readingRef) return reject(left,right,'incomparable','reading_scope_mismatch');

        const gated = resolutionGate(left,right);
        if (gated) return reject(left,right,gated.status,gated.reason);
        if (left.assessmentStatus === 'insufficient_evidence' || right.assessmentStatus === 'insufficient_evidence') {
            return reject(left,right,'incomparable','insufficient_assessment_evidence');
        }
        if (left.assessmentStatus === 'not_assessed' || right.assessmentStatus === 'not_assessed') {
            return reject(left,right,'unresolved','assessment_not_assessed');
        }

        const out = resultBase(left,right);
        out.comparisonStatus = 'comparable';
        if (left.assessmentStatus === 'supportive_evidence' && right.assessmentStatus === 'adverse_evidence') {
            out.relation = 'left_preferred_on_dimension';
            out.reasonRefs = [`${COMPARATOR_REF}:supportive_vs_adverse`];
            return out;
        }
        if (left.assessmentStatus === 'adverse_evidence' && right.assessmentStatus === 'supportive_evidence') {
            out.relation = 'right_preferred_on_dimension';
            out.reasonRefs = [`${COMPARATOR_REF}:adverse_vs_supportive`];
            return out;
        }
        if (left.assessmentStatus === 'mixed_evidence' || right.assessmentStatus === 'mixed_evidence') {
            out.relation = 'mixed_no_order';
            out.reasonRefs = [`${COMPARATOR_REF}:mixed_state_blocks_strict_order`];
            return out;
        }
        if (left.assessmentStatus === right.assessmentStatus
            && ['supportive_evidence','adverse_evidence'].includes(left.assessmentStatus)) {
            out.relation = 'indistinguishable_on_dimension';
            out.reasonRefs = [`${COMPARATOR_REF}:same_coarse_direction_state`];
            return out;
        }
        return reject(left,right,'incomparable','unhandled_assessment_state_pair');
    };

    const describeCandidate = () => ({
        comparatorRef:COMPARATOR_REF,
        version:VERSION,
        status:STATUS,
        registered:false,
        currentRuntimeReachable:false,
        formalEligible:false,
        dimensionId:DIMENSION_ID,
        semanticMeaning:SEMANTIC_MEANING,
        assessmentContractFamily:CONTRACT_FAMILY,
        assessmentRef:ASSESSMENT_REF,
        compatibleAssessmentVersions:[...COMPATIBLE_VERSIONS],
        readingRefRequired:true,
        sameReadingRequired:true,
        crossReadingComparisonAllowed:false,
        strictOrderingPairs:['supportive_evidence>adverse_evidence'],
        mixedOrdering:false,
        evidenceCountUsed:false,
        rawEvidenceTypesInspected:false,
        winnerEnabled:false,
        scalarScoreEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoTravelExecutionComparatorPretrainingV03 = Object.freeze({
        version:VERSION,
        status:STATUS,
        comparatorRef:COMPARATOR_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        compareTravelExecution,
        describeCandidate
    });
})(typeof window !== 'undefined' ? window : globalThis);
