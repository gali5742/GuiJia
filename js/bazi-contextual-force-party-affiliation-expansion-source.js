(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyAffiliationExpansionSource?.installed) return;

    const VERSION = '0.2';

    const RELATION_TYPES = Object.freeze({
        ANCHOR_AUGMENTATION:'anchor-augmentation',
        ANCHOR_OPPOSITION:'anchor-opposition',
        ANCHOR_MEDIATION:'anchor-mediation'
    });

    const SOURCES = Object.freeze({
        ditianGanzhi:Object.freeze({
            id:'CF-PAE-SRC-DTS-GZ',
            title:'《滴天髓阐微》',
            locator:'干支总论 · 任氏曰',
            sourceRole:'ren-commentary'
        }),
        ditianGuansha:Object.freeze({
            id:'CF-PAE-SRC-DTS-GS',
            title:'《滴天髓阐微》',
            locator:'官杀 · 食神制杀／杀重用印命例',
            sourceRole:'ren-commentary-case-evidence'
        }),
        ditianLiuqin:Object.freeze({
            id:'CF-PAE-SRC-DTS-LQ',
            title:'《滴天髓阐微》',
            locator:'六亲 · 妻',
            sourceRole:'ren-commentary'
        })
    });

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'CF-PAE-E01',
            sourceId:SOURCES.ditianGanzhi.id,
            kind:'wealth-augments-killer',
            sourcePhrase:'身强杀浅，则以财星滋杀',
            relationType:RELATION_TYPES.ANCHOR_AUGMENTATION,
            semanticImpact:'财星对七杀的生助属于增强具体杀星一侧的 directed augmentation；只有既有 target-specific relation 实际兑现时，才有资格进入 affiliation 解释。',
            supports:Object.freeze(['wealth-to-killer-augmentation','target-specific-affiliation-candidate'])
        }),
        Object.freeze({
            id:'CF-PAE-E02',
            sourceId:SOURCES.ditianLiuqin.id,
            kind:'explicit-wealth-party-killer',
            sourcePhrase:'杀重身轻，财星党杀',
            relationType:RELATION_TYPES.ANCHOR_AUGMENTATION,
            semanticImpact:'“党杀”提供直接 party 词义证据：财星在该来源语境中可与杀星结为同侧增强关系；但仍不能脱离具体关系与命局语境写成财星 actor 的永久全局党派。',
            supports:Object.freeze(['wealth-killer-party-language','affiliation-not-global-identity'])
        }),
        Object.freeze({
            id:'CF-PAE-E03',
            sourceId:SOURCES.ditianGanzhi.id,
            kind:'food-god-restrains-killer',
            sourcePhrase:'身杀两停，则以食神制杀',
            relationType:RELATION_TYPES.ANCHOR_OPPOSITION,
            semanticImpact:'食神对七杀的“制”是针对 counter anchor 的 restraining relation；来源没有说“食神党身”，因此不能把 opposition 自动改写为 membership affiliation。',
            supports:Object.freeze(['output-to-killer-opposition','enemy-of-enemy-affiliation-rejected'])
        }),
        Object.freeze({
            id:'CF-PAE-E04',
            sourceId:SOURCES.ditianGuansha.id,
            kind:'restraint-can-support-daymaster-without-membership',
            sourcePhrase:'更妙丙火独透，制杀扶身',
            relationType:RELATION_TYPES.ANCHOR_OPPOSITION,
            semanticImpact:'“制杀”与“扶身”可以在同一命例中形成结果链，但“扶身”描述作用结果，不等于丙火 actor 因此获得日主侧 member 身份。',
            supports:Object.freeze(['opposition-may-benefit-daymaster','effect-outcome-not-membership'])
        }),
        Object.freeze({
            id:'CF-PAE-E05',
            sourceId:SOURCES.ditianGanzhi.id,
            kind:'seal-mediates-killer',
            sourcePhrase:'杀强身弱，则以印绶化杀',
            relationType:RELATION_TYPES.ANCHOR_MEDIATION,
            semanticImpact:'“化杀”与“制杀”不是同一种 relation semantics；印绶承接官杀之生并转为生身路径，更适合作为 mediation/channel，而不是简单 restraining 或双方互换党派。',
            supports:Object.freeze(['seal-killer-mediation','mediation-not-opposition','mediation-not-global-affiliation'])
        }),
        Object.freeze({
            id:'CF-PAE-E06',
            sourceId:SOURCES.ditianGanzhi.id,
            kind:'killer-seal-mutual-sequence',
            sourcePhrase:'甲申戊寅，真为杀印相生',
            relationType:RELATION_TYPES.ANCHOR_MEDIATION,
            semanticImpact:'“杀印相生”要求保留官杀→印的生化方向；不能为了 party 归类把它反写成印→杀的普通 affiliation edge。',
            supports:Object.freeze(['directed-killer-to-seal-generation','edge-direction-preservation'])
        }),
        Object.freeze({
            id:'CF-PAE-E07',
            sourceId:SOURCES.ditianGuansha.id,
            kind:'killer-generates-seal-in-case',
            sourcePhrase:'坐下印绶，七杀皆来生拱，而日主坚固',
            relationType:RELATION_TYPES.ANCHOR_MEDIATION,
            semanticImpact:'命例明确描述七杀生印并最终令日主得益，说明 counter anchor 的输出可经印绶形成 support outcome；这仍不是“七杀归入日主党”。',
            supports:Object.freeze(['anchor-output-to-seal','mediated-support-outcome','anchor-membership-preserved'])
        }),
        Object.freeze({
            id:'CF-PAE-E08',
            sourceId:SOURCES.ditianGuansha.id,
            kind:'wealth-can-strengthen-killer-adversely',
            sourcePhrase:'财坐日下，反去生杀，助纣为虐',
            relationType:RELATION_TYPES.ANCHOR_AUGMENTATION,
            semanticImpact:'财生杀可明确增强杀的作用，因此现有“财生官杀” affiliation 方向有跨命例支持；但来源同时强调命局语境，不能只按五行生克存在就判已归附。',
            supports:Object.freeze(['wealth-to-killer-augmentation','context-required','relation-presence-not-realization'])
        })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({
            id:'CF-PAE-F01', key:'cross-actor-party-relation-taxonomy', status:'supported',
            value:Object.freeze(Object.values(RELATION_TYPES)),
            evidenceIds:Object.freeze(['CF-PAE-E01','CF-PAE-E03','CF-PAE-E05'])
        }),
        Object.freeze({
            id:'CF-PAE-F02', key:'wealth-to-officer-killer-affiliation-semantics', status:'supported-with-context',
            value:'anchor-augmentation-may-form-anchor-specific-affiliation',
            evidenceIds:Object.freeze(['CF-PAE-E01','CF-PAE-E02','CF-PAE-E08'])
        }),
        Object.freeze({
            id:'CF-PAE-F03', key:'output-restrains-killer-equals-daymaster-membership', status:'rejected',
            value:false,
            evidenceIds:Object.freeze(['CF-PAE-E03','CF-PAE-E04'])
        }),
        Object.freeze({
            id:'CF-PAE-F04', key:'seal-transforms-killer-equals-party-switch', status:'rejected',
            value:false,
            evidenceIds:Object.freeze(['CF-PAE-E05','CF-PAE-E06','CF-PAE-E07'])
        }),
        Object.freeze({
            id:'CF-PAE-F05', key:'opposition-benefit-equals-affiliation', status:'rejected',
            value:false,
            evidenceIds:Object.freeze(['CF-PAE-E04'])
        }),
        Object.freeze({
            id:'CF-PAE-F06', key:'anchor-mediation-preserves-edge-direction', status:'required',
            value:true,
            evidenceIds:Object.freeze(['CF-PAE-E06','CF-PAE-E07'])
        }),
        Object.freeze({
            id:'CF-PAE-F07', key:'enemy-of-enemy-membership-shortcut', status:'rejected',
            value:false,
            evidenceIds:Object.freeze(['CF-PAE-E03','CF-PAE-E04','CF-PAE-E05'])
        }),
        Object.freeze({
            id:'CF-PAE-F08', key:'generic-affiliation-expansion-resolver', status:'not-defined',
            value:null,
            evidenceIds:Object.freeze([])
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-AFFILIATION-EXPANSION-SOURCE-AUDIT-CONTRACT-002',
        version:VERSION,
        sourceAuditOnly:true,
        relationTypeTaxonomyDefined:true,
        relationTypes:Object.freeze(Object.values(RELATION_TYPES)),
        wealthAugmentationMaySupportAffiliation:true,
        oppositionIsNotAffiliation:true,
        mediationIsNotAffiliation:true,
        mediationIsNotOpposition:true,
        benefitToDaymasterIsNotMembership:true,
        edgeDirectionMustBePreserved:true,
        relationPresenceIsNotRealization:true,
        actorGlobalPartyFromRelation:false,
        transitiveClosure:false,
        enemyOfEnemyShortcut:false,
        genericAffiliationExpansionResolverDefined:false,
        relativeDominanceResolverDefined:false,
        partyConfigurationDefined:false,
        numericAggregation:false,
        numericWeights:false,
        majorityVoting:false,
        priorityAggregation:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        statement:'来源把财滋杀／党杀、食神制杀、印绶化杀分别呈现为增强、制衡、承接转化三种不同 cross-actor relation semantics。Party 系统必须先保留这些关系类型，再讨论 side-relative force；不得把“制衡对方”或“经印化杀”自动改写成日主侧 membership，也不得把作用结果“扶身”反推为 actor party identity。'
    });

    GuiJia.baziContextualForcePartyAffiliationExpansionSource = Object.freeze({
        installed:true,
        VERSION,
        RELATION_TYPES,
        SOURCES,
        EVIDENCE,
        FINDINGS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
