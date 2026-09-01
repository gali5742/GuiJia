(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';
    const SUPPORTED = Object.freeze([
        'application_based_admission_outcome',
        'supervisor_review_approval',
        'anonymous_or_committee_review_approval',
        'academic_defense_outcome',
        'graduation_qualification',
        'degree_conferral_outcome',
        'academic_certificate_issuance'
    ]);
    const FORBIDDEN_TRADITIONAL_TERMS = Object.freeze([
        '父母','官鬼','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod'
    ]);

    const issue = (code, extra = {}) => ({ code, ...extra });
    const selector = (type, value) => ({ type, ...(value ? { value } : {}) });
    const observation = (source, semanticDuty, selectorValue, required, ruleRef, extra = {}) => ({
        source,
        semanticDuty,
        selector:selectorValue,
        required:Boolean(required),
        ruleRef,
        ...extra
    });

    const findTraditionalSemanticLeaks = (intent) => {
        const serialized = JSON.stringify(intent || {});
        return FORBIDDEN_TRADITIONAL_TERMS.filter((term) => serialized.includes(term));
    };

    const resolveStudySubject = (intent) => {
        const relation = intent?.studySubject?.relationToQuerent || 'unknown';
        if (relation === 'self') return { status:'resolved', selector:selector('shi'), relation, issues:[] };
        if (relation === 'child') return { status:'resolved', selector:selector('six_relative','子孙'), relation, issues:[] };
        return { status:'unresolved', selector:null, relation, issues:[issue('study_subject_relation_not_automated', { relation })] };
    };

    const validateBase = (intent) => {
        if (!intent || intent.event?.type !== 'study_exam') return { status:'insufficient', issues:[issue('event_not_study_exam')] };
        const issues = [];
        const leaks = findTraditionalSemanticLeaks(intent);
        if (leaks.length) issues.push(issue('traditional_semantic_leak', { terms:leaks }));
        const duty = intent?.semantics?.studyDuty || 'unknown';
        if (!SUPPORTED.includes(duty)) issues.push(issue('unsupported_residual_study_duty', { duty }));
        const subject = resolveStudySubject(intent);
        if (subject.status !== 'resolved') issues.push(...subject.issues);
        return { status:issues.length ? 'insufficient' : 'sufficient', duty, subject, issues };
    };

    const bounded = (value) => ['specific','context_bounded'].includes(value);
    const applicationMaterialsIndicated = (intent) => ['explicit','context_supported'].includes(intent?.semantics?.applicationMaterialContext);

    const buildApplicationAdmissionPlan = (intent, subjectResolution) => {
        const issues = [];
        if (intent?.admissionContext?.mode !== 'application_based') issues.push(issue('application_admission_mode_mismatch'));
        if (!bounded(intent?.admissionContext?.specificity)) issues.push(issue('application_admission_not_bounded'));
        const subjects = [observation('role','actual_applicant',subjectResolution.selector,true,'PRR-STUDY-SUBJECT')];
        if (applicationMaterialsIndicated(intent)) {
            subjects.push(observation('domain','application_material_or_portfolio',selector('six_relative','父母'),true,'RC-SE-APP-APPLICATION-MATERIAL'));
        }
        const institution = intent?.educationInstitution || {};
        if (['target_institution','target_program'].includes(institution.role) && bounded(institution.specificity)) {
            issues.push(issue('education_institution_traditional_anchor_unresolved', { role:institution.role }));
        }
        issues.push(issue('application_admission_result_primary_unresolved'));
        return {
            version:VERSION,
            status:issues.some((item) => item.code.endsWith('_mismatch') || item.code.endsWith('_not_bounded')) ? 'unresolved' : 'partial_design',
            subjects,
            unresolvedReasons:issues,
            ruleRefs:[...new Set(subjects.map((item) => item.ruleRef).filter(Boolean))]
        };
    };

    const requireDocumentContext = (intent) => bounded(intent?.academicDocumentContext?.specificity);

    const buildSupervisorReviewPlan = (intent, subjectResolution) => {
        if (!requireDocumentContext(intent)) {
            return { version:VERSION, status:'unresolved', subjects:[], unresolvedReasons:[issue('academic_document_not_bounded')], ruleRefs:[] };
        }
        const authority = intent?.reviewAuthority || {};
        if (authority.authorityRole !== 'supervisor' || !bounded(authority.specificity)) {
            return { version:VERSION, status:'unresolved', subjects:[], unresolvedReasons:[issue('specific_supervisor_authority_required')], ruleRefs:[] };
        }
        const subjects = [
            observation('role','academic_author',subjectResolution.selector,true,'PRR-STUDY-SUBJECT'),
            observation('domain','academic_document_under_review',selector('six_relative','父母'),true,'RC-SE-AR-001'),
            observation('context','specific_supervisor_reviewer',selector('six_relative','父母'),true,'PRR-ACADEMIC-REVIEW-AUTHORITY', { anchorStatus:'unresolved' })
        ];
        return {
            version:VERSION,
            status:'partial_design',
            subjects,
            unresolvedReasons:[issue('same_selector_multiple_real_objects_requires_line_anchoring')],
            ruleRefs:[...new Set(subjects.map((item) => item.ruleRef).filter(Boolean))]
        };
    };

    const buildCommitteeReviewPlan = (intent, subjectResolution) => {
        if (!requireDocumentContext(intent)) {
            return { version:VERSION, status:'unresolved', subjects:[], unresolvedReasons:[issue('academic_document_not_bounded')], ruleRefs:[] };
        }
        const subjects = [
            observation('role','academic_author',subjectResolution.selector,true,'PRR-STUDY-SUBJECT'),
            observation('domain','academic_document_under_review',selector('six_relative','父母'),true,'RC-SE-AR-002')
        ];
        return {
            version:VERSION,
            status:'partial_design',
            subjects,
            unresolvedReasons:[issue('committee_review_authority_selector_unresolved')],
            ruleRefs:[...new Set(subjects.map((item) => item.ruleRef).filter(Boolean))]
        };
    };

    const buildDefensePlan = (intent, subjectResolution) => {
        if (!bounded(intent?.defenseContext?.specificity)) {
            return { version:VERSION, status:'unresolved', subjects:[], unresolvedReasons:[issue('academic_defense_not_bounded')], ruleRefs:[] };
        }
        const subjects = [
            observation('role','actual_defense_candidate',subjectResolution.selector,true,'PRR-STUDY-SUBJECT'),
            observation('domain','thesis_or_academic_artifact',selector('six_relative','父母'),true,'RC-SE-DEF-002')
        ];
        return {
            version:VERSION,
            status:'partial_design',
            subjects,
            unresolvedReasons:[issue('formal_assessment_result_primary_unresolved')],
            ruleRefs:[...new Set(subjects.map((item) => item.ruleRef).filter(Boolean))]
        };
    };

    const GRADUATION_REQUIREMENT_TO_DUTY = Object.freeze({
        academic_document:'academic_document_completion',
        supervisor_review:'supervisor_review_approval',
        committee_review:'anonymous_or_committee_review_approval',
        academic_defense:'academic_defense_outcome',
        degree_conferral:'degree_conferral_outcome'
    });

    const buildGraduationPlan = (intent, subjectResolution) => {
        const requirement = intent?.graduationContext?.activeRequirement || 'unknown';
        const targetDuty = GRADUATION_REQUIREMENT_TO_DUTY[requirement] || null;
        if (targetDuty) {
            return {
                version:VERSION,
                status:'cross_duty',
                routeHint:'study_exam',
                dutyHint:targetDuty,
                subjects:[observation('role','actual_graduation_candidate',subjectResolution.selector,true,'PRR-STUDY-SUBJECT')],
                unresolvedReasons:[issue('graduation_requirement_resolved_to_specific_duty', { requirement, duty:targetDuty })],
                ruleRefs:['PRR-GRADUATION-REQUIREMENT']
            };
        }
        return {
            version:VERSION,
            status:'unresolved',
            subjects:[observation('role','actual_graduation_candidate',subjectResolution.selector,true,'PRR-STUDY-SUBJECT')],
            unresolvedReasons:[issue('graduation_active_requirement_unresolved', { requirement })],
            ruleRefs:['PRR-GRADUATION-REQUIREMENT']
        };
    };

    const buildDegreeConferralPlan = (intent, subjectResolution) => ({
        version:VERSION,
        status:'unresolved',
        subjects:[observation('role','degree_candidate',subjectResolution.selector,true,'PRR-STUDY-SUBJECT')],
        unresolvedReasons:[issue('degree_conferral_traditional_primary_insufficient_evidence')],
        ruleRefs:[]
    });

    const buildCertificateIssuancePlan = (intent, subjectResolution) => {
        const context = intent?.certificateContext || {};
        if (!bounded(context.specificity) || !['issuance','existence','formal_generation'].includes(context.lifecycleTarget)) {
            return {
                version:VERSION,
                status:'unresolved',
                subjects:[],
                unresolvedReasons:[issue('certificate_issuance_target_not_bounded')],
                ruleRefs:[]
            };
        }
        const subjects = [
            observation('primary','academic_certificate_document',selector('six_relative','父母'),true,'TR-SE-CERT-001'),
            observation('role','certificate_recipient',subjectResolution.selector,true,'TR-SE-CERT-001')
        ];
        return {
            version:VERSION,
            status:'resolved_provisional',
            subjects,
            unresolvedReasons:[],
            ruleRefs:['TR-SE-CERT-001']
        };
    };

    const buildDraftObservationPlan = (intent) => {
        const base = validateBase(intent);
        if (base.status !== 'sufficient') {
            return { version:VERSION, status:'unresolved', subjects:[], unresolvedReasons:base.issues, ruleRefs:[] };
        }
        const duty = base.duty;
        if (duty === 'application_based_admission_outcome') return buildApplicationAdmissionPlan(intent, base.subject);
        if (duty === 'supervisor_review_approval') return buildSupervisorReviewPlan(intent, base.subject);
        if (duty === 'anonymous_or_committee_review_approval') return buildCommitteeReviewPlan(intent, base.subject);
        if (duty === 'academic_defense_outcome') return buildDefensePlan(intent, base.subject);
        if (duty === 'graduation_qualification') return buildGraduationPlan(intent, base.subject);
        if (duty === 'degree_conferral_outcome') return buildDegreeConferralPlan(intent, base.subject);
        if (duty === 'academic_certificate_issuance') return buildCertificateIssuancePlan(intent, base.subject);
        return { version:VERSION, status:'unresolved', subjects:[], unresolvedReasons:[issue('unreachable_duty_dispatch')], ruleRefs:[] };
    };

    GuiJia.liuyaoStudyResidualPretraining = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        inputPolicy:'structured_modern_facts_only',
        supportedDuties:SUPPORTED,
        validateBase,
        resolveStudySubject,
        buildDraftObservationPlan,
        findTraditionalSemanticLeaks
    });
})(typeof window !== 'undefined' ? window : globalThis);
