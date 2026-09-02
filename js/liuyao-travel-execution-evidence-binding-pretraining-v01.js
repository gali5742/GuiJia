(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_evidence_binding_bridge';
    const SYNTHETIC_PREFIX = 'DESIGN-ONLY-TV-EXEC';
    const issue = (code, extra = {}) => ({ code, ...extra });
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

    const validateTravelEvidence = (travelEvidence) => {
        const issues = [];
        if (!travelEvidence || typeof travelEvidence !== 'object' || Array.isArray(travelEvidence)) {
            return { status:'invalid', issues:[issue('travel_evidence_object_required')] };
        }
        if (travelEvidence.duty !== 'travel_execution') {
            issues.push(issue('travel_execution_duty_required', { value:travelEvidence.duty || null }));
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

    const safeToken = (value) => String(value || '')
        .trim()
        .replace(/[^A-Za-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'unknown';

    const buildSyntheticRefs = (alternativeId, evidence) => {
        const seen = new Map();
        return evidence.map((item) => {
            const base = `${safeToken(item.type)}-${safeToken(item.polarity)}`;
            const ordinal = (seen.get(base) || 0) + 1;
            seen.set(base, ordinal);
            return `${SYNTHETIC_PREFIX}:${safeToken(alternativeId)}:${base}:${ordinal}`;
        });
    };

    const bindTravelExecutionEvidence = (travelEvidence, alternativeId, options = {}) => {
        const validation = validateTravelEvidence(travelEvidence);
        const issues = [...validation.issues];
        if (!hasText(alternativeId)) issues.push(issue('alternative_id_required'));
        if (validation.status !== 'valid' || !hasText(alternativeId)) {
            return { status:'unresolved', packet:null, issues };
        }

        const evidence = travelEvidence.evidence;
        const explicitRefs = options.evidenceRefs;
        let refs = null;
        let referenceMode = 'synthetic_design_only';

        if (explicitRefs !== undefined) {
            if (!Array.isArray(explicitRefs) || explicitRefs.length !== evidence.length || explicitRefs.some((ref) => !hasText(ref))) {
                return {
                    status:'unresolved',
                    packet:null,
                    issues:[issue('explicit_evidence_refs_must_match_evidence', { evidenceCount:evidence.length, refCount:Array.isArray(explicitRefs) ? explicitRefs.length : null })]
                };
            }
            if (new Set(explicitRefs).size !== explicitRefs.length) {
                return { status:'unresolved', packet:null, issues:[issue('explicit_evidence_refs_must_be_unique')] };
            }
            refs = [...explicitRefs];
            referenceMode = 'explicit';
        } else {
            refs = buildSyntheticRefs(alternativeId, evidence);
        }

        const resolutionStatus = options.resolutionStatus || 'resolved';
        if (!['resolved','partial','unresolved','not_applicable'].includes(resolutionStatus)) {
            return { status:'unresolved', packet:null, issues:[issue('resolution_status_invalid', { value:resolutionStatus })] };
        }

        const packetEvidence = evidence.map((item,index) => ({
            id:refs[index],
            type:item.type,
            polarity:item.polarity,
            ...(item.note ? { note:item.note } : {})
        }));

        return {
            status:'bound',
            packet:{
                alternativeId,
                duty:'travel_execution',
                resolutionStatus,
                evidence:packetEvidence,
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
        interpretsEvidence:false,
        mapsPolarityToAssessment:false,
        syntheticPrefix:SYNTHETIC_PREFIX,
        formalRequirement:'replace synthetic design-only refs with provenance-backed Evidence refs before any formal expansion'
    });

    GuiJia.liuyaoTravelExecutionEvidenceBindingPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        formalEligible:false,
        validateTravelEvidence,
        bindTravelExecutionEvidence,
        describeBridge
    });
})(typeof window !== 'undefined' ? window : globalThis);
