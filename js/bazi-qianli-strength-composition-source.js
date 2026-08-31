(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQianliStrengthCompositionSource?.installed) return;

    const QIANLI_STRENGTH_COMPOSITION_SOURCE_VERSION = '0.1';

    const sourceTerms = Object.freeze({
        STRONGEST:'最强',
        MEDIUM_STRONG:'中强',
        LESSER_STRONG:'次强',
        WEAKEST:'最弱',
        MEDIUM_WEAK:'中弱',
        LESSER_WEAK:'次弱'
    });

    const SOURCE_BASIS = Object.freeze({
        sourceContractId:'qianli-basic-strength-evidence',
        sourceLocator:'《千里命稿·强弱篇》“身强之构成／身强之区别／身弱之构成／身弱之区别”',
        sourceTerms:Object.freeze([
            '最强：既当令，又多帮扶',
            '中强：多帮扶而失令；或得令而少帮扶',
            '次强：不当令、少帮扶，而年日时支得气',
            '最弱：既失令，又多克泄',
            '中弱：多克泄而当令；或失令而少克泄',
            '次弱：不失令、少克泄，而年日时支无气'
        ]),
        interpretation:'原书给出六类强弱区别，其中中强、中弱各含两条并列构成分支；这些是来源级组合模板，不等于项目已具备可执行的多寡与支气分类器。'
    });

    const SOURCE_COMPOSITION_MODEL = Object.freeze([
        Object.freeze({
            id:'QL-SC-STRONGEST',
            sourceTerm:sourceTerms.STRONGEST,
            sourceFamily:'身强',
            branches:Object.freeze([
                Object.freeze({ id:'QL-SC-STRONGEST-A', requirements:Object.freeze({ seasonal:'当令', supportQuantity:'多帮扶' }) })
            ])
        }),
        Object.freeze({
            id:'QL-SC-MEDIUM-STRONG',
            sourceTerm:sourceTerms.MEDIUM_STRONG,
            sourceFamily:'身强',
            branches:Object.freeze([
                Object.freeze({ id:'QL-SC-MEDIUM-STRONG-A', requirements:Object.freeze({ seasonal:'失令', supportQuantity:'多帮扶' }) }),
                Object.freeze({ id:'QL-SC-MEDIUM-STRONG-B', requirements:Object.freeze({ seasonal:'当令', supportQuantity:'少帮扶' }) })
            ])
        }),
        Object.freeze({
            id:'QL-SC-LESSER-STRONG',
            sourceTerm:sourceTerms.LESSER_STRONG,
            sourceFamily:'身强',
            branches:Object.freeze([
                Object.freeze({ id:'QL-SC-LESSER-STRONG-A', requirements:Object.freeze({ seasonal:'失令', supportQuantity:'少帮扶', branchQi:'年日时支得气' }) })
            ])
        }),
        Object.freeze({
            id:'QL-SC-WEAKEST',
            sourceTerm:sourceTerms.WEAKEST,
            sourceFamily:'身弱',
            branches:Object.freeze([
                Object.freeze({ id:'QL-SC-WEAKEST-A', requirements:Object.freeze({ seasonal:'失令', restraintDrainQuantity:'多克泄' }) })
            ])
        }),
        Object.freeze({
            id:'QL-SC-MEDIUM-WEAK',
            sourceTerm:sourceTerms.MEDIUM_WEAK,
            sourceFamily:'身弱',
            branches:Object.freeze([
                Object.freeze({ id:'QL-SC-MEDIUM-WEAK-A', requirements:Object.freeze({ seasonal:'当令', restraintDrainQuantity:'多克泄' }) }),
                Object.freeze({ id:'QL-SC-MEDIUM-WEAK-B', requirements:Object.freeze({ seasonal:'失令', restraintDrainQuantity:'少克泄' }) })
            ])
        }),
        Object.freeze({
            id:'QL-SC-LESSER-WEAK',
            sourceTerm:sourceTerms.LESSER_WEAK,
            sourceFamily:'身弱',
            branches:Object.freeze([
                Object.freeze({ id:'QL-SC-LESSER-WEAK-A', requirements:Object.freeze({ seasonal:'当令', restraintDrainQuantity:'少克泄', branchQi:'年日时支无气' }) })
            ])
        })
    ]);

    GuiJia.baziQianliStrengthCompositionSource = Object.freeze({
        installed:true,
        QIANLI_STRENGTH_COMPOSITION_SOURCE_VERSION,
        sourceTerms,
        SOURCE_BASIS,
        SOURCE_COMPOSITION_MODEL
    });
})(typeof window !== 'undefined' ? window : globalThis);
