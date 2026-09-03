(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCompetingRelationPathSource?.installed) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-SOURCE-CONTRACT-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const SOURCE_TIERS = Object.freeze({
        CLASSICAL_SEMANTIC_AUTHORITY:'classical-semantic-authority',
        MODERN_INDEPENDENT_CORROBORATION:'modern-independent-corroboration'
    });

    const PATH_KINDS = Object.freeze({
        DIRECT_ROLE_RELATION:'direct-role-relation',
        COMPOUND_SOURCE_RELATION:'compound-source-relation'
    });

    const COEXISTENCE_MODES = Object.freeze({
        SOURCE_PERMITS_COEXISTENCE:'source-permits-coexistence',
        SOURCE_REQUIRES_EXCLUSIVE_SELECTION:'source-requires-exclusive-selection',
        UNRESOLVED:'unresolved'
    });

    const CONDITION_MODES = Object.freeze({
        SOURCE_CONDITIONAL:'source-conditional',
        SOURCE_UNCONDITIONAL:'source-unconditional',
        UNRESOLVED:'unresolved'
    });

    const ORDERING_MODES = Object.freeze({
        SOURCE_ORDERED:'source-ordered',
        SOURCE_UNORDERED:'source-unordered',
        UNRESOLVED:'unresolved'
    });

    const CONDITION_KINDS = Object.freeze({
        POSITION_ORDER:'position-order',
        POSITION_PROXIMITY:'position-proximity',
        RELATIVE_RELATION_CAPACITY:'relative-relation-capacity'
    });

    const SOURCES = Object.freeze({
        shenXiaozhan:Object.freeze({
            id:'CF-CRP-SRC-SXZ',
            title:'《子平真诠》',
            author:'沈孝瞻',
            sourceTier:SOURCE_TIERS.CLASSICAL_SEMANTIC_AUTHORITY,
            executableAuthority:false
        }),
        weiQianli:Object.freeze({
            id:'CF-CRP-SRC-WQL',
            title:'《千里命稿》',
            author:'韦千里',
            sourceTier:SOURCE_TIERS.MODERN_INDEPENDENT_CORROBORATION,
            upstreamEvidenceIds:freezeArray(['CF-RSMS-E01','CF-RSMS-E02','CF-RSMS-E03']),
            executableAuthority:false
        })
    });

    const pathCandidate = (item = {}) => Object.freeze({
        id:item.id,
        pathKind:item.pathKind || PATH_KINDS.DIRECT_ROLE_RELATION,
        semanticLabel:item.semanticLabel || '',
        sourceRoleClass:item.sourceRoleClass || null,
        predicateWording:item.predicateWording || '',
        targetRoleClass:item.targetRoleClass || null,
        intermediateRoleClasses:freezeArray(item.intermediateRoleClasses || []),
        sourceWording:item.sourceWording || '',
        executable:false,
        memberEdgeExpansion:false
    });

    const condition = (item = {}) => Object.freeze({
        id:item.id,
        kind:item.kind,
        sourceWording:item.sourceWording || '',
        sourceAsserted:item.sourceAsserted !== false,
        runtimeResolved:false,
        numericThreshold:null,
        boundary:item.boundary || ''
    });

    const relationAssertion = (item = {}) => Object.freeze({
        id:item.id,
        sourceWording:item.sourceWording || '',
        pathIds:freezeArray(item.pathIds || []),
        coexistenceMode:item.coexistenceMode || COEXISTENCE_MODES.UNRESOLVED,
        conditionMode:item.conditionMode || CONDITION_MODES.UNRESOLVED,
        orderingMode:item.orderingMode || ORDERING_MODES.UNRESOLVED,
        conditionIds:freezeArray(item.conditionIds || []),
        orderedPathIds:freezeArray(item.orderedPathIds || []),
        sourceAsserted:item.sourceAsserted !== false,
        executableSelection:false,
        runtimeWinnerPathId:null,
        numericPriority:null,
        boundary:item.boundary || ''
    });

    const record = (item = {}) => Object.freeze({
        id:item.id,
        sourceId:item.sourceId,
        sourceTier:item.sourceTier,
        locator:item.locator || '',
        sourceExtract:item.sourceExtract || '',
        chartKey:item.chartKey || null,
        upstreamEvidenceIds:freezeArray(item.upstreamEvidenceIds || []),
        positionEvidenceIds:freezeArray(item.positionEvidenceIds || []),
        pathCandidates:freezeArray((item.pathCandidates || []).map(pathCandidate)),
        conditions:freezeArray((item.conditions || []).map(condition)),
        relationAssertions:freezeArray((item.relationAssertions || []).map(relationAssertion)),
        executablePathResolution:false,
        statement:item.statement || ''
    });

    const RECORDS = freezeArray([
        record({
            id:'CF-CRP-REC-01',
            sourceId:SOURCES.shenXiaozhan.id,
            sourceTier:SOURCES.shenXiaozhan.sourceTier,
            locator:'论生克先后分吉凶 · 七煞财食先后 · 财先食后',
            sourceExtract:'七煞同是财食并透，而先后大殊。如己生卯月，癸先辛后，则为财以助用，而后煞用食制，不失大贵。',
            positionEvidenceIds:['CF-RPP-REC-01-A01'],
            pathCandidates:[
                {
                    id:'CF-CRP-REC-01-P01',
                    semanticLabel:'wealth-augments-killer',
                    sourceRoleClass:'财星',
                    predicateWording:'助',
                    targetRoleClass:'七杀',
                    sourceWording:'财以助用'
                },
                {
                    id:'CF-CRP-REC-01-P02',
                    semanticLabel:'food-controls-killer',
                    sourceRoleClass:'食神',
                    predicateWording:'制',
                    targetRoleClass:'七杀',
                    sourceWording:'煞用食制'
                }
            ],
            conditions:[{
                id:'CF-CRP-REC-01-C01',
                kind:CONDITION_KINDS.POSITION_ORDER,
                sourceWording:'癸先辛后',
                boundary:'这里只保存来源提出的先后条件；不把年/月/日/时索引转换成通用路径优先级。'
            }],
            relationAssertions:[{
                id:'CF-CRP-REC-01-A01',
                sourceWording:'财以助用，而后煞用食制',
                pathIds:['CF-CRP-REC-01-P01','CF-CRP-REC-01-P02'],
                coexistenceMode:COEXISTENCE_MODES.SOURCE_PERMITS_COEXISTENCE,
                conditionMode:CONDITION_MODES.SOURCE_CONDITIONAL,
                orderingMode:ORDERING_MODES.SOURCE_ORDERED,
                conditionIds:['CF-CRP-REC-01-C01'],
                orderedPathIds:['CF-CRP-REC-01-P01','CF-CRP-REC-01-P02'],
                boundary:'两条 relation path 可在同一来源解释中共存且有先后；共存不等于数值相加，先后也不等于 numeric priority。'
            }],
            statement:'古典来源直接支持“多路径共存 + 来源顺序”是独立语义状态，而不是只能选一个 winner。'
        }),
        record({
            id:'CF-CRP-REC-02',
            sourceId:SOURCES.shenXiaozhan.id,
            sourceTier:SOURCES.shenXiaozhan.sourceTier,
            locator:'论生克先后分吉凶 · 七煞财食先后 · 食先财后',
            sourceExtract:'若辛先而癸在时，则煞逢食制，而财转食党煞，非特不贵。',
            positionEvidenceIds:['CF-RPP-REC-01-A02'],
            pathCandidates:[
                {
                    id:'CF-CRP-REC-02-P01',
                    semanticLabel:'food-controls-killer',
                    sourceRoleClass:'食神',
                    predicateWording:'制',
                    targetRoleClass:'七杀',
                    sourceWording:'煞逢食制'
                },
                {
                    id:'CF-CRP-REC-02-P02',
                    pathKind:PATH_KINDS.COMPOUND_SOURCE_RELATION,
                    semanticLabel:'wealth-turns-food-and-parties-killer',
                    sourceRoleClass:'财星',
                    predicateWording:'转食党',
                    targetRoleClass:'七杀',
                    intermediateRoleClasses:['食神'],
                    sourceWording:'财转食党煞'
                }
            ],
            conditions:[{
                id:'CF-CRP-REC-02-C01',
                kind:CONDITION_KINDS.POSITION_ORDER,
                sourceWording:'辛先而癸在时',
                boundary:'来源把食先财后作为条件；compound relation 不得被机器未经审定地拆成多条 member/direct edges。'
            }],
            relationAssertions:[{
                id:'CF-CRP-REC-02-A01',
                sourceWording:'煞逢食制，而财转食党煞',
                pathIds:['CF-CRP-REC-02-P01','CF-CRP-REC-02-P02'],
                coexistenceMode:COEXISTENCE_MODES.SOURCE_PERMITS_COEXISTENCE,
                conditionMode:CONDITION_MODES.SOURCE_CONDITIONAL,
                orderingMode:ORDERING_MODES.SOURCE_ORDERED,
                conditionIds:['CF-CRP-REC-02-C01'],
                orderedPathIds:['CF-CRP-REC-02-P01','CF-CRP-REC-02-P02'],
                boundary:'后一 relation 可改变整个路径组合的解释；不得把“两个已知 motif 都出现”处理成独立加总。'
            }],
            statement:'同一 actor/role inventory 中的路径共存可以是交互式而非可加式；路径组合本身需要 provenance。'
        }),
        record({
            id:'CF-CRP-REC-03',
            sourceId:SOURCES.weiQianli.id,
            sourceTier:SOURCES.weiQianli.sourceTier,
            locator:'官杀并见之去留 · 第十三条 · 阳日食神',
            sourceExtract:'阳日食神，可以去杀，而又可合官。贴近七杀，则以去杀论；贴近正官，则以合官论。',
            upstreamEvidenceIds:['CF-RSMS-E02'],
            positionEvidenceIds:['CF-RPP-REC-03-A01'],
            pathCandidates:[
                {
                    id:'CF-CRP-REC-03-P01',
                    semanticLabel:'food-removes-killer',
                    sourceRoleClass:'食神',
                    predicateWording:'去',
                    targetRoleClass:'七杀',
                    sourceWording:'去杀'
                },
                {
                    id:'CF-CRP-REC-03-P02',
                    semanticLabel:'food-combines-officer',
                    sourceRoleClass:'食神',
                    predicateWording:'合',
                    targetRoleClass:'正官',
                    sourceWording:'合官'
                }
            ],
            conditions:[
                {
                    id:'CF-CRP-REC-03-C01',
                    kind:CONDITION_KINDS.POSITION_PROXIMITY,
                    sourceWording:'贴近七杀',
                    boundary:'“贴近”必须消费 source-asserted proximity provenance；不得改写为固定柱距。'
                },
                {
                    id:'CF-CRP-REC-03-C02',
                    kind:CONDITION_KINDS.POSITION_PROXIMITY,
                    sourceWording:'贴近正官',
                    boundary:'条件存在不等于 runtime 已能判定哪个 target 满足条件。'
                }
            ],
            relationAssertions:[{
                id:'CF-CRP-REC-03-A01',
                sourceWording:'贴近七杀，则以去杀论；贴近正官，则以合官论',
                pathIds:['CF-CRP-REC-03-P01','CF-CRP-REC-03-P02'],
                coexistenceMode:COEXISTENCE_MODES.SOURCE_REQUIRES_EXCLUSIVE_SELECTION,
                conditionMode:CONDITION_MODES.SOURCE_CONDITIONAL,
                orderingMode:ORDERING_MODES.UNRESOLVED,
                conditionIds:['CF-CRP-REC-03-C01','CF-CRP-REC-03-C02'],
                orderedPathIds:[],
                boundary:'来源要求按条件区分解释，但本 record 只保存 source-directed exclusivity；不生成 runtime winner。'
            }],
            statement:'现代独立横证支持“同一理论候选路径需要条件化排他选择”的 schema，但不授权通用 proximity selector。'
        }),
        record({
            id:'CF-CRP-REC-04',
            sourceId:SOURCES.weiQianli.id,
            sourceTier:SOURCES.weiQianli.sourceTier,
            locator:'官杀并见之去留 · 第十二条',
            sourceExtract:'官杀并见，伤官食神亦并见。伤官较为有力，则去官；食神较为有力，则去杀。',
            upstreamEvidenceIds:['CF-RSMS-E01','CF-RSMS-E03'],
            pathCandidates:[
                {
                    id:'CF-CRP-REC-04-P01',
                    semanticLabel:'hurting-officer-removes-officer',
                    sourceRoleClass:'伤官',
                    predicateWording:'去',
                    targetRoleClass:'正官',
                    sourceWording:'伤官较为有力，则去官'
                },
                {
                    id:'CF-CRP-REC-04-P02',
                    semanticLabel:'food-removes-killer',
                    sourceRoleClass:'食神',
                    predicateWording:'去',
                    targetRoleClass:'七杀',
                    sourceWording:'食神较为有力，则去杀'
                }
            ],
            conditions:[{
                id:'CF-CRP-REC-04-C01',
                kind:CONDITION_KINDS.RELATIVE_RELATION_CAPACITY,
                sourceWording:'伤官较为有力／食神较为有力',
                boundary:'“较为有力”是来源条件，不提供数值权重、阈值、票数或当前 relative-dominance 结果。'
            }],
            relationAssertions:[{
                id:'CF-CRP-REC-04-A01',
                sourceWording:'伤官较为有力，则去官；食神较为有力，则去杀',
                pathIds:['CF-CRP-REC-04-P01','CF-CRP-REC-04-P02'],
                coexistenceMode:COEXISTENCE_MODES.SOURCE_REQUIRES_EXCLUSIVE_SELECTION,
                conditionMode:CONDITION_MODES.SOURCE_CONDITIONAL,
                orderingMode:ORDERING_MODES.UNRESOLVED,
                conditionIds:['CF-CRP-REC-04-C01'],
                boundary:'来源条件依赖“较为有力”的比较，但本 contract 不偷渡 relative dominance resolver；无法判定时必须保持 unresolved。'
            }],
            statement:'Path condition 可以依赖尚未实现的语义比较器；source contract 应保存 blocker，而不是用 member count 或固定权重补洞。'
        })
    ]);

    const validateRecord = (item = {}) => {
        const issues = [];
        if (!item.id || !item.sourceId || !item.sourceExtract) issues.push('incomplete-record');
        const pathIds = new Set((item.pathCandidates || []).map((path) => path.id));
        const conditionIds = new Set((item.conditions || []).map((entry) => entry.id));
        if (pathIds.size !== (item.pathCandidates || []).length) issues.push('duplicate-path-id');
        if (conditionIds.size !== (item.conditions || []).length) issues.push('duplicate-condition-id');

        (item.pathCandidates || []).forEach((path) => {
            if (!path.id || !Object.values(PATH_KINDS).includes(path.pathKind)) issues.push(`invalid-path:${path.id || ''}`);
            if (!path.semanticLabel || !path.sourceWording) issues.push(`incomplete-path:${path.id || ''}`);
            if (path.executable !== false) issues.push(`path-cannot-be-executable:${path.id || ''}`);
            if (path.memberEdgeExpansion !== false) issues.push(`path-cannot-expand-member-edges:${path.id || ''}`);
        });

        (item.conditions || []).forEach((entry) => {
            if (!entry.id || !Object.values(CONDITION_KINDS).includes(entry.kind)) issues.push(`invalid-condition:${entry.id || ''}`);
            if (!entry.sourceWording) issues.push(`missing-condition-source-wording:${entry.id || ''}`);
            if (entry.runtimeResolved !== false) issues.push(`condition-cannot-be-runtime-resolved:${entry.id || ''}`);
            if (entry.numericThreshold !== null) issues.push(`condition-cannot-carry-numeric-threshold:${entry.id || ''}`);
        });

        (item.relationAssertions || []).forEach((entry) => {
            if (!entry.id || !entry.sourceWording) issues.push(`incomplete-assertion:${entry.id || ''}`);
            if (!Object.values(COEXISTENCE_MODES).includes(entry.coexistenceMode)) issues.push(`invalid-coexistence-mode:${entry.id || ''}`);
            if (!Object.values(CONDITION_MODES).includes(entry.conditionMode)) issues.push(`invalid-condition-mode:${entry.id || ''}`);
            if (!Object.values(ORDERING_MODES).includes(entry.orderingMode)) issues.push(`invalid-ordering-mode:${entry.id || ''}`);
            (entry.pathIds || []).forEach((id) => { if (!pathIds.has(id)) issues.push(`unknown-path:${entry.id || ''}:${id}`); });
            (entry.conditionIds || []).forEach((id) => { if (!conditionIds.has(id)) issues.push(`unknown-condition:${entry.id || ''}:${id}`); });
            if (entry.conditionMode === CONDITION_MODES.SOURCE_CONDITIONAL && !(entry.conditionIds || []).length) issues.push(`conditional-assertion-needs-condition:${entry.id || ''}`);
            if (entry.orderingMode === ORDERING_MODES.SOURCE_ORDERED) {
                if ((entry.orderedPathIds || []).length < 2) issues.push(`ordered-assertion-needs-two-paths:${entry.id || ''}`);
                (entry.orderedPathIds || []).forEach((id) => { if (!pathIds.has(id)) issues.push(`unknown-ordered-path:${entry.id || ''}:${id}`); });
            }
            if (entry.executableSelection !== false || entry.runtimeWinnerPathId !== null || entry.numericPriority !== null) issues.push(`assertion-cannot-resolve-runtime-selection:${entry.id || ''}`);
        });

        if (item.executablePathResolution !== false) issues.push('record-cannot-authorize-executable-path-resolution');
        return Object.freeze({ valid:issues.length === 0, issues:freezeArray(issues) });
    };

    const validateRegistry = (records = RECORDS) => {
        const results = freezeArray((records || []).map((item) => Object.freeze({ id:item.id, ...validateRecord(item) })));
        return Object.freeze({ valid:results.every((item) => item.valid), results, issueCount:results.reduce((sum, item) => sum + item.issues.length, 0) });
    };

    const evidenceIds = () => freezeArray(RECORDS.map((item) => item.id));
    const FINDINGS = freezeArray([
        Object.freeze({ id:'CF-CRP-F01', key:'competing-relation-path-source-contract-supported', status:'supported', value:true, evidenceIds:evidenceIds() }),
        Object.freeze({ id:'CF-CRP-F02', key:'path-coexistence-condition-ordering-are-orthogonal-dimensions', status:'supported', value:true, evidenceIds:evidenceIds() }),
        Object.freeze({ id:'CF-CRP-F03', key:'source-ordered-competing-paths-may-coexist', status:'supported', value:true, evidenceIds:freezeArray(['CF-CRP-REC-01','CF-CRP-REC-02']) }),
        Object.freeze({ id:'CF-CRP-F04', key:'source-may-require-condition-based-exclusive-selection', status:'supported', value:true, evidenceIds:freezeArray(['CF-CRP-REC-03','CF-CRP-REC-04']) }),
        Object.freeze({ id:'CF-CRP-F05', key:'single-path-status-enum-is-sufficient', status:'rejected', value:false, evidenceIds:evidenceIds() }),
        Object.freeze({ id:'CF-CRP-F06', key:'source-order-equals-runtime-priority', status:'rejected', value:false, evidenceIds:freezeArray(['CF-CRP-REC-01','CF-CRP-REC-02']) }),
        Object.freeze({ id:'CF-CRP-F07', key:'path-presence-equals-execution', status:'rejected', value:false, evidenceIds:evidenceIds() }),
        Object.freeze({ id:'CF-CRP-F08', key:'competing-relation-path-corpus-coverage-complete', status:'not-defined', value:null, evidenceIds:evidenceIds() }),
        Object.freeze({ id:'CF-CRP-F09', key:'competing-relation-path-runtime-resolver', status:'not-defined', value:null, evidenceIds:freezeArray([]) })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-SOURCE-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        pathCandidatesAreSourceSemanticEvidence:true,
        pathCandidatePresenceEqualsExecution:false,
        pathCandidatePresenceEqualsRuntimeSelection:false,
        coexistenceConditionOrderingAreOrthogonal:true,
        singleStatusEnumRejected:true,
        coexistenceModes:freezeArray(Object.values(COEXISTENCE_MODES)),
        conditionModes:freezeArray(Object.values(CONDITION_MODES)),
        orderingModes:freezeArray(Object.values(ORDERING_MODES)),
        sourceOrderedPathsMayCoexist:true,
        sourceExclusiveSelectionMayBeConditional:true,
        sourceConditionMayDependOnPositionProvenance:true,
        sourceConditionMayDependOnRelativeRelationCapacity:true,
        unresolvedConditionMustRemainUnresolved:true,
        sourceOrderEqualsRuntimePriority:false,
        sourceConditionEqualsRuntimeResolvedCondition:false,
        sourceRequiresExclusiveSelectionEqualsRuntimeWinner:false,
        compoundSourceRelationExpandsToDirectEdges:false,
        memberEdgeExpansion:false,
        corpusCoverageComplete:false,
        runtimeResolverDefined:false,
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
        statement:'Competing Relation Path 不应压缩为单一 winner/loser 状态。来源至少要求机器把 path coexistence、source condition 与 source ordering 分层保存：路径可按来源顺序共存，也可按来源条件要求排他选择；条件若依赖位置或“较为有力”等尚未实现的 consumer，必须继续 unresolved。Source path evidence 本身不授权执行、数值优先级或最终 Strength。'
    });

    GuiJia.baziContextualForcePartyCompetingRelationPathSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCE_TIERS,
        PATH_KINDS,
        COEXISTENCE_MODES,
        CONDITION_MODES,
        ORDERING_MODES,
        CONDITION_KINDS,
        SOURCES,
        RECORDS,
        FINDINGS,
        CONTRACT,
        validateRecord,
        validateRegistry
    });
})(typeof window !== 'undefined' ? window : globalThis);
