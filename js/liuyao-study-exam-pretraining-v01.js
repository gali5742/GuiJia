(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';
    const SUPPORTED_DUTIES = Object.freeze(new Set([
        'exam_score_result',
        'exam_rank_result',
        'qualification_exam_outcome',
        'academic_progress'
    ]));
    const DEFERRED_DUTIES = Object.freeze(new Set([
        'generic_exam_pass_outcome',
        'education_admission_outcome',
        'academic_document_outcome',
        'education_choice_comparison',
        'generic_study_state'
    ]));
    const SUPPORTED_SUBJECT_RELATIONS = Object.freeze(new Set(['self', 'child']));
    const FORBIDDEN_TRADITIONAL_TERMS = Object.freeze([
        '父母','官鬼','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod'
    ]);

    const issue = (code, extra = {}) => ({ code, ...extra });
    const selector = (type, value) => ({ type, ...(value ? { value } : {}) });
    const subject = (source, semanticDuty, selectorValue, required, ruleRef) => ({
        source,
        semanticDuty,
        selector:selectorValue,
        required:Boolean(required),
        ruleRef
    });

    const findTraditionalSemanticLeaks = (intent) => {
        const serialized = JSON.stringify(intent || {});
        return FORBIDDEN_TRADITIONAL_TERMS.filter((term) => serialized.includes(term));
    };

    const resolveStudySubject = (intent) => {
        const relation = intent?.studySubject?.relationToQuerent || 'unknown';
        if (relation === 'self') {
            return {
                status:'resolved',
                subjectRelation:'self',
                selector:selector('shi'),
                evidenceRefs:['SE-F-004'],
                issues:[]
            };
        }
        if (relation === 'child') {
            return {
                status:'resolved',
                subjectRelation:'child',
                selector:selector('six_relative','子孙'),
                evidenceRefs:['SE-F-005'],
                issues:[]
            };
        }
        return {
            status:'unresolved',
            subjectRelation:relation,
            selector:null,
            evidenceRefs:[],
            issues:[issue('study_subject_relation_not_automated', { relation })]
        };
    };

    const validateIntentContract = (intent) => {
        const issues = [];
        if (!intent || intent.event?.type !== 'study_exam') {
            return { status:'insufficient', issues:[issue('event_not_study_exam')] };
        }

        const leaks = findTraditionalSemanticLeaks(intent);
        if (leaks.length) issues.push(issue('traditional_semantic_leak', { terms:leaks }));

        const currentTargetAspect = intent?.semantics?.currentTargetAspect || 'unknown';
        if (currentTargetAspect === 'scholarship_money') {
            return { status:'cross_route', routeHint:'finance', issues:[issue('scholarship_money_is_finance_target')] };
        }
        if (currentTargetAspect === 'employment_acquisition') {
            return { status:'cross_route', routeHint:'career_position', issues:[issue('employment_acquisition_is_career_target')] };
        }

        const duty = intent?.semantics?.studyDuty || 'unknown';
        if (DEFERRED_DUTIES.has(duty)) {
            return { status:'deferred', duty, issues:[issue('study_duty_deferred', { duty })] };
        }
        if (!SUPPORTED_DUTIES.has(duty)) {
            issues.push(issue('unsupported_or_unknown_study_duty', { duty }));
        }

        const subjectRelation = intent?.studySubject?.relationToQuerent || 'unknown';
        if (!SUPPORTED_SUBJECT_RELATIONS.has(subjectRelation)) {
            issues.push(issue('study_subject_relation_not_automated', { relation:subjectRelation }));
        }

        const goalTypes = Array.isArray(intent?.goals)
            ? intent.goals.map((goal) => goal?.type).filter(Boolean)
            : [];
        if (!goalTypes.length) issues.push(issue('goal_missing'));

        if (duty === 'exam_score_result') {
            const target = intent?.examTarget || {};
            if (currentTargetAspect !== 'exam_performance') issues.push(issue('score_target_aspect_mismatch'));
            if (!['score','performance'].includes(target.resultAspect)) issues.push(issue('score_result_aspect_missing'));
            if (!['specific','context_bounded'].includes(target.specificity)) issues.push(issue('exam_target_not_bounded'));
        }

        if (duty === 'exam_rank_result') {
            const target = intent?.examTarget || {};
            if (currentTargetAspect !== 'rank_or_selection') issues.push(issue('rank_target_aspect_mismatch'));
            if (!['rank','selection_stage'].includes(target.resultAspect)) issues.push(issue('rank_result_aspect_missing'));
            if (!['specific','context_bounded'].includes(target.specificity)) issues.push(issue('exam_target_not_bounded'));
            if (!['explicit','context_supported'].includes(intent?.semantics?.competitiveSelection)) {
                issues.push(issue('competitive_selection_not_established'));
            }
        }

        if (duty === 'qualification_exam_outcome') {
            const target = intent?.examTarget || {};
            if (currentTargetAspect !== 'qualification') issues.push(issue('qualification_target_aspect_mismatch'));
            if (!['qualification','pass_fail'].includes(target.resultAspect)) issues.push(issue('qualification_result_aspect_missing'));
            if (!['specific','context_bounded'].includes(target.specificity)) issues.push(issue('exam_target_not_bounded'));
            const purpose = intent?.semantics?.examPurpose || 'unknown';
            if (!['qualification','ordinary_bounded_exam','employment_linked_stage'].includes(purpose)) {
                issues.push(issue('qualification_exam_purpose_not_supported', { purpose }));
            }
        }

        if (duty === 'academic_progress') {
            if (currentTargetAspect !== 'academic_progress') issues.push(issue('academic_progress_target_aspect_mismatch'));
            const boundary = intent?.academicContext?.boundaryType || 'unknown';
            if (!['term','course','stage','program','bounded_period'].includes(boundary)) {
                issues.push(issue('academic_context_not_bounded', { boundary }));
            }
        }

        return {
            status:issues.length ? 'insufficient' : 'sufficient',
            duty,
            issues
        };
    };

    const buildDraftObservationPlan = (intent) => {
        const validation = validateIntentContract(intent);
        if (validation.status !== 'sufficient') {
            return {
                version:VERSION,
                status:validation.status === 'cross_route' ? 'cross_route' : 'unresolved',
                routeHint:validation.routeHint || null,
                subjects:[],
                unresolvedReasons:validation.issues,
                ruleRefs:[]
            };
        }

        const subjectResolution = resolveStudySubject(intent);
        if (subjectResolution.status !== 'resolved') {
            return {
                version:VERSION,
                status:'unresolved',
                subjects:[],
                unresolvedReasons:subjectResolution.issues,
                ruleRefs:[]
            };
        }

        const duty = validation.duty;
        const subjects = [];
        let ruleRef = '';

        if (duty === 'exam_score_result') {
            ruleRef = 'TR-SE-001-A';
            subjects.push(subject('primary','exam_performance_or_score',selector('six_relative','父母'),true,ruleRef));
            subjects.push(subject('role','actual_examinee',subjectResolution.selector,true,ruleRef));
        }

        if (duty === 'exam_rank_result') {
            ruleRef = 'TR-SE-001-B';
            subjects.push(subject('primary','competitive_rank_or_selection_standing',selector('six_relative','官鬼'),true,ruleRef));
            subjects.push(subject('role','actual_examinee',subjectResolution.selector,true,ruleRef));
            subjects.push(subject('domain','exam_performance',selector('six_relative','父母'),false,ruleRef));
        }

        if (duty === 'qualification_exam_outcome') {
            ruleRef = 'TR-SE-001-C';
            subjects.push(subject('primary','qualification_exam_result',selector('six_relative','父母'),true,ruleRef));
            subjects.push(subject('role','actual_examinee',subjectResolution.selector,true,ruleRef));
            if (['explicit','context_supported'].includes(intent?.semantics?.selectionDimension)) {
                subjects.push(subject('domain','selection_or_title_dimension',selector('six_relative','官鬼'),false,'AR-SE-001-SELECTION'));
            }
        }

        if (duty === 'academic_progress') {
            ruleRef = 'TR-SE-001-D';
            subjects.push(subject('primary','academic_learning_or_progress',selector('six_relative','父母'),true,ruleRef));
            subjects.push(subject('role','actual_learner',subjectResolution.selector,true,ruleRef));
        }

        if (['explicit','context_supported'].includes(intent?.semantics?.competitiveSelection)) {
            subjects.push(subject('domain','competition_pressure',selector('six_relative','兄弟'),false,'AR-SE-002-COMPETITION'));
        }

        return {
            version:VERSION,
            status:'resolved',
            subjects,
            primarySubjectIds:subjects.map((item, index) => item.source === 'primary' ? `subject-${index + 1}` : null).filter(Boolean),
            roleSubjectIds:subjects.map((item, index) => item.source === 'role' ? `subject-${index + 1}` : null).filter(Boolean),
            domainSubjectIds:subjects.map((item, index) => item.source === 'domain' ? `subject-${index + 1}` : null).filter(Boolean),
            ruleRefs:[...new Set(subjects.map((item) => item.ruleRef).filter(Boolean))],
            unresolvedReasons:[]
        };
    };

    const snapshotSemanticContract = (intent) => ({
        eventType:intent?.event?.type || null,
        studyDuty:intent?.semantics?.studyDuty || null,
        currentTargetAspect:intent?.semantics?.currentTargetAspect || null,
        examPurpose:intent?.semantics?.examPurpose || null,
        competitiveSelection:intent?.semantics?.competitiveSelection || null,
        selectionDimension:intent?.semantics?.selectionDimension || null,
        subjectRelation:intent?.studySubject?.relationToQuerent || null,
        examType:intent?.examTarget?.examType || null,
        examResultAspect:intent?.examTarget?.resultAspect || null,
        examSpecificity:intent?.examTarget?.specificity || null,
        academicBoundary:intent?.academicContext?.boundaryType || null,
        institutionRole:intent?.educationInstitution?.role || null,
        applicationMaterialContext:intent?.semantics?.applicationMaterialContext || null
    });

    GuiJia.liuyaoStudyExamPretraining = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        supportedDuties:Object.freeze([...SUPPORTED_DUTIES]),
        deferredDuties:Object.freeze([...DEFERRED_DUTIES]),
        validateIntentContract,
        resolveStudySubject,
        buildDraftObservationPlan,
        findTraditionalSemanticLeaks,
        snapshotSemanticContract
    });
})(typeof window !== 'undefined' ? window : globalThis);
