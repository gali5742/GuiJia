(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziSourceContributionLocalForceProfile?.installed) return;
    const api = GuiJia.baziSourceContributionLocalForceContract;
    const source = GuiJia.baziSourceStrengthReviewSource;
    const reviewer = GuiJia.baziSourceStrengthReviewProfile;
    const charts = GuiJia.baziVisibleStemFunctionRealizationSource;
    const contribution = GuiJia.baziVisibleStemDaymasterContribution;
    if (!api || !source || !reviewer || !charts || !contribution) return;
    const { AUTHORITIES, CONTRACT, freeze } = api;
    const rows = (items) => Array.isArray(items) ? Array.from(items).filter((item) => item && typeof item === 'object') : [];
    const same = (a, b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((key) => Object.hasOwn(a, key) && same(a[key], b[key]));
    };
    const inputForAuthority = (id) => AUTHORITIES.find((item) => item.id === id) || null;
    const validateInput = (input) => {
        const authority = input && inputForAuthority(input.id);
        if (!authority || !same(input, authority)) return false;
        const sourceCase = source.CASES.find((item) => item.id === authority.sourceCaseId && item.chartKey === authority.chartKey);
        const claim = sourceCase?.claims.find((item) => item.id === authority.claimId);
        if (!claim || !same(claim.subjectKeys, [authority.sourceActorKey, authority.targetActorKey])
            || claim.value.functionType !== authority.functionType) return false;
        if (authority.kind === 'local-force') return claim.kind === 'relation-modifier'
            && claim.value.force === authority.forceQualifier && same(claim.contextKeys, authority.contextActorKeys);
        const excerpt = source.EXCERPTS.find((item) => item.id === authority.profileExcerptId);
        return authority.kind === 'branch-contribution' && claim.kind === 'direct-contribution'
            && claim.value.realization === authority.realization && authority.strengthMeaning === 'support'
            && excerpt?.text.includes(authority.profileSpan);
    };
    const relationFor = (authority) => ({
        sourceActorKey: authority.sourceActorKey, targetActorKey: authority.targetActorKey,
        functionType: authority.functionType, directed: true,
        sourceCaseId: authority.sourceCaseId, chartKey: authority.chartKey
    });
    const runtimeFor = (authority, synthesis) => {
        const matches = rows(synthesis.visibleStemFunctionRealizationRecords).filter((item) => item.directed === true
            && item.relationScope === (authority.kind === 'local-force' ? 'cross-visible-actor' : 'daymaster-related')
            && item.sourceActorKey === authority.sourceActorKey && item.targetActorKey === authority.targetActorKey
            && item.functionType === authority.functionType);
        const values = [...new Set(matches.map((item) => item.realizationState || 'unresolved'))];
        const resolved = values.filter((value) => value === 'realized-in-source-context' || value === 'not-realized-in-source-context');
        return {
            state: resolved.length > 1 ? 'conflicting-realization' : values.length > 1 ? 'incomplete-or-mixed-realization'
                : !matches.length ? 'no-runtime-function' : values[0],
            records: matches.map((item) => ({ id: item.id, sourcePatternId: item.sourcePatternId || null, realizationState: item.realizationState })),
            hasNegative: resolved.includes('not-realized-in-source-context'), hasConflict: resolved.length > 1,
            hasUnsupported: values.some((value) => !['unresolved', 'realized-in-source-context', 'not-realized-in-source-context'].includes(value))
        };
    };
    const evaluateAuthority = (input, model = {}, synthesis = {}) => {
        const chartKey = charts.buildStructuredChartKey(model, synthesis) || null;
        const result = (status, issues = [], extra = {}) => freeze({
            authorityId: input?.id || null, chartKey, status, issues,
            relationIdentity: null, contributionRecord: null, profileInterpretation: null,
            forceQualifierRecord: null, sourceAssertion: null, ...extra
        });
        if (!validateInput(input)) return result('invalid-source-authority', ['immutable-source-authority-required']);
        if (!chartKey) return result('identity-unresolved', ['complete-chart-required']);
        if (chartKey !== input.chartKey) return result('not-applicable', ['outside-exact-source-case']);
        // Re-run the actor reviewer. A cached assertion, caller-provided verdict or wording cannot authorize execution.
        const review = reviewer.buildProfile(model, synthesis);
        const assertion = review.assertions.find((item) => item.claimId === input.claimId);
        const relationIdentity = relationFor(input);
        const context = { relationIdentity, sourceAssertion: assertion || null };
        if (review.sourceCaseId !== input.sourceCaseId || assertion?.status !== 'verified-source-assertion'
            || !assertion.verifiedValue) return result('identity-unresolved', ['independently-verified-participants-required'], context);
        const runtime = runtimeFor(input, synthesis);
        if (input.kind === 'local-force') {
            return result('resolved-source-local-force', [], { ...context, forceQualifierRecord: {
                id: `${input.id}-RECORD`, authorityId: input.id, relationIdentity,
                qualifier: input.forceQualifier, sourceClaimId: input.claimId,
                verifiedContextActorKeys: [...input.contextActorKeys], sourceEvidence: assertion.evidence,
                sourceRealization: assertion.verifiedValue.realization, runtimeRealization: runtime,
                applicationState: runtime.hasConflict ? 'blocked-runtime-conflict'
                    : assertion.verifiedValue.realization === 'realized' && runtime.hasNegative ? 'blocked-source-runtime-disagreement'
                        : assertion.verifiedValue.realization === 'realized' && runtime.state === 'realized-in-source-context' ? 'attached-to-matching-runtime-relation'
                            : 'source-only-realization-unresolved',
                actorGlobalEffectiveness: null, numericForce: null, reverseEffect: null
            } });
        }
        if (runtime.hasNegative || runtime.hasConflict || runtime.hasUnsupported) return result('contribution-blocked', ['contrary-or-unsupported-runtime-realization'], context);
        const profileInterpretation = {
            id: input.profileAuthorityId, authorityId: input.id, actorKey: input.sourceActorKey,
            scope: 'exact-source-whole-branch-profile', interpretationState: input.profileMeaning,
            sourceExcerptId: input.profileExcerptId, sourceSpan: input.profileSpan,
            realizationClaimId: input.claimId, actorGlobalEffectiveness: null
        };
        return result('resolved-source-branch-contribution', [], { ...context, profileInterpretation, contributionRecord: {
            id: `${input.id}-CONTRIBUTION`, authorityId: input.id, sourceClaimId: input.claimId,
            relationIdentity, sourceActorKey: input.sourceActorKey, targetActorKey: input.targetActorKey,
            sourceScope: 'surface-branch', targetScope: 'daymaster', functionType: input.functionType,
            directed: true, strengthMeaning: input.strengthMeaning,
            functionRealizationState: 'realized-in-source-context', profileInterpretationId: profileInterpretation.id,
            contributionState: contribution.contributionStates.REALIZED,
            resolutionStatus: contribution.resolutionStatuses.RESOLVED_REALIZED,
            sourceEvidence: assertion.evidence, sourceContractId: CONTRACT.id,
            actorGlobalEffectiveness: null, numericForce: null
        } });
    };
    const buildProfile = (model = {}, synthesis = {}) => {
        const results = AUTHORITIES.map((authority) => evaluateAuthority(authority, model, synthesis));
        return freeze({
            chartKey: charts.buildStructuredChartKey(model, synthesis) || null,
            results, branchContributions: results.flatMap((item) => item.contributionRecord ? [item.contributionRecord] : []),
            localForceQualifiers: results.flatMap((item) => item.forceQualifierRecord ? [item.forceQualifierRecord] : []),
            // References index existing visible records; they are not copied contribution evidence.
            visibleContributionReferences: rows(synthesis.visibleStemDaymasterContributionRecords).map((item) => ({
                id: item.id, sourceField: 'visibleStemDaymasterContributionRecords', contributionState: item.contributionState
            })),
            synthesisStatus: synthesis.sufficiency?.status || 'unavailable',
            blockingDependencyIds: [...(synthesis.sufficiency?.blockingDependencyIds || [])],
            genericContributionCoverage: 'unresolved', relativeDominance: null, finalStrength: null, numericForce: null,
            relationEffects: [], memberEdges: []
        });
    };
    GuiJia.baziSourceContributionLocalForceProfile = freeze({ installed: true, CONTRACT, inputForAuthority, validateInput, evaluateAuthority, buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
