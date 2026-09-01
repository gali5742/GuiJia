(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';

    const SUPPORTED_DUTIES = Object.freeze(new Set([
        'litigation_outcome',
        'dispute_resolution_outcome',
        'dispute_counterparty_action'
    ]));

    const DEFERRED_DUTIES = Object.freeze(new Set([
        'proceeding_acceptance',
        'settlement_suitability',
        'litigation_strategy',
        'generic_dispute_state'
    ]));

    const BASE_RULES = Object.freeze({
        litigation_outcome:'TR-LD-001-A',
        dispute_resolution_outcome:'TR-LD-001-B',
        dispute_counterparty_action:'TR-LD-001-C'
    });

    const OUTSIDE_TARGET_ASPECTS = Object.freeze(new Set([
        'debt_recovery',
        'commercial_performance',
        'relationship_status',
        'employment_status',
        'compensation_amount',
        'legal_information_or_procedure'
    ]));

    const issue = (code, extra = {}) => ({ code, ...extra });
    const candidate = (selector, semanticDuty, source, required, ruleRef) => ({
        selector, semanticDuty, source, required, ruleRef
    });

    const isBounded = (value) => ['specific','context_bounded'].includes(value);
    const documentRelevant = (intent) =>
        ['explicit','context_supported'].includes(intent?.documentContext?.relevance);

    const formalProceedingRelevant = (intent) => {
        const p = intent?.proceedingContext || {};
        return ['lawsuit','arbitration','formal_dispute','pre_litigation_bounded_dispute'].includes(p.type)
            && isBounded(p.specificity);
    };

    const resolutionAction = (intent) =>
        ['settle','withdraw'].includes(intent?.counterpartyAction?.type);

    const validateIntentContract = (intent) => {
        const issues = [];

        if (!intent || intent.event?.type !== 'litigation_dispute') {
            issues.push(issue('event_not_litigation_dispute'));
        }

        const duty = intent?.semantics?.disputeDuty || 'unknown';
        if (DEFERRED_DUTIES.has(duty)) {
            issues.push(issue('dispute_duty_deferred', { duty }));
        } else if (!SUPPORTED_DUTIES.has(duty)) {
            issues.push(issue('dispute_duty_unsupported', { duty }));
        }

        const goals = Array.isArray(intent?.goals)
            ? intent.goals.map((goal) => goal?.type).filter(Boolean)
            : [];
        if (!goals.includes('outcome')) issues.push(issue('outcome_goal_required'));

        const subjectRelation = intent?.disputeSubject?.relationToQuerent || 'unknown';
        if (subjectRelation !== 'self') {
            issues.push(issue(
                subjectRelation === 'represented'
                    ? 'represented_dispute_subject_deferred'
                    : 'self_dispute_subject_required',
                { relationToQuerent:subjectRelation }
            ));
        }

        const targetAspect = intent?.semantics?.currentTargetAspect || 'unknown';
        const expectedAspect = {
            litigation_outcome:'formal_proceeding_outcome',
            dispute_resolution_outcome:'dispute_resolution',
            dispute_counterparty_action:'counterparty_action'
        }[duty];

        if (expectedAspect && targetAspect !== expectedAspect) {
            issues.push(issue('current_target_aspect_mismatch', {
                duty,
                targetAspect,
                expected:expectedAspect
            }));
        }

        if (OUTSIDE_TARGET_ASPECTS.has(targetAspect)) {
            issues.push(issue(`${targetAspect}_outside_litigation`));
        }

        const proceeding = intent?.proceedingContext || {};
        if (!isBounded(proceeding.specificity)) {
            issues.push(issue('proceeding_context_insufficient', {
                specificity:proceeding.specificity || 'unknown'
            }));
        }

        if (duty === 'litigation_outcome') {
            if (!['lawsuit','arbitration','formal_dispute'].includes(proceeding.type)) {
                issues.push(issue('formal_proceeding_required', {
                    proceedingType:proceeding.type || 'unknown'
                }));
            }
        }

        if (duty === 'dispute_resolution_outcome') {
            if (!['lawsuit','arbitration','formal_dispute','pre_litigation_bounded_dispute'].includes(proceeding.type)) {
                issues.push(issue('bounded_dispute_required', {
                    proceedingType:proceeding.type || 'unknown'
                }));
            }
        }

        if (duty === 'dispute_counterparty_action') {
            const counterparty = intent?.counterpartyContext || {};
            if (!isBounded(counterparty.specificity)) {
                issues.push(issue('counterparty_context_insufficient', {
                    specificity:counterparty.specificity || 'unknown'
                }));
            }
            const actionType = intent?.counterpartyAction?.type || 'unknown';
            if (actionType === 'unknown') {
                issues.push(issue('counterparty_action_missing'));
            }
        }

        return { status:issues.length ? 'insufficient' : 'sufficient', issues };
    };

    const buildDraftObservationPlan = (intent) => {
        const contract = validateIntentContract(intent);
        if (contract.status !== 'sufficient') {
            return { status:'unresolved', ruleRef:null, subjects:[], issues:contract.issues };
        }

        const duty = intent.semantics.disputeDuty;
        const ruleRef = BASE_RULES[duty];
        const subjects = [];

        if (duty === 'litigation_outcome') {
            subjects.push(candidate(
                { type:'six_relative', value:'官鬼' },
                'formal_proceeding_or_adjudication',
                'primary',
                true,
                ruleRef
            ));
            subjects.push(candidate({ type:'shi' }, 'self_party', 'role', true, ruleRef));
            subjects.push(candidate({ type:'ying' }, 'counterparty', 'role', true, ruleRef));
            if (documentRelevant(intent)) {
                subjects.push(candidate(
                    { type:'six_relative', value:'父母' },
                    'case_document_or_evidence',
                    'domain',
                    false,
                    ruleRef
                ));
            }
        }

        if (duty === 'dispute_resolution_outcome') {
            subjects.push(candidate(
                { type:'six_relative', value:'官鬼' },
                'active_dispute_or_proceeding',
                'primary',
                true,
                ruleRef
            ));
            subjects.push(candidate({ type:'shi' }, 'self_party', 'role', true, ruleRef));
            subjects.push(candidate({ type:'ying' }, 'counterparty', 'role', true, ruleRef));
            subjects.push(candidate(
                { type:'six_relative', value:'子孙' },
                'settlement_or_dissipation_support',
                'domain',
                false,
                ruleRef
            ));
            if (documentRelevant(intent)) {
                subjects.push(candidate(
                    { type:'six_relative', value:'父母' },
                    'case_document_or_formal_process',
                    'domain',
                    false,
                    ruleRef
                ));
            }
        }

        if (duty === 'dispute_counterparty_action') {
            subjects.push(candidate(
                { type:'ying' },
                'counterparty_action_target',
                'primary',
                true,
                ruleRef
            ));
            subjects.push(candidate({ type:'shi' }, 'self_party', 'role', true, ruleRef));
            if (formalProceedingRelevant(intent)) {
                subjects.push(candidate(
                    { type:'six_relative', value:'官鬼' },
                    'formal_proceeding_context',
                    'domain',
                    false,
                    ruleRef
                ));
            }
            if (resolutionAction(intent)) {
                subjects.push(candidate(
                    { type:'six_relative', value:'子孙' },
                    'settlement_or_withdrawal_context',
                    'domain',
                    false,
                    ruleRef
                ));
            }
            if (documentRelevant(intent)) {
                subjects.push(candidate(
                    { type:'six_relative', value:'父母' },
                    'case_document_or_evidence',
                    'domain',
                    false,
                    ruleRef
                ));
            }
        }

        return { status:'resolved', ruleRef, subjects, issues:[] };
    };

    const buildLitigationEvidence = (intent, facts = {}) => {
        const duty = intent?.semantics?.disputeDuty || 'unknown';
        const evidence = [];
        if (!SUPPORTED_DUTIES.has(duty)) {
            return { duty, evidence, finalAssessment:null, scoring:null };
        }

        if (facts.selfVitality === 'supported') {
            evidence.push({ type:'self_party_vitality', polarity:'positive' });
        }
        if (facts.selfVitality === 'weak') {
            evidence.push({ type:'self_party_vitality', polarity:'negative' });
        }
        if (facts.counterpartyVitality === 'supported') {
            evidence.push({ type:'counterparty_vitality', polarity:'counterparty_support' });
        }
        if (facts.counterpartyVitality === 'weak') {
            evidence.push({ type:'counterparty_vitality', polarity:'counterparty_weakness' });
        }

        if (facts.selfCounterpartyRelation === 'harmonious') {
            evidence.push({ type:'party_relation', polarity:'resolution_support' });
        }
        if (facts.selfCounterpartyRelation === 'conflict') {
            evidence.push({ type:'party_relation', polarity:'dispute_persistence' });
        }
        if (facts.selfCounterpartyRelation === 'self_controls_counterparty') {
            evidence.push({ type:'party_relation', polarity:'self_side_leverage' });
        }
        if (facts.selfCounterpartyRelation === 'counterparty_controls_self') {
            evidence.push({ type:'party_relation', polarity:'counterparty_leverage' });
        }

        if (facts.proceedingPressureOn === 'self') {
            evidence.push({ type:'institutional_pressure', polarity:'negative_to_self' });
        }
        if (facts.proceedingPressureOn === 'counterparty') {
            evidence.push({ type:'institutional_pressure', polarity:'negative_to_counterparty' });
        }
        if (facts.proceedingPressureOn === 'both') {
            evidence.push({ type:'institutional_pressure', polarity:'pressure_on_both' });
        }

        if (facts.documentSupport === 'supported') {
            evidence.push({ type:'case_document_support', polarity:'positive' });
        }
        if (facts.documentSupport === 'weak') {
            evidence.push({ type:'case_document_support', polarity:'negative' });
        }

        if (facts.resolutionSupport === true) {
            evidence.push({ type:'resolution_support', polarity:'positive' });
        }

        if (facts.selfVoid === true) {
            evidence.push({
                type:'self_party_void',
                polarity:'withdrawal_or_retreat_tendency',
                note:'time-fact-consumer-only'
            });
        }
        if (facts.counterpartyVoid === true) {
            evidence.push({
                type:'counterparty_void',
                polarity:'counterparty_withdrawal_or_retreat_tendency',
                note:'time-fact-consumer-only'
            });
        }

        if (facts.counterpartyMoving === true) {
            evidence.push({ type:'counterparty_activity', polarity:'active_or_changing' });
        }

        return { duty, evidence, finalAssessment:null, scoring:null };
    };

    const findTraditionalSemanticLeaks = (intent) => {
        const serialized = JSON.stringify(intent || {});
        return ['官鬼','父母','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod']
            .filter((term) => serialized.includes(term));
    };

    GuiJia.liuyaoLitigationDisputePretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        supportedDuties:[...SUPPORTED_DUTIES],
        deferredDuties:[...DEFERRED_DUTIES],
        validateIntentContract,
        buildDraftObservationPlan,
        buildLitigationEvidence,
        findTraditionalSemanticLeaks
    });
})(typeof window !== 'undefined' ? window : globalThis);
