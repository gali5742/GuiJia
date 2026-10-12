(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAuditProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAuditContract;
    const upstream = GuiJia.baziContextualForcePartySourceSealObstructionContrastProfile;
    const membership = GuiJia.baziContextualForcePartyMembershipProfile;
    const motifs = GuiJia.baziContextualForcePartyRelationEffectContract;
    const taxonomy = GuiJia.baziContextualForcePartyAffiliationExpansionSource;
    const registry = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    const opposition = GuiJia.baziContextualForcePartySourceBranchOfficerOppositionContract;
    const chart = GuiJia.baziVisibleStemFunctionRealizationSource,core = GuiJia.baziCore;
    if (!api || !upstream || !membership || !motifs || !taxonomy || !registry || !opposition || !chart || !core) return;
    const { VERSION,RULE_ID,STATES,SOURCE_CASE,EFFECT_SCOPE_REVIEW,CONTRACT,freeze } = api;
    const copy = (v) => JSON.parse(JSON.stringify(v));
    const same = (a,b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every((k) => Object.hasOwn(a,k) && same(a[k],b[k]));
    };
    const inputForCase = (id = SOURCE_CASE.id) => id === SOURCE_CASE.id
        ? { sourceInput:upstream.inputForCase(id),effectScopeReview:EFFECT_SCOPE_REVIEW } : null;
    const validateSourceInput = (input) => {
        if (!same(input,inputForCase())) return freeze({ valid:false,issues:['exact-registered-damage-source-and-effect-scope-review-required'] });
        const sourceValidation = upstream.validateSourceInput(input.sourceInput),issues = [...sourceValidation.issues];
        const r = input.effectScopeReview,p = input.sourceInput.relationReviews.find((p) => p.sourcePathId === r.sourcePathId);
        if (!p || p.sourceEndpoint.actorKey !== r.sourceActorKey || p.targetEndpoint.actorKey !== r.targetActorKey
            || p.identityAuthorityId !== r.identityAuthorityId || p.realizationAuthority.id !== r.realizationAuthorityId
            || p.relationClauseSpan !== r.sourceClauseSpan || p.relationIdentity.functionType !== r.functionType
            || p.realizationAuthority.state !== 'realized-in-source-context' || p.positiveEffectAuthority !== null) issues.push('independent-r27-realized-unmapped-path-required');
        const hiddenRoles = core.cangGanMap['丑'].map(([gan]) => ({ gan,tenGod:core.shiShenMap['辛'][gan] }));
        if (!same(hiddenRoles,r.hiddenRoleContext)) issues.push('mixed-whole-branch-recipient-context-mismatch');
        const [legacy,exact] = r.oppositionComparisons;
        const motif = motifs.MOTIFS.find((m) => m.id === legacy.authorityId);
        const family = registry.SOURCE_FAMILY_REGISTRY[registry.SOURCE_FAMILIES.ACTOR_TO_ACTOR_EXACT_BRANCH_CASE];
        if (!motif || motif.relationType !== taxonomy.RELATION_TYPES.ANCHOR_OPPOSITION || motif.functionType !== legacy.functionType
            || !same(motif.targetTenGods,[legacy.targetRole]) || !same(motif.sourceRegistryEvidenceIds,legacy.sourceEvidenceIds)
            || !legacy.sourceEvidenceIds.every((id) => taxonomy.EVIDENCE.some((e) => e.id === id && e.relationType === motif.relationType))) issues.push('registered-legacy-opposition-scope-mismatch');
        if (!family || family.sourceContractId !== opposition.CONTRACT.id || family.sourceRuleId !== opposition.RULE_ID
            || opposition.EFFECT_AUTHORITY.id !== exact.authorityId || opposition.EFFECT_AUTHORITY.sourceCaseId !== exact.sourceCaseId
            || opposition.EFFECT_AUTHORITY.chartKey !== exact.chartKey || opposition.EFFECT_AUTHORITY.sourceActorKey !== exact.sourceActorKey
            || opposition.EFFECT_AUTHORITY.targetActorKey !== exact.targetActorKey || opposition.EFFECT_AUTHORITY.outcomeSpan !== exact.outcomeSpan
            || opposition.EFFECT_AUTHORITY.relationType !== taxonomy.RELATION_TYPES.ANCHOR_OPPOSITION
            || opposition.IDENTITY_AUTHORITY.targetRoleClass !== exact.targetRole
            || opposition.REALIZATION_AUTHORITY.functionType !== exact.functionType) issues.push('registered-exact-officer-opposition-scope-mismatch');
        return freeze({ valid:!issues.length,issues });
    };
    const validateRecipientInventory = (inventory) => {
        const issues = [],key = EFFECT_SCOPE_REVIEW.targetActorKey;
        if (!inventory || !Array.isArray(inventory.evidenceRecords) || !Array.isArray(inventory.actorProfiles)
            || !Array.isArray(inventory.daymasterSideActorKeys) || !Array.isArray(inventory.counterAnchorActorKeys)
            || [inventory.daymasterSideActorKeys,inventory.counterAnchorActorKeys].some((keys) => Array.from(keys).some((k) => typeof k !== 'string' || !k))) {
            return freeze({ valid:false,issues:['actual-recipient-evidence-profile-and-seed-index-required'],recipient:null });
        }
        const records = inventory.evidenceRecords.filter((e) => e?.actorKey === key),profiles = inventory.actorProfiles.filter((e) => e?.actorKey === key);
        const expected = EFFECT_SCOPE_REVIEW.expectedRecipientEvidence;
        if (records.length !== 1 || profiles.length !== 1 || !Object.keys(expected).every((k) => same(records[0]?.[k],expected[k]))
            || !Array.isArray(records[0]?.contributionQualifiers)) issues.push('exact-whole-branch-support-seed-evidence-required');
        let rebuilt = null;
        if (!issues.length) {
            rebuilt = membership.buildActorProfiles(records)[0];
            if (!same(profiles[0],rebuilt)) issues.push('actual-recipient-profile-disagrees-with-rebuilt-evidence');
        }
        if (inventory.daymasterSideActorKeys.filter((k) => k === key).length !== 1
            || inventory.counterAnchorActorKeys.includes(key)) issues.push('recipient-seed-index-disagrees-with-evidence');
        return freeze({ valid:!issues.length,issues,recipient:issues.length ? null : { actorKey:key,scope:'surface-branch',
            sourceNamedRole:EFFECT_SCOPE_REVIEW.sourceNamedRecipient,evidenceRecords:copy(records),actorProfile:copy(rebuilt),
            hiddenRoleContext:copy(EFFECT_SCOPE_REVIEW.hiddenRoleContext),wholeBranchTenGod:null,
            realizedMember:null,contributionEffectiveness:null,supportLoss:null } });
    };
    const evaluateSource = (input,context = {}) => {
        const sourceValidation = validateSourceInput(input),chartKey = typeof context?.chartKey === 'string' ? context.chartKey : null;
        const base = { sourceValidation,chartKey,upstreamResult:null,path:null,recipient:null,oppositionScopeComparisons:[],effectScopeGap:null,
            effectType:null,effectTypeAuthority:null,executionAuthorized:false,relationEffects:[],memberEdges:[],reverseEffect:null,numericScore:null,relativeDominance:null };
        const result = (status,blockerReasons = [],extra = {}) => freeze({ ...base,status,blockerReasons,...extra });
        if (!sourceValidation.valid) return result(STATES.INVALID,sourceValidation.issues);
        if (!chartKey) return result(STATES.UNRESOLVED,['complete-current-chart-required']);
        if (chartKey !== SOURCE_CASE.chartKey) return result(STATES.NOT_APPLICABLE,['outside-exact-seal-damage-effect-scope-case']);
        // Recompute R27, including normalization/R3/R4. Caller-provided path or execution hints are not consumed.
        const upstreamResult = upstream.evaluateSource(input.sourceInput,context);
        if (upstreamResult.status !== upstream.STATES.RESOLVED) return result(STATES.UNRESOLVED,['actual-r27-consumption-required',...upstreamResult.blockerReasons]);
        const path = upstreamResult.paths.find((p) => p.review.sourcePathId === EFFECT_SCOPE_REVIEW.sourcePathId);
        if (!path || !path.relationRealized || path.execution.executionState !== 'realized-relation-currently-unmapped'
            || path.execution.effectType !== null) return result(STATES.UNRESOLVED,['actual-r27-damage-must-remain-realized-unmapped']);
        const inventoryValidation = validateRecipientInventory(context.inventory);
        if (!inventoryValidation.valid) return result(STATES.UNRESOLVED,inventoryValidation.issues,{ inventoryValidation });
        const oppositionScopeComparisons = EFFECT_SCOPE_REVIEW.oppositionComparisons.map((c) => ({ ...copy(c),
            registeredAuthorityScopeVerified:true,sameSourcePath:false,licenseTransferAuthorized:false }));
        const effectScopeGap = { id:'CF-SSDES-GAP-01',status:'independent-recipient-relative-damage-semantics-unlicensed',
            authorizationKnowledgeScope:'r28-reviewed-legacy-opposition-authorities-only',
            sourcePathId:path.review.sourcePathId,sourceIdentityAuthorityId:path.review.identityAuthorityId,
            sourceRealizationAuthorityId:path.review.realizationAuthority.id,sourceEvidenceIds:[...EFFECT_SCOPE_REVIEW.sourceEvidenceIds],
            currentRelationTypes:[...registry.CONTRACT.allowedRelationTypes],currentSourceFamilyCount:Object.keys(registry.SOURCE_FAMILY_REGISTRY).length,
            newEffectType:null,requiresIndependentRecipientRelativeDamageSemantics:true,absenceProvesNoEffect:false,
            genericRecipientGateEstablished:false,recipientClassDefinesEffectType:false,wholeBranchPureSeal:false,
            allSupportAbsent:false,branchMediationFailureInferred:false,reviewedFinding:EFFECT_SCOPE_REVIEW.reviewedFinding };
        return result(STATES.RESOLVED,['independent-recipient-relative-damage-effect-authority-missing'],
            { upstreamResult,path,inventoryValidation,recipient:inventoryValidation.recipient,oppositionScopeComparisons,effectScopeGap });
    };
    const buildProfile = (semanticModel = {},synthesis = {}) => {
        const result = evaluateSource(inputForCase(),{ chartKey:chart.buildStructuredChartKey(semanticModel,synthesis) || null,
            inventory:synthesis.contextualForcePartyMembershipInventory });
        return freeze({ result,finiteSourceReviewComplete:validateSourceInput(inputForCase()).valid,
            reusedCompleteSourceCaseCount:1,newCompleteSourceCaseCount:0,reviewedOppositionAuthorityScopeCount:2,
            auditedRuntimeRecipientCount:result.status === STATES.RESOLVED ? 1 : 0,
            realizedUnmappedRuntimePathCount:result.path?.execution.executionState === 'realized-relation-currently-unmapped' ? 1 : 0,
            newEffectAuthorityCount:0,positiveEffectCount:0,broaderEffectTypeMappingComplete:false,
            relationEffects:[],memberEdges:[],numericScore:null,relativeDominance:null });
    };
    GuiJia.baziContextualForcePartySourceSealDamageEffectScopeAuditProfile = freeze({ installed:true,VERSION,RULE_ID,STATES,CONTRACT,
        inputForCase,validateSourceInput,evaluateSource,buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
