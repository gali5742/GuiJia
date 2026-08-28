(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const baseApi = GuiJia.liuyaoIntent;
    if (!baseApi?.parseDivinationIntent) throw new Error('liuyao-intent.js must be loaded before liuyao-participant-resolver.js');

    const normalize = baseApi.normalizeQuestionText || ((value) => String(value || '').trim().replace(/\s+/g, ''));
    const CLAUSE_SPLIT = /[，,。；;！？?]+/;
    const FEMALE_TERMS = /(?:女生|女性|女人|女孩|女的|女方)/;
    const MALE_TERMS = /(?:男生|男性|男人|男孩|男的|男方)/;
    const PERSON_RELATION_TERMS = /(?:朋友|同事|同学|网友|对象|女朋友|男朋友)/;

    const extractSexFromSpan = (span) => {
        const text = String(span || '');
        const female = FEMALE_TERMS.test(text);
        const male = MALE_TERMS.test(text);
        if (female && !male) return 'female';
        if (male && !female) return 'male';
        return 'unknown';
    };

    const trimCounterpartTail = (value) => {
        const text = String(value || '');
        const boundary = text.search(/(?:能不能|能否|会不会|可不可以|有没有|是否|发展(?:为|成)?|成为|谈恋爱|恋爱关系|结婚|表白|怎么样|如何|合不合适|有可能|有机会)/);
        return boundary > 0 ? text.slice(0, boundary) : text;
    };

    const extractSelfSpan = (text) => {
        const clauses = String(text || '').split(CLAUSE_SPLIT).filter(Boolean);
        for (const clause of clauses) {
            if (!/(?:^|作为)(?:我|本人)?|^(?:我|本人)/.test(clause)) continue;
            if (!FEMALE_TERMS.test(clause) && !MALE_TERMS.test(clause)) continue;
            const connector = clause.search(/(?:和|与|跟)/);
            return connector > 0 ? clause.slice(0, connector) : clause;
        }
        if (/(?:男占|男问)/.test(text)) return '男占';
        if (/(?:女占|女问)/.test(text)) return '女占';
        return '';
    };

    const extractCounterpartSpan = (text, selfSpan) => {
        const clauses = String(text || '').split(CLAUSE_SPLIT).filter(Boolean);
        for (const clause of clauses) {
            const connector = clause.match(/(?:和|与|跟)(.+)$/);
            if (connector?.[1]) {
                const span = trimCounterpartTail(connector[1]);
                if (span && (PERSON_RELATION_TERMS.test(span) || FEMALE_TERMS.test(span) || MALE_TERMS.test(span))) return span;
            }
        }

        const remainder = selfSpan ? String(text || '').replace(selfSpan, '') : String(text || '');
        const explicit = remainder.match(/(?:我)?(?:喜欢的|追求的|喜欢|追)?(?:这个|那个)?[^，,。；;！？?]{0,16}(?:女生|女性|女孩|男生|男性|男孩)(?:朋友|同事|同学|网友|对象)?/);
        if (explicit?.[0]) return trimCounterpartTail(explicit[0]);
        if (/(?:^|[，,。；;！？?])她(?:是|会|能|愿|想|喜|对|有|要|可|怎|$)/.test(remainder) || /(?:和|与|跟|喜欢|追)她/.test(remainder)) return '她';
        if (/(?:^|[，,。；;！？?])他(?:是|会|能|愿|想|喜|对|有|要|可|怎|$)/.test(remainder) || /(?:和|与|跟|喜欢|追)他/.test(remainder)) return '他';
        if (/(?:我的|我)(?:女朋友)/.test(remainder)) return '女朋友';
        if (/(?:我的|我)(?:男朋友)/.test(remainder)) return '男朋友';
        return '';
    };

    const detectSpecificity = (span, text) => {
        if (span) return 'specific';
        if (/(?:这个|那个)(?:人|朋友|同事|同学|网友)/.test(text)) return 'specific';
        return 'generic';
    };

    const detectRelation = (span, specificity) => {
        const text = String(span || '');
        if (/(?:女朋友|男朋友|对象)/.test(text)) return 'partner';
        if (specificity === 'specific' && /朋友/.test(text)) return 'friend';
        return 'other';
    };

    const inspectRomanticParticipants = (question) => {
        const text = normalize(question);
        const selfSpan = extractSelfSpan(text);
        const counterpartSpan = extractCounterpartSpan(text, selfSpan);
        const querentSex = /男占|男问/.test(selfSpan) ? 'male' : /女占|女问/.test(selfSpan) ? 'female' : extractSexFromSpan(selfSpan);
        let counterpartSex = extractSexFromSpan(counterpartSpan);
        if (counterpartSpan === '她' || counterpartSpan === '女朋友') counterpartSex = 'female';
        if (counterpartSpan === '他' || counterpartSpan === '男朋友') counterpartSex = 'male';
        const specificity = detectSpecificity(counterpartSpan, text);
        const relationToQuerent = detectRelation(counterpartSpan, specificity);
        return {
            text,
            selfSpan,
            counterpartSpan,
            querentSex,
            counterpartSex,
            specificity,
            relationToQuerent,
            explicitSelfSex:Boolean(selfSpan && (FEMALE_TERMS.test(selfSpan) || MALE_TERMS.test(selfSpan) || /(?:男占|男问|女占|女问)/.test(selfSpan))),
            explicitCounterpartSex:Boolean(counterpartSpan && (FEMALE_TERMS.test(counterpartSpan) || MALE_TERMS.test(counterpartSpan) || /^(?:她|他|女朋友|男朋友)$/.test(counterpartSpan)))
        };
    };

    const refineDivinationIntent = (intent) => {
        if (!intent || intent.status !== 'resolved' || intent.event?.type !== 'relationship_development') return intent;

        const inspection = inspectRomanticParticipants(intent.rawQuestion);
        const { querentSex, counterpartSex, specificity, relationToQuerent } = inspection;
        const participants = (intent.participants || []).filter((item) => item.role !== 'romantic_counterpart');
        participants.push({
            role:'romantic_counterpart',
            relationToQuerent,
            specificity,
            sex:counterpartSex
        });

        const ambiguityCodes = new Set(['romantic_sex_role_unknown','romantic_querent_sex_unknown','romantic_counterpart_sex_unknown']);
        const ambiguities = (intent.ambiguities || []).filter((item) => !ambiguityCodes.has(item.code));
        if (specificity === 'specific') {
            if (querentSex === 'unknown' && counterpartSex === 'unknown') {
                ambiguities.push({ code:'romantic_sex_role_unknown', message:'特定恋爱对象已识别，但双方男女角色仍不完整。' });
            } else if (querentSex === 'unknown') {
                ambiguities.push({ code:'romantic_querent_sex_unknown', message:'特定恋爱对象已识别，但未明确占问者的男女角色。' });
            } else if (counterpartSex === 'unknown') {
                ambiguities.push({ code:'romantic_counterpart_sex_unknown', message:'特定恋爱对象已识别，但未明确对象的男女角色。' });
            }
        }

        const semantics = {
            ...(intent.semantics || {}),
            querentSex,
            counterpartSex
        };
        if (semantics.romanticStage === 'unknown' && /发展(?:为|成).*恋爱关系/.test(inspection.text)) {
            semantics.romanticStage = 'unestablished_interest';
        }

        return {
            ...intent,
            participants,
            ambiguities,
            semantics
        };
    };

    GuiJia.liuyaoParticipantResolver = Object.freeze({
        inspectRomanticParticipants,
        refineDivinationIntent
    });

    GuiJia.liuyaoIntent = Object.freeze({
        ...baseApi,
        parseDivinationIntent(question) {
            return refineDivinationIntent(baseApi.parseDivinationIntent(question));
        },
        refineDivinationIntent
    });
})(typeof window !== 'undefined' ? window : globalThis);
