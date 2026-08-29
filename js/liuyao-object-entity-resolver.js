(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const sufficiency = GuiJia.liuyaoSemanticSufficiency;
    const baseProvider = GuiJia.liuyaoSemanticSlotProvider;
    if (!sufficiency?.slotSchema || !baseProvider?.resolveSemanticSlots || !baseProvider?.mergeClaims) {
        throw new Error('semantic sufficiency and slot provider must be loaded before liuyao-object-entity-resolver.js');
    }

    const VERSION = '0.1';
    const SLOT_SCHEMA = sufficiency.slotSchema;
    const ROUTE_SLOT = Object.freeze({
        investment_profit:'investment_target',
        investment_suitability:'investment_target',
        investment_position_decision:'investment_target',
        investment_price_trend:'investment_target',
        receive_item:'delivery_target',
        item_purchase:'purchase_object'
    });

    // These are bounded grammatical / entity-type hints, not a route synonym dictionary.
    // The resolver only proves that an explicit referent exists; it does not decide the route.
    const QUESTION_ANCHOR = /(?:今天|明天|后天|本周|这周|下周|本月|下个月|今年|明年|现在|目前|后面|以后|之后|接下来|最终|最后|什么时候|何时|几时|多久|能不能|能否|会不会|是否|值不值得|适不适合|合不合适|要不要|该不该|有没有|还能|还会|怎么样|如何)/;
    const CLAUSE_SPLIT = /[，,。；;！？?]+/;
    const FILLER_PREFIX = /^(?:请问|我想问(?:一下)?|我想知道|想问(?:一下)?|帮我看看|麻烦看看|看看)/;
    const TEMPORAL_PREFIX = /^(?:今天|明天|后天|本周|这周|下周|本月|下个月|今年|明年|现在|目前|后面|以后|之后|接下来|最终|最后)/;
    const ASPECT_PREFIX = /^(?:了|过|着|一下|一笔|一份|一件|一台|一部|一本|一只|一个|一套|一辆|一张|一款|一支|一枚|一块|一箱|一包|一双)/;
    const BARE_REFERENCE = /^(?:我|你|他|她|它|我们|你们|他们|她们|对方|这个|那个|这些|那些|这|那|东西|物品|商品|事情|这件事|那件事|后面|以后|之后|接下来|现在|目前|今天|明天|今年|下周|本周|什么时候|何时)$/;
    const INVESTMENT_ENTITY_HINT = /(?:股票|个股|基金|ETF|etf|期货|外汇|债券|可转债|指数|大盘|净值|股价|持仓|仓位|标的|股份|比特币|加密货币|数字货币|黄金|白银|原油|期权|合约)/;
    const TICKER_OR_CODE = /^(?:[A-Z]{1,6}|\d{6}(?:\.[A-Z]{2})?)$/;

    const ACTIONS = Object.freeze([
        { family:'investment_action', re:/(?:买入|持有|持仓|建仓|介入|布局|投资|投进|投了|投入)/g },
        { family:'purchase_action', re:/(?:购买|购入|入手|预订|下单(?:买)?|新买|刚买|买了|买)/g }
    ]);

    const clean = (value) => String(value || '').trim();
    const stripPunctuation = (value) => clean(value).replace(/^[\s，,。；;！？?、:：]+|[\s，,。；;！？?、:：]+$/g, '');
    const normalizeComparable = (value) => stripPunctuation(value)
        .replace(/^(?:这|那)(?:一)?(?:个|只|台|部|本|件|套|笔|份|辆|张|款|支|枚|块|箱|包|双|家)?/, '')
        .replace(/^(?:我的|我这|我那)/, '')
        .replace(/\s+/g, '')
        .toLowerCase();

    const cutAtQuestionAnchor = (value) => {
        const text = clean(value);
        const match = text.match(QUESTION_ANCHOR);
        return match ? text.slice(0, match.index) : text;
    };

    const normalizeCandidate = (raw) => {
        let text = stripPunctuation(raw);
        text = text.replace(FILLER_PREFIX, '');
        text = text.replace(/^我(?:自己)?(?:上周|前几天|昨天|最近|刚刚|刚|已经)?/, '');
        text = text.replace(ASPECT_PREFIX, '');
        text = stripPunctuation(text);

        if (text.includes('的')) {
            const tail = stripPunctuation(text.slice(text.lastIndexOf('的') + 1));
            if (tail && tail.length <= 24) text = tail;
        }

        text = text.replace(ASPECT_PREFIX, '');
        text = text.replace(TEMPORAL_PREFIX, '');
        text = stripPunctuation(text);
        if (!text || BARE_REFERENCE.test(text)) return '';
        if (/^(?:能不能|能否|会不会|是否|值不值得|适不适合|合不合适|要不要|该不该)/.test(text)) return '';
        if (text.length > 32) return '';
        return text;
    };

    const candidateKey = (candidate) => normalizeComparable(candidate.text);
    const addCandidate = (list, raw, strategy, confidence, extras = {}) => {
        const text = normalizeCandidate(raw);
        if (!text) return;
        const key = normalizeComparable(text);
        if (!key || key.length < 1) return;
        list.push({
            text,
            strategy,
            confidence:Math.max(0, Math.min(1, Number(confidence) || 0.8)),
            evidence:extras.evidence || stripPunctuation(raw),
            roleHint:extras.roleHint || 'generic_referent',
            clauseIndex:extras.clauseIndex ?? null
        });
    };

    const dedupeCandidates = (candidates) => {
        const ordered = [...candidates].sort((a, b) => b.confidence - a.confidence || b.text.length - a.text.length);
        const kept = [];
        for (const candidate of ordered) {
            const key = candidateKey(candidate);
            const duplicate = kept.find((item) => {
                const other = candidateKey(item);
                return key === other || (key.length >= 2 && other.length >= 2 && (key.includes(other) || other.includes(key)));
            });
            if (!duplicate) kept.push(candidate);
        }
        return kept;
    };

    const extractActionObjects = (clause, clauseIndex, candidates) => {
        for (const action of ACTIONS) {
            action.re.lastIndex = 0;
            let match;
            while ((match = action.re.exec(clause))) {
                let rest = clause.slice(match.index + match[0].length);
                rest = rest.replace(ASPECT_PREFIX, '');
                rest = cutAtQuestionAnchor(rest);
                rest = rest.split(/(?:和|与|以及|还是|或)/, 1)[0];
                addCandidate(candidates, rest, 'action_object', action.family === 'investment_action' ? 0.97 : 0.94, {
                    evidence:match[0] + rest,
                    roleHint:action.family,
                    clauseIndex
                });
            }
        }
    };

    const extractSubjectPrefix = (clause, clauseIndex, candidates) => {
        const match = clause.match(QUESTION_ANCHOR);
        if (!match || match.index <= 0) return;
        let prefix = clause.slice(0, match.index);
        prefix = prefix.replace(FILLER_PREFIX, '');
        prefix = prefix.replace(/^(?:我想|想|我准备|我打算)/, '');
        if (!prefix || TEMPORAL_PREFIX.test(prefix)) return;

        const parts = prefix.split(/(?:和|与|以及|还是|或)/).map(stripPunctuation).filter(Boolean);
        for (const part of parts) {
            addCandidate(candidates, part, 'subject_prefix', 0.9, { evidence:part, roleHint:'subject_referent', clauseIndex });
        }
    };

    const extractDeicticPhrases = (clause, clauseIndex, candidates) => {
        const re = /(?:这|那)(?:一)?(?:个|只|台|部|本|件|套|笔|份|辆|张|款|支|枚|块|箱|包|双|家)?[\p{Script=Han}A-Za-z0-9·._+-]{1,18}/gu;
        let match;
        while ((match = re.exec(clause))) {
            let phrase = cutAtQuestionAnchor(match[0]);
            phrase = phrase.split(/(?:和|与|以及|还是|或)/, 1)[0];
            addCandidate(candidates, phrase, 'deictic_phrase', 0.96, { evidence:phrase, roleHint:'explicit_np', clauseIndex });
        }
    };

    const extractReferentCandidates = (question) => {
        const text = clean(question);
        if (!text) return [];
        const candidates = [];
        const clauses = text.split(CLAUSE_SPLIT).map(stripPunctuation).filter(Boolean);
        clauses.forEach((clause, index) => {
            extractActionObjects(clause, index, candidates);
            extractSubjectPrefix(clause, index, candidates);
            extractDeicticPhrases(clause, index, candidates);
        });
        return dedupeCandidates(candidates);
    };

    const qualifiesForInvestmentTarget = (candidate) => {
        if (!candidate) return false;
        if (candidate.roleHint === 'investment_action') return true;
        const normalized = normalizeComparable(candidate.text).toUpperCase();
        if (INVESTMENT_ENTITY_HINT.test(candidate.text)) return true;
        if (TICKER_OR_CODE.test(normalized)) return true;
        return false;
    };

    const bindCandidatesToSlot = (routeId, candidates) => {
        const slotId = ROUTE_SLOT[routeId] || '';
        if (!slotId) return { slotId:'', accepted:[], rejected:[] };
        const accepted = [];
        const rejected = [];
        for (const candidate of candidates || []) {
            if (slotId === 'investment_target' && !qualifiesForInvestmentTarget(candidate)) {
                rejected.push({ ...candidate, reason:'investment_type_not_confirmed' });
                continue;
            }
            accepted.push(candidate);
        }
        return { slotId, accepted, rejected };
    };

    const makeClaim = (slotId, candidate) => ({
        id:slotId,
        value:candidate.text,
        evidence:candidate.evidence || candidate.text,
        providerId:'object_or_entity_resolver',
        sourceScope:'question',
        source:'question',
        confidence:candidate.confidence,
        provenance:{
            providerId:'object_or_entity_resolver',
            resolverVersion:VERSION,
            strategy:candidate.strategy,
            roleHint:candidate.roleHint,
            clauseIndex:candidate.clauseIndex
        }
    });

    const objectEntityClaims = (input = {}, baseResolution = null) => {
        const routeId = String(input.routeId || '');
        const slotId = ROUTE_SLOT[routeId] || '';
        const claims = [];
        const ignored = [];
        if (!slotId || !SLOT_SCHEMA[slotId]) return { providerId:'object_or_entity_resolver', claims, ignored, candidates:[] };

        const existingStructured = baseResolution?.resolvedSlots?.find((slot) => slot.id === slotId && slot.sourceScope === 'question' && slot.providerId === 'structured_intent');
        if (existingStructured) {
            ignored.push({ providerId:'object_or_entity_resolver', slotId, reason:'structured_object_already_available', evidence:existingStructured.value || existingStructured.evidence || '' });
            return { providerId:'object_or_entity_resolver', claims, ignored, candidates:[] };
        }

        const candidates = extractReferentCandidates(input.question || input.intent?.rawQuestion || '');
        const binding = bindCandidatesToSlot(routeId, candidates);
        for (const candidate of binding.accepted) claims.push(makeClaim(binding.slotId, candidate));
        for (const candidate of binding.rejected) ignored.push({
            providerId:'object_or_entity_resolver', slotId:binding.slotId, reason:candidate.reason, evidence:candidate.evidence || candidate.text, candidate:candidate.text
        });
        if (!claims.length && !candidates.length) ignored.push({ providerId:'object_or_entity_resolver', slotId, reason:'no_explicit_referent' });
        return { providerId:'object_or_entity_resolver', claims, ignored, candidates };
    };

    const baseResolveSemanticSlots = baseProvider.resolveSemanticSlots.bind(baseProvider);
    const mergeClaims = baseProvider.mergeClaims.bind(baseProvider);

    const resolveSemanticSlots = (input = {}) => {
        const base = baseResolveSemanticSlots(input);
        const objectRun = objectEntityClaims(input, base);
        const allClaims = [...base.claims, ...objectRun.claims];
        const merged = mergeClaims(allClaims);
        const questionSlots = merged.resolvedSlots.filter((slot) => slot.sourceScope === 'question').map((slot) => ({ ...slot, source:'question' }));
        const contextSlots = merged.resolvedSlots.filter((slot) => slot.sourceScope === 'context').map((slot) => ({ ...slot, source:'context' }));
        return {
            ...base,
            providerRuns:[...base.providerRuns, { providerId:'object_or_entity_resolver', claimCount:objectRun.claims.length, ignoredCount:objectRun.ignored.length }],
            claims:allClaims,
            resolvedSlots:merged.resolvedSlots,
            questionSlots,
            contextSlots,
            conflicts:merged.conflicts,
            superseded:merged.superseded,
            ignoredClaims:[...base.ignoredClaims, ...objectRun.ignored],
            objectCandidates:objectRun.candidates
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
        investment_target:{ ...baseProvider.providerAudit.investment_target, current:'implemented_high_precision', note:'Object/Entity Resolver 可从明确投资实体词、ticker/code 或投资动作所支配的对象中提供；无类型证据的专名仍保守留给未来 ML/entity typing。' },
        delivery_target:{ ...baseProvider.providerAudit.delivery_target, current:'implemented_high_precision', note:'Object/Entity Resolver 从当前问题中的显式名词短语/动作宾语提供；裸“什么时候能收到”不会制造对象。' },
        purchase_object:{ ...baseProvider.providerAudit.purchase_object, current:'implemented_high_precision', note:'Object/Entity Resolver 从当前问题中的显式名词短语/购买动作宾语提供；裸“这个”不会视为具体对象。' }
    });

    GuiJia.liuyaoObjectEntityResolver = Object.freeze({
        version:VERSION,
        routeSlotMap:ROUTE_SLOT,
        extractReferentCandidates,
        bindCandidatesToSlot,
        qualifiesForInvestmentTarget,
        objectEntityClaims
    });

    GuiJia.liuyaoSemanticSlotProvider = Object.freeze({
        ...baseProvider,
        providerAudit:updatedAudit,
        objectEntityClaims,
        resolveSemanticSlots,
        evaluateWithProviders
    });
})(typeof window !== 'undefined' ? window : globalThis);
