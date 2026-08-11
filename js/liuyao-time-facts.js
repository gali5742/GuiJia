(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    const SCHEMA_VERSION = 1;
    const FORBIDDEN_FACT_KEYS = new Set(['direction','effect','effectLabel','score','tier','assessment','rank']);
    const EVALUATIVE_TOKENS = new Set(['supportive','adverse','mixed','preferred','caution']);

    const roleRelationFromLegacy = (roleCode) => ({
        SOURCE:'line-generates-observer',
        TABOO:'line-controls-observer',
        ENEMY:'observer-controls-line',
        PEER:'same-element'
    }[String(roleCode || '')] || '');

    const extractPosition = (code) => {
        const matches = String(code || '').match(/(?:^|_)([1-6])(?:_|$)/g) || [];
        if (!matches.length) return null;
        const value = Number(matches[matches.length - 1].replace(/_/g, ''));
        return Number.isFinite(value) ? value : null;
    };

    const makeComponent = (family, relation, extra = {}) => ({ family, relation, ...extra });

    const classifyLegacyCode = (code) => {
        const value = String(code || '');

        if (value === 'TARGET_DAY_SUPPORT') return [makeComponent('element-relation', 'day-generates-observer')];
        if (value === 'TARGET_DAY_CONTROL') return [makeComponent('element-relation', 'day-controls-observer')];
        if (value === 'TARGET_DAY_PEER') return [makeComponent('element-relation', 'same-element')];
        if (value === 'TARGET_DAY_DRAIN') return [makeComponent('element-relation', 'observer-generates-day')];
        if (value === 'TARGET_CONTROLS_DAY') return [makeComponent('element-relation', 'observer-controls-day')];

        if (/VOID_OUT_VALUE$/.test(value)) {
            return [
                makeComponent('void-transition', 'out'),
                makeComponent('branch-relation', 'value')
            ];
        }
        if (/VOID_VALUE_AFTER_OUT$/.test(value)) {
            return [
                makeComponent('void-transition', 'already-out'),
                makeComponent('branch-relation', 'value')
            ];
        }
        if (/VOID_OUT$/.test(value)) return [makeComponent('void-transition', 'out')];
        if (/VOID_FILL$/.test(value)) return [makeComponent('void-transition', 'fill'), makeComponent('branch-relation', 'value')];
        if (/VOID_CLASH$/.test(value)) return [makeComponent('void-transition', 'clash-open'), makeComponent('branch-relation', 'clash')];

        if (/MONTH_BREAK_VALUE/.test(value)) {
            return [
                makeComponent('month-break-review', 'value-review'),
                makeComponent('branch-relation', 'value')
            ];
        }
        if (/MONTH_BREAK_HARMONY/.test(value)) {
            return [
                makeComponent('month-break-review', 'harmony-review'),
                makeComponent('branch-relation', 'harmony')
            ];
        }

        if (/^SANHE_/.test(value)) {
            if (/MEMBER_VALUE/.test(value)) return [makeComponent('formation', 'member-value', { formation:'sanhe' }), makeComponent('branch-relation', 'value')];
            if (/PENDING/.test(value)) return [makeComponent('formation', 'missing-branch-supplied', { formation:'sanhe' })];
            if (/DEFERRED_OUT/.test(value)) return [makeComponent('formation', 'void-blocker-out', { formation:'sanhe' }), makeComponent('void-transition', 'out')];
            if (/DEFERRED_FILL/.test(value)) return [makeComponent('formation', 'void-blocker-filled', { formation:'sanhe' }), makeComponent('void-transition', 'fill')];
            if (/DEFERRED_CLASH/.test(value)) return [makeComponent('formation', 'void-blocker-clash-open', { formation:'sanhe' }), makeComponent('void-transition', 'clash-open')];
            return [makeComponent('formation', 'state-change', { formation:'sanhe' })];
        }

        if (/HARMONY/.test(value)) return [makeComponent('branch-relation', 'harmony')];
        if (/CLASH/.test(value)) return [makeComponent('branch-relation', 'clash')];
        if (/VALUE/.test(value)) return [makeComponent('branch-relation', 'value')];

        return [makeComponent('structural-event', 'observed')];
    };

    const semanticKeyForComponent = (component) => [
        component?.family || 'unknown',
        component?.relation || 'unknown',
        component?.formation || ''
    ].filter(Boolean).join(':');

    const createTimeFact = ({ sourceCode, subject = 'context', roleCode = '', components, meta = {} } = {}) => {
        const normalizedComponents = (Array.isArray(components) && components.length ? components : [makeComponent('structural-event', 'observed')])
            .map((component) => ({ ...component }));
        const semanticKeys = [...new Set(normalizedComponents.map(semanticKeyForComponent))];
        const position = Number.isFinite(Number(meta.position)) ? Number(meta.position) : extractPosition(sourceCode);
        const roleRelation = roleRelationFromLegacy(roleCode);
        const fact = {
            schemaVersion:SCHEMA_VERSION,
            sourceCode:String(sourceCode || ''),
            family:normalizedComponents.length > 1 ? 'compound' : normalizedComponents[0].family,
            relation:normalizedComponents.length > 1 ? 'compound' : normalizedComponents[0].relation,
            subject:String(subject || 'context'),
            subjectRef:{
                kind:String(subject || 'context'),
                ...(position ? { position } : {}),
                ...(roleRelation ? { relativeElementRelation:roleRelation } : {})
            },
            components:normalizedComponents,
            semanticKeys,
            subsumes:normalizedComponents.length > 1 ? semanticKeys : [],
            meta:{ ...meta }
        };
        return fact;
    };

    const factFromLegacyEvent = (event) => createTimeFact({
        sourceCode:event?.code,
        subject:event?.subject,
        roleCode:event?.roleCode,
        components:classifyLegacyCode(event?.code),
        meta:{ legacyBridge:true, ...(event?.factMeta || {}) }
    });

    const validateTimeFact = (fact) => {
        const errors = [];
        if (!fact || typeof fact !== 'object') return ['fact-not-object'];
        if (fact.schemaVersion !== SCHEMA_VERSION) errors.push('schema-version');
        if (!fact.sourceCode) errors.push('source-code');
        if (!Array.isArray(fact.components) || !fact.components.length) errors.push('components');
        const visit = (value, path = '') => {
            if (Array.isArray(value)) {
                value.forEach((item, index) => visit(item, `${path}[${index}]`));
                return;
            }
            if (!value || typeof value !== 'object') {
                if (typeof value === 'string' && EVALUATIVE_TOKENS.has(value)) errors.push(`evaluative-token:${path}`);
                return;
            }
            Object.entries(value).forEach(([key, nested]) => {
                if (FORBIDDEN_FACT_KEYS.has(key)) errors.push(`forbidden-key:${path ? `${path}.` : ''}${key}`);
                visit(nested, path ? `${path}.${key}` : key);
            });
        };
        visit(fact);
        return [...new Set(errors)];
    };

    const isPureTimeFact = (fact) => validateTimeFact(fact).length === 0;

    GuiJia.liuyaoTimeFacts = {
        SCHEMA_VERSION,
        classifyLegacyCode,
        createTimeFact,
        factFromLegacyEvent,
        validateTimeFact,
        isPureTimeFact,
        semanticKeyForComponent
    };
})(window);
