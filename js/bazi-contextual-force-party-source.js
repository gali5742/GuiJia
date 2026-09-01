(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySource?.installed) return;

    const VERSION = '0.1';

    const SOURCES = Object.freeze({
        mingli:Object.freeze({
            id:'CF-PARTY-SRC-MLYY',
            title:'《命理约言》',
            locator:'看命总法二、看月令法一',
            sourceRole:'primary-text'
        }),
        yujing:Object.freeze({
            id:'CF-PARTY-SRC-YJAJ',
            title:'《玉井奥诀》',
            locator:'《三命通会》卷十所录原诀及其注文',
            sourceRole:'embedded-earlier-text-with-compiled-commentary'
        }),
        ditian:Object.freeze({
            id:'CF-PARTY-SRC-DTS',
            title:'《滴天髓阐微》',
            locator:'众寡',
            sourceRole:'classic-with-original-and-ren-commentary'
        }),
        zipingOriginal:Object.freeze({
            id:'CF-PARTY-SRC-ZPZQ-ORIG',
            title:'《子平真诠》',
            locator:'论十干得时不旺失时不弱',
            sourceRole:'primary-text'
        }),
        xuCommentary:Object.freeze({
            id:'CF-PARTY-SRC-XU-ZPZQ',
            title:'《子平真诠评注》徐乐吾注',
            locator:'论十干得时不旺失时不弱',
            sourceRole:'later-commentary'
        }),
        shenfeng:Object.freeze({
            id:'CF-PARTY-SRC-SFTC',
            title:'《神峰通考》',
            locator:'五星谬说类命例',
            sourceRole:'primary-text-case-evidence'
        })
    });

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'CF-PARTY-E01', sourceId:SOURCES.mingli.id, kind:'time-versus-force-distinction',
            sourcePhrase:'或得时，或失时，或得势，或失势',
            semanticImpact:'得时／失时与得势／失势被并列观察，说明时间地位与全局关系结果不是同一字段。',
            supports:Object.freeze(['time-force-separation','party-is-not-season'])
        }),
        Object.freeze({
            id:'CF-PARTY-E02', sourceId:SOURCES.mingli.id, kind:'party-support-versus-isolation-opposition',
            sourcePhrase:'党多援众，则秋木亦旺；势孤克众，则春木亦弱',
            semanticImpact:'党多援众可改变失时背景，势孤与克众则共同改变得时背景；“势孤”不能简化为单独的同党少。',
            supports:Object.freeze(['party-support-context','opposition-context-required','season-not-total-force'])
        }),
        Object.freeze({
            id:'CF-PARTY-E03', sourceId:SOURCES.mingli.id, kind:'whole-chart-directed-relations',
            sourcePhrase:'下坐某支，紧贴某干……随看余三干及四支，于日干生克扶抑何如',
            semanticImpact:'得势判断依赖位置与全局生克扶抑关系，不能只数同类五行。',
            supports:Object.freeze(['position-context-required','directed-relation-context','whole-chart-context'])
        }),
        Object.freeze({
            id:'CF-PARTY-E04', sourceId:SOURCES.yujing.id, kind:'party-strength-statement',
            sourcePhrase:'地支至切，党盛为强',
            semanticImpact:'党盛与强存在直接来源联系，但原诀没有给出通用 party membership 或数字阈值。',
            supports:Object.freeze(['party-strength-semantic-link','branch-foundation-important','no-universal-threshold'])
        }),
        Object.freeze({
            id:'CF-PARTY-E05', sourceId:SOURCES.yujing.id, kind:'qualitative-weight-and-foundation',
            sourcePhrase:'何者为主干之宅舍，何者为用神之基业。何者力轻，何者力重',
            semanticImpact:'党势需要保留根基、宅舍与轻重差异；不同证据不能等值计数。',
            supports:Object.freeze(['foundation-context-required','qualitative-force-hierarchy','equal-item-count-rejected'])
        }),
        Object.freeze({
            id:'CF-PARTY-E06', sourceId:SOURCES.yujing.id, kind:'interaction-sensitive-party-context',
            sourcePhrase:'一看其力势冲起……拱起……刑起……合起',
            semanticImpact:'地支同党配置要经过冲拱刑合等交互状态解释，结构存在与实际力量修正仍须分层。',
            supports:Object.freeze(['interaction-context-required','structure-presence-not-force'])
        }),
        Object.freeze({
            id:'CF-PARTY-E07', sourceId:SOURCES.yujing.id, kind:'party-can-include-inner-outer-visible-hidden',
            sourcePhrase:'若五气中何者党多为重，如支干内外明暗，木多则木气党盛矣',
            semanticImpact:'《三命通会》所录注文把党势观察扩展到支干、内外、明暗，但仍先要求比较“五气中何物最重”；不能据此建立简单元素个数公式。',
            supports:Object.freeze(['party-scope-not-visible-only','hidden-context-may-matter','qualitative-dominance-required'])
        }),
        Object.freeze({
            id:'CF-PARTY-E08', sourceId:SOURCES.ditian.id, kind:'relational-many-few-original',
            sourcePhrase:'强众而敌寡者，势在去其寡；强寡而敌众者，势在成乎众',
            semanticImpact:'众寡是至少两方的相对关系，且“势”描述双方关系的趋向，不适合压成日主单一全局 party 状态。',
            supports:Object.freeze(['side-relative-configuration','opposing-side-required','relational-force-semantics'])
        }),
        Object.freeze({
            id:'CF-PARTY-E09', sourceId:SOURCES.ditian.id, kind:'ren-commentary-party-example',
            sourcePhrase:'此日主之党众，敌官星之寡',
            semanticImpact:'任氏以日主一方与官星一方对举党众／敌寡，并进一步考察根气、财生官、食伤等关系，支持 side-relative 而非纯数量模型。',
            supports:Object.freeze(['side-relative-configuration','root-and-support-context','directed-relation-context'])
        }),
        Object.freeze({
            id:'CF-PARTY-E10', sourceId:SOURCES.ditian.id, kind:'minority-can-be-strong',
            sourcePhrase:'官星虽寡，得财星扶则强',
            semanticImpact:'“寡”不等于“弱”；少数一方如果得到有力生助仍可转强，直接否定 party size = force 的映射。',
            supports:Object.freeze(['many-few-not-strength','support-quality-required','raw-count-rejected'])
        }),
        Object.freeze({
            id:'CF-PARTY-E11', sourceId:SOURCES.zipingOriginal.id, kind:'season-not-total-strength',
            sourcePhrase:'春木虽强，金太重而木亦危；秋木虽弱，木根深而木亦强',
            semanticImpact:'原文不使用党众公式，但明确说明得时/失时背景可被全局根基与对抗关系改变。',
            supports:Object.freeze(['season-not-total-force','root-foundation-required','opposition-context-required'])
        }),
        Object.freeze({
            id:'CF-PARTY-E12', sourceId:SOURCES.xuCommentary.id, kind:'later-formalization',
            sourcePhrase:'得时为旺，失时为衰；党众为强，助寡为弱',
            semanticImpact:'徐乐吾后注把旺衰与强弱作显式二轴形式化，可作为比较语义，但不能回写成沈孝瞻原文或古典统一规则。',
            supports:Object.freeze(['later-time-force-formalization','provenance-separation-required'])
        }),
        Object.freeze({
            id:'CF-PARTY-E13', sourceId:SOURCES.xuCommentary.id, kind:'later-party-membership-example',
            sourcePhrase:'比劫印绶通根扶助为党众',
            semanticImpact:'后注给出党众成员的明确示例，但这是后期解释层；项目不能未经跨来源核对就把它当成唯一 party membership resolver。',
            supports:Object.freeze(['candidate-party-membership','later-commentary-only','membership-resolver-still-open'])
        }),
        Object.freeze({
            id:'CF-PARTY-E14', sourceId:SOURCES.shenfeng.id, kind:'case-party-overrides-season', chartKey:'甲辰|丙子|己未|戊辰',
            sourcePhrase:'土多亦能化弱为旺',
            semanticImpact:'命例支持失令背景可因同侧力量改变，但只拥有个案校准权，不能提供通用党势阈值。',
            supports:Object.freeze(['case-relative-party-force','case-not-general-rule'])
        })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({
            id:'CF-PARTY-F01', key:'time-versus-party-force', status:'supported',
            value:'separate-but-interacting', evidenceIds:Object.freeze(['CF-PARTY-E01','CF-PARTY-E02','CF-PARTY-E11','CF-PARTY-E12'])
        }),
        Object.freeze({
            id:'CF-PARTY-F02', key:'party-configuration-semantic-shape', status:'supported',
            value:'side-relative-qualitative-configuration', evidenceIds:Object.freeze(['CF-PARTY-E02','CF-PARTY-E04','CF-PARTY-E08','CF-PARTY-E09','CF-PARTY-E10'])
        }),
        Object.freeze({
            id:'CF-PARTY-F03', key:'party-equals-raw-count', status:'rejected',
            value:false, evidenceIds:Object.freeze(['CF-PARTY-E05','CF-PARTY-E07','CF-PARTY-E10','CF-PARTY-E14'])
        }),
        Object.freeze({
            id:'CF-PARTY-F04', key:'party-equals-seasonal-standing', status:'rejected',
            value:false, evidenceIds:Object.freeze(['CF-PARTY-E01','CF-PARTY-E02','CF-PARTY-E11'])
        }),
        Object.freeze({
            id:'CF-PARTY-F05', key:'party-equals-de-shi', status:'not-supported',
            value:false, evidenceIds:Object.freeze(['CF-PARTY-E01','CF-PARTY-E02','CF-PARTY-E08'])
        }),
        Object.freeze({
            id:'CF-PARTY-F06', key:'shi-gu-equals-few-allies-only', status:'rejected',
            value:false, evidenceIds:Object.freeze(['CF-PARTY-E02','CF-PARTY-E08','CF-PARTY-E10'])
        }),
        Object.freeze({
            id:'CF-PARTY-F07', key:'party-membership-scope', status:'partially-supported-no-universal-resolver',
            value:'root-support-visible-hidden-contextual-candidates', evidenceIds:Object.freeze(['CF-PARTY-E05','CF-PARTY-E07','CF-PARTY-E09','CF-PARTY-E13'])
        }),
        Object.freeze({
            id:'CF-PARTY-F08', key:'relative-dominance-requires-quality-and-interaction', status:'required',
            value:true, evidenceIds:Object.freeze(['CF-PARTY-E03','CF-PARTY-E05','CF-PARTY-E06','CF-PARTY-E09','CF-PARTY-E10'])
        }),
        Object.freeze({
            id:'CF-PARTY-F09', key:'later-commentary-provenance-separation', status:'required',
            value:true, evidenceIds:Object.freeze(['CF-PARTY-E12','CF-PARTY-E13'])
        }),
        Object.freeze({
            id:'CF-PARTY-F10', key:'automatic-party-classifier', status:'not-defined',
            value:null, evidenceIds:Object.freeze([])
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-AUDIT-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        semanticModelCandidate:'side-relative-qualitative-party-configuration',
        semanticDirectionSupported:true,
        partySeparateFromSeasonalStanding:true,
        partySeparateFromDeShi:true,
        partyNotRawCount:true,
        partyNotGlobalElementCount:true,
        sideRelative:true,
        opposingSideContextRequired:true,
        rootFoundationContextRequired:true,
        alliedSupportContextRequired:true,
        visibleHiddenContextMayMatter:true,
        interactionContextRequired:true,
        qualitativeForceHierarchyRequired:true,
        shiGuNotEquivalentToFewAllies:true,
        xuCommentaryKeptAsLaterCommentary:true,
        partyMembershipResolverDefined:false,
        relativeDominanceResolverDefined:false,
        deShiResolverDefined:false,
        manyFewMappingDefined:false,
        strengthMappingDefined:false,
        capacityMappingDefined:false,
        numericThresholdDefined:false,
        numericWeightsDefined:false,
        scalarPartyScoreDefined:false,
        finalAssessmentMapping:false,
        statement:'来源支持把党势理解为与时令分离但相互作用的、至少两方相对的定性配置。党势需要考察根基、生扶、对抗、位置、明暗与已解析交互，不能化为同党条数、五行总数或单一季节状态。现阶段只冻结语义形状与来源边界，不定义 party membership、relative dominance 或强弱映射。'
    });

    GuiJia.baziContextualForcePartySource = Object.freeze({
        installed:true,
        VERSION,
        SOURCES,
        EVIDENCE,
        FINDINGS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
