(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const assessmentApi = GuiJia.liuyaoDomainAssessmentPretrainingV02;
    if (!assessmentApi?.validateAssessmentEnvelope) {
        throw new Error('liuyao-domain-assessment-pretraining-v02.js must be loaded before liuyao-travel-execution-assessment-pretraining-v03.js');
    }

    const VERSION = '0.3';
    const STATUS = 'isolated_candidate_not_registered';
    const EVALUATOR_REF = 'AE-TV-EXEC-003';
    const ASSESSMENT_REF = 'travel_execution_assessment_v0.3';
    const CONTRACT_FAMILY = 'travel_execution_assessment';
    const SEMANTIC_MEANING = 'journey_execution_outcome';
    const DUTY = 'travel_execution';

    const SUPPORT_KEYS = Object.freeze([
        'traveler_calendar_support|positive',
        'traveler_controls_destination|positive'
    ]);
    const ADVERSE_KEYS = Object.freeze([
        'traveler_calendar_constraint|negative',
        'traveler_void|negative',
        'destination_controls_traveler|negative'
    ]);
    const FORBIDDEN_OPAQUE_KEYS = Object.freeze([
        'traveler_vitality|positive',
        'traveler_vitality|negative',
        'destination_relation|positive',
        'destination_relation|negative',
        'route_process_obstruction|negative',
        'transport_disruption|negative'
    ]);
    const SOURCE_ADAPTER_BY_TYPE = Object.freeze({
        traveler_calendar_support:'TEA-LINE-003',
        traveler_calendar_constraint:'TEA-LINE-003',
        traveler_void:'TEA-LINE-003',
        traveler_controls_destination:'TEA-DEST-001',
        destination_controls_traveler:'TEA-DEST-001'
    });

    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra = {}) => ({ code, ...extra });
    const directionKey = (item) => `${item?.type || ''}|${item?.polarity || ''}`;

    const validateEvidencePacket = (packet) => {
        const issues = [];
        if (!packet || typeof packet !== 'object' || Array.isArray(packet)) {
            return { status:'invalid', issues:[issue('evidence_packet_object_required')] };
        }
        if (!hasText(packet.readingRef)) issues.push(issue('reading_ref_required'));
        if (!hasText(packet.alternativeId)) issues.push(issue('alternative_id_required'));
        if (packet.duty !== DUTY) issues.push(issue('travel_execution_duty_required', { value:packet.duty || null }));
        const resolutionStatus = packet.resolutionStatus || 'resolved';
        if (!assessmentApi.RESOLUTION_STATUSES.includes(resolutionStatus)) issues.push(issue('evidence_resolution_status_invalid', { value:resolutionStatus }));
        if (!Array.isArray(packet.evidence)) {
            issues.push(issue('evidence_array_required'));
        } else {
            const ids = new Set();
            packet.evidence.forEach((item, index) => {
                if (!item || typeof item !== 'object' || Array.isArray(item)) {
                    issues.push(issue('evidence_item_object_required', { index }));
                    return;
                }
                if (!hasText(item.id)) issues.push(issue('evidence_id_required', { index }));
                else if (ids.has(item.id)) issues.push(issue('duplicate_evidence_id', { index, id:item.id }));
                else ids.add(item.id);
                if (item.readingRef !== packet.readingRef) issues.push(issue('evidence_reading_scope_mismatch', { index, id:item.id || null }));
                if (item.alternativeId !== packet.alternativeId) issues.push(issue('evidence_alternative_scope_mismatch', { index, id:item.id || null }));
                if (!hasText(item.type)) issues.push(issue('evidence_type_required', { index, id:item.id || null }));
                if (!hasText(item.polarity)) issues.push(issue('evidence_polarity_required', { index, id:item.id || null }));
                if (!Array.isArray(item.sourceFactRefs) || !item.sourceFactRefs.length || item.sourceFactRefs.some((ref) => !hasText(ref))) {
                    issues.push(issue('source_fact_refs_required', { index, id:item.id || null }));
                }
                const key = directionKey(item);
                if (FORBIDDEN_OPAQUE_KEYS.includes(key)) issues.push(issue('deprecated_opaque_evidence_forbidden', { index, id:item.id || null, key }));
                const expectedAdapter = SOURCE_ADAPTER_BY_TYPE[item.type];
                if (expectedAdapter && item.sourceAdapterRef !== expectedAdapter) {
                    issues.push(issue('recognized_evidence_source_adapter_mismatch', { index, id:item.id || null, expected:expectedAdapter, actual:item.sourceAdapterRef || null }));
                }
            });
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const baseEnvelope = (readingRef, alternativeId, resolutionStatus, assessmentStatus, evidenceRefs, reasonRefs, unresolvedIssues = [], traceRefs = []) => ({
        readingRef:hasText(readingRef) ? readingRef : 'unresolved-reading',
        ...(hasText(alternativeId) ? { alternativeId } : {}),
        assessmentRef:ASSESSMENT_REF,
        assessmentVersion:VERSION,
        contractFamily:CONTRACT_FAMILY,
        eventType:'travel',
        duty:DUTY,
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
        const readingRef = hasText(packet?.readingRef) ? packet.readingRef : null;
        const alternativeId = hasText(packet?.alternativeId) ? packet.alternativeId : null;
        const validation = validateEvidencePacket(packet);
        if (validation.status !== 'valid') {
            return baseEnvelope(readingRef,alternativeId,'unresolved','not_assessed',[],[`${EVALUATOR_REF}:invalid_evidence_packet`],validation.issues);
        }

        const resolutionStatus = packet.resolutionStatus || 'resolved';
        const allRefs = packet.evidence.map((item) => item.id);
        if (resolutionStatus === 'unresolved') return baseEnvelope(readingRef,alternativeId,'unresolved','not_assessed',allRefs,[`${EVALUATOR_REF}:evidence_unresolved`],[issue('evidence_unresolved')]);
        if (resolutionStatus === 'partial') return baseEnvelope(readingRef,alternativeId,'partial','insufficient_evidence',allRefs,[`${EVALUATOR_REF}:evidence_partial`],[issue('evidence_partial')]);
        if (resolutionStatus === 'not_applicable') return baseEnvelope(readingRef,alternativeId,'not_applicable','not_assessed',allRefs,[`${EVALUATOR_REF}:not_applicable`]);

        const supportRefs = [];
        const adverseRefs = [];
        const ignoredRefs = [];
        packet.evidence.forEach((item) => {
            const key = directionKey(item);
            if (SUPPORT_KEYS.includes(key)) supportRefs.push(item.id);
            else if (ADVERSE_KEYS.includes(key)) adverseRefs.push(item.id);
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
        }

        const envelope = baseEnvelope(
            readingRef,
            alternativeId,
            'resolved',
            assessmentStatus,
            [...supportRefs, ...adverseRefs],
            [reason],
            [],
            ignoredRefs.map((ref) => `${EVALUATOR_REF}:ignored:${ref}`)
        );
        const checked = assessmentApi.validateAssessmentEnvelope(envelope);
        return checked.status === 'valid'
            ? envelope
            : baseEnvelope(readingRef,alternativeId,'unresolved','not_assessed',allRefs,[`${EVALUATOR_REF}:invalid_output`],checked.issues);
    };

    const describeCandidate = () => ({
        evaluatorRef:EVALUATOR_REF,
        version:VERSION,
        status:STATUS,
        registered:false,
        currentRuntimeReachable:false,
        formalEligible:false,
        eventType:'travel',
        duty:DUTY,
        dimensionId:'target_outcome',
        semanticMeaning:SEMANTIC_MEANING,
        contractFamily:CONTRACT_FAMILY,
        assessmentRef:ASSESSMENT_REF,
        readingRefRequired:true,
        alternativeIdRequired:true,
        supportKeys:[...SUPPORT_KEYS],
        adverseKeys:[...ADVERSE_KEYS],
        forbiddenOpaqueKeys:[...FORBIDDEN_OPAQUE_KEYS],
        recognizedSourceAdapters:{...SOURCE_ADAPTER_BY_TYPE},
        routeProcessObstructionAccepted:false,
        transportDisruptionAccepted:false,
        travelerVitalityAccepted:false,
        opaqueDestinationRelationAccepted:false,
        evidenceCountingEnabled:false,
        scoringEnabled:false,
        probabilityEnabled:false,
        comparatorCompatibility:'requires_v03_reading_scoped_comparator'
    });

    GuiJia.liuyaoTravelExecutionAssessmentPretrainingV03 = Object.freeze({
        version:VERSION,
        status:STATUS,
        evaluatorRef:EVALUATOR_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        SUPPORT_KEYS,
        ADVERSE_KEYS,
        FORBIDDEN_OPAQUE_KEYS,
        SOURCE_ADAPTER_BY_TYPE,
        validateEvidencePacket,
        evaluateTravelExecution,
        describeCandidate
    });
})(typeof window !== 'undefined' ? window : globalThis);
