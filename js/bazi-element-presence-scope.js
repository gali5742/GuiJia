(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziElementPresenceScope?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    const preconditionsApi = GuiJia.baziClashPreconditions || null;
    const nonseasonalApi = GuiJia.baziClashNonseasonalForce || null;
    const baziCore = GuiJia.baziCore || {};

    const ELEMENT_PRESENCE_SCOPE_VERSION = '0.1';
    const ELEMENT_PRESENCE_SCOPE_RULE_ID = 'BAZI-STRENGTH-ELEMENT-PRESENCE-SCOPE-001';
    const ELEMENT_PRESENCE_SCOPE_KEY = 'explicit-pillar-surface';

    const dimensionStatuses = preconditionsApi?.dimensionStatuses || Object.freeze({
        UNRESOLVED:'unresolved', RESOLVED:'resolved', NOT_APPLICABLE:'not-applicable'
    });

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'午旺提纲，四柱无金而有木' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'卯旺提纲，四柱有火而无土' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'寅旺提纲，四柱有火' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'巳旺提纲，四柱有木' }),
        Object.freeze({ source:'《滴天髓阐微》', term:'凡柱中有甲乙寅卯，皆能运用水气' }),
        Object.freeze({ source:'《滴天髓阐微》', term:'癸未 乙卯 甲戌 乙亥：四柱无金……五行无火' }),
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'戊辰 辛酉 丙午 癸巳：五行无木' })
    ]);

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const collectVisibleStemActors = (semanticModel = {}) => {
        const evidence = semanticModel.strengthEvidence?.evidence || {};
        return [
            ...(evidence.visibleSupportActors || []),
            ...(evidence.visibleRestraintActors || []),
            ...(evidence.visibleDrainActors || []),
            ...(evidence.visibleDistributionActors || [])
        ];
    };

    const buildExplicitPillarSurfaceSnapshot = (semanticModel = {}) => {
        const evidenceCollection = semanticModel.strengthEvidence || {};
        const evidence = evidenceCollection.evidence || {};
        const stemByIndex = new Map();
        const branchByIndex = new Map();

        const dayGan = evidenceCollection.dayMaster?.gan || '';
        if (dayGan) stemByIndex.set(2, dayGan);
        collectVisibleStemActors(semanticModel).forEach((item) => {
            if (Number.isInteger(item?.pillarIndex) && item?.gan) stemByIndex.set(item.pillarIndex, item.gan);
        });

        (evidence.branchQi || []).forEach((item) => {
            if (Number.isInteger(item?.pillarIndex) && item?.zhi) branchByIndex.set(item.pillarIndex, item.zhi);
        });
        const monthZhi = evidence.seasonalState?.monthZhi || '';
        if (monthZhi) branchByIndex.set(1, monthZhi);

        const pillars = [0,1,2,3].map((pillarIndex) => {
            const gan = stemByIndex.get(pillarIndex) || '';
            const zhi = branchByIndex.get(pillarIndex) || '';
            return Object.freeze({
                pillarIndex,
                gan,
                zhi,
                ganElement:gan ? (baziCore.getWuXing?.(gan) || '') : '',
                zhiElement:zhi ? (baziCore.getWuXing?.(zhi) || '') : ''
            });
        });

        return Object.freeze({
            scope:ELEMENT_PRESENCE_SCOPE_KEY,
            complete:pillars.every((item) => item.gan && item.zhi),
            pillars:Object.freeze(pillars),
            hiddenStemsIncluded:false,
            derivedTransformationsIncluded:false,
            statement:'“四柱有／无某五行”在本规则族中按四柱表层干支观察：明干按本五行，地支按支本五行；藏干单独出现及合化等派生结果不改写字面有无。'
        });
    };

    const inspectElementPresence = (snapshot = {}, element = '') => {
        const ganMatches = (snapshot.pillars || []).filter((item) => item.ganElement === element)
            .map((item) => Object.freeze({ pillarIndex:item.pillarIndex, source:'visible-stem', symbol:item.gan }));
        const zhiMatches = (snapshot.pillars || []).filter((item) => item.zhiElement === element)
            .map((item) => Object.freeze({ pillarIndex:item.pillarIndex, source:'visible-branch', symbol:item.zhi }));
        const matches = Object.freeze([...ganMatches, ...zhiMatches]);
        return Object.freeze({
            element,
            present:matches.length > 0,
            matches,
            scope:snapshot.scope || ELEMENT_PRESENCE_SCOPE_KEY
        });
    };

    const buildElementExampleSignal = (record = {}, semanticModel = {}) => {
        const dimension = (record.comparisonDimensions || []).find((item) => item.key === 'non-seasonal-relative-force');
        const root = record.rootSide || {};
        const counterpart = record.counterpartSide || {};
        const hint = dimension?.observations?.sourceExampleHint
            || nonseasonalApi?.getSourceExampleHint?.(root, counterpart)
            || null;
        if (!hint) {
            return Object.freeze({ status:'not-applicable', preference:null, reasonCode:'no-source-element-example', hint:null });
        }

        const targetIsRoot = root.zhi === hint.targetZhi;
        const targetIsCounterpart = counterpart.zhi === hint.targetZhi;
        const target = targetIsRoot ? root : targetIsCounterpart ? counterpart : null;
        const preference = targetIsRoot ? 'root-side' : targetIsCounterpart ? 'counterpart-side' : null;
        const snapshot = buildExplicitPillarSurfaceSnapshot(semanticModel);
        const presentChecks = (hint.presentElements || []).map((element) => inspectElementPresence(snapshot, element));
        const absentChecks = (hint.absentElements || []).map((element) => inspectElementPresence(snapshot, element));

        const base = {
            hint,
            targetZhi:hint.targetZhi,
            targetIsMonthBranch:target?.isMonthBranch === true,
            scope:ELEMENT_PRESENCE_SCOPE_KEY,
            snapshot,
            presentChecks:Object.freeze(presentChecks),
            absentChecks:Object.freeze(absentChecks),
            hiddenStemsIncluded:false,
            derivedTransformationsIncluded:false
        };

        if (!target || !preference) {
            return Object.freeze({ ...base, status:'unresolved', preference:null, reasonCode:'source-example-target-missing' });
        }
        if (!snapshot.complete) {
            return Object.freeze({ ...base, status:'unresolved', preference:null, reasonCode:'surface-snapshot-incomplete' });
        }
        if (hint.requiresTargetMonthCommand && target.isMonthBranch !== true) {
            return Object.freeze({ ...base, status:'not-matched', preference:null, reasonCode:'target-not-month-command' });
        }

        const allPresent = presentChecks.every((item) => item.present === true);
        const allAbsent = absentChecks.every((item) => item.present === false);
        if (!allPresent || !allAbsent) {
            return Object.freeze({ ...base, status:'not-matched', preference:null, reasonCode:'surface-element-conditions-not-met' });
        }

        return Object.freeze({
            ...base,
            status:'resolved',
            preference,
            reasonCode:'source-example-surface-element-context',
            statement:`${hint.sourceTerm}：按四柱表层干支 scope 核验后，原典例式条件成立；仅为目标${hint.targetZhi}方生成 non-seasonal-relative-force signal。`,
            boundary:'该 signal 只表示该原典例式被满足；不得把条件不满足反推为对方占优，也不得单独生成六冲整体胜负或根效力。'
        });
    };

    const mergeElementSignalIntoDimension = (record = {}, semanticModel = {}) => {
        const dimensions = record.comparisonDimensions || [];
        const current = dimensions.find((item) => item.key === 'non-seasonal-relative-force');
        if (!current) return record;

        const signal = buildElementExampleSignal(record, semanticModel);
        const observations = Object.freeze({
            ...(current.observations || {}),
            elementPresenceScope:ELEMENT_PRESENCE_SCOPE_KEY,
            elementPresenceSignal:signal
        });

        let replacement = current;
        if (signal.status === 'resolved') {
            if (current.status === dimensionStatuses.RESOLVED) {
                if (current.preference === signal.preference) {
                    replacement = Object.freeze({
                        ...current,
                        observations,
                        reasonCode:'source-patterns-converge',
                        statement:`${current.statement} 同时，${signal.statement}`,
                        boundary:'同向 source pattern 只形成语义收敛，不累计为额外力量或权重。'
                    });
                } else {
                    replacement = Object.freeze({
                        ...current,
                        status:dimensionStatuses.UNRESOLVED,
                        preference:null,
                        observations,
                        reasonCode:'conflicting-source-patterns',
                        statement:'同一 non-seasonal-relative-force 内出现相反 source pattern；缺少独立优先规则，保持 unresolved。',
                        boundary:'不得以 source pattern 数量、先后或自定权重裁决相反方向。'
                    });
                }
            } else if (current.reasonCode === 'mixed-source-listed-branch-context') {
                replacement = Object.freeze({
                    ...current,
                    observations,
                    statement:'既有支类上下文本身已出现相反组并存；即使元素例式另有单向 signal，也不能覆盖该未决冲突。',
                    boundary:'已有 source-level mixed context 不得被另一条单向例式补偿或覆盖。'
                });
            } else {
                replacement = Object.freeze({
                    ...current,
                    status:dimensionStatuses.RESOLVED,
                    preference:signal.preference,
                    observations,
                    reasonCode:signal.reasonCode,
                    statement:signal.statement,
                    boundary:signal.boundary,
                    sourceBasis:Object.freeze(unique([
                        ...((current.sourceBasis || []).map((item) => JSON.stringify(item))),
                        ...SOURCE_BASIS.map((item) => JSON.stringify(item))
                    ]).map((item) => Object.freeze(JSON.parse(item))))
                });
            }
        } else {
            replacement = Object.freeze({
                ...current,
                observations,
                ...(current.reasonCode === 'source-example-element-scope-unresolved'
                    ? {
                        reasonCode:signal.reasonCode === 'surface-element-conditions-not-met' ? 'source-example-surface-conditions-not-met' : signal.reasonCode,
                        statement:signal.reasonCode === 'surface-element-conditions-not-met'
                            ? 'element-presence scope 已解析，但当前四柱表层干支不满足该原典例式的有／无五行条件，因此本例式不生成 preference。'
                            : current.statement,
                        boundary:'scope 已明确并不等于例式必然成立；条件未满足时不得反推对方 preference。'
                    }
                    : {})
            });
        }

        const nextDimensions = Object.freeze(dimensions.map((item) => item.key === 'non-seasonal-relative-force' ? replacement : item));
        const comparison = typeof preconditionsApi?.compareSemanticDimensions === 'function'
            ? preconditionsApi.compareSemanticDimensions(nextDimensions)
            : record.comparison;
        return Object.freeze({
            ...record,
            comparisonDimensions:nextDimensions,
            comparison,
            resolutionStatus:comparison?.status === 'resolved' ? 'resolved' : 'unresolved'
        });
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-ELEMENT-PRESENCE-SCOPE-CONTRACT',
        claimKey:'root.six-clash.element-presence-scope',
        status:'resolved',
        ruleId:ELEMENT_PRESENCE_SCOPE_RULE_ID,
        value:Object.freeze({
            scope:ELEMENT_PRESENCE_SCOPE_KEY,
            visibleStemsIncluded:true,
            visibleBranchesIncluded:true,
            hiddenStemsIncluded:false,
            derivedTransformationsIncluded:false,
            sourceSpecific:true,
            sourceFamily:'《滴天髓阐微》六冲“四柱有／无某五行”例式'
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'任氏另文以“凡柱中有甲乙寅卯”并列明干与明支；同时在戌藏辛、未戌藏丁的命例仍称“四柱无金”“五行无火”，在辰藏乙的命例仍称“五行无木”。据此，本规则族将“有／无某五行”限于四柱表层干支，不以藏干单独满足。',
        boundary:'这是《滴天髓阐微》该规则族的 source-specific scope，不扩张为所有古籍中“有／无五行”的统一语法；合化等派生结构也不改写四柱字面有无。'
    });

    const makeResolvedDimensionClaim = (record, dimension, index) => Object.freeze({
        id:`SC-CLASH-ELEMENT-SURFACE-${String(index + 1).padStart(2, '0')}`,
        claimKey:`root.six-clash.${record.structureRef || record.id || index}.nonseasonal-force`,
        status:'resolved',
        ruleId:ELEMENT_PRESENCE_SCOPE_RULE_ID,
        value:dimension.preference,
        sourceEffectIds:freezeArray(record.sourceEffectIds || []),
        sourceRefs:freezeArray([record.structureRef]),
        rationale:dimension.statement,
        boundary:dimension.boundary
    });

    const rebuildNonseasonalDependency = (base = {}, records = [], claimIds = []) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CLASH-NONSEASONAL-RELATIVE-FORCE') || {};
        const dimensions = records.map((record) => (record.comparisonDimensions || []).find((item) => item.key === 'non-seasonal-relative-force')).filter(Boolean);
        const allResolved = dimensions.length > 0 && dimensions.every((item) => item.status === dimensionStatuses.RESOLVED);
        return Object.freeze({
            ...current,
            id:'SD-CLASH-NONSEASONAL-RELATIVE-FORCE',
            status:records.length ? (allResolved ? 'resolved' : 'unresolved') : 'resolved',
            dependsOnDependencyIds:Object.freeze(unique([...(current.dependsOnDependencyIds || []), 'SD-CLASH-ELEMENT-PRESENCE-SCOPE'])),
            resolvedByClaimIds:Object.freeze(unique([...(current.resolvedByClaimIds || []), ...claimIds])),
            statement:!records.length
                ? '当前没有根 actor 参与六冲，非季节相对力量在本局为 not-applicable。'
                : allResolved
                    ? '本局所有 root clash 的 non-seasonal-relative-force 已由支类窄规则和／或表层干支元素例式解析。'
                    : '至少一个 root clash 仍缺少可用 source pattern、存在 source-level mixed context，或原典元素例式条件未满足。',
            boundary:'element-presence scope 的 resolved 只允许核验原典例式；不得把条件未满足反推为对方有力。'
        });
    };

    const buildScopeDependency = () => Object.freeze({
        id:'SD-CLASH-ELEMENT-PRESENCE-SCOPE',
        kind:'rule-coverage',
        scope:'ditiansui-clash-element-presence-scope',
        status:'resolved',
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        resolvedByClaimIds:Object.freeze(['SC-ELEMENT-PRESENCE-SCOPE-CONTRACT']),
        ruleId:ELEMENT_PRESENCE_SCOPE_RULE_ID,
        statement:'《滴天髓阐微》六冲例式中的“四柱有／无某五行”已解析为 explicit-pillar-surface scope。',
        boundary:'仅解析观察范围，不等同于任何具体例式已经成立。'
    });

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({ ...base, elementPresenceScopeRuleIds:Object.freeze([]) });
        }

        const originalRecords = base.clashPreconditionRecords || [];
        const records = Object.freeze(originalRecords.map((record) => mergeElementSignalIntoDimension(record, semanticModel)));
        const existingClaimKeys = new Set((base.claims || []).map((item) => item.claimKey));
        const newResolvedPairs = records.flatMap((record, index) => {
            const dimension = (record.comparisonDimensions || []).find((item) => item.key === 'non-seasonal-relative-force');
            const signal = dimension?.observations?.elementPresenceSignal;
            const claimKey = `root.six-clash.${record.structureRef || record.id || index}.nonseasonal-force`;
            return dimension?.status === dimensionStatuses.RESOLVED && signal?.status === 'resolved' && !existingClaimKeys.has(claimKey)
                ? [{ record, dimension, index }]
                : [];
        });
        const newClaims = newResolvedPairs.map(({ record, dimension, index }) => makeResolvedDimensionClaim(record, dimension, index));
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...newClaims]);

        const scopeDependency = buildScopeDependency();
        const nonseasonalDependency = rebuildNonseasonalDependency(base, records, newClaims.map((item) => item.id));
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !['SD-CLASH-NONSEASONAL-RELATIVE-FORCE','SD-CLASH-ELEMENT-PRESENCE-SCOPE'].includes(item.id)),
            nonseasonalDependency,
            scopeDependency
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
            clashPreconditionRecords:records,
            elementPresenceScopeRuleIds:Object.freeze([ELEMENT_PRESENCE_SCOPE_RULE_ID]),
            elementPresenceScopeContract:Object.freeze({
                version:ELEMENT_PRESENCE_SCOPE_VERSION,
                scope:ELEMENT_PRESENCE_SCOPE_KEY,
                visibleStemsIncluded:true,
                visibleBranchesIncluded:true,
                hiddenStemsIncluded:false,
                derivedTransformationsIncluded:false,
                sourceSpecific:true
            }),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '《滴天髓阐微》六冲例式的“四柱有／无五行”按明干与地支本五行观察；藏干单独出现不满足该字面条件。',
                '合化、会局等派生结构不改写 explicit-pillar-surface 的字面有无。',
                '元素例式条件不满足只表示该例式未触发，不得自动生成相反方向 preference。'
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

    GuiJia.baziElementPresenceScope = Object.freeze({
        installed:true,
        ELEMENT_PRESENCE_SCOPE_VERSION,
        ELEMENT_PRESENCE_SCOPE_RULE_ID,
        ELEMENT_PRESENCE_SCOPE_KEY,
        SOURCE_BASIS,
        buildExplicitPillarSurfaceSnapshot,
        inspectElementPresence,
        buildElementExampleSignal,
        mergeElementSignalIntoDimension,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
