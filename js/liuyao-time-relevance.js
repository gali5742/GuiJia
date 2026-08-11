(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const assessmentApi = GuiJia.liuyaoTimeAssessment;
    if (!assessmentApi?.validateNodeAssessment) throw new Error('liuyao-time-assessment.js must be loaded before liuyao-time-relevance.js');

    const SCHEMA_VERSION = 1;
    const DIMENSIONS = Object.freeze([...assessmentApi.DIMENSIONS]);
    const LEVELS = Object.freeze(['none','context','formation','key-line','axis','observer-change','observer-direct']);
    const LEVEL_RANK = Object.freeze(Object.fromEntries(LEVELS.map((level, index) => [level, index])));
    const LEVEL_LABELS = Object.freeze({
        none:'无直接结构关联',
        context:'背景结构',
        formation:'结构组合',
        'key-line':'关键关系爻',
        axis:'世应轴',
        'observer-change':'观察爻之变',
        'observer-direct':'直接作用于观察爻'
    });

    const SUBJECT_LEVEL = Object.freeze({
        'main-observer':'observer-direct',
        'main-observer-change':'observer-change',
        opposite:'axis',
        'moving-line':'key-line',
        'static-key-line':'key-line',
        'sanhe-member':'formation',
        sanhe:'formation',
        'changed-line':'context',
        context:'context'
    });

    const levelForReason = (reason) => SUBJECT_LEVEL[String(reason?.subject || '')] || 'context';
    const rankForLevel = (level) => Number(LEVEL_RANK[String(level || 'none')] || 0);

    const highestReasonForDimension = (assessment, kind) => {
        const reasons = assessment?.dimensions?.[kind]?.reasons || [];
        if (!reasons.length) return null;
        return [...reasons].sort((a, b) => {
            const diff = rankForLevel(levelForReason(b)) - rankForLevel(levelForReason(a));
            if (diff) return diff;
            const tierRank = { context:1, secondary:2, primary:3 };
            const tierDiff = (tierRank[b?.tier] || 0) - (tierRank[a?.tier] || 0);
            if (tierDiff) return tierDiff;
            return Number(b?.score || 0) - Number(a?.score || 0);
        })[0];
    };

    const buildStructuralRelevanceProfile = (assessment) => {
        const errors = assessmentApi.validateNodeAssessment(assessment);
        if (errors.length) throw new Error(`invalid Node Assessment in relevance layer: ${errors.join(',')}`);
        const dimensions = {};
        DIMENSIONS.forEach((kind) => {
            const reasons = assessment?.dimensions?.[kind]?.reasons || [];
            const topReason = highestReasonForDimension(assessment, kind);
            const level = topReason ? levelForReason(topReason) : 'none';
            dimensions[kind] = {
                active:reasons.length > 0,
                level,
                rank:rankForLevel(level),
                label:LEVEL_LABELS[level] || level,
                sourceCount:reasons.length,
                subjects:[...new Set(reasons.map((item) => String(item?.subject || 'context')))],
                topSource:topReason ? {
                    eventCode:String(topReason.eventCode || ''),
                    subject:String(topReason.subject || ''),
                    tier:String(topReason.tier || ''),
                    sourceFactCode:String(topReason.sourceFactCode || '')
                } : null
            };
        });
        const materialKinds = ['support','peer','constraint','outflow','exertion'];
        return {
            schemaVersion:SCHEMA_VERSION,
            dimensions,
            triggerLevel:dimensions.trigger.level,
            triggerRank:dimensions.trigger.rank,
            materialSignature:materialKinds.map((kind) => `${kind}:${dimensions[kind].level}`).join('|')
        };
    };

    const relevanceRankForKind = (profile, kind) => Number(profile?.dimensions?.[kind]?.rank || 0);
    const relevanceLevelForKind = (profile, kind) => String(profile?.dimensions?.[kind]?.level || 'none');

    const validateStructuralRelevanceProfile = (profile, assessment) => {
        const errors = [];
        if (!profile || typeof profile !== 'object') return ['profile-not-object'];
        if (profile.schemaVersion !== SCHEMA_VERSION) errors.push('schema-version');
        if (!profile.dimensions || typeof profile.dimensions !== 'object') errors.push('dimensions');
        DIMENSIONS.forEach((kind) => {
            const item = profile?.dimensions?.[kind];
            if (!item || typeof item !== 'object') { errors.push(`dimension:${kind}`); return; }
            if (!LEVELS.includes(item.level)) errors.push(`level:${kind}`);
            if (Number(item.rank) !== rankForLevel(item.level)) errors.push(`rank:${kind}`);
            if (assessment && Boolean(item.active) !== Boolean(assessment?.dimensions?.[kind]?.active)) errors.push(`active:${kind}`);
            if (!Array.isArray(item.subjects)) errors.push(`subjects:${kind}`);
        });
        if (!LEVELS.includes(profile.triggerLevel)) errors.push('trigger-level');
        if (Number(profile.triggerRank) !== rankForLevel(profile.triggerLevel)) errors.push('trigger-rank');
        return [...new Set(errors)];
    };

    GuiJia.liuyaoTimeRelevance = {
        SCHEMA_VERSION,
        DIMENSIONS,
        LEVELS,
        LEVEL_RANK,
        LEVEL_LABELS,
        SUBJECT_LEVEL,
        levelForReason,
        rankForLevel,
        highestReasonForDimension,
        buildStructuralRelevanceProfile,
        relevanceRankForKind,
        relevanceLevelForKind,
        validateStructuralRelevanceProfile
    };
})(window);
