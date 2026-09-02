(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-MODERN-SUPPORT-AUDIT-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const SOURCE_TIERS = Object.freeze({
        CLASSICAL_SEMANTIC_AUTHORITY:'classical-semantic-authority',
        MODERN_INDEPENDENT_CORROBORATION:'modern-independent-corroboration',
        MODERN_SCHOOL_SPECIFIC_CALIBRATION:'modern-school-specific-calibration',
        TRANSMISSION_RECEPTION_EVIDENCE:'transmission-reception-evidence'
    });

    const TEXT_VERIFICATION_STATES = Object.freeze({
        FORMAL_EDITION_AND_TRANSCRIPTION_CROSS_CHECKED:'formal-edition-and-transcription-cross-checked',
        FORMAL_EDITION_VERIFIED_TRANSCRIPTION_USED:'formal-edition-verified-transcription-used',
        WEB_TRANSCRIPTION_ONLY:'web-transcription-only'
    });

    const SUPPORT_DIMENSIONS = Object.freeze({
        ACTOR_SET_SEMANTICS:'actor-set-semantics',
        CARDINALITY_PROVENANCE:'cardinality-provenance',
        POSITION_PROVENANCE:'position-provenance',
        RELATION_PATH_ALTERNATIVES:'relation-path-alternatives',
        CONFIGURATION_RELATION_SEPARATION:'configuration-relation-separation',
        RELATION_CAPACITY_NOT_RAW_COUNT:'relation-capacity-not-raw-count',
        ROLE_PRESENCE_NOT_EXECUTION:'role-presence-not-execution'
    });

    const SOURCES = Object.freeze({
        weiQianli:Object.freeze({
            id:'CF-RSMS-SRC-WQL',
            title:'《千里命稿》',
            author:'韦千里',
            era:'民国',
            sourceTier:SOURCE_TIERS.MODERN_INDEPENDENT_CORROBORATION,
            bibliographicState:'formal-edition-verified',
            editionNote:'民国二十四年（1935）韦氏命苑本可由馆藏扫描元数据核验。',
            textVerificationState:TEXT_VERIFICATION_STATES.FORMAL_EDITION_VERIFIED_TRANSCRIPTION_USED,
            executableAuthority:false,
            independentCorroboration:true
        }),
        xuLewu:Object.freeze({
            id:'CF-RSMS-SRC-XLW',
            title:'《子平真诠评注》',
            author:'徐乐吾',
            era:'民国',
            sourceTier:SOURCE_TIERS.MODERN_INDEPENDENT_CORROBORATION,
            bibliographicState:'formal-edition-verified',
            editionNote:'中州古籍出版社1994年版有图书馆与书目记录；本审计使用徐氏评注转录定位语义。',
            textVerificationState:TEXT_VERIFICATION_STATES.FORMAL_EDITION_VERIFIED_TRANSCRIPTION_USED,
            executableAuthority:false,
            independentCorroboration:true
        }),
        liangXiangrun:Object.freeze({
            id:'CF-RSMS-SRC-LXR',
            title:'《子平基础概要》／《沈氏用神例解》',
            author:'梁湘润',
            era:'现代',
            sourceTier:SOURCE_TIERS.MODERN_SCHOOL_SPECIFIC_CALIBRATION,
            bibliographicState:'formal-edition-verified',
            editionNote:'《子平基础概要》行卯出版社版本与《沈氏用神例解》正式著作目录可核验。',
            textVerificationState:TEXT_VERIFICATION_STATES.WEB_TRANSCRIPTION_ONLY,
            executableAuthority:false,
            independentCorroboration:false
        }),
        yuanShushan:Object.freeze({
            id:'CF-RSMS-SRC-YSS',
            title:'《命理探源》',
            author:'袁树珊',
            era:'民国',
            sourceTier:SOURCE_TIERS.TRANSMISSION_RECEPTION_EVIDENCE,
            bibliographicState:'formal-edition-verified',
            editionNote:'正式再版书目信息可核验；本审计的具体段落使用电子转录，且原文明确标注“沈孝瞻曰”，故只作传承／接受史证据，不计作独立横证。',
            textVerificationState:TEXT_VERIFICATION_STATES.FORMAL_EDITION_VERIFIED_TRANSCRIPTION_USED,
            executableAuthority:false,
            independentCorroboration:false
        })
    });

    const EVIDENCE = freezeArray([
        Object.freeze({
            id:'CF-RSMS-E01',
            sourceId:SOURCES.weiQianli.id,
            locator:'官杀并见之去留 · 第十二、十三条',
            sourceExtract:'官杀并见，伤官食神亦并见。',
            sourceTier:SOURCES.weiQianli.sourceTier,
            supports:freezeArray([
                SUPPORT_DIMENSIONS.ACTOR_SET_SEMANTICS,
                SUPPORT_DIMENSIONS.RELATION_CAPACITY_NOT_RAW_COUNT
            ]),
            semanticImpact:'韦千里明确把官杀与伤食分别作为复数 participant 集合讨论，并按哪一类作用较有力决定去官或去杀；这支持 actor-set / collective relation 语义真实存在，但不支持把 collective outcome 自动拆成逐 member realized edge。'
        }),
        Object.freeze({
            id:'CF-RSMS-E02',
            sourceId:SOURCES.weiQianli.id,
            locator:'官杀并见之去留 · 第十三条',
            sourceExtract:'贴近七杀，则以去杀论；贴近正官，则以合官论。',
            sourceTier:SOURCES.weiQianli.sourceTier,
            supports:freezeArray([
                SUPPORT_DIMENSIONS.POSITION_PROVENANCE,
                SUPPORT_DIMENSIONS.RELATION_PATH_ALTERNATIVES,
                SUPPORT_DIMENSIONS.ROLE_PRESENCE_NOT_EXECUTION
            ]),
            semanticImpact:'同一食神同时具有“去杀／合官”的理论可能时，韦千里以贴近对象区分实际 relation interpretation。位置不是事后修饰，而是 relation binding/disambiguation 的来源条件之一。'
        }),
        Object.freeze({
            id:'CF-RSMS-E03',
            sourceId:SOURCES.weiQianli.id,
            locator:'官杀并见之去留 · 第十一条',
            sourceExtract:'庚辛申酉并见……若一庚一申一辛一酉……势必不能。',
            sourceTier:SOURCES.weiQianli.sourceTier,
            supports:freezeArray([
                SUPPORT_DIMENSIONS.CARDINALITY_PROVENANCE,
                SUPPORT_DIMENSIONS.RELATION_CAPACITY_NOT_RAW_COUNT
            ]),
            semanticImpact:'来源把复数 participant composition 与整体作用能力联系起来，但并未给出“每个 actor 等值计一票”的规则；cardinality/composition 应进入 provenance，不能退化为 member-edge count。'
        }),
        Object.freeze({
            id:'CF-RSMS-E04',
            sourceId:SOURCES.xuLewu.id,
            locator:'论偏官 · 程潜命例评注',
            sourceExtract:'年月财生煞旺，时上食以制之。',
            sourceTier:SOURCES.xuLewu.sourceTier,
            supports:freezeArray([
                SUPPORT_DIMENSIONS.POSITION_PROVENANCE,
                SUPPORT_DIMENSIONS.RELATION_PATH_ALTERNATIVES
            ]),
            semanticImpact:'徐乐吾在具体命例中以年月／时上的位置组织财→杀与食→杀两条 relation path，说明 relation 不是仅由十神角色存在决定。'
        }),
        Object.freeze({
            id:'CF-RSMS-E05',
            sourceId:SOURCES.xuLewu.id,
            locator:'论偏官 · 同一命例换位说明',
            sourceExtract:'如辛在年月，则为食神生财，财生煞之局。',
            sourceTier:SOURCES.xuLewu.sourceTier,
            supports:freezeArray([
                SUPPORT_DIMENSIONS.POSITION_PROVENANCE,
                SUPPORT_DIMENSIONS.RELATION_PATH_ALTERNATIVES,
                SUPPORT_DIMENSIONS.ROLE_PRESENCE_NOT_EXECUTION
            ]),
            semanticImpact:'同一组食神、财、七杀角色，仅改变位置即可从“食制杀”解释转成“食→财→杀”链；因此 source-backed competing relation paths 必须作为独立 resolver 问题保存。'
        }),
        Object.freeze({
            id:'CF-RSMS-E06',
            sourceId:SOURCES.liangXiangrun.id,
            locator:'《子平基础概要》食神条网络转录',
            sourceExtract:'食神之制七杀要在前一位相制。',
            sourceTier:SOURCES.liangXiangrun.sourceTier,
            supports:freezeArray([
                SUPPORT_DIMENSIONS.POSITION_PROVENANCE
            ]),
            semanticImpact:'梁湘润把特定相对位置直接纳入“食神制七杀”的解释条件，可作为现代学派对 position-sensitive semantics 的校准；但该具体“前一位”规则不得升级为跨文献通用 binding rule。',
            universalRuleAuthorization:false
        }),
        Object.freeze({
            id:'CF-RSMS-E07',
            sourceId:SOURCES.liangXiangrun.id,
            locator:'《沈氏用神例解》目录／制式',
            sourceExtract:'宾主生克异位喜忌制；三联生克制。',
            sourceTier:SOURCES.liangXiangrun.sourceTier,
            supports:freezeArray([
                SUPPORT_DIMENSIONS.POSITION_PROVENANCE,
                SUPPORT_DIMENSIONS.RELATION_PATH_ALTERNATIVES
            ]),
            semanticImpact:'梁氏体系把异位生克与三联生克单列为方法维度，进一步说明现代实践中“position + relation path”被视为独立问题；这里只作 school-specific calibration。',
            universalRuleAuthorization:false
        }),
        Object.freeze({
            id:'CF-RSMS-E08',
            sourceId:SOURCES.yuanShushan.id,
            locator:'《命理探源》论生克先后分吉凶',
            sourceExtract:'沈孝瞻曰：七煞同是财食并透，而先后大殊。',
            sourceTier:SOURCES.yuanShushan.sourceTier,
            supports:freezeArray([
                SUPPORT_DIMENSIONS.POSITION_PROVENANCE,
                SUPPORT_DIMENSIONS.RELATION_PATH_ALTERNATIVES,
                SUPPORT_DIMENSIONS.CONFIGURATION_RELATION_SEPARATION
            ]),
            semanticImpact:'袁树珊明确传录沈氏“同是财食并透而先后大殊”的结构，可证明这一 position-sensitive relation semantics 在民国命理整理中持续被接受；因其标明“沈孝瞻曰”，不得计作独立作者横证。',
            independentCorroboration:false
        })
    ]);

    const FINDINGS = freezeArray([
        Object.freeze({ id:'CF-RSMS-F01', key:'modern-independent-support-for-actor-set-semantics', status:'supported', value:true, evidenceIds:freezeArray(['CF-RSMS-E01','CF-RSMS-E03']) }),
        Object.freeze({ id:'CF-RSMS-F02', key:'relation-position-provenance-is-required-input', status:'supported', value:true, evidenceIds:freezeArray(['CF-RSMS-E02','CF-RSMS-E04','CF-RSMS-E05']) }),
        Object.freeze({ id:'CF-RSMS-F03', key:'competing-source-backed-relation-paths-exist', status:'supported', value:true, evidenceIds:freezeArray(['CF-RSMS-E02','CF-RSMS-E04','CF-RSMS-E05']) }),
        Object.freeze({ id:'CF-RSMS-F04', key:'same-role-inventory-implies-same-executable-relation', status:'rejected', value:false, evidenceIds:freezeArray(['CF-RSMS-E02','CF-RSMS-E05']) }),
        Object.freeze({ id:'CF-RSMS-F05', key:'collective-outcome-expands-to-member-edges', status:'rejected', value:false, evidenceIds:freezeArray(['CF-RSMS-E01','CF-RSMS-E03']) }),
        Object.freeze({ id:'CF-RSMS-F06', key:'liang-position-rule-is-universal-traditional-binding-rule', status:'rejected', value:false, evidenceIds:freezeArray(['CF-RSMS-E06','CF-RSMS-E07']) }),
        Object.freeze({ id:'CF-RSMS-F07', key:'yuan-transmission-counts-as-independent-corroboration', status:'rejected', value:false, evidenceIds:freezeArray(['CF-RSMS-E08']) }),
        Object.freeze({ id:'CF-RSMS-F08', key:'relation-position-provenance-resolver', status:'not-defined', value:null, evidenceIds:freezeArray([]) }),
        Object.freeze({ id:'CF-RSMS-F09', key:'competing-relation-path-resolver', status:'not-defined', value:null, evidenceIds:freezeArray([]) })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-MODERN-SUPPORT-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        sourceTiers:freezeArray(Object.values(SOURCE_TIERS)),
        modernIndependentCorroborationCanSupportSchema:true,
        modernIndependentCorroborationCanOverrideClassicalSemantics:false,
        modernSchoolSpecificCalibrationCanDefineUniversalRule:false,
        transmissionReceptionEvidenceCountsAsIndependentCorroboration:false,
        webTranscriptionAloneCanAuthorizeExecutableRule:false,
        actorSetSemanticsCrossLiteratureSupported:true,
        relationPositionProvenanceRequired:true,
        competingRelationPathsSupported:true,
        sameRoleInventoryEqualsSameExecutableRelation:false,
        rawCardinalityEqualsRelationCapacity:false,
        collectiveOutcomeExpandsToMemberEdges:false,
        relationPositionProvenanceResolverDefined:false,
        competingRelationPathResolverDefined:false,
        targetSemanticLevelResolverDefined:false,
        actorGroupIdentityContractDefined:false,
        collectiveRelationEffectExecutionDefined:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        statement:'近现代横向材料支持 actor-set、cardinality provenance、position-sensitive relation semantics 与 competing relation paths 的独立存在；但现代作者不得覆盖古典语义，梁湘润等学派规则只作校准，袁树珊转录前说只作传承证据。机器因此需要保存 position provenance 并另设 relation-path disambiguation，而不能仅凭十神角色共现生成 relation execution。'
    });

    GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCE_TIERS,
        TEXT_VERIFICATION_STATES,
        SUPPORT_DIMENSIONS,
        SOURCES,
        EVIDENCE,
        FINDINGS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
