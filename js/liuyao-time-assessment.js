(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const effectApi = GuiJia.liuyaoTimeEffects;
    if (!effectApi?.validateTimeEffectSet) throw new Error('liuyao-time-effects.js must be loaded before liuyao-time-assessment.js');

    const SCHEMA_VERSION = 1;
    const DIMENSIONS = Object.freeze([...effectApi.DIMENSIONS]);
    const DIMENSION_LABELS = effectApi.DIMENSION_LABELS;
    const LEGACY_EVALUATIVE_TOKENS = new Set(['supportive','adverse','mixed','preferred','caution','restraining']);

    const safeEventView = (event) => ({
        code:String(event?.code || ''),
        label:String(event?.label || ''),
        text:String(event?.text || ''),
        subject:String(event?.subject || 'context'),
        tier:String(event?.tier || 'context'),
        score:Number(event?.score || 0),
        timeEffects:event?.timeEffects || null
    });

    const reasonKey = (kind, event, reason) => [
        kind,
        event.code,
        event.subject,
        reason?.sourceKey || '',
        reason?.rule || ''
    ].join('|');

    const summarizeKinds = (activeKinds) => {
        const kinds = DIMENSIONS.filter((kind) => activeKinds.includes(kind));
        const hasTrigger = kinds.includes('trigger');
        const substantive = kinds.filter((kind) => kind !== 'trigger');
        if (!substantive.length) return hasTrigger ? '以触发为主' : '以结构观察为主';
        if (substantive.length === 1) {
            const kind = substantive[0];
            const single = {
                support:hasTrigger ? '触发并见生扶' : '对主要观察爻有生扶',
                peer:hasTrigger ? '触发并见比和' : '与主要观察爻比和',
                constraint:hasTrigger ? '触发伴随受制' : '对主要观察爻偏受制',
                outflow:hasTrigger ? '触发伴随泄力' : '主要观察爻有泄力',
                exertion:hasTrigger ? '触发伴随耗力' : '主要观察爻有耗力'
            };
            return single[kind] || (hasTrigger ? `触发并见${DIMENSION_LABELS[kind] || kind}` : `${DIMENSION_LABELS[kind] || kind}`);
        }
        const labels = substantive.map((kind) => DIMENSION_LABELS[kind] || kind);
        const joined = labels.length === 2
            ? labels.join('与')
            : `${labels.slice(0, -1).join('、')}与${labels[labels.length - 1]}`;
        return hasTrigger ? `触发中，${joined}并见` : `${joined}并见`;
    };

    const assessNodeEvents = (events = []) => {
        const dimensionBuckets = Object.fromEntries(DIMENSIONS.map((kind) => [kind, []]));
        const seen = new Set();
        (events || []).map(safeEventView).forEach((event) => {
            const effectSet = event.timeEffects;
            if (!effectSet) return;
            const errors = effectApi.validateTimeEffectSet(effectSet);
            if (errors.length) throw new Error(`invalid TimeEffect in node assessment: ${errors.join(',')}`);
            DIMENSIONS.forEach((kind) => {
                (effectSet.dimensions?.[kind] || []).forEach((reason) => {
                    const key = reasonKey(kind, event, reason);
                    if (seen.has(key)) return;
                    seen.add(key);
                    dimensionBuckets[kind].push({
                        kind,
                        sourceFactCode:String(effectSet.sourceFactCode || event.code),
                        eventCode:event.code,
                        eventLabel:event.label,
                        eventText:event.text,
                        subject:event.subject,
                        tier:event.tier,
                        score:event.score,
                        sourceKey:String(reason?.sourceKey || ''),
                        rule:String(reason?.rule || '')
                    });
                });
            });
        });

        const dimensions = {};
        DIMENSIONS.forEach((kind) => {
            const reasons = dimensionBuckets[kind];
            dimensions[kind] = {
                active:reasons.length > 0,
                reasonCount:reasons.length,
                directMainObserver:reasons.some((item) => item.subject === 'main-observer'),
                primary:reasons.some((item) => item.tier === 'primary'),
                maxScore:reasons.length ? Math.max(...reasons.map((item) => item.score || 0)) : 0,
                reasons
            };
        });
        const activeKinds = DIMENSIONS.filter((kind) => dimensions[kind].active);
        const substantiveKinds = activeKinds.filter((kind) => kind !== 'trigger');
        const summaryText = summarizeKinds(activeKinds);
        return {
            schemaVersion:SCHEMA_VERSION,
            activeKinds,
            substantiveKinds,
            signature:activeKinds.join('+') || 'none',
            dimensions,
            summary:{
                text:summaryText,
                kinds:[...activeKinds]
            }
        };
    };

    const validateNodeAssessment = (assessment) => {
        const errors = [];
        if (!assessment || typeof assessment !== 'object') return ['assessment-not-object'];
        if (assessment.schemaVersion !== SCHEMA_VERSION) errors.push('schema-version');
        if (!Array.isArray(assessment.activeKinds)) errors.push('active-kinds');
        if (!Array.isArray(assessment.substantiveKinds)) errors.push('substantive-kinds');
        if (!assessment.dimensions || typeof assessment.dimensions !== 'object') errors.push('dimensions');
        DIMENSIONS.forEach((kind) => {
            const item = assessment.dimensions?.[kind];
            if (!item || typeof item !== 'object') errors.push(`dimension:${kind}`);
            else {
                if (typeof item.active !== 'boolean') errors.push(`dimension-active:${kind}`);
                if (!Array.isArray(item.reasons)) errors.push(`dimension-reasons:${kind}`);
                if (item.active !== Boolean(item.reasons?.length)) errors.push(`dimension-active-mismatch:${kind}`);
            }
        });
        (assessment.activeKinds || []).forEach((kind) => {
            if (!DIMENSIONS.includes(kind)) errors.push(`unknown-kind:${kind}`);
            if (!assessment.dimensions?.[kind]?.active) errors.push(`inactive-listed-kind:${kind}`);
        });
        const expectedSubstantive = (assessment.activeKinds || []).filter((kind) => kind !== 'trigger');
        if (JSON.stringify(expectedSubstantive) !== JSON.stringify(assessment.substantiveKinds || [])) errors.push('substantive-kind-mismatch');
        if (!assessment.summary || typeof assessment.summary.text !== 'string' || !assessment.summary.text) errors.push('summary');
        const missingSummaryKind = (assessment.activeKinds || []).find((kind) => !(assessment.summary?.kinds || []).includes(kind));
        if (missingSummaryKind) errors.push(`summary-kind-missing:${missingSummaryKind}`);
        const walk = (value, path = '') => {
            if (Array.isArray(value)) return value.forEach((item, index) => walk(item, `${path}[${index}]`));
            if (!value || typeof value !== 'object') {
                if (typeof value === 'string' && LEGACY_EVALUATIVE_TOKENS.has(value)) errors.push(`legacy-token:${path}`);
                return;
            }
            Object.entries(value).forEach(([key, nested]) => walk(nested, path ? `${path}.${key}` : key));
        };
        walk(assessment);
        return [...new Set(errors)];
    };

    GuiJia.liuyaoTimeAssessment = {
        SCHEMA_VERSION,
        DIMENSIONS,
        summarizeKinds,
        assessNodeEvents,
        validateNodeAssessment
    };
})(window);
