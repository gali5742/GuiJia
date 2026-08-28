(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (!GuiJia.liuyaoIntent?.parseDivinationIntent) throw new Error('liuyao-intent.js must be loaded before liuyao-rule-registry.js');

    const SOURCES = Object.freeze([
        { id:'SRC-ZSBY', era:'classical', type:'classical_text', title:'增删卜易', verification:'primary_text_verified' },
        { id:'SRC-BSZZ', era:'classical', type:'classical_text', title:'卜筮正宗', verification:'primary_text_verified' },
        { id:'SRC-WHY-ZX', era:'modern', type:'modern_monograph', author:'王虎应', title:'六爻预测自修宝典', verification:'secondary_verified' },
        { id:'SRC-WHY-YH', era:'modern', type:'modern_monograph', author:'王虎应', title:'六爻疑惑指迷', verification:'scan_verified' },
        { id:'SRC-ZCB-GSZZ', era:'modern', type:'modern_monograph', author:'朱辰彬', title:'古筮真诠', verification:'scan_verified' },
        { id:'SRC-ZCB-GSZZ-JJ', era:'modern', type:'modern_monograph', author:'朱辰彬', title:'古筮真诠·进阶篇', verification:'scan_verified' }
    ]);

    const EVIDENCES = Object.freeze([
        { id:'EV-TR001-A', tier:'classical_multi_source', sourceRefs:['SRC-ZSBY','SRC-BSZZ'], provenance:'cross_checked', supports:'经营求财以财为资本，并察世与财源。' },
        { id:'EV-TR001-E', tier:'classical_multi_source', sourceRefs:['SRC-ZSBY','SRC-BSZZ'], provenance:'cross_checked', supports:'借财以财为所求资金，并察己方与出借方。' },
        { id:'EV-TR001-I', tier:'classical_single_source', sourceRefs:['SRC-ZSBY'], provenance:'direct', supports:'财福长期结构兼察世、财与子孙财源。' },
        { id:'EV-TR002', tier:'classical_multi_source', sourceRefs:['SRC-ZSBY','SRC-BSZZ'], provenance:'cross_checked', supports:'婚姻财官为重，世应兼察。' },
        { id:'EV-MR001', tier:'modern_consensus', sourceRefs:['SRC-WHY-ZX','SRC-ZCB-GSZZ'], provenance:'cross_checked', supports:'特定异性恋爱对象按男女角色取财官，并察世。' },
        { id:'EV-MSR001', tier:'modern_supported', sourceRefs:['SRC-ZCB-GSZZ-JJ'], provenance:'direct', supports:'特指对象问题可增加应爻作为指定现实对象的第二观察维度。' },
        { id:'EV-MR002-A', tier:'modern_consensus', sourceRefs:['SRC-WHY-ZX','SRC-ZCB-GSZZ'], provenance:'cross_checked', supports:'现代投资求盈利以妻财为核心。' },
        { id:'EV-MR002-C', tier:'modern_supported', sourceRefs:['SRC-ZCB-GSZZ'], provenance:'direct', supports:'问合适投资多以子孙为用。' },
        { id:'EV-MR002-D', tier:'modern_supported', sourceRefs:['SRC-ZCB-GSZZ-JJ'], provenance:'direct', supports:'持有与套现使用不同象组，属于现代选择结构。' },
        { id:'EV-MR002-E1', tier:'modern_supported', sourceRefs:['SRC-WHY-ZX'], provenance:'direct', supports:'股票价格趋势以妻财为核心，子孙反映后续潜力。' },
        { id:'EV-MR002-E3', tier:'modern_supported', sourceRefs:['SRC-ZCB-GSZZ-JJ'], provenance:'direct', supports:'持仓者问走势时，走势与自身财务利益形成直接暴露。' },
        { id:'EV-MR003-A', tier:'modern_supported', sourceRefs:['SRC-WHY-ZX'], provenance:'direct', supports:'现代雇佣语境中妻财代表工资收入。' },
        { id:'EV-MR003-B', tier:'modern_supported', sourceRefs:['SRC-WHY-ZX'], provenance:'derived', supports:'年终奖现代案例以妻财为用；当前仅 provisional。' },
        { id:'EV-MR004', tier:'modern_supported', sourceRefs:['SRC-WHY-YH'], provenance:'direct', supports:'邮寄、快递物品以父母为用，所取为运输交付过程。' }
    ]);

    const staticSelector = (type, value) => ({ kind:'static', value:{ type, ...(value ? { value } : {}) } });
    const staticDuty = (value) => ({ kind:'static', value });
    const candidate = (selector, semanticDuty, source, required, evidenceRefs = []) => ({ selector, semanticDuty:staticDuty(semanticDuty), source, required, evidenceRefs });

    const OBSERVATION_RULES = Object.freeze([
        {
            id:'TR-001-A', family:'traditional', baseRuleId:'TR-001', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR001-A'],
            appliesTo:{ eventTypes:['business_operation'] },
            observations:[
                candidate(staticSelector('six_relative','妻财'), 'business_capital', 'primary', true, ['EV-TR001-A']),
                candidate(staticSelector('shi'), 'operator_self', 'role', true, ['EV-TR001-A']),
                candidate(staticSelector('six_relative','子孙'), 'business_source', 'domain', false, ['EV-TR001-A'])
            ]
        },
        {
            id:'TR-001-B', family:'traditional', baseRuleId:'TR-001', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR001-A'],
            appliesTo:{ eventTypes:['transaction'], transactionPurposes:['commercial_trade'] },
            observations:[
                candidate(staticSelector('six_relative','妻财'), 'transaction_value', 'primary', true),
                candidate(staticSelector('shi'), 'self_party', 'role', true),
                candidate(staticSelector('ying'), 'counterparty', 'role', true),
                candidate(staticSelector('six_relative','子孙'), 'wealth_source', 'domain', false)
            ]
        },
        {
            id:'TR-001-C', family:'traditional', baseRuleId:'TR-001', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR001-A'],
            appliesTo:{ eventTypes:['inventory_purchase'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'inventory_value', 'primary', true), candidate(staticSelector('shi'), 'buyer_self', 'role', true)]
        },
        {
            id:'TR-001-D', family:'traditional', baseRuleId:'TR-001', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR001-A'],
            appliesTo:{ eventTypes:['inventory_sale'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'inventory_value', 'primary', true), candidate(staticSelector('shi'), 'seller_self', 'role', true)]
        },
        {
            id:'TR-001-E', family:'traditional', baseRuleId:'TR-001', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR001-E'],
            appliesTo:{ eventTypes:['borrow_money'] },
            observations:[
                candidate(staticSelector('six_relative','妻财'), 'requested_funds', 'primary', true, ['EV-TR001-E']),
                candidate(staticSelector('shi'), 'borrower_self', 'role', true, ['EV-TR001-E']),
                candidate(staticSelector('ying'), 'lender', 'role', true, ['EV-TR001-E']),
                candidate(staticSelector('six_relative','子孙'), 'fund_source', 'domain', false, ['EV-TR001-E'])
            ]
        },
        {
            id:'TR-001-F', family:'traditional', baseRuleId:'TR-001', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR001-E'],
            appliesTo:{ eventTypes:['lend_money'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'lent_funds', 'primary', true), candidate(staticSelector('shi'), 'lender_self', 'role', true), candidate(staticSelector('ying'), 'borrower', 'role', true)]
        },
        {
            id:'TR-001-G', family:'traditional', baseRuleId:'TR-001', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR001-E'],
            appliesTo:{ eventTypes:['debt_collection'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'debt_target', 'primary', true), candidate(staticSelector('shi'), 'creditor_self', 'role', true), candidate(staticSelector('ying'), 'debtor', 'role', true)]
        },
        {
            id:'TR-001-H', family:'traditional', baseRuleId:'TR-001', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR001-A'],
            appliesTo:{ eventTypes:['partnership'] },
            observations:[
                candidate(staticSelector('six_relative','妻财'), 'partnership_profit', 'primary', true),
                candidate(staticSelector('shi'), 'self_partner', 'role', true),
                candidate(staticSelector('ying'), 'counterpart_partner', 'role', true)
            ]
        },
        {
            id:'TR-001-I-S', family:'traditional', baseRuleId:'TR-001-I', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR001-I'],
            appliesTo:{ eventTypes:['financial_fortune'], fortuneScopes:['short_or_bounded'] },
            observations:[
                candidate(staticSelector('six_relative','妻财'), 'period_wealth_state', 'primary', true, ['EV-TR001-I']),
                candidate(staticSelector('shi'), 'self_capacity', 'role', true, ['EV-TR001-I']),
                candidate(staticSelector('six_relative','子孙'), 'wealth_source', 'domain', false, ['EV-TR001-I'])
            ]
        },
        {
            id:'TR-001-I-L', family:'traditional', baseRuleId:'TR-001-I', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR001-I'],
            appliesTo:{ eventTypes:['financial_fortune'], fortuneScopes:['long_term_or_lifetime'] },
            observations:[
                candidate(staticSelector('six_relative','妻财'), 'long_term_wealth', 'primary', true, ['EV-TR001-I']),
                candidate(staticSelector('shi'), 'self_capacity', 'role', true, ['EV-TR001-I']),
                candidate(staticSelector('six_relative','子孙'), 'wealth_source', 'domain', true, ['EV-TR001-I'])
            ]
        },
        {
            id:'TR-002-M-MALE', family:'traditional', baseRuleId:'TR-002-M', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR002'],
            appliesTo:{ eventTypes:['marriage_match'], participantPatterns:['self_male_prospective_wife'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'prospective_wife', 'primary', true), candidate(staticSelector('shi'), 'self', 'role', true), candidate(staticSelector('ying'), 'partner_side', 'auxiliary', false)]
        },
        {
            id:'TR-002-M-FEMALE', family:'traditional', baseRuleId:'TR-002-M', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR002'],
            appliesTo:{ eventTypes:['marriage_match'], participantPatterns:['self_female_prospective_husband'] },
            observations:[candidate(staticSelector('six_relative','官鬼'), 'prospective_husband', 'primary', true), candidate(staticSelector('shi'), 'self', 'role', true), candidate(staticSelector('ying'), 'partner_side', 'auxiliary', false)]
        },
        {
            id:'TR-002-M-REPRESENTED', family:'traditional', baseRuleId:'TR-002-M', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR002'],
            appliesTo:{ eventTypes:['marriage_match'], participantPatterns:['represented_marriage'] },
            observations:[
                { selector:{ kind:'resolver', resolverRef:'PRR-REPRESENTED-MARRIAGE-SUBJECT' }, semanticDuty:staticDuty('represented_marriage_subject'), source:'primary', required:true, evidenceRefs:['EV-TR002'] },
                candidate(staticSelector('shi'), 'querent_self', 'role', true),
                candidate(staticSelector('ying'), 'partner_side_aux', 'auxiliary', false)
            ]
        },
        {
            id:'TR-002-R-WIFE', family:'traditional', baseRuleId:'TR-002-R', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR002'],
            appliesTo:{ eventTypes:['marital_relationship'], participantPatterns:['existing_wife'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'spouse_wife', 'primary', true), candidate(staticSelector('shi'), 'self', 'role', true), candidate(staticSelector('ying'), 'spouse_side_aux', 'auxiliary', false)]
        },
        {
            id:'TR-002-R-HUSBAND', family:'traditional', baseRuleId:'TR-002-R', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-TR002'],
            appliesTo:{ eventTypes:['marital_relationship'], participantPatterns:['existing_husband'] },
            observations:[candidate(staticSelector('six_relative','官鬼'), 'spouse_husband', 'primary', true), candidate(staticSelector('shi'), 'self', 'role', true), candidate(staticSelector('ying'), 'spouse_side_aux', 'auxiliary', false)]
        },
        {
            id:'MR-001-A', family:'modern', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-MR001'],
            appliesTo:{ eventTypes:['relationship_development'], participantPatterns:['romantic_male_to_female_specific'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'romantic_partner', 'primary', true, ['EV-MR001']), candidate(staticSelector('shi'), 'self', 'role', true, ['EV-MR001'])]
        },
        {
            id:'MR-001-B', family:'modern', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-MR001'],
            appliesTo:{ eventTypes:['relationship_development'], participantPatterns:['romantic_female_to_male_specific'] },
            observations:[candidate(staticSelector('six_relative','官鬼'), 'romantic_partner', 'primary', true, ['EV-MR001']), candidate(staticSelector('shi'), 'self', 'role', true, ['EV-MR001'])]
        },
        {
            id:'MR-002-A', family:'modern', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-MR002-A'],
            appliesTo:{ eventTypes:['investment'], investmentGoals:['profit'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'investment_profit', 'primary', true, ['EV-MR002-A']), candidate(staticSelector('shi'), 'investor_self', 'role', true)]
        },
        {
            id:'MR-002-B', family:'modern', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-MR002-A'],
            appliesTo:{ eventTypes:['investment'], investmentGoals:['liquidation'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'liquidation_value', 'primary', true, ['EV-MR002-A']), candidate(staticSelector('shi'), 'investor_self', 'role', true)]
        },
        {
            id:'MR-002-C', family:'modern', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-MR002-C'],
            appliesTo:{ eventTypes:['investment'], investmentGoals:['suitability'] },
            observations:[candidate(staticSelector('six_relative','子孙'), 'investment_suitability', 'primary', true, ['EV-MR002-C']), candidate(staticSelector('shi'), 'investor_self', 'role', true)]
        },
        {
            id:'MR-002-D', family:'modern', matchScope:'domain_specific', automationStatus:'provisional', evidenceRefs:['EV-MR002-D'],
            appliesTo:{ eventTypes:['investment'], investmentGoals:['position_decision'] },
            observations:[]
        },
        {
            id:'MR-002-E1', family:'modern', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-MR002-E1'],
            appliesTo:{ eventTypes:['investment'], investmentGoals:['price_trend'], investmentPositions:['unknown','none'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'price_trend', 'primary', true, ['EV-MR002-E1']), candidate(staticSelector('six_relative','子孙'), 'upward_potential', 'domain', false, ['EV-MR002-E1'])]
        },
        {
            id:'MR-002-E3', family:'modern', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-MR002-E3'],
            appliesTo:{ eventTypes:['investment'], investmentGoals:['price_trend'], investmentPositions:['holding'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'holding_profit_exposure', 'primary', true, ['EV-MR002-E3']), candidate(staticSelector('shi'), 'investor_self', 'role', true)]
        },
        {
            id:'MR-003-A', family:'modern', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-MR003-A'],
            appliesTo:{ eventTypes:['income'], incomeTypes:['salary'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'salary_income', 'primary', true, ['EV-MR003-A']), candidate(staticSelector('shi'), 'income_receiver', 'role', true)]
        },
        {
            id:'MR-003-B', family:'modern', matchScope:'domain_specific', automationStatus:'provisional', evidenceRefs:['EV-MR003-B'],
            appliesTo:{ eventTypes:['income'], incomeTypes:['bonus'] },
            observations:[candidate(staticSelector('six_relative','妻财'), 'bonus_income', 'primary', true, ['EV-MR003-B']), candidate(staticSelector('shi'), 'income_receiver', 'role', true)]
        },
        {
            id:'MR-004', family:'modern', matchScope:'domain_specific', automationStatus:'enabled', evidenceRefs:['EV-MR004'],
            appliesTo:{ eventTypes:['receive_item'], deliveryModes:['shipped','mail','courier'] },
            observations:[candidate(staticSelector('six_relative','父母'), 'shipment_delivery', 'primary', true, ['EV-MR004']), candidate(staticSelector('shi'), 'receiver_self', 'role', true)]
        }
    ]);

    const AUGMENTATION_RULES = Object.freeze([
        {
            id:'MSR-001', family:'modern', matchScope:'augmentation', automationStatus:'enabled', evidenceRefs:['EV-MSR001'],
            appliesTo:{ compatibleRuleRefs:['MR-001-A','MR-001-B'], requiresSpecificCounterpart:true },
            addObservations:[candidate(staticSelector('ying'), 'specified_romantic_counterpart', 'auxiliary', true, ['EV-MSR001'])]
        }
    ]);

    const MATCH_SCOPE_ORDER = Object.freeze(['domain_specific','event_general','generic_relation','fallback']);

    const participantPatternMatches = (intent, pattern) => {
        const semantics = intent?.semantics || {};
        const counterpart = intent?.participants?.find((item) => item.role === 'romantic_counterpart');
        if (pattern === 'romantic_male_to_female_specific') return semantics.querentSex === 'male' && counterpart?.sex === 'female' && counterpart?.specificity === 'specific';
        if (pattern === 'romantic_female_to_male_specific') return semantics.querentSex === 'female' && counterpart?.sex === 'male' && counterpart?.specificity === 'specific';
        if (pattern === 'self_male_prospective_wife') return intent?.event?.type === 'marriage_match' && semantics.querentSex === 'male' && semantics.counterpartSex === 'female' && !intent.participants.some((item) => item.role === 'represented_subject');
        if (pattern === 'self_female_prospective_husband') return intent?.event?.type === 'marriage_match' && semantics.querentSex === 'female' && semantics.counterpartSex === 'male' && !intent.participants.some((item) => item.role === 'represented_subject');
        if (pattern === 'represented_marriage') return intent?.participants?.some((item) => item.role === 'represented_subject');
        if (pattern === 'existing_wife') return intent?.participants?.some((item) => item.role === 'spouse' && item.sex === 'female');
        if (pattern === 'existing_husband') return intent?.participants?.some((item) => item.role === 'spouse' && item.sex === 'male');
        return false;
    };

    const arrayConstraintMatches = (actual, expected) => !Array.isArray(expected) || expected.length === 0 || expected.includes(actual);

    const ruleMatchesIntent = (rule, intent) => {
        if (!intent || intent.status !== 'resolved') return false;
        const applies = rule.appliesTo || {};
        const semantics = intent.semantics || {};
        if (!arrayConstraintMatches(intent.event?.type, applies.eventTypes)) return false;
        if (!arrayConstraintMatches(intent.goals?.[0]?.type, applies.goalTypes)) return false;
        if (!arrayConstraintMatches(intent.expectedState, applies.expectedStates)) return false;
        if (!arrayConstraintMatches(semantics.investmentAction, applies.investmentActions)) return false;
        if (!arrayConstraintMatches(semantics.investmentGoal, applies.investmentGoals)) return false;
        if (!arrayConstraintMatches(semantics.investmentPosition, applies.investmentPositions)) return false;
        if (!arrayConstraintMatches(semantics.incomeType, applies.incomeTypes)) return false;
        if (!arrayConstraintMatches(semantics.deliveryMode, applies.deliveryModes)) return false;
        if (!arrayConstraintMatches(semantics.purchaseGoal, applies.purchaseGoals)) return false;
        if (!arrayConstraintMatches(semantics.transactionPurpose, applies.transactionPurposes)) return false;
        if (!arrayConstraintMatches(semantics.fortuneScope, applies.fortuneScopes)) return false;
        if (Array.isArray(applies.participantPatterns) && applies.participantPatterns.length && !applies.participantPatterns.some((pattern) => participantPatternMatches(intent, pattern))) return false;
        return true;
    };

    const selectObservationRule = (intent, options = {}) => {
        const mode = options.mode === 'research' ? 'research' : 'normal';
        if (!intent) return { status:'unresolved', baseRuleRefs:[], inheritedRuleRefs:[], augmentationRuleRefs:[], candidates:[], issues:[{ type:'empty_intent' }], provisionalCandidates:[] };
        if (intent.status !== 'resolved') return { status:'unresolved', baseRuleRefs:[], inheritedRuleRefs:[], augmentationRuleRefs:[], candidates:[], issues:[{ type:'intent_blocked', reason:intent.blockReason }], provisionalCandidates:[] };

        const matching = OBSERVATION_RULES.filter((rule) => ruleMatchesIntent(rule, intent));
        const enabled = matching.filter((rule) => rule.automationStatus === 'enabled' || (mode === 'research' && rule.automationStatus === 'provisional'));
        const provisionalCandidates = matching.filter((rule) => rule.automationStatus === 'provisional').map((rule) => rule.id);

        if (!enabled.length) {
            return {
                status:'unresolved', baseRuleRefs:[], inheritedRuleRefs:[], augmentationRuleRefs:[], candidates:[], provisionalCandidates,
                issues:[{ type: provisionalCandidates.length ? 'no_enabled_confirmed_rule' : 'no_confirmed_rule', eventType:intent.event?.type || 'unknown' }]
            };
        }

        let chosen = [];
        for (const scope of MATCH_SCOPE_ORDER) {
            const scoped = enabled.filter((rule) => rule.matchScope === scope);
            if (scoped.length) { chosen = scoped; break; }
        }
        if (chosen.length !== 1) {
            return { status:'unresolved', baseRuleRefs:chosen.map((rule) => rule.id), inheritedRuleRefs:[], augmentationRuleRefs:[], candidates:[], provisionalCandidates, issues:[{ type:'rule_conflict', ruleRefs:chosen.map((rule) => rule.id) }] };
        }

        const baseRule = chosen[0];
        const candidates = baseRule.observations.map((item) => ({ ...item, ruleRef:baseRule.id }));
        const augmentationRuleRefs = [];
        AUGMENTATION_RULES.forEach((rule) => {
            if (rule.automationStatus !== 'enabled' && mode !== 'research') return;
            if (!rule.appliesTo.compatibleRuleRefs?.includes(baseRule.id)) return;
            const specificCounterpart = intent.participants?.some((item) => item.role === 'romantic_counterpart' && item.specificity === 'specific');
            if (rule.appliesTo.requiresSpecificCounterpart && !specificCounterpart) return;
            rule.addObservations.forEach((item) => candidates.push({ ...item, ruleRef:rule.id }));
            augmentationRuleRefs.push(rule.id);
        });

        return {
            status:'resolved', baseRuleRefs:[baseRule.id], inheritedRuleRefs:[], augmentationRuleRefs,
            candidates, provisionalCandidates, issues:[]
        };
    };

    const resolveObjectFunctionalRole = (intent) => {
        if (!intent || intent.status !== 'resolved') return 'unknown';
        if (intent.event?.type === 'receive_item' && ['shipped','mail','courier'].includes(intent.semantics?.deliveryMode)) return 'shipment_subject';
        if (intent.event?.type === 'item_purchase') {
            if (intent.semantics?.purchaseGoal === 'usability') return 'functional_tool';
            if (intent.semantics?.purchaseGoal === 'investment') return 'investment_asset';
            return 'unknown';
        }
        return 'unknown';
    };

    GuiJia.liuyaoRuleRegistry = Object.freeze({
        sources:SOURCES,
        evidences:EVIDENCES,
        observationRules:OBSERVATION_RULES,
        augmentationRules:AUGMENTATION_RULES,
        matchScopeOrder:MATCH_SCOPE_ORDER,
        ruleMatchesIntent,
        selectObservationRule,
        resolveObjectFunctionalRole
    });
})(typeof window !== 'undefined' ? window : globalThis);
