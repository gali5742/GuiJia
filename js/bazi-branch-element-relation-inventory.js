(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziBranchElementRelationInventory?.installed) return;

    const baziCore = GuiJia.baziCore || {};
    if (typeof baziCore.getWuXing !== 'function') return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-BRANCH-ELEMENT-RELATION-INVENTORY-001';
    const POSITION_INDEX = Object.freeze({ year:0, month:1, day:2, hour:3 });
    const GENERATES = Object.freeze({ 木:'火', 火:'土', 土:'金', 金:'水', 水:'木' });
    const RESTRAINS = Object.freeze({ 木:'土', 土:'水', 水:'火', 火:'金', 金:'木' });
    const RELATION_KINDS = Object.freeze({ GENERATION:'generation', RESTRAINT:'restraint', PEER:'peer' });
    const freezeArray = (items = []) => Object.freeze([...items]);

    const pillarIndexFor = (record = {}, fallbackIndex = null) => {
        if (Number.isInteger(record.pillarIndex)) return record.pillarIndex;
        const position = record.position || (record.positions || [])[0] || null;
        if (position && POSITION_INDEX[position] !== undefined) return POSITION_INDEX[position];
        const match = String(record.actorKey || '').match(/^surface-branch:(\d+):/);
        if (match) return Number(match[1]);
        return Number.isInteger(fallbackIndex) ? fallbackIndex : null;
    };

    const normalizeBranch = (record = {}, index = 0) => {
        const zhi = record.zhi || null;
        const derivedWuxing = zhi ? baziCore.getWuXing(zhi) : '';
        const suppliedWuxing = record.wuxing || null;
        const pillarIndex = pillarIndexFor(record, index);
        const position = record.position || (record.positions || [])[0] || Object.keys(POSITION_INDEX).find((key) => POSITION_INDEX[key] === pillarIndex) || null;
        const actorKey = record.actorKey || (zhi && pillarIndex !== null ? `surface-branch:${pillarIndex}:${zhi}` : null);
        return Object.freeze({
            actorKey,
            zhi,
            wuxing:derivedWuxing || suppliedWuxing || null,
            suppliedWuxing,
            position,
            pillarIndex,
            valid:Boolean(actorKey && zhi && derivedWuxing),
            elementMismatch:Boolean(suppliedWuxing && derivedWuxing && suppliedWuxing !== derivedWuxing)
        });
    };

    const classifyElements = (aElement, bElement) => {
        if (!aElement || !bElement) return null;
        if (aElement === bElement) return Object.freeze({ relationKind:RELATION_KINDS.PEER, fromElement:null, toElement:null, directional:false });
        if (GENERATES[aElement] === bElement) return Object.freeze({ relationKind:RELATION_KINDS.GENERATION, fromElement:aElement, toElement:bElement, directional:true });
        if (GENERATES[bElement] === aElement) return Object.freeze({ relationKind:RELATION_KINDS.GENERATION, fromElement:bElement, toElement:aElement, directional:true });
        if (RESTRAINS[aElement] === bElement) return Object.freeze({ relationKind:RELATION_KINDS.RESTRAINT, fromElement:aElement, toElement:bElement, directional:true });
        if (RESTRAINS[bElement] === aElement) return Object.freeze({ relationKind:RELATION_KINDS.RESTRAINT, fromElement:bElement, toElement:aElement, directional:true });
        return null;
    };

    const buildPairRecord = (a, b, pairIndex = 0) => {
        const classification = classifyElements(a?.wuxing, b?.wuxing);
        if (!a?.valid || !b?.valid || !classification) return null;
        const participants = freezeArray([a, b]);
        const from = classification.directional ? participants.find((item) => item.wuxing === classification.fromElement) || null : null;
        const to = classification.directional ? participants.find((item) => item.wuxing === classification.toElement) || null : null;
        return Object.freeze({
            id:`BERI-${String(pairIndex + 1).padStart(2, '0')}`,
            kind:'ordinary-five-element-branch-relation',
            relationKind:classification.relationKind,
            participants,
            participantActorKeys:freezeArray(participants.map((item) => item.actorKey)),
            participantZhis:freezeArray(participants.map((item) => item.zhi)),
            participantElements:freezeArray(participants.map((item) => item.wuxing)),
            directional:classification.directional,
            direction:classification.directional ? Object.freeze({
                fromActorKey:from?.actorKey || null,
                fromZhi:from?.zhi || null,
                fromElement:from?.wuxing || null,
                toActorKey:to?.actorKey || null,
                toZhi:to?.zhi || null,
                toElement:to?.wuxing || null
            }) : null,
            specialStructureIndependent:true,
            realizedEffect:null,
            effectiveness:null,
            directedCapacity:null,
            qualityMapping:null,
            numericWeight:null,
            boundary:'该记录只确认表层地支所属五行之间的普通生、克或同类关系；不表示该关系已兑现为作用、强弱、党势、质量或吉凶。'
        });
    };

    const buildInventory = (surfaceBranches = []) => {
        const branches = freezeArray((surfaceBranches || []).map((record, index) => normalizeBranch(record, index)));
        const blockerRecords = [];
        branches.forEach((branch, index) => {
            if (!branch.valid) blockerRecords.push(Object.freeze({
                id:`BERI-BLOCKER-BRANCH-${String(index + 1).padStart(2, '0')}`,
                blockerType:'invalid-surface-branch-identity',
                actorKey:branch.actorKey,
                zhi:branch.zhi,
                statement:'无法从 surface branch record 得到稳定 actor identity 与地支五行。'
            }));
            if (branch.elementMismatch) blockerRecords.push(Object.freeze({
                id:`BERI-BLOCKER-ELEMENT-${String(index + 1).padStart(2, '0')}`,
                blockerType:'surface-branch-element-mismatch',
                actorKey:branch.actorKey,
                zhi:branch.zhi,
                suppliedWuxing:branch.suppliedWuxing,
                derivedWuxing:branch.wuxing,
                statement:'上游 surface branch 的五行字段与 baziCore.getWuXing 派生结果不一致。'
            }));
        });
        const duplicateActorKeys = branches.map((item) => item.actorKey).filter(Boolean).filter((key, index, all) => all.indexOf(key) !== index);
        [...new Set(duplicateActorKeys)].forEach((actorKey, index) => blockerRecords.push(Object.freeze({
            id:`BERI-BLOCKER-DUPLICATE-${String(index + 1).padStart(2, '0')}`,
            blockerType:'duplicate-surface-branch-actor-key',
            actorKey,
            statement:'surface branch inventory 中出现重复 actorKey，无法建立稳定 pairwise relation inventory。'
        })));

        const records = [];
        for (let i = 0; i < branches.length; i += 1) {
            for (let j = i + 1; j < branches.length; j += 1) {
                const record = buildPairRecord(branches[i], branches[j], records.length);
                if (record) records.push(record);
            }
        }
        const expectedPairCount = branches.length * (branches.length - 1) / 2;
        const complete = blockerRecords.length === 0 && records.length === expectedPairCount;
        return Object.freeze({
            id:'BAZI-BRANCH-ELEMENT-RELATION-INVENTORY-V01',
            version:VERSION,
            ruleId:RULE_ID,
            status:complete ? 'resolved-neutral-pairwise-inventory' : 'unresolved-incomplete-neutral-pairwise-inventory',
            branches,
            records:freezeArray(records),
            blockerRecords:freezeArray(blockerRecords),
            expectedPairCount,
            actualPairCount:records.length,
            complete,
            specialStructureIndependent:true,
            realizesEffects:false,
            computesCapacity:false,
            computesQuality:false,
            computesStrength:false,
            numericAggregation:false,
            boundary:'普通五行 relation inventory 与刑冲合害破、三合三会等 Structure 并行存在；这里只维护 neutral relation identity。'
        });
    };

    const recordsForActor = (inventory = {}, actorKey = '') => freezeArray(
        (inventory.records || []).filter((record) => (record.participantActorKeys || []).includes(actorKey))
    );

    GuiJia.baziBranchElementRelationInventory = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        GENERATES,
        RESTRAINS,
        RELATION_KINDS,
        pillarIndexFor,
        normalizeBranch,
        classifyElements,
        buildPairRecord,
        buildInventory,
        recordsForActor
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyRelationEffectGeneralizationAudit) {
        document.write('<script src="./js/bazi-contextual-force-party-relation-effect-generalization-audit.js?v=13.44.0"><\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);
