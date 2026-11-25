(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziSourceStrengthReviewSource?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceRelationPathReviewSource;
    if (!prior) return;
    const { freeze } = prior;
    const sourceUrl = 'https://zh.wikisource.org/zh-hant/滴天髓闡微';
    // These are reviewed natal excerpts. Fortune columns and biographical outcomes are excluded.
    const EXCERPTS = freeze([
        { id: 'SSR-T01', locator: '通神论·九、干支总论·左右贵乎同志，前造',
            text: '此丙火之杀虽旺，壬水之根亦固，日主有比肩之助，辰土之生，谓身杀两停。用壬制杀，天干之同志者；地支之同志者，辰土也，一制一化，可谓有情。' },
        { id: 'SSR-T02', locator: '通神论·九、干支总论·左右贵乎同志，后造及前后造比较',
            text: '此造与前合观，大同小异，况乎日坐禄旺，壬水亦紧制杀，何彼则名利双收，此则终身不发？盖彼则壬水逢申之生地，制杀有权，此则壬水坐午之绝地，敌杀无力；彼则时干比劫帮身，又可生水，此则时上枭神克水，而不能生食。' },
        { id: 'SSR-T03', locator: '通神论·十、形象·庚申辛巳丙辰乙未造',
            text: '此造以俗论之，丙火生于巳月，建禄必要用财，无如庚辛重叠根深，独印受伤，弱可知矣。' },
        { id: 'SSR-T04', locator: '通神论·三十二、众寡·癸丑壬戌丙午庚寅造',
            text: '丙火生于九月，日主本不及时，第坐阳刃会火局，谓之强寡。年干癸进气，癸水通根余气丑土，泄其火局，庚金生助壬癸为众也。势在成乎众。' }
    ]);
    const evidence = (excerptId, span, referent = 'current-chart') => ({ excerptId, span, referent });
    const claim = (id, kind, subjectKeys, contextKeys, value, evidenceRecords) =>
        ({ id, kind, subjectKeys, contextKeys, value, evidence: evidenceRecords });
    const CASES = freeze([
        { id: 'SSR-C01', chartKey: '壬申|丙午|庚午|庚辰', claims: [
            claim('SSR-01-C1', 'direct-contribution', ['visible:3:庚', 'daymaster:2:庚'], [],
                { functionType: 'peer-support', realization: 'realized', force: 'ungraded' },
                [evidence('SSR-T01', '日主有比肩之助'), evidence('SSR-T02', '彼则时干比劫帮身', 'previous-chart')]),
            claim('SSR-01-C2', 'direct-contribution', ['surface-branch:3:辰', 'daymaster:2:庚'], [],
                { functionType: 'generation', realization: 'realized', force: 'ungraded' }, [evidence('SSR-T01', '日主有比肩之助，辰土之生')]),
            claim('SSR-01-M1', 'relation-modifier', ['visible:0:壬', 'visible:1:丙'], ['surface-branch:0:申'],
                { functionType: 'restraint', realization: 'realized', force: 'source-asserted-effective' },
                [evidence('SSR-T01', '用壬制杀'), evidence('SSR-T02', '彼则壬水逢申之生地，制杀有权', 'previous-chart')]),
            claim('SSR-01-M2', 'relation-modifier', ['visible:3:庚', 'visible:0:壬'], [],
                { functionType: 'generation', realization: 'unresolved', availability: 'source-asserted-capable', force: 'ungraded' },
                [evidence('SSR-T02', '彼则时干比劫帮身，又可生水', 'previous-chart')]),
            claim('SSR-01-F1', 'side-force', ['visible:1:丙'], [], { force: 'strong', scope: 'named-killer' }, [evidence('SSR-T01', '此丙火之杀虽旺')]),
            claim('SSR-01-J1', 'comparison', ['daymaster:2:庚', 'visible:1:丙'],
                ['visible:0:壬', 'surface-branch:0:申', 'visible:3:庚', 'surface-branch:3:辰'],
                { relation: 'source-asserted-shen-sha-liang-ting', scope: 'daymaster-and-named-killer' }, [evidence('SSR-T01', '谓身杀两停')])
        ] },
        { id: 'SSR-C02', chartKey: '壬午|丙午|庚申|戊寅', claims: [
            claim('SSR-02-M1', 'relation-modifier', ['visible:0:壬', 'visible:1:丙'], ['surface-branch:0:午'],
                { functionType: 'restraint', realization: 'unresolved', force: 'source-asserted-ineffective' },
                [evidence('SSR-T02', '壬水亦紧制杀'), evidence('SSR-T02', '此则壬水坐午之绝地，敌杀无力')]),
            claim('SSR-02-M2', 'relation-modifier', ['visible:3:戊', 'visible:0:壬'], [],
                { functionType: 'restraint', realization: 'realized', force: 'ungraded' }, [evidence('SSR-T02', '此则时上枭神克水')]),
            claim('SSR-02-M3', 'relation-modifier', ['visible:3:戊', 'visible:0:壬'], [],
                { functionType: 'generation', realization: 'not-realized', force: 'ungraded' }, [evidence('SSR-T02', '此则时上枭神克水，而不能生食')]),
            claim('SSR-02-F1', 'foundation', ['daymaster:2:庚'], ['surface-branch:2:申'],
                { state: 'source-asserted-lu-wang', scope: 'day-seat' }, [evidence('SSR-T02', '日坐禄旺')])
        ] },
        { id: 'SSR-C03', chartKey: '庚申|辛巳|丙辰|乙未', claims: [
            claim('SSR-03-S1', 'season', ['daymaster:2:丙'], ['surface-branch:1:巳'],
                { state: 'source-asserted-jian-lu' }, [evidence('SSR-T03', '丙火生于巳月，建禄')]),
            claim('SSR-03-F1', 'foundation', ['visible:0:庚', 'visible:1:辛'], [],
                { state: 'source-asserted-deep-roots', scope: 'named-wealth-stems', rootEndpoints: 'unspecified' }, [evidence('SSR-T03', '庚辛重叠根深')]),
            claim('SSR-03-O1', 'role-observation', [], [],
                { state: 'source-asserted-seal-damage', sourceEndpoint: null, targetEndpoint: null }, [evidence('SSR-T03', '独印受伤')]),
            claim('SSR-03-J1', 'daymaster-strength', ['daymaster:2:丙'],
                ['visible:0:庚', 'visible:1:辛', 'surface-branch:1:巳'],
                { strength: 'weak', scope: 'exact-source-chart' }, [evidence('SSR-T03', '无如庚辛重叠根深，独印受伤，弱可知矣')])
        ] },
        { id: 'SSR-C04', chartKey: '癸丑|壬戌|丙午|庚寅', claims: [
            claim('SSR-04-S1', 'season', ['daymaster:2:丙'], ['surface-branch:1:戌'],
                { state: 'source-asserted-out-of-season' }, [evidence('SSR-T04', '丙火生于九月，日主本不及时')]),
            claim('SSR-04-F1', 'foundation', ['daymaster:2:丙'], ['surface-branch:1:戌', 'surface-branch:2:午', 'surface-branch:3:寅'],
                { state: 'source-asserted-blade-and-fire-configuration', scope: 'configuration', transformedActor: null }, [evidence('SSR-T04', '第坐阳刃会火局')]),
            claim('SSR-04-Q1', 'quantity', ['daymaster:2:丙'], [],
                { quantity: 'minority', scope: 'source-daymaster-side', memberKeys: null }, [evidence('SSR-T04', '谓之强寡')]),
            claim('SSR-04-J1', 'daymaster-strength', ['daymaster:2:丙'], ['surface-branch:1:戌', 'surface-branch:2:午', 'surface-branch:3:寅'],
                { strength: 'strong', scope: 'exact-source-chart' }, [evidence('SSR-T04', '第坐阳刃会火局，谓之强寡')])
        ] }
    ]);
    const CONTRACT = freeze({
        version: '0.1', retrievedOn: '2026-11-24', sourceUrl,
        scope: 'exact-natal-source-assertions-and-runtime-calibration-gaps',
        realizationAndForceSeparate: true, directContributionsAndModifiersSeparate: true,
        sourceVerdictIsComputedAssessment: false, effectTypeAuthorization: false,
        numericAggregation: false, genericStrengthResolver: false,
        boundary: 'Source assertions retain exact chart, actor, excerpt and local scope. Force qualifiers neither decide binary realization nor create global effectiveness. Authored strength and pair comparison do not fill runtime synthesis dependencies.'
    });
    GuiJia.baziSourceStrengthReviewSource = freeze({ installed: true, EXCERPTS, CASES, CONTRACT, freeze });
})(typeof window !== 'undefined' ? window : globalThis);
