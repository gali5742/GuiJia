(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource) {
        document.write('<script src="./js/bazi-contextual-force-party-curated-relation-source-semantic-annotation-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, ANNOTATIONS, FINDINGS, CONTRACT, validateRegistry } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceEvidenceIds = freezeArray(ANNOTATIONS.map((item) => item.id));

    const buildAudit = () => {
        const validation = validateRegistry(ANNOTATIONS);
        const relationUnits = ANNOTATIONS.flatMap((item) => item.relationUnits || []);
        const mixedRecords = ANNOTATIONS.filter((item) => (item.contextSpans || []).length > 0 && (item.relationUnits || []).length > 0);
        const coreferenceUnits = relationUnits.filter((unit) => ['anaphoric','antecedent-linked'].includes(unit.target?.mentionMode));
        const instanceHintUnits = relationUnits.filter((unit) => ['single-actor','actor-set'].includes(unit.target?.semanticLevelHint));
        return Object.freeze({
            id:'CF-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-AUDIT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:validation.valid ? 'curated-source-semantic-annotation-contract-audited-coverage-unresolved' : 'curated-source-semantic-annotation-contract-invalid',
            sourceContract:CONTRACT,
            annotationCount:ANNOTATIONS.length,
            relationUnitCount:relationUnits.length,
            mixedRecordIds:freezeArray(mixedRecords.map((item) => item.id)),
            coreferenceRelationUnitIds:freezeArray(coreferenceUnits.map((item) => item.id)),
            instanceHintRelationUnitIds:freezeArray(instanceHintUnits.map((item) => item.id)),
            registryValidation:validation,
            curatedAnnotationContractDefined:true,
            runtimeClassicalChineseParserRequiredForAuditedCorpus:false,
            sourceContextCanComeFromCuratedAnnotation:true,
            predicateTypeCanComeFromCuratedAnnotation:true,
            targetCoreferenceAntecedentBindingRequired:true,
            targetSemanticLevelHintExecutable:false,
            annotationCoverageComplete:false,
            targetSemanticLevelResolverDefined:false,
            actorGroupIdentityContractDefined:false,
            collectiveRelationEffectExecutionDefined:false,
            relativeDominance:null,
            actorGlobalEffectiveness:null,
            numericScore:null,
            scalarForce:null,
            sourceEvidenceIds,
            findings:FINDINGS
        });
    };

    const makeClaim = (audit = {}) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT',
        claimKey:'strength.contextual-force.party.curated-relation-source.semantic-annotation.contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            curatedAnnotationContractDefined:audit.curatedAnnotationContractDefined,
            runtimeClassicalChineseParserRequiredForAuditedCorpus:audit.runtimeClassicalChineseParserRequiredForAuditedCorpus,
            sourceContextCanComeFromCuratedAnnotation:audit.sourceContextCanComeFromCuratedAnnotation,
            predicateTypeCanComeFromCuratedAnnotation:audit.predicateTypeCanComeFromCuratedAnnotation,
            targetCoreferenceAntecedentBindingRequired:audit.targetCoreferenceAntecedentBindingRequired,
            targetSemanticLevelHintExecutable:audit.targetSemanticLevelHintExecutable
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'现有 Relation Target Contract audit 已经人工保存 target/context/predicate/chart binding evidence；进一步结构化后可稳定表达“杀重身轻，财星党杀”的 mixed spans、“官助之”的回指，以及“四食相制”依赖“独杀”的 antecedent target。对有限 source registry，没有必要把古汉语重新交给 runtime parser 猜测。',
        boundary:'本 claim 只冻结 curated source semantic annotation contract 与 validator。它不表示全 corpus 已完成 annotation，也不把 target-level hint、candidate evidence 或 antecedent link 升级成 executable resolver / actor identity / group identity / effect execution。'
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

    const buildAnnotationContractDependency = () => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT',
        kind:'source-audit',
        scope:'curated-relation-source-semantic-annotation-schema-and-validator',
        status:'resolved',
        statement:'有限、可追踪的传统 relation source registry 已有 curated annotation 数据合同：支持 mixed context/relation、多个 relation unit、predicate/source/target role、target mention mode、target-level evidence hint 与 instance binding requirements。',
        boundary:'Contract resolved 不等于 corpus coverage、target resolver、actor/group identity 或 collective effect execution 已完成。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT']
    });

    const buildAnnotationCoverageDependency = (contractDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE',
        kind:'source-coverage',
        scope:'audited-relation-source-registry-semantic-annotation-coverage',
        status:'unresolved',
        statement:'当前只为代表性 theory/chart/mixed/coreference case 建立 curated annotation；尚未证明所有已登记财→官杀、食神→七杀、七杀→印来源与 calibration case 都已迁移到统一 annotation contract。',
        boundary:'不得把局部 annotation 样本当成全 corpus coverage，也不得因 schema 已定义就跳过逐条 source audit。',
        dependsOnDependencyIds:[contractDependency.id]
    });

    const buildCoreferenceDependency = (contractDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-COREFERENCE-ANTECEDENT-BINDING',
        scope:'relation-target-anaphora-and-antecedent-provenance',
        status:'unresolved',
        statement:'“官助之”“四食相制”等来源证明 relation target 可以通过代词或前文先行项表达；程序尚未定义 annotation target mention 如何稳定绑定 antecedent semantic unit，并进一步进入 target-level resolver。',
        boundary:'不得把“之”当作独立 target role，也不得因为前文出现“独杀”就自动生成 hidden actorKey；annotation antecedent link 仍不是 executable actor binding。',
        dependsOnDependencyIds:[contractDependency.id]
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
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyRelationTargetSemanticLevelContractSourceAudit) return base;
        const audit = buildAudit();
        const claim = makeClaim(audit);
        const contractDependency = buildAnnotationContractDependency();
        const coverageDependency = buildAnnotationCoverageDependency(contractDependency);
        const coreferenceDependency = buildCoreferenceDependency(contractDependency);

        const targetSpanDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SPAN-IDENTITY',
            [contractDependency,coverageDependency,coreferenceDependency],
            'Target span identity 不再要求 runtime 古汉语 parser 作为唯一实现路径；对 audited source record，可由 curated annotation 提供 explicit/anaphoric/antecedent-linked target evidence。但 corpus coverage 与 coreference consumer 尚未完成，因此该依赖继续 unresolved。',
            '不得把 annotation 中的 target span/hint 直接当成 executable actor target；跨 clause 回指必须保留 antecedent provenance。'
        );
        const sourceContextDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SOURCE-CONTEXT-CLASSIFICATION',
            [contractDependency,coverageDependency],
            'Source context 对 curated source registry 可由人工审定 annotation 直接提供，不必运行时重新分类；但统一 annotation 尚未覆盖所有 relation source，因此 machine provenance coverage 继续 unresolved。',
            '不得回退为凭“此造”或四柱字样猜 context；context 必须来自 source record provenance 或等价的审定 annotation。'
        );
        const predicateTypeDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-PREDICATE-TYPE-CLASSIFICATION',
            [contractDependency,coverageDependency],
            'Predicate type 对 curated source registry 可由 relation unit annotation 直接提供；但 corpus coverage 未完成，且 annotation predicate 仍不是 effect execution authorization，因此依赖继续 unresolved。',
            '不得用单一“制／生／化／党”关键词直接决定 runtime effect type；predicate type 与 relation semantic hint 都必须保留 source provenance。'
        );
        const mixedSegmentationDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-MIXED-STATEMENT-SPAN-SEGMENTATION',
            [contractDependency,coverageDependency],
            'Mixed statement 可在 curated annotation 中直接保存 configuration context 与一个或多个 relation unit，不必运行时重新把整句强制切成单标签；但全 corpus annotation coverage 尚未完成。',
            'Annotation segmentation 是 source evidence，不表示 target resolver、actor binding 或 effect execution 已完成。'
        );
        const targetLevelResolverDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER',
            [contractDependency,coverageDependency,coreferenceDependency,targetSpanDependency,sourceContextDependency,predicateTypeDependency,mixedSegmentationDependency],
            'Target-level resolver 可改为消费 curated source semantic annotation，而不是先做 runtime 古汉语 NLP；但 annotation coverage、coreference/antecedent binding、chart-local candidate/cardinality/scope binding 仍未闭合，所以 resolver 继续 unresolved。',
            'targetSemanticLevelHint 只是来源语义证据；不得直接把 hint 返回为 executable single actor / actor set，更不得创建 group/member edges。'
        );

        const replacedDependencyIds = new Set([
            contractDependency.id,
            coverageDependency.id,
            coreferenceDependency.id,
            targetSpanDependency.id,
            sourceContextDependency.id,
            predicateTypeDependency.id,
            mixedSegmentationDependency.id,
            targetLevelResolverDependency.id
        ]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => item.id !== claim.id), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            contractDependency,
            coverageDependency,
            coreferenceDependency,
            targetSpanDependency,
            sourceContextDependency,
            predicateTypeDependency,
            mixedSegmentationDependency,
            targetLevelResolverDependency
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
            contextualForcePartyCuratedRelationSourceSemanticAnnotationAudit:audit,
            contextualForcePartyCuratedRelationSourceSemanticAnnotationRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Curated Relation Source Semantic Annotation Audit v0.1：对有限审定来源优先保存人工确认的 semantic annotation，不要求 runtime 重做古汉语 parser。',
                '一个 source record 可以有多个 relation unit；target 可以 explicit、anaphoric 或 antecedent-linked。',
                'targetSemanticLevelHint / chart candidate evidence 均不是 executable target/group identity；coverage、coreference consumer、target resolver 与 collective execution 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-curated-relation-source-semantic-annotation-audit-v01', extendSynthesis);

    GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
