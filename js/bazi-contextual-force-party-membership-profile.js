(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyMembershipProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyMembershipContract || null;
    if (!contractApi) return;

    const { VERSION, RULE_ID, MEMBERSHIP_CLASSES, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const relationOf = (record = {}) => record.relationToDayMaster || record.relation || record.strengthMeaning || null;

    const actorKeyOf = (record = {}, scope = '') => {
        if (record.actorKey) return record.actorKey;
        if (scope === 'surface-branch' || record.scope === 'surface-branch') {
            return `surface-branch:${record.pillarIndex ?? record.position ?? 'unknown'}:${record.zhi || 'unknown'}`;
        }
        return `unresolved-actor:${record.id || 'unknown'}`;
    };

    const normalizeContribution = (record = {}) => Object.freeze({
        id:record.id || null,
        contributionState:record.contributionState || null,
        realizationState:record.realizationState || null,
        strengthMeaning:record.strengthMeaning || null,
        sourcePatternId:record.sourcePatternId || null
    });

    const buildContributionMap = (profile = {}) => {
        const map = new Map();
        const axes = profile.axes || {};
        ['alliedSupport','incomingRestraint','outboundDrain','outboundDistribution'].forEach((axisId) => {
            (axes[axisId]?.projectContributionRecords || []).forEach((record) => {
                const key = record.actorKey || null;
                if (!key) return;
                if (!map.has(key)) map.set(key, []);
                map.get(key).push(normalizeContribution(record));
            });
        });
        return map;
    };

    const makeRecord = ({ id, actorKey, sourceAxisId, sourceRecord = {}, sourceScope, membershipClass, evidenceRole, counterAnchorId = null, contributionQualifiers = [], boundary }) => Object.freeze({
        id,
        actorKey,
        sourceAxisId,
        sourceRecordId:sourceRecord.id || null,
        sourceScope,
        position:sourceRecord.position || null,
        pillarIndex:sourceRecord.pillarIndex ?? null,
        gan:sourceRecord.gan || null,
        zhi:sourceRecord.zhi || null,
        wuxing:sourceRecord.wuxing || null,
        tenGod:sourceRecord.tenGod || null,
        relationToDayMaster:relationOf(sourceRecord),
        membershipClass,
        evidenceRole,
        counterAnchorId,
        contributionQualifiers:freezeArray(contributionQualifiers),
        realizedMember:null,
        numericWeight:null,
        boundary
    });

    const mapRootFoundation = (profile = {}, contributionMap = new Map()) => {
        const root = profile.axes?.rootFoundation || {};
        const records = [];
        const add = (kind, node = {}) => {
            (node.actorKeys || []).forEach((actorKey, index) => {
                records.push(makeRecord({
                    id:`CF-PM-ROOT-${kind}-${index}`,
                    actorKey,
                    sourceAxisId:'rootFoundation',
                    sourceRecord:{ id:null },
                    sourceScope:'root-foundation',
                    membershipClass:MEMBERSHIP_CLASSES.DAYMASTER_SIDE,
                    evidenceRole:kind === 'exact' ? 'exact-root-foundation-candidate' : 'same-element-root-foundation-candidate',
                    contributionQualifiers:contributionMap.get(actorKey) || [],
                    boundary:'根基可作为日主侧 membership seed evidence，但根存在不等于根有效，也不等于 active member。'
                }));
            });
        };
        add('exact', root.exactRoot);
        add('same-element', root.sameElementRoot);
        return records;
    };

    const mapAxisCandidates = (profile = {}, axisId, membershipClass, evidenceRole, contributionMap = new Map()) => {
        const axis = profile.axes?.[axisId] || {};
        const sourceRecords = [
            ...(axis.sourceSurfaceCandidates || []),
            ...(axis.hiddenModifierCandidates || [])
        ];
        return sourceRecords.map((sourceRecord, index) => {
            const sourceScope = sourceRecord.scope || (sourceRecord.actorKey?.startsWith('hidden:') ? 'hidden-modifier' : 'source-surface');
            const actorKey = actorKeyOf(sourceRecord, sourceScope);
            const counterAnchorId = membershipClass === MEMBERSHIP_CLASSES.COUNTER_SIDE_ANCHOR
                ? `counter-anchor:${actorKey}`
                : null;
            const boundary = membershipClass === MEMBERSHIP_CLASSES.DAYMASTER_SIDE
                ? '扶助关系只建立日主侧 seed candidate；是否实际得力继续由 contribution／interaction 等上游状态限定。'
                : membershipClass === MEMBERSHIP_CLASSES.COUNTER_SIDE_ANCHOR
                    ? '直接克日主者只建立独立 counter-side anchor candidate；多个克我 actor 不因此自动合成同一党。'
                    : '我生／我克 actor 的党派取决于后续具体 actor-to-actor 关系，不能仅凭对日主的方向自动归入对立侧。';
            return makeRecord({
                id:`CF-PM-${axisId}-${index}`,
                actorKey,
                sourceAxisId:axisId,
                sourceRecord,
                sourceScope,
                membershipClass,
                evidenceRole,
                counterAnchorId,
                contributionQualifiers:contributionMap.get(actorKey) || [],
                boundary
            });
        });
    };

    const buildEvidenceRecords = (profile = {}) => {
        const contributionMap = buildContributionMap(profile);
        return freezeArray([
            ...mapRootFoundation(profile, contributionMap),
            ...mapAxisCandidates(profile, 'alliedSupport', MEMBERSHIP_CLASSES.DAYMASTER_SIDE, 'direct-support-seed-candidate', contributionMap),
            ...mapAxisCandidates(profile, 'incomingRestraint', MEMBERSHIP_CLASSES.COUNTER_SIDE_ANCHOR, 'direct-restraint-counter-anchor', contributionMap),
            ...mapAxisCandidates(profile, 'outboundDrain', MEMBERSHIP_CLASSES.CONTEXT_DEPENDENT, 'drain-context-dependent-affiliation', contributionMap),
            ...mapAxisCandidates(profile, 'outboundDistribution', MEMBERSHIP_CLASSES.CONTEXT_DEPENDENT, 'distribution-context-dependent-affiliation', contributionMap)
        ]);
    };

    const buildActorProfiles = (records = []) => {
        const groups = new Map();
        records.forEach((record) => {
            if (!groups.has(record.actorKey)) groups.set(record.actorKey, []);
            groups.get(record.actorKey).push(record);
        });
        return freezeArray([...groups.entries()].map(([actorKey, actorRecords]) => {
            const classes = unique(actorRecords.map((item) => item.membershipClass));
            const seedClasses = classes.filter((item) => item !== MEMBERSHIP_CLASSES.CONTEXT_DEPENDENT);
            const membershipClass = classes.length === 1
                ? classes[0]
                : seedClasses.length === 1 && classes.includes(MEMBERSHIP_CLASSES.CONTEXT_DEPENDENT)
                    ? 'multi-role-context-dependent'
                    : 'multi-role-unresolved';
            return Object.freeze({
                actorKey,
                membershipClass,
                membershipClasses:freezeArray(classes),
                sourceRecordIds:freezeArray(unique(actorRecords.map((item) => item.sourceRecordId))),
                evidenceRecordIds:freezeArray(actorRecords.map((item) => item.id)),
                evidenceRoles:freezeArray(unique(actorRecords.map((item) => item.evidenceRole))),
                counterAnchorIds:freezeArray(unique(actorRecords.map((item) => item.counterAnchorId))),
                contributionQualifiers:freezeArray(actorRecords.flatMap((item) => item.contributionQualifiers || [])),
                realizedMember:null,
                numericWeight:null,
                boundary:'Actor profile 只合并同一 actor 的 membership evidence identity；多重语义不使用 last-write-wins，也不折成一个力量值。'
            });
        }));
    };

    const buildMembershipInventory = (synthesis = {}) => {
        const profile = synthesis.contextualForceEvidenceProfile || {};
        const records = buildEvidenceRecords(profile);
        const actorProfiles = buildActorProfiles(records);
        const unresolvedActorKeys = actorProfiles
            .filter((item) => item.membershipClass === MEMBERSHIP_CLASSES.UNRESOLVED || item.membershipClass === 'multi-role-unresolved')
            .map((item) => item.actorKey);
        const daymasterSideActorKeys = actorProfiles
            .filter((item) => item.membershipClasses.includes(MEMBERSHIP_CLASSES.DAYMASTER_SIDE))
            .map((item) => item.actorKey);
        const counterAnchorActorKeys = actorProfiles
            .filter((item) => item.membershipClasses.includes(MEMBERSHIP_CLASSES.COUNTER_SIDE_ANCHOR))
            .map((item) => item.actorKey);
        const contextDependentActorKeys = actorProfiles
            .filter((item) => item.membershipClasses.includes(MEMBERSHIP_CLASSES.CONTEXT_DEPENDENT))
            .map((item) => item.actorKey);
        return Object.freeze({
            status:unresolvedActorKeys.length ? 'direct-seed-mapping-partial' : 'direct-seed-mapping-complete',
            resolverScope:CONTRACT.resolverScope,
            evidenceRecords:records,
            actorProfiles,
            daymasterSideActorKeys:freezeArray(daymasterSideActorKeys),
            counterAnchorActorKeys:freezeArray(counterAnchorActorKeys),
            contextDependentActorKeys:freezeArray(contextDependentActorKeys),
            unresolvedActorKeys:freezeArray(unresolvedActorKeys),
            crossActorAffiliationExpansion:null,
            relativeDominance:null,
            partyConfiguration:null,
            activeMemberCount:null,
            numericScore:null,
            boundary:'Inventory 完整只表示每个直接候选都被归入 seed/counter-anchor/context-dependent 类别；不表示 actor 已经实际得力，也不表示 party 已经形成。'
        });
    };

    GuiJia.baziContextualForcePartyMembershipProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        MEMBERSHIP_CLASSES,
        CONTRACT,
        relationOf,
        actorKeyOf,
        buildContributionMap,
        buildEvidenceRecords,
        buildActorProfiles,
        buildMembershipInventory
    });
})(typeof window !== 'undefined' ? window : globalThis);
