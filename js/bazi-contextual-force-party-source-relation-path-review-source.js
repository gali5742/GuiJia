(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceRelationPathReviewSource?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceHiddenSealTargetReviewContract;
    if (!prior) return;
    const { freeze } = prior;
    const sourceUrl = prior.SOURCE_CASE.sourceUrl;
    const stem = (pillarIndex, gan) => ({ pillarIndex, gan, scope: 'visible-stem' });
    const branch = (pillarIndex, zhi) => ({ pillarIndex, zhi, scope: 'surface-branch' });
    const CASES = freeze([
        {
            id: 'CF-SRPR-CASE-01',
            chartKey: '丁未|壬子|庚戌|丙戌',
            sourceUrl, locator: '通神论 · 三十、燥湿',
            sourceText: '此造如以水势论之，此则仲冬水旺，所喜者支中重重燥土，足以去其湿气。只为相克，使子不能助壬；丁壬一合，使壬不能克丙。',
            paths: [
                {
                    id: 'CF-SRPR-01-P01', source: branch(1, '子'), target: stem(1, '壬'),
                    from: '子', predicate: '不能助', to: '壬', span: '使子不能助壬',
                    functionType: 'source-asserted-support', realized: false, contextActors: [],
                    attribution: { span: '只为相克', kind: 'source-asserted-prevention', conditioningActorsNamed: false },
                    basis: 'The natal text names 子 and 壬. The contextual dry earth and restraint are retained without selecting one dry-earth actor. Whole 子 stays distinct from hidden 癸.'
                },
                {
                    id: 'CF-SRPR-01-P02', source: stem(1, '壬'), target: stem(3, '丙'),
                    from: '壬', predicate: '不能克', to: '丙', span: '使壬不能克丙',
                    functionType: 'restraint', realized: false, contextActors: [stem(0, '丁')],
                    attribution: { span: '丁壬一合', kind: 'source-asserted-prevention', conditioningActorsNamed: true },
                    basis: 'The same clause explicitly names the combination and the affected 壬→丙 path. 丁 has a contextual role and the combination supplies no directed effect or transformation identity.'
                }
            ]
        },
        {
            id: 'CF-SRPR-CASE-02',
            chartKey: '癸丑|己未|丙寅|辛卯',
            sourceUrl, locator: '六亲论 · 七、小儿',
            sourceText: '癸水官星生未月，火土枯干，余气在丑，蓄水藏金，然己土当头伤癸，丑未冲去金水根源，时上辛又临绝，虽有若无，焉能生远隔之水？则己土亦不能生隔绝之金。',
            paths: [
                {
                    id: 'CF-SRPR-02-P01', source: stem(1, '己'), target: stem(0, '癸'),
                    from: '己土', predicate: '伤', to: '癸', span: '己土当头伤癸',
                    functionType: 'source-asserted-damage', realized: true, contextActors: [],
                    attribution: { span: '当头', kind: 'source-position-wording' },
                    basis: 'The author affirms damage by the explicitly named visible 己 to the visible 癸 previously named as the officer. No effect-type authority is registered for this pair.'
                },
                {
                    id: 'CF-SRPR-02-P02', source: stem(3, '辛'), target: stem(0, '癸'),
                    from: '时上辛', predicate: '焉能生', to: '远隔之水', span: '时上辛又临绝，虽有若无，焉能生远隔之水',
                    antecedentSpan: '癸水官星', functionType: 'generation', realized: false, contextActors: [],
                    attribution: { span: '远隔之水', kind: 'source-position-wording' },
                    basis: 'The visible-source reading links the hour 辛 and the preceding attribution to 癸水官星. The reading keeps nearby 丑 remainder and clash at contextual scope. It adds no distance threshold.'
                },
                {
                    id: 'CF-SRPR-02-P03', source: stem(1, '己'), target: stem(3, '辛'),
                    from: '己土', predicate: '不能生', to: '隔绝之金', span: '己土亦不能生隔绝之金',
                    antecedentSpan: '时上辛', functionType: 'generation', realized: false, contextActors: [],
                    attribution: { span: '隔绝之金', kind: 'source-position-wording' },
                    basis: 'The authored negation and the immediately preceding description of hour 辛 support this exact visible pair. 金 here retains the reviewed antecedent rather than selecting a hidden metal candidate.'
                }
            ]
        }
    ]);
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-RELATION-PATH-REVIEW-001';
    const CONTRACT = freeze({
        id: 'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-RELATION-PATH-REVIEW-CONTRACT-001',
        version: '0.1',
        reviewScope: 'two-exact-natal-source-cases-and-existing-order-and-hidden-target-contrasts',
        newSourceCaseCount: CASES.length,
        retrievedOn: '2026-11-21',
        finalStrengthMapping: false,
        boundary: 'Each path carries its own identity, realization and source attribution. Source order and coexistence remain separate from realization. Missing evidence leaves paths unresolved and existing R5 authority remains case scoped.'
    });
    GuiJia.baziContextualForcePartySourceRelationPathReviewSource = freeze({ installed: true, RULE_ID, CASES, CONTRACT, freeze });
})(typeof window !== 'undefined' ? window : globalThis);
