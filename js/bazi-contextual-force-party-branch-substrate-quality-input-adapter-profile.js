(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapterProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapterContract || null;
    const baziCore = GuiJia.baziCore || {};
    if (!contractApi) return;

    const { VERSION, RULE_ID, FAMILY_KEYS, COVERAGE_STATES, FAMILY_ADAPTERS, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const POSITION_INDEX = Object.freeze({ year:0, month:1, day:2, hour:3 });
    const POSITION_ORDER = Object.freeze(['year','month','day','hour']);

    const dependencyStatus = (synthesis = {}, id = '') =>
        (synthesis.dependencies || []).find((item) => item.id === id)?.status || 'unavailable';

    const candidatePosition = (candidate = {}) => (candidate.positions || [])[0] || null;
    const candidatePillarIndex = (candidate = {}) => {
        const position = candidatePosition(candidate);
        if (position && POSITION_INDEX[position] !== undefined) return POSITION_INDEX[position];
        const match = String(candidate.actorKey || '').match(/^surface-branch:(\d+):/);
        return match ? Number(match[1]) : null;
    };

    const sideForCandidate = (synthesis = {}, candidate = {}) =>
        (synthesis.contextualForcePartySideForceProfileView?.counterSides || [])
            .find((side) => side.sideId === candidate.sideId || side.anchor?.actorKey === candidate.actorKey) || null;

    const counterContextForCandidate = (synthesis = {}, candidate = {}) =>
        (synthesis.contextualForcePartyCounterContextView?.records || [])
            .find((record) => record.sideId === candidate.sideId || record.anchorActorKey === candidate.actorKey) || null;

    const coveringStemIdentity = (semanticModel = {}, synthesis = {}, candidate = {}) => {
        const position = candidatePosition(candidate);
        const pillarIndex = candidatePillarIndex(candidate);
        if (!position || pillarIndex === null) return null;
        if (position === 'day') {
            const daymaster = semanticModel.strengthEvidence?.dayMaster || {};
            if (!daymaster.gan) return null;
            return Object.freeze({
                kind:'daymaster-covering-stem',
                position,
                pillarIndex,
                actorKey:null,
                gan:daymaster.gan || null,
                wuxing:daymaster.wuxing || baziCore.getWuXing?.(daymaster.gan) || null,
                sourceRecordId:null,
                targetRole:'covering-stem-of-branch'
            });
        }
        const stem = (synthesis.qianliQuantitySemanticBridgeInventory?.sourceSurfaceInventory?.stems || [])
            .find((item) => item.position === position) || null;
        if (!stem) return null;
        return Object.freeze({
            kind:'surface-covering-stem',
            position,
            pillarIndex,
            actorKey:stem.actorKey || null,
            gan:stem.gan || null,
            wuxing:stem.wuxing || null,
            sourceRecordId:stem.id || null,
            targetRole:'covering-stem-of-branch'
        });
    };

    const coveringStemReceptionContext = (synthesis = {}, identity = null) => {
        if (!identity) return Object.freeze({
            status:COVERAGE_STATES.UNAVAILABLE,
            realizedRecords:Object.freeze([]),
            nonRealizedRecords:Object.freeze([]),
            blockerRecords:Object.freeze([]),
            daymasterContributionRecords:Object.freeze([])
        });
        if (identity.kind === 'daymaster-covering-stem') {
            const records = freezeArray((synthesis.visibleStemDaymasterContributionRecords || [])
                .filter((item) => ['support','restraint'].includes(item.strengthMeaning)));
            const unresolved = records.filter((item) => String(item.contributionState || '').includes('unresolved') || String(item.realizationState || '').includes('unresolved'));
            return Object.freeze({
                status:unresolved.length ? COVERAGE_STATES.PARTIAL : COVERAGE_STATES.RESOLVED,
                realizedRecords:Object.freeze([]),
                nonRealizedRecords:Object.freeze([]),
                blockerRecords:freezeArray(unresolved.map((item) => Object.freeze({
                    id:`BSQIA-DM-COVER-${item.id}`,
                    upstreamRecordId:item.id || null,
                    reason:'daymaster-related covering-stem reception contribution remains unresolved'
                }))),
                daymasterContributionRecords:records,
                boundary:'日支覆干为日主时，只读取日主相关 support/restraint contribution provenance；不得把 drain/distribution 或 presence 反写成“逢生扶/克制”。'
            });
        }
        const axis = synthesis.contextualForceEvidenceProfile?.axes?.interactionModifier || {};
        const matches = (item = {}) => item.targetActorKey === identity.actorKey;
        const realized = freezeArray((axis.realizedModifierRecords || []).filter(matches));
        const nonRealized = freezeArray((axis.resolvedNonRealizationRecords || []).filter(matches));
        const blockers = freezeArray((axis.blockerRecords || []).filter(matches));
        return Object.freeze({
            status:blockers.length ? COVERAGE_STATES.PARTIAL : COVERAGE_STATES.RESOLVED,
            realizedRecords:realized,
            nonRealizedRecords:nonRealized,
            blockerRecords:blockers,
            daymasterContributionRecords:Object.freeze([]),
            boundary:'只保存实际指向覆干 actor 的 interaction provenance；不按五行潜在关系补写未出现的作用。'
        });
    };

    const rebuildCanonicalBranchStructureCatalog = (semanticModel = {}, synthesis = {}) => {
        const surface = synthesis.qianliQuantitySemanticBridgeInventory?.sourceSurfaceInventory || {};
        const stems = surface.stems || [];
        const branches = surface.branches || [];
        const gans = Array(4).fill(null);
        const zhis = Array(4).fill(null);
        stems.forEach((item) => {
            const index = POSITION_INDEX[item.position];
            if (index !== undefined) gans[index] = item.gan || null;
        });
        const dayGan = semanticModel.strengthEvidence?.dayMaster?.gan || null;
        if (dayGan) gans[POSITION_INDEX.day] = dayGan;
        branches.forEach((item) => {
            const index = POSITION_INDEX[item.position];
            if (index !== undefined) zhis[index] = item.zhi || null;
        });
        if (gans.some((item) => !item) || zhis.some((item) => !item)) return Object.freeze({
            status:'unavailable-incomplete-four-pillar-machine-inventory',
            gans:freezeArray(gans),
            zhis:freezeArray(zhis),
            records:Object.freeze([])
        });
        const rawRelations = baziCore.calculateInternalChartRelations?.(gans, zhis) || [];
        const catalog = baziCore.buildBaziStructureCatalog?.(rawRelations) || rawRelations;
        const canonicalById = Object.fromEntries((semanticModel.structures || []).map((item) => [item.id, item]));
        const records = freezeArray(catalog.filter((item) => baziCore.getBaziRelationMeta?.(item)?.scope === 'branch').map((item) => Object.freeze({
            ...item,
            canonicalStructureId:canonicalById[item.id]?.id || item.id || null,
            canonicalStructureCode:canonicalById[item.id]?.code || item.code || null,
            canonicalStructurePresent:Boolean(canonicalById[item.id])
        })));
        return Object.freeze({
            status:'rebuilt-from-four-pillar-machine-inventory-via-canonical-core',
            gans:freezeArray(gans),
            zhis:freezeArray(zhis),
            records,
            boundary:'仅用同一 baziCore 关系计算器恢复 semanticModel 精简 Structure 已剥离的 participant provenance；不解析展示文本，不新增关系规则。'
        });
    };

    const branchStructureContext = (semanticModel = {}, synthesis = {}, candidate = {}, index = 0) => {
        const pillarIndex = candidatePillarIndex(candidate);
        const catalog = rebuildCanonicalBranchStructureCatalog(semanticModel, synthesis);
        const structures = freezeArray((catalog.records || []).filter((item) =>
            pillarIndex !== null && (item.pillarIndices || []).includes(pillarIndex)
        ));
        return Object.freeze({
            familyKey:FAMILY_ADAPTERS.branchInteraction.key,
            status:COVERAGE_STATES.PARTIAL,
            structureCatalogStatus:catalog.status,
            structureRecords:structures,
            ordinaryElementRelationInventory:null,
            blockerRecords:Object.freeze([Object.freeze({
                id:`BSQIA-BRANCH-ELEMENT-${String(index + 1).padStart(2, '0')}`,
                blockerType:'missing-neutral-branch-element-relation-inventory',
                statement:'现有 Structure 覆盖刑冲合害破、三合三会等机器关系，但没有逐支普通五行生克比和 inventory。'
            })]),
            qualityMapping:null,
            relationCountAsQuality:false,
            boundary:'Structure inventory complete 不等于 branch-interaction input complete；普通五行生克比和缺口必须显式保留。'
        });
    };

    const coveringStemContext = (semanticModel = {}, synthesis = {}, candidate = {}, index = 0) => {
        const identity = coveringStemIdentity(semanticModel, synthesis, candidate);
        const reception = coveringStemReceptionContext(synthesis, identity);
        const blockers = [...(reception.blockerRecords || [])];
        if (!identity) blockers.push(Object.freeze({
            id:`BSQIA-COVER-IDENTITY-${String(index + 1).padStart(2, '0')}`,
            blockerType:'missing-covering-stem-identity',
            statement:'无法从当前四柱 inventory 重建该地支的同柱覆干。'
        }));
        return Object.freeze({
            familyKey:FAMILY_ADAPTERS.coveringStem.key,
            status:!identity ? COVERAGE_STATES.UNAVAILABLE : reception.status,
            coveringStem:identity,
            receptionContext:reception,
            blockerRecords:freezeArray(blockers),
            qualityMapping:null,
            actorGlobalEffectiveness:null,
            boundary:'覆干 identity 与其受生扶/克制 provenance 分层；即使两者可读，也不直接生成支之荫盛衰或 substrate quality。'
        });
    };

    const seasonalContext = (synthesis = {}, candidate = {}, index = 0) => {
        const context = counterContextForCandidate(synthesis, candidate)?.seasonalContext || null;
        const resolved = String(context?.status || '').startsWith('resolved');
        return Object.freeze({
            familyKey:FAMILY_ADAPTERS.seasonal.key,
            status:resolved ? COVERAGE_STATES.RESOLVED : COVERAGE_STATES.PARTIAL,
            seasonalContext:context,
            blockerRecords:resolved ? Object.freeze([]) : Object.freeze([Object.freeze({
                id:`BSQIA-SEASON-${String(index + 1).padStart(2, '0')}`,
                blockerType:'counter-anchor-seasonal-context-unresolved',
                statement:'该地支 actor 的季节状态尚未由 Counter Context 解析。'
            })]),
            qualityMapping:null,
            singleAxisQualityMapping:false,
            boundary:'actor-specific 旺相休囚死可作为输入；resolved 也不表示 substrate quality resolved。'
        });
    };

    const branchNetworkPartyContext = (synthesis = {}, candidate = {}, index = 0) => {
        const side = sideForCandidate(synthesis, candidate);
        const relationEffectStatus = dependencyStatus(synthesis, 'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION');
        const relativeDominanceStatus = dependencyStatus(synthesis, 'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER');
        const blockers = [];
        if (!side) blockers.push(Object.freeze({ id:`BSQIA-NETWORK-SIDE-${index + 1}`, blockerType:'missing-counter-side-profile', statement:'缺少该 branch anchor 的 side profile。' }));
        if (relationEffectStatus !== 'resolved') blockers.push(Object.freeze({ id:`BSQIA-NETWORK-REL-${index + 1}`, blockerType:'relation-effect-generalization-unresolved', dependencyId:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION' }));
        if (relativeDominanceStatus !== 'resolved') blockers.push(Object.freeze({ id:`BSQIA-NETWORK-DOM-${index + 1}`, blockerType:'relative-dominance-unresolved', dependencyId:'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER' }));
        return Object.freeze({
            familyKey:FAMILY_ADAPTERS.branchNetworkParty.key,
            status:blockers.length ? COVERAGE_STATES.PARTIAL : COVERAGE_STATES.RESOLVED,
            sideId:side?.sideId || candidate.sideId || null,
            membershipIdentity:side?.membershipIdentity || null,
            relationEffectContext:side?.relationEffectContext || null,
            visibleHiddenContext:side?.visibleHiddenContext || null,
            relationEffectGeneralizationStatus:relationEffectStatus,
            relativeDominanceStatus,
            blockerRecords:freezeArray(blockers),
            partyMemberCountAsQuality:false,
            qualityMapping:null,
            boundary:'anchor-specific membership/network provenance 可以进入输入档案；党成员数、effect record 数或未解 dominance 不得转成 substrate scalar。'
        });
    };

    const positionalRoleContext = (synthesis = {}, candidate = {}, index = 0) => {
        const pillarIndex = candidatePillarIndex(candidate);
        const position = candidatePosition(candidate);
        const evidence = freezeArray((synthesis.contextualForcePartyMembershipInventory?.evidenceRecords || [])
            .filter((item) => item.actorKey === candidate.actorKey));
        const complete = position !== null && pillarIndex !== null;
        return Object.freeze({
            familyKey:FAMILY_ADAPTERS.positionalRole.key,
            status:complete ? COVERAGE_STATES.RESOLVED : COVERAGE_STATES.UNAVAILABLE,
            position,
            pillarIndex,
            anchorActorKey:candidate.actorKey || null,
            sideId:candidate.sideId || null,
            evidenceRecords:evidence,
            targetRole:'foundation-substrate-of-counter-anchor',
            blockerRecords:complete ? Object.freeze([]) : Object.freeze([Object.freeze({
                id:`BSQIA-POSITION-${String(index + 1).padStart(2, '0')}`,
                blockerType:'missing-position-provenance'
            })]),
            numericPositionWeight:null,
            qualityMapping:null,
            boundary:'年/月/日/时与 anchor role 只作为 provenance；不设置位置分值或固定优先级。'
        });
    };

    const directedCapacityContext = (synthesis = {}, candidate = {}, index = 0) => {
        const side = sideForCandidate(synthesis, candidate);
        const relationEffectStatus = dependencyStatus(synthesis, 'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION');
        const interaction = side?.interactionContext || null;
        const interactionBlockers = interaction?.blockerRecords || [];
        const blockers = [];
        if (relationEffectStatus !== 'resolved') blockers.push(Object.freeze({
            id:`BSQIA-CAPACITY-REL-${String(index + 1).padStart(2, '0')}`,
            blockerType:'relation-effect-generalization-unresolved',
            dependencyId:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'
        }));
        interactionBlockers.forEach((item, blockerIndex) => blockers.push(Object.freeze({
            id:`BSQIA-CAPACITY-INTERACTION-${index + 1}-${blockerIndex + 1}`,
            blockerType:'target-interaction-realization-unresolved',
            upstreamRecordId:item.id || null
        })));
        return Object.freeze({
            familyKey:FAMILY_ADAPTERS.directedCapacity.key,
            status:blockers.length ? COVERAGE_STATES.PARTIAL : COVERAGE_STATES.RESOLVED,
            relationEffectRecords:freezeArray(side?.relationEffectContext?.records || []),
            interactionContext:interaction,
            relationEffectGeneralizationStatus:relationEffectStatus,
            blockerRecords:freezeArray(blockers),
            latentFiveElementRelationAsCapacity:false,
            qualityMapping:null,
            boundary:'能生扶/耗散/冲合/变化何神只消费已解析 target-specific relation/interaction provenance；潜在五行关系不得冒充 capacity。'
        });
    };

    const buildCandidateInputRecord = (semanticModel = {}, synthesis = {}, candidate = {}, index = 0) => {
        const familyRecords = freezeArray([
            coveringStemContext(semanticModel, synthesis, candidate, index),
            branchStructureContext(semanticModel, synthesis, candidate, index),
            seasonalContext(synthesis, candidate, index),
            branchNetworkPartyContext(synthesis, candidate, index),
            positionalRoleContext(synthesis, candidate, index),
            directedCapacityContext(synthesis, candidate, index)
        ]);
        const blockerRecords = freezeArray(familyRecords.flatMap((item) => item.blockerRecords || []));
        const mappedKeys = unique(familyRecords.map((item) => item.familyKey));
        return Object.freeze({
            id:`CF-BSQIA-${String(index + 1).padStart(2, '0')}`,
            actorKey:candidate.actorKey || null,
            sideId:candidate.sideId || null,
            zhi:candidate.zhi || null,
            wuxing:candidate.wuxing || null,
            positions:freezeArray(candidate.positions || []),
            pillarIndex:candidatePillarIndex(candidate),
            qualityScope:candidate.qualityScope || 'target-contextual-foundation-substrate-quality',
            familyRecords,
            mappedFamilyKeys:freezeArray(mappedKeys),
            familyInventoryComplete:FAMILY_KEYS.every((key) => mappedKeys.includes(key)),
            upstreamSemanticCoverageComplete:blockerRecords.length === 0,
            blockerRecords,
            substrateQuality:null,
            crossAxisComparison:null,
            numericScore:null,
            scalarQuality:null
        });
    };

    const buildAdapterView = (semanticModel = {}, synthesis = {}) => {
        const sourceAudit = synthesis.contextualForcePartyBranchSubstrateQualitySourceAudit || {};
        const candidates = sourceAudit.branchCandidates || [];
        const records = freezeArray(candidates.map((candidate, index) => buildCandidateInputRecord(semanticModel, synthesis, candidate, index)));
        const inventoryComplete = records.every((record) => record.familyInventoryComplete === true);
        const upstreamSemanticCoverageComplete = records.every((record) => record.upstreamSemanticCoverageComplete === true);
        const blockerRecords = freezeArray(records.flatMap((record) => record.blockerRecords || []));
        return Object.freeze({
            id:'CF-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-ADAPTER-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:!inventoryComplete
                ? 'mapped-partial-family-inventory'
                : upstreamSemanticCoverageComplete
                    ? 'mapped-complete-input-and-upstream-coverage'
                    : 'mapped-complete-family-inventory-upstream-partial',
            candidateRecords:records,
            candidateActorKeys:freezeArray(records.map((item) => item.actorKey)),
            requiredFamilyKeys:FAMILY_KEYS,
            structuralInventoryCoverageComplete:inventoryComplete,
            upstreamSemanticCoverageComplete,
            blockerRecords,
            blockerIds:freezeArray(unique(blockerRecords.map((item) => item.id))),
            branchElementRelationInventoryDefined:false,
            crossAxisComparison:null,
            substrateQuality:null,
            numericScore:null,
            scalarQuality:null,
            boundary:'Adapter coverage 只说明六类来源输入是否有稳定映射与哪些上游语义仍缺；family record 完整不等于其语义已解析，更不等于 substrate quality 可求。'
        });
    };

    GuiJia.baziContextualForcePartyBranchSubstrateQualityInputAdapterProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        FAMILY_KEYS,
        COVERAGE_STATES,
        FAMILY_ADAPTERS,
        CONTRACT,
        POSITION_ORDER,
        dependencyStatus,
        candidatePosition,
        candidatePillarIndex,
        sideForCandidate,
        counterContextForCandidate,
        coveringStemIdentity,
        coveringStemReceptionContext,
        rebuildCanonicalBranchStructureCatalog,
        coveringStemContext,
        branchStructureContext,
        seasonalContext,
        branchNetworkPartyContext,
        positionalRoleContext,
        directedCapacityContext,
        buildCandidateInputRecord,
        buildAdapterView
    });
})(typeof window !== 'undefined' ? window : globalThis);