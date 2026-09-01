(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';

    const SUPPORTED_DUTIES = Object.freeze(new Set([
        'person_return_outcome',
        'person_return_progress',
        'person_return_timing'
    ]));

    const DUTY_CONFIG = Object.freeze({
        person_return_outcome: Object.freeze({
            ruleRef:'TR-PR-001-A',
            targetAspect:'return_outcome',
            requiredGoal:'outcome',
            expectedState:'person_returns'
        }),
        person_return_progress: Object.freeze({
            ruleRef:'TR-PR-001-B',
            targetAspect:'return_progress',
            requiredGoal:'state',
            expectedState:'return_in_progress'
        }),
        person_return_timing: Object.freeze({
            ruleRef:'TR-PR-001-C',
            targetAspect:'return_timing',
            requiredGoal:'timing',
            expectedState:'return_time_resolved'
        })
    });

    const RELATION_SELECTOR = Object.freeze({
        parent:{ type:'six_relative', value:'父母' },
        child:{ type:'six_relative', value:'子孙' },
        wife:{ type:'six_relative', value:'妻财' },
        husband:{ type:'six_relative', value:'官鬼' },
        sibling_or_peer:{ type:'six_relative', value:'兄弟' },
        friend:{ type:'six_relative', value:'兄弟' },
        other_non_kin:{ type:'ying' }
    });

    const issue = (code, extra = {}) => ({ code, ...extra });
    const subject = (source, semanticDuty, selector, required, ruleRef) => ({
        source, semanticDuty, selector, required:Boolean(required), ruleRef
    });
    const goalTypes = (intent) => Array.isArray(intent?.goals)
        ? intent.goals.map((goal) => goal?.type).filter(Boolean)
        : [];
    const isBounded = (value) => ['specific','context_bounded'].includes(value);

    const resolvePersonSubject = (personSubject) => {
        const relation = personSubject?.relationToQuerent || 'unknown';
        if (relation === 'self') {
            return { status:'cross_route', relation, selector:null, issues:[issue('self_return_belongs_to_travel')] };
        }
        if (RELATION_SELECTOR[relation]) {
            return {
                status:'resolved',
                relation,
                selector:{ ...RELATION_SELECTOR[relation] },
                issues:[]
            };
        }
        return {
            status:'unresolved',
            relation,
            selector:null,
            issues:[issue('person_relation_unresolved', { relation })]
        };
    };

    const validateIntentContract = (intent) => {
        const issues = [];
        if (!intent || intent.event?.type !== 'person_return') {
            return { status:'not_applicable', duty:'', issues:[issue('event_not_person_return')] };
        }

        const duty = intent?.semantics?.personReturnDuty || 'unknown';
        const config = DUTY_CONFIG[duty];
        if (!SUPPORTED_DUTIES.has(duty) || !config) {
            issues.push(issue('person_return_duty_unsupported', { duty }));
        }

        if (intent?.semantics?.knownAwayContext !== true) {
            issues.push(issue('known_away_context_required'));
        }
        if (intent?.semantics?.missingOrDisappearance === true) {
            return { status:'blocked', duty, issues:[issue('missing_person_outside_person_return')] };
        }
        if (intent?.semantics?.healthOrSafetyTarget === true) {
            return { status:'cross_route', duty, issues:[issue('health_or_safety_target_outside_person_return')] };
        }
        if (intent?.semantics?.communicationTarget === true) {
            return { status:'deferred', duty, issues:[issue('person_news_contact_deferred')] };
        }

        const person = intent?.personSubject || null;
        if (!person) {
            issues.push(issue('person_subject_missing'));
        } else if (!isBounded(person.specificity)) {
            issues.push(issue('person_subject_unbounded', { specificity:person.specificity || 'unknown' }));
        }

        const resolution = resolvePersonSubject(person);
        if (resolution.status === 'cross_route') {
            return { status:'cross_route', duty, issues:resolution.issues };
        }
        if (resolution.status !== 'resolved') {
            issues.push(...resolution.issues);
        }

        const targetAspect = intent?.semantics?.currentTargetAspect || 'unknown';
        if (config && targetAspect !== config.targetAspect) {
            issues.push(issue('current_target_aspect_mismatch', {
                duty,
                targetAspect,
                expected:config.targetAspect
            }));
        }

        const goals = goalTypes(intent);
        if (config && !goals.includes(config.requiredGoal)) {
            issues.push(issue('required_goal_missing', {
                requiredGoal:config.requiredGoal,
                goals
            }));
        }

        if (duty === 'person_return_timing' && goals.includes('outcome')) {
            issues.push(issue('timing_duty_must_not_implicitly_include_outcome'));
        }
        if (duty === 'person_return_outcome' && goals.includes('timing')) {
            issues.push(issue('outcome_duty_must_not_implicitly_include_timing'));
        }

        if (config?.expectedState && intent?.expectedState && intent.expectedState !== config.expectedState) {
            issues.push(issue('expected_state_mismatch', {
                expected:config.expectedState,
                actual:intent.expectedState
            }));
        }

        return { status:issues.length ? 'insufficient' : 'sufficient', duty, issues, subjectResolution:resolution };
    };

    const buildDraftObservationPlan = (intent) => {
        const validation = validateIntentContract(intent);
        if (validation.status !== 'sufficient') {
            return {
                version:VERSION,
                status:validation.status,
                designOnly:true,
                currentRuntimeReachable:false,
                ruleRef:null,
                subjects:[],
                issues:validation.issues
            };
        }

        const config = DUTY_CONFIG[validation.duty];
        const subjects = [
            subject(
                'primary',
                'returning_person',
                validation.subjectResolution.selector,
                true,
                config.ruleRef
            ),
            subject(
                'role',
                'querent_home_reference',
                { type:'shi' },
                false,
                config.ruleRef
            )
        ];

        return {
            version:VERSION,
            status:'resolved_design',
            designOnly:true,
            currentRuntimeReachable:false,
            ruleRef:config.ruleRef,
            duty:validation.duty,
            subjects,
            issues:[]
        };
    };

    const buildReturnOutcomeEvidence = (intent, facts = {}) => {
        if (intent?.semantics?.personReturnDuty !== 'person_return_outcome') {
            return { status:'not_applicable', evidence:[], finalAssessment:null, scoring:null };
        }
        const evidence = [];
        if (facts.personMoving === true) evidence.push({ type:'movement_state', polarity:'movement_present' });
        if (facts.personMoving === false) evidence.push({ type:'movement_state', polarity:'movement_not_observed' });
        if (facts.movementDirection === 'toward_home') evidence.push({ type:'movement_direction', polarity:'return_support' });
        if (facts.movementDirection === 'away_from_home') evidence.push({ type:'movement_direction', polarity:'return_opposition' });
        if (facts.transformDirection === 'retreat') evidence.push({ type:'transform_direction', polarity:'return_support' });
        if (facts.transformDirection === 'advance') evidence.push({ type:'transform_direction', polarity:'return_opposition' });
        if (facts.personToShiRelation === 'generates_or_combines') evidence.push({ type:'person_home_relation', polarity:'return_support' });
        if (facts.personToShiRelation === 'controls_or_conflicts') evidence.push({ type:'person_home_relation', polarity:'return_opposition' });
        if (facts.blockedByJoin === true) evidence.push({ type:'join_obstruction', polarity:'blocked_or_delayed' });
        if (facts.hiddenFushen === true) evidence.push({ type:'hidden_state', polarity:'not_exposed' });
        if (facts.inTomb === true) evidence.push({ type:'contained_state', polarity:'held_or_delayed' });
        if (facts.void === true) evidence.push({ type:'void_state', polarity:'not_currently_realized', note:'time-fact-consumer-only' });
        return { status:'evidence_only', evidence, finalAssessment:null, scoring:null };
    };

    const buildReturnProgressEvidence = (intent, facts = {}) => {
        if (intent?.semantics?.personReturnDuty !== 'person_return_progress') {
            return { status:'not_applicable', evidence:[], progressState:null };
        }
        const evidence = [];
        if (facts.personMoving === true) evidence.push({ type:'movement_state', value:'moving' });
        if (facts.personMoving === false) evidence.push({ type:'movement_state', value:'static' });
        if (facts.movementDirection === 'toward_home') evidence.push({ type:'movement_direction', value:'toward_home' });
        if (facts.movementDirection === 'away_from_home') evidence.push({ type:'movement_direction', value:'away_from_home' });
        if (facts.routePosition === 'road') evidence.push({ type:'route_position', value:'in_transit' });
        if (facts.routePosition === 'gate') evidence.push({ type:'route_position', value:'near_arrival' });
        if (facts.blockedByJoin === true) evidence.push({ type:'progress_obstruction', value:'blocked_or_delayed' });
        return { status:'evidence_only', evidence, progressState:null };
    };

    const buildReturnTimingTriggers = (intent, facts = {}) => {
        if (intent?.semantics?.personReturnDuty !== 'person_return_timing') {
            return { status:'not_applicable', triggers:[], exactDate:null, timeEngine:'external' };
        }
        const triggers = [];
        if (facts.void === true) triggers.push({ type:'await_void_resolution', sourceFact:'void' });
        if (facts.hiddenFushen === true) triggers.push({ type:'await_hidden_appearance', sourceFact:'hidden_fushen' });
        if (facts.blockedByJoin === true) triggers.push({ type:'await_join_release', sourceFact:'joined' });
        if (facts.inTomb === true) triggers.push({ type:'await_tomb_release', sourceFact:'in_tomb' });
        if (facts.awaitValueTrigger === true) triggers.push({ type:'await_value_trigger', sourceFact:'precomputed_value_trigger' });
        if (facts.awaitClashTrigger === true) triggers.push({ type:'await_clash_trigger', sourceFact:'precomputed_clash_trigger' });
        if (facts.awaitHarmonyTrigger === true) triggers.push({ type:'await_harmony_trigger', sourceFact:'precomputed_harmony_trigger' });
        if (facts.nearTermMovementTrigger === true) triggers.push({ type:'near_term_movement_trigger', sourceFact:'precomputed_movement_trigger' });
        return {
            status:'trigger_only',
            triggers,
            exactDate:null,
            exactDateCalculationPerformed:false,
            timeEngine:'external'
        };
    };

    const findTraditionalSemanticLeaks = (intent) => {
        const serialized = JSON.stringify(intent || {});
        return ['官鬼','父母','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod']
            .filter((term) => serialized.includes(term));
    };

    GuiJia.liuyaoPersonReturnPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        supportedDuties:[...SUPPORTED_DUTIES],
        resolvePersonSubject,
        validateIntentContract,
        buildDraftObservationPlan,
        buildReturnOutcomeEvidence,
        buildReturnProgressEvidence,
        buildReturnTimingTriggers,
        findTraditionalSemanticLeaks
    });
})(typeof window !== 'undefined' ? window : globalThis);
