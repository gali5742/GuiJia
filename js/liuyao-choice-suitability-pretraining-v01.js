(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';

    const SUPPORTED_FORMS = Object.freeze(new Set([
        'compare_alternatives',
        'stay_or_leave',
        'accept_or_reject',
        'continue_or_stop'
    ]));

    const SUPPORTED_GOALS = Object.freeze(new Set([
        'compare_outcomes',
        'compare_suitability'
    ]));

    const ALLOWED_DIMENSIONS = Object.freeze(new Set([
        'target_outcome',
        'stability',
        'livelihood',
        'financial_cost',
        'time_cost',
        'risk',
        'relationship_impact',
        'legal_exposure',
        'institution_fit',
        'unknown'
    ]));

    const ALLOWED_SPECIFICITY = Object.freeze(new Set(['specific','context_bounded']));
    const issue = (code, extra = {}) => ({ code, ...extra });

    const hasTraditionalLeak = (value) => {
        const serialized = JSON.stringify(value || {});
        return ['官鬼','父母','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod']
            .filter((term) => serialized.includes(term));
    };

    const validateChoiceContract = (choice) => {
        const issues = [];
        if (!choice || choice.currentTargetAspect !== 'choice_suitability') {
            issues.push(issue('choice_target_aspect_required'));
        }
        if (!SUPPORTED_FORMS.has(choice?.choiceForm)) {
            issues.push(issue('choice_form_unsupported', { value:choice?.choiceForm || 'unknown' }));
        }
        if (!SUPPORTED_GOALS.has(choice?.decisionGoal)) {
            issues.push(issue('decision_goal_unsupported', { value:choice?.decisionGoal || 'unknown' }));
        }
        const alternatives = Array.isArray(choice?.alternatives) ? choice.alternatives : [];
        if (alternatives.length < 2) issues.push(issue('at_least_two_alternatives_required'));
        const ids = alternatives.map((alt) => alt?.id).filter(Boolean);
        if (ids.length !== alternatives.length) issues.push(issue('alternative_id_required'));
        if (new Set(ids).size !== ids.length) issues.push(issue('alternative_ids_must_be_unique'));
        alternatives.forEach((alt, index) => {
            if (!ALLOWED_SPECIFICITY.has(alt?.specificity)) {
                issues.push(issue('alternative_must_be_bounded', { index, id:alt?.id || null }));
            }
            if (!alt?.domainEventType) issues.push(issue('alternative_domain_event_required', { index, id:alt?.id || null }));
            const leaks = hasTraditionalLeak(alt);
            if (leaks.length) issues.push(issue('traditional_selector_leak_in_alternative', { index, id:alt?.id || null, leaks }));
        });
        const dimensions = Array.isArray(choice?.decisionDimensions) ? choice.decisionDimensions : [];
        if (!dimensions.length) issues.push(issue('decision_dimensions_required'));
        dimensions.forEach((dimension) => {
            if (!ALLOWED_DIMENSIONS.has(dimension)) issues.push(issue('decision_dimension_unsupported', { dimension }));
        });
        return { status:issues.length ? 'insufficient' : 'sufficient', issues };
    };

    const buildAlternativeAdapterRequests = (choice) => {
        const validation = validateChoiceContract(choice);
        if (validation.status !== 'sufficient') {
            return { status:'unresolved', requests:[], issues:validation.issues };
        }
        const requests = choice.alternatives.map((alt) => ({
            alternativeId:alt.id,
            domainEventType:alt.domainEventType,
            semanticRole:alt.semanticRole || 'alternative',
            targetSnapshot:alt.targetSnapshot || null,
            requestedDimensions:[...choice.decisionDimensions],
            traditionalSelector:null,
            adapterRequired:true
        }));
        return { status:'adapter_requests_ready', requests, issues:[] };
    };

    const validateAdapterResult = (alternative, result) => {
        const issues = [];
        if (!result) return { status:'missing', issues:[issue('adapter_result_missing', { alternativeId:alternative.id })] };
        if (result.alternativeId !== alternative.id) issues.push(issue('adapter_alternative_id_mismatch', { expected:alternative.id, actual:result.alternativeId }));
        if (!['resolved','partial','unresolved'].includes(result.status)) issues.push(issue('adapter_status_invalid', { alternativeId:alternative.id, status:result.status }));
        if (result.status === 'resolved' && !result.observationPlan) issues.push(issue('resolved_adapter_requires_observation_plan', { alternativeId:alternative.id }));
        return { status:issues.length ? 'invalid' : result.status, issues };
    };

    const composeAlternativePlans = (choice, adapterResults = []) => {
        const validation = validateChoiceContract(choice);
        if (validation.status !== 'sufficient') {
            return { status:'unresolved', alternatives:[], issues:validation.issues };
        }
        const byId = new Map((adapterResults || []).map((result) => [result?.alternativeId, result]));
        const composed = [];
        const issues = [];
        for (const alternative of choice.alternatives) {
            const result = byId.get(alternative.id) || null;
            const checked = validateAdapterResult(alternative, result);
            if (checked.issues.length) issues.push(...checked.issues);
            composed.push({
                alternativeId:alternative.id,
                semanticRole:alternative.semanticRole || 'alternative',
                domainEventType:alternative.domainEventType,
                adapterStatus:checked.status,
                observationPlan:result?.observationPlan || null,
                dimensionEvidence:result?.dimensionEvidence || {},
                issues:result?.issues || checked.issues
            });
        }
        const statuses = composed.map((item) => item.adapterStatus);
        const status = statuses.every((item) => item === 'resolved')
            ? 'resolved_frame'
            : statuses.some((item) => item === 'resolved' || item === 'partial')
                ? 'partial_frame'
                : 'unresolved_frame';
        return { status, alternatives:composed, issues };
    };

    const buildComparisonFrame = (choice, adapterResults = []) => {
        const composed = composeAlternativePlans(choice, adapterResults);
        if (composed.status === 'unresolved' || composed.status === 'unresolved_frame') {
            return {
                status:composed.status,
                dimensions:choice?.decisionDimensions || [],
                alternatives:composed.alternatives || [],
                overallRecommendation:null,
                scalarScore:null,
                comparisonPolicyStatus:'not_ready',
                issues:composed.issues || []
            };
        }
        const preferencePolicy = choice?.preferencePolicy || null;
        const policyStatus = preferencePolicy?.status === 'explicit'
            ? 'preferences_recorded_but_no_scalar_policy'
            : 'preferences_required_for_overall_suitability';
        return {
            status:composed.status,
            dimensions:[...choice.decisionDimensions],
            alternatives:composed.alternatives,
            overallRecommendation:null,
            scalarScore:null,
            comparisonPolicyStatus:choice.decisionGoal === 'compare_suitability'
                ? policyStatus
                : 'outcome_comparison_requires_normalized_theme_assessment',
            issues:composed.issues
        };
    };

    const buildDeferredThemeExamples = () => ({
        career_transition_comparison:{
            choiceForm:'compare_alternatives',
            alternatives:['current_employment','prospective_employment'],
            forbiddenMapping:'shi_old_ying_new'
        },
        resignation_suitability:{
            choiceForm:'stay_or_leave',
            requiredDimensions:['stability','livelihood','target_outcome','risk']
        },
        education_choice_comparison:{
            choiceForm:'compare_alternatives',
            alternatives:['education_option_a','education_option_b'],
            institutionResolverMayBePartial:true
        },
        settlement_suitability:{
            choiceForm:'accept_or_reject',
            requiredDimensions:['target_outcome','financial_cost','time_cost','risk','legal_exposure']
        },
        litigation_strategy:{
            choiceForm:'continue_or_stop',
            requiredDimensions:['target_outcome','financial_cost','time_cost','risk','legal_exposure']
        }
    });

    GuiJia.liuyaoChoiceSuitabilityPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        validateChoiceContract,
        buildAlternativeAdapterRequests,
        composeAlternativePlans,
        buildComparisonFrame,
        buildDeferredThemeExamples,
        findTraditionalSemanticLeaks:hasTraditionalLeak
    });
})(typeof window !== 'undefined' ? window : globalThis);
