(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQianliQuantityCaseCalibrationSource?.installed) return;

    const VERSION = '0.1';
    const SOURCE_LOCATOR = '《千里命稿·强弱篇／人元篇》';

    const SOURCE_CASES = Object.freeze([
        Object.freeze({
            id:'QL-QCAL-S01',
            chartKeys:Object.freeze(['甲寅|丁卯|甲子|甲子']),
            side:'support',
            sourceQuantityLabel:'多帮扶',
            sourceCompositionTerm:'最强',
            compositionBranchId:'QL-SC-STRONGEST-A',
            sourceEvidenceIds:Object.freeze(['QL-QTY-S02']),
            observationScope:'surface-four-pillar-explicit-plurality',
            sourcePhrase:'四木两水帮扶',
            calibrationStatus:'eligible-exact-source-label',
            genericRuleEvidence:false,
            note:'来源直接以四柱表层木水成分说明多帮扶；只允许复现该命例的来源标签。'
        }),
        Object.freeze({
            id:'QL-QCAL-S02',
            chartKeys:Object.freeze(['甲寅|癸酉|乙亥|丙子']),
            side:'support',
            sourceQuantityLabel:'多帮扶',
            sourceCompositionTerm:'中强',
            compositionBranchId:'QL-SC-MEDIUM-STRONG-A',
            sourceEvidenceIds:Object.freeze(['QL-QTY-S03']),
            observationScope:'surface-four-pillar-support-description',
            sourcePhrase:'三水助，木帮扶',
            calibrationStatus:'eligible-exact-source-label',
            genericRuleEvidence:false,
            note:'来源以多处水木扶助说明失令而多帮扶，但没有给出通用数量边界。'
        }),
        Object.freeze({
            id:'QL-QCAL-S03',
            chartKeys:Object.freeze(['甲寅|丙子|壬寅|丙午']),
            side:'support',
            sourceQuantityLabel:'少帮扶',
            sourceCompositionTerm:'中强',
            compositionBranchId:'QL-SC-MEDIUM-STRONG-B',
            sourceEvidenceIds:Object.freeze(['QL-QTY-S04']),
            observationScope:'month-command-separated-from-other-support-positions',
            sourcePhrase:'全无别位金水帮扶',
            calibrationStatus:'eligible-exact-source-label',
            genericRuleEvidence:false,
            note:'月支子同时承担月令作用，原书用“别位”描述其余位置的帮扶；不能据此建立所有地支的固定计入法。'
        }),
        Object.freeze({
            id:'QL-QCAL-S04',
            chartKeys:Object.freeze(['辛亥|丁酉|甲寅|丁卯']),
            side:'support',
            sourceQuantityLabel:'少帮扶',
            sourceCompositionTerm:'次强',
            compositionBranchId:'QL-SC-LESSER-STRONG-A',
            sourceEvidenceIds:Object.freeze(['QL-QTY-S05']),
            observationScope:'visible-stems-separated-from-year-day-hour-branch-qi',
            sourcePhrase:'天干又全无水木帮扶',
            calibrationStatus:'eligible-exact-source-label',
            genericRuleEvidence:false,
            note:'来源把天干帮扶与年日时支得气分层说明，证明“少帮扶”不是统一表层干支计数的直接别名。'
        }),
        Object.freeze({
            id:'QL-QCAL-W01',
            chartKeys:Object.freeze(['戊申|庚申|甲午|庚午']),
            side:'restraint-drain',
            sourceQuantityLabel:'多克泄',
            sourceCompositionTerm:'最弱',
            compositionBranchId:'QL-SC-WEAKEST-A',
            sourceEvidenceIds:Object.freeze([]),
            observationScope:'source-heading-label-with-text-integrity-caution',
            sourcePhrase:'多克泄',
            calibrationStatus:'label-attested-count-detail-blocked',
            genericRuleEvidence:false,
            note:'该例位于“既失令，又多克泄”分支，但现存转录正文有“丙火之泄”与盘面不一致的问题；只能保留来源标签，不用于计数公式校准。'
        }),
        Object.freeze({
            id:'QL-QCAL-W02',
            chartKeys:Object.freeze(['丙辰|庚寅|甲午|庚午']),
            side:'restraint-drain',
            sourceQuantityLabel:'多克泄',
            sourceCompositionTerm:'中弱',
            compositionBranchId:'QL-SC-MEDIUM-WEAK-A',
            sourceEvidenceIds:Object.freeze(['QL-QTY-W02']),
            observationScope:'surface-four-pillar-restraint-drain-description',
            sourcePhrase:'三火之泄、两金之克',
            calibrationStatus:'eligible-exact-source-label',
            genericRuleEvidence:false,
            note:'来源明确以多处火泄、金克说明当令而多克泄；仍只是命例级标签。'
        }),
        Object.freeze({
            id:'QL-QCAL-W03',
            chartKeys:Object.freeze(['甲寅|丙子|丁卯|乙巳','甲寅|丙子|丁卯|己巳']),
            side:'restraint-drain',
            sourceQuantityLabel:'少克泄',
            sourceCompositionTerm:'中弱',
            compositionBranchId:'QL-SC-MEDIUM-WEAK-B',
            sourceEvidenceIds:Object.freeze(['QL-QTY-W03']),
            observationScope:'source-variant-blocked',
            sourcePhrase:'不复见水克与土泄',
            calibrationStatus:'blocked-source-variant',
            genericRuleEvidence:false,
            note:'现有扫描/OCR与网络转录存在乙巳／己巳异文；该例不得用于任何通用阈值或固定计数口径校准。'
        }),
        Object.freeze({
            id:'QL-QCAL-W04',
            chartKeys:Object.freeze(['辛巳|辛丑|壬寅|癸卯']),
            side:'restraint-drain',
            sourceQuantityLabel:'少克泄',
            sourceCompositionTerm:'次弱',
            compositionBranchId:'QL-SC-LESSER-WEAK-A',
            sourceEvidenceIds:Object.freeze(['QL-QTY-W04']),
            observationScope:'visible-support-plus-branch-qi-separation',
            sourcePhrase:'天干又有两金一水之帮扶；四支失气',
            calibrationStatus:'eligible-exact-source-label',
            genericRuleEvidence:false,
            note:'来源把天干帮扶与四支失气并列说明；少克泄标签来自该次弱分支，不能从单一表层计数公式推出。'
        })
    ]);

    const CALIBRATION_CONSTRAINTS = Object.freeze([
        Object.freeze({
            id:'QL-QCAL-C01',
            kind:'no-universal-numeric-threshold',
            sourceEvidenceIds:Object.freeze(['QL-QTY-S02','QL-QTY-S03','QL-QTY-W02']),
            statement:'多个“多”命例可复现来源标签，但原书没有说明一个跨帮扶／克泄、跨语境通用的数字阈值。'
        }),
        Object.freeze({
            id:'QL-QCAL-C02',
            kind:'no-universal-branch-inclusion-formula',
            sourceEvidenceIds:Object.freeze(['QL-QTY-S04','QL-QTY-S05','QL-QTY-W04']),
            statement:'月令、天干帮扶与年日时支得气会被分层叙述，因此地支不能预设为恒定计入或恒定排除。'
        }),
        Object.freeze({
            id:'QL-QCAL-C03',
            kind:'hidden-stem-can-modify-surface-force',
            chartKeys:Object.freeze(['甲寅|壬申|甲寅|甲子']),
            sourceEvidenceIds:Object.freeze(['QL-QTY-H01','QL-QTY-H02']),
            statement:'人元篇“一金五木只力难胜”的命例随后借支中戊土增加申金力量，证明表层数量并不穷尽力量判断。'
        }),
        Object.freeze({
            id:'QL-QCAL-C04',
            kind:'hidden-stem-hierarchy-qualitative-only',
            sourceEvidenceIds:Object.freeze(['QL-QTY-H02']),
            statement:'月支本气、月支其他人元、年日时支人元只有最重／次重／稍轻的定性层级，没有数字换算。'
        }),
        Object.freeze({
            id:'QL-QCAL-C05',
            kind:'source-integrity-blockers',
            sourceEvidenceIds:Object.freeze(['QL-QTY-W03']),
            statement:'命例异文或正文与盘面不一致时，来源标签可以保存，但该例退出通用公式校准。'
        }),
        Object.freeze({
            id:'QL-QCAL-C06',
            kind:'distribution-remains-separate',
            sourceEvidenceIds:Object.freeze(['QL-QTY-W01','QL-QTY-W02']),
            statement:'“克泄”只对应克我与我生；被分／distribution 继续作为独立轴，不进入 many/few restraint-drain 校准。'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'QIANLI-QUANTITY-SOURCE-CASE-CALIBRATION-CONTRACT-001',
        version:VERSION,
        exactSourceCaseLabelsReproducible:true,
        exactSourceCaseLabelIsProjectClassification:false,
        universalNumericThresholdDefined:false,
        universalRatioRuleDefined:false,
        universalBranchInclusionRuleDefined:false,
        hiddenStemNumericWeightDefined:false,
        sourceIntegrityBlockersPreserved:true,
        genericManyFewRuleDefined:false,
        distributionIncludedInRestraintDrain:false,
        statement:'v0.1 只冻结《千里命稿》明确命例的来源标签与当时实际采用的观察语境；命中原书命例可以复现 source-case label，但不能把该标签推广为任意命盘的项目 many/few classification。'
    });

    GuiJia.baziQianliQuantityCaseCalibrationSource = Object.freeze({
        installed:true,
        VERSION,
        SOURCE_LOCATOR,
        SOURCE_CASES,
        CALIBRATION_CONSTRAINTS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);