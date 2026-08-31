(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQianliQuantityClassificationSource?.installed) return;

    const VERSION = '0.1';

    const SOURCE_LOCATORS = Object.freeze({
        strength:'《千里命稿·强弱篇》',
        renyuan:'《千里命稿·人元篇·人元力量之分析》',
        wuxing:'《千里命稿·五行篇》'
    });

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'QL-QTY-S01', sourceLocator:SOURCE_LOCATORS.strength, side:'support', kind:'definition',
            sourceTerm:'多帮扶', observation:'原书以“甲木日干，四柱多水多木”说明多帮扶，观察对象显然不只限于天干。',
            thresholdEvidence:'none'
        }),
        Object.freeze({
            id:'QL-QTY-S02', sourceLocator:SOURCE_LOCATORS.strength, side:'support', kind:'example', chartKey:'甲寅|丁卯|甲子|甲子',
            sourceTerm:'多帮扶', observation:'最强例以“四木两水帮扶”描述四柱中的扶助成分。',
            thresholdEvidence:'example-only'
        }),
        Object.freeze({
            id:'QL-QTY-S03', sourceLocator:SOURCE_LOCATORS.strength, side:'support', kind:'example', chartKey:'甲寅|癸酉|乙亥|丙子',
            sourceTerm:'多帮扶', observation:'失令中强例以“三水助，木帮扶”说明仍属多帮扶。',
            thresholdEvidence:'example-only'
        }),
        Object.freeze({
            id:'QL-QTY-S04', sourceLocator:SOURCE_LOCATORS.strength, side:'support', kind:'example', chartKey:'甲寅|丙子|壬寅|丙午',
            sourceTerm:'少帮扶', observation:'得令中强例说“全无别位金水帮扶”；月支子已承担月令作用，说明“别位”与月令轴存在语境分层。',
            thresholdEvidence:'none'
        }),
        Object.freeze({
            id:'QL-QTY-S05', sourceLocator:SOURCE_LOCATORS.strength, side:'support', kind:'example', chartKey:'辛亥|丁酉|甲寅|丁卯',
            sourceTerm:'少帮扶', observation:'次强例说“天干又全无水木帮扶”，同时把亥、寅、卯解释为年日时支得气，显示帮扶多寡与支气轴并非简单重复计数。',
            thresholdEvidence:'none'
        }),
        Object.freeze({
            id:'QL-QTY-W01', sourceLocator:SOURCE_LOCATORS.strength, side:'restraint-drain', kind:'definition',
            sourceTerm:'多克泄', observation:'原书以“四柱多金多火”说明甲木日干的多克泄；被分另列于身强喜抑，不属于“克泄”字面。',
            thresholdEvidence:'none'
        }),
        Object.freeze({
            id:'QL-QTY-W02', sourceLocator:SOURCE_LOCATORS.strength, side:'restraint-drain', kind:'example', chartKey:'丙辰|庚寅|甲午|庚午',
            sourceTerm:'多克泄', observation:'当令中弱例明确以“三火之泄、两金之克”说明多克泄。',
            thresholdEvidence:'example-only'
        }),
        Object.freeze({
            id:'QL-QTY-W03', sourceLocator:SOURCE_LOCATORS.strength, side:'restraint-drain', kind:'example-variant', chartKey:'甲寅|丙子|丁卯|乙巳',
            sourceTerm:'少克泄', observation:'扫描/OCR版本作乙巳，并以“不复见水克与土泄”说明少克泄；部分网络转录作己巳，存在字形异文，不能拿该例校准统一阈值。',
            thresholdEvidence:'inadmissible-for-threshold-calibration'
        }),
        Object.freeze({
            id:'QL-QTY-W04', sourceLocator:SOURCE_LOCATORS.strength, side:'support', kind:'example', chartKey:'辛巳|辛丑|壬寅|癸卯',
            sourceTerm:'少克泄', observation:'次弱例另明说“天干又有两金一水之帮扶”，而四支统一进入失气说明；这里再次把天干帮扶与支气分层叙述。',
            thresholdEvidence:'none'
        }),
        Object.freeze({
            id:'QL-QTY-H01', sourceLocator:SOURCE_LOCATORS.renyuan, side:'general-force', kind:'comparison', chartKey:'甲寅|壬申|甲寅|甲子',
            sourceTerm:'一金五木只力难胜', observation:'人元篇会直接比较表层干支数量，同时说明藏干可以增加某一方力量。',
            thresholdEvidence:'relative-example-only'
        }),
        Object.freeze({
            id:'QL-QTY-H02', sourceLocator:SOURCE_LOCATORS.renyuan, side:'hidden-modifier', kind:'hierarchy',
            sourceTerm:'最重／次重／稍轻', observation:'人元力量按月支本气、月支其他人元、年日时支人元分层，但原书没有给出可换算的数字权重。',
            thresholdEvidence:'no-numeric-conversion'
        }),
        Object.freeze({
            id:'QL-QTY-F01', sourceLocator:SOURCE_LOCATORS.wuxing, side:'general-force', kind:'terminology',
            sourceTerm:'当令或繁为强／失令或颓少为弱', observation:'五行篇反复使用“繁、少、多、盛”等相对数量词，但未定义统一数字边界。',
            thresholdEvidence:'none'
        })
    ]);

    const AUDIT_CONCLUSIONS = Object.freeze({
        quantityLanguageIsSourceAttested:true,
        universalNumericThresholdAttested:false,
        directContributionCountEquivalentToSourceQuantity:false,
        surfaceStemBranchCountingAppearsInExamples:true,
        branchParticipationHasContextualAxisOverlap:true,
        hiddenStemsCanModifySurfaceForce:true,
        hiddenStemHierarchyIsQualitativeNotNumeric:true,
        distributionIncludedInRestraintDrain:false,
        sourceVariantBlocksThresholdCalibration:true,
        recommendedNextBridge:'source-quantity-evidence-inventory-before-classification'
    });

    GuiJia.baziQianliQuantityClassificationSource = Object.freeze({
        installed:true,
        VERSION,
        SOURCE_LOCATORS,
        EVIDENCE,
        AUDIT_CONCLUSIONS
    });
})(typeof window !== 'undefined' ? window : globalThis);
