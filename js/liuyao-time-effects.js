(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const factApi = GuiJia.liuyaoTimeFacts;
    if (!factApi?.validateTimeFact) throw new Error('liuyao-time-facts.js must be loaded before liuyao-time-effects.js');

    const SCHEMA_VERSION = 1;
    const DIMENSIONS = Object.freeze(['trigger','support','peer','constraint','outflow','exertion']);
    const DIMENSION_LABELS = Object.freeze({
        trigger:'触发',
        support:'生扶',
        peer:'比和',
        constraint:'受制',
        outflow:'泄力',
        exertion:'耗力'
    });
    const LEGACY_EVALUATIVE_TOKENS = new Set(['supportive','adverse','mixed','preferred','caution','restraining']);

    const GENERATES = Object.freeze({ 木:'火', 火:'土', 土:'金', 金:'水', 水:'木' });
    const CONTROLS = Object.freeze({ 木:'土', 土:'水', 水:'火', 火:'金', 金:'木' });

    const effectKindFromElementRelation = (relation) => ({
        'day-generates-observer':'support',
        'day-controls-observer':'constraint',
        'same-element':'peer',
        'observer-generates-day':'outflow',
        'observer-controls-day':'exertion'
    }[relation] || '');

    const effectKindFromRelativeLineRelation = (relation) => ({
        'line-generates-observer':'support',
        'line-controls-observer':'constraint',
        'observer-controls-line':'exertion',
        // 兼容旧 TimeFact bridge：旧版曾把 ENEMY 记录为“生克链上生忌神”，
        // RC 起按其与主要观察爻的直接五行关系统一落为“观察爻耗力”。
        'line-generates-controller-of-observer':'exertion',
        'same-element':'peer'
    }[relation] || '');

    const relationKindBetweenElements = (actingElement, observerElement) => {
        if (!actingElement || !observerElement) return '';
        if (actingElement === observerElement) return 'peer';
        if (GENERATES[actingElement] === observerElement) return 'support';
        if (CONTROLS[actingElement] === observerElement) return 'constraint';
        if (GENERATES[observerElement] === actingElement) return 'outflow';
        if (CONTROLS[observerElement] === actingElement) return 'exertion';
        return '';
    };

    const componentKey = (component) => factApi.semanticKeyForComponent(component);

    const addDimensionReason = (bucket, kind, reason) => {
        if (!DIMENSIONS.includes(kind)) return;
        const key = `${reason?.sourceKey || ''}|${reason?.rule || ''}|${reason?.sourceCode || ''}`;
        if (bucket[kind].some((item) => item._key === key)) return;
        bucket[kind].push({ ...reason, _key:key });
    };

    const hasActivationComponent = (fact) => (fact?.components || []).some((component) =>
        ['branch-relation','void-transition','month-break-review','formation','structural-event'].includes(component.family));

    const mapTimeFactToEffects = (fact) => {
        const validationErrors = factApi.validateTimeFact(fact);
        if (validationErrors.length) throw new Error(`invalid TimeFact: ${validationErrors.join(',')}`);

        const bucket = Object.fromEntries(DIMENSIONS.map((kind) => [kind, []]));
        const sourceCode = String(fact.sourceCode || '');
        const subject = String(fact.subject || 'context');

        (fact.components || []).forEach((component) => {
            const sourceKey = componentKey(component);
            if (component.family === 'element-relation') {
                const kind = effectKindFromElementRelation(component.relation);
                if (kind) addDimensionReason(bucket, kind, { sourceKey, sourceCode, rule:'element-relation' });
                return;
            }
            if (['branch-relation','void-transition','month-break-review','formation','structural-event'].includes(component.family)) {
                addDimensionReason(bucket, 'trigger', { sourceKey, sourceCode, rule:`${component.family}-activation` });
            }
        });

        // 只有“关键爻被落实/复核”类事实，才把该爻与观察对象的五行角色投射为生扶/受制/比和。
        // 单纯六合、六冲本身不会自动制造生扶或受制。
        const relativeLineRelation = fact?.subjectRef?.relativeElementRelation || '';
        const lineRoleKind = effectKindFromRelativeLineRelation(relativeLineRelation);
        const roleActivation = (fact.components || []).some((component) =>
            component.family === 'void-transition'
            || component.family === 'month-break-review'
            || (component.family === 'branch-relation' && component.relation === 'value'));
        if (lineRoleKind && roleActivation) {
            addDimensionReason(bucket, lineRoleKind, {
                sourceKey:`subject-role:${relativeLineRelation}`,
                sourceCode,
                rule:'key-line-role-activated'
            });
        }

        // 三合等结构若携带纯事实五行元数据，则只在 Effect 层计算与主要观察爻的相对关系。
        const formationElement = fact?.meta?.formationElement || '';
        const observerElement = fact?.meta?.observerElement || '';
        if (formationElement && observerElement && (fact.components || []).some((component) => component.family === 'formation')) {
            const kind = relationKindBetweenElements(formationElement, observerElement);
            if (kind) addDimensionReason(bucket, kind, {
                sourceKey:`formation-element:${formationElement}->${observerElement}`,
                sourceCode,
                rule:'formation-element-relation'
            });
        }

        // 这些是事件本身携带的结构性限制，不从“合/冲”字面泛化。
        if (sourceCode === 'TARGET_STATIC_CLASH_BREAK') {
            addDimensionReason(bucket, 'constraint', { sourceKey:'target-static-day-break', sourceCode, rule:'day-break' });
        }
        if (sourceCode === 'TARGET_MOVING_HARMONY') {
            addDimensionReason(bucket, 'constraint', { sourceKey:'target-moving-harmony-restraint', sourceCode, rule:'moving-line-harmony-restraint' });
        }

        const dimensions = {};
        DIMENSIONS.forEach((kind) => {
            dimensions[kind] = bucket[kind].map(({ _key, ...item }) => item);
        });
        const activeKinds = DIMENSIONS.filter((kind) => dimensions[kind].length > 0);
        return {
            schemaVersion:SCHEMA_VERSION,
            sourceFactCode:sourceCode,
            subject,
            activeKinds,
            dimensions
        };
    };

    const mapTimeFactsToEffects = (facts = []) => (facts || []).map(mapTimeFactToEffects);

    const validateTimeEffectSet = (effectSet) => {
        const errors = [];
        if (!effectSet || typeof effectSet !== 'object') return ['effect-set-not-object'];
        if (effectSet.schemaVersion !== SCHEMA_VERSION) errors.push('schema-version');
        if (!effectSet.sourceFactCode) errors.push('source-fact-code');
        if (!Array.isArray(effectSet.activeKinds)) errors.push('active-kinds');
        const dimensions = effectSet.dimensions;
        if (!dimensions || typeof dimensions !== 'object') errors.push('dimensions');
        DIMENSIONS.forEach((kind) => {
            if (!Array.isArray(dimensions?.[kind])) errors.push(`dimension:${kind}`);
        });
        (effectSet.activeKinds || []).forEach((kind) => {
            if (!DIMENSIONS.includes(kind)) errors.push(`unknown-kind:${kind}`);
            if (!effectSet.dimensions?.[kind]?.length) errors.push(`empty-active-kind:${kind}`);
        });
        const walk = (value, path = '') => {
            if (Array.isArray(value)) return value.forEach((item, index) => walk(item, `${path}[${index}]`));
            if (!value || typeof value !== 'object') {
                if (typeof value === 'string' && LEGACY_EVALUATIVE_TOKENS.has(value)) errors.push(`legacy-token:${path}`);
                return;
            }
            Object.entries(value).forEach(([key, nested]) => walk(nested, path ? `${path}.${key}` : key));
        };
        walk(effectSet);
        return [...new Set(errors)];
    };

    const hasKind = (effectSet, kind) => Boolean(effectSet?.dimensions?.[kind]?.length);

    GuiJia.liuyaoTimeEffects = {
        SCHEMA_VERSION,
        DIMENSIONS,
        DIMENSION_LABELS,
        effectKindFromElementRelation,
        effectKindFromRelativeLineRelation,
        relationKindBetweenElements,
        mapTimeFactToEffects,
        mapTimeFactsToEffects,
        validateTimeEffectSet,
        hasKind
    };
})(window);
