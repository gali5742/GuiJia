(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAuditContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartySourceSealObstructionContrastContract;
    if (!prior) return;
    const { freeze,SOURCE_CASE } = prior;
    const VERSION = '0.1',RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-SEAL-DAMAGE-EFFECT-SCOPE-AUDIT-001';
    const STATES = freeze({ RESOLVED:'reviewed-exact-seal-damage-effect-scope-gap',INVALID:'invalid-seal-damage-effect-scope-review',
        UNRESOLVED:'unresolved-seal-damage-effect-scope-audit',NOT_APPLICABLE:'seal-damage-effect-scope-audit-not-applicable' });
    const EFFECT_SCOPE_REVIEW = freeze({ id:'CF-SSDES-REVIEW-01',reviewedOn:'2026-10-12',sourceCaseId:SOURCE_CASE.id,
        chartKey:SOURCE_CASE.chartKey,sourcePathId:'CF-SSOC-PATH-02',identityAuthorityId:'CF-SSOC-IDENTITY-02',
        realizationAuthorityId:'CF-SSOC-REALIZATION-02',sourceClauseSpan:'即日支之丑土，亦被卯木所坏',
        sourceActorKey:'surface-branch:1:卯',targetActorKey:'surface-branch:2:丑',functionType:'source-asserted-branch-seal-damage',
        targetScope:'surface-branch',sourceNamedRecipient:'source-named-seal-bearing-earth-branch',
        expectedRecipientEvidence:{ id:'CF-PM-alliedSupport-2',actorKey:'surface-branch:2:丑',sourceAxisId:'alliedSupport',
            sourceRecordId:'QBR-BRANCH-day',sourceScope:'surface-branch',position:'day',pillarIndex:2,gan:null,zhi:'丑',wuxing:'土',tenGod:null,
            relationToDayMaster:'generation-support',membershipClass:'daymaster-side-seed-candidate',evidenceRole:'direct-support-seed-candidate',
            counterAnchorId:null,realizedMember:null,numericWeight:null },
        hiddenRoleContext:[{ gan:'己',tenGod:'偏印' },{ gan:'癸',tenGod:'食神' },{ gan:'辛',tenGod:'比肩' }],
        oppositionComparisons:[
            { id:'CF-SSDES-COMPARE-01',kind:'legacy-food-god-opposes-killer-motif',authorityId:'CF-PRE-MOTIF-FOOD-GOD-OPPOSES-KILLER-001',
                sourceEvidenceIds:['CF-PAE-E03','CF-PAE-E04'],targetRole:'七杀',functionType:'restraint',
                disposition:'registered-killer-opposition-does-not-authorize-this-whole-seal-bearing-recipient' },
            { id:'CF-SSDES-COMPARE-02',kind:'exact-source-branch-officer-opposition',authorityId:'CF-SBOO-EFFECT-01',
                sourceCaseId:'CF-SBOO-CASE-01',chartKey:'壬午|己酉|甲申|甲子',sourceActorKey:'surface-branch:0:午',targetActorKey:'surface-branch:1:酉',
                targetRole:'正官',functionType:'restraint',outcomeSpan:'去官',
                disposition:'exact-officer-recipient-license-is-not-transferable-to-mao-damages-chou' }
        ],
        reviewedFinding:'The source asserts damage to a named seal-bearing branch. Its actual whole-branch earth support evidence seeds the daymaster side, while the reviewed existing opposition authorities concern killer/officer recipients. This is an independent recipient-relative effect-scope gap: neither damage wording, elemental restraint, candidate side nor whole-branch hidden roles grants an effect type. A candidate is not a realized member, and the absence of a matching reviewed license is not proof of no effect.',
        sourceEvidenceIds:[SOURCE_CASE.id,'CF-SSOC-ANN-02','CF-SSOC-IDENTITY-02','CF-SSOC-REALIZATION-02','CF-SSDES-REVIEW-01',
            'CF-SSDES-COMPARE-01','CF-SSDES-COMPARE-02'],
        effectTypeAuthority:null,newEffectType:null,recipientSideDefinesEffectType:false,wholeBranchPureSeal:false,
        supportLossQuantified:false,allSupportAbsent:false,branchMediationFailureInferred:false,
        genericKernelRecipientGateEstablished:false,existingOppositionUniversallyProhibited:false });
    const CONTRACT = freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-SEAL-DAMAGE-EFFECT-SCOPE-AUDIT-CONTRACT-001',version:VERSION,
        reviewScope:'one-exact-realized-unmapped-branch-damage-recipient-and-two-registered-opposition-scope-comparisons',
        reusedCompleteSourceCaseCount:1,newCompleteSourceCaseCount:0,newEffectAuthorityCount:0,
        actualR27ConsumptionRequired:true,actualMembershipEvidenceAndRebuiltProfileRequired:true,
        independentRecipientRelativeDamageSemanticsRequired:true,newEffectTypeDefined:false,r5FamilyAdded:false,
        recipientClassIsExecutionGate:false,absenceOfLicenseProvesNoEffect:false,membershipMutation:false,numericAggregation:false,finalStrengthMapping:false,
        boundary:'R28 audits R27 month 卯→day whole 丑 damage against actual support-seed evidence, a rebuilt membership profile and the registered legacy killer/R22 officer opposition scopes. It records an unlicensed recipient-relative damage semantics gap and retains realized-unmapped through actual R27/R3/R4. Seed evidence is not active membership, mixed hidden roles do not make a pure seal, and no existing license transfers. No new type, R5 family, global recipient gate, generic no-effect rule, support-loss score, negative mediation, reverse/group/member effect or final strength follows.' });
    GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAuditContract = freeze({ installed:true,VERSION,RULE_ID,STATES,
        SOURCE_CASE,EFFECT_SCOPE_REVIEW,CONTRACT,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
