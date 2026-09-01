(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';

    const SUPPORTED_DUTIES = Object.freeze(new Set([
        'job_application_outcome',
        'position_advancement',
        'employment_retention',
        'employment_transition_outcome'
    ]));

    const DEFERRED_DUTIES = Object.freeze(new Map([
        ['employment_status_confirmation', 'insufficient_rule_evidence'],
        ['employment_transition_comparison', 'alternative_mapping_unresolved'],
        ['resignation_suitability', 'distinct_value_and_livelihood_duty']
    ]));

    const DUTY_CONFIG = Object.freeze({
        job_application_outcome: Object.freeze({
            ruleRef:'TR-CP-001-A',
            primaryDuty:'target_employment_or_position',
            selfDuty:'applicant_self',
            expectedState:'employment_acquired'
        }),
        position_advancement: Object.freeze({
            ruleRef:'TR-CP-001-B',
            primaryDuty:'target_advanced_position',
            selfDuty:'incumbent_self',
            expectedState:'position_advanced'
        }),
        employment_retention: Object.freeze({
            ruleRef:'TR-CP-001-C',
            primaryDuty:'current_position',
            selfDuty:'incumbent_self',
            expectedState:'position_retained'
        }),
        employment_transition_outcome: Object.freeze({
            ruleRef:'TR-CP-001-D',
            primaryDuty:'prospective_employment',
            selfDuty:'transitioning_self',
            expectedState:'prospective_employment_acquired'
        })
    });

    const ALLOWED_TARGET_SPECIFICITY = Object.freeze(new Set(['specific', 'context_bounded']));
    const FORMALIZATION_AUGMENTATION_STATES = Object.freeze(new Set(['explicit', 'context_supported']));
    const COMPETITION_AUGMENTATION_STATES = Object.freeze(new Set(['explicit', 'context_supported']));
    const RETENTION_THREATS = Object.freeze(new Set(['layoff', 'replacement', 'position_loss', 'bounded_unspecified']));

    const issue = (code, extra = {}) => ({ code, ...extra });
    const selector = (type, value) => ({ type, ...(value ? { value } : {}) });
    const subject = (source, semanticDuty, targetSelector, required, ruleRef) => ({
        source,
        semanticDuty,
        selector:targetSelector,
        required:Boolean(required),
        ruleRef
    });

    const goalTypes = (intent) => Array.isArray(intent?.goals)
        ? intent.goals.map((goal) => goal?.type).filter(Boolean)
        : [];

    const selfCareerParticipant = (intent) => (intent?.participants || [])
        .find((participant) => participant?.role === 'career_subject' && participant?.relationToQuerent === 'self');

    const representedCareerParticipant = (intent) => (intent?.participants || [])
        .find((participant) => participant?.role === 'career_subject' && participant?.relationToQuerent && participant.relationToQuerent !== 'self');

    const prospectiveAlternative = (intent) => (intent?.employmentAlternatives || [])
        .find((item) => item?.role === 'prospective_employment');

    const validateIntentContract = (intent) => {
        const issues = [];
        if (!intent || intent.event?.type !== 'career_position') {
            return { status:'not_applicable', duty:'', issues:[issue('event_not_career_position')] };
        }

        const duty = intent?.semantics?.careerDuty || 'unknown';
        if (DEFERRED_DUTIES.has(duty)) {
            return {
                status:'deferred',
                duty,
                issues:[issue('career_duty_deferred', { reason:DEFERRED_DUTIES.get(duty) })]
            };
        }
        if (duty === 'generic_career_state' || duty === 'unknown' || !SUPPORTED_DUTIES.has(duty)) {
            issues.push(issue('career_duty_unsupported_or_insufficient', { value:duty }));
        }

        if (representedCareerParticipant(intent)) {
            issues.push(issue('represented_career_subject_unsupported'));
        }
        if (!selfCareerParticipant(intent)) {
            issues.push(issue('self_career_subject_missing'));
        }

        const goals = goalTypes(intent);
        if (!goals.includes('outcome')) issues.push(issue('career_goal_must_be_outcome', { goals }));

        const targetAspect = intent?.semantics?.currentTargetAspect || 'unknown';
        if (targetAspect === 'formalization_document') {
            return {
                status:'deferred',
                duty,
                issues:[issue('formalization_primary_deferred')]
            };
        }
        if (targetAspect === 'compensation') issues.push(issue('cross_route_compensation_target'));
        else if (targetAspect !== 'position_or_employment') issues.push(issue('career_target_aspect_unsupported', { value:targetAspect }));

        const careerTarget = intent?.careerTarget || null;
        if (!careerTarget) {
            issues.push(issue('career_target_missing'));
        } else if (!ALLOWED_TARGET_SPECIFICITY.has(careerTarget.specificity)) {
            issues.push(issue('career_target_unbounded', { value:careerTarget.specificity || 'unknown' }));
        }

        const expected = DUTY_CONFIG[duty]?.expectedState;
        if (expected && intent?.expectedState && intent.expectedState !== expected) {
            issues.push(issue('expected_state_mismatch', { expected, actual:intent.expectedState }));
        }

        if (duty === 'employment_retention') {
            const threat = intent?.semantics?.retentionThreat || 'unknown';
            if (!RETENTION_THREATS.has(threat)) issues.push(issue('retention_threat_insufficient', { value:threat }));
            if (careerTarget?.temporalRole !== 'current') issues.push(issue('retention_current_position_target_required'));
        }

        if (duty === 'employment_transition_outcome') {
            const prospective = prospectiveAlternative(intent);
            const targetIsProspective = careerTarget?.temporalRole === 'prospective';
            const prospectiveBounded = prospective && ALLOWED_TARGET_SPECIFICITY.has(prospective.specificity);
            if (!targetIsProspective && !prospectiveBounded) issues.push(issue('prospective_employment_target_required'));
        }

        return {
            status:issues.length ? 'insufficient' : 'sufficient',
            duty,
            issues
        };
    };

    const buildAugmentationSubjects = (intent) => {
        const subjects = [];
        const employer = intent?.employerContext || null;
        const employerSpecific = employer && ['specific', 'context_bounded'].includes(employer.specificity);

        if (employerSpecific) {
            subjects.push(subject(
                'domain',
                'employer_organization',
                selector('six_relative', '父母'),
                false,
                'AR-CP-001-EMPLOYER'
            ));
        }

        if (FORMALIZATION_AUGMENTATION_STATES.has(intent?.semantics?.formalizationContext)) {
            subjects.push(subject(
                'domain',
                'formal_authorization_or_document',
                selector('six_relative', '父母'),
                false,
                'AR-CP-002-FORMALIZATION'
            ));
        }

        if (employer?.isExternalTarget === true) {
            subjects.push(subject(
                'role',
                'specified_external_employment_target',
                selector('ying'),
                false,
                'AR-CP-003-SPECIFIED-TARGET'
            ));
        }

        if (COMPETITION_AUGMENTATION_STATES.has(intent?.semantics?.competitiveSelection)) {
            subjects.push(subject(
                'domain',
                'competition_pressure',
                selector('six_relative', '兄弟'),
                false,
                'AR-CP-004-COMPETITION'
            ));
        }

        return subjects;
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
            subject('primary', config.primaryDuty, selector('six_relative', '官鬼'), true, config.ruleRef),
            subject('role', config.selfDuty, selector('shi'), true, config.ruleRef),
            ...buildAugmentationSubjects(intent)
        ];

        return {
            version:VERSION,
            status:'resolved_design',
            designOnly:true,
            currentRuntimeReachable:false,
            ruleRef:config.ruleRef,
            subjects,
            issues:[]
        };
    };

    const TRADITIONAL_LEAK_TERMS = Object.freeze([
        '官鬼', '父母', '妻财', '兄弟', '子孙', '世爻', '应爻', '用神', 'sixRelative', 'useGod'
    ]);

    const findTraditionalSemanticLeaks = (intent) => {
        const serialized = JSON.stringify(intent || {});
        return TRADITIONAL_LEAK_TERMS.filter((term) => serialized.includes(term));
    };

    const summarizeSemanticContract = (intent) => ({
        eventType:intent?.event?.type || 'unknown',
        goalTypes:goalTypes(intent),
        careerDuty:intent?.semantics?.careerDuty || 'unknown',
        currentTargetAspect:intent?.semantics?.currentTargetAspect || 'unknown',
        applicationStage:intent?.semantics?.applicationStage || 'unknown',
        formalizationContext:intent?.semantics?.formalizationContext || 'unknown',
        competitiveSelection:intent?.semantics?.competitiveSelection || 'unknown',
        retentionThreat:intent?.semantics?.retentionThreat || 'unknown',
        careerTargetKind:intent?.careerTarget?.kind || 'unknown',
        careerTargetSpecificity:intent?.careerTarget?.specificity || 'unknown',
        employerSpecificity:intent?.employerContext?.specificity || 'none',
        hasCurrentEmploymentAlternative:Boolean((intent?.employmentAlternatives || []).some((item) => item?.role === 'current_employment')),
        hasProspectiveEmploymentAlternative:Boolean(prospectiveAlternative(intent)),
        traditionalSemanticLeaks:findTraditionalSemanticLeaks(intent)
    });

    GuiJia.liuyaoCareerPositionPretraining = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        supportedDuties:[...SUPPORTED_DUTIES],
        deferredDuties:Object.fromEntries(DEFERRED_DUTIES),
        validateIntentContract,
        buildAugmentationSubjects,
        buildDraftObservationPlan,
        findTraditionalSemanticLeaks,
        summarizeSemanticContract
    });
})(typeof window !== 'undefined' ? window : globalThis);
