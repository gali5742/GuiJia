#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'js/liuyao-career-position-pretraining-v01.js'), 'utf8'),
    context,
    { filename:'js/liuyao-career-position-pretraining-v01.js' }
);

const api = context.GuiJia.liuyaoCareerPositionPretraining;
let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) throw new Error(message);
}
function test(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
    }
}

function baseIntent(duty, overrides = {}) {
    const config = {
        job_application_outcome: ['employment_acquired', 'target'],
        position_advancement: ['position_advanced', 'target'],
        employment_retention: ['position_retained', 'current'],
        employment_transition_outcome: ['prospective_employment_acquired', 'prospective']
    }[duty] || ['unknown', 'target'];

    const intent = {
        event:{ type:'career_position' },
        goals:[{ type:'outcome' }],
        participants:[{ role:'career_subject', relationToQuerent:'self' }],
        expectedState:config[0],
        careerTarget:{
            text:'目标工作',
            kind:'employment',
            specificity:'context_bounded',
            temporalRole:config[1]
        },
        semantics:{
            careerDuty:duty,
            currentTargetAspect:'position_or_employment',
            applicationStage:'unknown',
            formalizationContext:'not_indicated',
            competitiveSelection:'not_indicated',
            retentionThreat:duty === 'employment_retention' ? 'layoff' : 'none'
        }
    };

    return {
        ...intent,
        ...overrides,
        semantics:{ ...intent.semantics, ...(overrides.semantics || {}) },
        careerTarget:{ ...intent.careerTarget, ...(overrides.careerTarget || {}) }
    };
}

function duties(plan) {
    return plan.subjects.map((item) => item.semanticDuty);
}
function selectorValues(plan) {
    return plan.subjects.map((item) => item.selector.value || item.selector.type);
}

test('CP1 module remains design-only and unreachable', () => {
    assert(api.version === '0.1', `version=${api.version}`);
    assert(api.status === 'design_only_unreachable', `status=${api.status}`);
    assert(api.currentRuntimeReachable === false, 'must remain unreachable');
});

test('CP2 job application outcome is sufficient with bounded employment target', () => {
    const result = api.validateIntentContract(baseIntent('job_application_outcome'));
    assert(result.status === 'sufficient', JSON.stringify(result.issues));
});

test('CP3 job application plan contains only 官鬼 primary and 世 role by default', () => {
    const plan = api.buildDraftObservationPlan(baseIntent('job_application_outcome'));
    assert(plan.status === 'resolved_design', `status=${plan.status}`);
    assert(plan.ruleRef === 'TR-CP-001-A', `rule=${plan.ruleRef}`);
    assert(plan.subjects.length === 2, `subjects=${plan.subjects.length}`);
    assert(selectorValues(plan)[0] === '官鬼', 'primary must be 官鬼');
    assert(selectorValues(plan)[1] === 'shi', 'self must be 世');
});

test('CP4 explicit employer context adds 父母 domain and 应 contextual target', () => {
    const intent = baseIntent('job_application_outcome', {
        employerContext:{ text:'A公司', specificity:'specific', isExternalTarget:true }
    });
    const plan = api.buildDraftObservationPlan(intent);
    assert(duties(plan).includes('employer_organization'), 'missing employer organization duty');
    assert(duties(plan).includes('specified_external_employment_target'), 'missing specified target duty');
    const employer = plan.subjects.find((item) => item.semanticDuty === 'employer_organization');
    const external = plan.subjects.find((item) => item.semanticDuty === 'specified_external_employment_target');
    assert(employer.selector.value === '父母', 'employer domain must resolve to 父母 in traditional draft plan');
    assert(external.selector.type === 'ying', 'specified external target must use 应 contextual observation');
});

test('CP5 applicationStage=contract alone does not trigger formalization augmentation', () => {
    const intent = baseIntent('job_application_outcome', {
        semantics:{ applicationStage:'contract', formalizationContext:'not_indicated' }
    });
    const plan = api.buildDraftObservationPlan(intent);
    assert(!duties(plan).includes('formal_authorization_or_document'), 'stage alone must not trigger formalization');
});

test('CP6 explicit formalizationContext adds 父母 domain without replacing 官鬼 primary', () => {
    const intent = baseIntent('job_application_outcome', {
        semantics:{ formalizationContext:'explicit' }
    });
    const plan = api.buildDraftObservationPlan(intent);
    assert(duties(plan).includes('formal_authorization_or_document'), 'missing formalization duty');
    assert(plan.subjects[0].selector.value === '官鬼', 'primary must remain 官鬼');
});

test('CP7 position advancement uses its own semantic duties', () => {
    const plan = api.buildDraftObservationPlan(baseIntent('position_advancement'));
    assert(plan.ruleRef === 'TR-CP-001-B', `rule=${plan.ruleRef}`);
    assert(duties(plan)[0] === 'target_advanced_position', duties(plan).join(','));
    assert(duties(plan)[1] === 'incumbent_self', duties(plan).join(','));
});

test('CP8 retention requires a bounded threat and current-position target', () => {
    const ok = api.validateIntentContract(baseIntent('employment_retention'));
    assert(ok.status === 'sufficient', JSON.stringify(ok.issues));

    const noThreat = api.validateIntentContract(baseIntent('employment_retention', {
        semantics:{ retentionThreat:'none' }
    }));
    assert(noThreat.status === 'insufficient', 'missing retention threat must block');

    const notCurrent = api.validateIntentContract(baseIntent('employment_retention', {
        careerTarget:{ temporalRole:'target' }
    }));
    assert(notCurrent.status === 'insufficient', 'retention target must be current position');
});

test('CP9 company-wide layoff target is not self employment retention', () => {
    const result = api.validateIntentContract(baseIntent('employment_retention', {
        semantics:{ currentTargetAspect:'employer_organization' },
        careerTarget:{ kind:'employer_organization', temporalRole:'current' }
    }));
    assert(result.status === 'insufficient', 'organization-level layoff must not enter self retention rule');
});

test('CP10 transition outcome requires a prospective employment target', () => {
    const ok = api.validateIntentContract(baseIntent('employment_transition_outcome'));
    assert(ok.status === 'sufficient', JSON.stringify(ok.issues));

    const missing = api.validateIntentContract(baseIntent('employment_transition_outcome', {
        careerTarget:{ temporalRole:'target' },
        employmentAlternatives:[]
    }));
    assert(missing.status === 'insufficient', 'prospective employment target must be required');
});

test('CP11 employment alternatives do not automatically create 世=old / 应=new mapping', () => {
    const intent = baseIntent('employment_transition_outcome', {
        employmentAlternatives:[
            { id:'old', role:'current_employment', text:'现在公司', specificity:'context_bounded' },
            { id:'new', role:'prospective_employment', text:'A公司', specificity:'specific' }
        ]
    });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.subjects.length === 2, `unexpected automatic alternative mapping: ${JSON.stringify(plan.subjects)}`);
    assert(!plan.subjects.some((item) => item.selector.type === 'ying'), '应 must not arise from alternatives alone');
});

test('CP12 transition comparison remains deferred', () => {
    const result = api.validateIntentContract(baseIntent('employment_transition_comparison', {
        expectedState:'unknown',
        semantics:{ currentTargetAspect:'employment_comparison' }
    }));
    assert(result.status === 'deferred', `status=${result.status}`);
});

test('CP13 resignation suitability remains deferred', () => {
    const result = api.validateIntentContract(baseIntent('resignation_suitability', {
        expectedState:'unknown',
        semantics:{ currentTargetAspect:'resignation_decision' }
    }));
    assert(result.status === 'deferred', `status=${result.status}`);
});

test('CP14 probation regularization remains deferred', () => {
    const result = api.validateIntentContract(baseIntent('employment_status_confirmation', {
        expectedState:'unknown'
    }));
    assert(result.status === 'deferred', `status=${result.status}`);
});

test('CP15 generic career state is insufficient for first release', () => {
    const result = api.validateIntentContract(baseIntent('generic_career_state', {
        expectedState:'unknown',
        careerTarget:{ specificity:'generic' }
    }));
    assert(result.status === 'insufficient', `status=${result.status}`);
});

test('CP16 compensation target cannot enter career contract', () => {
    const result = api.validateIntentContract(baseIntent('position_advancement', {
        semantics:{ currentTargetAspect:'compensation' }
    }));
    assert(result.status === 'insufficient', 'compensation must remain cross-route');
    assert(result.issues.some((item) => item.code === 'cross_route_compensation_target'), JSON.stringify(result.issues));
});

test('CP17 represented career subject is unsupported', () => {
    const result = api.validateIntentContract(baseIntent('job_application_outcome', {
        participants:[{ role:'career_subject', relationToQuerent:'friend' }]
    }));
    assert(result.status === 'insufficient', 'represented career subject must not use self rule');
    assert(result.issues.some((item) => item.code === 'represented_career_subject_unsupported'), JSON.stringify(result.issues));
});

test('CP18 competition augmentation only appears when explicitly/contextually supported', () => {
    const plain = api.buildDraftObservationPlan(baseIntent('position_advancement'));
    assert(!duties(plain).includes('competition_pressure'), 'plain advancement must not auto-add competition');

    const competitive = api.buildDraftObservationPlan(baseIntent('position_advancement', {
        semantics:{ competitiveSelection:'explicit' }
    }));
    assert(duties(competitive).includes('competition_pressure'), 'explicit competition should add conditional observation');
});

test('CP19 formalization-document primary target remains deferred', () => {
    const result = api.validateIntentContract(baseIntent('job_application_outcome', {
        semantics:{ currentTargetAspect:'formalization_document', formalizationContext:'explicit' },
        careerTarget:{ kind:'formalization_document' }
    }));
    assert(result.status === 'deferred', `status=${result.status}`);
    assert(result.issues.some((item) => item.code === 'formalization_primary_deferred'), JSON.stringify(result.issues));
});

test('CP20 semantic intent snapshot must contain no traditional selection leakage', () => {
    const intent = baseIntent('job_application_outcome', {
        employerContext:{ text:'A公司', specificity:'specific', isExternalTarget:true }
    });
    const leaks = api.findTraditionalSemanticLeaks(intent);
    assert(leaks.length === 0, `leaks=${leaks.join(',')}`);
    const snapshot = api.summarizeSemanticContract(intent);
    assert(snapshot.traditionalSemanticLeaks.length === 0, JSON.stringify(snapshot));
});

console.log(`\nCareer position pretraining regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
