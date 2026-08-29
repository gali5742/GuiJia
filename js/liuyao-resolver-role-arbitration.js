(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const baseProvider = GuiJia.liuyaoSemanticSlotProvider;
    const adapter = GuiJia.liuyaoContextualObjectRoleAdapter;
    const sufficiency = GuiJia.liuyaoSemanticSufficiency;
    if (!baseProvider?.resolveSemanticSlots || !baseProvider?.mergeClaims || !adapter?.contextualObjectRoleClaims || !adapter?.normalizeUpstreamCandidates || !sufficiency?.evaluateSemanticSufficiency) {
        throw new Error('contextual object role adapter must load before liuyao-resolver-role-arbitration.js');
    }

    const VERSION = '0.1';
    const clean = (value) => String(value || '').trim();
    const normalize = (value) => clean(value).replace(/[\s，,。；;！？?、:：]/g, '').toLowerCase();
    const clamp01 = (value, fallback = 0) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        return Math.max(0, Math.min(1, n));
    };
    const overlaps = (a, b) => {
        const left = normalize(a);
        const right = normalize(b);
        return Boolean(left && right && (left === right || left.includes(right) || right.includes(left)));
    };
    const sameValue = (a, b) => {
        const left = normalize(a);
        const right = normalize(b);
        return Boolean(left && right && left === right);
    };
    const questionContains = (question, value) => {
        const q = normalize(question);
        const v = normalize(value);
        return Boolean(q && v && q.includes(v));
    };

    const predictionEntity = (prediction) => clean(prediction?.entity || prediction?.candidate || prediction?.text);
    const predictionRole = (prediction) => clean(prediction?.role || prediction?.type);
    const predictionConfidence = (prediction) => clamp01(prediction?.confidence ?? prediction?.score, 0);

    const matchingPrediction = (candidate, predictions) => {
        const candidateText = clean(candidate?.text);
        const matches = (predictions || []).filter((prediction) => overlaps(candidateText, predictionEntity(prediction)));
        if (!matches.length) return null;
        return [...matches].sort((a, b) => predictionConfidence(b) - predictionConfidence(a))[0];
    };

    const inspectRoleEvidence = (input = {}) => {
        const routeId = clean(input.routeId);
        const expectedRole = adapter.routeExpectedRole?.[routeId] || '';
        const slotId = adapter.roleToSlot?.[expectedRole] || '';
        const candidates = adapter.normalizeUpstreamCandidates(input.objectCandidates);
        const predictions = Array.isArray(input.objectRolePredictions) ? input.objectRolePredictions : [];
        if (!expectedRole || !slotId || !candidates.length || !predictions.length) {
            return { active:false, routeId, expectedRole, slotId, candidates, decisions:[] };
        }

        const question = input.question || input.intent?.rawQuestion || '';
        const decisions = candidates.map((candidate) => {
            const prediction = matchingPrediction(candidate, predictions);
            const role = predictionRole(prediction);
            let decision = 'no_prediction';
            if (prediction) {
                if (role === 'no_supported_role') decision = 'explicit_no_role';
                else if (prediction.accepted === true && role === expectedRole) decision = 'accepted_expected_role';
                else if (prediction.accepted === true) decision = 'accepted_incompatible_role';
                else decision = 'not_accepted';
            }
            return {
                candidate,
                prediction,
                role,
                decision,
                candidatePresentInQuestion:questionContains(question, candidate.text)
            };
        });
        return { active:true, routeId, expectedRole, slotId, candidates, decisions };
    };

    const uniqueAcceptedValues = (roleRun, slotId) => [...new Set((roleRun?.claims || [])
        .filter((claim) => claim.id === slotId)
        .map((claim) => normalize(claim.value))
        .filter(Boolean))];

    const resolveSemanticSlots = (input = {}) => {
        const base = baseProvider.resolveSemanticSlots(input);
        const evidence = inspectRoleEvidence(input);
        if (!evidence.active) {
            return {
                ...base,
                resolverRoleArbitrationVersion:VERSION,
                resolverRoleArbitrationStatus:'inactive',
                resolverRoleArbitrationDecisions:[]
            };
        }

        const structuredResolved = base.resolvedSlots?.some((slot) => slot.id === evidence.slotId && slot.sourceScope === 'question' && slot.providerId === 'structured_intent');
        if (structuredResolved) {
            return {
                ...base,
                resolverRoleArbitrationVersion:VERSION,
                resolverRoleArbitrationStatus:'structured_intent_priority',
                resolverRoleArbitrationDecisions:[{
                    slotId:evidence.slotId,
                    action:'keep_structured_intent',
                    reason:'structured_object_has_priority'
                }]
            };
        }

        // Probe the frozen v0.2 role adapter without allowing an already-resolved heuristic
        // object slot to suppress the role evidence. The old adapter itself remains unchanged.
        const probeBase = {
            ...base,
            resolvedSlots:(base.resolvedSlots || []).filter((slot) => !(slot.id === evidence.slotId && slot.providerId === 'object_or_entity_resolver'))
        };
        const roleRun = adapter.contextualObjectRoleClaims(input, probeBase);
        const acceptedValues = uniqueAcceptedValues(roleRun, evidence.slotId);
        const acceptedClaims = (roleRun.claims || []).filter((claim) => claim.id === evidence.slotId);
        const explicitNoRole = evidence.decisions.filter((item) => item.decision === 'explicit_no_role' && item.candidatePresentInQuestion);

        let claims = (base.claims || []).filter((claim) => claim.providerId !== 'contextual_object_role');
        const objectClaims = claims.filter((claim) => claim.id === evidence.slotId && claim.providerId === 'object_or_entity_resolver');
        const baseResolvedObject = (base.resolvedSlots || []).find((slot) => slot.id === evidence.slotId && slot.providerId === 'object_or_entity_resolver');
        const decisions = [];
        let roleClaimsToAdd = [...acceptedClaims];

        // An explicit contextual no-role decision is a gate: once an independent upstream
        // candidate has been evaluated as no supported object role, the heuristic resolver
        // must not silently bind the same target slot behind that gate.
        if (explicitNoRole.length && !acceptedClaims.length) {
            const removed = claims.filter((claim) => claim.id === evidence.slotId && claim.providerId === 'object_or_entity_resolver');
            claims = claims.filter((claim) => !(claim.id === evidence.slotId && claim.providerId === 'object_or_entity_resolver'));
            decisions.push({
                slotId:evidence.slotId,
                action:'veto_object_resolver',
                reason:'explicit_no_supported_role',
                candidates:explicitNoRole.map((item) => item.candidate.text),
                removedValues:removed.map((claim) => claim.value)
            });
        } else if (acceptedValues.length === 1 && acceptedClaims.length) {
            const selectedClaim = acceptedClaims.find((claim) => normalize(claim.value) === acceptedValues[0]) || acceptedClaims[0];
            const selectedValue = selectedClaim.value;
            const selectedNorm = normalize(selectedValue);
            const selectedIsExplicit = evidence.decisions.some((item) => item.decision === 'accepted_expected_role' && sameValue(item.candidate.text, selectedValue) && item.candidatePresentInQuestion);

            if (baseResolvedObject) {
                const baseValue = baseResolvedObject.value;
                const baseNorm = normalize(baseValue);
                if (baseNorm === selectedNorm) {
                    // Exact agreement: preserve the deterministic resolver as the primary
                    // provider and only record that the role model independently supports it.
                    roleClaimsToAdd = [];
                    decisions.push({ slotId:evidence.slotId, action:'keep_object_resolver', reason:'exact_role_support', value:baseValue });
                } else if (selectedIsExplicit && baseNorm.includes(selectedNorm) && selectedNorm.length < baseNorm.length) {
                    claims = claims.filter((claim) => !(claim.id === evidence.slotId && claim.providerId === 'object_or_entity_resolver'));
                    decisions.push({
                        slotId:evidence.slotId,
                        action:'refine_to_contextual_candidate',
                        reason:'accepted_candidate_is_narrower_boundary',
                        from:baseValue,
                        to:selectedValue
                    });
                } else if (selectedNorm.includes(baseNorm) && baseNorm.length < selectedNorm.length) {
                    roleClaimsToAdd = [];
                    decisions.push({
                        slotId:evidence.slotId,
                        action:'keep_object_resolver',
                        reason:'resolver_boundary_is_narrower',
                        value:baseValue,
                        upstreamCandidate:selectedValue
                    });
                } else {
                    // A single already-resolved heuristic object and an independent accepted
                    // candidate disagree completely. Keep both claims so mergeClaims turns
                    // the slot into an explicit conflict instead of silently choosing either.
                    decisions.push({
                        slotId:evidence.slotId,
                        action:'emit_conflict',
                        reason:'resolved_object_disagrees_with_contextual_candidate',
                        resolverValue:baseValue,
                        contextualValue:selectedValue
                    });
                }
            } else if (objectClaims.length) {
                // If the base resolver itself was unresolved because it produced multiple
                // candidates, a unique accepted contextual role may disambiguate them.
                claims = claims.filter((claim) => {
                    if (claim.id !== evidence.slotId || claim.providerId !== 'object_or_entity_resolver') return true;
                    if (sameValue(claim.value, selectedValue)) return true;
                    decisions.push({
                        slotId:evidence.slotId,
                        action:'drop_conflicting_resolver_candidate',
                        reason:'accepted_role_disambiguates_unresolved_candidates',
                        removedValue:claim.value,
                        selectedValue
                    });
                    return false;
                });
            } else {
                decisions.push({ slotId:evidence.slotId, action:'add_contextual_role_claim', reason:'no_resolved_object_claim', value:selectedValue });
            }
        } else if (acceptedValues.length > 1) {
            decisions.push({
                slotId:evidence.slotId,
                action:'emit_conflict',
                reason:'multiple_accepted_contextual_candidates',
                values:acceptedClaims.map((claim) => claim.value)
            });
        }

        claims.push(...roleClaimsToAdd);
        const merged = baseProvider.mergeClaims(claims);
        const questionSlots = merged.resolvedSlots.filter((slot) => slot.sourceScope === 'question').map((slot) => ({ ...slot, source:'question' }));
        const contextSlots = merged.resolvedSlots.filter((slot) => slot.sourceScope === 'context').map((slot) => ({ ...slot, source:'context' }));
        const arbitrationIgnored = (roleRun.ignored || []).map((item) => ({ ...item, arbitrationProbe:true }));

        return {
            ...base,
            providerRuns:[...(base.providerRuns || []), { providerId:'resolver_role_arbitration', claimCount:roleClaimsToAdd.length, ignoredCount:arbitrationIgnored.length }],
            claims,
            resolvedSlots:merged.resolvedSlots,
            questionSlots,
            contextSlots,
            conflicts:merged.conflicts,
            superseded:merged.superseded,
            ignoredClaims:[...(base.ignoredClaims || []), ...arbitrationIgnored],
            resolverRoleArbitrationVersion:VERSION,
            resolverRoleArbitrationStatus:decisions.length ? 'applied' : 'no_change',
            resolverRoleArbitrationDecisions:decisions
        };
    };

    const evaluateWithProviders = (input = {}) => {
        const resolution = resolveSemanticSlots(input);
        const evaluation = sufficiency.evaluateSemanticSufficiency(input.routeId, resolution.questionSlots, resolution.contextSlots);
        return {
            ...evaluation,
            slotResolution:resolution,
            providerConflicts:resolution.conflicts,
            providerStatus:resolution.conflicts.length ? 'conflict_present' : 'resolved'
        };
    };

    const updatedAudit = Object.freeze({
        ...baseProvider.providerAudit,
        investment_target:{ ...baseProvider.providerAudit.investment_target, arbitration:'resolver_role_v0.1' },
        delivery_target:{ ...baseProvider.providerAudit.delivery_target, arbitration:'resolver_role_v0.1' },
        purchase_object:{ ...baseProvider.providerAudit.purchase_object, arbitration:'resolver_role_v0.1' }
    });

    GuiJia.liuyaoResolverRoleArbitration = Object.freeze({
        version:VERSION,
        inspectRoleEvidence
    });

    GuiJia.liuyaoSemanticSlotProvider = Object.freeze({
        ...baseProvider,
        providerAudit:updatedAudit,
        resolveSemanticSlots,
        evaluateWithProviders
    });
})(typeof window !== 'undefined' ? window : globalThis);
