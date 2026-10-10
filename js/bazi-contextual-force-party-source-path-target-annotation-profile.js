(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePathTargetAnnotationProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourcePathTargetAnnotationContract;
    const upstream = GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherContract;
    const matcher = GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherProfile;
    const participant = GuiJia.baziContextualForcePartySourcePathParticipantBindingProfile;
    const normalizer = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
    const resolver = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
    if (!api || !upstream || !matcher || !participant || !normalizer || !resolver) return;
    const { VERSION, RULE_ID, STATES, ANNOTATIONS, CONTRACT, freeze } = api;
    const copy = (value) => JSON.parse(JSON.stringify(value));
    const same = (a, b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        const keys = Object.keys(b);
        return Object.keys(a).length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(a, key) && same(a[key], b[key]));
    };
    const inputForPath = (pathId) => {
        const annotation = ANNOTATIONS.find((a) => a.sourcePathId === pathId);
        return annotation ? { annotation, pathSourceRecord:upstream.PATH_SOURCE_REGISTRY[annotation.pathSourceRecordId] } : {};
    };
    const validateAnnotationInput = (input) => {
        const issues = [];
        if (!input || typeof input !== 'object' || Array.isArray(input)
            || !same(Object.keys(input).sort(), ['annotation','pathSourceRecord'])) {
            return freeze({ valid:false, issues:['source-target-annotation-input-schema-required'] });
        }
        const registered = ANNOTATIONS.find((a) => a.id === input.annotation?.id);
        if (!registered || !same(input.annotation, registered)
            || !same(input.pathSourceRecord, upstream.PATH_SOURCE_REGISTRY[registered.pathSourceRecordId])) {
            return freeze({ valid:false, issues:['exact-registered-target-annotation-and-source-required'] });
        }
        const record = input.pathSourceRecord, annotation = registered, unit = annotation.relationUnits[0];
        const link = upstream.LINK_REGISTRY[annotation.linkId];
        const contextRecord = upstream.PATH_SOURCE_REGISTRY[annotation.contextProvenance.sourceRecordId];
        const path = record.pathCandidates.find((p) => p.id === annotation.sourcePathId);
        if (!matcher.validateLinkInput(matcher.inputForLink(link.id)).valid) issues.push('upstream-source-link-invalid');
        if (!path || path.sourceWording !== unit.relationClauseSpan || path.sourceRoleClass !== unit.sourceRoleClass
            || path.targetRoleClass !== unit.target.roleClass || !same(path.intermediateRoleClasses, unit.intermediateRoleClasses)) issues.push('source-path-role-or-compound-provenance-mismatch');
        if (!unit.relationClauseSpan.includes(unit.target.span) || !record.sourceExtract.includes(annotation.roleEvidenceSpan)
            || (unit.target.antecedentSpan && !record.sourceExtract.includes(unit.target.antecedentSpan))) issues.push('target-mention-or-antecedent-source-span-missing');
        if (!(unit.sourceRoleAntecedent ? record.sourceExtract.includes(unit.sourceRoleAntecedent)
            : unit.relationClauseSpan.includes(unit.sourceRoleSpan))) issues.push('source-role-span-or-antecedent-missing');
        if (!contextRecord || contextRecord.sourceId !== record.sourceId || contextRecord.sourceTier !== record.sourceTier
            || !contextRecord.sourceExtract.includes(annotation.contextProvenance.sourceSpan)) issues.push('conditional-rule-context-provenance-missing');
        return freeze({ valid:!issues.length, issues });
    };
    const normalizePath = (input) => {
        const validation = validateAnnotationInput(input);
        if (!validation.valid) return freeze({ normalizationState:'unresolved-normalized-input', validation,
            sourceCaseId:null, annotationId:null, relationUnits:[], blockerReasons:validation.issues });
        const annotation = input.annotation, record = input.pathSourceRecord;
        // Consume the existing normalization adapter, without chart actors or hidden/group bindings.
        const normalized = normalizer.normalizeCase({ id:annotation.sourcePathId, sourceId:record.sourceId,
            sourceText:record.sourceExtract, chartKey:null, sourceContextType:annotation.sourceContextType,
            predicateType:annotation.sourcePredicateType, sourceEvidenceIds:annotation.sourceEvidenceIds }, annotation, [], []);
        return freeze({ ...copy(normalized), sourcePathId:annotation.sourcePathId,
            sourceProvenance:{ sourceId:record.sourceId, sourceTier:record.sourceTier, locator:record.locator,
                sourceExtract:record.sourceExtract, pathSourceRecordId:record.id,
                sourceContractId:upstream.CONTRACT.pathSourceContractId, sourceRuleId:upstream.CONTRACT.pathSourceRuleId,
                context:copy(annotation.contextProvenance), targetRoleEvidenceSpan:annotation.roleEvidenceSpan,
                sourceRoleAntecedent:annotation.relationUnits[0].sourceRoleAntecedent,
                intermediateRoleClasses:[...annotation.relationUnits[0].intermediateRoleClasses] } });
    };
    const resolvePath = (input) => {
        const validation = validateAnnotationInput(input);
        const base = { validation, sourcePathId:null, annotationId:null, normalizedInput:null, targetResolution:null,
            instanceIdentityAuthorized:false, actionableTargetResolved:false, targetActorKeys:[], targetScope:null,
            targetCardinality:null, executionAuthorized:false, relationEffects:[], memberEdges:[], runtimeWinnerPathId:null,
            numericScore:null, relativeDominance:null };
        if (!validation.valid) return freeze({ ...base, status:STATES.INVALID, blockerReasons:validation.issues });
        const normalizedInput = normalizePath(input);
        const targetResolution = resolver.resolveRecord(normalizedInput);
        const validRole = normalizedInput.validation.valid && targetResolution.unitResolutions.length === 1
            && targetResolution.unitResolutions[0].resolutionState === resolver.RESOLUTION_STATES.RESOLVED_ROLE_CLASS;
        return freeze({ ...base, sourcePathId:input.annotation.sourcePathId, annotationId:input.annotation.id,
            normalizedInput, targetResolution, status:validRole ? STATES.ROLE_ONLY : STATES.INVALID,
            blockerReasons:validRole ? ['independent-source-target-identity-scope-and-cardinality-required'] : ['generic-role-target-resolution-failed'] });
    };
    const buildProfile = (semanticModel = {}, synthesis = {}) => {
        const sourceReviews = ANNOTATIONS.map((a) => resolvePath(inputForPath(a.sourcePathId)));
        const canonical = participant.buildProfile(semanticModel, synthesis);
        const supplied = synthesis.contextualForcePartySourcePathParticipantBinding;
        const runtimeValid = canonical.validation.valid && same(supplied, canonical);
        const runtimePaths = runtimeValid ? canonical.pathInstances.map((instance) => {
            const review = sourceReviews.find((r) => r.sourcePathId === instance.sourcePathId);
            return { ...copy(instance), targetSemanticReview:copy(review),
                targetIdentityReview:{ status:STATES.RUNTIME_UNRESOLVED, actorKey:null, groupId:null,
                    scope:null, cardinality:null, memberActorKeys:[], instanceIdentityAuthorized:false,
                    blockerReasons:['independent-source-target-identity-scope-and-cardinality-required'] } };
        }) : [];
        return freeze({
            status:'source-path-target-annotation-evaluated', sourceReviews,
            finiteSourceTargetAnnotationCoverageComplete:sourceReviews.length === 6 && sourceReviews.every((r) => r.status === STATES.ROLE_ONLY),
            sourceRecordCount:3, sourceTargetUnitCount:sourceReviews.length,
            resolvedRoleTargetCount:sourceReviews.filter((r) => r.status === STATES.ROLE_ONLY).length,
            instanceIdentityAuthorityCount:0, targetIdentityResolverDefined:false,
            runtimeValidation:{ valid:runtimeValid, issues:runtimeValid ? [] : ['exact-current-chart-r12-participant-profile-required'] },
            runtimePaths, runtimePartialPathCount:runtimePaths.length, runtimeCompleteTargetCount:0,
            unsupportedSourcePathIds:['CF-CRP-REC-04-P01','CF-CRP-REC-04-P02'],
            actionableTargetResolved:false, relationRealizationResolved:false, executionAuthorized:false,
            broaderSourceCoverageComplete:false, corpusCoverageComplete:false, competingPathResolverDefined:false,
            relationEffects:[], memberEdges:[], runtimeWinnerPathId:null, numericScore:null, relativeDominance:null
        });
    };
    GuiJia.baziContextualForcePartySourcePathTargetAnnotationProfile = Object.freeze({
        installed:true, VERSION, RULE_ID, STATES, CONTRACT, inputForPath,
        validateAnnotationInput, normalizePath, resolvePath, buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
