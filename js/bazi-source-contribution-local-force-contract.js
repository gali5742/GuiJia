(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziSourceContributionLocalForceContract?.installed) return;
    const source = GuiJia.baziSourceStrengthReviewSource;
    if (!source) return;
    const { freeze } = source;
    const AUTHORITIES = freeze([
        {
            id: 'SCLF-BRANCH-SUPPORT-01', kind: 'branch-contribution', sourceCaseId: 'SSR-C01',
            chartKey: '壬申|丙午|庚午|庚辰', claimId: 'SSR-01-C2',
            sourceActorKey: 'surface-branch:3:辰', targetActorKey: 'daymaster:2:庚', functionType: 'generation',
            strengthMeaning: 'support', realization: 'realized',
            profileAuthorityId: 'SCLF-EXACT-BRANCH-SUPPORT-PROFILE-01',
            profileExcerptId: 'SSR-T01', profileSpan: '地支之同志者，辰土也，一制一化，可谓有情',
            profileMeaning: 'source-asserted-whole-chen-supports-daymaster-in-natal-context',
            boundary: 'The author attributes daymaster support to whole 辰. This authority permits this direct support only; the profile wording does not identify an incoming branch mediation pair.'
        },
        {
            id: 'SCLF-LOCAL-FORCE-01', kind: 'local-force', sourceCaseId: 'SSR-C01',
            chartKey: '壬申|丙午|庚午|庚辰', claimId: 'SSR-01-M1',
            sourceActorKey: 'visible:0:壬', targetActorKey: 'visible:1:丙', functionType: 'restraint',
            contextActorKeys: ['surface-branch:0:申'], forceQualifier: 'source-asserted-effective',
            boundary: 'The qualifier belongs to the named restraint function in this exact case, without grading either actor globally.'
        },
        {
            id: 'SCLF-LOCAL-FORCE-02', kind: 'local-force', sourceCaseId: 'SSR-C02',
            chartKey: '壬午|丙午|庚申|戊寅', claimId: 'SSR-02-M1',
            sourceActorKey: 'visible:0:壬', targetActorKey: 'visible:1:丙', functionType: 'restraint',
            contextActorKeys: ['surface-branch:0:午'], forceQualifier: 'source-asserted-ineffective',
            boundary: 'The author states lack of force. Binary realization remains unspecified and this qualifier supplies no not-realized or reverse function.'
        }
    ]);
    const CONTRACT = freeze({
        id: 'BAZI-SOURCE-CONTRIBUTION-LOCAL-FORCE-CONTRACT-001', version: '0.1', retrievedOn: '2026-11-27',
        inputLevel: 'independently-reverified-exact-source-assertions-and-actor-evidence',
        branchScope: 'whole-surface-branch-to-daymaster',
        profileRequiredForPositiveContribution: true, branchProfileAuthority: 'exact-reviewed-natal-source-profile',
        localForceIsRelationScoped: true, realizationAndLocalForceSeparate: true,
        contributionRecordsAreNotIndependentForceUnits: true, visibleContributionsRemainReferences: true,
        branchExpansionToHiddenActors: false, genericBranchContributionResolver: false,
        genericLocalForceResolver: false, effectTypeAuthorization: false,
        numericAggregation: false, relativeDominance: false, finalStrengthMapping: false,
        boundary: 'Whole-branch support and local relation force require their own source authority and verified participants. Neither closes whole-chart strength dependencies or supplies hidden-actor, mediation, numeric or actor-global conclusions.'
    });
    GuiJia.baziSourceContributionLocalForceContract = freeze({ installed: true, AUTHORITIES, CONTRACT, freeze });
})(typeof window !== 'undefined' ? window : globalThis);
