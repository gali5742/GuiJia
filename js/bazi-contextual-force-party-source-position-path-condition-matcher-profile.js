(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherContract;
    const position = GuiJia.baziContextualForcePartySourcePositionProvenanceConsumerProfile;
    const paths = GuiJia.baziContextualForcePartyCompetingRelationPathSource;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource;
    const core = GuiJia.baziCore;
    if (!api || !position || !paths || !realization || !core) return;
    const { VERSION, RULE_ID, STATES, LINK_REGISTRY, PATH_SOURCE_REGISTRY, CONTRACT, freeze } = api;
    const copy = (value) => JSON.parse(JSON.stringify(value));
    const same = (a, b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        const keys = Object.keys(b);
        return Object.keys(a).length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(a, key) && same(a[key], b[key]));
    };
    const inputForLink = (linkId) => {
        const link = LINK_REGISTRY[linkId];
        return link ? { link, pathSourceRecord:PATH_SOURCE_REGISTRY[link.pathSourceRecordId],
            normalizedPosition:position.normalizeRecord(link.positionRecordId) } : {};
    };
    const validateLinkInput = (input = {}) => {
        if (!input || typeof input !== 'object' || Array.isArray(input)) return freeze({ valid:false, issues:['position-path-input-schema-mismatch'] });
        const { link, pathSourceRecord:record, normalizedPosition:normalized } = input;
        const issues = [];
        if (!same(Object.keys(input).sort(), ['link','normalizedPosition','pathSourceRecord'])) issues.push('position-path-input-schema-mismatch');
        const registered = LINK_REGISTRY[link?.id];
        if (!registered || !same(link, registered)) issues.push('registered-position-path-link-required');
        if (!registered || !same(record, PATH_SOURCE_REGISTRY[registered.pathSourceRecordId])) issues.push('registered-path-source-mismatch');
        if (!normalized || !position.validateNormalizedRecord(normalized).valid) issues.push('normalized-position-provenance-invalid');
        // Stop before interpreting any supplied condition or outcome when provenance is invalid.
        if (issues.length) return freeze({ valid:false, issues });
        const sourceValidation = paths.validateRecord(record);
        issues.push(...sourceValidation.issues);
        const condition = record.conditions.find((c) => c.id === link.conditionId);
        const assertion = record.relationAssertions.find((a) => a.id === link.relationAssertionId);
        const unit = normalized.units.find((u) => u.id === link.positionUnitId);
        if (normalized.sourceRecordId !== link.positionRecordId || normalized.provenance.sourceId !== link.sourceIds.position
            || record.sourceId !== link.sourceIds.path || normalized.provenance.sourceTier !== record.sourceTier) issues.push('cross-contract-source-identity-mismatch');
        if (!unit || unit.sourceAssertionId !== link.positionAssertionId || !record.positionEvidenceIds.includes(link.positionAssertionId)) issues.push('position-assertion-link-mismatch');
        if (!condition || condition.kind !== link.conditionKind || condition.sourceWording !== link.conditionWording) issues.push('path-condition-identity-mismatch');
        if (!assertion || !assertion.conditionIds.includes(link.conditionId) || !link.pathIds.every((id) => assertion.pathIds.includes(id))) issues.push('relation-assertion-link-mismatch');
        if (!link.pathIds.every((id) => record.pathCandidates.filter((p) => p.id === id).length === 1)) issues.push('unique-source-path-identity-required');
        for (const ref of link.pathParticipantRefs) {
            const path = record.pathCandidates.find((p) => p.id === ref.pathId);
            const participant = unit?.participants.find((p) => p.refId === ref.sourceRefId);
            const target = ref.targetRefId ? unit?.participants.find((p) => p.refId === ref.targetRefId) : null;
            const intermediateRoles = (ref.intermediateRefIds || []).map((id) => unit?.participants.find((p) => p.refId === id)?.roleClass);
            if (!participant || path?.sourceRoleClass !== participant.roleClass || path?.targetRoleClass !== ref.targetRoleClass
                || (ref.targetRefId && target?.roleClass !== ref.targetRoleClass)
                || !same(path?.intermediateRoleClasses, intermediateRoles)) issues.push('path-position-role-reference-mismatch');
        }
        const contextRecord = PATH_SOURCE_REGISTRY[link.context.sourceRecordId];
        if (!contextRecord || contextRecord.sourceId !== record.sourceId || contextRecord.sourceTier !== record.sourceTier
            || !contextRecord.sourceExtract.includes(link.context.sourceSpan)) issues.push('source-comparison-context-missing');
        if (link.conditionKind === 'position-order') {
            if (unit?.kind !== 'source-asserted-order' || unit.semanticAssertion.qualifier !== 'ordered'
                || unit.sourceWording !== condition?.sourceWording) issues.push('source-order-condition-mismatch');
            if (assertion?.coexistenceMode !== 'source-permits-coexistence' || assertion?.orderingMode !== 'source-ordered'
                || !same(assertion.orderedPathIds, link.pathIds)) issues.push('source-ordered-coexistence-required');
            if (!link.explicitStemBindings.every((binding) => unit?.participants.some((p) => p.refId === binding.refId
                && p.roleClass === binding.roleClass && p.scope === 'visible-stem'))) issues.push('position-participant-scope-mismatch');
        } else if (unit?.kind !== 'source-asserted-proximity' || unit.semanticAssertion.qualifier !== 'proximity'
            || !unit.semanticAssertion.alternativeGroupId || assertion?.coexistenceMode !== 'source-requires-exclusive-selection') issues.push('source-proximity-alternative-link-mismatch');
        return freeze({ valid:!issues.length, issues, unit:unit ? copy(unit) : null,
            condition:condition ? copy(condition) : null, assertion:assertion ? copy(assertion) : null });
    };
    const chartParts = (key) => typeof key === 'string' && /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥](\|[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]){3}$/.test(key) ? key.split('|') : null;
    const evaluateCondition = (input = {}, chartKey = null) => {
        const validation = validateLinkInput(input);
        const link = validation.valid ? input.link : null;
        const base = {
            linkId:link?.id || null, conditionId:link?.conditionId || null,
            pathSourceRecordId:link?.pathSourceRecordId || null, relationAssertionId:link?.relationAssertionId || null,
            positionAssertionId:link?.positionAssertionId || null, positionUnitId:link?.positionUnitId || null,
            pathIds:link ? [...link.pathIds] : [], linkedPaths:link ? input.pathSourceRecord.pathCandidates.filter((p) => link.pathIds.includes(p.id)).map(copy) : [],
            sourcePathPolicy:link ? { coexistenceMode:validation.assertion.coexistenceMode,
                orderingMode:validation.assertion.orderingMode, orderedPathIds:[...validation.assertion.orderedPathIds] } : null,
            sourceContext:link ? copy(link.context) : null, chartKey:typeof chartKey === 'string' ? chartKey : null,
            validation, runtimeConditionResolved:false, conditionSatisfied:null, positionParticipantBindings:[],
            relationRealizationResolved:false, executionAuthorized:false, runtimeWinnerPathId:null,
            relationEffects:[], memberEdges:[], relativeDominance:null, numericScore:null
        };
        const result = (status, issues = [], extra = {}) => freeze({ ...base, status, blockerReasons:issues, ...extra });
        if (!validation.valid) return result(STATES.UNRESOLVED, [...validation.issues]);
        const parts = chartParts(chartKey);
        if (!parts) return result(STATES.UNRESOLVED, ['structured-chart-required']);
        if (link.context.dayGan && (parts[2][0] !== link.context.dayGan || parts[1][1] !== link.context.monthZhi)) {
            return result(STATES.NOT_APPLICABLE, ['outside-registered-source-context']);
        }
        if (link.context.dayGans && !link.context.dayGans.includes(parts[2][0])) return result(STATES.NOT_APPLICABLE, ['outside-registered-source-context']);
        if (link.conditionKind === 'position-proximity') return result(STATES.UNRESOLVED, ['independently-asserted-runtime-proximity-required']);
        const bindings = [];
        for (const declaration of link.explicitStemBindings) {
            const indexes = [0,1,3].filter((index) => parts[index][0] === declaration.gan);
            if (indexes.length !== 1) return result(STATES.UNRESOLVED, ['unique-source-mentioned-visible-stem-required']);
            const index = indexes[0];
            const role = core.shiShenMap?.[parts[2][0]]?.[declaration.gan];
            if (!(declaration.roleClass === '财星' ? ['正财','偏财'].includes(role) : role === declaration.roleClass)) return result(STATES.UNRESOLVED, ['source-mentioned-stem-role-mismatch']);
            bindings.push({ refId:declaration.refId, actorKey:`visible:${index}:${declaration.gan}`, pillarIndex:index,
                pillar:['year','month','day','hour'][index], roleClass:declaration.roleClass, tenGod:role, scope:'visible-stem' });
        }
        const byRef = Object.fromEntries(bindings.map((b) => [b.refId, b]));
        const refs = validation.unit.semanticAssertion.orderedRefIds;
        if (refs.length !== 2 || refs.some((ref) => !byRef[ref])) return result(STATES.UNRESOLVED, ['source-order-participant-identity-unresolved']);
        // Compare the declared order only. No distance, nearest target or path priority is inferred.
        const orderSatisfied = byRef[refs[0]].pillarIndex < byRef[refs[1]].pillarIndex;
        const placementsSatisfied = validation.unit.participants.every((p) => p.placements.every((placement) =>
            byRef[p.refId]?.pillarIndex === placement.pillarIndex && byRef[p.refId]?.pillar === placement.pillar));
        const satisfied = orderSatisfied && placementsSatisfied;
        return result(satisfied ? STATES.MATCHED : STATES.NOT_SATISFIED, [], {
            runtimeConditionResolved:true, conditionSatisfied:satisfied, positionParticipantBindings:bindings,
            conditionChecks:{ sourceOrderSatisfied:orderSatisfied, sourceAbsolutePlacementsSatisfied:placementsSatisfied }
        });
    };
    const buildProfile = (semanticModel = {}, synthesis = {}) => {
        const inputs = Object.keys(LINK_REGISTRY).map(inputForLink);
        const chartKey = realization.buildStructuredChartKey(semanticModel, synthesis) || null;
        const linkValidations = inputs.map((input) => ({ linkId:input.link.id, ...validateLinkInput(input) }));
        const results = inputs.map((input) => evaluateCondition(input, chartKey));
        return freeze({
            status:'source-position-path-condition-matcher-evaluated', linkValidations, results,
            finiteLinkCoverageComplete:linkValidations.length === 4 && linkValidations.every((v) => v.valid),
            matchedConditionCount:results.filter((r) => r.status === STATES.MATCHED).length,
            notSatisfiedConditionCount:results.filter((r) => r.status === STATES.NOT_SATISFIED).length,
            unresolvedConditionCount:results.filter((r) => r.status === STATES.UNRESOLVED).length,
            notApplicableConditionCount:results.filter((r) => r.status === STATES.NOT_APPLICABLE).length,
            sourceOrderConditionMatcherDefined:true, sourceProximityConditionMatcherDefined:false,
            unlinkedPositionUnitIds:['CF-RPP-REC-02-A01-U1','CF-RPP-REC-02-A02-U1','CF-RPP-REC-04-A01-U1','CF-RPP-REC-05-A01-U1'],
            unsupportedSourceConditionIds:['CF-CRP-REC-04-C01'],
            genericPositionResolverDefined:false, competingPathResolverDefined:false, corpusCoverageComplete:false,
            executionAuthorized:false, relationEffects:[], memberEdges:[], numericScore:null, relativeDominance:null
        });
    };
    GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherProfile = Object.freeze({
        installed:true, VERSION, RULE_ID, STATES, CONTRACT, inputForLink, validateLinkInput, evaluateCondition, buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
