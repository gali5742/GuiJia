(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_generic_travel_evidence_binding';
    const SYNTHETIC_PREFIX = 'DESIGN-ONLY-TV-EVIDENCE';
    const SUPPORTED_DUTIES = Object.freeze([
        'travel_execution',
        'travel_safety',
        'travel_disruption_journey',
        'travel_disruption_transport'
    ]);

    const issue = (code, extra = {}) => ({ code, ...extra });
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const safeToken = (value) => String(value || '')
        .trim()
        .replace(/[^A-Za-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'unknown';

    const validateTravelEvidence = (travelEvidence, expectedDuty = null) => {
        const issues = [];
        if (!travelEvidence || typeof travelEvidence !== 'object' || Array.isArray(travelEvidence)) {
            return { status:'invalid', issues:[issue('travel_evidence_object_required')] };
        }
        const duty = travelEvidence.duty || 'unknown';
        if (!SUPPORTED_DUTIES.includes(duty)) {
            issues.push(issue('travel_evidence_duty_unsupported', { duty }));
        }
        if (expectedDuty !== null && duty !== expectedDuty) {
            issues.push(issue('travel_evidence_duty_mismatch', { expectedDuty, actualDuty:duty }));
        }
        if (!Array.isArray(travelEvidence.evidence)) {
            issues.push(issue('travel_evidence_array_required'));
        } else {
            travelEvidence.evidence.forEach((item,index) => {
                if (!item || typeof item !== 'object' || Array.isArray(item)) {
                    issues.push(issue('travel_evidence_item_object_required', { index }));
                    return;
                }
                if (!hasText(item.type)) issues.push(issue('travel_evidence_type_required', { index }));
                if (!hasText(item.polarity)) issues.push(issue('travel_evidence_polarity_required', { index }));
            });
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const buildSyntheticRefs = (duty, alternativeId, evidence) => {
        const seen = new Map();
        return evidence.map((item) => {
            const base = `${safeToken(item.type)}-${safeToken(item.polarity)}`;
            const ordinal = (seen.get(base) || 0) + 1;
            seen.set(base, ordinal);
            return `${SYNTHETIC_PREFIX}:${safeToken(duty)}:${safeToken(alternativeId)}:${base}:${ordinal}`;
        });
    };

    const bindTravelEvidence = (travelEvidence, alternativeId, options = {}) => {
        const expectedDuty = options.expectedDuty === undefined ? null : options.expectedDuty;
        const validation = validateTravelEvidence(travelEvidence, expectedDuty);
        const issues = [...validation.issues];
        if (!hasText(alternativeId)) issues.push(issue('alternative_id_required'));
        if (validation.status !== 'valid' || !hasText(alternativeId)) {
            return { status:'unresolved', packet:null, issues };
        }

        const duty = travelEvidence.duty;
        const evidence = travelEvidence.evidence;
        const explicitRefs = options.evidenceRefs;
        let refs;
        let referenceMode;

        if (explicitRefs !== undefined) {
            if (!Array.isArray(explicitRefs) || explicitRefs.length !== evidence.length || explicitRefs.some((ref) => !hasText(ref))) {
                return {
                    status:'unresolved',
                    packet:null,
                    issues:[issue('explicit_evidence_refs_must_match_evidence', {
                        evidenceCount:evidence.length,
                        refCount:Array.isArray(explicitRefs) ? explicitRefs.length : null
                    })]
                };
            }
            if (new Set(explicitRefs).size !== explicitRefs.length) {
                return { status:'unresolved', packet:null, issues:[issue('explicit_evidence_refs_must_be_unique')] };
            }
            refs = [...explicitRefs];
            referenceMode = 'explicit';
        } else {
            refs = buildSyntheticRefs(duty, alternativeId, evidence);
            referenceMode = 'synthetic_design_only';
        }

        const resolutionStatus = options.resolutionStatus || 'resolved';
        if (!['resolved','partial','unresolved','not_applicable'].includes(resolutionStatus)) {
            return { status:'unresolved', packet:null, issues:[issue('resolution_status_invalid', { value:resolutionStatus })] };
        }

        return {
            status:'bound',
            packet:{
                alternativeId,
                duty,
                resolutionStatus,
                evidence:evidence.map((item,index) => ({
                    id:refs[index],
                    type:item.type,
                    polarity:item.polarity,
                    ...(item.note ? { note:item.note } : {})
                })),
                bindingMeta:{
                    version:VERSION,
                    referenceMode,
                    formalEligible:false,
                    syntheticRefsForbiddenForFormalExpansion:referenceMode === 'synthetic_design_only'
                }
            },
            issues:referenceMode === 'synthetic_design_only'
                ? [issue('synthetic_design_only_evidence_refs_used')]
                : []
        };
    };

    const describeBridge = () => ({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        formalEligible:false,
        supportedDuties:[...SUPPORTED_DUTIES],
        interpretsEvidence:false,
        mapsPolarityToAssessment:false,
        syntheticPrefix:SYNTHETIC_PREFIX,
        formalRequirement:'use provenance-backed Evidence refs before any formal expansion'
    });

    GuiJia.liuyaoTravelEvidenceBindingPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        formalEligible:false,
        SUPPORTED_DUTIES,
        validateTravelEvidence,
        bindTravelEvidence,
        describeBridge
    });
})(typeof window !== 'undefined' ? window : globalThis);
