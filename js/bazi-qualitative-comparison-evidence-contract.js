(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQualitativeComparisonEvidenceContract?.installed) return;
    const prior = GuiJia.baziSourceContributionLocalForceContract;
    if (!prior) return;
    const { freeze } = prior;
    const SOURCE = freeze({
        id: 'QCE-DTS-ROOT-CATEGORY-01', title: '《滴天髓阐微》', locator: '通神论·十七、衰旺·任氏论根及甲辰丁卯甲子戊辰造',
        url: 'https://zh.wikisource.org/zh-hant/滴天髓闡微', retrievedOn: '2026-11-27',
        categoryText: '长生禄旺，根之重者也；墓库余气，奶之轻者也。',
        readingNote: 'The retrieved transcription has 奶 in the second clause. It is retained verbatim; the heavy/light root-category reading follows the parallel clauses and the explicit root examples. No damaged enumeration is repaired into a numeric rule.',
        heavyExampleText: '如甲乙逢亥寅卯之类是也',
        lightExampleText: '墓者，如甲乙逢未', remainderExampleText: '甲乙逢辰',
        calibrationChart: '甲辰|丁卯|甲子|戊辰', upstreamCaseId: 'QL-XLR-C02', calibrationText: '甲子日生卯月，地支两辰，是木之余气也'
    });
    // This finite subset uses explicit 甲 examples, not an inferred table of all ten stems.
    const ROOT_PATTERNS = freeze([
        { id: 'QCE-JIA-HAI', anchorGan: '甲', zhi: '亥', category: 'source-heavy-root-category', sourceRole: 'source-listed-growth-foundation' },
        { id: 'QCE-JIA-YIN', anchorGan: '甲', zhi: '寅', category: 'source-heavy-root-category', sourceRole: 'source-listed-growth-foundation' },
        { id: 'QCE-JIA-MAO', anchorGan: '甲', zhi: '卯', category: 'source-heavy-root-category', sourceRole: 'source-listed-growth-foundation' },
        { id: 'QCE-JIA-CHEN', anchorGan: '甲', zhi: '辰', category: 'source-light-root-category', sourceRole: 'source-listed-remainder-foundation' },
        { id: 'QCE-JIA-WEI', anchorGan: '甲', zhi: '未', category: 'source-light-root-category', sourceRole: 'source-listed-vault-foundation' }
    ]);
    const NAMED_CASES = freeze([
        { chartKey: '壬申|丙午|庚午|庚辰', sourceCaseId: 'SSR-C01', daymasterActorKey: 'daymaster:2:庚', counterActorKey: 'visible:1:丙',
            identityClaimId: 'SSR-01-F1', sourceCalibrationClaimId: 'SSR-01-J1' },
        { chartKey: '壬午|丙午|庚申|戊寅', sourceCaseId: 'SSR-C02', daymasterActorKey: 'daymaster:2:庚', counterActorKey: 'visible:1:丙',
            identityClaimId: 'SSR-02-M1', sourceCalibrationClaimId: null }
    ]);
    const CONTRACT = freeze({
        id: 'BAZI-QUALITATIVE-COMPARISON-EVIDENCE-CONTRACT-001', version: '0.1',
        baselineComparisonScope: 'same-daymaster-source-listed-root-categories',
        baselineCategoryIsEffectiveForce: false, sameCategoryMeansEqualForce: false,
        baselineAndActualEffectivenessSeparate: true, rootRoleAndHiddenLevelSeparate: true,
        rootCategoryOrdersPartyContributions: false, numericConversion: false,
        namedComparisonScope: 'daymaster-versus-one-source-named-visible-counter-anchor',
        authoredComparisonIsCalibrationOnly: true, crossAxisRuleDefined: false,
        completeEvidenceAloneDefinesComparisonRule: false, genericDominanceResolver: false, finalStrengthMapping: false,
        boundary: 'An explicit source root-category order may compare verified baseline roots of one anchor. It does not order actual forces, equate roots in the same category, sum support, merge counter anchors, or compute whole-chart strength.'
    });
    GuiJia.baziQualitativeComparisonEvidenceContract = freeze({ installed: true, SOURCE, ROOT_PATTERNS, NAMED_CASES, CONTRACT, freeze });
})(typeof window !== 'undefined' ? window : globalThis);
