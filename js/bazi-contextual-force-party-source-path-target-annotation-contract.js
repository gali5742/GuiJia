(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePathTargetAnnotationContract?.installed) return;
    const upstream = GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherContract;
    const participant = GuiJia.baziContextualForcePartySourcePathParticipantBindingContract;
    if (!upstream || !participant) return;
    const { freeze } = participant;
    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-TARGET-ANNOTATION-001';
    const STATES = freeze({
        ROLE_ONLY:'source-path-role-target-resolved-instance-identity-unresolved',
        INVALID:'invalid-source-path-target-annotation',
        RUNTIME_UNRESOLVED:'unresolved-source-path-target-identity'
    });
    // These are independently curated target mentions, not a conversion from predicate/effect labels.
    // The partial 己生卯月 example is a conditional rule, not a four-pillar chart case.
    const declarations = [
        { pathId:'CF-CRP-REC-01-P01', linkId:'CF-SPPCM-LINK-01', sourceSpan:'财', targetSpan:'用', antecedentSpan:'七煞', roleEvidenceSpan:'七煞', targetRoleClass:'七杀' },
        { pathId:'CF-CRP-REC-01-P02', linkId:'CF-SPPCM-LINK-01', sourceSpan:'食', targetSpan:'煞', antecedentSpan:null, roleEvidenceSpan:'七煞', targetRoleClass:'七杀' },
        { pathId:'CF-CRP-REC-02-P01', linkId:'CF-SPPCM-LINK-02', sourceSpan:'食', targetSpan:'煞', antecedentSpan:null, roleEvidenceSpan:'煞', targetRoleClass:'七杀' },
        { pathId:'CF-CRP-REC-02-P02', linkId:'CF-SPPCM-LINK-02', sourceSpan:'财', targetSpan:'煞', antecedentSpan:null, roleEvidenceSpan:'煞', targetRoleClass:'七杀' },
        { pathId:'CF-CRP-REC-03-P01', linkId:'CF-SPPCM-LINK-03', sourceSpan:null, targetSpan:'杀', antecedentSpan:null, roleEvidenceSpan:'七杀', targetRoleClass:'七杀' },
        { pathId:'CF-CRP-REC-03-P02', linkId:'CF-SPPCM-LINK-04', sourceSpan:null, targetSpan:'官', antecedentSpan:null, roleEvidenceSpan:'正官', targetRoleClass:'正官' }
    ];
    const ANNOTATIONS = freeze(declarations.map((declaration, index) => {
        const link = upstream.LINK_REGISTRY[declaration.linkId];
        const record = upstream.PATH_SOURCE_REGISTRY[link.pathSourceRecordId];
        const path = record.pathCandidates.find((p) => p.id === declaration.pathId);
        const id = `CF-SPTA-ANN-0${index + 1}`;
        return {
            id, upstreamCaseId:declaration.pathId, annotationState:'curated-audited', annotationDisposition:'relation-target-present',
            sourceId:record.sourceId, sourceText:record.sourceExtract, sourceTier:record.sourceTier,
            sourceContextType:'theory-general', sourcePredicateType:'generalized-relation-rule', chartKey:null,
            sourcePathId:declaration.pathId, pathSourceRecordId:record.id, linkId:link.id,
            conditionId:link.conditionId, relationAssertionId:link.relationAssertionId,
            contextSpans:[{ role:'conditional-rule-context', text:link.context.sourceSpan }],
            contextProvenance:JSON.parse(JSON.stringify(link.context)),
            roleEvidenceSpan:declaration.roleEvidenceSpan,
            relationUnits:[{
                id:`${id}-R01`, relationClauseSpan:path.sourceWording,
                sourceRoleSpan:declaration.sourceSpan || '食神', sourceRoleClass:path.sourceRoleClass,
                sourceRoleAntecedent:declaration.sourceSpan ? null : '阳日食神',
                predicateSpan:path.predicateWording, predicateType:'generalized-relation-rule',
                relationSemanticHint:null,
                target:{ span:declaration.targetSpan, antecedentSpan:declaration.antecedentSpan,
                    mentionMode:declaration.antecedentSpan ? 'anaphoric' : 'explicit', roleClass:declaration.targetRoleClass,
                    chartBindingRequired:false, bindingRequirements:[] },
                intermediateRoleClasses:[...path.intermediateRoleClasses], outcomeSpans:[]
            }],
            sourceEvidenceIds:[record.id, declaration.pathId, link.conditionId, link.positionAssertionId],
            instanceIdentityAuthorized:false, targetScope:null, targetCardinality:null, targetActorKeys:[],
            blockerReasons:['independent-source-target-identity-scope-and-cardinality-required']
        };
    }));
    const CONTRACT = freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-TARGET-ANNOTATION-CONTRACT-001', version:VERSION,
        annotationScope:'six-r11-linked-cf-crp-01-03-path-target-mentions-only',
        targetMentionAndAntecedentProvenanceRequired:true, exactSourceSnapshotRequired:true,
        targetSemanticNormalizationUsesExistingAdapter:true, targetSemanticsUseExistingGenericResolver:true,
        sourceRuleChartKey:null, sourceMentionEqualsRuntimeEndpoint:false,
        sourceRoleResolutionEqualsInstanceIdentity:false, instanceIdentityAuthorityCount:0,
        targetIdentityResolverDefined:false, broaderSourceCoverageComplete:false,
        corpusCoverageComplete:false, competingPathResolverDefined:false,
        executionAuthorized:false, memberEdgeExpansion:false, finalStrengthMapping:false,
        boundary:'R13 annotates six conditional source-rule target mentions and resolves their role semantics through the existing normalized-input/generic target kernel. None authorizes a runtime target actor/group/scope; R12 partial paths remain unresolved and non-executable.'
    });
    GuiJia.baziContextualForcePartySourcePathTargetAnnotationContract = Object.freeze({
        installed:true, VERSION, RULE_ID, STATES, ANNOTATIONS, CONTRACT, freeze
    });
})(typeof window !== 'undefined' ? window : globalThis);
