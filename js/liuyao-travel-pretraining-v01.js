(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';

    const SUPPORTED_DUTIES = Object.freeze(new Set([
        'travel_execution',
        'travel_safety',
        'travel_disruption_journey',
        'travel_disruption_transport'
    ]));
    const DEFERRED_DUTIES = Object.freeze(new Set([
        'travel_return_or_arrival_of_other',
        'generic_travel_state'
    ]));

    const TRAVELER_RELATION_MAP = Object.freeze({
        self: { type:'shi' },
        parent: { type:'six_relative', value:'父母' },
        child: { type:'six_relative', value:'子孙' },
        wife: { type:'six_relative', value:'妻财' },
        husband: { type:'six_relative', value:'官鬼' },
        sibling_or_peer: { type:'six_relative', value:'兄弟' }
    });

    const BASE_RULES = Object.freeze({
        travel_execution: 'TR-TV-001-A',
        travel_safety: 'TR-TV-001-B',
        travel_disruption_journey: 'TR-TV-001-C',
        travel_disruption_transport: 'TR-TV-001-D'
    });

    const issue = (code, extra = {}) => ({ code, ...extra });
    const candidate = (selector, semanticDuty, source, required, ruleRef) => ({
        selector, semanticDuty, source, required, ruleRef
    });

    const resolveTravelerSubject = (intent) => {
        const relation = intent?.travelerSubject?.relationToQuerent || 'unknown';
        const selector = TRAVELER_RELATION_MAP[relation] || null;
        if (!selector) {
            return {
                status:'unresolved',
                relationToQuerent:relation,
                selector:null,
                issues:[issue('traveler_relation_unresolved', { relationToQuerent:relation })]
            };
        }
        return {
            status:'resolved',
            relationToQuerent:relation,
            selector:{ ...selector },
            issues:[]
        };
    };

    const validateIntentContract = (intent) => {
        const issues = [];
        if (!intent || intent.event?.type !== 'travel') issues.push(issue('event_not_travel'));

        const duty = intent?.semantics?.travelDuty || 'unknown';
        if (DEFERRED_DUTIES.has(duty)) issues.push(issue('travel_duty_deferred', { duty }));
        else if (!SUPPORTED_DUTIES.has(duty)) issues.push(issue('travel_duty_unsupported', { duty }));

        const goalTypes = Array.isArray(intent?.goals) ? intent.goals.map((g) => g?.type).filter(Boolean) : [];
        if (!goalTypes.includes('outcome')) issues.push(issue('outcome_goal_required'));

        const targetAspect = intent?.semantics?.currentTargetAspect || 'unknown';
        const allowedAspectByDuty = {
            travel_execution: 'traveler_journey',
            travel_safety: 'traveler_safety',
            travel_disruption_journey: 'traveler_journey',
            travel_disruption_transport: 'transport_operation'
        };
        if (SUPPORTED_DUTIES.has(duty) && targetAspect !== allowedAspectByDuty[duty]) {
            issues.push(issue('current_target_aspect_mismatch', { duty, targetAspect, expected:allowedAspectByDuty[duty] }));
        }

        const specificity = intent?.journeyTarget?.specificity || 'unknown';
        if (!['specific','context_bounded'].includes(specificity)) {
            issues.push(issue('journey_target_insufficient', { specificity }));
        }

        if (['travel_execution','travel_safety','travel_disruption_journey'].includes(duty)) {
            const traveler = resolveTravelerSubject(intent);
            if (traveler.status !== 'resolved') issues.push(...traveler.issues);
        }

        if (duty === 'travel_disruption_transport') {
            const transport = intent?.transportContext || {};
            if (!['specific_service','specific_vehicle','context_bounded'].includes(transport.specificity)) {
                issues.push(issue('transport_target_insufficient', { specificity:transport.specificity || 'unknown' }));
            }
            if (!['explicit','context_supported'].includes(transport.relevance)) {
                issues.push(issue('transport_relevance_insufficient', { relevance:transport.relevance || 'unknown' }));
            }
        }

        if (targetAspect === 'destination_weather') issues.push(issue('weather_target_outside_travel'));
        if (targetAspect === 'trip_purpose_outcome') issues.push(issue('trip_purpose_target_outside_travel'));
        if (targetAspect === 'delivery_item') issues.push(issue('delivery_target_outside_travel'));

        return { status:issues.length ? 'insufficient' : 'sufficient', issues };
    };

    const isDestinationRelevant = (intent) => {
        const d = intent?.destinationContext || {};
        return ['specific','context_bounded'].includes(d.specificity)
            && ['explicit','context_supported'].includes(d.relevance);
    };

    const isTransportRelevant = (intent) => {
        const t = intent?.transportContext || {};
        return ['explicit','context_supported'].includes(t.relevance)
            && t.specificity !== 'none';
    };

    const buildDraftObservationPlan = (intent) => {
        const contract = validateIntentContract(intent);
        if (contract.status !== 'sufficient') {
            return { status:'unresolved', ruleRef:null, subjects:[], issues:contract.issues };
        }

        const duty = intent.semantics.travelDuty;
        const ruleRef = BASE_RULES[duty];
        const subjects = [];

        if (duty === 'travel_disruption_transport') {
            subjects.push(candidate(
                { type:'six_relative', value:'父母' },
                'transport_operation',
                'primary',
                true,
                ruleRef
            ));
            const traveler = resolveTravelerSubject(intent);
            if (traveler.status === 'resolved') {
                subjects.push(candidate(traveler.selector, 'affected_traveler', 'role', false, ruleRef));
            }
        } else {
            const traveler = resolveTravelerSubject(intent);
            subjects.push(candidate(
                traveler.selector,
                duty === 'travel_safety' ? 'traveler_safety_subject' : 'traveler',
                'primary',
                true,
                ruleRef
            ));

            if (duty === 'travel_safety') {
                subjects.push(candidate({ type:'six_relative', value:'子孙' }, 'safety_ease_support', 'domain', false, ruleRef));
                subjects.push(candidate({ type:'six_relative', value:'官鬼' }, 'hazard_pressure', 'domain', false, ruleRef));
            }

            if (isTransportRelevant(intent)) {
                subjects.push(candidate({ type:'six_relative', value:'父母' }, 'transport_vehicle_or_carrier', 'domain', false, ruleRef));
            }
        }

        if (isDestinationRelevant(intent)) {
            subjects.push(candidate({ type:'ying' }, 'destination', 'context', false, ruleRef));
        }

        return { status:'resolved', ruleRef, subjects, issues:[] };
    };

    const buildTravelEvidence = (intent, facts = {}) => {
        const duty = intent?.semantics?.travelDuty || 'unknown';
        const evidence = [];
        if (!SUPPORTED_DUTIES.has(duty)) return { duty, evidence, finalAssessment:null };

        if (facts.travelerVitality === 'supported') evidence.push({ type:'traveler_vitality', polarity:'positive' });
        if (facts.travelerVitality === 'weak') evidence.push({ type:'traveler_vitality', polarity:'negative' });
        if (facts.travelerVoid === true) evidence.push({ type:'traveler_void', polarity:'negative', note:'time-fact-consumer-only' });
        if (facts.destinationSupportsTraveler === true) evidence.push({ type:'destination_relation', polarity:'positive' });
        if (facts.destinationControlsTraveler === true) evidence.push({ type:'destination_relation', polarity:'negative' });
        if (facts.routeObstruction === true) evidence.push({ type:'route_process_obstruction', polarity:'negative' });
        if (facts.safetySupport === true) evidence.push({ type:'safety_support', polarity:'positive' });
        if (facts.hazardPressure === true) evidence.push({ type:'hazard_pressure', polarity:'negative' });
        if (facts.transportDisrupted === true) evidence.push({ type:'transport_disruption', polarity:'negative' });

        return { duty, evidence, finalAssessment:null };
    };

    const findTraditionalSemanticLeaks = (intent) => {
        const serialized = JSON.stringify(intent || {});
        return ['官鬼','父母','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod']
            .filter((term) => serialized.includes(term));
    };

    GuiJia.liuyaoTravelPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        supportedDuties:[...SUPPORTED_DUTIES],
        deferredDuties:[...DEFERRED_DUTIES],
        resolveTravelerSubject,
        validateIntentContract,
        buildDraftObservationPlan,
        buildTravelEvidence,
        findTraditionalSemanticLeaks
    });
})(typeof window !== 'undefined' ? window : globalThis);
