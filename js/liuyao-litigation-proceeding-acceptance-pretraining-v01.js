(function (global) {
  'use strict';

  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1';
  const STATUS = 'design_only_unreachable';

  const SUPPORTED_TARGETS = Object.freeze(new Set([
    'institutional_acceptance',
    'filing_document_acceptance'
  ]));

  const DEFERRED_TARGETS = Object.freeze(new Set([
    'evidence_admission'
  ]));

  const ALLOWED_FILING_STAGES = Object.freeze(new Set([
    'initial_filing',
    'arbitration_filing',
    'appeal_filing',
    'refiling',
    'supplementary_filing'
  ]));

  const RULES = Object.freeze({
    institutional_acceptance:'TR-LD-002-A',
    filing_document_acceptance:'TR-LD-002-B'
  });

  const issue = (code, extra = {}) => ({ code, ...extra });
  const subject = (source, semanticDuty, selector, required, ruleRef) => ({
    source,
    semanticDuty,
    selector,
    required:Boolean(required),
    ruleRef
  });

  const isBounded = (value) => ['specific','context_bounded'].includes(value);
  const hasOutcomeGoal = (intent) => Array.isArray(intent?.goals)
    && intent.goals.some((goal) => goal?.type === 'outcome');

  const filingRelevant = (intent) => ['explicit','structurally_implied']
    .includes(intent?.filingContext?.relevance);

  const validateIntentContract = (intent) => {
    const issues = [];

    if (!intent || intent.event?.type !== 'litigation_dispute') {
      return { status:'not_applicable', issues:[issue('event_not_litigation_dispute')] };
    }

    if (intent?.semantics?.disputeDuty !== 'proceeding_acceptance') {
      return { status:'not_applicable', issues:[issue('duty_not_proceeding_acceptance')] };
    }

    if (intent?.semantics?.currentTargetAspect !== 'proceeding_acceptance') {
      issues.push(issue('current_target_aspect_mismatch', {
        actual:intent?.semantics?.currentTargetAspect || 'unknown'
      }));
    }

    if (!hasOutcomeGoal(intent)) issues.push(issue('outcome_goal_required'));

    const relation = intent?.disputeSubject?.relationToQuerent || 'unknown';
    if (relation !== 'self') {
      issues.push(issue(
        relation === 'represented'
          ? 'represented_dispute_subject_deferred'
          : 'self_dispute_subject_required',
        { relationToQuerent:relation }
      ));
    }

    const proceeding = intent?.proceedingContext || {};
    if (!isBounded(proceeding.specificity)) {
      issues.push(issue('proceeding_context_insufficient', {
        specificity:proceeding.specificity || 'unknown'
      }));
    }

    const acceptance = intent?.acceptanceContext || {};
    const target = acceptance.targetAspect || 'unknown';

    if (DEFERRED_TARGETS.has(target)) {
      return {
        status:'deferred',
        target,
        issues:[issue('acceptance_target_deferred', { target })]
      };
    }

    if (!SUPPORTED_TARGETS.has(target)) {
      issues.push(issue('acceptance_target_unresolved', { target }));
    }

    if (!isBounded(acceptance.specificity)) {
      issues.push(issue('acceptance_context_insufficient', {
        specificity:acceptance.specificity || 'unknown'
      }));
    }

    const stage = acceptance.filingStage || 'unknown';
    if (stage !== 'unknown' && !ALLOWED_FILING_STAGES.has(stage)) {
      issues.push(issue('filing_stage_unsupported', { stage }));
    }

    if (!filingRelevant(intent)) {
      issues.push(issue('filing_context_required', {
        relevance:intent?.filingContext?.relevance || 'unknown'
      }));
    }

    if (intent?.semantics?.currentTargetAspect === 'legal_information_or_procedure') {
      issues.push(issue('legal_information_or_procedure_outside_divination'));
    }

    return {
      status:issues.length ? 'insufficient' : 'sufficient',
      target,
      issues
    };
  };

  const buildDraftObservationPlan = (intent) => {
    const validation = validateIntentContract(intent);
    if (validation.status !== 'sufficient') {
      return {
        version:VERSION,
        status:validation.status === 'deferred' ? 'deferred' : 'unresolved',
        designOnly:true,
        currentRuntimeReachable:false,
        ruleRef:null,
        subjects:[],
        issues:validation.issues
      };
    }

    const target = validation.target;
    const ruleRef = RULES[target];
    const subjects = [];

    if (target === 'institutional_acceptance') {
      subjects.push(subject(
        'primary',
        'formal_proceeding_acceptance',
        { type:'six_relative', value:'官鬼' },
        true,
        ruleRef
      ));
      subjects.push(subject(
        'domain',
        'filing_or_pleading_document',
        { type:'six_relative', value:'父母' },
        true,
        ruleRef
      ));
      subjects.push(subject(
        'role',
        'self_filing_party',
        { type:'shi' },
        true,
        ruleRef
      ));
    }

    if (target === 'filing_document_acceptance') {
      subjects.push(subject(
        'primary',
        'filing_document_acceptance',
        { type:'six_relative', value:'父母' },
        true,
        ruleRef
      ));
      subjects.push(subject(
        'domain',
        'accepting_authority_or_proceeding',
        { type:'six_relative', value:'官鬼' },
        true,
        ruleRef
      ));
      subjects.push(subject(
        'role',
        'self_filing_party',
        { type:'shi' },
        true,
        ruleRef
      ));
    }

    return {
      version:VERSION,
      status:'resolved_design',
      designOnly:true,
      currentRuntimeReachable:false,
      ruleRef,
      coRequiredPair:true,
      subjects,
      issues:[]
    };
  };

  const buildAcceptanceEvidence = (intent, facts = {}) => {
    const validation = validateIntentContract(intent);
    const target = validation.target || intent?.acceptanceContext?.targetAspect || 'unknown';
    const evidence = [];

    if (validation.status !== 'sufficient') {
      return { target, evidence, pairState:'unavailable', finalAssessment:null, scoring:null };
    }

    if (facts.documentSupport === 'supported') {
      evidence.push({ type:'filing_document_readiness', polarity:'positive' });
    }
    if (facts.documentSupport === 'weak') {
      evidence.push({ type:'filing_document_readiness', polarity:'negative' });
    }
    if (facts.authoritySupport === 'supported') {
      evidence.push({ type:'institutional_acceptance_support', polarity:'positive' });
    }
    if (facts.authoritySupport === 'weak') {
      evidence.push({ type:'institutional_acceptance_support', polarity:'negative' });
    }
    if (facts.selfSupport === 'supported') {
      evidence.push({ type:'self_filing_capacity', polarity:'positive' });
    }
    if (facts.selfSupport === 'weak') {
      evidence.push({ type:'self_filing_capacity', polarity:'negative' });
    }

    const documentState = facts.documentSupport || 'unknown';
    const authorityState = facts.authoritySupport || 'unknown';
    let pairState = 'mixed_or_unknown';
    if (documentState === 'supported' && authorityState === 'supported') pairState = 'both_supported';
    if (documentState === 'supported' && authorityState === 'weak') pairState = 'document_supported_authority_weak';
    if (documentState === 'weak' && authorityState === 'supported') pairState = 'authority_supported_document_weak';
    if (documentState === 'weak' && authorityState === 'weak') pairState = 'both_weak';

    evidence.push({ type:'co_required_pair_state', value:pairState });

    return { target, evidence, pairState, finalAssessment:null, scoring:null };
  };

  const findTraditionalSemanticLeaks = (intent) => {
    const serialized = JSON.stringify(intent || {});
    return ['官鬼','父母','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod']
      .filter((term) => serialized.includes(term));
  };

  GuiJia.liuyaoLitigationProceedingAcceptancePretrainingV01 = Object.freeze({
    version:VERSION,
    status:STATUS,
    currentRuntimeReachable:false,
    supportedTargets:[...SUPPORTED_TARGETS],
    deferredTargets:[...DEFERRED_TARGETS],
    validateIntentContract,
    buildDraftObservationPlan,
    buildAcceptanceEvidence,
    findTraditionalSemanticLeaks
  });
})(typeof window !== 'undefined' ? window : globalThis);
