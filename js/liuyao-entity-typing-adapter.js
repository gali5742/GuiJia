(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const baseProvider = GuiJia.liuyaoSemanticSlotProvider;
    const objectResolver = GuiJia.liuyaoObjectEntityResolver;
    const sufficiency = GuiJia.liuyaoSemanticSufficiency;
    if (!baseProvider?.resolveSemanticSlots || !baseProvider?.mergeClaims || !objectResolver?.extractReferentCandidates || !sufficiency?.slotSchema) {
        throw new Error('semantic slot provider + object resolver must load before liuyao-entity-typing-adapter.js');
    }

    const VERSION = '0.1';
    const TYPE_TO_SLOT = Object.freeze({
        investment_asset:'investment_target',
        purchasable_item:'purchase_object',
        delivery_subject:'delivery_target'
    });
    const ROUTE_EXPECTED_TYPE = Object.freeze({
        investment_profit:'investment_asset',
        investment_suitability:'investment_asset',
        investment_position_decision:'investment_asset',
        investment_price_trend:'investment_asset',
        item_purchase:'purchasable_item',
        receive_item:'delivery_subject'
    });
    const DEFAULT_MIN_CONFIDENCE = 0.65;

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

    const makeTypingClaim = (slotId, candidate, prediction) => ({
        id:slotId,
        value:candidate.text,
        evidence:candidate.evidence || candidate.text,
        providerId:'entity_typing',
        sourceScope:'question',
        source:'question',
        confidence:clamp01(prediction.confidence, 0),
        provenance:{
            providerId:'entity_typing',
            adapterVersion:VERSION,
            modelId:prediction.modelId || 'unbound',
            type:prediction.type,
            score:Number(prediction.score ?? prediction.confidence ?? 0),
            margin:Number(prediction.margin ?? 0),
            entity:candidate.text,
            candidateStrategy:candidate.strategy || null
        }
    });

    const entityTypingClaims = (input = {}, baseResolution = null) => {
        const routeId = String(input.routeId || '');
        const expectedType = ROUTE_EXPECTED_TYPE[routeId] || '';
        const slotId = TYPE_TO_SLOT[expectedType] || '';
        const predictions = Array.isArray(input.entityTypingPredictions) ? input.entityTypingPredictions : [];
        const claims = [];
        const ignored = [];
        if (!expectedType || !slotId || !sufficiency.slotSchema[slotId]) {
            return { providerId:'entity_typing', claims, ignored, candidates:[] };
        }

        const alreadyResolved = baseResolution?.resolvedSlots?.some((slot) => slot.id === slotId && slot.sourceScope === 'question');
        if (alreadyResolved) {
            ignored.push({ providerId:'entity_typing', slotId, reason:'slot_already_resolved' });
            return { providerId:'entity_typing', claims, ignored, candidates:[] };
        }

        const question = input.question || input.intent?.rawQuestion || '';
        const candidates = objectResolver.extractReferentCandidates(question);
        const minConfidence = Number.isFinite(Number(input.minEntityTypingConfidence))
            ? Math.max(0, Math.min(1, Number(input.minEntityTypingConfidence)))
            : DEFAULT_MIN_CONFIDENCE;

        for (const candidate of candidates) {
            const matches = predictions.filter((prediction) => sameEntity(candidate, prediction));
            if (!matches.length) {
                ignored.push({ providerId:'entity_typing', slotId, reason:'no_prediction_for_candidate', candidate:candidate.text });
                continue;
            }
            const ordered = [...matches].sort((a, b) => clamp01(b.confidence, 0) - clamp01(a.confidence, 0));
            const prediction = ordered[0];
            const confidence = clamp01(prediction.confidence, 0);
            if (prediction.type === 'unknown') {
                ignored.push({ providerId:'entity_typing', slotId, reason:'typed_unknown', candidate:candidate.text, confidence });
                continue;
            }
            if (confidence < minConfidence) {
                ignored.push({ providerId:'entity_typing', slotId, reason:'below_confidence_floor', candidate:candidate.text, confidence, minConfidence });
                continue;
            }
            if (prediction.type !== expectedType) {
                ignored.push({ providerId:'entity_typing', slotId, reason:'type_incompatible_with_route', candidate:candidate.text, predictedType:prediction.type, expectedType, confidence });
                continue;
            }
            claims.push(makeTypingClaim(slotId, candidate, prediction));
        }

        return { providerId:'entity_typing', claims, ignored, candidates };
    };

    const baseResolveSemanticSlots = baseProvider.resolveSemanticSlots.bind(baseProvider);
    const mergeClaims = baseProvider.mergeClaims.bind(baseProvider);

    const resolveSemanticSlots = (input = {}) => {
        const base = baseResolveSemanticSlots(input);
        const typingRun = entityTypingClaims(input, base);
        const allClaims = [...base.claims, ...typingRun.claims];
        const merged = mergeClaims(allClaims);
        const questionSlots = merged.resolvedSlots.filter((slot) => slot.sourceScope === 'question').map((slot) => ({ ...slot, source:'question' }));
        const contextSlots = merged.resolvedSlots.filter((slot) => slot.sourceScope === 'context').map((slot) => ({ ...slot, source:'context' }));
        return {
            ...base,
            providerRuns:[...base.providerRuns, { providerId:'entity_typing', claimCount:typingRun.claims.length, ignoredCount:typingRun.ignored.length }],
            claims:allClaims,
            resolvedSlots:merged.resolvedSlots,
            questionSlots,
            contextSlots,
            conflicts:merged.conflicts,
            superseded:merged.superseded,
            ignoredClaims:[...base.ignoredClaims, ...typingRun.ignored],
            entityTypingCandidates:typingRun.candidates
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
        investment_target:{ ...baseProvider.providerAudit.investment_target, fallback:['entity_typing','explicit_context','ml_multi_label'], note:'高精度 Object Resolver 优先；裸专名可由独立 Entity Typing 高置信判为 investment_asset 后补充。route 本身不能制造类型。' },
        delivery_target:{ ...baseProvider.providerAudit.delivery_target, fallback:['entity_typing','explicit_context','ml_multi_label'], note:'显式对象优先；必要时可由 Entity Typing 将候选判为 delivery_subject 后补充。' },
        purchase_object:{ ...baseProvider.providerAudit.purchase_object, fallback:['entity_typing','explicit_context','ml_multi_label'], note:'显式对象优先；必要时可由 Entity Typing 将候选判为 purchasable_item 后补充。' }
    });

    GuiJia.liuyaoEntityTypingAdapter = Object.freeze({
        version:VERSION,
        typeToSlot:TYPE_TO_SLOT,
        routeExpectedType:ROUTE_EXPECTED_TYPE,
        defaultMinConfidence:DEFAULT_MIN_CONFIDENCE,
        entityTypingClaims
    });

    GuiJia.liuyaoSemanticSlotProvider = Object.freeze({
        ...baseProvider,
        providerAudit:updatedAudit,
        entityTypingClaims,
        resolveSemanticSlots,
        evaluateWithProviders
    });
})(typeof window !== 'undefined' ? window : globalThis);
