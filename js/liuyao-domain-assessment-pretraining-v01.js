(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_no_active_domain_evaluators';

    const RESOLUTION_STATUSES = Object.freeze([
        'resolved',
        'partial',
        'unresolved',
        'not_applicable'
    ]);

    const ASSESSMENT_STATUSES = Object.freeze([
        'supportive_evidence',
        'adverse_evidence',
        'mixed_evidence',
        'insufficient_evidence',
        'not_assessed'
    ]);

    const FORBIDDEN_OUTPUT_FIELDS = Object.freeze([
        'probability',
        'scalarScore',
        'winner',
        'overallRecommendation'
    ]);

    const ACTIVE_EVALUATORS = Object.freeze([]);
    const issue = (code, extra = {}) => ({ code, ...extra });
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const validRefArray = (value) => Array.isArray(value) && value.every(hasText);

    const validateAssessmentEnvelope = (assessment) => {
        const issues = [];
        if (!assessment || typeof assessment !== 'object' || Array.isArray(assessment)) {
            return { status:'invalid', issues:[issue('assessment_envelope_object_required')] };
        }

        [
            'assessmentRef',
            'assessmentVersion',
            'contractFamily',
            'eventType',
            'duty',
            'dimensionId',
            'semanticMeaning'
        ].forEach((key) => {
            if (!hasText(assessment[key])) issues.push(issue(`${key}_required`));
        });
        if (Object.prototype.hasOwnProperty.call(assessment, 'alternativeId')
            && !hasText(assessment.alternativeId)) {
            issues.push(issue('alternativeId_invalid'));
        }

        if (!RESOLUTION_STATUSES.includes(assessment.resolutionStatus)) {
            issues.push(issue('resolution_status_invalid', { value:assessment.resolutionStatus || null }));
        }
        if (!ASSESSMENT_STATUSES.includes(assessment.assessmentStatus)) {
            issues.push(issue('assessment_status_invalid', { value:assessment.assessmentStatus || null }));
        }
        if (!validRefArray(assessment.evidenceRefs)) issues.push(issue('evidence_refs_invalid'));
        if (!validRefArray(assessment.reasonRefs)) issues.push(issue('reason_refs_invalid'));

        FORBIDDEN_OUTPUT_FIELDS.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(assessment, field)) {
                issues.push(issue('forbidden_assessment_output_field', { field }));
            }
        });

        if (assessment.resolutionStatus === 'resolved'
            && assessment.assessmentStatus === 'not_assessed') {
            issues.push(issue('resolved_status_incompatible_with_not_assessed'));
        }
        if (assessment.resolutionStatus === 'unresolved'
            && !['not_assessed','insufficient_evidence'].includes(assessment.assessmentStatus)) {
            issues.push(issue('unresolved_status_requires_nonfinal_assessment_state'));
        }
        if (assessment.resolutionStatus === 'not_applicable'
            && assessment.assessmentStatus !== 'not_assessed') {
            issues.push(issue('not_applicable_requires_not_assessed'));
        }

        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const validateEvaluatorRequest = (request) => {
        const issues = [];
        if (!request || typeof request !== 'object' || Array.isArray(request)) {
            return { status:'invalid', issues:[issue('evaluator_request_object_required')] };
        }

        [
            'eventType',
            'duty',
            'dimensionId',
            'semanticMeaning',
            'contractFamily',
            'assessmentRef',
            'assessmentVersion'
        ].forEach((key) => {
            if (!hasText(request[key])) issues.push(issue(`${key}_required`));
        });
        if (Object.prototype.hasOwnProperty.call(request, 'alternativeId')
            && !hasText(request.alternativeId)) {
            issues.push(issue('alternativeId_invalid'));
        }

        if (!validRefArray(request.evidenceRefs)) issues.push(issue('evidence_refs_invalid'));
        if (request.evidenceResolutionStatus
            && !RESOLUTION_STATUSES.includes(request.evidenceResolutionStatus)) {
            issues.push(issue('evidence_resolution_status_invalid', { value:request.evidenceResolutionStatus }));
        }

        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const evaluatorKey = (request) => [
        request?.eventType || '',
        request?.duty || '',
        request?.dimensionId || '',
        request?.semanticMeaning || '',
        request?.contractFamily || ''
    ].join('|');

    const findRegisteredEvaluator = (request) => {
        const key = evaluatorKey(request);
        return ACTIVE_EVALUATORS.find((entry) => evaluatorKey(entry) === key) || null;
    };

    const unresolvedEnvelope = (request, reason, extraIssues = []) => ({
        ...(hasText(request?.alternativeId) ? { alternativeId:request.alternativeId } : {}),
        assessmentRef:request?.assessmentRef || 'unregistered_assessment',
        assessmentVersion:request?.assessmentVersion || VERSION,
        contractFamily:request?.contractFamily || 'unresolved',
        eventType:request?.eventType || 'unknown',
        duty:request?.duty || 'unknown',
        dimensionId:request?.dimensionId || 'unknown',
        semanticMeaning:request?.semanticMeaning || 'unknown',
        resolutionStatus:'unresolved',
        assessmentStatus:'not_assessed',
        evidenceRefs:Array.isArray(request?.evidenceRefs) ? [...request.evidenceRefs] : [],
        reasonRefs:[reason],
        unresolvedIssues:[...extraIssues],
        traceRefs:[]
    });

    const assessWithRegisteredEvaluator = (request, evidencePacket = null) => {
        const validation = validateEvaluatorRequest(request);
        if (validation.status !== 'valid') {
            return unresolvedEnvelope(request, 'invalid_evaluator_request', validation.issues);
        }

        const evidenceResolutionStatus = request.evidenceResolutionStatus || 'resolved';
        if (evidenceResolutionStatus === 'unresolved') {
            return unresolvedEnvelope(request, 'evidence_unresolved', [issue('evidence_unresolved')]);
        }
        if (evidenceResolutionStatus === 'partial') {
            return {
                ...unresolvedEnvelope(request, 'evidence_partial', [issue('evidence_partial')]),
                resolutionStatus:'partial',
                assessmentStatus:'insufficient_evidence'
            };
        }
        if (evidenceResolutionStatus === 'not_applicable') {
            return {
                ...unresolvedEnvelope(request, 'evidence_not_applicable', []),
                resolutionStatus:'not_applicable',
                assessmentStatus:'not_assessed'
            };
        }

        const evaluator = findRegisteredEvaluator(request);
        if (!evaluator) {
            return unresolvedEnvelope(request, 'evaluator_not_registered', [
                issue('evaluator_not_registered', { evaluatorKey:evaluatorKey(request) })
            ]);
        }

        if (typeof evaluator.evaluate !== 'function') {
            return unresolvedEnvelope(request, 'registered_evaluator_not_executable', [
                issue('registered_evaluator_not_executable', { evaluatorRef:evaluator.evaluatorRef || null })
            ]);
        }

        const result = evaluator.evaluate({ request, evidencePacket });
        const checked = validateAssessmentEnvelope(result);
        return checked.status === 'valid'
            ? result
            : unresolvedEnvelope(request, 'registered_evaluator_returned_invalid_envelope', checked.issues);
    };

    const buildAssessmentReadiness = () => ({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        sharedEvaluator:false,
        activeEvaluatorCount:ACTIVE_EVALUATORS.length,
        activeEvaluators:[...ACTIVE_EVALUATORS],
        choiceBindingRequiredBeforeComparator:true,
        fallbackPolarityMappingEnabled:false,
        evidenceCountingEnabled:false,
        probabilityEnabled:false,
        scalarScoreEnabled:false,
        winnerEnabled:false,
        overallRecommendationEnabled:false
    });

    GuiJia.liuyaoDomainAssessmentPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        RESOLUTION_STATUSES,
        ASSESSMENT_STATUSES,
        ACTIVE_EVALUATORS,
        validateAssessmentEnvelope,
        validateEvaluatorRequest,
        evaluatorKey,
        findRegisteredEvaluator,
        assessWithRegisteredEvaluator,
        buildAssessmentReadiness
    });
})(typeof window !== 'undefined' ? window : globalThis);
