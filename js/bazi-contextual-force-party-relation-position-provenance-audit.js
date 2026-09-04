(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationPositionProvenanceAudit?.installed) return;

    // Research bootstrap prerequisite: ./js/bazi-contextual-force-party-relation-position-provenance-source.js?v=13.44.0

    const sourceApi = GuiJia.baziContextualForcePartyRelationPositionProvenanceSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, RECORDS, FINDINGS, CONTRACT, validateRegistry } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceEvidenceIds = freezeArray(RECORDS.map((item) => item.id));

    const buildAudit = () => {
        const validation = validateRegistry(RECORDS);
        const assertions = RECORDS.flatMap((item) => item.assertions || []);
        const kinds = freezeArray([...new Set(assertions.map((item) => item.kind))]);
        const contestedRecords = RECORDS.filter((item) => item.interpretationContested === true);
        return Object.freeze({
            id:'CF-PARTY-RELATION-POSITION-PROVENANCE-AUDIT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:validation.valid ? 'position-provenance-contract-audited-coverage-consumer-unresolved' : 'position-provenance-contract-invalid',
            sourceContract:CONTRACT,
            recordCount:RECORDS.length,
            assertionCount:assertions.length,
            assertionKinds:kinds,
            contestedRecordIds:freezeArray(contestedRecords.map((item) => item.id)),
            registryValidation:validation,
            positionProvenanceContractDefined:true,
            sourceWordingProvenanceRequired:true,
            rawPillarGeometryEqualsSemanticProximity:false,
            positionProvenanceAuthorizesExecution:false,
            positionProvenanceCoverageComplete:false,
            runtimePositionConsumerDefined:false,
            competingRelationPathResolverDefined:false,
            targetSemanticLevelResolverDefined:false,
            actorGroupIdentityContractDefined:false,
            collectiveRelationEffectExecutionDefined:false,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            sourceEvidenceIds,
            findings:FINDINGS
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT',
        claimKey:'strength.contextual-force.party.relation.position-provenance.contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            positionProvenanceContractDefined:audit.positionProvenanceContractDefined,
            sourceWordingProvenanceRequired:audit.sourceWordingProvenanceRequired,
            rawPillarGeometryEqualsSemanticProximity:audit.rawPillarGeometryEqualsSemanticProximity,
            positionProvenanceAuthorizesExecution:audit.positionProvenanceAuthorizesExecution
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'《子平真诠》的“先后”“不得越甲”“中无辛隔”，韦千里的“贴近”，以及徐乐吾的命例易位说明共同表明：position provenance 至少需要表达绝对柱位、source-asserted order/proximity/separation/intervening 与 counterfactual swap。尤其“隔／越／贴近”是来源语义断言，不能仅凭 pillarIndex 数值自动推导。',
        boundary:'本 claim 只冻结 position provenance 的数据合同与 validator。它不表示现有 relation corpus 已完成位置标注，也不定义 runtime position consumer、最近距离规则、路径选择器、target/group identity 或 relation execution。'
    });

    const makeDependency = ({ id, kind = 'semantic-model', scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        statement,
        boundary
    });

    const buildContractDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT',
        kind:'source-audit',
        scope:'relation-position-provenance-schema-and-validation-contract',
        status:'resolved',
        statement:'Relation Position Provenance 已有最小 source contract：可保存绝对柱位、source-asserted 先后／贴近／隔间越／易位，并把 source wording、scope 与 chart placement 分开保存。',
        boundary:'Contract resolved 不等于 corpus coverage、runtime consumer 或 relation-path disambiguation 已完成；raw pillar geometry 不能代替 source semantic assertions。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-CROSS-LITERATURE-MODERN-SUPPORT-AUDIT'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT']
    });

    const buildCoverageDependency = (contractDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-COVERAGE',
        kind:'source-coverage',
        scope:'audited-relation-source-position-provenance-coverage',
        status:'unresolved',
        statement:'当前仅为代表性古典／近现代 position-sensitive cases 建立 provenance records；尚未证明所有财→官杀、食神→七杀、七杀→印及 curated annotation records 都已补齐 position provenance。',
        boundary:'不得因 contract 已定义就假定全 corpus 已具备 position evidence；没有来源位置语义的记录也不得自动生成 proximity/intervening assertions。',
        dependsOnDependencyIds:[contractDependency.id,'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT']
    });

    const rebuildDependency = (base = {}, id = '', additions = [], statement = null, boundary = null) => {
        const current = (base.dependencies || []).find((item) => item.id === id) || {};
        return Object.freeze({
            ...current,
            id,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([...(current.dependsOnDependencyIds || []), ...additions.map((item) => item.id)])),
            resolvedByClaimIds:Object.freeze([]),
            ...(statement ? { statement } : {}),
            ...(boundary ? { boundary } : {})
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyRelationSemanticsModernSupportAudit) return base;
        const audit = buildAudit();
        const claim = makeClaim(audit);
        const contractDependency = buildContractDependency();
        const coverageDependency = buildCoverageDependency(contractDependency);

        const positionDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE',
            [contractDependency,coverageDependency],
            'Position provenance 的数据合同现已明确，但 audited corpus coverage 与 runtime consumer 仍未完成；chart-local relation binding 尚不能稳定消费 source-asserted order/proximity/separation/intervening/counterfactual evidence。',
            '不得用 pillar index 差、固定邻接、最近距离或任意“夹在中间”的 actor 自动替代来源的“贴近／隔／间／越”语义。'
        );

        const annotationCoverageDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE',
            [coverageDependency],
            'Curated relation annotation 的统一 coverage 现在还必须覆盖 position provenance；现有首批 annotation records 尚未全部迁移到该 contract，因此继续 unresolved。',
            '不得把已有 target/context/predicate annotation coverage 与 position provenance coverage 混为同一件事。'
        );

        const candidateBindingDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING',
            [positionDependency],
            'Chart-local target candidate binding 已明确需要 position provenance，但 runtime consumer 尚未实现；候选 actor 不得仅凭距离／柱位被自动选中。',
            'Position provenance 是 binding evidence，不是 target selection shortcut。'
        );

        const competingPathDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION',
            [positionDependency],
            'Competing Relation Path Resolution 现在有稳定 position provenance 输入合同，但仍没有 source-backed path authorization / exclusion / coexistence resolver，因此继续 unresolved。',
            '不得把 position contract 本身当作路径优先级；后续 resolver 必须消费 source authority、position/scope/cardinality provenance 与 realization 条件。'
        );

        const replacedDependencyIds = new Set([
            contractDependency.id,
            coverageDependency.id,
            positionDependency.id,
            annotationCoverageDependency.id,
            candidateBindingDependency.id,
            competingPathDependency.id
        ]);

        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            coverageDependency,
            positionDependency,
            annotationCoverageDependency,
            candidateBindingDependency,
            competingPathDependency
        ]);
        const conflicts = typeof priorSynthesisApi.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            contextualForcePartyRelationPositionProvenanceAudit:audit,
            contextualForcePartyRelationPositionProvenanceRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Relation Position Provenance Contract v0.1：保存绝对柱位与 source-asserted 先后／贴近／隔间越／易位，不把位置压缩成 distance score。',
                'Source semantic proximity / intervening assertions 与 raw pillar geometry 分层；index-between actor 不自动成为“隔神”。',
                'Position provenance 不授权 relation execution，也不提供最近距离优先级、固定邻接规则或 numeric weighting。',
                'Corpus coverage、runtime consumer、Competing Relation Path Resolution、Target/Group Identity、Collective Effect Execution、Strength 与 Assessment 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-relation-position-provenance-audit-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyRelationPositionProvenanceAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);