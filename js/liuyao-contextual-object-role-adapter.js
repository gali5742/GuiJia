(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const baseProvider = GuiJia.liuyaoSemanticSlotProvider;
    const objectResolver = GuiJia.liuyaoObjectEntityResolver;
    const sufficiency = GuiJia.liuyaoSemanticSufficiency;
    if (!baseProvider?.resolveSemanticSlots || !baseProvider?.mergeClaims || !objectResolver?.extractReferentCandidates || !sufficiency?.slotSchema) {
        throw new Error('semantic slot provider + object resolver must load before liuyao-contextual-object-role-adapter.js');
    }

    const VERSION = '0.2';
    const ROLE_TO_SLOT = Object.freeze({
        investment_target_role:'investment_target',
        purchase_target_role:'purchase_object',
        delivery_target_role:'delivery_target'
    });
    const ROUTE_EXPECTED_ROLE = Object.freeze({
        investment_profit:'investment_target_role',
        investment_suitability:'investment_target_role',
        investment_position_decision:'investment_target_role',
        investment_price_trend:'investment_target_role',
        item_purchase:'purchase_target_role',
        receive_item:'delivery_target_role'
    });

    const clean = (value) => String(value || '').trim();
    const normalize = (value) => clean(value).replace(/[\s，,。；;！？?、:：]/g, '').toLowerCase();
    const clamp01 = (value, fallback = 0) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        return Math.max(0, Math.min(1, n));
    };

    const sameEntity = (candidate, prediction) => {
        const a = normalize(candidate?.text);
        const b = normalize(prediction?.entity || prediction?.candidate || prediction?.text);
        if (!a || !b) return false;
        return a === b || (a.length >= 2 && b.length >= 2 && (a.includes(b) || b.includes(a)));
    };

    const normalizeUpstreamCandidates = (items = []) => (Array.isArray(items) ? items : [])
        .map((item) => {
            if (typeof item === 'string') {
                const text = clean(item);
                return text ? { text, evidence:text, strategy:'upstream_object_candidate', confidence:0.99, roleHint:'upstream_candidate', clauseIndex:null } : null;
            }
            const text = clean(item?.text || item?.entity || item?.value);
            if (!text) return null;
            return {
                text,
                evidence:clean(item?.evidence || text),
                strategy:item?.strategy || 'upstream_object_candidate',
                confidence:clamp01(item?.confidence, 0.99),
                roleHint:item?.roleHint || 'upstream_candidate',
                clauseIndex:item?.clauseIndex ?? null
            };
        })
        .filter(Boolean);

    const candidateEvidence = (input = {}) => {
        const upstream = normalizeUpstreamCandidates(input.objectCandidates);
        if (upstream.length) return { candidates:upstream, source:'upstream_object_candidates' };
        const question = input.question || input.intent?.rawQuestion || '';
        return { candidates:objectResolver.extractReferentCandidates(question), source:'object_resolver_fallback' };
    };

    const makeRoleClaim = (slotId, candidate, prediction) => ({
        id:slotId,
        value:candidate.text,
        evidence:candidate.evidence || candidate.text,
        providerId:'contextual_object_role',
        sourceScope:'question',
        source:'question',
        confidence:clamp01(prediction.confidence, 0),
        provenance:{
            providerId:'contextual_object_role',
            adapterVersion:VERSION,
            modelId:prediction.modelId || 'unbound',
            role:prediction.role || prediction.type,
            score:Number(prediction.score ?? prediction.confidence ?? 0),
            margin:Number(prediction.margin ?? 0),
            threshold:Number(prediction.threshold ?? 0),
            accepted:true,
            acceptancePolicy:'provider_calibrated',
            entity:candidate.text,
            candidateStrategy:candidate.strategy || null
        }
    });

    const contextualObjectRoleClaims = (input = {}, baseResolution = null) => {
        const routeId = String(input.routeId || '');
        const expectedRole = ROUTE_EXPECTED_ROLE[routeId] || '';
        const slotId = ROLE_TO_SLOT[expectedRole] || '';
        const predictions = Array.isArray(input.objectRolePredictions) ? input.objectRolePredictions : [];
        const claims = [];
        const ignored = [];
        if (!expectedRole || !slotId || !sufficiency.slotSchema[slotId]) {
            return { providerId:'contextual_object_role', claims, ignored, candidates:[], candidateSource:'none' };
        }

        const alreadyResolved = baseResolution?.resolvedSlots?.some((slot) => slot.id === slotId && slot.sourceScope === 'question');
        if (alreadyResolved) {
            ignored.push({ providerId:'contextual_object_role', slotId, reason:'slot_already_resolved' });
            return { providerId:'contextual_object_role', claims, ignored, candidates:[], candidateSource:'base_resolution' };
        }

        const evidence = candidateEvidence(input);
        const candidates = evidence.candidates;
        for (const candidate of candidates) {
            const matches = predictions.filter((prediction) => sameEntity(candidate, prediction));
            if (!matches.length) {
                ignored.push({ providerId:'contextual_object_role', slotId, reason:'no_prediction_for_candidate', candidate:candidate.text });
                continue;
            }
            const ordered = [...matches].sort((a, b) => clamp01(b.confidence, 0) - clamp01(a.confidence, 0));
            const prediction = ordered[0];
            const role = String(prediction.role || prediction.type || '');
            const confidence = clamp01(prediction.confidence, 0);
            if (role === 'no_supported_role') {
                ignored.push({
                    providerId:'contextual_object_role', slotId, reason:'no_supported_role', candidate:candidate.text,
                    confidence, accepted:prediction.accepted === true, margin:Number(prediction.margin ?? 0), threshold:Number(prediction.threshold ?? 0)
                });
                continue;
            }
            if (prediction.accepted !== true) {
                ignored.push({
                    providerId:'contextual_object_role', slotId, reason:'role_not_accepted', candidate:candidate.text, confidence,
                    score:Number(prediction.score ?? prediction.confidence ?? 0), margin:Number(prediction.margin ?? 0),
                    threshold:Number(prediction.threshold ?? 0), modelId:prediction.modelId || 'unbound'
                });
                continue;
            }
            if (role !== expectedRole) {
                ignored.push({
                    providerId:'contextual_object_role', slotId, reason:'role_incompatible_with_route', candidate:candidate.text,
                    predictedRole:role, expectedRole, confidence
                });
                continue;
            }
            claims.push(makeRoleClaim(slotId, candidate, prediction));
        }

        if (!candidates.length) ignored.push({ providerId:'contextual_object_role', slotId, reason:'no_object_candidate_evidence' });
        return { providerId:'contextual_object_role', claims, ignored, candidates, candidateSource:evidence.source };
    };

    const baseResolveSemanticSlots = baseProvider.resolveSemanticSlots.bind(baseProvider);
    const mergeClaims = baseProvider.mergeClaims.bind(baseProvider);

    const filterBaseObjectConflicts = (baseClaims, roleRun) => {
        const acceptedBySlot = new Map();
        for (const claim of roleRun.claims || []) {
            if (!acceptedBySlot.has(claim.id)) acceptedBySlot.set(claim.id, new Set());
            acceptedBySlot.get(claim.id).add(normalize(claim.value));
        }

        return (baseClaims || []).filter((claim) => {
            if (claim.providerId !== 'object_or_entity_resolver') return true;
            const acceptedValues = acceptedBySlot.get(claim.id);
            if (!acceptedValues || acceptedValues.size !== 1) return true;
            const selected = [...acceptedValues][0];
            if (normalize(claim.value) === selected) return true;
            roleRun.ignored.push({
                providerId:'contextual_object_role',
                slotId:claim.id,
                reason:'object_candidate_superseded_by_contextual_role',
                candidate:claim.value,
                selected:[...(roleRun.claims || [])].find((item) => item.id === claim.id)?.value || '',
                supersededProvider:'object_or_entity_resolver'
            });
            return false;
        });
    };

    const resolveSemanticSlots = (input = {}) => {
        const base = baseResolveSemanticSlots(input);
        const roleRun = contextualObjectRoleClaims(input, base);
        const filteredBaseClaims = filterBaseObjectConflicts(base.claims, roleRun);
        const allClaims = [...filteredBaseClaims, ...roleRun.claims];
        const merged = mergeClaims(allClaims);
        const questionSlots = merged.resolvedSlots.filter((slot) => slot.sourceScope === 'question').map((slot) => ({ ...slot, source:'question' }));
        const contextSlots = merged.resolvedSlots.filter((slot) => slot.sourceScope === 'context').map((slot) => ({ ...slot, source:'context' }));
        return {
            ...base,
            providerRuns:[...base.providerRuns, { providerId:'contextual_object_role', claimCount:roleRun.claims.length, ignoredCount:roleRun.ignored.length }],
            claims:allClaims,
            resolvedSlots:merged.resolvedSlots,
            questionSlots,
            contextSlots,
            conflicts:merged.conflicts,
            superseded:merged.superseded,
            ignoredClaims:[...base.ignoredClaims, ...roleRun.ignored],
            contextualObjectRoleCandidates:roleRun.candidates,
            contextualObjectRoleCandidateSource:roleRun.candidateSource
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
        investment_target:{ ...baseProvider.providerAudit.investment_target, fallback:['contextual_object_role','explicit_context','ml_multi_label'], note:'高精度 Object Resolver 优先；Contextual Object Role 消费独立上游 object candidate + role prediction；若高精度 resolver 自身因多个候选冲突而未能解析，accepted role 可消歧同 slot 的候选。' },
        delivery_target:{ ...baseProvider.providerAudit.delivery_target, fallback:['contextual_object_role','explicit_context','ml_multi_label'], note:'高精度显式对象优先；Contextual Object Role 只绑定已经由上游候选抽取确认的实体。' },
        purchase_object:{ ...baseProvider.providerAudit.purchase_object, fallback:['contextual_object_role','explicit_context','ml_multi_label'], note:'高精度显式对象优先；商品身份本身不够；若 resolver 同时抽到“价格”等非目标候选，accepted purchase role 可为当前 slot 做消歧。' }
    });

    GuiJia.liuyaoContextualObjectRoleAdapter = Object.freeze({
        version:VERSION,
        roleToSlot:ROLE_TO_SLOT,
        routeExpectedRole:ROUTE_EXPECTED_ROLE,
        acceptancePolicy:'provider_calibrated',
        contextualObjectRoleClaims,
        normalizeUpstreamCandidates
    });

    GuiJia.liuyaoSemanticSlotProvider = Object.freeze({
        ...baseProvider,
        providerAudit:updatedAudit,
        contextualObjectRoleClaims,
        resolveSemanticSlots,
        evaluateWithProviders
    });
})(typeof window !== 'undefined' ? window : globalThis);