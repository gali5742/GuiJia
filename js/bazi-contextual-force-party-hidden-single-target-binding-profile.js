(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyHiddenSingleTargetBindingProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyHiddenSingleTargetBindingContract || null;
    const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    const annotationSource = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource || null;
    const baziCore = GuiJia.baziCore || null;
    if (!contractApi || !targetSource || !annotationSource || !baziCore?.cangGanMap || !baziCore?.shiShenMap) return;

    const { VERSION, RULE_ID, BINDING_STATES, SOURCE_REGISTRY, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const auditCaseById = Object.freeze(Object.fromEntries((targetSource.AUDIT_CASES || []).map((item) => [item.id, item])));
    const annotationById = Object.freeze(Object.fromEntries((annotationSource.ANNOTATIONS || []).map((item) => [item.id, item])));

    const pillarParts = (chartKey = '') => String(chartKey).split('|').map((pillar) => Array.from(pillar));
    const hiddenActorKey = ({ pillarIndex, zhi, gan, hiddenIndex }) => `hidden:${pillarIndex}:${zhi}:${gan}:${hiddenIndex}`;

    const buildHiddenCandidates = (sourceCase = {}, registryEntry = {}) => {
        const pillars = pillarParts(sourceCase.chartKey || '');
        const dayGan = pillars[2]?.[0] || '';
        const targetZhi = pillars[registryEntry.pillarIndex]?.[1] || '';
        const hidden = baziCore.cangGanMap?.[targetZhi] || [];
        return freezeArray(hidden.map(([gan, level], hiddenIndex) => Object.freeze({
            actorKey:hiddenActorKey({ pillarIndex:registryEntry.pillarIndex, zhi:targetZhi, gan, hiddenIndex }),
            pillar:registryEntry.pillar,
            pillarIndex:registryEntry.pillarIndex,
            zhi:targetZhi,
            gan,
            hiddenIndex,
            level:level || '',
            dayGan,
            tenGod:baziCore.shiShenMap?.[dayGan]?.[gan] || null,
            scope:'hidden-branch'
        })));
    };

    const validateBindingCandidate = (sourceCase = {}, annotation = {}, registryEntry = {}) => {
        const issues = [];
        const candidates = buildHiddenCandidates(sourceCase, registryEntry);
        const roleMatchedCandidates = candidates.filter((item) => item.tenGod === registryEntry.targetRoleClass);
        const relationUnit = (annotation.relationUnits || [])[0] || null;
        const positionEvidenceObserved = (annotation.contextSpans || []).some((span) => span.text === registryEntry.sourcePositionWording);

        if (!sourceCase.id || sourceCase.id !== registryEntry.sourceCaseId) issues.push('source-case-registry-mismatch');
        if (sourceCase.expectedTargetLevel !== registryEntry.targetSemanticLevel) issues.push('target-level-mismatch');
        if (sourceCase.sourceContextType !== 'chart-case') issues.push('source-context-is-not-chart-case');
        if (sourceCase.predicateType !== 'relation-event') issues.push('predicate-is-not-relation-event');
        if (!sourceCase.chartKey) issues.push('missing-chart-key');
        if (sourceCase.candidateScope !== registryEntry.scope) issues.push('source-scope-mismatch');
        if (!annotation.id || annotation.id !== registryEntry.annotationId) issues.push('annotation-registry-mismatch');
        if (annotation.annotationDisposition !== 'relation-target-present') issues.push('annotation-has-no-relation-target');
        if (!positionEvidenceObserved) issues.push('curated-source-position-provenance-missing');
        if (relationUnit?.target?.mentionMode !== 'antecedent-linked') issues.push('target-mention-mode-is-not-antecedent-linked');
        if (relationUnit?.target?.antecedentSpan !== registryEntry.targetAntecedentSpan) issues.push('target-antecedent-mismatch');
        if (relationUnit?.target?.roleClass !== registryEntry.targetRoleClass) issues.push('target-role-class-mismatch');
        if (relationUnit?.target?.semanticLevelHint !== registryEntry.targetSemanticLevel) issues.push('annotation-target-level-mismatch');
        if (relationUnit?.target?.chartBindingEvidence?.scope !== registryEntry.scope) issues.push('annotation-scope-mismatch');
        if (registryEntry.sourcePositionCurated !== true) issues.push('source-position-is-not-curated');
        if (!Number.isInteger(registryEntry.expectedCardinality) || registryEntry.expectedCardinality !== 1) issues.push('invalid-expected-cardinality');
        if (roleMatchedCandidates.length !== registryEntry.expectedCardinality) issues.push('role-matched-candidate-cardinality-mismatch');

        return Object.freeze({
            valid:issues.length === 0,
            issues:freezeArray(issues),
            candidates,
            roleMatchedCandidates:freezeArray(roleMatchedCandidates),
            positionEvidenceObserved
        });
    };

    const buildBinding = (registryEntry = {}) => {
        const sourceCase = auditCaseById[registryEntry.sourceCaseId] || {};
        const annotation = annotationById[registryEntry.annotationId] || {};
        const validation = validateBindingCandidate(sourceCase, annotation, registryEntry);
        const candidate = validation.roleMatchedCandidates[0] || null;
        if (!validation.valid || !candidate) {
            return Object.freeze({
                status:BINDING_STATES.UNRESOLVED,
                sourceCaseId:registryEntry.sourceCaseId || null,
                annotationId:registryEntry.annotationId || null,
                targetRoleClass:registryEntry.targetRoleClass || null,
                targetSemanticLevel:registryEntry.targetSemanticLevel || null,
                targetAntecedentSpan:registryEntry.targetAntecedentSpan || null,
                scope:registryEntry.scope || null,
                stableActorKey:null,
                validation,
                relationEffect:null,
                membershipMutation:null,
                numericWeight:null
            });
        }

        return Object.freeze({
            status:BINDING_STATES.RESOLVED_SOURCE_SCOPED,
            sourceCaseId:sourceCase.id,
            annotationId:annotation.id,
            chartKey:sourceCase.chartKey,
            targetRoleClass:registryEntry.targetRoleClass,
            targetSemanticLevel:registryEntry.targetSemanticLevel,
            targetAntecedentSpan:registryEntry.targetAntecedentSpan,
            sourcePositionWording:registryEntry.sourcePositionWording,
            pillar:registryEntry.pillar,
            pillarIndex:registryEntry.pillarIndex,
            scope:registryEntry.scope,
            stableActorKey:candidate.actorKey,
            actor:Object.freeze({ ...candidate }),
            cardinality:1,
            sourceCaseScopedBinding:true,
            runtimeLexicalPositionParserUsed:false,
            relationEffect:null,
            membershipMutation:null,
            relativeDominance:null,
            numericWeight:null,
            validation,
            boundary:'该 binding 只把 CASE-06 已审定的“四食相制→独杀”与“时逢独杀”绑定到本命例 hour branch 中唯一七杀 hidden actor；不创建 relation effect，也不泛化为所有“独杀”或所有 hidden target 的规则。'
        });
    };

    const buildProfile = () => {
        const bindings = freezeArray(Object.values(SOURCE_REGISTRY).map(buildBinding));
        const resolvedBindings = bindings.filter((item) => item.status === BINDING_STATES.RESOLVED_SOURCE_SCOPED);
        const unresolvedBindings = bindings.filter((item) => item.status !== BINDING_STATES.RESOLVED_SOURCE_SCOPED);
        return Object.freeze({
            status:unresolvedBindings.length ? 'hidden-single-target-binding-partial' : 'hidden-single-target-binding-source-scoped-complete',
            resolverScope:CONTRACT.resolverScope,
            bindings,
            resolvedBindings:freezeArray(resolvedBindings),
            unresolvedBindings:freezeArray(unresolvedBindings),
            sourceCaseIds:freezeArray(bindings.map((item) => item.sourceCaseId)),
            globalHiddenTargetResolver:null,
            relationEffects:Object.freeze([]),
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null
        });
    };

    GuiJia.baziContextualForcePartyHiddenSingleTargetBindingProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        BINDING_STATES,
        CONTRACT,
        pillarParts,
        hiddenActorKey,
        buildHiddenCandidates,
        validateBindingCandidate,
        buildBinding,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);