(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQianliQuantityCrossLiteratureSource?.installed) return;

    const VERSION = '0.1';

    const SOURCES = Object.freeze({
        mingliYueyan:Object.freeze({ id:'QL-XLR-SRC-MLYY', title:'《命理约言》', locator:'看月令法一', sourceRole:'primary-text' }),
        shenfeng:Object.freeze({ id:'QL-XLR-SRC-SFTC', title:'《神峰通考》', locator:'五星谬说类命例与身旺论述', sourceRole:'primary-text' }),
        ditian:Object.freeze({ id:'QL-XLR-SRC-DTS', title:'《滴天髓阐微》', locator:'衰旺', sourceRole:'commentarial-classic' }),
        sanmingKoujue:Object.freeze({ id:'QL-XLR-SRC-SM-KJ', title:'《三命通会》', locator:'卷十·看命口诀六', sourceRole:'compiled-classic' }),
        yujing:Object.freeze({ id:'QL-XLR-SRC-YJ', title:'《玉井奥诀》', locator:'《三命通会》所录“地支至切，党盛为强”', sourceRole:'embedded-earlier-text' }),
        yuanli:Object.freeze({ id:'QL-XLR-SRC-YL', title:'《元理赋》', locator:'《三命通会》卷十二所录', sourceRole:'embedded-earlier-text' })
    });

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'QL-XLR-E01', sourceId:SOURCES.mingliYueyan.id, kind:'relative-force-over-season',
            sourcePhrase:'党多援众，则秋木亦旺；势孤克众，则春木亦弱',
            semanticImpact:'季节旺衰不是单独分类器；党势与受克状态可改变整体强弱。',
            supports:Object.freeze(['seasonal-context-required','relative-party-force'])
        }),
        Object.freeze({
            id:'QL-XLR-E02', sourceId:SOURCES.mingliYueyan.id, kind:'scoped-count-language',
            sourcePhrase:'只可一二点克神，多克必倒',
            semanticImpact:'来源确有数量词，但陈素庵明确将其作为张楠特定经验法讨论，并非跨情境统一阈值。',
            supports:Object.freeze(['count-language-can-be-source-scoped','no-universal-threshold'])
        }),
        Object.freeze({
            id:'QL-XLR-E03', sourceId:SOURCES.shenfeng.id, kind:'case-season-overridden-by-party', chartKey:'甲辰|丙子|己未|戊辰',
            sourcePhrase:'土多亦能化弱为旺',
            semanticImpact:'失令背景下，原局同党聚集可改变强弱判断；“多”在这里描述的是具体命局中的相对党势。',
            supports:Object.freeze(['relative-party-force','case-context-required'])
        }),
        Object.freeze({
            id:'QL-XLR-E04', sourceId:SOURCES.ditian.id, kind:'root-quality-over-visible-count',
            sourcePhrase:'天干得一比肩，不如地支得一余气墓库',
            semanticImpact:'明干条数与根气不能按等值 item 处理。',
            supports:Object.freeze(['unequal-evidence-quality','branch-root-quality-required'])
        }),
        Object.freeze({
            id:'QL-XLR-E05', sourceId:SOURCES.ditian.id, kind:'root-quality-over-visible-count',
            sourcePhrase:'得二比肩，不如支中得一长生禄旺',
            semanticImpact:'两个明干扶助仍可能不及一个更有力的根；简单多数或等值计数被直接否定。',
            supports:Object.freeze(['unequal-evidence-quality','equal-item-count-rejected'])
        }),
        Object.freeze({
            id:'QL-XLR-E06', sourceId:SOURCES.ditian.id, kind:'summary-hierarchy',
            sourcePhrase:'干多不如根重',
            semanticImpact:'数量必须服从力量层级与根气质量。',
            supports:Object.freeze(['qualitative-force-hierarchy-required','equal-item-count-rejected'])
        }),
        Object.freeze({
            id:'QL-XLR-E07', sourceId:SOURCES.ditian.id, kind:'case-strong-with-branch-foundation', chartKey:'甲辰|丁卯|甲子|戊辰',
            sourcePhrase:'木太旺者似金也',
            semanticImpact:'旺度由月令、两辰余气、东方与水势共同形成，不可只由表层同类条数解释。',
            supports:Object.freeze(['multi-axis-context-required','branch-root-quality-required'])
        }),
        Object.freeze({
            id:'QL-XLR-E08', sourceId:SOURCES.ditian.id, kind:'case-visible-support-without-root-insufficient', chartKey:'乙丑|甲申|甲申|辛未',
            sourcePhrase:'木无盘根之处',
            semanticImpact:'即使天干有木，地支无可依之根时仍可判为太衰；表层同类出现不等于足够力量。',
            supports:Object.freeze(['branch-root-quality-required','surface-presence-not-force'])
        }),
        Object.freeze({
            id:'QL-XLR-E09', sourceId:SOURCES.sanmingKoujue.id, kind:'many-few-plus-light-heavy',
            sourcePhrase:'当论多寡，分轻重也',
            semanticImpact:'多寡与轻重被并列要求判断，不能把“多/少”缩成纯条数。',
            supports:Object.freeze(['qualitative-force-hierarchy-required','many-few-not-raw-count'])
        }),
        Object.freeze({
            id:'QL-XLR-E10', sourceId:SOURCES.yujing.id, kind:'party-force-and-branch-priority',
            sourcePhrase:'地支至切，党盛为强',
            semanticImpact:'党盛属于强弱判断核心语义，且地支的宅舍、基业、轻重与冲拱刑合需要一并考察。',
            supports:Object.freeze(['relative-party-force','branch-context-required','interaction-context-required'])
        }),
        Object.freeze({
            id:'QL-XLR-E11', sourceId:SOURCES.yujing.id, kind:'qualitative-comparison',
            sourcePhrase:'何者力轻，何者力重',
            semanticImpact:'来源要求比较力量轻重，但没有提供数字权重。',
            supports:Object.freeze(['qualitative-force-hierarchy-required','no-numeric-weight'])
        }),
        Object.freeze({
            id:'QL-XLR-E12', sourceId:SOURCES.yuanli.id, kind:'overabundance-changes-relation-effect',
            sourcePhrase:'土多金埋；水多木漂',
            semanticImpact:'“更多生扶来源”并不必然线性增加目标力量，太过可改变生克结果。',
            supports:Object.freeze(['interaction-state-required','nonlinear-force-semantics'])
        })
    ]);

    const CASES = Object.freeze([
        Object.freeze({
            id:'QL-XLR-C01', sourceEvidenceIds:Object.freeze(['QL-XLR-E03']), chartKey:'甲辰|丙子|己未|戊辰',
            lesson:'失令不自动等于弱；具体命局中的同党聚集可改变判断。',
            generalizationAuthority:false
        }),
        Object.freeze({
            id:'QL-XLR-C02', sourceEvidenceIds:Object.freeze(['QL-XLR-E07']), chartKey:'甲辰|丁卯|甲子|戊辰',
            lesson:'同一方向力量由月令、根气、拱会与生扶共同构成，不能只数表层同类。',
            generalizationAuthority:false
        }),
        Object.freeze({
            id:'QL-XLR-C03', sourceEvidenceIds:Object.freeze(['QL-XLR-E08']), chartKey:'乙丑|甲申|甲申|辛未',
            lesson:'明干出现多个同类而无盘根，仍可能不足；presence 与 force 必须分开。',
            generalizationAuthority:false
        })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({ id:'QL-XLR-F01', key:'many-few-semantic-direction', status:'supported', value:'contextual-relative-force', evidenceIds:Object.freeze(['QL-XLR-E01','QL-XLR-E03','QL-XLR-E09','QL-XLR-E10']) }),
        Object.freeze({ id:'QL-XLR-F02', key:'equal-item-count-generalization', status:'rejected', value:false, evidenceIds:Object.freeze(['QL-XLR-E04','QL-XLR-E05','QL-XLR-E06','QL-XLR-E08']) }),
        Object.freeze({ id:'QL-XLR-F03', key:'qualitative-force-hierarchy', status:'required', value:true, evidenceIds:Object.freeze(['QL-XLR-E04','QL-XLR-E05','QL-XLR-E06','QL-XLR-E09','QL-XLR-E11']) }),
        Object.freeze({ id:'QL-XLR-F04', key:'seasonal-and-branch-context', status:'required', value:true, evidenceIds:Object.freeze(['QL-XLR-E01','QL-XLR-E03','QL-XLR-E07','QL-XLR-E10']) }),
        Object.freeze({ id:'QL-XLR-F05', key:'interaction-state', status:'required', value:true, evidenceIds:Object.freeze(['QL-XLR-E10','QL-XLR-E12']) }),
        Object.freeze({ id:'QL-XLR-F06', key:'universal-numeric-threshold', status:'not-attested', value:null, evidenceIds:Object.freeze(['QL-XLR-E02','QL-XLR-E09','QL-XLR-E11']) }),
        Object.freeze({ id:'QL-XLR-F07', key:'automatic-classifier', status:'not-defined', value:null, evidenceIds:Object.freeze([]) })
    ]);

    const CONTRACT = Object.freeze({
        id:'QIANLI-QUANTITY-CROSS-LITERATURE-RESEARCH-CONTRACT-001',
        version:VERSION,
        crossLiteratureSemanticDirection:'contextual-relative-force',
        crossLiteratureSemanticDirectionSupported:true,
        manyFewEqualsRawItemCount:false,
        equalItemCountingAccepted:false,
        qualitativeForceHierarchyRequired:true,
        seasonalContextRequired:true,
        branchRootQualityRequired:true,
        interactionContextRequired:true,
        universalNumericThresholdDefined:false,
        numericForceWeightsDefined:false,
        executableGeneralizationRuleDefined:false,
        automaticClassifierDefined:false,
        statement:'多部传统文献与命例共同支持把“多／少”理解为带季节、党势、根气、轻重与交互状态的相对力量描述；这些证据足以否定等值条目计数，却仍不足以直接生成任意命盘的可执行分类器。'
    });

    GuiJia.baziQianliQuantityCrossLiteratureSource = Object.freeze({
        installed:true,
        VERSION,
        SOURCES,
        EVIDENCE,
        CASES,
        FINDINGS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);