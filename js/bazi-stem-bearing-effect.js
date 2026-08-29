(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziStemBearingEffect?.installed) return;

    const baziCore = GuiJia.baziCore || {};
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const STEM_BEARING_EFFECT_VERSION = '0.1';
    const STEM_BEARING_EFFECT_RULE_ID = 'BAZI-STRENGTH-STEM-BEARING-EFFECT-001';

    const sourceBearingStates = Object.freeze({
        FORTIFIED_BY_SUPPORT:'source-bearing-fortified-by-support',
        DAMAGED_BY_CLASH:'source-bearing-damaged-by-clash',
        NOT_CARRIED_AS_IF_ABSENT:'source-not-carried-as-if-absent'
    });

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({
            source:'《滴天髓阐微·干支总论》',
            term:'干以载之支为切，支以覆之干为切',
            supports:Object.freeze(['same-pillar-stem-branch-bearing-pair'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》命例一',
            chart:'己亥 丁卯 庚申 庚辰',
            term:'地支载以卯木财星，又得亥水生扶有情，丁火之根愈固',
            supports:Object.freeze(['source-bearing-fortified-by-support'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》命例二',
            chart:'己酉 丁卯 庚辰 甲申',
            term:'卯酉逢冲，克败丁火之根，支中少水，财星有克无生',
            supports:Object.freeze(['source-bearing-damaged-by-clash'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》命例二',
            chart:'己酉 丁卯 庚辰 甲申',
            term:'虽时透甲木临于申支，谓地支不载，虽有若无',
            supports:Object.freeze(['source-not-carried-as-if-absent'])
        })
    ]);

    const DIRECT_SOURCE_PATTERNS = Object.freeze([
        Object.freeze({
            id:'DTS-STEM-BEARING-DING-MAO-HAI-SUPPORT-001',
            chartKey:'己亥|丁卯|庚申|庚辰',
            pillarIndex:1,
            stemGan:'丁',
            bearingZhi:'卯',
            supportPillarIndex:0,
            supportZhi:'亥',
            state:sourceBearingStates.FORTIFIED_BY_SUPPORT,
            sourceTerm:'地支载以卯木财星，又得亥水生扶有情，丁火之根愈固',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-STEM-BEARING-DING-MAO-YOU-DAMAGE-001',
            chartKey:'己酉|丁卯|庚辰|甲申',
            pillarIndex:1,
            stemGan:'丁',
            bearingZhi:'卯',
            attackerPillarIndex:0,
            attackerZhi:'酉',
            requiredStructureCode:'BRANCH_SIX_CLASH',
            state:sourceBearingStates.DAMAGED_BY_CLASH,
            sourceTerm:'卯酉逢冲，克败丁火之根，支中少水，财星有克无生',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-STEM-BEARING-JIA-SHEN-NOT-CARRIED-001',
            chartKey:'己酉|丁卯|庚辰|甲申',
            pillarIndex:3,
            stemGan:'甲',
            bearingZhi:'申',
            state:sourceBearingStates.NOT_CARRIED_AS_IF_ABSENT,
            sourceTerm:'虽时透甲木临于申支，谓地支不载，虽有若无',
            scope:'exact-source-case-only'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'STEM-BEARING-EFFECT-CONTRACT-001',
        version:STEM_BEARING_EFFECT_VERSION,
        sourceSystem:'DTS-stem-bearing',
        inputLevel:'visible-stem-x-same-pillar-branch',
        samePillarBearingPair:true,
        projectRootRoleIndependent:true,
        sourceBearingStateMapsToGenericVisibleEffectiveness:false,
        sourceNotCarriedMapsToIneffective:false,
        sourceBearingFortifiedMapsToEffective:false,
        directSourcePatterns:Object.freeze(DIRECT_SOURCE_PATTERNS.map((item) => item.id)),
        genericBearingResolver:'unresolved',
        numericAggregation:false,
        finalStrengthMapping:false,
        statement:'《滴天髓阐微》把天干与同柱所坐地支作为“干以载之支”的承载关系观察；本层只建立 Stem Bearing source semantics，与 GuiJia project rootRole 分离。',
        boundary:'同柱支的存在、五行生克字面关系或 source outcome 均不得直接生成 visible stem 的 generic effective/ineffective，也不得作为 root actor 重复计力。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);
    const pillarPositions = Object.freeze(['year','month','day','hour']);
    const pillarLabels = Object.freeze(['年柱','月柱','日柱','时柱']);

    const chartKey = (result = {}) => (result.pillars || []).map((pillar) => `${pillar.gan || ''}${pillar.zhi || ''}`).join('|');

    const collectSemanticRefs = (semanticModel = {}) => new Set([
        ...(semanticModel.facts || []).map((item) => item.id),
        ...(semanticModel.derivedFacts || []).map((item) => item.id),
        ...(semanticModel.structures || []).map((item) => item.id)
    ].filter(Boolean));

    const checkedRefs = (refs = [], semanticModel = {}) => {
        const available = collectSemanticRefs(semanticModel);
        return Object.freeze(unique(refs.filter((ref) => available.has(ref))));
    };

    const relationCatalog = (result = {}) => typeof baziCore.buildBaziStructureCatalog === 'function'
        ? baziCore.buildBaziStructureCatalog(result.internalRelations || [])
        : [];

    const findRequiredStructure = (result = {}, semanticModel = {}, pattern = {}) => {
        if (!pattern.requiredStructureCode) return null;
        const available = new Set((semanticModel.structures || []).map((item) => item.id).filter(Boolean));
        return relationCatalog(result).find((relation) => {
            if (relation.code !== pattern.requiredStructureCode) return false;
            const ref = relation._semanticRef || relation.id || '';
            if (!ref || !available.has(ref)) return false;
            const indices = relation.pillarIndices || [];
            return indices.includes(pattern.pillarIndex) && indices.includes(pattern.attackerPillarIndex);
        }) || null;
    };

    const makeBaseRecord = (result = {}, semanticModel = {}, visibleEffect = {}, index = 0) => {
        const pillarIndex = Number(String(visibleEffect.actorKey || '').split(':')[1]);
        const pillar = result.pillars?.[pillarIndex] || {};
        return {
            id:`SBE-${String(index + 1).padStart(2, '0')}`,
            actorKey:visibleEffect.actorKey || '',
            visibleEffectId:visibleEffect.id || '',
            pillarIndex,
            position:visibleEffect.position || pillarPositions[pillarIndex] || '',
            positionLabel:visibleEffect.positionLabel || `${pillarLabels[pillarIndex] || ''}天干`,
            stemGan:visibleEffect.gan || pillar.gan || '',
            stemElement:visibleEffect.wuxing || baziCore.getWuXing?.(visibleEffect.gan || pillar.gan) || '',
            bearingZhi:pillar.zhi || '',
            bearingElement:baziCore.getWuXing?.(pillar.zhi) || '',
            bearingPairRole:'same-pillar-stem-branch',
            sourceRefs:checkedRefs(['F01', ...(visibleEffect.sourceRefs || [])], semanticModel),
            sourcePatternId:null,
            resolutionStatus:'unresolved-no-source-specific-resolver',
            sourceBearingState:null,
            sourceTerm:null,
            structureRef:null,
            genericVisibleEffectiveState:null,
            statement:'已建立明干与同柱地支的 bearing pair，但当前没有可泛化的 source-specific resolver 判断这一承载关系如何转化为实际明干效力。',
            boundary:'同柱地支存在不等于该天干已经得到有效承载；本层不从五行字面关系、藏干层级或结构数量直接生成 effective/ineffective。'
        };
    };

    const applyDirectPattern = (base = {}, result = {}, semanticModel = {}, pattern = {}) => {
        if (chartKey(result) !== pattern.chartKey) return null;
        if (base.pillarIndex !== pattern.pillarIndex || base.stemGan !== pattern.stemGan || base.bearingZhi !== pattern.bearingZhi) return null;

        const sourceRefs = ['F01', ...(base.sourceRefs || [])];
        let structureRef = null;
        if (pattern.requiredStructureCode) {
            const structure = findRequiredStructure(result, semanticModel, pattern);
            if (!structure) {
                return Object.freeze({
                    ...base,
                    sourcePatternId:pattern.id,
                    resolutionStatus:'unresolved-source-structure-provenance',
                    sourceTerm:pattern.sourceTerm,
                    statement:'命例与 bearing actor 已匹配，但原典所要求的地支冲 Structure 尚未从当前 semantic structure provenance 中核验。',
                    boundary:'Structure provenance 未核验时不得生成 source-bearing-damaged outcome。'
                });
            }
            structureRef = structure._semanticRef || structure.id || '';
            sourceRefs.push(structureRef);
        }

        const details = {};
        if (pattern.supportZhi) {
            details.supportActor = Object.freeze({
                pillarIndex:pattern.supportPillarIndex,
                zhi:result.pillars?.[pattern.supportPillarIndex]?.zhi || '',
                expectedZhi:pattern.supportZhi
            });
        }
        if (pattern.attackerZhi) {
            details.attackerActor = Object.freeze({
                pillarIndex:pattern.attackerPillarIndex,
                zhi:result.pillars?.[pattern.attackerPillarIndex]?.zhi || '',
                expectedZhi:pattern.attackerZhi
            });
        }

        return Object.freeze({
            ...base,
            ...details,
            sourceRefs:checkedRefs(sourceRefs, semanticModel),
            sourcePatternId:pattern.id,
            resolutionStatus:'resolved-source-bearing-outcome',
            sourceBearingState:pattern.state,
            sourceTerm:pattern.sourceTerm,
            structureRef,
            genericVisibleEffectiveState:null,
            statement:pattern.state === sourceBearingStates.FORTIFIED_BY_SUPPORT
                ? '按《滴天髓阐微》该原命例，丁卯同柱的承载基础又得亥水生扶，记录 source-bearing-fortified-by-support。'
                : pattern.state === sourceBearingStates.DAMAGED_BY_CLASH
                    ? '按《滴天髓阐微》该原命例，丁卯的承载基础因卯酉冲而受损，记录 source-bearing-damaged-by-clash。'
                    : '按《滴天髓阐微》该原命例，甲木虽透而临申，原文称“地支不载，虽有若无”，记录 source-not-carried-as-if-absent。',
            boundary:'这里只保存 direct-source bearing outcome；不得把“愈固”直接等同 effective，也不得把“虽有若无”直接等同 ineffective。'
        });
    };

    const buildStemBearingEffect = (result = {}, semanticModel = {}) => {
        const visibleEffects = (semanticModel.strengthEffects?.effects || []).filter((item) => item.category === 'visibleStemRelation');
        const records = visibleEffects.map((effect, index) => {
            const base = makeBaseRecord(result, semanticModel, effect, index);
            const matched = DIRECT_SOURCE_PATTERNS
                .map((pattern) => applyDirectPattern(base, result, semanticModel, pattern))
                .find(Boolean);
            return matched || Object.freeze(base);
        });
        return Object.freeze({
            version:STEM_BEARING_EFFECT_VERSION,
            ruleId:STEM_BEARING_EFFECT_RULE_ID,
            state:records.length ? 'observed' : 'not-applicable',
            contract:CONTRACT,
            records:Object.freeze(records),
            resolvedCount:records.filter((item) => item.resolutionStatus === 'resolved-source-bearing-outcome').length,
            unresolvedCount:records.filter((item) => item.resolutionStatus !== 'resolved-source-bearing-outcome').length,
            boundaries:Object.freeze([
                'Stem Bearing 与 project Root Role 是独立语义轴；bearing branch 不因“载”字自动成为 exact-root / same-element-root。',
                '同柱 stem-branch pair 可以记录 source-bearing outcome，但不得直接生成 generic visible-stem effectiveness。',
                'direct source case 不得泛化成“某干坐某支必然有效／无效”的固定表。'
            ])
        });
    };

    function installStrengthEffectsHook() {
        const api = GuiJia.baziStrengthEffects;
        if (!api?.buildStrengthEffects || api.__stemBearingEffectHookInstalled) return false;
        const originalBuild = api.buildStrengthEffects;
        const wrapped = function (result = {}, semanticModel = {}) {
            const collection = originalBuild(result, semanticModel);
            semanticModel.strengthEffects = collection;
            semanticModel.stemBearingEffect = buildStemBearingEffect(result, semanticModel);
            return collection;
        };
        GuiJia.baziStrengthEffects = Object.freeze({
            ...api,
            buildStrengthEffects:wrapped,
            __stemBearingEffectHookInstalled:true
        });
        return true;
    }

    const makeContractClaim = () => Object.freeze({
        id:'SC-STEM-BEARING-EFFECT-CONTRACT',
        claimKey:'visibleStem.bearing.contract',
        status:'resolved',
        ruleId:STEM_BEARING_EFFECT_RULE_ID,
        value:Object.freeze({
            samePillarBearingPair:true,
            projectRootRoleIndependent:true,
            genericBearingResolver:'unresolved',
            sourceBearingStateMapsToGenericVisibleEffectiveness:false,
            sourceNotCarriedMapsToIneffective:false,
            numericAggregation:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'《滴天髓阐微》明确以“干以载之支为切”讨论同柱天干与所坐地支，并以丁卯、甲申命例说明承载基础可受生扶、冲克或出现“地支不载，虽有若无”。',
        boundary:'本 Claim 只解决 Stem Bearing 的 source-semantic 边界，不解决一般明干 effective/ineffective。'
    });

    const makeRecordClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-STEM-BEARING-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.${record.actorKey || index}.bearing-source-outcome`,
        status:record.resolutionStatus === 'resolved-source-bearing-outcome' ? 'resolved' : 'blocked',
        ruleId:STEM_BEARING_EFFECT_RULE_ID,
        value:Object.freeze({
            resolutionStatus:record.resolutionStatus,
            sourceBearingState:record.sourceBearingState,
            genericVisibleEffectiveState:null
        }),
        sourceEffectIds:freezeArray([record.visibleEffectId]),
        sourceRefs:freezeArray(record.sourceRefs || []),
        dependencyIds:Object.freeze(record.resolutionStatus === 'resolved-source-bearing-outcome' ? [] : ['SD-STEM-BEARING-SOURCE-COVERAGE']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const rebuildVisibleEffectivenessDependency = (base = {}, records = []) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'visible-stem-effects',
            status:'unresolved',
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-STEM-BEARING-SOURCE-COVERAGE',
                'SD-STEM-BEARING-EFFECT-MAPPING'
            ])),
            statement:records.length
                ? '明干方向资格已识别，Stem Bearing 又补充了同柱承载 source semantics；但 source coverage 尚不完整，且 bearing outcome 到 generic visible-stem effectiveness 的映射尚未定义。'
                : (current.statement || '明干实际效力尚未定义。'),
            boundary:'“虽有若无”不得直接写 ineffective，“根愈固”不得直接写 effective；同柱支存在也不得直接满足明干实际效力。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const collection = semanticModel.stemBearingEffect || Object.freeze({ records:Object.freeze([]) });
        const records = collection.records || [];
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...records.map(makeRecordClaim)]);
        const coverageResolved = records.length === 0 || records.every((item) => item.resolutionStatus === 'resolved-source-bearing-outcome');
        const coverageDependency = Object.freeze({
            id:'SD-STEM-BEARING-SOURCE-COVERAGE',
            kind:'rule-coverage',
            scope:'visible-stem-bearing-source-outcomes',
            status:coverageResolved ? 'resolved' : 'unresolved',
            sourceEffectIds:Object.freeze(unique(records.map((item) => item.visibleEffectId))),
            sourceRefs:Object.freeze(unique(records.flatMap((item) => item.sourceRefs || []))),
            resolvedByClaimIds:Object.freeze(coverageResolved ? records.map((_, index) => `SC-STEM-BEARING-${String(index + 1).padStart(2, '0')}`) : []),
            ruleId:STEM_BEARING_EFFECT_RULE_ID,
            statement:coverageResolved
                ? '当前 visible stem bearing records 均已有 direct source outcome，或本局无非日主明干。'
                : '当前只收录少量《滴天髓阐微》direct source bearing cases；其余明干尚无 source-specific bearing outcome resolver。',
            boundary:'不得把 exact source case 泛化成通用坐支有效性表，也不得以数量多数替代覆盖。'
        });
        const mappingDependency = Object.freeze({
            id:'SD-STEM-BEARING-EFFECT-MAPPING',
            kind:'effectiveness',
            scope:'source-bearing-outcome-to-visible-stem-effectiveness',
            status:records.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.map((item) => item.visibleEffectId))),
            sourceRefs:Object.freeze(unique(records.flatMap((item) => item.sourceRefs || []))),
            resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-STEM-BEARING-EFFECT-CONTRACT']),
            ruleId:STEM_BEARING_EFFECT_RULE_ID,
            statement:records.length
                ? 'source-bearing-fortified / damaged / not-carried 等原典结果已经可按直证命例记录，但尚未建立到 GuiJia generic visible-stem effectiveState 的映射。'
                : '本局无非日主明干，Stem Bearing effect mapping 为 not-applicable。',
            boundary:'source-bearing state ≠ generic effectiveState；“虽有若无”尤其不得自动改写为不存在或 ineffective。'
        });
        const visibleDependency = rebuildVisibleEffectivenessDependency(base, records);
        const replacedIds = new Set(['SD-VISIBLE-EFFECTIVENESS','SD-STEM-BEARING-SOURCE-COVERAGE','SD-STEM-BEARING-EFFECT-MAPPING']);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            coverageDependency,
            mappingDependency
        ]);
        const conflicts = typeof priorSynthesisApi?.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi?.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            stemBearingEffectRecords:Object.freeze(records),
            stemBearingEffectRuleIds:Object.freeze([STEM_BEARING_EFFECT_RULE_ID]),
            stemBearingEffectContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Stem Bearing / 天覆地载承载层与 project Root Effectiveness 分离；source bearing actor 不自动作为 root actor。',
                'direct source bearing outcome 只保留原典语义，不直接转译 generic visible-stem effectiveState。',
                '“地支不载，虽有若无”不是删除明干 Fact 的规则。'
            ])
        });
    };

    function installSynthesisHook() {
        const api = GuiJia.baziStrengthSynthesis;
        if (!api?.buildStrengthSynthesis || api.__stemBearingEffectHookInstalled) return false;
        const originalBuild = api.buildStrengthSynthesis;
        const wrapped = (semanticModel = {}) => extendSynthesis(semanticModel, originalBuild(semanticModel));
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...api,
            buildStrengthSynthesis:wrapped,
            __stemBearingEffectHookInstalled:true
        });
        return true;
    }

    GuiJia.baziStemBearingEffect = Object.freeze({
        installed:true,
        STEM_BEARING_EFFECT_VERSION,
        STEM_BEARING_EFFECT_RULE_ID,
        sourceBearingStates,
        SOURCE_BASIS,
        DIRECT_SOURCE_PATTERNS,
        CONTRACT,
        chartKey,
        findRequiredStructure,
        makeBaseRecord,
        applyDirectPattern,
        buildStemBearingEffect,
        extendSynthesis,
        installStrengthEffectsHook,
        installSynthesisHook
    });

    installStrengthEffectsHook();
    installSynthesisHook();
})(typeof window !== 'undefined' ? window : globalThis);
