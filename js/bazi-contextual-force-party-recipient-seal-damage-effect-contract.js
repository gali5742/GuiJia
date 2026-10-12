(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRecipientSealDamageEffectContract?.installed) return;
    const VERSION = '0.1',RELATION_TYPE = 'recipient-seal-damage';
    const CONTRACT = Object.freeze({ id:'BAZI-CONTEXTUAL-FORCE-PARTY-RECIPIENT-SEAL-DAMAGE-EFFECT-CONTRACT-001',version:VERSION,
        relationType:RELATION_TYPE,semanticScope:'source-reviewed-directed-damage-to-a-named-whole-seal-bearing-branch',
        recipientScope:'surface-branch',sourceNamedAspect:'seal-bearing-earth-branch',extent:'qualitative-source-asserted-damage-only',
        sourceBackedExactAuthorityRequired:true,sourceIdentityAndRealizationAloneAuthorizeType:false,
        genericDamageWordMapping:false,elementalRestraintMapping:false,recipientCandidateClassMapping:false,
        impliesActiveSupportLoss:false,impliesAllHiddenRolesDamaged:false,impliesActorRemoval:false,impliesGlobalIneffectiveness:false,
        membershipMutation:false,relativeDominanceMapping:false,numericAggregation:false,finalStrengthMapping:false,
        statement:'Recipient seal damage records a source-reviewed qualitative damage effect on the named whole seal-bearing branch, in the original directed pair. It is independent of legacy counter-anchor opposition. Its bounded effect scope must identify the same recipient. It does not measure support loss, damage every hidden role, remove an actor, assign active membership, reverse the edge, deny another path or infer final strength.' });
    GuiJia.baziContextualForcePartyRecipientSealDamageEffectContract = Object.freeze({ installed:true,VERSION,RELATION_TYPE,CONTRACT });
})(typeof window !== 'undefined' ? window : globalThis);
