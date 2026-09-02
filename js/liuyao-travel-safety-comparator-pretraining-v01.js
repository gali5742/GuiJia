(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const assessmentApi = GuiJia.liuyaoDomainAssessmentPretrainingV01;
    const comparatorApi = GuiJia.liuyaoDomainComparatorPretrainingV01;
    if (!assessmentApi?.bindAssessmentForComparison) {
        throw new Error('liuyao-domain-assessment-pretraining-v01.js must be loaded before liuyao-travel-safety-comparator-pretraining-v01.js');
    }
    if (!comparatorApi?.validateDimensionAssessment) {
        throw new Error('liuyao-domain-comparator-pretraining-v01.js must be loaded before liuyao-travel-safety-comparator-pretraining-v01.js');
    }

    const VERSION = '0.1';
    const STATUS = 'isolated_candidate_not_registered';
    const COMPARATOR_REF = 'CP-TV-SAFE-001';
    const DIMENSION_ID = 'risk';
    const SEMANTIC_MEANING = 'journey_safety_and_major_route_risk';
    const CONTRACT_FAMILY = 'travel_safety_assessment';
    const ASSESSMENT_REF = 'travel_safety_assessment_v0.1';
    const COMPATIBLE_VERSIONS = Object.freeze(['0.1']);

    const resultBase = (leftId = null, rightId = null) => ({
        comparatorRef:COMPARATOR_REF,
        comparatorVersion:VERSION,
        dimensionId:DIMENSION_ID,
        semanticMeaning:SEMANTIC_MEANING,
        alternativeIds:[leftId,rightId],
        comparisonStatus:'incomparable',
        relation:null,
        reasonRefs:[],
        issues:[]
    });

    const reject = (leftId,rightId,comparisonStatus,reason,issues = []) => ({
        ...resultBase(leftId,rightId),
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

    const resolutionGate = (left,right) => {
        const statuses = [left.resolutionStatus,right.resolutionStatus];
        if (statuses.includes('unresolved')) return { status:'unresolved', reason:'assessment_unresolved' };
        if (statuses.includes('partial')) return { status:'partial', reason:'assessment_partial' };
        if (statuses.includes('not_applicable')) return { status:'incomparable', reason:'assessment_not_applicable' };
        return null;
    };

    const compareTravelSafety = (leftAssessment,rightAssessment,bindings = {}) => {
        const leftBound = bindSide(leftAssessment, bindings.leftAlternativeId);
        const rightBound = bindSide(rightAssessment, bindings.rightAlternativeId);
        const provisionalLeftId = leftBound.input?.alternativeId || leftAssessment?.alternativeId || bindings.leftAlternativeId || null;
        const provisionalRightId = rightBound.input?.alternativeId || rightAssessment?.alternativeId || bindings.rightAlternativeId || null;

        if (leftBound.status !== 'bound' || rightBound.status !== 'bound') {
            return reject(
                provisionalLeftId,
                provisionalRightId,
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
        if (identityIssues.length) {
            return reject(left.alternativeId,right.alternativeId,'incomparable','assessment_contract_incompatible',identityIssues);
        }

        const gated = resolutionGate(left,right);
        if (gated) return reject(left.alternativeId,right.alternativeId,gated.status,gated.reason);

        if (left.assessmentStatus === 'insufficient_evidence' || right.assessmentStatus === 'insufficient_evidence') {
            return reject(left.alternativeId,right.alternativeId,'incomparable','insufficient_assessment_evidence');
        }
        if (left.assessmentStatus === 'not_assessed' || right.assessmentStatus === 'not_assessed') {
            return reject(left.alternativeId,right.alternativeId,'unresolved','assessment_not_assessed');
        }

        const out = resultBase(left.alternativeId,right.alternativeId);
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

        return reject(left.alternativeId,right.alternativeId,'incomparable','unhandled_assessment_state_pair');
    };

    const describeCandidate = () => ({
        comparatorRef:COMPARATOR_REF,
        version:VERSION,
        status:STATUS,
        registered:false,
        currentRuntimeReachable:false,
        dimensionId:DIMENSION_ID,
        semanticMeaning:SEMANTIC_MEANING,
        assessmentContractFamily:CONTRACT_FAMILY,
        compatibleAssessmentVersions:[...COMPATIBLE_VERSIONS],
        strictOrderingPairs:['supportive_evidence>adverse_evidence'],
        mixedOrdering:false,
        evidenceCountUsed:false,
        winnerEnabled:false,
        scalarScoreEnabled:false,
        probabilityEnabled:false,
        realWorldSafetyClaimEnabled:false
    });

    GuiJia.liuyaoTravelSafetyComparatorPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        comparatorRef:COMPARATOR_REF,
        currentRuntimeReachable:false,
        registered:false,
        compareTravelSafety,
        describeCandidate
    });
})(typeof window !== 'undefined' ? window : globalThis);
