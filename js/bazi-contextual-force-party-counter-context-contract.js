(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCounterContextContract?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-COUNTER-CONTEXT-001';

    const SEASONAL_STATES = Object.freeze({
        spring:Object.freeze({ 木:'旺', 火:'相', 水:'休', 金:'囚', 土:'死' }),
        summer:Object.freeze({ 火:'旺', 土:'相', 木:'休', 水:'囚', 金:'死' }),
        juneEarth:Object.freeze({ 土:'旺', 金:'相', 火:'休', 木:'囚', 水:'死' }),
        autumn:Object.freeze({ 金:'旺', 水:'相', 土:'休', 火:'囚', 木:'死' }),
        winter:Object.freeze({ 水:'旺', 木:'相', 金:'休', 土:'囚', 火:'死' })
    });

    const MONTH_SCOPE = Object.freeze({
        寅:'spring', 卯:'spring',
        巳:'summer', 午:'summer',
        未:'juneEarth',
        申:'autumn', 酉:'autumn',
        亥:'winter', 子:'winter',
        辰:'transitional-unresolved', 戌:'transitional-unresolved', 丑:'transitional-unresolved'
    });

    const SOURCE_RECORDS = Object.freeze([
        Object.freeze({
            id:'CF-CC-S01',
            work:'三命通会',
            section:'论五行旺相休囚死并寄生十二宫',
            evidenceType:'general-five-element-seasonal-state',
            excerpt:'春木旺……夏火旺……六月土旺……秋金旺……冬水旺',
            authorization:'actor-element-seasonal-context',
            boundary:'旺相休囚死是季节状态，不直接生成强弱、吉凶、side dominance。'
        }),
        Object.freeze({
            id:'CF-CC-S02',
            work:'五行精纪',
            section:'五行旺相囚休死例',
            evidenceType:'transition-caution',
            excerpt:'土旺四季，一十八日',
            authorization:'transitional-month-caution',
            boundary:'辰戌丑等过渡月需要更细时间语义；v0.1 不把整月粗略映射为单一状态。'
        }),
        Object.freeze({
            id:'CF-CC-F01',
            work:'子平真诠',
            section:'论十干得时不旺失时不弱',
            evidenceType:'non-daymaster-root-generalization',
            excerpt:'不特日主如此，喜用忌神皆同此论。',
            authorization:'visible-stem-foundation-context',
            boundary:'通根语义可用于非日主天干，但根存在仍不等于根有效或该 side 强。'
        }),
        Object.freeze({
            id:'CF-CC-F02',
            work:'子平真诠',
            section:'论十干得时不旺失时不弱',
            evidenceType:'qualitative-root-distinction',
            excerpt:'长生禄旺，根之重者也；墓库余气，根之轻者也。',
            authorization:'qualitative-root-provenance',
            boundary:'只保留根的来源类别与轻重语义，不转换数字权重。'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-COUNTER-CONTEXT-CONTRACT-001',
        version:VERSION,
        seasonalStateAppliesToActorElement:true,
        seasonalStateIsNotForceClassification:true,
        seasonalStateIsNotRelativeDominance:true,
        transitionalMonthWholeMonthResolverDefined:false,
        visibleStemFoundationGeneralizationAuthorized:true,
        surfaceBranchFoundationResolverDefined:false,
        hiddenActorFoundationResolverDefined:false,
        rootPresenceIsNotEffectiveness:true,
        rootQualityNumericWeightDefined:false,
        scalarCollapse:false,
        numericAggregation:false,
        majorityVoting:false,
        priorityAggregation:false,
        relativeDominanceMapping:false,
        partyConfigurationMapping:false,
        finalStrengthMapping:false,
        statement:'Counter Context v0.1 为每个 counter anchor 建立 actor-specific 季节与根基上下文；只在来源明确授权的 scope 内解析，不复制日主轴，也不把旺相休囚死或通根直接改写为 side force。'
    });

    GuiJia.baziContextualForcePartyCounterContextContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SEASONAL_STATES,
        MONTH_SCOPE,
        SOURCE_RECORDS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
