(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePathParticipantBindingProfile?.installed) return;
    const api = GuiJia.baziContextualForcePartySourcePathParticipantBindingContract;
    const matcher = GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherProfile;
    const upstream = GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherContract;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource;
    if (!api || !matcher || !upstream || !realization) return;
    const { VERSION, RULE_ID, STATES, DESCRIPTORS, CONTRACT, freeze } = api;
    const copy = (value) => JSON.parse(JSON.stringify(value));
    const same = (a, b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a) && a.length !== b.length) return false;
        const keys = Object.keys(b);
        return Object.keys(a).length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(a, key) && same(a[key], b[key]));
    };
    const validateConditionResult = (supplied, chartKey = null) => {
        if (!supplied || typeof supplied !== 'object' || Array.isArray(supplied)
            || typeof supplied.linkId !== 'string'
            || !Object.prototype.hasOwnProperty.call(upstream.LINK_REGISTRY, supplied.linkId)) {
            return freeze({ valid:false, issues:['registered-condition-result-required'] });
        }
        // The chart comes independently from the semantic model (or explicit API argument).
        // Never adopt a caller's pre-resolved status, actor key, target or path policy.
        const canonical = matcher.evaluateCondition(matcher.inputForLink(supplied.linkId), chartKey);
        if (!canonical.validation.valid || !same(supplied, canonical)) {
            return freeze({ valid:false, issues:['exact-chart-scoped-condition-provenance-required'] });
        }
        return freeze({ valid:true, issues:[] });
    };
    const bindCondition = (supplied, chartKey = null) => {
        const validation = validateConditionResult(supplied, chartKey);
        const base = { chartKey:typeof chartKey === 'string' ? chartKey : null, validation,
            linkId:null, conditionId:null, upstreamStatus:null, pathInstances:[],
            participantBindingComplete:false, relationRealizationResolved:false,
            executionAuthorized:false, runtimeWinnerPathId:null, relationEffects:[], memberEdges:[],
            relativeDominance:null, numericScore:null };
        const result = (status, reasons = [], extra = {}) => freeze({ ...base, status, blockerReasons:reasons, ...extra });
        if (!validation.valid) return result(STATES.INVALID, validation.issues);
        const canonicalInput = matcher.inputForLink(supplied.linkId);
        const canonical = matcher.evaluateCondition(canonicalInput, chartKey);
        base.linkId = canonical.linkId; base.conditionId = canonical.conditionId; base.upstreamStatus = canonical.status;
        if (canonical.status === matcher.STATES.NOT_SATISFIED) return result(STATES.NOT_SATISFIED, ['source-condition-not-satisfied']);
        if (canonical.status === matcher.STATES.NOT_APPLICABLE) return result(STATES.NOT_APPLICABLE, canonical.blockerReasons);
        if (canonical.status !== matcher.STATES.MATCHED) return result(STATES.UNRESOLVED, canonical.blockerReasons);
        const endpoint = (refId) => {
            const binding = canonical.positionParticipantBindings.find((b) => b.refId === refId);
            return binding ? { ...copy(binding), bindingState:'bound-source-mentioned-visible-actor', endpointType:'actor', cardinality:1 } : null;
        };
        const descriptors = DESCRIPTORS.filter((d) => d.linkId === canonical.linkId);
        const instances = [];
        for (const descriptor of descriptors) {
            const path = canonical.linkedPaths.find((p) => p.id === descriptor.sourcePathId);
            const sourceEndpoint = endpoint(descriptor.sourceRefId);
            const intermediateParticipants = descriptor.intermediateRefIds.map(endpoint);
            if (!path || !sourceEndpoint || intermediateParticipants.some((p) => !p)) {
                return result(STATES.UNRESOLVED, ['declared-source-or-intermediate-identity-unresolved']);
            }
            instances.push({
                instanceId:`${chartKey}::${descriptor.linkId}::${descriptor.sourcePathId}`,
                chartKey, ...copy(descriptor), sourcePath:copy(path), sourceEndpoint, intermediateParticipants,
                targetEndpoint:{ refId:descriptor.targetRefId, roleClass:descriptor.targetRoleClass,
                    bindingState:'unresolved-source-target-identity', actorKey:null, scope:null, endpointType:null, cardinality:null },
                provenance:{ upstreamRuleId:upstream.RULE_ID, sourceContext:copy(canonical.sourceContext),
                    sourcePathPolicy:copy(canonical.sourcePathPolicy), positionAssertionId:canonical.positionAssertionId,
                    pathSource:{ sourceContractId:upstream.CONTRACT.pathSourceContractId, sourceRuleId:upstream.CONTRACT.pathSourceRuleId,
                        sourceId:canonicalInput.pathSourceRecord.sourceId, sourceTier:canonicalInput.pathSourceRecord.sourceTier,
                        locator:canonicalInput.pathSourceRecord.locator, sourceExtract:canonicalInput.pathSourceRecord.sourceExtract },
                    positionSource:{ sourceContractId:canonicalInput.normalizedPosition.sourceContractId,
                        sourceRuleId:canonicalInput.normalizedPosition.sourceRuleId, ...copy(canonicalInput.normalizedPosition.provenance) },
                    conditionSatisfied:true, runtimeConditionResolved:true },
                status:STATES.PARTIAL, participantBindingComplete:false, realizationState:'unresolved',
                relationRealizationResolved:false, executable:false, executionAuthorized:false,
                memberEdgeExpansion:false, memberEdges:[], relationEffects:[], runtimeWinnerPathId:null,
                numericScore:null, relativeDominance:null
            });
        }
        return result(STATES.PARTIAL, ['independent-source-target-identity-and-scope-required'], { pathInstances:instances });
    };
    const bindBatch = (results, chartKey = null) => {
        const linkIds = Object.keys(upstream.LINK_REGISTRY);
        const schemaValid = Array.isArray(results) && results.length === linkIds.length
            && results.every((r) => r && typeof r === 'object' && !Array.isArray(r) && typeof r.linkId === 'string')
            && same(results.map((r) => r.linkId).sort(), [...linkIds].sort());
        const validations = schemaValid ? results.map((r) => validateConditionResult(r, chartKey)) : [];
        const valid = schemaValid && validations.every((v) => v.valid);
        // Reject the entire batch on missing, duplicate, extra or tampered provenance. No repair/fallback.
        const bound = valid ? results.map((r) => bindCondition(r, chartKey)) : [];
        return freeze({ validation:{ valid, issues:valid ? [] : ['complete-exact-condition-result-batch-required'] },
            results:bound, pathInstances:bound.flatMap((r) => r.pathInstances) });
    };
    const buildProfile = (semanticModel = {}, synthesis = {}) => {
        const chartKey = realization.buildStructuredChartKey(semanticModel, synthesis) || null;
        const batch = bindBatch(synthesis.contextualForcePartySourcePositionPathConditionMatcher?.results, chartKey);
        const linkIds = Object.keys(upstream.LINK_REGISTRY);
        const schemaCoverageComplete = linkIds.length === 4 && DESCRIPTORS.length === 6
            && linkIds.every((id) => matcher.validateLinkInput(matcher.inputForLink(id)).valid);
        return freeze({
            status:'source-path-participant-binding-evaluated', chartKey, ...batch,
            finiteBindingCoverageComplete:schemaCoverageComplete && batch.validation.valid,
            declaredLinkCount:linkIds.length, declaredPathCount:DESCRIPTORS.length,
            partialPathInstanceCount:batch.pathInstances.length,
            boundSourceParticipantCount:batch.pathInstances.length,
            boundIntermediateParticipantCount:batch.pathInstances.reduce((n, p) => n + p.intermediateParticipants.length, 0),
            completeEndpointPathCount:0, participantBindingComplete:false,
            targetIdentityResolverDefined:false, relationRealizationResolved:false,
            genericPositionResolverDefined:false, competingPathResolverDefined:false, corpusCoverageComplete:false,
            runtimeWinnerPathId:null, executionAuthorized:false, relationEffects:[], memberEdges:[],
            relativeDominance:null, numericScore:null
        });
    };
    GuiJia.baziContextualForcePartySourcePathParticipantBindingProfile = Object.freeze({
        installed:true, VERSION, RULE_ID, STATES, DESCRIPTORS, CONTRACT,
        validateConditionResult, bindCondition, bindBatch, buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
