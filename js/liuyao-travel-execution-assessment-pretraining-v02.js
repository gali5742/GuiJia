(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const assessmentApi = GuiJia.liuyaoDomainAssessmentPretrainingV01;
    if (!assessmentApi?.validateAssessmentEnvelope) {
        throw new Error('liuyao-domain-assessment-pretraining-v01.js must be loaded before liuyao-travel-execution-assessment-pretraining-v02.js');
    }

    const VERSION = '0.2';
    const STATUS = 'isolated_candidate_not_registered';
    const EVALUATOR_REF = 'AE-TV-EXEC-002';
    const ASSESSMENT_REF = 'travel_execution_assessment_v0.2';
    const CONTRACT_FAMILY = 'travel_execution_assessment';
    const SEMANTIC_MEANING = 'journey_execution_outcome';

    const SUPPORT_KEYS = Object.freeze([
        'traveler_calendar_support|positive',
        'destination_relation|positive'
    ]);
    const ADVERSE_KEYS = Object.freeze([
        'traveler_calendar_constraint|negative',
        'traveler_void|negative',
        'destination_relation|negative',
        'route_process_obstruction|negative',
        'transport_disruption|negative'
    ]);
    const DEPRECATED_KEYS = Object.freeze([
        'traveler_vitality|positive',
        'traveler_vitality|negative'
    ]);

    const issue = (code, extra = {}) => ({ code, ...extra });
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const directionKey = (item) => `${item?.type || ''}|${item?.polarity || ''}`;

    const validateEvidencePacket = (packet) => {
        const issues = [];
        if (!packet || typeof packet !== 'object' || Array.isArray(packet)) {
            return { status:'invalid', issues:[issue('evidence_packet_object_required')] };
        }
        if (packet.duty !== 'travel_execution') issues.push(issue('travel_execution_duty_required', { value:packet.duty || null }));
        if (Object.prototype.hasOwnProperty.call(packet, 'alternativeId') && !hasText(packet.alternativeId)) issues.push(issue('alternative_id_invalid'));
        const resolutionStatus = packet.resolutionStatus || 'resolved';
        if (!assessmentApi.RESOLUTION_STATUSES.includes(resolutionStatus)) issues.push(issue('evidence_resolution_status_invalid', { value:resolutionStatus }));
        if (!Array.isArray(packet.evidence)) {
            issues.push(issue('evidence_array_required'));
        } else {
            const ids = [];
            packet.evidence.forEach((item, index) => {
                if (!item || typeof item !== 'object' || Array.isArray(item)) {
                    issues.push(issue('evidence_item_object_required', { index }));
                    return;
                }
                if (!hasText(item.id)) issues.push(issue('evidence_id_required', { index }));
                else ids.push(item.id);
                if (!hasText(item.type)) issues.push(issue('evidence_type_required', { index, id:item.id || null }));
                if (!hasText(item.polarity)) issues.push(issue('evidence_polarity_required', { index, id:item.id || null }));
            });
            if (new Set(ids).size !== ids.length) issues.push(issue('evidence_ids_must_be_unique'));
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const baseEnvelope = (alternativeId, resolutionStatus, assessmentStatus, evidenceRefs, reasonRefs, unresolvedIssues = [], traceRefs = []) => ({
        ...(hasText(alternativeId) ? { alternativeId } : {}),
        assessmentRef:ASSESSMENT_REF,
        assessmentVersion:VERSION,
        contractFamily:CONTRACT_FAMILY,
        eventType:'travel',
        duty:'travel_execution',
        dimensionId:'target_outcome',
        semanticMeaning:SEMANTIC_MEANING,
        resolutionStatus,
        assessmentStatus,
        evidenceRefs:[...evidenceRefs],
        reasonRefs:[...reasonRefs],
        unresolvedIssues:[...unresolvedIssues],
        traceRefs:[EVALUATOR_REF, ...traceRefs]
    });

    const evaluateTravelExecution = (packet) => {
        const validation = validateEvidencePacket(packet);
        const alternativeId = hasText(packet?.alternativeId) ? packet.alternativeId : null;
        if (validation.status !== 'valid') {
            return baseEnvelope(alternativeId,'unresolved','not_assessed',[],[`${EVALUATOR_REF}:invalid_evidence_packet`],validation.issues);
        }

        const resolutionStatus = packet.resolutionStatus || 'resolved';
        const allRefs = packet.evidence.map((item) => item.id);
        if (resolutionStatus === 'unresolved') return baseEnvelope(alternativeId,'unresolved','not_assessed',allRefs,[`${EVALUATOR_REF}:evidence_unresolved`],[issue('evidence_unresolved')]);
        if (resolutionStatus === 'partial') return baseEnvelope(alternativeId,'partial','insufficient_evidence',allRefs,[`${EVALUATOR_REF}:evidence_partial`],[issue('evidence_partial')]);
        if (resolutionStatus === 'not_applicable') return baseEnvelope(alternativeId,'not_applicable','not_assessed',allRefs,[`${EVALUATOR_REF}:not_applicable`]);

        const supportRefs = [];
        const adverseRefs = [];
        const ignoredRefs = [];
        const deprecatedRefs = [];

        packet.evidence.forEach((item) => {
            const key = directionKey(item);
            if (SUPPORT_KEYS.includes(key)) supportRefs.push(item.id);
            else if (ADVERSE_KEYS.includes(key)) adverseRefs.push(item.id);
            else if (DEPRECATED_KEYS.includes(key)) deprecatedRefs.push(item.id);
            else ignoredRefs.push(item.id);
        });

        let assessmentStatus = 'insufficient_evidence';
        let reason = `${EVALUATOR_REF}:no_registered_execution_direction`;
        if (supportRefs.length && adverseRefs.length) {
            assessmentStatus = 'mixed_evidence';
            reason = `${EVALUATOR_REF}:support_and_adverse_present`;
        } else if (supportRefs.length) {
            assessmentStatus = 'supportive_evidence';
            reason = `${EVALUATOR_REF}:execution_support_present`;
        } else if (adverseRefs.length) {
            assessmentStatus = 'adverse_evidence';
            reason = `${EVALUATOR_REF}:execution_adverse_present`;
        } else if (deprecatedRefs.length) {
            reason = `${EVALUATOR_REF}:deprecated_vitality_evidence_ignored`;
        }

        const envelope = baseEnvelope(
            alternativeId,
            'resolved',
            assessmentStatus,
            [...supportRefs, ...adverseRefs],
            [reason],
            [],
            [
                ...deprecatedRefs.map((ref) => `${EVALUATOR_REF}:deprecated:${ref}`),
                ...ignoredRefs.map((ref) => `${EVALUATOR_REF}:ignored:${ref}`)
            ]
        );
        const checked = assessmentApi.validateAssessmentEnvelope(envelope);
        return checked.status === 'valid'
            ? envelope
            : baseEnvelope(alternativeId,'unresolved','not_assessed',allRefs,[`${EVALUATOR_REF}:invalid_output`],checked.issues);
    };

    const describeCandidate = () => ({
        evaluatorRef:EVALUATOR_REF,
        version:VERSION,
        status:STATUS,
        registered:false,
        currentRuntimeReachable:false,
        eventType:'travel',
        duty:'travel_execution',
        dimensionId:'target_outcome',
        semanticMeaning:SEMANTIC_MEANING,
        contractFamily:CONTRACT_FAMILY,
        supportKeys:[...SUPPORT_KEYS],
        adverseKeys:[...ADVERSE_KEYS],
        deprecatedKeys:[...DEPRECATED_KEYS],
        travelerVitalityAccepted:false,
        evidenceCountingEnabled:false,
        scoringEnabled:false,
        probabilityEnabled:false,
        comparatorCompatibility:'not_reviewed'
    });

    GuiJia.liuyaoTravelExecutionAssessmentPretrainingV02 = Object.freeze({
        version:VERSION,
        status:STATUS,
        evaluatorRef:EVALUATOR_REF,
        currentRuntimeReachable:false,
        registered:false,
        SUPPORT_KEYS,
        ADVERSE_KEYS,
        DEPRECATED_KEYS,
        validateEvidencePacket,
        evaluateTravelExecution,
        describeCandidate
    });
})(typeof window !== 'undefined' ? window : globalThis);
