(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQualitativeComparisonEvidenceProfile?.installed) return;
    const api = GuiJia.baziQualitativeComparisonEvidenceContract;
    const chart = GuiJia.baziVisibleStemFunctionRealizationSource;
    const review = GuiJia.baziSourceStrengthReviewProfile;
    const local = GuiJia.baziSourceContributionLocalForceProfile;
    const core = GuiJia.baziCore;
    if (!api || !chart || !review || !local || !core) return;
    const { SOURCE, ROOT_PATTERNS, NAMED_CASES, CONTRACT, freeze } = api;
    const rows = (items) => Array.isArray(items) ? Array.from(items).filter((item) => item && typeof item === 'object') : [];
    const positions = ['year', 'month', 'day', 'hour'];

    const classifyRoot = (model, synthesis, actorKey) => {
        const chartKey = chart.buildStructuredChartKey(model, synthesis);
        const master = model.strengthEvidence?.dayMaster;
        const unresolved = (reason) => ({ actorKey, status: 'unresolved-root-identity', reason, category: null });
        if (!chartKey || !master?.gan || master.wuxing !== core.getWuXing(master.gan)) return unresolved('complete-chart-and-daymaster-required');
        const roots = rows(synthesis.rootActorStates).filter((item) => item.actorKey === actorKey);
        if (roots.length !== 1) return unresolved('unique-root-record-required');
        const root = roots[0], pillars = chartKey.split('|').map((item) => Array.from(item));
        const hidden = core.cangGanMap[root.zhi] || [];
        const hiddenIndex = hidden.findIndex(([gan]) => gan === root.gan);
        const expectedRole = root.gan === master.gan ? 'exact-root' : 'same-element-root';
        if (!Number.isInteger(root.pillarIndex) || root.pillarIndex < 0 || root.pillarIndex > 3
            || pillars[root.pillarIndex]?.[1] !== root.zhi || root.position !== positions[root.pillarIndex]
            || hiddenIndex < 0 || actorKey !== `hidden:${root.pillarIndex}:${root.zhi}:${root.gan}:${hiddenIndex}`
            || hidden[hiddenIndex][1] !== root.level || root.presence !== 'present'
            || core.getWuXing(root.gan) !== master.wuxing || root.rootRole !== expectedRole) return unresolved('root-chart-scope-or-role-mismatch');
        const inventory = synthesis.contextualForcePartyMembershipInventory;
        const profiles = rows(inventory?.actorProfiles).filter((item) => item.actorKey === actorKey);
        const evidence = rows(inventory?.evidenceRecords).filter((item) => item.actorKey === actorKey && item.sourceScope !== 'root-foundation');
        if (profiles.length !== 1 || !evidence.length || !evidence.every((item) => item.sourceScope === 'hidden-modifier'
            && item.pillarIndex === root.pillarIndex && item.position === root.position && item.zhi === root.zhi && item.gan === root.gan
            && item.wuxing === master.wuxing && item.tenGod === core.shiShenMap[master.gan][root.gan])) return unresolved('verified-hidden-actor-evidence-required');
        const pattern = ROOT_PATTERNS.find((item) => item.anchorGan === master.gan && item.zhi === root.zhi);
        return {
            actorKey, anchorActorKey: `daymaster:2:${master.gan}`, chartKey,
            status: pattern ? 'source-baseline-category-resolved' : 'outside-reviewed-source-root-examples',
            category: pattern?.category || null, sourcePatternId: pattern?.id || null, sourceRole: pattern?.sourceRole || null,
            rootRole: root.rootRole, hiddenLevel: root.level, zhi: root.zhi, gan: root.gan,
            relatedStructureRefs: [...(root.relatedStructureRefs || [])], actualEffectiveness: root.effectiveState || null,
            actualResolutionStatus: root.resolutionStatus, sourceId: pattern ? SOURCE.id : null,
            rootRecordId: root.id, evidenceRecordIds: evidence.map((item) => item.id)
        };
    };

    const compareRoots = (model = {}, synthesis = {}, leftActorKey, rightActorKey) => {
        const left = classifyRoot(model, synthesis, leftActorKey), right = classifyRoot(model, synthesis, rightActorKey);
        const result = (status, heavierBaselineActorKey = null) => freeze({
            status, left, right, heavierBaselineActorKey, scope: CONTRACT.baselineComparisonScope,
            sourceId: SOURCE.id, actualForceWinner: null, relativeDominance: null, numericDifference: null
        });
        if (left.status !== 'source-baseline-category-resolved' || right.status !== 'source-baseline-category-resolved') return result('baseline-comparison-unresolved');
        if (leftActorKey === rightActorKey) return result('same-actor-no-comparison');
        if (left.category === right.category) return result('same-source-category-no-force-equivalence');
        return result('source-baseline-category-ordered', left.category === 'source-heavy-root-category' ? leftActorKey : rightActorKey);
    };

    const namedComparison = (sourceCase, model, synthesis) => {
        const audited = review.buildProfile(model, synthesis);
        const verifiedIdentity = audited.assertions.find((item) => item.claimId === sourceCase.identityClaimId)?.status === 'verified-source-assertion';
        const sourceCalibration = sourceCase.sourceCalibrationClaimId
            ? audited.assertions.find((item) => item.claimId === sourceCase.sourceCalibrationClaimId) || null : null;
        const effects = local.buildProfile(model, synthesis);
        const allContributions = rows(synthesis.visibleStemDaymasterContributionRecords);
        const contributions = allContributions.filter((item) => item.directed === false
            ? (item.peerParticipantActorKeys || []).length === 2 && (item.peerParticipantActorKeys || []).includes(sourceCase.daymasterActorKey)
            : item.directed === true && [item.sourceActorKey, item.targetActorKey].includes(sourceCase.daymasterActorKey));
        const excludedContributionIds = allContributions.filter((item) => !contributions.includes(item)).map((item) => item.id);
        const unresolvedContributions = contributions.filter((item) => !['resolved-realized-daymaster-contribution', 'resolved-not-realized-daymaster-contribution'].includes(item.resolutionStatus));
        const incoming = rows(synthesis.visibleStemFunctionRealizationRecords).filter((item) => item.directed === true && item.relationScope === 'daymaster-related'
            && item.sourceActorKey === sourceCase.counterActorKey && item.targetActorKey === sourceCase.daymasterActorKey && item.functionType === 'restraint');
        const incomingStates = new Set(incoming.map((item) => item.realizationState));
        const master = model.strengthEvidence?.dayMaster;
        const identityReady = audited.sourceCaseId === sourceCase.sourceCaseId && verifiedIdentity
            && `daymaster:2:${master?.gan}` === sourceCase.daymasterActorKey && master?.wuxing === core.getWuXing(master?.gan);
        const blockers = [
            ...(!identityReady ? ['named-anchor-identity-unresolved'] : []),
            ...(excludedContributionIds.length ? ['contribution-anchor-identity-mismatch'] : []),
            ...(unresolvedContributions.length ? ['daymaster-contribution-coverage-incomplete'] : []),
            ...(!incoming.length || incoming.some((item) => item.realizationState !== 'realized-in-source-context' && item.realizationState !== 'not-realized-in-source-context')
                ? ['named-counter-to-daymaster-realization-unresolved'] : []),
            ...(incomingStates.has('realized-in-source-context') && incomingStates.has('not-realized-in-source-context')
                ? ['named-counter-to-daymaster-realization-conflict'] : []),
            ...(effects.localForceQualifiers.some((item) => item.applicationState.startsWith('blocked-')) ? ['local-force-runtime-disagreement'] : []),
            'daymaster-foundation-effectiveness-coverage-unresolved',
            'counter-seasonal-standing-unresolved', 'counter-foundation-and-profile-coverage-unresolved',
            'source-backed-cross-axis-comparison-rule-missing'
        ];
        return {
            chartKey: sourceCase.chartKey, daymasterActorKey: sourceCase.daymasterActorKey, counterActorKey: sourceCase.counterActorKey,
            scope: CONTRACT.namedComparisonScope, status: 'insufficient-comparison-evidence', blockers, excludedContributionIds,
            contributionReferences: contributions.map((item) => ({ id: item.id, sourceField: 'visibleStemDaymasterContributionRecords',
                contributionState: item.contributionState, resolutionStatus: item.resolutionStatus })),
            branchContributionReferences: effects.branchContributions.map((item) => ({ id: item.id, authorityId: item.authorityId, sourceField: 'sourceContributionLocalForce.branchContributions' })),
            localForceQualifiers: effects.localForceQualifiers,
            daymasterSeasonalBackground: model.strengthEvidence?.evidence?.seasonalState || null,
            daymasterRootReferences: rows(synthesis.rootActorStates).map((item) => ({ id: item.id, actorKey: item.actorKey,
                actualResolutionStatus: item.resolutionStatus, actualEffectiveness: item.effectiveState })),
            incomingFunctionReferences: incoming.map((item) => ({ id: item.id, realizationState: item.realizationState })),
            sourceCalibration: sourceCalibration?.verifiedValue ? { claimId: sourceCalibration.claimId,
                authoredValue: sourceCalibration.verifiedValue, evidence: sourceCalibration.evidence, purpose: 'calibration-target-only' } : null,
            computedComparison: null, forceWinner: null, finalStrength: null
        };
    };
    const buildProfile = (model = {}, synthesis = {}) => {
        const chartKey = chart.buildStructuredChartKey(model, synthesis) || null;
        const keys = [...new Set(rows(synthesis.rootActorStates).map((item) => item.actorKey).filter(Boolean))];
        const baselineRoots = keys.map((key) => classifyRoot(model, synthesis, key));
        const baselineComparisons = keys.flatMap((left, index) => keys.slice(index + 1).map((right) => compareRoots(model, synthesis, left, right)));
        const matching = NAMED_CASES.find((item) => item.chartKey === chartKey);
        return freeze({ chartKey, baselineRoots, baselineComparisons, namedComparison: matching ? namedComparison(matching, model, synthesis) : null,
            newCompleteSourceCaseCount: 0, reusedClassicalCaseId: SOURCE.upstreamCaseId,
            sourceConditionalExamplesAreNewNatalCases: false, numericForce: null, relativeDominance: null, finalStrength: null });
    };
    GuiJia.baziQualitativeComparisonEvidenceProfile = freeze({ installed: true, CONTRACT, compareRoots, buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
