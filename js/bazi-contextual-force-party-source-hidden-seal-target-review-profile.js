(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceHiddenSealTargetReviewProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceHiddenSealTargetReviewContract;
    const hidden = GuiJia.baziContextualForcePartyHiddenSingleTargetBindingProfile;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const normalizedContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    const kernel = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const chart = GuiJia.baziVisibleStemFunctionRealizationSource;
    const core = GuiJia.baziCore;
    if (!api || !hidden || !normalizer || !normalizedContract || !resolver || !kernel || !chart || !core) return;

    const { VERSION, RULE_ID, STATES, SOURCE_CASE, ANNOTATION, TARGET_REVIEW, ASSERTION_REVIEW, CONTRACT, freeze } = api;
    const positions = ['year', 'month', 'day', 'hour'];
    const evidenceIds = freeze([SOURCE_CASE.id, ANNOTATION.id, TARGET_REVIEW.id, ASSERTION_REVIEW.id]);
    const same = (left, right) => {
        if (left === right) return true;
        if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
        if (Array.isArray(left) !== Array.isArray(right)) return false;
        if (Array.isArray(left) && left.length !== right.length) return false;
        const keys = Object.keys(right);
        return Object.keys(left).length === keys.length && keys.every((key) => Object.hasOwn(left, key) && same(left[key], right[key]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id
        ? { sourceCase: SOURCE_CASE, annotation: ANNOTATION, targetReview: TARGET_REVIEW, assertionReview: ASSERTION_REVIEW }
        : null;

    const reviewHiddenBinding = () => {
        const source = { ...SOURCE_CASE, expectedTargetLevel: TARGET_REVIEW.targetSemanticLevel, candidateScope: TARGET_REVIEW.scope };
        return hidden.validateBindingCandidate(source, ANNOTATION, TARGET_REVIEW);
    };
    const validateSourceInput = (input) => {
        if (!same(input, inputForCase())) {
            return freeze({ valid: false, issues: ['exact-registered-hidden-seal-review-required'] });
        }
        const issues = [];
        const s = SOURCE_CASE;
        if (s.chartKey !== s.gans.map((gan, i) => gan + s.zhis[i]).join('|') || s.zhis[2] !== '戌' || s.gans[2] !== '戊') {
            issues.push('reviewed-natal-chart-mismatch');
        }
        const spans = [TARGET_REVIEW.sourcePositionWording, TARGET_REVIEW.targetAntecedentSpan, ASSERTION_REVIEW.evidenceSpan];
        if (!spans.every((span) => s.sourceText.includes(span))) issues.push('reviewed-source-spans-missing');
        const binding = reviewHiddenBinding();
        if (!binding.valid || binding.roleMatchedCandidates[0]?.actorKey !== TARGET_REVIEW.stableActorKey) {
            issues.push('reviewed-hidden-ding-identity-mismatch');
        }
        return freeze({ valid: issues.length === 0, issues });
    };

    const inventoryReady = (inventory) => [inventory?.actorProfiles, inventory?.evidenceRecords].every(
        (records) => Array.isArray(records) && Array.from(records).every((record) => record && typeof record === 'object')
    );
    const matchesInventory = (inventory, expected) => {
        const { actorKey } = expected;
        const evidence = inventory.evidenceRecords.filter((record) => record.actorKey === actorKey && record.sourceScope === expected.sourceScope);
        const profiles = inventory.actorProfiles.filter((profile) => profile.actorKey === actorKey);
        return profiles.length === 1 && evidence.length === 1
            && Object.entries(expected).every(([key, value]) => evidence[0][key] === value);
    };
    const expectedWealthCandidates = () => {
        const { gans, zhis } = SOURCE_CASE;
        const dayGan = gans[2];
        const role = (gan) => core.shiShenMap[dayGan][gan];
        const isWealth = (gan) => ['正财', '偏财'].includes(role(gan));
        const candidates = [];
        for (const [index, position] of positions.entries()) {
            const gan = gans[index];
            const zhi = zhis[index];
            if (isWealth(gan)) {
                candidates.push({ actorKey: `visible:${index}:${gan}`, sourceScope: 'surface-stem', position,
                    pillarIndex: null, gan, zhi: null, wuxing: core.getWuXing(gan), tenGod: role(gan) });
            }
            if (core.getWuXing(zhi) === '水') {
                candidates.push({ actorKey: `surface-branch:${index}:${zhi}`, sourceScope: 'surface-branch', position,
                    pillarIndex: index, gan: null, zhi, wuxing: '水', tenGod: null });
            }
            for (const candidate of hidden.buildHiddenCandidates(SOURCE_CASE, { pillar: position, pillarIndex: index })) {
                if (!isWealth(candidate.gan)) continue;
                candidates.push({ actorKey: candidate.actorKey, sourceScope: 'hidden-modifier', position,
                    pillarIndex: index, gan: candidate.gan, zhi, wuxing: core.getWuXing(candidate.gan), tenGod: candidate.tenGod });
            }
        }
        return candidates;
    };

    const normalizeReviewedTarget = (candidate) => {
        const binding = {
            status: hidden.BINDING_STATES.RESOLVED_SOURCE_SCOPED, sourceCaseId: SOURCE_CASE.id,
            stableActorKey: candidate.actorKey, scope: candidate.scope, cardinality: 1,
            targetRoleClass: candidate.tenGod, targetAntecedentSpan: TARGET_REVIEW.targetAntecedentSpan,
            sourceCaseScopedBinding: true
        };
        const record = {
            id: 'CF-SHSTR-NORMALIZED-01', sourceCaseId: SOURCE_CASE.id, annotationId: ANNOTATION.id,
            sourceId: SOURCE_CASE.sourceId, sourceText: SOURCE_CASE.sourceText, chartKey: SOURCE_CASE.chartKey,
            sourceContextType: SOURCE_CASE.sourceContextType, sourcePredicateType: SOURCE_CASE.predicateType,
            annotationDisposition: ANNOTATION.annotationDisposition,
            contextSpans: normalizer.normalizeContextSpans(ANNOTATION), configurationSpans: [],
            relationUnits: [normalizer.normalizeRelationUnit(SOURCE_CASE, ANNOTATION.relationUnits[0], [], [binding])],
            sourceEvidenceIds: evidenceIds, provenance: SOURCE_CASE
        };
        const validation = normalizedContract.validateNormalizedRecord(record);
        return freeze({
            ...record, validation,
            normalizationState: validation.valid ? normalizedContract.NORMALIZATION_STATES.NORMALIZED : normalizedContract.NORMALIZATION_STATES.UNRESOLVED,
            blockerReasons: validation.errors
        });
    };

    const evaluateSource = (input, context = {}) => {
        const sourceValidation = validateSourceInput(input);
        const chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const base = {
            sourceValidation, chartKey, targetActorKey: null, sourceActorKey: null, sourceEndpoint: null, sourceGroupId: null,
            sourceCandidateInventoryComplete: false, wealthCandidates: [], sourceAssertion: null, normalizedInput: null,
            targetResolution: null, relationIdentity: null, relationRealizationResolved: false, relationRealized: null,
            executionGate: null, executionAuthorized: false, effectAuthority: null, relationEffects: [], memberEdges: []
        };
        const result = (status, blockerReasons, extra = {}) => freeze({ ...base, ...extra, status, blockerReasons });
        if (!sourceValidation.valid) return result(STATES.INVALID, sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED, ['complete-current-chart-required']);
        if (chartKey !== SOURCE_CASE.chartKey) return result(STATES.NOT_APPLICABLE, ['outside-exact-reviewed-hidden-seal-case']);

        const inventory = context.inventory;
        const candidate = reviewHiddenBinding().roleMatchedCandidates[0];
        const expectedTarget = { actorKey: candidate.actorKey, sourceScope: 'hidden-modifier', position: candidate.pillar,
            pillarIndex: candidate.pillarIndex, gan: candidate.gan, zhi: candidate.zhi,
            wuxing: core.getWuXing(candidate.gan), tenGod: candidate.tenGod };
        if (!inventoryReady(inventory) || !matchesInventory(inventory, expectedTarget)) {
            return result(STATES.UNRESOLVED, ['actual-named-hidden-seal-inventory-required'], { sourceAssertion: ASSERTION_REVIEW });
        }

        const normalizedInput = normalizeReviewedTarget(candidate);
        const targetResolution = resolver.resolveRecord(normalizedInput);
        const target = targetResolution.unitResolutions[0];
        if (!normalizedInput.validation.valid || target?.resolutionState !== resolver.RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR
            || target.targetReference?.actorKey !== candidate.actorKey || target.targetReference?.scope !== candidate.scope) {
            return result(STATES.UNRESOLVED, ['actual-hidden-target-consumption-failed'], { sourceAssertion: ASSERTION_REVIEW });
        }

        const expected = expectedWealthCandidates();
        const wealthCandidates = expected.filter((entry) => matchesInventory(inventory, entry));
        const sourceCandidateInventoryComplete = wealthCandidates.length === expected.length;
        const executionGate = kernel.executeRelationEffect({
            id: 'CF-SHSTR-EXECUTION-GATE-01', sourceEndpoint: null, targetResolution: target, relationIdentity: null,
            realizationState: kernel.REALIZATION_STATES.UNRESOLVED,
            authorization: { state: kernel.AUTHORIZATION_STATES.UNRESOLVED, sourceEvidenceIds: evidenceIds }
        });
        const blockers = ['source-wealth-role-has-no-bound-actor-or-group'];
        if (!sourceCandidateInventoryComplete) blockers.push('wealth-candidate-inventory-incomplete');
        return result(STATES.TARGET_RESOLVED, blockers, {
            targetActorKey: candidate.actorKey, sourceAssertion: ASSERTION_REVIEW, normalizedInput, targetResolution,
            wealthCandidates, sourceCandidateInventoryComplete, executionGate
        });
    };

    const buildProfile = (semanticModel = {}, synthesis = {}) => {
        const result = evaluateSource(inputForCase(), {
            chartKey: chart.buildStructuredChartKey(semanticModel, synthesis) || null,
            inventory: synthesis.contextualForcePartyMembershipInventory
        });
        return freeze({
            result, finiteSourceReviewComplete: result.sourceValidation.valid,
            newCompleteSourceCaseCount: 1, resolvedRuntimeHiddenTargetCount: Number(result.status === STATES.TARGET_RESOLVED),
            resolvedRuntimeNonrealizationCount: 0, newEffectAuthorityCount: 0, relationEffects: [], memberEdges: []
        });
    };
    GuiJia.baziContextualForcePartySourceHiddenSealTargetReviewProfile = freeze({
        installed: true, VERSION, RULE_ID, STATES, CONTRACT, inputForCase, validateSourceInput, evaluateSource, buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
