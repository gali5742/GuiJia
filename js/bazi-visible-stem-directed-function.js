(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemDirectedFunction?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const VISIBLE_STEM_DIRECTED_FUNCTION_VERSION = '0.1';
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
            reciprocal:false
        }),
        '同我':Object.freeze({
            flow:flowKinds.PEER,
            functionType:'peer-support',
            strengthMeaning:'support',
            sourceRole:'visible-stem',
            targetRole:'day-master',
            reciprocal:true
        }),
        '克我':Object.freeze({
            flow:flowKinds.INBOUND,
            functionType:'restraint',
            strengthMeaning:'restraint',
            sourceRole:'visible-stem',
            targetRole:'day-master',
            reciprocal:false
        }),
        '我生':Object.freeze({
            flow:flowKinds.OUTBOUND,
            functionType:'generation',
            strengthMeaning:'drain',
            sourceRole:'day-master',
            targetRole:'visible-stem',
            reciprocal:false
        }),
        '我克':Object.freeze({
            flow:flowKinds.OUTBOUND,
            functionType:'restraint',
            strengthMeaning:'distribution',
            sourceRole:'day-master',
            targetRole:'visible-stem',
            reciprocal:false
        })
    });

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-DIRECTED-FUNCTION-CONTRACT-001',
        version:VISIBLE_STEM_DIRECTED_FUNCTION_VERSION,
        inputLevel:'visible-stem-relation-effect',
        outputLevel:'directed-daymaster-related-function',
        relationModels:Object.freeze(Object.keys(RELATION_MODELS)),
        allVisibleFunctionsPointTowardDayMaster:false,
        drainIsActorToDayMaster:false,
        distributionIsActorToDayMaster:false,
        peerRelationIsOneWayGeneration:false,
        reachabilityResolved:false,
        genericEffectivenessResolved:false,
        numericAggregation:false,
        finalStrengthMapping:false,
        statement:'Strength Effect 的扶／克／泄／被分方向必须先还原成真实有向作用。生我、克我由明干指向日主；我生、我克由日主指向明干；同我作为同类 peer relation 单独保存。',
        boundary:'本层只解决 function direction，不判断该作用是否可达、实际发挥多少力量或最终形成 effective / ineffective。'
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
        const visible = Object.freeze({
            actorKey:effect.actorKey || '',
            gan:effect.gan || '',
            pillarIndex:Number(String(effect.actorKey || '').split(':')[1]),
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
            sourceActor:null,
            targetActor:null,
            reciprocal:false,
            reachabilityState:null,
            genericVisibleEffectiveState:null
        };

        if (!model || !dayMaster.gan || !visible.actorKey) {
            return Object.freeze({
                ...base,
                resolutionStatus:'unresolved-direction-model',
                statement:'当前 visible-stem relation 无法安全还原为有向作用关系。',
                boundary:'未知 relation 不得兜底解释成 actor→dayMaster，也不得由 Strength direction 标签反推未定义的作用方向。'
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
            sourceActor,
            targetActor,
            reciprocal:model.reciprocal,
            statement:model.flow === flowKinds.INBOUND
                ? `${visible.gan}与日主的“${effect.relation}”关系还原为明干 → 日主的 ${model.functionType} function。`
                : model.flow === flowKinds.OUTBOUND
                    ? `${visible.gan}与日主的“${effect.relation}”关系还原为日主 → 明干的 ${model.functionType} function。`
                    : `${visible.gan}与日主的“同我”关系保存为 peer-with-daymaster，不伪装成单向相生。`,
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
            reachabilityResolved:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'GuiJia Strength Effect v0.1 已把 visible relation 保留为“生我／同我／克我／我生／我克”。这些关系的主客方向不同，因此 reachability 之前必须先冻结 directed-function 语义。',
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
            sourceActorKey:record.sourceActor?.actorKey || null,
            targetActorKey:record.targetActor?.actorKey || null,
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
            scope:'visible-stem-daymaster-directed-function-semantics',
            status:allResolved ? 'resolved' : 'unresolved',
            sourceEffectIds:Object.freeze(unique(records.map((item) => item.visibleEffectId))),
            sourceRefs:Object.freeze(unique(records.flatMap((item) => item.sourceRefs || []))),
            resolvedByClaimIds:Object.freeze(allResolved ? claims.filter((item) => item.status === 'resolved').map((item) => item.id) : []),
            ruleId:VISIBLE_STEM_DIRECTED_FUNCTION_RULE_ID,
            statement:records.length
                ? (allResolved
                    ? '本局所有 visible-stem relation 已还原为 inbound / peer / outbound directed function。'
                    : '至少一个 visible-stem relation 尚无安全的 directed-function 模型。')
                : '本局无非日主明干，directed-function model 为 not-applicable。',
            boundary:'方向模型只解决谁作用于谁；不解决作用是否可达、是否有力或最终强弱。'
        });
    };

    const buildReachabilityDependency = ({ id, scope, records, directionDependency, label }) => Object.freeze({
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
            ? `${label} directed functions 已识别，但其 target-specific reachability 尚无通用 resolver。`
            : `本局没有 ${label} directed function，该 reachability dependency 为 not-applicable。`,
        boundary:'不得由关系方向、柱位数量或候选方向直接判定 reachable / unreachable。'
    });

    const rebuildParentReachabilityDependency = (base = {}, records = []) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY') || {};
        const childIds = ['SD-VISIBLE-STEM-FUNCTION-DIRECTION-MODEL'];
        if (records.some((item) => [flowKinds.INBOUND, flowKinds.PEER].includes(item.flow))) {
            childIds.push('SD-VISIBLE-STEM-DAYMASTER-INBOUND-PEER-REACHABILITY');
        }
        if (records.some((item) => item.flow === flowKinds.OUTBOUND)) {
            childIds.push('SD-VISIBLE-STEM-DAYMASTER-OUTBOUND-REACHABILITY');
        }
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY',
            kind:'effectiveness',
            scope:'visible-stem-daymaster-related-directed-function-reachability',
            status:records.length ? 'unresolved' : 'resolved',
            dependsOnDependencyIds:Object.freeze(unique(childIds)),
            resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-VISIBLE-STEM-DIRECTED-FUNCTION-CONTRACT']),
            ruleId:VISIBLE_STEM_DIRECTED_FUNCTION_RULE_ID,
            statement:records.length
                ? '“与日主相关的功能可达性”包含明干→日主、同类 peer，以及日主→明干三类方向；当前各方向的 target-specific reachability 尚未完成。'
                : '本局无非日主明干，day-master-related function reachability 为 not-applicable。',
            boundary:'兼容 ID 不再表示“所有 visible actor 都朝向日主作用”；我生／我克必须保留日主→明干的 outward flow。'
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
            statement:'明干方向资格已经进一步还原为真实 directed function，但 target-specific reachability、功能兑现与 global effectiveness 仍未完成。',
            boundary:'不得把 inbound / peer / outbound 方向本身当成有效性结论；尤其我生／我克不是 visible actor 对日主的入向作用。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const records = buildDirectedFunctionRecords(semanticModel);
        const recordClaims = records.map(makeRecordClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...recordClaims]);
        const directionDependency = buildDirectionDependency(records, recordClaims);
        const inboundPeerRecords = records.filter((item) => [flowKinds.INBOUND, flowKinds.PEER].includes(item.flow));
        const outboundRecords = records.filter((item) => item.flow === flowKinds.OUTBOUND);
        const inboundPeerDependency = buildReachabilityDependency({
            id:'SD-VISIBLE-STEM-DAYMASTER-INBOUND-PEER-REACHABILITY',
            scope:'visible-stem-to-daymaster-and-peer-reachability',
            records:inboundPeerRecords,
            directionDependency,
            label:'inbound / peer'
        });
        const outboundDependency = buildReachabilityDependency({
            id:'SD-VISIBLE-STEM-DAYMASTER-OUTBOUND-REACHABILITY',
            scope:'daymaster-to-visible-stem-outbound-reachability',
            records:outboundRecords,
            directionDependency,
            label:'outbound'
        });
        const parentReachabilityDependency = rebuildParentReachabilityDependency(base, records);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-FUNCTION-DIRECTION-MODEL',
            'SD-VISIBLE-STEM-DAYMASTER-INBOUND-PEER-REACHABILITY',
            'SD-VISIBLE-STEM-DAYMASTER-OUTBOUND-REACHABILITY',
            'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            directionDependency,
            inboundPeerDependency,
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
                'visible-stem Strength relation 必须保留真实有向关系：生我／克我入向，同行 peer，我生／我克出向。',
                '我生／我克不得再表述为“该明干对日主能否作用”；它们描述的是日主向外的输出或控制关系。',
                'Directed Function Model 只校正 source/target 方向，不生成 reachability、权重、分值或最终 Strength。'
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
})(typeof window !== 'undefined' ? window : globalThis);
