(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQianliQuantitySemanticBridgeSource?.installed) return;

    const VERSION = '0.1';

    const BRIDGE_RULES = Object.freeze([
        Object.freeze({
            id:'QL-QBR-01',
            kind:'surface-four-pillar-observation',
            sourceEvidenceIds:Object.freeze(['QL-QTY-S01','QL-QTY-S02','QL-QTY-S03','QL-QTY-W01','QL-QTY-W02','QL-QTY-H01']),
            statement:'《千里命稿》的数量语言在部分定义与命例中观察四柱表层干支，因此项目可以建立“表层四柱观察 inventory”；但该 inventory 只是来源观察面，不等于项目已兑现的作用。',
            boundary:'表层干支出现不得自动升级为 realized Daymaster Contribution，也不得按条目数量直接分类多／少。'
        }),
        Object.freeze({
            id:'QL-QBR-02',
            kind:'branch-axis-context-separation',
            sourceEvidenceIds:Object.freeze(['QL-QTY-S04','QL-QTY-S05','QL-QTY-W04']),
            statement:'原书在不同命例中会把地支分别放入月令、帮扶描述或年日时支得气语境，因此支参与数量观察必须保留所在轴与语境。',
            boundary:'不得预设所有地支恒定计入帮扶，也不得预设所有地支恒定排除；月支季节轴与年日时支气轴必须可区分。'
        }),
        Object.freeze({
            id:'QL-QBR-03',
            kind:'hidden-modifier-layer',
            sourceEvidenceIds:Object.freeze(['QL-QTY-H01','QL-QTY-H02']),
            statement:'人元可改变表层干支力量，因此藏干应进入独立 modifier inventory；其本气／中气／余气层级保留原有定性，不换算数字。',
            boundary:'藏干 modifier 不得与表层干支直接相加，也不得把本气／中气／余气转换成固定权重。'
        }),
        Object.freeze({
            id:'QL-QBR-04',
            kind:'restraint-drain-scope',
            sourceEvidenceIds:Object.freeze(['QL-QTY-W01','QL-QTY-W02']),
            statement:'“多克泄／少克泄”的来源字面只覆盖克我与我生；项目的 distribution／被分继续作为独立轴保存。',
            boundary:'我克形成的 distribution 不得并入 restraint + drain inventory。'
        }),
        Object.freeze({
            id:'QL-QBR-05',
            kind:'source-surface-versus-project-realization',
            sourceEvidenceIds:Object.freeze(['QL-QTY-S01','QL-QTY-W01','QL-QTY-H01']),
            statement:'来源层的数量／力量描述与项目 Function Realization 属不同语义层；Bridge 只建立并列可追溯视图，不建立等价换算。',
            boundary:'realized contribution 可以作为项目作用事实旁证，但其条数不是《千里命稿》多／少的同义替代。'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'QIANLI-QUANTITY-SEMANTIC-BRIDGE-SOURCE-CONTRACT-001',
        version:VERSION,
        sourceSurfaceInventoryRequired:true,
        projectRealizationInventoryRequired:true,
        branchAxisContextRequired:true,
        hiddenModifierInventoryRequired:true,
        surfaceEqualsRealizedContribution:false,
        hiddenModifierNumericConversionDefined:false,
        branchUniversalInclusionRuleDefined:false,
        distributionIncludedInRestraintDrain:false,
        manyFewClassifierDefined:false,
        statement:'Bridge 负责把来源层“表层四柱数量／力量观察”与项目已有 evidence、branch-qi、人元和 realization 分层对接；它不负责产生多／少。'
    });

    GuiJia.baziQianliQuantitySemanticBridgeSource = Object.freeze({
        installed:true,
        VERSION,
        BRIDGE_RULES,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
