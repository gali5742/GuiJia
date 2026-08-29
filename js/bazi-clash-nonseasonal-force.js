(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziClashNonseasonalForce?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    const preconditionsApi = GuiJia.baziClashPreconditions || null;

    const CLASH_NONSEASONAL_FORCE_VERSION = '0.1';
    const CLASH_NONSEASONAL_FORCE_RULE_ID = 'BAZI-STRENGTH-CLASH-NONSEASONAL-FORCE-001';

    const dimensionStatuses = preconditionsApi?.dimensionStatuses || Object.freeze({
        UNRESOLVED:'unresolved', RESOLVED:'resolved', NOT_APPLICABLE:'not-applicable'
    });
    const dimensionPreferences = preconditionsApi?.dimensionPreferences || Object.freeze({
        ROOT_SIDE:'root-side', COUNTERPART_SIDE:'counterpart-side', EQUIVALENT:'equivalent'
    });

    const WU_SUPPORT_CONTEXT_ZHI = Object.freeze(['寅','卯','巳','未','戌']);
    const WU_COUNTER_CONTEXT_ZHI = Object.freeze(['申','酉','亥','子','丑','辰']);
    const STORAGE_CLASH_KEYS = Object.freeze(['丑未','未丑','辰戌','戌辰']);

    const SOURCE_EXAMPLE_HINTS = Object.freeze([
        Object.freeze({ pairKey:'午子', targetZhi:'午', requiresTargetMonthCommand:true, presentElements:Object.freeze(['木']), absentElements:Object.freeze(['金']), sourceTerm:'午旺提纲，四柱无金而有木，则午能冲子' }),
        Object.freeze({ pairKey:'卯酉', targetZhi:'卯', requiresTargetMonthCommand:true, presentElements:Object.freeze(['火']), absentElements:Object.freeze(['土']), sourceTerm:'卯旺提纲，四柱有火而无土，则卯亦能冲酉' }),
        Object.freeze({ pairKey:'寅申', targetZhi:'寅', requiresTargetMonthCommand:true, presentElements:Object.freeze(['火']), absentElements:Object.freeze([]), sourceTerm:'寅旺提纲，四柱有火，则寅亦能冲申矣' }),
        Object.freeze({ pairKey:'巳亥', targetZhi:'巳', requiresTargetMonthCommand:true, presentElements:Object.freeze(['木']), absentElements:Object.freeze([]), sourceTerm:'巳旺提纲，四柱有木，则巳亦能冲亥矣' })
    ]);

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'冲之者有力，则能去之；冲之者无力，则反激之' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'如日主是午，或喜神是午，支中有寅卯巳未戌之类，遇子冲谓衰神冲旺，无伤' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'日主午，或喜神是午，支中有申酉亥子丑辰之类，遇子冲，谓旺者冲衰则拔' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'必先察其衰旺，四柱有无解救，或抑冲，或助泄，观其大势' })
    ]);

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);
    const pairKey = (a, b) => `${a || ''}${b || ''}`;

    const buildChartBranchSnapshot = (semanticModel = {}) => {
        const evidence = semanticModel.strengthEvidence?.evidence || {};
        const byIndex = new Map();
        (evidence.branchQi || []).forEach((item) => {
            if (Number.isInteger(item?.pillarIndex) && item?.zhi) {
                byIndex.set(item.pillarIndex, Object.freeze({
                    pillarIndex:item.pillarIndex,
                    position:item.position || '',
                    zhi:item.zhi
                }));
            }
        });
        const monthZhi = evidence.seasonalState?.monthZhi || '';
        if (monthZhi) byIndex.set(1, Object.freeze({ pillarIndex:1, position:'month', zhi:monthZhi }));
        return Object.freeze([0,1,2,3].flatMap((pillarIndex) => byIndex.has(pillarIndex) ? [byIndex.get(pillarIndex)] : []));
    };

    const getSourceExampleHint = (root = {}, counterpart = {}) => {
        const direct = SOURCE_EXAMPLE_HINTS.find((hint) => hint.pairKey === pairKey(root.zhi, counterpart.zhi));
        if (direct) return direct;
        const reverse = SOURCE_EXAMPLE_HINTS.find((hint) => hint.pairKey === pairKey(counterpart.zhi, root.zhi));
        return reverse || null;
    };

    const makeDimension = ({ record, status, preference = null, reasonCode, observations, statement, boundary }) => Object.freeze({
        id:`CD-${record.id || 'UNKNOWN'}-RELATIVE-FORCE`,
        key:'non-seasonal-relative-force',
        required:true,
        status,
        preference,
        reasonCode,
        observations:Object.freeze({ ...observations }),
        sourceBasis:Object.freeze(SOURCE_BASIS.map((item) => Object.freeze({ ...item }))),
        statement,
        boundary
    });

    const buildWuZiBranchContextDimension = (record = {}, semanticModel = {}) => {
        const root = record.rootSide || {};
        const counterpart = record.counterpartSide || {};
        const rootIsWu = root.zhi === '午' && counterpart.zhi === '子';
        const counterpartIsWu = root.zhi === '子' && counterpart.zhi === '午';
        if (!rootIsWu && !counterpartIsWu) return null;

        const snapshot = buildChartBranchSnapshot(semanticModel);
        const clashIndices = new Set([root.pillarIndex, counterpart.pillarIndex].filter(Number.isInteger));
        const contextBranches = snapshot.filter((item) => !clashIndices.has(item.pillarIndex));
        const supportSignals = contextBranches.filter((item) => WU_SUPPORT_CONTEXT_ZHI.includes(item.zhi));
        const counterSignals = contextBranches.filter((item) => WU_COUNTER_CONTEXT_ZHI.includes(item.zhi));
        const wuPreference = rootIsWu ? dimensionPreferences.ROOT_SIDE : dimensionPreferences.COUNTERPART_SIDE;
        const ziPreference = rootIsWu ? dimensionPreferences.COUNTERPART_SIDE : dimensionPreferences.ROOT_SIDE;
        const observations = {
            rootZhi:root.zhi || '',
            counterpartZhi:counterpart.zhi || '',
            chartBranchSnapshot:snapshot,
            contextBranches:Object.freeze(contextBranches),
            wuSupportSignals:Object.freeze(supportSignals),
            wuCounterSignals:Object.freeze(counterSignals),
            contextExcludesClashParticipants:true,
            matchingMode:'source-listed-zhi-existence-with-noncontradiction'
        };

        if (snapshot.length !== 4 || clashIndices.size !== 2 || contextBranches.length !== 2) {
            return makeDimension({
                record,
                status:dimensionStatuses.UNRESOLVED,
                reasonCode:'branch-context-incomplete',
                observations,
                statement:'四柱地支或六冲参与柱位不完整，无法按原文列出的支类上下文判断非季节有力方向。',
                boundary:'不得在四柱支位 provenance 不完整时补猜其他支类。'
            });
        }

        if (supportSignals.length && counterSignals.length) {
            return makeDimension({
                record,
                status:dimensionStatuses.UNRESOLVED,
                reasonCode:'mixed-source-listed-branch-context',
                observations,
                statement:'六冲之外的支类同时出现任氏列出的两组相反上下文；原文未给出二者并存时的仲裁规则，因此保持 unresolved。',
                boundary:'不得按两组支的数量、多数或固定权重决定“有力／无力”。'
            });
        }

        if (supportSignals.length) {
            return makeDimension({
                record,
                status:dimensionStatuses.RESOLVED,
                preference:wuPreference,
                reasonCode:'wu-side-source-listed-support-context',
                observations,
                statement:'子午冲之外的支类仅命中任氏为午方列出的寅卯巳未戌一组；在“非季节相对力量”这一维，记为午方 preference。',
                boundary:'这是对原文明确支类列表的存在性映射，不表示午方已经取得六冲整体胜负，也不把多个同组支重复计力。'
            });
        }

        if (counterSignals.length) {
            return makeDimension({
                record,
                status:dimensionStatuses.RESOLVED,
                preference:ziPreference,
                reasonCode:'zi-side-source-listed-counter-context',
                observations,
                statement:'子午冲之外的支类仅命中任氏列出的申酉亥子丑辰一组；在“非季节相对力量”这一维，记为子方 preference。',
                boundary:'这是对原文明确支类列表的存在性映射，不等同于自动“拔根”，也不因同组支增加而累计优势。'
            });
        }

        return makeDimension({
            record,
            status:dimensionStatuses.UNRESOLVED,
            reasonCode:'no-source-listed-branch-context-signal',
            observations,
            statement:'六冲之外的支类没有命中任氏对子午冲明确列出的两组上下文，当前非季节相对力量保持 unresolved。',
            boundary:'不得用未列支类或重复午支自行补成支持／反支持。'
        });
    };

    const buildNonseasonalForceDimension = (record = {}, semanticModel = {}) => {
        const root = record.rootSide || {};
        const counterpart = record.counterpartSide || {};
        const observations = {
            rootZhi:root.zhi || '',
            counterpartZhi:counterpart.zhi || '',
            sourceExampleHint:getSourceExampleHint(root, counterpart),
            elementPresenceScope:'unresolved'
        };

        if (!root.zhi || !counterpart.zhi) {
            return makeDimension({
                record,
                status:dimensionStatuses.UNRESOLVED,
                reasonCode:'participant-missing',
                observations,
                statement:'六冲参与双方未完整解析，非季节相对力量保持 unresolved。',
                boundary:'不得在参与方缺失时补猜“有力／无力”。'
            });
        }

        if (STORAGE_CLASH_KEYS.includes(pairKey(root.zhi, counterpart.zhi))) {
            return makeDimension({
                record,
                status:dimensionStatuses.UNRESOLVED,
                reasonCode:'storage-clash-special-handling',
                observations,
                statement:'丑未／辰戌四库兄弟之冲另有蓄藏、引出与司令条件，本层不套普通非季节相对力量模式。',
                boundary:'四库冲继续保持独立规则域。'
            });
        }

        const wuZi = buildWuZiBranchContextDimension(record, semanticModel);
        if (wuZi) return wuZi;

        const hint = getSourceExampleHint(root, counterpart);
        if (hint) {
            const targetIsRoot = root.zhi === hint.targetZhi;
            const target = targetIsRoot ? root : counterpart;
            return makeDimension({
                record,
                status:dimensionStatuses.UNRESOLVED,
                reasonCode:'source-example-element-scope-unresolved',
                observations:Object.freeze({
                    ...observations,
                    targetZhi:hint.targetZhi,
                    targetIsMonthBranch:target?.isMonthBranch === true,
                    requiresTargetMonthCommand:hint.requiresTargetMonthCommand,
                    requiredPresentElements:hint.presentElements,
                    requiredAbsentElements:hint.absentElements,
                    sourceTerm:hint.sourceTerm
                }),
                statement:'原典已给出该冲组的“四柱有／无某五行”例式，但“有／无”的观察范围尚未定稿，因此暂不转换为 preference。',
                boundary:'在明干、地支本气、藏干等 element-presence scope 未明确前，不得自行选择一种口径使例式成立。'
            });
        }

        return makeDimension({
            record,
            status:dimensionStatuses.UNRESOLVED,
            reasonCode:'explicit-nonseasonal-rule-missing',
            observations,
            statement:'当前没有足够明确的原典模式可解析该六冲的非季节相对力量。',
            boundary:'不得用五行生克直觉、同党数量或旺相休囚死替代缺失的非季节规则。'
        });
    };

    const replaceNonseasonalDimension = (record = {}, semanticModel = {}) => {
        const replacement = buildNonseasonalForceDimension(record, semanticModel);
        const existing = record.comparisonDimensions || [];
        const dimensions = Object.freeze(existing.map((item) => item.key === 'non-seasonal-relative-force' ? replacement : item));
        const comparison = typeof preconditionsApi?.compareSemanticDimensions === 'function'
            ? preconditionsApi.compareSemanticDimensions(dimensions)
            : record.comparison;
        return Object.freeze({
            ...record,
            comparisonDimensions:dimensions,
            comparison,
            resolutionStatus:comparison?.status === 'resolved' ? 'resolved' : 'unresolved',
            statement:replacement.status === dimensionStatuses.RESOLVED
                ? '非季节相对力量已有窄规则解析，但其余必要维度未必已完成，整体六冲比较仍按完整 comparisonDimensions 决定。'
                : record.statement,
            boundary:'non-seasonal-relative-force 的 resolved 只解决这一维，不直接生成根拔、反激或根有效状态。'
        });
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-CLASH-NONSEASONAL-FORCE-CONTRACT',
        claimKey:'root.six-clash.nonseasonal-force-contract',
        status:'resolved',
        ruleId:CLASH_NONSEASONAL_FORCE_RULE_ID,
        value:Object.freeze({
            directSourceBranchContextCoverage:Object.freeze(['子午']),
            sourceListedBranchMatching:'existence-with-noncontradiction',
            majorityVoting:false,
            duplicateSignalAccumulation:false,
            elementExampleScope:'unresolved',
            outputScope:'non-seasonal-relative-force-only'
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'任氏对子午冲直接列出两组“支中有……”上下文，可先按支类存在性建立窄规则；其他“有木／无金”等例式仍缺少 element-presence scope 定义。',
        boundary:'项目内部采用“相反列表不并存才解析”的保守形式；这是消除原文未述仲裁方式的安全约束，不得改写为多数表决或数量权重。'
    });

    const makeResolvedDimensionClaim = (record, dimension, index) => Object.freeze({
        id:`SC-CLASH-NONSEASONAL-FORCE-${String(index + 1).padStart(2, '0')}`,
        claimKey:`root.six-clash.${record.structureRef || record.id || index}.nonseasonal-force`,
        status:'resolved',
        ruleId:CLASH_NONSEASONAL_FORCE_RULE_ID,
        value:dimension.preference,
        sourceEffectIds:freezeArray(record.sourceEffectIds || []),
        sourceRefs:freezeArray([record.structureRef]),
        rationale:dimension.statement,
        boundary:dimension.boundary
    });

    const buildDependency = (records = [], resolvedClaimIds = []) => {
        const dimensions = records.map((record) => (record.comparisonDimensions || []).find((item) => item.key === 'non-seasonal-relative-force')).filter(Boolean);
        const allResolved = dimensions.length > 0 && dimensions.every((item) => item.status === dimensionStatuses.RESOLVED);
        return Object.freeze({
            id:'SD-CLASH-NONSEASONAL-RELATIVE-FORCE',
            kind:'interaction',
            scope:'root-six-clash-nonseasonal-relative-force',
            status:records.length ? (allResolved ? 'resolved' : 'unresolved') : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze(unique(records.map((item) => item.structureRef))),
            resolvedByClaimIds:Object.freeze(records.length ? resolvedClaimIds : ['SC-CLASH-NONSEASONAL-FORCE-CONTRACT']),
            ruleId:CLASH_NONSEASONAL_FORCE_RULE_ID,
            statement:!records.length
                ? '当前没有根 actor 参与六冲，非季节相对力量在本局为 not-applicable。'
                : allResolved
                    ? '本局所有 root clash 的 non-seasonal-relative-force 均被当前窄规则解析。'
                    : '至少一个 root clash 超出当前子午支类窄规则、出现相反上下文并存，或仍受 element-presence scope 未定阻断。',
            boundary:'resolved 仅表示 non-seasonal-relative-force 这一维已解析；不得据此认为完整六冲结果或根效力已经 resolved。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({
                ...base,
                clashNonseasonalForceRuleIds:Object.freeze([])
            });
        }

        const records = Object.freeze((base.clashPreconditionRecords || []).map((record) => replaceNonseasonalDimension(record, semanticModel)));
        const resolvedPairs = records.flatMap((record, index) => {
            const dimension = (record.comparisonDimensions || []).find((item) => item.key === 'non-seasonal-relative-force');
            return dimension?.status === dimensionStatuses.RESOLVED ? [{ record, dimension, index }] : [];
        });
        const resolvedClaims = resolvedPairs.map(({ record, dimension, index }) => makeResolvedDimensionClaim(record, dimension, index));
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...resolvedClaims]);

        const withoutDependency = (base.dependencies || []).filter((item) => item.id !== 'SD-CLASH-NONSEASONAL-RELATIVE-FORCE');
        const linkedDependencies = withoutDependency.map((item) => {
            if (item.id !== 'SD-CLASH-RELATIVE-STATE-COMPARISON') return item;
            return Object.freeze({
                ...item,
                dependsOnDependencyIds:Object.freeze(unique([
                    ...(item.dependsOnDependencyIds || []),
                    'SD-CLASH-NONSEASONAL-RELATIVE-FORCE'
                ])),
                status:records.length ? 'unresolved' : 'resolved',
                statement:records.length
                    ? '季节地位与非季节相对力量已分别进入独立维度；任何其他必要维度未解析时，整体 comparison 仍保持 insufficient。'
                    : item.statement
            });
        });
        const dependency = buildDependency(records, resolvedClaims.map((item) => item.id));
        const dependencies = Object.freeze([...linkedDependencies, dependency]);
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
            clashPreconditionRecords:records,
            clashNonseasonalForceRuleIds:Object.freeze([CLASH_NONSEASONAL_FORCE_RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '子午冲的非季节相对力量只按任氏明确列出的两组支类做存在性窄匹配；相反组并存时不仲裁。',
                '同组支出现多个不得累计优势，也不得按列表命中数量进行多数表决。',
                '“四柱有木／无金、有火／无土”等例式只保存 source hint；element-presence scope 未定前不生成 preference。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        const wrappedBuildStrengthSynthesis = (semanticModel = {}) =>
            extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel));
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:wrappedBuildStrengthSynthesis
        });
    }

    GuiJia.baziClashNonseasonalForce = Object.freeze({
        installed:true,
        CLASH_NONSEASONAL_FORCE_VERSION,
        CLASH_NONSEASONAL_FORCE_RULE_ID,
        WU_SUPPORT_CONTEXT_ZHI,
        WU_COUNTER_CONTEXT_ZHI,
        SOURCE_EXAMPLE_HINTS,
        buildChartBranchSnapshot,
        getSourceExampleHint,
        buildWuZiBranchContextDimension,
        buildNonseasonalForceDimension,
        replaceNonseasonalDimension,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
