(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyNonStemFoundationAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyNonStemFoundationSource) {
        document.write('<script src="./js/bazi-contextual-force-party-nonstem-foundation-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziContextualForcePartyNonStemFoundationSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, EVIDENCE, FINDINGS, ROLE_SEMANTICS, CONTRACT } = sourceApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const sourceEvidenceIds = freezeArray(EVIDENCE.map((item) => item.id));
    const findingMap = Object.freeze(Object.fromEntries(FINDINGS.map((item) => [item.key, item])));

    const buildActorRoleRecords = (synthesis = {}) => {
        const counterRecords = synthesis.contextualForcePartyCounterContextView?.records || [];
        const records = [];
        counterRecords.forEach((record) => {
            const identity = record.actorIdentity || {};
            const scopes = identity.sourceScopes || [];
            if (scopes.includes('surface-branch')) {
                records.push(Object.freeze({
                    id:`CF-NSF-ROLE-BRANCH-${records.length}`,
                    actorKey:record.anchorActorKey || identity.actorKey || null,
                    sideId:record.sideId || null,
                    actorScope:'surface-branch',
                    semanticRole:ROLE_SEMANTICS.surfaceBranch.semanticRole,
                    zhi:identity.zhi || null,
                    wuxing:identity.wuxing || null,
                    positions:freezeArray(identity.positions || []),
                    stemRootResolverApplicable:false,
                    selfRootPresence:null,
                    substrateRoleResolved:true,
                    substrateQuality:null,
                    substrateQualityResolverDefined:false,
                    nextRequiredContext:'branch-substrate-quality',
                    sourceEvidenceIds:Object.freeze(['CF-NSF-E01','CF-NSF-E02','CF-NSF-E05','CF-NSF-E06','CF-NSF-E07']),
                    numericWeight:null,
                    boundary:'表层地支在此层是 stem/use-god 的 foundation substrate；自身 presence 不等于 substrate quality，也不再寻找 stem-style self-root。'
                }));
            }
            if (scopes.includes('hidden-modifier')) {
                records.push(Object.freeze({
                    id:`CF-NSF-ROLE-HIDDEN-${records.length}`,
                    actorKey:record.anchorActorKey || identity.actorKey || null,
                    sideId:record.sideId || null,
                    actorScope:'hidden-modifier',
                    semanticRole:ROLE_SEMANTICS.hiddenActor.semanticRole,
                    gan:identity.gan || null,
                    zhi:identity.zhi || null,
                    wuxing:identity.wuxing || null,
                    positions:freezeArray(identity.positions || []),
                    stemRootResolverApplicable:false,
                    containmentIsSelfRoot:false,
                    containmentRelationPreserved:true,
                    manifestationState:null,
                    manifestationContextResolverDefined:false,
                    nextRequiredContext:'hidden-manifestation-context',
                    sourceEvidenceIds:Object.freeze(['CF-NSF-E01','CF-NSF-E02','CF-NSF-E04']),
                    numericWeight:null,
                    boundary:'藏干 actor 的“藏于本支”只保存 containment/latent-content identity；不得再次登记成自己的 root，也不得因 presence 自动视为已发用。'
                }));
            }
        });
        return freezeArray(records);
    };

    const buildAudit = (synthesis = {}) => {
        const roleRecords = buildActorRoleRecords(synthesis);
        const branchRecords = freezeArray(roleRecords.filter((item) => item.actorScope === 'surface-branch'));
        const hiddenRecords = freezeArray(roleRecords.filter((item) => item.actorScope === 'hidden-modifier'));
        return Object.freeze({
            id:'CF-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:'source-audited-role-semantics-resolved-quality-resolvers-unresolved',
            sourceEvidenceIds,
            findings:findingMap,
            roleSemantics:ROLE_SEMANTICS,
            roleRecords,
            surfaceBranchRecords:branchRecords,
            hiddenActorRecords:hiddenRecords,
            surfaceBranchActorKeys:freezeArray(unique(branchRecords.map((item) => item.actorKey))),
            hiddenActorKeys:freezeArray(unique(hiddenRecords.map((item) => item.actorKey))),
            surfaceBranchSubstrateRoleResolved:true,
            hiddenActorLatentRoleResolved:true,
            branchSubstrateQualityResolver:null,
            hiddenManifestationContextResolver:null,
            genericNonStemRootResolver:null,
            forceClassification:null,
            relativeDominance:null,
            numericScore:null
        });
    };

    const makeClaim = ({ id, claimKey, status = 'resolved', value, rationale, boundary }) => Object.freeze({
        id,
        claimKey,
        status,
        ruleId:RULE_ID,
        value:Object.freeze(value),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:sourceEvidenceIds,
        rationale,
        boundary
    });

    const buildClaims = (audit = {}) => Object.freeze([
        makeClaim({
            id:'SC-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT',
            claimKey:'strength.contextual-force.party.nonstem-foundation.source-audit',
            value:{
                roleSemanticsResolved:true,
                surfaceBranchRole:'foundation-substrate',
                hiddenActorRole:'latent-contained-content',
                genericNonStemRootResolverDefined:false,
                branchSubstrateQualityResolverDefined:false,
                hiddenManifestationContextResolverDefined:false
            },
            rationale:'《子平真诠》以“支为干之生地，干为支之发用”区分干支方向，并以“支中……静以待用”描述支中内容；《玉井奥诀》又把地支称为宅舍、基业、基址。来源足以冻结 non-stem actor 的角色语义，但没有提供通用质量 resolver。',
            boundary:'Source Audit resolved 只表示 root/substrate/latent-content 的主客关系已厘清；不表示 branch substrate quality、hidden manifestation、Side Force Profile coverage 或 relative dominance 已解析。'
        }),
        makeClaim({
            id:'SC-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-FOUNDATION-ROLE',
            claimKey:'strength.contextual-force.party.nonstem-foundation.surface-branch-role',
            value:{
                applicableActorCount:(audit.surfaceBranchRecords || []).length,
                semanticRole:'foundation-substrate',
                stemRootResolverApplicable:false,
                presenceIsQuality:false,
                qualityResolverDefined:false
            },
            rationale:'地支是天干的生地/宅舍/基业；同一亥支还可分别作为壬禄与甲长生，说明 foundation 是 directed relation，不是 branch self-root。',
            boundary:'地支 actor 自身存在只确认 substrate identity，不生成 substrate quality 或 force classification。'
        }),
        makeClaim({
            id:'SC-CONTEXTUAL-FORCE-PARTY-HIDDEN-ACTOR-FOUNDATION-ROLE',
            claimKey:'strength.contextual-force.party.nonstem-foundation.hidden-actor-role',
            value:{
                applicableActorCount:(audit.hiddenActorRecords || []).length,
                semanticRole:'latent-contained-content',
                stemRootResolverApplicable:false,
                containmentIsSelfRoot:false,
                presenceIsManifestation:false,
                manifestationResolverDefined:false
            },
            rationale:'《子平真诠》明确区分干动与支静，并说支中之物“静以待用”；因此藏干 presence/containment 与实际发用必须分层。',
            boundary:'不得把“藏于本支”再次记为藏干自己的 root，也不得把透清/发用扩大为 actor-global effectiveness。'
        })
    ]);

    const makeDependency = ({ id, scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind:'aggregation',
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

    const buildAuditDependencies = (audit = {}) => {
        const hasBranch = (audit.surfaceBranchRecords || []).length > 0;
        const hasHidden = (audit.hiddenActorRecords || []).length > 0;
        return Object.freeze([
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT',
                scope:'counter-anchor-nonstem-foundation-source-audit',
                status:'resolved',
                statement:'Non-Stem Foundation Source Audit v0.1 已冻结：surface branch 是 foundation substrate，hidden actor 是 latent contained content；两者均不得套用 visible-stem root resolver。',
                boundary:'角色语义 resolved 不等于 substrate quality 或 hidden manifestation resolved。',
                dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-MODEL'],
                resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT']
            }),
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER',
                scope:'surface-branch-substrate-quality',
                status:hasBranch ? 'unresolved' : 'resolved',
                statement:hasBranch
                    ? `当前存在 ${(audit.surfaceBranchRecords || []).length} 个 surface-branch counter anchor；其 substrate role 已解析，但宅舍/基业的具体质量尚无通用 resolver。`
                    : '当前没有 surface-branch counter anchor，因此 branch substrate quality 对本盘 not-applicable。',
                boundary:'不得用 branch presence、藏干数量、十二长生数字化或月令单轴替代 substrate quality。',
                dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT'],
                resolvedByClaimIds:hasBranch ? [] : ['SC-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-FOUNDATION-ROLE']
            }),
            makeDependency({
                id:'SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-ACTOR-MANIFESTATION-CONTEXT-RESOLVER',
                scope:'hidden-actor-manifestation-context',
                status:hasHidden ? 'unresolved' : 'resolved',
                statement:hasHidden
                    ? `当前存在 ${(audit.hiddenActorRecords || []).length} 个 hidden counter actor；其 latent/containment role 已解析，但静待、透清、会局等 manifestation context 尚无通用 resolver。`
                    : '当前没有 hidden counter actor，因此 hidden manifestation context 对本盘 not-applicable。',
                boundary:'藏于支中不等于已发用；不得把 presence、透出或单一 source motif 直接升级为 global effective。',
                dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT'],
                resolvedByClaimIds:hasHidden ? [] : ['SC-CONTEXTUAL-FORCE-PARTY-HIDDEN-ACTOR-FOUNDATION-ROLE']
            })
        ]);
    };

    const rebuildFoundationCoverage = (base = {}, audit = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE') || {};
        const hasBranch = (audit.surfaceBranchRecords || []).length > 0;
        const hasHidden = (audit.hiddenActorRecords || []).length > 0;
        const needsNonStemResolver = hasBranch || hasHidden;
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE',
            status:needsNonStemResolver ? 'unresolved' : current.status || 'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT',
                ...(hasBranch ? ['SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'] : []),
                ...(hasHidden ? ['SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-ACTOR-MANIFESTATION-CONTEXT-RESOLVER'] : [])
            ])),
            resolvedByClaimIds:needsNonStemResolver ? Object.freeze([]) : freezeArray(current.resolvedByClaimIds || []),
            statement:needsNonStemResolver
                ? 'Non-stem actor 的角色语义已厘清：branch 不缺“root”，而缺 substrate quality；hidden actor 不缺“self-root”，而缺 manifestation context。当前这些 resolver 尚未建立，因此 foundation coverage 继续 unresolved。'
                : current.statement || '当前 foundation coverage 状态沿用 Counter Context。',
            boundary:'不得为了消除 blocker 而把 branch/hidden actor 强行塞回 visible-stem root inventory。'
        });
    };

    const rebuildSideForceProfile = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE');
        if (!current) return null;
        return Object.freeze({
            ...current,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT',
                'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'Side Force Profile 的 non-stem foundation 角色边界已解析，但 branch substrate quality、hidden manifestation 与 Relation Effect generalization 等 required inputs 仍未齐全。',
            boundary:'Source role audit 不等于 profile coverage；不得用角色名替代具体质量/作用上下文。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartyCounterContextView) return base;
        const audit = buildAudit(base);
        const claims = buildClaims(audit);
        const auditDependencies = buildAuditDependencies(audit);
        const foundationCoverage = rebuildFoundationCoverage(base, audit);
        const sideForceProfile = rebuildSideForceProfile(base);
        const replacedClaimIds = new Set(claims.map((item) => item.id));
        const replacedDependencyIds = new Set([
            ...auditDependencies.map((item) => item.id),
            foundationCoverage.id,
            ...(sideForceProfile ? [sideForceProfile.id] : [])
        ]);
        const nextClaims = Object.freeze([...(base.claims || []).filter((item) => !replacedClaimIds.has(item.id)), ...claims]);
        const nextDependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)),
            ...auditDependencies,
            foundationCoverage,
            ...(sideForceProfile ? [sideForceProfile] : [])
        ]);
        const conflicts = typeof priorSynthesisApi.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(nextClaims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies:nextDependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;
        return Object.freeze({
            ...base,
            claims:nextClaims,
            dependencies:nextDependencies,
            conflicts,
            contextualForcePartyNonStemFoundationSourceAudit:audit,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Non-Stem Foundation Source Audit v0.1：支为干之生地/宅舍/基业，surface branch 是 foundation substrate，不适用 visible-stem self-root resolver。',
                'hidden actor 是支中 latent contained content；containment 不得再登记为其自身 root，避免同一关系重复计力。',
                'branch substrate role resolved 不等于 substrate quality resolved；hidden latent role resolved 不等于 manifestation resolved。',
                '后续 blocker 收窄为 branch substrate quality 与 hidden manifestation context；Relation Effect generalization 仍独立保留。',
                '本阶段不生成 score/weight、force classification、relative dominance、Party Configuration、Qianli many/few 或 final Assessment。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyNonStemFoundationSourceAudit:buildAudit
    });

    GuiJia.baziContextualForcePartyNonStemFoundationAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        sourceApi,
        buildActorRoleRecords,
        buildAudit,
        buildClaims,
        buildAuditDependencies,
        rebuildFoundationCoverage,
        rebuildSideForceProfile,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyBranchSubstrateQualityAudit) {
        document.write('<script src="./js/bazi-contextual-force-party-branch-substrate-quality-audit.js?v=13.44.0"><\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);
