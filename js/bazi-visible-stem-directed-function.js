(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemDirectedFunction?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const VISIBLE_STEM_DIRECTED_FUNCTION_VERSION = '0.2';
    const VISIBLE_STEM_DIRECTED_FUNCTION_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-DIRECTED-FUNCTION-001';

    const flowKinds = Object.freeze({
        INBOUND:'inbound-to-daymaster',
        PEER:'peer-with-daymaster',
        OUTBOUND:'outbound-from-daymaster'
    });

    const RELATION_MODELS = Object.freeze({
        '生我':Object.freeze({
            flow:flowKinds.INBOUND,
            functionType:'generation',
            strengthMeaning:'support',
            sourceRole:'visible-stem',
            targetRole:'day-master',
            reciprocal:false,
            directed:true
        }),
        '同我':Object.freeze({
            flow:flowKinds.PEER,
            functionType:'peer-support',
            strengthMeaning:'support',
            sourceRole:null,
            targetRole:null,
            reciprocal:true,
            directed:false
        }),
        '克我':Object.freeze({
            flow:flowKinds.INBOUND,
            functionType:'restraint',
            strengthMeaning:'restraint',
            sourceRole:'visible-stem',
            targetRole:'day-master',
            reciprocal:false,
            directed:true
        }),
        '我生':Object.freeze({
            flow:flowKinds.OUTBOUND,
            functionType:'generation',
            strengthMeaning:'drain',
            sourceRole:'day-master',
            targetRole:'visible-stem',
            reciprocal:false,
            directed:true
        }),
        '我克':Object.freeze({
            flow:flowKinds.OUTBOUND,
            functionType:'restraint',
            strengthMeaning:'distribution',
            sourceRole:'day-master',
            targetRole:'visible-stem',
            reciprocal:false,
            directed:true
        })
    });

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-DIRECTED-FUNCTION-CONTRACT-001',
        version:VISIBLE_STEM_DIRECTED_FUNCTION_VERSION,
        inputLevel:'visible-stem-relation-effect',
        outputLevel:'daymaster-related-function-semantics',
        relationModels:Object.freeze(Object.keys(RELATION_MODELS)),
        allVisibleFunctionsPointTowardDayMaster:false,
        drainIsActorToDayMaster:false,
        distributionIsActorToDayMaster:false,
        peerRelationIsOneWayGeneration:false,
        peerUsesDirectedSourceTarget:false,
        peerUsesParticipantPair:true,
        reachabilityResolved:false,
        genericEffectivenessResolved:false,
        numericAggregation:false,
        finalStrengthMapping:false,
        statement:'Strength Effect 的扶／克／泄／被分必须先还原真实作用语义。生我、克我是明干 → 日主的有向作用；我生、我克是日主 → 明干的有向作用；同我只保存为无方向的 peer participant pair。',
        boundary:'本层只解决有向作用与 peer 关系类型，不判断 reachability、peer realization、实际力量或最终 effective / ineffective。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const dayMasterDescriptor = (semanticModel = {}) => {
        const dayMaster = semanticModel.strengthEvidence?.dayMaster || semanticModel.strengthEffects?.dayMaster || {};
        const gan = dayMaster.gan || '';
        return Object.freeze({
            actorKey:gan ? `daymaster:2:${gan}` : 'daymaster:2',
            gan,
            pillarIndex:2,
            role:'day-master'
        });
    };

    const visibleEffects = (semanticModel = {}) => (semanticModel.strengthEffects?.effects || [])
        .filter((item) => item.category === 'visibleStemRelation');

    const buildDirectedFunctionRecord = (effect = {}, semanticModel = {}, index = 0) => {
        const model = RELATION_MODELS[effect.relation];
        const dayMaster = dayMasterDescriptor(semanticModel);
        const actorParts = String(effect.actorKey || '').split(':');
        const pillarIndex = Number(actorParts[1]);
        const visible = Object.freeze({
            actorKey:effect.actorKey || '',
            gan:effect.gan || '',
            pillarIndex:Number.isInteger(pillarIndex) ? pillarIndex : null,
            role:'visible-stem'
        });
        const base = {
            id:`VSDF-${String(index + 1).padStart(2, '0')}`,
            visibleEffectId:effect.id || '',
            visibleActorKey:visible.actorKey,
            visibleGan:visible.gan,
            relationFromDayMaster:effect.relation || '',
            strengthDirection:effect.direction || '',
            sourceRefs:freezeArray(effect.sourceRefs || []),
            flow:null,
            functionType:null,
            strengthMeaning:null,
            directed:null,
            sourceActor:null,
            targetActor:null,
            peerParticipants:Object.freeze([]),
            reciprocal:false,
            reachabilityState:null,
            genericVisibleEffectiveState:null
        };

        if (!model || !dayMaster.gan || !visible.actorKey || visible.pillarIndex == null) {
            return Object.freeze({
                ...base,
                resolutionStatus:'unresolved-direction-model',
                statement:'当前 visible-stem relation 无法安全还原为有向作用或 peer 关系。',
                boundary:'未知 relation 或损坏 actorKey 不得兜底解释成 actor→dayMaster，也不得由 Strength direction 标签反推未定义作用方向。'
            });
        }

        if (model.flow === flowKinds.PEER) {
            return Object.freeze({
                ...base,
                resolutionStatus:'resolved-directed-function',
                flow:model.flow,
                functionType:model.functionType,
                strengthMeaning:model.strengthMeaning,
                directed:false,
                peerParticipants:Object.freeze([visible, dayMaster]),
                reciprocal:true,
                statement:`${visible.gan}与日主的“同我”关系保存为 peer-with-daymaster participant pair，不建立伪 sourceActor → targetActor。`,
                boundary:'peer 不是有向 generation；sourceActor / targetActor 必须为空，后续应由独立 peer realization resolver 判断其实际扶助是否兑现。'
            });
        }

        const sourceActor = model.sourceRole === 'day-master' ? dayMaster : visible;
        const targetActor = model.targetRole === 'day-master' ? dayMaster : visible;
        return Object.freeze({
            ...base,
            resolutionStatus:'resolved-directed-function',
            flow:model.flow,
            functionType:model.functionType,
            strengthMeaning:model.strengthMeaning,
            directed:true,
            sourceActor,
            targetActor,
            reciprocal:model.reciprocal,
            statement:model.flow === flowKinds.INBOUND
                ? `${visible.gan}与日主的“${effect.relation}”关系还原为明干 → 日主的 ${model.functionType} function。`
                : `${visible.gan}与日主的“${effect.relation}”关系还原为日主 → 明干的 ${model.functionType} function。`,
            boundary:'方向已解析不等于 reachability 已解析；不得由 source/target 方向直接生成 supportScore、drainScore 或 actor global effectiveState。'
        });
    };

    const buildDirectedFunctionRecords = (semanticModel = {}) => Object.freeze(
        visibleEffects(semanticModel).map((effect, index) => buildDirectedFunctionRecord(effect, semanticModel, index))
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-DIRECTED-FUNCTION-CONTRACT',
        claimKey:'visibleStem.directed-function.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_DIRECTED_FUNCTION_RULE_ID,
        value:Object.freeze({
            inboundRelations:Object.freeze(['生我','克我']),
            peerRelations:Object.freeze(['同我']),
            outboundRelations:Object.freeze(['我生','我克']),
            allVisibleFunctionsPointTowardDayMaster:false,
            peerUsesDirectedSourceTarget:false,
            reachabilityResolved:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'GuiJia Strength Effect 保留“生我／同我／克我／我生／我克”。v0.2 将同我从伪有向 source/target 中拆出，只保留 peer participant pair；其余关系继续冻结真实 source/target 方向。',
        boundary:'这是项目内部语义规范化，不新增传统强弱规则，也不改变各 visible effect 的 presence-only 状态。'
    });

    const makeRecordClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-DIRECTED-FUNCTION-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.${record.visibleActorKey || index}.directed-function`,
        status:record.resolutionStatus === 'resolved-directed-function' ? 'resolved' : 'blocked',
        ruleId:VISIBLE_STEM_DIRECTED_FUNCTION_RULE_ID,
        value:Object.freeze({
            relationFromDayMaster:record.relationFromDayMaster,
            flow:record.flow,
            functionType:record.functionType,
            strengthMeaning:record.strengthMeaning,
            directed:record.directed,
            sourceActorKey:record.sourceActor?.actorKey || null,
            targetActorKey:record.targetActor?.actorKey || null,
            peerParticipantActorKeys:freezeArray((record.peerParticipants || []).map((item) => item.actorKey)),
            reciprocal:record.reciprocal,
            reachabilityState:null
        }),
        sourceEffectIds:freezeArray([record.visibleEffectId]),
        sourceRefs:freezeArray(record.sourceRefs || []),
        dependencyIds:Object.freeze([]),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildDirectionDependency = (records = [], claims = []) => {
        const allResolved = records.every((item) => item.resolutionStatus === 'resolved-directed-function');
        return Object.freeze({
            id:'SD-VISIBLE-STEM-FUNCTION-DIRECTION-MODEL',
            kind:'interaction',
            scope:'visible-stem-daymaster-function-semantics',
            status:allResolved ? 'resolved' : 'unresolved',
            sourceEffectIds:Object.freeze(unique(records.map((item) => item.visibleEffectId))),
            sourceRefs:Object.freeze(unique(records.flatMap((item) => item.sourceRefs || []))),
            resolvedByClaimIds:Object.freeze(allResolved ? claims.filter((item) => item.status === 'resolved').map((item) => item.id) : []),
            ruleId:VISIBLE_STEM_DIRECTED_FUNCTION_RULE_ID,
            statement:records.length
                ? (allResolved
                    ? '本局所有 visible-stem relation 已还原为 inbound / peer / outbound function semantics。'
                    : '至少一个 visible-stem relation 尚无安全的 directed-function / peer 模型。')
                : '本局无非日主明干，function direction model 为 not-applicable。',
            boundary:'本层只解决有向 source/target 或 peer participant pair；不解决 reachability、peer realization、是否有力或最终强弱。'
        });
    };

    const buildUnresolvedFunctionDependency = ({ id, scope, records, label, statement, boundary }) => Object.freeze({
        id,
        kind:'effectiveness',
        scope,
        status:records.length ? 'unresolved' : 'resolved',
        sourceEffectIds:Object.freeze(unique(records.map((item) => item.visibleEffectId))),
        sourceRefs:Object.freeze(unique(records.flatMap((item) => item.sourceRefs || []))),
        resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-VISIBLE-STEM-DIRECTED-FUNCTION-CONTRACT']),
        ruleId:VISIBLE_STEM_DIRECTED_FUNCTION_RULE_ID,
        dependsOnDependencyIds:Object.freeze(['SD-VISIBLE-STEM-FUNCTION-DIRECTION-MODEL']),
        statement:records.length
            ? statement
            : `本局没有 ${label}，该 dependency 为 not-applicable。`,
        boundary
    });

    const rebuildParentReachabilityDependency = (base = {}, records = []) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY') || {};
        const childIds = ['SD-VISIBLE-STEM-FUNCTION-DIRECTION-MODEL'];
        if (records.some((item) => item.flow === flowKinds.INBOUND)) {
            childIds.push('SD-VISIBLE-STEM-DAYMASTER-INBOUND-REACHABILITY');
        }
        if (records.some((item) => item.flow === flowKinds.PEER)) {
            childIds.push('SD-VISIBLE-STEM-DAYMASTER-PEER-REALIZATION');
        }
        if (records.some((item) => item.flow === flowKinds.OUTBOUND)) {
            childIds.push('SD-VISIBLE-STEM-DAYMASTER-OUTBOUND-REACHABILITY');
        }
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY',
            kind:'effectiveness',
            scope:'visible-stem-daymaster-related-function-realization',
            status:records.length ? 'unresolved' : 'resolved',
            dependsOnDependencyIds:Object.freeze(unique(childIds)),
            resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-VISIBLE-STEM-DIRECTED-FUNCTION-CONTRACT']),
            ruleId:VISIBLE_STEM_DIRECTED_FUNCTION_RULE_ID,
            statement:records.length
                ? '与日主相关的作用兑现必须分别处理 inbound reachability、peer realization 与 outbound reachability；当前仍无通用 resolver。'
                : '本局无非日主明干，day-master-related function realization 为 not-applicable。',
            boundary:'兼容父 ID 只汇总三个独立 blocker；不得把 peer 当成有向作用，也不得把我生／我克反写为 visible actor → 日主。'
        });
    };

    const rebuildVisibleEffectivenessDependency = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'visible-stem-effects',
            status:'unresolved',
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-VISIBLE-STEM-FUNCTION-DIRECTION-MODEL',
                'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY'
            ])),
            statement:'明干关系已还原为有向 function 或无向 peer participant pair，但 reachability、peer realization、功能兑现与 global effectiveness 仍未完成。',
            boundary:'不得把 inbound / peer / outbound 语义本身当成有效性结论；peer 尤其不得通过伪 source/target 进入通用 reachability resolver。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const records = buildDirectedFunctionRecords(semanticModel);
        const recordClaims = records.map(makeRecordClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...recordClaims]);
        const directionDependency = buildDirectionDependency(records, recordClaims);
        const inboundRecords = records.filter((item) => item.flow === flowKinds.INBOUND);
        const peerRecords = records.filter((item) => item.flow === flowKinds.PEER);
        const outboundRecords = records.filter((item) => item.flow === flowKinds.OUTBOUND);
        const inboundDependency = buildUnresolvedFunctionDependency({
            id:'SD-VISIBLE-STEM-DAYMASTER-INBOUND-REACHABILITY',
            scope:'visible-stem-to-daymaster-inbound-reachability',
            records:inboundRecords,
            label:'inbound directed function',
            statement:'inbound directed functions 已识别，但其 target-specific reachability 尚无通用 resolver。',
            boundary:'不得由关系方向、柱位数量或候选方向直接判定 inbound reachable / unreachable。'
        });
        const peerDependency = buildUnresolvedFunctionDependency({
            id:'SD-VISIBLE-STEM-DAYMASTER-PEER-REALIZATION',
            scope:'visible-stem-daymaster-peer-realization',
            records:peerRecords,
            label:'peer relation',
            statement:'peer relation 已识别，但同类关系是否实际形成扶助及其作用条件尚无通用 realization resolver。',
            boundary:'peer realization 不是 source→target reachability；不得把 reciprocal 或同类关系本身直接写成 effective support。'
        });
        const outboundDependency = buildUnresolvedFunctionDependency({
            id:'SD-VISIBLE-STEM-DAYMASTER-OUTBOUND-REACHABILITY',
            scope:'daymaster-to-visible-stem-outbound-reachability',
            records:outboundRecords,
            label:'outbound directed function',
            statement:'outbound directed functions 已识别，但其 target-specific reachability 尚无通用 resolver。',
            boundary:'不得由关系方向、柱位数量或候选方向直接判定 outbound reachable / unreachable。'
        });
        const parentReachabilityDependency = rebuildParentReachabilityDependency(base, records);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-FUNCTION-DIRECTION-MODEL',
            'SD-VISIBLE-STEM-DAYMASTER-INBOUND-PEER-REACHABILITY',
            'SD-VISIBLE-STEM-DAYMASTER-INBOUND-REACHABILITY',
            'SD-VISIBLE-STEM-DAYMASTER-PEER-REALIZATION',
            'SD-VISIBLE-STEM-DAYMASTER-OUTBOUND-REACHABILITY',
            'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            directionDependency,
            inboundDependency,
            peerDependency,
            outboundDependency,
            parentReachabilityDependency
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
            visibleStemDirectedFunctionRecords:records,
            visibleStemDirectedFunctionRuleIds:Object.freeze([VISIBLE_STEM_DIRECTED_FUNCTION_RULE_ID]),
            visibleStemDirectedFunctionContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'visible-stem Strength relation 必须区分真实有向作用与 peer 关系：生我／克我入向，同我为无向 peer，我生／我克出向。',
                '同我只保存 participant pair，不建立 sourceActor / targetActor；peer realization 必须独立于 reachability。',
                'Directed Function Model 只校正关系语义，不生成 reachability、权重、分值或最终 Strength。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildVisibleStemDirectedFunctionRecords:buildDirectedFunctionRecords
        });
    }

    GuiJia.baziVisibleStemDirectedFunction = Object.freeze({
        installed:true,
        VISIBLE_STEM_DIRECTED_FUNCTION_VERSION,
        VISIBLE_STEM_DIRECTED_FUNCTION_RULE_ID,
        flowKinds,
        RELATION_MODELS,
        CONTRACT,
        dayMasterDescriptor,
        visibleEffects,
        buildDirectedFunctionRecord,
        buildDirectedFunctionRecords,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziVisibleStemFunctionCoverage) {
        document.write('<script src="./js/bazi-visible-stem-function-coverage.js?v=13.44.0"><\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);