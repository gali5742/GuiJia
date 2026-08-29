(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const baseApi = GuiJia.liuyaoIntent;
    if (!baseApi?.parseDivinationIntent) throw new Error('liuyao-intent.js must be loaded before liuyao-commercial-event-resolver.js');

    const VERSION = '0.1';
    const normalize = baseApi.normalizeQuestionText || ((value) => String(value || '').trim().replace(/\s+/g, ''));
    const INDEPENDENT_GOAL_CONNECTOR = /(?:而且|并且|同时|另外|还有)/;

    const DETECTORS = Object.freeze([
        {
            event:'debt_collection',
            test:(text) => /(?:欠我|欠我的|欠本人)[^，。？！?]{0,18}(?:要回|收回|讨回|追回|拿回)|(?:我|本人)[^，。？！?]{0,12}(?:讨债|催债|追债)|(?:要回|收回|讨回|追回)[^，。？！?]{0,10}(?:欠款|欠我的钱|借款)/.test(text)
        },
        {
            event:'lend_money',
            test:(text) => /(?:我|本人)(?:准备|打算|想|要|可以|能不能)?(?:把|将)?[^，。？！?]{0,10}(?:借给|贷给)|(?:我|本人)(?:准备|打算|想|要|可以|能不能)?(?:借钱|借款)给/.test(text)
        },
        {
            event:'inventory_purchase',
            test:(text) => /(?:进货|补货|采购库存|采购这批货|采购一批货|给店里采购|为店里采购|给门店采购|为门店采购)/.test(text)
        },
        {
            event:'transaction',
            test:(text) => /(?:商业交易|商业买卖|批发交易|这笔买卖|这单生意)[^，。？！?]{0,16}(?:成交|做成|能不能成|能否成)|(?:和|跟|与)(?:客户|买家|卖家|供应商)[^，。？！?]{0,18}(?:成交|做成|交易)/.test(text)
        },
        {
            event:'inventory_sale',
            test:(text) => /(?:库存|存货|这批货|一批货|货物)[^，。？！?]{0,14}(?:卖掉|卖完|卖出|出掉|清掉|出货)|(?:卖掉|卖完|卖出|出掉|清掉)[^，。？！?]{0,10}(?:库存|存货|这批货|一批货|货物)/.test(text)
        }
    ]);

    const detectCommercialEvent = (question) => {
        const text = normalize(question);
        const hit = DETECTORS.find((item) => item.test(text));
        return hit?.event || '';
    };

    const inferGoal = (text, existingGoals) => {
        if (Array.isArray(existingGoals) && existingGoals.length) return existingGoals;
        if (/(什么时候|何时|几时|哪天|多久)/.test(text)) return [{ type:'timing' }];
        if (/(合不合适|适不适合|要不要|该不该)/.test(text)) return [{ type:'choice' }];
        if (/(能不能|能否|会不会|有没有|可不可以|能成吗|成交吗)/.test(text)) return [{ type:'outcome' }];
        return [{ type:'unknown' }];
    };

    const expectedStateFor = (event, text, current) => {
        if (current) return current;
        if (event === 'transaction' && /(?:成交|做成|交易成功)/.test(text)) return 'transaction_completed';
        if (event === 'inventory_sale' && /(?:卖掉|卖完|卖出|出掉|清掉|出货)/.test(text)) return 'inventory_sold';
        if (event === 'debt_collection' && /(?:要回|收回|讨回|追回|拿回)/.test(text)) return 'debt_recovered';
        return '';
    };

    const addParticipantOnce = (participants, participant) => {
        if (!participant) return participants;
        if (participants.some((item) => item.role === participant.role)) return participants;
        return [...participants, participant];
    };

    const participantsFor = (event, text, existing = []) => {
        let participants = Array.isArray(existing) ? [...existing] : [];
        if (event === 'transaction' && /(?:客户|买家|卖家|供应商)/.test(text)) {
            participants = addParticipantOnce(participants, { role:'counterparty', relationToQuerent:'other', specificity:'specific' });
        }
        if (event === 'lend_money') {
            participants = addParticipantOnce(participants, {
                role:'borrower',
                relationToQuerent:/朋友/.test(text) ? 'friend' : 'other',
                specificity:/(?:朋友|同事|亲戚|他|她|对方)/.test(text) ? 'specific' : 'unknown'
            });
        }
        if (event === 'debt_collection') {
            participants = addParticipantOnce(participants, {
                role:'debtor',
                relationToQuerent:/朋友/.test(text) ? 'friend' : 'other',
                specificity:/(?:朋友|同事|亲戚|他|她|对方)/.test(text) ? 'specific' : 'unknown'
            });
        }
        return participants;
    };

    const refineDivinationIntent = (intent, question) => {
        const rawQuestion = String(question || intent?.rawQuestion || '').trim();
        if (!rawQuestion) return intent;
        const text = normalize(rawQuestion);
        const event = detectCommercialEvent(text);
        if (!event) return intent;

        if (intent?.status === 'blocked' && ['unsupported_domain','multiple_goals'].includes(intent.blockReason)) return intent;

        const previousEvent = intent?.event?.type || 'unknown';
        const compatibleAlias = event === 'lend_money' && previousEvent === 'borrow_money';
        if (intent?.status === 'resolved' && previousEvent !== 'unknown' && previousEvent !== event && !compatibleAlias && INDEPENDENT_GOAL_CONNECTOR.test(text)) {
            return {
                version:'0.1',
                rawQuestion,
                status:'blocked',
                blockReason:'multiple_goals',
                goals:[{ type:'unknown', event:previousEvent }, { type:'unknown', event }],
                participants:[],
                confidence:0.98,
                ambiguities:[]
            };
        }

        const semantics = { ...(intent?.semantics || {}) };
        if (event === 'transaction') semantics.transactionPurpose = 'commercial_trade';
        const ambiguities = (intent?.ambiguities || []).filter((item) => !['missing_event','unknown_event'].includes(item.code));

        return {
            ...(intent || {}),
            version:'0.1',
            rawQuestion,
            status:'resolved',
            blockReason:undefined,
            goals:inferGoal(text, intent?.goals),
            event:{ type:event },
            participants:participantsFor(event, text, intent?.participants),
            expectedState:expectedStateFor(event, text, intent?.expectedState || ''),
            confidence:Math.max(Number(intent?.confidence) || 0, 0.96),
            ambiguities,
            semantics
        };
    };

    GuiJia.liuyaoCommercialEventResolver = Object.freeze({
        version:VERSION,
        detectCommercialEvent,
        refineDivinationIntent
    });

    GuiJia.liuyaoIntent = Object.freeze({
        ...baseApi,
        parseDivinationIntent(question) {
            return refineDivinationIntent(baseApi.parseDivinationIntent(question), question);
        },
        refineCommercialDivinationIntent:intent => refineDivinationIntent(intent, intent?.rawQuestion || '')
    });
})(typeof window !== 'undefined' ? window : globalThis);
