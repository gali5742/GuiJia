(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource?.installed) return;

    const collectiveSource = GuiJia.baziContextualForcePartyCollectiveTargetSemanticsSource || null;
    if (!collectiveSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-CONTRACT-SOURCE-AUDIT-001';
    const freezeArray = (items = []) => Object.freeze([...items]);
    const freezeRecord = (item = {}) => Object.freeze({
        ...item,
        lexicalMarkers:freezeArray(item.lexicalMarkers || []),
        evidenceDimensions:freezeArray(item.evidenceDimensions || []),
        requiredGates:freezeArray(item.requiredGates || []),
        blockerReasons:freezeArray(item.blockerReasons || []),
        sourceEvidenceIds:freezeArray(item.sourceEvidenceIds || [])
    });

    const TARGET_SEMANTIC_LEVELS = collectiveSource.TARGET_SEMANTIC_LEVELS;
    const SOURCE_CONTEXT_TYPES = Object.freeze({
        THEORY_GENERAL:'theory-general',
        CHART_CASE:'chart-case',
        MIXED_COMMENTARY:'mixed-commentary'
    });
    const PREDICATE_TYPES = Object.freeze({
        RELATION_EVENT:'relation-event',
        GENERALIZED_RELATION_RULE:'generalized-relation-rule',
        CONFIGURATION_STATE:'configuration-state',
        INSTANCE_DESCRIPTION:'instance-description'
    });
    const RESOLUTION_STATES = Object.freeze({
        SOURCE_CONTRACT_ONLY:'source-contract-only',
        UNRESOLVED:'unresolved',
        MIXED_SPAN_REQUIRES_SEGMENTATION:'mixed-span-requires-segmentation',
        INSUFFICIENT_BINDING_PROVENANCE:'insufficient-binding-provenance'
    });

    const EVIDENCE_DIMENSIONS = Object.freeze({
        TARGET_SPAN_IDENTITY:'target-span-identity',
        SOURCE_CONTEXT_TYPE:'source-context-type',
        PREDICATE_TYPE:'predicate-type',
        TARGET_ROLE_IDENTITY:'target-role-identity',
        CHART_LOCAL_CANDIDATE_BINDING:'chart-local-candidate-binding',
        CARDINALITY_BINDING:'cardinality-binding',
        SCOPE_PROVENANCE:'scope-provenance',
        MIXED_SPAN_SEGMENTATION:'mixed-span-segmentation'
    });

    const SOURCES = Object.freeze({
        ditianGuansha:Object.freeze({
            id:'CF-RTLC-SRC-DTS-GS',
            title:'《滴天髓阐微》',
            locator:'通神论 · 官杀 · 任氏曰／制杀太过格／六亲·妻',
            sourceRole:'ren-commentary-theory-and-case-evidence',
            sourceUrl:'https://ctext.org/wiki.pl?chapter=826601&if=gb&remap=gb'
        }),
        collectiveAudit:Object.freeze({
            id:'CF-RTLC-SRC-CTS',
            title:'现有 Collective Target Semantics Source Audit v0.1',
            locator:'CF-CTS-E01..E09',
            sourceRole:'existing-target-level-source-audit'
        })
    });

    const LEVEL_GATE_CONTRACTS = Object.freeze({
        [TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR]:freezeRecord({
            level:TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR,
            requiredGates:[
                EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,
                EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,
                EVIDENCE_DIMENSIONS.PREDICATE_TYPE,
                EVIDENCE_DIMENSIONS.TARGET_ROLE_IDENTITY,
                EVIDENCE_DIMENSIONS.CHART_LOCAL_CANDIDATE_BINDING,
                EVIDENCE_DIMENSIONS.SCOPE_PROVENANCE
            ],
            statement:'Single actor 不是“独／一”字样本身，而是 relation target span 在 chart case 中能被唯一绑定到稳定 actor identity，并保留 scope provenance。',
            boundary:'理论句中的“一杀／一官”、case 中未完成 scope/actorKey 绑定的“独杀”，都不能仅凭单数词直接判为 executable single actor target。'
        }),
        [TARGET_SEMANTIC_LEVELS.ACTOR_SET]:freezeRecord({
            level:TARGET_SEMANTIC_LEVELS.ACTOR_SET,
            requiredGates:[
                EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,
                EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,
                EVIDENCE_DIMENSIONS.PREDICATE_TYPE,
                EVIDENCE_DIMENSIONS.TARGET_ROLE_IDENTITY,
                EVIDENCE_DIMENSIONS.CHART_LOCAL_CANDIDATE_BINDING,
                EVIDENCE_DIMENSIONS.CARDINALITY_BINDING,
                EVIDENCE_DIMENSIONS.SCOPE_PROVENANCE
            ],
            statement:'Actor set 需要来源 collective/cardinality 语义与 chart-local candidate set 对齐，并证明 membership completeness 与 scope；不能只因同十神或同五行自动组团。',
            boundary:'即使 actor set identity 日后成立，collective outcome 仍保持 group-level provenance，不自动复制成每个 member edge。'
        }),
        [TARGET_SEMANTIC_LEVELS.ROLE_CLASS]:freezeRecord({
            level:TARGET_SEMANTIC_LEVELS.ROLE_CLASS,
            requiredGates:[
                EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,
                EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,
                EVIDENCE_DIMENSIONS.PREDICATE_TYPE,
                EVIDENCE_DIMENSIONS.TARGET_ROLE_IDENTITY
            ],
            statement:'Role class 适用于理论／通则中的十神角色关系，relation target 被角色类型指称而没有 chart-local actor binding。',
            boundary:'理论句即使出现“一杀”这类单数措辞，也不因此获得 chart actor identity；role-class authorization 不直接创建 chart edge。'
        }),
        [TARGET_SEMANTIC_LEVELS.CONFIGURATION]:freezeRecord({
            level:TARGET_SEMANTIC_LEVELS.CONFIGURATION,
            requiredGates:[
                EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,
                EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,
                EVIDENCE_DIMENSIONS.PREDICATE_TYPE
            ],
            statement:'Configuration 是“杀重／杀微／杀势／杀局／官杀混杂”等状态、相对态势或组合 predicate 的语义对象，不是可寻址 actor identity。',
            boundary:'Configuration 不得物化为 actor group、member set、effect edge 或 numeric force score。'
        })
    });

    const AUDIT_CASES = freezeArray([
        freezeRecord({
            id:'CF-RTLC-CASE-01',
            sourceId:SOURCES.ditianGuansha.id,
            sourceText:'一杀而食伤并见，制杀太过，官助之，非混也。',
            targetSpan:'杀 / 之',
            lexicalMarkers:['一杀','制杀太过','官助之'],
            sourceContextType:SOURCE_CONTEXT_TYPES.THEORY_GENERAL,
            predicateType:PREDICATE_TYPES.GENERALIZED_RELATION_RULE,
            expectedTargetLevel:TARGET_SEMANTIC_LEVELS.ROLE_CLASS,
            evidenceDimensions:[EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,EVIDENCE_DIMENSIONS.PREDICATE_TYPE,EVIDENCE_DIMENSIONS.TARGET_ROLE_IDENTITY],
            sourceEvidenceIds:['CF-CTS-E01','CF-CTS-E06','CF-CTS-E08'],
            lexicalShortcutRejected:true,
            statement:'“一杀”出现在无具体四柱的通则句中；它可以表达角色数量条件，却不能因此绑定某个 chart actor。relation target 在这里仍是 role-class。'
        }),
        freezeRecord({
            id:'CF-RTLC-CASE-02',
            sourceId:SOURCES.ditianGuansha.id,
            sourceText:'若杀重而身轻……杀重身轻，财星党杀。',
            targetSpan:'党杀中的“杀”',
            contextSpan:'杀重身轻',
            lexicalMarkers:['杀重身轻','党杀'],
            sourceContextType:SOURCE_CONTEXT_TYPES.THEORY_GENERAL,
            predicateType:PREDICATE_TYPES.GENERALIZED_RELATION_RULE,
            expectedTargetLevel:TARGET_SEMANTIC_LEVELS.ROLE_CLASS,
            contextSemanticLevel:TARGET_SEMANTIC_LEVELS.CONFIGURATION,
            evidenceDimensions:[EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,EVIDENCE_DIMENSIONS.PREDICATE_TYPE,EVIDENCE_DIMENSIONS.TARGET_ROLE_IDENTITY,EVIDENCE_DIMENSIONS.MIXED_SPAN_SEGMENTATION],
            sourceEvidenceIds:['CF-CTS-E07'],
            mixedSemanticStatement:true,
            statement:'同一句可同时以 configuration 作为条件、以 role class 作为 relation target；target level 必须解析 target span，而不是给整句贴一个标签。'
        }),
        freezeRecord({
            id:'CF-RTLC-CASE-03',
            sourceId:SOURCES.ditianGuansha.id,
            sourceText:'身杀两停，则以食神制杀。',
            targetSpan:'制杀中的“杀”',
            contextSpan:'身杀两停',
            lexicalMarkers:['两停','食神制杀'],
            sourceContextType:SOURCE_CONTEXT_TYPES.THEORY_GENERAL,
            predicateType:PREDICATE_TYPES.GENERALIZED_RELATION_RULE,
            expectedTargetLevel:TARGET_SEMANTIC_LEVELS.ROLE_CLASS,
            contextSemanticLevel:TARGET_SEMANTIC_LEVELS.CONFIGURATION,
            evidenceDimensions:[EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,EVIDENCE_DIMENSIONS.PREDICATE_TYPE,EVIDENCE_DIMENSIONS.TARGET_ROLE_IDENTITY,EVIDENCE_DIMENSIONS.MIXED_SPAN_SEGMENTATION],
            sourceEvidenceIds:['CF-CTS-E06'],
            mixedSemanticStatement:true,
            statement:'“两停”描述身与杀的 configuration balance；“食神制杀”则授权 role-class relation motif。两者不能被 sentence-level resolver 压成同一 level。'
        }),
        freezeRecord({
            id:'CF-RTLC-CASE-04',
            sourceId:SOURCES.ditianGuansha.id,
            sourceText:'庚金并透……更妙丙火独透，制杀扶身。',
            chartKey:'庚申|庚辰|甲戌|丙寅',
            targetSpan:'制杀中的“杀”',
            lexicalMarkers:['庚金并透','丙火独透','制杀'],
            sourceContextType:SOURCE_CONTEXT_TYPES.CHART_CASE,
            predicateType:PREDICATE_TYPES.RELATION_EVENT,
            expectedTargetLevel:TARGET_SEMANTIC_LEVELS.ACTOR_SET,
            chartLocalCandidateKeys:['visible:0:庚','visible:1:庚'],
            sourceActorKeys:['visible:3:丙'],
            explicitCardinality:2,
            evidenceDimensions:[EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,EVIDENCE_DIMENSIONS.PREDICATE_TYPE,EVIDENCE_DIMENSIONS.TARGET_ROLE_IDENTITY,EVIDENCE_DIMENSIONS.CHART_LOCAL_CANDIDATE_BINDING,EVIDENCE_DIMENSIONS.CARDINALITY_BINDING,EVIDENCE_DIMENSIONS.SCOPE_PROVENANCE],
            sourceEvidenceIds:['CF-CTS-E04'],
            groupOutcomeExpandsToMemberEdges:false,
            statement:'Case context、并透语义与两个 visible 庚 candidate 可以共同支持 actor-set denotation；但这仍不授权把“制杀扶身”复制为两条 realized member edge。'
        }),
        freezeRecord({
            id:'CF-RTLC-CASE-05',
            sourceId:SOURCES.ditianGuansha.id,
            sourceText:'此造两杀当权临旺……年干壬水临申，足以制杀。',
            chartKey:'壬申|丙午|庚午|丙戌',
            targetSpan:'制杀中的“杀”',
            lexicalMarkers:['两杀','制杀'],
            sourceContextType:SOURCE_CONTEXT_TYPES.CHART_CASE,
            predicateType:PREDICATE_TYPES.RELATION_EVENT,
            expectedTargetLevel:TARGET_SEMANTIC_LEVELS.ACTOR_SET,
            chartLocalCandidateKeys:['visible:1:丙','visible:3:丙'],
            sourceActorKeys:['visible:0:壬'],
            explicitCardinality:2,
            evidenceDimensions:[EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,EVIDENCE_DIMENSIONS.PREDICATE_TYPE,EVIDENCE_DIMENSIONS.TARGET_ROLE_IDENTITY,EVIDENCE_DIMENSIONS.CHART_LOCAL_CANDIDATE_BINDING,EVIDENCE_DIMENSIONS.CARDINALITY_BINDING,EVIDENCE_DIMENSIONS.SCOPE_PROVENANCE],
            sourceEvidenceIds:['CF-CTS-E05'],
            groupOutcomeExpandsToMemberEdges:false,
            statement:'数量词“两杀”只有在具体 chart candidate inventory 与 role/scope 对齐后，才有资格支持有限 actor-set identity。'
        }),
        freezeRecord({
            id:'CF-RTLC-CASE-06',
            sourceId:SOURCES.ditianGuansha.id,
            sourceText:'时逢独杀，四食相制……所赖亥中甲木卫杀。',
            chartKey:'辛卯|戊戌|丙辰|己亥',
            targetSpan:'独杀 / 制杀对象',
            lexicalMarkers:['独杀','四食相制'],
            sourceContextType:SOURCE_CONTEXT_TYPES.CHART_CASE,
            predicateType:PREDICATE_TYPES.RELATION_EVENT,
            expectedTargetLevel:TARGET_SEMANTIC_LEVELS.SINGLE_ACTOR,
            candidateScope:'hidden-branch',
            stableActorKey:null,
            evidenceDimensions:[EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,EVIDENCE_DIMENSIONS.PREDICATE_TYPE,EVIDENCE_DIMENSIONS.TARGET_ROLE_IDENTITY,EVIDENCE_DIMENSIONS.SCOPE_PROVENANCE],
            sourceEvidenceIds:['CF-CTS-E01'],
            blockerReasons:['singular-language-does-not-provide-stable-machine-actor-key','singular-target-is-not-visible-only'],
            bindingResolved:false,
            statement:'此例证明 chart case 中的“独杀”可以是 singular denotation，但仍可能落在 hidden/branch scope；没有稳定 actorKey binding 时，词面 singularity 不能被直接执行。'
        }),
        freezeRecord({
            id:'CF-RTLC-CASE-07',
            sourceId:SOURCES.ditianGuansha.id,
            sourceText:'若杀重而身轻……苟杀微而制过……杀势猖狂；支全杀局；制杀太过。',
            targetSpan:'杀重 / 杀微 / 杀势 / 杀局 / 制杀太过所描述的状态',
            lexicalMarkers:['杀重','杀微','杀势','杀局','制杀太过'],
            sourceContextType:SOURCE_CONTEXT_TYPES.THEORY_GENERAL,
            predicateType:PREDICATE_TYPES.CONFIGURATION_STATE,
            expectedTargetLevel:TARGET_SEMANTIC_LEVELS.CONFIGURATION,
            evidenceDimensions:[EVIDENCE_DIMENSIONS.TARGET_SPAN_IDENTITY,EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,EVIDENCE_DIMENSIONS.PREDICATE_TYPE],
            sourceEvidenceIds:['CF-CTS-E07','CF-CTS-E08'],
            statement:'这些 predicate 描述 aggregate state / relative condition；即使含“杀”字，也没有 actor-addressable target identity。'
        }),
        freezeRecord({
            id:'CF-RTLC-CASE-08',
            sourceId:SOURCES.ditianGuansha.id,
            sourceText:'独杀乘权，无制伏，职居清要；众杀有制，主通根，身掌权衡。',
            targetSpan:null,
            lexicalMarkers:['独杀','众杀'],
            sourceContextType:SOURCE_CONTEXT_TYPES.THEORY_GENERAL,
            predicateType:PREDICATE_TYPES.INSTANCE_DESCRIPTION,
            expectedTargetLevel:null,
            resolutionState:RESOLUTION_STATES.INSUFFICIENT_BINDING_PROVENANCE,
            evidenceDimensions:[EVIDENCE_DIMENSIONS.SOURCE_CONTEXT_TYPE,EVIDENCE_DIMENSIONS.PREDICATE_TYPE],
            sourceEvidenceIds:['CF-CTS-E01','CF-CTS-E02'],
            statement:'这段足以证明 singular/plural role-instance language 存在，但本身并不是一个已定位 relation-target span；不能为了四选一而把所有含“独杀／众杀”的句子送入 relation target resolver。'
        })
    ]);

    const FINDINGS = freezeArray([
        freezeRecord({
            id:'CF-RTLC-F01', key:'resolver-unit-is-relation-target-span-not-whole-sentence', status:'required',
            value:true, sourceEvidenceIds:['CF-RTLC-CASE-02','CF-RTLC-CASE-03','CF-RTLC-CASE-08']
        }),
        freezeRecord({
            id:'CF-RTLC-F02', key:'lexical-marker-only-target-level-resolver', status:'rejected',
            value:false, sourceEvidenceIds:['CF-RTLC-CASE-01','CF-RTLC-CASE-06','CF-RTLC-CASE-08']
        }),
        freezeRecord({
            id:'CF-RTLC-F03', key:'source-context-and-predicate-type-required', status:'required',
            value:true, sourceEvidenceIds:AUDIT_CASES.map((item) => item.id)
        }),
        freezeRecord({
            id:'CF-RTLC-F04', key:'instance-level-requires-chart-local-binding', status:'required',
            value:true, sourceEvidenceIds:['CF-RTLC-CASE-04','CF-RTLC-CASE-05','CF-RTLC-CASE-06']
        }),
        freezeRecord({
            id:'CF-RTLC-F05', key:'actor-set-requires-cardinality-and-scope-agreement', status:'required',
            value:true, sourceEvidenceIds:['CF-RTLC-CASE-04','CF-RTLC-CASE-05']
        }),
        freezeRecord({
            id:'CF-RTLC-F06', key:'mixed-statement-span-segmentation', status:'required',
            value:true, sourceEvidenceIds:['CF-RTLC-CASE-02','CF-RTLC-CASE-03']
        }),
        freezeRecord({
            id:'CF-RTLC-F07', key:'forced-four-way-classification-on-insufficient-evidence', status:'rejected',
            value:false, sourceEvidenceIds:['CF-RTLC-CASE-06','CF-RTLC-CASE-08']
        }),
        freezeRecord({
            id:'CF-RTLC-F08', key:'machine-target-semantic-level-resolver', status:'not-defined',
            value:null, sourceEvidenceIds:AUDIT_CASES.map((item) => item.id)
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        targetSemanticLevels:freezeArray(Object.values(TARGET_SEMANTIC_LEVELS)),
        sourceContextTypes:freezeArray(Object.values(SOURCE_CONTEXT_TYPES)),
        predicateTypes:freezeArray(Object.values(PREDICATE_TYPES)),
        resolutionStates:freezeArray(Object.values(RESOLUTION_STATES)),
        resolverUnitIsRelationTargetSpan:true,
        sentenceLevelSingleLabelRejected:true,
        lexicalMarkerOnlyResolverRejected:true,
        sourceContextRequired:true,
        predicateTypeRequired:true,
        targetRoleIdentityRequired:true,
        chartLocalCandidateBindingRequiredForInstanceLevels:true,
        cardinalityAgreementRequiredForActorSet:true,
        scopeProvenanceRequiredForInstanceLevels:true,
        mixedStatementSpanSegmentationRequired:true,
        unresolvedOutcomeSupported:true,
        singularLexicalMarkerEqualsSingleActor:false,
        collectiveLexicalMarkerEqualsActorSet:false,
        configurationKeywordEqualsConfigurationTarget:false,
        roleClassTheoryCreatesChartEdge:false,
        groupOutcomeExpandsToMemberEdges:false,
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
        statement:'Relation Target Semantic Level 必须以 relation-target span 为解析单位，并联合 predicate type、source context 与（实例层时）chart-local candidate/cardinality/scope provenance。词面“独／一／两／众／皆／重／势／局”只能作为证据，不能直接输出 level；混合句必须先分 span，证据不足允许 unresolved。'
    });

    GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        TARGET_SEMANTIC_LEVELS,
        SOURCE_CONTEXT_TYPES,
        PREDICATE_TYPES,
        RESOLUTION_STATES,
        EVIDENCE_DIMENSIONS,
        SOURCES,
        LEVEL_GATE_CONTRACTS,
        AUDIT_CASES,
        FINDINGS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
