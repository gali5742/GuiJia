(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceScopedSequentialCompositionProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartySourceScopedSequentialCompositionContract || null;
    const competingPathSource = GuiJia.baziContextualForcePartyCompetingRelationPathSource || null;
    const positionSource = GuiJia.baziContextualForcePartyRelationPositionProvenanceSource || null;
    if (!contractApi || !competingPathSource || !positionSource) return;

    const { VERSION, RULE_ID, COMPOSITION_STATES, COMPOSITION_INTERACTION_KINDS, SOURCE_REGISTRY, CONTRACT } = contractApi;
    const {
        RECORDS:PATH_RECORDS,
        PATH_KINDS,
        COEXISTENCE_MODES,
        CONDITION_MODES,
        ORDERING_MODES,
        CONDITION_KINDS
    } = competingPathSource;
    const {
        RECORDS:POSITION_RECORDS,
        POSITION_ASSERTION_KINDS
    } = positionSource;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const pathRecordById = Object.freeze(Object.fromEntries((PATH_RECORDS || []).map((item) => [item.id, item])));
    const positionAssertionById = Object.freeze(Object.fromEntries((POSITION_RECORDS || []).flatMap((record) =>
        (record.assertions || []).map((assertion) => [assertion.id, assertion])
    )));

    const sameOrderedIds = (left = [], right = []) => left.length === right.length && left.every((id, index) => id === right[index]);
    const sameIdSet = (left = [], right = []) => {
        const a = [...new Set(left || [])].sort();
        const b = [...new Set(right || [])].sort();
        return a.length === b.length && a.every((id, index) => id === b[index]);
    };

    const validateCompositionCandidate = (sourceRecord = {}, registryEntry = {}) => {
        const issues = [];
        const assertion = (sourceRecord.relationAssertions || []).find((item) => item.id === registryEntry.relationAssertionId) || null;
        const condition = (sourceRecord.conditions || []).find((item) => item.id === registryEntry.conditionId) || null;
        const positionAssertion = positionAssertionById[registryEntry.positionEvidenceId] || null;
        const pathById = Object.fromEntries((sourceRecord.pathCandidates || []).map((item) => [item.id, item]));
        const orderedPaths = (registryEntry.expectedOrderedPathIds || []).map((id) => pathById[id]).filter(Boolean);
        const containsCompoundPath = orderedPaths.some((item) => item.pathKind === PATH_KINDS.COMPOUND_SOURCE_RELATION);
        const lastPath = orderedPaths[orderedPaths.length - 1] || null;

        if (!sourceRecord.id || sourceRecord.id !== registryEntry.sourceRecordId) issues.push('source-record-registry-mismatch');
        if (!assertion) issues.push('missing-relation-assertion');
        if (!condition) issues.push('missing-position-order-condition');
        if (!positionAssertion) issues.push('missing-position-provenance-assertion');

        if (assertion) {
            if (assertion.coexistenceMode !== COEXISTENCE_MODES.SOURCE_PERMITS_COEXISTENCE) issues.push('source-does-not-permit-coexistence');
            if (assertion.conditionMode !== CONDITION_MODES.SOURCE_CONDITIONAL) issues.push('assertion-is-not-source-conditional');
            if (assertion.orderingMode !== ORDERING_MODES.SOURCE_ORDERED) issues.push('assertion-is-not-source-ordered');
            if (!(assertion.conditionIds || []).includes(registryEntry.conditionId)) issues.push('assertion-does-not-reference-registered-condition');
            if (!sameOrderedIds(assertion.orderedPathIds || [], registryEntry.expectedOrderedPathIds || [])) issues.push('ordered-path-sequence-mismatch');
            if (!sameIdSet(assertion.pathIds || [], registryEntry.expectedOrderedPathIds || [])) issues.push('ordered-paths-do-not-cover-assertion-paths');
            if (assertion.executableSelection !== false || assertion.runtimeWinnerPathId !== null || assertion.numericPriority !== null) issues.push('source-assertion-cannot-pre-resolve-runtime-selection');
        }

        if (condition) {
            if (condition.kind !== CONDITION_KINDS.POSITION_ORDER) issues.push('condition-is-not-position-order');
            if (condition.runtimeResolved !== false) issues.push('source-condition-cannot-be-runtime-resolved');
            if (condition.numericThreshold !== null) issues.push('position-order-condition-cannot-be-numeric');
        }

        if (!(sourceRecord.positionEvidenceIds || []).includes(registryEntry.positionEvidenceId)) issues.push('source-record-missing-position-evidence-link');
        if (positionAssertion) {
            if (positionAssertion.kind !== POSITION_ASSERTION_KINDS.ORDER) issues.push('position-evidence-is-not-source-order');
            if (condition?.sourceWording && positionAssertion.sourceWording !== condition.sourceWording) issues.push('position-condition-wording-mismatch');
            if (positionAssertion.machineDerivedFromPillarDistance === true) issues.push('position-order-cannot-be-distance-derived');
            if (positionAssertion.executableRelationAuthorization === true) issues.push('position-order-cannot-authorize-execution');
        }

        if ((registryEntry.expectedOrderedPathIds || []).length < 2) issues.push('composition-needs-at-least-two-ordered-paths');
        if (orderedPaths.length !== (registryEntry.expectedOrderedPathIds || []).length) issues.push('registered-path-is-missing');
        orderedPaths.forEach((path) => {
            if (path.executable !== false) issues.push(`path-cannot-be-executable:${path.id || ''}`);
            if (path.memberEdgeExpansion !== false) issues.push(`path-cannot-expand-member-edges:${path.id || ''}`);
        });

        if (containsCompoundPath !== (registryEntry.expectedContainsCompoundPath === true)) issues.push('compound-path-presence-mismatch');
        if (!Object.values(COMPOSITION_INTERACTION_KINDS).includes(registryEntry.interactionKind)) issues.push('invalid-composition-interaction-kind');
        if (registryEntry.laterCompoundPathReframesComposition === true) {
            if (registryEntry.interactionKind !== COMPOSITION_INTERACTION_KINDS.LATER_COMPOUND_REFRAMES_COMPOSITION) issues.push('reframing-flag-requires-reframing-interaction-kind');
            if (lastPath?.pathKind !== PATH_KINDS.COMPOUND_SOURCE_RELATION) issues.push('reframing-requires-later-compound-path');
            if (!(lastPath?.intermediateRoleClasses || []).length) issues.push('compound-reframing-path-needs-intermediate-role');
        }

        return Object.freeze({
            valid:issues.length === 0,
            issues:freezeArray(issues),
            assertion,
            condition,
            positionAssertion,
            orderedPaths:freezeArray(orderedPaths),
            containsCompoundPath
        });
    };

    const sequenceStep = (path = {}, index = 0) => Object.freeze({
        step:index + 1,
        pathId:path.id || null,
        pathKind:path.pathKind || null,
        semanticLabel:path.semanticLabel || '',
        sourceRoleClass:path.sourceRoleClass || null,
        predicateWording:path.predicateWording || '',
        targetRoleClass:path.targetRoleClass || null,
        intermediateRoleClasses:freezeArray(path.intermediateRoleClasses || []),
        sourceWording:path.sourceWording || '',
        executable:false,
        memberEdgeExpansion:false
    });

    const buildComposition = (registryEntry = {}) => {
        const sourceRecord = pathRecordById[registryEntry.sourceRecordId] || {};
        const validation = validateCompositionCandidate(sourceRecord, registryEntry);
        if (!validation.valid) {
            return Object.freeze({
                status:COMPOSITION_STATES.UNRESOLVED,
                sourceRecordId:registryEntry.sourceRecordId || null,
                relationAssertionId:registryEntry.relationAssertionId || null,
                conditionId:registryEntry.conditionId || null,
                positionEvidenceId:registryEntry.positionEvidenceId || null,
                interactionKind:registryEntry.interactionKind || null,
                sequence:Object.freeze([]),
                sourceConditionProvenanceValidated:false,
                runtimeChartConditionResolved:false,
                executionAuthorized:false,
                runtimeWinnerPathId:null,
                relationEffects:Object.freeze([]),
                memberEdges:Object.freeze([]),
                numericPriority:null,
                validation
            });
        }

        const sequence = freezeArray(validation.orderedPaths.map(sequenceStep));
        return Object.freeze({
            status:COMPOSITION_STATES.RESOLVED_SOURCE_SCOPED,
            sourceRecordId:sourceRecord.id,
            sourceId:sourceRecord.sourceId || null,
            sourceTier:sourceRecord.sourceTier || null,
            locator:sourceRecord.locator || '',
            relationAssertionId:registryEntry.relationAssertionId,
            conditionId:registryEntry.conditionId,
            positionEvidenceId:registryEntry.positionEvidenceId,
            sourceOrderWording:validation.condition?.sourceWording || '',
            interactionKind:registryEntry.interactionKind,
            sequence,
            orderedPathIds:freezeArray(sequence.map((item) => item.pathId)),
            containsCompoundPath:validation.containsCompoundPath,
            laterCompoundPathReframesComposition:registryEntry.laterCompoundPathReframesComposition === true,
            sourceConditionProvenanceValidated:true,
            runtimeChartConditionResolved:false,
            sourceScopedComposition:true,
            sourceOrderEqualsRuntimePriority:false,
            independentPathAggregation:false,
            executionAuthorized:false,
            runtimeWinnerPathId:null,
            relationEffects:Object.freeze([]),
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericPriority:null,
            numericWeight:null,
            validation,
            boundary:registryEntry.laterCompoundPathReframesComposition === true
                ? '该 composition 只保存来源明确给出的“食先财后”顺序，并保留后一 compound path 对组合解释的重新组织；不得把 compound path 拆成普通 direct edges，也不得据此生成 runtime priority。'
                : '该 composition 只保存来源明确给出的“财先食后”顺序与两条 path 的共存；不得把 sequence 当成权重、执行顺序或独立数值加总。'
        });
    };

    const buildProfile = () => {
        const compositions = freezeArray(Object.values(SOURCE_REGISTRY).map(buildComposition));
        const resolvedCompositions = compositions.filter((item) => item.status === COMPOSITION_STATES.RESOLVED_SOURCE_SCOPED);
        const unresolvedCompositions = compositions.filter((item) => item.status !== COMPOSITION_STATES.RESOLVED_SOURCE_SCOPED);
        return Object.freeze({
            status:unresolvedCompositions.length ? 'source-scoped-sequential-composition-partial' : 'source-scoped-sequential-composition-complete',
            resolverScope:CONTRACT.resolverScope,
            compositions,
            resolvedCompositions:freezeArray(resolvedCompositions),
            unresolvedCompositions:freezeArray(unresolvedCompositions),
            finiteCoverageComplete:unresolvedCompositions.length === 0 && compositions.length === Object.keys(SOURCE_REGISTRY).length,
            runtimeArbitraryChartOrderMatcher:null,
            exclusivePathSelector:null,
            relationEffects:Object.freeze([]),
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            boundary:'Profile 只覆盖 CF-CRP-REC-01/02 两个 source-ordered coexistence records；REC-03 proximity selector、REC-04 relative-capacity selector 与未登记来源继续不在本 resolver 范围。'
        });
    };

    GuiJia.baziContextualForcePartySourceScopedSequentialCompositionProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        COMPOSITION_STATES,
        COMPOSITION_INTERACTION_KINDS,
        CONTRACT,
        sameOrderedIds,
        sameIdSet,
        validateCompositionCandidate,
        buildComposition,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
