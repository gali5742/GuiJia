(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceRecipientSealDamageCalibrationContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAuditContract;
    const semantics = GuiJia.baziContextualForcePartyRecipientSealDamageEffectContract;
    if (!prior || !semantics) return;
    const { freeze,SOURCE_CASE } = prior,policy = semantics.CONTRACT;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-RECIPIENT-SEAL-DAMAGE-CALIBRATION-001';
    const STATES = freeze({ RESOLVED:'resolved-exact-source-recipient-seal-damage',INVALID:'invalid-source-recipient-seal-damage-authority',
        UNRESOLVED:'unresolved-source-recipient-seal-damage',NOT_APPLICABLE:'source-recipient-seal-damage-not-applicable' });
    const EFFECT_SCOPE = freeze({ semanticContractId:policy.id,recipientActorKey:'surface-branch:2:丑',
        recipientScope:policy.recipientScope,sourceNamedAspect:policy.sourceNamedAspect,extent:policy.extent });
    const EFFECT_AUTHORITY = freeze({ id:'CF-RSDC-EFFECT-01',reviewedOn:'2026-10-12',sourceCaseId:SOURCE_CASE.id,chartKey:SOURCE_CASE.chartKey,
        sourcePathId:'CF-SSOC-PATH-02',identityAuthorityId:'CF-SSOC-IDENTITY-02',realizationAuthorityId:'CF-SSOC-REALIZATION-02',
        priorEffectScopeReviewId:'CF-SSDES-REVIEW-01',sourceActorKey:'surface-branch:1:卯',targetActorKey:'surface-branch:2:丑',
        functionType:'source-asserted-branch-seal-damage',relationType:semantics.RELATION_TYPE,effectScope:EFFECT_SCOPE,
        outcomeSpan:'即日支之丑土，亦被卯木所坏',
        attributionContextSpan:'又被旺木克土坏印，不但戊土不能生化，即日支之丑土，亦被卯木所坏',
        reviewedEffectInference:true,reviewedBasis:'The full natal commentary independently identifies seal damage and explicitly includes the day 丑 earth branch as damaged by month 卯. With independently verified whole-branch identity, affirmative realization and actual support-seed recipient evidence, this exact source review licenses qualitative recipient-seal-damage on 卯→丑. The whole branch remains the endpoint; the licensed named aspect is seal-bearing earth only, not every hidden role, active support loss, generic ineffectiveness or a failed killer→seal generation path. The type is newly defined and independently authorized here, not borrowed from legacy killer/officer opposition or inferred by the normalizer from 坏/克, membership class or elemental restraint.',
        authorityScope:'exact-natal-mao-to-whole-chou-qualitative-source-named-seal-damage-only',
        oppositionAuthorityInherited:false,allHiddenRolesDamaged:false,targetRemovedFromInventory:false,
        supportLoss:null,activeMembershipEstablished:false,otherPathNonrealizationAuthorized:false,finalStrengthMapping:false });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-RECIPIENT-SEAL-DAMAGE-CALIBRATION-CONTRACT-001',version:VERSION,
        reviewScope:'one-exact-natal-mao-to-whole-chou-source-named-recipient-seal-damage',
        reusedCompleteSourceCaseCount:1,newCompleteSourceCaseCount:0,newEffectAuthorityCount:1,
        actualR28RecipientEvidenceAndR27R3R4Required:true,registeredR5ValidatorRequired:true,actualTypedR4Required:true,
        genericEffectTypeMapping:false,genericDamageMapping:false,recipientSideDefinesType:false,legacyAnchorMotifsExtended:false,
        numericAggregation:false,membershipMutation:false,finalStrengthMapping:false,
        boundary:'R29 independently licenses one qualitative recipient-seal-damage effect on R27 month whole 卯→day whole 丑, after actual R28 recipient-evidence and R27 identity/realization verification. R5 consumes a seventh exact-case family and preserves bounded effect scope; R4 accepts a fourth execution type only with that scope. Legacy three anchor motifs, three endpoint shapes and prior unmapped audit snapshots remain intact. No lexical/element/party mapping, actor removal, all-hidden damage, active support-loss measure, reverse/group/member effect, other-path failure, aggregation or final strength follows.' });
    GuiJia.baziContextualForcePartySourceRecipientSealDamageCalibrationContract = freeze({ installed:true,VERSION,RULE_ID,STATES,
        SOURCE_CASE,EFFECT_SCOPE,EFFECT_AUTHORITY,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
