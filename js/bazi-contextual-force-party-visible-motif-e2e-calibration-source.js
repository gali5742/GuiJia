(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource?.installed) return;

    const baziCore = GuiJia.baziCore || {};
    const relationEffectContract = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const authorizationSource = GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource || null;
    if (!relationEffectContract || !authorizationSource || !baziCore.shiShenMap) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT-001';
    const freezeArray = (items = []) => Object.freeze([...items]);
    const freezeCase = (item = {}) => Object.freeze({
        ...item,
        gans:freezeArray(item.gans || []),
        zhis:freezeArray(item.zhis || []),
        sourceActorKeys:freezeArray(item.sourceActorKeys || []),
        targetActorKeys:freezeArray(item.targetActorKeys || []),
        blockerReasons:freezeArray(item.blockerReasons || [])
    });

    const MOTIF_IDS = Object.freeze({
        OPPOSITION:'CF-PRE-MOTIF-FOOD-GOD-OPPOSES-KILLER-001',
        MEDIATION:'CF-PRE-MOTIF-KILLER-MEDIATES-THROUGH-SEAL-001'
    });

    const SOURCE = Object.freeze({
        id:'CF-VMEC-SRC-DTS-GS',
        title:'《滴天髓阐微》',
        locator:'通神论 · 官杀 · 二曰杀重用印格／三曰食神制杀格',
        sourceRole:'ren-commentary-case-evidence',
        sourceUrl:'https://zh.wikisource.org/zh-hans/滴天髓阐微'
    });

    const actorKey = (kind = 'visible', pillarIndex = 0, gan = '') => `${kind}:${pillarIndex}:${gan}`;
    const chartKey = (gans = [], zhis = []) => gans.map((gan, index) => `${gan}${zhis[index] || ''}`).join('|');
    const tenGodFor = (dayGan = '', gan = '') => baziCore.shiShenMap?.[dayGan]?.[gan] || null;

    const OPPOSITION_CASES = freezeArray([
        freezeCase({
            id:'CF-VMEC-OPP-CASE-01', motifId:MOTIF_IDS.OPPOSITION,
            gans:['戊','戊','壬','甲'], zhis:['辰','午','辰','辰'],
            sourceTerm:'此造四柱皆杀……时透食神制杀。',
            sourceActorKeys:[actorKey('visible',3,'甲')],
            targetActorKeys:[actorKey('visible',0,'戊'), actorKey('visible',1,'戊')],
            functionType:'restraint',
            sourceExplicitOutcome:true,
            targetSpecificActorResolved:false,
            calibrationEligible:false,
            blockerReasons:['multiple-visible-killer-targets','source-does-not-select-one-target-actor'],
            statement:'壬日主下，时干甲为食神，年干与月干戊均为七杀。原文明确“时透食神制杀”，但没有把制杀结果落到两个可见戊中的某一个 target actor。'
        }),
        freezeCase({
            id:'CF-VMEC-OPP-CASE-02', motifId:MOTIF_IDS.OPPOSITION,
            gans:['庚','庚','甲','丙'], zhis:['申','辰','戌','寅'],
            sourceTerm:'庚金并透……更妙丙火独透，制杀扶身。',
            sourceActorKeys:[actorKey('visible',3,'丙')],
            targetActorKeys:[actorKey('visible',0,'庚'), actorKey('visible',1,'庚')],
            functionType:'restraint',
            sourceExplicitOutcome:true,
            targetSpecificActorResolved:false,
            calibrationEligible:false,
            blockerReasons:['multiple-visible-killer-targets','source-does-not-select-one-target-actor'],
            statement:'甲日主下，时干丙为食神，年干与月干庚均为七杀。原文直接说“丙火独透，制杀扶身”，但“庚金并透”形成两个独立可见 target，不能擅自拆成两条 target-specific realized edge。'
        }),
        freezeCase({
            id:'CF-VMEC-OPP-CASE-03', motifId:MOTIF_IDS.OPPOSITION,
            gans:['壬','壬','丙','戊'], zhis:['子','子','戌','戌'],
            sourceTerm:'年月两逢壬子，杀势猖狂……戊土透出，足以砥定汪洋……扶身抑杀。',
            sourceActorKeys:[actorKey('visible',3,'戊')],
            targetActorKeys:[actorKey('visible',0,'壬'), actorKey('visible',1,'壬')],
            functionType:'restraint',
            sourceExplicitOutcome:true,
            targetSpecificActorResolved:false,
            calibrationEligible:false,
            blockerReasons:['multiple-visible-killer-targets','source-does-not-select-one-target-actor'],
            statement:'丙日主下，时干戊为食神，年月两壬均为七杀。原文明确戊土抑杀，但没有提供单一壬 target 的 actor-level 指向。'
        }),
        freezeCase({
            id:'CF-VMEC-OPP-CASE-04', motifId:MOTIF_IDS.OPPOSITION,
            gans:['壬','丙','庚','丙'], zhis:['申','午','午','戌'],
            sourceTerm:'两杀当权临旺……年干壬水临申，足以制杀。',
            sourceActorKeys:[actorKey('visible',0,'壬')],
            targetActorKeys:[actorKey('visible',1,'丙'), actorKey('visible',3,'丙')],
            functionType:'restraint',
            sourceExplicitOutcome:true,
            targetSpecificActorResolved:false,
            calibrationEligible:false,
            blockerReasons:['multiple-visible-killer-targets','source-does-not-select-one-target-actor'],
            statement:'庚日主下，年干壬为食神，月干与时干丙均为七杀。原文明确壬水“足以制杀”，但“ 两杀”没有被分配为独立 target-specific outcome。'
        })
    ]);

    const MEDIATION_CASES = freezeArray([
        freezeCase({
            id:'CF-VMEC-MED-CASE-01', motifId:MOTIF_IDS.MEDIATION,
            gans:['戊','甲','戊','甲'], zhis:['子','寅','午','寅'],
            sourceTerm:'最喜坐下午火，生拱有情，正谓众杀横行，一仁可化。',
            sourceActorKeys:[actorKey('visible',1,'甲'), actorKey('visible',3,'甲')],
            targetActorKeys:[actorKey('surface-branch',2,'午')],
            functionType:'generation',
            sourceExplicitOutcome:true,
            targetSpecificActorResolved:false,
            calibrationEligible:false,
            blockerReasons:['mediator-is-non-visible-branch-scope','multiple-visible-killer-sources'],
            statement:'戊日主下两甲为七杀；承接“生拱／化杀”的核心印绶落在日支午火，属于 branch/hidden scope，不是 raw visible-stem mediation target。'
        }),
        freezeCase({
            id:'CF-VMEC-MED-CASE-02', motifId:MOTIF_IDS.MEDIATION,
            gans:['己','丙','戊','甲'], zhis:['亥','寅','子','寅'],
            sourceTerm:'壬运劫丙坏印……此则财坐日下，反去生杀，助纣为虐。',
            sourceActorKeys:[actorKey('visible',3,'甲')],
            targetActorKeys:[actorKey('visible',1,'丙')],
            functionType:'generation',
            sourceExplicitOutcome:false,
            targetSpecificActorResolved:true,
            calibrationEligible:false,
            blockerReasons:['visible-killer-and-seal-pair-present','source-does-not-explicitly-state-killer-to-visible-seal-realization'],
            statement:'戊日主下时干甲为七杀、月干丙为偏印，visible source/target pair 形式完整；但任氏此处明确叙述的是财生杀及丙印受损，并未明确落笔“甲杀生丙印”已兑现，不能用五行相生补成 realized edge。'
        }),
        freezeCase({
            id:'CF-VMEC-MED-CASE-03', motifId:MOTIF_IDS.MEDIATION,
            gans:['戊','庚','甲','甲'], zhis:['辰','申','子','子'],
            sourceTerm:'喜支全水局，化其肃杀之气，生化有情。',
            sourceActorKeys:[actorKey('visible',1,'庚')],
            targetActorKeys:[actorKey('surface-branch',2,'子'), actorKey('surface-branch',3,'子')],
            functionType:'generation',
            sourceExplicitOutcome:true,
            targetSpecificActorResolved:false,
            calibrationEligible:false,
            blockerReasons:['mediator-is-non-visible-branch-scope','source-describes-branch-water-configuration'],
            statement:'甲日主下月干庚为七杀，但化其肃杀之气的是地支水局；没有 visible-stem 印星 target，可作为 cross-scope evidence，不能校准 raw visible mediation。'
        }),
        freezeCase({
            id:'CF-VMEC-MED-CASE-04', motifId:MOTIF_IDS.MEDIATION,
            gans:['戊','丙','庚','丙'], zhis:['午','辰','寅','戌'],
            sourceTerm:'干透两杀……所喜戊土原神透出，是以化杀。',
            sourceActorKeys:[actorKey('visible',1,'丙'), actorKey('visible',3,'丙')],
            targetActorKeys:[actorKey('visible',0,'戊')],
            functionType:'generation',
            sourceExplicitOutcome:true,
            targetSpecificActorResolved:false,
            calibrationEligible:false,
            blockerReasons:['multiple-visible-killer-sources','source-does-not-select-one-source-actor'],
            statement:'庚日主下年干戊为偏印，月干与时干丙均为七杀；原文明确“戊土原神透出，是以化杀”，但两枚丙杀没有被区分为单一 source actor。'
        }),
        freezeCase({
            id:'CF-VMEC-MED-CASE-05', motifId:MOTIF_IDS.MEDIATION,
            gans:['癸','癸','丁','癸'], zhis:['亥','亥','卯','卯'],
            sourceTerm:'干透三癸……两印拱局，生化不悖，情而纯粹。',
            sourceActorKeys:[actorKey('visible',0,'癸'), actorKey('visible',1,'癸'), actorKey('visible',3,'癸')],
            targetActorKeys:[actorKey('surface-branch',2,'卯'), actorKey('surface-branch',3,'卯')],
            functionType:'generation',
            sourceExplicitOutcome:true,
            targetSpecificActorResolved:false,
            calibrationEligible:false,
            blockerReasons:['mediator-is-non-visible-branch-scope','multiple-visible-killer-sources'],
            statement:'丁日主下三癸皆为七杀，而印星以两卯支承接；这是 branch/hidden mediation 语义，不是 visible-stem source→visible-stem target 的 calibration。'
        })
    ]);

    const enrichCase = (item = {}) => {
        const dayGan = item.gans?.[2] || '';
        const actorRole = (key = '') => {
            const parts = String(key).split(':');
            const gan = parts[2] || '';
            return gan && parts[0] === 'visible' ? tenGodFor(dayGan, gan) : null;
        };
        return Object.freeze({
            ...item,
            chartKey:chartKey(item.gans, item.zhis),
            dayGan,
            sourceActorTenGods:freezeArray((item.sourceActorKeys || []).map(actorRole)),
            targetActorTenGods:freezeArray((item.targetActorKeys || []).map(actorRole))
        });
    };

    const CASES_BY_MOTIF = Object.freeze({
        [MOTIF_IDS.OPPOSITION]:freezeArray(OPPOSITION_CASES.map(enrichCase)),
        [MOTIF_IDS.MEDIATION]:freezeArray(MEDIATION_CASES.map(enrichCase))
    });

    const motifCalibrationStatus = (motifId = '') => {
        const cases = CASES_BY_MOTIF[motifId] || [];
        return cases.some((item) => item.calibrationEligible)
            ? 'exact-source-visible-e2e-calibration-observed'
            : 'unresolved-insufficient-target-specific-visible-provenance';
    };

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'CF-VMEC-E01', kind:'opposition-case-family-is-explicit-but-target-ambiguous',
            motifId:MOTIF_IDS.OPPOSITION,
            caseIds:freezeArray(CASES_BY_MOTIF[MOTIF_IDS.OPPOSITION].map((item) => item.id)),
            semanticImpact:'《官杀》“食神制杀格”四个命例都明确存在制杀语义，但每个命例的可见七杀 actor 都不止一个；原文不支持把群体“制杀”拆成某一条或多条 target-specific realized edge。'
        }),
        Object.freeze({
            id:'CF-VMEC-E02', kind:'mediation-case-family-is-mostly-cross-scope-or-source-ambiguous',
            motifId:MOTIF_IDS.MEDIATION,
            caseIds:freezeArray(CASES_BY_MOTIF[MOTIF_IDS.MEDIATION].map((item) => item.id)),
            semanticImpact:'“杀重用印格”命例中，明确的化杀路径多落在地支印绶／水局；唯一具备单一 visible 甲杀→visible 丙印形状的命例没有明确叙述该 pair 的 realization，另一个 visible 印例又有两枚丙杀 source。'
        }),
        Object.freeze({
            id:'CF-VMEC-E03', kind:'semantic-motif-authority-does-not-equal-exact-actor-calibration',
            motifIds:freezeArray([MOTIF_IDS.OPPOSITION,MOTIF_IDS.MEDIATION]),
            semanticImpact:'现有文本足以继续授权 opposition / mediation taxonomy，但 exact-source executable calibration 还必须满足 visible source、visible target、唯一 actor identity 与明确 relation outcome；缺任一项都不能补造 realization pattern。'
        })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({ id:'CF-VMEC-F01', key:'opposition-exact-source-visible-e2e-calibration', status:'not-observed', value:false, evidenceIds:Object.freeze(['CF-VMEC-E01','CF-VMEC-E03']) }),
        Object.freeze({ id:'CF-VMEC-F02', key:'mediation-exact-source-visible-e2e-calibration', status:'not-observed', value:false, evidenceIds:Object.freeze(['CF-VMEC-E02','CF-VMEC-E03']) }),
        Object.freeze({ id:'CF-VMEC-F03', key:'group-target-language-may-be-split-into-target-specific-edges', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-VMEC-E01','CF-VMEC-E03']) }),
        Object.freeze({ id:'CF-VMEC-F04', key:'cross-scope-mediation-may-calibrate-raw-visible-edge', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-VMEC-E02','CF-VMEC-E03']) }),
        Object.freeze({ id:'CF-VMEC-F05', key:'elemental-generation-may-fill-missing-realization-statement', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-VMEC-E02','CF-VMEC-E03']) })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        targetMotifIds:freezeArray([MOTIF_IDS.OPPOSITION,MOTIF_IDS.MEDIATION]),
        exactChartRequired:true,
        visibleSourceActorRequired:true,
        visibleTargetActorRequired:true,
        uniqueSourceActorRequired:true,
        uniqueTargetActorRequired:true,
        explicitSourceRelationOutcomeRequired:true,
        groupTargetSplitAuthorized:false,
        crossScopeAsRawVisibleCalibration:false,
        elementalShapeFillsMissingOutcome:false,
        oppositionCalibrationStatus:motifCalibrationStatus(MOTIF_IDS.OPPOSITION),
        mediationCalibrationStatus:motifCalibrationStatus(MOTIF_IDS.MEDIATION),
        mutatesVisibleStemRealizationRegistry:false,
        genericVisibleEdgeEffectTypeResolverDefined:false,
        numericAggregation:false,
        numericWeights:false,
        majorityVoting:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        statement:'《滴天髓阐微·官杀》已经提供食神制杀与杀印相生／化杀的完整四柱命例，但现有命例仍不足以生成 raw visible Party motif 的 target-specific exact-source realization calibration：opposition 的制杀对象均为多个可见七杀 actor；mediation 则主要跨到地支印绶，或存在多个可见七杀 source，或缺少对唯一 visible 杀→印 pair 的明确 realization 叙述。'
    });

    GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        MOTIF_IDS,
        SOURCE,
        OPPOSITION_CASES,
        MEDIATION_CASES,
        CASES_BY_MOTIF,
        EVIDENCE,
        FINDINGS,
        CONTRACT,
        chartKey,
        tenGodFor,
        enrichCase,
        motifCalibrationStatus
    });
})(typeof window !== 'undefined' ? window : globalThis);
