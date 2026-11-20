(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceHiddenSealTargetReviewContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceBranchSealDamageNonrealizationContract;
    if (!prior) return;
    const { freeze } = prior;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-HIDDEN-SEAL-TARGET-REVIEW-001';
    const STATES = freeze({
        TARGET_RESOLVED: 'resolved-hidden-seal-target-source-unbound',
        INVALID: 'invalid-source-hidden-seal-target-review',
        UNRESOLVED: 'unresolved-source-hidden-seal-target-review',
        NOT_APPLICABLE: 'source-hidden-seal-target-review-not-applicable'
    });
    const SOURCE_CASE = freeze({
        id: 'CF-SHSTR-CASE-01',
        sourceId: 'CF-SHSTR-SRC-DTS',
        sourceTitle: '《滴天髓阐微》',
        sourceUrl: prior.SOURCE_CASE.sourceUrl,
        retrievedOn: '2026-11-21',
        revisionId: null,
        locator: '十七、反局 · 癸亥甲子戊戌癸丑命例',
        chartKey: '癸亥|甲子|戊戌|癸丑',
        gans: ['癸', '甲', '戊', '癸'],
        zhis: ['亥', '子', '戌', '丑'],
        sourceContextType: 'chart-case',
        predicateType: 'relation-event',
        sourceText: '最喜坐下戌之燥土，中藏丁火印绶，财虽旺，不能破印，所谓“玄机暗里存”也。'
    });
    const positionWording = '坐下戌之燥土';
    const antecedent = '中藏丁火印绶';
    const scope = 'hidden-branch';
    const targetRoleClass = '正印';
    const ANNOTATION = freeze({
        id: 'CF-SHSTR-ANN-01',
        upstreamCaseId: SOURCE_CASE.id,
        annotationDisposition: 'relation-target-present',
        contextSpans: [{ role: 'curated-source-target-position', text: positionWording }],
        relationUnits: [{
            id: 'CF-SHSTR-ANN-01-R01',
            relationClauseSpan: '财虽旺，不能破印',
            sourceRoleSpan: '财',
            sourceRoleClass: 'wealth',
            predicateSpan: '不能破',
            predicateType: 'relation-event',
            target: {
                span: '印', mentionMode: 'antecedent-linked', antecedentSpan: antecedent,
                roleClass: targetRoleClass, semanticLevelHint: 'single-actor', chartBindingRequired: true,
                chartBindingEvidence: { scope, explicitCardinality: 1 }
            },
            outcomeSpans: [{ span: '不能破印', kind: 'source-role-level-negative-assertion' }]
        }]
    });
    const TARGET_REVIEW = freeze({
        id: 'CF-SHSTR-TARGET-01',
        sourceCaseId: SOURCE_CASE.id,
        annotationId: ANNOTATION.id,
        targetSemanticLevel: 'single-actor',
        pillar: 'day',
        pillarIndex: 2,
        scope,
        targetRoleClass,
        targetAntecedentSpan: antecedent,
        sourcePositionWording: positionWording,
        sourcePositionCurated: true,
        expectedCardinality: 1,
        stableActorKey: 'hidden:2:戌:丁:2'
    });
    const ASSERTION_REVIEW = freeze({
        id: 'CF-SHSTR-ASSERTION-01',
        evidenceSpan: '财虽旺，不能破印',
        state: 'source-asserted-seal-damage-negation',
        sourceRoleClass: 'wealth',
        sourceIdentityResolved: false,
        sourceActorKey: null,
        sourceGroupId: null,
        scope: 'source-role-to-named-hidden-target',
        basis: '财 describes the source role. The passage names day 戌 and its hidden 丁 as the seal, while leaving the wealth actor and its scope unspecified. Placement and role inventory identify candidates, and the text supplies no criterion for selecting one or defining a group.'
    });
    const CONTRACT = freeze({
        id: 'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-HIDDEN-SEAL-TARGET-REVIEW-CONTRACT-001',
        version: VERSION,
        reviewScope: 'one-natal-hidden-seal-target-with-unbound-wealth-source',
        newCompleteSourceCaseCount: 1,
        newEffectAuthorityCount: 0,
        hiddenSealDamageNegativeCalibrationEstablished: false,
        genericHiddenTargetResolverDefined: false,
        boundary: 'The exact natal passage binds day 戌 hidden 丁 and preserves 财虽旺，不能破印 at its written scope. Concrete source identity and pair-level realization remain unresolved. Candidate records carry no group, member edge, authorization or strength inference.'
    });
    GuiJia.baziContextualForcePartySourceHiddenSealTargetReviewContract = freeze({
        installed: true, VERSION, RULE_ID, STATES, SOURCE_CASE, ANNOTATION, TARGET_REVIEW, ASSERTION_REVIEW, CONTRACT, freeze
    });
})(typeof window !== 'undefined' ? window : globalThis);
