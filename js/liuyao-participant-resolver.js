(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const baseApi = GuiJia.liuyaoIntent;
    if (!baseApi?.parseDivinationIntent) throw new Error('liuyao-intent.js must be loaded before liuyao-participant-resolver.js');

    const normalize = baseApi.normalizeQuestionText || ((value) => String(value || '').trim().replace(/\s+/g, ''));

    const detectQuerentSexLocal = (text) => {
        if (/(?:我|本人)(?:是|为)?(?:一个|一名|个)?(?:男生|男性|男人|男的|男方)|作为(?:一个|一名)?(?:男生|男性|男人)|男占|男问/.test(text)) return 'male';
        if (/(?:我|本人)(?:是|为)?(?:一个|一名|个)?(?:女生|女性|女人|女的|女方)|作为(?:一个|一名)?(?:女生|女性|女人)|女占|女问/.test(text)) return 'female';
        return 'unknown';
    };

    const FEMALE_COUNTERPART_PATTERNS = Object.freeze([
        /(?:和|与|跟)(?:一个|一位|我的|我认识的|认识多年的)?(?:女性|女生|女孩|女)(?:朋友|同事|同学|网友|对象)/,
        /(?:喜欢的|追求的)?(?:这个|那个)(?:女生|女孩|女性)/,
        /(?:和|与|跟|喜欢|追)(?:她)/,
        /(?:^|[，,。；;！？?])她(?:是|会|能|愿|想|喜|对|有|要|可|怎|$)/,
        /(?:我的|我)(?:女朋友)/
    ]);

    const MALE_COUNTERPART_PATTERNS = Object.freeze([
        /(?:和|与|跟)(?:一个|一位|我的|我认识的|认识多年的)?(?:男性|男生|男孩|男)(?:朋友|同事|同学|网友|对象)/,
        /(?:喜欢的|追求的)?(?:这个|那个)(?:男生|男孩|男性)/,
        /(?:和|与|跟|喜欢|追)(?:他)/,
        /(?:^|[，,。；;！？?])他(?:是|会|能|愿|想|喜|对|有|要|可|怎|$)/,
        /(?:我的|我)(?:男朋友)/
    ]);

    const matchesAny = (text, patterns) => patterns.some((pattern) => pattern.test(text));

    const detectCounterpartSexLocal = (text) => {
        const female = matchesAny(text, FEMALE_COUNTERPART_PATTERNS);
        const male = matchesAny(text, MALE_COUNTERPART_PATTERNS);
        if (female && !male) return 'female';
        if (male && !female) return 'male';
        return 'unknown';
    };

    const detectCounterpartSpecificity = (text) => {
        if (matchesAny(text, FEMALE_COUNTERPART_PATTERNS) || matchesAny(text, MALE_COUNTERPART_PATTERNS)) return 'specific';
        if (/(?:和|与|跟)(?:一个|一位|我的|我认识的|认识多年的)?(?:朋友|同事|同学|网友)(?:能|会|可|有|发|走|谈|变|成|$)/.test(text)) return 'specific';
        if (/(?:这个|那个)(?:人|朋友|同事|同学|网友)/.test(text)) return 'specific';
        return 'generic';
    };

    const detectCounterpartRelation = (text, specificity) => {
        if (/(?:我的|我)(?:女朋友|男朋友)/.test(text)) return 'partner';
        if (specificity === 'specific' && /朋友/.test(text)) return 'friend';
        return 'other';
    };

    const refineDivinationIntent = (intent) => {
        if (!intent || intent.status !== 'resolved' || intent.event?.type !== 'relationship_development') return intent;

        const text = normalize(intent.rawQuestion);
        const querentSex = detectQuerentSexLocal(text);
        const counterpartSex = detectCounterpartSexLocal(text);
        const specificity = detectCounterpartSpecificity(text);
        const relationToQuerent = detectCounterpartRelation(text, specificity);

        const participants = (intent.participants || []).filter((item) => item.role !== 'romantic_counterpart');
        participants.push({
            role:'romantic_counterpart',
            relationToQuerent,
            specificity,
            sex:counterpartSex
        });

        const ambiguities = (intent.ambiguities || []).filter((item) => item.code !== 'romantic_sex_role_unknown');
        if (specificity === 'specific' && (querentSex === 'unknown' || counterpartSex === 'unknown')) {
            ambiguities.push({
                code:'romantic_sex_role_unknown',
                message:'特定恋爱对象已识别，但当前规则需要明确占问者与对象的男女角色。'
            });
        }

        const semantics = {
            ...(intent.semantics || {}),
            querentSex,
            counterpartSex
        };
        if (semantics.romanticStage === 'unknown' && /发展(?:为|成).*恋爱关系/.test(text)) {
            semantics.romanticStage = 'unestablished_interest';
        }

        return {
            ...intent,
            participants,
            ambiguities,
            semantics
        };
    };

    GuiJia.liuyaoIntent = Object.freeze({
        ...baseApi,
        parseDivinationIntent(question) {
            return refineDivinationIntent(baseApi.parseDivinationIntent(question));
        },
        refineDivinationIntent
    });
})(typeof window !== 'undefined' ? window : globalThis);
