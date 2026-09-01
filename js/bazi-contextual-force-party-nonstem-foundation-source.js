(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyNonStemFoundationSource?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT-001';

    const SOURCES = Object.freeze({
        ziping:Object.freeze({
            id:'CF-NSF-SRC-ZPZQ',
            title:'《子平真诠》',
            locator:'论喜忌干支有别；论支中喜忌逢运透清',
            sourceRole:'primary-text'
        }),
        yujing:Object.freeze({
            id:'CF-NSF-SRC-YJAJ',
            title:'《玉井奥诀》',
            locator:'《三命通会》卷十所录《玉井奥诀》',
            sourceRole:'embedded-earlier-text-with-compiled-commentary'
        }),
        ditian:Object.freeze({
            id:'CF-NSF-SRC-DTS',
            title:'《滴天髓阐微》',
            locator:'干支总论·任氏注',
            sourceRole:'classic-with-ren-commentary'
        })
    });

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'CF-NSF-E01',
            sourceId:SOURCES.ziping.id,
            sourcePhrase:'干主天，动而有为；支主地，静以待用，且干主一而支藏多',
            kind:'stem-branch-role-distinction',
            semanticImpact:'天干与地支不是同一种 actor 语义；地支具有承载多重支中内容的静态地位，不能机械复用天干 root resolver。'
        }),
        Object.freeze({
            id:'CF-NSF-E02',
            sourceId:SOURCES.ziping.id,
            sourcePhrase:'支为干之生地，干为支之发用',
            kind:'directed-foundation-role',
            semanticImpact:'foundation/root 关系具有方向：支是干的生地/承载基础，干是支的发用。地支自身不是另一个需要向下寻找 root 的天干式 actor。'
        }),
        Object.freeze({
            id:'CF-NSF-E03',
            sourceId:SOURCES.ziping.id,
            sourcePhrase:'有一亥字，则统观四干，有壬甲二字否；有壬，则亥为壬禄；用甲，则亥为甲长生',
            kind:'branch-multi-stem-foundation-capacity',
            semanticImpact:'同一地支可针对不同天干承担不同生地/根基语义；foundation 必须保存 actor-to-branch 关系，不能把地支压成单一 self-root 标签。'
        }),
        Object.freeze({
            id:'CF-NSF-E04',
            sourceId:SOURCES.ziping.id,
            sourcePhrase:'支中喜忌，固与干有别矣，而运逢透清，则静而待用者，正得其用',
            kind:'hidden-content-latent-manifestation',
            semanticImpact:'支中内容的关键后续问题是静待与透清/发用，而不是把“藏于本支”再次登记为自己的 root。'
        }),
        Object.freeze({
            id:'CF-NSF-E05',
            sourceId:SOURCES.yujing.id,
            sourcePhrase:'何者为主干之宅舍，何者为用神之基业；何者力轻，何者力重……不如只详四个地支基址',
            kind:'branch-as-substrate-and-quality-context',
            semanticImpact:'地支在 relative-force 语境中承担宅舍、基业、基址的 substrate 角色，同时质量轻重仍需另行判断；branch presence 本身不是 quality resolver。'
        }),
        Object.freeze({
            id:'CF-NSF-E06',
            sourceId:SOURCES.ditian.id,
            sourcePhrase:'干以载之支为切，支以覆之干为切',
            kind:'cover-bearing-dual-context',
            semanticImpact:'天干看所载之支，地支看所覆之干；地支自身的质量上下文应转向 cover/bearing relation，而不是反复套用通根。'
        }),
        Object.freeze({
            id:'CF-NSF-E07',
            sourceId:SOURCES.ditian.id,
            sourcePhrase:'干通根于支，支逢生扶，则干之根坚；支逢冲克，则干之根拔矣。支受荫于干，干逢生扶，则支之荫盛；干逢克制，则支之荫衰矣',
            kind:'root-versus-branch-cover-quality',
            semanticImpact:'任氏把“干之根”与“支之荫”分成两个方向；root quality 与 branch cover quality 不应合并，也不能把同一 containment 关系重复计力。'
        })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({ id:'CF-NSF-F01', key:'surface-branch-is-foundation-substrate', status:'supported', value:true, evidenceIds:Object.freeze(['CF-NSF-E02','CF-NSF-E05']) }),
        Object.freeze({ id:'CF-NSF-F02', key:'surface-branch-uses-stem-root-resolver', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-NSF-E01','CF-NSF-E02','CF-NSF-E06']) }),
        Object.freeze({ id:'CF-NSF-F03', key:'foundation-relation-is-directed-stem-to-branch', status:'supported', value:true, evidenceIds:Object.freeze(['CF-NSF-E02','CF-NSF-E03']) }),
        Object.freeze({ id:'CF-NSF-F04', key:'same-branch-may-support-multiple-stem-foundation-relations', status:'supported', value:true, evidenceIds:Object.freeze(['CF-NSF-E03']) }),
        Object.freeze({ id:'CF-NSF-F05', key:'hidden-containment-is-independent-self-root', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-NSF-E01','CF-NSF-E02','CF-NSF-E04']) }),
        Object.freeze({ id:'CF-NSF-F06', key:'hidden-actor-needs-manifestation-context', status:'supported', value:true, evidenceIds:Object.freeze(['CF-NSF-E04']) }),
        Object.freeze({ id:'CF-NSF-F07', key:'branch-needs-substrate-quality-context', status:'supported', value:true, evidenceIds:Object.freeze(['CF-NSF-E05','CF-NSF-E06','CF-NSF-E07']) }),
        Object.freeze({ id:'CF-NSF-F08', key:'branch-presence-equals-substrate-quality', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-NSF-E05','CF-NSF-E07']) }),
        Object.freeze({ id:'CF-NSF-F09', key:'hidden-presence-equals-manifestation', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-NSF-E04']) }),
        Object.freeze({ id:'CF-NSF-F10', key:'containment-may-be-counted-again-as-hidden-self-root', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-NSF-E02','CF-NSF-E03','CF-NSF-E04']) }),
        Object.freeze({ id:'CF-NSF-F11', key:'branch-substrate-quality-resolver', status:'not-defined', value:null, evidenceIds:Object.freeze(['CF-NSF-E05','CF-NSF-E06','CF-NSF-E07']) }),
        Object.freeze({ id:'CF-NSF-F12', key:'hidden-manifestation-context-resolver', status:'not-defined', value:null, evidenceIds:Object.freeze(['CF-NSF-E04']) }),
        Object.freeze({ id:'CF-NSF-F13', key:'generic-nonstem-root-resolver', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-NSF-E01','CF-NSF-E02','CF-NSF-E04']) })
    ]);

    const ROLE_SEMANTICS = Object.freeze({
        surfaceBranch:Object.freeze({
            actorScope:'surface-branch',
            semanticRole:'foundation-substrate',
            stemRootResolverApplicable:false,
            presenceIsQuality:false,
            nextRequiredContext:'branch-substrate-quality',
            resolverDefined:false
        }),
        hiddenActor:Object.freeze({
            actorScope:'hidden-modifier',
            semanticRole:'latent-contained-content',
            stemRootResolverApplicable:false,
            containmentIsSelfRoot:false,
            presenceIsManifestation:false,
            nextRequiredContext:'hidden-manifestation-context',
            resolverDefined:false
        }),
        visibleStem:Object.freeze({
            actorScope:'surface-stem',
            semanticRole:'stem-with-directed-foundation-relations',
            stemRootResolverApplicable:true,
            existingCounterContextModel:'visible-stem-root-foundation'
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        nonStemRoleSemanticsResolved:true,
        visibleStemRootModelPreserved:true,
        surfaceBranchIsFoundationSubstrate:true,
        surfaceBranchStemRootResolverApplicable:false,
        hiddenActorIsLatentContainedContent:true,
        hiddenActorStemRootResolverApplicable:false,
        hiddenContainmentIsSelfRoot:false,
        containmentDoubleCountAllowed:false,
        branchPresenceIsSubstrateQuality:false,
        hiddenPresenceIsManifestation:false,
        branchSubstrateQualityResolverDefined:false,
        hiddenManifestationContextResolverDefined:false,
        genericNonStemRootResolverDefined:false,
        rootPresenceIsNotEffectiveness:true,
        substrateRoleIsNotForceClassification:true,
        manifestationIsNotGlobalEffectiveness:true,
        numericWeights:false,
        scalarCollapse:false,
        numericAggregation:false,
        majorityVoting:false,
        priorityAggregation:false,
        relativeDominanceMapping:false,
        partyConfigurationMapping:false,
        finalStrengthMapping:false,
        finalAssessmentMapping:false,
        statement:'Non-Stem Foundation Source Audit v0.1 将天干通根、地支 substrate 与支中 latent content 分为不同语义角色：地支是天干的生地/宅舍/基业，而非再寻找 self-root 的 stem-like actor；藏干的“藏于本支”是 containment，不得重复记作其自身 root。后续分别需要 branch substrate quality 与 hidden manifestation context，当前不实现这两个 resolver。'
    });

    GuiJia.baziContextualForcePartyNonStemFoundationSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCES,
        EVIDENCE,
        FINDINGS,
        ROLE_SEMANTICS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
