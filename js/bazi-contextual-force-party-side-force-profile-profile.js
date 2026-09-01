(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySideForceProfileProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartySideForceProfileContract || null;
    if (!contractApi) return;

    const { VERSION, RULE_ID, SIDE_TYPES, CONTEXT_FAMILIES, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const dependencyStatus = (synthesis = {}, id = '') =>
        (synthesis.dependencies || []).find((item) => item.id === id)?.status || 'unavailable';

    const membershipActorMap = (inventory = {}) => new Map(
        (inventory.actorProfiles || []).map((item) => [item.actorKey, item])
    );

    const membershipEvidenceFor = (inventory = {}, actorKeys = []) => {
        const allowed = new Set(actorKeys);
        return freezeArray((inventory.evidenceRecords || []).filter((item) => allowed.has(item.actorKey)));
    };

    const affiliationRecordsForAnchor = (synthesis = {}, anchorActorKey = '') => freezeArray(
        (synthesis.contextualForcePartyAffiliationView?.records || [])
            .filter((item) => item.targetActorKey === anchorActorKey)
    );

    const relationEffectRecordsForAnchor = (synthesis = {}, anchorActorKey = '') => freezeArray(
        (synthesis.contextualForcePartyRelationEffectView?.records || [])
            .filter((item) => item.anchorActorKey === anchorActorKey)
    );

    const positionContextFor = (inventory = {}, actorKeys = []) => freezeArray(
        membershipEvidenceFor(inventory, actorKeys).map((item) => Object.freeze({
            evidenceRecordId:item.id || null,
            actorKey:item.actorKey || null,
            sourceScope:item.sourceScope || null,
            position:item.position || null,
            pillarIndex:item.pillarIndex ?? null,
            gan:item.gan || null,
            zhi:item.zhi || null,
            relationToDayMaster:item.relationToDayMaster || null,
            numericWeight:null
        }))
    );

    const interactionContextFor = (profile = {}, actorKeys = []) => {
        const allowed = new Set(actorKeys);
        const axis = profile.axes?.interactionModifier || {};
        const targetMatches = (item = {}) => item.targetActorKey && allowed.has(item.targetActorKey);
        return Object.freeze({
            family:CONTEXT_FAMILIES.INTERACTION,
            status:String(axis.status || '').includes('unresolved')
                ? 'mapped-with-upstream-blockers'
                : 'mapped-resolved-upstream-context',
            realizedModifierRecords:freezeArray((axis.realizedModifierRecords || []).filter(targetMatches)),
            resolvedNonRealizationRecords:freezeArray((axis.resolvedNonRealizationRecords || []).filter(targetMatches)),
            qualifierRecords:freezeArray((axis.qualifierRecords || []).filter((item) => item.actorKey && allowed.has(item.actorKey))),
            blockerRecords:freezeArray((axis.blockerRecords || []).filter(targetMatches)),
            numericValue:null,
            scalarForce:null,
            boundary:'Interaction 只按被修正的 target actor 挂接到 side profile；同一 modifier 不因 side view 而复制成新的力量单位。'
        });
    };

    const visibleHiddenContextFor = (inventory = {}, actorKeys = []) => {
        const records = membershipEvidenceFor(inventory, actorKeys);
        return Object.freeze({
            family:CONTEXT_FAMILIES.VISIBLE_HIDDEN,
            records,
            visibleRecords:freezeArray(records.filter((item) => item.sourceScope !== 'hidden-modifier')),
            hiddenRecords:freezeArray(records.filter((item) => item.sourceScope === 'hidden-modifier')),
            equalWeight:false,
            numericWeight:null,
            boundary:'明见、藏见与根基来源只保留 provenance scope；进入同一 side view 不表示等权。'
        });
    };

    const buildDaymasterSide = (synthesis = {}) => {
        const inventory = synthesis.contextualForcePartyMembershipInventory || {};
        const actorMap = membershipActorMap(inventory);
        const actorKeys = freezeArray(inventory.daymasterSideActorKeys || []);
        const evidenceProfile = synthesis.contextualForceEvidenceProfile || {};
        const axes = evidenceProfile.axes || {};
        const interaction = interactionContextFor(evidenceProfile, actorKeys);
        const membershipProfiles = freezeArray(actorKeys.map((key) => actorMap.get(key)).filter(Boolean));
        return Object.freeze({
            sideId:'party-side:daymaster',
            sideType:SIDE_TYPES.DAYMASTER,
            anchor:Object.freeze({ kind:'daymaster', actorKey:null, excludedFromMemberCount:true }),
            associatedActorKeys:actorKeys,
            membershipIdentity:Object.freeze({
                family:CONTEXT_FAMILIES.MEMBERSHIP_IDENTITY,
                directSeedActorKeys:actorKeys,
                actorProfiles:membershipProfiles,
                anchorSpecificAffiliationRecords:Object.freeze([]),
                realizedMemberCount:null,
                activeMemberCount:null,
                boundary:'日主是 side anchor 而不是成员；direct seed 只是身份候选，不等于 active member。'
            }),
            seasonalStanding:Object.freeze({
                family:CONTEXT_FAMILIES.SEASONAL_STANDING,
                scope:'daymaster-seasonal-background',
                status:axes.seasonalStanding?.status || 'unavailable',
                value:axes.seasonalStanding?.value || null,
                sourceEffectIds:freezeArray(axes.seasonalStanding?.sourceEffectIds || []),
                numericValue:null,
                boundary:'得时／失时只作为日主侧季节背景，不是 side force 结论。'
            }),
            foundationContext:Object.freeze({
                family:CONTEXT_FAMILIES.FOUNDATION,
                scope:'daymaster-root-foundation',
                status:axes.rootFoundation?.status || 'unavailable',
                exactRoot:axes.rootFoundation?.exactRoot || null,
                sameElementRoot:axes.rootFoundation?.sameElementRoot || null,
                effectivenessClassification:axes.rootFoundation?.rootEffectivenessClassification || null,
                numericWeight:null,
                boundary:'根存在与根效力分层；root actor 数量不转换为 side force。'
            }),
            relationEffectContext:Object.freeze({
                family:CONTEXT_FAMILIES.RELATION_EFFECT,
                records:Object.freeze([]),
                boundary:'当前已登记 cross-actor relation-effect motifs 都以具体 counter anchor 为作用中心；不把 opposition 的“扶身结果”改写成日主侧 membership/effect unit。'
            }),
            visibleHiddenContext:visibleHiddenContextFor(inventory, actorKeys),
            interactionContext:interaction,
            positionContext:Object.freeze({
                family:CONTEXT_FAMILIES.POSITION,
                records:positionContextFor(inventory, actorKeys),
                numericWeight:null,
                boundary:'柱位只保留上下文，不设置距离分值或位置权重。'
            }),
            forceClassification:null,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        });
    };

    const buildCounterSide = (synthesis = {}, anchorActorKey = '') => {
        const inventory = synthesis.contextualForcePartyMembershipInventory || {};
        const actorMap = membershipActorMap(inventory);
        const anchorProfile = actorMap.get(anchorActorKey) || null;
        const affiliations = affiliationRecordsForAnchor(synthesis, anchorActorKey);
        const realizedAffiliations = affiliations.filter((item) => item.affiliated === true);
        const affiliatedActorKeys = unique(realizedAffiliations.map((item) => item.sourceActorKey));
        const associatedActorKeys = freezeArray(unique([anchorActorKey, ...affiliatedActorKeys]));
        const relationEffects = relationEffectRecordsForAnchor(synthesis, anchorActorKey);
        const evidenceProfile = synthesis.contextualForceEvidenceProfile || {};
        const interaction = interactionContextFor(evidenceProfile, associatedActorKeys);
        const anchorId = (anchorProfile?.counterAnchorIds || [])[0] || `counter-anchor:${anchorActorKey}`;
        return Object.freeze({
            sideId:`party-side:${anchorId}`,
            sideType:SIDE_TYPES.COUNTER_ANCHOR,
            anchor:Object.freeze({ kind:'counter-anchor', actorKey:anchorActorKey, anchorId }),
            associatedActorKeys,
            membershipIdentity:Object.freeze({
                family:CONTEXT_FAMILIES.MEMBERSHIP_IDENTITY,
                anchorProfile,
                anchorSpecificAffiliationRecords:affiliations,
                affiliatedActorKeys:freezeArray(affiliatedActorKeys),
                affiliationIsAnchorSpecific:true,
                globalMembershipMutation:null,
                realizedMemberCount:null,
                activeMemberCount:null,
                boundary:'每个 counter anchor 独立成 side profile；realized affiliation 只附着于该 anchor，不把多个 counter anchors 合并成一党。'
            }),
            seasonalStanding:Object.freeze({
                family:CONTEXT_FAMILIES.SEASONAL_STANDING,
                scope:'counter-anchor-seasonal-standing',
                status:'unresolved-no-counter-anchor-seasonal-resolver',
                value:null,
                daymasterSeasonalReference:evidenceProfile.axes?.seasonalStanding || null,
                referenceOnly:true,
                numericValue:null,
                boundary:'现有季节轴是日主 standing；只能作为全局月令参考，不能复制成 counter anchor 的季节强度。'
            }),
            foundationContext:Object.freeze({
                family:CONTEXT_FAMILIES.FOUNDATION,
                scope:'counter-anchor-foundation',
                status:'unresolved-no-counter-anchor-foundation-resolver',
                rootRecords:Object.freeze([]),
                effectivenessClassification:null,
                numericWeight:null,
                boundary:'现有 rootFoundation 是日主根基语义；不能借用来判断 counter anchor 自身根基。'
            }),
            relationEffectContext:Object.freeze({
                family:CONTEXT_FAMILIES.RELATION_EFFECT,
                records:relationEffects,
                augmentationRecords:freezeArray(relationEffects.filter((item) => item.relationType === 'anchor-augmentation')),
                oppositionRecords:freezeArray(relationEffects.filter((item) => item.relationType === 'anchor-opposition')),
                mediationRecords:freezeArray(relationEffects.filter((item) => item.relationType === 'anchor-mediation')),
                numericValue:null,
                boundary:'augmentation/opposition/mediation 保持不同语义和原 relation identity；不折成正负总量。'
            }),
            visibleHiddenContext:visibleHiddenContextFor(inventory, associatedActorKeys),
            interactionContext:interaction,
            positionContext:Object.freeze({
                family:CONTEXT_FAMILIES.POSITION,
                records:positionContextFor(inventory, associatedActorKeys),
                numericWeight:null,
                boundary:'anchor 与其 anchor-specific affiliated actor 的柱位仅保留 provenance，不生成位置分值。'
            }),
            forceClassification:null,
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        });
    };

    const makeBlocker = (id, family, scope, statement, actorKey = null) => Object.freeze({
        id,
        family,
        scope,
        actorKey,
        status:'unresolved',
        statement,
        numericValue:null
    });

    const buildCoverageBlockers = (synthesis = {}, sideProfiles = []) => {
        const blockers = [];
        if (dependencyStatus(synthesis, 'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION') !== 'resolved') {
            blockers.push(makeBlocker(
                'CF-SFP-B01',
                CONTEXT_FAMILIES.RELATION_EFFECT,
                'generic-relation-effect-coverage',
                'Cross-Actor Relation Effect 仍只有已登记 source-backed motifs；generic relation family coverage 未完成。'
            ));
        }
        sideProfiles.filter((item) => item.sideType === SIDE_TYPES.COUNTER_ANCHOR).forEach((side, index) => {
            blockers.push(makeBlocker(
                `CF-SFP-B-SEASON-${String(index + 1).padStart(2, '0')}`,
                CONTEXT_FAMILIES.SEASONAL_STANDING,
                side.sideId,
                '当前没有 counter-anchor-specific seasonal standing resolver；不得复制日主季节轴。',
                side.anchor.actorKey
            ));
            blockers.push(makeBlocker(
                `CF-SFP-B-FOUNDATION-${String(index + 1).padStart(2, '0')}`,
                CONTEXT_FAMILIES.FOUNDATION,
                side.sideId,
                '当前没有 counter-anchor-specific foundation resolver；不得把日主根基轴借给对侧。',
                side.anchor.actorKey
            ));
            (side.interactionContext.blockerRecords || []).forEach((item, blockerIndex) => blockers.push(makeBlocker(
                `CF-SFP-B-INTERACTION-${String(index + 1).padStart(2, '0')}-${String(blockerIndex + 1).padStart(2, '0')}`,
                CONTEXT_FAMILIES.INTERACTION,
                side.sideId,
                '该 side 关联 actor 仍有具体 interaction realization 未解析。',
                item.targetActorKey || side.anchor.actorKey
            )));
        });
        return freezeArray(blockers);
    };

    const buildSideForceProfileView = (synthesis = {}) => {
        const inventory = synthesis.contextualForcePartyMembershipInventory || {};
        const daymasterSide = buildDaymasterSide(synthesis);
        const counterSides = freezeArray((inventory.counterAnchorActorKeys || []).map((actorKey) => buildCounterSide(synthesis, actorKey)));
        const sideProfiles = freezeArray([daymasterSide, ...counterSides]);
        const blockerRecords = buildCoverageBlockers(synthesis, sideProfiles);
        const globalContext = Object.freeze({
            daymasterSeasonalStanding:synthesis.contextualForceEvidenceProfile?.axes?.seasonalStanding || null,
            branchQiContext:synthesis.contextualForceEvidenceProfile?.axes?.branchQiContext || null,
            hiddenModifierAxis:synthesis.contextualForceEvidenceProfile?.axes?.hiddenModifier || null,
            relationEffectGeneralizationStatus:dependencyStatus(synthesis, 'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'),
            qualitativeComparisonRule:null,
            numericScore:null,
            scalarForce:null,
            boundary:'Global context 只保存尚不能可靠归属于某一 side 的背景轴；不会被复制成各侧力量值。'
        });
        return Object.freeze({
            status:blockerRecords.length ? 'mapped-partial-required-input-coverage' : 'mapped-complete-required-input-coverage',
            modelStatus:'mapped-side-relative-qualitative-inventory',
            sideProfiles,
            daymasterSide,
            counterSides,
            globalContext,
            blockerRecords,
            coverageComplete:blockerRecords.length === 0,
            forceClassification:null,
            qualitativeComparison:null,
            relativeDominance:null,
            partyConfiguration:null,
            memberCount:null,
            activeMemberCount:null,
            relationEffectCountAsForce:null,
            numericScore:null,
            scalarForce:null,
            boundary:'Side Force Profile 是 provenance-preserving inventory；profile 数组长度、member identity 或 relation-effect records 都不是 force score。'
        });
    };

    GuiJia.baziContextualForcePartySideForceProfileProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SIDE_TYPES,
        CONTEXT_FAMILIES,
        CONTRACT,
        dependencyStatus,
        membershipActorMap,
        membershipEvidenceFor,
        affiliationRecordsForAnchor,
        relationEffectRecordsForAnchor,
        positionContextFor,
        interactionContextFor,
        visibleHiddenContextFor,
        buildDaymasterSide,
        buildCounterSide,
        buildCoverageBlockers,
        buildSideForceProfileView
    });
})(typeof window !== 'undefined' ? window : globalThis);
