(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_no_formal_evidence_producers';
    const MODES = Object.freeze(['synthetic_fixture','provenance_backed']);
    const DUTIES = Object.freeze([
        'travel_execution',
        'travel_safety',
        'travel_disruption_journey',
        'travel_disruption_transport'
    ]);
    const SOURCE_LAYERS = Object.freeze([
        'observation_fact',
        'relation_fact',
        'movement_fact',
        'time_fact',
        'derived_fact',
        'synthetic_fixture'
    ]);
    const ATOMICITY = Object.freeze(['atomic','derived_reviewed','conclusion_shaped']);
    const ACTIVE_FORMAL_EVIDENCE_PRODUCERS = Object.freeze([]);

    const LEGACY_FACT_CLASSIFICATION = Object.freeze({
        travelerVitality:Object.freeze({ classification:'derived_status_placeholder', formalEligibleAsCurrentBoolean:false }),
        travelerVoid:Object.freeze({ classification:'time_fact_placeholder', formalEligibleAsCurrentBoolean:false }),
        destinationSupportsTraveler:Object.freeze({ classification:'relation_fact_placeholder', formalEligibleAsCurrentBoolean:false }),
        destinationControlsTraveler:Object.freeze({ classification:'relation_fact_placeholder', formalEligibleAsCurrentBoolean:false }),
        routeObstruction:Object.freeze({ classification:'conclusion_shaped_placeholder', formalEligibleAsCurrentBoolean:false }),
        safetySupport:Object.freeze({ classification:'derived_domain_placeholder', formalEligibleAsCurrentBoolean:false }),
        hazardPressure:Object.freeze({ classification:'derived_domain_placeholder', formalEligibleAsCurrentBoolean:false }),
        transportDisrupted:Object.freeze({ classification:'conclusion_shaped_placeholder', formalEligibleAsCurrentBoolean:false })
    });

    const issue = (code, extra = {}) => ({ code, ...extra });
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const textArray = (value) => Array.isArray(value) && value.every(hasText);

    const validateFact = (fact, mode, index) => {
        const issues = [];
        if (!fact || typeof fact !== 'object' || Array.isArray(fact)) {
            return [issue('fact_object_required', { index })];
        }

        if (mode === 'synthetic_fixture') {
            if (!hasText(fact.factType) && !hasText(fact.rawFactName)) {
                issues.push(issue('synthetic_fact_type_or_raw_name_required', { index }));
            }
            if (Object.prototype.hasOwnProperty.call(fact,'formalEligible') && fact.formalEligible !== false) {
                issues.push(issue('synthetic_fact_cannot_be_formal_eligible', { index }));
            }
            return issues;
        }

        ['factRef','factType','subjectRef','sourceLayer','producerRef','atomicity'].forEach((key) => {
            if (!hasText(fact[key])) issues.push(issue(`${key}_required`, { index }));
        });
        if (hasText(fact.sourceLayer) && !SOURCE_LAYERS.includes(fact.sourceLayer)) {
            issues.push(issue('source_layer_invalid', { index, value:fact.sourceLayer }));
        }
        if (fact.sourceLayer === 'synthetic_fixture') {
            issues.push(issue('synthetic_source_layer_forbidden_in_provenance_mode', { index }));
        }
        if (hasText(fact.atomicity) && !ATOMICITY.includes(fact.atomicity)) {
            issues.push(issue('atomicity_invalid', { index, value:fact.atomicity }));
        }
        if (fact.atomicity === 'conclusion_shaped') {
            issues.push(issue('conclusion_shaped_fact_forbidden', { index, factRef:fact.factRef || null }));
        }
        if (fact.sourceLayer === 'time_fact') {
            if (!textArray(fact.timeFactRefs) || fact.timeFactRefs.length === 0) {
                issues.push(issue('time_fact_refs_required', { index, factRef:fact.factRef || null }));
            }
        }
        if (Object.prototype.hasOwnProperty.call(fact,'formalEligible') && fact.formalEligible !== true) {
            issues.push(issue('provenance_backed_fact_must_be_explicitly_formal_eligible_when_field_present', { index }));
        }
        return issues;
    };

    const validateSourcePacket = (packet) => {
        const issues = [];
        if (!packet || typeof packet !== 'object' || Array.isArray(packet)) {
            return { status:'invalid', formalEligible:false, issues:[issue('source_packet_object_required')] };
        }
        if (!MODES.includes(packet.mode)) issues.push(issue('source_mode_invalid', { value:packet.mode || null }));
        if (!DUTIES.includes(packet.duty)) issues.push(issue('travel_duty_unsupported', { value:packet.duty || null }));
        if (!Array.isArray(packet.facts)) issues.push(issue('facts_array_required'));
        else if (MODES.includes(packet.mode)) {
            packet.facts.forEach((fact,index) => issues.push(...validateFact(fact,packet.mode,index)));
            const refs = packet.mode === 'provenance_backed'
                ? packet.facts.map((fact) => fact?.factRef).filter(hasText)
                : [];
            if (refs.length !== new Set(refs).size) issues.push(issue('fact_refs_must_be_unique'));
        }
        if (Object.prototype.hasOwnProperty.call(packet,'alternativeId') && !hasText(packet.alternativeId)) {
            issues.push(issue('alternative_id_invalid'));
        }

        const formalEligible = issues.length === 0 && packet.mode === 'provenance_backed';
        return {
            status:issues.length ? 'invalid' : 'valid',
            mode:packet.mode || null,
            formalEligible,
            issues
        };
    };

    const auditLegacyFixtureFacts = (facts = {}) => Object.keys(facts || {}).map((rawFactName) => {
        const known = LEGACY_FACT_CLASSIFICATION[rawFactName] || null;
        return {
            rawFactName,
            value:facts[rawFactName],
            known:Boolean(known),
            classification:known?.classification || 'unknown_fixture_fact',
            formalEligible:false
        };
    });

    const buildSyntheticSourcePacket = (duty, facts = {}, alternativeId = null) => ({
        mode:'synthetic_fixture',
        duty,
        ...(hasText(alternativeId) ? { alternativeId } : {}),
        facts:auditLegacyFixtureFacts(facts).map((entry) => ({
            rawFactName:entry.rawFactName,
            factType:entry.classification,
            value:entry.value,
            sourceLayer:'synthetic_fixture',
            formalEligible:false
        })),
        formalEligible:false
    });

    const buildReadiness = () => ({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        activeFormalEvidenceProducerCount:ACTIVE_FORMAL_EVIDENCE_PRODUCERS.length,
        activeFormalEvidenceProducers:[...ACTIVE_FORMAL_EVIDENCE_PRODUCERS],
        legacyBooleanFixturesFormalEligible:false,
        conclusionShapedFactsAllowed:false,
        absenceOfNegativeCreatesPositiveEvidence:false,
        recomputesTimeEngine:false,
        formalExpansionAuthorized:false
    });

    GuiJia.liuyaoTravelEvidenceSourcePretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        MODES,
        DUTIES,
        SOURCE_LAYERS,
        ATOMICITY,
        LEGACY_FACT_CLASSIFICATION,
        ACTIVE_FORMAL_EVIDENCE_PRODUCERS,
        validateSourcePacket,
        auditLegacyFixtureFacts,
        buildSyntheticSourcePacket,
        buildReadiness
    });
})(typeof window !== 'undefined' ? window : globalThis);
