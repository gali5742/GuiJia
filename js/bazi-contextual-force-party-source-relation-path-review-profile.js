(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceRelationPathReviewProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceRelationPathReviewSource;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const normalizedContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const kernel = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const order = GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherProfile;
    const participants = GuiJia.baziContextualForcePartySourcePathParticipantBindingProfile;
    const hidden = GuiJia.baziContextualForcePartySourceHiddenSealTargetReviewProfile;
    const chart = GuiJia.baziVisibleStemFunctionRealizationSource;
    const core = GuiJia.baziCore;
    if (!api || !normalizer || !normalizedContract || !resolver || !kernel || !order || !participants || !hidden || !chart || !core) return;

    const { CASES, CONTRACT, RULE_ID, freeze } = api;
    const { REALIZATION_STATES, EXECUTION_STATES, AUTHORIZATION_STATES } = kernel;
    const positions = ['year', 'month', 'day', 'hour'];
    const positionLinks = ['CF-SPPCM-LINK-01', 'CF-SPPCM-LINK-02', 'CF-SPPCM-LINK-03', 'CF-SPPCM-LINK-04'];

    const chartPillars = (chartKey) => String(chartKey || '').split('|').map((pillar) => Array.from(pillar));
    const actorFor = (reference, pillars) => {
        const { pillarIndex, scope } = reference;
        const pillar = pillars[pillarIndex];
        if (scope === 'visible-stem' && pillar?.[0] === reference.gan) {
            return {
                type: 'actor', actorKey: `visible:${pillarIndex}:${reference.gan}`, scope, cardinality: 1, pillarIndex,
                tenGod: core.shiShenMap[pillars[2][0]][reference.gan], gan: reference.gan, zhi: null
            };
        }
        if (scope === 'surface-branch' && pillar?.[1] === reference.zhi) {
            return {
                type: 'actor', actorKey: `surface-branch:${pillarIndex}:${reference.zhi}`, scope, cardinality: 1, pillarIndex,
                tenGod: null, gan: null, zhi: reference.zhi
            };
        }
        return null;
    };

    const inventoryRecords = (inventory, field) => {
        const records = inventory?.[field];
        return Array.isArray(records) && Array.from(records).every((record) => record && typeof record === 'object') ? records : [];
    };
    const hasActorEvidence = (inventory, actor) => {
        const profiles = inventoryRecords(inventory, 'actorProfiles').filter((record) => record.actorKey === actor.actorKey);
        const records = inventoryRecords(inventory, 'evidenceRecords').filter((record) => record.actorKey === actor.actorKey);
        const visible = actor.scope === 'visible-stem';
        const scope = visible ? 'surface-stem' : 'surface-branch';
        return profiles.length === 1 && records.length > 0 && records.every((record) => record.sourceScope === scope
            && record.position === positions[actor.pillarIndex]
            && (record.pillarIndex === actor.pillarIndex || (visible && record.pillarIndex === null))
            && record.gan === actor.gan && record.zhi === actor.zhi && record.tenGod === actor.tenGod
            && record.wuxing === core.getWuXing(actor.gan || actor.zhi));
    };

    const validateCase = (source) => {
        const pillars = chartPillars(source.chartKey);
        return pillars.length === 4 && pillars.every((pillar) => pillar.length === 2)
            && new Set(source.paths.map((path) => path.id)).size === source.paths.length
            && source.paths.every((path) => source.sourceText.includes(path.span) && source.sourceText.includes(path.attribution.span)
                && (!path.antecedentSpan || source.sourceText.includes(path.antecedentSpan))
                && [path.from, path.predicate, path.to].every((span) => path.span.includes(span))
                && [path.source, path.target, ...path.contextActors].every((actor) => actorFor(actor, pillars)));
    };

    const normalizeTarget = (source, path, sourceActor, targetActor) => {
        const evidenceIds = [source.id, path.id];
        const sourceCase = { ...source, sourceContextType: 'chart-case', predicateType: 'relation-event' };
        const review = {
            id: `${path.id}-UNIT`, relationClauseSpan: path.span, sourceRoleSpan: path.from,
            sourceRoleClass: sourceActor?.tenGod || 'source-named-actor', predicateSpan: path.predicate,
            predicateType: 'relation-event',
            target: { span: path.to, mentionMode: path.antecedentSpan ? 'antecedent-linked' : 'explicit-source-mention',
                antecedentSpan: path.antecedentSpan || null, roleClass: targetActor.tenGod || 'source-named-actor', chartBindingRequired: true }
        };
        const unit = normalizer.normalizeRelationUnit(sourceCase, review, [], []);
        const identityProvenance = {
            state: normalizedContract.IDENTITY_PROVENANCE_STATES.RESOLVED_ACTOR,
            endpointType: 'actor', actorKey: targetActor.actorKey, groupId: null, memberActorKeys: [],
            cardinality: 1, scope: targetActor.scope, sourceCaseScoped: true, sourceActorKeys: sourceActor ? [sourceActor.actorKey] : [],
            targetCandidateKeys: [targetActor.actorKey], targetRoleClass: review.target.roleClass, antecedentSpan: review.target.antecedentSpan
        };
        const record = {
            id: `${path.id}-NORMALIZED`, sourceCaseId: source.id, annotationId: path.id,
            sourceText: source.sourceText, chartKey: source.chartKey, sourceContextType: 'chart-case',
            sourcePredicateType: 'relation-event', annotationDisposition: 'relation-target-present',
            contextSpans: [{ role: path.attribution.kind, text: path.attribution.span }],
            configurationSpans: [], relationUnits: [{ ...unit, identityProvenance }], sourceEvidenceIds: evidenceIds
        };
        return resolver.resolveRecord(record).unitResolutions[0] || null;
    };

    // A normalized target, declared condition or source-level assertion alone never establishes pair realization.
    const pathOutcome = (sourceActorKey, targetReference, execution) => {
        if (!sourceActorKey || !targetReference?.actorKey) return 'identity-unresolved';
        if (execution?.executionState === EXECUTION_STATES.NOT_REALIZED) return 'not-realized';
        if (execution?.executionState === EXECUTION_STATES.REALIZED_UNMAPPED) return 'realized-unmapped';
        return 'realization-unresolved';
    };

    const reviewExactPath = (source, path, inventory) => {
        const pillars = chartPillars(source.chartKey);
        const bound = (reference) => {
            const actor = actorFor(reference, pillars);
            return actor && hasActorEvidence(inventory, actor) ? actor : null;
        };
        const sourceActor = bound(path.source);
        const targetActor = bound(path.target);
        const contextActors = path.contextActors.map(bound);
        const target = targetActor ? normalizeTarget(source, path, sourceActor, targetActor) : null;
        const targetReference = target?.targetReference || null;
        const ready = Boolean(sourceActor && targetReference && contextActors.every(Boolean));
        const execution = ready ? kernel.executeRelationEffect({
            id: path.id,
            sourceEndpoint: sourceActor,
            targetResolution: target,
            relationIdentity: { id: path.id, functionType: path.functionType, directed: true },
            realizationState: path.realized ? REALIZATION_STATES.REALIZED : REALIZATION_STATES.NOT_REALIZED,
            authorization: { state: path.realized ? AUTHORIZATION_STATES.UNMAPPED : AUTHORIZATION_STATES.NOT_APPLICABLE,
                sourceBacked: false, relationTypes: [], authorityIds: [], sourceEvidenceIds: [source.id, path.id] }
        }) : null;
        return {
            pathId: path.id, sourceActorKey: sourceActor?.actorKey || null, targetReference,
            outcome: pathOutcome(sourceActor?.actorKey, targetReference, execution), execution,
            evidenceSpan: path.span, basis: path.basis, sourceAttribution: path.attribution,
            verifiedContextActorKeys: contextActors.filter(Boolean).map((actor) => actor.actorKey),
            requiredActorsVerified: ready
        };
    };

    const reviewOrder = (linkId, chartKey) => {
        const condition = order.evaluateCondition(order.inputForLink(linkId), chartKey);
        const binding = participants.bindCondition(condition, chartKey);
        return {
            linkId, conditionState: condition.status, sourcePathPolicy: condition.sourcePathPolicy,
            paths: binding.pathInstances.map((path) => {
                const sourceActorKey = path.sourceEndpoint.actorKey;
                return { pathId: path.sourcePath.id, sourceActorKey, targetReference: null,
                    intermediateParticipants: path.intermediateParticipants, outcome: pathOutcome(sourceActorKey, null, null) };
            })
        };
    };

    const buildProfile = (semanticModel = {}, synthesis = {}) => {
        const chartKey = chart.buildStructuredChartKey(semanticModel, synthesis) || null;
        const inventory = synthesis.contextualForcePartyMembershipInventory;
        const matching = CASES.find((item) => item.chartKey === chartKey);
        const exactCase = matching && validateCase(matching) ? matching : null;
        const exactPaths = exactCase ? exactCase.paths.map((path) => reviewExactPath(exactCase, path, inventory)) : [];
        const orderReviews = chartKey ? positionLinks.map((linkId) => reviewOrder(linkId, chartKey)) : [];
        const hiddenReview = hidden.evaluateSource(hidden.inputForCase(), { chartKey, inventory });
        const hiddenPath = hiddenReview.sourceAssertion ? {
            outcome: pathOutcome(hiddenReview.sourceActorKey, hiddenReview.targetResolution?.unitResolutions[0]?.targetReference, hiddenReview.executionGate),
            sourceAssertion: hiddenReview.sourceAssertion,
            targetReference: hiddenReview.targetResolution?.unitResolutions[0]?.targetReference || null,
            wealthCandidates: hiddenReview.wealthCandidates
        } : null;
        return freeze({
            chartKey, sourceCorpusValidated: CASES.every(validateCase), exactSourceCaseId: exactCase?.id || null, exactPaths, orderReviews, hiddenPath,
            runtimeWinnerPathId: null, newEffectAuthorityCount: 0, relationEffects: [], memberEdges: []
        });
    };
    GuiJia.baziContextualForcePartySourceRelationPathReviewProfile = freeze({ installed: true, CONTRACT, RULE_ID, buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
