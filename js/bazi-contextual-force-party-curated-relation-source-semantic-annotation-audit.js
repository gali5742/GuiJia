(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationAudit?.installed) return;

    // Research bootstrap prerequisite: ./js/bazi-contextual-force-party-curated-relation-source-semantic-annotation-source.js?v=13.44.0

    const sourceApi = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const {
        VERSION,
        RULE_ID,
        ANNOTATIONS,
        FINITE_TARGET_AUDIT_CORPUS_COVERAGE,
        FINDINGS,
        CONTRACT,
        validateRegistry,
        validateFiniteTargetAuditCorpusCoverage
    } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceEvidenceIds = freezeArray(ANNOTATIONS.map((item) => item.id));

    const buildAudit = () => {
        const validation = validateRegistry(ANNOTATIONS);
        const finiteCoverage = validateFiniteTargetAuditCorpusCoverage(ANNOTATIONS);
        const relationUnits = ANNOTATIONS.flatMap((item) => item.relationUnits || []);
        const mixedRecords = ANNOTATIONS.filter((item) => (item.contextSpans || []).length > 0 && (item.relationUnits || []).length > 0);
        const zeroRelationUnitRecords = ANNOTATIONS.filter((item) => !(item.relationUnits || []).length);
        const coreferenceUnits = relationUnits.filter((unit) => ['anaphoric','antecedent-linked'].includes(unit.target?.mentionMode));
        const instanceHintUnits = relationUnits.filter((unit) => ['single-actor','actor-set'].includes(unit.target?.semanticLevelHint));
        return Object.freeze({
            id:'CF-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-AUDIT-V02',
            version:VERSION,
            ruleId:RULE_ID,
            status:!validation.valid
                ? 'curated-source-semantic-annotation-contract-invalid'
                : finiteCoverage.complete
                    ? 'finite-target-audit-corpus-annotated-broader-coverage-unresolved'
                    : 'finite-target-audit-corpus-coverage-partial',
            sourceContract:CONTRACT,
            annotationCount:ANNOTATIONS.length,
            relationUnitCount:relationUnits.length,
            mixedRecordIds:freezeArray(mixedRecords.map((item) => item.id)),
            zeroRelationUnitRecordIds:freezeArray(zeroRelationUnitRecords.map((item) => item.id)),
            coreferenceRelationUnitIds:freezeArray(coreferenceUnits.map((item) => item.id)),
            instanceHintRelationUnitIds:freezeArray(instanceHintUnits.map((item) => item.id)),
            registryValidation:validation,
            finiteTargetAuditCorpusCoverage:finiteCoverage,
            finiteTargetAuditCorpusCoverageComplete:finiteCoverage.complete,
            broaderRelationSourceRegistryCoverageComplete:false,
            curatedAnnotationContractDefined:true,
            runtimeClassicalChineseParserRequiredForAuditedCorpus:false,
            sourceContextCanComeFromCuratedAnnotation:true,
            predicateTypeCanComeFromCuratedAnnotation:true,
            zeroRelationUnitAnnotationsSupported:true,
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
            zeroRelationUnitAnnotationsSupported:audit.zeroRelationUnitAnnotationsSupported,
            finiteTargetAuditCorpusCoverageComplete:audit.finiteTargetAuditCorpusCoverageComplete,
            broaderRelationSourceRegistryCoverageComplete:audit.broaderRelationSourceRegistryCoverageComplete,
            targetCoreferenceAntecedentBindingRequired:audit.targetCoreferenceAntecedentBindingRequired,
            targetSemanticLevelHintExecutable:audit.targetSemanticLevelHintExecutable
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale:'Relation Target Contract 的 8 个 audit case 现已逐条进入 curated annotation：relation-event / generalized-rule case 保存 relation units，configuration-state 与无 relation-target 的 instance-description case 则以零 relation-unit disposition 保存。有限审定 corpus 因而不需要 runtime 古汉语 parser 才能保留 source context / predicate / target-level evidence。',
        boundary:'8-case finite target-audit corpus coverage complete 不等于所有财→官杀、食神→七杀、七杀→印、modern-support、position 或 competing-path 来源已统一 annotation；target-level hint、candidate evidence、antecedent link 仍不等于 executable resolver / actor identity / group identity / effect execution。'
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
        statement:'有限、可追踪的传统 relation source registry 已有 curated annotation 数据合同：支持 mixed context/relation、多个或零 relation unit、predicate/source/target role、target mention mode、target-level evidence hint 与 instance binding requirements。',
        boundary:'Contract resolved 不等于 broader corpus coverage、target resolver、actor/group identity 或 collective effect execution 已完成。',
        dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT'],
        resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT']
    });

    const buildFiniteTargetAuditCorpusCoverageDependency = (contractDependency = {}, audit = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE',
        kind:'source-coverage',
        scope:'relation-target-semantic-level-contract-eight-case-audit-corpus',
        status:audit.finiteTargetAuditCorpusCoverageComplete ? 'resolved' : 'unresolved',
        statement:audit.finiteTargetAuditCorpusCoverageComplete
            ? 'Relation Target Semantic Level Contract 的 8 个 audit case 已全部有 validated curated annotation；03/05/07/08 已补齐，07/08 明确保留零 relation-unit disposition。'
            : 'Relation Target Semantic Level Contract 的 finite audit corpus 尚有未 annotation case。',
        boundary:'这里只证明 8-case target-level audit corpus coverage；不得把它提升为全部 relation source registry coverage。',
        dependsOnDependencyIds:[contractDependency.id],
        resolvedByClaimIds:audit.finiteTargetAuditCorpusCoverageComplete
            ? ['SC-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT']
            : []
    });

    const buildAnnotationCoverageDependency = (contractDependency = {}, finiteCoverageDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE',
        kind:'source-coverage',
        scope:'broader-audited-relation-source-registry-semantic-annotation-coverage',
        status:'unresolved',
        statement:'Relation Target 8-case finite audit corpus 已覆盖，但尚未证明所有已登记财→官杀、食神→七杀、七杀→印来源，以及 modern-support / position / competing-path calibration records 都已迁移到统一 annotation contract。',
        boundary:'不得把 finite target-audit coverage 当成 broader relation-source coverage；后续必须按 source registry 逐批审定。',
        dependsOnDependencyIds:[contractDependency.id,finiteCoverageDependency.id]
    });

    const buildCoreferenceDependency = (contractDependency = {}) => makeDependency({
        id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-COREFERENCE-ANTECEDENT-BINDING',
        scope:'relation-target-anaphora-and-antecedent-provenance',
        status:'unresolved',
        statement:'“官助之”“四食相制”等来源证明 relation target 可以通过代词或前文先行项表达；annotation 已保存 provenance，但 consumer 尚未定义如何稳定绑定 antecedent semantic unit 并进入 target-level resolver。',
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
        const finiteCoverageDependency = buildFiniteTargetAuditCorpusCoverageDependency(contractDependency, audit);
        const coverageDependency = buildAnnotationCoverageDependency(contractDependency, finiteCoverageDependency);
        const coreferenceDependency = buildCoreferenceDependency(contractDependency);

        const targetSpanDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SPAN-IDENTITY',
            [contractDependency,finiteCoverageDependency,coverageDependency,coreferenceDependency],
            '8-case target audit corpus 的 target/configuration/no-target disposition 已全部由 curated annotation 保存；但 broader registry coverage 与 coreference consumer 尚未完成，因此全局 target-span dependency 继续 unresolved。',
            '不得把 annotation 中的 target span/hint 直接当成 executable actor target；07/08 证明 consumer 必须允许 configuration-only 与 no-relation-target disposition。'
        );
        const sourceContextDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SOURCE-CONTEXT-CLASSIFICATION',
            [contractDependency,finiteCoverageDependency,coverageDependency],
            'Relation Target 8-case audit corpus 的 source context 已全部由人工审定 annotation 提供，不必 runtime 重分类；但 broader relation source registry 尚未全覆盖，因此全局 machine provenance coverage 继续 unresolved。',
            '不得回退为凭“此造”或四柱字样猜 context；context 必须来自 source record provenance 或等价的审定 annotation。'
        );
        const predicateTypeDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-PREDICATE-TYPE-CLASSIFICATION',
            [contractDependency,finiteCoverageDependency,coverageDependency],
            '8-case target audit corpus 的 source predicate type 已全部 curated，包括 generalized-rule、relation-event、configuration-state 与 instance-description；但 broader corpus coverage 未完成，且 predicate annotation 仍不是 effect execution authorization。',
            '不得用单一“制／生／化／党”关键词直接决定 runtime effect type；predicate type 与 relation semantic hint 都必须保留 source provenance。'
        );
        const mixedSegmentationDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-MIXED-STATEMENT-SPAN-SEGMENTATION',
            [contractDependency,finiteCoverageDependency,coverageDependency],
            '8-case audit corpus 的 mixed statement 已由 curated contextSpans / relationUnits 表达；07/08 又验证零 relation-unit 记录合法。但 broader corpus annotation coverage 未完成，因此全局 segmentation dependency 继续 unresolved。',
            'Annotation segmentation 是 source evidence，不表示 target resolver、actor binding 或 effect execution 已完成。'
        );
        const targetLevelResolverDependency = rebuildDependency(
            base,
            'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER',
            [contractDependency,finiteCoverageDependency,coverageDependency,coreferenceDependency,targetSpanDependency,sourceContextDependency,predicateTypeDependency,mixedSegmentationDependency],
            'Target-level resolver 已不再被 Relation Target 8-case annotation 缺口阻塞；但 broader source coverage、coreference/antecedent consumer、chart-local candidate/cardinality/scope binding 仍未闭合，所以全局 resolver 继续 unresolved。',
            'targetSemanticLevelHint 只是来源语义证据；不得直接把 hint 返回为 executable single actor / actor set，更不得创建 group/member edges。'
        );

        const replacedDependencyIds = new Set([
            contractDependency.id,
            finiteCoverageDependency.id,
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
            finiteCoverageDependency,
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
                'Curated Relation Source Semantic Annotation Audit v0.2：Relation Target 8-case finite audit corpus 已完成逐条 curated annotation，不要求 runtime 重做古汉语 parser。',
                '03/05 分别补齐 theory role-class 与 chart actor-set evidence；07/08 明确验证 configuration-only / no-relation-target annotation 可以有零 relation unit。',
                'Finite target-audit corpus coverage 已 resolved，但 broader relation source registry annotation coverage 继续 unresolved。',
                'targetSemanticLevelHint / chart candidate evidence 均不是 executable target/group identity；coreference consumer、global target resolver、broader coverage 继续 unresolved。'
            ])
        });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-curated-relation-source-semantic-annotation-audit-v02', extendSynthesis);

    GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        buildAudit,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);