(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource?.installed) return;

    const targetContractSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    if (!targetContractSource) return;

    const VERSION = '0.2';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-AUDIT-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const freezeTarget = (target = null) => target ? Object.freeze({
        ...target,
        bindingRequirements:freezeArray(target.bindingRequirements || []),
        chartBindingEvidence:target.chartBindingEvidence ? Object.freeze({
            ...target.chartBindingEvidence,
            sourceActorKeys:freezeArray(target.chartBindingEvidence.sourceActorKeys || []),
            targetCandidateKeys:freezeArray(target.chartBindingEvidence.targetCandidateKeys || [])
        }) : null
    }) : null;
    const freezeRelationUnit = (unit = {}) => Object.freeze({ ...unit, target:freezeTarget(unit.target || null), outcomeSpans:freezeArray(unit.outcomeSpans || []) });
    const freezeAnnotation = (item = {}) => Object.freeze({
        ...item,
        contextSpans:freezeArray((item.contextSpans || []).map((span) => Object.freeze({ ...span }))),
        relationUnits:freezeArray((item.relationUnits || []).map(freezeRelationUnit)),
        sourceEvidenceIds:freezeArray(item.sourceEvidenceIds || []),
        blockerReasons:freezeArray(item.blockerReasons || [])
    });

    const { TARGET_SEMANTIC_LEVELS, SOURCE_CONTEXT_TYPES, PREDICATE_TYPES, EVIDENCE_DIMENSIONS, AUDIT_CASES } = targetContractSource;
    const caseById = Object.freeze(Object.fromEntries((AUDIT_CASES || []).map((item) => [item.id, item])));

    const ANNOTATION_STATES = Object.freeze({ CURATED_AUDITED:'curated-audited', CURATED_PARTIAL:'curated-partial' });
    const ANNOTATION_DISPOSITIONS = Object.freeze({
        RELATION_TARGET_PRESENT:'relation-target-present',
        CONFIGURATION_STATE_ONLY:'configuration-state-only',
        NO_RELATION_TARGET:'no-relation-target'
    });
    const CONTEXT_SPAN_ROLES = Object.freeze({ CONFIGURATION_CONTEXT:'configuration-context', INSTANCE_CONTEXT:'instance-context', CARDINALITY_CONTEXT:'cardinality-context' });
    const TARGET_MENTION_MODES = Object.freeze({ EXPLICIT:'explicit', ANAPHORIC:'anaphoric', ANTECEDENT_LINKED:'antecedent-linked' });
    const RELATION_SEMANTIC_HINTS = Object.freeze({ AUGMENTATION:'anchor-augmentation', OPPOSITION:'anchor-opposition' });
    const fromCase = (caseId = '', extra = {}) => freezeAnnotation({
        upstreamCaseId:caseId,
        sourceId:caseById[caseId]?.sourceId || null,
        sourceText:caseById[caseId]?.sourceText || '',
        sourcePredicateType:caseById[caseId]?.predicateType || null,
        sourceEvidenceIds:[caseId],
        ...extra
    });

    const ANNOTATIONS = freezeArray([
        fromCase('CF-RTLC-CASE-01', {
            id:'CF-CRSA-ANN-01', annotationState:ANNOTATION_STATES.CURATED_AUDITED, annotationDisposition:ANNOTATION_DISPOSITIONS.RELATION_TARGET_PRESENT,
            sourceContextType:SOURCE_CONTEXT_TYPES.THEORY_GENERAL,
            contextSpans:[{ role:CONTEXT_SPAN_ROLES.CARDINALITY_CONTEXT, text:'一杀而食伤并见', semanticLevelHint:TARGET_SEMANTIC_LEVELS.ROLE_CLASS }],
            relationUnits:[
                {
                    id:'CF-CRSA-ANN-01-R01', relationClauseSpan:'制杀太过', sourceRoleSpan:'食伤', sourceRoleClass:'食伤', predicateSpan:'制',
                    predicateType:PREDICATE_TYPES.GENERALIZED_RELATION_RULE, relationSemanticHint:RELATION_SEMANTIC_HINTS.OPPOSITION,
                    target:{ span:'杀', mentionMode:TARGET_MENTION_MODES.EXPLICIT, antecedentSpan:null, roleClass:'七杀', semanticLevelHint:TARGET_SEMANTIC_LEVELS.ROLE_CLASS, semanticLevelHintExecutable:false, chartBindingRequired:false, bindingRequirements:[] },
                    outcomeSpans:['太过']
                },
                {
                    id:'CF-CRSA-ANN-01-R02', relationClauseSpan:'官助之', sourceRoleSpan:'官', sourceRoleClass:'正官', predicateSpan:'助',
                    predicateType:PREDICATE_TYPES.GENERALIZED_RELATION_RULE, relationSemanticHint:RELATION_SEMANTIC_HINTS.AUGMENTATION,
                    target:{ span:'之', mentionMode:TARGET_MENTION_MODES.ANAPHORIC, antecedentSpan:'杀', roleClass:'七杀', semanticLevelHint:TARGET_SEMANTIC_LEVELS.ROLE_CLASS, semanticLevelHintExecutable:false, chartBindingRequired:false, bindingRequirements:[EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY] },
                    outcomeSpans:[]
                }
            ],
            statement:'一个 source statement 可含多个 relation unit；“之”必须保留回指“杀”的 antecedent provenance。'
        }),
        fromCase('CF-RTLC-CASE-02', {
            id:'CF-CRSA-ANN-02', annotationState:ANNOTATION_STATES.CURATED_AUDITED, annotationDisposition:ANNOTATION_DISPOSITIONS.RELATION_TARGET_PRESENT,
            sourceContextType:SOURCE_CONTEXT_TYPES.THEORY_GENERAL,
            contextSpans:[{ role:CONTEXT_SPAN_ROLES.CONFIGURATION_CONTEXT, text:'杀重身轻', semanticLevelHint:TARGET_SEMANTIC_LEVELS.CONFIGURATION }],
            relationUnits:[{
                id:'CF-CRSA-ANN-02-R01', relationClauseSpan:'财星党杀', sourceRoleSpan:'财星', sourceRoleClass:'财星', predicateSpan:'党',
                predicateType:PREDICATE_TYPES.GENERALIZED_RELATION_RULE, relationSemanticHint:RELATION_SEMANTIC_HINTS.AUGMENTATION,
                target:{ span:'杀', mentionMode:TARGET_MENTION_MODES.EXPLICIT, antecedentSpan:null, roleClass:'七杀', semanticLevelHint:TARGET_SEMANTIC_LEVELS.ROLE_CLASS, semanticLevelHintExecutable:false, chartBindingRequired:false, bindingRequirements:[] },
                outcomeSpans:[]
            }],
            sourceEvidenceIds:['CF-RTLC-CASE-02','CF-CTS-E07','CF-PAE-E02'],
            statement:'Configuration context 与 relation source/predicate/target 分开保存，避免运行时把整句强制成一个 semantic level。'
        }),
        fromCase('CF-RTLC-CASE-04', {
            id:'CF-CRSA-ANN-03', annotationState:ANNOTATION_STATES.CURATED_AUDITED, annotationDisposition:ANNOTATION_DISPOSITIONS.RELATION_TARGET_PRESENT,
            sourceContextType:SOURCE_CONTEXT_TYPES.CHART_CASE, chartKey:caseById['CF-RTLC-CASE-04']?.chartKey || null,
            contextSpans:[
                { role:CONTEXT_SPAN_ROLES.CARDINALITY_CONTEXT, text:'庚金并透', semanticLevelHint:TARGET_SEMANTIC_LEVELS.ACTOR_SET },
                { role:CONTEXT_SPAN_ROLES.INSTANCE_CONTEXT, text:'丙火独透', semanticLevelHint:TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR }
            ],
            relationUnits:[{
                id:'CF-CRSA-ANN-03-R01', relationClauseSpan:'制杀扶身', sourceRoleSpan:'丙火', sourceRoleClass:'食神', predicateSpan:'制',
                predicateType:PREDICATE_TYPES.RELATION_EVENT, relationSemanticHint:RELATION_SEMANTIC_HINTS.OPPOSITION,
                target:{
                    span:'杀', mentionMode:TARGET_MENTION_MODES.EXPLICIT, antecedentSpan:'庚金并透', roleClass:'七杀', semanticLevelHint:TARGET_SEMANTIC_LEVELS.ACTOR_SET, semanticLevelHintExecutable:false, chartBindingRequired:true,
                    bindingRequirements:[EVIDENCE_DIMENSIONS.CHART_LOCAL_CANDIDATE_BINDING,EVIDENCE_DIMENSIONS.CARDINALITY_BINDING,EVIDENCE_DIMENSIONS.SCOPE_PROVENANCE],
                    chartBindingEvidence:{ sourceActorKeys:['visible:3:丙'], targetCandidateKeys:['visible:0:庚','visible:1:庚'], explicitCardinality:2, scope:'visible-stem', stableActorKey:null, bindingResolved:false, executableGroupIdentity:false }
                },
                outcomeSpans:['扶身']
            }],
            sourceEvidenceIds:['CF-RTLC-CASE-04','CF-CTS-E04','CF-PAE-E04'],
            statement:'命例可保存 actor-set candidate/cardinality/scope evidence，但不得因此创建 executable group 或 member edges。'
        }),
        fromCase('CF-RTLC-CASE-06', {
            id:'CF-CRSA-ANN-04', annotationState:ANNOTATION_STATES.CURATED_PARTIAL, annotationDisposition:ANNOTATION_DISPOSITIONS.RELATION_TARGET_PRESENT,
            sourceContextType:SOURCE_CONTEXT_TYPES.CHART_CASE, chartKey:caseById['CF-RTLC-CASE-06']?.chartKey || null,
            contextSpans:[{ role:CONTEXT_SPAN_ROLES.INSTANCE_CONTEXT, text:'时逢独杀', semanticLevelHint:TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR }],
            relationUnits:[{
                id:'CF-CRSA-ANN-04-R01', relationClauseSpan:'四食相制', sourceRoleSpan:'四食', sourceRoleClass:'食神', predicateSpan:'制',
                predicateType:PREDICATE_TYPES.RELATION_EVENT, relationSemanticHint:RELATION_SEMANTIC_HINTS.OPPOSITION,
                target:{
                    span:null, mentionMode:TARGET_MENTION_MODES.ANTECEDENT_LINKED, antecedentSpan:'独杀', roleClass:'七杀', semanticLevelHint:TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR, semanticLevelHintExecutable:false, chartBindingRequired:true,
                    bindingRequirements:[EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,EVIDENCE_DIMENSIONS.CHART_LOCAL_CANDIDATE_BINDING,EVIDENCE_DIMENSIONS.SCOPE_PROVENANCE],
                    chartBindingEvidence:{ sourceActorKeys:[], targetCandidateKeys:[], explicitCardinality:1, scope:'hidden-branch', stableActorKey:null, bindingResolved:false, executableGroupIdentity:false }
                },
                outcomeSpans:[]
            }],
            sourceEvidenceIds:['CF-RTLC-CASE-06','CF-CTS-E01'],
            blockerReasons:['target-is-antecedent-linked-not-explicit-in-relation-clause','hidden-scope-stable-actor-key-unresolved'],
            statement:'“四食相制”的 target 依赖前文“独杀”；annotation 必须允许 antecedent-linked target，并继续保留 hidden actor binding unresolved。'
        }),
        fromCase('CF-RTLC-CASE-03', {
            id:'CF-CRSA-ANN-05', annotationState:ANNOTATION_STATES.CURATED_AUDITED, annotationDisposition:ANNOTATION_DISPOSITIONS.RELATION_TARGET_PRESENT,
            sourceContextType:SOURCE_CONTEXT_TYPES.THEORY_GENERAL,
            contextSpans:[{ role:CONTEXT_SPAN_ROLES.CONFIGURATION_CONTEXT, text:'身杀两停', semanticLevelHint:TARGET_SEMANTIC_LEVELS.CONFIGURATION }],
            relationUnits:[{
                id:'CF-CRSA-ANN-05-R01', relationClauseSpan:'食神制杀', sourceRoleSpan:'食神', sourceRoleClass:'食神', predicateSpan:'制',
                predicateType:PREDICATE_TYPES.GENERALIZED_RELATION_RULE, relationSemanticHint:RELATION_SEMANTIC_HINTS.OPPOSITION,
                target:{ span:'杀', mentionMode:TARGET_MENTION_MODES.EXPLICIT, antecedentSpan:null, roleClass:'七杀', semanticLevelHint:TARGET_SEMANTIC_LEVELS.ROLE_CLASS, semanticLevelHintExecutable:false, chartBindingRequired:false, bindingRequirements:[] },
                outcomeSpans:[]
            }],
            sourceEvidenceIds:['CF-RTLC-CASE-03','CF-CTS-E06'],
            statement:'“身杀两停”保存为 configuration condition；“食神制杀”保存为 theory-general role-class relation，不把“两停”误当 actor cardinality。'
        }),
        fromCase('CF-RTLC-CASE-05', {
            id:'CF-CRSA-ANN-06', annotationState:ANNOTATION_STATES.CURATED_AUDITED, annotationDisposition:ANNOTATION_DISPOSITIONS.RELATION_TARGET_PRESENT,
            sourceContextType:SOURCE_CONTEXT_TYPES.CHART_CASE, chartKey:caseById['CF-RTLC-CASE-05']?.chartKey || null,
            contextSpans:[
                { role:CONTEXT_SPAN_ROLES.CARDINALITY_CONTEXT, text:'两杀当权临旺', semanticLevelHint:TARGET_SEMANTIC_LEVELS.ACTOR_SET },
                { role:CONTEXT_SPAN_ROLES.INSTANCE_CONTEXT, text:'年干壬水临申', semanticLevelHint:TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR }
            ],
            relationUnits:[{
                id:'CF-CRSA-ANN-06-R01', relationClauseSpan:'足以制杀', sourceRoleSpan:'年干壬水', sourceRoleClass:'食神', predicateSpan:'制',
                predicateType:PREDICATE_TYPES.RELATION_EVENT, relationSemanticHint:RELATION_SEMANTIC_HINTS.OPPOSITION,
                target:{
                    span:'杀', mentionMode:TARGET_MENTION_MODES.EXPLICIT, antecedentSpan:'两杀当权临旺', roleClass:'七杀', semanticLevelHint:TARGET_SEMANTIC_LEVELS.ACTOR_SET, semanticLevelHintExecutable:false, chartBindingRequired:true,
                    bindingRequirements:[EVIDENCE_DIMENSIONS.CHART_LOCAL_CANDIDATE_BINDING,EVIDENCE_DIMENSIONS.CARDINALITY_BINDING,EVIDENCE_DIMENSIONS.SCOPE_PROVENANCE],
                    chartBindingEvidence:{ sourceActorKeys:['visible:0:壬'], targetCandidateKeys:['visible:1:丙','visible:3:丙'], explicitCardinality:2, scope:'visible-stem', stableActorKey:null, bindingResolved:false, executableGroupIdentity:false }
                },
                outcomeSpans:[]
            }],
            sourceEvidenceIds:['CF-RTLC-CASE-05','CF-CTS-E05'],
            statement:'“两杀”只有在具体 chart candidate、cardinality 与 visible scope 对齐后才是 actor-set evidence；annotation 本身仍不执行 group identity 或 collective effect。'
        }),
        fromCase('CF-RTLC-CASE-07', {
            id:'CF-CRSA-ANN-07', annotationState:ANNOTATION_STATES.CURATED_AUDITED, annotationDisposition:ANNOTATION_DISPOSITIONS.CONFIGURATION_STATE_ONLY,
            sourceContextType:SOURCE_CONTEXT_TYPES.THEORY_GENERAL,
            contextSpans:[
                { role:CONTEXT_SPAN_ROLES.CONFIGURATION_CONTEXT, text:'杀重', semanticLevelHint:TARGET_SEMANTIC_LEVELS.CONFIGURATION },
                { role:CONTEXT_SPAN_ROLES.CONFIGURATION_CONTEXT, text:'杀微', semanticLevelHint:TARGET_SEMANTIC_LEVELS.CONFIGURATION },
                { role:CONTEXT_SPAN_ROLES.CONFIGURATION_CONTEXT, text:'杀势猖狂', semanticLevelHint:TARGET_SEMANTIC_LEVELS.CONFIGURATION },
                { role:CONTEXT_SPAN_ROLES.CONFIGURATION_CONTEXT, text:'支全杀局', semanticLevelHint:TARGET_SEMANTIC_LEVELS.CONFIGURATION },
                { role:CONTEXT_SPAN_ROLES.CONFIGURATION_CONTEXT, text:'制杀太过', semanticLevelHint:TARGET_SEMANTIC_LEVELS.CONFIGURATION }
            ],
            relationUnits:[],
            sourceEvidenceIds:['CF-RTLC-CASE-07','CF-CTS-E07','CF-CTS-E08'],
            statement:'该记录只保存 configuration-state 语义；“制杀太过”在此 audit case 中属于 aggregate state evidence，不为满足 relation schema 人工制造 actor-addressable target。'
        }),
        fromCase('CF-RTLC-CASE-08', {
            id:'CF-CRSA-ANN-08', annotationState:ANNOTATION_STATES.CURATED_AUDITED, annotationDisposition:ANNOTATION_DISPOSITIONS.NO_RELATION_TARGET,
            sourceContextType:SOURCE_CONTEXT_TYPES.THEORY_GENERAL,
            contextSpans:[
                { role:CONTEXT_SPAN_ROLES.INSTANCE_CONTEXT, text:'独杀乘权', semanticLevelHint:TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR },
                { role:CONTEXT_SPAN_ROLES.CARDINALITY_CONTEXT, text:'众杀有制', semanticLevelHint:TARGET_SEMANTIC_LEVELS.ACTOR_SET }
            ],
            relationUnits:[],
            sourceEvidenceIds:['CF-RTLC-CASE-08','CF-CTS-E01','CF-CTS-E02'],
            blockerReasons:['no-relation-target-span','instance-description-not-relation-event'],
            statement:'该段只证明 singular/plural role-instance language 存在；没有 relation-target span，因此 annotation 明确保留 no-relation-target，而不是强制四选一。'
        })
    ]);

    const validateAnnotation = (item = {}) => {
        const issues = [];
        if (!item.id) issues.push('missing-id');
        if (!item.upstreamCaseId || !caseById[item.upstreamCaseId]) issues.push('missing-or-unknown-upstream-case');
        if (!Object.values(ANNOTATION_STATES).includes(item.annotationState)) issues.push('invalid-annotation-state');
        if (!Object.values(ANNOTATION_DISPOSITIONS).includes(item.annotationDisposition)) issues.push('invalid-annotation-disposition');
        if (!Object.values(SOURCE_CONTEXT_TYPES).includes(item.sourceContextType)) issues.push('invalid-source-context-type');
        if (!Object.values(PREDICATE_TYPES).includes(item.sourcePredicateType)) issues.push('invalid-source-predicate-type');
        (item.contextSpans || []).forEach((span) => {
            if (!Object.values(CONTEXT_SPAN_ROLES).includes(span.role)) issues.push(`invalid-context-span-role:${span.role || ''}`);
            if (!span.text) issues.push('missing-context-span-text');
        });
        if (item.annotationDisposition === ANNOTATION_DISPOSITIONS.RELATION_TARGET_PRESENT && !(item.relationUnits || []).length) issues.push('relation-target-disposition-requires-relation-unit');
        if ([ANNOTATION_DISPOSITIONS.CONFIGURATION_STATE_ONLY,ANNOTATION_DISPOSITIONS.NO_RELATION_TARGET].includes(item.annotationDisposition) && (item.relationUnits || []).length) issues.push('non-relation-disposition-cannot-carry-relation-unit');
        if (item.annotationDisposition === ANNOTATION_DISPOSITIONS.CONFIGURATION_STATE_ONLY && !(item.contextSpans || []).some((span) => span.semanticLevelHint === TARGET_SEMANTIC_LEVELS.CONFIGURATION)) issues.push('configuration-state-disposition-requires-configuration-span');
        (item.relationUnits || []).forEach((unit) => {
            if (!unit.id || !unit.relationClauseSpan || !unit.predicateSpan) issues.push(`incomplete-relation-unit:${unit.id || ''}`);
            if (!Object.values(PREDICATE_TYPES).includes(unit.predicateType)) issues.push(`invalid-predicate-type:${unit.id || ''}`);
            const target = unit.target || null;
            if (!target) return issues.push(`missing-target:${unit.id || ''}`);
            if (!Object.values(TARGET_MENTION_MODES).includes(target.mentionMode)) issues.push(`invalid-target-mention-mode:${unit.id || ''}`);
            if (!Object.values(TARGET_SEMANTIC_LEVELS).includes(target.semanticLevelHint)) issues.push(`invalid-target-level-hint:${unit.id || ''}`);
            if (target.semanticLevelHintExecutable !== false) issues.push(`target-hint-must-be-non-executable:${unit.id || ''}`);
            if ([TARGET_MENTION_MODES.ANAPHORIC,TARGET_MENTION_MODES.ANTECEDENT_LINKED].includes(target.mentionMode) && !target.antecedentSpan) issues.push(`missing-antecedent:${unit.id || ''}`);
            if (target.mentionMode === TARGET_MENTION_MODES.EXPLICIT && !target.span) issues.push(`missing-explicit-target-span:${unit.id || ''}`);
            if ([TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR,TARGET_SEMANTIC_LEVELS.ACTOR_SET].includes(target.semanticLevelHint)) {
                if (target.chartBindingRequired !== true) issues.push(`instance-level-must-require-chart-binding:${unit.id || ''}`);
                if (!(target.bindingRequirements || []).includes(EVIDENCE_DIMENSIONS.CHART_LOCAL_CANDIDATE_BINDING)) issues.push(`missing-candidate-binding-gate:${unit.id || ''}`);
                if (!(target.bindingRequirements || []).includes(EVIDENCE_DIMENSIONS.SCOPE_PROVENANCE)) issues.push(`missing-scope-gate:${unit.id || ''}`);
            }
            if (target.semanticLevelHint === TARGET_SEMANTIC_LEVELS.ACTOR_SET && !(target.bindingRequirements || []).includes(EVIDENCE_DIMENSIONS.CARDINALITY_BINDING)) issues.push(`missing-cardinality-gate:${unit.id || ''}`);
            if (target.chartBindingEvidence?.executableGroupIdentity === true) issues.push(`annotation-cannot-create-executable-group:${unit.id || ''}`);
        });
        return Object.freeze({ valid:issues.length === 0, issues:freezeArray(issues) });
    };
    const validateRegistry = (records = ANNOTATIONS) => {
        const results = freezeArray((records || []).map((item) => Object.freeze({ id:item.id, ...validateAnnotation(item) })));
        return Object.freeze({ valid:results.every((item) => item.valid), results, issueCount:results.reduce((sum, item) => sum + item.issues.length, 0) });
    };
    const validateFiniteTargetAuditCorpusCoverage = (records = ANNOTATIONS) => {
        const expectedCaseIds = freezeArray((AUDIT_CASES || []).map((item) => item.id));
        const annotatedCaseIds = freezeArray([...new Set((records || []).map((item) => item.upstreamCaseId).filter(Boolean))]);
        const missingCaseIds = freezeArray(expectedCaseIds.filter((id) => !annotatedCaseIds.includes(id)));
        const extraCaseIds = freezeArray(annotatedCaseIds.filter((id) => !expectedCaseIds.includes(id)));
        return Object.freeze({
            corpusId:'CF-CRSA-FINITE-TARGET-AUDIT-CORPUS-V02',
            scope:'relation-target-semantic-level-contract-audit-cases-only',
            expectedCaseIds,
            annotatedCaseIds,
            missingCaseIds,
            extraCaseIds,
            expectedCaseCount:expectedCaseIds.length,
            annotatedCaseCount:annotatedCaseIds.length,
            complete:missingCaseIds.length === 0 && extraCaseIds.length === 0
        });
    };
    const FINITE_TARGET_AUDIT_CORPUS_COVERAGE = validateFiniteTargetAuditCorpusCoverage();
    function sourceIds() { return freezeArray(ANNOTATIONS.map((item) => item.id)); }

    const FINDINGS = freezeArray([
        Object.freeze({ id:'CF-CRSA-F01', key:'curated-source-semantic-annotation-is-viable', status:'supported', value:true, evidenceIds:sourceIds() }),
        Object.freeze({ id:'CF-CRSA-F02', key:'runtime-classical-chinese-parser-required-for-audited-source-registry', status:'rejected', value:false, evidenceIds:sourceIds() }),
        Object.freeze({ id:'CF-CRSA-F03', key:'one-source-statement-equals-one-relation-unit', status:'rejected', value:false, evidenceIds:freezeArray(['CF-CRSA-ANN-01']) }),
        Object.freeze({ id:'CF-CRSA-F04', key:'relation-target-must-be-explicit-inside-relation-clause', status:'rejected', value:false, evidenceIds:freezeArray(['CF-CRSA-ANN-01','CF-CRSA-ANN-04']) }),
        Object.freeze({ id:'CF-CRSA-F05', key:'target-coreference-and-antecedent-provenance-required', status:'required', value:true, evidenceIds:freezeArray(['CF-CRSA-ANN-01','CF-CRSA-ANN-04']) }),
        Object.freeze({ id:'CF-CRSA-F06', key:'finite-target-audit-corpus-annotation-coverage-complete', status:'supported', value:FINITE_TARGET_AUDIT_CORPUS_COVERAGE.complete, evidenceIds:sourceIds() }),
        Object.freeze({ id:'CF-CRSA-F07', key:'broader-relation-source-registry-annotation-coverage-complete', status:'not-defined', value:false, evidenceIds:sourceIds() }),
        Object.freeze({ id:'CF-CRSA-F08', key:'annotation-record-must-contain-relation-unit', status:'rejected', value:false, evidenceIds:freezeArray(['CF-CRSA-ANN-07','CF-CRSA-ANN-08']) })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT-001', version:VERSION, sourceAuditOnly:true,
        annotationUnit:'source-evidence-record', curatedSourceSemanticAnnotationSupported:true, curatedSourceAnnotationPreferredForAuditedFiniteCorpus:true,
        runtimeClassicalChineseParserRequiredForAuditedCorpus:false, runtimeClassicalChineseParserDefined:false,
        multipleRelationUnitsPerSourceRecordSupported:true, zeroRelationUnitAnnotationsSupported:true, mixedContextAndRelationSpansSupported:true,
        configurationStateMayBeAnnotationWithoutRelationUnit:true, instanceDescriptionWithoutRelationTargetMayBeAnnotationWithoutRelationUnit:true,
        targetCoreferenceAntecedentProvenanceRequired:true, relationTargetMustBeExplicitInsideRelationClause:false,
        sourceContextMayBeCuratedInsteadOfRuntimeClassified:true, predicateTypeMayBeCuratedInsteadOfRuntimeClassified:true,
        targetSemanticLevelHintIsSourceEvidence:true, targetSemanticLevelHintIsExecutableResult:false,
        chartBindingEvidenceIsExecutableBinding:false, actorSetCandidateEvidenceCreatesGroupIdentity:false,
        annotationValidatorDefined:true,
        finiteTargetAuditCorpusCoverageComplete:FINITE_TARGET_AUDIT_CORPUS_COVERAGE.complete,
        finiteTargetAuditCorpusCoverageScope:FINITE_TARGET_AUDIT_CORPUS_COVERAGE.scope,
        annotationCoverageComplete:false,
        broaderRelationSourceRegistryCoverageComplete:false,
        targetSemanticLevelResolverDefined:false, actorGroupIdentityContractDefined:false, collectiveRelationEffectExecutionDefined:false,
        numericAggregation:false, numericWeights:false, thresholding:false, majorityVoting:false, ranking:false, scalarCollapse:false, finalStrengthMapping:false,
        statement:'有限、可追踪的传统 relation source registry 优先采用人工审定 curated annotation，直接保存 context、relation unit、predicate、source/target role、target mention mode、target-level evidence hint 与实例 binding requirements；Relation Target 八个 audit case 已完成逐条 annotation，但这只证明该 finite audit corpus 的 coverage，不代表更广 relation source registry 已完成统一 annotation。'
    });

    GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource = Object.freeze({
        installed:true, VERSION, RULE_ID, ANNOTATION_STATES, ANNOTATION_DISPOSITIONS, CONTEXT_SPAN_ROLES, TARGET_MENTION_MODES, RELATION_SEMANTIC_HINTS,
        ANNOTATIONS, FINITE_TARGET_AUDIT_CORPUS_COVERAGE, FINDINGS, CONTRACT, validateAnnotation, validateRegistry, validateFiniteTargetAuditCorpusCoverage
    });
})(typeof window !== 'undefined' ? window : globalThis);