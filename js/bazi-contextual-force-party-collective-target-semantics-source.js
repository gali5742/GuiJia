(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCollectiveTargetSemanticsSource?.installed) return;

    const expansionSource = GuiJia.baziContextualForcePartyAffiliationExpansionSource || null;
    const calibrationSource = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource || null;
    if (!expansionSource || !calibrationSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-TARGET-SEMANTICS-SOURCE-AUDIT-001';
    const freezeArray = (items = []) => Object.freeze([...items]);
    const freezeRecord = (item = {}) => Object.freeze({
        ...item,
        evidenceIds:freezeArray(item.evidenceIds || []),
        exampleCaseIds:freezeArray(item.exampleCaseIds || []),
        lexicalMarkers:freezeArray(item.lexicalMarkers || []),
        authorizedInferences:freezeArray(item.authorizedInferences || []),
        forbiddenInferences:freezeArray(item.forbiddenInferences || [])
    });

    const TARGET_SEMANTIC_LEVELS = Object.freeze({
        SINGLE_ACTOR:'single-actor',
        ACTOR_SET:'actor-set',
        ROLE_CLASS:'role-class',
        CONFIGURATION:'configuration'
    });

    const SOURCES = Object.freeze({
        ditianGuansha:Object.freeze({
            id:'CF-CTS-SRC-DTS-GS',
            title:'《滴天髓阐微》',
            locator:'通神论 · 官杀 · 任氏曰／食神制杀格／杀重用印格／制杀太过格',
            sourceRole:'ren-commentary-theory-and-case-evidence',
            sourceUrl:'https://zh.wikisource.org/zh-hans/滴天髓阐微'
        }),
        existingExpansion:Object.freeze({
            id:'CF-CTS-SRC-PAE',
            title:'现有 Party Affiliation Expansion Source Audit v0.2',
            locator:'CF-PAE-E01/E03/E05/E07',
            sourceRole:'existing-source-registry-evidence'
        }),
        existingCalibration:Object.freeze({
            id:'CF-CTS-SRC-VMEC',
            title:'现有 Visible Motif E2E Calibration Source Audit v0.1',
            locator:'OPPOSITION_CASES / MEDIATION_CASES',
            sourceRole:'existing-exact-chart-provenance-audit'
        })
    });

    const SOURCE_EVIDENCE = freezeArray([
        freezeRecord({
            id:'CF-CTS-E01',
            sourceId:SOURCES.ditianGuansha.id,
            semanticLevel:TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR,
            sourcePhrase:'独杀乘权，无制伏……；以一位取为权贵。',
            lexicalMarkers:['独杀','一位'],
            semanticImpact:'来源明确存在单数／唯一性表达，说明“杀”有时可被限定为单一实例；但 lexical singularity 本身仍不等于机器 actorKey，必须结合具体命局与 scope 解析。',
            authorizedInferences:['source-language-can-distinguish-singular-role-instance'],
            forbiddenInferences:['lexical-singular-directly-equals-actor-key']
        }),
        freezeRecord({
            id:'CF-CTS-E02',
            sourceId:SOURCES.ditianGuansha.id,
            semanticLevel:TARGET_SEMANTIC_LEVELS.ACTOR_SET,
            sourcePhrase:'独杀乘权……；众杀有制。',
            lexicalMarkers:['独杀','众杀'],
            semanticImpact:'同一段理论直接对举“独杀”与“众杀”，证明来源并不把所有“杀”都默认为单一 actor；复数同类实例可以作为一个 collective role-instance set 被整体描述。',
            authorizedInferences:['collective-same-role-instance-reference-exists'],
            forbiddenInferences:['collective-reference-can-be-split-into-independent-pairwise-outcomes']
        }),
        freezeRecord({
            id:'CF-CTS-E03',
            sourceId:SOURCES.ditianGuansha.id,
            semanticLevel:TARGET_SEMANTIC_LEVELS.ACTOR_SET,
            sourcePhrase:'此造四柱皆杀……时透食神制杀……一将当关，群凶自败。',
            lexicalMarkers:['四柱皆杀','制杀','群凶'],
            exampleCaseIds:['CF-VMEC-OPP-CASE-01'],
            semanticImpact:'具体命例把一个食神的“制杀”结果落在“群凶”整体语义上；文本没有把结果复制到每个七杀实例，因此 collective effect target 与 pairwise target-specific edge 必须分层。',
            authorizedInferences:['opposition-may-target-collective-killer-instances'],
            forbiddenInferences:['group-outcome-duplicates-to-all-member-edges','group-outcome-selects-nearest-member']
        }),
        freezeRecord({
            id:'CF-CTS-E04',
            sourceId:SOURCES.ditianGuansha.id,
            semanticLevel:TARGET_SEMANTIC_LEVELS.ACTOR_SET,
            sourcePhrase:'庚金并透……丙火独透，制杀扶身。',
            lexicalMarkers:['并透','独透','制杀'],
            exampleCaseIds:['CF-VMEC-OPP-CASE-02'],
            semanticImpact:'同一命例同时明确“庚金并透”与“丙火独透”，来源能够区分复数 target manifestation 与单一 source manifestation；“制杀”却没有继续细分庚金成员。',
            authorizedInferences:['visible-same-role-multiple-manifestations-can-be-grouped-in-source-description'],
            forbiddenInferences:['parallel-visible-manifestations-imply-one-effect-edge-per-member']
        }),
        freezeRecord({
            id:'CF-CTS-E05',
            sourceId:SOURCES.ditianGuansha.id,
            semanticLevel:TARGET_SEMANTIC_LEVELS.ACTOR_SET,
            sourcePhrase:'此造两杀当权临旺……年干壬水临申，足以制杀。',
            lexicalMarkers:['两杀','制杀'],
            exampleCaseIds:['CF-VMEC-OPP-CASE-04'],
            semanticImpact:'数量词“两杀”明确指定同类 role instance cardinality；后续“制杀”仍以集合语义描述作用结果，没有选择其中一个七杀。',
            authorizedInferences:['source-can-express-finite-role-instance-cardinality'],
            forbiddenInferences:['finite-cardinality-authorizes-machine-group-membership-without-scope-resolution']
        }),
        freezeRecord({
            id:'CF-CTS-E06',
            sourceId:SOURCES.existingExpansion.id,
            semanticLevel:TARGET_SEMANTIC_LEVELS.ROLE_CLASS,
            sourcePhrase:'身杀两停，则以食神制杀；杀强身弱，则以印绶化杀。',
            lexicalMarkers:['食神制杀','印绶化杀'],
            evidenceIds:['CF-PAE-E03','CF-PAE-E05'],
            semanticImpact:'理论句没有提供某一命局 actor identity，而是定义食神、七杀、印绶之间的 role-pattern semantics；这是 role-class authorization，不是 exact actor execution。',
            authorizedInferences:['role-class-relation-motif-authorization'],
            forbiddenInferences:['role-class-rule-directly-creates-chart-edge']
        }),
        freezeRecord({
            id:'CF-CTS-E07',
            sourceId:SOURCES.ditianGuansha.id,
            semanticLevel:TARGET_SEMANTIC_LEVELS.CONFIGURATION,
            sourcePhrase:'若杀重而身轻……；苟杀微而制过……；官杀混杂来问我，有可有不可。',
            lexicalMarkers:['杀重身轻','杀微制过','官杀混杂'],
            semanticImpact:'这些表达描述的是命局状态、相对态势或组合条件，而不是一个可被直接寻址的 actor / actor set。Configuration semantics 必须与 relation target identity 分层。',
            authorizedInferences:['aggregate-killer-configuration-language-exists'],
            forbiddenInferences:['configuration-state-equals-actor-group-identity','configuration-state-equals-numeric-force-score']
        }),
        freezeRecord({
            id:'CF-CTS-E08',
            sourceId:SOURCES.ditianGuansha.id,
            semanticLevel:TARGET_SEMANTIC_LEVELS.CONFIGURATION,
            sourcePhrase:'杀势猖狂；支全杀局；制杀太过。',
            lexicalMarkers:['杀势','杀局','制杀太过'],
            semanticImpact:'“势”“局”“太过”把七杀放在 configuration / state 层描述；不能因为包含“杀”字就降格为单一或有限 actor group。',
            authorizedInferences:['killer-force-or-configuration-state-can-be-described-non-actorwise'],
            forbiddenInferences:['state-language-reified-as-edge-target','state-language-implies-scalar-score']
        }),
        freezeRecord({
            id:'CF-CTS-E09',
            sourceId:SOURCES.existingCalibration.id,
            semanticLevel:TARGET_SEMANTIC_LEVELS.ACTOR_SET,
            sourcePhrase:'坐下印绶，七杀皆来生拱，而日主坚固。',
            lexicalMarkers:['七杀皆来','生拱'],
            evidenceIds:['CF-PAE-E07'],
            exampleCaseIds:['CF-VMEC-MED-CASE-01'],
            semanticImpact:'“皆来”证明 collective source semantics 同样存在于 mediation；且该例 mediator 落在支中印绶，说明 role-instance set 还可能跨 visible / branch-hidden scope，不能把 actor set 预设为 visible-only。',
            authorizedInferences:['collective-source-semantics-exists','collective-role-instance-membership-may-be-cross-scope'],
            forbiddenInferences:['actor-set-is-visible-only','cross-scope-collective-semantics-automatically-creates-cross-scope-edges']
        })
    ]);

    const LEVEL_SUMMARY = Object.freeze(Object.values(TARGET_SEMANTIC_LEVELS).reduce((acc, level) => {
        const evidence = SOURCE_EVIDENCE.filter((item) => item.semanticLevel === level);
        acc[level] = Object.freeze({
            level,
            supported:evidence.length > 0,
            evidenceIds:freezeArray(evidence.map((item) => item.id)),
            lexicalMarkers:freezeArray([...new Set(evidence.flatMap((item) => item.lexicalMarkers || []))])
        });
        return acc;
    }, {}));

    const FINDINGS = freezeArray([
        freezeRecord({
            id:'CF-CTS-F01', key:'traditional-target-semantic-levels', status:'supported',
            value:freezeArray(Object.values(TARGET_SEMANTIC_LEVELS)),
            evidenceIds:SOURCE_EVIDENCE.map((item) => item.id)
        }),
        freezeRecord({
            id:'CF-CTS-F02', key:'collective-same-role-instance-semantics', status:'supported',
            value:true,
            evidenceIds:['CF-CTS-E02','CF-CTS-E03','CF-CTS-E04','CF-CTS-E05','CF-CTS-E09']
        }),
        freezeRecord({
            id:'CF-CTS-F03', key:'group-effect-can-be-expanded-to-member-edges', status:'rejected',
            value:false,
            evidenceIds:['CF-CTS-E03','CF-CTS-E04','CF-CTS-E05']
        }),
        freezeRecord({
            id:'CF-CTS-F04', key:'finite-actor-group-identity-contract', status:'not-defined',
            value:null,
            evidenceIds:['CF-CTS-E03','CF-CTS-E04','CF-CTS-E05','CF-CTS-E09']
        }),
        freezeRecord({
            id:'CF-CTS-F05', key:'target-semantic-level-resolver', status:'not-defined',
            value:null,
            evidenceIds:SOURCE_EVIDENCE.map((item) => item.id)
        }),
        freezeRecord({
            id:'CF-CTS-F06', key:'collective-effect-execution-resolver', status:'not-defined',
            value:null,
            evidenceIds:['CF-CTS-E03','CF-CTS-E04','CF-CTS-E05','CF-CTS-E09']
        }),
        freezeRecord({
            id:'CF-CTS-F07', key:'opposition-actor-specific-calibration-is-required-by-source', status:'rejected',
            value:false,
            evidenceIds:['CF-CTS-E03','CF-CTS-E04','CF-CTS-E05']
        }),
        freezeRecord({
            id:'CF-CTS-F08', key:'role-class-rule-equals-chart-execution', status:'rejected',
            value:false,
            evidenceIds:['CF-CTS-E06']
        }),
        freezeRecord({
            id:'CF-CTS-F09', key:'configuration-equals-actor-group', status:'rejected',
            value:false,
            evidenceIds:['CF-CTS-E07','CF-CTS-E08']
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-TARGET-SEMANTICS-SOURCE-AUDIT-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        targetSemanticLevels:freezeArray(Object.values(TARGET_SEMANTIC_LEVELS)),
        singularRoleInstanceLanguageSupported:true,
        collectiveRoleInstanceLanguageSupported:true,
        roleClassLanguageSupported:true,
        configurationLanguageSupported:true,
        collectiveSemanticsMayBeCrossScope:true,
        targetSemanticLevelResolverDefined:false,
        actorGroupIdentityContractDefined:false,
        crossScopeRoleInstanceGroupIdentityDefined:false,
        collectiveRelationEffectExecutionDefined:false,
        groupOutcomeExpandsToMemberEdges:false,
        lexicalSingularEqualsActorKey:false,
        roleClassRuleCreatesChartEdge:false,
        configurationEqualsActorGroup:false,
        configurationEqualsNumericScore:false,
        numericAggregation:false,
        numericWeights:false,
        majorityVoting:false,
        ranking:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        statement:'传统来源明确区分单一同类实例、多个同类实例集合、通用于某类十神的 role-class 规则，以及“杀势／杀重／官杀混杂”等 configuration 状态。Party relation target 必须先解析语义层级，再讨论 identity 与 execution；collective 文本不得拆写成多个 member edge，configuration 也不得物化成 actor group 或数值分数。'
    });

    GuiJia.baziContextualForcePartyCollectiveTargetSemanticsSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        TARGET_SEMANTIC_LEVELS,
        SOURCES,
        SOURCE_EVIDENCE,
        LEVEL_SUMMARY,
        FINDINGS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
