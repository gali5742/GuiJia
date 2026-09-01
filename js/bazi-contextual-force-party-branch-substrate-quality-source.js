(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyBranchSubstrateQualitySource?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT-001';

    const SOURCES = Object.freeze({
        yujing:Object.freeze({
            id:'CF-BSQ-SRC-YJAJ',
            title:'《玉井奥诀》',
            locator:'《三命通会》卷十所录《玉井奥诀》',
            sourceRole:'embedded-earlier-text-with-compiled-commentary'
        }),
        ditian:Object.freeze({
            id:'CF-BSQ-SRC-DTS',
            title:'《滴天髓阐微》',
            locator:'干支总论·任氏注',
            sourceRole:'classic-with-ren-commentary'
        }),
        ziping:Object.freeze({
            id:'CF-BSQ-SRC-ZPZQ',
            title:'《子平真诠》',
            locator:'论喜忌干支有别',
            sourceRole:'primary-text'
        })
    });

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'CF-BSQ-E01', sourceId:SOURCES.yujing.id,
            sourcePhrase:'坐下支神先求其意……首先看此地支与月支一位、时支一位、年支一位，刑冲破害生克比和何如',
            kind:'branch-interaction-and-position-context',
            semanticImpact:'地支质量判断至少需要保存位置与其他地支的关系上下文；不能把单支 presence 当成质量。'
        }),
        Object.freeze({
            id:'CF-BSQ-E02', sourceId:SOURCES.yujing.id,
            sourcePhrase:'月气浅深，何者主权',
            kind:'seasonal-command-context',
            semanticImpact:'月令/时令是地支质量判断的一类独立上下文，但来源没有授权月令单轴替代整体 substrate quality。'
        }),
        Object.freeze({
            id:'CF-BSQ-E03', sourceId:SOURCES.yujing.id,
            sourcePhrase:'何者为主干之宅舍，何者为用神之基业。何者力轻，何者力重',
            kind:'target-contextual-substrate-quality',
            semanticImpact:'宅舍/基业的质量是相对于主干或用神的 target-contextual 语义，不是地支 actor 的全局强弱标签。'
        }),
        Object.freeze({
            id:'CF-BSQ-E04', sourceId:SOURCES.yujing.id,
            sourcePhrase:'一看其力势冲起……二看其力势拱起……三看其力势刑起……四看其力势合起……五看地支统摄',
            kind:'branch-network-context',
            semanticImpact:'冲、拱、刑、合以及地支统摄均可进入质量研究；关系种类与网络形态必须保留，不能只计关系条数。'
        }),
        Object.freeze({
            id:'CF-BSQ-E05', sourceId:SOURCES.yujing.id,
            sourcePhrase:'中间或吉神有刑冲，凶煞有拱合，其生旺休废，交差不一，难下手脚',
            kind:'cross-axis-nontriviality',
            semanticImpact:'关系、吉凶角色与生旺休废可能交叉，不存在由单一轴直接得出 substrate quality 的来源授权。'
        }),
        Object.freeze({
            id:'CF-BSQ-E06', sourceId:SOURCES.yujing.id,
            sourcePhrase:'不如只详四个地支基址，五气中何物最重。将来品量，却能耗散何神，能生扶何神，能冲合何神，能变化何神',
            kind:'relative-force-and-directed-capacity-context',
            semanticImpact:'地支基址质量还与五气相对力量及其对具体对象的耗散、生扶、冲合、变化能力有关；不是 branch-global scalar。'
        }),
        Object.freeze({
            id:'CF-BSQ-E07', sourceId:SOURCES.yujing.id,
            sourcePhrase:'然后却看日干属何五气，与其最重之气统摄何如……参较其物，何者轻，何者重',
            kind:'target-relative-comparison-context',
            semanticImpact:'轻重需要相对于日干、用神及五气统摄作比较；来源没有给出统一数值权重或固定优先级。'
        }),
        Object.freeze({
            id:'CF-BSQ-E08', sourceId:SOURCES.yujing.id,
            sourcePhrase:'若五气中何者党多为重，如支干内外明暗木多，则木气党盛矣',
            kind:'party-density-context',
            semanticImpact:'党势/五气密度属于候选输入，但“党多为重”必须结合内外明暗与整体上下文，不能退化为 surface branch count。'
        }),
        Object.freeze({
            id:'CF-BSQ-E09', sourceId:SOURCES.ditian.id,
            sourcePhrase:'干以载之支为切，支以覆之干为切',
            kind:'covering-stem-context',
            semanticImpact:'地支 substrate quality 需要考虑覆干；这是 branch-directed cover/bearing context，而不是重新寻找 self-root。'
        }),
        Object.freeze({
            id:'CF-BSQ-E10', sourceId:SOURCES.ditian.id,
            sourcePhrase:'如喜寅卯，而覆以甲乙壬癸则生旺，覆以庚辛，则克败矣；忌巳午，而覆以壬癸则制伏，覆以丙丁甲乙，是肆逞矣',
            kind:'covering-stem-directional-outcomes',
            semanticImpact:'覆干可使目标地支在具体喜忌/取用上下文中呈现生旺、克败、制伏、肆逞等不同结果，证明质量是 target-contextual 而非 branch-global。'
        }),
        Object.freeze({
            id:'CF-BSQ-E11', sourceId:SOURCES.ditian.id,
            sourcePhrase:'支受荫于干，干逢生扶，则支之荫盛；干逢克制，则支之荫衰矣',
            kind:'cover-quality-modification',
            semanticImpact:'支之荫可随覆干自身受到生扶或克制而变化，说明 substrate quality 可能需要多步 interaction provenance，不能只看同柱一个静态关系。'
        }),
        Object.freeze({
            id:'CF-BSQ-E12', sourceId:SOURCES.ziping.id,
            sourcePhrase:'支为干之生地，干为支之发用',
            kind:'directed-foundation-boundary',
            semanticImpact:'Branch Substrate Quality 必须继续服从 foundation 的有向关系边界；质量结果不能改写成地支自身 root/effective state。'
        })
    ]);

    const INPUT_FAMILIES = Object.freeze([
        Object.freeze({
            id:'CF-BSQ-I01', key:'covering-stem-context', status:'source-supported-input-family',
            evidenceIds:Object.freeze(['CF-BSQ-E09','CF-BSQ-E10','CF-BSQ-E11']),
            availableProjectContext:'surface stem / bearing / cross-actor interaction provenance',
            resolverStatus:'partial-upstream-semantics-only',
            boundary:'覆干关系可作为输入，但不得从五行生克表直接跳到 substrate quality；需保留 actor、target、realization 与来源范围。'
        }),
        Object.freeze({
            id:'CF-BSQ-I02', key:'branch-interaction-context', status:'source-supported-input-family',
            evidenceIds:Object.freeze(['CF-BSQ-E01','CF-BSQ-E04','CF-BSQ-E05']),
            availableProjectContext:'Structure / branch interaction facts',
            resolverStatus:'interaction-meaning-not-generically-resolved',
            boundary:'刑冲破害、生克比和、冲拱刑合不能按关系数量或固定正负表决。'
        }),
        Object.freeze({
            id:'CF-BSQ-I03', key:'seasonal-command-and-life-state-context', status:'source-supported-input-family',
            evidenceIds:Object.freeze(['CF-BSQ-E02','CF-BSQ-E05']),
            availableProjectContext:'actor-specific seasonal standing / month-command context',
            resolverStatus:'context-available-no-quality-mapping',
            boundary:'生旺休废/月气是独立上下文；不得把旺相休囚死单轴直接映射成 substrate quality。'
        }),
        Object.freeze({
            id:'CF-BSQ-I04', key:'branch-network-and-party-context', status:'source-supported-input-family',
            evidenceIds:Object.freeze(['CF-BSQ-E04','CF-BSQ-E06','CF-BSQ-E07','CF-BSQ-E08']),
            availableProjectContext:'party membership / affiliation / relation-effect / relative-dominance research',
            resolverStatus:'blocked-by-party-relative-force-generalization',
            boundary:'党多/五气最重/统摄不是 raw count，也不能在 Relative Dominance 未解时作为 scalar quality。'
        }),
        Object.freeze({
            id:'CF-BSQ-I05', key:'positional-role-context', status:'source-supported-input-family',
            evidenceIds:Object.freeze(['CF-BSQ-E01','CF-BSQ-E03']),
            availableProjectContext:'pillar/position provenance and anchor-target role',
            resolverStatus:'role-provenance-only',
            boundary:'“坐下支神先求其意”支持位置/角色必须保留，不授权日支固定权重或年/月/日/时统一排行。'
        }),
        Object.freeze({
            id:'CF-BSQ-I06', key:'directed-capacity-context', status:'source-supported-input-family',
            evidenceIds:Object.freeze(['CF-BSQ-E06','CF-BSQ-E07']),
            availableProjectContext:'directed relation effects and target-specific function semantics',
            resolverStatus:'blocked-by-cross-actor-relation-effect-generalization',
            boundary:'能耗散/生扶/冲合/变化何神必须针对具体 target 与已解析 interaction；不能用潜在五行关系冒充已兑现 capacity。'
        })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({ id:'CF-BSQ-F01', key:'substrate-quality-is-target-contextual', status:'supported', value:true, evidenceIds:Object.freeze(['CF-BSQ-E03','CF-BSQ-E06','CF-BSQ-E07','CF-BSQ-E10']) }),
        Object.freeze({ id:'CF-BSQ-F02', key:'covering-stem-is-quality-input', status:'supported', value:true, evidenceIds:Object.freeze(['CF-BSQ-E09','CF-BSQ-E10','CF-BSQ-E11']) }),
        Object.freeze({ id:'CF-BSQ-F03', key:'branch-interactions-are-quality-input', status:'supported', value:true, evidenceIds:Object.freeze(['CF-BSQ-E01','CF-BSQ-E04','CF-BSQ-E05']) }),
        Object.freeze({ id:'CF-BSQ-F04', key:'seasonal-context-is-quality-input', status:'supported', value:true, evidenceIds:Object.freeze(['CF-BSQ-E02','CF-BSQ-E05']) }),
        Object.freeze({ id:'CF-BSQ-F05', key:'party-network-context-is-quality-input', status:'supported', value:true, evidenceIds:Object.freeze(['CF-BSQ-E04','CF-BSQ-E06','CF-BSQ-E08']) }),
        Object.freeze({ id:'CF-BSQ-F06', key:'position-role-context-must-be-preserved', status:'supported', value:true, evidenceIds:Object.freeze(['CF-BSQ-E01','CF-BSQ-E03']) }),
        Object.freeze({ id:'CF-BSQ-F07', key:'branch-presence-is-quality', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-BSQ-E03','CF-BSQ-E05']) }),
        Object.freeze({ id:'CF-BSQ-F08', key:'single-seasonal-axis-resolves-quality', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-BSQ-E02','CF-BSQ-E05']) }),
        Object.freeze({ id:'CF-BSQ-F09', key:'relation-count-resolves-quality', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-BSQ-E04','CF-BSQ-E05','CF-BSQ-E06']) }),
        Object.freeze({ id:'CF-BSQ-F10', key:'party-member-count-resolves-quality', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-BSQ-E06','CF-BSQ-E07','CF-BSQ-E08']) }),
        Object.freeze({ id:'CF-BSQ-F11', key:'universal-position-weight-defined', status:'not-defined', value:null, evidenceIds:Object.freeze(['CF-BSQ-E01','CF-BSQ-E03']) }),
        Object.freeze({ id:'CF-BSQ-F12', key:'universal-cross-axis-priority-defined', status:'not-defined', value:null, evidenceIds:Object.freeze(['CF-BSQ-E05','CF-BSQ-E07']) }),
        Object.freeze({ id:'CF-BSQ-F13', key:'universal-compensation-rule-defined', status:'not-defined', value:null, evidenceIds:Object.freeze(['CF-BSQ-E05','CF-BSQ-E07']) }),
        Object.freeze({ id:'CF-BSQ-F14', key:'automatic-substrate-quality-resolver-defined', status:'not-defined', value:null, evidenceIds:Object.freeze(['CF-BSQ-E03','CF-BSQ-E05','CF-BSQ-E07']) }),
        Object.freeze({ id:'CF-BSQ-F15', key:'quality-is-branch-global-state', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-BSQ-E03','CF-BSQ-E10']) })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        sourceInputFamiliesResolved:true,
        substrateQualityIsTargetContextual:true,
        coveringStemContextRequired:true,
        branchInteractionContextRequired:true,
        seasonalContextRequired:true,
        branchNetworkPartyContextRequired:true,
        positionalRoleContextRequired:true,
        directedCapacityContextRequired:true,
        branchPresenceIsQuality:false,
        seasonalStateAloneResolvesQuality:false,
        relationCountResolvesQuality:false,
        partyMemberCountResolvesQuality:false,
        universalPositionWeightDefined:false,
        universalCrossAxisPriorityDefined:false,
        universalCompensationRuleDefined:false,
        automaticSubstrateQualityResolverDefined:false,
        branchGlobalQualityStateDefined:false,
        rootPresenceMapping:false,
        actorGlobalEffectivenessMapping:false,
        numericWeights:false,
        scalarCollapse:false,
        numericAggregation:false,
        majorityVoting:false,
        priorityAggregation:false,
        ranking:false,
        relativeDominanceMapping:false,
        partyConfigurationMapping:false,
        finalStrengthMapping:false,
        finalAssessmentMapping:false,
        statement:'Branch Substrate Quality Source Audit v0.1 将地支作为宅舍/基业/基址时的质量输入冻结为多上下文、target-contextual 模型：覆干、支间交互、季节/生旺休废、地支统摄/党势、位置角色与定向作用能力均可进入研究，但原典没有提供统一跨轴优先级、补偿规则、数值权重或 automatic quality resolver。'
    });

    GuiJia.baziContextualForcePartyBranchSubstrateQualitySource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCES,
        EVIDENCE,
        INPUT_FAMILIES,
        FINDINGS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
