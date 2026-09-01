(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForceEvidenceSource?.installed) return;

    const VERSION = '0.1';

    const SOURCES = Object.freeze({
        qianli:Object.freeze({ id:'CF-SRC-QL', title:'《千里命稿》', locator:'强弱篇、六神篇', sourceRole:'modern-primary-text' }),
        yuanhai:Object.freeze({ id:'CF-SRC-YHZP', title:'《渊海子平》', locator:'论正财、五行生克制化等', sourceRole:'classical-compilation' }),
        shenfeng:Object.freeze({ id:'CF-SRC-SFTC', title:'《神峰通考》', locator:'月支正财格、官杀论述', sourceRole:'primary-text' }),
        mingli:Object.freeze({ id:'CF-SRC-MLYY', title:'《命理约言》', locator:'看命总法、看月令法', sourceRole:'primary-text' }),
        ziping:Object.freeze({ id:'CF-SRC-ZPZQ', title:'《子平真诠》', locator:'论十干得时不旺失时不弱', sourceRole:'primary-text' }),
        yujing:Object.freeze({ id:'CF-SRC-YJAJ', title:'《玉井奥诀》', locator:'《三命通会》卷十所录', sourceRole:'embedded-earlier-text' })
    });

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'CF-E01', sourceId:SOURCES.qianli.id, kind:'multi-axis-strength-composition',
            sourcePhrase:'当令／失令、多／少帮扶、多／少克泄、年日时支得气／无气',
            semanticImpact:'《千里命稿》本身把季节、扶抑数量语言与年日时支气拆成多个条件轴，而非单一计数。',
            supports:Object.freeze(['seasonal-standing-axis','support-pressure-separation','branch-qi-axis'])
        }),
        Object.freeze({
            id:'CF-E02', sourceId:SOURCES.qianli.id, kind:'capacity-wealth',
            sourcePhrase:'首须身强，方堪任财',
            semanticImpact:'强弱可以进一步用于解释日主是否足以承受具体功能负载；但“任财”不能反推为通用强弱分类器。',
            supports:Object.freeze(['capacity-semantics','function-specific-load'])
        }),
        Object.freeze({
            id:'CF-E03', sourceId:SOURCES.yuanhai.id, kind:'capacity-wealth',
            sourcePhrase:'力不任财；财多生官，要须身健',
            semanticImpact:'较早传统已使用日主力量与财星负载之间的相对承受语义。',
            supports:Object.freeze(['capacity-semantics','relative-load-bearing'])
        }),
        Object.freeze({
            id:'CF-E04', sourceId:SOURCES.shenfeng.id, kind:'capacity-wealth-and-officer-killing',
            sourcePhrase:'身主有气，则能任之；身势强健，则力能胜此官杀',
            semanticImpact:'“任／胜”不只用于财，也用于官杀压力，支持把承载能力视为更广泛的下游解释语义。',
            supports:Object.freeze(['capacity-semantics','relative-load-bearing','multiple-load-types'])
        }),
        Object.freeze({
            id:'CF-E05', sourceId:SOURCES.ziping.id, kind:'root-enables-capacity',
            sourcePhrase:'四柱有根，便能受财官食神而当伤官七煞',
            semanticImpact:'根基与面对财官食伤七杀等作用的承受能力直接关联，但原文没有给数字换算。',
            supports:Object.freeze(['root-foundation-axis','capacity-semantics','multiple-load-types'])
        }),
        Object.freeze({
            id:'CF-E06', sourceId:SOURCES.ziping.id, kind:'root-quality-hierarchy',
            sourcePhrase:'干多不如根重',
            semanticImpact:'根基质量与明干扶助不能按等值条目计数；Contextual Force 必须保留证据类型与质量层级。',
            supports:Object.freeze(['root-foundation-axis','unequal-evidence-quality','no-equal-item-count'])
        }),
        Object.freeze({
            id:'CF-E07', sourceId:SOURCES.mingli.id, kind:'time-versus-force',
            sourcePhrase:'或得时，或失时，或得势，或失势',
            semanticImpact:'得时与得势是可区分的观察层；季节位置不能替代全局生克扶抑关系。',
            supports:Object.freeze(['seasonal-standing-axis','contextual-force-axis','season-not-total-force'])
        }),
        Object.freeze({
            id:'CF-E08', sourceId:SOURCES.mingli.id, kind:'local-and-global-relations',
            sourcePhrase:'下坐某支，紧贴某干……随看余三干及四支，于日干生克扶抑何如',
            semanticImpact:'力量判断需要同时保留位置、邻接与全柱生克扶抑，不宜只做无位置的五行总数。',
            supports:Object.freeze(['position-context','directed-relation-context','whole-chart-context'])
        }),
        Object.freeze({
            id:'CF-E09', sourceId:SOURCES.mingli.id, kind:'allied-support',
            sourcePhrase:'禄刃比劫……用为日干之助',
            semanticImpact:'比劫、禄刃等可作为扶助候选，但是否得力仍受得时、得势及交互状态影响。',
            supports:Object.freeze(['allied-support-axis','candidate-not-realized-force'])
        }),
        Object.freeze({
            id:'CF-E10', sourceId:SOURCES.yujing.id, kind:'branch-party-and-interaction',
            sourcePhrase:'地支至切，党盛为强',
            semanticImpact:'地支基础、党势与轻重是力量判断核心语义，且需连同冲、拱、刑、合等关系考察。',
            supports:Object.freeze(['branch-foundation-axis','party-configuration','interaction-modifier-axis'])
        }),
        Object.freeze({
            id:'CF-E11', sourceId:SOURCES.yujing.id, kind:'qualitative-comparison',
            sourcePhrase:'何者力轻，何者力重',
            semanticImpact:'来源要求比较轻重，但没有提供通用数字权重；模型必须保留定性比较边界。',
            supports:Object.freeze(['qualitative-force-hierarchy','no-numeric-weight'])
        }),
        Object.freeze({
            id:'CF-E12', sourceId:SOURCES.yuanhai.id, kind:'nonlinear-overabundance',
            sourcePhrase:'土多金埋；水多木漂',
            semanticImpact:'数量增加可能改变生克结果，不能把同方向候选视为线性累加。',
            supports:Object.freeze(['nonlinear-force-semantics','interaction-modifier-axis'])
        })
    ]);

    const AXES = Object.freeze([
        Object.freeze({ id:'seasonalStanding', role:'background', numeric:false, statement:'记录得时／失时或对应季节背景；不单独代表整体力量。' }),
        Object.freeze({ id:'rootFoundation', role:'foundation', numeric:false, statement:'记录本干通根、同类根基及其来源语义；根的存在、质量与实际效力分层。' }),
        Object.freeze({ id:'alliedSupport', role:'support', numeric:false, statement:'记录比劫、印绶等扶助候选与已兑现扶助；候选数量不等于党势。' }),
        Object.freeze({ id:'incomingRestraint', role:'pressure', numeric:false, statement:'记录克我方向及其是否实际兑现。' }),
        Object.freeze({ id:'outboundDrain', role:'pressure', numeric:false, statement:'记录我生方向造成的泄力及其是否实际兑现。' }),
        Object.freeze({ id:'outboundDistribution', role:'pressure-separate', numeric:false, statement:'记录我克之分力；继续独立于克泄，不并入《千里命稿》“克泄”数量轴。' }),
        Object.freeze({ id:'branchQiContext', role:'context', numeric:false, statement:'记录年日时支气状态；不得由单项十二长生直接汇总成得气／无气。' }),
        Object.freeze({ id:'hiddenModifier', role:'modifier', numeric:false, statement:'记录藏干、人元等定性修正候选；本气中气余气不换算数值。' }),
        Object.freeze({ id:'interactionModifier', role:'modifier', numeric:false, statement:'记录刑冲合会及已解析 interaction 对具体 actor/function 的修正；结构存在不等于修正已兑现。' })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({ id:'CF-F01', key:'contextual-force-evidence-model', status:'supported', value:'multi-axis-non-numeric-evidence-profile', evidenceIds:Object.freeze(['CF-E01','CF-E06','CF-E07','CF-E08','CF-E10','CF-E11']) }),
        Object.freeze({ id:'CF-F02', key:'season-equals-total-force', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-E01','CF-E07']) }),
        Object.freeze({ id:'CF-F03', key:'party-equals-item-count', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-E06','CF-E08','CF-E10','CF-E11','CF-E12']) }),
        Object.freeze({ id:'CF-F04', key:'capacity-semantic-direction', status:'supported', value:'relative-load-bearing', evidenceIds:Object.freeze(['CF-E02','CF-E03','CF-E04','CF-E05']) }),
        Object.freeze({ id:'CF-F05', key:'capacity-automatic-rule', status:'not-defined', value:null, evidenceIds:Object.freeze([]) }),
        Object.freeze({ id:'CF-F06', key:'party-configuration-rule', status:'not-defined', value:null, evidenceIds:Object.freeze([]) }),
        Object.freeze({ id:'CF-F07', key:'numeric-force-score', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-E06','CF-E11','CF-E12']) })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-EVIDENCE-CONTRACT-001',
        version:VERSION,
        modelType:'multi-axis-non-numeric-evidence-profile',
        axisCount:AXES.length,
        seasonalStandingSeparate:true,
        rootFoundationSeparate:true,
        alliedSupportSeparate:true,
        restraintDrainDistributionSeparate:true,
        branchQiSeparate:true,
        hiddenModifierSeparate:true,
        interactionModifierSeparate:true,
        partyConfigurationDerived:false,
        partyConfigurationRuleDefined:false,
        capacitySemanticDirection:'relative-load-bearing',
        capacitySemanticDirectionSupported:true,
        capacityInterpretationRuleDefined:false,
        strengthClassificationRuleDefined:false,
        manyFewClassificationRuleDefined:false,
        numericAggregation:false,
        numericWeights:false,
        majorityVoting:false,
        equalItemCounting:false,
        scalarCollapse:false,
        finalAssessmentMapping:false,
        statement:'跨《渊海子平》《神峰通考》《命理约言》《子平真诠》《玉井奥诀》与《千里命稿》的材料支持把日主力量整理为多轴、定性、上下文相关的证据 profile；同时“任／胜／受／当”等语义支持下游 relative-load-bearing 解释。来源并未给出统一党势公式、数字权重或自动强弱／多寡分类器。'
    });

    GuiJia.baziContextualForceEvidenceSource = Object.freeze({
        installed:true,
        VERSION,
        SOURCES,
        EVIDENCE,
        AXES,
        FINDINGS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
