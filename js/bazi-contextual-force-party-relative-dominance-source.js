(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelativeDominanceSource?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT-001';

    const SOURCES = Object.freeze({
        mingli:Object.freeze({
            id:'CF-RD-SRC-MLYY',
            title:'《命理约言》',
            locator:'看命总法二、看月令法一',
            sourceRole:'primary-text'
        }),
        yujing:Object.freeze({
            id:'CF-RD-SRC-YJAJ',
            title:'《玉井奥诀》',
            locator:'《三命通会》卷十所录原诀及注文',
            sourceRole:'embedded-earlier-text-with-compiled-commentary'
        }),
        ditian:Object.freeze({
            id:'CF-RD-SRC-DTS',
            title:'《滴天髓阐微》',
            locator:'众寡',
            sourceRole:'classic-with-original-and-ren-commentary'
        }),
        ziping:Object.freeze({
            id:'CF-RD-SRC-ZPZQ',
            title:'《子平真诠》',
            locator:'论十干得时不旺失时不弱',
            sourceRole:'primary-text'
        })
    });

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'CF-RD-E01', sourceId:SOURCES.mingli.id, upstreamEvidenceIds:Object.freeze(['CF-PARTY-E01','CF-PARTY-E02']),
            sourcePhrase:'或得时，或失时，或得势，或失势；党多援众，则秋木亦旺；势孤克众，则春木亦弱',
            kind:'season-versus-relative-force',
            semanticImpact:'得时／失时与得势／失势必须分轴；党援与对抗可以改变季节背景，但原文没有给出统一换算函数。'
        }),
        Object.freeze({
            id:'CF-RD-E02', sourceId:SOURCES.mingli.id, upstreamEvidenceIds:Object.freeze(['CF-PARTY-E03']),
            sourcePhrase:'下坐某支，紧贴某干……随看余三干及四支，于日干生克扶抑何如',
            kind:'whole-chart-directed-context',
            semanticImpact:'相对力量判断需要位置与全局定向关系，不能只比较同党成员数。'
        }),
        Object.freeze({
            id:'CF-RD-E03', sourceId:SOURCES.yujing.id, upstreamEvidenceIds:Object.freeze(['CF-PARTY-E04','CF-PARTY-E05']),
            sourcePhrase:'地支至切，党盛为强；何者为主干之宅舍，何者为用神之基业。何者力轻，何者力重',
            kind:'foundation-and-qualitative-force',
            semanticImpact:'来源允许讨论党盛与强，但同时要求区分宅舍、基业、力轻力重；不同证据不得等值计数。'
        }),
        Object.freeze({
            id:'CF-RD-E04', sourceId:SOURCES.yujing.id, upstreamEvidenceIds:Object.freeze(['CF-PARTY-E06','CF-PARTY-E07']),
            sourcePhrase:'一看其力势冲起……拱起……刑起……合起；若五气中何者党多为重，如支干内外明暗，木多则木气党盛矣',
            kind:'interaction-and-visible-hidden-context',
            semanticImpact:'支干内外明暗可进入党势观察，但实际力势仍受冲拱刑合影响；范围扩大不等于给出数值权重。'
        }),
        Object.freeze({
            id:'CF-RD-E05', sourceId:SOURCES.ditian.id, upstreamEvidenceIds:Object.freeze(['CF-PARTY-E08']),
            sourcePhrase:'强众而敌寡者，势在去其寡；强寡而敌众者，势在成乎众',
            kind:'force-and-quantity-separated',
            semanticImpact:'“强”与“众／寡”在同一句中作为不同限定并存，证明 force qualifier 与 quantity qualifier 不能合并为一个字段。'
        }),
        Object.freeze({
            id:'CF-RD-E06', sourceId:SOURCES.ditian.id, upstreamEvidenceIds:Object.freeze(['CF-PARTY-E09','CF-PARTY-E10']),
            sourcePhrase:'此日主之党众，敌官星之寡；官星虽寡，得财星扶则强',
            kind:'minority-augmentation-without-dominance',
            semanticImpact:'少数一侧可以因财星生扶而转强；因此众寡不等于强弱，单条 augmentation 也只限定该 anchor 的力量状态，不能直接判双方胜负。'
        }),
        Object.freeze({
            id:'CF-RD-E07', sourceId:SOURCES.ziping.id, upstreamEvidenceIds:Object.freeze(['CF-PARTY-E11']),
            sourcePhrase:'春木虽强，金太重而木亦危；秋木虽弱，木根深而木亦强',
            kind:'season-background-overridden-by-foundation-or-opposition',
            semanticImpact:'季节状态只是背景；根深与对抗强度都可能改变结论，但原文仍未给出跨维度通用优先级。'
        })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({
            id:'CF-RD-F01', key:'quantity-and-force-are-separate-axes', status:'required', value:true,
            evidenceIds:Object.freeze(['CF-RD-E05','CF-RD-E06'])
        }),
        Object.freeze({
            id:'CF-RD-F02', key:'relative-dominance-is-side-relative', status:'supported', value:true,
            evidenceIds:Object.freeze(['CF-RD-E01','CF-RD-E05','CF-RD-E06'])
        }),
        Object.freeze({
            id:'CF-RD-F03', key:'seasonal-standing-is-context-not-dominance', status:'required', value:true,
            evidenceIds:Object.freeze(['CF-RD-E01','CF-RD-E07'])
        }),
        Object.freeze({
            id:'CF-RD-F04', key:'foundation-quality-must-remain-distinct', status:'required', value:true,
            evidenceIds:Object.freeze(['CF-RD-E03','CF-RD-E07'])
        }),
        Object.freeze({
            id:'CF-RD-F05', key:'directed-support-opposition-must-remain-distinct', status:'required', value:true,
            evidenceIds:Object.freeze(['CF-RD-E02','CF-RD-E06','CF-RD-E07'])
        }),
        Object.freeze({
            id:'CF-RD-F06', key:'interaction-context-must-remain-distinct', status:'required', value:true,
            evidenceIds:Object.freeze(['CF-RD-E04'])
        }),
        Object.freeze({
            id:'CF-RD-F07', key:'visible-hidden-scope-is-not-equal-weight', status:'required', value:true,
            evidenceIds:Object.freeze(['CF-RD-E03','CF-RD-E04'])
        }),
        Object.freeze({
            id:'CF-RD-F08', key:'minority-can-be-qualitatively-strong', status:'supported', value:true,
            evidenceIds:Object.freeze(['CF-RD-E06'])
        }),
        Object.freeze({
            id:'CF-RD-F09', key:'relation-effect-count-equals-dominance', status:'rejected', value:false,
            evidenceIds:Object.freeze(['CF-RD-E02','CF-RD-E03','CF-RD-E06'])
        }),
        Object.freeze({
            id:'CF-RD-F10', key:'member-count-equals-dominance', status:'rejected', value:false,
            evidenceIds:Object.freeze(['CF-RD-E03','CF-RD-E05','CF-RD-E06'])
        }),
        Object.freeze({
            id:'CF-RD-F11', key:'universal-cross-axis-priority-rule', status:'not-defined', value:null,
            evidenceIds:Object.freeze(['CF-RD-E01','CF-RD-E03','CF-RD-E04','CF-RD-E07'])
        }),
        Object.freeze({
            id:'CF-RD-F12', key:'automatic-relative-dominance-resolver', status:'not-defined', value:null,
            evidenceIds:Object.freeze([])
        })
    ]);

    const REQUIRED_INPUT_FAMILIES = Object.freeze([
        'side-membership-and-anchor-identity',
        'seasonal-standing-context',
        'root-and-foundation-context',
        'directed-augmentation-opposition-mediation',
        'visible-hidden-context',
        'resolved-interaction-context',
        'position-and-whole-chart-context'
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        sideRelative:true,
        quantityAndForceSeparate:true,
        seasonalStandingSeparate:true,
        foundationSeparate:true,
        relationEffectsSeparate:true,
        interactionContextSeparate:true,
        visibleHiddenScopeMayMatter:true,
        memberCountIsNotDominance:true,
        relationEffectCountIsNotDominance:true,
        realizedEffectPresenceIsNotDominance:true,
        minorityCanBeStrong:true,
        universalCrossAxisPriorityDefined:false,
        universalCompensationRuleDefined:false,
        qualitativeSideForceProfileDefined:false,
        automaticRelativeDominanceResolverDefined:false,
        partyConfigurationMappingDefined:false,
        numericAggregation:false,
        numericWeights:false,
        scalarForceScore:false,
        majorityVoting:false,
        priorityAggregation:false,
        thresholdClassification:false,
        finalStrengthMapping:false,
        finalAssessmentMapping:false,
        requiredInputFamilies:REQUIRED_INPUT_FAMILIES,
        statement:'来源支持把 relative dominance 理解为至少两侧之间的定性力量关系，但“众寡”与“强弱”必须分轴，季节、根基、生扶／制衡／承接、明暗范围、位置与已解析交互也必须保持独立 provenance。现有原文没有给出可执行的跨轴统一优先级、补偿公式或数值权重，因此本阶段只冻结比较输入语义与禁止换算，不实现双方胜负 resolver。'
    });

    GuiJia.baziContextualForcePartyRelativeDominanceSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCES,
        EVIDENCE,
        FINDINGS,
        REQUIRED_INPUT_FAMILIES,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
