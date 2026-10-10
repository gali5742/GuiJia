(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePositionProvenanceConsumerProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourcePositionProvenanceConsumerContract;
    const source = GuiJia.baziContextualForcePartyRelationPositionProvenanceSource;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource;
    if (!api || !source || !realization) return;
    const { VERSION, RULE_ID, STATES, ANNOTATIONS, SOURCE_REGISTRY, CONTRACT, freeze } = api;
    const copy = (value) => JSON.parse(JSON.stringify(value));
    // Exact structural comparison also rejects extra outcome/priority fields and lost provenance.
    const same = (left, right) => {
        if (left === right) return true;
        if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
        if (Array.isArray(left) !== Array.isArray(right)) return false;
        if (Array.isArray(left) && left.length !== right.length) return false;
        const keys = Object.keys(right);
        return Object.keys(left).length === keys.length && keys.every((key) =>
            Object.prototype.hasOwnProperty.call(left, key) && same(left[key], right[key]));
    };
    const invalidInput = (id, issues) => freeze({
        sourceRecordId:id || null, normalizationState:STATES.INVALID, units:[], validation:{ valid:false, issues }
    });
    const normalizeRecord = (input = {}) => {
        const item = typeof input === 'string' ? SOURCE_REGISTRY[input] : input;
        const registered = item && SOURCE_REGISTRY[item.id];
        if (!registered || !same(item, registered)) return invalidInput(item?.id, ['registered-position-source-mismatch']);
        const validation = source.validateRecord(item);
        if (!validation.valid) return invalidInput(item.id, [...validation.issues]);
        const units = [];
        for (const assertion of item.assertions) {
            const annotations = ANNOTATIONS[assertion.id];
            if (!annotations?.length) return invalidInput(item.id, ['curated-position-annotation-missing']);
            for (const [index, annotation] of annotations.entries()) {
                const participants = annotation.refIds.map((refId) => assertion.participants.find((p) => p.id === refId));
                if (participants.some((p) => !p)) return invalidInput(item.id, ['position-participant-reference-missing']);
                units.push({
                    id:`${assertion.id}-U${index + 1}`, sourceAssertionId:assertion.id,
                    kind:assertion.kind, sourceWording:assertion.sourceWording,
                    semanticAssertion:copy(annotation),
                    participants:participants.map((p) => ({
                        refId:p.id, participantRole:p.participantRole, roleClass:p.roleClass, scope:p.scope,
                        candidateActorKeys:[...p.candidateActorKeys],
                        placements:p.pillarLabels.map((pillar, i) => ({ pillar, pillarIndex:p.pillarIndexes[i] })),
                        declaredBinding:p.bindingResolved === true
                    })),
                    counterfactual:assertion.counterfactual ? copy(assertion.counterfactual) : null
                });
            }
        }
        return freeze({
            normalizationState:STATES.NORMALIZED, sourceRecordId:item.id,
            sourceContractId:CONTRACT.sourcePositionContractId, sourceRuleId:CONTRACT.sourceRuleId,
            provenance:{ sourceId:item.sourceId, sourceTier:item.sourceTier, locator:item.locator,
                sourceExtract:item.sourceExtract, chartKey:item.chartKey,
                interpretationContested:item.interpretationContested },
            units, validation:{ valid:true, issues:[] }
        });
    };
    const validateNormalizedRecord = (input = {}) => {
        const expected = normalizeRecord(input?.sourceRecordId || '');
        const valid = expected.normalizationState === STATES.NORMALIZED && same(input, expected);
        return freeze({ valid, issues:valid ? [] : ['normalized-position-provenance-mismatch'] });
    };
    const chartParts = (chartKey) => {
        if (typeof chartKey !== 'string') return null;
        const parts = chartKey.split('|');
        return parts.length === 4 && parts.every((p) => /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/.test(p)) ? parts : null;
    };
    const bindParticipant = (participant, parts) => {
        const keys = participant.candidateActorKeys;
        const placements = participant.placements;
        // This binds explicit visible identities only; role classes and branch scope stay unresolved.
        const valid = participant.declaredBinding && participant.scope === 'visible-stem'
            && keys.length > 0 && keys.length === placements.length && new Set(keys).size === keys.length
            && keys.every((key, index) => {
                const match = /^visible:([0-3]):([甲乙丙丁戊己庚辛壬癸])$/.exec(key);
                const placement = placements[index];
                return match && Number(match[1]) === placement.pillarIndex
                    && ['year','month','day','hour'][placement.pillarIndex] === placement.pillar
                    && parts[placement.pillarIndex][0] === match[2];
            });
        return freeze({ refId:participant.refId, scope:participant.scope, roleClass:participant.roleClass,
            bindingState:valid ? 'resolved-explicit-visible-placement' : 'unresolved-position-participant',
            actorKeys:valid ? [...keys] : [],
            placementEvidence:copy(placements),
            issues:valid ? [] : ['explicit-visible-identity-and-placement-required'] });
    };
    const resolveNormalizedRecord = (input = {}, chartKey = null) => {
        const validation = validateNormalizedRecord(input);
        const base = { sourceRecordId:input?.sourceRecordId || null, validation,
            executionAuthorized:false, relationEffects:[], memberEdges:[], runtimeTargetActorKey:null,
            runtimeWinnerPathId:null, numericScore:null, relativeDominance:null };
        if (!validation.valid) return freeze({ ...base, status:STATES.UNRESOLVED, units:[] });
        const sourceChart = input.provenance.chartKey?.replace(/ /g, '|') || null;
        if (!sourceChart) {
            return freeze({ ...base, status:STATES.PATTERN, provenance:copy(input.provenance),
                units:input.units.map((unit) => ({ ...copy(unit), status:STATES.PATTERN,
                    participantBindings:[], runtimeConditionResolved:false })) });
        }
        const parts = chartParts(chartKey);
        if (!parts || chartKey !== sourceChart) return freeze({ ...base, status:STATES.UNRESOLVED, units:[],
            provenance:copy(input.provenance), blockerReasons:['exact-source-chart-required'] });
        const units = input.units.map((unit) => {
            const bindings = unit.participants.map((p) => bindParticipant(p, parts));
            const issues = [];
            if (bindings.some((p) => p.bindingState !== 'resolved-explicit-visible-placement')) issues.push('position-participant-binding-unresolved');
            if (unit.semanticAssertion.mode === 'counterfactual-source-chart') {
                const original = unit.counterfactual?.originalPlacements || [];
                const alternative = unit.counterfactual?.alternativePlacements || [];
                const refs = unit.semanticAssertion.refIds;
                if (original.length !== refs.length || alternative.length !== refs.length
                    || !refs.every((refId) => original.filter((p) => p.refId === refId).length === 1
                        && alternative.filter((p) => p.refId === refId).length === 1
                        && unit.participants.find((p) => p.refId === refId)?.placements.some((p) =>
                            p.pillar === original.find((o) => o.refId === refId)?.pillar))) issues.push('counterfactual-placement-provenance-invalid');
            }
            return { ...copy(unit), status:issues.length ? STATES.UNRESOLVED : STATES.RESOLVED,
                participantBindings:bindings, blockerReasons:issues, runtimeConditionResolved:false };
        });
        return freeze({ ...base, provenance:copy(input.provenance),
            status:units.every((unit) => unit.status === STATES.RESOLVED) ? STATES.RESOLVED : STATES.UNRESOLVED, units });
    };
    const buildProfile = (semanticModel = {}, synthesis = {}) => {
        const normalizedRecords = Object.keys(SOURCE_REGISTRY).map(normalizeRecord);
        const sourceRecords = normalizedRecords.map((record) => resolveNormalizedRecord(record, record.provenance?.chartKey?.replace(/ /g, '|')));
        const chartKey = realization.buildStructuredChartKey(semanticModel, synthesis) || null;
        const runtimeRecords = normalizedRecords.filter((record) =>
            chartKey && record.provenance?.chartKey?.replace(/ /g, '|') === chartKey)
            .map((record) => resolveNormalizedRecord(record, chartKey));
        return freeze({
            status:'source-position-provenance-consumer-evaluated', normalizedRecords, sourceRecords, runtimeRecords,
            sourceInputCoverageComplete:normalizedRecords.length === 5 && normalizedRecords.every((r) => r.normalizationState === STATES.NORMALIZED),
            normalizedUnitCount:normalizedRecords.reduce((sum, r) => sum + r.units.length, 0),
            sourcePatternCount:sourceRecords.filter((r) => r.status === STATES.PATTERN).length,
            resolvedSourceChartCount:sourceRecords.filter((r) => r.status === STATES.RESOLVED).length,
            unresolvedSourceChartCount:sourceRecords.filter((r) => r.status === STATES.UNRESOLVED).length,
            runtimePositionConsumerDefined:true, genericPositionResolverDefined:false,
            corpusPositionCoverageComplete:false, executionAuthorized:false,
            relationEffects:[], memberEdges:[], numericScore:null, relativeDominance:null
        });
    };
    GuiJia.baziContextualForcePartySourcePositionProvenanceConsumerProfile = Object.freeze({
        installed:true, VERSION, RULE_ID, STATES, CONTRACT,
        normalizeRecord, validateNormalizedRecord, resolveNormalizedRecord, buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
