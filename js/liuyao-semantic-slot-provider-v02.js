(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const base = GuiJia.liuyaoSemanticSlotProvider;
    const sufficiency = GuiJia.liuyaoSemanticSufficiency;
    if (!base?.resolveSemanticSlots || !base?.evaluateWithProviders) {
        throw new Error('liuyao-semantic-slot-provider.js must be loaded before liuyao-semantic-slot-provider-v02.js');
    }
    if (sufficiency?.version !== '0.2' || !sufficiency?.evaluateIntentSufficiency) {
        throw new Error('Semantic Sufficiency v0.2 must be loaded before liuyao-semantic-slot-provider-v02.js');
    }

    const VERSION = '0.2';
    const clamp01 = (value, fallback = 0.9) => {
        const number = Number(value);
        return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : fallback;
    };

    const EXTENDED_PROVIDER_AUDIT = Object.freeze({
        ...base.providerAudit,
        transaction_context:{ primary:'structured_intent', current:'implemented_v0.2', fallback:['explicit_context'], note:'event=transaction + transactionPurpose=commercial_trade。' },
        inventory_purchase_context:{ primary:'structured_intent', current:'implemented_v0.2', fallback:['explicit_context'], note:'event=inventory_purchase。' },
        inventory_sale_context:{ primary:'structured_intent', current:'implemented_v0.2', fallback:['explicit_context'], note:'event=inventory_sale。' },
        lending_context:{ primary:'structured_intent', current:'implemented_v0.2', fallback:['explicit_context'], note:'event=lend_money，资金方向由占问者向外。' },
        debt_collection_context:{ primary:'structured_intent', current:'implemented_v0.2', fallback:['explicit_context'], note:'event=debt_collection，占问者回收债权。' },
        partnership_context:{ primary:'structured_intent', current:'implemented_v0.2', fallback:['explicit_context'], note:'event=partnership。' }
    });

    const makeIntentSlot = (id, intent, evidence, value) => ({
        id,
        value:String(value || ''),
        evidence,
        source:'question',
        sourceScope:'question',
        providerId:'structured_intent_v02',
        confidence:clamp01(intent?.confidence),
        provenance:{
            providerId:'structured_intent_v02',
            intentVersion:intent?.version || null,
            field:evidence
        },
        supportingProviders:['structured_intent_v02']
    });

    const extendedIntentSlots = (routeId, intent, existingSlots = []) => {
        if (!intent || intent.status !== 'resolved') return [];
        const event = intent.event?.type || '';
        const semantics = intent.semantics || {};
        const existing = new Set(existingSlots.map((slot) => slot.id));
        const additions = [];
        const add = (id, evidence, value) => {
            if (!sufficiency.slotSchema[id] || existing.has(id)) return;
            existing.add(id);
            additions.push(makeIntentSlot(id, intent, evidence, value));
        };

        if (routeId === 'commercial_transaction' && event === 'transaction' && semantics.transactionPurpose === 'commercial_trade') {
            add('transaction_context', 'intent.event/semantics.transactionPurpose', 'commercial_trade');
        }
        if (routeId === 'inventory_purchase' && event === 'inventory_purchase') {
            add('inventory_purchase_context', 'intent.event', event);
        }
        if (routeId === 'inventory_sale' && event === 'inventory_sale') {
            add('inventory_sale_context', 'intent.event', event);
        }
        if (routeId === 'lend_money' && event === 'lend_money') {
            add('lending_context', 'intent.event', event);
        }
        if (routeId === 'debt_collection' && event === 'debt_collection') {
            add('debt_collection_context', 'intent.event', event);
        }
        if (routeId === 'partnership' && event === 'partnership') {
            add('partnership_context', 'intent.event', event);
        }
        if (routeId === 'investment_liquidation' && event === 'investment' && (semantics.investmentGoal === 'liquidation' || semantics.investmentAction === 'exit')) {
            add('position_context', 'intent.semantics.investmentGoal/investmentAction', semantics.investmentAction || semantics.investmentGoal);
        }
        return additions;
    };

    const resolveSemanticSlots = (input = {}) => {
        const resolution = base.resolveSemanticSlots(input);
        const additions = extendedIntentSlots(String(input.routeId || ''), input.intent, resolution.resolvedSlots);
        if (!additions.length) return { ...resolution, version:VERSION };

        const resolvedSlots = [...resolution.resolvedSlots, ...additions];
        return {
            ...resolution,
            version:VERSION,
            resolvedSlots,
            questionSlots:[...resolution.questionSlots, ...additions.map((slot) => ({ ...slot, source:'question' }))],
            providerRuns:[...resolution.providerRuns, { providerId:'structured_intent_v02', claimCount:additions.length, ignoredCount:0 }],
            claims:[...resolution.claims, ...additions]
        };
    };

    const evaluateWithProviders = (input = {}) => {
        const resolution = resolveSemanticSlots(input);
        const evaluation = input.intent
            ? sufficiency.evaluateIntentSufficiency(input.routeId, input.intent, resolution.questionSlots, resolution.contextSlots)
            : sufficiency.evaluateSemanticSufficiency(input.routeId, resolution.questionSlots, resolution.contextSlots);
        return {
            ...evaluation,
            slotResolution:resolution,
            providerConflicts:resolution.conflicts,
            providerStatus:resolution.conflicts.length ? 'conflict_present' : 'resolved'
        };
    };

    GuiJia.liuyaoSemanticSlotProvider = Object.freeze({
        ...base,
        version:VERSION,
        providerAudit:EXTENDED_PROVIDER_AUDIT,
        extendedIntentSlots,
        resolveSemanticSlots,
        evaluateWithProviders
    });
})(typeof window !== 'undefined' ? window : globalThis);