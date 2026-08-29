(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziClashSeasonalPosition?.installed) return;

    const preconditionsApi = GuiJia.baziClashPreconditions || null;
    const baseSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const CLASH_SEASONAL_POSITION_VERSION = '0.1';
    const CLASH_SEASONAL_POSITION_RULE_ID = 'BAZI-STRENGTH-CLASH-SEASONAL-POSITION-001';

    const STORAGE_CLASH_PAIRS = Object.freeze([
        Object.freeze(['丑','未']),
        Object.freeze(['辰','戌'])
    ]);

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'得令者冲衰则拔，失时者冲旺无伤' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'如午旺提纲，四柱无金而有木，则午能冲子' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'如卯旺提纲，四柱有火而无土，则卯亦能冲酉' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'至于四库兄弟之冲，其蓄藏之物，看其四柱干支，有无引出' })
    ]);

    const dimensionStatuses = preconditionsApi?.dimensionStatuses || Object.freeze({
        UNRESOLVED:'unresolved', RESOLVED:'resolved', NOT_APPLICABLE:'not-applicable'
    });
    const dimensionPreferences = preconditionsApi?.dimensionPreferences || Object.freeze({
        ROOT_SIDE:'root-side', COUNTERPART_SIDE:'counterpart-side', EQUIVALENT:'equivalent'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const isStorageClashPair = (a, b) => STORAGE_CLASH_PAIRS.some(([left, right]) =>
        (a === left && b === right) || (a === right && b === left)
    );

    const makeDimension = ({ id, key, status, preference = null, reasonCode, observations, statement, boundary, sourceBasis = SOURCE_BASIS }) => Object.freeze({
        id,
        key,
        required:true,
        status,
        preference,
        reasonCode,
        observations:Object.freeze({ ...observations }),
        sourceBasis:Object.freeze(sourceBasis.map((item) => Object.freeze({ ...item }))),
        statement,
        boundary
    });

    const buildSeasonalCommandDimension = (record = {}) => {
        const root = record.rootSide || {};
        const counterpart = record.counterpartSide || {};
        const id = `CD-${record.id || 'UNKNOWN'}-SEASONAL-COMMAND`;
        const observations = {
            rootZhi:root.zhi || '',
            counterpartZhi:counterpart.zhi || '',
            rootIsMonthBranch:root.isMonthBranch === true,
            counterpartIsMonthBranch:counterpart.isMonthBranch === true,
            rootSeasonalFiveState:root.seasonalFiveState || '',
            counterpartSeasonalFiveState:counterpart.seasonalFiveState || '',
            monthZhi:root.monthZhi || counterpart.monthZhi || ''
        };

        if (!root.zhi || !counterpart.zhi) {
            return makeDimension({
                id,
                key:'seasonal-command-position',
                status:dimensionStatuses.UNRESOLVED,
                reasonCode:'participant-missing',
                observations,
                statement:'六冲参与双方未完整解析，季节地位维度保持 unresolved。',
                boundary:'不得在参与方缺失时补猜月令地位或相对占优。'
            });
        }

        if (isStorageClashPair(root.zhi, counterpart.zhi)) {
            return makeDimension({
                id,
                key:'seasonal-command-position',
                status:dimensionStatuses.UNRESOLVED,
                reasonCode:'storage-clash-special-handling',
                observations,
                statement:'丑未／辰戌属于四库兄弟之冲，原典另列司令与所藏引出条件，当前不沿用普通“旺提纲”季节地位映射。',
                boundary:'四库冲不得因为一方恰为月支就直接生成 seasonal preference。'
            });
        }

        const rootHoldsCommand = root.isMonthBranch === true;
        const counterpartHoldsCommand = counterpart.isMonthBranch === true;
        if (rootHoldsCommand !== counterpartHoldsCommand) {
            const preference = rootHoldsCommand
                ? dimensionPreferences.ROOT_SIDE
                : dimensionPreferences.COUNTERPART_SIDE;
            const holder = rootHoldsCommand ? '根方' : '冲方';
            return makeDimension({
                id,
                key:'seasonal-command-position',
                status:dimensionStatuses.RESOLVED,
                preference,
                reasonCode:'direct-month-command-holder',
                observations,
                statement:`${holder}本身即为月支提纲；仅在“季节地位”这一语义维度记为占优。`,
                boundary:'月支提纲只解析 seasonal-command-position；不得单独升级为整体旺衰、六冲胜负、根有效状态或身强弱结论。'
            });
        }

        return makeDimension({
            id,
            key:'seasonal-command-position',
            status:dimensionStatuses.UNRESOLVED,
            reasonCode:'no-direct-month-command-holder',
            observations,
            statement:'六冲双方均不是月支本身；即使旺相休囚死存在差异，当前规则也不把五态顺序直接转换为 seasonal preference。',
            boundary:'当前正向规则只覆盖“一方本身为月支提纲”的窄情形，不外推为旺相休囚死通用排序器。'
        });
    };

    const buildResidualDimensions = (record = {}) => Object.freeze([
        makeDimension({
            id:`CD-${record.id || 'UNKNOWN'}-RELATIVE-FORCE`,
            key:'non-seasonal-relative-force',
            status:dimensionStatuses.UNRESOLVED,
            reasonCode:'independent-force-rule-missing',
            observations:{
                rootZhi:record.rootSide?.zhi || '',
                counterpartZhi:record.counterpartSide?.zhi || ''
            },
            statement:'除月令地位外，冲双方整体有力程度尚缺独立规则解析。',
            boundary:'季节地位占优不能替代“冲之者有力／无力”等非季节条件。',
            sourceBasis:Object.freeze([
                Object.freeze({ source:'《滴天髓阐微·地支》', term:'冲之者有力，则能去之；冲之者无力，则反激之' })
            ])
        }),
        makeDimension({
            id:`CD-${record.id || 'UNKNOWN'}-SUPPORT-RESCUE`,
            key:'support-restraint-rescue-context',
            status:dimensionStatuses.UNRESOLVED,
            reasonCode:'support-rescue-rule-missing',
            observations:{
                structureRef:record.structureRef || ''
            },
            statement:'四柱中的扶助、抑冲、助泄与解救背景尚缺独立规则解析。',
            boundary:'外围结构不得按数量折算为优势，也不得由存在关系直接判定扶助或解救成立。',
            sourceBasis:Object.freeze([
                Object.freeze({ source:'《滴天髓阐微·地支》', term:'必先察其衰旺，四柱有无解救，或抑冲，或助泄' })
            ])
        })
    ]);

    const enrichClashRecord = (record = {}) => {
        const seasonalDimension = buildSeasonalCommandDimension(record);
        const dimensions = Object.freeze([
            seasonalDimension,
            ...buildResidualDimensions(record)
        ]);
        const comparison = typeof preconditionsApi?.compareSemanticDimensions === 'function'
            ? preconditionsApi.compareSemanticDimensions(dimensions)
            : Object.freeze({ status:'insufficient', outcome:null, consideredDimensionIds:Object.freeze([]), blockingDimensionIds:Object.freeze(dimensions.map((item) => item.id)), rationale:'comparison api unavailable' });
        return Object.freeze({
            ...record,
            comparisonDimensions:dimensions,
            comparison,
            resolutionStatus:comparison.status === 'resolved' ? 'resolved' : 'unresolved',
            statement:seasonalDimension.status === dimensionStatuses.RESOLVED
                ? '六冲的季节地位维度已有窄规则解析，但其他必要维度仍未解析，因此整体相对状态仍 insufficient。'
                : '六冲季节地位与其他必要维度尚未全部解析，因此整体相对状态仍 insufficient。',
            boundary:'任何单一 comparison dimension 的 resolved 都不得直接写成六冲整体胜负或根实际效力。'
        });
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-CLASH-SEASONAL-POSITION-CONTRACT',
        claimKey:'root.six-clash.seasonal-position-contract',
        status:'resolved',
        ruleId:CLASH_SEASONAL_POSITION_RULE_ID,
        value:Object.freeze({
            directMonthCommandHolderMayResolveDimension:true,
            appliesToStorageClash:false,
            fiveStateRankingEnabled:false,
            outputScope:'seasonal-command-position-only'
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'任氏以“得令／失时”区分六冲条件，并以“午旺提纲”“卯旺提纲”等说明月支提纲的季节地位；同时另列四库兄弟之冲。当前只把“一方本身即月支提纲”的非四库情形解析为季节维度 preference。',
        boundary:'该规则不把旺相休囚死建立成通用排序，也不把 seasonal preference 等同于整体旺衰、六冲结果或最终身强弱。'
    });

    const makeResolvedDimensionClaim = (record, dimension, index) => Object.freeze({
        id:`SC-CLASH-SEASONAL-POSITION-${String(index + 1).padStart(2, '0')}`,
        claimKey:`root.six-clash.${record.structureRef || record.id || index}.seasonal-position`,
        status:'resolved',
        ruleId:CLASH_SEASONAL_POSITION_RULE_ID,
        value:dimension.preference,
        sourceEffectIds:freezeArray(record.sourceEffectIds || []),
        sourceRefs:freezeArray([record.structureRef]),
        rationale:dimension.statement,
        boundary:dimension.boundary
    });

    const buildSeasonalDependency = (records = [], resolvedClaimIds = []) => {
        const dimensions = records.map((record) => (record.comparisonDimensions || []).find((item) => item.key === 'seasonal-command-position')).filter(Boolean);
        const allResolved = dimensions.length > 0 && dimensions.every((item) => item.status === dimensionStatuses.RESOLVED);
        return Object.freeze({
            id:'SD-CLASH-SEASONAL-POSITION',
            kind:'interaction',
            scope:'root-six-clash-seasonal-position',
            status:records.length ? (allResolved ? 'resolved' : 'unresolved') : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze(unique(records.map((item) => item.structureRef))),
            resolvedByClaimIds:Object.freeze(records.length ? resolvedClaimIds : ['SC-CLASH-SEASONAL-POSITION-CONTRACT']),
            ruleId:CLASH_SEASONAL_POSITION_RULE_ID,
            statement:!records.length
                ? '当前没有根 actor 参与六冲，季节地位维度在本局为 not-applicable。'
                : allResolved
                    ? '本局所有 root clash 的季节地位维度均已由“一方本身为月支提纲”的窄规则解析。'
                    : '至少一个 root clash 不满足当前季节地位窄规则，或属于四库冲，季节地位依赖保持 unresolved。',
            boundary:'resolved 只表示 seasonal-command-position 这一维已解析；不得据此认为六冲整体相对状态或根效力已经 resolved。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({
                ...base,
                clashSeasonalPositionRuleIds:Object.freeze([])
            });
        }

        const records = Object.freeze((base.clashPreconditionRecords || []).map(enrichClashRecord));
        const resolvedPairs = records.flatMap((record, index) => {
            const dimension = (record.comparisonDimensions || []).find((item) => item.key === 'seasonal-command-position');
            return dimension?.status === dimensionStatuses.RESOLVED
                ? [{ record, dimension, index }]
                : [];
        });
        const resolvedClaims = resolvedPairs.map(({ record, dimension, index }) => makeResolvedDimensionClaim(record, dimension, index));
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...resolvedClaims]);

        const dependenciesWithoutSeasonal = (base.dependencies || []).filter((item) => item.id !== 'SD-CLASH-SEASONAL-POSITION');
        const dependenciesWithLink = dependenciesWithoutSeasonal.map((item) => {
            if (item.id !== 'SD-CLASH-RELATIVE-STATE-COMPARISON') return item;
            return Object.freeze({
                ...item,
                dependsOnDependencyIds:Object.freeze(unique([
                    ...(item.dependsOnDependencyIds || []),
                    'SD-CLASH-SEASONAL-POSITION'
                ])),
                status:records.length ? 'unresolved' : 'resolved',
                statement:records.length
                    ? '季节地位维度已开始按窄规则解析，但非季节有力程度及扶助／制化／解救等必要维度仍未完成，整体比较保持 insufficient。'
                    : item.statement
            });
        });
        const seasonalDependency = buildSeasonalDependency(records, resolvedClaims.map((item) => item.id));
        const dependencies = Object.freeze([...dependenciesWithLink, seasonalDependency]);
        const conflicts = typeof baseSynthesisApi?.detectConflicts === 'function'
            ? baseSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof baseSynthesisApi?.buildSufficiency === 'function'
            ? baseSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            clashPreconditionRecords:records,
            clashSeasonalPositionRuleIds:Object.freeze([CLASH_SEASONAL_POSITION_RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '六冲一方本身为月支提纲时，只能在 seasonal-command-position 维度记为占优；不得直接升级为整体旺衰或六冲结果。',
                '旺相休囚死目前不建立通用高低排序；非月支的旺／相等状态仍需独立规则才能形成 seasonal preference。',
                '丑未、辰戌四库兄弟之冲保留独立处理，不沿用普通月支提纲 preference 规则。'
            ])
        });
    };

    if (baseSynthesisApi && typeof baseSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = baseSynthesisApi.buildStrengthSynthesis;
        const wrappedBuildStrengthSynthesis = (semanticModel = {}) =>
            extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel));
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...baseSynthesisApi,
            buildStrengthSynthesis:wrappedBuildStrengthSynthesis,
            buildSeasonalCommandDimension
        });
    }

    GuiJia.baziClashSeasonalPosition = Object.freeze({
        installed:true,
        CLASH_SEASONAL_POSITION_VERSION,
        CLASH_SEASONAL_POSITION_RULE_ID,
        STORAGE_CLASH_PAIRS,
        SOURCE_BASIS,
        isStorageClashPair,
        buildSeasonalCommandDimension,
        buildResidualDimensions,
        enrichClashRecord,
        buildSeasonalDependency,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
