(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziSourceStrengthReviewProfile?.installed) return;
    const source = GuiJia.baziSourceStrengthReviewSource;
    const charts = GuiJia.baziVisibleStemFunctionRealizationSource;
    const core = GuiJia.baziCore;
    if (!source || !charts || !core) return;
    const { CASES, EXCERPTS, CONTRACT, freeze } = source;
    const positions = ['year', 'month', 'day', 'hour'];
    const records = (items) => Array.isArray(items) ? Array.from(items).filter((item) => item && typeof item === 'object') : [];
    const unique = (items) => [...new Set(items)];
    const excerptMap = new Map(EXCERPTS.map((item) => [item.id, item]));
    const conclusionKinds = new Set(['comparison', 'daymaster-strength']);

    const actorFor = (key, chartKey) => {
        const [scope, indexText, symbol] = key.split(':');
        const index = Number(indexText);
        const pillars = chartKey.split('|').map((pillar) => Array.from(pillar));
        const isBranch = scope === 'surface-branch';
        if (!Number.isInteger(index) || index < 0 || index > 3 || !['visible', 'daymaster', 'surface-branch'].includes(scope)
            || (scope === 'daymaster' && index !== 2) || (scope === 'visible' && index === 2)
            || pillars[index]?.[isBranch ? 1 : 0] !== symbol) return null;
        return { actorKey: key, scope, pillarIndex: index, position: positions[index],
            gan: isBranch ? null : symbol, zhi: isBranch ? symbol : null,
            wuxing: core.getWuXing(symbol), tenGod: isBranch ? null : core.shiShenMap[pillars[2][0]][symbol] };
    };

    const validateCorpus = () => {
        const ids = CASES.flatMap((item) => item.claims.map((claim) => claim.id));
        return unique(ids).length === ids.length && unique(CASES.map((item) => item.chartKey)).length === CASES.length
            && unique(EXCERPTS.map((item) => item.id)).length === EXCERPTS.length
            && CASES.every((item) => item.chartKey.split('|').length === 4 && item.claims.every((claim) =>
                [...claim.subjectKeys, ...claim.contextKeys].every((key) => actorFor(key, item.chartKey))
                && claim.evidence.length > 0 && claim.evidence.every((evidence) => evidence.span.length > 0
                    && excerptMap.get(evidence.excerptId)?.text.includes(evidence.span)
                    && (evidence.referent === 'current-chart' || (item.id === 'SSR-C01'
                        && evidence.excerptId === 'SSR-T02' && evidence.referent === 'previous-chart')))));
    };

    const verifyActor = (actor, model, inventory) => {
        if (!actor) return null;
        if (actor.scope === 'daymaster') {
            const master = model.strengthEvidence?.dayMaster;
            return master?.gan === actor.gan && master?.wuxing === actor.wuxing ? { ...actor, evidenceRecordIds: ['strengthEvidence.dayMaster'] } : null;
        }
        const profiles = records(inventory?.actorProfiles).filter((item) => item.actorKey === actor.actorKey);
        const evidence = records(inventory?.evidenceRecords).filter((item) => item.actorKey === actor.actorKey);
        const expectedScope = actor.scope === 'visible' ? 'surface-stem' : 'surface-branch';
        const matches = (item) => item.sourceScope === expectedScope && item.position === actor.position
            && (item.pillarIndex === actor.pillarIndex || (actor.scope === 'visible' && item.pillarIndex === null))
            && item.gan === actor.gan && item.zhi === actor.zhi && item.wuxing === actor.wuxing && item.tenGod === actor.tenGod;
        return profiles.length === 1 && evidence.length > 0 && evidence.every(matches)
            ? { ...actor, evidenceRecordIds: unique(evidence.map((item) => item.id)) } : null;
    };

    const realizationValue = (state) => state === 'realized-in-source-context' ? 'realized'
        : state === 'not-realized-in-source-context' ? 'not-realized' : 'unresolved';
    const alignRuntime = (claim, verified, synthesis) => {
        if (!claim.value.functionType) return null;
        const peer = claim.value.functionType === 'peer-support';
        const matches = records(synthesis.visibleStemFunctionRealizationRecords).filter((item) =>
            item.functionType === claim.value.functionType && (peer
                ? item.directed === false && unique(item.peerParticipantActorKeys || []).length === 2
                    && claim.subjectKeys.every((key) => (item.peerParticipantActorKeys || []).includes(key))
                : item.directed === true && item.sourceActorKey === claim.subjectKeys[0] && item.targetActorKey === claim.subjectKeys[1]));
        const states = unique(matches.map((item) => realizationValue(item.realizationState)));
        const resolved = states.filter((state) => state !== 'unresolved');
        const sourceState = claim.value.realization;
        const state = !verified ? 'source-identity-unresolved'
            : resolved.length > 1 || (resolved.length === 1 && sourceState !== 'unresolved' && resolved[0] !== sourceState) ? 'realization-conflict'
                : sourceState === 'unresolved' ? 'source-realization-unspecified'
                    : !matches.length ? 'no-runtime-function'
                        : states.length === 1 && states[0] === sourceState ? 'realization-agrees'
                            : 'runtime-realization-unresolved';
        return { state, directed: !peer, runtimeRecords: matches.map((item) => ({ id: item.id,
            sourcePatternId: item.sourcePatternId || null, realizationState: item.realizationState })),
            forceComparison: 'no-runtime-local-force-contract', changesRuntime: false };
    };

    const reviewClaim = (claim, sourceCase, model, synthesis) => {
        const keys = unique([...claim.subjectKeys, ...claim.contextKeys]);
        const bindings = keys.map((key) => verifyActor(actorFor(key, sourceCase.chartKey), model, synthesis.contextualForcePartyMembershipInventory));
        const missingActorKeys = keys.filter((key, index) => !bindings[index]);
        const verified = missingActorKeys.length === 0;
        return {
            claimId: claim.id, kind: claim.kind, sourceCaseId: sourceCase.id, chartKey: sourceCase.chartKey,
            status: verified ? 'verified-source-assertion' : 'actor-evidence-unresolved',
            subjectKeys: claim.subjectKeys, contextKeys: claim.contextKeys, bindings: bindings.filter(Boolean), missingActorKeys,
            sourceValue: claim.value, verifiedValue: verified ? claim.value : null,
            evidence: claim.evidence.map((item) => ({ ...item, locator: excerptMap.get(item.excerptId).locator, sourceUrl: CONTRACT.sourceUrl })),
            runtimeAlignment: alignRuntime(claim, verified, synthesis),
            executableEffect: null, globalActorEffectiveness: null
        };
    };

    const runtimeCoverage = (synthesis) => {
        const contributions = records(synthesis.visibleStemDaymasterContributionRecords).map((record) => ({
            id: record.id, sourceActorKey: record.sourceActorKey, targetActorKey: record.targetActorKey,
            functionType: record.functionType, contributionState: record.contributionState,
            resolutionStatus: record.resolutionStatus, sourcePatternId: record.sourcePatternId,
            directed: record.directed, peerParticipantActorKeys: [...(record.peerParticipantActorKeys || [])],
            profileInterpretationState: record.profileInterpretationState
        }));
        // Coverage reports are provenance, never a sum of source claims or contribution units.
        return {
            visibleContributionRecords: contributions,
            unresolvedVisibleContributionIds: contributions.filter((item) => !['resolved-realized-daymaster-contribution',
                'resolved-not-realized-daymaster-contribution'].includes(item.resolutionStatus)).map((item) => item.id),
            synthesisStatus: synthesis.sufficiency?.status || 'unavailable',
            blockingDependencyIds: [...(synthesis.sufficiency?.blockingDependencyIds || [])],
            blockingConflictIds: [...(synthesis.sufficiency?.blockingConflictIds || [])],
            requiredResearch: ['source-contribution-to-runtime-authorization', 'cross-axis-qualitative-comparison-rule', 'final-assessment-mapping'],
            sourceAssertionsFillRuntimeCoverage: false
        };
    };

    const buildProfile = (model = {}, synthesis = {}) => {
        const chartKey = charts.buildStructuredChartKey(model, synthesis) || null;
        const sourceCorpusValidated = validateCorpus();
        const sourceCase = sourceCorpusValidated ? CASES.find((item) => item.chartKey === chartKey) : null;
        const assertions = sourceCase ? sourceCase.claims.map((claim) => reviewClaim(claim, sourceCase, model, synthesis)) : [];
        return freeze({
            chartKey, sourceCorpusValidated, sourceCaseId: sourceCase?.id || null,
            state: !sourceCase ? 'no-exact-source-case' : assertions.every((item) => item.verifiedValue)
                ? 'reviewed-exact-source-case' : 'reviewed-with-identity-gaps',
            assertions,
            directContributions: assertions.filter((item) => item.kind === 'direct-contribution'),
            relationModifiers: assertions.filter((item) => item.kind === 'relation-modifier'),
            sourceConclusions: assertions.filter((item) => conclusionKinds.has(item.kind)),
            runtimeCoverage: runtimeCoverage(synthesis),
            computedStrength: null, computedDominance: null, numericForce: null,
            relationEffects: [], memberEdges: []
        });
    };
    const bindChartActor = (key, model, synthesis) => {
        const chartKey = charts.buildStructuredChartKey(model, synthesis);
        if (!chartKey || typeof key !== 'string' || !/^(visible|daymaster|surface-branch):[0-3]:.$/u.test(key)) return null;
        return verifyActor(actorFor(key, chartKey), model, synthesis.contextualForcePartyMembershipInventory);
    };
    GuiJia.baziSourceStrengthReviewProfile = freeze({ installed: true, CONTRACT, validateCorpus, buildProfile, bindChartActor });
})(typeof window !== 'undefined' ? window : globalThis);
