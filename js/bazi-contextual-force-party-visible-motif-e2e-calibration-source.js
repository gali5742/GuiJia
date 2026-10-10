(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource?.installed) return;

    const baziCore = GuiJia.baziCore || {};
    const relationEffectContract = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const authorizationSource = GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource || null;
    const realizationSource = GuiJia.baziVisibleStemFunctionRealizationSource || null;
    if (!relationEffectContract || !authorizationSource || !realizationSource || !baziCore.shiShenMap) return;

    const VERSION = '0.3';
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
        sourceUrl:realizationSource.DTS_SOURCE.sourceUrl
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

    const QUALIFIED_POSITIVE_CASES = freezeArray([
        enrichCase(freezeCase({
            id:'CF-VMEC-OPP-CASE-05', motifId:MOTIF_IDS.OPPOSITION,
            gans:['壬','丙','庚','庚'], zhis:['申','午','午','辰'],
            sourceTerm:'用壬制杀，天干之同志者',
            sourceLocator:'通神论 · 干支总论 · 左右贵乎同志',
            sourceProvenance:realizationSource.DTS_SOURCE,
            realizationPatternId:'DTS-VISIBLE-REALIZATION-REN-RESTRAINS-BING-001',
            sourceActorKeys:[actorKey('visible',0,'壬')],
            targetActorKeys:[actorKey('visible',1,'丙')],
            functionType:'restraint',
            sourceExplicitOutcome:true,
            targetSpecificActorResolved:true,
            calibrationEligible:true,
            blockerReasons:[],
            statement:'庚日主，年干壬为食神、月干丙为七杀。原文点名丙火之杀、用壬制杀，并明确天干 scope；唯一壬→丙 visible pair 可校准 opposition。辰土之化另属地支，不转写成该 actor pair 的 mediation。'
        })),
        enrichCase(freezeCase({
            id:'CF-VMEC-MED-CASE-06', motifId:MOTIF_IDS.MEDIATION,
            gans:['癸','甲','丁','丙'], zhis:['酉','子','卯','午'],
            sourceTerm:'此造天干地支皆杀生印，印生身',
            sourceLocator:'通神论 · 通关 · 癸酉 甲子 丁卯 丙午命例',
            sourceProvenance:realizationSource.DTS_SOURCE,
            realizationPatternId:'DTS-VISIBLE-REALIZATION-GUI-GENERATES-JIA-001',
            sourceActorKeys:[actorKey('visible',0,'癸')],
            targetActorKeys:[actorKey('visible',1,'甲')],
            functionType:'generation',
            sourceExplicitOutcome:true,
            targetSpecificActorResolved:true,
            calibrationEligible:true,
            blockerReasons:[],
            statement:'丁日主，天干唯一癸七杀→甲正印。原文明确天干地支皆杀生印，天干 clause 可独立绑定唯一 visible pair；同时保留地支 clause 的独立 scope，不由该句展开 branch/hidden edges 或据此解决 general position/path resolver。'
        }))
    ]);

    const BOUNDARY_CASES = freezeArray([
        enrichCase(freezeCase({
            id:'CF-VMEC-OPP-BOUNDARY-01', motifId:MOTIF_IDS.OPPOSITION,
            gans:['壬','丙','庚','戊'], zhis:['午','午','申','寅'],
            sourceTerm:'壬水亦紧制杀……壬水坐午之绝地，敌杀无力',
            sourceLocator:'通神论 · 干支总论 · 左右贵乎同志 · 比较命例',
            sourceActorKeys:[actorKey('visible',0,'壬')],
            targetActorKeys:[actorKey('visible',1,'丙')],
            functionType:'restraint', sourceExplicitOutcome:false,
            targetSpecificActorResolved:true, calibrationEligible:false,
            blockerReasons:['qualitative-weakness-does-not-resolve-binary-realization'],
            statement:'原文同时称紧制杀与敌杀无力。仅凭无力不能判定该 restraint 完全未发生；不登记 realized 或 not-realized pattern，也不复制相邻正例结论。'
        })),
        enrichCase(freezeCase({
            id:'CF-VMEC-MED-BOUNDARY-01', motifId:MOTIF_IDS.MEDIATION,
            gans:['壬','甲','丙','丙'], zhis:['申','辰','寅','申'],
            sourceTerm:'此坐下印绶……年干壬杀生印有情……此造之壬水，乃甲木之原神',
            sourceLocator:'通神论 · 干支总论 · 地生天者天衰怕冲',
            sourceActorKeys:[actorKey('visible',0,'壬')],
            targetActorKeys:[actorKey('visible',1,'甲'),actorKey('hidden',2,'甲')],
            functionType:'generation', sourceExplicitOutcome:true,
            targetSpecificActorResolved:false, calibrationEligible:false,
            blockerReasons:['visible-and-hidden-same-stem-target-scope-ambiguous'],
            statement:'原文先说坐下印绶，又说甲木之根与原神；月干甲与寅中甲同时存在，未明确把该生印 outcome 限定为 visible target。保留为 scope boundary，不冒充天干单一 pair。'
        }))
    ]);

    const CASES_BY_MOTIF = Object.freeze({
        [MOTIF_IDS.OPPOSITION]:freezeArray([...OPPOSITION_CASES.map(enrichCase), ...QUALIFIED_POSITIVE_CASES.filter((item) => item.motifId === MOTIF_IDS.OPPOSITION)]),
        [MOTIF_IDS.MEDIATION]:freezeArray([...MEDIATION_CASES.map(enrichCase), ...QUALIFIED_POSITIVE_CASES.filter((item) => item.motifId === MOTIF_IDS.MEDIATION)])
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
            caseIds:freezeArray(OPPOSITION_CASES.map((item) => item.id)),
            semanticImpact:'《官杀》“食神制杀格”四个命例都明确存在制杀语义，但每个命例的可见七杀 actor 都不止一个；原文不支持把群体“制杀”拆成某一条或多条 target-specific realized edge。'
        }),
        Object.freeze({
            id:'CF-VMEC-E02', kind:'mediation-case-family-is-mostly-cross-scope-or-source-ambiguous',
            motifId:MOTIF_IDS.MEDIATION,
            caseIds:freezeArray(MEDIATION_CASES.map((item) => item.id)),
            semanticImpact:'“杀重用印格”命例中，明确的化杀路径多落在地支印绶／水局；唯一具备单一 visible 甲杀→visible 丙印形状的命例没有明确叙述该 pair 的 realization，另一个 visible 印例又有两枚丙杀 source。'
        }),
        Object.freeze({
            id:'CF-VMEC-E03', kind:'semantic-motif-authority-does-not-equal-exact-actor-calibration',
            motifIds:freezeArray([MOTIF_IDS.OPPOSITION,MOTIF_IDS.MEDIATION]),
            semanticImpact:'现有文本足以继续授权 opposition / mediation taxonomy，但 exact-source executable calibration 还必须满足 visible source、visible target、唯一 actor identity 与明确 relation outcome；缺任一项都不能补造 realization pattern。'
        }),
        Object.freeze({
            id:'CF-VMEC-E04', kind:'exact-source-visible-opposition-positive-calibration',
            motifId:MOTIF_IDS.OPPOSITION,
            caseIds:freezeArray(QUALIFIED_POSITIVE_CASES.filter((item) => item.motifId === MOTIF_IDS.OPPOSITION).map((item) => item.id)),
            semanticImpact:'《干支总论》壬申 丙午 庚午 庚辰命例有唯一 visible 食神壬→七杀丙，原文明确天干之用壬制杀；只校准该 exact chart，不授权相邻弱制杀比较例或其地支化杀。'
        }),
        Object.freeze({
            id:'CF-VMEC-E05', kind:'exact-source-visible-mediation-positive-calibration',
            motifId:MOTIF_IDS.MEDIATION,
            caseIds:freezeArray(QUALIFIED_POSITIVE_CASES.filter((item) => item.motifId === MOTIF_IDS.MEDIATION).map((item) => item.id)),
            semanticImpact:'《通关》癸酉 甲子 丁卯 丙午命例明确天干杀生印；唯一 visible 癸七杀→甲正印可独立校准 mediation，不把同时描述的地支关系扁平化为 visible edge。'
        })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({ id:'CF-VMEC-F01', key:'opposition-exact-source-visible-e2e-calibration', status:'observed', value:true, evidenceIds:Object.freeze(['CF-VMEC-E04']) }),
        Object.freeze({ id:'CF-VMEC-F02', key:'mediation-exact-source-visible-e2e-calibration', status:'observed', value:true, evidenceIds:Object.freeze(['CF-VMEC-E05']) }),
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
        statement:'《官杀》原有九个命例仍有 actor/scope/outcome blocker；《干支总论》壬→丙与《通关》癸→甲分别校准 raw visible opposition / mediation 两类已登记 motif。这里只证明两类各有一例 exact-source 正向机器校准，不证明来源 corpus 完整或 generic mapping 已定义。'
    });

    GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        MOTIF_IDS,
        SOURCE,
        OPPOSITION_CASES,
        MEDIATION_CASES,
        QUALIFIED_POSITIVE_CASES,
        BOUNDARY_CASES,
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
