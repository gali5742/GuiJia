(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const outputApi = GuiJia.liuyaoTimeOutput;
    if (!outputApi?.materialDateSignature) throw new Error('liuyao-time-output.js must be loaded before liuyao-time-review.js');

    const SCHEMA_VERSION = 1;

    const preferredDates = (comparison) => Array.isArray(comparison?.preferredDates)
        ? comparison.preferredDates.filter(Boolean)
        : [];

    const comparisonSignature = (comparison) => {
        if (!comparison) return 'none';
        const status = String(comparison.status || '');
        const dates = preferredDates(comparison);
        // 并列结论的日期集合没有先后意义；开发审阅不能把同一并列集合的顺序变化误报成首选变化。
        const normalizedDates = status === 'tie' || dates.length > 1 ? [...dates].sort() : dates;
        return `${status}|${normalizedDates.join(',')}`;
    };

    const compareComparison = (legacy, candidate) => {
        const legacyDates = preferredDates(legacy);
        const candidateDates = preferredDates(candidate);
        const same = comparisonSignature(legacy) === comparisonSignature(candidate);
        let kind = 'same';
        if (!same) {
            const legacyTie = legacy?.status === 'tie' || legacyDates.length > 1;
            const candidateTie = candidate?.status === 'tie' || candidateDates.length > 1;
            if (legacyTie && !candidateTie) kind = 'tie-to-preferred';
            else if (!legacyTie && candidateTie) kind = 'preferred-to-tie';
            else if (legacyDates[0] && candidateDates[0] && legacyDates[0] !== candidateDates[0]) kind = 'preferred-date-changed';
            else kind = 'comparison-changed';
        }
        return {
            same,
            kind,
            legacy:{ status:String(legacy?.status || ''), preferredDates:legacyDates, summary:String(legacy?.summary || '') },
            candidate:{ status:String(candidate?.status || ''), preferredDates:candidateDates, summary:String(candidate?.summary || '') }
        };
    };

    const normalizeLegacyNode = (entry) => ({
        dateText:String(entry?.dateText || ''),
        dayGanZhi:String(entry?.dayGanZhi || ''),
        title:String(entry?.title || ''),
        effectSummary:String(entry?.effectSummary || ''),
        assessmentText:String(entry?.assessment?.text || ''),
        assessmentCode:String(entry?.assessment?.code || ''),
        facts:[...(entry?.facts || [])]
    });

    const normalizeCandidateNode = (entry) => ({
        dateText:String(entry?.dateText || ''),
        dayGanZhi:String(entry?.dayGanZhi || ''),
        title:String(entry?.title || ''),
        effectSummary:String(entry?.effectSummary || ''),
        assessmentText:String(entry?.assessment?.text || ''),
        assessmentCode:String(entry?.assessment?.code || ''),
        effectKinds:[...(entry?.effectKinds || [])],
        facts:[...(entry?.facts || [])]
    });

    const mapByDate = (items = []) => new Map(items.map((item) => [String(item?.dateText || ''), item]));

    const compareNodes = (legacyItems = [], candidateItems = []) => {
        const legacyMap = mapByDate(legacyItems);
        const candidateMap = mapByDate(candidateItems);
        const dates = [...new Set([...legacyMap.keys(), ...candidateMap.keys()])].filter(Boolean).sort();
        return dates.map((dateText) => {
            const legacy = legacyMap.has(dateText) ? normalizeLegacyNode(legacyMap.get(dateText)) : null;
            const candidate = candidateMap.has(dateText) ? normalizeCandidateNode(candidateMap.get(dateText)) : null;
            const summaryChanged = Boolean(legacy && candidate && legacy.effectSummary !== candidate.effectSummary);
            const assessmentChanged = Boolean(legacy && candidate && legacy.assessmentText !== candidate.assessmentText);
            const factsChanged = Boolean(legacy && candidate && JSON.stringify(legacy.facts) !== JSON.stringify(candidate.facts));
            return {
                dateText,
                legacy,
                candidate,
                selection:'legacy-only',
                summaryChanged,
                assessmentChanged,
                factsChanged,
                changed:!legacy || !candidate || summaryChanged || assessmentChanged || factsChanged
            };
        }).map((entry) => ({
            ...entry,
            selection:entry.legacy && entry.candidate ? 'both' : entry.candidate ? 'candidate-only' : 'legacy-only'
        }));
    };

    const focusCandidateNodes = (focus) => {
        if (focus?.outputModel === 'time-v2') return focus?.kind === 'range' ? (focus?.keyNodes || []) : (focus?.entries || []);
        return focus?.kind === 'range' ? (focus?.candidateOutput?.keyNodes || []) : (focus?.candidateOutput?.entries || []);
    };
    const focusLegacyNodes = (focus) => {
        if (focus?.legacyShadow) return focus?.kind === 'range' ? (focus.legacyShadow.keyNodes || []) : (focus.legacyShadow.entries || []);
        return focus?.kind === 'range' ? (focus?.keyNodes || []) : (focus?.entries || []);
    };

    const buildQuestionTimeReview = (focus) => {
        if (!focus || typeof focus !== 'object') return null;
        const legacyComparison = focus?.legacyShadow?.comparison ?? focus.comparison ?? null;
        const candidateComparison = focus?.outputModel === 'time-v2' ? (focus.comparison || null) : (focus.candidateOutput?.comparison || null);
        const comparison = compareComparison(legacyComparison, candidateComparison);
        const nodes = compareNodes(focusLegacyNodes(focus), focusCandidateNodes(focus));
        return {
            schemaVersion:SCHEMA_VERSION,
            kind:String(focus.kind || ''),
            mode:String(focus.mode || ''),
            comparison,
            counts:{
                total:nodes.length,
                changed:nodes.filter((item) => item.changed).length,
                both:nodes.filter((item) => item.selection === 'both').length,
                legacyOnly:nodes.filter((item) => item.selection === 'legacy-only').length,
                candidateOnly:nodes.filter((item) => item.selection === 'candidate-only').length
            },
            nodes
        };
    };

    const formatNode = (node, label) => {
        if (!node) return [`  - ${label}：无`];
        const lines = [`  - ${label}：${node.effectSummary || '无节点效力摘要'}`];
        if (node.assessmentText) lines.push(`    日期判断：${node.assessmentText}`);
        (node.facts || []).forEach((fact) => lines.push(`    ${fact}`));
        return lines;
    };

    const formatQuestionTimeReview = (review) => {
        if (!review) return '';
        const lines = ['【时间判断开发对照】'];
        lines.push(`比较差异：${review.comparison.kind}`);
        if (review.comparison.legacy.summary) lines.push(`旧比较：${review.comparison.legacy.summary}`);
        if (review.comparison.candidate.summary) lines.push(`新比较：${review.comparison.candidate.summary}`);
        review.nodes.filter((item) => item.changed).forEach((item) => {
            lines.push(`- ${item.dateText}`);
            lines.push(...formatNode(item.legacy, '旧'));
            lines.push(...formatNode(item.candidate, '新'));
        });
        return lines.join('\n');
    };

    const validateQuestionTimeReview = (review) => {
        const errors = [];
        if (!review || typeof review !== 'object') return ['review-not-object'];
        if (review.schemaVersion !== SCHEMA_VERSION) errors.push('schema-version');
        if (!review.comparison || typeof review.comparison.kind !== 'string') errors.push('comparison');
        if (!Array.isArray(review.nodes)) errors.push('nodes');
        (review.nodes || []).forEach((entry, index) => {
            if (!entry.dateText) errors.push(`node-date:${index}`);
            if (!['both','legacy-only','candidate-only'].includes(entry.selection)) errors.push(`node-selection:${index}`);
        });
        return [...new Set(errors)];
    };

    GuiJia.liuyaoTimeReview = {
        SCHEMA_VERSION,
        comparisonSignature,
        compareComparison,
        compareNodes,
        buildQuestionTimeReview,
        formatQuestionTimeReview,
        validateQuestionTimeReview
    };
})(window);
