(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.3';
    const STATUS = 'design_only_unreachable';
    const COMPOSER_REF = 'TEC-EXEC-003';
    const DUTY = 'travel_execution';
    const RESOLUTION_STATUSES = Object.freeze(['resolved','partial','unresolved','not_applicable']);
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra = {}) => ({ code, ...extra });

    const validateComponent = (component, readingRef, alternativeId, index) => {
        const issues = [];
        if (!component || typeof component !== 'object' || Array.isArray(component)) {
            return [issue('evidence_component_object_required', { index })];
        }
        if (component.readingRef !== readingRef) issues.push(issue('component_reading_scope_mismatch', { index, componentReadingRef:component.readingRef || null }));
        if (component.alternativeId !== alternativeId) issues.push(issue('component_alternative_scope_mismatch', { index, componentAlternativeId:component.alternativeId || null }));
        if (component.duty !== DUTY) issues.push(issue('component_duty_mismatch', { index, duty:component.duty || null }));
        if (!RESOLUTION_STATUSES.includes(component.resolutionStatus)) issues.push(issue('component_resolution_status_invalid', { index, value:component.resolutionStatus || null }));
        if (!Array.isArray(component.evidence)) {
            issues.push(issue('component_evidence_array_required', { index }));
        } else {
            component.evidence.forEach((item, evidenceIndex) => {
                if (!item || typeof item !== 'object' || Array.isArray(item)) {
                    issues.push(issue('component_evidence_item_object_required', { index, evidenceIndex }));
                    return;
                }
                if (!hasText(item.id)) issues.push(issue('component_evidence_id_required', { index, evidenceIndex }));
                if (item.readingRef !== readingRef) issues.push(issue('component_evidence_reading_scope_mismatch', { index, evidenceIndex, id:item.id || null }));
                if (item.alternativeId !== alternativeId) issues.push(issue('component_evidence_alternative_scope_mismatch', { index, evidenceIndex, id:item.id || null }));
                if (!hasText(item.type)) issues.push(issue('component_evidence_type_required', { index, evidenceIndex }));
                if (!hasText(item.polarity)) issues.push(issue('component_evidence_polarity_required', { index, evidenceIndex }));
                if (!Array.isArray(item.sourceFactRefs) || !item.sourceFactRefs.length || item.sourceFactRefs.some((ref) => !hasText(ref))) {
                    issues.push(issue('component_source_fact_refs_required', { index, evidenceIndex, id:item.id || null }));
                }
            });
        }
        return issues;
    };

    const validateInput = ({ readingRef, alternativeId, components } = {}) => {
        const issues = [];
        if (!hasText(readingRef)) issues.push(issue('reading_ref_required'));
        if (!hasText(alternativeId)) issues.push(issue('alternative_id_required'));
        if (!Array.isArray(components)) {
            issues.push(issue('components_array_required'));
        } else {
            components.forEach((component, index) => issues.push(...validateComponent(component, readingRef, alternativeId, index)));
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const mergeResolutionStatus = (components) => {
        const statuses = components.map((component) => component.resolutionStatus);
        if (statuses.includes('unresolved')) return 'unresolved';
        if (statuses.includes('partial')) return 'partial';
        if (statuses.length && statuses.every((status) => status === 'not_applicable')) return 'not_applicable';
        return 'resolved';
    };

    const composeEvidencePacket = (input = {}) => {
        const validation = validateInput(input);
        if (validation.status !== 'valid') {
            return {
                readingRef:hasText(input.readingRef) ? input.readingRef : null,
                alternativeId:hasText(input.alternativeId) ? input.alternativeId : null,
                duty:DUTY,
                resolutionStatus:'unresolved',
                evidence:[],
                componentTraceRefs:[],
                issues:validation.issues,
                formalEligible:false,
                traceRefs:[COMPOSER_REF]
            };
        }

        const evidence = [];
        const ids = new Set();
        const duplicateIssues = [];
        input.components.forEach((component, componentIndex) => {
            (component.evidence || []).forEach((item) => {
                if (ids.has(item.id)) duplicateIssues.push(issue('duplicate_evidence_id_across_components', { componentIndex, id:item.id }));
                else {
                    ids.add(item.id);
                    evidence.push({ ...item });
                }
            });
        });
        if (duplicateIssues.length) {
            return {
                readingRef:input.readingRef,
                alternativeId:input.alternativeId,
                duty:DUTY,
                resolutionStatus:'unresolved',
                evidence:[],
                componentTraceRefs:[],
                issues:duplicateIssues,
                formalEligible:false,
                traceRefs:[COMPOSER_REF]
            };
        }

        const componentTraceRefs = input.components.flatMap((component) => Array.isArray(component.traceRefs) ? component.traceRefs : []);
        return {
            readingRef:input.readingRef,
            alternativeId:input.alternativeId,
            duty:DUTY,
            resolutionStatus:mergeResolutionStatus(input.components),
            evidence,
            componentTraceRefs:[...new Set(componentTraceRefs)],
            issues:[],
            formalEligible:false,
            traceRefs:[COMPOSER_REF, ...new Set(componentTraceRefs)]
        };
    };

    const describeComposer = () => ({
        version:VERSION,
        status:STATUS,
        composerRef:COMPOSER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        readingRefRequired:true,
        alternativeIdRequired:true,
        sameReadingRequiredAcrossComponents:true,
        sameAlternativeRequiredAcrossComponents:true,
        interpretsEvidence:false,
        evidenceCountingEnabled:false,
        scoringEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoTravelExecutionEvidenceComposePretrainingV03 = Object.freeze({
        version:VERSION,
        status:STATUS,
        composerRef:COMPOSER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        validateInput,
        mergeResolutionStatus,
        composeEvidencePacket,
        describeComposer
    });
})(typeof window !== 'undefined' ? window : globalThis);
