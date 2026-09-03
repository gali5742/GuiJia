(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationPositionProvenanceSource?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const SOURCE_TIERS = Object.freeze({
        CLASSICAL_SEMANTIC_AUTHORITY:'classical-semantic-authority',
        MODERN_INDEPENDENT_CORROBORATION:'modern-independent-corroboration'
    });

    const POSITION_ASSERTION_KINDS = Object.freeze({
        ABSOLUTE_PLACEMENT:'absolute-placement',
        ORDER:'source-asserted-order',
        PROXIMITY:'source-asserted-proximity',
        SEPARATION:'source-asserted-separation',
        INTERVENING:'source-asserted-intervening',
        COUNTERFACTUAL_SWAP:'counterfactual-swap'
    });

    const PARTICIPANT_ROLES = Object.freeze({
        SOURCE:'relation-source',
        TARGET:'relation-target',
        INTERMEDIATE:'relation-intermediate',
        CONTEXT:'relation-context'
    });

    const SCOPES = Object.freeze({
        VISIBLE_STEM:'visible-stem',
        SURFACE_BRANCH:'surface-branch',
        HIDDEN_BRANCH:'hidden-branch',
        ROLE_CLASS:'role-class',
        CROSS_SCOPE:'cross-scope',
        UNKNOWN:'unknown'
    });

    const PILLARS = Object.freeze({ YEAR:'year', MONTH:'month', DAY:'day', HOUR:'hour' });

    const SOURCES = Object.freeze({
        shenXiaozhan:Object.freeze({
            id:'CF-RPP-SRC-SXZ',
            title:'《子平真诠》',
            author:'沈孝瞻',
            sourceTier:SOURCE_TIERS.CLASSICAL_SEMANTIC_AUTHORITY,
            executableAuthority:false
        }),
        weiQianli:Object.freeze({
            id:'CF-RPP-SRC-WQL',
            title:'《千里命稿》',
            author:'韦千里',
            sourceTier:SOURCE_TIERS.MODERN_INDEPENDENT_CORROBORATION,
            upstreamEvidenceIds:freezeArray(['CF-RSMS-E02']),
            executableAuthority:false
        }),
        xuLewu:Object.freeze({
            id:'CF-RPP-SRC-XLW',
            title:'《子平真诠评注》',
            author:'徐乐吾',
            sourceTier:SOURCE_TIERS.MODERN_INDEPENDENT_CORROBORATION,
            upstreamEvidenceIds:freezeArray(['CF-RSMS-E04','CF-RSMS-E05']),
            executableAuthority:false
        })
    });

    const participant = (item = {}) => Object.freeze({
        id:item.id || null,
        participantRole:item.participantRole || PARTICIPANT_ROLES.CONTEXT,
        roleClass:item.roleClass || null,
        semanticLevelHint:item.semanticLevelHint || 'role-class',
        scope:item.scope || SCOPES.UNKNOWN,
        candidateActorKeys:freezeArray(item.candidateActorKeys || []),
        pillarLabels:freezeArray(item.pillarLabels || []),
        pillarIndexes:freezeArray(item.pillarIndexes || []),
        bindingResolved:item.bindingResolved === true
    });

    const assertion = (item = {}) => Object.freeze({
        id:item.id,
        kind:item.kind,
        sourceWording:item.sourceWording || '',
        participants:freezeArray((item.participants || []).map(participant)),
        sourceAsserted:item.sourceAsserted !== false,
        machineDerivedFromPillarDistance:item.machineDerivedFromPillarDistance === true,
        executableRelationAuthorization:item.executableRelationAuthorization === true,
        counterfactual:item.counterfactual ? Object.freeze({
            ...item.counterfactual,
            originalPlacements:freezeArray(item.counterfactual.originalPlacements || []),
            alternativePlacements:freezeArray(item.counterfactual.alternativePlacements || [])
        }) : null,
        boundary:item.boundary || ''
    });

    const record = (item = {}) => Object.freeze({
        id:item.id,
        sourceId:item.sourceId,
        sourceTier:item.sourceTier,
        locator:item.locator || '',
        sourceExtract:item.sourceExtract || '',
        chartKey:item.chartKey || null,
        interpretationContested:item.interpretationContested === true,
        assertions:freezeArray((item.assertions || []).map(assertion)),
        executableRelationAuthorization:false,
        statement:item.statement || ''
    });

    const RECORDS = freezeArray([
        record({
            id:'CF-RPP-REC-01',
            sourceId:SOURCES.shenXiaozhan.id,
            sourceTier:SOURCES.shenXiaozhan.sourceTier,
            locator:'论生克先后分吉凶 · 七煞财食先后',
            sourceExtract:'七煞同是财食并透，而先后大殊。癸先辛后……若辛先而癸在时……',
            assertions:[
                {
                    id:'CF-RPP-REC-01-A01', kind:POSITION_ASSERTION_KINDS.ORDER, sourceWording:'癸先辛后',
                    participants:[
                        { id:'wealth', participantRole:PARTICIPANT_ROLES.SOURCE, roleClass:'财星', scope:SCOPES.VISIBLE_STEM },
                        { id:'food', participantRole:PARTICIPANT_ROLES.SOURCE, roleClass:'食神', scope:SCOPES.VISIBLE_STEM }
                    ],
                    boundary:'“先／后”保存为 source-asserted chart-order provenance；不把先后本身直接转换成吉凶或 realized edge。'
                },
                {
                    id:'CF-RPP-REC-01-A02', kind:POSITION_ASSERTION_KINDS.ORDER, sourceWording:'辛先而癸在时',
                    participants:[
                        { id:'food', participantRole:PARTICIPANT_ROLES.SOURCE, roleClass:'食神', scope:SCOPES.VISIBLE_STEM },
                        { id:'wealth', participantRole:PARTICIPANT_ROLES.SOURCE, roleClass:'财星', scope:SCOPES.VISIBLE_STEM, pillarLabels:[PILLARS.HOUR], pillarIndexes:[3] }
                    ],
                    boundary:'绝对柱位与相对先后可以同时保存；仍不等于 relation path 已执行。'
                }
            ],
            statement:'古典来源明确证明相同角色共现时，chart-order provenance 可以改变 relation interpretation。'
        }),
        record({
            id:'CF-RPP-REC-02',
            sourceId:SOURCES.shenXiaozhan.id,
            sourceTier:SOURCES.shenXiaozhan.sourceTier,
            locator:'论生克先后分吉凶 · 越／隔／间',
            sourceExtract:'不得越甲以合癸……戊无所隔而合癸……伤因财间……中无辛隔……',
            assertions:[
                {
                    id:'CF-RPP-REC-02-A01', kind:POSITION_ASSERTION_KINDS.INTERVENING, sourceWording:'不得越甲以合癸',
                    participants:[
                        { id:'wu', participantRole:PARTICIPANT_ROLES.SOURCE, roleClass:'戊', scope:SCOPES.VISIBLE_STEM, pillarLabels:[PILLARS.HOUR], pillarIndexes:[3] },
                        { id:'gui', participantRole:PARTICIPANT_ROLES.TARGET, roleClass:'癸', scope:SCOPES.VISIBLE_STEM, pillarLabels:[PILLARS.YEAR], pillarIndexes:[0] },
                        { id:'jia', participantRole:PARTICIPANT_ROLES.INTERMEDIATE, roleClass:'甲', scope:SCOPES.VISIBLE_STEM, pillarLabels:[PILLARS.MONTH], pillarIndexes:[1] }
                    ],
                    boundary:'“越甲”是来源声称的 intervening semantics，不能由所有 index-between actors 自动推导。'
                },
                {
                    id:'CF-RPP-REC-02-A02', kind:POSITION_ASSERTION_KINDS.SEPARATION, sourceWording:'中无辛隔',
                    participants:[
                        { id:'gui', participantRole:PARTICIPANT_ROLES.SOURCE, roleClass:'癸', scope:SCOPES.VISIBLE_STEM },
                        { id:'ji', participantRole:PARTICIPANT_ROLES.TARGET, roleClass:'己', scope:SCOPES.VISIBLE_STEM },
                        { id:'xin', participantRole:PARTICIPANT_ROLES.INTERMEDIATE, roleClass:'辛', scope:SCOPES.VISIBLE_STEM }
                    ],
                    boundary:'“隔／间”保存 source assertion；raw pillar distance 不得替代该语义。'
                }
            ],
            statement:'Position provenance 必须能保存 source-asserted barrier/intervening semantics，而不是只有 pillar index。'
        }),
        record({
            id:'CF-RPP-REC-03',
            sourceId:SOURCES.weiQianli.id,
            sourceTier:SOURCES.weiQianli.sourceTier,
            locator:'官杀并见之去留 · 第十三条',
            sourceExtract:'贴近七杀，则以去杀论；贴近正官，则以合官论。',
            assertions:[{
                id:'CF-RPP-REC-03-A01', kind:POSITION_ASSERTION_KINDS.PROXIMITY, sourceWording:'贴近七杀／贴近正官',
                participants:[
                    { id:'food', participantRole:PARTICIPANT_ROLES.SOURCE, roleClass:'食神', scope:SCOPES.ROLE_CLASS },
                    { id:'killer', participantRole:PARTICIPANT_ROLES.TARGET, roleClass:'七杀', scope:SCOPES.ROLE_CLASS },
                    { id:'officer', participantRole:PARTICIPANT_ROLES.TARGET, roleClass:'正官', scope:SCOPES.ROLE_CLASS }
                ],
                boundary:'“贴近”只保存为 source-asserted proximity；不得自动换算成 abs(pillarIndexA-pillarIndexB) 或最近距离优先级。'
            }],
            statement:'现代独立横证支持 proximity 是 relation disambiguation 的来源维度，但没有授权通用数值距离规则。'
        }),
        record({
            id:'CF-RPP-REC-04',
            sourceId:SOURCES.xuLewu.id,
            sourceTier:SOURCES.xuLewu.sourceTier,
            locator:'论偏官 · 程潜命例评注',
            sourceExtract:'年月财生煞旺，时上食以制之；如辛在年月，则为食神生财，财生煞之局。',
            chartKey:'壬午 癸卯 己巳 辛未',
            interpretationContested:true,
            assertions:[
                {
                    id:'CF-RPP-REC-04-A01', kind:POSITION_ASSERTION_KINDS.ABSOLUTE_PLACEMENT, sourceWording:'年月财……时上食',
                    participants:[
                        { id:'wealth-set', participantRole:PARTICIPANT_ROLES.SOURCE, roleClass:'财星', semanticLevelHint:'actor-set', scope:SCOPES.VISIBLE_STEM, candidateActorKeys:['visible:0:壬','visible:1:癸'], pillarLabels:[PILLARS.YEAR,PILLARS.MONTH], pillarIndexes:[0,1], bindingResolved:true },
                        { id:'food', participantRole:PARTICIPANT_ROLES.SOURCE, roleClass:'食神', semanticLevelHint:'single-actor', scope:SCOPES.VISIBLE_STEM, candidateActorKeys:['visible:3:辛'], pillarLabels:[PILLARS.HOUR], pillarIndexes:[3], bindingResolved:true },
                        { id:'killer', participantRole:PARTICIPANT_ROLES.TARGET, roleClass:'七杀', semanticLevelHint:'single-actor', scope:SCOPES.SURFACE_BRANCH, pillarLabels:[PILLARS.MONTH], pillarIndexes:[1], bindingResolved:false }
                    ],
                    boundary:'可保存 chart-local absolute placement 与 cross-scope target evidence；徐氏“制杀”解释存在后人异议，因此 provenance 不能等同 executable realization。'
                }
            ],
            statement:'Absolute placement、scope 与 interpretation provenance 可以同时保存，即使 relation realization 本身仍有争议。'
        }),
        record({
            id:'CF-RPP-REC-05',
            sourceId:SOURCES.xuLewu.id,
            sourceTier:SOURCES.xuLewu.sourceTier,
            locator:'论偏官 · 何参政命例评注',
            sourceExtract:'地位配置合宜……若辛丑戊戌易位，便为财破印，煞攻身。',
            chartKey:'丙寅 戊戌 壬戌 辛丑',
            assertions:[{
                id:'CF-RPP-REC-05-A01', kind:POSITION_ASSERTION_KINDS.COUNTERFACTUAL_SWAP, sourceWording:'辛丑戊戌易位',
                participants:[
                    { id:'killer', participantRole:PARTICIPANT_ROLES.SOURCE, roleClass:'七杀', scope:SCOPES.VISIBLE_STEM, candidateActorKeys:['visible:1:戊'], pillarLabels:[PILLARS.MONTH], pillarIndexes:[1], bindingResolved:true },
                    { id:'seal', participantRole:PARTICIPANT_ROLES.TARGET, roleClass:'印绶', scope:SCOPES.VISIBLE_STEM, candidateActorKeys:['visible:3:辛'], pillarLabels:[PILLARS.HOUR], pillarIndexes:[3], bindingResolved:true }
                ],
                counterfactual:{
                    originalPlacements:[Object.freeze({ refId:'killer', pillar:PILLARS.MONTH }),Object.freeze({ refId:'seal', pillar:PILLARS.HOUR })],
                    alternativePlacements:[Object.freeze({ refId:'killer', pillar:PILLARS.HOUR }),Object.freeze({ refId:'seal', pillar:PILLARS.MONTH })]
                },
                boundary:'Counterfactual swap 只保存来源用于比较的 placement configuration，不自动生成替代命盘的 executable edges。'
            }],
            statement:'位置 provenance 需要表达“易位”这种 counterfactual configuration，而不仅是当前盘的绝对柱位。'
        })
    ]);

    const validateRecord = (item = {}) => {
        const issues = [];
        if (!item.id || !item.sourceId || !item.sourceExtract) issues.push('incomplete-record');
        (item.assertions || []).forEach((entry) => {
            if (!entry.id || !Object.values(POSITION_ASSERTION_KINDS).includes(entry.kind)) issues.push(`invalid-assertion:${entry.id || ''}`);
            if (!entry.sourceWording) issues.push(`missing-source-wording:${entry.id || ''}`);
            if (entry.machineDerivedFromPillarDistance === true) issues.push(`semantic-assertion-cannot-be-distance-derived:${entry.id || ''}`);
            if (entry.executableRelationAuthorization === true) issues.push(`position-cannot-authorize-execution:${entry.id || ''}`);
            (entry.participants || []).forEach((p) => {
                if (!Object.values(PARTICIPANT_ROLES).includes(p.participantRole)) issues.push(`invalid-participant-role:${entry.id || ''}`);
                if (!Object.values(SCOPES).includes(p.scope)) issues.push(`invalid-scope:${entry.id || ''}`);
                if ((p.pillarLabels || []).length !== (p.pillarIndexes || []).length) issues.push(`pillar-label-index-mismatch:${entry.id || ''}`);
                (p.pillarIndexes || []).forEach((index) => { if (![0,1,2,3].includes(index)) issues.push(`invalid-pillar-index:${entry.id || ''}`); });
            });
            if (entry.kind === POSITION_ASSERTION_KINDS.COUNTERFACTUAL_SWAP && !entry.counterfactual) issues.push(`missing-counterfactual:${entry.id || ''}`);
        });
        return Object.freeze({ valid:issues.length === 0, issues:freezeArray(issues) });
    };

    const validateRegistry = (records = RECORDS) => {
        const results = freezeArray((records || []).map((item) => Object.freeze({ id:item.id, ...validateRecord(item) })));
        return Object.freeze({ valid:results.every((item) => item.valid), results, issueCount:results.reduce((sum, item) => sum + item.issues.length, 0) });
    };

    const FINDINGS = freezeArray([
        Object.freeze({ id:'CF-RPP-F01', key:'position-provenance-contract-is-viable', status:'supported', value:true, evidenceIds:freezeArray(RECORDS.map((item) => item.id)) }),
        Object.freeze({ id:'CF-RPP-F02', key:'raw-pillar-distance-equals-source-semantic-proximity', status:'rejected', value:false, evidenceIds:freezeArray(['CF-RPP-REC-02','CF-RPP-REC-03']) }),
        Object.freeze({ id:'CF-RPP-F03', key:'every-between-index-actor-equals-source-intervening-actor', status:'rejected', value:false, evidenceIds:freezeArray(['CF-RPP-REC-02']) }),
        Object.freeze({ id:'CF-RPP-F04', key:'position-provenance-can-preserve-counterfactual-swap', status:'supported', value:true, evidenceIds:freezeArray(['CF-RPP-REC-05']) }),
        Object.freeze({ id:'CF-RPP-F05', key:'position-provenance-authorizes-relation-execution', status:'rejected', value:false, evidenceIds:freezeArray(RECORDS.map((item) => item.id)) }),
        Object.freeze({ id:'CF-RPP-F06', key:'position-provenance-corpus-coverage-complete', status:'not-defined', value:null, evidenceIds:freezeArray([]) }),
        Object.freeze({ id:'CF-RPP-F07', key:'position-provenance-runtime-consumer-defined', status:'not-defined', value:null, evidenceIds:freezeArray([]) })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        absolutePlacementSupported:true,
        sourceAssertedOrderSupported:true,
        sourceAssertedProximitySupported:true,
        sourceAssertedSeparationSupported:true,
        sourceAssertedInterveningSupported:true,
        counterfactualSwapSupported:true,
        sourceWordingProvenanceRequired:true,
        scopeProvenanceRequired:true,
        rawPillarGeometryEqualsSemanticProximity:false,
        rawPillarDistanceDefinesRelation:false,
        everyBetweenIndexActorEqualsSourceInterveningActor:false,
        positionProvenanceAuthorizesExecution:false,
        positionProvenanceCoverageComplete:false,
        runtimePositionConsumerDefined:false,
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
        statement:'Relation Position Provenance v0.1 只保存 source-backed 的绝对柱位、先后、贴近、隔／间／越与易位等位置证据，并保留 scope 与 source wording。原典的 proximity/intervening semantics 不得由 raw pillar index distance 自动推导；position provenance 也不直接授权 relation execution。'
    });

    GuiJia.baziContextualForcePartyRelationPositionProvenanceSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCE_TIERS,
        POSITION_ASSERTION_KINDS,
        PARTICIPANT_ROLES,
        SCOPES,
        PILLARS,
        SOURCES,
        RECORDS,
        FINDINGS,
        CONTRACT,
        validateRecord,
        validateRegistry
    });
})(typeof window !== 'undefined' ? window : globalThis);
