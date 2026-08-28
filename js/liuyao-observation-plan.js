(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const registry = GuiJia.liuyaoRuleRegistry;
    if (!registry?.selectObservationRule) throw new Error('liuyao-rule-registry.js must be loaded before liuyao-observation-plan.js');

    const findTargets = (selector, rows = [], flyingHidden = []) => {
        if (!selector) return [];
        if (selector.type === 'shi') return rows.filter((line) => line.isShi).map((line) => ({ key:`line-${line.position}`, type:'line', position:line.position, relation:line.relation, isShi:true, isYing:Boolean(line.isYing) }));
        if (selector.type === 'ying') return rows.filter((line) => line.isYing).map((line) => ({ key:`line-${line.position}`, type:'line', position:line.position, relation:line.relation, isShi:Boolean(line.isShi), isYing:true }));
        if (selector.type !== 'six_relative') return [];
        const visible = rows.filter((line) => line.relation === selector.value)
            .map((line) => ({ key:`line-${line.position}`, type:'line', position:line.position, relation:line.relation, isShi:Boolean(line.isShi), isYing:Boolean(line.isYing) }));
        if (visible.length) return visible;
        return flyingHidden.filter((item) => item.candidate && item.hiddenRelation === selector.value)
            .map((item) => ({ key:`hidden-${item.position}`, type:'hidden', position:item.position, relation:item.hiddenRelation, flyPosition:item.position, isShi:false, isYing:false }));
    };

    const resolveSelectorSpec = (selectorSpec, intent) => {
        if (!selectorSpec) return { status:'missing', selector:null, issue:{ type:'missing_selector' } };
        if (selectorSpec.kind === 'static') return { status:'resolved', selector:selectorSpec.value, issue:null };
        if (selectorSpec.kind === 'resolver') {
            if (selectorSpec.resolverRef === 'PRR-REPRESENTED-MARRIAGE-SUBJECT') {
                return { status:'unresolved', selector:null, issue:{ type:'resolver_pending', resolverRef:selectorSpec.resolverRef, participant:intent?.participants?.find((item) => item.role === 'represented_subject') || null } };
            }
            return { status:'unresolved', selector:null, issue:{ type:'unknown_resolver', resolverRef:selectorSpec.resolverRef } };
        }
        return { status:'unresolved', selector:null, issue:{ type:'invalid_selector_spec' } };
    };

    const resolveCandidate = (candidate, intent, rows, flyingHidden, index) => {
        const selectorResolution = resolveSelectorSpec(candidate.selector, intent);
        const semanticDuty = candidate.semanticDuty?.kind === 'static' ? candidate.semanticDuty.value : '';
        if (selectorResolution.status !== 'resolved') {
            return {
                id:`subject-${index + 1}`,
                source:candidate.source,
                semanticDuty,
                selector:null,
                required:Boolean(candidate.required),
                resolvedTargets:[],
                resolutionStatus:'missing',
                ruleRef:candidate.ruleRef,
                issue:selectorResolution.issue
            };
        }
        const targets = findTargets(selectorResolution.selector, rows, flyingHidden);
        return {
            id:`subject-${index + 1}`,
            source:candidate.source,
            semanticDuty,
            selector:selectorResolution.selector,
            required:Boolean(candidate.required),
            resolvedTargets:targets,
            resolutionStatus:targets.length === 1 ? 'resolved' : targets.length > 1 ? 'multiple_candidates' : 'missing',
            ruleRef:candidate.ruleRef
        };
    };

    const buildCrossObservationRelations = (subjects = []) => {
        const resolved = subjects.filter((subject) => subject.resolutionStatus === 'resolved' && subject.resolvedTargets.length === 1);
        const relations = [];
        for (let i = 0; i < resolved.length; i += 1) {
            for (let j = i + 1; j < resolved.length; j += 1) {
                const a = resolved[i];
                const b = resolved[j];
                if (a.resolvedTargets[0].key === b.resolvedTargets[0].key) {
                    relations.push({
                        sourceSubjectId:a.id,
                        targetSubjectId:b.id,
                        type:'same_target',
                        direction:'mutual',
                        context:'base_hexagram'
                    });
                }
            }
        }
        return relations;
    };

    const buildObservationPlan = (intent, rows = [], flyingHidden = [], options = {}) => {
        if (!intent) return null;
        const selection = registry.selectObservationRule(intent, options);
        if (selection.status !== 'resolved') {
            return {
                version:'0.1', status:'unresolved', subjects:[], primarySubjectIds:[], roleSubjectIds:[], domainSubjectIds:[], auxiliarySubjectIds:[],
                ruleRefs:[...selection.baseRuleRefs, ...selection.augmentationRuleRefs], unresolvedReasons:selection.issues,
                provisionalRuleRefs:selection.provisionalCandidates || [], legacyPrimaryTarget:null, crossObservationRelations:[]
            };
        }

        const subjects = selection.candidates.map((candidate, index) => resolveCandidate(candidate, intent, rows, flyingHidden, index));
        const blocking = subjects.filter((subject) => subject.required && subject.resolutionStatus !== 'resolved');
        const unresolvedReasons = blocking.map((subject) => ({
            type: subject.issue?.type || (subject.resolutionStatus === 'multiple_candidates' ? 'multiple_candidates' : 'required_subject_missing'),
            subjectId:subject.id,
            semanticDuty:subject.semanticDuty,
            selector:subject.selector,
            ruleRef:subject.ruleRef,
            ...(subject.issue || {})
        }));
        const primarySubjects = subjects.filter((subject) => subject.source === 'primary');
        const uniquePrimaryTarget = primarySubjects.length === 1 && primarySubjects[0].resolutionStatus === 'resolved'
            ? primarySubjects[0].resolvedTargets[0]
            : null;
        const ruleRefs = [...selection.baseRuleRefs, ...selection.augmentationRuleRefs];
        const plan = {
            version:'0.1',
            status:blocking.length ? 'unresolved' : 'resolved',
            subjects,
            primarySubjectIds:subjects.filter((subject) => subject.source === 'primary').map((subject) => subject.id),
            roleSubjectIds:subjects.filter((subject) => subject.source === 'role').map((subject) => subject.id),
            domainSubjectIds:subjects.filter((subject) => subject.source === 'domain').map((subject) => subject.id),
            auxiliarySubjectIds:subjects.filter((subject) => subject.source === 'auxiliary').map((subject) => subject.id),
            timingObserverId:primarySubjects.length === 1 ? primarySubjects[0].id : undefined,
            ruleRefs,
            unresolvedReasons,
            provisionalRuleRefs:selection.provisionalCandidates || [],
            legacyPrimaryTarget:uniquePrimaryTarget,
            crossObservationRelations:[]
        };
        plan.crossObservationRelations = buildCrossObservationRelations(subjects);
        return plan;
    };

    const parseQuestionSync = (question, options = {}) => {
        const parser = GuiJia.liuyaoSemanticParser;
        if (parser?.parseQuestionSync) return parser.parseQuestionSync(question, options.semantic || {});
        return { intent:GuiJia.liuyaoIntent.parseDivinationIntent(question), source:'baseline', validation:{ valid:true, errors:[] }, diagnostics:{ requiresNlp:false, schemaGaps:[] } };
    };

    const completePipeline = (question, semanticParse, rows, flyingHidden, options) => {
        const intent = semanticParse?.intent || null;
        if (!intent) return { intent:null, semanticParse, diagnosis:null, selection:null, plan:null };
        const selection = registry.selectObservationRule(intent, options);
        const plan = buildObservationPlan(intent, rows, flyingHidden, options);
        const diagnosis = GuiJia.liuyaoSemanticParser?.classifyPipelineResult
            ? GuiJia.liuyaoSemanticParser.classifyPipelineResult({ question, intent, selection, plan, semanticParse })
            : null;
        return { intent, semanticParse, diagnosis, selection, plan };
    };

    const analyzeQuestionToPlan = (question, rows = [], flyingHidden = [], options = {}) => {
        const semanticParse = parseQuestionSync(question, options);
        return completePipeline(question, semanticParse, rows, flyingHidden, options);
    };

    const analyzeQuestionToPlanAsync = async (question, rows = [], flyingHidden = [], options = {}) => {
        const parser = GuiJia.liuyaoSemanticParser;
        const semanticParse = parser?.parseQuestion
            ? await parser.parseQuestion(question, options.semantic || {})
            : parseQuestionSync(question, options);
        return completePipeline(question, semanticParse, rows, flyingHidden, options);
    };

    GuiJia.liuyaoObservationPlan = Object.freeze({
        findTargets,
        buildCrossObservationRelations,
        buildObservationPlan,
        analyzeQuestionToPlan,
        analyzeQuestionToPlanAsync
    });
})(typeof window !== 'undefined' ? window : globalThis);
