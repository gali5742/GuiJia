(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const sufficiency = GuiJia.liuyaoSemanticSufficiency;
    if (!sufficiency?.slotSchema || !sufficiency?.routeRequirements) {
        throw new Error('liuyao-semantic-sufficiency.js must be loaded before liuyao-semantic-slot-provider.js');
    }

    const VERSION = '0.1';
    const SLOT_SCHEMA = sufficiency.slotSchema;
    const ROUTE_REQUIREMENTS = sufficiency.routeRequirements;
    const participantResolver = GuiJia.liuyaoParticipantResolver || null;

    const PROVIDER_AUDIT = Object.freeze({
        financial_scope:{ primary:'structured_intent', current:'implemented', fallback:['explicit_context','ml_multi_label'], note:'由明确的整体财运/总体财务 Intent 事实提供；ML 仅作未来补充。' },
        business_context:{ primary:'structured_intent', current:'implemented', fallback:['explicit_context','ml_multi_label'], note:'由经营/店铺/生意 Intent 事实提供。' },
        borrowing_context:{ primary:'structured_intent', current:'implemented', fallback:['explicit_context','ml_multi_label'], note:'由贷款、借款、融资 Intent 事实提供。' },
        debt_context:{ primary:'structured_intent', current:'implemented', fallback:['explicit_context','ml_multi_label'], note:'由债务偿还 Intent 事实提供。' },
        investment_target:{ primary:'object_or_entity_resolver', current:'interface_only', fallback:['explicit_context','ml_multi_label'], note:'不能仅凭 route=investment 自动补出标的；需真实对象/实体证据。' },
        position_context:{ primary:'structured_intent', current:'implemented', fallback:['explicit_context','ml_multi_label'], note:'由 investmentAction / investmentPosition 等结构化状态提供。' },
        employment_income_context:{ primary:'structured_intent', current:'implemented', fallback:['explicit_context','ml_multi_label'], note:'由 incomeType=salary 等结构化薪酬事实提供。' },
        bonus_context:{ primary:'structured_intent', current:'implemented', fallback:['explicit_context','ml_multi_label'], note:'由 incomeType=bonus 等结构化奖金事实提供。' },
        delivery_context:{ primary:'structured_intent', current:'implemented', fallback:['explicit_context','ml_multi_label'], note:'由 receive_item / deliveryMode 等交付事实提供。' },
        delivery_target:{ primary:'object_or_entity_resolver', current:'interface_only', fallback:['explicit_context','ml_multi_label'], note:'需要具体待收取对象；不能由“收到/到手”动作本身伪造。' },
        purchase_context:{ primary:'structured_intent', current:'implemented', fallback:['explicit_context','ml_multi_label'], note:'由 item_purchase / purchaseGoal 等购买事实提供。' },
        purchase_object:{ primary:'object_or_entity_resolver', current:'interface_only', fallback:['explicit_context','ml_multi_label'], note:'需要具体购买对象；裸“这个”不视为已解析对象。' },
        specific_counterpart:{ primary:'participant_resolver', current:'implemented', fallback:['structured_intent','explicit_context','ml_multi_label'], note:'优先复用 Participant Resolver；裸他/她/我们/对方不直接满足。' },
        marriage_proposal_context:{ primary:'structured_intent', current:'implemented', fallback:['explicit_context','ml_multi_label'], note:'由明确婚事/婚配 Intent 事实提供。' },
        existing_marriage_context:{ primary:'structured_intent', current:'implemented', fallback:['participant_resolver','explicit_context','ml_multi_label'], note:'由 spouse participant 或明确既有婚姻 Intent 事实提供。' }
    });

    const PROVIDER_PRIORITY = Object.freeze({
        participant_resolver:500,
        structured_intent:450,
        object_or_entity_resolver:425,
        explicit_context:400,
        ml_multi_label:300
    });
    const SOURCE_SCOPE_PRIORITY = Object.freeze({ question:1000, context:500 });

    const clamp01 = (value, fallback = 0.8) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        return Math.max(0, Math.min(1, n));
    };
    const cleanValue = (value) => value == null ? '' : String(value).trim();
    const isBareRelationPronoun = (value) => /^(?:他|她|他们|她们|我们|对方|那个人|这个人)$/.test(cleanValue(value));

    const makeClaim = ({ id, value = '', evidence = '', providerId, sourceScope = 'question', confidence = 0.9, provenance = null }) => ({
        id,
        value:cleanValue(value),
        evidence:String(evidence || ''),
        providerId,
        sourceScope:sourceScope === 'context' ? 'context' : 'question',
        source:sourceScope === 'context' ? 'context' : 'question',
        confidence:clamp01(confidence),
        provenance:provenance || { providerId }
    });

    const pushIfKnown = (claims, claim) => {
        if (!claim?.id || !SLOT_SCHEMA[claim.id]) return false;
        claims.push(claim);
        return true;
    };

    const structuredIntentClaims = (intent) => {
        const claims = [];
        if (!intent || intent.status !== 'resolved') return { providerId:'structured_intent', claims, ignored:[] };
        const event = intent.event?.type || '';
        const semantics = intent.semantics || {};
        const confidence = clamp01(intent.confidence, 0.9);
        const add = (id, evidence, value = '') => pushIfKnown(claims, makeClaim({
            id, value, evidence, providerId:'structured_intent', sourceScope:'question', confidence,
            provenance:{ providerId:'structured_intent', intentVersion:intent.version || null, field:evidence }
        }));

        if (event === 'financial_fortune' || (semantics.fortuneScope && semantics.fortuneScope !== 'unknown')) add('financial_scope', 'intent.event/semantics.fortuneScope', semantics.fortuneScope || event);
        if (event === 'business_operation') add('business_context', 'intent.event', event);
        if (event === 'borrow_money') add('borrowing_context', 'intent.event', event);
        if (event === 'debt_repayment') add('debt_context', 'intent.event', event);
        if (event === 'income' && semantics.incomeType === 'salary') add('employment_income_context', 'intent.semantics.incomeType', 'salary');
        if (event === 'income' && semantics.incomeType === 'bonus') add('bonus_context', 'intent.semantics.incomeType', 'bonus');
        if (event === 'receive_item' || (semantics.deliveryMode && semantics.deliveryMode !== 'unknown')) add('delivery_context', 'intent.event/semantics.deliveryMode', semantics.deliveryMode || event);
        if (event === 'item_purchase' || (semantics.purchaseGoal && semantics.purchaseGoal !== 'unknown')) add('purchase_context', 'intent.event/semantics.purchaseGoal', semantics.purchaseGoal || event);
        if (event === 'marriage_match') add('marriage_proposal_context', 'intent.event', event);

        const positionEvidence = [semantics.investmentAction, semantics.investmentPosition].filter(Boolean).join('/');
        if (['hold','exit'].includes(semantics.investmentAction) || ['holding','short','exited'].includes(semantics.investmentPosition)) {
            add('position_context', 'intent.semantics.investmentAction/investmentPosition', positionEvidence);
        }

        const object = intent.object || null;
        const objectValue = cleanValue(object?.text || object?.name || object?.label || semantics.investmentTarget || semantics.deliveryTarget || semantics.purchaseObject);
        if (objectValue) {
            if (event === 'investment' || semantics.investmentTarget) add('investment_target', 'intent.object/semantics.investmentTarget', objectValue);
            if (event === 'receive_item' || semantics.deliveryTarget) add('delivery_target', 'intent.object/semantics.deliveryTarget', objectValue);
            if (event === 'item_purchase' || semantics.purchaseObject) add('purchase_object', 'intent.object/semantics.purchaseObject', objectValue);
        }

        const spouse = (intent.participants || []).find((item) => item?.role === 'spouse' || item?.relationToQuerent === 'spouse');
        if (event === 'marital_relationship' || spouse) add('existing_marriage_context', spouse ? 'intent.participants.spouse' : 'intent.event', cleanValue(spouse?.text || 'spouse'));

        const counterpart = (intent.participants || []).find((item) => item?.role === 'romantic_counterpart' && item?.specificity === 'specific' && cleanValue(item?.text) && !isBareRelationPronoun(item.text));
        if (counterpart) add('specific_counterpart', 'intent.participants.romantic_counterpart', counterpart.text);

        return { providerId:'structured_intent', claims, ignored:[] };
    };

    const participantClaims = (question, intent) => {
        const claims = [];
        const ignored = [];
        const addSpecific = (value, evidence, confidence = 0.98) => {
            if (!value || isBareRelationPronoun(value)) {
                if (value) ignored.push({ providerId:'participant_resolver', slotId:'specific_counterpart', reason:'bare_pronoun_not_resolved', evidence:value });
                return;
            }
            pushIfKnown(claims, makeClaim({
                id:'specific_counterpart', value, evidence, providerId:'participant_resolver', sourceScope:'question', confidence,
                provenance:{ providerId:'participant_resolver', resolverVersion:'current', evidence }
            }));
        };

        if (participantResolver?.inspectRomanticParticipants && question) {
            const inspection = participantResolver.inspectRomanticParticipants(question);
            if (inspection?.specificity === 'specific' && inspection.counterpartSpan) addSpecific(inspection.counterpartSpan, inspection.counterpartSpan);
        }

        const spouse = (intent?.participants || []).find((item) => item?.role === 'spouse' || item?.relationToQuerent === 'spouse');
        if (spouse) {
            pushIfKnown(claims, makeClaim({
                id:'existing_marriage_context', value:cleanValue(spouse.text || 'spouse'), evidence:cleanValue(spouse.text || 'spouse'),
                providerId:'participant_resolver', sourceScope:'question', confidence:0.99,
                provenance:{ providerId:'participant_resolver', participantRole:spouse.role || 'spouse' }
            }));
        }
        return { providerId:'participant_resolver', claims, ignored };
    };

    const contextClaims = (routeId, contextSlots = []) => {
        const claims = [];
        const ignored = [];
        const allowed = new Set(ROUTE_REQUIREMENTS[routeId]?.contextRecoverable || []);
        for (const raw of contextSlots || []) {
            const id = typeof raw === 'string' ? raw : raw?.id;
            if (!id || !SLOT_SCHEMA[id]) {
                ignored.push({ providerId:'explicit_context', slotId:id || '', reason:'unknown_slot' });
                continue;
            }
            if (!allowed.has(id)) {
                ignored.push({ providerId:'explicit_context', slotId:id, reason:'context_not_recoverable_for_route' });
                continue;
            }
            const value = typeof raw === 'string' ? '' : cleanValue(raw.value || raw.text || '');
            pushIfKnown(claims, makeClaim({
                id, value, evidence:typeof raw === 'string' ? '' : raw.evidence,
                providerId:'explicit_context', sourceScope:'context', confidence:typeof raw === 'string' ? 0.95 : clamp01(raw.confidence, 0.95),
                provenance:{ providerId:'explicit_context', origin:typeof raw === 'string' ? 'slot_id' : (raw.provenance || raw.source || 'upstream_context') }
            }));
        }
        return { providerId:'explicit_context', claims, ignored };
    };

    const mlClaims = (predictions = [], minConfidence = 0.75) => {
        const claims = [];
        const ignored = [];
        for (const raw of predictions || []) {
            const id = raw?.id;
            if (!id || !SLOT_SCHEMA[id]) {
                ignored.push({ providerId:'ml_multi_label', slotId:id || '', reason:'unknown_slot' });
                continue;
            }
            const confidence = clamp01(raw.confidence, 0);
            if (confidence < minConfidence) {
                ignored.push({ providerId:'ml_multi_label', slotId:id, reason:'below_confidence_floor', confidence, minConfidence });
                continue;
            }
            pushIfKnown(claims, makeClaim({
                id, value:raw.value, evidence:raw.evidence || '', providerId:'ml_multi_label', sourceScope:'question', confidence,
                provenance:{ providerId:'ml_multi_label', modelId:raw.modelId || 'unbound', headId:raw.headId || id }
            }));
        }
        return { providerId:'ml_multi_label', claims, ignored };
    };

    const rankClaim = (claim) => (SOURCE_SCOPE_PRIORITY[claim.sourceScope] || 0) + (PROVIDER_PRIORITY[claim.providerId] || 0) + claim.confidence * 100;
    const distinctNonEmptyValues = (claims) => [...new Set(claims.map((claim) => cleanValue(claim.value)).filter(Boolean))];

    const mergeClaims = (claims) => {
        const groups = new Map();
        for (const claim of claims) {
            if (!groups.has(claim.id)) groups.set(claim.id, []);
            groups.get(claim.id).push(claim);
        }
        const resolvedSlots = [];
        const conflicts = [];
        const superseded = [];

        for (const [slotId, group] of groups.entries()) {
            const ordered = [...group].sort((a, b) => rankClaim(b) - rankClaim(a));
            const questionClaims = ordered.filter((claim) => claim.sourceScope === 'question');
            const contextOnly = ordered.filter((claim) => claim.sourceScope === 'context');
            const questionValues = distinctNonEmptyValues(questionClaims);
            const contextValues = distinctNonEmptyValues(contextOnly);

            if (questionValues.length > 1) {
                conflicts.push({ slotId, reason:'conflicting_question_values', claims:questionClaims });
                continue;
            }
            if (!questionClaims.length && contextValues.length > 1) {
                conflicts.push({ slotId, reason:'conflicting_context_values', claims:contextOnly });
                continue;
            }

            let winnerPool = questionClaims.length ? questionClaims : contextOnly;
            const preferredValue = distinctNonEmptyValues(winnerPool)[0] || '';
            if (preferredValue) {
                const matching = winnerPool.filter((claim) => !cleanValue(claim.value) || cleanValue(claim.value) === preferredValue);
                if (matching.length) winnerPool = matching;
            }
            const winner = [...winnerPool].sort((a, b) => rankClaim(b) - rankClaim(a))[0];
            if (!winner) continue;

            if (questionClaims.length && contextValues.some((value) => preferredValue && value !== preferredValue)) {
                superseded.push({ slotId, reason:'current_question_supersedes_context', winner, claims:contextOnly });
            }

            resolvedSlots.push({
                id:slotId,
                value:preferredValue || cleanValue(winner.value),
                evidence:winner.evidence,
                source:winner.sourceScope,
                sourceScope:winner.sourceScope,
                providerId:winner.providerId,
                confidence:winner.confidence,
                provenance:winner.provenance,
                supportingProviders:[...new Set(ordered.map((claim) => claim.providerId))]
            });
        }
        return { resolvedSlots, conflicts, superseded };
    };

    const resolveSemanticSlots = (input = {}) => {
        const routeId = String(input.routeId || '');
        const providerRuns = [];
        const ignoredClaims = [];
        const allClaims = [];
        const run = (result) => {
            providerRuns.push({ providerId:result.providerId, claimCount:result.claims.length, ignoredCount:result.ignored.length });
            allClaims.push(...result.claims);
            ignoredClaims.push(...result.ignored);
        };

        run(participantClaims(input.question || input.intent?.rawQuestion || '', input.intent));
        run(structuredIntentClaims(input.intent));
        run(contextClaims(routeId, input.contextSlots || []));
        run(mlClaims(input.mlPredictions || [], input.minMlConfidence == null ? 0.75 : input.minMlConfidence));

        const merged = mergeClaims(allClaims);
        const questionSlots = merged.resolvedSlots.filter((slot) => slot.sourceScope === 'question').map((slot) => ({ ...slot, source:'question' }));
        const contextSlots = merged.resolvedSlots.filter((slot) => slot.sourceScope === 'context').map((slot) => ({ ...slot, source:'context' }));
        return {
            version:VERSION,
            routeId,
            providerRuns,
            claims:allClaims,
            resolvedSlots:merged.resolvedSlots,
            questionSlots,
            contextSlots,
            conflicts:merged.conflicts,
            superseded:merged.superseded,
            ignoredClaims
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

    GuiJia.liuyaoSemanticSlotProvider = Object.freeze({
        version:VERSION,
        providerAudit:PROVIDER_AUDIT,
        providerPriority:PROVIDER_PRIORITY,
        structuredIntentClaims,
        participantClaims,
        contextClaims,
        mlClaims,
        mergeClaims,
        resolveSemanticSlots,
        evaluateWithProviders
    });
})(typeof window !== 'undefined' ? window : globalThis);
