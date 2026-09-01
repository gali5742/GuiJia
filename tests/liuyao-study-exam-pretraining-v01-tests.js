#!/usr/bin/env node
'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const sourcePath = path.join(ROOT, 'js/liuyao-study-exam-pretraining-v01.js');
const context = { console, JSON, Set, Object, Array, String };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename:sourcePath });
const api = context.GuiJia.liuyaoStudyExamPretraining;
let passed = 0;
let failed = 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const test = (name, fn) => {
    try { fn(); passed += 1; console.log(`✓ ${name}`); }
    catch (error) { failed += 1; console.error(`✗ ${name}`); console.error(`  ${error.message}`); }
};

const base = (overrides = {}) => ({
    event:{ type:'study_exam' },
    goals:[{ type:'outcome' }],
    studySubject:{ relationToQuerent:'self', specificity:'specific' },
    semantics:{
        studyDuty:'qualification_exam_outcome',
        currentTargetAspect:'qualification',
        examPurpose:'qualification',
        competitiveSelection:'not_indicated',
        selectionDimension:'not_indicated',
        applicationMaterialContext:'not_indicated',
        ...(overrides.semantics || {})
    },
    examTarget:{
        text:'六级考试', examType:'language_test', specificity:'specific', resultAspect:'qualification',
        ...(overrides.examTarget || {})
    },
    academicContext:overrides.academicContext,
    educationInstitution:overrides.educationInstitution,
    ...(overrides.top || {})
});

const subjectByDuty = (plan, duty) => plan.subjects.find((item) => item.semanticDuty === duty);

test('SE1 module is design-only and unreachable', () => {
    assert(api.status === 'design_only_unreachable', `status=${api.status}`);
    assert(api.currentRuntimeReachable === false, 'must remain unreachable');
});

test('SE2 self qualification exam is sufficient', () => {
    const result = api.validateIntentContract(base());
    assert(result.status === 'sufficient', JSON.stringify(result));
});

test('SE3 qualification exam uses parent primary and self role', () => {
    const plan = api.buildDraftObservationPlan(base());
    assert(plan.status === 'resolved', plan.status);
    assert(subjectByDuty(plan,'qualification_exam_result')?.selector?.value === '父母', 'qualification primary must be 父母');
    assert(subjectByDuty(plan,'actual_examinee')?.selector?.type === 'shi', 'self examinee must be 世');
});

test('SE4 parent asking child keeps exam primary and resolves child as 子孙 role', () => {
    const intent = base({ top:{ studySubject:{ relationToQuerent:'child', specificity:'specific' } } });
    const plan = api.buildDraftObservationPlan(intent);
    assert(subjectByDuty(plan,'qualification_exam_result')?.selector?.value === '父母', 'exam primary changed incorrectly');
    assert(subjectByDuty(plan,'actual_examinee')?.selector?.value === '子孙', 'child role must resolve to 子孙');
});

test('SE5 sibling represented subject is recognized but not automated', () => {
    const intent = base({ top:{ studySubject:{ relationToQuerent:'sibling', specificity:'specific' } } });
    const result = api.validateIntentContract(intent);
    assert(result.status === 'insufficient', result.status);
    assert(result.issues.some((item) => item.code === 'study_subject_relation_not_automated'), 'missing represented subject issue');
});

test('SE6 exam score uses parent primary', () => {
    const intent = base({
        semantics:{ studyDuty:'exam_score_result', currentTargetAspect:'exam_performance', examPurpose:'ordinary_bounded_exam' },
        examTarget:{ text:'期末考试', examType:'course_exam', specificity:'context_bounded', resultAspect:'score' }
    });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.status === 'resolved', plan.status);
    assert(subjectByDuty(plan,'exam_performance_or_score')?.selector?.value === '父母', 'score primary must be 父母');
    assert(!plan.subjects.some((item) => item.semanticDuty === 'competitive_rank_or_selection_standing'), 'score must not auto-add rank primary');
});

test('SE7 rank uses ghost primary and parent performance domain', () => {
    const intent = base({
        semantics:{ studyDuty:'exam_rank_result', currentTargetAspect:'rank_or_selection', examPurpose:'competitive_rank', competitiveSelection:'explicit' },
        examTarget:{ text:'这次选拔', examType:'other', specificity:'context_bounded', resultAspect:'rank' }
    });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.status === 'resolved', plan.status);
    assert(subjectByDuty(plan,'competitive_rank_or_selection_standing')?.selector?.value === '官鬼', 'rank primary must be 官鬼');
    assert(subjectByDuty(plan,'exam_performance')?.selector?.value === '父母', 'rank should retain parent domain');
});

test('SE8 rank requires competitive context', () => {
    const intent = base({
        semantics:{ studyDuty:'exam_rank_result', currentTargetAspect:'rank_or_selection', examPurpose:'competitive_rank', competitiveSelection:'not_indicated' },
        examTarget:{ text:'考试', examType:'other', specificity:'specific', resultAspect:'rank' }
    });
    const result = api.validateIntentContract(intent);
    assert(result.status === 'insufficient', result.status);
    assert(result.issues.some((item) => item.code === 'competitive_selection_not_established'), 'missing competitive gate');
});

test('SE9 explicit selection dimension can add ghost to qualification', () => {
    const intent = base({ semantics:{ selectionDimension:'explicit' } });
    const plan = api.buildDraftObservationPlan(intent);
    assert(subjectByDuty(plan,'selection_or_title_dimension')?.selector?.value === '官鬼', 'selection domain missing');
});

test('SE10 qualification without selection does not auto-add ghost', () => {
    const plan = api.buildDraftObservationPlan(base());
    assert(!plan.subjects.some((item) => item.semanticDuty === 'selection_or_title_dimension'), 'ghost should not auto-augment');
});

test('SE11 explicit competition adds brothers only as optional domain', () => {
    const intent = base({ semantics:{ competitiveSelection:'explicit' } });
    const plan = api.buildDraftObservationPlan(intent);
    const competition = subjectByDuty(plan,'competition_pressure');
    assert(competition?.selector?.value === '兄弟', 'competition domain missing');
    assert(competition.required === false, 'competition must be optional');
});

test('SE12 ordinary exam does not infer competition', () => {
    const plan = api.buildDraftObservationPlan(base());
    assert(!plan.subjects.some((item) => item.semanticDuty === 'competition_pressure'), 'competition inferred without evidence');
});

test('SE13 academic progress requires bounded context', () => {
    const intent = base({
        semantics:{ studyDuty:'academic_progress', currentTargetAspect:'academic_progress', examPurpose:'unknown' },
        examTarget:{ text:'', examType:'unknown', specificity:'unknown', resultAspect:'unknown' },
        academicContext:{ boundaryType:'term', specificity:'context_bounded' }
    });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.status === 'resolved', plan.status);
    assert(subjectByDuty(plan,'academic_learning_or_progress')?.selector?.value === '父母', 'academic progress primary must be 父母');
});

test('SE14 generic academic state is insufficient/deferred', () => {
    const intent = base({ semantics:{ studyDuty:'generic_study_state', currentTargetAspect:'academic_progress' } });
    const result = api.validateIntentContract(intent);
    assert(result.status === 'deferred', result.status);
});

test('SE15 generic exam pass is deferred, not guessed as qualification', () => {
    const intent = base({ semantics:{ studyDuty:'generic_exam_pass_outcome', currentTargetAspect:'qualification', examPurpose:'unknown' } });
    const result = api.validateIntentContract(intent);
    assert(result.status === 'deferred', result.status);
});

test('SE16 education admission is deferred until institution resolver', () => {
    const intent = base({ semantics:{ studyDuty:'education_admission_outcome', currentTargetAspect:'education_admission', examPurpose:'school_admission' } });
    const result = api.validateIntentContract(intent);
    assert(result.status === 'deferred', result.status);
});

test('SE17 academic document is deferred', () => {
    const intent = base({ semantics:{ studyDuty:'academic_document_outcome', currentTargetAspect:'academic_document' } });
    assert(api.validateIntentContract(intent).status === 'deferred', 'document must defer');
});

test('SE18 education comparison is deferred', () => {
    const intent = base({ semantics:{ studyDuty:'education_choice_comparison', currentTargetAspect:'education_comparison' } });
    assert(api.validateIntentContract(intent).status === 'deferred', 'comparison must defer');
});

test('SE19 scholarship money cross-routes to finance', () => {
    const intent = base({ semantics:{ currentTargetAspect:'scholarship_money' } });
    const result = api.validateIntentContract(intent);
    assert(result.status === 'cross_route' && result.routeHint === 'finance', JSON.stringify(result));
});

test('SE20 final employment acquisition cross-routes to career_position', () => {
    const intent = base({ semantics:{ currentTargetAspect:'employment_acquisition', examPurpose:'employment_linked_final' } });
    const result = api.validateIntentContract(intent);
    assert(result.status === 'cross_route' && result.routeHint === 'career_position', JSON.stringify(result));
});

test('SE21 employment-linked stage can remain qualification study exam', () => {
    const intent = base({ semantics:{ examPurpose:'employment_linked_stage' } });
    assert(api.validateIntentContract(intent).status === 'sufficient', 'stage exam should remain study_exam');
});

test('SE22 semantic intent must not leak traditional selectors', () => {
    const intent = base();
    assert(api.findTraditionalSemanticLeaks(intent).length === 0, 'clean semantic intent leaked');
    const bad = base({ top:{ useGod:'父母' } });
    assert(api.findTraditionalSemanticLeaks(bad).includes('父母'), 'traditional leak not detected');
});

test('SE23 school context alone does not create traditional selector', () => {
    const intent = base({ top:{ educationInstitution:{ text:'A大学', specificity:'specific', role:'target_institution' } } });
    const snap = api.snapshotSemanticContract(intent);
    assert(snap.institutionRole === 'target_institution', 'institution semantic role missing');
    const plan = api.buildDraftObservationPlan(intent);
    assert(!plan.subjects.some((item) => item.semanticDuty === 'specified_education_institution'), 'school must not auto-map');
});

test('SE24 application materials context alone does not alter qualification primary', () => {
    const intent = base({ semantics:{ applicationMaterialContext:'explicit' } });
    const plan = api.buildDraftObservationPlan(intent);
    assert(subjectByDuty(plan,'qualification_exam_result')?.selector?.value === '父母', 'primary changed');
    assert(plan.subjects.filter((item) => item.selector?.value === '父母').length === 1, 'materials context should not auto-add duplicate traditional subject');
});

console.log(`\nStudy exam pretraining regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
